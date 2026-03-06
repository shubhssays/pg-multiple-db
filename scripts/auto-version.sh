#!/bin/bash

# Auto-versioning script for GitHub Actions
# Automatically bumps version and creates a git tag based on commit messages

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}Current version: ${CURRENT_VERSION}${NC}"

# Get commit messages since last tag
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
if [ -z "$LAST_TAG" ]; then
  echo -e "${YELLOW}No previous tag found. This will be the first release.${NC}"
  COMMITS=$(git log --pretty=format:"%s" HEAD)
else
  echo -e "${GREEN}Last tag: ${LAST_TAG}${NC}"
  COMMITS=$(git log ${LAST_TAG}..HEAD --pretty=format:"%s")
fi

# Determine version bump type based on conventional commits
BUMP_TYPE="patch"

if echo "$COMMITS" | grep -qiE "^(BREAKING CHANGE:|feat!|fix!|chore!)"; then
  BUMP_TYPE="major"
  echo -e "${YELLOW}Breaking changes detected - will bump MAJOR version${NC}"
elif echo "$COMMITS" | grep -qiE "^feat"; then
  BUMP_TYPE="minor"
  echo -e "${YELLOW}New features detected - will bump MINOR version${NC}"
else
  echo -e "${YELLOW}Fixes/chores only - will bump PATCH version${NC}"
fi

# Check if there are any commits to release
if [ -z "$COMMITS" ]; then
  echo -e "${YELLOW}No new commits since last tag. Skipping release.${NC}"
  exit 0
fi

# Bump version
echo -e "${GREEN}Bumping ${BUMP_TYPE} version...${NC}"
NEW_VERSION=$(npm version $BUMP_TYPE --no-git-tag-version)
NEW_VERSION=${NEW_VERSION#v} # Remove 'v' prefix

echo -e "${GREEN}New version: ${NEW_VERSION}${NC}"

# Configure git (for GitHub Actions)
git config --global user.name "github-actions[bot]"
git config --global user.email "github-actions[bot]@users.noreply.github.com"

# Commit the version bump
git add package.json package-lock.json
git commit -m "chore(release): bump version to ${NEW_VERSION} [skip ci]"

# Create and push tag
git tag -a "v${NEW_VERSION}" -m "Release v${NEW_VERSION}"

echo -e "${GREEN}✓ Created tag v${NEW_VERSION}${NC}"
echo -e "${GREEN}✓ Version bump complete!${NC}"
echo ""
echo -e "${YELLOW}To push changes, the workflow will run:${NC}"
echo -e "${YELLOW}  git push origin master${NC}"
echo -e "${YELLOW}  git push origin v${NEW_VERSION}${NC}"
