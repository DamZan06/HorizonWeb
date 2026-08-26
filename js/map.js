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

        const tileLayers = {
            Standard: window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19, attribution:'&copy; OpenStreetMap contributors' }),
            Satellite: window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom:19, attribution:'Tiles &copy; Esri' }),
            Topographic: window.L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { maxZoom:17, attribution:'Map data &copy; OpenStreetMap, SRTM | Map style &copy; OpenTopoMap' })
        };
        activeTileLayer = tileLayers.Standard.addTo(map);
        window.L.control.layers(tileLayers, null, { position:'topright', collapsed:true }).addTo(map);

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
                color: '#eadfc7',
                weight: 3,
                opacity: 0.72,
                dashArray: '8 7', pane:'plannedRoute'
            }
        });

        route.addTo(routeLayer);
        const layers = route.getLayers ? route.getLayers() : [];
        const latlngs = layers.flatMap((layer) => layer.getLatLngs ? layer.getLatLngs().flat(Infinity) : []).filter((p) => p && Number.isFinite(p.lat));
        if (latlngs.length) {
            startMarker=window.L.circleMarker(latlngs[0],{pane:'routeMarkers',radius:7,color:'#efe3c4',weight:3,fillColor:'#07100f',fillOpacity:1,className:'horizon-start-marker'}).bindTooltip('Start').addTo(routeLayer);
            const flagIcon=window.L.icon({iconUrl:'assets/icons/finish-flag.gif',iconSize:[52,52],iconAnchor:[7,50],popupAnchor:[18,-44],className:'horizon-finish-icon'});
            finishMarker=window.L.marker(latlngs.at(-1),{pane:'routeMarkers',icon:flagIcon,title:'Finish'}).bindTooltip('Finish').addTo(routeLayer);
        }

        if (!hasAutoFit && route.getBounds && route.getBounds().isValid()) {
            map.fitBounds(route.getBounds(), { padding: [70, 70] });
            hasAutoFit = true;
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
            const icon=window.L.divIcon({className:'horizon-current-icon',html:'<span></span>',iconSize:[24,24],iconAnchor:[12,12]});
            liveMarker = window.L.marker(position, { pane:'currentPosition',icon,
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

    function setActualTrack(points) {
        if (!map || !window.L) return null;
        const coords = (points || []).map((point) => [Number(point.latitude), Number(point.longitude)]).filter((point) => point.every(Number.isFinite));
        if (coords.length < 2) return null;
        if (trackLayer) trackLayer.setLatLngs(coords);
        else trackLayer = window.L.polyline(coords,{pane:'actualTrack',color:'#e8953f',weight:5,opacity:1,lineCap:'round'}).addTo(map);
        return trackLayer;
    }

    function setUserPosition(coords) {
        if (!map || !window.L) {
            return null;
        }

        const position = Array.isArray(coords) && coords.length >= 2 ? [coords[0], coords[1]] : [coords.latitude, coords.longitude];
        if (!userMarker) {
            userMarker = window.L.circleMarker(position, {
                pane:'userPosition',radius: 7,
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
        setActualTrack,
        setUserPosition,
        fitInitialView,
        centerLive,
        centerUser,
        getMap: () => map,
        getRouteLayer: () => routeLayer,
        getActualTrack:()=>trackLayer,getLiveMarker:()=>liveMarker,getStartMarker:()=>startMarker,getFinishMarker:()=>finishMarker
    };
})();
