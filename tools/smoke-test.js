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
  const script = read('script.js');
  const app = read('js/app.js');
  const config = read('js/config.js');
  const mapScript = read('js/map.js');
  const firebaseScript = read('js/firebase.js');
  const navScript = read('js/ui/navigation.js');
  const home = read('index.html');
  const live = read('live.html');
  const project = read('project.html');
  const gallery = read('gallery.html');
  const replay = read('replay.html');

  expect('bootstrap is deterministic and does not poll for runtime globals', !script.includes('setInterval') && script.includes('DOMContentLoaded'));
  expect('app init stays guarded', app.includes('if (app._initialized)') && app.includes('app.startHomeRefreshScheduler'));
  expect('config holds the expedition start date in one place', config.includes('startDateIso') && config.includes('2026-08-31T04:00:00+02:00'));
  expect('single-owner home refresh is guarded', app.includes('homeRefreshTimerId') && app.includes('if (app.homeRefreshTimerId)'));
  expect('map module is implemented', mapScript.includes('createMap') && mapScript.includes('loadRoute'));
  expect('firebase module is implemented', firebaseScript.includes('fetchLatestLivePoint') && firebaseScript.includes('normalizeLivePoint'));
  expect('navigation module defines a canonical list', navScript.includes('NAV_ITEMS') && navScript.includes('Project') && navScript.includes('Journey'));

  expect('home page has the new public navbar', home.includes('<nav class="main-nav"') && home.includes('>Home</a>') && home.includes('>Project</a>') && home.includes('>Journey</a>') && home.includes('>Replay</a>') && !home.includes('>The challenge</a>') && !home.includes('>Route</a>') && !home.includes('>About</a>'));
  expect('live page has the new public navbar', live.includes('<nav class="main-nav"') && live.includes('>Home</a>') && live.includes('>Project</a>') && live.includes('>Journey</a>') && live.includes('>Replay</a>') && !live.includes('>The challenge</a>') && !live.includes('>Route</a>') && !live.includes('>About</a>'));
  expect('project page matches the new public navbar', project.includes('>Project</a>') && !project.includes('>The challenge</a>'));
  expect('gallery page matches the new public navbar', gallery.includes('>Journey</a>') && !gallery.includes('>About</a>'));
  expect('replay page matches the new public navbar', replay.includes('>Replay</a>') && !replay.includes('>About</a>'));
  expect('homepage canonical URL points to HorizonWeb', home.includes('https://damzan06.github.io/HorizonWeb/'));
  expect('live canonical URL points to HorizonWeb', live.includes('https://damzan06.github.io/HorizonWeb/live.html'));
  expect('live page no longer loads Chart.js', !live.includes('chart.js'));
  expect('live page uses a pinned Leaflet version', live.includes('leaflet@1.9.4'));

  console.log('All smoke checks passed.');
}

try {
  run();
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}
