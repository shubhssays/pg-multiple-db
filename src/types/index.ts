/**
 * Configuration for a single database instance
 */
export interface DatabaseConfig {
  /** Unique identifier for this database configuration */
  unique_identity: string;
  /** Environment variable name containing the database username */
  env_db_username: string;
  /** Environment variable name containing the database host */
  env_db_host: string;
  /** Environment variable name containing the database name */
  env_db_name: string;
  /** Environment variable name containing the database port */
  env_db_port: string;
  /** Environment variable name containing the database password */
  env_db_password: string;
}

/**
 * Array of database configurations
 */
export type DatabaseConfigArray = DatabaseConfig[];

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Execution result for a single database configuration
 */
export interface ExecutionResult {
  unique_identity: string;
  success: boolean;
  skipped: boolean;
  error?: string;
}

/**
 * Summary of execution results
 */
export interface ExecutionSummary {
  total: number;
  executed: number;
  skipped: number;
  failed: number;
  results: ExecutionResult[];
}

/**
 * Package manager types
 */
export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

/**
 * Options for the init command
 */
export interface InitOptions {
  force?: boolean;
  configPath?: string;
  /** Optional root directory where all migration files will be generated */
  rootPath?: string;
}

/**
 * Options for the exec command
 */
export interface ExecOptions {
  configPath?: string;
  dryRun?: boolean;
  /** Optional root directory where all migration files will be generated */
  rootPath?: string;
  /** Package manager to use (auto-detected if not specified) */
  packageManager?: PackageManager;
}

/**
 * Migration action types
 */
export type MigrationAction = 'up' | 'down' | 'create';

/**
 * Options for migration commands
 */
export interface MigrationOptions {
  identity: string;
  action: MigrationAction;
  migrationName?: string;
  dryRun?: boolean;
}

/**
 * Logger levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Logger options
 */
export interface LoggerOptions {
  level?: LogLevel;
  pretty?: boolean;
}
