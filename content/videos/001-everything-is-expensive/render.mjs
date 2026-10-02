#!/usr/bin/env node
// Renders every scene in graphics.html to a video clip with synced sound effects.
//
//   node render.mjs                  render everything
//   node render.mjs 05 ov_tag_eggs   render scenes whose id contains any of these strings
//   node render.mjs --stills         one PNG per scene at its midpoint (fast review)
//
// Full-screen scenes  -> out/<id>.mp4   (H.264 1080p30, AAC)
// Overlay scenes      -> out/<id>.mov   (PNG codec with alpha, PCM audio; drops into Premiere/Resolve/FCP)
// Also writes out/00_graphics_reel.mp4 (all full-screen clips back to back) and out/sfx/*.wav.

import { spawn, execSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { cpus } from 'node:os';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, 'out');
const FPS = 30, RATE = 48000;

async function loadPlaywright() {
  try { return await import('playwright'); } catch {}
  const root = execSync('npm root -g').toString().trim();
  return import(pathToFileURL(join(root, 'playwright', 'index.mjs')).href);
}

/* ---------------- sound effects, synthesized so the folder stays self-contained ---------------- */
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1; }

const SFX = {
  tick(n = RATE * .04) {
    return mono(n, (i, t) => Math.sin(2 * Math.PI * 2100 * t) * Math.exp(-t * 140) * .22);
  },
  pop() {
    let ph = 0;
    return mono(RATE * .12, (i, t) => { ph += 2 * Math.PI * (900 - 3500 * t) / RATE; return Math.sin(ph) * Math.exp(-t * 38) * .35; });
  },
  type() {
    const r = rng(11);
    let lp = 0;
    return mono(RATE * .03, (i, t) => { lp += (r() - lp) * .5; return (r() - lp) * Math.exp(-t * 260) * .25; });
  },
  whoosh() {
    const n = RATE * .42, r = rng(5), L = new Float32Array(n), R = new Float32Array(n);
    let lp = 0, lp2 = 0;
    for (let i = 0; i < n; i++) {
      const p = i / n, env = Math.pow(Math.sin(Math.PI * p), 1.6);
      const cut = .02 + .25 * Math.sin(Math.PI * p);
      lp += (r() - lp) * cut; lp2 += (lp - lp2) * cut;
      const v = lp2 * env * 1.4;
      L[i] = v * (1 - p * .7); R[i] = v * (.3 + p * .7);
    }
    return [L, R];
  },
  hit() {
    const r = rng(9);
    let ph = 0, lp = 0;
    return mono(RATE * .7, (i, t) => {
      ph += 2 * Math.PI * (38 + 90 * Math.exp(-t * 18)) / RATE;
      lp += (r() - lp) * .35;
      const body = Math.sin(ph) * Math.exp(-t * 6.5) * .9;
      const snap = lp * Math.exp(-t * 60) * .7;
      return Math.tanh((body + snap) * 1.4) * .8;
    });
  },
  cash() {
    const r = rng(3);
    const bell = (t, f, t0) => t < t0 ? 0 : Math.exp(-(t - t0) * 7) * (Math.sin(2 * Math.PI * f * (t - t0)) + .4 * Math.sin(2 * Math.PI * f * 2.76 * (t - t0)));
    return mono(RATE * .8, (i, t) => (bell(t, 1568, 0) * .12 + bell(t, 2093, .07) * .12 + r() * Math.exp(-t * 45) * .25));
  },
  riser() {
    const r = rng(21);
    let ph = 0, lp = 0;
    return mono(RATE * .95, (i, t) => {
      const p = t / .95;
      ph += 2 * Math.PI * (180 + 700 * p * p) / RATE;
      lp += (r() - lp) * (.05 + .4 * p);
      return (Math.sin(ph) * .25 + lp * .6) * Math.pow(p, 2) * .7;
    });
  },
  glitch() {
    const r = rng(17);
    return mono(RATE * .2, (i, t) => (Math.floor(t * 60) % 2 ? Math.sign(Math.sin(2 * Math.PI * 220 * t)) * .18 : r() * .25) * (1 - t / .2));
  },
};
function mono(n, fn) {
  n = Math.floor(n);
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) a[i] = fn(i, i / RATE);
  return [a, a];
}
const SFX_CACHE = {};
const sfx = name => (SFX_CACHE[name] ??= SFX[name]());

