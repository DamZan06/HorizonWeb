(function () {
    const app = window.NorthLineApp || {};

    app.init = function () {
        if (typeof window.NorthLineStatus?.bindAdminLiveStatusForm === 'function') {
            window.NorthLineStatus.bindAdminLiveStatusForm();
        }

        if (document.body && document.body.dataset.page === 'home') {
            setInterval(async () => {
                if (typeof window.refreshHomeData === 'function') {
                    await window.refreshHomeData();
                }
            }, 8000);
        }
    };

    window.NorthLineApp = app;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', app.init, { once: true });
    } else {
        app.init();
    }
})();
