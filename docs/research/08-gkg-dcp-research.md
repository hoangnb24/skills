# GKG + OpenCode Dynamic Context Pruning — Research Notes

## GKG (GitLab Knowledge Graph)

### What It Is
A Rust code indexing engine that turns codebases into a live, queryable graph database. Parses AST into a Kuzu graph DB. Exposes MCP tools for AI agents.

### Key MCP Tools
- `repomap` — API map of files ranked by usage (inspired by Aider's repomap). Allows traversing thousands of files effectively.
- `search_codebase_definitions` — Find code definitions (defaults ~50 items/call)
- `read_definitions` — Read detailed definitions
- `import_usage` — Dependency analysis, resolve imports across codebase
- `get_references` — Find all references to a symbol

### Benchmark Results (SWE-Bench Lite)
- 7% average accuracy improvement over baseline
- Up to 10% higher on individual runs
- 20% less time to resolve average issue
- 21% fewer tool calls
- 5% more tokens used (deeper exploration)
- Evaluated with OpenCode + Claude Sonnet 4, n=11 runs

### Integration Pattern
1. `gkg index` — indexes the repo (one-time or after major changes)
2. GKG server starts as MCP endpoint
3. Agent queries via `knowledge_graph_*` MCP tools during execution
4. Most used tool: `repomap` (0.7 calls/fixture average)

### Relevance to Our Skill
- **Phase 1 (Brainstorm)**: `repomap` provides instant architectural overview
- **Phase 2 (Breakdown)**: `import_usage` + `get_references` inform dependency analysis for task decomposition
- **Phase 3 (Spike)**: `search_codebase_definitions` helps find existing patterns before prototyping
- **Phase 4 (Execute)**: `get_references` ensures changes don't break upstream code

---

## OpenCode Dynamic Context Pruning (DCP)

### What It Is
A plugin for OpenCode that intelligently manages conversation context to reduce token usage. Replaces pruned content with placeholders before sending to LLM — session history is never modified.

### Core Strategies
1. **Compress** — Model selects conversation range, replaces with technical summary. Nesting for overlapping compressions. Protects critical tool outputs.
2. **Deduplication** — Identifies repeated tool calls (same tool + args), keeps only most recent output.
3. **Supersede Writes** — Prunes write tool inputs if file was subsequently read.
4. **Purge Errors** — Removes inputs from errored tool calls after N turns (default: 4).

### Key Configuration
- `maxContextLimit`: 150000 (soft threshold — nudges above)
- `minContextLimit`: 50000 (reminder threshold)
- `nudgeFrequency`: 5 (messages between nudges)
- `protectedTools`: task, skill, todowrite, todoread, compress, batch, plan_enter, plan_exit
- `protectedFilePatterns`: matches tool parameters.filePath

### Performance
- Cache hit rates: ~85% with DCP vs ~90% without (small trade-off)
- Can eliminate 50,000+ tokens of irrelevant context in a single session
- 1.5k GitHub stars, 61 releases, active development

### Relevance to Our Skill
- **Not directly applicable to Claude Code** — DCP is an OpenCode plugin
- **The CONCEPTS are applicable**: 
  - Context pruning strategy should be part of our "context recovery" protocol
  - The "protected tools" concept maps to: always protect CLAUDE.md reads, bead descriptions, and spike results
  - Deduplication concept: when agents re-read files, the skill should track what's already in context
  - The nudge system: our skill should have thresholds for when to suggest context compaction

### How to Integrate the Concept (Not the Tool)
Since we're on Claude Code, not OpenCode, we extract the principles:
1. **Protected context** — Define what must NEVER be lost during compaction: current bead description, CLAUDE.md conventions, AGENTS.md coordination rules
2. **Stale context detection** — After N tool calls, suggest the agent compress/summarize findings before continuing
3. **Error pruning** — Failed approaches should be summarized and removed from active context, but recorded in spike/compound artifacts
4. **Future integration** — When Claude Code gets a plugin system or when switching to OpenCode, DCP can be integrated directly
