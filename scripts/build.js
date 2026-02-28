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

// Theme init script - external file to be CSP-compliant (no unsafe-inline needed)
// Single source of truth for theme initialization (TD-010)
const THEME_STORAGE_KEY = 'theme';
const VALID_THEMES = ['light', 'dark', 'industrial-punchcard', 'matrix', 'sky', 'synthwave', 'pipboy', 'rivendell', 'camo', 'barbie', 'ocean'];

// Generate theme init script tag with correct relative path
// No defer/async - must block rendering to prevent FOUC
function generateThemeInitScript(prefix = '') {
    return `<script src="${prefix}theme-init.js"></script>`;
}

// Navigation partial - single source of truth for site navigation
// Order: conversion-focused flow from offers → queue → learn → connect
const NAV_LINKS = [
    { href: 'about.html', label: 'ABOUT' },
    { href: 'offers.html', label: 'OFFERS' },
    { href: 'queue.html', label: 'QUEUE' },
    { href: 'wiki/index.html', label: 'WIKI' },
    { href: 'portfolio.html', label: 'PORTFOLIO' },
    { href: 'faq.html', label: 'FAQ' },
    { href: 'contact.html', label: 'CONTACT' },
];

// Theme picker options - single source of truth
const THEME_OPTIONS = [
    { id: 'light', icon: '☀', label: 'Light' },
    { id: 'dark', icon: '●', label: 'Dark' },
    { id: 'industrial-punchcard', icon: '▣', label: 'Industrial' },
    { id: 'matrix', icon: '▓', label: 'Matrix' },
    { id: 'sky', icon: '☁️', label: 'Sky' },
    { id: 'synthwave', icon: '🌆', label: 'Synthwave' },
    { id: 'pipboy', icon: '📟', label: 'Pip-Boy' },
    { id: 'rivendell', icon: '🏔️', label: 'Rivendell' },
    { id: 'camo', icon: '🦌', label: 'Camo' },
    { id: 'barbie', icon: '💖', label: 'Barbie' },
    { id: 'ocean', icon: '🌊', label: 'Ocean' },
    { id: 'aurora', icon: '🌌', label: 'Aurora' },
];

// Generate theme picker HTML - single source of truth
function generateThemePicker() {
    const options = THEME_OPTIONS.map(t =>
        `<button type="button" class="theme-picker-option" data-theme="${t.id}" role="option" onclick="ThemePicker.select('${t.id}')">
                            <span class="theme-option-icon">${t.icon}</span>
                            <span class="theme-option-label">${t.label}</span>
                            <span class="theme-option-check" aria-hidden="true">✓</span>
                        </button>`
    ).join('\n                        ');

    return `<div class="theme-picker" role="listbox" aria-label="Select theme">
                    <button type="button" class="theme-picker-toggle" onclick="ThemePicker.toggle()" aria-haspopup="listbox" aria-expanded="false">
                        <span class="theme-picker-icon" aria-hidden="true">◐</span>
                        <span class="theme-picker-label">Theme</span>
                    </button>
                    <div class="theme-picker-menu" role="listbox" aria-label="Theme options">
                        ${options}
                        <button type="button" class="theme-picker-option" data-theme="demo" role="option" onclick="Theme.startDemo()">
                            <span class="theme-option-icon">🎬</span>
                            <span class="theme-option-label">Demo</span>
                            <span class="theme-option-check" aria-hidden="true">▶</span>
                        </button>
                    </div>
                </div>`;
}

