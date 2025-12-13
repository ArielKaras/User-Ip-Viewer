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

// 2. API Routes (Must come BEFORE static files)
app.get('/api/ip', async (req, res) => {
    try {
        // Fetch public IP of the SERVER (Hosting Environment)
        // Added timeout for resilience
        const response = await axios.get('https://api.ipify.org?format=json', { timeout: 3000 });
        const publicIp = response.data.ip;
        res.json({ ip: publicIp });
    } catch (error) {
        console.error('Error fetching public IP:', error.message);
        res.status(500).json({ ip: 'Error fetching server IP' });
    }
});

// Gate 2: Artifact Immutability Proof
app.get('/api/version', (req, res) => {
    res.json({
        version: process.env.npm_package_version || '1.0.0',
        commit: process.env.COMMIT_SHA || 'dev-build',
        timestamp: new Date().toISOString()
    });
});

// 3. Serve Static Frontend (Vite build output)
// Verify if 'client/dist' exists (it will in the Docker container)
const clientBuildPath = path.join(__dirname, 'client', 'dist');
app.use(express.static(clientBuildPath));

// 4. SPA Fallback (Catch-all)
// Any request not handled by API or Static files returns index.html
// Note: Express 5 uses path-to-regexp v0.1.7+ logic where '*' must be named or escaped differently.
// Using a regex /.*/ is the simplest way to match "everything".
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