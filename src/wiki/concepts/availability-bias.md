# Availability Bias

*We judge probability by how easily examples come to mind — not by how often they actually occur.*

---

## The Principle

Availability bias (also called the availability heuristic) is the tendency to estimate the likelihood of events based on how quickly relevant examples spring to mind. Vivid, recent, or emotionally significant events are more "available" to memory, so they feel more probable — even when base rates say otherwise.

Tversky and Kahneman identified this heuristic in 1973. The core observation: when asked to estimate how common or probable something is, people substitute a simpler question — *how easily can I recall an example?* — and answer that instead.

This substitution is often reasonable. Frequent events do tend to leave more memory traces. But the heuristic misfires systematically when memorability diverges from frequency.

---

## Why Memory Misleads Probability Estimates

**Recency.** Events that happened recently are easier to recall than equally significant events from the past. A data breach last month feels more likely to recur than one that happened three years ago — even if the frequency of breaches hasn't changed.

**Vividness.** Events that are dramatic, emotional, or specific are more memorable than routine, statistical ones. A single account of a catastrophic failure stays in memory longer than a dataset showing the actual rate of catastrophic failures.

**Coverage.** Heavily covered events feel more common. If the news reports extensively on one type of risk, that risk becomes cognitively available regardless of its actual prevalence. Plane crashes receive vastly more coverage per fatality than car crashes, which is why people systematically overestimate the relative danger of flying.

**Personal experience.** Events we've experienced firsthand are more available than events we've only heard about. An entrepreneur who survived a market downturn weighs that risk differently than one who hasn't.

**Social amplification.** In groups, the same vivid stories get retold, which means the events in those stories become increasingly available to everyone in the group — while base rates remain invisible.

---

## Organizational Manifestations

**Risk mispricing after events.** Organizations dramatically increase investment in preventing the last disaster. After a major fraud, internal controls are tightened everywhere. After a major outage, redundancy is added everywhere. The risks that haven't occurred recently are underweighted.

**Strategy bias toward recent experience.** Leaders who experienced a recession make conservative capital allocation decisions long after the conditions that produced the recession have changed. Leaders who haven't experienced a recession may be insufficiently cautious.

**Overweighting visible problems.** In a meeting, the problem that someone raised vividly last week crowds out the more serious problem that was presented as a quiet data point two months ago. The vivid story is available; the data point is not.

**Vendor and partner selection.** Decision-makers tend to select vendors they have direct experience with or whose names they frequently encounter — regardless of whether those vendors are objectively superior for the task.

**Hiring patterns.** If a company's last bad hire came from a particular background (e.g., startup experience, specific school), that background becomes cognitively associated with poor hiring outcomes. The availability of the bad outcome distorts subsequent hiring decisions beyond what the evidence warrants.

**Performance evaluation.** Recent performance is disproportionately available at review time. An employee who had one excellent week before annual review is often evaluated more highly than one who performed consistently well all year but had a mediocre last week.

---

## The Base Rate Gap

The failure mode behind availability bias is the substitution of a different question for the actual question:

- **Actual question:** What is the true probability of X?
- **Substituted question:** How easily can I recall examples of X?

The actual question requires base rate information — how often X actually occurs across a reference class. Base rates are dry, statistical, and easy to ignore. Vivid examples are engaging, concrete, and easy to recall.

Kahneman and Tversky's inside view / outside view distinction describes this: the inside view draws on the specific, vivid details of the current situation; the outside view consults the base rate across similar situations. Availability bias is a symptom of over-relying on the inside view.

---

## Where Availability Bias Does Useful Work

Not all availability-based reasoning is wrong. The heuristic exists because it usually works:

- Things that happen frequently do leave stronger memory traces
- Personal experience is often legitimately informative about likely outcomes
- Domain experts develop intuitions that are partly availability-based and are genuinely accurate within their domain

The problem isn't that people use availability — it's that they use it without correcting for the known ways it misfires.

---

## Countermeasures

**Explicitly seek base rates.** Before relying on recalled examples, ask: what is the actual historical frequency of this type of event? Base rates are corrective; they force comparison against the outside view.

**Name the vivid case.** When you notice you're reasoning from a specific, memorable example, make it explicit: "I'm thinking about this because of [specific event]. Is that case representative, or is it memorable because it was unusual?"

**Seek disconfirming examples.** The antidote to availability of positive cases is active retrieval of counter-cases. "What are examples of this type of thing going badly?"

**Standardize evaluations.** When making repeated judgments (performance reviews, credit decisions, vendor selection), use structured rubrics that force consideration of dimensions beyond what's most salient. Structure reduces the influence of whatever happens to be most available.

**Slow down after major events.** In the aftermath of a vivid event, decision-making is most distorted. Major outages, fraud discoveries, market crashes — the period immediately following is the highest-risk time for availability-biased policy changes. Deliberate cooling periods reduce this effect.

**Track actual frequencies.** Organizations that maintain systematic records of outcomes are less susceptible to availability distortion than those that rely on anecdote and memory. Data systems that surface base rates at the moment of decision-making are particularly valuable.

---

*Related: [Cognitive Biases](./cognitive-biases.html), [Confirmation Bias](./confirmation-bias.html), [Survivorship Bias](./survivorship-bias.html), [Anchoring Bias](./anchoring-bias.html), [Planning Fallacy](./planning-fallacy.html)*
