# FogSift Website Roadmap: One Brick at a Time

**Date:** 2026-10-01
**Reads with:** `FOGSIFT_BUSINESS_BRIEF.md` (what exists), `FOGSIFT_CHANNEL_PLAN.md` (how the channel works). This document is the build order for the website, and the website is the back office for the business described in those two.

---

## 1. What the business is now (so every brick has a reason)

FogSift is an independent research practice with a public body of work on YouTube.

- **The proof:** published Research Briefs on the channel. A real question, deep research, sifted, a clear answer in 10 to 15 minutes. Every video is a free sample of the paid work.
- **The product:** research for hire. A **Research Week** (40 hours, one question, one written brief plus a video walkthrough) at **$2,500**. A **Research Sprint** (2 days, one narrow question) at **$1,000**. Hourly advisory and **tutoring** at **$75/hr**, sold in half-day blocks at $275.
- **The front door:** the **$20 "Sift This"** queue. Anyone can hand FogSift a question for $20 and get a short verdict video. It is the only same-week cash, the top of the funnel, and content for the channel.
- **The side income:** affiliate links under lessons and briefs. Disclosed every time. Never the point.
- **The credential:** a journalism degree, C-suite supply chain and ops consulting, and whatever is on the channel. The channel is the résumé.

The rate math (from the conversation): $1,000/week net after taxes needs about $1,300 in profit, about $1,450 in revenue, and realistically 20 to 25 billable hours, so the rate is $65 to $75/hr and the Research Week is $2,500 to $3,000. The numbers above sit at the bottom of that range on purpose. Raise them after the third paid week.

**Design rule for every page:** a stranger who has watched one video should be able to find the price, the proof, and the button in under ten seconds. Everything else is secondary navigation.

---

## 2. The site map we are building toward

```
fogsift.com
├── /                  Home: watch, the three offers, the $20 door, email capture
├── /research          Research for hire: Week, Sprint, what you get, how it works, book
├── /tutoring          Tutoring: what we teach, $75/hr, half-day blocks, book
├── /briefs            Published Research Briefs (the proof), one page per brief
│   └── /briefs/<slug> Video + written brief + sources + "want one of these?"
├── /sift              The $20 queue: how it works, submit, public queue
├── /how-we-make-money Disclosure, in plain words, one screen
├── /about             Presenter's bio, credentials, the mission in two sentences
├── /contact           One email, one scheduler
├── /start             Free "How to Talk to AI" for email (lead magnet)
├── /wiki/*            Stays. Reachable from footer and search.
└── footer only        vision, shouse, portfolio, engine, keepers-log, join, lore
```

Pages that go away from navigation (not deleted, just unlinked): `offers` (merged into research + tutoring + sift), `process` (merged into sift), `hi` (merged into about), `paperbin-saas` (future), demo pages.

---

## 3. The bricks

Each brick is one pull request, small enough to finish in one sitting, with a definition of done. Order matters: each brick assumes the ones before it. Bricks marked **(you)** need something only you can supply; everything else can be built on request.

### Phase 0: Foundation (done in PR #26)

- [x] One email (`fogsift@gmail.com`), one tagline ("Clear answers to good questions")
- [x] Placeholder testimonials and fake stat cards removed
- [x] Orphaned `/pricing` removed
- [x] Brief, channel plan, this roadmap

### Phase 1: Tell the truth (week 1)

Goal: zero contradictions on the site, and the business described above is what a visitor reads.

**Brick 1.1: Single source of truth for offers.**
Add an `offers` block to `src/content/site-data.json` with every price, duration, deliverable, and CTA. Every page that mentions an offer reads from it (via build.js placeholders), so a price is changed in one place.
Done when: `grep -r '\$20\|\$500\|\$2,500' src/*.html` returns only template placeholders.

**Brick 1.2: Reframe the $20 offer as "Sift This."**
One spec, everywhere: up to 1 hour, a 5 to 15 minute verdict video plus a one-page written summary, public by default with anonymization on request, 2 per day, refund any time before work starts. Pages: `index`, `offers`, `queue`, `faq`, `process`, `contact`, `terms`, `site-data.json`.
Done when: the deliverable, capacity, privacy and refund policy read identically on all eight pages.

