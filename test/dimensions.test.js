import { DIMENSIONS, SUB_CRITERIA, DIMENSION_LABELS, validateSubCriteria, scoreDimensions } from '../src/dimensions.js';

const base = () => ({
  requirementsClarity: 0, stakeholderAlignment: 0, changeFrequency: 0, acceptanceCriteria: 0,
  budgetCertainty: 0, contingencyAdequacy: 0, costTracking: 0, financialExposure: 0,
  scheduleDefinition: 0, milestoneConfidence: 0, deadlineFlexibility: 0, criticalPathVisibility: 0,
  qualityStandards: 0, testingCoverage: 0, technicalDebt: 0, nonFunctionalRequirements: 0,
  technicalComplexity: 0, organisationalComplexity: 0, integrationComplexity: 0, regulatoryComplexity: 0,
  requirementsUncertainty: 0, technicalUncertainty: 0, stakeholderUncertainty: 0, externalUncertainty: 0,
  riskVisibility: 0, issueResolution: 0, assumptionValidity: 0, dependencyConfidence: 0
});

describe('DIMENSIONS', () => {
  test('has seven keys', () => expect(Object.keys(DIMENSIONS)).toHaveLength(7));
  test.each(['SCOPE','COST','TIME','QUALITY','COMPLEXITY','UNCERTAINTY','RAID'])('contains %s', d => {
    expect(DIMENSIONS[d]).toBeDefined();
  });
  test('each dimension has exactly four sub-criteria', () => {
    for (const criteria of Object.values(DIMENSIONS)) {
      expect(criteria).toHaveLength(4);
    }
  });
});

describe('SUB_CRITERIA', () => {
  test('has 28 entries', () => expect(SUB_CRITERIA).toHaveLength(28));
  test.each([
    'requirementsClarity','stakeholderAlignment','changeFrequency','acceptanceCriteria',
    'budgetCertainty','contingencyAdequacy','costTracking','financialExposure',
    'scheduleDefinition','milestoneConfidence','deadlineFlexibility','criticalPathVisibility',
    'qualityStandards','testingCoverage','technicalDebt','nonFunctionalRequirements',
    'technicalComplexity','organisationalComplexity','integrationComplexity','regulatoryComplexity',
    'requirementsUncertainty','technicalUncertainty','stakeholderUncertainty','externalUncertainty',
    'riskVisibility','issueResolution','assumptionValidity','dependencyConfidence'
  ])('contains %s', key => expect(SUB_CRITERIA).toContain(key));
});

describe('DIMENSION_LABELS', () => {
  test.each(['SCOPE','COST','TIME','QUALITY','COMPLEXITY','UNCERTAINTY','RAID'])('has label for %s', d => {
    expect(typeof DIMENSION_LABELS[d]).toBe('string');
    expect(DIMENSION_LABELS[d].length).toBeGreaterThan(0);
  });
});

describe('validateSubCriteria', () => {
  test('passes with all zeros', () => expect(() => validateSubCriteria(base())).not.toThrow());
  test('passes with all fives', () => {
    const s = base(); for (const k of Object.keys(s)) s[k] = 5;
    expect(() => validateSubCriteria(s)).not.toThrow();
  });
  test('throws on null', () => expect(() => validateSubCriteria(null)).toThrow('non-null object'));
  test('throws on array', () => expect(() => validateSubCriteria([])).toThrow());
  test('throws on missing key', () => {
    const s = base(); delete s.technicalDebt;
    expect(() => validateSubCriteria(s)).toThrow('technicalDebt');
  });
  test('throws on non-number', () => {
    const s = base(); s.riskVisibility = 'high';
    expect(() => validateSubCriteria(s)).toThrow('riskVisibility');
  });
  test('throws on NaN', () => {
    const s = base(); s.changeFrequency = NaN;
    expect(() => validateSubCriteria(s)).toThrow('finite number');
  });
  test('throws above 5', () => {
    const s = base(); s.budgetCertainty = 6;
    expect(() => validateSubCriteria(s)).toThrow('budgetCertainty');
  });
  test('throws below 0', () => {
    const s = base(); s.changeFrequency = -1;
    expect(() => validateSubCriteria(s)).toThrow('changeFrequency');
  });
});

describe('scoreDimensions', () => {
  test('returns object with seven dimension keys', () => {
    const scores = scoreDimensions(base());
    expect(Object.keys(scores)).toHaveLength(7);
  });
  test('all zeros gives all-zero dimension scores', () => {
    const scores = scoreDimensions(base());
    for (const v of Object.values(scores)) expect(v).toBe(0);
  });
  test('all fives gives all-five dimension scores', () => {
    const s = base(); for (const k of Object.keys(s)) s[k] = 5;
    const scores = scoreDimensions(s);
    for (const v of Object.values(scores)) expect(v).toBe(5);
  });
  test('SCOPE score is average of its four sub-criteria', () => {
    const s = base();
    s.requirementsClarity = 4; s.stakeholderAlignment = 2;
    s.changeFrequency = 0; s.acceptanceCriteria = 2;
    expect(scoreDimensions(s).SCOPE).toBe(2.0);
  });
  test('each dimension score is numeric', () => {
    const scores = scoreDimensions(base());
    for (const v of Object.values(scores)) expect(typeof v).toBe('number');
  });
  test('throws with invalid inputs', () => {
    expect(() => scoreDimensions(null)).toThrow();
  });
});
