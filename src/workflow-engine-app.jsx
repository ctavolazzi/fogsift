import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, Diamond, Database, Bot, Zap, CheckCircle,
  AlertTriangle, ArrowDownToLine, Workflow,
  Target, FileText, Archive, X, ListFilter, Plus, Send,
  Activity, BrainCircuit, ShieldAlert, Code2, LayoutTemplate,
  Square, Paperclip
} from 'lucide-react';
import { createRoot } from 'react-dom/client';

// --- VISUAL TOKENS ---
const THEME = {
  bg: '#020617',
  grid_main: '#1e293b', grid_sub: '#0f172a',
  t_cyan: '#06b6d4', t_pink: '#ec4899', t_amber: '#f59e0b',
  t_red: '#ef4444', t_purple: '#8b5cf6', t_emerald: '#10b981',
  node_core: '#0f172a', text_bright: '#f8fafc',
};

// --- NODE TYPOLOGY ---
const NODE_TYPES = {
  trigger:    { icon: Zap,             color: THEME.t_cyan,    label: 'Trigger' },
  router:     { icon: Diamond,         color: THEME.t_purple,  label: 'Router' },
  agent:      { icon: Bot,             color: THEME.t_pink,    label: 'Agent' },
  tool:       { icon: Activity,        color: THEME.t_amber,   label: 'Tool' },
  memory:     { icon: Database,        color: THEME.t_amber,   label: 'Memory' },
  aggregator: { icon: ArrowDownToLine, color: THEME.t_purple,  label: 'Merge' },
  checkpoint: { icon: ShieldAlert,     color: THEME.t_red,     label: 'Checkpoint' },
  output:     { icon: CheckCircle,     color: THEME.t_emerald, label: 'Output' },
};

// --- DEMO STATE ---
const DEMO_NODES = [
  { id: 'd1',  type: 'trigger',    label: 'Email Webhook',    x: 200,  y: 0 },
  { id: 'd2',  type: 'trigger',    label: 'Slack Mention',    x: -100, y: 0 },
  { id: 'd3',  type: 'aggregator', label: 'Ingest Queue',     x: 50,   y: 150 },
  { id: 'd4',  type: 'router',     label: 'Triage Brain',     x: 50,   y: 300 },
  { id: 'd5',  type: 'memory',     label: 'Fogsift Context',  x: -200, y: 450 },
  { id: 'd6',  type: 'tool',       label: 'Stripe API',       x: 300,  y: 450 },
  { id: 'd7',  type: 'agent',      label: 'Tech Agent',       x: -100, y: 600 },
  { id: 'd8',  type: 'agent',      label: 'Billing Agent',    x: 200,  y: 600 },
  { id: 'd9',  type: 'aggregator', label: 'Response Merge',   x: 50,   y: 800 },
  { id: 'd10', type: 'checkpoint', label: 'QA Check',         x: 50,   y: 950 },
  { id: 'd11', type: 'output',     label: 'Send Reply',       x: 50,   y: 1100 },
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

// --- UTILS ---
const parseNodeConfig = (rawText) => {
  const match = rawText?.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: rawText || '' };
  const frontmatter = {};
  match[1].split('\n').forEach(line => {
    const [key, ...vals] = line.split(':');
    if (key && vals.length) frontmatter[key.trim()] = vals.join(':').trim();
  });
  return { frontmatter, body: match[2].trim() };
};

const stringifyNodeConfig = (frontmatter, body) => {
  let yaml = '---\n';
  Object.entries(frontmatter).forEach(([k, v]) => { yaml += `${k}: ${v}\n`; });
  return yaml + '---\n\n' + body;
};

// --- GEOMETRY: CUBIC BÉZIER CALCULATIONS ---
const calculateDynamicEdge = (sourceNode, targetNode) => {
  if (!sourceNode || !targetNode) return null;
  const dy = targetNode.y - sourceNode.y;
  const tension = Math.max(Math.abs(dy) / 1.5, 50);
  const p0 = { x: sourceNode.x, y: sourceNode.y };
  const p1 = { x: sourceNode.x, y: sourceNode.y + tension };
  const p2 = { x: targetNode.x, y: targetNode.y - tension };
  const p3 = { x: targetNode.x, y: targetNode.y };
  return {
    pathStr: `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`,
    p0, p1, p2, p3
  };
};

const getBezierPoint = (p0, p1, p2, p3, t) => {
  const t2 = t * t;
  const t3 = t2 * t;
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const x = mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x;
  const y = mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y;
  return { x, y };
};

