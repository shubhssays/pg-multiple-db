import { z } from 'zod';
import type { DatabaseConfigArray, ValidationResult } from '../types/index.js';
import { ConfigValidationError } from '../utils/errors.js';

const CONFIG_FILE_NAME = 'pg-multiple-db.json';

/**
 * Zod schema for database configuration
 */
const DatabaseConfigSchema = z.object({
  unique_identity: z.string().min(1, 'unique_identity cannot be empty'),
  env_db_username: z.string().min(1, 'env_db_username cannot be empty'),
  env_db_host: z.string().min(1, 'env_db_host cannot be empty'),
  env_db_name: z.string().min(1, 'env_db_name cannot be empty'),
  env_db_port: z.string().min(1, 'env_db_port cannot be empty'),
  env_db_password: z.string().min(1, 'env_db_password cannot be empty'),
});

/**
 * Zod schema for database configuration array
 */
const DatabaseConfigArraySchema = z.array(DatabaseConfigSchema).min(1);

export class ConfigValidator {
  /**
   * Validate database configuration array using Zod
   */
  static validate(config: unknown): ValidationResult {
    const errors: string[] = [];

    // First, validate with Zod
    const result = DatabaseConfigArraySchema.safeParse(config);
    
    if (!result.success) {
      result.error.errors.forEach((error) => {
        const path = error.path.join('.');
        errors.push(`${path}: ${error.message}`);
      });
      return { valid: false, errors };
    }

    const configArray = result.data as DatabaseConfigArray;

    // Check for duplicate unique_identity values
    const identities = new Set<string>();
    configArray.forEach((item, index) => {
      if (identities.has(item.unique_identity)) {
        errors.push(
          `Duplicate unique_identity "${item.unique_identity}" found at index ${index}`
        );
      }
      identities.add(item.unique_identity);
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate and throw if invalid
   */
  static validateOrThrow(config: unknown): DatabaseConfigArray {
    const result = this.validate(config);
    
    if (!result.valid) {
      throw new ConfigValidationError(
        `Configuration validation failed with ${result.errors.length} error(s)`,
        result.errors
      );
    }

    // Safe to cast after validation
    return config as DatabaseConfigArray;
  }

  /**
   * Get the default configuration file name
   */
  static getConfigFileName(): string {
    return CONFIG_FILE_NAME;
  }

  /**
   * Create an empty configuration template
   */
  static createTemplate(): DatabaseConfigArray {
    return [
      {
        unique_identity: '',
        env_db_username: '',
        env_db_host: '',
        env_db_name: '',
        env_db_port: '',
        env_db_password: '',
      },
    ];
  }
}
