/**
 * presets.js
 * Delivery archetype presets — pre-populated sub-criteria scores for four
 * common delivery approaches. Each preset is a starting point; users can
 * adjust any slider before saving their project context.
 *
 * Scores (0–5): 0 = no concern, 5 = critical concern.
 * Values represent the typical risk profile of a well-run project
 * using that delivery approach — not a verdict on the approach itself.
 */

export const DELIVERY_PRESETS = {

  TRADITIONAL: {
    key:         'TRADITIONAL',
    label:       'Traditional',
    description: 'Plan-driven, fixed scope. Formal change control. Sequential phases. Big-bang delivery.',
    inputs: {
      // SCOPE — requirements defined upfront and locked
      requirementsClarity:       1,  // upfront requirement definition is the whole point
      stakeholderAlignment:      2,  // aligned at sign-off; drifts during execution
      changeFrequency:           0,  // formal change control — officially zero uncontrolled change
      acceptanceCriteria:        1,  // formal acceptance criteria defined in contract

      // COST — fixed-price, detailed estimates
      budgetCertainty:           1,  // budget baselined at project start
      contingencyAdequacy:       2,  // contingency typically too thin for reality
      costTracking:              1,  // formal EVM-style budget tracking
      financialExposure:         2,  // overrun risk from inflexibility, not poor tracking

      // TIME — Gantt-driven, milestone commitments
      scheduleDefinition:        1,  // detailed project schedule exists
      milestoneConfidence:       2,  // milestones known but tend to slip late
      deadlineFlexibility:       3,  // contractual or politically fixed dates
      criticalPathVisibility:    2,  // identified in plan, not always actively managed

      // QUALITY — formal gates, testing compressed at the end
      qualityStandards:          1,  // formal quality standards and sign-off gates
      testingCoverage:           3,  // testing phase is compressed and often cut
      technicalDebt:             2,  // accumulates without iterative refinement
      nonFunctionalRequirements: 2,  // often underspecified until acceptance

      // COMPLEXITY — siloed delivery, big-bang integration
      technicalComplexity:       2,  // known tech, but siloed development
      organisationalComplexity:  2,  // siloed departments and handoffs
      integrationComplexity:     3,  // big-bang integration is the defining risk
      regulatoryComplexity:      2,

      // UNCERTAINTY — suppressed and not acknowledged upfront
      requirementsUncertainty:   0,  // requirements "fixed" by contract — concern officially zero
      technicalUncertainty:      1,  // proven technology stack, known approach
      stakeholderUncertainty:    2,
      externalUncertainty:       1,  // external factors downplayed at initiation

      // RAID — formal register, assumptions rarely tested
      riskVisibility:            2,  // register exists but often goes stale
      issueResolution:           2,  // escalation-heavy, slow resolution
      assumptionValidity:        3,  // many untested upfront assumptions
      dependencyConfidence:      2
    }
  },

  HYBRID: {
    key:         'HYBRID',
    label:       'Hybrid',
    description: 'Iterative delivery within a governance framework. Sprints with stage gates. Formal reporting alongside agile practices.',
    inputs: {
      // SCOPE
      requirementsClarity:       2,  // requirements emerge across iterations
      stakeholderAlignment:      2,
      changeFrequency:           2,  // change accepted but controlled
      acceptanceCriteria:        2,

      // COST
      budgetCertainty:           2,
      contingencyAdequacy:       2,
      costTracking:              2,
      financialExposure:         2,

      // TIME
      scheduleDefinition:        2,
      milestoneConfidence:       2,
      deadlineFlexibility:       2,
      criticalPathVisibility:    2,

      // QUALITY — better than traditional; testing embedded per sprint
      qualityStandards:          2,
      testingCoverage:           1,  // sprint testing improves coverage
      technicalDebt:             2,
      nonFunctionalRequirements: 2,

      // COMPLEXITY — incremental integration reduces big-bang risk
      technicalComplexity:       2,
      organisationalComplexity:  2,
      integrationComplexity:     2,  // incremental, not big-bang
      regulatoryComplexity:      2,

      // UNCERTAINTY — acknowledged and managed iteratively
      requirementsUncertainty:   3,  // more uncertainty accepted than traditional
      technicalUncertainty:      2,
      stakeholderUncertainty:    2,
      externalUncertainty:       2,

      // RAID
      riskVisibility:            2,
      issueResolution:           2,
      assumptionValidity:        2,
      dependencyConfidence:      2
    }
  },

  AGILE: {
    key:         'AGILE',
    label:       'Agile',
    description: 'Sprint-based, iterative, team-led. Uncertainty embraced. Continuous stakeholder involvement. Budget and schedule less formally structured.',
    inputs: {
      // SCOPE — intentionally emergent
      requirementsClarity:       3,  // requirements emerge — less upfront clarity by design
      stakeholderAlignment:      1,  // continuous involvement keeps alignment high
      changeFrequency:           4,  // change is frequent and expected — the whole point
      acceptanceCriteria:        1,  // Definition of Done per story

      // COST — rolling budget model, harder to track traditionally
      budgetCertainty:           3,  // less certain than fixed-price
      contingencyAdequacy:       2,
      costTracking:              3,  // harder to track against a traditional baseline
      financialExposure:         2,

      // TIME — sprint cadence, not Gantt-driven
      scheduleDefinition:        3,  // no detailed Gantt; sprint cadence instead
      milestoneConfidence:       2,
      deadlineFlexibility:       2,  // sprints provide some flexibility
      criticalPathVisibility:    3,  // less formal critical path management

      // QUALITY — embedded testing; low risk
      qualityStandards:          1,
      testingCoverage:           1,  // TDD/BDD practices embedded
      technicalDebt:             2,  // managed in backlog but can accumulate
      nonFunctionalRequirements: 2,

      // COMPLEXITY — CI reduces integration risk
      technicalComplexity:       3,  // solving complex problems iteratively
      organisationalComplexity:  2,
      integrationComplexity:     3,  // integration happens continuously, not trivially
      regulatoryComplexity:      2,

      // UNCERTAINTY — embraced and managed iteratively
      requirementsUncertainty:   4,  // high by design — exploring the problem space
      technicalUncertainty:      4,  // iterative exploration of unknowns
      stakeholderUncertainty:    2,
      externalUncertainty:       3,

      // RAID — faster resolution, less formal
      riskVisibility:            2,
      issueResolution:           1,  // resolved within sprints, fast feedback
      assumptionValidity:        2,
      dependencyConfidence:      2
    }
  },

  AGILE_CD: {
    key:         'AGILE_CD',
    label:       'Agile CD',
    description: 'Continuous delivery. Automated pipelines, observability, frequent production releases. High technical capability; high technical complexity.',
    inputs: {
      // SCOPE — product model, continuously refined
      requirementsClarity:       3,  // intentionally emergent product discovery
      stakeholderAlignment:      1,  // embedded product team, continuous alignment
      changeFrequency:           4,  // change is continuous, automated, and the default mode
      acceptanceCriteria:        1,  // automated acceptance tests

      // COST — run-rate product model, less project-budget certainty
      budgetCertainty:           3,
      contingencyAdequacy:       2,
      costTracking:              2,
      financialExposure:         2,

      // TIME — flow metrics, not milestones
      scheduleDefinition:        3,  // no fixed milestones; lead time and throughput instead
      milestoneConfidence:       1,  // not milestone-driven
      deadlineFlexibility:       1,  // continuous flow; dates are not the primary constraint
      criticalPathVisibility:    3,  // critical path not the primary management model

      // QUALITY — automated throughout; lowest risk on the panel
      qualityStandards:          1,
      testingCoverage:           0,  // fully automated test suite across all layers
      technicalDebt:             1,  // managed continuously through refactoring
      nonFunctionalRequirements: 1,  // NFRs tested automatically in pipeline

      // COMPLEXITY — highest technical complexity; lowest integration risk
      technicalComplexity:       4,  // pipelines, cloud infrastructure, platform engineering
      organisationalComplexity:  2,
      integrationComplexity:     1,  // automated CI/CD; integration is a solved problem
      regulatoryComplexity:      2,

      // UNCERTAINTY — high and constant; managed through fast feedback
      requirementsUncertainty:   5,  // continuously discovering what to build — maximum
      technicalUncertainty:      5,  // constantly exploring bleeding-edge approaches
      stakeholderUncertainty:    2,
      externalUncertainty:       3,

      // RAID — observability and automation reduce risk; fast resolution
      riskVisibility:            1,  // automated monitoring and alerting
      issueResolution:           1,  // fast feedback loops; issues surface and resolve quickly
      assumptionValidity:        2,
      dependencyConfidence:      1   // infrastructure as code; dependencies versioned
    }
  }
};

/**
 * Return the inputs object for a given preset key.
 * @param {string} key - TRADITIONAL | HYBRID | AGILE | AGILE_CD
 * @returns {Object} sub-criteria inputs
 */
export function getPresetInputs(key) {
  if (!(key in DELIVERY_PRESETS)) {
    throw new Error(`Unknown preset: ${key}. Valid: ${Object.keys(DELIVERY_PRESETS).join(', ')}`);
  }
  return { ...DELIVERY_PRESETS[key].inputs };
}