// Generate nav HTML from links array
// pathPrefix: relative path to root (e.g., '' for root pages, '../' for wiki)
function generateNavHeader(currentPage = '', pathPrefix = '') {
    const menuItems = NAV_LINKS.map(link => {
        const isCurrent = currentPage && link.href === currentPage;
        const classes = link.cta ? 'menu-link cta-link' : 'menu-link';
        const aria = isCurrent ? ' aria-current="page"' : '';
        const href = pathPrefix + link.href;
        return `<div class="menu-item"><a href="${href}" class="${classes}"${aria}>${link.label}</a></div>`;
    }).join('\n                ');

    const mobileLinks = NAV_LINKS.map(l =>
        `<a href="${pathPrefix}${l.href}" class="mobile-link${l.cta ? ' cta-link' : ''}" onclick="Nav.toggleMobile()">${l.label}</a>`
    ).join('\n        ');

    const themePicker = generateThemePicker();

    return `<!-- Mobile Navigation Drawer -->
    <nav id="mobile-drawer" class="mobile-drawer" aria-label="Mobile navigation">
        <button type="button" class="mobile-close" onclick="Nav.toggleMobile()" aria-label="Close menu">
            <span aria-hidden="true">&times;</span>
        </button>
        <a href="${pathPrefix}index.html" class="mobile-link" onclick="Nav.toggleMobile()">HOME</a>
        ${mobileLinks}
    </nav>

    <!-- Main Navigation -->
    <header class="nav-wrapper">
        <div class="main-nav">
            <a href="${pathPrefix}index.html" class="brand" aria-label="Fogsift home">
                <img src="${pathPrefix}assets/logo.png" alt="Fogsift" class="brand-logo">
            </a>
            <nav class="menu-items" aria-label="Main navigation">
                ${menuItems}
            </nav>
            <div class="nav-controls">
                <button type="button" class="site-search-btn" onclick="SiteSearch.toggle()" aria-label="Search site" title="Search site (/)">
                    <svg class="search-icon-logo" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                        <circle cx="10" cy="10" r="7" fill="var(--burnt-orange, #e07b3c)" opacity="0.85"/>
                        <circle cx="10" cy="10" r="7" fill="none" stroke="var(--chocolate, #4a2c2a)" stroke-width="2.2"/>
                        <line x1="15.5" y1="15.5" x2="21" y2="21" stroke="var(--chocolate, #4a2c2a)" stroke-width="2.5" stroke-linecap="round"/>
                    </svg>
                </button>
                ${themePicker}
                <button type="button" class="copy-page-text-btn" onclick="CopyPageText.copy()" aria-label="Copy all page text to clipboard" title="Copy all page text (excluding navigation and footer)">
                    <span class="copy-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                        </svg>
                    </span>
                </button>
                <button type="button" class="menu-toggle" onclick="Nav.toggleMobile()" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-drawer">
                    <span class="menu-toggle-icon" aria-hidden="true">☰</span>
                </button>
            </div>
        </div>
    </header>`;
}

// Footer links - single source of truth
// Note: pricing.html, process.html, about.html were legacy pages - content merged to homepage/offers
const FOOTER_LINKS = [
    { href: 'index.html', label: 'Home' },
    { href: 'offers.html', label: 'Offers' },
    { href: 'queue.html', label: 'Queue' },
    { href: 'faq.html', label: 'FAQ' },
    { href: 'portfolio.html', label: 'Portfolio' },
    { href: 'wiki/index.html', label: 'Wiki' },
    { href: 'contact.html', label: 'Contact' },
    { href: 'privacy.html', label: 'Privacy' },
    { href: 'disclaimer.html', label: 'Disclaimer' },
    { href: 'your-data.html', label: 'Your Data' },
];

// Social links - single source of truth
const SOCIAL_LINKS = [
    { href: 'https://youtube.com/@fogsift', label: 'YouTube', icon: 'youtube' },
    { href: 'https://threads.net/@fogsift', label: 'Threads', icon: 'threads' },
];

// Social icons SVG
const SOCIAL_ICONS = {
    youtube: `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
    threads: `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.33-3.022.858-.712 2.037-1.122 3.412-1.187.953-.046 1.863.03 2.723.228-.054-.89-.312-1.568-.77-2.016-.548-.535-1.405-.808-2.549-.808l-.025.001c-1.311.015-2.326.426-3.015 1.222l-1.504-1.38c1.06-1.223 2.553-1.85 4.494-1.876h.04c1.682 0 3.008.472 3.942 1.402.857.853 1.327 2.063 1.399 3.6l.015.386c1.17.553 2.103 1.38 2.707 2.418.858 1.476.997 3.628-.614 5.748-1.857 2.442-4.542 3.282-7.97 3.313zm-.159-7.18c-.927.044-1.652.27-2.095.654-.384.333-.526.713-.5 1.065.043.615.593 1.342 1.912 1.342.057 0 .116-.002.176-.006 1.034-.056 1.807-.46 2.298-1.2.364-.548.608-1.295.728-2.229-.556-.107-1.134-.166-1.73-.166-.263 0-.528.012-.79.04z"/></svg>`,
};

