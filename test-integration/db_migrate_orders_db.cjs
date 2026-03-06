require("dotenv").config();
const { exec } = require('child_process');

function up() {
  exec('npm --prefix orders_db run orders_db-migrate-up', (error, stdout, stderr) => {
    if (stderr) {
      console.error(stderr);
      process.exit(1);
    }
    if (error) {
      console.error(error);
      process.exit(1);
    }
    console.log(stdout);
  });
}

function down() {
  exec('npm --prefix orders_db run orders_db-migrate-down', (error, stdout, stderr) => {
    if (stderr) {
      console.error(stderr);
      process.exit(1);
    }
    if (error) {
      console.error(error);
      process.exit(1);
    }
    console.log(stdout);
  });
}

function create(migration_file_name) {
  exec(`npm --prefix orders_db run orders_db-migrate-create ${migration_file_name}`, (error, stdout, stderr) => {
    if (stderr) {
      console.error(stderr);
      process.exit(1);
    }
    if (error) {
      console.error(error);
      process.exit(1);
    }
    console.log(stdout);
  });
}

const action = process.argv[2];
if (!action) {
  console.error('action not found. Something is wrong');
  process.exit(1);
}

if (action === 'up') {
  up();
} else if (action === 'down') {
  down();
} else if (action === 'create') {
  let migration_file_name = '';
  for (let i = 3; i < process.argv.length; i++) {
    migration_file_name += process.argv[i] + " ";
  }
  migration_file_name = migration_file_name.substring(0, migration_file_name.length - 1);
  if (!migration_file_name) {
    console.error('migration_file_name is missing');
    console.error('Usage: npm run migrate:orders_db:create [migration_file_name]');
    process.exit(1);
  }
  create(migration_file_name);
} else {
  console.error('Invalid action. Something is wrong');
  process.exit(1);
}
