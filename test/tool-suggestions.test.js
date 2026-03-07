import { TOOL_SUGGESTIONS, VALID_TOOLS, RAID_TYPES, TOOL_SIGNALS, suggestToolsFromText } from '../src/tool-suggestions.js';

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

// ── TOOL_SIGNALS structure ────────────────────────────────────────────────────

describe('TOOL_SIGNALS completeness', () => {
  const toolIds = [...VALID_TOOLS];

  test.each(toolIds)('"%s" has a signal definition', toolId => {
    expect(TOOL_SIGNALS[toolId]).toBeDefined();
  });

  test.each(toolIds)('"%s" has a non-empty label', toolId => {
    expect(typeof TOOL_SIGNALS[toolId].label).toBe('string');
    expect(TOOL_SIGNALS[toolId].label.length).toBeGreaterThan(0);
  });

  test.each(toolIds)('"%s" has at least 5 keywords', toolId => {
    expect(TOOL_SIGNALS[toolId].keywords.length).toBeGreaterThanOrEqual(5);
  });

  test.each(toolIds)('"%s" keywords are all lowercase strings', toolId => {
    for (const kw of TOOL_SIGNALS[toolId].keywords) {
      expect(typeof kw).toBe('string');
      expect(kw).toBe(kw.toLowerCase());
    }
  });
});

// ── suggestToolsFromText ──────────────────────────────────────────────────────

describe('suggestToolsFromText', () => {
  test('returns empty array for text with no matching signals', () => {
    expect(suggestToolsFromText('completely unrelated text about weather')).toEqual([]);
  });

  test('returns fmea for text mentioning failure modes and severity', () => {
    const result = suggestToolsFromText('The main concern is a failure mode with high severity and potential catastrophic consequences.');
    expect(result.map(r => r.tool)).toContain('fmea');
  });

  test('returns fivewhys for text mentioning root cause investigation', () => {
    const result = suggestToolsFromText('We need to investigate the root cause of this recurring issue.');
    expect(result.map(r => r.tool)).toContain('fivewhys');
  });

  test('returns pdca for text mentioning improvement and corrective action', () => {
    const result = suggestToolsFromText('An improvement plan and corrective action cycle should be implemented.');
    expect(result.map(r => r.tool)).toContain('pdca');
  });

  test('returns vsm for text mentioning bottleneck and lead time', () => {
    const result = suggestToolsFromText('There is a bottleneck in the handoff process causing lead time delays.');
    expect(result.map(r => r.tool)).toContain('vsm');
  });

  test('respects maxResults limit', () => {
    const text = 'failure root cause bottleneck lead time deployment recovery improvement corrective action';
    expect(suggestToolsFromText(text, 1).length).toBeLessThanOrEqual(1);
    expect(suggestToolsFromText(text, 3).length).toBeLessThanOrEqual(3);
  });

  test('result objects have tool, label, and score properties', () => {
    const result = suggestToolsFromText('failure mode root cause investigation');
    for (const r of result) {
      expect(typeof r.tool).toBe('string');
      expect(typeof r.label).toBe('string');
      expect(typeof r.score).toBe('number');
      expect(r.score).toBeGreaterThan(0);
    }
  });

  test('results are sorted by score descending', () => {
    const text = 'failure mode failure mode failure mode root cause';
    const result = suggestToolsFromText(text, 5);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].score).toBeGreaterThanOrEqual(result[i].score);
    }
  });

  test('is case-insensitive — uppercase text matches lowercase keywords', () => {
    const result = suggestToolsFromText('ROOT CAUSE INVESTIGATION FAILURE MODE SEVERITY');
    expect(result.length).toBeGreaterThan(0);
  });
});
