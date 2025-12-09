const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 3001;

app.use(cors());

app.get('/api/ip', async (req, res) => {
    try {
        // Fetch public IP from an external service to ensure we get the real public IPv4
        const response = await axios.get('https://api.ipify.org?format=json');
        const publicIp = response.data.ip;
        res.json({ ip: publicIp });
    } catch (error) {
        console.error('Error fetching public IP:', error.message);
        // Fallback if external service fails (though user specifically wants public IP)
        res.status(500).json({ ip: 'Error fetching public IP' });
    }
});

app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
});