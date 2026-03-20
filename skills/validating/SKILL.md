---
name: validating
description: |
  The critical gate between planning and execution in the khuym ecosystem. Load this skill after planning completes and before swarming begins. Verifies plan soundness across 8 structural dimensions, executes time-boxed spikes for HIGH-risk items, polishes beads with bv graph analytics, and requires explicit user approval before any code is written. Prevents executing broken plans, hitting unknown blockers mid-swarm, and redundant duplicate work. Use when you hear "plan is ready", "beads created", "time to build", "start executing", or any transition from planning to execution.
metadata:
  version: '1.0'
  position: 3
  chain: exploring → planning → validating → swarming
---

# Validating

> "Don't jump off the wall without checking."
> — The khuym principle on verification

## Why This Skill Exists

Research across hundreds of agentic coding failures reveals a consistent pattern: broken plans executed at full speed. The damage happens quietly. An agent completes 40 beads in 3 hours, then hits a dependency cycle at bead 41. Or a spike-worthy integration assumption turns out to be wrong. Or two parallel tracks were writing to the same file the whole time.

**GSD's core principle:** "Plans are not executed until they pass verification." The Flywheel prescribes 4–6+ bead polishing rounds before any agent touches code. V3's spike phase proves that HIGH-risk items must be validated in isolation before committing an entire swarm to them.

This skill IS that verification. Skipping it is the single highest-probability cause of wasted work in the khuym pipeline. Every hour spent here saves 10+ hours of swarm rework.

**What this skill prevents:**
- Structural plan failures caught only after 40+ beads execute
- HIGH-risk blockers discovered mid-swarm with no escape path
- Parallel tracks silently writing to the same files
- Beads too large for a single agent context
- Missing dependencies that break execution order
- Redundant duplicate beads creating double work
- Requirements in CONTEXT.md not covered by any bead

---

## Prerequisites — Read Before Starting

You need all of these. If any are missing, do not proceed — return to the appropriate upstream skill.

- `history/<feature>/CONTEXT.md` — locked decisions from exploring
- `history/<feature>/discovery.md` — research findings from planning
- `history/<feature>/approach.md` — synthesis + risk map (with HIGH/MEDIUM/LOW risk levels)
- `.beads/` — all bead files for this epic
- `history/<feature>/execution-plan.md` — tracks and wave assignments from planning

---

## Phase 1: Plan Verification

**Maximum 3 iterations. Plans do not advance until this passes.**

### Step 1.1 — Spawn Plan-Checker

Load `references/plan-checker-prompt.md`. Spawn a subagent (Task tool, isolated context) with:

```
Inputs: all .beads/*.md for this epic, CONTEXT.md, discovery.md, approach.md
Role: plan-checker
Instructions: references/plan-checker-prompt.md
```

The plan-checker verifies across **8 dimensions** (full criteria in `references/plan-checker-prompt.md`):

| # | Dimension | The Question |
|---|-----------|-------------|
| 1 | Requirement coverage | Does every CONTEXT.md decision map to at least one bead? |
| 2 | Dependency correctness | Are all bead dependencies valid? Any cycles? |
| 3 | File scope isolation | Do parallel tracks have overlapping file scopes? |
| 4 | Context budget | Is each bead completable in a single agent context window? |
| 5 | Test coverage | Does every bead have explicit verification criteria? |
| 6 | Gap detection | Any requirements not covered by any bead? |
| 7 | Risk alignment | Do HIGH-risk items from approach.md have corresponding spikes? |
| 8 | Completeness | Would completing all beads deliver the feature as specified? |

### Step 1.2 — Triage Results

The plan-checker returns a structured report with `PASS` or `FAIL` per dimension, plus specific bead IDs and issues.

**If all 8 dimensions PASS:** Proceed to Phase 2.

**If any dimension FAILS:**
1. Fix the specific beads identified (update via `bd`)
2. Re-run plan-checker on the changed beads
3. Count this as iteration 2

**After 3 iterations with any dimension still failing:**
- Do NOT attempt to fix further on your own
- STOP and escalate to user with: the failing dimension, specific beads that failed, what was tried
- The plan has a structural problem that needs human judgment

