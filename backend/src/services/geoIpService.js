const axios = require('axios');

/**
 * @typedef {Object} LookupOptions
 * @property {boolean} [includeLatLon=false] - Whether to include latitude/longitude (default: false for privacy)
 * @property {number} [timeoutMs=3000] - Request timeout in milliseconds
 */

/**
 * @typedef {Object} GeoResult
 * @property {boolean} ok
 * @property {string} ip
 * @property {string} [country]
 * @property {string} [region]
 * @property {string} [city]
 * @property {number} [lat]
 * @property {number} [lon]
 * @property {string} source
 * @property {string} timestamp
 * @property {Object} [error]
 */

// Private IP ranges (Simplified Regex for common RFC1918 + localhost)
// 127.0.0.1, 10.x.x.x, 172.16-31.x.x, 192.168.x.x, 169.254.x.x, ::1
const PRIVATE_IP_REGEX = /^(127\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|169\.254\.|::1$)/;

/**
 * Look up Geo information for an IP address.
 * @param {string} ip - The IPv4 or IPv6 address
 * @param {LookupOptions} [opts={}] - Options
 * @returns {Promise<GeoResult>}
 */
async function lookupGeo(ip, opts = {}) {
    // Default options
    const { includeLatLon = false, timeoutMs = 3000 } = opts;
    const timestamp = new Date().toISOString();

    // 1. Input Validation
    if (!ip) {
        return {
            ok: false,
            ip: ip || '',
            source: 'ip-api.com',
            timestamp,
            error: { code: 'INVALID_IP', message: 'IP address is required' }
        };
    }

    // Normalized IP check (remove ::ffff:)
    const cleanIp = ip.replace(/^::ffff:/, '');

    // 2. Private/Localhost Check
    if (PRIVATE_IP_REGEX.test(cleanIp) || cleanIp === 'localhost') {
        return {
            ok: false,
            ip: cleanIp,
            source: 'ip-api.com',
            timestamp,
            error: { code: 'PRIVATE_IP', message: 'Geo lookup not available for private/local IPs.' }
        };
    }

    // 3. Provider Call
    // Added: region (code), isp, timezone
    const fields = 'status,message,country,regionName,region,city,lat,lon,isp,timezone,query';

    // Security: Default to HTTPS. Allow override to HTTP (e.g., for Free Tier) via env var.
    const scheme = process.env.GEO_PROVIDER_SCHEME || 'https';

    if (scheme === 'http') {
        process.emitWarning('Security Warning: Geo provider running over HTTP; IP metadata not encrypted in transit.');
        console.warn('⚠️  [Security] Geo provider running over HTTP. Use HTTPS in production.');
    }

    const url = `${scheme}://ip-api.com/json/${cleanIp}?fields=${fields}`;

    try {
        const response = await axios.get(url, { timeout: timeoutMs });
        const data = response.data;

        // 4. Handle Provider Errors (200 OK but status='fail')
        if (data.status === 'fail') {
            let code = 'PROVIDER_FAIL';
            const msg = (data.message || '').toLowerCase();

            if (msg.includes('private')) code = 'PRIVATE_IP';
            else if (msg.includes('rate') || msg.includes('limit') || msg.includes('thrott')) code = 'RATE_LIMITED';

            return {
                ok: false,
                ip: cleanIp,
                source: 'ip-api.com',
                timestamp,
                error: { code, message: data.message || 'Provider failed' }
            };
        }

        // 5. Success - Build Response
        return {
            ok: true,
            ip: data.query || cleanIp,
            country: data.country || null,
            region: data.regionName || null,
            region_code: data.region || null, // The short code (e.g., IL, CA)
            city: data.city || null,
            lat: includeLatLon ? (data.lat || null) : null,
            lon: includeLatLon ? (data.lon || null) : null,
            // Alias for frontend compatibility
            latitude: includeLatLon ? (data.lat || null) : null,
            longitude: includeLatLon ? (data.lon || null) : null,
            // Enhanced Data for Scientific UI
            connection: {
                isp: data.isp || 'Unknown ISP'
            },
            timezone: {
                name: data.timezone,
                current_time: new Date().toLocaleTimeString('en-US', { timeZone: data.timezone || 'UTC' })
            },
            source: 'ip-api.com',
            timestamp
        };

    } catch (err) {
        // 6. Handle Network/Timeout Errors
        const isTimeout = err.code === 'ECONNABORTED' || err.message.includes('timeout');
        return {
            ok: false,
            ip: cleanIp,
            source: 'ip-api.com',
            timestamp,
            error: {
                code: isTimeout ? 'TIMEOUT' : 'PROVIDER_FAIL',
                message: 'Geo lookup service unavailable' // Safe generic message
            }
        };
    }
}

module.exports = { lookupGeo };
