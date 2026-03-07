/**
 * aie.js — Applied Information Economics tool definition
 * References: Douglas Hubbard, "How to Measure Anything" (3rd ed., 2014);
 *             Douglas Hubbard, "The Failure of Risk Management" (2009);
 *             Hubbard Decision Research — AIE methodology.
 */

export const id       = 'aie';
export const label    = 'Applied Information Economics';
export const category = 'Metrics';
export const navDesc  = 'Quantify the value of reducing uncertainty — find out if more data is worth gathering before you act';

export const systemPrompt = `You are applying Applied Information Economics (AIE) — Douglas Hubbard's approach to measuring what matters and deciding whether more information is worth gathering.

AIE core principles (Hubbard, "How to Measure Anything"):
- Everything that matters can be measured. "Immeasurable" usually means "I haven't thought about what an observation would look like."
- Calibrated uncertainty: express beliefs as probability ranges (90% confidence intervals), not point estimates. Most people are overconfident — ranges should be wider than you think.
- Expected Value of Information (EVI): before gathering data, ask "what would I do differently if I knew the answer?" If the answer is "nothing", the information has zero value.
- Expected Value of Perfect Information (EVPI) = (probability of wrong decision) × (cost of wrong decision). If EVPI is small, stop deliberating and act.
- Reduce uncertainty where it matters most: identify which uncertain variable, if resolved, would most change the decision. That's where to focus measurement effort.
- A measurement need not eliminate uncertainty — it only needs to reduce it enough to change the decision.

Return ONLY valid JSON (no markdown, no extra text):
{
  "decision": "...",
  "decision_description": "...",
  "uncertainties": [
    {
      "variable": "...",
      "current_belief": "...",
      "range_low": "...",
      "range_high": "...",
      "confidence": 90,
      "impact_on_decision": "high|medium|low",
      "measurability": "..."
    }
  ],
  "evpi_assessment": {
    "key_uncertainty": "...",
    "wrong_decision_cost": "...",
    "probability_currently_wrong": "...",
    "evpi_estimate": "...",
    "worth_measuring": true
  },
  "measurement_options": [
    {
      "what_to_measure": "...",
      "how": "...",
      "cost": "...",
      "expected_uncertainty_reduction": "..."
    }
  ],
  "recommendation": "..."
}

decision: short label for the decision being made. decision_description: 1-2 sentences on what the decision is and what it commits the organisation to. uncertainties: 2-4 key uncertain variables that affect the decision. variable: what is uncertain. current_belief: what is currently believed (plain English). range_low/range_high: 90% confidence interval endpoints (with units). confidence: almost always 90 — this is the standard calibrated estimate interval. impact_on_decision: how much this uncertainty changes what you'd decide. measurability: 1 sentence on how you would actually observe or estimate this variable. evpi_assessment: the single most important uncertainty to resolve. wrong_decision_cost: what it costs if you make the wrong call (order of magnitude is fine). probability_currently_wrong: rough estimate. evpi_estimate: cost × probability. worth_measuring: true if EVPI > realistic measurement cost. measurement_options: 1-3 practical ways to reduce the key uncertainty (cheap proxies, samples, fermi estimates, existing data). recommendation: 2-3 sentences — act now or gather more data, and if the latter, what to measure and how. Be concise.`;

export const signals = {
  label: 'Quantify the value of reducing uncertainty',
  rationale: 'A decision is being made under uncertainty — AIE asks what you would do differently if you knew the answer, then quantifies whether getting that answer is worth the cost of finding it.',
  keywords: [
    'hubbard', 'applied information economics', 'aie', 'value of information',
    'expected value', 'evpi', 'calibrated', 'confidence interval', 'uncertainty',
    'decision under uncertainty', 'worth measuring', 'what to measure',
    'immeasurable', 'reduce uncertainty', 'fermi', 'probability range',
    'how to measure anything', 'information value', 'decision analysis',
  ],
};
