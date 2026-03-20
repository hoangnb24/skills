# Spike Report Template

<!-- INSTRUCTIONS FOR FILLING AGENT
This is the Phase 3 (Spike) output artifact.
- Save completed reports to: docs/spikes/YYYY-MM-DD-<bead-id>-spike.md
- A spike report MUST be completed before the spike branch is archived.
- The completion promise requires: all success criteria evaluated, at least one alternative considered, and edge cases documented.
- After completing this report:
  1. Update the source bead's `design` field with the validated approach (or STOP verdict).
  2. Update CLAUDE.md (Validated Approaches or Anti-Patterns, as appropriate).
  3. Archive the spike branch: git tag archive/spike/<bead-id> && git branch -d spike/<bead-id>-<slug>
- Time-box: maximum 2 hours. If unresolved at 2 hours, complete this report with a CONDITIONAL GO or STOP verdict and escalate.
-->

---

# Spike Report: <Brief Description>

**Bead ID**: <!-- FILL: e.g., b007 -->
**Branch**: <!-- FILL: e.g., spike/b007-pdf-generation -->
**Date**: <!-- FILL: YYYY-MM-DD -->
**Author**: <!-- FILL: agent session ID or human name -->
**Time spent**: <!-- FILL: e.g., 1h 20min (within 2hr time-box) -->

---

## Bead Description

<!-- FILL: Copy the `description` field from the source bead verbatim. This report must be self-contained. -->

---

## Success Criteria

<!-- FILL: List the machine-verifiable assertions defined at the start of the spike. For each, record the outcome.

| # | Criterion | Outcome | Evidence |
|---|-----------|---------|---------|
| 1 | [What must be true for the approach to be validated] | ✅ PASS / ❌ FAIL / ⚠️ PARTIAL | [Test output, log line, measurement, or code reference] |
| 2 | ... | | |

All criteria must be evaluated. A PASS verdict requires all criteria to pass or have a documented acceptable exception.
-->

---

## Approach Validated (or Rejected)

<!-- FILL: Describe the approach that was tested. Be specific enough that an agent unfamiliar with the spike can implement it without re-investigating.

### What was built
[Describe the minimal proof-of-concept: what was written, what was configured, what was called.]

### Result
[Did it work? What were the key findings — performance characteristics, API behavior, constraints discovered, gotchas?]

### Reproducibility
[Can another agent follow these steps and get the same result? List the exact commands, config, or code snippets that confirmed the approach.]

```
# Example: exact commands that validated the approach
<command or code>
```
-->

---

## Alternative Approaches Considered

<!-- FILL: At least one alternative must be documented. This is required by the completion promise.

| Alternative | Why Not Chosen |
|-------------|---------------|
| [Alternative approach name] | [Trade-off or disqualifying characteristic] |
| [Alternative approach name] | [Trade-off or disqualifying characteristic] |

If an alternative was tested, note its results here. If it was rejected on paper, explain the reasoning.
-->

---

## Edge Cases Discovered

<!-- FILL: What boundary conditions, failure modes, or surprising behaviors were found during the spike?
These become candidates for bead `notes` fields and CLAUDE.md anti-patterns.

- [Edge case 1]: [description and how it should be handled]
- [Edge case 2]: [description and how it should be handled]

If no edge cases were found, write: "No edge cases discovered. Coverage: [describe what was tested]."
-->

---

## Recommendation

<!-- FILL: Choose exactly one verdict. Delete the other two. Complete the relevant sub-section. -->

---

### ✅ GO — All criteria met. Proceed to Phase 4 execution.

<!-- COMPLETE THIS SECTION for GO verdict:

**Validated approach summary** (1-3 sentences for the bead's design field):
[Concise statement of what to use and how, suitable for copy-pasting into the bead's design field.]

**CLAUDE.md update — Validated Approaches**:
```
[YYYY-MM-DD] For <problem domain>: use <approach>. <Key constraint or gotcha>. Validated in: spike/<bead-id>.
```
-->

---

### ⚠️ CONDITIONAL GO — Partially met. Proceed with conditions.

<!-- COMPLETE THIS SECTION for CONDITIONAL GO verdict:

**What passed**: [List the criteria that passed.]

**What did not pass**: [List the criteria that partially passed or were inconclusive.]

**Conditions for proceeding**:
[What must happen before Phase 4 can begin? New blocking beads? Human decision required?]

**New blocking beads to create**:
| Bead Description | Blocks | Risk Level |
|-----------------|--------|-----------|
| [What must be done first] | [bead-id of the blocked bead] | Medium / High |

**Human decision required**:
<!-- Describe what the human needs to decide. Provide context and trade-offs. -->
-->

---

### ❌ STOP — Approach invalidated. Do not proceed with this approach.

<!-- COMPLETE THIS SECTION for STOP verdict:

**Why the approach fails**:
[Precise description of the disqualifying finding. Be specific — future agents will read this.]

**CLAUDE.md update — Anti-Patterns**:
```
[YYYY-MM-DD] Do NOT use <approach> for <problem domain> — <consequence>. Confirmed in: spike/<bead-id>.
```

**Recommended next step**:
[Should the team brainstorm an alternative approach? Run a new spike on the best alternative? Descope the feature? Escalate to human?]
-->
