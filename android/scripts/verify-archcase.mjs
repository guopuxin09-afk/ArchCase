import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const project = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.ARCHCASE_PLAYWRIGHT_PATH || 'playwright');
const webRoot = path.join(project, 'www');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png' };
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const filename = path.resolve(webRoot, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!filename.startsWith(webRoot + path.sep)) { res.writeHead(403).end(); return; }
    const content = await readFile(filename);
    res.writeHead(200, { 'Content-Type': mime[path.extname(filename)] || 'application/octet-stream' });
    res.end(content);
  } catch (_) { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}/`;
const output = path.join(project, 'output');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const reports = [];

async function inspect(name, viewport, insets, testInteractions = false, online = false) {
  const context = await browser.newContext({ viewport, isMobile: viewport.width < 1000, hasTouch: viewport.width < 1000, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const errors = [], externalRequests = [], failedLocalRequests = [];
  if (!online) await context.addInitScript(() => Object.defineProperty(Navigator.prototype, 'onLine', { get: () => false, configurable: true }));
  await context.route('**/*', route => {
    if (new URL(route.request().url()).hostname === '127.0.0.1') return route.continue();
    externalRequests.push(route.request().url());
    return online ? route.continue() : route.abort();
  });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (new URL(response.url()).hostname === '127.0.0.1' && response.status() >= 400) failedLocalRequests.push(response.url()); });
  try {
    await page.goto(url, { waitUntil: 'load' });
    await page.evaluate(({ top, right, bottom, left }) => {
      for (const [side, value] of Object.entries({ top, right, bottom, left })) document.documentElement.style.setProperty(`--safe-area-inset-${side}`, `${value}px`);
    }, insets);
    await page.waitForFunction(() => document.querySelectorAll('.leaflet-countries-pane path').length >= 170, { timeout: 12000 });
    await page.waitForFunction(() => document.querySelector('#network-status').hidden);
    assert.equal(await page.locator('#case-list .case-row').count(), 221);
    assert.equal(await page.locator('#categories input').count(), 12);
    assert.ok(await page.locator('.leaflet-marker-icon').count() > 0);
    const layout = await page.evaluate(() => {
      const atlas = document.querySelector('.atlas').getBoundingClientRect();
      const workspace = document.querySelector('#workspace').getBoundingClientRect();
      const sidebar = document.querySelector('#sidebar').getBoundingClientRect();
      return { width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth, atlas: { top: atlas.top, left: atlas.left, right: atlas.right, bottom: atlas.bottom }, workspace: { width: workspace.width, height: workspace.height }, sidebar: { top: sidebar.top, left: sidebar.left, width: sidebar.width }, countries: document.querySelectorAll('.leaflet-countries-pane path').length };
    });
    assert.ok(layout.scrollWidth <= viewport.width + 1, `Horizontal overflow: ${JSON.stringify(layout)}`);
    assert.ok(Math.abs(layout.atlas.top - insets.top) <= 1);
    assert.ok(Math.abs(layout.atlas.bottom - (viewport.height - insets.bottom)) <= 1);
    assert.ok(Math.abs(layout.atlas.left - insets.left) <= 1);
    assert.ok(Math.abs(layout.atlas.right - (viewport.width - insets.right)) <= 1);
    if (testInteractions) {
      await page.locator('#search').fill('巴塞罗那');
      await page.waitForFunction(() => document.querySelectorAll('#case-list .case-row').length === 5);
      assert.equal(await page.locator('#case-list .case-row').count(), 5);
      await page.locator('#clear-search').click();
      await page.waitForFunction(() => document.querySelectorAll('#case-list .case-row').length === 221);
      await page.locator('#select-none').click();
      assert.equal(await page.locator('#case-list .case-row').count(), 0);
      await page.locator('#select-all').click();
      assert.equal(await page.locator('#case-list .case-row').count(), 221);
      await page.locator('[data-language="en"]').click();
      assert.equal(await page.locator('html').getAttribute('lang'), 'en');
      await page.locator('[data-theme-value="dark"]').click();
      assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
      await page.locator('#case-list .case-row button').first().click();
      await page.waitForFunction(() => document.querySelector('#hover-preview').hidden === false || document.querySelector('#fallback-detail').hidden === false);
      if (viewport.height > viewport.width) {
        const before = await page.locator('#sidebar').boundingBox();
        await page.locator('#sheet-handle').click();
        const after = await page.locator('#sidebar').boundingBox();
        assert.ok(Math.abs(before.y - after.y) > 40, 'Bottom sheet did not change detent.');
      }
      await page.reload({ waitUntil: 'load' });
      await page.waitForFunction(() => document.querySelectorAll('.leaflet-countries-pane path').length >= 170);
      assert.equal(await page.locator('html').getAttribute('lang'), 'en');
      assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
      await page.locator('[data-theme-value="light"]').click();
      await page.locator('[data-language="zh"]').click();
    }
    if (online) {
      await page.waitForFunction(() => document.querySelector('#base-caption').textContent === '在线街道底图', { timeout: 25000 });
      assert.ok(await page.locator('.leaflet-tile-loaded').count() > 0, 'Online street tiles did not load.');
    }
    await page.evaluate(({ top, right, bottom, left }) => {
      for (const [side, value] of Object.entries({ top, right, bottom, left })) document.documentElement.style.setProperty(`--safe-area-inset-${side}`, `${value}px`);
    }, insets);
    await page.screenshot({ path: path.join(output, `${name}.png`) });
    assert.deepEqual(errors, []);
    assert.deepEqual(failedLocalRequests, []);
    if (!online) assert.equal(externalRequests.length, 0, 'Offline startup requested a remote resource.');
    reports.push({ name, offline: !online, viewport, insets, layout, interactions: testInteractions, errors, failedLocalRequests, externalRequestCount: externalRequests.length });
    console.log(`${name}: passed`);
  } catch (error) {
    await page.screenshot({ path: path.join(output, `${name}-failed.png`) }).catch(() => {});
    console.error(JSON.stringify({ name, errors, failedLocalRequests, externalRequests }));
    throw error;
  } finally { await context.close(); }
}

try {
  await inspect('mobile-offline', { width: 390, height: 844 }, { top: 28, right: 0, bottom: 24, left: 0 }, true);
  await inspect('small-phone-offline', { width: 360, height: 640 }, { top: 24, right: 0, bottom: 24, left: 0 });
  await inspect('landscape-offline', { width: 844, height: 390 }, { top: 0, right: 28, bottom: 16, left: 28 });
  await inspect('desktop-offline', { width: 1280, height: 800 }, { top: 0, right: 0, bottom: 0, left: 0 });
  if (process.argv.includes('--online')) await inspect('mobile-online', { width: 390, height: 844 }, { top: 28, right: 0, bottom: 24, left: 0 }, false, true);
  await writeFile(path.join(output, 'web-verification.json'), JSON.stringify({ testedAt: new Date().toISOString(), method: 'Headless Chromium; fresh contexts, all external requests blocked, offline navigator, simulated safe areas. Native Android device behavior is not covered.', reports }, null, 2));
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
