# Tool Harness Reference

Tool detection, integration guide, graceful degradation, and per-phase usage.

---

## Core Tools (Required)

These three tools are mandatory. If any are missing, surface a clear error and do not proceed.

| Tool | Full Name | Purpose |
|------|-----------|---------|
| `br` | Beads | Task storage with three-field structure (description / design / notes). The canonical task list for the session. |
| `bv` | Beads Viewer | Graph-theory routing: validates dependency graph, produces execution order, flags cycles. |
| `am` | Agent Mail | File reservation system and multi-agent coordination channel. Prevents conflicts in multi-session mode. |

### br — Beads

**What it does**: Stores beads (atomic units of work) in a local `.beads/` directory. Each bead has three fields:

- `description` — what to build, why it fits the architecture, acceptance criteria
- `design` — implementation approach, file paths, test requirements (updated by spikes)
- `notes` — edge cases, related bead IDs, reference links

**Commands used per phase:**

| Phase | Command | Purpose |
|-------|---------|---------|
| Phase 0 | `br init` | Initialize `.beads/` directory in project root |
| Phase 2 | `br create --description "..." --design "..." --notes "..."` | Create a new bead |
| Phase 2 | `br list` | List all beads with IDs and statuses |
| Phase 3 | `br update <id> --design "..."` | Write validated spike approach into bead |
| Phase 4 | `br update <id> --status in-progress` | Claim a bead before starting work |
| Phase 4 | `br show <id>` | Read full bead content before execution |
| Phase 4 | `br close <id>` | Mark bead complete after commit |

### bv — Beads Viewer

**What it does**: Analyzes the dependency graph across all beads, detects cycles, recommends execution order, and provides triage (risk, priority, parallelism).

**Commands used per phase:**

| Phase | Command | Purpose |
|-------|---------|---------|
| Phase 2 | `bv --robot-graph` | Validate dependency graph (fail if cycles found) |
| Phase 2 | `bv --robot-triage` | Get recommended execution order |
| Phase 4 | `bv --robot-triage` | Session kickoff: which bead to start next |
| Phase 4 | `bv --robot-graph` | Verify no orphaned beads after bead creation |

### am — Agent Mail

**What it does**: Provides file reservation (TTL-based locks) and an inter-agent messaging channel. Essential for multi-session coordination; still useful in single-agent mode for session state.

**Commands used per phase:**

| Phase | Command | Purpose |
|-------|---------|---------|
| Phase 4 | `am macro_start_session` | Register session, check mail, note existing reservations |
| Phase 4 | `am file_reservation_paths(["file1", "file2"])` | Reserve files before touching them |
| Phase 4 | `am check_mail` | Poll for messages from other agents or human |
| Phase 4 | `am send --to <agent> --subject "..." --body "..."` | Send coordination message |
| Phase 4 | `am macro_end_session` | Release all reservations, mark session complete |

---

## Optional Tools

These tools add capability. When unavailable, use the fallback approach described below.

| Tool | Full Name | Purpose | Fallback when absent |
|------|-----------|---------|---------------------|
| `cass` | Cross-session Search | Searches episodic memory from prior sessions to avoid re-solving known problems | Manual review of `CLAUDE.md` validated approaches |
| `cm` | Context Memory | Three-layer procedural memory (episodic → semantic → procedural distillation) | Rely on `CLAUDE.md` for conventions and anti-patterns |
| `gkg` | Graph Knowledge Graph | Codebase knowledge graph: definitions, references, import graph, repomap | Read files manually; use grep for cross-references |

### cass — Cross-Session Search

**What it adds**: Before starting a design or spike, the agent can search prior sessions for related work. Prevents repeating investigations already done.

**How to use:**

```bash
# Phase 1 (before brainstorm)
cass search "<feature domain>" --robot-mode

# Phase 3 (before spike)
cass search "<spike topic>" --robot-mode

# Output: list of prior session summaries with relevance scores
# Agent reads the top 2-3 results before proceeding
```

**Graceful degradation**: Without `cass`, the agent reads `CLAUDE.md` sections "Validated Approaches" and "Anti-Patterns" and performs a grep for related terms in `docs/`.

### cm — Context Memory

**What it adds**: Distills episodic memories (session logs) into semantic and procedural layers. Enables recurring bug classes to trigger auto-warnings. Applies 90-day decay and 4× weight for harmful patterns.

**How to use:**

```bash
# Phase 0 (new project setup)
cm init --repo

# Phase 3 (before spike — check procedural memory for warnings)
cm context "<domain>"

# Phase 5 (after compound review — distill new knowledge)
cm reflect
```

**Graceful degradation**: Without `cm`, the agent manually updates `CLAUDE.md` after each spike and compound review. The decay and auto-warning features are unavailable; the human must periodically prune stale entries.

