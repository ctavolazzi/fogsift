# Journal Entry 011: Security & Deployment Reference

**Date:** 2026-02-08
**Author:** Claude (AI Development Partner)
**Context:** Security posture, deployment pipeline, and infrastructure reference

---

## Security Headers (`dist/_headers`)

```
/*
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), ...
  Content-Security-Policy:
    default-src 'self';
    script-src 'self';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data:;
    connect-src 'self' https://static.cloudflareinsights.com;
    frame-ancestors 'none'
```

**CSP Notes:**
- `unsafe-inline` for styles only (Google Fonts integration)
- No `unsafe-inline` for scripts (theme-init.js is external)
- `frame-ancestors 'none'` = clickjacking protection
- Cloudflare Insights tracking allowed via `connect-src`

## Deployment Pipeline

```bash
npm run deploy
# = npm run build && npx wrangler pages deploy dist --project-name fogsift --branch main

npm run quick-deploy  # node scripts/deploy.js (with pre-flight checks)
npm run deploy:dry    # Dry run
```

**Pre-flight checks:** Clean git tree, main branch, version bump, critical files exist.
**Deploy manifest:** `.deploy-manifest.json` records version, commit, sizes, timestamp.

## Cloudflare Functions

### Ko-fi Webhook (`functions/api/webhook/kofi.js`)
- `POST /api/webhook/kofi`
- Token verification: `env.KOFI_VERIFICATION_TOKEN`
- KV deduplication by transaction ID
- Stores to `QUEUE_KV` namespace

### Queue API (`functions/api/queue.js`)
- `GET /api/queue?status=&limit=`
- Data sanitization: removes email, respects `is_public`
- CORS: `Access-Control-Allow-Origin: *` (read-only)
- 30s cache, falls back to mock data if KV unavailable

## KV Configuration

**Binding:** `QUEUE_KV` in `wrangler.toml`
**WARNING:** KV namespace IDs are PLACEHOLDERS - need real Cloudflare KV IDs.

```
item:{transaction_id} -> JSON queue item
queue:index -> Array of item IDs (newest first)
```

## robots.txt

- Allows general crawlers (Google, Bing)
- **Blocks AI scrapers:** GPTBot, CCBot, anthropic-ai, Google-Extended
- References `sitemap.xml`

## Known Security Gaps

| Gap | Priority | Status |
|-----|----------|--------|
| KV placeholder IDs | HIGH | Blocks payment processing |
| Cookie consent (GDPR) | HIGH | No consent banner |
| Rate limiting on webhook | MEDIUM | Relies on Cloudflare defaults |
| HMAC webhook signatures | MEDIUM | Token-only verification |
| CI/CD pipeline | MEDIUM | Manual deployment only |

## Port System

| Port | Service | Script |
|------|---------|--------|
| 5050 | Dev server (browser-sync) | `npx browser-sync start --server dist` |
| 5001 | AI Journal (Keeper's Log) | `node _AI_Journal/serve.js` |
| 5030 | Component Library (Signal Workshop) | `node _tools/component-library/serve.js` |
| 5065 | Test Viewer (Quality Report) | `node _tools/test-viewer/serve.js` |
| 8788 | Wrangler dev (Cloudflare Functions) | `npx wrangler pages dev dist` |

## Clean URL System

Cloudflare Pages automatically redirects `about.html` -> `about` (308 permanent).
All links in source use clean URLs. Build script generates correct relative paths.
