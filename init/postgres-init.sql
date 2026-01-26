-- Auriance Postgres init (executed once on empty data dir)
-- Ensures required extensions and basic schema placeholder exist.

-- Enable useful extensions if available
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS uuid-ossp;

-- Create a simple metadata table to verify init ran
CREATE TABLE IF NOT EXISTS auriance_init (
    id SERIAL PRIMARY KEY,
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO auriance_init (note) VALUES ('AURIANCE Postgres init executed');
