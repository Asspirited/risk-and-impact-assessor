/**
 * archetypes.js
 * Risk archetype classification engine.
 * Classifies projects into one of five archetypes based on weighted sub-criteria scores.
 * Each archetype drives a distinct commentary register and recommendation set.
 */

import { validateSubCriteria } from './dimensions.js';

export const ARCHETYPES = {
  HAUNTED_HOUSE: 'HAUNTED_HOUSE',
  BOILING_FROG:  'BOILING_FROG',
  PAPER_TIGER:   'PAPER_TIGER',
  CARGO_CULT:    'CARGO_CULT',
  SLOW_BURN:     'SLOW_BURN'
};

export const ARCHETYPE_LABELS = {
  HAUNTED_HOUSE: 'Haunted House',
  BOILING_FROG:  'Boiling Frog',
  PAPER_TIGER:   'Paper Tiger',
  CARGO_CULT:    'Cargo Cult',
  SLOW_BURN:     'Slow Burn'
};

export const ARCHETYPE_DESCRIPTIONS = {
  HAUNTED_HOUSE: 'Everyone knows something is wrong. Nobody will say it out loud.',
  BOILING_FROG:  'Slow degradation that nobody has noticed yet — until it is far too late.',
  PAPER_TIGER:   'Impressive on the surface. Nothing behind it.',
  CARGO_CULT:    'Performing the rituals without understanding why. Mistaking ceremony for delivery.',
  SLOW_BURN:     'Real delivery, real discipline — but the conditions for failure are quietly assembling.'
};

// Archetype scoring weights. Keyed to sub-criteria from dimensions.js.
// Each archetype scores on the sub-criteria most diagnostic for its pattern.
export const ARCHETYPE_WEIGHTS = {
  HAUNTED_HOUSE: {
    riskVisibility:     3,
    issueResolution:    3,
    assumptionValidity: 2,
    dependencyConfidence: 2
  },
  BOILING_FROG: {
    milestoneConfidence: 3,
    technicalDebt:       3,
    qualityStandards:    2,
    changeFrequency:     2
  },
  PAPER_TIGER: {
    costTracking:        3,
    stakeholderAlignment: 3,
    milestoneConfidence: 2,
    qualityStandards:    2
  },
  CARGO_CULT: {
    organisationalComplexity:  3,
    testingCoverage:           3,
    qualityStandards:          2,
    nonFunctionalRequirements: 2
  },
  SLOW_BURN: {
    technicalDebt:        3,
    integrationComplexity: 3,
    technicalComplexity:   2,
    dependencyConfidence:  2
  }
};

/**
 * Score all archetypes against the given sub-criteria inputs.
 * @param {Object} inputs - validated sub-criteria
 * @returns {Object} mapping archetype key to numeric score
 */
export function scoreArchetypes(inputs) {
  validateSubCriteria(inputs);
  const scores = {};
  for (const [archetype, weights] of Object.entries(ARCHETYPE_WEIGHTS)) {
    let score = 0;
    for (const [key, weight] of Object.entries(weights)) {
      score += inputs[key] * weight;
    }
    scores[archetype] = score;
  }
  return scores;
}

/**
 * Classify a project into its dominant archetype.
 * Ties broken by ARCHETYPES key order (deterministic).
 * @param {Object} inputs
 * @returns {string} archetype key
 */
export function classifyArchetype(inputs) {
  const scores = scoreArchetypes(inputs);
  let best = null;
  let bestScore = -1;
  for (const key of Object.keys(ARCHETYPES)) {
    if (scores[key] > bestScore) {
      bestScore = scores[key];
      best = key;
    }
  }
  return best;
}

/**
 * Return the top N archetypes ranked by score descending.
 * @param {Object} inputs
 * @param {number} n
 * @returns {Array<{archetype: string, score: number}>}
 */
export function rankArchetypes(inputs, n = 3) {
  if (typeof n !== 'number' || n < 1 || !Number.isInteger(n)) {
    throw new Error('n must be a positive integer');
  }
  const scores = scoreArchetypes(inputs);
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([archetype, score]) => ({ archetype, score }));
}

/**
 * Return a severity band for a given archetype score relative to its maximum.
 * @param {string} archetype
 * @param {number} score
 * @returns {'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'}
 */
export function scoreToBand(archetype, score) {
  if (!(archetype in ARCHETYPE_WEIGHTS)) {
    throw new Error(`Unknown archetype: ${archetype}`);
  }
  const weights = ARCHETYPE_WEIGHTS[archetype];
  const maxScore = Object.values(weights).reduce((sum, w) => sum + w * 5, 0);
  const ratio = score / maxScore;
  if (ratio < 0.25) return 'LOW';
  if (ratio < 0.50) return 'MEDIUM';
  if (ratio < 0.75) return 'HIGH';
  return 'CRITICAL';
}
