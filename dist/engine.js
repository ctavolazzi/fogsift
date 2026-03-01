/**
 * engine.js — FogSift Engine: Interactive Agent Orchestration Visualizer
 * Vanilla JS port of the React/JSX Fogsift Engine component.
 * Delta-time rAF loop · Cubic Bézier path interpolation · Pointer Events API
 * Dependencies: none (standalone static asset)
 */

// ======================================================================
// SECTION 1: CONSTANTS
// ======================================================================

const THEME = {
  bg: '#020617',
  grid_main: '#1e293b',
  grid_sub: '#0f172a',
  t_cyan: '#06b6d4',
  t_pink: '#ec4899',
  t_amber: '#f59e0b',
  t_red: '#ef4444',
  t_purple: '#8b5cf6',
  t_emerald: '#10b981',
  node_core: '#0f172a',
  text_bright: '#f8fafc',
};

const NODE_TYPES = {
  trigger:    { iconKey: 'zap',             color: THEME.t_cyan,    label: 'Trigger' },
  router:     { iconKey: 'diamond',          color: THEME.t_purple,  label: 'Router' },
  agent:      { iconKey: 'bot',              color: THEME.t_pink,    label: 'Agent' },
  tool:       { iconKey: 'activity',         color: THEME.t_amber,   label: 'Tool' },
  memory:     { iconKey: 'database',         color: THEME.t_amber,   label: 'Memory' },
  aggregator: { iconKey: 'arrowDownToLine',  color: THEME.t_purple,  label: 'Merge' },
  checkpoint: { iconKey: 'shieldAlert',      color: THEME.t_red,     label: 'Checkpoint' },
  output:     { iconKey: 'checkCircle',      color: THEME.t_emerald, label: 'Output' },
};

const DEMO_NODES = [
  { id: 'd1',  type: 'trigger',    label: 'Email Webhook',   x:  200, y:    0 },
  { id: 'd2',  type: 'trigger',    label: 'Slack Mention',   x: -100, y:    0 },
  { id: 'd3',  type: 'aggregator', label: 'Ingest Queue',    x:   50, y:  150 },
  { id: 'd4',  type: 'router',     label: 'Triage Brain',    x:   50, y:  300 },
  { id: 'd5',  type: 'memory',     label: 'Fogsift Context', x: -200, y:  450 },
  { id: 'd6',  type: 'tool',       label: 'Stripe API',      x:  300, y:  450 },
  { id: 'd7',  type: 'agent',      label: 'Tech Agent',      x: -100, y:  600 },
  { id: 'd8',  type: 'agent',      label: 'Billing Agent',   x:  200, y:  600 },
  { id: 'd9',  type: 'aggregator', label: 'Response Merge',  x:   50, y:  800 },
  { id: 'd10', type: 'checkpoint', label: 'QA Check',        x:   50, y:  950 },
  { id: 'd11', type: 'output',     label: 'Send Reply',      x:   50, y: 1100 },
];

const DEMO_EDGES = [
  { id: 'de1',  source: 'd1',  target: 'd3' },
  { id: 'de2',  source: 'd2',  target: 'd3' },
  { id: 'de3',  source: 'd3',  target: 'd4' },
  { id: 'de4',  source: 'd4',  target: 'd5', label: 'is_technical' },
  { id: 'de5',  source: 'd4',  target: 'd6', label: 'is_billing' },
  { id: 'de6',  source: 'd5',  target: 'd7' },
  { id: 'de7',  source: 'd6',  target: 'd8' },
  { id: 'de8',  source: 'd7',  target: 'd9' },
  { id: 'de9',  source: 'd8',  target: 'd9' },
  { id: 'de10', source: 'd9',  target: 'd10' },
  { id: 'de11', source: 'd10', target: 'd11' },
];

// Lucide icon SVG paths (stroke-based, viewBox 0 0 24 24)
const ICON_PATHS = {
  zap:            '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  diamond:        '<path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0z"/>',
  database:       '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
  bot:            '<rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/>',
  activity:       '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  arrowDownToLine:'<line x1="12" y1="17" x2="12" y2="3"/><polyline points="7 12 12 17 17 12"/><line x1="19" y1="21" x2="5" y2="21"/>',
  checkCircle:    '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  shieldAlert:    '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  play:           '<polygon points="5 3 19 12 5 21 5 3"/>',
  square:         '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>',
  brainCircuit:   '<circle cx="12" cy="12" r="3"/><path d="M6.3 20.3a2.49 2.49 0 0 0 3.4 0L12 18l2.3 2.3a2.49 2.49 0 0 0 3.4 0l.4-.4a2.49 2.49 0 0 0 0-3.4L16 14l2.1-2.1A2.5 2.5 0 0 0 18 8.4V8a2 2 0 0 0-2-2h-.4a2.5 2.5 0 0 0-3.6.1L12 6l-.1-.1a2.5 2.5 0 0 0-3.6-.1H8a2 2 0 0 0-2 2v.4a2.5 2.5 0 0 0 .1 3.5L8 14l-2.1 2.2a2.49 2.49 0 0 0 0 3.4z"/>',
  target:         '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  plus:           '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  x:              '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  send:           '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
  fileText:       '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  archive:        '<polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>',
  layoutTemplate: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>',
  code2:          '<path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/>',
  paperclip:      '<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
  workflow:       '<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/><path d="M6 9v3a3 3 0 0 0 3 3h6"/>',
};

// ======================================================================
// SECTION 2: STATE
// ======================================================================

