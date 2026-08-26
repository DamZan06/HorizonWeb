(function () {
    const catalog = {
        en: {
            app: {
                nav: ['Home', 'Live', 'Project', 'Journey', 'Replay'],
                menuOpen: 'Open menu',
                menuClose: 'Close menu',
                currentPage: 'Current page',
                language: 'Language',
                live: 'LIVE',
                status: 'Current status',
                lastUpdate: 'Last update',
                routeStart: 'Start',
                routeFinish: 'Finish'
            }, dynamic: { liveTrackingActive: 'Expedition not started. The planned route is visible; live position will appear after departure.' }
        },
        it: {
            app: {
                nav: ['Home', 'Live', 'Progetto', 'Viaggio', 'Replay'],
                menuOpen: 'Apri menu',
                menuClose: 'Chiudi menu',
                currentPage: 'Pagina corrente',
                language: 'Lingua',
                live: 'LIVE',
                status: 'Stato attuale',
                lastUpdate: 'Ultimo aggiornamento',
                routeStart: 'Partenza',
                routeFinish: 'Arrivo'
            }, dynamic: { liveTrackingActive: 'Spedizione non ancora iniziata. Il percorso previsto è visibile; la posizione live apparirà dopo la partenza.' }
        },
        de: {
            app: {
                nav: ['Start', 'Live', 'Projekt', 'Reise', 'Replay'],
                menuOpen: 'Menü öffnen',
                menuClose: 'Menü schließen',
                currentPage: 'Aktive Seite',
                language: 'Sprache',
                live: 'LIVE',
                status: 'Aktueller Stand',
                lastUpdate: 'Letzte Aktualisierung',
                routeStart: 'Start',
                routeFinish: 'Ziel'
            }, dynamic: { liveTrackingActive: 'Die Expedition hat noch nicht begonnen. Die geplante Route ist sichtbar; die Live-Position erscheint nach dem Start.' }
        },
        fr: {
            app: {
                nav: ['Accueil', 'Live', 'Projet', 'Voyage', 'Replay'],
                menuOpen: 'Ouvrir le menu',
                menuClose: 'Fermer le menu',
                currentPage: 'Page active',
                language: 'Langue',
                live: 'LIVE',
                status: 'État actuel',
                lastUpdate: 'Dernière mise à jour',
                routeStart: 'Départ',
                routeFinish: 'Arrivée'
            }, dynamic: { liveTrackingActive: "L’expédition n’a pas encore commencé. L’itinéraire prévu est visible; la position en direct apparaîtra après le départ." }
        }
    };

    function resolveLanguage(lang) {
        const normalized = String(lang || '').toLowerCase();
        return catalog[normalized] ? normalized : 'en';
    }

    function applyLanguagePreference(language) {
        const normalized = resolveLanguage(language);
        document.documentElement.lang = normalized;
        document.body?.setAttribute('data-lang', normalized);

        const selects = document.querySelectorAll('.lang-switcher-select');
        selects.forEach((select) => {
            select.value = normalized;
        });

        const navLinks = document.querySelectorAll('.main-nav a');
        navLinks.forEach((link, index) => {
            const label = catalog[normalized]?.app?.nav?.[index];
            if (label) {
                link.textContent = label;
            }
        });
        document.querySelectorAll('[data-i18n]').forEach((node) => {
            const value = t(node.dataset.i18n, normalized);
            if (value) node.textContent = value;
        });

        return normalized;
    }

    function t(path, language) {
        const lang = resolveLanguage(language || document.documentElement.lang);
        const value = String(path || '').split('.').reduce((current, key) => current && current[key], catalog[lang]);
        return typeof value === 'string' ? value : '';
    }

    function hydrateLanguageControls() {
        const selects = document.querySelectorAll('.lang-switcher-select');
        const stored = localStorage.getItem('horizon-language');
        const preferred = resolveLanguage(stored || document.documentElement.lang || 'en');
        selects.forEach((select) => {
            select.value = preferred;
            select.setAttribute('aria-label', catalog[preferred]?.app?.language || 'Language');
            select.onchange = (event) => {
                const next = resolveLanguage(event.target.value);
                localStorage.setItem('horizon-language', next);
                applyLanguagePreference(next);
            };
        });
        applyLanguagePreference(preferred);
    }

    const horizonI18n = {
        catalog,
        resolveLanguage,
        applyLanguagePreference,
        hydrateLanguageControls
        ,t
    };

    window.HorizonI18n = horizonI18n;
})();
