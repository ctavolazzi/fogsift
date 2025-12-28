---
id: TKT-x7k9-002
parent: WE-251227-x7k9
title: "Create /api/wiki/index.json"
status: pending
created: 2025-12-27T09:30:00-08:00
created_by: ctavolazzi
assigned_to: null
---

# TKT-x7k9-002: Create /api/wiki/index.json

## Metadata
- **Created**: Friday, December 27, 2025 at 9:30:00 AM PST
- **Parent Work Effort**: WE-251227-x7k9 (API Architecture)
- **Author**: ctavolazzi

## Description
Modify the build script to generate `/api/wiki/index.json` from the source wiki index. This provides the full wiki structure for client-side consumption.

## Acceptance Criteria
- [ ] Build script creates `dist/api/wiki/index.json`
- [ ] JSON includes all categories with id, title, icon
- [ ] JSON includes all pages with slug, title
- [ ] Build date included in metadata
- [ ] File is valid JSON and matches schema from TKT-001

## Files Changed
- (populated when complete)

## Implementation Notes
- Source: `src/wiki/index.json`
- Output: `dist/api/wiki/index.json`
- Should be a copy/transform during build

## Commits
- (populated as work progresses)

