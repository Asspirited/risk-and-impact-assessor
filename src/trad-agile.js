/**
 * trad-agile.js
 * Scores a project on the Traditional–Agile delivery spectrum.
 * Score 0–100. Higher = more suited to agile delivery.
 * Bands: 0–30 Traditional, 31–70 Hybrid, 71–100 Agile.
 */

import { validateSubCriteria } from './dimensions.js';

// Sub-criteria that indicate agile suitability when high.
const AGILE_WEIGHTS = {
  requirementsUncertainty: 3,
  technicalUncertainty:    3,
  changeFrequency:         2,
  technicalComplexity:     2,
  integrationComplexity:   2,
  externalUncertainty:     2
};

const MAX_AGILE_SCORE = Object.values(AGILE_WEIGHTS).reduce((s, w) => s + w * 5, 0); // 70

/**
 * Compute the Trad/Agile spectrum score (0–100).
 * @param {Object} inputs - validated sub-criteria
 * @returns {number} integer 0–100
 */
export function scoreTradAgile(inputs) {
  validateSubCriteria(inputs);
  const raw = Object.entries(AGILE_WEIGHTS)
    .reduce((sum, [key, weight]) => sum + inputs[key] * weight, 0);
  return Math.round((raw / MAX_AGILE_SCORE) * 100);
}

/**
 * Return the delivery label for a given spectrum score.
 * @param {number} score - 0–100
 * @returns {'Traditional'|'Hybrid'|'Agile'}
 */
export function tradAgileLabel(score) {
  if (typeof score !== 'number' || !Number.isFinite(score)) {
    throw new Error('score must be a finite number');
  }
  if (score <= 30) return 'Traditional';
  if (score <= 70) return 'Hybrid';
  return 'Agile';
}
