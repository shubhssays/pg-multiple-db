# pg-multiple-migrate

[![CI](https://github.com/shubhssays/pg-multiple-db/actions/workflows/ci.yml/badge.svg)](https://github.com/shubhssays/pg-multiple-db/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/pg-multiple-migrate.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

Modern TypeScript library for managing multiple PostgreSQL database migrations with [node-pg-migrate](https://github.com/salsita/node-pg-migrate). Supports both CommonJS and ES modules.

> **Note:** This package is for personal use and installed directly from GitHub.

## Features

✨ **Multi-Database Support** - Manage migrations for multiple PostgreSQL databases from a single project  
🔒 **Type-Safe** - Full TypeScript support with comprehensive type definitions  
🚀 **Modern** - ES modules with CommonJS compatibility  
🛠️ **CLI & API** - Use as a command-line tool or integrate programmatically  
🔄 **Cross-Platform** - Works on macOS, Linux, and Windows  
📦 **Zero Config** - Sensible defaults with optional customization  
🧪 **Well-Tested** - Comprehensive test coverage with [real database integration tests](INTEGRATION.md)  
📝 **Validation** - Runtime validation with helpful error messages  

## Installation

```bash
# Install from GitHub (automatically builds on install)
npm install github:shubhssays/pg-multiple-db dotenv node-pg-migrate

# Or with specific version tag
npm install github:shubhssays/pg-multiple-db#v2.0.0 dotenv node-pg-migrate

# Or using yarn
yarn add github:shubhssays/pg-multiple-db dotenv node-pg-migrate

# Or using pnpm
pnpm add github:shubhssays/pg-multiple-db dotenv node-pg-migrate
```

The `prepare` script automatically builds the package after installation.

### Peer Dependencies

- `dotenv` ^16.0.0 - For environment variable management
- `node-pg-migrate` ^6.0.0 || ^7.0.0 - For running PostgreSQL migrations

## Quick Start

### 1. Initialize Configuration

```bash
# Using CLI
npx pg-multi-migrate init

# Or using the alias
npx pmm init
```

This creates a `pg-multiple-db.json` file in your project root:

```json
[
  {
    "unique_identity": "",
    "env_db_username": "",
    "env_db_host": "",
    "env_db_name": "",
    "env_db_port": "",
    "env_db_password": ""
  }
]
```

### 2. Configure Your Databases

Edit `pg-multiple-db.json` with your database configurations:

```json
[
  {
    "unique_identity": "users_db",
    "env_db_username": "USERS_DB_USERNAME",
    "env_db_host": "USERS_DB_HOST",
    "env_db_name": "USERS_DB_NAME",
    "env_db_port": "USERS_DB_PORT",
    "env_db_password": "USERS_DB_PASSWORD"
  },
  {
    "unique_identity": "products_db",
    "env_db_username": "PRODUCTS_DB_USERNAME",
    "env_db_host": "PRODUCTS_DB_HOST",
    "env_db_name": "PRODUCTS_DB_NAME",
    "env_db_port": "PRODUCTS_DB_PORT",
    "env_db_password": "PRODUCTS_DB_PASSWORD"
  }
]
```

### 3. Set Environment Variables

Create a `.env` file:

```env
# Users Database
USERS_DB_USERNAME=postgres
USERS_DB_HOST=localhost
USERS_DB_NAME=users
USERS_DB_PORT=5432
USERS_DB_PASSWORD=secret

# Products Database
PRODUCTS_DB_USERNAME=postgres
PRODUCTS_DB_HOST=localhost
PRODUCTS_DB_NAME=products
PRODUCTS_DB_PORT=5432
PRODUCTS_DB_PASSWORD=secret
```

### 4. Generate Migration Structure

```bash
npx pg-multi-migrate exec
```

This creates:
- Separate folders for each database (`users_db/`, `products_db/`)
- Migration runner scripts
- npm scripts in your `package.json`

### 5. Create and Run Migrations

```bash
# Create a new migration
npm run migrate:users_db:create add users table

# Run migrations up
npm run migrate:users_db:up

# Rollback migrations
npm run migrate:users_db:down
```

## CLI Reference

### Commands

#### `init`

Initialize the configuration file.

```bash
pg-multi-migrate init [options]
```

**Options:**
- `-f, --force` - Overwrite existing configuration file
- `-c, --config <path>` - Custom configuration file path

**Examples:**
```bash
# Create new config
pg-multi-migrate init

# Force overwrite existing config
pg-multi-migrate init --force

# Use custom path
pg-multi-migrate init --config ./config/databases.json
```

#### `exec`

Execute migration setup for all configured databases.

```bash
pg-multi-migrate exec [options]
```

**Options:**
- `-c, --config <path>` - Custom configuration file path
- `--dry-run` - Preview changes without executing

**Examples:**
```bash
# Generate migration structure
pg-multi-migrate exec

# Preview what would be generated
pg-multi-migrate exec --dry-run

# Use custom config
pg-multi-migrate exec --config ./config/databases.json
```

#### `status`

Show status of migration configurations.

```bash
pg-multi-migrate status [options]
```

**Options:**
- `-c, --config <path>` - Custom configuration file path

**Examples:**
```bash
# Check status
pg-multi-migrate status
```

### Global Options

- `-v, --verbose` - Enable verbose logging
- `-q, --quiet` - Suppress non-error output
- `-V, --version` - Output version number
- `-h, --help` - Display help

## Programmatic API

### ES Modules

```typescript
import { PgMultipleMigrate } from 'pg-multiple-migrate';

const migrator = new PgMultipleMigrate();

// Initialize config
await migrator.init({ force: false });

// Execute migration setup
const summary = await migrator.exec({ dryRun: false });

console.log(`Executed: ${summary.executed}`);
console.log(`Skipped: ${summary.skipped}`);
console.log(`Failed: ${summary.failed}`);
```

### CommonJS

```javascript
const { PgMultipleMigrate } = require('pg-multiple-migrate');

const migrator = new PgMultipleMigrate();

(async () => {
  await migrator.init();
  const summary = await migrator.exec();
  console.log(summary);
})();
```

### API Reference

#### Class: `PgMultipleMigrate`

##### Constructor

```typescript
new PgMultipleMigrate(cwd?: string)
```

- `cwd` - Optional working directory (defaults to `process.cwd()`)

##### Methods

###### `init(options?: InitOptions): Promise<void>`

Initialize the configuration file.

```typescript
interface InitOptions {
  force?: boolean;        // Overwrite existing file
  configPath?: string;    // Custom config file path
}
```

###### `exec(options?: ExecOptions): Promise<ExecutionSummary>`

Execute migration setup for all databases.

```typescript
interface ExecOptions {
  configPath?: string;    // Custom config file path
  dryRun?: boolean;       // Preview without executing
}

interface ExecutionSummary {
  total: number;          // Total configurations
  executed: number;       // Successfully executed
  skipped: number;        // Skipped (already exist)
  failed: number;         // Failed executions
  results: ExecutionResult[];
}
```

### Convenience Functions (Legacy API)

For backward compatibility with v1, these functions are available:

```typescript
import { init, exec } from 'pg-multiple-migrate';

// These create a new instance internally
await init({ force: false });
const summary = await exec({ dryRun: false });
```

> **Note:** These are deprecated and may be removed in v3. Use the class-based API instead.

## Configuration Schema

### Database Configuration Object

```typescript
interface DatabaseConfig {
  unique_identity: string;      // Unique identifier for this database
  env_db_username: string;      // Env var name for username
  env_db_host: string;          // Env var name for host
  env_db_name: string;          // Env var name for database name
  env_db_port: string;          // Env var name for port
  env_db_password: string;      // Env var name for password
}
```

### Validation Rules

- All fields are required and cannot be empty
- `unique_identity` must be unique across all configurations
- Environment variable names should reference variables in your `.env` file
- Array must contain at least one configuration

## Error Handling

The library throws typed errors for better error handling:

```typescript
import {
  PgMultiMigrateError,
  ConfigValidationError,
  MissingDependencyError,
  MissingEnvVarError,
} from 'pg-multiple-migrate';

try {
  await migrator.exec();
} catch (error) {
  if (error instanceof ConfigValidationError) {
    console.error('Config errors:', error.errors);
  } else if (error instanceof MissingEnvVarError) {
    console.error(`Missing: ${error.varName} for ${error.identity}`);
  } else if (error instanceof MissingDependencyError) {
    console.error(`Install: ${error.dependency}`);
  }
}
```

## Generated Structure

After running `pg-multi-migrate exec`, this structure is created:

```
your-project/
├── pg-multiple-db.json          # Your configuration
├── package.json                 # Updated with migration scripts
├── users_db/                    # Per-database folders
│   ├── package.json
│   ├── migrationRunner.js
│   └── migrations/              # Created by node-pg-migrate
├── products_db/
│   ├── package.json
│   ├── migrationRunner.js
│   └── migrations/
├── db_migrate_users_db.js       # Root-level runners
└── db_migrate_products_db.js
```

## Migration Workflow

### Creating Migrations

```bash
# Create migration for a specific database
npm run migrate:users_db:create add users table

# This creates a timestamped file in users_db/migrations/
# Example: users_db/migrations/1234567890123_add-users-table.js
```

### Running Migrations

```bash
# Apply pending migrations (up)
npm run migrate:users_db:up

# Rollback last migration (down)
npm run migrate:users_db:down
```

### Migration File Example

**RECOMMENDED: Use Raw SQL for clarity and control**

```javascript
// users_db/migrations/1234567890123_create-users-table.js
exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create indexes
  pgm.sql(`
    CREATE INDEX idx_users_email ON users(email);
  `);
};

exports.down = (pgm) => {
  pgm.sql('DROP TABLE IF EXISTS users CASCADE;');
};
```

**ALTERNATIVE: Use node-pg-migrate DSL**

```javascript
// users_db/migrations/1234567890123_add-users-table.js
exports.up = (pgm) => {
  pgm.createTable('users', {
    id: 'id',
    name: { type: 'varchar(100)', notNull: true },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('users');
};
```

**More Migration Examples:**

```javascript
// Add column
exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE users ADD COLUMN phone VARCHAR(20);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE users DROP COLUMN phone;
  `);
};

// Create foreign key relationship
exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      total_amount DECIMAL(12,2) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  pgm.sql(`
    CREATE INDEX idx_orders_user_id ON orders(user_id);
    CREATE INDEX idx_orders_status ON orders(status);
  `);
};

