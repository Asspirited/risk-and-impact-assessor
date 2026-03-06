/**
 * archetypes.js
 * Risk archetype classification engine.
 * Classifies projects into one of five archetypes based on signal scores.
 * Each archetype drives a distinct commentary register and recommendation set.
 */

export const ARCHETYPES = {
  HAUNTED_HOUSE: 'HAUNTED_HOUSE',
  BOILING_FROG: 'BOILING_FROG',
  PAPER_TIGER: 'PAPER_TIGER',
  CARGO_CULT: 'CARGO_CULT',
  SLOW_BURN: 'SLOW_BURN'
};

export const ARCHETYPE_LABELS = {
  HAUNTED_HOUSE: 'Haunted House',
  BOILING_FROG: 'Boiling Frog',
  PAPER_TIGER: 'Paper Tiger',
  CARGO_CULT: 'Cargo Cult',
  SLOW_BURN: 'Slow Burn'
};

export const ARCHETYPE_DESCRIPTIONS = {
  HAUNTED_HOUSE: 'Everyone knows something is wrong. Nobody will say it out loud.',
  BOILING_FROG: 'Slow degradation that nobody has noticed yet — until it is far too late.',
  PAPER_TIGER: 'Impressive on the surface. Nothing behind it.',
  CARGO_CULT: 'Performing the rituals without understanding why. Mistaking ceremony for delivery.',
  SLOW_BURN: 'Real delivery, real discipline — but the conditions for failure are quietly assembling.'
};

// Signal weights per archetype. Each signal is 0–5.
// Weighted sum determines archetype score; highest wins.
export const SIGNAL_WEIGHTS = {
  HAUNTED_HOUSE: {
    unspokenRisk: 3,
    statusHiding: 3,
    meetingTheater: 2,
    scopeChurn: 1,
    processRigidity: 1
  },
  BOILING_FROG: {
    velocityDrift: 3,
    qualityDrift: 3,
    teamAttrition: 2,
    scopeChurn: 1,
    statusHiding: 1
  },
  PAPER_TIGER: {
    metricsWithoutMeaning: 3,
    stakeholderPerformance: 3,
    meetingTheater: 2,
    processRigidity: 1,
    unspokenRisk: 1
  },
  CARGO_CULT: {
    processRigidity: 3,
    meetingTheater: 3,
    metricsWithoutMeaning: 2,
    stakeholderPerformance: 1,
    velocityDrift: 1
  },
  SLOW_BURN: {
    technicalDebt: 3,
    teamAttrition: 2,
    scopeChurn: 2,
    qualityDrift: 2,
    velocityDrift: 1
  }
};

export const SIGNALS = [
  'unspokenRisk',
  'statusHiding',
  'meetingTheater',
  'scopeChurn',
  'processRigidity',
  'velocityDrift',
  'qualityDrift',
  'teamAttrition',
  'metricsWithoutMeaning',
  'stakeholderPerformance',
  'technicalDebt'
];

/**
 * Validate a signals object.
 * Throws if any signal is missing, not a number, or outside 0–5.
 * @param {Object} signals
 */
export function validateSignals(signals) {
  if (!signals || typeof signals !== 'object') {
    throw new Error('signals must be a non-null object');
  }
  for (const key of SIGNALS) {
    if (!(key in signals)) {
      throw new Error(`Missing signal: ${key}`);
    }
    const v = signals[key];
    if (typeof v !== 'number' || !Number.isFinite(v)) {
      throw new Error(`Signal ${key} must be a finite number, got: ${v}`);
    }
    if (v < 0 || v > 5) {
      throw new Error(`Signal ${key} must be 0–5, got: ${v}`);
    }
  }
}

/**
 * Score all archetypes against the given signals.
 * Returns an object mapping archetype keys to numeric scores.
 * @param {Object} signals
 * @returns {Object}
 */
export function scoreArchetypes(signals) {
  validateSignals(signals);
  const scores = {};
  for (const [archetype, weights] of Object.entries(SIGNAL_WEIGHTS)) {
    let score = 0;
    for (const [signal, weight] of Object.entries(weights)) {
      score += signals[signal] * weight;
    }
    scores[archetype] = score;
  }
  return scores;
}

/**
 * Classify a project into its dominant archetype.
 * Returns the archetype key with the highest weighted score.
 * Ties broken by ARCHETYPES key order (deterministic).
 * @param {Object} signals
 * @returns {string} archetype key
 */
export function classifyArchetype(signals) {
  const scores = scoreArchetypes(signals);
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
 * @param {Object} signals
 * @param {number} n
 * @returns {Array<{archetype: string, score: number}>}
 */
export function rankArchetypes(signals, n = 3) {
  if (typeof n !== 'number' || n < 1 || !Number.isInteger(n)) {
    throw new Error('n must be a positive integer');
  }
  const scores = scoreArchetypes(signals);
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([archetype, score]) => ({ archetype, score }));
}

/**
 * Return a severity band for a given archetype score.
 * Max possible score varies by archetype; band is relative to max.
 * @param {string} archetype
 * @param {number} score
 * @returns {'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'}
 */
export function scoreToBand(archetype, score) {
  if (!(archetype in SIGNAL_WEIGHTS)) {
    throw new Error(`Unknown archetype: ${archetype}`);
  }
  const weights = SIGNAL_WEIGHTS[archetype];
  const maxScore = Object.values(weights).reduce((sum, w) => sum + w * 5, 0);
  const ratio = score / maxScore;
  if (ratio < 0.25) return 'LOW';
  if (ratio < 0.50) return 'MEDIUM';
  if (ratio < 0.75) return 'HIGH';
  return 'CRITICAL';
}