### gkg — Graph Knowledge Graph

**What it adds**: Indexes the codebase into a queryable knowledge graph. Enables the agent to find definitions, trace import chains, get references to a symbol, and generate a high-level repomap without reading every file.

**How to use:**

```bash
# Phase 0 (initial index)
gkg index

# Phase 1 (architectural overview before brainstorm)
gkg repomap

# Phase 2 (validate dependency analysis)
gkg import_usage <module>
gkg get_references <symbol>

# Phase 3 (find call sites before spike)
gkg search_codebase_definitions <symbol>

# Phase 4 (find all files to update for a change)
gkg get_references <symbol>
```

**Graceful degradation**: Without `gkg`, the agent uses grep and manual file reading to establish the same picture. This is slower but functionally equivalent. Budget extra time for Phase 1 context gathering.

---

## GKG Integration Points Per Phase

When `gkg` is available, these are the specific integration points that provide the most value:

| Phase | GKG Command | What It Answers |
|-------|------------|----------------|
| Phase 1 (Brainstorm) | `gkg repomap` | "What is the high-level structure of this codebase?" — shows modules, layers, main entry points. Read before proposing approaches. |
| Phase 2 (Breakdown) | `gkg import_usage <module>` | "Which files import this module?" — validates that bead dependency analysis is correct before graph validation. |
| Phase 3 (Spike) | `gkg search_codebase_definitions <symbol>` | "Where is this function/class defined and what does it look like?" — avoids reading entire files during exploration. |
| Phase 4 (Execute) | `gkg get_references <symbol>` | "Where is this symbol used?" — ensures all call sites are updated when a symbol's signature changes. |

---

## Future Tool Slots

The tool harness is designed to be extensible. New tools integrate through the same detection and degradation pattern.

### Adding a New Tool

1. **Add a detection check** in the session-start tool detection sequence (see below).
2. **Add a row** to the appropriate table (Core or Optional) in this file.
3. **Document per-phase commands** — which phases use the tool and for what purpose.
4. **Document graceful degradation** — what the agent does if the tool is absent.
5. **Add integration points** to the relevant phase documentation in `references/phases.md`.

### Planned Future Tools

| Tool | Purpose | Expected Integration |
|------|---------|---------------------|
| **DCP** (Dynamic Context Pruning) | Context management for long sessions — prunes irrelevant context to stay within token limits | Phase 4, particularly in swarm mode with many long sessions. Awaiting OpenCode compatibility. |
| **Custom MCP tools** | User-defined capabilities (e.g., project-specific linters, deployment scripts, domain-specific search) | Any phase. Follow the same detection + graceful degradation pattern. Register in `AGENTS.md` tool blurbs. |

### Template for a New Tool Entry

```markdown
### <tool-name> — <Full Name>

**What it adds**: [One sentence: what capability this tool provides.]

**How to use:**

| Phase | Command | Purpose |
|-------|---------|---------|
| Phase X | `<tool> <command>` | [What the agent does with the output] |

**Graceful degradation**: [What the agent does when this tool is absent.]
```

---

## Tool Detection Protocol

Run at every session start, before any phase work begins.

```
1. Run: br --version
   → If fails: STOP. Print: "beads (br) not found. Install with: <install command>"

2. Run: bv --version
   → If fails: STOP. Print: "beads viewer (bv) not found. Install with: <install command>"

3. Run: am (or check MCP Agent Mail availability)
   → If fails: STOP. Print: "Agent Mail (am) not found. Install with: <install command>"

4. Run: cass --version
   → If fails: NOTE "cass unavailable — using CLAUDE.md fallback"

5. Run: cm --version
   → If fails: NOTE "cm unavailable — manual CLAUDE.md updates only"

6. Run: gkg --version
   → If fails: NOTE "gkg unavailable — using grep/manual file reading"

7. Record available tools in session header:
   TOOLS: br=✅ bv=✅ am=✅ cass=❌ cm=❌ gkg=✅
```

The session header (tool availability record) must be written to the session's first Agent Mail message so all co-agents see the same tool set.

---

## Graceful Degradation Summary

| Tool Missing | Impact | Mitigation |
|-------------|--------|-----------|
| `br` | Cannot store or manage beads | **Fatal** — do not proceed without it |
| `bv` | Cannot validate dependency graph or get execution order | **Fatal** — do not proceed without it |
| `am` | Cannot coordinate file reservations or multi-agent messages | **Fatal in multi-session** — single-agent mode only without it |
| `cass` | May re-investigate known problems | Read `CLAUDE.md` validated approaches; grep `docs/` for prior work |
| `cm` | No procedural memory distillation | Manually maintain `CLAUDE.md`; no auto-decay or auto-warnings |
| `gkg` | Slower codebase exploration | Use grep + manual file reading; budget extra time in Phase 1 and 4 |
