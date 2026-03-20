# v2 Architecture: Boundary Audit & Corrections

**Date:** 2026-03-20
**Purpose:** Identify and fix skill boundary overlaps/mismatches before building

---

## Boundary Issues Found

### Issue 1: `planning` overlaps with `exploring` on research

**v2 says:** exploring "Does NOT research external patterns (that's planning's job)"
**v2 also says:** planning Phase 1 does "Discovery (Parallel Exploration)" with "Librarian/exa → External patterns"

**But GSD says:** Research is a separate phase between Discuss and Plan. GSD has 4 parallel researchers (stack, features, architecture, pitfalls) that run AFTER discuss but BEFORE the planner writes the plan.

**The mismatch:** v2 crams both research AND plan creation into `planning`. This makes planning do too much — it's really "research + synthesize + decompose + track-plan" all in one skill. GSD deliberately separates research from planning because research informs the plan; they're sequential, not the same activity.

**Fix:** planning should stay as-is (research + synthesis + beads is a natural unit — GSD separates them as phases within one command `/gsd:plan-phase N`, not as separate commands). The issue is actually that `exploring` claims "Does NOT research" too aggressively. Exploring does light codebase scouting (grep for patterns). That's fine. The real boundary: exploring = human-facing decisions, planning = technical research + decomposition.

### Issue 2: `validating` Phase 3 (Bead Polishing) overlaps with `planning` Phase 4 (Decomposition)

**v2 says:** planning Phase 4 creates beads via `bd create`, planning Phase 5 runs `bv --robot-plan`
**v2 also says:** validating Phase 3 runs `bv --robot-suggest`, `bv --robot-insights`, `bv --robot-priority`

**The mismatch:** Who owns the beads? Planning creates them, but validating polishes them. If validating finds issues with beads, it needs to modify what planning created. This creates a back-and-forth loop between two skills that should be a clean handoff.

**In the Flywheel:** Phases 4 (Plan → Beads) and 5 (Bead Polishing) are sequential but both part of "the planning side" — they happen before launch. The separation is about fresh eyes, not different ownership.

**Fix:** Keep it as-is but clarify: planning creates beads, validating verifies AND polishes them. validating has full authority to modify beads (add dependencies, split large beads, fix scoping). The handoff is: planning produces draft beads, validating produces production-ready beads. This is analogous to GSD where the planner writes plans and the plan-checker modifies them.

### Issue 3: `swarming` vs `executing` — who handles Agent Mail coordination?

**v2 says:** swarming does "Agent Mail setup, spawn parallel workers, monitor, handle blockers"
**v2 also says:** executing does "register → bv --robot-priority → reserve files → implement"

**The mismatch:** Both skills touch Agent Mail. swarming registers as Orchestrator and monitors mail. executing registers as a worker and sends completion reports. This is actually correct — they're different roles (orchestrator vs worker), but the v2 doc doesn't make this clear enough.

**In the Flywheel:** The human is the orchestrator (tending the swarm). Agents are workers. The split is natural.

**Fix:** No structural change needed. Clarify that swarming = orchestrator role (spawns workers, monitors Agent Mail, handles escalations) and executing = worker role (registers, implements, reports back). They're designed to run in different contexts (swarming in the main session, executing in spawned subagents).

### Issue 4: `reviewing` Phase 2 (3-Level Artifact Verification) overlaps with `validating`

**v2 says:** validating Phase 1 checks "Requirement coverage — does every CONTEXT.md decision map to a bead?"
**v2 also says:** reviewing Phase 2 checks "Artifact EXISTS, Artifact is SUBSTANTIVE, Artifact is WIRED"

**The mismatch:** Both skills verify that work is correct. validating checks the plan before execution. reviewing checks the work after execution. But the 3-level check in reviewing (exists → substantive → wired) is a GSD post-execution pattern, while the 8-dimension check in validating is a GSD pre-execution pattern.

**Actually this is correct:** validating = pre-execution verification of the PLAN. reviewing = post-execution verification of the WORK. Different inputs, different timing, different purpose. No fix needed.

### Issue 5: `compounding` learnings retrieval vs `planning` Phase 0 (Learnings Retrieval)

**v2 says:** compounding writes to `history/learnings/`
**v2 also says:** planning Phase 0 reads from `history/learnings/`

**The mismatch:** This is actually not a boundary overlap — it's correct data flow (compounding writes, planning reads). But the v2 doc doesn't mention that `exploring` should ALSO read critical-patterns.md. If exploring skips learnings, the Socratic questions won't be informed by past failures.

**Fix:** exploring Phase 0 should also read `history/learnings/critical-patterns.md` (already mentioned in v2 line 110 — "Read history/learnings/critical-patterns.md if exists"). This is fine.

### Issue 6: `reviewing` absorbing `finishing` — too many responsibilities

**v2 says:** reviewing does: 5 review agents + 3-level verification + human UAT + PR creation + cleanup + bead closing

**The problem:** This skill has 4 distinct phases, each with subagents, plus finishing responsibilities. It's the largest skill by scope. The Compound Engineering model separates review (`/ce:review`) from todo resolution (`/compound-engineering:resolve-todo-parallel`) from testing (`/compound-engineering:test-browser`).

**Fix:** Keep as-is for v1. If reviewing becomes too large during implementation, split out the finishing responsibilities into the `using-khuym` go-mode pipeline instead of a separate skill. But don't split prematurely — GSD also combines verification + human UAT in one command (`/gsd:verify-work`).

### Issue 7: `writing-khuym-skills` is disconnected from the main chain

**v2 architecture:** The main chain is exploring → planning → validating → swarming → executing → reviewing → compounding. writing-khuym-skills sits outside this chain entirely.

**This is correct by design:** writing-khuym-skills is a meta-skill for creating new khuym skills using TDD methodology. It's not part of the feature development workflow — it's for ecosystem development. No fix needed.

---

## Summary: What Actually Needs Fixing

| Issue | Severity | Fix |
|-------|----------|-----|
| planning does too much (research + synthesis + beads + track-plan) | Low | Keep as-is — GSD also bundles these in one phase. Add clearer phase descriptions. |
| validating modifies beads created by planning | Medium | Clarify: planning = draft beads, validating = production beads. validating has authority to modify. |
| swarming vs executing Agent Mail roles unclear | Medium | Clarify: swarming = orchestrator, executing = worker. Different process contexts. |
| reviewing has too many responsibilities | Low | Keep for v1, monitor during implementation. |
| Naming: "Phase 0/1/2/3" numbering inconsistent across skills | Low | Standardize phase numbering in final architecture. |

## Conclusion

The boundary issues are primarily **documentation clarity problems**, not structural design problems. The skill boundaries are actually sound — the v2 architecture correctly maps:
- GSD discuss → exploring
- GSD research + plan → planning  
- GSD plan-checker + Flywheel bead polishing → validating
- Flywheel launch + tend → swarming
- Flywheel per-agent loop → executing
- CE review + GSD verify → reviewing
- CE compound → compounding

The main fix needed: clearer ownership statements in each skill about what it owns, what it reads from upstream, and what it hands off downstream.
