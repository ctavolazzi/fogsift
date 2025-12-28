---
id: TKT-x7k9-007
parent: WE-251227-x7k9
title: "Add Comprehensive Code Comments"
status: pending
created: 2025-12-27T09:30:00-08:00
created_by: ctavolazzi
assigned_to: null
---

# TKT-x7k9-007: Add Comprehensive Code Comments

## Metadata
- **Created**: Friday, December 27, 2025 at 9:30:00 AM PST
- **Parent Work Effort**: WE-251227-x7k9 (API Architecture)
- **Author**: ctavolazzi

## Description
Add comprehensive file headers and inline comments to all JavaScript and CSS files explaining their role in the system.

## Acceptance Criteria
- [ ] All src/js/*.js files have file headers
- [ ] All src/css/*.css files have file headers
- [ ] scripts/build.js has comprehensive comments
- [ ] Comments explain "why" not just "what"
- [ ] References to related files/docs included

## File Header Template
```javascript
/**
 * FOGSIFT [MODULE NAME]
 *
 * Purpose: [What this file does]
 * Dependencies: [What it needs]
 * Used by: [What uses it]
 *
 * Related:
 * - [link to docs]
 * - [link to related files]
 */
```

## Files to Document
- src/js/toast.js
- src/js/theme.js
- src/js/modal.js
- src/js/nav.js
- src/js/sleep.js
- src/js/main.js
- src/css/tokens.css
- src/css/base.css
- src/css/components.css
- src/css/wiki.css
- src/css/mobile.css
- scripts/build.js

## Files Changed
- (populated when complete)

## Implementation Notes
- Don't over-comment obvious code
- Focus on architectural decisions
- Include TKT reference where relevant

## Commits
- (populated as work progresses)

