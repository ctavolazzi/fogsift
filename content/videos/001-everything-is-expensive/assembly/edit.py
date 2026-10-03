#!/usr/bin/env python3
"""Assemble EP 001 from the voiceover recordings and the rendered graphics.

    python3 assembly/edit.py <folder with New_Recording*.m4a>

Reads transcript.json (phrase timings from the recordings), cuts the VO tight,
lines each graphic's key moments up with the words they belong to (by holding
frames between moments), fills the talking sections with caption cards, and
writes:

    out/final/EP001_full_1080p.mp4     full edit, 1080p
    out/final/EP001_full_720p.mp4      full edit, small file for review/upload tests
    out/final/sections/NN_name.mp4     the same edit split by section, for re-cutting
    out/final/vo_only.wav              the cut VO by itself
    out/final/edit_decision_list.txt   every phrase with its source and output time
"""
import json, os, re, subprocess, sys, glob
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
EP = os.path.dirname(HERE)
OUT = os.path.join(EP, 'out', 'final')
WORK = os.path.join(EP, 'out', '.assembly')
FPS, SR = 30, 48000
os.makedirs(os.path.join(OUT, 'sections'), exist_ok=True)
os.makedirs(os.path.join(WORK, 'cards'), exist_ok=True)

SRC = sys.argv[1] if len(sys.argv) > 1 else '.'
def rec_file(n):
    name = 'New_Recording.m4a' if n == 1 else f'New_Recording_{n}.m4a'
    hits = [f for f in glob.glob(os.path.join(SRC, '*.m4a')) if f.endswith(name)]
    if not hits: sys.exit(f'missing {name} in {SRC}')
    return hits[0]

def run(args):
    r = subprocess.run(args, capture_output=True)
    if r.returncode: sys.exit(r.stderr.decode()[-2000:])
    return r.stdout

