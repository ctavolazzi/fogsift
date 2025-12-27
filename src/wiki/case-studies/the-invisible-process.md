# Case Study: The Invisible Process

**Industry:** Healthcare Operations
**Problem Type:** Process
**Duration:** 8 weeks
**Outcome:** 28% reduction in patient wait times

---

## The Situation

A healthcare network's outpatient clinics faced chronic patient complaints about wait times. Patients arrived on time for appointments but waited 45-60 minutes to be seen. Patient satisfaction scores were declining. Staff were stressed and defensive.

**What we heard initially:**
- "Doctors run behind because patients are complex"
- "We need more exam rooms"
- "The scheduling system is broken"

## The Investigation

### Week 1-2: Data Collection

We gathered:
- Appointment schedules vs. actual start times
- Patient check-in to rooming timestamps
- Provider arrival times
- Room utilization rates
- Staff interviews

**Key finding:** The data infrastructure was poor. Timestamps were unreliable. No one was actually measuring wait time systematically.

### Week 3-4: Process Mapping

We physically observed patient flow at three clinics. Stopwatch in hand. Every step documented.

**The official process:**
1. Patient arrives
2. Front desk checks in patient
3. Patient waits
4. MA rooms patient, takes vitals
5. Patient waits
6. Provider sees patient

**What we actually observed:**

1. Patient arrives (often early, as instructed)
2. Front desk checks in patient (2-5 minutes)
3. Patient waits (variable: 5-45 minutes)
4. MA rooms patient (5-8 minutes)
5. Patient waits in room (variable: 10-40 minutes)
6. Provider sees patient

But we also found shadow processes:

- MAs taking unscheduled vital sign re-checks
- Providers hunting for missing lab results
- Front desk calling patients who hadn't shown
- Providers documenting previous patient's chart before rooming next
- "Quick questions" from staff interrupting providers

### Week 5-6: Root Cause Analysis

We traced the wait time to its sources:

**Wait 1 (lobby):**
- Patient arrives early (instructed to arrive 15 min early)
- Check-in paperwork (redundant with portal)
- MA waiting for room to open
- Insurance verification delays

**Wait 2 (exam room):**
- Provider finishing previous patient's documentation
- Provider answering "quick questions"
- Provider hunting for information (labs, notes, imaging)
- No signal when room is ready

The invisible process was documentation. Providers spent as much time documenting as they did seeing patients. And most documentation happened between patients, causing the next patient to wait.

### Week 7-8: Validation

We tested our hypothesis by tracking documentation patterns:
- Average documentation time per visit: 18 minutes
- Percentage done between patients: 73%
- Average delay caused: 12 minutes per patient

Compounded across a day, this explained most of the wait time.

## The Findings

**Root cause:** Documentation workflow was invisible, unmeasured, and unmanaged. It was treated as "part of the appointment" rather than a separate process with its own optimization needs.

**Contributing factors:**
1. Early arrival instructions (patients arrived before system was ready)
2. No visual signals for room readiness
3. No protected documentation time
4. Frequent interruptions during documentation
5. Information scattered across systems

## The Recommendations

### Immediate (Week 1-2)

1. **Adjust arrival instructions**
   - "Arrive 15 minutes early" → "Arrive 5 minutes early"
   - Online check-in preferred

2. **Visual room signals**
   - Simple flag system: room ready, patient in room, provider needed
   - Eliminates hunting and waiting

### Short-term (Month 1-2)

3. **Protected documentation blocks**
   - Last 15 minutes of morning and afternoon reserved
   - No patients scheduled during this time
   - Documentation caught up before it compounds

4. **Pre-visit preparation**
   - MAs prepare chart before patient arrives
   - Flag missing information before visit, not during
   - Reduce provider search time

### Medium-term (Month 2-4)

5. **Documentation workflow redesign**
   - Scribes for high-volume providers
   - Template optimization for common visit types
   - Voice dictation for narrative notes

6. **Interruption protocol**
   - Define what qualifies as urgent
   - Batch non-urgent questions
   - Designate "interruptible" times

## The Implementation

The network piloted recommendations 1-4 at one clinic. After validation, rolled out to all locations. Recommendations 5-6 were in planning at engagement end.

## The Outcome

**Pilot clinic, after 3 months:**
- Average wait time: 52 min → 37 min (28% reduction)
- On-time appointment start: 31% → 58%
- Patient satisfaction: +12 points
- Provider satisfaction: +8 points (unexpected bonus)

**System-wide, after 6 months:**
- Average wait time reduced 24%
- Patient complaints about wait time: -45%
- Zero additional rooms or staff required

## Key Lessons

### The invisible process was the problem

Documentation was treated as invisible overhead, not as a process with its own requirements. Once made visible, it could be managed.

### Data infrastructure matters

Without reliable timestamps, you can't measure. Without measurement, you can't improve.

### Blame obscured the cause

"Patients are complex" was technically true but not actionable. The real cause was workflow design, which was actionable.

### Small changes compound

No single intervention fixed everything. But arrival timing + room signals + documentation blocks combined to significant improvement.

---

*What you can't see, you can't manage. What you can't manage, you can't improve.*

