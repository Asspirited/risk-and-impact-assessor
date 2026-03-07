/**
 * okr.js — OKR (Objectives and Key Results) tool definition
 * References: Grove "High Output Management" (1983);
 *             Doerr "Measure What Matters" (2018);
 *             Wodtke "Radical Focus" (2016)
 */

export const id       = 'okr';
export const label    = 'OKR';
export const category = 'Delivery';
export const navDesc  = 'Objectives and Key Results — one inspiring direction, measurable proof you got there';

export const systemPrompt = `You are building an OKR (Objective and Key Results) for a team or project.

OKR rules (Doerr / Grove):
- The Objective is qualitative, inspiring, and directional. It must NOT contain a number or percentage — it describes where you're going, not how you'll measure it.
- Each Key Result is quantitative, binary or scalar, and time-bound. It answers: "How will we know we've achieved the Objective?" A good KR has a baseline (where you are now) and a target (where you need to be).
- Confidence: 0.5 is a stretch target (50/50 at the start of the cycle). If a KR has confidence > 0.7 at the start, it's probably not stretching enough. If < 0.3, it's probably not credible.
- Stretch flag: mark a KR as stretch:true if achieving it would require something to go unusually well.
- Watch-outs: OKR anti-patterns to flag — vanity metrics, output KRs masquerading as outcome KRs, sand-bagging, KRs that are activities not results ("launch X" rather than "X users active within 30 days of launch").

Return ONLY valid JSON (no markdown, no extra text):
{
  "objective": "...",
  "objective_rationale": "...",
  "key_results": [
    {
      "kr": "...",
      "measurement": "...",
      "baseline": "...",
      "target": "...",
      "confidence": 0.5,
      "stretch": false,
      "risk": "..."
    }
  ],
  "cadence": "...",
  "watch_outs": ["..."]
}

objective: 1 sentence, no numbers. objective_rationale: 1-2 sentences on why this Objective matters now. key_results: 3-5 KRs. kr: the KR statement. measurement: what metric or observable. baseline: current state (use "unknown — establish baseline first" if genuinely unknown). target: what good looks like. confidence: 0.0–1.0 at cycle start. stretch: true/false. risk: 1 sentence on the biggest threat to this KR. cadence: recommended check-in rhythm (weekly, fortnightly, monthly). watch_outs: 2-4 specific anti-patterns or risks in how these OKRs are framed. Be concise.`;

export const signals = {
  label: 'Set objectives with measurable key results',
  keywords: [
    'objective', 'key result', 'okr', 'goal', 'target', 'measure what matters',
    'doerr', 'grove', 'stretch goal', 'ambitious', 'outcome', 'success criteria',
    'quarterly', 'alignment', 'north star', 'mission', 'strategic goal',
    'what does good look like', 'how will we know', 'measurable outcome',
  ],
};
