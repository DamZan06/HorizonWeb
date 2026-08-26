(function () {
    const NAV_ITEMS = [
        { key: 'home', label: 'Home', href: 'index.html' },
        { key: 'live', label: 'Live', href: 'live.html' },
        { key: 'project', label: 'Project', href: 'project.html' },
        { key: 'journey', label: 'Journey', href: 'gallery.html' },
        { key: 'replay', label: 'Replay', href: 'replay.html' }
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
            'gallery.html': 'journey',
            'journey.html': 'journey',
            'replay.html': 'replay',
            'dashboard.html': 'live',
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
                link.textContent = item.label;
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
})();
