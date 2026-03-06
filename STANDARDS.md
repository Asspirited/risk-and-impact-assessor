# Standards — Risk and Impact Assessor

Inherited from cusslab. All standards apply without exception.

## Process
- **Gherkin-first BDD/TDD.** No implementation without a passing Gherkin spec. No exceptions.
- **Scenario Outline + Examples** mandatory when multiple scenarios share structure with different data.
- **Session start protocol:** (1) recent_chats, (2) memory, (3) fetch domain-model.md from GitHub raw URL, (4) pipeline scorecard, (5) work.
- **Pipeline scorecard** at session start and end: build time, failure rate, unit tests, Gherkin passing/skipped, coverage, open bugs, last commit hash.
- **Push after every change.** Confirm origin/main updated.

## Code
- Vanilla JS ES modules. No frameworks unless explicitly decided.
- Coverage minimum: 70% statements, 70% branches.
- Never use Python scripts to patch source files.
- Claude Code output: never collapsible. Always `cmd > /tmp/out.txt && cat /tmp/out.txt`.
- Batch all Claude Code instructions into one paste.

## Design
- Reference SUS and Nielsen's 10 Usability Heuristics explicitly in design rationale before speccing any UI feature.
- "Deliverable" is banned from UI copy.

## Specificity
- Always name exact files, exact paths, exact apps.
- Never say "the file" or "paste this" without naming what and where.

## Waste
- Waste log at `.claude/practices/waste-log.md`.
- Append new entries only. Never rewrite the whole file.
- Identify and log waste proactively — do not wait for Rod to catch it.

## References
- Eric Ries — Lean Startup
- Poppendieck — Lean Software Development
- DORA metrics
- Nielsen's 10 Usability Heuristics
- System Usability Scale (SUS)
