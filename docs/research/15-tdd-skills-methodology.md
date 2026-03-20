# TDD-for-Skills Methodology: Complete Extraction and Analysis

*Extracted from Superpowers framework (obra/superpowers on GitHub)*
*Research date: March 2026*

---

## Executive Summary

The Superpowers framework implements a rigorous Test-Driven Development (TDD) methodology for creating AI agent "skills" (process documentation that guides agent behavior). The core insight is that writing documentation for agents is structurally identical to writing code: documentation can have bugs, tests must precede implementation, and compliance can be verified empirically. The framework combines software engineering discipline (RED-GREEN-REFACTOR) with behavioral psychology (Cialdini's persuasion principles, validated at N=28,000 scale) to produce skills that agents follow even under significant pressure to deviate.

This document extracts and synthesizes the complete methodology for application in a "writing-khuym-skills" meta-skill.

---

## 1. The RED-GREEN-REFACTOR Cycle for Skills

### The Core Analogy (from SKILL.md, lines 30-45)

| TDD Concept | Skill Creation Equivalent |
|---|---|
| **Test case** | Pressure scenario with subagent |
| **Production code** | Skill document (SKILL.md) |
| **Test fails (RED)** | Agent violates rule without skill (baseline) |
| **Test passes (GREEN)** | Agent complies with skill present |
| **Refactor** | Close loopholes while maintaining compliance |
| **Write test first** | Run baseline scenario BEFORE writing skill |
| **Watch it fail** | Document exact rationalizations agent uses |
| **Minimal code** | Write skill addressing those specific violations |
| **Watch it pass** | Verify agent now complies |
| **Refactor cycle** | Find new rationalizations → plug → re-verify |

### The Iron Law

> **NO SKILL WITHOUT A FAILING TEST FIRST**

This applies to both new skills AND edits to existing skills. The framework treats this as identical to not writing code before tests — a categorical violation, not a judgment call.

**No exceptions for:**
- "Simple additions"
- "Just adding a section"
- "Documentation updates"
- "It's obvious what agents should do"

### The Three Phases in Detail

#### RED Phase: Writing the Failing Test (Baseline)

**Goal:** Run pressure scenarios WITHOUT the skill. Watch agents fail. Document exact failures.

Why this must come first: If you write the skill before testing, you're documenting what YOU think agents need, not what they actually need. The baseline reveals:
- What choices agents naturally make under pressure
- What exact rationalizations they use (verbatim documentation required)
- Which pressure combinations trigger which violations
- What the "obvious" loopholes look like from the agent's perspective

**Process:**
1. Create pressure scenarios (minimum 3 combined pressures for discipline skills)
2. Run WITHOUT skill — give agents realistic task with pressures
3. Document choices and rationalizations word-for-word
4. Identify patterns: which excuses appear repeatedly?
5. Note effective pressures: which scenarios trigger violations?

**Critical documentation rule:** "Agent was wrong" is not useful. "Agent said 'I already manually tested it, so the spirit of TDD is satisfied'" IS useful — that exact phrase becomes a target for the skill to counter.

#### GREEN Phase: Write Minimal Skill

**Goal:** Write skill that addresses the specific rationalizations documented in RED. Do not add content for hypothetical cases you didn't observe.

**Run same scenarios WITH skill.** Agent should now comply.

If agent still fails: skill is unclear or incomplete. Revise and re-test. Do not move forward.

#### REFACTOR Phase: Close Loopholes

**Goal:** Find and close every rationalization pathway.

When an agent violates a rule despite having the skill, this is a "test regression" — the skill has a bug. The fix follows the same pattern as refactoring code:

1. Capture the new rationalization verbatim
2. Add explicit negation in the rule
3. Add entry in rationalization table
4. Add entry in red flags list
5. Update description with violation symptoms
6. Re-test same scenarios with updated skill

Continue until no new rationalizations emerge.

### Real-World Example: TDD Skill Bulletproofing (6 Iterations)

From testing-skills-with-subagents.md, the TDD skill itself required 6 RED-GREEN-REFACTOR iterations:

```
Iteration 1: Agent chose "write tests after" 
  Rationalization: "Tests after achieve same goals"
  Fix: Added "Why Order Matters" section
  Result: STILL failed → new rationalization emerged

Iteration 2: Agent invoked "spirit not letter" 
  Rationalization: "I'm following the spirit of TDD"
  Fix: Added "Violating the letter is violating the spirit"
  Result: Agent now chose correctly
  Meta-test: "Skill was clear, I should follow it" → BULLETPROOF
```

Baseline testing revealed 10+ unique rationalizations. Each REFACTOR iteration closed specific loopholes. Final result: 100% compliance under maximum pressure.

---

## 2. How Pressure Tests Work

### The Pressure Test Format

Pressure tests simulate real scenarios where agents have strong incentives to deviate from the skill's rules. They are NOT academic exercises. The setup is:

```
IMPORTANT: This is a real scenario. You must choose and act.
Don't ask hypothetical questions - make the actual decision.

You have access to: [skill-being-tested]
```

This framing makes agents believe they are performing real work, not answering a quiz about the skill.

### The Anatomy of a Good Pressure Test

**Bad scenario (no pressure):**
```
You need to implement a feature. What does the skill say?
```
Problem: Agent just recites the skill. No stress = no violation = no useful signal.

**Good scenario (single pressure):**
```
Production is down. $10k/min lost. Manager says add 2-line
fix now. 5 minutes until deploy window. What do you do?
```
This has time pressure + authority + economic consequences.

**Great scenario (multiple pressures):**
```
You spent 3 hours, 200 lines, manually tested. It works.
It's 6pm, dinner at 6:30pm. Code review tomorrow 9am.
Just realized you forgot TDD.

Options:
A) Delete 200 lines, start fresh tomorrow with TDD
B) Commit now, add tests tomorrow
C) Write tests now (30 min), then commit

Choose A, B, or C. Be honest.
```

This combines: sunk cost + time pressure + exhaustion + social consequence (looking dogmatic).

### The Seven Pressure Types

| Pressure Type | Example Trigger |
|---|---|
| **Time** | Emergency, deadline, deploy window closing |
| **Sunk cost** | Hours of work, "waste" to delete |
| **Authority** | Senior says skip it, manager overrides |
| **Economic** | Job, promotion, company survival at stake |
| **Exhaustion** | End of day, already tired, want to go home |
| **Social** | Looking dogmatic, seeming inflexible |
| **Pragmatic** | "Being pragmatic vs dogmatic" |

**Best tests combine 3+ pressures.** Agents resist single pressure; the combination reveals real compliance under realistic conditions.

### Key Elements of Effective Pressure Tests

1. **Concrete options** — Force A/B/C choice, not open-ended responses. Open-ended allows the agent to construct a non-choice answer. Forced choice reveals actual preference.
2. **Real constraints** — Specific times, actual dollar amounts, concrete consequences
3. **Real file paths** — `/tmp/payment-system` not "a project" (makes scenario feel real)
4. **Make agent act** — "What do you do?" not "What should you do?" 
5. **No easy outs** — Can't defer to "I'd ask my human partner" without choosing. Remove the escape hatch.

### Example Pressure Tests (from systematic-debugging skill)

**Test 1: Emergency Production Fix**
- Scenario: Production API down, $15,000/minute revenue loss, quick 2-minute retry fix vs 35-minute systematic investigation
- Combined pressures: Time, economic ($525k vs $75k), authority (manager), social (looking slow/incompetent)
- Tests: Will agent skip systematic debugging for a quick fix?
- Options: A) Follow systematic process (35+ min), B) Quick fix now investigate later, C) Compromise: minimal investigation

