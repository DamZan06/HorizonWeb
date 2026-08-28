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
        const validForced = ['not-started', 'live', 'resting', 'ended', 'finished'];
        if (validForced.includes(forced)) return forced;
        if (options.finished === true) return 'finished';
        const hasPoints = options.hasValidPoints === true || latest !== null;
        if (!hasPoints) return 'not-started';
        if (latest > now + 300000) return 'not-started';
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
        const tr = (key, fallback) => window.HorizonI18n?.t?.(key) || fallback || key;
        return {
            'not-started': [tr("common.notStarted", "Not started"), tr("status.waitingForDepartureThePlannedRouteIsReady", "Waiting for departure. The planned route is ready.")],
            resting: [tr("common.paused", "Paused"), tr("status.theExpeditionHasStartedAndIsCurrentlyStationary", "The expedition has started and is currently stationary.")],
            ended: [tr("common.endOfDay", "End of day"), tr("status.todaySStageHasEndedTheExpeditionWill", "Today’s stage has ended. The expedition will continue from here.")],
            live: [tr("status.started", "Started"), tr("status.theExpeditionIsUnderway", "The expedition is underway.")],
            finished: [tr("status.arrived", "Arrived"), tr("status.horizonHasReachedChancy", "HORIZON has reached Chancy.")]
        }[state] || [tr("common.trackerOffline", "Tracker offline"), tr("common.noRecentValidPositionIsAvailable", "No recent valid position is available.")];
    }

    const horizonStatus = Object.assign(window.HorizonStatus || {}, {
        getExpeditionState,
        normalizeHomeStatus,
        getStateCopy
    });

    window.HorizonStatus = horizonStatus;
})();
