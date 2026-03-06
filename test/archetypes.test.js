import {
  ARCHETYPES,
  ARCHETYPE_LABELS,
  ARCHETYPE_DESCRIPTIONS,
  SIGNALS,
  validateSignals,
  scoreArchetypes,
  classifyArchetype,
  rankArchetypes,
  scoreToBand
} from '../src/archetypes.js';

const baseSignals = () => ({
  unspokenRisk: 0,
  statusHiding: 0,
  meetingTheater: 0,
  scopeChurn: 0,
  processRigidity: 0,
  velocityDrift: 0,
  qualityDrift: 0,
  teamAttrition: 0,
  metricsWithoutMeaning: 0,
  stakeholderPerformance: 0,
  technicalDebt: 0
});

// --- ARCHETYPES constant ---
describe('ARCHETYPES', () => {
  test('has five keys', () => {
    expect(Object.keys(ARCHETYPES)).toHaveLength(5);
  });
  test.each([
    'HAUNTED_HOUSE', 'BOILING_FROG', 'PAPER_TIGER', 'CARGO_CULT', 'SLOW_BURN'
  ])('contains %s', key => {
    expect(ARCHETYPES[key]).toBe(key);
  });
});

// --- ARCHETYPE_LABELS ---
describe('ARCHETYPE_LABELS', () => {
  test.each(Object.keys(ARCHETYPES))('has label for %s', key => {
    expect(ARCHETYPE_LABELS[key]).toBeTruthy();
    expect(typeof ARCHETYPE_LABELS[key]).toBe('string');
  });
});

// --- ARCHETYPE_DESCRIPTIONS ---
describe('ARCHETYPE_DESCRIPTIONS', () => {
  test.each(Object.keys(ARCHETYPES))('has description for %s', key => {
    expect(ARCHETYPE_DESCRIPTIONS[key]).toBeTruthy();
    expect(typeof ARCHETYPE_DESCRIPTIONS[key]).toBe('string');
  });
});

// --- SIGNALS ---
describe('SIGNALS', () => {
  test('is an array of 11 items', () => {
    expect(Array.isArray(SIGNALS)).toBe(true);
    expect(SIGNALS).toHaveLength(11);
  });
  test.each([
    'unspokenRisk', 'statusHiding', 'meetingTheater', 'scopeChurn',
    'processRigidity', 'velocityDrift', 'qualityDrift', 'teamAttrition',
    'metricsWithoutMeaning', 'stakeholderPerformance', 'technicalDebt'
  ])('contains %s', signal => {
    expect(SIGNALS).toContain(signal);
  });
});

// --- validateSignals ---
describe('validateSignals', () => {
  test('passes with all signals at 0', () => {
    expect(() => validateSignals(baseSignals())).not.toThrow();
  });
  test('passes with all signals at 5', () => {
    const s = baseSignals();
    for (const k of Object.keys(s)) s[k] = 5;
    expect(() => validateSignals(s)).not.toThrow();
  });
  test('passes with mixed valid values', () => {
    const s = baseSignals();
    s.unspokenRisk = 3;
    s.velocityDrift = 2;
    expect(() => validateSignals(s)).not.toThrow();
  });
  test('throws on null', () => {
    expect(() => validateSignals(null)).toThrow('signals must be a non-null object');
  });
  test('throws on undefined', () => {
    expect(() => validateSignals(undefined)).toThrow();
  });
  test('throws on non-object', () => {
    expect(() => validateSignals('hello')).toThrow();
  });
  test('throws on missing signal', () => {
    const s = baseSignals();
    delete s.technicalDebt;
    expect(() => validateSignals(s)).toThrow('Missing signal: technicalDebt');
  });
  test('throws on non-number signal', () => {
    const s = baseSignals();
    s.unspokenRisk = 'high';
    expect(() => validateSignals(s)).toThrow('Signal unspokenRisk must be a finite number');
  });
  test('throws on NaN signal', () => {
    const s = baseSignals();
    s.unspokenRisk = NaN;
    expect(() => validateSignals(s)).toThrow('finite number');
  });
  test('throws on Infinity signal', () => {
    const s = baseSignals();
    s.unspokenRisk = Infinity;
    expect(() => validateSignals(s)).toThrow('finite number');
  });
  test('throws on signal below 0', () => {
    const s = baseSignals();
    s.unspokenRisk = -1;
    expect(() => validateSignals(s)).toThrow('must be 0–5');
  });
  test('throws on signal above 5', () => {
    const s = baseSignals();
    s.statusHiding = 6;
    expect(() => validateSignals(s)).toThrow('must be 0–5');
  });
  test('accepts boundary value 0', () => {
    const s = baseSignals();
    s.scopeChurn = 0;
    expect(() => validateSignals(s)).not.toThrow();
  });
  test('accepts boundary value 5', () => {
    const s = baseSignals();
    s.scopeChurn = 5;
    expect(() => validateSignals(s)).not.toThrow();
  });
  test('throws on array input', () => {
    expect(() => validateSignals([])).toThrow();
  });
});