let state = {
  gameMode: 'demo',      // 'demo' | 'tutorial' | 'sandbox' | 'hidden'
  tutorialStep: 0,
  nodes: DEMO_NODES.map(n => ({ ...n })),
  edges: DEMO_EDGES.map(e => ({ ...e })),
  nodeData: {},
  selectedNodeId: null,
  isRunning: false,
  signals: [],           // { id, edgeId, progress, color, payload }
  processingNodes: new Set(),
  showAddMenu: false,
  activeTab: 'context',  // 'context' | 'config'
  configMode: 'form',    // 'form' | 'raw'
  view: { x: 0, y: 0, scale: 0.5 },
};

// ======================================================================
// SECTION 3: BÉZIER MATH
// ======================================================================

function calculateDynamicEdge(sourceNode, targetNode) {
  const tension = Math.max(Math.abs(targetNode.y - sourceNode.y) / 1.5, 50);
  const p0 = { x: sourceNode.x, y: sourceNode.y };
  const p1 = { x: sourceNode.x, y: sourceNode.y + tension };
  const p2 = { x: targetNode.x, y: targetNode.y - tension };
  const p3 = { x: targetNode.x, y: targetNode.y };
  return {
    pathStr: `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`,
    p0, p1, p2, p3,
  };
}

function getBezierPoint(p0, p1, p2, p3, t) {
  const mt = 1 - t, mt2 = mt * mt, mt3 = mt2 * mt;
  const t2 = t * t, t3 = t2 * t;
  return {
    x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
    y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y,
  };
}

// ======================================================================
// SECTION 4: SVG RENDERING
// ======================================================================

const SVG_NS = 'http://www.w3.org/2000/svg';
function svgEl(tag) { return document.createElementNS(SVG_NS, tag); }

function makeIconSvg(key, color, size) {
  const s = size || 20;
  const svg = svgEl('svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', String(s));
  svg.setAttribute('height', String(s));
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', color || 'white');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('x', String(-s / 2));
  svg.setAttribute('y', String(-s / 2));
  svg.innerHTML = ICON_PATHS[key] || '';
  return svg;
}

function createNodeShape(type, color, isProcessing) {
  const g = svgEl('g');
  const fill = isProcessing ? color + '40' : THEME.node_core;
  const sw = '2.5';
  switch (type) {
    case 'agent': {
      const c = svgEl('circle'); c.setAttribute('r', '26');
      c.setAttribute('fill', fill); c.setAttribute('stroke', color); c.setAttribute('stroke-width', sw);
      g.appendChild(c); break;
    }
    case 'trigger': {
      const p = svgEl('polygon'); p.setAttribute('points', '0,-28 28,28 -28,28');
      p.setAttribute('fill', fill); p.setAttribute('stroke', color); p.setAttribute('stroke-width', sw);
      p.setAttribute('stroke-linejoin', 'round'); g.appendChild(p); break;
    }
    case 'router': {
      const p = svgEl('polygon'); p.setAttribute('points', '0,-32 32,0 0,32 -32,0');
      p.setAttribute('fill', fill); p.setAttribute('stroke', color); p.setAttribute('stroke-width', sw);
      p.setAttribute('stroke-linejoin', 'round'); g.appendChild(p); break;
    }
    case 'memory': {
      const p = svgEl('polygon'); p.setAttribute('points', '0,-28 24,-14 24,14 0,28 -24,14 -24,-14');
      p.setAttribute('fill', fill); p.setAttribute('stroke', color); p.setAttribute('stroke-width', sw);
      p.setAttribute('stroke-linejoin', 'round'); g.appendChild(p); break;
    }
    case 'tool': {
      const r = svgEl('rect'); r.setAttribute('x', '-24'); r.setAttribute('y', '-24');
      r.setAttribute('width', '48'); r.setAttribute('height', '48'); r.setAttribute('rx', '10');
      r.setAttribute('fill', fill); r.setAttribute('stroke', color); r.setAttribute('stroke-width', sw);
      g.appendChild(r); break;
    }
    case 'aggregator': {
      const p = svgEl('polygon'); p.setAttribute('points', '0,30 30,-25 -30,-25');
      p.setAttribute('fill', fill); p.setAttribute('stroke', color); p.setAttribute('stroke-width', sw);
      p.setAttribute('stroke-linejoin', 'round'); g.appendChild(p); break;
    }
    case 'checkpoint': {
      const p = svgEl('polygon'); p.setAttribute('points', '-12,-28 12,-28 28,-12 28,12 12,28 -12,28 -28,12 -28,-12');
      p.setAttribute('fill', fill); p.setAttribute('stroke', color); p.setAttribute('stroke-width', sw);
      g.appendChild(p); break;
    }
    case 'output': {
      const r = svgEl('rect'); r.setAttribute('x', '-30'); r.setAttribute('y', '-20');
      r.setAttribute('width', '60'); r.setAttribute('height', '40'); r.setAttribute('rx', '20');
      r.setAttribute('fill', fill); r.setAttribute('stroke', color); r.setAttribute('stroke-width', sw);
      g.appendChild(r); break;
    }
    default: {
      const c = svgEl('circle'); c.setAttribute('r', '24');
      c.setAttribute('fill', fill); c.setAttribute('stroke', color); c.setAttribute('stroke-width', sw);
      g.appendChild(c);
    }
  }
  return g;
}

