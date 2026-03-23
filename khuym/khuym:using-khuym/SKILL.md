---
name: khuym:using-khuym
description: Bootstrap meta-skill for the khuym agentic development ecosystem. Load first on any khuym project. Lists all 9+2 skills with routing logic, go mode (full-auto pipeline with 3 human gates), quick mode for small fixes, priority rules, red flags, and state bootstrap/resume. Invoke when starting a new session, choosing which skill to use, running the full pipeline end-to-end, or resuming after a handoff.
metadata:
  version: '2.0'
  ecosystem: khuym
---

# using-khuym

Bootstrap meta-skill. Load this first. It tells you which skill to invoke next and how the ecosystem chains together.

---

## Skill Catalog

| # | Skill | One-line description | Load when... |
|---|-------|----------------------|--------------|
| 1 | `khuym:using-khuym` | This file. Routing, go mode, red flags. | Starting any session |
| 2 | `khuym:exploring` | Identify gray areas, lock decisions → CONTEXT.md | Feature request is vague or new; "what exactly should this do?" |
| 3 | `khuym:planning` | Research + multi-model synthesis → beads + approach | Decisions are locked (CONTEXT.md exists); ready to research and decompose |
| 4 | `khuym:validating` | Plan-checker loop (≤3×, 8 dims) + spike execution + bead polishing | Beads exist; need to verify plan soundness before execution |
| 5 | `khuym:swarming` | Launch+tend worker pool via Agent Mail + bv | Beads are validated; ready to execute at scale |
| 6 | `khuym:executing` | Single worker loop: priority → reserve → implement bead → close → loop | Spawned by swarming; one agent, self-routing from the live graph |
| 7 | `khuym:reviewing` | 5 parallel review agents (P1/P2/P3) + artifact verification + UAT | Execution complete; need quality gate before merge |
| 8 | `khuym:compounding` | Capture learnings → history/learnings/ → critical-patterns.md | Feature shipped; extract patterns/decisions/failures for future runs |
| 9 | `khuym:writing-khuym-skills` | TDD-for-skills: RED-GREEN-REFACTOR + persuasion psychology | Improving or creating khuym skills themselves |
| 10 | `khuym:debugging` | Root-cause analysis for blocked beads and execution failures | Agent stuck, bead blocked, unexpected error |
| 11 | `khuym:gkg` | Codebase intelligence via gkg (repo map, dependency graph) | Need deep codebase understanding before planning |

---

## Routing Logic

Given a user request, determine which skill to invoke first:

| Request type | First skill | Notes |
|---|---|---|
| Vague/new feature ("build X") | `khuym:exploring` | Always start here if gray areas exist |
| Research task ("investigate Y") | `khuym:planning` | Skip exploring only if scope is fully clear |
| "Just fix this" / small change | `khuym:planning` (lightweight) | Single bead; skip exploring |
| "Review my code" | `khuym:reviewing` | Load directly |
| "What did we learn?" / "Capture learnings" | `khuym:compounding` | Load directly |
| "Improve khuym itself" | `khuym:writing-khuym-skills` | Load directly |
| Agent stuck / error | `khuym:debugging` | Load directly |
| "Run the full pipeline" / `/go` | Go Mode (below) | Chain all skills |
| Resuming a session | Resume Logic (below) | Check HANDOFF.json first |

**When in doubt: invoke `khuym:exploring` first.** The cost of over-exploring is low; the cost of executing a misunderstood feature is high.

---

## State Bootstrap

On every session start, before doing anything else:

```
1. Check for .khuym/ directory in project root
   → If missing: mkdir -p .khuym/ and create defaults below
   
2. Check .khuym/STATE.md
   → If missing: create with template:
     # STATE
     focus: (none)
     phase: idle
     last_updated: <date>
   
3. Check .khuym/HANDOFF.json
   → If exists → go to Resume Logic below
   → If missing → proceed normally
   
4. Check .khuym/config.json
   → If missing: create {} (all features enabled by default — absent=enabled)
   
5. Check for history/learnings/critical-patterns.md
   → If exists: read it now. These are mandatory context for all subsequent skills.
```

---

## Resume Logic

If `.khuym/HANDOFF.json` exists:

```
1. Read HANDOFF.json
2. Extract: { phase, skill, feature, context_pct, next_action, beads_in_flight }
3. Present to user:
   "Session paused at [phase] during [feature].
    Last action: [last_action]
    Suggested: [next_action]
    Resume? (yes / no / show state)"
4. If yes → load the skill named in HANDOFF.json and continue
5. If no  → ask what to work on instead
6. Do NOT auto-resume without user confirmation
```

---

## Go Mode (Full Pipeline)

Go mode chains all skills end-to-end with exactly 3 human gates. Load `references/go-mode-pipeline.md` for the complete step-by-step sequence.

**Trigger:** User says `/go [feature]`, "run the full pipeline", or "go mode".

**The 3 gates — never skip these:**

