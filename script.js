(function () {
    function start() {
        const runtime = window.HorizonRuntime || window.HorizonApp;
        if (!runtime || typeof runtime.init !== 'function') {
            return;
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => runtime.init(), { once: true });
            return;
        }

        runtime.init();
    }

    if (window.HorizonApp && typeof window.HorizonApp.init === 'function') {
        start();
        return;
    }

    if (window.HorizonRuntime && typeof window.HorizonRuntime.init === 'function') {
        start();
        return;
    }

    const intervalId = window.setInterval(() => {
        const runtime = window.HorizonRuntime || window.HorizonApp;
        if (runtime && typeof runtime.init === 'function') {
            window.clearInterval(intervalId);
            start();
        }
    }, 25);
})();
