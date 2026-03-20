# Superpowers Framework: Exhaustive Deep Dive

**Compiled:** 2026-03-20  
**Sources:** GitHub repos, BetterStack, Classmethod, HackerNews, Reddit, X/Twitter, primary SKILL.md files  
**Repository:** https://github.com/obra/superpowers  
**Author:** Jesse Vincent (Prime Radiant)  
**Stars at time of research:** ~98,200 (GitHub, March 2026)

---

## Table of Contents

1. [What Is Superpowers?](#1-what-is-superpowers)
2. [Brainstorming Skill — Exact Mechanics](#2-brainstorming-skill--exact-mechanics)
3. [The Spec-Document-Reviewer Subagent Loop](#3-the-spec-document-reviewer-subagent-loop)
4. [YAGNI Enforcement — Structural vs. Suggestive](#4-yagni-enforcement--structural-vs-suggestive)
5. [The Philosophy Behind "One Question at a Time"](#5-the-philosophy-behind-one-question-at-a-time)
6. [Adaptive Skip Logic](#6-adaptive-skip-logic)
7. [Fresh Context Per Subagent — The 200K Architecture](#7-fresh-context-per-subagent--the-200k-architecture)
8. [The Full Skill Stack](#8-the-full-skill-stack)
9. [Subagent-Driven Development — Deep Mechanics](#9-subagent-driven-development--deep-mechanics)
10. [Writing Plans — Granularity Standards](#10-writing-plans--granularity-standards)
11. [Git Worktrees Integration](#11-git-worktrees-integration)
12. [Community Reception — Real User Voices](#12-community-reception--real-user-voices)
13. [Limitations and Known Weaknesses](#13-limitations-and-known-weaknesses)
14. [Underlying Design Philosophy](#14-underlying-design-philosophy)
15. [Competitive Landscape](#15-competitive-landscape)

---

## 1. What Is Superpowers?

Superpowers is an **agentic skills framework** and **software development methodology** built by Jesse Vincent (obra) at Prime Radiant. It is not a model, not a fine-tune, and not a wrapper. It is a set of composable Markdown documents (called "skills") that AI coding agents read and follow as mandatory workflow procedures.

**Core architecture insight:** A "skill" is a SKILL.md file the agent reads using a shell script search mechanism. The agent is bootstrapped with a session-start hook that tells it:
1. You have skills. They give you Superpowers.
2. Search for skills by running a script and use skills by reading them and doing what they say.
3. **If you have a skill to do something, you MUST use it.**

The bootstrap prompt is injected as a session-start hook into the agent's context. From Jesse Vincent's [original October 2025 blog post](https://blog.fsck.com/2025/10/09/superpowers/):

```
<session-start-hook><EXTREMELY_IMPORTANT>
You have Superpowers.

**RIGHT NOW, go read**: @/Users/jesse/.claude/plugins/cache/Superpowers/skills/getting-started/SKILL.md
</EXTREMELY_IMPORTANT></session-start-hook>
```

The framework operates on Claude Code (Anthropic's terminal agent), and as of 2026 is also available on Cursor, Codex, OpenCode, and Gemini CLI. It reached **official Anthropic marketplace status** in early 2026.

**Why it works (the key insight):** LLMs already know TDD, YAGNI, and clean architecture in their weights. The problem is they don't *apply* them without structured prompting. Skills don't add new knowledge — they enforce the *application* of existing knowledge at the right moments.

---

## 2. Brainstorming Skill — Exact Mechanics

Source: [SKILL.md on GitHub](https://github.com/obra/superpowers/blob/main/skills/brainstorming/SKILL.md)

The brainstorming skill is **mandatory** before any creative work — creating features, building components, adding functionality, or modifying behavior. The SKILL.md explicitly states:

> "Do NOT invoke any implementation skill, write any code, scaffold any project, or take any implementation action until you have presented a design and the user has approved it. This applies to EVERY project regardless of perceived simplicity."

### The 9-Step Checklist (Must Be Completed In Order)

The skill requires the agent to create a task for each item and complete them in order:

| Step | Action | Key Detail |
|------|--------|------------|
| 1 | **Explore project context** | Check files, docs, recent commits BEFORE asking anything |
| 2 | **Offer visual companion** (if visual topic) | This is its own message, no other content combined |
| 3 | **Ask clarifying questions** | One at a time, purpose/constraints/success criteria |
| 4 | **Propose 2-3 approaches** | With trade-offs and explicit recommendation |
| 5 | **Present design** | In sections, get approval after each section |
| 6 | **Write design doc** | Saved to `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md` + committed to git |
| 7 | **Spec review loop** | Dispatch spec-document-reviewer subagent; max 3 iterations, then surface to human |
| 8 | **User reviews written spec** | Human gate — wait for approval before proceeding |
| 9 | **Transition to implementation** | Invoke writing-plans skill ONLY |

### Anti-Pattern: "This Is Too Simple To Need A Design"

The skill explicitly addresses the most common failure mode:

> "Every project goes through this process. A todo list, a single-function utility, a config change — all of them. 'Simple' projects are where unexamined assumptions cause the most wasted work. The design can be short (a few sentences for truly simple projects), but you MUST present it and get approval."

This is not a soft guideline. The SKILL.md uses a `<HARD-GATE>` tag for the prohibition on writing code before design approval.

### Context Exploration Protocol

Before asking a single question, the agent:
- Reads existing files and documentation
- Checks recent commits
- Assesses whether the request describes **multiple independent subsystems**

If the scope is too large (e.g., "build a platform with chat, file storage, billing, and analytics"), the agent flags this immediately and helps the user **decompose** before refinement. The SKILL.md says: "Don't spend questions refining details of a project that needs to be decomposed first."

### Visual Companion

A browser-based companion for UI mockups, architecture diagrams, and layout comparisons. When the agent anticipates visual questions, it offers it **in a standalone message** (no other content). Key distinction:

- **Use browser:** content that IS visual — mockups, wireframes, layout comparisons, architecture diagrams
- **Use terminal:** content that is conceptual — requirements, tradeoff lists, A/B options, scope decisions

> "A question about a UI topic is not automatically a visual question. 'What does personality mean in this context?' is a conceptual question — use the terminal."

### Section-By-Section Design Presentation

When presenting the design, the agent covers: architecture, components, data flow, error handling, testing. Each section is scaled to its complexity:
- "A few sentences if straightforward, up to 200-300 words if nuanced"
- Agent asks "Does this section look right?" after each section, not at the end

### The Process Flow (Graphviz Diagram from SKILL.md)

```
Explore project context
  → Visual questions ahead?
      yes → Offer Visual Companion (own message, no other content)
      no  → Ask clarifying questions
  → (after companion offer) → Ask clarifying questions
  → Propose 2-3 approaches
  → Present design sections
  → User approves design?
      no, revise → Present design sections
      yes → Write design doc
  → Spec review loop
  → Spec review passed?
      issues found, fix and re-dispatch → Spec review loop
      approved → User reviews spec?
          changes requested → Write design doc
          approved → Invoke writing-plans skill [TERMINAL STATE]
```

**The terminal state is invoking writing-plans. No other skill is invoked after brainstorming.**

---

## 3. The Spec-Document-Reviewer Subagent Loop

### What It Is

After the design document is written to disk, the brainstorming skill dispatches a `spec-document-reviewer` subagent. This is a **fresh subagent** — it does NOT inherit the session history. The coordinator constructs precisely crafted review context (just the spec document path and relevant context, never the full conversation).

From the [Classmethod article](https://dev.classmethod.jp/en/articles/2026-03-17-superpowers-brainstorming/):

> "In superpowers v5.0 series, generated specifications are automatically reviewed by a sub-agent called spec-document-reviewer. Previously, I had to manually request Opus for reviews, but from v5.0 this loop has been automated. As a developer, all I need to do is final confirmation of the specification, while the AI autonomously handles reviews and modifications."

### Mechanical Loop Structure (from SKILL.md)

```
1. Dispatch spec-document-reviewer subagent 
   (with precisely crafted review context — never session history)
2. If Issues Found: fix, re-dispatch, repeat until Approved
3. If loop exceeds 3 iterations: surface to human for guidance
```

Note: The Classmethod article (published March 17, 2026) references the SKILL.md saying the limit is **5 iterations**, while the current (March 16, 2026) SKILL.md text says **3 iterations**. This was changed in the "Tone down review loops: single-pass plan review, raise issue bar" commit, visible in the GitHub history. The current enforced limit is **3 iterations**.

### What the Reviewer Checks

The spec-document-reviewer-prompt.md file (referenced in SKILL.md, not directly accessible due to rate limiting) contains the reviewer's mandate. Based on the broader framework, the spec reviewer evaluates:

- **Completeness:** Are all required components documented? Are architecture, data flow, error handling, and testing all addressed?
- **YAGNI compliance:** Are any features described that weren't requested or aren't necessary now?
- **Clarity:** Could an engineer unfamiliar with the codebase understand the design?
- **Design for isolation:** Are boundaries well-defined? Does each component have one clear purpose?
- **Pattern consistency:** Does the design follow existing codebase conventions?

### The Dual Review in Writing Plans

The `writing-plans` skill has a parallel review loop:

```
1. Dispatch plan-document-reviewer subagent
   (provide: path to plan document, path to spec document)
2. If ❌ Issues Found: fix the issues, re-dispatch reviewer for the whole plan
3. If ✅ Approved: proceed to execution handoff
4. Same limit: surface to human if loop exceeds 3 iterations
```

### Context Isolation Principle for Reviewers

The reviewer receives **only what it needs** — not the conversation history:

> "Dispatch spec-document-reviewer subagent with precisely crafted review context (never your session history); fix issues and re-dispatch until approved."

This is architecturally deliberate. The reviewer's job is to evaluate the spec document, not understand how the human and agent arrived at it. Providing session history would contaminate the review with conversational context and balloon token usage.

---

## 4. YAGNI Enforcement — Structural vs. Suggestive

### The Claim

The SKILL.md states: **"YAGNI ruthlessly — Remove unnecessary features from all designs"**

### Is It Structurally Enforced or Just a Suggestion?

The enforcement is **multi-layered** but ultimately relies on LLM compliance. Here's how each layer works:

#### Layer 1: Mandatory Spec Review (Structural)

The spec-document-reviewer subagent checks for YAGNI violations as part of its review. Any extra features added without user request should surface as issues in the spec review loop. Because the spec reviewer is a fresh subagent reading the spec, it can spot scope additions that crept in during the drafting process. This is the most structurally reliable layer.

#### Layer 2: Scope Check in Writing Plans (Structural)

The `writing-plans` SKILL.md includes an explicit scope check:

> "If the spec covers multiple independent subsystems, it should have been broken into sub-project specs during brainstorming. If it wasn't, suggest breaking this into separate plans — one per subsystem. Each plan should produce working, testable software on its own."

#### Layer 3: Two-Stage Code Review in Subagent-Driven Development (Structural)

The spec compliance reviewer during implementation explicitly checks:
- "Missing: [feature in spec not implemented]"
- "Extra: [feature added not in spec]"

From the example workflow in SKILL.md:
```
Spec reviewer: ❌ Issues:
  - Missing: Progress reporting (spec says "report every 100 items")
  - Extra: Added --json flag (not requested)
```

The implementer must fix both gaps AND extras before the reviewer approves.

#### Layer 4: Instruction in SKILL.md (Instructional, Not Enforced)

The brainstorming SKILL.md explicitly instructs the agent to remove unnecessary features during design. This layer relies on the LLM following the instruction in the moment.

### Verdict: Structural + Instructional, Not Purely Structural

YAGNI enforcement is **better than a suggestion but not as ironclad as code**. The spec review and compliance review loops create real friction against scope creep — they require an active fix-and-re-dispatch cycle to resolve extras. However, if the LLM systematically ignores the reviewer's flags, there's no hard-code barrier. The framework uses persuasion engineering (authority, commitment framing) to make compliance more reliable, but it's ultimately prompt-based.

As one HackerNews commenter noted: "Some of these skills are probably better as programmed workflows that the LLM is forced to go through to improve reliability/consistency... rather than using English to guide the LLM and trusting it to follow the prescribed set of steps needed." ([HN, October 2025](https://news.ycombinator.com/item?id=45547344))

---

## 5. The Philosophy Behind "One Question at a Time"

### The Rule

From SKILL.md:
> - **One question per message** - if a topic needs more exploration, break it into multiple questions
> - **Multiple choice preferred** - Easier to answer than open-ended when possible
> - **Focus on**: purpose, constraints, success criteria

### Why This Matters

The Classmethod article captures the user experience precisely:

> "Questions come one at a time. Being asked 10 questions at once is stressful, but answering in this one-by-one format is manageable. And as you answer, specifications that were initially vague become clear through the dialogue."

### The UX and Cognitive Science Principles Behind It

**1. Cognitive Load Theory (Miller's Law)**  
Presenting multiple questions simultaneously forces the user to hold multiple mental contexts open. Each unanswered question occupies working memory. One question at a time eliminates this split-attention burden. The Nielsen Norman Group's research on form design confirms: "One thing per page" reduces cognitive load by allowing users to focus on a single information category.

**2. Progressive Disclosure**  
Answers to early questions change the relevance and framing of later questions. Asking everything upfront means some questions will be irrelevant, poorly framed, or redundant. Sequential questioning allows the agent to adaptively narrow scope — similar to a UX wizard pattern (dynamically displaying relevant fields based on prior input).

**3. Commitment and Consistency (Cialdini's Influence)**  
Jesse Vincent explicitly noted in the blog post that Cialdini's persuasion principles apply to LLMs — and Claude itself recognized this in its "feelings journal." Each confirmed answer creates a small commitment. The progressive specification process creates a string of micro-commitments that make the final spec more aligned and harder to unilaterally revise. This also benefits the user: successive small agreements build confidence.

**4. Reducing Specification Abandonment**  
Batch questionnaires trigger decision fatigue and form abandonment. The conversational, one-at-a-time format keeps the interaction feeling like dialogue rather than bureaucracy, sustaining engagement through the full design process.

**5. Error Isolation**  
With batch questions, if the user answers question 7 incorrectly, it contaminates answers 8-10. With sequential questions, each wrong answer is isolated and can be corrected before the next question is asked.

### Multiple Choice Preference

The SKILL.md explicitly prefers multiple choice over open-ended questions "when possible." This serves two purposes:
- Forces the agent to **enumerate the decision space** — it can't ask a multiple choice question without thinking through the viable options
- Reduces user cognitive load: recognition is easier than recall

The Classmethod demo shows this in action:
```
agent: Question 3: What keyring backend?
A) macOS Keychain
B) System default (works across all OSes)
C) Specific library (like zalando/go-keyring)
```

---

## 6. Adaptive Skip Logic

### When Does the Full Spec Process Get Skipped?

The framework has built-in adaptability for scale. From the SKILL.md:

> "The design can be **short (a few sentences for truly simple projects)**, but you MUST present it and get approval."

And from the Classmethod article:

> "For small modifications, specification documents and implementation plans aren't output, and the agent simply makes the modifications and finishes. **Since the skill determines the scale, the developer doesn't need to worry about it.**"

### Scope Assessment Signals

The brainstorming skill looks for specific signals to determine scale before starting the questioning process:

**Signal 1: Multiple Independent Subsystems**  
If the request describes "chat, file storage, billing, and analytics" — or any other collection of independent components — the agent flags for **decomposition** before refinement. This is not a skip but a redirect.

**Signal 2: Scope Appropriateness Check**  
The SKILL.md: "For appropriately-scoped projects, ask questions one at a time to refine the idea." The agent makes a judgment call on scope before entering the full questioning loop.

**Signal 3: Existing Codebase Context**  
"Explore the current structure before proposing changes." If the codebase already contains relevant patterns, the context exploration phase may resolve many questions automatically, shortening the dialogue.

### What "Short Design" Means in Practice

For truly small tasks (a config change, a single utility function), the design presentation might be:
- One paragraph describing the approach
- A quick check: "Does this approach look right?"
- No separate spec document written
- No spec review loop invoked

The key principle: **the spec review loop and written document are proportional to complexity**. The absolute requirement is that the user approves the approach before code is written — the depth of documentation scales.

### What Is NOT Skippable (The Hard Gates)

Per the `<HARD-GATE>` tag in SKILL.md:
- You cannot write code before presenting and getting approval of the design
- You cannot skip the visual companion offer if visual questions are anticipated
- You cannot combine the visual companion offer with other content
- You cannot invoke any skill after brainstorming other than writing-plans

---

## 7. Fresh Context Per Subagent — The 200K Architecture

### The Problem Being Solved

Long-running AI sessions accumulate context that degrades performance. As the session grows, models:
- Lose track of early instructions
- Confuse different parts of the codebase
- Start contradicting earlier decisions
- Hallucinate based on muddled context

### The Superpowers Solution

The `subagent-driven-development` SKILL.md explains:

> "**Why subagents:** You delegate tasks to specialized agents with isolated context. By precisely crafting their instructions and context, you ensure they stay focused and succeed at their task. **They should never inherit your session's context or history** — you construct exactly what they need. This also preserves your own context for coordination work."

### The 200K Context Claim

From the Classmethod article (real-world measurement):

> "Since starting to use subagent-driven-development, context doesn't accumulate as much, so I work with AutoCompact disabled. It rarely exceeds 200k. **Actually measuring a session log showed that even with work spanning 260 turns, the maximum context was 142k tokens (71% of 200k).**"

This is a concrete empirical measurement, not a theoretical claim. 260 turns of work staying under 142k tokens is remarkable, achieved by:
1. The coordinator session handles only high-level orchestration
2. Implementation work is offloaded to fresh subagents
3. Each subagent receives exactly the context needed for its specific task — no more

### How Context Is Constructed for Subagents

The coordinator (main session) role:
- Reads the plan file **once** at the start, extracts all tasks with full text
- When dispatching a subagent, constructs context containing:
  - The specific task text in full
  - Scene-setting context (where this task fits in the overall plan)
  - Relevant file paths and code
  - No conversational history from the coordinator session

The SKILL.md explicitly says: **"Never make subagent read plan file (provide full text instead)."**  
This is efficiency-critical: the coordinator has already read and extracted everything, so the subagent shouldn't redundantly re-read large files.

### Context Isolation Benefits

| Benefit | Mechanism |
|---------|-----------|
| No context pollution | Subagent never sees coordinator session history |
| Focused execution | Subagent gets only what's needed for its task |
| Parallel safety | Subagents don't interfere with each other |
| Better reasoning | Smaller context = less noise = more reliable output |
| Cost efficiency | Cheap/fast models for mechanical tasks, expensive models for design |

### Model Selection Strategy

The SKILL.md contains explicit guidance on matching model capability to task complexity:

| Task Type | Signal | Model |
|-----------|--------|-------|
| Mechanical implementation | Isolated functions, clear specs, 1-2 files | Cheapest/fastest |
| Integration | Multi-file coordination, pattern matching, debugging | Standard |
| Architecture/design/review | Judgment, broad codebase understanding | Most capable |

> "**Most implementation tasks are mechanical when the plan is well-specified.**"

This reflects an important insight: a well-written plan transforms an inherently judgment-heavy task (implementation) into a mechanical execution task, enabling use of cheaper models.

---

## 8. The Full Skill Stack

### Core Workflow Skills (Sequential)

```
brainstorming
    └─→ using-git-worktrees
            └─→ writing-plans
                    └─→ subagent-driven-development (recommended) 
                    └─→ executing-plans (alternative)
                            └─→ test-driven-development (active throughout)
                            └─→ requesting-code-review (between tasks)
                                    └─→ finishing-a-development-branch
```

### All Skills in the Library

**Testing**
- `test-driven-development` — RED-GREEN-REFACTOR cycle with anti-patterns reference

**Debugging**
- `systematic-debugging` — 4-phase root cause process (root-cause-tracing, defense-in-depth, condition-based-waiting)
- `verification-before-completion` — Ensure it's actually fixed

**Collaboration**
- `brainstorming` — Socratic design refinement
- `writing-plans` — Detailed implementation plans
- `executing-plans` — Batch execution with checkpoints
- `dispatching-parallel-agents` — Concurrent subagent workflows
- `requesting-code-review` — Pre-review checklist
- `receiving-code-review` — Responding to feedback
- `using-git-worktrees` — Parallel development branches
- `finishing-a-development-branch` — Merge/PR decision workflow
- `subagent-driven-development` — Fast iteration with two-stage review

**Meta**
- `writing-skills` — Create new skills following best practices
- `using-superpowers` — Introduction to the skills system

### Supported Platforms

| Platform | Installation Method |
|----------|---------------------|
| Claude Code (Official) | `/plugin install superpowers@claude-plugins-official` |
| Claude Code (Marketplace) | `/plugin marketplace add obra/superpowers-marketplace` → `/plugin install superpowers@superpowers-marketplace` |
| Cursor | `/add-plugin superpowers` or search plugin marketplace |
| Codex | Fetch INSTALL.md URL and follow instructions |
| OpenCode | Fetch INSTALL.md URL and follow instructions |
| Gemini CLI | `gemini extensions install https://github.com/obra/superpowers` |

---

## 9. Subagent-Driven Development — Deep Mechanics

Source: [SKILL.md on GitHub](https://github.com/obra/superpowers/blob/main/skills/subagent-driven-development/SKILL.md)

### Per-Task Loop (The Core Unit)

```
For each task:
  1. Dispatch implementer subagent (implementer-prompt.md)
     → If questions: answer, re-dispatch
     → Implements, tests, commits, self-reviews
  2. Dispatch spec compliance reviewer (spec-reviewer-prompt.md)
     → ❌ Issues found: implementer fixes, spec reviewer re-reviews
     → ✅ Approved: proceed to code quality review
  3. Dispatch code quality reviewer (code-quality-reviewer-prompt.md)
     → ❌ Issues found: implementer fixes, code quality reviewer re-reviews
     → ✅ Approved: mark task complete in TodoWrite
  4. Mark task complete, proceed to next task
```

**Critical ordering rule:** Code quality review does NOT begin until spec compliance is ✅. Starting code quality review before spec compliance approval is an explicit "Red Flag" in the SKILL.md.

### The Two-Stage Review: Why Two Distinct Reviewers?

**Spec Compliance Review** answers: *Did the implementer build what the spec says, and ONLY what the spec says?*
- Looks for missing features (spec requirements not implemented)
- Looks for extra features (implementations not in spec)
- Does NOT evaluate code style or quality

**Code Quality Review** answers: *Is the implementation well-constructed?*
- Code clarity, naming, structure
- Test coverage
- Absence of magic numbers, inline comments, dead code
- Performance/security concerns (at appropriate severity)
- Does NOT re-evaluate spec conformance

Separating these concerns prevents review confusion: the spec compliance reviewer doesn't get distracted by code style, and the code quality reviewer doesn't debate whether features belong in scope.

### Four Implementer Status Codes

| Status | Meaning | Coordinator Action |
|--------|---------|-------------------|
| `DONE` | Task complete | Proceed to spec compliance review |
| `DONE_WITH_CONCERNS` | Complete but with flagged doubts | Read concerns — address if about correctness/scope; note if observational |
| `NEEDS_CONTEXT` | Missing information | Provide context and re-dispatch |
| `BLOCKED` | Cannot complete task | Assess: more context? More capable model? Smaller task? Escalate? |

### The "Never" List (Failure Modes to Avoid)

The SKILL.md's Red Flags section — a notable list of things the framework explicitly forbids:

- Never start implementation on main/master without explicit user consent
- Never skip spec compliance OR code quality review
- Never proceed with unfixed issues
- Never dispatch multiple implementation subagents in parallel (file conflicts)
- Never make subagents read the plan file (provide full text instead)
- Never skip scene-setting context for subagents
- Never ignore subagent questions (answer before proceeding)
- Never accept "close enough" on spec compliance
- Never skip re-review after fixes
- Never let implementer self-review replace actual review (both are needed)
- Never start code quality review before spec compliance is ✅
- Never move to next task while either review has open issues

### Final Review After All Tasks

After all tasks complete, the workflow dispatches a **final code-reviewer subagent** to evaluate the entire implementation holistically before transitioning to `finishing-a-development-branch`.

---

## 10. Writing Plans — Granularity Standards

Source: [SKILL.md on GitHub](https://github.com/obra/superpowers/blob/main/skills/writing-plans/SKILL.md)

### The Addressee

Plans are written for a hypothetical "enthusiastic junior engineer with poor taste, no judgement, no project context, and an aversion to testing." This framing is intentional: it forces maximum explicitness. The SKILL.md:

> "Document everything they need to know: which files to touch for each task, code, testing, docs they might need to check, how to test it."

### Bite-Sized Task Definition

Each task in the plan corresponds to **one action, taking 2-5 minutes**. The SKILL.md decomposes a single TDD cycle into five separate steps:

```
1. "Write the failing test" — step
2. "Run it to make sure it fails" — step  
3. "Implement the minimal code to make the test pass" — step
4. "Run the tests and make sure they pass" — step
5. "Commit" — step
```

### Required Task Structure

Every task must contain:
- **Files:** Exact paths to create/modify/test
- **Test step:** Complete test code
- **Run command:** Exact command with expected output
- **Implementation:** Complete code, not pseudocode or "add validation"
- **Verification:** Exact command and expected output
- **Commit step:** Exact git add/commit commands

### File Structure First

Before any task is defined, the plan maps out which files will be created/modified and what each one is responsible for. This locks in decomposition decisions before implementation begins. Design principles:
- Each file has one clear responsibility
- Files that change together live together
- Split by responsibility, not by technical layer

### Plan Document Header (Mandatory)

```markdown
# [Feature Name] Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development 
> (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** [One sentence]
**Architecture:** [2-3 sentences]  
**Tech Stack:** [Key technologies]
---
```

---

## 11. Git Worktrees Integration

Source: [SKILL.md on GitHub](https://github.com/obra/superpowers/blob/main/skills/using-git-worktrees/SKILL.md)

Git worktrees activate after design approval and BEFORE any implementation. They create isolated workspace branches that share the same repository.

### Directory Selection Priority

1. Check for existing `.worktrees/` directory (preferred, hidden)
2. Check for existing `worktrees/` directory
3. Check `CLAUDE.md` for user preference
4. Ask user (choice between project-local `.worktrees/` or global `~/.config/superpowers/worktrees/`)

### Safety Verification (Mandatory)

For project-local directories, the skill verifies via `git check-ignore` that the worktree directory is in `.gitignore`. If not: add it, commit the change, then create the worktree.

> "Fix broken things immediately." (Jesse's rule, cited in SKILL.md)

### Baseline Verification

After creating the worktree and running project setup (npm install / cargo build / etc.), the skill runs the existing test suite:
- If tests pass: report and proceed
- If tests fail: report failures and ask whether to proceed or investigate

This is critical: without a clean baseline, new bugs cannot be distinguished from pre-existing issues.

### Value for Parallel Work

Git worktrees allow starting multiple parallel tasks on the same project without branches clobbering each other. Each Superpowers session can work in its own isolated worktree simultaneously.

---

## 12. Community Reception — Real User Voices

### GitHub Stats (March 2026)

- **98,200+ stars** (the BetterStack article cited ~50K when published in February 2026; growth has been explosive)
- **7,800+ forks**
- **385 commits**
- **27 contributors**
- Listed as #2 fastest-growing GitHub project in March 2026 (per [X/Twitter user bolcoto](https://x.com/bolcoto/status/2032876235919946118), 81.7K stars at time of that post)

### Positive Feedback Themes

**Structured discipline preventing rushing:**
From [Reddit r/ClaudeCode](https://www.reddit.com/r/ClaudeCode/comments/1r9y2ka/claude_codes_superpowers_plugin_actually_delivers/), 182 upvotes:
> "With Superpowers, each phase received the necessary focus. There was no hurrying through the process or neglecting validation. The results truly aligned with my initial vision."

**The sub-agent review catching bugs:**
From the [BetterStack article](https://betterstack.com/community/guides/ai/superpowers-framework/):
> "Remarkably, during its own internal review process, it identified and corrected a bug... 'Found and fixed one bug during review: the SSE parser in ArticleTab was using lines.indexOf() instead of properly tracking event/data fields sequentially.'"

**Context preservation advantage:**
From the [Classmethod article](https://dev.classmethod.jp/en/articles/2026-03-17-superpowers-brainstorming/):
> "Even with work spanning 260 turns, the maximum context was 142k tokens (71% of 200k)."

**Specification clarity through dialogue:**
From the Classmethod demo:
> "As you answer, specifications that were initially vague become clear through the dialogue. The specification document produced through the conversation is a single file summarizing only the current changes. There's no need to read an entire massive specification document."

**Non-developer use case:**
From r/ClaudeCode:
> "Brainstorming feature within superpowers is especially beneficial [for research]." (Not just for code)

### HackerNews Discussions

**October 2025 thread** ([HN 45547344](https://news.ycombinator.com/item?id=45547344)) — mixed reception with substantive debate:

*Positive:*
- "The ability to isolate context-noisy subtasks... unlocks much longer-running loops, and therefore much more complex tasks."
- "I would say that systems like this are about getting the agent to correctly choose the precisely correct context snippet for the exact subtask it's doing at a given point within a larger workflow."

*Skeptical:*
- "I'm not fully convinced that this concept of skills is that much better than having custom commands+sub-agents."
- "Some of these skills are probably better as programmed workflows that the LLM is forced to go through to improve reliability/consistency... rather than using English to guide the LLM and trusting it to follow the prescribed set of steps needed."
- "This is voodoo. It likely works - but knowing that YAGNI is a thing, means at some level you are invoking a cultural touchstone for a very specific group of humans."

*Cynical:*
- "The best of them are rediscovering basic software project management and post about it on every social media site... 'Turns out if you plan first, then iterate on the plan and split the plan into manageable chunks, development is a lot smoother!!!'"

**March 2026 thread** ([HN 47341827](https://news.ycombinator.com/item?id=47341827)) — notably shorter/quieter, mostly linking to the main description without the same debate. The framework had by then become more mainstream.

### Simon Willison's Notes

Simon Willison (noted LLM researcher) commented on the October 2025 HN thread: "Spend some time digging around in his Superpowers repo" and wrote independent notes at simonwillison.net — a signal of technical credibility.

### Workflow Pragmatism from Users

From [r/ClaudeCode workflow thread](https://www.reddit.com/r/ClaudeCode/comments/1qn7d67/superpowers_workflow_question_brainstorm_plan/):
- Users asking if they need the full flow for minor tasks (pragmatic concern)
- Common answer: "I can relate — requiring generate ideas and create a plan beforehand means fewer errors. Without this initial structure, Claude tends to struggle."
- Some users prefer just brainstorming and asking "Should we create a plan for this, or can we proceed directly?"

---

## 13. Limitations and Known Weaknesses

### Limitation 1: LLM Compliance Is Not Guaranteed

The most fundamental criticism. From [HackerNews, October 2025](https://news.ycombinator.com/item?id=45547344):

> "Some of these skills are probably better as programmed workflows that the LLM is forced to go through to improve reliability/consistency, that's what I've found in my own agents, rather than using English to guide the LLM and trusting it to follow the prescribed set of steps needed."

The framework uses Markdown instructions that *tell* the LLM what to do. The LLM can and sometimes does deviate — especially when under pressure (as Jesse himself demonstrated with the time-pressure test scenarios where even the framework's own test subagents tried to skip skill lookups).

The framework combats this with persuasion engineering (authority framing, commitment mechanics) but cannot achieve the compliance guarantees of hard-coded workflows.

### Limitation 2: "Blazing Through" Without Stopping

From the [GitHub first-user impressions issue #655](https://github.com/obra/superpowers/issues/655):

> "Claude Code seems to generally be blazing through on its own without ever stopping to ask me stuff if things aren't going according to plan... I think Superpowers might be designed to run in autonomous/YOLO mode as much as possible once the planning is done. Well I don't think LLMs are good enough yet for that to be a desirable thing."

The framework optimizes for autonomous execution (subagent-driven, minimal human interruption) — but users who want to be more in the loop during implementation may find this frustrating.

### Limitation 3: Doesn't Ask Enough Questions During Planning

Same GitHub issue:

> "Didn't ask me questions about how testing should be done at any time during planning (the user has to provide certain inputs or you can't test the tool at all). I had to volunteer the information after-the-fact when I saw it got to the end without even asking me."

The brainstorming skill relies on the LLM to recognize what questions to ask. It can miss domain-specific questions that the user would have known were important.

### Limitation 4: No Guidance on When to Clear Context

From the same GitHub issue:

> "It provides no guidance as to when context can safely be cleared (/clear) between phases... Is the 80k of context from the 1st phase relevant to make subsequent phases more successful? Or does Superpowers 'start over' with a new task, but the new task is being appended to 80k tokens of baggage that will degrade the accuracy of future generation?"

Unlike some competing frameworks (like GSD, which explicitly says "Phase X complete, you can clear context"), Superpowers doesn't emit clear context-management signals to the user.

### Limitation 5: Plugin Duplication Bug (Infrastructure Issue)

From [Reddit r/ClaudeAI PSA post](https://www.reddit.com/r/ClaudeAI/comments/1rij9tr/psa_your_claude_code_plugins_are_probably_loading/):

> "When plugins are updated, old directory remains in ~/.claude/plugins/cache/. Claude Code retrieves skills from every cached version, not just the one specified in installed_plugins.json. Consequently, every skill appears twice in the system prompt."

This is not a Superpowers bug per se — it's a Claude Code platform bug — but it affects Superpowers users by doubling their context consumption. Workarounds exist (manual cache cleanup scripts) but require technical knowledge.

### Limitation 6: Interference with Claude Code's Native Plan Mode

From the [Reddit r/ClaudeCode issues thread](https://www.reddit.com/r/ClaudeCode/comments/1quczts/issues_with_obrasuperpowers/):

> "Since CC version ~2.1.44, it began to exit plan mode unexpectedly. To address this, I simply modified the write-plan and brainstorming documentation to prevent interference with Claude's new 'auto-plan' mode during the planning phase."

Claude Code's native plan mode and Superpowers' planning phase can conflict, causing unexpected context clears. A fork (velzuperpowers) addressed this but it's maintained independently.

### Limitation 7: Claude Code Built-in /btw Command Conflict

From [GitHub issue #35585](https://github.com/anthropics/claude-code/issues/35585):

> "The superpowers plugin intercepts all slash commands and attempts to resolve them as skills. This causes a conflict with Claude Code's built-in /btw command."

The skill resolution mechanism is too greedy and can intercept built-in Claude Code commands.

### Limitation 8: Incomplete Plugin Cache on Installation

From [GitHub issue #818](https://github.com/obra/superpowers/issues/818) (filed March 19, 2026 — one day before this research):

> "When the superpowers plugin is installed via Claude Code's plugin system, the skills/ directory is sometimes cloned incompletely. Only a subset..."

A fresh installation reliability issue affecting some users.

### Limitation 9: Token Overhead

From the [Firecrawl article on Claude Code skills](https://www.firecrawl.dev/blog/best-claude-code-skills):

> "**Cons:** The structured workflow requires setup time. Vague ideas produce thrashing. Best for projects with clear requirements where you want systematic execution rather than exploratory prototyping."

The overhead of brainstorming, spec review loops, plan writing, and two-stage reviews per task adds real cost in time and tokens. For simple tasks, the overhead can exceed the cost of just writing the code directly.

### Limitation 10: Domain-Dependent Quality Gap

From [HackerNews October 2025](https://news.ycombinator.com/item?id=45547344):

> "I have found Claude Code and Codex to be tremendously helpful for my web development work. But my results for writing Zig are much worse. The gap in usefulness of agents between tasks is very big."

Superpowers inherits the underlying model's domain capabilities. The framework helps with process discipline but can't compensate for model weaknesses in specific languages or domains.

### Limitation 11: Requires Clear Requirements to Shine

The Firecrawl review makes this explicit: "Vague ideas produce thrashing." Superpowers is optimized for **systematic execution of known requirements**, not exploratory prototyping where requirements evolve rapidly through code.

---

## 14. Underlying Design Philosophy

### Four Core Philosophical Pillars

| Pillar | Expression |
|--------|-----------|
| Test-Driven Development | Write tests first, always. The RED-GREEN-REFACTOR cycle is non-negotiable. |
| Systematic over ad-hoc | Process over guessing. Skills provide the process. |
| Complexity reduction | Simplicity as primary goal. YAGNI. One responsibility per unit. |
| Evidence over claims | Verify before declaring success. "Verification-before-completion" is a skill. |

### The Skill Architecture Innovation

The most philosophically interesting aspect: **skills can create new skills**. The `writing-skills` meta-skill teaches the agent how to codify new workflows into the framework. Jesse Vincent described extracting skills from books by asking Claude to "Read this. Think about it. Write down the new stuff you learned." This creates a compounding system.

Claude's own reflection (from Jesse's blog, Claude's "feelings journal"):

> "Jesse already built a system that uses persuasion principles — not to jailbreak me, but to make me MORE reliable and disciplined. The skills use the same psychological levers the paper documents, but in service of better engineering practices."

### The "Enthusiastic Junior Engineer" Frame

Plans are written for an agent with "zero context and questionable taste." This is intentional engineering of the planning output — forcing completeness. If the plan is complete enough for a low-context agent, it's complete enough for any agent.

### Design for Isolation

A recurring principle across multiple skills:

> "Break the system into smaller units that each have one clear purpose, communicate through well-defined interfaces, and can be understood and tested independently. For each unit, you should be able to answer: what does it do, how do you use it, and what does it depend on?"

This applies to both code architecture AND the framework itself: each skill has one clear purpose, communicates through well-defined interfaces (SKILL.md format), and can be understood independently.

### "Fix Broken Things Immediately" (Jesse's Rule)

Cited directly in the git-worktrees SKILL.md: if a directory isn't in `.gitignore`, fix it before creating the worktree. Don't defer. This "pay it now" philosophy prevents technical debt accumulation — applied at the workflow level, not just the code level.

---

## 15. Competitive Landscape

### Alternative Frameworks Mentioned by Community

| Framework | Key Differentiator | Community Notes |
|-----------|-------------------|-----------------|
| **Superpowers** | Most comprehensive SDLC coverage, multi-agent execution | Largest, most mature; some concerns about overhead |
| **GSD (Getting Shit Done)** | Explicit phase boundaries, handoff/pause commands, research phase | Preferred by non-developers; explicit context-clear signals |
| **Spec Kit / Spec Kitty** | Spec-first with worktree and merging | Lighter weight; interoperable with Superpowers structure |
| **Getting-it-done** | Additional phases, more progress tracking context | More phases than Superpowers |
| **velzuperpowers** (fork) | Claude Code native tasks integration | Fork of Superpowers; fixes plan-mode conflicts |

### Firecrawl's Assessment

From the [Firecrawl best Claude Code skills article](https://www.firecrawl.dev/blog/best-claude-code-skills):

> "Superpowers is the most complete multi-agent development workflow available as a Claude skill... One of the few skill collections with proper multi-hour autonomous capability baked into the workflow."

---

## Summary: Key Insights

| Question | Answer |
|----------|--------|
| **What makes Superpowers different from prompting?** | Skills are mandatory workflow files — the agent MUST use them, structured through hard gates, review loops, and sequential dependencies |
| **Is YAGNI structurally enforced?** | Partly — spec compliance review actively catches extras, but ultimate enforcement is LLM-dependent |
| **Why one question at a time?** | Cognitive load reduction, progressive disclosure, commitment mechanics, error isolation, and form completion psychology |
| **When does it skip the full spec?** | For truly small tasks, the spec can be a few sentences; for subsystem-spanning requests, it redirects to decomposition first |
| **How does fresh context work?** | Controller session orchestrates, subagents receive exactly constructed context (no history), enabling 260-turn sessions under 142k tokens |
| **What are the real weaknesses?** | LLM compliance not guaranteed; overhead for simple tasks; blazes through implementation without checking in; context-clear guidance absent |
| **What's the community verdict?** | Strong practical results, 98K+ stars, but legitimate skepticism about "why not just code" and the inherent fragility of English-language workflow constraints |

---

## Sources

1. **Primary SKILL.md — Brainstorming:** https://github.com/obra/superpowers/blob/main/skills/brainstorming/SKILL.md
2. **Primary SKILL.md — Subagent-Driven Development:** https://github.com/obra/superpowers/blob/main/skills/subagent-driven-development/SKILL.md
3. **Primary SKILL.md — Writing Plans:** https://github.com/obra/superpowers/blob/main/skills/writing-plans/SKILL.md
4. **Primary SKILL.md — Using Git Worktrees:** https://github.com/obra/superpowers/blob/main/skills/using-git-worktrees/SKILL.md
5. **Superpowers GitHub Repository:** https://github.com/obra/superpowers
6. **Jesse Vincent's Origin Blog Post (October 2025):** https://blog.fsck.com/2025/10/09/superpowers/
7. **BetterStack Practical Guide (February 2026):** https://betterstack.com/community/guides/ai/superpowers-framework/
8. **Classmethod Brainstorming Article (March 2026):** https://dev.classmethod.jp/en/articles/2026-03-17-superpowers-brainstorming/
9. **HackerNews — October 2025 thread:** https://news.ycombinator.com/item?id=45547344
10. **HackerNews — March 2026 thread:** https://news.ycombinator.com/item?id=47341827
11. **Reddit r/ClaudeCode — Plugin delivers:** https://www.reddit.com/r/ClaudeCode/comments/1r9y2ka/claude_codes_superpowers_plugin_actually_delivers/
12. **Reddit r/ClaudeCode — Workflow question:** https://www.reddit.com/r/ClaudeCode/comments/1qn7d67/superpowers_workflow_question_brainstorm_plan/
13. **Reddit r/ClaudeAI — Plugin duplication PSA:** https://www.reddit.com/r/ClaudeAI/comments/1rij9tr/psa_your_claude_code_plugins_are_probably_loading/
14. **GitHub Issue #655 — First user impressions:** https://github.com/obra/superpowers/issues/655
15. **GitHub Issue #818 — Incomplete plugin cache:** https://github.com/obra/superpowers/issues/818
16. **GitHub Issue (Claude Code) — /btw conflict:** https://github.com/anthropics/claude-code/issues/35585
17. **Firecrawl — Best Claude Code Skills:** https://www.firecrawl.dev/blog/best-claude-code-skills
18. **X/Twitter — Fastest growing GitHub projects:** https://x.com/bolcoto/status/2032876235919946118
19. **Nielsen Norman Group — Cognitive Load in Forms:** https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/
