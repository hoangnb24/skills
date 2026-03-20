# Agent Mail Message Templates

Standard message formats for swarm coordination. All messages post to the epic thread (`thread_id=<EPIC_ID>`) unless noted otherwise.

---

## 1. Spawn Notification

**Posted by:** Orchestrator  
**When:** After all Phase 2 Agent Mail setup is complete, before spawning any workers  
**Purpose:** Broadcasts swarm start to the thread; serves as audit record

```
Subject: [SWARM START] <feature-name> — Wave 1 of <M>
Thread: <EPIC_ID>
Importance: NORMAL

Swarm initialized for epic <EPIC_ID>.

Plan:
- Total beads: <N>
- Total waves: <M>
- Tracks: <list track names>

Wave 1 workers spawning now:
- Worker-A1 → Track: <track-name>, Beads: <bead-ids>
- Worker-B1 → Track: <track-name>, Beads: <bead-ids>
[one line per worker in wave 1]

All workers: join this thread, post spawn acknowledgment, then load the executing skill.
```

---

## 2. Worker Spawn Acknowledgment

**Posted by:** Worker (automatically, as first action after macro_start_session)  
**When:** Immediately on startup  
**Purpose:** Confirms worker is live; orchestrator uses this to verify all workers joined

```
Subject: [ONLINE] <AGENT_NAME> ready
Thread: <EPIC_ID>
Importance: NORMAL

<AGENT_NAME> online.
Track: <track-name>
Assigned beads: <bead-id-1>, <bead-id-2>
File scope: <path-1>, <path-2>
Status: Loading executing skill. Starting on <first-bead-id>.
```

---

## 3. Completion Report

**Posted by:** Worker  
**When:** After each bead is closed with `bd close`  
**Purpose:** Notifies orchestrator of progress; triggers orchestrator's completion tally

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

Context budget: ~<XX>% used
Next bead: <next-bead-id or "none — track complete">
```

---

## 4. Blocker Alert

**Posted by:** Worker  
**When:** Immediately upon discovering a blocking issue  
**Purpose:** Requests orchestrator intervention; must not be delayed

```
Subject: [BLOCKED] <bead-id> — <one-line description>
Thread: <EPIC_ID>
Importance: HIGH

BLOCKED: <AGENT_NAME> cannot proceed on bead <bead-id>.

Blocker type: [MISSING_CONTEXT | DEPENDENCY_NOT_MET | TECHNICAL_FAILURE | AMBIGUITY]

Description:
<Clear description of what is blocking. Include error messages, file names, relevant details.>

What I need to proceed:
<Specific ask: information, a decision, a file reservation release, etc.>

Can another worker unblock me?
<Yes, if Worker-X has completed bead Y / No, this requires human input>

I am now paused on this bead. I will not time out — I will wait for a reply on this thread.
```

---

## 5. File Conflict Request

**Posted by:** Worker  
**When:** Worker needs to modify a file outside its assigned file scope  
**Purpose:** Coordinates file access without creating merge conflicts

```
Subject: [FILE CONFLICT] <path/to/file>
Thread: <EPIC_ID>
Importance: HIGH

File conflict: <AGENT_NAME> needs access to a file outside its scope.

Requested file: <path/to/file>
Currently reserved by: <AGENT_NAME_holder or "unknown">
My bead: <bead-id>
Reason needed: <Why this file is required for this bead>

Options:
1. If <holder> can release early: please post release confirmation
2. If this file is not reserved: orchestrator please expand my scope
3. If this cannot be resolved: I can defer this change to a follow-up bead

Awaiting orchestrator decision.
```

---

## 6. File Conflict Resolution (Orchestrator Reply)

**Posted by:** Orchestrator  
**When:** Responding to a File Conflict Request  

```
Subject: Re: [FILE CONFLICT] <path/to/file>
Thread: <EPIC_ID>
Importance: NORMAL

Decision on file conflict for <path/to/file>:

[Choose one:]

