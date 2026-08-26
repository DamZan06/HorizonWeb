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
        const topbar = document.querySelector('.topbar');
        let toggle = document.querySelector('.topbar-menu-toggle');
        const nav = document.querySelector('.main-nav');
        let overlay = document.querySelector('.mobile-nav-overlay');
        if (!nav || !topbar) return;
        if (!nav.id) nav.id = 'mainNav';
        if (!toggle) {
            toggle = document.createElement('button');
            toggle.type = 'button'; toggle.className = 'topbar-menu-toggle'; toggle.textContent = 'Menu';
            toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-controls', nav.id);
            topbar.insertBefore(toggle, nav);
        }
        if (!overlay) {
            overlay = document.createElement('div'); overlay.className = 'mobile-nav-overlay'; overlay.hidden = true;
            document.body.prepend(overlay);
        }

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

    app.init = function () {
        if (app._initialized) {
            return;
        }
        app._initialized = true;

        if (window.HorizonNavigation && typeof window.HorizonNavigation.renderNavigation === 'function') {
            window.HorizonNavigation.renderNavigation();
        }

        const statusController = window.HorizonStatus;
        if (typeof statusController?.bindAdminLiveStatusForm === 'function') {
            statusController.bindAdminLiveStatusForm();
        }

        if (document.body && document.body.dataset && document.body.dataset.page === 'home' && window.HorizonHome && typeof window.HorizonHome.initHomePage === 'function') {
            window.HorizonHome.initHomePage();
        }

        setupLanguageControls();
        setupMobileNavigation();
    };

    window.HorizonApp = app;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', app.init, { once: true });
    } else {
        app.init();
    }
})();