AUDIO = {}
def audio(n):
    if n not in AUDIO:
        pcm = run(['ffmpeg', '-v', 'error', '-i', rec_file(n), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'])
        AUDIO[n] = np.frombuffer(pcm, dtype=np.float32).copy()
    return AUDIO[n]

SEGS = json.load(open(os.path.join(HERE, 'transcript.json')))
def seg(rec, start):
    for s in SEGS:
        if s['rec'] == rec and abs(s['start'] - start) < 0.06: return s
    sys.exit(f'no segment rec {rec} @ {start}')

def word_time(rec, start, word, nth=1):
    """Estimate when a word is spoken inside a phrase, by its position in the text."""
    s = seg(rec, start)
    txt = s['text'].lower()
    i = -1
    for _ in range(nth):
        i = txt.find(word.lower(), i + 1)
        if i < 0: sys.exit(f'"{word}" not in: {s["text"]}')
    return s['start'] + (s['end'] - s['start']) * i / max(1, len(txt))

def quiet_point(rec, t, before=0.35, after=0.2):
    """Snap a cut to the quietest 20 ms near t so it lands between words."""
    a = audio(rec); w = int(0.02 * SR)
    lo, hi = int((t - before) * SR), int((t + after) * SR)
    best, bt = 1e9, t
    for i in range(max(0, lo), min(len(a) - w, hi), w // 2):
        e = float(np.mean(a[i:i + w] ** 2))
        if e < best: best, bt = e, i / SR
    return bt

# ---------------------------------------------------------------- the edit
class P:
    """One VO phrase: a transcript segment, optionally trimmed, with its caption text."""
    def __init__(self, rec, start, text='', a=None, b=None, emph=False):
        s = seg(rec, start)
        self.rec, self.text, self.emph = rec, text, emph
        self.a = quiet_point(rec, word_time(rec, start, a), .3, .1) if isinstance(a, str) else (a if a is not None else s['start'] - 0.04)
        self.b = quiet_point(rec, word_time(rec, start, b), .3, .1) if isinstance(b, str) else (b if b is not None else s['end'] + 0.06)
        self.src_start = start

def W(rec, start, word, nth=1, d=0.0):
    return ('word', rec, start, word, nth, d)
def S(rec, start, d=0.0):
    return ('start', rec, start, d)

SECTIONS = [
  dict(name='cold_open', clip='01_hook_receipt', keys=[(3.5, W(1, 11.56, '$5.32', d=-0.05))], phrases=[
    P(1, 8.46, 'This is one full day of food.'),
    P(1, 11.56, '2,240 calories. 116 grams of protein. $5.32.', b='Groceries'),
  ]),
  dict(name='title', clip='02_title', phrases=[]),
  dict(name='absurd', phrases=[
    P(1, 11.56, 'Groceries are absurd right now.', a='Groceries'),
    P(1, 23.50, 'Packages are shrinking. Prices keep going up. And every "eat cheap" video tells you to live on ramen and rice. I\'m...'),
    P(1, 31.91, 'not doing that.'),
    P(1, 33.48, 'I went to the store, bought the staples everyone swears by, and ran the math on every single one. Not vibes.'),
    P(1, 41.74, 'Math.', emph=True),
  ]),
  dict(name='formula', clip='03_formula', keys=[
    (0.38, W(1, 44.62, 'protein')), (1.18, W(1, 44.62, 'micronutrients')), (1.98, W(1, 44.62, 'calories')),
    (2.78, W(1, 44.62, 'divide')), (5.75, S(1, 57.99))], phrases=[
    P(1, 43.53, "Here's the rule."),
    P(1, 44.62),
    P(1, 57.99),
  ]),
  dict(name='haul', phrases=[
    P(2, 14.76, "So here's the haul. 11 foods."),
    P(2, 17.71, 'Dried lentils. Dried pinto beans. White rice. Rolled oats.'),
    P(2, 22.31, 'Eggs. Canned sardines. Peanut butter. Potatoes. Whole milk.'),
    P(2, 27.24, 'And two greens: a head of cabbage and a bag of frozen spinach. Nothing fancy.'),
    P(2, 33.93, 'Every one of these is at basically any grocery store in the country.'),
  ]),
  dict(name='round1', clip='04_round1_bumper', hold_at=2.5, keys=[
    (0.2, W(2, 41.61, 'protein', d=-0.1)), (0.5, W(2, 41.61, 'dollar', d=-0.15)), (1.05, W(2, 41.61, 'staples', d=-0.3))], phrases=[
    P(2, 38.86), P(2, 41.61), P(2, 46.22),
  ]),
  dict(name='protein_countdown', clip='05_rank_protein', keys=[
    (0.28, S(2, 51.63, 0.25)), (2.58, W(2, 55.56, 'sardines')), (4.88, W(2, 55.56, 'eggs')),
    (7.18, W(2, 64.14, 'rice')), (9.48, W(2, 64.14, 'oats')), (11.78, W(2, 70.47, 'milk')),
    (14.08, W(2, 79.18, 'peanut')), (16.38, W(2, 79.18, 'lentils')), (18.65, W(2, 112.39, 'pinto', d=-0.95))], phrases=[
    P(2, 47.95), P(2, 49.23), P(2, 51.63), P(2, 53.29), P(2, 55.56), P(2, 64.14), P(2, 70.47), P(2, 74.15),
    P(2, 79.18, b='let me say'),
    P(2, 107.47), P(2, 110.47), P(2, 112.39), P(2, 119.34),
  ]),
  dict(name='beans', phrases=[
    P(3, 1.61, 'If you put this all together, what you get is the realization that the two cheapest sources of protein in the store'),
    P(3, 7.56, 'are both beans.'),
    P(3, 8.87, "And it isn't even close.", emph=True),
    P(3, 11.53, 'We have a rule here.'),
    P(3, 13.07, "You're gonna wanna buy your beans dry."),
    P(3, 15.40, "Canned beans usually cost a lot more per serving, because you're paying for water"),
    P(3, 19.95, 'and a can.'),
    P(3, 21.32, "It doesn't really make all that much sense when you could"),
    P(3, 24.62, 'do it at home in a nice pot.'),
    P(3, 26.63, 'Check the shelf tags yourself, of course, but'),
    P(3, 28.78, 'usually dried beans are the way to go.'),
    P(3, 31.24, 'Dry just means one extra step.'),
    P(3, 33.45, 'Soaking them'), P(3, 34.47, 'overnight,'), P(3, 35.56, 'which'), P(3, 36.75, 'you can do.'), P(3, 37.64, 'I promise.'),
    P(3, 38.92, 'Cook a big pot on Sunday.'),
    P(3, 40.65, "Freeze half the beans, you're good to go."),
    P(3, 43.47, "That's maybe 15 minutes of real work, and it covers your protein"),
    P(3, 46.89, 'for most of the week.'),
  ]),
  dict(name='round2', clip='06_round2_bumper', hold_at=2.5, keys=[
    (0.2, W(3, 49.03, 'calories', d=-0.1)), (0.5, W(3, 49.03, 'per', d=-0.1))], phrases=[P(3, 49.03)]),
  dict(name='calories', clip='07_rank_calories', keys=[(2.55, S(3, 58.06, 0.2))], phrases=[
    P(3, 51.98), P(3, 58.06), P(3, 59.75), P(3, 62.44),
  ]),
  dict(name='calories_talk', phrases=[
    P(3, 64.71, 'Now, calories get a bad rap.'),
    P(3, 66.57, 'But calories are energy.'),
    P(3, 67.79, "If you're working, training, or chasing kids,"),
    P(3, 70.25, "you're gonna need a lot."),
    P(3, 72.17, 'The trick is getting them from food that also fills you up.'),
    P(3, 75.27, 'Rice, beans, oats, and peanut butter all land near the top here,'),
    P(3, 79.02, 'and they keep you full for hours.'),
    P(3, 82.41, 'So at this point'), P(3, 83.34, 'the plan'),
    P(3, 84.17, "kinda looks obvious, doesn't it?"),
    P(3, 86.12, 'Beans, rice, oats, peanut butter.'),
    P(3, 88.62, 'Done.', emph=True),
    P(3, 89.96, 'Except'), P(3, 90.83, 'of course,'), P(3, 92.43, "it isn't over.", emph=True),
  ]),
  dict(name='catch_bumper', clip='08_catch_bumper', phrases=[]),
  dict(name='catch_scatter', clip='09_catch_scatter', keys=[
    (0.85, S(3, 94.79, 1.2)), (3.95, S(3, 102.15)), (4.35, S(3, 106.76)), (5.15, S(3, 110.89)), (7.55, S(3, 116.36, 0.3))], phrases=[
    P(3, 94.79), P(3, 98.86), P(3, 100.17), P(3, 102.15), P(3, 104.68), P(3, 105.96), P(3, 106.76),
    P(3, 110.89), P(3, 112.30), P(3, 114.70), P(3, 116.36),
  ]),
  dict(name='nutrient_grid', clip='10_nutrient_grid', keys=[(4.15, S(3, 121.93)), (4.85, S(3, 134.19))], phrases=[
    P(3, 118.76), P(3, 121.00), P(3, 121.93), P(3, 123.08), P(3, 124.20), P(3, 125.55),
    P(3, 134.19), P(3, 136.55), P(3, 137.64),
  ]),
  dict(name='the_trap', phrases=[
    P(4, 0.07, 'This is the hidden trap with every cheap'),
    P(4, 3.69, 'eating plan.'),
    P(4, 4.91, 'The cheapest calories are not the cheapest nutrition.', b='if you only', emph=True),
    P(4, 4.91, 'If you only optimize for price, you end up eating beans and rice forever. And you quietly miss nutrients that nothing else on your plate', a='if you only'),
    P(4, 16.68, 'provides.'),
    P(4, 18.41, "Let me tell you, you don't need a lot of the losers on this chart. A can of sardines, a couple eggs, and a handful of greens is usually"),
    P(4, 25.77, 'all you actually require.'),
    P(4, 28.27, 'They just cost a little more per bite.'),
    P(4, 30.67, 'They fill the holes that nothing else on this list can.'),
    P(4, 34.79, 'So the real plan'),
    P(4, 36.17, 'is the cheap staples for bulk, plus a small amount of the expensive stuff for everything else.'),
    P(4, 41.10, "So let's go ahead and"), P(4, 42.38, 'build that day'), P(4, 43.31, 'and see what it actually costs.'),
  ]),
  dict(name='day_build', clip='11_day_build', keys=[
    (0.45, S(5, 1.39)), (2.95, S(5, 9.10)), (5.45, S(5, 15.15)), (7.95, S(5, 23.98))], phrases=[
    P(5, 1.39), P(5, 2.76), P(5, 6.12), P(5, 9.10), P(5, 9.93), P(5, 11.37), P(5, 13.10), P(5, 13.67),
    P(5, 15.15), P(5, 16.01), P(5, 19.95), P(5, 22.41), P(5, 23.98), P(5, 25.29),
    P(5, 26.63, b='and oats'),
  ]),
  dict(name='cooking', phrases=[
    P(5, 26.63, 'Oats take five minutes, so', a='and oats'),
    P(5, 30.60, "stir the peanut butter in while they're hot."),
    P(5, 33.00, 'The lentils and rice go in one pot.'),
    P(5, 35.05, 'Throw the spinach in at the end,'),
    P(5, 36.46, 'straight'), P(5, 37.42, 'from the freezer.'),
    P(5, 39.15, 'Potatoes go in the oven whole. 45 minutes, zero effort.'),
    P(6, 1.90, 'Sardines go right on top of the potatoes, and if you'),
    P(6, 5.29, 'have never had that before, let me tell you.'),
    P(6, 7.98, 'Just add a little salt and hot sauce'),
    P(6, 10.35, "and you're pretty much good to go."),
    P(6, 12.59, 'The fats from the sardines soak into the starch'),
    P(6, 15.50, "and you'll be surprised"),
    P(6, 17.42, 'how easy this is to eat.'),
    P(6, 20.27, 'The cabbage gets sliced thin and sauteed in the same pan,'),
    P(6, 23.82, 'which'), P(6, 24.36, 'will sweeten'), P(6, 25.51, 'when it browns.'),
    P(6, 27.15, 'Notice the most expensive thing on the plate is the one can of sardines.'),
    P(6, 31.98, "This dinner costs the most, and it's the meal doing the most"),
    P(6, 35.47, 'for you.', emph=True),
  ]),
  dict(name='day_total', clip='12_day_total', keys=[
    (0.25, W(6, 46.25, '$5.32')), (0.95, S(6, 53.58)), (2.55, S(6, 69.35, -0.9))], phrases=[
    P(6, 44.55), P(6, 45.13), P(6, 46.25), P(6, 50.31), P(6, 52.07), P(6, 53.58), P(6, 69.35),
  ]),
  dict(name='caveats', phrases=[
    P(7, 1.07, 'I challenge you to try and do'), P(7, 3.79, 'better.', emph=True),
    P(7, 5.55, "We do have a few honest caveats though, if we're gonna be transparent. This is not medical advice. If you have a condition, allergies, or a doctor telling you to watch something, that of course"),
    P(7, 15.40, 'always comes first.'),
    P(7, 17.07, 'Canned fish can be quite high in sodium, so'),
    P(7, 20.07, 'look for low sodium'), P(7, 21.42, 'options, or try to rinse'), P(7, 23.82, 'your fish before you eat it.'),
    P(7, 26.03, 'These are'), P(7, 26.79, 'my prices, from my store, on'), P(7, 29.61, 'this'), P(7, 30.19, 'particular date in October.'),
    P(7, 32.49, 'Yours'), P(7, 33.26, 'will'), P(7, 33.64, 'probably be different.'),
    P(7, 34.92, 'But the methods'), P(7, 36.01, 'that I cover,'),
    P(7, 38.19, 'and the full numbers are linked below, so you can plug in your own.'),
    P(7, 41.23, "I'm going to be doing this diet myself for the next few weeks to see how it goes and see how I feel."),
    P(7, 47.59, "I'm"), P(7, 48.23, 'excited to share the results with you.'),
    P(7, 50.92, 'Is this the most exciting way to eat?'), P(7, 52.81, 'Of course not,'),
    P(7, 54.03, 'but it is a floor.', emph=True),
    P(7, 56.01, 'It is something that will get you where you need to go and make sure your body has everything it needs to get through the day.'),
    P(7, 61.80, 'If money gets tight,'),
    P(7, 62.92, 'you know exactly what a full day of real food costs,'),
    P(7, 65.87, "and it's a lot less than most"), P(7, 68.39, 'think.'),
  ]),
  dict(name='cta', clip='13_cta', keys=[
    (0.15, S(7, 70.38, -0.05)), (1.75, W(7, 73.03, 'rent')), (2.85, W(7, 73.03, 'car')), (4.25, W(7, 73.03, 'baby')),
    (5.75, S(7, 77.93))], phrases=[
    P(7, 69.35), P(7, 70.38), P(7, 72.49), P(7, 73.03), P(7, 77.93), P(7, 78.99),
  ]),
  dict(name='outro', end_card=True, phrases=[
    P(7, 82.41, 'This channel is interested in doing research'),
    P(7, 85.32, 'so that you'), P(7, 86.41, 'can get a straight answer'),
    P(7, 87.98, 'to your pressing questions. If your business has a question like this too,'),
    P(7, 92.52, "if it's too expensive, too confusing, with too many options,"),
    P(7, 96.30, 'I would like to do that research'), P(7, 98.22, 'for you.'),
    P(7, 107.50, "I'm going to be exploring what this feels like over the next few weeks,"),
    P(7, 111.82, "and I'll let you know how I feel after eating"),
    P(7, 114.92, 'such a boring'), P(7, 116.17, 'yet nutritionally dense diet.'),
    P(7, 119.05, 'Signing off.', emph=True),
  ]),
]

# ---------------------------------------------------------------- layout the VO
def clipdur(name):
    return float(run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', os.path.join(EP, 'out', name + '.mp4')]))

timeline, edl, t = [], [], 0.0
for sec in SECTIONS:
    sec['start'] = t
    cur, prev = 0.15 if sec['phrases'] else 0.0, None
    placed = []
    for p in sec['phrases']:
        if prev is not None:
            gap = (p.a - prev.b) if p.rec == prev.rec and p.a >= prev.b else 0.15
            cur += min(max(gap, 0.06), 0.32)
        p.out = cur
        placed.append(p)
        edl.append(f'{t + cur:8.2f}s  rec{p.rec} {p.a:7.2f}-{p.b:7.2f}  [{sec["name"]}]  {p.text or seg(p.rec, p.src_start)["text"]}')
        cur += p.b - p.a
        prev = p
    vo_end = cur

    def resolve(spec):
        if spec[0] == 'word':
            _, rec, start, word, nth, d = spec
            target = word_time(rec, start, word, nth)
        else:
            _, rec, start, d = spec
            target = seg(rec, start)['start']
        for p in placed:  # map a source time to output time through the phrase that holds it
            if p.rec == rec and p.a - 0.05 <= target <= p.b + 0.05:
                return p.out + (target - p.a) + d
        sys.exit(f'key target {spec} is not inside a kept phrase in {sec["name"]}')

    if 'clip' in sec:
        cd = clipdur(sec['clip'])
        end_c = sec.get('hold_at', cd)
        keys = [(0.0, 0.0)] + [(c, resolve(s)) for c, s in sec.get('keys', [])]
        last_c, last_o = keys[-1]
        dur = max(vo_end + 0.35, last_o + (end_c - last_c) if not sec.get('hold_at') else vo_end + 0.35)
        if not sec['phrases']: dur = cd
        sec['keys'], sec['end_c'] = keys, end_c
    else:
        dur = vo_end + 0.35
        if sec.get('end_card'): dur += 2.5
    sec['frames'] = round(dur * FPS)
    sec['dur'] = sec['frames'] / FPS
    t += sec['dur']

TOTAL = t
print(f'Edit length: {int(TOTAL // 60)}:{TOTAL % 60:04.1f}')
open(os.path.join(OUT, 'edit_decision_list.txt'), 'w').write('\n'.join(edl) + '\n')

# ---------------------------------------------------------------- caption cards
NUM = re.compile(r'(\$?\d[\d,]*(?:\.\d+)?)')
def chunks(text):
    """Split a caption into short cards at punctuation, then by word count."""
    parts = re.split(r'(?<=[.!?:,])\s+', text.strip())
    out = []
    for part in parts:
        words = part.split()
        while len(words) > 7:
            cut = 5 if len(words) > 9 else len(words) // 2
            out.append(' '.join(words[:cut])); words = words[cut:]
        if words: out.append(' '.join(words))
    merged = []
    for c in out:  # fold one-word scraps into the previous card
        if merged and len(c.split()) == 1 and len(merged[-1].split()) < 6 and not c.endswith(('.', '?')):
            merged[-1] += ' ' + c
        else:
            merged.append(c)
    return merged

cards = []
for si, sec in enumerate(SECTIONS):
    if 'clip' in sec: continue
    sec['cards'] = []
    for p in sec['phrases']:
        cs = chunks(p.text)
        total = sum(len(c) for c in cs)
        tt = p.out
        for c in cs:
            d = (p.b - p.a) * len(c) / total
            idx = len(cards)
            cards.append({'id': idx, 'text': c, 'emph': p.emph and c == cs[-1]})
            sec['cards'].append((idx, tt, d))
            tt += d
    if sec.get('end_card'):
        idx = len(cards); cards.append({'id': idx, 'text': 'FOGSIFT', 'logo': True})
        sec['cards'].append((idx, sec['dur'] - 2.5, 2.5))
json.dump(cards, open(os.path.join(WORK, 'cards.json'), 'w'))
print(f'Rendering {len(cards)} caption cards...')
subprocess.run(['node', os.path.join(HERE, 'cards.mjs'), os.path.join(WORK, 'cards.json'), os.path.join(WORK, 'cards')], check=True)

# ---------------------------------------------------------------- video pieces
pieces = []  # (path) in order
def enc(args, path):
    run(['ffmpeg', '-v', 'error', '-y', *args, '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17',
         '-pix_fmt', 'yuv420p', '-r', str(FPS), path])
    pieces.append(path)

def graphic_piece(sec, n):
    """Play the clip between keys at native speed, holding the frame until the next key's moment."""
    src = os.path.join(EP, 'out', sec['clip'] + '.mp4')
    keys, end_c, F = sec['keys'], sec['end_c'], sec['frames']
    spans = []  # (clip_start, play_frames, hold_frames, out_frame)
    for i, (c, o) in enumerate(keys):
        nxt_o = keys[i + 1][1] if i + 1 < len(keys) else F / FPS
        nxt_c = keys[i + 1][0] if i + 1 < len(keys) else end_c
        of, nf = round(o * FPS), round(nxt_o * FPS)
        avail = max(0, nf - of)
        play = max(0, min(round((nxt_c - c) * FPS), avail))
        spans.append((round(c * FPS), play, avail - play, of))
    filt, labels = [], []
    for j, (cf, play, hold, of) in enumerate(spans):
        if play + hold <= 0: continue
        if play == 0: cf, play, hold = max(0, cf - 1), 1, hold - 1
        filt.append(f'[0:v]trim=start_frame={cf}:end_frame={cf + play},setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop={max(0, hold)}[v{j}]')
        labels.append(f'[v{j}]')
    filt.append(f'{"".join(labels)}concat=n={len(labels)}:v=1:a=0,trim=end_frame={F}[v]')
    path = os.path.join(WORK, f'p{n:02d}.mp4')
    enc(['-i', src, '-filter_complex', ';'.join(filt), '-map', '[v]', '-frames:v', str(F)], path)
    sec['spans'] = spans

def caption_piece(sec, n):
    lst = os.path.join(WORK, f'p{n:02d}.txt')
    lines, cursor = [], 0
    F = sec['frames']
    bg = os.path.join(WORK, 'cards', 'blank.png')
    seq = []
    for idx, tt, d in sec['cards']:
        f0, f1 = round(tt * FPS), round((tt + d) * FPS)
        if f0 > cursor: seq.append((bg if cursor == 0 else seq[-1][0], f0 - cursor))  # before first card: blank; gaps: hold the last card
        seq.append((os.path.join(WORK, 'cards', f'{idx}.png'), max(1, f1 - max(f0, cursor))))
        cursor = max(f0, cursor) + seq[-1][1]
    if cursor < F: seq.append((seq[-1][0], F - cursor))
    for img, frames in seq:
        lines += [f"file '{img}'", f'duration {frames / FPS:.5f}']
    lines.append(f"file '{seq[-1][0]}'")
    open(lst, 'w').write('\n'.join(lines))
    path = os.path.join(WORK, f'p{n:02d}.mp4')
    # slow push-in over the whole section keeps static cards alive
    enc(['-f', 'concat', '-safe', '0', '-i', lst, '-vf',
         f"fps={FPS},scale=2016:1134,crop=1920:1080:'48-48*n/{F}':'27-27*n/{F}'", '-frames:v', str(F)], path)

for n, sec in enumerate(SECTIONS):
    (graphic_piece if 'clip' in sec else caption_piece)(sec, n)
    print(f'  piece {n:02d} {sec["name"]:18s} {sec["dur"]:6.2f}s')

# ---------------------------------------------------------------- audio: VO + the graphics' sound effects
def clip_audio(name):
    pcm = run(['ffmpeg', '-v', 'error', '-i', os.path.join(EP, 'out', name + '.mp4'), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'])
    return np.frombuffer(pcm, dtype=np.float32)

N = int(TOTAL * SR) + SR
vo, fx = np.zeros(N, np.float32), np.zeros(N, np.float32)
fade = int(0.012 * SR)
ramp = np.linspace(0, 1, fade, dtype=np.float32)
for sec in SECTIONS:
    for p in sec['phrases']:
        a = audio(p.rec)[int(p.a * SR):int(p.b * SR)].copy()
        a[:fade] *= ramp; a[-fade:] *= ramp[::-1]
        o = int((sec['start'] + p.out) * SR)
        vo[o:o + len(a)] += a
    if 'clip' in sec:
        ca = clip_audio(sec['clip'])
        for cf, play, hold, of in sec['spans']:
            s0, ln = int(cf / FPS * SR), int(play / FPS * SR)
            piece = ca[s0:s0 + ln].copy()
            if len(piece) > 2 * fade: piece[-fade:] *= ramp[::-1]
            o = int((sec['start'] + of / FPS) * SR)
            fx[o:o + len(piece)] += piece

# level the VO: each recording to the same speech loudness, then a gentle limiter
def rms_db(x): return 10 * np.log10(np.mean(x[np.abs(x) > 0.01] ** 2) + 1e-12)
vo *= 10 ** ((-20 - rms_db(vo)) / 20)
mix = vo + fx * 0.45
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
def write_wav(path, x):
    pcm = (np.clip(x, -1, 1) * 32767).astype('<i2').tobytes()
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', '-', '-ac', '2', path], input=pcm)
write_wav(os.path.join(OUT, 'vo_only.wav'), vo)
write_wav(os.path.join(WORK, 'mix.wav'), mix)

# ---------------------------------------------------------------- final files
lst = os.path.join(WORK, 'pieces.txt')
open(lst, 'w').write('\n'.join(f"file '{p}'" for p in pieces))
full = os.path.join(OUT, 'EP001_full_1080p.mp4')
run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-i', os.path.join(WORK, 'mix.wav'),
     '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '22', '-pix_fmt', 'yuv420p',
     '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '192k', '-ar', str(SR), '-movflags', '+faststart', '-shortest', full])
run(['ffmpeg', '-v', 'error', '-y', '-i', full, '-vf', 'scale=1280:720', '-c:v', 'libx264', '-preset', 'slow', '-crf', '28',
     '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', os.path.join(OUT, 'EP001_full_720p.mp4')])
for n, sec in enumerate(SECTIONS):
    run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{sec["start"]:.3f}', '-i', full, '-t', f'{sec["dur"]:.3f}',
         '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-c:a', 'aac', '-b:a', '192k',
         os.path.join(OUT, 'sections', f'{n + 1:02d}_{sec["name"]}.mp4')])
print('Done:', OUT)
