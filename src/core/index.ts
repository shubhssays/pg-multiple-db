import type {
  InitOptions,
  ExecOptions,
  ExecutionSummary,
  ExecutionResult,
  PackageManager,
} from '../types/index.js';
import { ConfigValidator } from './config-validator.js';
import { MigrationGenerator } from './migration-generator.js';
import { MissingDependencyError } from '../utils/errors.js';
import {
  exists,
  writeJsonFile,
  readJsonFile,
  joinPath,
  getCwd,
  isLibraryInstalled,
  ensureDir,
} from '../utils/file-system.js';
import { getLogger } from '../utils/logger.js';
import { detectPackageManager } from '../utils/package-manager.js';

export class PgMultipleMigrate {
  private cwd: string;
  private logger = getLogger();

  constructor(cwd?: string) {
    this.cwd = cwd || getCwd();
  }

  /**
   * Initialize configuration file
   */
  async init(options: InitOptions = {}): Promise<void> {
    this.checkDependencies();

    // Determine the root path for migrations
    const rootPath = options.rootPath || this.cwd;
    
    // Ensure root path exists
    if (options.rootPath) {
      await ensureDir(rootPath);
      this.logger.info(`Using root path: ${rootPath}`);
    }

    const configPath =
      options.configPath || joinPath(rootPath, ConfigValidator.getConfigFileName());

    const fileExists = await exists(configPath);

    if (fileExists && !options.force) {
      this.logger.info(
        `Configuration file already exists at: ${configPath}. Use force option to overwrite.`
      );
      return;
    }

    const template = ConfigValidator.createTemplate();
    await writeJsonFile(configPath, template);

    if (options.force && fileExists) {
      this.logger.info(`Configuration file overwritten at: ${configPath}`);
    } else {
      this.logger.info(`Configuration file created at: ${configPath}`);
    }
  }

  /**
   * Execute migration setup for all configured databases
   */
  async exec(options: ExecOptions = {}): Promise<ExecutionSummary> {
    this.checkDependencies();

    // Determine the root path for migrations
    const rootPath = options.rootPath || this.cwd;
    
    // Ensure root path exists
    if (options.rootPath) {
      await ensureDir(rootPath);
      this.logger.info(`Using root path: ${rootPath}`);
    }

    const configPath =
      options.configPath || joinPath(rootPath, ConfigValidator.getConfigFileName());

    // Read and validate configuration
    const config = await readJsonFile<unknown>(configPath);
    const validatedConfig = ConfigValidator.validateOrThrow(config);

    // Detect or use provided package manager
    const packageManager: PackageManager = 
      options.packageManager || await detectPackageManager(rootPath);
    
    this.logger.info(`Using package manager: ${packageManager}`);

    const generator = new MigrationGenerator(this.cwd, rootPath, packageManager);
    const results: ExecutionResult[] = [];

    for (const dbConfig of validatedConfig) {
      const { unique_identity } = dbConfig;

      try {
        // Check if folder already exists
        const folderExists = await generator.folderExists(unique_identity);

        if (folderExists) {
          this.logger.info(`Skipping ${unique_identity} - folder already exists`);
          results.push({
            unique_identity,
            success: true,
            skipped: true,
          });
          continue;
        }

        // Generate migration structure
        await generator.generateMigration(dbConfig, options.dryRun);

        results.push({
          unique_identity,
          success: true,
          skipped: false,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Failed to generate migration for ${unique_identity}: ${errorMessage}`);
        results.push({
          unique_identity,
          success: false,
          skipped: false,
          error: errorMessage,
        });
      }
    }

    // Calculate summary
    const summary: ExecutionSummary = {
      total: results.length,
      executed: results.filter((r) => r.success && !r.skipped).length,
      skipped: results.filter((r) => r.skipped).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };

    // Log summary
    if (options.dryRun) {
      this.logger.info('[DRY RUN] Migration setup summary:');
    } else {
      this.logger.info('Migration setup summary:');
    }
    this.logger.info(`Total configurations: ${summary.total}`);
    this.logger.info(`Executed: ${summary.executed}`);
    this.logger.info(`Skipped: ${summary.skipped}`);
    this.logger.info(`Failed: ${summary.failed}`);

    return summary;
  }

  /**
   * Check if required dependencies are installed
   */
  private checkDependencies(): void {
    if (!isLibraryInstalled('dotenv')) {
      throw new MissingDependencyError(
        'dotenv',
        'You need to install "dotenv" to proceed: npm install dotenv'
      );
    }

    if (!isLibraryInstalled('node-pg-migrate')) {
      throw new MissingDependencyError(
        'node-pg-migrate',
        'You need to install "node-pg-migrate" to proceed: npm install node-pg-migrate'
      );
    }
  }
}

export { ConfigValidator } from './config-validator.js';
export { EnvironmentValidator } from './environment-validator.js';
export { MigrationGenerator } from './migration-generator.js';
