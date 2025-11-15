-- 004_create_transactions.sql
-- Transaction history for minting and redemption

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(100) UNIQUE NOT NULL, -- Unique transaction identifier
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    energy_submission_id INTEGER REFERENCES energy_submissions(id) ON DELETE SET NULL,
    transaction_type VARCHAR(20) NOT NULL, -- 'mint' or 'redeem'
    sarc_amount DECIMAL(15, 2) NOT NULL, -- sARC token amount
    usdc_amount DECIMAL(15, 2), -- USDC amount (for redemptions)
    exchange_rate DECIMAL(10, 4), -- sARC to USDC rate at time of transaction
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, failed
    tx_hash VARCHAR(66), -- Blockchain transaction hash
    network VARCHAR(50) DEFAULT 'arc-testnet',
    gas_fee DECIMAL(15, 8),
    block_number BIGINT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX idx_transactions_tx_hash ON transactions(tx_hash);