**Brick 1.3: `/how-we-make-money`.**
One screen. The brand line ("Everything on the internet is an ad. Ours tells you it is."), then: research fees, tutoring, the $20 queue, affiliate links, what we never do (sell your data, take undisclosed money). Linked from the footer and from every video description.
Done when: page builds, passes HTML validation, and is in the footer.

**Brick 1.4: Replace the joke queue.**
`queue.json` becomes either real entries or an honest empty state: "First submissions land this week. Yours could be first." Keep the data shape so the Ko-fi webhook still fits. **(you: the first real submissions)**
Done when: no fictional entries render on `/queue`.

**Brick 1.5: Presenter's bio.**
`about` and the homepage bio become: what FogSift does, the credentials that matter for research (journalism degree, C-suite supply chain and ops work, years of AI-supported research), one sentence of mission. The van, the three continents and the brewery leave the sales pages. `hi.html` content folds into `about`.
Done when: the bio has no biographical detail that is not a reason to hire.

### Phase 2: The three doors (weeks 2 and 3)

Goal: a visitor can buy research, buy tutoring, or hand over $20, each from its own page, each with a button that works.

**Brick 2.1: `/research`.**
Research Week ($2,500) and Research Sprint ($1,000). Each with: what you get (written brief, video walkthrough, sources, one follow-up call), how it works (scope call, deposit, work week, delivery), what we don't do (legal, financial, medical advice). A "what a brief looks like" section that links to `/briefs`. CTA: "Book a scope call" to a scheduler (Cal.com, free). Secondary CTA: email.
Done when: a stranger can read the price, see an example, and book a call without composing an email.

**Brick 2.2: `/tutoring`.**
What we teach (AI tools for non-developers, automation, research methods, how to talk to AI). $75/hr, half-day block $275, small groups by quote. Who it is for, who it is not for. Same scheduler.
Done when: same test as 2.1.

**Brick 2.3: Scheduler + payment path.**
Cal.com embed or link for scope calls and tutoring blocks. Deposits for research: a Ko-fi shop item for the Sprint and a 50% Research Week deposit, or Stripe Payment Links if you want to keep 5% more per sale (Ko-fi nets ~$18.12 on $20; Stripe ~$19.12; the gap on $2,500 is about $125, which matters). **(you: choose Ko-fi or Stripe for the big tickets)**
Done when: each of the three doors has a working pay-or-book button tested end to end with a $1 item.

**Brick 2.4: Homepage rebuilt around the three doors.**
Above the fold: the tagline, one sentence of what FogSift does, "Watch a brief" (primary), and three cards (Research / Tutoring / Sift This, $20). Below: the latest three briefs, how we work, the free PDF for email, footer. Johnny Autoseed stays as the side-project card. Remove: the examples-from-the-queue block, the newsletter "under construction" notice, the five-step process (moves to `/sift`).
Done when: the home page has one primary CTA, three offer cards with prices, and nothing above the fold that is not one of those.

**Brick 2.5: Navigation and footer.**
Nav: Watch · Research · Tutoring · Sift This · Briefs · About. Footer: contact, how we make money, wiki, start (PDF), terms, privacy, then the long tail (vision, shouse, portfolio, engine, keepers-log, join).
Done when: nav fits on one line at 1024px and the mobile menu matches.

### Phase 3: The proof (weeks 3 to 6, grows forever)

Goal: the site shows the work, not just the prices.

**Brick 3.1: Briefs as a content type.**
`src/content/briefs/*.md` with front matter (title, question, date, video id, sources, tools used, affiliate links, verdict). Build.js compiles each to `/briefs/<slug>` the way it compiles the wiki, plus a `/briefs` index sorted newest first. Each page: embedded video, the written brief, sources, disclosure line, "Want one of these on your question? Research Week, $2,500" and "Sift This, $20." Added to the search index.
Done when: adding a markdown file and rebuilding publishes a new brief page.

**Brick 3.2: First three briefs published.** **(you: the videos)**
The first three Research Brief videos from the channel, written up. These are the "what a brief looks like" examples that `/research` links to.
Done when: `/briefs` shows three real entries.

**Brick 3.3: Real testimonials, real numbers.**
`testimonials.json` becomes real quotes from real queue and research clients, with permission, or the section stays removed. Stats, if any, are counts the build can compute (briefs published, questions sifted), never claims.
Done when: nothing on the site asserts a number it cannot show.