> **Red flag:** If you find yourself "massaging" a bead to technically pass the checker rather than genuinely fixing the issue — stop. The checker exists to catch real problems. Gaming it defeats the entire purpose of this phase.

---

## Phase 2: Spike Execution

**For every HIGH-risk component identified in approach.md.**

If approach.md has no HIGH-risk items, skip to Phase 3.

A spike is a time-boxed proof-of-concept that answers one specific uncertain question before the full swarm commits to an approach. A spike that returns NO is worth its weight in gold — it just saved the entire swarm from building on a false assumption.

### Step 2.1 — Create Spike Beads

For each HIGH-risk item:

```bash
bd create "Spike: <specific question to answer>" -t task -p 0
# Example: bd create "Spike: Can we use WebSockets with this auth middleware?" -t task -p 0
```

The spike question must be specific. "Spike: Is Redis feasible?" is too vague. "Spike: Does our Redis setup support pub/sub with >1000 subscribers without message loss?" is correct.

### Step 2.2 — Execute Spikes in Isolation

For each spike bead:

1. Spawn an isolated subagent (Task tool) with:
   - The spike bead content
   - Relevant CONTEXT.md sections
   - The approach.md risk description for this item
   - Output path: `.spikes/<feature>/<spike-id>/`

2. **Hard time-box: 30 minutes.** The spike subagent must:
   - Write findings to `.spikes/<feature>/<spike-id>/FINDINGS.md`
   - Close with a definitive YES or NO:
     ```bash
     bd close <id> --reason "YES: <validated approach and any constraints>"
     # or
     bd close <id> --reason "NO: <blocker description and why it prevents the approach>"
     ```

3. There is no "partial" or "uncertain" — the spike must yield a determination.

### Step 2.3 — Act on Spike Results

**If spike returns YES:**
- Embed the spike findings in all affected beads' Notes field
- The validated approach becomes a locked constraint for those beads
- Continue to Phase 3

**If spike returns NO:**
- **FULL STOP. Do not proceed to Phase 3.**
- The planned approach for this HIGH-risk item is blocked
- Write a blocker summary to `history/<feature>/approach.md` with the spike findings
- Invoke planning skill to revise the approach for the blocked component
- Re-run validating from Phase 1 after the new plan is created

> **The NO path is not a failure — it is the spike working correctly.** Finding a blocker here, before the swarm launches, costs minutes. Finding the same blocker at bead 60 costs the entire execution.

---

## Phase 3: Bead Polishing

**Multiple rounds. Quality compounds with each pass.**

Beads that seem complete in isolation often have subtle issues — missing dependencies, ambiguous scope, overlapping responsibility. The Flywheel prescribes 4–6+ polishing rounds for this reason. We run 3 structured rounds with `bv`, plus a human-perspective pass.

### Round 1: Dependency Completeness

```bash
bv --robot-suggest
```

Reviews the bead graph and suggests missing dependency links. For each suggestion:
- Evaluate whether the dependency is real (would bead B actually fail without bead A?)
- Add valid dependencies: `bd dep add <id> <other-id>`
- Ignore suggestions that are speculative rather than structural

If `--robot-suggest` returns more than 5 suggestions, fix them and **re-run Round 1** before proceeding. Up to 3 sub-rounds.

### Round 2: Graph Health

```bash
bv --robot-insights
```

Detects structural problems: dependency cycles, bottleneck beads, disconnected subgraphs, beads with no path to completion. For each insight:
- Cycles: break by reordering or splitting the implicated beads
- Bottlenecks: consider whether the bottleneck bead is doing too much
- Disconnected beads: verify they belong to this epic or remove them

If `--robot-insights` returns any CRITICAL findings, fix and re-run. Up to 3 sub-rounds.

### Round 3: Priority Sanity

```bash
bv --robot-priority
```

Validates that bead priorities align with the dependency graph — high-blocking beads should have high priority, leaf beads should have lower priority. Adjust priorities via `bd update <id> --priority <p>` where needed.

### Deduplication Check

Read all bead titles and descriptions. Flag any beads that appear to be doing the same work:
- Same file scope + similar description → likely duplicate
- Different file scope but identical description → possible split of a single concern
- Same description, different epic → should reference, not duplicate

