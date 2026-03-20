---
name: planning
description: >-
  Research, synthesize, and decompose features into executable beads. Use after
  exploring skill completes. Runs parallel discovery (architecture, patterns,
  constraints, external research), oracle synthesis into approach and risk map,
  multi-perspective refinement for HIGH-stakes features, bead creation via
  bd create, and execution-plan.md generation. Reads CONTEXT.md from exploring.
  Writes discovery.md, approach.md, execution-plan.md, and creates .beads/
  files. Invoked when user says plan this, create beads, research and plan, or
  when exploring handoff says Invoke planning skill.
---

# Planning Skill

Research the codebase, synthesize an approach, and decompose into beads — guided entirely by `CONTEXT.md` from exploring.

> "Planning is the cheapest place to buy correctness. A bug caught in plan space costs 25× less to fix than one caught in code space." — Flywheel Complete Guide

## Pipeline Overview

```
CONTEXT.md (from exploring)
  ↓
Phase 0: Learnings Retrieval      → inject institutional knowledge
Phase 1: Discovery (4 parallel)   → history/<feature>/discovery.md
Phase 2: Synthesis (Oracle)       → history/<feature>/approach.md
Phase 3: Multi-Perspective        → approach.md refined (HIGH-stakes only)
Phase 4: Decomposition (Beads)    → .beads/*.md via bd create
Phase 5: Track Planning           → history/<feature>/execution-plan.md
  ↓
Handoff: "Invoke validating skill"
```

## Before You Start

**Read CONTEXT.md first.** It is the single source of truth. Every research decision, every bead created, must honor the locked decisions inside it.

```bash
cat history/<feature>/CONTEXT.md
```

If CONTEXT.md does not exist, stop. Tell the user: "Run the exploring skill first to lock decisions before planning."

---

## Phase 0: Learnings Retrieval

Institutional knowledge prevents re-solving solved problems. This phase is mandatory — it takes 60 seconds and can save hours.

**Step 1: Always read critical patterns**

```bash
cat history/learnings/critical-patterns.md  # Read unconditionally
```

**Step 2: Grep for domain-relevant learnings**

Extract 3-5 domain keywords from the feature name and CONTEXT.md (e.g., "auth", "stripe", "webhook", "upload"). Then run parallel greps:

```bash
# Run IN PARALLEL, case-insensitive
grep -r "tags:.*<keyword1>" history/learnings/ -l -i
grep -r "tags:.*<keyword2>" history/learnings/ -l -i
grep -r "<ComponentName>" history/learnings/ -l -i
```

**Step 3: Score and include**

- Strong match (module or tags align) → read full file, include insights in discovery context
- Weak match → skip

**Step 4: Document what you found**

At the top of `history/<feature>/discovery.md`, add an "Institutional Learnings" section listing any key insights and gotchas surfaced. If nothing found, write: "No prior learnings for this domain."

---

## Phase 1: Discovery (Parallel Exploration)

Spawn 4 agents simultaneously. Each writes findings to `history/<feature>/discovery.md`.

```
Task() → Agent A: Architecture snapshot
Task() → Agent B: Pattern search (similar existing code)
Task() → Agent C: Constraints analysis
Task() → Agent D: External research
```

### Agent A: Architecture Snapshot

```
Goal: Map codebase structure relevant to this feature.
Tools: gkg repo_map, gkg search_codebase_definitions, file tree
Output sections:
  - Relevant packages/modules and their purpose
  - Entry points (API, UI, server)
  - Key files to model after
```

### Agent B: Pattern Search

```
Goal: Find existing implementations similar to this feature.
Tools: grep (codebase), gkg get_references, semantic search
Output sections:
  - Similar existing implementations (file + pattern name)
  - Reusable utilities (validation, error handling, shared logic)
  - Naming conventions in use
```

### Agent C: Constraints Analysis

```
Goal: Identify hard technical constraints.
Tools: Read package.json, tsconfig, .env.example, lockfile
Output sections:
  - Runtime versions and key framework versions
  - Existing dependencies relevant to this feature
  - New dependencies needed (not yet installed)
  - Build requirements (type-check, lint, test commands)
```

### Agent D: External Research

```
Goal: Research external patterns, libraries, prior art.
Tools: web_search, librarian, library docs (MCP Docker)
Guided by CONTEXT.md decisions — research the specific patterns
  the user's locked decisions call for, not generic domain research.
Output sections:
  - Library docs for any new dependencies
  - Community patterns for the approach
  - Known gotchas and anti-patterns to avoid
```

