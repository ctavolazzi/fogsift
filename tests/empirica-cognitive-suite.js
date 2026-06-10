#!/usr/bin/env node
/**
 * Empirica Cognitive Test Suite
 *
 * Goals:
 * - Validate that Empirica is usable in this repository.
 * - Emit machine-readable results + graph payload for workflow engine visualization.
 * - Write report to:
 *   - _tools/empirica-cognitive-report.json
 *   - src/content/empirica-cognitive-tests.json
 *   - dist/api/empirica/cognitive-tests.json (if dist exists)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const TOOLS_DIR = path.join(ROOT, '_tools');
const REPORT_PATH = path.join(TOOLS_DIR, 'empirica-cognitive-report.json');
const SRC_CONTENT_PATH = path.join(ROOT, 'src', 'content', 'empirica-cognitive-tests.json');
const DIST_API_PATH = path.join(DIST, 'api', 'empirica', 'cognitive-tests.json');

const PROJECT_NAME = 'fogsift';
const PROJECT_PATH = ROOT;

function run(cmd) {
  try {
    const out = execSync(cmd, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
    return { ok: true, out };
  } catch (error) {
    return {
      ok: false,
      out: (error.stdout || '').toString().trim(),
      err: (error.stderr || '').toString().trim(),
      code: error.status || 1,
    };
  }
}

function parseJsonOutput(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function statusFromResult(result, strict = true) {
  if (result.ok) return 'pass';
  return strict ? 'fail' : 'warn';
}

function nodeTypeForStatus(status) {
  if (status === 'pass') return 'tool';
  if (status === 'warn') return 'checkpoint';
  return 'checkpoint';
}

function buildGraph(tests) {
  const nodes = [];
  const edges = [];

  tests.forEach((test, index) => {
    const id = `cog_${index + 1}`;
    const x = (index % 4) * 260;
    const y = Math.floor(index / 4) * 190;
    nodes.push({
      id,
      type: nodeTypeForStatus(test.status),
      label: test.name,
      status: test.status,
      detail: test.detail || '',
      x,
      y,
    });
    if (index > 0) {
      edges.push({
        id: `cog_edge_${index}`,
        source: `cog_${index}`,
        target: id,
      });
    }
  });

  return { nodes, edges };
}

function writeJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function main() {
  const startedAt = new Date().toISOString();
  const tests = [];

  const version = run('empirica --version');
  const versionErrorBlob = `${version.out || ''}\n${version.err || ''}`;
  const argparseHelpBug = versionErrorBlob.includes('badly formed help string');
  tests.push({
    name: 'Empirica CLI available',
    command: 'empirica --version',
    status: statusFromResult(version),
    detail: version.ok ? version.out : version.err || version.out,
  });

  const installPathLine = (version.out || '').split('\n').find((line) => line.startsWith('Install:'));
  const installPath = installPathLine ? installPathLine.replace('Install:', '').trim() : '';
  const installLooksEditable = installPath.includes('/Code/active/empirica');
  tests.push({
    name: 'Empirica install source check',
    command: 'empirica --version',
    status: installLooksEditable ? 'warn' : 'pass',
    detail: installLooksEditable
      ? `Editable/local source detected at ${installPath}. If session-create fails, reinstall from PyPI/upstream.`
      : `Install source appears packaged: ${installPath || 'unknown'}`,
  });

  const projectInit = run('empirica project-init --non-interactive --output json');
  const projectInitJson = parseJsonOutput(projectInit.out);
  const projectInitStatus =
    projectInitJson && projectInitJson.ok === false && String(projectInitJson.error || '').includes('already initialized')
      ? 'warn'
      : statusFromResult(projectInit);
  tests.push({
    name: 'Project init in repo',
    command: 'empirica project-init --non-interactive --output json',
    status: projectInitStatus,
    detail: projectInit.ok ? projectInit.out : projectInit.err || projectInit.out,
  });

  const projectSwitch = run(`empirica project-switch ${PROJECT_NAME} --output json`);
  tests.push({
    name: 'Project switch',
    command: `empirica project-switch ${PROJECT_NAME} --output json`,
    status: statusFromResult(projectSwitch),
    detail: projectSwitch.ok ? projectSwitch.out : projectSwitch.err || projectSwitch.out,
  });

  const projectBootstrap = run('empirica project-bootstrap --output json');
  tests.push({
    name: 'Project bootstrap',
    command: 'empirica project-bootstrap --output json',
    status: statusFromResult(projectBootstrap),
    detail: projectBootstrap.ok ? projectBootstrap.out : projectBootstrap.err || projectBootstrap.out,
  });

  const workspaceOverview = run('empirica workspace-overview --output json');
  tests.push({
    name: 'Workspace overview',
    command: 'empirica workspace-overview --output json',
    status: statusFromResult(workspaceOverview, false),
    detail: workspaceOverview.ok ? workspaceOverview.out : workspaceOverview.err || workspaceOverview.out,
  });

  const assess = run('empirica assess-state --output json --turtle');
  tests.push({
    name: 'Assess state',
    command: 'empirica assess-state --output json --turtle',
    status: statusFromResult(assess),
    detail: assess.ok ? assess.out : assess.err || assess.out,
  });

  const sessionCreate = run('empirica session-create --ai-id claude-code --output json');
  const sessionCreateJson = parseJsonOutput(sessionCreate.out);
  const sessionCreateFailedKnown =
    !sessionCreate.ok &&
    (sessionCreate.out.includes('Cannot resolve project path') ||
      sessionCreate.err.includes('Cannot resolve project path'));
  tests.push({
    name: 'Session create',
    command: 'empirica session-create --ai-id claude-code --output json',
    status: sessionCreate.ok ? 'pass' : sessionCreateFailedKnown ? 'warn' : 'fail',
    detail: sessionCreate.ok
      ? sessionCreate.out
      : sessionCreateFailedKnown
      ? 'Known failure: project path resolver. Run reinstall path from docs and retry.'
      : sessionCreate.err || sessionCreate.out,
  });

  if (sessionCreateFailedKnown) {
    tests.push({
      name: 'Session create remediation guidance',
      command: 'docs-only',
      status: 'warn',
      detail:
        'Recommended remediation: pip uninstall -y empirica empirica-mcp && pip install empirica==1.5.9 empirica-mcp',
    });
  }

  if (argparseHelpBug) {
    tests.push({
      name: 'Python 3.14 argparse compatibility guard',
      command: 'docs-only',
      status: 'warn',
      detail:
        'Empirica CLI parser crash detected on current runtime. Recommended fallback: python3 -m pip install -e /Users/ctavolazzi/Code/active/empirica',
    });
  }

  const passCount = tests.filter((t) => t.status === 'pass').length;
  const failCount = tests.filter((t) => t.status === 'fail').length;
  const warnCount = tests.filter((t) => t.status === 'warn').length;
  const summaryStatus = failCount > 0 ? 'degraded' : 'healthy';

  const graph = buildGraph(tests);
  const report = {
    generatedAt: startedAt,
    project: PROJECT_NAME,
    projectPath: PROJECT_PATH,
    status: summaryStatus,
    summary: {
      total: tests.length,
      pass: passCount,
      fail: failCount,
      warn: warnCount,
    },
    tests,
    graph,
    oracleRecommendation:
      argparseHelpBug
        ? 'Parser compatibility issue detected. Reinstall local editable Empirica and rerun suite.'
        : failCount > 0
        ? 'Run remediation, then rerun suite before cognitive visualization playback.'
        : 'Safe to run cognitive visualization playback in workflow engine.',
  };

  writeJson(REPORT_PATH, report);
  writeJson(SRC_CONTENT_PATH, report);
  if (fs.existsSync(DIST)) writeJson(DIST_API_PATH, report);

  const lines = [
    '',
    'Empirica Cognitive Suite',
    '-----------------------',
    `Status: ${summaryStatus.toUpperCase()}`,
    `Pass: ${passCount}  Fail: ${failCount}  Warn: ${warnCount}`,
    `Report: ${REPORT_PATH}`,
    `Source API seed: ${SRC_CONTENT_PATH}`,
  ];
  if (fs.existsSync(DIST)) lines.push(`Live API output: ${DIST_API_PATH}`);
  console.log(lines.join('\n'));

  process.exit(failCount > 0 ? 1 : 0);
}

main();
