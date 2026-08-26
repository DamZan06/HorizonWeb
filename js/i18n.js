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

    const phrases = {
        it: {
            'Skip to main content':'Vai al contenuto principale','About':'Il progetto','Field Notes':'Diario di viaggio','Telemetry':'Telemetria','Progress':'Progressi','Home':'Home','Project':'Progetto','Journey':'Viaggio',
            'START':'PARTENZA','Days':'Giorni','Hours':'Ore','Minutes':'Minuti','Seconds':'Secondi','Time until departure':'Tempo alla partenza','HORIZON IS UNDERWAY':'HORIZON È IN CAMMINO',
            'Distance':'Distanza','Remaining':'Rimanenti','Completed':'Completato','Speed':'Velocità','Altitude':'Altitudine','Last update':'Ultimo aggiornamento','Time':'Tempo','Elevation gain':'Dislivello positivo','Steps':'Passi','Current status':'Stato attuale',
            'Play':'Avvia','Pause':'Pausa','Reset':'Reimposta','Relive the route.':'Rivivi il percorso.','Objectives':'Obiettivi','Badges and progress.':'Traguardi e progressi.','Photographs':'Fotografie','Full journey gallery':'Galleria completa del viaggio','Photo map':'Mappa fotografica','Image locations.':'Luoghi delle immagini.',
            'ABOUT HORIZON':'HORIZON','Two people. One route across Switzerland.':'Due persone. Un percorso attraverso la Svizzera.','What HORIZON is':'Cos’è HORIZON','Motivation':'Motivazione','Preparation':'Preparazione','Equipment':'Equipaggiamento','Nutrition':'Alimentazione','Route':'Percorso','Support':'Supporto','KEEP MOVING WEST.':'CONTINUARE VERSO OVEST.','ONE KILOMETRE AT A TIME':'UN CHILOMETRO ALLA VOLTA','HORIZON © 2026 · Across Switzerland. East to west.':'HORIZON © 2026 · Attraverso la Svizzera. Da est a ovest.'
        },
        de: {
            'Skip to main content':'Zum Hauptinhalt','About':'Projekt','Field Notes':'Feldnotizen','Telemetry':'Telemetrie','Progress':'Fortschritt','Home':'Start','Project':'Projekt','Journey':'Reise',
            'START':'START','Days':'Tage','Hours':'Stunden','Minutes':'Minuten','Seconds':'Sekunden','Time until departure':'Zeit bis zum Start','HORIZON IS UNDERWAY':'HORIZON IST UNTERWEGS',
            'Distance':'Distanz','Remaining':'Verbleibend','Completed':'Abgeschlossen','Speed':'Geschwindigkeit','Altitude':'Höhe','Last update':'Letzte Aktualisierung','Time':'Zeit','Elevation gain':'Höhengewinn','Steps':'Schritte','Current status':'Aktueller Stand',
            'Play':'Start','Pause':'Pause','Reset':'Zurücksetzen','Relive the route.':'Die Route noch einmal erleben.','Objectives':'Ziele','Badges and progress.':'Abzeichen und Fortschritt.','Photographs':'Fotografien','Full journey gallery':'Vollständige Reisegalerie','Photo map':'Fotokarte','Image locations.':'Aufnahmeorte.',
            'ABOUT HORIZON':'ÜBER HORIZON','Two people. One route across Switzerland.':'Zwei Menschen. Eine Route durch die Schweiz.','What HORIZON is':'Was HORIZON ist','Motivation':'Motivation','Preparation':'Vorbereitung','Equipment':'Ausrüstung','Nutrition':'Ernährung','Route':'Route','Support':'Unterstützung','KEEP MOVING WEST.':'WEITER NACH WESTEN.','ONE KILOMETRE AT A TIME':'EIN KILOMETER NACH DEM ANDEREN','HORIZON © 2026 · Across Switzerland. East to west.':'HORIZON © 2026 · Durch die Schweiz. Von Ost nach West.'
        },
        fr: {
            'Skip to main content':'Aller au contenu principal','About':'Projet','Field Notes':'Notes de terrain','Telemetry':'Télémétrie','Progress':'Progression','Home':'Accueil','Project':'Projet','Journey':'Voyage',
            'START':'DÉPART','Days':'Jours','Hours':'Heures','Minutes':'Minutes','Seconds':'Secondes','Time until departure':'Temps avant le départ','HORIZON IS UNDERWAY':'HORIZON EST EN ROUTE',
            'Distance':'Distance','Remaining':'Restant','Completed':'Terminé','Speed':'Vitesse','Altitude':'Altitude','Last update':'Dernière mise à jour','Time':'Temps','Elevation gain':'Dénivelé positif','Steps':'Pas','Current status':'État actuel',
            'Play':'Lecture','Pause':'Pause','Reset':'Réinitialiser','Relive the route.':'Revivez le parcours.','Objectives':'Objectifs','Badges and progress.':'Badges et progression.','Photographs':'Photographies','Full journey gallery':'Galerie complète du voyage','Photo map':'Carte photo','Image locations.':'Lieux des images.',
            'ABOUT HORIZON':'À PROPOS DE HORIZON','Two people. One route across Switzerland.':'Deux personnes. Un itinéraire à travers la Suisse.','What HORIZON is':'Ce qu’est HORIZON','Motivation':'Motivation','Preparation':'Préparation','Equipment':'Équipement','Nutrition':'Nutrition','Route':'Itinéraire','Support':'Soutien','KEEP MOVING WEST.':'CONTINUER VERS L’OUEST.','ONE KILOMETRE AT A TIME':'UN KILOMÈTRE À LA FOIS','HORIZON © 2026 · Across Switzerland. East to west.':'HORIZON © 2026 · À travers la Suisse. D’est en ouest.'
        }
    };

    function translateTextNodes(language) {
        const dictionary = phrases[language] || {};
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
            const source = node.parentElement?.dataset?.i18nSource || node.nodeValue.trim();
            if (!source) continue;
            if (!node.parentElement.dataset.i18nSource) node.parentElement.dataset.i18nSource = source;
            const translated = language === 'en' ? source : dictionary[source];
            if (translated) node.nodeValue = node.nodeValue.replace(node.nodeValue.trim(), translated);
        }
    }

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
        translateTextNodes(normalized);

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
