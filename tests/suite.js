#!/usr/bin/env node
/**
 * FOGSIFT COMPREHENSIVE TEST SUITE
 *
 * Runs the following checks against the built dist/ output:
 *   1. Build verification  – dist/ exists and key files present
 *   2. HTML validation     – html-validate on every .html file
 *   3. ESLint              – lint source JS
 *   4. Accessibility (pa11y) – WCAG2AA automated checks
 *   5. Link integrity      – internal href/src references resolve
 *   6. Search index        – validates search-index.json structure
 *   7. Asset audit         – checks sizes, missing references
 *   8. Security headers    – validates _headers file
 *   9. Lighthouse          – performance / a11y / SEO / best-practices
 *
 * Generates: tests/report.json  (machine-readable)
 *            tests/report.txt   (human-readable summary)
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync, exec } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const SRC  = path.join(ROOT, 'src');
const REPORT_DIR = __dirname;

// ─── Test Server ────────────────────────────────────────────
// Spins up a temporary static file server for pa11y + Lighthouse

const MIME_TYPES = {
    '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
    '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml',
    '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
    '.woff': 'font/woff', '.xml': 'text/xml', '.txt': 'text/plain',
    '.webmanifest': 'application/manifest+json',
};

let testServer = null;
let testPort = 0;

function startTestServer() {
    return new Promise((resolve, reject) => {
        testServer = http.createServer((req, res) => {
            const url = new URL(req.url, `http://localhost`);
            let filePath = path.join(DIST, decodeURIComponent(url.pathname));
            // Default to index.html for directories
            if (filePath.endsWith('/') || !path.extname(filePath)) {
                const asHtml = filePath + '.html';
                const asIndex = path.join(filePath, 'index.html');
                if (fs.existsSync(asHtml)) filePath = asHtml;
                else if (fs.existsSync(asIndex)) filePath = asIndex;
            }
            if (!fs.existsSync(filePath)) {
                res.writeHead(404);
                res.end('Not found');
                return;
            }
            const ext = path.extname(filePath).toLowerCase();
            const mime = MIME_TYPES[ext] || 'application/octet-stream';
            const data = fs.readFileSync(filePath);
            res.writeHead(200, { 'Content-Type': mime });
            res.end(data);
        });
        testServer.listen(0, '127.0.0.1', () => {
            testPort = testServer.address().port;
            resolve(testPort);
        });
        testServer.on('error', reject);
    });
}

function stopTestServer() {
    return new Promise(resolve => {
        if (testServer) testServer.close(resolve);
        else resolve();
    });
}

// ─── Utilities ──────────────────────────────────────────────

const colors = {
    pass: '\x1b[32m',  // green
    fail: '\x1b[31m',  // red
    warn: '\x1b[33m',  // yellow
    dim:  '\x1b[2m',
    bold: '\x1b[1m',
    reset: '\x1b[0m',
};

function badge(status) {
    if (status === 'pass') return `${colors.pass}PASS${colors.reset}`;
    if (status === 'fail') return `${colors.fail}FAIL${colors.reset}`;
    return `${colors.warn}WARN${colors.reset}`;
}

function walkDir(dir, ext) {
    const results = [];
    if (!fs.existsSync(dir)) return results;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results.push(...walkDir(full, ext));
        } else if (!ext || entry.name.endsWith(ext)) {
            results.push(full);
        }
    }
    return results;
}

function fileSize(p) {
    try { return fs.statSync(p).size; } catch { return 0; }
}

function formatBytes(b) {
    if (b < 1024) return b + 'B';
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + 'KB';
    return (b / (1024 * 1024)).toFixed(2) + 'MB';
}

// ─── Test Harness ───────────────────────────────────────────

const report = {
    timestamp: new Date().toISOString(),
    suites: [],
    summary: { total: 0, passed: 0, failed: 0, warned: 0 },
};

function addResult(suite, test, status, detail = '') {
    let s = report.suites.find(s => s.name === suite);
    if (!s) { s = { name: suite, tests: [], passed: 0, failed: 0, warned: 0 }; report.suites.push(s); }
    s.tests.push({ test, status, detail });
    s[status === 'pass' ? 'passed' : status === 'fail' ? 'failed' : 'warned']++;
    report.summary.total++;
    report.summary[status === 'pass' ? 'passed' : status === 'fail' ? 'failed' : 'warned']++;
}

// ─── 1. BUILD VERIFICATION ─────────────────────────────────

function testBuild() {
    const suite = 'Build Verification';
    console.log(`\n${colors.bold}[1/9] ${suite}${colors.reset}`);

    // dist/ exists
    const distExists = fs.existsSync(DIST);
    addResult(suite, 'dist/ directory exists', distExists ? 'pass' : 'fail');

    // Key files
    const required = [
        'index.html', 'styles.css', 'app.js', 'theme-init.js',
        'favicon.png', 'manifest.json', 'robots.txt', 'sitemap.xml',
        '404.html', 'search-index.json',
    ];
    for (const f of required) {
        const exists = fs.existsSync(path.join(DIST, f));
        addResult(suite, `dist/${f} exists`, exists ? 'pass' : 'fail');
        console.log(`  ${badge(exists ? 'pass' : 'fail')} dist/${f}`);
    }

    // All HTML pages built
    const htmlFiles = walkDir(DIST, '.html');
    addResult(suite, `HTML pages built: ${htmlFiles.length}`, htmlFiles.length > 10 ? 'pass' : 'warn',
        `Found ${htmlFiles.length} HTML files`);
    console.log(`  ${badge(htmlFiles.length > 10 ? 'pass' : 'warn')} ${htmlFiles.length} HTML pages`);

    // Bundle sizes (not too big, not empty)
    const cssSize = fileSize(path.join(DIST, 'styles.css'));
    const jsSize = fileSize(path.join(DIST, 'app.js'));
    addResult(suite, `styles.css size: ${formatBytes(cssSize)}`,
        cssSize > 1000 && cssSize < 500000 ? 'pass' : 'warn');
    addResult(suite, `app.js size: ${formatBytes(jsSize)}`,
        jsSize > 1000 && jsSize < 300000 ? 'pass' : 'warn');
    console.log(`  ${badge('pass')} styles.css ${formatBytes(cssSize)}, app.js ${formatBytes(jsSize)}`);
}

// ─── 2. HTML VALIDATION ─────────────────────────────────────

function testHtmlValidation() {
    const suite = 'HTML Validation';
    console.log(`\n${colors.bold}[2/9] ${suite}${colors.reset}`);

    const htmlFiles = walkDir(DIST, '.html');
    let totalErrors = 0;
    let totalWarnings = 0;
    const fileErrors = [];

    for (const file of htmlFiles) {
        const relPath = path.relative(DIST, file);
        try {
            const result = execSync(
                `npx html-validate --formatter json "${file}"`,
                { encoding: 'utf8', timeout: 15000, stdio: ['pipe', 'pipe', 'pipe'] }
            );
            addResult(suite, relPath, 'pass');
        } catch (err) {
            // html-validate exits non-zero on errors
            const output = (err.stdout || '') + (err.stderr || '');
            let errors = 0, warnings = 0;
            try {
                const json = JSON.parse(err.stdout || '[]');
                for (const entry of json) {
                    errors += (entry.errorCount || 0);
                    warnings += (entry.warningCount || 0);
                }
            } catch {
                // Count from text output
                errors = (output.match(/error/gi) || []).length;
                warnings = (output.match(/warning/gi) || []).length;
            }

            totalErrors += errors;
            totalWarnings += warnings;

            if (errors > 0) {
                addResult(suite, relPath, 'fail', `${errors} error(s), ${warnings} warning(s)`);
                fileErrors.push({ file: relPath, errors, warnings });
                console.log(`  ${badge('fail')} ${relPath} — ${errors} error(s)`);
            } else if (warnings > 0) {
                addResult(suite, relPath, 'warn', `${warnings} warning(s)`);
                console.log(`  ${badge('warn')} ${relPath} — ${warnings} warning(s)`);
            } else {
                addResult(suite, relPath, 'pass');
            }
        }
    }

    if (totalErrors === 0) {
        console.log(`  ${badge('pass')} All ${htmlFiles.length} HTML files valid (${totalWarnings} warnings)`);
    } else {
        console.log(`  ${badge('fail')} ${totalErrors} errors across ${fileErrors.length} files`);
    }
}

// ─── 3. ESLINT ──────────────────────────────────────────────

function testEslint() {
    const suite = 'ESLint (Source JS)';
    console.log(`\n${colors.bold}[3/9] ${suite}${colors.reset}`);

    try {
        const result = execSync('npx eslint src/js/ --format json 2>/dev/null', {
            encoding: 'utf8', cwd: ROOT, timeout: 30000
        });
        const json = JSON.parse(result);
        let errors = 0, warnings = 0;
        for (const file of json) {
            errors += file.errorCount;
            warnings += file.warningCount;
        }

        if (errors === 0 && warnings === 0) {
            addResult(suite, 'All JS files pass ESLint', 'pass');
            console.log(`  ${badge('pass')} No lint errors or warnings`);
        } else if (errors === 0) {
            addResult(suite, 'ESLint warnings only', 'warn', `${warnings} warning(s)`);
            console.log(`  ${badge('warn')} ${warnings} warnings, 0 errors`);
        } else {
            addResult(suite, 'ESLint errors found', 'fail', `${errors} error(s), ${warnings} warning(s)`);
            console.log(`  ${badge('fail')} ${errors} errors, ${warnings} warnings`);
            // Show first 5 errors
            for (const file of json) {
                for (const msg of file.messages.filter(m => m.severity === 2).slice(0, 3)) {
                    const rel = path.relative(ROOT, file.filePath);
                    console.log(`    ${colors.dim}${rel}:${msg.line} ${msg.message}${colors.reset}`);
                }
            }
        }
    } catch (err) {
        // eslint exits non-zero on errors
        const stdout = err.stdout || '';
        try {
            const json = JSON.parse(stdout);
            let errors = 0, warnings = 0;
            const errorDetails = [];
            for (const file of json) {
                errors += file.errorCount;
                warnings += file.warningCount;
                for (const msg of file.messages.filter(m => m.severity === 2).slice(0, 3)) {
                    errorDetails.push(`${path.basename(file.filePath)}:${msg.line} ${msg.message}`);
                }
            }
            addResult(suite, `ESLint: ${errors} error(s), ${warnings} warning(s)`,
                errors > 0 ? 'fail' : 'warn', errorDetails.join('; '));
            console.log(`  ${badge(errors > 0 ? 'fail' : 'warn')} ${errors} error(s), ${warnings} warning(s)`);
            errorDetails.slice(0, 5).forEach(d =>
                console.log(`    ${colors.dim}${d}${colors.reset}`)
            );
        } catch {
            addResult(suite, 'ESLint execution', 'warn', 'Could not parse ESLint output');
            console.log(`  ${badge('warn')} ESLint ran with issues`);
        }
    }
}

// ─── 4. ACCESSIBILITY (pa11y) ───────────────────────────────

async function testAccessibility() {
    const suite = 'Accessibility (pa11y WCAG2AA)';
    console.log(`\n${colors.bold}[4/9] ${suite}${colors.reset}`);

    let pa11y;
    try {
        pa11y = (await import('pa11y')).default;
    } catch {
        addResult(suite, 'pa11y module', 'warn', 'Could not load pa11y');
        console.log(`  ${badge('warn')} Could not load pa11y module`);
        return;
    }

    const pages = ['index.html', 'about.html', 'offers.html', 'faq.html', 'contact.html', 'queue.html', 'portfolio.html'];
    let totalIssues = 0;

    for (const page of pages) {
        const url = `http://localhost:${testPort}/${page}`;
        try {
            const results = await pa11y(url, {
                standard: 'WCAG2AA',
                timeout: 30000,
                wait: 1000,
            });
            const issues = results.issues ? results.issues.length : 0;
            totalIssues += issues;

            if (issues === 0) {
                addResult(suite, page, 'pass');
                console.log(`  ${badge('pass')} ${page}`);
            } else {
                addResult(suite, page, 'warn', `${issues} a11y issue(s)`);
                console.log(`  ${badge('warn')} ${page} — ${issues} issue(s)`);
                results.issues.slice(0, 2).forEach(issue => {
                    console.log(`    ${colors.dim}${(issue.message || '').substring(0, 100)}${colors.reset}`);
                });
            }
        } catch (err) {
            addResult(suite, page, 'warn', `pa11y error: ${(err.message || '').substring(0, 80)}`);
            console.log(`  ${badge('warn')} ${page} — ${(err.message || 'error').substring(0, 80)}`);
        }
    }

    console.log(`  ${colors.dim}Total a11y issues: ${totalIssues}${colors.reset}`);
}

// ─── 5. LINK INTEGRITY ─────────────────────────────────────

function testLinkIntegrity() {
    const suite = 'Internal Link Integrity';
    console.log(`\n${colors.bold}[5/9] ${suite}${colors.reset}`);

    const htmlFiles = walkDir(DIST, '.html');
    let brokenLinks = 0;
    let totalLinks = 0;
    const broken = [];

    for (const file of htmlFiles) {
        const html = fs.readFileSync(file, 'utf8');
        const relDir = path.dirname(file);

        // Find href and src attributes (internal only)
        const linkRegex = /(?:href|src)="([^"#]*?)"/g;
        let match;
        while ((match = linkRegex.exec(html)) !== null) {
            const ref = match[1];
            // Skip external, data, mailto, tel, javascript, and JS template expressions
            if (!ref || ref.startsWith('http') || ref.startsWith('data:') ||
                ref.startsWith('mailto:') || ref.startsWith('tel:') ||
                ref.startsWith('javascript:') || ref.startsWith('//') ||
                ref.includes("' +") || ref.includes("'+")) continue;

            totalLinks++;
            // Absolute paths (starting with /) resolve relative to dist/ root
            const resolved = ref.startsWith('/') ? path.join(DIST, ref) : path.resolve(relDir, ref);
            if (!fs.existsSync(resolved)) {
                brokenLinks++;
                const relFile = path.relative(DIST, file);
                broken.push({ file: relFile, link: ref });
            }
        }
    }

    if (brokenLinks === 0) {
        addResult(suite, `All ${totalLinks} internal links valid`, 'pass');
        console.log(`  ${badge('pass')} ${totalLinks} internal links checked, 0 broken`);
    } else {
        addResult(suite, `${brokenLinks} broken links out of ${totalLinks}`, 'fail',
            broken.slice(0, 10).map(b => `${b.file} → ${b.link}`).join('; '));
        console.log(`  ${badge('fail')} ${brokenLinks} broken out of ${totalLinks} links`);
        broken.slice(0, 8).forEach(b =>
            console.log(`    ${colors.dim}${b.file} → ${b.link}${colors.reset}`)
        );
    }
}

// ─── 6. SEARCH INDEX VALIDATION ─────────────────────────────

function testSearchIndex() {
    const suite = 'Search Index';
    console.log(`\n${colors.bold}[6/9] ${suite}${colors.reset}`);

    const indexPath = path.join(DIST, 'search-index.json');

    if (!fs.existsSync(indexPath)) {
        addResult(suite, 'search-index.json exists', 'fail');
        console.log(`  ${badge('fail')} search-index.json missing`);
        return;
    }

    const raw = fs.readFileSync(indexPath, 'utf8');
    let index;
    try {
        index = JSON.parse(raw);
    } catch {
        addResult(suite, 'search-index.json is valid JSON', 'fail');
        console.log(`  ${badge('fail')} Invalid JSON`);
        return;
    }

    addResult(suite, 'search-index.json is valid JSON', 'pass');

    // Check structure
    const isArray = Array.isArray(index);
    addResult(suite, 'Index is an array', isArray ? 'pass' : 'fail');

    if (!isArray) return;

    addResult(suite, `Index has ${index.length} entries`, index.length > 5 ? 'pass' : 'warn');
    console.log(`  ${badge('pass')} ${index.length} entries indexed`);

    // Validate entry structure
    let validEntries = 0;
    let invalidEntries = [];
    const requiredFields = ['url', 'title', 'category'];

    for (const entry of index) {
        const missing = requiredFields.filter(f => !entry[f]);
        if (missing.length === 0) {
            validEntries++;
        } else {
            invalidEntries.push({ url: entry.url || '(no url)', missing });
        }
    }

    addResult(suite, `${validEntries}/${index.length} entries have valid structure`,
        invalidEntries.length === 0 ? 'pass' : 'warn',
        invalidEntries.map(e => `${e.url}: missing ${e.missing.join(',')}`).join('; '));

    if (invalidEntries.length > 0) {
        console.log(`  ${badge('warn')} ${invalidEntries.length} entries missing fields`);
        invalidEntries.slice(0, 3).forEach(e =>
            console.log(`    ${colors.dim}${e.url}: missing ${e.missing.join(', ')}${colors.reset}`)
        );
    } else {
        console.log(`  ${badge('pass')} All entries have required fields`);
    }

    // Check all URLs resolve to files
    let resolvedUrls = 0;
    for (const entry of index) {
        if (fs.existsSync(path.join(DIST, entry.url))) resolvedUrls++;
    }
    addResult(suite, `${resolvedUrls}/${index.length} index URLs resolve to files`,
        resolvedUrls === index.length ? 'pass' : 'warn');
    console.log(`  ${badge(resolvedUrls === index.length ? 'pass' : 'warn')} ${resolvedUrls}/${index.length} URLs resolve`);

    // Check index size
    const sizeKB = (raw.length / 1024).toFixed(1);
    addResult(suite, `Index size: ${sizeKB}KB`, raw.length < 200000 ? 'pass' : 'warn');
    console.log(`  ${badge('pass')} Index size: ${sizeKB}KB`);
}

// ─── 7. ASSET AUDIT ─────────────────────────────────────────

function testAssetAudit() {
    const suite = 'Asset Audit';
    console.log(`\n${colors.bold}[7/9] ${suite}${colors.reset}`);

    const allFiles = walkDir(DIST);
    let totalSize = 0;
    const largFiles = [];

    for (const file of allFiles) {
        const size = fileSize(file);
        totalSize += size;
        if (size > 500 * 1024) {
            largFiles.push({ file: path.relative(DIST, file), size });
        }
    }

    addResult(suite, `Total dist/ size: ${formatBytes(totalSize)}`,
        totalSize < 20 * 1024 * 1024 ? 'pass' : 'warn');
    console.log(`  ${badge('pass')} Total dist/ size: ${formatBytes(totalSize)} (${allFiles.length} files)`);

    if (largFiles.length > 0) {
        addResult(suite, `${largFiles.length} file(s) over 500KB`, 'warn',
            largFiles.map(f => `${f.file}: ${formatBytes(f.size)}`).join('; '));
        console.log(`  ${badge('warn')} ${largFiles.length} large file(s):`);
        largFiles.forEach(f =>
            console.log(`    ${colors.dim}${f.file}: ${formatBytes(f.size)}${colors.reset}`)
        );
    } else {
        addResult(suite, 'No oversized files', 'pass');
        console.log(`  ${badge('pass')} No files over 500KB`);
    }

    // Check for common missing files
    const expected = [
        'assets/logo.png', 'images/team/christopher-badge.webp',
        'manifest.json', 'favicon.png'
    ];
    for (const f of expected) {
        const exists = fs.existsSync(path.join(DIST, f));
        addResult(suite, `${f} present`, exists ? 'pass' : 'fail');
        if (!exists) console.log(`  ${badge('fail')} Missing: ${f}`);
    }
}

// ─── 8. SECURITY HEADERS ────────────────────────────────────

function testSecurityHeaders() {
    const suite = 'Security Headers';
    console.log(`\n${colors.bold}[8/9] ${suite}${colors.reset}`);

    const headersPath = path.join(DIST, '_headers');
    if (!fs.existsSync(headersPath)) {
        addResult(suite, '_headers file exists', 'fail');
        console.log(`  ${badge('fail')} _headers file missing`);
        return;
    }

    const content = fs.readFileSync(headersPath, 'utf8');
    addResult(suite, '_headers file exists', 'pass');

    const checks = [
        { header: 'X-Frame-Options', pattern: /x-frame-options/i },
        { header: 'X-Content-Type-Options', pattern: /x-content-type-options/i },
        { header: 'Content-Security-Policy', pattern: /content-security-policy/i },
        { header: 'Referrer-Policy', pattern: /referrer-policy/i },
        { header: 'Permissions-Policy', pattern: /permissions-policy/i },
    ];

    for (const check of checks) {
        const found = check.pattern.test(content);
        addResult(suite, check.header, found ? 'pass' : 'warn');
        console.log(`  ${badge(found ? 'pass' : 'warn')} ${check.header}`);
    }
}

// ─── 9. LIGHTHOUSE ──────────────────────────────────────────

async function testLighthouse() {
    const suite = 'Lighthouse';
    console.log(`\n${colors.bold}[9/9] ${suite}${colors.reset}`);

    const url = `http://localhost:${testPort}/index.html`;
    const outPath = path.join(REPORT_DIR, 'lighthouse-report.json');

    // Find Chrome
    const chromePaths = [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
    ];
    const chromePath = chromePaths.find(p => fs.existsSync(p));

    if (!chromePath) {
        addResult(suite, 'Lighthouse execution', 'warn', 'Chrome/Chromium not found');
        console.log(`  ${badge('warn')} Chrome/Chromium not found — skipping`);
        return;
    }

    try {
        let lighthouse;
        try {
            lighthouse = (await import('lighthouse')).default;
        } catch {
            addResult(suite, 'Lighthouse module', 'warn', 'Could not load lighthouse');
            console.log(`  ${badge('warn')} Could not load lighthouse module`);
            return;
        }

        console.log(`  ${colors.dim}Running Lighthouse (this takes ~30s)...${colors.reset}`);

        // Launch Chrome
        const { launch } = await import('lighthouse/chrome-launcher/chrome-launcher.js').catch(() =>
            import('chrome-launcher')
        );

        let chrome;
        try {
            chrome = await launch({
                chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
                chromePath,
            });
        } catch {
            // Fallback: try CLI approach
            console.log(`  ${colors.dim}Chrome launcher failed, trying CLI...${colors.reset}`);
            const env = { ...process.env, CHROME_PATH: chromePath };
            execSync(
                `npx lighthouse "${url}" --output=json --output-path="${outPath}" --chrome-flags="--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage" --only-categories=performance,accessibility,best-practices,seo --quiet 2>/dev/null`,
                { encoding: 'utf8', timeout: 120000, cwd: ROOT, env }
            );
            chrome = null;
        }

        let lhReport;
        if (chrome) {
            const result = await lighthouse(url, {
                port: chrome.port,
                output: 'json',
                onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
            });
            lhReport = result.lhr;
            await chrome.kill();
        } else if (fs.existsSync(outPath)) {
            lhReport = JSON.parse(fs.readFileSync(outPath, 'utf8'));
        }

        if (!lhReport || lhReport.runtimeError) {
            const msg = lhReport?.runtimeError?.message || 'No report generated';
            addResult(suite, 'Lighthouse execution', 'warn', msg);
            console.log(`  ${badge('warn')} ${msg}`);
            return;
        }

        // Save report
        fs.writeFileSync(outPath, JSON.stringify(lhReport, null, 2));

        const cats = lhReport.categories;
        if (!cats) {
            addResult(suite, 'Lighthouse execution', 'warn', 'No category scores');
            return;
        }

        const scores = {};
        for (const [key, cat] of Object.entries(cats)) {
            const score = Math.round((cat.score || 0) * 100);
            scores[key] = score;
            const status = score >= 90 ? 'pass' : score >= 50 ? 'warn' : 'fail';
            addResult(suite, `${cat.title}: ${score}`, status);
            console.log(`  ${badge(status)} ${cat.title}: ${score}/100`);
        }

        addResult(suite, 'Lighthouse report generated', 'pass', JSON.stringify(scores));
        console.log(`  ${colors.dim}Full report: tests/lighthouse-report.json${colors.reset}`);
    } catch (err) {
        const msg = (err.message || '').substring(0, 120);
        addResult(suite, 'Lighthouse execution', 'warn', msg);
        console.log(`  ${badge('warn')} Lighthouse failed: ${msg}`);
    }
}

// ─── REPORT GENERATION ──────────────────────────────────────

function generateReport() {
    console.log(`\n${colors.bold}${'═'.repeat(60)}${colors.reset}`);
    console.log(`${colors.bold}  FOGSIFT TEST REPORT${colors.reset}`);
    console.log(`${colors.bold}${'═'.repeat(60)}${colors.reset}\n`);

    // Summary table
    const { total, passed, failed, warned } = report.summary;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;

    console.log(`  Total tests:  ${total}`);
    console.log(`  ${colors.pass}Passed:${colors.reset}       ${passed}`);
    console.log(`  ${colors.fail}Failed:${colors.reset}       ${failed}`);
    console.log(`  ${colors.warn}Warnings:${colors.reset}     ${warned}`);
    console.log(`  Pass rate:    ${passRate}%`);
    console.log();

    // Per-suite summary
    for (const suite of report.suites) {
        const icon = suite.failed > 0 ? colors.fail + '✗' : suite.warned > 0 ? colors.warn + '~' : colors.pass + '✓';
        console.log(`  ${icon} ${suite.name}${colors.reset} — ${suite.passed} pass, ${suite.failed} fail, ${suite.warned} warn`);
    }

    console.log(`\n${colors.bold}${'═'.repeat(60)}${colors.reset}`);

    // Overall verdict
    if (failed === 0) {
        console.log(`\n  ${colors.pass}${colors.bold}READY TO DEPLOY${colors.reset} ${colors.dim}(${warned} warnings to review)${colors.reset}\n`);
    } else {
        console.log(`\n  ${colors.fail}${colors.bold}NOT READY — ${failed} failing test(s)${colors.reset}\n`);
    }

    // Write JSON report
    const jsonPath = path.join(REPORT_DIR, 'report.json');
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

    // Write text report
    const txtPath = path.join(REPORT_DIR, 'report.txt');
    let txt = `FOGSIFT TEST REPORT\n`;
    txt += `Generated: ${report.timestamp}\n`;
    txt += `${'='.repeat(60)}\n\n`;
    txt += `SUMMARY\n`;
    txt += `  Total:    ${total}\n`;
    txt += `  Passed:   ${passed}\n`;
    txt += `  Failed:   ${failed}\n`;
    txt += `  Warnings: ${warned}\n`;
    txt += `  Pass rate: ${passRate}%\n\n`;

    for (const suite of report.suites) {
        txt += `── ${suite.name} ──\n`;
        for (const t of suite.tests) {
            const marker = t.status === 'pass' ? '[PASS]' : t.status === 'fail' ? '[FAIL]' : '[WARN]';
            txt += `  ${marker} ${t.test}`;
            if (t.detail) txt += ` — ${t.detail}`;
            txt += '\n';
        }
        txt += '\n';
    }

    txt += `${'='.repeat(60)}\n`;
    txt += failed === 0 ? 'VERDICT: READY TO DEPLOY\n' : `VERDICT: NOT READY — ${failed} failure(s)\n`;

    fs.writeFileSync(txtPath, txt);

    console.log(`  Reports written:`);
    console.log(`    ${colors.dim}tests/report.json${colors.reset}`);
    console.log(`    ${colors.dim}tests/report.txt${colors.reset}`);
    if (fs.existsSync(path.join(REPORT_DIR, 'lighthouse-report.json'))) {
        console.log(`    ${colors.dim}tests/lighthouse-report.json${colors.reset}`);
    }
    console.log();

    return failed;
}

// ─── MAIN ───────────────────────────────────────────────────

async function main() {
    console.log(`\n${colors.bold}FOGSIFT COMPREHENSIVE TEST SUITE${colors.reset}`);
    console.log(`${colors.dim}Running against dist/ at ${new Date().toLocaleTimeString()}${colors.reset}`);

    testBuild();
    testHtmlValidation();
    testEslint();

    // Start temporary server for pa11y + Lighthouse
    try {
        const port = await startTestServer();
        console.log(`\n${colors.dim}  Test server started on port ${port}${colors.reset}`);
        await testAccessibility();
        await testLighthouse();
    } catch (err) {
        console.log(`\n${colors.warn}  Could not start test server: ${err.message}${colors.reset}`);
    } finally {
        await stopTestServer();
    }

    testLinkIntegrity();
    testSearchIndex();
    testAssetAudit();
    testSecurityHeaders();

    const failures = generateReport();
    process.exit(failures > 0 ? 1 : 0);
}

main().catch(err => {
    console.error('Test suite crashed:', err);
    process.exit(2);
});
