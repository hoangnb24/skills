# Phase Reference Guide

> Detailed instructions for every Forge phase. Each section is self-contained — an
> agent can jump directly to the relevant phase without reading the others.
>
> **See also:** `references/adaptive-mode.md` for skip logic, `references/tool-harness.md`
> for tool detection, `references/recovery-protocol.md` for failure recovery.

---

## Table of Contents

- [Phase 0: Bootstrap](#phase-0-bootstrap)
- [Phase 1: Brainstorm](#phase-1-brainstorm)
- [Phase 2: Breakdown](#phase-2-breakdown)
- [Phase 3: Spike](#phase-3-spike)
- [Phase 4: Execute](#phase-4-execute)
- [Phase 5: Compound](#phase-5-compound)

---

## Phase 0: Bootstrap

**Trigger:** First time Forge is used on a project. Never repeated.  
**Duration:** 10–30 minutes.  
**Handoff artifact:** `CLAUDE.md` + `AGENTS.md` + initialized `.beads/` directory.

---

### Purpose

Bootstrap creates the persistent memory layer that all future phases depend on.
Every agent that runs on this project reads these files before doing anything else.
Without them, agents have no shared conventions, no coordination protocol, and no
cumulative knowledge. Bootstrap is how a fresh codebase becomes an agentic workspace.

---

### Step 1 — Create CLAUDE.md

Create `CLAUDE.md` in the project root. This is the agent's primary instruction file
and living project memory. It is NOT a human-readable README — it is written for AI
agents to read at the start of every session.

**Required sections:**

```markdown
# CLAUDE.md — Project Agent Instructions

## Architecture Decisions
<!-- Record why key architectural choices were made.
     Format: [date] Decision — rationale -->

## Conventions
<!-- Code style, naming, patterns to follow.
     Format: [date] Convention — source/rationale -->

## Anti-Patterns
<!-- What NOT to do, with root cause.
     Format: [date] Anti-pattern — why it fails, what to use instead -->

## Validated Approaches (from spikes)
<!-- Approaches proven to work in spike branches.
     Format: [date] Approach — spike/<bead-id>, evidence -->
```

**Critical rules for CLAUDE.md:**
- Keep entries dated so staleness is visible.
- Write for a fresh agent that has never seen this codebase.
- Be specific: "Use guard clauses instead of nested ifs" is useful; "write clean code"
  is not.
- Every P0/P1 finding from Phase 5 must produce a CLAUDE.md entry.
- Every successful spike updates "Validated Approaches."
- Every failed spike updates "Anti-Patterns."

---

### Step 2 — Create AGENTS.md

Create `AGENTS.md` in the project root. This is the multi-agent coordination manual.
Every agent reads this at session start, not just once.

**Required sections:**

```markdown
# AGENTS.md — Multi-Agent Coordination Manual

## Tool Blurbs
<!-- One-paragraph description of each tool available in this project:
     br (beads), bv (beads viewer), am (Agent Mail), plus any optional tools. -->

## File Reservation Protocol
<!-- How to use Agent Mail file reservations to prevent write conflicts.
     Include: how to claim, TTL, how to release, what happens on timeout. -->

## Coordination Rules
<!-- Rules governing multi-agent behavior:
     - Always check reservations before touching shared files
     - Never modify a file reserved by another agent without mail first
     - How to handle blocked beads (mail the blocker, then mail the human)
     - Wave execution rules -->

## Bead Status Protocol
<!-- Valid statuses: pending, in-progress, done, blocked
     Who can update what, when -->

## Session Start Checklist
<!-- Ordered steps every agent must complete:
     1. Read AGENTS.md (this file)
     2. Read CLAUDE.md
     3. am macro_start_session
     4. bv --robot-triage
     5. Check current bead design fields for spike results -->
```

**Critical rules for AGENTS.md:**
- Write for an agent that has never run in this project before.
- Assume the agent does NOT know the tool conventions unless stated here.
- Update the File Reservation section whenever the reservation protocol changes.

---

### Step 3 — Initialize Beads

```bash
br init
```

This creates the `.beads/` directory. Verify it exists before proceeding. If `br` is
not found, surface the install instruction and stop — beads is a core required tool,
not optional.

---

### Step 4 — Optional Enhancements

Run these only if the respective tool is available (detected via `--version`):

```bash
# Procedural memory initialization
cm init --repo

# Cross-session search seeding (search for prior work on this domain)
cass search "<project-domain>" --robot-mode

# Codebase knowledge graph
gkg index
```

For `cass`: If prior sessions are found, note them in CLAUDE.md under
"Validated Approaches" or "Anti-Patterns" as applicable.

For `gkg`: Index output is available to all phases as `gkg repomap` (architecture
overview), `gkg import_usage` (dependency analysis), and `gkg get_references`
(cross-file reference tracing).

---

### Step 5 — Optional: Pin Tech Stack Docs

If the project uses technologies the agent may not have strong training coverage for
(new frameworks, proprietary APIs, niche libraries), create `docs/references/` and
pin the relevant documentation:

```
docs/references/
├── <framework>-quickref.md   # Distilled command reference
├── <api>-auth-flow.md        # Auth patterns specific to this project
└── README.md                 # Index of what's pinned and why
```

Do NOT pin docs for standard, well-known technologies (React, PostgreSQL, Python
stdlib, etc.). The agent already has them in training weights.

---

### Critical Rule

> **Every agent MUST read `AGENTS.md` before any session, and `CLAUDE.md` before any
> planning.** These are not optional reads. If either file is missing, stop and create
> it before proceeding.

---

## Phase 1: Brainstorm

**Trigger:** Any new feature, component, or behavioral change. Mandatory before any
implementation work.  
**Source:** Superpowers brainstorming mechanics (Jesse Vincent / Prime Radiant).  
**Handoff artifact:** `docs/plans/YYYY-MM-DD-<topic>-design.md` — spec-reviewed and
human-approved.

---

### Hard Gate

> **DO NOT write any code, scaffold any structure, or invoke any implementation action
> until the design document has been reviewed and the human has explicitly approved it.**
>
> This applies regardless of perceived simplicity. A "simple" task with an unexamined
> assumption causes more wasted work than a complex task with a clear design.

---

### The 9-Step Checklist

Complete these steps in order. Do not skip or reorder.

**Step 1 — Explore context first**

Before asking the human a single question:
- Read existing files, documentation, and recent git commits.
- If `gkg` is available: run `gkg repomap` for an architectural overview.
- Read `CLAUDE.md` — note existing conventions and anti-patterns that are relevant.
- If `cass` is available: run `cass search "<topic>" --robot-mode` to check for prior
  work on related designs.

Purpose: Arrive at the first question informed, not blind. Questions asked from
ignorance waste human attention.

**Step 2 — Scope check**

Before refining any details, assess whether the request spans multiple independent
subsystems. Signals of over-scope:
- "Build a platform with X, Y, Z, and W"
- The request would touch 4+ unrelated modules
- Multiple teams or ownership boundaries would be crossed

If over-scoped: tell the human immediately. Help decompose into sub-projects. Do not
spend questions refining details of a project that needs decomposition first. Each
sub-project gets its own brainstorm pass.

**Step 3 — Visual companion offer (if visual topic)**

If the task involves UI layout, wireframes, architecture diagrams, or visual
comparisons: offer the visual companion in a **standalone message** — no other content
combined with this offer.

Key distinction:
- Use browser/visual: content that IS visual — mockups, wireframes, layout comparisons,
  architecture diagrams
- Use terminal: content that is conceptual — requirements, trade-off lists, A/B options,
  scope decisions

> A question about a UI topic is not automatically a visual question. "What should the
> personality of this button be?" is a conceptual question — use the terminal.

**Step 4 — Ask clarifying questions, one at a time**

Rules:
- **One question per message.** If a topic needs more exploration, break it into
  sequential questions.
- **Prefer multiple choice** when the decision space can be enumerated. Forces the agent
  to think through options; makes it easier for the human to answer.
- **Focus on:** purpose, constraints, success criteria. Not implementation details — those
  come in the design.
- If an answer makes a later question irrelevant, skip it.

Example format:
```
Question 2: What authentication approach should this use?

A) JWT with refresh tokens (stateless, scales horizontally)
B) Session-based with Redis (easier revocation, more infrastructure)
C) OAuth2 via existing provider (no credential management)
```

**Step 5 — Propose 2–3 approaches**

Present 2–3 viable approaches with explicit trade-offs. Lead with the recommended
approach. Format:

```
Approach A (Recommended): <name>
  - Pro: ...
  - Con: ...

Approach B: <name>
  - Pro: ...
  - Con: ...

Recommendation: Approach A because <specific rationale for this project>.
```

Do not present more than 3 approaches — more than 3 signals the design space is not
sufficiently constrained. Go back to clarifying questions if needed.

**Step 6 — Present design section by section**

Cover: architecture, components, data flow, error handling, testing. Scale depth to
complexity — a few sentences for straightforward sections, up to 200–300 words for
nuanced ones.

After each section, ask: "Does this section look right?"

Do not present the full design as a wall of text and ask for approval at the end.
Section-by-section approval catches misalignments early, before the human has committed
to reading the whole document.

If the human requests changes to an earlier section, revise it before proceeding.

**Step 7 — Write the design document**

Save to: `docs/plans/YYYY-MM-DD-<topic>-design.md`

Required sections in the document:
```markdown
# Design: <topic>

## Summary
<!-- One paragraph: what is being built and why -->

## Architecture
## Components
## Data Flow
## Error Handling
## Testing Strategy
## Locked Decisions
<!-- Decisions made during clarifying questions — prevents re-litigation -->

## Out of Scope (YAGNI)
<!-- Explicit list of things NOT being built in this iteration -->
```

Commit the file to git immediately after writing.

**Step 8 — Spec-review loop**

Dispatch the `spec-document-reviewer` subagent. Rules:

1. The reviewer receives **ONLY the spec file path** — never the session history,
   never the conversation context. Providing session history contaminates the review
   and balloons token usage.

2. The reviewer checks:
   - **Completeness:** Architecture, data flow, error handling, and testing all
     addressed?
   - **YAGNI compliance:** Any features described that weren't requested or aren't
     needed now?
   - **Clarity:** Could an engineer unfamiliar with this codebase understand the design?
   - **Isolation:** Are boundaries well-defined? Does each component have one purpose?
   - **Pattern consistency:** Does the design follow conventions in `CLAUDE.md`?

3. If issues found: fix them, re-dispatch. Repeat.

4. **Maximum 3 iterations.** The limit is 3, not 5. This was deliberately reduced
   because LLMs have a bias ceiling — after 3 rounds, additional iterations produce
   diminishing signal and risk over-refining toward the reviewer's preferences rather
   than the actual requirements.

5. If the loop exceeds 3 iterations without approval: surface to the human with a
   summary of the outstanding issues. Do not continue iterating autonomously.

6. After each round, produce a **CHANGELOG** of what the reviewer found and what was
   fixed. Example:
   ```
   Spec Review Round 2 CHANGELOG:
   - Found: Missing error handling for network timeout in data flow section
     Fixed: Added timeout/retry behavior to Data Flow section
   - Found: YAGNI — WebSocket support described but not requested
     Fixed: Moved to Out of Scope section
   - Approved: All other sections
   ```

   The CHANGELOG lets the human quickly evaluate whether the review loop found
   real problems or was cycling on trivialities.

**Step 9 — Human approval gate**

> **The human approval is the actual gate. The review loop is preparation for that
> gate, not a substitute for it.**

Present the reviewed spec and the review CHANGELOG to the human. Wait for explicit
approval. Do not proceed to Phase 2 until the human approves.

If the human requests changes: update the design doc, re-run the spec review loop (up
to 3 iterations), present again.

The terminal state of Phase 1 is human approval. Nothing else ends Phase 1.

---

### Optional Enhancements

- If `cass` available: search prior sessions before starting questions. Existing
  designs may answer clarifying questions or surface anti-patterns.
- If `gkg` available: use `repomap` output to inform the architecture section.

---

## Phase 2: Breakdown

**Trigger:** Approved design document from Phase 1.  
**Source:** GSD discuss-lock + BMAD story mechanics + bv graph routing.  
**Handoff artifact:** Polished bead set with dependency graph verified by
`bv --robot-graph`.

---

### Step A — Discuss Phase (GSD)

Before creating any beads, eliminate all gray zones in the design document.

For each ambiguous area — visual behavior, API contracts, auth approach, performance
constraints, error recovery — ask until satisfied. Record every decision in the design
doc under a `## Locked Decisions` section.

For quick tasks (< 30 min), use batch mode: group multiple gray-zone questions into a
single message. For larger tasks, ask sequentially.

**Exit criterion for Step A:** Zero planning-time ambiguity. Every question that could
block implementation has been answered and recorded.

---

### Step B — Task Decomposition (BMAD story mechanics)

Create one bead per task component. Each bead must carry enough embedded context that
the executing agent can do its work reading **only the bead + AGENTS.md + CLAUDE.md**.

The executing agent does NOT read the design document. The executing agent does NOT
have access to this conversation. Every piece of information it needs must be in the
bead itself.

**Three-field structure per bead:**

```
description:
  What to build + why it fits the architecture + acceptance criteria.
  Include: the goal in one sentence, how it fits the larger system, and
  a numbered list of acceptance criteria the agent can verify.

design:
  How to implement it + file paths + test requirements.
  Include: the algorithm or approach, exact file paths to create/modify,
  external dependencies, and what tests to write. For spiked beads,
  include the validated approach from the spike result.

notes:
  Edge cases + related beads + reference links.
  Include: known gotchas, bead IDs this one blocks or depends on,
  links to relevant CLAUDE.md entries, and any constraint the design
  section could not naturally accommodate.
```

**Self-containment checklist for each bead:**
- [ ] An agent reading only this bead knows what to build
- [ ] An agent reading only this bead knows which files to touch
- [ ] An agent reading only this bead knows what tests to write
- [ ] An agent reading only this bead knows what "done" means
- [ ] Dependencies on other beads are listed in `notes`
- [ ] No pointer to the design doc as required reading

---

### Step C — Graph Validation (bv)

```bash
bv --robot-graph    # Verify dependency graph is valid — no cycles, no orphans
bv --robot-triage   # Get execution order recommendation
```

Fix any cycles before proceeding. A dependency cycle is a bead decomposition error,
not a graph error — the underlying task needs re-analysis.

If `gkg` is available: use `import_usage` and `get_references` to cross-check the
dependency analysis. File-level import graphs often reveal dependencies the bead author
missed.

---

### Step D — Bead Polishing

Run 2–3 review rounds with a subagent. Use this prompt pattern:

**Round 1:**
```
Review all beads exhaustively. Check:
1. Completeness — does each bead have all three fields fully populated?
2. Ambiguity — is any instruction unclear or open to interpretation?
3. Missing dependencies — does any bead assume output from another without declaring it?
4. Scope creep — does any bead include work not in the approved design?
5. Test coverage — does each bead's design field specify what to test?

List every issue you find with bead ID and specific fix recommendation.
```

**Round 2:**
```
Review all beads again. Previous round found: [paste round 1 issues].
Focus on what round 1 missed. What is still incomplete, ambiguous, or risky?
```

**Round 3 (if needed):**
Same pattern, with previous rounds listed.

**Convergence criterion:** Stop when the changes between rounds become incremental —
minor wording clarifications rather than structural issues. Typically 2 rounds is
sufficient; 3 is the ceiling. More than 3 rounds signal that the original decomposition
has a structural problem that polishing will not fix — revisit Step B.

---

### Handoff

Bead set is complete when:
- `bv --robot-graph` shows no cycles
- All beads pass the self-containment checklist
- Polishing rounds have converged

---

## Phase 3: Spike

**Trigger:** Any bead with risk level MEDIUM or HIGH. Any technology not yet used in
this project. Any approach not already present in `CLAUDE.md` under "Validated
Approaches."  
**Source:** Technical Discovery Sprint (Forge original).  
**Time-box:** Maximum 2 hours per spike.  
**Handoff artifact:** `docs/spikes/YYYY-MM-DD-<bead-id>-spike.md` + updated bead
`design` field + CLAUDE.md entry.

---

### Purpose

A spike answers a specific technical question before it becomes a blocked bead during
execution. The goal is not to build the feature — it is to validate (or invalidate) an
approach with a minimal prototype. Spike code is throwaway code.

Do not spike to learn a technology. Spike to answer a specific, measurable question
about a specific approach in this specific codebase context.

---

### Step 1 — Pre-Spike Search

Before writing a single line of code, check existing knowledge:

```bash
# If cass available:
cass search "<spike topic>" --robot-mode

# If cm available:
cm context "<domain>"
```

Also read `CLAUDE.md` "Validated Approaches" and "Anti-Patterns." If an identical
approach was already validated in a prior spike, skip the spike and reference the
existing result. If a similar approach was marked as an anti-pattern, do not re-spike
it unless the context has materially changed.

---

### Step 2 — Define Success Criteria

Write the success criteria before writing any code. Success criteria must be
machine-verifiable — not "works well" or "feels fast," but specific assertions:

```
Success Criteria for spike/auth-token-refresh:

1. POST /auth/refresh returns 200 with new access token when refresh token is valid
2. POST /auth/refresh returns 401 when refresh token is expired
3. Token refresh adds < 5ms latency on warm path (measured via benchmark)
4. No memory leak after 1000 successive refresh calls (measured via process.memoryUsage)
```

These criteria are the exit condition for the spike. They are not aspirational. If you
cannot define machine-verifiable success criteria, the spike question is too vague —
sharpen the question before proceeding.

---

### Step 3 — Isolated Branch

```bash
git checkout -b spike/<bead-id>-<slug>
```

Example: `spike/auth-003-token-refresh`

The spike branch is isolated from the main feature branch. Spike code is throwaway.
Never merge spike code into main or the feature branch directly — carry findings only.

---

### Step 4 — Prototype

Build the minimum proof-of-concept that evaluates the success criteria. Rules:
- No production polish. No error handling beyond what the criteria require.
- No tests beyond what validate the criteria.
- If you find yourself writing reusable abstractions, stop — that is feature work,
  not spike work.
- Time-box strictly. Check the clock.

---

### Step 5 — Time-Box Enforcement

**Maximum 2 hours per spike.**

At the 2-hour mark, evaluate with whatever evidence you have:
- If criteria are partially met: write what you know, classify as CONDITIONAL GO,
  escalate to human.
- If the approach appears fundamentally unworkable: document the evidence, mark STOP.
- If you need more time: stop, document the reason, escalate. Do not extend silently.

Silent overrun is a worse outcome than an incomplete spike — it burns resources without
surfacing the difficulty signal that the human needs.

---

### Completion Promise

The agent cannot exit the spike until all three of the following are true:

1. **All success criteria evaluated** — each criterion has a pass/fail result with
   concrete evidence (log output, benchmark numbers, test output, error messages).
2. **At least one alternative approach considered** — document what else could work
   and why this approach was chosen over it (or why neither approach works).
3. **Edge cases documented** — what breaks this approach, at what scale, under what
   conditions.

These are not optional. An incomplete spike report is worse than no spike — it creates
false confidence.

---

### Stop/Go Gate

Classify the result as one of three outcomes:

**GO — All criteria met**
```
Actions:
1. Update the bead's `design` field with the validated approach (replace the
   placeholder with the actual implementation path confirmed by the spike)
2. CLAUDE.md → "Validated Approaches":
   [YYYY-MM-DD] <approach> — spike/<bead-id>, evidence: <one sentence>
3. Archive the spike branch (do not delete — keep for reference)
4. Write spike report to docs/spikes/YYYY-MM-DD-<bead-id>-spike.md
```

**CONDITIONAL GO — Criteria partially met**
```
Actions:
1. Document which criteria passed and which failed
2. Create new blocking beads for the unresolved conditions
3. Update the original bead's `notes` field with the conditions
4. Write spike report — include the conditions clearly
5. Escalate to human for GO/STOP decision
   Human must explicitly decide before execution proceeds
```

**STOP — Approach invalidated**
```
Actions:
1. CLAUDE.md → "Anti-Patterns":
   [YYYY-MM-DD] Do not use <approach> for <use case> — <root cause> [spike/<bead-id>]
2. Write spike report — include the failure evidence
3. Trigger Phase 1 brainstorm for the affected bead
   The bead's approach must be redesigned before execution
4. Do NOT proceed to execution on the original approach
```

---

### Spike Report Format

Save to `docs/spikes/YYYY-MM-DD-<bead-id>-spike.md`:

```markdown
# Spike Report: <bead-id> — <slug>

**Date:** YYYY-MM-DD
**Branch:** spike/<bead-id>-<slug>
**Result:** GO | CONDITIONAL GO | STOP

## Question
What technical question this spike was answering.

## Success Criteria

| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | <criterion> | PASS/FAIL | <evidence> |

## Approach Taken
Brief description of what was prototyped.

## Alternative Considered
What else could work, and why this approach was preferred (or why both fail).

## Edge Cases
What breaks this approach and under what conditions.

## Conclusion
One paragraph: what was learned and what the next step is.
```

---

## Phase 4: Execute

**Trigger:** Verified bead set from Phase 2, with spikes complete for MEDIUM/HIGH risk
beads.  
**Source:** GSD wave execution + Ralph completion promise + Agent Mail coordination.  
**Handoff artifact:** Merged commits per wave, bead statuses updated.

---

### Session Kickoff (Every Agent, Every Session)

Every agent must complete these steps before touching any code:

```
1. Read AGENTS.md — full operating manual
2. am macro_start_session — registers this agent, delivers mail, shows file reservations
3. bv --robot-triage — graph analysis + next bead recommendation
4. Inspect recommended bead's design field for spike results
```

Do not skip `am macro_start_session` even in single-agent mode. It is the mechanism
that catches context recovery scenarios and coordination state from prior sessions.

---

### Execution Modes

Select the mode based on task scale before starting the first bead:

#### Single-Agent Mode (default — tiny and small tasks)

- One Claude Code session runs the full bead set.
- Process beads sequentially in the order `bv --robot-triage` recommends.
- Sub-agents may be spawned for isolated, file-scoped work (e.g., writing tests for a
  single module).
- File reservations are still required — future sessions and tools may check them.

#### Multi-Session Mode (medium and large tasks — 2 to 4 sessions)

- Each session claims a track: a group of related beads that share files or domain.
- Tracks are declared upfront to minimize overlap. Use `bv --robot-triage` output to
  identify natural track boundaries.
- Agent Mail coordinates: **always check reservations before touching any shared file**.
- Wave execution: independent beads in parallel, dependent beads wait for their
  blockers to close.
- Sessions communicate via Agent Mail. Do not assume another session's status from
  bead status alone — check mail.

#### Swarm Mode (large only — 5 or more sessions)

- Full Agent Mail coordination required. TTL file reservations are mandatory.
- Every session runs `bv --robot-triage` at start to select its next bead — do not
  pre-assign beads across sessions.
- Human acts as "clockwork deity": monitors via Agent Mail dashboard, resolves
  conflicts, unblocks stuck agents.
- Never proceed if mail is unread. A blocking message from another agent is more
  urgent than the current bead.

---

### Per-Bead Protocol

Follow this protocol exactly for every bead, regardless of size:

```
1. Claim bead
   br update <id> --status in-progress

2. Reserve files
   am file_reservation_paths([list of files this bead will write to])
   Include any file that will be modified, not just files that will be created.

3. Read bead
   Read: description field (what + why + acceptance criteria)
   Read: design field (how + file paths + test requirements + spike results)
   Read: notes field (edge cases + dependencies + references)
   Then re-read AGENTS.md and CLAUDE.md to refresh conventions.
   Do NOT read the design doc or any other planning file — the bead is self-contained.

4. Implement
   Work from fresh context: bead + AGENTS.md + CLAUDE.md only.
   Follow conventions from CLAUDE.md.
   Follow anti-patterns in CLAUDE.md (do not repeat known mistakes).
   If the bead's design references a spike result, follow the validated approach
   exactly — do not substitute a different approach without a new spike.

5. Self-review
   First pass: spec compliance
     - Each acceptance criterion from the bead's description: met?
     - Missing implementation: anything in the acceptance criteria not built?
     - Extra implementation: anything built that is not in the criteria?
   Second pass: code quality
     - Conventions from CLAUDE.md followed?
     - Anti-patterns from CLAUDE.md avoided?
     - No debug code, no commented-out code, no TODO without a bead reference

6. Run tests
   Run all tests relevant to changed files.
   If tests fail: fix before proceeding — do not commit failing tests.
   If no automated tests exist and the bead's design specifies test requirements:
   write the tests first, then verify they pass.
   Document "N/A" only if the bead explicitly states tests are not applicable
   and the reason is recorded in the bead's notes.

7. Atomic commit
   git add <changed files>
   git commit -m "[bead-<id>] <description>"
   One commit per bead. Do not batch multiple beads into a single commit.

8. Release reservations
   am file_reservation_release([same list from step 2])

9. Close bead
   br close <id>
```

---

### Completion Promise (Ralph mechanics)

The agent cannot exit bead execution and move to the next bead until all four
conditions are true:

1. **All acceptance criteria evaluated** — each criterion from the bead's `description`
   has a pass/fail result. If any criterion fails, fix and re-evaluate. Do not mark
   partial completion as done.
2. **Tests pass** — all tests run, all pass. If tests are N/A, the reason is recorded
   in the bead's notes (do not silently skip).
3. **File reservations released** — `am file_reservation_release` called. Unreleased
   reservations block other agents indefinitely.
4. **Git commit made** — `[bead-<id>]` commit exists. No exceptions. The commit is the
   tamper-evident record that the bead was completed.

If the agent session ends before all four conditions are met, the next session must
detect the incomplete state via `am macro_start_session` mail and re-run the incomplete
steps before picking up new beads.

---

### Context Recovery Protocol

If context compaction is detected (the agent loses access to earlier conversation
turns), execute this protocol immediately before resuming any work:

```
1. Re-read AGENTS.md — full operating manual, not a summary
2. Re-read CLAUDE.md — conventions + anti-patterns
3. Re-read the current bead — description + design + notes
4. am check_mail — read all unread messages from other agents
5. git log --oneline -10 — identify last completed commit
6. Resume from the step after the last committed bead
```

Do not attempt to reconstruct context from memory. Memory after compaction is
unreliable. The files are ground truth.

---

### Git Workflow

```
Branch naming:   feature/<epic-slug>    (from main, not from spike branches)
Commit format:   [bead-<id>] <description>
PR timing:       After each wave is complete (not after every bead)
Merge timing:    After Phase 5 compound review clears all P0/P1 findings
```

Do not merge to main until the compound review is complete. The PR is the artifact
that triggers Phase 5 — creating the PR is the handoff to the next phase, not the
completion of work.

---

## Phase 5: Compound

**Trigger:** After each wave PR is ready for review.  
**Source:** Compound Engineering capture (Shipper/Klaassen, Every Inc.) + CM
consolidation (optional).  
**Handoff artifact:** Updated CLAUDE.md + reviewed and merged code.

---

### Purpose

Compound is the phase that prevents entropy accumulation. Traditional engineering
assumes each new feature makes the next feature harder (more code, more
interdependencies, more edge cases). Compound engineering inverts this: every PR feeds
learnings back into the system so future agents start better-informed.

The compound step is what separates a transactional AI workflow (prompt → code → ship
→ repeat from zero) from a compounding one (each cycle builds institutional knowledge
that makes the next cycle faster and cheaper).

---

### Step 1 — Knowledge Capture

After the PR diff is available, capture three categories of knowledge. Not everything
is worth capturing — focus on what a future agent would need to know to avoid
repeating a mistake or reinventing a decision.

**Patterns** — New approaches with code examples:
```
[date] Pattern: Use <approach> for <use case>
  Why: <rationale>
  Example: <code snippet or file reference>
  Validated in: <bead-id> or <PR number>
```

**Decisions** — Why approach A over B:
```
[date] Decision: Chose <A> over <B> for <use case>
  Rationale: <specific reason in this codebase context>
  Trade-offs accepted: <what was given up>
  See: <PR or spike reference>
```

**Failures** — What went wrong:
```
[date] Failure: <what broke>
  Root cause: <why it happened>
  Fix applied: <what was done>
  Prevention: <what future agents should do or avoid>
```

Do not write generic lessons. Write lessons specific to this codebase, this PR, this
decision. "Don't use N+1 queries" is useless. "Don't call user.posts in a loop — use
includes(:posts) — found in PR #47, causes 400ms latency on production user list" is
a compound entry.

---

### Step 2 — Review Sub-Agents

Dispatch exactly 5 focused reviewers. Each reviewer receives ONLY the PR diff and its
specialization context — not the full codebase, not the conversation history.

| Reviewer | Focus |
|----------|-------|
| `security-sentinel` | Auth flaws, injection vectors, secrets committed to code, insecure defaults |
| `performance-oracle` | N+1 queries, blocking I/O, unnecessary recomputation, missing caching |
| `architecture-strategist` | Boundary violations, unexpected coupling, scalability implications |
| `simplicity-checker` | YAGNI violations, over-engineering, abstractions introduced before needed |
| `spike-alignment-validator` | Does the implementation match the validated spike approach, or did the agent deviate without a new spike? |

**Why 5 and not 14:** The compound engineering framework uses 14+ reviewers, but
Forge targets 5 because:
- LLM context is a finite resource — more reviewers dilutes each reviewer's focus
- The 5 reviewers above cover the highest-value failure modes
- A P0 from `spike-alignment-validator` prevents an entire class of "works differently
  than we tested" bugs that 14 generic reviewers would miss

Each reviewer produces an independent findings list. After all 5 complete, aggregate
into a single prioritized list.

---

### Step 3 — Priority Classification

Classify every finding by priority:

**P0 — Blocks merge:**
- Security vulnerability (auth bypass, injection, exposed secret)
- Correctness failure (wrong behavior for acceptance criteria)
- Spike deviation without justification (built differently than validated)

Actions:
1. Create a new blocking bead for the fix
2. Link the bead to the PR
3. Do not merge until the bead is closed and the diff is re-reviewed

**P1 — Tech-debt bead:**
- Performance issue that does not fail tests but degrades production
- Architectural coupling that makes future changes harder
- Missing test coverage for a non-trivial path

Actions:
1. Create a tech-debt bead with the finding details
2. Add the bead to the backlog (it does not block this merge)
3. Add a CLAUDE.md note if the pattern is likely to recur

**P2 — Non-blocking, CLAUDE.md only:**
- Simplification opportunity (code works, could be simpler)
- Minor convention deviation (works, but inconsistent with style)
- YAGNI candidate (harmless now, but worth noting)

Actions:
1. Record in CLAUDE.md under the relevant section
2. Do not create a bead
3. Reviewer adds the entry directly — no human action required

---

### Step 4 — CLAUDE.md Auto-Update

After findings are classified, update CLAUDE.md with durable entries:

```markdown
## Conventions (from compound)
- [YYYY-MM-DD] Use <approach> for <use case> — validated in spike/<bead-id>
- [YYYY-MM-DD] Name <pattern> as <convention> — PR #<number>

## Anti-Patterns
- [YYYY-MM-DD] Do not use <X> for <Y> — causes <Z> [P0 finding, PR #<number>]
- [YYYY-MM-DD] Avoid <pattern> — leads to <failure mode> [P1 finding]
```

**Format rules:**
- Always include a date. Undated entries become invisible technical debt.
- Always include a reference (bead ID, PR number, or spike branch). Entries without
  references cannot be validated or removed.
- Write in the imperative ("Use X", "Do not use Y") — agents parse imperatives more
  reliably than observations.
- Keep each entry to one or two lines. Long prose entries get skipped.

**Staleness removal:** When a convention or anti-pattern becomes irrelevant (library
updated, architecture changed), remove or update the entry and add a dated note. Do
not let the file accumulate phantom rules.

---

### Step 5 — Optional: CM Consolidation

If `cm` is available:

```bash
cm reflect
```

This triggers episodic-to-procedural distillation: recent session memories are
analyzed for recurring patterns and promoted to procedural memory.

Key behaviors of `cm reflect`:
- **Anti-pattern learning:** If the same bug class appears in 2+ sessions, `cm`
  promotes it to an auto-warning that fires when a future agent touches the relevant
  code path.
- **Decay model:** Knowledge entries decay over 90 days. Entries that never fire as
  warnings or get reinforced fade out. This prevents the procedural memory from
  becoming a cemetery of one-time lessons.
- **Harm weighting:** Entries associated with harmful failures (security, data loss)
  receive 4× weight — they persist longer and warn more aggressively.

`cm reflect` is optional but high-value on projects with recurring bug patterns.
Run it once per PR cycle, not more frequently.

---

### Merge Protocol

Merge to main only when:
1. All P0 findings are resolved (blocking beads closed, diff re-reviewed)
2. All P1 beads are created and in the backlog
3. CLAUDE.md is updated with P0/P1 entries
4. CM consolidation run (if `cm` available)

After merge: tag the release, update bead statuses, and confirm Agent Mail is clear of
pending messages related to this wave.

---

## Quick Reference: Phase Outputs

| Phase | Artifact | Location |
|-------|----------|----------|
| 0 Bootstrap | CLAUDE.md, AGENTS.md, .beads/ | Project root |
| 1 Brainstorm | Design doc + review CHANGELOG | `docs/plans/YYYY-MM-DD-<topic>-design.md` |
| 2 Breakdown | Verified bead set | `.beads/` (via `br`) |
| 3 Spike | Spike report + CLAUDE.md entry | `docs/spikes/YYYY-MM-DD-<bead-id>-spike.md` |
| 4 Execute | Committed code + closed beads | Feature branch → PR |
| 5 Compound | Updated CLAUDE.md + merged code | Project root + main branch |

---

## Quick Reference: Key Rules

| Rule | Phase | Detail |
|------|-------|--------|
| No code before approval | 1 | Hard gate — no exceptions |
| Spec reviewer gets file path only | 1 | Never session history |
| Max 3 review iterations | 1 | LLM bias ceiling |
| Human approval is the actual gate | 1 | Review loop is preparation, not substitute |
| Beads are self-contained | 2 | Agent reads bead + AGENTS.md + CLAUDE.md only |
| Polishing stops at convergence | 2 | 2–3 rounds max |
| Spike branches are isolated | 3 | Never merge spike code |
| Success criteria are machine-verifiable | 3 | Not "works well" — specific assertions |
| 2-hour spike time-box | 3 | Escalate, do not overrun silently |
| CLAUDE.md always updated after spike | 3 | Validated approach or anti-pattern |
| Session starts with AGENTS.md | 4 | Full read, every session |
| One commit per bead | 4 | `[bead-<id>]` format |
| Completion promise is a hard exit gate | 4 | All 4 conditions before next bead |
| Exactly 5 reviewers | 5 | Not 14 — focused &gt; broad |
| P0 blocks merge | 5 | Creates bead, re-review required |
| CLAUDE.md entries must be dated | 5 | Undated entries become phantom rules |
