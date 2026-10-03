# EP 001: Everything Is F*cking Expensive (Edit Plan)

Target runtime: about 6:30. Every graphic is a drop-in clip from `out/`. A-roll means you on camera. B-roll means hands, groceries, cooking.

The numbers below are the current values from `data.json`, which are **placeholder prices**. Once you re-render with your receipt prices, read the new numbers from the render log (first line) and update the VO lines to match.

## Retention rules used in this cut

1. **Payoff first.** The video opens on the answer ($ per day), then spends the next six minutes proving it.
2. **Something changes every 2 to 4 seconds.** A cut, a punch-in (110% to 120% scale), a graphic, or an overlay. Never hold a static A-roll shot longer than 6 seconds.
3. **Open loops.** "#1 is last" (Round 1) and "There's a catch" (re-hook at the midpoint) give people a reason to stay through the two places viewers usually drop.
4. **Chapter bumpers as pattern interrupts.** Each new section starts with a 2.8 second full-screen card with impact sound.
5. **Sound on every movement.** Clips ship with synced whooshes, hits and ticks. Duck music by about 8 dB under them.
6. **No dead air.** Cut breaths and pauses in the A-roll. Jump cuts are fine. They read as pace.

## Timeline

| Time | Clip | Content | VO / on-camera line |
|---|---|---|---|
| 0:00 | `01_hook_receipt.mp4` (7s) | Receipt builds, then the $5.32 slam | VO: "This is one full day of food. Two thousand calories, over a hundred grams of protein. Five dollars and thirty-two cents." |
| 0:07 | `02_title.mp4` (3.6s) | Title slam | No VO. Let the hits land. |
| 0:11 | A-roll (20s) | You, direct to camera | "Groceries are absurd right now. Shrinking packages, rising prices. I'm not going to tell you to eat ramen. I'm going to show you the math." Punch in on "absurd" and "math". |
| 0:31 | `03_formula.mp4` (8s) | The formula | VO: "Three things. Protein, micronutrients, calories. Divided by dollars. Junk food wins on calories and loses everything else, so it's out." |
| 0:39 | A-roll + B-roll (25s) | Unbagging groceries | "I bought every staple people swear by and ran the numbers." Drop the matching `ov_tag_<food>.mov` over B-roll as you hold up each item (4s each, overlap them back to back). |
| 1:04 | `04_round1_bumper.mp4` (2.8s) | ROUND 1 | VO hits the subtitle: "Nine staples. Number one is last." |
| 1:07 | `05_rank_protein.mp4` (24s) | Countdown #9 to #1 | VO names each one fast. Silent beat on the drumroll before #1. Then: "Pinto beans. Nearly seventy grams of protein for a dollar." |
| 1:31 | A-roll (30s) | Reaction + context | Why beans and lentils win (dried, not canned). Practical tip: soak overnight, cook a big batch. Cut to B-roll of a pot every 5s. |
| 2:01 | `06_round2_bumper.mp4` (2.8s) | ROUND 2 | |
| 2:04 | `07_rank_calories.mp4` (7s) | Calories per $1 bar chart | VO: "Rice is the calorie king. Fifteen hundred calories for a buck." |
| 2:11 | A-roll (20s) | | Why calories still matter: energy, not feeling hungry two hours later. |
| 2:31 | `08_catch_bumper.mp4` (2.8s) | WAIT, THERE'S A CATCH | **Midpoint re-hook.** Hard cut in, no lead-in. |
| 2:34 | `09_catch_scatter.mp4` (10s) | Scatter plot | VO: "Plot both scores and five foods lose on both. Eggs, sardines, potatoes, cabbage, spinach. By the math, you'd cut them." At the glitch: "But the math is missing something." |
| 2:44 | `10_nutrient_grid.mp4` (9s) | Nutrient coverage grid | VO: "Omega-3s, vitamin C, vitamin K, choline. On this list, only the losers have them." |
| 2:53 | A-roll (45s) | The point of the video | Cheapest calories are not cheapest nutrition. Pair the winners with a few "losers" and you cover everything. Cut away to B-roll of sardines, cabbage, spinach. |
| 3:38 | `11_day_build.mp4` (11.5s) | A full day, meal by meal | VO reads each meal's total. |
| 3:50 | B-roll (60 to 90s) | Cooking the day | Quick cuts, each under 4s. Show actual portions on a scale if you have one. |
| 5:10 | `12_day_total.mp4` (6.5s) | $5.32 per day, week, month | VO: "Five thirty-two a day. Under forty a week. About a hundred sixty a month." |
| 5:17 | A-roll (40s) | Caveats + verdict | "Not medical advice. Watch the sodium in canned fish. Allergies change the list. Prices are from my store on this date: yours will vary, the method won't." |
| 5:57 | `13_cta.mp4` (8s) | Comment prompt | VO: "What else is too expensive? Comment it. I'll research it next." |
| 6:05 | End screen (20s) | | Next video + subscribe. Mention FogSift does this research for businesses in one line, not as the main ask. |

## Overlays (`out/ov_tag_*.mov`)

PNG codec with alpha plus a whoosh track, so they drop straight onto a track above B-roll in Premiere, Resolve, Final Cut or CapCut desktop. Each is 4.2s: slides in, holds, slides out. Put them at the bottom-left over the shot where you hold that item up.

## Sound

Every clip has its sound effects baked in. Mute the clip audio if you want to use your own library. The raw sounds are in `out/sfx/` (whoosh, hit, pop, tick, cash, riser, glitch, type) to reuse on A-roll punch-ins.

## Before you publish

- [ ] Replace every price in `data.json` with your receipt price, fill in `store`, `city`, `date`
- [ ] Set `prices_verified` to `true` (this removes the red EST. PRICES badge)
- [ ] `node render.mjs`, then update the VO numbers above from the first line of the render log
- [ ] Re-check the ranking order in your VO. It is computed from your prices and can change.
