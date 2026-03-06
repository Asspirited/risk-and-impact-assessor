import {
  RAID_ITEM_TYPES, validateRaidItem, buildRaidItemPrompt
} from '../src/raid-item.js';

const baseReport = () => ({
  projectName:          'Project Albatross',
  archetype:            'HAUNTED_HOUSE',
  archetypeLabel:       'Haunted House',
  archetypeDescription: 'Everyone knows something is wrong. Nobody will say it out loud.',
  band:                 'HIGH',
  tradAgileLabel:       'Hybrid',
  tradAgileScore:       45,
  topSignals:           ['riskVisibility', 'issueResolution'],
  recommendation:       'Name the elephant.',
  dimensionScores:      { SCOPE: 1.5, COST: 0.5, TIME: 2.0, QUALITY: 1.0, COMPLEXITY: 1.5, UNCERTAINTY: 1.5, RAID: 3.5 },
  weightedFindings:     [{ dimension: 'RAID', consensus: 'CRITICAL', flagCount: 3 }],
  contradictions:       [{ dimension: 'COMPLEXITY', flaggedBy: ['DAVOS'], notFlaggedBy: ['SUNI', 'PETER'] }]
});

describe('RAID_ITEM_TYPES', () => {
  test('has five types', () => expect(Object.keys(RAID_ITEM_TYPES)).toHaveLength(5));
  test.each(['RISK','ISSUE','ASSUMPTION','DEPENDENCY','CHANGE'])('contains %s', type => {
    expect(RAID_ITEM_TYPES[type]).toBeDefined();
    expect(RAID_ITEM_TYPES[type].key).toBe(type);
    expect(typeof RAID_ITEM_TYPES[type].label).toBe('string');
    expect(typeof RAID_ITEM_TYPES[type].description).toBe('string');
  });
});

describe('validateRaidItem', () => {
  test.each(['RISK','ISSUE','ASSUMPTION','DEPENDENCY','CHANGE'])('passes for %s with description', type => {
    expect(() => validateRaidItem(type, 'Some description')).not.toThrow();
  });

  test('throws for unknown type', () => {
    expect(() => validateRaidItem('UNKNOWN', 'desc')).toThrow('Unknown RAID item type');
  });

  test('error message includes the invalid type', () => {
    expect(() => validateRaidItem('WIZARD', 'desc')).toThrow('WIZARD');
  });

  test('throws for empty description', () => {
    expect(() => validateRaidItem('RISK', '')).toThrow('description');
  });

  test('throws for whitespace-only description', () => {
    expect(() => validateRaidItem('RISK', '   ')).toThrow('description');
  });

  test('throws for non-string description', () => {
    expect(() => validateRaidItem('RISK', null)).toThrow('description');
  });
});

describe('buildRaidItemPrompt', () => {
  test('returns a non-empty string', () => {
    const p = buildRaidItemPrompt('RISK', 'The vendor API may not be available.', baseReport());
    expect(typeof p).toBe('string');
    expect(p.length).toBeGreaterThan(200);
  });

  test('includes project name', () => {
    expect(buildRaidItemPrompt('RISK', 'Some risk.', baseReport())).toContain('Project Albatross');
  });

  test('includes archetype label', () => {
    expect(buildRaidItemPrompt('ISSUE', 'An issue.', baseReport())).toContain('Haunted House');
  });

  test('includes band', () => {
    expect(buildRaidItemPrompt('ASSUMPTION', 'An assumption.', baseReport())).toContain('HIGH');
  });

  test('includes the item description', () => {
    const desc = 'The main integration API is undocumented.';
    expect(buildRaidItemPrompt('DEPENDENCY', desc, baseReport())).toContain(desc);
  });

  test('includes the item type in the prompt', () => {
    expect(buildRaidItemPrompt('CHANGE', 'Scope is expanding.', baseReport())).toContain('change');
  });

  test.each(['RISK','ISSUE','ASSUMPTION','DEPENDENCY','CHANGE'])('builds prompt for %s', type => {
    const p = buildRaidItemPrompt(type, 'A description.', baseReport());
    expect(typeof p).toBe('string');
    expect(p.length).toBeGreaterThan(100);
  });

  test('different types produce different prompts', () => {
    const r = baseReport();
    const p1 = buildRaidItemPrompt('RISK',   'Same description.', r);
    const p2 = buildRaidItemPrompt('CHANGE', 'Same description.', r);
    expect(p1).not.toBe(p2);
  });

  test('is deterministic', () => {
    const r = baseReport();
    expect(buildRaidItemPrompt('RISK', 'A risk.', r)).toBe(buildRaidItemPrompt('RISK', 'A risk.', r));
  });

  test('throws for invalid type', () => {
    expect(() => buildRaidItemPrompt('BOGUS', 'desc', baseReport())).toThrow();
  });

  test('throws for empty description', () => {
    expect(() => buildRaidItemPrompt('RISK', '', baseReport())).toThrow('description');
  });

  test('throws for null report', () => {
    expect(() => buildRaidItemPrompt('RISK', 'desc', null)).toThrow('non-null object');
  });

  test('throws when report has no projectName', () => {
    const r = baseReport(); delete r.projectName;
    expect(() => buildRaidItemPrompt('RISK', 'desc', r)).toThrow('projectName');
  });

  test('includes weighted findings in prompt', () => {
    expect(buildRaidItemPrompt('RISK', 'Some risk.', baseReport())).toContain('RAID');
  });

  test('handles missing optional fields gracefully', () => {
    const r = { projectName: 'Test', band: 'LOW' };
    expect(() => buildRaidItemPrompt('RISK', 'A risk.', r)).not.toThrow();
  });
});
