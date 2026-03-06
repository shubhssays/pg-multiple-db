# Contributing to pg-multiple-migrate

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

Please be respectful and constructive in all interactions. We aim to maintain a welcoming and inclusive community.

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm, yarn, or pnpm
- Git
- PostgreSQL (for integration testing)

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/pg-multiple-db.git
   cd pg-multiple-db
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Project**
   ```bash
   npm run build
   ```

4. **Run Tests**
   ```bash
   npm test
   ```

## Development Workflow

### Project Structure

```
pg-multiple-db/
├── src/
│   ├── core/           # Core business logic
│   ├── cli/            # CLI implementation
│   ├── validators/     # Zod validators
│   ├── errors/         # Custom error classes
│   └── utils/          # Utility functions
├── tests/
│   └── unit/           # Unit tests
├── test-integration/   # Integration test fixtures
├── dist/               # Build output (generated)
└── docs/               # Documentation
```

### Available Scripts

- `npm run build` - Build the project
- `npm run dev` - Build in watch mode
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix auto-fixable linting issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run clean` - Remove build artifacts

### Making Changes

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make Your Changes**
   - Write clean, maintainable code
   - Follow existing code style
   - Add tests for new features
   - Update documentation as needed

3. **Run Quality Checks**
   ```bash
   npm run type-check
   npm run lint
   npm run format:check
   npm test
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting, etc.)
   - `refactor:` - Code refactoring
   - `test:` - Adding or updating tests
   - `chore:` - Maintenance tasks

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then open a Pull Request on GitHub.

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Prefer interfaces over types for object shapes
- Use type inference where possible
- Avoid `any` - use `unknown` if type is truly unknown
- Document complex types with JSDoc comments

### Code Style

- Follow existing ESLint and Prettier configuration
- Use meaningful variable and function names
- Keep functions small and focused
- Add comments for complex logic
- Use async/await over promises
- Handle errors explicitly

### Example

```typescript
/**
 * Validates database configuration
 * @param config - Raw configuration object
 * @returns Validated configuration
 * @throws {ConfigValidationError} If validation fails
 */
export function validateConfig(config: unknown): DatabaseConfig {
  const result = databaseConfigSchema.safeParse(config);
  
  if (!result.success) {
    throw new ConfigValidationError(
      'Invalid configuration',
      result.error.errors
    );
  }
  
  return result.data;
}
```

## Testing

### Writing Tests

- Use Vitest for testing
- Write unit tests for all new functionality
- Aim for >80% code coverage
- Test edge cases and error conditions
- Mock external dependencies appropriately

### Test Structure

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('YourModule', () => {
  describe('yourFunction', () => {
    it('should handle valid input', () => {
      const result = yourFunction('valid input');
      expect(result).toBe('expected output');
    });

    it('should throw on invalid input', () => {
      expect(() => yourFunction('invalid')).toThrow();
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

## Integration Testing

For comprehensive integration tests with real PostgreSQL:

1. **Start PostgreSQL**
   ```bash
   docker run -d --name postgresql-db \
     -e POSTGRES_PASSWORD=your_password \
     -p 5432:5432 \
     postgres:17
   ```

2. **Set Up Test Databases**
   ```bash
   cd test-integration
   node setup-databases.js
   ```

3. **Run Migrations**
   ```bash
   npm run migrate:users_db:up
   npm run migrate:products_db:up
   # etc.
   ```

## Documentation

### README Updates

When adding features:
- Update the Features section
- Add usage examples
- Update API reference if applicable
- Add troubleshooting tips if needed

### Code Documentation

- Add JSDoc comments for public APIs
- Include `@param`, `@returns`, `@throws` tags
- Provide usage examples in comments
- Document complex algorithms

### CHANGELOG

Always update `CHANGELOG.md`:
- Add entry under `[Unreleased]` section
- Follow Keep a Changelog format
- Categorize changes: Added, Changed, Deprecated, Removed, Fixed, Security

## Pull Request Process

1. **Before Submitting**
   - Ensure all tests pass
   - Update documentation
   - Add CHANGELOG entry
   - Rebase on latest master

2. **PR Description**
   - Clearly describe the changes
   - Reference related issues
   - Include screenshots/examples if applicable
   - List breaking changes if any

3. **Review Process**
   - Address reviewer feedback
   - Keep PR focused and manageable
   - Be patient and respectful

4. **After Approval**
   - Maintainer will merge
   - Delete your branch after merge

## Release Process

Maintainers only:

1. **Update Version**
   ```bash
   npm run release:patch  # 2.0.0 → 2.0.1
   npm run release:minor  # 2.0.0 → 2.1.0
   npm run release:major  # 2.0.0 → 3.0.0
   ```

2. **Update CHANGELOG**
   - Move `[Unreleased]` changes to new version section
   - Add release date

3. **Create GitHub Release**
   - Tag will trigger npm publish via GitHub Actions
   - Add release notes from CHANGELOG

## Getting Help

- 📝 [Documentation](README.md)
- 🐛 [Issue Tracker](https://github.com/shubhssays/pg-multiple-db/issues)
- 💬 [Discussions](https://github.com/shubhssays/pg-multiple-db/discussions)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
