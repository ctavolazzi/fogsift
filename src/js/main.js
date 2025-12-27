/* ============================================
   FOGSIFT MAIN
   App initialization and event bindings
   ============================================ */

const App = {
    version: '0.0.1',

    init() {
        // Initialize modules
        Nav.init();
        Modal.init();
        this.initClock();
        this.initDiagnostic();
        this.initEventBindings();
        this.logBoot();
    },

    initClock() {
        const clock = document.getElementById('utc-clock');
        if (!clock) return;

        const update = () => {
            const now = new Date();
            clock.textContent = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
        };

        update();
        setInterval(update, 1000);
    },

    initDiagnostic() {
        const checkboxes = document.querySelectorAll('.check-item');
        let checkedCount = 0;

        checkboxes.forEach(item => {
            item.addEventListener('click', () => {
                const box = item.querySelector('.check-box');
                if (!box) return;

                if (box.innerText === '[x]') {
                    box.innerText = '[ ]';
                    box.classList.remove('checked');
                    checkedCount--;
                } else {
                    box.innerText = '[x]';
                    box.classList.add('checked');
                    checkedCount++;
                    Toast.show('CRITERION VERIFIED');
                }

                const hotline = document.querySelector('.hotline-button');
                if (checkedCount === 3) {
                    Toast.show('PROFILE MATCH: HIGH PROBABILITY');
                    hotline?.classList.add('pulse');
                } else {
                    hotline?.classList.remove('pulse');
                }
            });
        });
    },

    initEventBindings() {
        // Copy button
        const copyBtn = document.getElementById('copy-btn');
        copyBtn?.addEventListener('click', () => {
            navigator.clipboard.writeText(document.body.innerText)
                .then(() => Toast.show('SYSTEM LOG: TRANSCRIPT EXTRACTED'));
        });

        // Hotline hover
        const hotline = document.querySelector('.hotline-button');
        hotline?.addEventListener('mouseenter', () => {
            Toast.show('CHANNEL: DIRECT / PRIORITY');
        });

        // Subscribe button
        const subBtn = document.getElementById('sub-btn');
        subBtn?.addEventListener('click', () => {
            Toast.show('SUBSCRIPTION PROTOCOL: COMING SOON');
        });
    },

    logBoot() {
        console.log(
            '%c FOGSIFT v' + this.version + ' // SYSTEMS NOMINAL ',
            'background: #18181b; color: #d97706; padding: 10px; font-family: monospace; font-weight: bold; border-left: 5px solid #06b6d4;'
        );
    }
};

// Boot on DOM ready
document.addEventListener('DOMContentLoaded', () => App.init());

