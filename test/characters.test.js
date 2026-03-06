import {
  getRoster,
  getCharacter,
  buildWellerCommentaryPrompt
} from '../src/characters.js';

const baseContext = () => ({
  projectName: 'Project Albatross',
  archetype: 'HAUNTED_HOUSE',
  archetypeLabel: 'Haunted House',
  archetypeDescription: 'Everyone knows something is wrong. Nobody will say it out loud.',
  band: 'HIGH',
  topSignals: ['unspokenRisk', 'statusHiding'],
  recommendation: 'Name the elephant.',
  rankedArchetypes: [
    { archetype: 'HAUNTED_HOUSE', score: 40 },
    { archetype: 'BOILING_FROG', score: 25 }
  ]
});

// --- getRoster ---
describe('getRoster', () => {
  test('returns an array', () => {
    expect(Array.isArray(getRoster())).toBe(true);
  });
  test('returns at least one character', () => {
    expect(getRoster().length).toBeGreaterThan(0);
  });
  test('each character has a name and key', () => {
    for (const c of getRoster()) {
      expect(typeof c.name).toBe('string');
      expect(typeof c.key).toBe('string');
    }
  });
  test('returns a copy — mutations do not affect roster', () => {
    const r1 = getRoster();
    r1[0].name = 'MUTATED';
    const r2 = getRoster();
    expect(r2[0].name).not.toBe('MUTATED');
  });
  test('includes WELLER', () => {
    const keys = getRoster().map(c => c.key);
    expect(keys).toContain('WELLER');
  });
});

// --- getCharacter ---
describe('getCharacter', () => {
  test('returns WELLER by key', () => {
    const c = getCharacter('WELLER');
    expect(c.key).toBe('WELLER');
    expect(c.name).toBe('Paul Weller');
  });
  test('is case-insensitive', () => {
    const c = getCharacter('weller');
    expect(c.key).toBe('WELLER');
  });
  test('handles whitespace', () => {
    const c = getCharacter('  WELLER  ');
    expect(c.key).toBe('WELLER');
  });
  test('returns a copy — mutations do not affect source', () => {
    const c = getCharacter('WELLER');
    c.name = 'MUTATED';
    const c2 = getCharacter('WELLER');
    expect(c2.name).toBe('Paul Weller');
  });
  test('throws for unknown character', () => {
    expect(() => getCharacter('BOWIE')).toThrow('Unknown character: BOWIE');
  });
  test('error message lists available characters', () => {
    try {
      getCharacter('NOBODY');
    } catch (e) {
      expect(e.message).toContain('WELLER');
    }
  });
  test('throws for empty string', () => {
    expect(() => getCharacter('')).toThrow('non-empty string');
  });
  test('throws for non-string', () => {
    expect(() => getCharacter(42)).toThrow('non-empty string');
  });
  test('throws for null', () => {
    expect(() => getCharacter(null)).toThrow();
  });
  test('WELLER has wound', () => {
    const c = getCharacter('WELLER');
    expect(typeof c.wound).toBe('string');
    expect(c.wound.length).toBeGreaterThan(0);
  });
  test('WELLER has blindSpot', () => {
    const c = getCharacter('WELLER');
    expect(typeof c.blindSpot).toBe('string');
  });
  test('WELLER has forbiddenBehaviours array', () => {
    const c = getCharacter('WELLER');
    expect(Array.isArray(c.forbiddenBehaviours)).toBe(true);
    expect(c.forbiddenBehaviours.length).toBeGreaterThan(0);
  });
});

// --- buildWellerCommentaryPrompt ---
describe('buildWellerCommentaryPrompt', () => {
  test('returns a non-empty string', () => {
    const p = buildWellerCommentaryPrompt(baseContext());
    expect(typeof p).toBe('string');
    expect(p.length).toBeGreaterThan(200);
  });
  test('includes project name', () => {
    const p = buildWellerCommentaryPrompt(baseContext());
    expect(p).toContain('Project Albatross');
  });
  test('includes archetype label', () => {
    const p = buildWellerCommentaryPrompt(baseContext());
    expect(p).toContain('Haunted House');
  });
  test('includes severity band', () => {
    const p = buildWellerCommentaryPrompt(baseContext());
    expect(p).toContain('HIGH');
  });
  test('includes top signals', () => {
    const p = buildWellerCommentaryPrompt(baseContext());
    expect(p).toContain('unspokenRisk');
    expect(p).toContain('statusHiding');
  });
  test('includes recommendation', () => {
    const p = buildWellerCommentaryPrompt(baseContext());
    expect(p).toContain('Name the elephant');
  });
  test('includes ranked archetypes', () => {
    const p = buildWellerCommentaryPrompt(baseContext());
    expect(p).toContain('HAUNTED_HOUSE');
  });
  test('mentions Weller character attributes', () => {
    const p = buildWellerCommentaryPrompt(baseContext());
    expect(p.toLowerCase()).toMatch(/weller|woking|wound/);
  });
  test('includes word count constraint', () => {
    const p = buildWellerCommentaryPrompt(baseContext());
    expect(p).toMatch(/150|300/);
  });
  test('includes song reference constraint', () => {
    const p = buildWellerCommentaryPrompt(baseContext());
    expect(p.toLowerCase()).toContain('song');
  });
  test('includes forbidden phrases list', () => {
    const p = buildWellerCommentaryPrompt(baseContext());
    expect(p.toLowerCase()).toContain('going forward');
  });
  test('is deterministic', () => {
    const p1 = buildWellerCommentaryPrompt(baseContext());
    const p2 = buildWellerCommentaryPrompt(baseContext());
    expect(p1).toBe(p2);
  });
  test('throws when projectName missing', () => {
    const ctx = baseContext();
    delete ctx.projectName;
    expect(() => buildWellerCommentaryPrompt(ctx)).toThrow('Missing context field: projectName');
  });
  test('throws when topSignals missing', () => {
    const ctx = baseContext();
    delete ctx.topSignals;
    expect(() => buildWellerCommentaryPrompt(ctx)).toThrow('Missing context field: topSignals');
  });
  test('throws when rankedArchetypes missing', () => {
    const ctx = baseContext();
    delete ctx.rankedArchetypes;
    expect(() => buildWellerCommentaryPrompt(ctx)).toThrow('Missing context field: rankedArchetypes');
  });
  test('throws when topSignals is empty', () => {
    const ctx = baseContext();
    ctx.topSignals = [];
    expect(() => buildWellerCommentaryPrompt(ctx)).toThrow('non-empty array');
  });
  test('throws when rankedArchetypes is empty', () => {
    const ctx = baseContext();
    ctx.rankedArchetypes = [];
    expect(() => buildWellerCommentaryPrompt(ctx)).toThrow('non-empty array');
  });
  test('includes archetype description', () => {
    const p = buildWellerCommentaryPrompt(baseContext());
    expect(p).toContain('Nobody will say it out loud');
  });
  test('ranked archetypes appear as formatted list', () => {
    const p = buildWellerCommentaryPrompt(baseContext());
    expect(p).toMatch(/score: \d+/);
  });
});
