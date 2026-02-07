# Case Study: The Data Migration Disaster

**Sector:** Healthcare / Enterprise IT
**Duration:** 3-month engagement (originally scoped at 6 weeks)
**Outcome:** Successful migration after course correction

---

## The Situation

A mid-size healthcare company was migrating from a legacy electronic health records (EHR) system to a modern platform. The project had been "in progress" for 11 months. Original timeline: 4 months. Current status: no end in sight.

The CEO called it "the project from hell." The CTO had resigned. The vendor was threatening to pull out. Staff morale was at rock bottom.

## The Problem

### What They Told Us

"The vendor's migration tool doesn't work properly. Data keeps getting corrupted during transfer. We've run the migration 6 times and it fails every time."

### What We Found

The vendor's tool worked fine. We verified this in the first week by running it against a clean test dataset. Zero errors.

The real problems were upstream:

**1. The source data was a mess.**

The legacy system had been in use for 12 years. Over that time:
- 47 different employees had entered data with different conventions
- Patient names had inconsistent formats (SMITH, JOHN vs. John Smith vs. smith john)
- Dates were stored in 4 different formats across different tables
- 23% of records had orphaned references (pointing to deleted records)
- Duplicate detection was never implemented — 8% of patients had 2+ records

The migration tool wasn't corrupting data. It was faithfully migrating garbage. [Garbage in, garbage out](/wiki/concepts/signal-vs-noise.html).

**2. Nobody owned the data quality problem.**

IT said it was a clinical operations issue. Clinical ops said it was an IT issue. The vendor said it was a data preparation issue (they were right). The project manager just wanted it done.

**3. The migration was all-or-nothing.**

The plan was to migrate everything at once over a weekend. 2 million records. One shot. When it "failed" (actually: when the migrated data quality was unacceptable), they rolled back and tried again. Six times.

Each attempt took a weekend of downtime, a week of verification, and another week of finger-pointing. Eleven months of weekends.

## The Diagnosis

We applied the [Five Whys](/wiki/tools/five-whys.html):

- **Why does the migration fail?** → The migrated data has quality issues.
- **Why does the migrated data have quality issues?** → The source data has quality issues.
- **Why does the source data have quality issues?** → No data governance over 12 years.
- **Why was there no data governance?** → Nobody was responsible for data quality.
- **Why was nobody responsible?** → Data quality wasn't treated as a function — it was assumed.

Root cause: **The migration wasn't a technology problem. It was a data governance problem that had been invisible for 12 years and only became visible when they tried to move the data.**

The migration was the symptom. The disease was a decade of data neglect.

## The Solution

### Phase 1: Clean Before You Move (Weeks 1-4)

Instead of trying to migrate and fix simultaneously, we separated the concerns:

1. **Audit the source data.** Automated scripts identified every quality issue across all tables.
2. **Categorize issues.** Critical (blocks migration), important (degrades quality), cosmetic (can fix later).
3. **Clean in the source system.** Fix the data where it lives, verify, then migrate clean data.

Results of the audit:
- 184,000 records with formatting inconsistencies → automated cleanup scripts
- 42,000 orphaned references → matched or flagged for manual review
- 31,000 duplicate patients → merged using fuzzy matching + clinical review
- 12,000 records with invalid dates → corrected from paper records

### Phase 2: Migrate in Waves (Weeks 5-10)

Instead of all-or-nothing, we migrated in waves:

- **Wave 1:** Inactive patients (>3 years since last visit). Low risk. Validated process.
- **Wave 2:** Active patients, A-M. Caught issues at smaller scale.
- **Wave 3:** Active patients, N-Z. Smoothest wave — lessons learned applied.
- **Wave 4:** Complex records (multiple conditions, extensive history). Most manual intervention needed.

Each wave was independently verifiable. Problems in Wave 2 didn't require rolling back Wave 1.

### Phase 3: Governance Going Forward (Week 11+)

To prevent the next migration from facing the same problems:

- **Data quality owner** appointed (not a committee — one person)
- **Validation rules** built into data entry forms
- **Monthly quality reports** automated
- **Annual data audit** scheduled

## The Numbers

| Metric | Before | After |
|--------|--------|-------|
| Migration attempts | 6 (all failed) | 4 waves (all succeeded) |
| Timeline | 11 months (not done) | 3 months (done) |
| Data quality score | ~72% | 96.4% |
| Staff confidence | "Project from hell" | "Should have done this first" |

## Lessons

1. **Migration is a data quality project, not a technology project.** The tool was never the problem. The data was. This is true of almost every migration.

2. **Problems accumulate invisibly.** Twelve years of minor data entry inconsistencies created a crisis that cost 11 months and untold stress. [Entropy](/wiki/field-notes/003-entropy.html) compounds.

3. **Divide and conquer beats all-or-nothing.** Waves provide feedback loops, limit blast radius, and build confidence. The same principle applies to any large, risky operation.

4. **Assign ownership to one person, not a committee.** "Everyone is responsible" means nobody is responsible. One owner with authority and accountability fixes things.

5. **Clean before you move.** This applies to data migrations, office moves, code refactors, and most other transitions. Moving a mess just gives you a mess in a new location.

6. **The real problem is usually upstream of where you're looking.** The team was debugging the migration tool. The problem was in data entry practices from 2013.

---

*See also: [Root Cause Analysis](/wiki/concepts/root-cause.html) | [Five Whys](/wiki/tools/five-whys.html) | [Entropy (Field Note)](/wiki/field-notes/003-entropy.html) | [Documentation Debt](/wiki/field-notes/007-documentation-debt.html)*
