(function () {
    let map = null;
    let routeLayer = null;
    let markerLayer = null;
    let liveMarker = null;
    let userMarker = null;
    let hasAutoFit = false;

    function ensureMapContainer() {
        const container = document.getElementById('map');
        const statusNode = document.querySelector('[data-live-status]') || document.querySelector('.map-status');

        if (!container) {
            return null;
        }

        if (statusNode && statusNode.textContent.trim() === '') {
            statusNode.textContent = 'LOADING MAP…';
        }

        return container;
    }

    function createMap(options) {
        if (!window.L) {
            console.warn('Leaflet is not available.');
            return null;
        }

        const container = ensureMapContainer();
        if (!container) {
            return null;
        }

        if (map) {
            return map;
        }

        const defaultCenter = (window.HorizonConfig && window.HorizonConfig.defaultCenter) || [46.6, 10.4];
        const defaultZoom = (window.HorizonConfig && window.HorizonConfig.defaultZoom) || 7;

        map = window.L.map(container, {
            zoomControl: true,
            attributionControl: true,
            worldCopyJump: true
        }).setView(defaultCenter, defaultZoom);

        const tileLayer = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        });

        tileLayer.addTo(map);

        map.on('loading', () => {
            if (window.HorizonUI && typeof window.HorizonUI.setStatus === 'function') {
                window.HorizonUI.setStatus('LOADING MAP…');
            }
        });

        map.on('load', () => {
            if (window.HorizonUI && typeof window.HorizonUI.setStatus === 'function') {
                window.HorizonUI.setStatus('Map ready');
            }
        });

        map.on('tileerror', () => {
            if (window.HorizonUI && typeof window.HorizonUI.setStatus === 'function') {
                window.HorizonUI.setStatus('Map background temporarily unavailable.');
            }
        });

        routeLayer = window.L.layerGroup().addTo(map);
        markerLayer = window.L.layerGroup().addTo(map);

        return map;
    }

    function addRoute(geojson) {
        if (!map || !geojson || !window.L) {
            return null;
        }

        if (routeLayer) {
            routeLayer.clearLayers();
        }

        const route = window.L.geoJSON(geojson, {
            style: {
                color: '#f5b96b',
                weight: 4,
                opacity: 0.95
            }
        });

        route.addTo(routeLayer);
        const layers = route.getLayers ? route.getLayers() : [];
        const latlngs = layers.flatMap((layer) => layer.getLatLngs ? layer.getLatLngs().flat(Infinity) : []).filter((p) => p && Number.isFinite(p.lat));
        if (latlngs.length) {
            window.L.circleMarker(latlngs[0], { radius: 7, color: '#e8953f', fillOpacity: 1 }).bindTooltip('Piz Chavalatsch — start').addTo(routeLayer);
            window.L.circleMarker(latlngs.at(-1), { radius: 7, color: '#f1ede3', fillOpacity: 1 }).bindTooltip('Chancy — finish').addTo(routeLayer);
        }

        if (!hasAutoFit && route.getBounds && route.getBounds().isValid()) {
            map.fitBounds(route.getBounds(), { padding: [24, 24] });
            hasAutoFit = true;
        }

        return route;
    }

    function loadRoute(routePath) {
        const targetPath = routePath || (window.HorizonConfig && window.HorizonConfig.routeGeoJsonUrl) || 'data/route/horizon-route.geojson';
        if (!targetPath) {
            return Promise.resolve(null);
        }

        if (window.HorizonUI && typeof window.HorizonUI.setStatus === 'function') {
            window.HorizonUI.setStatus('Loading route…');
        }

        return fetch(targetPath, { headers: { Accept: 'application/json' } }).then((response) => {
            if (!response.ok) {
                throw new Error('Route fetch failed');
            }
            return response.json();
        }).then((geojson) => {
            addRoute(geojson);
            return geojson;
        });
    }

    function setLivePosition(coords, options) {
        if (!map || !window.L) {
            return null;
        }

        const position = Array.isArray(coords) && coords.length >= 2 ? [coords[0], coords[1]] : [coords.latitude, coords.longitude];
        if (!liveMarker) {
            liveMarker = window.L.marker(position, {
                title: options && options.label ? options.label : 'Live position',
                riseOnHover: true
            }).addTo(markerLayer);
        } else {
            liveMarker.setLatLng(position);
        }

        liveMarker.bindPopup(options && options.label ? options.label : 'Live position');

        if (options && options.animate && !hasAutoFit) {
            map.setView(position, Math.max(map.getZoom(), 9));
            hasAutoFit = true;
        }

        return liveMarker;
    }

    function setUserPosition(coords) {
        if (!map || !window.L) {
            return null;
        }

        const position = Array.isArray(coords) && coords.length >= 2 ? [coords[0], coords[1]] : [coords.latitude, coords.longitude];
        if (!userMarker) {
            userMarker = window.L.circleMarker(position, {
                radius: 7,
                color: '#4dc0ff',
                fillColor: '#4dc0ff',
                fillOpacity: 0.9
            }).addTo(markerLayer);
        } else {
            userMarker.setLatLng(position);
        }

        return userMarker;
    }

    function fitInitialView() {
        if (!map || !routeLayer) {
            return;
        }

        const bounds = routeLayer.getBounds ? routeLayer.getBounds() : null;
        if (bounds && bounds.isValid && bounds.isValid()) {
            map.fitBounds(bounds, { padding: [28, 28] });
        }
    }

    function centerLive() { if (map && liveMarker) map.setView(liveMarker.getLatLng(), Math.max(map.getZoom(), 10)); return Boolean(liveMarker); }
    function centerUser() { if (map && userMarker) map.setView(userMarker.getLatLng(), Math.max(map.getZoom(), 10)); return Boolean(userMarker); }

    window.HorizonMap = {
        createMap,
        addRoute,
        loadRoute,
        setLivePosition,
        setUserPosition,
        fitInitialView,
        centerLive,
        centerUser,
        getMap: () => map,
        getRouteLayer: () => routeLayer
    };
})();
