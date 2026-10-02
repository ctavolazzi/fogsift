# EP 001 Motion Graphics

Data-driven motion graphics for "Everything Is F*cking Expensive". Every number on screen (rankings, charts, the daily total) is computed from `data.json`, so changing a price and re-rendering updates every clip.

| File | What it is |
|---|---|
| `data.json` | Prices, nutrition per package, the one-day menu, nutrient sources |
| `graphics.html` | All scenes. Open it through a local server to preview and scrub |
| `render.mjs` | Renders every scene to video with synced sound effects |
| `EDIT_PLAN.md` | Where each clip goes in the edit, with VO lines |
| `fonts/` | Outfit and JetBrains Mono (SIL OFL) |

## Preview

```bash
npx browser-sync start --server . --port 5050 --startPath graphics.html
```

Pick a scene from the dropdown. Add `#05_rank_protein` to the URL to open one directly.

## Render

Needs Node 18+, ffmpeg and Playwright with Chromium (`npm i -g playwright && npx playwright install chromium` if missing).

```bash
node render.mjs                   # everything into out/
node render.mjs 05 ov_tag_eggs    # only scenes whose id contains these
node render.mjs --stills          # one PNG per scene, fast layout check
```

Output (gitignored):

- `out/NN_*.mp4`: full-screen clips, 1080p30 H.264 with AAC sound effects
- `out/ov_tag_*.mov`: lower-third price tags with alpha (PNG codec)
- `out/00_graphics_reel.mp4`: every full-screen clip in edit order, for review
- `out/sfx/*.wav`: the sound effects on their own

## Data notes

Nutrition values are per package from USDA FoodData Central (SR Legacy). Prices are placeholders until `meta.prices_verified` is `true`; until then every clip shows an EST. PRICES badge.
