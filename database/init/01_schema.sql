-- Visits table for storing Geo-IP history
CREATE TABLE IF NOT EXISTS visits (
    id SERIAL PRIMARY KEY,
    ip TEXT NOT NULL,
    city TEXT,
    country TEXT,
    latitude FLOAT,
    longitude FLOAT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
