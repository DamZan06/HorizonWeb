(function () {
    const tr = (key, fallback) => window.HorizonI18n?.t?.(key) || fallback || key;
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

    function renderTrack(summary, mapApi, options = {}) {
        if (!summary) return;
        const latest = summary.latestPoint;
        const config = window.HorizonConfig || {};
        // Mirrors home.js's fallback so both pages show the same remaining/distance figures before tracking starts.
        const values = summary.started ? {
            distance: `${summary.coveredDistanceKm.toFixed(1)} km`, remaining: `${summary.remainingDistanceKm.toFixed(1)} km`,
            completion: `${summary.completionPercent.toFixed(1)}%`, completionText: `${summary.completionPercent.toFixed(1)}%`,
            speed: Number.isFinite(summary.currentSpeedKmh) ? `${summary.currentSpeedKmh.toFixed(1)} km/h` : tr("common.notAvailable", "Not available"),
            altitude: Number.isFinite(summary.currentAltitudeM) ? `${Math.round(summary.currentAltitudeM)} m` : tr("common.notAvailable", "Not available"),
            lastUpdate: new Intl.DateTimeFormat(document.documentElement.lang || 'en', { dateStyle: 'medium', timeStyle: 'short' }).format(latest.timestamp),
            time: `${(summary.elapsedTimeMs/3600000).toFixed(1)} h`, elevation: `${Math.round(summary.actualElevationGainM)} m`,
            steps: Math.round(summary.coveredDistanceKm * 1300).toLocaleString(document.documentElement.lang || 'en')
        } : {
            distance: '0 km', remaining: `${summary.plannedDistanceKm || config.expectedDistanceKm || 500} km`, completion: '0%', completionText: '0%',
            speed: tr("common.notAvailable", "Not available"), altitude: tr("common.notAvailable", "Not available"), lastUpdate: tr("common.notAvailable", "Not available"), time: '0 h', elevation: '0 m', steps: '0'
        };
        values.liveEta = summary.completedAt ? new Intl.DateTimeFormat(document.documentElement.lang||'en',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(summary.completedAt) : summary.eta ? new Intl.DateTimeFormat(document.documentElement.lang||'en',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(summary.eta) : tr("common.notAvailable", "Not available");
        const etaLabel = document.getElementById('liveEtaLabel');
        if (etaLabel) {
            etaLabel.textContent = summary.completedAt ? tr("common.arrival", "Arrival") : tr("common.estimatedArrival", "Estimated arrival");
        }
        Object.entries(values).forEach(([id, value]) => { const node = document.getElementById(id); if (node) node.textContent = value; });
        const progress = document.getElementById('progressBar'); if (progress) progress.style.width = `${summary.completionPercent}%`;
        const state = summary.state;
        const statusNode = document.getElementById('liveStatusLabel'); if (statusNode) statusNode.textContent = window.HorizonStatus?.getStateCopy?.(state)?.[0] || tr("common.trackerOffline", "Tracker offline");
        const dot = document.querySelector('.live-status .status-dot'); if (dot) dot.className = `status-dot ${state === 'live' ? 'status-moving' : 'status-not-started'}`;

        if (!latest) return;
        mapApi.setActualTrack(summary.points || [], { progressPercent: summary.completionPercent });
        const popup = `<strong>${window.HorizonStatus?.getStateCopy?.(state)?.[0] || tr("common.livePosition", "Live position")}</strong><br>${new Date(latest.timestamp).toLocaleString(document.documentElement.lang)}<br>${Number.isFinite(latest.altitude) ? Math.round(latest.altitude)+' m' : tr("live.altitudeUnavailable", "Altitude unavailable")} · ${Number.isFinite(latest.speed) ? latest.speed.toFixed(1)+' km/h' : tr("live.speedUnavailable", "Speed unavailable")}<br><a class="runner-directions-btn" href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${latest.latitude},${latest.longitude}`)}" target="_blank" rel="noopener noreferrer">${tr("live.navigateToAthlete", "Navigate to athlete")}</a>`;
        mapApi.setLivePosition([latest.latitude, latest.longitude], { label: popup, progressPercent: summary.completionPercent, follow: options.follow === true });
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
            setMapStatus(tr("live.mapReadyPlannedRouteVisible", "Map ready — planned route visible"));
            return true;
        }).catch((error) => {
            console.warn('Route load failed:', error);
            setMapStatus(tr("live.plannedRouteCouldNotBeLoaded", "PLANNED ROUTE COULD NOT BE LOADED"));
            return false;
        }) : Promise.resolve(false);

        const livePromise = Promise.resolve().then(async () => {
            if (!window.HorizonExpedition?.loadSummary) {
                return null;
            }
            const summary = await window.HorizonExpedition.loadSummary();
            renderTrack(summary, mapApi, { follow: true });
            return summary;
        }).catch((error) => {
            console.warn('Live point load failed:', error);
            setMapStatus(tr("live.liveDataTemporarilyUnavailable", "LIVE DATA TEMPORARILY UNAVAILABLE"));
            return null;
        });

        Promise.all([routePromise,livePromise]).then(([routeReady,summary])=>{if(!routeReady)setMapStatus(tr("live.routeUnavailable", "ROUTE UNAVAILABLE"));else if(!summary?.latestPoint)setMapStatus(tr("live.liveDataUnavailablePlannedRouteReady", "LIVE DATA UNAVAILABLE — PLANNED ROUTE READY"));else setMapStatus(`${tr(summary.state==='live'?'live.mapReady':'live.liveDataDelayed',summary.state==='live'?'MAP READY':'LIVE DATA DELAYED')} — ${summary.points.length.toLocaleString()} ${tr("live.recordedPoints", "recorded points")}`);});

        const emptyValues = { distance: '0 km', remaining: `${window.HorizonConfig?.expectedDistanceKm || 500} km`, completion: '0%', speed: tr("common.notAvailable", "Not available"), altitude: tr("common.notAvailable", "Not available"), lastUpdate: tr("common.notAvailable", "Not available"), completionText: '0%', time: '0 h', elevation: '0 m', steps: '0', visitorDistance: tr("common.notAvailable", "Not available") };
        Object.entries(emptyValues).forEach(([id, value]) => { const node = document.getElementById(id); if (node) node.textContent = value; });
        const progress = document.getElementById('progressBar'); if (progress) progress.style.width = '0%';
        document.getElementById('centerLiveBtn')?.addEventListener('click', () => { if (!mapApi.centerLive()) setMapStatus(tr("live.noRecentLivePositionAvailable", "No recent live position available.")); });
        document.getElementById('zoomInBtn')?.addEventListener('click', mapApi.zoomIn);
        document.getElementById('zoomOutBtn')?.addEventListener('click', mapApi.zoomOut);
        document.getElementById('mapLayerBtn')?.addEventListener('click', (event) => {
            const layerName = mapApi.cycleTileLayer?.();
            if (layerName) {
                const layerKey = `map.${String(layerName).toLowerCase()}`;
                event.currentTarget.title = `${tr("common.mapLayer", "Map layer")}: ${tr(layerKey, layerName)}. ${tr("live.clickToChange", "Click to change")}`;
                event.currentTarget.setAttribute('aria-label', event.currentTarget.title);
            }
        });
        const requestVisitorPosition = (center = true) => {
            if (!navigator.geolocation) { setMapStatus(tr("live.geolocationIsNotSupportedByThisBrowser", "Geolocation is not supported by this browser.")); return; }
            navigator.geolocation.getCurrentPosition((position) => { mapApi.setUserPosition([position.coords.latitude, position.coords.longitude]); if (center) mapApi.centerUser(); setMapStatus(tr("live.yourPositionIsShownOnThePlannedRoute", "Your position is shown on the planned route.")); }, () => setMapStatus(tr("live.locationPermissionDeniedThePlannedRouteRemainsAvailable", "Location permission denied. The planned route remains available.")), { enableHighAccuracy:false, timeout:10000, maximumAge:60000 });
        };
        document.getElementById('centerUserBtn')?.addEventListener('click', () => requestVisitorPosition(true));
        requestVisitorPosition(false);
        const wrap = document.getElementById('map')?.closest('.map-wrap');
        document.getElementById('mapFullscreenBtn')?.addEventListener('click', async () => { if (!document.fullscreenElement) await wrap?.requestFullscreen(); else await document.exitFullscreen(); });
        document.addEventListener('fullscreenchange', () => setTimeout(() => map.invalidateSize(), 50));

        const refreshLoop = function () {
            window.HorizonExpedition?.loadSummary?.({ force:true }).then((summary) => {
                renderTrack(summary, mapApi);
                setMapStatus(`${tr(summary.state==='live'?'live.mapReady':'live.liveDataDelayed',summary.state==='live'?'MAP READY':'LIVE DATA DELAYED')} — ${summary.points.length.toLocaleString()} ${tr("live.recordedPoints", "recorded points")}`);
            }).catch(() => {
                setMapStatus(tr("live.liveDataTemporarilyUnavailable", "LIVE DATA TEMPORARILY UNAVAILABLE"));
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
        document.addEventListener('horizon:languagechange', refreshLoop);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLivePage, { once: true });
    } else {
        initLivePage();
    }
})();
