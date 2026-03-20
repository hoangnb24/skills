---
name: forge
description: Cross-framework coding agent workflow synthesizing Superpowers (brainstorming, spec review), GSD (discuss-lock, wave execution), BMAD (context-embedded tasks), Compound Engineering (knowledge capture), and Ralph Loop (completion promises) into a phased pipeline. Uses beads, beads viewer (bv), and Agent Mail as core infrastructure. Activate when starting a feature, planning implementation, executing tasks, or reviewing code.
metadata:
  author: hoang
  version: '0.1.0'
  frameworks: Superpowers, GSD, BMAD, Compound Engineering, Ralph Loop, Flywheel
---

# Forge — Cross-Framework Coding Agent Skill

## When to Use This Skill

Activate forge when any of these conditions are true:

- **Starting a feature**: You have a goal but no plan yet
- **Planning implementation**: You need to break work into executable tasks
- **Executing tasks**: You are working through a bead queue
- **Reviewing code**: A PR or wave is ready for compound review
- **Running a spike**: You need to validate a technical approach before committing
- **Session start on any active project**: Read AGENTS.md and check Agent Mail before anything else

If none of these match and the task is a simple one-file edit with no unknowns, skip directly to Phase 4 with a Ralph completion promise.

---

## Core Concepts

Forge is a **6-phase pipeline** (0–5). Each phase produces a named artifact. No agent ever relies on conversation history — everything lives in files, beads, or CLAUDE.md.

**Three-layer context model:**
- `CLAUDE.md` — Living project memory: architecture decisions, conventions, anti-patterns, validated approaches
- `AGENTS.md` — Operating manual for all agents: tool blurbs, coordination rules, file reservation protocol
- **Beads** — Self-contained task units: description (what + why), design (how), notes (edge cases)

**Scale determines which phases run.** Tiny tasks skip to Phase 4. Large tasks use the full pipeline. See `references/adaptive-mode.md` for full skip logic.

---

## Quick Start by Task Scale

| Scale | Signal | Run These Phases |
|-------|--------|-----------------|
| **Tiny** (<30 min) | Single file, obvious fix, zero unknowns | Phase 4 only (with Ralph promise) |
| **Small** (30 min–2 hr) | Clear scope, no unknowns | Phases 1 → 2 → 4 |
| **Medium** (2–8 hr) | Multiple components, some unknowns | Full pipeline: 0 → 1 → 2 → 3 → 4 → 5 |
| **Large** (>8 hr) | Multiple epics, significant unknowns | Full pipeline, multi-session swarm |
| **Spike-only** | Pure technical investigation | Phase 3 only |

**Scale detection heuristics:**
- Files likely touched: 1–3 = tiny, 4–10 = small, 10+ = medium/large
- Unknowns: 0 = tiny/small, 1–2 = medium, 3+ = large
- Cross-system dependencies: none = tiny, some = medium, many = large

For full adaptive mode logic, read `references/adaptive-mode.md`.

---

## Phase Pipeline Overview

### Phase 0: Bootstrap
**One-time per project. Never repeated.**

Creates the project scaffolding that all future sessions depend on. Produces `CLAUDE.md` (project memory with Architecture Decisions, Conventions, Anti-Patterns, Validated Approaches sections), `AGENTS.md` (tool blurbs + coordination rules), and the `.beads/` directory. Optionally pins tech stack docs to `docs/references/` for unfamiliar technology.

- **Source framework**: Project setup best practices
- **Handoff artifact**: `CLAUDE.md` + `AGENTS.md` + initialized `.beads/`
- **For full mechanics, read** `references/phases.md` **Section 0**

### Phase 1: Brainstorm
**Source: Superpowers brainstorming mechanics**

Explores context (files, docs, recent commits, `CLAUDE.md`), asks clarifying questions one at a time, proposes 2–3 approaches with trade-offs, and writes a design doc section by section with human confirmation. After the design doc is written, a spec-document-reviewer sub-agent runs a completeness + YAGNI check (max 3 iterations). **Human approval is required before Phase 2 begins** — this is a hard gate.

- **Handoff artifact**: `docs/plans/YYYY-MM-DD-<topic>-design.md` (spec-reviewed, human-approved)
- **For full mechanics, read** `references/phases.md` **Section 1**

### Phase 2: Breakdown
**Source: GSD discuss-lock + BMAD story mechanics + bv routing**

Three steps: (A) **Discuss** — resolve every gray zone in the design doc, recording locked decisions in the doc under `## Locked Decisions`; (B) **Decompose** — create one bead per task component with fully embedded context (description + design + notes), each bead self-contained so the executing agent needs only the bead + AGENTS.md + CLAUDE.md; (C) **Validate** — run `bv --robot-graph` to confirm no cycles, `bv --robot-triage` for execution order. Run 2–3 bead polish review rounds until changes become incremental.

- **Handoff artifact**: Polished bead set with dependency graph verified by `bv --robot-graph`
- **For full mechanics, read** `references/phases.md` **Section 2**

### Phase 3: Spike
**Source: Technical discovery sprint (unique)**

For any bead with MEDIUM or HIGH risk, or any technology not yet validated in CLAUDE.md. Define machine-verifiable success criteria first, work on an isolated `spike/<bead-id>-<slug>` branch, build minimal proof-of-concept only, time-box to 2 hours maximum. A Ralph completion promise prevents early exit: all success criteria must be evaluated, one alternative approach considered, and edge cases documented.

Stop/Go gate outcomes:
- **GO** → Update bead `design` field, add to CLAUDE.md `## Validated Approaches`, archive branch
- **CONDITIONAL GO** → Document blocking conditions as new beads, require human decision
- **STOP** → Add to CLAUDE.md `## Anti-Patterns`, trigger Phase 1 brainstorm for alternative

