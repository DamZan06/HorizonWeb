(function () {
    const DEFAULT_TIMEOUT_MS = 7000;

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

            return {
                latitude: lat,
                longitude: lng,
                timestamp,
                altitude: Number.isFinite(Number(value.altitude ?? value.elevation ?? value.altitudine?.metri)) ? Number(value.altitude ?? value.elevation ?? value.altitudine?.metri) : null,
                speed: Number.isFinite(Number(value.speed ?? value.velocita?.km_h ?? value.velocita?.kmh)) ? Number(value.speed ?? value.velocita?.km_h ?? value.velocita?.kmh) : null,
                heartRate: Number.isFinite(Number(value.heartRate ?? value.hr)) ? Number(value.heartRate ?? value.hr) : null
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
                const response = await timeoutFetch(endpoint, { headers: { Accept: 'application/json' } }, DEFAULT_TIMEOUT_MS);
                if (!response.ok) {
                    continue;
                }

                const payload = await response.json();
                const points = normalizeLivePoints(payload);
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
        fetchLatestLivePoint
    };
})();
