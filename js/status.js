(function () {
    function normalizeHomeStatus(status) {
        const value = String(status ?? '').trim().toLowerCase();
        if (!value) return 'not-started';
        if (value.includes('not started') || value.includes('non partito') || value.includes('not-started')) return 'not-started';
        if (value.includes('station') || value.includes('stop') || value.includes('paused') || value.includes('fermo') || value.includes('in pausa')) return 'paused';
        if (value.includes('moving') || value.includes('active') || value.includes('in movimento') || value.includes('attivo')) return 'moving';
        if (value.includes('ended') || value.includes('fine giornata') || value.includes('day ended')) return 'ended';
        if (value.includes('complete') || value.includes('completed') || value.includes('sfida completata')) return 'completed';
        return 'not-started';
    }

    function bindAdminLiveStatusForm() {
        const form = document.getElementById('adminLiveStatusForm');
        if (!form || form.dataset.bound === 'true') return;

        form.dataset.bound = 'true';
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const formData = new FormData(form);
            const forcedStatus = String(formData.get('forcedStatus') || '').trim();
            const cacheKey = 'northline-live-status-force';
            if (!forcedStatus) {
                localStorage.removeItem(cacheKey);
            } else {
                localStorage.setItem(cacheKey, forcedStatus);
            }

            const notice = document.getElementById('adminLiveStatusNotice');
            if (notice) {
                notice.textContent = forcedStatus ? 'Stato live impostato.' : 'Stato automatico riattivato.';
            }
        });
    }

    window.NorthLineStatus = Object.assign(window.NorthLineStatus || {}, {
        normalizeHomeStatus,
        bindAdminLiveStatusForm
    });
})();
