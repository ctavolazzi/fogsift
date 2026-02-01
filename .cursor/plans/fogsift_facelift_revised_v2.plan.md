# FogSift Facelift - Revised Plan v2

**Created**: 2026-01-20

**Status**: Ready for review

**Revision**: Addresses all critique items from CRITIQUE_2026-01-20_165200.md

---

## Executive Summary

This revised plan splits the original "comprehensive facelift" into two distinct phases:

- **Phase A: Visual Facelift** (2 weeks) - CSS/animations only, no features
- **Phase B: Conversion Features** (4 weeks) - Contact form, analytics, integrations

Each phase has explicit security measures, testing requirements, rollback procedures, and success criteria.

---

## Pre-Flight Checklist (Before ANY Work)

### 0.1 Fix Existing Broken Assets (BLOCKER)

**Issue Found**: `logo.png` referenced but doesn't exist. Actual files are `logo-color.png`, etc.

**Files with broken paths**:

- `src/hi.html` line 230: `assets/logo.png`
- `src/wiki-index-template.html`: `../assets/logo.png`
- `src/wiki-template.html`: `{{ASSETS_PATH}}logo.png`

**Action**: Fix all broken asset paths BEFORE starting facelift

```bash
# Verify which logo to use
ls src/assets/logo*.png
# Update all references to logo-color-transparent.png (or chosen logo)
```

### 0.2 Establish Baseline Metrics

**Requirement**: Cannot measure improvement without baseline

**Actions**:

1. Run Lighthouse on current site, save report
2. Document current bundle sizes
3. Screenshot all pages in Light/Dark/Industrial themes
4. Note any existing visual bugs

**Output**: `_work_efforts/baseline_2026-01-20.md`

### 0.3 Verify Deployment Pipeline

**Requirement**: Understand how deploy works before changing build

**Current state** (from package.json):

```json
"deploy": "npm run build && npx wrangler pages deploy dist --project-name fogsift"
```

**Conclusion**: `dist/` is built fresh on deploy. Safe to add to `.gitignore`.

### 0.4 Create Staging Branch

**Requirement**: All work happens on feature branch, not main

```bash
git checkout -b feature/facelift-v2
git tag pre-facelift-baseline  # Rollback point
```

---

## Phase A: Visual Facelift (2 Weeks)

**Scope**: CSS and animations ONLY. No new features, no backend, no third-party scripts.

**Goal**: Improve first impression with polished animations and consistent styling.

### A.1 Hero Section Polish (Days 1-2)

**Changes to** `src/css/components.css`:

```css
/* Hero entrance animation */
.hero-badge {
  animation: heroEntrance 0.6s ease-out;
}

@keyframes heroEntrance {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Rotating word emphasis */
.rotating-highlight [data-words] {
  transition: color 0.3s ease, transform 0.3s ease;
}

/* CTA button micro-interaction */
.cta-button:hover {
  transform: translateY(-3px) scale(1.02);
}

.cta-button:active {
  transform: translateY(0) scale(0.98);
}
```

**Accessibility requirement**:

```css
@media (prefers-reduced-motion: reduce) {
  .hero-badge {
    animation: none;
  }
  .cta-button:hover,
  .cta-button:active {
    transform: none;
  }
}
```

**Testing checklist**:

- [ ] Animation plays on page load
- [ ] Animation respects `prefers-reduced-motion`
- [ ] Works in Light, Dark, Industrial themes
- [ ] Mobile: animation doesn't cause jank
- [ ] Safari iOS: animation plays correctly

### A.2 Card Hover States (Days 3-4)

**Changes to** `src/css/components.css`:

```css
/* Process step cards */
.process-step {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.process-step:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card);
}

/* Testimonial cards */
.testimonial-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.testimonial-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-elevated);
}

/* Pricing cards */
.pricing-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.pricing-card:hover {
  transform: translateY(-4px);
}

.pricing-card.featured:hover {
  border-color: var(--primary-hover);
}
```

**Testing checklist**:

- [ ] Hover states work on all card types
- [ ] No layout shift on hover
- [ ] Transitions are smooth (no jank)
- [ ] Works across all 3 primary themes

### A.3 Navigation Polish (Days 5-6)

**Changes to** `src/css/navigation.css`:

