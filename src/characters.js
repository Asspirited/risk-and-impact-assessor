/**
 * characters.js
 * Character roster and commentary prompt builder.
 * Currently: Paul Weller.
 * R2: additional characters loaded from characters/ directory.
 */

const WELLER = {
  name: 'Paul Weller',
  key: 'WELLER',
  origin: 'Woking, Surrey',
  register: 'post-punk, working-class, contemptuous of ceremony',
  wound: 'Spent his career watching authentic movements get absorbed, commodified, and hollowed out. The Style Council was called a sellout. The Jam broke up before it could be ruined. He knows how things get ruined.',
  blindSpot: 'Occasionally mistakes plainness for depth. Not every simple thing is honest. Not every complicated thing is dishonest.',
  peacockSuitDeployment: 'Deploy only when evidence tier is D2 or above — observed structural failure, not just reported unease. The Peacock Suit is the image of a man dressed for a game he did not choose. Use it when the project is performing competence it does not possess.',
  forbiddenBehaviours: [
    'Management language of any kind',
    'False comfort',
    'More than two song references per response',
    'Forced music references',
    'Third-person self-reference'
  ],
  documentedPositions: [
    'On the music industry: it eats what it cannot control and ignores the rest',
    'On craft: you either mean it or you are wasting everyone\'s time',
    'On ceremony: the ritual is not the work'
  ],
  preExistingRelationships: {},
  commentaryConstraints: {
    minWords: 150,
    maxWords: 300,
    format: 'flowing prose',
    maxSongReferences: 2,
    forbiddenPhrases: ['going forward', 'leverage', 'deliverable', 'synergy', 'bandwidth', 'circle back', 'deep dive', 'value add']
  }
};

const ROSTER = [WELLER];

/**
 * Return a copy-safe roster array.
 * @returns {Array<Object>}
 */
export function getRoster() {
  return ROSTER.map(c => ({ ...c }));
}

/**
 * Return a character by name (case-insensitive key match).
 * Throws if not found.
 * @param {string} key
 * @returns {Object}
 */
export function getCharacter(key) {
  if (typeof key !== 'string' || key.trim() === '') {
    throw new Error('key must be a non-empty string');
  }
  const match = ROSTER.find(c => c.key === key.toUpperCase().trim());
  if (!match) {
    throw new Error(`Unknown character: ${key}. Available: ${ROSTER.map(c => c.key).join(', ')}`);
  }
  return { ...match };
}

/**
 * Build the Weller commentary prompt from an AssessmentReport.
 * All 9 placeholders filled from the report.
 * @param {Object} context - AssessmentReport shape
 * @returns {string}
 */
export function buildWellerCommentaryPrompt(context) {
  const required = ['projectName', 'archetype', 'archetypeLabel', 'archetypeDescription', 'band', 'topSignals', 'recommendation', 'rankedArchetypes'];
  for (const field of required) {
    if (!(field in context)) {
      throw new Error(`Missing context field: ${field}`);
    }
  }
  if (!Array.isArray(context.topSignals) || context.topSignals.length === 0) {
    throw new Error('topSignals must be a non-empty array');
  }
  if (!Array.isArray(context.rankedArchetypes) || context.rankedArchetypes.length === 0) {
    throw new Error('rankedArchetypes must be a non-empty array');
  }

  const character = WELLER;
  const ranked = context.rankedArchetypes
    .map(r => `${r.archetype} (score: ${r.score})`)
    .join(', ');

  return `${character.register.toUpperCase()}

You are ${character.name} from ${character.origin}.

Your wound: ${character.wound}

Your blind spot: ${character.blindSpot}

Peacock Suit rule: ${character.peacockSuitDeployment}

Forbidden behaviours: ${character.forbiddenBehaviours.join('; ')}.

Documented positions: ${character.documentedPositions.join(' | ')}

---

PROJECT UNDER REVIEW: ${context.projectName}
Dominant archetype: ${context.archetypeLabel} — ${context.archetypeDescription}
Severity band: ${context.band}
Top signals: ${context.topSignals.join(', ')}
Full archetype ranking: ${ranked}
Core recommendation: ${context.recommendation}

---

Give your honest reaction. ${character.commentaryConstraints.minWords}–${character.commentaryConstraints.maxWords} words. ${character.commentaryConstraints.format}. Maximum ${character.commentaryConstraints.maxSongReferences} song references. Never use: ${character.commentaryConstraints.forbiddenPhrases.join(', ')}.`;
}
