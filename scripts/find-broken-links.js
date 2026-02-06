#!/usr/bin/env node
/**
 * Find broken internal links in dist/
 */

const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'dist');

function getHtmlFiles(dir) {
    const files = [];
    function scan(d) {
        const entries = fs.readdirSync(d, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(d, entry.name);
            if (entry.isDirectory()) {
                scan(fullPath);
            } else if (entry.name.endsWith('.html')) {
                files.push(fullPath);
            }
        }
    }
    scan(dir);
    return files;
}

const files = getHtmlFiles(DIST);
const brokenLinks = [];

for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
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
            // Absolute path from site root
            linkPath = path.join(DIST, href);
        } else {
            // Relative to file location
            const fileDir = path.dirname(file);
            linkPath = path.join(fileDir, href);
        }

        if (!fs.existsSync(linkPath)) {
            const rel = path.relative(DIST, file);
            brokenLinks.push({ from: rel, to: href });
        }
    }
}

console.log('Broken links found:', brokenLinks.length);
console.log('');

// Group by target
const byTarget = {};
for (const link of brokenLinks) {
    if (!byTarget[link.to]) {
        byTarget[link.to] = [];
    }
    byTarget[link.to].push(link.from);
}

console.log('Unique broken targets:');
for (const [target, sources] of Object.entries(byTarget).slice(0, 25)) {
    console.log(`  ${target}`);
    console.log(`    - from: ${sources.slice(0, 3).join(', ')}${sources.length > 3 ? ` (+${sources.length - 3} more)` : ''}`);
}

if (Object.keys(byTarget).length > 25) {
    console.log(`  ... and ${Object.keys(byTarget).length - 25} more broken targets`);
}