// --- ANIMATED NODE SHAPES ---
const AnimatedNodeShape = ({ type, color, isSelected, isRunning, isProcessing }) => {
  const glow = isProcessing
    ? `drop-shadow(0 0 30px ${color})`
    : isSelected
    ? `drop-shadow(0 0 15px ${color})`
    : 'drop-shadow(0 4px 6px rgba(0,0,0,0.6))';
  const strokeW = isSelected || isProcessing ? 4 : 2.5;
  const fill = isProcessing ? `${color}40` : THEME.node_core;
  const pulseClass = isProcessing ? 'animate-[ping_0.5s_cubic-bezier(0,0,0.2,1)]' : '';

  return (
    <g style={{ filter: glow, transition: 'all 0.15s ease-out' }}>
      {isSelected && (
        <circle r="44" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="4 6"
          className="animate-[spin_4s_linear_infinite] opacity-60" />
      )}
      {isProcessing && (
        <circle r="36" fill="none" stroke={color} strokeWidth="4" className={pulseClass} />
      )}
      {(() => {
        switch (type) {
          case 'agent':
            return (
              <g>
                <circle r="26" fill={fill} stroke={color} strokeWidth={strokeW} className="transition-colors duration-200" />
                {isRunning && (
                  <>
                    <circle r="32" fill="none" stroke={color} strokeWidth="2" strokeDasharray="15 10"
                      className="animate-[spin_3s_linear_infinite]" />
                    <circle r="20" fill="none" stroke={color} strokeWidth="1" strokeDasharray="4 4"
                      className="animate-[spin_4s_linear_infinite_reverse]" />
                  </>
                )}
              </g>
            );
          case 'trigger':
            return (
              <g>
                <polygon points="0,-28 28,28 -28,28" fill={fill} stroke={color} strokeWidth={strokeW}
                  strokeLinejoin="round" className="transition-colors duration-200" />
                {isRunning && (
                  <polygon points="0,-28 28,28 -28,28" fill="none" stroke={color} strokeWidth="2"
                    className="animate-ping opacity-30 origin-center" />
                )}
              </g>
            );
          case 'router':
            return (
              <g>
                <polygon points="0,-32 32,0 0,32 -32,0" fill={fill} stroke={color} strokeWidth={strokeW}
                  strokeLinejoin="round" className="transition-colors duration-200" />
                {isRunning && (
                  <polygon points="0,-20 20,0 0,20 -20,0" fill="none" stroke={color} strokeWidth="2"
                    className="animate-pulse opacity-50" />
                )}
              </g>
            );
          case 'memory':
            return (
              <g>
                <polygon points="0,-28 24,-14 24,14 0,28 -24,14 -24,-14" fill={fill} stroke={color}
                  strokeWidth={strokeW} strokeLinejoin="round" className="transition-colors duration-200" />
                {isRunning && (
                  <line x1="-20" y1="0" x2="20" y2="0" stroke={color} strokeWidth="3"
                    className="animate-[bounce_2s_infinite]" />
                )}
              </g>
            );
          case 'tool':
            return (
              <g>
                <rect x="-24" y="-24" width="48" height="48" rx="10" fill={fill} stroke={color}
                  strokeWidth={strokeW} className="transition-colors duration-200" />
                {isRunning && (
                  <rect x="-18" y="-18" width="36" height="36" rx="6" fill="none" stroke={color}
                    strokeWidth="2" strokeDasharray="8 8" className="animate-[spin_5s_linear_infinite]" />
                )}
              </g>
            );
          case 'aggregator':
            return (
              <polygon points="0,30 30,-25 -30,-25" fill={fill} stroke={color} strokeWidth={strokeW}
                strokeLinejoin="round" className="transition-colors duration-200" />
            );
          case 'checkpoint':
            return (
              <g>
                <polygon points="-12,-28 12,-28 28,-12 28,12 12,28 -12,28 -28,12 -28,-12" fill={fill}
                  stroke={color} strokeWidth={strokeW} className="transition-colors duration-200" />
                {isRunning && (
                  <circle r="15" fill={color} className="animate-pulse opacity-20" />
                )}
              </g>
            );
          case 'output':
            return (
              <rect x="-30" y="-20" width="60" height="40" rx="20" fill={fill} stroke={color}
                strokeWidth={strokeW} className="transition-colors duration-200" />
            );
          default:
            return (
              <circle r="24" fill={fill} stroke={color} strokeWidth={strokeW}
                className="transition-colors duration-200" />
            );
        }
      })()}
    </g>
  );
};

