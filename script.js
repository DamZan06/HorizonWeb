const firebaseURL = "https://northline-a4eaa-default-rtdb.europe-west1.firebasedatabase.app/livetrack/points.json";
const defaultCenter = [46.0, 8.9];
const defaultZoom = 12;
let mapInstance = null;
let routeLine = null;
let startMarker = null;
let finishMarker = null;
let liveMarker = null;
let visitorMarker = null;
let chartInstances = {};
let activeLayer = null;
let gpxTotalKm = null;
let gpxCoords = [];
let gpxLoadPromise = null;
let latestLiveCoord = null;
let latestVisitorCoord = null;
function getTileProviders() {
    if (typeof L === 'undefined') return {};
    return {
        osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }),
        satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: '© Esri' }),
        topo: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { attribution: '© OpenTopoMap', maxZoom: 17, maxNativeZoom: 17 })
    };
}
function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
}
function formatRelativeDate(timestamp) {
    const date = new Date(timestamp);
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s fa`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m fa`;
    return `${Math.floor(diff / 3600)}h fa`;
}
function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('northline-theme', theme);
}
function initializeTheme() {
    const saved = localStorage.getItem('northline-theme');
    setTheme(saved === 'light' ? 'light' : 'dark');
    document.getElementById('themeToggle')?.addEventListener('click', () => {
        setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
    });
}
function buildNav() {
    const tileProviders = getTileProviders();
    document.querySelectorAll('[data-layer]').forEach(button => button.addEventListener('click', () => {
        const key = button.dataset.layer;
        if (!tileProviders[key] || !mapInstance) return;
        activeLayer?.remove();
        activeLayer = tileProviders[key].addTo(mapInstance);
    }));
}
async function fetchPoints() {
    try {
        const response = await fetch(firebaseURL);
        const data = await response.json();
        if (!data) return [];
        return Object.values(data)
            .filter(point => point && point.coordinate && Number.isFinite(point.coordinate.lat) && Number.isFinite(point.coordinate.lon) && point.distanza)
            .sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    } catch (error) {
        console.warn('Impossibile leggere i dati live:', error);
        return [];
    }
}
function buildSummary(points) {
    if (!points.length) return null;
    const lastPoint = points[points.length - 1];
    const totalDistance = Number(lastPoint.distanza?.km ?? 0);
    const firstPoint = points[0];
    const startTs = new Date(firstPoint?.orario ?? '').getTime();
    const endTs = new Date(lastPoint?.orario ?? '').getTime();
    const elapsedFromTimestamps = Number.isFinite(startTs) && Number.isFinite(endTs) && endTs >= startTs
        ? Math.floor((endTs - startTs) / 1000)
        : null;
    const duration = elapsedFromTimestamps ?? (lastPoint.tempo_trascorso?.secondi ?? 0);
    const speed = duration > 0 ? ((lastPoint.distanza?.metri ?? 0) / duration) * 3.6 : 0;
    const elevationGain = points.reduce((acc, point, index) => {
        if (index === 0) return 0;
        const currentAlt = Number(point.altitudine?.metri ?? 0);
        const prevAlt = Number(points[index - 1].altitudine?.metri ?? 0);
        const diff = currentAlt - prevAlt;
        return acc + Math.max(diff, 0);
    }, 0);
    return {
        points,
        lastPoint,
        totalDistance,
        duration,
        speed,
        elevationGain,
        progress: Math.min(totalDistance / (gpxTotalKm || 290) * 100, 100),
        status: speed > 0.5 ? 'In movimento' : 'In pausa'
    };
}
function updateHomeSummary(summary) {
    if (!summary) return;
    document.getElementById('homeDistance').textContent = summary.totalDistance.toFixed(1);
    const blended = computeBlendedRemaining(summary);
    const remaining = blended !== null ? blended : Math.max(0, (gpxTotalKm || 290) - summary.totalDistance);
    const completion = computeDynamicProgress(summary.totalDistance, remaining);
    document.getElementById('homeRemaining').textContent = remaining.toFixed(1);
    document.getElementById('homeCompletion').textContent = `${completion.toFixed(1)}%`;
    document.getElementById('homeTime').textContent = formatTime(summary.duration);
    document.getElementById('homeGain').textContent = Math.round(summary.elevationGain);
    document.getElementById('homeSteps').textContent = computeEstimatedSteps(summary.totalDistance, summary.duration).toLocaleString();
    document.getElementById('homeStatusLabel').textContent = summary.status;
    document.getElementById('homeStatusText').textContent = summary.status === 'In movimento' ? 'Tracker attivo e aggiornato.' : 'Dati disponibili, attesa prossima posizione.';
}
function formatHoursTick(hoursValue) {
    const totalMinutes = Math.max(0, Math.round((Number(hoursValue) || 0) * 60));
    const hh = Math.floor(totalMinutes / 60);
    const mm = totalMinutes % 60;
    return `${hh}h ${String(mm).padStart(2, '0')}m`;
}

