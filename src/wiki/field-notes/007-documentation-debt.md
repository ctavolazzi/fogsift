# Field Note: Documentation Debt

**Date:** 2024-11-28
**Sector:** ENGINEERING
**Read Time:** 4 minutes

---

Technical debt is well understood. Documentation debt is its quieter, more insidious cousin.

## The Observation

Client was struggling with onboarding. New engineers took months to become productive. Everyone blamed the complexity of the codebase.

We interviewed recent hires. Asked what slowed them down.

- "There's a wiki, but half the pages are outdated."
- "I spent three days figuring out something that took my mentor five minutes to explain."
- "The README says one thing, but the code does something else."
- "I was afraid to ask because everyone seems so busy."

The problem wasn't code complexity. It was documentation debt.

The system had evolved. The documentation hadn't. What was written was wrong. What was right was unwritten.

## What Is Documentation Debt?

Documentation debt accumulates when:
- Docs aren't created when systems are built
- Docs aren't updated when systems change
- Knowledge lives in people's heads instead of accessible sources
- Outdated docs are left in place, misleading future readers

Like technical debt, documentation debt compounds. The longer you wait, the harder it is to catch up.

## The Cost of Documentation Debt

### Onboarding Time

Every new person has to reconstruct the knowledge that could have been documented. Multiply this by every hire, and the waste is staggering.

### Expert Dependency

When only certain people know how things work, they become bottlenecks. Everything flows through them. They can't take vacation. They can't work on new things.

### Repeated Mistakes

Without documentation, each person discovers the same pitfalls independently. Lessons don't transfer. Mistakes repeat.

### Decision Paralysis

When no one knows why things are the way they are, no one wants to change them. "It might be like that for a reason."

### Tribal Knowledge Risk

See [Field Note: Tribal Knowledge](/wiki/field-notes/005-tribal-knowledge.html). Undocumented knowledge walks out the door when people leave.

## Where Documentation Debt Hides

### Architecture Decisions

Why was it built this way? What alternatives were considered? What are the trade-offs? This context is almost never written down.

### Configuration

What do these settings mean? Why are they set to these values? What happens if you change them?

### Procedures

How do you deploy? How do you recover from failure? How do you handle the edge cases?

### History

What did we try before? What didn't work? What constraints existed that might have changed?

## Paying Down Documentation Debt

### Make It Part of the Work

Documentation isn't a separate task. It's part of completing the work. A feature isn't done until it's documented.

### Write for the Future

Write for someone who doesn't know what you know. Your future self qualifies.

### Capture Decisions

When you make a significant decision, write down:
- What you decided
- What alternatives you considered
- Why you chose this option
- What would make you reconsider

### Kill Zombie Docs

Outdated documentation is worse than no documentation. It misleads. Either update it or delete it.

### Create Forcing Functions

- Code reviews that check for doc updates
- Onboarding feedback that identifies gaps
- Regular doc audits
- Ownership assignment for doc sections

## The Resolution

We implemented a documentation sprint. Two weeks of capturing the critical knowledge that was trapped in heads.

More importantly, we changed the process:
- PRs now require doc updates for user-facing changes
- Architecture Decision Records (ADRs) for significant choices
- Onboarding includes creating documentation as you learn
- Doc ownership rotates quarterly

Six months later, onboarding time had halved. And the senior engineers weren't getting interrupted as often.

## The Takeaway

Documentation isn't overhead. It's infrastructure. Every hour not spent documenting is borrowed from the future. Eventually, the debt comes due.

---

*If it isn't written down, you'll explain it again. And again. And again.*

