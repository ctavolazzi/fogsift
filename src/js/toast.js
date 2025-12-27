/* ============================================
   FOGSIFT TOAST MODULE
   Notification system
   ============================================ */

const Toast = {
    containerId: 'toast-container',
    defaultDuration: 2500,

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
        const container = this.getContainer();
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerText = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.2s ease forwards';
            setTimeout(() => toast.remove(), 200);
        }, duration);
    }
};

