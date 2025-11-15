-- 002_create_solar_systems.sql
-- Solar system installations and metadata

CREATE TABLE IF NOT EXISTS solar_systems (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    system_name VARCHAR(255),
    capacity_kw DECIMAL(10, 2) NOT NULL, -- System capacity in kW
    location_lat DECIMAL(10, 8), -- GPS latitude
    location_lng DECIMAL(11, 8), -- GPS longitude
    location_address TEXT,
    installation_date DATE,
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, maintenance
    meter_id VARCHAR(100), -- Smart meter identifier
    inverter_model VARCHAR(100),
    panel_count INTEGER,
    panel_wattage DECIMAL(10, 2),
    metadata JSONB, -- Additional system metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_solar_systems_user_id ON solar_systems(user_id);
CREATE INDEX idx_solar_systems_status ON solar_systems(status);
CREATE INDEX idx_solar_systems_location ON solar_systems(location_lat, location_lng);

-- Trigger for updated_at
CREATE TRIGGER update_solar_systems_updated_at
    BEFORE UPDATE ON solar_systems
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();