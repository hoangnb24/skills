# Compound Review Template

<!-- INSTRUCTIONS FOR FILLING AGENT
This is the Phase 5 (Compound) output artifact.
- One compound review per PR (or per wave, if multiple PRs are batched).
- The orchestrating agent completes the PR Summary and dispatches reviewer sub-agents.
- Each sub-agent reads ONLY the diff + its specialization context (listed below). Never pass session history.
- Reviewer sub-agents fill their respective "Reviewer Findings" sub-sections.
- The orchestrating agent completes the CLAUDE.md Updates section after all reviewers report.
- P0 findings block merge and create new beads. P1 creates tech-debt beads. P2 is recorded only.
- If cm is available, run `cm reflect` after completing this review to distill into procedural memory.
-->

---

# Compound Review: <PR or Wave Title>

**PR / Branch**: <!-- FILL: e.g., feature/invoice-pdf-generation -->
**Beads covered**: <!-- FILL: e.g., b007, b008, b009 -->
**Date**: <!-- FILL: YYYY-MM-DD -->
**Orchestrator**: <!-- FILL: agent session ID or human name -->
**Review status**: <!-- FILL: IN-PROGRESS / COMPLETE / BLOCKED -->

---

## PR Summary

<!-- FILL: 3-5 sentences describing what this PR delivers.
Include:
- What feature or fix was implemented
- Which beads / acceptance criteria are covered
- Any notable implementation choices or deviations from the design doc
- What is NOT included (intentional descope or future work)
-->

---

## Patterns Discovered

<!-- FILL (after all reviewers report): New reusable approaches identified in this PR.
These are approaches worth repeating in future work.

Format:
### Pattern: <Name>

**What it is**: [One-sentence description.]

**When to use**: [The context or problem this pattern solves.]

**Code example** (from this PR):
```<language>
// Reference code from the diff that demonstrates the pattern
```

**Source**: [File path + line range, or bead ID]

---

Add one "### Pattern:" block per discovered pattern. If none, write: "No new patterns identified."
-->

---

## Decisions Made

<!-- FILL: Choices made during implementation that future agents should know about.
These differ from patterns — they are "why A over B" rationale, not reusable techniques.

Format:
### Decision: <What was decided>

**Rationale**: [Why this choice was made over alternatives.]
**Trade-offs accepted**: [What was given up or deferred.]
**Bead / context**: [Where this decision was made.]

---

Add one "### Decision:" block per significant decision. If decisions were already captured in CLAUDE.md during Phase 2, reference them rather than duplicating.
-->

---

## Failures Encountered

<!-- FILL: Problems that occurred during implementation, with root cause analysis.
These become Anti-Pattern candidates for CLAUDE.md.

Format:
### Failure: <Short title>

**What happened**: [Description of the failure — bug, wrong approach, unexpected behavior.]
**Root cause**: [The underlying reason this happened.]
**How it was fixed**: [What change resolved it.]
**Prevention**: [What practice or check would prevent this in future? Candidate for Anti-Patterns or Conventions.]
**Severity at discovery**: [P0 / P1 / P2]

---

Add one "### Failure:" block per notable failure. If none, write: "No notable failures during implementation."
-->

---

## Reviewer Findings

<!-- Each sub-section is filled by the corresponding reviewer sub-agent.
Reviewer sub-agents receive: the git diff + their specialization instructions.
They do NOT receive the session history or other reviewers' findings.
-->

### Security Sentinel

<!-- REVIEWER INSTRUCTIONS: Examine the diff for auth flaws, injection vulnerabilities,
secrets in code, insecure dependencies, missing input validation, and improper error
message exposure (leaking internal details). Focus on what the code DOES, not style.
-->

<!-- FILL: List findings using the format below. If none, write "No security findings." -->

**Findings:**

| Priority | Finding | File / Line | Recommendation |
|----------|---------|-------------|---------------|
| <!-- P0/P1/P2 --> | <!-- Description --> | <!-- path:line --> | <!-- Fix or monitor --> |