- **Handoff artifact**: `docs/spikes/YYYY-MM-DD-<bead-id>-spike.md` + updated bead `design` field + CLAUDE.md entry
- **For full mechanics, read** `references/phases.md` **Section 3**

### Phase 4: Execute
**Source: GSD wave execution + Ralph completion promise + Agent Mail coordination**

Wave-based bead execution. Each session starts with: read `AGENTS.md`, run `am macro_start_session`, run `bv --robot-triage` for next bead. Per-bead protocol: claim bead (`br update <id> --status in-progress`), reserve files (`am file_reservation_paths([...])`), implement, self-review spec compliance then code quality, run tests, commit atomically with bead ID reference (`[bead-<id>] <description>`), release reservations, close bead (`br close <id>`).

Ralph completion promise: agent cannot exit a bead until all acceptance criteria are evaluated, tests pass (or N/A is documented), file reservations are released, and git commit is made.

Execution modes: **Single-agent** (default, sequential), **Multi-session** (2–4 sessions, Agent Mail coordinates), **Swarm** (5+ sessions, large projects only).

- **Handoff artifact**: Merged commits per wave, all bead statuses updated
- **For full mechanics, read** `references/phases.md` **Section 4**

### Phase 5: Compound
**Source: Compound Engineering + CM consolidation (optional)**

Runs after every PR. Five focused sub-agents review the diff, each reading only the diff and its specialization context:

| Reviewer | Focus |
|----------|-------|
| `security-sentinel` | Auth flaws, injection, secrets in code |
| `performance-oracle` | N+1 queries, blocking I/O, recomputes |
| `architecture-strategist` | Boundary violations, coupling, scalability |
| `simplicity-checker` | YAGNI violations, over-engineering |
| `spike-alignment-validator` | Does implementation match validated spike? |

Findings are prioritized: **P0** blocks merge and creates a new bead; **P1** creates a tech-debt bead; **P2** is recorded in CLAUDE.md non-blocking. CLAUDE.md is updated with new conventions and anti-patterns, timestamped.

- **Handoff artifact**: Updated CLAUDE.md, reviewed and merged code
- **For full mechanics, read** `references/phases.md` **Section 5**

---

## Tool Requirements

### Core (Required)

| Tool | Command | Purpose | Used In |
|------|---------|---------|---------|
| beads | `br` | Task storage with three-field structure (description/design/notes) | Phases 2, 4 |
| beads viewer | `bv` | Graph-theory routing, cycle detection, triage, execution order | Phases 2, 4 |
| Agent Mail | `am` | File reservation, inter-agent coordination, session registration | Phase 4 |

At session start, verify core tools:
```bash
br --version   # Must succeed — beads required
bv --version   # Must succeed — beads viewer required
am             # Must succeed — Agent Mail required
```

If any core tool is missing, stop and surface install instructions. Do not proceed without all three.

### Optional Enhancements

| Tool | Command | Purpose | Used In |
|------|---------|---------|---------|
| CASS | `cass` | Cross-session search (avoid re-solving known problems) | Phases 1, 3 |
| CM | `cm` | Three-layer procedural memory with decay | Phases 3, 5 |
| GKG | `gkg` | Codebase knowledge graph (definitions, references, repomap) | Phases 1, 2, 3, 4 |

Optional tools degrade gracefully — if unavailable, note in session context and use alternative approaches (manual file search, CLAUDE.md lookup).

For tool detection protocol, availability checks, and graceful degradation patterns, read `references/tool-harness.md`.

---

## Key Principles

These six principles govern every decision in the forge workflow:

1. **Beads + bv + Agent Mail are core infrastructure** — always required, never optional. All task state lives in beads, not in conversation history or agent memory.

2. **CASS + CM are optional enhancements** — used when available, gracefully degraded when not. Their absence must never block work.

3. **Extensible tool harness** — GKG, DCP, and future tools plug in through a standard interface. Adding a new tool means checking availability at session start and noting capability in session context.

4. **Single-agent is the default path** — multi-agent swarm is opt-in for large projects only. Start single, scale up only when the bead graph demands parallel execution.

5. **Every phase produces a named artifact** — no agent is ever asked to "remember" earlier conversations. If it isn't written to a file or bead, it doesn't exist.

6. **Progressive complexity** — tiny tasks skip phases; large tasks use the full pipeline. Scale detection happens before any other work. The overhead of phases must be proportional to task complexity.

---

## Session Start Protocol

Every agent, every session, runs this exact sequence before touching any code:

```
1. Read AGENTS.md               — full operating manual, tool blurbs, coordination rules
2. am macro_start_session       — register session, check Agent Mail, note file reservations
3. Read CLAUDE.md               — conventions, anti-patterns, validated approaches
4. bv --robot-triage            — get graph analysis and next bead recommendation
5. Check bead design fields     — review spike results for any in-progress beads
6. Verify tool availability     — br, bv, am (core); cass, cm, gkg (optional)
```

Do not skip steps 1–3 even if you think you remember the project context. Context compaction silently erases memory. AGENTS.md and CLAUDE.md are the source of truth.

If `AGENTS.md` or `CLAUDE.md` does not exist, run Phase 0 (Bootstrap) before anything else.

---

## Recovery

When context compaction is detected, build failures occur, or agents become stuck:

1. Re-read `AGENTS.md` and `CLAUDE.md` to restore operating context
2. Re-read the current bead (description + design + notes)
3. Check Agent Mail for messages from other agents
4. Resume from the last git commit — never re-execute already-committed work
5. If build failures persist after 2 attempts, escalate by sending an Agent Mail message to the human and opening a blocking bead

For full recovery procedures covering context loss, cascading build failures, deadlocked reservations, and stuck agents, read `references/recovery-protocol.md`.
