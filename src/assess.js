/**
 * assess.js
 * Orchestration layer. Coordinates signal validation, archetype classification,
 * top-signal identification, recommendation generation, and AssessmentReport assembly.
 * Single entry point for a complete project risk assessment.
 */

import {
  SIGNAL_WEIGHTS,
  ARCHETYPE_LABELS,
  ARCHETYPE_DESCRIPTIONS,
  validateSignals,
  classifyArchetype,
  rankArchetypes,
  scoreToBand
} from './archetypes.js';

const RECOMMENDATIONS = {
  HAUNTED_HOUSE: 'Name the elephant. Hold a structured risk disclosure session. The risk is already known — the work is making it safe to say.',
  BOILING_FROG: 'Instrument the drift. Measure velocity, quality, and attrition weekly. You cannot act on what you have not yet noticed.',
  PAPER_TIGER: 'Test one claim. Pick the most prominent metric and find out whether it measures anything real. Start there.',
  CARGO_CULT: 'Ask why. For each ceremony, establish what it is supposed to produce. Suspend any ritual that cannot answer the question.',
  SLOW_BURN: 'Ring-fence the debt. Quantify it, assign ownership, and allocate capacity to address it before it becomes the project.'
};

/**
 * Return the top N signals by weighted contribution to the given archetype.
 * Only signals with a non-zero contribution are included.
 * @param {Object} signals
 * @param {string} archetype - ARCHETYPES key
 * @param {number} n
 * @returns {string[]}
 */
export function topSignals(signals, archetype, n = 3) {
  const weights = SIGNAL_WEIGHTS[archetype];
  return Object.entries(weights)
    .map(([signal, weight]) => ({ signal, contribution: signals[signal] * weight }))
    .filter(({ contribution }) => contribution > 0)
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, n)
    .map(({ signal }) => signal);
}

/**
 * Return the archetype-specific recommendation string.
 * @param {string} archetype - ARCHETYPES key
 * @returns {string}
 */
export function recommend(archetype) {
  if (!(archetype in RECOMMENDATIONS)) {
    throw new Error(`Unknown archetype: ${archetype}`);
  }
  return RECOMMENDATIONS[archetype];
}

/**
 * Run a complete assessment and return an AssessmentReport.
 * @param {string} projectName
 * @param {Object} signals
 * @returns {Object} AssessmentReport
 */
export function assess(projectName, signals) {
  if (typeof projectName !== 'string' || projectName.trim() === '') {
    throw new Error('projectName must be a non-empty string');
  }
  validateSignals(signals);

  const archetype = classifyArchetype(signals);
  const ranked = rankArchetypes(signals, 5);
  const band = scoreToBand(archetype, ranked[0].score);
  const top = topSignals(signals, archetype);

  return {
    projectName: projectName.trim(),
    archetype,
    archetypeLabel: ARCHETYPE_LABELS[archetype],
    archetypeDescription: ARCHETYPE_DESCRIPTIONS[archetype],
    band,
    topSignals: top,
    recommendation: recommend(archetype),
    rankedArchetypes: ranked
  };
}
