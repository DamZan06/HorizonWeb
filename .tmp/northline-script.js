const firebaseURL = "https://northline-a4eaa-default-rtdb.europe-west1.firebasedatabase.app/livetrack/points.json";
const plannedStartDateIso = '2026-08-01T04:00:00+02:00';
const contentDatabasePath = 'content';
const trackerDataUrl = 'data/NorthLine_trackers.json';
const defaultCenter = [46.0, 8.9];
const defaultZoom = 12;
const adminSessionKey = 'northline-admin-authenticated';
const supportedLanguages = ['it', 'en', 'de'];
const defaultLanguage = 'it';
const languageStorageKey = 'northline-language';
const i18nCatalog = {
    it: {
        common: {
            languageLabel: 'Lingua',
            languageAria: 'Seleziona lingua',
            navAria: 'Navigazione principale',
            nav: ['Home', 'Live', 'Dashboard', 'Galleria', 'Replay', 'Progressi', 'Il progetto'],
            brands: {
                home: 'Adventure Tracker',
                live: 'Live Tracker',
                dashboard: 'Dashboard',
                gallery: 'Galleria',
                replay: 'Replay',
                progress: 'Progressi',
                project: 'Il progetto',
                admin: 'Admin'
            },
            menuOpen: 'Apri menu',
            menuClose: 'Chiudi menu',
            languageNames: { it: 'Italiano', en: 'English', de: 'Deutsch' }
        },
        pages: {
            home: {
                title: 'NorthLine | Traversata della Svizzera in tempo reale',
                countdownEyebrow: 'Partenza prevista',
                countdownTitle: '1 Agosto · ore 04:00',
                countdownMessage: 'Calcolo del tempo rimanente in corso...',
                labels: ['Giorni', 'Ore', 'Minuti', 'Secondi'],
                heroEyebrow: 'NorthLine · Attraversando la Svizzera a piedi',
                heroTitle: '333 chilometri. Un solo obiettivo.',
                heroDescription: 'NorthLine è una traversata della Svizzera percorsa interamente a piedi, condivisa in tempo reale attraverso una piattaforma sviluppata appositamente per questa avventura. Qui potrai seguire ogni passo, osservare la posizione live, analizzare le statistiche e vivere il viaggio come se fossi sul sentiero insieme a noi.',
                heroButtons: ['Segui il Live', 'Scopri il progetto'],
                statsLabels: ['km percorsi', 'km rimanenti', 'completato', 'tempo trascorso', 'dislivello', 'passi stimati', 'arrivo stimato'],
                sectionTitle: 'Non osservare solamente il viaggio. Vivilo.',
                sectionDescription: 'NorthLine ti permette di seguire l\'intera traversata della Svizzera attraverso mappe live, statistiche aggiornate, racconti quotidiani e contenuti esclusivi. Ogni giornata porterà nuove sfide, nuovi paesaggi e una nuova storia da raccontare.',
                featureTitles: ['Mappa Live', 'Statistiche Live', 'Diario di bordo', 'Replay del percorso'],
                featureTexts: [
                    'Segui in tempo reale la mia posizione lungo il percorso. Ogni aggiornamento mostra dove mi trovo, quanti chilometri sono stati percorsi e quanto manca al traguardo.',
                    'Velocità, distanza, altitudine, dislivello, tempo di percorrenza e molti altri dati vengono aggiornati automaticamente durante tutta l\'avventura.',
                    'Ogni giornata verra raccontata attraverso fotografie, impressioni, difficolta, emozioni e curiosita incontrate lungo il cammino.',
                    'Rivivi l\'intera traversata sulla mappa e osserva ogni tappa del viaggio grazie a una timeline interattiva sincronizzata con il percorso reale.'
                ],
                statusTitle: 'Stato attuale',
                footer: 'NorthLine © 2026 · Una traversata della Svizzera raccontata in tempo reale attraverso mappe, dati e storie. Ogni passo, una nuova avventura.'
            },
            live: {
                title: 'NorthLine – Mappa Live',
                eyebrow: 'Live Map',
                heading: 'La NorthLine in diretta sulla mappa.',
                description: 'Segui la posizione attuale, il percorso completato e le statistiche dell\'atleta con una mappa a schermo intero.',
                statsEyebrow: 'Statistiche Live',
                statsTitle: 'Stato attuale',
                statsLabels: ['Distanza', 'Rimanenti', 'Completato', 'Velocita', 'Altitudine', 'Ultimo aggiornamento', 'Progresso del percorso', 'Tempo', 'Dislivello', 'Passi', 'Distanza dalla partenza'],
                mapControlAria: 'Controlli mappa',
                centerUser: 'Centra sulla tua posizione',
                centerLive: 'Centra sulla posizione live',
                fullscreenMap: 'Mappa a schermo intero',
                exitFullscreenMap: 'Esci da schermo intero'
            },
            dashboard: {
                title: 'NorthLine – Dashboard',
                eyebrow: 'Analisi avanzata',
                heading: 'Dashboard delle statistiche.',
                description: 'Statistiche sportive complete con grafici per velocita, altitudine, andamento giornaliero e progressione.',
                statLabels: ['Distanza percorsa', 'Distanza rimanente', 'Percentuale completata', 'Velocita attuale', 'Velocita media in movimento', 'Velocita media totale', 'Velocita massima', 'Altitudine attuale', 'Dislivello positivo', 'Tempo totale', 'Tempo in movimento', 'Frequenza cardiaca', 'Frequenza cardiaca media', 'Calorie bruciate', 'Acqua persa', 'Arrivo stimato'],
                chartsTitle: 'Grafici live',
                xAxis: 'Asse X',
                xDistance: 'Km',
                xTime: 'Tempo',
                chartTitles: ['Velocita', 'Altitudine', 'Frequenza cardiaca', 'Dislivello cumulato'],
                chartEmpty: 'Grafico disponibile alla partenza.'
            },
            gallery: {
                title: 'NorthLine – Galleria',
                eyebrow: 'Fotografie',
                heading: 'Galleria completa del viaggio',
                mapEyebrow: 'Cartina foto',
                mapTitle: 'Posizione delle immagini.',
                mapWaiting: 'In attesa di immagini geolocalizzate...',
                fullscreenMap: 'Mappa a schermo intero',
                exitFullscreenMap: 'Esci da schermo intero',
                modalClose: 'Chiudi',
                modalPrev: 'Immagine precedente',
                modalNext: 'Immagine successiva',
                modalTitle: 'Titolo immagine',
                modalLocation: 'Localita',
                modalDescription: 'Descrizione della foto e posizione sulla mappa.'
            },
            replay: {
                title: 'NorthLine – Replay',
                eyebrow: 'Replay',
                heading: 'Rivivi il percorso.',
                description: 'Riproduci l\'intero tracciato, metti in pausa, accelera e controlla i punti piu significativi.',
                play: 'Riproduci',
                pause: 'Pausa',
                reset: 'Reset',
                speed: 'Velocita:',
                ready: 'Replay pronto',
                complete: 'Replay completato'
            },
            progress: {
                title: 'NorthLine – Progressi',
                eyebrow: 'Obiettivi',
                heading: 'Badge e progressi.',
                description: 'I badge mostrano i tuoi progressi lungo il percorso.',
                hiddenSectionTitle: 'Traguardi nascosti',
            },
            project: {
                title: 'NorthLine – Il progetto',
                heading: 'Cos\'e il progetto NorthLine?'
            },
            admin: {
                title: 'NorthLine – Admin'
            }
        },
        status: {
            notStarted: 'Non partito',
            moving: 'In movimento',
            paused: 'In pausa',
            ended: 'Fine giornata',
            completed: 'Sfida completata'
        },
        dynamic: {
            noDescription: 'Nessuna descrizione disponibile.',
            dateUnset: 'Data non impostata',
            update: 'Aggiornamento',
            photo: 'Foto',
            locationUnset: 'Localita non impostata',
            galleryEmptyTitle: 'Galleria vuota',
            galleryEmptyText: 'Nessuna immagine disponibile al momento. Le foto verranno aggiunte dalla prossima pubblicazione.',
            diaryEmptyTitle: 'Diario vuoto',
            diaryEmptyText: 'Ancora nessuna voce pubblicata. I racconti e gli aggiornamenti cronologici verranno inseriti durante il percorso.',
            countdownUpdated: 'Countdown aggiornato in tempo reale.',
            countdownStarted: 'La partenza prevista e in corso.',
            liveNotAvailable: 'In attesa della partenza: nessun dato live disponibile.',
            liveTrackingActive: 'Tracker attivo e aggiornato.',
            waitingNextPoint: 'Dati disponibili, attesa prossima posizione.',
            visitorDistance: 'Distanza visitatore',
            visitorFromStart: 'Distanza dalla partenza',
            notSupported: 'Non supportato',
            permissionDenied: 'Permesso negato',
            replayProgress: 'Replay {current}/{total}',
            progressEmptyTitle: 'Badge non impostati',
            progressEmptyText: 'Nessun traguardo predefinito. Potrai aggiungere i badge quando vorrai iniziare il monitoraggio reale.',
            badgeUnlocked: 'Sbloccato',
            badgePending: 'In attesa'
        }
    },
    en: {
        common: {
            languageLabel: 'Language',
            languageAria: 'Select language',
            navAria: 'Main navigation',
            nav: ['Home', 'Live', 'Dashboard', 'Gallery', 'Replay', 'Progress', 'Project'],
            brands: {
                home: 'Adventure Tracker',
                live: 'Live Tracker',
                dashboard: 'Dashboard',
                gallery: 'Gallery',
                replay: 'Replay',
                progress: 'Progress',
                project: 'Project',
                admin: 'Admin'
            },
            menuOpen: 'Open menu',
            menuClose: 'Close menu',
            languageNames: { it: 'Italiano', en: 'English', de: 'Deutsch' }
        },
        pages: {
            home: {
                title: 'NorthLine | Switzerland crossing in real time',
                countdownEyebrow: 'Planned departure',
                countdownTitle: '1 August · 04:00',
                countdownMessage: 'Calculating remaining time...',
                labels: ['Days', 'Hours', 'Minutes', 'Seconds'],
                heroEyebrow: 'NorthLine · Crossing Switzerland on foot',
                heroTitle: '333 kilometers. One goal.',
                heroDescription: 'NorthLine is a full crossing of Switzerland completed entirely on foot, shared live through a platform built specifically for this adventure. Here you can follow every step, watch the live position, analyze the stats, and experience the journey as if you were on the trail with us.',
                heroButtons: ['Follow Live', 'Discover the project'],
                statsLabels: ['km covered', 'km remaining', 'completed', 'time elapsed', 'elevation gain', 'estimated steps', 'estimated arrival'],
                sectionTitle: 'Do not just watch the journey. Live it.',
                sectionDescription: 'NorthLine lets you follow the full crossing of Switzerland through live maps, updated stats, daily stories, and exclusive content. Each day brings new challenges, new landscapes, and a new story to tell.',
                featureTitles: ['Live Map', 'Live Stats', 'Travel Diary', 'Route Replay'],
                featureTexts: [
                    'Follow my position along the route in real time. Each update shows where I am, how many kilometers are done, and how far is left to the finish.',
                    'Speed, distance, altitude, elevation gain, travel time, and many other values are updated automatically throughout the adventure.',
                    'Each day is told through photos, impressions, challenges, emotions, and curiosities encountered on the trail.',
                    'Relive the full crossing on the map and watch every stage through an interactive timeline synced with the real route.'
                ],
                statusTitle: 'Current status',
                footer: 'NorthLine © 2026 · A Switzerland crossing told in real time through maps, data, and stories. Every step, a new adventure.'
            },
            live: {
                title: 'NorthLine – Live Map',
                eyebrow: 'Live Map',
                heading: 'NorthLine live on the map.',
                description: 'Follow the current position, completed route, and athlete statistics with a fullscreen map.',
                statsEyebrow: 'Live Statistics',
                statsTitle: 'Current status',
                statsLabels: ['Distance', 'Remaining', 'Completed', 'Speed', 'Altitude', 'Last update', 'Route progress', 'Time', 'Elevation', 'Steps', 'Distance from start'],
                mapControlAria: 'Map controls',
                centerUser: 'Center on your position',
                centerLive: 'Center on live position',
                fullscreenMap: 'Fullscreen map',
                exitFullscreenMap: 'Exit fullscreen'
            },
            dashboard: {
                title: 'NorthLine – Dashboard',
                eyebrow: 'Advanced analysis',
                heading: 'Statistics dashboard.',
                description: 'Complete sport statistics with charts for speed, altitude, daily trend, and progression.',
                statLabels: ['Distance covered', 'Distance remaining', 'Completion rate', 'Current speed', 'Moving average speed', 'Total average speed', 'Max speed', 'Current altitude', 'Positive elevation', 'Total time', 'Moving time', 'Heart rate', 'Average heart rate', 'Calories burned', 'Water lost', 'Estimated arrival'],
                chartsTitle: 'Live charts',
                xAxis: 'X axis',
                xDistance: 'Km',
                xTime: 'Time',
                chartTitles: ['Speed', 'Altitude', 'Heart rate', 'Cumulative elevation'],
                chartEmpty: 'Chart available at departure.'
            },
            gallery: {
                title: 'NorthLine – Gallery',
                eyebrow: 'Photos',
                heading: 'Complete journey gallery',
                mapEyebrow: 'Photo map',
                mapTitle: 'Image positions.',
                mapWaiting: 'Waiting for geolocated images...',
                fullscreenMap: 'Fullscreen map',
                exitFullscreenMap: 'Exit fullscreen',
                modalClose: 'Close',
                modalPrev: 'Previous image',
                modalNext: 'Next image',
                modalTitle: 'Image title',
                modalLocation: 'Location',
                modalDescription: 'Photo description and map position.'
            },
            replay: {
                title: 'NorthLine – Replay',
                eyebrow: 'Replay',
                heading: 'Relive the route.',
                description: 'Replay the full track, pause, speed up, and inspect key points.',
                play: 'Play',
                pause: 'Pause',
                reset: 'Reset',
                speed: 'Speed:',
                ready: 'Replay ready',
                complete: 'Replay completed'
            },
            progress: {
                title: 'NorthLine – Progress',
                eyebrow: 'Goals',
                heading: 'Badges and progress.',
                description: 'Badges show your progress along the route.',
                hiddenSectionTitle: 'Hidden milestones',
                hiddenSectionTranslation: 'Traguardi nascosti / Versteckte Meilensteine'
            },
            project: {
                title: 'NorthLine – Project',
                eyebrow: 'NorthLine',
                heading: 'What is the NorthLine project?',
                intro: 'NorthLine is much more than a simple crossing of Switzerland. It is a project born from the desire to test limits, explore the territory step by step, and share every moment in real time.',
                cardTitles: ['What NorthLine is', 'Motivation', 'Preparation', 'Equipment', 'Nutrition', 'Route', 'Support', 'Curiosities'],
                cardTexts: [
                    'NorthLine is a south-to-north crossing of Switzerland on foot, about 333 km and over 6,000 meters of positive elevation gain.',
                    'This project was created to leave the comfort zone and prove that consistency and preparation make difficult goals achievable.',
                    'Months of training, route study, elevation analysis, logistics and platform development were essential before departure.',
                    'Every gram matters: the backpack balances lightness, safety and autonomy with GPS, emergency gear, batteries and technical clothing.',
                    'Long walking days require careful energy management with hydration, minerals and high-energy foods.',
                    'The route crosses lakes, valleys, forests, alpine passes and high-altitude trails with continuous adaptation to terrain and weather.',
                    'Even if every step is on foot, the adventure includes constant logistical and emotional support throughout the journey.',
                    'NorthLine also shares photos, local stories and encounters to make followers feel part of the adventure.'
                ]
            },
            admin: { title: 'NorthLine – Admin' }
        },
        status: {
            notStarted: 'Not started',
            moving: 'Moving',
            paused: 'Paused',
            ended: 'Day ended',
            completed: 'Challenge completed'
        },
        dynamic: {
            noDescription: 'No description available.',
            dateUnset: 'Date not set',
            update: 'Update',
            photo: 'Photo',
            locationUnset: 'Location not set',
            galleryEmptyTitle: 'Empty gallery',
            galleryEmptyText: 'No images available yet. Photos will be added in the next publication.',
            diaryEmptyTitle: 'Empty diary',
            diaryEmptyText: 'No entries have been published yet. Stories and timeline updates will be added during the journey.',
            countdownUpdated: 'Countdown updated in real time.',
            countdownStarted: 'Planned start is now in progress.',
            liveNotAvailable: 'Waiting for departure: no live data available yet.',
            liveTrackingActive: 'Tracker active and updated.',
            waitingNextPoint: 'Data available, waiting for next position.',
            visitorDistance: 'Visitor distance',
            visitorFromStart: 'Distance from start',
            notSupported: 'Not supported',
            permissionDenied: 'Permission denied',
            replayProgress: 'Replay {current}/{total}',
            progressEmptyTitle: 'No badges configured',
            progressEmptyText: 'No milestone is currently defined. You can add badges when real tracking starts.',
            badgeUnlocked: 'Unlocked',
            badgePending: 'Pending'
        }
    },
    de: {
        common: {
            languageLabel: 'Sprache',
            languageAria: 'Sprache wählen',
            navAria: 'Hauptnavigation',
            nav: ['Start', 'Live', 'Dashboard', 'Galerie', 'Replay', 'Fortschritt', 'Projekt'],
            brands: {
                home: 'Adventure Tracker',
                live: 'Live Tracker',
                dashboard: 'Dashboard',
                gallery: 'Galerie',
                replay: 'Replay',
                progress: 'Fortschritt',
                project: 'Projekt',
                admin: 'Admin'
            },
            menuOpen: 'Menü öffnen',
            menuClose: 'Menü schliessen',
            languageNames: { it: 'Italiano', en: 'English', de: 'Deutsch' }
        },
        pages: {
            home: {
                title: 'NorthLine | Schweiz-Durchquerung in Echtzeit',
                countdownEyebrow: 'Geplanter Start',
                countdownTitle: '1. August · 04:00 Uhr',
                countdownMessage: 'Verbleibende Zeit wird berechnet...',
                labels: ['Tage', 'Stunden', 'Minuten', 'Sekunden'],
                heroEyebrow: 'NorthLine · Die Schweiz zu Fuss durchqueren',
                heroTitle: '333 Kilometer. Ein Ziel.',
                heroDescription: 'NorthLine ist eine komplette Schweiz-Durchquerung zu Fuss, live geteilt über eine Plattform, die speziell für dieses Abenteuer entwickelt wurde. Hier kannst du jeden Schritt verfolgen, die Live-Position sehen, Daten analysieren und die Reise erleben, als wärst du mit uns auf dem Weg.',
                heroButtons: ['Live verfolgen', 'Projekt entdecken'],
                statsLabels: ['km gelaufen', 'km verbleibend', 'abgeschlossen', 'verstrichene Zeit', 'Höhenmeter', 'geschätzte Schritte', 'geschätzte Ankunft'],
                sectionTitle: 'Die Reise nicht nur ansehen. Erleben.',
                sectionDescription: 'NorthLine lässt dich die gesamte Schweiz-Durchquerung über Live-Karten, aktuelle Statistiken, tägliche Berichte und exklusive Inhalte verfolgen. Jeder Tag bringt neue Herausforderungen, neue Landschaften und eine neue Geschichte.',
                featureTitles: ['Live-Karte', 'Live-Statistiken', 'Reisetagebuch', 'Strecken-Replay'],
                featureTexts: [
                    'Verfolge meine Position entlang der Strecke in Echtzeit. Jedes Update zeigt, wo ich bin, wie viele Kilometer geschafft sind und was bis zum Ziel fehlt.',
                    'Geschwindigkeit, Distanz, Höhe, Höhengewinn, Gehzeit und viele weitere Werte werden während des Abenteuers automatisch aktualisiert.',
                    'Jeder Tag wird mit Fotos, Eindrücken, Herausforderungen, Emotionen und Entdeckungen auf dem Weg erzählt.',
                    'Erlebe die gesamte Durchquerung auf der Karte neu und beobachte jede Etappe mit einer interaktiven Timeline, synchron zur realen Strecke.'
                ],
                statusTitle: 'Aktueller Status',
                footer: 'NorthLine © 2026 · Eine Schweiz-Durchquerung in Echtzeit mit Karten, Daten und Geschichten. Jeder Schritt, ein neues Abenteuer.'
            },
            live: {
                title: 'NorthLine – Live-Karte',
                eyebrow: 'Live-Karte',
                heading: 'NorthLine live auf der Karte.',
                description: 'Verfolge die aktuelle Position, die bereits zurückgelegte Strecke und die Statistiken des Athleten auf einer Vollbildkarte.',
                statsEyebrow: 'Live-Statistiken',
                statsTitle: 'Aktueller Status',
                statsLabels: ['Distanz', 'Verbleibend', 'Abgeschlossen', 'Geschwindigkeit', 'Höhe', 'Letztes Update', 'Streckenfortschritt', 'Zeit', 'Höhenmeter', 'Schritte', 'Distanz vom Start'],
                mapControlAria: 'Kartensteuerung',
                centerUser: 'Auf deine Position zentrieren',
                centerLive: 'Auf Live-Position zentrieren',
                fullscreenMap: 'Karte im Vollbild',
                exitFullscreenMap: 'Vollbild verlassen'
            },
            dashboard: {
                title: 'NorthLine – Dashboard',
                eyebrow: 'Erweiterte Analyse',
                heading: 'Statistik-Dashboard.',
                description: 'Vollständige Sportstatistiken mit Diagrammen für Tempo, Höhe, Tagesverlauf und Fortschritt.',
                statLabels: ['Gelaufene Distanz', 'Verbleibende Distanz', 'Abschlussquote', 'Aktuelle Geschwindigkeit', 'Durchschnitt in Bewegung', 'Gesamtdurchschnitt', 'Maximale Geschwindigkeit', 'Aktuelle Höhe', 'Positiver Höhengewinn', 'Gesamtzeit', 'Bewegungszeit', 'Herzfrequenz', 'Durchschnittliche Herzfrequenz', 'Verbrannte Kalorien', 'Verlorenes Wasser', 'Geschätzte Ankunft'],
                chartsTitle: 'Live-Diagramme',
                xAxis: 'X-Achse',
                xDistance: 'Km',
                xTime: 'Zeit',
                chartTitles: ['Geschwindigkeit', 'Höhe', 'Herzfrequenz', 'Kumulierter Höhengewinn'],
                chartEmpty: 'Diagramm zum Start verfügbar.'
            },
            gallery: {
                title: 'NorthLine – Galerie',
                eyebrow: 'Fotos',
                heading: 'Komplette Reisegalerie',
                mapEyebrow: 'Fotokarte',
                mapTitle: 'Positionen der Bilder.',
                mapWaiting: 'Warte auf geolokalisierte Bilder...',
                fullscreenMap: 'Karte im Vollbild',
                exitFullscreenMap: 'Vollbild verlassen',
                modalClose: 'Schliessen',
                modalPrev: 'Vorheriges Bild',
                modalNext: 'Nächstes Bild',
                modalTitle: 'Bildtitel',
                modalLocation: 'Ort',
                modalDescription: 'Fotobeschreibung und Position auf der Karte.'
            },
            replay: {
                title: 'NorthLine – Replay',
                eyebrow: 'Replay',
                heading: 'Strecke erneut erleben.',
                description: 'Die gesamte Route abspielen, pausieren, beschleunigen und Schlüsselpunkte ansehen.',
                play: 'Abspielen',
                pause: 'Pause',
                reset: 'Reset',
                speed: 'Geschwindigkeit:',
                ready: 'Replay bereit',
                complete: 'Replay abgeschlossen'
            },
            progress: {
                title: 'NorthLine – Fortschritt',
                eyebrow: 'Ziele',
                heading: 'Badges und Fortschritt.',
                description: 'Badges zeigen deinen Fortschritt entlang der Strecke.',
                hiddenSectionTitle: 'Versteckte Meilensteine',
                hiddenSectionTranslation: 'Traguardi nascosti / Hidden milestones'
            },
            project: {
                title: 'NorthLine – Projekt',
                eyebrow: 'NorthLine',
                heading: 'Was ist das NorthLine-Projekt?',
                intro: 'NorthLine ist weit mehr als eine einfache Durchquerung der Schweiz. Es ist ein Projekt, das aus dem Wunsch entstanden ist, sich selbst herauszufordern, das Land Schritt für Schritt zu erkunden und jeden Moment in Echtzeit zu teilen. Über eine vollständig von mir entwickelte Plattform kann jeder die Reise verfolgen, den Fortschritt beobachten, die Daten analysieren und dieses Abenteuer erleben, als wäre er selbst mit uns auf dem Weg.',
                cardTitles: ['Was NorthLine ist', 'Motivation', 'Vorbereitung', 'Ausrüstung', 'Ernährung', 'Route', 'Support', 'Besonderheiten'],
                cardTexts: [
                    'NorthLine ist eine Weitwanderung, die die gesamte Schweiz von Süden nach Norden auf einer rund 333 Kilometer langen Strecke mit über 6\'000 Höhenmetern durchquert. Eine ununterbrochene Reise durch Ebenen, Täler, Alpenpässe und Berge, die in festgelegten Etappen bewältigt und vollständig live dokumentiert wird.',
                    'Dieses Projekt entstand aus dem Wunsch, die eigene Komfortzone zu verlassen und zu zeigen, dass mit Ausdauer, Vorbereitung und Entschlossenheit selbst Herausforderungen gemeistert werden können, die zunächst unmöglich erscheinen. Es ist kein Wettkampf gegen andere, sondern ein persönlicher Weg, auf dem jeder Kilometer einen Erfolg darstellt und jede Schwierigkeit eine Gelegenheit ist, daran zu wachsen.',
                    'Hinter jedem Wandertag stecken Monate der Vorbereitung. Körperliches Training, Wanderungen mit Rucksack, die Planung der Route, die Analyse der Höhenmeter, die logistische Organisation und die Entwicklung der Webplattform waren entscheidend, um am Starttag bestens vorbereitet zu sein.',
                    'Jedes Gramm zählt. Der Rucksack wurde so zusammengestellt, dass er die optimale Balance zwischen Leichtigkeit, Sicherheit und Eigenständigkeit bietet. GPS, Notfallausrüstung, Batterien, funktionelle Kleidung und alles Weitere, was nötig ist, um den unterschiedlichsten Wetterbedingungen entlang der Strecke gewachsen zu sein.',
                    'Viele Stunden pro Tag zu wandern erfordert ein sorgfältiges Energiemanagement. Während der Tour werden regelmässig Wasser, Mineralstoffe und energiereiche Lebensmittel aufgenommen, um die Leistungsfähigkeit konstant zu halten und die Erholung zwischen den einzelnen Etappen zu fördern.',
                    'Die Strecke führt durch einige der eindrucksvollsten Landschaften der Schweiz: Seen, Täler, Wälder, Alpenpässe und hochalpine Wanderwege. Jede Etappe bringt neue Herausforderungen mit sich und erfordert eine ständige Anpassung an Gelände und Wetterbedingungen.',
                    'Auch wenn jeder Schritt zu Fuss zurückgelegt wird, werde ich dieses Abenteuer nicht allein bestreiten. Während der gesamten Reise begleitet mich meine Freundin im Auto und kümmert sich um die logistische Unterstützung, die Versorgung mit Wasser und Verpflegung sowie alles, was für ein sicheres Weiterkommen erforderlich ist. Ihr wichtigster Beitrag ist jedoch menschlicher Natur: In den schwierigsten Momenten wird ihre Anwesenheit mich daran erinnern, warum es sich lohnt, weiterzugehen.',
                    'NorthLine soll nicht nur Zahlen erzählen. Während der Reise werden Fotos, interessante Informationen über die bereisten Regionen, Begegnungen unterwegs und viele weitere Eindrücke geteilt, die dieses Erlebnis einzigartig machen. Ziel ist es, allen, die das Projekt verfolgen, das Gefühl zu geben, Teil des Abenteuers zu sein – Schritt für Schritt.'
                ]
            },
            admin: { title: 'NorthLine – Admin' }
        },
        status: {
            notStarted: 'Nicht gestartet',
            moving: 'In Bewegung',
            paused: 'Pausiert',
            ended: 'Tag beendet',
            completed: 'Challenge abgeschlossen'
        },
        dynamic: {
            noDescription: 'Keine Beschreibung verfügbar.',
            dateUnset: 'Datum nicht gesetzt',
            update: 'Update',
            photo: 'Foto',
            locationUnset: 'Ort nicht gesetzt',
            galleryEmptyTitle: 'Leere Galerie',
            galleryEmptyText: 'Noch keine Bilder verfügbar. Fotos werden mit der nächsten Veröffentlichung hinzugefügt.',
            diaryEmptyTitle: 'Leeres Tagebuch',
            diaryEmptyText: 'Noch keine Einträge veröffentlicht. Berichte und Timeline-Updates folgen während der Reise.',
            countdownUpdated: 'Countdown in Echtzeit aktualisiert.',
            countdownStarted: 'Der geplante Start läuft jetzt.',
            liveNotAvailable: 'Warten auf den Start: noch keine Live-Daten verfügbar.',
            liveTrackingActive: 'Tracker aktiv und aktualisiert.',
            waitingNextPoint: 'Daten verfügbar, warte auf nächste Position.',
            visitorDistance: 'Besucherabstand',
            visitorFromStart: 'Abstand vom Start',
            notSupported: 'Nicht unterstützt',
            permissionDenied: 'Berechtigung verweigert',
            replayProgress: 'Replay {current}/{total}',
            progressEmptyTitle: 'Keine Badges definiert',
            progressEmptyText: 'Aktuell sind keine Meilensteine definiert. Du kannst Badges beim echten Tracking hinzufügen.',
            badgeUnlocked: 'Freigeschaltet',
            badgePending: 'Ausstehend'
        }
    }
};
let mapInstance = null;
let routeLine = null;
let startMarker = null;
let finishMarker = null;
let liveMarker = null;
let visitorMarker = null;
let chartInstances = {};
let activeLayer = null;
let gpxTotalKm = null;
let gpxCoords = [];
let gpxWaypoints = [];
let gpxLoadPromise = null;
let trackersLoadPromise = null;
let latestLiveCoord = null;
let latestVisitorCoord = null;
let firebaseAppInstance = null;
let routeMarkerGroup = null;
const movingStatusRecoveryMs = 2 * 60 * 1000;
const liveStatusControlRefreshMs = 15000;
const homeRefreshMs = 5000;
let liveStatusControlCache = {
    forcedStatus: null,
    updatedAt: null
};
let liveStatusControlLastFetchTs = 0;
let liveStatusControlFetchPromise = null;
const mediaModalState = {
    items: [],
    index: 0,
    onChange: null,
    bound: false,
    touchStartX: null
};
const photoMapState = {
    markerById: new Map(),
    clusterGroup: null
};
let currentLanguage = defaultLanguage;
function normalizeLanguage(value) {
    const code = String(value || '').trim().toLowerCase();
    return supportedLanguages.includes(code) ? code : defaultLanguage;
}
function getDictionary() {
    return i18nCatalog[currentLanguage] || i18nCatalog[defaultLanguage];
}
function getPreferredLanguage() {
    try {
        const stored = localStorage.getItem(languageStorageKey);
        if (supportedLanguages.includes(stored)) return normalizeLanguage(stored);
    } catch (error) {
        // ignore storage access issues
    }
    return defaultLanguage;
}
function persistPreferredLanguage(lang) {
    try {
        localStorage.setItem(languageStorageKey, normalizeLanguage(lang));
    } catch (error) {
        // ignore storage access issues
    }
}
function resolveText(key) {
    const dictionary = getDictionary();
    const fallbackDictionary = i18nCatalog[defaultLanguage];
    const chunks = String(key || '').split('.').filter(Boolean);
    const drill = source => chunks.reduce((acc, chunk) => (acc && Object.prototype.hasOwnProperty.call(acc, chunk) ? acc[chunk] : undefined), source);
    const translated = drill(dictionary);
    if (translated !== undefined && translated !== null) return translated;
    const fallback = drill(fallbackDictionary);
    return fallback !== undefined && fallback !== null ? fallback : key;
}
function t(key, params = {}) {
    const raw = resolveText(key);
    if (typeof raw !== 'string') return raw;
    return raw.replace(/\{(\w+)\}/g, (_, token) => String(params[token] ?? ''));
}
function setText(selector, value) {
    const node = document.querySelector(selector);
    if (node && value !== undefined) node.textContent = value;
}
function setAttribute(selector, attribute, value) {
    const node = document.querySelector(selector);
    if (node && value !== undefined) node.setAttribute(attribute, value);
}
function applyNavigationTranslations() {
    const nav = document.querySelector('.main-nav');
    const labels = resolveText('common.nav');
    if (nav && Array.isArray(labels)) {
        nav.querySelectorAll('a').forEach((link, index) => {
            if (labels[index]) link.textContent = labels[index];
        });
    }
    const navAria = t('common.navAria');
    if (nav && navAria) nav.setAttribute('aria-label', navAria);
}
function applyStaticTranslations() {
    const page = document.body?.dataset?.page || '';
    applyNavigationTranslations();
    const subtitle = resolveText(`common.brands.${page}`);
    setText('.brand-subtitle', subtitle);
    const pageTitle = resolveText(`pages.${page}.title`);
    if (typeof pageTitle === 'string' && pageTitle) document.title = pageTitle;

    if (page === 'home') {
        const home = getDictionary().pages.home || {};
        if (home.countdownEyebrow) setText('.countdown-eyebrow', home.countdownEyebrow);
        if (home.countdownTitle) setText('#countdownTitle', home.countdownTitle);
        if (home.countdownMessage) setText('#countdownMessage', home.countdownMessage);
        if (Array.isArray(home.labels)) {
            const labels = document.querySelectorAll('.countdown-grid article span');
            labels.forEach((node, index) => {
                if (home.labels[index]) node.textContent = home.labels[index];
            });
        }
        if (home.heroEyebrow) setText('.hero-copy .eyebrow', home.heroEyebrow);
        if (home.heroTitle) setText('.hero-copy h1', home.heroTitle);
        if (home.heroDescription) setText('.hero-copy p:not(.eyebrow)', home.heroDescription);
        if (Array.isArray(home.heroButtons)) {
            const buttons = document.querySelectorAll('.hero-actions .button');
            buttons.forEach((button, index) => {
                if (home.heroButtons[index]) button.textContent = home.heroButtons[index];
            });
        }
        if (Array.isArray(home.statsLabels)) {
            const stats = document.querySelectorAll('.hero-stats-grid article span');
            stats.forEach((node, index) => {
                if (home.statsLabels[index]) node.textContent = home.statsLabels[index];
            });
        }
        if (home.sectionEyebrow) setText('.section-intro .section-title .eyebrow', home.sectionEyebrow);
        if (home.sectionTitle) setText('.section-intro .section-title h2', home.sectionTitle);
        if (home.sectionDescription) setText('.section-intro .section-title p:not(.eyebrow)', home.sectionDescription);
        if (Array.isArray(home.featureTitles)) {
            const titles = document.querySelectorAll('.section-intro .feature-grid article h3');
            titles.forEach((node, index) => {
                if (home.featureTitles[index]) node.textContent = home.featureTitles[index];
            });
        }
        if (Array.isArray(home.featureTexts)) {
            const texts = document.querySelectorAll('.section-intro .feature-grid article p');
            texts.forEach((node, index) => {
                if (home.featureTexts[index]) node.textContent = home.featureTexts[index];
            });
        }
        if (home.statusTitle) setText('.section-status .section-title h2', home.statusTitle);
        setText('#homeState-not-started', `⚪ ${t('status.notStarted')}`);
        setText('#homeState-moving', `🟢 ${t('status.moving')}`);
        setText('#homeState-paused', `🟡 ${t('status.paused')}`);
        setText('#homeState-ended', `🔴 ${t('status.ended')}`);
        setText('#homeState-completed', `⚫ ${t('status.completed')}`);
        if (home.footer) setText('.site-footer p', home.footer);
    }

    if (page === 'live') {
        const live = getDictionary().pages.live || {};
        if (live.eyebrow) setText('.page-live .page-header .eyebrow', live.eyebrow);
        if (live.heading) setText('.page-live .page-header h1', live.heading);
        if (live.description) setText('.page-live .page-header p:not(.eyebrow)', live.description);
        if (live.statsEyebrow) setText('.page-live .panel-head .eyebrow', live.statsEyebrow);
        if (live.statsTitle) setText('.page-live .panel-head h2', live.statsTitle);
        if (Array.isArray(live.statsLabels)) {
            const liveStats = document.querySelectorAll('.page-live .stats-grid article span');
            liveStats.forEach((node, index) => {
                if (live.statsLabels[index]) node.textContent = live.statsLabels[index];
            });
            setText('.page-live .progress-meta span', live.statsLabels[6]);
            const detailLabels = document.querySelectorAll('.page-live .detail-grid article span');
            detailLabels.forEach((node, index) => {
                const sourceIndex = index + 7;
                if (live.statsLabels[sourceIndex]) node.textContent = live.statsLabels[sourceIndex];
            });
        }
        if (live.mapControlAria) setAttribute('.page-live .map-actions', 'aria-label', live.mapControlAria);
        if (live.centerUser) {
            setAttribute('#centerUserBtn', 'title', live.centerUser);
            setAttribute('#centerUserBtn', 'aria-label', live.centerUser);
        }
        if (live.centerLive) setAttribute('#centerLiveBtn', 'title', live.centerLive);
        if (live.fullscreenMap) setAttribute('#mapFullscreenBtn', 'title', live.fullscreenMap);
    }

    if (page === 'dashboard') {
        const dashboard = getDictionary().pages.dashboard || {};
        if (dashboard.eyebrow) setText('.page-dashboard .section-title .eyebrow', dashboard.eyebrow);
        if (dashboard.heading) setText('.page-dashboard .section-title h2', dashboard.heading);
        if (dashboard.description) setText('.page-dashboard .section-title p:not(.eyebrow)', dashboard.description);
        if (Array.isArray(dashboard.statLabels)) {
            const stats = document.querySelectorAll('.page-dashboard .stats-grid article span');
            stats.forEach((node, index) => {
                if (dashboard.statLabels[index]) node.textContent = dashboard.statLabels[index];
            });
        }
        if (dashboard.chartsTitle) setText('.page-dashboard .chart-header h2', dashboard.chartsTitle);
        if (dashboard.xAxis) {
            const axisLabel = document.querySelector('.page-dashboard .chart-axis-control');
            if (axisLabel && axisLabel.childNodes.length) {
                axisLabel.childNodes[0].textContent = `${dashboard.xAxis} `;
            }
        }
        if (dashboard.xDistance) setText('#chartXAxisMode option[value="distance"]', dashboard.xDistance);
        if (dashboard.xTime) setText('#chartXAxisMode option[value="time"]', dashboard.xTime);
        if (Array.isArray(dashboard.chartTitles)) {
            const chartTitles = document.querySelectorAll('.page-dashboard .chart-grid .metric-card h3');
            chartTitles.forEach((node, index) => {
                if (dashboard.chartTitles[index]) node.textContent = dashboard.chartTitles[index];
            });
        }
    }

    if (page === 'gallery') {
        const gallery = getDictionary().pages.gallery || {};
        if (gallery.eyebrow) setText('.page-gallery .section .section-title .eyebrow', gallery.eyebrow);
        if (gallery.heading) setText('.page-gallery .section .section-title h2', gallery.heading);
        if (gallery.mapEyebrow) setText('.page-gallery .section-white .section-title .eyebrow', gallery.mapEyebrow);
        if (gallery.mapTitle) setText('.page-gallery .section-white .section-title h2', gallery.mapTitle);
        if (gallery.mapWaiting) setText('#galleryPhotoMapStatus', gallery.mapWaiting);
        if (gallery.fullscreenMap) setAttribute('#galleryPhotoMapFullscreenBtn', 'title', gallery.fullscreenMap);
        if (gallery.modalClose) setAttribute('.modal-close', 'aria-label', gallery.modalClose);
        if (gallery.modalPrev) setAttribute('#modalPrev', 'aria-label', gallery.modalPrev);
        if (gallery.modalNext) setAttribute('#modalNext', 'aria-label', gallery.modalNext);
        if (gallery.modalTitle) setText('#modalTitle', gallery.modalTitle);
        if (gallery.modalLocation) setText('#modalLocation', gallery.modalLocation);
        if (gallery.modalDescription) setText('#modalDescription', gallery.modalDescription);
    }

    if (page === 'replay') {
        const replay = getDictionary().pages.replay || {};
        if (replay.eyebrow) setText('.page-replay .section-title .eyebrow', replay.eyebrow);
        if (replay.heading) setText('.page-replay .section-title h2', replay.heading);
        if (replay.description) setText('.page-replay .section-title p:not(.eyebrow)', replay.description);
        if (replay.play) setText('#replayPlay', replay.play);
        if (replay.pause) setText('#replayPause', replay.pause);
        if (replay.reset) setText('#replayReset', replay.reset);
        if (replay.speed) setText('label[for="replaySpeed"]', replay.speed);
        if (replay.ready) setText('#replayStatus', replay.ready);
    }

    if (page === 'progress') {
        const progress = getDictionary().pages.progress || {};
        if (progress.eyebrow) setText('.page-progress .section-title .eyebrow', progress.eyebrow);
        if (progress.heading) setText('.page-progress .section-title h2', progress.heading);
        if (progress.description) setText('.page-progress .section-title p:not(.eyebrow)', progress.description);
        if (progress.hiddenSectionTitle) setText('.page-progress .hidden-progress-title', progress.hiddenSectionTitle);
        if (progress.hiddenSectionTranslation) setText('.page-progress .hidden-progress-translation', progress.hiddenSectionTranslation);
    }

    if (page === 'project') {
        const project = getDictionary().pages.project || {};
        if (project.eyebrow) setText('.page-project .section-title .eyebrow', project.eyebrow);
        if (project.heading) setText('.page-project .section-title h2', project.heading);
        if (project.intro) setText('.page-project .section-title p:not(.eyebrow)', project.intro);
        if (Array.isArray(project.cardTitles)) {
            const titles = document.querySelectorAll('.page-project .feature-grid article h3');
            titles.forEach((node, index) => {
                if (project.cardTitles[index]) node.textContent = project.cardTitles[index];
            });
        }
        if (Array.isArray(project.cardTexts)) {
            const texts = document.querySelectorAll('.page-project .feature-grid article p');
            texts.forEach((node, index) => {
                if (project.cardTexts[index]) node.textContent = project.cardTexts[index];
            });
        }
    }
}
function translateStatus(label) {
    const normalized = normalizeHomeStatus(label);
    if (normalized === 'moving') return t('status.moving');
    if (normalized === 'paused') return t('status.paused');
    if (normalized === 'ended') return t('status.ended');
    if (normalized === 'completed') return t('status.completed');
    return t('status.notStarted');
}
function onLanguageSelected(targetLanguage) {
    const language = normalizeLanguage(targetLanguage);
    const current = getPreferredLanguage();
    if (language === current) return;
    persistPreferredLanguage(language);
    window.location.reload();
}
function buildLanguageSwitcher(className) {
    const wrapper = document.createElement('div');
    wrapper.className = `lang-switcher ${className}`;

    const label = document.createElement('label');
    label.className = 'lang-switcher-label';
    label.textContent = t('common.languageLabel');

    const select = document.createElement('select');
    select.className = 'lang-switcher-select';
    select.setAttribute('aria-label', t('common.languageAria'));

    const options = [
        { value: 'it', label: t('common.languageNames.it') },
        { value: 'en', label: t('common.languageNames.en') },
        { value: 'de', label: t('common.languageNames.de') }
    ];
    options.forEach(option => {
        const element = document.createElement('option');
        element.value = option.value;
        element.textContent = option.label;
        select.appendChild(element);
    });
    select.value = getPreferredLanguage();

    wrapper.append(label, select);
    return { wrapper, select };
}
function initializeLanguageSwitcher() {
    const topbar = document.querySelector('.topbar');
    const nav = topbar?.querySelector('.main-nav');
    if (!topbar || !nav || topbar.dataset.languageSwitcherInit === 'true') return;

    const desktop = buildLanguageSwitcher('lang-switcher-desktop');
    const mobile = buildLanguageSwitcher('lang-switcher-mobile');

    const syncValue = value => {
        desktop.select.value = value;
        mobile.select.value = value;
    };

    desktop.select.addEventListener('change', event => {
        const value = normalizeLanguage(event.target.value);
        syncValue(value);
        onLanguageSelected(value);
    });
    mobile.select.addEventListener('change', event => {
        const value = normalizeLanguage(event.target.value);
        syncValue(value);
        onLanguageSelected(value);
    });

    topbar.appendChild(desktop.wrapper);
    nav.appendChild(mobile.wrapper);
    topbar.dataset.languageSwitcherInit = 'true';
}
function initializeLanguageSupport() {
    currentLanguage = getPreferredLanguage();
    persistPreferredLanguage(currentLanguage);
    document.documentElement.lang = currentLanguage;
    initializeLanguageSwitcher();
    applyStaticTranslations();
}
function createRecordId(prefix = 'item') {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return `${prefix}-${crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}
function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
function getFirebaseClientConfig() {
    return window.NorthLineFirebaseConfig || null;
}
function hasUsableFirebaseConfig() {
    const config = getFirebaseClientConfig();
    if (!config) return false;
    const required = ['apiKey', 'authDomain', 'databaseURL', 'projectId', 'appId'];
    return required.every(key => {
        const value = String(config[key] || '');
        return value && !value.startsWith('INSERISCI_');
    });
}
function getFirebaseContentUrl(type) {
    const config = getFirebaseClientConfig();
    const configBase = String(config?.databaseURL || '').replace(/\/$/, '');
    const fallbackBase = String(firebaseURL || '')
        .replace(/\/$/, '')
        .replace(/\/livetrack\/points\.json$/i, '');
    const databaseBase = configBase || fallbackBase;
    if (!databaseBase) return null;
    return `${databaseBase}/${contentDatabasePath}/${type}.json`;
}
function ensureFirebaseClient() {
    const config = getFirebaseClientConfig();
    if (!config || !hasUsableFirebaseConfig() || typeof firebase === 'undefined') return null;
    if (!firebaseAppInstance) {
        firebaseAppInstance = firebase.apps?.length ? firebase.app() : firebase.initializeApp(config);
    }
    return firebaseAppInstance;
}
function getFirebaseDatabase() {
    const app = ensureFirebaseClient();
    return app ? firebase.database(app) : null;
}
function getFirebaseAuth() {
    const app = ensureFirebaseClient();
    return app ? firebase.auth(app) : null;
}
async function loadCollection(type) {
    const publicUrl = getFirebaseContentUrl(type);
    if (!publicUrl) return [];
    try {
        const response = await fetch(publicUrl, { cache: 'no-store' });
        if (!response.ok) return [];
        const data = await response.json();
        if (Array.isArray(data)) return data;
    } catch (error) {
        console.warn(`Impossibile leggere ${type} da Firebase:`, error);
    }
    return [];
}
async function persistCollection(type, items) {
    const database = getFirebaseDatabase();
    if (!database) {
        throw new Error('Firebase non disponibile. Verifica configurazione e login admin.');
    }
    await database.ref(`${contentDatabasePath}/${type}`).set(items);
}
function isAdminAuthenticated() {
    return sessionStorage.getItem(adminSessionKey) === 'true';
}
function setAdminAuthenticated(value) {
    if (value) sessionStorage.setItem(adminSessionKey, 'true');
    else sessionStorage.removeItem(adminSessionKey);
}
async function moveCollectionItem(type, itemId, direction) {
    const items = await loadCollection(type);
    const index = items.findIndex(item => item.id === itemId);
    if (index < 0) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const [entry] = items.splice(index, 1);
    items.splice(targetIndex, 0, entry);
    await persistCollection(type, items);
}
async function deleteCollectionItem(type, itemId) {
    const items = (await loadCollection(type)).filter(item => item.id !== itemId);
    await persistCollection(type, items);
}
function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve('');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
        reader.onerror = () => reject(reader.error || new Error('Errore lettura file'));
        reader.readAsDataURL(file);
    });
}
function getTileProviders() {
    if (typeof L === 'undefined') return {};
    return {
        osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }),
        satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: '© Esri' }),
        topo: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { attribution: '© OpenTopoMap', maxZoom: 17, maxNativeZoom: 17 })
    };
}
function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
}
function formatRelativeDate(timestamp) {
    const date = new Date(timestamp);
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (currentLanguage === 'en') {
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        return `${Math.floor(diff / 3600)}h ago`;
    }
    if (currentLanguage === 'de') {
        if (diff < 60) return `vor ${diff}s`;
        if (diff < 3600) return `vor ${Math.floor(diff / 60)}m`;
        return `vor ${Math.floor(diff / 3600)}h`;
    }
    if (diff < 60) return `${diff}s fa`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m fa`;
    return `${Math.floor(diff / 3600)}h fa`;
}
function formatEstimatedArrival(timestamp) {
    if (!Number.isFinite(timestamp)) return '--';
    const date = new Date(timestamp);
    if (!Number.isFinite(date.getTime())) return '--';
    const locale = currentLanguage === 'de' ? 'de-CH' : currentLanguage === 'en' ? 'en-CH' : 'it-CH';
    return new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}
