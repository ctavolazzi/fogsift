/* ============================================
   FOGSIFT TOAST MODULE
   Notification system with copyable errors
   ============================================ */

const Toast = {
    containerId: 'toast-container',

    // Timing constants (TD-015: no magic numbers)
    TIMING: {
        DEFAULT_DURATION: 2500,      // Default toast display time
        ERROR_DURATION: 5000,        // Error toast display time
        FADE_DURATION: 200,          // Slide out animation duration
        COPY_FEEDBACK: 1000          // "COPIED" feedback display time
    },

    getContainer() {
        let container = document.getElementById(this.containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = this.containerId;
            // Accessibility attributes (must match index.html)
            container.setAttribute('role', 'status');
            container.setAttribute('aria-live', 'polite');
            container.setAttribute('aria-atomic', 'true');
            document.body.appendChild(container);
        }
        return container;
    },

    show(message, duration = this.TIMING.DEFAULT_DURATION) {
        this._create(message, 'success', duration);
    },

    error(message, duration = this.TIMING.ERROR_DURATION) {
        this._create(message, 'error', duration, true);
    },

    info(message, duration = this.TIMING.DEFAULT_DURATION) {
        this._create(message, 'info', duration);
    },

    _create(message, type = 'success', duration, copyable = false) {
        const container = this.getContainer();
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;

        // Message content
        const content = document.createElement('span');
        content.className = 'toast__message';
        content.innerText = message;
        toast.appendChild(content);

        // Copy button for errors
        if (copyable) {
            const copyBtn = document.createElement('button');
            copyBtn.className = 'toast__copy';
            copyBtn.innerHTML = '[COPY]';
            copyBtn.title = 'Copy error to clipboard';
            copyBtn.onclick = (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(message).then(() => {
                    copyBtn.innerHTML = '[COPIED]';
                    setTimeout(() => copyBtn.innerHTML = '[COPY]', this.TIMING.COPY_FEEDBACK);
                }).catch(() => {
                    copyBtn.innerHTML = '[FAILED]';
                    setTimeout(() => copyBtn.innerHTML = '[COPY]', this.TIMING.COPY_FEEDBACK);
                });
            };
            toast.appendChild(copyBtn);
        }

        container.appendChild(toast);

        // Auto-dismiss
        const dismissTimeout = setTimeout(() => {
            this._dismiss(toast);
        }, duration);

        // Click to dismiss (but not on copy button)
        toast.addEventListener('click', (e) => {
            if (!e.target.classList.contains('toast__copy')) {
                clearTimeout(dismissTimeout);
                this._dismiss(toast);
            }
        });
    },

    _dismiss(toast) {
        const fadeMs = this.TIMING.FADE_DURATION;
        toast.style.animation = `slideOut ${fadeMs / 1000}s ease forwards`;
        setTimeout(() => toast.remove(), fadeMs);
    }
};

// Explicit global export for consistency with other modules
window.Toast = Toast;
