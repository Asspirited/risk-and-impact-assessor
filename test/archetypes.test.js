import {
  ARCHETYPES, ARCHETYPE_LABELS, ARCHETYPE_DESCRIPTIONS, ARCHETYPE_WEIGHTS,
  scoreArchetypes, classifyArchetype, rankArchetypes, scoreToBand
} from '../src/archetypes.js';

const base = () => ({
  requirementsClarity: 0, stakeholderAlignment: 0, changeFrequency: 0, acceptanceCriteria: 0,
  budgetCertainty: 0, contingencyAdequacy: 0, costTracking: 0, financialExposure: 0,
  scheduleDefinition: 0, milestoneConfidence: 0, deadlineFlexibility: 0, criticalPathVisibility: 0,
  qualityStandards: 0, testingCoverage: 0, technicalDebt: 0, nonFunctionalRequirements: 0,
  technicalComplexity: 0, organisationalComplexity: 0, integrationComplexity: 0, regulatoryComplexity: 0,
  requirementsUncertainty: 0, technicalUncertainty: 0, stakeholderUncertainty: 0, externalUncertainty: 0,
  riskVisibility: 0, issueResolution: 0, assumptionValidity: 0, dependencyConfidence: 0
});

describe('ARCHETYPES', () => {
  test('has five keys', () => expect(Object.keys(ARCHETYPES)).toHaveLength(5));
  test.each(['HAUNTED_HOUSE','BOILING_FROG','PAPER_TIGER','CARGO_CULT','SLOW_BURN'])('contains %s', k => {
    expect(ARCHETYPES[k]).toBe(k);
  });
});

describe('ARCHETYPE_LABELS', () => {
  test.each(Object.keys(ARCHETYPES))('has label for %s', k => {
    expect(typeof ARCHETYPE_LABELS[k]).toBe('string');
    expect(ARCHETYPE_LABELS[k].length).toBeGreaterThan(0);
  });
});

describe('ARCHETYPE_DESCRIPTIONS', () => {
  test.each(Object.keys(ARCHETYPES))('has description for %s', k => {
    expect(typeof ARCHETYPE_DESCRIPTIONS[k]).toBe('string');
    expect(ARCHETYPE_DESCRIPTIONS[k].length).toBeGreaterThan(0);
  });
});

describe('ARCHETYPE_WEIGHTS', () => {
  test.each(Object.keys(ARCHETYPES))('has weights for %s', k => {
    expect(typeof ARCHETYPE_WEIGHTS[k]).toBe('object');
    expect(Object.keys(ARCHETYPE_WEIGHTS[k]).length).toBeGreaterThan(0);
  });
});

describe('scoreArchetypes', () => {
  test('returns object with five keys', () => {
    expect(Object.keys(scoreArchetypes(base()))).toHaveLength(5);
  });
  test('all zeros gives all-zero scores', () => {
    for (const v of Object.values(scoreArchetypes(base()))) expect(v).toBe(0);
  });
  test('riskVisibility=5 boosts HAUNTED_HOUSE', () => {
    const s = base(); s.riskVisibility = 5;
    expect(scoreArchetypes(s).HAUNTED_HOUSE).toBeGreaterThan(0);
  });
  test('technicalDebt=5 boosts SLOW_BURN', () => {
    const s = base(); s.technicalDebt = 5;
    expect(scoreArchetypes(s).SLOW_BURN).toBeGreaterThan(0);
  });
  test('throws on null', () => expect(() => scoreArchetypes(null)).toThrow());
});

describe('classifyArchetype', () => {
  test('returns a valid archetype key', () => {
    expect(Object.keys(ARCHETYPES)).toContain(classifyArchetype(base()));
  });
  test('HAUNTED_HOUSE when riskVisibility and issueResolution dominate', () => {
    const s = base(); s.riskVisibility = 5; s.issueResolution = 5;
    expect(classifyArchetype(s)).toBe('HAUNTED_HOUSE');
  });
  test('BOILING_FROG when milestoneConfidence and technicalDebt dominate', () => {
    const s = base(); s.milestoneConfidence = 5; s.technicalDebt = 5;
    expect(classifyArchetype(s)).toBe('BOILING_FROG');
  });
  test('PAPER_TIGER when costTracking and stakeholderAlignment dominate', () => {
    const s = base(); s.costTracking = 5; s.stakeholderAlignment = 5;
    expect(classifyArchetype(s)).toBe('PAPER_TIGER');
  });
  test('CARGO_CULT when organisationalComplexity and testingCoverage dominate', () => {
    const s = base(); s.organisationalComplexity = 5; s.testingCoverage = 5;
    expect(classifyArchetype(s)).toBe('CARGO_CULT');
  });
  test('SLOW_BURN when technicalDebt and integrationComplexity dominate', () => {
    const s = base(); s.technicalDebt = 5; s.integrationComplexity = 5;
    expect(classifyArchetype(s)).toBe('SLOW_BURN');
  });
  test('is deterministic', () => {
    const s = base(); s.riskVisibility = 3;
    expect(classifyArchetype(s)).toBe(classifyArchetype(s));
  });
  test('throws on invalid inputs', () => expect(() => classifyArchetype({})).toThrow());
});

describe('rankArchetypes', () => {
  test('returns n entries', () => expect(rankArchetypes(base(), 3)).toHaveLength(3));
  test('default n is 3', () => expect(rankArchetypes(base())).toHaveLength(3));
  test('returns all 5 when n=5', () => expect(rankArchetypes(base(), 5)).toHaveLength(5));
  test('sorted descending by score', () => {
    const s = base(); s.riskVisibility = 5;
    const r = rankArchetypes(s, 5);
    for (let i = 0; i < r.length - 1; i++) expect(r[i].score).toBeGreaterThanOrEqual(r[i+1].score);
  });
  test('top entry matches classifyArchetype', () => {
    const s = base(); s.technicalDebt = 5; s.integrationComplexity = 5;
    expect(rankArchetypes(s, 1)[0].archetype).toBe(classifyArchetype(s));
  });
  test('throws if n < 1', () => expect(() => rankArchetypes(base(), 0)).toThrow('positive integer'));
  test('throws if n is not integer', () => expect(() => rankArchetypes(base(), 1.5)).toThrow());
});

describe('scoreToBand', () => {
  test('returns LOW for score 0', () => expect(scoreToBand('HAUNTED_HOUSE', 0)).toBe('LOW'));
  test('returns CRITICAL for max score', () => expect(scoreToBand('HAUNTED_HOUSE', 50)).toBe('CRITICAL'));
  test('throws for unknown archetype', () => expect(() => scoreToBand('UNKNOWN', 10)).toThrow('Unknown archetype'));
  test.each(['HAUNTED_HOUSE','BOILING_FROG','PAPER_TIGER','CARGO_CULT','SLOW_BURN'])(
    'returns valid band for %s at score 0', a => {
      expect(['LOW','MEDIUM','HIGH','CRITICAL']).toContain(scoreToBand(a, 0));
    }
  );
});
