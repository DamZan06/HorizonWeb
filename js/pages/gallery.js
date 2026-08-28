(function () {
    const tr = (key, fallback) => window.HorizonI18n?.t?.(key) || fallback || key;
    const galleryState = {
        initialized: false,
        items: [],
        activeIndex: 0,
        map: null
        ,lastFocus: null
    };

    function markStatus(message) {
        const statusNode = document.querySelector('[data-map-status="gallery"]');
        if (statusNode) {
            statusNode.textContent = message;
        }
    }

    function loadAspectRatio(src) {
        return new Promise((resolve) => {
            const probe = new Image();
            probe.onload = () => resolve(probe.naturalWidth && probe.naturalHeight ? probe.naturalWidth / probe.naturalHeight : 4 / 3);
            probe.onerror = () => resolve(4 / 3);
            probe.src = src;
        });
    }

    // Bins photos into full-width rows (Flickr-style justified grid); a trailing row only stretches if that doesn't blow it up past maxRowHeight.
    function computeJustifiedRows(containerWidth, entries, targetHeight, gap, maxRowHeight) {
        const rows = [];
        let row = [];
        let aspectSum = 0;
        entries.forEach((entry) => {
            row.push(entry);
            aspectSum += entry.aspectRatio;
            const rowWidthAtTarget = aspectSum * targetHeight + (row.length - 1) * gap;
            if (rowWidthAtTarget >= containerWidth) {
                rows.push({ entries: row, aspectSum, justified: true });
                row = [];
                aspectSum = 0;
            }
        });
        if (row.length) {
            const requiredHeight = (containerWidth - (row.length - 1) * gap) / aspectSum;
            rows.push({ entries: row, aspectSum, justified: requiredHeight <= maxRowHeight });
        }
        return rows;
    }

    function targetRowHeightFor(containerWidth) {
        if (containerWidth >= 1200) return 240;
        if (containerWidth >= 900) return 210;
        if (containerWidth >= 600) return 190;
        return 160;
    }

    function layoutGallery() {
        const grid = document.querySelector('.gallery-grid');
        const entries = galleryState.layoutEntries;
        if (!grid || !entries || !entries.length) return;
        const containerWidth = grid.clientWidth;
        if (!containerWidth) return;
        const gap = containerWidth < 560 ? 10 : 16;
        const targetHeight = targetRowHeightFor(containerWidth);
        const rows = computeJustifiedRows(containerWidth, entries, targetHeight, gap, targetHeight * 1.35);
        rows.forEach((row) => {
            const rowHeight = row.justified ? (containerWidth - (row.entries.length - 1) * gap) / row.aspectSum : targetHeight;
            const roundedHeight = Math.round(rowHeight);
            let widthBudget = row.justified ? containerWidth - (row.entries.length - 1) * gap : null;
            row.entries.forEach((entry, entryIndex) => {
                const isLast = entryIndex === row.entries.length - 1;
                // The last card in a justified row absorbs any rounding remainder so the row never overflows its container.
                const width = row.justified && isLast
                    ? widthBudget
                    : Math.round(rowHeight * entry.aspectRatio);
                if (row.justified && !isLast) widthBudget -= width;
                entry.card.style.width = `${width}px`;
                entry.frame.style.width = `${width}px`;
                entry.frame.style.height = `${roundedHeight}px`;
                entry.meta.style.height = 'auto';
            });
            // The caption box grows to the tallest caption on the row so none of them gets clipped.
            const maxMetaHeight = Math.max(...row.entries.map((entry) => entry.meta.scrollHeight));
            row.entries.forEach((entry) => { entry.meta.style.height = `${maxMetaHeight}px`; });
        });
    }

    let layoutResizeTimer = null;
    function scheduleLayout() {
        window.clearTimeout(layoutResizeTimer);
        layoutResizeTimer = window.setTimeout(layoutGallery, 150);
    }

    async function renderGallery(items) {
        const grid = document.querySelector('.gallery-grid');
        if (!grid) {
            return;
        }

        grid.innerHTML = '';
        galleryState.layoutEntries = [];
        if (!items.length) {
            grid.innerHTML = `<p class="empty-state">${tr("gallery.fieldPhotographsAndPlacesWillAppearHereDuring", "Field photographs and places will appear here during the journey.")}</p>`;
            return;
        }

        const aspectRatios = await Promise.all(items.map((item) => loadAspectRatio(item.thumbnailUrl || item.imageUrl)));

        items.forEach((item, index) => {
            const article = document.createElement('article');
            article.className = 'gallery-card';
            article.innerHTML = `
                <button type="button" class="gallery-trigger" data-gallery-index="${index}" aria-label="${tr("gallery.openImage", "Open image")}: ${item.title}">
                    <span class="gallery-photo-frame"><img src="${item.thumbnailUrl || item.imageUrl}" alt="${item.title || tr("gallery.horizonFieldPhotograph", "HORIZON field photograph")}" decoding="async"></span>
                    <span class="gallery-meta">${item.location || 'HORIZON'}</span>
                </button>
            `;
            grid.appendChild(article);
            galleryState.layoutEntries.push({
                card: article,
                frame: article.querySelector('.gallery-photo-frame'),
                meta: article.querySelector('.gallery-meta'),
                aspectRatio: aspectRatios[index]
            });
        });

        grid.querySelectorAll('.gallery-trigger').forEach((button) => {
            button.addEventListener('click', () => {
                const idx = Number(button.dataset.galleryIndex || 0);
                openGalleryModal(items, idx);
            });
        });

        layoutGallery();
        if (!galleryState.resizeBound) {
            galleryState.resizeBound = true;
            window.addEventListener('resize', scheduleLayout);
        }
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
        modalImage.src = item.imageUrl || item.thumbnailUrl;
        modalImage.alt = item.title;
        modalTitle.textContent = item.title;
        modalLocation.textContent = item.location || tr("gallery.horizonRoute", "HORIZON route");
        modalDescription.textContent = item.description || tr("gallery.horizonGalleryEntry", "HORIZON gallery entry.");
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
        if (!container || !window.L) { markStatus(tr("gallery.photoMapUnavailable", "Photo map unavailable.")); return; }
        const mapApi = window.HorizonMap;
        if (!mapApi?.createMap || !mapApi?.loadRoute) { markStatus(tr("gallery.photoMapUnavailable", "Photo map unavailable.")); return; }
        const map = mapApi.createMap({ center: [46.6, 10.4], zoom: 7 });
        mapApi.loadRoute(window.HorizonConfig?.routeGeoJsonUrl).catch(() => markStatus(tr("common.plannedRouteUnavailable", "Planned route unavailable.")));
        const group = window.L.markerClusterGroup ? window.L.markerClusterGroup() : window.L.layerGroup();
        items.filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng)).forEach((item, index) => {
            // Keep the shorter side constant across photos; the frame hugs whatever the longer side becomes.
            const sizeScript = "if(this.naturalWidth<this.naturalHeight){this.style.width='36px';this.style.height='auto'}else{this.style.height='36px';this.style.width='auto'}";
            const icon = window.L.divIcon({
                className: 'gallery-map-thumb',
                html: `<img src="${item.thumbnailUrl || item.imageUrl || item.image}" alt="${item.title || ''}" onload="${sizeScript}">`,
                iconSize: [0, 0],
                iconAnchor: [0, 0]
            });
            const marker = window.L.marker([item.lat, item.lng], { icon, alt: item.title, keyboard: false });
            marker.on('click', () => openGalleryModal(items, index)); group.addLayer(marker);
        });
        group.addTo(map); galleryState.map = map;
        document.getElementById('galleryMapZoomInBtn')?.addEventListener('click', mapApi.zoomIn);
        document.getElementById('galleryMapZoomOutBtn')?.addEventListener('click', mapApi.zoomOut);
        const fullscreen = document.getElementById('galleryPhotoMapFullscreenBtn');
        fullscreen?.addEventListener('click', async () => { const wrap = container.closest('.map-wrap'); if (!document.fullscreenElement) await wrap.requestFullscreen(); else await document.exitFullscreen(); });
        document.addEventListener('fullscreenchange', () => setTimeout(() => map.invalidateSize(), 50));
    }

    async function initGalleryPage() {
        if (galleryState.initialized) {
            return;
        }
        galleryState.initialized = true;

        try {
            const items = await window.HorizonFirebase.fetchGalleryItems();
            galleryState.items = items;
            await renderGallery(items);
            bindModalControls(items);
            initPhotoMap(items);
            markStatus(items.length ? tr("gallery.geolocatedImagesReady", "Geolocated images ready.") : tr("gallery.noFieldPhotographsYet", "No field photographs yet."));
        } catch (error) {
            galleryState.items = [];
            await renderGallery([]);
            markStatus(tr("gallery.galleryTemporarilyUnavailable", "Gallery temporarily unavailable."));
        }
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
    document.addEventListener('horizon:languagechange', () => {
        renderGallery(galleryState.items);
        if (!document.querySelector('.modal-backdrop.is-open')) return;
        openGalleryModal(galleryState.items, galleryState.activeIndex);
    });
})();
