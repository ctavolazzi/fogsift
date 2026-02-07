/**
 * Three Card Monte - Hero emoji easter egg game
 * Click any emoji to start. Guess which one hides the heart.
 * Guess right → discount code popup + newsletter signup
 */

const Monte = {
    TIMING: {
        SHOW_HEART: 1200,
        SHUFFLE_STEP: 350,
        SHUFFLE_COUNT: 5,
        REVEAL_DELAY: 600,
        SHAKE_DURATION: 500,
    },

    EMOJIS: ['\u{1F3E1}', '\u{1F324}', '\u{1F52D}'],
    state: 'idle', // idle | showing | shuffling | guessing | reveal
    heartIndex: 0,
    cards: [],
    positions: [0, 1, 2],
    statusEl: null,

    init() {
        this.cards = Array.from(document.querySelectorAll('.hero-emoji-char'));
        if (this.cards.length !== 3) return;

        // Make emojis clickable in idle state
        var self = this;
        this.cards.forEach(function(card) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', function(e) { self._handleClick(e); });
        });

        // Create a small status text element (hidden by default)
        var status = document.createElement('div');
        status.className = 'monte-status';
        status.setAttribute('aria-live', 'polite');
        var emojis = this.cards[0].parentElement;
        emojis.parentElement.insertBefore(status, emojis.nextSibling);
        this.statusEl = status;

        // Close popup on backdrop click
        var popup = document.getElementById('monte-popup');
        if (popup) {
            popup.addEventListener('click', function(e) {
                if (e.target === popup) Monte.closePopup();
            });
        }
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') Monte.closePopup();
        });
    },

    _handleClick: function(e) {
        var card = e.currentTarget;
        var index = Monte.cards.indexOf(card);

        if (Monte.state === 'idle') {
            Monte.start();
        } else if (Monte.state === 'guessing') {
            Monte.guess(index);
        } else if (Monte.state === 'reveal') {
            Monte.reset();
        }
    },

    setStatus: function(text, className) {
        if (!this.statusEl) return;
        this.statusEl.textContent = text;
        this.statusEl.className = 'monte-status' + (className ? ' ' + className : '');
    },

    start() {
        if (this.state !== 'idle') return;
        this.state = 'showing';
        this.setStatus('');

        // Stop waft animations
        var self = this;
        this.cards.forEach(function(card) {
            card.style.animation = 'none';
            card.style.cursor = 'default';
            card.classList.add('monte-active');
        });

        // Pick random heart position
        this.heartIndex = Math.floor(Math.random() * 3);
        this.positions = [0, 1, 2];

        setTimeout(function() { self.showHeart(); }, 400);
    },

    showHeart() {
        var self = this;

        // Tag each card for tracking
        this.cards.forEach(function(card, i) {
            card.dataset.monteIdx = i;
            if (i === self.heartIndex) {
                card.dataset.monte = 'heart';
                card.textContent = '\u2764\uFE0F';
                card.classList.add('monte-heart');
            } else {
                card.dataset.monte = 'decoy';
                card.textContent = '\uD83C\uDCA0';
                card.classList.add('monte-back');
            }
        });

        // After showing, flip all to backs and start shuffling
        setTimeout(function() {
            self.cards.forEach(function(card) {
                card.textContent = '\uD83C\uDCA0';
                card.classList.remove('monte-heart');
                card.classList.add('monte-back');
            });
            setTimeout(function() { self.shuffle(0); }, 300);
        }, this.TIMING.SHOW_HEART);
    },

    shuffle(step) {
        if (step >= this.TIMING.SHUFFLE_COUNT) {
            this.state = 'guessing';
            this.enableGuessing();
            return;
        }

        this.state = 'shuffling';

        var a = Math.floor(Math.random() * 3);
        var b = (a + 1 + Math.floor(Math.random() * 2)) % 3;

        var temp = this.positions[a];
        this.positions[a] = this.positions[b];
        this.positions[b] = temp;

        this.animateSwap(a, b);

        var self = this;
        setTimeout(function() { self.shuffle(step + 1); }, this.TIMING.SHUFFLE_STEP);
    },

    animateSwap(a, b) {
        var cardA = this.cards[a];
        var cardB = this.cards[b];

        var rectA = cardA.getBoundingClientRect();
        var rectB = cardB.getBoundingClientRect();
        var dx = rectB.left - rectA.left;

        cardA.style.transition = 'transform ' + this.TIMING.SHUFFLE_STEP + 'ms cubic-bezier(0.4, 0, 0.2, 1)';
        cardB.style.transition = 'transform ' + this.TIMING.SHUFFLE_STEP + 'ms cubic-bezier(0.4, 0, 0.2, 1)';

        cardA.style.transform = 'translateX(' + dx + 'px) translateY(-8px)';
        cardB.style.transform = 'translateX(' + (-dx) + 'px) translateY(8px)';

        var self = this;
        setTimeout(function() {
            cardA.style.transition = 'none';
            cardB.style.transition = 'none';
            cardA.style.transform = '';
            cardB.style.transform = '';

            var parent = cardA.parentElement;
            var placeholder = document.createElement('span');
            parent.replaceChild(placeholder, cardA);
            parent.replaceChild(cardA, cardB);
            parent.replaceChild(cardB, placeholder);

            self.cards = Array.from(parent.querySelectorAll('.hero-emoji-char'));
        }, self.TIMING.SHUFFLE_STEP - 20);
    },

    enableGuessing() {
        this.setStatus('Pick one!', '');
        this.cards.forEach(function(card) {
            card.classList.add('monte-guess');
            card.style.cursor = 'pointer';
        });
    },

    guess(index) {
        if (this.state !== 'guessing') return;
        this.state = 'reveal';

        this.cards.forEach(function(card) {
            card.classList.remove('monte-guess');
            card.style.cursor = 'default';
        });

        this.setStatus('');
        this.revealAll(index);
    },

    revealAll(guessIndex) {
        var self = this;
        var won = false;

        this.cards.forEach(function(card, i) {
            card.classList.remove('monte-back');

            if (card.dataset.monte === 'heart') {
                card.textContent = '\u2764\uFE0F';
                card.classList.add('monte-heart');
                if (i === guessIndex) won = true;
            } else {
                var origIdx = parseInt(card.dataset.monteIdx);
                card.textContent = self.EMOJIS[origIdx];
            }
        });

        this.cards[guessIndex].classList.add('monte-picked');

        setTimeout(function() {
            if (won) {
                self.win();
            } else {
                self.lose();
            }
        }, this.TIMING.REVEAL_DELAY);
    },

    win() {
        var self = this;
        this.cards.forEach(function(card) {
            card.classList.add('monte-celebrate');
        });
        this.setStatus('\u2764\uFE0F You found it!', 'monte-win-text');

        setTimeout(function() { self.openPopup(); }, 800);
    },

    lose() {
        var self = this;
        this.cards[0].parentElement.classList.add('monte-shake');
        this.setStatus('Not quite! Click to try again.', '');

        // Make emojis clickable to restart
        this.cards.forEach(function(card) {
            card.style.cursor = 'pointer';
        });

        setTimeout(function() {
            self.cards[0].parentElement.classList.remove('monte-shake');
        }, this.TIMING.SHAKE_DURATION);
    },

    reset() {
        var self = this;
        this.state = 'idle';

        this.cards.forEach(function(card, i) {
            card.textContent = self.EMOJIS[i];
            card.className = 'hero-emoji-char';
            card.style.cssText = 'cursor: pointer;';
            card.removeAttribute('data-monte');
            card.removeAttribute('data-monte-idx');
        });

        this.setStatus('');
        this.positions = [0, 1, 2];
    },

    openPopup() {
        var popup = document.getElementById('monte-popup');
        if (!popup) return;
        document.body.classList.add('scroll-locked');
        popup.style.display = 'flex';
        popup.offsetHeight; // force reflow
        popup.classList.add('is-open');
    },

    closePopup() {
        var popup = document.getElementById('monte-popup');
        if (!popup) return;
        popup.classList.remove('is-open');
        document.body.classList.remove('scroll-locked');
        var self = this;
        setTimeout(function() {
            popup.style.display = 'none';
            self.reset();
        }, 300);
    }
};

