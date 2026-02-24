(function () {
    // Phrases for each panel (TL, TR, BL, BR)
    var PHRASES = [
        // TL — operations / physical systems
        [['⚙️','Supply Chain'],['🏭','Operations'],['⚡','Bottlenecks'],['🔗','Constraints'],['🚚','Logistics']],
        // TR — data / intelligence
        [['📊','Data & Strategy'],['🔍','Pattern Finding'],['📡','Signal vs Noise'],['🧮','Root Cause'],['📈','Growth Strategy']],
        // BL — food / environment
        [['🌾','Food Security'],['🤖','Automation'],['🌱','Sustainability'],['🏗️','Infrastructure'],['♻️','Feedback Loops']],
        // BR — research / thinking
        [['💡','First Principles'],['🧠','Systems Thinking'],['⚖️','Risk Assessment'],['🔬','Research'],['🎯','Decision Making']],
    ];

    // + rotation order: TL(0) → TR(1) → BR(3) → BL(2)
    var PLUS_ORDER = [0, 1, 3, 2];
    var STEP_MS    = 260;   // delay between each panel in the cycle
    var FOLD_MS    = 220;   // must match CSS animation duration
    var CYCLE_MS   = 3200;  // full rotation pause before repeating

    var indices = [0, 0, 0, 0];
    var panels  = [];
    var running = false;

    function flipPanel(panelEl, phraseArr, phraseIdx) {
        // Phase 1: fold away
        panelEl.classList.add('is-folding');

        setTimeout(function () {
            // Swap content at the midpoint
            panelEl.classList.remove('is-folding');
            var icon = panelEl.querySelector('.hero-panel__icon');
            var text = panelEl.querySelector('.hero-panel__text');
            if (icon) icon.textContent = phraseArr[phraseIdx][0];
            if (text) text.textContent = phraseArr[phraseIdx][1];

            // Phase 2: unfold in
            panelEl.classList.add('is-unfolding');
            setTimeout(function () {
                panelEl.classList.remove('is-unfolding');
            }, FOLD_MS);
        }, FOLD_MS);
    }

    function runCycle() {
        PLUS_ORDER.forEach(function (panelIdx, step) {
            setTimeout(function () {
                indices[panelIdx] = (indices[panelIdx] + 1) % PHRASES[panelIdx].length;
                flipPanel(panels[panelIdx], PHRASES[panelIdx], indices[panelIdx]);
            }, step * STEP_MS);
        });
    }

    function init() {
        if (running) return;
        var grid = document.querySelector('.hero-grid');
        if (!grid) return;
        panels = Array.from(grid.querySelectorAll('.hero-panel'));
        if (panels.length < 4) return;
        running = true;
        // First cycle after a short pause so the page settles
        setTimeout(function loop() {
            runCycle();
            setTimeout(loop, CYCLE_MS);
        }, 1800);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
