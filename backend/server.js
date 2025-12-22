const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');

const app = express();
const port = 3001;

// --- Ephemeral Access Control ---
// If OPSGUARD_TOKEN is not provided, generate one and lock it in the container.
// This allows local scripts (docker exec) to retrieve it, but prevents external guess access.
let activeOpsGuardToken = process.env.OPSGUARD_TOKEN;
if (!activeOpsGuardToken) {
    try {
        activeOpsGuardToken = randomUUID();
        // Write to root of app directory (WORKDIR is usually /app)
        fs.writeFileSync('.opsguard_token', activeOpsGuardToken, { mode: 0o600 });
        console.log('OpsGuard: Generated ephemeral token (saved to .opsguard_token)');
    } catch (err) {
        console.error('OpsGuard: Failed to generate ephemeral token:', err.message);
    }
}
// --------------------------------

app.set('trust proxy', true); // Enable proxy trust for Nginx X-Forwarded-For
app.use(cors());
const { lookupGeo } = require('./src/services/geoIpService');

// 1. Health Check (Crucial for App Runner)
app.get('/healthz', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// --- OpsGuard Observability ---
const observabilityMiddleware = require('./src/middleware/observability');
const { register, logBuffer } = require('./src/utils/opsGuard');

// Register Global Middleware (Applied to all requests)
app.use(observabilityMiddleware);

// Expose Prometheus Metrics
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (ex) {
        res.status(500).end(ex);
    }
});

// Expose Live Log Stream (In-Memory Buffer)
app.get('/api/logs', (req, res) => {
    // Return logs in reverse order (newest first)
    res.json([...logBuffer].reverse());
});

// --- OPSGUARD AI ENDPOINT ---
const { analyzeLogs } = require('./src/services/analysisService');
let lastAnalysisTime = 0;

app.post('/api/analyze', async (req, res) => {
    // 1. Feature Flag
    if (process.env.AI_ANALYSIS_ENABLED !== 'true') return res.status(404).json({ error: 'Not Found' });

    // 2. Auth (Token)
    const token = req.headers['x-opsguard-token'];
    // Use the active/ephemeral token for validation
    if (!token || token !== activeOpsGuardToken) {
        if (req.log) req.log.warn({ event: 'auth_fail', ip: req.ip }, 'Invalid Analysis Token');
        return res.status(403).json({ error: 'Forbidden' });
    }

    // 3. Rate Limiting (1 request / 10s)
    const now = Date.now();
    if (now - lastAnalysisTime < 10000) {
        res.set('Retry-After', '10');
        return res.status(429).json({ error: 'rate_limited' });
    }
    lastAnalysisTime = now;

    // 4. Execution
    try {
        const snapshot = [...logBuffer]; // Server-Authoritative

        if (req.log) req.log.info({ count: snapshot.length, provider: process.env.AI_PROVIDER || 'gemini' }, 'Starting AI Analysis');

        const result = await analyzeLogs(snapshot);

        res.json({
            ok: true,
            provider: process.env.AI_PROVIDER || 'gemini',
            timestamp: new Date().toISOString(),
            analysis: result
        });

    } catch (err) {
        if (req.log) req.log.error({ err: err.message }, 'Analysis Failed');

        // Internal -> External Error Mapping
        // We hide implementation details (like "Ollama unreachable") from the public API
        const errorType = err.message.split(':')[0];

        let status = 502;
        let clientError = 'ai_upstream_failed';

        switch (errorType) {
            case 'CONFIG_MISSING':
                status = 503;
                clientError = 'ai_not_configured';
                break;
            case 'TIMEOUT':
                status = 504;
                clientError = 'ai_timeout';
                break;
            case 'INVALID_PROVIDER':
                status = 400; // Configuration error
                clientError = 'ai_config_error';
                break;
            case 'PROVIDER_UNREACHABLE':
            case 'AI_RESPONSE_MALFORMED':
            default:
                status = 502;
                clientError = 'ai_upstream_failed';
                break;
        }

        res.status(status).json({ error: clientError });
    }
});
// ------------------------------

// 1.1 DB Health Check
app.get('/api/health/db', async (req, res) => {
    if (!pool) return res.status(503).json({ db: 'not configured' });
    try {
        // Use a timeout to avoid hanging if DB is unresponsive
        await pool.query({
            text: 'SELECT 1',
            timeout: 5000
        });
        res.json({ db: 'ok' });
    } catch (err) {
        console.error('DB Health Check Failed:', err.message);
        res.status(503).json({ db: 'failed', error: 'Database unreachable' }); // Generic error for security
    }
});

