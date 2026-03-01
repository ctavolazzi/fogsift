/**
 * Tabs — accessible tab-switching component
 * Handles all [data-tab-group] elements on the page.
 * Supports arrow-key navigation, aria-selected, and hidden panels.
 */
const Tabs = {
    init() {
        document.querySelectorAll('[data-tab-group]').forEach(group => {
            const buttons = Array.from(group.querySelectorAll('[role="tab"]'));
            const panels  = Array.from(group.querySelectorAll('[role="tabpanel"]'));

            buttons.forEach((btn, i) => {
                btn.addEventListener('click', () => Tabs.activate(buttons, panels, i));
                btn.addEventListener('keydown', (e) => {
                    if (e.key === 'ArrowRight') {
                        e.preventDefault();
                        const next = (i + 1) % buttons.length;
                        Tabs.activate(buttons, panels, next);
                        buttons[next].focus();
                    } else if (e.key === 'ArrowLeft') {
                        e.preventDefault();
                        const prev = (i - 1 + buttons.length) % buttons.length;
                        Tabs.activate(buttons, panels, prev);
                        buttons[prev].focus();
                    } else if (e.key === 'Home') {
                        e.preventDefault();
                        Tabs.activate(buttons, panels, 0);
                        buttons[0].focus();
                    } else if (e.key === 'End') {
                        e.preventDefault();
                        Tabs.activate(buttons, panels, buttons.length - 1);
                        buttons[buttons.length - 1].focus();
                    }
                });
            });
        });
    },

    activate(buttons, panels, index) {
        buttons.forEach((b, i) => {
            const isActive = i === index;
            b.classList.toggle('active', isActive);
            b.setAttribute('aria-selected', String(isActive));
            b.setAttribute('tabindex', isActive ? '0' : '-1');
        });
        panels.forEach((p, i) => {
            const isActive = i === index;
            p.hidden = !isActive;
            p.classList.toggle('active', isActive);
        });
    },
};

document.addEventListener('DOMContentLoaded', () => Tabs.init());
