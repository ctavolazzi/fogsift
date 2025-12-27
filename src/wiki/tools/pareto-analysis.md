# Pareto Analysis

Pareto Analysis applies the 80/20 rule to problem-solving: roughly 80% of effects come from 20% of causes. By identifying and focusing on the vital few, you get maximum impact from limited resources.

## The Principle

Not all causes are equal. A few critical causes typically account for most of the problem. Finding those causes and addressing them first is more effective than treating everything equally.

**Examples:**
- 80% of complaints come from 20% of issues
- 80% of defects come from 20% of root causes
- 80% of delays come from 20% of bottlenecks
- 80% of value comes from 20% of effort

The specific ratio varies. It might be 70/30 or 90/10. The point is that impact is unequally distributed.

## Building a Pareto Chart

### Step 1: Define the Problem

What are you analyzing? Defect types? Complaint categories? Delay reasons? Be specific.

### Step 2: Collect Data

Count occurrences by category. You need frequency data.

| Issue Type | Count |
|------------|-------|
| Late delivery | 85 |
| Wrong item | 42 |
| Damaged item | 28 |
| Billing error | 15 |
| Missing item | 12 |
| Other | 8 |

### Step 3: Calculate Percentages

Convert counts to percentages of total.

| Issue Type | Count | Percentage |
|------------|-------|------------|
| Late delivery | 85 | 45% |
| Wrong item | 42 | 22% |
| Damaged item | 28 | 15% |
| Billing error | 15 | 8% |
| Missing item | 12 | 6% |
| Other | 8 | 4% |

### Step 4: Calculate Cumulative Percentage

Add up percentages as you go down the list.

| Issue Type | Count | Percentage | Cumulative |
|------------|-------|------------|------------|
| Late delivery | 85 | 45% | 45% |
| Wrong item | 42 | 22% | 67% |
| Damaged item | 28 | 15% | 82% |
| Billing error | 15 | 8% | 90% |
| Missing item | 12 | 6% | 96% |
| Other | 8 | 4% | 100% |

### Step 5: Identify the Vital Few

Look for where cumulative percentage crosses 80%. In this example, "Late delivery" and "Wrong item" account for 67% of issues. Adding "Damaged item" gets to 82%.

These three categories are the vital few.

### Step 6: Focus Resources

Address the vital few first. Solving late delivery alone eliminates nearly half the complaints.

## When to Use It

- Resource allocation decisions
- Prioritizing improvement efforts
- Focusing investigation on high-impact areas
- Communicating priorities to stakeholders
- Quality improvement programs

## When It Doesn't Work

### Uniform Distribution

If issues are evenly distributed across categories, there's no vital few. All causes need attention.

### Critical Low-Frequency Events

Some rare events are catastrophic. A safety failure that happens 1% of the time might matter more than a convenience issue that happens 50% of the time. Pareto analysis counts frequency, not severity.

### Changing Patterns

If the distribution shifts over time, a static Pareto analysis becomes misleading. Update regularly.

### Category Bias

How you define categories affects results. "Late delivery" might hide multiple root causes that should be separated.

## Best Practices

### Weight by Impact

If different issues have different costs or severity, multiply frequency by impact before calculating percentages.

| Issue | Count | Cost Each | Total Cost |
|-------|-------|-----------|------------|
| Billing error | 15 | $500 | $7,500 |
| Late delivery | 85 | $50 | $4,250 |
| Wrong item | 42 | $100 | $4,200 |

Now billing errors might be the top priority despite lower frequency.

### Drill Down

Once you identify the vital few, apply Pareto analysis within each category. "Late delivery" might break down into subcauses, one of which accounts for most late deliveries.

### Track Over Time

After addressing top causes, the Pareto shifts. The next tier becomes the new vital few. Continuous improvement means continuously updating your analysis.

### Use With Other Tools

Pareto tells you *what* to focus on. Other tools tell you *why* it happens:
- Use Pareto to prioritize
- Use [Fishbone diagrams](/wiki/tools/fishbone-diagram.html) to explore causes
- Use [Five Whys](/wiki/tools/five-whys.html) to find root causes
- Use [Process mapping](/wiki/tools/process-mapping.html) to understand the system

## Common Mistakes

### Cherry-Picking Data

Selecting time periods or data sources that support a preferred conclusion.

### Ignoring the Vital Many

After fixing the vital few, don't ignore the rest forever. At some point, the remaining 20% of causes become significant.

### Category Manipulation

Splitting or combining categories to change the analysis. Be consistent and transparent.

### Static Analysis

Doing Pareto once and never updating it as conditions change.

## The Deeper Point

Pareto analysis is about focus. In a world of unlimited resources, treat everything equally. In reality, resources are limited. Pareto helps you invest where it matters most.

---

*Not all causes are equal. Find the few that matter.*

