(function () {
    const galleryState = {
        initialized: false,
        items: [],
        activeIndex: 0,
        map: null
        ,lastFocus: null
    };

    function markStatus(message) {
        const statusNode = document.getElementById('galleryPhotoMapStatus');
        if (statusNode) {
            statusNode.textContent = message;
        }
    }

    function ensureGalleryItems() {
        const grid = document.querySelector('.gallery-grid');
        if (!grid) {
            return [];
        }

        return [];
    }

    function renderGallery(items) {
        const grid = document.querySelector('.gallery-grid');
        if (!grid) {
            return;
        }

        grid.innerHTML = '';
        if (!items.length) {
            grid.innerHTML = '<p class="empty-state">Field photographs and places will appear here during the journey.</p>';
            return;
        }

        items.forEach((item, index) => {
            const article = document.createElement('article');
            article.className = 'gallery-card';
            article.innerHTML = `
                <button type="button" class="gallery-trigger" data-gallery-index="${index}" aria-label="Open ${item.title}">
                    <img src="${item.image}" alt="${item.title}">
                    <span class="gallery-meta">${item.location || 'HORIZON'}</span>
                </button>
            `;
            grid.appendChild(article);
        });

        grid.querySelectorAll('.gallery-trigger').forEach((button) => {
            button.addEventListener('click', () => {
                const idx = Number(button.dataset.galleryIndex || 0);
                openGalleryModal(items, idx);
            });
        });
    }

    function openGalleryModal(items, index) {
        const modal = document.querySelector('.modal-backdrop');
        const modalImage = document.getElementById('modalImage');
        const modalTitle = document.getElementById('modalTitle');
        const modalLocation = document.getElementById('modalLocation');
        const modalDescription = document.getElementById('modalDescription');
        if (!modal || !modalImage || !modalTitle || !modalLocation || !modalDescription) {
            return;
        }

        const item = items[index];
        if (!item) {
            return;
        }

        galleryState.activeIndex = index;
        galleryState.lastFocus = document.activeElement;
        modalImage.src = item.image;
        modalImage.alt = item.title;
        modalTitle.textContent = item.title;
        modalLocation.textContent = item.location || 'HORIZON route';
        modalDescription.textContent = item.description || 'HORIZON gallery entry.';
        modal.setAttribute('data-active-index', String(index));
        modal.classList.add('is-open');
        modal.querySelector('.modal-close')?.focus();
    }

    function closeGalleryModal() {
        const modal = document.querySelector('.modal-backdrop');
        if (modal) {
            modal.classList.remove('is-open');
            galleryState.lastFocus?.focus();
        }
    }

    function bindModalControls(items) {
        const modal = document.querySelector('.modal-backdrop');
        if (!modal) {
            return;
        }

        const closeButton = modal.querySelector('.modal-close');
        if (closeButton) {
            closeButton.type = 'button';
            closeButton.addEventListener('click', closeGalleryModal);
        }

        const prevButton = document.getElementById('modalPrev');
        const nextButton = document.getElementById('modalNext');
        if (prevButton) prevButton.type = 'button';
        if (nextButton) nextButton.type = 'button';

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                const nextIndex = (galleryState.activeIndex - 1 + items.length) % items.length;
                openGalleryModal(items, nextIndex);
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                const nextIndex = (galleryState.activeIndex + 1) % items.length;
                openGalleryModal(items, nextIndex);
            });
        }

        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeGalleryModal();
            }
        });
        document.addEventListener('keydown', (event) => {
            if (!modal.classList.contains('is-open')) return;
            if (event.key === 'Escape') closeGalleryModal();
            if (event.key === 'ArrowLeft' && items.length) openGalleryModal(items, (galleryState.activeIndex - 1 + items.length) % items.length);
            if (event.key === 'ArrowRight' && items.length) openGalleryModal(items, (galleryState.activeIndex + 1) % items.length);
        });
    }

    function initPhotoMap(items) {
        const container = document.getElementById('map');
        if (!container || !window.L) { markStatus('Photo map unavailable.'); return; }
        const mapApi = window.HorizonMap;
        if (!mapApi?.createMap || !mapApi?.loadRoute) { markStatus('Photo map unavailable.'); return; }
        const map = mapApi.createMap({ center: [46.6, 10.4], zoom: 7 });
        mapApi.loadRoute(window.HorizonConfig?.routeGeoJsonUrl).catch(() => markStatus('Planned route unavailable.'));
        const group = window.L.markerClusterGroup ? window.L.markerClusterGroup() : window.L.layerGroup();
        items.filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng)).forEach((item, index) => {
            const marker = window.L.marker([item.lat, item.lng], { title: item.title, alt: item.title });
            marker.bindTooltip(item.title || 'HORIZON field photograph');
            marker.on('click', () => openGalleryModal(items, index)); group.addLayer(marker);
        });
        group.addTo(map); galleryState.map = map;
        document.getElementById('galleryMapZoomInBtn')?.addEventListener('click', mapApi.zoomIn);
        document.getElementById('galleryMapZoomOutBtn')?.addEventListener('click', mapApi.zoomOut);
        const fullscreen = document.getElementById('galleryPhotoMapFullscreenBtn');
        fullscreen?.addEventListener('click', async () => { const wrap = container.closest('.map-wrap'); if (!document.fullscreenElement) await wrap.requestFullscreen(); else await document.exitFullscreen(); });
        document.addEventListener('fullscreenchange', () => setTimeout(() => map.invalidateSize(), 50));
    }

    function initGalleryPage() {
        if (galleryState.initialized) {
            return;
        }
        galleryState.initialized = true;

        const items = ensureGalleryItems();
        galleryState.items = items;
        renderGallery(items);
        bindModalControls(items);
        initPhotoMap(items);
        markStatus(items.length ? 'Geolocated images ready.' : 'No geolocated field photographs yet.');
    }

    window.HorizonGallery = {
        initGalleryPage,
        renderGallery,
        openGalleryModal,
        closeGalleryModal
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGalleryPage, { once: true });
    } else {
        initGalleryPage();
    }
})();
