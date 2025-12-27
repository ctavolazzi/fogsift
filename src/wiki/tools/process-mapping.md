# Process Mapping

Process mapping creates a visual representation of how work flows through a system. It reveals gaps, redundancies, bottlenecks, and opportunities for improvement that are invisible in verbal descriptions.

## Why Map Processes?

### Reality vs. Perception

The process people describe is rarely the process they follow. Mapping reveals the actual flow.

### Hidden Complexity

Simple processes often have hidden steps, decision points, and exceptions. Mapping makes them visible.

### Communication

A visual map communicates more clearly than paragraphs of text. Different stakeholders can literally point to where they see problems.

### Baseline for Improvement

You can't improve what you don't understand. Maps create the foundation for optimization.

## Types of Process Maps

### Flowchart

Basic steps and decision points. Good for simple, linear processes.

```
[Start] → [Step 1] → [Decision?] → [Step 2A] → [End]
                    ↓
               [Step 2B] → [End]
```

### Swimlane Diagram

Shows who performs each step. Good for cross-functional processes.

```
┌──────────────────────────────────────────┐
│ Customer   │ [Request] ─────────────────→│
├────────────┼─────────────────────────────┤
│ Sales      │           │ [Quote]         │
├────────────┼───────────┼─────────────────┤
│ Operations │           │         [Fulfill]
└────────────┴───────────┴─────────────────┘
```

### Value Stream Map

Shows time, value-add vs. waste, and inventory between steps. Good for lean improvement.

### SIPOC

High-level view: Suppliers, Inputs, Process, Outputs, Customers. Good for scoping before detailed mapping.

## Building a Process Map

### Step 1: Define Scope

Where does the process start? Where does it end? What's in scope?

Common boundaries:
- When a request arrives → when it's fulfilled
- When a problem is detected → when it's resolved
- When material arrives → when product ships

### Step 2: Identify Steps

Walk through the process. Document each action.

**Methods:**
- Observe the process in action
- Interview people who do the work
- Review existing documentation (skeptically)
- Follow a specific case through the system

### Step 3: Sequence Steps

Arrange steps in order. Identify parallel paths and decision points.

### Step 4: Add Detail

For each step, capture:
- Who performs it
- How long it takes
- What inputs are needed
- What outputs are produced
- What can go wrong

### Step 5: Validate

Review the map with people who do the work. They'll catch errors and omissions.

### Step 6: Analyze

Look for:
- **Bottlenecks:** Where does work queue up?
- **Loops:** Where do things go back for rework?
- **Handoffs:** Where does work transfer between people/teams?
- **Decision points:** Where does the process branch?
- **Delays:** Where does work wait?
- **Redundancy:** Where is work duplicated?
- **Missing steps:** What happens that isn't documented?

## What to Look For

### Non-Value-Add Steps

Steps that don't contribute to what the customer values. Transport, waiting, inspection, rework.

### Exception Handling

How are unusual cases handled? Are there undocumented workarounds?

### Information Gaps

Where do people lack information they need? Where do they hunt for data?

### Approval Bottlenecks

Where do approvals slow things down? Are all those approvals necessary?

### Handoff Failures

Where does work fall through cracks between teams or shifts?

## Best Practices

### Map What Is, Not What Should Be

Document the current reality, including workarounds and exceptions. Improvement comes later.

### Include the Informal

The unofficial steps, the shortcuts, the tribal knowledge: these are often more important than formal procedures.

### Use Consistent Symbols

Standard symbols make maps readable:
- Rectangles: Steps
- Diamonds: Decisions
- Arrows: Flow direction
- Ovals: Start/End
- Circles: Connectors

### Keep It Readable

A map that's too detailed becomes useless. Create high-level overviews, then drill down where needed.

### Date and Version

Processes change. Mark when the map was made and what version it is.

## Common Mistakes

### Mapping the Ideal

Drawing how the process *should* work instead of how it *does* work.

### Over-Detailing

Trying to capture every possible exception and edge case. The map becomes unreadable.

### Skipping Validation

Assuming you understood correctly without checking with the people who do the work.

### One-Time Exercise

Treating mapping as a project rather than a living document. Processes evolve; maps should too.

### Ignoring Variation

Mapping one version of a process when multiple versions exist. Different shifts, different sites, different people might follow different processes.

## Using the Map

Once you have a process map:

1. **Identify improvements:** Where are the obvious waste and delay?
2. **Prioritize:** Which improvements have the biggest impact? See [Pareto Analysis](/wiki/tools/pareto-analysis.html).
3. **Design future state:** Map how you want the process to work.
4. **Plan transition:** What needs to change to get from current to future?
5. **Implement and measure:** Make changes, measure results.
6. **Update the map:** The new current state becomes the new baseline.

---

*You can't improve what you can't see. Mapping makes the invisible visible.*

