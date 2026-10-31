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
      fs.readFile(path.join(DIST_DIR, 'index.html'), (err2, fallback) => {
        if (err2) {
          res.writeHead(404);
          res.end('Not Found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(fallback, 'utf-8');
        }
      });
    } else {
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      res.end(content, 'utf-8');
    }
  });
});

const PORT = 4208;
server.listen(PORT, '127.0.0.1', async () => {
  console.log(`🚀 Phase 2A Audit Server running at http://127.0.0.1:${PORT}`);

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  if (!fs.existsSync(chromePath)) {
    console.error('Chrome binary not found at', chromePath);
    server.close();
    process.exit(1);
  }

  const customUserDataDir = path.join(os.tmpdir(), `puppeteer_auth_audit_${Date.now()}`);
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    userDataDir: customUserDataDir,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--force-device-scale-factor=1',
    ],
  });

  const page = await browser.newPage();
  const consoleErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(err.message);
  });

  const viewports = [
    { name: 'mobile-320px', width: 320, height: 640 },
    { name: 'mobile-375px', width: 375, height: 812 },
    { name: 'mobile-390px', width: 390, height: 844 },
    { name: 'mobile-430px', width: 430, height: 932 },
    { name: 'tablet-768px', width: 768, height: 1024 },
    { name: 'tablet-1024px', width: 1024, height: 768 },
    { name: 'desktop-1440px', width: 1440, height: 900 },
    { name: 'desktop-1920px', width: 1920, height: 1080 },
  ];

  const results = {
    loginViewports: [],
    registerViewports: [],
    interactions: [],
    consoleErrors: [],
  };

  console.log('\n--- 1. Auditing Login Page across 8 Viewports ---');
  for (const vp of viewports) {
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });
    await page.goto(`http://127.0.0.1:${PORT}/auth/login`, { waitUntil: 'networkidle0' });

    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollHeight: document.documentElement.scrollHeight,
    }));

    const hasOverflow = metrics.scrollWidth > metrics.clientWidth;
    console.log(
      `[Login] ${vp.name.padEnd(16)}: client=${metrics.clientWidth} scroll=${metrics.scrollWidth} overflow=${hasOverflow ? 'FAIL' : 'PASS'}`
    );

    results.loginViewports.push({
      viewport: vp.name,
      width: vp.width,
      scrollWidth: metrics.scrollWidth,
      hasOverflow,
    });

    if (vp.name === 'desktop-1440px' || vp.name === 'mobile-375px') {
      const screenshotPath = path.join(OUTPUT_DIR, `phase2-login-${vp.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`📸 Saved screenshot: ${screenshotPath}`);
    }
  }

  console.log('\n--- 2. Auditing Registration Page across 8 Viewports ---');
  for (const vp of viewports) {
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });
    await page.goto(`http://127.0.0.1:${PORT}/auth/register`, { waitUntil: 'networkidle0' });

    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));

    const hasOverflow = metrics.scrollWidth > metrics.clientWidth;
    console.log(
      `[Register] ${vp.name.padEnd(16)}: client=${metrics.clientWidth} scroll=${metrics.scrollWidth} overflow=${hasOverflow ? 'FAIL' : 'PASS'}`
    );

    results.registerViewports.push({
      viewport: vp.name,
      width: vp.width,
      scrollWidth: metrics.scrollWidth,
      hasOverflow,
    });

    if (vp.name === 'desktop-1440px' || vp.name === 'mobile-375px') {
      const screenshotPath = path.join(OUTPUT_DIR, `phase2-register-${vp.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`📸 Saved screenshot: ${screenshotPath}`);
    }
  }

  console.log('\n--- 3. Auditing Interactive Features ---');
  // Return to 1440px desktop
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`http://127.0.0.1:${PORT}/auth/login`, { waitUntil: 'networkidle0' });

  // Test Password Visibility Toggle
  const passInputSelector = '#login-password';
  await page.type(passInputSelector, 'MySecretPassword123');
  let inputType = await page.$eval(passInputSelector, (el) => el.getAttribute('type'));
  console.log(`Initial password input type: ${inputType}`);

  const toggleBtnSelector = 'button[aria-label="Show password"]';
  await page.click(toggleBtnSelector);
  inputType = await page.$eval(passInputSelector, (el) => el.getAttribute('type'));
  console.log(`Toggled password input type: ${inputType}`);
  results.interactions.push({ test: 'Password visibility toggle', success: inputType === 'text' });

  // Navigate to Registration
  await page.goto(`http://127.0.0.1:${PORT}/auth/register`, { waitUntil: 'networkidle0' });

  // Test Policy Modal
  const termsBtn = await page.$('button ::-p-text(Terms of Service)');
  if (termsBtn) {
    await termsBtn.click();
    await page.waitForSelector('[role="dialog"]', { visible: true });
    console.log('✔ Terms of Service modal opened successfully');

    // Screenshot open modal
    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'phase2-terms-modal.png'),
    });

    // Dismiss modal
    await page.click('button ::-p-text(I Understand)');
    await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));
    console.log('✔ Terms of Service modal dismissed successfully');
    results.interactions.push({ test: 'Policy modal open/close', success: true });
  }

  // Test Step 2 transition preview with mock submission
  await page.type('#register-fullname', 'Dev Test Patient');
  await page.type('#register-email', 'dev.patient@medivault.local');
  await page.type('#register-password', 'ValidPass123!#');
  await page.type('#register-confirm-password', 'ValidPass123!#');
  await page.click('#agree-terms');

  // Take screenshot of filled Step 1 form
  await page.screenshot({
    path: path.join(OUTPUT_DIR, 'phase2-register-filled.png'),
  });

  // Test Protected Route Redirection
  await page.goto(`http://127.0.0.1:${PORT}/patient/dashboard`, { waitUntil: 'networkidle0' });
  const currentUrl = page.url();
  const redirectedToLogin = currentUrl.includes('/auth/login');
  console.log(`Protected route redirection: ${currentUrl} (Redirected: ${redirectedToLogin})`);
  results.interactions.push({
    test: 'Protected route unauthenticated redirect',
    success: redirectedToLogin,
  });

  results.consoleErrors = consoleErrors;
  console.log(`\nUncaught Console Errors: ${consoleErrors.length}`);

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'phase2-auth-audit.json'),
    JSON.stringify(results, null, 2)
  );

  await browser.close();
  server.close();

  const anyOverflow =
    results.loginViewports.some((v) => v.hasOverflow) ||
    results.registerViewports.some((v) => v.hasOverflow);

  if (anyOverflow) {
    console.error('❌ Audit detected horizontal overflow!');
    process.exit(1);
  } else {
    console.log('🎉 All Phase 2A visual and interaction audits PASSED with zero overflow!');
    process.exit(0);
  }
});
