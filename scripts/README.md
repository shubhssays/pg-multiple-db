# Auto-Versioning System

This directory contains scripts for automatic version management and releases.

## How It Works

The project uses an automated versioning system that:

1. **Triggers after successful CI**: When all tests pass on the `master` branch
2. **Analyzes commit messages**: Uses conventional commit format to determine version bump
3. **Bumps version automatically**: Updates `package.json` and `package-lock.json`
4. **Creates git tag**: Tags the release with `v{version}`
5. **Creates GitHub Release**: Generates a release with installation instructions

## Conventional Commits

The system uses [Conventional Commits](https://www.conventionalcommits.org/) to determine version bumps:

### Major Version (X.0.0)
Breaking changes trigger a major version bump:
```
BREAKING CHANGE: removed support for Node 14
feat!: redesign configuration format
fix!: change default behavior
```

### Minor Version (0.X.0)
New features trigger a minor version bump:
```
feat: add support for connection pooling
feat(cli): add new --dry-run flag
```

### Patch Version (0.0.X)
Bug fixes and other changes trigger a patch version bump:
```
fix: resolve migration ordering issue
chore: update dependencies
docs: improve README examples
```

## Workflow Files

### `.github/workflows/ci.yml`
Main CI/CD pipeline that:
- Runs tests on multiple platforms and Node versions
- Runs linting and type checking
- Generates code coverage reports

### `.github/workflows/auto-release.yml`
Automated release workflow that:
- Triggers after CI succeeds on master
- Skips if the last commit is already a version bump
- Runs the versioning script
- Pushes changes and creates GitHub release

## Manual Versioning

If you need to manually create a version, you can run:

```bash
# Make the script executable (first time only)
chmod +x scripts/auto-version.sh

# Run the script
./scripts/auto-version.sh

# Push changes and tags
git push origin master --follow-tags
```

## Installation from Specific Version

Users can install specific versions using git tags:

```bash
# Latest version
npm install github:shubhssays/pg-multiple-db

# Specific version
npm install github:shubhssays/pg-multiple-db#v2.0.1

# Branch
npm install github:shubhssays/pg-multiple-db#master
```

## Skipping Auto-Release

To push changes without triggering an auto-release, include `[skip ci]` in your commit message:

```bash
git commit -m "docs: update README [skip ci]"
```

## Version Bump Logic

The script follows these rules:

1. **No commits since last tag**: Skip release
2. **Breaking changes or feat!/fix! commits**: Bump major version
3. **feat: commits**: Bump minor version  
4. **Any other commits**: Bump patch version

## Example Workflow

1. Developer pushes commits to master:
   ```bash
   git commit -m "feat: add PostgreSQL 17 support"
   git push origin master
   ```

2. CI runs and passes tests

3. Auto-release workflow triggers:
   - Detects `feat:` commit
   - Bumps minor version (2.0.0 → 2.1.0)
   - Creates tag `v2.1.0`
   - Pushes to master
   - Creates GitHub release

4. Users can now install:
   ```bash
   npm install github:shubhssays/pg-multiple-db#v2.1.0
   ```
