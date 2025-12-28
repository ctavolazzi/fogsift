#!/usr/bin/env node
/**
 * MCP STATUS WRITER
 *
 * Reads work effort data from _work_efforts_/ and writes
 * status.json for the dashboard to consume.
 *
 * Usage:
 *   node scripts/mcp-status-writer.js           # Run once
 *   node scripts/mcp-status-writer.js --watch   # Watch mode
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const WORK_EFFORTS_DIR = path.join(ROOT, '_work_efforts_');
const STATUS_OUTPUT = path.join(ROOT, 'src', 'content', 'status.json');

// MCP Servers to monitor (extend this list as needed)
const MCP_SERVERS = [
    { name: 'sequential-thinking', statusText: 'Online' },
    { name: 'memory', statusText: 'Online' },
    { name: 'filesystem', statusText: 'Online' },
    { name: 'docs-maintainer', statusText: 'Online' },
    { name: 'browser', statusText: 'Online' },
    { name: 'work-efforts', statusText: 'v0.3.0' },
];

// Pipeline stages
const PIPELINE_STAGES = [
    { id: 'plan', label: 'Plan' },
    { id: 'ticket', label: 'Ticket' },
    { id: 'execute', label: 'Execute' },
    { id: 'verify', label: 'Verify' },
    { id: 'done', label: 'Done' },
];

/**
 * Parse YAML frontmatter from markdown file
 */
function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return {};

    const yaml = match[1];
    const result = {};

    for (const line of yaml.split('\n')) {
        const colonIdx = line.indexOf(':');
        if (colonIdx === -1) continue;

        const key = line.substring(0, colonIdx).trim();
        let value = line.substring(colonIdx + 1).trim();

        // Remove quotes
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }

        result[key] = value;
    }

    return result;
}

/**
 * Find all work effort directories (WE-YYMMDD-xxxx_*)
 */
function findWorkEffortDirs() {
    const dirs = [];

    if (!fs.existsSync(WORK_EFFORTS_DIR)) {
        console.warn('  Warning: _work_efforts_ directory not found');
        return dirs;
    }

    const entries = fs.readdirSync(WORK_EFFORTS_DIR, { withFileTypes: true });

    for (const entry of entries) {
        if (entry.isDirectory() && entry.name.match(/^WE-\d{6}-[a-z0-9]{4}_/)) {
            dirs.push(path.join(WORK_EFFORTS_DIR, entry.name));
        }
    }

    // Sort by date (newest first)
    dirs.sort((a, b) => b.localeCompare(a));

    return dirs;
}

/**
 * Read work effort data from a directory
 */
function readWorkEffort(dir) {
    const dirName = path.basename(dir);
    const idMatch = dirName.match(/^(WE-\d{6}-[a-z0-9]{4})/);
    if (!idMatch) return null;

    const weId = idMatch[1];
    const indexPath = path.join(dir, `${weId}_index.md`);

    if (!fs.existsSync(indexPath)) {
        console.warn(`  Warning: Index file not found: ${indexPath}`);
        return null;
    }

    const content = fs.readFileSync(indexPath, 'utf8');
    const frontmatter = parseFrontmatter(content);

    // Read tickets
    const tickets = [];
    const ticketsDir = path.join(dir, 'tickets');

    if (fs.existsSync(ticketsDir)) {
        const ticketFiles = fs.readdirSync(ticketsDir)
            .filter(f => f.endsWith('.md'))
            .sort();

        for (const ticketFile of ticketFiles) {
            const ticketContent = fs.readFileSync(path.join(ticketsDir, ticketFile), 'utf8');
            const ticketFm = parseFrontmatter(ticketContent);

            tickets.push({
                id: ticketFm.id || ticketFile.replace('.md', ''),
                title: ticketFm.title || 'Untitled',
                status: ticketFm.status || 'pending',
            });
        }
    }

    return {
        id: frontmatter.id || weId,
        title: frontmatter.title || 'Untitled Work Effort',
        status: frontmatter.status || 'active',
        created: frontmatter.created || new Date().toISOString(),
        tickets,
    };
}

/**
 * Determine pipeline status based on work effort state
 */
