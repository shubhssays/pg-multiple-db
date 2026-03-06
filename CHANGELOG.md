# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-03-05

### 🎉 Major Rewrite

Complete rewrite of the library in TypeScript with modern ES modules support.

### ✨ Added

- **TypeScript Support**: Full TypeScript rewrite with comprehensive type definitions
- **ES Modules**: Native ESM support with CommonJS compatibility via dual build
- **CLI Tool**: New command-line interface with `pg-multi-migrate` and `pmm` aliases
  - `init` - Initialize configuration file
  - `exec` - Execute migration setup  
  - `status` - Show migration status
- **Runtime Validation**: Configuration validation using Zod with helpful error messages
- **Cross-Platform**: Fixed Windows-only `set` command issue, now works on macOS, Linux, and Windows
- **Structured Logging**: Pino-based logging with configurable levels (debug, info, warn, error)
- **Dry-Run Mode**: Preview changes with `--dry-run` flag before executing
- **Better Error Handling**: Typed error classes that can be caught and handled programmatically
- **Programmatic API**: Class-based API (`PgMultipleMigrate`) for better integration
- **Comprehensive Tests**: 27 unit tests with vitest
- **GitHub Actions CI/CD**: Automated testing on multiple Node versions and platforms
- **Code Quality Tools**: ESLint, Prettier, and TypeScript type checking
- **Documentation**: Extensive README with examples, API reference, and migration guide

### 🔄 Changed

- **Breaking**: Module system changed from CommonJS to ES modules (with CJS support)
- **Breaking**: New class-based API (old functions deprecated but still work)
- **Breaking**: Minimum Node.js version is now 18.0.0
- **Breaking**: Library now throws errors instead of calling `process.exit()`
- Package renamed from `pg-multiple-migrate` to v2.0.0 with new structure
- Environment variable handling now uses cross-platform `cross-spawn`

### 🐛 Fixed

- Windows-only shell commands now work cross-platform
- Race conditions from mixed sync/async operations
- Process exits preventing proper error handling
- Missing type definitions

### 📝 Documentation

- Comprehensive README with installation, usage, and API reference
- TypeScript API documentation ready for TypeDoc generation
- Migration guide from v1 to v2
- Example projects in `examples/` directory
- Troubleshooting section for common issues

### 🏗️ Infrastructure

- Modern build system with tsup for dual CJS/ESM output
- Vitest for fast, modern testing
- ESLint + Prettier for code quality
- GitHub Actions for CI/CD
- TypeScript strict mode enabled

### 📦 Dependencies

**New Dependencies:**
- commander - CLI framework
- cross-spawn - Cross-platform process spawning
- pino & pino-pretty - Structured logging
- zod - Runtime validation

**Peer Dependencies** (unchanged):
- dotenv ^16.0.0
- node-pg-migrate ^6.0.0 || ^7.0.0

**Dev Dependencies:**
- TypeScript ecosystem (typescript, tsup, @types/*)
- Testing (vitest, @vitest/coverage-v8)
- Linting (eslint, @typescript-eslint/*)
- Formatting (prettier, eslint-config-prettier)

## [1.0.0] - Previous Release

### Added

- Initial CommonJS implementation
- Basic multi-database migration setup
- `init()` and `exec()` functions
- Configuration via `pg-multiple-db.json`
- Integration with node-pg-migrate

### Known Issues in v1

- Windows-only (uses `set` command)
- No TypeScript support
- Calls `process.exit()` on errors (not library-friendly)
- No CLI tool
- Mixed sync/async patterns
- No error recovery
- No tests
- Limited documentation

---

For upgrade instructions from v1 to v2, see the [Migration Guide](readme.md#migrating-from-v1-to-v2) in the README.
