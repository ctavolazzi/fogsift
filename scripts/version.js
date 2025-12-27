#!/usr/bin/env node
/**
 * FOGSIFT VERSION MANAGER
 * Handles semantic versioning with changelog and git integration
 * 
 * Usage:
 *   npm run version:patch  - Bug fixes, new components, deletions (0.0.X)
 *   npm run version:minor  - New pages, major features (0.X.0)
 *   npm run version:major  - Breaking changes, redesigns (X.0.0)
 * 
 * No external dependencies - uses Node.js built-ins
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const ROOT = path.join(__dirname, '..');
const PKG_PATH = path.join(ROOT, 'package.json');
const VERSION_PATH = path.join(ROOT, 'version.json');
const CHANGELOG_PATH = path.join(ROOT, 'CHANGELOG.md');

// Get bump type from args
const bumpType = process.argv[2]; // 'patch', 'minor', or 'major'

if (!bumpType || !['patch', 'minor', 'major'].includes(bumpType)) {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║  FOGSIFT VERSION MANAGER                                  ║
╚═══════════════════════════════════════════════════════════╝

Usage:
  npm run version:patch  - Bug fixes, new components (0.0.X)
  npm run version:minor  - New pages, features (0.X.0)
  npm run version:major  - Breaking changes (X.0.0)

Examples:
  • New button added       → patch (0.0.1 → 0.0.2)
  • Component deleted      → patch (0.0.2 → 0.0.3)
  • New page created       → minor (0.0.3 → 0.1.0)
  • Complete redesign      → major (0.1.0 → 1.0.0)
  • Button style fix       → No version bump (just commit)
`);
    process.exit(1);
}

function readJSON(filepath) {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
}

function writeJSON(filepath, data) {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2) + '\n');
}

function bumpVersion(version, type) {
    const [major, minor, patch] = version.split('.').map(Number);
    
    switch (type) {
        case 'major':
            return `${major + 1}.0.0`;
        case 'minor':
            return `${major}.${minor + 1}.0`;
        case 'patch':
            return `${major}.${minor}.${patch + 1}`;
        default:
            return version;
    }
}

function getToday() {
    return new Date().toISOString().split('T')[0];
}

function exec(cmd, options = {}) {
    try {
        return execSync(cmd, { cwd: ROOT, encoding: 'utf8', ...options });
    } catch (e) {
        if (!options.ignoreError) {
            console.error(`Command failed: ${cmd}`);
            console.error(e.message);
        }
        return null;
    }
}

function gitStatus() {
    const status = exec('git status --porcelain', { ignoreError: true });
    return status ? status.trim().split('\n').filter(Boolean) : [];
}

function updateChangelog(version, description, type) {
    const today = getToday();
    const typeLabels = {
        patch: 'Patch',
        minor: 'Minor Release',
        major: 'Major Release'
    };
    
    const newEntry = `
## [${version}] - ${today}
### ${typeLabels[type]}
${description.split('\n').map(line => `- ${line}`).join('\n')}
`;
    
    let changelog = '';
    if (fs.existsSync(CHANGELOG_PATH)) {
        changelog = fs.readFileSync(CHANGELOG_PATH, 'utf8');
        // Insert after the first line (# Changelog)
        const lines = changelog.split('\n');
        const headerEnd = lines.findIndex((line, i) => i > 0 && line.startsWith('## '));
        if (headerEnd > 0) {
            lines.splice(headerEnd, 0, newEntry);
            changelog = lines.join('\n');
        } else {
            changelog = changelog + newEntry;
        }
    } else {
        changelog = `# Changelog

All notable changes to Fogsift will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).
${newEntry}`;
    }
    
    fs.writeFileSync(CHANGELOG_PATH, changelog);
}

async function prompt(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    return new Promise(resolve => {
        rl.question(question, answer => {
            rl.close();
            resolve(answer);
        });
    });
}

async function main() {
    console.log('\n🔧 FOGSIFT VERSION MANAGER\n');
    
    // Read current version
    const pkg = readJSON(PKG_PATH);
    const currentVersion = pkg.version;
    const newVersion = bumpVersion(currentVersion, bumpType);
    
    console.log(`  Current: v${currentVersion}`);
    console.log(`  New:     v${newVersion} (${bumpType})\n`);
    
    // Get change description
    const description = await prompt('📝 Describe the changes (or press Enter for default): ');
    const finalDescription = description.trim() || `${bumpType.charAt(0).toUpperCase() + bumpType.slice(1)} release`;
    
    console.log('\n⏳ Processing...\n');
    
    // Update package.json
    pkg.version = newVersion;
    writeJSON(PKG_PATH, pkg);
    console.log('  ✓ Updated package.json');
    
    // Update or create version.json
    let versionData = { version: newVersion, released: getToday(), history: [] };
    if (fs.existsSync(VERSION_PATH)) {
        versionData = readJSON(VERSION_PATH);
        versionData.history.unshift({
            version: currentVersion,
            date: versionData.released,
            type: bumpType
        });
    }
    versionData.version = newVersion;
    versionData.released = getToday();
    writeJSON(VERSION_PATH, versionData);
    console.log('  ✓ Updated version.json');
    
    // Update changelog
    updateChangelog(newVersion, finalDescription, bumpType);
    console.log('  ✓ Updated CHANGELOG.md');
    
    // Run build
    console.log('\n📦 Running build...');
    exec('node scripts/build.js');
    console.log('  ✓ Build complete');
    
    // Git operations
    console.log('\n📌 Git operations...');
    
    const changes = gitStatus();
    if (changes.length > 0) {
        exec('git add -A');
        exec(`git commit -m "release: v${newVersion}"`);
        console.log(`  ✓ Committed: release: v${newVersion}`);
        
        exec(`git tag -a v${newVersion} -m "Release v${newVersion}"`);
        console.log(`  ✓ Tagged: v${newVersion}`);
    } else {
        console.log('  ⚠ No changes to commit');
    }
    
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║  ✨ Released v${newVersion.padEnd(44)}║
╚═══════════════════════════════════════════════════════════╝

Next steps:
  • Review CHANGELOG.md
  • Push to remote: git push && git push --tags
  • Deploy: npm run deploy
`);
}

main().catch(console.error);

