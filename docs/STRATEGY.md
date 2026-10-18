# FogSift: strategy brief

*An independent research practice: send a costly decision, get back a sourced brief and a video walkthrough, every claim graded.*

Strategy brief, October 18, 2026 · Stage: v0.2.0 site · Main idle since March 1 · fogsift.com

> **Positioning.** For small-business operators facing a costly decision (a vendor, a tool, a supplier, build or buy) without the hours to research it, FogSift is an independent research practice that returns a sourced brief and a video walkthrough, every claim graded and “no” allowed as an answer, unlike unverified AI deep research or a generic $800 industry report.

**The call.** Commit to the owner’s own October 1 call, “the work is research, presented,” and cut everything else from the brand. Settle the site first (one price table, one set of terms), then sell three tiers to small operators: a $20 Sift, a $1,000 two-day Sprint and a $2,500 Research Week. Each paid job becomes an anonymized public brief on @fogsift, which becomes the site’s proof.

## Where it stands today

| Area | Today | Source |
|---|---|---|
| Stage | Version 0.2.0 shipped February 23; main last changed March 1. A static site on Cloudflare Pages. | version.json, git log, CLAUDE.md |
| Offers on main | A free 15 to 30 minute call by email, a $5 AI field guide PDF, a $20 Queue Response on Ko-fi, a $500 Deep Dive, custom work by quote. | src/offers.html |
| Conflicting terms | Pages disagree on the deliverable (a 30 to 90 second video, or an hour plus a PDF), on capacity (3 a day, or 10 a week) and on refunds. | src/offers.html, fogsift\_services.pdf |
| Plumbing | Storage IDs are placeholders, there is no analytics, and the repo has 1 star. | wrangler.toml, TECH\_DEBT.md |
| Latest decision, unmerged | “The work is research, presented.” Research Week $2,500, Research Sprint $1,000, a $20 “Sift This”; buyers are operators, not the C-suite; tutoring on hold. | claude/fogsift-business-brief: \_strategy/DECISIONS.md (October 1) |

## Market

Custom decision research for small business operators, delivered as a sourced brief and proven in public by a video channel.

