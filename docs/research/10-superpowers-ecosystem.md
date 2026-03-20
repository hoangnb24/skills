# Superpowers Framework: Complete Ecosystem Architecture Analysis

**Source repository:** https://github.com/obra/superpowers (v5.0.5, March 2026)  
**Stars:** 98,200+ | **Forks:** 7,800+ | **Contributors:** 27  
**Author:** Jesse Vincent (Prime Radiant)  
**License:** MIT

---

## 1. Full Directory Tree

```
obra/superpowers/
├── .claude-plugin/
│   ├── marketplace.json          # Dev marketplace config
│   └── plugin.json               # Plugin manifest (name, version, author)
├── .codex/
│   └── INSTALL.md                # Codex-specific install instructions
├── .cursor-plugin/
│   └── plugin.json               # Cursor plugin manifest
├── .github/
│   ├── FUNDING.yml
│   ├── ISSUE_TEMPLATE/           # bug_report, feature_request, platform_support
│   └── PULL_REQUEST_TEMPLATE.md
├── .opencode/
│   ├── INSTALL.md
│   └── plugins/
│       └── superpowers.js        # OpenCode plugin entry
├── agents/
│   └── code-reviewer.md          # Claude agent definition (YAML frontmatter + prompt)
├── commands/                     # DEPRECATED slash commands (stubs only)
│   ├── brainstorm.md             # → "use brainstorming skill instead"
│   ├── execute-plan.md           # → "use executing-plans skill instead"
│   └── write-plan.md             # → "use writing-plans skill instead"
├── docs/
│   ├── README.codex.md
│   ├── README.opencode.md
│   ├── testing.md
│   ├── windows/
│   │   └── polyglot-hooks.md
│   ├── plans/                    # Internal development plans (superpowers building itself)
│   │   ├── 2025-11-22-opencode-support-design.md
│   │   ├── 2025-11-22-opencode-support-implementation.md
│   │   ├── 2025-11-28-skills-improvements-from-user-feedback.md
│   │   └── 2026-01-17-visual-brainstorming.md
│   └── superpowers/              # Self-referential: superpowers uses its own workflow
│       ├── plans/
│       │   ├── 2026-01-22-document-review-system.md
│       │   ├── 2026-02-19-visual-brainstorming-refactor.md
│       │   └── 2026-03-11-zero-dep-brainstorm-server.md
│       └── specs/
│           ├── 2026-01-22-document-review-system-design.md
│           ├── 2026-02-19-visual-brainstorming-refactor-design.md
│           └── 2026-03-11-zero-dep-brainstorm-server-design.md
├── hooks/
│   ├── hooks.json                # Hook config for Claude Code
│   ├── hooks-cursor.json         # Hook config for Cursor
│   ├── run-hook.cmd              # Cross-platform polyglot wrapper (bash/Windows batch)
│   └── session-start             # The bootstrap script (bash)
├── skills/
│   ├── brainstorming/
│   │   ├── SKILL.md              # 164 lines / 10.3 KB
│   │   ├── spec-document-reviewer-prompt.md
│   │   ├── visual-companion.md
│   │   └── scripts/
│   │       ├── frame-template.html
│   │       ├── helper.js
│   │       ├── server.cjs        # Local HTTP server for visual companion
│   │       ├── start-server.sh
│   │       └── stop-server.sh
│   ├── dispatching-parallel-agents/
│   │   └── SKILL.md
│   ├── executing-plans/
│   │   └── SKILL.md
│   ├── finishing-a-development-branch/
│   │   └── SKILL.md
│   ├── receiving-code-review/
│   │   └── SKILL.md
│   ├── requesting-code-review/
│   │   ├── SKILL.md
│   │   └── code-reviewer.md      # Subagent prompt template
│   ├── subagent-driven-development/
│   │   ├── SKILL.md              # 277 lines / 11.9 KB
│   │   ├── implementer-prompt.md
│   │   ├── spec-reviewer-prompt.md
│   │   └── code-quality-reviewer-prompt.md
│   ├── systematic-debugging/
│   │   ├── SKILL.md
│   │   ├── CREATION-LOG.md       # Shows TDD-for-skills process
│   │   ├── condition-based-waiting.md
│   │   ├── condition-based-waiting-example.ts
│   │   ├── defense-in-depth.md
│   │   ├── find-polluter.sh
│   │   ├── root-cause-tracing.md
│   │   ├── test-academic.md      # Skill test scenarios (TDD for docs)
│   │   ├── test-pressure-1.md
│   │   ├── test-pressure-2.md
│   │   └── test-pressure-3.md
│   ├── test-driven-development/
│   │   ├── SKILL.md
│   │   └── testing-anti-patterns.md
│   ├── using-git-worktrees/
│   │   └── SKILL.md
│   ├── using-superpowers/        # THE META-SKILL / BOOTSTRAP
│   │   ├── SKILL.md              # 115 lines / 5.1 KB — injected at SessionStart
│   │   └── references/
│   │       ├── codex-tools.md    # Tool name mapping for Codex
│   │       └── gemini-tools.md   # Tool name mapping for Gemini
│   ├── verification-before-completion/
│   │   └── SKILL.md
│   ├── writing-plans/
│   │   ├── SKILL.md              # 145 lines / 5.27 KB
│   │   └── plan-document-reviewer-prompt.md
│   └── writing-skills/
│       ├── SKILL.md              # 655 lines / 21.9 KB — the meta-authorship skill
│       ├── anthropic-best-practices.md
│       ├── graphviz-conventions.dot
│       ├── persuasion-principles.md
│       ├── render-graphs.js
│       ├── testing-skills-with-subagents.md
│       └── examples/
│           └── CLAUDE_MD_TESTING.md
├── tests/
│   ├── brainstorm-server/        # JS tests for visual companion server
│   ├── claude-code/              # Integration test shell scripts
│   ├── explicit-skill-requests/  # Pressure-test prompts for skill compliance
│   ├── opencode/
│   ├── skill-triggering/         # Prompts to test auto-trigger behavior
│   └── subagent-driven-dev/      # Full integration test fixtures
├── CHANGELOG.md
├── GEMINI.md                     # Gemini bootstrap: @import using-superpowers + gemini-tools
├── LICENSE
├── README.md
├── RELEASE-NOTES.md
├── gemini-extension.json
└── package.json
```

