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

server.listen(4202, '127.0.0.1', async () => {
  const tmpDir = path.join(os.tmpdir(), 'pup_modal_' + Date.now());
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    userDataDir: tmpDir,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  page.on('console', (msg) => console.log('BROWSER CONSOLE:', msg.text()));

  await page.setViewport({ width: 1280, height: 900 });
  await page.goto('http://127.0.0.1:4202', { waitUntil: 'networkidle0' });

  // Open modal
  const reportBtn = await page.waitForSelector('button[title*="simulated AI explanation"]');
  await reportBtn.click();
  await page.waitForSelector('div[role="dialog"]');
  console.log('1. Modal is visible');

  // Check what elements are in dialog
  const dialogHtml = await page.evaluate(() => {
    const d = document.querySelector('div[role="dialog"]');
    return d ? { tag: d.tagName, text: d.innerText.slice(0, 100) } : null;
  });
  console.log('Dialog content:', dialogHtml);

  // Click close button using evaluate to check if native click works
  const clickResult = await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Close modal"]');
    if (!btn) return 'BUTTON NOT FOUND';
    btn.click();
    return 'BUTTON CLICKED';
  });
  console.log('Click result:', clickResult);

  await new Promise((r) => setTimeout(r, 400));
  const isStillThere = await page.evaluate(() => !!document.querySelector('div[role="dialog"]'));
  console.log('Dialog still in DOM after evaluate click:', isStillThere);

  await browser.close();
  server.close();
  process.exit(0);
});

