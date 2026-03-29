---
name: khuym:swarming
description: Orchestrates parallel worker agents for feature execution. Use after the khuym:validating skill approves execution. Initializes the overseer/orchestrator context, spawns bounded worker subagents, monitors Agent Mail for completions/blockers/file conflicts, coordinates rescues and course corrections, and hands off to reviewing when all beads are closed. The orchestrator TENDS — it never implements beads directly.
metadata:
  version: '1.0'
  role: orchestrator
  ecosystem: khuym
  position: 5-of-9
  upstream: validating
  downstream: reviewing
---

# Swarming

If `.khuym/onboarding.json` is missing or stale for the current repo, stop and invoke `khuym:using-khuym` before continuing.

## Role Boundary — Read First

You are the **ORCHESTRATOR**. You launch workers, monitor coordination, handle escalations, and keep the swarm moving. You do NOT implement beads. If you find yourself editing source files, stop immediately — that is the khuym:executing skill's job.

- **swarming** = launches and tends workers (this skill)
- **executing** = each worker's self-routing implementation loop

In Flywheel terms, this skill is the Khuym/Codex adaptation of the `ntm spawn` + human-overseer phase. The orchestrator launches the swarm, then tends it. Workers decide what to do next by using `bv --robot-priority` against the live bead graph.

## When to Use This Skill

Invoke after the `khuym:validating` skill issues: _"Validation complete. All checks pass. Invoke khuym:swarming skill."_

Prerequisites:
- Beads are in `open` status and approved for execution
- EPIC_ID is known (from STATE.md or user input)
- Agent Mail server is reachable

---

## Phase 1: Confirm Swarm Readiness

1. Get `EPIC_ID`: read `.khuym/STATE.md` or ask the user.
2. Check live bead status:
   ```bash
   bv --robot-triage --graph-root <EPIC_ID>
   ```
3. Verify there is executable work:
   - open beads exist
   - dependencies are acyclic
   - no unresolved validation blockers remain
4. Update `.khuym/STATE.md` with current swarm intent and epic ID.

**Do not** compute runtime tracks, runtime waves, or any separate runtime planning artifact. In the corrected model, the bead graph itself is the execution source of truth.

---

## Phase 2: Initialize Agent Mail

```
ensure_project(human_key="<project-root-path>")
register_agent(
  project_key="<project-root-path>",
  name="<COORDINATOR_AGENT_NAME>",  # must be a valid adjective+noun Agent Mail identity
  program="codex-cli",
  model="gpt-5",
  task_description="swarm-coordinator"
)
```

Define an epic topic tag:

```
EPIC_TOPIC="epic-<EPIC_ID>"
```

Bootstrap the epic coordination thread by sending the first message (this is the thread-creation moment in Agent Mail):

```
send_message(
  project_key="<project-root-path>",
  sender_name="<COORDINATOR_AGENT_NAME>",
  to=["<COORDINATOR_AGENT_NAME>"],
  subject="[SWARM START] <feature-name>",
  body_md="Swarm initialized for epic <EPIC_ID> ...",
  thread_id="<EPIC_ID>",
  topic="<EPIC_TOPIC>"
)
```

Template: see `references/message-templates.md` → **Spawn Notification**.

The epic thread is the coordination surface for:
- worker startup acknowledgments
- completion reports
- blocker alerts
- file conflict requests
- context handoffs
- overseer broadcasts

---

## Phase 3: Spawn Workers

Spawn a pool of worker subagents in parallel:

```
Subagent(
  identity="Worker: <agent-name>",
  context=<scoped worker context from references/worker-template.md>
)
```

`Subagent(...)` is the canonical contract. In an actual runtime, call whatever worker-spawn primitive is available, but preserve the same behavior: the orchestrator stays in control, each worker gets bounded scope by default, and workers report back through Agent Mail plus the live bead graph.

Provide each worker:
- Agent Mail identity (project key, agent name, epic thread)
- Feature name / epic ID
- Instruction to load the `khuym:executing` skill immediately
- Optional startup hint if there is an urgent ready bead, clearly labeled as a hint rather than an assignment
- Scoped task-specific context by default; full parent-context inheritance only when explicitly needed

