#!/usr/bin/env node

import { Command } from 'commander';
import { PgMultipleMigrate } from '../core/index.js';
import { createLogger } from '../utils/logger.js';
import { ConfigValidator } from '../core/config-validator.js';
import { readJsonFile, joinPath, getCwd, exists } from '../utils/file-system.js';
import type { LogLevel } from '../types/index.js';

const program = new Command();

program
  .name('pg-multi-migrate')
  .description('Manage multiple PostgreSQL database migrations')
  .version('2.0.0')
  .option('-v, --verbose', 'Enable verbose logging')
  .option('-q, --quiet', 'Suppress non-error output')
  .hook('preAction', (thisCommand) => {
    const opts = thisCommand.opts();
    let level: LogLevel = 'info';
    
    if (opts.quiet) {
      level = 'error';
    } else if (opts.verbose) {
      level = 'debug';
    }
    
    createLogger({ level, pretty: true });
  });

program
  .command('init')
  .description('Initialize pg-multiple-db.json configuration file')
  .option('-f, --force', 'Overwrite existing configuration file')
  .option('-c, --config <path>', 'Custom configuration file path')
  .option('-r, --root <path>', 'Root directory for migration files (creates if missing)')
  .action(async (options: { force?: boolean; config?: string; root?: string }) => {
    try {
      const migrator = new PgMultipleMigrate();
      await migrator.init({
        force: options.force,
        configPath: options.config,
        rootPath: options.root,
      });
    } catch (error) {
      const logger = createLogger();
      logger.error(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

program
  .command('exec')
  .description('Execute migration setup for all configured databases')
  .option('-c, --config <path>', 'Custom configuration file path')
  .option('-r, --root <path>', 'Root directory for migration files (creates if missing)')
  .option('-p, --package-manager <pm>', 'Package manager to use (npm, yarn, pnpm, bun)')
  .option('--dry-run', 'Preview changes without executing')
  .action(async (options: { config?: string; root?: string; packageManager?: string; dryRun?: boolean }) => {
    try {
      const migrator = new PgMultipleMigrate();
      
      // Validate package manager option
      const validPackageManagers = ['npm', 'yarn', 'pnpm', 'bun'];
      if (options.packageManager && !validPackageManagers.includes(options.packageManager)) {
        const logger = createLogger();
        logger.error(`Invalid package manager: ${options.packageManager}. Valid options: ${validPackageManagers.join(', ')}`);
        process.exit(1);
      }
      
      const summary = await migrator.exec({
        configPath: options.config,
        rootPath: options.root,
        packageManager: options.packageManager as 'npm' | 'yarn' | 'pnpm' | 'bun' | undefined,
        dryRun: options.dryRun,
      });

      if (summary.failed > 0) {
        process.exit(1);
      }
    } catch (error) {
      const logger = createLogger();
      logger.error(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Show status of migration configurations')
  .option('-c, --config <path>', 'Custom configuration file path')
  .option('-r, --root <path>', 'Root directory for migration files')
  .action(async (options: { config?: string; root?: string }) => {
    try {
      const logger = createLogger();
      
      const rootPath = options.root || getCwd();
      const configPath: string = options.config || joinPath(rootPath, ConfigValidator.getConfigFileName());
      
      if (!(await exists(configPath))) {
        logger.error(`Configuration file not found: ${configPath}`);
        logger.info('Run "pg-multi-migrate init" to create one');
        process.exit(1);
      }

      const config = await readJsonFile<unknown>(configPath);
      const validatedConfig = ConfigValidator.validateOrThrow(config);

      logger.info(`Found ${validatedConfig.length} database configuration(s):`);
      
      for (const dbConfig of validatedConfig) {
        const folderPath: string = joinPath(rootPath, dbConfig.unique_identity);
        const folderExists = await exists(folderPath);
        const status = folderExists ? '✓ Generated' : '✗ Not generated';
        logger.info(`  ${status} - ${dbConfig.unique_identity}`);
      }
    } catch (error) {
      const logger = createLogger();
      logger.error(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

program.parse();

