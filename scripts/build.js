#!/usr/bin/env node
/**
 * FOGSIFT BUILD SCRIPT v4
 * - Concatenates and minifies CSS and JS from src/ (using esbuild)
 * - Processes HTML template with version injection
 * - Builds markdown wiki pages
 * - Copies static assets to dist/
 */

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const esbuild = require('esbuild');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

// Get version from package.json
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const VERSION = pkg.version || '0.0.0';

// Theme init script - injected into HTML <head> to prevent FOUC
// Single source of truth for theme initialization (TD-010)
const THEME_STORAGE_KEY = 'theme';
const THEME_INIT_SCRIPT = `<script>(function(){var t=localStorage.getItem('${THEME_STORAGE_KEY}');document.documentElement.setAttribute('data-theme',t||'light')})();</script>`;

// SVG Icons for wiki categories
const WIKI_ICONS = {
    book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path><line x1="8" y1="6" x2="16" y2="6"></line><line x1="8" y1="10" x2="14" y2="10"></line></svg>`,
    lightbulb: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M12 2a7 7 0 0 0-4 12.7V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.3A7 7 0 0 0 12 2z"></path></svg>`,
    pencil: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`,
    folder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
    file: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`,
    wrench: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`,
    chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
    tools: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`,
    compass: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>`,
};

function getWikiIcon(iconName) {
    return WIKI_ICONS[iconName] || WIKI_ICONS.file;
}

// Files to concatenate (order matters)
// TD-017: Split components.css into modular files
const CSS_FILES = [
    'src/css/tokens.css',      // Design tokens
    'src/css/base.css',        // Reset, typography
    'src/css/navigation.css',  // Nav, mobile drawer, theme toggle
    'src/css/components.css',  // Sections, buttons, toast, modal
    'src/css/sleep.css',       // Sleep mode animations (easter egg)
    'src/css/wiki.css',        // Wiki page styles
    'src/css/mobile.css',      // Mobile-first overrides - must be last
];

const JS_FILES = [
    'src/js/toast.js',
    'src/js/theme.js',
    'src/js/modal.js',
    'src/js/nav.js',
    'src/js/sleep.js',    // Easter egg - must be before main.js
    'src/js/cache.js',    // TKT-x7k9-005: Caching layer
    'src/js/debug.js',    // TKT-x7k9-008: Debug logging
    'src/js/wiki-api.js', // TKT-x7k9-004: Wiki API client
    'src/js/main.js',
];

// Static assets to copy from src/ to dist/
// Note: 404.html is processed separately (TD-010 theme init injection)
const STATIC_ASSETS = [
    { src: 'src/robots.txt', dest: 'robots.txt' },
    { src: 'src/sitemap.xml', dest: 'sitemap.xml' },
    { src: 'src/manifest.json', dest: 'manifest.json' },
    { src: 'src/favicon.png', dest: 'favicon.png' },
    { src: 'src/og-image.png', dest: 'og-image.png' },
    { src: 'src/content/articles.json', dest: 'content/articles.json' },
    { src: 'src/content/status.json', dest: 'content/status.json' },
    { src: 'src/system-status.html', dest: 'system-status.html' },
    // Security files
    { src: 'src/_headers', dest: '_headers' },
    { src: 'src/.well-known/security.txt', dest: '.well-known/security.txt' },
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

    // Inject theme init script (TD-010: single source of truth)
    html = html.replace(/\{\{THEME_INIT\}\}/g, THEME_INIT_SCRIPT);

    // Inject version number where {{VERSION}} placeholder exists
    html = html.replace(/\{\{VERSION\}\}/g, VERSION);

    // Update lastmod in any inline schema
    const today = new Date().toISOString().split('T')[0];
    html = html.replace(/<lastmod>.*?<\/lastmod>/g, `<lastmod>${today}</lastmod>`);

    fs.writeFileSync(path.join(DIST, 'index.html'), html);
    return true;
}

function process404Html() {
    const templatePath = path.join(SRC, '404.html');

    if (!fs.existsSync(templatePath)) {
        console.warn('  ⚠ src/404.html not found, skipping');
        return false;
    }

    let html = fs.readFileSync(templatePath, 'utf8');

    // Inject theme init script (TD-010: single source of truth)
    html = html.replace(/\{\{THEME_INIT\}\}/g, THEME_INIT_SCRIPT);

    fs.writeFileSync(path.join(DIST, '404.html'), html);
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
        const iconSvg = getWikiIcon(category.icon);
        nav += `<div class="wiki-nav-category">\n`;
        nav += `  <h4 class="wiki-nav-title"><span class="wiki-nav-icon">${iconSvg}</span>${category.title}</h4>\n`;
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
        const iconSvg = getWikiIcon(category.icon);
        html += `<div class="wiki-category-card">\n`;
        html += `  <div class="wiki-category-icon">${iconSvg}</div>\n`;
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

// Johnny Decimal range assignments for categories
const JD_RANGES = {
    'docs': { start: 10, name: 'Documentation' },
    'concepts': { start: 20, name: 'Concepts' },
    'frameworks': { start: 30, name: 'Frameworks' },
    'field-notes': { start: 40, name: 'Field Notes' },
    'case-studies': { start: 50, name: 'Case Studies' },
    'tools': { start: 60, name: 'Tools & Techniques' }
};

function generateJDSitemap(wikiIndex, depth = 0) {
    const prefix = depth > 0 ? '../'.repeat(depth) : '';

    let html = `<div class="jd-sitemap">\n`;
    html += `  <div class="jd-sitemap-header">\n`;
    html += `    <h3 class="jd-sitemap-title">Sitemap</h3>\n`;
    html += `  </div>\n`;
    html += `  <div class="jd-sitemap-grid">\n`;

    for (const category of wikiIndex.categories) {
        const jdConfig = JD_RANGES[category.id] || { start: 90, name: category.title };
        const rangeStart = jdConfig.start;
        const rangeEnd = rangeStart + 9;

        html += `    <div class="jd-category">\n`;
        html += `      <div class="jd-category-header">\n`;
        html += `        <span class="jd-range">${rangeStart}-${rangeEnd}</span>\n`;
        html += `        <h4 class="jd-category-name">${category.title}</h4>\n`;
        html += `      </div>\n`;
        html += `      <ul class="jd-pages">\n`;

        category.pages.forEach((page, index) => {
            const jdNumber = `${rangeStart}.${String(index + 1).padStart(2, '0')}`;
            const href = `${prefix}${page.slug}.html`;
            html += `        <li>\n`;
            html += `          <a href="${href}" class="jd-page-link">\n`;
            html += `            <span class="jd-number">${jdNumber}</span>\n`;
            html += `            <span class="jd-page-title">${page.title}</span>\n`;
            html += `          </a>\n`;
            html += `        </li>\n`;
        });

        html += `      </ul>\n`;
        html += `    </div>\n`;
    }

    html += `  </div>\n`;
    html += `  <div class="jd-sitemap-footer">\n`;
    html += `    <p class="jd-sitemap-note">Organized using the <a href="https://johnnydecimal.com/" target="_blank" rel="noopener">Johnny Decimal</a> system</p>\n`;
    html += `  </div>\n`;
    html += `</div>\n`;

    return html;
}

// ============================================
// API GENERATION (TKT-x7k9-002, TKT-x7k9-003)
// ============================================

/**
 * Generate all API JSON files in dist/api/
 * Called from build() function
 */
function buildAPI() {
    const wikiIndexPath = path.join(WIKI_SRC, 'index.json');
    const articlesPath = path.join(SRC, 'content', 'articles.json');
    const apiDir = path.join(DIST, 'api');
    const wikiApiDir = path.join(apiDir, 'wiki');

    // Ensure API directories exist
    ensureDir(wikiApiDir);

    const buildDate = new Date().toISOString();
    const buildTimestamp = Date.now();
    let filesCreated = 0;

    // 1. Generate /api/wiki/index.json (TKT-x7k9-002)
    if (fs.existsSync(wikiIndexPath)) {
        const wikiIndex = JSON.parse(fs.readFileSync(wikiIndexPath, 'utf8'));
        const apiIndex = {
            ...wikiIndex,
            buildDate,
            buildTimestamp
        };
        fs.writeFileSync(
            path.join(wikiApiDir, 'index.json'),
            JSON.stringify(apiIndex, null, 2)
        );
        filesCreated++;
    }

    // 2. Generate /api/wiki/sitemap.json (TKT-x7k9-003)
    if (fs.existsSync(wikiIndexPath)) {
        const wikiIndex = JSON.parse(fs.readFileSync(wikiIndexPath, 'utf8'));
        const sitemapData = {
            title: 'Fogsift Wiki Sitemap',
            buildDate,
            buildTimestamp,
            categories: wikiIndex.categories.map(category => {
                const jdConfig = JD_RANGES[category.id] || { start: 90, name: category.title };
                const rangeStart = jdConfig.start;
                return {
                    id: category.id,
                    title: category.title,
                    range: `${rangeStart}-${rangeStart + 9}`,
                    rangeStart,
                    pages: category.pages.map((page, index) => ({
                        slug: page.slug,
                        title: page.title,
                        jdNumber: `${rangeStart}.${String(index + 1).padStart(2, '0')}`,
                        href: `${page.slug}.html`
                    }))
                };
            })
        };
        fs.writeFileSync(
            path.join(wikiApiDir, 'sitemap.json'),
            JSON.stringify(sitemapData, null, 2)
        );
        filesCreated++;
    }

    // 3. Generate /api/articles.json
    if (fs.existsSync(articlesPath)) {
        const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
        const apiArticles = {
            buildDate,
            buildTimestamp,
            articles: articles.articles || articles
        };
        fs.writeFileSync(
            path.join(apiDir, 'articles.json'),
            JSON.stringify(apiArticles, null, 2)
        );
        filesCreated++;
    }

    // 4. Generate /api/meta.json
    const meta = {
        name: 'Fogsift',
        version: VERSION,
        buildDate,
        buildTimestamp
    };
    fs.writeFileSync(
        path.join(apiDir, 'meta.json'),
        JSON.stringify(meta, null, 2)
    );
    filesCreated++;

    return filesCreated;
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

        // Generate JD sitemap for this page depth
        const jdSitemap = generateJDSitemap(wikiIndex, depth);

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
            .replace(/\{\{JD_SITEMAP\}\}/g, jdSitemap)
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
        const jdSitemapIndex = generateJDSitemap(wikiIndex, 0);
        let indexHtml = indexTemplate
            .replace(/\{\{CATEGORIES\}\}/g, categoryCards)
            .replace(/\{\{JD_SITEMAP\}\}/g, jdSitemapIndex)
            .replace(/\{\{BUILD_DATE\}\}/g, today);

        fs.writeFileSync(path.join(WIKI_DIST, 'index.html'), indexHtml);
        pagesBuilt++;
    }

    return pagesBuilt;
}

async function minifyCSS(css) {
    const result = await esbuild.transform(css, {
        loader: 'css',
        minify: true,
    });
    return result.code;
}

async function minifyJS(js) {
    const result = await esbuild.transform(js, {
        loader: 'js',
        minify: true,
        target: ['es2020'],
    });
    return result.code;
}

function formatSize(bytes) {
    return (bytes / 1024).toFixed(1) + 'KB';
}

function formatSavings(original, minified) {
    const saved = original - minified;
    const percent = ((saved / original) * 100).toFixed(0);
    return `${formatSize(minified)} (saved ${percent}%)`;
}

async function build() {
    console.log(`\n🔧 Building Fogsift v${VERSION}...\n`);

    // Ensure dist exists
    ensureDir(DIST);

    // Build CSS bundle
    console.log('📦 CSS:');
    const css = concat(CSS_FILES);
    if (css) {
        const minifiedCSS = await minifyCSS(css);
        fs.writeFileSync(path.join(DIST, 'styles.css'), minifiedCSS);
        console.log(`  ✓ dist/styles.css ${formatSavings(css.length, minifiedCSS.length)}`);
    }

    // Build JS bundle
    console.log('\n📦 JavaScript:');
    const js = concat(JS_FILES);
    if (js) {
        const minifiedJS = await minifyJS(js);
        fs.writeFileSync(path.join(DIST, 'app.js'), minifiedJS);
        console.log(`  ✓ dist/app.js ${formatSavings(js.length, minifiedJS.length)}`);
    }

    // Process HTML templates (with theme init injection - TD-010)
    console.log('\n📄 HTML:');
    if (processHtml()) {
        console.log('  ✓ dist/index.html (processed)');
    }
    if (process404Html()) {
        console.log('  ✓ dist/404.html (processed)');
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

    // Build API (TKT-x7k9-002, TKT-x7k9-003)
    console.log('\n🔌 API:');
    const apiFiles = buildAPI();
    console.log(`  ✓ Generated ${apiFiles} API endpoints`);

    console.log(`\n✨ Build complete! v${VERSION}`);
    console.log('   Run: npm run dev\n');
}

build().catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
});
