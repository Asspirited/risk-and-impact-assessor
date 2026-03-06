import { getRoster, getCharacter, buildWellerCommentaryPrompt } from '../src/characters.js';

const baseContext = () => ({
  projectName: 'Project Albatross',
  archetype: 'HAUNTED_HOUSE',
  archetypeLabel: 'Haunted House',
  archetypeDescription: 'Everyone knows something is wrong. Nobody will say it out loud.',
  band: 'HIGH',
  topSignals: ['riskVisibility', 'issueResolution'],
  recommendation: 'Name the elephant.',
  rankedArchetypes: [
    { archetype: 'HAUNTED_HOUSE', score: 40 },
    { archetype: 'BOILING_FROG', score: 25 }
  ]
});

describe('getRoster', () => {
  test('returns an array', () => expect(Array.isArray(getRoster())).toBe(true));
  test('returns at least one character', () => expect(getRoster().length).toBeGreaterThan(0));
  test('includes WELLER', () => expect(getRoster().map(c => c.key)).toContain('WELLER'));
  test('returns a copy — mutations do not affect roster', () => {
    const r1 = getRoster(); r1[0].name = 'MUTATED';
    expect(getRoster()[0].name).not.toBe('MUTATED');
  });
});

describe('getCharacter', () => {
  test('returns WELLER by key', () => {
    const c = getCharacter('WELLER');
    expect(c.key).toBe('WELLER');
    expect(c.name).toBe('Paul Weller');
  });
  test('is case-insensitive', () => expect(getCharacter('weller').key).toBe('WELLER'));
  test('handles whitespace', () => expect(getCharacter('  WELLER  ').key).toBe('WELLER'));
  test('returns a copy', () => {
    const c = getCharacter('WELLER'); c.name = 'MUTATED';
    expect(getCharacter('WELLER').name).toBe('Paul Weller');
  });
  test('throws for unknown character', () => {
    expect(() => getCharacter('BOWIE')).toThrow('Unknown character');
  });
  test('throws for empty string', () => {
    expect(() => getCharacter('')).toThrow('non-empty string');
  });
  test('throws for non-string', () => {
    expect(() => getCharacter(42)).toThrow('non-empty string');
  });
  test('WELLER has wound', () => {
    const c = getCharacter('WELLER');
    expect(typeof c.wound).toBe('string');
    expect(c.wound.length).toBeGreaterThan(0);
  });
  test('WELLER has blindSpot', () => expect(typeof getCharacter('WELLER').blindSpot).toBe('string'));
  test('WELLER has forbiddenBehaviours', () => {
    expect(Array.isArray(getCharacter('WELLER').forbiddenBehaviours)).toBe(true);
  });
});

describe('buildWellerCommentaryPrompt', () => {
  test('returns non-empty string', () => {
    expect(buildWellerCommentaryPrompt(baseContext()).length).toBeGreaterThan(200);
  });
  test('includes project name', () => {
    expect(buildWellerCommentaryPrompt(baseContext())).toContain('Project Albatross');
  });
  test('includes archetype label', () => {
    expect(buildWellerCommentaryPrompt(baseContext())).toContain('Haunted House');
  });
  test('includes band', () => {
    expect(buildWellerCommentaryPrompt(baseContext())).toContain('HIGH');
  });
  test('is deterministic', () => {
    const ctx = baseContext();
    expect(buildWellerCommentaryPrompt(ctx)).toBe(buildWellerCommentaryPrompt(ctx));
  });
  test('throws when projectName missing', () => {
    const ctx = baseContext(); delete ctx.projectName;
    expect(() => buildWellerCommentaryPrompt(ctx)).toThrow('projectName');
  });
  test('throws when rankedArchetypes empty', () => {
    const ctx = baseContext(); ctx.rankedArchetypes = [];
    expect(() => buildWellerCommentaryPrompt(ctx)).toThrow('non-empty array');
  });
});
