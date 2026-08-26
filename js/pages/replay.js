(function () {
    const replayState = {
        initialized: false,
        isPlaying: false,
        currentIndex: 0,
        timer: null,
        speed: 80,
        routePoints: []
    };

    function setStatus(message) {
        const statusNode = document.getElementById('replayStatus');
        if (statusNode) {
            statusNode.textContent = message;
        }
    }

    function ensureRoutePoints() {
        if (replayState.routePoints.length) {
            return replayState.routePoints;
        }

        replayState.routePoints = [
            [46.595, 9.853],
            [46.6, 9.8],
            [46.7, 9.6],
            [46.9, 9.4],
            [47.1, 9.2],
            [47.3, 9.0],
            [47.5, 8.8]
        ];

        return replayState.routePoints;
    }

    function buildMarker() {
        const mapContainer = document.getElementById('map');
        if (!mapContainer || !window.L) {
            return null;
        }

        if (!window.HorizonMap || typeof window.HorizonMap.createMap !== 'function') {
            return null;
        }

        const map = window.HorizonMap.createMap({
            center: [46.6, 10.4],
            zoom: 8
        });

        if (!map) {
            return null;
        }

        if (!window.HorizonMap.loadRoute) {
            return map;
        }

        window.HorizonMap.loadRoute('data/route/horizon-route.geojson').catch(() => {
            setStatus('Replay route unavailable');
        });

        return map;
    }

    function updateReplayUi() {
        const speedInput = document.getElementById('replaySpeed');
        const speedLabel = document.getElementById('replaySpeedLabel');
        if (speedInput) {
            replayState.speed = Number(speedInput.value || 80);
        }
        if (speedLabel) {
            speedLabel.textContent = `${replayState.speed} ms`;
        }
    }

    function renderReplayFrame() {
        const points = ensureRoutePoints();
        const map = buildMarker();
        const point = points[replayState.currentIndex] || points[0];

        if (map && point && window.HorizonMap && typeof window.HorizonMap.setLivePosition === 'function') {
            window.HorizonMap.setLivePosition(point, { animate: true, label: 'Replay position' });
            map.setView(point, Math.max(map.getZoom(), 8));
        }

        setStatus(replayState.isPlaying ? 'Playing replay' : 'Replay ready');
    }

    function startReplay() {
        if (replayState.timer) {
            window.clearInterval(replayState.timer);
        }

        replayState.isPlaying = true;
        setStatus('Playing replay');
        replayState.timer = window.setInterval(() => {
            const points = ensureRoutePoints();
            replayState.currentIndex = (replayState.currentIndex + 1) % points.length;
            renderReplayFrame();
        }, replayState.speed);
    }

    function pauseReplay() {
        replayState.isPlaying = false;
        if (replayState.timer) {
            window.clearInterval(replayState.timer);
            replayState.timer = null;
        }
        setStatus('Replay paused');
    }

    function resetReplay() {
        replayState.isPlaying = false;
        if (replayState.timer) {
            window.clearInterval(replayState.timer);
            replayState.timer = null;
        }
        replayState.currentIndex = 0;
        renderReplayFrame();
        setStatus('Replay ready');
    }

    function initReplayPage() {
        if (replayState.initialized) {
            return;
        }
        replayState.initialized = true;

        const playButton = document.getElementById('replayPlay');
        const pauseButton = document.getElementById('replayPause');
        const resetButton = document.getElementById('replayReset');
        const speedInput = document.getElementById('replaySpeed');

        if (playButton) {
            playButton.addEventListener('click', startReplay);
        }
        if (pauseButton) {
            pauseButton.addEventListener('click', pauseReplay);
        }
        if (resetButton) {
            resetButton.addEventListener('click', resetReplay);
        }
        if (speedInput) {
            speedInput.addEventListener('input', () => {
                updateReplayUi();
                if (replayState.isPlaying) {
                    startReplay();
                }
            });
        }

        updateReplayUi();
        renderReplayFrame();
    }

    window.HorizonReplay = {
        initReplayPage,
        startReplay,
        pauseReplay,
        resetReplay
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initReplayPage, { once: true });
    } else {
        initReplayPage();
    }
})();
