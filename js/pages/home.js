(function () {
    const homeState = {
        initialized: false,
        timerId: null,
        lastRenderedAt: null
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
            messageNode.textContent = 'HORIZON IS UNDERWAY';
            countdownNode.classList.add('is-finished');
            return;
        }

        const countdown = formatCountdownParts(remainingMs);
        daysNode.textContent = String(countdown.days).padStart(2, '0');
        hoursNode.textContent = String(countdown.hours).padStart(2, '0');
        minutesNode.textContent = String(countdown.minutes).padStart(2, '0');
        secondsNode.textContent = String(countdown.seconds).padStart(2, '0');
        messageNode.textContent = 'Time until departure';
        countdownNode.classList.remove('is-finished');
    }

    function updateHomeState(points) {
        const config = window.HorizonConfig || {};
        const state = window.HorizonStatus?.getExpeditionState({ now: Date.now(), startDate: config.startDateIso });
        const labels = { 'not-started': ['Not started', 'Waiting for departure. The planned route is ready.'], offline: ['Tracker offline', 'No recent valid position is available.'], live: ['Live', 'The expedition is underway.'], finished: ['Finished', 'HORIZON has reached Chancy.'] };
        const copy = labels[state] || labels.offline;
        const label = document.getElementById('homeStatusLabel'), text = document.getElementById('homeStatusText');
        if (label) label.textContent = copy[0];
        if (text) text.textContent = copy[1];
        const summary = window.HorizonStats?.summarize(points || [], config.expectedDistanceKm || 500);
        const values = summary && points?.length ? { homeDistance: `${summary.coveredKm.toFixed(1)} km`, homeRemaining: `${summary.remainingKm.toFixed(1)} km`, homeCompletion: `${summary.completion.toFixed(1)}%`, homeTime: `${summary.elapsedHours.toFixed(1)} h`, homeGain: `${Math.round(summary.elevationGainM)} m`, homeSteps: Math.round(summary.coveredKm * 1300).toLocaleString(), homeEta: 'Not available' } : { homeDistance: '0 km', homeRemaining: `${config.expectedDistanceKm || 500} km`, homeCompletion: '0%', homeTime: '0 h', homeGain: '0 m', homeSteps: '0', homeEta: 'Not available' };
        Object.entries(values).forEach(([id, value]) => { const node = document.getElementById(id); if (node) node.textContent = value; });
    }

    function initHomePage() {
        if (homeState.initialized) {
            return;
        }
        homeState.initialized = true;

        updateCountdown();
        updateHomeState();
        window.HorizonFirebase?.fetchLiveTrack?.().then(updateHomeState).catch(() => {});
        homeState.timerId = window.setInterval(updateCountdown, 1000);
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
