# Compound Knowledge Patterns: Research Synthesis
## For the khuym "compounding" Skill Design

**Research Date:** 2026-03-20  
**Sources:** Compound Engineering plugin (EveryInc/compound-engineering-plugin), Every.to guide, CASS memory system, academic papers on episodic memory, GSD-2, Superpowers

---

## 1. The Full Compound Engineering Compound Loop

### 1.1 Core Philosophy

The foundational principle, stated in the [Every.to Compound Engineering guide](https://every.to/guides/compound-engineering):

> "The core philosophy of compound engineering is that each unit of engineering work should make subsequent units easier—not harder."

Traditional development accumulates technical debt: each feature adds complexity, and after 10 years teams spend more time fighting their system than building on it. Compound Engineering inverts this — bug fixes eliminate entire categories of future bugs; patterns become reusable tools; the codebase gets easier over time.

### 1.2 The Four-Step Loop

```
Plan → Work → Review → Compound → Repeat
```

Source: [GitHub README](https://github.com/EveryInc/compound-engineering-plugin)

| Step | Command | Purpose |
|------|---------|---------|
| Plan | `/ce:plan` | Transform feature ideas into detailed implementation plans |
| Work | `/ce:work` | Execute plans with worktrees and task tracking |
| Review | `/ce:review` | Multi-agent code review before merging |
| Compound | `/ce:compound` | Document learnings to make future work easier |

**Time allocation:** The plan and review steps should comprise **80% of an engineer's time**; work and compound the other **20%**. Most thinking happens before and after the code gets written.

### 1.3 The Six Parallel Subagents in `/ce:compound`

When `/ce:compound` is invoked, it runs through three phases. The heart is Phase 1, which launches **six subagents in parallel** — all return text data to the orchestrator (they do NOT write files themselves):

#### Phase 0.5: Auto Memory Scan (Pre-Phase)
Before launching Phase 1, the orchestrator reads `MEMORY.md` from the auto memory directory. Any entries semantically relevant to the problem being documented are passed as supplementary context (labeled `(auto memory [claude])`) to the Context Analyzer and Solution Extractor. Conversation history and codebase findings take priority over memory notes.

#### Phase 1: Parallel Research

1. **Context Analyzer**
   - Extracts conversation history
   - Identifies problem type, component, symptoms
   - Incorporates auto memory excerpts as supplementary evidence
   - Returns: YAML frontmatter skeleton

2. **Solution Extractor**
   - Analyzes all investigation steps
   - Identifies root cause
   - Extracts working solution with code examples
   - Conversation history and the verified fix take priority over memory notes; if they contradict, memory is noted as cautionary context
   - Returns: Solution content block

3. **Related Docs Finder**
   - Searches `docs/solutions/` for related documentation
   - Identifies cross-references and links
   - Finds related GitHub issues
   - Flags any related docs that may now be stale, contradicted, or overly broad (candidates for `ce:compound-refresh`)
   - Returns: Links, relationships, refresh candidates

4. **Prevention Strategist**
   - Develops prevention strategies
   - Creates best practices guidance
   - Generates test cases if applicable
   - Returns: Prevention/testing content

5. **Category Classifier**
   - Determines optimal `docs/solutions/` category from 9 auto-detected categories
   - Validates category against schema
   - Suggests filename based on slug
   - Returns: Final path and filename

6. **Documentation Writer** *(implicit in Phase 2)*
   - The orchestrator assembles all Phase 1 text results
   - Validates YAML frontmatter
   - Creates category directory if needed
   - Writes the **single** final file

**Critical rule:** Only ONE file is ever written — the final documentation. Phase 1 subagents return text data only. The orchestrator writes in Phase 2.

#### Phase 2: Assembly & Write

```
Collect all Phase 1 results
→ Assemble complete markdown file
→ Validate YAML frontmatter against schema
→ mkdir -p docs/solutions/[category]/
→ Write docs/solutions/[category]/[filename].md
```

#### Phase 2.5: Selective Refresh Check

After writing, the orchestrator evaluates whether the new learning contradicts or supersedes older docs. If so, it invokes `/ce:compound-refresh` with a narrow scope hint. This is **selective**, not automatic — only when:
- A related doc recommends an approach the new fix now contradicts
- The new fix clearly supersedes an older documented solution
- A refactor/migration/rename likely invalidated references in older docs

#### Phase 3: Optional Enhancement (Parallel)

Based on problem type, specialized domain agents can review the documentation:
- `performance_issue` → `performance-oracle`
- `security_issue` → `security-sentinel`
- `database_issue` → `data-integrity-guardian`
- Any code-heavy issue → `kieran-rails-reviewer` + `code-simplicity-reviewer`

### 1.4 Auto-Invoke Triggers

The compound step auto-triggers when the agent detects phrases like:
- "that worked"
- "it's fixed"
- "working now"
- "problem solved"

---

## 2. The `docs/solutions/` Document Format

### 2.1 File Organization

```
docs/solutions/
├── build-errors/
├── test-failures/
├── runtime-errors/
├── performance-issues/
├── database-issues/
├── security-issues/
├── ui-bugs/
├── integration-issues/
├── logic-errors/
├── developer-experience/
├── workflow-issues/
├── best-practices/
├── documentation-gaps/
└── patterns/
    └── critical-patterns.md   ← always read during lookup
```

Filename format: `[sanitized-symptom]-[module]-[YYYYMMDD].md`
Example: `n-plus-one-brief-generation.md`, `parameter-not-saving-state-EmailProcessing-20251110.md`

### 2.2 YAML Frontmatter Schema (Full)

Source: [`plugins/compound-engineering/skills/compound-docs/references/yaml-schema.md`](https://github.com/EveryInc/compound-engineering-plugin/blob/main/plugins/compound-engineering/skills/compound-docs/references/yaml-schema.md)

```yaml
---
module: "EmailProcessing"          # Required: module name or "System"
date: "2025-11-12"                 # Required: ISO 8601 YYYY-MM-DD
problem_type: performance_issue    # Required: enum (see below)
component: rails_model             # Required: enum (see below)
symptoms:                          # Required: array 1-5 items
  - "N+1 query when loading email threads"
  - "Brief generation taking >5 seconds"
root_cause: missing_include        # Required: enum (see below)
resolution_type: code_fix          # Required: enum (see below)
severity: high                     # Required: critical|high|medium|low
rails_version: "7.1.2"            # Optional
tags: [n-plus-one, eager-loading, performance]  # Optional: lowercase, hyphen-separated
# --- Fields added by compound-refresh ---
status: stale                      # Optional: "stale" when outdated
stale_reason: "API renamed"        # Optional
stale_date: "2026-02-01"          # Optional
superseded_by: "path/to/new.md"   # Optional
archived_date: "2026-02-01"       # Optional
archive_reason: "Feature removed"  # Optional
last_refreshed: "2026-02-01"      # Optional
---
```

**`problem_type` enum values:**
`build_error`, `test_failure`, `runtime_error`, `performance_issue`, `database_issue`, `security_issue`, `ui_bug`, `integration_issue`, `logic_error`, `developer_experience`, `workflow_issue`, `best_practice`, `documentation_gap`

**`component` enum values:**
`rails_model`, `rails_controller`, `rails_view`, `service_object`, `background_job`, `database`, `frontend_stimulus`, `hotwire_turbo`, `email_processing`, `brief_system`, `assistant`, `authentication`, `payments`, `development_workflow`, `testing_framework`, `documentation`, `tooling`

**`root_cause` enum values:**
`missing_association`, `missing_include`, `missing_index`, `wrong_api`, `scope_issue`, `thread_violation`, `async_timing`, `memory_leak`, `config_error`, `logic_error`, `test_isolation`, `missing_validation`, `missing_permission`, `missing_workflow_step`, `inadequate_documentation`, `missing_tooling`, `incomplete_setup`

**`resolution_type` enum values:**
`code_fix`, `migration`, `config_change`, `test_fix`, `dependency_update`, `environment_setup`, `workflow_improvement`, `documentation_update`, `tooling_addition`, `seed_data_update`

### 2.3 Document Body Structure

```markdown
---
[YAML frontmatter as above]
---

## Problem

[Exact error messages, observable behavior, symptoms]

## Investigation

[Steps tried that did NOT work and why — valuable for future debugging]

## Root Cause

[Technical explanation of what actually caused the issue]

## Solution

[Step-by-step fix with code examples]

```code
// The actual fix
```

## Prevention

[How to avoid this in future — best practices, tests to add]

## Related

- Related issue: #123
- See also: docs/solutions/performance-issues/related-problem.md
- (auto memory [claude]): note about similar pattern observed in session
```

---

## 3. How the `learnings-researcher` Retrieves and Injects Knowledge

Source: [`plugins/compound-engineering/agents/research/learnings-researcher.md`](https://github.com/EveryInc/compound-engineering-plugin/blob/main/plugins/compound-engineering/agents/research/learnings-researcher.md)

### 3.1 Integration with `/ce:plan`

During planning, `/ce:plan` runs two agents in parallel as Step 1 ("Local Research"):
- `repo-research-analyst` — analyzes codebase patterns, AGENTS.md guidance
- **`learnings-researcher`** — searches `docs/solutions/` for relevant past solutions

The learnings-researcher runs a **grep-first filtering strategy** to efficiently surface relevant knowledge before implementation begins.

### 3.2 Seven-Step Search Strategy

**Step 1: Extract Keywords**
From the feature/task description, identify:
- Module names (e.g., "BriefSystem", "EmailProcessing")
- Technical terms (e.g., "N+1", "caching", "authentication")
- Problem indicators (e.g., "slow", "error", "timeout")
- Component types (e.g., "model", "controller", "job")

**Step 2: Category-Based Narrowing (Optional)**
If feature type is clear (performance work → `performance-issues/`, database changes → `database-issues/`, etc.), narrow the search scope immediately.

**Step 3: Grep Pre-Filter (Critical)**
Run multiple Grep calls **in parallel** against YAML frontmatter fields (not full content). This minimizes tool calls dramatically:

```bash
# Run these IN PARALLEL, case-insensitive
Grep: pattern="title:.*email" path=docs/solutions/ output_mode=files_with_matches -i=true
Grep: pattern="tags:.*(email|mail|smtp)" path=docs/solutions/ output_mode=files_with_matches -i=true
Grep: pattern="module:.*(Brief|Email)" path=docs/solutions/ output_mode=files_with_matches -i=true
```

Pattern construction tips:
- Use `|` for synonyms: `tags:.*(payment|billing|stripe|subscription)`
- Include `title:` — often most descriptive
- Use `-i=true` for case-insensitive matching
- If >25 candidates: re-run with more specific patterns
- If <3 candidates: do broader content search as fallback

**Step 3b: Always Read `docs/solutions/patterns/critical-patterns.md`**
Regardless of grep results, this file is always read. It contains must-know patterns that apply across all work (high-severity issues promoted to required reading).

**Step 4: Read Frontmatter Only**
For each candidate file, read only the first 30 lines (the frontmatter). Extract: `module`, `problem_type`, `component`, `symptoms`, `root_cause`, `tags`, `severity`.

**Step 5: Score and Rank Relevance**
- **Strong match (prioritize):** `module` matches target, `tags` contain keywords, `symptoms` describe similar behaviors
- **Moderate match (include):** `problem_type` is relevant, `root_cause` suggests applicable pattern
- **Weak match (skip):** No overlapping tags, symptoms, or modules

**Step 6: Full Read of Relevant Files**
Only for strong/moderate matches: read the complete document to extract the full problem, solution, prevention guidance, and code examples.

**Step 7: Return Distilled Summaries**
```markdown
### [Title from document]
- **File**: docs/solutions/[category]/[filename].md
- **Module**: [module from frontmatter]
- **Problem Type**: [problem_type]
- **Relevance**: [Brief explanation of why this is relevant]
- **Key Insight**: [The most important takeaway — the thing that prevents repeating the mistake]
- **Severity**: [severity level]
```

### 3.3 How Learnings Are Injected Into Plan Context

The learnings-researcher's output is included in Step 1.6 ("Consolidate Research") of `/ce:plan`:
- Documented solutions from `docs/solutions/` are listed as "relevant institutional learnings"
- Key insights and gotchas to avoid are explicitly called out
- The full planning prompt then incorporates these as constraints, warnings, or guidance

**The compounding mechanism:** Each time a new feature is planned, past documented failures and solutions are automatically surfaced. The developer doesn't need to remember them — the system retrieves them. Over time, this prevents the same class of bugs from recurring.

### 3.4 Output Format for Plan Injection

```markdown
## Institutional Learnings Search Results

### Search Context
- **Feature/Task**: [Description]
- **Keywords Used**: [tags, modules, symptoms searched]
- **Files Scanned**: [X total files]
- **Relevant Matches**: [Y files]

### Critical Patterns (Always Check)
[Any matching patterns from critical-patterns.md]

### Relevant Learnings
#### 1. [Title]
- **File**: [path]
- **Module**: [module]
- **Relevance**: [why this matters for current task]
- **Key Insight**: [the gotcha or pattern to apply]

### Recommendations
- [Specific actions to take based on learnings]
- [Patterns to follow]
- [Gotchas to avoid]
```

---

## 4. Three-Category Taxonomy: Patterns, Decisions, Failures

### 4.1 Compound Engineering's Implicit Taxonomy

The `problem_type` enum in compound engineering encodes a taxonomy that maps to three broad categories:

| Category | Compound Engineering Types | Description |
|----------|---------------------------|-------------|
| **Failures** | `build_error`, `test_failure`, `runtime_error`, `performance_issue`, `database_issue`, `security_issue`, `ui_bug`, `logic_error` | Something went wrong; the fix prevents recurrence |
| **Patterns** | `best_practice`, `developer_experience` | What works well; reusable solutions and approaches |
| **Decisions** | `workflow_issue`, `integration_issue`, `documentation_gap` | Choices made with trade-offs; why the current approach was chosen |

The `critical-patterns.md` file in `docs/solutions/patterns/` is the highest-value artifact — it captures patterns promoted from individual learnings to universal guidance.

### 4.2 CASS Memory System's Taxonomy

Source: [Dicklesworthstone/cass_memory_system](https://github.com/Dicklesworthstone/cass_memory_system)

CASS (Cross-Agent Session State) uses a richer **playbook bullet** taxonomy with categories:
- `debugging` — Error resolution, bug fixing, tracing
- `testing` — Unit tests, mocks, assertions, coverage
- `architecture` — Design patterns, module structure, abstractions
- `workflow` — Task management, CI/CD, deployment
- `documentation` — Comments, READMEs, API docs
- `integration` — APIs, HTTP, JSON parsing, endpoints
- `collaboration` — Code review, PRs, team coordination
- `git` — Version control, branching, merging
- `security` — Auth, encryption, vulnerability prevention
- `performance` — Optimization, caching, profiling

And bullet `type`:
- `rule` — positive instruction ("Always X")
- `anti-pattern` — inverted warning ("PITFALL: Don't X")

### 4.3 Trajectory-Informed Memory Taxonomy

Source: [arXiv:2603.10600](https://arxiv.org/abs/2603.10600) — "Trajectory-Informed Memory Generation for Self-Improving Agent Systems"

The academic literature converges on three tip types extracted from agent execution trajectories:

| Category | Content | When Extracted |
|----------|---------|---------------|
| **Strategy Tips** | Effective patterns from clean successful executions — what worked well and should be replicated | After successful trajectories |
| **Recovery Tips** | Failure handling and error correction approaches — how the agent recognized and recovered | After failure-then-recovery trajectories |
| **Optimization Tips** | Efficiency improvements from successful but suboptimal executions | After successful but inefficient trajectories |

This three-category taxonomy provides **causal attribution**: not just "what happened" but "why decisions led to that outcome."

### 4.4 Recommended Three-Category Taxonomy for khuym

Based on convergence across all frameworks:

```
history/learnings/
├── patterns/          # What works — reusable approaches, conventions, best practices
│   └── *.md          # Each pattern: when to use, why it works, example
├── decisions/         # Why choices were made — ADR-style with trade-offs
│   └── *.md          # Each decision: context, options considered, choice, rationale
└── failures/          # What went wrong and how to prevent it
    └── *.md          # Each failure: symptom, root cause, fix, prevention
```

---

## 5. Recommended Design for Our "compounding" Skill

### 5.1 Core Principle

Mirror compound engineering's philosophy: **each task should make subsequent tasks easier**. The compounding skill is invoked after any non-trivial work completes, capturing what was learned while context is fresh.

### 5.2 Trigger Conditions

Auto-invoke when:
- Task marked as complete ("done", "finished", "fixed", "implemented")
- After any session that involved debugging, investigation, or design decisions
- After any architectural decision is finalized
- When `/ce:compound`-style explicit invocation is used

Skip for:
- Trivial single-line fixes
- Obvious typo corrections
- Standard boilerplate with no new patterns

### 5.3 Workflow Design

```
Compound Skill Workflow
══════════════════════

Phase 0: Context Scan
  └── Read history/learnings/ for any related prior entries
  └── Pass relevant prior entries as context to Phase 1

Phase 1: Parallel Analysis (3-4 subagents)
  ├── Context Analyzer → what happened, category classification
  ├── Pattern Extractor → what's reusable, what's the key insight
  ├── Prevention Strategist → how to avoid recurrence
  └── Category Classifier → which category (patterns/decisions/failures)

Phase 2: Assembly
  └── Orchestrator assembles from Phase 1 text results
  └── Validates frontmatter schema
  └── Writes single file: history/learnings/[category]/[slug]-[date].md

Phase 3: Index Update (Optional)
  └── Update history/learnings/INDEX.md with new entry
  └── Check if any existing entries should be marked stale

Phase 4: Staleness Check (Selective)
  └── Only if new learning contradicts or supersedes existing entry
  └── Flag stale entries with status: stale + stale_reason + stale_date
```

### 5.4 Retrieval Integration

The compounding skill pairs with a `learnings-retriever` agent (analogous to `learnings-researcher`) that:
1. Runs at the start of any planning session
2. Searches `history/learnings/` using grep-first filtering on YAML tags
3. Always reads `history/learnings/patterns/critical-patterns.md`
4. Injects relevant learnings into planning context

---

## 6. Recommended `history/learnings/` File Format

### 6.1 Directory Structure

```
history/learnings/
├── INDEX.md                        # Master index with brief summaries
├── patterns/
│   ├── critical-patterns.md        # Must-read patterns for every session
│   └── [pattern-slug]-[YYYYMMDD].md
├── decisions/
│   └── [decision-slug]-[YYYYMMDD].md
└── failures/
    ├── [symptom-slug]-[YYYYMMDD].md
    └── _archived/                  # Superseded or obsolete entries
```

### 6.2 YAML Frontmatter Schema

Adapted from Compound Engineering's schema, generalized beyond Rails:

```yaml
---
title: "Descriptive title of the learning"
category: failure                  # Required: pattern|decision|failure
date: "2026-03-20"                 # Required: ISO 8601
domain: "authentication"           # Required: the domain/feature area
component: "agent-planning"        # Required: the specific component
symptoms:                          # Required for failures: 1-5 observable symptoms
  - "Planning agent ignores prior context"
  - "Same mistake repeated across sessions"
root_cause: "no_retrieval_step"    # Required for failures
resolution_type: "skill_addition"  # Required: what kind of fix
severity: high                     # Required: critical|high|medium|low
tags: [planning, memory, context-injection, retrieval]  # Required: lowercase kebab
# --- For patterns ---
when_to_use: "When designing any multi-step planning flow"
# --- For decisions ---
options_considered: ["option-a", "option-b"]
chosen_option: "option-a"
rationale: "Why this was chosen over alternatives"
# --- Staleness management ---
status: active                     # active|stale|archived
stale_reason: ""
stale_date: ""
superseded_by: ""
last_reviewed: "2026-03-20"
---
```

### 6.3 Document Body Template

**For Failures:**
```markdown
---
[frontmatter]
---

## Symptom
[What was observed — exact error messages or behaviors]

## Investigation
[What was tried that didn't work, and why]

## Root Cause
[Technical explanation of the underlying cause]

## Fix
[Step-by-step resolution with examples]

## Prevention
[How to avoid this class of problem in future]
[Specific checks or tests to add]

## Related
- Prior art: [link to related learning]
- See also: [external reference]
```

**For Patterns:**
```markdown
---
[frontmatter]
---

## Pattern
[Clear statement of the reusable pattern]

## When To Use
[Specific conditions that should trigger this pattern]

## Why It Works
[Explanation of why this approach is effective]

## Example
[Concrete implementation example]

## Anti-Patterns
[Common mistakes this pattern prevents]
```

**For Decisions:**
```markdown
---
[frontmatter]
---

## Context
[What problem was being solved / what decision was needed]

## Options Considered
### Option A: [Name]
[Description, pros, cons]

### Option B: [Name]
[Description, pros, cons]

## Decision
[What was chosen and why]

## Trade-offs Accepted
[What was explicitly given up]

## Conditions for Revisiting
[When this decision should be re-evaluated]
```

### 6.4 `INDEX.md` Format

```markdown
# Learnings Index

Auto-generated index for grep-based retrieval.

## Patterns
| File | Domain | Tags | Summary |
|------|--------|------|---------|
| patterns/context-injection-YYYYMMDD.md | planning | context-injection, agents | Always inject prior learnings at plan start |

## Decisions
| File | Domain | Tags | Summary |
|------|--------|------|---------|

## Failures
| File | Domain | Tags | Severity |
|------|--------|------|----------|

## Critical Patterns
See: [patterns/critical-patterns.md](patterns/critical-patterns.md)
```

---

## 7. Integrating Optional CASS for Enhanced Retrieval

### 7.1 What CASS Is

[CASS (cass_memory_system)](https://github.com/Dicklesworthstone/cass_memory_system) is a **procedural memory system for AI coding agents** that implements a three-layer cognitive architecture:

```
┌─────────────────────────────────────────────────────┐
│ EPISODIC MEMORY (cass)                               │
│ Raw session logs from all agents — the ground truth  │
│ Claude Code │ Codex │ Cursor │ Aider │ Gemini │ ...  │
└───────────────────────┬─────────────────────────────┘
                        │ cass search
                        ▼
┌─────────────────────────────────────────────────────┐
│ WORKING MEMORY (Diary)                               │
│ Structured session summaries: accomplishments,       │
│ decisions, challenges, outcomes                      │
└───────────────────────┬─────────────────────────────┘
                        │ reflect + curate (automated)
                        ▼
┌─────────────────────────────────────────────────────┐
│ PROCEDURAL MEMORY (Playbook)                         │
│ Distilled rules with confidence tracking             │
│ Rules │ Anti-patterns │ Feedback │ Decay             │
└─────────────────────────────────────────────────────┘
```

CASS implements the **ACE (Agentic Context Engineering) Pipeline**:
1. **Generator** (`cm context`) — pre-task context hydration from playbook + history
2. **Reflector** (`cm reflect`) — LLM pattern extraction from diary entries
3. **Validator** — evidence gate ensuring rules have historical backing
4. **Curator** — deterministic merge (NO LLM) to prevent feedback loop drift

Key CASS features:
- **90-day half-life confidence decay** — rules lose confidence without revalidation
- **4× harmful multiplier** — one mistake counts as much as four successes
- **Anti-pattern inversion** — harmful rules auto-convert to "PITFALL: Don't X" warnings
- **Cross-agent learning** — patterns from Cursor sessions help Claude Code, and vice versa
- **Semantic search** (optional) — vector embeddings for non-keyword retrieval

### 7.2 The Primary CASS Integration Command

Before any non-trivial task, an agent runs:
```bash
cm context "implement auth rate limiting" --json
```

This returns:
```json
{
  "relevantBullets": [{"content": "Always check token expiry...", "effectiveScore": 8.5, "maturity": "proven"}],
  "antiPatterns": [{"content": "PITFALL: Don't cache auth tokens without expiry validation"}],
  "historySnippets": [{"snippet": "Fixed timeout by increasing token refresh interval...", "score": 0.87}],
  "suggestedCassQueries": ["cass search 'authentication timeout' --robot --days 30"]
}
```

### 7.3 How CASS Enhances the khuym Compounding Skill

CASS can serve as the **episodic memory layer** under khuym's file-based `history/learnings/` (which is the **procedural memory layer**):

```
khuym Architecture with Optional CASS
═══════════════════════════════════════

EPISODIC LAYER (optional CASS)
  └── Raw session logs → cass search → historical context snippets

PROCEDURAL LAYER (khuym history/learnings/)
  └── Distilled patterns/decisions/failures
  └── YAML-tagged for grep-based retrieval
  └── Managed by compounding skill

CONTEXT INJECTION (at plan start)
  └── learnings-retriever: grep history/learnings/ + read critical-patterns.md
  └── (optional) cm context "[task]" → additional episodic context
```

### 7.4 CASS Integration Protocol for khuym

If CASS is installed and available, the compounding skill should:

**At session start (before planning):**
```bash
cm context "<task description>" --json --limit 5 --min-score 6
```
Inject `relevantBullets` and `antiPatterns` into the planning context.

**During compound step (after task completion):**
```bash
cm reflect --days 1  # Extract rules from today's sessions
```
This auto-populates the CASS playbook. Separately, the khuym compounding skill writes the structured `history/learnings/` entry.

**Feedback inline:**
```
// [cass: helpful b-xyz] - this pattern prevented an N+1 bug
// [cass: harmful b-abc] - this advice was wrong for our use case
```

### 7.5 When to Use CASS vs Pure File-Based Approach

| Scenario | Recommendation |
|----------|---------------|
| Small project, single developer | Pure file-based `history/learnings/` — simpler, no dependencies |
| Team with multiple AI agents (Claude + Codex + Cursor) | Add CASS for cross-agent learning |
| Long-running project (>6 months) | Add CASS for confidence decay and staleness detection |
| Need semantic search beyond keyword grep | Add CASS with embeddings enabled |
| Strict privacy/offline requirements | Pure file-based only |

---

## 8. Academic Evidence on Episodic Memory and Compound Learning

### 8.1 Pink et al. 2025 — "Episodic Memory is the Missing Piece for Long-Term LLM Agents"

**Full citation:** Mathis Pink, Qinyuan Wu, Vy Ai Vo, Javier Turek, Jianing Mu, Alexander Huth, Mariya Toneva. "Position: Episodic Memory is the Missing Piece for Long-Term LLM Agents." *arXiv:2502.06975*, February 10, 2025. [https://arxiv.org/abs/2502.06975](https://arxiv.org/abs/2502.06975)

**Core argument:** As LLMs evolve from text-completion tools into agents operating in dynamic environments, they must address **continual learning and retaining long-term knowledge**. Biological systems solve this with episodic memory, which enables **single-shot learning of instance-specific contexts** — learning from a single experience without requiring multiple exposures.

**The five key properties of episodic memory** (from the abstract and related discussion):
1. **Single-shot learning** — learning from one exposure to an event
2. **Temporal context** — remembering *when* events occurred relative to each other
3. **Instance specificity** — recalling specific contextual details, not just generalizations
4. **Selective retrieval** — accessing memories most relevant to current context
5. **Adaptive behavior** — using past episodes to guide future decisions

**Roadmap:** The paper argues for an integrated focus on all five properties simultaneously, rather than the fragmented current state where research papers address individual properties in isolation.

**Direct relevance to khuym:** The `history/learnings/` file format implements a lightweight form of episodic memory:
- Each `.md` file is a discrete episode (instance-specific)
- The `date` field provides temporal context
- The YAML frontmatter enables selective retrieval
- The patterns/decisions/failures taxonomy enables adaptive behavior guidance

### 8.2 Jiang et al. 2026 — SYNAPSE: Episodic-Semantic Memory via Spreading Activation

**Citation:** Hanqi Jiang et al. "SYNAPSE: Empowering LLM Agents with Episodic-Semantic Memory via Spreading Activation." *arXiv:2601.02744*, January 6, 2026. [https://arxiv.org/abs/2601.02744](https://arxiv.org/abs/2601.02744)

**Key insight:** Standard retrieval-augmented approaches fail because they treat memory as disconnected. SYNAPSE models memory as a **dynamic graph where relevance emerges from spreading activation** — similar to how human associative memory works. Topics activate related topics, which activate their related topics.

**The "Contextual Tunneling" problem:** Standard cosine similarity search gets stuck in local optima — it finds the most directly similar document but misses related context that is semantically nearby but not identical.

**Triple Hybrid Retrieval:** Combines geometric embeddings (vector similarity) + activation-based graph traversal + temporal decay. On the LoCoMo benchmark, SYNAPSE significantly outperforms state-of-the-art in complex temporal and multi-hop reasoning.

**Relevance to khuym:** The `docs/solutions/patterns/critical-patterns.md` file in Compound Engineering approximates spreading activation — it's a curated set of high-activation patterns that link to deeper documents. For khuym, `history/learnings/patterns/critical-patterns.md` should serve the same function.

### 8.3 Trajectory-Informed Memory (arXiv:2603.10600, March 2026)

**Citation:** [Trajectory-Informed Memory Generation for Self-Improving Agent Systems](https://arxiv.org/abs/2603.10600), March 11, 2026.

**Key finding:** Generic memory systems storing conversational facts lack:
- Understanding of agent execution patterns
- Causal analysis of why decisions led to failures
- Structured learning extraction with categories
- Provenance tracking from learnings back to source trajectories

**Empirical results:** Up to **14.3 percentage point** gains in scenario goal completion on held-out tasks; **28.5 percentage point** improvement (149% relative increase) on complex tasks.

**Three-category extraction** (aligning perfectly with the khuym taxonomy):
- **Strategy Tips** — from successful executions
- **Recovery Tips** — from failure→recovery trajectories  
- **Optimization Tips** — from successful-but-inefficient executions

**Key architectural principle:** Extract at two granularities:
- **Task-level** tips for holistic patterns
- **Subtask-level** tips for cross-task transfer (authentication, data retrieval, processing phases)

**Relevance to khuym:** The three-category taxonomy (patterns/decisions/failures) maps directly to strategy/optimization/recovery. The subtask-level extraction principle suggests khuym learnings should tag which `component` they apply to, enabling retrieval at both broad and specific granularity.

### 8.4 CASS Memory Research Findings

The CASS memory system internally documents research in `RESEARCH_FINDINGS.md` (in the repository). Key convergent findings:
- **Confidence decay is necessary** — rules from months ago without revalidation can become anti-patterns
- **Deterministic curation prevents drift** — if an LLM both extracts and curates rules, quality degrades through feedback loops
- **Cross-agent learning is multiplicative** — a rule learned in one tool benefits all agents

### 8.5 Summary: Evidence for File-Based Episodic Memory

| Evidence | Source | Finding |
|----------|--------|---------|
| Episodic memory enables single-shot learning | [Pink et al., arXiv:2502.06975](https://arxiv.org/abs/2502.06975) | One documented failure prevents all future recurrences |
| Structured retrieval beats naive RAG | [Jiang et al., arXiv:2601.02744](https://arxiv.org/abs/2601.02744) | YAML frontmatter + grep outperforms vector search for structured data |
| Trajectory-informed extraction +14% goal completion | [arXiv:2603.10600](https://arxiv.org/abs/2603.10600) | Structured learning categories (strategy/recovery/optimization) improve performance |
| Semantic search +40% recall over keyword | [Fast.io benchmark](https://fast.io/resources/best-semantic-search-for-agents/) | When knowledge base grows large, add CASS embeddings |

---

## 9. The 80/20 and 50/50 Resource Allocation Rules

Source: [Every.to Compound Engineering Guide](https://every.to/guides/compound-engineering)

### 9.1 The 80/20 Rule (Within Feature Cycles)

> "The plan and review steps should comprise 80 percent of an engineer's time, and work and compound the other 20 percent."

Applied to a single feature cycle:
```
Plan      ██████████████████████ 40%
Review    ██████████████████████ 40%
Work      ██████  10%
Compound  ██████  10%
```

**Practical implication:** Most cognitive work happens before the first line of code is written (planning) and after the last line is committed (review + compound). Execution is the minority activity.

**Why this matters for khuym:** The compounding skill is part of the 20% "execution" bucket — it should be fast (5-10 min max), not a burden. Parallel subagents make this possible.

### 9.2 The 50/50 Rule (Across All Engineering Work)

> "You should allocate 50 percent of engineering time to building features, and 50 percent to improving the system — in other words, any work that helps build institutional knowledge rather than shipping something specific."

Applied across sprints/cycles:
```
Feature Work          ████████████████████████████████████████ 50%
System Investment     ████████████████████████████████████████ 50%
  └── Creating review agents
  └── Documenting patterns
  └── Building test generators
  └── Maintaining history/learnings/
```

Traditional engineering: 90% features, 10% "everything else." Compound Engineering: 50/50.

**The economics:**
> "An hour spent creating a review agent saves 10 hours of review over the next year. You can spend time building a test generator that saves weeks of manual test writing. System improvements make work progressively faster and easier, but feature work doesn't."

### 9.3 The Compounding ROI Model

```
First time solving problem X:   30 minutes (research + fix)
Document the solution:           5 minutes (compound step)
Next occurrence of problem X:    2 minutes (lookup + apply)
Net time saved per recurrence:  28 minutes

After 10 recurrences:           280 minutes saved from 5-minute investment
ROI:                            56× return
```

The compound step becomes increasingly valuable as the knowledge base grows — each new entry makes all future work marginally easier. This is the **compounding** effect: the value of the knowledge base grows non-linearly with time and entries.

---

## 10. Cross-Framework Comparison

| Aspect | Compound Engineering | GSD-2 | Superpowers | CASS |
|--------|---------------------|-------|-------------|------|
| **Storage format** | YAML+Markdown in `docs/solutions/` | YAML+Markdown in `.gsd/` | No persistent knowledge store | YAML playbook + JSONL sessions |
| **Retrieval method** | Grep on YAML frontmatter | File-based with index | None | Keyword search + optional embeddings |
| **Auto-trigger** | "that worked" phrases | Auto after task | None | `cm reflect` (cron) |
| **Categories** | 13 problem types | None formalized | CREATION-LOG per skill | 10 categories |
| **Staleness management** | `ce:compound-refresh` | None | None | 90-day confidence decay |
| **Cross-session memory** | Accumulated files | State machine files | None | Cross-agent sessions |
| **Learning injection** | `learnings-researcher` at plan time | None | None | `cm context` before task |
| **Academic backing** | Matches Pink et al. 2025 model | — | — | Implements full episodic→procedural pipeline |

---

## 11. Summary: Key Design Principles for khuym Compounding Skill

Based on the full research synthesis:

### 11.1 Non-Negotiable Design Choices

1. **File-based, not database-based.** Plain text files with YAML frontmatter are version-controlled, human-readable, tool-agnostic, and AI-readable without query languages. ([GSD-2 research confirms](https://github.com/gsd-build/gsd-2/blob/main/docs/building-coding-agents/04-optimal-storage-for-project-context.md))

2. **Grep-first retrieval, not full-scan.** Searching YAML frontmatter fields before reading full documents scales to hundreds of files without performance degradation.

3. **Always read `critical-patterns.md`.** This file is retrieved on every planning session regardless of search results — it prevents the most serious recurrent mistakes.

4. **Single file written per compound invocation.** Parallel subagents analyze; the orchestrator writes exactly one file. This prevents partial-state corruption.

5. **Three categories only: patterns, decisions, failures.** This is the minimal taxonomy that captures all knowledge types while remaining simple enough that classification is unambiguous.

6. **YAML frontmatter is the contract.** The `tags` array is the primary retrieval surface. Every entry must have thoughtfully chosen tags.

7. **Status field enables staleness tracking.** `status: stale` + `stale_reason` + `stale_date` replaces deletion — stale entries are valuable historical record.

### 11.2 Strongly Recommended Design Choices

8. **Inject learnings at plan start, not just compound end.** The knowledge is only useful if retrieved before work begins. Pair the compounding skill with a `learnings-retriever` agent.

9. **Promote entries to `critical-patterns.md` when severity is critical or high.** High-severity failures that could recur should be elevated to the always-read file.

10. **Add CASS when the team scales or cross-agent coordination is needed.** For single-developer projects, pure file-based is sufficient. CASS adds value at team scale.

### 11.3 The khuym Compounding Feedback Loop

```
Before Task: learnings-retriever
  └── grep history/learnings/ by tags
  └── always read critical-patterns.md
  └── inject relevant entries into plan context
          │
          ▼
During Task: standard work
          │
          ▼
After Task: compounding skill
  └── Phase 0: scan history/learnings/ for related priors
  └── Phase 1: 3 parallel subagents (analyze, extract, classify)
  └── Phase 2: orchestrator writes single file
  └── Phase 3: check if any existing entries should be marked stale
          │
          ▼
Growing Knowledge Base
  └── Each entry makes future tasks easier
  └── Compounding ROI grows with each entry
  └── Critical patterns prevent class-level recurring failures
```

---

## Sources

1. **Compound Engineering ce-compound SKILL.md** — [`plugins/compound-engineering/skills/ce-compound/SKILL.md`](https://github.com/EveryInc/compound-engineering-plugin/blob/main/plugins/compound-engineering/skills/ce-compound/SKILL.md) (fetched via GitHub API, March 2026)

2. **Learnings-researcher agent** — [`plugins/compound-engineering/agents/research/learnings-researcher.md`](https://github.com/EveryInc/compound-engineering-plugin/blob/main/plugins/compound-engineering/agents/research/learnings-researcher.md) (fetched via GitHub API, March 2026)

3. **ce-compound-refresh SKILL.md** — [`plugins/compound-engineering/skills/ce-compound-refresh/SKILL.md`](https://github.com/EveryInc/compound-engineering-plugin/blob/main/plugins/compound-engineering/skills/ce-compound-refresh/SKILL.md) (fetched via GitHub API, March 2026)

4. **compound-docs SKILL.md and YAML schema** — [`plugins/compound-engineering/skills/compound-docs/`](https://github.com/EveryInc/compound-engineering-plugin/tree/main/plugins/compound-engineering/skills/compound-docs) (fetched via GitHub API, March 2026)

5. **ce-plan SKILL.md** — [`plugins/compound-engineering/skills/ce-plan/SKILL.md`](https://github.com/EveryInc/compound-engineering-plugin/blob/main/plugins/compound-engineering/skills/ce-plan/SKILL.md) (fetched via GitHub API, March 2026)

6. **Every.to Compound Engineering Guide** — [https://every.to/guides/compound-engineering](https://every.to/guides/compound-engineering) (retrieved March 2026)

7. **CASS Memory System README** — [https://github.com/Dicklesworthstone/cass_memory_system](https://github.com/Dicklesworthstone/cass_memory_system) (retrieved March 2026)

8. **Pink, M. et al. (2025).** "Position: Episodic Memory is the Missing Piece for Long-Term LLM Agents." *arXiv:2502.06975*. [https://arxiv.org/abs/2502.06975](https://arxiv.org/abs/2502.06975)

9. **Jiang, H. et al. (2026).** "SYNAPSE: Empowering LLM Agents with Episodic-Semantic Memory via Spreading Activation." *arXiv:2601.02744*. [https://arxiv.org/abs/2601.02744](https://arxiv.org/abs/2601.02744)

10. **Trajectory-Informed Memory Generation for Self-Improving Agent Systems.** *arXiv:2603.10600*, March 11, 2026. [https://arxiv.org/abs/2603.10600](https://arxiv.org/abs/2603.10600)

11. **GSD-2 Optimal Storage for Project Context** — [https://github.com/gsd-build/gsd-2/blob/main/docs/building-coding-agents/04-optimal-storage-for-project-context.md](https://github.com/gsd-build/gsd-2/blob/main/docs/building-coding-agents/04-optimal-storage-for-project-context.md) (retrieved March 2026)

12. **Superpowers CREATION-LOG.md (systematic-debugging)** — [https://github.com/obra/superpowers/blob/main/skills/systematic-debugging/CREATION-LOG.md](https://github.com/obra/superpowers/blob/main/skills/systematic-debugging/CREATION-LOG.md) (retrieved March 2026)
