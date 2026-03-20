---
name: swarming
description: Orchestrates parallel worker agents for feature execution. Use after the validating skill approves execution. Reads execution-plan.md, computes dependency waves, spawns executing-skill workers via the Task tool, monitors Agent Mail for bead completions/blockers/file conflicts, coordinates wave transitions, and hands off to reviewing when all beads are closed. The orchestrator TENDS — it never implements beads directly.
metadata:
  version: '1.0'
  role: orchestrator
  ecosystem: khuym
  position: 5-of-9
  upstream: validating
  downstream: reviewing
---

# Swarming

## Role Boundary — Read First

You are the **ORCHESTRATOR**. You spawn workers, monitor coordination, handle escalations, and transition waves. You do NOT implement beads. If you find yourself writing code or editing source files, stop immediately — that is the executing skill's job.

- **swarming** = spawns and tends workers (this skill)
- **executing** = implements beads (loaded by each worker subagent)

Teams report that the #1 swarm failure mode is an orchestrator that "helps" a struggling worker by implementing code directly. This destroys isolation guarantees and creates merge conflicts. Tend the swarm; do not become a worker.

## When to Use This Skill

Invoke after the `validating` skill issues: _"Validation complete. All checks pass. Invoke swarming skill."_

Prerequisites:
- `history/<feature>/execution-plan.md` exists and is approved
- All beads are in `open` status (not in progress)
- Agent Mail server is reachable

---

## Phase 1: Read Execution Plan

1. Read `history/<feature>/execution-plan.md` — extract:
   - `EPIC_ID` — the root bead ID for this feature
   - `TRACKS` — list of tracks (A, B, C…) with their assigned beads and file scopes
   - `CROSS_DEPS` — any cross-track dependencies called out explicitly
2. Read `.khuym/STATE.md` — check for prior swarm state:
   - If a previous swarm was interrupted, you may find partial wave progress
   - Identify which waves already completed vs. still open
3. Check `bv --robot-triage --graph-root <EPIC_ID>` for current bead statuses

**If resuming a prior swarm:** Read `.khuym/HANDOFF.json` and reconcile swarm state before proceeding to Phase 3.

**STATE.md update:** Write current swarm intent under `## Current Focus`.

---

## Phase 2: Initialize Agent Mail

```
ensure_project(project_key="<project-root-path>")
register_agent(name="Orchestrator", role="swarm-coordinator", project_key="<project-root-path>")
```

Create epic coordination thread:
```
create_thread(
  thread_id="<EPIC_ID>",
  subject="Swarm: <feature-name>",
  project_key="<project-root-path>"
)
```

Post a spawn notification to the epic thread. Template: see `references/message-templates.md` → **Spawn Notification**.

Set up file reservation namespace: confirm that each track's file scope from execution-plan.md is non-overlapping. If two tracks claim the same file, resolve before spawning:
- Same-wave conflict → move one bead to the next wave
- Cross-wave conflict → earlier wave claims the file; later wave waits

---

## Phase 3: Compute Waves

Wave computation is the orchestrator's most critical function. Incorrect waves cause dependency violations that break builds mid-execution.

**Algorithm:**
1. For each bead in the epic, list its `dependencies` from the bead file
2. Assign wave numbers using topological sort:
   - Wave 1 = beads with zero unresolved dependencies
   - Wave 2 = beads whose only dependencies are in Wave 1
   - Wave N = beads whose dependencies are all in Waves 1..N-1
3. If the dependency graph has cycles: STOP. Flag to user — this is a bead graph defect that should have been caught in `validating`. Do not attempt to execute a cyclic graph.

**Output:** Wave map:
```
Wave 1: [bead-A1, bead-B1, bead-C1]  — no deps, run in parallel
Wave 2: [bead-A2, bead-B2]           — depend on Wave 1 beads
Wave 3: [bead-A3]                    — depends on Wave 2 beads
```

**User preference on session structure:** Execution can use multiple simultaneous sessions (one per track) or a single session per bead. The execution-plan.md specifies this via track assignments. Follow the plan's structure — do not re-architect session layout during swarming.

---

## Phase 4: Spawn Workers

For each track assigned to the current wave, spawn one worker subagent:

```
Task(
  description="Worker: <track-name>, Wave <N>",
  prompt=<see references/worker-template.md>
)
```

**All workers in the same wave spawn simultaneously (parallel).** Do not await one before spawning the next — the entire wave launches at once, then you enter Phase 5 monitoring.

Worker context to provide (template in `references/worker-template.md`):
- Assigned beads for this track (IDs + titles)
- File scope (paths this worker owns)
- Epic thread ID for Agent Mail
- Agent Mail identity (project key, suggested agent name)
- Instruction to load the `executing` skill

