const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const outDir = path.join(__dirname, '../.screenshots');
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(1200);

  const sections = [
    { label: 'hero',     y: 0 },
    { label: 'profile',  y: 900 },
    { label: 'services', y: 1700 },
    { label: 'approach', y: 2500 },
    { label: 'contact',  y: 3400 },
  ];

  for (const { label, y } of sections) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(outDir, `section-${label}.png`) });
    console.log('saved:', label);
  }

  await browser.close();
})();
