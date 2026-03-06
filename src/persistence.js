/**
 * persistence.js
 * Multi-project context storage.
 * Projects are stored as a keyed map in a single storage entry.
 * Each project record includes the sub-criteria inputs and computed summary
 * fields so the project list can be rendered without re-running assess().
 *
 * Storage backends: any object implementing getItem / setItem / removeItem.
 * Pass a mock to test in Node (no DOM required).
 */

const PROJECTS_KEY = 'ria-projects';

/**
 * Load the raw projects map from storage.
 * Returns {} on any error.
 * @param {Storage} storage
 * @returns {Object}
 */
function loadMap(storage) {
  try {
    const raw = storage.getItem(PROJECTS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Persist the projects map to storage.
 * @param {Object} map
 * @param {Storage} storage
 */
function saveMap(map, storage) {
  storage.setItem(PROJECTS_KEY, JSON.stringify(map));
}

/**
 * Save a project context.
 * If a project with the same name already exists it is overwritten.
 * summary fields (archetypeLabel, band, tradAgileLabel) are optional but
 * recommended so the project list can show useful information without
 * re-running the assessment.
 *
 * @param {string} projectName
 * @param {Object} inputs - sub-criteria key → 0-5
 * @param {Object} [summary] - { archetypeLabel, band, tradAgileLabel }
 * @param {Storage} [storage]
 */
export function saveProject(projectName, inputs, summary = {}, storage = localStorage) {
  if (typeof projectName !== 'string' || projectName.trim() === '') {
    throw new Error('projectName must be a non-empty string');
  }
  if (!inputs || typeof inputs !== 'object') {
    throw new Error('inputs must be a non-null object');
  }
  const map = loadMap(storage);
  map[projectName] = {
    projectName,
    inputs: { ...inputs },
    archetypeLabel:  summary.archetypeLabel  ?? null,
    band:            summary.band            ?? null,
    tradAgileLabel:  summary.tradAgileLabel  ?? null,
    savedAt:         Date.now()
  };
  saveMap(map, storage);
}

/**
 * Return all saved projects as an array, sorted most-recently-saved first.
 * @param {Storage} [storage]
 * @returns {Array<{projectName, inputs, archetypeLabel, band, tradAgileLabel, savedAt}>}
 */
export function listProjects(storage = localStorage) {
  const map = loadMap(storage);
  return Object.values(map).sort((a, b) => b.savedAt - a.savedAt);
}

/**
 * Load a single project by name.
 * Returns null if not found.
 * @param {string} projectName
 * @param {Storage} [storage]
 * @returns {{projectName, inputs, archetypeLabel, band, tradAgileLabel, savedAt} | null}
 */
export function loadProject(projectName, storage = localStorage) {
  const map = loadMap(storage);
  return map[projectName] ?? null;
}

/**
 * Delete a project by name.
 * No-op if the project does not exist.
 * @param {string} projectName
 * @param {Storage} [storage]
 */
export function deleteProject(projectName, storage = localStorage) {
  const map = loadMap(storage);
  delete map[projectName];
  saveMap(map, storage);
}

/**
 * Remove all saved projects.
 * @param {Storage} [storage]
 */
export function clearAllProjects(storage = localStorage) {
  storage.removeItem(PROJECTS_KEY);
}

// ---------------------------------------------------------------------------
// Legacy single-project API — preserved so existing call sites continue to
// work. These operate on the most-recently-saved project.
// ---------------------------------------------------------------------------

/**
 * @deprecated Use saveProject(name, inputs, summary, storage) instead.
 */
export function saveProjectState(projectName, inputs, storage = localStorage) {
  saveProject(projectName, inputs, {}, storage);
}

/**
 * Returns the most recently saved project, or null.
 * @deprecated Use listProjects(storage)[0] instead.
 */
export function loadProjectState(storage = localStorage) {
  const projects = listProjects(storage);
  return projects.length > 0 ? projects[0] : null;
}

/**
 * Removes all saved projects.
 * @deprecated Use clearAllProjects(storage) instead.
 */
export function clearProjectState(storage = localStorage) {
  clearAllProjects(storage);
}
