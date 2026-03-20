# Khuym Skill Ecosystem: Complete Architecture

**Version:** 1.0-draft  
**Date:** 2026-03-20  
**Author:** Designed for hoang@kieng.io.vn  
**Based on:** 18 research documents, 80+ academic papers, 3 framework primary sources  
**Repo:** github.com/hoangnb24/skills (branch: feature/khuym)

---

## 1. Overview

Khuym is a **9-skill ecosystem** for autonomous multi-agent software development. It replaces the existing planning/orchestrator/worker/knowledge/issue-resolution skills with a unified series that learns from Superpowers, GSD, and Compound Engineering.

### Core Infrastructure (unchanged)
- **beads** (`bd` CLI) — task tracking, dependencies, priorities, status
- **bv** (bead viewer) — graph analysis, parallel track computation, robot-plan
- **Agent Mail** — cross-agent communication, file reservations, context persistence

### Design Principles (extracted from all three frameworks)

| Principle | Source | How Khuym Applies |
|---|---|---|
| Flat namespace | Superpowers (14 flat skills) | All 9 skills at one directory level |
| Skills are prompt expansions | Superpowers | Each skill = SKILL.md + references. No processes, no servers |
| User-driven phase transitions | GSD (user types next command) | Each skill ends with "next step" suggestion. User decides |
| Full-auto mode available | Compound (/lfg) | `go` skill chains all phases automatically |
| Fresh context per agent | All three frameworks | Every spawned subagent gets clean context window |
| File-based state | GSD (.planning/) + Compound (docs/solutions/) | `.khuym/` directory + `history/learnings/` |
| Advisory, never imperative | GSD (hooks design principle) | Context monitoring is advisory. Skill text suggests, doesn't force |
| Persuasion psychology | Superpowers (writing-skills) | All skills use authority framing, commitment devices, rationalization tables |
| TDD-for-skills | Superpowers (writing-skills) | Every skill has pressure tests. writing-khuym-skills teaches the methodology |
| Compound knowledge loop | Compound (/ce:compound) | Compounding skill captures learnings → planning skill retrieves them |
| Beads as atomic unit | Existing system | Never replaced. beads ARE the task state |

---

## 2. The 9 Skills

```
┌─────────────────────────────────────────────────────────────────────┐
│                        KHUYM SKILL SERIES                            │
│                                                                      │
│   Session Start → using-khuym (bootstrap, always loaded)             │
│                                                                      │
│   Workflow Chain:                                                     │
│                                                                      │
│   brainstorming → planning → orchestrating → [executing ×N] →       │
│   reviewing → compounding → finishing                                │
│                                                                      │
│   Meta:                                                              │
│   writing-khuym-skills (create new skills for the ecosystem)         │
│                                                                      │
│   Support (standalone, invoked when needed):                         │
│   debugging (from any phase when issues arise)                       │
│   gkg (codebase intelligence, invoked by planning + executing)       │
│                                                                      │
│   Full-auto: go (chains brainstorming → finishing automatically)     │
│                                                                      │
│   Total: 9 skills + 2 support skills = 11                           │
└─────────────────────────────────────────────────────────────────────┘
```

Wait — let me reconsider. You said 9 skills. Let me keep it to 9 by integrating gkg into planning/executing (as it currently is) and making "go" a mode within using-khuym rather than a separate skill. Debugging stays as one of the 9.

### Final 9 Skills

