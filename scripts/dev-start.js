#!/usr/bin/env node
/**
 * FOGSIFT DEV STARTUP
 *
 * Starts the full development environment:
 *   1. Runs health check
 *   2. Builds the site
 *   3. Starts all dev servers in parallel
 *   4. Prints the dashboard
 *
 * Usage:
 *   npm run start          — Full suite (site + all helpers)
 *   npm run start:site     — Site only (build + browser-sync)
 *   node scripts/dev-start.js --no-helpers  — Same as start:site
 *
 * Ports:
 *   5001  The Keeper's Log (AI Journal)
 *   5030  The Signal Workshop (Component Library)
 *   5050  FogSift dev server
 *   5065  Captain FogLift's Quality Report (Test Viewer)
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const noHelpers = process.argv.includes('--no-helpers');

// ── Colors ──
const c = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
  white: '\x1b[37m',
};

function log(msg) { console.log(msg); }
function dim(msg) { return `${c.dim}${msg}${c.reset}`; }
function bold(msg) { return `${c.bold}${msg}${c.reset}`; }

// ── Banner ──
function printBanner() {
  log('');
  log(`${c.cyan}${c.bold}  ╔═══════════════════════════════════════════════╗${c.reset}`);
  log(`${c.cyan}${c.bold}  ║          FOGSIFT — THE LIGHTHOUSE             ║${c.reset}`);
  log(`${c.cyan}${c.bold}  ║     "The fog doesn't lift itself."            ║${c.reset}`);
  log(`${c.cyan}${c.bold}  ╚═══════════════════════════════════════════════╝${c.reset}`);
  log('');
}

// ── Health check ──
function runHealthCheck() {
  const healthScript = path.join(ROOT, '_tools', 'scripts', 'health-check.js');
  if (!fs.existsSync(healthScript)) {
    log(`  ${c.yellow}⚠${c.reset} Health check script not found, skipping`);
    return true;
  }

  log(`  ${c.dim}Running health check...${c.reset}`);
  try {
    execSync(`node "${healthScript}"`, { cwd: ROOT, stdio: 'pipe' });
    log(`  ${c.green}✓${c.reset} Health check passed`);
    return true;
  } catch (e) {
    log(`  ${c.yellow}⚠${c.reset} Health check found issues (non-blocking)`);
    // Print output if available
    if (e.stdout) {
      const lines = e.stdout.toString().split('\n').filter(l => l.includes('✗'));
      lines.forEach(l => log(`    ${l}`));
    }
    return true; // non-blocking — still start
  }
}

// ── Build ──
function runBuild() {
  log(`  ${c.dim}Building site...${c.reset}`);
  try {
    execSync('node scripts/build.js', { cwd: ROOT, stdio: 'pipe' });
    log(`  ${c.green}✓${c.reset} Build complete`);
    return true;
  } catch (e) {
    log(`  ${c.red}✗ Build failed${c.reset}`);
    if (e.stderr) log(e.stderr.toString());
    return false;
  }
}

// ── Server management ──
const children = [];

function startServer(name, command, args, cwd, port) {
  const label = `${c.dim}[${name}]${c.reset}`;

  const child = spawn(command, args, {
    cwd: cwd || ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env },
  });

  child.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      // Only show meaningful output, skip noisy browser-sync logs
      if (line.trim() && !line.includes('[Browsersync]') || line.includes('Local')) {
        // suppress most chatter
      }
    });
  });

  child.stderr.on('data', (data) => {
    const msg = data.toString().trim();
    if (msg && !msg.includes('ExperimentalWarning')) {
      log(`  ${label} ${c.yellow}${msg}${c.reset}`);
    }
  });

  child.on('error', (err) => {
    log(`  ${label} ${c.red}Failed to start: ${err.message}${c.reset}`);
  });

  child.on('exit', (code) => {
    if (code !== null && code !== 0) {
      log(`  ${label} ${c.yellow}Exited with code ${code}${c.reset}`);
    }
  });

  children.push({ name, child, port });
  return child;
}

function cleanup() {
  log('');
  log(`  ${c.dim}Shutting down...${c.reset}`);
  children.forEach(({ name, child }) => {
    try { child.kill('SIGTERM'); } catch (e) { /* already dead */ }
  });
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// ── Port check ──
function isPortFree(port) {
  try {
    execSync(`lsof -i :${port} -t`, { stdio: 'pipe' });
    return false; // something is listening
  } catch (e) {
    return true; // nothing listening
  }
}

// ── Dashboard ──
function printDashboard() {
  log('');
  log(`  ${c.bold}${c.white}Dev servers running:${c.reset}`);
  log(`  ${'─'.repeat(45)}`);
  log(`  ${c.green}●${c.reset} ${bold('FogSift')}              ${c.cyan}http://localhost:5050${c.reset}`);

  if (!noHelpers) {
    log(`  ${c.green}●${c.reset} ${bold("Keeper's Log")}         ${c.cyan}http://localhost:5001${c.reset}`);
    log(`  ${c.green}●${c.reset} ${bold('Signal Workshop')}      ${c.cyan}http://localhost:5030${c.reset}`);
    log(`  ${c.green}●${c.reset} ${bold('Quality Report')}       ${c.cyan}http://localhost:5065${c.reset}`);
  }

  log(`  ${'─'.repeat(45)}`);
  log('');
  log(`  ${c.dim}Watching src/ for changes (auto-rebuild)${c.reset}`);
  log(`  ${c.dim}Press Ctrl+C to stop all servers${c.reset}`);
  log('');
}

// ── Main ──
async function main() {
  printBanner();

  // Step 1: Health check
  runHealthCheck();

  // Step 2: Build
  if (!runBuild()) {
    log(`\n  ${c.red}Cannot start — fix build errors first.${c.reset}\n`);
    process.exit(1);
  }

  log('');
  log(`  ${c.dim}Starting servers...${c.reset}`);

  // Step 3: Start main site (browser-sync + watcher)
  if (isPortFree(5050)) {
    startServer('site', 'npx', ['browser-sync', 'start', '--config', 'bs-config.js'], ROOT, 5050);
  } else {
    log(`  ${c.yellow}⚠${c.reset} Port 5050 in use — skipping site server`);
  }

  // File watcher for auto-rebuild
  startServer('watch', 'npx', ['chokidar', 'src/**/*', '-c', 'node scripts/build.js'], ROOT, null);

  // Step 4: Start helper servers (unless --no-helpers)
  if (!noHelpers) {
    const helpers = [
      { name: 'journal', script: '_AI_Journal/serve.js', port: 5001 },
      { name: 'components', script: '_tools/component-library/serve.js', port: 5030 },
      { name: 'tests', script: '_tools/test-viewer/serve.js', port: 5065 },
    ];

    helpers.forEach(({ name, script, port }) => {
      const scriptPath = path.join(ROOT, script);
      if (!fs.existsSync(scriptPath)) {
        log(`  ${c.yellow}⚠${c.reset} ${name} server not found at ${script}, skipping`);
        return;
      }
      if (isPortFree(port)) {
        startServer(name, 'node', [scriptPath], ROOT, port);
      } else {
        log(`  ${c.yellow}⚠${c.reset} Port ${port} in use — skipping ${name}`);
      }
    });
  }

  // Brief pause for servers to bind
  await new Promise(r => setTimeout(r, 1000));

  // Step 5: Dashboard
  printDashboard();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
