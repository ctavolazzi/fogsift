# The Metric Mirage

A software company's key customer satisfaction metric improved for six consecutive quarters while customer churn quietly accelerated. This is a case study in how measurement systems can produce misleading signals, and how organizations can mistake proxy improvement for goal achievement.

---

## Background

The company — a mid-market B2B software vendor serving professional services firms — had adopted Net Promoter Score (NPS) as its primary customer health metric three years before the problem became visible. NPS was surveyed quarterly, tracked by customer success managers, and reported to the board as the headline indicator of customer satisfaction.

Over six quarters, NPS improved from 32 to 51 — a substantial jump by any measure. The customer success team was recognized. The metric was cited in investor communications. Leadership interpreted the trend as confirmation that a service improvement initiative launched 18 months earlier was working.

In Q7, the company noticed that its annual contract renewal rate had dropped from 87% to 71%. Churn had been accelerating for over a year.

---

## What the Metric Said vs. What Was Happening

**The NPS story:** Strong improvement, sustained trend, customer satisfaction increasing across segments.

**The churn story:** A small number of high-value, long-tenured customers were quietly leaving. Their lifetime value was high but their account count was low. They had rarely been surveyed — partly because they were fewer in number, partly because their customer success managers had good relationships and didn't want to risk those relationships with survey friction.

The customers who were surveyed — newer, smaller accounts — were genuinely more satisfied. The service improvement initiative had worked for them. Their NPS scores rose.

The customers leaving were not in the survey data. Their departure was invisible to the metric.

---

## The Structural Failure

Three distinct problems interacted:

**Selection bias in survey distribution.** NPS surveys were sent to contacts who had engaged with customer success in the prior 60 days. Long-tenured customers who weren't actively in projects — precisely those most at risk of quietly churning — were surveyed less frequently.

**Survivorship bias in reported scores.** Customers who had already decided to churn or were considering it were unlikely to respond to satisfaction surveys. The sample responding to surveys was systematically skewed toward satisfied customers.

**The account size / count mismatch.** The NPS methodology weighted responses equally regardless of account size. A small account and a large account both contributed one data point. Losing a few large accounts — the ones leaving — had minimal effect on average NPS while representing a substantial revenue impact.

---

## How It Remained Hidden

Several feedback loops that should have surfaced the problem were weak or absent:

**No early warning system for non-engagement.** The customer success team didn't systematically track login frequency, feature usage, or stakeholder relationship breadth — leading indicators that a relationship was cooling. By the time renewal conversations happened, the decision to leave was already made.

**Account expansion metrics obscured contraction.** Total revenue in the customer base had grown through new customer acquisition, which masked the contraction from churning existing customers. Net revenue retention — which measures expansion minus churn in the existing customer base — was not a reported metric.

**Customer exit interviews were inconsistent.** When customers did leave, the exit interview process was informal and inconsistently conducted. No systematic pattern analysis was done. If it had been, the common thread — that long-tenured customers felt the product had stagnated relative to alternatives — would have appeared.

**The "we have great relationships" assumption.** Customer success managers with strong personal relationships in accounts interpreted those relationships as indicators of account health. Relationship strength can be a genuine leading indicator — but it can also mean the customer likes the person while losing confidence in the product.

---

## Root Cause Analysis

The company's diagnostic process identified a cascade:

1. NPS was adopted as the primary health metric without analyzing its structural properties
2. Survey distribution was not designed to achieve representative sampling
3. NPS results were reported without accompanying data on survey response rates, sample characteristics, or what the survey was missing
4. Customer health was equated with surveyed satisfaction rather than assessed more holistically
5. Product investment decisions were made partly based on the positive NPS trend — reducing urgency around the roadmap gaps that long-tenured customers were noticing

The company had built a measurement system that was accurate about what it measured, but what it measured was not what it needed to know.

---

## Corrective Actions

Over the following two quarters, the company implemented several changes:

**Restructured NPS methodology.** Surveys were redesigned to achieve representative sampling by segment, tenure, and engagement level. Response rates were tracked and reported alongside scores. Survey timing was decoupled from recent support interactions.

**Added product engagement metrics.** Monthly active user rates, feature adoption breadth, and stakeholder relationship maps were added to account health scorecards. Declining engagement triggered proactive outreach.

**Implemented net revenue retention as a primary metric.** NRR — which accounts for expansion, contraction, and churn in the existing customer base — was added to board reporting alongside NPS.

**Systematized exit interviews.** A structured exit interview process was implemented, with quarterly thematic analysis. The product stagnation theme identified in year one of the new process accelerated three roadmap items.

**Segment health reviews.** Quarterly reviews of long-tenured, high-value customer cohorts were added as a separate process, with executive sponsorship and account-specific health plans.

---

## Lessons

**A metric that doesn't see the customers leaving can't tell you they're leaving.** Survey-based satisfaction metrics are vulnerable to selection bias in ways that are often invisible unless sampling methodology is scrutinized.

**NPS measures willingness to recommend, not retention intent.** These are related but not identical. Customers who like a product but are choosing an alternative because of budget constraints or switching to a competitor with a critical feature they need may still give high NPS scores.

**Account count and revenue concentration require different metrics.** In a customer base where value is concentrated in a small number of accounts, equal-weighted average metrics will underweight what matters.

**The absence of complaint is not the presence of satisfaction.** Long-tenured customers who don't engage with customer success, don't respond to surveys, and don't escalate are not necessarily fine. Non-engagement is a signal that requires active investigation.

**Improving a metric and improving the underlying goal are different achievements.** The service improvement initiative genuinely improved satisfaction among newer, smaller customers. That was real progress. The metric, by including that progress while excluding the silent departures of older customers, represented the progress while hiding its incompleteness.

---

*Related: [The Proxy Trap](../field-notes/019-the-proxy-trap.html), [Goodhart's Law](../concepts/goodharts-law.html), [Survivorship Bias](../concepts/survivorship-bias.html), [Signal vs Noise](../concepts/signal-vs-noise.html)*
