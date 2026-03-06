import { topSignals, recommend, assess } from '../src/assess.js';
import { ARCHETYPES } from '../src/archetypes.js';

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

// Signals that maximise each archetype
const maxSignals = {
  HAUNTED_HOUSE: () => ({ ...baseSignals(), unspokenRisk: 5, statusHiding: 5 }),
  BOILING_FROG:  () => ({ ...baseSignals(), velocityDrift: 5, qualityDrift: 5 }),
  PAPER_TIGER:   () => ({ ...baseSignals(), metricsWithoutMeaning: 5, stakeholderPerformance: 5 }),
  CARGO_CULT:    () => ({ ...baseSignals(), processRigidity: 5, meetingTheater: 5 }),
  SLOW_BURN:     () => ({ ...baseSignals(), technicalDebt: 5 })
};

// ---------------------------------------------------------------------------
// topSignals
// ---------------------------------------------------------------------------

describe('topSignals', () => {
  test('returns top contributing signals for HAUNTED_HOUSE', () => {
    const s = { ...baseSignals(), unspokenRisk: 5, statusHiding: 3 };
    const result = topSignals(s, 'HAUNTED_HOUSE');
    expect(result).toContain('unspokenRisk');
    expect(result).toContain('statusHiding');
  });

  test('first entry is the highest contributor', () => {
    const s = { ...baseSignals(), unspokenRisk: 5, statusHiding: 3, meetingTheater: 1 };
    const result = topSignals(s, 'HAUNTED_HOUSE');
    expect(result[0]).toBe('unspokenRisk');
  });

  test('excludes signals with zero contribution', () => {
    const s = { ...baseSignals(), technicalDebt: 5 };
    const result = topSignals(s, 'SLOW_BURN');
    expect(result).toContain('technicalDebt');
    expect(result).not.toContain('unspokenRisk');
    expect(result).not.toContain('velocityDrift');
  });

  test('returns at most n entries', () => {
    const s = { ...baseSignals(), unspokenRisk: 5, statusHiding: 4, meetingTheater: 3 };
    const result = topSignals(s, 'HAUNTED_HOUSE', 3);
    expect(result.length).toBeLessThanOrEqual(3);
  });

  test('returns exactly 3 when 3 non-zero contributors exist', () => {
    const s = { ...baseSignals(), unspokenRisk: 5, statusHiding: 4, meetingTheater: 3 };
    const result = topSignals(s, 'HAUNTED_HOUSE');
    expect(result).toHaveLength(3);
  });

  test('returns fewer than n when fewer non-zero contributors exist', () => {
    const s = { ...baseSignals(), technicalDebt: 5 };
    const result = topSignals(s, 'SLOW_BURN');
    expect(result).toHaveLength(1);
    expect(result[0]).toBe('technicalDebt');
  });

  test('returns empty array when all signals are 0', () => {
    const result = topSignals(baseSignals(), 'HAUNTED_HOUSE');
    expect(result).toHaveLength(0);
  });

  test('n=1 returns single top signal', () => {
    const s = { ...baseSignals(), unspokenRisk: 5, statusHiding: 5 };
    const result = topSignals(s, 'HAUNTED_HOUSE', 1);
    expect(result).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// recommend
// ---------------------------------------------------------------------------

describe('recommend', () => {
  test.each(Object.keys(ARCHETYPES))('returns a non-empty string for %s', archetype => {
    const r = recommend(archetype);
    expect(typeof r).toBe('string');
    expect(r.length).toBeGreaterThan(0);
  });

  test('all five recommendations are distinct', () => {
    const recs = Object.keys(ARCHETYPES).map(a => recommend(a));
    expect(new Set(recs).size).toBe(5);
  });

  test('throws for unknown archetype', () => {
    expect(() => recommend('UNKNOWN')).toThrow('Unknown archetype');
  });

  test('HAUNTED_HOUSE recommendation addresses disclosure', () => {
    expect(recommend('HAUNTED_HOUSE').toLowerCase()).toMatch(/name|disclosure|say/);
  });

  test('BOILING_FROG recommendation addresses measurement or drift', () => {
    expect(recommend('BOILING_FROG').toLowerCase()).toMatch(/measure|drift|instrument/);
  });

  test('PAPER_TIGER recommendation addresses testing claims or metrics', () => {
    expect(recommend('PAPER_TIGER').toLowerCase()).toMatch(/metric|test|claim/);
  });

  test('CARGO_CULT recommendation addresses ceremony or ritual', () => {
    expect(recommend('CARGO_CULT').toLowerCase()).toMatch(/ceremony|ritual|why/);
  });

  test('SLOW_BURN recommendation addresses debt', () => {
    expect(recommend('SLOW_BURN').toLowerCase()).toMatch(/debt/);
  });
});

// ---------------------------------------------------------------------------
// assess — report shape
// ---------------------------------------------------------------------------

describe('assess — report shape', () => {
  test('returns an object with all required AssessmentReport fields', () => {
    const report = assess('Project Albatross', maxSignals.HAUNTED_HOUSE());
    expect(report).toHaveProperty('projectName');
    expect(report).toHaveProperty('archetype');
    expect(report).toHaveProperty('archetypeLabel');
    expect(report).toHaveProperty('archetypeDescription');
    expect(report).toHaveProperty('band');
    expect(report).toHaveProperty('topSignals');
    expect(report).toHaveProperty('recommendation');
    expect(report).toHaveProperty('rankedArchetypes');
  });

  test('projectName is returned trimmed', () => {
    const report = assess('  Project Albatross  ', maxSignals.HAUNTED_HOUSE());
    expect(report.projectName).toBe('Project Albatross');
  });

  test('rankedArchetypes has exactly 5 entries', () => {
    const report = assess('Test', maxSignals.HAUNTED_HOUSE());
    expect(report.rankedArchetypes).toHaveLength(5);
  });

  test('rankedArchetypes is sorted descending by score', () => {
    const report = assess('Test', maxSignals.HAUNTED_HOUSE());
    for (let i = 0; i < report.rankedArchetypes.length - 1; i++) {
      expect(report.rankedArchetypes[i].score).toBeGreaterThanOrEqual(report.rankedArchetypes[i + 1].score);
    }
  });

  test('archetypeLabel is a non-empty string', () => {
    const report = assess('Test', maxSignals.BOILING_FROG());
    expect(typeof report.archetypeLabel).toBe('string');
    expect(report.archetypeLabel.length).toBeGreaterThan(0);
  });

  test('archetypeDescription is a non-empty string', () => {
    const report = assess('Test', maxSignals.BOILING_FROG());
    expect(typeof report.archetypeDescription).toBe('string');
    expect(report.archetypeDescription.length).toBeGreaterThan(0);
  });

  test('band is one of LOW MEDIUM HIGH CRITICAL', () => {
    const report = assess('Test', maxSignals.HAUNTED_HOUSE());
    expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(report.band);
  });

  test('recommendation is a non-empty string', () => {
    const report = assess('Test', maxSignals.PAPER_TIGER());
    expect(typeof report.recommendation).toBe('string');
    expect(report.recommendation.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// assess — archetype classification
// ---------------------------------------------------------------------------

describe('assess — archetype classification', () => {
  test.each([
    ['HAUNTED_HOUSE', 'Haunted House'],
    ['BOILING_FROG',  'Boiling Frog'],
    ['PAPER_TIGER',   'Paper Tiger'],
    ['CARGO_CULT',    'Cargo Cult'],
    ['SLOW_BURN',     'Slow Burn']
  ])('classifies %s and sets correct label', (archetype, label) => {
    const report = assess('Test', maxSignals[archetype]());
    expect(report.archetype).toBe(archetype);
    expect(report.archetypeLabel).toBe(label);
  });

  test('rankedArchetypes[0] matches dominant archetype', () => {
    const report = assess('Test', maxSignals.HAUNTED_HOUSE());
    expect(report.rankedArchetypes[0].archetype).toBe('HAUNTED_HOUSE');
  });
});

// ---------------------------------------------------------------------------
// assess — top signals
// ---------------------------------------------------------------------------

describe('assess — top signals', () => {
  test('topSignals contains processRigidity and meetingTheater for CARGO_CULT', () => {
    const report = assess('Test', { ...baseSignals(), processRigidity: 5, meetingTheater: 5 });
    expect(report.archetype).toBe('CARGO_CULT');
    expect(report.topSignals).toContain('processRigidity');
    expect(report.topSignals).toContain('meetingTheater');
  });

  test('topSignals has at most 3 entries', () => {
    const report = assess('Test', maxSignals.HAUNTED_HOUSE());
    expect(report.topSignals.length).toBeLessThanOrEqual(3);
  });

  test('topSignals[0] is the highest contributor', () => {
    const s = { ...baseSignals(), unspokenRisk: 5, statusHiding: 3, meetingTheater: 1 };
    const report = assess('Test', s);
    expect(report.archetype).toBe('HAUNTED_HOUSE');
    expect(report.topSignals[0]).toBe('unspokenRisk');
  });

  test('topSignals does not contain zero-contribution signals', () => {
    const report = assess('Test', { ...baseSignals(), technicalDebt: 5 });
    expect(report.archetype).toBe('SLOW_BURN');
    expect(report.topSignals).toContain('technicalDebt');
    expect(report.topSignals).not.toContain('unspokenRisk');
  });
});

// ---------------------------------------------------------------------------
// assess — severity band
// ---------------------------------------------------------------------------

describe('assess — severity band', () => {
  // HAUNTED_HOUSE max = (3+3+2+1+1)*5 = 50
  // LOW: ratio < 0.25 → score < 12.5
  // MEDIUM: ratio < 0.50 → score 12.5–24.9
  // HIGH: ratio < 0.75 → score 25–37.4
  // CRITICAL: score >= 37.5

  test('LOW band: unspokenRisk=1 only → HAUNTED_HOUSE score=3', () => {
    const s = { ...baseSignals(), unspokenRisk: 1 };
    const report = assess('Test', s);
    expect(report.archetype).toBe('HAUNTED_HOUSE');
    expect(report.band).toBe('LOW');
  });

  test('MEDIUM band: unspokenRisk=3 statusHiding=2 → HAUNTED_HOUSE score=15', () => {
    const s = { ...baseSignals(), unspokenRisk: 3, statusHiding: 2 };
    const report = assess('Test', s);
    expect(report.archetype).toBe('HAUNTED_HOUSE');
    expect(report.band).toBe('MEDIUM');
  });

  test('HIGH band: unspokenRisk=5 statusHiding=4 → HAUNTED_HOUSE score=27', () => {
    const s = { ...baseSignals(), unspokenRisk: 5, statusHiding: 4 };
    const report = assess('Test', s);
    expect(report.archetype).toBe('HAUNTED_HOUSE');
    expect(report.band).toBe('HIGH');
  });

  test('CRITICAL band: all HAUNTED_HOUSE signals at 5 → score=50', () => {
    const s = { ...baseSignals(), unspokenRisk: 5, statusHiding: 5, meetingTheater: 5, scopeChurn: 5, processRigidity: 5 };
    const report = assess('Test', s);
    expect(report.archetype).toBe('HAUNTED_HOUSE');
    expect(report.band).toBe('CRITICAL');
  });
});

// ---------------------------------------------------------------------------
// assess — recommendations
// ---------------------------------------------------------------------------

describe('assess — recommendations', () => {
  test('all five archetype assessments produce distinct recommendations', () => {
    const recs = Object.keys(ARCHETYPES).map(a => assess('Test', maxSignals[a]()).recommendation);
    expect(new Set(recs).size).toBe(5);
  });

  test.each(Object.keys(ARCHETYPES))('recommendation for %s is non-empty', archetype => {
    const report = assess('Test', maxSignals[archetype]());
    expect(report.recommendation.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// assess — validation
// ---------------------------------------------------------------------------

describe('assess — validation', () => {
  test('throws on empty project name', () => {
    expect(() => assess('', baseSignals())).toThrow('projectName');
  });

  test('throws on whitespace-only project name', () => {
    expect(() => assess('   ', baseSignals())).toThrow('projectName');
  });

  test('throws on null project name', () => {
    expect(() => assess(null, baseSignals())).toThrow('projectName');
  });

  test('throws on missing signal field', () => {
    const s = baseSignals();
    delete s.technicalDebt;
    expect(() => assess('Test', s)).toThrow('technicalDebt');
  });

  test('throws when signal is above 5', () => {
    const s = { ...baseSignals(), unspokenRisk: 6 };
    expect(() => assess('Test', s)).toThrow('unspokenRisk');
  });

  test('throws when signal is below 0', () => {
    const s = { ...baseSignals(), velocityDrift: -1 };
    expect(() => assess('Test', s)).toThrow('velocityDrift');
  });

  test('throws when signal is non-numeric', () => {
    const s = { ...baseSignals(), statusHiding: 'high' };
    expect(() => assess('Test', s)).toThrow('statusHiding');
  });

  test('throws on null signals', () => {
    expect(() => assess('Test', null)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// assess — determinism
// ---------------------------------------------------------------------------

describe('assess — determinism', () => {
  test('identical inputs produce deeply equal reports', () => {
    const s = { ...baseSignals(), unspokenRisk: 3, statusHiding: 4 };
    const r1 = assess('Project Albatross', s);
    const r2 = assess('Project Albatross', s);
    expect(r1).toEqual(r2);
  });
});
