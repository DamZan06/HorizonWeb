(function () {
    const DEFAULT_TIMEOUT_MS = 20000;
    let trackRequest = null;

    function getConfigValue(name, fallbackValue) {
        const config = window.HorizonConfig || {};
        return config[name] !== undefined && config[name] !== null ? config[name] : fallbackValue;
    }

    function timeoutFetch(url, options, timeoutMs) {
        const controller = new AbortController();
        const timer = window.setTimeout(() => controller.abort(), timeoutMs);

        return fetch(url, Object.assign({}, options, { signal: controller.signal })).finally(() => {
            window.clearTimeout(timer);
        });
    }

    function normalizeLivePoint(value) {
        if (!value) {
            return null;
        }

        if (Array.isArray(value)) {
            const first = value[value.length - 1];
            return normalizeLivePoint(first);
        }

        if (typeof value === 'object') {
            const lat = Number(value.latitude ?? value.lat ?? value.y ?? value.coordinate?.lat ?? value.coordinates?.lat ?? value.location?.latitude ?? value.location?.lat);
            const lng = Number(value.longitude ?? value.lng ?? value.lon ?? value.x ?? value.coordinate?.lon ?? value.coordinate?.lng ?? value.coordinates?.lon ?? value.location?.longitude ?? value.location?.lng);
            const timestampValue = value.timestamp ?? value.time ?? value.orario ?? value.createdAt ?? value.updatedAt;
            const timestamp = timestampValue == null ? null : new Date(timestampValue).getTime();

            if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180 || !Number.isFinite(timestamp)) {
                return null;
            }

            const altitudeM = Number.isFinite(Number(value.altitude ?? value.elevation ?? value.altitudine?.metri)) ? Number(value.altitude ?? value.elevation ?? value.altitudine?.metri) : null;
            const speedKmh = Number.isFinite(Number(value.speed ?? value.velocita?.km_h ?? value.velocita?.kmh)) ? Number(value.speed ?? value.velocita?.km_h ?? value.velocita?.kmh) : null;
            const heartRateBpm = Number.isFinite(Number(value.heartRate ?? value.hr ?? value.frequenza_cardiaca?.bpm)) ? Number(value.heartRate ?? value.hr ?? value.frequenza_cardiaca?.bpm) : null;
            return {
                id: value.id ?? timestamp,
                latitude: lat,
                longitude: lng,
                timestamp,
                altitudeM, speedKmh, heartRateBpm,
                altitude: altitudeM, speed: speedKmh, heartRate: heartRateBpm,
                cumulativeDistanceKm: Number.isFinite(Number(value.distanceKm ?? value.distanza?.km)) ? Number(value.distanceKm ?? value.distanza?.km) : null,
                status: String(value.status ?? value.stato ?? '').toLowerCase() || null,
                trackerState: String(value.status ?? value.stato ?? '').toLowerCase() || null,
                raw: value
            };
        }

        return null;
    }

    function normalizeLivePoints(payload) {
        const raw = Array.isArray(payload) ? payload : (payload && typeof payload === 'object' ? Object.values(payload) : []);
        const unique = new Map();
        raw.forEach((item) => { const point = normalizeLivePoint(item); if (point) unique.set(`${point.timestamp}:${point.latitude}:${point.longitude}`, point); });
        return Array.from(unique.values()).sort((a, b) => a.timestamp - b.timestamp);
    }

    async function fetchLiveTrack(options) {
        if (trackRequest && !options?.force) return trackRequest;
        const endpoint = getConfigValue('firebaseURL', '').trim();
        if (!endpoint) return [];
        trackRequest = timeoutFetch(endpoint, { headers: { Accept: 'application/json' }, cache: 'no-store' }, DEFAULT_TIMEOUT_MS)
            .then((response) => { if (!response.ok) throw new Error(`Tracker request failed (${response.status})`); return response.json(); })
            .then(normalizeLivePoints)
            .catch((error) => { trackRequest = null; throw error; });
        return trackRequest;
    }

    async function fetchLatestLivePoint() {
        const configuredUrl = getConfigValue('firebaseURL', '').trim();
        const endpoints = [
            configuredUrl,
            // Keep the live fallback empty unless a real Firebase endpoint is configured.
            // The placeholder endpoints used previously returned 404s in browser tests and
            // created noisy console errors even though the page handled the failure gracefully.
        ].filter((url) => {
            if (!url) {
                return false;
            }

            try {
                const parsed = new URL(url);
                return parsed.protocol === 'http:' || parsed.protocol === 'https:';
            } catch (error) {
                return false;
            }
        });

        let lastKnown = null;
        try {
            const cached = localStorage.getItem('horizon-last-live-point');
            if (cached) {
                lastKnown = JSON.parse(cached);
            }
        } catch (error) {
            lastKnown = null;
        }

        for (const endpoint of endpoints) {
            try {
                const points = await fetchLiveTrack();
                const point = points.at(-1) || normalizeLivePoint(payload);
                if (point) {
                    localStorage.setItem('horizon-last-live-point', JSON.stringify(point));
                    return point;
                }
            } catch (error) {
                continue;
            }
        }

        return lastKnown;
    }

    window.HorizonFirebase = {
        DEFAULT_TIMEOUT_MS,
        normalizeLivePoint,
        normalizeLivePoints,
        normalizeTrackPayload: normalizeLivePoints,
        fetchLiveTrack,
        fetchTrackPoints: fetchLiveTrack,
        fetchLatestLivePoint
    };
})();
