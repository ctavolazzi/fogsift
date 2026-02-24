/* ============================================
   SVG COMPONENTS — FogSift Interactive SVG
   Scroll-triggered animations, rotary encoder interaction,
   and typewriter word-change hook.
   ============================================ */

const SvgComponents = {
    _observer: null,
    _encoder: null,

    init() {
        this.initScrollAnimations();
        this.initEncoder();
        this.initTypewriterHook();
        this.initStatDonuts();
    },

    // ── SCROLL ANIMATIONS ──────────────────────────────────────────────────
    // Uses IntersectionObserver to add .is-visible to .svg-step and .svg-stat
    // elements when they enter the viewport. Triggers CSS transitions.

    initScrollAnimations() {
        if (!('IntersectionObserver' in window)) {
            // Graceful degradation: show all elements immediately
            document.querySelectorAll('.svg-step, .svg-stat').forEach(el => {
                el.classList.add('is-visible');
            });
            return;
        }

        this._observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    this._observer.unobserve(entry.target); // animate once
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '0px 0px -40px 0px'
        });

        document.querySelectorAll('.svg-step, .svg-stat').forEach(el => {
            this._observer.observe(el);
        });
    },

    // ── STAT DONUTS ────────────────────────────────────────────────────────
    // Reads data-value and data-max from .svg-stat elements and calculates
    // the correct stroke-dashoffset for each donut segment.
    // Circumference of r=50: 2 * PI * 50 = 314.16

    initStatDonuts() {
        const CIRCUMFERENCE = 314;

        document.querySelectorAll('.svg-stat').forEach(el => {
            const value = parseFloat(el.dataset.value || 0);
            const max   = parseFloat(el.dataset.max || 100);
            const pct   = Math.min(value / max, 1);
            const target = CIRCUMFERENCE * (1 - pct);

            const segment = el.querySelector('.svg-donut__segment');
            if (segment) {
                // Store the target as a CSS custom property for the transition
                segment.style.setProperty('--donut-target', target);
                // Start at full offset (hidden)
                segment.style.strokeDashoffset = CIRCUMFERENCE;
            }
        });
    },

    // ── ROTARY ENCODER ─────────────────────────────────────────────────────
    // Maps pointer position to an angle around the encoder SVG center.
    // Angle range: -135° to +135° (270° total arc) maps to three price tiers.
    // Uses Pointer Events API for unified mouse/touch handling.

    initEncoder() {
        const encoder = document.getElementById('svg-encoder');
        if (!encoder) return;

        const knob  = encoder.querySelector('.svg-encoder__knob-group');
        const arc   = encoder.querySelector('.svg-encoder__arc');
        const label = document.getElementById('svg-encoder-value');
        const desc  = document.getElementById('svg-encoder-desc');
        if (!knob || !arc || !label || !desc) return;

        const TIERS = [
            { angle: -135, value: '$5',  desc: 'Field Guide PDF',           arc: 0    },
            { angle:    0, value: '$20', desc: 'Report + Video Response',    arc: 251  },
            { angle:  135, value: '$500',desc: 'Deep Dive Engagement',       arc: 503  },
        ];
        const CIRCUMFERENCE = 503; // 2*PI*80

        let active      = false;
        let currentTier = 1; // start at $20
        let currentAngle = 0;

        const getAngle = (e) => {
            const rect  = encoder.getBoundingClientRect();
            const cx    = rect.left + rect.width  / 2;
            const cy    = rect.top  + rect.height / 2;
            const ex    = e.clientX;
            const ey    = e.clientY;
            let   ang   = Math.atan2(ey - cy, ex - cx) * (180 / Math.PI) + 90;
            if (ang > 180) ang -= 360;
            return ang;
        };

        const snapToTier = (ang) => {
            // Find nearest tier
            let best = 0;
            let bestDist = Infinity;
            TIERS.forEach((t, i) => {
                const dist = Math.abs(ang - t.angle);
                if (dist < bestDist) { bestDist = dist; best = i; }
            });
            return best;
        };

        const applyTier = (tierIndex) => {
            if (tierIndex === currentTier) return;
            currentTier = tierIndex;
            const t = TIERS[tierIndex];
            label.textContent = t.value;
            desc.textContent  = t.desc;
            arc.style.strokeDashoffset = CIRCUMFERENCE - t.arc;
            knob.style.transform = `rotate(${t.angle}deg)`;
        };

        // Initialize to middle tier ($20)
        applyTier(1);
        knob.style.transform = 'rotate(0deg)';

        encoder.addEventListener('pointerdown', (e) => {
            active = true;
            encoder.setPointerCapture(e.pointerId);
            e.preventDefault();
        });

        encoder.addEventListener('pointermove', (e) => {
            if (!active) return;
            const ang    = getAngle(e);
            const clamped = Math.max(-135, Math.min(135, ang));
            currentAngle = clamped;
            knob.style.transform = `rotate(${clamped}deg)`;
            const tier = snapToTier(clamped);
            applyTier(tier);
        });

        encoder.addEventListener('pointerup', () => { active = false; });
        encoder.addEventListener('pointercancel', () => { active = false; });

        this._encoder = { applyTier, TIERS };
    },

    // ── TYPEWRITER HOOK ────────────────────────────────────────────────────
    // Watches the rotating-highlight span via MutationObserver. Each time
    // the word text changes (driven by main.js initRotatingWords), we
    // re-trigger the clip-path reveal animation by toggling the class.

    initTypewriterHook() {
        const target = document.querySelector('.rotating-highlight span[data-words]');
        if (!target) return;

        // CSS animation must be on the element for us to retrigger it
        target.classList.add('svg-typewriter-active');

        const retrigger = () => {
            target.classList.remove('svg-typewriter-active');
            // Force reflow so removing the class takes effect before re-adding
            void target.offsetWidth;
            target.classList.add('svg-typewriter-active');
        };

        const observer = new MutationObserver((mutations) => {
            mutations.forEach(m => {
                if (m.type === 'characterData' || m.type === 'childList') {
                    retrigger();
                }
            });
        });

        observer.observe(target, {
            characterData: true,
            childList: true,
            subtree: true
        });
    },

    destroy() {
        if (this._observer) {
            this._observer.disconnect();
            this._observer = null;
        }
    }
};
