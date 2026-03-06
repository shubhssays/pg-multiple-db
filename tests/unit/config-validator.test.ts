import { describe, it, expect } from 'vitest';
import { ConfigValidator } from '../../src/core/config-validator.js';
import { ConfigValidationError } from '../../src/utils/errors.js';

describe('ConfigValidator', () => {
  describe('validate', () => {
    it('should validate a correct configuration', () => {
      const config = [
        {
          unique_identity: 'test_db',
          env_db_username: 'DB_USER',
          env_db_host: 'DB_HOST',
          env_db_name: 'DB_NAME',
          env_db_port: 'DB_PORT',
          env_db_password: 'DB_PASS',
        },
      ];

      const result = ConfigValidator.validate(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty unique_identity', () => {
      const config = [
        {
          unique_identity: '',
          env_db_username: 'DB_USER',
          env_db_host: 'DB_HOST',
          env_db_name: 'DB_NAME',
          env_db_port: 'DB_PORT',
          env_db_password: 'DB_PASS',
        },
      ];

      const result = ConfigValidator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject duplicate unique_identity values', () => {
      const config = [
        {
          unique_identity: 'test_db',
          env_db_username: 'DB_USER',
          env_db_host: 'DB_HOST',
          env_db_name: 'DB_NAME',
          env_db_port: 'DB_PORT',
          env_db_password: 'DB_PASS',
        },
        {
          unique_identity: 'test_db',
          env_db_username: 'DB_USER2',
          env_db_host: 'DB_HOST2',
          env_db_name: 'DB_NAME2',
          env_db_port: 'DB_PORT2',
          env_db_password: 'DB_PASS2',
        },
      ];

      const result = ConfigValidator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors.some((err) => err.includes('Duplicate'))).toBe(true);
    });

    it('should reject empty array', () => {
      const config: any[] = [];

      const result = ConfigValidator.validate(config);
      expect(result.valid).toBe(false);
    });

    it('should reject missing required fields', () => {
      const config = [
        {
          unique_identity: 'test_db',
          env_db_username: 'DB_USER',
          // missing other fields
        },
      ];

      const result = ConfigValidator.validate(config);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateOrThrow', () => {
    it('should return config when valid', () => {
      const config = [
        {
          unique_identity: 'test_db',
          env_db_username: 'DB_USER',
          env_db_host: 'DB_HOST',
          env_db_name: 'DB_NAME',
          env_db_port: 'DB_PORT',
          env_db_password: 'DB_PASS',
        },
      ];

      expect(() => ConfigValidator.validateOrThrow(config)).not.toThrow();
      const result = ConfigValidator.validateOrThrow(config);
      expect(result).toEqual(config);
    });

    it('should throw ConfigValidationError when invalid', () => {
      const config = [
        {
          unique_identity: '',
          env_db_username: 'DB_USER',
          env_db_host: 'DB_HOST',
          env_db_name: 'DB_NAME',
          env_db_port: 'DB_PORT',
          env_db_password: 'DB_PASS',
        },
      ];

      expect(() => ConfigValidator.validateOrThrow(config)).toThrow(ConfigValidationError);
    });
  });

  describe('createTemplate', () => {
    it('should create a valid template', () => {
      const template = ConfigValidator.createTemplate();
      
      expect(Array.isArray(template)).toBe(true);
      expect(template).toHaveLength(1);
      expect(template[0]).toHaveProperty('unique_identity');
      expect(template[0]).toHaveProperty('env_db_username');
      expect(template[0]).toHaveProperty('env_db_host');
      expect(template[0]).toHaveProperty('env_db_name');
      expect(template[0]).toHaveProperty('env_db_port');
      expect(template[0]).toHaveProperty('env_db_password');
    });
  });

  describe('getConfigFileName', () => {
    it('should return the config file name', () => {
      const fileName = ConfigValidator.getConfigFileName();
      expect(fileName).toBe('pg-multiple-db.json');
    });
  });
});