**Save all findings to:** `history/<feature>/discovery.md`

See `references/discovery-template.md` for the required structure.

---

## Phase 2: Synthesis (Oracle)

Feed discovery + CONTEXT.md to Oracle for gap analysis and approach design.

```
oracle(
  task: "Analyze gap between codebase and feature requirements. 
         Produce: recommended approach, alternatives considered, 
         risk map with LOW/MEDIUM/HIGH per component, decision rationale.",
  context: "CONTEXT.md decisions are LOCKED — honor them exactly.",
  files: [
    "history/<feature>/CONTEXT.md",
    "history/<feature>/discovery.md"
  ]
)
```

Oracle must produce all four sections:

1. **Recommended Approach** — specific strategy, not "option A vs B"
2. **Alternatives Considered** — what was evaluated and rejected, and why
3. **Risk Map** — every component rated LOW/MEDIUM/HIGH with rationale
4. **Decision Rationale** — why this approach over alternatives

### Risk Classification

| Level | Criteria | Action |
|-------|----------|--------|
| LOW | Pattern exists in codebase | Proceed |
| MEDIUM | Variation of existing pattern | Interface sketch optional |
| HIGH | Novel, external dep, blast radius >5 files | Note for validating to spike |

```
Pattern in codebase? → YES = LOW base
External dependency?  → YES = HIGH
Blast radius >5 files? → YES = HIGH
Otherwise → MEDIUM
```

**Save to:** `history/<feature>/approach.md`

See `references/approach-template.md` for the required structure.

---

## Phase 3: Multi-Perspective Refinement

**Only for HIGH-stakes features** (multiple HIGH-risk components, architectural decisions with long-term consequences, or features touching core infrastructure).

For standard features, skip to Phase 4.

### When to Apply

Run Phase 3 if approach.md contains 2+ HIGH-risk components, OR if the feature is architectural in nature (changes data models, API contracts, auth flows, etc.).

### How to Run

Spawn a subagent (or use a fresh context) with only the approach.md and this adversarial prompt:

```
You are a senior architect reviewing this plan for blind spots.

Read: history/<feature>/approach.md

Answer:
1. What does this approach assume that could be wrong?
2. What failure modes are not addressed?
3. What will the team regret 6 months from now?
4. What's missing from the risk map?

Be specific. Cite sections. Suggest concrete changes.
```

Iterate approach.md 1-2 rounds based on findings. Stop when changes are incremental.

**Do not run 4-5 refinement rounds** — that is the Flywheel's extreme methodology. 1-2 rounds is sufficient for khuym's workflow.

---

## Phase 4: Decomposition (Beads)

Convert approach.md into executable beads using `bd create`. Never write pseudo-beads in markdown — go directly to the CLI.

### Bead Requirements (Non-Negotiable)

Every bead MUST include:
- **Clear title** — action-oriented, e.g., "Implement StripeWebhookHandler" not "Webhook"
- **Description** — what, why, how; enough that a fresh agent can implement without asking questions
- **File scope** — which files this bead touches (for track assignment)
- **Dependencies** — explicit bead IDs it depends on (use `--deps`)
- **Verification criteria** — how the agent knows it's done

### Embed Learnings in Beads

For any HIGH-risk component, embed the relevant institutional learnings and approach decisions directly in the bead description:

```markdown
## Context from Planning

From approach.md: [the specific decision that applies to this bead]

## Institutional Learnings

From history/learnings/<file>:
- [Key gotcha or pattern that applies here]
```

### Create Epic First, Then Tasks

```bash
# Create epic
bd create "<Feature Name>" -t epic -p 1
# → bd-<epic-id>

# Create task beads, each blocking the epic
bd create "<Action: Component>" -t task --blocks bd-<epic-id>
# → bd-<id>

# Add dependencies between tasks
bd dep add bd-<id2> bd-<id1>  # id2 depends on id1
```

### Bead Decomposition Principles

- One bead = one agent, one context window, ~30-90 minutes of work
- Domain layer beads have no inter-bead dependencies (can parallelize)
- Infrastructure/application layers depend on domain beads
- API/UI layers depend on application beads
- Never create a bead that requires reading 10+ files to implement

---

## Phase 5: Track Planning

