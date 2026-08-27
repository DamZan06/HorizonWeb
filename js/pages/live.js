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

    function renderTrack(summary, mapApi) {
        const points = summary?.points || [], latest = summary?.latestPoint;
        if (!summary || !latest) return;
        mapApi.setActualTrack(points, { progressPercent: summary.completionPercent });
        const popup = `Current position · ${new Date(latest.timestamp).toLocaleString()} · ${Number.isFinite(latest.altitude) ? Math.round(latest.altitude)+' m' : 'altitude unavailable'} · ${Number.isFinite(latest.speed) ? latest.speed.toFixed(1)+' km/h' : 'speed unavailable'}`;
        mapApi.setLivePosition([latest.latitude, latest.longitude], { label: popup, progressPercent: summary.completionPercent, follow: true });
        const values = {
            distance: `${summary.coveredDistanceKm.toFixed(1)} km`, remaining: `${summary.remainingDistanceKm.toFixed(1)} km`,
            completion: `${summary.completionPercent.toFixed(1)}%`, completionText: `${summary.completionPercent.toFixed(1)}%`,
            speed: Number.isFinite(summary.currentSpeedKmh) ? `${summary.currentSpeedKmh.toFixed(1)} km/h` : 'Not available',
            altitude: Number.isFinite(summary.currentAltitudeM) ? `${Math.round(summary.currentAltitudeM)} m` : 'Not available',
            lastUpdate: new Intl.DateTimeFormat(document.documentElement.lang || 'en', { dateStyle: 'medium', timeStyle: 'short' }).format(latest.timestamp),
            time: `${(summary.elapsedTimeMs/3600000).toFixed(1)} h`, elevation: `${Math.round(summary.actualElevationGainM)} m`,
            steps: Math.round(summary.coveredDistanceKm * 1300).toLocaleString(document.documentElement.lang || 'en'),
            liveEta: summary.completedAt ? new Intl.DateTimeFormat(document.documentElement.lang||'en',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(summary.completedAt) : summary.eta ? new Intl.DateTimeFormat(document.documentElement.lang||'en',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(summary.eta) : 'Not available'
        };
        const etaLabel = document.getElementById('liveEtaLabel');
        if (etaLabel) {
            const labels = document.documentElement.lang === 'it'
                ? { arrival: 'Arrivo', eta: 'Arrivo stimato' }
                : document.documentElement.lang === 'de'
                    ? { arrival: 'Ankunft', eta: 'Geschätzte Ankunft' }
                    : document.documentElement.lang === 'fr'
                        ? { arrival: 'Arrivée', eta: 'Arrivée estimée' }
                        : { arrival: 'Arrival', eta: 'Estimated arrival' };
            etaLabel.textContent = summary.completedAt ? labels.arrival : labels.eta;
        }
        Object.entries(values).forEach(([id, value]) => { const node = document.getElementById(id); if (node) node.textContent = value; });
        const progress = document.getElementById('progressBar'); if (progress) progress.style.width = `${summary.completionPercent}%`;
        const state = summary.state;
        const statusCopy = { live: 'LIVE', offline: 'SIGNAL DELAYED', 'not-started': 'NOT STARTED', finished: 'FINISHED' };
        const statusNode = document.querySelector('.live-status span:last-child'); if (statusNode) statusNode.textContent = `${statusCopy[state] || 'SIGNAL DELAYED'} · ${points.length.toLocaleString()} points`;
        const dot = document.querySelector('.live-status .status-dot'); if (dot) dot.className = `status-dot ${state === 'live' ? 'status-moving' : 'status-not-started'}`;
        const accessibilityStatus=document.querySelector('.map-accessibility[aria-live]');
        if(accessibilityStatus) accessibilityStatus.textContent=state==='finished'?'The expedition is complete. The full planned and travelled routes remain visible.':state==='live'?'The athlete is moving. Planned route, travelled track, athlete and visitor positions are visible on the map.':'Tracking data is available but delayed. The planned route, travelled track and latest athlete position remain visible.';
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
            if (!window.HorizonExpedition?.loadSummary) {
                return null;
            }
            const summary = await window.HorizonExpedition.loadSummary();
            renderTrack(summary, mapApi);
            return summary;
        }).catch((error) => {
            console.warn('Live point load failed:', error);
            setMapStatus('LIVE DATA TEMPORARILY UNAVAILABLE');
            return null;
        });

        Promise.all([routePromise,livePromise]).then(([routeReady,summary])=>{if(!routeReady)setMapStatus('ROUTE UNAVAILABLE');else if(!summary?.latestPoint)setMapStatus('LIVE DATA UNAVAILABLE — PLANNED ROUTE READY');else setMapStatus(`${summary.state==='live'?'MAP READY':'LIVE DATA DELAYED'} — ${summary.points.length.toLocaleString()} recorded points`);});

        const emptyValues = { distance: '0 km', remaining: `${window.HorizonConfig?.expectedDistanceKm || 500} km`, completion: '0%', speed: 'Not available', altitude: 'Not available', lastUpdate: 'Not available', completionText: '0%', time: '0 h', elevation: '0 m', steps: '0', visitorDistance: 'Not available' };
        Object.entries(emptyValues).forEach(([id, value]) => { const node = document.getElementById(id); if (node) node.textContent = value; });
        const progress = document.getElementById('progressBar'); if (progress) progress.style.width = '0%';
        document.getElementById('centerLiveBtn')?.addEventListener('click', () => { if (!mapApi.centerLive()) setMapStatus('No recent live position available.'); });
        document.getElementById('zoomInBtn')?.addEventListener('click', mapApi.zoomIn);
        document.getElementById('zoomOutBtn')?.addEventListener('click', mapApi.zoomOut);
        document.getElementById('mapLayerBtn')?.addEventListener('click', (event) => {
            const layerName = mapApi.cycleTileLayer?.();
            if (layerName) {
                event.currentTarget.title = `Map layer: ${layerName}. Click to change`;
                event.currentTarget.setAttribute('aria-label', event.currentTarget.title);
            }
        });
        const requestVisitorPosition = (center = true) => {
            if (!navigator.geolocation) { setMapStatus('Geolocation is not supported by this browser.'); return; }
            navigator.geolocation.getCurrentPosition((position) => { mapApi.setUserPosition([position.coords.latitude, position.coords.longitude]); if (center) mapApi.centerUser(); setMapStatus('Your position is shown on the planned route.'); }, () => setMapStatus('Location permission denied. The planned route remains available.'), { enableHighAccuracy:false, timeout:10000, maximumAge:60000 });
        };
        document.getElementById('centerUserBtn')?.addEventListener('click', () => requestVisitorPosition(true));
        requestVisitorPosition(false);
        const wrap = document.getElementById('map')?.closest('.map-wrap');
        document.getElementById('mapFullscreenBtn')?.addEventListener('click', async () => { if (!document.fullscreenElement) await wrap?.requestFullscreen(); else await document.exitFullscreen(); });
        document.addEventListener('fullscreenchange', () => setTimeout(() => map.invalidateSize(), 50));

        const refreshLoop = function () {
            window.HorizonExpedition?.loadSummary?.({ force:true }).then((summary) => {
                renderTrack(summary, mapApi);
                setMapStatus(`${summary.state==='live'?'MAP READY':'LIVE DATA DELAYED'} — ${summary.points.length.toLocaleString()} recorded points`);
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
