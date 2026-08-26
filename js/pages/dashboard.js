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

    function updateSummary() {
        updateMetric('metricDistance', '120 km');
        updateMetric('metricRemaining', '380 km');
        updateMetric('metricCompletion', '24%');
        updateMetric('metricSpeed', '6.1 km/h');
        updateMetric('metricAvgMovingSpeed', '7.4 km/h');
        updateMetric('metricAvgTotalSpeed', '4.9 km/h');
        updateMetric('metricMaxSpeed', '12.8 km/h');
        updateMetric('metricAltitude', '1,420 m');
        updateMetric('metricElevation', '3,280 m');
        updateMetric('metricTime', '08:42:19');
        updateMetric('metricMovingTime', '06:30:00');
        updateMetric('metricHeartRate', '142 bpm');
        updateMetric('metricHeartRateAvg', '132 bpm');
        updateMetric('metricCalories', '4,420 kcal');
        updateMetric('metricWaterLost', '2.6 L');
        updateMetric('metricEta', '12 days');
    }

    function initDashboardPage() {
        if (dashboardState.initialized) {
            return;
        }
        dashboardState.initialized = true;

        updateSummary();

        const chartCanvas = document.getElementById('chartSpeed');
        if (chartCanvas && window.Chart) {
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
