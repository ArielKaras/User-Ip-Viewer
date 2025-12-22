const { pool } = require('../config/db');

/**
 * Record a new visit to the database.
 * @param {Object} data - Visit data { ip, city, country, latitude, longitude }
 * @returns {Promise<void>}
 */
const recordVisit = async (data, clientId) => {
    if (!pool) throw new Error('Database not configured');

    const { ip, city, country, latitude, longitude } = data;

    // 1. Insert (with client_id)
    await pool.query(
        'INSERT INTO visits (ip, city, country, latitude, longitude, client_id) VALUES ($1, $2, $3, $4, $5, $6)',
        [ip, city, country, latitude, longitude, clientId]
    );

    // 2. Retention Policy: Keep only last 50 visits FOR THIS CLIENT
    const cleanupQuery = `
        DELETE FROM visits 
        WHERE client_id = $1 AND id NOT IN (
            SELECT id FROM visits 
            WHERE client_id = $1
            ORDER BY timestamp DESC 
            LIMIT 50
        )
    `;
    await pool.query(cleanupQuery, [clientId]);
};

const getRecentVisits = async (clientId, limit = 10) => {
    if (!pool) throw new Error('Database not configured');

    // Filter by client_id
    const result = await pool.query(
        'SELECT * FROM visits WHERE client_id = $1 ORDER BY timestamp DESC LIMIT $2',
        [clientId, limit]
    );
    return result.rows;
};

const clearHistory = async (clientId) => {
    if (!pool) throw new Error('Database not configured');
    // Only delete this client's history
    await pool.query('DELETE FROM visits WHERE client_id = $1', [clientId]);
    return true;
};

module.exports = {
    recordVisit,
    getRecentVisits,
    clearHistory
};
