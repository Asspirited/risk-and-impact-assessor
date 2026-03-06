import { scoreTradAgile, tradAgileLabel } from '../src/trad-agile.js';

const base = () => ({
  requirementsClarity: 0, stakeholderAlignment: 0, changeFrequency: 0, acceptanceCriteria: 0,
  budgetCertainty: 0, contingencyAdequacy: 0, costTracking: 0, financialExposure: 0,
  scheduleDefinition: 0, milestoneConfidence: 0, deadlineFlexibility: 0, criticalPathVisibility: 0,
  qualityStandards: 0, testingCoverage: 0, technicalDebt: 0, nonFunctionalRequirements: 0,
  technicalComplexity: 0, organisationalComplexity: 0, integrationComplexity: 0, regulatoryComplexity: 0,
  requirementsUncertainty: 0, technicalUncertainty: 0, stakeholderUncertainty: 0, externalUncertainty: 0,
  riskVisibility: 0, issueResolution: 0, assumptionValidity: 0, dependencyConfidence: 0
});

describe('scoreTradAgile', () => {
  test('all agile indicators at 0 returns 0', () => {
    expect(scoreTradAgile(base())).toBe(0);
  });

  test('all agile indicators at 5 returns 100', () => {
    const s = base();
    s.requirementsUncertainty = 5; s.technicalUncertainty = 5; s.changeFrequency = 5;
    s.technicalComplexity = 5; s.integrationComplexity = 5; s.externalUncertainty = 5;
    expect(scoreTradAgile(s)).toBe(100);
  });

  test('score is between 0 and 100 for any valid input', () => {
    const s = base(); s.technicalUncertainty = 3; s.changeFrequency = 2;
    const score = scoreTradAgile(s);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('non-agile sub-criteria do not affect score', () => {
    const s = base(); s.technicalDebt = 5; s.riskVisibility = 5;
    expect(scoreTradAgile(s)).toBe(0);
  });

  test('is deterministic', () => {
    const s = base(); s.requirementsUncertainty = 3;
    expect(scoreTradAgile(s)).toBe(scoreTradAgile(s));
  });

  test('throws on null inputs', () => {
    expect(() => scoreTradAgile(null)).toThrow();
  });

  test('returns integer', () => {
    const s = base(); s.requirementsUncertainty = 3;
    expect(Number.isInteger(scoreTradAgile(s))).toBe(true);
  });
});

describe('tradAgileLabel', () => {
  test.each([
    [0,   'Traditional'],
    [30,  'Traditional'],
    [31,  'Hybrid'],
    [70,  'Hybrid'],
    [71,  'Agile'],
    [100, 'Agile']
  ])('score %i → %s', (score, label) => {
    expect(tradAgileLabel(score)).toBe(label);
  });

  test('throws on non-numeric input', () => {
    expect(() => tradAgileLabel('high')).toThrow('finite number');
  });

  test('throws on NaN', () => {
    expect(() => tradAgileLabel(NaN)).toThrow('finite number');
  });
});