exports.down = (pgm) => {
  pgm.sql('DROP TABLE IF EXISTS orders CASCADE;');
};

// Create JSONB column with indexes
exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE analytics_events (
      id SERIAL PRIMARY KEY,
      event_type VARCHAR(100) NOT NULL,
      user_id INTEGER,
      properties JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  pgm.sql(`
    CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
    CREATE INDEX idx_analytics_properties ON analytics_events USING GIN(properties);
  `);
};

exports.down = (pgm) => {
  pgm.sql('DROP TABLE IF EXISTS analytics_events CASCADE;');
};
```

Learn more about node-pg-migrate: https://github.com/salsita/node-pg-migrate

## Migrating from v1 to v2

### Breaking Changes

1. **Module System**: v2 is ESM-first (with CJS support)
2. **API Changes**: New class-based API (old functions still work but deprecated)
3. **Node Version**: Requires Node.js 18+
4. **Better Errors**: Throws typed errors instead of calling `process.exit()`

### Migration Steps

1. **Update package.json:**

```json
{
  "type": "module",
  "dependencies": {
    "pg-multiple-migrate": "^2.0.0"
  }
}
```

2. **Update imports (if using programmatically):**

```javascript
// v1 (still works in v2, but deprecated)
const { init, exec } = require('pg-multiple-migrate');