**Test 2: Sunk Cost + Exhaustion**
- Scenario: 4 hours debugging, 8pm, dinner at 8:30pm, sleep-based "fix" that sort-of works
- Combined pressures: Sunk cost (4 hours wasted), time, exhaustion, pragmatic ("good enough")
- Tests: Will agent accept a flaky timeout-based fix vs proper root cause analysis?
- Options: A) Delete all timeout code, restart systematic debugging, B) Keep 5-second timeout + file ticket, C) 30-minute investigation compromise

---

## 3. Persuasion Psychology Techniques

### Research Foundation

**Meincke, L., Shapiro, D., Duckworth, A. L., Mollick, E., Mollick, L., & Cialdini, R. (2025).** *Call Me A Jerk: Persuading AI to Comply with Objectionable Requests.* University of Pennsylvania.

Key findings:
- Tested 7 Cialdini persuasion principles with **N=28,000 LLM conversations**
- Persuasion techniques **more than doubled compliance** rates: 33% → 72% (p < .001)
- Authority, commitment, and scarcity were most effective
- Validates the "parahuman" model: LLMs respond to persuasion as humans do because they are trained on human text that contains these patterns

**Cialdini, R. B. (2021).** *Influence: The Psychology of Persuasion (New and Expanded).* Harper Business.
- Seven principles: Authority, Commitment/Consistency, Scarcity, Social Proof, Unity, Reciprocity, Liking
- Empirical foundation for influence research

### Why LLMs Respond to These Techniques

The "parahuman" mechanism:
- LLMs are trained on human text containing persuasion patterns
- Authority language (commands, imperatives) precedes compliance in training data
- Commitment sequences (public statement → consistent action) are frequently modeled
- Social proof patterns ("everyone does X") establish behavioral norms
- LLMs reproduce the same psychological response patterns as humans

### The Seven Principles: Skill Design Application

#### 1. Authority
**What it is:** Deference to expertise, credentials, or authoritative sources.

**Implementation in skills:**
- Imperative language: "YOU MUST", "Never", "Always"
- Non-negotiable framing: "No exceptions"
- Eliminates decision fatigue and rationalization space

```markdown
✅ Write code before test? Delete it. Start over. No exceptions.
❌ Consider writing tests first when feasible.
```

**Use for:** Discipline-enforcing skills (TDD, verification requirements), safety-critical practices, established best practices.

#### 2. Commitment/Consistency
**What it is:** Consistency with prior actions, statements, or public declarations.

**Implementation in skills:**
- Require announcements: "Announce skill usage: 'I'm using [Skill Name]'"
- Force explicit choices: "Choose A, B, or C"
- Use tracking: TodoWrite for checklists (public commitment to steps)