```css
/* Sticky nav with blur */
.nav-wrapper {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  background: rgba(var(--paper-rgb), 0.9);
}

/* Fallback for browsers without backdrop-filter */
@supports not (backdrop-filter: blur(10px)) {
  .nav-wrapper {
    background: var(--paper);
  }
}

/* Active page indicator */
.menu-link[aria-current="page"] {
  color: var(--primary);
  position: relative;
}

.menu-link[aria-current="page"]::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  background: var(--primary);
  border-radius: 50%;
}
```

**Requirement**: Add `--paper-rgb` variable to tokens.css for each theme

**Testing checklist**:

- [ ] Blur effect works (Safari, Chrome, Firefox)
- [ ] Fallback works when blur not supported
- [ ] Active indicator shows on current page
- [ ] Mobile drawer still works

### A.4 Mobile Refinements (Days 7-8)

**Changes to** `src/css/mobile.css`:

```css
/* Ensure touch targets are 44px minimum */
.menu-link,
.mobile-link,
.cta-button,
.pricing-cta {
  min-height: 44px;
  min-width: 44px;
}

/* Process cards stack vertically on mobile */
@media (max-width: 768px) {
  .process-steps {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }

  .testimonials-grid {
    grid-template-columns: 1fr;
  }
}

/* Better spacing on small screens */
@media (max-width: 480px) {
  .section {
    padding: var(--space-md) var(--space-sm);
  }

  .hero-badge {
    padding: var(--space-md);
  }
}
```

**Testing checklist**:

- [ ] Touch targets are 44px+ (use DevTools to measure)
- [ ] Cards stack properly on mobile
- [ ] Spacing looks good on iPhone SE (375px)
- [ ] No horizontal scroll at any breakpoint

### A.5 Theme Consistency (Days 9-10)

**Scope**: Audit Light, Dark, and Industrial themes ONLY. Other themes are "fun" and can have minor issues.

**Audit checklist per theme**:

- [ ] Hero section contrast ratio ≥ 4.5:1
- [ ] Card shadows visible but not harsh
- [ ] CTA button readable
- [ ] Hover states visible
- [ ] Focus states visible

**Tool**: Use Lighthouse accessibility audit

**Changes to** `src/css/tokens.css`:

- Add `--paper-rgb` variable for backdrop-filter
- Verify `--shadow-*` values work in each theme
- Adjust any failing contrast ratios

### A.6 Testing & Documentation (Days 11-14)

**Browser testing matrix** (minimum support):

| Browser | Version | Status |

|---------|---------|--------|

| Chrome | 90+ | Required |

| Firefox | 90+ | Required |

| Safari | 14+ | Required |

| Safari iOS | 14+ | Required |

| Edge | 90+ | Required |

**Testing procedure**:

1. Run `npm run build`
2. Run `npm run dev`
3. Test each page in each browser
4. Screenshot results
5. Fix any issues found

**Documentation updates**:

- [ ] Update CHANGELOG.md with visual changes
- [ ] Update TECH_DEBT.md (mark any resolved items)

**Rollback procedure** (if needed):

```bash
git checkout pre-facelift-baseline
npm run build
npm run deploy
```

---

## Phase A Completion Criteria

Before proceeding to Phase B:

- [ ] All A.1-A.6 testing checklists pass
- [ ] Lighthouse performance score ≥ baseline
- [ ] Lighthouse accessibility score ≥ baseline
- [ ] No regressions in existing functionality
- [ ] Sleep mode still works with new animations
- [ ] Branch merged to main with tag `v0.1.0-facelift`

---

## Phase B: Conversion Features (4 Weeks)

**Scope**: Analytics, contact form, social links, Calendly integration.

**CRITICAL**: This phase involves third-party scripts and backend code. Security is paramount.

### B.1 Analytics Integration (Week 1)

**Choice**: Cloudflare Web Analytics (already have Cloudflare, no extra cost, privacy-friendly)

**Security requirements**:

- No third-party JavaScript (Cloudflare injects via edge)
- No cookies (privacy-friendly)
- No CSP changes needed (edge-injected)

**Setup**:

1. Enable in Cloudflare Dashboard → Analytics → Web Analytics
2. Add site beacon via Cloudflare Pages settings
3. Verify data appears in dashboard

**Testing**:

- [ ] Analytics data appearing in Cloudflare dashboard
- [ ] No JavaScript errors in console
- [ ] Page load time not affected

