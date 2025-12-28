---
id: TKT-x7k9-003
parent: WE-251227-x7k9
title: "Create /api/wiki/sitemap.json"
status: pending
created: 2025-12-27T09:30:00-08:00
created_by: ctavolazzi
assigned_to: null
---

# TKT-x7k9-003: Create /api/wiki/sitemap.json

## Metadata
- **Created**: Friday, December 27, 2025 at 9:30:00 AM PST
- **Parent Work Effort**: WE-251227-x7k9 (API Architecture)
- **Author**: ctavolazzi

## Description
Generate a sitemap JSON with Johnny Decimal numbering pre-computed. This powers the dynamic JD sitemap component without needing client-side number generation.

## Acceptance Criteria
- [ ] Build script creates `dist/api/wiki/sitemap.json`
- [ ] Each category has JD range (10-19, 20-29, etc.)
- [ ] Each page has JD number (10.01, 10.02, etc.)
- [ ] Structure matches what generateJDSitemap() currently produces
- [ ] Build date included in metadata

## Files Changed
- (populated when complete)

## Implementation Notes
- Reuse JD_RANGES from build.js
- Pre-compute all numbering at build time
- Client just renders the data, no computation needed

## Commits
- (populated as work progresses)