| # | Skill Name | Role | Inspired By | Est. Lines |
|---|---|---|---|---|
| 1 | `using-khuym` | Bootstrap/meta. Lists all skills, priority rules, red flags. Loaded at session start | Superpowers `using-superpowers` | 100-150 |
| 2 | `brainstorming` | Explore requirements, gray areas, constraints before planning | Superpowers `brainstorming` + GSD `discuss-phase` + CE `ce:brainstorm` | 200-300 |
| 3 | `planning` | Discovery → Synthesis → Spikes → Bead decomposition → Track planning | Existing `planning` skill (refined) | 350-400 |
| 4 | `orchestrating` | Spawn parallel workers, monitor via Agent Mail, handle blockers | Existing `orchestrator` (refined) + GSD wave execution | 250-300 |
| 5 | `executing` | Execute beads within a track via Agent Mail | Existing `worker` (refined) | 250-300 |
| 6 | `reviewing` | Dispatch 4-5 review agents, prioritize findings (P1/P2/P3), gate merge | CE `ce:review` + GSD `verify-work` + Superpowers `requesting-code-review` | 200-300 |
| 7 | `compounding` | Capture learnings (patterns/decisions/failures) to `history/learnings/` | CE `ce:compound` + Pink et al. episodic memory | 200-250 |
| 8 | `finishing` | Branch cleanup, PR creation, bead close-out, tag release | Superpowers `finishing-a-development-branch` + GSD `complete-milestone` | 150-200 |
| 9 | `writing-khuym-skills` | Meta: create new skills for khuym. TDD-for-skills methodology | Superpowers `writing-skills` (full methodology) | 400-500 |

**Total estimated:** ~2,100-2,700 lines across 9 SKILL.md files + reference files

---

## 3. Skill Details

### 3.1 using-khuym (Bootstrap)

**Source inspiration:** Superpowers `using-superpowers` (115 lines, 5.1 KB)

**Responsibility:**
- Injected at session start (hook or manual invocation)
- Lists all 9 skills with triggering conditions
- Defines skill priority ordering
- Provides the red flags / rationalization table
- Explains full-auto "go" mode

**Chaining rules:**
```
Priority order:
1. Process skills first: brainstorming → planning (determines HOW to approach)
2. Execution skills second: orchestrating → executing (does the work)
3. Quality skills third: reviewing → compounding → finishing (ensures quality)

Rule: "Build X" → brainstorming FIRST, then planning
Rule: "Fix this bug" → debugging FIRST
Rule: "Quick fix" → skip brainstorming, go directly to planning (lightweight mode)
```

**Full-auto "go" mode:**
```
When user says "go" or "lfg" or "full auto":
Chain: brainstorming → planning → orchestrating → [executing] → reviewing → compounding → finishing

GATES (always stop for human):
- After brainstorming: "Approve requirements?"
- After planning: "Approve plan and bead decomposition?"
- After reviewing (P1 findings): "P1 issues found. Fix before continuing?"
```

**File structure:**
```
skills/using-khuym/
├── SKILL.md
└── references/
    └── tool-mappings.md    ← Tool name mappings for different platforms
```

### 3.2 brainstorming

**Source inspiration:** Superpowers `brainstorming` (164 lines) + GSD `discuss-phase` (850 lines workflow) + CE `ce:brainstorm` + Elicitron (2024 academic)

**Responsibility:**
- Explore what the user wants before committing to a plan
- Identify gray areas (GSD: domain-aware SEE/CALL/RUN/READ/ORGANIZE classification)
- Ask one question at a time (academic: Elicitron shows higher quality than batch)
- Produce a CONTEXT document that downstream skills read
- NOT responsible for codebase analysis (that's planning's job)

**Process (7 phases from research synthesis):**
```
Phase 0: Scope Assessment
  → Quick/standard/deep based on request complexity
  → Read history/learnings/critical-patterns.md if exists

Phase 1: Domain Classification (from GSD)
  → SEE (visual) / CALL (API) / RUN (execution) / READ (content) / ORGANIZE (structure)
  → Each type has specific gray area probes

Phase 2: Gray Area Identification
  → For each domain type, identify 2-4 gray areas
  → Gray areas = decisions that affect implementation but aren't specified

Phase 3: Socratic Exploration (from Superpowers)
  → One question at a time (from Elicitron research)
  → 3-4 questions per gray area
  → HARD-GATE: wait for user response before next question

Phase 4: Decision Capture
  → Lock each decision with user confirmation
  → Assign stable IDs (D1, D2, D3...) (from CE)

Phase 5: Requirement Assembly
  → Write history/<feature>/CONTEXT.md
  → Include: decisions, constraints, out-of-scope items
  → Include: code_context section (relevant existing patterns found by quick grep)

Phase 6: Self-Review (from Superpowers spec-document-reviewer)
  → Dispatch subagent to review CONTEXT.md for gaps
  → Max 2 iterations

Phase 7: Handoff
  → "Requirements captured. Invoke planning skill to create implementation plan."
```

