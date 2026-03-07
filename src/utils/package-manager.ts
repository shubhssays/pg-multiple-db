import { exists, joinPath } from './file-system.js';

export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

/**
 * Detect the package manager being used in a project by checking for lockfiles
 * Priority order: pnpm > yarn > npm
 */
export async function detectPackageManager(cwd: string): Promise<PackageManager> {
  // Check for pnpm-lock.yaml
  if (await exists(joinPath(cwd, 'pnpm-lock.yaml'))) {
    return 'pnpm';
  }

  // Check for yarn.lock
  if (await exists(joinPath(cwd, 'yarn.lock'))) {
    return 'yarn';
  }

  // Check for package-lock.json (npm)
  if (await exists(joinPath(cwd, 'package-lock.json'))) {
    return 'npm';
  }

  // Check for bun.lockb
  if (await exists(joinPath(cwd, 'bun.lockb'))) {
    return 'bun';
  }

  // Default to npm if no lockfile found
  return 'npm';
}

/**
 * Get the executable command name for a package manager
 * Handles Windows-specific commands
 */
export function getPackageManagerCommand(pm: PackageManager): string {
  const isWindows = process.platform === 'win32';

  switch (pm) {
    case 'pnpm':
      return isWindows ? 'pnpm.cmd' : 'pnpm';
    case 'yarn':
      return isWindows ? 'yarn.cmd' : 'yarn';
    case 'bun':
      return isWindows ? 'bun.exe' : 'bun';
    case 'npm':
    default:
      return isWindows ? 'npm.cmd' : 'npm';
  }
}

/**
 * Build a migrate command for a specific package manager
 * Handles different syntax for running scripts in subdirectories
 */
export function buildMigrateCommand(
  pm: PackageManager,
  identity: string,
  action: 'up' | 'down' | 'create',
  migrationName?: string
): { command: string; args: string[] } {
  const pmCmd = getPackageManagerCommand(pm);

  switch (pm) {
    case 'pnpm':
      // pnpm uses --filter for workspace packages or -C for directory change
      return {
        command: pmCmd,
        args: ['--filter', `./${identity}`, 'run', `${identity}-migrate-${action}`, ...(migrationName ? [migrationName] : [])],
      };

    case 'yarn':
      // yarn uses --cwd for running in a specific directory
      return {
        command: pmCmd,
        args: ['--cwd', identity, 'run', `${identity}-migrate-${action}`, ...(migrationName ? [migrationName] : [])],
      };

    case 'bun':
      // bun similar to npm with --cwd
      return {
        command: pmCmd,
        args: ['--cwd', identity, 'run', `${identity}-migrate-${action}`, ...(migrationName ? [migrationName] : [])],
      };

    case 'npm':
    default:
      // npm uses --prefix
      return {
        command: pmCmd,
        args: ['--prefix', identity, 'run', `${identity}-migrate-${action}`, ...(migrationName ? [migrationName] : [])],
      };
  }
}

/**
 * Build npm run migrate command string for use in generated scripts
 * Returns the command as a string for different package managers
 */
export function getRunMigrateCommand(pm: PackageManager): string {
  switch (pm) {
    case 'pnpm':
      return 'pnpm run migrate';
    case 'yarn':
      return 'yarn run migrate';
    case 'bun':
      return 'bun run migrate';
    case 'npm':
    default:
      return 'npm run migrate';
  }
}

/**
 * Build the prefix/directory flag for package manager
 * Used in generated root runner scripts
 */
export function getPrefixCommand(pm: PackageManager, identity: string): string {
  switch (pm) {
    case 'pnpm':
      return `--filter ./${identity}`;
    case 'yarn':
      return `--cwd ${identity}`;
    case 'bun':
      return `--cwd ${identity}`;
    case 'npm':
    default:
      return `--prefix ${identity}`;
  }
}
