# Ecosystem Synthesis: Three Architectures Compared → Our Decomposition Options

**Date:** 2026-03-20  
**Purpose:** Compare Superpowers, GSD, and Compound Engineering ecosystem patterns. Then propose how to decompose our forge system into a multi-skill series.

---

## Part 1: Three Architectures Side-by-Side

### 1.1 Fundamental Shape

| Dimension | Superpowers (14 skills) | GSD (37 cmds + 41 workflows + 15 agents) | Compound Engineering (45+ skills + 29 agents) |
|---|---|---|---|
| **Core metaphor** | Skills = lazy-loaded prompt expansions | Commands → Workflows → Agents (3-layer) | Skills orchestrate Agents |
| **Entry point** | Agent reasoning (skill triggers by description match) | User-typed `/gsd:command` | User-typed `/ce:command` or `/lfg` |
| **Orchestration** | No orchestrator. Agent decides. Chaining = text directives in SKILL.md | Workflow .md files ARE the orchestrators. `gsd-tools init` loads context | Skill SKILL.md files chain steps. `/lfg` chains full pipeline |
| **State** | File conventions: `docs/superpowers/specs/`, `docs/superpowers/plans/` + git | `.planning/` directory: STATE.md (lockfile-protected), ROADMAP.md, config.json | `docs/solutions/`, `docs/plans/`, `todos/` + git worktrees |
| **Bootstrap** | SessionStart hook → injects `using-superpowers` SKILL.md | SessionStart hook → version check. All context via `gsd-tools init` | Plugin install → CLAUDE.md |
| **Agent dispatch** | `Task` tool with prompt templates in skills | `Task` tool with agent .md files (15 specialized agents) | `Task` tool with agent .md files (29 specialized agents) |
| **CLI tools** | None (pure prompt) | `gsd-tools.cjs` (15 modules, 350KB+) | None (pure prompt + MCP for Context7) |
| **Total skill count** | 14 | ~41 workflows + 37 commands = 78 addressable units | 45+ skills |
| **Hook count** | 1 (SessionStart) | 4 (statusline, context-monitor, check-update, workflow-guard) | 0 |

### 1.2 How They Chain

| Pattern | Superpowers | GSD | Compound Engineering |
|---|---|---|---|
| **Mechanism** | Explicit name reference in SKILL.md text ("Invoke writing-plans skill") | User manually runs next command. Workflow outputs suggest next step | Skill A loads Skill B by name. `/lfg` hard-codes the full sequence |
| **Who decides** | Agent (guided by text directives) | User (between phases) + Workflow (within phase) | Agent (guided by skill text) OR `/lfg` (automated) |
| **Granularity** | Skill-to-skill (14 nodes) | Command-to-command (37 nodes) | Skill-to-skill (7 core workflow nodes) |
| **Automation level** | Semi-auto: agent follows directives but user can interrupt | Manual: user must type each command | Both: manual loop OR `/lfg` for full auto |

### 1.3 What Each Gets Right

**Superpowers:**
- Flat namespace = simple mental model. 14 skills, no nesting
- Persuasion psychology in skill text (not code enforcement) — actually works
- TDD-for-skills methodology (red/green/refactor pressure tests)
- Skills are small: most under 100 lines. Only `writing-skills` (655 lines) is large
- No CLI dependency = zero install friction beyond the plugin itself

**GSD:**
- Three-layer separation (command → workflow → agent) keeps each layer focused
- `gsd-tools init` as THE context-loading primitive — brilliant engineering. Every workflow starts the same way
- `.planning/` as structured project state (STATE.md, ROADMAP.md, config.json) — most mature state management
- Wave-based parallel execution with dependency analysis
- Pause/resume with `continue-here.md` handoff
- Advisory hooks (never imperative) — learned lesson from community feedback

**Compound Engineering:**
- The compound knowledge loop (docs/solutions/ → learnings-researcher → future plans) — genuinely self-improving
- Massive agent parallelism (14 review agents, 40+ deepen-plan agents) — brute-force quality
- `/lfg` as one-command full pipeline — lowest friction for experienced users
- Beta skill promotion process (disable-model-invocation → test → promote)
- Every problem becomes a searchable document

