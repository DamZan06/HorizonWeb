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

        const routePromise = mapApi.loadRoute ? mapApi.loadRoute('data/horizon-route.geojson').catch((error) => {
            console.warn('Route load failed:', error);
            setMapStatus('PLANNED ROUTE COULD NOT BE LOADED');
        }) : Promise.resolve();

        const livePromise = Promise.resolve().then(async () => {
            if (!window.HorizonFirebase || typeof window.HorizonFirebase.fetchLatestLivePoint !== 'function') {
                return null;
            }

            const point = await window.HorizonFirebase.fetchLatestLivePoint();
            if (point && point.latitude != null && point.longitude != null) {
                mapApi.setLivePosition([point.latitude, point.longitude], { animate: true, label: 'Live position' });
                if (window.HorizonUI && typeof window.HorizonUI.setStatus === 'function') {
                    window.HorizonUI.setStatus('Live position updated');
                }
            }
            return point;
        }).catch((error) => {
            console.warn('Live point load failed:', error);
            setMapStatus('LIVE DATA TEMPORARILY UNAVAILABLE');
            return null;
        });

        Promise.allSettled([routePromise, livePromise]).finally(() => {
            setMapStatus('Map ready');
        });

        const refreshLoop = function () {
            window.HorizonFirebase && typeof window.HorizonFirebase.fetchLatestLivePoint === 'function' && window.HorizonFirebase.fetchLatestLivePoint().then((point) => {
                if (point && point.latitude != null && point.longitude != null) {
                    mapApi.setLivePosition([point.latitude, point.longitude], { animate: true, label: 'Live position' });
                    if (window.HorizonUI && typeof window.HorizonUI.setStatus === 'function') {
                        window.HorizonUI.setStatus('Live position refreshed');
                    }
                }
            }).catch(() => {
                setMapStatus('LIVE DATA TEMPORARILY UNAVAILABLE');
            });
        };

        window.HorizonLivePage = {
            initialized: true,
            init: initLivePage,
            map,
            refreshLoop,
            refreshTimer: window.setInterval(refreshLoop, 20000)
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLivePage, { once: true });
    } else {
        initLivePage();
    }
})();