**Output:** `history/<feature>/CONTEXT.md`

**Prohibited actions:**
- Writing any code (including pseudocode)
- Creating implementation files
- Running build commands
- Suggesting specific library versions

**File structure:**
```
skills/brainstorming/
├── SKILL.md
└── references/
    └── context-reviewer-prompt.md    ← Subagent prompt for Phase 6
```

### 3.3 planning

**Source inspiration:** Existing `planning` skill (422 lines) — refined and enhanced

**Responsibility:**
- Read CONTEXT.md from brainstorming (or accept direct feature request for quick mode)
- Discovery: parallel sub-agents explore codebase (gkg), external patterns, constraints
- Synthesis: gap analysis, approach options, risk assessment
- Spikes: for HIGH risk items, create spike beads and execute
- Decomposition: create beads with `bd create`
- Validation: `bv --robot-suggest`, `bv --robot-insights`
- Track planning: `bv --robot-plan` → execution-plan.md

**Changes from existing:**
- Reads `history/learnings/` at start (compound knowledge retrieval — from CE learnings-researcher)
- Always reads `history/learnings/critical-patterns.md` if it exists
- Grep `history/learnings/` by tags matching the feature domain
- Inject retrieved learnings into discovery context
- Better handoff format for orchestrating skill

**Key addition: Learnings retrieval (from Compound Engineering)**
```
Before Phase 1 (Discovery):
1. Read history/learnings/critical-patterns.md (always)
2. grep -l "tags:.*<feature-keywords>" history/learnings/*.md
3. Read matching entries (max 5)
4. Include relevant learnings in discovery context
```

**Output artifacts:**
- `history/<feature>/discovery.md`
- `history/<feature>/approach.md`
- `.spikes/<feature>/` (if applicable)
- `.beads/*.md` (bead files)
- `history/<feature>/execution-plan.md`

**File structure:**
```
skills/planning/
├── SKILL.md
└── references/
    └── plan-reviewer-prompt.md    ← Subagent prompt for plan validation
```

### 3.4 orchestrating

**Source inspiration:** Existing `orchestrator` skill (292 lines) + GSD wave execution + CE parallel dispatch

**Responsibility:**
- Read `history/<feature>/execution-plan.md`
- Initialize Agent Mail (ensure_project, register_agent)
- Analyze dependencies → compute waves (from GSD wave model)
- Spawn parallel worker subagents via Task tool (one per track)
- Monitor progress via Agent Mail
- Handle cross-track blockers and file conflicts
- After all waves: trigger reviewing skill (or suggest it)

**Changes from existing:**
- Wave-based execution (from GSD): group beads by dependency, execute independent beads in parallel
- Context monitoring: at each wave completion, check context usage. If >65%, write HANDOFF.json and suggest pause
- STATE.md updates: write current wave/track status to `.khuym/STATE.md`
- Plan-checker verification before execution (from GSD): validate beads against CONTEXT.md before spawning workers

**State tracking:**
```
.khuym/STATE.md (updated by orchestrating):
  current_feature: <feature-name>
  current_wave: 2
  tracks:
    BlueLake: { status: complete, beads_done: [bd-10, bd-11] }
    GreenCastle: { status: in_progress, current_bead: bd-20 }
  blockers: []
  decisions: [{ id: D1, choice: "Use REST", context: "..." }]
```

**File structure:**
```
skills/orchestrating/
├── SKILL.md
└── references/
    ├── worker-template.md        ← Template for spawning worker subagents
    └── message-templates.md      ← Agent Mail message formats
```

### 3.5 executing

**Source inspiration:** Existing `worker` skill (285 lines) — refined

**Responsibility:**
- Execute beads within an assigned track
- Maintain context via Agent Mail (track thread)
- Use gkg for codebase exploration, morph for edits
- Report progress to orchestrator
- Save context for next bead (self-addressed mail)

