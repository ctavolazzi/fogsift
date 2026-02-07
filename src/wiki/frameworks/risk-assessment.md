# Risk Assessment

Risk assessment is the structured process of identifying what could go wrong, estimating how bad it would be, and deciding what to do about it. It's not about eliminating risk. It's about making informed bets.

## The Core Formula

**Risk = Probability x Impact**

A 90% chance of losing $100 is the same risk score as a 1% chance of losing $9,000. But they feel completely different, and they should be managed completely differently. The formula is a starting point, not the whole picture.

## The Process

### Step 1: Identify Risks

Brainstorm everything that could go wrong. Don't filter yet. Categories to consider:

**Technical risks:**
- Technology doesn't work as expected
- Integration failures
- Scalability problems
- Security vulnerabilities
- Dependency on third-party services

**People risks:**
- Key person leaves
- Skills gap discovered mid-project
- Stakeholder changes mind
- Team conflict or burnout

**External risks:**
- Market changes
- Regulatory changes
- Competitor moves
- Vendor/supplier issues
- Economic conditions

**Process risks:**
- Requirements misunderstood
- Scope creep
- Communication breakdown
- Timeline too aggressive

### Step 2: Assess Each Risk

For each identified risk, estimate:

**Probability** (1-5 scale):
1. Rare — might happen once in many projects
2. Unlikely — could happen but probably won't
3. Possible — has happened before, could happen again
4. Likely — happens more often than not
5. Almost certain — will definitely happen

**Impact** (1-5 scale):
1. Negligible — minor inconvenience
2. Minor — noticeable but manageable
3. Moderate — requires significant response
4. Major — threatens project objectives
5. Catastrophic — project failure or worse

### Step 3: Map to the Risk Matrix

|  | **Negligible** | **Minor** | **Moderate** | **Major** | **Catastrophic** |
|---|---|---|---|---|---|
| **Almost Certain** | Medium | High | Critical | Critical | Critical |
| **Likely** | Low | Medium | High | Critical | Critical |
| **Possible** | Low | Medium | Medium | High | Critical |
| **Unlikely** | Low | Low | Medium | Medium | High |
| **Rare** | Low | Low | Low | Medium | Medium |

### Step 4: Plan Responses

Each risk needs a response strategy:

**Avoid** — Change plans to eliminate the risk entirely.
*Example: Don't use the unproven technology. Use the boring, reliable one.*

**Mitigate** — Reduce probability or impact.
*Example: Add automated testing to catch bugs before production.*

**Transfer** — Shift the risk to someone else.
*Example: Insurance. Outsourcing. Contractual liability clauses.*

**Accept** — Acknowledge and do nothing (because the cost of response exceeds the expected loss).
*Example: Accept that a minor feature might be delayed by a week.*

### Step 5: Monitor

Risks change. New ones emerge. Old ones evolve. Set a cadence for reviewing and updating the risk register.

## Common Mistakes

### Anchoring on Probability

High-impact, low-probability risks are routinely ignored because they "probably won't happen." A 5% chance of project failure isn't low — it means 1 in 20 projects fails. If you run 20 projects, one will hit you.

### Ignoring Correlated Risks

Risks aren't independent. A key person leaving (people risk) increases the chance of missed deadlines (process risk) and technical mistakes (technical risk). When one domino falls, assess the whole chain.

### Planning for Average

The average outcome isn't the most likely outcome. A project with high variance might average out fine but has a meaningful chance of catastrophic failure. Plan for the distribution, not the mean.

### Treating Risk Assessment as a Document

A risk register that sits in a drawer is theater. Risks should be reviewed weekly during active projects. The conversation about risks matters more than the spreadsheet.

### Underestimating Tail Risks

Events in the "rare/catastrophic" cell get the least attention but cause the most damage. This is exactly the error the financial industry made before 2008. Budget mental energy for the things that could kill you.

## Risk Appetite

Different organizations (and different decisions) warrant different risk tolerances:

**Risk-averse context:** Established product, large user base, regulatory environment. Prioritize stability. Avoid anything above "Medium."

**Risk-tolerant context:** Early-stage product, small user base, need to learn fast. Accept higher risk for faster learning. Focus only on "Critical" risks.

**The key insight:** Risk appetite should be explicit, not implicit. "We accept this risk" is a legitimate strategy. Not knowing what risks you're accepting is not.

## When to Use Formal Risk Assessment

- Starting a new project or initiative
- Making irreversible decisions
- Working in regulated industries
- Managing complex dependencies
- When the cost of failure is high
- When stakeholders need to understand the risks they're accepting

---

*See also: [Decision Matrix](/wiki/frameworks/decision-matrix.html) | [SWOT Analysis](/wiki/frameworks/swot-analysis.html) | [Constraint Mapping](/wiki/frameworks/constraint-mapping.html)*