function renderGraph() {
  const edgesLayer = document.getElementById('edges-layer');
  const nodesLayer = document.getElementById('nodes-layer');
  if (!edgesLayer || !nodesLayer) return;

  edgesLayer.innerHTML = '';
  nodesLayer.innerHTML = '';

  const { nodes, edges, selectedNodeId, processingNodes, isRunning } = state;

  // Determine connected set for dimming
  const connectedEdgeIds = new Set();
  const connectedNodeIds = new Set();
  if (selectedNodeId) {
    connectedNodeIds.add(selectedNodeId);
    edges.forEach(e => {
      if (e.source === selectedNodeId) { connectedEdgeIds.add(e.id); connectedNodeIds.add(e.target); }
      if (e.target === selectedNodeId) { connectedEdgeIds.add(e.id); connectedNodeIds.add(e.source); }
    });
  }

  // --- Edges ---
  edges.forEach(edge => {
    const src = nodes.find(n => n.id === edge.source);
    const tgt = nodes.find(n => n.id === edge.target);
    if (!src || !tgt) return;

    const edgeData = calculateDynamicEdge(src, tgt);
    const edgeColor = NODE_TYPES[src.type] ? NODE_TYPES[src.type].color : THEME.t_cyan;
    const isDimmed = selectedNodeId && !connectedEdgeIds.has(edge.id);

    const g = svgEl('g');
    g.setAttribute('data-edge-id', edge.id);
    g.style.opacity = isDimmed ? '0.1' : '1';
    g.style.transition = 'opacity 0.3s';

    const outer = svgEl('path');
    outer.setAttribute('d', edgeData.pathStr);
    outer.setAttribute('fill', 'none');
    outer.setAttribute('stroke', edgeColor);
    outer.setAttribute('stroke-width', '8');
    outer.setAttribute('stroke-linecap', 'round');
    outer.style.opacity = '0.1';

    const inner = svgEl('path');
    inner.setAttribute('d', edgeData.pathStr);
    inner.setAttribute('fill', 'none');
    inner.setAttribute('stroke', edgeColor);
    inner.setAttribute('stroke-width', '1.5');
    inner.setAttribute('stroke-linecap', 'round');
    inner.style.opacity = '0.4';

    g.appendChild(outer);
    g.appendChild(inner);

    if (isRunning && !isDimmed) {
      const dash = svgEl('path');
      dash.setAttribute('d', edgeData.pathStr);
      dash.setAttribute('fill', 'none');
      dash.setAttribute('stroke', edgeColor);
      dash.setAttribute('stroke-width', '2');
      dash.setAttribute('stroke-dasharray', '5 15');
      dash.style.opacity = '0.3';
      dash.classList.add('edge-dash-anim');
      g.appendChild(dash);
    }

    if (edge.label) {
      const mx = (src.x + tgt.x) / 2;
      const my = (src.y + tgt.y) / 2;
      const lg = svgEl('g');
      lg.setAttribute('transform', `translate(${mx},${my})`);
      const rect = svgEl('rect');
      rect.setAttribute('x', '-40'); rect.setAttribute('y', '-12');
      rect.setAttribute('width', '80'); rect.setAttribute('height', '24'); rect.setAttribute('rx', '12');
      rect.setAttribute('fill', THEME.bg); rect.setAttribute('stroke', edgeColor); rect.setAttribute('stroke-width', '1.5');
      const txt = svgEl('text');
      txt.setAttribute('x', '0'); txt.setAttribute('y', '4'); txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('fill', THEME.text_bright); txt.setAttribute('font-size', '9'); txt.setAttribute('font-weight', 'bold');
      txt.style.fontFamily = 'monospace';
      txt.textContent = edge.label.toUpperCase();
      lg.appendChild(rect); lg.appendChild(txt);
      g.appendChild(lg);
    }
    edgesLayer.appendChild(g);
  });

  // --- Nodes ---
  nodes.forEach(node => {
    const conf = NODE_TYPES[node.type];
    if (!conf) return;
    const isSelected = node.id === selectedNodeId;
    const isDimmed = selectedNodeId && !connectedNodeIds.has(node.id);
    const isProcessing = processingNodes.has(node.id);
    const ctxCount = state.nodeData[node.id] ? (state.nodeData[node.id].context || []).length : 0;

    const g = svgEl('g');
    g.setAttribute('transform', `translate(${node.x},${node.y})`);
    g.setAttribute('class', 'graph-node');
    g.setAttribute('data-id', node.id);
    g.style.cursor = 'pointer';
    g.style.opacity = isDimmed ? '0.2' : '1';
    g.style.transition = 'opacity 0.3s';

    if (isSelected) {
      const ring = svgEl('circle');
      ring.setAttribute('r', '44'); ring.setAttribute('fill', 'none');
      ring.setAttribute('stroke', conf.color); ring.setAttribute('stroke-width', '1.5');
      ring.setAttribute('stroke-dasharray', '4 6'); ring.style.opacity = '0.6';
      ring.classList.add('node-spin-anim');
      g.appendChild(ring);
    }

    if (isProcessing) {
      const ping = svgEl('circle');
      ping.setAttribute('r', '36'); ping.setAttribute('fill', 'none');
      ping.setAttribute('stroke', conf.color); ping.setAttribute('stroke-width', '4');
      ping.classList.add('node-ping-anim');
      g.appendChild(ping);
    }

    const glow = isProcessing
      ? `drop-shadow(0 0 30px ${conf.color})`
      : isSelected
        ? `drop-shadow(0 0 15px ${conf.color})`
        : 'drop-shadow(0 4px 6px rgba(0,0,0,0.6))';

    const shapeG = createNodeShape(node.type, conf.color, isProcessing);
    shapeG.style.filter = glow;
    g.appendChild(shapeG);

    g.appendChild(makeIconSvg(conf.iconKey, 'white', 20));

    const label = svgEl('text');
    label.setAttribute('y', '48'); label.setAttribute('text-anchor', 'middle');
    label.setAttribute('fill', isSelected ? '#fff' : THEME.text_bright);
    label.setAttribute('font-size', '11'); label.setAttribute('font-weight', 'bold');
    label.style.fontFamily = 'monospace, sans-serif';
    label.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,1))';
    label.style.letterSpacing = '0.08em';
    label.style.textTransform = 'uppercase';
    label.textContent = node.label;
    g.appendChild(label);

    if (ctxCount > 0 && !isDimmed) {
      const bg = svgEl('g');
      bg.setAttribute('transform', 'translate(18,-32)');
      const r = svgEl('rect');
      r.setAttribute('width', '28'); r.setAttribute('height', '18'); r.setAttribute('rx', '9');
      r.setAttribute('fill', THEME.grid_main); r.setAttribute('stroke', conf.color); r.setAttribute('stroke-width', '1.5');
      const t = svgEl('text');
      t.setAttribute('x', '14'); t.setAttribute('y', '13'); t.setAttribute('text-anchor', 'middle');
      t.setAttribute('fill', 'white'); t.setAttribute('font-size', '9'); t.setAttribute('font-weight', 'bold');
      t.textContent = ctxCount > 99 ? '99+' : String(ctxCount);
      bg.appendChild(r); bg.appendChild(t);
      g.appendChild(bg);
    }

    nodesLayer.appendChild(g);
  });

  updateGraphTransform();
}

