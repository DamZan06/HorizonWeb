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
                    tag: form.tag.value.trim(),
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
            if (!form || form.dataset.bound === 'true') return;
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                try {
                    await uploadGalleryPhoto(form, notice);
                    form.reset();
                    notice.textContent = 'Photo published successfully.';
                } catch (error) {
                    notice.textContent = `Upload failed: ${error.message || 'unknown error'}`;
                }
            });
            form.dataset.bound = 'true';
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
                    document.getElementById('adminLocked').hidden = true;
                    document.getElementById('adminApp').hidden = false;
                    bindGalleryForm();
                } catch (failure) { if (error) error.textContent = 'Sign-in failed. Check the account and Firebase configuration.'; }
            });
            document.getElementById('adminLogoutBtn')?.addEventListener('click', async () => { if (window.firebase?.apps?.length) await window.firebase.auth().signOut(); location.reload(); });
        }

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
