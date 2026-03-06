/**
 * persistence.js
 * Save and restore project context (name + sub-criteria scores) via a storage backend.
 * The storage parameter defaults to window.localStorage but can be replaced with any
 * object implementing getItem / setItem / removeItem — enabling unit testing in Node.
 */

const STATE_KEY = 'ria-project-state';

/**
 * Save project name and sub-criteria inputs to storage.
 * @param {string} projectName
 * @param {Object} inputs - sub-criteria key → 0-5
 * @param {Storage} [storage]
 */
export function saveProjectState(projectName, inputs, storage = localStorage) {
  if (typeof projectName !== 'string' || projectName.trim() === '') {
    throw new Error('projectName must be a non-empty string');
  }
  if (!inputs || typeof inputs !== 'object') {
    throw new Error('inputs must be a non-null object');
  }
  storage.setItem(STATE_KEY, JSON.stringify({ projectName, inputs }));
}

/**
 * Load saved project state from storage.
 * Returns null if nothing is saved or the value cannot be parsed.
 * @param {Storage} [storage]
 * @returns {{ projectName: string, inputs: Object } | null}
 */
export function loadProjectState(storage = localStorage) {
  try {
    const raw = storage.getItem(STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.projectName !== 'string' || !parsed.inputs) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Remove saved project state from storage.
 * @param {Storage} [storage]
 */
export function clearProjectState(storage = localStorage) {
  storage.removeItem(STATE_KEY);
}
