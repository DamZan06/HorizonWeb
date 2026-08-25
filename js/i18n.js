(function () {
    const catalog = {
        en: {
            app: {
                nav: ['Home', 'Live', 'The challenge', 'Route', 'Journey', 'Replay', 'About'],
                menuOpen: 'Open menu',
                menuClose: 'Close menu',
                currentPage: 'Current page',
                language: 'Language',
                live: 'LIVE',
                status: 'Current status',
                lastUpdate: 'Last update',
                routeStart: 'Start',
                routeFinish: 'Finish'
            }
        },
        it: {
            app: {
                nav: ['Home', 'Live', 'La sfida', 'Percorso', 'Viaggio', 'Replay', 'About'],
                menuOpen: 'Apri menu',
                menuClose: 'Chiudi menu',
                currentPage: 'Pagina corrente',
                language: 'Lingua',
                live: 'LIVE',
                status: 'Stato attuale',
                lastUpdate: 'Ultimo aggiornamento',
                routeStart: 'Partenza',
                routeFinish: 'Arrivo'
            }
        },
        de: {
            app: {
                nav: ['Start', 'Live', 'Die Herausforderung', 'Route', 'Reise', 'Replay', 'Über uns'],
                menuOpen: 'Menü öffnen',
                menuClose: 'Menü schließen',
                currentPage: 'Aktive Seite',
                language: 'Sprache',
                live: 'LIVE',
                status: 'Aktueller Stand',
                lastUpdate: 'Letzte Aktualisierung',
                routeStart: 'Start',
                routeFinish: 'Ziel'
            }
        },
        fr: {
            app: {
                nav: ['Accueil', 'Live', 'Le défi', 'Itinéraire', 'Voyage', 'Replay', 'À propos'],
                menuOpen: 'Ouvrir le menu',
                menuClose: 'Fermer le menu',
                currentPage: 'Page active',
                language: 'Langue',
                live: 'LIVE',
                status: 'État actuel',
                lastUpdate: 'Dernière mise à jour',
                routeStart: 'Départ',
                routeFinish: 'Arrivée'
            }
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

        return normalized;
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
    };

    window.HorizonI18n = horizonI18n;
    window.NorthLineI18n = horizonI18n;
})();