**Changes from existing:**
- Context checkpoint: after each bead, check context usage. If >65%, write HANDOFF.json to track thread and complete gracefully
- Bead-boundary discipline: never start a new bead if context is >70% used
- Atomic commits per bead: `git commit -m "feat(<bead-id>): <summary>"`

**File structure:**
```
skills/executing/
└── SKILL.md
```

### 3.6 reviewing

**Source inspiration:** CE `ce:review` (14 agents) + GSD `verify-work` + Superpowers `requesting-code-review`

**Responsibility:**
- Dispatch 4-5 specialized review agents in parallel
- Collect findings, prioritize as P1/P2/P3
- P1 = blocks merge (must fix). P2 = should fix. P3 = record for future
- Present findings to user for triage
- After P1 resolution: proceed to compounding

**Review agents (4 core + 1 always-last):**

| Agent | Focus | Inspired By |
|---|---|---|
| `code-quality` | Simplicity, readability, naming, dead code, DRY | CE `code-simplicity-reviewer` |
| `architecture` | Patterns, separation of concerns, coupling, API design | CE `architecture-strategist` |
| `security` | OWASP top-10, injection, auth, data exposure | CE `security-sentinel` |
| `test-coverage` | Missing tests, edge cases, untested paths | GSD `gsd-nyquist-auditor` |
| `learnings-synthesizer` | Cross-reference past learnings, synthesize findings, suggest compounding | CE `learnings-researcher` (always runs last) |

**Dispatch mechanism (from CE + academic):**
```
4 agents or fewer: parallel (all at once via Task tool)
5+ agents: parallel with max 4 concurrent (auto-serial for remainder)

Each agent gets:
- Fresh context window (no session history)
- The diff/changed files only
- CONTEXT.md (requirements)
- execution-plan.md (what was supposed to happen)
```

**Finding format:**
```markdown
## P1: <title>
**File:** <path>:<line>
**Issue:** <description>
**Fix:** <suggested fix>
**Rationale:** <why this matters>
```

**Post-review: 3-level artifact verification (from GSD gsd-verifier):**
```
Level 1: Artifact EXISTS (file was created)
Level 2: Artifact is SUBSTANTIVE (not a stub/placeholder)
Level 3: Artifact is WIRED (imported, used, integrated)
```

**File structure:**
```
skills/reviewing/
├── SKILL.md
└── references/
    ├── code-quality-prompt.md
    ├── architecture-prompt.md
    ├── security-prompt.md
    ├── test-coverage-prompt.md
    └── learnings-synthesizer-prompt.md
```

### 3.7 compounding

**Source inspiration:** CE `ce:compound` (6 subagents) + Pink et al. (2025) episodic memory + arXiv:2603.10600 trajectory memory

**Responsibility:**
- After reviewing: capture what was learned during the feature
- Three categories: Patterns, Decisions, Failures (from CE taxonomy)
- Write one file to `history/learnings/` per compound invocation
- Check if any existing entries should be marked stale
- Promote critical/high-severity failures to `history/learnings/critical-patterns.md`

**Process (4 phases):**
```
Phase 0: Scan existing learnings
  → grep history/learnings/ for related priors
  → Identify if this is an UPDATE to an existing entry or NEW

Phase 1: Parallel analysis (3 subagents)
  → Agent A: Context analyzer — what was the problem, environment, constraints
  → Agent B: Solution extractor — what worked, code examples, key decisions
  → Agent C: Category classifier — pattern/decision/failure + tags + severity

Phase 2: Assembly (orchestrator writes single file)
  → Merge subagent outputs into one YAML-frontmatter document
  → Write to history/learnings/YYYYMMDD-<slug>.md

Phase 3: Maintenance
  → Check if existing entries are invalidated by this new learning
  → Mark stale entries: status: stale, stale_reason, stale_date
  → If severity is critical/high → append to critical-patterns.md
```

**File format for `history/learnings/*.md`:**
```yaml
---
title: "Use constructEvent() for Stripe webhook verification"
category: pattern          # pattern | decision | failure
severity: medium           # critical | high | medium | low
tags: [stripe, webhooks, signature-verification, payments]
related_beads: [bd-42, bd-45]
date: 2026-03-20
status: active             # active | stale
stale_reason: ""
stale_date: ""
---

## Context
<What problem were we solving? What constraints?>

## Solution
<What worked? Code examples if applicable>

## Key Insight
<The one-sentence takeaway>

## Prevention
<How to avoid this issue in the future>
```

