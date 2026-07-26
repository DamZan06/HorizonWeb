const firebaseURL = "https://northline-a4eaa-default-rtdb.europe-west1.firebasedatabase.app/livetrack/points.json";
const plannedStartDateIso = '2026-08-01T04:00:00+02:00';
const contentDatabasePath = 'content';
const trackerDataUrl = 'data/NorthLine_trackers.json';
const defaultCenter = [46.0, 8.9];
const defaultZoom = 12;
const adminSessionKey = 'northline-admin-authenticated';
const supportedLanguages = ['it', 'en', 'de'];
const defaultLanguage = 'it';
const languageStorageKey = 'northline-language';
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
let gpxWaypoints = [];
let gpxLoadPromise = null;
let trackersLoadPromise = null;
let latestLiveCoord = null;
let latestVisitorCoord = null;
let firebaseAppInstance = null;
let routeMarkerGroup = null;
const mediaModalState = {
    items: [],
    index: 0,
    onChange: null,
    bound: false,
    touchStartX: null
};
const photoMapState = {
    markerById: new Map(),
    clusterGroup: null
};
let googleTranslateScriptPromise = null;
function normalizeLanguage(value) {
    const code = String(value || '').trim().toLowerCase();
    return supportedLanguages.includes(code) ? code : defaultLanguage;
}
function readCookieValue(name) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : '';
}
function parseLanguageFromGoogTransCookie() {
    const raw = readCookieValue('googtrans');
    const parts = raw.split('/').filter(Boolean);
    if (!parts.length) return defaultLanguage;
    return normalizeLanguage(parts[parts.length - 1]);
}
function getPreferredLanguage() {
    try {
        const stored = localStorage.getItem(languageStorageKey);
        if (supportedLanguages.includes(stored)) return stored;
    } catch (error) {
        // ignore storage access issues and rely on cookies/default
    }
    return parseLanguageFromGoogTransCookie();
}
function persistPreferredLanguage(lang) {
    try {
        localStorage.setItem(languageStorageKey, lang);
    } catch (error) {
        // ignore storage access issues
    }
}
function setGoogleTranslateCookie(targetLanguage) {
    const language = normalizeLanguage(targetLanguage);
    const cookieValue = `/it/${language}`;
    const cookie = `googtrans=${encodeURIComponent(cookieValue)};path=/;max-age=31536000`;
    document.cookie = cookie;
    if (location.hostname) {
        document.cookie = `${cookie};domain=${location.hostname}`;
    }
}
function ensureGoogleTranslateContainer() {
    let container = document.getElementById('google_translate_element');
    if (container) return container;
    container = document.createElement('div');
    container.id = 'google_translate_element';
    container.setAttribute('aria-hidden', 'true');
    container.style.display = 'none';
    document.body.appendChild(container);
    return container;
}
function ensureGoogleTranslateScript() {
    if (googleTranslateScriptPromise) return googleTranslateScriptPromise;
    ensureGoogleTranslateContainer();
    googleTranslateScriptPromise = new Promise((resolve, reject) => {
        window.googleTranslateElementInit = () => {
            try {
                if (window.google?.translate?.TranslateElement) {
                    new window.google.translate.TranslateElement({
                        pageLanguage: 'it',
                        includedLanguages: supportedLanguages.join(','),
                        autoDisplay: false
                    }, 'google_translate_element');
                }
                resolve();
            } catch (error) {
                reject(error);
            }
        };

        const existingScript = document.querySelector('script[data-google-translate="true"]');
        if (existingScript) return;

        const script = document.createElement('script');
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        script.defer = true;
        script.dataset.googleTranslate = 'true';
        script.onerror = () => reject(new Error('Impossibile caricare Google Translate'));
        document.head.appendChild(script);
    });
    return googleTranslateScriptPromise;
}
function onLanguageSelected(targetLanguage) {
    const language = normalizeLanguage(targetLanguage);
    const current = getPreferredLanguage();
    if (language === current) return;
    persistPreferredLanguage(language);
    setGoogleTranslateCookie(language);
    window.location.reload();
}
function buildLanguageSwitcher(className) {
    const wrapper = document.createElement('div');
    wrapper.className = `lang-switcher ${className}`;

    const label = document.createElement('label');
    label.className = 'lang-switcher-label';
    label.textContent = 'Lingua';

    const select = document.createElement('select');
    select.className = 'lang-switcher-select';
    select.setAttribute('aria-label', 'Seleziona lingua');

    const options = [
        { value: 'it', label: 'Italiano' },
        { value: 'en', label: 'English' },
        { value: 'de', label: 'Deutsch' }
    ];
    options.forEach(option => {
        const element = document.createElement('option');
        element.value = option.value;
        element.textContent = option.label;
        select.appendChild(element);
    });
    select.value = getPreferredLanguage();

    wrapper.append(label, select);
    return { wrapper, select };
}
function initializeLanguageSwitcher() {
    const topbar = document.querySelector('.topbar');
    const nav = topbar?.querySelector('.main-nav');
    if (!topbar || !nav || topbar.dataset.languageSwitcherInit === 'true') return;

    const desktop = buildLanguageSwitcher('lang-switcher-desktop');
    const mobile = buildLanguageSwitcher('lang-switcher-mobile');

    const syncValue = value => {
        desktop.select.value = value;
        mobile.select.value = value;
    };

    desktop.select.addEventListener('change', event => {
        const value = normalizeLanguage(event.target.value);
        syncValue(value);
        onLanguageSelected(value);
    });
    mobile.select.addEventListener('change', event => {
        const value = normalizeLanguage(event.target.value);
        syncValue(value);
        onLanguageSelected(value);
    });

    topbar.appendChild(desktop.wrapper);
    nav.appendChild(mobile.wrapper);
    topbar.dataset.languageSwitcherInit = 'true';
}
function initializeLanguageSupport() {
    const preferred = getPreferredLanguage();
    persistPreferredLanguage(preferred);
    document.documentElement.lang = preferred;
    setGoogleTranslateCookie(preferred);
    initializeLanguageSwitcher();
    if (preferred !== defaultLanguage) {
        ensureGoogleTranslateScript().catch(error => {
            console.warn('Google Translate non disponibile:', error);
        });
    }
}
function createRecordId(prefix = 'item') {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return `${prefix}-${crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}
function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
function getFirebaseClientConfig() {
    return window.NorthLineFirebaseConfig || null;
}
function hasUsableFirebaseConfig() {
    const config = getFirebaseClientConfig();
    if (!config) return false;
    const required = ['apiKey', 'authDomain', 'databaseURL', 'projectId', 'appId'];
    return required.every(key => {
        const value = String(config[key] || '');
        return value && !value.startsWith('INSERISCI_');
    });
}
function getFirebaseContentUrl(type) {
    const config = getFirebaseClientConfig();
    if (!config?.databaseURL) return null;
    return `${String(config.databaseURL).replace(/\/$/, '')}/${contentDatabasePath}/${type}.json`;
}
function ensureFirebaseClient() {
    const config = getFirebaseClientConfig();
    if (!config || !hasUsableFirebaseConfig() || typeof firebase === 'undefined') return null;
    if (!firebaseAppInstance) {
        firebaseAppInstance = firebase.apps?.length ? firebase.app() : firebase.initializeApp(config);
    }
    return firebaseAppInstance;
}
function getFirebaseDatabase() {
    const app = ensureFirebaseClient();
    return app ? firebase.database(app) : null;
}
function getFirebaseAuth() {
    const app = ensureFirebaseClient();
    return app ? firebase.auth(app) : null;
}
async function loadCollection(type) {
    const publicUrl = getFirebaseContentUrl(type);
    if (!publicUrl) return [];
    try {
        const response = await fetch(publicUrl, { cache: 'no-store' });
        if (!response.ok) return [];
        const data = await response.json();
        if (Array.isArray(data)) return data;
    } catch (error) {
        console.warn(`Impossibile leggere ${type} da Firebase:`, error);
    }
    return [];
}
async function persistCollection(type, items) {
    const database = getFirebaseDatabase();
    if (!database) {
        throw new Error('Firebase non disponibile. Verifica configurazione e login admin.');
    }
    await database.ref(`${contentDatabasePath}/${type}`).set(items);
}
function isAdminAuthenticated() {
    return sessionStorage.getItem(adminSessionKey) === 'true';
}
function setAdminAuthenticated(value) {
    if (value) sessionStorage.setItem(adminSessionKey, 'true');
    else sessionStorage.removeItem(adminSessionKey);
}
async function moveCollectionItem(type, itemId, direction) {
    const items = await loadCollection(type);
    const index = items.findIndex(item => item.id === itemId);
    if (index < 0) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const [entry] = items.splice(index, 1);
    items.splice(targetIndex, 0, entry);
    await persistCollection(type, items);
}
async function deleteCollectionItem(type, itemId) {
    const items = (await loadCollection(type)).filter(item => item.id !== itemId);
    await persistCollection(type, items);
}
function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve('');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
        reader.onerror = () => reject(reader.error || new Error('Errore lettura file'));
        reader.readAsDataURL(file);
    });
}
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
function parseDateTime(dateValue = '', timeValue = '') {
    const rawDate = String(dateValue || '').trim();
    const rawTime = String(timeValue || '').trim();
    if (!rawDate && !rawTime) return Number.NaN;
    const localMatch = rawDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/);
    if (localMatch) {
        const [, d, m, y, dateHour = '', dateMinute = ''] = localMatch;
        const timeMatch = rawTime.match(/^(\d{1,2}):(\d{2})/);
        const h = timeMatch ? timeMatch[1] : (dateHour || '0');
        const min = timeMatch ? timeMatch[2] : (dateMinute || '0');
        return new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min)).getTime();
    }
    const combined = rawTime ? `${rawDate} ${rawTime}` : rawDate;
    const parsed = new Date(combined).getTime();
    return Number.isFinite(parsed) ? parsed : Number.NaN;
}
function readItemGeo(item) {
    const lat = Number(item?.geo?.lat ?? item?.lat);
    const lng = Number(item?.geo?.lng ?? item?.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
}

function buildNightGallerySeedEntries() {
    return [
        {
            id: 'night-photo-1',
            title: 'Notte 1',
            date: '01/08/2026',
            time: '22:00',
            km: '0',
            location: 'Via al Laghetto, 6832 Chiasso',
            tag: 'night',
            description: 'Prima notte del percorso',
            image: 'data/Night_1.jpg',
            geo: { lat: 45.8259066594, lng: 9.0140666007 }
        },
        {
            id: 'night-photo-2',
            title: 'Notte 2',
            date: '02/08/2026',
            time: '22:00',
            km: '0',
            location: 'A Tasín 2, 6702 Claro',
            tag: 'night',
            description: 'Seconda notte del percorso',
            image: 'data/Night_2.jpg',
            geo: { lat: 46.2565465111, lng: 9.0111590127 }
        },
        {
            id: 'night-photo-3',
            title: 'Notte 3',
            date: '03/08/2026',
            time: '22:00',
            km: '0',
            location: 'Gotthard-Strassentunnel 41, 6493 Hospental',
            tag: 'night',
            description: 'Terza notte del percorso',
            image: 'data/Night_3.jpg',
            geo: { lat: 46.5913747331, lng: 8.5618263165 }
        },
        {
            id: 'night-photo-4',
            title: 'Notte 4',
            date: '04/08/2026',
            time: '22:00',
            km: '0',
            location: 'Rottannenstrasse, Arth',
            tag: 'night',
            description: 'Quarta notte del percorso',
            image: 'data/Night_4.jpg',
            geo: { lat: 47.0562228192, lng: 8.5364110764 }
        },
        {
            id: 'night-photo-5',
            title: 'Notte 5',
            date: '05/08/2026',
            time: '22:00',
            km: '0',
            location: 'GGPQ+RG, 8180 Bülach',
            tag: 'night',
            description: 'Quinta notte del percorso',
            image: 'data/Night_5.jpg',
            geo: { lat: 47.5263890229, lng: 8.5443702332 }
        }
    ];
}

function mergeNightGalleryEntries(items) {
    const current = Array.isArray(items) ? items : [];
    const seedEntries = buildNightGallerySeedEntries();
    const existingIds = new Set(current.map(item => String(item?.id || '')));
    const missing = seedEntries.filter(entry => !existingIds.has(entry.id));
    return [...current, ...missing];
}

async function syncNightGalleryEntriesToFirebase() {
    const galleryItems = await loadCollection('gallery');
    const merged = mergeNightGalleryEntries(galleryItems);
    if (merged.length !== galleryItems.length) {
        await persistCollection('gallery', merged);
    }
}

function buildUnifiedDiaryTimelineEntries(diaryEntries, timelineEntries) {
    const diaryItems = diaryEntries.map((entry, index) => ({
        ...entry,
        _source: 'diary',
        _sortTs: parseDateTime(entry.date),
        _sortIndex: index,
        _title: entry.title || `Diario ${index + 1}`,
        _subtitle: `${entry.date || 'Data non impostata'} · ${entry.km || '0'} km`,
        _text: entry.text || '',
        _image: entry.image || ''
    }));
    const timelineItems = timelineEntries.map((entry, index) => ({
        ...entry,
        _source: 'timeline',
        _sortTs: parseDateTime(entry.date, entry.time),
        _sortIndex: index,
        _title: entry.title || `Aggiornamento ${index + 1}`,
        _subtitle: `${entry.date || 'Data non impostata'} ${entry.time || '--:--'}`.trim(),
        _text: entry.description || '',
        _image: entry.image || ''
    }));
    return [...diaryItems, ...timelineItems]
        .sort((a, b) => {
            const aTs = Number.isFinite(a._sortTs) ? a._sortTs : Number.POSITIVE_INFINITY;
            const bTs = Number.isFinite(b._sortTs) ? b._sortTs : Number.POSITIVE_INFINITY;
            if (aTs !== bTs) return aTs - bTs;
            return a._sortIndex - b._sortIndex;
        });
}
async function loadUnifiedMediaItems() {
    const [diaryEntries, timelineEntries, galleryEntriesRaw] = await Promise.all([
        loadCollection('diary'),
        loadCollection('timeline'),
        loadCollection('gallery')
    ]);
    const galleryEntries = mergeNightGalleryEntries(galleryEntriesRaw);
    const media = [];
    diaryEntries.forEach((entry, index) => {
        if (!entry.image) return;
        media.push({
            id: entry.id || createRecordId('media-diary'),
            source: 'Diario',
            title: entry.title || `Diario ${index + 1}`,
            location: `${entry.date || 'Data non impostata'} · ${entry.km || '0'} km`,
            description: entry.text || '',
            image: entry.image,
            geo: readItemGeo(entry),
            sortTs: parseDateTime(entry.date)
        });
    });
    timelineEntries.forEach((entry, index) => {
        if (!entry.image) return;
        media.push({
            id: entry.id || createRecordId('media-timeline'),
            source: 'Timeline',
            title: entry.title || `Aggiornamento ${index + 1}`,
            location: `${entry.date || 'Data non impostata'} ${entry.time || '--:--'}`.trim(),
            description: entry.description || '',
            image: entry.image,
            geo: readItemGeo(entry),
            sortTs: parseDateTime(entry.date, entry.time)
        });
    });
    galleryEntries.forEach((entry, index) => {
        if (!entry.image) return;
        const dateSegment = [entry.date, entry.time].filter(Boolean).join(' ').trim();
        const kmSegment = entry.km ? `${entry.km} km` : '';
        const locationLine = [entry.location, dateSegment, kmSegment].filter(Boolean).join(' · ');
        media.push({
            id: entry.id || createRecordId('media-gallery'),
            source: 'Galleria',
            title: entry.title || `Foto ${index + 1}`,
            location: locationLine || 'Localita non impostata',
            description: entry.description || '',
            image: entry.image,
            geo: readItemGeo(entry),
            sortTs: parseDateTime(entry.date, entry.time)
        });
    });
    return media.sort((a, b) => {
        const aTs = Number.isFinite(a.sortTs) ? a.sortTs : Number.POSITIVE_INFINITY;
        const bTs = Number.isFinite(b.sortTs) ? b.sortTs : Number.POSITIVE_INFINITY;
        if (aTs !== bTs) return bTs - aTs;
        return a.title.localeCompare(b.title, 'it');
    });
}
function updateMediaModal() {
    const { items, index, onChange } = mediaModalState;
    const current = items[index];
    if (!current) return;
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalLocation = document.getElementById('modalLocation');
    const modalDescription = document.getElementById('modalDescription');
    if (modalImage) {
        modalImage.src = current.image;
        modalImage.alt = current.title;
    }
    if (modalTitle) modalTitle.textContent = current.title;
    if (modalLocation) modalLocation.textContent = `${current.location || ''}${current.source ? ` · ${current.source}` : ''}`;
    if (modalDescription) modalDescription.textContent = current.description || 'Nessuna descrizione disponibile.';
    if (typeof onChange === 'function') onChange(current, index);
}
function moveMediaModal(step) {
    if (!mediaModalState.items.length) return;
    const length = mediaModalState.items.length;
    mediaModalState.index = (mediaModalState.index + step + length) % length;
    updateMediaModal();
}
function closeMediaModal() {
    document.querySelector('.modal-backdrop')?.classList.remove('active');
}
function openMediaModal(index) {
    if (!mediaModalState.items.length) return;
    const modal = document.querySelector('.modal-backdrop');
    if (!modal) return;
    mediaModalState.index = Math.max(0, Math.min(index, mediaModalState.items.length - 1));
    updateMediaModal();
    modal.classList.add('active');
}
function ensureMediaModalBindings() {
    if (mediaModalState.bound) return;
    const modal = document.querySelector('.modal-backdrop');
    if (!modal) return;
    document.querySelector('.modal-close')?.addEventListener('click', closeMediaModal);
    modal.addEventListener('click', event => {
        if (event.target === modal) closeMediaModal();
    });
    document.getElementById('modalPrev')?.addEventListener('click', () => moveMediaModal(-1));
    document.getElementById('modalNext')?.addEventListener('click', () => moveMediaModal(1));
    const modalImage = document.getElementById('modalImage');
    modalImage?.addEventListener('touchstart', event => {
        mediaModalState.touchStartX = event.changedTouches?.[0]?.screenX ?? null;
    }, { passive: true });
    modalImage?.addEventListener('touchend', event => {
        const startX = mediaModalState.touchStartX;
        const endX = event.changedTouches?.[0]?.screenX ?? null;
        if (!Number.isFinite(startX) || !Number.isFinite(endX)) return;
        const delta = endX - startX;
        if (Math.abs(delta) < 35) return;
        if (delta < 0) moveMediaModal(1);
        else moveMediaModal(-1);
    }, { passive: true });
    document.addEventListener('keydown', event => {
        if (!document.querySelector('.modal-backdrop')?.classList.contains('active')) return;
        if (event.key === 'Escape') closeMediaModal();
        if (event.key === 'ArrowLeft') moveMediaModal(-1);
        if (event.key === 'ArrowRight') moveMediaModal(1);
    });
    mediaModalState.bound = true;
}
function useMediaModal(items, onChange = null) {
    mediaModalState.items = items;
    mediaModalState.index = 0;
    mediaModalState.onChange = onChange;
    ensureMediaModalBindings();
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
    initializeLanguageSupport();
    initializeMobileMenu();
}
function initializeMobileMenu() {
    const topbar = document.querySelector('.topbar');
    const nav = topbar?.querySelector('.main-nav');
    if (!topbar || !nav || topbar.dataset.mobileMenuInit === 'true') return;

    const brandIcon = topbar.querySelector('.brand-icon');
    if (brandIcon) {
        brandIcon.style.cursor = 'pointer';
        brandIcon.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'topbar-menu-toggle';
    toggleButton.id = 'topbarMenuToggle';
    toggleButton.setAttribute('aria-label', 'Apri menu');
    toggleButton.setAttribute('aria-expanded', 'false');
    toggleButton.textContent = '☰';

    topbar.appendChild(toggleButton);

    let overlay = document.querySelector('.mobile-nav-overlay');
    if (!overlay) {
        overlay = document.createElement('button');
        overlay.type = 'button';
        overlay.className = 'mobile-nav-overlay';
        overlay.setAttribute('aria-label', 'Chiudi menu');
        document.body.appendChild(overlay);
    }

    const closeMenu = () => {
        document.body.classList.remove('mobile-nav-open');
        toggleButton.setAttribute('aria-expanded', 'false');
        toggleButton.textContent = '☰';
    };

    toggleButton.addEventListener('click', () => {
        const isOpen = document.body.classList.toggle('mobile-nav-open');
        toggleButton.setAttribute('aria-expanded', String(isOpen));
        toggleButton.textContent = isOpen ? '✕' : '☰';
    });

    overlay.addEventListener('click', closeMenu);

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeMenu();
    });

    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 760) closeMenu();
    });

    topbar.dataset.mobileMenuInit = 'true';
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
    const distanceText = summary.totalDistance === 0 ? '0' : summary.totalDistance.toFixed(1);
    document.getElementById('homeDistance').textContent = distanceText;
    const blended = computeBlendedRemaining(summary);
    const remaining = blended !== null ? blended : Math.max(0, (gpxTotalKm || 290) - summary.totalDistance);
    const completion = computeDynamicProgress(summary.totalDistance, remaining);
    document.getElementById('homeRemaining').textContent = remaining.toFixed(1);
    document.getElementById('homeCompletion').textContent = `${completion.toFixed(1)}%`;
    document.getElementById('homeTime').textContent = summary.duration > 0 ? formatTime(summary.duration) : '0';
    document.getElementById('homeGain').textContent = Math.round(summary.elevationGain);
    document.getElementById('homeSteps').textContent = computeEstimatedSteps(summary.totalDistance, summary.duration).toLocaleString();
    document.getElementById('homeStatusLabel').textContent = summary.status;
    document.getElementById('homeStatusText').textContent = summary.status === 'In movimento'
        ? 'Tracker attivo e aggiornato.'
        : summary.status === 'Non partito'
            ? 'In attesa della partenza: nessun dato live disponibile.'
            : 'Dati disponibili, attesa prossima posizione.';
    updateHomeHeroStatusDot(summary.status);
    updateHomeStateLegend(summary.status);
}
function updateHomeHeroStatusDot(statusLabel) {
    const dot = document.getElementById('homeStatusDot');
    if (!dot) return;
    dot.classList.remove('status-not-started', 'status-moving', 'status-paused', 'status-ended', 'status-completed');
    const activeKey = normalizeHomeStatus(statusLabel);
    if (activeKey === 'moving') dot.classList.add('status-moving');
    else if (activeKey === 'paused') dot.classList.add('status-paused');
    else if (activeKey === 'ended') dot.classList.add('status-ended');
    else if (activeKey === 'completed') dot.classList.add('status-completed');
    else dot.classList.add('status-not-started');
}
function normalizeHomeStatus(status) {
    const value = String(status || '').toLowerCase();
    if (value.includes('mov')) return 'moving';
    if (value.includes('paus')) return 'paused';
    if (value.includes('fine')) return 'ended';
    if (value.includes('complet')) return 'completed';
    return 'not-started';
}

function updateHomeStateLegend(statusLabel) {
    const label = statusLabel || 'Non partito';
    const stateLabel = document.getElementById('homeAdventureState');
    if (stateLabel) stateLabel.textContent = label;

    const activeKey = normalizeHomeStatus(label);
    document.querySelectorAll('.status-grid .status-pill').forEach(pill => pill.classList.remove('active'));
    const activePill = document.getElementById(`homeState-${activeKey}`);
    if (activePill) activePill.classList.add('active');
}

function buildHomePreStartSummary() {
    return {
        totalDistance: 0,
        duration: 0,
        elevationGain: 0,
        status: 'Non partito',
        lastPoint: null,
        points: [],
        speed: 0,
        progress: 0
    };
}
function buildDashboardPreStartSummary() {
    return {
        points: [],
        lastPoint: null,
        totalDistance: 0,
        duration: 0,
        speed: 0,
        elevationGain: 0,
        progress: 0,
        status: 'Non partito'
    };
}
function buildLivePreStartSummary() {
    return {
        points: [],
        lastPoint: null,
        totalDistance: 0,
        duration: 0,
        speed: 0,
        elevationGain: 0,
        progress: 0,
        status: 'Non partito'
    };
}
function updateDashboardSummary(summary) {
    const metricDistance = document.getElementById('metricDistance');
    const metricRemaining = document.getElementById('metricRemaining');
    const metricCompletion = document.getElementById('metricCompletion');
    const metricSpeed = document.getElementById('metricSpeed');
    const metricAltitude = document.getElementById('metricAltitude');
    const metricElevation = document.getElementById('metricElevation');
    const metricTime = document.getElementById('metricTime');

    const distanceText = summary.totalDistance === 0 ? '0' : summary.totalDistance.toFixed(1);
    if (metricDistance) metricDistance.textContent = `${distanceText} km`;
    const blended = computeBlendedRemaining(summary);
    const remaining = blended !== null ? blended : Math.max(0, (gpxTotalKm || 290) - summary.totalDistance);
    const completion = computeDynamicProgress(summary.totalDistance, remaining);
    const completionText = completion === 0 ? '0%' : `${completion.toFixed(1)}%`;
    if (metricRemaining) metricRemaining.textContent = `${remaining.toFixed(1)} km`;
    if (metricCompletion) metricCompletion.textContent = completionText;
    if (metricSpeed) metricSpeed.textContent = `${summary.speed.toFixed(1)} km/h`;
    const altitude = Number(summary.lastPoint?.altitudine?.metri ?? 0);
    if (metricAltitude) metricAltitude.textContent = `${altitude.toFixed(0)} m`;
    if (metricElevation) metricElevation.textContent = `${Math.round(summary.elevationGain)} m`;
    if (metricTime) metricTime.textContent = summary.duration > 0 ? formatTime(summary.duration) : '0';
}
function initHomeCountdown() {
    const dayEl = document.getElementById('countdownDays');
    const hourEl = document.getElementById('countdownHours');
    const minuteEl = document.getElementById('countdownMinutes');
    const secondEl = document.getElementById('countdownSeconds');
    const messageEl = document.getElementById('countdownMessage');
    const countdownEl = document.getElementById('homeCountdown');
    if (!dayEl || !hourEl || !minuteEl || !secondEl || !messageEl) return;

    const hideCountdown = () => {
        if (!countdownEl) return;
        countdownEl.hidden = true;
        countdownEl.classList.add('is-finished');
    };

    const target = new Date(plannedStartDateIso).getTime();

    const render = () => {
        const diffMs = target - Date.now();
        if (diffMs <= 0) {
            dayEl.textContent = '0';
            hourEl.textContent = '00';
            minuteEl.textContent = '00';
            secondEl.textContent = '00';
            messageEl.textContent = 'La partenza prevista e in corso.';
            hideCountdown();
            return true;
        }

        const totalSeconds = Math.floor(diffMs / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        dayEl.textContent = String(days);
        hourEl.textContent = String(hours).padStart(2, '0');
        minuteEl.textContent = String(minutes).padStart(2, '0');
        secondEl.textContent = String(seconds).padStart(2, '0');
        messageEl.textContent = 'Countdown aggiornato in tempo reale.';
        return false;
    };

    if (render()) return;
    const timer = setInterval(() => {
        if (render()) clearInterval(timer);
    }, 1000);
}

function updateHomeCountdownVisibility(summary) {
    const countdown = document.getElementById('homeCountdown');
    if (!countdown) return;
    const started = Boolean(summary?.lastPoint) || Number(summary?.totalDistance || 0) > 0;
    const countdownFinished = Date.now() >= new Date(plannedStartDateIso).getTime();
    const shouldHide = started || countdownFinished;
    countdown.hidden = shouldHide;
    countdown.classList.toggle('is-finished', shouldHide);
}

function renderEmptyState(container, title, text) {
    if (!container) return;
    const card = document.createElement('article');
    card.className = 'empty-state';
    card.innerHTML = `<h3>${title}</h3><p>${text}</p>`;
    container.appendChild(card);
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

async function ensureRouteTrackersLoaded() {
    if (gpxWaypoints.length) return;
    if (trackersLoadPromise) {
        await trackersLoadPromise;
        return;
    }
    trackersLoadPromise = fetch(trackerDataUrl)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data)) return;
            gpxWaypoints = data.map((entry, index) => ({
                lat: Number(entry?.lat),
                lng: Number(entry?.lon),
                name: String(entry?.name || '').trim(),
                index
            })).filter(point => Number.isFinite(point.lat) && Number.isFinite(point.lng));
        })
        .catch(error => {
            console.warn('Impossibile caricare tracker separati:', error);
        })
        .finally(() => {
            trackersLoadPromise = null;
        });
    await trackersLoadPromise;
}

function buildRouteLabel(prefix, index) {
    return `${prefix} ${index + 1}`;
}

function formatWaypointLabel(name, index) {
    const raw = String(name || '').trim();
    if (!raw) return buildRouteLabel('Night', index);
    return raw.replace(/_/g, ' ');
}

function buildNightMarkerIcon(label) {
    return null;
}

function buildStartFinishMarkerIcon(type) {
    const isStart = type === 'start';
    if (isStart) return null;
    return L.divIcon({
        className: `route-marker route-marker--${type}`,
        html: `<div class="route-marker__wrap"><span class="route-marker__pin"><span>${isStart ? 'S' : 'F'}</span></span><span class="route-marker__label">${isStart ? 'Partenza' : 'Arrivo'}</span></div>`,
        iconSize: [90, 56],
        iconAnchor: [45, 52],
        popupAnchor: [0, -44]
    });
}

function renderRouteTrackers() {
    if (!mapInstance || typeof L === 'undefined' || !gpxWaypoints.length) return;
    if (routeMarkerGroup) {
        mapInstance.removeLayer(routeMarkerGroup);
    }
    routeMarkerGroup = L.layerGroup().addTo(mapInstance);
    const trackerWaypoints = gpxWaypoints.filter((waypoint, index) => index < gpxWaypoints.length - 1 && !/ziel/i.test(waypoint.name));
    trackerWaypoints.forEach((waypoint, index) => {
        const label = formatWaypointLabel(waypoint.name, index);
        const marker = L.marker([waypoint.lat, waypoint.lng]).addTo(routeMarkerGroup);
        marker.bindPopup(`<strong>${escapeHtml(label)}</strong>`);
    });
}

async function ensureGpxDataLoaded() {
    if (gpxCoords.length && Number.isFinite(gpxTotalKm) && gpxTotalKm > 0) return;
    if (gpxLoadPromise) {
        await gpxLoadPromise;
        return;
    }
    gpxLoadPromise = fetch('data/NorthLine.gpx')
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
function initMap(options = {}) {
    const showRouteTrackers = options.showRouteTrackers === true;
    if (mapInstance) return;
    if (typeof L === 'undefined') return;
    ensureLeafletAssets();
    const tileProviders = getTileProviders();
    mapInstance = L.map('map', { zoomControl: false }).setView(defaultCenter, defaultZoom);
    activeLayer = tileProviders.osm.addTo(mapInstance);
    L.control.zoom({ position: 'topright' }).addTo(mapInstance);
    addMapControl();
    const gpxUrl = 'data/NorthLine.gpx';
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
                    if (showRouteTrackers) {
                        ensureRouteTrackersLoaded().then(() => renderRouteTrackers()).catch(() => {});
                    }
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
    const distanceText = summary.totalDistance === 0 ? '0' : summary.totalDistance.toFixed(1);
    document.getElementById('distance').textContent = `${distanceText} km`;
    const blendedRemaining = computeBlendedRemaining(summary);
    const remaining = blendedRemaining !== null ? blendedRemaining : Math.max(0, (gpxTotalKm || 290) - summary.totalDistance);
    const completion = computeDynamicProgress(summary.totalDistance, remaining);
    const completionText = completion === 0 ? '0%' : `${completion.toFixed(1)}%`;
    document.getElementById('remaining').textContent = `${remaining.toFixed(1)} km`;
    document.getElementById('completion').textContent = completionText;
    document.getElementById('completionText').textContent = completionText;
    document.getElementById('speed').textContent = `${summary.speed.toFixed(1)} km/h`;
    const altitude = Number(summary.lastPoint?.altitudine?.metri ?? 0);
    document.getElementById('altitude').textContent = `${altitude.toFixed(0)} m`;
    document.getElementById('lastUpdate').textContent = summary.lastPoint?.orario ? formatRelativeDate(summary.lastPoint.orario) : '0 s';
    document.getElementById('time').textContent = summary.duration > 0 ? formatTime(summary.duration) : '0';
    document.getElementById('elevation').textContent = `${Math.round(summary.elevationGain)} m`;
    document.getElementById('steps').textContent = computeEstimatedSteps(summary.totalDistance, summary.duration).toLocaleString();
    document.getElementById('progressBar').style.width = `${completion.toFixed(1)}%`;
}

function updateVisitorDistance(lastPoint) {
    const label = document.getElementById('visitorDistanceLabel');
    const visitorDistanceField = document.getElementById('visitorDistance');
    const startCoord = gpxCoords.length ? gpxCoords[0] : null;
    const hasLivePosition = Number.isFinite(lastPoint?.coordinate?.lat) && Number.isFinite(lastPoint?.coordinate?.lon);
    const referenceLat = hasLivePosition ? lastPoint.coordinate.lat : startCoord?.lat;
    const referenceLon = hasLivePosition ? lastPoint.coordinate.lon : startCoord?.lng;

    if (label) {
        label.textContent = hasLivePosition ? 'Distanza visitatore' : 'Distanza dalla partenza';
    }

    if (!Number.isFinite(referenceLat) || !Number.isFinite(referenceLon)) {
        if (visitorDistanceField) visitorDistanceField.textContent = '0 km';
        return;
    }

    if (!navigator.geolocation) {
        if (visitorDistanceField) visitorDistanceField.textContent = 'Non supportato';
        return;
    }

    navigator.geolocation.getCurrentPosition(position => {
        showVisitorMarker(position);
        const distanceKm = haversineKm(position.coords.latitude, position.coords.longitude, referenceLat, referenceLon);
        if (visitorDistanceField) visitorDistanceField.textContent = `${distanceKm.toFixed(1)} km`;
    }, () => {
        if (visitorDistanceField) visitorDistanceField.textContent = 'Permesso negato';
    });
}
async function initLivePage() {
    initializeTheme();
    updateLiveUI(buildLivePreStartSummary());
    await Promise.all([ensureGpxDataLoaded(), ensureRouteTrackersLoaded()]);
    initMap({ showRouteTrackers: true });
    buildNav();
    const points = await fetchPoints();
    const summary = buildSummary(points) || buildLivePreStartSummary();
    updateLiveUI(summary);
    if (summary.lastPoint) {
        refreshMapRoute(summary.points);
    }
    updateVisitorDistance(summary.lastPoint);
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
        const summary = buildSummary(points) || buildLivePreStartSummary();
        updateLiveUI(summary);
        if (summary.lastPoint) {
            refreshMapRoute(summary.points);
        }
        updateVisitorDistance(summary.lastPoint);
    }, 8000);
}
async function initHomePage() {
    initializeTheme();
    initHomeCountdown();
    await ensureGpxDataLoaded();
    const points = await fetchPoints();
    const summary = buildSummary(points) || buildHomePreStartSummary();
    updateHomeSummary(summary);
    updateHomeCountdownVisibility(summary);
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
    updateDashboardSummary(buildDashboardPreStartSummary());
    await ensureGpxDataLoaded();
    const points = await fetchPoints();
    const summary = buildSummary(points) || buildDashboardPreStartSummary();
    updateDashboardSummary(summary);
    const xAxisSelect = document.getElementById('chartXAxisMode');
    const storedXAxisMode = localStorage.getItem('northline-chart-x-axis');
    const xAxisMode = storedXAxisMode === 'time' ? 'time' : 'distance';
    if (xAxisSelect) xAxisSelect.value = xAxisMode;
    const hasLiveData = points.length > 0;
    const chartCards = Array.from(document.querySelectorAll('.chart-grid .metric-card'));
    const setChartsEmpty = empty => {
        chartCards.forEach(card => {
            card.classList.toggle('chart-empty', empty);
            let note = card.querySelector('.chart-empty-note');
            if (empty && !note) {
                note = document.createElement('p');
                note.className = 'chart-empty-note';
                note.textContent = 'Grafico disponibile alla partenza.';
                card.appendChild(note);
            }
            if (!empty && note) note.remove();
            const canvas = card.querySelector('canvas');
            if (empty && canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        });
    };

    if (xAxisSelect) xAxisSelect.disabled = !hasLiveData;

    if (!hasLiveData) {
        Object.keys(chartInstances).forEach(key => {
            chartInstances[key]?.destroy();
            delete chartInstances[key];
        });
        setChartsEmpty(true);
        return;
    }

    setChartsEmpty(false);
    const chartData = buildChartData(points, summary);

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
    const items = await loadUnifiedMediaItems();
    const grid = document.querySelector('.gallery-grid');
    if (!grid) return;

    if (!items.length) {
        renderEmptyState(
            grid,
            'Galleria vuota',
            'Nessuna immagine disponibile al momento. Le foto verranno aggiunte dalla prossima pubblicazione.'
        );
        await initGalleryPhotoMap([]);
        return;
    }

    useMediaModal(items);

    items.forEach((item, index) => {
        const card = document.createElement('article');
        card.className = 'gallery-item';
        card.innerHTML = `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}"><div class="gallery-meta"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.location || item.source || '')}</p></div>`;
        card.addEventListener('click', () => {
            openMediaModal(index);
        });
        grid.appendChild(card);
    });
    await initGalleryPhotoMap(items);
}
async function initDiaryPage() {
    initializeTheme();
    const [diaryEntries, timelineEntries] = await Promise.all([
        loadCollection('diary'),
        loadCollection('timeline')
    ]);
    const entries = buildUnifiedDiaryTimelineEntries(diaryEntries, timelineEntries);
    const container = document.querySelector('.diary-list');
    if (!container) return;

    if (!entries.length) {
        renderEmptyState(
            container,
            'Diario vuoto',
            'Ancora nessuna voce pubblicata. I racconti e gli aggiornamenti cronologici verranno inseriti durante il percorso.'
        );
        return;
    }

    entries.forEach(entry => {
        const article = document.createElement('article');
        article.className = 'diary-entry';
        article.innerHTML = `${entry._image ? `<img src="${escapeHtml(entry._image)}" alt="${escapeHtml(entry._title)}">` : ''}<div><time>${escapeHtml(entry._subtitle)}</time><h3>${escapeHtml(entry._title)}</h3><p>${escapeHtml(entry._text)}</p></div>`;
        container.appendChild(article);
    });
}
async function initTimelinePage() {
    await initDiaryPage();
}
async function renderAdminCollection(type) {
    const list = document.querySelector(`[data-admin-list="${type}"]`);
    if (!list) return;
    const items = await loadCollection(type);
    list.innerHTML = '';
    if (!items.length) {
        renderEmptyState(list, 'Nessun contenuto', 'Questa sezione e ancora vuota.');
        return;
    }
    items.forEach((item, index) => {
        const article = document.createElement('article');
        article.className = 'admin-item-card';
        const meta = document.createElement('div');
        meta.className = 'admin-item-meta';
        const heading = document.createElement('h3');
        heading.textContent = item.title || item.location || item.time || `Elemento ${index + 1}`;
        const info = document.createElement('p');
        info.textContent = type === 'gallery'
            ? `${item.tag || 'senza tag'} · ${item.location || 'nessuna localita'}${item.date ? ` · ${item.date}${item.time ? ` ${item.time}` : ''}` : ''}${item.km ? ` · ${item.km} km` : ''}`
            : type === 'diary'
                ? `${item.date || 'nessuna data'} · ${item.km || '0'} km`
                : `${item.date || 'nessuna data'} ${item.time || '--:--'} · ${item.description || ''}`;
        meta.append(heading, info);
        const actions = document.createElement('div');
        actions.className = 'admin-item-actions';
        const upButton = document.createElement('button');
        upButton.type = 'button';
        upButton.className = 'button secondary';
        upButton.textContent = 'Su';
        upButton.disabled = index === 0;
        upButton.addEventListener('click', async () => {
            await moveCollectionItem(type, item.id, 'up');
            await renderAdminCollection(type);
        });
        const downButton = document.createElement('button');
        downButton.type = 'button';
        downButton.className = 'button secondary';
        downButton.textContent = 'Giu';
        downButton.disabled = index === items.length - 1;
        downButton.addEventListener('click', async () => {
            await moveCollectionItem(type, item.id, 'down');
            await renderAdminCollection(type);
        });
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'button ghost';
        deleteButton.textContent = 'Cancella';
        deleteButton.addEventListener('click', async () => {
            // Optimistic UI: remove immediately, then persist in background.
            article.remove();
            try {
                await deleteCollectionItem(type, item.id);
                if (!list.children.length) {
                    renderEmptyState(list, 'Nessun contenuto', 'Questa sezione e ancora vuota.');
                }
            } catch (error) {
                await renderAdminCollection(type);
            }
        });
        actions.append(upButton, downButton, deleteButton);
        article.append(meta, actions);
        list.append(article);
    });
}
function formatAdminNow() {
    const now = new Date();
    const pad = value => String(value).padStart(2, '0');
    return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}
