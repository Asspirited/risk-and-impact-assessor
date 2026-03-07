/**
 * html-integrity.test.js
 *
 * Structural tests for index.html — catches the class of bugs that silently
 * kill the ES module before any UI renders:
 *
 *   1. Duplicate function declarations in the module script (SyntaxError in strict/module mode)
 *   2. getElementById / querySelector calls referencing IDs that don't exist in the HTML
 *   3. Named imports that aren't exported from their source module
 *
 * Root cause this was written to prevent: RIA-024 — duplicate `switchTool` declaration
 * caused a SyntaxError that silently killed the module, preventing preset buttons and
 * saved sessions from rendering.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const html = readFileSync(resolve(ROOT, 'index.html'), 'utf8');

// ── Extract the <script type="module"> block ─────────────────────────────────

function extractModuleScript(html) {
  const match = html.match(/<script\s+type="module"[^>]*>([\s\S]*?)<\/script>/i);
  if (!match) throw new Error('No <script type="module"> found in index.html');
  return match[1];
}

// ── Extract all id="..." values from the HTML ────────────────────────────────

function extractHtmlIds(html) {
  const ids = new Set();
  const re = /\bid="([^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) ids.add(m[1]);
  return ids;
}

const moduleScript = extractModuleScript(html);
const htmlIds = extractHtmlIds(html);

// ============================================================================
// 1. Duplicate function declarations
// ============================================================================

describe('no duplicate function declarations in module script', () => {
  test('each function name is declared at most once', () => {
    const re = /^\s*(?:async\s+)?function\s+(\w+)\s*\(/gm;
    const counts = {};
    let m;
    while ((m = re.exec(moduleScript)) !== null) {
      counts[m[1]] = (counts[m[1]] ?? 0) + 1;
    }
    const duplicates = Object.entries(counts)
      .filter(([, n]) => n > 1)
      .map(([name, n]) => `${name} (×${n})`);
    expect(duplicates).toEqual([]);
  });
});

// ============================================================================
// 2. getElementById calls reference IDs that exist in the HTML
// ============================================================================

describe('getElementById calls reference existing IDs', () => {
  const re = /getElementById\(['"]([^'"]+)['"]\)/g;
  const referenced = new Set();
  let m;
  while ((m = re.exec(moduleScript)) !== null) referenced.add(m[1]);

  // template-literal IDs (e.g. `tp-${name}`) are skipped — they're dynamic
  // IDs that are also set via `.id = '...'` in the script are created dynamically
  // and won't exist in the initial HTML — exclude them too
  const dynamicallyCreated = new Set();
  const dynRe = /\.id\s*=\s*['"]([^'"]+)['"]/g;
  let dm;
  while ((dm = dynRe.exec(moduleScript)) !== null) dynamicallyCreated.add(dm[1]);

  const staticIds = [...referenced].filter(
    id => !id.includes('$') && !dynamicallyCreated.has(id)
  );

  test.each(staticIds)('id="%s" exists in HTML', id => {
    expect(htmlIds.has(id)).toBe(true);
  });
});

// ============================================================================
// 3. Named imports resolve to actual exports in their source modules
// ============================================================================

describe('named imports exist as exports in their source modules', () => {
  // Parse all import lines from the module script
  const importRe = /import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g;
  const imports = [];
  let m;
  while ((m = importRe.exec(moduleScript)) !== null) {
    const specifier = m[2];
    if (!specifier.startsWith('./src/')) continue;
    const names = m[1]
      .split(',')
      .map(s => s.trim().replace(/\s+as\s+\w+$/, '').trim())
      .filter(Boolean);
    imports.push({ specifier, names });
  }

  for (const { specifier, names } of imports) {
    const absPath = resolve(ROOT, specifier.replace(/^\.\//, ''));
    const src = readFileSync(absPath, 'utf8');
    const exportRe = /export\s+(?:(?:async\s+)?function|const|let|class)\s+(\w+)/g;
    const exported = new Set();
    let em;
    while ((em = exportRe.exec(src)) !== null) exported.add(em[1]);

    test.each(names)(`${specifier} exports '%s'`, name => {
      expect(exported.has(name)).toBe(true);
    });
  }
});

// ============================================================================
// 4. Smoke test — preset buttons container ID exists
//    (regression: if preset-buttons vanishes, presets silently stop rendering)
// ============================================================================

describe('preset-buttons DOM anchor', () => {
  test('id="preset-buttons" exists in HTML', () => {
    expect(htmlIds.has('preset-buttons')).toBe(true);
  });

  test('id="signal-groups" exists in HTML', () => {
    expect(htmlIds.has('signal-groups')).toBe(true);
  });
});

// ============================================================================
// 5. meta[name="worker-url"] is present — missing it throws on module load
// ============================================================================

describe('meta worker-url', () => {
  test('meta[name="worker-url"] content attribute is present', () => {
    expect(html).toMatch(/meta[^>]+name="worker-url"[^>]+content="https?:\/\//);
  });
});

// ============================================================================
// 6. showToolSuggestion DOM wiring
// ============================================================================

describe('showToolSuggestion structural integrity', () => {
  test('showToolSuggestion function is declared', () => {
    expect(moduleScript).toMatch(/function showToolSuggestion\s*\(/);
  });

  test('tool-recommend-block ID is used as the suggestion container', () => {
    expect(moduleScript).toMatch(/tool-recommend-block/);
  });

  test('data-suggest-tool attribute is set on suggestion buttons', () => {
    expect(moduleScript).toMatch(/data-suggest-tool/);
  });

  test('TOOL_SUGGESTIONS is imported from src/tool-suggestions.js', () => {
    expect(moduleScript).toMatch(/TOOL_SUGGESTIONS.*from.*tool-suggestions/);
  });

  test('suggestion buttons trigger switchTool on click', () => {
    expect(moduleScript).toMatch(/switchTool\(btn\.dataset\.suggestTool\)/);
  });
});