OPTION A — Scope expanded:
<AGENT_NAME_requester>: your file scope now includes <path/to/file>. Proceed.

OPTION B — Release requested:
<AGENT_NAME_holder>: please release reservation on <path/to/file> when you reach a safe checkpoint. 
<AGENT_NAME_requester>: stand by until <holder> confirms release.

OPTION C — Defer:
<AGENT_NAME_requester>: defer this change. Create a follow-up bead with:
  bd create "Follow-up: <description>" --depends-on <bead-id>
Then continue to your next assigned bead.
```

---

## 7. Wave Transition Broadcast

**Posted by:** Orchestrator  
**When:** All workers in the current wave have posted completion reports  
**Purpose:** Closes out wave, announces next wave, triggers next spawn

```
Subject: [WAVE COMPLETE] Wave <N> done — starting Wave <N+1>
Thread: <EPIC_ID>
Importance: NORMAL

Wave <N> complete.

Beads completed this wave: <list bead-ids>
Post-wave verification: [PASS | FAIL — see details below]

[If PASS:]
Spawning Wave <N+1> workers now:
- Worker-A<N+1> → Track: <track>, Beads: <bead-ids>
- Worker-B<N+1> → Track: <track>, Beads: <bead-ids>

[If FAIL:]
Build/test failure detected. Diagnosing.
Fix beads created: <fix-bead-ids>
Running fix wave before Wave <N+1>.
```

---

## 8. Orchestrator Context Warning

**Posted by:** Orchestrator  
**When:** Orchestrator detects its own context is approaching 65%  
**Purpose:** Warns workers; triggers handoff write

```
Subject: [CONTEXT WARNING] Orchestrator approaching capacity
Thread: <EPIC_ID>
Importance: HIGH

Orchestrator context at ~<XX>%. Writing HANDOFF.json now.

Current wave: Wave <N>
Completed: <X> of <Y> beads in this wave
Remaining waves: <list>

Workers: continue your current beads. After your next bead completion, post a status update to this thread.

If orchestrator does not resume within this session, a new orchestrator session can resume using:
  .khuym/HANDOFF.json
  bv --robot-triage --graph-root <EPIC_ID>
```

---

## 9. Swarm Completion Announcement

**Posted by:** Orchestrator  
**When:** All waves complete, all beads verified closed  

```
Subject: [SWARM COMPLETE] <feature-name> — all beads closed
Thread: <EPIC_ID>
Importance: NORMAL

Swarm complete for epic <EPIC_ID>.

Summary:
- Beads implemented: <N>
- Waves executed: <M>
- Workers used: <K>
- Build status: PASS
- Test status: PASS

All workers: your work is complete. Thank you.

Next step: Invoke the reviewing skill.
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
    "project_key": "<project-root-path>",
    "total_waves": "<M>",
    "current_wave": "<N>",
    "waves_complete": ["Wave 1", "Wave 2"],
    "waves_remaining": ["Wave 3"]
  },
  "wave_progress": {
    "current_wave_number": "<N>",
    "beads_assigned": ["<bead-id-1>", "<bead-id-2>"],
    "beads_complete": ["<bead-id-1>"],
    "beads_in_progress": ["<bead-id-2>"],
    "beads_not_started": []
  },
  "active_workers": [
    {
      "agent_name": "Worker-A<N>",
      "track": "<track-name>",
      "current_bead": "<bead-id-2>",
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
    "priority_next": "Poll epic thread for any worker completions/blockers since pause",
    "read_first": [".khuym/STATE.md", "history/<feature>/execution-plan.md"],
    "check_mail": true,
    "bead_check": "bv --robot-triage --graph-root <EPIC_ID>",
    "restore_confirmation": "Confirm: wave <N> in progress, <K> workers active. Resume monitoring? [y/n]"
  },
  "context_at_pause": {
    "tokens_used_pct": 0.67,
    "agent_mail_thread": "<EPIC_ID>"
  }
}
```
