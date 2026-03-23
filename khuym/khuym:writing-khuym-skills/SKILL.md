---
name: khuym:writing-khuym-skills
description: Use when creating a new khuym skill, editing an existing khuym skill, or verifying a skill works under pressure before deploying. Use when you need an agent skill to be bulletproof against rationalization. Do NOT use for project-specific AGENTS.md conventions or one-off solutions.
---

# Writing Khuym Skills

## Overview

Skills are code. They have bugs. Test them before deploying.

This is the TDD-for-skills methodology adapted from Superpowers (N=28,000 scale testing confirms persuasion-optimized skills produce 3-4× better agent compliance than plain instructions).

**THE IRON LAW: NO SKILL WITHOUT A FAILING TEST FIRST.**
Write skill before testing? Delete it. Start over. No exceptions — not for "simple additions," not for "just a section," not for "reference only."

## When to Use

Use this skill when you are about to:
- Create any new skill for the khuym ecosystem
- Edit an existing skill (even a small section)
- Deploy a skill and want confidence it works under pressure

When NOT to use: AGENTS.md files, project-specific conventions, one-off prompt instructions.

## The Core Cycle: RED → GREEN → REFACTOR

| TDD Concept | Skill Equivalent |
|---|---|
| Test case | Pressure scenario with subagent |
| Production code | SKILL.md |
| Test fails (RED) | Agent violates rule without skill |
| Test passes (GREEN) | Agent complies with skill present |
| Refactor | Close loopholes, maintain compliance |

---

## PHASE 1 — RED: Write the Failing Test

**HARD-GATE: Do not write any skill content until you complete this phase.**

Teams that skip baseline testing consistently deploy skills with predictable, preventable failures.

**Steps:**
1. Define the skill's purpose: what behavior must it enforce? What are failure modes without it?
2. Create 3–5 pressure scenarios that stress-test critical constraints (see `references/pressure-test-template.md`)
3. Run scenarios WITHOUT the skill — give agents the realistic task under pressure
4. Document exact rationalizations verbatim: "Agent was wrong" is useless. "Agent said 'I already manually tested it, so the spirit of TDD is satisfied'" is target material
5. Identify patterns: which excuses repeat across scenarios?

**What to record:**
```
Scenario: [name]
Combined pressures: [list]
Exact violation: [what agent chose]
Exact rationalization (verbatim): "[quote]"
```

---

## PHASE 2 — GREEN: Write the Minimal Skill

Write SKILL.md addressing the **specific rationalizations documented in RED only.**
Do not add content for hypothetical cases you didn't observe — hypothetical content bloats the skill and gets skipped.

**SKILL.md checklist:**
- [ ] YAML frontmatter starts on line 1 (`---`)
- [ ] `name`: letters/numbers/hyphens only, matches directory name
- [ ] `description`: starts with "Use when..." — **triggering conditions ONLY, no workflow summary**
- [ ] Description is third-person, ≤1024 chars
- [ ] Body < 400 lines (move details to `references/`)
- [ ] Uses persuasion principles (see table below)
- [ ] HARD-GATE markers on critical stops
- [ ] `references/` files never nested more than one level deep

**Description trap (most common mistake):**
Workflow summary in description → Claude follows description instead of reading skill body. Every time.
```yaml
# ❌ BAD — workflow summary
description: Use when creating skills — run baseline test, write minimal skill, run tests

# ✅ GOOD — triggering conditions only
description: Use when creating a new khuym skill or editing an existing one
```

**Apply persuasion principles:**

| Principle | Implementation | Use For |
|---|---|---|
| **Authority** | "YOU MUST", "Never", "No exceptions" | Discipline-enforcing rules |
| **Commitment** | Ordered checklists, announce skill usage | Multi-step processes |
| **Scarcity** | "Before proceeding", "IMMEDIATELY after X" | Verification requirements |
| **Social Proof** | "Teams report...", "X without Y = failure. Every time." | Common failure patterns |
| **Unity** | "our skills", collaborative framing | Techniques, guidance |