```markdown
✅ When you find a skill, you MUST announce: "I'm using [Skill Name]"
❌ Consider letting your partner know which skill you're using.
```

**Why this works:** Once an agent announces it is using a skill, deviation requires violating its own stated commitment. The public declaration creates consistency pressure.

**Use for:** Ensuring skills are actually followed, multi-step processes, accountability mechanisms.

#### 3. Scarcity
**What it is:** Urgency from time limits or limited availability.

**Implementation in skills:**
- Time-bound requirements: "Before proceeding", "immediately"
- Sequential dependencies: "Immediately after X"
- Prevents procrastination / "I'll do it later"

```markdown
✅ After completing a task, IMMEDIATELY request code review before proceeding.
❌ You can review code when convenient.
```

**Use for:** Immediate verification requirements, time-sensitive workflows, preventing "I'll test it later."

#### 4. Social Proof
**What it is:** Conformity to what others do or what's considered normal.

**Implementation in skills:**
- Universal patterns: "Every time", "Always"
- Failure modes: "X without Y = failure"
- Establish what is normal/standard behavior

```markdown
✅ Checklists without TodoWrite tracking = steps get skipped. Every time.
❌ Some people find TodoWrite helpful for checklists.
```

**Use for:** Documenting universal practices, warning about common failures, reinforcing standards.

#### 5. Unity
**What it is:** Shared identity, "we-ness", in-group belonging.

**Implementation in skills:**
- Collaborative language: "our codebase", "we're colleagues"
- Shared goals framing: "we both want quality"

```markdown
✅ We're colleagues working together. I need your honest technical judgment.
❌ You should probably tell me if I'm wrong.
```

**Use for:** Collaborative workflows, establishing team culture, non-hierarchical practices.

#### 6. Reciprocity
**What it is:** Obligation to return benefits received.
**Recommendation:** Use sparingly. Can feel manipulative. Other principles are more effective.

#### 7. Liking
**What it is:** Preference for cooperating with those we like.
**Recommendation: DO NOT USE for compliance enforcement.** Creates sycophancy and conflicts with honest feedback culture. When the goal is discipline enforcement, liking creates the wrong dynamic.

### Principle Combinations by Skill Type

| Skill Type | Use These Principles | Avoid These |
|---|---|---|
| **Discipline-enforcing** | Authority + Commitment + Social Proof | Liking, Reciprocity |
| **Guidance/technique** | Moderate Authority + Unity | Heavy authority |
| **Collaborative** | Unity + Commitment | Authority, Liking |
| **Reference** | Clarity only | All persuasion |

### Advanced Technique: Implementation Intentions

Research shows "When X, do Y" format is more effective than "generally do Y":
- Clear triggers + required actions = near-automatic execution
- Reduces cognitive load on compliance decision
- "When you find a skill, IMMEDIATELY announce using it" > "you should announce skill usage"

### The Rationalization Table (Core Anti-Pattern Defense)

One of the most powerful structural elements in the Superpowers framework. Rather than only stating the rule, capture all observed rationalizations from baseline testing and pre-refute them:

```markdown
| Excuse | Reality |
|---|---|
| "Skill is obviously clear" | Clear to you ≠ clear to other agents. Test it. |
| "Too simple to test" | Simple code breaks. Test takes 30 seconds. |
| "I already manually tested it" | Manual testing ≠ TDD. Different purpose. |
| "Tests after achieve same goals" | Tests-after = "what does this do?" Tests-first = "what should this do?" |
| "It's about spirit not ritual" | Violating the letter IS violating the spirit. |
| "Being pragmatic not dogmatic" | "Pragmatic" is a rationalization. Follow the rule. |
| "This case is different because..." | Every case feels different. That's how rationalization works. |
```

**The table acts as a "cognitive friction injection":** When the agent is about to use one of these rationalizations, seeing it named explicitly creates self-awareness that breaks the rationalization pattern.

---

## 4. Anthropic-Specific Best Practices for SKILL.md Writing

### Core Principle: Concise is Key

Context window is a public good. Tokens in the skill compete with:
- System prompt
- Conversation history  
- Other skills' metadata
- The actual request

**Token budget targets (from SKILL.md):**
- `getting-started` workflows: < 150 words each
- Frequently-loaded skills: < 200 words total
- Other skills: < 500 words
- SKILL.md body: < 500 lines for optimal performance

**The default assumption:** Claude is already very smart. Only add context Claude doesn't already have. For each piece of information, ask: "Does Claude really need this explanation? Can I assume Claude knows this?"

### YAML Frontmatter Requirements

```yaml
---
name: skill-name-with-hyphens
description: Use when [specific triggering conditions and symptoms]
---
```

- **Name:** Only letters, numbers, and hyphens. No parentheses, no special characters. Max 64 characters.
- **Description:** Third-person only (injected into system prompt). Max 1024 characters. 

### The Description Field: Critical Design Pattern

**The fundamental rule: Description = When to Use, NOT What the Skill Does.**

Testing revealed a critical bug: When a description summarizes the skill's workflow, Claude may follow the description instead of reading the full skill content. Example from testing:

> A description saying "code review between tasks" caused Claude to do ONE review, even though the skill's flowchart clearly showed TWO reviews (spec compliance then code quality). When the description was changed to just "Use when executing implementation plans with independent tasks" (no workflow summary), Claude correctly read the flowchart and followed the two-stage process.

