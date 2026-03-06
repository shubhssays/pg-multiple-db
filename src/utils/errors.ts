/**
 * Base error class for pg-multiple-migrate
 */
export class PgMultiMigrateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PgMultiMigrateError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when configuration validation fails
 */
export class ConfigValidationError extends PgMultiMigrateError {
  constructor(
    message: string,
    public readonly errors: string[]
  ) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}

/**
 * Error thrown when a required dependency is missing
 */
export class MissingDependencyError extends PgMultiMigrateError {
  constructor(
    public readonly dependency: string,
    message?: string
  ) {
    super(message || `Required dependency "${dependency}" is not installed`);
    this.name = 'MissingDependencyError';
  }
}

/**
 * Error thrown when file operations fail
 */
export class FileOperationError extends PgMultiMigrateError {
  constructor(
    message: string,
    public readonly filePath: string,
    public readonly operation: string
  ) {
    super(message);
    this.name = 'FileOperationError';
  }
}

/**
 * Error thrown when environment variable is missing
 */
export class MissingEnvVarError extends PgMultiMigrateError {
  constructor(
    public readonly varName: string,
    public readonly identity: string
  ) {
    super(`Environment variable "${varName}" not found for database "${identity}"`);
    this.name = 'MissingEnvVarError';
  }
}

/**
 * Error thrown when migration execution fails
 */
export class MigrationExecutionError extends PgMultiMigrateError {
  constructor(
    message: string,
    public readonly identity: string,
    public readonly action: string
  ) {
    super(message);
    this.name = 'MigrationExecutionError';
  }
}