function updateGraphTransform() {
  const gg = document.getElementById('graph-group');
  if (gg) gg.setAttribute('transform', `translate(${state.view.x},${state.view.y}) scale(${state.view.scale})`);

  const canvas = document.getElementById('canvas-container');
  if (canvas) {
    const s100 = 100 * state.view.scale;
    const s20 = 20 * state.view.scale;
    canvas.style.backgroundSize = `${s100}px ${s100}px, ${s100}px ${s100}px, ${s20}px ${s20}px, ${s20}px ${s20}px`;
    canvas.style.backgroundPosition = `${state.view.x}px ${state.view.y}px`;
  }
}

// ======================================================================
// SECTION 5: ANIMATION ENGINE (Delta-Time rAF)
// ======================================================================

const POOL_SIZE = 150;
const signalPool = [];
let rafId = null;
let prevTime = null;

function buildSignalPool() {
  const layer = document.getElementById('signals-layer');
  if (!layer) return;
  for (let i = 0; i < POOL_SIZE; i++) {
    const g = svgEl('g');
    g.style.display = 'none';
    g.style.pointerEvents = 'none';
    const outer = svgEl('circle');
    outer.setAttribute('r', '12'); outer.setAttribute('opacity', '0.6');
    outer.setAttribute('filter', 'url(#packetGlow)');
    const inner = svgEl('circle');
    inner.setAttribute('r', '6'); inner.setAttribute('opacity', '0.8');
    const core = svgEl('circle');
    core.setAttribute('r', '3'); core.setAttribute('fill', '#ffffff');
    g.appendChild(outer); g.appendChild(inner); g.appendChild(core);
    layer.appendChild(g);
    signalPool.push({ el: g, outer, inner });
  }
}

function updateSignalVisuals() {
  const { nodes, edges, signals, selectedNodeId } = state;
  const connectedEdgeIds = new Set();
  if (selectedNodeId) {
    edges.forEach(e => {
      if (e.source === selectedNodeId || e.target === selectedNodeId) connectedEdgeIds.add(e.id);
    });
  }

  let idx = 0;
  signals.forEach(sig => {
    if (idx >= POOL_SIZE) return;
    if (selectedNodeId && !connectedEdgeIds.has(sig.edgeId)) return;
    const edge = edges.find(e => e.id === sig.edgeId);
    if (!edge) return;
    const src = nodes.find(n => n.id === edge.source);
    const tgt = nodes.find(n => n.id === edge.target);
    if (!src || !tgt) return;
    const ed = calculateDynamicEdge(src, tgt);
    const pt = getBezierPoint(ed.p0, ed.p1, ed.p2, ed.p3, Math.min(sig.progress, 1));
    const item = signalPool[idx++];
    item.el.setAttribute('transform', `translate(${pt.x},${pt.y})`);
    item.el.style.display = '';
    item.outer.setAttribute('fill', sig.color);
    item.inner.setAttribute('fill', sig.color);
  });

  for (let i = idx; i < POOL_SIZE; i++) signalPool[i].el.style.display = 'none';
}

