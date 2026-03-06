# Domain Model — Risk and Impact Assessor

**Canonical source of truth. Fetch before any session work.**
**URL:** `https://raw.githubusercontent.com/Asspirited/risk-and-impact-assessor/main/.claude/practices/domain-model.md`

---

## Project Identity
- **Name:** Risk and Impact Assessor
- **Purpose:** Structured project risk and impact assessment with panel analysis, synthesis, and persona commentary
- **Repo:** `github.com/Asspirited/risk-and-impact-assessor`
- **Local path:** `/home/rodent/risk-and-impact-assessor`
- **Stack:** Vanilla JS ES modules, Jest, single `index.html` frontend, Cloudflare Worker proxy
- **Brand colour:** `#1c2041`

---

## Assessment Flow

```
Layer 1 — Input
  28 sub-criteria × 0–5 scores across 7 dimensions

Layer 2 — Computational assessment (no API)
  → 7 dimension scores
  → Archetype classification
  → Trad/Agile spectrum score (0–100)
  → Panel member risk views (Suni, Peter, Davos)
  → Contradiction detection

Layer 3 — Panel analysis (API × 3)
  → Suni statement (Business Stakeholder perspective)
  → Peter statement (Project Manager perspective)
  → Davos statement (Development Team perspective)

Layer 4 — Synthesis (API × 1)
  → Combined analysis
  → Contradictions surfaced
  → Weighted findings (>1 panel member = more weight)
  → Archetype + Trad/Agile applied as analytical lens

Layer 5 — Persona commentary (API × 1, user-triggered)
  → Weller / Skeptic / Coach / Auditor comment on the synthesis
```

---

## Core Domain Concepts

### SubCriterion
A named, scorable observable indicator. Score 0–5. 0 = no concern. 5 = critical concern.

### Dimension
One of seven project risk dimensions. Each contains four sub-criteria.

**SCOPE** — Is the work defined and stable?
- `requirementsClarity` — how well-defined and unambiguous are the requirements?
- `stakeholderAlignment` — do stakeholders agree on what will be delivered?
- `changeFrequency` — how often is scope changing without controlled process?
- `acceptanceCriteria` — are done conditions defined and agreed?

**COST** — Is the financial picture honest and managed?
- `budgetCertainty` — how well-defined and baselined is the budget?
- `contingencyAdequacy` — is sufficient contingency allocated and protected?
- `costTracking` — are actuals being tracked against baseline in real time?
- `financialExposure` — likelihood of material cost overrun given current trajectory?

**TIME** — Is the schedule real?
- `scheduleDefinition` — is there a clear, owned, agreed schedule?
- `milestoneConfidence` — are milestones credible and tracked with owners?
- `deadlineFlexibility` — how fixed and externally imposed are the key dates?
- `criticalPathVisibility` — is the critical path identified and actively managed?

**QUALITY** — Is quality built in or bolted on?
- `qualityStandards` — are standards defined, agreed, and measurable?
- `testingCoverage` — is testing embedded in the process with adequate coverage?
- `technicalDebt` — how much accumulated debt is affecting delivery?
- `nonFunctionalRequirements` — are NFRs defined, testable, and tracked?

**COMPLEXITY** — How hard is this, structurally?
- `technicalComplexity` — novel technology, architectural difficulty, or unproven approach?
- `organisationalComplexity` — number of teams, departments, or governance layers involved?
- `integrationComplexity` — third-party systems, APIs, or data dependencies to integrate?
- `regulatoryComplexity` — legal, regulatory, or audit constraints in play?

**UNCERTAINTY** — How much do we not know?
- `requirementsUncertainty` — how much of what's needed is still unknown or volatile?
- `technicalUncertainty` — unproven technology, unknowns in the build approach?
- `stakeholderUncertainty` — key stakeholder positions unclear, contested, or likely to shift?
- `externalUncertainty` — market, political, team, or environmental factors outside project control?

**RAID** — Does the project know what it doesn't know?
- `riskVisibility` — are risks identified, logged, owned, and mitigated?
- `issueResolution` — are issues being actively resolved, or accumulating unmanaged?
- `assumptionValidity` — are critical assumptions documented and being tested?
- `dependencyConfidence` — are external dependencies tracked, owned, and confirmed?

### DimensionScore
Computed value per dimension: average of its four sub-criteria scores. Range 0–5.

### Archetype
One of five named risk patterns. Derived from weighted sub-criteria scores.
- **HAUNTED_HOUSE** — Everyone knows. Nobody will say.
  Weights: riskVisibility:3, issueResolution:3, assumptionValidity:2, dependencyConfidence:2
- **BOILING_FROG** — Slow degradation nobody has noticed.
  Weights: milestoneConfidence:3, technicalDebt:3, qualityStandards:2, changeFrequency:2
- **PAPER_TIGER** — Impressive surface. Nothing behind it.
  Weights: costTracking:3, stakeholderAlignment:3, milestoneConfidence:2, qualityStandards:2
- **CARGO_CULT** — Performing rituals without understanding them.
  Weights: organisationalComplexity:3, testingCoverage:3, qualityStandards:2, nonFunctionalRequirements:2
- **SLOW_BURN** — Real delivery, but conditions for failure quietly assembling.
  Weights: technicalDebt:3, integrationComplexity:3, technicalComplexity:2, dependencyConfidence:2

### TradAgileScore
Numeric 0–100. Derived from agile-indicator sub-criteria.
- 0–30: Traditional
- 31–70: Hybrid
- 71–100: Agile

