/**
 * Usage: node scripts/screenshot.js [label]
 * Takes a viewport screenshot + full-page screenshot of localhost:3000
 */
const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const label = process.argv[2] || 'snap';
const outDir = path.join(__dirname, '../.screenshots');
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'load', timeout: 60000 });

  // wait for hero logo reveal animation to start
  await page.waitForTimeout(1500);

  // Above-the-fold
  const fold = path.join(outDir, `${label}-fold.png`);
  await page.screenshot({ path: fold });
  console.log('saved:', fold);

  // Full page
  const full = path.join(outDir, `${label}-full.png`);
  await page.screenshot({ path: full, fullPage: true });
  console.log('saved:', full);

  await browser.close();
})();
