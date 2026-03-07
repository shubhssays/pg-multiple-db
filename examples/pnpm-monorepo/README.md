# pnpm Monorepo Example

This example demonstrates using `pg-multiple-migrate` in a pnpm monorepo setup.

## Project Structure

```
my-monorepo/
├── pnpm-workspace.yaml
├── package.json
├── .env
├── packages/
│   ├── api/
│   │   └── package.json
│   ├── web/
│   │   └── package.json
│   └── migrations/          # Dedicated migrations package
│       ├── package.json
│       ├── pg-multiple-db.json
│       ├── users_db/
│       ├── products_db/
│       └── orders_db/
└── pnpm-lock.yaml
```

## Setup

### 1. Initialize pnpm workspace

Create `pnpm-workspace.yaml` at the root:

```yaml
packages:
  - 'packages/*'
```

### 2. Install dependencies

```bash
# Install pg-multiple-migrate at root
pnpm add -D github:shubhssays/pg-multiple-db dotenv node-pg-migrate
```

### 3. Initialize migrations in a dedicated package

```bash
# Create migrations package directory
mkdir -p packages/migrations

# Initialize migrations
npx pg-multi-migrate init --root ./packages/migrations
```

### 4. Configure databases

Edit `packages/migrations/pg-multiple-db.json`:

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

### 5. Set up environment variables

Create `.env` at the root:

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

### 6. Generate migration structure

```bash
# pnpm will be auto-detected from pnpm-lock.yaml
npx pg-multi-migrate exec --root ./packages/migrations
```

This creates:

```
packages/migrations/
├── package.json              # Generated with migration scripts
├── pg-multiple-db.json
├── users_db/
│   ├── package.json
│   ├── migrationRunner.js
│   └── migrations/
├── products_db/
│   ├── package.json
│   ├── migrationRunner.js
│   └── migrations/
├── db_migrate_users_db.cjs
└── db_migrate_products_db.cjs
```

### 7. Run migrations

```bash
# Navigate to migrations package
cd packages/migrations

# Create a migration
pnpm run migrate:users_db:create add users table

# Run migrations up
pnpm run migrate:users_db:up

# Check status
pnpm run migrate:users_db:status
```

## Workspace Integration

### Option 1: Run from migrations package

```bash
cd packages/migrations
pnpm run migrate:users_db:up
```

### Option 2: Add root-level scripts

In your root `package.json`:

```json
{
  "scripts": {
    "db:init": "pg-multi-migrate init --root ./packages/migrations",
    "db:generate": "pg-multi-migrate exec --root ./packages/migrations",
    "db:status": "pg-multi-migrate status --root ./packages/migrations"
  }
}
```

Then run from root:

```bash
pnpm run db:init
pnpm run db:generate
pnpm run db:status
```

## Benefits of This Setup

1. **Isolation**: Migrations are separate from application code
2. **Package manager aware**: pnpm commands are auto-generated
3. **Workspace friendly**: Works seamlessly with pnpm workspaces
4. **Version control**: Easy to track migration changes
5. **CI/CD ready**: Simple path references in deployment scripts

## Tips

- Keep `.env` at the workspace root for easy access
- Commit generated migration files but not `node_modules`
- Use `--dry-run` to preview changes before generating
- Document database setup in your team's README
