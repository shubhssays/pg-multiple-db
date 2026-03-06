import { PgMultipleMigrate } from 'pg-multiple-migrate';
import 'dotenv/config';

/**
 * Example: Using pg-multiple-migrate programmatically
 */

async function main() {
  try {
    // Initialize with default config file
    const migrator = new PgMultipleMigrate();

    console.log('📋 Loading configuration...');
    const config = await migrator.loadConfig();
    console.log(`✓ Loaded ${config.length} database(s)`);

    config.forEach((db) => {
      console.log(`  - ${db.unique_identity}`);
    });

    console.log('\n🏗️  Setting up migration infrastructure...');
    await migrator.setupMigrations(false); // false = not dry run
    console.log('✓ Migration setup complete!');

    console.log('\n✨ Next steps:');
    console.log('1. Create migrations:');
    config.forEach((db) => {
      console.log(`   npm run migrate:${db.unique_identity}:create create initial schema`);
    });
    console.log('\n2. Run migrations:');
    config.forEach((db) => {
      console.log(`   npm run migrate:${db.unique_identity}:up`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
