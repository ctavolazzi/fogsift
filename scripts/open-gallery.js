#!/usr/bin/env node
/**
 * Open Achievement Gallery in Cursor's Simple Browser
 * Usage: node scripts/open-gallery.js [--port 5050]
 */

const { exec } = require('child_process');
const os = require('os');

const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
const port = portIndex !== -1 ? args[portIndex + 1] : '5050';
const url = `http://localhost:${port}/gallery.html`;

// VS Code / Cursor Simple Browser URI
const simpleBrowserUri = `vscode://simpleBrowser.show?url=${encodeURIComponent(url)}`;

console.log(`🏆 Opening Achievement Gallery...`);
console.log(`   URL: ${url}`);

// Try to open in Cursor's Simple Browser
function openInCursor() {
    const cmd = os.platform() === 'win32' 
        ? `start "" "${simpleBrowserUri}"`
        : os.platform() === 'darwin'
            ? `open "${simpleBrowserUri}"`
            : `xdg-open "${simpleBrowserUri}"`;
    
    exec(cmd, (err) => {
        if (err) {
            console.log('   ⚠ Could not open Simple Browser, trying system browser...');
            openInSystemBrowser();
        } else {
            console.log('   ✓ Opened in Cursor Simple Browser');
        }
    });
}

// Fallback to system browser
function openInSystemBrowser() {
    const cmd = os.platform() === 'win32' 
        ? `start "" "${url}"`
        : os.platform() === 'darwin'
            ? `open "${url}"`
            : `xdg-open "${url}"`;
    
    exec(cmd, (err) => {
        if (err) {
            console.error('   ✗ Failed to open browser:', err.message);
            console.log(`\n   Manual: Open ${url} in your browser`);
        } else {
            console.log('   ✓ Opened in system browser');
        }
    });
}

openInCursor();
