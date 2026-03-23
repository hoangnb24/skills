# Go Mode Pipeline — Step-by-Step Reference

> Load this when executing go mode. Contains the detailed sequence, gate conditions, fallback paths, and config options.
>
> Source patterns: CE `/lfg` + `/slfg`, GSD phase loop with plan-checker and verifier, khuym architecture v2.

---

## Overview

Go mode is the full khuym pipeline from raw feature request to merged, compounded learnings. It chains every skill in sequence with exactly 3 human gates. The pipeline is designed so that each phase validates something the next phase depends on.

```
User: "/go [feature]"
       │
       ▼
[BOOTSTRAP] Check state, read critical-patterns.md
       │
       ▼
[STEP 1] exploring
       │ Output: history/<feature>/CONTEXT.md
       │
       ▼
[GATE 1] ← HARD STOP: "Approve CONTEXT.md?"
       │
       ▼
[STEP 2] planning
       │ Output: approach.md, beads
       │
       ▼
[STEP 3] validating
       │ Plan-checker (≤3×) + spikes + bead polish
       │
       ▼
[GATE 2] ← HARD STOP: "Beads verified. Approve execution?"
       │
       ▼
[STEP 4] swarming → executing (×N parallel workers)
       │ Self-routing workers via Agent Mail + bv
       │
       ▼
[STEP 5] reviewing
       │ 5 parallel review agents → P1/P2/P3 findings
       │ Artifact verification (exists → substantive → wired)
       │ Human UAT
       │
       ▼
[GATE 3] ← HARD STOP: P1? "Fix before merge." | No P1? "Approve merge?"
       │
       ▼
[STEP 6] compounding
       │ Capture learnings → history/learnings/
       │
       ▼
DONE
```

---

## Pre-Pipeline: Bootstrap

Before invoking `khuym:exploring`, always:

1. Run State Bootstrap from SKILL.md (check .khuym/, read critical-patterns.md).
2. Determine feature slug from user's description (lowercase-hyphenated, e.g., `user-auth`).
3. Create `history/<feature>/` directory if it doesn't exist.
4. Write `.khuym/STATE.md`:
   ```
   focus: <feature>
   phase: go-mode/exploring
   pipeline: go
   last_updated: <timestamp>
   ```

---

## Step 1: Exploring

**Invoke:** Load `khuym:exploring` skill.

**Input:** User's feature description.

**The khuym:exploring skill will:**
- Classify domain (SEE / CALL / RUN / READ / ORGANIZE)
- Identify gray areas via Socratic Q&A (one question at a time, HARD-GATE per answer)
- Lock decisions with stable IDs (D1, D2, ...)
- Write `history/<feature>/CONTEXT.md`
- Self-review CONTEXT.md via subagent

**Update STATE.md:** `phase: go-mode/gate-1`

---

## GATE 1: Approve CONTEXT.md

```
HARD-GATE: Do not proceed until user explicitly approves.

Present:
  "Exploration complete for [feature].
   [N] decisions locked in history/<feature>/CONTEXT.md.
   [M] open questions noted.
   
   Key decisions:
   - D1: [summary]
   - D2: [summary]
   ... (max 5, then "see CONTEXT.md for full list")
   
   Approve decisions and proceed to planning? (yes / revise / show full CONTEXT.md)"

If user says "revise": identify which decisions to re-examine, loop back to exploring.
If user says "yes": proceed to Step 2.
```

---

## Step 2: Planning

**Invoke:** Load `khuym:planning` skill.

**Input:** `history/<feature>/CONTEXT.md`, `history/learnings/critical-patterns.md`.

**The khuym:planning skill will:**
- Phase 0: Retrieve relevant past learnings (grep history/learnings/ by domain tags)
- Phase 1: Parallel discovery agents (architecture, patterns, constraints, external)
- Phase 2: Oracle synthesis → approach.md with risk levels (LOW/MEDIUM/HIGH)
- Phase 3: Multi-perspective refinement (for HIGH-stakes features: second model opinion)
- Phase 4: Decompose to beads (br create, never pseudo-beads)

