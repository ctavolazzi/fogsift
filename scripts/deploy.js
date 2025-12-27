#!/usr/bin/env node
/**
 * FOGSIFT DEPLOY SCRIPT
 * Quick deploy with pre-flight checks, file tree visualization, and deployment manifest
 *
 * Usage:
 *   npm run quick-deploy     - Full deploy to Cloudflare Pages
 *   npm run deploy:dry       - Dry run (preview without deploying)
 *
 * No external dependencies - uses Node.js built-ins
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PKG_PATH = path.join(ROOT, 'package.json');

// Parse CLI flags
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run') || args.includes('-n');

// Critical files that must exist after build
const CRITICAL_FILES = [
    'index.html',
    'styles.css',
    'app.js',
    'favicon.png',
    'manifest.json',
    '404.html',
];

// Size thresholds (in KB) for warnings
const SIZE_WARNINGS = {
    'styles.css': 100,  // Warn if CSS > 100KB
    'app.js': 200,      // Warn if JS > 200KB
    'index.html': 100,  // Warn if HTML > 100KB
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

function exec(cmd, options = {}) {
    try {
        return execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: 'pipe', ...options });
    } catch (e) {
        if (!options.ignoreError) throw e;
        return null;
    }
}

function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileHash(filepath) {
    const content = fs.readFileSync(filepath);
    return crypto.createHash('md5').update(content).digest('hex').slice(0, 8);
}

function colorize(text, color) {
    const colors = {
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        cyan: '\x1b[36m',
        dim: '\x1b[2m',
        reset: '\x1b[0m',
    };
    return `${colors[color] || ''}${text}${colors.reset}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// PRE-FLIGHT CHECKS
// ═══════════════════════════════════════════════════════════════════════════

function checkGitClean() {
    const status = exec('git status --porcelain', { ignoreError: true });
    if (status && status.trim()) {
        console.error(colorize('\n✗ Git working tree is not clean!', 'red'));
        console.error(colorize('  Commit or stash your changes before deploying.\n', 'dim'));
        console.error('  Uncommitted changes:');
        status.trim().split('\n').forEach(line => {
            console.error(colorize(`    ${line}`, 'yellow'));
        });
        process.exit(1);
    }
    return true;
}

function checkBranch() {
    const branch = exec('git rev-parse --abbrev-ref HEAD', { ignoreError: true });
    return branch ? branch.trim() : 'unknown';
}

function getGitCommit() {
    const commit = exec('git rev-parse --short HEAD', { ignoreError: true });
    return commit ? commit.trim() : 'unknown';
}

function getLastDeployVersion() {
    const manifestPath = path.join(DIST, '.deploy-manifest.json');
    if (fs.existsSync(manifestPath)) {
        try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            return manifest.version;
        } catch {
            return null;
        }
    }
    return null;
}

function checkVersionBump(currentVersion) {
    const lastVersion = getLastDeployVersion();
    if (lastVersion && lastVersion === currentVersion) {
        console.log(colorize(`  ⚠ Warning: Version ${currentVersion} was already deployed`, 'yellow'));
        console.log(colorize('    Consider running: npm run version:patch', 'dim'));
        return false;
    }
    return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// FILE TREE VISUALIZATION
// ═══════════════════════════════════════════════════════════════════════════

function buildFileTree(dir, prefix = '', isLast = true) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
        .filter(e => !e.name.startsWith('.'))
        .sort((a, b) => {
            // Directories first, then files
            if (a.isDirectory() && !b.isDirectory()) return -1;
            if (!a.isDirectory() && b.isDirectory()) return 1;
            return a.name.localeCompare(b.name);
        });

    let tree = [];

    entries.forEach((entry, index) => {
        const isLastEntry = index === entries.length - 1;
        const connector = isLastEntry ? '└── ' : '├── ';
        const newPrefix = prefix + (isLastEntry ? '    ' : '│   ');

        if (entry.isDirectory()) {
            tree.push(`${prefix}${connector}${colorize(entry.name + '/', 'cyan')}`);
            tree = tree.concat(buildFileTree(path.join(dir, entry.name), newPrefix, isLastEntry));
        } else {
            const size = fs.statSync(path.join(dir, entry.name)).size;
            tree.push(`${prefix}${connector}${entry.name} ${colorize(`(${formatSize(size)})`, 'dim')}`);
        }
    });

    return tree;
}

function printFileTree() {
    console.log('\n📁 Deployment Tree (dist/)');
    const tree = buildFileTree(DIST);
    tree.forEach(line => console.log(line));
}

// ═══════════════════════════════════════════════════════════════════════════
// BUNDLE SIZE REPORT
// ═══════════════════════════════════════════════════════════════════════════

function calculateDirSize(dir) {
    let total = 0;
    let fileCount = 0;

    function walk(d) {
        const entries = fs.readdirSync(d, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(d, entry.name);
            if (entry.isDirectory()) {
                walk(fullPath);
            } else {
                total += fs.statSync(fullPath).size;
                fileCount++;
            }
        }
    }

    walk(dir);
    return { total, fileCount };
}

function printBundleReport() {
    console.log('\n📊 Bundle Report');

    const bundles = [
        { label: 'HTML', file: 'index.html' },
        { label: 'CSS', file: 'styles.css' },
        { label: 'JS', file: 'app.js' },
    ];

    bundles.forEach(({ label, file }) => {
        const filepath = path.join(DIST, file);
        if (fs.existsSync(filepath)) {
            const size = fs.statSync(filepath).size;
            const sizeKB = size / 1024;
            const threshold = SIZE_WARNINGS[file];
            const sizeStr = formatSize(size).padStart(10);

            let status = colorize('✓', 'green');
            if (threshold && sizeKB > threshold) {
                status = colorize('⚠', 'yellow');
            }

            console.log(`  ${status} ${label.padEnd(5)} ${file.padEnd(15)} ${sizeStr}`);
        }
    });

    console.log('  ' + '─'.repeat(35));

    const { total, fileCount } = calculateDirSize(DIST);
    console.log(`  Total: ${fileCount} files`.padEnd(25) + formatSize(total).padStart(12));
}

// ═══════════════════════════════════════════════════════════════════════════
// CRITICAL FILE VERIFICATION
// ═══════════════════════════════════════════════════════════════════════════

function verifyCriticalFiles() {
    const missing = [];
    const found = [];

    CRITICAL_FILES.forEach(file => {
        const filepath = path.join(DIST, file);
        if (fs.existsSync(filepath)) {
            found.push(file);
        } else {
            missing.push(file);
        }
    });

    if (missing.length > 0) {
        console.error(colorize('\n✗ Critical files missing!', 'red'));
        missing.forEach(file => {
            console.error(colorize(`  • ${file}`, 'red'));
        });
        process.exit(1);
    }

    return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEPLOYMENT MANIFEST
// ═══════════════════════════════════════════════════════════════════════════

function generateManifest(version) {
    const { total, fileCount } = calculateDirSize(DIST);

    // Generate checksums for critical files
    const checksums = {};
    CRITICAL_FILES.forEach(file => {
        const filepath = path.join(DIST, file);
        if (fs.existsSync(filepath)) {
            checksums[file] = getFileHash(filepath);
        }
    });

    const manifest = {
        version,
        deployedAt: new Date().toISOString(),
        gitCommit: getGitCommit(),
        gitBranch: checkBranch(),
        totalSize: total,
        fileCount,
        checksums,
        bundles: {
            css: fs.existsSync(path.join(DIST, 'styles.css'))
                ? fs.statSync(path.join(DIST, 'styles.css')).size : 0,
            js: fs.existsSync(path.join(DIST, 'app.js'))
                ? fs.statSync(path.join(DIST, 'app.js')).size : 0,
            html: fs.existsSync(path.join(DIST, 'index.html'))
                ? fs.statSync(path.join(DIST, 'index.html')).size : 0,
        },
    };

    fs.writeFileSync(
        path.join(DIST, '.deploy-manifest.json'),
        JSON.stringify(manifest, null, 2)
    );

    return manifest;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN DEPLOY FLOW
// ═══════════════════════════════════════════════════════════════════════════

async function deploy() {
    const pkg = JSON.parse(fs.readFileSync(PKG_PATH, 'utf8'));
    const version = pkg.version || '0.0.0';

    // Header
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║  FOGSIFT DEPLOY ${DRY_RUN ? '(DRY RUN) ' : ''}v${version.padEnd(DRY_RUN ? 28 : 38)}║
╚═══════════════════════════════════════════════════════════╝`);

    // Pre-flight checks
    console.log('\n✓ Pre-flight checks');

    checkGitClean();
    console.log(colorize('  • Git working tree clean', 'green'));

    const branch = checkBranch();
    if (branch !== 'main') {
        console.log(colorize(`  ⚠ On branch: ${branch} (not main)`, 'yellow'));
    } else {
        console.log(colorize(`  • On branch: ${branch}`, 'green'));
    }

    console.log(colorize(`  • Version: ${version}`, 'green'));
    checkVersionBump(version);

    // Build
    console.log('\n⏳ Running build...');
    try {
        exec('node scripts/build.js', { stdio: 'inherit' });
    } catch (e) {
        console.error(colorize('\n✗ Build failed!', 'red'));
        process.exit(1);
    }

    // Verify critical files
    console.log('\n✓ Critical files verified');
    verifyCriticalFiles();
    CRITICAL_FILES.forEach(file => {
        console.log(colorize(`  • ${file}`, 'green'));
    });

    // File tree
    printFileTree();

    // Bundle report
    printBundleReport();

    // Generate manifest
    const manifest = generateManifest(version);
    console.log(colorize(`\n✓ Deployment manifest generated`, 'green'));
    console.log(colorize(`  • Commit: ${manifest.gitCommit}`, 'dim'));

    // Deploy or dry run
    if (DRY_RUN) {
        console.log(colorize('\n🏃 DRY RUN - Skipping actual deployment', 'yellow'));
        console.log(colorize('  Run without --dry-run to deploy\n', 'dim'));
    } else {
        console.log('\n🚀 Deploying to Cloudflare Pages...');
        try {
            const output = exec('npx wrangler pages deploy dist --project-name fogsift', {
                stdio: 'inherit',
            });
            console.log(colorize('\n✨ Deployed successfully!', 'green'));
            console.log(colorize('   https://fogsift.pages.dev\n', 'cyan'));
        } catch (e) {
            console.error(colorize('\n✗ Deployment failed!', 'red'));
            console.error(e.message);
            process.exit(1);
        }
    }

    // Summary
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║  ${DRY_RUN ? '🏃 Dry run complete' : '✨ Deployment complete'}                                  ║
║  Version: v${version.padEnd(47)}║
║  Commit:  ${manifest.gitCommit.padEnd(48)}║
╚═══════════════════════════════════════════════════════════╝
`);
}

deploy().catch(e => {
    console.error(colorize(`\n✗ Deploy error: ${e.message}`, 'red'));
    process.exit(1);
});

