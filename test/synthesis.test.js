import { detectContradictions, computeWeightedFindings, buildSynthesisPrompt } from '../src/synthesis.js';

// Helper: build a panel views object with explicit flagged status per dimension
function makeViews(flagMap) {
  // flagMap: { SUNI: ['TIME','QUALITY'], PETER: ['TIME'], DAVOS: ['QUALITY','COMPLEXITY'] }
  const dims = ['SCOPE','COST','TIME','QUALITY','COMPLEXITY','UNCERTAINTY','RAID'];
  const views = {};
  for (const [member, flagged] of Object.entries(flagMap)) {
    const weightedScores = {};
    for (const dim of dims) {
      weightedScores[dim] = { score: 0, weight: 1, weightedScore: 0, flagged: flagged.includes(dim) };
    }
    views[member] = { member, weightedScores, flaggedDimensions: flagged };
  }
  return views;
}

const baseReport = () => ({
  projectName: 'Project Albatross',
  archetypeLabel: 'Haunted House',
  archetypeDescription: 'Everyone knows something is wrong.',
  band: 'HIGH',
  tradAgileScore: 45,
  tradAgileLabel: 'Hybrid',
  weightedFindings: [],
  contradictions: []
});

describe('detectContradictions', () => {
  test('returns empty array when all members agree on nothing flagged', () => {
    const views = makeViews({ SUNI: [], PETER: [], DAVOS: [] });
    expect(detectContradictions(views)).toHaveLength(0);
  });

  test('returns empty array when all members flag the same dimensions', () => {
    const views = makeViews({ SUNI: ['TIME'], PETER: ['TIME'], DAVOS: ['TIME'] });
    expect(detectContradictions(views)).toHaveLength(0);
  });

  test('detects contradiction when one member flags and others do not', () => {
    const views = makeViews({ SUNI: [], PETER: [], DAVOS: ['COMPLEXITY'] });
    const result = detectContradictions(views);
    expect(result.some(c => c.dimension === 'COMPLEXITY')).toBe(true);
  });

  test('contradiction object has dimension, flaggedBy, notFlaggedBy', () => {
    const views = makeViews({ SUNI: [], PETER: [], DAVOS: ['COMPLEXITY'] });
    const c = detectContradictions(views).find(x => x.dimension === 'COMPLEXITY');
    expect(c).toHaveProperty('dimension');
    expect(c).toHaveProperty('flaggedBy');
    expect(c).toHaveProperty('notFlaggedBy');
  });

  test('DAVOS in flaggedBy when only DAVOS flags', () => {
    const views = makeViews({ SUNI: [], PETER: [], DAVOS: ['COMPLEXITY'] });
    const c = detectContradictions(views).find(x => x.dimension === 'COMPLEXITY');
    expect(c.flaggedBy).toContain('DAVOS');
    expect(c.notFlaggedBy).toContain('SUNI');
    expect(c.notFlaggedBy).toContain('PETER');
  });

  test('detects multiple contradictions', () => {
    const views = makeViews({ SUNI: ['COST'], PETER: [], DAVOS: ['COMPLEXITY'] });
    const result = detectContradictions(views);
    expect(result.length).toBeGreaterThanOrEqual(2);
  });

  test('throws on null', () => {
    expect(() => detectContradictions(null)).toThrow();
  });

  test('returns empty array for empty views object', () => {
    expect(detectContradictions({})).toHaveLength(0);
  });
});

describe('computeWeightedFindings', () => {
  test('all three flag TIME → CRITICAL consensus', () => {
    const views = makeViews({ SUNI: ['TIME'], PETER: ['TIME'], DAVOS: ['TIME'] });
    const f = computeWeightedFindings(views).find(x => x.dimension === 'TIME');
    expect(f.consensus).toBe('CRITICAL');
    expect(f.flagCount).toBe(3);
  });

  test('two members flag QUALITY → HIGH consensus', () => {
    const views = makeViews({ SUNI: [], PETER: ['QUALITY'], DAVOS: ['QUALITY'] });
    const f = computeWeightedFindings(views).find(x => x.dimension === 'QUALITY');
    expect(f.consensus).toBe('HIGH');
    expect(f.flagCount).toBe(2);
  });

  test('one member flags COMPLEXITY → MEDIUM consensus', () => {
    const views = makeViews({ SUNI: [], PETER: [], DAVOS: ['COMPLEXITY'] });
    const f = computeWeightedFindings(views).find(x => x.dimension === 'COMPLEXITY');
    expect(f.consensus).toBe('MEDIUM');
    expect(f.flagCount).toBe(1);
  });

  test('unflagged dimension does not appear in findings', () => {
    const views = makeViews({ SUNI: [], PETER: [], DAVOS: ['COMPLEXITY'] });
    const findings = computeWeightedFindings(views);
    expect(findings.some(f => f.dimension === 'COST')).toBe(false);
  });

  test('sorted CRITICAL first, MEDIUM last', () => {
    const views = makeViews({ SUNI: ['TIME','RAID'], PETER: ['TIME','COMPLEXITY'], DAVOS: ['TIME','COMPLEXITY','RAID'] });
    const findings = computeWeightedFindings(views);
    const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 };
    for (let i = 0; i < findings.length - 1; i++) {
      expect(order[findings[i].consensus]).toBeLessThanOrEqual(order[findings[i+1].consensus]);
    }
  });

  test('returns empty array when nothing flagged', () => {
    const views = makeViews({ SUNI: [], PETER: [], DAVOS: [] });
    expect(computeWeightedFindings(views)).toHaveLength(0);
  });

  test('throws on null', () => {
    expect(() => computeWeightedFindings(null)).toThrow();
  });
});

describe('buildSynthesisPrompt', () => {
  test('returns non-empty string of at least 300 chars', () => {
    const prompt = buildSynthesisPrompt(baseReport());
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(300);
  });

  test('prompt references all three panel members', () => {
    const prompt = buildSynthesisPrompt(baseReport());
    expect(prompt).toContain('Suni');
    expect(prompt).toContain('Peter');
    expect(prompt).toContain('Davos');
  });

  test('prompt instructs surfacing contradictions when they exist', () => {
    const r = { ...baseReport(), contradictions: [{ dimension: 'COMPLEXITY', flaggedBy: ['DAVOS'], notFlaggedBy: ['SUNI','PETER'] }] };
    expect(buildSynthesisPrompt(r).toLowerCase()).toMatch(/contradict/);
  });

  test('prompt includes archetype label', () => {
    expect(buildSynthesisPrompt(baseReport())).toContain('Haunted House');
  });

  test('prompt includes trad/agile label', () => {
    expect(buildSynthesisPrompt(baseReport())).toContain('Hybrid');
  });

  test('is deterministic', () => {
    const r = baseReport();
    expect(buildSynthesisPrompt(r)).toBe(buildSynthesisPrompt(r));
  });

  test('throws on null', () => {
    expect(() => buildSynthesisPrompt(null)).toThrow();
  });

  test('throws when projectName is empty', () => {
    const r = baseReport(); r.projectName = '';
    expect(() => buildSynthesisPrompt(r)).toThrow('projectName');
  });

  test('throws when weightedFindings missing', () => {
    const r = baseReport(); delete r.weightedFindings;
    expect(() => buildSynthesisPrompt(r)).toThrow('weightedFindings');
  });
});
