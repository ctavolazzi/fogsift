#!/usr/bin/env node
// Renders caption cards for the talking sections: node cards.mjs cards.json outDir
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const [, , list, outDir] = process.argv;
const cards = JSON.parse(readFileSync(list, 'utf8'));
let pw;
try { pw = await import('playwright'); } catch {
  pw = await import(pathToFileURL(join(execSync('npm root -g').toString().trim(), 'playwright', 'index.mjs')).href);
}
const fonts = pathToFileURL(join(HERE, '..', 'fonts')).href;
const html = `<!doctype html><html><head><style>
@font-face { font-family: Outfit; font-weight: 100 900; src: url(${fonts}/Outfit-latin.woff2); }
@font-face { font-family: JBM; font-weight: 100 800; src: url(${fonts}/JetBrainsMono-latin.woff2); }
html, body { margin: 0; }
#c { width: 1920px; height: 1080px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;
     background: radial-gradient(ellipse at 50% 42%, #3a2320 0%, #1c1110 72%); font-family: Outfit; }
#c.emph { background: radial-gradient(ellipse at 50% 45%, #f08a48 0%, #e07b3c 45%, #b9541f 100%); }
#t { max-width: 1560px; text-align: center; color: #f5f0e6; font-weight: 900; line-height: 1.02; letter-spacing: -.02em; text-wrap: balance; }
#c.emph #t { color: #1c1110; }
#t .n { color: #e07b3c; }
#c.emph #t .n { color: #f5f0e6; }
#bug { position: absolute; left: 40px; bottom: 30px; font: 800 22px JBM; letter-spacing: .3em; color: #f5f0e6; opacity: .5; }
#grain { position: absolute; inset: 0; opacity: .07; mix-blend-mode: overlay; }
.logo { font: 800 120px JBM !important; letter-spacing: .4em !important; color: #e07b3c !important; }
</style></head><body><div id="c"><div id="t"></div><div id="bug">FOGSIFT</div><canvas id="grain" width="1920" height="1080"></canvas></div>
<script>
const g = document.getElementById('grain').getContext('2d'), img = g.createImageData(1920, 1080); let s = 7;
for (let i = 0; i < img.data.length; i += 4) { s = (s * 1664525 + 1013904223) >>> 0; const v = s / 4294967296 * 255; img.data[i] = img.data[i+1] = img.data[i+2] = v; img.data[i+3] = 255; }
g.putImageData(img, 0, 0);
window.show = (c) => {
  const el = document.getElementById('t'), box = document.getElementById('c');
  box.className = c.emph ? 'emph' : '';
  el.className = c.logo ? 'logo' : '';
  el.innerHTML = c.text.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]))
    .replace(/(\\$?\\d[\\d,]*(?:\\.\\d+)?)/g, '<span class="n">$1</span>');
  const len = c.text.length;
  el.style.fontSize = c.logo ? '' : (len <= 10 ? 220 : len <= 20 ? 170 : len <= 34 ? 132 : len <= 50 ? 108 : 92) + 'px';
  document.getElementById('bug').style.display = c.logo ? 'none' : '';
};
</script></body></html>`;
const browser = await pw.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const file = join(outDir, 'cards.html');
writeFileSync(file, html);
await page.goto(pathToFileURL(file).href);
await page.evaluate(() => document.fonts.load('900 100px Outfit'));
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => window.show({ text: '' }));
await page.locator('#c').screenshot({ path: join(outDir, 'blank.png') });
for (const c of cards) {
  await page.evaluate(c => window.show(c), c);
  await page.locator('#c').screenshot({ path: join(outDir, c.id + '.png') });
}
await browser.close();
console.log(`  ${cards.length} cards`);
