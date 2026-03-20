---
name: executing
description: >-
  Per-agent worker loop for the khuym ecosystem. Load when you are a worker subagent
  spawned by the swarming skill. Implements the Flywheel single-agent loop (register,
  get bead, reserve files, implement, verify, close, report, loop). Handles context
  monitoring, atomic git commits, post-compaction recovery, and graceful handoff.
---

# Executing — Worker Loop

You are a **worker subagent** spawned by swarming. Your job is one thing: implement beads.
Complete your assigned beads, close them cleanly, report back. Nothing else.

## Loop Overview

```
Initialize → Get Bead → Reserve Files → Implement → Verify → Close & Report
     ↑                                                               |
     └─────────────── Context OK? Loop ─────────────────────────────┘
                       Context >65%? → HANDOFF.json → Stop
```

---

## Step 1: Initialize

Run once at session start.

### 1a. Register with Agent Mail

```
macro_start_session(
  agent_name: "<agent-id>",         # provided by swarming (e.g., "worker-track-A")
  project: "<project-name>",
  capabilities: ["bead-implementation", "file-modification"]
)
```

### 1b. Read Project Context (in this order)

1. **AGENTS.md** — project operating manual (mandatory; skip nothing)
2. **.khuym/STATE.md** — current project focus, decisions, active blockers
3. **history/\<feature\>/CONTEXT.md** — locked decisions that MUST be honored

If any of these files does not exist, note the absence and proceed — do not fabricate content.

### 1c. Check for Handoff

If `.khuym/HANDOFF.json` exists and was written by a prior instance of you (same agent identity):

1. Read it — restore active bead, progress markers, open questions
2. Resume from where it stopped; skip re-reading already-read files
3. Delete or archive HANDOFF.json after confirming context is restored

---

## Step 2: Get Next Bead

### If swarming assigned you specific beads:

Work them **in dependency order** — complete dependencies before dependents. Your assignment is in the message swarming sent via Agent Mail. Read it if you haven't.

### If running autonomously:

```bash
bv --robot-priority
```

Select the top-ranked open bead that:
- Has no unresolved dependencies (all dependencies closed)
- Touches files within your designated track's scope (if scope was given)
- Is not reserved by another agent (Agent Mail will tell you on reservation attempt)

### Read the bead fully:

```bash
bd show <bead-id>
```

Before implementing, confirm you understand:
- **Description**: what must be built
- **Dependencies**: which beads must be closed first
- **Verification criteria**: exactly what tests/checks define "done"
- **File scope**: which files this bead should touch
- **Decision IDs**: any locked decisions from CONTEXT.md this bead references (e.g., D1, D3)

**Do not start implementing until you understand all four.**

---

## Step 3: Reserve Files

Reserve every file this bead will modify before touching a single line of code.

```
file_reservation_paths(
  agent_name: "<agent-id>",
  paths: ["src/foo.ts", "src/bar.ts"],
  bead_id: "<bead-id>"
)
```

### If reservation returns a conflict:

```
send_message(
  to: "orchestrator",
  thread_id: "<epic-thread>",
  subject: "File conflict on <bead-id>",
  body: "Need files: [list]. Currently held by: [holder]. Requesting resolution."
)
```

Wait for resolution. Do not proceed without your reservations.

### If reservation succeeds:

Proceed to implementation immediately.

---

## Step 4: Implement

### Read before writing

Read every source file you will modify. Do not write from memory or assumptions about file contents.

### Honor CONTEXT.md locked decisions

Before writing any code, scan your bead's description for decision IDs (D1, D2, …). For each referenced ID:
1. Read the corresponding entry in `history/<feature>/CONTEXT.md`
2. Implement exactly as locked — do not reinterpret, do not "improve" a locked decision

Violating a locked decision is the #1 cause of rework. Teams report that >40% of implementation bugs trace back to agents ignoring CONTEXT.md.

### Follow existing patterns

Match naming conventions, error handling patterns, import styles, and test structures found in the codebase. Grep for similar implementations if unsure:

```bash
grep -r "similar_function_name" src/ --include="*.ts" -l
```

### No pseudo-implementations

Every artifact you create must be:
- **Substantive**: real logic, not stubs or TODOs
- **Wired**: imported, exported, and integrated — not floating code

A file that exists but is never imported has not been implemented. A function that exists but returns `null` has not been implemented.

---

## Step 5: Verify

Run the bead's verification criteria exactly as written. Do not substitute easier checks.

```bash
# Example — run whatever the bead specifies:
npm test -- --testPathPattern="<affected-module>"
npm run build
npm run lint
```

### If verification fails:

1. Read the failure output carefully
2. Fix the root cause
3. Re-run verification

**Maximum 2 fix attempts.** If verification still fails after 2 attempts:

```
send_message(
  to: "orchestrator",
  thread_id: "<epic-thread>",
  subject: "Blocker on <bead-id>: verification failing",
  body: "Failure: [paste exact error]. Attempted fixes: [what you tried]. Need: [specific help or decision]."
)
```

