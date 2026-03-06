# Publishing Guide

This document describes the process for publishing new versions of `pg-multiple-migrate` to npm.

## Prerequisites

- npm account with publish access
- Two-factor authentication enabled
- Repository maintainer access
- Node.js 18+ installed

## Pre-Publishing Checklist

Before publishing, ensure:

- [ ] All tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] Linting passes: `npm run lint`
- [ ] Type checking passes: `npm run type-check`
- [ ] CHANGELOG.md is updated with new version
- [ ] README.md reflects any new features
- [ ] No uncommitted changes

## Publishing Process

### 1. Prepare Release

```bash
# Ensure you're on master and up to date
git checkout master
git pull origin master

# Run all quality checks
npm run type-check
npm run lint
npm test
npm run build
```

### 2. Update CHANGELOG

Edit `CHANGELOG.md`:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New feature description

### Changed
- Breaking change description

### Fixed
- Bug fix description
```

Move unreleased changes to the new version section.

### 3. Version Bump

Choose the appropriate version bump:

```bash
# Patch release (2.0.0 → 2.0.1) - Bug fixes, minor changes
npm run release:patch

# Minor release (2.0.0 → 2.1.0) - New features, backward compatible
npm run release:minor

# Major release (2.0.0 → 3.0.0) - Breaking changes
npm run release:major
```

These scripts:
1. Update version in `package.json`
2. Create a git commit
3. Create a git tag (`vX.Y.Z`)
4. Push commits and tags to GitHub

### 4. Automated Publishing

When you push a tag, GitHub Actions automatically:
1. Runs all tests on multiple platforms
2. Builds the project
3. Publishes to npm (if all checks pass)

**No manual `npm publish` needed!**

### 5. Create GitHub Release

1. Go to: https://github.com/shubhssays/pg-multiple-db/releases/new
2. Select the tag you just created
3. Release title: `v{VERSION}`
4. Copy release notes from CHANGELOG.md
5. Click "Publish release"

## Manual Publishing (If Needed)

If automated publishing fails or you need to publish manually:

### 1. Authenticate

```bash
npm login
```

### 2. Dry Run

Test what will be published:

```bash
npm run release:dry
```

Review the output to ensure only necessary files are included.

### 3. Publish

```bash
# Standard release
npm publish

# With provenance (recommended for transparency)
npm publish --provenance
```

## Post-Publishing

1. **Verify on npm**
   - Check: https://www.npmjs.com/package/pg-multiple-migrate
   - Ensure correct version is published
   - Verify package size is reasonable

2. **Test Installation**
   ```bash
   # In a temporary directory
   mkdir test-install && cd test-install
   npm init -y
   npm install pg-multiple-migrate
   npx pg-multi-migrate --version
   ```

3. **Announce Release**
   - Update GitHub Discussions
   - Post on relevant forums/communities (if major release)
   - Tweet/social media (optional)

## Version Guidelines

Follow [Semantic Versioning](https://semver.org/):

- **Patch (X.Y.Z)**: Bug fixes, documentation updates, internal changes
  - No API changes
  - Backward compatible
  - Example: `2.0.0 → 2.0.1`

- **Minor (X.Y.0)**: New features, enhancements
  - Backward compatible
  - Deprecated APIs okay
  - Example: `2.0.1 → 2.1.0`

- **Major (X.0.0)**: Breaking changes
  - API changes that break compatibility
  - Removed features
  - Changed behavior
  - Example: `2.1.0 → 3.0.0`

## Rollback Process

If a release has critical issues:

### 1. Deprecate the Bad Version

```bash
npm deprecate pg-multiple-migrate@<version> "Critical bug - use version X.Y.Z instead"
```

### 2. Publish a Fix

```bash
# Fix the issue
git checkout -b hotfix/critical-bug
# Make fixes
git commit -m "fix: critical bug"

# Create patch release
npm run release:patch
```

### 3. Notify Users

- Post issue on GitHub
- Update release notes
- Notify via appropriate channels

## CI/CD Configuration

The GitHub Actions workflow (`.github/workflows/ci.yml`) handles:

1. **On Push/PR**:
   - Linting
   - Type checking
   - Tests on Node 18, 20, 22
   - Tests on Ubuntu, macOS, Windows
   - Build verification

2. **On Tag Push** (`v*`):
   - All above checks
   - Publish to npm with `NPM_TOKEN` secret

### Setting up NPM_TOKEN

Repository maintainer must:

1. Create npm token: https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - Type: "Automation"
   - Expires: Never (or long duration)

2. Add to GitHub secrets:
   - Go to: Repository → Settings → Secrets → Actions
   - Add: `NPM_TOKEN` with the token value

## Troubleshooting

### Publishing fails with "version already exists"

- Version number in package.json was not incremented
- Someone else published simultaneously
- Solution: Bump version and try again

### Tests fail in CI but pass locally

- Check Node.js version differences
- Check OS-specific issues
- Review GitHub Actions logs carefully

### Package too large

- Check what files are included: `npm pack --dry-run`
- Verify `.npmignore` is correct
- Ensure `dist/` is included but `src/` is excluded

### Authentication errors

- Ensure `NPM_TOKEN` secret is set correctly
- Token must have publish permissions
- Check if 2FA is causing issues

## Security

### npm Provenance

We use `--provenance` flag to:
- Link package to source repository
- Prove package came from GitHub Actions
- Improve supply chain security

Learn more: https://github.blog/2023-04-19-introducing-npm-package-provenance/

### Vulnerability Scanning

Before each release:

```bash
# Check for vulnerabilities
npm audit

# Fix if possible
npm audit fix
```

## Questions?

Contact repository maintainers or open an issue.

---

Last updated: March 5, 2026