// Generate footer HTML - single source of truth
// Options: { pathPrefix, showVersion, showClock }
function generateFooter(pathPrefix = '', options = {}) {
    const { showVersion = false, showClock = false } = options;

    const links = FOOTER_LINKS.map(l =>
        `<a href="${pathPrefix}${l.href}">${l.label}</a>`
    ).join('\n                    ');

    const socialLinks = SOCIAL_LINKS.map(l =>
        `<a href="${l.href}" class="footer-social-link" target="_blank" rel="noopener" aria-label="${l.label}">${SOCIAL_ICONS[l.icon]}</a>`
    ).join('\n                    ');

    // Build footer bottom content
    let footerBottom = `<span>&copy; ${new Date().getFullYear()} FOGSIFT`;
    if (showVersion) {
        footerBottom += ` v{{VERSION}}`;
    }
    footerBottom += `</span>`;

    if (showClock) {
        footerBottom += `\n                    <span class="footer-sep" aria-hidden="true">//</span>
                    <span id="utc-clock" role="timer" aria-label="Current UTC time">LOADING...</span>`;
    }

    return `<footer role="contentinfo">
            <div class="footer-content">
                <div class="footer-links">
                    ${links}
                </div>
                <div class="footer-social">
                    ${socialLinks}
                </div>
                <div class="footer-bottom">
                    ${footerBottom}
                </div>
                <div class="footer-ai-disclaimer">
                    <small>This site was built almost entirely with <a href="https://claude.ai/claude-code" target="_blank" rel="noopener">Claude Code</a>.</small>
                </div>
                <div class="footer-signal" style="margin-top:0.5rem;"><a href="${pathPrefix}keepers-log.html" style="color:inherit;opacity:0.15;font-family:monospace;font-size:0.6rem;text-decoration:none;letter-spacing:0.2em;" aria-hidden="true" tabindex="-1">5001</a></div>
                <div class="footer-dev-notice">
                    <small>Site under active development. Follow along on <a href="https://youtube.com/@fogsift" target="_blank" rel="noopener">YouTube</a> &amp; <a href="https://threads.net/@fogsift" target="_blank" rel="noopener">Threads</a>.</small>
                </div>
            </div>
        </footer>`;
}

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
    layers: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`,
};

function getWikiIcon(iconName) {
    return WIKI_ICONS[iconName] || WIKI_ICONS.file;
}

// Files to concatenate (order matters)
// TD-017: Split components.css into modular files
const CSS_FILES = [
    'src/css/tokens.css',           // Design tokens
    'src/css/base.css',             // Reset, typography
    'src/css/navigation.css',       // Nav, mobile drawer, theme toggle
    'src/css/components.css',       // Sections, buttons, toast, modal
    'src/css/industrial-theme.css', // Industrial punchcard theme overrides
    'src/css/matrix-theme.css',     // Matrix digital rain theme overrides
    'src/css/sky-theme.css',       // Sky theme (replaced T-800)
    'src/css/synthwave-theme.css',  // Synthwave 80s neon theme
    'src/css/pipboy-theme.css',     // Pip-Boy Fallout CRT theme
    'src/css/rivendell-theme.css',  // Rivendell elvish elegance theme
    'src/css/camo-theme.css',       // Camo military woodland theme
    'src/css/barbie-theme.css',     // Barbie hot pink dream theme
    'src/css/ocean-theme.css',      // Ocean deep sea bioluminescence theme
    'src/css/aurora-theme.css',     // Aurora borealis northern lights theme
    'src/css/svg-components.css',   // SVG component animations and interactions
    'src/css/sleep.css',            // Sleep mode animations (easter egg)
    'src/css/wiki.css',             // Wiki page styles
    'src/css/terminal.css',         // CRT phosphor terminal exhibit component
    'src/css/mobile.css',           // Mobile-first overrides - must be last
];

const JS_FILES = [
    'src/js/toast.js',
    'src/js/copy-page-text.js', // Copy page text functionality
    'src/js/theme.js',
    'src/js/matrix-rain.js', // Matrix theme canvas animation
    'src/js/modal.js',
    'src/js/nav.js',
    'src/js/sleep.js',    // Easter egg - must be before main.js
    'src/js/cache.js',    // TKT-x7k9-005: Caching layer
    'src/js/debug.js',    // TKT-x7k9-008: Debug logging
    'src/js/wiki-api.js', // TKT-x7k9-004: Wiki API client
    'src/js/monte.js',    // Three card monte hero easter egg
    'src/js/search.js',   // Client-side search/filter
    'src/js/cookie-consent.js', // GDPR/CCPA cookie consent banner
    'src/js/svg-components.js', // SVG animations, scroll triggers, rotary encoder
    // Future features (uncomment when implemented):
    // 'src/js/achievement.js', // Xbox-style achievement notifications
    // 'src/js/queue-widget.js', // Queue status floating widget
    'src/js/terminal-demo.js',        // CRT terminal exhibit player (wiki architecture page)
    'src/js/terminal-interactive.js', // CRT interactive sandbox (wiki terminal-component page)
    'src/js/main.js',
];

// Static assets to copy from src/ to dist/
// Note: 404.html is processed separately (TD-010 theme init injection)
const STATIC_ASSETS = [
    // Page-specific scripts (not bundled with app.js)
    { src: 'src/js/theme-init.js', dest: 'theme-init.js' },
    { src: 'src/js/queue-ui.js', dest: 'queue-ui.js' },
    { src: 'src/js/wiki-nav.js', dest: 'wiki-nav.js' },
    { src: 'src/js/hero-panels.js', dest: 'hero-panels.js' },
    { src: 'src/robots.txt', dest: 'robots.txt' },
    { src: 'src/sitemap.xml', dest: 'sitemap.xml' },
    { src: 'src/manifest.json', dest: 'manifest.json' },
    { src: 'src/favicon.png', dest: 'favicon.png' },
    { src: 'src/og-image.png', dest: 'og-image.png' },
    { src: 'src/content/articles.json', dest: 'content/articles.json' },
    { src: 'src/content/status.json', dest: 'content/status.json' },
    { src: 'src/content/queue.json', dest: 'content/queue.json' },
    { src: 'src/system-status.html', dest: 'system-status.html' },
    { src: 'src/svg-components-demo.html', dest: 'svg-components-demo.html' },
    // Security files
    { src: 'src/_headers', dest: '_headers' },
    { src: 'src/.well-known/security.txt', dest: '.well-known/security.txt' },
    // Supply chain visualization — served as static files, not bundled
    { src: 'src/vendor/three.min.js',           dest: 'three.min.js' },
    { src: 'src/js/supply-chain-sim.js',        dest: 'supply-chain-sim.js' },
    // White Rabbit debugger — always loaded, silent unless activated
    { src: 'src/js/white-rabbit.js',            dest: 'white-rabbit.js' },
    // Service worker — must be at root scope
    { src: 'src/sw.js',                         dest: 'sw.js' },
    // Brand assets
    { src: 'src/assets/icon-512.png', dest: 'assets/icon-512.png' },
    { src: 'src/assets/logo-color-transparent.png', dest: 'assets/logo.png' },
    { src: 'src/assets/logo-mono.png', dest: 'assets/logo-mono.png' },
    { src: 'src/assets/logo-patch.png', dest: 'assets/logo-patch.png' },
    // Team images
    { src: 'src/images/team/christopher-badge.webp', dest: 'images/team/christopher-badge.webp' },
    // Project screenshots
    { src: 'src/assets/johnny_autoseed_site_screenshot.webp', dest: 'assets/johnny_autoseed_site_screenshot.webp' },
];

// Dynamically get all portfolio images
function getPortfolioImages() {
    const portfolioDir = path.join(SRC, 'images/portfolio');
    if (!fs.existsSync(portfolioDir)) return [];

    return fs.readdirSync(portfolioDir)
        .filter(f => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f))
        .map(f => ({
            src: `src/images/portfolio/${f}`,
            dest: `images/portfolio/${f}`
        }));
}

// Inject White Rabbit debugger script before </body>
// pathPrefix: relative path to root (e.g. '' for root pages, '../' for wiki pages)
function injectWhiteRabbit(html, pathPrefix = '') {
    const tag = `\n    <!-- 🐰 White Rabbit debugger — silent by default, activate with ?debug=rabbit -->\n    <script src="${pathPrefix}white-rabbit.js" defer></script>\n`;
    return html.replace('</body>', tag + '</body>');
}

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
    html = html.replace(/\{\{THEME_INIT\}\}/g, generateThemeInitScript());

    // Inject nav header (DRY: single source of truth for navigation)
    html = html.replace(/\{\{NAV_HEADER\}\}/g, generateNavHeader());

    // Inject footer (DRY: single source of truth for footer with social links)
    // Homepage gets version and clock
    html = html.replace(/\{\{FOOTER\}\}/g, generateFooter('', { showVersion: true, showClock: true }));

    // Inject version number where {{VERSION}} placeholder exists
    html = html.replace(/\{\{VERSION\}\}/g, VERSION);

    // Inject wiki content cards for homepage section
    const wikiIndexPath2 = path.join(WIKI_SRC, 'index.json');
    if (fs.existsSync(wikiIndexPath2)) {
        const wikiIndex = JSON.parse(fs.readFileSync(wikiIndexPath2, 'utf8'));
        const totalPages = wikiIndex.categories.reduce((sum, cat) => sum + cat.pages.length, 0);
        const statsLine = `${totalPages} free articles. Concepts, frameworks, tools, field notes, and case studies.`;
        html = html.replace(/\{\{WIKI_STATS\}\}/g, statsLine);

        // Build all entries with excerpts from markdown source
        const allEntries = [];
        for (const cat of wikiIndex.categories) {
            if (cat.id === 'docs') continue; // skip meta docs
            for (const page of cat.pages) {
                const mdPath = path.join(WIKI_SRC, page.slug + '.md');
                if (!fs.existsSync(mdPath)) continue;
                const md = fs.readFileSync(mdPath, 'utf8');
                // Extract first substantive paragraph (skip title, date, hr, empty lines)
                const lines = md.split('\n');
                let excerpt = '';
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('---') ||
                        trimmed.startsWith('**Date:') || trimmed.startsWith('**Sector:') ||
                        trimmed.startsWith('**Read Time:') || trimmed.startsWith('>')) continue;
                    excerpt = trimmed.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // strip md links
                                     .replace(/\*\*([^*]+)\*\*/g, '$1')       // strip bold
                                     .replace(/\*([^*]+)\*/g, '$1');           // strip italic
                    if (excerpt.length > 20) break;
                }
                if (excerpt.length > 140) excerpt = excerpt.substring(0, 137) + '...';
                allEntries.push({
                    slug: page.slug,
                    title: page.title,
                    category: cat.title,
                    excerpt: excerpt
                });
            }
        }

        // Pick 3 entries: one concept/framework, one tool, one field-note/case-study
        // Deterministic by day-of-year so they rotate daily
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        const buckets = {
            thinking: allEntries.filter(e => e.category === 'Concepts' || e.category === 'Frameworks'),
            doing: allEntries.filter(e => e.category === 'Tools & Techniques'),
            stories: allEntries.filter(e => e.category === 'Field Notes' || e.category === 'Case Studies')
        };
        const picks = [
            buckets.thinking[dayOfYear % buckets.thinking.length],
            buckets.doing[dayOfYear % buckets.doing.length],
            buckets.stories[dayOfYear % buckets.stories.length]
        ].filter(Boolean);

        const cardsHtml = picks.map(entry =>
            `<a href="wiki/${entry.slug}.html" class="wiki-card-link">
                    <span class="wiki-card-cat">${entry.category}</span>
                    <span class="wiki-card-title">${entry.title}</span>
                    <span class="wiki-card-excerpt">${entry.excerpt}</span>
                    <span class="wiki-card-read">Read &rarr;</span>
                </a>`
        ).join('\n                ');
        html = html.replace(/\{\{WIKI_CARDS\}\}/g, cardsHtml);
    } else {
        html = html.replace(/\{\{WIKI_STATS\}\}/g, 'Explore the knowledge base.');
        html = html.replace(/\{\{WIKI_CARDS\}\}/g, '');
    }

    // Update lastmod in any inline schema
    const today = new Date().toISOString().split('T')[0];
    html = html.replace(/<lastmod>.*?<\/lastmod>/g, `<lastmod>${today}</lastmod>`);

    html = injectWhiteRabbit(html);

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
    html = html.replace(/\{\{THEME_INIT\}\}/g, generateThemeInitScript());

    // Inject nav header (DRY: single source of truth for navigation)
    html = html.replace(/\{\{NAV_HEADER\}\}/g, generateNavHeader());

    // Inject footer (DRY: single source of truth for footer with social links)
    html = html.replace(/\{\{FOOTER\}\}/g, generateFooter());

    html = injectWhiteRabbit(html);

    fs.writeFileSync(path.join(DIST, '404.html'), html);
    return true;
}

function processSimpleHtml(filename) {
    const templatePath = path.join(SRC, filename);

    if (!fs.existsSync(templatePath)) {
        console.warn(`  ⚠ src/${filename} not found, skipping`);
        return false;
    }

    let html = fs.readFileSync(templatePath, 'utf8');

    // Inject theme init script (TD-010: single source of truth)
    html = html.replace(/\{\{THEME_INIT\}\}/g, generateThemeInitScript());

    // Inject nav header with current page highlighted (DRY: single source of truth)
    html = html.replace(/\{\{NAV_HEADER\}\}/g, generateNavHeader(filename));

    // Inject footer (DRY: single source of truth for footer with social links)
    html = html.replace(/\{\{FOOTER\}\}/g, generateFooter());

    html = injectWhiteRabbit(html);

    fs.writeFileSync(path.join(DIST, filename), html);
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
            // Escape quotes for safe use in HTML attributes
            return line.trim().substring(0, 160).replace(/"/g, '&quot;');
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

// ============================================
// QUEUE ITEM PAGE GENERATION
// ============================================

function buildQueuePages() {
    const queueDataPath = path.join(SRC, 'content', 'queue.json');
    const templatePath = path.join(SRC, 'queue-item-template.html');
    const queueDir = path.join(DIST, 'queue');

    if (!fs.existsSync(queueDataPath)) {
        console.log('  ⚠ No queue.json found, skipping queue pages');
        return 0;
    }

    if (!fs.existsSync(templatePath)) {
        console.log('  ⚠ No queue-item-template.html found, skipping queue pages');
        return 0;
    }

    const queueData = JSON.parse(fs.readFileSync(queueDataPath, 'utf8'));
    const template = fs.readFileSync(templatePath, 'utf8');

    // Clean stale queue pages before rebuilding
    if (fs.existsSync(queueDir)) {
        const staleFiles = fs.readdirSync(queueDir).filter(f => f.endsWith('.html'));
        staleFiles.forEach(f => fs.unlinkSync(path.join(queueDir, f)));
    }
    ensureDir(queueDir);

    let pagesBuilt = 0;

    // Combine all items (queue + completed)
    const allItems = [...queueData.queue, ...queueData.completed];

    for (const item of allItems) {
        const isCompleted = item.status === 'completed';
        
        // Status class and text
        let statusClass = 'status-in-queue';
        let statusText = 'In Queue';
        if (isCompleted) {
            statusClass = 'status-completed';
            statusText = 'Completed';
        }

        // Format dates
        const submittedDate = new Date(item.submitted);
        const submittedStr = submittedDate.toLocaleDateString('en-US', { 
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
        });

        // Position HTML (only for in-queue items)
        let positionHtml = '';
        if (!isCompleted && item.position) {
            positionHtml = `<span class="item-meta-item">📊 Position #${item.position}</span>`;
        }

        // Outcome section (only for completed items)
        let outcomeSection = '';
        if (isCompleted && item.outcome) {
            const outcomeLabels = {
                'go_deeper': '"Let\'s go deeper."',
                'i_know_people': '"I know people."',
                'this_is_sick': '"This is sick."'
            };
            const completedDate = new Date(item.completed);
            const completedStr = completedDate.toLocaleDateString('en-US', { 
                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
            });
            
            outcomeSection = `
            <section class="item-section">
                <h2 class="item-section-title">Outcome</h2>
                <div class="outcome-card">
                    <div class="outcome-label">${outcomeLabels[item.outcome] || item.outcome}</div>
                    <p class="outcome-text">${item.outcome_text || ''}</p>
                    <p style="margin-top: var(--space-sm); font-size: var(--text-sm); color: var(--muted);">
                        Completed on ${completedStr}
                    </p>
                </div>
            </section>`;
        }

        // Work log section (placeholder for now, will be populated when work is done)
        let workLogSection = '';
        if (isCompleted) {
            workLogSection = `
            <section class="item-section">
                <h2 class="item-section-title">Work Session</h2>
                <div class="work-log">
                    <div class="work-log-entry">
                        <div class="work-log-timestamp">Session completed</div>
                        <div class="work-log-content">
                            <p>This problem was worked on during a FogSift session. 
                            ${item.video_published ? 'Video of the work session is available.' : ''}</p>
                        </div>
                    </div>
                </div>
            </section>`;
        }

        // Pending section (only for in-queue items)
        let pendingSection = '';
        if (!isCompleted) {
            pendingSection = `
            <section class="item-section">
                <div class="pending-notice">
                    <div class="pending-notice-icon">⏳</div>
                    <h3 class="pending-notice-title">Waiting in Queue</h3>
                    <p class="pending-notice-text">
                        This problem hasn't been picked yet. When it is, the work session will be documented here.
                    </p>
                </div>
            </section>`;
        }

        // Privacy notice
        let privacyNotice = item.anonymized
            ? '🔒 This submission is anonymized. Personal details are not displayed publicly.'
            : '📢 This work page is public. Others can learn from the problem-solving process.';

        // Generate nav header (queue pages are in queue/ subdirectory)
        const navHeader = generateNavHeader('queue.html', '../');

        // Process template
        let html = template
            .replace(/\{\{THEME_INIT\}\}/g, generateThemeInitScript('../'))
            .replace(/\{\{NAV_HEADER\}\}/g, navHeader)
            .replace(/\{\{ITEM_ID\}\}/g, item.id)
            .replace(/\{\{PROBLEM_SUMMARY\}\}/g, escapeHtml(item.problem_summary))
            .replace(/\{\{STATUS_CLASS\}\}/g, statusClass)
            .replace(/\{\{STATUS_TEXT\}\}/g, statusText)
            .replace(/\{\{DISPLAY_NAME\}\}/g, item.display_name)
            .replace(/\{\{SUBMITTED_DATE\}\}/g, submittedStr)
            .replace(/\{\{CATEGORY\}\}/g, item.category)
            .replace(/\{\{POSITION_HTML\}\}/g, positionHtml)
            .replace(/\{\{OUTCOME_SECTION\}\}/g, outcomeSection)
            .replace(/\{\{WORK_LOG_SECTION\}\}/g, workLogSection)
            .replace(/\{\{PENDING_SECTION\}\}/g, pendingSection)
            .replace(/\{\{PRIVACY_NOTICE\}\}/g, privacyNotice)
            .replace(/\{\{FOOTER\}\}/g, generateFooter('../'));

        const outputPath = path.join(queueDir, `${item.id}.html`);
        fs.writeFileSync(outputPath, html);
        pagesBuilt++;
    }

    return pagesBuilt;
}

