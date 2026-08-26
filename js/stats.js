(function () {
    const EARTH_RADIUS_KM = 6371.0088;
    const number = (value) => Number.isFinite(Number(value)) ? Number(value) : null;
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    function distanceKm(a, b) {
        if (!a || !b) return 0;
        const lat1 = number(a.latitude ?? a.lat), lon1 = number(a.longitude ?? a.lng ?? a.lon);
        const lat2 = number(b.latitude ?? b.lat), lon2 = number(b.longitude ?? b.lng ?? b.lon);
        if ([lat1, lon1, lat2, lon2].some((v) => v === null)) return 0;
        const rad = Math.PI / 180, dLat = (lat2 - lat1) * rad, dLon = (lon2 - lon1) * rad;
        const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
        return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
    }
    function routeDistance(points) {
        return (points || []).slice(1).reduce((sum, point, index) => {
            const previous=points[index], segment=distanceKm(previous,point), elapsed=(Number(point.timestamp)-Number(previous.timestamp))/3600000;
            if(Number.isFinite(elapsed)&&elapsed>0&&segment/elapsed>80)return sum;
            return sum+segment;
        }, 0);
    }
    function elevationGain(points) {
        let gain = 0;
        (points || []).slice(1).forEach((point, index) => {
            const previous = number(points[index].altitude), current = number(point.altitude);
            if (previous !== null && current !== null) { const delta=current-previous; if(delta>2&&delta<200)gain+=delta; }
        });
        return gain;
    }
    function summarize(points, totalKm) {
        const list = points || [], total = number(totalKm) || 500;
        const recorded = number(list.at(-1)?.cumulativeDistanceKm);
        const covered = clamp(recorded !== null ? recorded : routeDistance(list), 0, total);
        const speeds = list.map((p) => number(p.speed)).filter((v) => v !== null && v >= 0 && v < 80);
        const hrs = list.length > 1 ? Math.max(0, (new Date(list.at(-1).timestamp) - new Date(list[0].timestamp)) / 3600000) : 0;
        return { coveredKm: covered, remainingKm: clamp(total - covered, 0, total), completion: clamp(covered / total * 100, 0, 100), elevationGainM: elevationGain(list), currentSpeed: speeds.at(-1) ?? null, averageSpeed: speeds.length ? speeds.reduce((a,b)=>a+b,0)/speeds.length : null, maxSpeed: speeds.length ? Math.max(...speeds) : null, elapsedHours: Number.isFinite(hrs) ? hrs : 0 };
    }
    window.HorizonStats = { clamp, distanceKm, routeDistance, elevationGain, summarize };
})();
