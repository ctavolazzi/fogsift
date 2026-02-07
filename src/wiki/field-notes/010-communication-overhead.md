# Field Note: Communication Overhead

**Date:** 2025-02-05
**Sector:** TEAMS
**Read Time:** 4 minutes

---

Adding a person to a team doesn't add one communication channel. It adds *n*. And the cost of those channels compounds in ways that teams never see coming.

## The Math

The number of communication channels in a team follows a simple formula:

**Channels = n(n-1)/2** where n = number of people

| Team Size | Channels | Change |
|-----------|----------|--------|
| 3 | 3 | — |
| 4 | 6 | +3 |
| 5 | 10 | +4 |
| 6 | 15 | +5 |
| 8 | 28 | +13 |
| 10 | 45 | +17 |
| 15 | 105 | +60 |
| 20 | 190 | +85 |

Going from 5 to 10 people doesn't double communication overhead. It quadruples it. This is why small teams that "just added a few people" suddenly can't ship anything.

## The Observation

A 4-person engineering team was shipping a feature every two weeks. Velocity was high. Communication was effortless — everyone knew what everyone else was doing.

Management wanted to "accelerate" by doubling the team to 8 people. The result:

- **Week 1-4:** Onboarding. Existing team spent half their time answering questions.
- **Month 2:** New people started contributing, but coordination meetings doubled.
- **Month 3:** Two people unknowingly built overlapping features. A week of work was thrown away.
- **Month 4:** Shipping velocity finally reached... roughly the same as the original 4-person team.

Eight people producing the same output as four. The difference was consumed by communication overhead.

## Where It Hides

### Meetings

A 30-minute meeting with 8 people doesn't cost 30 minutes. It costs 4 hours of combined time, plus context-switching costs for 8 people, plus the time to schedule it, plus the time to write up decisions for people who missed it.

### Slack/Email

Every message in a group channel is a potential interruption for every member. A 20-person channel with 50 messages/day means 1,000 potential interruptions per day across the team. Even if each interruption costs 2 minutes of context-switching, that's 33 person-hours lost daily.

### Decision-Making

A decision that one person makes in 5 minutes takes a 3-person team 15 minutes (discussion). A 10-person team? It takes a meeting, a follow-up email, and three dissenting opinions. Elapsed time: 2 weeks.

### Knowledge Sync

On a 4-person team, everyone knows everything. On a 12-person team, information lives in pockets. Critical knowledge reaches the people who need it slowly, if at all. This is how things fall through cracks.

## Brooks's Law

> "Adding manpower to a late software project makes it later." — Fred Brooks, *The Mythical Man-Month* (1975)

It was true in 1975. It's still true. New team members don't just add capacity — they add communication load, onboarding cost, and coordination complexity. The break-even point (where the new person contributes more than they consume) takes weeks or months.

## Mitigation Strategies

### Keep Teams Small

Amazon's "two-pizza rule" (teams small enough to feed with two pizzas) isn't about pizza. It's about keeping communication channels manageable. Optimal team size for most knowledge work: 4-6 people.

### Reduce Coupling

If Team A doesn't need to coordinate with Team B, their communication overhead is zero. Design systems and organizations to minimize cross-team dependencies:
- Clear ownership boundaries
- Well-defined APIs between teams
- Autonomous teams that can ship independently

### Async by Default

Not every communication needs to be real-time. Default to async (written docs, recorded decisions, shared dashboards) and reserve sync (meetings, calls) for high-bandwidth needs like conflict resolution and creative collaboration.

### Document Decisions

Every undocumented decision will be re-discussed. Every re-discussion consumes everyone's time. Write decisions down with context and rationale. Link them where people will find them.

### Reduce Meeting Defaults

- Not every topic needs a meeting. Many need a document.
- Not every meeting needs every person. Invite the minimum viable attendees.
- Not every meeting needs 30 minutes. Default to 15.
- Not every meeting needs to happen. Ask "could this be an email?" seriously.

## The Counter-Intuitive Move

Sometimes the fastest way to ship faster is to *remove* people from the project. A focused 3-person team with zero coordination overhead will outship a 10-person team drowning in meetings.

This feels wrong. Fewer people = less output, right? Only if you ignore communication overhead. In practice, fewer people = less overhead = more time spent building = more output.

---

*See also: [Bottlenecks (Field Note)](/wiki/field-notes/004-bottlenecks.html) | [Systems Thinking](/wiki/concepts/systems-thinking.html) | [Process Mapping](/wiki/tools/process-mapping.html)*
