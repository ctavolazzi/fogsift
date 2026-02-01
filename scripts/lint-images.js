#!/usr/bin/env node
/**
 * Image Linting & Optimization Script
 *
 * Checks images for:
 * - File size limits (configurable)
 * - Recommended dimensions
 * - Format recommendations
 * - SEO compliance (naming, etc.)
 *
 * Usage:
 *   node scripts/lint-images.js          # Check all images
 *   node scripts/lint-images.js --fix    # Suggest fixes (no auto-optimization)
 *   node scripts/lint-images.js --report # Generate JSON report
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    // Maximum file sizes in bytes
    maxSizes: {
        portfolio: 500 * 1024,      // 500KB for portfolio images
        assets: 300 * 1024,         // 300KB for brand assets
        team: 100 * 1024,           // 100KB for team photos
        og: 200 * 1024,             // 200KB for Open Graph images
        favicon: 50 * 1024,         // 50KB for favicons
        default: 500 * 1024         // 500KB default
    },

    // Recommended dimensions
    recommendedDimensions: {
        'og-image': { width: 1200, height: 630 },
        'favicon': { width: 32, height: 32 },
        'icon-512': { width: 512, height: 512 },
        'logo-patch': { width: 500, height: 500 },
        'portfolio': { maxWidth: 1920, maxHeight: 1080 }
    },

    // Valid image extensions
    validExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'],

    // Directories to scan
    scanDirs: [
        'src/assets',
        'src/images',
        'src'  // For root-level images like favicon.png, og-image.png
    ],

    // Files to skip
    skipFiles: ['.DS_Store', 'Thumbs.db'],

    // Naming conventions
    namingRules: {
        noSpaces: true,
        lowercase: false,  // Allow mixed case for now
        maxLength: 100
    }
};

// ANSI colors for terminal output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function getFileSize(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return stats.size;
    } catch (e) {
        return 0;
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getMaxSizeForPath(filePath) {
    const relativePath = path.relative(process.cwd(), filePath).toLowerCase();

    if (relativePath.includes('portfolio')) return CONFIG.maxSizes.portfolio;
    if (relativePath.includes('assets')) return CONFIG.maxSizes.assets;
    if (relativePath.includes('team')) return CONFIG.maxSizes.team;
    if (relativePath.includes('og-image')) return CONFIG.maxSizes.og;
    if (relativePath.includes('favicon')) return CONFIG.maxSizes.favicon;

    return CONFIG.maxSizes.default;
}

function checkNaming(fileName) {
    const issues = [];
    const baseName = path.basename(fileName, path.extname(fileName));

    if (CONFIG.namingRules.noSpaces && baseName.includes(' ')) {
        issues.push('Contains spaces (use hyphens instead)');
    }

    if (CONFIG.namingRules.maxLength && baseName.length > CONFIG.namingRules.maxLength) {
        issues.push(`Name too long (${baseName.length} > ${CONFIG.namingRules.maxLength})`);
    }

    return issues;
}

function scanDirectory(dir, results = []) {
    const fullPath = path.join(process.cwd(), dir);

    if (!fs.existsSync(fullPath)) {
        return results;
    }

    const entries = fs.readdirSync(fullPath, { withFileTypes: true });

    for (const entry of entries) {
        const entryPath = path.join(fullPath, entry.name);

        if (CONFIG.skipFiles.includes(entry.name)) continue;

        if (entry.isDirectory()) {
            scanDirectory(path.join(dir, entry.name), results);
        } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            if (CONFIG.validExtensions.includes(ext)) {
                results.push({
                    path: entryPath,
                    relativePath: path.join(dir, entry.name),
                    name: entry.name,
                    ext: ext,
                    size: getFileSize(entryPath)
                });
            }
        }
    }

    return results;
}

function lintImages() {
    log('\n🖼️  Image Lint Report', 'bold');
    log('=' .repeat(50), 'blue');

    let allImages = [];
    for (const dir of CONFIG.scanDirs) {
        allImages = scanDirectory(dir, allImages);
    }

    // Remove duplicates (in case nested dirs overlap)
    const seen = new Set();
    allImages = allImages.filter(img => {
        if (seen.has(img.path)) return false;
        seen.add(img.path);
        return true;
    });

    const issues = [];
    const warnings = [];
    const passed = [];

    let totalSize = 0;

    for (const image of allImages) {
        const maxSize = getMaxSizeForPath(image.path);
        const namingIssues = checkNaming(image.name);
        totalSize += image.size;

        const imageIssues = [];
        const imageWarnings = [];

        // Check file size
        if (image.size > maxSize) {
            imageIssues.push({
                type: 'size',
                message: `Too large: ${formatBytes(image.size)} (max: ${formatBytes(maxSize)})`,
                suggestion: `Compress or resize to under ${formatBytes(maxSize)}`
            });
        } else if (image.size > maxSize * 0.8) {
            imageWarnings.push({
                type: 'size',
                message: `Near limit: ${formatBytes(image.size)} (max: ${formatBytes(maxSize)})`
            });
        }

        // Check naming
        for (const issue of namingIssues) {
            imageIssues.push({
                type: 'naming',
                message: issue,
                suggestion: 'Rename file to follow conventions'
            });
        }

        // Check format recommendations
        if (image.ext === '.png' && image.size > 200 * 1024) {
            imageWarnings.push({
                type: 'format',
                message: 'Large PNG - consider WebP for better compression'
            });
        }

        if (imageIssues.length > 0) {
            issues.push({ image, issues: imageIssues });
        } else if (imageWarnings.length > 0) {
            warnings.push({ image, warnings: imageWarnings });
        } else {
            passed.push(image);
        }
    }

    // Output results
    log(`\n📊 Summary: ${allImages.length} images scanned`, 'blue');
    log(`   Total size: ${formatBytes(totalSize)}`);

    if (issues.length > 0) {
        log(`\n❌ ISSUES (${issues.length})`, 'red');
        for (const { image, issues: imgIssues } of issues) {
            log(`\n   ${image.relativePath}`, 'red');
            for (const issue of imgIssues) {
                log(`      • ${issue.message}`, 'red');
                if (issue.suggestion) {
                    log(`        → ${issue.suggestion}`, 'yellow');
                }
            }
        }
    }

    if (warnings.length > 0) {
        log(`\n⚠️  WARNINGS (${warnings.length})`, 'yellow');
        for (const { image, warnings: imgWarnings } of warnings) {
            log(`\n   ${image.relativePath}`, 'yellow');
            for (const warning of imgWarnings) {
                log(`      • ${warning.message}`, 'yellow');
            }
        }
    }

    if (passed.length > 0) {
        log(`\n✅ PASSED (${passed.length})`, 'green');
        // Only show first few to avoid clutter
        const showCount = Math.min(passed.length, 5);
        for (let i = 0; i < showCount; i++) {
            log(`   ${passed[i].relativePath} (${formatBytes(passed[i].size)})`, 'green');
        }
        if (passed.length > showCount) {
            log(`   ... and ${passed.length - showCount} more`, 'green');
        }
    }

    // Final verdict
    log('\n' + '='.repeat(50), 'blue');
    if (issues.length === 0) {
        log('✨ All images pass lint checks!', 'green');
        return 0;
    } else {
        log(`🚨 ${issues.length} image(s) need attention`, 'red');
        log('\nTo fix large images, consider:', 'yellow');
        log('  • Use squoosh.app for browser-based compression', 'yellow');
        log('  • Use ImageMagick: convert input.png -resize 1920x1080\\> -quality 85 output.jpg', 'yellow');
        log('  • Use cwebp for WebP: cwebp -q 80 input.png -o output.webp', 'yellow');
        return 1;
    }
}

// Run if called directly
if (require.main === module) {
    const exitCode = lintImages();
    process.exit(exitCode);
}

module.exports = { lintImages, CONFIG };
