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
  const home = read('index.html');
  const live = read('live.html');

  expect('bootstrap loads the runtime entrypoint', script.includes('window.HorizonRuntime') && script.includes('runtime.init()'));
  expect('app init stays guarded', app.includes('if (app._initialized)') && app.includes('app.startHomeRefreshScheduler'));
  expect('config holds the expedition start date in one place', config.includes('startDateIso') && config.includes('2026-08-31T04:00:00+02:00'));
  expect('single-owner home refresh is guarded', app.includes('homeRefreshTimerId') && app.includes('if (app.homeRefreshTimerId)'));

  expect('homepage canonical URL points to HorizonWeb', home.includes('https://damzan06.github.io/HorizonWeb/'));
  expect('live canonical URL points to HorizonWeb', live.includes('https://damzan06.github.io/HorizonWeb/live.html'));

  console.log('All smoke checks passed.');
}

try {
  run();
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}
