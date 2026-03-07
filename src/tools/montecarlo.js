/**
 * montecarlo.js — Monte Carlo / PERT simulation tool definition
 * References: PMBOK Guide; Hubbard "How to Measure Anything" (2007);
 *             Cohn "Agile Estimating and Planning" (2005)
 */

export const id       = 'montecarlo';
export const label    = 'Monte Carlo';
export const category = 'Risk';
export const navDesc  = 'Simulate schedule or cost uncertainty — enter 3-point estimates, get P50/P80/P90 confidence bands';

export const systemPrompt = `You are applying Monte Carlo simulation principles to estimate the probability distribution of a project schedule or cost outcome.

The user has provided 3-point estimates (optimistic, most-likely, pessimistic) for one or more project variables. Apply PERT (Program Evaluation and Review Technique) to each variable:
  - PERT mean = (optimistic + 4 × most_likely + pessimistic) / 6
  - PERT std_dev = (pessimistic - optimistic) / 6
  - variance = std_dev²
  - variance_pct = (std_dev / pert_mean) × 100  (coefficient of variation as %)

Then aggregate:
  - p50 (expected value) = sum of all PERT means
  - p80 = p50 + 0.842 × sqrt(sum of all variances)
  - p90 = p50 + 1.282 × sqrt(sum of all variances)

Round p50/p80/p90 to one decimal place. Identify the variables with the highest variance_pct as key drivers — those are the variables that most inflate the uncertainty band.

Return ONLY valid JSON (no markdown, no extra text):
{
  "project": "...",
  "unit": "...",
  "variables": [
    {
      "name": "...",
      "optimistic": 0,
      "most_likely": 0,
      "pessimistic": 0,
      "pert_mean": 0.0,
      "std_dev": 0.0,
      "variance_pct": 0.0,
      "driver": true
    }
  ],
  "total": {
    "p50": 0.0,
    "p80": 0.0,
    "p90": 0.0,
    "p50_note": "...",
    "p80_note": "...",
    "p90_note": "..."
  },
  "key_drivers": ["..."],
  "recommendation": "..."
}

driver: true for the top 1-2 variables by variance_pct. p50/p80/p90_note: 1-sentence plain-English interpretation of each confidence level. key_drivers: 1-2 sentence explanation of which variables drive the most risk and why. recommendation: 2-3 sentences on what to do — focus mitigation on the high-variance drivers, consider schedule contingency, or reduce scope of the riskiest element. Be concise throughout.`;

export const signals = {
  label: 'Simulate schedule/cost uncertainty',
  rationale: 'Schedule or cost uncertainty needs quantifying — Monte Carlo uses 3-point estimates to produce P50, P80, and P90 confidence bands and surfaces the variables driving the most variance.',
  keywords: [
    'uncertainty', 'estimate', 'three-point', '3-point', 'optimistic', 'pessimistic',
    'most likely', 'confidence', 'probability', 'schedule risk', 'cost risk',
    'p80', 'p90', 'contingency', 'range', 'distribution', 'pert', 'simulation',
    'how long', 'how much', 'variance', 'spread',
  ],
};
