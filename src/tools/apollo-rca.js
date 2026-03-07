/**
 * apollo-rca.js — Apollo Root Cause Analysis tool definition
 * References: Dean Gano, "Apollo Root Cause Analysis: A New Way of Thinking"
 *             (4th ed., 2011). Used in healthcare (RCA²), aviation, nuclear,
 *             and industrial safety; adopted by Joint Commission (JCAHO).
 */

export const id       = 'apollorca';
export const label    = 'Apollo RCA';
export const category = 'Root Cause';
export const navDesc  = 'Cause-and-effect map with actions, conditions, and evidence — finds multiple causal paths, not just one chain';

export const systemPrompt = `You are applying Apollo Root Cause Analysis (Dean Gano) to a primary event or problem.

Apollo RCA principles:
- Every effect has at least one cause. Causes are either ACTIONS (something someone or something did) or CONDITIONS (a state that existed and enabled the action to have effect).
- Problems have multiple causal paths — not a single root cause chain. Map all plausible paths.
- Each cause must be verified against evidence. If evidence is missing, mark it unverified and list what evidence would confirm or refute it.
- Solutions should be mapped to specific causes in the causal chain — not to the top-level event generically. A solution that addresses a cause closer to the root is more durable than one that addresses a symptom.
- This is distinct from 5 Whys: Apollo builds a lateral map of causal branches (AND/OR relationships between causes), not a single sequential chain.

Return ONLY valid JSON (no markdown, no extra text):
{
  "event": "...",
  "event_description": "...",
  "causal_chains": [
    {
      "path": "...",
      "causes": [
        {
          "cause": "...",
          "type": "action|condition",
          "evidence": "...",
          "verified": true
        }
      ],
      "solutions": ["..."]
    }
  ],
  "primary_solutions": ["..."],
  "verification_gaps": ["..."]
}

event: short label for the primary event. event_description: 1-2 sentences restating the event precisely. causal_chains: 2-4 distinct paths. path: short label for this causal chain. causes: 2-4 causes per path, ordered from proximate to distal. type: "action" or "condition". evidence: what evidence supports this cause (or "none available — requires investigation"). verified: true if supported by information given, false otherwise. solutions: 1-3 targeted solutions for this specific causal path. primary_solutions: 2-3 highest-leverage solutions across all paths. verification_gaps: list of the key unknowns that would change the analysis if resolved. Be concise.`;

export const signals = {
  label: 'Map all causal paths with evidence',
  keywords: [
    'apollo', 'causal chain', 'cause and effect', 'action', 'condition',
    'evidence', 'verified', 'verification', 'incident', 'primary event',
    'causal map', 'multiple causes', 'causal path', 'root cause analysis',
    'dean gano', 'rca', 'unverified', 'investigation gap', 'what caused',
  ],
};
