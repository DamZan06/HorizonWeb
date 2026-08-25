(function () {
    const config = {
        firebaseURL: 'https://northline-a4eaa-default-rtdb.europe-west1.firebasedatabase.app/livetrack/points.json',
        plannedStartDateIso: '2026-08-01T04:00:00+02:00',
        contentDatabasePath: 'content',
        trackerDataUrl: 'data/NorthLine_trackers.json',
        defaultCenter: [46.0, 8.9],
        defaultZoom: 12,
        adminSessionKey: 'northline-admin-authenticated',
        supportedLanguages: ['it', 'en', 'de'],
        defaultLanguage: 'it',
        languageStorageKey: 'northline-language'
    };

    window.NorthLineConfig = Object.assign(window.NorthLineConfig || {}, config);
})();