function createChart(canvasId, label, data, color, yAxisLabel = '', xAxisConfig = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    const axis = {
        min: xAxisConfig.min,
        max: xAxisConfig.max,
        label: xAxisConfig.label || 'Km',
        tickCallback: xAxisConfig.tickCallback || (value => Number(value).toFixed(0))
    };
    if (chartInstances[canvasId]) chartInstances[canvasId].destroy();
    chartInstances[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label,
                data,
                parsing: false,
                borderColor: color,
                backgroundColor: `${color}33`,
                tension: 0.3,
                fill: true,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    type: 'linear',
                    display: true,
                    min: axis.min,
                    max: axis.max,
                    ticks: {
                        callback: axis.tickCallback
                    },
                    title: { display: true, text: axis.label }
                },
                y: {
                    display: true,
                    title: yAxisLabel ? { display: true, text: yAxisLabel } : { display: false, text: '' }
                }
            }
        }
    });
    return chartInstances[canvasId];
}
function ensureLeafletAssets() {
    if (typeof L === 'undefined' || !L.Icon || !L.Icon.Default) return;
    L.Icon.Default.imagePath = 'https://unpkg.com/leaflet/dist/images/';
}

function haversineKm(lat1, lon1, lat2, lon2) {
    const toRad = d => d * Math.PI / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function computeBlendedRemaining(summary) {
    if (!summary) return null;
    const totalDistance = summary.totalDistance || 0;
    const gpxtotal = gpxTotalKm || 290;
    const remainingGpx = Math.max(0, gpxtotal - totalDistance);
    // fallback: if we don't have a live point or GPX coords, return GPX remaining
    if (!summary.lastPoint || !gpxCoords || !gpxCoords.length) return remainingGpx;
    const last = summary.lastPoint;
    const dest = gpxCoords[gpxCoords.length - 1];
    const remainingLive = haversineKm(last.coordinate.lat, last.coordinate.lon, dest.lat, dest.lng);
    // progress fraction (0..1)
    const progressFrac = Math.min(Math.max(totalDistance / gpxtotal, 0), 1);
    // linear blend: weight on GPX decreases linearly with progress (at 0% -> 1, at 100% -> 0)
    const weightGpx = 1 - progressFrac;
    const blended = weightGpx * remainingGpx + (1 - weightGpx) * remainingLive;
    return Math.max(0, blended);
}

function computeDynamicProgress(totalDistance, remainingDistance) {
    const done = Math.max(0, Number(totalDistance) || 0);
    const remaining = Math.max(0, Number(remainingDistance) || 0);
    const dynamicTotal = done + remaining;
    if (dynamicTotal <= 0) return 0;
    return Math.min((done / dynamicTotal) * 100, 100);
}

function computeEstimatedSteps(totalDistanceKm, durationSeconds) {
    const distance = Math.max(0, Number(totalDistanceKm) || 0);
    const hours = Math.max(0, Number(durationSeconds) || 0) / 3600;
    // As effort increases over time, stride tends to shorten and steps/km increase.
    const fatigueGain = Math.min(hours * 0.03, 0.35);
    const stepsPerKm = 1420 * (1 + fatigueGain);
    return Math.round(distance * stepsPerKm);
}

function stretchSeriesToRange(series, xMin, xMax, fallbackY = 0) {
    const clean = Array.isArray(series) ? series.filter(p => Number.isFinite(p?.x) && Number.isFinite(p?.y)) : [];
    if (!clean.length) {
        return [{ x: xMin, y: fallbackY }, { x: xMax, y: fallbackY }];
    }
    const sorted = [...clean].sort((a, b) => a.x - b.x);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const stretched = [...sorted];
    if (first.x > xMin) stretched.unshift({ x: xMin, y: first.y });
    if (last.x < xMax) stretched.push({ x: xMax, y: last.y });
    return stretched.map(p => ({ x: Math.max(xMin, Math.min(xMax, p.x)), y: p.y }));
}

function parseGpxXml(gpxText) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(gpxText, 'application/xml');
    const trkpts = Array.from(xml.querySelectorAll('trkpt'));
    const coords = trkpts.map(pt => ({
        lat: Number(pt.getAttribute('lat')),
        lng: Number(pt.getAttribute('lon'))
    })).filter(c => Number.isFinite(c.lat) && Number.isFinite(c.lng));
    let totalKm = 0;
    for (let i = 1; i < coords.length; i += 1) {
        totalKm += haversineKm(coords[i - 1].lat, coords[i - 1].lng, coords[i].lat, coords[i].lng);
    }
    return { coords, totalKm };
}

async function ensureGpxDataLoaded() {
    if (gpxCoords.length && Number.isFinite(gpxTotalKm) && gpxTotalKm > 0) return;
    if (gpxLoadPromise) {
        await gpxLoadPromise;
        return;
    }
    gpxLoadPromise = fetch('data/NorthLine_3.gpx')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.text();
        })
        .then(gpxText => {
            const parsed = parseGpxXml(gpxText);
            if (parsed.coords.length) {
                gpxCoords = parsed.coords;
                gpxTotalKm = parsed.totalKm;
            }
        })
        .catch(error => {
            console.warn('Impossibile caricare GPX (fallback parser):', error);
        })
        .finally(() => {
            gpxLoadPromise = null;
        });
    await gpxLoadPromise;
}

function centerOnLatestLive() {
    if (!mapInstance || !latestLiveCoord) return;
    mapInstance.setView(latestLiveCoord, Math.max(mapInstance.getZoom(), 14));
}

