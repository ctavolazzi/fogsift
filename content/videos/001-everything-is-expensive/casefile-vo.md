# Case-File Short: "Should Be Cut" (VO script)

About 40 seconds, landscape 1080p. It works as a standalone short or as a teaser for EP 001. Each line starts at the time shown, which is when its highlight or card hits. Read at a calm, slightly dry pace with a short pause on each stamp.

| Time | On screen | VO |
|---|---|---|
| 0:00 | Research file header, camera drifting | "I ran the numbers on eleven of the cheapest foods in the store." |
| 0:01 | Highlight: pinto beans, 69.5 g protein per dollar | "Pinto beans: almost seventy grams of protein for a dollar." |
| 0:04 | Highlight: sardines, 13.0 g | "Sardines: thirteen." |
| 0:07 | Highlight: the five foods that "should be cut" | "So by the math, eggs, sardines, potatoes, cabbage and spinach should be cut." |
| 0:11 | Highlight: only source of omega-3, vitamins C and K, choline | "Except they're the only foods on the list with omega-3s, vitamin C, vitamin K and choline." |
| 0:16 | Highlight: $5.32 | "Keep them in, and a full day still costs five thirty-two." |
| 0:18 | Highlight: conclusion | "The cheapest calories are not the cheapest nutrition." |
| 0:21 | Card types out: "SHOULD BE CUT" | (beat) "Should be cut." |
| 0:23 | Tags pop in, one per food | Silence. Let the five pops land. |
| 0:28 | Stamp: WRONG. | "Wrong." |
| 0:30 | Small stamps: the four nutrients | Silence, or name them under your breath. |
| 0:34 | "That's one line from page 1." | "That's one line from page one." |
| 0:37 | Tag: full file + receipts below | "The full file and every receipt are linked below." |

## Re-timing

If your read runs long or short, change the `at` values in `casefile.json` and re-render:

```bash
node render.mjs --html ../_casefile/casefile.html --case casefile.json
```

Output: `out/casefile_001_should_be_cut.mp4` with paper, marker, typewriter and stamp sounds plus a low drone bed. Put your VO on top and duck the bed if needed.

## Making another case file

`../_casefile/casefile.html` is the reusable engine. Copy `casefile.json` to a new episode folder and change the header, paragraphs, highlight phrases (each must appear word for word in a paragraph), card, tags, stamps and outro. Highlight text is matched exactly, so a typo throws an error rather than silently skipping.