```
GATE 1 (after exploring):
  Present history/<feature>/CONTEXT.md to user.
  Ask: "Decisions locked. Approve CONTEXT.md before planning?"
  HARD-GATE: do not invoke planning until user approves.

GATE 2 (after validating):
  Present: bead count, risk summary, spike results.
  Ask: "Beads verified. Approve execution?"
  HARD-GATE: do not invoke swarming until user approves.

GATE 3 (after reviewing):
  Present: P1 count, P2 count, P3 count.
  If P1 > 0: "P1 findings block merge. Fix before proceeding?"
  If P1 = 0: "Review complete. Approve merge?"
  HARD-GATE: do not merge or close epic until user responds.
```

**Go mode sequence:**
```
exploring → [GATE 1] → planning → validating → [GATE 2]
         → swarming (+ executing ×N) → reviewing → [GATE 3]
         → compounding → DONE
```

---

## Quick Mode (Small Fixes)

For requests classified as "small fix" (single bead, LOW risk, no gray areas):

```
planning (lightweight: single bead, no multi-model refinement)
  → validating (lightweight: skip plan-checker loop + spikes; bv check only)
  → swarming (single worker)
  → executing
  → reviewing (optional: skip if trivial)
  → compounding (only if a lesson was learned)
```

Classify as quick mode when ALL of these are true:
- Change touches ≤3 files
- No new API surface or data model changes
- Risk is clearly LOW
- No gray areas about intent

---

## Priority Rules

These override everything else:

1. **P1 review findings always block.** Never merge, never close epic, never proceed to compounding while P1 findings are open.
2. **Context budget always applies.** After each bead completion or major phase, if context >65% used: write `.khuym/HANDOFF.json` and pause. Do not continue burning context.
3. **CONTEXT.md is the source of truth.** If implementation diverges from a locked decision in CONTEXT.md, stop and surface the conflict before proceeding.
4. **GATE 2 is the most critical gate.** Execution is irreversible. If there is any doubt about the plan's soundness, do not approve. Loop back to validating.
5. **Spike failures halt the pipeline.** A failed spike means the approach is broken. Do not proceed to swarming; return to planning.
6. **Never skip validating.** Not for small features. Not for "obvious" plans. Skipping validating is the #1 cause of wasted execution work. (GSD: "Plans are not executed until they pass verification.")
7. **critical-patterns.md is mandatory context.** If it exists, read it before planning or executing anything. Teams report that ignoring past critical patterns is the #1 source of repeat failures.

---

## Red Flags

Watch for these violations. Pause and surface them immediately when detected:

**Skipping phases:**
- Agent jumps from exploring → swarming (skipped planning + validating)
- Agent starts writing code before CONTEXT.md exists
- Agent skips validating because "the plan looks fine"

**Context violations:**
- Downstream agent ignores a locked decision in CONTEXT.md
- Bead description contradicts the approach in approach.md
- Implementation diverges from locked decisions without surfacing conflict

**Execution violations:**
- Files reserved but never released (Agent Mail reservation leak)
- Bead closed as "done" without the acceptance criteria actually verified
- Agent commits code without a bead ID in the commit message

**Quality violations:**
- P1 finding present but pipeline continues to merge
- `br close` called on a bead with placeholder/stub implementation
- Review skipped because "it's a small change"

**State violations:**
- Context >65% but no HANDOFF.json written
- Session resumed without reading HANDOFF.json
- STATE.md not updated after a phase transition

---

## File Quick Reference

```
.khuym/
  STATE.md          ← Current phase, focus, blockers (update at every phase transition)
  config.json       ← Feature toggles (absent=enabled)
  HANDOFF.json      ← Session resume data (write when pausing)

history/<feature>/
  CONTEXT.md        ← Locked decisions from exploring (source of truth)
  discovery.md      ← Research findings from planning
  approach.md       ← Synthesis + risk map from planning

history/learnings/
  critical-patterns.md      ← Promoted critical learnings (read always)
  YYYYMMDD-<slug>.md        ← Individual learning entries

.beads/             ← Bead files (managed by br)
.spikes/            ← Spike verification results
.worktrees/         ← Git worktrees for parallel execution
```

---

## Chaining Contract

Each skill reads from upstream artifacts and writes for downstream:

| Skill | Reads | Writes |
|-------|-------|--------|
| exploring | (user conversation) | history/\<feature>/CONTEXT.md |
| planning | CONTEXT.md, critical-patterns.md | discovery.md, approach.md, .beads/* |
| validating | .beads/*, approach.md, CONTEXT.md | validated beads, .spikes/ results |
| swarming | validated beads, STATE.md | Agent Mail threads, HANDOFF.json, updated STATE.md |
| executing | bead file, Agent Mail, CONTEXT.md | implementation commits, br close |
| reviewing | diff, CONTEXT.md, approach.md, beads | P1/P2/P3 findings |
| compounding | review findings, full feature history | history/learnings/YYYYMMDD-\<slug>.md, critical-patterns.md |

**Handoff phrase pattern:** Every skill ends with an explicit handoff:
`"[Outcome]. Invoke [next-skill] skill."`
