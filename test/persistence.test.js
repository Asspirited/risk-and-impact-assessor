import { saveProjectState, loadProjectState, clearProjectState } from '../src/persistence.js';

class MockStorage {
  constructor() { this._data = {}; }
  getItem(key)        { return Object.prototype.hasOwnProperty.call(this._data, key) ? this._data[key] : null; }
  setItem(key, value) { this._data[key] = String(value); }
  removeItem(key)     { delete this._data[key]; }
}

const baseInputs = () => ({
  requirementsClarity: 2, stakeholderAlignment: 1, changeFrequency: 3, acceptanceCriteria: 0,
  budgetCertainty: 0, contingencyAdequacy: 0, costTracking: 0, financialExposure: 0,
  scheduleDefinition: 0, milestoneConfidence: 0, deadlineFlexibility: 0, criticalPathVisibility: 0,
  qualityStandards: 0, testingCoverage: 0, technicalDebt: 0, nonFunctionalRequirements: 0,
  technicalComplexity: 0, organisationalComplexity: 0, integrationComplexity: 0, regulatoryComplexity: 0,
  requirementsUncertainty: 0, technicalUncertainty: 0, stakeholderUncertainty: 0, externalUncertainty: 0,
  riskVisibility: 0, issueResolution: 0, assumptionValidity: 0, dependencyConfidence: 0
});

describe('saveProjectState', () => {
  test('writes to storage', () => {
    const s = new MockStorage();
    saveProjectState('Project Alpha', baseInputs(), s);
    expect(s.getItem('ria-project-state')).not.toBeNull();
  });

  test('round-trips project name', () => {
    const s = new MockStorage();
    saveProjectState('Project Alpha', baseInputs(), s);
    const state = loadProjectState(s);
    expect(state.projectName).toBe('Project Alpha');
  });

  test('round-trips inputs', () => {
    const s = new MockStorage();
    const inputs = baseInputs();
    inputs.requirementsClarity = 4;
    saveProjectState('Test', inputs, s);
    const state = loadProjectState(s);
    expect(state.inputs.requirementsClarity).toBe(4);
  });

  test('throws on empty project name', () => {
    expect(() => saveProjectState('', baseInputs(), new MockStorage())).toThrow('non-empty string');
  });

  test('throws on null inputs', () => {
    expect(() => saveProjectState('Test', null, new MockStorage())).toThrow('non-null object');
  });

  test('overwrites previous state', () => {
    const s = new MockStorage();
    saveProjectState('Old', baseInputs(), s);
    saveProjectState('New', baseInputs(), s);
    expect(loadProjectState(s).projectName).toBe('New');
  });
});

describe('loadProjectState', () => {
  test('returns null when storage is empty', () => {
    expect(loadProjectState(new MockStorage())).toBeNull();
  });

  test('returns null on corrupt JSON', () => {
    const s = new MockStorage();
    s.setItem('ria-project-state', 'not-json{{{');
    expect(loadProjectState(s)).toBeNull();
  });

  test('returns null when parsed value lacks expected fields', () => {
    const s = new MockStorage();
    s.setItem('ria-project-state', JSON.stringify({ something: 'else' }));
    expect(loadProjectState(s)).toBeNull();
  });

  test('returns state object with projectName and inputs', () => {
    const s = new MockStorage();
    saveProjectState('Project Beta', baseInputs(), s);
    const state = loadProjectState(s);
    expect(state).toHaveProperty('projectName');
    expect(state).toHaveProperty('inputs');
  });
});

describe('clearProjectState', () => {
  test('removes saved state', () => {
    const s = new MockStorage();
    saveProjectState('Test', baseInputs(), s);
    clearProjectState(s);
    expect(loadProjectState(s)).toBeNull();
  });

  test('is idempotent — does not throw when nothing saved', () => {
    expect(() => clearProjectState(new MockStorage())).not.toThrow();
  });
});
