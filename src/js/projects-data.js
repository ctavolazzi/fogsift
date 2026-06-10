/* ============================================
   PROJECTS DATA
   Shared source of truth for project previews
   ============================================ */

window.PROJECTS_DATA = [
    {
        id: 'tmgotcha',
        title: 'TMGotcha',
        category: 'Hardware + Software',
        status: 'Active',
        time: 'Featured build',
        image: 'images/portfolio/TMGotcha-Banner-Image.jpg',
        summary: 'A modern virtual pet platform with modular hardware cubes, collectible editions, and a Pepper\'s Ghost holographic effect.',
        deepDive: 'This project combines product design, embedded software, and rapid prototyping. The current focus is moving from proof-of-concept hardware into repeatable production architecture.',
        highlights: ['Custom hardware', 'Embedded software', 'Optics + display', 'Product design']
    },
    {
        id: 'waft',
        title: 'WAFT',
        category: 'AI Framework',
        status: 'Active',
        time: 'Open source',
        image: 'images/portfolio/WAFT_Profile_Default.png',
        summary: 'An evolutionary agent framework where agents generate variants, run fitness evaluation, and keep lineage history.',
        deepDive: 'WAFT started as a weekend experiment and became a full framework. Current development focuses on telemetry, fitness APIs, and tighter mutation/selection loops.',
        highlights: ['Python', 'AI agents', 'Evolutionary systems', 'Open source']
    },
    {
        id: 'fogsift-v02',
        title: 'FogSift v0.2',
        category: 'Site',
        status: 'Active',
        time: 'In progress',
        image: 'assets/logo.png',
        summary: 'The public-facing FogSift site, continuously refined while shipping live.',
        deepDive: 'The site doubles as product, portfolio, and experimentation surface. Work focuses on clarity, technical debt cleanup, and conversion-path improvements.',
        highlights: ['Vanilla stack', 'Build tooling', 'Design system', 'Consulting UX']
    },
    {
        id: 'theme-switcher',
        title: 'Theme Switcher',
        category: 'Software',
        status: 'Done',
        time: '~40 min',
        image: 'assets/logo-mono.png',
        summary: 'Theme system with 11 styles, FOUC prevention, and cross-tab sync.',
        deepDive: 'Built to make style variation reliable, not decorative. It handles persistent preferences and avoids wrong-theme flash during first render.',
        highlights: ['CSS variables', 'localStorage', 'Cross-tab sync', 'FOUC prevention']
    },
    {
        id: 'webhook-test-harness',
        title: 'Webhook Test Harness',
        category: 'Software',
        status: 'Done',
        time: '~35 min',
        image: 'assets/logo-mono.png',
        summary: 'A minimal endpoint for validating Ko-fi webhook payloads before wiring real queue logic.',
        deepDive: 'This was built to validate contract assumptions first. It captured live payloads and response behavior so queue automation could be implemented safely.',
        highlights: ['Node.js', 'Ko-fi', 'Webhooks', 'Contract-first']
    },
    {
        id: 'build-time-search-index',
        title: 'Build-Time Search Index',
        category: 'Software',
        status: 'Done',
        time: '~55 min',
        image: 'assets/logo-mono.png',
        summary: 'A compile-time full-text index generator for fast static search.',
        deepDive: 'Instead of runtime crawling, content is indexed at build and shipped as flat JSON. This keeps the front-end lean while preserving useful search quality.',
        highlights: ['Node.js', 'Build step', 'Search ranking', 'Static JSON']
    },
    {
        id: 'led-ring-clock',
        title: 'LED Ring Clock',
        category: 'Hardware',
        status: 'Done',
        time: '~30 min',
        image: 'assets/logo-mono.png',
        summary: 'ESP32 + NeoPixel clock prototype with hour arc and minute indicator.',
        deepDive: 'A quick hardware build used to validate display clarity and firmware simplicity under tight constraints.',
        highlights: ['ESP32', 'NeoPixel', 'C++', 'Rapid prototype']
    },
    {
        id: 'door-alert-sensor',
        title: 'Door Alert Sensor',
        category: 'Hardware',
        status: 'Done',
        time: '~45 min',
        image: 'assets/logo-mono.png',
        summary: 'Reed switch + Raspberry Pi + notification pipeline for real-time door alerts.',
        deepDive: 'The goal was practical reliability with almost no maintenance. The result became a stable background service that required minimal intervention.',
        highlights: ['Raspberry Pi', 'Python', 'GPIO', 'Systemd']
    },
    {
        id: '3d-printed-phone-stand',
        title: '3D-Printed Phone Stand',
        category: 'Hardware',
        status: 'Done',
        time: '~50 min',
        image: 'assets/logo-mono.png',
        summary: 'Parameterized OpenSCAD stand designed and printed in a single session.',
        deepDive: 'An intentional speed project to validate fit, angle, and print workflow from concept to physical object.',
        highlights: ['OpenSCAD', '3D print', 'Parametric design', 'PLA']
    },
    {
        id: 'tmgotcha-first-sketch',
        title: 'TMGotcha First Sketch',
        category: 'Design',
        status: 'Done',
        time: '~45 min',
        image: 'images/portfolio/TMGotcha-Cube-Concept-Art.jpg',
        summary: 'Initial concept sketch that locked the modular cube direction.',
        deepDive: 'This sketch established practical constraints early: optics angle, display space, and modular structure. It became the anchor for later iterations.',
        highlights: ['Industrial design', 'Concept work', 'Optics planning', 'System framing']
    },
    {
        id: 'fogsift-brand-brief',
        title: 'FogSift Brand Brief',
        category: 'Strategy',
        status: 'Done',
        time: '~1 hr',
        image: 'assets/logo.png',
        summary: 'Single-session articulation of name, positioning, and messaging direction.',
        deepDive: 'The brief set durable language and narrative anchors that still drive page copy and service framing.',
        highlights: ['Brand strategy', 'Positioning', 'Tagline', 'Messaging']
    },
    {
        id: 'waft-first-working-build',
        title: 'WAFT — First Working Build',
        category: 'Software',
        status: 'Active',
        time: '2 days',
        image: 'images/portfolio/WAFT_Profile_Default.png',
        summary: 'Weekend proof that self-modifying agents could generate and evaluate variants end-to-end.',
        deepDive: 'This established the minimum viable evolution loop and proved the concept was not just theoretical.',
        highlights: ['Python', 'Agent loops', 'Fitness testing', 'Selection logic']
    },
    {
        id: 'wiki-build-pipeline',
        title: 'Wiki Build Pipeline',
        category: 'Software',
        status: 'Done',
        time: '2 days',
        image: 'assets/logo-mono.png',
        summary: 'Markdown-to-HTML pipeline with nav generation and compile-time index.',
        deepDive: 'Built to keep docs lightweight and maintainable without adding runtime framework complexity.',
        highlights: ['Node.js', 'marked', 'Nav generation', 'Search indexing']
    },
    {
        id: 'fogsift-queue-system',
        title: 'FogSift Queue System',
        category: 'Software',
        status: 'Done',
        time: 'Weekend',
        image: 'assets/logo-mono.png',
        summary: 'Payment-to-queue flow using Ko-fi webhooks, Cloudflare Worker, and KV.',
        deepDive: 'Designed as a practical operations pipeline: simple, observable, and production-safe without heavy infrastructure.',
        highlights: ['Cloudflare Workers', 'KV', 'Webhooks', 'Automation']
    },
    {
        id: 'tmgotcha-prototype-v01',
        title: 'TMGotcha Prototype v0.1',
        category: 'Hardware',
        status: 'Done',
        time: '2 days',
        image: 'images/portfolio/TMGotcha-Hardware-Concept-Art.jpg',
        summary: 'First physical prototype to validate form factor before deeper CAD investment.',
        deepDive: 'The objective was confidence, not polish. It proved the desk footprint, display behavior, and interaction constraints.',
        highlights: ['Prototype', 'Foam core', 'Embedded display', 'Rapid validation']
    },
    {
        id: 'peppers-ghost-rig',
        title: 'Pepper\'s Ghost Rig',
        category: 'Hardware',
        status: 'Done',
        time: '2 days',
        image: 'images/portfolio/TMGotcha-Cube-Pepper-Ghost-Concept-Art.jpeg',
        summary: 'Acrylic reflection rig to tune holographic effect quality and brightness tradeoffs.',
        deepDive: 'This focused on optical tuning and repeatability to make holographic presentation feasible in compact hardware.',
        highlights: ['Acrylic', 'Laser cutting', 'Optics', 'Display tuning']
    },
    {
        id: 'esp32-sensor-array',
        title: 'ESP32 Sensor Array',
        category: 'Hardware',
        status: 'Done',
        time: 'Weekend',
        image: 'assets/logo-mono.png',
        summary: 'Reusable sensor breakout with MQTT streaming used as base in later builds.',
        deepDive: 'A foundation-first hardware platform intended to shorten setup time for follow-on experiments.',
        highlights: ['ESP32', 'MQTT', 'Sensors', 'Reusable platform']
    },
    {
        id: 'fogsift-design-system',
        title: 'FogSift Design System',
        category: 'Design',
        status: 'Done',
        time: '2 days',
        image: 'assets/logo-patch.png',
        summary: 'Complete visual language with tokens, type scale, component rules, and theme architecture.',
        deepDive: 'Built as a production constraint system so design choices stay consistent while development remains fast.',
        highlights: ['CSS tokens', 'Themes', 'Type system', 'Component rules']
    },
    {
        id: 'offers-architecture',
        title: 'Offers Architecture',
        category: 'Strategy',
        status: 'Done',
        time: '2 days',
        image: 'assets/logo.png',
        summary: 'Service structure, queue mechanics, and pricing model for FogSift consulting.',
        deepDive: 'This turned abstract consulting intent into an operational model with clear entry points and execution cadence.',
        highlights: ['Pricing', 'Service design', 'Queue logic', 'Delivery workflow']
    }
];
