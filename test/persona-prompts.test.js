import {
  PERSONAS, PERSONA_LABELS, validateReport, validatePersona,
  buildPersonaPrompt, buildAllPersonaPrompts
} from '../src/persona-prompts.js';

const baseReport = () => ({
  projectName: 'Project Albatross',
  archetype: 'HAUNTED_HOUSE',
  archetypeLabel: 'Haunted House',
  archetypeDescription: 'Everyone knows something is wrong. Nobody will say it out loud.',
  band: 'HIGH',
  topSignals: ['riskVisibility', 'issueResolution'],
  recommendation: 'Name the elephant. Hold a structured risk disclosure session.',
  tradAgileLabel: 'Hybrid',
  tradAgileScore: 45,
  weightedFindings: [{ dimension: 'RAID', consensus: 'CRITICAL', flagCount: 3 }],
  contradictions: []
});

describe('PERSONAS', () => {
  test('has four keys', () => expect(Object.keys(PERSONAS)).toHaveLength(4));
  test.each(['WELLER','SKEPTIC','COACH','AUDITOR'])('contains %s', k => {
    expect(PERSONAS[k]).toBe(k);
  });
});

describe('PERSONA_LABELS', () => {
  test.each(Object.keys(PERSONAS))('has label for %s', k => {
    expect(typeof PERSONA_LABELS[k]).toBe('string');
    expect(PERSONA_LABELS[k].length).toBeGreaterThan(0);
  });
});

describe('validateReport', () => {
  test('passes with valid report', () => {
    expect(() => validateReport(baseReport())).not.toThrow();
  });
  test('throws on null', () => expect(() => validateReport(null)).toThrow('non-null object'));
  test('throws when projectName is empty', () => {
    const r = baseReport(); r.projectName = '';
    expect(() => validateReport(r)).toThrow('non-empty string');
  });
  test('throws when topSignals is empty', () => {
    const r = baseReport(); r.topSignals = [];
    expect(() => validateReport(r)).toThrow('non-empty array');
  });
  test.each(['projectName','archetype','archetypeLabel','archetypeDescription','band','topSignals','recommendation'])(
    'throws when %s missing', field => {
      const r = baseReport(); delete r[field];
      expect(() => validateReport(r)).toThrow(field);
    }
  );
});

describe('validatePersona', () => {
  test.each(['WELLER','SKEPTIC','COACH','AUDITOR'])('passes for %s', p => {
    expect(() => validatePersona(p)).not.toThrow();
  });
  test('throws for unknown', () => expect(() => validatePersona('GANDALF')).toThrow('Unknown persona'));
  test('error lists valid personas', () => {
    try { validatePersona('X'); } catch (e) { expect(e.message).toContain('WELLER'); }
  });
});

describe('buildPersonaPrompt', () => {
  test.each(['WELLER','SKEPTIC','COACH','AUDITOR'])('builds prompt for %s', p => {
    const prompt = buildPersonaPrompt(p, baseReport());
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(100);
  });
  test('includes project name', () => {
    expect(buildPersonaPrompt('WELLER', baseReport())).toContain('Project Albatross');
  });
  test('includes archetype label', () => {
    expect(buildPersonaPrompt('SKEPTIC', baseReport())).toContain('Haunted House');
  });
  test('includes band', () => {
    expect(buildPersonaPrompt('COACH', baseReport())).toContain('HIGH');
  });
  test('different personas produce different prompts', () => {
    const w = buildPersonaPrompt('WELLER', baseReport());
    const s = buildPersonaPrompt('SKEPTIC', baseReport());
    expect(w).not.toBe(s);
  });
  test('is deterministic', () => {
    const r = baseReport();
    expect(buildPersonaPrompt('COACH', r)).toBe(buildPersonaPrompt('COACH', r));
  });
  test('throws for invalid persona', () => {
    expect(() => buildPersonaPrompt('INVALID', baseReport())).toThrow();
  });
  test('throws for invalid report', () => {
    expect(() => buildPersonaPrompt('WELLER', null)).toThrow();
  });
});

describe('buildAllPersonaPrompts', () => {
  test('returns four prompts', () => {
    expect(Object.keys(buildAllPersonaPrompts(baseReport()))).toHaveLength(4);
  });
  test('all four are distinct', () => {
    const prompts = Object.values(buildAllPersonaPrompts(baseReport()));
    expect(new Set(prompts).size).toBe(4);
  });
  test('all include project name', () => {
    for (const p of Object.values(buildAllPersonaPrompts(baseReport()))) {
      expect(p).toContain('Project Albatross');
    }
  });
  test('throws on invalid report', () => {
    expect(() => buildAllPersonaPrompts({})).toThrow();
  });
});
