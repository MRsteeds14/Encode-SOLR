-- dev_seed.sql - Test data for development

-- Insert test user
INSERT INTO users (wallet_address, email, username, system_capacity, daily_cap, whitelist_status)
VALUES 
    ('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1', 'test@example.com', 'solar_producer_1', 10.5, 100.0, true),
    ('0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199', 'test2@example.com', 'solar_producer_2', 5.0, 50.0, true);

-- Insert solar systems
INSERT INTO solar_systems (user_id, system_name, capacity_kw, location_lat, location_lng, status)
VALUES 
    (1, 'Rooftop System', 10.5, 51.5074, -0.1278, 'active'),
    (2, 'Ground Mount', 5.0, 51.5155, -0.1426, 'active');

-- Insert energy submissions
INSERT INTO energy_submissions (user_id, solar_system_id, kwh_amount, submission_date, gps_lat, gps_lng, status)
VALUES 
    (1, 1, 25.5, CURRENT_DATE, 51.5074, -0.1278, 'pending'),
    (1, 1, 30.2, CURRENT_DATE - INTERVAL '1 day', 51.5074, -0.1278, 'validated'),
    (2, 2, 15.0, CURRENT_DATE, 51.5155, -0.1426, 'pending');

-- Insert sample transactions
INSERT INTO transactions (transaction_id, user_id, energy_submission_id, transaction_type, sarc_amount, usdc_amount, exchange_rate, status)
VALUES 
    ('TXN-20250115-001', 1, 2, 'mint', 30.2, NULL, NULL, 'confirmed'),
    ('TXN-20250114-002', 1, NULL, 'redeem', 10.0, 10.0, 1.0000, 'confirmed');

-- Insert agent logs
INSERT INTO agent_logs (agent_name, energy_submission_id, user_id, action, status, message, processing_time_ms)
VALUES 
    ('Risk & Policy Agent', 1, 1, 'validate', 'completed', 'Validation passed', 120),
    ('Proof-of-Generation Agent', 2, 1, 'generate_proof', 'completed', 'Proof generated', 250);

-- Insert IPFS proofs
INSERT INTO ipfs_proofs (energy_submission_id, transaction_id, ipfs_hash, metadata)
VALUES 
    (2, 1, 'QmXjkFQjnD8i8ntmwehoAHBfJEApETx8ebScyVzAHqgjpD', 
     '{"kwh": 30.2, "timestamp": "2025-01-14T10:30:00Z", "gps": {"lat": 51.5074, "lng": -0.1278}}');

-- Insert wallet connections
INSERT INTO wallet_connections (user_id, wallet_address, network, connection_type, is_active)
VALUES 
    (1, '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1', 'arc-testnet', 'metamask', true),
    (2, '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199', 'arc-testnet', 'walletconnect', true);