// v2 (recommended)
import { PgMultipleMigrate } from 'pg-multiple-migrate';
const migrator = new PgMultipleMigrate();
```

3. **Update error handling:**

```javascript
// v1 - process would exit on errors
// No way to catch errors

// v2 - proper error handling
try {
  await migrator.exec();
} catch (error) {
  console.error('Migration failed:', error);
  // Handle error appropriately
}
```

4. **Use CLI:**

```bash
# v1 - Only programmatic API
# v2 - CLI available
npx pg-multi-migrate init
npx pg-multi-migrate exec
npx pg-multi-migrate status
```

## Troubleshooting

### Common Issues

**Q: "Required dependency not installed" error**

A: Install peer dependencies:
```bash
npm install dotenv node-pg-migrate
```

**Q: "Environment variable not found" error**

A: Ensure your `.env` file is in the project root and contains all required variables. Load it before running migrations:

```javascript
import 'dotenv/config';
import { PgMultipleMigrate } from 'pg-multiple-migrate';
```

**Q: "Configuration validation failed" error**

A: Check your `pg-multiple-db.json`:
- All fields must be non-empty
- `unique_identity` values must be unique
- Must be a valid JSON array

**Q: Migrations fail on Windows**

A: v2 fixes cross-platform issues. Update to latest version.

**Q: TypeScript types not working**

A: Ensure your `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "esModuleInterop": true
  }
}
```

## Examples

See the [examples directory](./examples/) for complete working examples:

- Basic usage with two databases
- Advanced configuration with multiple environments
- Integration with existing projects
- TypeScript usage

**Integration Testing:** See [INTEGRATION.md](INTEGRATION.md) for comprehensive guide on running integration tests with real PostgreSQL databases.

## Versioning and Releases

This project uses an **automated versioning system** that creates new releases when CI passes on master:

### Automatic Releases

- ✅ **Triggers after successful CI**: New versions are created automatically
- 🏷️ **Version tags**: Git tags (e.g., `v2.1.0`) are created for each release
- 📦 **GitHub Releases**: Release notes are auto-generated with installation instructions
- 🔄 **Conventional Commits**: Version bump type determined from commit messages

### Installing Specific Versions

```bash
# Latest version
npm install github:shubhssays/pg-multiple-db

