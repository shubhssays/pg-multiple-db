# Integration Testing Guide

This document describes the integration testing setup for `pg-multiple-migrate`, which validates the library against real PostgreSQL databases.

## Overview

The integration tests use **real PostgreSQL databases** (not mocks) to verify:
- Migration infrastructure generation
- Migration file execution (UP/DOWN)
- Raw SQL query support
- Repeatability and idempotency
- Cross-database isolation

## Test Environment Setup

### Prerequisites

- Docker (for PostgreSQL)
- Node.js 18+
- npm/yarn/pnpm

### 1. Start PostgreSQL Container

```bash
docker run -d \
  --name postgresql-db \
  -e POSTGRES_PASSWORD=change_me \
  -p 5432:5432 \
  postgres:17
```

### 2. Configure Environment

Create `test-integration/.env`:

```env
# Database Connection
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=change_me

# Test Databases
USERS_DB_USERNAME=postgres
USERS_DB_HOST=localhost
USERS_DB_NAME=test_users_db
USERS_DB_PORT=5432
USERS_DB_PASSWORD=change_me

PRODUCTS_DB_USERNAME=postgres
PRODUCTS_DB_HOST=localhost
PRODUCTS_DB_NAME=test_products_db
PRODUCTS_DB_PORT=5432
PRODUCTS_DB_PASSWORD=change_me

ORDERS_DB_USERNAME=postgres
ORDERS_DB_HOST=localhost
ORDERS_DB_NAME=test_orders_db
ORDERS_DB_PORT=5432
ORDERS_DB_PASSWORD=change_me

INVENTORY_DB_USERNAME=postgres
INVENTORY_DB_HOST=localhost
INVENTORY_DB_NAME=test_inventory_db
INVENTORY_DB_PORT=5432
INVENTORY_DB_PASSWORD=change_me

ANALYTICS_DB_USERNAME=postgres
ANALYTICS_DB_HOST=localhost
ANALYTICS_DB_NAME=test_analytics_db
ANALYTICS_DB_PORT=5432
ANALYTICS_DB_PASSWORD=change_me
```

### 3. Create Test Databases

```bash
cd test-integration
node setup-databases.js
```

This creates 5 test databases:
- `test_users_db`
- `test_products_db`
- `test_orders_db`
- `test_inventory_db`
- `test_analytics_db`

### 4. Generate Migration Infrastructure

```bash
npm run build
cd test-integration
node ../dist/cli/index.js exec
```

## Test Database Schemas

### Users Database

**Table:** `users`

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

**Migration:** `test-integration/users_db/migrations/1772710978283_create-users-table.js`

### Products Database

**Table:** `products`

```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  in_stock BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_sku ON products(sku);
```

**Migration:** `test-integration/products_db/migrations/1772710980244_create-products-table.js`

### Orders Database

