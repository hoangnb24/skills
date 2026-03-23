# Agent Mail Message Templates

Standard message formats for swarm coordination. All messages post to the epic thread (`thread_id=<EPIC_ID>`) unless noted otherwise.

---

## 1. Spawn Notification

**Posted by:** Orchestrator  
**When:** After Agent Mail setup is complete, before spawning workers
**Purpose:** Announces the swarm start and the self-routing execution model

```
Subject: [SWARM START] <feature-name>
Thread: <EPIC_ID>
Importance: NORMAL

Swarm initialized for epic <EPIC_ID>.

Execution model:
- Workers are self-routing via `bv --robot-priority`
- File coordination happens through Agent Mail reservations
- Blockers and course corrections happen in this thread

Workers spawning now:
- <AGENT_NAME_1>
- <AGENT_NAME_2>
- <AGENT_NAME_3>

All workers: join this thread, post startup acknowledgment, then load the khuym:executing skill.
```

---

## 2. Worker Spawn Acknowledgment

**Posted by:** Worker
**When:** Immediately on startup  
**Purpose:** Confirms the worker is live and following the expected loop

```
Subject: [ONLINE] <AGENT_NAME> ready
Thread: <EPIC_ID>
Importance: NORMAL

<AGENT_NAME> online.
Status: Loading khuym:executing skill.
Next step: read context, run `bv --robot-priority`, claim the top executable bead.
```

---

## 3. Completion Report

**Posted by:** Worker  
**When:** After each bead is closed with `br close`  
**Purpose:** Notifies orchestrator of progress

```
Subject: [DONE] <bead-id>: <bead-title>
Thread: <EPIC_ID>
Importance: NORMAL

Bead closed: <bead-id>
Title: <bead-title>
Worker: <AGENT_NAME>
Commit: <git-commit-hash>

Summary of changes:
<2-3 sentence description of what was implemented>

Files modified:
- <path/to/file1>
- <path/to/file2>

Verification:
- <command/result summary>

Context budget: ~<XX>% used
Next action: return to `bv --robot-priority`
```

---

## 4. Blocker Alert

**Posted by:** Worker  
**When:** Immediately upon discovering a blocking issue  
**Purpose:** Requests orchestrator intervention

```
Subject: [BLOCKED] <bead-id> — <one-line description>
Thread: <EPIC_ID>
Importance: HIGH

BLOCKED: <AGENT_NAME> cannot proceed on bead <bead-id>.

Blocker type: [MISSING_CONTEXT | DEPENDENCY_NOT_MET | TECHNICAL_FAILURE | AMBIGUITY]

Description:
<Clear description of what is blocking. Include errors, file names, and relevant details.>

What I need to proceed:
<Specific ask: information, release of a file reservation, user decision, etc.>

I am paused on this bead and waiting for a reply on this thread.
```

---

## 5. File Conflict Request

**Posted by:** Worker  
**When:** Worker needs a file another worker currently holds
**Purpose:** Coordinates file access without preassigned worker scopes

```
Subject: [FILE CONFLICT] <path/to/file>
Thread: <EPIC_ID>
Importance: HIGH

File conflict: <AGENT_NAME> needs a file that is currently reserved.

Requested file: <path/to/file>
Currently reserved by: <AGENT_NAME_holder or "unknown">
My bead: <bead-id>
Reason needed: <Why this file is required for this bead>

Awaiting orchestrator decision:
1. Request holder release at a safe checkpoint
2. Ask me to wait
3. Ask me to defer and create a follow-up bead
```

---

## 6. File Conflict Resolution

**Posted by:** Orchestrator  
**When:** Replying to a File Conflict Request

```
Subject: Re: [FILE CONFLICT] <path/to/file>
Thread: <EPIC_ID>
Importance: NORMAL

Decision on file conflict for <path/to/file>:

[Choose one:]

OPTION A — Wait:
<AGENT_NAME_requester>: wait for <AGENT_NAME_holder> to release the reservation.

OPTION B — Release requested:
<AGENT_NAME_holder>: please release <path/to/file> when you reach a safe checkpoint.
<AGENT_NAME_requester>: stand by until release is confirmed.

OPTION C — Defer:
<AGENT_NAME_requester>: defer this change. Create a follow-up bead and continue with the next executable bead.
```

---

## 7. Overseer Broadcast

**Posted by:** Orchestrator  
**When:** Shared correction or reminder is needed across the swarm

```
Subject: [OVERSEER] <short instruction>
Thread: <EPIC_ID>
Importance: HIGH

Broadcast to all workers:

<Instruction or correction>

Examples:
- Re-read AGENTS.md before continuing
- Do not touch <file/path> until blocker <id> is resolved
- Decision D7 is now locked; honor it in all remaining work
```

---

## 8. Orchestrator Context Warning

**Posted by:** Orchestrator  
**When:** Orchestrator detects its own context is approaching 65%  
**Purpose:** Warns workers and records the pause

```
Subject: [CONTEXT WARNING] Orchestrator approaching capacity
Thread: <EPIC_ID>
Importance: HIGH

Orchestrator context at ~<XX>%. Writing HANDOFF.json now.

Current status:
- Open beads: <count>
- In-progress beads: <count>
- Known blockers: <count>

Workers: continue current bead safely, then report status to this thread.

Resume artifacts:
- .khuym/HANDOFF.json
- .khuym/STATE.md
- bv --robot-triage --graph-root <EPIC_ID>
```

---

## 9. Swarm Completion Announcement

**Posted by:** Orchestrator  
**When:** All beads are verified closed

```
Subject: [SWARM COMPLETE] <feature-name> — all beads closed
Thread: <EPIC_ID>
Importance: NORMAL

Swarm complete for epic <EPIC_ID>.

Summary:
- Beads implemented: <N>
- Workers used: <K>
- Build status: PASS
- Test status: PASS

All workers: your work is complete.

Next step: Invoke the khuym:reviewing skill.
```

---

## Handoff JSON Template

Write to `.khuym/HANDOFF.json` when orchestrator context exceeds 65%:

```json
{
  "schema_version": "1.0",
  "format": "khuym-swarm-handoff",
  "session": {
    "id": "khuym-swarm-<YYYYMMDD-HHMMSS>",
    "paused_at": "<ISO-8601 timestamp>",
    "reason_for_pause": "context_critical",
    "agent": "Orchestrator"
  },
  "swarm": {
    "epic_id": "<EPIC_ID>",
    "feature_name": "<feature-name>",
    "project_key": "<project-root-path>"
  },
  "graph_status": {
    "open_beads": ["<bead-id-1>", "<bead-id-2>"],
    "in_progress_beads": ["<bead-id-3>"],
    "blocked_beads": ["<bead-id-4>"]
  },
  "active_workers": [
    {
      "agent_name": "<AGENT_NAME>",
      "current_bead": "<bead-id-3>",
      "status": "in_progress"
    }
  ],
  "open_blockers": [
    {
      "bead_id": "<bead-id>",
      "worker": "<AGENT_NAME>",
      "description": "<blocker description>",
      "thread_message_id": "<mail-id>"
    }
  ],
  "resume_instructions": {
    "priority_next": "Poll epic thread, then inspect the live graph",
    "read_first": [".khuym/STATE.md", ".khuym/HANDOFF.json"],
    "check_mail": true,
    "bead_check": "bv --robot-triage --graph-root <EPIC_ID>",
    "restore_confirmation": "Confirm open/in-progress/blocked counts still match before resuming"
  },
  "context_at_pause": {
    "tokens_used_pct": 0.67,
    "agent_mail_thread": "<EPIC_ID>"
  }
}
```