function processSignalTick(deltaTime) {
  const progressDelta = deltaTime * 0.0005;
  const nextSignals = [];
  const arrivedSignals = [];

  state.signals.forEach(sig => {
    const next = sig.progress + progressDelta;
    if (next >= 1.0) arrivedSignals.push(sig);
    else nextSignals.push({ ...sig, progress: next });
  });

  if (arrivedSignals.length > 0) {
    const activeNodes = new Set();
    arrivedSignals.forEach(sig => {
      const edge = state.edges.find(e => e.id === sig.edgeId);
      if (!edge) return;
      const tgt = state.nodes.find(n => n.id === edge.target);
      if (!tgt) return;
      activeNodes.add(tgt.id);

      const evt = {
        id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        type: 'system',
        content: `[INGEST] Packet received from ${sig.payload.source}`,
      };
      if (!state.nodeData[tgt.id]) state.nodeData[tgt.id] = { config: '', context: [] };
      state.nodeData[tgt.id].context = [evt, ...(state.nodeData[tgt.id].context || [])].slice(0, 50);

      if (tgt.type !== 'output') {
        state.edges.filter(e => e.source === tgt.id).forEach(outE => {
          nextSignals.push({
            id: `sig_${Date.now()}_${Math.random()}`,
            edgeId: outE.id,
            progress: 0,
            color: NODE_TYPES[tgt.type] ? NODE_TYPES[tgt.type].color : THEME.t_cyan,
            payload: { source: tgt.label, data: 'Transformed Payload' },
          });
        });
      }
    });

    activeNodes.forEach(id => state.processingNodes.add(id));
    setTimeout(() => {
      activeNodes.forEach(id => state.processingNodes.delete(id));
      renderGraph();
      if (state.selectedNodeId && activeNodes.has(state.selectedNodeId) && state.activeTab === 'context') {
        renderBottomSheetContent();
      }
    }, 300);
    renderGraph();
  }

  // Spawn from trigger nodes
  const spawnProb = 0.08 * (deltaTime / 16.66);
  if (Math.random() < spawnProb) {
    const triggers = state.nodes.filter(n => n.type === 'trigger');
    if (triggers.length > 0) {
      const spawner = triggers[Math.floor(Math.random() * triggers.length)];
      state.edges.filter(e => e.source === spawner.id).forEach(e => {
        nextSignals.push({
          id: `sig_${Date.now()}_${Math.random()}`,
          edgeId: e.id,
          progress: 0,
          color: THEME.text_bright,
          payload: { source: spawner.label, data: 'Init Event' },
        });
      });
      state.processingNodes.add(spawner.id);
      setTimeout(() => { state.processingNodes.delete(spawner.id); renderGraph(); }, 300);
    }
  }

  state.signals = nextSignals;
}

function animationFrame(time) {
  if (state.isRunning) {
    const dt = prevTime !== null ? time - prevTime : 16;
    processSignalTick(Math.min(dt, 100)); // cap at 100ms to prevent large jumps
    updateSignalVisuals();
  }
  prevTime = time;
  rafId = requestAnimationFrame(animationFrame);
}

function startRaf() {
  if (rafId) cancelAnimationFrame(rafId);
  prevTime = null;
  rafId = requestAnimationFrame(animationFrame);
}

function clearSignals() {
  state.signals = [];
  state.processingNodes.clear();
  signalPool.forEach(item => { item.el.style.display = 'none'; });
  renderGraph();
}

// ======================================================================
// SECTION 6: POINTER EVENTS
// ======================================================================

const activePointers = new Map();
let lastPinchDist = null;

function handlePointerDown(e) {
  if (e.target.closest('#bottom-sheet') || e.target.closest('.eng-hud')) return;

  const nodeEl = e.target.closest('.graph-node');
  if (nodeEl) {
    const nid = nodeEl.dataset.id;
    state.selectedNodeId = nid;
    renderGraph();
    showBottomSheet(nid);
    if (state.gameMode === 'tutorial' && state.tutorialStep === 2) {
      const node = state.nodes.find(n => n.id === nid);
      if (node && node.type === 'agent') { state.tutorialStep = 3; updateMissionHUD(); }
    }
    return;
  }

  if (state.selectedNodeId) {
    state.selectedNodeId = null;
    hideBottomSheet();
    renderGraph();
  }
  if (state.showAddMenu) { state.showAddMenu = false; updateAddMenu(); }

  activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  e.currentTarget.setPointerCapture(e.pointerId);
}

function handlePointerMove(e) {
  if (!activePointers.has(e.pointerId)) return;
  activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  const pts = Array.from(activePointers.values());

  if (pts.length === 1) {
    state.view.x += e.movementX;
    state.view.y += e.movementY;
    lastPinchDist = null;
    updateGraphTransform();
  } else if (pts.length === 2) {
    const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
    const cx = (pts[0].x + pts[1].x) / 2;
    const cy = (pts[0].y + pts[1].y) / 2;
    if (lastPinchDist !== null) {
      const adj = dist / lastPinchDist;
      const ns = Math.min(Math.max(state.view.scale * adj, 0.15), 4);
      state.view.x = cx - (cx - state.view.x) * (ns / state.view.scale);
      state.view.y = cy - (cy - state.view.y) * (ns / state.view.scale);
      state.view.scale = ns;
      updateGraphTransform();
    }
    lastPinchDist = dist;
  }
}

function handlePointerUp(e) {
  activePointers.delete(e.pointerId);
  if (activePointers.size < 2) lastPinchDist = null;
}

function handleWheel(e) {
  e.preventDefault();
  const adj = e.deltaY < 0 ? 1.1 : 0.9;
  const ns = Math.min(Math.max(state.view.scale * adj, 0.15), 4);
  const rect = e.currentTarget.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;
  state.view.x = cx - (cx - state.view.x) * (ns / state.view.scale);
  state.view.y = cy - (cy - state.view.y) * (ns / state.view.scale);
  state.view.scale = ns;
  updateGraphTransform();
}

