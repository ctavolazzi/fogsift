---
created: '2025-12-27T02:25:35Z'
id: deployment.01
links:
- '[[00.00_index]]'
- '[[deployment_category_index]]'
related_work_efforts: []
title: Deployment Guide
updated: '2025-12-27T02:25:35Z'
---

# Deployment Guide

## Overview

Fogsift is deployed as a static site to Cloudflare Pages. The `dist/` folder contains all production files.

## Deployment Methods

### Method 1: CLI Deploy (Recommended)

```bash
# Build and deploy in one command
npm run deploy
```

This runs:
1. `npm run build` - Builds src → dist
2. `npx wrangler pages deploy dist` - Uploads to Cloudflare

### Method 2: Git-based Deploy

If connected to Cloudflare Pages via GitHub:

```bash
git push origin main
```

Cloudflare automatically:
1. Detects the push
2. Runs the build (if configured)
3. Deploys to edge network

## Cloudflare Pages Configuration

### Build Settings (if using Git integration)

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |
| Node.js version | (any recent) |

### Custom Domain

1. Go to Cloudflare Pages dashboard
2. Select fogsift project
3. Custom domains → Add domain
4. Add `fogsift.com`
5. Configure DNS records as instructed

## Pre-Deployment Checklist

- [ ] Run `npm run build` successfully
- [ ] Test locally with `npm run dev`
- [ ] Check both light and dark themes
- [ ] Test mobile responsiveness
- [ ] Verify all links work
- [ ] Check console for errors
- [ ] Update version if needed (`npm run version:patch`)

## Post-Deployment Verification

1. Visit production URL
2. Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
3. Test theme toggle
4. Test mobile menu
5. Check Open Graph preview (use social debuggers)

## Rollback

If deployment has issues:

```bash
# View recent deployments
npx wrangler pages deployment list --project-name fogsift

# Rollback to specific deployment
npx wrangler pages deployment rollback --project-name fogsift
```

Or via Cloudflare Dashboard:
1. Go to Pages → fogsift
2. Deployments tab
3. Find previous working deployment
4. Click "..." → "Rollback to this deployment"

## Environment Variables

Currently no environment variables required. If needed in future:

```bash
# Set via Wrangler
npx wrangler pages secret put SECRET_NAME

# Or via Dashboard
# Pages → fogsift → Settings → Environment variables
```

## Cache Considerations

Cloudflare caches aggressively. After deploy:

- HTML: Typically not cached long
- CSS/JS: May be cached by filename
- Images: Cached longer

Force cache clear:
1. Cloudflare Dashboard → Caching → Configuration
2. Purge Everything (use sparingly)

## Monitoring

### Analytics
Enable Cloudflare Web Analytics in dashboard (free, privacy-focused).

### Errors
Check browser console and Cloudflare Analytics for errors.

## Related Documents

- [[21.01_build-system|Build System]]
- [[11.01_version-management|Version Management]]