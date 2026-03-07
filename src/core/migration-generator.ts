import type { DatabaseConfig, PackageManager } from '../types/index.js';
import {
  exists,
  ensureDir,
  writeFile,
  writeJsonFile,
  readJsonFile,
  joinPath,
  getCwd,
} from '../utils/file-system.js';
import { getLogger } from '../utils/logger.js';
import { getRunMigrateCommand, getPrefixCommand } from '../utils/package-manager.js';

export class MigrationGenerator {
  private cwd: string;
  private rootPath: string;
  private packageManager: PackageManager;
  private logger = getLogger();

  constructor(cwd?: string, rootPath?: string, packageManager: PackageManager = 'npm') {
    this.cwd = cwd || getCwd();
    this.rootPath = rootPath || this.cwd;
    this.packageManager = packageManager;
  }

  /**
   * Check if a database folder already exists
   */
  async folderExists(identity: string): Promise<boolean> {
    const folderPath = joinPath(this.rootPath, identity);
    return exists(folderPath);
  }

  /**
   * Generate package.json for a database migration folder
   */
  private generatePackageJson(identity: string): string {
    return JSON.stringify(
      {
        dependencies: {
          'dotenv': '^17.3.1',
          'node-pg-migrate': '^7.0.0',
        },
        scripts: {
          migrate: 'node-pg-migrate',
          [`${identity}-migrate-create`]: 'node migrationRunner.js create',
          [`${identity}-migrate-up`]: 'node migrationRunner.js up',
          [`${identity}-migrate-down`]: 'node migrationRunner.js down',
        },
      },
      null,
      2
    );
  }

  /**
   * Generate migrationRunner.js for a database folder
   */
  private generateMigrationRunner(config: DatabaseConfig): string {
    const { unique_identity, env_db_username, env_db_host, env_db_name, env_db_port, env_db_password } = config;
    const runMigrateCmd = getRunMigrateCommand(this.packageManager);

    return `require("dotenv").config();
const { exec } = require('child_process');

const databaseUsername = process.env.${env_db_username};
const databaseHost = process.env.${env_db_host};
const databaseName = process.env.${env_db_name};
const databasePort = process.env.${env_db_port};
const databasePassword = process.env.${env_db_password};

if (!databaseUsername) {
  console.error(\`\${databaseUsername} not found in env file\`);
  process.exit(1);
}

if (!databaseHost) {
  console.error(\`\${databaseHost} not found in env file\`);
  process.exit(1);
}

if (!databaseName) {
  console.error(\`\${databaseName} not found in env file\`);
  process.exit(1);
}

if (!databasePort) {
  console.error(\`\${databasePort} not found in env file\`);
  process.exit(1);
}

if (!databasePassword) {
  console.error(\`\${databasePassword} not found in env file\`);
  process.exit(1);
}

function up() {
  let commandSignature = \`DATABASE_URL=postgres://\${databaseUsername}:\${databasePassword}@\${databaseHost}:\${databasePort}/\${databaseName}\`;
  commandSignature = commandSignature.replace(/ /g, '');
  const command = process.platform === 'win32' 
    ? \`set \${commandSignature}&&${runMigrateCmd} up\`
    : \`\${commandSignature} ${runMigrateCmd} up\`;
  
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
  let commandSignature = \`DATABASE_URL=postgres://\${databaseUsername}:\${databasePassword}@\${databaseHost}:\${databasePort}/\${databaseName}\`;
  commandSignature = commandSignature.replace(/ /g, '');
  const command = process.platform === 'win32'
    ? \`set \${commandSignature}&&${runMigrateCmd} down\`
    : \`\${commandSignature} ${runMigrateCmd} down\`;
  
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
  exec(\`${runMigrateCmd} create \${migration_name}\`, (error, stdout, stderr) => {
    if (stderr) {
      console.error(stderr);
      process.exit(1);
    }
    if (error) {
      console.error(\`Error creating migration: \${error}\`);
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
    console.error('Usage: npm run ${unique_identity}-migrate-create [migration_name]');
    process.exit(1);
  }
  create(migration_name);
} else {
  console.log('Usage: node migrationRunner.js [up|down|create]');
}
`;
  }

  /**
   * Generate root-level runner script for a database
   */
  private generateRootRunner(identity: string): string {
    const prefixCmd = getPrefixCommand(this.packageManager, identity);
    const pmName = this.packageManager;

    return `require("dotenv").config();
const { exec } = require('child_process');

function up() {
  exec('${pmName} ${prefixCmd} run ${identity}-migrate-up', (error, stdout, stderr) => {
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
  exec('${pmName} ${prefixCmd} run ${identity}-migrate-down', (error, stdout, stderr) => {
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
  exec(\`${pmName} ${prefixCmd} run ${identity}-migrate-create \${migration_file_name}\`, (error, stdout, stderr) => {
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
    console.error('Usage: npm run migrate:${identity}:create [migration_file_name]');
    process.exit(1);
  }
  create(migration_file_name);
} else {
  console.error('Invalid action. Something is wrong');
  process.exit(1);
}
`;
  }

  /**
   * Generate migration structure for a single database  */
  async generateMigration(config: DatabaseConfig, dryRun = false): Promise<void> {
    const { unique_identity } = config;

    if (dryRun) {
      this.logger.info(`[DRY RUN] Would generate migration structure for: ${unique_identity}`);
      return;
    }

    // Create database folder
    const dbFolderPath = joinPath(this.rootPath, unique_identity);
    await ensureDir(dbFolderPath);

    // Create package.json in database folder
    const packageJsonPath = joinPath(dbFolderPath, 'package.json');
    const packageJsonContent = this.generatePackageJson(unique_identity);
    await writeFile(packageJsonPath, packageJsonContent);

    // Create migrationRunner.js in database folder
    const migrationRunnerPath = joinPath(dbFolderPath, 'migrationRunner.js');
    const migrationRunnerContent = this.generateMigrationRunner(config);
    await writeFile(migrationRunnerPath, migrationRunnerContent);

    // Create root-level runner script
    const rootRunnerPath = joinPath(this.rootPath, `db_migrate_${unique_identity}.cjs`);
    const rootRunnerContent = this.generateRootRunner(unique_identity);
    await writeFile(rootRunnerPath, rootRunnerContent);

    // Update root package.json scripts
    await this.updateRootPackageJson(unique_identity);

    this.logger.info(`Generated migration structure for: ${unique_identity}`);
  }

  /**
   * Update root package.json with migration scripts
   */
  private async updateRootPackageJson(identity: string): Promise<void> {
    const packageJsonPath = joinPath(this.rootPath, 'package.json');
    
    let packageJson: {
      scripts?: Record<string, string>;
      [key: string]: unknown;
    };

    // Check if package.json exists in rootPath
    if (await exists(packageJsonPath)) {
      packageJson = await readJsonFile<{
        scripts?: Record<string, string>;
        [key: string]: unknown;
      }>(packageJsonPath);
    } else {
      // Create a minimal package.json if it doesn't exist
      packageJson = {
        name: 'database-migrations',
        version: '1.0.0',
        private: true,
        scripts: {},
      };
    }

    const scripts: Record<string, string> = packageJson.scripts || {};
    const valueIntermediate = `db_migrate_${identity}.cjs`;

    scripts[`migrate:${identity}:create`] = `node ${valueIntermediate} create`;
    scripts[`migrate:${identity}:up`] = `node ${valueIntermediate} up`;
    scripts[`migrate:${identity}:down`] = `node ${valueIntermediate} down`;

    packageJson.scripts = scripts;

    await writeJsonFile(packageJsonPath, packageJson);
  }
}
