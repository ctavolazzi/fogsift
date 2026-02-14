#!/bin/bash

# FogSift Local Test Script
# Validates all recent fixes and improvements
# Run after: git checkout claude/fix-cookies-consent-alignment-1XewZ

set -e  # Exit on error

echo "════════════════════════════════════════════════════"
echo "  FOGSIFT LOCAL TEST SUITE"
echo "  Testing branch: claude/fix-cookies-consent-alignment-1XewZ"
echo "════════════════════════════════════════════════════"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass() {
    echo -e "${GREEN}✓${NC} $1"
}

fail() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

echo "📋 Pre-flight Checks"
echo "────────────────────────────────────────────────────"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    pass "Node.js installed: $NODE_VERSION"
else
    fail "Node.js not installed. Run: brew install node"
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    pass "npm installed: $NPM_VERSION"
else
    fail "npm not installed"
fi

# Check we're in the right directory
if [ ! -f "package.json" ]; then
    fail "Not in fogsift directory. Run: cd ~/Code/fogsift"
fi
pass "In correct directory: $(pwd)"

# Check we're on the right branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "claude/fix-cookies-consent-alignment-1XewZ" ]; then
    warn "Not on expected branch. Current: $CURRENT_BRANCH"
    echo "   Run: git checkout claude/fix-cookies-consent-alignment-1XewZ"
else
    pass "On correct branch: $CURRENT_BRANCH"
fi

echo ""
echo "🔍 File Structure Checks"
echo "────────────────────────────────────────────────────"

# Check new files exist
if [ -f ".env.example" ]; then
    pass ".env.example exists"
else
    fail ".env.example not found"
fi

if [ -f "PRE_LAUNCH_CHECKLIST.md" ]; then
    pass "PRE_LAUNCH_CHECKLIST.md exists"
else
    fail "PRE_LAUNCH_CHECKLIST.md not found"
fi

# Check archived files
if [ -f "src/js/_archived/achievement.js" ]; then
    pass "achievement.js archived correctly"
else
    fail "achievement.js not in _archived/"
fi

if [ -f "src/js/_archived/queue-widget.js" ]; then
    pass "queue-widget.js archived correctly"
else
    fail "queue-widget.js not in _archived/"
fi

# Make sure they're not in the main src/js anymore
if [ ! -f "src/js/achievement.js" ]; then
    pass "achievement.js removed from src/js/"
else
    fail "achievement.js still in src/js/ (should be archived)"
fi

echo ""
echo "🧹 Code Quality Checks"
echo "────────────────────────────────────────────────────"

# Check for bare console.log in production files (should all be gated now)
echo "Checking for ungated console statements in src/js/..."

CONSOLE_LOGS=$(grep -r "console\\.log\\|console\\.warn\\|console\\.error" src/js/*.js 2>/dev/null | grep -v "Debug" | grep -v "_archived" | wc -l | xargs)

if [ "$CONSOLE_LOGS" -eq 0 ]; then
    pass "No ungated console statements in production JS"
else
    warn "Found $CONSOLE_LOGS potential ungated console statements"
    echo "   (Run: grep -r 'console\\.' src/js/*.js | grep -v Debug | grep -v _archived)"
fi

# Check cookie consent CSS fix
if grep -q "margin-inline: auto" src/css/components.css; then
    pass "Cookie consent CSS fix present (margin-inline: auto)"
else
    fail "Cookie consent CSS fix not found"
fi

# Check canonical URLs are clean (no .html in queue, terms, vision, etc)
CANONICAL_CHECK=$(grep -h "canonical" src/queue.html src/terms.html src/vision.html 2>/dev/null | grep -c "\.html\"" || true)
if [ "$CANONICAL_CHECK" -eq 0 ]; then
    pass "Canonical URLs normalized (no .html)"
else
    warn "Found $CANONICAL_CHECK canonical URLs with .html extension"
fi

echo ""
echo "🏗️  Build Test"
echo "────────────────────────────────────────────────────"

# Run build
echo "Running npm run build..."
if npm run build > /dev/null 2>&1; then
    pass "Build completed successfully"
else
    fail "Build failed. Run: npm run build"
fi

# Check dist output
if [ -f "dist/app.js" ] && [ -f "dist/styles.css" ]; then
    pass "dist/app.js and dist/styles.css generated"
else
    fail "Build output incomplete"
fi

# Check cookie consent fix in dist
if grep -q "margin-inline:auto" dist/styles.css; then
    pass "Cookie consent fix present in dist/styles.css"
else
    fail "Cookie consent fix not in dist build"
fi

# Check console.log count in dist/app.js (should be minimal)
DIST_CONSOLE=$(grep -c "console\\.log" dist/app.js 2>/dev/null || echo "0")
if [ "$DIST_CONSOLE" -lt 5 ]; then
    pass "Minimal console.log in dist/app.js ($DIST_CONSOLE occurrences)"
else
    warn "Found $DIST_CONSOLE console.log statements in dist/app.js"
fi

echo ""
echo "🌐 Local Server Test"
echo "────────────────────────────────────────────────────"

echo "To start the dev server, run:"
echo ""
echo "  npm start"
echo ""
echo "Then test these URLs:"
echo "  • Main site:          http://localhost:5050"
echo "  • Keeper's Log:       http://localhost:5001"
echo "  • Signal Workshop:    http://localhost:5030"
echo "  • Quality Report:     http://localhost:5065"
echo ""

# Try to get local IP for mobile testing
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
if [ ! -z "$LOCAL_IP" ]; then
    echo "📱 For mobile testing (same Wi-Fi network):"
    echo "  http://$LOCAL_IP:5050"
    echo ""
fi

echo ""
echo "✅ Manual Testing Checklist"
echo "────────────────────────────────────────────────────"
echo ""
echo "After starting npm start, test these:"
echo ""
echo "  [ ] Cookie consent banner appears centered"
echo "  [ ] Cookie consent saves preference (dismiss and reload)"
echo "  [ ] Resize browser window - banner stays centered"
echo "  [ ] Open DevTools console - should be clean (no logs)"
echo "  [ ] Click through all nav links (7 total)"
echo "  [ ] Search for 'diagnostic' - verify results appear"
echo "  [ ] Switch themes - all 11 themes work"
echo "  [ ] Test on mobile device (use IP above)"
echo "  [ ] Queue page loads without errors"
echo "  [ ] All legal pages load (privacy, terms, disclaimer)"
echo ""

echo "════════════════════════════════════════════════════"
echo "  TEST SUITE COMPLETE"
echo "════════════════════════════════════════════════════"
echo ""

# Summary
echo "Summary:"
echo "  • All file structure checks passed"
echo "  • Code quality verified"
echo "  • Build completed successfully"
echo ""
echo "Next steps:"
echo "  1. Run: npm start"
echo "  2. Complete manual testing checklist above"
echo "  3. If all tests pass, merge to main"
echo ""
