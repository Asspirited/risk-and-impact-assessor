import { TOOL_SUGGESTIONS, VALID_TOOLS, RAID_TYPES } from '../src/tool-suggestions.js';

const EXPECTED_RAID_TYPES = ['risk', 'assumption', 'issue', 'dependency', 'change'];

// ── Every RAID type has at least one suggestion ──────────────────────────────

describe('TOOL_SUGGESTIONS coverage', () => {
  test.each(EXPECTED_RAID_TYPES)('"%s" has at least one suggestion', raidType => {
    expect(TOOL_SUGGESTIONS[raidType]).toBeDefined();
    expect(TOOL_SUGGESTIONS[raidType].length).toBeGreaterThan(0);
  });

  test('no unexpected RAID type keys', () => {
    expect(RAID_TYPES.sort()).toEqual([...EXPECTED_RAID_TYPES].sort());
  });
});

// ── Each suggestion references a valid, implemented tool ─────────────────────

describe('suggestion tool IDs are valid', () => {
  for (const [raidType, suggestions] of Object.entries(TOOL_SUGGESTIONS)) {
    test.each(suggestions)(`${raidType}: tool "%s" is a known tool`, ({ tool, label }) => {
      expect(VALID_TOOLS.has(tool)).toBe(true);
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    });
  }
});

// ── No duplicate tool IDs within a single RAID type ──────────────────────────

describe('no duplicate tools per RAID type', () => {
  test.each(EXPECTED_RAID_TYPES)('"%s" has no duplicate tool IDs', raidType => {
    const tools = TOOL_SUGGESTIONS[raidType].map(s => s.tool);
    const unique = new Set(tools);
    expect(unique.size).toBe(tools.length);
  });
});
