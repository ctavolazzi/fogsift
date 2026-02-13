# FogSift Visual Testing Checklist

**Purpose:** Visual and functional testing after pulling `claude/fix-cookies-consent-alignment-1XewZ`

**Time Required:** ~15-20 minutes

**Prerequisites:**
```bash
cd ~/Code/fogsift
git checkout claude/fix-cookies-consent-alignment-1XewZ
npm install
npm start
```

---

## 🎯 Critical Tests (Must Pass)

### 1. Cookie Consent Banner Alignment ⭐ PRIMARY FIX

**Test:** Cookie banner centers correctly on all viewport sizes

- [ ] **Desktop (wide):** Open http://localhost:5050 in browser
  - [ ] Clear localStorage: DevTools → Application → Local Storage → Clear All
  - [ ] Refresh page
  - [ ] Cookie banner appears at bottom center
  - [ ] Banner is horizontally centered (equal space left/right)
  - [ ] Click "Accept" - banner fades out smoothly

- [ ] **Desktop (narrow):** Resize browser to ~600px wide
  - [ ] Clear localStorage again
  - [ ] Refresh page
  - [ ] Banner still centered (not touching edges)
  - [ ] Banner width adapts responsively

- [ ] **Mobile device:** Open http://YOUR_LOCAL_IP:5050 on phone
  - [ ] Banner appears centered at bottom
  - [ ] Banner fits screen with proper padding
  - [ ] Text is readable
  - [ ] Buttons are tappable
  - [ ] Accepting/declining saves preference

**Expected Result:** Banner stays perfectly centered in all cases. No more left-edge misalignment!

---

### 2. Production Console Cleanliness ⭐ PRIMARY FIX

**Test:** Browser console should be clean (no debug logs)

- [ ] Open DevTools Console (F12 or Cmd+Option+I)
- [ ] Refresh homepage
- [ ] Navigate to 2-3 different pages
- [ ] Click through nav links
- [ ] Trigger search overlay
- [ ] Switch themes

**Expected Result:**
- ✅ Console is clean (no `console.log`, `console.warn` spam)
- ✅ Only intentional messages (easter eggs, bot detection are OK)
- ✅ No "Queue loaded from API" or "API unavailable" messages

**To verify Debug mode works:**
```javascript
// In browser console, type:
localStorage.setItem('fogsift_debug', 'true');
location.reload();
// Now you should see styled debug messages
```

---

### 3. Canonical URLs Normalized ⭐ PRIMARY FIX

**Test:** View source on key pages

- [ ] Open http://localhost:5050/queue → View Source (Cmd+Option+U)
  - [ ] Find `<link rel="canonical">`
  - [ ] Should be: `https://fogsift.com/queue` (NO .html)

- [ ] Open http://localhost:5050/terms → View Source
  - [ ] Canonical: `https://fogsift.com/terms` (NO .html)

- [ ] Open http://localhost:5050/vision → View Source
  - [ ] Canonical: `https://fogsift.com/vision` (NO .html)

**Expected Result:** All canonicals use clean URLs (no `.html` extension)

---

## 🧪 Functional Tests

### Navigation

- [ ] **Top nav (7 links):** All load without errors
  - [ ] About
  - [ ] Offers
  - [ ] Queue
  - [ ] Wiki
  - [ ] Portfolio
  - [ ] FAQ
  - [ ] Contact

- [ ] **Footer (10 links):** All load correctly
  - [ ] Home, Offers, Queue, FAQ, Portfolio, Wiki
  - [ ] Contact, Privacy, Disclaimer, Your Data

### Search

- [ ] Click search icon in nav (or press `/`)
- [ ] Search overlay appears with fade-in animation
- [ ] Type "diagnostic" in search box
- [ ] Results appear (wiki pages)
- [ ] Click a result - loads correct page
- [ ] Press ESC - overlay closes

### Theme System

**Test all 11 themes:**

- [ ] Light (default)
- [ ] Dark
- [ ] Synthwave
- [ ] Ocean
- [ ] Aurora
- [ ] Barbie
- [ ] Rivendell
- [ ] Pip-Boy
- [ ] Matrix
- [ ] Industrial
- [ ] Camo

**For each theme:**
- [ ] Theme applies instantly
- [ ] Colors change across whole page
- [ ] Toast notification shows theme name
- [ ] No console errors
- [ ] Preference persists on refresh

**Test demo mode:**
- [ ] Select "Demo Mode" from theme picker
- [ ] Themes cycle every 4 seconds
- [ ] Toast shows "DEMO: [THEME NAME]"
- [ ] Can exit demo by selecting a specific theme

### Queue Page

