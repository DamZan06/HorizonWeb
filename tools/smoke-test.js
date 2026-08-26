const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

function expect(name, condition) {
  if (!condition) {
    throw new Error(`FAIL: ${name}`);
  }
  console.log(`PASS: ${name}`);
}

function run() {
  const app = read('js/app.js');
  const config = read('js/config.js');
  const mapScript = read('js/map.js');
  const firebaseScript = read('js/firebase.js');
  const navScript = read('js/ui/navigation.js');
  const galleryPageScript = read('js/pages/gallery.js');
  const replayPageScript = read('js/pages/replay.js');
  const dashboardPageScript = read('js/pages/dashboard.js');
  const home = read('index.html');
  const live = read('live.html');
  const project = read('project.html');
  const gallery = read('gallery.html');
  const replay = read('replay.html');
  const dashboard = read('dashboard.html');

  expect('app init stays guarded and handles bootstrap responsibilities', app.includes('if (app._initialized)') && app.includes('renderNavigation') && app.includes('setupMobileNavigation'));
  expect('config holds the expedition start date in one place', config.includes('startDateIso') && config.includes('2026-08-31T04:00:00+02:00'));
  expect('home does not use a redundant global refresh scheduler', !app.includes('homeRefreshTimerId'));
  expect('map module is implemented', mapScript.includes('createMap') && mapScript.includes('loadRoute'));
  expect('firebase module is implemented', firebaseScript.includes('fetchLatestLivePoint') && firebaseScript.includes('normalizeLivePoint'));
  expect('navigation module defines a canonical list', navScript.includes('NAV_ITEMS') && navScript.includes('Project') && navScript.includes('Journey'));
  expect('gallery page controller exists', galleryPageScript.includes('HorizonGallery') && galleryPageScript.includes('initGalleryPage'));
  expect('replay page controller exists', replayPageScript.includes('HorizonReplay') && replayPageScript.includes('initReplayPage'));
  expect('dashboard page controller exists', dashboardPageScript.includes('HorizonDashboard') && dashboardPageScript.includes('initDashboardPage'));

  expect('home page has the new public navbar', home.includes('<nav class="main-nav"') && home.includes('>Home</a>') && home.includes('>Project</a>') && home.includes('>Journey</a>') && home.includes('>Replay</a>') && !home.includes('>The challenge</a>') && !home.includes('>Route</a>') && !home.includes('>About</a>'));
  expect('live page has the new public navbar', live.includes('<nav class="main-nav"') && live.includes('>Home</a>') && live.includes('>Project</a>') && live.includes('>Journey</a>') && live.includes('>Replay</a>') && !live.includes('>The challenge</a>') && !live.includes('>Route</a>') && !live.includes('>About</a>'));
  expect('project page matches the new public navbar', project.includes('>Project</a>') && !project.includes('>The challenge</a>'));
  expect('gallery page matches the new public navbar', gallery.includes('>Journey</a>') && !gallery.includes('>About</a>'));
  expect('replay page matches the new public navbar', replay.includes('>Replay</a>') && !replay.includes('>About</a>'));
  expect('home page uses modular CSS entry points', home.includes('css/tokens.css') && home.includes('css/global.css') && home.includes('css/home.css') && !home.includes('style.css'));
  expect('live page uses modular CSS entry points', live.includes('css/tokens.css') && live.includes('css/global.css') && live.includes('css/live.css') && !live.includes('style.css'));
  expect('dashboard page uses modular CSS entry points', dashboard.includes('css/tokens.css') && dashboard.includes('css/global.css') && dashboard.includes('css/dashboard.css') && !dashboard.includes('style.css'));
  expect('page scripts are loaded for gallery/replay/dashboard', gallery.includes('js/pages/gallery.js') && replay.includes('js/pages/replay.js') && dashboard.includes('js/pages/dashboard.js'));
  expect('homepage canonical URL points to HorizonWeb', home.includes('https://damzan06.github.io/HorizonWeb/'));
  expect('live canonical URL points to HorizonWeb', live.includes('https://damzan06.github.io/HorizonWeb/live.html'));
  expect('live page no longer loads Chart.js', !live.includes('chart.js'));
  expect('live page uses a pinned Leaflet version', live.includes('leaflet@1.9.4'));
  expect('no legacy root-level CSS remains in active pages', !home.includes('href="style.css') && !live.includes('href="style.css') && !project.includes('href="style.css') && !gallery.includes('href="style.css') && !replay.includes('href="style.css'));

  console.log('All smoke checks passed.');
}

try {
  run();
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}
