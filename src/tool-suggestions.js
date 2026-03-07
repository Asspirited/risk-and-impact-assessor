/**
 * tool-suggestions.js
 *
 * Two suggestion strategies:
 *
 * 1. TOOL_SUGGESTIONS — static map from RAID item type to relevant tools.
 *    Used as a fallback / early hint before analysis runs.
 *
 * 2. TOOL_SIGNALS + suggestToolsFromText() — keyword-based matching against
 *    the actual analysis output text. Returns the highest-scoring tools so
 *    suggestions are grounded in what the analysis actually found.
 */

export const VALID_TOOLS = new Set(['acc', 'fmea', 'fivewhys', 'ishikawa', 'pdca', 'vsm', 'dora', 'socratic', 'premortem', 'bowtie', 'kt', 'gqm']);

// ── Static suggestions by RAID type ─────────────────────────────────────────

export const TOOL_SUGGESTIONS = {
  risk:       [{ tool: 'socratic',  label: 'Socratic' },        { tool: 'premortem', label: 'Pre-mortem' }],
  assumption: [{ tool: 'socratic',  label: 'Socratic' },        { tool: 'acc',       label: 'ACC Analysis' }],
  issue:      [{ tool: 'fivewhys',  label: '5 Whys' },          { tool: 'ishikawa',  label: 'Ishikawa' }, { tool: 'pdca', label: 'PDCA' }],
  dependency: [{ tool: 'vsm',       label: 'Value Stream Map' }, { tool: 'socratic',  label: 'Socratic' }],
  change:     [{ tool: 'premortem', label: 'Pre-mortem' },      { tool: 'pdca',      label: 'PDCA' }],
};

export const RAID_TYPES = Object.keys(TOOL_SUGGESTIONS);

// ── Signal definitions — keywords that indicate a tool would help ────────────

export const TOOL_SIGNALS = {
  acc: {
    label: 'Map test coverage',
    keywords: [
      'coverage', 'untested', 'test plan', 'quality attribute', 'component', 'capability',
      'testing strategy', 'what to test', 'verification', 'coverage gap', 'test approach',
      'test design', 'coverage matrix', 'scope of testing',
    ],
  },
  fmea: {
    label: 'Analyse failure modes',
    keywords: [
      'failure', 'failure mode', 'severity', 'likelihood', 'impact', 'what could go wrong',
      'effects', 'consequence', 'critical', 'catastrophic', 'risk priority', 'rpn',
      'potential failure', 'single point of failure', 'high severity',
    ],
  },
  fivewhys: {
    label: 'Drill to root cause',
    keywords: [
      'root cause', 'underlying cause', 'recurring', 'reason', 'investigate', 'investigation',
      'cause', 'repeating', 'systemic cause', 'drill down', 'why', 'repeated problem',
      'keeps happening', 'reoccurring', 'not the first time',
    ],
  },
  ishikawa: {
    label: 'Map contributing causes',
    keywords: [
      'contributing factor', 'multiple cause', 'cause and effect', 'people', 'process',
      'method', 'environment', 'measurement', 'systemic', 'categories of cause',
      'combination of factors', 'several factors', 'complex cause',
    ],
  },
  pdca: {
    label: 'Run an improvement cycle',
    keywords: [
      'improve', 'improvement', 'iterate', 'hypothesis', 'experiment', 'change management',
      'pilot', 'trial', 'continuous improvement', 'remediation', 'corrective action',
      'action plan', 'monitor', 'review', 'implement', 'measure the effect',
    ],
  },
  vsm: {
    label: 'Map flow and find waste',
    keywords: [
      'flow', 'handoff', 'lead time', 'bottleneck', 'waste', 'delay', 'value stream',
      'throughput', 'efficiency', 'pipeline', 'queue', 'waiting', 'process step',
      'hand over', 'cycle time', 'non-value', 'blockage',
    ],
  },
  dora: {
    label: 'Assess delivery performance',
    keywords: [
      'deployment', 'release frequency', 'lead time', 'change failure', 'recovery time',
      'devops', 'ci/cd', 'delivery performance', 'restore service', 'mean time to recover',
      'deploy', 'pipeline', 'release cadence', 'time to deploy', 'incident recovery',
    ],
  },
  socratic: {
    label: 'Qualify and sharpen the statement',
    keywords: [
      'vague', 'unclear', 'assumption', 'assumed', 'not defined', 'not specified', 'ambiguous',
      'what do we mean', 'not measurable', 'hard to measure', 'uncertain', 'unknown',
      'ill-defined', 'needs clarification', 'not confirmed', 'unverified',
    ],
  },
  premortem: {
    label: 'Imagine the failure — work backwards',
    keywords: [
      'failure', 'fail', 'what could go wrong', 'worst case', 'catastrophic', 'project fails',
      'if this goes wrong', 'preventable', 'foresee', 'anticipate', 'planning risk',
      'before it happens', 'failure scenario', 'risk scenario', 'what if',
    ],
  },
  bowtie: {
    label: 'Map threats, controls, and consequences',
    keywords: [
      'barrier', 'control', 'threat', 'hazard', 'consequence', 'preventive',
      'cause and consequence', 'escalation', 'mitigation', 'safeguard', 'bow-tie',
      'recovery control', 'barrier gap', 'critical event', 'unwanted event',
    ],
  },
  gqm: {
    label: 'Define measurable goals with traceability',
    keywords: [
      'goal', 'measure', 'metric', 'measurement', 'what to measure', 'how to measure',
      'quality attribute', 'observable', 'baseline', 'threshold', 'traceability',
      'measurement plan', 'quality goal', 'success criteria', 'kpi',
    ],
  },
  kt: {
    label: 'Bound the problem with Is / Is Not',
    keywords: [
      'is not', 'only on', 'only when', 'not on', 'not when', 'boundary',
      'specific to', 'limited to', 'inconsistent', 'intermittent', 'sometimes',
      'distinction', 'why here not there', 'why now not before', 'bounded',
    ],
  },
};

// ── Text-based suggestion scoring ────────────────────────────────────────────

/**
 * Score the analysis output text against each tool's signal keywords.
 * Returns up to maxResults tools sorted by match score, score > 0 only.
 *
 * @param {string} text - the analysis output to scan
 * @param {number} maxResults - maximum number of tools to return (default 2)
 * @returns {{ tool: string, label: string, score: number }[]}
 */
export function suggestToolsFromText(text, maxResults = 2) {
  const lower = text.toLowerCase();
  const scores = Object.entries(TOOL_SIGNALS).map(([tool, { label, keywords }]) => {
    const score = keywords.reduce((n, kw) => n + (lower.includes(kw) ? 1 : 0), 0);
    return { tool, label, score };
  });
  return scores
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}
