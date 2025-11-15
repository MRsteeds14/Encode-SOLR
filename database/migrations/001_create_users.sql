-- 001_create_users.sql
-- Users table for solar energy producers

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    email VARCHAR(255),
    username VARCHAR(100),
    system_capacity DECIMAL(10, 2) DEFAULT 0, -- kW capacity
    daily_cap DECIMAL(10, 2) DEFAULT 100, -- kWh daily limit
    total_generated DECIMAL(15, 2) DEFAULT 0, -- Total kWh generated
    total_earned DECIMAL(15, 2) DEFAULT 0, -- Total USDC earned
    whitelist_status BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    joined_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick wallet lookups
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_whitelist_status ON users(whitelist_status);

-- Trigger to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();