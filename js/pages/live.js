(function () {
    function getMapStatusNode() {
        return document.querySelector('[data-live-status]') || document.querySelector('.map-status') || document.body;
    }

    function setMapStatus(message) {
        const node = getMapStatusNode();
        if (!node) {
            return;
        }

        if (node.dataset && 'liveStatus' in node.dataset) {
            node.dataset.liveStatus = message;
        }

        if (node.classList && node.classList.contains('map-status')) {
            node.textContent = message;
            return;
        }

        if (node !== document.body) {
            node.textContent = message;
        }
    }

    function renderTrack(points, mapApi) {
        const summary = window.HorizonStats?.summarize(points, window.HorizonConfig?.expectedDistanceKm || 500);
        const latest = points.at(-1);
        if (!summary || !latest) return;
        mapApi.setActualTrack(points);
        mapApi.setLivePosition([latest.latitude, latest.longitude], { label: 'Latest recorded position' });
        const values = {
            distance: `${summary.coveredKm.toFixed(1)} km`, remaining: `${summary.remainingKm.toFixed(1)} km`,
            completion: `${summary.completion.toFixed(1)}%`, completionText: `${summary.completion.toFixed(1)}%`,
            speed: Number.isFinite(summary.currentSpeed) ? `${summary.currentSpeed.toFixed(1)} km/h` : 'Not available',
            altitude: Number.isFinite(latest.altitude) ? `${Math.round(latest.altitude)} m` : 'Not available',
            lastUpdate: new Intl.DateTimeFormat(document.documentElement.lang || 'en', { dateStyle: 'medium', timeStyle: 'short' }).format(latest.timestamp),
            time: `${summary.elapsedHours.toFixed(1)} h`, elevation: `${Math.round(summary.elevationGainM)} m`,
            steps: Math.round(summary.coveredKm * 1300).toLocaleString(document.documentElement.lang || 'en')
        };
        Object.entries(values).forEach(([id, value]) => { const node = document.getElementById(id); if (node) node.textContent = value; });
        const progress = document.getElementById('progressBar'); if (progress) progress.style.width = `${summary.completion}%`;
        const state = window.HorizonStatus?.getExpeditionState({ latestPointTimestamp: latest.timestamp });
        const statusCopy = { live: 'LIVE', offline: 'SIGNAL DELAYED', 'not-started': 'NOT STARTED', finished: 'FINISHED' };
        const statusNode = document.querySelector('.live-status span:last-child'); if (statusNode) statusNode.textContent = `${statusCopy[state] || 'SIGNAL DELAYED'} · ${points.length.toLocaleString()} points`;
        const dot = document.querySelector('.live-status .status-dot'); if (dot) dot.className = `status-dot ${state === 'live' ? 'status-moving' : 'status-not-started'}`;
        setMapStatus(`Map ready — ${points.length.toLocaleString()} recorded points`);
    }

    function initLivePage() {
        if (window.HorizonLivePage && window.HorizonLivePage.initialized) {
            return;
        }

        const mapApi = window.HorizonMap;
        if (!mapApi || typeof mapApi.createMap !== 'function') {
            return;
        }

        const map = mapApi.createMap({
            center: (window.HorizonConfig && window.HorizonConfig.defaultCenter) || [46.6, 10.4],
            zoom: (window.HorizonConfig && window.HorizonConfig.defaultZoom) || 7
        });

        if (!map) {
            return;
        }

        const canonicalRoutePath = (window.HorizonConfig && window.HorizonConfig.routeGeoJsonUrl) || 'data/route/horizon-route.geojson';
        const routePromise = mapApi.loadRoute ? mapApi.loadRoute(canonicalRoutePath).then(() => {
            setMapStatus('Map ready — planned route visible');
            return true;
        }).catch((error) => {
            console.warn('Route load failed:', error);
            setMapStatus('PLANNED ROUTE COULD NOT BE LOADED');
            return false;
        }) : Promise.resolve(false);

        const livePromise = Promise.resolve().then(async () => {
            if (!window.HorizonFirebase || typeof window.HorizonFirebase.fetchLiveTrack !== 'function') {
                return null;
            }
            const points = await window.HorizonFirebase.fetchLiveTrack();
            renderTrack(points, mapApi);
            return points.at(-1) || null;
        }).catch((error) => {
            console.warn('Live point load failed:', error);
            setMapStatus('LIVE DATA TEMPORARILY UNAVAILABLE');
            return null;
        });

        Promise.all([routePromise, livePromise]).catch(() => {
            setMapStatus('MAP STATE UNAVAILABLE');
        });

        const emptyValues = { distance: '0 km', remaining: `${window.HorizonConfig?.expectedDistanceKm || 500} km`, completion: '0%', speed: 'Not available', altitude: 'Not available', lastUpdate: 'Not available', completionText: '0%', time: '0 h', elevation: '0 m', steps: '0', visitorDistance: 'Not available' };
        Object.entries(emptyValues).forEach(([id, value]) => { const node = document.getElementById(id); if (node) node.textContent = value; });
        const progress = document.getElementById('progressBar'); if (progress) progress.style.width = '0%';
        document.getElementById('centerLiveBtn')?.addEventListener('click', () => { if (!mapApi.centerLive()) setMapStatus('No recent live position available.'); });
        document.getElementById('centerUserBtn')?.addEventListener('click', () => {
            if (!navigator.geolocation) { setMapStatus('Geolocation is not supported by this browser.'); return; }
            navigator.geolocation.getCurrentPosition((position) => { mapApi.setUserPosition([position.coords.latitude, position.coords.longitude]); mapApi.centerUser(); setMapStatus('Your position is shown on the planned route.'); }, () => setMapStatus('Location permission denied. The planned route remains available.'));
        });
        const wrap = document.getElementById('map')?.closest('.map-wrap');
        document.getElementById('mapFullscreenBtn')?.addEventListener('click', async () => { if (!document.fullscreenElement) await wrap?.requestFullscreen(); else await document.exitFullscreen(); });
        document.addEventListener('fullscreenchange', () => setTimeout(() => map.invalidateSize(), 50));

        const refreshLoop = function () {
            window.HorizonFirebase && typeof window.HorizonFirebase.fetchLiveTrack === 'function' && window.HorizonFirebase.fetchLiveTrack({ force: true }).then((points) => {
                renderTrack(points, mapApi);
            }).catch(() => {
                setMapStatus('LIVE DATA TEMPORARILY UNAVAILABLE');
            });
        };

        window.HorizonLivePage = {
            initialized: true,
            init: initLivePage,
            map,
            refreshLoop,
            renderTrack,
            refreshTimer: window.setInterval(refreshLoop, 20000)
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLivePage, { once: true });
    } else {
        initLivePage();
    }
})();