// --- scoreArchetypes ---
describe('scoreArchetypes', () => {
  test('returns object with five archetype keys', () => {
    const scores = scoreArchetypes(baseSignals());
    expect(Object.keys(scores)).toHaveLength(5);
    for (const key of Object.keys(ARCHETYPES)) {
      expect(scores).toHaveProperty(key);
    }
  });
  test('all scores are 0 when all signals are 0', () => {
    const scores = scoreArchetypes(baseSignals());
    for (const v of Object.values(scores)) {
      expect(v).toBe(0);
    }
  });
  test('unspokenRisk=5 boosts HAUNTED_HOUSE', () => {
    const s = baseSignals();
    s.unspokenRisk = 5;
    const scores = scoreArchetypes(s);
    expect(scores.HAUNTED_HOUSE).toBeGreaterThan(0);
  });
  test('processRigidity=5 boosts CARGO_CULT', () => {
    const s = baseSignals();
    s.processRigidity = 5;
    const scores = scoreArchetypes(s);
    expect(scores.CARGO_CULT).toBeGreaterThan(scores.HAUNTED_HOUSE);
  });
  test('technicalDebt=5 boosts SLOW_BURN', () => {
    const s = baseSignals();
    s.technicalDebt = 5;
    const scores = scoreArchetypes(s);
    expect(scores.SLOW_BURN).toBeGreaterThan(0);
  });
  test('all scores are numeric', () => {
    const s = baseSignals();
    s.unspokenRisk = 3;
    const scores = scoreArchetypes(s);
    for (const v of Object.values(scores)) {
      expect(typeof v).toBe('number');
    }
  });
  test('throws with invalid signals', () => {
    expect(() => scoreArchetypes(null)).toThrow();
  });
});

// --- classifyArchetype ---
describe('classifyArchetype', () => {
  test('returns a valid archetype key', () => {
    const result = classifyArchetype(baseSignals());
    expect(Object.keys(ARCHETYPES)).toContain(result);
  });
  test('classifies HAUNTED_HOUSE when unspokenRisk and statusHiding dominate', () => {
    const s = baseSignals();
    s.unspokenRisk = 5;
    s.statusHiding = 5;
    expect(classifyArchetype(s)).toBe('HAUNTED_HOUSE');
  });
  test('classifies BOILING_FROG when velocityDrift and qualityDrift dominate', () => {
    const s = baseSignals();
    s.velocityDrift = 5;
    s.qualityDrift = 5;
    expect(classifyArchetype(s)).toBe('BOILING_FROG');
  });
  test('classifies PAPER_TIGER when metricsWithoutMeaning and stakeholderPerformance dominate', () => {
    const s = baseSignals();
    s.metricsWithoutMeaning = 5;
    s.stakeholderPerformance = 5;
    expect(classifyArchetype(s)).toBe('PAPER_TIGER');
  });
  test('classifies CARGO_CULT when processRigidity and meetingTheater dominate', () => {
    const s = baseSignals();
    s.processRigidity = 5;
    s.meetingTheater = 5;
    expect(classifyArchetype(s)).toBe('CARGO_CULT');
  });
  test('classifies SLOW_BURN when technicalDebt dominates', () => {
    const s = baseSignals();
    s.technicalDebt = 5;
    expect(classifyArchetype(s)).toBe('SLOW_BURN');
  });
  test('throws with invalid signals', () => {
    expect(() => classifyArchetype({})).toThrow();
  });
  test('is deterministic on same input', () => {
    const s = baseSignals();
    s.unspokenRisk = 3;
    s.statusHiding = 3;
    expect(classifyArchetype(s)).toBe(classifyArchetype(s));
  });
});