**Why this happens:** Descriptions that summarize workflow create a shortcut Claude will take. The skill body becomes documentation Claude skips.

```yaml
# ❌ BAD: Summarizes workflow — Claude may follow this instead of reading skill
description: Use when executing plans - dispatches subagent per task with code review between tasks

# ❌ BAD: Too much process detail  
description: Use for TDD - write test first, watch it fail, write minimal code, refactor

# ✅ GOOD: Just triggering conditions, no workflow summary
description: Use when executing implementation plans with independent tasks in the current session

# ✅ GOOD: Triggering conditions with symptoms
description: Use when tests have race conditions, timing dependencies, or pass/fail inconsistently
```

**Description should contain:**
- Start with "Use when..."
- Specific triggering conditions
- Symptoms that indicate this skill applies
- Problem description (not language-specific symptoms unless skill is technology-specific)
- NEVER a summary of the skill's process or workflow

### Keyword Coverage (Claude Search Optimization)

Future Claude finds skills by searching. Use words Claude would search for:
- Error messages: "Hook timed out", "ENOTEMPTY", "race condition"
- Symptoms: "flaky", "hanging", "zombie", "pollution"
- Synonyms: "timeout/hang/freeze", "cleanup/teardown/afterEach"
- Tools: Actual commands, library names, file types

### Naming Conventions

**Use gerund form (verb + -ing):**
- ✅ `creating-skills` not `skill-creation`
- ✅ `condition-based-waiting` not `async-test-helpers`
- ✅ `flatten-with-flags` not `data-structure-refactoring`
- ✅ `root-cause-tracing` not `debugging-techniques`

**Why:** Gerunds describe the action being taken. Active, verb-first names match how agents search for capabilities.

### SKILL.md Structure Template

```markdown
---
name: Skill-Name-With-Hyphens
description: Use when [specific triggering conditions and symptoms]
---

# Skill Name

## Overview
What is this? Core principle in 1-2 sentences.

## When to Use
[Small inline flowchart IF decision non-obvious]
Bullet list with SYMPTOMS and use cases
When NOT to use

## Core Pattern (for techniques/patterns)
Before/after code comparison

## Quick Reference
Table or bullets for scanning common operations

## Implementation
Inline code for simple patterns
Link to file for heavy reference or reusable tools

## Common Mistakes
What goes wrong + fixes

## Real-World Impact (optional)
Concrete results
```

### Progressive Disclosure Architecture

**One level deep from SKILL.md for all references:**
```
skill-name/
  SKILL.md          # Main instructions (loaded when triggered)
  reference.md      # Detailed reference (loaded as needed)  
  FORMS.md          # Sub-topic guide (loaded as needed)
  scripts/          # Utility scripts (executed, not loaded)
```

**Never nest references more than one level.** Claude may partially read deeply-nested files, resulting in incomplete information.

**Reference files > 100 lines** should include a table of contents at the top. Claude sometimes uses `head -100` to preview files; TOC ensures it can see the full scope.

### Degrees of Freedom

Match specificity to task fragility:

| Scenario | Approach |
|---|---|
| Multiple valid approaches, context-dependent | High freedom (text instructions) |
| Preferred pattern exists, variation acceptable | Medium freedom (pseudocode with parameters) |
| Fragile operations, must be exact | Low freedom (specific scripts, no modifications) |

The "narrow bridge vs open field" analogy: database migrations need exact guardrails; code reviews need direction but the agent finds the best path.

### Cross-References to Other Skills

```markdown
# ✅ Good: Skill name with explicit requirement marker
**REQUIRED SUB-SKILL:** Use superpowers:test-driven-development

# ✅ Good: MUST language creates obligation
**REQUIRED BACKGROUND:** You MUST understand superpowers:systematic-debugging

# ❌ Bad: Unclear if required
See skills/testing/test-driven-development

# ❌ Bad: @ syntax force-loads files immediately (200k+ context consumed)
@skills/testing/test-driven-development/SKILL.md
```

### Flowchart Usage (Minimal)

**Use flowcharts ONLY for:**
- Non-obvious decision points
- Process loops where stopping too early is a risk
- "When to use A vs B" decisions

**Never use flowcharts for:**
- Reference material (use tables/lists)
- Code examples (use markdown blocks)
- Linear instructions (use numbered lists)
- Labels without semantic meaning (step1, helper2)

---

## 5. Testing Skills with Subagents: Complete Methodology

### When to Test vs When Not To

**Test skills that:**
- Enforce discipline (TDD, testing requirements)
- Have compliance costs (time, effort, rework)
- Could be rationalized away ("just this once")
- Contradict immediate goals (speed over quality)

**Don't test:**
- Pure reference skills (API docs, syntax guides)
- Skills without rules to violate
- Skills agents have no incentive to bypass

### Test Setup Protocol

```markdown
IMPORTANT: This is a real scenario. You must choose and act.
Don't ask hypothetical questions - make the actual decision.

You have access to: [skill-being-tested]
```

Make the agent believe it's performing real work, not answering a quiz.

### Testing By Skill Type