function mixCues(cues, dur) {
  const n = Math.ceil(dur * RATE), L = new Float32Array(n), R = new Float32Array(n);
  for (const [t, name] of cues) {
    const [a, b] = sfx(name), o = Math.round(t * RATE);
    for (let i = 0; i < a.length && o + i < n; i++) { L[o + i] += a[i]; R[o + i] += b[i]; }
  }
  return [L, R];
}
function wav(path, [L, R]) {
  const n = L.length, buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(RATE, 24); buf.writeUInt32LE(RATE * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(n * 4, 40);
  const s = v => Math.round(Math.tanh(v) * 32767);
  for (let i = 0; i < n; i++) { buf.writeInt16LE(s(L[i]), 44 + i * 4); buf.writeInt16LE(s(R[i]), 46 + i * 4); }
  writeFileSync(path, buf);
}

/* ---------------- video ---------------- */
function ffmpeg(args, input) {
  return new Promise((res, rej) => {
    const p = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: [input ? 'pipe' : 'ignore', 'inherit', 'inherit'] });
    p.on('exit', c => c === 0 ? res() : rej(new Error('ffmpeg exited ' + c)));
    if (input) input(p.stdin);
  });
}

async function renderScene(page, s, stills) {
  const info = await page.evaluate(id => window.loadScene(id), s.id);
  if (stills) {
    await page.evaluate(t => window.renderAt(t), info.dur * .7);
    await page.screenshot({ path: join(OUT, 'stills', s.id + '.png'), omitBackground: info.alpha });
    return;
  }
  const frames = Math.round(info.dur * FPS);
  const tmp = join(OUT, `.${s.id}.${info.alpha ? 'mov' : 'mp4'}`);
  const audio = join(OUT, `.${s.id}.wav`);
  wav(audio, mixCues(info.cues, info.dur));

  const vArgs = info.alpha
    ? ['-c:v', 'png', '-pix_fmt', 'rgba']
    : ['-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p'];
  let feed;
  const done = ffmpeg(['-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-', ...vArgs, tmp], s => { feed = s; });
  for (let f = 0; f < frames; f++) {
    await page.evaluate(t => window.renderAt(t), f / FPS);
    const png = await page.screenshot({ type: 'png', omitBackground: info.alpha });
    if (!feed.write(png)) await new Promise(r => feed.once('drain', r));
  }
  feed.end();
  await done;

  const final = join(OUT, s.id + (info.alpha ? '.mov' : '.mp4'));
  const aArgs = info.alpha ? ['-c:a', 'pcm_s16le'] : ['-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart'];
  await ffmpeg(['-i', tmp, '-i', audio, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', ...aArgs, '-shortest', final]);
  rmSync(tmp); rmSync(audio);
  console.log(`  ✓ ${s.id}  ${info.dur}s  ${info.cues.length} sfx`);
}

async function main() {
  const args = process.argv.slice(2);
  const stills = args.includes('--stills');
  const filters = args.filter(a => !a.startsWith('--'));
  mkdirSync(join(OUT, stills ? 'stills' : 'sfx'), { recursive: true });

  const data = JSON.parse(readFileSync(join(HERE, 'data.json'), 'utf8'));
  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const url = pathToFileURL(join(HERE, 'graphics.html')).href + '?render=1';

  const open = async () => {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
    await page.addInitScript(d => { window.DATA = d; }, data);
    await page.goto(url);
    await page.waitForFunction(() => window.READY === true);
    return page;
  };
  const first = await open();
  const all = await first.evaluate(() => window.SCENE_LIST);
  const outFile = s => join(OUT, s.id + (s.alpha ? '.mov' : '.mp4'));
  const resume = args.includes('--resume');
  const todo = all.filter(s => (!filters.length || filters.some(f => s.id.includes(f))) && !(resume && !stills && existsSync(outFile(s))));
  const metrics = await first.evaluate(() => window.METRICS);
  console.log(`Day: $${metrics.cost.toFixed(2)} · ${Math.round(metrics.kcal)} cal · ${Math.round(metrics.protein)}g protein`);
  if (!data.meta.prices_verified) console.log('Note: prices_verified is false, so clips carry an EST. PRICES badge.');
  console.log(`Rendering ${todo.length} scene(s)${stills ? ' as stills' : ''}...`);

  const workers = Math.max(1, Math.min(todo.length, Math.floor(cpus().length / 2), 4));
  const pages = [first, ...await Promise.all(Array.from({ length: workers - 1 }, open))];
  const queue = [...todo];
  await Promise.all(pages.map(async page => { let s; while ((s = queue.shift())) await renderScene(page, s, stills); }));
  await browser.close();
  if (stills) return;

  for (const name of Object.keys(SFX)) wav(join(OUT, 'sfx', name + '.wav'), sfx(name));

  // review reel: every full-screen clip in edit order
  if (all.every(s => s.alpha || existsSync(outFile(s)))) {
    const list = join(OUT, '.reel.txt');
    writeFileSync(list, all.filter(s => !s.alpha).map(s => `file '${s.id}.mp4'`).join('\n'));
    await ffmpeg(['-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', join(OUT, '00_graphics_reel.mp4')]);
    rmSync(list);
    console.log('  ✓ 00_graphics_reel.mp4');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
