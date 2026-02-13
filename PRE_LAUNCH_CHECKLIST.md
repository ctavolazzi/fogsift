# FogSift Pre-Launch Checklist

**Status:** In Progress
**Target Launch:** TBD
**Last Updated:** 2026-02-13

---

## 🎯 Critical (Must Complete Before Launch)

### Code Quality & Security
- [x] Cookie consent banner centering fixed (all viewports)
- [x] Production console.log statements gated through Debug module
- [x] Canonical URLs normalized across all pages
- [x] Security headers verified (HSTS, CSP, X-Frame-Options, Permissions-Policy)
- [x] Ko-fi webhook has proper token verification and data sanitization
- [x] Queue API sanitizes sensitive data (emails hidden for non-public requests)
- [ ] Run full build locally and verify no errors
- [ ] Test cookie consent banner on mobile devices
- [ ] Verify all theme switching works without console errors
- [ ] Test search functionality across all pages

### Content & Links
- [x] All nav links (7) point to real pages
- [x] All footer links (10) point to real pages
- [x] Legal pages complete (privacy.html, disclaimer.html, terms.html, your-data.html)
- [ ] All wiki pages render correctly (44 pages)
- [ ] Queue submission flow tested end-to-end
- [ ] Ko-fi integration tested with test webhook
- [ ] Contact email (info@fogsift.com) is active and monitored
- [ ] Test all external links (Ko-fi, YouTube, social media)

### Environment Setup
- [ ] Set `KOFI_VERIFICATION_TOKEN` in Cloudflare Pages environment variables
- [ ] Configure Cloudflare KV namespace binding (`QUEUE_KV`)
- [ ] Verify DNS settings point to Cloudflare Pages
- [ ] SSL certificate active and auto-renewing
- [ ] Set up Cloudflare Web Analytics (free tier)

---

## 🚀 High Priority (Should Complete Before Launch)

### Performance & SEO
- [ ] Run Lighthouse audit on key pages (aim for 90+ scores)
- [ ] Verify all images have proper alt text
- [ ] Test page load times on 3G connection
- [ ] Verify og:image displays correctly on social media previews
- [ ] Submit sitemap to Google Search Console
- [ ] Test meta descriptions display correctly in search results

### Mobile Experience
- [ ] Test site on iPhone (Safari)
- [ ] Test site on Android (Chrome)
- [ ] Test theme picker on mobile
- [ ] Test navigation menu on mobile
- [ ] Test search overlay on mobile
- [ ] Verify cookie consent doesn't block content on small screens

### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## ✨ Nice to Have (Can Complete After Launch)

### Features
- [ ] Enable achievement.js (Xbox-style notifications) or remove permanently
- [ ] Enable queue-widget.js (floating queue status) or remove permanently
- [ ] Add queue item progress tracking
- [ ] Implement queue position notifications
- [ ] Add RSS feed for blog/updates

### Analytics & Monitoring
- [ ] Set up error tracking (Sentry or similar)
- [ ] Configure uptime monitoring (UptimeRobot or Cloudflare)
- [ ] Set up conversion tracking for queue submissions
- [ ] Create dashboard for queue metrics

### Documentation
- [ ] Add CONTRIBUTING.md for future contributors
- [ ] Document build process in detail
- [ ] Create video walkthrough of The Lighthouse dev suite
- [ ] Document theme creation process

---

## 🧪 Testing Scenarios

### Local Testing (Before Each Deployment)

1. **Build Verification**
   ```bash
   npm run build
   # Verify no errors, check output for warnings
   ```

2. **Test Suite**
   ```bash
   npm test
   # Aim for 0 failures, <5 warnings
   ```

3. **Visual Regression**
   - Compare homepage with previous snapshot
   - Verify cookie banner alignment
   - Check theme switching

4. **Mobile Preview**
   ```bash
   # Get your local IP
   ifconfig | grep "inet "

   # Open on phone: http://192.168.x.x:5050
   ```

### Production Testing (After Each Deployment)

1. **Smoke Test**
   - [ ] Homepage loads without errors
   - [ ] Navigation works
   - [ ] Search works
   - [ ] Theme switching works
   - [ ] Cookie consent displays and saves preference

2. **Critical Paths**
   - [ ] Queue page loads
   - [ ] Ko-fi payment link works
   - [ ] Contact form/email link works
   - [ ] All legal pages accessible

3. **Performance**
   - [ ] Run Lighthouse on homepage
   - [ ] Check Cloudflare Analytics for errors
   - [ ] Verify CDN cache hit rates

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] All critical items above completed
- [ ] Git branch merged to main
- [ ] Version bumped in package.json
- [ ] CHANGELOG.md updated
- [ ] Team/stakeholders notified

### Deployment
```bash
npm run quick-deploy
# Or: npm run deploy
```

### Post-Deployment
- [ ] Verify homepage loads (https://fogsift.com)
- [ ] Check Cloudflare Pages build logs for errors
- [ ] Test 3-5 random pages for functionality
- [ ] Verify queue API endpoint responds
- [ ] Send test webhook to Ko-fi endpoint
- [ ] Monitor error logs for 1 hour

### Rollback Plan (If Issues Arise)
1. Revert to previous deployment in Cloudflare Pages dashboard
2. Identify issue in logs
3. Fix locally, test, redeploy

---

## 🎉 Launch Day Tasks

1. **Morning of Launch**
   - [ ] Final smoke test on production
   - [ ] Verify all environment variables set
   - [ ] Check email inbox is clear

2. **Announcement**
   - [ ] Post to social media (if applicable)
   - [ ] Send email to waitlist (if applicable)
   - [ ] Update status page

3. **Monitoring**
   - [ ] Watch Cloudflare Analytics for traffic spike
   - [ ] Monitor error logs
   - [ ] Check queue submissions
   - [ ] Respond to any user reports within 1 hour

---

## 📞 Emergency Contacts

- **Hosting:** Cloudflare Pages (cloudflare.com/support)
- **Domain:** [Your registrar]
- **Payment Processing:** Ko-fi (ko-fi.com/support)
- **Email:** [Your email provider]

---

## 📝 Notes

### Recent Improvements (2026-02-13)
- Fixed cookie consent banner centering across all viewports
- Moved console.log statements to Debug module (6 files)
- Normalized canonical URLs across 5 pages
- Archived unused JS files (achievement.js, queue-widget.js)
- Created .env.example for environment variable documentation

### Known Issues (Non-Blocking)
- None currently

### Future Enhancements
- Add vision.html to nav (currently orphaned but complete)
- Consider adding breadcrumb navigation
- Explore adding a blog/updates section
