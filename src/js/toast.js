/* ============================================
   FOGSIFT TOAST MODULE
   Notification system with copyable errors
   ============================================ */

const Toast = {
    containerId: 'toast-container',
    defaultDuration: 2500,
    errorDuration: 5000,

    getContainer() {
        let container = document.getElementById(this.containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = this.containerId;
            document.body.appendChild(container);
        }
        return container;
    },

    show(message, duration = this.defaultDuration) {
        this._create(message, 'success', duration);
    },

    error(message, duration = this.errorDuration) {
        this._create(message, 'error', duration, true);
    },

    info(message, duration = this.defaultDuration) {
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
                    setTimeout(() => copyBtn.innerHTML = '[COPY]', 1000);
                }).catch(() => {
                    copyBtn.innerHTML = '[FAILED]';
                    setTimeout(() => copyBtn.innerHTML = '[COPY]', 1000);
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
        toast.style.animation = 'slideOut 0.2s ease forwards';
        setTimeout(() => toast.remove(), 200);
    }
};