---

## 2. Complete Skill Inventory

**Total: 14 skills** (as of v5.0.5)

| Skill Name | Category | SKILL.md Size | Supporting Files |
|---|---|---|---|
| `using-superpowers` | **Meta / Bootstrap** | 115 lines, 5.1 KB | `references/codex-tools.md`, `references/gemini-tools.md` |
| `brainstorming` | Collaboration | 164 lines, 10.3 KB | `scripts/` (visual server), `spec-document-reviewer-prompt.md`, `visual-companion.md` |
| `writing-plans` | Collaboration | 145 lines, 5.27 KB | `plan-document-reviewer-prompt.md` |
| `subagent-driven-development` | Collaboration | 277 lines, 11.9 KB | `implementer-prompt.md`, `spec-reviewer-prompt.md`, `code-quality-reviewer-prompt.md` |
| `executing-plans` | Collaboration | ~40 lines | None |
| `dispatching-parallel-agents` | Collaboration | ~50 lines | None |
| `requesting-code-review` | Collaboration | ~40 lines | `code-reviewer.md` |
| `receiving-code-review` | Collaboration | ~40 lines | None |
| `using-git-worktrees` | Collaboration | ~60 lines | None |
| `finishing-a-development-branch` | Collaboration | ~80 lines | None |
| `test-driven-development` | Testing | ~60 lines | `testing-anti-patterns.md` |
| `systematic-debugging` | Debugging | ~100 lines | `condition-based-waiting.md`, `defense-in-depth.md`, `root-cause-tracing.md`, scripts, test scenarios |
| `verification-before-completion` | Debugging | ~40 lines | None |
| `writing-skills` | Meta | 655 lines, 21.9 KB | `anthropic-best-practices.md`, `persuasion-principles.md`, `testing-skills-with-subagents.md`, `render-graphs.js`, examples |

