# Goodhart's Law

*When a measure becomes a target, it ceases to be a good measure.*

— Marilyn Strathern, paraphrasing economist Charles Goodhart

---

## The Principle

Goodhart's Law observes that any statistical regularity will tend to collapse once pressure is placed upon it for control purposes.

In plain terms: the moment you use a metric to evaluate or reward performance, people optimize for the metric — not for what the metric was supposed to represent.

The metric and the thing you care about start as correlated. Once the metric becomes a target, that correlation breaks.

---

## Examples

**Test scores and education.** Schools that are evaluated on test scores shift teaching toward test preparation. Test scores rise. Learning doesn't necessarily follow.

**Lines of code and productivity.** If developers are measured by lines of code written, they write more lines of code. Code quality, maintainability, and actual output may decline.

**Customer satisfaction surveys.** If customer service reps are rated on post-interaction surveys, some will focus on getting good surveys rather than resolving issues well. Response rates drop, coaching on survey language increases, problem-solving takes a back seat.

**Sales call volume.** If salespeople are measured by number of calls, they make more calls — shorter ones, to easier contacts, with less follow-through.

**Burn rate and startup growth.** Investors who reward rapid user growth incentivize acquisition metrics. Companies acquire users at unsustainable cost, inflate numbers, or attract users who won't stay.

---

## Why It Happens

Three mechanisms drive Goodhart's Law:

**Gaming.** People directly manipulate the metric without changing underlying behavior. Adding filler sentences to hit a word count. Requesting positive reviews. Splitting one task into three to show more "completed items."

**Tunnel vision.** People genuinely focus on the metric at the expense of unmeasured things. Not dishonest — just optimizing for what's visible. A salesperson who hits call targets but neglects relationship-building isn't cheating; they're following the incentive.

**Measurement displacement.** The hardest-to-measure things — judgment, collaboration, long-term thinking — get crowded out by the easier-to-measure things that proxies stand in for.

---

## The Diagnostic Question

For any metric you use to make decisions:

*If someone wanted to look good on this number without actually doing the thing the number is supposed to represent, how would they do it?*

If you can answer that question easily, you have a Goodhart's Law exposure.

---

## What To Do About It

**Use multiple metrics.** It's harder to game a system of metrics simultaneously than to game a single one. No individual metric becomes the target.

**Measure the proxy and the thing.** If customer satisfaction scores are your proxy for customer experience, periodically audit actual customer experience directly — interviews, churn analysis, cohort behavior. Keep the proxy honest.

**Change metrics regularly.** The longer a metric is in place as a target, the more optimized-for it becomes. Rotating metrics reduces the opportunity for gaming to calcify.

**Separate measurement from evaluation.** If a metric is purely diagnostic (no consequences attached), it retains its signal value longer. Consequences distort behavior.

**Qualitative alongside quantitative.** Numbers alone are gameable. Qualitative evidence — cases, stories, observations — is harder to manufacture at scale and often catches what the numbers miss.

**Watch for metric improvement without outcome improvement.** The clearest signal that Goodhart's Law is operating: the number goes up while the thing you actually care about stays flat or declines.

---

## The Harder Problem

Goodhart's Law doesn't have a clean solution. The alternative to measuring performance is not measuring it — which has its own failure mode: no visibility, no accountability, no feedback.

The practical answer is humility about what metrics mean. Metrics are evidence, not truth. They're signals that require interpretation, not scorecards that stand on their own.

An organization that treats metrics as information is in better shape than one that treats them as the objective — even if the first organization has worse-looking metrics.

---

## Related Concepts

**Campbell's Law:** The sociological equivalent, formulated around the same time: "The more any quantitative social indicator is used for social decision-making, the more subject it will be to corruption pressures and the more apt it will be to distort and corrupt the social processes it is intended to monitor."

**Cobra Effect:** An incentive structure that backfires. Named for a British colonial policy in India that paid for dead cobras — leading citizens to breed cobras for the bounty.

**Surrogate endpoint problem:** In medicine, treating a measured surrogate (e.g., cholesterol levels) as if it were the actual outcome (e.g., heart attacks). A drug can improve the surrogate without improving the outcome.

---

*Related: [Signal vs Noise](./signal-vs-noise.html), [Survivorship Bias](./survivorship-bias.html), [Second-Order Effects](./second-order-effects.html), [Incentive Alignment](../field-notes/006-incentive-alignment.html)*
