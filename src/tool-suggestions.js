/**
 * tool-suggestions.js
 *
 * Maps each RAID item type to the quality tools most relevant for analysis.
 * Extracted from index.html so it can be unit-tested independently.
 */

export const VALID_TOOLS = new Set(['acc', 'fmea', 'fivewhys', 'ishikawa', 'pdca', 'vsm', 'dora']);

export const TOOL_SUGGESTIONS = {
  risk:       [{ tool: 'fmea',      label: 'FMEA' },            { tool: 'fivewhys',  label: '5 Whys' }],
  assumption: [{ tool: 'acc',       label: 'ACC Analysis' },    { tool: 'pdca',      label: 'PDCA' }],
  issue:      [{ tool: 'fivewhys',  label: '5 Whys' },          { tool: 'ishikawa',  label: 'Ishikawa' }, { tool: 'pdca', label: 'PDCA' }],
  dependency: [{ tool: 'vsm',       label: 'Value Stream Map' }, { tool: 'acc',       label: 'ACC Analysis' }],
  change:     [{ tool: 'pdca',      label: 'PDCA' },            { tool: 'fmea',      label: 'FMEA' }],
};

export const RAID_TYPES = Object.keys(TOOL_SUGGESTIONS);
