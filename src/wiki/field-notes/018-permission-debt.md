# Permission Debt

*Every approval required to get work done is either adding real value or incurring a tax on the organization's speed.*

---

## The Pattern

Every organization accumulates a stock of required permissions over time. Approvals to spend money. Sign-offs to communicate with clients. Authorization to push code. Committee review before launching anything. Multiple layers of management review before any decision reaches implementation.

Each individual approval feels sensible when it's created. It was probably created in response to something that went wrong: an unauthorized expenditure, a rogue email, a deployment that broke things. The approval is the solution. The solution accretes. And over time, the organization finds itself encased in a structure of required permissions that slows everything down without preventing much.

This is permission debt: the accumulated stock of approval requirements that were reasonable individually but are collectively costly, and that persist long after the conditions that justified them have changed.

---

## How Approval Layers Form

**Incident response.** Something goes wrong. Someone acted without authorization and caused a problem. The response is to require authorization for that type of action going forward. Sensible. But the incident passes, the context changes, the person who caused the problem leaves — and the approval requirement remains.

**Risk aversion at the margin.** Leaders who are uncomfortable with uncertainty require approval for decisions they're not sure about. Over time, "things I'm not sure about" expands to mean "things that could possibly go wrong" — which is most things. The approval requirement grows.

**Organizational mistrust.** When management doesn't trust that people will make sound decisions, approval requirements are the mechanism for inserting management judgment into lower-level decisions. The approval layer is, in this reading, a vote of no-confidence in the people doing the work.

**Compliance and audit requirements.** External requirements genuinely mandate some approval layers. These legitimate requirements can expand over time as the compliance function interprets mandates conservatively, and as organizations adopt policies designed for large-enterprise contexts in small-team settings.

**Organizational amnesia.** The approval requirement was created by someone who understood why it was necessary. That person is gone. No one else knows why it exists. So it continues to exist, because removing things that exist requires action, and action is more visible than inaction.

---

## What Permission Debt Costs

**Cycle time.** Every required approval is a waiting period. In organizations with multiple layers of required approval, the time from "decision made" to "action taken" can be dominated by wait time rather than work time.

**Context loss.** Approvals require context transfer. The person seeking approval must reconstruct for the approver the situation that requires the decision. The approver must form a judgment based on a summary. Context is lost at each transfer. Bad decisions get approved; good decisions get slowed by confusion.

**Motivation degradation.** People who must seek approval for routine decisions experience their judgment as untrusted. This erodes motivation, particularly for high-agency individuals who are precisely the people most likely to have good judgment worth trusting.

**Risk homogenization.** When all decisions go through the same approval process, the approval layer applies a uniform risk filter. This filter may be too strict for some decisions and too loose for others. The result is not lower risk — it's homogenized risk, with the approval layer adding the illusion of risk management without the substance.

**Blame diffusion.** Approved decisions become collective decisions. When approved decisions go wrong, accountability diffuses across everyone in the approval chain. This makes it harder to learn from failures and easier for bad decision-making to persist.

---

## Diagnostic Questions

To identify whether an approval requirement is adding value or just incurring cost:

**What problem does this approval solve?** If no one can articulate a specific failure mode that this approval prevents, it may be legacy structure rather than functional governance.

**How often is this approval rejected or modified?** If the answer is "almost never," the approval isn't adding judgment — it's adding latency. A rubber stamp is not governance.

**What would happen if this approval were removed?** If the answer is "probably nothing," the approval may already be inert. Test this hypothesis.

**Who is the approver, and do they have relevant expertise?** Approvals by people without domain knowledge add delay without improving decisions. The approver's value must come from somewhere.

**How long does the approval take?** Approval time is a direct productivity tax. Long wait times should be scrutinized even if the approval itself is otherwise justified.

---

## Reducing Permission Debt

**Audit and expire.** Create a regular process for reviewing approval requirements. For each one: state the original rationale, assess whether that rationale still applies, and sunset requirements that no longer have a clear justification.

**Trust floors, not ceilings.** Rather than requiring approval for every action above a threshold, define trust floors: the range of decisions any person in a role can make without approval. Expand the floor as trust is established.

**Raise approval thresholds.** Many approval thresholds were set when the organization was smaller or when the individuals making decisions were less experienced. Raise thresholds as conditions change.

**Replace approvals with standards.** If an approval exists to ensure quality or compliance, ask whether a clear standard would accomplish the same thing more efficiently. A standard allows people to self-certify against criteria; an approval requires a human to certify for them.

**Separate pre-approval from post-audit.** For lower-risk decisions, post-audit is often more efficient than pre-approval. Act and report, rather than request permission before acting. Post-audit still catches problems but doesn't create wait times.

**Make the cost visible.** Calculate the actual cost of major approval processes: the sum of time spent waiting, preparing materials, presenting, and revising across all approvals in a year. This cost is often invisible because it's distributed. Making it concrete often changes how organizations evaluate whether the approval is worth it.

---

## The Exception

Some approvals are essential. The question is not whether to have approvals but whether each specific approval is earning its keep.

High-value approvals share characteristics:
- The approver has genuine expertise relevant to the decision
- The approval substantially improves the quality or safety of the decision
- The failure mode the approval prevents is real and costly
- The cost of the approval (time, friction, motivation) is less than the expected benefit

Most approval layers don't meet all four criteria. Many meet none of them.

---

*Related: [Communication Overhead](./010-communication-overhead.html), [Incentive Alignment](./006-incentive-alignment.html), [Analysis Paralysis](./012-analysis-paralysis.html), [The Reorg Trap](./014-reorg-trap.html)*
