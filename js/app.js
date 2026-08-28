(function () {
    const tr = (key, fallback) => window.HorizonI18n?.t?.(key) || fallback || key;
    const app = window.HorizonApp || {};

    function setupLanguageControls() {
        const topbar = document.querySelector('.topbar');
        const nav = document.querySelector('.main-nav');
        const options = '<option value="en">English</option><option value="it">Italiano</option><option value="de">Deutsch</option><option value="fr">Français</option>';
        if (topbar && !topbar.querySelector('.lang-switcher-desktop')) {
            const wrap = document.createElement('div'); wrap.className = 'lang-switcher lang-switcher-desktop';
            wrap.innerHTML = `<label class="lang-switcher-label" data-i18n="common.language">${tr("common.language", "Language")}</label><select class="lang-switcher-select" data-i18n-attr='{"aria-label":"common.language"}' aria-label="${tr("common.language", "Language")}">${options}</select>`; topbar.appendChild(wrap);
        }
        if (nav && !nav.querySelector('.lang-switcher-mobile')) {
            const wrap = document.createElement('div'); wrap.className = 'lang-switcher lang-switcher-mobile';
            wrap.innerHTML = `<label class="lang-switcher-label" data-i18n="common.language">${tr("common.language", "Language")}</label><select class="lang-switcher-select" data-i18n-attr='{"aria-label":"common.language"}' aria-label="${tr("common.language", "Language")}">${options}</select>`; nav.appendChild(wrap);
        }
        if (typeof window.HorizonI18n?.hydrateLanguageControls === 'function') {
            window.HorizonI18n.hydrateLanguageControls();
        } else if (typeof window.HorizonI18n?.applyLanguagePreference === 'function') {
            window.HorizonI18n.applyLanguagePreference(document.documentElement.lang || 'en');
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
            toggle.type = 'button'; toggle.className = 'topbar-menu-toggle';
            toggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z"/></svg>';
            toggle.title = tr("common.openMenu", "Open menu");
            toggle.setAttribute('aria-label', tr("common.openMenu", "Open menu"));
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
            toggle.setAttribute('aria-label', isOpen ? tr("common.closeMenu", "Close menu") : tr("common.openMenu", "Open menu"));
            toggle.title = isOpen ? tr("common.closeMenu", "Close menu") : tr("common.openMenu", "Open menu");
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

        nav.addEventListener('click', (event) => {
            if (event.target.closest('a')) setMenuState(false);
        });
        document.addEventListener('horizon:languagechange', () => {
            setMenuState(toggle.getAttribute('aria-expanded') === 'true');
        });
        setMenuState(false);
    }

    function setupScrollableBackground() {
        let frame = null;
        const update = () => {
            const range = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
            const progress = Math.max(0, Math.min(1, window.scrollY / range));
            document.documentElement.style.setProperty('--site-background-y', `${(progress * 100).toFixed(2)}%`);
            frame = null;
        };
        const requestUpdate = () => {
            if (frame !== null) return;
            frame = window.requestAnimationFrame(update);
        };
        update();
        window.addEventListener('scroll', requestUpdate, { passive: true });
        window.addEventListener('resize', requestUpdate, { passive: true });
    }

    app.init = function () {
        if (app._initialized) {
            return;
        }
        app._initialized = true;

        if (window.HorizonNavigation && typeof window.HorizonNavigation.renderNavigation === 'function') {
            window.HorizonNavigation.renderNavigation();
        }

        if (document.body && document.body.dataset && document.body.dataset.page === 'home' && window.HorizonHome && typeof window.HorizonHome.initHomePage === 'function') {
            window.HorizonHome.initHomePage();
        }

        setupLanguageControls();
        setupMobileNavigation();
        setupScrollableBackground();
    };

    window.HorizonApp = app;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', app.init, { once: true });
    } else {
        app.init();
    }
})();
