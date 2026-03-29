---
name: khuym:planning
description: >-
  Research, synthesize, and decompose features into executable beads. Use after
  khuym:exploring skill completes. Runs goal-oriented discovery (architecture, patterns,
  constraints, external research), synthesis via subagent into approach and risk
  map, multi-perspective refinement for HIGH-stakes features, and bead creation
  via br create. Reads CONTEXT.md from exploring. Writes discovery.md,
  approach.md, and creates .beads/ files. Invoked when user says plan this,
  create beads, research and plan, or when exploring handoff says Invoke
  khuym:planning skill.
---

# Planning Skill

If `.khuym/onboarding.json` is missing or stale for the current repo, stop and invoke `khuym:using-khuym` before continuing.

Research the codebase, synthesize an approach, and decompose into beads — guided entirely by `CONTEXT.md` from exploring.

> "Planning is the cheapest place to buy correctness. A bug caught in plan space costs 25× less to fix than one caught in code space." — Flywheel Complete Guide

## Pipeline Overview

```
CONTEXT.md (from exploring)
  ↓
Phase 0: Learnings Retrieval      → inject institutional knowledge
Phase 1: Discovery (parallel)     → history/<feature>/discovery.md
Phase 2: Synthesis (subagent)     → history/<feature>/approach.md
Phase 3: Multi-Perspective        → approach.md refined (HIGH-stakes only)
Phase 4: Decomposition (Beads)    → .beads/*.md via br create
  ↓
Handoff: "Invoke khuym:validating skill"
```

## Before You Start

**Read CONTEXT.md first.** It is the single source of truth. Every research decision, every bead created, must honor the locked decisions inside it.

```bash
cat history/<feature>/CONTEXT.md
```

If CONTEXT.md does not exist, stop. Tell the user: "Run the khuym:exploring skill first to lock decisions before planning."

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

## Phase 1: Discovery (Goal-Oriented Exploration)

Map the codebase, identify constraints, and research external patterns to the
depth the feature actually requires. You decide how many parallel agents to
spawn and what each explores.

### Available Tools

All discovery subagents have access to these tools — use what the area requires:

| Tool | What it's for |
|------|---------------|
| `gkg repo_map` | Codebase structure (directories, modules, entry points) |
| `gkg search_codebase_definitions` | Find functions, classes, interfaces by name/concept |
| `gkg get_references` | Find all usages of a symbol across the codebase |
| `gkg import_usage` | Trace what imports what — identify coupling |
| `gkg read_definitions` | Read actual implementation bodies |
| `grep` | Pattern search across files |
| `Read` | Direct file reading |
| `web_search` | External docs, community patterns, known gotchas |
| `WebFetch` | Specific library documentation pages |

### Discovery Areas

These are the areas to cover. Not all features need all areas explored with the
same depth — calibrate based on what CONTEXT.md tells you is being built.

**Always explore:**

1. **Architecture topology** — Where does this feature fit in the codebase?
   Which packages/modules are relevant? What are the entry points (API routes,
   UI screens, server handlers) this feature will touch or add?

2. **Existing patterns** — What similar implementations already exist that this
   feature should model after or reuse? What utilities, error handling, and
   naming conventions are in use?

3. **Technical constraints** — What runtime versions, framework versions, and
   existing dependencies are in play? What new dependencies does this feature
   need that aren't yet installed? What are the build requirements (typecheck,
   lint, test commands)?

**Explore if relevant:**

4. **External research** — Only if the feature introduces new libraries, APIs,
   integrations, or approaches that have no precedent in the codebase. If
   everything builds on existing patterns, skip this. If it's genuinely novel,
   use web_search and WebFetch to find library docs, community patterns, and
   known gotchas.

### Parallelization Guidance

Spawn parallel subagents when exploration areas are independent (they
usually are — architecture/pattern/constraint research don't block each other).

- **Standard feature** (builds on existing patterns): 2–3 agents covering
  areas 1–3. Skip external research.
- **New integration/library**: 3–4 agents including external research.
- **Pure refactor**: 1–2 focused agents on existing patterns and constraints.
- **Architecture change**: Go deep on area 1 and 2; add adversarial research
  on patterns you're replacing.

There is no magic in the number 4. Match the agent count to the exploration need.

### Output

All agents write their findings to sections within:
`history/<feature>/discovery.md`

See `references/discovery-template.md` for the required document structure.

---

## Phase 2: Synthesis

Spawn a synthesis subagent to close the gap between codebase reality and feature requirements.

```
Subagent(
  prompt: """
You are a senior architect performing synthesis. Your job is to close the gap
between what the codebase currently is and what the feature requires.

Read these files first:
- history/<feature>/CONTEXT.md  — decisions are LOCKED, honor them exactly
- history/<feature>/discovery.md — codebase findings from parallel research

Produce history/<feature>/approach.md with exactly these four sections:

1. **Recommended Approach** — a specific strategy, not "option A vs B"
2. **Alternatives Considered** — what was evaluated and rejected, and why
3. **Risk Map** — every component rated LOW / MEDIUM / HIGH with rationale
4. **Decision Rationale** — why this approach over the alternatives

Risk classification rules:
- Pattern exists in codebase → LOW base risk
- External dependency → HIGH
- Blast radius > 5 files → HIGH
- Novel approach with no codebase precedent → MEDIUM or HIGH
- Otherwise → MEDIUM

Write the completed approach.md to disk.
  """
)
```

The synthesis subagent must produce all four sections:

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

Convert approach.md into executable beads using `br create`. Never write pseudo-beads in markdown — go directly to the CLI.

### Bead Requirements (Non-Negotiable)

Every bead MUST include:
- **Clear title** — action-oriented, e.g., "Implement StripeWebhookHandler" not "Webhook"
- **Description** — what, why, how; enough that a fresh agent can implement without asking questions
- **File scope** — which files this bead touches (for reservation/conflict planning)
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
br create "<Feature Name>" -t epic -p 1
# → br-<epic-id>

# Create task beads, each blocking the epic
br create "<Action: Component>" -t task --blocks br-<epic-id>
# → br-<id>

# Add dependencies between tasks
br dep add br-<id2> br-<id1>  # id2 depends on id1
```

### Bead Decomposition Principles

- One bead = one agent, one context window, ~30-90 minutes of work
- Domain layer beads have no inter-bead dependencies (can parallelize)
- Infrastructure/application layers depend on domain beads
- API/UI layers depend on application beads
- Never create a bead that requires reading 10+ files to implement

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

## Beads Created

N beads. Epic: br-<id>

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

> **Plan created with N beads.**
>
> - Discovery: `history/<feature>/discovery.md`
> - Approach: `history/<feature>/approach.md`
> - HIGH-risk components flagged: [list or "none"]
>
> **Invoke khuym:validating skill before execution.**

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
- **Writing pseudo-beads in markdown** — Beads that aren't created with `br create` don't exist in the graph. Go to the CLI.
- **Beads with no file scope** — Workers and validators need file scopes to reason about reservations and conflicts.
- **HIGH-risk items with no risk flag** — Validating needs to know which items require spikes. Mark them clearly in approach.md.
- **Missing dependencies between beads** — The bv dependency graph breaks. Use `br dep add` explicitly.
