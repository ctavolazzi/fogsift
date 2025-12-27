#!/usr/bin/env node
/**
 * FOGSIFT BUILD SCRIPT v3
 * - Concatenates CSS and JS from src/
 * - Processes HTML template with version injection
 * - Builds markdown wiki pages
 * - Copies static assets to dist/
 */

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

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
    'src/css/mobile.css',  // Mobile-first overrides - must be last
];

const JS_FILES = [
    'src/js/toast.js',
    'src/js/theme.js',
    'src/js/modal.js',
    'src/js/nav.js',
    'src/js/sleep.js',  // Easter egg - must be before main.js
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

// ============================================
// WIKI BUILD FUNCTIONS
// ============================================

const WIKI_SRC = path.join(SRC, 'wiki');
const WIKI_DIST = path.join(DIST, 'wiki');

// Configure marked for better output
marked.setOptions({
    gfm: true,
    breaks: false,
    headerIds: true,
    mangle: false
});

function getMarkdownFiles(dir, baseDir = dir) {
    const files = [];
    if (!fs.existsSync(dir)) return files;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...getMarkdownFiles(fullPath, baseDir));
        } else if (entry.name.endsWith('.md')) {
            const relativePath = path.relative(baseDir, fullPath);
            const slug = relativePath.replace(/\.md$/, '');
            files.push({ fullPath, slug, filename: entry.name });
        }
    }
    return files;
}

