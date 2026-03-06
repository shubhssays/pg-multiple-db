# Basic Usage Example

This example demonstrates how to use `pg-multiple-migrate` to manage migrations for multiple PostgreSQL databases.

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   
   Copy `.env.example` to `.env` and update with your database credentials.

3. **Initialize Configuration**
   ```bash
   npm run pg:init
   ```

4. **Generate Migration Structure**
   ```bash
   npm run pg:exec
   ```

5. **Create Migrations**
   ```bash
   # Create users table migration
   npm run migrate:users_db:create create users table
   
   # Create products table migration
   npm run migrate:products_db:create create products table
   ```

6. **Run Migrations**
   ```bash
   npm run migrate:all:up
   ```

## Project Structure

After running setup, your project will have:

```
basic-usage/
├── users_db/
│   ├── migrations/
│   │   └── 1234567890_create-users-table.js
│   ├── migrationRunner.js
│   └── package.json
├── products_db/
│   ├── migrations/
│   │   └── 1234567891_create-products-table.js
│   ├── migrationRunner.js
│   └── package.json
├── db_migrate_*.cjs
├── .env
├── pg-multiple-db.json
└── package.json
```

## Usage Examples

### Using CLI

```bash
# Check status
npm run pg:status

# Run migrations up
npm run migrate:users_db:up

# Rollback migrations
npm run migrate:users_db:down

# Create new migration
npm run migrate:users_db:create add email column
```

### Programmatic Usage

See `src/index.js` for example of using the library programmatically.

## Migration Examples

### Example 1: Create Users Table (Raw SQL)

```javascript
// users_db/migrations/1234567890_create-users-table.js
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

  pgm.sql(`
    CREATE INDEX idx_users_email ON users(email);
  `);
};

exports.down = (pgm) => {
  pgm.sql('DROP TABLE IF EXISTS users CASCADE;');
};
```

### Example 2: Create Products Table (Raw SQL)

```javascript
// products_db/migrations/1234567891_create-products-table.js
exports.up = (pgm) => {
  pgm.sql(`
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
  `);

  pgm.sql(`
    CREATE INDEX idx_products_category ON products(category);
  `);
  
  pgm.sql(`
    CREATE INDEX idx_products_sku ON products(sku);
  `);
};

exports.down = (pgm) => {
  pgm.sql('DROP TABLE IF EXISTS products CASCADE;');
};
```

## Notes

- All migrations use raw SQL for clarity and control
- CASCADE is used in DROP statements to handle dependencies
- Indexes are created in the same migration as the table
- Timestamps with DEFAULT values for audit trails
