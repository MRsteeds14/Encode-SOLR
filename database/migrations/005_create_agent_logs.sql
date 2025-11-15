-- 005_create_agent_logs.sql
-- AI agent activity and processing logs

CREATE TABLE IF NOT EXISTS agent_logs (
    id SERIAL PRIMARY KEY,
    agent_name VARCHAR(100) NOT NULL, -- 'Risk & Policy Agent', 'Proof-of-Generation Agent'
    energy_submission_id INTEGER REFERENCES energy_submissions(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- 'validate', 'verify_whitelist', 'generate_proof', etc.
    status VARCHAR(50) NOT NULL, -- 'processing', 'completed', 'failed'
    message TEXT,
    input_data JSONB, -- Input data to the agent
    output_data JSONB, -- Agent output/results
    processing_time_ms INTEGER, -- Processing time in milliseconds
    error_details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_agent_logs_agent_name ON agent_logs(agent_name);
CREATE INDEX idx_agent_logs_submission_id ON agent_logs(energy_submission_id);
CREATE INDEX idx_agent_logs_status ON agent_logs(status);
CREATE INDEX idx_agent_logs_timestamp ON agent_logs(timestamp);