**Update STATE.md:** `phase: go-mode/validating`

---

## Step 3: Validating

**Invoke:** Load `khuym:validating` skill.

**Input:** `.beads/`, `approach.md`, `CONTEXT.md`, `discovery.md`.

**The khuym:validating skill will:**
- Phase 1: Plan-checker loop (≤3 iterations, 8 dimensions)
  - All 8 dimensions must pass before proceeding
  - If still failing after 3 iterations: surface to user, do not proceed
- Phase 2: Spike execution for all HIGH-risk items
  - If spike FAILS: STOP. Return to planning. Do not proceed.
  - If spike PASSES: embed learnings in bead descriptions
- Phase 3: Bead polishing (bv --robot-suggest, --robot-insights, --robot-priority)
  - Deduplication check
  - Fresh-eyes review subagent

**Update STATE.md:** `phase: go-mode/gate-2`

---

## GATE 2: Approve Execution

```
HARD-GATE: This is the most critical gate. Do not proceed until user explicitly approves.

Present:
  "Validation complete for [feature].
   [N] beads ready for execution.
   Risk: [X] HIGH items → spikes: [all passed / N failed]
   
   Any unresolved concerns: [list or "none"]
   
   Beads verified. Approve execution? (yes / review beads / no — revise plan)"

If user says "no" or "revise": identify concern, loop back to planning or validating.
If user says "yes": proceed to Step 4.
```

---

## Step 4: Swarming + Executing

**Invoke:** Load `khuym:swarming` skill.

**The khuym:swarming skill will:**
- Initialize Agent Mail (ensure_project, register_agent as Orchestrator)
- Spawn workers via Task tool (each loads `khuym:executing` skill)
- Each worker: register → bv --robot-priority → reserve files → implement bead → br close → report → loop
- Monitor via Agent Mail (blockers, file conflicts, completion reports, context handoffs)
- Tend the swarm with overseer broadcasts when needed
- After all work: verify all beads closed (`bv --robot-triage`)

**Context safety:** If paused mid-swarm:
```
Write .khuym/HANDOFF.json:
{
  "phase": "go-mode/swarming",
  "feature": "<feature>",
  "beads_in_flight": [<list>],
  "beads_complete": [<list>],
  "next_action": "Resume swarming from live bead graph + epic thread"
}
```

**Update STATE.md:** `phase: go-mode/reviewing`

---

## Step 5: Reviewing

**Invoke:** Load `khuym:reviewing` skill.

**The khuym:reviewing skill will:**
- Phase 1: Dispatch 5 parallel review agents (isolated context, diff + CONTEXT.md):
  - code-quality-reviewer
  - security-reviewer
  - architecture-reviewer
  - test-coverage-reviewer
  - learnings-synthesizer (always last)
- Phase 2: 3-level artifact verification (exists → substantive → wired)
- Phase 3: Human UAT (walk through testable deliverables from CONTEXT.md)
- Phase 4: Finishing (verify all beads closed, final build/test/lint, PR options)
- Synthesize → P1/P2/P3 findings

**Update STATE.md:** `phase: go-mode/gate-3`

---

## GATE 3: Approve Merge

```
HARD-GATE: Never auto-merge.

Present:
  "Review complete for [feature].
   P1 (blocks merge): [count] — [titles if any]
   P2 (should fix):   [count]
   P3 (nice to have): [count]"

IF P1 > 0:
  "P1 findings block merge. Options:
   (a) Fix P1s now — I'll create fix beads and re-run
   (b) Show P1 details
   (c) Override (requires explicit user confirmation)"
  Wait for user decision.

IF P1 = 0:
  "No blocking findings.
   Ready to [create PR / merge to main / keep branch].
   Approve? (yes / show P2s first / no)"

If fix beads created: after executing fixes, re-run reviewing (partial — diff only on fixes).
```

---

## Step 6: Compounding

**Invoke:** Load `khuym:compounding` skill.

**Input:** Full feature history (CONTEXT.md, approach.md, review findings, execution notes).

