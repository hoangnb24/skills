# Final Architecture: Custom Coding Agent Skill
## "Forge" — Cross-Framework Synthesis Skill

---

## Design Principles

1. **Beads + bv + Agent Mail are core infrastructure** — always required
2. **CASS + CM are optional enhancements** — used when available, gracefully degraded when not
3. **Extensible tool harness** — GKG, DCP, and future tools plug in through a standard interface
4. **Single-agent is the default path** — multi-agent swarm is opt-in for large projects
5. **Every phase produces a named artifact** — no agent ever asked to "remember" earlier conversations
6. **Progressive complexity** — tiny tasks skip phases; large tasks use the full pipeline

---

## Phase Architecture

```
Phase 0: BOOTSTRAP  → One-time project setup (CLAUDE.md + AGENTS.md + beads init)
Phase 1: BRAINSTORM → Design dialogue + spec-review loop (Superpowers mechanics)
Phase 2: BREAKDOWN  → Discuss-lock + story decomposition → beads (GSD + BMAD + bv)
Phase 3: SPIKE      → Technical discovery sprint with stop/go gate (Unique)
Phase 4: EXECUTE    → Wave-based bead execution with completion promise (GSD + Ralph + AM)
Phase 5: COMPOUND   → Knowledge capture + review (Compound Engineering + CM optional)
```

### Adaptive Skip Logic

| Scale | Signal | Active Phases | Agent Mode |
|-------|--------|---------------|------------|
| Tiny (<30min) | Single file, obvious fix | 4 only (with Ralph promise) | Single |
| Small (30min-2hr) | Clear scope, no unknowns | 1→2→4 (skip spike) | Single |
| Medium (2-8hr) | Multiple components, some unknowns | Full pipeline 0-5 | Single + sub-agents for review |
| Large (>8hr) | Multiple epics, significant unknowns | Full pipeline 0-5 | Multi-session swarm |
| Spike-only | Pure technical investigation | 3 only | Single |

**Scale detection**: The agent evaluates based on:
- Number of files likely touched (1-3 = tiny, 4-10 = small, 10+ = medium/large)
- Number of unknowns (0 = tiny/small, 1-2 = medium, 3+ = large)
- Cross-system dependencies (none = tiny, some = medium, many = large)

---

## Tool Harness Architecture

### Core Tools (Required)
| Tool | Purpose | Phase Usage |
|------|---------|-------------|
| `br` (beads) | Task storage, three-field structure | 2, 4 |
| `bv` (beads viewer) | Graph-theory routing, triage, execution order | 2, 4 |
| `am` (Agent Mail) | File reservation, multi-agent coordination | 4 |

### Optional Enhancements
| Tool | Purpose | Integration Point |
|------|---------|-------------------|
| `cass` | Cross-session search (avoid re-solving) | 1, 3 |
| `cm` | Three-layer procedural memory | 3, 5 |
| `gkg` | Codebase knowledge graph (definitions, references, repomap) | 1, 2, 3, 4 |

### Future Tool Slots
| Tool | Purpose | Expected Integration |
|------|---------|---------------------|
| DCP (Dynamic Context Pruning) | Context management for long sessions | 4 (when OpenCode compatible) |
| Custom MCP tools | User-defined capabilities | Any phase |

### Tool Detection Protocol
At session start, the skill checks tool availability:
```
1. Check: `br --version` → beads available?
2. Check: `bv --version` → beads viewer available?
3. Check: `am` or MCP Agent Mail → Agent Mail available?
4. Check: `cass --version` → CASS available? (optional)
5. Check: `cm --version` → CM available? (optional)
6. Check: `gkg --version` → GKG available? (optional)
7. Record available tools in session context
```

If core tools are missing, surface clear error with install instructions.
If optional tools are missing, note in context and use alternative approaches.

---

## Phase 0: Bootstrap

**One-time per project. Never repeated.**

### Outputs
1. `CLAUDE.md` — Living project memory with structured sections:
   ```
   ## Architecture Decisions
   ## Conventions
   ## Anti-Patterns
   ## Validated Approaches (from spikes)
   ```
2. `AGENTS.md` — Tool blurbs, coordination rules, file reservation protocol
3. `.beads/` directory initialized via `br` (or `br init` equivalent)
4. `docs/references/` — Pinned tech stack docs (only if unfamiliar tech)

### Optional Enhancements
- If `cm` available: `cm init --repo` for procedural memory
- If `cass` available: `cass search "<domain>"` for prior work
- If `gkg` available: `gkg index` for codebase graph