function getPipelineStatus(workEffort) {
    if (!workEffort) {
        return PIPELINE_STAGES.map(s => ({ ...s, status: 'pending' }));
    }

    const { status, tickets } = workEffort;
    const completedCount = tickets.filter(t => t.status === 'completed').length;
    const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;
    const totalCount = tickets.length;

    // Determine current stage
    let currentStage = 'plan';

    if (status === 'completed') {
        currentStage = 'done';
    } else if (completedCount > 0 && completedCount === totalCount) {
        currentStage = 'verify';
    } else if (inProgressCount > 0 || completedCount > 0) {
        currentStage = 'execute';
    } else if (totalCount > 0) {
        currentStage = 'ticket';
    }

    // Build pipeline with statuses
    const stageOrder = ['plan', 'ticket', 'execute', 'verify', 'done'];
    const currentIdx = stageOrder.indexOf(currentStage);

    return PIPELINE_STAGES.map(stage => {
        const stageIdx = stageOrder.indexOf(stage.id);
        let pipelineStatus = 'pending';

        if (stageIdx < currentIdx) {
            pipelineStatus = 'complete';
        } else if (stageIdx === currentIdx) {
            pipelineStatus = status === 'completed' ? 'complete' : 'active';
        }

        return { ...stage, status: pipelineStatus };
    });
}

/**
 * Generate progress summary for work effort
 */
function getProgressSummary(workEffort) {
    if (!workEffort) return 'No active work effort';

    const { tickets, status } = workEffort;
    const completed = tickets.filter(t => t.status === 'completed').length;
    const total = tickets.length;

    if (status === 'completed') {
        return `All ${total} tickets completed!`;
    }

    if (completed === 0) {
        return `${total} tickets pending`;
    }

    return `${completed}/${total} tickets completed`;
}

/**
 * Build and write status.json
 */
function writeStatus() {
    console.log('\nMCP Status Writer');
    console.log('='.repeat(40));

    // Find most recent active work effort
    const weDirs = findWorkEffortDirs();
    console.log(`  Found ${weDirs.length} work effort(s)`);

    // Read all work efforts
    const workEfforts = weDirs
        .map(readWorkEffort)
        .filter(Boolean);

    // Find active work effort (most recent non-completed, or most recent)
    let activeWE = workEfforts.find(we => we.status === 'active' || we.status === 'in_progress');
    if (!activeWE && workEfforts.length > 0) {
        activeWE = workEfforts[0]; // Fall back to most recent
    }

    if (activeWE) {
        console.log(`  Active: ${activeWE.id} - ${activeWE.title}`);
    }

    // Build status object
    const status = {
        lastUpdated: new Date().toISOString(),
        servers: MCP_SERVERS.map(s => ({
            name: s.name,
            status: 'online', // TODO: Actually ping servers
            statusText: s.statusText,
        })),
        pipeline: getPipelineStatus(activeWE),
        activeWorkEffort: activeWE ? {
            id: activeWE.id,
            title: activeWE.title,
            status: activeWE.status,
            progress: getProgressSummary(activeWE),
            tickets: activeWE.tickets.slice(0, 10), // Limit to 10 tickets
        } : null,
    };

    // Ensure output directory exists
    const outputDir = path.dirname(STATUS_OUTPUT);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write status.json
    fs.writeFileSync(STATUS_OUTPUT, JSON.stringify(status, null, 2) + '\n');
    console.log(`  Written: ${STATUS_OUTPUT}`);
    console.log(`  Timestamp: ${status.lastUpdated}`);

    return status;
}

/**
 * Watch mode - rebuild on changes
 */
function watchMode() {
    console.log('\nStarting watch mode...');
    console.log('Press Ctrl+C to stop\n');

    // Initial write
    writeStatus();

    // Watch for changes
    let debounceTimer = null;

    fs.watch(WORK_EFFORTS_DIR, { recursive: true }, (eventType, filename) => {
        if (!filename || !filename.endsWith('.md')) return;

        // Debounce rapid changes
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            console.log(`\n  Change detected: ${filename}`);
            writeStatus();
        }, 500);
    });

    console.log(`Watching: ${WORK_EFFORTS_DIR}`);
}

// Main
const args = process.argv.slice(2);

if (args.includes('--watch') || args.includes('-w')) {
    watchMode();
} else {
    writeStatus();
    console.log('\nDone. Run with --watch for continuous updates.\n');
}
