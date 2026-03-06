# Domain Model — Risk and Impact Assessor

**Canonical source of truth. Fetch before any session work.**
**URL:** `https://raw.githubusercontent.com/Asspirited/risk-and-impact-assessor/main/.claude/practices/domain-model.md`

---

## Project Identity
- **Name:** Risk and Impact Assessor
- **Purpose:** Agile/BDD project risk and impact assessor with structured persona commentary
- **Repo:** `github.com/Asspirited/risk-and-impact-assessor`
- **Local path:** `/home/rodent/risk-and-impact-assessor`
- **Stack:** Vanilla JS ES modules, Jest, single `index.html` frontend
- **Standards inherited from cusslab:** Gherkin-first BDD/TDD, waste log, pipeline scorecard, session start protocol, SUS + Nielsen before any UI spec

---

## Core Domain Concepts

### Signal
A named observable indicator of project dysfunction. Score 0–5.
**Eleven signals:** unspokenRisk, statusHiding, meetingTheater, scopeChurn, processRigidity, velocityDrift, qualityDrift, teamAttrition, metricsWithoutMeaning, stakeholderPerformance, technicalDebt

### Archetype
One of five named risk patterns. Derived from weighted signal scores.
- **HAUNTED_HOUSE** — Everyone knows. Nobody will say.
- **BOILING_FROG** — Slow degradation nobody has noticed.
- **PAPER_TIGER** — Impressive surface. Nothing behind it.
- **CARGO_CULT** — Performing rituals without understanding them.
- **SLOW_BURN** — Real delivery, but conditions for failure quietly assembling.

### Band
Severity rating derived from archetype score relative to its maximum. Values: LOW, MEDIUM, HIGH, CRITICAL.

### AssessmentReport
Value object produced by the assessment engine. Shape:
```
{
  projectName: string,
  archetype: string,           // ARCHETYPES key
  archetypeLabel: string,
  archetypeDescription: string,
  band: 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL',
  topSignals: string[],        // top 3 signal names by contribution
  recommendation: string,
  rankedArchetypes: Array<{archetype: string, score: number}>
}
```

### Persona
A commentary voice applied to an AssessmentReport. Four personas:
- **WELLER** — Paul Weller. Post-punk, working-class, contemptuous of ceremony.
- **SKEPTIC** — 30-year veteran. Structural realism. No false comfort.
- **COACH** — Experienced agile coach. Real paths forward. Warm but direct.
- **AUDITOR** — Plain, precise, evidence-bound. No editorial.

### Character
A named real-world figure with wound, blind spot, Peacock Suit deployment rule, forbidden behaviours, and documented positions. Currently: Paul Weller (WELLER).

---

## Module Map

| File | Responsibility |
|------|---------------|
| `src/archetypes.js` | Signal validation, archetype scoring, classification, band calculation |
| `src/persona-prompts.js` | System prompt assembly per persona |
| `src/characters.js` | Character roster and Weller commentary prompt builder |
| `characters/weller.md` | Weller source of truth |
| `index.html` | App entry point (to be built) |

---

## Open Items (R2)
- WL-RIA-001: Shared character library across projects
- App scaffold / orchestration layer — next session
- Gherkin for assessment flow — write before implementing orchestration
- Additional personas / characters — spec with research protocol before build

---

## Terminology Rules
- Signal scores are **0–5** (not 1–5, not percentages)
- Bands are: **LOW, MEDIUM, HIGH, CRITICAL** (not tiers, not grades)
- Archetypes are always referred to by label in UI (Haunted House, not HAUNTED_HOUSE)
- Characters: always **Character**, never "bot", "AI persona", "avatar"
- The word "deliverable" is banned from UI copy (Weller constraint bleeds into design)
