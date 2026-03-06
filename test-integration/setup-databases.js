import pkg from 'pg';
const { Client } = pkg;

const databases = [
  'test_users_db',
  'test_products_db',
  'test_orders_db',
  'test_inventory_db',
  'test_analytics_db'
];

async function createDatabases() {
  console.log('🔌 Connecting to PostgreSQL...\n');
  
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'change_me', // Found from Docker inspect
    port: 5432,
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL\n');

    for (const dbName of databases) {
      try {
        await client.query(`DROP DATABASE IF EXISTS ${dbName}`);
        console.log(`🗑️  Dropped database: ${dbName}`);
        
        await client.query(`CREATE DATABASE ${dbName}`);
        console.log(`✅ Created database: ${dbName}`);
      } catch (error) {
        console.error(`❌ Error with database ${dbName}:`, error.message);
      }
    }

    console.log('\n🎉 All databases created successfully!\n');
  } catch (error) {
    console.error('Connection error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDatabases();
