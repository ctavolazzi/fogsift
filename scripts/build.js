#!/usr/bin/env node
/**
 * FOGSIFT BUILD SCRIPT
 * Concatenates CSS and JS, outputs to dist/
 * No dependencies required - uses Node.js built-ins
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

// Files to concatenate (order matters)
const CSS_FILES = [
    'src/css/tokens.css',
    'src/css/base.css',
    // Add component CSS files here as you create them
];

const JS_FILES = [
    'src/js/toast.js',
    'src/js/theme.js',
    'src/js/modal.js',
    'src/js/nav.js',
    'src/js/main.js',
];

function concat(files) {
    return files
        .map(f => {
            const fullPath = path.join(ROOT, f);
            if (!fs.existsSync(fullPath)) {
                console.warn(`⚠ Missing: ${f}`);
                return '';
            }
            return fs.readFileSync(fullPath, 'utf8');
        })
        .join('\n\n');
}

function build() {
    console.log('🔧 Building Fogsift...\n');

    // Ensure dist exists
    if (!fs.existsSync(DIST)) {
        fs.mkdirSync(DIST, { recursive: true });
    }

    // Build CSS bundle
    const css = concat(CSS_FILES);
    fs.writeFileSync(path.join(DIST, 'styles.css'), css);
    console.log(`✓ dist/styles.css (${(css.length / 1024).toFixed(1)}KB)`);

    // Build JS bundle
    const js = concat(JS_FILES);
    fs.writeFileSync(path.join(DIST, 'app.js'), js);
    console.log(`✓ dist/app.js (${(js.length / 1024).toFixed(1)}KB)`);

    console.log('\n✨ Build complete!');
    console.log('   Run: npm run dev');
}

build();

