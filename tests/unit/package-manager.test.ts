import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  detectPackageManager,
  getPackageManagerCommand,
  buildMigrateCommand,
  getRunMigrateCommand,
  getPrefixCommand,
} from '../../src/utils/package-manager.js';
import * as fileSystem from '../../src/utils/file-system.js';

describe('Package Manager Detection', () => {
  describe('detectPackageManager', () => {
    beforeEach(() => {
      // Mock the exists function
      vi.spyOn(fileSystem, 'exists');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should detect pnpm when pnpm-lock.yaml exists', async () => {
      vi.mocked(fileSystem.exists).mockImplementation(async (path: string) => {
        return path.includes('pnpm-lock.yaml');
      });

      const result = await detectPackageManager('/test/path');
      expect(result).toBe('pnpm');
    });

    it('should detect yarn when yarn.lock exists', async () => {
      vi.mocked(fileSystem.exists).mockImplementation(async (path: string) => {
        return path.includes('yarn.lock');
      });

      const result = await detectPackageManager('/test/path');
      expect(result).toBe('yarn');
    });

    it('should detect npm when package-lock.json exists', async () => {
      vi.mocked(fileSystem.exists).mockImplementation(async (path: string) => {
        return path.includes('package-lock.json');
      });

      const result = await detectPackageManager('/test/path');
      expect(result).toBe('npm');
    });

    it('should detect bun when bun.lockb exists', async () => {
      vi.mocked(fileSystem.exists).mockImplementation(async (path: string) => {
        return path.includes('bun.lockb');
      });

      const result = await detectPackageManager('/test/path');
      expect(result).toBe('bun');
    });

    it('should default to npm when no lockfile exists', async () => {
      vi.mocked(fileSystem.exists).mockResolvedValue(false);

      const result = await detectPackageManager('/test/path');
      expect(result).toBe('npm');
    });

    it('should prioritize pnpm over yarn and npm', async () => {
      vi.mocked(fileSystem.exists).mockImplementation(async (path: string) => {
        // Both pnpm-lock.yaml and yarn.lock exist
        return path.includes('pnpm-lock.yaml') || path.includes('yarn.lock');
      });

      const result = await detectPackageManager('/test/path');
      expect(result).toBe('pnpm');
    });

    it('should prioritize yarn over npm', async () => {
      vi.mocked(fileSystem.exists).mockImplementation(async (path: string) => {
        // Both yarn.lock and package-lock.json exist
        return path.includes('yarn.lock') || path.includes('package-lock.json');
      });

      const result = await detectPackageManager('/test/path');
      expect(result).toBe('yarn');
    });
  });

  describe('getPackageManagerCommand', () => {
    const originalPlatform = process.platform;

    afterEach(() => {
      // Restore original platform
      Object.defineProperty(process, 'platform', {
        value: originalPlatform,
      });
    });

    it('should return correct command for npm on Windows', () => {
      Object.defineProperty(process, 'platform', { value: 'win32' });
      expect(getPackageManagerCommand('npm')).toBe('npm.cmd');
    });

    it('should return correct command for npm on Unix', () => {
      Object.defineProperty(process, 'platform', { value: 'linux' });
      expect(getPackageManagerCommand('npm')).toBe('npm');
    });

    it('should return correct command for pnpm on Windows', () => {
      Object.defineProperty(process, 'platform', { value: 'win32' });
      expect(getPackageManagerCommand('pnpm')).toBe('pnpm.cmd');
    });

    it('should return correct command for pnpm on Unix', () => {
      Object.defineProperty(process, 'platform', { value: 'darwin' });
      expect(getPackageManagerCommand('pnpm')).toBe('pnpm');
    });

    it('should return correct command for yarn on Windows', () => {
      Object.defineProperty(process, 'platform', { value: 'win32' });
      expect(getPackageManagerCommand('yarn')).toBe('yarn.cmd');
    });

    it('should return correct command for yarn on Unix', () => {
      Object.defineProperty(process, 'platform', { value: 'linux' });
      expect(getPackageManagerCommand('yarn')).toBe('yarn');
    });

    it('should return correct command for bun on Windows', () => {
      Object.defineProperty(process, 'platform', { value: 'win32' });
      expect(getPackageManagerCommand('bun')).toBe('bun.exe');
    });

    it('should return correct command for bun on Unix', () => {
      Object.defineProperty(process, 'platform', { value: 'darwin' });
      expect(getPackageManagerCommand('bun')).toBe('bun');
    });
  });

  describe('buildMigrateCommand', () => {
    it('should build correct command for pnpm', () => {
      const result = buildMigrateCommand('pnpm', 'users_db', 'up');
      expect(result.args).toContain('--filter');
      expect(result.args).toContain('./users_db');
      expect(result.args).toContain('users_db-migrate-up');
    });

    it('should build correct command for yarn', () => {
      const result = buildMigrateCommand('yarn', 'users_db', 'down');
      expect(result.args).toContain('--cwd');
      expect(result.args).toContain('users_db');
      expect(result.args).toContain('users_db-migrate-down');
    });

    it('should build correct command for npm', () => {
      const result = buildMigrateCommand('npm', 'users_db', 'create', 'test-migration');
      expect(result.args).toContain('--prefix');
      expect(result.args).toContain('users_db');
      expect(result.args).toContain('users_db-migrate-create');
      expect(result.args).toContain('test-migration');
    });

    it('should build correct command for bun', () => {
      const result = buildMigrateCommand('bun', 'users_db', 'up');
      expect(result.args).toContain('--cwd');
      expect(result.args).toContain('users_db');
      expect(result.args).toContain('users_db-migrate-up');
    });
  });

  describe('getRunMigrateCommand', () => {
    it('should return correct command for npm', () => {
      expect(getRunMigrateCommand('npm')).toBe('npm run migrate');
    });

    it('should return correct command for pnpm', () => {
      expect(getRunMigrateCommand('pnpm')).toBe('pnpm run migrate');
    });

    it('should return correct command for yarn', () => {
      expect(getRunMigrateCommand('yarn')).toBe('yarn run migrate');
    });

    it('should return correct command for bun', () => {
      expect(getRunMigrateCommand('bun')).toBe('bun run migrate');
    });
  });

  describe('getPrefixCommand', () => {
    it('should return correct prefix for npm', () => {
      expect(getPrefixCommand('npm', 'users_db')).toBe('--prefix users_db');
    });

    it('should return correct prefix for pnpm', () => {
      expect(getPrefixCommand('pnpm', 'users_db')).toBe('--filter ./users_db');
    });

    it('should return correct prefix for yarn', () => {
      expect(getPrefixCommand('yarn', 'users_db')).toBe('--cwd users_db');
    });

    it('should return correct prefix for bun', () => {
      expect(getPrefixCommand('bun', 'users_db')).toBe('--cwd users_db');
    });
  });
});
