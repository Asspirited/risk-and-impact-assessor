import { assess, topSignals } from '../src/assess.js';
import { ARCHETYPES } from '../src/archetypes.js';

const base = () => ({
  requirementsClarity: 0, stakeholderAlignment: 0, changeFrequency: 0, acceptanceCriteria: 0,
  budgetCertainty: 0, contingencyAdequacy: 0, costTracking: 0, financialExposure: 0,
  scheduleDefinition: 0, milestoneConfidence: 0, deadlineFlexibility: 0, criticalPathVisibility: 0,
  qualityStandards: 0, testingCoverage: 0, technicalDebt: 0, nonFunctionalRequirements: 0,
  technicalComplexity: 0, organisationalComplexity: 0, integrationComplexity: 0, regulatoryComplexity: 0,
  requirementsUncertainty: 0, technicalUncertainty: 0, stakeholderUncertainty: 0, externalUncertainty: 0,
  riskVisibility: 0, issueResolution: 0, assumptionValidity: 0, dependencyConfidence: 0
});

const max = {
  HAUNTED_HOUSE: () => ({ ...base(), riskVisibility: 5, issueResolution: 5 }),
  BOILING_FROG:  () => ({ ...base(), milestoneConfidence: 5, technicalDebt: 5 }),
  PAPER_TIGER:   () => ({ ...base(), costTracking: 5, stakeholderAlignment: 5 }),
  CARGO_CULT:    () => ({ ...base(), organisationalComplexity: 5, testingCoverage: 5 }),
  SLOW_BURN:     () => ({ ...base(), technicalDebt: 5, integrationComplexity: 5 })
};

describe('assess — report shape', () => {
  test('returns all required SynthesisReport fields', () => {
    const r = assess('Test', max.HAUNTED_HOUSE());
    expect(r).toHaveProperty('projectName');
    expect(r).toHaveProperty('dimensionScores');
    expect(r).toHaveProperty('archetype');
    expect(r).toHaveProperty('archetypeLabel');
    expect(r).toHaveProperty('archetypeDescription');
    expect(r).toHaveProperty('band');
    expect(r).toHaveProperty('tradAgileScore');
    expect(r).toHaveProperty('tradAgileLabel');
    expect(r).toHaveProperty('rankedArchetypes');
    expect(r).toHaveProperty('panelViews');
    expect(r).toHaveProperty('contradictions');
    expect(r).toHaveProperty('weightedFindings');
    expect(r).toHaveProperty('topSignals');
    expect(r).toHaveProperty('recommendation');
  });

  test('projectName is trimmed', () => {
    expect(assess('  Test  ', base()).projectName).toBe('Test');
  });

  test('dimensionScores has seven keys', () => {
    expect(Object.keys(assess('Test', base()).dimensionScores)).toHaveLength(7);
  });

  test('rankedArchetypes has five entries', () => {
    expect(assess('Test', base()).rankedArchetypes).toHaveLength(5);
  });

  test('panelViews has SUNI, PETER, DAVOS', () => {
    const r = assess('Test', base());
    expect(r.panelViews).toHaveProperty('SUNI');
    expect(r.panelViews).toHaveProperty('PETER');
    expect(r.panelViews).toHaveProperty('DAVOS');
  });

  test('contradictions is an array', () => {
    expect(Array.isArray(assess('Test', base()).contradictions)).toBe(true);
  });

  test('weightedFindings is an array', () => {
    expect(Array.isArray(assess('Test', base()).weightedFindings)).toBe(true);
  });

  test('band is one of LOW MEDIUM HIGH CRITICAL', () => {
    expect(['LOW','MEDIUM','HIGH','CRITICAL']).toContain(assess('Test', base()).band);
  });

  test('tradAgileScore is 0–100', () => {
    const score = assess('Test', base()).tradAgileScore;
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('assess — archetype classification', () => {
  test.each([
    ['HAUNTED_HOUSE', 'Haunted House'],
    ['BOILING_FROG',  'Boiling Frog'],
    ['PAPER_TIGER',   'Paper Tiger'],
    ['CARGO_CULT',    'Cargo Cult'],
    ['SLOW_BURN',     'Slow Burn']
  ])('classifies %s correctly', (archetype, label) => {
    const r = assess('Test', max[archetype]());
    expect(r.archetype).toBe(archetype);
    expect(r.archetypeLabel).toBe(label);
  });
});

describe('assess — validation', () => {
  test('throws on empty projectName', () => {
    expect(() => assess('', base())).toThrow('projectName');
  });
  test('throws on whitespace-only projectName', () => {
    expect(() => assess('   ', base())).toThrow('projectName');
  });
  test('throws on missing sub-criterion', () => {
    const s = base(); delete s.technicalDebt;
    expect(() => assess('Test', s)).toThrow('technicalDebt');
  });
  test('throws on sub-criterion above 5', () => {
    const s = base(); s.riskVisibility = 6;
    expect(() => assess('Test', s)).toThrow('riskVisibility');
  });
  test('throws on null inputs', () => {
    expect(() => assess('Test', null)).toThrow();
  });
});

describe('assess — determinism', () => {
  test('identical inputs produce equal reports', () => {
    const s = base(); s.riskVisibility = 3; s.technicalDebt = 2;
    expect(assess('Test', s)).toEqual(assess('Test', s));
  });
});

describe('topSignals', () => {
  test('returns top contributing signals for HAUNTED_HOUSE', () => {
    const s = base(); s.riskVisibility = 5; s.issueResolution = 3;
    expect(topSignals(s, 'HAUNTED_HOUSE')).toContain('riskVisibility');
  });

  test('excludes zero-contribution signals', () => {
    const s = base(); s.technicalDebt = 5;
    const result = topSignals(s, 'SLOW_BURN');
    expect(result).toContain('technicalDebt');
    expect(result).not.toContain('riskVisibility');
  });

  test('returns at most n entries', () => {
    const s = base(); s.riskVisibility = 5; s.issueResolution = 4; s.assumptionValidity = 3;
    expect(topSignals(s, 'HAUNTED_HOUSE', 2)).toHaveLength(2);
  });

  test('returns fewer when fewer non-zero contributors', () => {
    const s = base(); s.technicalDebt = 5;
    expect(topSignals(s, 'SLOW_BURN').length).toBeLessThanOrEqual(1);
  });

  test('throws for unknown archetype', () => {
    expect(() => topSignals(base(), 'UNKNOWN')).toThrow('Unknown archetype');
  });
});
