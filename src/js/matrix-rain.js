/* ============================================
   MATRIX RAIN - Performance Optimized
   Buttery smooth 60fps digital rain
   ============================================ */

const MatrixRain = {
    canvas: null,
    ctx: null,
    animationId: null,
    columns: [],
    fontSize: 14,
    _initialized: false,
    _unsubscribe: null,

    // Smaller character set for better cache hits
    chars: 'ァカサタナハマヤラワガザダバパイキシチニヒミリギジビピウクスツヌフムユルグズプエケセテネヘメレゲゼベペオコソトノホモヨロゴゾボポ0123456789',

    init() {
        if (this._initialized) return;
        this._initialized = true;

        if (typeof Theme !== 'undefined') {
            this._unsubscribe = Theme.subscribe((newTheme, previousTheme) => {
                if (newTheme === 'matrix') this.start();
                else if (previousTheme === 'matrix') this.stop();
            });

            if (Theme.get() === 'matrix') this.start();
        }
    },

    start() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (this.canvas) return;

        this._createCanvas();
        this._initColumns();
        window.addEventListener('resize', this._boundResize = this._resize.bind(this));
        this._loop();
    },

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.canvas?.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        window.removeEventListener('resize', this._boundResize);
        this.canvas = null;
        this.ctx = null;
        this.columns = [];
    },

    _createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'matrix-rain';
        this.canvas.setAttribute('aria-hidden', 'true');

        const s = this.canvas.style;
        s.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;';

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx = this.canvas.getContext('2d', { alpha: false });

        // Fill with black initially
        this.ctx.fillStyle = '#0D0208';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        document.body.insertBefore(this.canvas, document.body.firstChild);
    },

    _initColumns() {
        const count = Math.ceil(this.canvas.width / this.fontSize);
        this.columns = new Array(count);

        for (let i = 0; i < count; i++) {
            this.columns[i] = {
                y: Math.random() * this.canvas.height * -0.5,
                speed: 4 + Math.random() * 8,
                nextChar: 0
            };
        }
    },

    _resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this._initColumns();
    },

    _loop() {
        this._draw();
        this.animationId = requestAnimationFrame(() => this._loop());
    },

    _draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const fs = this.fontSize;
        const chars = this.chars;
        const charLen = chars.length;

        // Fade effect - single operation
        ctx.fillStyle = 'rgba(13, 2, 8, 0.05)';
        ctx.fillRect(0, 0, w, h);

        // Set font once
        ctx.font = fs + 'px monospace';

        for (let i = 0, len = this.columns.length; i < len; i++) {
            const col = this.columns[i];
            const x = i * fs;
            const y = col.y;

            // Only draw if on screen
            if (y > -fs && y < h + fs) {
                // Head character - bright white-green
                ctx.fillStyle = '#FFF';
                ctx.fillText(chars[col.nextChar++ % charLen], x, y);

                // One trail character - medium green
                if (y - fs > 0) {
                    ctx.fillStyle = '#0F0';
                    ctx.fillText(chars[(col.nextChar + 5) % charLen], x, y - fs);
                }

                // Second trail - darker
                if (y - fs * 2 > 0) {
                    ctx.fillStyle = '#090';
                    ctx.fillText(chars[(col.nextChar + 10) % charLen], x, y - fs * 2);
                }
            }

            // Move down
            col.y += col.speed;

            // Reset at bottom
            if (col.y > h + fs * 3) {
                col.y = Math.random() * -100;
                col.speed = 4 + Math.random() * 8;
            }
        }
    },

    destroy() {
        this.stop();
        if (this._unsubscribe) {
            this._unsubscribe();
            this._unsubscribe = null;
        }
        this._initialized = false;
    }
};

// Auto-init
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => MatrixRain.init());
    } else {
        MatrixRain.init();
    }
}