**Skills removed/deprecated in v5:**  
- `getting-started` (replaced by `using-superpowers`)  
- Slash commands (`/brainstorm`, `/write-plan`, `/execute-plan`) → deprecated stubs redirect to skill equivalents

---

## 3. Skill Lifecycle: How a Skill Gets Activated

### 3a. Bootstrap Mechanism

The entire system bootstraps via a **SessionStart hook**:

```
hooks/hooks.json  →  matcher: "startup|clear|compact"
                  →  runs:    hooks/session-start (bash script)
                  →  outputs: JSON with additionalContext field
```

The `session-start` script:
1. Reads `skills/using-superpowers/SKILL.md` from disk
2. Escapes it for JSON embedding
3. Wraps it in `<EXTREMELY_IMPORTANT>` tags
4. Injects it into the session context as `additionalContext`

The injected text says (paraphrased): *"You have superpowers. Here is your using-superpowers skill. Read it. Invoke the Skill tool for all other skills. If there's even a 1% chance a skill applies, you MUST invoke it."*

**Platform differences:**
- **Claude Code:** Uses `hookSpecificOutput.additionalContext` field
- **Cursor:** Uses `additional_context` field
- **Codex:** Symlinks `~/.agents/skills/superpowers` → native skill discovery, no hook needed
- **Gemini CLI:** `GEMINI.md` at root uses `@import` syntax to directly load `using-superpowers/SKILL.md` + `gemini-tools.md`
- **OpenCode:** `superpowers.js` plugin entry point

### 3b. Individual Skill Invocation

