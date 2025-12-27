/* ============================================
   FOGSIFT SECRET SLEEP MODE
   Easter egg screensaver - 70s/80s retro style
   Triggers after 5 min page time + 30s idle

   NOW WITH ADORABLE SLEEPING ELEMENTS!
   - Elements lie down and breathe
   - ZZZs float up from sleeping elements
   - Night caps and snore bubbles
   - Startled wake-up when clicked!
   ============================================ */

const SleepMode = {
    // Configuration
    PAGE_TIME_REQUIRED: 5 * 60 * 1000,  // 5 minutes in ms
    IDLE_TIME_REQUIRED: 30 * 1000,       // 30 seconds in ms
    CHECK_INTERVAL: 5000,                 // Check every 5 seconds

    // State
    pageLoadTime: Date.now(),
    lastActivityTime: Date.now(),
    isAsleep: false,
    checkTimer: null,
    overlay: null,
    canvas: null,
    ctx: null,
    animationFrame: null,
    toasters: [],
    zs: [],
    sleepyElements: [],
    decorations: [],
    breathingTimeout: null,
    resizeHandler: null,
    wakeHandler: null,

    // Element selectors for sleeping
    SLEEPY_SELECTORS: {
        buttons: '.cta-button, .pricing-cta, .theme-toggle, .menu-toggle',
        cards: '.process-step, .pricing-card, .about-card, .hero-badge, .wiki-category-card',
        text: '.headline, .subhead, .section-label, .about-name, main h1, main h2, main h3',
        nav: '.menu-link',
        logo: '.brand-logo'
    },

    // Check for reduced motion preference
    prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    init() {
        this.pageLoadTime = Date.now();
        this.lastActivityTime = Date.now();
        this.bindActivityListeners();
        this.startChecking();

        // Secret console hint
        console.log(
            '%c 💤 Psst... stay a while and something might happen... ',
            'background: #4a2c2a; color: #e07b3c; padding: 5px; font-family: monospace; font-size: 10px;'
        );
    },

    bindActivityListeners() {
        const resetActivity = () => {
            this.lastActivityTime = Date.now();
        };

        document.addEventListener('mousemove', resetActivity, { passive: true });
        document.addEventListener('keydown', resetActivity, { passive: true });
        document.addEventListener('scroll', resetActivity, { passive: true });
        document.addEventListener('touchstart', resetActivity, { passive: true });
    },

    startChecking() {
        this.checkTimer = setInterval(() => this.checkSleepConditions(), this.CHECK_INTERVAL);
    },

    checkSleepConditions() {
        if (this.isAsleep) return;

        const now = Date.now();
        const pageTimeElapsed = now - this.pageLoadTime;
        const idleTimeElapsed = now - this.lastActivityTime;

        if (pageTimeElapsed >= this.PAGE_TIME_REQUIRED && idleTimeElapsed >= this.IDLE_TIME_REQUIRED) {
            this.enterSleepMode();
        }
    },

    enterSleepMode() {
        if (this.isAsleep) return;
        this.isAsleep = true;

        // Console easter egg
        console.log(
            '%c 😴 FOGSIFT is taking a nap... click anywhere to wake up! ',
            'background: #1a1412; color: #fb923c; padding: 10px; font-family: monospace; font-weight: bold;'
        );

        // Add body class
        document.body.classList.add('page-sleeping');

        // For reduced motion users, skip element animations
        if (!this.prefersReducedMotion()) {
            this.putElementsToSleep();
        }

        // Create overlay (after elements start sleeping for better effect)
        setTimeout(() => {
            this.createOverlay();

            // Skip canvas animations for reduced motion
            if (!this.prefersReducedMotion()) {
                this.initToasters();
                this.initZs();
                this.startAnimation();
            }

            // Bind wake-up handlers (both click and touch)
            this.wakeHandler = () => this.wakeUp();
            this.overlay.addEventListener('click', this.wakeHandler);
            this.overlay.addEventListener('touchend', this.wakeHandler, { passive: true });
        }, 300);
    },

    putElementsToSleep() {
        this.sleepyElements = [];
        this.decorations = [];

        // Put buttons to sleep
        document.querySelectorAll(this.SLEEPY_SELECTORS.buttons).forEach((el, i) => {
            setTimeout(() => {
                this.prepareElement(el);
                el.classList.add('sleepy');
                this.sleepyElements.push({ element: el, type: 'button' });

                // Add zzz to some buttons
                if (i % 2 === 0) {
                    this.addZzzToElement(el);
                }
            }, i * 100);
        });

        // Put cards to sleep
        document.querySelectorAll(this.SLEEPY_SELECTORS.cards).forEach((el, i) => {
            setTimeout(() => {
                this.prepareElement(el);
                el.classList.add('sleepy');
                this.sleepyElements.push({ element: el, type: 'card' });

                // Add sleep cap to first few cards
                if (i < 3) {
                    this.addSleepCap(el);
                }

                // Add snore bubble to one card
                if (i === 1) {
                    this.addSnoreBubble(el);
                }

                // Add zzz
                this.addZzzToElement(el);
            }, 200 + i * 150);
        });

        // Put text to sleep
        document.querySelectorAll(this.SLEEPY_SELECTORS.text).forEach((el, i) => {
            setTimeout(() => {
                el.classList.add('sleepy');
                this.sleepyElements.push({ element: el, type: 'text' });
            }, 100 + i * 80);
        });

        // Put nav links to sleep
        document.querySelectorAll(this.SLEEPY_SELECTORS.nav).forEach((el, i) => {
            setTimeout(() => {
                el.classList.add('sleepy');
                this.sleepyElements.push({ element: el, type: 'nav' });
            }, i * 50);
        });

        // Put logo to sleep
        const logo = document.querySelector(this.SLEEPY_SELECTORS.logo);
        if (logo) {
            setTimeout(() => {
                this.prepareElement(logo);
                logo.classList.add('sleepy');
                this.sleepyElements.push({ element: logo, type: 'logo' });
                this.addZzzToElement(logo);
                this.addSleepCap(logo);
            }, 100);
        }

        // Start breathing after initial sleep animation
        this.breathingTimeout = setTimeout(() => {
            this.startBreathing();
        }, 1500);
    },

    // Prepare element for animation (save original styles)
    prepareElement(el) {
        const computed = window.getComputedStyle(el);
        // Save original position if not already relative/absolute
        if (computed.position === 'static') {
            el.dataset.sleepOriginalPosition = 'static';
            el.style.position = 'relative';
        }
    },

    // Restore element to original state
    restoreElement(el) {
        if (el.dataset.sleepOriginalPosition === 'static') {
            el.style.position = '';
            delete el.dataset.sleepOriginalPosition;
        }
    },

    startBreathing() {
        if (!this.isAsleep) return;
        this.sleepyElements.forEach(({ element }) => {
            element.classList.remove('sleepy');
            element.classList.add('sleepy-breathing');
        });
    },

    addZzzToElement(element) {
        const container = document.createElement('div');
        container.className = 'element-zzz-container';
        container.style.cssText = 'position: absolute; top: -10px; right: -5px; pointer-events: none;';

        for (let i = 0; i < 3; i++) {
            const z = document.createElement('span');
            z.className = 'element-zzz';
            z.textContent = 'z';
            z.style.animationDelay = `${i * 1}s`;
            container.appendChild(z);
        }

        element.appendChild(container);
        this.decorations.push(container);
    },

    addSleepCap(element) {
        const cap = document.createElement('span');
        cap.className = 'sleep-cap';
        cap.textContent = '🧢';
        cap.style.cssText = 'position: absolute; top: -20px; right: -15px; font-size: 1.5rem; transform: rotate(15deg); z-index: 50;';
        element.appendChild(cap);
        this.decorations.push(cap);
    },

    addSnoreBubble(element) {
        const bubble = document.createElement('div');
        bubble.className = 'snore-bubble';
        bubble.textContent = 'zzz...';
        element.appendChild(bubble);
        this.decorations.push(bubble);
    },

    createOverlay() {
        // Create main overlay container
        this.overlay = document.createElement('div');
        this.overlay.id = 'sleep-overlay';
        this.overlay.innerHTML = `
            <div class="sleep-scanlines"></div>
            <canvas id="sleep-canvas"></canvas>
            <div class="sleep-zs-container"></div>
            <div class="sleep-message">
                <span class="sleep-icon">💤</span>
                <span class="sleep-text">tap to wake</span>
            </div>
        `;

        document.body.appendChild(this.overlay);

        // Setup canvas
        this.canvas = document.getElementById('sleep-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();

        // Store handler reference for cleanup
        this.resizeHandler = () => this.resizeCanvas();
        window.addEventListener('resize', this.resizeHandler, { passive: true });

        // Trigger animation after brief delay for CSS transition
        requestAnimationFrame(() => {
            this.overlay.classList.add('active');
        });
    },

    resizeCanvas() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    // Pixel art toaster drawing (8-bit style)
    drawToaster(x, y, wingFrame) {
        const ctx = this.ctx;
        const scale = 3;
        const colors = {
            body: '#c4956a',      // Warm tan
            dark: '#5c3d2e',      // Dark brown
            slot: '#4a2c2a',      // Chocolate
            wing: '#f5f0e6',      // Cream
            wingDark: '#d4c4a8',  // Darker cream
            highlight: '#e07b3c', // Burnt orange glow
        };

        ctx.save();
        ctx.translate(x, y);

        // Toaster body (chunky pixel art style)
        ctx.fillStyle = colors.body;
        ctx.fillRect(0, 4 * scale, 12 * scale, 8 * scale);

        // Darker bottom
        ctx.fillStyle = colors.dark;
        ctx.fillRect(0, 10 * scale, 12 * scale, 2 * scale);

        // Toast slots (2 slots)
        ctx.fillStyle = colors.slot;
        ctx.fillRect(2 * scale, 5 * scale, 3 * scale, 4 * scale);
        ctx.fillRect(7 * scale, 5 * scale, 3 * scale, 4 * scale);

        // Glowing toast peeking out
        ctx.fillStyle = colors.highlight;
        ctx.fillRect(2 * scale, 3 * scale, 3 * scale, 2 * scale);
        ctx.fillRect(7 * scale, 3 * scale, 3 * scale, 2 * scale);

        // Wings (animated)
        const wingOffset = wingFrame % 2 === 0 ? 0 : -1 * scale;

        ctx.fillStyle = colors.wing;
        // Left wing
        ctx.fillRect(-4 * scale, (2 + wingOffset / scale) * scale, 4 * scale, 6 * scale);
        ctx.fillStyle = colors.wingDark;
        ctx.fillRect(-3 * scale, (3 + wingOffset / scale) * scale, 2 * scale, 4 * scale);

        // Right wing
        ctx.fillStyle = colors.wing;
        ctx.fillRect(12 * scale, (2 + wingOffset / scale) * scale, 4 * scale, 6 * scale);
        ctx.fillStyle = colors.wingDark;
        ctx.fillRect(13 * scale, (3 + wingOffset / scale) * scale, 2 * scale, 4 * scale);

        ctx.restore();
    },

    initToasters() {
        this.toasters = [];
        // Fewer toasters on mobile for performance
        const isMobile = window.innerWidth < 768;
        const count = isMobile ? 2 : Math.floor(window.innerWidth / 200) + 2;

        for (let i = 0; i < count; i++) {
            this.toasters.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                speed: 1 + Math.random() * 1.5,
                wingFrame: Math.floor(Math.random() * 10),
                wingSpeed: 5 + Math.floor(Math.random() * 5),
            });
        }
    },

    initZs() {
        const container = this.overlay.querySelector('.sleep-zs-container');
        if (!container) return;

        const sizes = ['small', 'medium', 'large'];
        // Fewer Zs on mobile
        const count = window.innerWidth < 768 ? 4 : 8;

        for (let i = 0; i < count; i++) {
            const z = document.createElement('div');
            z.className = `sleep-z ${sizes[i % 3]}`;
            z.textContent = 'Z';
            z.style.left = `${10 + Math.random() * 80}%`;
            z.style.animationDelay = `${Math.random() * 4}s`;
            z.style.animationDuration = `${4 + Math.random() * 3}s`;
            container.appendChild(z);
        }
    },

    startAnimation() {
        let frameCount = 0;

        const animate = () => {
            if (!this.isAsleep || !this.ctx) return;

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Update and draw toasters
            this.toasters.forEach(toaster => {
                // Move diagonally (classic screensaver style)
                toaster.x += toaster.speed;
                toaster.y -= toaster.speed * 0.6;

                // Wrap around screen
                if (toaster.x > this.canvas.width + 60) {
                    toaster.x = -60;
                    toaster.y = Math.random() * this.canvas.height;
                }
                if (toaster.y < -60) {
                    toaster.y = this.canvas.height + 60;
                    toaster.x = Math.random() * this.canvas.width;
                }

                // Animate wings
                if (frameCount % toaster.wingSpeed === 0) {
                    toaster.wingFrame++;
                }

                this.drawToaster(toaster.x, toaster.y, toaster.wingFrame);
            });

            frameCount++;
            this.animationFrame = requestAnimationFrame(animate);
        };

        animate();
    },

    wakeUp() {
        if (!this.isAsleep) return;

        // TV turn-on flash effect (skip for reduced motion)
        if (!this.prefersReducedMotion()) {
            this.overlay.classList.add('waking');
            this.startleElements();
        }

        setTimeout(() => {
            this.isAsleep = false;
            this.lastActivityTime = Date.now();

            // Cancel breathing timeout if still pending
            if (this.breathingTimeout) {
                clearTimeout(this.breathingTimeout);
                this.breathingTimeout = null;
            }

            // Cancel animation
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
                this.animationFrame = null;
            }

            // Remove resize listener
            if (this.resizeHandler) {
                window.removeEventListener('resize', this.resizeHandler);
                this.resizeHandler = null;
            }

            // Remove body class and add waking
            document.body.classList.remove('page-sleeping');
            document.body.classList.add('page-waking');

            // Remove overlay with fade
            if (this.overlay) {
                this.overlay.classList.remove('active');
                this.overlay.classList.add('fading');
            }

            setTimeout(() => {
                if (this.overlay && this.overlay.parentNode) {
                    this.overlay.parentNode.removeChild(this.overlay);
                }
                this.overlay = null;
                this.canvas = null;
                this.ctx = null;
                this.wakeHandler = null;

                // Clean up decorations
                this.cleanupDecorations();

                // Remove waking class after animations complete
                setTimeout(() => {
                    document.body.classList.remove('page-waking');
                    this.cleanupElementClasses();
                }, 700);

            }, 500);

            // Console message
            console.log(
                '%c ☀️ Good morning! FOGSIFT is awake and ready. ',
                'background: #f5f0e6; color: #4a2c2a; padding: 10px; font-family: monospace; font-weight: bold;'
            );
        }, this.prefersReducedMotion() ? 0 : 150);
    },

    startleElements() {
        // Add startled class to all sleeping elements
        this.sleepyElements.forEach(({ element, type }, i) => {
            // Stagger the startle effect slightly
            setTimeout(() => {
                element.classList.remove('sleepy', 'sleepy-breathing');
                element.classList.add('startled');

                // Add exclamation mark to some elements
                if (type === 'card' && i < 3) {
                    this.addStartledMark(element);
                }
                if (type === 'button' && i === 0) {
                    this.addStartledMark(element);
                }
            }, i * 30);
        });
    },

    addStartledMark(element) {
        const mark = document.createElement('span');
        mark.className = 'startled-mark';
        mark.textContent = '!';
        mark.style.cssText = 'position: absolute; top: -25px; right: -10px;';
        element.appendChild(mark);
        this.decorations.push(mark);

        // Remove after animation
        setTimeout(() => {
            if (mark.parentNode) {
                mark.parentNode.removeChild(mark);
            }
        }, 600);
    },

    cleanupDecorations() {
        this.decorations.forEach(dec => {
            if (dec && dec.parentNode) {
                dec.parentNode.removeChild(dec);
            }
        });
        this.decorations = [];
    },

    cleanupElementClasses() {
        // Remove all sleep-related classes and restore original styles
        this.sleepyElements.forEach(({ element }) => {
            element.classList.remove('sleepy', 'sleepy-breathing', 'startled');
            this.restoreElement(element);
        });
        this.sleepyElements = [];
    }
};

// Make available globally
window.SleepMode = SleepMode;

// Dev helper: Type SleepMode.test() in console to trigger immediately
SleepMode.test = function() {
    console.log('%c 🧪 Testing sleep mode... ', 'background: #4a2c2a; color: #fb923c; padding: 5px;');
    this.enterSleepMode();
};

// Also available as window.sleep() for convenience
window.sleep = () => SleepMode.test();