Do **not** assign workers fixed tracks, fixed waves, or fixed bead lists as the normal case. Workers are expected to:
1. register
2. read project context
3. call `bv --robot-priority`
4. reserve files
5. implement and report
6. loop

Mark spawned workers in `.khuym/STATE.md` under `## Active Workers`.

---

## Phase 4: Monitor + Tend

This is the "clockwork deity" phase. The swarm is live; now you manage it.

Check Agent Mail regularly on the epic thread:

```
fetch_inbox(
  project_key="<project-root-path>",
  agent_name="<COORDINATOR_AGENT_NAME>",
  topic="<EPIC_TOPIC>"
)
fetch_topic(
  project_key="<project-root-path>",
  topic_name="<EPIC_TOPIC>"
)
```

Use live graph checks for oversight, not assignment:

```bash
bv --robot-triage --graph-root <EPIC_ID>
```

### Worker Startup Acknowledgments

When a worker posts an online message:
1. Confirm it joined the correct epic thread
2. Confirm it is loading `khuym:executing`
3. Update `.khuym/STATE.md`

### Bead Completion Reports

When a worker posts a completion report:
1. Verify the bead is actually closed: `br status <bead-id>`
2. Acknowledge receipt on the thread
3. Update `.khuym/STATE.md`
4. Re-check the graph if needed to see what newly unblocked

### Blocker Alerts

When a worker posts a blocker alert:
1. Assess severity:
   - **Resolvable with existing context:** reply on the thread
   - **Needs another worker's status or release:** coordinate via thread
   - **Needs human judgment:** escalate to user quickly
2. Do not let workers spin silently on blockers
3. Record blocker state in `.khuym/STATE.md`

### File Conflict Requests

When a worker requests a file another worker holds:
1. Identify holder and requester
2. Coordinate one of:
   - holder releases at a safe checkpoint
   - requester waits
   - requester defers and creates a follow-up bead
3. Log the resolution in `.khuym/STATE.md`

### Overseer Broadcasts

Use broadcast messages when the swarm needs a shared correction, for example:
- "re-read AGENTS.md after compaction"
- "do not touch file X until blocker Y is cleared"
- "new user decision: D7 is locked, honor it"

### Context Checkpoint

After each significant event, estimate your own context budget.

**If context >65% used:**
1. Write `.khuym/HANDOFF.json` with complete swarm state (see `references/message-templates.md` → **Handoff JSON template**)
2. Broadcast a pause notification on the epic thread
3. Report to user that the orchestrator paused safely and how to resume
4. Do NOT abandon the swarm without writing `HANDOFF.json`

---

## Phase 5: Swarm Complete

When no beads remain `in_progress` and the graph shows no remaining executable work:

1. Run final bead verification:
   ```bash
   bv --robot-triage --graph-root <EPIC_ID>
   ```
2. If orphaned or blocked beads remain:
   - report which beads remain and why
   - ask the user whether to defer, create cleanup beads, or continue later
3. If all beads are closed:
   - run final build/test commands appropriate to the project
   - update `.khuym/STATE.md`:
     ```
     Active skill: swarming → COMPLETE
     Swarm: <EPIC_ID> — all beads closed
     ```
   - clear `## Active Workers` from `.khuym/STATE.md`

4. Handoff message:
   > "Swarm execution complete. All beads closed. Invoke khuym:reviewing skill."

---

## Red Flags

Stop and diagnose before continuing if you see:

- **Worker implements multiple beads at once** — self-routing does not mean parallelizing within one worker
- **Orchestrator edits source files** — role violation
- **Workers are idle but ready beads exist** — check mail, reservations, or startup drift
- **No Agent Mail activity for >10 poll cycles** — workers may be stuck or context-exhausted
- **The same file conflict repeats** — bead decomposition may be too coarse; escalate
- **Workers stop using `bv --robot-priority` and start freelancing** — re-broadcast the execution contract
- **Build/test failures accumulate without intervention** — create fix beads or stop and escalate

---

## Reference Files

Load when needed:

| File | Load When |
|---|---|
| `references/worker-template.md` | Spawning any worker (Phase 3) |
| `references/message-templates.md` | Posting or parsing Agent Mail messages |
