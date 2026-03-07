// Export main class and core modules
export { PgMultipleMigrate } from './core/index.js';
export { ConfigValidator } from './core/config-validator.js';
export { EnvironmentValidator } from './core/environment-validator.js';
export { MigrationGenerator } from './core/migration-generator.js';

// Export types
export type {
  DatabaseConfig,
  DatabaseConfigArray,
  ValidationResult,
  ExecutionResult,
  ExecutionSummary,
  InitOptions,
  ExecOptions,
  MigrationOptions,
  MigrationAction,
  LogLevel,
  LoggerOptions,
  PackageManager,
} from './types/index.js';

// Export errors
export {
  PgMultiMigrateError,
  ConfigValidationError,
  MissingDependencyError,
  FileOperationError,
  MissingEnvVarError,
  MigrationExecutionError,
} from './utils/errors.js';

// Export utilities
export { createLogger, getLogger, resetLogger } from './utils/logger.js';

/**
 * Convenience functions for backward compatibility and ease of use
 */
import { PgMultipleMigrate } from './core/index.js';
import type { InitOptions, ExecOptions, ExecutionSummary } from './types/index.js';

/**
 * Initialize configuration file
 * @deprecated Use `new PgMultipleMigrate().init()` instead
 */
export async function init(options: InitOptions = {}): Promise<void> {
  const instance = new PgMultipleMigrate();
  return instance.init(options);
}

/**
 * Execute migration setup for all configured databases
 * @deprecated Use `new PgMultipleMigrate().exec()` instead
 */
export async function exec(options: ExecOptions = {}): Promise<ExecutionSummary> {
  const instance = new PgMultipleMigrate();
  return instance.exec(options);
}
