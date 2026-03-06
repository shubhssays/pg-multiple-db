import { describe, it, expect } from 'vitest';
import {
  PgMultiMigrateError,
  ConfigValidationError,
  MissingDependencyError,
  FileOperationError,
  MissingEnvVarError,
  MigrationExecutionError,
} from '../../src/utils/errors.js';

describe('Error classes', () => {
  describe('PgMultiMigrateError', () => {
    it('should create error with message', () => {
      const error = new PgMultiMigrateError('Test error');
      
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('PgMultiMigrateError');
    });
  });

  describe('ConfigValidationError', () => {
    it('should store validation errors', () => {
      const errors = ['Error 1', 'Error 2'];
      const error = new ConfigValidationError('Validation failed', errors);
      
      expect(error.errors).toEqual(errors);
      expect(error.name).toBe('ConfigValidationError');
    });
  });

  describe('MissingDependencyError', () => {
    it('should store dependency name', () => {
      const error = new MissingDependencyError('dotenv');
      
      expect(error.dependency).toBe('dotenv');
      expect(error.message).toContain('dotenv');
      expect(error.name).toBe('MissingDependencyError');
    });

    it('should accept custom message', () => {
      const error = new MissingDependencyError('dotenv', 'Custom message');
      
      expect(error.message).toBe('Custom message');
    });
  });

  describe('FileOperationError', () => {
    it('should store file path and operation', () => {
      const error = new FileOperationError(
        'Failed to read',
        '/path/to/file',
        'read'
      );
      
      expect(error.filePath).toBe('/path/to/file');
      expect(error.operation).toBe('read');
      expect(error.name).toBe('FileOperationError');
    });
  });

  describe('MissingEnvVarError', () => {
    it('should store variable name and identity', () => {
      const error = new MissingEnvVarError('DB_USER', 'test_db');
      
      expect(error.varName).toBe('DB_USER');
      expect(error.identity).toBe('test_db');
      expect(error.message).toContain('DB_USER');
      expect(error.message).toContain('test_db');
      expect(error.name).toBe('MissingEnvVarError');
    });
  });

  describe('MigrationExecutionError', ()=> {
    it('should store identity and action', () => {
      const error = new MigrationExecutionError(
        'Migration failed',
        'test_db',
        'up'
      );
      
      expect(error.identity).toBe('test_db');
      expect(error.action).toBe('up');
      expect(error.name).toBe('MigrationExecutionError');
    });
  });
});
