/**
 * synthesis.js
 * Detects contradictions between panel members, computes weighted findings,
 * and assembles the synthesis prompt.
 *
 * Contradiction: a dimension where panel members' flagged status differs.
 * Weighted finding: a flagged dimension with a consensus count.
 *   3 members flag → CRITICAL
 *   2 members flag → HIGH
 *   1 member flags → MEDIUM
 */

const CONSENSUS_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 };

/**
 * Detect contradictions between panel views.
 * A contradiction exists when at least one member flags a dimension and at least one does not.
 * @param {Object} panelViews - { SUNI: PanelView, PETER: PanelView, DAVOS: PanelView }
 * @returns {Array<{dimension, flaggedBy, notFlaggedBy}>}
 */
export function detectContradictions(panelViews) {
  if (!panelViews || typeof panelViews !== 'object') {
    throw new Error('panelViews must be a non-null object');
  }
  const memberKeys = Object.keys(panelViews);
  if (memberKeys.length === 0) return [];

  const firstView = panelViews[memberKeys[0]];
  const dimensions = Object.keys(firstView.weightedScores);
  const contradictions = [];

  for (const dim of dimensions) {
    const flaggedBy = [];
    const notFlaggedBy = [];
    for (const [key, view] of Object.entries(panelViews)) {
      (view.weightedScores[dim]?.flagged ? flaggedBy : notFlaggedBy).push(key);
    }
    if (flaggedBy.length > 0 && notFlaggedBy.length > 0) {
      contradictions.push({ dimension: dim, flaggedBy, notFlaggedBy });
    }
  }

  return contradictions;
}

/**
 * Compute weighted findings from panel views.
 * Returns findings sorted by consensus weight descending (CRITICAL first).
 * @param {Object} panelViews
 * @returns {Array<{dimension, consensus, flagCount}>}
 */
export function computeWeightedFindings(panelViews) {
  if (!panelViews || typeof panelViews !== 'object') {
    throw new Error('panelViews must be a non-null object');
  }
  const memberKeys = Object.keys(panelViews);
  if (memberKeys.length === 0) return [];

  const firstView = panelViews[memberKeys[0]];
  const dimensions = Object.keys(firstView.weightedScores);
  const findings = [];

  for (const dim of dimensions) {
    const flagCount = Object.values(panelViews)
      .filter(v => v.weightedScores[dim]?.flagged).length;
    if (flagCount === 0) continue;
    const consensus = flagCount >= 3 ? 'CRITICAL' : flagCount === 2 ? 'HIGH' : 'MEDIUM';
    findings.push({ dimension: dim, consensus, flagCount });
  }

  return findings.sort((a, b) => CONSENSUS_ORDER[a.consensus] - CONSENSUS_ORDER[b.consensus]);
}

/**
 * Build the synthesis system prompt.
 * Instructs the AI to combine three panel perspectives, surface contradictions,
 * and weight findings by consensus.
 * @param {Object} reportData - partial SynthesisReport (computational fields + panelViews)
 * @returns {string}
 */
export function buildSynthesisPrompt(reportData) {
  if (!reportData || typeof reportData !== 'object') {
    throw new Error('reportData must be a non-null object');
  }
  if (!reportData.projectName || typeof reportData.projectName !== 'string' || reportData.projectName.trim() === '') {
    throw new Error('reportData.projectName must be a non-empty string');
  }
  if (!reportData.weightedFindings || !Array.isArray(reportData.weightedFindings)) {
    throw new Error('reportData.weightedFindings is required');
  }
  if (!reportData.contradictions || !Array.isArray(reportData.contradictions)) {
    throw new Error('reportData.contradictions is required');
  }

  const findingsSummary = reportData.weightedFindings.length > 0
    ? reportData.weightedFindings
        .map(f => `${f.dimension} (${f.consensus} — flagged by ${f.flagCount} of 3 panel members)`)
        .join('\n  ')
    : 'No dimensions flagged by any panel member.';

  const contradictionsSummary = reportData.contradictions.length > 0
    ? reportData.contradictions
        .map(c => `${c.dimension}: flagged by ${c.flaggedBy.join(', ')} — not flagged by ${c.notFlaggedBy.join(', ')}`)
        .join('\n  ')
    : 'No contradictions between panel members.';

  return `You are synthesising a project risk assessment for "${reportData.projectName}".

Three panel members have assessed this project from their respective perspectives:
- Suni (Business Stakeholder): focused on cost, time, and business outcomes
- Peter (Project Manager): focused on schedule, governance, and RAID management
- Davos (Development Team): focused on technical quality, complexity, and uncertainty

Your job is to produce a synthesis that:
1. Summarises the overall risk picture across all seven dimensions (Scope, Cost, Time, Quality, Complexity, Uncertainty, RAID)
2. Explicitly surfaces contradictions where panel members disagree — these represent blind spots or perspective gaps
3. Gives more weight to findings that multiple panel members have independently flagged
4. Applies the risk archetype and delivery model as analytical lenses, not just labels

Weighted findings (findings with panel consensus — more weight means more members agree):
  ${findingsSummary}

Contradictions to surface explicitly:
  ${contradictionsSummary}

Risk archetype: ${reportData.archetypeLabel ?? 'Unknown'} — ${reportData.archetypeDescription ?? ''}
Severity band: ${reportData.band ?? 'Unknown'}
Delivery model: ${reportData.tradAgileLabel ?? 'Unknown'} (spectrum score: ${reportData.tradAgileScore ?? 0}/100)

Produce the synthesis in 250–350 words. Plain prose. Structure: overall picture first, then contradictions, then weighted consensus findings, then what this means for how the project should be run. No management language. No false comfort.`;
}
