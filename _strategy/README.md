# FogSift Strategy

Read this folder before touching anything customer-facing. It is the business context the code serves. Started 2026-10-01 from a long working session with the owner; kept current by whoever makes a decision.

## The business in ten lines

> **Focus (latest decision):** FogSift does research and presents it, and that is all. See the top entry of `DECISIONS.md`. Where lines below mention lessons or tutoring, the latest decision wins.

1. FogSift is an **independent research practice** with a public body of work on YouTube.
2. The channel publishes **Research Briefs**: a real question, deep research, a clear answer in 10 to 15 minutes. Each is a free sample of the paid work.
3. Paid work: **Research Week $2,500** (40 hours, one question, written brief + video walkthrough), **Research Sprint $1,000** (2 days), **tutoring $75/hr** (half-day $275).
4. The front door is **"Sift This," $20**: hand FogSift a question, get a short verdict video. Only same-week cash; top of the funnel; content for the channel.
5. **Affiliate links** under lessons and briefs are side income, disclosed every time, never the point.
6. The owner has a **teacher's heart and hates sales**. The model is built so the viewer never pays and the vendor or the client does. Teach the outcome, link the tool, say the verdict, including "no."
7. **The brand is the sifter, not the person.** Christopher is named and on camera as a presenter. His personality, history and inner life stay off the sales pages and out of the content.
8. Brand line: **"Everything on the internet is an ad. Ours tells you it is."**
9. Voice: a competent operator explaining what they actually did to a smart friend outside the field. Plain, honest about uncertainty, dry humor in small doses, specific over impressive. No hype, no scarcity, no McKinsey cosplay.
10. **Johnny Autoseed** (FarmBot supply chains, autonomous labor for residential and commercial customers) is a separate business the owner is building. FogSift is the income engine that funds it. Keep it as a side-project card; do not let it compete for the FogSift CTA.

## Settled decisions

See `DECISIONS.md`. The short list: email is `fogsift@gmail.com`; tagline is "Clear answers to good questions"; pronoun is "we"; prices as above; lore stays off the money pages.

## The documents

| File | What it is | Read it when |
|---|---|---|
| `DECISIONS.md` | Dated log of every business decision and why | Before changing copy, prices, or offers |
| `BUSINESS_BRIEF.md` | What exists in the repo, the contradictions found, the voice guide, the original revenue analysis, the affiliate pivot | You need to know what the site says and why it is wrong |
| `CHANNEL_PLAN.md` | How the YouTube channel works: the teach-first model, syllabus, video shapes, selling rules, money by arrival date, weekly rhythm | You are writing anything that touches video, descriptions, or the channel's role |
| `WEBSITE_ROADMAP.md` | The target site map and the brick-by-brick build order with definitions of done | You are about to build anything |
| `BRICK_LOG.md` | Which bricks are done, which is next | Every session, first |

## Working rules (also in CLAUDE.md)

- One brick, one PR, one sitting.
- Prices live in `src/content/site-data.json` only. A price in HTML is a bug.
- Nothing on the site claims what it cannot show. No stats without a source, no quotes without a person.
- The disclosure line is identical everywhere and is a template placeholder.
- Lore (Lighthouse, Weft, Waft, Future Folk Guild, Captain Voss) stays off research, tutoring, sift, briefs, how-we-make-money, about, contact.
- Rebuild `dist/`, run `npm test`, deploy after every merged brick.
- The owner's writing preference: no em dashes. Use commas, periods, colons, or parentheses.

## How to update this folder

When a decision is made in a session, add a dated entry to `DECISIONS.md` and, if it changes the build order, edit `WEBSITE_ROADMAP.md` and `BRICK_LOG.md`. Do not fork the strategy into new root-level files; add here.
