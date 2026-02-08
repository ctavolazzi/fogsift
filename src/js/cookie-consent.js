/* ============================================
   FOGSIFT COOKIE CONSENT
   GDPR/CCPA compliant consent banner
   ============================================ */

const CookieConsent = {
    STORAGE_KEY: 'fogsift-cookie-consent',
    BANNER_ID: 'cookie-consent-banner',

    TIMING: {
        SHOW_DELAY: 800,
        FADE_DURATION: 300,
    },

    init() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) return; // Already answered — don't show again
        } catch {
            return; // localStorage unavailable (private browsing)
        }
        setTimeout(() => this._createBanner(), this.TIMING.SHOW_DELAY);
    },

    accept() {
        this._save('accepted');
        this._hideBanner();
    },

    decline() {
        this._save('declined');
        this._hideBanner();
    },

    _save(choice) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
                choice: choice,
                timestamp: new Date().toISOString(),
            }));
        } catch { /* private browsing */ }
    },

    _hideBanner() {
        const banner = document.getElementById(this.BANNER_ID);
        if (!banner) return;
        banner.style.opacity = '0';
        banner.style.transform = 'translateY(20px)';
        setTimeout(() => banner.remove(), this.TIMING.FADE_DURATION);
    },

    _createBanner() {
        if (document.getElementById(this.BANNER_ID)) return;

        const banner = document.createElement('div');
        banner.id = this.BANNER_ID;
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Cookie consent');
        banner.innerHTML = `
            <div class="cookie-consent-inner">
                <p class="cookie-consent-text">
                    This site uses cookies and localStorage for theme preferences and analytics.
                    No data is sold or shared with third parties.
                </p>
                <div class="cookie-consent-actions">
                    <button class="cookie-consent-btn cookie-consent-accept" id="cookie-accept">Accept</button>
                    <button class="cookie-consent-btn cookie-consent-decline" id="cookie-decline">Decline</button>
                </div>
            </div>
        `;

        // Start hidden for fade-in
        banner.style.opacity = '0';
        banner.style.transform = 'translateY(20px)';
        document.body.appendChild(banner);

        // Trigger reflow then animate in
        banner.offsetHeight; // eslint-disable-line no-unused-expressions
        requestAnimationFrame(() => {
            banner.style.opacity = '1';
            banner.style.transform = 'translateY(0)';
        });

        document.getElementById('cookie-accept').addEventListener('click', () => this.accept());
        document.getElementById('cookie-decline').addEventListener('click', () => this.decline());
    },

    /** Check if user has accepted cookies. Useful for gating analytics. */
    hasConsent() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (!stored) return false;
            return JSON.parse(stored).choice === 'accepted';
        } catch { return false; }
    }
};

window.CookieConsent = CookieConsent;
