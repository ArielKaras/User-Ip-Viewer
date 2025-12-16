const { Pool } = require('pg');

// Initialize pool if env vars are present
let pool;

if (process.env.DB_HOST) {
    pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    });
    console.log('Database pool initialized');
} else {
    console.warn('Database configuration missing (DB_HOST not set). DB features will be disabled.');
}

module.exports = { pool };
