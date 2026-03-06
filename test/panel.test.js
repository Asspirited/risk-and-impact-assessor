import { PANEL_MEMBERS, FLAGGING_THRESHOLD, computePanelView, computeAllPanelViews, buildPanelPrompt } from '../src/panel.js';

const baseDimScores = () => ({
  SCOPE: 0, COST: 0, TIME: 0, QUALITY: 0, COMPLEXITY: 0, UNCERTAINTY: 0, RAID: 0
});

const baseReport = () => ({
  projectName: 'Project Albatross',
  dimensionScores: baseDimScores(),
  archetypeLabel: 'Haunted House',
  archetypeDescription: 'Everyone knows something is wrong. Nobody will say it out loud.',
  band: 'HIGH',
  tradAgileScore: 45,
  tradAgileLabel: 'Hybrid',
  panelViews: {
    SUNI:  { member: 'SUNI',  weightedScores: {}, flaggedDimensions: [] },
    PETER: { member: 'PETER', weightedScores: {}, flaggedDimensions: [] },
    DAVOS: { member: 'DAVOS', weightedScores: {}, flaggedDimensions: [] }
  }
});

describe('PANEL_MEMBERS', () => {
  test('contains exactly three members', () => {
    expect(Object.keys(PANEL_MEMBERS)).toHaveLength(3);
  });
  test.each(['SUNI','PETER','DAVOS'])('contains %s', key => {
    expect(PANEL_MEMBERS[key]).toBeDefined();
  });
  test.each(['SUNI','PETER','DAVOS'])('%s has name and role', key => {
    expect(typeof PANEL_MEMBERS[key].name).toBe('string');
    expect(typeof PANEL_MEMBERS[key].role).toBe('string');
  });
  test.each(['SUNI','PETER','DAVOS'])('%s has dimensionWeights for all seven dimensions', key => {
    const weights = PANEL_MEMBERS[key].dimensionWeights;
    for (const dim of ['SCOPE','COST','TIME','QUALITY','COMPLEXITY','UNCERTAINTY','RAID']) {
      expect(typeof weights[dim]).toBe('number');
    }
  });
  test.each(['SUNI','PETER','DAVOS'])('%s has blindSpots array', key => {
    expect(Array.isArray(PANEL_MEMBERS[key].blindSpots)).toBe(true);
    expect(PANEL_MEMBERS[key].blindSpots.length).toBeGreaterThan(0);
  });
  test.each(['SUNI','PETER','DAVOS'])('%s has documentedPositions array', key => {
    expect(Array.isArray(PANEL_MEMBERS[key].documentedPositions)).toBe(true);
    expect(PANEL_MEMBERS[key].documentedPositions.length).toBeGreaterThan(0);
  });
  test('SUNI has COMPLEXITY weight of 0 (blind spot)', () => {
    expect(PANEL_MEMBERS.SUNI.dimensionWeights.COMPLEXITY).toBe(0);
  });
  test('SUNI COST weight is highest of her weights', () => {
    const w = PANEL_MEMBERS.SUNI.dimensionWeights;
    expect(w.COST).toBe(Math.max(...Object.values(w)));
  });
  test('PETER TIME weight is joint-highest', () => {
    const w = PANEL_MEMBERS.PETER.dimensionWeights;
    const max = Math.max(...Object.values(w));
    expect(w.TIME).toBe(max);
  });
  test('PETER RAID weight is joint-highest', () => {
    const w = PANEL_MEMBERS.PETER.dimensionWeights;
    const max = Math.max(...Object.values(w));
    expect(w.RAID).toBe(max);
  });
  test('DAVOS QUALITY weight is joint-highest', () => {
    const w = PANEL_MEMBERS.DAVOS.dimensionWeights;
    const max = Math.max(...Object.values(w));
    expect(w.QUALITY).toBe(max);
  });
  test('DAVOS COST weight is lowest', () => {
    const w = PANEL_MEMBERS.DAVOS.dimensionWeights;
    expect(w.COST).toBe(Math.min(...Object.values(w)));
  });
});

describe('FLAGGING_THRESHOLD', () => {
  test('is a positive number', () => {
    expect(typeof FLAGGING_THRESHOLD).toBe('number');
    expect(FLAGGING_THRESHOLD).toBeGreaterThan(0);
  });
});

