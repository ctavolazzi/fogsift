# The Proxy Trap

*When measuring the thing that matters is hard, we measure something easier instead. Then we optimize the proxy so aggressively that the original goal is forgotten.*

---

## The Pattern

A hospital wants to reduce patient wait times. It starts tracking average wait time by department. Department heads, now evaluated on this metric, find ways to improve it: reclassifying some waits as "active care" time, routing patients who will inflate the average to other departments, focusing staff attention on fast-moving cases rather than complex ones. Average measured wait time falls. Patient experience may not have improved — or may have gotten worse.

This is the proxy trap: a sequence in which (1) a meaningful goal is identified, (2) a proxy metric is adopted because the goal is hard to measure directly, (3) the proxy is optimized directly, and (4) the proxy diverges from the goal it was meant to represent.

This is closely related to Goodhart's Law ("When a measure becomes a target, it ceases to be a good measure"), but the proxy trap is more specific: it describes the mechanism — the substitution of a measurable proxy for an intrinsically important goal — that underlies Goodhart failures.

---

## Why Proxies Are Necessary

Direct measurement of the thing that actually matters is often genuinely impossible or prohibitively costly:

- Customer happiness can't be directly observed; surveys, reviews, and retention rates are proxies
- Employee engagement can't be directly observed; survey scores, absenteeism, and turnover are proxies
- Learning can't be directly observed; test scores and grades are proxies
- Quality can't be fully observed; defect rates, support tickets, and return rates are proxies
- Value can't be directly observed; revenue, profit, and growth rate are proxies

None of these proxies is identical to the thing it represents. Each is a partial, imperfect signal. This is fine — partial signals are better than no signals — as long as the organization maintains awareness that the proxy is a proxy.

The trap is when the proxy is treated as if it were the goal itself.

---

## The Divergence Mechanism

When a proxy becomes a target, optimization pressure changes how people interact with it:

**Gaming.** People find ways to improve the metric that don't improve the underlying goal. Call center workers respond to "calls answered" metrics by hanging up on difficult calls. Schools respond to standardized test score targets by narrowing curriculum to tested subjects. Sales teams respond to volume targets by closing deals that will churn.

**Selective measurement.** Data collection is directed toward cases that improve the metric and away from cases that don't. Outcome metrics exclude populations that would drag averages down. Satisfaction surveys are sent only to happy customers.

**Boundary redefinition.** What counts as success gets redefined to align with what's actually achievable. The target narrows to what the metric tracks. Unmeasured aspects of the goal become invisible and eventually irrelevant.

**Causal inversion.** The proxy, originally a symptom of goal achievement, is pursued directly as if it were causal. Hiring for "cultural fit" scores rather than for cultural contribution. Publishing volume targets rather than impact targets.

Over time, the proxy and the goal decouple. The metric improves. The underlying goal may not.

---

## Organizational Examples

**Revenue as a proxy for value.** Revenue measures value captured, not value created. When optimized directly, it can produce rent-seeking, lock-in strategies, and customer exploitation — all of which increase revenue while destroying long-term value.

**Employee satisfaction scores as a proxy for engagement.** High satisfaction scores can reflect comfort and complacency as easily as they reflect genuine engagement. Organizations that optimize satisfaction scores may reduce the productive friction that actually drives performance.

**Lines of code or story points as a proxy for development output.** These metrics are immediately gameable: code can be bloated, stories can be split arbitrarily. Teams that optimize these metrics produce neither good software nor real productivity.

**Net Promoter Score (NPS) as a proxy for customer health.** NPS captures willingness to recommend, which correlates with customer health — but imperfectly. Organizations that optimize NPS can improve the score through aggressive survey timing and customer selection without improving actual customer outcomes.

**School attendance as a proxy for learning.** Attendance correlates with learning but isn't learning. Schools that optimize attendance (attendance bonuses, penalties for absence) may reduce absenteeism while achieving little educational improvement.

**Body count metrics in armed conflict.** Perhaps the most famous large-scale proxy trap: kill counts treated as a proxy for strategic progress, creating perverse incentives that distorted strategy and decision-making.

---

## Detection

The proxy trap is often difficult to detect from inside because both the metric and the reporting around it are managed by the same people who are being evaluated on it.

Signs that a proxy has decoupled from its goal:

**The metric improves while informal signals deteriorate.** Satisfaction scores go up but customer churn accelerates. Defect metrics improve but support volume increases. Engagement scores rise but the best people are leaving.

**People spend significant energy managing the metric rather than the underlying reality.** If a meaningful portion of effort goes toward ensuring good metric outcomes rather than good outcomes, the proxy is dominating.

**The metric's definition changes frequently.** When a metric stops telling a useful story, organizations often modify the definition rather than the behavior — smoothing discontinuities, excluding inconvenient cases, adjusting baselines.

**There's no mechanism to surface what the metric misses.** If dissatisfied customers, failing students, or churning employees have no voice, the metric is running unchecked.

---

## Working With Proxies Without Falling Into the Trap

**Maintain proxy awareness.** Explicitly name what the proxy misses. Make the gap between the proxy and the goal part of regular discussion. "Our NPS is tracking well, but we know it doesn't capture X — what's our read on X separately?"

**Use multiple proxies.** A single proxy will be optimized. Multiple proxies that partially measure the same underlying goal are harder to optimize simultaneously in ways that diverge from the goal. Include proxies that capture different failure modes.

**Include leading and lagging indicators.** Proxies that can be gamed in the short term often have lagging consequences. Pairing short-term metrics with longer-term outcomes (retention, lifetime value, renewal rates) creates accountability across time horizons.

**Protect qualitative channels.** Quantitative proxies systematically miss the things people don't say or can't say to a survey. Maintain mechanisms for qualitative signal: direct customer conversations, regular skip-level conversations with employees, observational research.

**Audit the gap regularly.** Periodically compare what the metric says to what people doing the work experience. Ask: where does the metric's story diverge from the ground-level story? That divergence is the proxy gap.

---

*Related: [Goodhart's Law](../concepts/goodharts-law.html), [Incentive Alignment](./006-incentive-alignment.html), [Signal vs Noise](../concepts/signal-vs-noise.html), [Survivorship Bias](../concepts/survivorship-bias.html)*