Once bootstrapped, Claude uses the native **`Skill` tool** (provided by Claude Code's platform):

1. Claude receives a message
2. Checks `<available_skills>` list (embedded in `Skill` tool's description)
3. If a skill's description matches the current task → calls `Skill(command: "skill-name")`
4. Claude Code responds with: base path + full SKILL.md body (without frontmatter)
5. Claude follows the expanded instructions

**Key design:** Skills are NOT separate processes or agents. They are **injected context** — prompt expansions that guide the main conversation. The Skill tool is purely a lazy-loading mechanism to avoid bloating the system prompt.

### 3c. Skill Priority Rules (from `using-superpowers`)

```
Priority order when multiple skills could apply:
1. Process skills first (brainstorming, debugging) — determines HOW to approach
2. Implementation skills second (domain-specific) — guides execution

Rule: "Let's build X" → brainstorming FIRST, then any domain skills
Rule: "Fix this bug"  → systematic-debugging FIRST
```

---

## 4. Skill-to-Skill Chaining Map

This is how skills hand off to each other. The chaining is **explicit by name** within skill content — not inferred, not by file artifact detection alone.

```
User wants to build something
        │
        ▼
┌─────────────────────────────────┐
│         brainstorming           │  TRIGGERS: "build", "create", "feature", plan mode
│                                 │  OUTPUTS:  design doc → docs/superpowers/specs/YYYY-MM-DD-*.md
│  1. Explore project context     │  DISPATCHES: spec-document-reviewer (inline subagent)
│  2. Socratic Q&A                │  HANDS OFF: "Invoke writing-plans skill"
│  3. Propose approaches          │  NOTE: "The ONLY skill you invoke after brainstorming
│  4. Present design sections     │          is writing-plans"
│  5. Write design doc            │
│  6. Spec review loop            │
│  7. User review gate            │
└─────────────────────────────────┘
        │
        │ explicit invocation: "invoke writing-plans skill"
        ▼
┌─────────────────────────────────┐
│         writing-plans           │  TRIGGERS: "have a spec/requirements, before code"
│                                 │  OUTPUTS:  plan doc → docs/superpowers/plans/YYYY-MM-DD-*.md
│  Reads spec doc                 │  DISPATCHES: plan-document-reviewer (inline subagent)
│  Maps file structure            │  HANDS OFF: offers binary choice:
│  Creates bite-sized tasks       │    Option A → subagent-driven-development
│  Review loop                    │    Option B → executing-plans
└─────────────────────────────────┘
        │                 │
        │ A               │ B
        ▼                 ▼
┌───────────────┐  ┌──────────────────────────┐
│ subagent-     │  │     executing-plans       │
│ driven-dev    │  │                           │
│               │  │ Sequential in-session     │
│ Per task:     │  │ execution with TodoWrite  │
│  implementer  │  │ checkpoints               │
│  subagent →   │  │                           │
│  spec review  │  │ At end: →                 │
│  → quality    │  │ finishing-a-dev-branch    │
│  review       │  └──────────────────────────┘
│               │
│ At end: →     │
│ finishing-a-  │
│ dev-branch    │
└───────────────┘
        │
        ▼
┌──────────────────────────────────┐
│    finishing-a-development-      │
│           branch                 │
│                                  │
│  Verify tests → present options: │
│  merge / PR / keep / discard     │
│  Clean up worktree               │
└──────────────────────────────────┘
```

### Additional Chaining Paths

```
Any bug/unexpected behavior
        │
        ▼
systematic-debugging ──(after fix)──▶ verification-before-completion

Any feature implementation
        │
        ▼
test-driven-development  (used BY subagents during subagent-driven-development)

Feature work needing isolation
        │
        ▼
using-git-worktrees  (called by brainstorming AFTER design approved, BEFORE writing-plans)

After each task in subagent-driven-development
        │
        ▼
requesting-code-review ──▶ receiving-code-review

Multiple independent problems
        │
        ▼
dispatching-parallel-agents
```

### Chaining Mechanism: How exactly does handoff work?

The handoff is **explicit text directives** within SKILL.md content, not automated:

1. **Name-based references**: Skills say things like `"Invoke writing-plans skill"`, `"REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development"`, `"Use superpowers:finishing-a-development-branch"`
2. **Process flow diagrams** (graphviz DOT syntax inline in SKILL.md) show terminal nodes like `"Invoke writing-plans skill" [shape=doublecircle]` — the double-circle signals terminal/handoff state
3. **File artifact conventions**: Output files follow naming conventions (`docs/superpowers/specs/YYYY-MM-DD-*.md`, `docs/superpowers/plans/YYYY-MM-DD-*.md`) that the next skill reads
4. **No automated orchestrator**: The agent itself reads the directive and decides to invoke the next skill. There is no meta-skill that dispatches sequentially.

---

## 5. Per-Skill File Structure Patterns

There are three distinct patterns:

### Pattern A: Minimal (single SKILL.md)
Used by: `executing-plans`, `dispatching-parallel-agents`, `finishing-a-development-branch`, `receiving-code-review`, `using-git-worktrees`, `verification-before-completion`

```
skill-name/
└── SKILL.md
```

### Pattern B: Skill + Subagent Prompt Templates
Used by: `brainstorming`, `writing-plans`, `requesting-code-review`, `subagent-driven-development`

```
skill-name/
├── SKILL.md
├── [role]-prompt.md       # Template for dispatching specific subagents
└── [role]-prompt.md       # (up to 3 in subagent-driven-development)
```

The prompt templates are not auto-invoked. SKILL.md instructs the agent to read the template file and use it when constructing subagent dispatch messages.

### Pattern C: Skill + Heavy Reference + Tools
Used by: `systematic-debugging`, `writing-skills`, `brainstorming` (with scripts)

```
skill-name/
├── SKILL.md
├── sub-technique.md       # Deep-dive reference (100+ lines)
├── example.ts / .sh       # Reusable/runnable code
├── test-pressure-N.md     # TDD test scenarios for the skill itself
├── CREATION-LOG.md        # How the skill was built
└── scripts/               # (brainstorming only) full local server
    ├── server.cjs
    └── ...
```

### SKILL.md Internal Structure (canonical format)

```yaml
---
name: skill-name-with-hyphens
description: Use when [specific triggering conditions and symptoms]
---

# Skill Title

## Overview
What + core principle (1-2 sentences)

## When to Use
[Optional: graphviz digraph for decision tree]
[Bullet list of conditions]

## The Process / Checklist
[Numbered steps with sub-bullets]
[Inline code blocks for commands/code]

## [Domain sections as needed]

## Red Flags
[Table of rationalizations → counters]

## Integration
[REQUIRED SUB-SKILL references, REQUIRED BACKGROUND references]
```

**YAML frontmatter constraints:**
- Only `name` and `description` fields supported
- Max 1024 characters total for frontmatter
- `name`: letters, numbers, hyphens only
- `description`: triggers ONLY — never summarizes workflow (design decision: if description summarizes workflow, Claude follows the description shortcut instead of reading the full skill)

---

## 6. How Subagents Relate to Skills

**Key distinction:** Subagents are NOT skills. They are separate Claude instances dispatched with precisely crafted prompts.

### The `agents/` directory
Contains one file: `agents/code-reviewer.md`

This is a **Claude agent definition** with YAML frontmatter:
```yaml
---
name: code-reviewer
description: Use this agent when a major project step has been completed...
model: inherit
---
[Full prompt for the code-reviewer role]
```

This is a different format from SKILL.md. Agents have `model` fields and are dispatched as standalone workers.

### Subagent prompt templates (in skills/)
Skills like `subagent-driven-development` contain `*-prompt.md` files that are **templates**, not agents:

- `implementer-prompt.md` — template for `Task` tool dispatch
- `spec-reviewer-prompt.md` — template for spec compliance review subagent
- `code-quality-reviewer-prompt.md` — template for code quality review subagent

The controller agent fills in placeholders (`[FULL TEXT of task]`, `[BASE_SHA]`, etc.) before dispatching.

### spec-document-reviewer
This is NOT a separate skill. It is an inline subagent dispatched within the `brainstorming` skill's workflow (step 7 in the checklist), using the template in `skills/brainstorming/spec-document-reviewer-prompt.md`. Same pattern for `plan-document-reviewer` in writing-plans.

### Subagent Context Isolation (design principle)
From `subagent-driven-development/SKILL.md`:
> "They should never inherit your session's context or history — you construct exactly what they need."

The controller agent:
1. Reads plan once, extracts ALL task text upfront
2. Provides full task text directly to each subagent (not file paths to read)
3. Adds "scene-setting" context about where the task fits
4. Preserves controller context for coordination

---

## 7. Root-Level Files and Their Roles

| File | Role |
|---|---|
| `hooks/hooks.json` | Declares SessionStart hook for Claude Code: runs `session-start` on startup/clear/compact |
| `hooks/hooks-cursor.json` | Same hook for Cursor (different JSON schema) |
| `hooks/session-start` | Bash script: reads `using-superpowers/SKILL.md`, injects as `<EXTREMELY_IMPORTANT>` additionalContext |
| `hooks/run-hook.cmd` | Cross-platform polyglot (bash + Windows batch) to find and run bash on Windows |
| `GEMINI.md` | Gemini CLI bootstrap: `@./skills/using-superpowers/SKILL.md` + `@./skills/using-superpowers/references/gemini-tools.md` |
| `gemini-extension.json` | Gemini extension manifest pointing to GEMINI.md |
| `.claude-plugin/plugin.json` | Claude Code plugin metadata (name: superpowers, version: 5.0.5) |
| `.claude-plugin/marketplace.json` | Dev marketplace config for testing local installs |
| `.cursor-plugin/plugin.json` | Cursor plugin metadata |
| `.opencode/plugins/superpowers.js` | OpenCode plugin entry point (JavaScript) |
| `.codex/INSTALL.md` | Codex install: clone repo, symlink `~/.agents/skills/superpowers` → `skills/` |
| `package.json` | Node.js: `main: ".opencode/plugins/superpowers.js"` (for OpenCode) |
| `agents/code-reviewer.md` | Claude agent definition with full code reviewer persona |
| `commands/` | Three deprecated slash commands, each containing only a redirect message |

**Note:** There is NO `CLAUDE.md` at the root. The system does not use a CLAUDE.md for bootstrapping. It uses the hook-injected context.

---

## 8. How Hooks Work

### The Single Hook: SessionStart

**Trigger:** `startup | clear | compact` (regex matcher in `hooks.json`)

**What it does:**
1. Detects platform (Claude Code vs Cursor vs other) via environment variables
2. Checks for legacy `~/.config/superpowers/skills` — warns if found
3. Reads `skills/using-superpowers/SKILL.md`
4. Escapes for JSON
5. Wraps in `<EXTREMELY_IMPORTANT>` XML tags
6. Outputs JSON: `{ hookSpecificOutput: { additionalContext: "..." } }` (Claude Code) or `{ additional_context: "..." }` (Cursor/other)

**Effect:** Every session starts with the `using-superpowers` skill pre-loaded in context. This is the ONLY skill auto-loaded. All other 13 skills are lazy-loaded on demand via the `Skill` tool.

**Cross-platform challenge:** `run-hook.cmd` is a polyglot file that is simultaneously valid bash and Windows batch. On Windows, `cmd.exe` runs the batch portion which finds Git for Windows bash. On Unix, bash interprets the whole file (the batch `@echo off` is hidden inside a heredoc no-op).

### No Other Hooks
There is only one hook event. All other skill chaining happens through agent reasoning and explicit text directives in SKILL.md files, not through additional hook events.

---

## 9. Is There a Meta-Skill or Orchestrator?

**There is no automated orchestrator.** The system is designed around the agent as its own orchestrator.

`using-superpowers` is the closest thing to a meta-skill. Its role:
- Injected at every session start (via hook)
- Establishes the rule: "invoke relevant skills BEFORE any response"
- Defines skill priority ordering (process skills before implementation skills)
- Provides the "Red Flags" table for rationalization counters
- Explains how to access skills on each platform

The agent (Claude) itself:
1. Receives using-superpowers at session start
2. Evaluates every incoming message against available skill descriptions
3. Invokes skills proactively (not reactively)
4. Follows each skill's terminal state instructions for handoff

**Key architectural insight from the author:**  
> "The agent checks for relevant skills before any task. Mandatory workflows, not suggestions."

This is enforced through **persuasion psychology embedded in skill text** (authority framing, commitment devices, scarcity signals, rationalization tables) — not through code enforcement. See `writing-skills/persuasion-principles.md`.

---

## 10. State Management Between Skills

**The system is file-based, convention-based, and context-based.** No database, no flags, no dedicated state store.

### File Conventions (State Persistence)

| State | Location | Convention |
|---|---|---|
| Design specs | `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md` | Written by brainstorming, read by writing-plans |
| Implementation plans | `docs/superpowers/plans/YYYY-MM-DD-<feature>.md` | Written by writing-plans, read by subagent-driven-development |
| Task progress | TodoWrite (Claude Code native tool) | In-session only; subagent-driven-development creates + marks tasks |
| Git commits | Standard git | Each task requires a commit; provides audit trail |
| Worktrees | `.worktrees/` or `worktrees/` | Created by using-git-worktrees, cleaned up by finishing-a-development-branch |

### Context Passing (Between Subagents)

The controller (orchestrating) agent:
- Extracts ALL task text from the plan upfront (not at dispatch time)
- Injects full task text + scene-setting into each subagent's prompt
- Does NOT share session history (isolation principle)
- Receives structured status reports back: `DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED`

### Spec-to-Plan-to-Implementation Chain

```
brainstorming  →  writes to  →  docs/superpowers/specs/YYYY-MM-DD-*.md
writing-plans  →  reads from →  docs/superpowers/specs/YYYY-MM-DD-*.md
               →  writes to  →  docs/superpowers/plans/YYYY-MM-DD-*.md
subagent-dev   →  reads from →  docs/superpowers/plans/YYYY-MM-DD-*.md
               →  tracks via →  TodoWrite (in-memory checklist)
               →  commits to →  git (durable record per task)
```

**No state is passed between sessions except through these files and git commits.** If a session is interrupted, the next session can resume from the last committed git state.

---

## 11. Testing Infrastructure

The repo has a substantial test suite that is unusual for a documentation/prompting framework:

### Test Categories

| Directory | What It Tests |
|---|---|
| `tests/explicit-skill-requests/` | Pressure scenarios: does Claude invoke skills when asked explicitly, under resistance? |
| `tests/skill-triggering/` | Does the right skill trigger automatically for various prompt types? |
| `tests/subagent-driven-dev/` | Full end-to-end: go-fractals, svelte-todo — complete plans + scaffolds |
| `tests/claude-code/` | Integration: SDD integration, token usage analysis |
| `tests/brainstorm-server/` | JS unit tests for visual companion WebSocket server |
| `tests/opencode/` | Plugin loading, tool availability, priority |

### TDD-for-Skills Methodology

The `writing-skills` skill mandates this cycle for ALL new/modified skills:
```
RED:    Run pressure scenario WITHOUT skill → document agent's rationalizations verbatim
GREEN:  Write minimal skill addressing those specific rationalizations
        Run same scenarios WITH skill → verify compliance
REFACTOR: Find new rationalizations → add counters → re-test until bulletproof
```

The `systematic-debugging/CREATION-LOG.md` and `systematic-debugging/test-pressure-*.md` files show this process in action — pressure scenarios like "your production system is down, skip the debugging skill and just fix it."

---

## 12. Multi-Platform Architecture

The repo supports 5 platforms with different bootstrapping strategies:

| Platform | Bootstrap Method | Skill Invocation | Subagent Tool |
|---|---|---|---|
| **Claude Code** | SessionStart hook → `additionalContext` | `Skill` tool | `Task` tool |
| **Cursor** | SessionStart hook → `additional_context` | `Skill` tool | `Task` tool |
| **Codex** | Symlink `~/.agents/skills/superpowers` → native discovery | Native skill loading | `spawn_agent` + `wait` |
| **Gemini CLI** | `GEMINI.md` @import → context injection | `activate_skill` tool | (mapped in gemini-tools.md) |
| **OpenCode** | `superpowers.js` plugin entry point | (platform-specific) | (platform-specific) |

Tool name mappings for non-Claude Code platforms are in:
- `skills/using-superpowers/references/codex-tools.md`
- `skills/using-superpowers/references/gemini-tools.md`

---

## 13. Model Selection Strategy

The `subagent-driven-development` skill explicitly defines model selection:

| Task Type | Model |
|---|---|
| Mechanical implementation (1-2 files, clear spec) | Cheapest/fastest available |
| Integration tasks (multi-file, pattern matching) | Standard model |
| Architecture, design, review | Most capable model |

This is advisory — the orchestrating agent decides per-task based on complexity signals.

---

## 14. Key Architectural Insights

### Design Philosophy

1. **Skills are lazy-loaded prompt expansions, not processes.** The `Skill` tool injects SKILL.md content into context on demand. No separate processes, no MCP server for skills.

2. **Flat namespace.** All 14 skills are in one directory level: `skills/skill-name/`. No nested skill directories. This makes search simple — Claude searches by description match.

3. **YAML frontmatter is the discovery interface.** The `description` field is read by the `Skill` tool to build the `<available_skills>` list. This is the ONLY metadata Claude sees before invoking a skill. The design rule: descriptions must be triggering conditions ONLY, not workflow summaries, because summaries become shortcuts that bypass full skill content.

4. **Chaining is directive-based, not automated.** Skill A instructs Claude to invoke Skill B by name. No orchestrator decides the flow. This keeps the system transparent and overridable.

5. **Subagent context isolation as a feature.** Subagents get exactly the context they need — no more. This prevents context pollution, reduces cost, and allows use of cheaper models for mechanical tasks.

6. **Persuasion psychology as an enforcement mechanism.** Skills use authority framing, commitment devices, and rationalization tables to resist the agent's tendency to skip formal workflows. This is explicitly documented in `writing-skills/persuasion-principles.md`.

7. **The system eats its own cooking.** The `docs/superpowers/` directory contains design specs and plans for superpowers development itself — created using the brainstorming → writing-plans workflow.

8. **TDD applied to documentation.** `writing-skills` mandates the full RED-GREEN-REFACTOR cycle for creating/modifying skills. The test suite in `tests/` validates skills the same way unit tests validate code.

### What Is NOT in the System

- **No automated skill sequencing** — no orchestrator that chains skills without agent decision
- **No persistent memory** between sessions (the `remembering-conversations` skill mentioned in the original blog post was never merged)  
- **No CLAUDE.md** at the repo root — the hook handles all bootstrapping
- **No centralized registry** beyond the `<available_skills>` list in the Skill tool
- **No versioning of skill invocations** — if a skill changes, the next session gets the new version automatically
- **No skill dependencies declared in frontmatter** — dependencies are stated as prose in SKILL.md body (e.g., "REQUIRED BACKGROUND: understand superpowers:test-driven-development")

---

## 15. Skill Interaction Map (Summary)

```
SESSION START
│
├── Hook injects: using-superpowers (mandatory, every session)
│
USER TASK
│
├─▶ [if new feature/build] ──▶ brainstorming
│                                  │ dispatches: spec-document-reviewer (subagent)
│                                  │ outputs: docs/superpowers/specs/*.md
│                                  └──▶ using-git-worktrees (after design approved)
│                                            └──▶ writing-plans
│                                                    │ dispatches: plan-document-reviewer (subagent)
│                                                    │ outputs: docs/superpowers/plans/*.md
│                                                    └──▶ [choice A] subagent-driven-development
│                                                    │       │ dispatches (per task):
│                                                    │       │  implementer subagent
│                                                    │       │  spec-reviewer subagent
│                                                    │       │  code-quality-reviewer subagent
│                                                    │       │ uses: test-driven-development (in subagents)
│                                                    │       │ uses: requesting-code-review (between tasks)
│                                                    │       └──▶ finishing-a-development-branch
│                                                    └──▶ [choice B] executing-plans
│                                                                └──▶ finishing-a-development-branch
│
├─▶ [if bug/failure] ──▶ systematic-debugging
│                              └──▶ verification-before-completion
│
├─▶ [if multiple independent tasks] ──▶ dispatching-parallel-agents
│
├─▶ [if receiving review feedback] ──▶ receiving-code-review
│
└─▶ [if writing new skill] ──▶ writing-skills
                                    (uses: test-driven-development for TDD cycle)
```

---

## Sources

- [obra/superpowers GitHub repository](https://github.com/obra/superpowers) — full directory tree via GitHub API
- [brainstorming/SKILL.md](https://github.com/obra/superpowers/blob/main/skills/brainstorming/SKILL.md)
- [writing-plans/SKILL.md](https://github.com/obra/superpowers/blob/main/skills/writing-plans/SKILL.md)
- [subagent-driven-development/SKILL.md](https://github.com/obra/superpowers/blob/main/skills/subagent-driven-development/SKILL.md)
- [using-superpowers/SKILL.md](https://github.com/obra/superpowers/blob/main/skills/using-superpowers/SKILL.md)
- [writing-skills/SKILL.md](https://github.com/obra/superpowers/blob/main/skills/writing-skills/SKILL.md)
- [hooks/session-start](https://raw.githubusercontent.com/obra/superpowers/main/hooks/session-start) — raw bootstrap script
- [hooks/hooks.json](https://raw.githubusercontent.com/obra/superpowers/main/hooks/hooks.json)
- [Jesse Vincent's original Superpowers blog post](https://blog.fsck.com/2025/10/09/superpowers/) — October 9, 2025
- [Inside Claude Code Skills: Structure, prompts, invocation — mikhail.io](https://mikhail.io/2025/10/claude-code-skills/) — October 28, 2025 (reverse-engineered Skill tool definition)
- [Reddit: obra/superpowers usage discussion](https://www.reddit.com/r/ClaudeAI/comments/1qj1zjg/using_claude_code_obrasuperpowers_how_do_you/)
- [Antigravity port of Superpowers — Reddit](https://www.reddit.com/r/google_antigravity/comments/1rf5813/i_ported_superpowers_the_ai_coding_workflow/)
