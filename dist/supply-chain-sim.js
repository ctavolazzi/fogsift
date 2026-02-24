/**
 * supply-chain-sim.js — FogSift Supply Chain Visualization
 * Three.js r150 · Mobile-first · CSP-compliant (no inline eval)
 * Lazy-initialized via IntersectionObserver
 */
(function () {
    'use strict';

    // ── Node definitions ──────────────────────────────────────────────────────
    const NODES = [
        { id: 'source',       label: 'Source',       icon: '⛏',
          desc: 'Raw material extraction — farms, mines, fishing grounds. The origin point of every supply chain.' },
        { id: 'processing',   label: 'Processing',   icon: '⚙',
          desc: 'Initial transformation — milling grain, refining ore, cleaning raw produce before it moves downstream.' },
        { id: 'manufacture',  label: 'Manufacturing', icon: '🏭',
          desc: 'Assembly and fabrication. Where components become finished goods ready for distribution.' },
        { id: 'distribution', label: 'Distribution', icon: '🚚',
          desc: 'Warehousing and logistics hubs. The connective tissue that moves goods across regions and borders.' },
        { id: 'retail',       label: 'Retail',       icon: '🏪',
          desc: 'Point of sale — physical storefronts, online channels, direct-to-consumer. Last mile before the buyer.' },
        { id: 'consumer',     label: 'Consumer',     icon: '👤',
          desc: 'The end user. Their purchasing behavior, location, and demand signals flow back upstream.' },
        { id: 'data',         label: 'Data / Feedback', icon: '📊',
          desc: 'Real-time telemetry: sales data, inventory alerts, quality flags. Closes the loop back to Source.' },
    ];

    // Edge connections (index pairs → NODES array indices)
    const EDGES = [
        [0, 1], // Source → Processing
        [1, 2], // Processing → Manufacturing
        [2, 3], // Manufacturing → Distribution
        [3, 4], // Distribution → Retail
        [4, 5], // Retail → Consumer
        [5, 6], // Consumer → Data
        [6, 0], // Data → Source (closes the loop)
    ];

    // ── Color mapping from CSS custom properties ──────────────────────────────
    function cssVar(name, fallback) {
        const val = getComputedStyle(document.documentElement)
            .getPropertyValue(name).trim();
        return val || fallback;
    }

    function hexToThree(hex) {
        // Strip leading # if present
        const clean = hex.replace(/^#/, '');
        return parseInt(clean.length === 3
            ? clean.split('').map(c => c + c).join('')
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

    // ── State ─────────────────────────────────────────────────────────────────
    let renderer, scene, camera, animId;
    let nodeMeshes = [];
    let particleGroups = []; // one group per edge
    let labelCanvases = [];
    let colors = {};
    let hoveredIdx = -1;
    let isPortrait = true;

    const container = document.getElementById('supply-chain-container');
    const canvas    = document.getElementById('supply-chain-canvas');
    const infoPanel = document.getElementById('supply-chain-info');

    if (!container || !canvas || !infoPanel) return;

    // ── Layout ────────────────────────────────────────────────────────────────
    // Returns 3D positions for the 7 nodes arranged in a circle/ellipse,
    // oriented based on aspect ratio.
    function computePositions(w, h) {
        const portrait = h > w;
        const n = NODES.length;
        const radius = Math.min(w, h) * 0.35;
        const positions = [];
        for (let i = 0; i < n; i++) {
            // Start from top (-π/2 offset) so flow reads top-to-bottom in portrait
            const angle = (2 * Math.PI * i / n) - Math.PI / 2;
            const x = radius * Math.cos(angle) * (portrait ? 0.7 : 1.0);
            const y = radius * Math.sin(angle) * (portrait ? 1.0 : 0.7);
            positions.push(new THREE.Vector3(x, -y, 0));
        }
        return positions;
    }

    // ── Label sprite ──────────────────────────────────────────────────────────
    function makeLabel(text, color) {
        const size = 256;
        const c = document.createElement('canvas');
        c.width  = size;
        c.height = 64;
        const ctx = c.getContext('2d');
        ctx.clearRect(0, 0, size, 64);
        ctx.font = 'bold 28px "JetBrains Mono", monospace';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, size / 2, 32);
        const tex = new THREE.CanvasTexture(c);
        tex.needsUpdate = true;
        const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(1.8, 0.45, 1);
        return { sprite, canvas: c };
    }

    // ── Scene setup ───────────────────────────────────────────────────────────
    function buildScene() {
        colors = getThemeColors();

        scene    = new THREE.Scene();
        scene.background = new THREE.Color(colors.bg);

        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        isPortrait = h > w;

        camera = new THREE.OrthographicCamera(
            -w / 2, w / 2, h / 2, -h / 2, 0.1, 1000
        );
        camera.position.z = 100;

        const positions = computePositions(w, h);

        // Nodes
        nodeMeshes = [];
        NODES.forEach((node, i) => {
            const geo = new THREE.CircleGeometry(28, 32);
            const mat = new THREE.MeshBasicMaterial({ color: colors.node });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.copy(positions[i]);
            mesh.userData = { index: i };
            scene.add(mesh);
            nodeMeshes.push(mesh);

            // Border ring
            const ring = new THREE.RingGeometry(28, 31, 32);
            const ringMat = new THREE.MeshBasicMaterial({
                color: colors.edge, side: THREE.DoubleSide
            });
            const ringMesh = new THREE.Mesh(ring, ringMat);
            ringMesh.position.copy(positions[i]);
            scene.add(ringMesh);

            // Label sprite positioned below node
            const { sprite } = makeLabel(node.label, colors.text);
            sprite.position.set(positions[i].x, positions[i].y - 50, 0);
            scene.add(sprite);
        });

        // Edges + particles
        particleGroups = [];
        EDGES.forEach(([from, to]) => {
            const start = positions[from].clone();
            const end   = positions[to].clone();

            // Line
            const pts = [start, end];
            const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
            const lineMat = new THREE.LineBasicMaterial({
                color: colors.edge, opacity: 0.5, transparent: true
            });
            scene.add(new THREE.Line(lineGeo, lineMat));

            // Flow particles (3 per edge, evenly staggered)
            const particles = [];
            const count = 3;
            for (let p = 0; p < count; p++) {
                const pGeo = new THREE.CircleGeometry(5, 8);
                const pMat = new THREE.MeshBasicMaterial({ color: colors.particle });
                const pMesh = new THREE.Mesh(pGeo, pMat);
                pMesh.userData.t = p / count; // stagger 0, 1/3, 2/3
                scene.add(pMesh);
                particles.push(pMesh);
            }
            particleGroups.push({ particles, start, end });
        });

        // Renderer
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(w, h, false); // false = don't set canvas style
    }

    // ── Animation loop ────────────────────────────────────────────────────────
    let lastTime = 0;
    function animate(ts) {
        animId = requestAnimationFrame(animate);

        const dt = (ts - lastTime) / 1000;
        lastTime = ts;
        const speed = 0.18; // units/second around the loop

        particleGroups.forEach(({ particles, start, end }) => {
            particles.forEach(p => {
                p.userData.t = (p.userData.t + speed * dt) % 1;
                p.position.lerpVectors(start, end, p.userData.t);
            });
        });

        renderer.render(scene, camera);
    }

    // ── Resize ────────────────────────────────────────────────────────────────
    function onResize() {
        if (!renderer) return;
        const w = container.clientWidth;
        const h = Math.max(300, Math.min(window.innerHeight * 0.5, 500));
        canvas.style.height = h + 'px';

        camera.left   = -w / 2;
        camera.right  =  w / 2;
        camera.top    =  h / 2;
        camera.bottom = -h / 2;
        camera.updateProjectionMatrix();

        renderer.setSize(w, h, false);

        // Reposition nodes
        const positions = computePositions(w, h);
        nodeMeshes.forEach((mesh, i) => mesh.position.copy(positions[i]));

        // Update edge geometry and particle start/end
        // Rebuild scene geometry is simplest for resize
        dispose();
        buildScene();
        if (!animId) animate(0);
    }

    // ── Hit test (pointer events) ─────────────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const pointer   = new THREE.Vector2();

    function getNdcFromEvent(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        pointer.x = ((clientX - rect.left) / rect.width)  * 2 - 1;
        pointer.y = -((clientY - rect.top)  / rect.height) * 2 + 1;
    }

    function handlePointer(e) {
        if (!renderer) return;
        e.preventDefault();
        getNdcFromEvent(e);
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(nodeMeshes);

        if (hits.length > 0) {
            const idx = hits[0].object.userData.index;
            selectNode(idx);
        } else {
            clearSelection();
        }
    }

    function selectNode(idx) {
        nodeMeshes.forEach((m, i) => {
            m.material.color.set(i === idx ? colors.nodeHov : colors.node);
        });
        hoveredIdx = idx;
        const node = NODES[idx];
        infoPanel.innerHTML = `
            <div class="viz-info-inner">
                <span class="viz-info-icon" aria-hidden="true">${node.icon}</span>
                <div>
                    <strong class="viz-info-title">${node.label}</strong>
                    <p class="viz-info-desc">${node.desc}</p>
                </div>
                <button class="viz-info-close" aria-label="Close" onclick="this.closest('#supply-chain-info').classList.remove('viz-info-open')">×</button>
            </div>`;
        infoPanel.classList.add('viz-info-open');
    }

    function clearSelection() {
        nodeMeshes.forEach(m => m.material.color.set(colors.node));
        hoveredIdx = -1;
        infoPanel.classList.remove('viz-info-open');
    }

    // ── Theme change observer ─────────────────────────────────────────────────
    const themeObserver = new MutationObserver(() => {
        if (!scene) return;
        colors = getThemeColors();
        scene.background.set(colors.bg);
        nodeMeshes.forEach((m, i) => {
            m.material.color.set(i === hoveredIdx ? colors.nodeHov : colors.node);
        });
        particleGroups.forEach(({ particles }) => {
            particles.forEach(p => p.material.color.set(colors.particle));
        });
    });

    // ── Dispose ───────────────────────────────────────────────────────────────
    function dispose() {
        if (animId) { cancelAnimationFrame(animId); animId = null; }
        if (renderer) {
            renderer.dispose();
            renderer = null;
        }
        scene = null;
        camera = null;
        nodeMeshes = [];
        particleGroups = [];
    }

    // ── Lazy init via IntersectionObserver ────────────────────────────────────
    let initialized = false;

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !initialized) {
                // Check if Three.js is loaded
                if (typeof THREE === 'undefined') {
                    container.querySelector('.viz-loading')?.remove();
                    const err = document.createElement('p');
                    err.className = 'viz-fallback-msg';
                    err.textContent = 'Visualization requires JavaScript.';
                    container.insertBefore(err, canvas);
                    return;
                }
                initialized = true;
                container.querySelector('.viz-loading')?.remove();
                canvas.style.display = 'block';
                buildScene();
                animate(0);
                themeObserver.observe(document.documentElement, {
                    attributes: true, attributeFilter: ['data-theme']
                });
                window.addEventListener('resize', onResize);
            }
        });
    }, { threshold: 0.1 });

    // Hide canvas initially — shown when IO fires
    canvas.style.display = 'none';

    // Show loading state until IO fires
    const loading = document.createElement('div');
    loading.className = 'viz-loading';
    loading.setAttribute('aria-hidden', 'true');
    loading.textContent = '[ Loading visualization… ]';
    container.insertBefore(loading, canvas);

    io.observe(container);

    // Pointer / touch events
    canvas.addEventListener('pointerdown', handlePointer);

})();
