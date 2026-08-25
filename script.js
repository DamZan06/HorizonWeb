(function () {
    function start() {
        const runtime = window.HorizonRuntime;
        if (!runtime || typeof runtime.init !== 'function') {
            console.error('Horizon runtime is not available.');
            return;
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => runtime.init(), { once: true });
            return;
        }

        runtime.init();
    }

    if (window.HorizonRuntime && typeof window.HorizonRuntime.init === 'function') {
        start();
        return;
    }

    const intervalId = window.setInterval(() => {
        if (window.HorizonRuntime && typeof window.HorizonRuntime.init === 'function') {
            window.clearInterval(intervalId);
            start();
        }
    }, 25);
})();