// --- MAIN APP ---
function App() {
  // --- GAME STATE ---
  const [gameMode, setGameMode] = useState('demo');
  const [tutorialStep, setTutorialStep] = useState(0);

  // Graph State
  const [nodes, setNodes] = useState(DEMO_NODES);
  const [edges, setEdges] = useState(DEMO_EDGES);
  const [nodeData, setNodeData] = useState({});
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  // Engine State
  const [isRunning, setIsRunning] = useState(false);
  const [signals, setSignals] = useState([]);
  const [processingNodes, setProcessingNodes] = useState(new Set());

  // UI State
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [activeTab, setActiveTab] = useState('context');
  const [configMode, setConfigMode] = useState('form');
  const [textInput, setTextInput] = useState('');

  // Canvas State
  const [view, setView] = useState({ x: 0, y: 0, scale: 0.5 });
  const containerRef = useRef(null);
  const activePointers = useRef(new Map());
  const lastPinchDist = useRef(null);

  // Connection Maps
  const connectedEdgeIds = new Set();
  const connectedNodeIds = new Set();
  if (selectedNodeId) {
    connectedNodeIds.add(selectedNodeId);
    edges.forEach(e => {
      if (e.source === selectedNodeId) { connectedEdgeIds.add(e.id); connectedNodeIds.add(e.target); }
      if (e.target === selectedNodeId) { connectedEdgeIds.add(e.id); connectedNodeIds.add(e.source); }
    });
  }

  // --- THE rAF EXECUTION ENGINE ---
  const engineRefs = useRef({ nodes, edges, signals });
  const requestRef = useRef();
  const prevTimeRef = useRef();

  useEffect(() => { engineRefs.current = { nodes, edges, signals }; }, [nodes, edges, signals]);

  const animateEngine = useCallback((time) => {
    if (prevTimeRef.current !== undefined) {
      const deltaTime = time - prevTimeRef.current;
      const progressDelta = deltaTime * 0.0005;

      setSignals(prevSignals => {
        const currentNodes = engineRefs.current.nodes;
        const currentEdges = engineRefs.current.edges;

        const nextSignals = [];
        const arrivedSignals = [];

        prevSignals.forEach(sig => {
          const nextProg = sig.progress + progressDelta;
          if (nextProg >= 1.0) arrivedSignals.push(sig);
          else nextSignals.push({ ...sig, progress: nextProg });
        });

        if (arrivedSignals.length > 0) {
          const activeSet = new Set();
          const targetInjections = {};

          arrivedSignals.forEach(sig => {
            const edge = currentEdges.find(e => e.id === sig.edgeId);
            if (!edge) return;
            const targetNode = currentNodes.find(n => n.id === edge.target);
            if (!targetNode) return;

            activeSet.add(targetNode.id);

            if (!targetInjections[targetNode.id]) targetInjections[targetNode.id] = [];
            targetInjections[targetNode.id].push({
              id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              type: 'system',
              content: `[INGEST] Vector packet processed from ${sig.payload.source}`
            });

            if (targetNode.type !== 'output') {
              const outEdges = currentEdges.filter(e => e.source === targetNode.id);
              outEdges.forEach(outE => {
                nextSignals.push({
                  id: `sig_${Date.now()}_${Math.random()}`,
                  edgeId: outE.id,
                  progress: 0,
                  color: NODE_TYPES[targetNode.type].color,
                  payload: { source: targetNode.label, data: 'Transformed Payload' }
                });
              });
            }
          });

          setProcessingNodes(prev => new Set([...prev, ...activeSet]));
          setTimeout(() => {
            setProcessingNodes(prev => {
              const next = new Set(prev);
              activeSet.forEach(id => next.delete(id));
              return next;
            });
          }, 300);

          setNodeData(prev => {
            const nextData = { ...prev };
            Object.keys(targetInjections).forEach(nId => {
              if (!nextData[nId]) nextData[nId] = { context: [], config: '' };
              nextData[nId].context = [
                ...targetInjections[nId],
                ...(nextData[nId].context || [])
              ].slice(0, 50);
            });
            return nextData;
          });
        }

        const spawnProbability = 0.08 * (deltaTime / 16.66);
        if (Math.random() < spawnProbability) {
          const triggers = currentNodes.filter(n => n.type === 'trigger');
          if (triggers.length > 0) {
            const spawner = triggers[Math.floor(Math.random() * triggers.length)];
            const outEdges = currentEdges.filter(e => e.source === spawner.id);
            outEdges.forEach(e => {
              nextSignals.push({
                id: `sig_${Date.now()}_${Math.random()}`,
                edgeId: e.id,
                progress: 0,
                color: THEME.text_bright,
                payload: { source: spawner.label, data: 'Init Event' }
              });
            });
            setProcessingNodes(prev => new Set([...prev, spawner.id]));
            setTimeout(() => {
              setProcessingNodes(prev => {
                const next = new Set(prev);
                next.delete(spawner.id);
                return next;
              });
            }, 300);
          }
        }

        return nextSignals;
      });
    }

    prevTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animateEngine);
  }, []);

  useEffect(() => {
    if (isRunning) {
      requestRef.current = requestAnimationFrame(animateEngine);
    } else {
      cancelAnimationFrame(requestRef.current);
      prevTimeRef.current = undefined;
      setSignals([]);
      setProcessingNodes(new Set());
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isRunning, animateEngine]);

  // --- TUTORIAL ---
  const startTutorial = () => {
    setGameMode('tutorial');
    setNodes([]);
    setEdges([]);
    setNodeData({});
    setSelectedNodeId(null);
    setIsRunning(false);
    setTutorialStep(0);
    setView({ scale: 0.8, x: window.innerWidth / 2 - 50, y: window.innerHeight / 2 - 100 });
  };

  useEffect(() => {
    if (gameMode === 'tutorial') {
      if (tutorialStep === 0 && nodes.length === 1) setTutorialStep(1);
      if (tutorialStep === 1 && nodes.length === 2) {
        setEdges([{ id: 'te1', source: nodes[0].id, target: nodes[1].id }]);
        setTutorialStep(2);
      }
      if (tutorialStep === 2 && selectedNodeId === nodes[1]?.id) setTutorialStep(3);
      if (tutorialStep === 3 && activeTab === 'config') setTutorialStep(4);
      if (tutorialStep === 4 && isRunning) setTimeout(() => setGameMode('sandbox'), 4000);
    }
  }, [nodes, selectedNodeId, activeTab, isRunning, gameMode, tutorialStep]);

  useEffect(() => {
    if (containerRef.current && gameMode === 'demo') {
      const cw = containerRef.current.clientWidth || window.innerWidth;
      const ch = containerRef.current.clientHeight || window.innerHeight;
      setView({ scale: 0.55, x: cw / 2 - 20, y: ch / 2 - 350 });
    }
  }, [gameMode]);

  // --- HANDLERS ---
  const addNode = (type) => {
    const id = `n_${Date.now()}`;
    const newNode = {
      id, type, label: `New ${NODE_TYPES[type].label}`,
      x: -view.x / view.scale + window.innerWidth / (2 * view.scale),
      y: -view.y / view.scale + window.innerHeight / (2 * view.scale) + (nodes.length * 150),
    };
    const dna = `---\ntype: ${type}\nstatus: active\n---\n# Configure your ${type} node here.`;
    setNodeData(prev => ({ ...prev, [id]: { config: dna, context: [] } }));
    setNodes(prev => [...prev, newNode]);
    setShowAddMenu(false);
  };

  const updateNodeConfig = (id, newConfig) => {
    setNodeData(prev => ({ ...prev, [id]: { ...(prev[id] || {}), config: newConfig } }));
  };

  // --- TOUCH ENGINE ---
  const handlePointerDown = (e) => {
    if (e.target.closest('.bottom-sheet') || e.target.closest('.hud-element')) return;
    if (e.target.closest('.graph-node')) {
      setSelectedNodeId(e.target.closest('.graph-node').dataset.id);
      return;
    }
    setSelectedNodeId(null);
    setShowAddMenu(false);
    setShowLegend(false);
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (containerRef.current) containerRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!activePointers.current.has(e.pointerId)) return;
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pointers = Array.from(activePointers.current.values());

    if (pointers.length === 1) {
      setView(v => ({ ...v, x: v.x + e.movementX, y: v.y + e.movementY }));
      lastPinchDist.current = null;
    } else if (pointers.length === 2) {
      const currentDist = Math.hypot(
        pointers[1].x - pointers[0].x,
        pointers[1].y - pointers[0].y
      );
      const currentCenter = {
        x: (pointers[0].x + pointers[1].x) / 2,
        y: (pointers[0].y + pointers[1].y) / 2,
      };
      if (lastPinchDist.current) {
        const scaleAdj = currentDist / lastPinchDist.current;
        const newScale = Math.min(Math.max(view.scale * scaleAdj, 0.2), 3);
        setView(v => ({
          x: currentCenter.x - (currentCenter.x - v.x) * (newScale / v.scale),
          y: currentCenter.y - (currentCenter.y - v.y) * (newScale / v.scale),
          scale: newScale,
        }));
      }
      lastPinchDist.current = currentDist;
    }
  };

  const handlePointerUp = (e) => {
    activePointers.current.delete(e.pointerId);
    if (activePointers.current.size < 2) lastPinchDist.current = null;
  };

  const centerOrigin = () => {
    if (!containerRef.current) return;
    const cw = containerRef.current.clientWidth || window.innerWidth;
    const ch = containerRef.current.clientHeight || window.innerHeight;
    setView({ scale: 0.65, x: cw / 2 - 130, y: ch / 2 - 350 });
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const selType = selectedNode ? NODE_TYPES[selectedNode.type] : null;

  return (
    <div className="flex flex-col w-full h-[100dvh] font-sans overflow-hidden fixed inset-0 bg-[#020617] text-slate-200 select-none">

      <style>{`
        @keyframes dash { to { stroke-dashoffset: -30; } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
        .pb-safe { padding-bottom: max(env(safe-area-inset-bottom), 16px); }
      `}</style>

      {/* ======== MISSION HUD ======== */}
      <div className="absolute top-20 left-4 right-4 z-30 pointer-events-none flex flex-col gap-4">
        {gameMode === 'demo' && (
          <div className="bg-indigo-900/80 backdrop-blur-xl border border-indigo-500/50 rounded-2xl p-5 shadow-[0_10px_40px_rgba(79,70,229,0.4)] pointer-events-auto">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-500/20 rounded-xl">
                <Workflow className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white mb-1">Production Factory V2</h2>
                <p className="text-xs text-indigo-200 leading-relaxed mb-4">
                  Upgraded to the Fogsift Engine. Featuring rAF Delta-Time dynamics and
                  continuous O(1) Bézier path interpolation.
                </p>
                <button onClick={startTutorial}
                  className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-sm font-bold shadow-lg transition-colors">
                  Build Your Own
                </button>
              </div>
            </div>
          </div>
        )}

        {gameMode === 'tutorial' && (
          <div className="bg-cyan-900/90 backdrop-blur-xl border border-cyan-400 rounded-2xl p-4 shadow-[0_10px_40px_rgba(6,182,212,0.4)] animate-in slide-in-from-top-4 hud-element pointer-events-auto">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/20 rounded-full animate-pulse">
                <Target className="w-5 h-5 text-cyan-300" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">Mission Directive</span>
                <span className="text-sm font-bold text-white">
                  {tutorialStep === 0 && "Tap the '+' button (bottom right) and add a 'Trigger'."}
                  {tutorialStep === 1 && "Excellent. Now tap '+' again and add an 'Agent'."}
                  {tutorialStep === 2 && "The vector router wired them up. Tap the pink Agent node."}
                  {tutorialStep === 3 && "Open the 'DNA Config' tab to view frontmatter instructions."}
                  {tutorialStep === 4 && "Tap 'Run Swarm' at the top to watch data traverse your graph!"}
                </span>
              </div>
            </div>
          </div>
        )}

        {gameMode === 'sandbox' && (
          <div className="bg-emerald-900/80 backdrop-blur-xl border border-emerald-500/50 rounded-2xl p-4 shadow-[0_10px_40px_rgba(16,185,129,0.3)] animate-in fade-in zoom-in duration-500 hud-element pointer-events-auto">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-full">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">Simulation Engine Online</span>
                <span className="text-[10px] text-emerald-200">Packets update node context in real-time.</span>
              </div>
              <button onClick={() => setGameMode('hidden')} className="ml-auto p-2 text-emerald-400">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ======== TOP NAV ======== */}
      <div className="absolute top-0 left-0 right-0 h-16 border-b border-slate-800/80 bg-[#0f172a]/80 backdrop-blur-xl z-20 flex items-center justify-between px-4 shadow-lg hud-element pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <BrainCircuit className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-bold text-slate-100 tracking-tight leading-none">Fogsift Engine</h1>
            <span className="text-[9px] text-cyan-400/80 font-mono uppercase tracking-widest mt-1">Live Execution State</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a href="/" className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors font-mono mr-2">
            ← fogsift.com
          </a>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold uppercase tracking-wider text-[10px] transition-all duration-300 relative ${
              isRunning
                ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                : tutorialStep === 3
                ? 'bg-emerald-500 text-white border border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.8)] animate-pulse'
                : 'bg-cyan-600 text-white border border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
            }`}
          >
            {tutorialStep === 4 && !isRunning && (
              <span className="absolute -inset-1 rounded-full border-2 border-cyan-400 animate-ping" />
            )}
            {isRunning
              ? <Square className="w-3 h-3 fill-current" />
              : <Play className="w-3 h-3 fill-current" />
            }
            {isRunning ? 'Halt Simulation' : 'Run Swarm'}
          </button>
        </div>
      </div>

      {/* ======== SVG CANVAS ENGINE ======== */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Grid background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `
            linear-gradient(to right, ${THEME.grid_main} 1px, transparent 1px),
            linear-gradient(to bottom, ${THEME.grid_main} 1px, transparent 1px),
            linear-gradient(to right, ${THEME.grid_sub} 1px, transparent 1px),
            linear-gradient(to bottom, ${THEME.grid_sub} 1px, transparent 1px)
          `,
          backgroundSize: `
            ${100 * view.scale}px ${100 * view.scale}px,
            ${100 * view.scale}px ${100 * view.scale}px,
            ${20 * view.scale}px ${20 * view.scale}px,
            ${20 * view.scale}px ${20 * view.scale}px
          `,
          backgroundPosition: `${view.x}px ${view.y}px`,
        }} />

        <svg className="w-full h-full absolute inset-0 pointer-events-none">
          <defs>
            <filter id="packetGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <g transform={`translate(${view.x}, ${view.y}) scale(${view.scale})`}>

            {/* Edges */}
            {edges.map((edge) => {
              const sourceNode = nodes.find(n => n.id === edge.source);
              const targetNode = nodes.find(n => n.id === edge.target);
              if (!sourceNode || !targetNode) return null;

              const edgeData = calculateDynamicEdge(sourceNode, targetNode);
              const edgeColor = NODE_TYPES[sourceNode.type].color;
              const isDimmed = selectedNodeId && !connectedEdgeIds.has(edge.id);

              return (
                <g key={`static_${edge.id}`}
                  className={`transition-all duration-500 ${isDimmed ? 'opacity-10 grayscale' : 'opacity-100'}`}>
                  <path d={edgeData.pathStr} fill="none" stroke={edgeColor} strokeWidth="8"
                    strokeLinejoin="round" strokeLinecap="round" className="opacity-10" />
                  <path d={edgeData.pathStr} fill="none" stroke={edgeColor} strokeWidth="1.5"
                    strokeLinejoin="round" strokeLinecap="round" className="opacity-40" />
                  {isRunning && !isDimmed && (
                    <path d={edgeData.pathStr} fill="none" stroke={edgeColor} strokeWidth="2"
                      strokeDasharray="5 15" className="animate-[dash_1s_linear_infinite] opacity-30" />
                  )}
                  {edge.label && (
                    <g transform={`translate(${(sourceNode.x + targetNode.x) / 2}, ${(sourceNode.y + targetNode.y) / 2})`}>
                      <rect x="-40" y="-12" width="80" height="24" rx="12" fill={THEME.bg}
                        stroke={edgeColor} strokeWidth="1.5" />
                      <text x="0" y="4" textAnchor="middle" fill={THEME.text_bright}
                        className="text-[9px] font-bold uppercase tracking-wider">{edge.label}</text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Signal Packets */}
            {signals.map(sig => {
              const edge = edges.find(e => e.id === sig.edgeId);
              if (!edge) return null;
              const sourceNode = nodes.find(n => n.id === edge.source);
              const targetNode = nodes.find(n => n.id === edge.target);
              if (!sourceNode || !targetNode) return null;
              const isDimmed = selectedNodeId && !connectedEdgeIds.has(edge.id);
              if (isDimmed) return null;
              const edgeData = calculateDynamicEdge(sourceNode, targetNode);
              const pt = getBezierPoint(edgeData.p0, edgeData.p1, edgeData.p2, edgeData.p3, sig.progress);
              return (
                <g key={sig.id} transform={`translate(${pt.x}, ${pt.y})`}>
                  <circle r="12" fill={sig.color} filter="url(#packetGlow)" opacity="0.6" />
                  <circle r="6" fill={sig.color} opacity="0.8" className="animate-pulse" />
                  <circle r="3" fill="#ffffff" />
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isDimmed = selectedNodeId && !connectedNodeIds.has(node.id);
              const isProcessing = processingNodes.has(node.id);
              const ctxData = nodeData[node.id];
              const ctxCount = ctxData?.context?.length || 0;
              const config = NODE_TYPES[node.type];
              const Icon = config.icon;
              const isTargeted = tutorialStep === 2 && node.type === 'agent';

              return (
                <g key={node.id} data-id={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className={`graph-node pointer-events-auto cursor-pointer transition-all duration-500 ${isDimmed ? 'opacity-20 grayscale' : 'opacity-100'}`}>

                  {isTargeted && (
                    <circle r="60" fill="none" stroke={THEME.t_pink} strokeWidth="2"
                      strokeDasharray="10 10" className="animate-[spin_4s_linear_infinite] opacity-80" />
                  )}

                  <AnimatedNodeShape
                    type={node.type} color={config.color}
                    isSelected={isSelected} isRunning={isRunning} isProcessing={isProcessing}
                  />

                  <foreignObject x="-12" y="-12" width="24" height="24">
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </foreignObject>

                  <text y="48" textAnchor="middle" fill={isSelected ? '#fff' : THEME.text_bright}
                    className="text-[11px] font-bold uppercase tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                    {node.label}
                  </text>

                  {ctxCount > 0 && !isDimmed && (
                    <g transform="translate(18, -32)" className="transition-transform hover:scale-110">
                      <rect width="28" height="18" rx="9" fill={THEME.grid_main}
                        stroke={config.color} strokeWidth="1.5" />
                      <foreignObject width="28" height="18">
                        <div className="flex items-center justify-center w-full h-full text-[9px] font-bold text-white gap-0.5">
                          <Paperclip className="w-2.5 h-2.5" />
                          {ctxCount > 99 ? '99+' : ctxCount}
                        </div>
                      </foreignObject>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Center button */}
        <div
          className="absolute bottom-6 right-4 z-10 hud-element transition-transform"
          style={{ transform: selectedNode ? 'translateY(-50vh)' : 'translateY(0)' }}>
          <button onClick={centerOrigin}
            className="w-12 h-12 rounded-full bg-[#0f172a]/90 backdrop-blur-md border border-slate-700 shadow-xl flex items-center justify-center text-slate-300 active:scale-95 transition-all hover:bg-slate-800">
            <Target className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* ======== FAB: ADD NODE ======== */}
      {(gameMode === 'sandbox' || tutorialStep < 2) && (
        <div className="absolute bottom-6 right-4 z-20 flex flex-col items-end gap-3 pointer-events-auto hud-element">
          {showAddMenu && (
            <div className="bg-[#0f172a]/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-3 shadow-2xl flex flex-col gap-2 animate-in slide-in-from-bottom-4 w-48">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-2 pb-1 border-b border-slate-800">
                Deploy Unit
              </span>
              {Object.entries(NODE_TYPES).map(([type, conf]) => (
                <button key={type} onClick={() => addNode(type)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 transition-colors text-left group">
                  <div className="w-6 h-6 rounded-md bg-[#020617] border border-slate-700 flex items-center justify-center shadow-inner group-hover:border-slate-500 transition-colors">
                    <conf.icon className="w-3.5 h-3.5" style={{ color: conf.color }} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide group-hover:text-white transition-colors">
                    {conf.label}
                  </span>
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.8)] transition-all duration-300 relative hover:scale-105 active:scale-95 ${
              showAddMenu ? 'bg-slate-800 text-slate-400 rotate-45' : 'bg-indigo-600 text-white'
            }`}
          >
            {(tutorialStep === 0 || tutorialStep === 1) && !showAddMenu && (
              <span className="absolute -inset-2 rounded-full border-2 border-indigo-400 animate-ping opacity-50" />
            )}
            <Plus className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* ======== MOBILE BOTTOM SHEET ======== */}
      <div
        className="absolute bottom-0 left-0 right-0 z-40 bg-[#0f172a]/95 backdrop-blur-3xl border-t border-slate-700/50 rounded-t-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.8)] transition-transform duration-300 ease-in-out pb-safe flex flex-col bottom-sheet"
        style={{
          height: '55dvh',
          transform: selectedNode ? 'translateY(0)' : 'translateY(100%)',
          pointerEvents: selectedNode ? 'auto' : 'none',
        }}
      >
        <div className="flex flex-col items-center pt-3 pb-2 w-full shrink-0">
          <div className="w-12 h-1.5 bg-slate-600 rounded-full mb-4 opacity-50" />
          {selectedNode && selType && (
            <div className="flex items-center justify-between w-full px-6 mb-2">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl shadow-inner border relative overflow-hidden"
                  style={{ backgroundColor: THEME.bg, borderColor: `${selType.color}50` }}>
                  {processingNodes.has(selectedNode.id) && (
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  )}
                  <selType.icon className="w-6 h-6 relative z-10" style={{ color: selType.color }} />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold text-white tracking-wide leading-tight">
                    {selectedNode.label}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selType.color }} />
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                      {selType.label}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedNodeId(null)}
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-700 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {selectedNode && (
          <div className="flex px-6 gap-6 text-[11px] font-bold uppercase tracking-widest border-b border-slate-800 shrink-0 relative">
            <button
              className={`pb-3 transition-colors relative ${activeTab === 'context' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
              onClick={() => setActiveTab('context')}>
              Live Context {(nodeData[selectedNode.id]?.context?.length || 0) > 0 && `(${nodeData[selectedNode.id].context.length})`}
              {activeTab === 'context' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-t-full shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
              )}
            </button>
            <button
              className={`pb-3 transition-colors relative ${activeTab === 'config' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
              onClick={() => setActiveTab('config')}>
              DNA Config
              {activeTab === 'config' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-t-full shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
              )}
              {tutorialStep === 3 && activeTab !== 'config' && (
                <div className="absolute -top-1 -right-2 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
              )}
            </button>
          </div>
        )}

        {selectedNode && (
          <div className="flex-1 overflow-y-auto px-6 pt-4 pb-8 custom-scrollbar">
            {activeTab === 'context' && (
              <div className="flex flex-col h-full animate-in fade-in">
                <div className="relative mb-4 flex items-center bg-[#020617] rounded-2xl border border-slate-700 p-1 shadow-inner focus-within:border-cyan-500/50 transition-colors">
                  <Plus className="w-5 h-5 text-slate-500 ml-3" />
                  <input
                    type="text" value={textInput}
                    onChange={e => setTextInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && textInput.trim()) {
                        const newCtx = [
                          { id: Date.now().toString(), type: 'user', content: textInput.trim() },
                          ...(nodeData[selectedNode.id]?.context || [])
                        ];
                        setNodeData(prev => ({ ...prev, [selectedNode.id]: { ...prev[selectedNode.id], context: newCtx } }));
                        setTextInput('');
                      }
                    }}
                    placeholder="Inject manual context object..."
                    className="flex-1 bg-transparent p-3 text-sm text-slate-200 outline-none"
                  />
                  <button className="p-3 text-cyan-500 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-xl mr-1 transition-colors">
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-2 flex-1">
                  {(nodeData[selectedNode.id]?.context || []).map((item) => (
                    <div key={item.id}
                      className="flex items-start gap-3 p-4 rounded-2xl bg-slate-800/50 border border-slate-700 shadow-sm animate-in slide-in-from-top-2">
                      <div className={`p-2.5 bg-[#020617] rounded-xl border ${item.type === 'system' ? 'text-indigo-400 border-indigo-500/30' : 'text-cyan-400 border-cyan-500/30'}`}>
                        {item.type === 'system'
                          ? <Activity className="w-4 h-4" />
                          : <FileText className="w-4 h-4" />
                        }
                      </div>
                      <div className="flex-1 flex flex-col">
                        <span className="text-[9px] font-mono text-slate-500 uppercase">
                          {item.type === 'system' ? 'System Packet' : 'User Input'}
                        </span>
                        <p className="text-sm text-slate-200 leading-snug mt-1 font-mono">{item.content}</p>
                      </div>
                      <button
                        onClick={() => {
                          const newCtx = nodeData[selectedNode.id].context.filter(i => i.id !== item.id);
                          setNodeData(prev => ({ ...prev, [selectedNode.id]: { ...prev[selectedNode.id], context: newCtx } }));
                        }}
                        className="p-1.5 text-slate-600 hover:text-red-400 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {!(nodeData[selectedNode.id]?.context?.length) && (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-2xl p-6 opacity-50">
                      <Archive className="w-8 h-8 mb-2" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-center">
                        No Data Injected<br />Run Swarm to generate packets
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'config' && (() => {
              const rawConfig = nodeData[selectedNode.id]?.config ||
                `---\ntype: ${selectedNode.type}\nstatus: idle\n---\n# Write logic here...`;
              const { frontmatter, body } = parseNodeConfig(rawConfig);
              return (
                <div className="flex flex-col h-full animate-in fade-in">
                  <div className="flex items-center justify-end gap-2 mb-4">
                    <button
                      onClick={() => setConfigMode('form')}
                      className={`p-2 rounded-lg flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        configMode === 'form'
                          ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50'
                          : 'bg-[#020617] text-slate-500 border border-slate-800 hover:text-slate-300'
                      }`}>
                      <LayoutTemplate className="w-3.5 h-3.5" /> Form
                    </button>
                    <button
                      onClick={() => setConfigMode('raw')}
                      className={`p-2 rounded-lg flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        configMode === 'raw'
                          ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50'
                          : 'bg-[#020617] text-slate-500 border border-slate-800 hover:text-slate-300'
                      }`}>
                      <Code2 className="w-3.5 h-3.5" /> Markdown
                    </button>
                  </div>

                  {configMode === 'raw' ? (
                    <textarea
                      className="flex-1 bg-[#020617] border border-slate-700 rounded-2xl p-4 text-xs font-mono text-cyan-100 shadow-inner outline-none focus:border-indigo-500 resize-none leading-relaxed"
                      value={rawConfig}
                      onChange={(e) => updateNodeConfig(selectedNode.id, e.target.value)}
                    />
                  ) : (
                    <div className="flex flex-col gap-4 flex-1 overflow-y-auto pb-4">
                      <div className="bg-[#020617] rounded-2xl p-4 border border-slate-800 shadow-inner flex flex-col gap-3">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest border-b border-slate-800 pb-2">
                          Properties (Frontmatter)
                        </span>
                        {Object.entries(frontmatter).map(([k, v], i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-xs font-mono text-slate-400 w-20 truncate">{k}:</span>
                            <input
                              type="text" value={v}
                              onChange={(e) => {
                                const newFm = { ...frontmatter, [k]: e.target.value };
                                updateNodeConfig(selectedNode.id, stringifyNodeConfig(newFm, body));
                              }}
                              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono outline-none focus:border-indigo-500 transition-colors"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col gap-2 flex-1">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest pl-1">
                          Instructions (Markdown)
                        </span>
                        <textarea
                          className="flex-1 min-h-[150px] bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm text-slate-300 shadow-inner outline-none focus:border-indigo-500 resize-none leading-relaxed transition-colors"
                          value={body}
                          onChange={(e) => updateNodeConfig(selectedNode.id, stringifyNodeConfig(frontmatter, e.target.value))}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

// Mount React app
const rootEl = document.getElementById('workflow-engine-root');
if (rootEl) {
  const root = createRoot(rootEl);
  root.render(<App />);
}