### Critical Rule
Agents MUST read `AGENTS.md` before any session, and `CLAUDE.md` before any planning.

---

## Phase 1: Brainstorm

**Source: Superpowers brainstorming mechanics**

### Workflow
1. **Explore context first** — read files, docs, recent commits
   - If `gkg` available: use `repomap` for architectural overview
   - Read `CLAUDE.md` for existing conventions and anti-patterns
2. **Scope check** — if topic spans multiple subsystems, decompose first
3. **Visual companion offer** — if UI/UX involved, offer in standalone message
4. **Clarifying questions one at a time** — multiple choice preferred
5. **Propose 2-3 approaches** — with trade-offs, lead with recommended
6. **Present design section by section** — ask "does this look right?" per section
7. **Write design doc** — save to `docs/plans/YYYY-MM-DD-<topic>-design.md`

### Spec-Review Loop
- Dispatch spec-document-reviewer sub-agent with ONLY the spec file (never session history)
- Reviewer checks: completeness, ambiguity, scope creep, YAGNI violations
- Max 3 iterations (reduced from 5 — LLM bias ceiling)
- Produce CHANGELOG of findings so human can quickly evaluate
- **HUMAN APPROVAL REQUIRED** before proceeding — this is the actual gate

### Optional Enhancement
- If `cass` available: search prior sessions for related designs before starting

### Handoff Artifact
`docs/plans/YYYY-MM-DD-<topic>-design.md` (spec-reviewed, human-approved)

---

## Phase 2: Breakdown

**Source: GSD discuss-lock + BMAD story mechanics + bv routing**

### Step A: Discuss Phase (GSD)
For each gray zone in the design doc, ask until satisfied:
- Visual behavior, API contracts, auth approach, performance constraints
- Record decisions in the design doc under a "## Locked Decisions" section
- For quick tasks, use batch mode (ask grouped questions)
- Result: zero planning-time ambiguity

### Step B: Task Decomposition (BMAD story mechanics)
Create one bead per task component with rich embedded context:
- **description**: What to build + why it fits architecture + acceptance criteria
- **design**: Implementation approach + file paths + test requirements
- **notes**: Edge cases + related beads + reference links

Each bead must be self-contained — the executing agent reads ONLY the bead + AGENTS.md + CLAUDE.md. Never reference other planning docs.

### Step C: Graph Validation (bv)
```bash
bv --robot-graph    # Verify dependency graph is valid (no cycles)
bv --robot-triage   # Get execution order recommendation
```

### Optional Enhancement
- If `gkg` available: use `import_usage` + `get_references` to validate dependency analysis

### Bead Polishing
Run 2-3 review rounds:
- "Review all beads exhaustively. Check: completeness, ambiguity, missing dependencies, scope creep, test coverage. Previous round found: [list]. What did it miss?"
- Stop when changes become incremental (convergence)

### Handoff Artifact
Polished bead set with dependency graph verified by `bv --robot-graph`

---

## Phase 3: Spike

**Source: Your Technical Discovery Sprint template (unique)**

### When to Spike
- Any bead with risk level MEDIUM or HIGH
- Any technology not yet used in the project
- Any approach not validated by prior spikes (check CLAUDE.md)

### Execution
1. **Pre-spike search**:
   - If `cass` available: `cass search "<topic>" --robot-mode`
   - If `cm` available: `cm context "<domain>"`
   - Read CLAUDE.md "Validated Approaches" and "Anti-Patterns"
2. **Define success criteria** as machine-verifiable assertions
3. **Isolated branch**: `spike/<bead-id>-<slug>`
4. **Prototype** — minimal proof-of-concept only
5. **Time-box**: Maximum 2 hours per spike. If unresolved, escalate.

### Completion Promise (Ralph mechanics)
The agent cannot exit the spike until:
1. All success criteria evaluated (pass/fail with evidence)
2. At least one alternative approach considered
3. Edge cases documented

### Stop/Go Gate
```
✅ GO — all criteria met
   → Update bead `design` field with validated approach
   → CLAUDE.md: add to "Validated Approaches"
   → Spike branch archived

⚠️ CONDITIONAL GO — partially met
   → Document conditions as new blocking beads
   → Human decision required

❌ STOP — approach invalidated
   → CLAUDE.md: add to "Anti-Patterns"
   → Trigger brainstorm for alternative
```

### Handoff Artifact
`docs/spikes/YYYY-MM-DD-<bead-id>-spike.md` + updated bead `design` field + CLAUDE.md entry

---

## Phase 4: Execute

