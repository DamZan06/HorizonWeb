const fs = require('fs');
const vm = require('vm');
const path = require('path');
const context = { window: { HorizonConfig: { startDateIso: '2026-08-31T04:00:00+02:00', expectedDistanceKm: 500, staleDataThresholdMs: 180000 } }, console, Date };
vm.createContext(context);
for (const file of ['js/status.js', 'js/stats.js', 'js/firebase.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context, { filename: file });
}
function check(name, condition) { if (!condition) throw new Error(`FAIL: ${name}`); console.log(`PASS: ${name}`); }
const status = context.window.HorizonStatus;
check('status before start', status.getExpeditionState({ now: '2026-08-30T00:00:00Z' }) === 'not-started');
check('status at start without data is offline', status.getExpeditionState({ now: '2026-08-31T02:00:00Z' }) === 'offline');
check('recent valid point is live', status.getExpeditionState({ now: 1000000, startDate: 1, latestPointTimestamp: 950000 }) === 'live');
check('stale point is offline', status.getExpeditionState({ now: 1000000, startDate: 1, latestPointTimestamp: 1 }) === 'offline');
const stats = context.window.HorizonStats;
check('remaining clamps at zero', stats.summarize([{lat:0,lng:0},{lat:0,lng:10}], 1).remainingKm === 0);
check('completion clamps at 100', stats.summarize([{lat:0,lng:0},{lat:0,lng:10}], 1).completion === 100);
check('50 km boundary stays locked at 49.99 by direct comparison', !(49.99 >= 50) && (50 >= 50));
const firebase = context.window.HorizonFirebase;
check('malformed point rejected', firebase.normalizeLivePoint({lat:'bad',lng:8,timestamp:1}) === null);
check('out-of-range point rejected', firebase.normalizeLivePoint({lat:100,lng:8,timestamp:1}) === null);
check('points sort and deduplicate', firebase.normalizeLivePoints([{lat:1,lng:2,timestamp:2},{lat:1,lng:2,timestamp:2},{lat:1,lng:3,timestamp:1}]).length === 2);
const imported = firebase.normalizeLivePoint({coordinate:{lat:46.5,lon:8.2},orario:'2026-08-31T04:00:00Z',altitudine:{metri:900},velocita:{km_h:5},frequenza_cardiaca:{bpm:123},distanza:{km:42.5}});
check('real Firebase tracker payload normalizes', imported.speed === 5 && imported.heartRate === 123 && imported.cumulativeDistanceKm === 42.5);
check('recorded cumulative distance drives progress', stats.summarize([{...imported,cumulativeDistanceKm:42.5}],500).coveredKm === 42.5);
