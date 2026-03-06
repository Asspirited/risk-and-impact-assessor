# Waste Log — Risk and Impact Assessor

Format: WL-RIA-NNN | Date | Type | Description | Status

---

WL-RIA-001
Date: 2026-03-06
Type: R2 backlog — shared character library
Description: Weller character data duplicated between risk-and-impact-assessor/characters/weller.md and potential future cusslab crossover. R2: evaluate shared npm workspace, git submodule, or symlink approach. Neither app should own shared character data.
Status: OPEN

WL-RIA-003
Date: 2026-03-06
Type: Backlog — composite archetype detection
Description: Projects can exhibit multiple archetypes simultaneously (e.g. Haunted House + Slow Burn). Current model returns a single dominant archetype. R2: model composite archetypes — detect when two or more archetypes score within a threshold of each other, surface both, and generate commentary that addresses the combined pattern. Needs Gherkin before implementation.
Status: OPEN — backlog

WL-RIA-002
Date: 2026-03-06
Type: Rebuild from scratch instead of reusing session downloads
Description: Previous session files existed in user Downloads but project rebuilt from scratch due to no local repo being initialised. Cost: ~1 session. Fix: always scaffold GitHub repo + local path at end of first session, never leave files only in downloads.
Status: OPEN — process fix needed
