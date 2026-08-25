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
            const lat = Number(value.latitude ?? value.lat ?? value.y ?? value.location?.latitude ?? value.location?.lat);
            const lng = Number(value.longitude ?? value.lng ?? value.lon ?? value.x ?? value.location?.longitude ?? value.location?.lng);
            const timestamp = value.timestamp ?? value.time ?? value.createdAt ?? value.updatedAt ?? Date.now();

            if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                return null;
            }

            return {
                latitude: lat,
                longitude: lng,
                timestamp: timestamp
            };
        }

        return null;
    }

    async function fetchLatestLivePoint() {
        const endpoints = [
            getConfigValue('firebaseURL', ''),
            'https://horizon-web-default-rtdb.europe-west1.firebasedatabase.app/livetrack/points.json',
            'https://damzan06.github.io/HorizonWeb/data/last-known-point.json'
        ].filter(Boolean);

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
                const point = normalizeLivePoint(payload);
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
        fetchLatestLivePoint
    };
})();
