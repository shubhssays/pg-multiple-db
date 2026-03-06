import { describe, it, expect } from 'vitest';
import { buildDatabaseUrl } from '../../src/utils/shell.js';

describe('shell utilities', () => {
  describe('buildDatabaseUrl', () => {
    it('should build correct PostgreSQL URL', () => {
      const url = buildDatabaseUrl(
        'postgres',
        'secret',
        'localhost',
        '5432',
        'mydb'
      );

      expect(url).toBe('postgres://postgres:secret@localhost:5432/mydb');
    });

    it('should trim whitespace from credentials', () => {
      const url = buildDatabaseUrl(
        ' postgres ',
        ' secret ',
        ' localhost ',
        ' 5432 ',
        ' mydb '
      );

      expect(url).toBe('postgres://postgres:secret@localhost:5432/mydb');
    });

    it('should handle special characters in password', () => {
      const url = buildDatabaseUrl(
        'user',
        'p@ssw0rd!',
        'localhost',
        '5432',
        'db'
      );

      expect(url).toBe('postgres://user:p@ssw0rd!@localhost:5432/db');
    });
  });
});
