// setup-database.cjs
// Reads migration files and creates SQLite database

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'solr-arc.db');
const migrationsDir = path.join(__dirname, 'database', 'migrations');

console.log('🚀 SOLR-ARC Database Setup\n');
console.log(`📂 Migrations folder: ${migrationsDir}`);
console.log(`💾 Database location: ${dbPath}\n`);

// Remove existing database for fresh start
if (fs.existsSync(dbPath)) {
  console.log('⚠️  Removing existing database...');
  fs.unlinkSync(dbPath);
}

// Create database
const db = new Database(dbPath, { verbose: console.log });
db.pragma('foreign_keys = ON');

console.log('✅ Database created\n');

// Function to convert PostgreSQL SQL to SQLite
function convertToSQLite(sqlContent) {
  let converted = sqlContent;
  
  // Remove PostgreSQL-specific syntax
  converted = converted.replace(/SERIAL PRIMARY KEY/g, 'INTEGER PRIMARY KEY AUTOINCREMENT');
  converted = converted.replace(/SERIAL/g, 'INTEGER');
  converted = converted.replace(/VARCHAR\(\d+\)/g, 'TEXT');
  converted = converted.replace(/DECIMAL\([^)]+\)/g, 'REAL');
  converted = converted.replace(/BIGINT/g, 'INTEGER');
  converted = converted.replace(/BOOLEAN/g, 'INTEGER');
  converted = converted.replace(/TIMESTAMP/g, 'DATETIME');
  converted = converted.replace(/DATE/g, 'DATE');
  converted = converted.replace(/INET/g, 'TEXT');
  converted = converted.replace(/JSONB/g, 'TEXT');
  
  // Remove PostgreSQL functions and triggers
  converted = converted.replace(/CREATE OR REPLACE FUNCTION[\s\S]*?\$\$ LANGUAGE plpgsql;/gi, '');
  converted = converted.replace(/CREATE TRIGGER[\s\S]*?EXECUTE FUNCTION[^;]+;/gi, '');
  
  // Remove extra whitespace and comments
  converted = converted.replace(/--[^\n]*/g, ''); // Remove single-line comments
  converted = converted.replace(/\n{3,}/g, '\n\n');
  
  return converted;
}

// Function to separate CREATE TABLE from CREATE INDEX statements
function separateStatements(sqlContent) {
  const createTables = [];
  const createIndexes = [];
  
  const statements = sqlContent
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  statements.forEach(stmt => {
    if (stmt.toUpperCase().includes('CREATE TABLE')) {
      createTables.push(stmt);
    } else if (stmt.toUpperCase().includes('CREATE INDEX')) {
      createIndexes.push(stmt);
    }
  });
  
  return { createTables, createIndexes };
}

