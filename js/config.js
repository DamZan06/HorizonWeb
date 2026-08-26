(function () {
    const config = {
        projectName: 'HORIZON',
        expeditionYear: 2026,
        startDateIso: '2026-08-31T04:00:00+02:00',
        startLocation: 'Piz Chavalatsch',
        finishLocation: 'Chancy',
        expectedDistanceKm: 500,
        expectedElevationM: 10000,
        trackerDataUrl: 'data/route/Horizon.gpx',
        routeDataCandidates: ['data/route/Horizon.gpx', 'data/route/horizon.gpx'],
        firebaseURL: 'https://horizon-web-default-rtdb.europe-west1.firebasedatabase.app/livetrack/points.json',
        contentDatabasePath: 'content',
        defaultCenter: [46.6, 10.4],
        defaultZoom: 12,
        adminSessionKey: 'horizon-admin-authenticated',
        supportedLanguages: ['en', 'it', 'de', 'fr'],
        defaultLanguage: 'en',
        languageStorageKey: 'horizon-language',
        staleDataThresholdMs: 180000
    };

    window.HorizonConfig = Object.assign(window.HorizonConfig || {}, config);
})();
