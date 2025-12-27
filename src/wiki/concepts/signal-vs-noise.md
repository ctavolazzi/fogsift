# Signal vs Noise

Not all information is equal. Signal is information that tells you something true about reality. Noise is information that doesn't. The ability to distinguish between them is fundamental to diagnosis.

## The Distinction

### Signal

Signal is information that:
- Reflects actual state
- Predicts outcomes
- Remains consistent on re-measurement
- Provides actionable insight

### Noise

Noise is information that:
- Reflects random variation
- Has no predictive power
- Fluctuates without meaningful change
- Distracts from actual patterns

## Why This Matters

### Most Data is Noise

In any complex system, most variation is random. Sales fluctuate. Performance varies. Metrics bounce around. Most of this is noise.

Acting on noise is a mistake. You'll see patterns that aren't there, make changes that aren't needed, and create volatility where stability is possible.

### Signal is Often Subtle

Real signals are often small compared to noise. They require sustained attention to detect. An important trend might be a few percentage points hidden in wild monthly swings.

### Noise Looks Like Signal

Human brains are pattern-recognition machines. We see patterns even where none exist. That face in the clouds, that trend in the data: probably noise.

## Sources of Noise

### Random Variation

Every process has inherent variability. Temperature, timing, human attention: these fluctuate randomly.

**Implication:** Expect variation. Don't treat every fluctuation as meaningful.

### Measurement Error

The act of measuring introduces error. Different people measure differently. Instruments have precision limits.

**Implication:** Understand your measurement uncertainty. Don't trust precision you can't justify.

### Sampling Effects

When you measure a subset, you get a different result than you would from the whole.

**Implication:** Larger samples reduce noise. Single data points are almost pure noise.

### Reporting Bias

What gets reported isn't representative. People report what's interesting, unusual, or makes them look good.

**Implication:** Ask what's *not* being reported. Seek boring data.

## Detecting Signal

### Persistence

Signal persists over time. Noise fluctuates.

- Is this pattern consistent across multiple time periods?
- Does it survive changes in measurement approach?
- Would you expect to see it again if you re-measured?

### Magnitude

Significant signals are usually large relative to typical variation.

- How big is this compared to normal fluctuation?
- Is it outside the range of expected randomness?
- Would you notice it without looking for it?

### Mechanism

Real signals have explanations. Noise is random.

- Can you explain why this pattern exists?
- Does the explanation make sense given what you know?
- Would the pattern persist if the explanation were wrong?

### Convergence

Multiple independent sources that agree suggest signal.

- Do different data sources tell the same story?
- Do different analysis methods reach the same conclusion?
- Do multiple observers see the same pattern?

## Tools for Separation

### Statistical Process Control

Track metrics over time with control limits. Changes within limits are noise. Changes outside limits are signals worth investigating.

### Trend Lines

Fit a line through noisy data. The line is your best estimate of signal. Deviations from the line are noise.

### Moving Averages

Smooth out noise by averaging over a window. The moving average shows the underlying trend while individual points contain noise.

### Root Cause Correlation

When signal is suspected, trace back to causes. If you can find a cause, it's more likely signal. If you can't, it might be noise.

## Common Mistakes

### Over-Fitting

Seeing patterns in noise because you're looking too hard. More data points make it easier to find coincidences.

**Fix:** Ask "Would I predict this pattern going forward?"

### Under-Fitting

Dismissing real signals as noise because they're subtle or uncomfortable.

**Fix:** Ask "What evidence would convince me this is signal?"

### Premature Pattern Matching

Declaring a pattern on insufficient data.

**Fix:** Wait for more data. Require patterns to persist before acting.

### Treating All Data Equally

Averaging high-quality data with low-quality data, or mixing reliable sources with unreliable ones.

**Fix:** Weight data by reliability. Separate sources by quality.

## Application to Diagnosis

When investigating problems:

1. **Collect more data than you think you need.** Signal emerges from volume.
2. **Look for persistent patterns.** One data point is noise.
3. **Triangulate sources.** Signal appears across multiple measures.
4. **Test explanations.** If you can't explain why, it might be noise.
5. **Act on signal, ignore noise.** But be willing to revise as data accumulates.

---

*In a noisy world, the ability to find signal is a superpower.*

