-- 003_create_energy_submissions.sql
-- Energy generation submissions for minting

CREATE TABLE IF NOT EXISTS energy_submissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    solar_system_id INTEGER REFERENCES solar_systems(id) ON DELETE SET NULL,
    kwh_amount DECIMAL(10, 2) NOT NULL, -- Energy amount submitted
    submission_date DATE NOT NULL,
    submission_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    gps_lat DECIMAL(10, 8),
    gps_lng DECIMAL(11, 8),
    meter_reading DECIMAL(15, 2),
    status VARCHAR(50) DEFAULT 'pending', -- pending, validated, rejected, minted
    validation_result JSONB, -- AI agent validation results
    rejection_reason TEXT,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_energy_submissions_user_id ON energy_submissions(user_id);
CREATE INDEX idx_energy_submissions_status ON energy_submissions(status);
CREATE INDEX idx_energy_submissions_date ON energy_submissions(submission_date);
CREATE INDEX idx_energy_submissions_timestamp ON energy_submissions(submission_timestamp);