**Optional CASS integration:**
```
If CASS is available (detected via mcp__cass__search):
  → After writing file, also index in CASS for semantic retrieval
  → Planning skill can use CASS search in addition to grep
```

**File structure:**
```
skills/compounding/
├── SKILL.md
└── references/
    ├── analyzer-prompt.md
    ├── extractor-prompt.md
    └── classifier-prompt.md
```

### 3.8 finishing

**Source inspiration:** Superpowers `finishing-a-development-branch` + GSD `complete-milestone`

**Responsibility:**
- Verify all beads in the epic are closed (`bv --robot-triage --graph-root <epic-id>`)
- Run final build/test verification
- Create PR (or offer options: merge directly, create PR, keep branch, discard)
- Clean up worktree if used
- Close epic bead
- Send completion summary via Agent Mail
- Update `.khuym/STATE.md` to clear current feature

**Process:**
```
Step 1: Verify completeness
  → bv --robot-triage --graph-root <epic-id>
  → All open_count must be 0
  → If not: list remaining beads, ask user

Step 2: Final verification
  → Run build: <project build command>
  → Run tests: <project test command>
  → Run lint: <project lint command>

Step 3: Git operations
  → Present options:
    A. Create PR (recommended for team projects)
    B. Merge to main (for solo projects)
    C. Keep branch (for later review)
    D. Discard (abandon work)

Step 4: Cleanup
  → If worktree used: bd worktree remove .worktrees/<feature-name>
  → Close epic: bd close <epic-id> --reason "<summary>"
  → Update .khuym/STATE.md: clear current_feature

Step 5: Summary
  → Send completion summary via Agent Mail
  → "Feature complete. Consider running compounding skill to capture learnings."
```

**File structure:**
```
skills/finishing/
└── SKILL.md
```

### 3.9 writing-khuym-skills

**Source inspiration:** Superpowers `writing-skills` (655 lines + 5 reference files) — the most detailed meta-skill

**Responsibility:**
- Guide creation of new skills for the khuym ecosystem
- Enforce TDD-for-skills methodology (RED-GREEN-REFACTOR)
- Teach persuasion psychology for skill compliance
- Enforce SKILL.md format standards
- Include CREATION-LOG pattern

**Process (from Superpowers, fully adopted):**
```
RED Phase:
1. Create 3+ pressure test scenarios (combined pressures: time + authority + economic)
2. Run scenarios WITHOUT the skill — document agent rationalizations verbatim
3. Identify patterns in failures

GREEN Phase:
1. Write minimal SKILL.md addressing specific failures from RED
2. YAML frontmatter: name + description only. Max 1024 chars
3. Description: triggering conditions ONLY (never summarize workflow)
4. Run same scenarios WITH skill — verify compliance
5. If agent still fails: identify which rationalizations survive → add counters

REFACTOR Phase:
1. Build rationalization table from all test iterations
2. Create Red Flags list
3. Add authority framing, commitment devices
4. Add "REQUIRED SUB-SKILL" and "REQUIRED BACKGROUND" references
5. Re-test until bulletproof
6. Write CREATION-LOG.md documenting the entire process
```

**Persuasion techniques (from Superpowers persuasion-principles.md):**
```
1. Authority framing: "This skill was developed through analysis of 3 frameworks..."
2. Commitment devices: "Before proceeding, confirm you have completed step N"
3. Scarcity signals: "This is the ONLY opportunity to capture context before..."
4. Social proof: "Both Superpowers and GSD independently converge on this pattern"
5. Rationalization tables: Pre-counter every "but I can skip this because..."
6. Red flags list: Observable symptoms that agent is about to violate skill
7. Downstream awareness: Explain what breaks if you skip this step
```

**File structure:**
```
skills/writing-khuym-skills/
├── SKILL.md
├── CREATION-LOG-TEMPLATE.md
└── references/
    ├── persuasion-principles.md
    ├── anthropic-best-practices.md
    ├── pressure-test-template.md
    └── skill-review-checklist.md
```