**Baseline tracking**:

- Document page views before any further changes
- This becomes baseline for measuring conversion features

### B.2 Social Links (Week 1)

**Scope**: Add LinkedIn link to footer. Simple, no security concerns.

**Changes to** `src/index.html` footer:

```html
<div class="footer-links">
    <!-- existing links -->
    <a href="https://linkedin.com/in/christophertavolazzi"
       target="_blank"
       rel="noopener noreferrer"
       aria-label="Christopher Tavolazzi on LinkedIn">
        LinkedIn
    </a>
</div>
```

**Security**: `rel="noopener noreferrer"` prevents tabnabbing

**Testing**:

- [ ] Link opens in new tab
- [ ] Link goes to correct profile
- [ ] No console warnings

### B.3 Contact Form - Design Phase (Week 2)

**CRITICAL SECURITY REQUIREMENT**: Design security BEFORE implementation.

**Security design document** (`_work_efforts/contact_form_security.md`):

#### 3.3.1 Threat Model

| Threat | Mitigation |

|--------|------------|

| CSRF | Origin header validation, SameSite cookies |

| Spam bots | Honeypot field (already exists), rate limiting |

| XSS | Input sanitization, output encoding |

| DoS | Rate limiting (5 req/IP/hour) |

| Injection | Parameterized queries, no eval |

#### 3.3.2 Rate Limiting Design

```javascript
// Cloudflare Worker rate limiting
const RATE_LIMIT = 5; // requests
const RATE_WINDOW = 3600; // seconds (1 hour)

async function checkRateLimit(ip, env) {
  const key = `ratelimit:${ip}`;
  const current = await env.KV.get(key) || 0;

  if (current >= RATE_LIMIT) {
    return false; // Rate limited
  }

  await env.KV.put(key, current + 1, { expirationTtl: RATE_WINDOW });
  return true;
}
```

#### 3.3.3 Input Validation

```javascript
function validateInput(data) {
  const errors = [];

  // Name: 1-100 chars, no HTML
  if (!data.name || data.name.length > 100) {
    errors.push('Invalid name');
  }
  if (/<[^>]*>/g.test(data.name)) {
    errors.push('Invalid characters in name');
  }

  // Email: valid format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    errors.push('Invalid email');
  }

  // Message: 1-5000 chars
  if (!data.message || data.message.length > 5000) {
    errors.push('Message too long');
  }

  // Honeypot: must be empty
  if (data.website) {
    errors.push('Bot detected');
  }

  return errors;
}
```

#### 3.3.4 Error Handling

| Error | User Message | Action |

|-------|-------------|--------|

| Rate limited | "Please try again later" | Show retry time |

| Validation failed | Specific field errors | Highlight fields |

| Worker error | "Something went wrong" | Fallback to mailto |

| KV error | "Something went wrong" | Fallback to mailto |

### B.4 Contact Form - Implementation (Weeks 3-4)

**Frontend** (`src/js/contact-form.js`):

```javascript
const ContactForm = {
  ENDPOINT: 'https://api.fogsift.com/contact', // Cloudflare Worker

  async submit(form) {
    const data = new FormData(form);

    // Check honeypot
    if (data.get('website')) {
      // Bot detected, fake success
      return { success: true };
    }

    try {
      const response = await fetch(this.ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          message: data.get('message'),
        }),
      });

      if (response.status === 429) {
        return { success: false, error: 'rate_limited' };
      }

      if (!response.ok) {
        throw new Error('Server error');
      }

      return await response.json();
    } catch (error) {
      console.error('Contact form error:', error);
      return { success: false, error: 'server_error', fallback: true };
    }
  },

  showFallback() {
    // Fallback to mailto if form fails
    window.location.href = 'mailto:christopher@fogsift.com?subject=Contact%20Form%20Fallback';
  }
};
```

**Backend** (Cloudflare Worker):

