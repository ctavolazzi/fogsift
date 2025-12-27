# The Five Whys

The Five Whys is a simple but powerful technique for drilling past symptoms to find root causes. Ask "why?" repeatedly until you reach a cause you can actually address.

## The Method

1. Start with a problem statement
2. Ask "Why did this happen?"
3. Take the answer and ask "Why?" again
4. Repeat until you reach an actionable root cause
5. (Usually takes about five iterations, hence the name)

## Example

**Problem:** The website went down during peak traffic

1. **Why?** The server ran out of memory
2. **Why?** The application had a memory leak
3. **Why?** Database connections weren't being closed
4. **Why?** The connection pooling configuration was wrong
5. **Why?** We used default settings from a tutorial without understanding them

**Root cause:** Configuration wasn't reviewed for production requirements

**Action:** Create a deployment checklist that includes configuration review

## When to Use It

- Initial investigation of problems
- When you need to move quickly from symptom to cause
- When the causal chain is relatively linear
- As a facilitation technique in group problem-solving

## When It Doesn't Work

### Complex Causation

When multiple causes interact, asking "why?" in a straight line misses the complexity. You might need [Fishbone Diagrams](/wiki/tools/fishbone-diagram.html) or systems mapping instead.

### Human-Caused Problems

"Why?" can feel like blame. "Why did you make that mistake?" puts people on the defensive. Rephrase: "What about the situation led to this outcome?"

### Inadequate Expertise

If no one in the room understands the system, asking "why?" just generates guesses. You need investigation, not interrogation.

### Premature Termination

People often stop at convenient answers. "Human error" is not a root cause. Neither is "didn't follow the process." Ask why those things happened.

## Best Practices

### Keep Asking

Five is a guideline, not a rule. Sometimes you need three whys. Sometimes you need seven. Stop when you reach something actionable.

### Verify Each Answer

Each "because" should be factual, not hypothetical. If you don't know, investigate before proceeding.

### Consider Multiple Branches

The first "why" might have multiple answers. Explore each branch. The real root cause might be in an unexpected direction.

### Focus on Systems, Not People

"John made an error" is not useful. "The system allowed/encouraged John's error" is useful.

### Document the Chain

Write down each why and because. This creates a record and makes gaps visible.

## Variations

### 5 Whys with Evidence

For each "because," require supporting evidence. Slows down the process but increases accuracy.

### Branching 5 Whys

When you get multiple answers to a "why," explore each branch separately. Results in a tree rather than a line.

### 5 Whys + 2 Hows

After finding the root cause, ask "How do we prevent this?" and "How do we detect it earlier?"

## Common Mistakes

### Stopping at Symptoms

"Why did the server crash?" → "Because it was overloaded." That's still a symptom. Keep going.

### Accepting "Because X Failed to Y"

"Because QA failed to catch the bug" blames QA without asking why the bug was catchable and wasn't caught.

### Guessing

"I think it's because..." is a hypothesis. Verify it before treating it as fact.

### Single Path

Taking only the first answer at each level. Reality is often multi-causal.

## The Deeper Point

The Five Whys isn't really about the number five. It's about:

1. **Not accepting the obvious answer.** The first explanation is usually incomplete.
2. **Tracing causation systematically.** Following the chain rather than jumping to conclusions.
3. **Finding actionable causes.** Stopping at something you can actually change.

---

*The first answer is rarely the root cause. Keep asking.*

