# Adaptive Mode Reference

Task scale detection, skip logic, agent mode selection, and time-boxing rules.

---

## Scale Definitions

| Scale | Duration | Description |
|-------|----------|-------------|
| **Tiny** | < 30 min | Single-file, obvious fix with no unknowns. Typical: typo fix, single config change, trivial UI tweak. |
| **Small** | 30 min – 2 hr | Clear scope, no unknowns, limited file surface. Typical: well-understood feature addition, refactor with defined boundaries. |
| **Medium** | 2 – 8 hr | Multiple components, 1–2 unknowns. Typical: new API endpoint + UI + tests, integration with a known external service. |
| **Large** | > 8 hr | Multiple epics, significant unknowns, cross-system impact. Typical: new subsystem, major refactor, multi-service integration. |
| **Spike-only** | Up to 2 hr | Pure technical investigation — no production code delivered. Used when a question must be answered before planning can proceed. |

---

## Signal Detection

The agent evaluates scale by examining three signals. All three must be assessed before choosing a scale.

### Signal 1: Files Touched (estimated)

| Files | Indicator |
|-------|-----------|
| 1–3 | Tiny or Small |
| 4–10 | Small or Medium |
| 11–30 | Medium or Large |
| 30+ | Large |

How to estimate: scan the request for component names, layers affected (API, DB, UI, tests), and cross-cutting concerns (auth, logging, migrations).

### Signal 2: Number of Unknowns

An **unknown** is any question where the answer requires investigation before implementation can begin (unfamiliar library API, unclear data model, untested integration path, performance characteristics not established).

| Unknowns | Indicator |
|----------|-----------|
| 0 | Tiny or Small |
| 1–2 | Medium |
| 3+ | Large (or Spike-only before proceeding) |

### Signal 3: Cross-System Dependencies

| Dependencies | Indicator |
|--------------|-----------|
| None (self-contained) | Tiny or Small |
| One external system or service | Medium |
| Two or more external systems, or shared data schemas | Large |

### Combined Signal Resolution

When signals conflict (e.g., few files but multiple unknowns), **escalate to the higher scale**. Never downgrade scale based on optimism. Document the signals used in the first message of the session.

---

## Phase Skip Table

| Scale | Phase 0 Bootstrap | Phase 1 Brainstorm | Phase 2 Breakdown | Phase 3 Spike | Phase 4 Execute | Phase 5 Compound |
|-------|:-----------------:|:------------------:|:-----------------:|:-------------:|:---------------:|:----------------:|
| **Tiny** | Skip (if project exists) | Skip | Skip | Skip | ✅ | Skip |
| **Small** | Skip (if project exists) | ✅ | ✅ | Skip | ✅ | ✅ (lightweight) |
| **Medium** | ✅ (if new project) | ✅ | ✅ | ✅ (risky beads) | ✅ | ✅ |
| **Large** | ✅ | ✅ | ✅ | ✅ (all risky beads) | ✅ | ✅ |
| **Spike-only** | Skip | Skip | Skip | ✅ | Skip | Skip |

**Notes:**
- Phase 0 runs once per project, never again. If `CLAUDE.md` and `AGENTS.md` exist, skip.
- Phase 3 (Spike) runs only for beads with risk level MEDIUM or HIGH, or for any technology not yet validated in `CLAUDE.md`.
- Phase 5 (Compound) for Small tasks: capture patterns and update `CLAUDE.md`, but skip the full sub-agent review panel. A single self-review pass suffices.

---

## Agent Mode

| Scale | Mode | Description |
|-------|------|-------------|
| **Tiny** | Single | One Claude Code session, no sub-agents. |
| **Small** | Single | One Claude Code session. Optional: dispatch spec-reviewer sub-agent in Phase 1. |
| **Medium** | Single + sub-agents | One primary session. Sub-agents dispatched for spec review (Phase 1) and compound review (Phase 5). |
| **Large** | Multi-session swarm | 2–5 Claude Code sessions coordinated via Agent Mail. Human acts as "clockwork deity" monitoring progress. |
| **Spike-only** | Single | One session, isolated branch. |