// ======================================================================
// SECTION 7: UI / BOTTOM SHEET
// ======================================================================

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function parseNodeConfig(raw) {
  if (!raw) return { frontmatter: {}, body: '' };
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { frontmatter: {}, body: raw };
  const fm = {};
  m[1].split('\n').forEach(line => {
    const [k, ...v] = line.split(':');
    if (k && v.length) fm[k.trim()] = v.join(':').trim();
  });
  return { frontmatter: fm, body: m[2].trim() };
}

function stringifyNodeConfig(fm, body) {
  let yaml = '---\n';
  Object.entries(fm).forEach(([k, v]) => { yaml += `${k}: ${v}\n`; });
  return yaml + '---\n\n' + body;
}

function showBottomSheet(nodeId) {
  const sheet = document.getElementById('bottom-sheet');
  if (!sheet) return;
  sheet.style.transform = 'translateY(0)';
  sheet.setAttribute('aria-hidden', 'false');
  sheet.querySelectorAll('button').forEach(btn => btn.removeAttribute('tabindex'));
  const centerBtn = document.getElementById('center-btn');
  if (centerBtn) centerBtn.style.transform = 'translateY(-50%)';
  renderBottomSheetContent();
}

function hideBottomSheet() {
  const sheet = document.getElementById('bottom-sheet');
  if (sheet) {
    sheet.style.transform = 'translateY(100%)';
    sheet.setAttribute('aria-hidden', 'true');
    sheet.querySelectorAll('button').forEach(btn => btn.setAttribute('tabindex', '-1'));
  }
  const centerBtn = document.getElementById('center-btn');
  if (centerBtn) centerBtn.style.transform = '';
}

function renderBottomSheetContent() {
  const nid = state.selectedNodeId;
  if (!nid) return;
  const node = state.nodes.find(n => n.id === nid);
  if (!node) return;
  const conf = NODE_TYPES[node.type];
  if (!conf) return;

  // Header
  const header = document.getElementById('sheet-header');
  if (header) {
    header.innerHTML = `
      <div class="eng-sheet-nodeinfo">
        <div class="eng-sheet-nodeicon" style="border-color:${conf.color}40">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="${conf.color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[conf.iconKey] || ''}</svg>
        </div>
        <div>
          <h2 class="eng-sheet-title">${escapeHtml(node.label)}</h2>
          <div class="eng-sheet-type">
            <span class="eng-type-dot" style="background:${conf.color}"></span>
            <span>${conf.label.toUpperCase()}</span>
          </div>
        </div>
      </div>
      <button id="sheet-close-btn" class="eng-sheet-close" aria-label="Close inspector">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS.x}</svg>
      </button>`;
    document.getElementById('sheet-close-btn')?.addEventListener('click', () => {
      state.selectedNodeId = null;
      hideBottomSheet();
      renderGraph();
    });
  }

  // Tabs
  const ctxCount = state.nodeData[nid] ? (state.nodeData[nid].context || []).length : 0;
  const ctxTab = document.getElementById('tab-context');
  const cfgTab = document.getElementById('tab-config');
  if (ctxTab) {
    ctxTab.textContent = `Live Context${ctxCount > 0 ? ` (${ctxCount})` : ''}`;
    ctxTab.className = 'eng-tab' + (state.activeTab === 'context' ? ' active' : '');
  }
  if (cfgTab) cfgTab.className = 'eng-tab' + (state.activeTab === 'config' ? ' active' : '');

  // Content
  const content = document.getElementById('sheet-content');
  if (!content) return;
  if (state.activeTab === 'context') renderContextTabContent(content, node, nid);
  else renderConfigTabContent(content, node, nid);
}

function renderContextTabContent(container, node, nid) {
  const ctx = state.nodeData[nid] ? (state.nodeData[nid].context || []) : [];
  let html = `
    <div class="eng-ctx-input-row">
      <input type="text" id="ctx-input" placeholder="Inject manual context object..." class="eng-ctx-input">
      <button id="ctx-inject-btn" class="eng-inject-btn" aria-label="Inject">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS.send}</svg>
      </button>
    </div>
    <div id="ctx-list" class="eng-ctx-list">`;

  if (ctx.length === 0) {
    html += `
      <div class="eng-ctx-empty">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS.archive}</svg>
        <span>No Data Injected<br>Run Swarm to generate packets</span>
      </div>`;
  } else {
    ctx.forEach(item => {
      const isSystem = item.type === 'system';
      html += `
        <div class="eng-ctx-item">
          <div class="eng-ctx-icon ${isSystem ? 'system' : 'user'}">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${isSystem ? ICON_PATHS.activity : ICON_PATHS.fileText}</svg>
          </div>
          <div class="eng-ctx-body">
            <span class="eng-ctx-type">${isSystem ? 'System Packet' : 'User Input'}</span>
            <p class="eng-ctx-content">${escapeHtml(item.content)}</p>
          </div>
          <button class="eng-ctx-del" data-item-id="${escapeHtml(item.id)}" aria-label="Delete">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS.x}</svg>
          </button>
        </div>`;
    });
  }
  html += '</div>';
  container.innerHTML = html;

  function doInject() {
    const input = document.getElementById('ctx-input');
    const val = input ? input.value.trim() : '';
    if (!val) return;
    if (!state.nodeData[nid]) state.nodeData[nid] = { config: '', context: [] };
    state.nodeData[nid].context = [{ id: String(Date.now()), type: 'user', content: val }, ...(state.nodeData[nid].context || [])];
    renderBottomSheetContent();
    renderGraph();
  }

  document.getElementById('ctx-input')?.addEventListener('keydown', e => { if (e.key === 'Enter') doInject(); });
  document.getElementById('ctx-inject-btn')?.addEventListener('click', doInject);

  container.querySelectorAll('.eng-ctx-del').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.dataset.itemId;
      if (!state.nodeData[nid]) return;
      state.nodeData[nid].context = state.nodeData[nid].context.filter(i => i.id !== itemId);
      renderBottomSheetContent();
      renderGraph();
    });
  });
}

