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
    // ============================================
    // CONFIGURATION CONSTANTS
    // ============================================

    // Timing thresholds (milliseconds)
    PAGE_TIME_REQUIRED: 5 * 60 * 1000,   // 5 minutes before sleep eligible
    IDLE_TIME_REQUIRED: 30 * 1000,        // 30 seconds idle to trigger sleep
    CHECK_INTERVAL: 5000,                  // Check sleep conditions every 5s
    DEEP_SLEEP_DELAY: 3000,                // 3 seconds before entering ultra-lightweight mode

    // Animation timing (milliseconds)
    TIMING: {
        OVERLAY_DELAY: 300,                // Delay before creating overlay
        BREATHING_START: 1500,             // Delay before breathing animation
        WAKE_FLASH_DURATION: 150,          // TV flash effect duration
        OVERLAY_FADE: 500,                 // Overlay fade out duration
        ELEMENT_CLEANUP_DELAY: 700,        // Delay for element class cleanup
        STAGGER_BUTTONS: 100,              // Stagger delay between buttons
        STAGGER_CARDS: 150,                // Stagger delay between cards
        STAGGER_TEXT: 80,                  // Stagger delay between text elements
        STAGGER_NAV: 50,                   // Stagger delay between nav items
        STAGGER_STARTLE: 30,               // Stagger delay for startle effect
        STARTLED_MARK_DURATION: 600,       // Duration of exclamation mark
    },

    // Display settings
    DISPLAY: {
        MOBILE_BREAKPOINT: 768,            // Mobile width breakpoint
        TOASTERS_PER_200PX: 1,             // Toasters per 200px width + base
        TOASTERS_MOBILE: 2,                // Toaster count on mobile
        Z_COUNT_DESKTOP: 8,                // Floating Z count on desktop
        Z_COUNT_MOBILE: 4,                 // Floating Z count on mobile
        ZS_PER_ELEMENT: 3,                 // ZZZ count per sleeping element
    },

    // Canvas animation settings
    CANVAS: {
        TOASTER_MIN_SPEED: 1,              // Minimum toaster speed
        TOASTER_SPEED_RANGE: 1.5,          // Additional random speed
        WING_SPEED_MIN: 5,                 // Minimum wing flap speed
        WING_SPEED_RANGE: 5,               // Additional random wing speed
        WRAP_MARGIN: 60,                   // Screen wrap margin for toasters
        PIXEL_SCALE: 3,                    // Pixel art scale factor
    },

    // ============================================
    // STATE
    // ============================================
    pageLoadTime: Date.now(),
    lastActivityTime: Date.now(),
    isAsleep: false,
    isDeepSleep: false,              // Ultra-lightweight mode flag
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
    deepSleepTimeout: null,          // Timer for entering deep sleep
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
        }, this.TIMING.OVERLAY_DELAY);
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
            }, i * this.TIMING.STAGGER_BUTTONS);
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
            }, 2 * this.TIMING.STAGGER_BUTTONS + i * this.TIMING.STAGGER_CARDS);
        });

        // Put text to sleep
        document.querySelectorAll(this.SLEEPY_SELECTORS.text).forEach((el, i) => {
            setTimeout(() => {
                el.classList.add('sleepy');
                this.sleepyElements.push({ element: el, type: 'text' });
            }, this.TIMING.STAGGER_BUTTONS + i * this.TIMING.STAGGER_TEXT);
        });

        // Put nav links to sleep
        document.querySelectorAll(this.SLEEPY_SELECTORS.nav).forEach((el, i) => {
            setTimeout(() => {
                el.classList.add('sleepy');
                this.sleepyElements.push({ element: el, type: 'nav' });
            }, i * this.TIMING.STAGGER_NAV);
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
            }, this.TIMING.STAGGER_BUTTONS);
        }

        // Start breathing after initial sleep animation
        this.breathingTimeout = setTimeout(() => {
            this.startBreathing();
        }, this.TIMING.BREATHING_START);

        // Schedule deep sleep for ultra-lightweight mode
        this.deepSleepTimeout = setTimeout(() => {
            this.enterDeepSleep();
        }, this.DEEP_SLEEP_DELAY);
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

    // Enter ultra-lightweight deep sleep mode
    // Smoothly transitions to minimal resource usage while looking peaceful
    enterDeepSleep() {
        if (!this.isAsleep || this.isDeepSleep) return;
        this.isDeepSleep = true;

        // Cancel the canvas animation loop
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }

        // Add settling class first for smooth transition
        document.body.classList.add('settling-to-sleep');
        if (this.overlay) {
            this.overlay.classList.add('settling-to-sleep');
        }

        // Fade out the canvas smoothly
        if (this.canvas) {
            this.canvas.style.transition = 'opacity 1.5s ease-out';
            this.canvas.style.opacity = '0';
        }

        // Fade out floating Zs smoothly
        const zsContainer = this.overlay?.querySelector('.sleep-zs-container');
        if (zsContainer) {
            zsContainer.style.transition = 'opacity 1.5s ease-out';
            zsContainer.style.opacity = '0';
        }

        // After transition, switch to deep sleep state
        setTimeout(() => {
            // Now apply deep sleep class (animations frozen)
            document.body.classList.remove('settling-to-sleep');
            document.body.classList.add('deep-sleep');
            if (this.overlay) {
                this.overlay.classList.remove('settling-to-sleep');
                this.overlay.classList.add('deep-sleep');
            }

            // Hide canvas completely now
            if (this.canvas) {
                this.canvas.style.display = 'none';
            }

            // Remove Zs from DOM
            if (zsContainer) {
                zsContainer.innerHTML = '';
            }

            // Clean up element decorations
            this.cleanupDecorations();
        }, 1500);

        console.log(
            '%c 😴💤 Settling into deep sleep... ',
            'background: #0a0806; color: #666; padding: 5px; font-family: monospace; font-size: 9px;'
        );
    },

    addZzzToElement(element) {
        const container = document.createElement('div');
        container.className = 'element-zzz-container';
        container.style.cssText = 'position: absolute; top: -10px; right: -5px; pointer-events: none;';

        for (let i = 0; i < this.DISPLAY.ZS_PER_ELEMENT; i++) {
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
        const scale = this.CANVAS.PIXEL_SCALE;
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
        const isMobile = window.innerWidth < this.DISPLAY.MOBILE_BREAKPOINT;
        const count = isMobile
            ? this.DISPLAY.TOASTERS_MOBILE
            : Math.floor(window.innerWidth / 200) * this.DISPLAY.TOASTERS_PER_200PX + 2;

        for (let i = 0; i < count; i++) {
            this.toasters.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                speed: this.CANVAS.TOASTER_MIN_SPEED + Math.random() * this.CANVAS.TOASTER_SPEED_RANGE,
                wingFrame: Math.floor(Math.random() * 10),
                wingSpeed: this.CANVAS.WING_SPEED_MIN + Math.floor(Math.random() * this.CANVAS.WING_SPEED_RANGE),
            });
        }
    },

    initZs() {
        const container = this.overlay.querySelector('.sleep-zs-container');
        if (!container) return;

        const sizes = ['small', 'medium', 'large'];
        // Fewer Zs on mobile
        const isMobile = window.innerWidth < this.DISPLAY.MOBILE_BREAKPOINT;
        const count = isMobile ? this.DISPLAY.Z_COUNT_MOBILE : this.DISPLAY.Z_COUNT_DESKTOP;

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
                const margin = this.CANVAS.WRAP_MARGIN;
                if (toaster.x > this.canvas.width + margin) {
                    toaster.x = -margin;
                    toaster.y = Math.random() * this.canvas.height;
                }
                if (toaster.y < -margin) {
                    toaster.y = this.canvas.height + margin;
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
            this.isDeepSleep = false;
            this.lastActivityTime = Date.now();

            // Cancel breathing timeout if still pending
            if (this.breathingTimeout) {
                clearTimeout(this.breathingTimeout);
                this.breathingTimeout = null;
            }

            // Cancel deep sleep timeout if still pending
            if (this.deepSleepTimeout) {
                clearTimeout(this.deepSleepTimeout);
                this.deepSleepTimeout = null;
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

            // Remove body classes and add waking
            document.body.classList.remove('page-sleeping', 'deep-sleep', 'settling-to-sleep');
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
                }, this.TIMING.ELEMENT_CLEANUP_DELAY);

            }, this.TIMING.OVERLAY_FADE);

            // Console message
            console.log(
                '%c ☀️ Good morning! FOGSIFT is awake and ready. ',
                'background: #f5f0e6; color: #4a2c2a; padding: 10px; font-family: monospace; font-weight: bold;'
            );
        }, this.prefersReducedMotion() ? 0 : this.TIMING.WAKE_FLASH_DURATION);
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
            }, i * this.TIMING.STAGGER_STARTLE);
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
        }, this.TIMING.STARTLED_MARK_DURATION);
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
    },

    // Manual sleep trigger - for footer button
    manualSleep() {
        if (this.isAsleep) return;
        this.enterSleepMode();
    }
};

// Make available globally
window.SleepMode = SleepMode;

// Add sleep button to footer on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Find footer links container
    const footerLinks = document.querySelector('.footer-links');
    if (footerLinks) {
        const sleepBtn = document.createElement('button');
        sleepBtn.className = 'footer-sleep-btn';
        sleepBtn.setAttribute('aria-label', 'Put site to sleep');
        sleepBtn.innerHTML = '💤';
        sleepBtn.title = 'Put site to sleep';
        sleepBtn.addEventListener('click', (e) => {
            e.preventDefault();
            SleepMode.manualSleep();
        });
        footerLinks.appendChild(sleepBtn);
    }
});



