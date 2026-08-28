(function () {
    const catalog = {
        en: {
            app: {
                nav: ['Home', 'Live', 'Dashboard', 'Objectives', 'Photos', 'Replay'],
                menuOpen: 'Open menu',
                menuClose: 'Close menu',
                currentPage: 'Current page',
                language: 'Language',
                live: 'LIVE',
                status: 'Current status',
                lastUpdate: 'Last update',
                routeStart: 'Start',
                routeFinish: 'Finish'
            }, dynamic: { liveTrackingActive: 'Expedition not started. The planned route is visible; live position will appear after departure.' },
            progress:{distance:{title:'Distance',description:'Every kilometre takes us farther west.',achievement:'Distance achievement'},elevation:{title:'Elevation gain',description:'Every climb makes us stronger.',achievement:'Elevation achievement'},time:{title:'Time',description:'Time passes. Determination remains.',achievement:'Time achievement'},cantons:{title:'Cantons',description:'The route crosses Switzerland from east to west.',achievement:'Canton achievement'},passes:{title:'Mountain passes',description:'The alpine crossings along the HORIZON route.',achievement:'Mountain pass achievement'},locked:'Locked',next:'Next',unlocked:'Unlocked',required:'Required',current:'Current',status:'Status',completed:'Completed',remaining:'remaining',badges:{d1:'First kilometre',d50:'Westward trail',d100:'Across Switzerland',d250:'Halfway',d500:'Chancy summit',e1000:'First summit',e2500:'Alpine ascent',e5000:'High peak',e7500:'Alpine ridge',e10000:'Ultimate ascent',t24:'First day',t48:'Day and night',t100:'Night passage',t150:'Endurance',t200:'Beyond time',cgr:'Graubünden',cur:'Uri',cvs:'Valais',cvd:'Vaud',cge:'Geneva',ppiz:'Piz Chavalatsch',pflue:'Flüela Pass',pstrela:'Strela Pass',poberalp:'Oberalp Pass',pfurka:'Furka Pass'}}
        },
        it: {
            app: {
                nav: ['Home', 'Live', 'Dashboard', 'Obiettivi', 'Foto', 'Replay'],
                menuOpen: 'Apri menu',
                menuClose: 'Chiudi menu',
                currentPage: 'Pagina corrente',
                language: 'Lingua',
                live: 'LIVE',
                status: 'Stato attuale',
                lastUpdate: 'Ultimo aggiornamento',
                routeStart: 'Partenza',
                routeFinish: 'Arrivo'
            }, dynamic: { liveTrackingActive: 'Spedizione non ancora iniziata. Il percorso previsto è visibile; la posizione live apparirà dopo la partenza.' },
            progress:{distance:{title:'Distanza',description:'Ogni chilometro ci porta più a ovest.',achievement:'Traguardo di distanza'},elevation:{title:'Dislivello positivo',description:'Ogni salita ci rende più forti.',achievement:'Traguardo di dislivello'},time:{title:'Tempo',description:'Il tempo passa. La determinazione resta.',achievement:'Traguardo di tempo'},cantons:{title:'Cantoni',description:'Il percorso attraversa la Svizzera da est a ovest.',achievement:'Traguardo cantonale'},passes:{title:'Passi alpini',description:'Gli attraversamenti alpini lungo la rotta HORIZON.',achievement:'Traguardo di passo alpino'},locked:'Bloccato',next:'Prossimo',unlocked:'Sbloccato',required:'Richiesto',current:'Attuale',status:'Stato',completed:'Completato',remaining:'rimanenti',badges:{d1:'Primo chilometro',d50:'Verso ovest',d100:'Attraverso la Svizzera',d250:'Metà percorso',d500:'Vetta di Chancy',e1000:'Prima vetta',e2500:'Ascesa alpina',e5000:'Alta vetta',e7500:'Cresta alpina',e10000:'Ascesa definitiva',t24:'Primo giorno',t48:'Giorno e notte',t100:'Passaggio notturno',t150:'Resistenza',t200:'Oltre il tempo',cgr:'Grigioni',cur:'Uri',cvs:'Vallese',cvd:'Vaud',cge:'Ginevra',ppiz:'Piz Chavalatsch',pflue:'Passo della Flüela',pstrela:'Passo della Strela',poberalp:'Passo dell’Oberalp',pfurka:'Passo della Furka'}}
        },
        de: {
            app: {
                nav: ['Start', 'Live', 'Dashboard', 'Ziele', 'Fotos', 'Replay'],
                menuOpen: 'Menü öffnen',
                menuClose: 'Menü schließen',
                currentPage: 'Aktive Seite',
                language: 'Sprache',
                live: 'LIVE',
                status: 'Aktueller Stand',
                lastUpdate: 'Letzte Aktualisierung',
                routeStart: 'Start',
                routeFinish: 'Ziel'
            }, dynamic: { liveTrackingActive: 'Die Expedition hat noch nicht begonnen. Die geplante Route ist sichtbar; die Live-Position erscheint nach dem Start.' },
            progress:{distance:{title:'Distanz',description:'Jeder Kilometer führt uns weiter nach Westen.',achievement:'Distanzabzeichen'},elevation:{title:'Höhengewinn',description:'Jeder Aufstieg macht uns stärker.',achievement:'Höhenabzeichen'},time:{title:'Zeit',description:'Die Zeit vergeht. Die Entschlossenheit bleibt.',achievement:'Zeitabzeichen'},cantons:{title:'Kantone',description:'Die Route durchquert die Schweiz von Ost nach West.',achievement:'Kantonsabzeichen'},passes:{title:'Alpenpässe',description:'Die alpinen Übergänge entlang der HORIZON-Route.',achievement:'Passabzeichen'},locked:'Gesperrt',next:'Nächstes',unlocked:'Freigeschaltet',required:'Erforderlich',current:'Aktuell',status:'Status',completed:'Abgeschlossen',remaining:'verbleibend',badges:{d1:'Erster Kilometer',d50:'Westwärts',d100:'Durch die Schweiz',d250:'Halbzeit',d500:'Gipfel von Chancy',e1000:'Erster Gipfel',e2500:'Alpiner Aufstieg',e5000:'Hoher Gipfel',e7500:'Alpengrat',e10000:'Finaler Aufstieg',t24:'Erster Tag',t48:'Tag und Nacht',t100:'Nachtpassage',t150:'Ausdauer',t200:'Jenseits der Zeit',cgr:'Graubünden',cur:'Uri',cvs:'Wallis',cvd:'Waadt',cge:'Genf',ppiz:'Piz Chavalatsch',pflue:'Flüelapass',pstrela:'Strelapass',poberalp:'Oberalppass',pfurka:'Furkapass'}}
        },
        fr: {
            app: {
                nav: ['Accueil', 'Live', 'Dashboard', 'Objectifs', 'Photos', 'Replay'],
                menuOpen: 'Ouvrir le menu',
                menuClose: 'Fermer le menu',
                currentPage: 'Page active',
                language: 'Langue',
                live: 'LIVE',
                status: 'État actuel',
                lastUpdate: 'Dernière mise à jour',
                routeStart: 'Départ',
                routeFinish: 'Arrivée'
            }, dynamic: { liveTrackingActive: "L’expédition n’a pas encore commencé. L’itinéraire prévu est visible; la position en direct apparaîtra après le départ." },
            progress:{distance:{title:'Distance',description:'Chaque kilomètre nous mène plus à l’ouest.',achievement:'Badge de distance'},elevation:{title:'Dénivelé positif',description:'Chaque montée nous rend plus forts.',achievement:'Badge de dénivelé'},time:{title:'Temps',description:'Le temps passe. La détermination reste.',achievement:'Badge de temps'},cantons:{title:'Cantons',description:'La route traverse la Suisse d’est en ouest.',achievement:'Badge de canton'},passes:{title:'Cols alpins',description:'Les traversées alpines de la route HORIZON.',achievement:'Badge de col alpin'},locked:'Verrouillé',next:'Suivant',unlocked:'Déverrouillé',required:'Requis',current:'Actuel',status:'Statut',completed:'Terminé',remaining:'restants',badges:{d1:'Premier kilomètre',d50:'Vers l’ouest',d100:'À travers la Suisse',d250:'Mi-parcours',d500:'Sommet de Chancy',e1000:'Premier sommet',e2500:'Ascension alpine',e5000:'Haut sommet',e7500:'Crête alpine',e10000:'Ascension ultime',t24:'Premier jour',t48:'Jour et nuit',t100:'Passage nocturne',t150:'Endurance',t200:'Au-delà du temps',cgr:'Grisons',cur:'Uri',cvs:'Valais',cvd:'Vaud',cge:'Genève',ppiz:'Piz Chavalatsch',pflue:'Col de la Flüela',pstrela:'Col de la Strela',poberalp:'Col de l’Oberalp',pfurka:'Col de la Furka'}}
        }
    };

    const phrases = {
        it: {
            'Skip to main content':'Vai al contenuto principale','About':'Il progetto','Field Notes':'Diario di viaggio','Telemetry':'Telemetria','Progress':'Progressi','Home':'Home','Project':'Progetto','Journey':'Viaggio',
            'START':'PARTENZA','Days':'Giorni','Hours':'Ore','Minutes':'Minuti','Seconds':'Secondi','Time until departure':'Tempo alla partenza','HORIZON IS UNDERWAY':'HORIZON È IN CAMMINO',
            'Distance':'Distanza','Remaining':'Rimanenti','Completed':'Completato','Speed':'Velocità','Altitude':'Altitudine','Last update':'Ultimo aggiornamento','Time':'Tempo','Elevation gain':'Dislivello positivo','Steps':'Passi','Current status':'Stato attuale',
            'Play':'Avvia','Pause':'Pausa','Reset':'Reimposta','Relive the route.':'Rivivi il percorso.','Play back the entire track, pause, speed up and follow every recorded position.':'Riproduci l’intero tracciato, metti in pausa, accelera e segui ogni posizione registrata.','Objectives':'Obiettivi','Badges and progress.':'Traguardi e progressi.','Photographs':'Fotografie','Full journey gallery':'Galleria completa del viaggio','Photo map':'Mappa fotografica','Image locations.':'Luoghi delle immagini.',
            'ABOUT HORIZON':'HORIZON','Two people. One route across Switzerland.':'Due persone. Un percorso attraverso la Svizzera.','What HORIZON is':'Cos’è HORIZON','Motivation':'Motivazione','Preparation':'Preparazione','Equipment':'Equipaggiamento','Nutrition':'Alimentazione','Route':'Percorso','Support':'Supporto','KEEP MOVING WEST.':'CONTINUARE VERSO OVEST.','ONE KILOMETRE AT A TIME':'UN CHILOMETRO ALLA VOLTA','HORIZON © 2026 · Across Switzerland. East to west.':'HORIZON © 2026 · Attraverso la Svizzera. Da est a ovest.'
        },
        de: {
            'Skip to main content':'Zum Hauptinhalt','About':'Projekt','Field Notes':'Feldnotizen','Telemetry':'Telemetrie','Progress':'Fortschritt','Home':'Start','Project':'Projekt','Journey':'Reise',
            'START':'START','Days':'Tage','Hours':'Stunden','Minutes':'Minuten','Seconds':'Sekunden','Time until departure':'Zeit bis zum Start','HORIZON IS UNDERWAY':'HORIZON IST UNTERWEGS',
            'Distance':'Distanz','Remaining':'Verbleibend','Completed':'Abgeschlossen','Speed':'Geschwindigkeit','Altitude':'Höhe','Last update':'Letzte Aktualisierung','Time':'Zeit','Elevation gain':'Höhengewinn','Steps':'Schritte','Current status':'Aktueller Stand',
            'Play':'Start','Pause':'Pause','Reset':'Zurücksetzen','Relive the route.':'Die Route noch einmal erleben.','Play back the entire track, pause, speed up and follow every recorded position.':'Spiele die gesamte Strecke ab, pausiere, beschleunige und verfolge jede aufgezeichnete Position.','Objectives':'Ziele','Badges and progress.':'Abzeichen und Fortschritt.','Photographs':'Fotografien','Full journey gallery':'Vollständige Reisegalerie','Photo map':'Fotokarte','Image locations.':'Aufnahmeorte.',
            'ABOUT HORIZON':'ÜBER HORIZON','Two people. One route across Switzerland.':'Zwei Menschen. Eine Route durch die Schweiz.','What HORIZON is':'Was HORIZON ist','Motivation':'Motivation','Preparation':'Vorbereitung','Equipment':'Ausrüstung','Nutrition':'Ernährung','Route':'Route','Support':'Unterstützung','KEEP MOVING WEST.':'WEITER NACH WESTEN.','ONE KILOMETRE AT A TIME':'EIN KILOMETER NACH DEM ANDEREN','HORIZON © 2026 · Across Switzerland. East to west.':'HORIZON © 2026 · Durch die Schweiz. Von Ost nach West.'
        },
        fr: {
            'Skip to main content':'Aller au contenu principal','About':'Projet','Field Notes':'Notes de terrain','Telemetry':'Télémétrie','Progress':'Progression','Home':'Accueil','Project':'Projet','Journey':'Voyage',
            'START':'DÉPART','Days':'Jours','Hours':'Heures','Minutes':'Minutes','Seconds':'Secondes','Time until departure':'Temps avant le départ','HORIZON IS UNDERWAY':'HORIZON EST EN ROUTE',
            'Distance':'Distance','Remaining':'Restant','Completed':'Terminé','Speed':'Vitesse','Altitude':'Altitude','Last update':'Dernière mise à jour','Time':'Temps','Elevation gain':'Dénivelé positif','Steps':'Pas','Current status':'État actuel',
            'Play':'Lecture','Pause':'Pause','Reset':'Réinitialiser','Relive the route.':'Revivez le parcours.','Play back the entire track, pause, speed up and follow every recorded position.':'Revivez tout le tracé, mettez en pause, accélérez et suivez chaque position enregistrée.','Objectives':'Objectifs','Badges and progress.':'Badges et progression.','Photographs':'Photographies','Full journey gallery':'Galerie complète du voyage','Photo map':'Carte photo','Image locations.':'Lieux des images.',
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
        document.dispatchEvent(new CustomEvent('horizon:languagechange', { detail: { language: normalized } }));

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
