(function () {
    let map = null;
    let routeLayer = null;
    let markerLayer = null;
    let liveMarker = null;
    let userMarker = null;
    let trackLayer = null;
    let hasAutoFit = false;
    let activeTileLayer = null;
    let startMarker = null;
    let finishMarker = null;
    let plannedRouteBounds = null;
    let tileLayers = null;
    let activeTileKey = 'Standard';

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
            zoomControl: false,
            attributionControl: true,
            worldCopyJump: true
        }).setView(defaultCenter, defaultZoom);

        tileLayers = {
            Standard: window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19, attribution:'&copy; OpenStreetMap contributors' }),
            Satellite: window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom:19, attribution:'Tiles &copy; Esri' }),
            Topographic: window.L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { maxZoom:17, attribution:'Map data &copy; OpenStreetMap, SRTM | Map style &copy; OpenTopoMap' })
        };
        activeTileLayer = tileLayers.Standard.addTo(map);

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

        [['plannedRoute',410],['actualTrack',420],['routeMarkers',430],['currentPosition',440],['userPosition',450]].forEach(([name,z])=>{map.createPane(name);map.getPane(name).style.zIndex=z;});
        routeLayer = window.L.layerGroup().addTo(map);
        markerLayer = window.L.layerGroup().addTo(map);
        const legend=window.L.control({position:'bottomright'});legend.onAdd=()=>{const node=window.L.DomUtil.create('div','horizon-map-legend');node.innerHTML='<span><i class="legend-planned"></i><b data-map-legend="planned">Planned route</b></span><span><i class="legend-actual"></i><b data-map-legend="actual">Actual track</b></span>';return node;};legend.addTo(map);
        const translateLegend=()=>{const values={en:['Planned route','Actual track'],it:['Percorso previsto','Traccia effettiva'],de:['Geplante Route','Tatsächliche Strecke'],fr:['Itinéraire prévu','Tracé réel']}[document.documentElement.lang]||['Planned route','Actual track'];document.querySelectorAll('[data-map-legend]').forEach((n,i)=>n.textContent=values[i]);};document.addEventListener('horizon:languagechange',translateLegend);translateLegend();

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
                color: '#00e5ff',
                weight: 7,
                opacity: 1,
                dashArray: '14 10', pane:'plannedRoute', className:'horizon-planned-route'
            }
        });

        route.addTo(routeLayer);
        const layers = route.getLayers ? route.getLayers() : [];
        const latlngs = layers.flatMap((layer) => layer.getLatLngs ? layer.getLatLngs().flat(Infinity) : []).filter((p) => p && Number.isFinite(p.lat));
        if (latlngs.length) {
            const startIcon=window.L.divIcon({className:'horizon-start-icon',html:'<span aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m9 7 8 5-8 5V7Z"/></svg></span>',iconSize:[46,54],iconAnchor:[23,51]});
            startMarker=window.L.marker(latlngs[0],{pane:'routeMarkers',icon:startIcon,title:'Start'}).bindTooltip('Start').addTo(routeLayer);
            const flagIcon=window.L.icon({iconUrl:'assets/icons/finish-flag.gif',iconSize:[64,64],iconAnchor:[10,61],popupAnchor:[22,-52],className:'horizon-finish-icon'});
            finishMarker=window.L.marker(latlngs.at(-1),{pane:'routeMarkers',icon:flagIcon,title:'Finish'}).bindTooltip('Finish').addTo(routeLayer);
        }

        if (!hasAutoFit && route.getBounds && route.getBounds().isValid()) {
            plannedRouteBounds = route.getBounds();
            map.fitBounds(plannedRouteBounds, { padding: [40, 40] });
            hasAutoFit = true;
        } else if (route.getBounds && route.getBounds().isValid()) {
            plannedRouteBounds = route.getBounds();
        }

        return route;
    }

    function loadRoute(routePath) {
        const targetPath = routePath || (window.HorizonConfig && window.HorizonConfig.routeGeoJsonUrl);
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
            const icon=window.L.divIcon({className:'horizon-current-icon',html:'<span aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M13.5 5.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM9.7 9l2.1-1.2 2.4 1.4 2.3 3.1-1.7 1.1-2-2.6-1.1.7 2.1 2.2-3.5 5.8-1.8-1.1 2.2-3.8-1.8-1.8-1.5 2.5-1.8-1 2.2-3.7A4 4 0 0 1 9.7 9Z"/></svg></span>',iconSize:[46,46],iconAnchor:[23,23]});
            liveMarker = window.L.marker(position, { pane:'currentPosition',icon,
                title: options && options.label ? options.label : 'Live position',
                riseOnHover: true
            }).addTo(markerLayer);
        } else {
            liveMarker.setLatLng(position);
        }

        liveMarker.bindPopup(options && options.label ? options.label : 'Live position');
        liveMarker.bindTooltip('Athlete');

        if (options && options.animate && !hasAutoFit) {
            map.setView(position, Math.max(map.getZoom(), 9));
            hasAutoFit = true;
        }

        return liveMarker;
    }

    function setActualTrack(points) {
        if (!map || !window.L) return null;
        const coords = (points || []).map((point) => [Number(point.latitude), Number(point.longitude)]).filter((point) => point.every(Number.isFinite));
        if (coords.length < 2) return null;
        if (trackLayer) trackLayer.setLatLngs(coords);
        else trackLayer = window.L.polyline(coords,{pane:'actualTrack',color:'#ff2d95',weight:9,opacity:1,lineCap:'round',lineJoin:'round',className:'horizon-actual-track'}).addTo(map);
        return trackLayer;
    }

    function setUserPosition(coords) {
        if (!map || !window.L) {
            return null;
        }

        const position = Array.isArray(coords) && coords.length >= 2 ? [coords[0], coords[1]] : [coords.latitude, coords.longitude];
        if (!userMarker) {
            const icon=window.L.divIcon({className:'horizon-user-icon',html:'<span aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M11 2h2v3.1A7 7 0 0 1 18.9 11H22v2h-3.1a7 7 0 0 1-5.9 5.9V22h-2v-3.1A7 7 0 0 1 5.1 13H2v-2h3.1A7 7 0 0 1 11 5.1V2Zm1 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 2.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z"/></svg></span>',iconSize:[44,44],iconAnchor:[22,22]});
            userMarker = window.L.marker(position,{pane:'userPosition',icon,title:'My position'}).bindTooltip('My position').addTo(markerLayer);
        } else {
            userMarker.setLatLng(position);
        }

        return userMarker;
    }

    function fitInitialView() {
        if (!map || !plannedRouteBounds) {
            return;
        }
        map.fitBounds(plannedRouteBounds, { padding: [40, 40] });
    }

    function centerLive() { if (map && liveMarker) map.setView(liveMarker.getLatLng(), Math.max(map.getZoom(), 10)); return Boolean(liveMarker); }
    function centerUser() { if (map && userMarker) map.setView(userMarker.getLatLng(), Math.max(map.getZoom(), 10)); return Boolean(userMarker); }
    function zoomIn() { if (map) map.zoomIn(); }
    function zoomOut() { if (map) map.zoomOut(); }
    function cycleTileLayer() {
        if (!map || !tileLayers) return null;
        const keys = Object.keys(tileLayers);
        const nextKey = keys[(keys.indexOf(activeTileKey) + 1) % keys.length];
        if (activeTileLayer) map.removeLayer(activeTileLayer);
        activeTileKey = nextKey;
        activeTileLayer = tileLayers[activeTileKey].addTo(map);
        return activeTileKey;
    }

    window.HorizonMap = {
        createMap,
        addRoute,
        loadRoute,
        setLivePosition,
        setActualTrack,
        setUserPosition,
        fitInitialView,
        centerLive,
        centerUser,
        zoomIn,
        zoomOut,
        cycleTileLayer,
        getMap: () => map,
        getRouteLayer: () => routeLayer,
        getActualTrack:()=>trackLayer,
        getLiveMarker:()=>liveMarker,
        getUserMarker:()=>userMarker,
        getStartMarker:()=>startMarker,
        getFinishMarker:()=>finishMarker
    };
})();