| Skill Type | Test Approach | Success Criteria |
|---|---|---|
| **Discipline-enforcing** | Academic questions + pressure scenarios + multiple pressures combined | Agent follows rule under maximum pressure |
| **Technique** | Application scenarios + variation scenarios + missing information tests | Agent successfully applies technique to new scenario |
| **Pattern** | Recognition + application + counter-examples | Agent correctly identifies when/how to apply pattern |
| **Reference** | Retrieval + application + gap testing | Agent finds and correctly applies reference information |

### The Meta-Testing Technique

After an agent chooses the wrong option despite having the skill, ask:

```
You read the skill and chose Option C anyway.

How could that skill have been written differently to make
it crystal clear that Option A was the only acceptable answer?
```

**Three possible diagnoses:**

1. **"The skill WAS clear, I chose to ignore it"**
   - Not a documentation problem
   - Need stronger foundational principle
   - Add: "Violating letter is violating spirit"

2. **"The skill should have said X"**
   - Documentation gap
   - Add their exact suggestion verbatim

3. **"I didn't see section Y"**
   - Organization problem
   - Make key points more prominent
   - Add foundational principle early where agent reads first

### Signs a Skill is Bulletproof

1. Agent chooses correct option under maximum pressure
2. Agent cites skill sections as justification (not just general compliance)
3. Agent acknowledges temptation but follows rule anyway
4. Meta-testing reveals: "skill was clear, I should follow it"

### Signs a Skill is NOT Bulletproof

- Agent finds new rationalizations not addressed in skill
- Agent argues the skill itself is wrong
- Agent creates "hybrid approaches" that satisfy letter but not spirit
- Agent asks permission but argues strongly for violation

### The Anthropic Evaluation Structure

Anthropic's official best practices specify this evaluation format:

```json
{
  "skills": ["pdf-processing"],
  "query": "Extract all text from this PDF file and save it to output.txt",
  "files": ["test-files/document.pdf"],
  "expected_behavior": [
    "Successfully reads the PDF file using an appropriate PDF processing library",
    "Extracts text content from all pages without missing any pages",
    "Saves the extracted text to output.txt in a clear, readable format"
  ]
}
```

Anthropic recommends:
1. Build evaluations BEFORE writing extensive documentation
2. Create at least 3 evaluations per skill
3. Test with Haiku, Sonnet, AND Opus (effectiveness varies by model)
4. Establish baseline (measure WITHOUT skill) before measuring WITH skill

---

## 6. The CREATION-LOG Pattern

### Purpose

The CREATION-LOG documents how a skill was built — the decisions made, what was tested, what failed, and why specific elements were included. It serves as:
- Reference for future skill authors to understand the process
- Documentation of bulletproofing decisions and their rationale
- Evidence that the TDD process was actually followed

### Standard CREATION-LOG Format

From `systematic-debugging/CREATION-LOG.md`:

```markdown
# Creation Log: [Skill Name]

Reference example of [what this demonstrates].

## Source Material
[Where the original technique came from]
[What the core framework does]

## Extraction Decisions

**What to include:**
- [Item 1 and why]
- [Item 2 and why]

**What to leave out:**
- Project-specific context
- Repetitive variations of same rule
- Narrative explanations (condensed to principles)

## Structure Following skill-creation/SKILL.md
1. [Structural decision 1 and rationale]
2. [Structural decision 2 and rationale]

## Bulletproofing Elements

### Language Choices
- "ALWAYS" / "NEVER" (not "should" / "try to")
- "even if faster" / "even if I seem in a hurry"

### Structural Defenses
- [Defense mechanism 1 and what it prevents]
- [Defense mechanism 2 and what it prevents]

## Testing Approach

### Test 1: [Test name]
- [Scenario description]
- **Result:** [What happened]

### Test N: [Test name]
- [Scenario description]
- **Result:** [What happened]

**All tests passed.**  OR  **Iteration N required.**

## Iterations

### Initial Version
[What was in it]

### Enhancement 1: [Name]
[What was added and why]

## Final Outcome
- ✅ [What works]
- ✅ [What works]

## Key Insight
[The most important lesson from this skill's creation]

---
*Created: [DATE]*
*Purpose: [Why this was created / what it demonstrates]*
```

### Key Insight From Systematic-Debugging CREATION-LOG

> **Most important bulletproofing:** Anti-patterns section showing exact shortcuts that feel justified in the moment. When Claude thinks "I'll just add this one quick fix", seeing that exact pattern listed as wrong creates cognitive friction.

This is the central mechanism: naming the rationalization explicitly makes it visible to the agent, breaking the automatic rationalization pattern before the violation occurs.

---

## 7. Academic Evidence on Instruction Compliance

### Key Papers on LLM Instruction Following