---

## 4. Support Skills (Not Counted in Core 9, but Part of Ecosystem)

### 4.1 debugging

**Source inspiration:** Existing `issue-resolution` skill + Superpowers `systematic-debugging` + GSD `gsd-debugger`

**Responsibility:**
- Invoked from any phase when unexpected behavior occurs
- Systematic root-cause tracing (not guessing)
- Uses gkg for codebase exploration
- Saves learnings for compounding skill

**This is the existing issue-resolution skill, renamed and refined. Invokable standalone.**

### 4.2 gkg (Git Knowledge Graph)

**Source inspiration:** User's preference to make GKG a separate skill

**Responsibility:**
- Provides codebase intelligence tools: repo_map, search_definitions, get_references, import_usage
- Invoked by planning (Phase 1: Discovery) and executing (Step 2: Explore)
- Wraps GKG MCP tools with khuym-specific conventions

**Rationale for separate skill:** As GKG evolves and more tools are added (OpenCode DCP pruning), having it as a separate skill allows independent updates without touching planning/executing.

---

## 5. Directory Structure

### In the skills repo (github.com/hoangnb24/skills)

```
skills/
├── using-khuym/
│   ├── SKILL.md
│   └── references/
│       └── tool-mappings.md
├── brainstorming/
│   ├── SKILL.md
│   └── references/
│       └── context-reviewer-prompt.md
├── planning/
│   ├── SKILL.md
│   └── references/
│       └── plan-reviewer-prompt.md
├── orchestrating/
│   ├── SKILL.md
│   └── references/
│       ├── worker-template.md
│       └── message-templates.md
├── executing/
│   └── SKILL.md
├── reviewing/
│   ├── SKILL.md
│   └── references/
│       ├── code-quality-prompt.md
│       ├── architecture-prompt.md
│       ├── security-prompt.md
│       ├── test-coverage-prompt.md
│       └── learnings-synthesizer-prompt.md
├── compounding/
│   ├── SKILL.md
│   └── references/
│       ├── analyzer-prompt.md
│       ├── extractor-prompt.md
│       └── classifier-prompt.md
├── finishing/
│   └── SKILL.md
├── writing-khuym-skills/
│   ├── SKILL.md
│   ├── CREATION-LOG-TEMPLATE.md
│   └── references/
│       ├── persuasion-principles.md
│       ├── anthropic-best-practices.md
│       ├── pressure-test-template.md
│       └── skill-review-checklist.md
├── debugging/
│   └── SKILL.md
└── gkg/
    └── SKILL.md
```

### In the user's project (at runtime)

```
project-root/
├── .khuym/
│   ├── STATE.md              ← Working memory (current focus, decisions, blockers)
│   ├── config.json           ← Feature flags (absent=enabled)
│   └── HANDOFF.json          ← Pause/resume state
├── .beads/                   ← Bead files (managed by bd CLI)
├── .spikes/                  ← Spike implementations
├── history/
│   ├── <feature>/
│   │   ├── CONTEXT.md        ← Brainstorming output
│   │   ├── discovery.md      ← Planning Phase 1 output
│   │   ├── approach.md       ← Planning Phase 2 output
│   │   └── execution-plan.md ← Planning Phase 6 output
│   └── learnings/
│       ├── critical-patterns.md        ← Always-read file (high/critical severity)
│       ├── 20260320-stripe-webhooks.md ← Individual learning entries
│       └── 20260321-auth-patterns.md
└── .worktrees/               ← Git worktrees for feature isolation
```

---

## 6. Chaining Map

### Full Chain (brainstorming → finishing)

