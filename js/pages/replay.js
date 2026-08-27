(function () {
    const replayState = {
        initialized: false,
        isPlaying: false,
        currentIndex: 0,
        timer: null,
        speed: 116,
        routePoints: []
    };

    function setStatus(message) {
        const statusNode = document.getElementById('replayStatus');
        if (statusNode) {
            statusNode.textContent = message;
        }
        const accessibilityNode = document.querySelector('.page-replay .map-accessibility');
        if (accessibilityNode) accessibilityNode.textContent = message;
        const mapStatusNode = document.getElementById('replayMapStatus');
        if (mapStatusNode) {
            mapStatusNode.textContent = message;
            mapStatusNode.hidden = !/^Loading (replay map|recorded journey)/.test(message);
        }
    }

    function ensureRoutePoints() { return replayState.routePoints; }

    function buildMarker() {
        if (replayState.map) return replayState.map;
        const mapContainer = document.getElementById('map');
        if (!mapContainer || !window.L) {
            return null;
        }

        const mapApi = window.HorizonMap;
        if (!mapApi?.createMap || !mapApi?.loadRoute) return null;
        const map = mapApi.createMap({ center: [46.6, 10.4], zoom: 7 });

        if (!map) {
            return null;
        }

        replayState.routePromise = mapApi.loadRoute(window.HorizonConfig?.routeGeoJsonUrl)
            .catch(() => {
                setStatus('Planned route unavailable.');
                return null;
            });
        replayState.map = map;

        return map;
    }

    function updateReplayUi() {
        const speedInput = document.getElementById('replaySpeed');
        const speedLabel = document.getElementById('replaySpeedLabel');
        const speedLevel = Number(speedInput?.value || 6);
        if (speedInput) {
            replayState.speed = Math.max(8, 220 - speedLevel * 14);
        }
        if (speedLabel) {
            speedLabel.textContent = `${speedLevel}x`;
        }
    }

    function renderReplayFrame() {
        const points = ensureRoutePoints();
        const map = buildMarker();
        const point = points[replayState.currentIndex] || points[0];

        if (map && point) {
            const mapApi = window.HorizonMap;
            const progressPercent = points.length > 1 ? replayState.currentIndex / (points.length - 1) * 100 : 0;
            replayState.marker = mapApi.setLivePosition(point, { progressPercent });
            mapApi.setActualTrack(points.slice(0, replayState.currentIndex + 1), { progressPercent });
            map.setView([point.latitude, point.longitude], Math.max(map.getZoom(), 10), { animate: false });
        }

        setStatus(points.length ? (replayState.isPlaying ? 'Playing replay' : 'Replay ready') : 'Replay will become available once journey data has been recorded.');
    }

    function startReplayTimer() {
        if (replayState.timer) window.clearInterval(replayState.timer);
        replayState.timer = window.setInterval(() => {
            const points = ensureRoutePoints();
            if (replayState.currentIndex >= points.length - 1) { pauseReplay(); setStatus('Replay complete'); return; }
            replayState.currentIndex += 1;
            renderReplayFrame();
        }, replayState.speed);
    }

    function toggleReplay() {
        if (!replayState.routePoints.length) return;
        if (replayState.isPlaying) {
            pauseReplay();
            return;
        }
        replayState.isPlaying = true;
        updatePlayButton();
        setStatus('Playing replay');
        startReplayTimer();
    }

    function pauseReplay() {
        replayState.isPlaying = false;
        if (replayState.timer) {
            window.clearInterval(replayState.timer);
            replayState.timer = null;
        }
        updatePlayButton();
        setStatus('Replay paused');
    }

    function updatePlayButton() {
        const button = document.getElementById('replayPlay');
        if (!button) return;
        const playing = replayState.isPlaying;
        button.title = playing ? 'Pause replay' : 'Start replay';
        button.setAttribute('aria-label', button.title);
        button.innerHTML = playing
            ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3v14H7V5Zm7 0h3v14h-3V5Z"/></svg>'
            : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7L8 5Z"/></svg>';
    }

    function resetReplay() {
        replayState.isPlaying = false;
        if (replayState.timer) {
            window.clearInterval(replayState.timer);
            replayState.timer = null;
        }
        replayState.currentIndex = 0;
        renderReplayFrame();
        updatePlayButton();
        setStatus('Replay ready');
    }

    function initReplayPage() {
        if (replayState.initialized) {
            return;
        }
        replayState.initialized = true;

        const playButton = document.getElementById('replayPlay');
        const resetButton = document.getElementById('replayReset');
        const speedInput = document.getElementById('replaySpeed');

        if (playButton) playButton.addEventListener('click', toggleReplay);
        if (resetButton) {
            resetButton.addEventListener('click', resetReplay);
        }
        if (speedInput) {
            speedInput.addEventListener('input', () => {
                updateReplayUi();
                if (replayState.isPlaying) {
                    startReplayTimer();
                }
            });
        }

        updateReplayUi();
        buildMarker();
        const controls = [playButton, resetButton, speedInput];
        controls.forEach((control) => { if (control) control.disabled = true; });
        setStatus('Loading recorded journey…');
        const routePromise = replayState.routePromise || Promise.resolve();
        Promise.all([routePromise, window.HorizonFirebase?.fetchLiveTrack?.()]).then(([, points = []]) => {
            replayState.routePoints = points.map((point) => ({ latitude: point.latitude, longitude: point.longitude }));
            controls.forEach((control) => { if (control) control.disabled = !replayState.routePoints.length; });
            renderReplayFrame();
            updatePlayButton();
        }).catch(() => setStatus('Replay is temporarily unavailable.'));

        document.getElementById('replayMapZoomInBtn')?.addEventListener('click', window.HorizonMap.zoomIn);
        document.getElementById('replayMapZoomOutBtn')?.addEventListener('click', window.HorizonMap.zoomOut);
        document.getElementById('replayMapCenterBtn')?.addEventListener('click', () => {
            const point = replayState.routePoints[replayState.currentIndex];
            if (point) window.HorizonMap.getMap()?.setView([point.latitude, point.longitude], Math.max(window.HorizonMap.getMap().getZoom(), 10));
        });
        document.getElementById('replayMapFullscreenBtn')?.addEventListener('click', async () => {
            const wrap = document.querySelector('.page-replay .map-wrap');
            if (!document.fullscreenElement) await wrap?.requestFullscreen();
            else await document.exitFullscreen();
        });
        document.getElementById('replayMapLayerBtn')?.addEventListener('click', (event) => {
            const layerName = window.HorizonMap.cycleTileLayer?.();
            if (layerName) {
                event.currentTarget.title = `Map layer: ${layerName}`;
                event.currentTarget.setAttribute('aria-label', event.currentTarget.title);
            }
        });
    }

    window.HorizonReplay = {
        initReplayPage,
        startReplay: toggleReplay,
        pauseReplay,
        resetReplay
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initReplayPage, { once: true });
    } else {
        initReplayPage();
    }
})();