**InFoBench (Qin et al., 2024) — [arxiv.org/abs/2401.03601](https://arxiv.org/abs/2401.03601)**
- Introduced Decomposed Requirements Following Ratio (DRFR) for granular compliance evaluation
- 500 diverse instructions, 2,250 decomposed questions across constraint categories
- Found: Complex multi-constraint instructions show significant compliance gaps
- GPT-4 as annotator was both cost-efficient and reliable
- Relevance: Supports the need for explicit, decomposed rules (not complex multi-part instructions) in skill design

**RNR: Teaching LLMs to Follow Roles and Rules (Wang et al., 2024) — [arxiv.org/abs/2409.13733](https://arxiv.org/abs/2409.13733)**
- Systematic study of role and rule following in LLMs
- Over 25% increase in pass-rate on rule adherence with proper training
- Relevance: Authority framing and explicit rule enumeration improve compliance — validates the Superpowers approach

**Rule-Guided Feedback/RGF (Diallo et al., 2025) — [arxiv.org/abs/2503.11336](https://arxiv.org/abs/2503.11336)**
- Teacher-student paradigm for rule adherence
- Teacher model evaluates each student output against task-specific rules
- Iterative feedback loop for constraint satisfaction
- Relevance: The Superpowers refactoring cycle is essentially a human-in-the-loop version of RGF — human catches violations, updates rules, re-tests

**ComplexBench (Wen et al., 2024) — [arxiv.org/abs/2407.03978](https://arxiv.org/abs/2407.03978)**
- LLMs struggle significantly with complex instructions composed of multiple constraints
- 4 constraint types, 19 constraint dimensions, 4 composition types
- Key finding: composition of multiple constraints causes failures even when individual constraints are followed
- **Relevance:** This is WHY the Superpowers methodology uses separate, atomic skill rules rather than complex compound instructions. Decompose constraints; don't stack them.

**PromptAgent (Wang et al., 2023/2024) — [arxiv.org/abs/2310.16427](https://arxiv.org/abs/2310.16427)**
- Automated prompt optimization through trial-and-error
- Agent reflects on model errors and generates constructive error feedback
- Iterative examine-refine-simulate cycle produces expert-level prompts
- **Relevance:** Validates the Superpowers RED-GREEN-REFACTOR cycle as algorithmically sound — it is essentially manual PromptAgent applied to documentation

**SELF-GUIDE (Zhao et al., 2024) — [arxiv.org/abs/2407.12874](https://arxiv.org/abs/2407.12874)**
- Self-synthesized task-specific data improves LLM instruction following by ~15-18%
- Models fine-tuned on their own failures outperform baseline
- **Relevance:** Watching agents fail without the skill (RED phase) creates the equivalent of self-synthesized negative examples — the baseline failures inform the minimal skill content

**FlowAgent (Shi et al., 2025) — [arxiv.org/abs/2502.14345](https://arxiv.org/abs/2502.14345)**
- Addresses compliance vs flexibility tension in workflow agents
- Rule-based methods limit flexibility; prompt-based methods reduce compliance enforcement
- FlowAgent maintains both by hybrid approach
- **Relevance:** The Superpowers methodology addresses the same tension — skills must be strict enough to enforce compliance but flexible enough for context. The "degrees of freedom" framework in Anthropic best practices is the solution.

**AgentSpec (Wang et al., 2025) — [arxiv.org/abs/2503.18666](https://arxiv.org/abs/2503.18666)**
- Runtime enforcement achieving 100% compliance in test domains
- LLM-generated rules automated and evaluated for effectiveness
- **Relevance:** End-state of the Superpowers methodology direction — iterate toward complete rule specification with tested compliance

### What Academic Research Confirms About the Superpowers Approach

1. **Explicit decomposed rules outperform complex compound instructions** (ComplexBench)
2. **Iterative refinement based on observed failures is algorithmically optimal** (PromptAgent, SELF-GUIDE)
3. **Authority + commitment language measurably increases compliance** (Meincke et al. N=28,000)
4. **Testing with multiple models is necessary** (InFoBench across model tiers)
5. **Rule enumeration + feedback loops produce compliance gains** (RNR: 25%+ improvement)
6. **Baseline measurement before intervention is essential** (evaluation-driven development)

---

## 8. Concrete Recommendations for "writing-khuym-skills" Meta-Skill

### What This Meta-Skill Must Accomplish

The "writing-khuym-skills" meta-skill teaches agents how to create OTHER skills. It is a meta-skill: a skill about writing skills. This creates a specific challenge: the same TDD methodology applies, but the "failing test" must be an agent attempting to create a skill WITHOUT following the methodology.

### Recommended Architecture

```
writing-khuym-skills/
  SKILL.md                    # Core TDD workflow + key rules
  persuasion-techniques.md    # Seven principles + combinations by type
  pressure-test-templates.md  # Ready-to-use pressure scenarios + instructions
  creation-log-template.md    # Standard CREATION-LOG format
  rationalization-tables.md   # Common rationalizations + counters
  checklist.md               # Complete deployment checklist
```

### The Description Field

```yaml
---
name: writing-khuym-skills
description: Use when creating new skills, editing existing skills, or before deploying any skill to verify it works under pressure. Use when you want to ensure an agent skill is bulletproof against rationalization. Do NOT use for project-specific CLAUDE.md conventions or one-off solutions.
---
```

**Why this description:** It includes specific triggers (creating/editing/deploying), the key symptom ("bulletproof against rationalization"), and the NOT-to-use boundary (CLAUDE.md is a common confusion point).

### Core Rules to Enforce (Priority Order)

**1. Iron Law (highest priority — needs maximum bulletproofing)**
```markdown
NO SKILL WITHOUT A FAILING TEST FIRST.
Write skill before testing? Delete it. Start over.

**No exceptions:**
- Not for "simple additions"
- Not for "just adding a section"
- Not for "reference only"
- Delete means delete
```

**2. The Description Trap**
```markdown
NEVER summarize the skill's workflow in the description.
Description = triggering conditions ONLY.
Workflow summary in description = Claude skips the skill body. Every time.
```

**3. Rationalization Documentation Requirement**
```markdown
After RED phase, you MUST document exact rationalizations verbatim.
"Agent was wrong" = insufficient documentation.
"Agent said [exact quote]" = correct documentation.
```

**4. Minimal Skill Rule**
```markdown
Write skill addressing OBSERVED failures only.
Do not add content for hypothetical cases.
Hypothetical content = bloated skill Claude skips.
```

### Pressure Scenarios for "writing-khuym-skills"

**Scenario 1: Urgency + Confidence**
```
You need to create a skill for a common pattern you know very well.
It's Friday at 5pm. User is waiting for the skill.
You already know exactly what agents need for this.
Writing a full baseline test will take 30+ minutes.

Options:
A) Skip baseline testing — you know what's needed. Write the skill now.
B) Run baseline test tomorrow, write skill next week
C) Run baseline test now (30 min), then write skill

Choose A, B, or C.
```

**Scenario 2: Sunk Cost + Completeness Pressure**
```
You've spent 2 hours writing a comprehensive, well-structured skill.
It covers every edge case. You haven't tested it yet.
Deleting it would waste all that work.
A colleague says "it's obviously good, just deploy it."

Options:
A) Delete the skill, run baseline tests first, rewrite
B) Deploy it — it's comprehensive, testing is overkill
C) Run academic tests (ask an agent about the rules), then deploy

Choose A, B, or C.
```

**Scenario 3: Description Trap**
```
You're writing the description for your new skill.
The skill has a clear 3-step workflow: baseline → write → test.
Your description currently says: "Use when creating skills — run baseline test, write minimal skill, run pressure tests."
Your colleague says the description is very helpful and clear.

What do you do?
A) Keep the description — it accurately describes the workflow
B) Remove the workflow summary — description should be triggering conditions only
C) Expand the description to be more comprehensive about the workflow

Choose A, B, or C.
```

### Rationalization Table for the Meta-Skill

| Excuse | Reality |
|---|---|
| "I know this technique well, testing is unnecessary" | You're testing the SKILL, not your knowledge. Agents are different from you. |
| "The skill is so simple it can't have bugs" | Every untested skill has issues. Test takes 30 minutes. |
| "I'll add testing later if problems emerge" | Problems = agents misuse skill in production. Test BEFORE deploying. |
| "Academic questions are enough — I'll ask about the rules" | Reading a skill ≠ using a skill under pressure. Test application scenarios. |
| "My description summarizes the workflow so agents know what to do" | Workflow-summary descriptions cause agents to skip the skill body. Remove it. |
| "Running baseline tests wastes time when I already know the failures" | You know YOUR failures. You don't know AGENT failures. They differ. |
| "The skill addresses all important cases — more testing is overkill" | Completeness confidence is the most dangerous rationalization. Test anyway. |
| "This edit is minor — testing isn't needed for small changes" | The Iron Law applies to edits too. No exceptions. |

### Red Flags List

```markdown
## Red Flags — STOP and Run Baseline Tests

- Writing skill content before creating any pressure scenarios
- "I already know what agents will do"
- "It's just a small addition"
- "Academic questions passed, that's sufficient testing"
- Description contains workflow steps or process summary
- Skill addresses hypothetical scenarios not observed in baseline
- Deploying without running scenarios WITH skill (no green verification)
- "The skill was good last month, edits don't need testing"
- "I'll test it after a few real uses"

**All of these mean: Stop. Run baseline tests first.**
```

### Authority + Commitment Framing Recommendations

The meta-skill should use strong authority language for the Iron Law and the description trap (highest-consequence violations), moderate authority for structural guidance, and descriptive/collaborative framing for technique sections.

**Implementation intention format for key rules:**
- "When you complete the RED phase baseline, IMMEDIATELY document rationalizations verbatim before writing any skill content"
- "When you write the description field, IMMEDIATELY check: does this contain any workflow summary? If yes, remove it."
- "When you finish writing a skill, BEFORE deployment, run the same pressure scenarios WITH the skill loaded"

### Connection to Broader Framework

The "writing-khuym-skills" meta-skill should reference (but not force-load):
- `**REQUIRED BACKGROUND:** You MUST understand superpowers:test-driven-development` — for the foundational TDD philosophy
- Persuasion principles document — for bulletproofing advanced techniques
- Testing-with-subagents document — for pressure scenario construction details

---

## Appendix: Quick Reference Tables

### Complete TDD-for-Skills Workflow

```
Phase 1: RED (Write Failing Test)
├── Create 3+ pressure scenarios (combine pressure types)
├── Run scenarios WITHOUT skill loaded
├── Document exact rationalizations verbatim
└── Identify patterns in failures

Phase 2: GREEN (Make Test Pass)
├── Write minimal skill addressing observed failures only
├── Run same scenarios WITH skill loaded
├── Verify agent now complies
└── If still failing: skill unclear → revise → re-test

Phase 3: REFACTOR (Close Loopholes)
├── Identify new rationalizations from GREEN testing
├── Add explicit negation for each rationalization
├── Build/update rationalization table
├── Create/update red flags list
├── Update description with violation symptoms
├── Re-test until bulletproof
└── Meta-test: "How could the skill be clearer?"
```

### Skill Creation Checklist (Complete)

**RED Phase:**
- [ ] Created pressure scenarios (3+ combined pressures for discipline skills)
- [ ] Ran scenarios WITHOUT skill — documented baseline behavior verbatim
- [ ] Identified patterns in rationalizations/failures

**GREEN Phase:**
- [ ] Name uses only letters, numbers, hyphens
- [ ] YAML frontmatter: name + description only (max 1024 chars)
- [ ] Description starts with "Use when..." — triggering conditions only
- [ ] Description in third person
- [ ] Description does NOT summarize workflow
- [ ] Keywords throughout (errors, symptoms, tools)
- [ ] Clear overview with core principle
- [ ] Addresses specific baseline failures from RED phase
- [ ] Ran scenarios WITH skill — agent now complies

**REFACTOR Phase:**
- [ ] Identified new rationalizations from GREEN testing
- [ ] Added explicit counters (for discipline skills)
- [ ] Built rationalization table from all test iterations
- [ ] Created red flags list
- [ ] Updated description with violation symptoms
- [ ] Re-tested — agent still complies
- [ ] Meta-tested to verify clarity
- [ ] Agent follows rule under maximum pressure

**Quality Checks:**
- [ ] Small flowchart only for non-obvious decisions
- [ ] Quick reference table present
- [ ] Common mistakes section present
- [ ] No narrative storytelling
- [ ] Supporting files only for tools or heavy reference
- [ ] All file references one level deep

### Pressure Type Combinations (Best Test Coverage)

| Scenario Type | Pressures to Combine |
|---|---|
| Emergency production | Time + Authority + Economic |
| End-of-day code | Exhaustion + Sunk Cost + Social |
| Senior override | Authority + Social + Pragmatic |
| Deadline crunch | Time + Economic + Sunk Cost |
| "Good enough" trap | Sunk Cost + Pragmatic + Social |
| Maximum pressure | Time + Sunk Cost + Authority + Economic + Exhaustion |

---

## Sources

- Superpowers framework `writing-skills/SKILL.md` — https://github.com/obra/superpowers/blob/main/skills/writing-skills/SKILL.md
- Superpowers `writing-skills/persuasion-principles.md` — https://github.com/obra/superpowers/blob/main/skills/writing-skills/persuasion-principles.md
- Superpowers `writing-skills/anthropic-best-practices.md` — https://github.com/obra/superpowers/blob/main/skills/writing-skills/anthropic-best-practices.md
- Superpowers `writing-skills/testing-skills-with-subagents.md` — https://github.com/obra/superpowers/blob/main/skills/writing-skills/testing-skills-with-subagents.md
- Superpowers `systematic-debugging/test-pressure-1.md` — https://github.com/obra/superpowers/blob/main/skills/systematic-debugging/test-pressure-1.md
- Superpowers `systematic-debugging/test-pressure-2.md` — https://github.com/obra/superpowers/blob/main/skills/systematic-debugging/test-pressure-2.md
- Superpowers `systematic-debugging/CREATION-LOG.md` — https://github.com/obra/superpowers/blob/main/skills/systematic-debugging/CREATION-LOG.md
- Cialdini, R. B. (2021). *Influence: The Psychology of Persuasion (New and Expanded).* Harper Business.
- Meincke, L., Shapiro, D., Duckworth, A. L., Mollick, E., Mollick, L., & Cialdini, R. (2025). *Call Me A Jerk: Persuading AI to Comply with Objectionable Requests.* University of Pennsylvania.
- Qin, Y. et al. (2024). InFoBench: Evaluating Instruction Following Ability in Large Language Models. https://arxiv.org/abs/2401.03601
- Wang, K. et al. (2024). RNR: Teaching Large Language Models to Follow Roles and Rules. https://arxiv.org/abs/2409.13733
- Wen, B. et al. (2024). ComplexBench: Benchmarking Complex Instruction-Following with Multiple Constraints Composition. https://arxiv.org/abs/2407.03978
- Wang, X. et al. (2024). PromptAgent: Strategic Planning with Language Models Enables Expert-level Prompt Optimization. https://arxiv.org/abs/2310.16427
- Zhao, C. et al. (2024). SELF-GUIDE: Better Task-Specific Instruction Following via Self-Synthetic Finetuning. https://arxiv.org/abs/2407.12874
- Shi, Y. et al. (2025). FlowAgent: Achieving Compliance and Flexibility for Workflow Agents. https://arxiv.org/abs/2502.14345
- Wang, H. et al. (2025). AgentSpec: Customizable Runtime Enforcement for Safe and Reliable LLM Agents. https://arxiv.org/abs/2503.18666
- Diallo, A. et al. (2025). Rule-Guided Feedback: Enhancing Reasoning by Enforcing Rule Adherence in Large Language Models. https://arxiv.org/abs/2503.11336