// Helper function for HTML escaping in build script
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
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
        const appPath = `${'../'.repeat(depth + 1)}app.js`;
        const wikiNavPath = `${'../'.repeat(depth + 1)}wiki-nav.js`;
        const manifestPath = `${'../'.repeat(depth + 1)}manifest.json`;
        const faviconPath = `${'../'.repeat(depth + 1)}favicon.png`;

        // Generate JD sitemap for this page depth
        const jdSitemap = generateJDSitemap(wikiIndex, depth);

        // Calculate path prefix for nav header (wiki pages are in wiki/ subdirectory)
        const pathPrefix = '../'.repeat(depth + 1);
        const navHeader = generateNavHeader('wiki/index.html', pathPrefix);

        // Process template
        let html = pageTemplate
            .replace(/\{\{THEME_INIT\}\}/g, generateThemeInitScript(pathPrefix))  // TD-010: FOUC prevention
            .replace(/\{\{NAV_HEADER\}\}/g, navHeader)  // DRY: single source nav
            .replace(/\{\{PAGE_TITLE\}\}/g, title)
            .replace(/\{\{PAGE_DESCRIPTION\}\}/g, description)
            .replace(/\{\{PAGE_SLUG\}\}/g, slug)
            .replace(/\{\{BREADCRUMB\}\}/g, breadcrumb)
            .replace(/\{\{WIKI_NAV\}\}/g, wikiNav)
            .replace(/\{\{WIKI_INDEX_PATH\}\}/g, wikiIndexPath)
            .replace(/\{\{ROOT_PATH\}\}/g, rootPath)
            .replace(/\{\{ASSETS_PATH\}\}/g, assetsPath)
            .replace(/\{\{STYLES_PATH\}\}/g, stylesPath)
            .replace(/\{\{APP_PATH\}\}/g, appPath)
            .replace(/\{\{WIKI_NAV_PATH\}\}/g, wikiNavPath)
            .replace(/\{\{MANIFEST_PATH\}\}/g, manifestPath)
            .replace(/\{\{FAVICON_PATH\}\}/g, faviconPath)
            .replace(/\{\{CONTENT\}\}/g, htmlContent)
            .replace(/\{\{JD_SITEMAP\}\}/g, jdSitemap)
            .replace(/\{\{BUILD_DATE\}\}/g, today);


        // Inject White Rabbit with correct path prefix for wiki depth
        const wikiPrefix = '../'.repeat(depth + 1);
        html = injectWhiteRabbit(html, wikiPrefix);

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
        // Wiki index is at wiki/index.html, so prefix is '../' to reach root
        const indexNavHeader = generateNavHeader('wiki/index.html', '../');
        let indexHtml = indexTemplate
            .replace(/\{\{THEME_INIT\}\}/g, generateThemeInitScript('../'))  // TD-010: FOUC prevention
            .replace(/\{\{NAV_HEADER\}\}/g, indexNavHeader)  // DRY: single source nav
            .replace(/\{\{CATEGORIES\}\}/g, categoryCards)
            .replace(/\{\{JD_SITEMAP\}\}/g, jdSitemapIndex)
            .replace(/\{\{BUILD_DATE\}\}/g, today);

        indexHtml = injectWhiteRabbit(indexHtml, '../');
        fs.writeFileSync(path.join(WIKI_DIST, 'index.html'), indexHtml);
        pagesBuilt++;
    }

    return pagesBuilt;
}

