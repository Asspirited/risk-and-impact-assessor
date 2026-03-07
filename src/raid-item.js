/**
 * raid-item.js
 * Prompt assembly for individual RAID item analysis.
 * A RAID item is a specific Risk, Issue, Assumption, Dependency, or Change
 * that the user wants analysed in context of a completed project assessment.
 */

export const RAID_ITEM_TYPES = {
  RISK: {
    key:         'RISK',
    label:       'Risk',
    description: 'Something that might happen and could threaten delivery'
  },
  ISSUE: {
    key:         'ISSUE',
    label:       'Issue',
    description: 'Something that has already happened and is causing harm now'
  },
  ASSUMPTION: {
    key:         'ASSUMPTION',
    label:       'Assumption',
    description: 'Something believed to be true that has not been confirmed'
  },
  DEPENDENCY: {
    key:         'DEPENDENCY',
    label:       'Dependency',
    description: 'Something the project relies on that is outside its direct control'
  },
  CHANGE: {
    key:         'CHANGE',
    label:       'Change',
    description: 'A proposed or actual change to scope, approach, or constraints'
  }
};

/**
 * Validate a RAID item type and description.
 * @param {string} type
 * @param {string} description
 */
export function validateRaidItem(type, description) {
  if (!(type in RAID_ITEM_TYPES)) {
    throw new Error(`Unknown RAID item type: ${type}. Valid: ${Object.keys(RAID_ITEM_TYPES).join(', ')}`);
  }
  if (typeof description !== 'string' || description.trim() === '') {
    throw new Error('description must be a non-empty string');
  }
}

/**
 * Build a system prompt for analysing a specific RAID item in project context.
 * @param {string} type - RISK | ISSUE | ASSUMPTION | DEPENDENCY | CHANGE
 * @param {string} description - user-supplied description of the item
 * @param {Object} report - SynthesisReport (from assess())
 * @returns {string}
 */
export function buildRaidItemPrompt(type, description, report) {
  validateRaidItem(type, description);
  if (!report || typeof report !== 'object') {
    throw new Error('report must be a non-null object');
  }
  if (typeof report.projectName !== 'string' || report.projectName.trim() === '') {
    throw new Error('report.projectName is required');
  }

  const itemType = RAID_ITEM_TYPES[type];

  const dimSummary = report.dimensionScores
    ? Object.entries(report.dimensionScores)
        .map(([d, s]) => `${d}: ${typeof s === 'number' ? s.toFixed(1) : s}/5`)
        .join(', ')
    : 'not available';

  const findings = Array.isArray(report.weightedFindings) && report.weightedFindings.length > 0
    ? report.weightedFindings.map(f => `${f.dimension} (${f.consensus})`).join(', ')
    : 'none';

  const contradictions = Array.isArray(report.contradictions) && report.contradictions.length > 0
    ? report.contradictions.map(c => c.dimension).join(', ')
    : 'none';

  return `You are facilitating a panel review of a specific ${itemType.label.toLowerCase()} raised on an active project.

Project: ${report.projectName}
Risk archetype: ${report.archetypeLabel ?? 'unknown'} — ${report.archetypeDescription ?? ''}
Severity band: ${report.band ?? 'unknown'}
Delivery model: ${report.tradAgileLabel ?? 'unknown'} (spectrum score: ${report.tradAgileScore ?? 'n/a'}/100)
Dimension scores (0=no concern, 5=critical): ${dimSummary}
Panel consensus findings: ${findings}
Dimensions where the panel disagrees: ${contradictions}

The ${itemType.label.toLowerCase()} under review:
${description.trim()}

Produce a JSON object with exactly these four keys. No markdown. No code fences. Raw JSON only.

{
  "stakeholder": "Suni's read — business stakeholder view. What does this mean for cost, time, and business outcomes? 2–3 sentences. Plain prose, no bullet points.",
  "pm": "Peter's read — project manager view. What does this mean for schedule, governance, and RAID management? 2–3 sentences. Plain prose, no bullet points.",
  "dev": "Davos's read — development team view. What does this mean for technical quality, complexity, and uncertainty? 2–3 sentences. Plain prose, no bullet points.",
  "weller": "Paul Weller's synthesis. He speaks plainly, directly, no management language. Working-class authority. Cuts through the noise to say what the panel is really telling you and what needs to happen. 3–4 sentences."
}`;
}
