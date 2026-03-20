# Review Agent Dispatch & Full-Pipeline Orchestration Patterns

> Research compiled: 2026-03-20  
> Sources: Compound Engineering Plugin (EveryInc), GSD (gsd-build), Superpowers (obra), Academic papers

---

## Table of Contents

1. [How Each Framework Handles Code Review (Side-by-Side)](#1-how-each-framework-handles-code-review)
2. [Exact Agent Dispatch Mechanism for Parallel Review](#2-exact-agent-dispatch-mechanism)
3. [Finding Prioritization: P1/P2/P3 Systems](#3-finding-prioritization)
4. [How /lfg Chains the Full Pipeline and User Gates](#4-lfg-pipeline-and-user-gates)
5. [Recommended Design: "Reviewing" Skill (4–5 Agents)](#5-recommended-reviewing-skill)
6. [Recommended Design: Full-Auto Pipeline Mode](#6-full-auto-pipeline-mode)
7. [Academic Evidence on Multi-Agent Review Effectiveness](#7-academic-evidence)

---

## 1. How Each Framework Handles Code Review

### Side-by-Side Comparison

| Dimension | Compound Engineering (`/ce:review`) | GSD (`/gsd:execute-phase` + `/gsd:verify-work`) | Superpowers (`requesting-code-review`) |
|-----------|-------------------------------------|--------------------------------------------------|----------------------------------------|
| **Trigger** | Manual (`/ce:review`) or auto within `/lfg` after work | Auto after each execution wave + manual UAT | After each task / before merge |
| **Agent count** | 14+ named review agents (parallel dispatch) | 2 dedicated agents: `gsd-plan-checker` (pre) + `gsd-verifier` (post) | 1 focused `code-reviewer` subagent |
| **Execution mode** | Parallel (≤5 agents) or serial (6+ agents auto-switch) | Sequential (plan-check → execute → verify) | Single subagent with isolated context |
| **Review scope** | Code quality, security, performance, architecture, agent-native features, past patterns | Goal achievement vs. task completion; requirement coverage; stub/wiring detection | Code quality, architecture, tests, requirements, production-readiness |
| **Input to reviewers** | PR content + project review context from `compound-engineering.local.md` | Phase PLAN.md, SUMMARY.md, ROADMAP.md, REQUIREMENTS.md, CONTEXT.md | `{BASE_SHA}..{HEAD_SHA}` git diff + requirements/plan reference |
| **Output format** | P1/P2/P3 todo files in `todos/` directory | `VERIFICATION.md` with YAML frontmatter + gap structure | Categorized issues: Critical / Important / Minor |
| **Retry/re-run** | Re-run with `--serial` flag; re-verification if gaps found | Up to 3 plan-check iterations; re-verification mode if previous gaps exist | Reviewer pushback with technical reasoning |
| **User gate** | P1 findings block merge (hard gate) | Human verification required for visual / external flows | "Important" issues must be fixed before proceeding |
| **Config per project** | `compound-engineering.local.md` with `review_agents` YAML array | `config.json` workflow toggles (`plan_check`, `verifier`, `nyquist_validation`) | Per-review template placeholders |
| **Memory/compounding** | `learnings-researcher` queries `docs/solutions/` for past patterns | `SUMMARY.md` + `VERIFICATION.md` persist per phase | No built-in memory; each review is stateless |

---

### Compound Engineering: Review Agent Roster (Full List)

Sourced from [README.md](https://raw.githubusercontent.com/EveryInc/compound-engineering-plugin/main/plugins/compound-engineering/README.md):

#### Core Review Agents (Always Available)

| Agent | Specialty |
|-------|-----------|
| `kieran-rails-reviewer` | Rails code review with strict conventions |
| `kieran-python-reviewer` | Python code review with strict conventions |
| `kieran-typescript-reviewer` | TypeScript code review with strict conventions |
| `dhh-rails-reviewer` | Rails review from DHH/37signals perspective |
| `code-simplicity-reviewer` | Final pass for YAGNI violations and over-engineering |
| `security-sentinel` | Security audits and vulnerability assessments |
| `performance-oracle` | N+1 queries, memory leaks, complexity |
| `architecture-strategist` | Design patterns, SOLID, separation of concerns |
| `agent-native-reviewer` | Verify features have action + context parity (agent accessibility) |
| `pattern-recognition-specialist` | Analyze code for patterns and anti-patterns |
| `julik-frontend-races-reviewer` | JavaScript/Stimulus race conditions |
| `git-history-analyzer` | Analyze git history and code evolution (Comprehensive depth) |
| `data-integrity-guardian` | Database migrations and data integrity (Comprehensive depth) |
| `learnings-researcher` | Search `docs/solutions/` for past solutions (always runs last) |

#### Conditional Agents (Data Migrations Only)

| Agent | Trigger Condition |
|-------|-------------------|
| `schema-drift-detector` | PR contains `db/migrate/*.rb` or `db/schema.rb` |
| `data-migration-expert` | PR modifies ID mappings, enums, or has data backfill scripts |
| `deployment-verification-agent` | Any risky data change needing Go/No-Go checklist |

**Total possible simultaneous agents: up to 14+ (core + conditional + always-last)**

---

### GSD: Verification Architecture

GSD separates concerns into **three verification moments**:

1. **Pre-execution (Plan Checking)**: `gsd-plan-checker` runs after `gsd-planner` creates a plan, verifying 8 dimensions before execution is permitted. Loops up to 3 times if plan fails.

2. **Post-execution (Goal Verification)**: `gsd-verifier` spawns after each execution wave, checking that code achieves phase goals — not just that tasks were marked done. Three-level artifact check: exists → substantive (not stub) → wired (imported and used).

3. **Human UAT (`/gsd:verify-work`)**: Extracts testable items, walks user through them. If an item fails, debugger agents spawn to root-cause, formulate fix, and verify.

GSD's key insight: **task completion ≠ goal achievement**. A component file existing is not evidence the feature works.

---

### Superpowers: Focused Isolation Model

Superpowers uses the smallest possible footprint: one `code-reviewer` subagent per review, dispatched with precisely crafted context (no session history). The reviewer never sees the implementer's thought process — only the diff and requirements. This is explicitly optimized for "keeping the reviewer focused on the work product, not your thought process."

---

## 2. Exact Agent Dispatch Mechanism

### Compound Engineering Parallel Dispatch

From [ce-review/SKILL.md](https://raw.githubusercontent.com/EveryInc/compound-engineering-plugin/main/plugins/compound-engineering/skills/ce-review/SKILL.md):

**Step 1 — Configuration load:**
```
Read compound-engineering.local.md in project root
→ Extract YAML frontmatter: review_agents: [agent-list]
→ If no settings file: invoke setup skill to create one
```

**Step 2 — Mode selection:**
```
IF --serial flag OR long session:
  → Serial mode: one agent at a time, wait for completion
ELSE IF 5 or fewer configured agents:
  → Parallel mode (default)
ELSE IF 6+ configured agents:
  → Auto-switch to serial, inform user
```

**Step 3 — Parallel dispatch:**
```
For each agent in review_agents:
  Task {agent-name}(PR content + review context from settings body)

ALWAYS run last (regardless of mode):
  Task compound-engineering:review:agent-native-reviewer(PR content)
  Task compound-engineering:research:learnings-researcher(PR content)
```

**Step 4 — Conditional agents:**
```
IF PR contains db/migrate/*.rb OR db/schema.rb:
  Task schema-drift-detector (run FIRST)
  Task data-migration-expert
  Task deployment-verification-agent
```

**Context passed to each agent:**
- Full PR diff (or worktree contents)
- PR metadata: title, body, files, linked issues
- Review context from the markdown body of `compound-engineering.local.md`

**Auto-detection of execution mode:**
> "If more than 5 review agents are configured, automatically switch to serial mode and inform the user: 'Running review agents in serial mode (6+ agents configured). Use --parallel to override.'"

---

### GSD Plan-Checker Dispatch Loop

From [agents/gsd-plan-checker.md](https://raw.githubusercontent.com/gsd-build/get-shit-done/main/agents/gsd-plan-checker.md):

```
/gsd:plan-phase N
       │
       ├── Phase Researchers (x4 parallel)
       │   ├── Stack researcher
       │   ├── Features researcher  
       │   ├── Architecture researcher
       │   └── Pitfalls researcher
       │              │
       │         RESEARCH.md
       │              │
       │          Planner  ← reads PROJECT.md, REQUIREMENTS.md, CONTEXT.md, RESEARCH.md
       │              │
       │   ┌──────────▼──────────┐   ┌────────┐
       │   │   gsd-plan-checker  │──▶│ PASS?  │
       │   └─────────────────────┘   └───┬────┘
       │                              Yes │ No
       │                                  │   │
       │                                  │   └──▶ planner revises
       │                              (loop, max 3 iterations)
       │                                  │
       │                         PLAN files created
       └── Done
```

**8 verification dimensions checked by gsd-plan-checker:**
1. Requirement Coverage — every requirement has covering tasks
2. Task Completeness — Files + Action + Verify + Done fields present
3. Dependency Correctness — valid, acyclic dependencies; wave assignment matches
4. Key Links Planned — artifacts wired together (not just created)
5. Scope Sanity — ≤4 tasks/plan, ≤10 files/plan
6. Verification Derivation — must_haves trace to user-observable goals
7. Context Compliance — honors locked decisions from CONTEXT.md
8. Nyquist Compliance — every task has automated verify command mapped

---

### GSD Execution Wave Architecture

```
/gsd:execute-phase N
       │
       ├── Analyze plan dependencies (build wave graph)
       │
       ├── Wave 1 (independent plans, no depends_on):
       │   ├── Executor A (fresh 200K context) → commit
       │   └── Executor B (fresh 200K context) → commit
       │
       ├── Wave 2 (depends on Wave 1):
       │   └── Executor C (fresh 200K context) → commit
       │
       └── gsd-verifier
             └── Goal-backward analysis against phase goals
                   │
                   ├── PASS → VERIFICATION.md (success)
                   └── FAIL → structured gaps → /gsd:verify-work
```

Each executor: isolated 200K context, loads specific plan file, commits independently, no state bleed between agents.

---

### Superpowers Dispatch Pattern

From [requesting-code-review/SKILL.md](https://raw.githubusercontent.com/obra/superpowers/main/skills/requesting-code-review/SKILL.md):

```bash
# 1. Get git SHAs
BASE_SHA=$(git rev-parse HEAD~1)  # or origin/main
HEAD_SHA=$(git rev-parse HEAD)

# 2. Dispatch isolated subagent with template
Task superpowers:code-reviewer {
  WHAT_WAS_IMPLEMENTED: "..."
  PLAN_OR_REQUIREMENTS: "path/to/plan.md"
  BASE_SHA: "a7981ec"
  HEAD_SHA: "3df7661"
  DESCRIPTION: "Brief summary"
}
```

Key design: reviewer subagent receives **only** the diff and requirements — never the session history. This preserves reviewer objectivity and main context window.

---

## 3. Finding Prioritization

### Compound Engineering: P1/P2/P3 + File-Based Todos

From [ce-review/SKILL.md](https://raw.githubusercontent.com/EveryInc/compound-engineering-plugin/main/plugins/compound-engineering/skills/ce-review/SKILL.md):

**Severity tiers:**

| Priority | Symbol | Label | Criteria | Action |
|----------|--------|-------|----------|--------|
| P1 | 🔴 | CRITICAL | Security vulnerabilities, data corruption, breaking changes, critical architecture | **Blocks merge** — must fix before PR can land |
| P2 | 🟡 | IMPORTANT | Performance issues, architectural concerns, major code quality, reliability | Should fix before merging |
| P3 | 🔵 | NICE-TO-HAVE | Minor improvements, cleanup, optimization opportunities, docs | Record for future work |

**Todo file naming convention:**
```
{issue_id}-{status}-{priority}-{description}.md

Examples:
001-pending-p1-path-traversal-vulnerability.md
002-pending-p1-api-response-validation.md
003-pending-p2-concurrency-limit.md
004-pending-p3-unused-parameter.md
```

**YAML frontmatter in each todo:**
```yaml
status: pending | ready | complete
priority: p1 | p2 | p3
issue_id: "001"
tags: [code-review, security, performance]
dependencies: []
```

**Synthesis process:**
1. Collect all agent findings
2. Surface learnings-researcher results (flag as "Known Pattern" with links)
3. Discard any findings recommending deletion of pipeline artifacts (`docs/brainstorms/`, `docs/plans/`, `docs/solutions/`)
4. Categorize by type: security, performance, architecture, quality
5. Remove duplicates/overlaps
6. Estimate effort: Small / Medium / Large
7. Create todo files in parallel (3 sub-agents, one per severity tier) for scale

**Three parallel sub-agents for todo creation at scale:**
```
For large PRs (15+ findings):
  Sub-agent A → create all P1 todos in parallel
  Sub-agent B → create all P2 todos in parallel  
  Sub-agent C → create all P3 todos in parallel
```

---

### GSD: Status-Based Verification Output

GSD doesn't use P1/P2/P3 directly. Instead, findings become structured YAML gaps in `VERIFICATION.md`:

```yaml
status: passed | gaps_found | human_needed
score: "N/M must-haves verified"
gaps:
  - truth: "Observable truth that failed"
    status: failed | partial
    reason: "Brief explanation"
    artifacts:
      - path: "src/path/to/file.tsx"
        issue: "What's wrong"
    missing:
      - "Specific thing to add/fix"
human_verification:
  - test: "What to do"
    expected: "What should happen"
    why_human: "Why can't verify programmatically"
```

**Artifact severity levels:**
| Status | Meaning |
|--------|---------|
| 🛑 Blocker | Prevents goal achievement — execution re-run required |
| ⚠️ Warning | Incomplete but not blocking |
| ℹ️ Info | Notable, not blocking |

**Anti-pattern scanning: auto-detected stubs**
```python
# Red flags automatically detected:
- return null / return {} / return []
- Empty handlers: onClick={() => {}}
- TODO/FIXME/PLACEHOLDER comments
- Console.log-only implementations
- API routes returning static data without DB queries
- Components with state that never renders state
```

---

### Superpowers: Critical / Important / Minor

From [code-reviewer.md](https://raw.githubusercontent.com/obra/superpowers/main/skills/requesting-code-review/code-reviewer.md):

| Tier | Label | Criteria |
|------|-------|----------|
| Top | Critical (Must Fix) | Bugs, security issues, data loss risks, broken functionality |
| Middle | Important (Should Fix) | Architecture problems, missing features, poor error handling, test gaps |
| Bottom | Minor (Nice to Have) | Code style, optimization, documentation improvements |

**Output format per issue:**
```
- File:line reference
- What's wrong
- Why it matters
- How to fix (if not obvious)
```

**Verdict options:** "Ready to merge" / "With fixes" / "No"

**Key rule:** "Categorize by actual severity (not everything is Critical)" — prevent severity inflation.

---

## 4. /lfg Pipeline and User Gates

### Compound Engineering /lfg — Full Chain

From [lfg/SKILL.md](https://raw.githubusercontent.com/EveryInc/compound-engineering-plugin/main/plugins/compound-engineering/skills/lfg/SKILL.md):

```
/lfg [feature description]
       │
       ├── Step 1 (Optional): /ralph-wiggum:ralph-loop "finish all slash commands"
       │                        └── auto-completion loop wrapper (if available)
       │
       ├── Step 2: /ce:plan $ARGUMENTS
       │   GATE: STOP — verify plan file exists in docs/plans/
       │   └── Re-run if no plan file was created
       │
       ├── Step 3 (Conditional): /compound-engineering:deepen-plan
       │   Run ONLY IF:
       │   - Plan type is Standard or Deep
       │   - OR touches high-risk area (auth, security, payments, migrations, external APIs)
       │   - OR has confidence gaps in decisions, sequencing, risks, or verification
       │   GATE: STOP — confirm plan was deepened or judged sufficiently grounded
       │
       ├── Step 4: /ce:work
       │   GATE: STOP — verify files were created or modified (not just plan file)
       │
       ├── Step 5: /ce:review
       │
       ├── Step 6: /compound-engineering:resolve-todo-parallel
       │   └── Resolves P1/P2/P3 todos created by review step
       │
       ├── Step 7: /compound-engineering:test-browser
       │   └── Browser tests on PR-affected pages
       │
       ├── Step 8: /compound-engineering:feature-video
       │   └── Record walkthrough, add to PR description
       │
       └── Step 9: Output <promise>DONE</promise>
                   └── ONLY when video is in PR
```

**User gates (explicit STOP instructions):**
- After plan: human can review plan before any code is written
- After deepen-plan: human can confirm grounding
- After work: human can verify implementation happened

**The GATE pattern:** Each major step has a mandatory halt-and-verify instruction. The system doesn't auto-continue past gates; the LLM must explicitly confirm the prerequisite before proceeding.

---

### /slfg — Swarm Mode Variant

From [slfg/SKILL.md](https://raw.githubusercontent.com/EveryInc/compound-engineering-plugin/main/plugins/compound-engineering/skills/slfg/SKILL.md):

```
/slfg [feature description]
       │
       ├── Sequential Phase:
       │   ├── Step 1 (Optional): /ralph-wiggum:ralph-loop
       │   ├── Step 2: /ce:plan  
       │   ├── Step 3 (Conditional): /compound-engineering:deepen-plan
       │   └── Step 4: /ce:work — USE SWARM MODE
       │               └── Make a Task list
       │                   Launch an army of agent swarm subagents to build the plan
       │
       ├── Parallel Phase (launch simultaneously):
       │   ├── Step 5: /ce:review   ← spawned as background Task agent
       │   └── Step 6: /compound-engineering:test-browser ← spawned as background Task agent
       │               WAIT for both to complete before continuing
       │
       └── Finalize Phase:
           ├── Step 7: /compound-engineering:resolve-todo-parallel
           ├── Step 8: /compound-engineering:feature-video
           └── Step 9: Output <promise>DONE</promise>
```

**Key difference from /lfg:**
1. Work phase uses swarm (multiple parallel agents building simultaneously)
2. Review AND browser tests run **in parallel** (both spawned as background Tasks simultaneously)
3. No pause between review and test — they overlap

**When to use /slfg:** When you want maximum parallelism. Review runs while tests run; code feedback and browser feedback arrive simultaneously.

---

### GSD Pipeline (Phase-by-Phase Loop)

```
For each milestone phase:
  /gsd:plan-phase N
    ├── 4x parallel research agents → RESEARCH.md
    ├── gsd-planner → PLAN files
    ├── gsd-plan-checker (loop ≤3x until PASS)
    └── PLAN files ready

  /gsd:execute-phase N
    ├── Wave 1: parallel executors (independent plans)
    ├── Wave 2+: dependent executors
    └── gsd-verifier → VERIFICATION.md (PASS / gaps_found / human_needed)

  IF gaps_found → /gsd:verify-work N (human UAT)
    ├── Extract testables from VERIFICATION.md
    ├── Walk user through each test
    └── IF fail: spawn debugger → fix plan → re-execute

  IF passed → /gsd:ship N → PR creation
```

**User gates in GSD:**
- Interactive mode (default): confirms at each major step
- Yolo mode (`mode: "yolo"` in config): auto-approves all decisions
- Human-needed status: visual / external service flows always require human

---

## 5. Recommended Design: "Reviewing" Skill (4–5 Agents)

Based on patterns extracted from all three frameworks, here is the recommended design for a focused reviewing skill with 4–5 agents:

### Design Philosophy

1. **Parallel by default, serial as fallback** (Compound Engineering model)
2. **Goal-backward synthesis, not just checklist** (GSD model)
3. **Isolated context per reviewer** (Superpowers model)
4. **P1 blocks, P2 should fix, P3 records** (Compound Engineering model)
5. **Always run a learnings/memory check last** (Compound Engineering model)

---

### Recommended Agent Roster (4 agents + 1 meta)

```yaml
review_agents:
  - code-quality-reviewer      # Code correctness, DRY, error handling, type safety
  - security-reviewer          # Auth, injection, secrets, OWASP top 10
  - architecture-reviewer      # Design patterns, coupling, separation of concerns
  - test-coverage-reviewer     # Test quality, edge cases, integration gaps
  # Always last:
  - learnings-synthesizer      # Checks memory/past patterns for known issues
```

**Why these 4 + 1:**
- Code quality + security + architecture cover the 3 axes of "is this right, safe, and sound"
- Test coverage is the most commonly missing dimension in single-reviewer systems
- Learnings synthesizer compounds institutional knowledge (the CE insight that makes each review smarter)

---

### Dispatch Mechanism

```
/reviewing [target]
       │
       ├── 1. Load config from project-settings.md
       │   → review_agents list
       │   → review context notes
       │
       ├── 2. Determine target (PR | branch | file | latest)
       │   → checkout/worktree if needed
       │
       ├── 3. Choose mode:
       │   → ≤4 agents: PARALLEL (default)
       │   → 5+ agents: SERIAL (auto)
       │   → --serial flag: always serial
       │
       ├── 4. Dispatch review agents in parallel:
       │   Task code-quality-reviewer(diff + context)
       │   Task security-reviewer(diff + context)
       │   Task architecture-reviewer(diff + context)
       │   Task test-coverage-reviewer(diff + context)
       │
       ├── 5. Always dispatch last:
       │   Task learnings-synthesizer(diff + agent findings)
       │
       ├── 6. Synthesize findings:
       │   → Collect all agent reports
       │   → Surface learnings-synthesizer matches
       │   → Deduplicate overlapping issues
       │   → Assign P1/P2/P3 severity
       │   → Create finding files
       │
       └── 7. Present summary:
           → P1 count (blocks merge)
           → P2 count (should fix)
           → P3 count (records)
           → Agents used
           → Next steps
```

---

### Finding File Template

```
{id}-pending-{p1|p2|p3}-{slug}.md

Frontmatter:
  status: pending
  priority: p1 | p2 | p3
  source_agent: {agent-name}
  tags: [code-review, security | performance | architecture | quality]

Sections:
  - Problem Statement
  - Evidence (file:line, what's wrong, why it matters)
  - Proposed Solutions (2–3 options with pros/cons)
  - Acceptance Criteria
```

---

### Per-Project Configuration

```markdown
---
review_agents:
  - code-quality-reviewer
  - security-reviewer
  - architecture-reviewer
  - test-coverage-reviewer
---

# Review Context

Project-specific notes passed to all agents:
- "API is public — extra scrutiny on input validation"
- "We use X pattern heavily — watch for Y antipattern"
```

Setup skill auto-detects stack and offers quick presets (Rails / Python / TypeScript / general), matching CE's `/ce:setup` pattern.

---

## 6. Recommended Design: Full-Auto Pipeline Mode

Based on LFG + SLFG patterns, with GSD verification gates:

### Full-Auto Pipeline (`/go [feature]`)

```
/go [feature description]
       │
       ├── Phase 1: PLAN
       │   ├── Research agents (parallel): stack, patterns, pitfalls, best practices
       │   ├── Planner: synthesizes research → plan file
       │   ├── Plan-checker: goal-backward verification (loop ≤3x)
       │   └── GATE: plan file must exist before proceeding
       │           → Human can review plan here (interactive mode)
       │           → Auto-continues (yolo mode)
       │
       ├── Phase 2: DEEPEN (conditional)
       │   Run if plan touches: auth, security, payments, migrations, external APIs
       │   OR if plan has confidence gaps
       │   └── GATE: confirm plan grounded before work begins
       │
       ├── Phase 3: WORK
       │   ├── Dependency analysis → wave graph
       │   ├── Wave 1: independent executors in parallel (fresh 200K contexts)
       │   ├── Wave 2+: dependent executors (wait for upstream)
       │   └── GATE: verify files modified (not just docs)
       │
       ├── Phase 4: VERIFY + REVIEW (parallel in swarm mode)
       │   ├── Goal-backward verifier → VERIFICATION.md
       │   │     └── Checks: exists? substantive? wired?
       │   └── Review agents dispatch (parallel, per config)
       │         └── 4 domain agents + learnings synthesizer
       │
       ├── Phase 5: RESOLVE
       │   ├── Auto-fix P2/P3 todos (parallel subagents)
       │   ├── P1 todos: present to human OR halt pipeline
       │   └── Re-run review on fixes
       │
       ├── Phase 6: TEST
       │   ├── Browser tests on affected pages
       │   └── Human UAT for visual / auth / payment flows
       │
       ├── Phase 7: RECORD (optional)
       │   └── Feature video walkthrough → PR description
       │
       └── Phase 8: SHIP
           └── Create PR with VERIFICATION.md, todos, video
```

### Pipeline Configuration

```yaml
pipeline:
  mode: interactive | yolo          # interactive = human gates; yolo = fully auto
  deepen_plan: auto | always | never
  parallel_work: true               # use swarm mode in work phase
  parallel_review_test: true        # run review + test simultaneously (SLFG style)
  p1_blocks: true                   # P1 findings halt pipeline (require human)
  max_plan_check_iterations: 3
  verifier: true
  human_verification: 
    - visual_ui                     # always requires human
    - auth_flows                    # always requires human
    - payment_flows                 # always requires human
```

### Gate Philosophy

| Gate | Interactive Mode | Yolo Mode |
|------|-----------------|-----------|
| After plan creation | Show plan, wait for "proceed" | Auto-continue if plan file exists |
| After deepen-plan | Show changes, wait for approval | Auto-continue if grounded |
| After work | Show file list, wait | Auto-continue if files changed |
| After P1 findings | **Always halt** — require human decision | **Always halt** — P1 is never auto-approved |
| After browser test fail | Show failures, wait | Auto-create P1 todos, re-run fixes |
| Human verification items | Show test checklist | Skip (flag in PR for human review) |

**Insight from GSD:** The human-needed status for visual appearance, real-time behavior, and external service flows should **always** require human verification — even in fully autonomous mode. These are irreducibly human concerns.

---

### Anti-Patterns to Avoid (from GSD + CE)

1. **Trusting SUMMARY claims** — always verify code against goals, not what the agent said it did
2. **Existence = implementation** — check substantive (not stub) and wired (imported + used)
3. **Skipping key link verification** — 80% of stubs hide in wiring gaps
4. **Severity inflation** — not everything is P1; calibrate per Superpowers guidance
5. **Flagging pipeline artifacts for deletion** — CE explicitly protects `docs/brainstorms/`, `docs/plans/`, `docs/solutions/`
6. **Single large agent instead of parallel specialists** — each specialist maintains laser focus; parallel dispatch gives faster, higher coverage results
7. **Ignoring past learnings** — the `learnings-researcher` / `learnings-synthesizer` pattern is what makes reviews compound over time

---

## 7. Academic Evidence on Multi-Agent Review Effectiveness

### Key Papers

**1. Hydra-Reviewer (IEEE TSE, 2025)**
> Xiaoxue Ren et al., "Hydra-Reviewer: A Holistic Multi-Agent System for Automatic Code Review Comment Generation," [IEEE Transactions on Software Engineering, 2025](https://ieeexplore.ieee.org/document/11203269/), DOI: 10.1109/TSE.2025.3621462

- Holistic multi-agent framework using specialized LLM agents, each reviewing a different dimension
- Generated comments span **7.8 review dimensions** on average — single agents typically cover 1–3 dimensions
- Achieved BLEU score of **8.20** vs. best single-model baseline (DeepSeek-V3) of 7.85
- Cost: $0.018 and 62.63 seconds per code change — highly practical for CI integration
- **Key finding**: Multi-perspective review directly addresses the three main failures of single-agent ACR: lack of comprehensiveness, incorrectness, and vagueness

**2. CodeAgent (EMNLP 2024 + arXiv)**
> Xunzhu Tang et al., "CodeAgent: Autonomous Communicative Agents for Code Review," [ACL Anthology 2024](https://aclanthology.org/2024.emnlp-main.632), DOI: 10.18653/v1/2024.emnlp-main.632

- Novel multi-agent LLM system with a supervisory `QA-Checker` agent ensuring all reviewers address the initial question (analogous to CE's `learnings-researcher` always running last)
- Evaluated on 4 tasks: commit-message consistency, vulnerability detection, style adherence, code revision suggestion
- State-of-the-art results across all four tasks
- **Key insight**: Supervisory agent pattern prevents review fragmentation (each specialist working in isolation without coherence check)

**3. Multi-Agent LLM Collaboration Framework (IEEE MRAI 2025)**
> Tanush Sharanarthi et al., "Multi-Agent LLM Collaboration for Adaptive Code Review, Debugging, and Security Analysis," [IEEE MRAI 2025](https://ieeexplore.ieee.org/document/11135756/), DOI: 10.1109/MRAI65197.2025.11135756

- Framework integrates code review, bug detection, and security analysis agents operating independently and interactively
- FAISS-based memory reduces **redundant feedback** while maintaining essential corrective feedback
- Agents evolve recommendations based on user preferences and past interactions — direct validation of CE's `learnings-researcher` / compounding approach
- **Key finding**: Memory-augmented multi-agent review significantly outperforms stateless approaches on repeat codebases

**4. Multi-Agent Bug Detection and Refactoring (IJRASET 2025)**
> Tanveer Aamina et al., "Evaluating Multi-Agent AI Systems for Automated Bug Detection and Code Refactoring," [IJRASET 2025](https://www.ijraset.com/best-journal/evaluating-multiagent-ai-systems-for-automated-bug-detection-and-code-refactoring), DOI: 10.22214/ijraset.2025.74423

- Cooperative architecture: static-analysis, test-generation, root-cause, and refactoring agents coordinated via planning agent
- Results: **higher fix precision and refactoring quality** vs. single-agent baselines
- **Reduced developer review time**, especially on multi-file defects and design-smell cleanups
- Agent role ablations show: removing verification agent degrades precision most sharply
- **Key finding**: Disciplined, verifiable agent orchestration is "a practical path to safer, more scalable automated maintenance"

**5. Pearbot (EPJ Conferences)**
> Rybalchenko & Al-Turany, "Leveraging Large Language Models for Enhanced Code Review," [EPJ Conferences](https://www.epj-conferences.org/10.1051/epjconf/202533701066), DOI: 10.1051/epjconf/202533701066

- Open-source tool with multi-agent capabilities and reflection mechanisms
- Multi-agent architecture addresses common LLM review limitations through specialized agents + reflection loops
- Validates the pattern of agents that can review their own outputs before presenting to humans

**6. Self-Organized Agents / SoA (arXiv 2024)**
> Ishibashi & Nishimura, "Self-Organized Agents," [arXiv 2404.02183](https://arxiv.org/abs/2404.02183), DOI: 10.48550/arXiv.2404.02183

- Each agent handles significantly less code but overall quality is substantially greater
- SoA surpasses single-agent baseline by **5% in Pass@1 accuracy** on large codebases
- **Key finding**: Smaller scope per agent → better quality; parallelize for overall coverage, not just speed

---

### Summary of Academic Findings

| Finding | Evidence | Implication for Design |
|---------|----------|------------------------|
| Multi-perspective review covers 7.8 dimensions vs. 1–3 for single agents | Hydra-Reviewer (IEEE TSE 2025) | Use 4–5 specialist agents, not one general reviewer |
| Supervisory agent prevents fragmentation | CodeAgent (EMNLP 2024) | Always run a synthesis/QA agent last |
| Memory-augmented review reduces redundancy | Multi-Agent LLM Framework (IEEE MRAI 2025) | Build `learnings-synthesizer` that queries past findings |
| Smaller scope per agent = higher quality | SoA (arXiv 2024) | Don't overload individual review agents |
| Verification agent is the highest-impact component | Multi-Agent Bug Detection (IJRASET 2025) | Post-execution verification (gsd-verifier pattern) is not optional |
| Reflection loops catch issues before human review | Pearbot (EPJ 2025) | Plan-checker loop (≤3 iterations) is empirically sound |

---

## Summary: Patterns Worth Adopting

### Must-Have Patterns

1. **Parallel specialist dispatch with auto-serial fallback** (CE): Dispatch 4–5 domain agents simultaneously; auto-switch to serial if 6+ agents to avoid context pressure

2. **Always-last meta-agent** (CE + CodeAgent): `learnings-synthesizer` runs after all specialists, synthesizing findings and cross-referencing past solutions — this is what makes reviews compound

3. **Goal-backward verification, not task-completion check** (GSD): After every execution, verify that artifacts exist (level 1), are substantive/not stubs (level 2), and are wired/imported/used (level 3)

4. **Plan-checker loop before execution** (GSD): Max 3 iterations; 8-dimension verification; blocks execution if plan fails — prevents wasted work on fundamentally broken plans

5. **P1 always blocks / P2 should fix / P3 records** (CE + Superpowers): Never auto-merge with P1; don't skip P2s before moving to next task

6. **Isolated context per reviewer** (Superpowers): Each reviewer sees only diff + requirements — not session history. Prevents context contamination and keeps reviewers focused on work product

7. **User gates at PLAN, DEEPEN, and P1 findings** (LFG): Never auto-continue past a plan gate without verification. P1 findings are **always** human-gated, even in yolo mode

8. **Conditional migration agents** (CE): Schema/data migration PRs trigger specialized verification agents automatically (schema-drift-detector, data-migration-expert)

### Insight Hierarchy

```
Compound Engineering: HOW to dispatch many agents efficiently + compound learnings
GSD:                 WHAT to verify — goal-backward, artifact 3-level check
Superpowers:         WHO reviews — isolated context, clear severity calibration
Academic:            WHY it works — 7.8x coverage, 5% quality gain, reduced redundancy
```

---

*Sources:*
- *[Compound Engineering ce-review SKILL.md](https://raw.githubusercontent.com/EveryInc/compound-engineering-plugin/main/plugins/compound-engineering/skills/ce-review/SKILL.md)*
- *[Compound Engineering lfg SKILL.md](https://raw.githubusercontent.com/EveryInc/compound-engineering-plugin/main/plugins/compound-engineering/skills/lfg/SKILL.md)*
- *[Compound Engineering slfg SKILL.md](https://raw.githubusercontent.com/EveryInc/compound-engineering-plugin/main/plugins/compound-engineering/skills/slfg/SKILL.md)*
- *[Compound Engineering setup SKILL.md](https://raw.githubusercontent.com/EveryInc/compound-engineering-plugin/main/plugins/compound-engineering/skills/setup/SKILL.md)*
- *[Compound Engineering README.md](https://raw.githubusercontent.com/EveryInc/compound-engineering-plugin/main/plugins/compound-engineering/README.md)*
- *[GSD gsd-verifier agent](https://raw.githubusercontent.com/gsd-build/get-shit-done/main/agents/gsd-verifier.md)*
- *[GSD gsd-plan-checker agent](https://raw.githubusercontent.com/gsd-build/get-shit-done/main/agents/gsd-plan-checker.md)*
- *[GSD USER-GUIDE.md](https://github.com/gsd-build/get-shit-done/blob/main/docs/USER-GUIDE.md)*
- *[Superpowers requesting-code-review SKILL.md](https://raw.githubusercontent.com/obra/superpowers/main/skills/requesting-code-review/SKILL.md)*
- *[Superpowers code-reviewer.md](https://raw.githubusercontent.com/obra/superpowers/main/skills/requesting-code-review/code-reviewer.md)*
- *[Superpowers receiving-code-review SKILL.md](https://raw.githubusercontent.com/obra/superpowers/main/skills/receiving-code-review/SKILL.md)*
- *[Hydra-Reviewer, IEEE TSE 2025](https://ieeexplore.ieee.org/document/11203269/)*
- *[CodeAgent, EMNLP 2024](https://aclanthology.org/2024.emnlp-main.632)*
- *[Multi-Agent LLM Collaboration, IEEE MRAI 2025](https://ieeexplore.ieee.org/document/11135756/)*
- *[Multi-Agent Bug Detection, IJRASET 2025](https://www.ijraset.com/best-journal/evaluating-multiagent-ai-systems-for-automated-bug-detection-and-code-refactoring)*
- *[Compound Engineering: How Every Codes With Agents, Every.to 2025](https://every.to/chain-of-thought/compound-engineering-how-every-codes-with-agents)*
