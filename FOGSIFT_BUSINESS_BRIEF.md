# FogSift Business Brief

**Date:** 2026-10-01
**Purpose:** One document that answers three questions: how FogSift makes money now, what FogSift sounds like, and how all the pieces fit. Written from a full read of the repo (site copy, offers, terms, wiki, journal, strategy docs) plus outside research on payment rails and YouTube monetization.

---

## 0. The one-paragraph version

You do not have an options problem. You have a consistency problem. FogSift already has a product ($20 video response), a payment rail (Ko-fi plus a working webhook), an upsell ($500 Deep Dive), a real high-ticket skill (C-suite supply chain and ops consulting), and a content engine (the queue becomes YouTube videos). What is stopping money is that the site tells five different stories about the deliverable, four about capacity, three about privacy, uses two taglines and four email addresses, shows a joke queue (Godzilla, Mothman, a Roomba) as if it were real, and displays placeholder testimonials from executives who do not exist. Fix the story, run the $20 offer for real, and sell the big work through your network while the channel grows.

---

## 1. Where the money is (ranked by time-to-cash)

### Rung 1: The $20 Video Response (this week)

This is the engine. It is cheap enough that strangers will try it, and every sale is also a video. Pick ONE spec and make every page say it:

| Item | Decision |
|---|---|
| Name | **Video Response** (retire "Problem Shark Tank", "Focus Session", "Move the Needle", "Queue Response") |
| Price | **$20 floor**, more by agreement for bigger scopes |
| Time | **Up to 1 hour** of focused work |
| Deliverable | **Unlisted YouTube video (5 to 15 minutes) + one-page PDF summary**. Not 30 to 90 seconds. The video IS the product and the content; a short clip serves neither. |
| Privacy | **Public by default, anonymization on request, unlisted-only on request.** Say this once, the same way, everywhere. |
| Capacity | **2 per day.** Pick one number and delete the others (3/day, 10/week). |
| Refunds | **Full refund any time before work starts. None after.** |
| Outcome | One of three: "Let's go deeper" / "I know people" / "You should do it" |

Why Ko-fi stays for now: the webhook already exists in `functions/api/webhook/kofi.js`, Ko-fi gives you a storefront and the $5 PDF shop, and the fee difference is small at your volume. Ko-fi takes 5% on commissions plus ~2.9% + $0.30 processing, so a $20 sale nets about **$18.12**. Stripe Payment Links would net about **$19.12** (processing only). Ko-fi Gold ($12/mo) removes the 5% and pays for itself at roughly **$240/month in sales**. Switch to Gold at that point, not before.

What must happen for Rung 1 to be real:
1. Replace the joke queue in `src/content/queue.json` with real entries (see Rung 2 for how to get them). A fake queue tells a careful buyer the business is fake.
2. Set the real Cloudflare KV namespace IDs in `wrangler.toml` so the webhook actually writes submissions (journal 001 notes they are placeholders).
3. Make every page agree with the table above: `index.html`, `offers.html`, `queue.html`, `faq.html`, `process.html`, `contact.html`, `terms.html`, `site-data.json`.

### Rung 2: Seed the queue with 10 real problems (this week, in parallel)

An empty or fake queue sells nothing. Ask 10 people you actually know (past clients, Chico contacts, YouTube commenters, Threads followers) to submit a real problem. Comp them or let them pay the $20; either way you get 10 real queue entries, 10 videos for the channel, and your first honest testimonials. This replaces the placeholder testimonials in `src/content/testimonials.json`, which should come off the site immediately (fictional VPs endorsing a real business is a trust problem and arguably a legal one).

### Rung 3: The $500 Deep Dive (first one within 30 days)

Already specified on the offers page (1 to 2 hour session, written documentation, one follow-up, 2 weeks of email access, $20 credit applies). Two gaps:
- The CTA is a `mailto:`. Put a free scheduler behind it (Cal.com is free; Calendly free tier also works). A buyer who has decided to spend $500 should not have to compose an email.
- Every $20 video should end with the line: "If you want me to go deeper on this, that's the Deep Dive." The upsell is scripted into the content.

### Rung 4: The Big Work (highest revenue, sold through people not pages)

Your homepage bio says you have done supply chain and operations consulting at the C-suite level for major tech companies. One contracted engagement at $3k to $10k is worth 150 to 500 queue sales. This does not sell from a website; it sells from a message to someone who already knows your work. The website's job here is to be the thing you link to so they can "judge the thinking, not the credentials" (your line, and a good one).

Action: list 20 past contacts. Send each a short note with one relevant queue video attached. Ask for the problem, not the contract.

### Rung 5: The $5 "How to Talk to AI" PDF (lead magnet, not revenue)

At $5 on Ko-fi you net about $4.50 and learn nothing about the buyer. You currently have **zero email capture** anywhere on the site. Recommendation: make the PDF free in exchange for an email (Buttondown, Beehiiv, or Kit all have free tiers) and let it feed the newsletter you have marked "coming soon." Keep the $5 Ko-fi listing up if you like; the free-for-email version is the one that builds an asset.