// 2. API Routes (Must come BEFORE static files)
// Geo-IP Endpoint
// Geo-IP Endpoint
app.get('/api/geo', async (req, res) => {
    let ip = req.ip;
    const precise = req.query.precise === '1';

    // 2. Dev Fallback: If local/private, try to get public IP to show real location
    let resolutionMode = 'standard';

    // Initial Lookup
    let result = await lookupGeo(ip, { includeLatLon: precise });

    // [OpsGuard] Observability Hook: Log logic failures
    if (!result.ok && req.log) {
        req.log.warn({
            event: 'geo_lookup_fail',
            input_ip: ip,
            error_code: result.error?.code,
            error_msg: result.error?.message
        }, `Geo Lookup Failed: ${result.error?.code || 'Unknown'}`);
    }

    if (!result.ok && result.error?.code === 'PRIVATE_IP') {
        try {
            console.log(`[Dev] Private IP detected (${ip}). Fetching public IP for Geo simulation...`);
            const publicRes = await axios.get('https://api.ipify.org?format=json', { timeout: 2000 });
            if (publicRes.data.ip) {
                ip = publicRes.data.ip;
                // Retry lookup with public IP
                result = await lookupGeo(ip, { includeLatLon: precise });
                resolutionMode = 'dev_public_fallback';
            }
        } catch (err) {
            console.warn('[Dev] Failed to fetch public IP fallback:', err.message);
        }
    }

    // Attach metadata for frontend/audit
    res.json({ ...result, meta: { resolution_mode: resolutionMode } });
});

app.get('/api/ip', async (req, res) => {
    try {
        const response = await axios.get('https://api.ipify.org?format=json', { timeout: 3000 });
        const publicIp = response.data.ip;
        res.json({ ip: publicIp });
    } catch (error) {
        console.error('Error fetching public IP:', error.message);
        res.status(500).json({ ip: 'Error fetching server IP' });
    }
});

// --- Database Logic ---
const { pool } = require('./src/config/db');
const { recordVisit, getRecentVisits, clearHistory } = require('./src/services/historyService');

app.use(express.json()); // Enable JSON body parsing

// Middleware to enforce Client ID for tracking routes
const requireClientId = (req, res, next) => {
    const clientId = req.get('X-Client-Id');
    if (!clientId) {
        return res.status(400).json({ error: 'X-Client-Id header required' });
    }
    req.clientId = clientId;
    next();
};

// Save Visit
app.post('/api/track', requireClientId, async (req, res) => {
    try {
        await recordVisit(req.body, req.clientId);
        res.status(201).json({ status: 'saved' });
    } catch (err) {
        if (err.message === 'Database not configured') {
            return res.status(503).json({ error: 'Database not configured' });
        }
        console.error('Error saving visit:', err);
        res.status(500).json({ error: 'Failed to save visit' });
    }
});

// Get History
app.get('/api/history', requireClientId, async (req, res) => {
    try {
        const visits = await getRecentVisits(req.clientId);
        res.json(visits);
    } catch (err) {
        if (err.message === 'Database not configured') {
            return res.status(503).json({ error: 'Database not configured' });
        }
        console.error('Error fetching history:', err);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Clear History (Privacy Control)
app.delete('/api/history', requireClientId, async (req, res) => {
    try {
        await clearHistory(req.clientId);
        res.status(204).send();
    } catch (err) {
        console.error('Error clearing history:', err);
        res.status(500).json({ error: 'Failed to clear history' });
    }
});

// Gate 2: Artifact Immutability Proof
app.get('/api/version', (req, res) => {
    res.json({
        version: process.env.npm_package_version || '1.0.0',
        commit: process.env.COMMIT_SHA || 'dev-build',
        timestamp: new Date().toISOString(),
        db_status: pool ? 'connected' : 'disabled'
    });
});

// 3. Serve Static Frontend (Vite build output)
// Verify if 'client/dist' exists (it will in the Docker container)
const clientBuildPath = path.join(__dirname, 'client', 'dist');
app.use(express.static(clientBuildPath));

// 4. SPA Fallback (Catch-all)
// Using a regex as before
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Only start the server if this file is run directly
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Backend server running on http://localhost:${port}`);
    });
}

module.exports = app;