// ============================================
// STAR PARTICLES - Lightweight DOM-based system
// ============================================
var StarParticles = {
    chars: ['\u2605', '\u2606', '\u2726', '\u2727', '\u2736', '\u00B7'],
    pool: [],
    poolSize: 20,
    container: null,

    init: function() {
        // Reusable particle container
        this.container = document.createElement('div');
        this.container.className = 'star-particles';
        this.container.setAttribute('aria-hidden', 'true');
        document.body.appendChild(this.container);

        // Pre-create particle elements
        for (var i = 0; i < this.poolSize; i++) {
            var p = document.createElement('span');
            p.className = 'star-particle';
            this.container.appendChild(p);
            this.pool.push({ el: p, active: false });
        }
    },

    burst: function(x, y, count, intensity) {
        if (!this.container) return;
        count = count || 8;
        intensity = intensity || 1;
        var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion) return;

        for (var i = 0; i < count; i++) {
            var p = this._getParticle();
            if (!p) break;

            var angle = (Math.PI * 2 * i / count) + (Math.random() - 0.5) * 0.8;
            var dist = (40 + Math.random() * 60) * intensity;
            var tx = Math.cos(angle) * dist;
            var ty = Math.sin(angle) * dist - 20; // slight upward bias
            var size = 8 + Math.random() * 10;
            var dur = 500 + Math.random() * 400;
            var spin = (Math.random() - 0.5) * 720;

            p.el.textContent = this.chars[Math.floor(Math.random() * this.chars.length)];
            p.el.style.cssText =
                'left:' + x + 'px;top:' + y + 'px;font-size:' + size + 'px;' +
                'opacity:1;transform:translate(0,0) rotate(0deg);' +
                'transition:transform ' + dur + 'ms cubic-bezier(.2,.8,.3,1),opacity ' + dur + 'ms ease-out;';
            p.active = true;

            // Force reflow then animate
            p.el.offsetHeight;
            p.el.style.transform = 'translate(' + tx + 'px,' + ty + 'px) rotate(' + spin + 'deg)';
            p.el.style.opacity = '0';

            // Return to pool
            (function(particle, duration) {
                setTimeout(function() { particle.active = false; }, duration + 50);
            })(p, dur);
        }
    },

    _getParticle: function() {
        for (var i = 0; i < this.pool.length; i++) {
            if (!this.pool[i].active) return this.pool[i];
        }
        return null;
    }
};

