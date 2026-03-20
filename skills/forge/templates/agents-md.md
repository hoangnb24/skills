# AGENTS.md Template

<!-- INSTRUCTIONS FOR FILLING AGENT
This file is the operating manual for all agents working on this project.
- Create during Phase 0 (Bootstrap). Update as tools, conventions, or team composition change.
- Every agent reads this file at the START of every session — before any work.
- Keep it scannable. Agents should be able to re-orient in under 2 minutes.
- Sections marked FILL must be completed before this file is useful.
- Do not delete sections — add "N/A" if a section doesn't apply.
-->

---

# AGENTS.md: <Project Name>

<!-- FILL: Replace <Project Name> -->

---

## Project Overview

<!-- FILL: 3-5 sentences describing the project. Include:
- What the system does (user-facing description)
- Primary tech stack (language, framework, database)
- Current state (greenfield / active development / maintenance)
- Any critical constraints (performance requirements, compliance, team size)

Example:
This is a B2B SaaS invoicing platform built on Node.js + TypeScript, using PostgreSQL for data storage and Redis for job queues. It handles invoice generation, payment tracking, and PDF delivery for ~500 business clients. Currently in active development (v2 migration from a legacy Rails codebase). Critical constraint: all financial calculations must be auditable and idempotent.
-->

---

## Tool Blurbs

<!-- All agents must know how to use the tools available in this project. -->

### br — Beads (Task Storage)

`br` manages the task list for this project. Each task is a "bead" with three fields: `description` (what to build + acceptance criteria), `design` (implementation approach + file paths), and `notes` (edge cases + references).

```bash
br list                          # Show all beads with IDs and statuses
br show <id>                     # Read full bead content
br create --description "..." --design "..." --notes "..."
br update <id> --status in-progress   # Claim a bead before starting
br update <id> --design "..."         # Update design field (e.g., after a spike)
br close <id>                    # Mark bead done after commit
```

### bv — Beads Viewer (Dependency Graph)

`bv` analyzes bead dependencies and recommends execution order. Run at session start to know what to work on next.

```bash
bv --robot-triage    # Get recommended execution order for current beads
bv --robot-graph     # Validate dependency graph (check for cycles)
```

### am — Agent Mail (File Reservations + Coordination)

`am` prevents file conflicts between agents and provides a messaging channel. **Always reserve files before touching them.**

```bash
am macro_start_session                        # Run at the start of every session
am file_reservation_paths(["file1", "file2"]) # Reserve files before editing
am check_mail                                 # Poll for messages
am send --to <agent-or-human> --subject "..." --body "..."
am macro_end_session                          # Run at the end of every session
```

### Optional Tools

<!-- FILL: Delete rows for tools not installed. Add rows for any custom tools. -->

| Tool | Available? | Purpose |
|------|:----------:|---------|
| `cass` | <!-- ✅ / ❌ --> | Cross-session search — finds prior work on a topic before re-solving |
| `cm` | <!-- ✅ / ❌ --> | Context memory — distills episodic sessions into procedural knowledge |
| `gkg` | <!-- ✅ / ❌ --> | Codebase knowledge graph — definitions, references, repomap |

<!-- FILL: For each available optional tool, add a brief usage blurb below this comment.
Example for gkg:

#### gkg — Graph Knowledge Graph

```bash
gkg repomap                          # High-level architecture overview
gkg search_codebase_definitions <symbol>  # Find where a symbol is defined
gkg get_references <symbol>          # Find all usages of a symbol
gkg import_usage <module>            # Find all files that import a module
```
-->

---

## Coordination Rules

### File Reservations

- **Reserve before touching.** Call `am file_reservation_paths([...])` with the list of files you intend to modify before making any changes.
- **One owner per file.** If a file is already reserved, send an Agent Mail to the reserving agent to coordinate, or wait for the reservation to expire.
- **Release when done.** `am macro_end_session` releases all reservations held by the current session. If ending early, release manually.
- **Reservation TTL**: <!-- FILL: e.g., 2 hours. Adjust to project norms. -->

### Communication via Agent Mail

- **Session start**: send a brief status to the team channel: `am send --to all --subject "Starting session" --body "Working on beads: [list]"`.
- **Blocking question**: if you need input from another agent, send a direct message and pause work on the dependent bead. Do not guess.
- **Completion notice**: when a bead is complete, send a notice if other agents have downstream beads.
- **Escalation**: for any issue that cannot be self-resolved (see `references/recovery-protocol.md`), send to the human with subject line starting with `ESCALATION:`.

### Parallelism Rules

- Independent beads (no shared files, no data dependencies) may be worked in parallel across sessions.
- Dependent beads must wait for their upstream bead to be committed and closed before starting.
- Check `bv --robot-graph` to verify independence before claiming parallel work.

---

## Session Start Protocol

Run these steps at the beginning of **every** session, without exception.

```
1. Read AGENTS.md (this file) — full file, every session.
2. Read CLAUDE.md — especially Anti-Patterns and Validated Approaches.
3. Run: am macro_start_session
   → Registers this session, checks mail, shows existing file reservations.
4. Run: bv --robot-triage
   → Shows recommended next bead based on dependency order and priority.
5. Check spike results: `br show <next-bead-id>` — has the design field been updated by a spike?
6. Reserve files for the first bead you will work on.
```

---

## Session End Protocol

Run these steps before ending **every** session.

```
1. Commit all work: git commit -m "[bead-<id>] <description>"
   → Never end a session with uncommitted changes on the feature branch.
2. Close completed beads: br close <id>
3. Update in-progress beads with a status note: br update <id> --notes "Progress: <what's done>. Remaining: <what's left>."
4. Send session summary via Agent Mail:
   am send --to all --subject "Session end" --body "Completed: [bead list]. In-progress: [bead id + status]. Blockers: [any]."
5. Run: am macro_end_session
   → Releases all file reservations held by this session.
```

---

## Git Conventions

### Branch Strategy

```
main                          ← stable, reviewed code only
feature/<epic-slug>           ← feature branches (from main)
spike/<bead-id>-<slug>        ← spike branches (short-lived, archived after spike)
wip/<bead-id>                 ← work-in-progress (used when ending a session mid-bead)
debug/<bead-id>               ← debugging branches (for build failure escalation)
```

### Commit Message Format

```
[bead-<id>] <imperative verb> <what changed>

Examples:
[bead-007] Add invoice PDF generation endpoint
[bead-012] Fix null pointer in payment status handler
[bead-015] Refactor auth middleware to support API keys
```

- Use imperative mood: "Add", "Fix", "Refactor" — not "Added", "Fixes", "Refactoring".
- Include the bead ID in every commit. This links commits to requirements.
- One logical change per commit. Do not bundle unrelated changes.

### PR Rules

- PRs are created after a **wave** of beads is complete (not per-bead).
- PR description must reference all bead IDs included.
- PR must include: what changed, why, and how to test it.
- Compound review (Phase 5) must be completed before merging to main.

### Merge Strategy

<!-- FILL: squash / merge commit / rebase. Choose one and state it here.
Example: "Use squash merge to main to keep history clean. Feature branch history is preserved until after merge." -->
