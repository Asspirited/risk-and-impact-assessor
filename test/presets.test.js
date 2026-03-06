import { DELIVERY_PRESETS, getPresetInputs } from '../src/presets.js';
import { validateSubCriteria }               from '../src/dimensions.js';
import { scoreTradAgile, tradAgileLabel }     from '../src/trad-agile.js';
import { assess }                             from '../src/assess.js';

const PRESET_KEYS = ['TRADITIONAL', 'HYBRID', 'AGILE', 'AGILE_CD'];

describe('DELIVERY_PRESETS structure', () => {
  test('has four presets', () => expect(Object.keys(DELIVERY_PRESETS)).toHaveLength(4));

  test.each(PRESET_KEYS)('%s has key, label, description, inputs', key => {
    const p = DELIVERY_PRESETS[key];
    expect(typeof p.key).toBe('string');
    expect(typeof p.label).toBe('string');
    expect(p.label.length).toBeGreaterThan(0);
    expect(typeof p.description).toBe('string');
    expect(p.description.length).toBeGreaterThan(0);
    expect(typeof p.inputs).toBe('object');
  });

  test.each(PRESET_KEYS)('%s has 28 sub-criteria', key => {
    expect(Object.keys(DELIVERY_PRESETS[key].inputs)).toHaveLength(28);
  });

  test.each(PRESET_KEYS)('%s all values are 0–5 integers', key => {
    for (const [subKey, val] of Object.entries(DELIVERY_PRESETS[key].inputs)) {
      expect(typeof val).toBe('number');
      expect(Number.isInteger(val)).toBe(true);
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(5);
    }
  });

  test.each(PRESET_KEYS)('%s passes validateSubCriteria', key => {
    expect(() => validateSubCriteria(DELIVERY_PRESETS[key].inputs)).not.toThrow();
  });
});

describe('getPresetInputs', () => {
  test.each(PRESET_KEYS)('returns inputs for %s', key => {
    const inputs = getPresetInputs(key);
    expect(typeof inputs).toBe('object');
    expect(Object.keys(inputs)).toHaveLength(28);
  });

  test('returns a copy — mutations do not affect the original', () => {
    const inputs = getPresetInputs('TRADITIONAL');
    inputs.riskVisibility = 99;
    expect(DELIVERY_PRESETS.TRADITIONAL.inputs.riskVisibility).not.toBe(99);
  });

  test('throws for unknown preset', () => {
    expect(() => getPresetInputs('WATERFALL')).toThrow('Unknown preset');
  });

  test('error message lists valid presets', () => {
    try { getPresetInputs('SCRUM'); } catch (e) {
      expect(e.message).toContain('TRADITIONAL');
    }
  });
});

describe('preset trad/agile ordering', () => {
  test('Traditional scores lowest on trad/agile spectrum', () => {
    const t = scoreTradAgile(DELIVERY_PRESETS.TRADITIONAL.inputs);
    const h = scoreTradAgile(DELIVERY_PRESETS.HYBRID.inputs);
    expect(t).toBeLessThanOrEqual(h);
  });

  test('Agile CD scores highest on trad/agile spectrum', () => {
    const a  = scoreTradAgile(DELIVERY_PRESETS.AGILE.inputs);
    const cd = scoreTradAgile(DELIVERY_PRESETS.AGILE_CD.inputs);
    expect(cd).toBeGreaterThanOrEqual(a);
  });

  test('Traditional label is Traditional', () => {
    const score = scoreTradAgile(DELIVERY_PRESETS.TRADITIONAL.inputs);
    expect(tradAgileLabel(score)).toBe('Traditional');
  });

  test('Agile CD label is Agile', () => {
    const score = scoreTradAgile(DELIVERY_PRESETS.AGILE_CD.inputs);
    expect(tradAgileLabel(score)).toBe('Agile');
  });
});

describe('preset assessments run cleanly', () => {
  test.each(PRESET_KEYS)('%s produces a valid SynthesisReport', key => {
    const report = assess(`Test — ${key}`, DELIVERY_PRESETS[key].inputs);
    expect(report).toHaveProperty('archetype');
    expect(report).toHaveProperty('band');
    expect(report).toHaveProperty('tradAgileScore');
    expect(report.dimensionScores).toBeDefined();
  });

  test('all four presets produce different dimension score profiles', () => {
    const profiles = PRESET_KEYS.map(k =>
      JSON.stringify(assess(`T`, DELIVERY_PRESETS[k].inputs).dimensionScores)
    );
    const unique = new Set(profiles);
    expect(unique.size).toBe(4);
  });
});
