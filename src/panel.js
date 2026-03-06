/**
 * panel.js
 * Panel member definitions: Suni (Business Stakeholder), Peter (Project Manager),
 * Davos (Development Team).
 * Computes PanelViews from dimension scores and assembles panel member prompts.
 */

// A dimension's weighted score must exceed this threshold to be flagged.
// score(0-5) × weight(0-5) → max 25. Threshold 9 = score:3 × weight:3.
export const FLAGGING_THRESHOLD = 9;

export const PANEL_MEMBERS = {
  SUNI: {
    key: 'SUNI',
    name: 'Suni',
    role: 'Business Stakeholder',
    dimensionWeights: {
      SCOPE: 3, COST: 5, TIME: 4, QUALITY: 1, COMPLEXITY: 0, UNCERTAINTY: 2, RAID: 1
    },
    blindSpots: [
      'Optimism bias at initiation — underestimates complexity because the business case has to fly',
      'Self-initiated scope creep — adds requirements informally without registering cost and time impact',
      'Assumption blindness — business case rests on assumptions that have not been stress-tested',
      'Change impact on the business itself — focuses on delivery risk, underestimates organisational change management required',
      'Technical debt is invisible — until it causes visible, public failure'
    ],
    documentedPositions: [
      'ROI and business case are the primary lens — everything is filtered through delivered value',
      'Scope is fixed once signed off — changes are threats to the business case',
      'Timeline is driven by business events: budget cycles, launches, regulatory deadlines',
      'Issues are escalation triggers — wants resolution, not detail',
      'Risk appetite is high at initiation, low when things go wrong'
    ]
  },
  PETER: {
    key: 'PETER',
    name: 'Peter',
    role: 'Project Manager',
    dimensionWeights: {
      SCOPE: 4, COST: 4, TIME: 5, QUALITY: 2, COMPLEXITY: 3, UNCERTAINTY: 3, RAID: 5
    },
    blindSpots: [
      'Plan confidence inflation — psychological commitment to the schedule once it is in the tool',
      'RAG washing — holds Amber longer than is honest to avoid escalation',
      'Process over substance — can mistake a well-documented project for a well-delivered one',
      'Optimistic dependency management — marks dependencies as confirmed when they are only acknowledged',
      'Team health blind spot — focused on delivery metrics, misses burnout and loss of confidence',
      'Technical risk underestimation — not always equipped to challenge technical estimates'
    ],
    documentedPositions: [
      'Scope, cost, time triangle is the primary framework — everything is a trade-off within it',
      'RAG status is the communication currency — Red/Amber/Green simplifies complex reality',
      'Risk management means logging, owning, and mitigating — risks on the register are managed',
      'Dependencies are the single biggest source of delivery failure',
      'Issues need owners and due dates — unowned issues accumulate into crises'
    ]
  },
  DAVOS: {
    key: 'DAVOS',
    name: 'Davos',
    role: 'Development Team',
    dimensionWeights: {
      SCOPE: 3, COST: 1, TIME: 4, QUALITY: 5, COMPLEXITY: 5, UNCERTAINTY: 5, RAID: 4
    },
    blindSpots: [
      'Perfectionism — tendency to want to do it right at the expense of done',
      'Scope conservatism — can overestimate complexity or effort to protect the team',
      'Communication gap — technical reality not translated into business language',
      'Assumption of autonomy — assumes a technical decision once made will not be revisited',
      'Change impact underestimation (inverse) — underestimates business disruption of technical choices',
      'External dependency optimism — assumes third-party systems and APIs will behave as documented'
    ],
    documentedPositions: [
      'Technical feasibility is non-negotiable — you cannot deliver what cannot be built in the time given',
      'Technical debt is a present risk, not a future problem — it is slowing delivery now',
      'Estimates are probabilities, not commitments — the business treats them as the latter',
      'Requirements change costs more than stakeholders believe — the later the change, the greater the cost',
      'Integration and external dependencies are the hardest problems — always',
      'Quality shortcuts taken to hit a date cause the date to be missed anyway'
    ]
  }
};

/**
 * Compute a PanelView for a member given dimension scores.
 * @param {string} memberKey - SUNI | PETER | DAVOS
 * @param {Object} dimensionScores - { SCOPE: 0-5, ... }
 * @returns {Object} PanelView
 */
export function computePanelView(memberKey, dimensionScores) {
  if (!(memberKey in PANEL_MEMBERS)) {
    throw new Error(`Unknown panel member: ${memberKey}. Valid: ${Object.keys(PANEL_MEMBERS).join(', ')}`);
  }
  const member = PANEL_MEMBERS[memberKey];
  const weightedScores = {};
  const flaggedDimensions = [];

  for (const [dim, score] of Object.entries(dimensionScores)) {
    const weight = member.dimensionWeights[dim] ?? 0;
    const weightedScore = score * weight;
    const flagged = weightedScore > FLAGGING_THRESHOLD;
    weightedScores[dim] = { score, weight, weightedScore, flagged };
    if (flagged) flaggedDimensions.push(dim);
  }

  return { member: memberKey, weightedScores, flaggedDimensions };
}

/**
 * Compute PanelViews for all three panel members.
 * @param {Object} dimensionScores
 * @returns {Object} { SUNI: PanelView, PETER: PanelView, DAVOS: PanelView }
 */
export function computeAllPanelViews(dimensionScores) {
  const views = {};
  for (const key of Object.keys(PANEL_MEMBERS)) {
    views[key] = computePanelView(key, dimensionScores);
  }
  return views;
}

/**
 * Build a system prompt for a panel member's AI narrative.
 * @param {string} memberKey
 * @param {Object} reportData - partial SynthesisReport (computational fields)
 * @returns {string}
 */
export function buildPanelPrompt(memberKey, reportData) {
  if (!(memberKey in PANEL_MEMBERS)) {
    throw new Error(`Unknown panel member: ${memberKey}`);
  }
  if (!reportData || typeof reportData !== 'object') {
    throw new Error('reportData must be a non-null object');
  }
  if (!reportData.projectName || typeof reportData.projectName !== 'string' || reportData.projectName.trim() === '') {
    throw new Error('reportData.projectName must be a non-empty string');
  }
  if (!reportData.dimensionScores || typeof reportData.dimensionScores !== 'object') {
    throw new Error('reportData.dimensionScores is required');
  }

  const member = PANEL_MEMBERS[memberKey];
  const view = reportData.panelViews?.[memberKey];
  const flagged = view ? view.flaggedDimensions : [];

  const dimSummary = Object.entries(reportData.dimensionScores)
    .map(([dim, score]) => `${dim}: ${score.toFixed(1)}/5`)
    .join(', ');

  const flaggedSummary = flagged.length > 0
    ? `Dimensions you are most concerned about: ${flagged.join(', ')}.`
    : 'No dimensions exceed your flagging threshold at current scores.';

  return `You are ${member.name}, ${member.role} on the project "${reportData.projectName}".

Your role perspective: ${member.documentedPositions.join(' | ')}

Your known blind spots — be aware of these in your assessment: ${member.blindSpots.join('; ')}.

Project dimension scores (0=no concern, 5=critical): ${dimSummary}

${flaggedSummary}

Archetype: ${reportData.archetypeLabel} — ${reportData.archetypeDescription}
Severity: ${reportData.band}
Delivery model: ${reportData.tradAgileLabel} (spectrum score: ${reportData.tradAgileScore}/100)

Give your honest assessment from your role's perspective. 150–200 words. Plain prose. Be specific about what concerns you and why. Acknowledge where your blind spots might be affecting your view. Do not use management language or jargon.`;
}
