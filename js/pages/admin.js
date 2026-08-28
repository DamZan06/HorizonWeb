(function () {
    function getFirebaseApp() {
        const config = window.HorizonFirebaseConfig || {};
        if (!config.apiKey || !window.firebase) {
            return null;
        }
        if (!window.firebase.apps.length) {
            window.firebase.initializeApp(config);
        }
        return window.firebase.app();
    }

    function createImageBlob(file, maxSize, quality) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            const objectUrl = URL.createObjectURL(file);
            image.onload = () => {
                URL.revokeObjectURL(objectUrl);
                const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
                const canvas = document.createElement('canvas');
                canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
                canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
                canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Image compression failed.')), 'image/webp', quality);
            };
            image.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                reject(new Error('Selected file is not a readable image.'));
            };
            image.src = objectUrl;
        });
    }

    async function reverseGeocode(lat, lng) {
        const language = document.documentElement.lang || 'en';
        const endpoint = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=14&addressdetails=1&accept-language=${encodeURIComponent(language)}`;
        const response = await fetch(endpoint, { headers: { Accept: 'application/json', 'Accept-Language': language } });
        if (!response.ok) throw new Error('Location lookup unavailable.');
        const payload = await response.json();
        const address = payload?.address || {};
        const primary = address.city || address.town || address.village || address.hamlet || address.suburb || address.municipality || '';
        const secondary = address.state || address.county || '';
        const compact = [primary, secondary].filter(Boolean).join(', ');
        return compact || String(payload?.display_name || '').split(',').slice(0, 2).join(',').trim() || 'Location not found';
    }

    // Wires the "Now", "Current km", "Use current location" and "Choose on map" one-tap helpers.
    function bindGalleryAutomation(form) {
        if (form.dataset.automationBound === 'true') return;
        form.dataset.automationBound = 'true';

        const dateField = form.querySelector('[name="date"]');
        const timeField = form.querySelector('[name="time"]');
        const kmField = form.querySelector('[name="km"]');
        const locationField = form.querySelector('[name="location"]');
        const latField = form.querySelector('[name="lat"]');
        const lngField = form.querySelector('[name="lng"]');
        const geoStatus = document.getElementById('adminGalleryGeoStatus');
        const mapWrap = document.getElementById('adminGalleryMapPickerWrap');
        const mapButton = document.getElementById('adminGalleryMapBtn');
        let pickerMap = null;
        let pickerMarker = null;

        const setStatus = (message) => { if (geoStatus) geoStatus.textContent = message; };

        // Reveals the picker map and drops/moves the marker so the chosen point is always visible.
        const ensurePickerMap = () => {
            if (mapWrap) mapWrap.hidden = false;
            if (mapButton) mapButton.textContent = 'Hide map';
            if (!window.L) return null;
            if (!pickerMap) {
                const center = window.HorizonConfig?.defaultCenter || [46.6, 10.4];
                pickerMap = window.L.map('adminGalleryMapPicker').setView(center, 8);
                window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(pickerMap);
                pickerMap.on('click', (clickEvent) => {
                    const { lat, lng } = clickEvent.latlng;
                    placeMarker(lat, lng);
                    applyPosition(lat, lng, 'Selected on map');
                });
            }
            window.setTimeout(() => pickerMap.invalidateSize(), 50);
            return pickerMap;
        };

        const placeMarker = (lat, lng) => {
            const map = ensurePickerMap();
            if (!map) return;
            if (pickerMarker) pickerMarker.setLatLng([lat, lng]);
            else pickerMarker = window.L.marker([lat, lng]).addTo(map);
            map.setView([lat, lng], Math.max(map.getZoom(), 13));
        };

        const applyPosition = async (lat, lng, label) => {
            if (latField) latField.value = String(lat);
            if (lngField) lngField.value = String(lng);
            setStatus(`${label}: ${lat.toFixed(5)}, ${lng.toFixed(5)} · looking up place name...`);
            try {
                const place = await reverseGeocode(lat, lng);
                if (locationField) locationField.value = place;
                setStatus(`${label}: ${lat.toFixed(5)}, ${lng.toFixed(5)} · ${place}`);
            } catch {
                setStatus(`${label}: ${lat.toFixed(5)}, ${lng.toFixed(5)} · place name unavailable`);
            }
        };

        document.getElementById('adminGalleryNowBtn')?.addEventListener('click', () => {
            const now = new Date();
            if (dateField) dateField.value = now.toLocaleDateString('en-GB');
            if (timeField) timeField.value = now.toTimeString().slice(0, 5);
        });

        document.getElementById('adminGalleryKmNowBtn')?.addEventListener('click', async (event) => {
            const button = event.currentTarget;
            const originalLabel = button.textContent;
            button.disabled = true;
            button.textContent = 'Loading...';
            try {
                const summary = await window.HorizonExpedition?.loadSummary?.({ force: true });
                if (kmField && Number.isFinite(summary?.coveredDistanceKm)) {
                    kmField.value = summary.coveredDistanceKm.toFixed(1);
                }
            } catch {
                // Live distance is optional; the field simply stays as typed.
            } finally {
                button.disabled = false;
                button.textContent = originalLabel;
            }
        });

        document.getElementById('adminGalleryGeoBtn')?.addEventListener('click', () => {
            if (!navigator.geolocation) { setStatus('Geolocation is not supported on this device.'); return; }
            setStatus('Requesting current position...');
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    placeMarker(position.coords.latitude, position.coords.longitude);
                    applyPosition(position.coords.latitude, position.coords.longitude, 'Current position');
                },
                () => setStatus('Location permission denied.'),
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
            );
        });

        mapButton?.addEventListener('click', () => {
            if (mapWrap && !mapWrap.hidden) {
                mapWrap.hidden = true;
                mapButton.textContent = 'Choose on map';
                return;
            }
            ensurePickerMap();
        });
    }

    async function deleteGalleryItem(item, listItemNode) {
        const app = getFirebaseApp();
        if (!app) return;
        const database = window.firebase.database(app);
        const storage = window.firebase.storage(app);
        await database.ref(`${window.HorizonConfig.contentDatabasePath}/gallery/${item.id}`).remove();
        await Promise.allSettled([
            storage.ref(`gallery/${item.id}/full.webp`).delete(),
            storage.ref(`gallery/${item.id}/thumb.webp`).delete()
        ]);
        listItemNode.remove();
    }

    async function renderGalleryList() {
        const list = document.querySelector('[data-admin-list="gallery"]');
        if (!list) return;
        list.innerHTML = '<p class="admin-inline-note">Loading published photos...</p>';
        try {
            const items = await window.HorizonFirebase.fetchGalleryItems();
            list.innerHTML = '';
            if (!items.length) {
                list.innerHTML = '<p class="admin-inline-note">No photos published yet.</p>';
                return;
            }
            items.forEach((item) => {
                const card = document.createElement('article');
                card.className = 'admin-item-card';
                card.innerHTML = `
                    <img src="${item.thumbnailUrl || item.imageUrl}" alt="${item.title || ''}">
                    <div class="admin-item-meta">
                        <h3>${item.title || 'Untitled'}</h3>
                        <p>${[item.date, item.time, item.km ? `${item.km} km` : '', item.location].filter(Boolean).join(' · ')}</p>
                    </div>
                    <div class="admin-item-actions">
                        <button type="button" class="button ghost admin-delete-gallery-item">Delete</button>
                    </div>
                `;
                card.querySelector('.admin-delete-gallery-item')?.addEventListener('click', async (event) => {
                    const button = event.currentTarget;
                    button.disabled = true;
                    button.textContent = 'Deleting...';
                    try {
                        await deleteGalleryItem(item, card);
                    } catch {
                        button.disabled = false;
                        button.textContent = 'Delete';
                    }
                });
                list.appendChild(card);
            });
        } catch {
            list.innerHTML = '<p class="admin-inline-note">Could not load published photos.</p>';
        }
    }

    async function uploadGalleryPhoto(form, notice) {
        const file = form.querySelector('[name="image"]')?.files?.[0];
        if (!file) {
            throw new Error('Select an image first.');
        }

        const app = getFirebaseApp();
        if (!app) {
            throw new Error('Firebase is not configured.');
        }

        const id = `gallery-${crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
        const storage = window.firebase.storage(app);
        const database = window.firebase.database(app);
        const fullBlob = await createImageBlob(file, 2000, 0.82);
        const thumbnailBlob = await createImageBlob(file, 720, 0.78);
        const fullRef = storage.ref(`gallery/${id}/full.webp`);
        const thumbnailRef = storage.ref(`gallery/${id}/thumb.webp`);

        notice.textContent = 'Compressing and uploading image...';
        try {
            await fullRef.put(fullBlob, { contentType: 'image/webp', cacheControl: 'public,max-age=31536000,immutable' });
            await thumbnailRef.put(thumbnailBlob, { contentType: 'image/webp', cacheControl: 'public,max-age=31536000,immutable' });
            const [imageUrl, thumbnailUrl] = await Promise.all([fullRef.getDownloadURL(), thumbnailRef.getDownloadURL()]);
            const lat = Number(form.querySelector('[name="lat"]')?.value);
            const lng = Number(form.querySelector('[name="lng"]')?.value);
            await database.ref(`${window.HorizonConfig.contentDatabasePath}/gallery/${id}`).set({
                id,
                title: form.title.value.trim(),
                date: form.date.value.trim(),
                time: form.time.value.trim(),
                km: form.km.value.trim(),
                location: form.location.value.trim(),
                description: form.description.value.trim(),
                imageUrl,
                thumbnailUrl,
                lat: Number.isFinite(lat) ? lat : null,
                lng: Number.isFinite(lng) ? lng : null,
                createdAt: Date.now()
            });
        } catch (error) {
            await Promise.allSettled([fullRef.delete(), thumbnailRef.delete()]);
            throw error;
        }
    }

    function bindGalleryForm() {
        const form = document.querySelector('[data-admin-form="gallery"]');
        const notice = document.getElementById('adminSaveNotice');
        if (!form) return;
        bindGalleryAutomation(form);
        if (form.dataset.bound === 'true') return;
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            try {
                await uploadGalleryPhoto(form, notice);
                form.reset();
                notice.textContent = 'Photo published successfully.';
                renderGalleryList();
            } catch (error) {
                notice.textContent = `Upload failed: ${error.message || 'unknown error'}`;
            }
        });
        form.dataset.bound = 'true';
    }

    function mapForcedStatusLabel(forcedStatus) {
        if (forcedStatus === 'ended') return 'End of day (forced)';
        if (forcedStatus === 'finished') return 'Finished (forced)';
        return 'Automatic from Garmin/Firebase';
    }

    async function renderLiveStatus() {
        const current = document.getElementById('adminLiveStatusCurrent');
        const select = document.getElementById('adminLiveStatusForm')?.querySelector('[name="forcedStatus"]');
        if (!current) return;
        try {
            const override = await window.HorizonFirebase.fetchLiveStatusOverride();
            const forcedStatus = ['ended', 'finished'].includes(override?.forcedStatus) ? override.forcedStatus : '';
            current.textContent = `Current status: ${mapForcedStatusLabel(forcedStatus)}`;
            if (select) select.value = forcedStatus;
        } catch {
            current.textContent = 'Current status: unavailable';
        }
    }

    function bindLiveStatusForm() {
        const form = document.getElementById('adminLiveStatusForm');
        if (!form || form.dataset.bound === 'true') return;
        form.dataset.bound = 'true';
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const notice = document.getElementById('adminLiveStatusNotice');
            const forcedStatus = String(new FormData(form).get('forcedStatus') || '').trim();
            const app = getFirebaseApp();
            if (!app) { if (notice) notice.textContent = 'Firebase is not configured.'; return; }
            try {
                const database = window.firebase.database(app);
                const reference = database.ref(`${window.HorizonConfig.contentDatabasePath}/liveStatus`);
                if (!forcedStatus) await reference.set(null);
                else await reference.set({ forcedStatus, updatedAt: Date.now() });
                if (notice) notice.textContent = 'Live status saved.';
                renderLiveStatus();
            } catch (error) {
                if (notice) notice.textContent = `Save failed: ${error.message || 'unknown error'}`;
            }
        });
        renderLiveStatus();
    }

    const achievementOverrideDefinitions = {
        cantons: [
            ['gr', 'Graubünden'], ['ur', 'Uri'], ['vs', 'Valais'], ['vd', 'Vaud'], ['ge', 'Geneva']
        ],
        passes: [
            ['piz', 'Piz Chavalatsch'], ['flueela', 'Flüela Pass'], ['strela', 'Strela Pass'], ['oberalp', 'Oberalp Pass'], ['furka', 'Furka Pass']
        ]
    };

    async function renderAchievementOverride(type) {
        const prefix = type === 'cantons' ? 'adminCantonOverride' : 'adminPassOverride';
        const list = document.getElementById(`${prefix}List`);
        const current = document.getElementById(`${prefix}Current`);
        if (!list) return;
        const overrides = await window.HorizonFirebase.fetchAchievementOverrides();
        const selected = new Set(overrides[type] || []);
        list.innerHTML = '';
        achievementOverrideDefinitions[type].forEach(([key, label]) => {
            const item = document.createElement('label');
            item.className = 'admin-hidden-progress-item';
            item.innerHTML = `<input type="checkbox" value="${key}" ${selected.has(key) ? 'checked' : ''}><span class="admin-hidden-progress-copy"><strong>${label}</strong><span>${key.toUpperCase()}</span></span>`;
            list.appendChild(item);
        });
        if (current) current.textContent = `Automatic GPS detection active · ${selected.size}/5 manually activated.`;
    }

    function bindAchievementOverrideForm(type) {
        const prefix = type === 'cantons' ? 'adminCantonOverride' : 'adminPassOverride';
        const form = document.getElementById(`${prefix}Form`);
        const notice = document.getElementById(`${prefix}Notice`);
        if (!form || form.dataset.bound === 'true') return;
        form.dataset.bound = 'true';
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const button = form.querySelector('button[type="submit"]');
            if (button) button.disabled = true;
            try {
                const app = getFirebaseApp();
                const current = await window.HorizonFirebase.fetchAchievementOverrides();
                current[type] = Array.from(form.querySelectorAll('input[type="checkbox"]:checked')).map(input => input.value);
                await window.firebase.database(app).ref(`${window.HorizonConfig.contentDatabasePath}/achievementOverrides`).set({
                    cantons: current.cantons || [], passes: current.passes || [], updatedAt: Date.now()
                });
                if (notice) notice.textContent = 'Manual badge activations saved.';
                await renderAchievementOverride(type);
            } catch (error) {
                if (notice) notice.textContent = `Save failed: ${error.message || 'unknown error'}`;
            } finally {
                if (button) button.disabled = false;
            }
        });
        renderAchievementOverride(type).catch(() => { if (notice) notice.textContent = 'Could not load manual activations.'; });
    }

    function unlockAdminPanel() {
        document.getElementById('adminLocked').hidden = true;
        document.getElementById('adminApp').hidden = false;
        bindGalleryForm();
        renderGalleryList();
        bindLiveStatusForm();
        bindAchievementOverrideForm('cantons');
        bindAchievementOverrideForm('passes');
    }

    function init() {
        const form = document.getElementById('adminLoginForm');
        const error = document.getElementById('adminLoginError');
        const mode = document.getElementById('adminModeLabel');
        const config = window.HorizonFirebaseConfig || {};
        const configured = Boolean(config.apiKey && config.databaseURL && window.firebase);
        if (mode) mode.textContent = configured ? 'Changes are published through authenticated Firebase services.' : 'Publishing is disabled: Firebase credentials are not configured in this repository.';
        form?.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!configured) { if (error) error.textContent = 'Admin sign-in is unavailable until Firebase public client configuration is supplied.'; return; }
            try {
                const app = getFirebaseApp();
                const data = new FormData(form);
                await window.firebase.auth(app).signInWithEmailAndPassword(String(data.get('email') || ''), String(data.get('password') || ''));
                unlockAdminPanel();
            } catch (failure) { if (error) error.textContent = 'Sign-in failed. Check the account and Firebase configuration.'; }
        });
        document.getElementById('adminLogoutBtn')?.addEventListener('click', async () => { if (window.firebase?.apps?.length) await window.firebase.auth().signOut(); location.reload(); });

        if (configured) {
            const app = getFirebaseApp();
            window.firebase.auth(app).onAuthStateChanged((user) => { if (user) unlockAdminPanel(); });
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();

    window.HorizonAdmin = { bindGalleryForm, renderGalleryList, bindLiveStatusForm, renderLiveStatus };
})();
