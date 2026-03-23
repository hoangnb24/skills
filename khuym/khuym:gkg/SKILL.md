---
name: khuym:gkg
description: >-
  Codebase intelligence support skill using the gkg tool. Use when asked about codebase
  architecture, finding files related to a feature, dependency graphs, module relationships,
  code patterns, or when the khuym:planning skill needs an architecture snapshot during Phase 1
  Discovery. Trigger phrases include what is the architecture, find files related to,
  show dependency graph, what patterns does this codebase use, how is X wired.
metadata:
  version: '1.0'
  ecosystem: khuym
  type: support
---

# gkg — Codebase Intelligence

## When to Use

- User asks: "What's the architecture of this project?"
- User asks: "Find all files related to authentication"
- User asks: "Show me the dependency graph for module X"
- User asks: "What patterns does this codebase use?"
- **planning** Phase 1 (Discovery) needs an architecture snapshot
- **planning** Phase 2 (Synthesis) needs to validate approach against codebase reality
- **exploring** Phase 2 (Gray Area) needs quick pattern confirmation

## Check for gkg First

Before running any command, verify gkg is available:

```bash
which gkg 2>/dev/null && echo "AVAILABLE" || echo "FALLBACK"
```

If `FALLBACK` → use the [Fallback Commands](#fallback-without-gkg) section below.

---

## Commands

### `gkg repo_map` — Architecture Snapshot

Use at the **start** of any discovery phase. Produces a ranked overview of files and their relationships.

```bash
gkg repo_map
```

When to call: planning Phase 1, first time encountering an unfamiliar codebase.  
Output: Save to `history/<feature>/discovery.md` under the heading `## Architecture Snapshot`.

### `gkg search <query>` — Semantic Code Search

Find code by meaning, not just text match.

```bash
gkg search "authentication middleware"
gkg search "database connection pooling"
gkg search "error handling patterns"
```

When to call: planning Phase 1 Agent B (pattern search), exploring Phase 2 (existing patterns check).  
Output: Append results to `history/<feature>/discovery.md` under `## Existing Patterns`.

### `gkg deps <file>` — Dependency Graph

Show what a file imports and what imports it.

```bash
gkg deps src/auth/middleware.ts
gkg deps lib/db/connection.go
```

When to call: planning Phase 1 Agent A (constraints check), validating (verifying bead file scope isolation doesn't break deps).  
Output: Append to `history/<feature>/discovery.md` under `## Dependency Graph`.

### `gkg context <file>` — Full File Context

Get imports, exports, and usage sites for a specific file.

```bash
gkg context src/api/routes.ts
```

When to call: When a bead's file scope needs clarification, or khuym:executing skill needs to understand a file before modifying it.  
Output: Use inline (don't always save — only save if it changes the approach).

---

## Integration with Planning Skill

The khuym:planning skill calls gkg in **Phase 1 (Discovery)** via parallel Task agents:

| Agent | gkg Command | Output Section |
|-------|------------|----------------|
| Agent A | `gkg repo_map` | `## Architecture Snapshot` |
| Agent B | `gkg search <feature-keywords>` | `## Existing Patterns` |
| Agent C | `gkg deps <entry-files>` | `## Dependency Graph` |

In **Phase 2 (Synthesis)**, the khuym:planning skill may call:
```bash
gkg search "<proposed-approach-keywords>"
```
to confirm the approach aligns with existing patterns — not to change the plan, but to catch contradictions early.

The **exploring** skill uses gkg lightly — one `gkg search` call at most, to check if a gray area already has an answer in code. Never deep analysis during exploring.

---

## Output Format

All gkg outputs saved to `history/<feature>/discovery.md`:

```markdown
## Architecture Snapshot
<!-- gkg repo_map output -->
Generated: <timestamp>
Top files by usage: <list>
Key modules: <list>

## Existing Patterns
<!-- gkg search results -->
Query: "<search-term>"
Matches:
- <file>: <summary> (deps: N)

## Dependency Graph
<!-- gkg deps output -->
File: <path>
Imports: <list>
Imported by: <list>
```

Always include:
- File paths (absolute from project root)
- Dependency counts where available
- A 1-line pattern summary per result

---

## Fallback Without gkg

If gkg is not installed, use these equivalents:

| gkg Command | Fallback |
|-------------|----------|
| `gkg repo_map` | `find . -name "*.ts" -o -name "*.go" -o -name "*.py" \| head -60` + `cat package.json` or equivalent manifest |
| `gkg search <query>` | `grep -r "<query>" --include="*.ts" -l \| head -20` |
| `gkg deps <file>` | `grep -r "<filename>" --include="*.ts" -l` + manual import scan |
| `gkg context <file>` | `head -50 <file>` + grep for exports |

Note fallback in discovery.md: `> gkg not available — used grep/find fallback`.

---

## Red Flags

- **Do not index on every run** — `gkg index` is one-time or post-major-refactor only. If it's slow, it means re-indexing is happening unnecessarily.
- **Do not use gkg as a replacement for reading files** — gkg gives structural overview; actually read key files before modifying them.
- **Do not run gkg during executing** — architecture queries belong in planning/validating. If an executing agent needs codebase context, it reads the already-generated `discovery.md`.
- **Do not skip saving to discovery.md** — downstream agents (synthesizer, plan-checker) depend on this file.
