const { Pool } = require('pg');
const fs = require('fs');

// Helper: Read secret from file (Docker Secret) or fallback to plain Env Var
const getSecret = (secretEnv, fileEnv) => {
    if (process.env[fileEnv]) {
        try {
            // Docker secrets typically have a trailing newline, so we .trim()
            return fs.readFileSync(process.env[fileEnv], 'utf8').trim();
        } catch (err) {
            console.error(`Could not read secret file: ${process.env[fileEnv]} `);
            return null;
        }
    }
    return process.env[secretEnv];
};

// Initialize pool if env vars are present
let pool;

if (process.env.DB_HOST) {
    pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: getSecret('DB_PASSWORD', 'DB_PASSWORD_FILE'),
        port: process.env.DB_PORT || 5432,
    });
    console.log('Database pool initialized');
} else {
    console.warn('Database configuration missing (DB_HOST not set). DB features will be disabled.');
}

module.exports = { pool };
