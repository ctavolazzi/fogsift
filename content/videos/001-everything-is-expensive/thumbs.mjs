#!/usr/bin/env node
// Renders the three thumbnail variants in thumbnail.html to out/thumbs/.
//   node thumbs.mjs
// Writes thumb-a.jpg, thumb-b.jpg, thumb-c.jpg (1280x720, under YouTube's 2 MB limit)
// and preview-feed.png (all three at full size and at phone-feed size, side by side).

import { execSync, spawnSync } from 'node:child_process';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, 'out', 'thumbs');
mkdirSync(OUT, { recursive: true });

let pw;
try { pw = await import('playwright'); } catch {
  pw = await import(pathToFileURL(join(execSync('npm root -g').toString().trim(), 'playwright', 'index.mjs')).href);
}
const data = JSON.parse(readFileSync(join(HERE, 'data.json'), 'utf8'));
const browser = await pw.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.addInitScript(d => { window.DATA = d; }, data);

for (const v of ['a', 'b', 'c']) {
  await page.goto(pathToFileURL(join(HERE, 'thumbnail.html')).href + '?v=' + v);
  await page.waitForFunction(() => window.READY === true);
  await page.locator('#thumb-' + v).screenshot({ path: join(OUT, `thumb-${v}.png`) });
  spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', join(OUT, `thumb-${v}.png`), '-q:v', '2', join(OUT, `thumb-${v}.jpg`)]);
  console.log('  ✓ thumb-' + v + '.jpg');
}
await browser.close();

// how they read in a phone feed: each full size on the left, at ~246px wide on the right
const inputs = ['a', 'b', 'c'].flatMap(v => ['-i', join(OUT, `thumb-${v}.png`)]);
const rows = ['a', 'b', 'c'].map((_, i) => `[${i}]split[f${i}][s${i}];[s${i}]scale=246:-1,pad=1280:720:20:20:color=0x181818[p${i}];[f${i}][p${i}]hstack[r${i}]`).join(';');
spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...inputs, '-filter_complex', `${rows};[r0][r1][r2]vstack=inputs=3`, join(OUT, 'preview-feed.png')]);
console.log('  ✓ preview-feed.png');