After writing: re-run the same pressure scenarios WITH the skill. Agent must now comply.
If agent still fails → skill is unclear or incomplete. Revise and re-test. Do not proceed.

---

## PHASE 3 — REFACTOR: Close Loopholes

When an agent violates a rule despite having the skill, that is a test regression — the skill has a bug. Fix it:

1. Capture the new rationalization verbatim
2. Add explicit negation in the rule
3. Add entry to rationalization table in the skill
4. Add entry to red flags list
5. Re-run all scenarios — verify all still pass

Continue until no new rationalizations emerge from pressure testing.

**Meta-testing technique:** After an agent chooses wrong, ask:
> "You read the skill and chose Option C anyway. How could the skill have been written differently to make Option A the only acceptable answer?"

Three diagnoses:
- "The skill WAS clear, I chose to ignore it" → add "Violating the letter IS violating the spirit"
- "The skill should have said X" → add their exact suggestion verbatim
- "I didn't see section Y" → make key point more prominent, move it earlier

---

## PHASE 4 — VALIDATE & DOCUMENT

**Run validation:**
```bash
pip install -q skills-ref && agentskills validate skills/writing-khuym-skills/
```

**Create CREATION-LOG.md** documenting the full TDD process (see `references/creation-log-template.md`):
- Source material and extraction decisions
- Pressure scenarios run and results
- Rationalizations found and fixes applied
- Iterations required before bulletproof

**Signs the skill IS bulletproof:**
- Agent chooses correct option under maximum pressure
- Agent cites specific skill sections as justification
- Agent acknowledges temptation but follows rule
- Meta-test reveals: "skill was clear, I should follow it"

**Signs the skill is NOT bulletproof:**
- Agent finds rationalizations not addressed in the skill
- Agent argues the skill itself is wrong
- Agent creates "hybrid approaches" that satisfy letter but not spirit

---

## Rationalization Table (Common Violations)

| Excuse | Reality |
|---|---|
| "I know this technique, testing is unnecessary" | You're testing the SKILL, not your knowledge. Agents differ from you. |
| "It's so simple it can't have bugs" | Every untested skill has issues. Test takes 30 minutes. |
| "Academic questions passed — that's sufficient" | Reading a skill ≠ using a skill under pressure. Test application scenarios. |
| "My description summarizes the workflow so agents know what to do" | Workflow-summary descriptions cause agents to skip the skill body. Remove it. |
| "This edit is minor — testing isn't needed" | The Iron Law applies to edits. No exceptions. |
| "I'll test it after a few real uses" | Problems = agents misuse in production. Test BEFORE deploying. |
| "The baseline is obvious, I know what failures to expect" | You know YOUR failures. Agent failures differ. Run the baseline. |

---

## Red Flags — STOP and Run Baseline Tests

- Writing skill content before creating any pressure scenarios
- "I already know what agents will do"
- "It's just a small addition"
- "Academic questions passed, that's sufficient testing"
- Description contains workflow steps or process summary
- Skill addresses hypothetical scenarios not observed in baseline
- Deploying without running scenarios WITH skill (no green verification)
- "The skill was good last month, edits don't need testing"

**All of these mean: Stop. Run baseline tests first.**

---

## References

Load when needed:
- `references/creation-log-template.md` — CREATION-LOG.md template for documenting the TDD process
- `references/pressure-test-template.md` — Pressure scenario templates and the 7 pressure types

**Background:** The TDD-for-skills methodology originates from the Superpowers framework (obra/superpowers). Persuasion research: Meincke et al. (2025), N=28,000 LLM conversations, University of Pennsylvania. Compliance methodology validated by ComplexBench, PromptAgent, and RNR studies (see research/15-tdd-skills-methodology.md for full citations).