- **$150B+**: Global insights industry, 2024; market research alone about $56B. Source: [ResearchWorld (search result)](https://researchworld.com/articles/inside-the-153bn-insights-industry)
- **$420.2B**: US management consulting, 2026. Source: [IBISWorld (search result)](https://www.ibisworld.com/united-states/industry/management-consulting/1421/)
- **36.2M**: US small businesses; 29.8M of them have no employees. Source: [Adwave, citing the SBA (search result)](https://adwave.com/resources/us-small-business-count)

FogSift needs a very small slice: the 12-month target is $1,450 a week, about one Research Week every other week plus a few Sifts.

## Audience segments

Five segments. Small-business operators come first: money rides on their decisions, public sources can answer most of them, and they are the buyer the owner picked on October 1.

### Small-business operators (beachhead), fit 4 of 5

- **Who:** Owners and managers choosing a vendor, tool, supplier, or whether to build or buy.
- **Size:** About 6.4M US employer firms (36.2M minus 29.8M).
- **Job to be done:** Make a costly decision on evidence.
- **Pains:** No hours to research; AI answers come unverified.
- **Uses today:** ChatGPT, peers, SCORE mentors, Upwork.
- **Will pay:** Upwork researchers $25 to $70 an hour; an IBISWorld spotlight report $800.
- **Reach them:** The owner’s network, Chico business groups, search.

Dollar-sized decisions that public sources can answer.

### Mid-size firms in the owner’s network, fit 4 of 5

- **Who:** Past contacts with an operations or supply chain question.
- **Size:** Unknown; a personal list.
- **Job to be done:** One question answered properly, without a hire.
- **Pains:** Expert calls are costly; staff are busy.
- **Uses today:** Expert networks, consultants.
- **Will pay:** GLG expert calls $400 to $1,200 an hour (a vendor’s comparison).
- **Reach them:** Personal email.

The best price, from a small list.

### Solo founders and makers, fit 3 of 5

- **Who:** One-person businesses and hobby builders.
- **Size:** Up to 29.8M nonemployer firms.
- **Job to be done:** Is this worth building or buying?
- **Pains:** Too many options, no time to compare.
- **Uses today:** Clarity.fm calls, AI chat.
- **Will pay:** Low; fits the $20 tier.
- **Reach them:** YouTube, Threads.

Volume, but small checks.

### Creators who want fact-checked scripts, fit 2 of 5

- **Who:** YouTubers and newsletter writers.
- **Size:** Unknown.
- **Job to be done:** A script with sources.
- **Pains:** Research time; errors on camera.
- **Uses today:** Subscribr and similar script tools.
- **Will pay:** Subscribr $299 to $747 a year.
- **Reach them:** The tournament prompt pack.

A software market; it splits focus from research.

### Viewers, through sponsors, fit 2 of 5

- **Who:** People who watch research and teardown videos.
- **Size:** Unknown; no audience yet.
- **Job to be done:** Learn the verdict.
- **Pains:** Sponsored reviews they cannot trust.
- **Uses today:** Other channels.
- **Will pay:** Small-channel sponsor integrations $50 to $250.
- **Reach them:** @fogsift on YouTube.

Needs an audience first.

**Why this beachhead:** Each decision has a dollar value, public sources answer most of them, every job can become an anonymized public brief for the channel, and it is the buyer the owner chose on October 1.

## Competitive landscape

| Alternative | Price | Strength | Weakness | How we differ |
|---|---|---|---|---|
| AI deep research (ChatGPT, Perplexity) | About $20 a month | Instant and cheap. | Unverified; no one signs off. | Graded evidence and a human who signs the brief. |
| Upwork researchers | $25 to $70 an hour; experts $60 to $120+ | Flexible, many specialists. | Hiring friction and uneven quality. | Fixed scope, fixed price, a public library of past briefs. |
| Clarity.fm | Per minute, set by the expert; about a 15% fee | A fast expert opinion. | No written deliverable. | A brief plus a video, with sources. |
| IBISWorld industry reports | $800 spotlight; $2,850 full report | Authoritative and broad. | Not your question. | Answers the exact decision in front of you. |
| SCORE mentors | Free; 10,000 volunteers, 300,740 sessions in 2024 | Free and local. | Advice, not research. | A partner and a referral source, not a rival. |

## Value proposition and offer

- **For operators:** Send the decision. In two days: what to pick, what it costs, what could not be verified, and every source linked. Evidence grades on each claim, a receipts page, and a public corrections log.
- **For network firms:** A researcher for a week: one question, 40 hours, and a brief your team can forward, without an expert-network bill. Fixed scope and price, agreed before work starts.

### Pricing ladder

| Step | Tier | Price | What | Benchmark | Status |
|---|---|---|---|---|---|
| 1 | Research Briefs | Free | Public, anonymized briefs and videos; the field guide PDF free for an email (it is $5 today). Case File 001 is ready to publish: the owner’s own nine-project portfolio review, already researched and sourced. | The proof the site lacks; feeds every paid tier. | Proposed |
| 2 | Sift This | $20 | One short question, answered in public; capped at 2 a week. Replaces the $20 Queue Response. | The price of a month of ChatGPT Plus. | Proposed |
| 3 | Research Sprint | $1,000 | About 16 hours over two days; $1,250 after three sales. Absorbs the $500 Deep Dive. | Upwork’s expert band puts 16 hours at $960 to $1,920. | Proposed |
| 4 | Research Week | $2,500 | 40 hours on one question, with a forwardable brief; $3,500 after three sales. | $62.50 an hour, the floor of Upwork’s expert band; fractional consultants average $141 to $181; IBISWorld charges $2,850 for a generic report. | Proposed |

## Go to market

1. **@fogsift Research Briefs.** Public proof that doubles as marketing. Ad revenue is a bonus: new applicants after February 1, 2027 need 8,000 watch hours. **First move:** Verify every price in EP 001 (the cheap-nutrition video) and publish it with a receipts page.
2. **The owner’s network.** Warm contacts convert better than cold email, which gets 2% to 4% replies (5.8% on lists under 50). **First move:** Send 20 personal emails with EP 001 and an offer of a Sprint pilot.
3. **Chico small-business groups.** The SBDC, SCORE and the chamber gather operators with live decisions. **First move:** Give one talk, “Check a vendor’s claim in 20 minutes,” with three free Sifts.

## Plan

### Next 90 days

| Date | Milestone | Target |
|---|---|---|
| 2026-11-01 | One site | One price table and one set of terms; real storage IDs; analytics on |
| 2026-11-22 | Briefs | 3 Research Briefs published, 100% of claims sourced; the first is Case File 001, the nine-project review |
| 2026-12-13 | First sales | 10 paid Sifts; 20 network emails sent |
| 2027-01-10 | Sprints | 2 Research Sprints delivered ($2,000) |
| 2027-01-31 | Go or no-go | 1 Research Week sold; 150 email subscribers; 6 briefs live |

### 12-month goals

- $1,450 a week in revenue, averaged over the final 8 weeks to October 31, 2027.
- 24 public briefs and 1,000 email subscribers.
- 5 named testimonials from real clients, and 3 repeat clients.

## KPIs

| Metric | How to measure | Target |
|---|---|---|
| Briefs published | Count per month on the site. | 2 a month |
| Weekly revenue | Ko-fi and Stripe payouts, summed every Friday. | $1,450 by October 2027 |
| Ladder conversion | Sift to Sprint to Week, from a buyer sheet. | 1 in 10 Sift buyers buys a Sprint |
| Accuracy | Corrections per brief, in a public log. | Under 1 per brief |
| Channel pull | 28-day watch hours, subscribers and email signups. | 150 email subscribers by January 31 |

## Risks

| Risk | Level | Mitigation |
|---|---|---|
| Underpricing and burnout: an hour of work for $20 | High | Cap Sifts at 2 a week; raise Sprint and Week prices after three sales each. |
| AI errors in a published brief | Medium | Evidence grades, a receipts page and a public corrections log. |
| Privacy: briefs are public by default, clients have private data | Medium | Anonymize every public brief; an NDA on paid tiers. |
| Sprawl and time: 11 site themes, lore pages, side projects, nine projects for one owner | High | Freeze non-research work; go or no-go on January 31, 2027. |

## Untangling

The FogSift name covers a consulting site, a GitHub organization, a dev server other apps depend on, a tournament on another brand’s site and a YouTube channel. It should mean one thing: the research practice.

### What ties it to other projects today

- The tournament lives on folktech.io (docs/fogsift-tournament/, October 9). Its prompt pack builds a fact-checked script tool also called FogSift; Software Club and Cohort are unpriced.
- The FogSift GitHub organization holds 9 repos, including Lantern and CivicOS, while this site’s own repo sits on the owner’s personal account.
- Port 5051 is not an API. It is this site’s own dev server, started by a serve:adapter script on the dev/fogsift-news branch; CivicOS proxies /api and /workflow-engine to it.
- Lantern’s Substack script reads from the FogSift project folder; \_pyrite’s WAFT scaffolding sits in this repo.
- Other projects on the site: Johnny Autoseed cards, Shouse and vision pages, AI Learning Lab installers, PaperBin, TMGotcha.
- The owner’s time: main has been idle since March.

### Steps to stand alone

1. FogSift means the research practice: the site, @fogsift (briefs only), the case-file engine and the fact-check method.
2. Move out: Lantern and CivicOS get their own names and organizations; WAFT and \_pyrite files are deleted here; the Engine and Workflow Engine go into CivicOS, which ends the port 5051 tie; the news dashboard goes to Lantern or is dropped.
3. Move Shouse, the vision page and the installers to Johnny Autoseed; retire the teardowns, PaperBin and TMGotcha pages.
4. Tournament: keep only the prompt pack, as a free “FogSift method” download. Software Club, Cohort and voting leave the brand.
5. Move this repo into the FogSift organization once it holds only FogSift.

## Decisions for the owner

1. Confirm “research, presented,” and merge the strategy and cleanup branches?
2. The tournament: the Folk Technica page says move it to FogSift; this page says keep only the method. Which one?
3. Any paid one-on-one walkthroughs, or finished research only?
4. Which credentials does the site lead with?
5. Gmail or a domain mailbox? Ko-fi, or Stripe above $1,000?
6. Do Lantern and CivicOS leave the FogSift organization?
7. Weekly hours, and what January 31 result stops the project?

## Sources

1. [ResearchWorld: the insights industry](https://researchworld.com/articles/inside-the-153bn-insights-industry): Above $150 billion
2. [Ipsos, citing ESOMAR](https://www.ipsos.com/en-nl/node/1081941): Market research about $56 billion
3. [IBISWorld: US management consulting](https://www.ibisworld.com/united-states/industry/management-consulting/1421/): $420.2 billion
4. [Adwave: US small business count](https://adwave.com/resources/us-small-business-count): 36.2 million (SBA)
5. [Kaplan: small business statistics](https://kaplancollectionagency.com/business-advice/54-small-business-statistics-for-2025): 29.8 million without employees
6. [Upwork: market researcher cost](https://www.upwork.com/hire/market-researchers/cost/): $25 to $70 an hour
7. [Upwork: hourly rates](https://www.upwork.com/resources/upwork-hourly-rates): Experts $60 to $120+
8. [GoFractional: consultant rates](https://www.gofractional.com/insights/rates/consultant/industries/professional-services): $141 to $181 an hour
9. [Clarity.fm: how rates are set](https://clarity.fm/help/articles/23/how-are-rates-for-experts-determined-on-clarity): Per-minute rates
10. [Talkspresso: Clarity.fm comparison](https://talkspresso.com/blog/clarity-fm-vs-talkspresso-2026): About a 15% fee (a competitor’s page)
11. [CleverX: expert network comparison](https://cleverx.com/blog/best-expert-network-platforms-complete-comparison-guide): GLG rates (a vendor’s page)
12. [IBISWorld: report prices](https://help.ibisworld.com/en/articles/8119074-how-much-does-it-cost-to-purchase-one-report): $800 and $2,850
13. [Costbench: ChatGPT vs Perplexity](https://costbench.com/compare/chatgpt-vs-perplexity/): $20 a month
14. [SCORE: 2024 results](https://www.score.org/press-releases/score-mentors-helped-start-nearly-60000-small-businesses-last-year/): Volunteers and sessions
15. [OutlierKit: Subscribr pricing](https://outlierkit.com/resources/subscribr-pricing/): $299 to $747 a year
16. [OutlierKit: YouTube sponsorship rates](https://outlierkit.com/resources/youtube-sponsorship-rates/): $50 to $250
17. [NewscastStudio: YouTube Partner Program 2027](https://www.newscaststudio.com/2026/08/10/youtube-partner-program-monetization-changes-2027/): 8,000 watch hours
18. [lemlist: cold email response rates](https://lemlist.com/blog/cold-email-response-rate): 5.8% on lists under 50
19. [Smartlead: cold email reply rates](https://www.smartlead.ai/blog/cold-email-reply-rate): 2% to 4%
20. [SchoolMaker: Ko-fi pricing](https://schoolmaker.com/blog/ko-fi-pricing): 5% on commissions

---

*Prepared October 18, 2026 from the fogsift repo (main and four branches, read-only) and web research. Page fetches were blocked during research, including fogsift.com itself, so what is live there is unchecked and every web figure comes from search results; verify a figure before quoting it. The positioning, prices and plan are recommendations. This is the public edition: internal operational detail is kept in a private copy.*
