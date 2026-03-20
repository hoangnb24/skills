# Creation Log: [Skill Name]

<!-- Copy this template to your skill directory as CREATION-LOG.md -->
<!-- Complete every section — this is the evidence that TDD was followed -->

## Table of Contents
1. [Source Material](#source-material)
2. [Extraction Decisions](#extraction-decisions)
3. [Structure Decisions](#structure-decisions)
4. [Bulletproofing Elements](#bulletproofing-elements)
5. [RED Phase: Baseline Testing](#red-phase-baseline-testing)
6. [GREEN Phase: Initial Skill](#green-phase-initial-skill)
7. [REFACTOR Phase: Iterations](#refactor-phase-iterations)
8. [Final Outcome](#final-outcome)

---

## Source Material

**Origin:** [Where the technique/process came from — Flywheel, GSD, Superpowers, internal, etc.]

**What the source does:** [Core behavior of the source framework, 1-3 sentences]

**Khuym context:** [Which khuym skill(s) this supports or enables]

---

## Extraction Decisions

**What to include:**
- [Item 1] — because [reason: addresses observed failure / enforces critical constraint / etc.]
- [Item 2] — because [reason]
- [Item 3] — because [reason]

**What to leave out:**
- [Item A] — [reason: project-specific, repetitive, Claude already knows this, etc.]
- [Item B] — [reason]

---

## Structure Decisions

1. [Structural decision + rationale] — e.g., "HARD-GATE before Phase 2 because baseline testing is the most commonly skipped step"
2. [Structural decision + rationale]
3. [Structural decision + rationale]

---

## Bulletproofing Elements

### Language Choices
- "[Specific phrase used]" — instead of "[softer alternative]" — because [prevents rationalization X]
- "MUST" / "NEVER" / "No exceptions" where applicable
- Implementation intention format: "When X, IMMEDIATELY do Y"

### Structural Defenses
- [Defense mechanism + what it prevents] — e.g., "Rationalization table with pre-refuted excuses prevents 'I'm being pragmatic' escape hatch"
- [Defense mechanism + what it prevents]

---

## RED Phase: Baseline Testing

<!-- Run these scenarios WITHOUT the skill loaded. Document results verbatim. -->

### Scenario 1: [Name]

**Setup:**
```
[Full scenario text — include concrete options A/B/C]
```

**Combined pressures:** [List: Time + Authority + Sunk Cost, etc.]

**Agent choice:** [Option A / B / C]

**Exact rationalization (verbatim):**
> "[Agent's exact words — quote it precisely]"

**Verdict:** FAIL / PASS

---

### Scenario 2: [Name]

**Setup:**
```
[Full scenario text]
```

**Combined pressures:** [List]

**Agent choice:** [Option]

**Exact rationalization (verbatim):**
> "[Agent's exact words]"

**Verdict:** FAIL / PASS

---

### Scenario 3: [Name]

**Setup:**
```
[Full scenario text]
```

**Combined pressures:** [List]

**Agent choice:** [Option]

**Exact rationalization (verbatim):**
> "[Agent's exact words]"

**Verdict:** FAIL / PASS

---

### RED Phase Summary

**Patterns identified:**
- [Pattern 1: e.g., "Agent consistently invoked time pressure to justify skipping"]
- [Pattern 2]

**Target rationalizations for GREEN phase:**
1. "[Exact quote 1]"
2. "[Exact quote 2]"
3. "[Exact quote 3]"

---

## GREEN Phase: Initial Skill

**First SKILL.md addressed:**
- [Which specific rationalization it targeted]
- [Which specific rationalization it targeted]

**Re-ran same scenarios WITH skill:**

| Scenario | Result | Notes |
|---|---|---|
| Scenario 1 | PASS / FAIL | [Notes if still failing] |
| Scenario 2 | PASS / FAIL | [Notes] |
| Scenario 3 | PASS / FAIL | [Notes] |

**Overall GREEN result:** All pass / Required iteration [N]

---

## REFACTOR Phase: Iterations

### Iteration 1 (if needed)

**New rationalization discovered:**
> "[Agent's exact words during GREEN testing]"

**Fix applied:**
- [What was added/changed in SKILL.md]
- [Why this addresses the specific rationalization]

**Re-test result:** PASS / required another iteration

---

### Iteration 2 (if needed)

**New rationalization discovered:**
> "[Agent's exact words]"

**Fix applied:**
- [Change description]

**Re-test result:** PASS / required another iteration

---

### Rationalization Table (Final — accumulated across all iterations)

| Excuse | Reality |
|---|---|
| "[Exact rationalization from testing]" | [Counter-framing] |
| "[Exact rationalization from testing]" | [Counter-framing] |
| "[Exact rationalization from testing]" | [Counter-framing] |

---

## Final Outcome

- ✅ Agent follows core rule under [pressure type] pressure
- ✅ Agent cites skill sections when justifying choices
- ✅ [Other passing criteria]
- ✅ `agentskills validate` passes
- ✅ SKILL.md < 400 lines

**Total iterations required:** [N]

**Meta-test result:**
> "[Agent's response to 'how could this skill be clearer?']"

---

## Key Insight

[The most important lesson from this skill's creation — the one thing future skill authors must know]

---

*Created: [DATE]*
*Skill version: 1.0*
*Purpose: [Why this skill exists / what khuym phase it supports]*
