import { promises as fs, existsSync, readFileSync } from 'fs';
import * as path from 'path';
import { FileOperationError } from './errors.js';

/**
 * Check if a file or directory exists
 */
export async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read and parse JSON file
 */
export async function readJsonFile<T>(filePath: string): Promise<T> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new FileOperationError(
      `Failed to read JSON file: ${errorMessage}`,
      filePath,
      'read'
    );
  }
}

/**
 * Write JSON file with formatting
 */
export async function writeJsonFile(
  filePath: string,
  data: unknown
): Promise<void> {
  try {
    const content = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, content, 'utf-8');
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new FileOperationError(
      `Failed to write JSON file: ${errorMessage}`,
      filePath,
      'write'
    );
  }
}

/**
 * Ensure directory exists, create if it doesn't
 */
export async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new FileOperationError(
      `Failed to create directory: ${errorMessage}`,
      dirPath,
      'mkdir'
    );
  }
}

/**
 * Write file with content
 */
export async function writeFile(
  filePath: string,
  content: string
): Promise<void> {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new FileOperationError(
      `Failed to write file: ${errorMessage}`,
      filePath,
      'write'
    );
  }
}

/**
 * Get current working directory
 */
export function getCwd(): string {
  return process.cwd();
}

/**
 * Join path segments
 */
export function joinPath(...segments: string[]): string {
  return path.join(...segments);
}

/**
 * Check if library is installed
 */
export function isLibraryInstalled(libraryName: string): boolean {
  try {
    // Check if library is in package.json dependencies
    const packageJsonPath = joinPath(process.cwd(), 'package.json');
    if (existsSync(packageJsonPath)) {
      const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      const deps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
        ...pkg.peerDependencies,
      };
      return libraryName in deps;
    }
    return false;
  } catch {
    return false;
  }
}
