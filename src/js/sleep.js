/* ============================================
   FOGSIFT SECRET SLEEP MODE
   Easter egg screensaver - 70s/80s retro style
   Triggers after 5 min page time + 30s idle
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

        document.addEventListener('mousemove', resetActivity);
        document.addEventListener('keydown', resetActivity);
        document.addEventListener('scroll', resetActivity);
        document.addEventListener('touchstart', resetActivity);
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

        this.createOverlay();
        this.initToasters();
        this.initZs();
        this.startAnimation();

        // Bind wake-up click
        this.overlay.addEventListener('click', () => this.wakeUp());
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
                <span class="sleep-text">click to wake</span>
            </div>
        `;

        document.body.appendChild(this.overlay);

        // Setup canvas
        this.canvas = document.getElementById('sleep-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

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
        const count = Math.floor(window.innerWidth / 200) + 2;

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
        const sizes = ['small', 'medium', 'large'];

        for (let i = 0; i < 8; i++) {
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
            if (!this.isAsleep) return;

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

        // TV turn-on flash effect
        this.overlay.classList.add('waking');

        setTimeout(() => {
            this.isAsleep = false;
            this.lastActivityTime = Date.now();

            // Cancel animation
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
            }

            // Remove overlay with fade
            this.overlay.classList.remove('active');
            this.overlay.classList.add('fading');

            setTimeout(() => {
                if (this.overlay && this.overlay.parentNode) {
                    this.overlay.parentNode.removeChild(this.overlay);
                }
                this.overlay = null;
                this.canvas = null;
                this.ctx = null;
            }, 500);

            // Console message
            console.log(
                '%c ☀️ Good morning! FOGSIFT is awake and ready. ',
                'background: #f5f0e6; color: #4a2c2a; padding: 10px; font-family: monospace; font-weight: bold;'
            );
        }, 150);
    }
};

// Make available globally
window.SleepMode = SleepMode;