**Source: GSD wave execution + Ralph completion promise + Agent Mail coordination**

### Session Kickoff (Every Agent)
1. Read `AGENTS.md` — full operating manual
2. `am macro_start_session` — register, check mail, note file reservations
3. `bv --robot-triage` — graph analysis + next bead recommendation
4. Check spike results in bead `design` fields

### Execution Modes

#### Single-Agent Mode (default)
- One Claude Code session
- Process beads sequentially by `bv` priority
- Sub-agents for isolated file-scoped work

#### Multi-Session Mode (medium/large)
- 2-4 Claude Code sessions
- Each session claims a track (group of related beads)
- Agent Mail coordinates: file reservations prevent conflicts
- Wave execution: independent beads in parallel, dependent beads wait

#### Swarm Mode (large only)
- 5+ Claude Code sessions
- Full Agent Mail coordination with TTL file reservations
- `bv --robot-triage` per session to select work
- Human "clockwork deity" monitors via Agent Mail

### Per-Bead Protocol
1. Claim bead: `br update <id> --status in-progress`
2. Reserve files: `am file_reservation_paths([...files...])`
3. Read bead (description + design + notes) + AGENTS.md + CLAUDE.md
4. Implement with fresh context
5. Self-review: spec compliance then code quality
6. Run tests (if applicable)
7. Atomic git commit with bead ID reference
8. Release reservations, close bead: `br close <id>`

### Completion Promise (Ralph mechanics)
Agent cannot exit bead execution until:
1. All acceptance criteria evaluated
2. Tests pass (or documented why N/A)
3. File reservations released
4. Git commit made

### Context Recovery Protocol
If context compaction detected:
1. Re-read `AGENTS.md` (full operating manual)
2. Re-read `CLAUDE.md` (conventions + anti-patterns)
3. Re-read current bead (description + design + notes)
4. Check Agent Mail for any messages from other agents
5. Resume from last git commit

### Git Workflow
- Feature branch: `feature/<epic-slug>` (from main)
- Per-bead commits: `[bead-<id>] <description>`
- After wave complete: PR for review
- After compound review: merge to main

### Handoff Artifact
Merged commits per wave, bead statuses updated

---

## Phase 5: Compound

**Source: Compound Engineering capture + CM consolidation (optional)**

### Knowledge Capture (Every PR)
Capture three types of knowledge:
1. **Patterns** — New approaches with code examples
2. **Decisions** — Why approach A over B, with rationale
3. **Failures** — What went wrong, root cause, prevention

### Review Sub-Agents (4-5 focused)
| Reviewer | Focus |
|----------|-------|
| `security-sentinel` | Auth flaws, injection, secrets in code |
| `performance-oracle` | N+1 queries, blocking I/O, recomputes |
| `architecture-strategist` | Boundary violations, coupling, scalability |
| `simplicity-checker` | YAGNI violations, over-engineering |
| `spike-alignment-validator` | Does implementation match validated spike? |

Each reviewer reads ONLY the diff + its specialization context.

### Finding Priority
- **P0**: Blocks merge, creates new bead
- **P1**: Creates tech-debt bead
- **P2**: Recorded in CLAUDE.md, non-blocking

### CLAUDE.md Auto-Update
```markdown
## Conventions (from compound)
- [date] Use approach B for X — validated in spike/<bead-id>

## Anti-Patterns
- [date] Do not use X for Y — causes Z [P0 finding]
```

### Optional Enhancement: CM Consolidation
If `cm` available:
- `cm reflect` — episodic → procedural distillation
- Anti-pattern learning: recurring bug class → auto-warning
- 90-day decay + 4× harmful weight

### Handoff Artifact
Updated CLAUDE.md, reviewed & merged code

---

## File Structure in Skills Repo

```
skills/forge/
├── SKILL.md                          # Core workflow (<500 lines)
├── references/
│   ├── phases.md                     # All phase details in one file
│   ├── adaptive-mode.md              # Task scale detection + skip logic
│   ├── tool-harness.md               # Tool detection, optional enhancements, future slots
│   └── recovery-protocol.md          # Context loss, build failure, stuck agent recovery
├── templates/
│   ├── claude-md.md                  # CLAUDE.md skeleton for new projects
│   ├── agents-md.md                  # AGENTS.md skeleton
│   ├── design-doc.md                 # Phase 1 output template
│   ├── spike-report.md               # Phase 3 output template
│   └── compound-review.md            # Phase 5 output template
└── scripts/
    └── convergence-check.py          # Review round convergence detection
```
