# GSD (Get Shit Done) Framework — Deep Dive

**Research date:** March 20, 2026  
**Primary source:** [github.com/gsd-build/get-shit-done](https://github.com/gsd-build/get-shit-done/blob/main/README.md)  
**Creator:** Lex Christopherson (aka TÂCHES / glittercowboy)  
**Current status:** ~31,000+ GitHub stars; GSD v2 released as standalone CLI (March 2026)

---

## Table of Contents

1. [What GSD Is — And What Problem It Solves](#1-what-gsd-is)
2. [GSD's Core Philosophy](#2-philosophy)
3. [The Discuss Phase](#3-the-discuss-phase) ← GSD's Most Unique Contribution
4. [--batch Mode](#4-batch-mode)
5. [The Research Phase](#5-the-research-phase)
6. [The Plan Phase](#6-the-plan-phase)
7. [Wave Execution Model](#7-wave-execution-model)
8. [The Execute Phase — Per-Agent Protocol](#8-the-execute-phase)
9. [Fresh 200K Context Windows](#9-fresh-200k-context-windows)
10. [The Verify Phase](#10-the-verify-phase)
11. [Context Engineering — The Full File Architecture](#11-context-engineering)
12. [Technical Internals](#12-technical-internals)
13. [GSD v2 — The Evolution](#13-gsd-v2)
14. [Community Reception](#14-community-reception)
15. [Limitations and Weaknesses](#15-limitations-and-weaknesses)
16. [Framework Comparisons](#16-framework-comparisons)

---

## 1. What GSD Is

GSD is a **meta-prompting, context engineering, and spec-driven development system** built on top of Claude Code (and now also OpenCode, Gemini CLI, Codex, GitHub Copilot, and Antigravity). It is not a separate runtime — it is approximately 50 Markdown files, a lightweight Node.js CLI helper, and 2 hooks that orchestrate Claude Code's native features (slash commands, sub-agents, the Task tool, file system) into a complete software development lifecycle.

The core problem GSD solves is called **context rot**: the quality degradation that occurs when Claude's 200,000-token context window fills up during a long coding session. As described by the creator on [Reddit](https://www.reddit.com/r/ClaudeAI/comments/1qf6u3f/ive_massively_improved_gsd_get_shit_done/):

> **At 10% context usage:** Peak quality, thorough work  
> **At 30–50%:** Good but starting to rush  
> **At 50–70%:** Corner-cutting, missed requirements  
> **At 70%+:** Hallucinations, forgotten constraints, drifting focus

Without GSD (or similar frameworks), a developer starts a project in a single long Claude session, the first few tasks go well, context fills up, quality silently degrades, and the developer is forced to restart and lose context repeatedly. [The GSD README](https://github.com/gsd-build/get-shit-done/blob/main/README.md) calls vibecoding's bad reputation a direct consequence of this failure mode.

**GSD's solution in one sentence:** Break work into phases, break phases into small plans (2–3 tasks each), and execute every plan inside a *fresh* 200K-token sub-agent context. The orchestrating session itself never exceeds 30–40% context utilization.

---

## 2. GSD's Core Philosophy

### "Discuss First, Plan Second, Execute Third"

This three-stage sequence is deliberate and non-negotiable in GSD's design. The README states the philosophy plainly: *"The complexity is in the system, not in your workflow."*

**Why this order matters:**

1. **Discuss first** captures your *preferences* — not just requirements, but the specific visual, behavioral, and structural decisions that distinguish *your* vision from "reasonable defaults." Claude without explicit preferences will make assumptions. Those assumptions compound across hundreds of tasks. By surfacing and locking decisions *before* any research or planning begins, GSD prevents an entire class of rework.

2. **Plan second** (with research embedded) creates a precise, verified, XML-structured task definition for each sub-agent. The plan is not documentation — it is the *actual prompt* the sub-agent runs. Planning happens *after* discussion because the researcher and planner both consume `CONTEXT.md` from the discuss phase.

3. **Execute third** means no code is written until a plan has passed a planner→checker→revise verification loop. Sub-agents implement against a specification that has already been validated for completeness and dependency correctness.

This sequence solves what the creator describes as "the 'that's not what I meant' loop that eats entire sessions." As noted by [daita.io](https://www.daita.io/blog/get_shit_done_claude_code): *"Most spec-driven tools go straight from requirements to implementation. GSD adds a conversation layer where you shape the implementation before any code is written."*

### No Enterprise Theater

GSD explicitly positions itself against frameworks like BMAD (21+ agents, sprint ceremonies, story points, Jira workflows). Per the [README](https://github.com/gsd-build/get-shit-done/blob/main/README.md): *"I'm not a 50-person software company. I don't want to play enterprise theater."* The target user is a solo developer or small team building something non-trivial.

---

## 3. The Discuss Phase

**Command:** `/gsd:discuss-phase <N>`  
**Output:** `{phase_num}-CONTEXT.md`

The discuss phase is GSD's most unique and differentiating contribution. It is designed to solve a specific problem: a roadmap contains only one or two sentences per phase — far too little context to build something *the way you imagine it*. The discuss phase systematically extracts that missing context before research or planning begins.

### How It Works

The system analyzes what type of thing is being built in the phase, then identifies the category-specific gray areas that typically require decisions:

| Phase Type | Gray Areas Surfaced |
|---|---|
| Visual features | Layout density, interaction patterns, empty states, responsive behavior |
| APIs/CLIs | Response format, flag behavior, error message wording, verbosity levels |
| Content systems | Document structure, tone, depth, navigation flow |
| Organization tasks | Grouping criteria, naming conventions, how duplicates are handled |

For each gray area the system identifies, it asks targeted questions — one at a time, iteratively — until the user confirms they are satisfied with the captured context.

### CONTEXT.md — Structure and Purpose

`CONTEXT.md` (named `{phase_num}-CONTEXT.md`) is the output artifact of the discuss phase. Based on what is known from the README, community documentation, and usage reports, it captures:

**Locked decisions** — Explicit choices that were made and are now fixed. These become hard constraints in both the research and planning phases. Example: *"Infinite scroll decided → plan includes scroll handling. Card layout chosen → research investigates card component libraries."*

**Open questions** — Items that remain undecided, which the researcher may investigate and the planner will handle with sensible defaults or will flag for the user.

The distinction matters because:
- **Locked decisions** → The planner must implement them exactly. No deviation, no "creative interpretation."
- **Open questions** → The researcher investigates best practices; the planner picks the strongest option.

### How CONTEXT.md Feeds Downstream

CONTEXT.md is consumed by two subsequent steps:

1. **The Researcher reads it** — Knows what *specific patterns* to investigate rather than doing generic domain research. If you decided on a card layout, the researcher looks at card component libraries. If you specified a particular error message format, the researcher investigates error handling patterns for that format.

2. **The Planner reads it** — Knows which decisions are locked (cannot change them) and which are open (can apply judgment). Per the [README](https://github.com/gsd-build/get-shit-done/blob/main/README.md): *"The deeper you go here, the more the system builds what you actually want. Skip it and you get reasonable defaults. Use it and you get your vision."*

### The `--auto` Flag

`/gsd:discuss-phase <N> --auto` skips interactive questioning and uses the roadmap context alone. This is for cases where the developer has already captured sufficient detail or wants to defer all decisions to the planner.

### A LinkedIn/Community Assessment

From a [LinkedIn post by Ben Selleslagh](https://www.linkedin.com/posts/benselleslagh_ive-been-testing-the-just-released-agent-activity-7425308257797181440-qSAC): *"Every gray area gets resolved. Output = CONTEXT.md. One CONTEXT.md feeds every agent."* This highlights a key property: CONTEXT.md is the single shared truth that eliminates per-agent divergence during execution.

---

## 4. `--batch` Mode

**Command:** `/gsd:discuss-phase <N> --batch`

### What It Is

The `--batch` flag changes the interaction mode of the discuss phase from **one-by-one sequential questioning** to **grouped question sets**. Instead of asking each gray area question individually and waiting for a response, it presents a small grouped set of questions together for the user to answer at once.

Per the [GSD README](https://github.com/gsd-build/get-shit-done/blob/main/README.md): *"If you want faster intake during discussion, use `/gsd:discuss-phase <n> --batch` to answer a small grouped set of questions at once instead of one-by-one discussion."*

### One-by-One vs. Batch — Trade-offs

| Dimension | One-by-one (default) | `--batch` |
|---|---|---|
| **Depth** | Deep — each answer can prompt follow-up questions | Shallower — no follow-ups within the batch |
| **Speed** | Slower — iterative conversation | Faster — fewer round-trips |
| **Quality of capture** | Higher — nuanced preferences emerge through dialogue | Lower — first-answer-only, no clarification loops |
| **Best for** | Complex UI/feature phases with many interdependent decisions | Simple phases, or when you know your preferences precisely |
| **User experience** | More like a design consultation | More like filling out a form |

The creator's intent is clear from how the README presents this: batch is described as the *speed* option for users who want *faster intake*, implying one-by-one is the default recommended path for getting full value from the discuss phase. As [dev.to notes](https://dev.to/alikazmidev/the-complete-beginners-guide-to-gsd-get-shit-done-framework-for-claude-code-24h0): *"Spend 5–10 minutes in the discussion phase. It saves hours of back-and-forth."*

---

## 5. The Research Phase

**Embedded in:** `/gsd:plan-phase` (and `/gsd:new-project`)  
**Output:** `{phase_num}-RESEARCH.md` + `.planning/research/` at project init

The research phase is not a separate user-facing command — it is an *orchestrated sub-step* that runs automatically within plan-phase (unless disabled with `--skip-research`). It is configurable via `workflow.research: true/false` in `.planning/config.json`.

### At Project Initialization (`/gsd:new-project`)

Four parallel research agents are spawned simultaneously, each investigating a different dimension:

1. **Stack research** — *"What's the standard 2025 stack for [domain]?"* → Writes to `.planning/research/STACK.md`
2. **Features research** — Existing solutions, patterns, comparable implementations
3. **Architecture research** — Structural patterns, component relationships
4. **Pitfalls research** — Known failure modes, gotchas, anti-patterns to avoid

These four agents run in parallel (Wave 1 of the research orchestration). When all four complete, a **Synthesizer agent** runs (Wave 2) to distill findings into a `SUMMARY.md`. Then a **Roadmapper agent** (Wave 3) uses the synthesis plus requirements to create the roadmap.

Per the [Codecentric analysis](https://www.codecentric.de/en/knowledge-hub/blog/the-anatomy-of-claude-code-workflows-turning-slash-commands-into-an-ai-development-system): *"The pattern is always: parallelize independent work, sequence dependent work. Communication between agents happens exclusively via files."*

### At Plan Phase (`/gsd:plan-phase`)

Research here is **targeted** rather than broad. The researcher reads `CONTEXT.md` (from the discuss phase) before investigating, so it knows exactly what patterns to look for — not generic domain research, but specific questions raised by the user's decisions and the phase's requirements.

### Agent Identity Architecture

Research agents in GSD are not just prompts — they are full agent definitions loaded from `.claude/agents/gsd-project-researcher.md`. Per the [Codecentric post](https://www.codecentric.de/en/knowledge-hub/blog/the-anatomy-of-claude-code-workflows-turning-slash-commands-into-an-ai-development-system), each agent definition contains:
- `<role>`: Mission and output consumers
- `<philosophy>`: "Be comprehensive but opinionated. 'Use X because Y', not 'Options are X, Y, Z'"
- `<tool_strategy>`: When to use which tool
- `<output_formats>`: Exact templates
- `<execution_flow>`: Step-by-step process
- `<success_criteria>`: Completion checklist

---

## 6. The Plan Phase

**Command:** `/gsd:plan-phase <N>`  
**Output:** `{phase_num}-RESEARCH.md`, `{phase_num}-{N}-PLAN.md` (2–3 plans per phase)

### The Three-Step Planning Loop

1. **Research** — Targeted investigation guided by `CONTEXT.md`. Writes to `{phase_num}-RESEARCH.md`.
2. **Plan** — Creates 2–3 atomic task plans in XML structure.
3. **Verify** — A dedicated **plan-checker agent** verifies the plans against `REQUIREMENTS.md`, checking for requirement coverage, dependency graph correctness, and context budget. If the checker finds issues, it sends them back to the planner. Loop continues until plans pass.

The planner→checker→revise cycle was introduced after the creator grew frustrated watching plans execute that overlooked requirements or had broken dependencies. As he wrote on [Reddit](https://www.reddit.com/r/ClaudeAI/comments/1qf6u3f/ive_massively_improved_gsd_get_shit_done/): *"Plans are not executed until they pass verification. If the checker identifies any issues, the planner automatically resolves them."*

Importantly, from a [HackerNews comment](https://news.ycombinator.com/item?id=47417804): *"There is a gsd-plan-checker that runs before execution, but it only verifies logical completeness — requirement coverage, dependency graphs, context budget. It never looks at what commands will actually run."* This is a known limitation — the checker validates the spec, not the implementation.

### Plan Structure — XML Format

Each plan is an XML-structured file. The README gives this example:

```xml
<task type="auto">
  <name>Create login endpoint</name>
  <files>src/app/api/auth/login/route.ts</files>
  <action>
    Use jose for JWT (not jsonwebtoken - CommonJS issues).
    Validate credentials against users table.
    Return httpOnly cookie on success.
  </action>
  <verify>curl -X POST localhost:3000/api/auth/login returns 200 + Set-Cookie</verify>
  <done>Valid credentials return cookie, invalid return 401</done>
</task>
```

Key properties:
- **`<name>`** — Clear, atomic task name
- **`<files>`** — Explicit file targets. Sub-agents don't have to discover what to edit.
- **`<action>`** — Precise instructions. Library choices are specified with reasons (e.g., *"Use jose for JWT (not jsonwebtoken — CommonJS issues)"*). No ambiguity.
- **`<verify>`** — A concrete, runnable verification step (a curl command, a test assertion)
- **`<done>`** — The definition of done in human-readable form

XML is used deliberately. Per [daita.io](https://www.daita.io/blog/get_shit_done_claude_code): *"Claude performs significantly better with structured XML prompts than with freeform instructions."* Claude models are trained to recognize XML tags as structural boundaries, providing clearer sections than Markdown headers.

### Plan Sizing

Each plan is sized to be **completable within a single fresh context window**. The README explicitly states: *"Each plan is small enough to execute in a fresh context window. No degradation, no 'I'll be more concise now.'"* A phase produces 2–3 plans. This granularity is the mechanism by which context rot is prevented at the execution level.

### Skip Flags

- `/gsd:plan-phase --skip-research` — Skip the research sub-step (use if research was done recently)
- `/gsd:plan-phase --skip-verify` — Skip the plan-checker loop (faster, lower quality guarantee)

---

## 7. Wave Execution Model

This is GSD's answer to the question: *"How do you run multiple sub-agents efficiently without creating conflicts?"*

### Core Concept

Plans are assigned **wave numbers** during the planning phase, based on their dependency relationships. During execution:
- Plans in the **same wave** are independent of each other → run in **parallel**
- Plans in **later waves** depend on earlier waves → run **sequentially after their dependencies complete**

### The Wave Assignment Logic

Wave assignment follows a dependency analysis of the tasks being built:
- **No dependencies on other tasks in this phase** → Wave 1 (earliest possible execution)
- **Depends on Wave 1 tasks** → Wave 2
- **Depends on Wave 2 tasks** → Wave 3
- And so on...

From the creator's [Reddit explanation](https://www.reddit.com/r/ClaudeAI/comments/1qf6u3f/ive_massively_improved_gsd_get_shit_done/):
```
Wave 1: [plan01, plan02, plan03] → 3 agents work simultaneously
Wave 2: [plan04, plan05] → 2 agents in parallel (waiting for Wave 1)
Wave 3: [plan06] → 1 agent
```

A 6-plan phase thus completes in 3 rounds instead of 6. This is a meaningful time reduction when each plan takes 5–15 minutes to execute.

### The Wave Diagram (from README)

```
WAVE 1 (parallel)          WAVE 2 (parallel)       WAVE 3
┌─────────┐  ┌─────────┐   ┌─────────┐ ┌─────────┐  ┌─────────┐
│ Plan 01 │  │ Plan 02 │   │ Plan 03 │ │ Plan 04 │  │ Plan 05 │
│         │  │         │ → │         │ │         │→ │         │
│  User   │  │ Product │   │  Orders │ │  Cart   │  │Checkout │
│  Model  │  │  Model  │   │   API   │ │   API   │  │   UI    │
└─────────┘  └─────────┘   └─────────┘ └─────────┘  └─────────┘
     │              │           ↑           ↑              ↑
     └──────────────┴───────────┴───────────┘              │
         Dependencies: Plan 03 needs Plan 01               │
                       Plan 04 needs Plan 02               │
                       Plan 05 needs Plans 03 + 04         │
```

### Vertical Slices vs. Horizontal Layers

The README makes an explicit architectural recommendation that directly impacts wave efficiency:

**Vertical slices** (one plan = one complete feature end-to-end) → **Better parallelism**  
*Example: Plan 01 = User feature (model + API + UI together)*

**Horizontal layers** (one plan = all models, another plan = all APIs) → **Worse parallelism**  
*Example: Plan 01 = All models, Plan 02 = All APIs — these cannot run in parallel*

Why? Horizontal layers force sequential execution because Plan 02 (all APIs) depends on Plan 01 (all models). Vertical slices isolate feature concerns, allowing multiple features to build simultaneously.

### File Conflict Resolution

When tasks would modify the same files, GSD handles this through:
1. **Sequential plans** — Tasks that share files are placed in the same plan or in later waves
2. **Same plan** — Conflicting tasks are combined into a single plan

---

## 8. The Execute Phase — Per-Agent Protocol

**Command:** `/gsd:execute-phase <N>`  
**Output:** `{phase_num}-{N}-SUMMARY.md`, `{phase_num}-VERIFICATION.md`

### What Happens

1. The orchestrator reads all plans for the phase, determines their wave assignments
2. Wave 1 plans are dispatched to parallel sub-agents simultaneously
3. Each sub-agent receives a fresh 200K-token context window (see Section 9)
4. Each sub-agent implements its plan, runs the `<verify>` step, writes a `SUMMARY.md`
5. Each sub-agent makes an atomic git commit upon task completion
6. After Wave 1 completes, Wave 2 sub-agents are dispatched, and so on
7. After all waves complete, a Verifier agent runs goal-backward verification

### Self-Review and the Per-Agent Protocol

Each executor sub-agent operates with a defined protocol:
1. Read the plan file (XML-structured task definition)
2. Read `PROJECT.md` and the relevant `CONTEXT.md`
3. Read relevant existing code files (specified in `<files>`)
4. Implement the task per the `<action>` instructions
5. Run the `<verify>` step (curl command, test, etc.)
6. If verify passes → commit and write SUMMARY.md
7. If verify fails → fix and retry (up to configured max retries)

### Atomic Git Commits

Every task gets its own commit immediately after completion:

```
abc123f docs(08-02): complete user registration plan
def456g feat(08-02): add email confirmation flow
hij789k feat(08-02): implement password hashing
lmn012o feat(08-02): create registration endpoint
```

The commit format includes the phase and plan number. Benefits, per the [README](https://github.com/gsd-build/get-shit-done/blob/main/README.md):
- `git bisect` pinpoints the exact failing task
- Each task is independently revertable
- Clear history for Claude in future sessions
- Better observability in automated workflows

### Goal-Backward Verification

After all task execution completes, a **Verifier agent** runs and checks the codebase against the *phase goals* rather than the individual task completion status. This catches the failure mode where tasks are "done" but incomplete — orphaned files, missing integrations, partial implementations.

Per the creator: *"Completing tasks does not necessarily mean achieving the overall goal. GSD works backwards from the phase objective to identify orphaned files, missing integrations, and incomplete implementations."*

---

## 9. Fresh 200K Context Windows

This is described by multiple sources as GSD's "killer feature."

### The Problem Being Solved

The orchestrating session (main Claude Code session) accumulates context from all the discussion, research, and planning phases. Without sub-agents, executing 6 plans sequentially would push this session deep into the degraded-context zone. But the plans themselves are complex — they require reading multiple files, implementing logic, and running verifications.

### The Architecture

**Orchestrator:**
- Uses ~10–15% of context
- Reads plan *metadata* only (wave assignments, file names, dependency lists)
- Dispatches workers via Claude Code's `Task` tool
- Collects completion status from worker outputs
- *Never executes implementation work itself*

**Each Sub-Agent (per plan):**
- Gets a **fresh 200,000-token context window**
- Receives: the XML plan, `PROJECT.md`, phase `CONTEXT.md`, relevant source files (pre-loaded by orchestrator)
- Executes implementation
- Writes SUMMARY.md
- *Terminates* (does not accumulate context across tasks)

From the creator's [Reddit explanation](https://www.reddit.com/r/ClaudeAI/comments/1qf6u3f/ive_massively_improved_gsd_get_shit_done/):
> *"This ensures that the quality of Plan 5 remains on par with Plan 1."*

### Supporting Evidence

From the [daita.io analysis](https://www.daita.io/blog/get_shit_done_claude_code):
> *"Each executor subagent starts with a clean 200k context loaded only with the project spec, the specific plan, and relevant file contents. No accumulated garbage. No stale error messages. No 'let me be more concise' degradation."*

From a [LinkedIn post by Solomon Salo](https://www.linkedin.com/posts/guisalomao_this-framework-is-going-super-viral-and-it-activity-7433671751089221632-Xg2T):
> *"Task 50 has the same quality as Task 1."*

The main session "stays lean at 30–40% context utilization" even after extensive research and thousands of lines of code generation, because all heavy processing occurs in sub-agent contexts. This is the result that multiple independent reviewers corroborate: on a large phase, the primary session's context never exceeds ~40%.

### Context Quality Degradation — The Empirical Basis

The [dev.to beginner's guide](https://dev.to/alikazmidev/the-complete-beginners-guide-to-gsd-get-shit-done-framework-for-claude-code-24h0) provides a quality table observed from practice:

| Context Utilization | Quality |
|---|---|
| 0–30% | Peak quality, thorough work |
| 30–50% | Good but starting to rush |
| 50–70% | Corner-cutting, missed requirements |
| 70%+ | Hallucinations, forgotten constraints |

One YouTube reviewer [noted](https://www.youtube.com/watch?v=w2Btykxx8Fs): *"Once you pass the 50% mark, you're already getting degraded outputs no matter what agent you're using."*

---

## 10. The Verify Phase

**Command:** `/gsd:verify-work <N>`  
**Output:** `{phase_num}-UAT.md`, fix plans if issues found

### Two-Layer Verification

GSD uses two distinct verification mechanisms:

**Automated verification (built into execute-phase):**
- The Verifier agent checks that code exists, tests pass, and required files are present
- Goal-backward check: does the codebase actually deliver what the phase goal stated?

**Human UAT (the verify-work command):**
- Extracts testable deliverables from the phase goal
- Walks the user through them one at a time with yes/no questions ("Can you log in with email?")
- If something fails: spawns debug agents to find root causes
- Creates verified fix plans ready for re-execution with `/gsd:execute-phase`

The developer does not manually debug. If a UAT step fails, they just run execute-phase again with the generated fix plans.

*Note: The verify-work command was contributed by Reddit user OracleGreyBeard, per the README footnote.*

---

## 11. Context Engineering — The Full File Architecture

GSD's entire approach rests on using the filesystem as persistent memory. Claude has no memory between sessions — but files on disk do. Every key decision, state, and output is written to a structured `.planning/` directory.

| File | Purpose | Created By |
|---|---|---|
| `PROJECT.md` | Project vision, always loaded — the stable reference | `new-project` |
| `REQUIREMENTS.md` | Scoped v1/v2/out-of-scope requirements with phase traceability | `new-project` |
| `ROADMAP.md` | Phase structure, where you're going | `new-project` |
| `STATE.md` | Decisions, blockers, current position — enables instant session resume | Updated continuously |
| `config.json` | Workflow settings, model profiles, agent toggles | `new-project` |
| `.planning/research/` | Domain research (STACK.md, FEATURES.md, ARCH.md, PITFALLS.md, SUMMARY.md) | `new-project` researchers |
| `{N}-CONTEXT.md` | Locked decisions + open questions from discuss phase | `discuss-phase` |
| `{N}-RESEARCH.md` | Phase-specific targeted research | `plan-phase` |
| `{N}-{M}-PLAN.md` | Atomic XML task plan — the actual sub-agent prompt | `plan-phase` |
| `{N}-{M}-SUMMARY.md` | What happened, what changed, per-task history | Execute sub-agents |
| `{N}-VERIFICATION.md` | Evidence the phase goal was met | Execute verifier |
| `{N}-UAT.md` | Human test checklist + fix plans if needed | `verify-work` |

Per the [Codecentric post](https://www.codecentric.de/en/knowledge-hub/blog/the-anatomy-of-claude-code-workflows-turning-slash-commands-into-an-ai-development-system): *"The entire chain is traceable. If the roadmap looks weird, check SUMMARY.md. If the synthesis seems wrong, look into the individual research files."*

The first step of every sub-agent workflow is: **read `STATE.md`** — enabling instant context restoration in any new session, after any `/clear` command.

---

## 12. Technical Internals

### System Composition

GSD v1 (Claude Code edition) consists of:
- **29 slash commands** (skills) — the user-facing commands
- **12 custom agent definitions** — Researcher, Planner, Plan-Checker, Executor, Verifier, Debugger, etc.
- **2 hooks** — SessionStart (update checker) and PostToolUse (Prettier auto-format)
- **statusLine hook** — Persistent terminal status bar showing model, active task, context usage % (turns red when high)
- **Node.js helper scripts** — For deterministic state reads (does `.planning/` exist? what model profile? what phase number?) — *"Deterministic logic belongs in code, not in prompts"*

### Slash Command Structure

Each command is a Markdown file with:
```
---
name: gsd:new-project
description: Initialize a new project with deep context gathering
argument-hint: "[--auto]"
allowed-tools: [Read, Bash, Write, Task, AskUserQuestion]
---
<objective>
  What should be achieved
</objective>
<execution_context>
  @./workflows/new-project.md
  @./references/questioning.md
  @./templates/project.md
</execution_context>
<process>
  Execute the workflow end-to-end.
</process>
```

The command defines **WHAT** (permissions, goal). The referenced workflow file defines **HOW** (step-by-step). References are reusable knowledge modules. Templates define output file formats. This modularity means a single reference (e.g., "questioning techniques") can be loaded by any command that needs it.

### Agent Spawning Patterns

GSD uses two patterns for spawning sub-agents via Claude Code's `Task` tool:

1. **General-purpose with manual role assignment** — Spawned as `subagent_type="general-purpose"`, receives its role via the prompt's first instruction: *"Read `.claude/agents/gsd-project-researcher.md` for your role."* The four research agents use this pattern.

2. **Registered agent type** — Spawned as `subagent_type="gsd-roadmapper"`. Claude Code automatically loads the definition from `.claude/agents/gsd-roadmapper.md` — the agent knows its role before it sees the task prompt.

### Configuration

`.planning/config.json` controls the full workflow:

**Core settings:**
- `mode`: `yolo` (auto-approve everything) or `interactive` (confirm at each step)
- `granularity`: `coarse` / `standard` / `fine` — controls how finely scope is sliced

**Model profiles:**
| Profile | Planning | Execution | Verification |
|---|---|---|---|
| `quality` | Opus | Opus | Sonnet |
| `balanced` (default) | Opus | Sonnet | Sonnet |
| `budget` | Sonnet | Sonnet | Haiku |
| `inherit` | Current runtime | Current runtime | Current runtime |

**Workflow agent toggles:**
- `workflow.research`: default `true` — disable to skip research before planning
- `workflow.plan_check`: default `true` — disable to skip the plan-checker loop
- `workflow.verifier`: default `true` — disable to skip post-execution goal verification
- `workflow.auto_advance`: default `false` — enable to auto-chain discuss → plan → execute

**Execution settings:**
- `parallelization.enabled`: default `true`
- `planning.commit_docs`: default `true` — track `.planning/` in git
- `hooks.context_warnings`: default `true` — show context window usage warnings

---

## 13. GSD v2 — The Evolution

Released March 2026, [GSD v2 (gsd-2)](https://github.com/gsd-build/gsd-2) is a fundamental architectural departure from v1. It is no longer a prompt framework inside Claude Code — it is a **standalone TypeScript CLI** built on the Pi SDK.

### What v1 Could Only Ask the LLM to Do; v2 Actually Does

| Capability | v1 (Prompt Framework) | v2 (Agent Application) |
|---|---|---|
| Context management | "Hope the LLM doesn't fill up" | Fresh session per task, programmatically enforced |
| Auto mode | LLM calling itself in a loop | Deterministic state machine reading `.gsd/` files |
| Crash recovery | None | Lock files + session forensics |
| Git strategy | LLM writes git commands | Worktree isolation, sequential commits, squash merge |
| Cost tracking | None | Per-unit token/cost ledger with dashboard |
| Stuck detection | None | Retry once, then stop with diagnostics |
| Timeout supervision | None | Soft/idle/hard timeouts with recovery steering |
| Context injection | "Read this file" | Pre-inlined into dispatch prompt |
| Parallel execution | None | Multi-worker parallel milestone orchestration |

### Hierarchy Changes

v2 renames concepts but preserves the logic:
- Phases → **Slices** (one demoable vertical capability, 1–7 tasks)
- Plans → **Tasks** (one context-window-sized unit)
- Milestones → **Milestones** (4–10 slices each)

The iron rule in v2: **a task must fit in one context window. If it can't, it's two tasks.**

### `/gsd auto` — The Main Event

v2's headline feature. Run it, walk away, come back to built software. The state machine:
1. Reads `.gsd/STATE.md`, determines next unit of work
2. Creates fresh agent session
3. Injects focused prompt with all relevant context pre-inlined
4. LLM executes; when finished, auto mode reads disk state again
5. Dispatches next unit

No accumulation. No context garbage. Fully deterministic progression.

### Trade-off: No Claude Max Credits

As noted by [HackerNews commenter anentropic](https://news.ycombinator.com/item?id=47417804): *"They are working on a standalone version built on pi.dev... the rationale is good I guess, but it's unfortunate that you can't then use your Claude Max credits with it as it has to use API."* This is a cost concern for existing Claude Max subscribers.

---

## 14. Community Reception

### Overall Sentiment

As of March 2026, GSD has [31,000+ GitHub stars](https://dev.to/alikazmidev/the-complete-beginners-guide-to-gsd-get-shit-done-framework-for-claude-code-24h0) and is described as trusted by engineers at Amazon, Google, Shopify, and Webflow. The Reddit moderator bot summarized community sentiment in the [major update thread](https://www.reddit.com/r/ClaudeAI/comments/1qf6u3f/ive_massively_improved_gsd_get_shit_done/) as *"predominantly positive, particularly from those who have experience with GSD"*, while identifying a key point of contention: token usage.

### Positive Reception

**HackerNews (March 2026, thread [#47417804](https://news.ycombinator.com/item?id=47417804)):**
- *"I've been attributing [better results] to its multiple layers of cross checks and self-reviews"* — user jghn
- *"The GSD code was definitely written with the rest of the project and possibilities in mind, while the Claude Plan was just enough for the MVP"* — user healsdata (comparing GSD directly to Claude's native Plan Mode)
- *"It's hard to say why GSD worked so much better for us than other similar frameworks, because the underlying models also improved considerably during the same period. What is clear is that it's a huge productivity boost over vanilla Claude Code."* — user yoaviram
- *"I love the focus on defining what needs to be done and the criteria for completion. These are great practices with or without AI."* — widely quoted community comment
- *"The new /gsd:list-phase-assumptions command added recently has been a big help there to avoid needing a Q&A discussion on every phase"* — user anentropic (a regular user)

**Reddit r/ClaudeAI:**
- *"By far the most powerful addition to my Claude Code. Nothing over-engineered. Literally just gets shit done."* — quoted in README
- *"I've done SpecKit, OpenSpec and Taskmaster — this has produced the best results for me."* — quoted in README
- *"As someone with ADHD, I got bored using the other systems I found too over-structured for small apps."* — user Acrobatic_Toe6226
- *"GSD sits between almost no planning and full enterprise-level planning."*

**Measured real-world outcomes reported by community ([dev.to](https://dev.to/alikazmidev/the-complete-beginners-guide-to-gsd-get-shit-done-framework-for-claude-code-24h0)):**
- Mauvis Ledford: 8 hours of GSD testing compressed 2–3 days of work into ~1 day
- Max Buckley: Completed a 6-month research project (comparing ML models for NER) in days
- GSD code on a comparative test produced a more complete, architecturally aware implementation vs. Claude's native Plan Mode

### Critical Reception

**Token consumption** is the most consistent criticism:

From [GitHub Issue #120](https://github.com/gsd-build/get-shit-done/issues/120):
> *"Token usage and length of time to finish tasks has increased roughly 4x. Small tasks like changing colors now take 10 minutes instead of 2–3. I had one bug fix generate a swarm of over 100 agents and eat up 10k tokens in about 60 seconds."*

From Reddit moderator bot summary on the major update thread:
> *"A key point of contention revolves around token usage. One highly upvoted comment suggests that the prompts may be 'overkill,' warning that newcomers could quickly exhaust their Opus subscription."*

From [HackerNews](https://news.ycombinator.com/item?id=47417804):
> *"It absolutely tore through tokens though. I don't normally hit my session limits, but hit the 5-hour limits in ~30 minutes and my weekly limits by Tuesday with GSD."* — user MeetingsBrowser

**Sophistication concerns:**
> *"These meta-frameworks are useful for the one who set them up but for another person they seem like complete garbage."* — HackerNews user romanovcode

> *"For experienced engineers it quickly felt like overkill / Claude itself just gets better and better. Particularly once we got agent swarms I left GSD and don't think I'll be back. But I would recommend it to non coders trying to code."* — HackerNews user jdwyah

**Structural critique:**
> *"It's not a good name. It should be called planning-shit instead. Since that's seemingly 80%+ of what I did while interacting with this tool."* — HackerNews user vinnymac

> *"I think these type of systems (gsd/superpowers) are way too opinionated."* — HackerNews user alasano

---

## 15. Limitations and Weaknesses

Based on synthesized community feedback, GitHub issues, and technical analysis:

### 1. Token Cost — The #1 Practical Limitation

The multi-agent orchestration model is inherently token-expensive. Reports suggest:
- Roughly **4x overhead ratio** for complex phases (1 token writing code to 4 tokens on orchestration)
- Pro plan ($20/mo) users regularly hit limits mid-project
- The Max plan ($100–200/mo) is effectively required for regular use
- One user reported hitting 5-hour session limits in ~30 minutes

The creator's response: the token usage is more efficient than *struggling with degraded Claude* — you may use more tokens, but you get dramatically better output. However, this trade-off is not acceptable for all users or all budgets.

### 2. Overkill for Small Tasks

GSD's full workflow (discuss → plan → execute → verify) spawns significant agent overhead. Using it for a color change, typo fix, or single-file modification is wasteful. The `/gsd:quick` mode addresses this, but new users frequently apply the full workflow to tasks that don't warrant it.

### 3. Plan Checker Validates Spec, Not Implementation

The plan-checker only verifies logical completeness (requirement coverage, dependency graphs, context budget). It does **not** check whether the actual shell commands will work, whether library imports are correct, or whether the code will compile. Per a [HackerNews user](https://news.ycombinator.com/item?id=47417804): *"It never looks at what commands will actually run."*

### 4. Prompt Framework Fragility (v1 specific)

In v1, GSD is entirely dependent on the LLM following the markdown instructions correctly. There is no enforcement mechanism. A sufficiently large or confusing context can cause the LLM to deviate from workflow steps. The creator acknowledged this in GSD v2's README:
> *"It relied entirely on the LLM reading those prompts and doing the right thing. That worked surprisingly well — but it had hard limits."*

### 5. Discussion Phase Can Feel Slow

For users who know what they want, the iterative one-by-one questioning feels unnecessarily slow. The `--batch` flag mitigates this but trades depth for speed. The `/gsd:list-phase-assumptions` command (added later) also helps by letting users review and clear up Claude's intended approach in one go.

### 6. No Standalone Runtime (v1 — resolved in v2)

v1 requires Claude Code (or compatible runtimes). Users on other providers with API-only access must use the `inherit` model profile. v2 resolves this by building on the Pi SDK, but introduces the new limitation that Claude Max subscription credits cannot be used.

### 7. Research Agents Can Over-investigate

Some users report research phases spending excessive tokens on broad investigation when the problem is well-understood. The `--skip-research` flag exists for this, but requires knowing when to use it.

### 8. Spec Drift Risk

Specs are written in English, which is ambiguous. As [HackerNews user sveme](https://news.ycombinator.com/item?id=47417804) argued: *"Specs are subject to bit-rot. There's no impetus to update them as behavior changes unless your agent workflow explicitly enforces a thorough review."* GSD partially addresses this through `STATE.md` updates and SUMMARY.md history, but it is not as mechanically enforced as executable tests.

### 9. Brownfield Projects Require Pre-mapping

Applying GSD to an existing codebase without first running `/gsd:map-codebase` leads to conflicts with existing patterns. This is a known onboarding friction point for developers trying to use GSD on legacy code.

### 10. v2 Cost Model Change

GSD v2 moved away from Claude Code's subscription model (which provides unlimited Claude usage at flat rate) to API-based billing. For heavy users, this dramatically increases per-project costs relative to v1 on the Claude Max plan.

---

## 16. Framework Comparisons

| Framework | Philosophy | Target User | Overhead |
|---|---|---|---|
| **GSD v1** | Lightweight spec-driven, context-rot prevention | Solo devs, multi-phase projects | Medium |
| **GSD v2** | Autonomous agent application | Solo devs wanting fire-and-forget | Medium–High |
| **BMAD** | Enterprise SDLC, 21+ agents | Teams, enterprise projects | Very High |
| **Ralph Loop** | Self-iterating autonomy | Bulk refactors, overnight runs | High |
| **Superpowers** | Skills + guardrails | Speed-focused workflows | Low–Medium |
| **SpecKit** | Static markdown specs | Vendor-independent workflows | Low |
| **OpenSpec** | External managed orchestrator loop | Developer-controlled steering | Custom |

GSD occupies a specific niche: *between "just prompting Claude" and "running full enterprise SDLC."* For solo developers building non-trivial multi-session projects who want consistent quality without ceremony, it is consistently rated as the best available option as of early 2026.

---

## Summary: Why GSD Works

From the creator, distilled from the README and community posts:

1. **Fresh subagents** prevent context degradation — Plan 50 is as good as Plan 1
2. **Parallel waves** reduce total execution time by running independent plans simultaneously
3. **Disk files as memory** — `STATE.md` survives any `/clear` or session restart
4. **Goal-backward verification** finds tasks that are "done but broken"
5. **Atomic commits** make every task independently revertable and bisectable
6. **The discuss phase** eliminates the "that's not what I meant" loop before any code is written
7. **XML plan structure** exploits Claude's training to produce better, more precise implementations

The combination of these seven properties is what makes GSD reliably produce production-quality code across complex multi-session projects — something that "vibecoding" (single-session, unstructured prompting) cannot consistently achieve.

---

## Sources

1. [GSD README — Primary Source](https://github.com/gsd-build/get-shit-done/blob/main/README.md)
2. [GSD v2 Repository](https://github.com/gsd-build/gsd-2)
3. [Reddit: "I've Massively Improved GSD" (creator post with technical explanation)](https://www.reddit.com/r/ClaudeAI/comments/1qf6u3f/ive_massively_improved_gsd_get_shit_done/)
4. [Reddit: Original GSD Launch Post](https://www.reddit.com/r/ClaudeAI/comments/1q4yjo0/get_shit_done_the_1_cc_framework_for_people_tired/)
5. [HackerNews: "A meta-prompting, context engineering and spec-driven dev system" (March 2026)](https://news.ycombinator.com/item?id=47417804)
6. [HackerNews: GSD vs Plan Mode comparison](https://news.ycombinator.com/item?id=47421438)
7. [dev.to: The Complete Beginner's Guide to GSD by Muhammad Ali Kazmi](https://dev.to/alikazmidev/the-complete-beginners-guide-to-gsd-get-shit-done-framework-for-claude-code-24h0)
8. [daita.io: "Get Shit Done: The Context Engineering Layer That Makes Claude Reliable"](https://www.daita.io/blog/get_shit_done_claude_code)
9. [Codecentric: "The Anatomy of Claude Code Workflows" — Technical internals deep dive](https://www.codecentric.de/en/knowledge-hub/blog/the-anatomy-of-claude-code-workflows-turning-slash-commands-into-an-ai-development-system)
10. [pasqualepillitteri.it: "The System Revolutionizing Development with Claude Code"](https://pasqualepillitteri.it/en/news/169/gsd-framework-claude-code-ai-development)
11. [GitHub Issue #120: Token usage increase](https://github.com/gsd-build/get-shit-done/issues/120)
12. [LinkedIn — Ben Selleslagh on GSD discuss phase](https://www.linkedin.com/posts/benselleslagh_ive-been-testing-the-just-released-agent-activity-7425308257797181440-qSAC)
13. [YouTube: "Plan Mode Isn't Enough. GSD is the Framework I Actually Use"](https://www.youtube.com/watch?v=w2Btykxx8Fs)
14. [YouTube: "I Created GSD For Claude Code. This Is How I Use It."](https://www.youtube.com/watch?v=5L3dm7KBCmY)
15. [Reddit r/ClaudeCode: "I Just Released GSD 2.0"](https://www.reddit.com/r/ClaudeCode/comments/1rqy8ue/i_just_released_gsd_20_and_its_quite_the_update/)