Agile indicators: requirementsUncertainty:3, technicalUncertainty:3, changeFrequency:2, technicalComplexity:2, integrationComplexity:2, externalUncertainty:2

### Band
Severity rating: LOW, MEDIUM, HIGH, CRITICAL. Derived from archetype score relative to its maximum.

### PanelMember
A named character who analyses the assessment from their role's perspective.
Three members: Suni (Business Stakeholder), Peter (Project Manager), Davos (Development Team).
Each has: dimension weights, blind spots, documented positions.
Each produces: a PanelStatement.

**Suni — Business Stakeholder**
Dimension weights: Scope:3, Cost:5, Time:4, Quality:1, Complexity:0, Uncertainty:2, RAID:1
Blind spots: optimism bias at initiation; self-initiated scope creep; assumption blindness; underestimates change impact on the business; technical debt invisible until public failure.
Documented positions: ROI and business case primary lens; scope fixed once signed off; timeline driven by business events; issues are escalation triggers; risk appetite high at initiation, low when things go wrong.

**Peter — Project / Programme Manager**
Dimension weights: Scope:4, Cost:4, Time:5, Quality:2, Complexity:3, Uncertainty:3, RAID:5
Blind spots: plan confidence inflation; RAG washing; process over substance; optimistic dependency management; team health blind spot; technical risk underestimation.
Documented positions: scope/cost/time triangle primary framework; RAG status is communication currency; risk management means logging and mitigating; dependencies are biggest delivery failure source; issues need owners and due dates.

**Davos — Development Team**
Dimension weights: Scope:3, Cost:1, Time:4, Quality:5, Complexity:5, Uncertainty:5, RAID:4
Blind spots: perfectionism / gold-plating; scope conservatism; communication gap (technical risk not translated); assumption of autonomy; change impact underestimation (inverse); external dependency optimism.
Documented positions: technical feasibility non-negotiable; technical debt is a present risk; estimates are probabilities not commitments; requirements change costs more than stakeholders think; integration and external dependencies are the hardest problems; quality shortcuts cause the date to be missed anyway.

### PanelStatement
Output from a single panel member. Contains:
- `member`: panel member key
- `dimensionViews`: object mapping each dimension to { score, weight, weightedScore, flagged }
- `flaggedDimensions`: dimensions where weightedScore > threshold
- `summaryPrompt`: assembled system prompt for AI narrative generation

### Contradiction
A dimension where two or more panel members' flagged status differs.
Detected algorithmically. Surfaced in the SynthesisReport.
Example: Peter does not flag COMPLEXITY (weight:3, score:2 → 6), Davos flags COMPLEXITY (weight:5, score:2 → 10).

### WeightedFinding
A flagged dimension with a consensus count.
- 3 members flag → CRITICAL consensus
- 2 members flag → HIGH consensus
- 1 member flags → MEDIUM (single perspective)

### SynthesisReport
The assembled output of all layers. Shape:
```
{
  projectName: string,
  dimensionScores: { SCOPE: 0-5, COST: 0-5, TIME: 0-5, QUALITY: 0-5, COMPLEXITY: 0-5, UNCERTAINTY: 0-5, RAID: 0-5 },
  archetype: string,
  archetypeLabel: string,
  archetypeDescription: string,
  band: 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL',
  tradAgileScore: 0-100,
  tradAgileLabel: 'Traditional'|'Hybrid'|'Agile',
  panelViews: { SUNI: PanelView, PETER: PanelView, DAVOS: PanelView },
  contradictions: Contradiction[],
  weightedFindings: WeightedFinding[],
  topSignals: string[],
  recommendation: string
}
```

### Persona
A commentary voice that comments on the SynthesisReport. Four personas: WELLER, SKEPTIC, COACH, AUDITOR.
Unchanged from V1. Now receive SynthesisReport instead of basic AssessmentReport.

---

## Module Map

| File | Responsibility |
|---|---|
| `src/dimensions.js` | Sub-criteria definitions, validation, dimension scoring |
| `src/archetypes.js` | Archetype scoring and classification (28 sub-criteria weights) |
| `src/trad-agile.js` | Trad/Agile spectrum scoring |
| `src/panel.js` | Panel member definitions, dimension weighting, prompt assembly |
| `src/synthesis.js` | Contradiction detection, weighted findings, synthesis prompt |
| `src/assess.js` | Orchestration — assembles SynthesisReport from all modules |
| `src/persona-prompts.js` | Persona prompt assembly (updated for SynthesisReport) |
| `src/characters.js` | Character roster (Suni, Peter, Davos + Weller) |
| `characters/suni.md` | Suni source of truth |
| `characters/peter.md` | Peter source of truth |
| `characters/davos.md` | Davos source of truth |
| `characters/weller.md` | Weller source of truth |
| `index.html` | App entry point |
| `worker/index.js` | Cloudflare Worker proxy |

---

## Open Backlog
- WL-RIA-003: Composite archetype detection — when two archetypes score within threshold of each other, surface both
- WL-RIA-001: Shared character library across projects (cusslab crossover)

---

## Terminology Rules
- Sub-criteria scores are **0–5** (not 1–5, not percentages)
- Bands: **LOW, MEDIUM, HIGH, CRITICAL**
- Trad/Agile label: **Traditional, Hybrid, Agile**
- Panel members: **Suni, Peter, Davos** (always first name)
- Personas: **Weller, Skeptic, Coach, Auditor**
- Never "bot", "AI persona", "avatar" — always **Character** or **Persona**
- "Deliverable" banned from UI copy
