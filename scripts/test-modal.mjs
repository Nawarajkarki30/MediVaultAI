import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
import puppeteer from 'puppeteer-core';

const DIST_DIR = path.resolve(process.cwd(), 'frontend/dist');

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

server.listen(4204, '127.0.0.1', async () => {
  const tmpDir = path.join(os.tmpdir(), 'pup_modal_' + Date.now());
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    userDataDir: tmpDir,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto('http://127.0.0.1:4204', { waitUntil: 'networkidle0' });

  // 1. Open modal
  const reportBtn = await page.waitForSelector('button[title*="simulated AI explanation"]');
  console.log('Report button found: true');
  await reportBtn.click();
  await page.waitForSelector('#explanation-modal');
  console.log('Explanation modal opened: true');

  // 2. Click close button
  const closeBtn = await page.waitForSelector('button[aria-label="Close modal"]');
  console.log('Close button found: true');
  await closeBtn.click();
  await new Promise((r) => setTimeout(r, 400));
  const isClosed1 = !(await page.$('#explanation-modal'));
  console.log('Dialog closed after close button click:', isClosed1);

  // 3. Reopen & test Escape key
  const reportBtn2 = await page.waitForSelector('button[title*="simulated AI explanation"]');
  await reportBtn2.click();
  await page.waitForSelector('#explanation-modal');
  console.log('Explanation modal reopened: true');

  // Close by pressing Escape key
  await page.keyboard.press('Escape');
  await new Promise((r) => setTimeout(r, 400));
  const isClosed2 = !(await page.$('#explanation-modal'));
  console.log('Dialog closed after Escape key:', isClosed2);

  // 4. Reopen to test bottom close button
  const reportBtn3 = await page.waitForSelector('button[title*="simulated AI explanation"]');
  await reportBtn3.click();
  await page.waitForSelector('#explanation-modal');

  const bottomCloseBtn = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find((b) => b.textContent.includes('Close Preview'));
  });
  await bottomCloseBtn.click();
  await new Promise((r) => setTimeout(r, 400));
  const isClosed3 = !(await page.$('#explanation-modal'));
  console.log('Dialog closed after bottom close button:', isClosed3);

  await browser.close();
  server.close();
  process.exit(0);
});
