-- 006_create_ipfs_proofs.sql
-- IPFS proof storage for energy generation verification

CREATE TABLE IF NOT EXISTS ipfs_proofs (
    id SERIAL PRIMARY KEY,
    energy_submission_id INTEGER NOT NULL REFERENCES energy_submissions(id) ON DELETE CASCADE,
    transaction_id INTEGER REFERENCES transactions(id) ON DELETE SET NULL,
    ipfs_hash VARCHAR(100) UNIQUE NOT NULL, -- IPFS CID
    proof_type VARCHAR(50) DEFAULT 'proof-of-generation', -- Type of proof
    metadata JSONB NOT NULL, -- Proof metadata (kWh, GPS, timestamp, etc.)
    file_size BIGINT, -- Size in bytes
    pinned BOOLEAN DEFAULT false, -- Whether proof is pinned to IPFS
    gateway_url TEXT, -- Full IPFS gateway URL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_ipfs_proofs_submission_id ON ipfs_proofs(energy_submission_id);
CREATE INDEX idx_ipfs_proofs_ipfs_hash ON ipfs_proofs(ipfs_hash);
CREATE INDEX idx_ipfs_proofs_created_at ON ipfs_proofs(created_at);