For confirmed duplicates: merge content into one bead, close the redundant one with `bd close <id> --reason "Duplicate of <id>"`.

### Fresh-Eyes Review

Load `references/bead-reviewer-prompt.md`. Spawn a subagent with:

```
Inputs: all .beads/*.md for this epic (full content, not just titles)
Role: bead-reviewer
Instructions: references/bead-reviewer-prompt.md
```

The bead-reviewer has no context from planning sessions — it reads beads cold, the same way an executing agent will. It flags:
- Beads that assume context only the planner knows
- Ambiguous acceptance criteria ("add proper error handling" — not actionable)
- Missing implementation hints that will force the executor to guess
- Scope too large for a single context window

Fix all CRITICAL flags before Phase 4. MINOR flags are recommendations; use judgment.

---

## Phase 4: Final Approval Gate

**This gate is non-negotiable. No auto-approval. No exceptions.**

You have now run three phases of verification. Present a structured summary to the user. This is their only opportunity to redirect before the swarm launches and commits begin accumulating.

### Present to User

```
VALIDATION COMPLETE — APPROVAL REQUIRED BEFORE EXECUTION

Plan Summary:
- Beads: <N> total | <N> open | <N> tracks
- Waves: <N> waves | estimated <N> parallel agents at peak

Plan Verification (Phase 1):
- All 8 dimensions: PASS (after <N> iterations)
- OR: <dimension> required <N> revisions

Spike Results (Phase 2):
- HIGH-risk items: <N>
- All spikes: PASSED / [list any concerns]
- Spike learnings embedded: YES

Bead Polishing (Phase 3):
- bv --robot-suggest: <N> dependencies added
- bv --robot-insights: <N> issues resolved
- bv --robot-priority: <N> adjustments made
- Duplicates removed: <N>
- Fresh-eyes flags resolved: <N> CRITICAL, <N> MINOR

Risk Assessment:
- Unresolved concerns: <none | list>
- Confidence level: HIGH / MEDIUM (if any open questions remain)

Beads validated. Approve for execution? (yes/no)
```

### If User Approves

Update `.khuym/STATE.md`:
```
PHASE: validated
FEATURE: <feature-name>
VALIDATED_AT: <timestamp>
BEADS: <N>
TRACKS: <N>
```

Handoff: "Validation complete. All checks pass. Invoke swarming skill."

### If User Rejects

Ask the user specifically:
1. Which aspect concerns them?
2. Is it a plan structure issue → loop back to Phase 1
3. Is it a risk concern → loop back to Phase 2 (create new spike)
4. Is it a bead quality issue → loop back to Phase 3
5. Is it a fundamental approach problem → return to planning skill

Do not guess. Ask specifically. Then loop back to the right phase.

---

## Lightweight Mode (Single Bead / LOW-Risk Only)

For quick fixes or single-bead features where approach.md classifies everything as LOW risk:

1. **Phase 1 abbreviated:** Run plan-checker on the single bead only. Verify dimensions 1, 4, 5, 8.
2. **Phase 2 skipped:** No HIGH-risk items means no spikes needed.
3. **Phase 3 abbreviated:** Run `bv --robot-suggest` only. Skip fresh-eyes for single beads.
4. **Phase 4 unchanged:** Hard gate still applies. Always present and always wait for approval.

> Lightweight mode is for confirmed LOW-risk single-bead work. If you are uncertain whether to use lightweight mode, use full mode.

---

## Red Flags — Stop Immediately If You See These

- You are executing any bead before Phase 4 approval — **STOP**
- The plan-checker found a cycle and you "fixed" it by removing the dependency rather than restructuring — **undo and fix properly**
- A spike returned NO and you are proceeding anyway — **STOP**
- Phase 4 approval was given by the orchestrating agent, not the user — **not valid; re-request from user**
- You are on iteration 4 of plan verification — **escalate; do not attempt iteration 4**
- A bead's context budget requires >3 large file reads plus implementation — **split it**

---

## Reference Files

| File | When to Load |
|------|-------------|
| `references/plan-checker-prompt.md` | Phase 1 — spawn the plan-checker subagent |
| `references/bead-reviewer-prompt.md` | Phase 3 fresh-eyes — spawn the bead-reviewer subagent |
