import {mkdir} from 'node:fs/promises';
import {dirname, join, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const harnessCheckout = resolve(process.env.DEEPSEEK_HARNESS_CHECKOUT ?? '');
if (harnessCheckout === resolve('')) {
  throw new Error('Set DEEPSEEK_HARNESS_CHECKOUT to the clean Harness checkout used by this smoke test.');
}

const playwrightEntry = join(harnessCheckout, 'apps/web/node_modules/playwright/index.mjs');
const {chromium} = await import(pathToFileURL(playwrightEntry).href);
const baseUrl = process.env.HARNESS_WEB_URL ?? 'http://127.0.0.1:3091';
const executablePath = process.env.REMOTION_BROWSER_EXECUTABLE;
const screenshotPath = resolve(process.env.HARNESS_SCREENSHOT_PATH ?? 'demo/out/harness-plugin-inventory-v0.4.png');
const expectedEntries = ['remotion-video-plugin', 'remotion-video-tools'];
const consoleErrors = [];
const consoleWarnings = [];
const pageErrors = [];
const requestFailures = [];

const browser = await chromium.launch(executablePath ? {executablePath} : {});
try {
  const page = await browser.newPage({viewport: {width: 1680, height: 1000}, locale: 'en-US'});
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
    if (message.type() === 'warning') consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) => {
    requestFailures.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'unknown failure'}`);
  });

  const response = await page.goto(baseUrl, {waitUntil: 'load'});
  if (response === null || response.status() !== 200) {
    throw new Error(`Harness Web returned ${response?.status() ?? 'no response'} for ${baseUrl}.`);
  }
  await page.waitForSelector('[class*="frame"]', {timeout: 30_000});

  const notice = page.getByRole('dialog', {name: 'Internal Testing Notice'});
  await notice.waitFor({timeout: 10_000}).catch(() => undefined);
  if (await notice.count() > 0) {
    await notice.getByRole('button', {name: 'Continue', exact: true}).click();
    await notice.waitFor({state: 'detached', timeout: 10_000});
  }

  const credentialStep = page.getByRole('dialog', {name: 'Add an API key to get started'});
  await credentialStep.waitFor({timeout: 10_000}).catch(() => undefined);
  if (await credentialStep.count() > 0) {
    await credentialStep.getByRole('button', {name: 'Configure later', exact: true}).click();
    await credentialStep.waitFor({state: 'detached', timeout: 10_000});
  }

  await page.getByRole('button', {name: 'Settings', exact: true}).click();
  const settings = page.getByRole('dialog', {name: 'Settings'});
  await settings.waitFor({timeout: 10_000});
  await settings.getByRole('button', {name: 'Plugins', exact: true}).click();
  const pluginList = settings.getByRole('tab', {name: 'Plugin list', exact: true});
  await pluginList.waitFor({timeout: 10_000});
  await pluginList.click();

  const search = settings.getByRole('searchbox', {name: 'Search plugins'});
  await search.waitFor({timeout: 10_000});
  await search.fill('remotion-video');
  const rows = settings.locator('[data-plugin-entry]');
  await rows.first().waitFor({timeout: 10_000});
  if (await rows.count() !== expectedEntries.length) {
    throw new Error(`Expected ${expectedEntries.length} Remotion rows, received ${await rows.count()}.`);
  }

  const inventory = [];
  for (const entryId of expectedEntries) {
    const row = settings.locator(`[data-plugin-entry="${entryId}"]`);
    if (await row.count() !== 1) throw new Error(`Missing unique inventory row ${entryId}.`);
    const button = row.getByRole('button');
    const label = await button.getAttribute('aria-label');
    if (label === null || !label.includes('Mounted') || !label.includes('Enabled')) {
      throw new Error(`Inventory row ${entryId} is not mounted and enabled: ${label ?? '(missing label)'}.`);
    }
    if (await row.locator('[data-phase="active"]').count() !== 1) {
      throw new Error(`Inventory row ${entryId} does not report the active Cordis phase.`);
    }
    if (await row.locator('[data-enabled="true"]').count() !== 1) {
      throw new Error(`Inventory row ${entryId} is not effectively enabled.`);
    }
    await button.click();
    const loaderEntry = await row.locator('[data-loader-entry]').textContent();
    if (loaderEntry !== entryId) throw new Error(`Inventory detail mismatch for ${entryId}: ${loaderEntry}.`);
    inventory.push({entryId, label});
  }

  await mkdir(dirname(screenshotPath), {recursive: true});
  await page.screenshot({path: screenshotPath, fullPage: true});
  const alerts = await page.getByRole('alert').allTextContents();
  if (alerts.length > 0) throw new Error(`Harness Web rendered alerts: ${alerts.join(' | ')}`);
  if (consoleErrors.length > 0 || consoleWarnings.length > 0 || pageErrors.length > 0 || requestFailures.length > 0) {
    throw new Error(JSON.stringify({consoleErrors, consoleWarnings, pageErrors, requestFailures}));
  }

  console.log(JSON.stringify({
    status: 'pass',
    baseUrl,
    httpStatus: response.status(),
    inventory,
    screenshotPath,
    consoleErrors,
    consoleWarnings,
    pageErrors,
    requestFailures,
  }, null, 2));
} finally {
  await browser.close();
}
