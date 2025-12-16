const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const app = express();
const port = 3001;

app.set('trust proxy', true); // Enable proxy trust for Nginx X-Forwarded-For
app.use(cors());
const { lookupGeo } = require('./src/services/geoIpService');

// 1. Health Check (Crucial for App Runner)
app.get('/healthz', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

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

    // 1. Initial Lookup
    let result = await lookupGeo(ip, { includeLatLon: precise });

    // 2. Dev Fallback: If local/private, try to get public IP to show real location
    if (!result.ok && result.error?.code === 'PRIVATE_IP') {
        try {
            console.log(`[Dev] Private IP detected (${ip}). Fetching public IP for Geo simulation...`);
            const publicRes = await axios.get('https://api.ipify.org?format=json', { timeout: 2000 });
            if (publicRes.data.ip) {
                ip = publicRes.data.ip;
                // Retry lookup with public IP
                result = await lookupGeo(ip, { includeLatLon: precise });
            }
        } catch (err) {
            console.warn('[Dev] Failed to fetch public IP fallback:', err.message);
        }
    }

    res.json(result);
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
const { recordVisit, getRecentVisits } = require('./src/services/historyService');

app.use(express.json()); // Enable JSON body parsing

// Save Visit
app.post('/api/track', async (req, res) => {
    try {
        await recordVisit(req.body);
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
app.get('/api/history', async (req, res) => {
    try {
        const visits = await getRecentVisits();
        res.json(visits);
    } catch (err) {
        if (err.message === 'Database not configured') {
            return res.status(503).json({ error: 'Database not configured' });
        }
        console.error('Error fetching history:', err);
        res.status(500).json({ error: 'Failed to fetch history' });
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