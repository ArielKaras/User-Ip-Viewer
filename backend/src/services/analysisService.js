const axios = require('axios');

// --- CONFIGURATION ---
const TIMEOUT_MS = 15000; // 15s limit for everyone
const IP_REGEX = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;

// --- COMMON UTILS ---

/** * Standard sanitization for ALL providers 
 * (We clean data *before* it touches any AI)
 */
function sanitizeLogs(rawLogs) {
    return rawLogs.map(log => {
        if (!log) return null;

        let safeMsg = log.msg || '';
        if (typeof safeMsg === 'string') {
            safeMsg = safeMsg.replace(IP_REGEX, '[REDACTED_IP]');
            if (safeMsg.length > 500) safeMsg = safeMsg.substring(0, 500) + '...';
        }

        let safeRoute = log.route || 'unknown';
        if (safeRoute.includes('?')) safeRoute = safeRoute.split('?')[0];

        return {
            timestamp: log.time || Date.now(),
            level: log.level,
            msg: safeMsg,
            route: safeRoute,
            status: log.status,
            duration_ms: log.duration,
            error_code: log.err?.code
        };
    }).filter(l => l !== null).slice(-50); // Hard limit 50
}

/** * Enforces JSON schema on "Chatty" AIs 
 */
function normalizeResponse(rawResponse, providerName) {
    try {
        // 1. If it's already an object, return it
        if (typeof rawResponse === 'object' && rawResponse.summary) return rawResponse;

        // 2. If it's a string, try to parse it
        let cleanStr = rawResponse;
        if (typeof rawResponse === 'string') {
            // Remove Markdown code fences (common in Gemini/Llama)
            cleanStr = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        }

        const json = JSON.parse(cleanStr);

        // 3. Validate Shape
        if (!json.summary) throw new Error('MISSING_SUMMARY');
        return json;
    } catch (e) {
        console.error(`[${providerName}] JSON Parse Failed:`, e.message);
        throw new Error('AI_RESPONSE_MALFORMED');
    }
}

// --- PROVIDER ADAPTERS ---

const adapters = {
    // 1. GEMINI (Cloud - Fast, Smart)
    gemini: async (cleanLogs) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('CONFIG_MISSING: GEMINI_API_KEY');

        const model = process.env.GEMINI_MODEL || 'gemini-1.5-pro';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{
                parts: [{
                    text: `Analyze these logs and output STRICT JSON.
LOGS: ${JSON.stringify(cleanLogs)}
OUTPUT SCHEMA: {"summary": "string", "suspected_root_cause": "string", "suggested_actions": "string", "confidence": number}`
                }]
            }]
        };

        const res = await axios.post(url, payload, { timeout: TIMEOUT_MS });
        return res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    },

    // 2. OLLAMA (Local - Sovereign, Private)
    ollama: async (cleanLogs) => {
        // Docker internal networking
        const baseUrl = process.env.OLLAMA_URL || 'http://host.docker.internal:11434';
        const model = process.env.OLLAMA_MODEL || 'llama3:8b-instruct';

        const payload = {
            model: model,
            stream: false, // Critical for JSON mode
            format: "json", // Force Llama 3 into JSON mode
            prompt: `You are OpsGuard. Analyze these logs for failures.
LOGS: ${JSON.stringify(cleanLogs)}
Respond with this JSON structure only:
{"summary": "...", "suspected_root_cause": "...", "suggested_actions": "...", "confidence": 0.5}`
        };

        console.log(`[Ollama] Connecting to ${baseUrl} with model ${model}...`);
        const res = await axios.post(`${baseUrl}/api/generate`, payload, { timeout: 60000 }); // Longer timeout for CPU
        return res.data?.response;
    }
};

// --- MAIN PUBLIC INTERFACE ---

async function analyzeLogs(rawLogs) {
    const providerName = process.env.AI_PROVIDER || 'gemini';
    const adapter = adapters[providerName];

    if (!adapter) throw new Error(`INVALID_PROVIDER: ${providerName}`);

    // 1. Sanitize
    const cleanLogs = sanitizeLogs(rawLogs);

    try {
        // 2. Execute Strategy
        const rawOutput = await adapter(cleanLogs);

        // 3. Normalize & Return
        return normalizeResponse(rawOutput, providerName);

    } catch (error) {
        // Map specific axios errors
        if (error.code === 'ECONNREFUSED') throw new Error('PROVIDER_UNREACHABLE');
        if (error.code === 'ECONNABORTED') throw new Error('TIMEOUT');
        throw error; // Re-throw known internal errors
    }
}

module.exports = { analyzeLogs };