- [ ] Load http://localhost:5050/queue
- [ ] Page renders without errors
- [ ] Queue items display (sample data or live API)
- [ ] Ko-fi button/link is present
- [ ] Stats show: Pending, In Progress, Completed counts

### Wiki

- [ ] Load http://localhost:5050/wiki/
- [ ] Wiki index loads
- [ ] Click a few wiki articles
- [ ] All articles render with proper styling
- [ ] No broken images
- [ ] Internal wiki links work

---

## 📱 Mobile Specific Tests

**On physical device (same Wi-Fi):**

### Get your local IP:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
# Example: 192.168.1.123
```

### Open on phone: `http://192.168.1.123:5050`

- [ ] **Navigation Menu**
  - [ ] Hamburger menu opens/closes smoothly
  - [ ] All nav links tappable
  - [ ] Theme picker works on mobile

- [ ] **Cookie Consent** (THE BIG ONE)
  - [ ] Banner appears centered at bottom
  - [ ] Doesn't cover nav or content
  - [ ] Both buttons are tappable
  - [ ] Preference saves on dismiss

- [ ] **Search Overlay**
  - [ ] Opens correctly on mobile
  - [ ] Search input is tappable
  - [ ] Results are scrollable
  - [ ] Close button works

- [ ] **Content Scrolling**
  - [ ] Pages scroll smoothly
  - [ ] No layout shift
  - [ ] Fixed nav stays in place

- [ ] **Orientation Test**
  - [ ] Rotate device to landscape
  - [ ] Cookie banner still centered
  - [ ] Nav adapts correctly

---

## 🎨 Visual Regression Checks

### Layout & Spacing

- [ ] **Homepage**
  - [ ] Hero section displays correctly
  - [ ] Cards/content blocks aligned
  - [ ] Proper spacing between sections
  - [ ] Footer at bottom (not floating)

- [ ] **Queue Page**
  - [ ] Queue items have consistent spacing
  - [ ] Cards align properly
  - [ ] No overflow or cutoff text

### Typography

- [ ] Headings use correct font (JetBrains Mono)
- [ ] Body text is readable (good contrast)
- [ ] Code blocks use monospace font
- [ ] No font loading flash (FOUT)

### Images

- [ ] All images load correctly
- [ ] No broken image icons
- [ ] Images have proper alt text (right-click → Inspect)
- [ ] Responsive images scale correctly

---

## 🚨 Error Testing

### Network Failures

- [ ] Open DevTools → Network tab
- [ ] Set throttling to "Offline"
- [ ] Try to load queue page
  - [ ] Should show sample data (not crash)
  - [ ] Debug console should log (if enabled)
  - [ ] No uncaught errors

- [ ] Set back to "Online"
- [ ] Page recovers correctly

### JavaScript Errors

- [ ] Check console for any red errors
- [ ] Try unusual interactions:
  - [ ] Rapid theme switching
  - [ ] Opening/closing search repeatedly
  - [ ] Spamming navigation
  - [ ] No crashes or freezes

---

## ✅ Final Checklist

Before merging to main, confirm:

- [ ] All critical tests passed
- [ ] Cookie consent is perfectly centered (desktop + mobile)
- [ ] Console is clean in production
- [ ] Canonical URLs are normalized
- [ ] No console errors anywhere
- [ ] Mobile experience is solid
- [ ] All themes work correctly
- [ ] Search functions properly
- [ ] Navigation is smooth
- [ ] Build completed without errors (`npm run build`)

---

## 🐛 If You Find Issues

**Minor issues (non-blocking):**
- Document in GitHub issue
- Note in PRE_LAUNCH_CHECKLIST.md

**Critical issues (blocks launch):**
1. Take screenshot
2. Note reproduction steps
3. Check browser console for errors
4. Report back to session

---

## 📝 Test Results Template

Copy this and fill it out:

```
VISUAL TEST RESULTS
Date: ____________________
Tester: __________________
Browser: _________________
OS: ______________________

Critical Tests:
  Cookie Consent Centering:  [ PASS / FAIL ]
  Console Cleanliness:       [ PASS / FAIL ]
  Canonical URLs:            [ PASS / FAIL ]

Functional Tests:
  Navigation:                [ PASS / FAIL ]
  Search:                    [ PASS / FAIL ]
  Themes:                    [ PASS / FAIL ]
  Queue Page:                [ PASS / FAIL ]
  Wiki:                      [ PASS / FAIL ]

Mobile Tests:
  Cookie Banner:             [ PASS / FAIL ]
  Navigation:                [ PASS / FAIL ]
  Responsiveness:            [ PASS / FAIL ]

Issues Found:
  1. _______________________________
  2. _______________________________
  3. _______________________________

Overall Status: [ READY TO MERGE / NEEDS WORK ]
```

---

**Good luck! 🚀**
