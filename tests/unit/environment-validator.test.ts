import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EnvironmentValidator } from '../../src/core/environment-validator.js';
import { MissingEnvVarError } from '../../src/utils/errors.js';
import type { DatabaseConfig } from '../../src/types/index.js';

describe('EnvironmentValidator', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getEnvVar', () => {
    it('should return environment variable value', () => {
      process.env.TEST_VAR = 'test_value';
      
      const value = EnvironmentValidator.getEnvVar('TEST_VAR', 'test_db');
      expect(value).toBe('test_value');
    });

    it('should throw MissingEnvVarError when variable is missing', () => {
      expect(() => {
        EnvironmentValidator.getEnvVar('NON_EXISTENT_VAR', 'test_db');
      }).toThrow(MissingEnvVarError);
    });

    it('should return empty string when not required', () => {
      const value = EnvironmentValidator.getEnvVar('NON_EXISTENT_VAR', 'test_db', false);
      expect(value).toBe('');
    });

    it('should throw when variable is empty string', () => {
      process.env.EMPTY_VAR = '';
      
      expect(() => {
        EnvironmentValidator.getEnvVar('EMPTY_VAR', 'test_db');
      }).toThrow(MissingEnvVarError);
    });
  });

  describe('getDatabaseCredentials', () => {
    it('should return all credentials when environment variables are set', () => {
      process.env.DB_USER = 'postgres';
      process.env.DB_HOST = 'localhost';
      process.env.DB_NAME = 'testdb';
      process.env.DB_PORT = '5432';
      process.env.DB_PASS = 'secret';

      const config: DatabaseConfig = {
        unique_identity: 'test_db',
        env_db_username: 'DB_USER',
        env_db_host: 'DB_HOST',
        env_db_name: 'DB_NAME',
        env_db_port: 'DB_PORT',
        env_db_password: 'DB_PASS',
      };

      const credentials = EnvironmentValidator.getDatabaseCredentials(config);
      
      expect(credentials.username).toBe('postgres');
      expect(credentials.host).toBe('localhost');
      expect(credentials.name).toBe('testdb');
      expect(credentials.port).toBe('5432');
      expect(credentials.password).toBe('secret');
    });

    it('should throw when any credential is missing', () => {
      process.env.DB_USER = 'postgres';
      // Missing other variables

      const config: DatabaseConfig = {
        unique_identity: 'test_db',
        env_db_username: 'DB_USER',
        env_db_host: 'DB_HOST',
        env_db_name: 'DB_NAME',
        env_db_port: 'DB_PORT',
        env_db_password: 'DB_PASS',
      };

      expect(() => {
        EnvironmentValidator.getDatabaseCredentials(config);
      }).toThrow(MissingEnvVarError);
    });
  });

  describe('validateEnvironmentVars', () => {
    it('should return true when all variables are present', () => {
      process.env.DB_USER = 'postgres';
      process.env.DB_HOST = 'localhost';
      process.env.DB_NAME = 'testdb';
      process.env.DB_PORT = '5432';
      process.env.DB_PASS = 'secret';

      const config: DatabaseConfig = {
        unique_identity: 'test_db',
        env_db_username: 'DB_USER',
        env_db_host: 'DB_HOST',
        env_db_name: 'DB_NAME',
        env_db_port: 'DB_PORT',
        env_db_password: 'DB_PASS',
      };

      const isValid = EnvironmentValidator.validateEnvironmentVars(config);
      expect(isValid).toBe(true);
    });

    it('should return false when variables are missing', () => {
      const config: DatabaseConfig = {
        unique_identity: 'test_db',
        env_db_username: 'DB_USER',
        env_db_host: 'DB_HOST',
        env_db_name: 'DB_NAME',
        env_db_port: 'DB_PORT',
        env_db_password: 'DB_PASS',
      };

      const isValid = EnvironmentValidator.validateEnvironmentVars(config);
      expect(isValid).toBe(false);
    });
  });
});
