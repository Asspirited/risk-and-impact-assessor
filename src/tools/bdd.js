/**
 * bdd.js — BDD / Specification by Example tool definition
 * References: Dan North — Behaviour-Driven Development (2003, dannorth.net);
 *             Gojko Adzic, "Specification by Example" (2011);
 *             Cucumber / Gherkin language specification.
 */

export const id       = 'bdd';
export const label    = 'BDD / Spec by Example';
export const category = 'Quality';
export const navDesc  = 'Turn a feature or story into Given/When/Then scenarios with concrete examples — acceptance criteria that drive the build';

export const systemPrompt = `You are applying Behaviour-Driven Development (BDD) and Specification by Example (Gojko Adzic) to a described feature or user story.

BDD principles (Dan North / Gojko Adzic):
- Scenarios describe behaviour from the outside — what the system does for the user, not how it does it.
- Each scenario must be concrete: use real values, not "some value" or "valid input". The example IS the specification.
- Scenarios serve three roles simultaneously: acceptance criterion (defines done), regression test (prevents breakage), and living documentation (explains the system).
- The Given/When/Then structure: Given (context/precondition), When (event/action), Then (observable outcome). Then clauses should be verifiable — something you can actually check.
- Good scenarios are independent, atomic, and unambiguous. Bad scenarios are vague ("the system behaves correctly"), implementation-focused ("the database is updated"), or test too many things at once.
- Edge cases and unhappy paths matter as much as the happy path.

Return ONLY valid JSON (no markdown, no extra text):
{
  "feature": "...",
  "feature_description": "...",
  "scenarios": [
    {
      "title": "...",
      "tags": ["..."],
      "given": ["..."],
      "when": "...",
      "then": ["..."],
      "notes": "..."
    }
  ],
  "examples_table": {
    "applicable": true,
    "columns": ["..."],
    "rows": [["..."]]
  },
  "anti_patterns_spotted": ["..."],
  "definition_of_done": ["..."]
}

feature: short feature name. feature_description: 1-2 sentence plain description. scenarios: 3-5 scenarios covering happy path, edge cases, and at least one failure/rejection path. title: short scenario name. tags: 0-2 relevant tags (e.g. "smoke", "regression", "edge-case"). given: 1-3 context lines (arrays of strings). when: single action string. then: 1-3 observable outcome lines. notes: 1 sentence on why this scenario matters or what risk it guards. examples_table: if a scenario could be parametrised with multiple concrete examples, provide column headers and 2-4 example rows; set applicable:false if not relevant. anti_patterns_spotted: 0-3 BDD anti-patterns in the original story or request (e.g. "story describes implementation not behaviour", "acceptance criteria are vague"). definition_of_done: 3-5 concrete done criteria for this feature. Be concise.`;

export const signals = {
  label: 'Write scenarios with concrete examples',
  rationale: 'A feature or story needs precise acceptance criteria — BDD turns it into Given/When/Then scenarios with real values that serve as the definition of done, a regression test, and living documentation simultaneously.',
  keywords: [
    'scenario', 'given when then', 'acceptance criteria', 'bdd', 'behaviour',
    'specification by example', 'gherkin', 'feature', 'user story', 'story',
    'done criteria', 'definition of done', 'concrete example', 'edge case',
    'happy path', 'unhappy path', 'acceptance test', 'living documentation',
    'dan north', 'adzic', 'cucumber',
  ],
};
