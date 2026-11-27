// shots-fresh.mjs — fresh screenshot run for the Nest Egg entry.
// Spawns the kit server, renders each route in headless Chrome, then
// compresses to JPEG (long side <= 1280) with Pillow so every shot is
// under the 256 KiB gate limit. Written fresh for the re-author session.
//
// Usage: node shots-fresh.mjs   (run from the project root)

import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const execFileAsync = promisify(execFile);
const CHROME = process.env.HOME + '/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome';
const PORT = 8091;
const BASE = 'http://127.0.0.1:' + PORT;

const SHOTS = [
  { name: '1-dashboard.jpg', url: BASE + '/#/', width: 1280, height: 860 },
  { name: '2-planner.jpg', url: BASE + '/#/planner', width: 1280, height: 860 },
  { name: '3-bills.jpg', url: BASE + '/#/bills', width: 1280, height: 860 },
  { name: '4-phone.jpg', url: BASE + '/#/', width: 390, height: 844 },
];

function waitForServer(tries = 40) {
  return new Promise((resolve, reject) => {
    const attempt = (left) => {
      fetch(BASE + '/')
        .then((res) => (res.ok ? resolve() : retry()))
        .catch(() => retry());
      function retry() {
        if (left <= 0) return reject(new Error('server did not come up'));
        setTimeout(() => attempt(left - 1), 250);
      }
    };
    attempt(tries);
  });
}

async function chromeShot(shot, rawPath) {
  await execFileAsync(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--window-size=' + shot.width + ',' + shot.height,
    '--virtual-time-budget=4000',
    '--screenshot=' + rawPath,
    shot.url,
  ], { timeout: 60000 });
}

async function toJpeg(rawPath, outPath) {
  const py = [
    'from PIL import Image',
    "im = Image.open(r'" + rawPath + "').convert('RGB')",
    'w, h = im.size',
    'scale = min(1.0, 1280 / max(w, h))',
    'im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS) if scale < 1 else im',
    "im.save(r'" + outPath + "', 'JPEG', quality=82, optimize=True)",
    "print(im.size, r'" + outPath + "')",
  ].join('\n');
  const { stdout } = await execFileAsync('python3', ['-c', py], { timeout: 60000 });
  return stdout.trim();
}

const server = spawn('node', ['serve.ts', '--port', String(PORT)], { stdio: 'ignore' });
try {
  await waitForServer();
  console.log('server up on', BASE);
  mkdirSync('screenshots', { recursive: true });
  mkdirSync('/tmp/nestegg-shots', { recursive: true });
  for (const shot of SHOTS) {
    const raw = join('/tmp/nestegg-shots', shot.name.replace('.jpg', '.png'));
    const out = join('screenshots', shot.name);
    await chromeShot(shot, raw);
    console.log('raw', shot.name, statSync(raw).size, 'bytes');
    console.log('jpg', await toJpeg(raw, out), statSync(out).size, 'bytes');
  }
  console.log('done');
} finally {
  server.kill();
}
