(function () {
    const dashboardState = {
        initialized: false, charts: []
    };

    function updateMetric(id, value) {
        const node = document.getElementById(id);
        if (node) {
            node.textContent = value;
        }
    }

    function updateSummary(summary) {
        summary = summary || {};
        const available = (value, suffix, digits) => Number.isFinite(value) ? `${value.toFixed(digits ?? 1)}${suffix}` : 'Not available';
        updateMetric('metricDistance', available(summary.coveredDistanceKm, ' km'));
        updateMetric('metricRemaining', available(summary.remainingDistanceKm, ' km'));
        updateMetric('metricCompletion', available(summary.completionPercent, '%'));
        updateMetric('metricSpeed', available(summary.currentSpeedKmh, ' km/h'));
        updateMetric('metricAvgMovingSpeed', available(summary.movingAverageSpeedKmh, ' km/h'));
        updateMetric('metricAvgTotalSpeed', available(summary.averageSpeedKmh, ' km/h'));
        updateMetric('metricMaxSpeed', available(summary.maxSpeedKmh, ' km/h'));
        updateMetric('metricAltitude', available(summary.currentAltitudeM, ' m', 0));
        updateMetric('metricElevation', available(summary.actualElevationGainM, ' m', 0));
        updateMetric('metricTime', Number.isFinite(summary.elapsedTimeMs) ? `${(summary.elapsedTimeMs/3600000).toFixed(1)} h` : 'Not available');
        updateMetric('metricMovingTime', Number.isFinite(summary.movingTimeMs) ? `${(summary.movingTimeMs/3600000).toFixed(1)} h` : 'Not available');
        updateMetric('metricHeartRate', available(summary.currentHeartRateBpm, ' bpm', 0)); updateMetric('metricHeartRateAvg', available(summary.averageHeartRateBpm, ' bpm', 0));
        updateMetric('metricCalories','Not available'); updateMetric('metricWaterLost','Not available');
        updateMetric('metricEta', summary.eta ? new Intl.DateTimeFormat(document.documentElement.lang,{dateStyle:'medium',timeStyle:'short'}).format(summary.eta) : 'Not available');
    }

    function initDashboardPage() {
        if (dashboardState.initialized) {
            return;
        }
        dashboardState.initialized = true;

        updateSummary(null);
        document.querySelectorAll('.chart-card-head').forEach((head) => {
            const message = document.createElement('p'); message.className = 'empty-state'; message.textContent = 'Telemetry will appear once tracking begins.'; head.after(message);
        });
        document.querySelectorAll('.chart-fullscreen-btn').forEach((button) => button.addEventListener('click', async () => {
            const card = button.closest('.metric-card'); if (!document.fullscreenElement) await card.requestFullscreen(); else await document.exitFullscreen();
        }));
        window.HorizonExpedition?.loadSummary?.().then((summary) => { dashboardState.points = summary.points; updateSummary(summary); renderCharts(summary.points); }).catch(() => {});
        document.getElementById('chartXAxisMode')?.addEventListener('change',()=>{dashboardState.charts.forEach(chart=>chart.destroy());dashboardState.charts=[];renderCharts(dashboardState.points||[]);});

        const chartCanvas = document.getElementById('chartSpeed');
        if (chartCanvas && window.Chart && dashboardState.points?.length) {
            const ctx = chartCanvas.getContext('2d');
            if (ctx) {
                new window.Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: ['0', '25', '50', '75', '100'],
                        datasets: [{
                            label: 'Speed',
                            data: [0, 5, 7, 11, 6],
                            borderColor: '#49a8ff',
                            backgroundColor: 'rgba(73,168,255,0.2)',
                            borderWidth: 2,
                            fill: false,
                            tension: 0.3
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: false
                            }
                        }
                    }
                });
            }
        }
    }

    function renderCharts(points) {
        if (!window.Chart || !points.length) return;
        document.querySelectorAll('.empty-state').forEach((node) => node.remove());
        const sample = points.filter((_, index) => index % Math.max(1, Math.floor(points.length / 300)) === 0);
        const mode=document.getElementById('chartXAxisMode')?.value||'distance';
        const labels = sample.map((point) => mode==='distance' ? Number(point.cumulativeDistanceKm||0).toFixed(1) : new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        let gain=0; const gains=sample.map((point,index)=>{ if(index){const delta=(point.altitude??0)-(sample[index-1].altitude??0);if(delta>0&&delta<1000)gain+=delta;}return gain; });
        const definitions = [['chartSpeed','Speed',sample.map(p=>p.speed),'#e8953f'],['chartAltitude','Altitude',sample.map(p=>p.altitude),'#d9b36c'],['chartHeartRate','Heart rate',sample.map(p=>p.heartRate),'#c36a4a'],['chartElevation','Cumulative elevation',gains,'#8ca89f']];
        definitions.forEach(([id,label,data,color]) => { const canvas=document.getElementById(id); if (!canvas) return; dashboardState.charts.push(new window.Chart(canvas,{type:'line',data:{labels,datasets:[{label,data,borderColor:color,borderWidth:2,pointRadius:0,tension:.15}]},options:{responsive:true,maintainAspectRatio:false,animation:false}})); });
    }

    window.HorizonDashboard = {
        initDashboardPage,
        updateSummary
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDashboardPage, { once: true });
    } else {
        initDashboardPage();
    }
})();
