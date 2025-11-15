console.log('🔍 Starting database test...');

const Database = require('better-sqlite3');
const fs = require('fs');

console.log('✓ Modules loaded');

const dbPath = './solr-arc.db';

// Remove old database
if (fs.existsSync(dbPath)) {
  console.log('🗑️  Removing old database...');
  fs.unlinkSync(dbPath);
  console.log('✓ Old database removed');
}

console.log('📦 Creating new database...');
const db = new Database(dbPath);
console.log('✓ Database created');

console.log('📝 Creating users table...');
db.exec(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);
console.log('✓ Users table created');

console.log('🌱 Inserting test user...');
db.exec(`
  INSERT INTO users (wallet_address, email) 
  VALUES ('0x123', 'test@example.com');
`);
console.log('✓ Test user inserted');

const user = db.prepare('SELECT * FROM users').get();
console.log('📊 User data:', user);

db.close();
console.log('\n✅ TEST COMPLETE!');
console.log('👉 Check your file explorer - you should see: solr-arc.db');