function renderConfigTabContent(container, node, nid) {
  const defaultCfg = `---\ntype: ${node.type}\nstatus: active\n---\n# Configure your ${node.type} node here.`;
  const raw = (state.nodeData[nid] && state.nodeData[nid].config) || defaultCfg;
  const { frontmatter, body } = parseNodeConfig(raw);

  let html = `
    <div class="eng-cfg-modes">
      <button class="eng-cfg-mode-btn${state.configMode === 'form' ? ' active' : ''}" data-mode="form">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS.layoutTemplate}</svg>
        Form
      </button>
      <button class="eng-cfg-mode-btn${state.configMode === 'raw' ? ' active' : ''}" data-mode="raw">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS.code2}</svg>
        Markdown
      </button>
    </div>`;

  if (state.configMode === 'raw') {
    html += `<textarea id="cfg-raw" class="eng-cfg-textarea">${escapeHtml(raw)}</textarea>`;
  } else {
    html += `<div class="eng-cfg-form">
      <div class="eng-cfg-section-label">Properties (Frontmatter)</div>
      <div id="cfg-props" class="eng-cfg-props">`;
    Object.entries(frontmatter).forEach(([k, v]) => {
      html += `
        <div class="eng-cfg-prop-row">
          <span class="eng-cfg-prop-key">${escapeHtml(k)}:</span>
          <input type="text" class="eng-cfg-prop-val" data-key="${escapeHtml(k)}" value="${escapeHtml(v)}">
        </div>`;
    });
    html += `</div>
      <div class="eng-cfg-section-label" style="margin-top:1rem">Instructions (Markdown)</div>
      <textarea id="cfg-body" class="eng-cfg-textarea" style="min-height:120px">${escapeHtml(body)}</textarea>
    </div>`;
  }
  container.innerHTML = html;

  container.querySelectorAll('.eng-cfg-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => { state.configMode = btn.dataset.mode; renderBottomSheetContent(); });
  });

  function saveConfig() {
    if (!state.nodeData[nid]) state.nodeData[nid] = { config: '', context: [] };
    if (state.configMode === 'raw') {
      const ta = document.getElementById('cfg-raw');
      if (ta) state.nodeData[nid].config = ta.value;
    } else {
      const fm = {};
      container.querySelectorAll('.eng-cfg-prop-val').forEach(inp => { fm[inp.dataset.key] = inp.value; });
      const bodyEl = document.getElementById('cfg-body');
      state.nodeData[nid].config = stringifyNodeConfig(fm, bodyEl ? bodyEl.value : body);
    }
  }

  document.getElementById('cfg-raw')?.addEventListener('input', saveConfig);
  container.querySelectorAll('.eng-cfg-prop-val').forEach(inp => inp.addEventListener('input', saveConfig));
  document.getElementById('cfg-body')?.addEventListener('input', saveConfig);
}

