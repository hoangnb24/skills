# Flywheel / ACFS Ecosystem: Exhaustive Deep Dive

**Research date:** 2026-03-20  
**Author:** Jeffrey Emanuel (@doodlestein)  
**Primary domain:** [agent-flywheel.com](https://agent-flywheel.com)  
**Core GitHub org:** [github.com/Dicklesworthstone](https://github.com/Dicklesworthstone)

---

## Table of Contents

1. [What is the Flywheel / ACFS?](#1-what-is-the-flywheel--acfs)
2. [The Flywheel Philosophy](#2-the-flywheel-philosophy)
3. [Beads System (br)](#3-beads-system-br)
4. [Beads Viewer (bv)](#4-beads-viewer-bv)
5. [Agent Mail (am / MCP Agent Mail)](#5-agent-mail-am--mcp-agent-mail)
6. [CASS — Coding Agent Session Search](#6-cass--coding-agent-session-search)
7. [CM — CASS Memory System (Cognitive Memory)](#7-cm--cass-memory-system-cognitive-memory)
8. [DCG — Destructive Command Guard](#8-dcg--destructive-command-guard)
9. [SLB — Simultaneous Launch Button](#9-slb--simultaneous-launch-button)
10. [NTM — Named Tmux Manager](#10-ntm--named-tmux-manager)
11. [UBS — Ultimate Bug Scanner](#11-ubs--ultimate-bug-scanner)
12. [ACFS — Agentic Coding Flywheel Setup](#12-acfs--agentic-coding-flywheel-setup)
13. [The Complete Workflow: Plan → Beads → Swarm](#13-the-complete-workflow-plan--beads--swarm)
14. [Community Reception](#14-community-reception)
15. [Limitations and Criticisms](#15-limitations-and-criticisms)
16. [Ecosystem Map and Tool Interactions](#16-ecosystem-map-and-tool-interactions)

---

## 1. What is the Flywheel / ACFS?

The **Agentic Coding Flywheel System (ACFS)** is a cohesive ecosystem of 35+ open-source command-line tools, methodologies, and workflows created by **Jeffrey Emanuel** (former quant investor, NYC) under the GitHub handle [@Dicklesworthstone](https://github.com/Dicklesworthstone). The ecosystem is documented at [agent-flywheel.com](https://agent-flywheel.com/flywheel) and installs via a single `curl | bash` command.

**Core premise:** Most agentic coding approaches fail because they skip structured planning, have no inter-agent coordination, and generate irreproducible results. The Flywheel imposes discipline: exhaustive upfront planning in markdown, conversion to a dependency graph of tasks ("beads"), then parallel multi-agent execution with messaging, safety guards, and persistent cross-session memory.

**Stack size:** 35 tools (8 core, 27 supporting). Written in Go, Rust, TypeScript, Python, and Bash.  
**GitHub stars (core repo):** 5,300+ as of March 2026 ([agent-flywheel.com/flywheel](https://agent-flywheel.com/flywheel))  
**Proven real-world result cited:** 5,500-line markdown plan → 347 beads → 11,000 lines of production code with 204 commits in ~5 hours using 25 agents.

---

## 2. The Flywheel Philosophy

### Why "flywheel"?

A flywheel accumulates angular momentum: small pushes add up, and over time it spins faster with less effort. The methodology works the same way according to its author. As Jeffrey Emanuel wrote on X in November 2025:

> "My agentic coding workflow has gotten so meta and self-referential lately. I can feel the flywheel spinning faster and faster now as my level of interaction/prompting is increasingly directed at driving my own tools." — [@doodlestein](https://x.com/doodlestein/status/1994526015587266875)

Each completed project cycle **upgrades the artifacts feeding the next one**:

- Session history (CASS) grows → future agents can find past solutions in <60ms
- Procedural rules (CM) accumulate → agents avoid re-making the same mistakes
- Beads templates mature → new projects require less planning
- Safety guards (DCG, SLB) catch regressions before they compound

The self-reinforcing loop is captured in the design philosophy on the website ([agent-flywheel.com/flywheel](https://agent-flywheel.com/flywheel)):

> "The magic isn't in any single tool. It's in how they work together. Using three tools is 10x better than using one."

### Three Reasoning Spaces

The methodology divides work into three fundamentally different contexts, each with distinct artifacts and cost profiles:

| Space | Primary Artifact | What Happens There | Rework Cost |
|---|---|---|---|
| **Plan space** | Large markdown plan | Architecture, features, workflows, tradeoffs — full system fits in context | 1× |
| **Bead space** | `.beads/` dependency graph | Task boundaries, execution order, embedded context for agents | 5× |
| **Code space** | Source files + tests | Implementation and verification only | 25× |

**Key insight from the guide:** "Planning is the cheapest place to buy correctness." A bug caught in plan space costs 25× less to fix than one caught in code space. This is the "Law of Rework Escalation." ([agent-flywheel.com/complete-guide](https://agent-flywheel.com/complete-guide))

### The 85% Rule

Jeffrey Emanuel spends 85% of his time in planning phases. The reasoning: a 6,000-line markdown plan is still vastly smaller than the codebase it describes. Models can hold the entire plan in context and reason globally. Once code is being written, the system is too large for holistic understanding.

### Agent Fungibility Philosophy

The system treats agents as **interchangeable generalists**, not specialists. Any Claude Code, Codex, or Gemini session can pick up any task from the bead graph. This design choice means crashes, context compaction, and amnesia are survivable — the swarm continues. The `agent-fungibility` skill in the Clawdbot skills collection ([github.com/Dicklesworthstone/agent_flywheel_clawdbot_skills_and_integrations](https://github.com/Dicklesworthstone/agent_flywheel_clawdbot_skills_and_integrations)) encodes this philosophy as a reusable instruction set.

---

## 3. Beads System (br)

**GitHub:** [github.com/Dicklesworthstone/beads_rust](https://github.com/Dicklesworthstone/beads_rust) (active Rust port; original Go: [steveyegge/beads](https://github.com/steveyegge/beads))  
**Stars:** 128 (Rust port)  
**Language:** Rust

### What is a Bead?

A bead is a **self-contained work unit** analogous to a Jira or Linear task, but "optimized for use by coding agents." Unlike human-readable project management tickets, beads embed enough local context that a fresh agent can open one and immediately understand what correct implementation looks like, why it matters, and how to verify it. As the Complete Guide states:

> "If the beads are weak, the swarm becomes improvisational. If the beads are rich, the swarm becomes almost mechanical." — [agent-flywheel.com/complete-guide](https://agent-flywheel.com/complete-guide)

### Three-Field Structure

The canonical bead has three core conceptual fields (serialized to JSONL):

1. **Description** — The *what* and *why*: outcome expectations, acceptance criteria, rationale, design intent, and how this bead serves the overarching project goals. Rich markdown is allowed; length is explicitly encouraged over brevity.
2. **Design** — The *how*: architecture decisions, implementation approach, interfaces, test obligations, and edge cases the agent must handle. This field prevents agents from improvising architecture.
3. **Notes** — The *future self* context: anything a future agent (or human) would want to know — reasoning, tradeoffs considered, what was explicitly rejected and why.

Beyond the three conceptual fields, beads carry structured metadata in the JSONL format:

```jsonl
{
  "id": "br-101",
  "title": "Upload and Parse Pipeline",
  "status": "open",
  "priority": 2,
  "type": "task",
  "labels": ["backend", "core"],
  "dependencies": ["br-100"],
  "blocked_by": [],
  "created_at": "...",
  "updated_at": "...",
  "description": "...[rich markdown content]..."
}
```

### Storage: SQLite + JSONL Hybrid

Beads use a **SQLite primary storage** with **JSONL export** that commits alongside the code in `.beads/issues.jsonl`. This dual-persistence design is intentional:

- SQLite provides fast querying, FTS, and dependency graph traversal during active development
- JSONL provides human-readable git history — every bead change is auditable
- The `br sync --flush-only` command exports to JSONL without running git operations (non-invasive)

**Important:** The beads system is explicitly designed to **never run git commands automatically** — the developer controls all commits.

### Priority and Type Schema

- **Priority:** P0=critical, P1=high, P2=medium, P3=low, P4=backlog
- **Types:** task, bug, feature, epic, question, docs
- **Status lifecycle:** open → in_progress → blocked → closed

### Bead Lifecycle Commands

```bash
br create --title "..." --priority 2 --label backend    # Create issue
br list --status open --json                             # List open issues
br ready --json                                          # Show unblocked tasks only
br show <id>                                             # View issue details
br update <id> --status in_progress                      # Claim task
br close <id> --reason "Completed"                       # Close task
br dep add <id> <other-id>                               # Add dependency
br comments add <id> "Found root cause..."               # Add comment
br sync --flush-only                                     # Export to JSONL
```

### Why Better than Plain Markdown Tasks?

The critical difference is **dependency graph** + **graph-theory routing**. Plain markdown task lists have no structure for computing execution order. The bead graph enables `bv` (Beads Viewer) to compute which tasks unblock the most downstream work, detect cycles, and plan parallel execution tracks. A plain markdown task cannot be fed to a PageRank algorithm.

Additionally, beads embed rationale and test obligations directly in the task. A plain markdown task says "add user auth." A bead says "add user auth using JWT RS256, here's why we chose RS256 over HS256, here are the edge cases (token expiry, clock skew, rotation), here are the exact unit tests expected, here's what 'done' means."

### Polishing: "Check Your Beads N Times, Implement Once"

The guide recommends 4-6+ polishing rounds before implementation. Each round typically finds:
- Duplicate or overlapping beads
- Missing dependency links
- Incomplete descriptions
- Test obligations not specified
- Context that exists in the markdown plan but wasn't transferred

Convergence is detected by three signals: agent responses getting shorter, rate of change decelerating, and successive rounds becoming more similar. A weighted convergence score >0.75 signals readiness; >0.90 means diminishing returns. ([agent-flywheel.com/complete-guide](https://agent-flywheel.com/complete-guide))

---

## 4. Beads Viewer (bv)

**GitHub:** [github.com/Dicklesworthstone/beads_viewer](https://github.com/Dicklesworthstone/beads_viewer)  
**Stars:** 891  
**Language:** Go  
**Demo:** [dicklesworthstone.github.io/beads_viewer-pages/](https://dicklesworthstone.github.io/beads_viewer-pages/)

### What is bv?

Beads Viewer is a **graph-theory triage engine** for the beads task tracker. It transforms raw dependency data into actionable intelligence for both humans (TUI) and agents (robot flags). The key differentiation from `br` is that `bv` answers strategic questions: *which task do I work on next to maximize downstream velocity?*

### The 9 Graph Metrics

The Beads Viewer computes nine distinct graph-theoretic metrics from the bead dependency DAG, each revealing a different structural property:

| Metric | Name | Formula | What It Reveals |
|---|---|---|---|
| 1 | **PageRank** | Iterative link-following probability distribution | Overall "influence" — beads that many important beads depend on |
| 2 | **Betweenness Centrality** | BW(v) = Σ(paths through v)/(total paths) for all pairs | Bottlenecks — beads lying on many shortest paths between others |
| 3 | **Impact Depth (Keystones)** | Impact(v) = 1 + max(Impact(u)) for all u depending on v | How deep in the dependency chain — foundational beads |
| 4 | **Eigenvector Centrality (Influencers)** | EV(v) = (1/λ) × Σ A[v,u] × EV(u) | Connections to well-connected beads — wide-reaching impact |
| 5 | **Direct Blocker Count** | Blocks(v) = count of issues where v is a direct blocker | Immediate unblocking potential |
| 6 | **HITS Hub Score** | Hub(v) = Σ Authority(u) for all u where v→u | Aggregators — high-level features/epics depending on many authorities |
| 7 | **HITS Authority Score** | Auth(v) = Σ Hub(u) for all u where u→v | Foundational services/components depended upon by many hubs |
| 8 | **K-Core Cohesion** | k = max core that node remains in after iterative degree peeling | Tightly coupled clusters — changes ripple locally |
| 9 | **Cut Points (Articulation Vertices)** | Tarjan's algorithm on undirected graph view | Single points of failure — removal disconnects parts of the graph |

### Triage Score (Composite)

bv computes a composite **triage score** for each open bead, weighting the metrics:

| Metric Component | Weight |
|---|---|
| PageRank | 22% |
| Betweenness Centrality | 20% |
| Blocker Count | 13% |
| Priority (P0-P4) | 10% |
| Time in Queue | 10% |
| Urgency (labels) | 10% |
| Risk | 10% |
| Staleness | 5% |

High-priority beads score >0.7; medium 0.3–0.7; low <0.3. ([beads_viewer-pages demo](https://dicklesworthstone.github.io/beads_viewer-pages/))

### Robot Modes (--robot-* flags)

bv was designed with agents as primary consumers. Instead of parsing JSONL or hallucinating graph traversal, agents call deterministic robot flags that return structured JSON:

| Flag | Output | Agent Use Case |
|---|---|---|
| `bv --robot-help` | All AI-facing commands | Discovery / capability check |
| `bv --robot-insights` | PageRank, betweenness, HITS, critical path, cycles | Quick triage: "What's most impactful?" |
| `bv --robot-plan` | Parallel tracks, items per track, unblocks lists | Execution planning: "What can run in parallel?" |
| `bv --robot-priority` | Priority recommendations with reasoning + confidence | Task selection: "What should I work on next?" |
| `bv --robot-recipes` | Available filter presets | Workflow setup: "Show me ready work" |
| `bv --robot-diff --diff-since <ref>` | Changes since commit/date | Progress tracking: "What changed?" |
| `bv --robot-graph` | Full DAG visualization data | Dependency tree as JSON |
| `bv --robot-triage` | Ranked recommendations with full alert details | Full triage dump with reasons |

**Why robot modes are critical:** Without these flags, agents parsing JSONL directly tend to hallucinate graph traversal results, miss dependency chains, or compute incorrect execution order. The robot flags are pre-computed, deterministic outputs from the graph engine — agents trust them. Source: [github.com/Dicklesworthstone/beads_rust/blob/main/PLAN_TO_PORT_BEADS_WITH_SQLITE_AND_ISSUES_JSONL_TO_RUST.md](https://github.com/Dicklesworthstone/beads_rust/blob/main/PLAN_TO_PORT_BEADS_WITH_SQLITE_AND_ISSUES_JSONL_TO_RUST.md)

### Cycle Detection

bv detects circular dependencies in the DAG and suggests specific edge removals to break them (Tarjan's articulation algorithm). This prevents deadlocks where Agent A waits for Agent B which waits for Agent A.

### Integration with Agent Mail

The intended workflow combining bv + Agent Mail:
1. Agent A runs `bv --robot-priority` → identifies `br-42` as highest-impact
2. Agent A reserves files via Agent Mail: `file_reservation_paths(..., reason="br-42")`
3. Agent A announces to other agents via Agent Mail: `send_message(..., thread_id="br-42")`
4. Other agents see the reservation and pick different tasks from bv's next recommendation
5. Agent A completes → runs `bv --robot-diff` to report downstream unblocks

---

## 5. Agent Mail (am / MCP Agent Mail)

**GitHub:** [github.com/Dicklesworthstone/mcp_agent_mail](https://github.com/Dicklesworthstone/mcp_agent_mail)  
**Stars:** 1,400  
**Language:** Python  
**Description:** "Like Gmail for your coding agents"

### What is Agent Mail?

MCP Agent Mail is an **asynchronous coordination layer** for multi-agent workflows. It gives agents memorable identities, an inbox/outbox, searchable message history, and **advisory file reservation "leases"** to prevent edit conflicts. It is exposed as an HTTP-only FastMCP server backed by Git (human-auditable artifacts) and SQLite (fast queries).

### Core Problem Solved

Without coordination, multiple agents working in the same codebase:
- Overwrite each other's edits or panic on unexpected diffs
- Miss critical context from parallel workstreams
- Require humans to "liaison" messages across tools

### File Reservation Protocol

The most important coordination primitive is **advisory file reservations** (leases). This is the primary mechanism preventing file conflicts:

```python
# Agent claims files before editing
file_reservation_paths(
    project_key="/path/to/project",
    agent_name="GreenCastle",
    paths=["src/auth/**", "src/middleware/jwt.ts"],
    ttl_seconds=3600,  # 1-hour TTL
    exclusive=True,    # Prevents others from claiming same paths
    reason="br-42"     # Links to bead ID for audit trail
)
```

Key properties:
- **TTL (Time-to-Live):** Reservations expire automatically — no permanent locks. Default: 3600s. Agents that crash or get compacted don't permanently block others.
- **Advisory (not enforced):** The system signals intent, not a hard lock. Other agents can see reservations via the Agent Mail web UI and choose to work on different files. A pre-commit guard (`AGENT_NAME` env var) can optionally enforce it at commit time.
- **Audit trail:** All reservations, messages, and file claims are stored as human-readable markdown in a per-project Git repo. The entire history of "Agent A reserved file X at 14:32, released at 15:01" is auditable.

### `macro_start_session`

The `macro_start_session` macro bundles common session-start operations:
1. Registers the agent identity (`register_agent`)
2. Ensures the project exists (`ensure_project`)
3. Fetches unread messages from inbox
4. Announces availability to other agents

This gives agents a single call to join the swarm coordination fabric. Equivalent to "clocking in" at the start of a work session.

### Message Architecture

```
HTTP POST /mcp (FastMCP)
     ↓
SQLite FTS5 (fast search + file reservations)
     ↓
Git repo (human-auditable markdown artifacts)
     ├── agents/profile.json
     ├── agents/mailboxes/...
     ├── messages/YYYY/MM/id.md
     ├── file_reservations/sha1.json
     └── attachments/xx/sha1.webp
```

Messages support:
- GitHub-Flavored Markdown bodies with images
- Threaded conversations (shared `thread_id` = bead ID convention)
- Importance levels (HIGH priority for Human Overseer messages)
- `ack_required` flag that surfaces overdue acknowledgments
- Full-text search via FTS5

### Human Overseer

The Agent Mail web UI at `/mail/{project}/overseer/compose` lets a human send **high-priority broadcast messages** to all registered agents. Every overseer message includes an automatic preamble instructing agents to:
1. Temporarily pause current work
2. Complete the human's request
3. Resume original plans afterward

This is the "clockwork deity" interface — the human who "designed the machine, set it running, and now manages it."

### Multi-Repo Coordination

For monorepos: all agents register under the same `project_key`.  
For frontend+backend split repos: Option A = single shared project_key with path-scoped reservations (e.g., `frontend/**` vs `backend/**`); Option B = separate projects linked via `macro_contact_handshake`.

Source: [github.com/Dicklesworthstone/mcp_agent_mail](https://github.com/Dicklesworthstone/mcp_agent_mail)

---

## 6. CASS — Coding Agent Session Search

**GitHub:** [github.com/Dicklesworthstone/coding_agent_session_search](https://github.com/Dicklesworthstone/coding_agent_session_search)  
**Stars:** 307  
**Language:** Rust (Tantivy search engine)  
**HackerNews Show HN:** [news.ycombinator.com/item?id=46130481](https://news.ycombinator.com/item?id=46130481)

### What is CASS?

CASS is a **unified, high-performance TUI and CLI** for indexing and searching all local coding agent session history across 11+ providers. It solves a direct pain point articulated in the Show HN post: "I'll know that I talked about something, but be unable to find it or even remember where to try to look for it."

### Supported Formats (11+ Agent Providers)

| Agent | Storage Location | Format |
|---|---|---|
| **Claude Code** | `~/.claude/projects` | Session JSONL |
| **Codex CLI** | `~/.codex/sessions` | Rollout JSONL |
| **Cursor** | `~/Library/Application Support/Cursor/User/` (global + workspace) | SQLite `state.vscdb` |
| **Gemini CLI** | `~/.gemini/tmp` | Chat JSON |
| **Cline** | VS Code global storage | Task directories |
| **Aider** | `~/.aider.chat.history.md` and per-project | Markdown |
| **ChatGPT** | `~/Library/Application Support/com.openai.chat` | v1 unencrypted JSON; v2/v3 encrypted |
| **OpenCode** | `.opencode` directories | SQLite |
| **Amp** | `~/.local/share/amp` & VS Code storage | Various |
| **Pi-Agent** | `~/.pi/agent/sessions` | Proprietary JSON |
| **Factory (Droid)** | Factory-specific | Proprietary |
| **Clawdbot** | `~/.clawdbot/sessions` | Session JSONL |

### How CASS Indexes

1. **Discovery phase:** CASS scans all known agent storage paths and normalizes disparate formats into a common `Conversation → Message → Snippet` schema
2. **Tokenization:** Handles `snake_case` (splits "my_var" into "my" and "var"), hyphenated terms, code symbols (`c++`, `foo.bar`)
3. **Edge N-Gram Indexing:** Pre-computes prefix matches at index time — "cal" → "calculate" — so queries get O(1) lookup (Tantivy-powered)
4. **Atomic updates:** Background indexer commits atomically; reader.reload() shows new messages without restart

### Search Modes

| Mode | Algorithm | Best For |
|---|---|---|
| **Lexical** (default) | BM25 full-text | Exact term matching, code searches |
| **Semantic** | Local MiniLM vector similarity (FastEmbed) | Conceptual queries, "find similar" |
| **Hybrid** | Reciprocal Rank Fusion (RRF): Σ 1/(K+rank_i), K=60 | Balanced precision and recall |

**Local-only semantic search:** When ML model files are present (`model.onnx`, `tokenizer.json`, etc.), CASS uses a local MiniLM model with no cloud calls. When absent, it falls back to a hash-based FNV-1a embedder (deterministic, lexical overlap only, near-instant).

### Performance

- Sub-60ms full-text search over millions of messages
- "Search-as-you-type": results update with every keystroke
- Tantivy BM25 engine

### Robot Mode (for Agents)

⚠️ **Never run bare `cass`** in agent context — it launches the interactive TUI. Always use `--robot` or `--json` flags:

```bash
cass health --json               # Check index health
cass search "auth error" --robot --limit 5 --fields minimal
cass view /path/session.jsonl -n 42 --json
cass expand /path/session.jsonl -n 42 -C 3 --json
cass robot-docs guide            # LLM-optimized docs
```

### Purpose: Prevent Re-Solving

The core use case for agents is stated in the agent-facing documentation bundled with the tool:

> "Before solving a problem from scratch, check if any agent already solved something similar. Cross-agent knowledge: Find solutions from Codex when using Claude, or vice versa." — CASS SKILL.md

CASS is the **institutional memory** layer of the Flywheel. Every session generates searchable history. Past solutions become retrievable in <60ms. This is the "C" in the Flywheel's collective memory stack (CASS → CM).

---

## 7. CM — CASS Memory System (Cognitive Memory)

**GitHub:** [github.com/Dicklesworthstone/cass_memory_system](https://github.com/Dicklesworthstone/cass_memory_system)  
**Stars:** 264  
**Language:** TypeScript / Bun  
**LobeHub Marketplace:** [lobehub.com/it/skills/dicklesworthstone-cass_memory_system](https://lobehub.com/it/skills/dicklesworthstone-cass_memory_system)

### What is CM?

CM (CASS Memory System) is a **procedural memory system** for AI coding agents. Where CASS indexes raw session transcripts, CM *distills* those sessions into a persistent, confidence-tracked knowledge base of rules, heuristics, and playbooks. It transforms "scattered session history into persistent, cross-agent memory so every agent learns from every other."

### The Three-Layer Cognitive Architecture

CM implements a three-layer model inspired by human cognitive architecture:

```
Session Events
      ↓
┌─────────────────────────────────────────────────────────────────┐
│ Layer 1: EPISODIC                                               │
│ Raw session events from CASS                                    │
│ Short-term: what happened in recent sessions                    │
│ Source material for distillation                                │
└─────────────────────────┬───────────────────────────────────────┘
                          │ cm reflect (distillation)
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ Layer 2: PROCEDURAL                                             │
│ Distilled rules with confidence scoring + 90-day decay          │
│ Reusable: "always do X when Y", "never do Z because..."        │
│ Confidence: 0.0–1.0, updated by reinforcement/refutation        │
└─────────────────────────┬───────────────────────────────────────┘
                          │ cm context (surface relevant rules)
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ Layer 3: SEMANTIC (Active Working Memory)                       │
│ Currently relevant procedures surfaced for the active task      │
│ Injected into agent context at session start                    │
│ Project-scoped and global scopes                                │
└─────────────────────────────────────────────────────────────────┘
```

#### Layer 1: Episodic

- Raw session events ingested from CASS (all 11+ agent formats)
- Maintains a "diary" of session summaries
- Short-lived: serves as the raw material for distillation, not directly queried by agents

#### Layer 2: Procedural

The core value layer. Contains distilled rules with:
- **Confidence scoring (0.0–1.0):** Each rule has a confidence level. Initial rules start lower; rules that are repeatedly confirmed by successful outcomes gain confidence; rules that lead to failures lose confidence.
- **90-day exponential decay:** Confidence decays over time if a rule is not reinforced. Stale rules eventually fade below a retrieval threshold. This prevents the system from recommending outdated approaches.
- **Anti-pattern tagging:** Rules can be marked as anti-patterns — things to *avoid*.

**4× Harmful Weight:** Harmful patterns (patterns that caused failures, regressions, data loss, or violated stated design constraints) are weighted 4× higher in retrieval priority than neutral rules. The logic: it is 4 times more important to avoid known failures than to repeat known successes.

#### Layer 3: Semantic (Working Memory)

The active-session layer. When an agent calls `cm context`, the system:
1. Takes the current task description and code context
2. Retrieves the most relevant procedural rules (BM25 + semantic similarity)
3. Returns a concise, prioritized list of applicable rules
4. Differentiates project-specific rules from global cross-project rules

This layer is the agent's "relevant memory for this task" — not a dump of everything, but the semantically appropriate subset.

### CM Commands

| Command | Description |
|---|---|
| `cm init` | Initialize CM for the current repository; creates `.cm/` storage |
| `cm init --repo` | Initialize at repo level (vs. global) |
| `cm context` | Retrieve relevant rules for current task (main agent-facing command) |
| `cm reflect` | Distillation pass: process recent episodic events into procedural rules |
| `cm doctor` | Health check: verify index, connectivity to CASS, storage integrity |
| `cm learn <pattern>` | Manually add a rule with optional confidence |
| `cm forget <rule-id>` | Remove a rule |
| `cm list` | Show all rules with confidence scores |

### Anti-Pattern Learning Mechanism

The anti-pattern system detects recurring faulty strategies and surfaces corrective warnings or rewrites. When an agent repeatedly encounters the same failure mode:

1. CASS indexes the failure session
2. `cm reflect` distillation identifies the pattern
3. The pattern is stored with the anti-pattern flag and 4× weight
4. Next time any agent faces a similar task, `cm context` surfaces the warning prominently: "Agents have failed doing X in this context — here's why and what to do instead"

This is the core "don't repeat mistakes" mechanism. It transforms individual failures into collective institutional knowledge.

### Trauma Guard Safety System

A specialized safety layer that blocks propagation of harmful or sensitive patterns:
- Prevents rules containing credentials, PII, or security vulnerabilities from entering the procedural layer
- Enforces privacy and compliance rules (configurable per organization)
- Blocks transfer of patterns that explicitly violated safety constraints

### Cross-Agent Knowledge Transfer

When a pattern is learned by a Codex session on Project A:
1. The episodic event is in CASS (indexed globally, not per-project)
2. `cm reflect` distills it into the global procedural layer (with project-scope tag)
3. A Claude Code agent starting work on Project B calls `cm context`
4. If the task is semantically similar, the rule surfaces — with its origin ("learned from Codex session 2026-02-15, project-A, authentication refactor")
5. The agent adapts the pattern to the new context

This is the flywheel's "collective memory" layer — every agent session makes all future agents smarter across the entire tool ecosystem.

### MCP Integration

CM is an MCP server. Any MCP-compatible agent (Claude Code, Codex, Cursor, Gemini CLI) can call `cm context` and `cm reflect` as native tools without leaving their environment.

---

## 8. DCG — Destructive Command Guard

**GitHub:** [github.com/Dicklesworthstone/destructive_command_guard](https://github.com/Dicklesworthstone/destructive_command_guard)  
**Stars:** 89  
**Language:** Rust  
**Installation hook:** Claude Code `PreToolUse` hook

### What is DCG?

DCG is a **Claude Code `PreToolUse` hook** that intercepts destructive shell commands *before* execution using SIMD-accelerated pattern matching. It is the first line of defense — catching obvious dangerous patterns automatically, before they reach SLB's approval queue.

### Architecture: Fail-Open Design

DCG uses a **fail-open** philosophy: if a parse error or timeout occurs, the command is *allowed* (not blocked). The reasoning: blocking legitimate commands due to tool errors would destroy developer trust and cause abandonment. Fail-open preserves the workflow at the cost of occasionally missing a dangerous command under pathological conditions.

### What It Blocks

**Core patterns (enabled by default):**

| Category | Examples Blocked |
|---|---|
| Git — uncommitted work | `git reset --hard`, `git checkout -- .`, `git restore <file>` (without --staged), `git clean -f` |
| Git — remote history | `git push --force`, `git branch -D` |
| Git — stashed work | `git stash drop`, `git stash clear` |
| Filesystem | `rm -rf` on paths outside `/tmp`, `/var/tmp`, `$TMPDIR` |

### 49+ Modular Security Packs

Beyond core patterns, DCG ships with 49+ optional "packs" organized by category. Enabled via `~/.config/dcg/config.toml`:

| Category | Packs |
|---|---|
| Databases | postgresql, mysql, mongodb, redis, sqlite, supabase |
| Containers | docker, compose, podman |
| Kubernetes | kubectl, helm, kustomize |
| Cloud | aws, azure, gcp |
| Infrastructure | terraform, pulumi, ansible |
| Storage | s3, gcs, minio, azure_blob |
| CI/CD | github_actions, gitlab_ci, jenkins, circleci |
| Secrets | vault, doppler, onepassword, aws_secrets |
| Messaging | kafka, rabbitmq, nats, sqs_sns |
| Monitoring | datadog, prometheus, pagerduty, splunk |
| Search | elasticsearch, algolia, meilisearch, opensearch |
| And more | DNS, load balancers, payment systems, feature flags, backup tools |

### Heredoc / Inline Script Scanning (3-Tier Architecture)

DCG detects destructive operations embedded inside heredocs and inline scripts — e.g., `python -c "os.remove('/important/file')"`. Uses a three-tier pipeline:

**Tier 1: Trigger Detection** (<100μs) — RegexSet screens for heredoc indicators. Commands without indicators skip directly to ALLOW.

**Tier 2: Content Extraction** (<1ms) — Extracts the actual script content from heredocs, here-strings, or inline `-c` arguments. Bounded by configurable limits (max 1MB, 10K lines, 50ms timeout).

**Tier 3: AST Pattern Matching** (<5ms) — Uses tree-sitter/ast-grep with language-specific grammars. Recursive shell analysis: `bash -c "git reset --hard"` extracts the inner command and re-evaluates it through the full pipeline.

Supported languages for inline scanning: bash, python, javascript, typescript, ruby, perl, go.

### Configuration Hierarchy (5 Levels)

1. Environment variables (`DCG_*`) — highest priority
2. Explicit config file (`DCG_CONFIG`)
3. Project config (`.dcg.toml` in repo root)
4. User config (`~/.config/dcg/config.toml`)
5. Compiled defaults — lowest priority

### Supported Agents

Claude Code, Gemini CLI, GitHub Copilot CLI, OpenCode (community plugin), Aider (git hooks only), Continue (detection only), Codex CLI (detection only). DCG auto-detects which agent is invoking it and applies agent-specific trust levels.

---

## 9. SLB — Simultaneous Launch Button

**GitHub:** [github.com/Dicklesworthstone/simultaneous_launch_button](https://github.com/Dicklesworthstone/simultaneous_launch_button)  
**Stars:** 49  
**Language:** Go  
**Description:** "Nuclear-launch-style safety for AI agents"

### What is SLB?

SLB implements a **two-person rule** for dangerous commands in agentic workflows. Inspired by military nuclear launch protocols — where two authorized parties must simultaneously approve before a launch is permitted — SLB requires one or more peer agents (or humans) to approve a command before it executes.

### The DCG + SLB Defense-in-Depth

DCG and SLB are complementary, not redundant:
- **DCG blocks** obvious destructive patterns automatically, before an agent even proposes them (PreToolUse hook)
- **SLB requires human or peer approval** for contextual risks that DCG doesn't block — things that look syntactically safe but are semantically dangerous in context

Example from [agent-flywheel.com/flywheel](https://agent-flywheel.com/flywheel): "Claude proposes `rm -rf ./old_code` — DCG blocks it instantly. Claude rephrases to `mv ./old_code ./archive` — SLB prompts for confirmation before the move."

### Four Risk Tiers

| Tier | Approvals Required | Auto-approve Behavior | Examples |
|---|---|---|---|
| **CRITICAL** | 2+ (from different agents) | Never | `rm -rf /`, `DROP DATABASE`, `terraform destroy`, `git push --force`, `dd ... of=/dev/` |
| **DANGEROUS** | 1 | Never | `rm -rf ./build`, `git reset --hard`, `kubectl delete`, `DROP TABLE`, `chmod -R` |
| **CAUTION** | 0 | After 30 seconds | `rm file.txt`, `git branch -d`, `npm uninstall` |
| **SAFE** | 0 | Immediately (skip) | `rm *.log`, `git stash`, `kubectl delete pod` |

### Approval Mechanism

```bash
# Agent submits a request (blocks until approved)
slb run "terraform destroy -target=aws_instance.prod" \
  --reason "Decommissioning old EC2 after migration" \
  --session-id <agent-id>

# Reviewer sees pending request
slb pending

# Reviewer approves (different session-id enforced)
slb approve <request-id> --session-id <reviewer-id> --comment "Confirmed decommission OK"
```

### Five Execution Security Gates

Before any approved command actually runs, SLB checks five gates atomically:

1. **Status Check:** Request must be in APPROVED state
2. **Approval Expiry:** TTL not elapsed (30min standard, 10min for CRITICAL)
3. **Command Hash:** SHA-256 of the command must match exactly what was approved (prevents substitution attacks)
4. **Tier Consistency:** Risk tier hasn't changed (prevents reclassification attacks)
5. **First-Executor-Wins:** Atomic DB transition — prevents race conditions where two executors both try to run the same approved command

### Cryptographic Signing

- **Command binding:** SHA-256 hash computed at request time, verified at execution
- **Review signatures:** HMAC signatures using per-session keys prevent review forgery
- **Session keys:** Generated per-session, never stored in plaintext

### Agent Mail Integration

SLB sends approval requests directly to reviewer inboxes via Agent Mail. Cross-agent review workflow:
1. Agent A proposes `kubectl delete namespace production`
2. SLB classifies as CRITICAL (2 approvals needed)
3. SLB sends notification to Agent B and Agent C's Agent Mail inboxes
4. Agent B and C independently review and approve
5. SLB executes with full audit log

### Request State Machine

```
PENDING → APPROVED / REJECTED / CANCELLED / TIMEOUT
APPROVED → EXECUTING → EXECUTED / EXEC_FAIL / TIMED_OUT
```

---

## 10. NTM — Named Tmux Manager

**GitHub:** [github.com/Dicklesworthstone/ntm](https://github.com/Dicklesworthstone/ntm)  
**Stars:** 69  
**Language:** Go  
**2,310 commits** as of March 2026

### What is NTM?

NTM is a **multi-agent tmux orchestration tool** — the "agent cockpit." It transforms a tmux session into a visual command center for parallel AI agent swarms, with named panes, broadcast capabilities, conflict detection, and a stunning TUI with Catppuccin themes and animated gradients.

### Core Problem Solved

Managing 6-15 parallel AI coding agents manually involves:
- Terminal window chaos (each agent needs its own terminal)
- Manual copy-paste to send the same prompt to multiple agents
- Sessions lost on SSH disconnect
- No visibility into which agent is working on what
- No detection of file conflicts between agents

### Staggered Spawning

NTM's `spawn` command creates agents in a controlled, staggered sequence to prevent rate-limit collisions on API providers:

```bash
ntm spawn myproject --cc=4 --cod=4 --gmi=2
# Creates: 4 Claude Code + 4 Codex CLI + 2 Gemini CLI = 10 agents + 1 user pane
```

Agents are named with predictable identifiers: `myproject__cc_1`, `myproject__cc_2`, `myproject__cod_1`, etc. This naming allows targeted messaging and filtering.

### CAAM — Coding Agent Account Manager

NTM integrates with **CAAM** (Coding Agent Account Manager, stars: 45, TypeScript) for account rotation. When one API account hits rate limits, NTM + CAAM automatically spawn new agents with fresh credentials:

- Sub-100ms account switching
- Smart rotation algorithms with cooldown tracking
- Health scoring per account
- Vault-based profile isolation for parallel agent sessions

This is the mechanism enabling sustained multi-day agent swarms — the Flywheel's "Account Orchestration" synergy: "Rate limited on one Claude account? NTM spawns agents with fresh credentials from CAAM. No manual switching." ([agent-flywheel.com/flywheel](https://agent-flywheel.com/flywheel))

### Broadcast Prompts

```bash
# Send to all Claude agents
ntm send myproject --cc "fix all TypeScript errors in src/"

# Send to all agents of all types
ntm send myproject --all "summarize your progress"

# Send to specific Codex agents
ntm send myproject --cod "add comprehensive unit tests"
```

### Key Features

- **Named panes:** `myproject__cc_1`, `myproject__cod_2` — predictable identifiers
- **Multi-label sessions:** Multiple swarms on the same project (`--label frontend`, `--label backend`)
- **Compaction detection:** Automatic detection when agents hit context limits; broadcasts "re-read AGENTS.md" reminder (integrates with Post-Compact Reminder hook)
- **Conflict tracking:** Detects when multiple agents modify the same files (integrates with Agent Mail file reservations)
- **Output capture:** `ntm copy myproject --cc --pattern 'ERROR'` — filter Claude agent output by regex
- **Checkpoints:** `ntm checkpoint save myproject -m "Before refactor"` — session state snapshots
- **Analytics:** `ntm analytics --days 7` — per-session statistics
- **Robot mode:** `ntm --robot-status`, `ntm --robot-list`, `ntm --robot-send=myproject --message "..."` — machine-readable JSON for agent orchestration
- **Persistent sessions:** Detach and reattach across SSH disconnects without losing any agent state

---

## 11. UBS — Ultimate Bug Scanner

**GitHub:** (part of ACFS stack)  
**Stars:** 132  
**Language:** Bash  
**Description:** "Pattern-based bug scanner with 1000+ detection rules"

### What is UBS?

UBS (Ultimate Bug Scanner) is a static analysis tool that scans changed files using AST-grep patterns, detecting 1000+ bug types across 8 programming languages in sub-5-second scans. It auto-wires into Claude Code, Codex, Cursor, Gemini, and Windsurf agents.

### How It Scans Changed Files

UBS integrates as a pre-commit or in-session hook:

1. **Change detection:** Queries git for changed files in the current working tree
2. **Language detection:** Identifies file types (Python, JS/TS, Go, Rust, Ruby, etc.)
3. **Pattern application:** Applies the relevant AST-grep pattern packs for each language
4. **Consistent JSON output:** All detections return the same JSON schema regardless of language, making agent consumption straightforward
5. **`.ubsignore`:** Projects can exclude files/patterns (analogous to `.gitignore`)

### 18 Detection Categories

Includes: null safety violations, security vulnerabilities, type errors, resource leaks, concurrency bugs, SQL injection patterns, XSS vulnerabilities, improper error handling, deprecated API usage, and more.

### Agent Integration

The "Agents Reviewing Agents" workflow:
```
Agent A implements code → 
UBS auto-scans changed files → 
Agent B runs UBS on Agent A's work → 
Bugs found before merge
```

UBS with CASS and CM creates the "continuous improvement loop" described in [agent-flywheel.com/flywheel](https://agent-flywheel.com/flywheel).

---

## 12. ACFS — Agentic Coding Flywheel Setup

**GitHub:** [github.com/Dicklesworthstone/agentic_coding_flywheel_setup](https://github.com/Dicklesworthstone/agentic_coding_flywheel_setup)  
**2,445 commits** as of March 2026  
**Language:** Bash (installer), TypeScript/Bun (manifest generator), Next.js 16 (wizard website)

### What is ACFS?

ACFS is the **bootstrap system** — it transforms a fresh Ubuntu VPS into a complete multi-agent AI development environment in ~30 minutes via a single curl command. It installs the entire Dicklesworthstone stack plus AI coding agents, modern shell, language runtimes, and cloud CLIs.

### One-Line Install

```bash
curl -fsSL "https://raw.githubusercontent.com/Dicklesworthstone/agentic_coding_flywheel_setup/main/install.sh?$(date +%s)" | bash -s -- --yes --mode vibe
```

**Installer modes:**

| Mode | Passwordless Sudo | Agent Flags | Best For |
|---|---|---|---|
| `vibe` | Yes | `--dangerously-skip-permissions` | Throwaway VPS, maximum velocity |
| `safe` | No | Standard confirmations | Production-like environments |

### 10 Installation Phases

1. User normalization (create `ubuntu` user, migrate SSH keys)
2. APT packages (essential system packages)
3. Shell setup (zsh, oh-my-zsh, powerlevel10k)
4. CLI tools (ripgrep, fzf, lazygit, etc.)
5. Language runtimes (bun, uv/Python, Rust, Go)
6. AI agents (claude, codex, gemini)
7. Cloud tools (vault, wrangler, supabase, vercel)
8. **Dicklesworthstone Stack** (ntm, dcg, ru, ubs, mcp_agent_mail, bv, cass, cm, caam, slb)
9. Configuration (deploy `acfs.zshrc`, `tmux.conf`)
10. Verification (`acfs doctor` — 47+ health checks)

### Manifest-Driven Architecture

All tools are defined in a **single source of truth**: `acfs.manifest.yaml`. A TypeScript/Bun generator reads this file and produces:
- 11 category installer Bash scripts
- Doctor health check script (47+ checks)
- Master installer entrypoint

Zod schema validation catches malformed YAML at parse time, not at runtime on a production VPS.

### Security Verification

ACFS ships a `checksums.yaml` with SHA256 hashes for all upstream installer scripts. Before executing any downloaded script, it verifies the hash. HTTPS-only downloads enforced. This addresses the "curl | bash" security concern by verifying content, not just transport.

### Idempotency and Resumability

The installer tracks progress in `~/.acfs/state.json`. If interrupted (power outage, SSH disconnect), re-running the same command resumes from the last completed phase automatically, skipping already-installed tools.

---

## 13. The Complete Workflow: Plan → Beads → Swarm

The end-to-end methodology documented at [agent-flywheel.com/complete-guide](https://agent-flywheel.com/complete-guide):

### Phase 1: Write the Initial Plan (GPT Pro / Claude Opus)
- Start with a "messy stream of thought" describing the project concept, goals, and user workflows
- Use GPT Pro with Extended Reasoning for first-pass planning
- The model produces a comprehensive markdown design document

### Phase 2: Multi-Model Competition
- Ask Claude Opus, Gemini with Deep Think, and Grok Heavy to independently plan the same project
- Each model has different "tastes" and blind spots — different frontier models catch different architectural issues
- Pass all competing plans back to GPT Pro with a "best-of-all-worlds synthesis" prompt

### Phase 3: Iterative Refinement (4-5+ rounds)
- Each round in a *fresh* GPT Pro conversation (prevents anchoring on prior output)
- Plans routinely reach 3,000–6,000+ lines through this process
- **"Lie to them" technique:** Claim the model missed 80+ elements to prevent early stopping
- Stop refining when changes become incremental (architecture stable, remaining suggestions are execution-level)

### Phase 4: Plan → Beads Conversion
- Use Claude Code with Opus + `br` tool to convert the plan into beads
- Prompt explicitly requires: tasks, subtasks, dependency structure, detailed comments, test obligations, "future self" context
- Never write "pseudo-beads" in markdown — go directly to `br create`
- **Plan-bead gap warning:** Always ensure the synthesis step concludes with explicit transition to bead creation

### Phase 5: Bead Polishing (4-6+ rounds)
- Run the polishing prompt (AGENTS.md re-read, careful review, `bv` check) 4-6+ times
- Run deduplication checks after large batches
- Use a fresh session for "fresh eyes" on beads
- Final round: Codex with GPT at high reasoning effort (different models catch different things)

### Phase 6: Launch the Swarm
```bash
ntm spawn myproject --cc=4 --cod=3 --gmi=2  # 9 agents
```
Each agent:
1. Reads `AGENTS.md` (mandatory — project operating manual)
2. Calls `macro_start_session` (Agent Mail registration)
3. Runs `bv --robot-priority` (get next task)
4. Reserves files: `file_reservation_paths(...)`
5. Announces start via Agent Mail: `send_message(..., thread_id="br-42")`
6. Implements the bead
7. Updates bead status: `br update br-42 --status in_progress` → `br close br-42`
8. Releases file reservations
9. Loops back to step 3

### Phase 7: Tend the Swarm
The human role after swarm launch ("clockwork deity"):
- Check for stuck beads
- Rescue agents after context compaction (they must re-read AGENTS.md)
- Send Human Overseer broadcast messages for course corrections
- Monitor Agent Mail for coordination issues
- Review completed work batches

### Phase 8: Review, Test, Harden
- Self-review with "fresh eyes" prompt
- Cross-agent peer review ("review your fellow agents' code")
- UBS static analysis scan
- Test coverage verification
- UI/UX polish rounds

**Proven benchmark:** 5,500-line plan → 347 beads → 11,000 lines of production Rust/TypeScript → 204 git commits → ~5 hours elapsed with 25 agents (CASS Memory System project).

---

## 14. Community Reception

### X/Twitter (@doodlestein)

Jeffrey Emanuel's account has become a reference for the agentic coding community. His November 2025 tweet about the workflow going "meta and self-referential" garnered 149,800 views and 908 likes:

> "I can feel the flywheel spinning faster and faster now as my level of interaction/prompting is increasingly directed at driving my own tools... 'Re-read AGENTS.md first. Then, can you try using bv to get some insights on what each agent should most usefully work on? Then share those insights with the other agents via agent mail and strongly suggest in your messages the optimal work for each one and explain how/why you came up with that using bv. Use ultrathink.'" — [x.com/doodlestein/status/1994526015587266875](https://x.com/doodlestein/status/1994526015587266875)

### HackerNews

The CASS Show HN ([news.ycombinator.com/item?id=46130481](https://news.ycombinator.com/item?id=46130481)) was submitted in December 2025. Comments noted the tool addressed a genuine pain point of fragmented session history across multiple AI coding tools.

A separate HN discussion on January 19, 2026 ([news.ycombinator.com/item?id=46680778](https://news.ycombinator.com/item?id=46680778)) quoted implementation of "Jeffrey Emanuel's Rule of Five" — the observation that reviewing something five times with different focus areas produces superior outcomes. A commenter noted: "I implemented a formula for Jeffrey Emanuel's 'Rule of Five'... you can take any workflow, cook it with the Rule of Five, and it will make each step get reviewed 4 times (the implementation counts as the first review)."

### LobeHub / MCP Marketplace

The CM skill on LobeHub ([lobehub.com/it/skills/dicklesworthstone-cass_memory_system](https://lobehub.com/it/skills/dicklesworthstone-cass_memory_system)) has a 5/5 rating. The one substantive review (March 2026, "Pragmatic Codex Athens") notes: "Installed via the marketplace into a Codex workspace, read the bundled SKILL.md, ran `cm doctor` and `cm context` successfully, and initialized repo-level memory with `cm init --repo`. Clear instructions and the workflow matched the actual CLI behavior."

### Reddit (r/LocalLLaMA, r/ClaudeAI)

A February 2026 post on r/LocalLLaMA titled "Self-Improvement Flywheel for AI Agents" described implementing a similar concept (Boris Loop self-improvement, sub-agent collaboration, proactive mindset) independent of but philosophically aligned with the ACFS approach. The Flywheel methodology has influenced a broader community pattern of "agents improving their own system prompts daily."

### Simon Willison's Weblog

Jeffrey Emanuel is recognized in the technical community through other work. Simon Willison's weblog featured his "The Short Case for Nvidia Stock" essay as a "long, excellent piece" with "a rare combination of experience in both computer science and investment analysis." This establishes his credibility as a thoughtful analyst, not just a tool builder. ([simonwillison.net/2025/Jan/27/](https://simonwillison.net/2025/Jan/27/))

### GitHub Stars Summary

| Tool | Stars | Language |
|---|---|---|
| MCP Agent Mail | 1,400 | Python |
| Beads Viewer (bv) | 891 | Go |
| CASS Session Search | 307 | Rust |
| CASS Memory System (CM) | 264 | TypeScript |
| UBS | 132 | Bash |
| Beads Rust (br) | 128 | Rust |
| NTM | 69 | Go |
| SLB | 49 | Go |
| DCG | 89 | Rust |
| CAAM | 45 | TypeScript |
| ACFS (main installer repo) | 5,300+ | Bash/TypeScript |

---

## 15. Limitations and Criticisms

### Complexity Cost: The Obvious Critique

The Flywheel ecosystem is, by any measure, a complex system. Installing and learning all 35 tools represents a significant upfront investment. The ACFS installer takes 30 minutes on a fresh VPS. Learning the methodology deeply (understanding all 9 bv metrics, the CM three-layer architecture, Agent Mail's coordination protocols) requires days or weeks.

**Counterargument from the ecosystem:** The ACFS one-liner handles setup. Once installed, each tool has `--robot-*` modes with self-documenting JSON APIs. Skill files (SKILL.md in each tool, installable via LobeHub) mean the agents themselves learn the tools.

### Over-Engineering Concerns

A recurring theme in the broader agentic AI community (Reddit r/AgentsOfAI, December 2025) is whether complex multi-agent frameworks outperform simpler approaches:

> "Most 'agentic' systems I've seen fail because they're trying to handle too many edge cases with complex reasoning chains, when a clear, rule-based loop outperforms a complex chain designed to handle every possible scenario." — r/AgentsOfAI

Google DeepMind research (2025) found that multi-agent systems often perform *worse* than single agents due to coordination overhead, quantified as:

**Net Performance = (Individual Capability + Collaboration Benefits) − (Coordination Chaos + Communication Overhead + Tool Complexity)**

With an "error amplification factor" of 17.2 in independent multi-agent systems — a 5% single-agent error rate can become an 86% error rate in a poorly-designed multi-agent system.

**Flywheel response:** The Flywheel addresses this directly through the bead dependency graph (preventing redundant work), Agent Mail file reservations (preventing conflicts), and the bv execution order (ensuring agents work in topologically correct sequence rather than colliding). The tools are specifically engineered to minimize the coordination overhead that makes naive multi-agent systems fail.

### Workflow Rigidity

The methodology prescribes a very specific sequence: exhaustive planning → multi-model competition → beads conversion → polishing → swarm launch. Teams with different cadences, rapid iteration needs, or exploratory R&D workflows may find this sequence constraining.

**The guide acknowledges this:** "The most common objection: 'I don't really know all the requirements at the beginning.' This is not at all in tension with the methodology." The response is that the planning phase *discovers* requirements through model exploration. But for genuinely open-ended research or highly experimental work, the plan-first constraint is real.

### Ubuntu VPS Dependency

ACFS is explicitly designed for Ubuntu VPS environments and auto-upgrades to Ubuntu 25.10. Developers on macOS, Windows, or non-Ubuntu Linux must adapt parts of the setup manually. The installer has macOS Homebrew support for individual tools but not the full bootstrapping wizard.

### Learning Curve for Agents

Agents must be explicitly trained on the Flywheel tools (via SKILL.md files, AGENTS.md, and Clawdbot skills). A fresh Claude Code or Codex session that hasn't been told about `bv --robot-priority` will not spontaneously use it. The methodology requires maintaining an `AGENTS.md` file in each project that explicitly teaches agents the toolchain. If this file is lost or outdated after context compaction, agents revert to improvised behavior.

**The Post-Compact Reminder hook** (a Claude Code hook detecting compaction events and injecting "re-read AGENTS.md") was built specifically to mitigate this failure mode.

### Vendor Lock-in to Jeffrey Emanuel's Tools

The ecosystem is almost entirely created by one person. While the tools are MIT-licensed and open source, the entire stack depends on ongoing maintenance by @Dicklesworthstone. The ACFS repo has 2,445 commits as of March 2026; the NTM repo has 2,310; CASS has 1,846 — indicating active development, but also concentrated authorship risk.

### Cost of API Access at Scale

Running 10-25 AI agents in parallel, burning implementation tokens for hours, generates substantial API costs. The methodology is designed for developers with either unlimited-plan subscriptions (GPT Pro, Claude Pro) or significant API budgets. The CAAM account rotation system exists precisely because per-account rate limits become a real constraint at this scale.

### Context Compaction as a Failure Mode

A known failure mode in the guide: when agents hit context limits and compact, they lose knowledge of AGENTS.md, ongoing reservations, and their current bead's context. The Post-Compact Reminder hook and mandatory AGENTS.md re-read after compaction are workarounds, not solutions. Long-running sessions that compact multiple times accumulate "amnesia debt" requiring increasing amounts of re-grounding time.

---

## 16. Ecosystem Map and Tool Interactions

```
                        ┌──────────────────────────────────────────┐
                        │         PLANNING PHASE                   │
                        │  GPT Pro + Claude Opus + Gemini + Grok   │
                        │  Markdown plan (3,000-6,000 lines)       │
                        └──────────────────┬───────────────────────┘
                                           │ plan-to-beads conversion
                                           ▼
                        ┌──────────────────────────────────────────┐
                        │         BEAD SPACE                       │
                        │  br (beads_rust) — JSONL + SQLite        │
                        │  bv (beads_viewer) — graph analytics     │
                        │  .beads/issues.jsonl committed to git    │
                        └──────────────────┬───────────────────────┘
                                           │ swarm launch
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXECUTION LAYER                                      │
│                                                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐  │
│  │ Agent 1 │    │ Agent 2 │    │ Agent 3 │    │ Agent N │    │  Human  │  │
│  │ Claude  │    │ Codex   │    │ Gemini  │    │   ...   │    │Overseer │  │
│  └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘  │
│       │              │              │              │               │        │
│       └──────────────┴──────────────┴──────────────┴───────────────┘        │
│                                    │                                         │
│                     ┌──────────────▼───────────────┐                        │
│                     │      MCP AGENT MAIL           │                        │
│                     │  - Identity + mailboxes       │                        │
│                     │  - File reservation leases    │                        │
│                     │  - Threaded messages          │                        │
│                     │  - Audit trail (Git + SQLite)│                        │
│                     └──────────────┬───────────────┘                        │
│                                    │                                         │
│          ┌─────────────────────────┼─────────────────────────────┐          │
│          ▼                         ▼                             ▼          │
│  ┌──────────────┐        ┌──────────────────┐          ┌────────────────┐  │
│  │     bv       │        │      cass         │          │      cm        │  │
│  │ Graph-theory │        │ Session search    │          │ Procedural     │  │
│  │ task routing │        │ 11+ agent formats │          │ memory + decay │  │
│  │ 9 metrics    │        │ <60ms queries     │          │ 3-layer arch   │  │
│  └──────────────┘        └──────────────────┘          └────────────────┘  │
│                                                                              │
│  SAFETY LAYER:                                                               │
│  ┌──────────────┐        ┌──────────────────┐          ┌────────────────┐  │
│  │     dcg      │        │      slb          │          │      ubs       │  │
│  │ PreToolUse   │        │ Two-person rule   │          │ Bug scanner    │  │
│  │ 49+ packs   │        │ 4 risk tiers      │          │ 1000+ patterns │  │
│  │ SIMD fast   │        │ Crypto signing    │          │ AST-grep       │  │
│  └──────────────┘        └──────────────────┘          └────────────────┘  │
│                                                                              │
│  ORCHESTRATION:                                                              │
│  ┌──────────────┐        ┌──────────────────┐                               │
│  │     ntm      │        │      caam         │                               │
│  │ Tmux manager │        │ Account rotation  │                               │
│  │ Named panes  │        │ Sub-100ms switch  │                               │
│  │ Broadcast    │        │ Multi-provider    │                               │
│  └──────────────┘        └──────────────────┘                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │    FLYWHEEL FEEDBACK LOOP      │
                    │  Sessions → CASS index grows   │
                    │  Events → CM rules accumulate  │
                    │  Patterns → 4× harm weighting  │
                    │  Future agents start smarter   │
                    └───────────────────────────────┘
```

### The Core Synergies (from agent-flywheel.com/flywheel)

**Core Loop (NTM + Mail + bv):**
> "NTM spawns agents that register with Mail for coordination. They use bv to find tasks to work on. The result: autonomous agents that figure out what to do next without human intervention."

**Collective Memory (CASS + CM):**
> "CASS indexes all agent sessions for instant search. CM stores learnings as procedural memory. Together: agents that never repeat mistakes and always remember what worked."

**Safety Net (UBS + SLB):**
> "UBS catches bugs before they're committed. SLB prevents dangerous commands from running without approval. Together: aggressive automation with guardrails."

**Compounding Learning:**
> "bv tracks task patterns and completion history. CM stores what approaches worked. Together: each new task benefits from all past solutions."

---

## Sources

1. [agent-flywheel.com/flywheel](https://agent-flywheel.com/flywheel) — "Unheard-of Velocity in Complex Software" — 35 tools overview and workflow descriptions
2. [agent-flywheel.com/complete-guide](https://agent-flywheel.com/complete-guide) — "The Complete Flywheel Guide" — full methodology documentation by Jeffrey Emanuel
3. [github.com/Dicklesworthstone/agent_flywheel_clawdbot_skills_and_integrations](https://github.com/Dicklesworthstone/agent_flywheel_clawdbot_skills_and_integrations) — Clawdbot skills repo with tool overview table
4. [github.com/Dicklesworthstone/agentic_coding_flywheel_setup](https://github.com/Dicklesworthstone/agentic_coding_flywheel_setup) — ACFS installer documentation
5. [github.com/Dicklesworthstone/mcp_agent_mail](https://github.com/Dicklesworthstone/mcp_agent_mail) — Agent Mail README with full protocol documentation
6. [github.com/Dicklesworthstone/beads_viewer](https://github.com/Dicklesworthstone/beads_viewer) — Beads Viewer source and README
7. [dicklesworthstone.github.io/beads_viewer-pages/](https://dicklesworthstone.github.io/beads_viewer-pages/) — Beads Viewer live demo with all 9 metrics explained
8. [github.com/Dicklesworthstone/cass_memory_system](https://github.com/Dicklesworthstone/cass_memory_system) — CASS Memory System README
9. [lobehub.com/it/skills/dicklesworthstone-cass_memory_system](https://lobehub.com/it/skills/dicklesworthstone-cass_memory_system) — LobeHub skill page with community review
10. [github.com/Dicklesworthstone/coding_agent_session_search](https://github.com/Dicklesworthstone/coding_agent_session_search) — CASS session search README
11. [github.com/Dicklesworthstone/destructive_command_guard](https://github.com/Dicklesworthstone/destructive_command_guard) — DCG README with full pack listing
12. [github.com/Dicklesworthstone/simultaneous_launch_button](https://github.com/Dicklesworthstone/simultaneous_launch_button) — SLB README with risk tiers and approval mechanism
13. [github.com/Dicklesworthstone/ntm](https://github.com/Dicklesworthstone/ntm) — NTM README
14. [news.ycombinator.com/item?id=46130481](https://news.ycombinator.com/item?id=46130481) — Show HN: CASS, December 2025
15. [news.ycombinator.com/item?id=46680778](https://news.ycombinator.com/item?id=46680778) — HN discussion referencing "Rule of Five", January 2026
16. [x.com/doodlestein/status/1994526015587266875](https://x.com/doodlestein/status/1994526015587266875) — Jeffrey Emanuel tweet on flywheel meta-workflow, 149.8K views
17. [x.com/doodlestein](https://x.com/doodlestein) — Jeffrey Emanuel's X profile
18. [agent-flywheel.com/tldr](https://agent-flywheel.com/tldr) — TL;DR overview of 16 core tools + 13 supporting utilities
19. [ralph-tui.com/docs/plugins/trackers/beads-bv](https://ralph-tui.com/docs/plugins/trackers/beads-bv) — Third-party integration showing bv metric weights in production use
20. [mcpmarket.com/tools/skills/cass-coding-agent-session-search](https://mcpmarket.com/tools/skills/cass-coding-agent-session-search) — CASS skill on MCP market
