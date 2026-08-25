(function () {
    function initialize() {
        if (window.HorizonNavigation && typeof window.HorizonNavigation.renderNavigation === 'function') {
            window.HorizonNavigation.renderNavigation();
        }

        if (window.HorizonApp && typeof window.HorizonApp.init === 'function') {
            window.HorizonApp.init();
        }

        if (document.body && document.body.dataset && document.body.dataset.page === 'live') {
            if (window.HorizonLivePage && typeof window.HorizonLivePage.init === 'function') {
                window.HorizonLivePage.init();
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize, { once: true });
        return;
    }

    initialize();
})();
