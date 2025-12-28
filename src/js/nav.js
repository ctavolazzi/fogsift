/* ============================================
   FOGSIFT NAVIGATION MODULE
   Mobile menu handling with overlay
   ============================================ */

const Nav = {
    drawerId: 'mobile-drawer',
    overlayId: 'mobile-overlay',

    toggleMobile() {
        const drawer = document.getElementById(this.drawerId);
        const overlay = document.getElementById(this.overlayId);
        const isOpen = drawer.classList.contains('open');

        if (isOpen) {
            drawer.classList.remove('open');
            overlay?.classList.remove('open');
            document.body.classList.remove('scroll-locked');
        } else {
            drawer.classList.add('open');
            overlay?.classList.add('open');
            document.body.classList.add('scroll-locked');
        }
    },

    close() {
        const drawer = document.getElementById(this.drawerId);
        const overlay = document.getElementById(this.overlayId);
        drawer?.classList.remove('open');
        overlay?.classList.remove('open');
        document.body.classList.remove('scroll-locked');
    },

    init() {
        // Navigation initialized
    }
};
