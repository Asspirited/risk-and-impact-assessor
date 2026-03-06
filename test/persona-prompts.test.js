import {
  PERSONAS,
  PERSONA_LABELS,
  REQUIRED_REPORT_FIELDS,
  validateReport,
  validatePersona,
  buildPersonaPrompt,
  buildAllPersonaPrompts
} from '../src/persona-prompts.js';

const baseReport = () => ({
  projectName: 'Project Albatross',
  archetype: 'HAUNTED_HOUSE',
  archetypeLabel: 'Haunted House',
  archetypeDescription: 'Everyone knows something is wrong. Nobody will say it out loud.',
  band: 'HIGH',
  topSignals: ['unspokenRisk', 'statusHiding'],
  recommendation: 'Name the elephant. Hold a structured risk disclosure session.'
});

// --- PERSONAS ---
describe('PERSONAS', () => {
  test('has four keys', () => {
    expect(Object.keys(PERSONAS)).toHaveLength(4);
  });
  test.each(['WELLER', 'SKEPTIC', 'COACH', 'AUDITOR'])('contains %s', key => {
    expect(PERSONAS[key]).toBe(key);
  });
});

// --- PERSONA_LABELS ---
describe('PERSONA_LABELS', () => {
  test.each(Object.keys(PERSONAS))('has label for %s', key => {
    expect(typeof PERSONA_LABELS[key]).toBe('string');
    expect(PERSONA_LABELS[key].length).toBeGreaterThan(0);
  });
});

// --- REQUIRED_REPORT_FIELDS ---
describe('REQUIRED_REPORT_FIELDS', () => {
  test('is a non-empty array', () => {
    expect(Array.isArray(REQUIRED_REPORT_FIELDS)).toBe(true);
    expect(REQUIRED_REPORT_FIELDS.length).toBeGreaterThan(0);
  });
  test.each([
    'projectName', 'archetype', 'archetypeLabel', 'archetypeDescription',
    'band', 'topSignals', 'recommendation'
  ])('includes %s', field => {
    expect(REQUIRED_REPORT_FIELDS).toContain(field);
  });
});

// --- validateReport ---
describe('validateReport', () => {
  test('passes with valid report', () => {
    expect(() => validateReport(baseReport())).not.toThrow();
  });
  test('throws on null', () => {
    expect(() => validateReport(null)).toThrow('non-null object');
  });
  test('throws on undefined', () => {
    expect(() => validateReport(undefined)).toThrow();
  });
  test.each([
    'projectName', 'archetype', 'archetypeLabel', 'archetypeDescription',
    'band', 'topSignals', 'recommendation'
  ])('throws when %s is missing', field => {
    const r = baseReport();
    delete r[field];
    expect(() => validateReport(r)).toThrow(`Missing report field: ${field}`);
  });
  test('throws when topSignals is empty array', () => {
    const r = baseReport();
    r.topSignals = [];
    expect(() => validateReport(r)).toThrow('non-empty array');
  });
  test('throws when topSignals is not array', () => {
    const r = baseReport();
    r.topSignals = 'high';
    expect(() => validateReport(r)).toThrow('non-empty array');
  });
  test('throws when projectName is empty string', () => {
    const r = baseReport();
    r.projectName = '';
    expect(() => validateReport(r)).toThrow('non-empty string');
  });
  test('throws when projectName is whitespace only', () => {
    const r = baseReport();
    r.projectName = '   ';
    expect(() => validateReport(r)).toThrow('non-empty string');
  });
  test('throws when projectName is not a string', () => {
    const r = baseReport();
    r.projectName = 42;
    expect(() => validateReport(r)).toThrow('non-empty string');
  });
});

// --- validatePersona ---
describe('validatePersona', () => {
  test.each(['WELLER', 'SKEPTIC', 'COACH', 'AUDITOR'])('passes for %s', persona => {
    expect(() => validatePersona(persona)).not.toThrow();
  });
  test('throws for unknown persona', () => {
    expect(() => validatePersona('GANDALF')).toThrow('Unknown persona: GANDALF');
  });
  test('throws for lowercase valid key', () => {
    expect(() => validatePersona('weller')).toThrow('Unknown persona');
  });
  test('throws for empty string', () => {
    expect(() => validatePersona('')).toThrow();
  });
  test('throws for undefined', () => {
    expect(() => validatePersona(undefined)).toThrow();
  });
  test('error message lists valid personas', () => {
    try {
      validatePersona('INVALID');
    } catch (e) {
      expect(e.message).toContain('WELLER');
    }
  });
});

