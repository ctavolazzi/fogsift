# Brick Log

The build order lives in `WEBSITE_ROADMAP.md`. This file tracks where we are. Update it in the same PR as the brick. "Needs owner" marks bricks blocked on something only the owner can supply.

**Next brick:** 1.1 + 1.2 (offers into `site-data.json`, Sift This consistent on all eight pages)

## Phase 0: Foundation

- [x] One email, one tagline (PR #26)
- [x] Placeholder testimonials and stat cards removed (PR #26)
- [x] Orphaned `dist/pricing.html` removed (PR #26)
- [x] Strategy folder: brief, channel plan, roadmap, decisions, this log (PR #26)

## Phase 1: Tell the truth

- [ ] 1.1 Offers as single source of truth in `site-data.json`
- [ ] 1.2 Sift This: one spec on index, offers, queue, faq, process, contact, terms, site-data
- [ ] 1.3 `/how-we-make-money`
- [ ] 1.4 Replace the joke queue (needs owner: first real submissions, or ship the honest empty state)
- [ ] 1.5 Presenter's bio (needs owner: confirm the three lead credentials)

## Phase 2: The three doors

- [ ] 2.1 `/research`
- [ ] 2.2 `/tutoring`
- [ ] 2.3 Scheduler + payment path (needs owner: Cal.com account; Ko-fi vs Stripe for big tickets)
- [ ] 2.4 Homepage rebuilt around three doors
- [ ] 2.5 Nav and footer

## Phase 3: The proof

- [ ] 3.1 Briefs as a markdown content type, compiled like the wiki
- [ ] 3.2 First three briefs published (needs owner: the videos)
- [ ] 3.3 Real testimonials or none
- [ ] 3.4 `/start` lead magnet + email provider

## Phase 4: The machine

- [ ] 4.1 Ko-fi webhook live with real KV (needs owner: Cloudflare + Ko-fi dashboards)
- [ ] 4.2 Queue → brief status pipeline
- [ ] 4.3 Cloudflare Web Analytics on the three CTAs
- [ ] 4.4 Video description generator script

## Phase 5: Compounding (unscheduled)

- [ ] Season 1 course page
- [ ] Sponsor page (at 500 subscribers)
- [ ] Research retainer offer
- [ ] Johnny Autoseed handoff
- [ ] Wiki engagement-model cleanup

## Housekeeping bricks

- [ ] Fix pre-existing `engine.html` HTML validation failure
- [x] Mark `FEATURE_VOID_AUDIT.md` and `V0.1.0-RELEASE-PLAN.md` as superseded (PR #26)