// ============================================
// GOLD STAR - Spinnable via click-drag or touch
// ============================================
var GoldStar = {
    el: null,
    angle: 6,
    dragging: false,
    lastX: 0,
    lastY: 0,
    velocity: 0,
    rafId: null,
    hasMoved: false,
    spinCount: 0,

    init: function() {
        this.el = document.querySelector('.gold-star');
        if (!this.el) return;

        StarParticles.init();
        var self = this;

        // Mouse events
        this.el.addEventListener('mousedown', function(e) { self.onStart(e.clientX, e.clientY); e.preventDefault(); });
        document.addEventListener('mousemove', function(e) { if (self.dragging) self.onMove(e.clientX, e.clientY); });
        document.addEventListener('mouseup', function() { self.onEnd(); });

        // Touch events
        this.el.addEventListener('touchstart', function(e) {
            var t = e.touches[0];
            self.onStart(t.clientX, t.clientY);
            e.preventDefault();
        }, { passive: false });
        document.addEventListener('touchmove', function(e) {
            if (self.dragging) { var t = e.touches[0]; self.onMove(t.clientX, t.clientY); }
        }, { passive: true });
        document.addEventListener('touchend', function() { self.onEnd(); });
    },

    _emitParticles: function(intensity) {
        var rect = this.el.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var count = Math.min(12, Math.max(4, Math.floor(Math.abs(intensity) * 0.6)));
        StarParticles.burst(cx, cy, count, Math.min(2, Math.abs(intensity) * 0.15));
    },

    onStart: function(x, y) {
        this.dragging = true;
        this.hasMoved = false;
        this.lastX = x;
        this.lastY = y;
        this.velocity = 0;
        this.el.classList.add('spinning');
        if (this.rafId) cancelAnimationFrame(this.rafId);
    },

    onMove: function(x, y) {
        var dx = x - this.lastX;
        var dy = y - this.lastY;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) this.hasMoved = true;
        var delta = dx + dy * 0.3;
        this.angle += delta * 0.8;
        this.velocity = delta * 0.8;
        this.lastX = x;
        this.lastY = y;
        this.el.style.transform = 'rotate(' + this.angle + 'deg)';

        // Emit particles while dragging fast
        if (Math.abs(this.velocity) > 5) {
            this._emitParticles(this.velocity);
        }
    },

    onEnd: function() {
        if (!this.dragging) return;
        this.dragging = false;
        this.el.classList.remove('spinning');

        if (!this.hasMoved) {
            this.quickSpin();
        } else {
            if (Math.abs(this.velocity) > 3) {
                this._emitParticles(this.velocity * 2);
            }
            this.coast();
        }
    },

    coast: function() {
        var self = this;
        if (Math.abs(this.velocity) < 0.3) {
            this.velocity = 0;
            return;
        }
        this.velocity *= 0.95;
        this.angle += this.velocity;
        this.el.style.transform = 'rotate(' + this.angle + 'deg)';
        this.rafId = requestAnimationFrame(function() { self.coast(); });
    },

    quickSpin: function() {
        var self = this;
        this.spinCount++;
        var extra = 360 + Math.random() * 360;
        this.angle += extra;
        this.el.style.transition = 'transform 1.2s cubic-bezier(0.2, 0.8, 0.3, 1)';
        this.el.style.transform = 'rotate(' + this.angle + 'deg)';

        // Burst particles on click spin
        this._emitParticles(20);
        // Second burst mid-spin
        setTimeout(function() { self._emitParticles(12); }, 300);

        setTimeout(function() {
            self.el.style.transition = '';
        }, 1200);
    }
};

// Initialize when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { Monte.init(); GoldStar.init(); });
} else {
    Monte.init();
    GoldStar.init();
}