---

### Performance Oracle

<!-- REVIEWER INSTRUCTIONS: Examine the diff for N+1 queries, missing database indexes,
blocking I/O in hot paths, unnecessary recomputation, unbounded loops, large allocations,
and missing caching for expensive operations.
-->

<!-- FILL: List findings using the format below. If none, write "No performance findings." -->

**Findings:**

| Priority | Finding | File / Line | Recommendation |
|----------|---------|-------------|---------------|
| <!-- P0/P1/P2 --> | <!-- Description --> | <!-- path:line --> | <!-- Fix or monitor --> |

---

### Architecture Strategist

<!-- REVIEWER INSTRUCTIONS: Examine the diff for boundary violations (does code in layer X
call directly into layer Z, bypassing Y?), tight coupling between components, scalability
concerns, missing abstractions, and deviations from the architecture decisions in CLAUDE.md.
-->

<!-- FILL: List findings using the format below. If none, write "No architecture findings." -->

**Findings:**

| Priority | Finding | File / Line | Recommendation |
|----------|---------|-------------|---------------|
| <!-- P0/P1/P2 --> | <!-- Description --> | <!-- path:line --> | <!-- Fix or monitor --> |

---

### Simplicity Checker

<!-- REVIEWER INSTRUCTIONS: Examine the diff for YAGNI violations (code built for
anticipated future use not currently needed), over-engineering (abstractions with only
one concrete case), dead code, unnecessary configuration, and complexity that could be
replaced by a simpler equivalent.
-->

<!-- FILL: List findings using the format below. If none, write "No simplicity findings." -->

**Findings:**

| Priority | Finding | File / Line | Recommendation |
|----------|---------|-------------|---------------|
| <!-- P0/P1/P2 --> | <!-- Description --> | <!-- path:line --> | <!-- Fix or monitor --> |

---

### Spike Alignment Validator

<!-- REVIEWER INSTRUCTIONS: For each bead covered by this PR, check the bead's `design`
field (updated by the spike) and verify the implementation matches the validated approach.
Flag any deviation — whether it is an improvement (note as suggestion) or a regression
(note as P0/P1 finding).
-->

<!-- FILL: List findings using the format below. If none, write "All beads aligned with spike findings." -->

**Findings:**

| Priority | Bead ID | Deviation | Recommendation |
|----------|---------|-----------|---------------|
| <!-- P0/P1/P2 --> | <!-- bead-id --> | <!-- What differs from the spike-validated approach --> | <!-- Align or document the deviation --> |

---

## Finding Summary

<!-- FILL (by orchestrator, after all reviewers report):

| Priority | Count | Action |
|----------|-------|--------|
| P0 | <!-- N --> | Blocks merge. Create beads: [list bead descriptions or IDs once created] |
| P1 | <!-- N --> | Tech-debt beads created: [list bead IDs] |
| P2 | <!-- N --> | Recorded in CLAUDE.md only. No blocking action. |

**Merge decision**: <!-- BLOCKED (P0 findings) / APPROVED (no P0 findings) -->
-->

---

## CLAUDE.md Updates

<!-- FILL (by orchestrator): List all updates to be made to CLAUDE.md as a result of this review.
Copy-paste these entries directly into CLAUDE.md after completing this section.

### Conventions (new or updated)
```
[YYYY-MM-DD] <Convention statement>. Source: compound-review-YYYY-MM-DD.
```

### Anti-Patterns (new or updated)
```
[YYYY-MM-DD] Do NOT <action> because <consequence>. Discovered via: [P0/P1 finding in compound-review-YYYY-MM-DD].
```

### Validated Approaches (if a novel approach was confirmed working)
```
[YYYY-MM-DD] For <problem domain>: use <approach>. Confirmed in: compound-review-YYYY-MM-DD.
```

If no CLAUDE.md updates are needed, write: "No CLAUDE.md updates from this review."
-->