function centerOnVisitorPosition() {
    if (!mapInstance || !latestVisitorCoord) return;
    mapInstance.setView(latestVisitorCoord, Math.max(mapInstance.getZoom(), 14));
}

function buildGoogleDirectionsToRunnerUrl(lat, lng) {
    const destLat = Number(lat).toFixed(6);
    const destLng = Number(lng).toFixed(6);
    return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=walking`;
}

function buildRunnerPopupContent(lat, lng) {
    const directionsUrl = buildGoogleDirectionsToRunnerUrl(lat, lng);
    return `<div class="runner-popup"><p>Posizione atleta</p><a class="runner-directions-btn" href="${directionsUrl}" target="_blank" rel="noopener noreferrer">Indicazioni</a></div>`;
}
function addMapControl() {
    if (typeof L === 'undefined' || !mapInstance) return;
    const tileProviders = getTileProviders();
    const styleOptions = [
        { key: 'osm', title: 'Mappa standard' },
        { key: 'satellite', title: 'Vista satellitare' },
        { key: 'topo', title: 'Mappa topografica' }
    ];
    const MapControl = L.Control.extend({
        onAdd: function() {
            const wrapper = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom map-control');
            const toggleButton = L.DomUtil.create('button', 'map-toggle-btn', wrapper);
            toggleButton.type = 'button';
            toggleButton.title = 'Scegli stile mappa';
            toggleButton.innerHTML = '🗺️';
            L.DomEvent.disableClickPropagation(toggleButton);
            const stylePanel = L.DomUtil.create('div', 'style-panel', wrapper);
            stylePanel.setAttribute('aria-label', 'Selezione stile mappa');
            styleOptions.forEach(({ key, title }) => {
                const card = L.DomUtil.create('button', 'style-card', stylePanel);
                card.type = 'button';
                card.title = title;
                card.dataset.key = key;
                card.setAttribute('aria-label', title);
                const preview = L.DomUtil.create('span', `style-preview ${key}`, card);
                // use project assets for preview images
                const img = document.createElement('img');
                img.alt = title;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '8px';
                if (key === 'osm') img.src = 'assets/mappa.png';
                if (key === 'satellite') img.src = 'assets/sat.png';
                if (key === 'topo') img.src = 'assets/topo.png';
                preview.appendChild(img);
                const label = L.DomUtil.create('span', 'style-label', card);
                label.textContent = key === 'osm' ? 'Mappa' : key === 'satellite' ? 'Sat' : 'Topo';
                L.DomEvent.disableClickPropagation(card);
                card.addEventListener('click', event => {
                    event.stopPropagation();
                    if (!tileProviders[key]) return;
                    activeLayer?.remove();
                    activeLayer = tileProviders[key].addTo(mapInstance);
                    if (key === 'topo' && mapInstance.getZoom() > 17) {
                        mapInstance.setZoom(17);
                    }
                    stylePanel.querySelectorAll('.style-card').forEach(el => el.classList.toggle('active', el.dataset.key === key));
                });
                if (key === 'osm') card.classList.add('active');
            });
            toggleButton.addEventListener('click', event => {
                L.DomEvent.stopPropagation(event);
                stylePanel.classList.toggle('open');
            });
            mapInstance.on('click', () => {
                stylePanel.classList.remove('open');
            });
            return wrapper;
        }
    });
    mapInstance.addControl(new MapControl({ position: 'topright' }));
}
function initMap() {
    if (mapInstance) return;
    if (typeof L === 'undefined') return;
    ensureLeafletAssets();
    const tileProviders = getTileProviders();
    mapInstance = L.map('map', { zoomControl: false }).setView(defaultCenter, defaultZoom);
    activeLayer = tileProviders.osm.addTo(mapInstance);
    L.control.zoom({ position: 'topright' }).addTo(mapInstance);
    addMapControl();
    const gpxUrl = 'data/NorthLine_3.gpx';
    try {
        new L.GPX(gpxUrl, {
            async: true,
            marker_options: { startIconUrl: null, endIconUrl: null, shadowUrl: null },
            polyline_options: { color: '#ff9f1c', weight: 7, opacity: 0.95 }
        }).on('loaded', e => {
            const track = e.target;
            if (track && typeof track.getBounds === 'function') {
                mapInstance.fitBounds(track.getBounds(), { padding: [40, 40] });
            }
            try {
                if (track._coords && track._coords.length) {
                    gpxCoords = track._coords;
                }
                if (track._info && track._info.length) {
                    gpxTotalKm = track._info.length / 1000;
                }
                if (!gpxCoords.length || !Number.isFinite(gpxTotalKm) || gpxTotalKm <= 0) {
                    ensureGpxDataLoaded().catch(() => {});
                }
                if (gpxCoords.length) {
                    const first = gpxCoords[0];
                    const last = gpxCoords[gpxCoords.length - 1];
                    if (!startMarker) startMarker = L.marker([first.lat, first.lng]).addTo(mapInstance);
                    if (finishMarker) mapInstance.removeLayer(finishMarker);
                    finishMarker = L.marker([last.lat, last.lng], { icon: L.icon({ iconUrl: 'assets/icons/finish-flag.gif', iconSize: [45,45], iconAnchor: [22,45] }) }).addTo(mapInstance);
                    // refresh live UI using GPX total if we are on the live page
                    fetchPoints().then(points => {
                        const s = buildSummary(points);
                        try { if (s) { updateLiveUI(s); refreshMapRoute(s.points); } } catch(e){}
                    }).catch(()=>{});
                }
            } catch (err) { console.warn('Errore lettura GPX info', err); }
        }).on('error', e => {
            console.warn('Impossibile caricare GPX:', e);
        }).addTo(mapInstance);
    } catch (err) {
        console.warn('GPX initialization fallita:', err);
    }
}
function refreshMapRoute(points) {
    if (!mapInstance || !points.length) return;
    const coords = points.map(p => [p.coordinate.lat, p.coordinate.lon]);
    const shouldFitToBounds = !routeLine;
    if (routeLine) routeLine.setLatLngs(coords);
    else routeLine = L.polyline(coords, { color: '#4fc3ff', weight: 5, opacity: 0.8 }).addTo(mapInstance);
    latestLiveCoord = coords[coords.length - 1];
    // Use GPX-defined start/finish when available; no popups
    if (!startMarker && gpxCoords.length) {
        const first = gpxCoords[0];
        startMarker = L.marker([first.lat, first.lng]).addTo(mapInstance);
    }
    if (gpxCoords.length) {
        const last = gpxCoords[gpxCoords.length - 1];
        if (!finishMarker) finishMarker = L.marker([last.lat, last.lng], { icon: L.icon({ iconUrl: 'assets/icons/finish-flag.gif', iconSize: [45,45], iconAnchor: [22,45] }) }).addTo(mapInstance);
        else finishMarker.setLatLng([last.lat, last.lng]);
    }
    // live marker with popup and directions button
    if (!liveMarker) {
        liveMarker = L.circleMarker(coords[coords.length - 1], { radius: 10, fillColor: '#49a8ff', color: '#fff', weight: 2, fillOpacity: 0.95 }).addTo(mapInstance);
        liveMarker.bindPopup(buildRunnerPopupContent(coords[coords.length - 1][0], coords[coords.length - 1][1]));
    } else {
        liveMarker.setLatLng(coords[coords.length - 1]);
        liveMarker.setPopupContent(buildRunnerPopupContent(coords[coords.length - 1][0], coords[coords.length - 1][1]));
    }
    if (shouldFitToBounds) {
        mapInstance.fitBounds(routeLine.getBounds(), { padding: [40, 40] });
    }
}
function updateLiveUI(summary) {
    if (!summary) return;
    document.getElementById('distance').textContent = `${summary.totalDistance.toFixed(1)} km`;
    const blendedRemaining = computeBlendedRemaining(summary);
    const remaining = blendedRemaining !== null ? blendedRemaining : Math.max(0, (gpxTotalKm || 290) - summary.totalDistance);
    const completion = computeDynamicProgress(summary.totalDistance, remaining);
    document.getElementById('remaining').textContent = `${remaining.toFixed(1)} km`;
    document.getElementById('completion').textContent = `${completion.toFixed(1)}%`;
    document.getElementById('completionText').textContent = `${completion.toFixed(1)}%`;
    document.getElementById('speed').textContent = `${summary.speed.toFixed(1)} km/h`;
    document.getElementById('altitude').textContent = `${summary.lastPoint.altitudine.metri.toFixed(0)} m`;
    document.getElementById('lastUpdate').textContent = formatRelativeDate(summary.lastPoint.orario);
    document.getElementById('time').textContent = formatTime(summary.duration);
    document.getElementById('elevation').textContent = `${Math.round(summary.elevationGain)} m`;
    document.getElementById('steps').textContent = computeEstimatedSteps(summary.totalDistance, summary.duration).toLocaleString();
    document.getElementById('progressBar').style.width = `${completion.toFixed(1)}%`;
}

function updateVisitorDistance(lastPoint) {
    if (!navigator.geolocation) {
        document.getElementById('visitorDistance').textContent = 'Non supportato';
        return;
    }
    navigator.geolocation.getCurrentPosition(position => {
        showVisitorMarker(position);
        const R = 6371e3;
        const toRad = deg => deg * Math.PI / 180;
        const lat1 = toRad(position.coords.latitude);
        const lat2 = toRad(lastPoint.coordinate.lat);
        const dLat = toRad(lastPoint.coordinate.lat - position.coords.latitude);
        const dLon = toRad(lastPoint.coordinate.lon - position.coords.longitude);
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        document.getElementById('visitorDistance').textContent = `${(distance / 1000).toFixed(1)} km`;
    }, () => {
        document.getElementById('visitorDistance').textContent = 'Permesso negato';
    });
}
async function initLivePage() {
    initializeTheme();
    await ensureGpxDataLoaded();
    initMap();
    buildNav();
    document.getElementById('panelToggle')?.addEventListener('click', () => document.getElementById('statsContent')?.classList.toggle('open'));
    const points = await fetchPoints();
    const summary = buildSummary(points);
    updateLiveUI(summary);
    if (summary) {
        refreshMapRoute(summary.points);
        updateVisitorDistance(summary.lastPoint);
    }
    // center-live button
    const centerBtn = document.getElementById('centerLiveBtn');
    if (centerBtn) {
        centerBtn.addEventListener('click', centerOnLatestLive);
    }
    const centerUserBtn = document.getElementById('centerUserBtn');
    if (centerUserBtn) {
        centerUserBtn.addEventListener('click', centerOnVisitorPosition);
    }

    const fullscreenBtn = document.getElementById('mapFullscreenBtn');
    const mapWrap = document.querySelector('.map-wrap');
    if (fullscreenBtn && mapWrap) {
        fullscreenBtn.addEventListener('click', () => {
            mapWrap.classList.toggle('map-wrap--fullscreen');
            const isFullscreen = mapWrap.classList.contains('map-wrap--fullscreen');
            fullscreenBtn.textContent = isFullscreen ? '🡼' : '⛶';
            fullscreenBtn.title = isFullscreen ? 'Esci da schermo intero' : 'Mappa a schermo intero';
            setTimeout(() => mapInstance?.invalidateSize(), 120);
        });
    }
    setInterval(async () => {
        const points = await fetchPoints();
        const summary = buildSummary(points);
        updateLiveUI(summary);
        if (summary) {
            refreshMapRoute(summary.points);
            updateVisitorDistance(summary.lastPoint);
        }
    }, 8000);
}
async function initHomePage() {
    initializeTheme();
    await ensureGpxDataLoaded();
    const points = await fetchPoints();
    const summary = buildSummary(points);
    if (summary) updateHomeSummary(summary);
}
function buildChartData(points, summaryContext = null) {
    const safePoints = points
        .filter(p => p && p.velocita && p.altitudine && p.distanza && p.orario)
        .sort((a, b) => new Date(a.orario).getTime() - new Date(b.orario).getTime());
    const rawKm = safePoints.map(p => Number(p.distanza.km ?? 0));
    const kmMin = rawKm.length ? Math.min(...rawKm) : 0;
    const kmMax = rawKm.length ? Math.max(...rawKm) : 0;
    const sortedKm = [...rawKm].sort((a, b) => a - b);
    const kmP80 = sortedKm.length ? sortedKm[Math.floor(sortedKm.length * 0.8)] : 0;
    const uniqueKmCount = new Set(rawKm.map(v => Number(v.toFixed(2)))).size;
    const nonZeroKmRatio = rawKm.length ? (rawKm.filter(v => v > 0).length / rawKm.length) : 0;
    const hasUsableKmSpread = Number.isFinite(kmMin)
        && Number.isFinite(kmMax)
        && (kmMax - kmMin) > 0.1
        && uniqueKmCount > Math.max(6, Math.floor(rawKm.length * 0.2))
        && nonZeroKmRatio > 0.45
        && kmP80 > (kmMin + (kmMax - kmMin) * 0.2);
    const fallbackTotalKm = Math.max(
        0,
        Number(summaryContext?.totalDistance ?? points[points.length - 1]?.distanza?.km ?? safePoints[safePoints.length - 1]?.distanza?.km ?? 0)
    );
    const kmByIndex = safePoints.map((point, index) => (hasUsableKmSpread
        ? Number(point.distanza.km ?? 0)
        : (safePoints.length > 1 ? (fallbackTotalKm * index) / (safePoints.length - 1) : 0)));
    const timeByIndex = safePoints.map(point => new Date(point.orario).getTime());
    const validStartTs = timeByIndex.find(ts => Number.isFinite(ts));
    const summaryDurationHours = Number(summaryContext?.duration ?? 0) / 3600;
    const globalAvgSpeed = summaryDurationHours > 0 ? (fallbackTotalKm / summaryDurationHours) : null;
    const maxReasonableSpeed = Number.isFinite(globalAvgSpeed) && globalAvgSpeed > 0
        ? Math.max(8, globalAvgSpeed * 2.5)
        : 12;
    const segmentSpeed = safePoints.map(() => null);
    for (let i = 1; i < safePoints.length; i += 1) {
        const dtMs = timeByIndex[i] - timeByIndex[i - 1];
        const dk = kmByIndex[i] - kmByIndex[i - 1];
        if (!Number.isFinite(dtMs) || dtMs <= 0 || !Number.isFinite(dk) || dk < 0) continue;
        const speed = dk / (dtMs / 3600000);
        if (Number.isFinite(speed) && speed >= 0 && speed <= maxReasonableSpeed) {
            segmentSpeed[i] = speed;
        }
    }
    const validSegmentSpeed = segmentSpeed.filter(v => Number.isFinite(v));
    const percentile = (values, q) => {
        if (!values.length) return 0;
        const sorted = [...values].sort((a, b) => a - b);
        const idx = Math.max(0, Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * q)));
        return sorted[idx];
    };
    const derivedSpeedReliable = validSegmentSpeed.length >= Math.max(4, Math.floor(safePoints.length * 0.15));
    const speedCap = derivedSpeedReliable ? Math.min(maxReasonableSpeed, Math.max(8, percentile(validSegmentSpeed, 0.95) * 1.8)) : maxReasonableSpeed;
    const rawSpeedSeries = safePoints.map((point, index) => {
        if (derivedSpeedReliable) {
            const derived = segmentSpeed[index];
            if (Number.isFinite(derived)) return Math.min(derived, speedCap);
        }
        const reportedSpeed = Number(point.velocita.km_h ?? 0);
        if (Number.isFinite(reportedSpeed) && reportedSpeed > 0.1) {
            return Math.min(reportedSpeed, maxReasonableSpeed);
        }
        return Number.isFinite(globalAvgSpeed) && globalAvgSpeed > 0 ? globalAvgSpeed : 0;
    });
    const smoothNumericSeries = (values, radius = 2) => values.map((_, index) => {
        let sum = 0;
        let count = 0;
        for (let j = Math.max(0, index - radius); j <= Math.min(values.length - 1, index + radius); j += 1) {
            const value = values[j];
            if (Number.isFinite(value)) {
                sum += value;
                count += 1;
            }
        }
        return count ? (sum / count) : null;
    });
    const smoothedSpeedSeries = smoothNumericSeries(rawSpeedSeries, 2);
    const fallbackDurationHours = Math.max(0, Number(summaryContext?.duration ?? 0) / 3600);
    let cumulativeElevation = 0;
    const speedSeries = [];
    const altitudeSeries = [];
    const elevationSeries = [];
    const kmSeries = [];
    let maxTimeHours = 0;
    safePoints.forEach((point, index) => {
        const km = kmByIndex[index];
        const absoluteTs = timeByIndex[index];
        const timeHours = (Number.isFinite(validStartTs) && Number.isFinite(absoluteTs) && absoluteTs >= validStartTs)
            ? (absoluteTs - validStartTs) / 3600000
            : (safePoints.length > 1 ? (fallbackDurationHours * index) / (safePoints.length - 1) : 0);
        const altitude = Number(point.altitudine.metri ?? 0);
        const speed = Number.isFinite(smoothedSpeedSeries[index]) ? smoothedSpeedSeries[index] : 0;
        maxTimeHours = Math.max(maxTimeHours, timeHours);
        if (index > 0) {
            const prevAlt = Number(safePoints[index - 1].altitudine.metri ?? 0);
            cumulativeElevation += Math.max(0, altitude - prevAlt);
        }
        speedSeries.push({ km, t: timeHours, y: Number(speed.toFixed(2)) });
        altitudeSeries.push({ km, t: timeHours, y: altitude });
        elevationSeries.push({ km, t: timeHours, y: cumulativeElevation });
        kmSeries.push({ km, t: timeHours, y: km });
    });
    return {
        speedSeries,
        altitudeSeries,
        elevationSeries,
        kmSeries,
        maxTimeHours,
        dailyLabels: [...new Set(safePoints.map(p => new Date(p.orario).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })))] ,
        kmDaily: safePoints.reduce((acc, point) => {
            const day = new Date(point.orario).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
            acc[day] = Math.max(acc[day] ?? 0, Number(point.distanza.km ?? 0));
            return acc;
        }, {})
    };
}
async function initDashboardPage() {
    initializeTheme();
    await ensureGpxDataLoaded();
    const points = await fetchPoints();
    const summary = buildSummary(points) || { totalDistance: 0, speed: 0, elevationGain: 0, duration: 0, progress: 0, lastPoint: { altitudine: { metri: 0 } } };
    const metricDistance = document.getElementById('metricDistance');
    const metricRemaining = document.getElementById('metricRemaining');
    const metricCompletion = document.getElementById('metricCompletion');
    const metricSpeed = document.getElementById('metricSpeed');
    const metricAltitude = document.getElementById('metricAltitude');
    const metricElevation = document.getElementById('metricElevation');
    const metricTime = document.getElementById('metricTime');
    if (metricDistance) metricDistance.textContent = `${summary.totalDistance.toFixed(1)} km`;
    const blended = computeBlendedRemaining(summary);
    const remaining = blended !== null ? blended : Math.max(0, (gpxTotalKm || 290) - summary.totalDistance);
    const completion = computeDynamicProgress(summary.totalDistance, remaining);
    if (metricRemaining) metricRemaining.textContent = `${remaining.toFixed(1)} km`;
    if (metricCompletion) metricCompletion.textContent = `${completion.toFixed(1)}%`;
    if (metricSpeed) metricSpeed.textContent = `${summary.speed.toFixed(1)} km/h`;
    if (metricAltitude) metricAltitude.textContent = `${summary.lastPoint.altitudine.metri.toFixed(0)} m`;
    if (metricElevation) metricElevation.textContent = `${Math.round(summary.elevationGain)} m`;
    if (metricTime) metricTime.textContent = formatTime(summary.duration);
    const xAxisSelect = document.getElementById('chartXAxisMode');
    const storedXAxisMode = localStorage.getItem('northline-chart-x-axis');
    const xAxisMode = storedXAxisMode === 'time' ? 'time' : 'distance';
    if (xAxisSelect) xAxisSelect.value = xAxisMode;
    const chartData = buildChartData(
        points.length ? points : [{ velocita: { km_h: 0 }, altitudine: { metri: 0 }, distanza: { km: 0 }, orario: new Date().toISOString() }],
        summary
    );

    const renderCharts = axisMode => {
        const mode = axisMode === 'time' ? 'time' : 'distance';
        const xMin = 0;
        const xMax = mode === 'time'
            ? Math.max(1, chartData.maxTimeHours || Number(summary.duration || 0) / 3600 || 0)
            : Math.max(1, summary.totalDistance || 0);
        const toAxisSeries = series => series.map(p => ({ x: mode === 'time' ? p.t : p.km, y: p.y }));
        const speedSeries = stretchSeriesToRange(toAxisSeries(chartData.speedSeries), xMin, xMax, 0);
        const altitudeSeries = stretchSeriesToRange(toAxisSeries(chartData.altitudeSeries), xMin, xMax, 0);
        const elevationSeries = stretchSeriesToRange(toAxisSeries(chartData.elevationSeries), xMin, xMax, 0);
        const kmSeries = stretchSeriesToRange(toAxisSeries(chartData.kmSeries), xMin, xMax, 0);
        const axisConfig = mode === 'time'
            ? { min: xMin, max: xMax, label: 'Tempo', tickCallback: value => formatHoursTick(value) }
            : { min: xMin, max: xMax, label: 'Km', tickCallback: value => Number(value).toFixed(0) };
        createChart('chartSpeed', 'Velocità', speedSeries, '#49a8ff', 'Km/h', axisConfig);
        createChart('chartAltitude', 'Altitudine', altitudeSeries, '#7f7dff', 'm', axisConfig);
        createChart('chartKm', 'Km cumulati', kmSeries, '#5dd97d', 'Km', axisConfig);
        createChart('chartElevation', 'Dislivello cumulato', elevationSeries, '#f3c03d', 'm', axisConfig);
    };

    renderCharts(xAxisMode);
    if (xAxisSelect) {
        xAxisSelect.addEventListener('change', event => {
            const mode = event.target.value === 'time' ? 'time' : 'distance';
            localStorage.setItem('northline-chart-x-axis', mode);
            renderCharts(mode);
        });
    }
}
async function initGalleryPage() {
    initializeTheme();
    const items = [
        { title: 'Punto panoramico', location: 'Monte Generoso', tag: 'montagna', description: 'Vista sul Lago di Lugano al tramonto.', image: 'assets/preview.png' },
        { title: 'Checkpoint', location: 'Passo del San Gottardo', tag: 'checkpoint', description: 'Bivacco e ristoro lungo il percorso.', image: 'assets/preview.png' },
        { title: 'Campo notte', location: 'Valle Alpina', tag: 'bivacco', description: 'Tenda montata a quota 2100 m.', image: 'assets/preview.png' },
        { title: 'City stop', location: 'Mendrisio', tag: 'città', description: 'Pausa tecnica prima del tratto alpino.', image: 'assets/preview.png' }
    ];
    const grid = document.querySelector('.gallery-grid');
    const modal = document.querySelector('.modal-backdrop');
    const modalTitle = document.getElementById('modalTitle');
    const modalLocation = document.getElementById('modalLocation');
    const modalDescription = document.getElementById('modalDescription');
    const modalImage = document.getElementById('modalImage');
    items.forEach(item => {
        const card = document.createElement('article');
        card.className = 'gallery-item';
        card.dataset.filter = item.tag;
        card.innerHTML = `<img src="${item.image}" alt="${item.title}"><div class="gallery-meta"><h3>${item.title}</h3><p>${item.location}</p></div>`;
        card.addEventListener('click', () => {
            modalTitle.textContent = item.title;
            modalLocation.textContent = item.location;
            modalDescription.textContent = item.description;
            modalImage.src = item.image;
            modal.classList.add('active');
        });
        grid.appendChild(card);
    });
    document.querySelectorAll('.gallery-filter button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.gallery-item').forEach(card => {
                card.style.display = button.dataset.filter === 'all' || card.dataset.filter === button.dataset.filter ? 'grid' : 'none';
            });
        });
    });
    document.querySelector('.modal-close')?.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', event => { if (event.target === modal) modal.classList.remove('active'); });
}
async function initDiaryPage() {
    initializeTheme();
    const entries = [
        { title: 'Giorno 1 – Partenza', date: '07/07/2026', km: '18', text: 'Partenza da Mendrisio, clima fresco e arrivo al primo bivacco.', image: 'assets/preview.png' },
        { title: 'Giorno 3 – Passo del San Gottardo', date: '09/07/2026', km: '36', text: 'Attraversamento del passo con panorami spettacolari.', image: 'assets/preview.png' },
        { title: 'Giorno 5 – Valle alpina', date: '11/07/2026', km: '45', text: 'Sentieri tecnici e momenti di avventura pura.', image: 'assets/preview.png' }
    ];
    const container = document.querySelector('.diary-list');
    entries.forEach(entry => {
        const article = document.createElement('article');
        article.className = 'diary-entry';
        article.innerHTML = `<img src="${entry.image}" alt="${entry.title}"><div><time>${entry.date}</time><h3>${entry.title}</h3><p><strong>${entry.km} km</strong> · ${entry.text}</p></div>`;
        container.appendChild(article);
    });
}
async function initTimelinePage() {
    initializeTheme();
    const events = [
        { time: '07:30', title: 'Partenza', description: 'Inizio del percorso con entusiasmo.' },
        { time: '09:10', title: 'Mendrisio', description: 'Primo checkpoint e colazione veloce.' },
        { time: '11:45', title: 'Panorama', description: 'Sosta per ammirare le vette.' },
        { time: '14:00', title: 'Monte Generoso', description: 'Salita al crinale e vista sul lago.' },
        { time: '18:20', title: 'Tramonto', description: 'Fine giornata con colori mozzafiato.' },
        { time: '20:30', title: 'Campo notte', description: 'Arrivo al bivacco e riposo.' }
    ];
    const list = document.querySelector('.timeline-list');
    events.forEach(event => {
        const article = document.createElement('article');
        article.className = 'timeline-event';
        article.innerHTML = `<time>${event.time}</time><h3>${event.title}</h3><p>${event.description}</p>`;
        article.addEventListener('click', () => alert(`Sposta la mappa su: ${event.title}`));
        list.appendChild(article);
    });
}
async function initReplayPage() {
    initializeTheme();
    await ensureGpxDataLoaded();
    initMap();
    buildNav();
    const points = await fetchPoints();
    const coords = points.length ? points.map(p => [p.coordinate.lat, p.coordinate.lon]) : [defaultCenter];
    const route = L.polyline(coords, { color: '#7f7dff', weight: 5, opacity: 0.45 }).addTo(mapInstance);
    const replayTrail = L.polyline([coords[0]], { color: '#7f7dff', weight: 6, opacity: 0.95 }).addTo(mapInstance);
    mapInstance.fitBounds(route.getBounds() || L.latLngBounds(coords), { padding: [40, 40] });
    let index = 0;
    const marker = L.circleMarker(coords[0], { radius: 12, color: '#ffb347', fillColor: '#ffd382', fillOpacity: 1 }).addTo(mapInstance);
    const statusLabel = document.getElementById('replayStatus');
    let interval = null;
    function updateMarker() {
        if (index >= coords.length) {
            clearInterval(interval);
            statusLabel.textContent = 'Replay completato';
            return;
        }
        marker.setLatLng(coords[index]);
        replayTrail.addLatLng(coords[index]);
        statusLabel.textContent = `Replay ${index + 1}/${coords.length}`;
        mapInstance.panTo(coords[index], { animate: true, duration: 0.45 });
        index += 1;
    }
    document.getElementById('replayPlay')?.addEventListener('click', () => { clearInterval(interval); interval = setInterval(updateMarker, Number(document.getElementById('replaySpeed')?.value || 500)); });
    document.getElementById('replayPause')?.addEventListener('click', () => clearInterval(interval));
    document.getElementById('replayReset')?.addEventListener('click', () => {
        clearInterval(interval);
        index = 0;
        marker.setLatLng(coords[0]);
        replayTrail.setLatLngs([coords[0]]);
        if (statusLabel) statusLabel.textContent = 'Replay pronto';
    });
    document.getElementById('replaySpeed')?.addEventListener('input', event => { document.getElementById('replaySpeedLabel').textContent = `${event.target.value} ms`; });
}
async function initProgressPage() {
    initializeTheme();
    const points = await fetchPoints();
    const summary = buildSummary(points) || { totalDistance: 0, progress: 0 };
    const badges = [
        { title: '100 km', value: 100 },
        { title: '200 km', value: 200 },
        { title: '500 km', value: 500 },
        { title: '50%', value: 50 },
        { title: '75%', value: 75 },
        { title: '100%', value: 100 },
        { title: 'Primo bivacco', value: 10 },
        { title: 'Passo del San Gottardo', value: 30 },
        { title: 'Quota massima raggiunta', value: 42 }
    ];
    const grid = document.querySelector('.badge-grid');
    badges.forEach(badge => {
        const article = document.createElement('article');
        article.className = 'badge-card';
        const unlocked = badge.value <= summary.totalDistance || badge.value <= summary.progress;
        if (unlocked) article.classList.add('unlocked');
        article.innerHTML = `<h3>${badge.title}</h3><p>${unlocked ? 'Sbloccato' : 'In attesa'}</p>`;
        grid.appendChild(article);
    });
}
function showVisitorMarker(position) {
    if (!mapInstance || !position) return;
    const coords = [position.coords.latitude, position.coords.longitude];
    latestVisitorCoord = L.latLng(coords[0], coords[1]);
    if (visitorMarker) visitorMarker.setLatLng(coords);
    else visitorMarker = L.marker(coords, { icon: L.divIcon({ className: 'visitor-icon', html: '<span class="user-location-icon" aria-hidden="true">👤</span>', iconSize: [28, 28], iconAnchor: [14, 14] }) }).addTo(mapInstance).bindPopup('La tua posizione');
}
function initPage() {
    const page = document.body.dataset.page;
    if (!page) return;
    switch (page) {
        case 'home': initHomePage(); break;
        case 'live': initLivePage(); break;
        case 'dashboard': initDashboardPage(); break;
        case 'gallery': initGalleryPage(); break;
        case 'diary': initDiaryPage(); break;
        case 'timeline': initTimelinePage(); break;
        case 'replay': initReplayPage(); break;
        case 'progress': initProgressPage(); break;
        default: initializeTheme(); break;
    }
}
document.addEventListener('DOMContentLoaded', initPage);