```
USER: "Build feature X"
│
├── using-khuym (always loaded) → determines: this needs brainstorming
│
▼
brainstorming
│ Output: history/<feature>/CONTEXT.md
│ Handoff: "Invoke planning skill"
▼
planning
│ Reads: CONTEXT.md + history/learnings/
│ Output: .beads/*.md + history/<feature>/execution-plan.md
│ Handoff: "Invoke orchestrating skill"
▼
orchestrating
│ Reads: execution-plan.md
│ Spawns: parallel worker subagents (Task tool)
│ Monitors: Agent Mail
│ Updates: .khuym/STATE.md
│ Handoff: "All tracks complete. Invoke reviewing skill."
│
├── executing (×N parallel, one per track)
│   │ Each worker: reads beads → implements → reports via Agent Mail
│   │ Atomic commits per bead
│   └── Returns to orchestrating when track complete
│
▼
reviewing
│ Dispatches: 5 review agents in parallel
│ Output: P1/P2/P3 findings
│ GATE: P1 findings require human approval before continuing
│ After P1 resolved: "Invoke compounding skill"
▼
compounding
│ Dispatches: 3 analysis subagents
│ Output: history/learnings/YYYYMMDD-<slug>.md
│ Handoff: "Invoke finishing skill"
▼
finishing
│ Verifies: all beads closed, build passes, tests pass
│ Actions: create PR / merge / cleanup
│ Output: .khuym/STATE.md cleared
│ DONE
```

### Quick Fix Chain (skip brainstorming)

```
USER: "Quick fix: update the timeout to 30s"
│
├── using-khuym → determines: quick fix, skip brainstorming
│
▼
planning (lightweight mode)
│ Skip discovery/synthesis/spikes
│ Create single bead
│ Handoff: "Invoke orchestrating skill (single track)"
▼
orchestrating → executing (single worker)
│
▼
reviewing (optional, user decides)
│
▼
finishing
```

### Bug Fix Chain

```
USER: "This endpoint returns 500"
│
├── using-khuym → determines: debugging first
│
▼
debugging
│ Systematic root-cause tracing
│ Fix implemented
│
▼
reviewing (optional)
│
▼
compounding (capture what caused the bug → failure entry)
│
▼
finishing
```

### Full-Auto "Go" Mode

```
USER: "go: Add dark mode toggle"
│
├── using-khuym → activates go mode
│
▼ (all automatic, 3 human gates)
brainstorming → GATE: "Approve requirements?" → user approves →
planning → GATE: "Approve plan?" → user approves →
orchestrating → executing (parallel) →
reviewing → GATE if P1: "P1 issues. Fix?" → user approves →
compounding → finishing → DONE
```

---

## 7. State Management

### .khuym/STATE.md

```markdown
# Khuym State

## Current Feature
name: dark-mode-toggle
epic: bd-100
phase: executing
wave: 2 of 3

## Active Tracks
| Track | Agent | Status | Current Bead |
|-------|-------|--------|-------------|
| 1 | BlueLake | complete | — |
| 2 | GreenCastle | in_progress | bd-105 |
| 3 | RedStone | pending | — |

## Decisions
- D1: Use CSS custom properties for theme switching (from brainstorming)
- D2: Store preference in localStorage (from brainstorming)

## Blockers
(none)

## Context Usage
Last checkpoint: 45% used (after wave 1 completion)
```

### .khuym/config.json

```json
{
  "review_agents": ["code-quality", "architecture", "security", "test-coverage"],
  "auto_compound": true,
  "cass_enabled": false,
  "context_warning_threshold": 65,
  "context_critical_threshold": 80
}
```

### .khuym/HANDOFF.json (written on pause)

```json
{
  "timestamp": "2026-03-20T16:30:00+07:00",
  "feature": "dark-mode-toggle",
  "epic_id": "bd-100",
  "phase": "executing",
  "wave": 2,
  "completed_beads": ["bd-101", "bd-102", "bd-103"],
  "current_bead": "bd-105",
  "remaining_beads": ["bd-106", "bd-107"],
  "context_used_pct": 72,
  "resume_instructions": "Continue executing wave 2. bd-105 is in progress. Check Agent Mail for BlueLake's track completion context."
}
```

---

## 8. Comparison: What We Took From Each