Mark spawned workers in STATE.md: `## Active Workers — Wave N`.

---

## Phase 5: Monitor + Tend

This is the "clockwork deity" phase. You designed the swarm; now you manage it. Check Agent Mail regularly on the epic thread:

```
list_messages(thread_id="<EPIC_ID>", unread_only=true)
```

### Bead Completion Reports
When a worker posts a completion report (see `references/message-templates.md` → **Completion Report**):
1. Verify the bead is actually closed: `bd status <bead-id>`
2. Update your internal wave completion tally
3. Acknowledge receipt on the thread
4. Update `.khuym/STATE.md`

### Blocker Alerts
When a worker posts a blocker alert (`references/message-templates.md` → **Blocker Alert**):
1. Assess severity: can you resolve with context from another track?
   - **Yes:** Reply to the worker with the needed context on the epic thread
   - **No (cross-track knowledge gap):** Broadcast to all workers asking for input
   - **Unresolvable:** Escalate to user with full context. Do NOT let workers spin on a blocker — acknowledge within one poll cycle
2. If a blocker pauses a worker: update STATE.md with blocker entry

### File Conflict Requests
When a worker posts a file conflict request (`references/message-templates.md` → **File Conflict Request**):
1. Identify which worker holds the reservation and which needs it
2. Coordinate:
   - If holder can release early: reply to holder requesting release, confirm to requester
   - If release is not feasible: instruct requester to skip that file and create a follow-up bead
3. Log conflict resolution in STATE.md

### Context Checkpoint
After each significant event (bead completion, blocker resolution, wave completion): estimate your own context budget.

**If context >65% used:**
1. Write `.khuym/HANDOFF.json` with complete swarm state (see `references/message-templates.md` → **Handoff JSON template**)
2. Broadcast pause notification to all workers on epic thread
3. Report to user: "Orchestrator context at capacity. Wave N is [X/Y] complete. Write HANDOFF.json and suggest resuming in a fresh session."
4. Do NOT abandon the swarm without writing HANDOFF.json — workers may still be running

---

## Phase 6: Wave Transition

When all workers in the current wave report completion:

1. **Post-wave verification:**
   - Run: `<build-command>` — does the project still compile?
   - Run: `<test-command>` — do all prior tests still pass?
   - If verification fails:
     a. Diagnose which bead broke the build (check git log — each bead is a commit)
     b. Create fix beads: `bd create "Fix: <description>" --depends-on <broken-bead-id>`
     c. Run a fix wave before proceeding to the next planned wave
     d. If fix wave also fails: STOP and escalate to user

2. **Broadcast wave transition:**
   - Post wave transition broadcast to epic thread (`references/message-templates.md` → **Wave Transition Broadcast**)

3. **Spawn next wave:**
   - Repeat Phase 4 for Wave N+1
   - Update STATE.md: increment active wave number

4. **Repeat until all waves complete.**

---

## Phase 7: Swarm Complete

When all waves have finished and no beads remain in-progress:

1. **Final bead verification:**
   ```
   bv --robot-triage --graph-root <EPIC_ID>
   ```
   Inspect output: any beads still `open` or `in_progress`?
   
2. **If orphan beads exist:**
   - Report which beads remain and why (worker never picked them up, deprioritized, etc.)
   - Ask user: close as won't-do, assign to a cleanup wave, or continue in next session?

3. **If all beads are closed:**
   - Final build + test run to confirm clean state
   - Update `.khuym/STATE.md`:
     ```
     Active skill: swarming → COMPLETE
     Swarm: <EPIC_ID> — all N beads closed across M waves
     ```
   - Clear `## Active Workers` section from STATE.md

4. **Handoff message:**
   > "Swarm execution complete. [N] beads implemented across [M] waves. Invoke reviewing skill."

---

## Red Flags

These indicate something is wrong. Stop and diagnose before continuing:

- **Worker implements multiple beads at once** — each worker should take one bead at a time from its assigned track
- **Orchestrator edits source files** — you are the orchestrator; this violates role boundary
- **Wave 2 spawns before Wave 1 is fully complete** — dependency violation in progress
- **No Agent Mail activity for >10 poll cycles** — workers may be stuck or context-exhausted; check their status
- **Build fails after wave transition** — do not spawn the next wave on a broken build
- **Cyclic dependency detected in wave compute** — do not work around it; the bead graph has a defect

---

## Reference Files

Load when needed:

| File | Load When |
|---|---|
| `references/worker-template.md` | Spawning any worker (Phase 4) |
| `references/message-templates.md` | Posting or parsing Agent Mail messages |