**Brick 3.4: Lead magnet and email.**
`/start`: the "How to Talk to AI" PDF free for an email, via Buttondown or Kit (free tier). The form posts to the provider; no backend needed. Replace every "newsletter coming soon" with this.
Done when: a test signup receives the PDF.

### Phase 4: The machine (weeks 6 to 10)

Goal: the parts that run while you are recording.

**Brick 4.1: Ko-fi webhook wired for real.**
Real KV namespace IDs in `wrangler.toml`, the verification token set, `queue.js` serving live entries, mock fallback off in production. **(you: Cloudflare and Ko-fi dashboards)**
Done when: a $20 test payment appears on `/queue` without a deploy.

**Brick 4.2: Brief and queue status pipeline.**
A queue entry moves in_queue → in_progress → delivered, and a delivered entry links to its brief page. One JSON edit or one KV write per transition.
Done when: a delivered queue item shows "Watch the answer" linking to `/briefs/<slug>`.

**Brick 4.3: Analytics that respect the brand.**
Cloudflare Web Analytics (free, no cookies, no banner). Events on the three CTAs and the email form. `TECH_DEBT.md` TD-008 closes.
Done when: the scoreboard's "clicks" column has a source.

**Brick 4.4: Video description generator.**
A small script: given a brief's markdown, output the YouTube description (disclosure line, links, verdict, the two CTAs, the how-we-make-money link). Keeps every description consistent without retyping.
Done when: `node scripts/describe.js briefs/<slug>.md` prints a paste-ready description.

### Phase 5: Compounding (month 3 onward)

Not scheduled. Each becomes a brick when the thing before it is producing.

- **Season 1 course page.** The 12-lesson playlist with worksheets and the Learning Lab installers, sold on Ko-fi shop ($29 to $79) or free for email. Built from briefs and lessons already published.
- **Sponsor page.** Audience numbers from analytics, rates (flat plus affiliate hybrid), what we will and won't promote. Goes up at 500 subscribers.
- **Research retainer.** Monthly standing hours for a company that keeps coming back. Appears on `/research` after the second repeat client.
- **Johnny Autoseed handoff.** Its own site and offers; FogSift keeps the side-project card and a "we fund this" line.
- **Wiki cleanup.** The old consulting-firm engagement model (`how-we-work.md`, `faq.md`) rewritten to match reality.

---

## 4. Working rules for the bricks

1. **One brick, one PR, one sitting.** If a brick will not fit in a sitting, it is two bricks.
2. **Every PR rebuilds `dist/` and runs `npm test`.** The pre-existing `engine.html` validation failure gets its own brick; nothing else ships red.
3. **Prices live in `site-data.json` only.** A price in HTML is a bug.
4. **Nothing on the site claims what it cannot show.** No stats without a source, no quotes without a person.
5. **The disclosure line is identical everywhere:** "FogSift earns a commission if you buy through our links. That is how this channel pays for itself." It is a template placeholder, not typed.
6. **Lore stays off the money pages.** Research, tutoring, sift, briefs, how-we-make-money, about, contact: plain. Everywhere else: as weird as you like.
7. **Deploy after every merged brick.** A brick that is not live is not a brick.

---

## 5. The next three bricks, in order

1. **Brick 1.1 + 1.2 together:** offers into `site-data.json`, the $20 offer reframed as Sift This on all eight pages. One PR. Needs nothing from you.
2. **Brick 1.3:** `/how-we-make-money`. One PR. Needs nothing from you.
3. **Brick 1.5:** presenter's bio. One PR. Needs you to confirm the three credentials to lead with (suggested: journalism degree; C-suite supply chain and operations consulting; years of building AI-supported research systems).

Then Phase 2 opens, and the first thing it needs from you is the Ko-fi vs Stripe decision for the big tickets and a Cal.com account.

---

## 6. What "done" looks like at 90 days

- Six pages a stranger can use: home, research, tutoring, sift, briefs, how we make money.
- Prices in one file. Zero contradictions.
- Ten or more published briefs, each a sample of the $2,500 product.
- A working queue with real entries moving to delivered.
- An email list with a reason to join.
- Analytics on the three buttons.
- At least one paid Research Sprint or Week, booked from the site, by someone who found you on YouTube.

That last line is the only metric that matters. Everything above it exists to make it happen.
