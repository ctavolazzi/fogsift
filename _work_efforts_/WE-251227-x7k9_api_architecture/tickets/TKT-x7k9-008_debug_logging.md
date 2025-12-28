---
id: TKT-x7k9-008
parent: WE-251227-x7k9
title: "Implement Debug Logging System"
status: pending
created: 2025-12-27T09:30:00-08:00
created_by: ctavolazzi
assigned_to: null
---

# TKT-x7k9-008: Implement Debug Logging System

## Metadata
- **Created**: Friday, December 27, 2025 at 9:30:00 AM PST
- **Parent Work Effort**: WE-251227-x7k9 (API Architecture)
- **Author**: ctavolazzi

## Description
Create a toggleable debug logging module that can be activated from the browser console for development and troubleshooting.

## Acceptance Criteria
- [ ] Debug module created at src/js/debug.js
- [ ] Disabled by default in production
- [ ] Can be enabled via console: Debug.enable()
- [ ] Logs API calls with timing
- [ ] Logs component lifecycle events
- [ ] State persisted in localStorage

## API Interface
```javascript
const Debug = {
  enabled: false,
  prefix: '[FOGSIFT]',

  log(module, message, data)    // General logging
  api(endpoint, status, ms)     // API call logging
  component(name, event)        // Component lifecycle

  enable()                      // Turn on + persist
  disable()                     // Turn off + clear
}
```

## Usage Examples
```javascript
Debug.log('WikiAPI', 'Loading sitemap', { cached: true });
Debug.api('/api/wiki/sitemap.json', 200, 45);
Debug.component('JDSitemap', 'rendered');
```

## Files Changed
- (populated when complete)

## Implementation Notes
- Add to build.js JS_FILES array (before main.js)
- Other modules should check Debug.enabled before logging
- Use localStorage key 'fogsift_debug'

## Commits
- (populated as work progresses)

