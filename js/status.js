(function () {
    function parseTime(value) {
        const time = value instanceof Date ? value.getTime() : new Date(value).getTime();
        return Number.isFinite(time) ? time : null;
    }

    function getExpeditionState(input) {
        const options = input || {};
        const config = window.HorizonConfig || {};
        const now = parseTime(options.now == null ? Date.now() : options.now) || Date.now();
        const start = parseTime(options.startDate || config.startDateIso);
        const latest = parseTime(options.latestPointTimestamp);
        const forced = String(options.forcedAdminState || '').trim().toLowerCase();
        const validForced = ['not-started', 'live', 'delayed', 'resting', 'finished', 'offline'];
        if (validForced.includes(forced)) return forced;
        if (options.finished === true) return 'finished';
        const hasPoints = options.hasValidPoints === true || latest !== null;
        if (!hasPoints) return start && now < start ? 'not-started' : 'offline';
        if (latest > now + 300000) return 'offline';
        const staleAfter = Number(config.staleDataThresholdMs) || 180000;
        if (now - latest > staleAfter) return 'delayed';
        const trackerState = String(options.trackerState || '').toLowerCase();
        if (/stationary|paused|rest|stopped/.test(trackerState)) return 'resting';
        return 'live';
    }
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

    function getStateCopy(state) {
        return {
            'not-started': ['Not started', 'Waiting for departure. The planned route is ready.'],
            delayed: ['Signal delayed', 'Tracking exists, but the latest point is stale.'],
            resting: ['Resting', 'The expedition has started and is currently stationary.'],
            offline: ['Tracker offline', 'No recent valid position is available.'],
            live: ['Live', 'The expedition is underway.'],
            finished: ['Finished', 'HORIZON has reached Chancy.']
        }[state] || ['Tracker offline', 'No recent valid position is available.'];
    }

    function bindAdminLiveStatusForm() {
        const form = document.getElementById('adminLiveStatusForm');
        if (!form || form.dataset.bound === 'true') return;

        form.dataset.bound = 'true';
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const formData = new FormData(form);
            const forcedStatus = String(formData.get('forcedStatus') || '').trim();
            const cacheKey = 'horizon-live-status-force';
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

    const horizonStatus = Object.assign(window.HorizonStatus || {}, {
        getExpeditionState,
        normalizeHomeStatus,
        getStateCopy,
        bindAdminLiveStatusForm
    });

    window.HorizonStatus = horizonStatus;
})();