describe('computePanelView', () => {
  test('returns object with member, weightedScores, flaggedDimensions', () => {
    const view = computePanelView('SUNI', baseDimScores());
    expect(view).toHaveProperty('member', 'SUNI');
    expect(view).toHaveProperty('weightedScores');
    expect(view).toHaveProperty('flaggedDimensions');
  });

  test('all-zero scores produce no flagged dimensions', () => {
    const view = computePanelView('PETER', baseDimScores());
    expect(view.flaggedDimensions).toHaveLength(0);
  });

  test('each weightedScore entry has score, weight, weightedScore, flagged', () => {
    const view = computePanelView('DAVOS', baseDimScores());
    for (const entry of Object.values(view.weightedScores)) {
      expect(entry).toHaveProperty('score');
      expect(entry).toHaveProperty('weight');
      expect(entry).toHaveProperty('weightedScore');
      expect(entry).toHaveProperty('flagged');
    }
  });

  test('weighted score equals dimension score × member weight', () => {
    const scores = { ...baseDimScores(), SCOPE: 3 };
    const view = computePanelView('SUNI', scores);
    expect(view.weightedScores.SCOPE.weightedScore).toBe(3 * PANEL_MEMBERS.SUNI.dimensionWeights.SCOPE);
  });

  test('dimension flagged when weighted score exceeds threshold', () => {
    // PETER TIME weight=5, score=3 → weightedScore=15 > threshold(9)
    const scores = { ...baseDimScores(), TIME: 3 };
    const view = computePanelView('PETER', scores);
    expect(view.flaggedDimensions).toContain('TIME');
  });

  test('COMPLEXITY never flagged by SUNI regardless of score', () => {
    const scores = { ...baseDimScores(), COMPLEXITY: 5 };
    const view = computePanelView('SUNI', scores);
    expect(view.flaggedDimensions).not.toContain('COMPLEXITY');
  });

  test('throws for unknown member', () => {
    expect(() => computePanelView('GANDALF', baseDimScores())).toThrow('Unknown panel member');
  });
});

describe('computeAllPanelViews', () => {
  test('returns views for all three members', () => {
    const views = computeAllPanelViews(baseDimScores());
    expect(Object.keys(views)).toHaveLength(3);
    expect(views).toHaveProperty('SUNI');
    expect(views).toHaveProperty('PETER');
    expect(views).toHaveProperty('DAVOS');
  });
});

describe('buildPanelPrompt', () => {
  test.each(['SUNI','PETER','DAVOS'])('returns non-empty string for %s', member => {
    const prompt = buildPanelPrompt(member, baseReport());
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(200);
  });

  test('SUNI prompt contains business/ROI/investment reference', () => {
    const prompt = buildPanelPrompt('SUNI', baseReport());
    expect(prompt.toLowerCase()).toMatch(/business|roi|investment|stakeholder/);
  });

  test('PETER prompt contains schedule/delivery/governance reference', () => {
    const prompt = buildPanelPrompt('PETER', baseReport());
    expect(prompt.toLowerCase()).toMatch(/schedule|delivery|governance|project manager/);
  });

  test('DAVOS prompt contains technical/complexity/feasibility reference', () => {
    const prompt = buildPanelPrompt('DAVOS', baseReport());
    expect(prompt.toLowerCase()).toMatch(/technical|complexity|feasibility|development/);
  });

  test('all prompts include project name', () => {
    for (const member of ['SUNI','PETER','DAVOS']) {
      expect(buildPanelPrompt(member, baseReport())).toContain('Project Albatross');
    }
  });

  test('three prompts are all distinct', () => {
    const prompts = ['SUNI','PETER','DAVOS'].map(m => buildPanelPrompt(m, baseReport()));
    expect(new Set(prompts).size).toBe(3);
  });

  test('throws for unknown member', () => {
    expect(() => buildPanelPrompt('NOBODY', baseReport())).toThrow();
  });

  test('throws for missing projectName', () => {
    const r = baseReport(); r.projectName = '';
    expect(() => buildPanelPrompt('SUNI', r)).toThrow('projectName');
  });
});
