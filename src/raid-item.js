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

  return `You are a project risk analyst reviewing a specific ${itemType.label.toLowerCase()} raised on an active project.

Project: ${report.projectName}
Risk archetype: ${report.archetypeLabel ?? 'unknown'} — ${report.archetypeDescription ?? ''}
Severity band: ${report.band ?? 'unknown'}
Delivery model: ${report.tradAgileLabel ?? 'unknown'} (spectrum score: ${report.tradAgileScore ?? 'n/a'}/100)
Dimension scores (0=no concern, 5=critical): ${dimSummary}
Panel consensus findings: ${findings}
Dimensions where the panel disagrees: ${contradictions}

The ${itemType.label.toLowerCase()} under review:
${description.trim()}

Analyse this ${itemType.label.toLowerCase()} in the context of this project's current risk profile. Structure your response as follows:
1. What this implies — given the project's archetype and severity, what does this ${itemType.label.toLowerCase()} signal?
2. Three questions to ask — to fully understand the ${itemType.label.toLowerCase()} and its impact
3. Recommended immediate action — one concrete next step
4. Panel perspective — which of the three panel roles (Business Stakeholder, Project Manager, Development Team) is most exposed, and why

Plain prose. No jargon. 150–250 words.`;
}
