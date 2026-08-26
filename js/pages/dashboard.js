(function () {
    const dashboardState = {
        initialized: false
    };

    function updateMetric(id, value) {
        const node = document.getElementById(id);
        if (node) {
            node.textContent = value;
        }
    }

    function updateSummary(points) {
        const summary = window.HorizonStats?.summarize(points || [], window.HorizonConfig?.expectedDistanceKm || 500) || {};
        const available = (value, suffix, digits) => Number.isFinite(value) ? `${value.toFixed(digits ?? 1)}${suffix}` : 'Not available';
        updateMetric('metricDistance', available(summary.coveredKm, ' km'));
        updateMetric('metricRemaining', available(summary.remainingKm, ' km'));
        updateMetric('metricCompletion', available(summary.completion, '%'));
        updateMetric('metricSpeed', available(summary.currentSpeed, ' km/h'));
        updateMetric('metricAvgMovingSpeed', available(summary.averageSpeed, ' km/h'));
        updateMetric('metricAvgTotalSpeed', available(summary.averageSpeed, ' km/h'));
        updateMetric('metricMaxSpeed', available(summary.maxSpeed, ' km/h'));
        updateMetric('metricAltitude', points?.length && Number.isFinite(points.at(-1).altitude) ? `${Math.round(points.at(-1).altitude)} m` : 'Not available');
        updateMetric('metricElevation', available(summary.elevationGainM, ' m', 0));
        updateMetric('metricTime', available(summary.elapsedHours, ' h'));
        updateMetric('metricMovingTime', points?.length > 1 ? available(summary.elapsedHours, ' h') : 'Not available');
        ['metricHeartRate','metricHeartRateAvg','metricCalories','metricWaterLost','metricEta'].forEach((id) => updateMetric(id, 'Not available'));
    }

    function initDashboardPage() {
        if (dashboardState.initialized) {
            return;
        }
        dashboardState.initialized = true;

        updateSummary([]);
        document.querySelectorAll('.chart-card-head').forEach((head) => {
            const message = document.createElement('p'); message.className = 'empty-state'; message.textContent = 'Telemetry will appear once tracking begins.'; head.after(message);
        });
        document.querySelectorAll('.chart-fullscreen-btn').forEach((button) => button.addEventListener('click', async () => {
            const card = button.closest('.metric-card'); if (!document.fullscreenElement) await card.requestFullscreen(); else await document.exitFullscreen();
        }));

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