function parseDateTime(dateValue = '', timeValue = '') {
    const rawDate = String(dateValue || '').trim();
    const rawTime = String(timeValue || '').trim();
    if (!rawDate && !rawTime) return Number.NaN;
    const localMatch = rawDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/);
    if (localMatch) {
        const [, d, m, y, dateHour = '', dateMinute = ''] = localMatch;
        const timeMatch = rawTime.match(/^(\d{1,2}):(\d{2})/);
        const h = timeMatch ? timeMatch[1] : (dateHour || '0');
        const min = timeMatch ? timeMatch[2] : (dateMinute || '0');
        return new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min)).getTime();
    }
    const combined = rawTime ? `${rawDate} ${rawTime}` : rawDate;
    const parsed = new Date(combined).getTime();
    return Number.isFinite(parsed) ? parsed : Number.NaN;
}
function parseKmValue(value) {
    if (value === null || value === undefined) return Number.NaN;
    if (typeof value === 'number') return Number.isFinite(value) ? value : Number.NaN;
    const normalized = String(value).trim().replace(',', '.');
    const match = normalized.match(/-?\d+(?:\.\d+)?/);
    if (!match) return Number.NaN;
    const parsed = Number(match[0]);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
}
function readItemGeo(item) {
    const lat = Number(item?.geo?.lat ?? item?.lat);
    const lng = Number(item?.geo?.lng ?? item?.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
}

function buildNightGallerySeedEntries() {
    return [
        {
            id: 'night-photo-1',
            title: 'Notte 1',
            date: '01/08/2026',
            time: '22:00',
            km: '0',
            location: 'Via al Laghetto, 6832 Chiasso',
            tag: 'night',
            description: 'Prima notte del percorso',
            image: 'data/Night_1.jpg',
            geo: { lat: 45.8259066594, lng: 9.0140666007 }
        },
        {
            id: 'night-photo-2',
            title: 'Notte 2',
            date: '02/08/2026',
            time: '22:00',
            km: '0',
            location: 'A Tasín 2, 6702 Claro',
            tag: 'night',
            description: 'Seconda notte del percorso',
            image: 'data/Night_2.jpg',
            geo: { lat: 46.2565465111, lng: 9.0111590127 }
        },
        {
            id: 'night-photo-3',
            title: 'Notte 3',
            date: '03/08/2026',
            time: '22:00',
            km: '0',
            location: 'Gotthard-Strassentunnel 41, 6493 Hospental',
            tag: 'night',
            description: 'Terza notte del percorso',
            image: 'data/Night_3.jpg',
            geo: { lat: 46.5913747331, lng: 8.5618263165 }
        },
        {
            id: 'night-photo-4',
            title: 'Notte 4',
            date: '04/08/2026',
            time: '22:00',
            km: '0',
            location: 'Rottannenstrasse, Arth',
            tag: 'night',
            description: 'Quarta notte del percorso',
            image: 'data/Night_4.jpg',
            geo: { lat: 47.0562228192, lng: 8.5364110764 }
        },
        {
            id: 'night-photo-5',
            title: 'Notte 5',
            date: '05/08/2026',
            time: '22:00',
            km: '0',
            location: 'GGPQ+RG, 8180 Bülach',
            tag: 'night',
            description: 'Quinta notte del percorso',
            image: 'data/Night_5.jpg',
            geo: { lat: 47.5263890229, lng: 8.5443702332 }
        }
    ];
}

function mergeNightGalleryEntries(items) {
    const current = Array.isArray(items) ? items : [];
    const seedEntries = buildNightGallerySeedEntries();
    const existingIds = new Set(current.map(item => String(item?.id || '')));
    const missing = seedEntries.filter(entry => !existingIds.has(entry.id));
    return [...current, ...missing];
}

async function syncNightGalleryEntriesToFirebase() {
    const galleryItems = await loadCollection('gallery');
    const merged = mergeNightGalleryEntries(galleryItems);
    if (merged.length !== galleryItems.length) {
        await persistCollection('gallery', merged);
    }
}

function buildUnifiedDiaryTimelineEntries(diaryEntries, timelineEntries) {
    const diaryItems = diaryEntries.map((entry, index) => ({
        ...entry,
        _source: 'diary',
        _sortTs: parseDateTime(entry.date),
        _sortIndex: index,
        _title: entry.title || `Diario ${index + 1}`,
        _subtitle: `${entry.date || 'Data non impostata'} · ${entry.km || '0'} km`,
        _text: entry.text || '',
        _image: entry.image || ''
    }));
    const timelineItems = timelineEntries.map((entry, index) => ({
        ...entry,
        _source: 'timeline',
        _sortTs: parseDateTime(entry.date, entry.time),
        _sortIndex: index,
        _title: entry.title || `Aggiornamento ${index + 1}`,
        _subtitle: `${entry.date || 'Data non impostata'} ${entry.time || '--:--'}`.trim(),
        _text: entry.description || '',
        _image: entry.image || ''
    }));
    return [...diaryItems, ...timelineItems]
        .sort((a, b) => {
            const aTs = Number.isFinite(a._sortTs) ? a._sortTs : Number.POSITIVE_INFINITY;
            const bTs = Number.isFinite(b._sortTs) ? b._sortTs : Number.POSITIVE_INFINITY;
            if (aTs !== bTs) return aTs - bTs;
            return a._sortIndex - b._sortIndex;
        });
}
async function loadUnifiedMediaItems() {
    const [diaryEntries, timelineEntries, galleryEntriesRaw] = await Promise.all([
        loadCollection('diary'),
        loadCollection('timeline'),
        loadCollection('gallery')
    ]);
    const galleryEntries = mergeNightGalleryEntries(galleryEntriesRaw);
    const media = [];
    diaryEntries.forEach((entry, index) => {
        if (!entry.image) return;
        const sortKm = parseKmValue(entry.km);
        media.push({
            id: entry.id || createRecordId('media-diary'),
            source: currentLanguage === 'en' ? 'Diary' : currentLanguage === 'de' ? 'Tagebuch' : 'Diario',
            title: entry.title || `Diario ${index + 1}`,
            location: `${entry.date || t('dynamic.dateUnset')} · ${entry.km || '0'} km`,
            description: entry.text || '',
            image: entry.image,
            geo: readItemGeo(entry),
            sortTs: parseDateTime(entry.date),
            sortKm
        });
    });
    timelineEntries.forEach((entry, index) => {
        if (!entry.image) return;
        const sortKm = parseKmValue(entry.km);
        media.push({
            id: entry.id || createRecordId('media-timeline'),
            source: 'Timeline',
            title: entry.title || `${t('dynamic.update')} ${index + 1}`,
            location: `${entry.date || t('dynamic.dateUnset')} ${entry.time || '--:--'}`.trim(),
            description: entry.description || '',
            image: entry.image,
            geo: readItemGeo(entry),
            sortTs: parseDateTime(entry.date, entry.time),
            sortKm
        });
    });
    galleryEntries.forEach((entry, index) => {
        if (!entry.image) return;
        const dateSegment = [entry.date, entry.time].filter(Boolean).join(' ').trim();
        const kmSegment = entry.km ? `${entry.km} km` : '';
        const locationLine = [entry.location, dateSegment, kmSegment].filter(Boolean).join(' · ');
        const sortKm = parseKmValue(entry.km);
        media.push({
            id: entry.id || createRecordId('media-gallery'),
            source: currentLanguage === 'en' ? 'Gallery' : currentLanguage === 'de' ? 'Galerie' : 'Galleria',
            title: entry.title || `${t('dynamic.photo')} ${index + 1}`,
            location: locationLine || t('dynamic.locationUnset'),
            description: entry.description || '',
            image: entry.image,
            geo: readItemGeo(entry),
            sortTs: parseDateTime(entry.date, entry.time),
            sortKm
        });
    });
    return media.sort((a, b) => {
        const aKm = Number.isFinite(a.sortKm) ? a.sortKm : Number.POSITIVE_INFINITY;
        const bKm = Number.isFinite(b.sortKm) ? b.sortKm : Number.POSITIVE_INFINITY;
        if (aKm !== bKm) return aKm - bKm;
        const aTs = Number.isFinite(a.sortTs) ? a.sortTs : Number.POSITIVE_INFINITY;
        const bTs = Number.isFinite(b.sortTs) ? b.sortTs : Number.POSITIVE_INFINITY;
        if (aTs !== bTs) return aTs - bTs;
        return a.title.localeCompare(b.title, currentLanguage);
    });
}
function updateMediaModal() {
    const { items, index, onChange } = mediaModalState;
    const current = items[index];
    if (!current) return;
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalLocation = document.getElementById('modalLocation');
    const modalDescription = document.getElementById('modalDescription');
    if (modalImage) {
        modalImage.src = current.image;
        modalImage.alt = current.title;
    }
    if (modalTitle) modalTitle.textContent = current.title;
    if (modalLocation) modalLocation.textContent = `${current.location || ''}${current.source ? ` · ${current.source}` : ''}`;
    if (modalDescription) modalDescription.textContent = current.description || t('dynamic.noDescription');
    if (typeof onChange === 'function') onChange(current, index);
}
function moveMediaModal(step) {
    if (!mediaModalState.items.length) return;
    const length = mediaModalState.items.length;
    mediaModalState.index = (mediaModalState.index + step + length) % length;
    updateMediaModal();
}
function closeMediaModal() {
    document.querySelector('.modal-backdrop')?.classList.remove('active');
}
function openMediaModal(index) {
    if (!mediaModalState.items.length) return;
    const modal = document.querySelector('.modal-backdrop');
    if (!modal) return;
    mediaModalState.index = Math.max(0, Math.min(index, mediaModalState.items.length - 1));
    updateMediaModal();
    modal.classList.add('active');
}
function ensureMediaModalBindings() {
    if (mediaModalState.bound) return;
    const modal = document.querySelector('.modal-backdrop');
    if (!modal) return;
    document.querySelector('.modal-close')?.addEventListener('click', closeMediaModal);
    modal.addEventListener('click', event => {
        if (event.target === modal) closeMediaModal();
    });
    document.getElementById('modalPrev')?.addEventListener('click', () => moveMediaModal(-1));
    document.getElementById('modalNext')?.addEventListener('click', () => moveMediaModal(1));
    const modalImage = document.getElementById('modalImage');
    modalImage?.addEventListener('touchstart', event => {
        mediaModalState.touchStartX = event.changedTouches?.[0]?.screenX ?? null;
    }, { passive: true });
    modalImage?.addEventListener('touchend', event => {
        const startX = mediaModalState.touchStartX;
        const endX = event.changedTouches?.[0]?.screenX ?? null;
        if (!Number.isFinite(startX) || !Number.isFinite(endX)) return;
        const delta = endX - startX;
        if (Math.abs(delta) < 35) return;
        if (delta < 0) moveMediaModal(1);
        else moveMediaModal(-1);
    }, { passive: true });
    document.addEventListener('keydown', event => {
        if (!document.querySelector('.modal-backdrop')?.classList.contains('active')) return;
        if (event.key === 'Escape') closeMediaModal();
        if (event.key === 'ArrowLeft') moveMediaModal(-1);
        if (event.key === 'ArrowRight') moveMediaModal(1);
    });
    mediaModalState.bound = true;
}
function useMediaModal(items, onChange = null) {
    mediaModalState.items = items;
    mediaModalState.index = 0;
    mediaModalState.onChange = onChange;
    ensureMediaModalBindings();
}
function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('northline-theme', theme);
}
function initializeTheme() {
    const saved = localStorage.getItem('northline-theme');
    setTheme(saved === 'light' ? 'light' : 'dark');
    document.getElementById('themeToggle')?.addEventListener('click', () => {
        setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
    });
    initializeLanguageSupport();
    initializeMobileMenu();
}
function initializeMobileMenu() {
    const topbar = document.querySelector('.topbar');
    const nav = topbar?.querySelector('.main-nav');
    if (!topbar || !nav || topbar.dataset.mobileMenuInit === 'true') return;

    const brandIcon = topbar.querySelector('.brand-icon');
    if (brandIcon) {
        brandIcon.style.cursor = 'pointer';
        brandIcon.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'topbar-menu-toggle';
    toggleButton.id = 'topbarMenuToggle';
    toggleButton.setAttribute('aria-label', t('common.menuOpen'));
    toggleButton.setAttribute('aria-expanded', 'false');
    toggleButton.textContent = '☰';

    topbar.appendChild(toggleButton);

    let overlay = document.querySelector('.mobile-nav-overlay');
    if (!overlay) {
        overlay = document.createElement('button');
        overlay.type = 'button';
        overlay.className = 'mobile-nav-overlay';
        overlay.setAttribute('aria-label', t('common.menuClose'));
        document.body.appendChild(overlay);
    }

    const closeMenu = () => {
        document.body.classList.remove('mobile-nav-open');
        toggleButton.setAttribute('aria-expanded', 'false');
        toggleButton.textContent = '☰';
    };

    toggleButton.addEventListener('click', () => {
        const isOpen = document.body.classList.toggle('mobile-nav-open');
        toggleButton.setAttribute('aria-expanded', String(isOpen));
        toggleButton.textContent = isOpen ? '✕' : '☰';
    });

    overlay.addEventListener('click', closeMenu);

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeMenu();
    });

    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 760) closeMenu();
    });

    topbar.dataset.mobileMenuInit = 'true';
}
function buildNav() {
    const tileProviders = getTileProviders();
    document.querySelectorAll('[data-layer]').forEach(button => button.addEventListener('click', () => {
        const key = button.dataset.layer;
        if (!tileProviders[key] || !mapInstance) return;
        activeLayer?.remove();
        activeLayer = tileProviders[key].addTo(mapInstance);
    }));
}
async function fetchPoints() {
    try {
        const response = await fetch(firebaseURL);
        const data = await response.json();
        if (!data) return [];
        return Object.values(data)
            .map(point => {
                const coordinate = point?.coordinate || point?.coordinates || null;
                const speedMs = Number(point?.velocita?.m_s ?? point?.velocita?.mps ?? Number.NaN);
                const speedKmh = Number(point?.velocita?.km_h ?? point?.velocita?.kmh ?? (Number.isFinite(speedMs) ? speedMs * 3.6 : Number.NaN));
                return {
                    ...point,
                    coordinate,
                    velocita: {
                        ...(point?.velocita || {}),
                        m_s: Number.isFinite(speedMs) ? speedMs : null,
                        km_h: Number.isFinite(speedKmh) ? Number(speedKmh.toFixed(1)) : null
                    },
                    stato: point?.stato ?? point?.status ?? point?.pointStatus ?? null
                };
            })
            .filter(point => point && point.coordinate && Number.isFinite(point.coordinate.lat) && Number.isFinite(point.coordinate.lon) && point.distanza)
            .sort((a, b) => {
                const aId = Number(a?.id ?? 0);
                const bId = Number(b?.id ?? 0);
                if (Number.isFinite(aId) && Number.isFinite(bId) && aId !== bId) return aId - bId;
                return new Date(a?.orario ?? 0).getTime() - new Date(b?.orario ?? 0).getTime();
            });
    } catch (error) {
        console.warn('Impossibile leggere i dati live:', error);
        return [];
    }
}
async function ensureLiveStatusControl(force = false) {
    const now = Date.now();
    if (!force && liveStatusControlLastFetchTs && (now - liveStatusControlLastFetchTs) < liveStatusControlRefreshMs) {
        return liveStatusControlCache;
    }
    if (liveStatusControlFetchPromise) return liveStatusControlFetchPromise;

    liveStatusControlFetchPromise = (async () => {
        const previous = liveStatusControlCache;
        const fallback = previous || { forcedStatus: null, updatedAt: null };
        const publicUrl = getFirebaseContentUrl('liveStatus');
        if (!publicUrl) {
            liveStatusControlCache = fallback;
            liveStatusControlLastFetchTs = Date.now();
            return liveStatusControlCache;
        }
        try {
            const response = await fetch(publicUrl, { cache: 'no-store' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const payload = await response.json();
            const forcedStatusRaw = payload && typeof payload === 'object'
                ? (payload.forcedStatus ?? payload.status ?? null)
                : null;
            const forcedStatus = normalizeHomeStatus(forcedStatusRaw) === 'not-started' ? null : String(forcedStatusRaw);
            liveStatusControlCache = {
                forcedStatus,
                updatedAt: payload && typeof payload === 'object' ? (payload.updatedAt ?? null) : null
            };
        } catch (error) {
            console.warn('Impossibile leggere il controllo stato live:', error);
            liveStatusControlCache = fallback;
        }
        liveStatusControlLastFetchTs = Date.now();
        return liveStatusControlCache;
    })().finally(() => {
        liveStatusControlFetchPromise = null;
    });

    return liveStatusControlFetchPromise;
}
function extractCurrentSpeedKmh(point) {
    const speedKmh = Number(point?.velocita?.km_h ?? point?.velocita?.kmh ?? Number.NaN);
    if (Number.isFinite(speedKmh)) return speedKmh;
    const speedMps = Number(point?.velocita?.m_s ?? point?.velocita?.mps ?? Number.NaN);
    if (Number.isFinite(speedMps)) return speedMps * 3.6;
    return null;
}
function computeLastSegmentSpeedKmh(points) {
    if (!Array.isArray(points) || points.length < 2) return null;
    const last = points[points.length - 1];
    const prev = points[points.length - 2];
    const lastTs = new Date(last?.orario ?? '').getTime();
    const prevTs = new Date(prev?.orario ?? '').getTime();
    const lastMeters = Number(last?.distanza?.metri ?? Number.NaN);
    const prevMeters = Number(prev?.distanza?.metri ?? Number.NaN);
    if (!Number.isFinite(lastTs) || !Number.isFinite(prevTs) || lastTs <= prevTs) return null;
    if (!Number.isFinite(lastMeters) || !Number.isFinite(prevMeters) || lastMeters < prevMeters) return null;
    const deltaSeconds = (lastTs - prevTs) / 1000;
    if (deltaSeconds <= 0) return null;
    const deltaMeters = lastMeters - prevMeters;
    return (deltaMeters / deltaSeconds) * 3.6;
}
function getPointStatusKey(point) {
    const fromTracker = normalizeHomeStatus(point?.stato ?? point?.status ?? point?.pointStatus ?? '');
    if (fromTracker !== 'not-started') return fromTracker;

    const speedKmh = Number(point?.velocita?.km_h ?? point?.velocita?.kmh ?? point?.velocita ?? Number.NaN);
    if (Number.isFinite(speedKmh)) return speedKmh > 0.5 ? 'moving' : 'paused';

    const speedMps = Number(point?.velocita?.m_s ?? point?.velocita?.mps ?? Number.NaN);
    if (Number.isFinite(speedMps)) return speedMps > 0.14 ? 'moving' : 'paused';

    return 'not-started';
}
function hasMovingStreakLongEnough(points, minMs = movingStatusRecoveryMs, sinceTs = null) {
    if (!Array.isArray(points) || points.length < 2) return false;
    const lastPoint = points[points.length - 1];
    if (getPointStatusKey(lastPoint) !== 'moving') return false;

    const newestTs = new Date(lastPoint?.orario ?? '').getTime();
    if (!Number.isFinite(newestTs)) return false;

    if (Number.isFinite(sinceTs) && newestTs < sinceTs) return false;

    let oldestMovingTs = newestTs;
    for (let index = points.length - 1; index >= 0; index -= 1) {
        const point = points[index];
        const pointTs = new Date(point?.orario ?? '').getTime();
        if (Number.isFinite(sinceTs) && Number.isFinite(pointTs) && pointTs < sinceTs) break;
        if (getPointStatusKey(point) !== 'moving') break;
        if (Number.isFinite(pointTs)) oldestMovingTs = pointTs;
    }
    return (newestTs - oldestMovingTs) >= minMs;
}
function hasRecoveredAfterForcedEnded(points, sinceTs, minMs = movingStatusRecoveryMs) {
    if (!Array.isArray(points) || points.length < 2 || !Number.isFinite(sinceTs)) return false;
    let streakStartTs = null;
    for (let index = 0; index < points.length; index += 1) {
        const point = points[index];
        const pointTs = new Date(point?.orario ?? '').getTime();
        if (!Number.isFinite(pointTs) || pointTs < sinceTs) continue;
        const isMoving = getPointStatusKey(point) === 'moving';
        if (!isMoving) {
            streakStartTs = null;
            continue;
        }
        if (!Number.isFinite(streakStartTs)) streakStartTs = pointTs;
        if ((pointTs - streakStartTs) >= minMs) return true;
    }
    return false;
}
function resolveSummaryStatus(points, lastPoint, speedKmh) {
    const inferredStatus = speedKmh > 0.5 ? 'moving' : 'paused';
    const trackerStatus = getPointStatusKey(lastPoint);
    const baseStatus = trackerStatus !== 'not-started' ? trackerStatus : inferredStatus;

    const forcedStatus = normalizeHomeStatus(liveStatusControlCache?.forcedStatus ?? '');
    if (forcedStatus === 'ended') {
        const forcedAtTs = new Date(liveStatusControlCache?.updatedAt ?? '').getTime();
        const alreadyRecovered = hasRecoveredAfterForcedEnded(points, forcedAtTs, movingStatusRecoveryMs);
        if (alreadyRecovered) return baseStatus;
        const recoveredToMoving = hasMovingStreakLongEnough(
            points,
            movingStatusRecoveryMs,
            Number.isFinite(forcedAtTs) ? forcedAtTs : null
        );
        return recoveredToMoving ? 'moving' : 'ended';
    }
    if (forcedStatus !== 'not-started') return forcedStatus;

    return baseStatus;
}
function extractHeartRateBpm(point) {
    const direct = Number(point?.frequenza_cardiaca?.bpm ?? point?.heartRateBeatsPerMin ?? point?.heartRate ?? Number.NaN);
    return Number.isFinite(direct) && direct > 0 ? Math.round(direct) : null;
}
function extractCaloriesBurnedKcal(point) {
    const candidates = [
        point?.calorie?.kcal,
        point?.calories?.kcal,
        point?.caloriesBurned,
        point?.calories_burned,
        point?.calories_bruciate,
        point?.kcalBurned,
        point?.kcal,
        point?.calorie
    ];
    for (const candidate of candidates) {
        const numeric = Number(candidate);
        if (Number.isFinite(numeric) && numeric > 0) return Math.round(numeric);
    }
    return null;
}
function extractWaterLostLiters(point) {
    const candidates = [
        point?.water?.liters,
        point?.water?.l,
        point?.waterLostLiters,
        point?.water_lost_liters,
        point?.water_lost,
        point?.waterLost,
        point?.water?.lostLiters,
        point?.acqua?.litri,
        point?.acqua?.liters,
        point?.litriAcqua,
        point?.litri_acqua,
        point?.acqua_persa,
        point?.water_loss_liters
    ];
    for (const candidate of candidates) {
        const numeric = Number(candidate);
        if (Number.isFinite(numeric) && numeric >= 0) return Number(numeric.toFixed(1));
    }
    return null;
}
function extractLatestMetricValue(points, extractor) {
    if (!Array.isArray(points) || !points.length) return null;
    for (let index = points.length - 1; index >= 0; index -= 1) {
        const value = extractor(points[index]);
        if (value !== null) return value;
    }
    return null;
}
function computeMovingStats(points) {
    if (!Array.isArray(points) || points.length < 2) return { movingDuration: 0, movingDistanceKm: 0 };
    let movingSeconds = 0;
    let movingMeters = 0;
    for (let index = 1; index < points.length; index += 1) {
        const prevPoint = points[index - 1];
        const currentPoint = points[index];
        const prevTs = new Date(prevPoint?.orario ?? '').getTime();
        const currentTs = new Date(currentPoint?.orario ?? '').getTime();
        if (!Number.isFinite(prevTs) || !Number.isFinite(currentTs) || currentTs <= prevTs) continue;
        if (getPointStatusKey(currentPoint) !== 'moving') continue;
        movingSeconds += Math.floor((currentTs - prevTs) / 1000);
        const currentMeters = Number(currentPoint?.distanza?.metri ?? Number.NaN);
        const prevMeters = Number(prevPoint?.distanza?.metri ?? Number.NaN);
        if (Number.isFinite(currentMeters) && Number.isFinite(prevMeters) && currentMeters >= prevMeters) {
            movingMeters += (currentMeters - prevMeters);
        }
    }
    return {
        movingDuration: movingSeconds,
        movingDistanceKm: movingMeters > 0 ? (movingMeters / 1000) : 0
    };
}
function computeAverageHeartRate(points) {
    if (!Array.isArray(points) || !points.length) return null;
    const values = points
        .map(point => extractHeartRateBpm(point))
        .filter(value => Number.isFinite(value));
    if (!values.length) return null;
    const avg = values.reduce((acc, value) => acc + value, 0) / values.length;
    return Math.round(avg);
}
function computeEstimatedSteps(totalDistanceKm, durationSeconds) {
    const distance = Math.max(0, Number(totalDistanceKm) || 0);
    const hours = Math.max(0, Number(durationSeconds) || 0) / 3600;
    const fatigueGain = Math.min(hours * 0.03, 0.35);
    const stepsPerKm = 1420 * (1 + fatigueGain);
    return Math.round(distance * stepsPerKm);
}
function estimateCaloriesBurnedKcal(totalDistanceKm, durationSeconds, elevationGainM, heartRateBpm = null, bodyWeightKg = 65) {
    const distance = Math.max(0, Number(totalDistanceKm) || 0);
    const movingHours = Math.max(0, Number(durationSeconds) || 0) / 3600;
    const elevation = Math.max(0, Number(elevationGainM) || 0);
    const heartRate = Number(heartRateBpm);
    const weight = Math.max(0, Number(bodyWeightKg) || 70);

    let estimate = distance * (70 + weight * 0.22) + movingHours * (230 + weight * 1.1) + elevation * 0.22;

    if (Number.isFinite(heartRate) && heartRate > 0) {
        const hrFactor = Math.max(0, (heartRate - 100) / 80);
        estimate += estimate * (hrFactor * 0.08);
    }

    return Math.round(estimate);
}
function estimateWaterLostLiters(totalDistanceKm, durationSeconds, elevationGainM, heartRateBpm = null, bodyWeightKg = 60) {
    const distance = Math.max(0, Number(totalDistanceKm) || 0);
    const movingHours = Math.max(0, Number(durationSeconds) || 0) / 3600;
    const elevation = Math.max(0, Number(elevationGainM) || 0);
    const heartRate = Number(heartRateBpm);
    const weight = Math.max(0, Number(bodyWeightKg) || 70);

    let estimate = movingHours * (0.45 + weight * 0.0038) + distance * 0.045 + elevation * 0.0015;

    if (Number.isFinite(heartRate) && heartRate > 0) {
        const hrFactor = Math.max(0, (heartRate - 100) / 70);
        estimate += hrFactor * 0.12;
    }

    return Number(Math.max(0, estimate).toFixed(1));
}
function computeMaxSpeedKmh(points) {
    if (!Array.isArray(points) || !points.length) return 0;
    let maxSpeed = 0;
    points.forEach(point => {
        const value = extractCurrentSpeedKmh(point);
        if (Number.isFinite(value) && value > maxSpeed) maxSpeed = value;
    });
    return maxSpeed;
}
function buildSummary(points) {
    if (!points.length) return null;
    const lastPoint = points[points.length - 1];
    const totalDistance = Number(lastPoint.distanza?.km ?? 0);
    const firstPoint = points[0];
    const startTs = new Date(firstPoint?.orario ?? '').getTime();
    const endTs = new Date(lastPoint?.orario ?? '').getTime();
    const elapsedFromTimestamps = Number.isFinite(startTs) && Number.isFinite(endTs) && endTs >= startTs
        ? Math.floor((endTs - startTs) / 1000)
        : null;
    const duration = elapsedFromTimestamps ?? (lastPoint.tempo_trascorso?.secondi ?? 0);
    const speedFromLatest = extractCurrentSpeedKmh(lastPoint);
    const speedFromRecentPoint = speedFromLatest ?? (() => {
        for (let index = points.length - 2; index >= 0; index -= 1) {
            const value = extractCurrentSpeedKmh(points[index]);
            if (value !== null) return value;
        }
        return null;
    })();
    const speedFromLastSegment = computeLastSegmentSpeedKmh(points);
    const speed = Number.isFinite(speedFromRecentPoint)
        ? Number(speedFromRecentPoint)
        : Number.isFinite(speedFromLastSegment)
            ? Number(speedFromLastSegment)
            : 0;
    const movingStats = computeMovingStats(points);
    const movingDuration = movingStats.movingDuration;
    const movingDistanceKm = movingStats.movingDistanceKm;
    const totalAvgSpeed = duration > 0 ? (totalDistance / (duration / 3600)) : 0;
    const movingAvgSpeed = movingDuration > 0 && movingDistanceKm > 0
        ? (movingDistanceKm / (movingDuration / 3600))
        : 0;
    const maxSpeed = computeMaxSpeedKmh(points);
    const heartRateBpm = extractHeartRateBpm(lastPoint)
        ?? (() => {
            for (let index = points.length - 1; index >= 0; index -= 1) {
                const value = extractHeartRateBpm(points[index]);
                if (value !== null) return value;
            }
            return null;
        })();
    const heartRateAvgBpm = computeAverageHeartRate(points);
    const elevationGain = points.reduce((acc, point, index) => {
        if (index === 0) return 0;
        const currentAlt = Number(point.altitudine?.metri ?? 0);
        const prevAlt = Number(points[index - 1].altitudine?.metri ?? 0);
        const diff = currentAlt - prevAlt;
        return acc + Math.max(diff, 0);
    }, 0);
    const caloriesBurned = extractLatestMetricValue(points, extractCaloriesBurnedKcal)
        ?? estimateCaloriesBurnedKcal(totalDistance, duration, elevationGain, heartRateBpm, 60);
    const waterLostLiters = extractLatestMetricValue(points, extractWaterLostLiters)
        ?? estimateWaterLostLiters(totalDistance, duration, elevationGain, heartRateBpm, 60);
    return {
        points,
        lastPoint,
        totalDistance,
        duration,
        movingDuration,
        movingDistanceKm,
        speed,
        totalAvgSpeed,
        movingAvgSpeed,
        maxSpeed,
        heartRateBpm,
        heartRateAvgBpm,
        caloriesBurned,
        waterLostLiters,
        elevationGain,
        progress: Math.min(totalDistance / (gpxTotalKm || 333) * 100, 100),
        status: resolveSummaryStatus(points, lastPoint, speed)
    };
}
function calculateSharedRemainingDistance(summary) {
    const fallback = Math.max(0, (gpxTotalKm || 333) - (summary?.totalDistance || 0));
    const blended = computeBlendedRemaining(summary);
    return blended !== null ? blended : fallback;
}

function updateHomeSummary(summary) {
    if (!summary) return;
    const distanceText = summary.totalDistance === 0 ? '0' : summary.totalDistance.toFixed(1);
    document.getElementById('homeDistance').textContent = distanceText;
    const remaining = calculateSharedRemainingDistance(summary);
    const completion = computeDynamicProgress(summary.totalDistance, remaining);
    document.getElementById('homeRemaining').textContent = remaining.toFixed(1);
    document.getElementById('homeCompletion').textContent = `${completion.toFixed(1)}%`;
    document.getElementById('homeTime').textContent = summary.duration > 0 ? formatTime(summary.duration) : '0';
    document.getElementById('homeGain').textContent = Math.round(summary.elevationGain);
    document.getElementById('homeSteps').textContent = computeEstimatedSteps(summary.totalDistance, summary.duration).toLocaleString();
    const homeEta = document.getElementById('homeEta');
    if (homeEta) {
        const etaSpeedKmh = summary.movingAvgSpeed > 0.2
            ? summary.movingAvgSpeed
            : summary.totalAvgSpeed > 0.2
                ? summary.totalAvgSpeed
                : summary.speed > 0.2
                    ? summary.speed
                    : 0;
        if (etaSpeedKmh <= 0 || remaining <= 0) {
            homeEta.textContent = remaining <= 0 ? t('status.completed') : '--';
        } else {
            const etaTimestamp = Date.now() + ((remaining / etaSpeedKmh) * 3600 * 1000);
            homeEta.textContent = formatEstimatedArrival(etaTimestamp);
        }
    }
    const statusKey = normalizeHomeStatus(summary.status);
    document.getElementById('homeStatusLabel').textContent = translateStatus(statusKey);
    document.getElementById('homeStatusText').textContent = statusKey === 'moving'
        ? t('dynamic.liveTrackingActive')
        : statusKey === 'not-started'
            ? t('dynamic.liveNotAvailable')
            : t('dynamic.waitingNextPoint');
    updateHomeHeroStatusDot(statusKey);
    updateHomeStateLegend(statusKey);
}
function updateHomeHeroStatusDot(statusLabel) {
    const dot = document.getElementById('homeStatusDot');
    if (!dot) return;
    dot.classList.remove('status-not-started', 'status-moving', 'status-paused', 'status-ended', 'status-completed');
    const activeKey = normalizeHomeStatus(statusLabel);
    if (activeKey === 'moving') dot.classList.add('status-moving');
    else if (activeKey === 'paused') dot.classList.add('status-paused');
    else if (activeKey === 'ended') dot.classList.add('status-ended');
    else if (activeKey === 'completed') dot.classList.add('status-completed');
    else dot.classList.add('status-not-started');
}
function normalizeHomeStatus(status) {
    const value = String(status || '').toLowerCase();
    if (value === 'moving') return 'moving';
    if (value === 'paused') return 'paused';
    if (value === 'ended') return 'ended';
    if (value === 'completed') return 'completed';
    if (value === 'not-started' || value === 'not started') return 'not-started';
    if (value.includes('station') || value.includes('fermo') || value.includes('stop')) return 'paused';
    if (value.includes('mov')) return 'moving';
    if (value.includes('cycl') || value.includes('run') || value.includes('walk')) return 'moving';
    if (value.includes('paus')) return 'paused';
    if (value.includes('fine')) return 'ended';
    if (value.includes('complet')) return 'completed';
    return 'not-started';
}

function updateHomeStateLegend(statusLabel) {
    const label = statusLabel || 'not-started';
    const stateLabel = document.getElementById('homeAdventureState');
    if (stateLabel) stateLabel.textContent = translateStatus(label);

    const activeKey = normalizeHomeStatus(label);
    document.querySelectorAll('.status-grid .status-pill').forEach(pill => pill.classList.remove('active'));
    const activePill = document.getElementById(`homeState-${activeKey}`);
    if (activePill) activePill.classList.add('active');
}

function buildHomePreStartSummary() {
    return {
        totalDistance: 0,
        duration: 0,
        elevationGain: 0,
        status: 'not-started',
        lastPoint: null,
        points: [],
        speed: 0,
        progress: 0
    };
}
function buildDashboardPreStartSummary() {
    return {
        points: [],
        lastPoint: null,
        totalDistance: 0,
        duration: 0,
        movingDuration: 0,
        movingDistanceKm: 0,
        speed: 0,
        totalAvgSpeed: 0,
        movingAvgSpeed: 0,
        maxSpeed: 0,
        heartRateBpm: null,
        heartRateAvgBpm: null,
        caloriesBurned: 0,
        waterLostLiters: 0,
        elevationGain: 0,
        progress: 0,
        status: 'not-started'
    };
}
function buildLivePreStartSummary() {
    return {
        points: [],
        lastPoint: null,
        totalDistance: 0,
        duration: 0,
        speed: 0,
        elevationGain: 0,
        progress: 0,
        status: 'not-started'
    };
}
function updateDashboardSummary(summary) {
    const metricDistance = document.getElementById('metricDistance');
    const metricRemaining = document.getElementById('metricRemaining');
    const metricCompletion = document.getElementById('metricCompletion');
    const metricSpeed = document.getElementById('metricSpeed');
    const metricAvgMovingSpeed = document.getElementById('metricAvgMovingSpeed');
    const metricAvgTotalSpeed = document.getElementById('metricAvgTotalSpeed');
    const metricMaxSpeed = document.getElementById('metricMaxSpeed');
    const metricAltitude = document.getElementById('metricAltitude');
    const metricElevation = document.getElementById('metricElevation');
    const metricTime = document.getElementById('metricTime');
    const metricMovingTime = document.getElementById('metricMovingTime');
    const metricHeartRate = document.getElementById('metricHeartRate');
    const metricHeartRateAvg = document.getElementById('metricHeartRateAvg');
    const metricCalories = document.getElementById('metricCalories');
    const metricWaterLost = document.getElementById('metricWaterLost');
    const metricEta = document.getElementById('metricEta');

    const distanceText = summary.totalDistance === 0 ? '0' : summary.totalDistance.toFixed(1);
    if (metricDistance) metricDistance.textContent = `${distanceText} km`;
    const remaining = calculateSharedRemainingDistance(summary);
    const completion = computeDynamicProgress(summary.totalDistance, remaining);
    const completionText = completion === 0 ? '0%' : `${completion.toFixed(1)}%`;
    if (metricRemaining) metricRemaining.textContent = `${remaining.toFixed(1)} km`;
    if (metricCompletion) metricCompletion.textContent = completionText;
    if (metricSpeed) metricSpeed.textContent = `${summary.speed.toFixed(1)} km/h`;
    if (metricAvgMovingSpeed) metricAvgMovingSpeed.textContent = `${summary.movingAvgSpeed.toFixed(1)} km/h`;
    if (metricAvgTotalSpeed) metricAvgTotalSpeed.textContent = `${summary.totalAvgSpeed.toFixed(1)} km/h`;
    if (metricMaxSpeed) metricMaxSpeed.textContent = `${summary.maxSpeed.toFixed(1)} km/h`;
    const altitude = Number(summary.lastPoint?.altitudine?.metri ?? 0);
    if (metricAltitude) metricAltitude.textContent = `${altitude.toFixed(0)} m`;
    if (metricElevation) metricElevation.textContent = `${Math.round(summary.elevationGain)} m`;
    if (metricTime) metricTime.textContent = summary.duration > 0 ? formatTime(summary.duration) : '0';
    if (metricMovingTime) metricMovingTime.textContent = summary.movingDuration > 0 ? formatTime(summary.movingDuration) : '0';
    if (metricHeartRate) metricHeartRate.textContent = Number.isFinite(summary.heartRateBpm) ? `${summary.heartRateBpm} bpm` : '-- bpm';
    if (metricHeartRateAvg) metricHeartRateAvg.textContent = Number.isFinite(summary.heartRateAvgBpm) ? `${summary.heartRateAvgBpm} bpm` : '-- bpm';
    if (metricCalories) metricCalories.textContent = Number.isFinite(summary.caloriesBurned) ? `${summary.caloriesBurned.toLocaleString()} kcal` : '-- kcal';
    if (metricWaterLost) metricWaterLost.textContent = Number.isFinite(summary.waterLostLiters) ? `${summary.waterLostLiters.toFixed(1)} L` : '-- L';

    const etaSpeedKmh = summary.movingAvgSpeed > 0.2
        ? summary.movingAvgSpeed
        : summary.totalAvgSpeed > 0.2
            ? summary.totalAvgSpeed
            : summary.speed > 0.2
                ? summary.speed
                : 0;
    if (metricEta) {
        if (etaSpeedKmh <= 0 || remaining <= 0) {
            metricEta.textContent = remaining <= 0 ? t('status.completed') : '--';
        } else {
            const etaTimestamp = Date.now() + ((remaining / etaSpeedKmh) * 3600 * 1000);
            metricEta.textContent = formatEstimatedArrival(etaTimestamp);
        }
    }
}
function initHomeCountdown() {
    const dayEl = document.getElementById('countdownDays');
    const hourEl = document.getElementById('countdownHours');
    const minuteEl = document.getElementById('countdownMinutes');
    const secondEl = document.getElementById('countdownSeconds');
    const titleEl = document.getElementById('countdownTitle');
    const messageEl = document.getElementById('countdownMessage');
    const countdownEl = document.getElementById('homeCountdown');
    if (!dayEl || !hourEl || !minuteEl || !secondEl || !messageEl) return;

    const translatedTitle = t('pages.home.countdownTitle');
    if (titleEl && translatedTitle) titleEl.textContent = translatedTitle;

    const hideCountdown = () => {
        if (!countdownEl) return;
        countdownEl.hidden = true;
        countdownEl.classList.add('is-finished');
    };

    const target = new Date(plannedStartDateIso).getTime();

    const render = () => {
        if (titleEl && translatedTitle) titleEl.textContent = translatedTitle;
        const diffMs = target - Date.now();
        if (diffMs <= 0) {
            dayEl.textContent = '0';
            hourEl.textContent = '00';
            minuteEl.textContent = '00';
            secondEl.textContent = '00';
            messageEl.textContent = t('dynamic.countdownStarted');
            hideCountdown();
            return true;
        }

        const totalSeconds = Math.floor(diffMs / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        dayEl.textContent = String(days);
        hourEl.textContent = String(hours).padStart(2, '0');
        minuteEl.textContent = String(minutes).padStart(2, '0');
        secondEl.textContent = String(seconds).padStart(2, '0');
        messageEl.textContent = t('dynamic.countdownUpdated');
        return false;
    };

    if (render()) return;
    const timer = setInterval(() => {
        if (render()) clearInterval(timer);
    }, 1000);
}

function updateHomeCountdownVisibility(summary) {
    const countdown = document.getElementById('homeCountdown');
    if (!countdown) return;
    const started = Boolean(summary?.lastPoint) || Number(summary?.totalDistance || 0) > 0;
    const countdownFinished = Date.now() >= new Date(plannedStartDateIso).getTime();
    const shouldHide = started || countdownFinished;
    countdown.hidden = shouldHide;
    countdown.classList.toggle('is-finished', shouldHide);
}

function renderEmptyState(container, title, text) {
    if (!container) return;
    const card = document.createElement('article');
    card.className = 'empty-state';
    card.innerHTML = `<h3>${title}</h3><p>${text}</p>`;
    container.appendChild(card);
}
function formatHoursTick(hoursValue) {
    const totalMinutes = Math.max(0, Math.round((Number(hoursValue) || 0) * 60));
    const hh = Math.floor(totalMinutes / 60);
    const mm = totalMinutes % 60;
    return `${hh}h ${String(mm).padStart(2, '0')}m`;
}
function formatChartTooltipValue(value, unit) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return '--';
    if (unit === 'km/h') return `${numeric.toFixed(1)} km/h`;
    if (unit === 'bpm') return `${Math.round(numeric)} bpm`;
    if (unit === 'm') return `${Math.round(numeric)} m`;
    if (unit === 'km') return `${numeric.toFixed(2)} km`;
    return `${numeric.toFixed(2)}`;
}

function createChart(canvasId, label, data, color, yAxisLabel = '', xAxisConfig = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    const axis = {
        min: xAxisConfig.min,
        max: xAxisConfig.max,
        label: xAxisConfig.label || 'Km',
        tickCallback: xAxisConfig.tickCallback || (value => Number(value).toFixed(0)),
        maxTicksLimit: Number.isFinite(xAxisConfig.maxTicksLimit) ? xAxisConfig.maxTicksLimit : 7,
        mode: xAxisConfig.mode === 'time' ? 'time' : 'distance'
    };
    const yUnit = String(yAxisLabel || '').toLowerCase();
    if (chartInstances[canvasId]) chartInstances[canvasId].destroy();
    chartInstances[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label,
                data,
                parsing: false,
                borderColor: color,
                backgroundColor: `${color}33`,
                tension: 0.24,
                fill: true,
                spanGaps: false,
                borderWidth: 1.6,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointHitRadius: 12
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'nearest',
                intersect: false
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    displayColors: false,
                    callbacks: {
                        title(items) {
                            if (!Array.isArray(items) || !items.length) return '';
                            const rawX = Number(items[0]?.parsed?.x ?? Number.NaN);
                            if (!Number.isFinite(rawX)) return '';
                            if (axis.mode === 'time') return `Tempo: ${formatHoursTick(rawX)}`;
                            return `Distanza: ${rawX.toFixed(2)} km`;
                        },
                        label(context) {
                            return `${label}: ${formatChartTooltipValue(context?.parsed?.y, yUnit)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    display: true,
                    min: axis.min,
                    max: axis.max,
                    ticks: {
                        maxTicksLimit: axis.maxTicksLimit,
                        callback: axis.tickCallback
                    },
                    title: { display: true, text: axis.label }
                },
                y: {
                    display: true,
                    title: yAxisLabel ? { display: true, text: yAxisLabel } : { display: false, text: '' }
                }
            }
        }
    });
    return chartInstances[canvasId];
}
function ensureLeafletAssets() {
    if (typeof L === 'undefined' || !L.Icon || !L.Icon.Default) return;
    L.Icon.Default.imagePath = 'https://unpkg.com/leaflet/dist/images/';
}

function haversineKm(lat1, lon1, lat2, lon2) {
    const toRad = d => d * Math.PI / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function computeBlendedRemaining(summary) {
    if (!summary) return null;
    const totalDistance = summary.totalDistance || 0;
    const gpxtotal = gpxTotalKm || 330.79;
    const remainingGpx = Math.max(0, gpxtotal - totalDistance);
    // fallback: if we don't have a live point or GPX coords, return GPX remaining
    if (!summary.lastPoint || !gpxCoords || !gpxCoords.length) return remainingGpx;
    const last = summary.lastPoint;
    const dest = gpxCoords[gpxCoords.length - 1];
    if (!Number.isFinite(last?.coordinate?.lat) || !Number.isFinite(last?.coordinate?.lon)) return remainingGpx;
    const remainingLive = haversineKm(last.coordinate.lat, last.coordinate.lon, dest.lat, dest.lng);
    // progress fraction (0..1)
    const progressFrac = Math.min(Math.max(totalDistance / gpxtotal, 0), 1);
    // linear blend: weight on GPX decreases linearly with progress (at 0% -> 1, at 100% -> 0)
    const weightGpx = 1 - progressFrac;
    const blended = weightGpx * remainingGpx + (1 - weightGpx) * remainingLive;
    return Math.max(0, blended);
}

function computeDynamicProgress(totalDistance, remainingDistance) {
    const done = Math.max(0, Number(totalDistance) || 0);
    const remaining = Math.max(0, Number(remainingDistance) || 0);
    const dynamicTotal = done + remaining;
    if (dynamicTotal <= 0) return 0;
    return Math.min((done / dynamicTotal) * 100, 100);
}

function computeEstimatedSteps(totalDistanceKm, durationSeconds) {
    const distance = Math.max(0, Number(totalDistanceKm) || 0);
    const hours = Math.max(0, Number(durationSeconds) || 0) / 3600;
    // As effort increases over time, stride tends to shorten and steps/km increase.
    const fatigueGain = Math.min(hours * 0.03, 0.35);
    const stepsPerKm = 1420 * (1 + fatigueGain);
    return Math.round(distance * stepsPerKm);
}

function estimateCaloriesBurnedKcal(totalDistanceKm, durationSeconds, elevationGainM, heartRateBpm = null) {
    const distance = Math.max(0, Number(totalDistanceKm) || 0);
    const movingHours = Math.max(0, Number(durationSeconds) || 0) / 3600;
    const elevation = Math.max(0, Number(elevationGainM) || 0);
    const heartRate = Number(heartRateBpm);

    let estimate = distance * 70 + movingHours * 260 + elevation * 0.16;

    if (Number.isFinite(heartRate) && heartRate > 0) {
        const hrFactor = Math.max(0, (heartRate - 100) / 80);
        estimate += estimate * (hrFactor * 0.08);
    }

    return Math.round(estimate);
}

function estimateWaterLostLiters(totalDistanceKm, durationSeconds, elevationGainM, heartRateBpm = null) {
    const distance = Math.max(0, Number(totalDistanceKm) || 0);
    const movingHours = Math.max(0, Number(durationSeconds) || 0) / 3600;
    const elevation = Math.max(0, Number(elevationGainM) || 0);
    const heartRate = Number(heartRateBpm);

    let estimate = movingHours * 0.55 + distance * 0.035 + elevation * 0.0012;

    if (Number.isFinite(heartRate) && heartRate > 0) {
        const hrFactor = Math.max(0, (heartRate - 100) / 70);
        estimate += hrFactor * 0.12;
    }

    return Number(Math.max(0, estimate).toFixed(1));
}

function stretchSeriesToRange(series, xMin, xMax, fallbackY = 0) {
    const clean = Array.isArray(series) ? series.filter(p => Number.isFinite(p?.x) && Number.isFinite(p?.y)) : [];
    if (!clean.length) {
        return [{ x: xMin, y: fallbackY }, { x: xMax, y: fallbackY }];
    }
    const sorted = [...clean].sort((a, b) => a.x - b.x);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const stretched = [...sorted];
    if (first.x > xMin) stretched.unshift({ x: xMin, y: first.y });
    if (last.x < xMax) stretched.push({ x: xMax, y: last.y });
    return stretched.map(p => ({ x: Math.max(xMin, Math.min(xMax, p.x)), y: p.y }));
}

function parseGpxXml(gpxText) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(gpxText, 'application/xml');
    const trkpts = Array.from(xml.querySelectorAll('trkpt'));
    const coords = trkpts.map(pt => ({
        lat: Number(pt.getAttribute('lat')),
        lng: Number(pt.getAttribute('lon'))
    })).filter(c => Number.isFinite(c.lat) && Number.isFinite(c.lng));
    let totalKm = 0;
    for (let i = 1; i < coords.length; i += 1) {
        totalKm += haversineKm(coords[i - 1].lat, coords[i - 1].lng, coords[i].lat, coords[i].lng);
    }
    return { coords, totalKm };
}

async function ensureRouteTrackersLoaded() {
    if (gpxWaypoints.length) return;
    if (trackersLoadPromise) {
        await trackersLoadPromise;
        return;
    }
    trackersLoadPromise = fetch(trackerDataUrl)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data)) return;
            gpxWaypoints = data.map((entry, index) => ({
                lat: Number(entry?.lat),
                lng: Number(entry?.lon),
                name: String(entry?.name || '').trim(),
                index
            })).filter(point => Number.isFinite(point.lat) && Number.isFinite(point.lng));
        })
        .catch(error => {
            console.warn('Impossibile caricare tracker separati:', error);
        })
        .finally(() => {
            trackersLoadPromise = null;
        });
    await trackersLoadPromise;
}

function buildRouteLabel(prefix, index) {
    return `${prefix} ${index + 1}`;
}

function formatWaypointLabel(name, index) {
    const raw = String(name || '').trim();
    if (!raw) return buildRouteLabel('Night', index);
    return raw.replace(/_/g, ' ');
}

const hiddenProgressDefinitionsByLocale = {
    it: [
        {
            id: 'first-sunset',
            title: 'Primo tramonto',
            subtitle: 'Completata la prima giornata.',
            status: 'Sbloccato'
        },
        {
            id: 'midnight-walk',
            title: 'Notte fonda',
            subtitle: 'Hai camminato dopo mezzanotte.',
            status: 'Sbloccato'
        },
        {
            id: 'weather-challenge',
            title: 'Sfida al meteo',
            subtitle: 'Hai affrontato pioggia o temporale.',
            status: 'Sbloccato'
        },
        {
            id: 'northline-peak',
            title: 'Tetto della NorthLine',
            subtitle: 'Raggiunto il punto piu alto del percorso.',
            status: 'Sbloccato'
        },
        {
            id: 'never-stop',
            title: 'Mai fermarsi',
            subtitle: 'Oltre 15 ore consecutive in movimento.',
            status: 'Sbloccato'
        }
    ],
    en: [
        {
            id: 'first-sunset',
            title: 'First sunset',
            subtitle: 'Completed the first day.',
            status: 'Unlocked'
        },
        {
            id: 'midnight-walk',
            title: 'Late night',
            subtitle: 'You walked after midnight.',
            status: 'Unlocked'
        },
        {
            id: 'weather-challenge',
            title: 'Weather challenge',
            subtitle: 'You faced rain or a storm.',
            status: 'Unlocked'
        },
        {
            id: 'northline-peak',
            title: 'NorthLine summit',
            subtitle: 'Reached the highest point of the route.',
            status: 'Unlocked'
        },
        {
            id: 'never-stop',
            title: 'Never stop',
            subtitle: 'More than 15 consecutive hours moving.',
            status: 'Unlocked'
        }
    ],
    de: [
        {
            id: 'first-sunset',
            title: 'Erster Sonnenuntergang',
            subtitle: 'Der erste Tag ist abgeschlossen.',
            status: 'Freigeschaltet'
        },
        {
            id: 'midnight-walk',
            title: 'Tiefe Nacht',
            subtitle: 'Du bist nach Mitternacht gelaufen.',
            status: 'Freigeschaltet'
        },
        {
            id: 'weather-challenge',
            title: 'Wetterkampf',
            subtitle: 'Du hast Regen oder Gewitter gemeistert.',
            status: 'Freigeschaltet'
        },
        {
            id: 'northline-peak',
            title: 'NorthLine-Gipfel',
            subtitle: 'Den hoechsten Punkt der Route erreicht.',
            status: 'Freigeschaltet'
        },
        {
            id: 'never-stop',
            title: 'Nie stehen bleiben',
            subtitle: 'Mehr als 15 Stunden am Stueck in Bewegung.',
            status: 'Freigeschaltet'
        }
    ]
};

function getHiddenProgressDefinitions(locale) {
    return hiddenProgressDefinitionsByLocale[locale] || hiddenProgressDefinitionsByLocale.it;
}

function normalizeProgressUnlockId(value) {
    return String(value || '').trim();
}

function extractProgressUnlockIds(items) {
    return (Array.isArray(items) ? items : [])
        .map(item => normalizeProgressUnlockId(item?.id ?? item?.unlockId ?? item?.key ?? item))
        .filter(Boolean);
}

async function loadProgressUnlockIds() {
    const items = await loadCollection('progressUnlocks');
    return new Set(extractProgressUnlockIds(items));
}

function sanitizeCantonKeys(keys) {
    const normalized = (Array.isArray(keys) ? keys : [])
        .map(value => normalizeSwissCanton(value))
        .filter(Boolean);
    return cantonOrder.filter(cantonKey => normalized.includes(cantonKey));
}

async function loadCantonManualControl() {
    const fallback = { enabled: false, keys: [], updatedAt: null };
    const publicUrl = getFirebaseContentUrl('cantonProgressManual');
    if (!publicUrl) return fallback;
    try {
        const response = await fetch(publicUrl, { cache: 'no-store' });
        if (!response.ok) return fallback;
        const payload = await response.json();
        if (!payload || typeof payload !== 'object') return fallback;
        return {
            enabled: Boolean(payload.enabled),
            keys: sanitizeCantonKeys(payload.keys),
            updatedAt: payload.updatedAt ?? null
        };
    } catch (error) {
        console.warn('Impossibile leggere override manuale cantoni:', error);
        return fallback;
    }
}

function buildCantonProgressFromKeys(keys, locale) {
    const orderedKeys = sanitizeCantonKeys(keys);
    return {
        count: orderedKeys.length,
        total: cantonOrder.length,
        keys: orderedKeys,
        labels: orderedKeys.map(key => getCantonLabel(key, locale))
    };
}

const cantonProgressCacheKey = 'northline-canton-progress-cache-v3';
const cantonKeyToLabels = {
    it: {
        ticino: 'Ticino',
        uri: 'Uri',
        schwyz: 'Svitto',
        lucerne: 'Lucerna',
        zug: 'Zugo',
        zurich: 'Zurigo',
        schaffhausen: 'Sciaffusa'
    },
    en: {
        ticino: 'Ticino',
        uri: 'Uri',
        schwyz: 'Schwyz',
        lucerne: 'Lucerne',
        zug: 'Zug',
        zurich: 'Zurich',
        schaffhausen: 'Schaffhausen'
    },
    de: {
        ticino: 'Tessin',
        uri: 'Uri',
        schwyz: 'Schwyz',
        lucerne: 'Luzern',
        zug: 'Zug',
        zurich: 'Zürich',
        schaffhausen: 'Schaffhausen'
    }
};
const cantonOrder = ['ticino', 'uri', 'schwyz', 'lucerne', 'zug', 'zurich', 'schaffhausen'];

function normalizeSwissCanton(value) {
    const text = String(value || '').trim().toLowerCase();
    if (!text) return null;
    if (text.includes('ticino') || text.includes('tessin')) return 'ticino';
    if (text === 'uri' || text.includes('uri')) return 'uri';
    if (text.includes('schwyz') || text.includes('svitto')) return 'schwyz';
    if (text.includes('lucerne') || text.includes('luzern') || text.includes('lucerna')) return 'lucerne';
    if (text.includes('zug') || text.includes('zugo')) return 'zug';
    if (text.includes('zurich') || text.includes('zürich') || text.includes('zurigo')) return 'zurich';
    if (text.includes('schaffhausen') || text.includes('sciaffusa')) return 'schaffhausen';
    return null;
}

function getCantonLabel(cantonKey, locale) {
    const labels = cantonKeyToLabels[locale] || cantonKeyToLabels.it;
    return labels[cantonKey] || cantonKey;
}

function getCantonProgressSamples(points, sampleDistanceKm = 15) {
    if (!Array.isArray(points) || !points.length) return [];
    const sorted = [...points].filter(point => point?.coordinate && Number.isFinite(point.coordinate.lat) && Number.isFinite(point.coordinate.lon));
    if (!sorted.length) return [];
    const samples = [];
    let nextDistance = 0;
    let previousDistance = null;

    sorted.forEach((point, index) => {
        const currentDistance = Number(point?.distanza?.km);
        const useDistance = Number.isFinite(currentDistance);
        if (index === 0 || index === sorted.length - 1) {
            samples.push(point);
            previousDistance = useDistance ? currentDistance : previousDistance;
            return;
        }
        if (!useDistance) {
            const step = Math.max(1, Math.floor(sorted.length / 24));
            if (index % step === 0) samples.push(point);
            return;
        }
        if (currentDistance >= nextDistance) {
            samples.push(point);
            nextDistance = currentDistance + sampleDistanceKm;
            previousDistance = currentDistance;
            return;
        }
        if (previousDistance === null) previousDistance = currentDistance;
    });

    return samples.length ? samples : [sorted[0], sorted[sorted.length - 1]];
}

async function resolveCantonFromPoint(point, locale) {
    const lat = Number(point?.coordinate?.lat);
    const lon = Number(point?.coordinate?.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)}`;
    try {
        const cached = JSON.parse(localStorage.getItem(cantonProgressCacheKey) || '{}');
        if (cached && cached[cacheKey]) return cached[cacheKey];
    } catch (_) {}

    try {
        const language = locale === 'de' ? 'de' : locale === 'en' ? 'en' : 'it';
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&zoom=10&addressdetails=1&accept-language=${language}`,
            { cache: 'no-store' }
        );
        if (!response.ok) return null;
        const payload = await response.json();
        const address = payload && typeof payload === 'object' ? payload.address : null;
        const cantonKey = normalizeSwissCanton(address?.state || address?.county || address?.region || payload?.display_name || '');
        if (!cantonKey) return null;

        const nextCache = (() => {
            try { return JSON.parse(localStorage.getItem(cantonProgressCacheKey) || '{}'); } catch (_) { return {}; }
        })();
        nextCache[cacheKey] = cantonKey;
        localStorage.setItem(cantonProgressCacheKey, JSON.stringify(nextCache));
        return cantonKey;
    } catch (error) {
        console.warn('Impossibile risolvere il cantone dal punto live:', error);
        return null;
    }
}

async function computeTraversedCantons(points, locale) {
    const samples = getCantonProgressSamples(points, 15);
    const sequence = [];
    for (const point of samples) {
        const cantonKey = await resolveCantonFromPoint(point, locale);
        if (!cantonKey) continue;
        if (sequence[sequence.length - 1] !== cantonKey) {
            sequence.push(cantonKey);
        }
        if (sequence.length >= cantonOrder.length) break;
    }
    return {
        count: sequence.length,
        total: cantonOrder.length,
        keys: sequence,
        labels: sequence.map(key => getCantonLabel(key, locale))
    };
}

function buildNightMarkerIcon(label) {
    return null;
}

function buildStartFinishMarkerIcon(type) {
    const isStart = type === 'start';
    if (isStart) return null;
    return L.divIcon({
        className: `route-marker route-marker--${type}`,
        html: `<div class="route-marker__wrap"><span class="route-marker__pin"><span>${isStart ? 'S' : 'F'}</span></span><span class="route-marker__label">${isStart ? 'Partenza' : 'Arrivo'}</span></div>`,
        iconSize: [90, 56],
        iconAnchor: [45, 52],
        popupAnchor: [0, -44]
    });
}

function renderRouteTrackers() {
    if (!mapInstance || typeof L === 'undefined' || !gpxWaypoints.length) return;
    if (routeMarkerGroup) {
        mapInstance.removeLayer(routeMarkerGroup);
    }
    routeMarkerGroup = L.layerGroup().addTo(mapInstance);
    const trackerWaypoints = gpxWaypoints.filter((waypoint, index) => index < gpxWaypoints.length - 1 && !/ziel/i.test(waypoint.name));
    trackerWaypoints.forEach((waypoint, index) => {
        const label = formatWaypointLabel(waypoint.name, index);
        const marker = L.marker([waypoint.lat, waypoint.lng]).addTo(routeMarkerGroup);
        marker.bindPopup(`<strong>${escapeHtml(label)}</strong>`);
    });
}

async function ensureGpxDataLoaded() {
    if (gpxCoords.length && Number.isFinite(gpxTotalKm) && gpxTotalKm > 0) return;
    if (gpxLoadPromise) {
        await gpxLoadPromise;
        return;
    }
    gpxLoadPromise = fetch('data/NorthLine.gpx')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.text();
        })
        .then(gpxText => {
            const parsed = parseGpxXml(gpxText);
            if (parsed.coords.length) {
                gpxCoords = parsed.coords;
                gpxTotalKm = parsed.totalKm;
            }
        })
        .catch(error => {
            console.warn('Impossibile caricare GPX (fallback parser):', error);
        })
        .finally(() => {
            gpxLoadPromise = null;
        });
    await gpxLoadPromise;
}

function centerOnLatestLive() {
    if (!mapInstance || !latestLiveCoord) return;
    mapInstance.setView(latestLiveCoord, Math.max(mapInstance.getZoom(), 14));
}

function centerOnVisitorPosition() {
    if (!mapInstance || !latestVisitorCoord) return;
    mapInstance.setView(latestVisitorCoord, Math.max(mapInstance.getZoom(), 14));
}

function buildGoogleDirectionsToRunnerUrl(lat, lng) {
    const destLat = Number(lat).toFixed(6);
    const destLng = Number(lng).toFixed(6);
    return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=walking`;
}

function buildRunnerPopupContent(lat, lng) {
    const directionsUrl = buildGoogleDirectionsToRunnerUrl(lat, lng);
    return `<div class="runner-popup"><p>Posizione atleta</p><a class="runner-directions-btn" href="${directionsUrl}" target="_blank" rel="noopener noreferrer">Indicazioni</a></div>`;
}
function addMapControl() {
    if (typeof L === 'undefined' || !mapInstance) return;
    const tileProviders = getTileProviders();
    const styleOptions = [
        { key: 'osm', title: 'Mappa standard' },
        { key: 'satellite', title: 'Vista satellitare' },
        { key: 'topo', title: 'Mappa topografica' }
    ];
    const MapControl = L.Control.extend({
        onAdd: function() {
            const wrapper = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom map-control');
            const toggleButton = L.DomUtil.create('button', 'map-toggle-btn', wrapper);
            toggleButton.type = 'button';
            toggleButton.title = 'Scegli stile mappa';
            toggleButton.innerHTML = '🗺️';
            L.DomEvent.disableClickPropagation(toggleButton);
            const stylePanel = L.DomUtil.create('div', 'style-panel', wrapper);
            stylePanel.setAttribute('aria-label', 'Selezione stile mappa');
            styleOptions.forEach(({ key, title }) => {
                const card = L.DomUtil.create('button', 'style-card', stylePanel);
                card.type = 'button';
                card.title = title;
                card.dataset.key = key;
                card.setAttribute('aria-label', title);
                const preview = L.DomUtil.create('span', `style-preview ${key}`, card);
                // use project assets for preview images
                const img = document.createElement('img');
                img.alt = title;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '8px';
                if (key === 'osm') img.src = 'assets/mappa.png';
                if (key === 'satellite') img.src = 'assets/sat.png';
                if (key === 'topo') img.src = 'assets/topo.png';
                preview.appendChild(img);
                const label = L.DomUtil.create('span', 'style-label', card);
                label.textContent = key === 'osm' ? 'Mappa' : key === 'satellite' ? 'Sat' : 'Topo';
                L.DomEvent.disableClickPropagation(card);
                card.addEventListener('click', event => {
                    event.stopPropagation();
                    if (!tileProviders[key]) return;
                    activeLayer?.remove();
                    activeLayer = tileProviders[key].addTo(mapInstance);
                    if (key === 'topo' && mapInstance.getZoom() > 17) {
                        mapInstance.setZoom(17);
                    }
                    stylePanel.querySelectorAll('.style-card').forEach(el => el.classList.toggle('active', el.dataset.key === key));
                });
                if (key === 'osm') card.classList.add('active');
            });
            toggleButton.addEventListener('click', event => {
                L.DomEvent.stopPropagation(event);
                stylePanel.classList.toggle('open');
            });
            mapInstance.on('click', () => {
                stylePanel.classList.remove('open');
            });
            return wrapper;
        }
    });
    mapInstance.addControl(new MapControl({ position: 'topright' }));
}
function initMap(options = {}) {
    const showRouteTrackers = options.showRouteTrackers === true;
    if (mapInstance) return;
    if (typeof L === 'undefined') return;
    ensureLeafletAssets();
    const tileProviders = getTileProviders();
    mapInstance = L.map('map', { zoomControl: false }).setView(defaultCenter, defaultZoom);
    activeLayer = tileProviders.osm.addTo(mapInstance);
    L.control.zoom({ position: 'topright' }).addTo(mapInstance);
    addMapControl();
    const gpxUrl = 'data/NorthLine.gpx';
    try {
        new L.GPX(gpxUrl, {
            async: true,
            marker_options: { startIconUrl: null, endIconUrl: null, shadowUrl: null },
            polyline_options: { color: '#ff9f1c', weight: 7, opacity: 0.95 }
        }).on('loaded', e => {
            const track = e.target;
            if (track && typeof track.getBounds === 'function') {
                mapInstance.fitBounds(track.getBounds(), { padding: [40, 40] });
            }
            try {
                if (track._coords && track._coords.length) {
                    gpxCoords = track._coords;
                }
                if (track._info && track._info.length) {
                    gpxTotalKm = track._info.length / 1000;
                }
                if (!gpxCoords.length || !Number.isFinite(gpxTotalKm) || gpxTotalKm <= 0) {
                    ensureGpxDataLoaded().catch(() => {});
                }
                if (gpxCoords.length) {
                    const first = gpxCoords[0];
                    const last = gpxCoords[gpxCoords.length - 1];
                    if (!startMarker) startMarker = L.marker([first.lat, first.lng]).addTo(mapInstance);
                    if (finishMarker) mapInstance.removeLayer(finishMarker);
                    finishMarker = L.marker([last.lat, last.lng], { icon: L.icon({ iconUrl: 'assets/icons/finish-flag.gif', iconSize: [45,45], iconAnchor: [22,45] }) }).addTo(mapInstance);
                    if (showRouteTrackers) {
                        ensureRouteTrackersLoaded().then(() => renderRouteTrackers()).catch(() => {});
                    }
                    // refresh live UI using GPX total if we are on the live page
                    fetchPoints().then(points => {
                        const s = buildSummary(points);
                        try { if (s) { updateLiveUI(s); refreshMapRoute(s.points); } } catch(e){}
                    }).catch(()=>{});
                }
            } catch (err) { console.warn('Errore lettura GPX info', err); }
        }).on('error', e => {
            console.warn('Impossibile caricare GPX:', e);
        }).addTo(mapInstance);
    } catch (err) {
        console.warn('GPX initialization fallita:', err);
    }
}
function refreshMapRoute(points) {
    if (!mapInstance || !points.length) return;
    const coords = points.map(p => [p.coordinate.lat, p.coordinate.lon]);
    const shouldFitToBounds = !routeLine;
    if (routeLine) routeLine.setLatLngs(coords);
    else routeLine = L.polyline(coords, { color: '#4fc3ff', weight: 5, opacity: 0.8 }).addTo(mapInstance);
    latestLiveCoord = coords[coords.length - 1];
    // Use GPX-defined start/finish when available; no popups
    if (!startMarker && gpxCoords.length) {
        const first = gpxCoords[0];
        startMarker = L.marker([first.lat, first.lng]).addTo(mapInstance);
    }
    if (gpxCoords.length) {
        const last = gpxCoords[gpxCoords.length - 1];
        if (!finishMarker) finishMarker = L.marker([last.lat, last.lng], { icon: L.icon({ iconUrl: 'assets/icons/finish-flag.gif', iconSize: [45,45], iconAnchor: [22,45] }) }).addTo(mapInstance);
        else finishMarker.setLatLng([last.lat, last.lng]);
    }
    // live marker with popup and directions button
    if (!liveMarker) {
        liveMarker = L.circleMarker(coords[coords.length - 1], { radius: 10, fillColor: '#49a8ff', color: '#fff', weight: 2, fillOpacity: 0.95 }).addTo(mapInstance);
        liveMarker.bindPopup(buildRunnerPopupContent(coords[coords.length - 1][0], coords[coords.length - 1][1]));
    } else {
        liveMarker.setLatLng(coords[coords.length - 1]);
        liveMarker.setPopupContent(buildRunnerPopupContent(coords[coords.length - 1][0], coords[coords.length - 1][1]));
    }
    if (shouldFitToBounds) {
        mapInstance.fitBounds(routeLine.getBounds(), { padding: [40, 40] });
    }
}
function updateLiveUI(summary) {
    if (!summary) return;
    const distanceText = summary.totalDistance === 0 ? '0' : summary.totalDistance.toFixed(1);
    document.getElementById('distance').textContent = `${distanceText} km`;
    const remaining = calculateSharedRemainingDistance(summary);
    const completion = computeDynamicProgress(summary.totalDistance, remaining);
    const completionText = completion === 0 ? '0%' : `${completion.toFixed(1)}%`;
    document.getElementById('remaining').textContent = `${remaining.toFixed(1)} km`;
    document.getElementById('completion').textContent = completionText;
    document.getElementById('completionText').textContent = completionText;
    document.getElementById('speed').textContent = `${summary.speed.toFixed(1)} km/h`;
    const altitude = Number(summary.lastPoint?.altitudine?.metri ?? 0);
    document.getElementById('altitude').textContent = `${altitude.toFixed(0)} m`;
    document.getElementById('lastUpdate').textContent = summary.lastPoint?.orario ? formatRelativeDate(summary.lastPoint.orario) : '0 s';
    document.getElementById('time').textContent = summary.duration > 0 ? formatTime(summary.duration) : '0';
    document.getElementById('elevation').textContent = `${Math.round(summary.elevationGain)} m`;
    document.getElementById('steps').textContent = computeEstimatedSteps(summary.totalDistance, summary.duration).toLocaleString();
    document.getElementById('progressBar').style.width = `${completion.toFixed(1)}%`;
}

function updateVisitorDistance(lastPoint) {
    const label = document.getElementById('visitorDistanceLabel');
    const visitorDistanceField = document.getElementById('visitorDistance');
    const startCoord = gpxCoords.length ? gpxCoords[0] : null;
    const hasLivePosition = Number.isFinite(lastPoint?.coordinate?.lat) && Number.isFinite(lastPoint?.coordinate?.lon);
    const referenceLat = hasLivePosition ? lastPoint.coordinate.lat : startCoord?.lat;
    const referenceLon = hasLivePosition ? lastPoint.coordinate.lon : startCoord?.lng;

    if (label) {
        label.textContent = hasLivePosition ? t('dynamic.visitorDistance') : t('dynamic.visitorFromStart');
    }

    if (!Number.isFinite(referenceLat) || !Number.isFinite(referenceLon)) {
        if (visitorDistanceField) visitorDistanceField.textContent = '0 km';
        return;
    }

    if (!navigator.geolocation) {
        if (visitorDistanceField) visitorDistanceField.textContent = t('dynamic.notSupported');
        return;
    }

    navigator.geolocation.getCurrentPosition(position => {
        showVisitorMarker(position);
        const distanceKm = haversineKm(position.coords.latitude, position.coords.longitude, referenceLat, referenceLon);
        if (visitorDistanceField) visitorDistanceField.textContent = `${distanceKm.toFixed(1)} km`;
    }, () => {
        if (visitorDistanceField) visitorDistanceField.textContent = t('dynamic.permissionDenied');
    });
}
async function initLivePage() {
    initializeTheme();
    updateLiveUI(buildLivePreStartSummary());
    await Promise.all([ensureGpxDataLoaded(), ensureRouteTrackersLoaded()]);
    await ensureLiveStatusControl(true);
    initMap({ showRouteTrackers: true });
    buildNav();
    const points = await fetchPoints();
    const summary = buildSummary(points) || buildLivePreStartSummary();
    updateLiveUI(summary);
    if (summary.lastPoint) {
        refreshMapRoute(summary.points);
    }
    updateVisitorDistance(summary.lastPoint);
    // center-live button
    const centerBtn = document.getElementById('centerLiveBtn');
    if (centerBtn) {
        centerBtn.addEventListener('click', centerOnLatestLive);
    }
    const centerUserBtn = document.getElementById('centerUserBtn');
    if (centerUserBtn) {
        centerUserBtn.addEventListener('click', centerOnVisitorPosition);
    }

    const fullscreenBtn = document.getElementById('mapFullscreenBtn');
    const mapWrap = document.querySelector('.map-wrap');
    if (fullscreenBtn && mapWrap) {
        fullscreenBtn.addEventListener('click', () => {
            mapWrap.classList.toggle('map-wrap--fullscreen');
            const isFullscreen = mapWrap.classList.contains('map-wrap--fullscreen');
            fullscreenBtn.textContent = isFullscreen ? '\u2199' : '\u26F6';
            fullscreenBtn.title = isFullscreen ? t('pages.live.exitFullscreenMap') : t('pages.live.fullscreenMap');
            setTimeout(() => mapInstance?.invalidateSize(), 120);
        });
    }
    setInterval(async () => {
        await ensureLiveStatusControl(true);
        const points = await fetchPoints();
        const summary = buildSummary(points) || buildLivePreStartSummary();
        updateLiveUI(summary);
        if (summary.lastPoint) {
            refreshMapRoute(summary.points);
        }
        updateVisitorDistance(summary.lastPoint);
    }, 8000);
}
async function initHomePage() {
    initializeTheme();
    initHomeCountdown();
    await ensureGpxDataLoaded();
    await ensureLiveStatusControl(true);
    const points = await fetchPoints();
    const summary = buildSummary(points) || buildHomePreStartSummary();
    updateHomeSummary(summary);
    updateHomeCountdownVisibility(summary);
    setInterval(async () => {
        await ensureLiveStatusControl(true);
        const latestPoints = await fetchPoints();
        const latestSummary = buildSummary(latestPoints) || buildHomePreStartSummary();
        updateHomeSummary(latestSummary);
        updateHomeCountdownVisibility(latestSummary);
    }, homeRefreshMs);
}
function buildChartData(points, summaryContext = null) {
    const safePoints = points
        .filter(p => p && p.distanza && p.orario)
        .sort((a, b) => new Date(a.orario).getTime() - new Date(b.orario).getTime());
    if (!safePoints.length) {
        return {
            speedSeries: [],
            altitudeSeries: [],
            elevationSeries: [],
            heartRateSeries: [],
            maxTimeHours: 0,
            maxDistanceKm: 0
        };
    }

    const rawKm = safePoints.map(p => Number(p.distanza.km ?? 0));
    const kmMin = rawKm.length ? Math.min(...rawKm) : 0;
    const kmMax = rawKm.length ? Math.max(...rawKm) : 0;
    const sortedKm = [...rawKm].sort((a, b) => a - b);
    const kmP80 = sortedKm.length ? sortedKm[Math.floor(sortedKm.length * 0.8)] : 0;
    const uniqueKmCount = new Set(rawKm.map(v => Number(v.toFixed(2)))).size;
    const nonZeroKmRatio = rawKm.length ? (rawKm.filter(v => v > 0).length / rawKm.length) : 0;
    const hasUsableKmSpread = Number.isFinite(kmMin)
        && Number.isFinite(kmMax)
        && (kmMax - kmMin) > 0.1
        && uniqueKmCount > Math.max(6, Math.floor(rawKm.length * 0.2))
        && nonZeroKmRatio > 0.45
        && kmP80 > (kmMin + (kmMax - kmMin) * 0.2);
    const fallbackTotalKm = Math.max(
        0,
        Number(summaryContext?.totalDistance ?? points[points.length - 1]?.distanza?.km ?? safePoints[safePoints.length - 1]?.distanza?.km ?? 0)
    );
    const kmByIndex = safePoints.map((point, index) => (hasUsableKmSpread
        ? Number(point.distanza.km ?? 0)
        : (safePoints.length > 1 ? (fallbackTotalKm * index) / (safePoints.length - 1) : 0)));
    const timeByIndex = safePoints.map(point => new Date(point.orario).getTime());
    const validStartTs = timeByIndex.find(ts => Number.isFinite(ts));
    const fallbackDurationHours = Math.max(0, Number(summaryContext?.duration ?? 0) / 3600);
    let cumulativeElevation = 0;
    let previousAltitude = null;
    const deltaIntervalsMs = [];
    for (let index = 1; index < timeByIndex.length; index += 1) {
        const deltaMs = timeByIndex[index] - timeByIndex[index - 1];
        if (Number.isFinite(deltaMs) && deltaMs > 0) deltaIntervalsMs.push(deltaMs);
    }
    const medianDeltaMs = deltaIntervalsMs.length
        ? [...deltaIntervalsMs].sort((a, b) => a - b)[Math.floor(deltaIntervalsMs.length / 2)]
        : 0;
    const staleThresholdMs = Math.max(120000, medianDeltaMs * 3);
    const speedSeries = [];
    const altitudeSeries = [];
    const elevationSeries = [];
    const heartRateSeries = [];
    let maxTimeHours = 0;
    let maxDistanceKm = 0;

    safePoints.forEach((point, index) => {
        const km = kmByIndex[index];
        const absoluteTs = timeByIndex[index];
        const timeHours = (Number.isFinite(validStartTs) && Number.isFinite(absoluteTs) && absoluteTs >= validStartTs)
            ? (absoluteTs - validStartTs) / 3600000
            : (safePoints.length > 1 ? (fallbackDurationHours * index) / (safePoints.length - 1) : 0);
        const altitudeRaw = Number(point?.altitudine?.metri ?? Number.NaN);
        const altitude = Number.isFinite(altitudeRaw) ? altitudeRaw : null;

        const currentSpeed = extractCurrentSpeedKmh(point);
        const prevTs = index > 0 ? timeByIndex[index - 1] : Number.NaN;
        const currentTs = timeByIndex[index];
        const dtMs = Number.isFinite(prevTs) && Number.isFinite(currentTs) ? currentTs - prevTs : Number.NaN;
        const isStaleGap = Number.isFinite(dtMs) && dtMs > staleThresholdMs;

        let speed = Number.isFinite(currentSpeed) ? currentSpeed : null;
        if (!Number.isFinite(speed) && index > 0 && !isStaleGap) {
            const prevMeters = Number(safePoints[index - 1]?.distanza?.metri ?? Number.NaN);
            const currentMeters = Number(point?.distanza?.metri ?? Number.NaN);
            if (Number.isFinite(prevMeters) && Number.isFinite(currentMeters) && currentMeters >= prevMeters && Number.isFinite(dtMs) && dtMs > 0) {
                speed = ((currentMeters - prevMeters) / (dtMs / 1000)) * 3.6;
            }
        }
        if (isStaleGap) speed = null;

        const hr = extractHeartRateBpm(point);

        maxTimeHours = Math.max(maxTimeHours, timeHours);
        maxDistanceKm = Math.max(maxDistanceKm, Number.isFinite(km) ? km : 0);
        if (Number.isFinite(altitude) && Number.isFinite(previousAltitude)) {
            cumulativeElevation += Math.max(0, altitude - previousAltitude);
        }
        if (Number.isFinite(altitude)) {
            previousAltitude = altitude;
        }

        speedSeries.push({ km, t: timeHours, y: Number.isFinite(speed) ? Number(speed.toFixed(2)) : null });
        altitudeSeries.push({ km, t: timeHours, y: Number.isFinite(altitude) ? altitude : null });
        elevationSeries.push({ km, t: timeHours, y: Number.isFinite(altitude) ? cumulativeElevation : null });
        heartRateSeries.push({ km, t: timeHours, y: Number.isFinite(hr) ? hr : null });
    });

    return {
        speedSeries,
        altitudeSeries,
        elevationSeries,
        heartRateSeries,
        maxTimeHours,
        maxDistanceKm
    };
}
function roundUpToStep(value, step) {
    if (!Number.isFinite(value) || value <= 0) return step;
    return Math.ceil(value / step) * step;
}
function buildDashboardAxisConfig(mode, chartData, summary) {
    if (mode === 'time') {
        const maxHours = Math.max(0.25, chartData.maxTimeHours || Number(summary.duration || 0) / 3600 || 0);
        const roundedMaxHours = roundUpToStep(maxHours, maxHours > 8 ? 1 : 0.25);
        return {
            min: 0,
            max: roundedMaxHours,
            label: t('pages.dashboard.xTime') || 'Tempo',
            tickCallback: value => formatHoursTick(value),
            maxTicksLimit: 6,
            mode: 'time'
        };
    }
    const maxKm = Math.max(1, chartData.maxDistanceKm || summary.totalDistance || 0);
    const roundedMaxKm = roundUpToStep(maxKm, maxKm > 40 ? 5 : maxKm > 10 ? 2 : 1);
    return {
        min: 0,
        max: roundedMaxKm,
        label: t('pages.dashboard.xDistance') || 'Km',
        tickCallback: value => {
            const numeric = Number(value);
            if (!Number.isFinite(numeric)) return '';
            return numeric < 10 ? numeric.toFixed(1) : numeric.toFixed(0);
        },
        maxTicksLimit: 7,
        mode: 'distance'
    };
}
function initDashboardChartFullscreen() {
    const grid = document.querySelector('.page-dashboard .chart-grid');
    if (!grid || grid.dataset.fullscreenInit === 'true') return;

    const closeFullscreen = () => {
        const activeCard = grid.querySelector('.metric-card.chart-card-fullscreen');
        if (!activeCard) return;
        activeCard.classList.remove('chart-card-fullscreen');
        const btn = activeCard.querySelector('.chart-fullscreen-btn');
        if (btn) {
            btn.textContent = 'Full';
            btn.setAttribute('aria-label', 'Ingrandisci grafico');
            btn.setAttribute('title', 'Ingrandisci grafico');
        }
        document.body.classList.remove('chart-fullscreen-open');
        const canvas = activeCard.querySelector('canvas');
        if (canvas && chartInstances[canvas.id]) chartInstances[canvas.id].resize();
    };

    grid.addEventListener('click', event => {
        const button = event.target.closest('.chart-fullscreen-btn');
        if (!button) return;
        const card = button.closest('.metric-card');
        if (!card) return;
        const isFullscreen = card.classList.contains('chart-card-fullscreen');
        if (isFullscreen) {
            closeFullscreen();
            return;
        }
        closeFullscreen();
        card.classList.add('chart-card-fullscreen');
        button.textContent = 'Close';
        button.setAttribute('aria-label', 'Chiudi grafico');
        button.setAttribute('title', 'Chiudi grafico');
        document.body.classList.add('chart-fullscreen-open');
        const canvas = card.querySelector('canvas');
        if (canvas && chartInstances[canvas.id]) chartInstances[canvas.id].resize();
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeFullscreen();
    });

    grid.dataset.fullscreenInit = 'true';
}
async function initDashboardPage() {
    initializeTheme();
    updateDashboardSummary(buildDashboardPreStartSummary());
    await ensureGpxDataLoaded();
    const points = await fetchPoints();
    const summary = buildSummary(points) || buildDashboardPreStartSummary();
    updateDashboardSummary(summary);
    const xAxisSelect = document.getElementById('chartXAxisMode');
    const storedXAxisMode = localStorage.getItem('northline-chart-x-axis');
    const xAxisMode = storedXAxisMode === 'time' ? 'time' : 'distance';
    if (xAxisSelect) xAxisSelect.value = xAxisMode;
    const hasLiveData = points.length > 0;
    const chartCards = Array.from(document.querySelectorAll('.chart-grid .metric-card'));
    initDashboardChartFullscreen();
    const setChartsEmpty = empty => {
        chartCards.forEach(card => {
            card.classList.toggle('chart-empty', empty);
            let note = card.querySelector('.chart-empty-note');
            if (empty && !note) {
                note = document.createElement('p');
                note.className = 'chart-empty-note';
                note.textContent = t('pages.dashboard.chartEmpty');
                card.appendChild(note);
            }
            if (!empty && note) note.remove();
            const canvas = card.querySelector('canvas');
            if (empty && canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        });
    };

    if (xAxisSelect) xAxisSelect.disabled = !hasLiveData;

    if (!hasLiveData) {
        Object.keys(chartInstances).forEach(key => {
            chartInstances[key]?.destroy();
            delete chartInstances[key];
        });
        setChartsEmpty(true);
        return;
    }

    setChartsEmpty(false);
    const chartData = buildChartData(points, summary);

    const renderCharts = axisMode => {
        const mode = axisMode === 'time' ? 'time' : 'distance';
        const toAxisSeries = series => series.map(p => ({
            x: mode === 'time' ? p.t : p.km,
            y: Number.isFinite(p?.y) ? p.y : null
        }));
        const speedSeries = toAxisSeries(chartData.speedSeries);
        const altitudeSeries = toAxisSeries(chartData.altitudeSeries);
        const elevationSeries = toAxisSeries(chartData.elevationSeries);
        const heartRateSeries = toAxisSeries(chartData.heartRateSeries);
        const axisConfig = buildDashboardAxisConfig(mode, chartData, summary);
        const chartTitles = resolveText('pages.dashboard.chartTitles');
        createChart('chartSpeed', Array.isArray(chartTitles) ? chartTitles[0] : 'Velocita', speedSeries, '#49a8ff', 'Km/h', axisConfig);
        createChart('chartAltitude', Array.isArray(chartTitles) ? chartTitles[1] : 'Altitudine', altitudeSeries, '#7f7dff', 'm', axisConfig);
        createChart('chartHeartRate', Array.isArray(chartTitles) ? chartTitles[2] : 'Frequenza cardiaca', heartRateSeries, '#ff6b6b', 'bpm', axisConfig);
        createChart('chartElevation', Array.isArray(chartTitles) ? chartTitles[3] : 'Dislivello cumulato', elevationSeries, '#f3c03d', 'm', axisConfig);
    };

    renderCharts(xAxisMode);
    if (xAxisSelect) {
        xAxisSelect.addEventListener('change', event => {
            const mode = event.target.value === 'time' ? 'time' : 'distance';
            localStorage.setItem('northline-chart-x-axis', mode);
            renderCharts(mode);
        });
    }
}
async function initGalleryPage() {
    initializeTheme();
    const items = await loadUnifiedMediaItems();
    const grid = document.querySelector('.gallery-grid');
    if (!grid) return;

    if (!items.length) {
        renderEmptyState(
            grid,
            t('dynamic.galleryEmptyTitle'),
            t('dynamic.galleryEmptyText')
        );
        await initGalleryPhotoMap([]);
        return;
    }

    useMediaModal(items);

    items.forEach((item, index) => {
        const card = document.createElement('article');
        card.className = 'gallery-item';
        card.innerHTML = `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}"><div class="gallery-meta"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.location || item.source || '')}</p></div>`;
        card.addEventListener('click', () => {
            openMediaModal(index);
        });
        grid.appendChild(card);
    });
    await initGalleryPhotoMap(items);
}
async function initDiaryPage() {
    initializeTheme();
    const [diaryEntries, timelineEntries] = await Promise.all([
        loadCollection('diary'),
        loadCollection('timeline')
    ]);
    const entries = buildUnifiedDiaryTimelineEntries(diaryEntries, timelineEntries);
    const container = document.querySelector('.diary-list');
    if (!container) return;

    if (!entries.length) {
        renderEmptyState(
            container,
            t('dynamic.diaryEmptyTitle'),
            t('dynamic.diaryEmptyText')
        );
        return;
    }

    entries.forEach(entry => {
        const article = document.createElement('article');
        article.className = 'diary-entry';
        article.innerHTML = `${entry._image ? `<img src="${escapeHtml(entry._image)}" alt="${escapeHtml(entry._title)}">` : ''}<div><time>${escapeHtml(entry._subtitle)}</time><h3>${escapeHtml(entry._title)}</h3><p>${escapeHtml(entry._text)}</p></div>`;
        container.appendChild(article);
    });
}
async function initTimelinePage() {
    await initDiaryPage();
}
async function renderAdminCollection(type) {
    const list = document.querySelector(`[data-admin-list="${type}"]`);
    if (!list) return;
    const items = await loadCollection(type);
    list.innerHTML = '';
    if (!items.length) {
        renderEmptyState(list, 'Nessun contenuto', 'Questa sezione e ancora vuota.');
        return;
    }
    items.forEach((item, index) => {
        const article = document.createElement('article');
        article.className = 'admin-item-card';
        const meta = document.createElement('div');
        meta.className = 'admin-item-meta';
        const heading = document.createElement('h3');
        heading.textContent = item.title || item.location || item.time || `Elemento ${index + 1}`;
        const info = document.createElement('p');
        info.textContent = type === 'gallery'
            ? `${item.tag || 'senza tag'} · ${item.location || 'nessuna localita'}${item.date ? ` · ${item.date}${item.time ? ` ${item.time}` : ''}` : ''}${item.km ? ` · ${item.km} km` : ''}`
            : type === 'diary'
                ? `${item.date || 'nessuna data'} · ${item.km || '0'} km`
                : `${item.date || 'nessuna data'} ${item.time || '--:--'} · ${item.description || ''}`;
        meta.append(heading, info);
        const actions = document.createElement('div');
        actions.className = 'admin-item-actions';
        const upButton = document.createElement('button');
        upButton.type = 'button';
        upButton.className = 'button secondary';
        upButton.textContent = 'Su';
        upButton.disabled = index === 0;
        upButton.addEventListener('click', async () => {
            await moveCollectionItem(type, item.id, 'up');
            await renderAdminCollection(type);
        });
        const downButton = document.createElement('button');
        downButton.type = 'button';
        downButton.className = 'button secondary';
        downButton.textContent = 'Giu';
        downButton.disabled = index === items.length - 1;
        downButton.addEventListener('click', async () => {
            await moveCollectionItem(type, item.id, 'down');
            await renderAdminCollection(type);
        });
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'button ghost';
        deleteButton.textContent = 'Cancella';
        deleteButton.addEventListener('click', async () => {
            // Optimistic UI: remove immediately, then persist in background.
            article.remove();
            try {
                await deleteCollectionItem(type, item.id);
                if (!list.children.length) {
                    renderEmptyState(list, 'Nessun contenuto', 'Questa sezione e ancora vuota.');
                }
            } catch (error) {
                await renderAdminCollection(type);
            }
        });
        actions.append(upButton, downButton, deleteButton);
        article.append(meta, actions);
        list.append(article);
    });
}

async function renderAdminProgressUnlocks() {
    const list = document.getElementById('adminHiddenProgressList');
    if (!list) return;
    const locale = currentLanguage === 'de' ? 'de' : currentLanguage === 'en' ? 'en' : 'it';
    const definitions = getHiddenProgressDefinitions(locale);
    const unlockedIds = await loadProgressUnlockIds();
    list.innerHTML = '';

    definitions.forEach(definition => {
        const label = document.createElement('label');
        label.className = 'admin-hidden-progress-item';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = definition.id;
        checkbox.checked = unlockedIds.has(definition.id);
        const text = document.createElement('div');
        text.className = 'admin-hidden-progress-copy';
        const title = document.createElement('strong');
        title.textContent = definition.title;
        const subtitle = document.createElement('span');
        subtitle.textContent = definition.subtitle;
        text.append(title, subtitle);
        label.append(checkbox, text);
        list.appendChild(label);
    });
}

async function persistProgressUnlocks(unlockedIds) {
    const items = Array.from(new Set(unlockedIds))
        .map(id => ({ id, unlockedAt: new Date().toISOString() }));
    await persistCollection('progressUnlocks', items);
}

async function persistCantonManualControl(enabled, cantonKeys) {
    const database = getFirebaseDatabase();
    if (!database) {
        throw new Error('Firebase non disponibile. Verifica configurazione e login admin.');
    }
    const payload = {
        enabled: Boolean(enabled),
        keys: sanitizeCantonKeys(cantonKeys),
        updatedAt: new Date().toISOString()
    };
    await database.ref(`${contentDatabasePath}/cantonProgressManual`).set(payload);
}

async function renderAdminCantonOverrideForm() {
    const list = document.getElementById('adminCantonOverrideList');
    const toggle = document.getElementById('adminCantonOverrideEnabled');
    const current = document.getElementById('adminCantonOverrideCurrent');
    if (!list || !toggle) return;

    const control = await loadCantonManualControl();
    const selectedSet = new Set(control.keys || []);
    toggle.checked = Boolean(control.enabled);
    list.innerHTML = '';

    cantonOrder.forEach(cantonKey => {
        const label = document.createElement('label');
        label.className = 'admin-hidden-progress-item';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = cantonKey;
        checkbox.checked = selectedSet.has(cantonKey);

        const text = document.createElement('div');
        text.className = 'admin-hidden-progress-copy';
        const title = document.createElement('strong');
        title.textContent = getCantonLabel(cantonKey, 'it');
        const subtitle = document.createElement('span');
        subtitle.textContent = `ID: ${cantonKey}`;
        text.append(title, subtitle);

        label.append(checkbox, text);
        list.appendChild(label);
    });

    if (current) {
        current.textContent = control.enabled
            ? `Modalita manuale attiva: ${control.keys.length}/7 cantoni selezionati.`
            : 'Modalita automatica attiva: cantoni calcolati dai punti live.';
    }
}

function bindAdminCantonOverrideForm() {
    const form = document.getElementById('adminCantonOverrideForm');
    const notice = document.getElementById('adminCantonOverrideNotice');
    if (!form || form.dataset.bound === 'true') return;

    const refresh = () => renderAdminCantonOverrideForm().catch(error => {
        setAdminFeedbackMessage(notice, `Impossibile leggere override cantoni: ${error.message || 'errore sconosciuto'}.`, true);
    });

    form.addEventListener('submit', async event => {
        event.preventDefault();
        setAdminFeedbackMessage(notice, '', false);
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) submitButton.disabled = true;
        try {
            const enabled = Boolean(form.querySelector('#adminCantonOverrideEnabled')?.checked);
            const selectedKeys = Array.from(form.querySelectorAll('#adminCantonOverrideList input[type="checkbox"]:checked'))
                .map(input => input.value)
                .filter(Boolean);
            await persistCantonManualControl(enabled, selectedKeys);
            await refresh();
            setAdminFeedbackMessage(notice, 'Override cantoni aggiornato su Firebase.', false);
        } catch (error) {
            setAdminFeedbackMessage(notice, `Salvataggio override cantoni fallito: ${error.message || 'errore sconosciuto'}.`, true);
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    });

    refresh();
    form.dataset.bound = 'true';
}

function bindAdminProgressUnlocksForm() {
    const form = document.getElementById('adminHiddenProgressForm');
    const notice = document.getElementById('adminHiddenProgressNotice');
    if (!form || form.dataset.bound === 'true') return;

    const refreshForm = () => renderAdminProgressUnlocks().catch(error => {
        setAdminFeedbackMessage(notice, `Impossibile leggere gli unlock: ${error.message || 'errore sconosciuto'}.`, true);
    });

    form.addEventListener('submit', async event => {
        event.preventDefault();
        setAdminFeedbackMessage(notice, '', false);
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) submitButton.disabled = true;
        try {
            const selectedIds = Array.from(form.querySelectorAll('input[type="checkbox"]:checked'))
                .map(input => normalizeProgressUnlockId(input.value))
                .filter(Boolean);
            await persistProgressUnlocks(selectedIds);
            await refreshForm();
            setAdminFeedbackMessage(notice, 'Traguardi nascosti aggiornati su Firebase.', false);
        } catch (error) {
            setAdminFeedbackMessage(notice, `Salvataggio traguardi nascosti fallito: ${error.message || 'errore sconosciuto'}.`, true);
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    });

    refreshForm();
    form.dataset.bound = 'true';
}
function formatAdminNow() {
    const now = new Date();
    const pad = value => String(value).padStart(2, '0');
    return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}
function setAdminFeedbackMessage(element, message, isError = false) {
    if (!element) return;
    element.textContent = message || '';
    element.classList.toggle('is-error', Boolean(message) && isError);
}
function showAdminSaveNotice(message, isError = false) {
    setAdminFeedbackMessage(document.getElementById('adminSaveNotice'), message, isError);
}
async function reverseGeocodeNearestLocation(lat, lng) {
    const endpoint = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=14&addressdetails=1`;
    const response = await fetch(endpoint, {
        headers: {
            'Accept': 'application/json',
            'Accept-Language': 'it'
        }
    });
    if (!response.ok) throw new Error('Servizio localita non disponibile');
    const payload = await response.json();
    const address = payload?.address || {};
    const primary = address.city || address.town || address.village || address.hamlet || address.suburb || address.municipality || '';
    const secondary = address.state || address.county || '';
    const compact = [primary, secondary].filter(Boolean).join(', ');
    if (compact) return compact;
    const fallback = String(payload?.display_name || '').split(',').slice(0, 2).join(',').trim();
    return fallback || 'Localita non trovata';
}
function initAdminFormHelpers() {
    const form = document.querySelector('[data-admin-form="gallery"]');
    if (!form) return;
    const status = document.getElementById('adminGalleryGeoStatus');
    const latField = form.querySelector('[name="lat"]');
    const lngField = form.querySelector('[name="lng"]');
    const locationField = form.querySelector('[name="location"]');
    const dateField = form.querySelector('[name="date"]');
    const timeField = form.querySelector('[name="time"]');
    const kmField = form.querySelector('[name="km"]');
    const geoButton = document.getElementById('adminGalleryGeoBtn');
    const mapButton = document.getElementById('adminGalleryMapBtn');
    const nowButton = document.getElementById('adminGalleryNowBtn');
    const kmNowButton = document.getElementById('adminGalleryKmNowBtn');
    const wrap = document.getElementById('adminGalleryMapPickerWrap');
    const mapId = 'adminGalleryMapPicker';

    let cachedCurrentCoords = null;
    let pickerMap = null;
    let pickerMarker = null;
    let reverseRequestId = 0;

    const setStatus = text => {
        if (status) status.textContent = text;
    };
    const setCoords = async (lat, lng, labelPrefix = 'Posizione impostata') => {
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        if (latField) latField.value = String(lat);
        if (lngField) lngField.value = String(lng);
        setStatus(`${labelPrefix}: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        if (!locationField) return;
        locationField.value = 'Ricerca localita...';
        const reqId = ++reverseRequestId;
        try {
            const locality = await reverseGeocodeNearestLocation(lat, lng);
            if (reqId !== reverseRequestId) return;
            locationField.value = locality;
            setStatus(`${labelPrefix}: ${lat.toFixed(5)}, ${lng.toFixed(5)} · ${locality}`);
        } catch {
            if (reqId !== reverseRequestId) return;
            locationField.value = 'Localita non trovata';
            setStatus(`${labelPrefix}: ${lat.toFixed(5)}, ${lng.toFixed(5)} · localita non disponibile`);
        }
    };
    const requestCurrentPosition = (onSuccess, onError) => {
        if (!navigator.geolocation) {
            onError?.();
            return;
        }
        navigator.geolocation.getCurrentPosition(position => {
            cachedCurrentCoords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            onSuccess?.(cachedCurrentCoords);
        }, () => {
            onError?.();
        }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
    };

    if (form.dataset.preloadedGeo !== 'true') {
        requestCurrentPosition(coords => {
            const hasLat = Number.isFinite(Number(latField?.value));
            const hasLng = Number.isFinite(Number(lngField?.value));
            if (!hasLat || !hasLng) {
                setCoords(coords.lat, coords.lng, 'Posizione attuale pronta');
            } else {
                setStatus('Posizione attuale pronta');
            }
        }, () => {
            setStatus('Posizione attuale non disponibile');
        });
        form.dataset.preloadedGeo = 'true';
    }

    if (nowButton && nowButton.dataset.bound !== 'true') {
        nowButton.addEventListener('click', () => {
            const now = new Date();
            const pad = value => String(value).padStart(2, '0');
            if (dateField) dateField.value = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
            if (timeField) timeField.value = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
        });
        nowButton.dataset.bound = 'true';
    }

    if (kmNowButton && kmNowButton.dataset.bound !== 'true') {
        kmNowButton.addEventListener('click', async () => {
            if (!kmField) return;
            const original = kmNowButton.textContent;
            kmNowButton.disabled = true;
            kmNowButton.textContent = 'Carico...';
            try {
                const points = await fetchPoints();
                const lastPoint = points[points.length - 1];
                const km = Number(lastPoint?.distanza?.km ?? 0);
                kmField.value = Number.isFinite(km) ? (km === 0 ? '0' : km.toFixed(1)) : '0';
            } catch {
                setStatus('Km attuale non disponibile');
            } finally {
                kmNowButton.disabled = false;
                kmNowButton.textContent = original || 'Km attuale';
            }
        });
        kmNowButton.dataset.bound = 'true';
    }

    if (geoButton && geoButton.dataset.bound !== 'true') {
        geoButton.addEventListener('click', () => {
            if (cachedCurrentCoords) {
                setCoords(cachedCurrentCoords.lat, cachedCurrentCoords.lng, 'Posizione attuale');
                return;
            }
            geoButton.disabled = true;
            geoButton.textContent = 'Rilevo...';
            requestCurrentPosition(coords => {
                setCoords(coords.lat, coords.lng, 'Posizione attuale');
                geoButton.disabled = false;
                geoButton.textContent = 'Usa posizione attuale';
            }, () => {
                setStatus('Posizione non disponibile');
                geoButton.disabled = false;
                geoButton.textContent = 'Usa posizione attuale';
            });
        });
        geoButton.dataset.bound = 'true';
    }

    const ensurePickerMap = () => {
        if (!wrap) return;
        if (pickerMap) {
            setTimeout(() => pickerMap.invalidateSize(), 80);
            return;
        }
        if (typeof L === 'undefined') {
            setStatus('Cartina non disponibile');
            return;
        }
        const startCoords = cachedCurrentCoords || {
            lat: Number(latField?.value ?? Number.NaN),
            lng: Number(lngField?.value ?? Number.NaN)
        };
        const hasStartCoords = Number.isFinite(startCoords.lat) && Number.isFinite(startCoords.lng);
        pickerMap = L.map(mapId, { zoomControl: true }).setView(
            hasStartCoords ? [startCoords.lat, startCoords.lng] : defaultCenter,
            hasStartCoords ? 12 : 11
        );
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(pickerMap);
        if (hasStartCoords) {
            pickerMarker = L.marker([startCoords.lat, startCoords.lng]).addTo(pickerMap);
        }
        pickerMap.on('click', event => {
            const { lat, lng } = event.latlng;
            if (!pickerMarker) pickerMarker = L.marker([lat, lng]).addTo(pickerMap);
            else pickerMarker.setLatLng([lat, lng]);
            setCoords(lat, lng, 'Posizione scelta su cartina');
        });
    };

    if (mapButton && mapButton.dataset.bound !== 'true') {
        mapButton.addEventListener('click', () => {
            if (!wrap) return;
            const isOpening = wrap.hidden;
            wrap.hidden = !isOpening;
            mapButton.textContent = isOpening ? 'Chiudi cartina' : 'Scegli su cartina';
            if (isOpening) ensurePickerMap();
        });
        mapButton.dataset.bound = 'true';
    }

    document.querySelectorAll('[data-tag-suggestion]').forEach(button => {
        if (button.dataset.bound === 'true') return;
        button.addEventListener('click', () => {
            const galleryTagInput = document.querySelector('[data-admin-form="gallery"] [name="tag"]');
            if (!galleryTagInput) return;
            galleryTagInput.value = button.dataset.tagSuggestion || '';
            galleryTagInput.focus();
        });
        button.dataset.bound = 'true';
    });
}
async function handleAdminFormSubmit(type, form) {
    const items = await loadCollection(type);
    const id = createRecordId(type);
    const lat = Number(form.lat?.value ?? Number.NaN);
    const lng = Number(form.lng?.value ?? Number.NaN);
    const geo = Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
    if (type === 'gallery') {
        const image = await readFileAsDataUrl(form.querySelector('[name="image"]')?.files?.[0]);
        items.push({
            id,
            title: form.title.value.trim(),
            date: form.date.value.trim(),
            time: form.time.value.trim(),
            km: form.km.value.trim(),
            location: form.location.value.trim(),
            tag: form.tag.value.trim(),
            description: form.description.value.trim(),
            image,
            geo
        });
    }
    await persistCollection(type, items);
    form.reset();
    const nearestBlock = form.closest('.admin-block');
    nearestBlock?.querySelectorAll('.admin-inline-note').forEach(note => {
        note.textContent = 'Posizione non impostata';
    });
    await renderAdminCollection(type);
}
function bindAdminForm(type) {
    const form = document.querySelector(`[data-admin-form="${type}"]`);
    if (!form || form.dataset.bound === 'true') return;
    form.addEventListener('submit', async event => {
        event.preventDefault();
        try {
            await handleAdminFormSubmit(type, form);
            showAdminSaveNotice('Salvataggio completato su Firebase.');
        } catch (error) {
            showAdminSaveNotice(`Salvataggio fallito: ${error.message || 'errore sconosciuto'}.`, true);
        }
    });
    form.dataset.bound = 'true';
}
async function persistLiveStatusControl(forcedStatus) {
    const database = getFirebaseDatabase();
    if (!database) {
        throw new Error('Firebase non disponibile. Verifica configurazione e login admin.');
    }
    const statusKey = normalizeHomeStatus(forcedStatus);
    const reference = database.ref(`${contentDatabasePath}/liveStatus`);
    if (statusKey === 'not-started') {
        await reference.set(null);
        liveStatusControlCache = { forcedStatus: null, updatedAt: null };
        liveStatusControlLastFetchTs = Date.now();
        return;
    }
    const payload = {
        forcedStatus: statusKey === 'ended' ? 'Fine giornata' : forcedStatus,
        updatedAt: new Date().toISOString()
    };
    await reference.set(payload);
    liveStatusControlCache = payload;
    liveStatusControlLastFetchTs = Date.now();
}
function bindAdminLiveStatusForm() {
    const form = document.getElementById('adminLiveStatusForm');
    if (!form || form.dataset.bound === 'true') return;
    const select = form.querySelector('[name="forcedStatus"]');
    const notice = document.getElementById('adminLiveStatusNotice');
    const current = document.getElementById('adminLiveStatusCurrent');

    const renderCurrent = () => {
        const forcedKey = normalizeHomeStatus(liveStatusControlCache?.forcedStatus ?? '');
        if (select) select.value = forcedKey === 'ended' ? 'ended' : '';
        if (current) {
            current.textContent = forcedKey === 'ended'
                ? 'Stato attivo: Fine giornata (forzato da admin)'
                : 'Stato attivo: Automatico da Garmin/Firebase';
        }
    };

    ensureLiveStatusControl(true)
        .then(renderCurrent)
        .catch(() => renderCurrent());

    form.addEventListener('submit', async event => {
        event.preventDefault();
        setAdminFeedbackMessage(notice, '', false);
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) submitButton.disabled = true;
        try {
            const selected = select?.value === 'ended' ? 'Fine giornata' : null;
            await persistLiveStatusControl(selected);
            await ensureLiveStatusControl(true);
            renderCurrent();
            setAdminFeedbackMessage(notice, 'Stato live aggiornato.', false);
        } catch (error) {
            setAdminFeedbackMessage(notice, `Aggiornamento stato fallito: ${error.message || 'errore sconosciuto'}.`, true);
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    });

    form.dataset.bound = 'true';
}
function showAdminState(unlocked) {
    const locked = document.getElementById('adminLocked');
    const app = document.getElementById('adminApp');
    if (locked) locked.hidden = unlocked;
    if (app) app.hidden = !unlocked;
}
function initAdminPage() {
    initializeTheme();
    showAdminState(isAdminAuthenticated());
    const loginForm = document.getElementById('adminLoginForm');
    const errorBox = document.getElementById('adminLoginError');
    const successBox = document.getElementById('adminLoginSuccess');
    const auth = getFirebaseAuth();
    const modeLabel = document.getElementById('adminModeLabel');
    const firebaseReady = Boolean(auth && hasUsableFirebaseConfig());
    if (modeLabel) {
        modeLabel.textContent = firebaseReady
            ? 'Autenticazione Firebase attiva. I salvataggi avvengono solo su Firebase.'
            : 'Configurazione Firebase non valida: accesso admin non disponibile finche non completi firebase-config.js.';
    }
    loginForm?.addEventListener('submit', event => {
        event.preventDefault();
        const email = loginForm.querySelector('[name="email"]')?.value || '';
        const password = loginForm.querySelector('[name="password"]')?.value || '';
        if (errorBox) errorBox.textContent = '';
        setAdminFeedbackMessage(successBox, '', false);

        if (!firebaseReady) {
            if (errorBox) errorBox.textContent = 'Completa la configurazione Firebase per poter accedere.';
            return;
        }

        if (!email || !password) {
            if (errorBox) errorBox.textContent = 'Inserisci email e password Firebase.';
            return;
        }

        const unlockAdmin = async () => {
            setAdminAuthenticated(true);
            if (errorBox) errorBox.textContent = '';
            setAdminFeedbackMessage(successBox, 'Accesso riuscito: pannello admin sbloccato.', false);
            showAdminState(true);
            initAdminFormHelpers();
            bindAdminForm('gallery');
            bindAdminLiveStatusForm();
            bindAdminProgressUnlocksForm();
            bindAdminCantonOverrideForm();
            await syncNightGalleryEntriesToFirebase();
            await renderAdminCollection('gallery');
            loginForm.reset();
        };

        auth.signInWithEmailAndPassword(email, password)
            .then(unlockAdmin)
            .catch(error => {
                if (errorBox) errorBox.textContent = `Login Firebase fallito: ${error.message}`;
            });
    });
    document.getElementById('adminLogoutBtn')?.addEventListener('click', () => {
        getFirebaseAuth()?.signOut().catch(() => {});
        setAdminAuthenticated(false);
        showAdminSaveNotice('', false);
        setAdminFeedbackMessage(successBox, '', false);
        showAdminState(false);
    });
    if (isAdminAuthenticated()) {
        initAdminFormHelpers();
        bindAdminForm('gallery');
        bindAdminLiveStatusForm();
        bindAdminProgressUnlocksForm();
        bindAdminCantonOverrideForm();
        syncNightGalleryEntriesToFirebase()
            .then(() => renderAdminCollection('gallery'))
            .catch(() => renderAdminCollection('gallery'));
    }
}
function getPhotoMarkerIcon(item, zoomLevel) {
    const zoom = Number.isFinite(zoomLevel) ? zoomLevel : 12;
    const size = Math.max(28, Math.min(74, 30 + ((zoom - 10) * 3)));
    return L.divIcon({
        className: 'photo-thumb-marker',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        html: `<span class="photo-thumb-wrap" style="width:${size}px;height:${size}px;"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}"></span>`
    });
}
function bindPhotoMapFullscreen() {
    const fullscreenBtn = document.getElementById('galleryPhotoMapFullscreenBtn');
    const mapWrap = document.querySelector('.map-wrap-photo-gallery');
    if (!fullscreenBtn || !mapWrap) return;
    fullscreenBtn.addEventListener('click', () => {
        mapWrap.classList.toggle('map-wrap--fullscreen');
        const isFullscreen = mapWrap.classList.contains('map-wrap--fullscreen');
        fullscreenBtn.textContent = isFullscreen ? '🡼' : '⛶';
            fullscreenBtn.title = isFullscreen ? t('pages.gallery.exitFullscreenMap') : t('pages.gallery.fullscreenMap');
        setTimeout(() => mapInstance?.invalidateSize(), 120);
    });
}
function buildReplayStartFlagIcon() {
    return L.divIcon({
        className: 'replay-start-flag',
        html: '<span class="replay-start-flag__pin">🚩</span>',
        iconSize: [34, 34],
        iconAnchor: [17, 30],
        popupAnchor: [0, -26]
    });
}
function buildReplayPhotoPreviewIcon(item) {
    const title = escapeHtml(item?.title || 'Photo');
    const image = escapeHtml(item?.image || '');
    return L.divIcon({
        className: 'replay-photo-preview',
        html: `<div class="replay-photo-preview__card"><img src="${image}" alt="${title}"><span>${title}</span></div>`,
        iconSize: [148, 112],
        iconAnchor: [74, 104],
        popupAnchor: [0, -94]
    });
}
function buildReplayPhotoMiniIcon(item) {
    const title = escapeHtml(item?.title || 'Photo');
    const image = escapeHtml(item?.image || '');
    return L.divIcon({
        className: 'replay-photo-mini',
        html: `<div class="replay-photo-mini__card"><img src="${image}" alt="${title}"></div>`,
        iconSize: [48, 38],
        iconAnchor: [24, 34],
        popupAnchor: [0, -32]
    });
}
async function initGalleryPhotoMap(items) {
    initMap({ showRouteTrackers: false });
    if (!mapInstance) return;
    bindPhotoMapFullscreen();

    const statusLabel = document.getElementById('galleryPhotoMapStatus');
    const geoItems = items.filter(item => item.geo);
    const points = await fetchPoints();

    if (!geoItems.length) {
        if (statusLabel) {
            statusLabel.textContent = items.length
                ? (currentLanguage === 'en' ? 'No photo with location available.' : currentLanguage === 'de' ? 'Keine Fotos mit Position verfügbar.' : 'Nessuna foto con posizione disponibile.')
                : (currentLanguage === 'en' ? 'No image available.' : currentLanguage === 'de' ? 'Keine Bilder verfügbar.' : 'Nessuna immagine disponibile.');
        }
        if (points.length) refreshMapRoute(points);
        return;
    }

    if (points.length) refreshMapRoute(points);

    const bounds = L.latLngBounds(geoItems.map(item => [item.geo.lat, item.geo.lng]));
    if (routeLine && typeof routeLine.getBounds === 'function') {
        bounds.extend(routeLine.getBounds());
    }
    mapInstance.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });

    const clusterGroup = typeof L.markerClusterGroup === 'function'
        ? L.markerClusterGroup({
            showCoverageOnHover: false,
            spiderfyOnMaxZoom: true,
            maxClusterRadius: 48
        })
        : L.layerGroup();

    photoMapState.clusterGroup = clusterGroup;
    photoMapState.markerById.clear();

    useMediaModal(geoItems, currentItem => {
        if (!currentItem?.geo || !mapInstance) return;
        mapInstance.panTo([currentItem.geo.lat, currentItem.geo.lng], { animate: true, duration: 0.45 });
        const marker = photoMapState.markerById.get(currentItem.id);
        if (marker?.openPopup) marker.openPopup();
    });

    geoItems.forEach((item, index) => {
        const marker = L.marker([item.geo.lat, item.geo.lng], {
            icon: getPhotoMarkerIcon(item, mapInstance.getZoom())
        });
        marker.bindPopup(`<strong>${escapeHtml(item.title)}</strong><br>${escapeHtml(item.location || '')}`);
        marker.on('click', () => openMediaModal(index));
        photoMapState.markerById.set(item.id, marker);
        clusterGroup.addLayer(marker);
    });

    if (clusterGroup.addTo) clusterGroup.addTo(mapInstance);

    mapInstance.on('zoomend', () => {
        const zoom = mapInstance.getZoom();
        photoMapState.markerById.forEach((marker, id) => {
            const mediaItem = geoItems.find(item => item.id === id);
            if (!mediaItem) return;
            marker.setIcon(getPhotoMarkerIcon(mediaItem, zoom));
        });
    });

    if (statusLabel) {
        statusLabel.textContent = currentLanguage === 'en'
            ? `${geoItems.length} geolocated photos · live route visible`
            : currentLanguage === 'de'
                ? `${geoItems.length} geolokalisierte Fotos · Live-Route sichtbar`
                : `${geoItems.length} foto geolocalizzate · percorso live visibile`;
    }
}
async function initReplayPage() {
    initializeTheme();
    initMap({ showRouteTrackers: false });
    buildNav();
    const statusLabel = document.getElementById('replayStatus');
    const speedInput = document.getElementById('replaySpeed');
    const speedLabel = document.getElementById('replaySpeedLabel');

    const points = await fetchPoints();
    const coords = points
        .map(p => [Number(p?.coordinate?.lat), Number(p?.coordinate?.lon)])
        .filter(pair => Number.isFinite(pair[0]) && Number.isFinite(pair[1]));

    if (!coords.length) {
        if (statusLabel) {
            statusLabel.textContent = currentLanguage === 'en'
                ? 'No Firebase points available for replay'
                : currentLanguage === 'de'
                    ? 'Keine Firebase-Punkte für Replay verfügbar'
                    : 'Nessun punto Firebase disponibile per il replay';
        }
        const replayPlay = document.getElementById('replayPlay');
        const replayPause = document.getElementById('replayPause');
        const replayReset = document.getElementById('replayReset');
        const replaySpeed = document.getElementById('replaySpeed');
        if (replayPlay) replayPlay.disabled = true;
        if (replayPause) replayPause.disabled = true;
        if (replayReset) replayReset.disabled = true;
        if (replaySpeed) replaySpeed.disabled = true;
        return;
    }
    const mediaItems = await loadUnifiedMediaItems();
    const replayPhotos = mediaItems.filter(item => item?.geo && item?.image);
    const replayPhotoPoints = replayPhotos
        .map(item => ({
            item,
            lat: Number(item?.geo?.lat),
            lng: Number(item?.geo?.lng)
        }))
        .filter(entry => Number.isFinite(entry.lat) && Number.isFinite(entry.lng));
    const replayTrail = L.polyline([coords[0]], { color: '#7f7dff', weight: 6, opacity: 0.95 }).addTo(mapInstance);
    mapInstance.setView(coords[0], 14);
    let index = 0;
    const marker = L.circleMarker(coords[0], { radius: 12, color: '#ffb347', fillColor: '#ffd382', fillOpacity: 1 }).addTo(mapInstance);
    const startFlagMarker = L.marker(coords[0], { icon: buildReplayStartFlagIcon() }).addTo(mapInstance);
    startFlagMarker.bindPopup(currentLanguage === 'en' ? 'Start' : currentLanguage === 'de' ? 'Start' : 'Partenza');
    let photoPreviewMarker = null;
    let activePhotoId = null;
    let activeReplayPhotoEntry = null;
    let replayPhotoLayer = null;
    let slowMotionUntil = 0;
    let timerId = null;
    let finalOverviewTimer = null;
    let isPlaying = false;

    if (statusLabel) {
        statusLabel.textContent = currentLanguage === 'en'
            ? 'Replay loading Firebase points...'
            : currentLanguage === 'de'
                ? 'Replay lädt Firebase-Punkte...'
                : 'Replay in caricamento dai punti Firebase...';
    }

    const showNearbyReplayPhoto = (lat, lon) => {
        if (!Array.isArray(replayPhotoPoints) || !replayPhotoPoints.length) {
            if (photoPreviewMarker) {
                mapInstance.removeLayer(photoPreviewMarker);
                photoPreviewMarker = null;
                activePhotoId = null;
            }
            activeReplayPhotoEntry = null;
            return;
        }

        const thresholdKm = 0.45;
        let bestPhoto = null;
        let bestDistance = Number.POSITIVE_INFINITY;

        replayPhotoPoints.forEach(entry => {
            const distance = haversineKm(lat, lon, entry.lat, entry.lng);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestPhoto = entry;
            }
        });

        if (!bestPhoto || bestDistance > thresholdKm) {
            if (photoPreviewMarker) {
                mapInstance.removeLayer(photoPreviewMarker);
                photoPreviewMarker = null;
                activePhotoId = null;
            }
            activeReplayPhotoEntry = null;
            return;
        }

        if (!photoPreviewMarker || activePhotoId !== bestPhoto.item.id) {
            if (photoPreviewMarker) mapInstance.removeLayer(photoPreviewMarker);
            photoPreviewMarker = L.marker([bestPhoto.lat, bestPhoto.lng], {
                icon: buildReplayPhotoPreviewIcon(bestPhoto.item),
                zIndexOffset: 1200
            }).addTo(mapInstance);
            activePhotoId = bestPhoto.item.id;
            activeReplayPhotoEntry = bestPhoto;
            slowMotionUntil = Date.now() + 1800;
        } else {
            photoPreviewMarker.setLatLng([bestPhoto.lat, bestPhoto.lng]);
            activeReplayPhotoEntry = bestPhoto;
        }
    };

    const clearReplayTimer = () => {
        if (timerId) {
            clearTimeout(timerId);
            timerId = null;
        }
    };

    const removeReplayPhotoLayer = () => {
        if (replayPhotoLayer) {
            mapInstance.removeLayer(replayPhotoLayer);
            replayPhotoLayer = null;
        }
    };

    const showFinalOverview = () => {
        if (finalOverviewTimer) {
            clearTimeout(finalOverviewTimer);
            finalOverviewTimer = null;
        }

        const applyOverview = () => {
        removeReplayPhotoLayer();
        replayPhotoLayer = L.layerGroup();
        replayPhotoPoints.forEach(entry => {
            const mini = L.marker([entry.lat, entry.lng], {
                icon: buildReplayPhotoMiniIcon(entry.item),
                zIndexOffset: 900
            });
            mini.bindPopup(`<strong>${escapeHtml(entry.item.title || '')}</strong>`);
            replayPhotoLayer.addLayer(mini);
        });
        replayPhotoLayer.addTo(mapInstance);

        const finalBounds = L.latLngBounds([coords[0], coords[index - 1] || coords[coords.length - 1] || coords[0]]);
        replayPhotoPoints.forEach(entry => finalBounds.extend([entry.lat, entry.lng]));
        if (finalBounds.isValid()) {
            mapInstance.fitBounds(finalBounds, { padding: [56, 56], maxZoom: 12 });
        }
        };

        if (photoPreviewMarker && activeReplayPhotoEntry) {
            const shrinkLatLng = photoPreviewMarker.getLatLng();
            mapInstance.removeLayer(photoPreviewMarker);
            photoPreviewMarker = null;
            activePhotoId = null;
            const shrinkMarker = L.marker(shrinkLatLng, {
                icon: buildReplayPhotoMiniIcon(activeReplayPhotoEntry.item),
                zIndexOffset: 1350
            }).addTo(mapInstance);
            finalOverviewTimer = window.setTimeout(() => {
                if (mapInstance.hasLayer(shrinkMarker)) {
                    mapInstance.removeLayer(shrinkMarker);
                }
                applyOverview();
            }, 700);
            return;
        }

        applyOverview();
    };

    const getEffectiveReplaySpeedMs = () => {
        const baseMs = getReplaySpeedMs();
        if (Date.now() < slowMotionUntil) {
            return Math.min(1200, Math.round(baseMs * 2.8));
        }
        return baseMs;
    };

    showNearbyReplayPhoto(coords[0][0], coords[0][1]);
    const getReplaySpeedMs = () => {
        const value = Number(speedInput?.value ?? 80);
        return Number.isFinite(value) ? Math.max(20, value) : 80;
    };
    const getReplayStepSize = () => {
        const speedMs = getReplaySpeedMs();
        const speedFactorStep = Math.max(1, Math.round(1800 / speedMs));
        const lengthFactorStep = Math.max(1, Math.floor(coords.length / 2000));
        return Math.max(speedFactorStep, lengthFactorStep);
    };

    function updateMarker() {
        if (index >= coords.length) {
            clearReplayTimer();
            isPlaying = false;
            if (statusLabel) statusLabel.textContent = t('pages.replay.complete');
            showFinalOverview();
            return;
        }

        const stepSize = getReplayStepSize();
        const nextIndex = Math.min(index + stepSize, coords.length);
        const segment = coords.slice(index, nextIndex);
        const currentCoord = segment[segment.length - 1] || coords[index];

        marker.setLatLng(currentCoord);
        replayTrail.addLatLng(currentCoord);
        showNearbyReplayPhoto(currentCoord[0], currentCoord[1]);
        if (statusLabel) statusLabel.textContent = t('dynamic.replayProgress', { current: nextIndex, total: coords.length });
        mapInstance.panTo(currentCoord, { animate: true, duration: 0.35 });
        index = nextIndex;

        if (index >= coords.length) {
            clearReplayTimer();
            isPlaying = false;
            if (statusLabel) statusLabel.textContent = t('pages.replay.complete');
            showFinalOverview();
        }
    }

    const scheduleNextTick = () => {
        if (!isPlaying) return;
        clearReplayTimer();
        timerId = setTimeout(() => {
            timerId = null;
            updateMarker();
            if (isPlaying && index < coords.length) scheduleNextTick();
        }, getEffectiveReplaySpeedMs());
    };

    document.getElementById('replayPlay')?.addEventListener('click', () => {
        if (index >= coords.length) index = 0;
        isPlaying = true;
        removeReplayPhotoLayer();
        scheduleNextTick();
    });
    document.getElementById('replayPause')?.addEventListener('click', () => {
        isPlaying = false;
        clearReplayTimer();
    });
    document.getElementById('replayReset')?.addEventListener('click', () => {
        isPlaying = false;
        clearReplayTimer();
        index = 0;
        slowMotionUntil = 0;
        marker.setLatLng(coords[0]);
        startFlagMarker.setLatLng(coords[0]);
        replayTrail.setLatLngs([coords[0]]);
        removeReplayPhotoLayer();
        showNearbyReplayPhoto(coords[0][0], coords[0][1]);
        if (statusLabel) statusLabel.textContent = t('pages.replay.ready');
        mapInstance.setView(coords[0], 14);
    });
    if (speedLabel) speedLabel.textContent = `${getReplaySpeedMs()} ms`;
    speedInput?.addEventListener('input', event => {
        const newMs = Number(event.target.value);
        if (speedLabel) speedLabel.textContent = `${newMs} ms`;
        if (isPlaying) {
            scheduleNextTick();
        }
    });
}
async function initProgressPage() {
    initializeTheme();
    const points = await fetchPoints();
    const summary = buildSummary(points) || {
        totalDistance: 0,
        progress: 0,
        elevationGain: 0,
        movingDuration: 0,
        duration: 0
    };
    const estimatedSteps = computeEstimatedSteps(
        Number(summary.totalDistance || 0),
        Number(summary.duration || 0)
    );
    const locale = currentLanguage === 'de' ? 'de' : currentLanguage === 'en' ? 'en' : 'it';
    const autoCantonProgress = await computeTraversedCantons(points, locale);
    const manualCantonControl = await loadCantonManualControl();
    const cantonProgress = manualCantonControl.enabled
        ? buildCantonProgressFromKeys(manualCantonControl.keys, locale)
        : autoCantonProgress;
    const unlockedProgressIds = await loadProgressUnlockIds();
    const translations = {
        it: {
            categories: {
                distance: 'Distanza',
                elevation: 'Dislivello',
                movingTime: 'Tempo in movimento',
                steps: 'Passi',
                cantons: 'Cantoni'
            },
            ui: {
                level: (current, total) => `Livello ${current}/${total}`,
                next: target => `Prossimo livello: ${target}`,
                mastered: 'Missione leggendaria completata'
            },
            titles: {
                distance: 'Traguardo distanza',
                elevation: 'Traguardo dislivello',
                movingTime: 'Traguardo tempo in movimento',
                steps: 'Traguardo passi',
                cantons: 'Cantoni attraversati'
            },
            subtitles: {
                distance: target => `Raggiungi ${target.toFixed(1)} km percorsi`,
                elevation: target => `Raggiungi ${Math.round(target)} m di dislivello positivo`,
                movingTime: target => `Raggiungi ${formatTime(Math.floor(target))} di tempo in movimento`,
                steps: target => `Raggiungi ${Math.round(target).toLocaleString('it-IT')} passi stimati`,
                cantons: target => target > 0
                    ? `Attraversi ${target} cantoni: ${cantonProgress.labels.slice(0, Math.min(target, cantonProgress.labels.length)).join(' · ')}`
                    : 'Ancora nessun cantone attraversato'
            }
        },
        en: {
            categories: {
                distance: 'Distance',
                elevation: 'Elevation',
                movingTime: 'Moving time',
                steps: 'Steps',
                cantons: 'Cantons'
            },
            ui: {
                level: (current, total) => `Level ${current}/${total}`,
                next: target => `Next level: ${target}`,
                mastered: 'Legendary mission completed'
            },
            titles: {
                distance: 'Distance milestone',
                elevation: 'Elevation milestone',
                movingTime: 'Moving time milestone',
                steps: 'Step milestone',
                cantons: 'Cantons crossed'
            },
            subtitles: {
                distance: target => `Reach ${target.toFixed(1)} km total distance`,
                elevation: target => `Reach ${Math.round(target)} m positive elevation`,
                movingTime: target => `Reach ${formatTime(Math.floor(target))} of moving time`,
                steps: target => `Reach ${Math.round(target).toLocaleString('en-US')} estimated steps`,
                cantons: target => target > 0
                    ? `Cross ${target} cantons: ${cantonProgress.labels.slice(0, Math.min(target, cantonProgress.labels.length)).join(' · ')}`
                    : 'No cantons crossed yet'
            }
        },
        de: {
            categories: {
                distance: 'Distanz',
                elevation: 'Höhenmeter',
                movingTime: 'Bewegungszeit',
                steps: 'Schritte',
                cantons: 'Kantone'
            },
            ui: {
                level: (current, total) => `Stufe ${current}/${total}`,
                next: target => `Nächste Stufe: ${target}`,
                mastered: 'Legendäre Mission abgeschlossen'
            },
            titles: {
                distance: 'Distanz-Meilenstein',
                elevation: 'Höhenmeter-Meilenstein',
                movingTime: 'Bewegungszeit-Meilenstein',
                steps: 'Schritt-Meilenstein',
                cantons: 'Durchquerte Kantone'
            },
            subtitles: {
                distance: target => `Erreiche ${target.toFixed(1)} km Gesamtdistanz`,
                elevation: target => `Erreiche ${Math.round(target)} m positiven Höhengewinn`,
                movingTime: target => `Erreiche ${formatTime(Math.floor(target))} Bewegungszeit`,
                steps: target => `Erreiche ${Math.round(target).toLocaleString('de-DE')} geschätzte Schritte`,
                cantons: target => target > 0
                    ? `Durchquere ${target} Kantone: ${cantonProgress.labels.slice(0, Math.min(target, cantonProgress.labels.length)).join(' · ')}`
                    : 'Noch keine Kantone durchquert'
            }
        }
    };
    const copy = translations[locale] || translations.it;
    const hiddenCopy = {
        it: {
            title: 'Traguardi nascosti',
            description: 'Questi obiettivi compaiono solo dopo lo sblocco manuale dall\'admin.'
        },
        en: {
            title: 'Hidden achievements',
            description: 'These goals appear only after manual admin unlock.'
        },
        de: {
            title: 'Versteckte Erfolge',
            description: 'Diese Ziele erscheinen erst nach manueller Freischaltung im Admin.'
        }
    }[locale] || {
        title: 'Traguardi nascosti',
        description: 'Questi obiettivi compaiono solo dopo lo sblocco manuale dall\'admin.'
    };
    const formatDistance = value => `${value.toFixed(1)} km`;
    const formatElevation = value => `${Math.round(value)} m`;
    const formatMovingTime = value => formatTime(Math.max(0, Math.floor(value)));
    const formatSteps = value => `${Math.round(value).toLocaleString(locale === 'it' ? 'it-IT' : locale === 'de' ? 'de-DE' : 'en-US')}`;
    const cantonCount = cantonProgress.count;
    const cantonTotal = cantonProgress.total;

    const badgeDefinitions = [
        {
            categoryKey: 'distance',
            value: Number(summary.totalDistance || 0),
            targets: [50, 100, 200, 300, 350],
            formatter: formatDistance
        },
        {
            categoryKey: 'elevation',
            value: Number(summary.elevationGain || 0),
            targets: [1000, 2500, 4000, 6000],
            formatter: formatElevation
        },
        {
            categoryKey: 'movingTime',
            value: Number(summary.movingDuration || 0),
            targets: [10 * 3600, 30 * 3600, 60 * 3600, 100 * 3600],
            formatter: formatMovingTime
        },
        {
            categoryKey: 'steps',
            value: Number(estimatedSteps || 0),
            targets: [100000, 200000, 350000, 500000],
            formatter: formatSteps
        },
        {
            categoryKey: 'cantons',
            value: cantonCount,
            targets: [1, 2, 3, 4, 5, 6, 7],
            formatter: value => `${Math.round(value)}`,
            total: cantonTotal,
            sequence: cantonProgress.labels,
            isCantonBadge: true
        }
    ];

    const badges = badgeDefinitions.map(definition => {
        const targets = Array.isArray(definition.targets) ? definition.targets : [];
        const safeValue = Number.isFinite(definition.value) ? Math.max(0, definition.value) : 0;
        const isCantonBadge = Boolean(definition.isCantonBadge);
        const cantonTotalCount = Number.isFinite(definition.total) && definition.total > 0 ? definition.total : cantonTotal;
        const completedLevels = targets.filter(target => safeValue >= target).length;
        const currentIndex = Math.min(completedLevels, Math.max(0, targets.length - 1));
        const currentTarget = Number(targets[currentIndex] ?? 1);
        const previousTarget = currentIndex > 0 ? Number(targets[currentIndex - 1]) : 0;
        const isLastLevel = currentIndex === (targets.length - 1);
        const isMastered = isLastLevel && safeValue >= currentTarget;
        const range = Math.max(1, currentTarget - previousTarget);
        const progressInLevel = isMastered
            ? 100
            : Math.min(Math.max(((safeValue - previousTarget) / range) * 100, 0), 100);
        const nextTarget = !isLastLevel ? Number(targets[currentIndex + 1]) : null;
        const cantonSequence = Array.isArray(definition.sequence) ? definition.sequence : [];
        const cantonCountText = `${Math.round(safeValue)}/${cantonTotalCount}`;
        return {
            category: copy.categories[definition.categoryKey],
            title: isCantonBadge
                ? `${copy.titles[definition.categoryKey]} · ${cantonCountText}`
                : `${copy.titles[definition.categoryKey]} · ${definition.formatter(currentTarget)}`,
            subtitle: isCantonBadge
                ? `${copy.subtitles[definition.categoryKey](Math.round(safeValue))}`
                : copy.subtitles[definition.categoryKey](currentTarget),
            levelLabel: isCantonBadge
                ? copy.ui.level(Math.round(safeValue), cantonTotalCount)
                : copy.ui.level(currentIndex + 1, targets.length),
            value: safeValue,
            target: isCantonBadge ? cantonTotalCount : currentTarget,
            nextTarget: isCantonBadge ? null : nextTarget,
            formatter: definition.formatter,
            isMastered: isCantonBadge ? safeValue >= cantonTotalCount : isMastered,
            progressInLevel: isCantonBadge ? (cantonTotalCount > 0 ? (safeValue / cantonTotalCount) * 100 : 0) : progressInLevel,
            isCantonBadge,
            cantonSequence,
            cantonTotalCount
        };
    });

    const grid = document.querySelector('.badge-grid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!badges.length) {
        renderEmptyState(
            grid,
            t('dynamic.progressEmptyTitle'),
            t('dynamic.progressEmptyText')
        );
        return;
    }

    badges.forEach(badge => {
        const article = document.createElement('article');
        article.className = 'badge-card';
        const safeValue = Number.isFinite(badge.value) ? Math.max(0, badge.value) : 0;
        const safeTarget = Number.isFinite(badge.target) && badge.target > 0 ? badge.target : 1;
        const isCantonBadge = Boolean(badge.isCantonBadge);
        const cantonTotalCount = Number.isFinite(badge.cantonTotalCount) && badge.cantonTotalCount > 0 ? badge.cantonTotalCount : cantonTotal;
        const completionPct = isCantonBadge
            ? Math.min(Math.max((safeValue / Math.max(1, cantonTotalCount)) * 100, 0), 100)
            : (badge.isMastered ? 100 : Math.min(Math.max(Number(badge.progressInLevel || 0), 0), 100));
        const unlocked = isCantonBadge ? safeValue >= cantonTotalCount : badge.isMastered;
        if (unlocked) article.classList.add('unlocked');
        if (badge.isMastered && !isCantonBadge) article.classList.add('badge-card--mastered');
        const currentText = isCantonBadge
            ? `${Math.round(safeValue)}`
            : (typeof badge.formatter === 'function' ? badge.formatter(safeValue) : `${safeValue}`);
        const targetText = isCantonBadge
            ? `${cantonTotalCount}`
            : (typeof badge.formatter === 'function' ? badge.formatter(safeTarget) : `${safeTarget}`);
        const statusText = unlocked ? copy.ui.mastered : t('dynamic.badgePending');
        const nextText = !isCantonBadge && badge.nextTarget !== null && Number.isFinite(badge.nextTarget)
            ? copy.ui.next(typeof badge.formatter === 'function' ? badge.formatter(badge.nextTarget) : String(badge.nextTarget))
            : null;
        const cantonListText = isCantonBadge
            ? (badge.cantonSequence || []).slice(0, Math.round(safeValue)).join(' · ')
            : '';
        article.innerHTML = `
            <p class="badge-category">${badge.category}</p>
            <h3>${badge.title}</h3>
            <p class="badge-level">${isCantonBadge ? `${Math.round(safeValue)}/${cantonTotalCount}` : badge.levelLabel}</p>
            <p class="badge-subtitle">${badge.subtitle}</p>
            <div class="badge-progress-meta">
                <span>${currentText}</span>
                <span>${targetText}</span>
            </div>
            <div class="badge-progress-line" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${completionPct.toFixed(1)}">
                <span style="width:${completionPct.toFixed(1)}%"></span>
            </div>
            <p class="badge-status">${statusText} · ${completionPct.toFixed(1)}%</p>
            ${isCantonBadge ? `<p class="badge-next">${cantonListText || t('dynamic.badgePending')}</p>` : (nextText ? `<p class="badge-next">${nextText}</p>` : '<p class="badge-mastered-mark">★</p>')}
        `;
        grid.appendChild(article);
    });

    const hiddenSection = document.getElementById('hiddenProgressSection');
    const hiddenGrid = document.getElementById('hiddenBadgeGrid');
    if (hiddenSection && hiddenGrid) {
        const hiddenDefinitions = getHiddenProgressDefinitions(locale).filter(definition => unlockedProgressIds.has(definition.id));
        hiddenGrid.innerHTML = '';
        if (!hiddenDefinitions.length) {
            hiddenSection.hidden = true;
            return;
        }

        const hiddenEyebrow = hiddenSection.querySelector('.section-title .eyebrow');
        const hiddenHeading = hiddenSection.querySelector('.section-title h2');
        if (hiddenEyebrow) hiddenEyebrow.textContent = hiddenCopy.title;
        if (hiddenHeading) hiddenHeading.textContent = hiddenCopy.title;

        hiddenDefinitions.forEach(definition => {
            const article = document.createElement('article');
            article.className = 'badge-card badge-card--mastered unlocked hidden-badge-card';
            article.innerHTML = `
                <p class="badge-category">${hiddenCopy.title}</p>
                <h3>${definition.title}</h3>
                <p class="badge-level">${definition.status}</p>
                <p class="badge-subtitle">${definition.subtitle}</p>
                <div class="badge-progress-meta">
                    <span>1</span>
                    <span>1</span>
                </div>
                <div class="badge-progress-line" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100">
                    <span style="width:100%"></span>
                </div>
                <p class="badge-status">${definition.status} · 100%</p>
            `;
            hiddenGrid.appendChild(article);
        });
        hiddenSection.hidden = false;
    }
}
function showVisitorMarker(position) {
    if (!mapInstance || !position) return;
    const coords = [position.coords.latitude, position.coords.longitude];
    latestVisitorCoord = L.latLng(coords[0], coords[1]);
    if (visitorMarker) visitorMarker.setLatLng(coords);
    else visitorMarker = L.marker(coords, { icon: L.divIcon({ className: 'visitor-icon', html: '<span class="user-location-icon" aria-hidden="true">👤</span>', iconSize: [28, 28], iconAnchor: [14, 14] }) }).addTo(mapInstance).bindPopup(currentLanguage === 'en' ? 'Your position' : currentLanguage === 'de' ? 'Deine Position' : 'La tua posizione');
}
function initPage() {
    const page = document.body.dataset.page;
    if (!page) return;
    switch (page) {
        case 'home': initHomePage(); break;
        case 'live': initLivePage(); break;
        case 'dashboard': initDashboardPage(); break;
        case 'gallery': initGalleryPage(); break;
        case 'diary': initDiaryPage(); break;
        case 'timeline': initTimelinePage(); break;
        case 'admin': initAdminPage(); break;
        case 'replay': initReplayPage(); break;
        case 'progress': initProgressPage(); break;
        default: initializeTheme(); break;
    }
}
document.addEventListener('DOMContentLoaded', initPage);
