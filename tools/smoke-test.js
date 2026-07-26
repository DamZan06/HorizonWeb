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
  const admin = read('admin.html');
  const home = read('index.html');
  const live = read('live.html');

  expect('script contains status normalization', script.includes('function normalizeHomeStatus(status)'));
  expect('script maps STATIONARY/stop to paused', script.includes("value.includes('station')") && script.includes("return 'paused'"));
  expect('script contains live status admin binding', script.includes('function bindAdminLiveStatusForm()'));
  expect('script refreshes home every 8 seconds', script.includes('setInterval(async () =>') && script.includes('}, 8000);'));

  expect('admin page has live status form', admin.includes('id="adminLiveStatusForm"'));
  expect('home page references versioned script', /script\.js\?v=\d+[a-z]/.test(home));
  expect('live page references versioned script', /script\.js\?v=\d+[a-z]/.test(live));

  console.log('All smoke checks passed.');
}

try {
  run();
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}