Generate execution-plan.md so the swarming skill can spawn workers immediately.

### Step 1: Get Parallel Tracks

```bash
bv --robot-plan 2>/dev/null | jq '.plan.tracks'
```

### Step 2: Assign File Scopes

For each track:
- Identify files touched by each bead in the track
- Use glob patterns: `packages/domain/**`, `apps/server/**`
- File scopes MUST NOT overlap between tracks
- If overlap is unavoidable → merge into one track

### Step 3: Assign Agent Names

Give each track a memorable adjective+noun name (BlueLake, GreenCastle, RedStone). These are identifiers, not role descriptions.

### Step 4: Write Execution Plan

Save to `history/<feature>/execution-plan.md`:

```markdown
# Execution Plan: <Feature Name>

Epic: <epic-id>
Generated: <date>

## Tracks

| Track | Agent       | Beads (in order)      | File Scope        |
| ----- | ----------- | --------------------- | ----------------- |
| 1     | BlueLake    | bd-10 → bd-11 → bd-12 | `packages/sdk/**` |
| 2     | GreenCastle | bd-20 → bd-21         | `packages/cli/**` |

## Track Details

### Track 1: BlueLake

**File scope**: `packages/sdk/**`
**Beads**:
1. `bd-10`: <title> — <brief description>

## Cross-Track Dependencies

- Track 2 can start after bd-11 completes
- Track 3 is independent

## Wave Assignments

Wave 1 (independent): Track 1, Track 2
Wave 2 (after Wave 1): Track 3

## Key Decisions (from approach.md)

- [Summary of architectural choices for swarming context]
```

### Step 5: Validate Graph

```bash
bv --robot-insights 2>/dev/null | jq '.Cycles'    # Must be empty
bv --robot-plan 2>/dev/null | jq '.plan.unassigned'  # Must be empty
```

Fix any cycles or unassigned beads before handoff.

---

## Update STATE.md

After every major phase transition, update `.khuym/STATE.md`:

```markdown
## Current State

Skill: planning
Phase: [current phase name]
Feature: <feature-name>

## Artifacts Written

- history/<feature>/discovery.md ← Phase 1 complete
- history/<feature>/approach.md ← Phase 2 complete
- .beads/*.md ← Phase 4 complete
- history/<feature>/execution-plan.md ← Phase 5 complete

## Beads Created

N beads in M tracks. Epic: bd-<id>

## Risk Summary

HIGH-risk components: [list] → flagged for validating to spike
```

---

## Context Budget

If context exceeds 65% at any phase transition, write `HANDOFF.json` and pause:

```json
{
  "skill": "planning",
  "feature": "<feature-name>",
  "completed_through": "Phase <N>",
  "next_phase": "Phase <N+1>",
  "artifacts": ["list of written files"],
  "beads_created": ["list of bead IDs"]
}
```

---

## Handoff

On successful completion:

> **Plan created with N beads in M tracks.**
>
> - Discovery: `history/<feature>/discovery.md`
> - Approach: `history/<feature>/approach.md`
> - Execution plan: `history/<feature>/execution-plan.md`
> - HIGH-risk components flagged: [list or "none"]
>
> **Invoke validating skill before execution.**

HARD-GATE: Do not hand off to swarming directly. Validating is the gate that verifies plan correctness before any code is written.

---

## Boundary Clarifications

**Planning READS** `CONTEXT.md` — it does NOT modify or override locked decisions.

**Planning CREATES** draft beads — validating will verify and polish them.

**Planning does the research** that exploring deliberately avoided. Exploring locks decisions; planning researches how to honor them.

**Planning does NOT run spikes** — that is validating's job (validating Phase 2).

---

## Red Flags

- **Skipping Phase 0** — You will re-discover learnings the team already has. Always read critical-patterns.md.
- **Ignoring CONTEXT.md** — You produce a plan the user didn't ask for. Locked decisions are locked.
- **Writing pseudo-beads in markdown** — Beads that aren't created with `bd create` don't exist in the graph. Go to the CLI.
- **Beads with no file scope** — The swarming skill cannot assign tracks without file scopes.
- **HIGH-risk items with no risk flag** — Validating needs to know which items require spikes. Mark them clearly in approach.md.
- **Missing dependencies between beads** — The bv dependency graph breaks. Use `bd dep add` explicitly.
- **Skipping bv validation** — Cycles and unassigned beads will break the swarm. Run the checks.
