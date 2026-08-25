(function () {
    const app = window.HorizonApp || {};

    function setupLanguageControls() {
        const preferred = localStorage.getItem('horizon-language') || document.documentElement.lang || 'en';
        if (typeof window.HorizonI18n?.applyLanguagePreference === 'function') {
            window.HorizonI18n.applyLanguagePreference(preferred);
        }
        if (typeof window.HorizonI18n?.hydrateLanguageControls === 'function') {
            window.HorizonI18n.hydrateLanguageControls();
        }
    }

    function setupMobileNavigation() {
        const toggle = document.querySelector('.topbar-menu-toggle');
        const nav = document.querySelector('.main-nav');
        const overlay = document.querySelector('.mobile-nav-overlay');
        if (!toggle || !nav) return;

        if (toggle.dataset.bound === 'true') {
            return;
        }
        toggle.dataset.bound = 'true';

        const setMenuState = (isOpen) => {
            const isHidden = !isOpen;
            document.body.classList.toggle('mobile-nav-open', isOpen);
            toggle.setAttribute('aria-expanded', String(isOpen));
            toggle.setAttribute('aria-label', isOpen ? (window.HorizonI18n?.catalog?.[document.documentElement.lang]?.app?.menuClose || 'Close menu') : (window.HorizonI18n?.catalog?.[document.documentElement.lang]?.app?.menuOpen || 'Open menu'));
            nav.setAttribute('aria-hidden', String(isHidden));
            if (overlay) {
                overlay.hidden = !isOpen;
            }
        };

        toggle.addEventListener('click', () => {
            const nextState = toggle.getAttribute('aria-expanded') !== 'true';
            setMenuState(nextState);
        });

        if (overlay) {
            overlay.addEventListener('click', () => setMenuState(false));
        }

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && document.body.classList.contains('mobile-nav-open')) {
                setMenuState(false);
            }
        });

        nav.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => setMenuState(false));
        });
    }

    app.startHomeRefreshScheduler = function () {
        if (app.homeRefreshTimerId) {
            return;
        }
        app.homeRefreshTimerId = window.setInterval(async () => {
            if (document.body && document.body.dataset.page === 'home' && typeof app?.init === 'function') {
                await app.init();
            }
        }, 8000);
    };

    app.init = function () {
        if (app._initialized) {
            return;
        }
        app._initialized = true;

        const statusController = window.HorizonStatus;
        if (typeof statusController?.bindAdminLiveStatusForm === 'function') {
            statusController.bindAdminLiveStatusForm();
        }

        setupLanguageControls();
        setupMobileNavigation();
        app.startHomeRefreshScheduler();
    };

    window.HorizonApp = app;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', app.init, { once: true });
    } else {
        app.init();
    }
})();
