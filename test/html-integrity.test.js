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
    const exported = new Set();
    // Inline declarations: export const/function/let/class NAME
    const declRe = /export\s+(?:(?:async\s+)?function|const|let|class)\s+(\w+)/g;
    let em;
    while ((em = declRe.exec(src)) !== null) exported.add(em[1]);
    // Re-export aliases: export { localName as ExportedName } from '...'
    const reExportRe = /export\s*\{([^}]+)\}/g;
    while ((em = reExportRe.exec(src)) !== null) {
      for (const spec of em[1].split(',')) {
        const asMatch = spec.trim().match(/\w+\s+as\s+(\w+)/);
        if (asMatch) exported.add(asMatch[1]);
        else exported.add(spec.trim().split(/\s+/)[0]);
      }
    }

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
// 6. Mobile nav scrollability
//    Regression: .tools-nav had flex-shrink: 0 with no overflow-y — long tool
//    lists clipped on small screens and the page behind scrolled instead.
// ============================================================================

describe('mobile sidebar scroll', () => {
  test('.tools-nav has overflow-y: auto (scrollable on mobile)', () => {
    expect(html).toMatch(/\.tools-nav\s*\{[^}]*overflow-y:\s*auto/);
  });

  test('.tools-nav has overscroll-behavior: contain (no scroll bleed)', () => {
    expect(html).toMatch(/\.tools-nav\s*\{[^}]*overscroll-behavior:\s*contain/);
  });

  test('.tools-drawer has overscroll-behavior: contain', () => {
    expect(html).toMatch(/\.tools-drawer\s*\{[^}]*overscroll-behavior:\s*contain/);
  });

  test('.tools-nav does not have flex-shrink: 0 (must be able to shrink)', () => {
    // flex-shrink: 0 prevented the nav from fitting within the drawer height
    const navRule = html.match(/\.tools-nav\s*\{([^}]+)\}/);
    expect(navRule).not.toBeNull();
    expect(navRule[1]).not.toMatch(/flex-shrink:\s*0/);
  });
});

// ============================================================================
// 7. Tool nav category placement
//    Regression guard: pre-mortem and KT are in the backlog section, not live.
// ============================================================================

describe('tool nav category placement', () => {
  // Parse the nav HTML to get the category each tool belongs to
  function getToolCategory(toolId) {
    // Find the section containing data-tool="<id>" and return its label
    const re = /class="tools-nav-group-label">([^<]+)<[\s\S]*?data-tool="([^"]+)"/g;
    let m;
    let currentLabel = null;
    const labelRe = /class="tools-nav-group-label">([^<]+)</g;
    const toolRe = /data-tool="([^"]+)"/g;
    // Walk through nav HTML sequentially
    const navMatch = html.match(/<div class="tools-nav">([\s\S]*?)<\/div>\s*<div class="tools-content">/);
    if (!navMatch) return null;
    const navHtml = navMatch[1];
    // Split by group labels to find which group each tool is in
    const groups = navHtml.split(/class="tools-nav-group-label">/);
    for (const group of groups.slice(1)) {
      const labelEnd = group.indexOf('<');
      const label = group.slice(0, labelEnd).trim();
      const toolMatches = [...group.matchAll(/data-tool="([^"]+)"/g)];
      if (toolMatches.some(([, id]) => id === toolId)) return label;
    }
    return null;
  }

  test('pre-mortem is in the backlog section', () => {
    expect(getToolCategory('premortem')).toBe('On the backlog');
  });

  test('kepner-tregoe is in the backlog section', () => {
    expect(getToolCategory('kt')).toBe('On the backlog');
  });

  test('socratic is in the Risk section', () => {
    expect(getToolCategory('socratic')).toBe('Risk');
  });

  test('fivewhys is in the Root Cause section', () => {
    expect(getToolCategory('fivewhys')).toBe('Root Cause');
  });

  test('pdca is in the Delivery section', () => {
    expect(getToolCategory('pdca')).toBe('Delivery');
  });

  test('flowmetrics is in the Metrics section', () => {
    expect(getToolCategory('flowmetrics')).toBe('Metrics');
  });

  test('cynefin is in the Risk section', () => {
    expect(getToolCategory('cynefin')).toBe('Risk');
  });

  test('dmaic is in the Quality section', () => {
    expect(getToolCategory('dmaic')).toBe('Quality');
  });

  test('toc is in the Delivery section', () => {
    expect(getToolCategory('toc')).toBe('Delivery');
  });

  test('sevenwastes is in the Delivery section', () => {
    expect(getToolCategory('sevenwastes')).toBe('Delivery');
  });
});

// ============================================================================
// 8. showToolSuggestion DOM wiring
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
