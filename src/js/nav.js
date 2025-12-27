/* ============================================
   FOGSIFT NAVIGATION MODULE
   Mobile menu + breadcrumb tracker
   ============================================ */

const Nav = {
    drawerId: 'mobile-drawer',

    toggleMobile() {
        const drawer = document.getElementById(this.drawerId);
        const isOpen = drawer.classList.contains('open');

        if (isOpen) {
            drawer.classList.remove('open');
            document.body.classList.remove('scroll-locked');
        } else {
            drawer.classList.add('open');
            document.body.classList.add('scroll-locked');
        }
    },

    initBreadcrumbs() {
        const pathCat = document.getElementById('crumb-category');
        const pathSec = document.getElementById('crumb-section');
        const sep1 = document.getElementById('sep-1');

        if (!pathCat || !pathSec) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                const crumbData = entry.target.getAttribute('data-crumb');
                if (!crumbData) return;

                if (crumbData.includes('/')) {
                    const [category, section] = crumbData.split('/').map(s => s.trim());
                    pathCat.innerHTML = `<a href="#${entry.target.id}" class="crumb-link">${category}</a>`;
                    pathCat.style.display = 'flex';
                    sep1.style.display = 'block';
                    pathSec.innerHTML = `<span class="crumb-current">${section}</span>`;
                } else {
                    pathCat.style.display = 'none';
                    sep1.style.display = 'none';
                    pathSec.innerHTML = `<span class="crumb-current">${crumbData}</span>`;
                }
            });
        }, { threshold: 0.3, rootMargin: '-10% 0px -50% 0px' });

        document.querySelectorAll('section, .card, .contact-box').forEach(el => {
            observer.observe(el);
        });
    },

    initProgressBar() {
        const bar = document.getElementById('progress-bar');
        if (!bar) return;

        window.addEventListener('scroll', () => {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const progress = (scrollTop / scrollHeight) * 100;
            bar.style.width = `${progress}%`;
        });
    },

    init() {
        this.initBreadcrumbs();
        this.initProgressBar();
    }
};

