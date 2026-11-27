// shots.mjs — re-render the entry's screenshots from the site's own code.
//
// Serves app/ with the repo's own serve.ts, opens each route listed in
// shots.json in Playwright Chromium, and saves a JPEG into screenshots/.
// Written fresh in the post-opening re-verification session (2026-11-27)
// so the screenshots are provably renders of the current app/ code.
//
// Usage:
//   node shots.mjs [--out <dir>] [--port <n>] [--quality <1-100>]
// Defaults: --out screenshots --port 8901 --quality 80
//
// The captures must be reproducible: run it twice into two different
// --out dirs and compare the files byte for byte (sha256sum).

import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
// Playwright is installed once on this machine; resolve it from there so
// this repo stays dependency-free.
const { chromium } = require(
  '/home/hatch/workspace/makefun/gta6-cover-art/shots-tool/node_modules/playwright',
);

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const outDir = resolve(repoRoot, flag('--out', 'screenshots'));
const port = Number(flag('--port', '8901'));
const quality = Number(flag('--quality', '80'));

const plan = JSON.parse(readFileSync(join(repoRoot, 'shots.json'), 'utf8'));
mkdirSync(outDir, { recursive: true });

// Start the repo's own static server and wait until it answers.
const server = spawn(
  process.execPath,
  [join(repoRoot, 'serve.ts'), '--port', String(port)],
  { stdio: ['ignore', 'pipe', 'pipe'] },
);
server.stdout.on('data', (d) => process.stdout.write(`[serve] ${d}`));
server.stderr.on('data', (d) => process.stderr.write(`[serve] ${d}`));

const base = `http://127.0.0.1:${port}`;
let up = false;
for (let i = 0; i < 50 && !up; i++) {
  try {
    const res = await fetch(`${base}/`);
    up = res.ok;
  } catch {
    await new Promise((r) => setTimeout(r, 200));
  }
}
if (!up) {
  server.kill();
  throw new Error(`serve.ts did not answer on port ${port}`);
}

const browser = await chromium.launch({
  executablePath:
    '/home/hatch/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome',
  args: ['--no-sandbox'],
});
try {
  for (const shot of plan) {
    const context = await browser.newContext({
      viewport: shot.viewport,
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.goto(`${base}/${shot.path}`, { waitUntil: 'networkidle' });
    // Let the hash router render and any paint settle before capturing.
    await page.waitForTimeout(600);
    const file = join(outDir, shot.file);
    await page.screenshot({ path: file, type: 'jpeg', quality });
    console.log(`${shot.file}: ${shot.viewport.width}x${shot.viewport.height} ${shot.path}`);
    await context.close();
  }
} finally {
  await browser.close();
  server.kill();
}
console.log(`screenshots written to ${outDir}`);
