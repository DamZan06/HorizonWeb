(function () {
    const tr = (key, fallback) => window.HorizonI18n?.t?.(key) || fallback || key;
    const homeState = {
        initialized: false,
        timerId: null,
        lastRenderedAt: null,
        summaryResolved: false
    };

    function getCountdownTarget() {
        const startDate = window.HorizonConfig && window.HorizonConfig.startDateIso;
        if (!startDate) {
            return null;
        }
        return new Date(startDate).getTime();
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function formatCountdownParts(msRemaining) {
        const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000));
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return {
            days,
            hours,
            minutes,
            seconds,
            totalSeconds
        };
    }

    function updateCountdown() {
        const target = getCountdownTarget();
        const daysNode = document.getElementById('countdownDays');
        const hoursNode = document.getElementById('countdownHours');
        const minutesNode = document.getElementById('countdownMinutes');
        const secondsNode = document.getElementById('countdownSeconds');
        const messageNode = document.getElementById('countdownMessage');
        const countdownNode = document.getElementById('homeCountdown');
        const startDateNode = document.getElementById('countdownStartDate');

        if (!target || !daysNode || !hoursNode || !minutesNode || !secondsNode || !messageNode || !countdownNode) {
            return;
        }

        const now = Date.now();
        if (startDateNode) startDateNode.textContent = new Intl.DateTimeFormat(document.documentElement.lang || 'en', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Zurich' }).format(target);
        const remainingMs = target - now;

        if (remainingMs <= 0) {
            daysNode.textContent = '00';
            hoursNode.textContent = '00';
            minutesNode.textContent = '00';
            secondsNode.textContent = '00';
            messageNode.textContent = tr("home.horizonIsUnderway", "HORIZON IS UNDERWAY");
            countdownNode.classList.add('is-finished');
            return;
        }

        const countdown = formatCountdownParts(remainingMs);
        daysNode.textContent = String(countdown.days).padStart(2, '0');
        hoursNode.textContent = String(countdown.hours).padStart(2, '0');
        minutesNode.textContent = String(countdown.minutes).padStart(2, '0');
        secondsNode.textContent = String(countdown.seconds).padStart(2, '0');
        messageNode.textContent = tr("home.timeUntilDeparture", "Time until departure");
        countdownNode.classList.remove('is-finished');
    }

    function updateHomeState(summary) {
        if (!summary) {
            const countdownNode = document.getElementById('homeCountdown');
            if (countdownNode) countdownNode.hidden = true;
            return;
        }
        const config = window.HorizonConfig || {};
        const state = summary.state || window.HorizonStatus?.getExpeditionState({ now: Date.now(), startDate: config.startDateIso, hasValidPoints:false });
        const copy = window.HorizonStatus?.getStateCopy?.(state) || [tr("common.trackerOffline", "Tracker offline"), tr("common.noRecentValidPositionIsAvailable", "No recent valid position is available.")];
        const etaLabel = document.getElementById('homeEtaLabel');
        if (etaLabel) {
            etaLabel.textContent = summary?.completedAt ? tr("common.arrival", "Arrival") : tr("common.estimatedArrival", "Estimated arrival");
        }
        const label = document.getElementById('homeStatusLabel'), text = document.getElementById('homeStatusText');
        if (label) label.textContent = copy[0];
        if (text) text.textContent = copy[1];
        const dot = document.getElementById('homeStatusDot');
        if (dot) dot.className = `status-dot ${state === 'live' ? 'status-moving' : 'status-not-started'}`;
        const activePill = document.getElementById(`homeState-${state === 'resting' ? 'paused' : state === 'ended' ? 'ended' : state === 'finished' ? 'completed' : state === 'live' ? 'moving' : 'not-started'}`);
        document.querySelectorAll('.status-grid .status-pill').forEach((pill) => {
            pill.hidden = pill !== activePill;
        });
        const values = summary?.started ? { homeDistance: `${summary.coveredDistanceKm.toFixed(1)} km`, homeRemaining: `${summary.remainingDistanceKm.toFixed(1)} km`, homeCompletion: `${summary.completionPercent.toFixed(1)}%`, homeTime: `${(summary.elapsedTimeMs/3600000).toFixed(1)} h`, homeGain: `${Math.round(summary.actualElevationGainM)} m`, homeSteps: Math.round(summary.coveredDistanceKm * 1300).toLocaleString(), homeEta: summary.completedAt ? new Intl.DateTimeFormat(document.documentElement.lang,{dateStyle:'medium',timeStyle:'short'}).format(summary.completedAt) : summary.eta ? new Intl.DateTimeFormat(document.documentElement.lang,{dateStyle:'medium',timeStyle:'short'}).format(summary.eta) : tr("common.notAvailable", "Not available") } : { homeDistance: '0 km', homeRemaining: `${summary?.plannedDistanceKm || config.expectedDistanceKm || 500} km`, homeCompletion: '0%', homeTime: '0 h', homeGain: '0 m', homeSteps: '0', homeEta: tr("common.notAvailable", "Not available") };
        Object.entries(values).forEach(([id, value]) => { const node = document.getElementById(id); if (node) node.textContent = value; });
        const countdown = document.getElementById('homeCountdown');
        if (countdown) countdown.hidden = state !== 'not-started';
    }

    function initHomePage() {
        if (homeState.initialized) {
            return;
        }
        homeState.initialized = true;

        const countdown = document.getElementById('homeCountdown');
        if (countdown) countdown.hidden = true;
        window.HorizonExpedition?.loadSummary?.().then((summary) => {
            homeState.summaryResolved = true;
            updateHomeState(summary);
            updateCountdown();
        }).catch(() => {});
        window.setInterval(()=>window.HorizonExpedition?.loadSummary?.({force:true}).then((summary)=>{
            homeState.summaryResolved = true;
            updateHomeState(summary);
            updateCountdown();
        }).catch(()=>{}),20000);
        homeState.timerId = window.setInterval(updateCountdown, 1000);
        document.addEventListener('horizon:languagechange', () => {
            updateCountdown();
            window.HorizonExpedition?.loadSummary?.().then(updateHomeState).catch(() => {});
        });
    }

    window.HorizonHome = {
        initHomePage,
        updateCountdown,
        formatCountdownParts,
        updateHomeState,
        getCountdownTarget
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHomePage, { once: true });
    } else {
        initHomePage();
    }
})();
