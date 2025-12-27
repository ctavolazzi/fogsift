# Constraint Mapping

Constraint mapping identifies and visualizes the boundaries within which a solution must operate. It prevents wasted effort on solutions that can't be implemented and reveals hidden degrees of freedom.

## The Principle

> Every problem exists within a constraint envelope. Understand the envelope before you design the solution.

Constraints aren't obstacles. They're design parameters. Once you know them, they guide you toward viable solutions.

## Types of Constraints

### Hard Constraints

Absolute limits that cannot be violated.

**Examples:**
- Legal requirements
- Physical laws
- Non-negotiable deadlines
- Budget caps
- Safety requirements

**Characteristic:** Breaking them isn't an option, no matter how good the solution.

### Soft Constraints

Strong preferences that can be violated under sufficient justification.

**Examples:**
- Internal policies
- Historical practices
- Stakeholder preferences
- Resource availability
- Timeline targets

**Characteristic:** Can be challenged, negotiated, or waived if the tradeoff is worth it.

### Hidden Constraints

Limits that aren't explicitly stated but become apparent during implementation.

**Examples:**
- Political dynamics
- Unwritten rules
- Legacy system dependencies
- Cultural norms
- Institutional knowledge gaps

**Characteristic:** Often the cause of "good ideas" that fail to launch.

### Self-Imposed Constraints

Limits we assume exist but don't actually.

**Examples:**
- "We've always done it this way"
- "They'll never approve that"
- "That's not possible with our tools"
- "The team wouldn't accept that change"

**Characteristic:** Often invisible until challenged.

## The Mapping Process

### Step 1: Gather Stated Constraints

Ask stakeholders directly:
- What can't change?
- What's non-negotiable?
- What limits exist?
- What has been tried and rejected?

Document everything, even constraints that seem obvious.

### Step 2: Classify by Type

For each constraint, determine:
- Is it hard or soft?
- Is it explicit or hidden?
- Is it real or self-imposed?

### Step 3: Test Validity

For soft and self-imposed constraints, ask:
- Who says this is a constraint?
- What evidence supports it?
- What would it take to change it?
- What's the cost of violating it?

You'll often find that "constraints" are actually preferences or outdated assumptions.

### Step 4: Map Dependencies

Constraints interact. Understanding these dependencies reveals:
- Which constraints are load-bearing
- Which constraints can be moved together
- Where changing one constraint affects others

### Step 5: Identify Degrees of Freedom

The space *between* constraints is your solution space. Map it:
- What can change?
- What can be combined?
- What can be sequenced differently?
- What can be eliminated?

## Visualization

A constraint map can take several forms:

### Boundary Diagram

Draw the solution space as an area, with constraints as boundaries. Hard constraints are solid lines. Soft constraints are dashed.

### Constraint Table

| Constraint | Type | Source | Negotiable? | Dependencies |
|------------|------|--------|-------------|--------------|
| Q4 deadline | Hard | Board | No | Budget |
| Existing platform | Soft | IT | Yes, with justification | Timeline |
| Current team only | Self-imposed | Assumption | Test with sponsor | None |

### Dependency Graph

Show constraints as nodes and dependencies as arrows. Highlight constraints that affect many others.

## Common Patterns

### Over-Constrained Problems

When constraints leave no viable solution space:
- Challenge soft constraints
- Test self-imposed constraints
- Look for creative interpretations
- Escalate genuine conflicts

### Under-Constrained Problems

When too much is possible:
- Add design principles
- Define quality criteria
- Set optimization targets
- Prioritize ruthlessly

### Constraint Migration

When stakeholders keep adding constraints after work begins:
- Trace new constraints to their source
- Document impact on solution space
- Force explicit tradeoff decisions

## Application

Before designing solutions:
1. Map all known constraints
2. Test self-imposed constraints
3. Identify hidden constraints through investigation
4. Document the viable solution space
5. Design solutions that fit within the envelope

---

*Understanding what you can't do clarifies what you can.*

