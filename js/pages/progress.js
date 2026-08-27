(function () {
    const milestones = [
        { distanceKm: 1, title: 'First kilometre' },
        { distanceKm: 50, title: '50 kilometres west' },
        { distanceKm: 100, title: 'A fifth of Switzerland' },
        { distanceKm: 250, title: 'Halfway' },
        { completionPercent: 100, title: 'Chancy' },
        { distanceKm: 500, title: '500 kilometres' }
    ];
    function render(summaryOrDistance) {
        const grid = document.querySelector('.badge-grid');
        if (!grid) return;
        const summary = typeof summaryOrDistance === 'object' ? summaryOrDistance : null;
        const distance = Math.max(0, Number(summary?.coveredDistanceKm ?? summaryOrDistance) || 0);
        const completion = Math.max(0, Number(summary?.completionPercent) || 0);
        grid.innerHTML = '';
        milestones.forEach((item) => {
            const article = document.createElement('article');
            const unlocked = item.completionPercent != null ? completion >= item.completionPercent : distance >= item.distanceKm;
            article.className = `metric-card milestone ${unlocked ? 'is-unlocked' : 'is-locked'}`;
            const target = item.completionPercent != null ? `${item.completionPercent}% complete` : `${item.distanceKm} km`;
            article.innerHTML = `<p class="eyebrow">${unlocked ? 'Unlocked' : 'Locked'}</p><h2>${item.title}</h2><p>${target}</p>`;
            grid.appendChild(article);
        });
    }
    window.HorizonProgress = { milestones, render };
    function init(){render(0);window.HorizonExpedition?.loadSummary?.().then(render).catch(()=>{});}
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