### 1.4 What Each Gets Wrong (or We Should Avoid)

**Superpowers:**
- No structured state between sessions — relies entirely on git + file conventions
- No pause/resume mechanism
- No parallel execution model (dispatching-parallel-agents is a skill but it's generic)
- No phase tracking — if interrupted, you have to re-read files to figure out where you are

**GSD:**
- Massive complexity: 37 commands + 41 workflows + 15 agents + 15 CLI modules = steep learning curve
- Heavy CLI dependency (`gsd-tools.cjs` = 350KB+ JavaScript) — tightly coupled
- Redundant commands: `quick`, `fast`, `do`, `autonomous` all do similar things
- Over-engineering for small projects (full phase system for a one-file fix)

**Compound Engineering:**
- Marketing count vs reality discrepancy (13 skills vs 45+) — confusing
- No structured state management (no STATE.md equivalent) — relies on `todos/` and `docs/`
- No pause/resume mechanism
- Context7 MCP dependency for framework docs — single point of failure
- Company-specific agents (DHH reviewer, Kieran reviewer) — not generalizable

---

## Part 2: Your Existing Ecosystem Analysis

### 2.1 Current Skills

| Skill | Lines | Role | Dependencies |
|---|---|---|---|
| `planning` | 422 | Discovery → Synthesis → Spikes → Decomposition → Validation → Track Planning | beads (bd), bv, gkg, oracle, librarian |
| `orchestrator` | 292 | Spawn workers, monitor via Agent Mail, handle cross-track issues | Agent Mail, bv, beads |
| `worker` | 285 | Execute beads within a track, context persistence via Agent Mail | Agent Mail, gkg, morph, beads |
| `knowledge` | ~150 | Knowledge management | ? |
| `issue-resolution` | ~300 | Debug/resolve issues | ? |
| `prompt-leverage` | ~75 | Prompt engineering techniques | Standalone |
| `book-sft-pipeline` | ~350 | Domain-specific: SFT data pipeline | Standalone |

### 2.2 Current Chain

```
planning → orchestrator → worker (parallel)
                ↑                    ↓
           Agent Mail ←──────── Agent Mail
                ↑
          issue-resolution (when problems arise)
          knowledge (when learning needed)
```

### 2.3 What's Working Well

- **beads + bv + Agent Mail** — strong tooling trinity already integrated
- **planning → orchestrator → worker** — clean 3-skill chain, each with clear responsibility
- **Track-based parallel execution** — already designed for multi-agent
- **File scope reservations** — prevents conflicts

### 2.4 What's Missing (Compared to Frameworks)

| Gap | Superpowers Has | GSD Has | Compound Has | Your System Has |
|---|---|---|---|---|
| Bootstrap/meta skill | `using-superpowers` | hook + CLAUDE.md setup | Plugin install | ❌ None |
| Brainstorm/explore phase | `brainstorming` | `discuss-phase` | `ce:brainstorm` | ❌ None (planning starts at discovery) |
| Structured state tracking | File conventions | `.planning/STATE.md` | `todos/` dir | ❌ None |
| Review/quality gate | `requesting-code-review` | `verify-work` + plan-checker | `ce:review` (14 agents) | ❌ None |
| Knowledge compounding | ❌ None | ❌ None | `ce:compound` (docs/solutions/) | `knowledge` skill (exists but basic) |
| Debugging skill | `systematic-debugging` | `gsd-debugger` | `reproduce-bug` | `issue-resolution` (exists) |
| Pause/resume | ❌ None | `pause-work` / `resume-work` | ❌ None | ❌ None |
| Skill authoring | `writing-skills` | ❌ None | `create-agent-skill` | ❌ None |
| Git worktree management | `using-git-worktrees` | ❌ (done in workflows) | `git-worktree` | In `planning` Phase 0 |
| Context monitoring | ❌ None | `gsd-context-monitor` hook | ❌ None | ❌ None |

---

## Part 3: Decomposition Options

### Option A: "Superpowers-Style" — Flat Skills, Agent Decides

```
Skills (10-12):
├── using-forge          ← Meta/bootstrap (like using-superpowers)
├── brainstorming        ← Explore before planning (NEW)
├── planning             ← Existing, refined
├── orchestrating        ← Existing orchestrator, refined
├── executing            ← Existing worker, refined
├── reviewing            ← Code review gate (NEW)
├── debugging            ← Existing issue-resolution, refined
├── compounding          ← Knowledge capture (enhanced knowledge skill)
├── finishing            ← Branch cleanup, PR (NEW)
├── writing-skills       ← Meta: create new skills (NEW)
└── using-worktrees      ← Git worktree management (extracted from planning)
```

**How it chains:** Explicit name references in SKILL.md text. No orchestrator layer.
**State:** File conventions (like Superpowers)
**Pros:** Simple, flat, low overhead, easy to understand
**Cons:** No structured state tracking, no pause/resume, no context awareness

### Option B: "GSD-Hybrid" — Skills + CLI Helper + State Layer

```
Skills (8-10):
├── forge-bootstrap      ← Meta/bootstrap + state init
├── forge-brainstorm     ← Explore phase
├── forge-plan           ← Planning (existing)
├── forge-execute        ← Orchestrator + worker combined into one skill
├── forge-review         ← Quality gate
├── forge-compound       ← Knowledge capture
├── forge-debug          ← Issue resolution
├── forge-finish         ← Branch cleanup
└── forge-meta           ← Skill authoring

State layer: .forge/ directory (like .planning/)
├── STATE.md
├── config.json
└── history/

CLI helper: forge-tools (optional)
├── init <workflow>      → loads compound context
├── state update/patch   → manages STATE.md
└── status              → progress dashboard
```

**How it chains:** Skills reference each other by name. User drives phase transitions (like GSD).
**State:** `.forge/` directory with STATE.md
**Pros:** Structured state, pause/resume possible, CLI helper optional
**Cons:** More complex, CLI adds maintenance burden

### Option C: "Compound-Style" — Skills + Agent Catalog + Pipeline Command

```
Skills (7 core + agent catalog):
├── forge-plan           ← Spawns research agents in parallel
├── forge-execute        ← Wave-based execution (orchestrator)
├── forge-review         ← Spawns review agents in parallel
├── forge-compound       ← Spawns analysis agents for knowledge capture
├── forge-debug          ← Issue resolution
├── forge-finish         ← Branch cleanup + PR
├── forge-lfg            ← Full pipeline: plan → execute → review → compound

Agent catalog (agents/):
├── research/
│   ├── codebase-mapper.md
│   ├── pattern-researcher.md
│   └── external-researcher.md
├── review/
│   ├── architecture-reviewer.md
│   ├── test-coverage-reviewer.md
│   └── code-quality-reviewer.md
└── execution/
    └── worker.md

Bootstrap: forge-meta skill (using-forge)
```

**How it chains:** `forge-lfg` hard-codes the sequence. Manual mode: user invokes skills individually.
**State:** `docs/solutions/` for compounded learnings, `history/` for plans
**Pros:** Massive parallelism, self-improving via compound loop, one-command pipeline
**Cons:** Agent catalog maintenance, heavy context usage, overkill for small tasks

### Option D: "Evolutionary" — Extend Existing + Add Missing Layers

```
Existing skills (refined):
├── planning             ← Keep, add brainstorm phase at front
├── orchestrator         ← Keep as-is
├── worker               ← Keep as-is
├── issue-resolution     ← Keep, rename to debugging
├── knowledge            ← Keep, enhance with compound pattern

New skills:
├── using-forge          ← Bootstrap/meta skill (NEW)
├── reviewing            ← Quality gate skill (NEW)
├── finishing            ← Branch cleanup + PR (NEW)
├── forge-tools          ← Skill for creating new forge skills (NEW, meta)

No CLI helper. No separate state layer.
beads + bv + Agent Mail remain the infrastructure.
```

**How it chains:** Same as now (planning → orchestrator → worker) but with new skills at review/finish/knowledge gates.
**State:** Existing bead state + history/ directory
**Pros:** Lowest risk, builds on working system, preserves all existing patterns
**Cons:** Doesn't address the missing brainstorm/state/pause gaps as cleanly

---

## Part 4: Synthesis Recommendation

### The Pattern That Emerges

Across all three frameworks, the "right" decomposition has these properties:

1. **Flat namespace** — All skills at one level (no nesting). Both Superpowers (14 flat) and Compound Engineering (45+ flat) prove this works. GSD's three layers add unnecessary indirection.

2. **A bootstrap/meta skill** — One skill injected at session start that teaches the agent about all other skills. Every framework has this.

3. **Phase-based but user-driven** — Each phase (brainstorm, plan, execute, review, compound) is a separate skill. Transitions are user-driven (GSD's approach) with optional full-auto mode (Compound's `/lfg`).

4. **Beads/tasks as the atomic unit** — Your system already has this via beads + bv. This is stronger than GSD's PLAN.md or Superpowers' TodoWrite.

5. **Skills are 100-400 lines** — Superpowers keeps most skills under 100 lines. GSD workflows are 10-40KB (too large). Sweet spot is 100-400 lines.

6. **Agent Mail as the coordination primitive** — Your existing Agent Mail integration is equivalent to GSD's state management but more flexible. Keep it.

### My Recommendation: Option A+D Hybrid

```
Skill Series: "Forge" (9 skills)

Core Workflow Skills (ordered pipeline):
1. using-forge           ← Bootstrap. Lists all skills. Loaded at session start.
2. brainstorming         ← Explore requirements, constraints, approaches
3. planning              ← Existing. Discovery → Synthesis → Spikes → Beads
4. orchestrating         ← Existing orchestrator. Wave execution via Agent Mail
5. executing             ← Existing worker. Bead execution within tracks
6. reviewing             ← NEW. Quality gate. Architecture + test + code review
7. compounding           ← Enhanced knowledge. Pattern/Decision/Failure capture
8. finishing             ← NEW. Branch cleanup, PR creation, bead close-out

Meta Skill:
9. writing-forge-skills  ← Create new skills for this ecosystem

Chain: 1 (always) → 2 → 3 → 4 → [5 parallel] → 6 → 7 → 8
Optional: skip 2 for small features. Skip 6-7 for quick fixes.
```

**Why this hybrid:**
- **Option A's flat simplicity** — 9 skills, all at one level, no CLI dependency
- **Option D's evolutionary approach** — preserves your existing planning/orchestrator/worker chain
- **Superpowers' chaining mechanism** — explicit name references in SKILL.md text
- **Compound's knowledge loop** — compounding skill captures learnings for future plans
- **GSD's user-driven transitions** — each skill ends with "next step" suggestions, user decides
- **Beads + bv + Agent Mail** remain the infrastructure (not replaced, not abstracted)

**What I deliberately excluded:**
- CLI helper (gsd-tools) — unnecessary complexity for 9 skills
- Hooks — your tooling (beads, bv, AM) handles state. No need for context monitoring hooks
- Agent catalog (separate agents/) — embed agent prompts in skills that dispatch them (like Superpowers)
- Separate state directory (.forge/) — beads IS your state. Don't duplicate it.

---

## Part 5: Open Questions for Discussion

1. **Naming**: "Forge" as the series name? Or something else?
2. **Brainstorming scope**: Should brainstorming be a full Superpowers-style Socratic dialog, or lighter?
3. **Review skill**: How many review agents? Architecture + test coverage + code quality = 3? Or more?
4. **Compounding**: Where do compound learnings go? `docs/solutions/` (Compound-style)? `history/learnings/`?
5. **using-forge bootstrap**: Hook injection (like Superpowers) or manual invocation?
6. **writing-forge-skills**: Include TDD-for-skills methodology (Superpowers) or simpler?
7. **CASS/CM**: You said optional. Should compounding skill have an optional CASS integration path?
8. **GKG integration**: Currently in planning and worker. Should it be a separate skill or stay embedded?
9. **Full-auto mode**: Add a `/forge:lfg` equivalent that chains 2→3→4→5→6→7→8 automatically?
10. **Existing skills**: Replace planning/orchestrator/worker/knowledge/issue-resolution? Or keep both sets?
