# Compound Engineering Plugin: Full Ecosystem Architecture

> **Source**: [EveryInc/compound-engineering-plugin](https://github.com/EveryInc/compound-engineering-plugin) — 6.8k stars, MIT license  
> **Official guide**: [every.to/guides/compound-engineering](https://every.to/guides/compound-engineering)  
> **Created by**: Dan Shipper and Kieran Klaassen (Every Inc.)  
> **Research date**: March 20, 2026

---

## 1. The Numbers — What's Actually In The Box

The plugin's authoritative component count (from the [Every.to guide](https://every.to/guides/compound-engineering)):

| Component | Advertised Count | Notes |
|---|---|---|
| Specialized agents | **26** | Organized into 5 categories |
| Workflow commands | **23** | Core loop + utilities |
| Skills | **13** | Domain expertise files (per marketing copy) |
| MCP servers | **1** | Context7 |

> **Important discrepancy**: The marketing/guide page says "13 skills", but the actual GitHub repo `README.md` lists **45+ skill directories** on disk. The "13 skills" refers to the count at the time of a specific older release (v2.x). As of the current `main` branch (March 2026), the README reports "45+ Skills". The gap exists because commands were migrated to the skills format in v2.39.0 — all former `/command-name` slash commands now live under `skills/command-name/SKILL.md`. The "13 skills" in marketing copy appears to refer to the stable domain-expertise skills only, not the full skill directory count.

---

## 2. Repository Structure

**Repo root**: `https://github.com/EveryInc/compound-engineering-plugin`

### Top-level layout
```
compound-engineering-plugin/
├── plugins/
│   └── compound-engineering/          ← The plugin itself
│       ├── .claude-plugin/            ← Claude Code plugin manifest (dir)
│       ├── .cursor-plugin/            ← Cursor plugin manifest (dir)
│       ├── .mcp.json                  ← MCP server configuration
│       ├── AGENTS.md                  ← Plugin dev instructions
│       ├── CHANGELOG.md               ← Release history (35KB)
│       ├── CLAUDE.md                  ← AI session instructions
│       ├── LICENSE                    ← MIT
│       ├── README.md                  ← Component reference (9.4KB)
│       ├── agents/                    ← Agent definitions
│       └── skills/                    ← Skill definitions (45+)
├── src/                               ← TypeScript CLI converter
└── ...
```

### Installed project layout (after plugin install)
When installed into a user's project, the plugin sets up:
```
your-project/
├── CLAUDE.md                    ← Agent instructions, preferences, patterns (you write this)
├── docs/
│   ├── brainstorms/             ← /ce:brainstorm output
│   ├── solutions/               ← /ce:compound output (YAML-frontmatter searchable docs)
│   └── plans/                   ← /ce:plan output
└── todos/                       ← Review findings + triage items
    ├── 001-ready-p1-fix-auth.md
    └── 002-pending-p2-add-tests.md
```

### Plugin install directories (Claude Code)
Claude Code installs plugins to `~/.claude/plugins/compound-engineering/` and registers:
```
agents/
├── review/        ← 14 code review specialists
├── research/      ← 6 research/analysis agents
├── design/        ← 3 UI/Figma agents
├── workflow/      ← 4 automation agents
└── docs/          ← 1 documentation agent

skills/
├── ce-*/          ← Core workflow skills (ce:plan, ce:review, etc.)
└── */             ← All other skills
```

---

## 3. The 26 Agents — Full List by Category

Agents are markdown files stored as `agents/<category>/<name>.md` with YAML frontmatter.

### Review Agents (15 agents — runs in parallel during /ce:review)

| Agent | Purpose |
|---|---|
| `agent-native-reviewer` | Verify features are agent-native (action + context parity) |
| `architecture-strategist` | Analyze architectural decisions and compliance |
| `code-simplicity-reviewer` | Final pass for simplicity and minimalism (YAGNI) |
| `data-integrity-guardian` | Database migrations and data integrity |
| `data-migration-expert` | Validate ID mappings match production, check for swapped values |
| `deployment-verification-agent` | Create Go/No-Go deployment checklists for risky data changes |
| `dhh-rails-reviewer` | Rails review from DHH's perspective (37signals conventions) |
| `julik-frontend-races-reviewer` | Review JavaScript/Stimulus code for race conditions |
| `kieran-rails-reviewer` | Rails code review with strict conventions |
| `kieran-python-reviewer` | Python code review with strict conventions |
| `kieran-typescript-reviewer` | TypeScript code review with strict conventions |
| `pattern-recognition-specialist` | Analyze code for patterns and anti-patterns |
| `performance-oracle` | Performance analysis (N+1 queries, missing indexes, bottlenecks) |
| `schema-drift-detector` | Detect unrelated schema.rb changes in PRs |
| `security-sentinel` | Security audits, OWASP top-10, vulnerability assessments |

### Research Agents (6 agents — runs in parallel during /ce:plan)

| Agent | Purpose |
|---|---|
| `best-practices-researcher` | Gather external best practices and examples |
| `framework-docs-researcher` | Research framework documentation (via Context7 MCP) |
| `git-history-analyzer` | Analyze git history and code evolution |
| `issue-intelligence-analyst` | Analyze GitHub issues to surface recurring themes and pain patterns |
| `learnings-researcher` | Search institutional learnings for relevant past solutions |
| `repo-research-analyst` | Research repository structure and conventions |

### Design Agents (3 agents)

| Agent | Purpose |
|---|---|
| `design-implementation-reviewer` | Verify UI implementations match Figma designs |
| `design-iterator` | Iteratively refine UI through systematic design iterations |
| `figma-design-sync` | Synchronize web implementations with Figma designs |

### Workflow Agents (4 agents)

| Agent | Purpose |
|---|---|
| `bug-reproduction-validator` | Systematically reproduce and validate bug reports |
| `lint` | Run linting and code quality checks on Ruby and ERB files |
| `pr-comment-resolver` | Address PR comments and implement fixes |
| `spec-flow-analyzer` | Analyze user flows and identify gaps in specifications |

### Docs Agents (1 agent)

| Agent | Purpose |
|---|---|
| `ankane-readme-writer` | Create READMEs following Ankane-style template for Ruby gems |

**Total: 29 agents listed in the current README** (the marketed "26" reflects an earlier count; the README now reads "25+").

---

## 4. The 23 Commands — Full List

Commands were migrated to the skills format in v2.39.0. Each former `/command-name` now lives under `skills/command-name/SKILL.md`. They work identically in Claude Code.

### Core Workflow Commands (use `ce:` prefix)

| Command | Purpose |
|---|---|
| `/ce:ideate` | Discover high-impact project improvements through divergent ideation and adversarial filtering |
| `/ce:brainstorm` | Explore requirements and approaches before planning |
| `/ce:plan` | Create structured implementation plans (spawns 4+ parallel research agents) |
| `/ce:review` | Run comprehensive code reviews (spawns 14+ agents in parallel) |
| `/ce:work` | Execute work items systematically in isolated git worktrees |
| `/ce:compound` | Document solved problems to compound team knowledge (spawns 6 parallel subagents) |
| `/ce:compound-refresh` | Refresh stale or drifting learnings — keep, update, replace, or archive |

> **Why `ce:` prefix?** Claude Code has built-in `/plan` and `/review` commands. The `ce:` namespace (short for compound-engineering) disambiguates them. Legacy `workflows:` prefix still works.

### Utility Commands

| Command | Purpose |
|---|---|
| `/lfg` | Full autonomous engineering workflow (plan → deepen-plan → work → review → resolve → test → video → compound). Spawns **50+ agents** across all stages. |
| `/slfg` | Full autonomous workflow with **swarm mode** — parallel execution of multiple worktrees |
| `/deepen-plan` | Stress-test plans and deepen weak sections with targeted research (spawns 40+ parallel research agents) |
| `/changelog` | Create engaging changelogs for recent merges |
| `/create-agent-skill` | Create or edit Claude Code skills |
| `/generate_command` | Generate new slash commands |
| `/heal-skill` | Fix skill documentation issues |
| `/sync` | Sync Claude Code config across machines |
| `/report-bug` | Report a bug in the plugin |
| `/reproduce-bug` | Reproduce bugs using logs and console |
| `/resolve_parallel` | Resolve TODO comments in parallel |
| `/resolve_pr_parallel` | Resolve PR comments in parallel |
| `/resolve-todo-parallel` | Resolve todos in parallel |
| `/triage` | Triage and prioritize issues (one-by-one human decision: approve / skip / customize) |
| `/test-browser` | Run browser tests on PR-affected pages |
| `/xcode-test` | Build and test iOS apps on simulator |
| `/feature-video` | Record video walkthroughs and add to PR description |

**Total: 24 commands** listed in current README (again, count evolves; "23" is the marketed number).

---

## 5. The Skills Directory — Full List (45+ on disk)

Each skill is a **directory** containing `SKILL.md` with YAML frontmatter (`name`, `description`) plus optional `references/`, `assets/`, and `scripts/` subdirectories. The `SKILL.md` is the only required file — it's the instruction set for the agent.

### Architecture & Design
| Skill | Description |
|---|---|
| `agent-native-architecture` | Build AI agents using prompt-native architecture |

### Development Tools
| Skill | Description |
|---|---|
| `andrew-kane-gem-writer` | Write Ruby gems following Andrew Kane's patterns |
| `compound-docs` | Capture solved problems as categorized documentation |
| `create-agent-skills` | Expert guidance for creating Claude Code skills |
| `dhh-rails-style` | Write Ruby/Rails code in DHH's 37signals style |
| `dspy-ruby` | Build type-safe LLM applications with DSPy.rb |
| `frontend-design` | Create production-grade frontend interfaces |

### Content & Workflow
| Skill | Description |
|---|---|
| `document-review` | Improve documents through structured self-review |
| `every-style-editor` | Review copy for Every's style guide compliance |
| `file-todos` | File-based todo tracking system |
| `git-worktree` | Manage Git worktrees for parallel development |
| `proof` | Create, edit, and share documents via Proof collaborative editor |
| `claude-permissions-optimizer` | Optimize Claude Code permissions from session history |
| `resolve-pr-parallel` | Resolve PR review comments in parallel |
| `setup` | Configure which review agents run for your project |

### Multi-Agent Orchestration
| Skill | Description |
|---|---|
| `orchestrating-swarms` | Comprehensive guide to multi-agent swarm orchestration |

### File Transfer
| Skill | Description |
|---|---|
| `rclone` | Upload files to S3, Cloudflare R2, Backblaze B2, and cloud storage |

### Browser Automation
| Skill | Description |
|---|---|
| `agent-browser` | CLI-based browser automation using Vercel's agent-browser |

### Core Workflow Skills (migrated from commands in v2.39.0)
| Skill | Description |
|---|---|
| `ce-brainstorm` | Core skill for `/ce:brainstorm` |
| `ce-compound` | Core skill for `/ce:compound` |
| `ce-compound-refresh` | Core skill for `/ce:compound-refresh` |
| `ce-ideate` | Core skill for `/ce:ideate` |
| `ce-plan` | Core skill for `/ce:plan` |
| `ce-review` | Core skill for `/ce:review` |
| `ce-work` | Core skill for `/ce:work` |
| `lfg` | Core skill for `/lfg` |
| `changelog` | Core skill for `/changelog` |
| `deepen-plan` | Core skill for `/deepen-plan` |
| `feature-video` | Core skill for `/feature-video` |
| `generate_command` | Core skill for `/generate_command` |
| `heal-skill` | Core skill for `/heal-skill` |
| `reproduce-bug` | Core skill for `/reproduce-bug` |
| `report-bug` | Core skill for `/report-bug` |
| `sync` | Core skill for `/sync` |
| `triage` | Core skill for `/triage` |

### Beta Skills (experimental, not wired into lfg/slfg)
| Skill | Replaces | Notes |
|---|---|---|
| `ce-plan-beta` | `ce:plan` | Decision-first planning focused on boundaries, sequencing, and verification |
| `deepen-plan-beta` | `deepen-plan` | Selective stress-test targeting weak sections |

Beta skills use `disable-model-invocation: true` in frontmatter to prevent accidental auto-triggering. Invoke directly as `/ce:plan-beta`.

### Image Generation
| Skill | Description |
|---|---|
| `gemini-imagegen` | Generate and edit images using Google's Gemini API |

### Additional skills on disk (from GitHub API listing)
| Skill |
|---|
| `agent-native-audit` |
| `create-agent-skill` (note: separate from `create-agent-skills`) |
| `deploy-docs` |

**The "13 skills" in the marketing copy** refers specifically to these 13 stable domain-expertise skills that were present at the launch (architecture, dhh-rails-style, andrew-kane, compound-docs, frontend-design, dspy-ruby, document-review, every-style, file-todos, git-worktree, proof, rclone, orchestrating-swarms, agent-browser). The actual disk count is 45+.

---

## 6. How Agents Relate to Skills

Agents and skills serve different purposes and do **not** have a 1:1 mapping:

| Dimension | Agents | Skills |
|---|---|---|
| **What they are** | Subagent definitions — a focused AI role with a narrow job | Knowledge/instruction files — domain expertise available as context |
| **How they're invoked** | Spawned by commands (e.g., `/ce:review` spawns 14 agents) or used directly with `@agent-name` | Loaded into Claude's context when you invoke the matching command or explicitly reference |
| **Storage format** | `agents/<category>/<name>.md` — markdown with YAML frontmatter | `skills/<name>/SKILL.md` — markdown with YAML frontmatter + optional references/ |
| **Scope** | Task-scoped — runs once for a specific analysis | Persistent reference — consulted throughout a workflow |
| **Example** | `security-sentinel` scans for OWASP vulnerabilities | `dhh-rails-style` teaches agents how to write Rails code in DHH style |
| **Relationship** | Review agents are *dispatched by* skill logic in `ce-review` | Skills like `orchestrating-swarms` teach agents HOW to coordinate |

The key relationship: **commands (via skills) orchestrate agents**. The `ce:plan` skill spawns research agents. The `ce:review` skill spawns review agents. The `lfg` skill chains all the sub-skills and their agent-spawning behavior.

---

## 7. Workflow Chaining — How /workflows:plan, /work, /review, /compound Chain

### The Manual Loop
```
Brainstorm → Plan → [Deepen] → Work → Review → [Resolve] → Compound
```

Each step is manual by default:

**Step 1: `/ce:brainstorm`**
- Lightweight repo research
- Asks questions one at a time to clarify purpose, users, constraints, edge cases
- Output saved to `docs/brainstorms/`

**Step 2: `/ce:plan`**
- Spawns **3 parallel research agents simultaneously**:
  1. `repo-research-analyst` — codebase patterns, conventions, git history
  2. `framework-docs-researcher` — framework docs (via Context7 MCP)
  3. `best-practices-researcher` — industry standards
- Also spawns `spec-flow-analyzer` to analyze user flows
- Merges findings into a structured plan with affected files and implementation steps
- Output saved to `docs/plans/`
- Optional: append `ultrathink` to automatically trigger `/deepen-plan` afterward

**Step 2b: `/deepen-plan`** (optional enrichment)
- Spawns **40+ parallel research agents** targeting each weak section of the plan
- Enriches each section with deeper technical detail

**Step 3: `/ce:work`**
Runs in 4 phases:
1. **Quick Start**: Creates a git worktree (isolated repo copy) + branch
2. **Execute**: Implements each task with file-based todo tracking (`todos/` directory)
3. **Quality Check**: Optionally spawns 5+ reviewer agents (Rails, TypeScript, security, performance)
4. **Ship It**: Runs linting, creates PR

State tracking mechanism: The `file-todos` skill manages a `todos/` directory where each task is a markdown file with status. This is how progress persists across agent invocations.

**Step 4: `/ce:review`**
- Spawns **all 14 review agents in parallel simultaneously**
- Each agent runs independently, returns prioritized findings (P1/P2/P3)
- Results are combined into a single prioritized list

**Step 5: `/ce:compound`**
- Spawns **6 parallel subagents**:
  1. Context analyzer
  2. Solution extractor
  3. Related docs finder
  4. Prevention strategist
  5. Category classifier
  6. Documentation writer
- Creates searchable markdown with YAML frontmatter in `docs/solutions/`
- These documents are automatically found by `learnings-researcher` agent in future `/ce:plan` runs — this is the compounding mechanism

---

## 8. How /lfg Works — The Full Pipeline

`/lfg` chains the entire loop autonomously with one command:

```
/lfg Add dark mode toggle to settings page
```

### Execution sequence:
```
[1] ce:plan          → spawns 4 parallel research agents
                       ↓
[2] PAUSE             → user reviews and approves plan
                       ↓ (user approves)
[3] deepen-plan       → spawns 40+ parallel research agents
                       ↓
[4] ce:work           → creates worktree, implements, tracks todos
                       ↓
[5] ce:review         → spawns 14 review agents in parallel
                       ↓
[6] resolve findings  → resolve_pr_parallel fixes P1s then P2s in isolation
                       ↓
[7] test-browser      → agent-browser CLI tests affected pages
                       ↓
[8] feature-video     → records walkthrough, adds to PR description
                       ↓
[9] ce:compound       → spawns 6 subagents, writes docs/solutions/
```

**Total agents spawned: 50+** across all stages.

### Orchestration mechanism:
There is no external orchestration daemon or state database. The orchestration is entirely **prompt-driven sequential chaining** within Claude Code's session context:
- Each step invokes the next step by loading its SKILL.md into the context
- State persists through the filesystem: `todos/` directory, `docs/plans/`, `docs/solutions/`
- The git worktree provides execution isolation
- `/lfg` itself is defined in `skills/lfg/SKILL.md` which contains the chaining instructions

### /slfg — Swarm Mode
`/slfg` is an experimental variant that enables **parallel worktree execution** — multiple features can be worked on simultaneously in separate worktrees. The `orchestrating-swarms` skill provides the knowledge base for this mode.

---

## 9. Review Agent Dispatch — Parallel or Sequential?

All 14 review agents run **in parallel simultaneously**. From the [official guide](https://every.to/guides/compound-engineering):

> "Spawns more than 14 specialized agents in parallel that run simultaneously: security-sentinel, performance-oracle, data-integrity-guardian, architecture-strategist, pattern-recognition-specialist, code-simplicity-reviewer, and framework-specific reviewers."

The mechanism is Claude Code's built-in **multi-agent Task system** (exposed via `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` env var or the plugin's own subagent calls). Each agent receives the same PR diff/codebase context and returns independent findings. The orchestrating skill then merges all findings into a single prioritized list.

The `setup` skill detects the project stack (web/iOS/hybrid) and writes a `compound-engineering.local.md` config file specifying which review agents to include for that project type — so not all 14 run on every project.

---

## 10. State Management — How the Pipeline Tracks Progress

The system uses **filesystem as state**, not a database or in-memory store:

| State Type | Location | Format |
|---|---|---|
| Work items / todos | `todos/*.md` | One markdown file per todo, with frontmatter: `status: ready/pending/done`, `priority: p1/p2/p3` |
| Plans | `docs/plans/*.md` | Structured plan with affected files and implementation steps |
| Brainstorms | `docs/brainstorms/*.md` | Requirements exploration output |
| Learnings | `docs/solutions/*.md` | YAML-frontmatter searchable knowledge base |
| Agent preferences | `CLAUDE.md` | Session-level instructions read at every start |
| Session config | `compound-engineering.local.md` | Project-specific agent configuration |
| Git isolation | `../feature-branch-name/` | Git worktree directory |
| Plugin settings | `.claude/settings.json` | MCP server registration, permissions |

**How learnings are retrieved**: Future `/ce:plan` runs spawn the `learnings-researcher` agent, which searches `docs/solutions/` using YAML frontmatter tags, categories, and content matching. This is the actual compounding mechanism — the filesystem becomes institutional memory.

---

## 11. Context7 MCP Server — Role and Integration

**What it is**: An HTTP-based MCP (Model Context Protocol) server that provides live framework documentation lookup for 100+ frameworks.

**Configuration** (`.mcp.json` in plugin root / `.claude/settings.json`):
```json
{
  "mcpServers": {
    "context7": {
      "type": "http",
      "url": "https://mcp.context7.com/mcp",
      "headers": {
        "x-api-key": "${CONTEXT7_API_KEY:-}"
      }
    }
  }
}
```

**Tools provided**:
- `resolve-library-id` — Find the Context7 library ID for a framework/package name
- `get-library-docs` — Retrieve up-to-date documentation for a specific library version

**When it's used**:
- During `/ce:plan`: `framework-docs-researcher` agent calls Context7 to look up docs for whatever framework the codebase uses (Rails, React, Next.js, Django, etc.)
- During `/deepen-plan`: multiple research agents may call Context7 in parallel

**Supported frameworks**: Rails, React, Next.js, Vue, Django, Laravel, TypeScript, Swift, and 90+ more.

**Authentication**: Without `CONTEXT7_API_KEY`, requests are unauthenticated and hit anonymous rate limits quickly. Set the env var to authenticate. The plugin passes it automatically via the `x-api-key` header.

**Auto-loading issue**: The bundled Context7 MCP server may not auto-load when the plugin is installed. Workaround: manually add it to `.claude/settings.json` as shown above, or globally in `~/.claude/settings.json`.

---

## 12. Skill File Format

Every skill follows this structure:

```
skills/<name>/
├── SKILL.md          ← Required. YAML frontmatter + instructions
├── references/       ← Optional. Supporting reference docs
│   └── *.md
├── assets/           ← Optional. Images, templates
└── scripts/          ← Optional. Runnable scripts
```

**`SKILL.md` format**:
```yaml
---
name: dhh-rails-style
description: Write Ruby/Rails code in DHH's 37signals style. Use when writing new Rails features.
---

# DHH Rails Style

[Instructions for the agent...]
```

Rules:
- `name` must match directory name (lowercase-with-hyphens)
- `description` must describe WHAT it does AND WHEN to use it
- All files in `references/` must be linked as `[filename.md](./references/filename.md)` — no bare backtick references
- Use imperative/infinitive form (verb-first instructions)
- Avoid second-person ("you should") — use objective language

---

## 13. The Compound Knowledge Loop — How It Actually Self-Improves

This is the architectural insight that makes the system distinctive:

```
/ce:plan
    └── learnings-researcher agent
            └── searches docs/solutions/*.md by YAML tags
                    └── finds past solutions relevant to current task
                            └── injects them into plan context
                                    └── plan is better because of past work
                                            ↓
                                    [agent implements]
                                            ↓
                                /ce:compound
                                    └── 6 parallel subagents analyze what happened
                                            └── write new doc to docs/solutions/
                                                    └── tagged with metadata for future retrieval
                                                            └── loop closes
```

The three types of knowledge codified by `/ce:compound`:
1. **Patterns**: New approaches discovered, with code examples
2. **Decisions**: Why approach A was chosen over B, with rationale and trade-offs
3. **Failures**: What went wrong, root cause, fix, and how to prevent recurrence

---

## 14. Plugin Architecture: Key Design Decisions

### Commands are now Skills (v2.39.0+)
Prior to v2.39.0, commands lived in a `commands/` directory. They were migrated to `skills/` so the plugin works identically across Claude Code, OpenCode, and Codex. The Bun/TypeScript CLI at `src/index.ts` handles conversion between formats.

### Cross-platform support
The plugin is written once and converted:
- **Claude Code**: Native format (`skills/<name>/SKILL.md`, `agents/<category>/<name>.md`)
- **OpenCode**: Converted to `~/.opencode/` with `opencode.json` + `agents/`, `skills/`, `plugins/` dirs
- **Codex**: Converted to `~/.codex/prompts` + `~/.codex/skills`
- **Factory's Droid**: `bunx droid-factory` copies and converts commands/agents/subagents
- **Cursor**: `.cursor-plugin/` directory exists in the repo

### Beta skill promotion process
New skills start with `-beta` suffix and `disable-model-invocation: true` to prevent accidental auto-triggering. After validation, they replace their stable counterparts. Beta skills are compatible with existing workflows (e.g., plans from `ce:plan-beta` work with `/ce:work`).

---

## 15. Maturity Model — 5 Stages

| Stage | Name | Description |
|---|---|---|
| **0** | Manual development | Writing code line by line, no AI |
| **1** | Chat-based assistance | ChatGPT/Claude for snippets, copy-paste |
| **2** | Agentic tools with line-by-line review | Claude Code with manual approval of every action |
| **3** | Plan-first, PR-only review | **Critical transition**: Step away during implementation, review at PR level. Compound engineering starts here. |
| **4** | Idea to PR (single machine) | `/lfg` — describe it, agent handles everything |
| **5** | Parallel cloud execution | Multiple machines, multiple agents, multiple features in parallel |

---

## 16. The 80/20 Rule and 50/50 Rule

- **80/20**: Within a feature cycle, spend 80% of time on plan and review, 20% on work and compound
- **50/50**: Across all engineering time, 50% on building features, 50% on improving the system (creating agents, documenting patterns, building test generators)

Traditional engineering: 90% features, 10% everything else → accumulates debt  
Compound engineering: 50% features, 50% system investment → inverts debt curve

---

## 17. Installation

### Claude Code
```bash
/plugin marketplace add https://github.com/EveryInc/compound-engineering-plugin
/plugin install compound-engineering
```

Or via CLI (skips marketplace setup):
```bash
npx claude-plugins install @EveryInc/every-marketplace/compound-engineering
```

### OpenCode (experimental)
```bash
bunx @every-env/compound-plugin install compound-engineering --to opencode
```

### Codex (experimental)
```bash
bunx @every-env/compound-plugin install compound-engineering --to codex
```

---

## 18. Optional Dependencies

| Dependency | Used By | Install |
|---|---|---|
| `agent-browser` | `/test-browser`, `/feature-video` | `npm install -g agent-browser && agent-browser install` |
| Context7 MCP | `/ce:plan` (framework docs) | Auto-bundled; needs `CONTEXT7_API_KEY` env var |
| `google-genai`, `pillow` (Python) | `gemini-imagegen` skill | `pip install google-genai pillow` |
| `GEMINI_API_KEY` | `gemini-imagegen` skill | Set in env |

---

## 19. Key Sources

| Source | URL |
|---|---|
| GitHub Repo | https://github.com/EveryInc/compound-engineering-plugin |
| Plugin README (component reference) | https://github.com/EveryInc/compound-engineering-plugin/blob/main/plugins/compound-engineering/README.md |
| Official Guide (every.to) | https://every.to/guides/compound-engineering |
| Original article (Dan Shipper + Kieran Klaassen) | https://every.to/chain-of-thought/compound-engineering-how-every-codes-with-agents |
| Matthew Hartman analysis | https://www.linkedin.com/pulse/compound-engineering-plugin-why-matters-matthew-hartman-8ksee |
| Niels Berglund detailed breakdown | https://nielsberglund.com/post/2026-02-22-interesting-stuff---week-08-2026/ |
| Context7 MCP server | https://mcp.context7.com/mcp |
| Claude Code Swarm Orchestration Skill (Kieran Klaassen) | https://gist.github.com/kieranklaassen/4f2aba89594a4aea4ad64d753984b2ea |