### Multi-Session Swarm Rules

- Each session registers at startup via `am macro_start_session`.
- Sessions claim a **track** — a logical group of related beads (e.g., "backend API", "frontend components", "database migrations").
- No two sessions claim the same track without explicit Agent Mail coordination.
- Sessions use `am file_reservation_paths([...])` before touching any file.
- Sessions poll Agent Mail after completing each bead: `am check_mail`.

---

## Scale Escalation

When a session discovers mid-execution that the task is larger than initially assessed, it must escalate rather than silently expand scope.

### Trigger Conditions

- An unexpected unknown surfaces that blocks a bead (e.g., an API does not work as documented).
- The number of files to be touched is more than double the initial estimate.
- A new cross-system dependency is discovered that was not in the design doc.
- A spike exceeds its 2-hour time-box without a clear path to resolution.

### Escalation Protocol

1. **Stop current work** — do not implement beyond the current bead boundary.
2. **Document the finding** — write a short "escalation note" in the bead's `notes` field:
   ```
   ESCALATION: Discovered [X]. Original estimate was [Y]. Revised estimate: [Z scale].
   Blocking question: [what needs to be answered before proceeding].
   ```
3. **Send Agent Mail** (if multi-session): `am send --to human --subject "Scale escalation on bead <id>"`.
4. **Surface to human** — present the finding clearly and ask for a decision:
   - Continue with revised scope (upgrade to next scale, run missing phases)
   - Descope (narrow the feature to fit the original estimate)
   - Spike first (run Phase 3 before resuming Phase 4)
5. **Do not proceed** until human approves the revised plan.

### Common Escalation: Small → Medium

The most frequent escalation. Triggers when a "clear scope" task reveals an unknown:

- The human approved the design, but a third-party API behaves differently than documented.
- A refactor requires touching a shared utility used by other systems.
- Test coverage for the changed code does not exist and must be written.

**Response**: Pause Phase 4, run a targeted Phase 3 spike (≤ 2 hours) for the specific unknown, then resume.

---

## Time-Boxing

Hard limits that override all other considerations. The agent does not negotiate these.

| Activity | Time Limit | Action on Expiry |
|----------|------------|------------------|
| Spike (Phase 3) | 2 hours | Stop, write CONDITIONAL GO or STOP report, escalate to human |
| Single bead (Phase 4) | 90 minutes | Commit progress, document blocker in bead notes, escalate |
| Full Phase 1 brainstorm | 45 minutes | Deliver best-effort design doc, flag open questions for human |
| Spec-review iteration | 20 minutes per round | Accept output as-is, proceed to next round or cap at 3 rounds |
| Context recovery | 10 minutes | If recovery fails, escalate to human |

### When to Escalate vs. Self-Resolve

| Situation | Self-resolve? | Escalate? |
|-----------|:-------------:|:---------:|
| Unknown answered by reading docs/code | ✅ | — |
| Unknown requires running a test/spike | ✅ (within time-box) | — |
| Spike exceeds time-box | — | ✅ |
| Design decision with clear trade-offs | ✅ (document choice) | — |
| Design decision with business/product implications | — | ✅ |
| Build failure with clear root cause | ✅ | — |
| Build failure unresolved after 30 min | — | ✅ |
| Merge conflict in single-agent mode | ✅ | — |
| Merge conflict in multi-session mode | — | ✅ (coordinate via AM) |

---

## Quick Reference: Choosing a Scale

```
Step 1: Count estimated files touched.
Step 2: Count unknowns (questions requiring investigation).
Step 3: Count cross-system dependencies.
Step 4: Take the HIGHEST scale suggested by any signal.
Step 5: Check if Bootstrap (Phase 0) is needed (first time project runs Forge).
Step 6: Apply skip table to determine active phases.
Step 7: Choose agent mode.
Step 8: Document chosen scale + signals in session opening.
```
