# Case Study: Manufacturing Throughput Crisis

**Industry:** Precision Manufacturing
**Problem Type:** Operations
**Duration:** 6 weeks
**Outcome:** 45% throughput increase

---

## The Situation

A precision manufacturing company producing aerospace components faced a throughput crisis. Despite significant investment in new CNC equipment, output had plateaued. Customer orders were backlogging, and the company was at risk of losing key contracts.

**What we heard initially:**
- "The new machines aren't performing to spec"
- "We need to add a night shift"
- "The operators need more training"

## The Investigation

### Week 1-2: Symptom Mapping

We started by documenting exactly what "throughput crisis" meant:
- Output: 850 units/week (target: 1,200)
- Utilization: 62% (claimed), actual TBD
- Backlog: 6 weeks and growing
- Quality: 4.2% rejection rate

### Week 2-3: Process Tracing

We followed the flow from raw material to shipping:

1. **Material receiving:** No delays observed
2. **Machining (3 CNC cells):** High variability in cycle times
3. **Deburring:** Manual, consistent pace
4. **Inspection:** Significant queuing observed
5. **Assembly:** Waiting for inspected parts
6. **Shipping:** On-time once parts available

The inspection queue was the first clue. Parts were piling up waiting for quality verification.

### Week 3-4: Root Cause Analysis

**Inspection Bottleneck**

The quality department had three inspectors. Inspection time averaged 12 minutes per part. Capacity: ~120 parts per day across all inspectors.

Production was capable of ~200 parts per day.

No matter how fast production ran, inspection could only process 120 parts daily. The gap accumulated as backlog.

**But why was inspection so slow?**

We dug deeper. Inspectors were following an outdated procedure that required:
- 23-point manual measurement
- Full documentation on paper forms
- Secondary verification for every part

This procedure was written when the company produced 15 different part numbers. They now produced 180. The procedure had never been updated.

**Secondary finding: Setup time waste**

While investigating, we noticed machine setup times varied wildly: 45 minutes to 4 hours for the same part. Tribal knowledge problem. Some operators knew the tricks; others didn't. See [Field Note: Tribal Knowledge](/wiki/field-notes/005-tribal-knowledge.html).

## The Findings

**Root cause 1:** Inspection procedure misaligned with current production volume and part variety. Designed for a different era.

**Root cause 2:** Undocumented setup procedures leading to variable machine utilization.

**Contributing factors:**
- No capacity planning across departments
- Inspection treated as separate from production
- Resistance to procedure changes due to aerospace certification concerns

## The Recommendations

### Immediate (Week 1-2)

1. **Risk-stratify inspection**
   - Not all parts need 23 measurement points
   - Implement tiered inspection based on part criticality and history
   - Predicted reduction: 23 points → average of 8 points

2. **Cross-train for flexibility**
   - Train two production supervisors on basic inspection
   - Allow overflow capacity during peaks

### Short-term (Month 1-2)

3. **Document setup procedures**
   - Capture best practices from experienced operators
   - Create standardized setup sheets per part family
   - Target: 90-minute maximum setup time

4. **Digital inspection forms**
   - Eliminate paper documentation
   - Reduce transcription errors
   - Enable real-time quality tracking

### Medium-term (Month 2-4)

5. **Capacity alignment**
   - Match production scheduling to inspection capacity
   - Eliminate production of parts that will sit in queue

6. **Quality engineering review**
   - With aerospace auditor present
   - Formally revise inspection procedures
   - Certify the streamlined process

## The Implementation

The client implemented recommendations 1-4. Recommendation 5 was partially implemented. Recommendation 6 was deferred due to an upcoming customer audit.

## The Outcome

**After 3 months:**
- Output: 1,240 units/week (target exceeded)
- Utilization: 78%
- Backlog: 2 weeks (within normal)
- Quality: 3.8% rejection rate (improved)

**Quantified impact:**
- 45% throughput increase
- $2.1M additional annual revenue capacity
- 0 new equipment purchases needed
- 0 additional headcount required

## Key Lessons

### The bottleneck was invisible

Everyone was looking at production. The constraint was in quality. See [Field Note: Finding the Bottleneck](/wiki/field-notes/004-bottlenecks.html).

### Procedures fossilize

What was appropriate 10 years ago wasn't appropriate today. But no one had questioned it. "That's how we've always done it."

### Documentation matters

The setup time variability was pure tribal knowledge. Once captured, the benefit was immediate.

### Systems, not people

The inspectors weren't slow. The procedure was wrong. The operators weren't inconsistent. The knowledge transfer was missing.

---

*The solution to a production problem was found in the quality lab.*