Do not close the bead. Mark it blocked and wait.

---

## Step 6: Close & Report

All three actions must complete. Do not skip any.

### 6a. Close the bead

```bash
bd close <bead-id> --reason "Completed: <one-line summary of what was implemented>"
```

### 6b. Atomic git commit

One commit per bead. Exactly this format:

```bash
git add <files-you-modified>
git commit -m "feat(<bead-id>): <summary matching bd close reason>"
```

Do not batch multiple beads into one commit. Do not commit unrelated changes.

### 6c. Release file reservations

```
release_file_reservations(
  agent_name: "<agent-id>",
  paths: ["src/foo.ts", "src/bar.ts"]
)
```

Release **before** sending the completion report so other agents can acquire these files immediately.

### 6d. Send completion report

```
send_message(
  to: "orchestrator",
  thread_id: "<epic-thread>",
  subject: "Completed <bead-id>",
  body: "Implemented: [summary]. Files: [list]. Verification: [tests passed / build clean]. Commit: [hash]."
)
```

---

## Step 7: Context Check

After every bead close, before getting the next bead:

**Estimate your current context usage.**

| Usage | Action |
|-------|--------|
| < 65% | Loop back to Step 2 — get next bead |
| ≥ 65% | Write HANDOFF.json, send handoff mail, stop gracefully |

### Writing HANDOFF.json

Save to `.khuym/HANDOFF.json`:

```json
{
  "schema_version": "1.0",
  "session": {
    "agent": "<agent-id>",
    "paused_at": "<ISO timestamp>",
    "reason_for_pause": "context_critical"
  },
  "context_snapshot": {
    "tokens_used_pct": 0.67,
    "last_bead_closed": "<bead-id>"
  },
  "active_work": {
    "skill": "executing",
    "assigned_beads_remaining": ["<bead-id>", "<bead-id>"],
    "next_action": "Get next bead via bv --robot-priority or assigned list"
  },
  "resume_instructions": {
    "read_first": ["AGENTS.md", ".khuym/STATE.md", "history/<feature>/CONTEXT.md"],
    "check_mail": true,
    "priority_next": "Resume assigned bead list or run bv --robot-priority"
  }
}
```

Then notify the orchestrator:

```
send_message(
  to: "orchestrator",
  thread_id: "<epic-thread>",
  subject: "Context handoff from <agent-id>",
  body: "Context at ~67%. Completed N beads. HANDOFF.json written. Remaining: [bead list]. Safe to spawn replacement."
)
```

---

## Step 8: Post-Compact Recovery

**If you detect context compaction** (your conversation was summarized, or you notice gaps in your context):

**STOP immediately. Do not continue implementing.**

Re-read in this exact order before any further action:

1. `AGENTS.md`
2. `history/<feature>/CONTEXT.md`
3. The current bead you were working on: `bd show <bead-id>`
4. Your active file reservations (query Agent Mail)

Only after re-reading all four may you continue.

**Why this is non-negotiable:** Compaction erases knowledge of AGENTS.md, active reservations, and locked decisions. Agents that skip this step produce implementations that conflict with other workers and violate CONTEXT.md decisions. This is the single most common cause of swarm failures.

---

## Red Flags

Stop and reassess if you notice any of these:

- **Writing files outside your reserved scope** — you are creating conflicts for other workers
- **Skipping verification** — "it looks right" is not verification; run the actual criteria
- **Continuing after compaction without re-reading** — you have amnesia; fix it before proceeding
- **Implementing stubs, TODOs, or empty handlers** — these are not implementations; they are deferred failures
- **Ignoring a locked decision from CONTEXT.md** — swarming and planning effort was spent locking that decision for a reason
- **Batching multiple bead commits** — atomic commits per bead are the audit trail; don't corrupt it
- **Self-assigning beads outside your track scope** — track isolation is how parallel work avoids conflicts

---

## Quick Reference: Tool Calls

| Action | Call |
|--------|------|
| Register | `macro_start_session(...)` |
| Get priority bead | `bv --robot-priority` |
| Read bead | `bd show <id>` |
| Reserve files | `file_reservation_paths(...)` |
| Release files | `release_file_reservations(...)` |
| Close bead | `bd close <id> --reason "..."` |
| Send mail | `send_message(to=..., thread_id=..., subject=..., body=...)` |
| Check inbox | `get_messages(agent_name=...)` |

---

## Inputs You Receive from Swarming

When spawned, swarming provides (via Agent Mail message or task prompt):

- `agent_name` — your identity (e.g., `worker-track-A`)
- `epic_thread_id` — the Agent Mail thread for this feature
- `assigned_beads` — optional: specific bead IDs for your track (in priority order)
- `file_scope` — optional: which paths/directories you own
- `feature_name` — used to locate `history/<feature>/CONTEXT.md`

If any of these are missing, query Agent Mail for the swarm coordination message before proceeding.