**The khuym:compounding skill will:**
- Dispatch 3 analysis subagents: patterns / decisions / failures
- Write `history/learnings/YYYYMMDD-<feature>.md`
- Promote critical items to `history/learnings/critical-patterns.md`
- Optionally index via CASS

**Final update STATE.md:**
```
focus: (none)
phase: idle
last_feature: <feature>
last_updated: <timestamp>
```

**Delete** `.khuym/HANDOFF.json` if it exists (clean state).

---

## Fallback Paths

### If exploring produces a CONTEXT.md the user rejects at GATE 1:
```
→ Identify which decisions need revision
→ Load khuym:exploring skill, focus on those specific gray areas
→ Update CONTEXT.md in place
→ Re-present GATE 1
```

### If validating fails after 3 plan-checker iterations:
```
→ Present failing dimensions to user
→ Ask: "Return to planning with these specific concerns?"
→ Load planning with the failure report as context
→ Re-run validating after new beads created
```

### If a spike fails:
```
→ STOP: do not proceed to GATE 2
→ Present: "Spike [id] failed: [reason]. Approach '[approach]' is blocked."
→ Options: (a) Revise approach, (b) Descope HIGH-risk component, (c) Abandon feature
→ If revise: return to planning Phase 3 with spike failure embedded
```

### If orchestrator context hits 65% mid-swarm:
```
→ Write HANDOFF.json (see above)
→ Present: "Context budget reached. Swarm paused.
            [X] beads complete, [Y] in flight.
            Resume in a new session with HANDOFF.json."
→ End turn gracefully
```

### If P1 findings are present at GATE 3 and user wants to fix:
```
→ Create fix beads via br create for each P1 finding
→ Load khuym:swarming skill (fix-bead swarm only)
→ After execution: re-run reviewing (targeted — fixes diff only)
→ Re-present GATE 3
→ Repeat until P1 = 0 or user explicitly overrides
```

---

## Config Options (.khuym/config.json)

Absent = enabled (GSD pattern). Only set to disable.

```json
{
  "go_mode": {
    "skip_exploring": false,        // set true only for confirmed quick fixes
    "skip_compounding": false,      // set true to skip learnings capture
    "auto_approve_gates": false,    // NEVER set true — gates are always manual
    "spike_on_medium_risk": false   // set true to spike MEDIUM items too
  },
  "validating": {
    "plan_checker_max_iterations": 3,
    "bead_polish_rounds": 3
  },
  "reviewing": {
    "parallel_agents": true,
    "serial_threshold": 6           // auto-switch to serial if > 6 agents
  }
}
```

---

## Quick Mode Pipeline (Reference)

For small fixes (≤3 files, LOW risk, no gray areas):

```
planning (lightweight)
  → single bead, br create
  → no multi-model refinement
  → skip exploring (no gray areas)
  ↓
validating (lightweight)
  → skip plan-checker loop (single bead)
  → skip spikes (LOW risk)
  → bv check only (one round)
  ↓
swarming → executing (single worker)
  ↓
reviewing (optional)
  → skip if trivial (typo fix, config change)
  → run if any logic touched
  ↓
compounding (only if lesson learned)
```

No gates in quick mode. The risk is low enough that sequential confirmation would slow down more than it protects.

---

## Design Rationale

**Why 3 gates, not more?**
Based on CE's `/lfg` pattern and GSD's interactive mode philosophy: too many gates erode trust ("the agent keeps stopping") while too few create irreversible mistakes. Three gates map precisely to the three irreversible transitions: committing to a plan, committing to execution, committing to merge.

**Why is GATE 2 the most critical?**
Execution is the only phase that creates side effects (file changes, commits, Agent Mail traffic). A broken plan discovered post-execution costs far more to fix than one caught pre-execution. GSD's core principle: "Plans are not executed until they pass verification."

**Why does validating have its own skill?**
GSD's plan-checker loop, Flywheel's bead polishing, and V3's spike phase are structurally distinct processes requiring their own subagents, their own artifacts, and their own iteration loops. Treating validation as a sub-step of planning caused it to be consistently skipped in v1. Making it a full skill with its own SKILL.md enforces its non-optional nature.
