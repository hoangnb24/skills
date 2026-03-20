# State Management & Session Continuity Patterns
## Research for khuym Skill Ecosystem

**Date:** 2026-03-20  
**Researcher:** Agent subagent (hoang@kieng.io.vn)  
**Purpose:** Design state tracking for the khuym skill ecosystem; determine what additions are needed beyond the existing bead system

---

## Table of Contents

1. [Side-by-Side Comparison of State Management Approaches](#1-side-by-side-comparison)
2. [What the Bead System Already Covers vs. What's Missing](#2-bead-system-coverage)
3. [Recommended State Layer Design for khuym](#3-recommended-state-layer)
4. [Pause/Resume Design with Beads + Agent Mail](#4-pauseresume-design)
5. [Context Monitoring Approach](#5-context-monitoring)
6. [Session Handoff Format](#6-session-handoff-format)
7. [Academic Evidence on Agent State Persistence](#7-academic-evidence)

---

## 1. Side-by-Side Comparison

### 1.1 GSD (Get Shit Done) — Most Mature

**Source:** [gsd-build/get-shit-done GitHub](https://github.com/gsd-build/get-shit-done), [GSD User Guide](https://github.com/gsd-build/get-shit-done/blob/main/docs/USER-GUIDE.md), [GSD Releases](https://github.com/gsd-build/get-shit-done/releases)

GSD is the most fully realized state management system in the ecosystem. It uses a structured file hierarchy under `.planning/` and treats disk files as the canonical long-term memory for Claude (which has no cross-session memory by design).

#### File Structure

```
.planning/
  PROJECT.md          ← Vision and constraints (stable reference, always loaded)
  REQUIREMENTS.md     ← Scoped v1/v2 requirements with IDs
  ROADMAP.md          ← Phase breakdown with completion status ([x] phases)
  STATE.md            ← Decisions, blockers, position — session memory
  config.json         ← Workflow configuration with feature toggles
  MILESTONES.md       ← Completed milestone archive
  HANDOFF.json        ← Machine-readable cross-session handoff (from /gsd:pause-work)
  WAITING.json        ← Signal file for human decision points
  research/           ← Domain research from /gsd:new-project
  reports/            ← Session reports (from /gsd:session-report)
  todos/
    pending/          ← Captured ideas awaiting work
    done/             ← Completed todos
  debug/
    resolved/         ← Archived debug sessions
  codebase/           ← Brownfield codebase mapping
  phases/
    XX-phase-name/
      XX-YY-PLAN.md        ← Atomic execution plans (actual prompts for subagents)
      XX-YY-SUMMARY.md     ← Execution outcomes and decisions
      CONTEXT.md           ← Implementation preferences captured in discuss-phase
      RESEARCH.md          ← Ecosystem research findings
      VERIFICATION.md      ← Post-execution verification results
      XX-UI-SPEC.md        ← UI design contract
```

#### STATE.md: The Session Memory Hub

STATE.md is the first file read in every workflow. It is the **working memory** of the system:
- Current position in the project (which phase, which plan)
- Key decisions made (and their rationale)
- Active blockers
- Session notes for resumption

Reddit community description: "STATE.md — current position, decisions, blockers (instant resumption after /clear)" — [r/ClaudeCode](https://www.reddit.com/r/ClaudeCode/comments/1qf6vcc/ive_massively_improved_gsd_get_shit_done/)

GSD v1.26.0 added: "Structured session handoff artifact — Machine-readable `.planning/HANDOFF.json` for cross-session continuity (#940)" and "WAITING.json signal file — Machine-readable signal for decision points (#1034)" — [GSD Releases](https://github.com/gsd-build/get-shit-done/releases)

#### config.json: The Absent = Enabled Pattern

GSD stores project settings in `.planning/config.json`. The schema shows workflow toggles:

```json
{
  "mode": "interactive",
  "granularity": "standard",
  "model_profile": "balanced",
  "planning": {
    "commit_docs": true,
    "search_gitignored": false
  },
  "workflow": {
    "research": true,
    "plan_check": true,
    "verifier": true,
    "nyquist_validation": true,
    "ui_phase": true,
    "ui_safety_gate": true
  }
}
```

The User Guide explicitly states: **"Both follow the absent=enabled pattern. Disable via `/gsd:settings`."** — meaning if a config key is absent from the file, that feature is enabled. You opt out by setting it to `false`, not in.

Context window warning toggle added in v1.25.0: `hooks.context_monitor: false` disables context monitoring.

#### Lockfile Mechanism (GSD v2 / gsd-2)

The gsd-2 system uses `.gsd/auto.lock` as a crash detection sentinel:

- **PID lock** written per auto-mode session
- **Crash recovery**: If a session dies, the next `/gsd auto` reads the surviving session file, synthesizes a recovery briefing from every tool call that made it to disk, and resumes with full context
- **Parallel orchestrator state** is persisted to disk with PID liveness detection, so multi-worker sessions survive crashes

Source: [gsd-build/gsd-2 GitHub](https://github.com/gsd-build/gsd-2)

#### ROADMAP.md: Phase-Level Progress

ROADMAP.md tracks milestone and phase status with checkbox notation:
- `[x]` phases remain done across sessions; summaries carry over
- Maps phases → slices, plans → tasks, milestones → milestones
- Adaptive replanning: after each slice completes, the roadmap is reassessed; slices can be reordered, added, or removed

In gsd-2: Each milestone has its own `M001-ROADMAP.md` with slice checkboxes, risk levels, and dependencies.

#### Wave-Based Parallelism and Subagent Architecture

The core GSD insight: **files as long-term memory + fresh subagent contexts** = quality preservation.

- Orchestrator: ~10-15% context, coordinates subagents without executing code
- Each subagent: fresh 200K token context, loads one specific plan, commits work, terminates
- PLAN.md files contain actual executable prompts — not documentation
- Wave coordination: plans with the same wave number execute in parallel; higher waves wait on dependencies

"What's truly impressive is that the main context window remains at 30-40% even after extensive research or the generation of thousands of lines of code. All the intensive tasks are consistently handled in fresh 200k subagent contexts." — [Reddit GSD deep dive](https://www.reddit.com/r/ClaudeCode/comments/1qf6vcc/ive_massively_improved_gsd_get_shit_done/)

---

### 1.2 GSD Pause/Resume Mechanism

**Source:** [GSD User Guide](https://github.com/gsd-build/get-shit-done/blob/main/docs/USER-GUIDE.md), [LobeHub continuation-format](https://lobehub.com/en/skills/ctsstc-get-shit-done-skills-continuation-format)

#### /gsd:pause-work

When stopping mid-phase, this command creates two artifacts:

1. **HANDOFF.json** (`.planning/HANDOFF.json`): Machine-readable cross-session continuity artifact. Contains:
   - Current phase, plan, wave index
   - Progress markers
   - Open questions / decision points pending
   - Recent changes (change diffs)
   - Context restoration checkpoint

2. **continue-here.md** (`.planning/continue-here.md`): Human-readable companion document with:
   - Session checkpointing (serialized previous state)
   - Phase status
   - Task progress
   - Open questions log
   - Restore-confirmation step

#### /gsd:resume-work

Reads HANDOFF.json, restores full context from last session:
1. Reads CONTEXT.md, REQUIREMENTS.md, STATE.md, and all prior CONTEXT.md files
2. Reconstructs current position in the phase/plan hierarchy
3. Shows exactly what to do next

**Key design principle:** Discuss phase (v1.22.1) now loads prior context before identifying gray areas — "prevents re-asking questions you've already answered in earlier phases"

The continuation protocol features:
- Session checkpointing (serialize and load previous state)
- Context restoration (restore phase status, task progress, open questions, recent changes)
- Continuity checks (review checkpoints and confirm context accuracy)
- Restore-confirmation step

---

### 1.3 GSD Context Monitoring

**Source:** [GSD Releases](https://github.com/gsd-build/get-shit-done/releases), [GitHub Issue #1161](https://github.com/gsd-build/get-shit-done/issues/1161), [GSD User Guide](https://github.com/gsd-build/get-shit-done/blob/main/docs/USER-GUIDE.md)

GSD ships a `gsd-context-monitor.js` PostToolUse hook that fires after every tool call.

#### Architecture

- **Type:** PostToolUse Claude Code hook
- **Trigger:** Fires after every tool call (Read, Glob, Write, Bash, etc.)
- **Location:** `.claude/hooks/gsd-context-monitor.js`
- **Toggle:** Disable via `hooks.context_monitor: false` in config

#### Thresholds

Based on the GSD search results and the zread.ai context engineering principles page snippet:

- **WARNING (35% remaining)**: Signals agents to begin wrapping up current tasks and avoid starting new ones. Advisory — the agent is informed, not stopped.
- **CRITICAL (25% remaining)**: Stronger advisory suggesting `/gsd:pause-work`. Still advisory-only — never imperative.

The statusline (always visible in Claude Code terminal) shows a progress bar for context usage that "turns red at high capacity" — [codecentric deep dive](https://www.codecentric.de/en/knowledge-hub/blog/the-anatomy-of-claude-code-workflows-turning-slash-commands-into-an-ai-development-system).

#### Advisory-Only Principle

GSD v1.22.2 explicitly fixed: "Context monitor hook is advisory instead of blocking non-GSD workflows" — [GSD Releases](https://github.com/gsd-build/get-shit-done/releases)

Design philosophy: Context monitoring should **suggest** actions (wrap up, pause), never **prevent** actions. This preserves agent autonomy and avoids deadlock in non-GSD workflows.

Known bug: In v1.25.1, a duplicate `const cwd` declaration (lines 47 and 118) caused SyntaxError crashes on every invocation, silently preventing all context warnings from firing — [Issue #1161](https://github.com/gsd-build/get-shit-done/issues/1161). Fixed in v1.26.0.

---

### 1.4 Compound Engineering State

**Source:** [Compound Engineering Guide](https://every.to/guides/compound-engineering), [EveryInc/compound-engineering-plugin](https://github.com/EveryInc/compound-engineering-plugin)

Compound Engineering (by Every / Dan Shipper) takes a different philosophy: **institutional knowledge accumulation** over session-to-session state recovery. The loop is: Plan → Work → Review → Compound → Repeat.

#### File Structure

```
CLAUDE.md               ← Agent reads every session; preferences, patterns, project context
todos/
  001-ready-p1-fix-auth.md
  002-pending-p2-add-tests.md
docs/
  brainstorms/          ← /workflows:brainstorm output
  solutions/            ← /workflows:compound output (searchable knowledge base)
  plans/                ← /workflows:plan output
```

#### Key State Mechanisms

**CLAUDE.md** (the session bootstrap):
- Loaded at every session start automatically
- Contains: developer preferences, coding patterns, project constraints
- Updated continuously: when something goes wrong, add a note; after each session, compound what was learned
- Functions as both instruction set and running knowledge base

**todos/ directory** (the work item tracker):
- File-based tracking with priority and status
- Naming convention: `{ID}-{status}-{priority}-{description}.md`
- Statuses: `pending`, `ready` (approved for work), `done`
- Priorities: `p1` (must fix), `p2` (should fix), `p3` (nice to fix)
- Output of `/triage` review process; used by `/resolve_todo_parallel`

**docs/solutions/** (the compound memory):
- Each solved problem becomes a searchable markdown document
- YAML frontmatter with metadata, tags, categories for retrieval
- Future sessions find past solutions automatically
- Created by `/workflows:compound`, which spawns 6 parallel subagents: context analyzer, solution extractor, related docs finder, prevention strategist, category classifier, documentation writer

**Key insight:** Compound Engineering is less about session recovery and more about **reducing the surface area of problems** — document solutions so the next session doesn't encounter the same problem. The state that matters most is the accumulated solution library.

---

### 1.5 Superpowers State

**Source:** [obra/superpowers GitHub](https://github.com/obra/superpowers), [search results on git-based agent memory](https://www.reddit.com/r/AI_Agents/comments/1mw4jvp/2_years_building_agent_memory_systems_ended_up/)

Superpowers is a skills-based framework for Claude Code that triggers skills automatically based on what the agent is doing. It takes the most minimal approach to persistent state.

#### What IS tracked

**Git commits as state:** The primary persistence mechanism. Superpowers enforces:
- Test-driven development: RED-GREEN-REFACTOR cycles with mandatory commits at each stage
- `using-git-worktrees`: Isolated workspace on new branch, verifies clean test baseline
- `finishing-a-development-branch`: Verifies tests, presents merge/PR/keep/discard options, cleans up worktree
- `brainstorming`: Saves design document to disk

**Plans as task lists:** `writing-plans` breaks work into bite-sized tasks (2-5 minutes each) with exact file paths, complete code, and verification steps. These survive session boundaries.

#### What is NOT tracked

Superpowers explicitly has **no persistent state between sessions** beyond:
1. Files created during the session (code, docs, plans)
2. Git history (commits are the audit trail)
3. Specs/plans saved to disk

There is no STATE.md equivalent, no session handoff, no context monitoring. The design assumes:
- Skills trigger automatically — no session-level context needed
- Git history is sufficient audit trail
- Code and tests are the ground truth of progress

**The git-as-memory pattern** (Reddit research thread): Storing agent memories as markdown files in a git repo — each conversation is a commit. Enables `git diff` to see how understanding evolved, `git blame` to identify when information was acquired, `git checkout` to reconstruct knowledge at any point. "The entire two-year memory fits comfortably in a Git repository you could view with a text editor." — [r/AI_Agents](https://www.reddit.com/r/AI_Agents/comments/1mw4jvp/2_years_building_agent_memory_systems_ended_up/)

---

### 1.6 Comparison Table

| Dimension | GSD | Compound Engineering | Superpowers |
|---|---|---|---|
| **Session recovery** | Full (HANDOFF.json + continue-here.md) | Partial (CLAUDE.md bootstrap) | None (git history) |
| **Working memory** | STATE.md (explicit) | CLAUDE.md (implicit) | None |
| **Task tracking** | .planning/todos/ | todos/ directory | Plan files |
| **Knowledge accumulation** | SUMMARY.md per plan | docs/solutions/ library | None |
| **Context monitoring** | gsd-context-monitor.js hook | None | None |
| **Lockfile/crash safety** | .gsd/auto.lock (gsd-2) | None | None |
| **Config feature flags** | config.json (absent=enabled) | None | None |
| **Pause/resume protocol** | Explicit (/gsd:pause-work) | None | None |
| **Phase/milestone tracking** | ROADMAP.md | None | None |
| **Audit trail** | Atomic git commits per plan | Git commits | Git commits |
| **Multi-agent coordination** | Wave-based parallelism | Parallel reviewers | Skill-based triggers |
| **Human checkpoints** | WAITING.json signal file | Manual review | Manual decisions |
| **Maturity** | High (v1.26+, gsd-2) | Medium | Low |

---

## 2. Bead System Coverage

### What Beads Already Provide

The bead (bd CLI) system already covers substantial ground:

| State Dimension | Bead Coverage |
|---|---|
| Task status tracking | `status: open/in_progress/closed` |
| Task relationships | `dependencies` |
| Task priority | `priorities` |
| Graph analysis | `bv` (bead viewer) graph analysis |
| Cross-agent communication | Agent Mail |
| Task identity | Unique bead IDs |

### What Beads Do NOT Cover

| Missing Dimension | GSD Equivalent | Impact |
|---|---|---|
| **Session working memory** | STATE.md | Agent can't quickly restore "where am I and what was decided" |
| **Decision log** | STATE.md decisions section | Rationale for past choices is lost between sessions |
| **Blocker tracking** | STATE.md blockers section | Blockers not visible until agent re-discovers them |
| **Structured pause/resume** | HANDOFF.json + continue-here.md | No protocol for graceful session hand-off |
| **Context window monitoring** | gsd-context-monitor.js | No warning when context approaching exhaustion |
| **Solution/pattern library** | docs/solutions/ (Compound Eng.) | Each session re-solves previously solved problems |
| **Phase-level progress** | ROADMAP.md | No view of milestone/phase completion separate from individual beads |
| **Crash recovery** | auto.lock | Multi-agent crashes may lose partially executed state |
| **Feature toggle config** | config.json | No per-ecosystem configuration of which skill behaviors are active |
| **Accumulated knowledge** | CLAUDE.md + solutions/ | Agent doesn't carry forward learned patterns |

### Coverage Assessment

```
Beads handle:        WHO does WHAT with WHAT dependencies, at what PRIORITY
Beads don't handle:  WHY decisions were made, WHERE context was lost,
                     WHEN context is running out, HOW to resume mid-session
```

The critical gaps for khuym are:
1. **No session handoff format** — no way to transfer in-progress work between sessions gracefully
2. **No working memory** — agent must re-read all beads to understand current project state
3. **No context awareness** — no signal when context window is critically low
4. **No knowledge accumulation** — solutions to skill-level problems aren't persisted

---

## 3. Recommended State Layer Design for khuym

### Design Principles

1. **Beads are canonical** — don't duplicate bead data in state files; reference bead IDs
2. **Minimal additions** — add only what beads structurally cannot represent
3. **File-based persistence** — markdown/JSON files are readable by any agent in any session
4. **Advisory-only monitoring** — context warnings suggest, never block
5. **Absent = enabled** — adopt GSD's pattern for feature flags

### Recommended State Layer

```
.khuym/
  STATE.md              ← Working memory (current focus, decisions, blockers)
  HANDOFF.json          ← Machine-readable session handoff
  config.json           ← Ecosystem feature toggles (absent=enabled)
  knowledge/
    patterns/           ← Reusable solutions (YAML frontmatter for retrieval)
    decisions/          ← Architectural decision records (ADRs)
  sessions/
    {YYYY-MM-DD}/       ← Per-session logs (auto-archived)
```

#### STATE.md Structure (Recommended)

```markdown
# khuym State
_Updated: {timestamp}_

## Current Focus
- Active skill: {skill-name}
- Active beads: #{bead-id}, #{bead-id}
- Current phase: {description}

## Recent Decisions
- {YYYY-MM-DD}: {decision} — Rationale: {why}

## Active Blockers
- [ ] #{bead-id}: {blocker description} — Owner: {agent or human}

## Session Notes
{freeform notes for next session}

## Context
- Sessions in current work stream: {N}
- Last session summary: {brief}
```

#### config.json Structure (Recommended)

```json
{
  "version": "1",
  "ecosystem": "khuym",
  "context_monitor": {
    "warning_threshold": 0.35,
    "critical_threshold": 0.25
  },
  "features": {
    "knowledge_accumulation": true,
    "session_handoff": true,
    "context_monitoring": true
  },
  "skills": {
    "auto_document_solutions": true,
    "require_bead_per_task": true
  }
}
```

Absent features default to enabled (GSD pattern). Opt out by setting `false`.

#### HANDOFF.json Structure (Recommended)

```json
{
  "version": "1",
  "timestamp": "2026-03-20T16:34:00+07:00",
  "session_id": "khuym-{YYYYMMDD-HHMMSS}",
  "state": {
    "active_skill": "string",
    "active_beads": ["#bd-123", "#bd-456"],
    "current_phase": "string",
    "progress_markers": ["step 1 done", "step 2 in progress"]
  },
  "decisions": [
    {"timestamp": "...", "decision": "...", "rationale": "..."}
  ],
  "open_questions": [
    {"question": "...", "context": "...", "bead_ref": "#bd-789"}
  ],
  "pending_agent_mail": ["mail-id-1"],
  "next_actions": [
    {"priority": 1, "action": "...", "bead_ref": "#bd-123"}
  ],
  "context_at_pause": {
    "tokens_used_pct": 0.62,
    "reason_for_pause": "human_checkpoint | context_critical | completed"
  }
}
```

### What NOT to Build

Do not build:
- A duplicate task tracker (beads do this)
- A full GSD-style ROADMAP.md unless khuym has multi-phase projects
- A lockfile system unless parallel multi-agent execution is common
- Wave-based parallelism orchestration (beads + Agent Mail already route work)

---

## 4. Pause/Resume Design with Beads + Agent Mail

### Pause Protocol

When a khuym agent needs to pause (context critical, human checkpoint, end of session):

**Step 1: Update beads**
```
bd update #bead-id status=in_progress note="paused at step X"
```

**Step 2: Write HANDOFF.json**
- Capture current bead IDs being worked on
- Log decisions made this session
- Log open questions
- Note context level at pause

**Step 3: Update STATE.md**
- Update "Current Focus" section
- Add session notes for next agent

**Step 4: Send Agent Mail** (if handing off to another agent)
```
agent-mail send --to {target-agent} --subject "Handoff: {skill} session {id}" 
  --attach .khuym/HANDOFF.json
  --body "Pausing at {step}. See HANDOFF.json for full context."
```

### Resume Protocol

When a khuym agent starts a new session:

**Step 1: Read STATE.md**
- Get current focus, decisions, blockers in one read

**Step 2: Check for HANDOFF.json**
- If exists: read full handoff; restore progress markers; confirm open questions
- If absent: query beads for in-progress work

**Step 3: Check Agent Mail**
- Read any mail from previous agent
- Acknowledge receipt

**Step 4: Query bead graph**
```
bv --filter status=in_progress
```
- Cross-reference with STATE.md active beads
- Detect discrepancies (bead closed but STATE.md still active = stale state)

**Step 5: Confirm context and proceed**

### Handoff via Agent Mail

The integration between HANDOFF.json and Agent Mail creates a complete chain:
- Sending agent writes HANDOFF.json + sends mail with attachment/reference
- Receiving agent reads mail, loads HANDOFF.json, reads STATE.md
- Bead system provides ground truth on task status
- Agent Mail provides explicit "torch passing"

This avoids the GSD problem of relying purely on file timestamps — Agent Mail creates an explicit signal that work was handed off intentionally (not abandoned).

---

## 5. Context Monitoring Approach

### Recommended Design

Implement a lightweight context monitor as a hook or periodic check, following GSD's advisory-only principle.

#### Threshold Tiers

| Level | Threshold | Action |
|---|---|---|
| **GREEN** | >35% remaining | Normal operation |
| **WARNING** | 35% remaining | Suggest finishing current task before starting new ones |
| **CRITICAL** | 25% remaining | Strongly suggest `/khuym:pause` before context exhaustion |
| **EMERGENCY** | 15% remaining | Auto-write minimal HANDOFF.json regardless of current state |

#### Implementation Options

**Option A: Claude Code PostToolUse hook** (GSD pattern)
- Fires after every tool call
- Checks context usage from Claude Code's environment
- Emits advisory text to the agent
- Pros: Real-time, integrates with Claude Code
- Cons: Requires Claude Code specifically, bug-prone (see GSD Issue #1161)

**Option B: Agent self-monitoring** (simpler)
- Agent is instructed in skill files to periodically estimate context usage
- At key decision points (end of bead, end of phase), check context budget
- Pros: Works in any LLM, no hooks required
- Cons: Less precise, depends on agent discipline

**Option C: Bead-triggered checkpoints** (khuym-native)
- When a bead is closed, automatically check context budget before opening next bead
- Natural pause/resume points align with work units
- Pros: Context checks happen at meaningful transitions; beads are already the work unit
- Cons: Context can degrade *within* a single complex bead

**Recommended:** Option C as primary, Option B as secondary. Bead completion is a natural checkpoint. Add a skill-level instruction: "Before opening a new bead, assess context budget. If >65% used, write HANDOFF.json and pause."

#### Advisory Text Templates

**WARNING:**
```
[CONTEXT WARNING] Context window at ~35% remaining. 
Recommend: Finish current bead #BD-{id}, write session notes, before taking on new work.
```

**CRITICAL:**
```
[CONTEXT CRITICAL] Context window at ~25% remaining.
Recommend: /khuym:pause — write HANDOFF.json now to preserve session state.
Active beads: {list}. Open questions: {count}.
```

---

## 6. Session Handoff Format

### Complete HANDOFF.json Specification

```json
{
  "schema_version": "1.0",
  "format": "khuym-handoff",
  
  "session": {
    "id": "khuym-20260320-163400",
    "started_at": "2026-03-20T14:00:00+07:00",
    "paused_at": "2026-03-20T16:34:00+07:00",
    "agent": "subagent-identifier",
    "reason_for_pause": "human_checkpoint | context_critical | completed | error"
  },
  
  "context_snapshot": {
    "tokens_used_pct": 0.62,
    "bead_count_active": 3,
    "decisions_this_session": 5,
    "files_modified": ["path/to/file1", "path/to/file2"]
  },
  
  "active_work": {
    "skill": "khuym/skill-name",
    "phase": "planning | execution | review | compound",
    "active_beads": [
      {
        "id": "#bd-123",
        "title": "...",
        "status": "in_progress",
        "progress": "Step 2 of 4 complete",
        "next_action": "Run validation tests"
      }
    ]
  },
  
  "decisions": [
    {
      "timestamp": "2026-03-20T14:30:00+07:00",
      "decision": "Use file-based state instead of DB",
      "rationale": "Simpler, readable by any agent without tool calls",
      "bead_ref": "#bd-123",
      "reversible": true
    }
  ],
  
  "open_questions": [
    {
      "id": "oq-001",
      "question": "Should context monitoring be opt-in or opt-out?",
      "context": "Discussed with hoang@kieng.io.vn; no decision reached",
      "urgency": "high | medium | low",
      "bead_ref": "#bd-456",
      "for_human": true
    }
  ],
  
  "blockers": [
    {
      "id": "#bd-789",
      "description": "Agent Mail API endpoint not confirmed",
      "owner": "hoang@kieng.io.vn",
      "unblocked_by": "human decision or #bd-790"
    }
  ],
  
  "resume_instructions": {
    "priority_next": "Continue #bd-123 from step 3",
    "read_first": [".khuym/STATE.md", "docs/decisions/ADR-001.md"],
    "check_mail": true,
    "restore_confirmation": "Confirm: active beads are #bd-123, #bd-456. Continue? [y/n]"
  },
  
  "agent_mail_refs": ["mail-id-001", "mail-id-002"]
}
```

### continue-here.md (Human-Readable Companion)

```markdown
# Session Handoff — 2026-03-20 16:34

## Where We Are
Working on: khuym/skill-name
Phase: execution
Active beads: #bd-123 (in progress, step 2/4), #bd-456 (planning)

## What Was Decided This Session
1. Use file-based state over DB — simpler, universally readable
2. Config uses absent=enabled pattern (like GSD)
3. Context monitoring fires at 35%/25% thresholds

## Open Questions (Need Human Input)
- [ ] Should context monitoring be opt-in or opt-out? (See #bd-456)
- [ ] Confirm Agent Mail API endpoint for cross-agent handoff

## Blockers
- #bd-789: Agent Mail API endpoint not confirmed — blocked on hoang@kieng.io.vn

## To Resume
1. Read .khuym/STATE.md
2. Check Agent Mail inbox
3. Run: `bv --filter status=in_progress`
4. Continue #bd-123 from step 3: "Run validation tests"
```

---

## 7. Academic Evidence on Agent State Persistence

### Key Papers and Findings

#### MemGPT: Towards LLMs as Operating Systems (Packer et al., 2023)
**[arXiv:2310.08560](https://arxiv.org/abs/2310.08560)**

Foundational work on hierarchical memory for LLMs. Key insights:
- **Virtual context management**: Moving data between fast (main context) and slow (external storage) memory, inspired by OS hierarchical memory systems
- **Interrupt-driven control flow**: MemGPT manages transitions between context tiers using interrupts — analogous to GSD's context monitor hook
- **Multi-session continuity**: Demonstrated that agents can "remember, reflect, and evolve dynamically through long-term interactions" when external storage is properly managed

**khuym implication:** HANDOFF.json + STATE.md function as MemGPT's external storage tier. The bead system provides the structured index.

#### TapeAgents: A Holistic Framework (Bahdanau et al., 2024)
**[arXiv:2412.08445](https://arxiv.org/html/2412.08445)**

The tape is a granular, structured log of an agent session that **also serves as the session's resumable state**. Key patterns:
- **Tape as resumable state**: The tape is serializable and fully determines agent state/behavior — like a state machine
- **Rich metadata**: Every step tagged with `author`, `parent_id`, `agent`, `node`, `prompt_id`
- **Any-point resumption**: Can restart from any intermediate tape without re-running prior steps
- **Audit trail**: Steps traceable to exact node/LLM call via metadata

**khuym implication:** HANDOFF.json is a compressed tape. The bead system provides the `parent_id` equivalent (bead dependencies). For complex skills requiring full auditability, consider emitting step-level logs alongside beads.

#### StateAct: Enhancing LLM Agents via Self-prompting (Rozanov & Rei, 2024)
**[arXiv:2410.02810](https://arxiv.org/abs/2410.02810)**

Introduces **chain-of-states** — an extension of chain-of-thought that tracks state information over time. Results:
- +10% over ReAct on Alfworld
- +30% on Textcraft  
- +7% on Webshop

Key mechanism: **self-prompting** reinforces task goals at every step, preventing goal drift in long-horizon tasks. Without state tracking, agents lose adherence to original objectives as context fills.

**khuym implication:** STATE.md's "Current Focus" section functions as the khuym equivalent of StateAct's self-prompting injection. Agents should re-read the current focus section at the start of each bead, not just each session.

#### SagaLLM: Context Management & Transaction Guarantees (Chang & Geng, 2025)
**[arXiv:2503.11951](https://arxiv.org/abs/2503.11951)**

Applies the Saga transactional pattern to multi-agent LLM planning. Key findings:
- **Standalone LLMs frequently violate interdependent constraints** or fail to recover from disruptions without explicit transaction management
- **Modular checkpointing** + compensable execution = workflow-wide consistency without strict ACID guarantees
- **Independent validation agents** are essential for catching constraint violations before they propagate

**khuym implication:** Treat bead completion as a transaction checkpoint. When a bead is closed, validate that its postconditions are met before dependencies can proceed. This is the bead-native equivalent of Saga's compensation mechanism.

#### ShardMemo: Tiered Agent Memory (Zhao et al., 2026)
**[arXiv:2601.21545](https://arxiv.org/abs/2601.21545)**

Proposes a tiered memory architecture:
- **Tier A**: Per-agent working state (in-session, fast)
- **Tier B**: Sharded evidence with approximate nearest neighbor indexes (cross-session, medium)
- **Tier C**: Versioned skill library (long-term, slow)

Under fixed-budget routing ($B_{probe}=3$), ShardMemo improves F1 by +6.87 while reducing retrieval work by 20.5%.

**khuym implication:** Maps naturally to khuym's architecture:
- Tier A = STATE.md (session working memory)
- Tier B = docs/patterns/ + docs/decisions/ (cross-session knowledge)
- Tier C = skill files themselves (versioned capability library)

#### A Survey on LLM Agent Memory Mechanisms (Zhang et al., 2024)
**[arXiv:2404.13501](https://arxiv.org/abs/2404.13501)**

Comprehensive survey (20 papers reviewed) identifying:
- Memory is the key component supporting agent-environment interactions in self-evolving agents
- External memory mechanisms (files, databases) dramatically outperform context-only approaches for long-horizon tasks
- The field lacks standardized patterns — each system re-invents memory differently

#### Zombie Agents: Persistent State Security Risk (Yang et al., 2026)
**[Semantic Scholar](https://www.semanticscholar.org/paper/5dce672edae58beb9b150718f0f15c13c8a3d4a6)**

Critical security finding: **Self-evolving agents that write to long-term memory introduce persistent attack surface.** An attacker can poison memory via indirect exposure (web content), and the payload survives across sessions.

**khuym implication:** Pattern files (docs/patterns/) and STATE.md should be treated with the same caution as CLAUDE.md. Agent-written state that persists across sessions should be validated before being used to influence new decisions. Human review gates on auto-accumulated knowledge are not optional.

### Memory Architecture Comparison (Academic Framing)

```
Type          | Storage     | Scope        | khuym Analog
--------------|-------------|--------------|------------------
Working       | In-context  | Session      | Active context (no file)
Episodic      | Files       | Cross-session| HANDOFF.json, STATE.md  
Semantic      | Files/DB    | Long-term    | docs/patterns/, decisions/
Procedural    | Skill files | Permanent    | .khuym/skills/ definitions
```

Based on MemGPT and the LLM memory survey, the most critical gap for long-horizon tasks is the **episodic → semantic transition**: converting session experiences (STATE.md) into durable, retrievable knowledge (docs/patterns/). This is exactly what Compound Engineering's `/workflows:compound` automates.

---

## Summary Recommendation

### Minimal Viable State Layer for khuym

Add these four things to the bead system, in priority order:

1. **STATE.md** (`~/.khuym/STATE.md` or per-project `.khuym/STATE.md`)
   - Working memory: current focus, decisions, blockers
   - Read at every session start; updated when decisions are made
   - Keeps agents from re-discovering context beads don't store

2. **HANDOFF.json** (written by `/khuym:pause`)
   - Machine-readable session state for graceful handoff
   - References bead IDs as canonical task state
   - Sent via Agent Mail when handing to another agent

3. **Context monitoring instruction** (in skill files, not a hook)
   - "At each bead completion, if context >65% used, write HANDOFF.json and pause"
   - Advisory only; uses bead boundaries as natural checkpoint gates

4. **docs/patterns/** (accumulated via `/khuym:compound`)
   - One markdown per solved problem, YAML frontmatter for retrieval
   - Prevents re-solving solved problems across sessions
   - Human-reviewed before being trusted (Zombie Agent risk mitigation)

### What Beads + This State Layer Collectively Provide

| Need | Covered By |
|---|---|
| What tasks exist and their status | Beads |
| Task dependencies and priorities | Beads |
| Current session focus | STATE.md |
| Why decisions were made | STATE.md + docs/decisions/ |
| How to resume after pause | HANDOFF.json + Agent Mail |
| When to pause | Context monitoring instruction |
| How to avoid re-solving problems | docs/patterns/ |
| Cross-agent work handoff | Agent Mail + HANDOFF.json |
| Audit trail | Git commits (atomic per bead close) |
| Feature toggles | config.json (absent=enabled) |

---

*Research conducted 2026-03-20. Sources: GSD GitHub repositories, Compound Engineering guide (every.to), Superpowers GitHub (obra/superpowers), academic papers from arXiv and Semantic Scholar. All citations include URLs for verification.*