**Table:** `orders`

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
```

**Migration:** `test-integration/orders_db/migrations/1772710981806_create-orders-table.js`

### Inventory Database

**Table:** `inventory`

```sql
CREATE TABLE inventory (
  id SERIAL PRIMARY KEY,
  product_sku VARCHAR(50) UNIQUE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  warehouse_location VARCHAR(100),
  last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_product_sku ON inventory(product_sku);
```

**Migration:** `test-integration/inventory_db/migrations/1772710983273_create-inventory-table.js`

### Analytics Database

**Table:** `analytics_events`

```sql
CREATE TABLE analytics_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  user_id INTEGER,
  properties JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_properties ON analytics_events USING GIN(properties);
```

**Migration:** `test-integration/analytics_db/migrations/1772710984615_create-analytics-events-table.js`

**Features Tested:**
- JSONB column type
- GIN index for JSONB
- Multiple indexes
- DEFAULT values with JSON

## Running Integration Tests

### Run All Migrations UP

```bash
cd test-integration
npm run migrate:all:up
```

Or individually:

```bash
npm run migrate:users_db:up
npm run migrate:products_db:up
npm run migrate:orders_db:up
npm run migrate:inventory_db:up
npm run migrate:analytics_db:up
```

### Rollback All Migrations

```bash
npm run migrate:all:down
```

Or individually:

```bash
npm run migrate:users_db:down
npm run migrate:products_db:down
npm run migrate:orders_db:down
npm run migrate:inventory_db:down
npm run migrate:analytics_db:down
```

### Test Repeatability

Execute a full UP → DOWN → UP cycle:

```bash
# Apply all migrations
npm run migrate:all:up

# Rollback all migrations
npm run migrate:all:down

# Apply again (should work identically)
npm run migrate:all:up
```

This verifies:
- DOWN migrations properly clean up
- UP migrations are idempotent
- No state leakage between cycles

## Verification Commands

### Check Database List

```bash
docker exec postgresql-db psql -U postgres -c "\l"
```

### Inspect Table Schema

```bash
# Users table
docker exec postgresql-db psql -U postgres -d test_users_db -c "\d+ users"

# Products table
docker exec postgresql-db psql -U postgres -d test_products_db -c "\d+ products"

# Analytics table (with JSONB)
docker exec postgresql-db psql -U postgres -d test_analytics_db -c "\d+ analytics_events"
```

### Check Migration Status

```bash
# View pgmigrations table
docker exec postgresql-db psql -U postgres -d test_users_db -c "SELECT * FROM pgmigrations;"
```

### Query Test Data

```bash
# Insert test data
docker exec postgresql-db psql -U postgres -d test_users_db -c \
  "INSERT INTO users (username, email, password_hash) VALUES ('testuser', 'test@example.com', 'hash123');"

# Query data
docker exec postgresql-db psql -U postgres -d test_users_db -c "SELECT * FROM users;"
```

## Test Coverage

### What's Tested

✅ **Schema Creation**
- Tables with various column types
- Primary keys (SERIAL)
- Unique constraints
- NOT NULL constraints
- DEFAULT values

✅ **Indexes**
- Standard B-tree indexes
- GIN indexes (for JSONB)
- Unique indexes
- Multi-column indexes

✅ **Data Types**
- INTEGER, SERIAL
- VARCHAR with length limits
- TEXT (unlimited)
- DECIMAL with precision
- BOOLEAN
- TIMESTAMP
- JSONB

✅ **Migration Operations**
- CREATE TABLE
- DROP TABLE with CASCADE
- CREATE INDEX
- Multiple SQL statements per migration

✅ **Migration Lifecycle**
- UP migrations (schema creation)
- DOWN migrations (rollback)
- Repeatability (UP → DOWN → UP)

✅ **Raw SQL**
- Multi-line SQL strings
- Complex CREATE TABLE statements
- Multiple CREATE INDEX in one migration
- CASCADE in DROP TABLE

### What's NOT Tested (Future Work)

⚠️ **Schema Changes**
- ALTER TABLE operations
- ADD/DROP COLUMN
- MODIFY COLUMN

⚠️ **Foreign Keys**
- Cross-table relationships
- ON DELETE/UPDATE actions

⚠️ **Advanced Features**
- Views
- Stored procedures
- Triggers
- Partitioning

⚠️ **Data Migrations**
- Seed data
- Data transformations
- Backfilling

## Troubleshooting

### PostgreSQL Connection Refused

```bash
# Check if container is running
docker ps | grep postgresql-db

# Check logs
docker logs postgresql-db

# Restart container
docker restart postgresql-db
```

### Permission Denied Errors

```bash
# Ensure postgres user has permissions
docker exec postgresql-db psql -U postgres -c "ALTER USER postgres WITH SUPERUSER;"
```

### Port Already in Use

```bash
# Find process using port 5432
lsof -i :5432

# Stop existing PostgreSQL
brew services stop postgresql  # macOS
sudo systemctl stop postgresql # Linux
```

### Migrations Already Applied

```bash
# Reset by dropping and recreating database
docker exec postgresql-db psql -U postgres -c "DROP DATABASE IF EXISTS test_users_db;"
docker exec postgresql-db psql -U postgres -c "CREATE DATABASE test_users_db;"

# Or use the setup script
cd test-integration
node setup-databases.js
```

### Schema Mismatch

```bash
# View actual table structure
docker exec postgresql-db psql -U postgres -d test_users_db -c "\d+ users"

# Compare with migration file
cat test-integration/users_db/migrations/*_create-users-table.js
```

## Cleanup

### Remove All Test Databases

```bash
docker exec postgresql-db psql -U postgres -c "DROP DATABASE IF EXISTS test_users_db;"
docker exec postgresql-db psql -U postgres -c "DROP DATABASE IF EXISTS test_products_db;"
docker exec postgresql-db psql -U postgres -c "DROP DATABASE IF EXISTS test_orders_db;"
docker exec postgresql-db psql -U postgres -c "DROP DATABASE IF EXISTS test_inventory_db;"
docker exec postgresql-db psql -U postgres -c "DROP DATABASE IF EXISTS test_analytics_db;"
```

### Remove Generated Files

```bash
cd test-integration
rm -rf users_db/ products_db/ orders_db/ inventory_db/ analytics_db/
rm -f db_migrate_*.cjs
rm -f pg-multiple-db.json
```

### Stop and Remove Container

```bash
docker stop postgresql-db
docker rm postgresql-db
```

## CI/CD Integration

For automated testing in CI/CD pipelines:

```yaml
# .github/workflows/integration-tests.yml
name: Integration Tests

on: [push, pull_request]

jobs:
  integration:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:17
        env:
          POSTGRES_PASSWORD: change_me
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Setup test databases
        run: |
          cd test-integration
          node setup-databases.js
      
      - name: Run integration tests
        run: |
          cd test-integration
          npm run migrate:all:up
          npm run migrate:all:down
          npm run migrate:all:up
```

## Best Practices

### 1. Use Raw SQL

Prefer raw SQL over DSL for clarity:

```javascript
// ✅ Good - Clear and explicit
exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL
    );
  `);
};

// ⚠️ Less clear - DSL abstraction
exports.up = (pgm) => {
  pgm.createTable('users', {
    id: 'id',
    email: { type: 'varchar(255)', unique: true, notNull: true }
  });
};
```

### 2. Always Use CASCADE

Prevent foreign key errors:

```javascript
exports.down = (pgm) => {
  pgm.sql('DROP TABLE IF EXISTS users CASCADE;');
};
```

### 3. Index Important Columns

Add indexes for frequently queried columns:

```javascript
exports.up = (pgm) => {
  pgm.sql(`CREATE TABLE users (...);`);
  
  // Add indexes
  pgm.sql(`CREATE INDEX idx_users_email ON users(email);`);
  pgm.sql(`CREATE INDEX idx_users_created_at ON users(created_at);`);
};
```

### 4. Test Rollbacks

Always verify DOWN migrations work:

```bash
npm run migrate:users_db:up
npm run migrate:users_db:down
```

### 5. Isolate Test Data

Use separate test databases, never production:

```env
# ✅ Good - Clear test prefix
test_users_db
test_products_db

# ❌ Bad - Could confuse with production
users_db
products_db
```

## Related Documentation

- [README.md](README.md) - Main documentation
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contributing guidelines
- [PUBLISHING.md](PUBLISHING.md) - Release workflow
- [examples/](examples/) - Usage examples

---

Last updated: March 6, 2026
