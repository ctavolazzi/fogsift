#!/usr/bin/env node
/**
 * FOGSIFT SITE AUDIT SCRIPT
 *
 * Runs comprehensive checks on the site and records results for tracking.
 * Run: npm run audit
 *
 * Tests:
 * - Security headers validation
 * - JavaScript linting (ESLint)
 * - HTML validation (button types, roles, etc.)
 * - Image size analysis
 * - Inline script detection (CSP risk)
 * - Link validation
 * - Bundle size tracking
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const AUDIT_LOG = path.join(ROOT, 'audit-history.json');

// ANSI colors
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m',
};

function log(msg, color = '') {
    console.log(`${color}${msg}${colors.reset}`);
}

function pass(msg) { log(`  ✅ ${msg}`, colors.green); }
function warn(msg) { log(`  ⚠️  ${msg}`, colors.yellow); }
function fail(msg) { log(`  ❌ ${msg}`, colors.red); }
function info(msg) { log(`  ℹ️  ${msg}`, colors.cyan); }

// Get all HTML files in dist
function getHtmlFiles() {
    const files = [];
    function scan(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                scan(fullPath);
            } else if (entry.name.endsWith('.html')) {
                files.push(fullPath);
            }
        }
    }
    scan(DIST);
    return files;
}

// Get all image files
function getImageFiles() {
    const images = [];
    function scan(dir) {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                scan(fullPath);
            } else if (/\.(png|jpg|jpeg|gif|webp|svg)$/i.test(entry.name)) {
                images.push(fullPath);
            }
        }
    }
    scan(path.join(ROOT, 'src'));
    scan(DIST);
    return [...new Set(images)]; // dedupe
}

// ============================================
// AUDIT CHECKS
// ============================================

function checkSecurityHeaders() {
    log('\n📋 SECURITY HEADERS', colors.bold);
    const headersPath = path.join(DIST, '_headers');
    const results = { pass: 0, warn: 0, fail: 0, issues: [] };

    if (!fs.existsSync(headersPath)) {
        fail('_headers file not found');
        results.fail++;
        results.issues.push('Missing _headers file');
        return results;
    }

    const content = fs.readFileSync(headersPath, 'utf8');
    const required = [
        'Strict-Transport-Security',
        'Content-Security-Policy',
        'X-Frame-Options',
        'X-Content-Type-Options',
        'Referrer-Policy',
    ];

    for (const header of required) {
        if (content.includes(header)) {
            pass(header);
            results.pass++;
        } else {
            fail(`Missing: ${header}`);
            results.fail++;
            results.issues.push(`Missing header: ${header}`);
        }
    }

    return results;
}

function checkJavaScript() {
    log('\n📋 JAVASCRIPT LINT', colors.bold);
    const results = { pass: 0, warn: 0, fail: 0, issues: [] };

    try {
        const output = execSync('npx eslint src/js/*.js --format json 2>/dev/null || true', {
            cwd: ROOT,
            encoding: 'utf8',
        });

        if (!output.trim() || output.trim() === '[]') {
            pass('No lint issues');
            results.pass++;
            return results;
        }

        const eslintResults = JSON.parse(output);
        let errorCount = 0;
        let warningCount = 0;

        for (const file of eslintResults) {
            errorCount += file.errorCount || 0;
            warningCount += file.warningCount || 0;

            for (const msg of file.messages || []) {
                if (msg.severity === 2) {
                    results.issues.push(`${path.basename(file.filePath)}:${msg.line} - ${msg.message}`);
                }
            }
        }

        if (errorCount > 0) {
            fail(`${errorCount} errors found`);
            results.fail += errorCount;
        } else if (warningCount > 0) {
            warn(`${warningCount} warnings found`);
            results.warn += warningCount;
        } else {
            pass('No lint issues');
            results.pass++;
        }
    } catch (e) {
        info('ESLint not configured or failed to run');
        results.warn++;
    }

    return results;
}

function checkHtmlValidation() {
    log('\n📋 HTML VALIDATION', colors.bold);
    const results = { pass: 0, warn: 0, fail: 0, issues: [] };
    const htmlFiles = getHtmlFiles();

    let missingButtonTypes = 0;
    let redundantRoles = 0;
    let inlineStyles = 0;

    for (const file of htmlFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const filename = path.relative(DIST, file);

        // Check for buttons without type="button"
        const buttonMatches = content.match(/<button[^>]*>/g) || [];
        for (const btn of buttonMatches) {
            if (!btn.includes('type=')) {
                missingButtonTypes++;
                if (results.issues.length < 10) {
                    results.issues.push(`${filename}: Button missing type attribute`);
                }
            }
        }

        // Check for redundant role="banner" on <header>
        if (content.includes('<header') && content.includes('role="banner"')) {
            redundantRoles++;
        }

        // Check for inline styles (not in style blocks)
        const inlineStyleMatches = content.match(/style="[^"]*"/g) || [];
        if (inlineStyleMatches.length > 0) {
            inlineStyles += inlineStyleMatches.length;
        }
    }

    if (missingButtonTypes > 0) {
        fail(`${missingButtonTypes} buttons missing type="button"`);
        results.fail++;
    } else {
        pass('All buttons have type attribute');
        results.pass++;
    }

    if (redundantRoles > 0) {
        warn(`${redundantRoles} files with redundant role="banner"`);
        results.warn++;
    } else {
        pass('No redundant ARIA roles');
        results.pass++;
    }

    if (inlineStyles > 5) {
        info(`${inlineStyles} inline styles found (some expected)`);
    }

    return results;
}

function checkImages() {
    log('\n📋 IMAGE ANALYSIS', colors.bold);
    const results = { pass: 0, warn: 0, fail: 0, issues: [] };
    const images = getImageFiles();

    const sizeLimits = {
        'og-image': 200 * 1024,
        'favicon': 50 * 1024,
        'icon-512': 300 * 1024,
        'logo': 100 * 1024,
        'default': 500 * 1024,
    };

    let oversized = 0;
    let totalSize = 0;

    for (const img of images) {
        const stat = fs.statSync(img);
        const filename = path.basename(img);
        totalSize += stat.size;

        // Determine size limit
        let limit = sizeLimits.default;
        for (const [key, val] of Object.entries(sizeLimits)) {
            if (filename.toLowerCase().includes(key)) {
                limit = val;
                break;
            }
        }

        if (stat.size > limit) {
            oversized++;
            if (results.issues.length < 10) {
                results.issues.push(`${filename}: ${(stat.size / 1024).toFixed(0)}KB (max: ${(limit / 1024).toFixed(0)}KB)`);
            }
        }
    }

    if (oversized > 0) {
        fail(`${oversized} oversized images`);
        results.fail++;
    } else {
        pass('All images within size limits');
        results.pass++;
    }

    info(`Total image size: ${(totalSize / 1024 / 1024).toFixed(2)}MB across ${images.length} files`);

    return results;
}

function checkInlineScripts() {
    log('\n📋 INLINE SCRIPTS (CSP)', colors.bold);
    const results = { pass: 0, warn: 0, fail: 0, issues: [] };
    const htmlFiles = getHtmlFiles();

    let filesWithInlineScripts = 0;
    let filesWithOnclick = 0;

    for (const file of htmlFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const filename = path.relative(DIST, file);

        // Check for inline <script> tags (excluding external src scripts)
        const scriptBlocks = content.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
        const inlineScripts = scriptBlocks.filter(s => !s.includes('src='));

        if (inlineScripts.length > 0) {
            filesWithInlineScripts++;
            results.issues.push(`${filename}: ${inlineScripts.length} inline script(s)`);
        }

        // Check for onclick handlers
        const onclickCount = (content.match(/onclick=/gi) || []).length;
        if (onclickCount > 0) {
            filesWithOnclick++;
        }
    }

    if (filesWithInlineScripts > 0) {
        warn(`${filesWithInlineScripts} files with inline scripts (requires 'unsafe-inline')`);
        results.warn++;
    } else {
        pass('No inline scripts');
        results.pass++;
    }

    if (filesWithOnclick > 0) {
        info(`${filesWithOnclick} files with onclick handlers (CSP 'unsafe-inline' needed)`);
    }

    return results;
}

function checkLinks() {
    log('\n📋 LINK VALIDATION', colors.bold);
    const results = { pass: 0, warn: 0, fail: 0, issues: [] };
    const htmlFiles = getHtmlFiles();

    const brokenLinks = new Set();

    for (const file of htmlFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const filename = path.relative(DIST, file);
        const fileDir = path.dirname(file);
        const hrefMatches = content.match(/href="([^"#]+)"/g) || [];

        for (const match of hrefMatches) {
            const href = match.match(/href="([^"#]+)"/)[1];

            // Skip external links
            if (href.startsWith('http')) continue;
            if (href.startsWith('mailto:')) continue;
            if (href.startsWith('tel:')) continue;
            if (href.startsWith('javascript:')) continue;
            if (href.startsWith('data:')) continue;

            // Resolve path - absolute from site root, relative from file location
            let linkPath;
            if (href.startsWith('/')) {
                linkPath = path.join(DIST, href);
            } else {
                linkPath = path.join(fileDir, href);
            }

            if (!fs.existsSync(linkPath)) {
                brokenLinks.add(`${filename} -> ${href}`);
            }
        }
    }

    if (brokenLinks.size > 0) {
        fail(`${brokenLinks.size} broken internal links`);
        results.fail++;
        for (const link of [...brokenLinks].slice(0, 5)) {
            results.issues.push(`Broken: ${link}`);
        }
    } else {
        pass('All internal links valid');
        results.pass++;
    }

    return results;
}

function checkBundleSizes() {
    log('\n📋 BUNDLE SIZES', colors.bold);
    const results = { pass: 0, warn: 0, fail: 0, issues: [], sizes: {} };

    const bundles = [
        { file: 'styles.css', maxSize: 200 * 1024 },
        { file: 'app.js', maxSize: 100 * 1024 },
        { file: 'queue-ui.js', maxSize: 20 * 1024 },
    ];

    for (const bundle of bundles) {
        const filepath = path.join(DIST, bundle.file);
        if (fs.existsSync(filepath)) {
            const stat = fs.statSync(filepath);
            results.sizes[bundle.file] = stat.size;

            if (stat.size > bundle.maxSize) {
                warn(`${bundle.file}: ${(stat.size / 1024).toFixed(1)}KB (max: ${(bundle.maxSize / 1024).toFixed(0)}KB)`);
                results.warn++;
            } else {
                pass(`${bundle.file}: ${(stat.size / 1024).toFixed(1)}KB`);
                results.pass++;
            }
        } else {
            info(`${bundle.file}: not found`);
        }
    }

    return results;
}

// ============================================
// MAIN AUDIT RUNNER
// ============================================

function runAudit() {
    const timestamp = new Date().toISOString();

    log('\n' + '='.repeat(50), colors.bold);
    log('🔍 FOGSIFT SITE AUDIT', colors.bold);
    log(`   ${timestamp}`, colors.cyan);
    log('='.repeat(50), colors.bold);

    const checks = {
        securityHeaders: checkSecurityHeaders(),
        javascript: checkJavaScript(),
        htmlValidation: checkHtmlValidation(),
        images: checkImages(),
        inlineScripts: checkInlineScripts(),
        links: checkLinks(),
        bundleSizes: checkBundleSizes(),
    };

    // Calculate totals
    let totalPass = 0, totalWarn = 0, totalFail = 0;
    const allIssues = [];

    for (const [name, result] of Object.entries(checks)) {
        totalPass += result.pass;
        totalWarn += result.warn;
        totalFail += result.fail;
        allIssues.push(...(result.issues || []).map(i => `[${name}] ${i}`));
    }

    // Summary
    log('\n' + '='.repeat(50), colors.bold);
    log('📊 SUMMARY', colors.bold);
    log('='.repeat(50), colors.bold);

    log(`  Pass: ${totalPass}`, colors.green);
    log(`  Warn: ${totalWarn}`, colors.yellow);
    log(`  Fail: ${totalFail}`, colors.red);

    if (allIssues.length > 0) {
        log('\n📝 Issues to address:', colors.bold);
        for (const issue of allIssues.slice(0, 15)) {
            log(`  - ${issue}`);
        }
        if (allIssues.length > 15) {
            log(`  ... and ${allIssues.length - 15} more`);
        }
    }

    // Save to history
    const auditResult = {
        timestamp,
        summary: { pass: totalPass, warn: totalWarn, fail: totalFail },
        checks,
        issues: allIssues,
    };

    let history = [];
    if (fs.existsSync(AUDIT_LOG)) {
        try {
            history = JSON.parse(fs.readFileSync(AUDIT_LOG, 'utf8'));
        } catch (e) {
            history = [];
        }
    }

    history.push(auditResult);
    // Keep last 50 audits
    if (history.length > 50) {
        history = history.slice(-50);
    }

    fs.writeFileSync(AUDIT_LOG, JSON.stringify(history, null, 2));
    log(`\n💾 Results saved to audit-history.json`, colors.cyan);

    // Return exit code based on failures
    const exitCode = totalFail > 0 ? 1 : 0;
    log(`\n${exitCode === 0 ? '✅' : '❌'} Audit ${exitCode === 0 ? 'passed' : 'failed'}`,
        exitCode === 0 ? colors.green : colors.red);

    return exitCode;
}

// Run the audit
process.exit(runAudit());
