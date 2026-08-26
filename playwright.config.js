const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests', timeout: 30000, workers: 1,
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
  webServer: { command: 'node tools/serve.js', url: 'http://127.0.0.1:4173/index.html', reuseExistingServer: true, timeout: 15000 }
});
