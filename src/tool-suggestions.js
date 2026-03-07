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
 *
 * New tools: define signals in src/tools/<name>.js and import below.
 */

// ── Per-tool signal imports (new pattern) ─────────────────────────────────────
import { signals as _montecarloSignals } from './tools/montecarlo.js';
import { signals as _okrSignals }        from './tools/okr.js';
import { signals as _apollorcaSignals }  from './tools/apollo-rca.js';
import { signals as _bddSignals }        from './tools/bdd.js';

export const VALID_TOOLS = new Set(['acc', 'fmea', 'fivewhys', 'ishikawa', 'pdca', 'vsm', 'dora', 'socratic', 'premortem', 'bowtie', 'kt', 'gqm', 'flowmetrics', 'wsjf', 'spc', 'testquadrants', 'fta', 'space', 'swot', 'dmaic', 'cynefin', 'toc', 'sevenwastes', 'montecarlo', 'okr', 'apollorca', 'bdd']);

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
    rationale: 'Coverage gaps or testing scope are flagged — ACC maps what to test against what your system does and how it\'s built, exposing the intersections with no test.',
    keywords: [
      'coverage', 'untested', 'test plan', 'quality attribute', 'component', 'capability',
      'testing strategy', 'what to test', 'verification', 'coverage gap', 'test approach',
      'test design', 'coverage matrix', 'scope of testing',
    ],
  },
  fmea: {
    label: 'Analyse failure modes',
    rationale: 'Potential failures and their severity are in focus — FMEA scores each failure mode by severity, likelihood, and detectability so you know which ones to tackle first.',
    keywords: [
      'failure', 'failure mode', 'severity', 'likelihood', 'impact', 'what could go wrong',
      'effects', 'consequence', 'critical', 'catastrophic', 'risk priority', 'rpn',
      'potential failure', 'single point of failure', 'high severity',
    ],
  },
  fivewhys: {
    label: 'Drill to root cause',
    rationale: 'A recurring or unexplained problem is indicated — 5 Whys drills past surface symptoms by asking why until the fixable cause surfaces.',
    keywords: [
      'root cause', 'underlying cause', 'recurring', 'reason', 'investigate', 'investigation',
      'cause', 'repeating', 'systemic cause', 'drill down', 'why', 'repeated problem',
      'keeps happening', 'reoccurring', 'not the first time',
    ],
  },
  ishikawa: {
    label: 'Map contributing causes',
    rationale: 'Multiple contributing factors are at play — Ishikawa maps causes across six categories (people, process, equipment, materials, environment, management) to find which combination is driving the effect.',
    keywords: [
      'contributing factor', 'multiple cause', 'cause and effect', 'people', 'process',
      'method', 'environment', 'measurement', 'systemic', 'categories of cause',
      'combination of factors', 'several factors', 'complex cause',
    ],
  },
  pdca: {
    label: 'Run an improvement cycle',
    rationale: 'An improvement or corrective action is needed — PDCA structures it as a testable hypothesis: plan the change, run it small, check the outcome, then act on what you learned.',
    keywords: [
      'improve', 'improvement', 'iterate', 'hypothesis', 'experiment', 'change management',
      'pilot', 'trial', 'continuous improvement', 'remediation', 'corrective action',
      'action plan', 'monitor', 'review', 'implement', 'measure the effect',
    ],
  },
  vsm: {
    label: 'Map flow and find waste',
    rationale: 'Flow, handoffs, or lead time are involved — VSM maps the full value stream from end to end, making wait time and non-value-adding steps visible.',
    keywords: [
      'flow', 'handoff', 'lead time', 'bottleneck', 'waste', 'delay', 'value stream',
      'throughput', 'efficiency', 'pipeline', 'queue', 'waiting', 'process step',
      'hand over', 'cycle time', 'non-value', 'blockage',
    ],
  },
  dora: {
    label: 'Assess delivery performance',
    rationale: 'Deployment, release, or recovery time is in focus — DORA\'s four metrics tell you exactly where your delivery pipeline is performing well or breaking down.',
    keywords: [
      'deployment', 'release frequency', 'lead time', 'change failure', 'recovery time',
      'devops', 'ci/cd', 'delivery performance', 'restore service', 'mean time to recover',
      'deploy', 'pipeline', 'release cadence', 'time to deploy', 'incident recovery',
    ],
  },
  socratic: {
    label: 'Qualify and sharpen the statement',
    rationale: 'The statement is vague or unverified — Socratic questioning exposes what\'s assumed vs known and pushes toward a claim precise enough to act on or refute.',
    keywords: [
      'vague', 'unclear', 'assumption', 'assumed', 'not defined', 'not specified', 'ambiguous',
      'what do we mean', 'not measurable', 'hard to measure', 'uncertain', 'unknown',
      'ill-defined', 'needs clarification', 'not confirmed', 'unverified',
    ],
  },
  premortem: {
    label: 'Imagine the failure — work backwards',
    rationale: 'The risk of failure is front of mind — Pre-mortem imagines the project has already failed and works backwards from that future to find what caused it while there\'s still time to prevent it.',
    keywords: [
      'failure', 'fail', 'what could go wrong', 'worst case', 'catastrophic', 'project fails',
      'if this goes wrong', 'preventable', 'foresee', 'anticipate', 'planning risk',
      'before it happens', 'failure scenario', 'risk scenario', 'what if',
    ],
  },
  bowtie: {
    label: 'Map threats, controls, and consequences',
    rationale: 'Threats, controls, and consequences need mapping — Bow-Tie shows the full picture from causes through the hazard event to outcomes, and where your barriers are thin or missing.',
    keywords: [
      'barrier', 'control', 'threat', 'hazard', 'consequence', 'preventive',
      'cause and consequence', 'escalation', 'mitigation', 'safeguard', 'bow-tie',
      'recovery control', 'barrier gap', 'critical event', 'unwanted event',
    ],
  },
  toc: {
    label: 'Find and exploit the single system constraint',
    rationale: 'A system constraint is limiting throughput — Theory of Constraints finds the single bottleneck and directs all improvement effort there; optimising anything else is waste.',
    keywords: [
      'constraint', 'bottleneck', 'throughput', 'exploit', 'subordinate', 'elevate',
      'goldratt', 'theory of constraints', 'limiting factor', 'system limit',
      'local optimisation', 'buffer', 'idle capacity', 'drum buffer rope',
    ],
  },
  sevenwastes: {
    label: 'Identify the seven categories of lean waste',
    rationale: 'Waste, inefficiency, or non-value activity is present — Seven Wastes names which of the seven Lean categories is consuming your capacity so you know what to eliminate.',
    keywords: [
      'waste', 'muda', 'lean', 'waiting', 'rework', 'handoff', 'inventory',
      'overproduction', 'context switching', 'over-processing', 'transport',
      'defect', 'flow efficiency', 'non-value', 'elimination',
    ],
  },
  cynefin: {
    label: 'Classify the domain before choosing your approach',
    rationale: 'The problem type is unclear — Cynefin classifies whether you\'re in a clear, complicated, complex, or chaotic domain so you choose the right approach rather than applying the wrong tool.',
    keywords: [
      'complexity', 'domain', 'complicated', 'complex', 'chaotic', 'emergent',
      'sense make', 'what kind of problem', 'which approach', 'unknown unknowns',
      'probe sense respond', 'best practice', 'disorder', 'cynefin', 'snowden',
    ],
  },
  dmaic: {
    label: 'Define, Measure, Analyse, Improve, Control',
    rationale: 'A structured improvement with statistical rigour is needed — DMAIC ensures you understand the problem deeply before acting and validates the fix with data before closing.',
    keywords: [
      'dmaic', 'six sigma', 'defect rate', 'baseline', 'control plan', 'pilot',
      'structured improvement', 'define measure', 'process improvement', 'lean six sigma',
      'rework', 'sigma', 'variation reduction', 'statistical', 'improvement cycle',
    ],
  },
  swot: {
    label: 'Map strategic strengths, weaknesses, opportunities, threats',
    rationale: 'A strategic decision or risk landscape needs framing — SWOT surfaces internal strengths and weaknesses alongside external opportunities and threats in one view.',
    keywords: [
      'strategic', 'strategy', 'swot', 'strength', 'weakness', 'opportunity', 'threat',
      'competitive', 'market', 'internal', 'external', 'advantage', 'gap',
      'position', 'landscape', 'risk landscape', 'strategic risk',
    ],
  },
  fta: {
    label: 'Map all paths from causes to the failure event',
    rationale: 'A complex system failure needs deconstructing — FTA maps all paths from causes to the undesired event using AND/OR logic, finding single points of failure and combinations.',
    keywords: [
      'fault tree', 'top event', 'and gate', 'or gate', 'basic event', 'deductive',
      'failure path', 'system failure', 'cascading failure', 'failure combination',
      'single point', 'redundancy', 'safety', 'undesired event', 'top-down analysis',
    ],
  },
  space: {
    label: 'Assess developer productivity across five dimensions',
    rationale: 'Developer productivity, wellbeing, or team health is a concern — SPACE measures five dimensions so you don\'t reduce "productivity" to output alone.',
    keywords: [
      'developer productivity', 'satisfaction', 'burnout', 'flow state', 'focus time',
      'context switching', 'collaboration', 'review turnaround', 'team health',
      'wellbeing', 'developer experience', 'productivity', 'space framework',
    ],
  },
  spc: {
    label: 'Tell signal from noise before you act',
    rationale: 'A trend or data point needs interpreting — SPC distinguishes common-cause variation (noise, the process is stable) from special-cause variation (a real signal requiring action).',
    keywords: [
      'control chart', 'variation', 'common cause', 'special cause', 'signal', 'noise',
      'statistical', 'stable process', 'out of control', 'trending', 'run of eight',
      'is this real', 'data series', 'uptick', 'shewhart', 'deming',
    ],
  },
  testquadrants: {
    label: 'Map testing across all four quadrants',
    rationale: 'Testing strategy or coverage is in scope — the Agile Testing Quadrants map testing by purpose across four areas, making it easy to spot which type of testing is being neglected.',
    keywords: [
      'unit test', 'exploratory', 'performance test', 'security test', 'uat', 'usability',
      'test coverage', 'testing strategy', 'functional test', 'regression', 'quadrant',
      'agile testing', 'specification by example', 'business-facing', 'technology-facing',
    ],
  },
  wsjf: {
    label: 'Rank work by Cost of Delay ÷ Duration',
    rationale: 'Prioritisation or sequencing is the issue — WSJF ranks work by what you lose per unit of time from delaying it, so the most expensive delay is cleared first.',
    keywords: [
      'priority', 'prioritise', 'prioritization', 'cost of delay', 'wsjf', 'cd3',
      'what to do first', 'backlog', 'rank', 'sequencing', 'opportunity cost',
      'delay cost', 'time criticality', 'value vs effort', 'shortest job first',
    ],
  },
  flowmetrics: {
    label: 'Diagnose flow with Cycle Time, Throughput, WIP',
    rationale: 'Cycle time, WIP, or throughput are relevant — Flow Metrics applies Little\'s Law to diagnose where flow breaks down and predict delivery without relying on estimates.',
    keywords: [
      'cycle time', 'throughput', 'wip', 'work in progress', 'flow efficiency',
      'little\'s law', 'kanban', 'lead time', 'waiting', 'queue', 'in flight',
      'predictability', 'forecast', 'delivery rate', 'items per week',
    ],
  },
  gqm: {
    label: 'Define measurable goals with traceability',
    rationale: 'Measurement or success criteria are unclear — GQM traces every metric back to a quality goal so you know you\'re measuring something that actually matters.',
    keywords: [
      'goal', 'measure', 'metric', 'measurement', 'what to measure', 'how to measure',
      'quality attribute', 'observable', 'baseline', 'threshold', 'traceability',
      'measurement plan', 'quality goal', 'success criteria', 'kpi',
    ],
  },
  apollorca:   _apollorcaSignals,
  okr:         _okrSignals,
  montecarlo:  _montecarloSignals,
  bdd:         _bddSignals,
  kt: {
    label: 'Bound the problem with Is / Is Not',
    rationale: 'The problem is inconsistent or bounded — Kepner-Tregoe Is/Is Not analysis defines precisely where and when the problem occurs vs where it doesn\'t, to locate its cause.',
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
 * @returns {{ tool: string, label: string, rationale: string, score: number }[]}
 */
export function suggestToolsFromText(text, maxResults = 2) {
  const lower = text.toLowerCase();
  const scores = Object.entries(TOOL_SIGNALS).map(([tool, { label, rationale, keywords }]) => {
    const score = keywords.reduce((n, kw) => n + (lower.includes(kw) ? 1 : 0), 0);
    return { tool, label, rationale: rationale ?? '', score };
  });
  return scores
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}
