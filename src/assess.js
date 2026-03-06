/**
 * assess.js
 * Orchestration layer. Coordinates all computational modules to produce
 * a SynthesisReport from a project name and 28 sub-criteria inputs.
 * No API calls. Pure computation.
 */

import { validateSubCriteria, scoreDimensions }  from './dimensions.js';
import {
  classifyArchetype, rankArchetypes, scoreToBand,
  ARCHETYPE_LABELS, ARCHETYPE_DESCRIPTIONS, ARCHETYPE_WEIGHTS
} from './archetypes.js';
import { scoreTradAgile, tradAgileLabel }          from './trad-agile.js';
import { computeAllPanelViews }                    from './panel.js';
import { detectContradictions, computeWeightedFindings } from './synthesis.js';

const RECOMMENDATIONS = {
  HAUNTED_HOUSE: 'Name the elephant. Hold a structured risk disclosure session. The risk is already known — the work is making it safe to say.',
  BOILING_FROG:  'Instrument the drift. Measure velocity, quality, and attrition weekly. You cannot act on what you have not yet noticed.',
  PAPER_TIGER:   'Test one claim. Pick the most prominent metric and find out whether it measures anything real. Start there.',
  CARGO_CULT:    'Ask why. For each ceremony, establish what it is supposed to produce. Suspend any ritual that cannot answer the question.',
  SLOW_BURN:     'Ring-fence the debt. Quantify it, assign ownership, and allocate capacity to address it before it becomes the project.'
};

/**
 * Return the top N sub-criteria by weighted contribution to the dominant archetype.
 * Only sub-criteria with non-zero contribution are included.
 * @param {Object} inputs
 * @param {string} archetype
 * @param {number} n
 * @returns {string[]}
 */
export function topSignals(inputs, archetype, n = 3) {
  const weights = ARCHETYPE_WEIGHTS[archetype];
  if (!weights) throw new Error(`Unknown archetype: ${archetype}`);
  return Object.entries(weights)
    .map(([key, w]) => ({ key, contribution: inputs[key] * w }))
    .filter(({ contribution }) => contribution > 0)
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, n)
    .map(({ key }) => key);
}

/**
 * Run a complete computational assessment.
 * @param {string} projectName
 * @param {Object} inputs - 28 sub-criteria, each 0–5
 * @returns {Object} SynthesisReport (computational fields — no API narrative)
 */
export function assess(projectName, inputs) {
  if (typeof projectName !== 'string' || projectName.trim() === '') {
    throw new Error('projectName must be a non-empty string');
  }
  validateSubCriteria(inputs);

  const dimensionScores  = scoreDimensions(inputs);
  const archetype        = classifyArchetype(inputs);
  const ranked           = rankArchetypes(inputs, 5);
  const band             = scoreToBand(archetype, ranked[0].score);
  const tradAgileScore   = scoreTradAgile(inputs);
  const tradAgileLbl     = tradAgileLabel(tradAgileScore);
  const panelViews       = computeAllPanelViews(dimensionScores);
  const contradictions   = detectContradictions(panelViews);
  const weightedFindings = computeWeightedFindings(panelViews);
  const signals          = topSignals(inputs, archetype);

  return {
    projectName:          projectName.trim(),
    dimensionScores,
    archetype,
    archetypeLabel:       ARCHETYPE_LABELS[archetype],
    archetypeDescription: ARCHETYPE_DESCRIPTIONS[archetype],
    band,
    tradAgileScore,
    tradAgileLabel:       tradAgileLbl,
    rankedArchetypes:     ranked,
    panelViews,
    contradictions,
    weightedFindings,
    topSignals:           signals,
    recommendation:       RECOMMENDATIONS[archetype]
  };
}