function extractTitle(markdown) {
    const match = markdown.match(/^#\s+(.+)$/m);
    return match ? match[1] : 'Untitled';
}

function extractDescription(markdown) {
    // Get first paragraph after title
    const lines = markdown.split('\n');
    let foundTitle = false;
    for (const line of lines) {
        if (line.startsWith('# ')) {
            foundTitle = true;
            continue;
        }
        if (foundTitle && line.trim() && !line.startsWith('#') && !line.startsWith('**')) {
            return line.trim().substring(0, 160);
        }
    }
    return 'Fogsift Wiki';
}

function generateWikiNav(wikiIndex, currentSlug = '', depth = 0) {
    const prefix = depth > 0 ? '../'.repeat(depth) : '';
    let nav = '';
    for (const category of wikiIndex.categories) {
        nav += `<div class="wiki-nav-category">\n`;
        nav += `  <h4 class="wiki-nav-title">${category.icon} ${category.title}</h4>\n`;
        nav += `  <ul class="wiki-nav-list">\n`;
        for (const page of category.pages) {
            const isActive = page.slug === currentSlug;
            const activeClass = isActive ? ' class="active"' : '';
            const href = `${prefix}${page.slug}.html`;
            nav += `    <li><a href="${href}"${activeClass}>${page.title}</a></li>\n`;
        }
        nav += `  </ul>\n`;
        nav += `</div>\n`;
    }
    return nav;
}

function generateCategoryCards(wikiIndex) {
    let html = '';
    for (const category of wikiIndex.categories) {
        html += `<div class="wiki-category-card">\n`;
        html += `  <div class="wiki-category-icon">${category.icon}</div>\n`;
        html += `  <h2 class="wiki-category-title">${category.title}</h2>\n`;
        html += `  <ul class="wiki-category-pages">\n`;
        for (const page of category.pages) {
            const href = page.slug.includes('/')
                ? `${page.slug}.html`
                : `${page.slug}.html`;
            html += `    <li><a href="${href}">${page.title}</a></li>\n`;
        }
        html += `  </ul>\n`;
        html += `</div>\n`;
    }
    return html;
}

function buildWiki() {
    const wikiIndexPath = path.join(WIKI_SRC, 'index.json');
    const pageTemplatePath = path.join(SRC, 'wiki-template.html');
    const indexTemplatePath = path.join(SRC, 'wiki-index-template.html');

    if (!fs.existsSync(wikiIndexPath)) {
        console.log('  ⚠ No wiki/index.json found, skipping wiki build');
        return 0;
    }

    if (!fs.existsSync(pageTemplatePath)) {
        console.log('  ⚠ No wiki-template.html found, skipping wiki build');
        return 0;
    }

    const wikiIndex = JSON.parse(fs.readFileSync(wikiIndexPath, 'utf8'));
    const pageTemplate = fs.readFileSync(pageTemplatePath, 'utf8');
    const indexTemplate = fs.existsSync(indexTemplatePath)
        ? fs.readFileSync(indexTemplatePath, 'utf8')
        : null;

    const today = new Date().toISOString().split('T')[0];
    const mdFiles = getMarkdownFiles(WIKI_SRC);

    ensureDir(WIKI_DIST);

    let pagesBuilt = 0;

    // Build each markdown file
    for (const { fullPath, slug } of mdFiles) {
        const markdown = fs.readFileSync(fullPath, 'utf8');
        const htmlContent = marked(markdown);
        const title = extractTitle(markdown);
        const description = extractDescription(markdown);

        // Calculate depth for relative paths
        const depth = slug.split('/').length - 1;
        const prefix = depth > 0 ? '../'.repeat(depth) : '';

        // Generate nav for this page (with correct relative paths)
        const wikiNav = generateWikiNav(wikiIndex, slug, depth);

        // Build breadcrumb
        const breadcrumbParts = slug.split('/');
        const breadcrumb = breadcrumbParts[breadcrumbParts.length - 1]
            .replace(/-/g, ' ')
            .replace(/^\d+\s*/, '')
            .toUpperCase();

        // Calculate paths relative to current page
        const wikiIndexPath = depth > 0 ? `${'../'.repeat(depth)}index.html` : 'index.html';
        const rootPath = `${'../'.repeat(depth + 1)}index.html`;
        const assetsPath = `${'../'.repeat(depth + 1)}assets/`;
        const stylesPath = `${'../'.repeat(depth + 1)}styles.css`;
        const manifestPath = `${'../'.repeat(depth + 1)}manifest.json`;
        const faviconPath = `${'../'.repeat(depth + 1)}favicon.png`;

        // Process template
        let html = pageTemplate
            .replace(/\{\{PAGE_TITLE\}\}/g, title)
            .replace(/\{\{PAGE_DESCRIPTION\}\}/g, description)
            .replace(/\{\{PAGE_SLUG\}\}/g, slug)
            .replace(/\{\{BREADCRUMB\}\}/g, breadcrumb)
            .replace(/\{\{WIKI_NAV\}\}/g, wikiNav)
            .replace(/\{\{WIKI_INDEX_PATH\}\}/g, wikiIndexPath)
            .replace(/\{\{ROOT_PATH\}\}/g, rootPath)
            .replace(/\{\{ASSETS_PATH\}\}/g, assetsPath)
            .replace(/\{\{STYLES_PATH\}\}/g, stylesPath)
            .replace(/\{\{MANIFEST_PATH\}\}/g, manifestPath)
            .replace(/\{\{FAVICON_PATH\}\}/g, faviconPath)
            .replace(/\{\{CONTENT\}\}/g, htmlContent)
            .replace(/\{\{BUILD_DATE\}\}/g, today);


        // Ensure output directory exists
        const outputPath = path.join(WIKI_DIST, `${slug}.html`);
        ensureDir(path.dirname(outputPath));

        fs.writeFileSync(outputPath, html);
        pagesBuilt++;
    }

    // Build wiki index page
    if (indexTemplate) {
        const categoryCards = generateCategoryCards(wikiIndex);
        let indexHtml = indexTemplate
            .replace(/\{\{CATEGORIES\}\}/g, categoryCards)
            .replace(/\{\{BUILD_DATE\}\}/g, today);

        fs.writeFileSync(path.join(WIKI_DIST, 'index.html'), indexHtml);
        pagesBuilt++;
    }

    return pagesBuilt;
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

    // Build wiki
    console.log('\n📚 Wiki:');
    const wikiPages = buildWiki();
    if (wikiPages > 0) {
        console.log(`  ✓ Built ${wikiPages} wiki pages`);
    }

    console.log(`\n✨ Build complete! v${VERSION}`);
    console.log('   Run: npm run dev\n');
}

build();
