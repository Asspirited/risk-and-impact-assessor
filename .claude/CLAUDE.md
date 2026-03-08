# CLAUDE.md — Risk and Impact Assessor (RIA)
# Last updated: 2026-03-08

---

## Project identity
- **Name:** Risk and Impact Assessor
- **Repo:** `/home/rodent/risk-and-impact-assessor/` — canonical working copy
- **Secondary:** `/home/rodent/ria/` — same origin, used for experimental work
- **Live:** https://asspirited.github.io/risk-and-impact-assessor/
- **Worker:** `https://ria-proxy.leanspirited.workers.dev/commentary`
- **Worker API:** POST `{ systemPrompt, userMessage }` → `{ commentary: string }`
- **Max tokens:** 1024 — compact JSON prompts needed for structured tools

## What this project is
Quality tools for project risk and impact assessment. RAID analysis (Risks, Issues,
Assumptions, Dependencies). Tool recommender suggests tools after RAID based on
selectedRaidType. Not comedy. Not characters. Not panels.

## Architecture
- Single page app — same pattern as Cusslab (single HTML, no framework, no build step)
- Quality tools: sidebar (permanent desktop, drawer mobile). 7 live tools, 4 backlog stubs.
- Tools load in main content area (RIA-022+). Sidebar is nav-only.

## ACC framework — CORRECT DEFINITION
Real ACC = **Attributes, Components, Capabilities** (James Whittaker, Google)
- NOT "Assumptions, Constraints, Concerns" — that label is wrong and needs fixing
- **Attributes** — business goals/qualities the product must satisfy (scored 1–5)
- **Components** — parts/subsystems of the product
- **Capabilities** — what users can do; each mapped to components, scored against attributes
- Sources: Whittaker (Google test analytics); Adzic & Evans — 50 Quick Ideas to Improve
  Your Tests (ACC as coverage heuristic: Capabilities through Components against Attributes)
- BL item open: fix the label in the UI from "Assumptions/Constraints/Concerns" to correct

## Project separation rule
If a request is about quality tools, project risk, RAID, improvement frameworks → this project.
If about comedy, panels, characters, hecklers → Cusslab (`/home/rodent/cusslab/`).
Wrong project = waste log entry.
