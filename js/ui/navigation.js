(function () {
    const tr = (key, fallback) => window.HorizonI18n?.t?.(key) || fallback || key;
    const NAV_ITEMS = [
        { key: 'home', i18n: 'common.home', label: 'Home', href: 'index.html' },
        { key: 'live', i18n: 'common.live', label: 'Live', href: 'live.html' },
        { key: 'dashboard', i18n: 'common.dashboard', label: 'Dashboard', href: 'dashboard.html' },
        { key: 'progress', i18n: 'common.objectives', label: 'Objectives', href: 'progress.html' },
        { key: 'gallery', i18n: 'common.photos', label: 'Photos', href: 'gallery.html' },
        { key: 'replay', i18n: 'common.replay', label: 'Replay', href: 'replay.html' }
    ];

    function getPageKey() {
        const page = document.body && document.body.dataset && document.body.dataset.page;
        if (page) {
            return page.toLowerCase();
        }

        const pathname = window.location.pathname.split('/').pop() || 'index.html';
        const map = {
            'index.html': 'home',
            'live.html': 'live',
            'project.html': 'project',
            'gallery.html': 'gallery',
            'journey.html': 'gallery',
            'replay.html': 'replay',
            'dashboard.html': 'dashboard',
            'progress.html': 'live'
        };

        return map[pathname] || 'home';
    }

    function renderNavigation() {
        const navs = document.querySelectorAll('.main-nav');
        if (!navs.length) {
            return;
        }

        const activeKey = getPageKey();

        navs.forEach((nav) => {
            const fragment = document.createDocumentFragment();
            NAV_ITEMS.forEach((item) => {
                const link = document.createElement('a');
                link.href = item.href;
                link.textContent = tr(item.i18n, item.label);
                link.dataset.i18n = item.i18n;
                link.dataset.navKey = item.key;
                if (item.key === activeKey) {
                    link.setAttribute('aria-current', 'page');
                }
                fragment.appendChild(link);
            });

            const preservedNodes = Array.from(nav.childNodes).filter((node) => {
                return node.nodeType === 1 && !node.matches('a[href]');
            });

            nav.innerHTML = '';
            nav.appendChild(fragment);
            preservedNodes.forEach((node) => nav.appendChild(node));
        });
    }

    window.HorizonNavigation = {
        NAV_ITEMS,
        getPageKey,
        renderNavigation
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderNavigation, { once: true });
    } else {
        renderNavigation();
    }
    document.addEventListener('horizon:languagechange', renderNavigation);
})();