# Specific release
npm install github:shubhssays/pg-multiple-db#v2.0.1

# From branch
npm install github:shubhssays/pg-multiple-db#master
```

### Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/) for automatic version bumping:

```bash
# Patch version (2.0.0 → 2.0.1)
fix: resolve migration ordering issue
chore: update dependencies

# Minor version (2.0.0 → 2.1.0)  
feat: add PostgreSQL 17 support
feat(cli): add --dry-run flag

# Major version (2.0.0 → 3.0.0)
BREAKING CHANGE: remove Node 14 support
feat!: redesign configuration format
```

See [scripts/README.md](scripts/README.md) for complete auto-versioning documentation.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
# Clone repository
git clone https://github.com/shubhssays/pg-multiple-db.git
cd pg-multiple-db

# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build
npm run build

# Lint
npm run lint

# Format
npm run format
```

### Integration Testing

Run integration tests against real PostgreSQL databases:

```bash
# Start PostgreSQL
docker run -d --name postgresql-db -e POSTGRES_PASSWORD=change_me -p 5432:5432 postgres:17

# Setup test databases
cd test-integration
node setup-databases.js

# Run migrations
npm run migrate:all:up
```

For complete integration testing guide, see [INTEGRATION.md](INTEGRATION.md).

## Documentation

- **[README.md](README.md)** - Main documentation (you are here)
- **[INTEGRATION.md](INTEGRATION.md)** - Integration testing guide with real PostgreSQL
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Developer guidelines and coding standards
- **[PUBLISHING.md](PUBLISHING.md)** - Release workflow and publishing guide
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and release notes
- **[examples/](examples/)** - Working examples and usage patterns

## License

MIT © [Shubham Kumar Shukla](https://github.com/shubhssays)

## Changelog

### v2.0.0 (2026-03-05)

- 🎉 Complete rewrite in TypeScript
- ✨ ES modules with CommonJS support
- 🛠️ New CLI tool with improved UX
- 🔒 Runtime validation with Zod
- 🚀 Cross-platform support (Windows/macOS/Linux)
- 📝 Comprehensive documentation and tests
- 🔄 Programmatic API with proper error handling
- 🎯 Dry-run mode
- 📊 Status command
- ⚡ Better logging with structured output

### v1.0.0

- Initial release with CommonJS support

## Related Projects

- [node-pg-migrate](https://github.com/salsita/node-pg-migrate) - PostgreSQL migration tool
- [pg](https://github.com/brianc/node-postgres) - PostgreSQL client for Node.js
- [dotenv](https://github.com/motdotla/dotenv) - Environment variable management

## Support

- 📧 Email: [Create an issue](https://github.com/shubhssays/pg-multiple-db/issues)
- 🐛 Bug Reports: [GitHub Issues](https://github.com/shubhssays/pg-multiple-db/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/shubhssays/pg-multiple-db/discussions)

---

Made with ❤️ by [Shubham Kumar Shukla](https://github.com/shubhssays)