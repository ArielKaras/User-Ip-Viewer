const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const app = express();
const port = 3001;

app.use(cors());

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
const { Pool } = require('pg');

// Only init pool if env vars are present (to allow existing prod to work without breaking immediately)
let pool;
if (process.env.DB_HOST) {
    pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    });
}

app.use(express.json()); // Enable JSON body parsing

// Save Visit
app.post('/api/track', async (req, res) => {
    if (!pool) return res.status(503).json({ error: 'Database not configured' });

    const { ip, city, country, latitude, longitude } = req.body;
    try {
        await pool.query(
            'INSERT INTO visits (ip, city, country, latitude, longitude) VALUES ($1, $2, $3, $4, $5)',
            [ip, city, country, latitude, longitude]
        );
        res.status(201).json({ status: 'saved' });
    } catch (err) {
        console.error('Error saving visit:', err);
        res.status(500).json({ error: 'Failed to save visit' });
    }
});

// Get History
app.get('/api/history', async (req, res) => {
    if (!pool) return res.status(503).json({ error: 'Database not configured' });

    try {
        const result = await pool.query('SELECT * FROM visits ORDER BY timestamp DESC LIMIT 10');
        res.json(result.rows);
    } catch (err) {
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