```javascript
// workers/contact-form.js
export default {
  async fetch(request, env) {
    // CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': 'https://fogsift.com',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Only POST
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Origin check (CSRF protection)
    const origin = request.headers.get('Origin');
    if (origin !== 'https://fogsift.com') {
      return new Response('Forbidden', { status: 403 });
    }

    // Rate limiting
    const ip = request.headers.get('CF-Connecting-IP');
    if (!await checkRateLimit(ip, env)) {
      return new Response(JSON.stringify({ error: 'rate_limited' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse and validate
    const data = await request.json();
    const errors = validateInput(data);

    if (errors.length > 0) {
      return new Response(JSON.stringify({ errors }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Store submission (or send email via Mailgun/SendGrid)
    await env.SUBMISSIONS.put(
      `${Date.now()}-${ip}`,
      JSON.stringify(data),
      { expirationTtl: 86400 * 30 } // 30 days
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://fogsift.com',
      },
    });
  },
};
```

**CSP Update** (`src/_headers`):

```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://api.fogsift.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://api.fogsift.com
```

**Testing checklist**:

- [ ] Form submits successfully
- [ ] Rate limiting works (test with 6 rapid submissions)
- [ ] Honeypot catches bots (test with filled honeypot)
- [ ] Validation errors display correctly
- [ ] Fallback to mailto works when server unavailable
- [ ] No XSS possible (test with `<script>alert(1)</script>`)

### B.5 Calendly Integration (Week 4, Optional)

**Security considerations**:

- Calendly is iframe-based (sandboxed)
- Requires CSP update for frame-src
- Third-party script needed for popup mode

**Recommendation**: Use link-only integration first (no JavaScript)

**Simple implementation**:

```html
<a href="https://calendly.com/christophertavolazzi/discovery"
   target="_blank"
   rel="noopener noreferrer"
   class="cta-button">
    Book a Call
</a>
```

**If popup mode needed later**:

1. Add SRI hash for Calendly script
2. Update CSP to allow Calendly domain
3. Test thoroughly

---

## Phase B Completion Criteria

- [ ] Analytics showing data in Cloudflare dashboard
- [ ] Contact form working with all security measures
- [ ] Rate limiting verified
- [ ] Honeypot verified
- [ ] Fallback to mailto verified
- [ ] Social links working
- [ ] CSP updated and tested
- [ ] No security warnings in browser console

---

## Rollback Procedures

### Phase A Rollback

```bash
git checkout pre-facelift-baseline
npm run build
npm run deploy
```

### Phase B Rollback (Contact Form)

1. Disable Cloudflare Worker
2. Revert form to mailto links
3. Remove contact-form.js from build

### Phase B Rollback (Full)

```bash
git checkout v0.1.0-facelift  # Phase A complete state
npm run build
npm run deploy
```

---

## Timeline Summary

| Week | Phase | Focus |

|------|-------|-------|

| 0 | Pre-flight | Fix broken assets, baseline metrics |

| 1 | A.1-A.2 | Hero + Card animations |

| 2 | A.3-A.6 | Nav + Mobile + Testing |

| 3 | B.1-B.2 | Analytics + Social links |

| 4 | B.3 | Contact form design |

| 5-6 | B.4 | Contact form implementation |

| 7 | B.5 | Calendly (optional) + Final testing |

**Total**: 7 weeks (more realistic than original 4 weeks)

---

## Removed from Scope

The following items from the original plan are **removed**:

1. **Sound effects** - Scope creep, not a facelift
2. **Full 11-theme audit** - Low ROI, focus on 3 primary themes
3. **CSS file splitting** - Premature optimization, not needed
4. **Source maps in production** - Security risk, dev-only

---

## Success Metrics

### Phase A Success

- Lighthouse Performance: ≥ baseline
- Lighthouse Accessibility: ≥ baseline
- Visual polish visible on first load
- No regressions in existing features

### Phase B Success

- Contact form submission rate > 0
- No spam getting through
- Analytics showing real traffic data
- No security incidents

---

## Documentation Updates Required

- [ ] CHANGELOG.md - Version 0.1.0 (Phase A), 0.2.0 (Phase B)
- [ ] TECH_DEBT.md - Mark resolved items
- [ ] README.md - Update if build process changes
- [ ] CONTINUATION.md - Update with new state

---

## Questions to Resolve Before Starting

1. **Logo**: Which logo file should be the standard? (`logo-color.png`?)
2. **Calendly**: Do you have a Calendly account to integrate?
3. **Contact form destination**: Email to christopher@fogsift.com or store in KV?
4. **Analytics**: Cloudflare Web Analytics okay, or prefer Plausible?

---

*This plan addresses all items from the adversarial critique. Each phase has explicit security measures, testing requirements, and rollback procedures.*