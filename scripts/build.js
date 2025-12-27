#!/usr/bin/env node
/**
 * FOGSIFT BUILD SCRIPT v2
 * - Concatenates CSS and JS from src/
 * - Processes HTML template with version injection
 * - Copies static assets to dist/
 * No external dependencies - uses Node.js built-ins
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

// Get version from package.json
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const VERSION = pkg.version || '0.0.0';

// Files to concatenate (order matters)
const CSS_FILES = [
    'src/css/tokens.css',
    'src/css/base.css',
    'src/css/components.css',
];

const JS_FILES = [
    'src/js/toast.js',
    'src/js/theme.js',
    'src/js/modal.js',
    'src/js/nav.js',
    'src/js/main.js',
];

// Static assets to copy from src/ to dist/
const STATIC_ASSETS = [
    { src: 'src/404.html', dest: '404.html' },
    { src: 'src/robots.txt', dest: 'robots.txt' },
    { src: 'src/sitemap.xml', dest: 'sitemap.xml' },
    { src: 'src/manifest.json', dest: 'manifest.json' },
    { src: 'src/favicon.png', dest: 'favicon.png' },
    { src: 'src/og-image.png', dest: 'og-image.png' },
    { src: 'src/content/articles.json', dest: 'content/articles.json' },
    // Brand assets
    { src: 'src/assets/icon-512.png', dest: 'assets/icon-512.png' },
    { src: 'src/assets/logo-color-transparent.png', dest: 'assets/logo.png' },
    { src: 'src/assets/logo-mono.png', dest: 'assets/logo-mono.png' },
    // Team images
    { src: 'src/images/team/christopher-badge.webp', dest: 'images/team/christopher-badge.webp' },
];

function concat(files) {
    return files
        .map(f => {
            const fullPath = path.join(ROOT, f);
            if (!fs.existsSync(fullPath)) {
                console.warn(`  ⚠ Missing: ${f}`);
                return '';
            }
            return fs.readFileSync(fullPath, 'utf8');
        })
        .filter(Boolean)
        .join('\n\n');
}

function copyFile(srcPath, destPath) {
    const fullSrc = path.join(ROOT, srcPath);
    const fullDest = path.join(DIST, destPath);

    if (!fs.existsSync(fullSrc)) {
        console.warn(`  ⚠ Missing: ${srcPath}`);
        return false;
    }

    // Ensure destination directory exists
    const destDir = path.dirname(fullDest);
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    fs.copyFileSync(fullSrc, fullDest);
    return true;
}

function processHtml() {
    const templatePath = path.join(SRC, 'index.html');

    if (!fs.existsSync(templatePath)) {
        console.error('  ✗ src/index.html template not found!');
        return false;
    }

    let html = fs.readFileSync(templatePath, 'utf8');

    // Inject version number where {{VERSION}} placeholder exists
    html = html.replace(/\{\{VERSION\}\}/g, VERSION);

    // Update lastmod in any inline schema
    const today = new Date().toISOString().split('T')[0];
    html = html.replace(/<lastmod>.*?<\/lastmod>/g, `<lastmod>${today}</lastmod>`);

    fs.writeFileSync(path.join(DIST, 'index.html'), html);
    return true;
}

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function build() {
    console.log(`\n🔧 Building Fogsift v${VERSION}...\n`);

    // Ensure dist exists
    ensureDir(DIST);

    // Build CSS bundle
    console.log('📦 CSS:');
    const css = concat(CSS_FILES);
    if (css) {
        fs.writeFileSync(path.join(DIST, 'styles.css'), css);
        console.log(`  ✓ dist/styles.css (${(css.length / 1024).toFixed(1)}KB)`);
    }

    // Build JS bundle
    console.log('\n📦 JavaScript:');
    const js = concat(JS_FILES);
    if (js) {
        fs.writeFileSync(path.join(DIST, 'app.js'), js);
        console.log(`  ✓ dist/app.js (${(js.length / 1024).toFixed(1)}KB)`);
    }

    // Process HTML template
    console.log('\n📄 HTML:');
    if (processHtml()) {
        console.log('  ✓ dist/index.html (processed)');
    }

    // Copy static assets
    console.log('\n📁 Static Assets:');
    STATIC_ASSETS.forEach(asset => {
        if (copyFile(asset.src, asset.dest)) {
            console.log(`  ✓ dist/${asset.dest}`);
        }
    });

    console.log(`\n✨ Build complete! v${VERSION}`);
    console.log('   Run: npm run dev\n');
}

build();
