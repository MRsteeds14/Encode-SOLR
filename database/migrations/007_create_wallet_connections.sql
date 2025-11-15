-- 007_create_wallet_connections.sql
-- Wallet connection history and sessions

CREATE TABLE IF NOT EXISTS wallet_connections (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    wallet_address VARCHAR(42) NOT NULL,
    network VARCHAR(50) DEFAULT 'arc-testnet',
    connection_type VARCHAR(50), -- 'metamask', 'walletconnect', etc.
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    disconnected_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Indexes
CREATE INDEX idx_wallet_connections_user_id ON wallet_connections(user_id);
CREATE INDEX idx_wallet_connections_wallet_address ON wallet_connections(wallet_address);
CREATE INDEX idx_wallet_connections_active ON wallet_connections(is_active);
CREATE INDEX idx_wallet_connections_connected_at ON wallet_connections(connected_at);