# Planning Fallacy

*We consistently underestimate how long things will take, how much they will cost, and how many things will go wrong — even when we know our past projects ran over.*

— Daniel Kahneman

---

## The Principle

The planning fallacy, identified by Daniel Kahneman and Amos Tversky, describes the systematic bias toward optimistic estimates for time, cost, and outcomes on future plans.

It's not ignorance. People know projects run late. They've seen it happen before. They've done it themselves. And they still estimate optimistically — because when planning a specific task, humans focus on the task itself rather than the broader class of similar tasks.

The result: estimates are almost always too low. Schedules almost always slip. Costs almost always exceed budget. Not because the people involved are incompetent, but because this is how human cognition works under certainty about the local plan.

---

## The Mechanism

The core mechanism is the distinction Kahneman calls **inside view** vs. **outside view**.

**Inside view** — the natural planning posture:
You focus on the specific project. You imagine the sequence of steps, identify the resources, and estimate based on your plan. Your plan, in your mind, is the reasonable scenario.

**Outside view** — the statistical posture:
You look at similar projects in the past. What's the actual distribution of outcomes? What fraction came in on time and on budget? What did the overruns look like?

The inside view is vivid and feels accurate. The outside view is statistical and feels irrelevant — "those other projects had different problems than mine." This feeling is wrong, but it's persistent.

---

## Examples

**Construction and infrastructure.** The Oxford study on megaprojects found that 90% of projects ran over budget, with average cost overruns of 28%. The projects that didn't run over were exceptions, not the rule.

**Software development.** The original Standish CHAOS report found that most software projects ran significantly over time and budget, with many abandoned before completion. Developers consistently underestimate complexity.

**Home renovation.** The phrase "while we're at it" drives cost overruns in virtually every home renovation project. Once work begins, additional problems are discovered, scope expands, and the original estimate becomes irrelevant.

**Legal disputes.** Parties to litigation routinely overestimate their probability of winning, leading to settlements that could have been reached earlier or trials that produce worse outcomes than settlement offers.

**Product launches.** "We'll launch in Q3" has become a trope because product development almost never proceeds as planned. Hidden dependencies, unexpected bugs, and changing requirements are the norm.

---

## Why the Outside View Gets Ignored

1. **Uniqueness bias.** People believe their project is meaningfully different from the reference class. Sometimes it is. Usually the ways it's "different" don't affect schedule and cost in the way imagined.

2. **Optimism bias.** Humans overestimate the probability of positive outcomes and underestimate the probability of negative outcomes, especially for future events they can influence.

3. **Motivated reasoning.** Commitments are made based on optimistic estimates. Once made, people have incentives to maintain the optimistic framing.

4. **Planning compression.** Detailed planning of individual steps creates false precision. The plan looks complete. The gaps between steps — integration problems, review cycles, unexpected dependencies — are invisible.

5. **Unknown unknowns.** By definition, the risks that cause overruns are ones you didn't anticipate. If you could anticipate them, you'd have planned for them.

---

## The Reference Class Forecast

The most robust mitigation is **reference class forecasting**, developed by Kahneman and later operationalized by Bent Flyvbjerg for infrastructure projects:

1. **Identify the reference class.** What's the relevant category of comparable projects? Be honest — "our project is unique" is usually an excuse, not an argument.

2. **Get the distribution.** What does the actual historical data show? Not best-case outcomes — the full distribution, including tail events.

3. **Anchor your estimate to the base rate.** Start from the distribution, not from your plan. Then adjust based on specific factors that genuinely make your project different.

4. **Don't let your inside view override the outside view.** The inside view feels more accurate. It isn't.

---

## The 90% Rule

A useful heuristic in software and project management: take your best estimate, then assume you're only 90% through when you think you're done.

This accounts for the disproportionate amount of time spent on the "last 10%" — integration, testing, polishing, fixing the problems you didn't know existed. The first 90% of a project takes 90% of the time; the last 10% takes the other 90%.

---

## What To Do

**Use historical data.** Track your own completion times. The most relevant reference class for your team is your team's own history. If your estimates are consistently 60% of actual time, apply a 1.7x multiplier as a baseline correction.

**Add explicit contingency.** Instead of hoping the plan is right, budget for it being wrong. A realistic contingency budget isn't pessimism — it's an accurate prior.

**Stage commitments.** Don't lock in a full schedule at the start of a project. Commit to the next milestone, learn from it, then commit to the next. Each stage provides calibration data.

**Separate plan from schedule.** Your plan is your intention. Your schedule is a probabilistic estimate. Treat them differently. The plan can be optimistic; the schedule should reflect the outside view.

**Use pre-mortem analysis.** Before finalizing an estimate, ask: "Assume this project has run significantly over schedule. What happened?" This activates outside-view thinking while the plan is still adjustable.

---

## The Relationship to Goodhart's Law

When project schedules become performance targets, the planning fallacy compounds. Teams optimize for hitting the date rather than for the actual work, leading to estimates that are even more compressed — because the cost of being late is visible while the cost of cutting corners is deferred.

---

*Related: [Pre-Mortem Analysis](../frameworks/pre-mortem.html), [Second-Order Effects](./second-order-effects.html), [Cognitive Biases](./cognitive-biases.html), [Goodhart's Law](./goodharts-law.html)*
