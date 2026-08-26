(function () {
    const galleryState = {
        initialized: false,
        items: [],
        activeIndex: 0,
        map: null
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

        const fallbackItems = [
            {
                id: 'gallery-default-1',
                title: 'HORIZON night',
                location: 'Piz Chavalatsch',
                description: 'Night departure',
                image: 'assets/gallery/Night_1.jpg',
                lat: 46.595,
                lng: 9.853
            }
        ];

        return fallbackItems;
    }

    function renderGallery(items) {
        const grid = document.querySelector('.gallery-grid');
        if (!grid) {
            return;
        }

        grid.innerHTML = '';
        if (!items.length) {
            grid.innerHTML = '<p class="gallery-empty">Waiting for geolocated images...</p>';
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
        modalImage.src = item.image;
        modalImage.alt = item.title;
        modalTitle.textContent = item.title;
        modalLocation.textContent = item.location || 'HORIZON route';
        modalDescription.textContent = item.description || 'HORIZON gallery entry.';
        modal.setAttribute('data-active-index', String(index));
        modal.classList.add('is-open');
    }

    function closeGalleryModal() {
        const modal = document.querySelector('.modal-backdrop');
        if (modal) {
            modal.classList.remove('is-open');
        }
    }

    function bindModalControls(items) {
        const modal = document.querySelector('.modal-backdrop');
        if (!modal) {
            return;
        }

        const closeButton = modal.querySelector('.modal-close');
        if (closeButton) {
            closeButton.addEventListener('click', closeGalleryModal);
        }

        const prevButton = document.getElementById('modalPrev');
        const nextButton = document.getElementById('modalNext');

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
        markStatus(items.length ? 'Geolocated images ready.' : 'Waiting for geolocated images...');
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