### Not this quarter

Future Folk Guild membership, PaperBin SaaS, the Tech Teardown series, the shouse build, the FastAPI memory system, the Engine demo. All interesting, none of them move a stranger up a rung this quarter. Keep building them if they energize you, but keep them off the customer-facing path until a rung above is producing.

### YouTube revenue: do not count on it yet

The Partner Program needs 1,000 subscribers plus 4,000 public watch hours in 12 months (or 10M Shorts views in 90 days). Fan-funding features unlock earlier at 500 subs and 3,000 hours. Consistent weekly channels typically take 6 to 18 months to full monetization. Important deadline: **applicants accepted after February 1, 2027 need 8,000 watch hours**, double the current bar. Getting in before then is worth a push. Until then, the channel's job is proof and funnel, not AdSense.

---

## 2. Brand voice and tone

The voice already exists in the best lines on the site. The job is to codify it and remove the two things that fight it.

### The voice, in your own words

- "We work on the weird ones."
- "Maybe I solve it. Maybe I don't. But either way, you walk away with something."
- "Judge the thinking, not the credentials."
- "No black box consulting."
- "Low enough to be accessible. High enough to keep submissions real. The price isn't the point; the work is."
- "Don't send anything you'd panic about if it leaked."
- "We read everything. We won't ghost you."
- "Our goal is to make ourselves unnecessary."
- "The org chart is just the marketing brochure."

### Voice definition

**FogSift sounds like a competent operator explaining what they actually did, to a friend who is smart but not in the field.**

| Trait | Do | Don't |
|---|---|---|
| Plain | Short sentences. Concrete nouns. Numbers when you have them. | "Leverage synergies." "Best-in-class." |
| Honest about uncertainty | "Maybe I solve it. Maybe I don't." "We're figuring this out as we go." | Guarantees you can't back. Fake stats ("100% satisfaction"). |
| Dry humor, lightly applied | One joke per page, usually in a heading or aside. The spinnable Gold Star badge is the right dose. | Comedy queue entries on a page where people are deciding whether to pay you. |
| Specific over impressive | "Our app crashes every Tuesday." "45% throughput increase." | "Transformational outcomes for enterprise stakeholders." |
| Shows the work | Recorded sessions, visible process, "here's how I'd approach it." | Credentials, logos, McKinsey cosplay. |
| Respects the reader's time | "No pitch, no pressure." "No form. Just an email." | Hidden terms, upsell traps, five emails. |

### Three decisions to make once

1. **Tagline.** The code and docs say "Straight answers to complicated questions." The homepage title and handout say "Clear answers to good questions." Recommendation: **"Straight answers to complicated questions."** "Straight" carries the honesty trait; "complicated" matches "the weird ones."
2. **Pronoun.** The site mixes "I" and "we." Recommendation: **"we"**, defined once on the About page as "me, the AI systems I've built, and the people I know." That sentence already exists in your services copy ("me + AI + friends + network"). It makes "we" honest rather than inflated.
3. **One email.** Pick `hello@fogsift.com` or `christopher@fogsift.com` and replace `fogsift@gmail.com`, `info@`, and `newsletter@` everywhere. A Gmail address next to a $500 offer undercuts the whole thing.

### Two things fighting the voice

**McKinsey drift.** `FEATURE_VOID_AUDIT.md` and the release plan define the target as C-suite at $10M to $500M companies expecting "a professional, polished experience on par with McKinsey-level firms." That is the opposite of the voice and of the $20 offer. The C-suite work is real, but it comes through your network, not through a landing page trying to look like a Big Four firm. Delete the fake executive testimonials and the "15+ Engagements / 100% Satisfaction / 8+ Industries" stat cards. Replace them with real queue results as they come in, even if the first one is "helped a guy fix a Raspberry Pi that crashed every two hours."

**Lore sprawl.** The Lighthouse, Captain Voss, Foggie, WSFT radio, Weft and Waft, the Future Folk Guild, PaperBin, the Operator Mindset, Ghost Protocol, Industrial Noir. This is good material and clearly fuel for you. Keep it in `_AI_Journal/`, the wiki, and eventually the channel. Keep it off the offers, queue, FAQ, process, contact and terms pages. A buyer with a problem wants to know what they get for $20; they can discover the lighthouse after they trust you.

### Who you are actually talking to

Not the C-suite. The honest audience, from your own copy: curious operators and makers with a problem that is "eating up their time," who can spend $20 without asking anyone, and who like watching someone think out loud. Small business owners, solo founders, builders, people with "things nobody else will look at." The executives will find you through a person, and when they do, this voice is what makes you memorable next to the firms that all sound the same.

---

## 3. The mental model (so it keeps making sense)

Everything FogSift does fits on one ladder. If a task does not move someone up a rung, it is not revenue work.

