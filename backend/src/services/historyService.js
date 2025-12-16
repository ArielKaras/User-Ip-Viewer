const { pool } = require('../config/db');

/**
 * Record a new visit to the database.
 * @param {Object} data - Visit data { ip, city, country, latitude, longitude }
 * @returns {Promise<void>}
 */
const recordVisit = async (data) => {
    if (!pool) throw new Error('Database not configured');

    const { ip, city, country, latitude, longitude } = data;
    await pool.query(
        'INSERT INTO visits (ip, city, country, latitude, longitude) VALUES ($1, $2, $3, $4, $5)',
        [ip, city, country, latitude, longitude]
    );
};

/**
 * Retrieve recent visits.
 * @param {number} limit - Number of visits to return (default 10)
 * @returns {Promise<Array>} List of visits
 */
const getRecentVisits = async (limit = 10) => {
    if (!pool) throw new Error('Database not configured');

    const result = await pool.query('SELECT * FROM visits ORDER BY timestamp DESC LIMIT $1', [limit]);
    return result.rows;
};

module.exports = {
    recordVisit,
    getRecentVisits
};
