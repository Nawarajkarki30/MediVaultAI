import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, '../frontend/dist');
const OUTPUT_DIR = path.resolve(__dirname, '../docs/screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Simple static file server
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || !path.extname(reqPath)) {
    reqPath = '/index.html';
  }

  const filePath = path.join(DIST_DIR, reqPath);
  const ext = path.extname(filePath).toLowerCase();

  fs.readFile(filePath, (err, content) => {
    if (err) {
      fs.readFile(path.join(DIST_DIR, 'index.html'), (err2, fallbackContent) => {
        if (err2) {
          res.writeHead(404);
          res.end('Not Found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(fallbackContent, 'utf-8');
        }
      });
    } else {
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      res.end(content, 'utf-8');
    }
  });
});

const PORT = 4206;
server.listen(PORT, '127.0.0.1', async () => {
  console.log(`🚀 Audit static server listening at http://127.0.0.1:${PORT}`);

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const auditResults = {
    viewports: [],
    interactions: [],
    consoleErrors: [],
    overflows: [],
  };

  let browser;
  try {
    const tmpDir = path.join(os.tmpdir(), 'pup_audit_' + Date.now());
    browser = await puppeteer.launch({
      executablePath: chromePath,
      userDataDir: tmpDir,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--force-device-scale-factor=1',
      ],
    });

    const page = await browser.newPage();

    // Listen for browser console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        auditResults.consoleErrors.push(msg.text());
        console.error('Browser console error:', msg.text());
      }
    });

    page.on('pageerror', (err) => {
      auditResults.consoleErrors.push(err.message);
      console.error('Browser uncaught error:', err.message);
    });

    // 1. Audit Viewports
    const viewports = [
      { name: 'mobile-320px', width: 320, height: 800, isMobile: true },
      { name: 'mobile-375px', width: 375, height: 812, isMobile: true },
      { name: 'mobile-390px', width: 390, height: 844, isMobile: true },
      { name: 'mobile-430px', width: 430, height: 932, isMobile: true },
      { name: 'tablet-768px', width: 768, height: 1024, isMobile: false },
      { name: 'tablet-1024px', width: 1024, height: 768, isMobile: false },
      { name: 'desktop-1280px', width: 1280, height: 900, isMobile: false },
      { name: 'desktop-1440px', width: 1440, height: 900, isMobile: false },
      { name: 'desktop-1920px', width: 1920, height: 1080, isMobile: false },
    ];

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile, deviceScaleFactor: 1 });
      await page.goto(`http://127.0.0.1:${PORT}`, { waitUntil: 'networkidle0' });

      // Check horizontal overflow (scrollWidth should match window.innerWidth)
      const overflowMetrics = await page.evaluate(() => {
        const sw = document.documentElement.scrollWidth;
        const cw = document.documentElement.clientWidth;
        const iw = window.innerWidth;
        const hasOverflow = sw > iw;
        return { sw, cw, iw, hasOverflow };
      });

      if (overflowMetrics.hasOverflow) {
        auditResults.overflows.push({
          viewport: vp.name,
          windowWidth: vp.width,
          scrollWidth: overflowMetrics.sw,
        });
      }

      const screenshotPath = path.join(OUTPUT_DIR, `${vp.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      auditResults.viewports.push({
        name: vp.name,
        width: vp.width,
        height: vp.height,
        overflow: overflowMetrics.hasOverflow,
        scrollWidth: overflowMetrics.sw,
      });

      console.log(`✓ ${vp.name} verified (overflow: ${overflowMetrics.hasOverflow ? 'YES - FAIL' : 'NO - PASS'}, scrollWidth=${overflowMetrics.sw})`);
    }

    // 2. Functional Interactions Audit
    console.log('\n--- Auditing User Interactions ---');
    await page.setViewport({ width: 1280, height: 900, isMobile: false, deviceScaleFactor: 1 });
    await page.goto(`http://127.0.0.1:${PORT}`, { waitUntil: 'networkidle0' });

    // Click "Blood Test Report" in Dashboard Preview to open modal
    const reportButton = await page.waitForSelector('button[title*="simulated AI explanation"]');
    if (reportButton) {
      await reportButton.click();
      await page.waitForSelector('#explanation-modal');
      const modalTitle = await page.$eval('#explanation-dialog-title', el => el.textContent);
      console.log(`✓ Modal opened successfully: "${modalTitle}"`);
      auditResults.interactions.push({ interaction: 'Open Report Preview Modal', success: modalTitle.includes('Blood Test') });

      // Take screenshot of open modal
      await page.screenshot({ path: path.join(OUTPUT_DIR, 'modal-open-english.png') });

      // Toggle to Nepali
      const buttons = await page.$$('button');
      for (const btn of buttons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && text.includes('नेपाली')) {
          await btn.click();
          break;
        }
      }
      await new Promise(r => setTimeout(r, 200));
      const nepaliTextPresent = await page.evaluate(() => document.body.innerText.includes('सरल नेपालीमा सारांश'));
      console.log(`✓ Nepali language toggle verified: ${nepaliTextPresent ? 'PASS' : 'FAIL'}`);
      auditResults.interactions.push({ interaction: 'Nepali Language Toggle', success: nepaliTextPresent });
      await page.screenshot({ path: path.join(OUTPUT_DIR, 'modal-open-nepali.png') });

      // Close modal using close button
      const closeBtn = await page.waitForSelector('button[aria-label="Close modal"]');
      if (closeBtn) {
        await closeBtn.click();
        await new Promise(r => setTimeout(r, 400));
        const modalClosed = !(await page.$('#explanation-modal'));
        console.log(`✓ Modal closed with close button: ${modalClosed ? 'PASS' : 'FAIL'}`);
        auditResults.interactions.push({ interaction: 'Close Modal via Close Button', success: modalClosed });
      }

      // Reopen modal to test Escape key dismissal
      const reportButton2 = await page.waitForSelector('button[title*="simulated AI explanation"]');
      await reportButton2.click();
      await page.waitForSelector('#explanation-modal');
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 400));
      const modalClosedByEscape = !(await page.$('#explanation-modal'));
      console.log(`✓ Modal closed with Escape key: ${modalClosedByEscape ? 'PASS' : 'FAIL'}`);
      auditResults.interactions.push({ interaction: 'Close Modal via Escape Key', success: modalClosedByEscape });
    }

    // Test Navigation to /auth/login
    const loginLink = await page.waitForSelector('a[href="/auth/login"]');
    if (loginLink) {
      await loginLink.click();
      await new Promise(r => setTimeout(r, 300));
      const currentUrl = page.url();
      const pageHeading = await page.$eval('h1', el => el.textContent);
      const isPrototypeNoticePresent = await page.evaluate(() => document.body.innerText.includes('Phase 1 Prototype — Coming Soon'));
      console.log(`✓ Log in navigation: URL=${currentUrl}, Heading="${pageHeading}", PrototypeNotice=${isPrototypeNoticePresent}`);
      auditResults.interactions.push({ interaction: 'Navigate to /auth/login', success: currentUrl.includes('/auth/login') && isPrototypeNoticePresent });
      await page.screenshot({ path: path.join(OUTPUT_DIR, 'auth-login.png') });
    }

    // Test Browser Back
    await page.goBack({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 300));
    const isBackAtHome = page.url() === `http://127.0.0.1:${PORT}/` || page.url() === `http://127.0.0.1:${PORT}`;
    console.log(`✓ Browser Back navigation verified: ${isBackAtHome ? 'PASS' : 'FAIL'}`);
    auditResults.interactions.push({ interaction: 'Browser Back Navigation', success: isBackAtHome });

    // Test Get Started button navigation to /auth/register
    const getStartedButton = await page.waitForSelector('a[href="/auth/register"]');
    if (getStartedButton) {
      await getStartedButton.click();
      await new Promise(r => setTimeout(r, 300));
      const registerUrl = page.url();
      const registerHeading = await page.$eval('h1', el => el.textContent);
      console.log(`✓ Get Started -> Sign up navigation: URL=${registerUrl}, Heading="${registerHeading}"`);
      auditResults.interactions.push({ interaction: 'Get Started -> /auth/register', success: registerUrl.includes('/auth/register') && registerHeading.includes('Create an Account') });
      await page.screenshot({ path: path.join(OUTPUT_DIR, 'auth-register.png') });
    }

    // Return to home
    await page.goto(`http://127.0.0.1:${PORT}`, { waitUntil: 'networkidle0' });

    // Test Mobile Navigation Drawer at 375px
    await page.setViewport({ width: 375, height: 812, isMobile: true, deviceScaleFactor: 1 });
    await page.goto(`http://127.0.0.1:${PORT}`, { waitUntil: 'networkidle0' });
    const menuButton = await page.waitForSelector('button[aria-label="Open main menu"]');
    if (menuButton) {
      await menuButton.click();
      await page.waitForSelector('div[aria-label="Mobile Navigation"]');
      console.log(`✓ Mobile drawer open interaction: PASS`);
      auditResults.interactions.push({ interaction: 'Open Mobile Menu Drawer', success: true });
      await page.screenshot({ path: path.join(OUTPUT_DIR, 'mobile-drawer-open.png') });

      // Dismiss drawer via Escape key
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 400));
      const drawerDismissed = !(await page.$('div[aria-label="Mobile Navigation"]'));
      console.log(`✓ Mobile drawer dismiss via Escape: ${drawerDismissed ? 'PASS' : 'FAIL'}`);
      auditResults.interactions.push({ interaction: 'Dismiss Mobile Drawer via Escape', success: drawerDismissed });
    }

    // Save structured audit log
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'audit-results.json'),
      JSON.stringify(auditResults, null, 2),
      'utf-8'
    );
    console.log('\n✅ Interactive visual & functional audit completed!');
  } catch (error) {
    console.error('Audit execution error:', error);
  } finally {
    if (browser) await browser.close();
    server.close(() => {
      console.log('Audit server shut down.');
      process.exit(0);
    });
  }
});
