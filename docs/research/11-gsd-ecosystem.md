# GSD (Get Shit Done) — Full Ecosystem Architecture Study

> Source: [gsd-build/get-shit-done](https://github.com/gsd-build/get-shit-done) (v1.26.0, 13.7k stars)  
> Architecture doc: [docs/ARCHITECTURE.md](https://github.com/gsd-build/get-shit-done/blob/main/docs/ARCHITECTURE.md)  
> Study date: 2026-03-20

---

## 1. What GSD Actually Is (Structurally)

GSD is **not** a Claude agent or a single prompt. It is a **meta-prompting framework** — a system of files that Claude Code reads and executes. Nothing runs autonomously; Claude reads the workflow files and follows their instructions.

The architecture has 5 conceptual layers:

```
┌─────────────────────────────────────────────────────┐
│                    USER                              │
│           /gsd:command [args]                        │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│               COMMAND LAYER                          │
│   commands/gsd/*.md — 37 slash command files         │
│   (Claude Code custom commands = /gsd:name)          │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│              WORKFLOW LAYER                          │
│   get-shit-done/workflows/*.md — 41 workflow files   │
│   (Orchestration logic, spawns agents, manages state)│
└──────┬──────────────┬──────────────────┬────────────┘
       │              │                  │
┌──────▼──────┐ ┌─────▼──────┐ ┌────────▼───────────┐
│   AGENT     │ │   AGENT    │ │      AGENT          │
│  (fresh     │ │  (fresh    │ │     (fresh          │
│  context)   │ │  context)  │ │     context)        │
└─────────────┘ └────────────┘ └────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│              CLI TOOLS LAYER                         │
│   get-shit-done/bin/gsd-tools.cjs                    │
│   (State, config, phase, roadmap, verify, templates) │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│           FILE SYSTEM (.planning/)                   │
│   PROJECT.md | REQUIREMENTS.md | ROADMAP.md          │
│   STATE.md | config.json | phases/ | research/       │
└─────────────────────────────────────────────────────┘
```

---

## 2. Full Repository File Tree (270 files)

### Top-Level Structure

```
get-shit-done/           ← repo root
├── .github/             ← GitHub meta (CODEOWNERS, FUNDING, issue templates, workflows)
├── agents/              ← 15 agent definition .md files
├── assets/              ← logos (PNG, SVG)
├── bin/
│   └── install.js       ← 131KB installer (the npx entry point)
├── commands/gsd/        ← 37 slash command .md files
├── docs/                ← Documentation (ARCHITECTURE.md, FEATURES.md, etc.)
├── get-shit-done/       ← Core installed payload
│   ├── bin/             ← CLI tools (gsd-tools.cjs + 14 lib modules)
│   ├── references/      ← 13 shared reference .md docs
│   ├── templates/       ← Planning artifact templates
│   └── workflows/       ← 41 workflow orchestration .md files
├── hooks/               ← 4 JavaScript hook files
├── scripts/             ← build-hooks.js, run-tests.cjs
├── tests/               ← 30 test files (unit + integration)
├── package.json         ← npm package "get-shit-done-cc"
├── README.md            ← Main docs (29KB)
└── CHANGELOG.md         ← 79KB changelog
```

### agents/ (15 files)

| File | Role | Size |
|------|------|------|
| `gsd-codebase-mapper.md` | Maps existing brownfield codebases (4 parallel sub-agents: tech, arch, quality, concerns) | 16KB |
| `gsd-debugger.md` | Systematic debugging with persistent state | 40KB |
| `gsd-executor.md` | Executes a single PLAN.md task, produces atomic git commit | 19KB |
| `gsd-integration-checker.md` | Checks cross-agent integration of parallel execution results | 13KB |
| `gsd-nyquist-auditor.md` | Validates test coverage adequacy (Nyquist sampling theory) | 5KB |
| `gsd-phase-researcher.md` | Research on how to implement a specific phase | 21KB |
| `gsd-plan-checker.md` | Verifies PLAN.md files against requirements (verification loop) | 24KB |
| `gsd-planner.md` | Creates PLAN.md files from research + context | 43KB |
| `gsd-project-researcher.md` | Domain research for new projects (4 parallel: stack/features/architecture/pitfalls) | 16KB |
| `gsd-research-synthesizer.md` | Synthesizes multiple research outputs into SUMMARY.md | 7KB |
| `gsd-roadmapper.md` | Creates ROADMAP.md from requirements | 17KB |
| `gsd-ui-auditor.md` | Visual audit of UI output | 14KB |
| `gsd-ui-checker.md` | Validates UI implementation against UI-SPEC.md | 10KB |
| `gsd-ui-researcher.md` | Research for UI-specific phases | 12KB |
| `gsd-user-profiler.md` | Creates USER-PROFILE.md (optional step) | 8KB |
| `gsd-verifier.md` | Post-execution verification against phase goals | 18KB |

### commands/gsd/ (37 files)

Every command file is a YAML-frontmatter + prompt body that Claude reads as a custom slash command. They are the **user-facing entry points** — thin wrappers that reference workflow files.

**Core workflow commands:**
```
new-project.md        — Initialize project (discussion → research → roadmap)
discuss-phase.md      — Pre-phase context gathering → {N}-CONTEXT.md
plan-phase.md         — Research → plan → verify loop → PLAN.md files  
execute-phase.md      — Wave-based parallel execution
verify-work.md        — UAT: extract testables, walk through, diagnose failures
complete-milestone.md — Archive milestone, tag release
new-milestone.md      — Start next version
```

**Phase management:**
```
add-phase.md          — Add new phase to roadmap
insert-phase.md       — Insert phase at position
remove-phase.md       — Remove a phase
add-backlog.md        — Add to backlog
review-backlog.md     — Review backlog items
plan-milestone-gaps.md— Plan gap closure after verify
```

**Quick/utility commands:**
```
quick.md              — Ad-hoc task with GSD guarantees
fast.md               — Minimal wrapper (direct execution)
do.md                 — Even simpler single-step execution
autonomous.md         — Full autonomous mode
thread.md             — Multi-turn conversation thread
```

**Session management:**
```
pause-work.md         — Save state + write continue-here.md handoff
resume-work.md        — Restore from last session
progress.md           — Show where you are, what's next
next.md               — What to do next
stats.md              — Project progress + git metrics
session-report.md     — Summarize session
```

**Codebase/project ops:**
```
map-codebase.md       — Brownfield analysis (7 parallel sub-agents)
debug.md              — Systematic debug session
research-phase.md     — Standalone research run
profile-user.md       — Build user persona profile
```

**Audit/review:**
```
audit-milestone.md    — Full milestone quality audit
audit-uat.md          — UAT review
ui-phase.md           — UI-specific phase execution
ui-review.md          — UI visual review
validate-phase.md     — Validate phase plans
list-phase-assumptions.md — List planning assumptions
check-todos.md        — Check todo items
add-todo.md           — Add to todo list
add-tests.md          — Add test coverage
review.md             — Code review
reapply-patches.md    — Reapply local patches after update
```

**Meta:**
```
help.md               — Show all commands
health.md             — System health check
update.md             — Update GSD
set-profile.md        — Set model profile
settings.md           — Configure settings
ship.md               — Ship/deploy
pr-branch.md          — Create PR branch
note.md               — Capture a note
plant-seed.md         — Plant a seed idea
join-discord.md       — Discord link
```

### get-shit-done/workflows/ (41 files)

Workflows are the **actual orchestration logic**. Commands reference them via `@~/.claude/get-shit-done/workflows/`.

**Core workflows (sizes indicate complexity):**
```
new-project.md         36KB  — Full project initialization flow
discuss-phase.md       38KB  — Discussion protocol (gray area detection, probing)
plan-phase.md          29KB  — Research → plan → verify loop
execute-phase.md       31KB  — Wave orchestration + subagent dispatch
execute-plan.md        22KB  — Single plan execution (used by executors)
verify-work.md         17KB  — UAT flow
verify-phase.md        10KB  — Post-execution verification
complete-milestone.md  20KB  — Milestone completion + archival
new-milestone.md       16KB  — New milestone setup
autonomous.md          26KB  — Full autonomous mode
quick.md               24KB  — Quick task flow
map-codebase.md        11KB  — Brownfield mapping
debug.md    (via gsd-debugger)
transition.md          13KB  — Phase transition logic
```

**Support workflows:**
```
audit-milestone.md, audit-uat.md, cleanup.md, add-phase.md, insert-phase.md,
remove-phase.md, add-tests.md, add-todo.md, check-todos.md, diagnose-issues.md,
discovery-phase.md, do.md, fast.md, health.md, help.md, list-phase-assumptions.md,
node-repair.md, note.md, pause-work.md, plan-milestone-gaps.md, plant-seed.md,
pr-branch.md, profile-user.md, progress.md, research-phase.md, resume-project.md,
review.md, session-report.md, settings.md, ship.md, stats.md, ui-phase.md,
ui-review.md, update.md, validate-phase.md
```

### get-shit-done/references/ (13 files)

Shared knowledge documents that workflows `@-reference` to inject into context:

| File | Purpose |
|------|---------|
| `checkpoints.md` | Checkpoint type definitions and interaction patterns |
| `continuation-format.md` | How to format context handoffs |
| `decimal-phase-calculation.md` | How decimal phase numbering works (e.g., 1.1, 1.2) |
| `git-integration.md` | Git commit, branching, and history patterns |
| `git-planning-commit.md` | How planning commits are structured |
| `model-profile-resolution.md` | How model profiles are resolved per agent |
| `model-profiles.md` | Per-agent model tier assignments (quality/balanced/budget) |
| `phase-argument-parsing.md` | How phase numbers are parsed from arguments |
| `planning-config.md` | Full config.json schema and behavior reference |
| `questioning.md` | Dream extraction philosophy for new-project interviews |
| `tdd.md` | Test-driven development integration patterns |
| `ui-brand.md` | Visual output formatting patterns (used by all workflows) |
| `verification-patterns.md` | How to verify different artifact types |
| `user-profiling.md` | 37KB — User profiling methodology |

### get-shit-done/templates/ (30+ files)

Templates that `gsd-tools.cjs template fill` populates with variables:

**Core project files:**
```
project.md             — .planning/PROJECT.md template
requirements.md        — .planning/REQUIREMENTS.md template
roadmap.md             — .planning/ROADMAP.md template
state.md               — .planning/STATE.md template
milestone.md           — Milestone tracking
milestone-archive.md   — Completed milestone archive
```

**Phase artifacts:**
```
context.md             — {N}-CONTEXT.md (discuss-phase output)
phase-prompt.md        18KB — Phase execution prompt template
research.md            16KB — RESEARCH.md template
discovery.md           — Discovery phase
discussion-log.md      — Discussion session log
```

**Execution artifacts:**
```
summary.md, summary-minimal.md, summary-standard.md, summary-complex.md
verification-report.md 9KB
continue-here.md       — Pause/resume handoff
debug-subagent-prompt.md
planner-subagent-prompt.md
```

**Spec templates:**
```
UAT.md                 6KB  — User acceptance test template
UI-SPEC.md             — UI design contract
VALIDATION.md          — Nyquist test coverage mapping
DEBUG.md               — Debug session tracking
```

**Codebase analysis templates (for /gsd:map-codebase):**
```
codebase/architecture.md
codebase/concerns.md
codebase/conventions.md
codebase/integrations.md
codebase/stack.md
codebase/structure.md
codebase/testing.md
```

**Research project templates:**
```
research-project/SUMMARY.md
research-project/STACK.md
research-project/FEATURES.md
research-project/ARCHITECTURE.md
research-project/PITFALLS.md
```

**Other:**
```
claude-md.md           — CLAUDE.md setup template
user-setup.md          9KB — User preferences setup
user-profile.md        — User persona template
dev-preferences.md     — Developer preference capture
retrospective.md       — Sprint retrospective
config.json            — Default config.json template
copilot-instructions.md — GitHub Copilot instructions
```

### hooks/ (4 files)

JavaScript Node.js hooks registered in `.claude/settings.json`:

| File | Hook Event | Purpose |
|------|-----------|---------|
| `gsd-statusline.js` | `statusLine` | Displays model/task/directory/context bar in Claude Code UI |
| `gsd-context-monitor.js` | `PostToolUse` / `AfterTool` (Gemini) | Injects advisory warnings at 35%/25% context remaining |
| `gsd-check-update.js` | `SessionStart` | Background npm version check; writes to `~/.claude/cache/gsd-update-check.json` |
| `gsd-workflow-guard.js` | `PreToolUse` | Detects Write/Edit outside a GSD workflow; injects SOFT advisory (does NOT block) |

### get-shit-done/bin/ (15 modules)

The CLI utility `gsd-tools.cjs` with 15 domain modules:

| Module | Responsibility | Size |
|--------|---------------|------|
| `core.cjs` | Error handling, output formatting, shared utilities | 37KB |
| `state.cjs` | STATE.md parsing, updating, progression, metrics | 35KB |
| `phase.cjs` | Phase directory operations, decimal numbering, plan indexing | 35KB |
| `verify.cjs` | Plan structure, phase completeness, reference, commit validation | 32KB |
| `profile-output.cjs` | Profile output formatting | 41KB |
| `init.cjs` | Compound context loading for each workflow type | 29KB |
| `profile-pipeline.cjs` | Profile pipeline management | 17KB |
| `roadmap.cjs` | ROADMAP.md parsing, phase extraction, plan progress | 12KB |
| `frontmatter.cjs` | YAML frontmatter CRUD operations | 12KB |
| `config.cjs` | config.json read/write, section initialization | 10KB |
| `uat.cjs` | UAT operations | 6KB |
| `template.cjs` | Template selection and filling with variable substitution | 7KB |
| `milestone.cjs` | Milestone archival, requirements marking | 9KB |
| `model-profiles.cjs` | Model profile resolution table | 3KB |
| `commands.cjs` | Misc commands (slug, timestamp, todos, scaffolding, stats) | 31KB |

### bin/install.js (131KB, ~3,000 lines)

The `npx get-shit-done-cc@latest` entry point. Handles:
1. Runtime detection (interactive prompt or CLI flags: `--claude`, `--opencode`, `--gemini`, `--codex`, `--copilot`, `--antigravity`, `--all`)
2. Location selection (global `--global` or local `--local`)
3. File deployment (copies commands, workflows, references, templates, agents, hooks)
4. **Runtime adaptation** — transforms file content per runtime:
   - Claude Code: used as-is
   - OpenCode: converts agent frontmatter to `name:`, `model: inherit`, `mode: subagent`
   - Codex: generates TOML config + skills from commands
   - Copilot: maps tool names (Read→read, Bash→execute, etc.)
   - Gemini: adjusts hook event names (`AfterTool` instead of `PostToolUse`)
   - Antigravity: skills-first with Google model equivalents
5. Path normalization (replaces `~/.claude/` paths with runtime-specific paths)
6. Settings integration (registers hooks in runtime's `settings.json`)
7. Patch backup (v1.17+: backs up local modifications to `gsd-local-patches/` for `/gsd:reapply-patches`)
8. Manifest tracking (`gsd-file-manifest.json` for clean uninstall)
9. Uninstall mode (`--uninstall` removes all GSD files, hooks, settings)

---

## 3. How Phases Are Organized

Phases are **not separate files in the repo** — they live in the **user's project** under `.planning/phases/`. The repo contains the *machinery* to create and manage phases.

### Phase file layout (in user's `.planning/phases/`)

```
.planning/phases/
└── 01-phase-name/
    ├── 01-CONTEXT.md          ← User preferences (from discuss-phase)
    ├── 01-RESEARCH.md         ← Ecosystem research (from plan-phase)
    ├── 01-01-PLAN.md          ← Execution plan 1
    ├── 01-02-PLAN.md          ← Execution plan 2
    ├── 01-01-SUMMARY.md       ← Execution outcome 1
    ├── 01-02-SUMMARY.md       ← Execution outcome 2
    ├── 01-VERIFICATION.md     ← Post-execution verification
    ├── 01-VALIDATION.md       ← Nyquist test coverage mapping
    ├── 01-UI-SPEC.md          ← UI design contract (from ui-phase, optional)
    ├── 01-UI-REVIEW.md        ← Visual audit scores (from ui-review)
    └── 01-UAT.md              ← User acceptance test results
```

**Phase numbering:** Decimal system via `decimal-phase-calculation.md`. Phases are `01`, `02`, etc. Sub-phases are `01.1`, `01.2`. Plans within a phase are `01-01`, `01-02`.

---

## 4. Phase Handoff: How Discuss Invokes Plan

**There is no automatic invocation.** Discuss does NOT spawn plan automatically.

The `discuss-phase.md` command ends with:
```
9. Offer next steps (research or plan)
```

It writes `{N}-CONTEXT.md` and then **prompts the user** with next step options. The user must separately run `/gsd:plan-phase N`.

The `plan-phase.md` command reads CONTEXT.md from discuss-phase as input:
- Executes `gsd-tools init plan-phase` → returns JSON with project context
- Reads `{N}-CONTEXT.md` (from discuss-phase)
- Spawns gsd-phase-researcher → writes `{N}-RESEARCH.md`
- Spawns gsd-planner → writes `{N}-01-PLAN.md`, `{N}-02-PLAN.md`, etc.
- Spawns gsd-plan-checker (up to 3 iterations) → loops until PASS
- Presents results to user

**The chain is user-driven, not auto-triggered.** Each command stands alone.

---

## 5. What a PLAN.md File Is

A PLAN.md is the **atomic task specification** fed to a single executor sub-agent. Based on the decoded command files and architecture docs:

### PLAN.md structure (XML-formatted task)

```xml
---
name: "Create login endpoint"
phase: "01"
plan_number: "01-01"
type: auto
gap_closure: false          ← set to true if created by verify-work
dependencies: []            ← list of other plan numbers this depends on
wave: 1                     ← computed by execute-phase from dependencies
---

<task type="auto">
  <name>Create login endpoint</name>
  <files>src/app/api/auth/login/route.ts</files>
  <action>
    Use jose for JWT (not jsonwebtoken - CommonJS issues).
    Validate credentials against users table.
    Return httpOnly cookie on success.
  </action>
  <verify>curl -X POST localhost:3000/api/auth/login returns 200</verify>
  <done>Valid credentials return cookie, invalid return 401</done>
</task>
```

### How PLAN.md is parsed

`get-shit-done/bin/lib/phase.cjs` (35KB) handles:
- Directory scanning: `ls .planning/phases/NN-phase-name/*.md` 
- Plan indexing: glob `**/{NN}-{MM}-PLAN.md`
- `frontmatter.cjs` reads the YAML header to get: wave, dependencies, gap_closure, type
- Plans sorted by plan number to determine wave order

The `gsd-plan-checker.md` agent also validates plan structure against:
- REQUIREMENTS.md (does plan fulfill the right requirements?)
- CONTEXT.md (does plan respect user decisions?)
- Phase scope (is plan within the phase boundary?)

---

## 6. How the Orchestrator Works

The **execute-phase** workflow is the canonical example of GSD's thin orchestrator pattern.

### execute-phase.md (decoded content)

```yaml
---
name: gsd:execute-phase
description: Execute all plans in a phase with wave-based parallelization
argument-hint: "<phase-number> [--gaps-only] [--interactive]"
allowed-tools: [Read, Write, Edit, Glob, Grep, Bash, Task, TodoWrite, AskUserQuestion]
---
<objective>
Execute all plans in a phase using wave-based parallel execution.

Orchestrator stays lean: discover plans, analyze dependencies, group into waves, 
spawn subagents, collect results. Each subagent loads the full execute-plan 
context and handles its own plan.

Context budget: ~15% orchestrator, 100% fresh per subagent.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-phase.md
@~/.claude/get-shit-done/references/ui-brand.md
</execution_context>

<process>
Execute the execute-phase workflow from @~/.claude/get-shit-done/workflows/execute-phase.md 
end-to-end. Preserve all workflow gates (wave execution, checkpoint handling, 
verification, state updates, routing).
</process>
```

### Orchestrator pattern (from ARCHITECTURE.md)

```
Orchestrator (workflow .md)
    │
    ├── Load context: gsd-tools.cjs init execute-phase <phase>
    │   Returns JSON with: project info, config, state, phase details
    │
    ├── Resolve model: gsd-tools.cjs resolve-model <agent-name>
    │   Returns: opus | sonnet | haiku | inherit
    │
    ├── Spawn Agent (Task/SubAgent call)
    │   ├── Agent prompt (agents/*.md)
    │   ├── Context payload (init JSON)
    │   ├── Model assignment
    │   └── Tool permissions
    │
    └── Collect result
        └── Update state: gsd-tools.cjs state update/patch/advance-plan
```

### Wave execution model

```
Wave Analysis:
  Plan 01 (no deps)       ──►
  Plan 02 (no deps)       ──►─── Wave 1 (parallel)
  Plan 03 (depends: 01)   ──►─── Wave 2 (waits for Wave 1)
  Plan 04 (depends: 02)   ──►
  Plan 05 (depends: 03,04)─── Wave 3 (waits for Wave 2)
```

Each executor gets:
- Fresh 200K context window
- The specific PLAN.md to execute
- Project context (PROJECT.md, STATE.md)
- Phase context (CONTEXT.md, RESEARCH.md if available)

### Sub-agent spawn mechanism

Workflows use Claude Code's `Task` tool (subagent spawning) with the agent definition file as the prompt:

```
Spawn gsd-executor with:
  - prompt: contents of agents/gsd-executor.md
  - context: {plan_content, project_info, state_info}
  - model: resolved from gsd-tools resolve-model gsd-executor
  - tools: as specified in agent frontmatter
```

**Parallel commit safety** (from ARCHITECTURE.md):
1. `--no-verify` commits — parallel agents skip pre-commit hooks (avoids build lock contention). Orchestrator runs `git hook run pre-commit` once after each wave.
2. STATE.md file locking — `writeStateMd()` uses lockfile-based mutual exclusion (`STATE.md.lock` with `O_EXCL` atomic creation). Includes stale lock detection (10s timeout) and spin-wait with jitter.

---

## 7. Agent Spawn Categories

| Category | Agents | Parallelism |
|----------|--------|------------|
| **Researchers** | gsd-project-researcher, gsd-phase-researcher, gsd-ui-researcher | 4 parallel (stack, features, architecture, pitfalls) |
| **Synthesizers** | gsd-research-synthesizer | Sequential (after researchers complete) |
| **Planners** | gsd-planner, gsd-roadmapper | Sequential |
| **Checkers** | gsd-plan-checker, gsd-integration-checker, gsd-ui-checker, gsd-nyquist-auditor | Sequential (verification loop, max 3 iterations) |
| **Executors** | gsd-executor | Parallel within waves, sequential across waves |
| **Verifiers** | gsd-verifier | Sequential (after all executors complete) |
| **Mappers** | gsd-codebase-mapper | 4 parallel (tech, arch, quality, concerns) |
| **Debuggers** | gsd-debugger | Sequential (interactive) |
| **Auditors** | gsd-ui-auditor | Sequential |

---

## 8. Hooks — Detailed Analysis

### Hook 1: gsd-statusline.js
- **Event:** `statusLine` (custom Claude Code status bar)
- **Input:** stdin — session JSON with session_id, context metrics
- **Output:** stdout — formatted status string; ALSO writes to `/tmp/claude-ctx-{session_id}.json` (bridge file for context monitor)
- **What it shows:** model name, current task, directory, context usage bar

### Hook 2: gsd-context-monitor.js  
- **Event:** `PostToolUse` (Claude Code) / `AfterTool` (Gemini)
- **Input:** stdin — tool event JSON with session_id, cwd
- **Output:** stdout — JSON with `hookSpecificOutput.additionalContext` warning message
- **Logic:**
  ```javascript
  const WARNING_THRESHOLD = 35;  // remaining <= 35%
  const CRITICAL_THRESHOLD = 25; // remaining <= 25%
  const STALE_SECONDS = 60;      // ignore metrics older than 60s
  const DEBOUNCE_CALLS = 5;      // min tool uses between warnings
  ```
  - Reads bridge file from statusline: `/tmp/claude-ctx-{session_id}.json`
  - If no bridge file → exit silently (subagent / fresh session)
  - Checks `.planning/config.json` for `hooks.context_warnings: false` override
  - Detects GSD active: checks for `.planning/STATE.md`
  - WARNING message (if GSD active): "Avoid starting new complex work. Inform user to prepare to pause."
  - CRITICAL message (if GSD active): "Do NOT start new complex work. Inform user to run /gsd:pause-work."
  - Advisory only — NEVER issues imperative commands that override user preferences (issue #884)
  - Severity escalation (WARNING→CRITICAL) bypasses debounce

### Hook 3: gsd-check-update.js
- **Event:** `SessionStart`
- **Logic:** Spawns background process (detached, windowsHide) that:
  1. Reads VERSION file from installed GSD
  2. Checks stale hooks: compares `// gsd-hook-version: {version}` header in each hook file
  3. Runs `npm view get-shit-done-cc version` (10s timeout)
  4. Writes result to `~/.claude/cache/gsd-update-check.json`:
     ```json
     { "update_available": bool, "installed": "1.26.0", "latest": "...", 
       "checked": timestamp, "stale_hooks": [...] }
     ```
- **Parent process:** exits immediately, child is detached (fire-and-forget)

### Hook 4: gsd-workflow-guard.js
- **Event:** `PreToolUse`
- **Trigger:** Only on `Write` or `Edit` tool calls
- **Logic:**
  - Skips if: file is in `.planning/`, matches allowed patterns (`.gitignore`, `.env`, `CLAUDE.md`, `AGENTS.md`, `settings.json`)
  - Skips if: in a Task subagent context (`data.session_type === 'task'`)
  - Skips if: `hooks.workflow_guard: false` in config.json (default = disabled!)
  - If all guards pass: injects SOFT advisory via `additionalContext`
  - Message: "WORKFLOW ADVISORY: You're editing {file} directly without a GSD command. Consider /gsd:fast or /gsd:quick to maintain state tracking."
  - **Does NOT block** — this is advisory only

---

## 9. State Management

### State files in `.planning/`

```
.planning/
├── PROJECT.md         ← Project vision, constraints, decisions, evolution rules
├── REQUIREMENTS.md    ← Scoped requirements (v1/v2/out-of-scope)
├── ROADMAP.md         ← Phase breakdown with status tracking
├── STATE.md           ← Living memory: position, decisions, blockers, metrics
├── config.json        ← Workflow configuration
├── MILESTONES.md      ← Completed milestone archive
├── research/          ← Domain research from /gsd:new-project
│   ├── SUMMARY.md
│   ├── STACK.md
│   ├── FEATURES.md
│   ├── ARCHITECTURE.md
│   └── PITFALLS.md
├── codebase/          ← Brownfield mapping from /gsd:map-codebase
│   ├── STACK.md
│   ├── ARCHITECTURE.md
│   ├── CONVENTIONS.md
│   ├── CONCERNS.md
│   ├── STRUCTURE.md
│   ├── TESTING.md
│   └── INTEGRATIONS.md
├── phases/
│   └── {NN}-phase-name/
│       ├── {NN}-CONTEXT.md
│       ├── {NN}-RESEARCH.md
│       ├── {NN}-{MM}-PLAN.md      ← Multiple plan files
│       ├── {NN}-{MM}-SUMMARY.md   ← Per-plan execution outcomes
│       ├── {NN}-VERIFICATION.md
│       ├── {NN}-VALIDATION.md
│       ├── {NN}-UI-SPEC.md
│       ├── {NN}-UI-REVIEW.md
│       └── {NN}-UAT.md
├── quick/             ← Quick task tracking
│   └── YYYYMMDD-xxx-slug/
│       ├── PLAN.md
│       └── SUMMARY.md
├── todos/
│   ├── pending/       ← Captured ideas
│   └── done/          ← Completed todos
├── debug/             ← Active debug sessions
│   ├── *.md
│   ├── resolved/
│   └── knowledge-base.md
├── ui-reviews/        ← Screenshots (gitignored)
└── continue-here.md   ← Context handoff from pause-work
```

### STATE.md — The Living Brain

STATE.md is the **primary state file**. `gsd-tools/lib/state.cjs` (35KB) handles all reads/writes:
- Current phase position
- Decisions made (with context)
- Blockers
- Metrics (commits, plans completed, etc.)
- All writes are **lockfile-protected**: `STATE.md.lock` with `O_EXCL` atomic creation + 10s stale lock detection + spin-wait with jitter

### config.json — Feature Flags

The **absent = enabled** pattern: if a key is missing from config.json, it defaults to `true`. Users explicitly disable features; they don't need to enable defaults.

Example config:
```json
{
  "hooks": {
    "context_warnings": true,    ← false to disable context warnings
    "workflow_guard": false       ← default disabled
  },
  "model_profile": "balanced",   ← quality | balanced | budget
  "research": true,
  "verification": true
}
```

### How GSD Tracks Phase Position

`gsd-tools.cjs state` commands:
- `state update` — write state changes
- `state patch` — atomic partial update
- `state advance-plan` — move to next plan
- The current phase/plan position is stored in STATE.md
- ROADMAP.md tracks phase-level status (pending/in-progress/complete)

---

## 10. Context Propagation — What Each Agent Reads

```
PROJECT.md ─────────────────────────────────────► All agents
REQUIREMENTS.md ──────────────────────────────────► Planner, Verifier, Auditor
ROADMAP.md ───────────────────────────────────────► Orchestrators
STATE.md ─────────────────────────────────────────► All agents (decisions, blockers)
CONTEXT.md (per phase) ───────────────────────────► Researcher, Planner, Executor
RESEARCH.md (per phase) ──────────────────────────► Planner, Plan Checker
PLAN.md (per plan) ───────────────────────────────► Executor, Plan Checker
SUMMARY.md (per plan) ────────────────────────────► Verifier, State tracking
UI-SPEC.md (per phase) ───────────────────────────► Executor, UI Auditor
```

The `init.cjs` module (29KB) handles **compound context loading** — for each workflow type, it knows exactly which files to load and returns a structured JSON payload that the orchestrator injects into each sub-agent call.

---

## 11. How discuss-phase Relates to CONTEXT.md / plan-phase

```
discuss-phase N
    ├── Reads: PROJECT.md, REQUIREMENTS.md, STATE.md, ALL prior CONTEXT.md files
    ├── Scouts: codebase for reusable assets
    ├── Analyzes: phase goal from ROADMAP.md
    ├── Identifies: gray areas (domain-specific, not generic)
    │   - Visual features → layout, density, interactions, states
    │   - APIs/CLIs → responses, errors, auth, versioning
    │   - Run → output format, flags, modes, error handling
    │   - Read → structure, tone, depth, flow
    │   - Organized → criteria, grouping, naming, exceptions
    ├── Asks: 4 questions per area (deepening, not breadth-first)
    └── Writes: {N}-CONTEXT.md
         ├── Sections: one per gray area discussed
         └── code_context section: relevant existing patterns

plan-phase N
    ├── Reads: {N}-CONTEXT.md (from discuss-phase, or --prd flag)
    ├── Spawns: gsd-phase-researcher → {N}-RESEARCH.md
    ├── Spawns: gsd-planner (with CONTEXT + RESEARCH) → {N}-01-PLAN.md, {N}-02-PLAN.md...
    ├── Spawns: gsd-plan-checker (verify loop, max 3x) → PASS/FAIL
    └── Presents results to user
```

**CONTEXT.md is not a phase file** — it's **user decisions for a specific phase**. It travels downstream through researcher → planner → executor to ensure implementation matches user intent.

---

## 12. GSD v2 CLI vs Pure-Prompt

This is not v1 vs v2 in the traditional sense. What changed across versions:

### Pure-prompt version (early GSD)
- Monolithic CLAUDE.md with all instructions
- No separate agent files
- User ran everything by reading one big prompt
- No CLI tools
- State tracked ad-hoc

### GSD with CLI tools (current)
- Separate command files → workflow files → agent files
- `gsd-tools.cjs` handles all context loading, state management
- `npx get-shit-done-cc` installer deploys everything
- Hook system for context monitoring
- Decimal phase numbering
- Multi-runtime support (6 runtimes)
- Package: `get-shit-done-cc` on npm

The **structural distinction** is the introduction of `gsd-tools.cjs init <workflow>` as the context-loading primitive. Before this, workflows had to manually read files. Now they call `gsd-tools init` which returns a structured JSON payload with everything the workflow needs.

---

## 13. Complete Execution Dispatch Flow

### /gsd:execute-phase 1 — full trace

```
1. User types: /gsd:execute-phase 1

2. Claude Code reads: commands/gsd/execute-phase.md
   - Parses YAML frontmatter (name, allowed-tools)
   - Reads execution_context: loads workflows/execute-phase.md + references/ui-brand.md
   - Injects phase=1 as $ARGUMENTS

3. Claude executes: gsd-tools.cjs init execute-phase 1
   - Returns JSON: { project, config, state, phase: { name, plans, roadmap_entry } }

4. Claude reads plan directory: .planning/phases/01-*/01-*-PLAN.md
   - Parses each plan's frontmatter: dependencies, wave, type, gap_closure

5. Wave analysis (Claude's reasoning):
   - Group plans by dependency chain → Wave 1, Wave 2, Wave 3

6. For Wave 1 (parallel):
   Claude calls Task tool for EACH plan simultaneously:
   
   Task(
     description: "Execute plan 01-01",
     prompt: agents/gsd-executor.md + context_payload,
     model: resolved from gsd-tools resolve-model gsd-executor,
     tools: [Read, Write, Edit, Glob, Grep, Bash, TodoWrite]
   )
   
   Each executor sub-agent:
   a. Gets 100% fresh context window (200K tokens)
   b. Reads its PLAN.md
   c. Reads PROJECT.md, STATE.md, {N}-CONTEXT.md
   d. Implements the task
   e. Runs git commit --no-verify -m "feat: {plan-name}"
   f. Writes {N}-{MM}-SUMMARY.md
   g. Updates STATE.md via gsd-tools state patch (lockfile-protected)

7. Orchestrator collects results, runs git hook run pre-commit once
   
8. For Wave 2: waits for Wave 1 to complete, then spawns next batch

9. After all waves: spawn gsd-verifier
   - Reads all SUMMARY.md files
   - Checks REQUIREMENTS.md
   - Writes {N}-VERIFICATION.md
   - PASS → move to next step | FAIL → create gap closure plans

10. State update: gsd-tools state update phase=1 status=complete

11. Prompts user: "Phase 1 complete. Run /gsd:verify-work 1 to UAT."
```

---

## 14. Installation Layout (installed to ~/.claude/)

After `npx get-shit-done-cc`:

```
~/.claude/                            ← Claude Code global config
├── commands/gsd/                     ← 37 slash commands
│   └── *.md
├── get-shit-done/
│   ├── bin/
│   │   ├── gsd-tools.cjs             ← CLI utility
│   │   └── lib/                      ← 15 domain modules
│   ├── workflows/                    ← 41 workflow definitions
│   ├── references/                   ← 13 shared reference docs
│   └── templates/                    ← Planning artifact templates
├── agents/                           ← 15 agent definitions
│   └── *.md
├── hooks/
│   ├── gsd-statusline.js
│   ├── gsd-context-monitor.js
│   └── gsd-check-update.js
│   (gsd-workflow-guard.js — optional, default: disabled)
├── settings.json                     ← Hook registrations
└── VERSION                           ← "1.26.0"
```

**Project files** created at runtime in the user's project directory:
```
.planning/                            ← All project state
```

---

## 15. Key Design Principles

1. **Fresh Context Per Agent** — every spawned agent gets a clean 200K context window. Eliminates context rot.

2. **Thin Orchestrators** — workflow files never do heavy lifting. They load context via `gsd-tools init`, spawn agents, collect results, update state.

3. **File-Based State** — all state in `.planning/` as human-readable Markdown + JSON. No database, no server. Survives context resets. Committable to git.

4. **Absent = Enabled** — config.json feature flags default to `true` if missing. Users explicitly disable; no opt-in required.

5. **Defense in Depth** — plans verified before execution (plan-checker), execution produces atomic commits, post-execution verification checks against goals, UAT provides human verification as final gate.

6. **Advisory Hooks** — hooks NEVER issue imperative commands that override user preferences. Context monitor is advisory only (issue #884 explicitly prevents this).

7. **Command → Workflow → Agent** — strict three-layer separation. Commands are thin entry points that reference workflows. Workflows orchestrate agents. Agents do the actual work.

---

## 16. Component Interaction Map

```
User
 │
 ▼ /gsd:discuss-phase N
Command (commands/gsd/discuss-phase.md)
 │ @-references
 ▼
Workflow (get-shit-done/workflows/discuss-phase.md)  ← 38KB detailed protocol
 │ reads
 ├── .planning/PROJECT.md
 ├── .planning/REQUIREMENTS.md
 ├── .planning/STATE.md
 └── .planning/phases/prior/CONTEXT.md
 │ writes
 └── .planning/phases/N-name/N-CONTEXT.md
 │ offers next step
 ▼ user runs /gsd:plan-phase N

Command (commands/gsd/plan-phase.md)
 │
 ▼
Workflow (get-shit-done/workflows/plan-phase.md)     ← 29KB
 │ gsd-tools init plan-phase N
 ├── Agent: gsd-phase-researcher → N-RESEARCH.md
 │   (reads CONTEXT.md, project info)
 ├── Agent: gsd-planner → N-01-PLAN.md, N-02-PLAN.md
 │   (reads CONTEXT.md, RESEARCH.md, REQUIREMENTS.md)
 └── Agent: gsd-plan-checker (loop max 3×)
     (validates plans vs requirements, CONTEXT.md)
 │ user runs /gsd:execute-phase N

Command (commands/gsd/execute-phase.md)
 │
 ▼
Workflow (get-shit-done/workflows/execute-phase.md)  ← 31KB
 │ Wave 1 (parallel Task calls):
 ├── Agent: gsd-executor [plan 01] → commit + SUMMARY
 ├── Agent: gsd-executor [plan 02] → commit + SUMMARY
 │ Wave 2 (after Wave 1):
 └── Agent: gsd-executor [plan 03] → commit + SUMMARY
 │ After all waves:
 ├── Agent: gsd-verifier → VERIFICATION.md
 └── gsd-tools state update phase=N status=complete
 │ user runs /gsd:verify-work N

Command (commands/gsd/verify-work.md)
 │
 ▼
Workflow (get-shit-done/workflows/verify-work.md)    ← 17KB
 │ UAT flow: extract testables → walk through → diagnose failures
 └── If failures: create gap closure PLAN.md files
     → user runs /gsd:execute-phase N --gaps-only
```

---

## Sources

- [gsd-build/get-shit-done GitHub repository](https://github.com/gsd-build/get-shit-done)
- [docs/ARCHITECTURE.md](https://github.com/gsd-build/get-shit-done/blob/main/docs/ARCHITECTURE.md) (23KB — full system architecture)
- [commands/gsd/execute-phase.md](https://github.com/gsd-build/get-shit-done/blob/main/commands/gsd/execute-phase.md) (decoded)
- [commands/gsd/discuss-phase.md](https://github.com/gsd-build/get-shit-done/blob/main/commands/gsd/discuss-phase.md) (decoded)
- [commands/gsd/plan-phase.md](https://github.com/gsd-build/get-shit-done/blob/main/commands/gsd/plan-phase.md) (decoded)
- [commands/gsd/new-project.md](https://github.com/gsd-build/get-shit-done/blob/main/commands/gsd/new-project.md) (decoded)
- [hooks/gsd-context-monitor.js](https://github.com/gsd-build/get-shit-done/blob/main/hooks/gsd-context-monitor.js) (decoded)
- [hooks/gsd-workflow-guard.js](https://github.com/gsd-build/get-shit-done/blob/main/hooks/gsd-workflow-guard.js) (decoded)
- [hooks/gsd-check-update.js](https://github.com/gsd-build/get-shit-done/blob/main/hooks/gsd-check-update.js) (decoded)
- [GitHub API tree — full file list (270 files)](https://api.github.com/repos/gsd-build/get-shit-done/git/trees/main?recursive=1)
- [DEV.to: Complete Beginner's Guide to GSD](https://dev.to/alikazmidev/the-complete-beginners-guide-to-gsd-get-shit-done-framework-for-claude-code-24h0)
- [LinkedIn: AI-assisted development with Claude Code and GSD](https://www.linkedin.com/posts/sethsandler_github-glittercowboyget-shit-done-a-light-weight-activity-7424687215697362944-oPdQ)
- [Reddit r/ClaudeAI: GSD Framework discussion](https://www.reddit.com/r/ClaudeAI/comments/1q4yjo0/get_shit_done_the_1_cc_framework_for_people_tired/)
