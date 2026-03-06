import type { DatabaseConfig } from '../types/index.js';
import { MissingEnvVarError } from '../utils/errors.js';

export class EnvironmentValidator {
  /**
   * Get environment variable value or throw if missing
   */
  static getEnvVar(
    varName: string,
    identity: string,
    required = true
  ): string {
    const value = process.env[varName];

    if (required && (!value || value.trim().length === 0)) {
      throw new MissingEnvVarError(varName, identity);
    }

    return value || '';
  }

  /**
   * Get all database connection details from environment variables
   */
  static getDatabaseCredentials(
    config: DatabaseConfig
  ): {
    username: string;
    host: string;
    name: string;
    port: string;
    password: string;
  } {
    const { unique_identity } = config;

    return {
      username: this.getEnvVar(config.env_db_username, unique_identity),
      host: this.getEnvVar(config.env_db_host, unique_identity),
      name: this.getEnvVar(config.env_db_name, unique_identity),
      port: this.getEnvVar(config.env_db_port, unique_identity),
      password: this.getEnvVar(config.env_db_password, unique_identity),
    };
  }

  /**
   * Check if all required environment variables are present
   */
  static validateEnvironmentVars(config: DatabaseConfig): boolean {
    try {
      this.getDatabaseCredentials(config);
      return true;
    } catch {
      return false;
    }
  }
}
