/**
 * dimensions.js
 * Defines the seven project risk dimensions and their 28 sub-criteria.
 * Validates sub-criteria inputs and computes dimension scores.
 */

export const DIMENSIONS = {
  SCOPE:       ['requirementsClarity', 'stakeholderAlignment', 'changeFrequency', 'acceptanceCriteria'],
  COST:        ['budgetCertainty', 'contingencyAdequacy', 'costTracking', 'financialExposure'],
  TIME:        ['scheduleDefinition', 'milestoneConfidence', 'deadlineFlexibility', 'criticalPathVisibility'],
  QUALITY:     ['qualityStandards', 'testingCoverage', 'technicalDebt', 'nonFunctionalRequirements'],
  COMPLEXITY:  ['technicalComplexity', 'organisationalComplexity', 'integrationComplexity', 'regulatoryComplexity'],
  UNCERTAINTY: ['requirementsUncertainty', 'technicalUncertainty', 'stakeholderUncertainty', 'externalUncertainty'],
  RAID:        ['riskVisibility', 'issueResolution', 'assumptionValidity', 'dependencyConfidence']
};

export const SUB_CRITERIA = Object.values(DIMENSIONS).flat();

export const DIMENSION_LABELS = {
  SCOPE:       'Scope',
  COST:        'Cost',
  TIME:        'Time',
  QUALITY:     'Quality',
  COMPLEXITY:  'Complexity',
  UNCERTAINTY: 'Uncertainty',
  RAID:        'RAID'
};

/**
 * Validate a sub-criteria input object.
 * Throws if any sub-criterion is missing, non-numeric, or outside 0–5.
 * @param {Object} inputs
 */
export function validateSubCriteria(inputs) {
  if (!inputs || typeof inputs !== 'object' || Array.isArray(inputs)) {
    throw new Error('inputs must be a non-null object');
  }
  for (const key of SUB_CRITERIA) {
    if (!(key in inputs)) {
      throw new Error(`Missing sub-criterion: ${key}`);
    }
    const v = inputs[key];
    if (typeof v !== 'number' || !Number.isFinite(v)) {
      throw new Error(`Sub-criterion ${key} must be a finite number, got: ${v}`);
    }
    if (v < 0 || v > 5) {
      throw new Error(`Sub-criterion ${key} must be 0–5, got: ${v}`);
    }
  }
}

/**
 * Compute a score per dimension as the average of its four sub-criteria.
 * @param {Object} inputs - validated sub-criteria
 * @returns {Object} mapping dimension key to numeric score 0–5
 */
export function scoreDimensions(inputs) {
  validateSubCriteria(inputs);
  const scores = {};
  for (const [dim, criteria] of Object.entries(DIMENSIONS)) {
    const sum = criteria.reduce((acc, key) => acc + inputs[key], 0);
    scores[dim] = sum / criteria.length;
  }
  return scores;
}
