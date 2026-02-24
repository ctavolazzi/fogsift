/**
 * supply-chain-sim.js — FogSift Industry Visualization
 * Three.js r150 · Mobile-first · CSP-compliant (no inline eval)
 * Lazy-initialized via IntersectionObserver
 *
 * 8 industry tabs, each with unique node graph topology:
 *   - Operations & Logistics (circular)
 *   - Food Security (linear)
 *   - Data & Modeling (hub-spoke)
 *   - Strategy (diamond)
 *   - Technology (hub-spoke)
 *   - Growth (tree)
 *   - Hardware / IoT (circular)
 *   - Research (tree)
 */
(function () {
    'use strict';

    // ── Industry datasets ────────────────────────────────────────────────────
    const INDUSTRIES = {
        'ops-logistics': {
            label: 'Ops & Logistics',
            icon: '\u{1F4E6}',
            layout: 'circular',
            nodes: [
                { id: 'source',       label: 'Source',         icon: '\u26CF',  desc: 'Raw material extraction \u2014 farms, mines, fishing grounds. The origin point of every supply chain.',
                  wikiLinks: [{ label: 'Process Mapping', href: '/wiki/tools/process-mapping' }] },
                { id: 'processing',   label: 'Processing',     icon: '\u2699',  desc: 'Initial transformation \u2014 milling grain, refining ore, cleaning raw produce before it moves downstream.',
                  wikiLinks: [{ label: 'Root Cause', href: '/wiki/concepts/root-cause' }] },
                { id: 'manufacture',  label: 'Manufacturing',  icon: '\u{1F3ED}', desc: 'Assembly and fabrication. Where components become finished goods ready for distribution.',
                  wikiLinks: [{ label: 'Constraint Mapping', href: '/wiki/frameworks/constraint-mapping' }] },
                { id: 'distribution', label: 'Distribution',   icon: '\u{1F69A}', desc: 'Warehousing and logistics hubs. The connective tissue that moves goods across regions and borders.',
                  wikiLinks: [{ label: 'Bottlenecks', href: '/wiki/field-notes/004-bottlenecks' }] },
                { id: 'retail',       label: 'Retail',         icon: '\u{1F3EA}', desc: 'Point of sale \u2014 physical storefronts, online channels, direct-to-consumer. Last mile before the buyer.',
                  wikiLinks: [{ label: 'Pareto Analysis', href: '/wiki/tools/pareto-analysis' }] },
                { id: 'consumer',     label: 'Consumer',       icon: '\u{1F464}', desc: 'The end user. Their purchasing behavior, location, and demand signals flow back upstream.',
                  wikiLinks: [{ label: 'Feedback Loops', href: '/wiki/frameworks/feedback-loops' }] },
                { id: 'data',         label: 'Data / Feedback',icon: '\u{1F4CA}', desc: 'Real-time telemetry: sales data, inventory alerts, quality flags. Closes the loop back to Source.',
                  wikiLinks: [{ label: 'Signal vs Noise', href: '/wiki/concepts/signal-vs-noise' }] },
            ],
            edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0]]
        },

        'food-security': {
            label: 'Food Security',
            icon: '\u{1F33E}',
            layout: 'linear',
            nodes: [
                { id: 'farm',         label: 'Farm',           icon: '\u{1F33E}', desc: 'Production origin \u2014 crop fields, greenhouses, aquaculture. Where food begins its journey.',
                  wikiLinks: [{ label: 'First Principles', href: '/wiki/concepts/first-principles' }] },
                { id: 'harvest',      label: 'Harvest',        icon: '\u{1F33D}', desc: 'Collection and initial sorting. Timing is critical \u2014 ripeness, weather, labor availability.',
                  wikiLinks: [{ label: 'Time-Boxing', href: '/wiki/tools/time-boxing' }] },
                { id: 'cold-chain',   label: 'Cold Chain',     icon: '\u2744\uFE0F', desc: 'Temperature-controlled transport. A single break in the cold chain can spoil an entire shipment.',
                  wikiLinks: [{ label: 'Risk Assessment', href: '/wiki/frameworks/risk-assessment' }] },
                { id: 'processing',   label: 'Processing',     icon: '\u{1F52A}', desc: 'Washing, cutting, packaging. Food safety protocols and shelf-life optimization happen here.',
                  wikiLinks: [{ label: 'Process Mapping', href: '/wiki/tools/process-mapping' }] },
                { id: 'distribution', label: 'Distribution',   icon: '\u{1F69A}', desc: 'Regional hubs and last-mile delivery. The most expensive and failure-prone segment.',
                  wikiLinks: [{ label: 'Constraint Mapping', href: '/wiki/frameworks/constraint-mapping' }] },
                { id: 'access',       label: 'Access',         icon: '\u{1F37D}\uFE0F', desc: 'Grocery stores, food banks, community kitchens. Where availability meets affordability.',
                  wikiLinks: [{ label: 'Opportunity Cost', href: '/wiki/concepts/opportunity-cost' }] },
            ],
            edges: [[0,1],[1,2],[2,3],[3,4],[4,5]]
        },

        'data-modeling': {
            label: 'Data & Modeling',
            icon: '\u{1F4CA}',
            layout: 'hub-spoke',
            nodes: [
                { id: 'central',      label: 'Data Lake',      icon: '\u{1F4BE}', desc: 'Central repository \u2014 structured and unstructured data converge here for analysis and modeling.',
                  wikiLinks: [{ label: 'Systems Thinking', href: '/wiki/concepts/systems-thinking' }] },
                { id: 'ingest',       label: 'Ingestion',      icon: '\u{1F4E5}', desc: 'ETL pipelines, API feeds, manual uploads. The quality of your model depends on the quality of your inputs.',
                  wikiLinks: [{ label: 'Signal vs Noise', href: '/wiki/concepts/signal-vs-noise' }] },
                { id: 'clean',        label: 'Cleaning',       icon: '\u{1F9F9}', desc: 'Deduplication, normalization, type-checking. 80% of data work happens here.',
                  wikiLinks: [{ label: 'Five Whys', href: '/wiki/tools/five-whys' }] },
                { id: 'model',        label: 'Modeling',       icon: '\u{1F9EE}', desc: 'Statistical models, ML pipelines, simulation engines. Turning data into predictive insight.',
                  wikiLinks: [{ label: 'Mental Models', href: '/wiki/concepts/mental-models' }] },
                { id: 'visualize',    label: 'Visualization',  icon: '\u{1F4C8}', desc: 'Dashboards, charts, reports. Making complex patterns visible to decision-makers.',
                  wikiLinks: [{ label: 'Decision Matrix', href: '/wiki/frameworks/decision-matrix' }] },
                { id: 'action',       label: 'Action',         icon: '\u26A1',    desc: 'Automated triggers, alerts, recommendations. Data becomes operational when it drives decisions.',
                  wikiLinks: [{ label: 'Feedback Loops', href: '/wiki/frameworks/feedback-loops' }] },
            ],
            edges: [[0,1],[0,2],[0,3],[0,4],[0,5]]
        },

        'strategy': {
            label: 'Strategy',
            icon: '\u265F',
            layout: 'diamond',
            nodes: [
                { id: 'assess',       label: 'Assess',         icon: '\u{1F50D}', desc: 'Current state analysis \u2014 where are you now? Map the terrain before choosing a direction.',
                  wikiLinks: [{ label: 'SWOT Analysis', href: '/wiki/frameworks/swot-analysis' }] },
                { id: 'options',      label: 'Options',        icon: '\u{1F500}', desc: 'Generate alternatives. Build vs buy, pivot vs persist, grow vs consolidate.',
                  wikiLinks: [{ label: 'Decision Matrix', href: '/wiki/frameworks/decision-matrix' }] },
                { id: 'decide',       label: 'Decide',         icon: '\u2714\uFE0F', desc: 'Commit to a path. The cost of indecision often exceeds the cost of a wrong decision.',
                  wikiLinks: [{ label: 'Prioritization', href: '/wiki/frameworks/prioritization-matrix' }] },
                { id: 'resources',    label: 'Resources',      icon: '\u{1F4B0}', desc: 'Allocate budget, people, time. Strategy without resources is just wishful thinking.',
                  wikiLinks: [{ label: 'Opportunity Cost', href: '/wiki/concepts/opportunity-cost' }] },
                { id: 'execute',      label: 'Execute',        icon: '\u{1F680}', desc: 'Implementation. Where strategy meets reality and plans encounter friction.',
                  wikiLinks: [{ label: 'Trace Protocol', href: '/wiki/frameworks/trace-protocol' }] },
            ],
            edges: [[0,1],[0,3],[1,2],[3,2],[2,4]]
        },

        'technology': {
            label: 'Technology',
            icon: '\u{1F4BB}',
            layout: 'hub-spoke',
            nodes: [
                { id: 'core',         label: 'Core Platform',  icon: '\u{1F5A5}\uFE0F', desc: 'The central system \u2014 your database, API, auth layer. Everything depends on this being solid.',
                  wikiLinks: [{ label: 'Root Cause', href: '/wiki/concepts/root-cause' }] },
                { id: 'frontend',     label: 'Frontend',       icon: '\u{1F3A8}', desc: 'User-facing interfaces \u2014 web, mobile, CLI. Where users form their opinion of your product.',
                  wikiLinks: [{ label: 'Assumption Mapping', href: '/wiki/tools/assumption-mapping' }] },
                { id: 'infra',        label: 'Infrastructure', icon: '\u2601\uFE0F', desc: 'Servers, CDNs, CI/CD, monitoring. The invisible layer that makes everything else possible.',
                  wikiLinks: [{ label: 'Risk Assessment', href: '/wiki/frameworks/risk-assessment' }] },
                { id: 'integrations', label: 'Integrations',   icon: '\u{1F517}', desc: 'Third-party APIs, webhooks, data feeds. Every integration is a potential failure point.',
                  wikiLinks: [{ label: 'Constraint Mapping', href: '/wiki/frameworks/constraint-mapping' }] },
                { id: 'security',     label: 'Security',       icon: '\u{1F512}', desc: 'Auth, encryption, audit logs. Not a feature \u2014 a property of every other component.',
                  wikiLinks: [{ label: 'Fishbone Diagram', href: '/wiki/tools/fishbone-diagram' }] },
                { id: 'data',         label: 'Data Layer',     icon: '\u{1F4BE}', desc: 'Databases, caches, search indexes. How data flows determines how fast you can move.',
                  wikiLinks: [{ label: 'Systems Thinking', href: '/wiki/concepts/systems-thinking' }] },
            ],
            edges: [[0,1],[0,2],[0,3],[0,4],[0,5]]
        },

        'growth': {
            label: 'Growth',
            icon: '\u{1F4C8}',
            layout: 'tree',
            nodes: [
                { id: 'awareness',    label: 'Awareness',      icon: '\u{1F4E2}', desc: 'Top of funnel \u2014 how people first hear about you. Content, ads, referrals, word of mouth.',
                  wikiLinks: [{ label: 'Survivorship Bias', href: '/wiki/concepts/survivorship-bias' }] },
                { id: 'acquisition',  label: 'Acquisition',    icon: '\u{1F3AF}', desc: 'Converting attention into visits. Landing pages, SEO, social proof.',
                  wikiLinks: [{ label: 'Pareto Analysis', href: '/wiki/tools/pareto-analysis' }] },
                { id: 'activation',   label: 'Activation',     icon: '\u{1F4A1}', desc: 'First value moment. The point where a visitor becomes a user who "gets it."',
                  wikiLinks: [{ label: 'Second-Order Effects', href: '/wiki/concepts/second-order-effects' }] },
                { id: 'retention',    label: 'Retention',      icon: '\u{1F501}', desc: 'Repeat usage. The most important metric \u2014 retention compounds, acquisition doesn\'t.',
                  wikiLinks: [{ label: 'Compounding', href: '/wiki/concepts/compounding' }] },
                { id: 'revenue',      label: 'Revenue',        icon: '\u{1F4B5}', desc: 'Monetization. Pricing, packaging, payment friction. Where value captured meets value delivered.',
                  wikiLinks: [{ label: 'Prioritization', href: '/wiki/frameworks/prioritization-matrix' }] },
                { id: 'referral',     label: 'Referral',       icon: '\u{1F4AC}', desc: 'Organic growth loops. Happy users bring more users \u2014 the cheapest acquisition channel.',
                  wikiLinks: [{ label: 'Feedback Loops', href: '/wiki/frameworks/feedback-loops' }] },
            ],
            edges: [[0,1],[0,2],[1,3],[2,3],[3,4],[3,5]]
        },

        'hardware-iot': {
            label: 'Hardware / IoT',
            icon: '\u{1F50C}',
            layout: 'circular',
            nodes: [
                { id: 'design',       label: 'Design',         icon: '\u{1F4D0}', desc: 'CAD, schematics, BOM. Every hardware decision is expensive to reverse after manufacturing.',
                  wikiLinks: [{ label: 'First Principles', href: '/wiki/concepts/first-principles' }] },
                { id: 'prototype',    label: 'Prototype',      icon: '\u{1F527}', desc: '3D printing, breadboards, dev boards. Fast iteration before committing to tooling.',
                  wikiLinks: [{ label: 'Assumption Mapping', href: '/wiki/tools/assumption-mapping' }] },
                { id: 'firmware',     label: 'Firmware',       icon: '\u{1F4BE}', desc: 'Embedded code \u2014 C/C++, MicroPython, RTOS. The software that lives on the metal.',
                  wikiLinks: [{ label: 'Trace Protocol', href: '/wiki/frameworks/trace-protocol' }] },
                { id: 'sensors',      label: 'Sensors',        icon: '\u{1F4E1}', desc: 'Input devices \u2014 temperature, pressure, motion, light. The physical world becomes data.',
                  wikiLinks: [{ label: 'Signal vs Noise', href: '/wiki/concepts/signal-vs-noise' }] },
                { id: 'connectivity', label: 'Connectivity',   icon: '\u{1F4F6}', desc: 'WiFi, BLE, LoRa, cellular. How devices talk to each other and to the cloud.',
                  wikiLinks: [{ label: 'Constraint Mapping', href: '/wiki/frameworks/constraint-mapping' }] },
                { id: 'cloud',        label: 'Cloud',          icon: '\u2601\uFE0F', desc: 'Device management, OTA updates, data aggregation. The backend that scales your fleet.',
                  wikiLinks: [{ label: 'Systems Thinking', href: '/wiki/concepts/systems-thinking' }] },
            ],
            edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0]]
        },

        'research': {
            label: 'Research',
            icon: '\u{1F52C}',
            layout: 'tree',
            nodes: [
                { id: 'question',     label: 'Question',       icon: '\u2753',    desc: 'The research question \u2014 what are we trying to learn? Precision here determines everything downstream.',
                  wikiLinks: [{ label: 'First Principles', href: '/wiki/concepts/first-principles' }] },
                { id: 'literature',   label: 'Literature',     icon: '\u{1F4DA}', desc: 'What\'s already known? Prior art, existing research, domain expertise. Don\'t reinvent the wheel.',
                  wikiLinks: [{ label: 'Mental Models', href: '/wiki/concepts/mental-models' }] },
                { id: 'methodology',  label: 'Methodology',    icon: '\u{1F9EA}', desc: 'How will you investigate? Experiment design, data collection protocols, controls.',
                  wikiLinks: [{ label: 'Trace Protocol', href: '/wiki/frameworks/trace-protocol' }] },
                { id: 'data',         label: 'Data',           icon: '\u{1F4CA}', desc: 'Raw observations, measurements, survey responses. The empirical foundation of your findings.',
                  wikiLinks: [{ label: 'Cognitive Biases', href: '/wiki/concepts/cognitive-biases' }] },
                { id: 'analysis',     label: 'Analysis',       icon: '\u{1F9EE}', desc: 'Statistical tests, pattern recognition, correlation vs causation. Where data becomes insight.',
                  wikiLinks: [{ label: 'Survivorship Bias', href: '/wiki/concepts/survivorship-bias' }] },
                { id: 'findings',     label: 'Findings',       icon: '\u{1F4DD}', desc: 'Conclusions, recommendations, next questions. Research that doesn\'t ship is research that didn\'t happen.',
                  wikiLinks: [{ label: 'Retrospective', href: '/wiki/tools/retrospective' }] },
            ],
            edges: [[0,1],[0,2],[1,3],[2,3],[3,4],[4,5]]
        }
    };

    const INDUSTRY_ORDER = [
        'ops-logistics', 'food-security', 'data-modeling', 'strategy',
        'technology', 'growth', 'hardware-iot', 'research'
    ];

    // ── Color mapping from CSS custom properties ─────────────────────────────
    function cssVar(name, fallback) {
        const val = getComputedStyle(document.documentElement)
            .getPropertyValue(name).trim();
        return val || fallback;
    }

    function hexToThree(hex) {
        const clean = hex.replace(/^#/, '');
        return parseInt(clean.length === 3
            ? clean.split('').map(function (c) { return c + c; }).join('')
            : clean, 16);
    }

    function getThemeColors() {
        return {
            bg:       hexToThree(cssVar('--canvas', '#e8e0d0')),
            node:     hexToThree(cssVar('--burnt-orange', '#e07b3c')),
            nodeHov:  hexToThree(cssVar('--rust', '#c2410c')),
            edge:     hexToThree(cssVar('--teal', '#0d9488')),
            particle: hexToThree(cssVar('--highlight', '#fbbf24')),
            text:     cssVar('--ink', '#3a312b'),
        };
    }

    // ── State ────────────────────────────────────────────────────────────────
    let renderer, scene, camera, animId;
    let nodeMeshes = [];
    let particleGroups = [];
    let colors = {};
    let hoveredIdx = -1;
    let activeIndustry = 'ops-logistics';

    const container = document.getElementById('supply-chain-container');
    const canvas    = document.getElementById('supply-chain-canvas');
    const infoPanel = document.getElementById('supply-chain-info');

    if (!container || !canvas || !infoPanel) return;

    // ── Layout algorithms ────────────────────────────────────────────────────

    function computeCircularPositions(w, h, n) {
        var portrait = h > w;
        var radius = Math.min(w, h) * 0.35;
        var positions = [];
        for (var i = 0; i < n; i++) {
            var angle = (2 * Math.PI * i / n) - Math.PI / 2;
            var x = radius * Math.cos(angle) * (portrait ? 0.7 : 1.0);
            var y = radius * Math.sin(angle) * (portrait ? 1.0 : 0.7);
            positions.push(new THREE.Vector3(x, -y, 0));
        }
        return positions;
    }

    function computeLinearPositions(w, h, n) {
        var portrait = h > w;
        var positions = [];
        if (portrait) {
            var span = h * 0.7;
            var startY = span / 2;
            for (var i = 0; i < n; i++) {
                var y = startY - (span * i / (n - 1));
                positions.push(new THREE.Vector3(0, y, 0));
            }
        } else {
            var spanX = w * 0.7;
            var startX = -spanX / 2;
            for (var j = 0; j < n; j++) {
                var xPos = startX + (spanX * j / (n - 1));
                positions.push(new THREE.Vector3(xPos, 0, 0));
            }
        }
        return positions;
    }

    function computeHubSpokePositions(w, h, n) {
        var portrait = h > w;
        var radius = Math.min(w, h) * 0.32;
        var positions = [new THREE.Vector3(0, 0, 0)]; // hub
        var spokes = n - 1;
        for (var i = 0; i < spokes; i++) {
            var angle = (2 * Math.PI * i / spokes) - Math.PI / 2;
            var x = radius * Math.cos(angle) * (portrait ? 0.75 : 1.0);
            var y = radius * Math.sin(angle) * (portrait ? 1.0 : 0.75);
            positions.push(new THREE.Vector3(x, -y, 0));
        }
        return positions;
    }

    function computeTreePositions(w, h, n) {
        // 3-tier layout: root (1), mid (2), leaves (rest)
        var tiers;
        if (n <= 3) {
            tiers = [1, n - 1];
        } else if (n <= 5) {
            tiers = [1, 2, n - 3];
        } else {
            tiers = [1, 2, n - 3];
        }

        var positions = [];
        var totalH = Math.min(w, h) * 0.65;
        var tierSpacing = totalH / (tiers.length - 1 || 1);
        var startY = totalH / 2;

        for (var t = 0; t < tiers.length; t++) {
            var count = tiers[t];
            var y = startY - t * tierSpacing;
            var tierWidth = Math.min(w, h) * 0.55;
            for (var i = 0; i < count; i++) {
                var x = count === 1 ? 0 : -tierWidth / 2 + (tierWidth * i / (count - 1));
                positions.push(new THREE.Vector3(x, y, 0));
            }
        }
        return positions;
    }

    function computeDiamondPositions(w, h, n) {
        var radius = Math.min(w, h) * 0.32;
        var positions = [];

        // Top, Right, Bottom, Left, Center pattern
        var diamond = [
            [0, 1],           // top
            [0.85, 0],        // right
            [0, -1],          // bottom
            [-0.85, 0],       // left
            [0, 0]            // center
        ];

        for (var i = 0; i < Math.min(n, diamond.length); i++) {
            positions.push(new THREE.Vector3(
                diamond[i][0] * radius,
                diamond[i][1] * radius,
                0
            ));
        }

        // Extra nodes orbit the center
        for (var j = diamond.length; j < n; j++) {
            var angle = (2 * Math.PI * (j - diamond.length) / (n - diamond.length));
            positions.push(new THREE.Vector3(
                radius * 0.5 * Math.cos(angle),
                radius * 0.5 * Math.sin(angle),
                0
            ));
        }
        return positions;
    }

    function computePositions(w, h) {
        var dataset = INDUSTRIES[activeIndustry];
        var n = dataset.nodes.length;
        var layoutType = dataset.layout;

        switch (layoutType) {
            case 'linear':    return computeLinearPositions(w, h, n);
            case 'hub-spoke': return computeHubSpokePositions(w, h, n);
            case 'tree':      return computeTreePositions(w, h, n);
            case 'diamond':   return computeDiamondPositions(w, h, n);
            default:          return computeCircularPositions(w, h, n);
        }
    }

    // ── Label sprite ─────────────────────────────────────────────────────────
    function makeLabel(text, color) {
        var size = 512;
        var c = document.createElement('canvas');
        c.width  = size;
        c.height = 128;
        var ctx = c.getContext('2d');
        ctx.clearRect(0, 0, size, 128);
        ctx.font = 'bold 48px "JetBrains Mono", monospace';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, size / 2, 64);
        var tex = new THREE.CanvasTexture(c);
        tex.needsUpdate = true;
        var mat = new THREE.SpriteMaterial({ map: tex, depthTest: false });
        var sprite = new THREE.Sprite(mat);
        sprite.scale.set(120, 30, 1);
        return { sprite: sprite, canvas: c };
    }

    // ── Scene setup ──────────────────────────────────────────────────────────
    function buildScene() {
        var dataset = INDUSTRIES[activeIndustry];
        var nodes = dataset.nodes;
        var edges = dataset.edges;

        colors = getThemeColors();

        scene = new THREE.Scene();
        scene.background = new THREE.Color(colors.bg);

        var w = canvas.clientWidth;
        var h = canvas.clientHeight;

        camera = new THREE.OrthographicCamera(
            -w / 2, w / 2, h / 2, -h / 2, 0.1, 1000
        );
        camera.position.z = 100;

        var positions = computePositions(w, h);

        // Nodes
        nodeMeshes = [];
        nodes.forEach(function (node, i) {
            var geo = new THREE.CircleGeometry(28, 32);
            var mat = new THREE.MeshBasicMaterial({ color: colors.node });
            var mesh = new THREE.Mesh(geo, mat);
            mesh.position.copy(positions[i]);
            mesh.userData = { index: i };
            scene.add(mesh);
            nodeMeshes.push(mesh);

            // Border ring
            var ring = new THREE.RingGeometry(28, 31, 32);
            var ringMat = new THREE.MeshBasicMaterial({
                color: colors.edge, side: THREE.DoubleSide
            });
            var ringMesh = new THREE.Mesh(ring, ringMat);
            ringMesh.position.copy(positions[i]);
            scene.add(ringMesh);

            // Label sprite positioned below node (closer to avoid clipping)
            var label = makeLabel(node.label, colors.text);
            label.sprite.position.set(positions[i].x, positions[i].y - 42, 0);
            scene.add(label.sprite);
        });

        // Edges + particles
        particleGroups = [];
        edges.forEach(function (pair) {
            var from = pair[0], to = pair[1];
            var start = positions[from].clone();
            var end   = positions[to].clone();

            // Line
            var pts = [start, end];
            var lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
            var lineMat = new THREE.LineBasicMaterial({
                color: colors.edge, opacity: 0.5, transparent: true
            });
            scene.add(new THREE.Line(lineGeo, lineMat));

            // Flow particles (3 per edge, evenly staggered)
            var particles = [];
            var count = 3;
            for (var p = 0; p < count; p++) {
                var pGeo = new THREE.CircleGeometry(5, 8);
                var pMat = new THREE.MeshBasicMaterial({ color: colors.particle });
                var pMesh = new THREE.Mesh(pGeo, pMat);
                pMesh.userData.t = p / count;
                scene.add(pMesh);
                particles.push(pMesh);
            }
            particleGroups.push({ particles: particles, start: start, end: end });
        });

        // Renderer — reuse if already created (tab switches don't recreate)
        if (!renderer) {
            renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }
        renderer.setSize(w, h, false);
    }

    // ── Animation loop ───────────────────────────────────────────────────────
    var lastTime = 0;
    function animate(ts) {
        animId = requestAnimationFrame(animate);

        var dt = (ts - lastTime) / 1000;
        lastTime = ts;
        var speed = 0.18;

        particleGroups.forEach(function (group) {
            group.particles.forEach(function (p) {
                p.userData.t = (p.userData.t + speed * dt) % 1;
                p.position.lerpVectors(group.start, group.end, p.userData.t);
            });
        });

        renderer.render(scene, camera);
    }

    // ── Resize ───────────────────────────────────────────────────────────────
    function onResize() {
        if (!renderer) return;
        dispose();
        buildScene();
        if (!animId) animate(0);
    }

    // ── Hit test (pointer events) ────────────────────────────────────────────
    var raycaster = new THREE.Raycaster();
    var pointer   = new THREE.Vector2();

    function getNdcFromEvent(e) {
        var rect = canvas.getBoundingClientRect();
        var clientX = e.touches ? e.touches[0].clientX : e.clientX;
        var clientY = e.touches ? e.touches[0].clientY : e.clientY;
        pointer.x = ((clientX - rect.left) / rect.width)  * 2 - 1;
        pointer.y = -((clientY - rect.top)  / rect.height) * 2 + 1;
    }

    function handlePointer(e) {
        if (!renderer) return;
        e.preventDefault();
        getNdcFromEvent(e);
        raycaster.setFromCamera(pointer, camera);
        var hits = raycaster.intersectObjects(nodeMeshes);

        if (hits.length > 0) {
            var idx = hits[0].object.userData.index;
            selectNode(idx);
        } else {
            clearSelection();
        }
    }

    function selectNode(idx) {
        var dataset = INDUSTRIES[activeIndustry];
        var nodes = dataset.nodes;

        nodeMeshes.forEach(function (m, i) {
            m.material.color.set(i === idx ? colors.nodeHov : colors.node);
        });
        hoveredIdx = idx;
        var node = nodes[idx];

        // Build CTA links HTML
        var actionsHtml = '';
        if (node.wikiLinks && node.wikiLinks.length > 0) {
            var links = node.wikiLinks.map(function (link) {
                return '<a href="' + link.href + '" class="cta-button cta-secondary cta-sm">' + link.label + ' \u2192</a>';
            }).join('');
            actionsHtml = '<div class="viz-info-actions">' + links + '</div>';
        }

        infoPanel.innerHTML =
            '<div class="viz-info-inner">' +
                '<span class="viz-info-icon" aria-hidden="true">' + node.icon + '</span>' +
                '<div class="viz-info-content">' +
                    '<strong class="viz-info-title">' + node.label + '</strong>' +
                    '<p class="viz-info-desc">' + node.desc + '</p>' +
                    actionsHtml +
                '</div>' +
                '<button type="button" class="viz-info-close" aria-label="Close" ' +
                    'onclick="this.closest(\'#supply-chain-info\').classList.remove(\'viz-info-open\')">\u00D7</button>' +
            '</div>';
        infoPanel.classList.add('viz-info-open');
    }

    function clearSelection() {
        nodeMeshes.forEach(function (m) { m.material.color.set(colors.node); });
        hoveredIdx = -1;
        infoPanel.classList.remove('viz-info-open');
    }

    // ── Tab switching ────────────────────────────────────────────────────────
    function switchIndustry(industryId) {
        if (industryId === activeIndustry) return;
        if (!INDUSTRIES[industryId]) return;

        activeIndustry = industryId;
        if (typeof Debug !== 'undefined') Debug.log('SupplyChain', 'Switching to: ' + industryId);

        // Update tab UI
        var tabs = document.querySelectorAll('.viz-tab');
        tabs.forEach(function (tab) {
            var isActive = tab.getAttribute('data-industry') === industryId;
            tab.classList.toggle('viz-tab--active', isActive);
            tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        // Close info panel
        clearSelection();

        // Update reduced-motion fallback
        updateReducedMotionFallback();

        // Rebuild scene
        if (initialized) {
            dispose();
            buildScene();
            animate(0);
        }
    }

    // ── Reduced-motion fallback ──────────────────────────────────────────────
    function updateReducedMotionFallback() {
        var fallback = document.querySelector('.viz-reduced-motion-fallback');
        if (!fallback) return;
        var dataset = INDUSTRIES[activeIndustry];
        var chain = dataset.edges.map(function (pair) {
            return dataset.nodes[pair[0]].label + ' \u2192 ' + dataset.nodes[pair[1]].label;
        }).join(' \u00B7 ');
        fallback.textContent = chain;
    }

    // ── Theme change observer ────────────────────────────────────────────────
    var themeObserver = new MutationObserver(function () {
        if (!scene) return;
        colors = getThemeColors();
        scene.background.set(colors.bg);
        nodeMeshes.forEach(function (m, i) {
            m.material.color.set(i === hoveredIdx ? colors.nodeHov : colors.node);
        });
        particleGroups.forEach(function (group) {
            group.particles.forEach(function (p) { p.material.color.set(colors.particle); });
        });
    });

    // ── Dispose ──────────────────────────────────────────────────────────────
    function dispose() {
        if (animId) { cancelAnimationFrame(animId); animId = null; }
        // Don't dispose the renderer — reuse it across tab switches
        // Disposing creates a new WebGL context which can fail
        if (scene) {
            // Clean up all objects in the scene
            while (scene.children.length > 0) {
                var child = scene.children[0];
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (child.material.map) child.material.map.dispose();
                    child.material.dispose();
                }
                scene.remove(child);
            }
        }
        scene = null;
        camera = null;
        nodeMeshes = [];
        particleGroups = [];
    }

    // ── Lazy init via IntersectionObserver ────────────────────────────────────
    var initialized = false;

    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting && !initialized) {
                if (typeof THREE === 'undefined') {
                    var loadEl = container.querySelector('.viz-loading');
                    if (loadEl) loadEl.remove();
                    var err = document.createElement('p');
                    err.className = 'viz-fallback-msg';
                    err.textContent = 'Visualization requires JavaScript.';
                    container.insertBefore(err, canvas);
                    return;
                }
                initialized = true;
                var loadingEl = container.querySelector('.viz-loading');
                if (loadingEl) loadingEl.remove();
                canvas.style.display = 'block';
                buildScene();
                animate(0);
                updateReducedMotionFallback();
                themeObserver.observe(document.documentElement, {
                    attributes: true, attributeFilter: ['data-theme']
                });
                window.addEventListener('resize', onResize);
            }
        });
    }, { threshold: 0.1 });

    // Hide canvas initially
    canvas.style.display = 'none';

    // Show loading state
    var loading = document.createElement('div');
    loading.className = 'viz-loading';
    loading.setAttribute('aria-hidden', 'true');
    loading.textContent = '[ Loading visualization\u2026 ]';
    container.insertBefore(loading, canvas);

    io.observe(container);

    // Pointer / touch events
    canvas.addEventListener('pointerdown', handlePointer);

    // Tab click delegation
    var tabContainer = document.querySelector('.viz-tabs');
    if (tabContainer) {
        tabContainer.addEventListener('click', function (e) {
            var tab = e.target.closest('.viz-tab');
            if (tab) {
                var industryId = tab.getAttribute('data-industry');
                switchIndustry(industryId);
            }
        });
    }

})();
