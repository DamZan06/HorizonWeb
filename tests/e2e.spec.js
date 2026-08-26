const { test, expect } = require('@playwright/test');

function pageErrors(page) {
  const errors = [];

  page.on('pageerror', (error) => {
    errors.push(`pageerror:${error.message}`);
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (text.includes('Failed to load resource') && text.includes('tile.openstreetmap.org')) {
        return;
      }
      errors.push(`console:${text}`);
    }
  });

  page.on('response', (response) => {
    if (response.status() >= 400) {
      const url = response.url();
      if (url.startsWith('http://localhost:4173/') || url.startsWith('https://localhost:4173/')) {
        errors.push(`network:${response.status()} ${url}`);
      }
    }
  });

  return errors;
}

async function runPageChecks(page, url, expectedTitle) {
  const errors = pageErrors(page);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);

  await expect(page).toHaveTitle(new RegExp(expectedTitle, 'i'));
  const navLinks = await page.locator('nav a').allTextContents();
  expect(navLinks.length).toBeGreaterThan(0);
  expect(errors).toEqual([]);
}

test.describe('HORIZON site smoke E2E', () => {
  test('home page loads without browser errors', async ({ page }) => {
    await runPageChecks(page, 'http://localhost:4173/index.html', 'HORIZON');
    await expect(page.locator('#countdownDays')).toBeVisible();
    await expect(page.locator('#countdownHours')).toBeVisible();
  });

  test('live page loads and renders the map shell', async ({ page }) => {
    await runPageChecks(page, 'http://localhost:4173/live.html', 'Live Expedition');
    await expect(page.locator('#map')).toBeVisible();
    await expect(page.locator('.map-status')).toBeVisible();
  });

  test('project page loads', async ({ page }) => {
    await runPageChecks(page, 'http://localhost:4173/project.html', 'HORIZON');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('gallery page loads', async ({ page }) => {
    await runPageChecks(page, 'http://localhost:4173/gallery.html', 'Field Notes');
    await expect(page.locator('.gallery-grid')).toBeVisible();
  });

  test('replay page loads', async ({ page }) => {
    await runPageChecks(page, 'http://localhost:4173/replay.html', 'Replay');
    await expect(page.locator('#replayPlay')).toBeVisible();
  });

  test('dashboard page loads', async ({ page }) => {
    await runPageChecks(page, 'http://localhost:4173/dashboard.html', 'Telemetry');
    await expect(page.locator('canvas')).toHaveCount(4);
  });

  for (const [name, path, heading] of [
    ['progress','progress.html','Badges'], ['diary','diary.html','Field Notes'], ['timeline','timeline.html','Field Notes']
  ]) test(`${name} has a deliberate public outcome`, async ({ page }) => {
    const errors = pageErrors(page); await page.goto(`http://localhost:4173/${path}`); await page.waitForTimeout(300);
    await expect(page.locator('main')).toBeVisible(); await expect(page.locator('body')).toContainText(heading); expect(errors).toEqual([]);
  });

  test('language persists and navigation works', async ({ page }) => {
    await page.goto('http://localhost:4173/index.html');
    await page.locator('.lang-switcher-desktop .lang-switcher-select').selectOption('de');
    await expect(page.locator('.main-nav a').first()).toHaveText('Start');
    await page.reload(); await expect(page.locator('.lang-switcher-desktop .lang-switcher-select')).toHaveValue('de');
    await page.locator('.main-nav a[data-nav-key="live"]').click(); await expect(page).toHaveURL(/live\.html/);
  });

  test('mobile menu opens and closes with Escape', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); await page.goto('http://localhost:4173/index.html');
    const toggle = page.locator('.topbar-menu-toggle'); await toggle.click(); await expect(toggle).toHaveAttribute('aria-expanded','true');
    await page.keyboard.press('Escape'); await expect(toggle).toHaveAttribute('aria-expanded','false');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy();
  });

  test('live controls expose honest empty states', async ({ page }) => {
    await page.goto('http://localhost:4173/live.html'); await page.waitForTimeout(700);
    await expect(page.locator('#distance')).toHaveText('0 km'); await expect(page.locator('#remaining')).toHaveText('500 km');
    await page.locator('#centerLiveBtn').click(); await expect(page.locator('.map-status')).toContainText('No recent live position');
    await expect(page.locator('.leaflet-overlay-pane path').first()).toBeVisible();
  });

  test('gallery modal supports keyboard and focus restoration', async ({ page }) => {
    await page.goto('http://localhost:4173/gallery.html'); await page.evaluate(() => window.HorizonGallery.renderGallery([{ title:'Mock field note', location:'Test route', description:'Fixture', image:'assets/gallery/Night_1.jpg' }])); const trigger = page.locator('.gallery-trigger').first(); await trigger.click();
    await expect(page.locator('.modal-backdrop')).toHaveClass(/is-open/); await page.keyboard.press('Escape');
    await expect(page.locator('.modal-backdrop')).not.toHaveClass(/is-open/); await expect(trigger).toBeFocused();
  });

  test('replay is disabled before recorded data exists', async ({ page }) => {
    await page.goto('http://localhost:4173/replay.html'); await expect(page.locator('#replayPlay')).toBeDisabled();
    await expect(page.locator('#replayStatus')).toContainText('once journey data has been recorded');
  });

  test('countdown handles before and after departure', async ({ page }) => {
    await page.addInitScript(() => { Date.now = () => new Date('2026-08-30T02:00:00Z').getTime(); });
    await page.goto('http://localhost:4173/index.html'); await expect(page.locator('#countdownDays')).toHaveText('01');
    await page.evaluate(() => { Date.now = () => new Date('2026-09-01T02:00:00Z').getTime(); window.HorizonHome.updateCountdown(); });
    await expect(page.locator('#countdownMessage')).toHaveText('HORIZON IS UNDERWAY'); await expect(page.locator('#countdownSeconds')).toHaveText('00');
  });

  test('all supported language choices persist', async ({ page }) => {
    await page.goto('http://localhost:4173/index.html');
    for (const language of ['en','it','de','fr']) { await page.locator('.lang-switcher-desktop select').selectOption(language); await expect(page.locator('html')).toHaveAttribute('lang', language); }
    await page.reload(); await expect(page.locator('html')).toHaveAttribute('lang','fr');
  });

  test('admin fails safely when publishing is not configured', async ({ page }) => {
    const errors = pageErrors(page); await page.goto('http://localhost:4173/admin.html');
    await expect(page.locator('#adminModeLabel')).toContainText('Publishing is disabled');
    await page.locator('#adminLoginForm input[type=password]').fill('fixture'); await page.locator('#adminLoginForm button[type=submit]').click();
    await expect(page.locator('#adminLoginError')).toContainText('unavailable'); expect(errors).toEqual([]);
  });

  for (const viewport of [{width:375,height:667},{width:390,height:844},{width:430,height:932},{width:768,height:1024},{width:1024,height:768},{width:1366,height:768},{width:1440,height:900},{width:1920,height:1080}]) {
    test(`public pages fit ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      for (const path of ['index.html','live.html','project.html','gallery.html','replay.html','dashboard.html','progress.html']) {
        await page.goto(`http://localhost:4173/${path}`, { waitUntil:'domcontentloaded' });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), `${path} overflows`).toBeTruthy();
      }
      for (const path of ['diary.html','timeline.html']) {
        await page.goto(`http://localhost:4173/${path}`); await page.waitForURL(/gallery\.html/);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), `${path} destination overflows`).toBeTruthy();
      }
    });
  }
});
