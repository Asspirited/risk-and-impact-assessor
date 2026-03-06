import {
  saveProject, listProjects, loadProject, deleteProject, clearAllProjects,
  saveProjectState, loadProjectState, clearProjectState
} from '../src/persistence.js';

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

const summary = () => ({ archetypeLabel: 'Haunted House', band: 'HIGH', tradAgileLabel: 'Hybrid' });

// ---------------------------------------------------------------------------
// saveProject
// ---------------------------------------------------------------------------

describe('saveProject', () => {
  test('saves a project to storage', () => {
    const s = new MockStorage();
    saveProject('Project Alpha', baseInputs(), summary(), s);
    expect(s.getItem('ria-projects')).not.toBeNull();
  });

  test('saving two projects results in two entries', () => {
    const s = new MockStorage();
    saveProject('Project Alpha', baseInputs(), summary(), s);
    saveProject('Project Beta',  baseInputs(), summary(), s);
    expect(listProjects(s)).toHaveLength(2);
  });

  test('saving the same name twice overwrites', () => {
    const s = new MockStorage();
    saveProject('Project Alpha', baseInputs(), summary(), s);
    const updated = { ...baseInputs(), riskVisibility: 5 };
    saveProject('Project Alpha', updated, summary(), s);
    expect(listProjects(s)).toHaveLength(1);
    expect(loadProject('Project Alpha', s).inputs.riskVisibility).toBe(5);
  });

  test('stores summary fields', () => {
    const s = new MockStorage();
    saveProject('Test', baseInputs(), summary(), s);
    const p = loadProject('Test', s);
    expect(p.archetypeLabel).toBe('Haunted House');
    expect(p.band).toBe('HIGH');
    expect(p.tradAgileLabel).toBe('Hybrid');
  });

  test('stores savedAt timestamp', () => {
    const s = new MockStorage();
    const before = Date.now();
    saveProject('Test', baseInputs(), {}, s);
    const p = loadProject('Test', s);
    expect(p.savedAt).toBeGreaterThanOrEqual(before);
  });

  test('returns a copy of inputs — mutations do not affect stored value', () => {
    const s = new MockStorage();
    const inputs = baseInputs();
    saveProject('Test', inputs, {}, s);
    inputs.riskVisibility = 99;
    expect(loadProject('Test', s).inputs.riskVisibility).toBe(0);
  });

  test('throws on empty projectName', () => {
    expect(() => saveProject('', baseInputs(), {}, new MockStorage())).toThrow('non-empty string');
  });

  test('throws on null inputs', () => {
    expect(() => saveProject('Test', null, {}, new MockStorage())).toThrow('non-null object');
  });
});

// ---------------------------------------------------------------------------
// listProjects
// ---------------------------------------------------------------------------

describe('listProjects', () => {
  test('returns empty array when nothing saved', () => {
    expect(listProjects(new MockStorage())).toEqual([]);
  });

  test('returns projects sorted most-recently-saved first', () => {
    const s = new MockStorage();
    // Manually set savedAt to guarantee ordering
    saveProject('Alpha', baseInputs(), {}, s);
    const map = JSON.parse(s.getItem('ria-projects'));
    map['Alpha'].savedAt = 1000;
    s.setItem('ria-projects', JSON.stringify(map));
    saveProject('Beta', baseInputs(), {}, s);
    const list = listProjects(s);
    expect(list[0].projectName).toBe('Beta');
    expect(list[1].projectName).toBe('Alpha');
  });

  test('returns all saved projects', () => {
    const s = new MockStorage();
    saveProject('A', baseInputs(), {}, s);
    saveProject('B', baseInputs(), {}, s);
    saveProject('C', baseInputs(), {}, s);
    expect(listProjects(s)).toHaveLength(3);
  });

  test('returns empty array on corrupt storage', () => {
    const s = new MockStorage();
    s.setItem('ria-projects', 'not-json');
    expect(listProjects(s)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// loadProject
// ---------------------------------------------------------------------------

describe('loadProject', () => {
  test('returns project by name', () => {
    const s = new MockStorage();
    saveProject('Project Alpha', baseInputs(), summary(), s);
    const p = loadProject('Project Alpha', s);
    expect(p.projectName).toBe('Project Alpha');
  });

  test('returns null for unknown name', () => {
    expect(loadProject('Unknown', new MockStorage())).toBeNull();
  });

  test('has inputs field', () => {
    const s = new MockStorage();
    saveProject('Test', baseInputs(), {}, s);
    expect(loadProject('Test', s).inputs).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// deleteProject
// ---------------------------------------------------------------------------

describe('deleteProject', () => {
  test('removes the named project', () => {
    const s = new MockStorage();
    saveProject('Alpha', baseInputs(), {}, s);
    saveProject('Beta',  baseInputs(), {}, s);
    deleteProject('Alpha', s);
    expect(listProjects(s)).toHaveLength(1);
    expect(listProjects(s)[0].projectName).toBe('Beta');
  });

  test('is idempotent — no error when project does not exist', () => {
    expect(() => deleteProject('Nobody', new MockStorage())).not.toThrow();
  });

  test('loadProject returns null after deletion', () => {
    const s = new MockStorage();
    saveProject('Alpha', baseInputs(), {}, s);
    deleteProject('Alpha', s);
    expect(loadProject('Alpha', s)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// clearAllProjects
// ---------------------------------------------------------------------------

describe('clearAllProjects', () => {
  test('empties the project list', () => {
    const s = new MockStorage();
    saveProject('A', baseInputs(), {}, s);
    saveProject('B', baseInputs(), {}, s);
    clearAllProjects(s);
    expect(listProjects(s)).toEqual([]);
  });

  test('is idempotent', () => {
    expect(() => clearAllProjects(new MockStorage())).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Legacy API
// ---------------------------------------------------------------------------

describe('legacy saveProjectState / loadProjectState / clearProjectState', () => {
  test('saveProjectState + loadProjectState round-trips project name', () => {
    const s = new MockStorage();
    saveProjectState('Project Alpha', baseInputs(), s);
    expect(loadProjectState(s).projectName).toBe('Project Alpha');
  });

  test('loadProjectState returns null on empty storage', () => {
    expect(loadProjectState(new MockStorage())).toBeNull();
  });

  test('clearProjectState empties storage', () => {
    const s = new MockStorage();
    saveProjectState('Test', baseInputs(), s);
    clearProjectState(s);
    expect(loadProjectState(s)).toBeNull();
  });

  test('multiple saves via legacy API all visible via listProjects', () => {
    const s = new MockStorage();
    saveProjectState('A', baseInputs(), s);
    saveProjectState('B', baseInputs(), s);
    expect(listProjects(s)).toHaveLength(2);
  });
});