// ============================================
// SEARCH INDEX BUILDER
// Generates search-index.json for client-side site search
// ============================================

function stripHtmlTags(html) {
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractSearchContent(html) {
    // Extract title from <title> tag
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/\s*\|.*$/, '').trim() : '';

    // Extract meta description
    const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
    const description = descMatch ? descMatch[1] : '';

    // Extract main content (between <main> tags, skip nav/footer)
    const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    const mainHtml = mainMatch ? mainMatch[1] : '';

    // Extract headings
    const headings = [];
    const headingRegex = /<h[1-6][^>]*>([^<]+(?:<[^>]+>[^<]*)*)<\/h[1-6]>/gi;
    let hMatch;
    while ((hMatch = headingRegex.exec(mainHtml)) !== null) {
        headings.push(stripHtmlTags(hMatch[1]));
    }

    // Get text content from main, strip tags
    const textContent = stripHtmlTags(mainHtml)
        .replace(/\{\{[^}]+\}\}/g, '') // Remove template placeholders
        .substring(0, 500); // Limit content length

    return { title, description, headings, content: textContent };
}

function buildSearchIndex() {
    const index = [];

    // Pages to index with their source files
    const pages = [
        { file: 'index.html', url: 'index.html', category: 'Home' },
        { file: 'about.html', url: 'about.html', category: 'About' },
        { file: 'offers.html', url: 'offers.html', category: 'Offers' },
        { file: 'queue.html', url: 'queue.html', category: 'Queue' },
        { file: 'faq.html', url: 'faq.html', category: 'FAQ' },
        { file: 'portfolio.html', url: 'portfolio.html', category: 'Portfolio' },
        { file: 'contact.html', url: 'contact.html', category: 'Contact' },
        { file: 'vision.html', url: 'vision.html', category: 'Vision' },
        { file: 'terms.html', url: 'terms.html', category: 'Legal' },
        { file: 'privacy.html', url: 'privacy.html', category: 'Legal' },
        { file: 'disclaimer.html', url: 'disclaimer.html', category: 'Legal' },
        { file: 'your-data.html', url: 'your-data.html', category: 'Privacy' },
    ];

    // Index main pages from dist (after they've been built)
    for (const page of pages) {
        const filePath = path.join(DIST, page.file);
        if (!fs.existsSync(filePath)) continue;

        const html = fs.readFileSync(filePath, 'utf8');
        const { title, description, headings, content } = extractSearchContent(html);

        if (title) {
            index.push({
                url: page.url,
                title,
                description,
                headings,
                content,
                category: page.category,
            });
        }
    }

    // Index wiki pages
    const wikiDir = path.join(DIST, 'wiki');
    if (fs.existsSync(wikiDir)) {
        const walkWiki = (dir) => {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    walkWiki(fullPath);
                } else if (entry.name.endsWith('.html')) {
                    const html = fs.readFileSync(fullPath, 'utf8');
                    const { title, description, headings, content } = extractSearchContent(html);
                    const relPath = path.relative(DIST, fullPath);
                    if (title) {
                        index.push({
                            url: relPath,
                            title,
                            description,
                            headings,
                            content,
                            category: 'Wiki',
                        });
                    }
                }
            }
        };
        walkWiki(wikiDir);
    }

    fs.writeFileSync(path.join(DIST, 'search-index.json'), JSON.stringify(index));
    return index.length;
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
    if (processSimpleHtml('privacy.html')) {
        console.log('  ✓ dist/privacy.html (processed)');
    }
    if (processSimpleHtml('disclaimer.html')) {
        console.log('  ✓ dist/disclaimer.html (processed)');
    }
    if (processSimpleHtml('about.html')) {
        console.log('  ✓ dist/about.html (processed)');
    }
    if (processSimpleHtml('process.html')) {
        console.log('  ✓ dist/process.html (processed)');
    }
    if (processSimpleHtml('offers.html')) {
        console.log('  ✓ dist/offers.html (processed)');
    }
    if (processSimpleHtml('contact.html')) {
        console.log('  ✓ dist/contact.html (processed)');
    }
    if (processSimpleHtml('hi.html')) {
        console.log('  ✓ dist/hi.html (processed)');
    }
    // Future pages (uncomment when implemented):
    // if (processSimpleHtml('paperbin-saas.html')) {
    //     console.log('  ✓ dist/paperbin-saas.html (processed)');
    // }
    if (processSimpleHtml('queue.html')) {
        console.log('  ✓ dist/queue.html (processed)');
    }
    if (processSimpleHtml('faq.html')) {
        console.log('  ✓ dist/faq.html (processed)');
    }
    if (processSimpleHtml('portfolio.html')) {
        console.log('  ✓ dist/portfolio.html (processed)');
    }
    if (processSimpleHtml('vision.html')) {
        console.log('  ✓ dist/vision.html (processed)');
    }
    if (processSimpleHtml('terms.html')) {
        console.log('  ✓ dist/terms.html (processed)');
    }
    if (processSimpleHtml('your-data.html')) {
        console.log('  ✓ dist/your-data.html (processed)');
    }
    if (processSimpleHtml('keepers-log.html')) {
        console.log('  ✓ dist/keepers-log.html (processed)');
    }
    if (processSimpleHtml('join.html')) {
        console.log('  ✓ dist/join.html (processed)');
    }
    if (processSimpleHtml('offline.html')) {
        console.log('  ✓ dist/offline.html (processed)');
    }

    // Future pages (uncomment when implemented):
    // if (copyFile('src/gallery.html', 'gallery.html')) {
    //     console.log('  ✓ dist/gallery.html (copied)');
    // }

    // Copy static assets
    console.log('\n📁 Static Assets:');
    STATIC_ASSETS.forEach(asset => {
        if (copyFile(asset.src, asset.dest)) {
            console.log(`  ✓ dist/${asset.dest}`);
        }
    });

    // Copy all portfolio images dynamically
    const portfolioImages = getPortfolioImages();
    portfolioImages.forEach(asset => {
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

    // Build queue item pages
    console.log('\n📋 Queue Pages:');
    const queuePages = buildQueuePages();
    if (queuePages > 0) {
        console.log(`  ✓ Built ${queuePages} queue item pages`);
    }

    // Build API (TKT-x7k9-002, TKT-x7k9-003)
    console.log('\n🔌 API:');
    const apiFiles = buildAPI();
    console.log(`  ✓ Generated ${apiFiles} API endpoints`);

    // Build search index (must run after all pages are built)
    console.log('\n🔍 Search Index:');
    const searchEntries = buildSearchIndex();
    console.log(`  ✓ Indexed ${searchEntries} pages → dist/search-index.json`);

    console.log(`\n✨ Build complete! v${VERSION}`);
    console.log('   Run: npm run dev\n');
}

build().catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
});
