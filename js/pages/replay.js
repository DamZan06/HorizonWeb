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

    function ensureRoutePoints() { return replayState.routePoints; }

    function buildMarker() {
        if (replayState.map) return replayState.map;
        const mapContainer = document.getElementById('map');
        if (!mapContainer || !window.L) {
            return null;
        }

        const map = window.L.map(mapContainer).setView([46.8, 8.2], 7);
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);

        if (!map) {
            return null;
        }

        const routePath = (window.HorizonConfig && window.HorizonConfig.routeGeoJsonUrl) || 'data/route/horizon-route.geojson';
        fetch(routePath).then((response) => { if (!response.ok) throw new Error('route'); return response.json(); }).then((data) => {
            const layer = window.L.geoJSON(data, { style: { color: '#eadfc7', weight: 3, opacity: .72, dashArray: '9 8' } }).addTo(map); map.fitBounds(layer.getBounds(), { padding: [20,20] });
            const parts = layer.getLayers().flatMap((item) => item.getLatLngs ? item.getLatLngs().flat(Infinity) : []).filter((point) => point?.lat);
            if (parts.length) { const icon=window.L.divIcon({className:'horizon-finish-icon',html:'<span class="finish-pole"></span><span class="finish-fabric"></span>',iconSize:[38,42],iconAnchor:[4,40]}); window.L.marker(parts.at(-1),{icon,title:'Chancy — finish'}).bindTooltip('Chancy — finish · west').addTo(map); }
        }).catch(() => setStatus('Planned route unavailable.'));
        replayState.map = map;

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

        if (map && point) {
            if (!replayState.marker) replayState.marker = window.L.marker(point).addTo(map);
            else replayState.marker.setLatLng(point);
        }

        setStatus(points.length ? (replayState.isPlaying ? 'Playing replay' : 'Replay ready') : 'Replay will become available once journey data has been recorded.');
    }

    function startReplay() {
        if (!replayState.routePoints.length) return;
        if (replayState.timer) {
            window.clearInterval(replayState.timer);
        }

        replayState.isPlaying = true;
        setStatus('Playing replay');
        replayState.timer = window.setInterval(() => {
            const points = ensureRoutePoints();
            if (replayState.currentIndex >= points.length - 1) { pauseReplay(); setStatus('Replay complete'); return; }
            replayState.currentIndex += 1;
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
        buildMarker();
        const controls = [playButton, pauseButton, resetButton, speedInput];
        controls.forEach((control) => { if (control) control.disabled = true; });
        setStatus('Loading recorded journey…');
        window.HorizonFirebase?.fetchLiveTrack?.().then((points) => {
            replayState.routePoints = points.map((point) => [point.latitude, point.longitude]);
            if (replayState.routePoints.length > 1) window.L.polyline(replayState.routePoints, { color:'#e8953f', weight:4, opacity:.9 }).addTo(replayState.map);
            controls.forEach((control) => { if (control) control.disabled = !replayState.routePoints.length; });
            renderReplayFrame();
        }).catch(() => setStatus('Replay is temporarily unavailable.'));
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