// Read and execute migration files in order
try {
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  console.log('📝 Running migrations:\n');

  // First pass: Create all tables
  console.log('🔨 Creating tables...\n');
  files.forEach(file => {
    const filePath = path.join(migrationsDir, file);
    console.log(`   Processing: ${file}`);
    
    let sqlContent = fs.readFileSync(filePath, 'utf8');
    sqlContent = convertToSQLite(sqlContent);
    
    const { createTables } = separateStatements(sqlContent);
    
    createTables.forEach(statement => {
      try {
        db.exec(statement + ';');
        console.log(`      ✓ Table created`);
      } catch (err) {
        console.log(`      ⚠️  Warning: ${err.message}`);
      }
    });
  });

  // Second pass: Create all indexes
  console.log('\n🔍 Creating indexes...\n');
  files.forEach(file => {
    const filePath = path.join(migrationsDir, file);
    
    let sqlContent = fs.readFileSync(filePath, 'utf8');
    sqlContent = convertToSQLite(sqlContent);
    
    const { createIndexes } = separateStatements(sqlContent);
    
    createIndexes.forEach(statement => {
      try {
        db.exec(statement + ';');
      } catch (err) {
        // Silently ignore index errors
      }
    });
  });

  console.log('✅ All migrations completed!\n');

  // Show database structure
  console.log('📊 Database Tables:\n');
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    ORDER BY name
  `).all();

  if (tables.length === 0) {
    console.log('   ❌ No tables created! Check migration files.');
    process.exit(1);
  }

  tables.forEach(table => {
    const columns = db.pragma(`table_info(${table.name})`);
    console.log(`   ✓ ${table.name} (${columns.length} columns)`);
  });

  // Insert seed data
  console.log('\n🌱 Inserting seed data...\n');

  // Sample user
  db.prepare(`
    INSERT INTO users (
      wallet_address, email, username, system_capacity, 
      daily_cap, whitelist_status, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
    'demo@solarlinked.io',
    'demo_solar_producer',
    5.5,
    100,
    1,
    1
  );
  console.log('   ✓ Demo user created');

  // Sample solar system
  db.prepare(`
    INSERT INTO solar_systems (
      user_id, system_name, capacity_kw, location_lat, 
      location_lng, location_address, status, panel_count, panel_wattage
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    1,
    'Rooftop Solar Array',
    5.5,
    37.7749,
    -122.4194,
    'San Francisco, CA 94102',
    'active',
    20,
    275
  );
  console.log('   ✓ Demo solar system created');

  // Sample energy submission
  db.prepare(`
    INSERT INTO energy_submissions (
      user_id, solar_system_id, kwh_amount, submission_date,
      gps_lat, gps_lng, meter_reading, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    1,
    1,
    24.5,
    new Date().toISOString().split('T')[0],
    37.7749,
    -122.4194,
    1245.75,
    'validated'
  );
  console.log('   ✓ Demo energy submission created');

  // Sample transaction
  db.prepare(`
    INSERT INTO transactions (
      transaction_id, user_id, energy_submission_id, transaction_type,
      sarc_amount, usdc_amount, exchange_rate, status, network
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'tx_' + Date.now(),
    1,
    1,
    'mint',
    24.5,
    3.68,
    0.15,
    'confirmed',
    'arc-testnet'
  );
  console.log('   ✓ Demo transaction created');

  // Sample agent log
  db.prepare(`
    INSERT INTO agent_logs (
      agent_name, energy_submission_id, user_id, action, 
      status, message, processing_time_ms
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    'Proof-of-Generation Agent',
    1,
    1,
    'validate_submission',
    'completed',
    'Energy submission validated successfully',
    145
  );
  console.log('   ✓ Demo agent log created');

  // Sample IPFS proof
  db.prepare(`
    INSERT INTO ipfs_proofs (
      energy_submission_id, ipfs_hash, proof_type, 
      metadata, file_size, pinned
    ) VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    1,
    'QmT4AeWE9Q9EaoyLJiqaZuYQ8mJeq4ZBncjjFH9dQ9uDVA',
    'proof-of-generation',
    JSON.stringify({
      kwh: 24.5,
      gps: { lat: 37.7749, lng: -122.4194 },
      timestamp: new Date().toISOString()
    }),
    2048,
    1
  );
  console.log('   ✓ Demo IPFS proof created');

  // Sample wallet connection
  db.prepare(`
    INSERT INTO wallet_connections (
      user_id, wallet_address, network, connection_type, is_active
    ) VALUES (?, ?, ?, ?, ?)
  `).run(
    1,
    '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
    'arc-testnet',
    'metamask',
    1
  );
  console.log('   ✓ Demo wallet connection created');

  console.log('\n🎉 Database setup complete!\n');
  console.log('📍 Location: ' + dbPath);
  console.log('\n💡 Next steps:');
  console.log('   1. Install SQLite extension in VSCode');
  console.log('   2. Press Ctrl+Shift+P → "SQLite: Open Database"');
  console.log('   3. Select: solr-arc.db');
  console.log('   4. View your tables in the sidebar!\n');

  // Show sample query
  console.log('📝 Sample query to try:');
  console.log('   SELECT u.username, s.system_name, e.kwh_amount');
  console.log('   FROM energy_submissions e');
  console.log('   JOIN users u ON e.user_id = u.id');
  console.log('   JOIN solar_systems s ON e.solar_system_id = s.id;\n');

} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
} finally {
  db.close();
}