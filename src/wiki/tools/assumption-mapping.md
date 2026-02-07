# Assumption Mapping

Assumption mapping is the practice of making your implicit beliefs explicit, then testing the ones that matter most. Every plan is built on assumptions. Most of them are invisible until they fail.

## The Principle

> "It ain't what you don't know that gets you in trouble. It's what you know for sure that just ain't so." — (attributed to) Mark Twain

The most dangerous assumptions are the ones you don't know you're making. They feel like facts. They're embedded so deeply in your thinking that questioning them feels absurd — until reality proves them wrong.

## Why It Matters

Every business plan, product strategy, and project estimate is a stack of assumptions:

- "Customers will pay for this" (assumption)
- "We can build it in 3 months" (assumption)
- "The market is growing" (assumption)
- "Our team has the skills" (assumption)
- "The technology will scale" (assumption)

If any critical assumption is wrong, the plan fails. But most teams never list their assumptions, let alone test them.

## The Process

### Step 1: Extract Assumptions

Go through your plan, strategy, or decision and ask: "What must be true for this to work?"

**Categories of assumptions:**

**Customer assumptions:**
- Who is the customer?
- What problem do they have?
- How much will they pay?
- How will they find us?
- What will make them switch?

**Technical assumptions:**
- Can we build this?
- Will it perform at scale?
- Will it integrate with X?
- How long will it take?

**Business model assumptions:**
- Revenue will cover costs by month X
- Customer acquisition cost will be $Y
- Retention rate will be Z%
- Market size is sufficient

**Team assumptions:**
- We have the right skills
- Key people will stay
- We can hire what we need
- The team can work together effectively

**Market assumptions:**
- The market is growing
- Regulations won't change
- Competitors won't react in way X
- Customer behavior will remain stable

### Step 2: Map on Two Axes

Plot each assumption on a 2x2 matrix:

| | **Have Evidence** | **No Evidence** |
|---|---|---|
| **Critical** (plan fails if wrong) | **Monitor** — Keep validating | **Test Immediately** — Highest priority |
| **Non-critical** (plan survives if wrong) | **Accept** — Move on | **Note** — Test if convenient |

The top-right quadrant is where your attention belongs. These are the critical assumptions you have no evidence for. They're the biggest risks in your plan.

### Step 3: Design Tests

For each critical, unvalidated assumption, design the cheapest, fastest test possible:

| Assumption | Test | Timeline | Success Criteria |
|------------|------|----------|------------------|
| Customers will pay $50/mo | Landing page with pricing + signup | 1 week | 50+ email signups |
| We can process 10K req/sec | Load test on prototype | 3 days | Sustain 10K for 5 min |
| Users prefer feature X over Y | A/B test or user interviews | 2 weeks | 60%+ prefer X |

**Good tests are:**
- **Fast** — Days or weeks, not months
- **Cheap** — Minimal investment before validation
- **Decisive** — Clear pass/fail criteria defined in advance
- **Honest** — Designed to disprove the assumption, not confirm it

### Step 4: Update the Map

After testing, move assumptions to the appropriate quadrant. Some will be validated (move to "Have Evidence"). Some will be invalidated (time to adjust the plan).

The map is a living document. Review it as you learn.

## Example: Launching a New Service

**The plan:** Offer a $500/month advisory retainer for small businesses.

**Assumption extraction:**
1. Small businesses will pay $500/month for advisory (critical, no evidence)
2. We can deliver enough value in 2 hours/month (critical, some evidence)
3. Target market is 10,000+ businesses (non-critical, have data)
4. Word of mouth will drive referrals (critical, no evidence)
5. We can handle 20 clients simultaneously (critical, no evidence)

**Test priority:**
1. → Run a pilot with 3 clients at $500/month. Do they renew?
4. → Ask pilot clients if they'd refer. Track actual referrals.
5. → Take on clients incrementally, monitor quality at each step.
2. → Track actual time spent per client during pilot.

## Common Pitfalls

### Assuming the Obvious

"Of course customers want faster delivery." Do they? Or do they want cheaper delivery? Or more reliable delivery? The "obvious" assumption is often the most dangerous because nobody questions it.

### Testing Too Late

If you wait until you've built the full product to test whether customers want it, you've wasted months. Test the riskiest assumptions first, before significant investment.

### Confirmation Bias in Testing

If your test is "ask friends if they'd use this," you'll get false positives. Design tests that cost the tester something (time, money, attention) to get honest signal.

### Treating Assumptions as Binary

Most assumptions aren't simply true or false. "Customers will pay" is actually "X% of customers in segment Y will pay $Z." Test with enough nuance to be useful.

## Integration with Other Tools

- Use **[Five Whys](/wiki/tools/five-whys.html)** to uncover assumptions hidden behind surface-level statements
- Use **[Decision Matrix](/wiki/frameworks/decision-matrix.html)** after validating assumptions to choose between options
- Use **[Risk Assessment](/wiki/frameworks/risk-assessment.html)** to evaluate what happens if critical assumptions are wrong
- Feed invalidated assumptions into **[Root Cause Analysis](/wiki/concepts/root-cause.html)** to understand why your model was wrong

---

*See also: [First Principles Thinking](/wiki/concepts/first-principles.html) | [Risk Assessment](/wiki/frameworks/risk-assessment.html) | [Cognitive Biases](/wiki/concepts/cognitive-biases.html)*
