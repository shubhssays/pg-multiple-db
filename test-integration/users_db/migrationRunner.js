require("dotenv").config();
const { exec } = require('child_process');

const databaseUsername = process.env.USERS_DB_USERNAME;
const databaseHost = process.env.USERS_DB_HOST;
const databaseName = process.env.USERS_DB_NAME;
const databasePort = process.env.USERS_DB_PORT;
const databasePassword = process.env.USERS_DB_PASSWORD;

if (!databaseUsername) {
  console.error(`${databaseUsername} not found in env file`);
  process.exit(1);
}

if (!databaseHost) {
  console.error(`${databaseHost} not found in env file`);
  process.exit(1);
}

if (!databaseName) {
  console.error(`${databaseName} not found in env file`);
  process.exit(1);
}

if (!databasePort) {
  console.error(`${databasePort} not found in env file`);
  process.exit(1);
}

if (!databasePassword) {
  console.error(`${databasePassword} not found in env file`);
  process.exit(1);
}

function up() {
  let commandSignature = `DATABASE_URL=postgres://${databaseUsername}:${databasePassword}@${databaseHost}:${databasePort}/${databaseName}`;
  commandSignature = commandSignature.replace(/ /g, '');
  const command = process.platform === 'win32' 
    ? `set ${commandSignature}&&npm run migrate up`
    : `${commandSignature} npm run migrate up`;
  
  exec(command, (error, stdout, stderr) => {
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
  let commandSignature = `DATABASE_URL=postgres://${databaseUsername}:${databasePassword}@${databaseHost}:${databasePort}/${databaseName}`;
  commandSignature = commandSignature.replace(/ /g, '');
  const command = process.platform === 'win32'
    ? `set ${commandSignature}&&npm run migrate down`
    : `${commandSignature} npm run migrate down`;
  
  exec(command, (error, stdout, stderr) => {
    if (stderr) {
      console.error(stderr);
      process.exit(1);
    }
    if (error) {
      console.error("Error running migration: ", error);
      process.exit(1);
    }
    console.log(stdout);
  });
}

function create(migration_name) {
  exec(`npm run migrate create ${migration_name}`, (error, stdout, stderr) => {
    if (stderr) {
      console.error(stderr);
      process.exit(1);
    }
    if (error) {
      console.error(`Error creating migration: ${error}`);
      process.exit(1);
    }
    console.log(stdout);
  });
}

if (process.argv[2] === 'up') {
  up();
} else if (process.argv[2] === 'down') {
  down();
} else if (process.argv[2] === 'create') {
  let migration_name = '';
  for (let i = 3; i < process.argv.length; i++) {
    migration_name += process.argv[i] + "-";
  }
  migration_name = migration_name.substring(0, migration_name.length - 1);
  if (!migration_name) {
    console.error('migration_name is missing');
    console.error('Usage: npm run users_db-migrate-create [migration_name]');
    process.exit(1);
  }
  create(migration_name);
} else {
  console.log('Usage: node migrationRunner.js [up|down|create]');
}