function setAdminFeedbackMessage(element, message, isError = false) {
    if (!element) return;
    element.textContent = message || '';
    element.classList.toggle('is-error', Boolean(message) && isError);
}
function showAdminSaveNotice(message, isError = false) {
    setAdminFeedbackMessage(document.getElementById('adminSaveNotice'), message, isError);
}
async function reverseGeocodeNearestLocation(lat, lng) {
    const endpoint = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=14&addressdetails=1`;
    const response = await fetch(endpoint, {
        headers: {
            'Accept': 'application/json',
            'Accept-Language': 'it'
        }
    });
    if (!response.ok) throw new Error('Servizio localita non disponibile');
    const payload = await response.json();
    const address = payload?.address || {};
    const primary = address.city || address.town || address.village || address.hamlet || address.suburb || address.municipality || '';
    const secondary = address.state || address.county || '';
    const compact = [primary, secondary].filter(Boolean).join(', ');
    if (compact) return compact;
    const fallback = String(payload?.display_name || '').split(',').slice(0, 2).join(',').trim();
    return fallback || 'Localita non trovata';
}
function initAdminFormHelpers() {
    const form = document.querySelector('[data-admin-form="gallery"]');
    if (!form) return;
    const status = document.getElementById('adminGalleryGeoStatus');
    const latField = form.querySelector('[name="lat"]');
    const lngField = form.querySelector('[name="lng"]');
    const locationField = form.querySelector('[name="location"]');
    const dateField = form.querySelector('[name="date"]');
    const timeField = form.querySelector('[name="time"]');
    const kmField = form.querySelector('[name="km"]');
    const geoButton = document.getElementById('adminGalleryGeoBtn');
    const mapButton = document.getElementById('adminGalleryMapBtn');
    const nowButton = document.getElementById('adminGalleryNowBtn');
    const kmNowButton = document.getElementById('adminGalleryKmNowBtn');
    const wrap = document.getElementById('adminGalleryMapPickerWrap');
    const mapId = 'adminGalleryMapPicker';

    let cachedCurrentCoords = null;
    let pickerMap = null;
    let pickerMarker = null;
    let reverseRequestId = 0;

    const setStatus = text => {
        if (status) status.textContent = text;
    };
    const setCoords = async (lat, lng, labelPrefix = 'Posizione impostata') => {
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        if (latField) latField.value = String(lat);
        if (lngField) lngField.value = String(lng);
        setStatus(`${labelPrefix}: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        if (!locationField) return;
        locationField.value = 'Ricerca localita...';
        const reqId = ++reverseRequestId;
        try {
            const locality = await reverseGeocodeNearestLocation(lat, lng);
            if (reqId !== reverseRequestId) return;
            locationField.value = locality;
            setStatus(`${labelPrefix}: ${lat.toFixed(5)}, ${lng.toFixed(5)} · ${locality}`);
        } catch {
            if (reqId !== reverseRequestId) return;
            locationField.value = 'Localita non trovata';
            setStatus(`${labelPrefix}: ${lat.toFixed(5)}, ${lng.toFixed(5)} · localita non disponibile`);
        }
    };
    const requestCurrentPosition = (onSuccess, onError) => {
        if (!navigator.geolocation) {
            onError?.();
            return;
        }
        navigator.geolocation.getCurrentPosition(position => {
            cachedCurrentCoords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            onSuccess?.(cachedCurrentCoords);
        }, () => {
            onError?.();
        }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
    };

    if (form.dataset.preloadedGeo !== 'true') {
        requestCurrentPosition(coords => {
            const hasLat = Number.isFinite(Number(latField?.value));
            const hasLng = Number.isFinite(Number(lngField?.value));
            if (!hasLat || !hasLng) {
                setCoords(coords.lat, coords.lng, 'Posizione attuale pronta');
            } else {
                setStatus('Posizione attuale pronta');
            }
        }, () => {
            setStatus('Posizione attuale non disponibile');
        });
        form.dataset.preloadedGeo = 'true';
    }

    if (nowButton && nowButton.dataset.bound !== 'true') {
        nowButton.addEventListener('click', () => {
            const now = new Date();
            const pad = value => String(value).padStart(2, '0');
            if (dateField) dateField.value = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
            if (timeField) timeField.value = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
        });
        nowButton.dataset.bound = 'true';
    }

    if (kmNowButton && kmNowButton.dataset.bound !== 'true') {
        kmNowButton.addEventListener('click', async () => {
            if (!kmField) return;
            const original = kmNowButton.textContent;
            kmNowButton.disabled = true;
            kmNowButton.textContent = 'Carico...';
            try {
                const points = await fetchPoints();
                const lastPoint = points[points.length - 1];
                const km = Number(lastPoint?.distanza?.km ?? 0);
                kmField.value = Number.isFinite(km) ? (km === 0 ? '0' : km.toFixed(1)) : '0';
            } catch {
                setStatus('Km attuale non disponibile');
            } finally {
                kmNowButton.disabled = false;
                kmNowButton.textContent = original || 'Km attuale';
            }
        });
        kmNowButton.dataset.bound = 'true';
    }

    if (geoButton && geoButton.dataset.bound !== 'true') {
        geoButton.addEventListener('click', () => {
            if (cachedCurrentCoords) {
                setCoords(cachedCurrentCoords.lat, cachedCurrentCoords.lng, 'Posizione attuale');
                return;
            }
            geoButton.disabled = true;
            geoButton.textContent = 'Rilevo...';
            requestCurrentPosition(coords => {
                setCoords(coords.lat, coords.lng, 'Posizione attuale');
                geoButton.disabled = false;
                geoButton.textContent = 'Usa posizione attuale';
            }, () => {
                setStatus('Posizione non disponibile');
                geoButton.disabled = false;
                geoButton.textContent = 'Usa posizione attuale';
            });
        });
        geoButton.dataset.bound = 'true';
    }

    const ensurePickerMap = () => {
        if (!wrap) return;
        if (pickerMap) {
            setTimeout(() => pickerMap.invalidateSize(), 80);
            return;
        }
        if (typeof L === 'undefined') {
            setStatus('Cartina non disponibile');
            return;
        }
        const startCoords = cachedCurrentCoords || {
            lat: Number(latField?.value ?? Number.NaN),
            lng: Number(lngField?.value ?? Number.NaN)
        };
        const hasStartCoords = Number.isFinite(startCoords.lat) && Number.isFinite(startCoords.lng);
        pickerMap = L.map(mapId, { zoomControl: true }).setView(
            hasStartCoords ? [startCoords.lat, startCoords.lng] : defaultCenter,
            hasStartCoords ? 12 : 11
        );
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(pickerMap);
        if (hasStartCoords) {
            pickerMarker = L.marker([startCoords.lat, startCoords.lng]).addTo(pickerMap);
        }
        pickerMap.on('click', event => {
            const { lat, lng } = event.latlng;
            if (!pickerMarker) pickerMarker = L.marker([lat, lng]).addTo(pickerMap);
            else pickerMarker.setLatLng([lat, lng]);
            setCoords(lat, lng, 'Posizione scelta su cartina');
        });
    };

    if (mapButton && mapButton.dataset.bound !== 'true') {
        mapButton.addEventListener('click', () => {
            if (!wrap) return;
            const isOpening = wrap.hidden;
            wrap.hidden = !isOpening;
            mapButton.textContent = isOpening ? 'Chiudi cartina' : 'Scegli su cartina';
            if (isOpening) ensurePickerMap();
        });
        mapButton.dataset.bound = 'true';
    }

    document.querySelectorAll('[data-tag-suggestion]').forEach(button => {
        if (button.dataset.bound === 'true') return;
        button.addEventListener('click', () => {
            const galleryTagInput = document.querySelector('[data-admin-form="gallery"] [name="tag"]');
            if (!galleryTagInput) return;
            galleryTagInput.value = button.dataset.tagSuggestion || '';
            galleryTagInput.focus();
        });
        button.dataset.bound = 'true';
    });
}
async function handleAdminFormSubmit(type, form) {
    const items = await loadCollection(type);
    const id = createRecordId(type);
    const lat = Number(form.lat?.value ?? Number.NaN);
    const lng = Number(form.lng?.value ?? Number.NaN);
    const geo = Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
    if (type === 'gallery') {
        const image = await readFileAsDataUrl(form.querySelector('[name="image"]')?.files?.[0]);
        items.push({
            id,
            title: form.title.value.trim(),
            date: form.date.value.trim(),
            time: form.time.value.trim(),
            km: form.km.value.trim(),
            location: form.location.value.trim(),
            tag: form.tag.value.trim(),
            description: form.description.value.trim(),
            image,
            geo
        });
    }
    await persistCollection(type, items);
    form.reset();
    const nearestBlock = form.closest('.admin-block');
    nearestBlock?.querySelectorAll('.admin-inline-note').forEach(note => {
        note.textContent = 'Posizione non impostata';
    });
    await renderAdminCollection(type);
}
function bindAdminForm(type) {
    const form = document.querySelector(`[data-admin-form="${type}"]`);
    if (!form || form.dataset.bound === 'true') return;
    form.addEventListener('submit', async event => {
        event.preventDefault();
        try {
            await handleAdminFormSubmit(type, form);
            showAdminSaveNotice('Salvataggio completato su Firebase.');
        } catch (error) {
            showAdminSaveNotice(`Salvataggio fallito: ${error.message || 'errore sconosciuto'}.`, true);
        }
    });
    form.dataset.bound = 'true';
}
function showAdminState(unlocked) {
    const locked = document.getElementById('adminLocked');
    const app = document.getElementById('adminApp');
    if (locked) locked.hidden = unlocked;
    if (app) app.hidden = !unlocked;
}
function initAdminPage() {
    initializeTheme();
    showAdminState(isAdminAuthenticated());
    const loginForm = document.getElementById('adminLoginForm');
    const errorBox = document.getElementById('adminLoginError');
    const successBox = document.getElementById('adminLoginSuccess');
    const auth = getFirebaseAuth();
    const modeLabel = document.getElementById('adminModeLabel');
    const firebaseReady = Boolean(auth && hasUsableFirebaseConfig());
    if (modeLabel) {
        modeLabel.textContent = firebaseReady
            ? 'Autenticazione Firebase attiva. I salvataggi avvengono solo su Firebase.'
            : 'Configurazione Firebase non valida: accesso admin non disponibile finche non completi firebase-config.js.';
    }
    loginForm?.addEventListener('submit', event => {
        event.preventDefault();
        const email = loginForm.querySelector('[name="email"]')?.value || '';
        const password = loginForm.querySelector('[name="password"]')?.value || '';
        if (errorBox) errorBox.textContent = '';
        setAdminFeedbackMessage(successBox, '', false);

        if (!firebaseReady) {
            if (errorBox) errorBox.textContent = 'Completa la configurazione Firebase per poter accedere.';
            return;
        }

        if (!email || !password) {
            if (errorBox) errorBox.textContent = 'Inserisci email e password Firebase.';
            return;
        }

        const unlockAdmin = async () => {
            setAdminAuthenticated(true);
            if (errorBox) errorBox.textContent = '';
            setAdminFeedbackMessage(successBox, 'Accesso riuscito: pannello admin sbloccato.', false);
            showAdminState(true);
            initAdminFormHelpers();
            bindAdminForm('gallery');
            await syncNightGalleryEntriesToFirebase();
            await renderAdminCollection('gallery');
            loginForm.reset();
        };

        auth.signInWithEmailAndPassword(email, password)
            .then(unlockAdmin)
            .catch(error => {
                if (errorBox) errorBox.textContent = `Login Firebase fallito: ${error.message}`;
            });
    });
    document.getElementById('adminLogoutBtn')?.addEventListener('click', () => {
        getFirebaseAuth()?.signOut().catch(() => {});
        setAdminAuthenticated(false);
        showAdminSaveNotice('', false);
        setAdminFeedbackMessage(successBox, '', false);
        showAdminState(false);
    });
    if (isAdminAuthenticated()) {
        initAdminFormHelpers();
        bindAdminForm('gallery');
        syncNightGalleryEntriesToFirebase()
            .then(() => renderAdminCollection('gallery'))
            .catch(() => renderAdminCollection('gallery'));
    }
}
function getPhotoMarkerIcon(item, zoomLevel) {
    const zoom = Number.isFinite(zoomLevel) ? zoomLevel : 12;
    const size = Math.max(28, Math.min(74, 30 + ((zoom - 10) * 3)));
    return L.divIcon({
        className: 'photo-thumb-marker',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        html: `<span class="photo-thumb-wrap" style="width:${size}px;height:${size}px;"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}"></span>`
    });
}
function bindPhotoMapFullscreen() {
    const fullscreenBtn = document.getElementById('galleryPhotoMapFullscreenBtn');
    const mapWrap = document.querySelector('.map-wrap-photo-gallery');
    if (!fullscreenBtn || !mapWrap) return;
    fullscreenBtn.addEventListener('click', () => {
        mapWrap.classList.toggle('map-wrap--fullscreen');
        const isFullscreen = mapWrap.classList.contains('map-wrap--fullscreen');
        fullscreenBtn.textContent = isFullscreen ? '🡼' : '⛶';
        fullscreenBtn.title = isFullscreen ? 'Esci da schermo intero' : 'Mappa a schermo intero';
        setTimeout(() => mapInstance?.invalidateSize(), 120);
    });
}
async function initGalleryPhotoMap(items) {
    initMap({ showRouteTrackers: false });
    if (!mapInstance) return;
    bindPhotoMapFullscreen();

    const statusLabel = document.getElementById('galleryPhotoMapStatus');
    const geoItems = items.filter(item => item.geo);
    const points = await fetchPoints();

    if (!geoItems.length) {
        if (statusLabel) {
            statusLabel.textContent = items.length
                ? 'Nessuna foto con posizione disponibile.'
                : 'Nessuna immagine disponibile.';
        }
        if (points.length) refreshMapRoute(points);
        return;
    }

    if (points.length) refreshMapRoute(points);

    const bounds = L.latLngBounds(geoItems.map(item => [item.geo.lat, item.geo.lng]));
    if (routeLine && typeof routeLine.getBounds === 'function') {
        bounds.extend(routeLine.getBounds());
    }
    mapInstance.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });

    const clusterGroup = typeof L.markerClusterGroup === 'function'
        ? L.markerClusterGroup({
            showCoverageOnHover: false,
            spiderfyOnMaxZoom: true,
            maxClusterRadius: 48
        })
        : L.layerGroup();

    photoMapState.clusterGroup = clusterGroup;
    photoMapState.markerById.clear();

    useMediaModal(geoItems, currentItem => {
        if (!currentItem?.geo || !mapInstance) return;
        mapInstance.panTo([currentItem.geo.lat, currentItem.geo.lng], { animate: true, duration: 0.45 });
        const marker = photoMapState.markerById.get(currentItem.id);
        if (marker?.openPopup) marker.openPopup();
    });

    geoItems.forEach((item, index) => {
        const marker = L.marker([item.geo.lat, item.geo.lng], {
            icon: getPhotoMarkerIcon(item, mapInstance.getZoom())
        });
        marker.bindPopup(`<strong>${escapeHtml(item.title)}</strong><br>${escapeHtml(item.location || '')}`);
        marker.on('click', () => openMediaModal(index));
        photoMapState.markerById.set(item.id, marker);
        clusterGroup.addLayer(marker);
    });

    if (clusterGroup.addTo) clusterGroup.addTo(mapInstance);

    mapInstance.on('zoomend', () => {
        const zoom = mapInstance.getZoom();
        photoMapState.markerById.forEach((marker, id) => {
            const mediaItem = geoItems.find(item => item.id === id);
            if (!mediaItem) return;
            marker.setIcon(getPhotoMarkerIcon(mediaItem, zoom));
        });
    });

    if (statusLabel) {
        statusLabel.textContent = `${geoItems.length} foto geolocalizzate · percorso live visibile`;
    }
}
async function initReplayPage() {
    initializeTheme();
    await ensureGpxDataLoaded();
    initMap({ showRouteTrackers: false });
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
    const badges = [];
    const grid = document.querySelector('.badge-grid');

    if (!badges.length) {
        renderEmptyState(
            grid,
            'Badge non impostati',
            'Nessun traguardo predefinito. Potrai aggiungere i badge quando vorrai iniziare il monitoraggio reale.'
        );
        return;
    }

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
        case 'admin': initAdminPage(); break;
        case 'replay': initReplayPage(); break;
        case 'progress': initProgressPage(); break;
        default: initializeTheme(); break;
    }
}
document.addEventListener('DOMContentLoaded', initPage);