| Feature | Source Framework | How We Adapted It |
|---|---|---|
| Flat skill namespace (9 skills) | Superpowers (14 flat) | Same pattern, fewer skills |
| Bootstrap meta-skill | Superpowers `using-superpowers` | `using-khuym` with priority rules + go mode |
| Socratic brainstorming with HARD-GATE | Superpowers `brainstorming` | Phase 3 of `brainstorming` skill |
| Domain-aware gray area detection | GSD `discuss-phase` (SEE/CALL/RUN/READ/ORGANIZE) | Phase 1-2 of `brainstorming` skill |
| One question at a time | Academic (Elicitron 2024) | Phase 3 rule |
| Spec-document-reviewer subagent | Superpowers | Phase 6 of `brainstorming` |
| User-driven phase transitions | GSD (user types next command) | Each skill ends with handoff suggestion |
| Full-auto pipeline | Compound `/lfg` | "go" mode in `using-khuym` |
| Wave-based parallel execution | GSD `execute-phase` | Integrated into `orchestrating` |
| Agent Mail coordination | Existing system | Unchanged, refined |
| Beads as atomic work unit | Existing system | Unchanged |
| bv graph analysis + robot-plan | Existing system | Unchanged |
| Learnings retrieval at plan start | Compound `learnings-researcher` | Integrated into `planning` |
| 4-5 parallel review agents | Compound `ce:review` | `reviewing` skill with 5 agents |
| P1/P2/P3 severity system | Compound | In `reviewing` skill |
| 3-level artifact verification | GSD `gsd-verifier` | In `reviewing` skill |
| Plan-checker loop (max 3 iterations) | GSD `gsd-plan-checker` | In `planning` skill validation |
| Compound knowledge loop | Compound `ce:compound` | `compounding` skill (3 subagents) |
| Three-category taxonomy | Compound (patterns/decisions/failures) | In `compounding` skill |
| critical-patterns.md always-read | Designed from academic (trajectory memory) | In `planning` + `brainstorming` |
| STATE.md working memory | GSD `.planning/STATE.md` | `.khuym/STATE.md` |
| HANDOFF.json pause/resume | GSD `continue-here.md` | `.khuym/HANDOFF.json` + Agent Mail |
| Context monitoring (advisory) | GSD `gsd-context-monitor.js` | In-skill instruction (bead boundary checkpoint), not a hook |
| config.json (absent=enabled) | GSD | `.khuym/config.json` |
| TDD-for-skills methodology | Superpowers `writing-skills` | Full RED-GREEN-REFACTOR in `writing-khuym-skills` |
| Persuasion psychology | Superpowers `persuasion-principles.md` | In all skills + taught by `writing-khuym-skills` |
| CREATION-LOG pattern | Superpowers | Template in `writing-khuym-skills` |
| Git worktree management | Superpowers + existing | In `planning` Phase 0 + `finishing` cleanup |
| Optional CASS integration | User preference (CASS optional) | In `compounding` skill, gated by config |

---

## 9. Build Plan (Beads for Building Khuym)

When approved, we create beads for building each skill. Suggested order (dependency-aware):

```
Wave 1 (no dependencies, build in parallel):
  - using-khuym
  - brainstorming
  - executing
  - finishing
  - debugging
  - gkg

Wave 2 (depends on using-khuym patterns being established):
  - planning (needs learnings retrieval pattern)
  - reviewing (needs review agent prompt templates)
  - compounding (needs learnings file format)

Wave 3 (depends on all other skills existing):
  - orchestrating (needs worker-template referencing executing skill)
  - writing-khuym-skills (needs all skills as examples)
```

Each skill built via the same process:
1. Write SKILL.md + references
2. Validate with `agentskills validate`
3. Pressure test (for discipline skills)
4. Commit to branch

---

## 10. What Gets Replaced

| Old Skill | Replaced By | Notes |
|---|---|---|
| `planning` | `brainstorming` + `planning` | Split into exploration + planning |
| `orchestrator` | `orchestrating` | Wave execution added, Agent Mail unchanged |
| `worker` | `executing` | Context checkpoints added |
| `knowledge` | `compounding` | Full compound loop replaces basic knowledge |
| `issue-resolution` | `debugging` | Renamed, systematic debugging from Superpowers added |
| `prompt-leverage` | Absorbed into `writing-khuym-skills` | Prompt techniques become part of skill authoring |
| `book-sft-pipeline` | Unchanged (domain-specific, not part of khuym) | Keep as standalone skill |
