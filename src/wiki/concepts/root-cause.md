# Root Cause Analysis

Root cause analysis is the systematic process of tracing a problem back to its origin. It's not about fixing symptoms—it's about finding the actual source.

## The Principle

> "For every complex problem, there is an answer that is clear, simple, and wrong." — H.L. Mencken

Most organizations treat symptoms. They see a fire and reach for a hose. But fires have ignition points. Find the ignition point, and you don't need the hose.

## The Method

### 1. Document the Symptom
What exactly is happening? When did it start? Who noticed it first?

### 2. Trace the Wire
Follow the causal chain backwards. Every effect has a cause. Every cause has a prior cause.

### 3. Apply the 5 Whys
Ask "why" at each step. Don't stop at the comfortable answer.

**Example:**
- *Why* did the server crash? → Memory leak
- *Why* was there a memory leak? → Unclosed database connections
- *Why* weren't connections closed? → No timeout configured
- *Why* was there no timeout? → Default settings copied from prototype
- *Why* were prototype settings used? → No deployment checklist

The root cause isn't "memory leak"—it's "no deployment checklist."

## Common Traps

### Premature Closure
Stopping at the first plausible explanation. The real cause is usually 2-3 layers deeper.

### Blame Assignment
"Human error" is not a root cause. It's a symptom of a system that allows humans to err.

### Confirmation Bias
Looking for evidence that supports your initial theory instead of testing it.

## When to Use This

Root cause analysis is expensive. It requires time, access, and honest answers. Use it when:

- The same problem keeps recurring
- The cost of the problem justifies the investigation
- You suspect the "obvious" fix won't work

---

*See also: [Field Note: The Map Is Not The Territory](/wiki/field-notes/001-map-territory.html)*

