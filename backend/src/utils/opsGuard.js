const pino = require('pino');
const promClient = require('prom-client');

// 1. Logger Setup
const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
    base: { service: 'user-ip-viewer-backend' },
    redact: ['req.headers.authorization', 'req.headers.cookie']
});

// 2. Metrics Setup
const register = new promClient.Registry();

// Enable default metrics (CPU, Memory, Event Loop)
promClient.collectDefaultMetrics({ register, prefix: 'node_' });

// Define RED Metrics
const httpRequestDurationMicroseconds = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.3, 0.5, 1, 2, 5],
    registers: [register]
});

const httpRequestsTotal = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register]
});

// 3. In-Memory Log Buffer for "Live Stream"
// Circular buffer to hold last 50 logs
const logBuffer = [];
const BUFFER_SIZE = 50;

const addToBuffer = (logEntry) => {
    logBuffer.push(logEntry);
    if (logBuffer.length > BUFFER_SIZE) {
        logBuffer.shift(); // Remove oldest
    }
};

// Hook into Pino's stream to capture logs into our buffer
// (Note: In a real app we might use a custom stream, but for simplicity
// we will just wrap the logger or capture plain objects in middleware)

module.exports = {
    logger,
    register,
    metrics: {
        httpRequestDurationMicroseconds,
        httpRequestsTotal
    },
    logBuffer,
    addToBuffer
};
