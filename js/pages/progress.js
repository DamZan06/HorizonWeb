(function () {
    const milestones = [
        { distanceKm: 1, title: 'First kilometre' },
        { distanceKm: 50, title: '50 kilometres west' },
        { distanceKm: 100, title: 'A fifth of Switzerland' },
        { distanceKm: 250, title: 'Halfway' },
        { distanceKm: 500, title: 'Chancy' }
    ];
    function render(distanceKm) {
        const grid = document.querySelector('.badge-grid');
        if (!grid) return;
        const distance = Math.max(0, Number(distanceKm) || 0);
        grid.innerHTML = '';
        milestones.forEach((item) => {
            const article = document.createElement('article');
            const unlocked = distance >= item.distanceKm;
            article.className = `metric-card milestone ${unlocked ? 'is-unlocked' : 'is-locked'}`;
            article.innerHTML = `<p class="eyebrow">${unlocked ? 'Unlocked' : 'Locked'}</p><h2>${item.title}</h2><p>${item.distanceKm} km</p>`;
            grid.appendChild(article);
        });
    }
    window.HorizonProgress = { milestones, render };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => render(0), { once: true }); else render(0);
})();