// --- rankArchetypes ---
describe('rankArchetypes', () => {
  test('returns array of length n', () => {
    const result = rankArchetypes(baseSignals(), 3);
    expect(result).toHaveLength(3);
  });
  test('default n is 3', () => {
    const result = rankArchetypes(baseSignals());
    expect(result).toHaveLength(3);
  });
  test('returns n=1 correctly', () => {
    const result = rankArchetypes(baseSignals(), 1);
    expect(result).toHaveLength(1);
  });
  test('returns n=5 (all archetypes)', () => {
    const result = rankArchetypes(baseSignals(), 5);
    expect(result).toHaveLength(5);
  });
  test('each item has archetype and score', () => {
    const result = rankArchetypes(baseSignals(), 3);
    for (const item of result) {
      expect(item).toHaveProperty('archetype');
      expect(item).toHaveProperty('score');
    }
  });
  test('is sorted descending by score', () => {
    const s = baseSignals();
    s.unspokenRisk = 5;
    s.statusHiding = 5;
    const result = rankArchetypes(s, 5);
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].score).toBeGreaterThanOrEqual(result[i + 1].score);
    }
  });
  test('top archetype matches classifyArchetype', () => {
    const s = baseSignals();
    s.processRigidity = 5;
    s.meetingTheater = 5;
    const ranked = rankArchetypes(s, 1);
    expect(ranked[0].archetype).toBe(classifyArchetype(s));
  });
  test('throws if n is 0', () => {
    expect(() => rankArchetypes(baseSignals(), 0)).toThrow('positive integer');
  });
  test('throws if n is negative', () => {
    expect(() => rankArchetypes(baseSignals(), -1)).toThrow('positive integer');
  });
  test('throws if n is not integer', () => {
    expect(() => rankArchetypes(baseSignals(), 1.5)).toThrow('positive integer');
  });
  test('throws if n is string', () => {
    expect(() => rankArchetypes(baseSignals(), 'three')).toThrow('positive integer');
  });
  test('throws with invalid signals', () => {
    expect(() => rankArchetypes(null, 3)).toThrow();
  });
});

// --- scoreToBand ---
describe('scoreToBand', () => {
  test('returns LOW for score 0', () => {
    expect(scoreToBand('HAUNTED_HOUSE', 0)).toBe('LOW');
  });
  test('returns CRITICAL for max score', () => {
    // Max for HAUNTED_HOUSE: (3+3+2+1+1)*5 = 50
    expect(scoreToBand('HAUNTED_HOUSE', 50)).toBe('CRITICAL');
  });
  test('returns MEDIUM for mid-low score', () => {
    expect(scoreToBand('HAUNTED_HOUSE', 15)).toBe('MEDIUM');
  });
  test('returns HIGH for mid-high score', () => {
    expect(scoreToBand('HAUNTED_HOUSE', 30)).toBe('HIGH');
  });
  test('throws for unknown archetype', () => {
    expect(() => scoreToBand('UNKNOWN', 10)).toThrow('Unknown archetype');
  });
  test.each(['HAUNTED_HOUSE', 'BOILING_FROG', 'PAPER_TIGER', 'CARGO_CULT', 'SLOW_BURN'])(
    'returns a valid band for %s at score 0', archetype => {
      const band = scoreToBand(archetype, 0);
      expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(band);
    }
  );
  test.each(['HAUNTED_HOUSE', 'BOILING_FROG', 'PAPER_TIGER', 'CARGO_CULT', 'SLOW_BURN'])(
    'returns CRITICAL for %s at score 100 (above any max)', archetype => {
      const band = scoreToBand(archetype, 100);
      expect(band).toBe('CRITICAL');
    }
  );
});
