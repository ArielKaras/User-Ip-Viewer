const { logger, metrics, addToBuffer } = require('../utils/opsGuard');
const { randomUUID } = require('crypto');

const observabilityMiddleware = (req, res, next) => {
    // 1. Start Timer (High Resolution)
    const start = process.hrtime();

    // 2. Assign Trace ID
    req.traceId = req.headers['x-request-id'] || randomUUID();
    res.setHeader('X-Trace-Id', req.traceId);

    // 3. Child Logger with Context
    req.log = logger.child({
        trace_id: req.traceId,
        method: req.method,
        url: req.url
    });

    // 4. Hook functionality on 'finish' (response sent)
    res.on('finish', () => {
        // Calculate Duration
        const diff = process.hrtime(start);
        const timeInSeconds = (diff[0] * 1e9 + diff[1]) / 1e9;

        // Normalize Route (avoid high cardinality for /api/history/123)
        // Simple heuristic: replace IDs with :id if needed, or just use req.path
        // For now, req.path is fine unless we have many dynamic routes
        const route = req.route ? req.route.path : req.path;

        // Record Metrics
        metrics.httpRequestDurationMicroseconds.observe(
            { method: req.method, route: route, status_code: res.statusCode },
            timeInSeconds
        );

        metrics.httpRequestsTotal.inc({
            method: req.method,
            route: route,
            status_code: res.statusCode
        });

        // Log the event
        const logData = {
            msg: 'request_completed',
            status: res.statusCode,
            duration: timeInSeconds,
            trace_id: req.traceId,
            level: res.statusCode >= 500 ? 'error' : 'info',
            timestamp: new Date().toISOString()
        };

        req.log.info(logData);

        // Add to In-Memory Buffer for Frontend Dashboard
        addToBuffer(logData);
    });

    next();
};

module.exports = observabilityMiddleware;
