/**
 * persona-prompts.js
 * Assembles system prompts for persona commentary on a SynthesisReport.
 * Personas: WELLER, SKEPTIC, COACH, AUDITOR.
 * Each persona comments on the synthesis — not the raw inputs.
 */

export const PERSONAS = {
  WELLER:  'WELLER',
  SKEPTIC: 'SKEPTIC',
  COACH:   'COACH',
  AUDITOR: 'AUDITOR'
};

export const PERSONA_LABELS = {
  WELLER:  'Paul Weller',
  SKEPTIC: 'The Skeptic',
  COACH:   'The Coach',
  AUDITOR: 'The Auditor'
};

export const REQUIRED_REPORT_FIELDS = [
  'projectName', 'archetype', 'archetypeLabel', 'archetypeDescription',
  'band', 'topSignals', 'recommendation'
];

/**
 * Validate a SynthesisReport has the required fields.
 * @param {Object} report
 */
export function validateReport(report) {
  if (!report || typeof report !== 'object') {
    throw new Error('report must be a non-null object');
  }
  for (const field of REQUIRED_REPORT_FIELDS) {
    if (!(field in report)) {
      throw new Error(`Missing report field: ${field}`);
    }
  }
  if (!Array.isArray(report.topSignals) || report.topSignals.length === 0) {
    throw new Error('topSignals must be a non-empty array');
  }
  if (typeof report.projectName !== 'string' || report.projectName.trim() === '') {
    throw new Error('projectName must be a non-empty string');
  }
}

/**
 * Validate a persona key.
 * @param {string} persona
 */
export function validatePersona(persona) {
  if (!(persona in PERSONAS)) {
    throw new Error(`Unknown persona: ${persona}. Valid: ${Object.keys(PERSONAS).join(', ')}`);
  }
}

function contextBlock(report) {
  const findings = Array.isArray(report.weightedFindings) && report.weightedFindings.length > 0
    ? report.weightedFindings.map(f => `${f.dimension} (${f.consensus})`).join(', ')
    : 'none';
  const contradictions = Array.isArray(report.contradictions) && report.contradictions.length > 0
    ? report.contradictions.map(c => `${c.dimension}: ${c.flaggedBy?.join(',')} vs ${c.notFlaggedBy?.join(',')}`).join('; ')
    : 'none';
  return `Project: ${report.projectName}
Risk archetype: ${report.archetypeLabel} — ${report.archetypeDescription}
Severity: ${report.band}
Top signals: ${report.topSignals.join(', ')}
Delivery model: ${report.tradAgileLabel ?? 'unknown'} (score: ${report.tradAgileScore ?? 'n/a'}/100)
Consensus findings: ${findings}
Contradictions between panel: ${contradictions}
Recommendation: ${report.recommendation}`;
}

function buildWellerPrompt(report) {
  return `You are Paul Weller — musician, songwriter, the Modfather. Post-punk, working-class Woking. You have been asked to comment on a project risk synthesis. You did not ask to be here. You are not a consultant.

You care about: authenticity, craft, whether the work actually means something to the people doing it. You have no patience for ceremony masquerading as delivery.

Maximum two song references. Colloquial British English. Short sentences. No management language. If you catch yourself about to say "going forward" or "leverage" or "deliverable" you stop and say something real instead.

${contextBlock(report)}

Give your honest reaction. 150–250 words. Flowing prose. What does this remind you of? What needs to be said that nobody is saying?`;
}

function buildSkepticPrompt(report) {
  return `You are a senior consultant with 30 years of failed transformation programmes behind you. Your scepticism is earned, not performed.

You do not offer false comfort. You name the structural forces that will resist change. You identify who benefits from the current dysfunction.

Plain English. No jargon. Not unkind — honest.

${contextBlock(report)}

What is the structural reality here? What will actually happen if nothing changes? 150–250 words.`;
}

function buildCoachPrompt(report) {
  return `You are an experienced agile coach who has helped teams in genuine trouble find their way back. You do not offer empty encouragement — you offer real paths forward.

You believe most teams want to do good work and are being prevented by conditions, not character. You speak to the team, not about them.

${contextBlock(report)}

What would you say to this team? What is the first thing you would ask them to try? What are you genuinely optimistic about? 150–250 words.`;
}

function buildAuditorPrompt(report) {
  return `You are a senior delivery auditor. Your job: document what is observable, name what the evidence implies, state what is not yet known. No speculation. No editorialising. No softening.

Plain, precise English. Short paragraphs. Active voice.

${contextBlock(report)}

Produce your findings summary. 150–250 words. Numbered paragraphs. No hedging. No management language.`;
}

const PROMPT_BUILDERS = {
  WELLER:  buildWellerPrompt,
  SKEPTIC: buildSkepticPrompt,
  COACH:   buildCoachPrompt,
  AUDITOR: buildAuditorPrompt
};

/**
 * Assemble a system prompt for a given persona and SynthesisReport.
 * @param {string} persona
 * @param {Object} report
 * @returns {string}
 */
export function buildPersonaPrompt(persona, report) {
  validatePersona(persona);
  validateReport(report);
  return PROMPT_BUILDERS[persona](report);
}

/**
 * Build prompts for all personas.
 * @param {Object} report
 * @returns {Object} mapping persona key to prompt string
 */
export function buildAllPersonaPrompts(report) {
  validateReport(report);
  const result = {};
  for (const persona of Object.keys(PERSONAS)) {
    result[persona] = PROMPT_BUILDERS[persona](report);
  }
  return result;
}
