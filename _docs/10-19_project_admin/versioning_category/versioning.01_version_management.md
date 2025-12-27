---
created: '2025-12-27T02:23:59Z'
id: versioning.01
links:
- '[[00.00_index]]'
- '[[versioning_category_index]]'
related_work_efforts: []
title: Version Management
updated: '2025-12-27T02:23:59Z'
---

# Version Management

## Overview

Fogsift uses semantic versioning (MAJOR.MINOR.PATCH) with automated tooling for version bumps, changelog updates, and git tagging.

## Version Format

```
MAJOR.MINOR.PATCH
  │     │     │
  │     │     └── Patch: Bug fixes, new components, deletions
  │     └──────── Minor: New pages, major features
  └────────────── Major: Breaking changes, redesigns
```

## Version Commands

```bash
# Patch release (0.0.1 → 0.0.2)
npm run version:patch

# Minor release (0.0.2 → 0.1.0)
npm run version:minor

# Major release (0.1.0 → 1.0.0)
npm run version:major
```

## What Each Command Does

1. **Bumps version** in `package.json` and `version.json`
2. **Prompts** for change description
3. **Updates** `CHANGELOG.md` with new entry
4. **Runs** build to ensure everything compiles
5. **Creates** git commit with message `release: vX.X.X`
6. **Creates** annotated git tag `vX.X.X`

## When to Use Each Type

| Change | Version Type | Example |
|--------|--------------|---------|
| Button style fix | None (just commit) | - |
| New button added | `patch` | 0.0.1 → 0.0.2 |
| Component deleted | `patch` | 0.0.2 → 0.0.3 |
| Form validation added | `patch` | 0.0.3 → 0.0.4 |
| New page created | `minor` | 0.0.4 → 0.1.0 |
| Navigation redesign | `minor` | 0.1.0 → 0.2.0 |
| Blog section added | `minor` | 0.2.0 → 0.3.0 |
| Complete UI overhaul | `major` | 0.3.0 → 1.0.0 |
| Breaking URL changes | `major` | 1.0.0 → 2.0.0 |

## Version Files

### package.json
```json
{
  "version": "0.0.1"
}
```
Primary version source used by build system.

### version.json
```json
{
  "version": "0.0.1",
  "released": "2025-12-26",
  "history": []
}
```
Tracks release dates and version history.

### CHANGELOG.md
Human-readable release notes following Keep a Changelog format.

## Workflow Example

```bash
# 1. Make your changes
vim src/css/components.css

# 2. Test locally
npm run preview

# 3. If adding new component, bump version
npm run version:patch
# Enter description when prompted: "Added pricing table component"

# 4. Push to remote
git push && git push --tags

# 5. Deploy
npm run deploy
```

## Post-Release

After running a version command:

```bash
# Push commits and tags to remote
git push && git push --tags

# Deploy to production
npm run deploy
```

## Related Documents

- [[21.01_build-system|Build System]]
- [[../CHANGELOG.md|Changelog]]