import { spawn } from 'cross-spawn';
import type { SpawnOptions } from 'child_process';

/**
 * Execute a shell command with proper cross-platform environment variable handling
 */
export function executeCommand(
  command: string,
  args: string[],
  env: Record<string, string> = {},
  options: SpawnOptions = {}
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve, reject) => {
    const mergedEnv = {
      ...process.env,
      ...env,
    };

    const child = spawn(command, args, {
      ...options,
      env: mergedEnv,
      shell: true,
    });

    let stdout = '';
    let stderr = '';

    if (child.stdout) {
      child.stdout.on('data', (data: Buffer) => {
        stdout += data.toString();
      });
    }

    if (child.stderr) {
      child.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });
    }

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      resolve({
        stdout,
        stderr,
        exitCode: code || 0,
      });
    });
  });
}

/**
 * Build PostgreSQL connection URL
 */
export function buildDatabaseUrl(
  username: string,
  password: string,
  host: string,
  port: string,
  database: string
): string {
  // Remove any whitespace
  const cleanUsername = username.trim();
  const cleanPassword = password.trim();
  const cleanHost = host.trim();
  const cleanPort = port.trim();
  const cleanDatabase = database.trim();

  return `postgres://${cleanUsername}:${cleanPassword}@${cleanHost}:${cleanPort}/${cleanDatabase}`;
}

/**
 * Execute npm command in a specific directory
 */
export async function executeNpmCommand(
  command: string,
  args: string[],
  cwd: string,
  env: Record<string, string> = {}
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const isWindows = process.platform === 'win32';
  const npmCommand = isWindows ? 'npm.cmd' : 'npm';

  return executeCommand(npmCommand, [command, ...args], env, { cwd });
}