// --- buildPersonaPrompt ---
describe('buildPersonaPrompt', () => {
  test.each(['WELLER', 'SKEPTIC', 'COACH', 'AUDITOR'])('builds prompt for %s', persona => {
    const prompt = buildPersonaPrompt(persona, baseReport());
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(100);
  });
  test('prompt includes project name', () => {
    const prompt = buildPersonaPrompt('WELLER', baseReport());
    expect(prompt).toContain('Project Albatross');
  });
  test('prompt includes archetype label', () => {
    const prompt = buildPersonaPrompt('SKEPTIC', baseReport());
    expect(prompt).toContain('Haunted House');
  });
  test('prompt includes band', () => {
    const prompt = buildPersonaPrompt('COACH', baseReport());
    expect(prompt).toContain('HIGH');
  });
  test('prompt includes top signals', () => {
    const prompt = buildPersonaPrompt('AUDITOR', baseReport());
    expect(prompt).toContain('unspokenRisk');
  });
  test('prompt includes recommendation', () => {
    const prompt = buildPersonaPrompt('WELLER', baseReport());
    expect(prompt).toContain('Name the elephant');
  });
  test('WELLER prompt mentions Woking or post-punk', () => {
    const prompt = buildPersonaPrompt('WELLER', baseReport());
    expect(prompt.toLowerCase()).toMatch(/woking|post-punk|modfather/);
  });
  test('AUDITOR prompt mentions numbered paragraphs', () => {
    const prompt = buildPersonaPrompt('AUDITOR', baseReport());
    expect(prompt.toLowerCase()).toContain('numbered');
  });
  test('throws for invalid persona', () => {
    expect(() => buildPersonaPrompt('INVALID', baseReport())).toThrow();
  });
  test('throws for invalid report', () => {
    expect(() => buildPersonaPrompt('WELLER', null)).toThrow();
  });
  test('WELLER prompt forbids management language', () => {
    const prompt = buildPersonaPrompt('WELLER', baseReport());
    expect(prompt.toLowerCase()).toMatch(/management language|going forward|leverage/);
  });
  test('COACH prompt addresses the team directly', () => {
    const prompt = buildPersonaPrompt('COACH', baseReport());
    expect(prompt.toLowerCase()).toMatch(/team|coach/);
  });
  test('SKEPTIC prompt references structural forces or failed programmes', () => {
    const prompt = buildPersonaPrompt('SKEPTIC', baseReport());
    expect(prompt.toLowerCase()).toMatch(/structural|transform|scepti|cynical/);
  });
  test('different personas produce different prompts', () => {
    const w = buildPersonaPrompt('WELLER', baseReport());
    const s = buildPersonaPrompt('SKEPTIC', baseReport());
    expect(w).not.toBe(s);
  });
  test('same persona same report produces same prompt (deterministic)', () => {
    const p1 = buildPersonaPrompt('COACH', baseReport());
    const p2 = buildPersonaPrompt('COACH', baseReport());
    expect(p1).toBe(p2);
  });
});

// --- buildAllPersonaPrompts ---
describe('buildAllPersonaPrompts', () => {
  test('returns object with four persona keys', () => {
    const result = buildAllPersonaPrompts(baseReport());
    expect(Object.keys(result)).toHaveLength(4);
  });
  test.each(['WELLER', 'SKEPTIC', 'COACH', 'AUDITOR'])('includes prompt for %s', persona => {
    const result = buildAllPersonaPrompts(baseReport());
    expect(result).toHaveProperty(persona);
    expect(typeof result[persona]).toBe('string');
    expect(result[persona].length).toBeGreaterThan(0);
  });
  test('all prompts include project name', () => {
    const result = buildAllPersonaPrompts(baseReport());
    for (const prompt of Object.values(result)) {
      expect(prompt).toContain('Project Albatross');
    }
  });
  test('throws on invalid report', () => {
    expect(() => buildAllPersonaPrompts({})).toThrow();
  });
  test('all four prompts are distinct', () => {
    const result = buildAllPersonaPrompts(baseReport());
    const prompts = Object.values(result);
    const unique = new Set(prompts);
    expect(unique.size).toBe(4);
  });
});