function updateMissionHUD() {
  ['hud-demo', 'hud-tutorial', 'hud-sandbox'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  if (state.gameMode === 'demo') {
    const el = document.getElementById('hud-demo');
    if (el) el.style.display = '';
  } else if (state.gameMode === 'tutorial') {
    const el = document.getElementById('hud-tutorial');
    if (el) {
      el.style.display = '';
      const msgs = [
        "Tap the '+' button (bottom right) and add a 'Trigger'.",
        "Excellent. Now tap '+' again and add an 'Agent'.",
        "The vector router wired them up. Tap the pink Agent node.",
        "Open the 'DNA Config' tab to view frontmatter instructions.",
        "Tap 'Run Swarm' at the top to watch data traverse your graph!",
      ];
      const msg = document.getElementById('hud-tutorial-msg');
      if (msg) msg.textContent = msgs[Math.min(state.tutorialStep, msgs.length - 1)];
    }
  } else if (state.gameMode === 'sandbox') {
    const el = document.getElementById('hud-sandbox');
    if (el) el.style.display = '';
  }

  const fab = document.getElementById('fab-container');
  if (fab) fab.style.display = (state.gameMode === 'sandbox' || state.tutorialStep < 2) ? '' : 'none';

  const runBtn = document.getElementById('run-btn');
  if (runBtn) {
    if (state.isRunning) {
      runBtn.innerHTML = `<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" stroke="none" style="display:inline-block;vertical-align:middle">${ICON_PATHS.square}</svg> Halt Simulation`;
      runBtn.className = 'eng-run-btn running';
    } else {
      runBtn.innerHTML = `<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" stroke="none" style="display:inline-block;vertical-align:middle">${ICON_PATHS.play}</svg> Run Swarm`;
      runBtn.className = 'eng-run-btn' + (state.tutorialStep === 4 ? ' tutorial-pulse' : '');
    }
  }
}

function updateAddMenu() {
  const menu = document.getElementById('add-node-menu');
  const btn = document.getElementById('fab-btn');
  if (menu) menu.style.display = state.showAddMenu ? '' : 'none';
  if (btn) {
    btn.style.transform = state.showAddMenu ? 'rotate(45deg)' : '';
    btn.style.background = state.showAddMenu ? '#1e293b' : '#4f46e5';
  }
}

function addNode(type) {
  const conf = NODE_TYPES[type];
  if (!conf) return;
  const canvas = document.getElementById('canvas-container');
  const cw = canvas ? canvas.clientWidth : window.innerWidth;
  const ch = canvas ? canvas.clientHeight : window.innerHeight;
  const id = `n_${Date.now()}`;
  state.nodes.push({
    id, type, label: `New ${conf.label}`,
    x: (-state.view.x + cw / 2) / state.view.scale,
    y: (-state.view.y + ch / 2) / state.view.scale + state.nodes.length * 80,
  });
  state.nodeData[id] = { config: `---\ntype: ${type}\nstatus: active\n---\n# Configure your ${type} node here.`, context: [] };
  state.showAddMenu = false;
  updateAddMenu();
  renderGraph();
  checkTutorialProgress();
}

function centerOrigin() {
  const canvas = document.getElementById('canvas-container');
  const cw = canvas ? canvas.clientWidth : window.innerWidth;
  const ch = canvas ? canvas.clientHeight : window.innerHeight;
  state.view = { scale: 0.55, x: cw / 2 - 20, y: ch / 2 - 350 };
  updateGraphTransform();
}

function startTutorial() {
  state.gameMode = 'tutorial';
  state.tutorialStep = 0;
  state.nodes = [];
  state.edges = [];
  state.nodeData = {};
  state.selectedNodeId = null;
  state.isRunning = false;
  clearSignals();
  const canvas = document.getElementById('canvas-container');
  const cw = canvas ? canvas.clientWidth : window.innerWidth;
  const ch = canvas ? canvas.clientHeight : window.innerHeight;
  state.view = { scale: 0.9, x: cw / 2 - 50, y: ch / 2 - 80 };
  renderGraph();
  hideBottomSheet();
  updateMissionHUD();
}

function checkTutorialProgress() {
  if (state.gameMode !== 'tutorial') return;
  if (state.tutorialStep === 0 && state.nodes.length >= 1) {
    state.tutorialStep = 1;
    updateMissionHUD();
  } else if (state.tutorialStep === 1 && state.nodes.length >= 2) {
    state.edges = [{ id: 'te1', source: state.nodes[0].id, target: state.nodes[1].id }];
    state.tutorialStep = 2;
    renderGraph();
    updateMissionHUD();
  }
}

// ======================================================================
// SECTION 8: INIT
// ======================================================================

document.addEventListener('DOMContentLoaded', () => {
  buildSignalPool();

  // Center the demo graph on initial render
  const canvas = document.getElementById('canvas-container');
  const cw = canvas ? canvas.clientWidth : window.innerWidth;
  const ch = canvas ? canvas.clientHeight : window.innerHeight;
  state.view = { scale: 0.55, x: cw / 2 - 20, y: ch / 2 - 340 };

  renderGraph();
  updateMissionHUD();
  updateAddMenu();

  // Start rAF loop (signals start after auto-run delay)
  startRaf();

  // Auto-start demo simulation
  setTimeout(() => {
    state.isRunning = true;
    updateMissionHUD();
    renderGraph(); // re-render edges with dash animation
  }, 1200);

  // Canvas events
  if (canvas) {
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
  }

  // SVG click delegation for node selection
  document.getElementById('engine-svg')?.addEventListener('click', e => {
    const nodeEl = e.target.closest('.graph-node');
    if (!nodeEl) return;
    const nid = nodeEl.dataset.id;
    state.selectedNodeId = nid;
    renderGraph();
    showBottomSheet(nid);
    if (state.gameMode === 'tutorial' && state.tutorialStep === 2) {
      const node = state.nodes.find(n => n.id === nid);
      if (node && node.type === 'agent') { state.tutorialStep = 3; updateMissionHUD(); }
    }
  });

  // Run button
  document.getElementById('run-btn')?.addEventListener('click', () => {
    state.isRunning = !state.isRunning;
    if (!state.isRunning) clearSignals();
    if (state.isRunning && state.gameMode === 'tutorial' && state.tutorialStep === 4) {
      setTimeout(() => { state.gameMode = 'sandbox'; updateMissionHUD(); }, 4000);
    }
    updateMissionHUD();
    renderGraph();
  });

  // Center button
  document.getElementById('center-btn')?.addEventListener('click', centerOrigin);

  // FAB button
  document.getElementById('fab-btn')?.addEventListener('click', () => {
    state.showAddMenu = !state.showAddMenu;
    updateAddMenu();
  });

  // Add node menu items
  document.querySelectorAll('.eng-add-node-btn').forEach(btn => {
    btn.addEventListener('click', () => addNode(btn.dataset.type));
  });

  // Sheet tabs
  document.getElementById('tab-context')?.addEventListener('click', () => {
    state.activeTab = 'context';
    renderBottomSheetContent();
  });
  document.getElementById('tab-config')?.addEventListener('click', () => {
    state.activeTab = 'config';
    if (state.gameMode === 'tutorial' && state.tutorialStep === 3) { state.tutorialStep = 4; updateMissionHUD(); }
    renderBottomSheetContent();
  });

  // Demo HUD → start tutorial
  document.getElementById('hud-demo-btn')?.addEventListener('click', startTutorial);

  // Sandbox HUD → dismiss
  document.getElementById('hud-sandbox-close')?.addEventListener('click', () => {
    state.gameMode = 'hidden';
    updateMissionHUD();
  });

  // Resize: re-center in demo mode
  window.addEventListener('resize', () => {
    if (state.gameMode === 'demo') centerOrigin();
  });
});
