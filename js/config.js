(function () {
    const config = {
        firebaseURL: 'https://northline-a4eaa-default-rtdb.europe-west1.firebasedatabase.app/litrack/points.json',
        plannedStartDateIso: '2026-08-01T04:00:00+02:00',
        contentDatabasePath: 'content',
        trackerDataUrl: 'data/Horizon.gpx',
        defaultCenter: [46.0, 8.9],
        defaultZoom: 12,
        adminSessionKey: 'horizon-admin-authenticated',
        supportedLanguages: ['en', 'it', 'de', 'fr'],
        defaultLanguage: 'en',
        languageStorageKey: 'horizon-language'
    };

    window.HorizonConfig = Object.assign(window.HorizonConfig || {}, config);
    window.NorthLineConfig = window.HorizonConfig;
})();
