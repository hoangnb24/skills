---
name: khuym:reviewing
description: Post-execution quality verification skill for the khuym ecosystem. Invoke after swarming completes. Runs 5 parallel specialist review agents, 3-level artifact verification, human UAT, and finishing (PR, cleanup, epic close). Review issues become beads instead of per-finding markdown files; P1 still blocks merge while P2/P3 become non-blocking follow-up beads. Absorbs finishing responsibilities and hands off to compounding.
metadata:
  version: '1.0'
  ecosystem: khuym
  position: 7-of-9
  upstream: swarming
  downstream: compounding
---

# Reviewing

If `.khuym/onboarding.json` is missing or stale for the current repo, stop and invoke `khuym:using-khuym` before continuing.

Post-execution quality verification. You are the last automated gate before a feature ships. Your job is to catch what escaped execution — not just confirm tasks are closed, but verify that the work is **correct, safe, and complete**.

Research confirms this is not optional: removing the verification agent degrades fix precision most sharply ([Multi-Agent Bug Detection, IJRASET 2025](https://ieeexplore.ieee.org/document/11135756/)). Multi-perspective review covers 7.8 dimensions vs. 1–3 for a single reviewer ([Hydra-Reviewer, IEEE TSE 2025](https://ieeexplore.ieee.org/document/11203269/)).

## When to Invoke

- After `khuym:swarming` reports "All beads closed"
- Manually: when spot-checking any branch or set of changes
- Flags: `--serial` (always serial), `--skip-uat` (auto mode only, skips Phase 3)

## Prerequisites

Read before starting:
- `history/<feature>/CONTEXT.md` — locked decisions (D1, D2...) and testable deliverables
- `history/<feature>/approach.md` — planned approach and risk map from planning
- `.khuym/STATE.md` — current epic state

## Phase 1: Automated Review (5 Specialist Agents)

### Dispatch Rules

| Condition | Mode |
|-----------|------|
| ≤4 agents active | **Parallel** (default) |
| 5+ agents active | **Serial** (auto-switch — inform user) |
| `--serial` flag | Always serial |

With 5 agents, **auto-switch to serial mode** and tell the user: "Running review agents in serial mode (5 agents). Use --parallel to override."

### Agent Roster

Dispatch agents 1–4 first (parallel or serial per rules above). Agent 5 **always runs last** regardless of mode.

| Agent | Focus |
|-------|-------|
| 1 `code-quality` | Simplicity, readability, DRY, error handling, type safety |
| 2 `architecture` | Design patterns, coupling, separation of concerns, API design |
| 3 `security` | OWASP top 10, injection, auth, secrets, data exposure |
| 4 `test-coverage` | Missing tests, edge cases, integration gaps |
| 5 `learnings-synthesizer` | **Always last** — cross-reference `history/learnings/`, flag known patterns, suggest compounding entries |

### Isolated Context Per Agent — CRITICAL

Each agent receives **only**:
1. The git diff (or worktree diff): `git diff <base>..<head>`
2. `history/<feature>/CONTEXT.md`
3. `history/<feature>/approach.md`

Do **not** pass session history, implementation notes, or agent communication logs. Reviewer objectivity depends on seeing only the work product, not the implementer's thought process ([Superpowers code-reviewer pattern](https://raw.githubusercontent.com/obra/superpowers/main/skills/requesting-code-review/SKILL.md)).

See `references/review-agent-prompts.md` for the exact prompt for each agent.

### Review Beads

Each distinct review issue becomes a bead. Per-finding markdown files are no longer the primary review artifact.

Use the bead contract from `references/review-bead-template.md`.

**Creation rules:**

- **P1** → create a blocking fix bead on the current review / epic-close path
- **P2** → create a non-blocking follow-up bead
- **P3** → create a non-blocking follow-up bead

**Non-negotiable linkage rules:**

- `P1` review beads may stay in the current epic-close path because they are blocking work
- `P2` / `P3` review beads must **not** be children of the current epic
- `P2` / `P3` traceability must use `external_ref=<source-epic-id>` plus labels such as `review`, `review-p2` / `review-p3`, and the source reviewer label

**Title pattern:**

```
Resolve Review P1: <problem title>
Resolve Review P2: <problem title>
Resolve Review P3: <problem title>
```

The full review write-up lives in the bead body itself: problem statement, evidence, proposed solutions, and acceptance criteria.

### Severity Rules

| Priority | Label | Criteria | Gate |
|----------|-------|----------|------|
| **P1** | CRITICAL | Security vulns, data corruption, breaking changes | **Blocks merge — always** |
| **P2** | IMPORTANT | Performance, architecture, reliability | Should fix before merge |
| **P3** | NICE-TO-HAVE | Minor improvements, cleanup, docs | Record for future |

**Calibration rule:** Not everything is P1. Severity inflation wastes cycles and trains reviewers to ignore findings. When in doubt, P2.

### Synthesis (After All Agents Complete)

1. Collect the review beads created by agents 1-4
2. Deduplicate overlapping issues
   - prefer one surviving review bead per distinct problem
   - close redundant duplicates with a reason such as `Duplicate of <bead-id>`
3. Surface `learnings-synthesizer` matches with known-pattern notes on the relevant review bead
4. Count: N P1, N P2, N P3 review beads
5. Present a summary table to user with bead IDs by severity

**If P1 review beads exist:** HARD-GATE — stop and present. Do not proceed to Phase 2 until user acknowledges. Even in go mode, P1 is always human-gated.

## Phase 2: 3-Level Artifact Verification

Goal-backward check on every artifact named in `CONTEXT.md` and `approach.md`. Task completion ≠ goal achievement — a file existing is not evidence the feature works.

Run this as a subagent with isolated context (diff + CONTEXT.md + approach.md). Use the live bead graph and bead files when you need to verify acceptance criteria coverage.

### The 3 Levels

**Level 1 — EXISTS:** Does the file/component/route exist?
```bash
# Check example
ls src/components/PaymentForm.tsx
```

**Level 2 — SUBSTANTIVE:** Is it real, not a stub?

Scan for anti-patterns:
```
return null / return {} / return []
Empty handlers: onClick={() => {}}
TODO / FIXME / PLACEHOLDER comments
console.log-only implementations
API routes returning static data without DB queries
Components with state that never renders state
```

**Level 3 — WIRED:** Is it imported and used in the integration layer?
```bash
# Check example
grep -r "PaymentForm" src/pages/ src/app/
```

### Reporting

For each artifact:
- ✅ L1+L2+L3: fully wired
- ⚠️ L1+L2 only: created but not integrated — create a `P2` review bead
- 🛑 L1 only (stub): exists but empty — create a `P1` review bead
- 🛑 Missing: not found — create a `P1` review bead

## Phase 3: Human UAT

**Scope:** Walk the user through every testable deliverable from `CONTEXT.md`.

**Protocol:**
1. Extract all decisions with `SEE` (visual), `CALL` (API), or `RUN` (execution) verification from CONTEXT.md
2. For each deliverable, present: "Does [X] work as decided in [D-id]?"
3. Reference the exact decision ID so the user can verify against their original intent
4. One item at a time — HARD-GATE between each

**Example prompt:**
```
UAT Item 3 of 5 — Decision D4:
"Users can reset their password via email link (D4)."
Can you navigate to /forgot-password, enter an email, and confirm the reset email arrives?
[Pass / Fail / Skip]
```

**On failure:**
1. Invoke `khuym:debugging` skill → root-cause the failure
2. Create a fix bead: `br create "Fix: <description>" -t task -p 0 --parent <epic-id>`
3. Execute the fix bead (invoke `khuym:executing` skill)
4. Re-verify the specific UAT item
5. Do not proceed until the item passes or user explicitly accepts the failure

**On skip:** Record in `.khuym/STATE.md` with reason. Do not count as pass.

## Phase 4: Finishing

You are the last step before compounding. Close the loop completely.

### Checklist

```
[ ] All beads in epic are closed
    → bv --robot-triage --graph-root <epic-id>
    → Any open beads? Create final fix tasks or explicitly defer with br update --defer

[ ] Final build/test/lint passes
    → Run project's standard commands (npm test / pytest / cargo test / etc.)
    → If fails: create a `P1` review bead, fix before continuing

[ ] Present merge options to user:
    1. Create PR (recommended)
    2. Merge directly
    3. Keep branch for further work
    4. Discard branch

[ ] Clean up worktree (if used)
    → git worktree remove .worktrees/<feature>

[ ] Close epic bead
    → br close <epic-id> --reason "Feature complete: <summary>"

[ ] Clear working state
    → Archive STATE.md: cp .khuym/STATE.md history/<feature>/STATE-final.md
    → Clear: echo "" > .khuym/STATE.md
```

### Merge Options Detail

**Create PR:**
```bash
gh pr create \
  --title "<feature title>" \
  --body "## Summary\n<description>\n\n## Verified\n- [ ] All UAT items passed\n- [ ] No P1 review beads remain open\n- P2 follow-up beads: <list or 'none'>\n- P3 follow-up beads: <list or 'none'>\n\n## Review Follow-up\n- Blocking review beads: <list or 'none'>\n- Non-blocking review beads: <list or 'none'>" \
  --draft  # remove if ready for immediate merge
```

**If P2 review beads exist:** Include them in the PR body. Recommend fixing before merge, but user decides.

**If P3 review beads exist:** Add them to the PR body under "Future Work." Do not block merge.

## Handoff

After Phase 4 completes:

> "Feature complete. Epic [id] closed. [N] learnings flagged by learnings-synthesizer.
> Invoke `khuym:compounding` skill to capture patterns, decisions, and failures for future planning cycles."

Update `.khuym/STATE.md`:
```
STATUS: reviewing-complete
EPIC: <id>
HANDOFF: compounding
FLAGGED_LEARNINGS: <count> (see .khuym/findings/learnings-candidates.md)
```

## Red Flags

Stop and surface to user immediately if you see:

- **P1 findings and no user acknowledgment** — never silently continue past P1
- **P1 review beads created but gate not stopped** — invalid; P1 still blocks
- **UAT failures marked as "pass"** — do not log a skip as a pass
- **Artifact verification skipped** — Phase 2 is not optional; stubs ship to production this way
- **Epic closed with open beads** — verify with `bv` before closing
- **`learnings-synthesizer` flagging a known failure pattern** — this means the team already hit this problem. Surface explicitly: "Known pattern from [date]: [link]"
- **Agent 5 running before agents 1–4 complete** — synthesis without findings is meaningless; enforce ordering
- **P2/P3 review beads attached as children of the current epic** — this breaks the non-blocking contract; use `external_ref` + labels instead

## Files Written

```
.khuym/findings/
  learnings-candidates.md              ← Session-level compounding suggestions only
history/<feature>/
  STATE-final.md                       ← Archived state at close
```

## References

- `references/review-agent-prompts.md` — Exact prompts for all 5 agents (load when dispatching)
- `references/review-bead-template.md` — Review bead format and creation contract
- `references/finding-template.md` — Deprecation pointer for the retired file-based finding contract