```
  WATCH            $20                 $500                 CONTRACTED
  YouTube     ->   Video Response  ->  Deep Dive        ->  The Big Work
  free             1 hr, video+PDF     1-2 hr, docs,        supply chain, data,
                   public by default   follow-up, private   food security, robotics
```

- **The channel** exists to make strangers trust you enough for Rung 1.
- **The queue** exists to produce the channel's content and the first testimonials.
- **The Deep Dive** exists to catch the people who want privacy and depth.
- **The Big Work** is where the real money is, sold through people.

Everything else in the repo sorts into one of three bins:

| Bin | What's in it | Rule |
|---|---|---|
| **Content** | Wiki (47 pages), field notes, case studies, Tech Teardowns, vision, shouse | Publish when it supports a rung. Otherwise it waits. |
| **Infrastructure** | Build system, themes, Ko-fi webhook, KV queue, FastAPI memory, Engine demo | Only touch it when a rung needs it. |
| **Future** | Johnny Autoseed, Future Folk Guild, PaperBin SaaS, wildlife sanctuary | Keep the flame; keep it off the sales pages. |

### How Johnny Autoseed relates

Johnny Autoseed is a different business with a different buyer: residential and commercial customers who want to move labor from manual to autonomous, starting with FarmBot. It needs supply chains, product, and capital. FogSift is the consulting-and-content engine that funds you and builds the audience in the meantime. Your own join page already says it: "To get there, we need income, grant funding, sponsors, or the right partnership." FogSift is the income. Keep it linked as "a side project" on the FogSift site; give it its own site and offers rather than letting it compete for the FogSift CTA.

---

## 4. The next seven days

Checklist, in order. Items 1 to 4 are copy and config. Items 5 to 7 are sales.

1. [ ] Decide the three "once" decisions above: tagline, pronoun, email.
2. [ ] Rewrite the offer to the Rung 1 spec on all eight pages. Rebuild, test, deploy.
3. [ ] Remove placeholder testimonials and stat cards. Remove the joke queue. (An empty queue with "First submissions land this week" is more honest than Godzilla.)
4. [ ] Set real KV namespace IDs so the Ko-fi webhook writes to the queue.
5. [ ] Ask 10 real people for 10 real problems. Record the first video within 48 hours of the first submission.
6. [ ] Put Cal.com or Calendly behind "Book a Deep Dive."
7. [ ] Message 20 past professional contacts with one finished queue video and the question "what's the problem eating your week?"

Success for week one is small and concrete: one real paid queue entry, one published video, one Deep Dive conversation started, zero contradictions on the site.

---

## 5. Sources

Payment rails:
- [Ko-fi pricing](https://ko-fi.com/pricing) and [Does Ko-fi take a fee?](https://help.ko-fi.com/hc/en-us/articles/360002506494-Does-Ko-fi-take-a-fee)
- [Ko-fi fees 2026 breakdown](https://knowyourcut.com/blog/kofi-fees-2026)
- [Stripe Payment Links](https://stripe.com/payments/payment-links) and [Stripe fees 2026](https://www.wearefounders.uk/a-guide-to-stripe-fees-in-2025-what-founders-need-to-know/)
- [Gumroad fees 2026](https://dodopayments.com/blogs/gumroad-fees-explained)

YouTube:
- [YouTube Partner Program requirements 2026 (vidIQ)](https://vidiq.com/blog/post/youtube-partner-program-guide/)
- [YouTube monetization requirements 2026 and 2027 changes](https://iamcreator.io/blog/youtube-monetization-requirements-2026)
- [Monetizing a faceless channel in 2026](https://www.gofaceless.ai/en/blog/monetizing-youtube-partner-program-2026)

Micro-consulting models:
- [Asynchronous micro consulting](https://indieideas.substack.com/p/23-asynchronous-micro-consulting)
- [Micro-consulting as a 2026 side hustle (Forbes)](https://www.forbes.com/sites/sarahhernholm/2025/12/11/micro-consulting-a-2026-side-hustle-you-can-start-at-home/)
- [What solo consultants charge in 2026](https://soloclientstack.com/fractional/solo-consultant-rates)

Repo sources read: `src/index.html`, `src/offers.html`, `src/queue.html`, `src/faq.html`, `src/process.html`, `src/contact.html`, `src/terms.html`, `src/hi.html`, `src/about.html`, `src/join.html`, `src/vision.html`, `src/content/site-data.json`, `src/content/queue.json`, `src/content/testimonials.json`, `src/content/fogsift_services.md`, `src/wiki/*`, `functions/api/webhook/kofi.js`, `FEATURE_VOID_AUDIT.md`, `V0.1.0-RELEASE-PLAN.md`, `SITEMAP-PLAN.md`, `KOFI_INTEGRATION.md`, `TECH_DEBT.md`, `_AI_Journal/*`, `_work_efforts/devlog.md`, `fogsift_services.pdf`.
