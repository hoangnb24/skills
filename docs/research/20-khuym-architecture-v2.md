# Khuym Skill Ecosystem: Architecture v2

**Version:** 2.0-draft  
**Date:** 2026-03-20  
**Correction:** v1 abstracted away from the Flywheel workflow and diluted GSD's validate-first approach. v2 aligns with both.

---

## What v1 Got Wrong

1. **Planning/Orchestrating/Executing were generic abstractions.** The existing skills were designed around Flywheel's actual 8-phase workflow (Plan → Beads → Polishing → Swarm → Tend → Review). I renamed them to generic terms and lost the Flywheel mechanics.

2. **GSD's "validate before jumping" got diluted.** The entire point of GSD is: Discuss → Research → Plan → **Verify Plan** → Execute. The plan-checker loop (max 3 iterations, 8-dimension validation) and the spike verification step are critical safety nets. My v1 treated them as minor additions instead of structural gates.

3. **The Flywheel's multi-model competition and iterative refinement disappeared.** Phases 2-3 of the Flywheel (multi-model competition, 4-5+ refinement rounds) are a unique strength — different frontier models catch different architectural issues. v1 didn't include this.

4. **Bead polishing (4-6+ rounds) was absent.** The Flywheel explicitly prescribes 4-6+ polishing rounds with fresh eyes, deduplication checks, and cross-model review. This is where bead quality comes from.

---

## The Actual Flywheel Workflow (Source of Truth)

From [agent-flywheel.com/complete-guide](https://agent-flywheel.com/complete-guide):

```
Phase 1: Write Initial Plan (messy stream of thought → GPT Pro → comprehensive markdown)
Phase 2: Multi-Model Competition (Opus + Gemini + Grok independently → synthesis)
Phase 3: Iterative Refinement (4-5+ rounds, fresh conversations, "lie to them" technique)
Phase 4: Plan → Beads Conversion (br create, never pseudo-beads)
Phase 5: Bead Polishing (4-6+ rounds, bv checks, deduplication, fresh eyes)
Phase 6: Launch the Swarm (ntm spawn, Agent Mail registration, bv --robot-priority loop)
Phase 7: Tend the Swarm (human oversight, rescue stuck agents, broadcast corrections)
Phase 8: Review, Test, Harden (self-review, peer review, UBS scan, test coverage)
```

## The GSD Workflow (Validate-First Source of Truth)

From [GSD's core philosophy](https://github.com/gsd-build/get-shit-done):

```
Discuss → Research → Plan → VERIFY PLAN → Execute → VERIFY WORK
                              ↑                       ↑
                     plan-checker loop          goal-backward check
                     (max 3 iterations)         + human UAT
                     8-dimension validation
```

GSD's key insight: **"Plans are not executed until they pass verification."** This prevents wasted work on broken plans.

---

## v2 Redesign: Skills Aligned to ACTUAL Workflows

### The 9 Skills (revised)

| # | Skill | Aligned To | What It Actually Does |
|---|---|---|---|
| 1 | `using-khuym` | Meta/Bootstrap | Lists skills, priority rules, go mode, red flags |
| 2 | `exploring` | GSD discuss-phase + Superpowers brainstorming | Gray area identification, Socratic Q&A, CONTEXT.md — **decisions before research** |
| 3 | `planning` | Flywheel Phase 1-3 + GSD research+plan | Discovery (gkg, parallel agents), synthesis (oracle), approach + risk map, multi-perspective refinement |
| 4 | `validating` | GSD plan-checker + Flywheel bead polishing + V3 spike phase | **The gate.** Plan verification (3 iterations), spike execution for HIGH risk, bead polishing (multiple rounds), bv validation. Nothing executes until this passes. |
| 5 | `swarming` | Flywheel Phase 6-7 (launch + tend) | Bead-to-agent assignment via bv --robot-plan, Agent Mail setup, spawn parallel workers (Task tool), wave execution, monitor, handle blockers, tend the swarm |
| 6 | `executing` | Flywheel per-agent loop | Single worker: register → bv --robot-priority → reserve files → implement bead → bd close → report → loop |
| 7 | `reviewing` | Flywheel Phase 8 + CE review + GSD verify-work | 4-5 review agents, 3-level artifact verification, P1/P2/P3 findings, human UAT gate |
| 8 | `compounding` | CE compound loop + Flywheel CASS/CM feedback | Capture learnings (patterns/decisions/failures) → history/learnings/, critical-patterns.md, optional CASS indexing |
| 9 | `writing-khuym-skills` | Superpowers writing-skills | TDD-for-skills, persuasion psychology, CREATION-LOG |

### Why This Is Different from v1

**`validating` is now a full skill, not a sub-step.** This is the GSD lesson: the plan-checker + spike execution + bead polishing step deserves its own skill because:
- It has its own process (3-iteration verification loop)
- It has its own agents (plan-checker, spike executors)
- It has its own output (validated beads, spike learnings embedded in beads)
- Skipping it is the #1 cause of wasted work
- GSD's entire "discuss first, plan second, execute third" philosophy demands that execution CANNOT start until validation passes

**`swarming` replaces `orchestrating`.** The Flywheel's swarm model isn't generic "orchestration" — it's a specific pattern: bv computes tracks → Agent Mail coordinates → workers execute in parallel waves → human tends the swarm. The name `swarming` captures this.

**`exploring` replaces `brainstorming`.** GSD calls it "discuss" because the point is to explore gray areas and lock decisions BEFORE research/planning. "Brainstorming" suggests creative ideation. "Exploring" is closer to GSD's intent: systematic extraction of decisions.

**`finishing` was removed.** Its responsibilities (PR, cleanup, bead close) are small enough to be the final step of `reviewing`. No need for a separate skill — keeps us at 9.

---

## 3. Detailed Skill Specifications

### 3.1 using-khuym

Same as v1. Bootstrap meta-skill. Lists all skills, priority rules, red flags, go mode.

**Go mode gates (revised):**
```
GATE 1: After exploring → "Approve decisions/CONTEXT.md?"
GATE 2: After validating → "Beads verified. Approve execution?" 
GATE 3: After reviewing → "P1 findings. Fix before merge?"
```

Only 3 gates. Validating is the most important one — it's the "don't jump off the wall without checking" gate.

### 3.2 exploring (NEW — replaces brainstorming)

**Source:** GSD `discuss-phase` (primary) + Superpowers `brainstorming` + CE `ce:brainstorm`

**Core GSD lesson:** "Spend 5-10 minutes in the discussion phase. It saves hours of back-and-forth."

**Process:**
```
Phase 0: Scope Assessment
  → Quick/standard/deep based on request complexity
  → Read history/learnings/critical-patterns.md if exists

Phase 1: Domain Classification (GSD's approach)
  → Classify what's being built: SEE (visual) / CALL (API) / RUN (execution) / READ (content) / ORGANIZE (structure)
  → Each type has specific gray area probes

Phase 2: Gray Area Identification
  → For each domain type, identify 2-4 gray areas
  → Gray areas = decisions that affect implementation but aren't specified
  → Scout codebase briefly for existing patterns (grep, not deep analysis)

Phase 3: Socratic Exploration
  → One question at a time (academic evidence: Elicitron 2024)
  → 3-4 questions per gray area
  → HARD-GATE: wait for user response before next question
  → Lock each decision with user confirmation → assign stable IDs (D1, D2...)

Phase 4: Context Assembly
  → Write history/<feature>/CONTEXT.md
  → Sections: Locked Decisions, Open Questions, Code Context (existing patterns)
  → Self-review via subagent (max 2 iterations)

Phase 5: Handoff
  → "Decisions captured. Invoke planning skill to research and plan."
  → Explicitly state: "CONTEXT.md is now the single source of truth for downstream agents"
```

**Output:** `history/<feature>/CONTEXT.md`

**What this skill does NOT do:**
- Does NOT research external patterns (that's planning's job — GSD lesson: research reads CONTEXT.md)
- Does NOT analyze codebase deeply (only quick grep for existing patterns)
- Does NOT write code, pseudocode, or suggest implementations
- Does NOT create beads (that's planning → validating's job)

### 3.3 planning

**Source:** Existing `planning` skill + Flywheel Phases 1-3 + GSD research+plan + CE learnings-researcher

**What changed from existing:** Now explicitly reads CONTEXT.md from exploring. Multi-perspective synthesis added from Flywheel.

**Process:**
```
Phase 0: Learnings Retrieval (from CE compound loop)
  → Read history/learnings/critical-patterns.md (always)
  → grep history/learnings/ by tags matching feature domain
  → Include relevant learnings in discovery context

Phase 1: Discovery (Parallel Exploration — existing, unchanged)
  → Task() → Agent A: Architecture snapshot (gkg repo_map)
  → Task() → Agent B: Pattern search (find similar existing code)
  → Task() → Agent C: Constraints (package.json, deps)
  → Librarian/exa → External patterns
  → Output: history/<feature>/discovery.md

Phase 2: Synthesis (Oracle — existing, unchanged)
  → Feed discovery + CONTEXT.md to Oracle
  → Output: Approach + Risk Map
  → CRITICAL: Risk classification → LOW/MEDIUM/HIGH
  → Output: history/<feature>/approach.md

Phase 3: Multi-Perspective Refinement (from Flywheel Phases 2-3)
  → For HIGH-stakes features: request second opinion from different model/perspective
  → "What did this approach miss? What are the blind spots?"
  → Iterate approach document (1-2 rounds, not 4-5 — we're not doing Flywheel's extreme refinement)

Phase 4: Decomposition (Beads — existing, unchanged)
  → Load file-beads skill → bd create
  → Embed spike learnings in bead descriptions (if applicable)
  → Embed approach decisions in bead context fields

Phase 5: Track Planning
  → bv --robot-plan → execution-plan.md
  → Assign file scopes, agent names
  → Output: history/<feature>/execution-plan.md

Handoff: "Plan created with N beads in M tracks. Invoke validating skill before execution."
```

**Output artifacts:**
- `history/<feature>/discovery.md`
- `history/<feature>/approach.md`
- `.beads/*.md` (bead files)
- `history/<feature>/execution-plan.md`

### 3.4 validating (NEW — the critical gate)

**Source:** GSD plan-checker (primary) + Flywheel bead polishing + V3 spike phase + GSD verify-work's "goal-backward" principle

**Why this skill exists:** GSD's core insight is that plans are not executed until they pass verification. The Flywheel prescribes 4-6+ polishing rounds. V3's spike phase validates HIGH-risk items before full implementation. Without this skill, you're "jumping off the huge wall without checking."

**Process:**
```
Phase 1: Plan Verification (from GSD plan-checker, max 3 iterations)
  → Spawn plan-checker subagent with:
    - All .beads/*.md for this epic
    - CONTEXT.md (locked decisions must be honored)
    - discovery.md + approach.md
  → Verify across 8 dimensions (from GSD):
    1. Requirement coverage — does every CONTEXT.md decision map to a bead?
    2. Dependency correctness — are bead dependencies valid? No cycles?
    3. File scope isolation — do parallel tracks have overlapping file scopes?
    4. Context budget — is each bead completable in a single agent context?
    5. Test coverage — does every bead have verification criteria?
    6. Gap detection — any requirements not covered by any bead?
    7. Risk alignment — HIGH-risk items from approach.md have spikes?
    8. Completeness — would completing all beads deliver the feature?
  → If issues found → fix beads → re-verify (max 3 iterations)
  → If still failing after 3 → ask user for guidance

Phase 2: Spike Execution (for HIGH-risk items — from V3 synthesis)
  → For each HIGH-risk component identified in approach.md:
    → Create spike bead: bd create "Spike: <question>" -t task -p 0
    → Execute spike in isolated context (Task tool, time-boxed 30 min)
    → Spike writes to .spikes/<feature>/<spike-id>/
    → Close with finding: bd close <id> --reason "YES: <approach>" or "NO: <blocker>"
  → If spike fails → STOP. Revise approach, go back to planning
  → If spike succeeds → embed learnings in affected beads

Phase 3: Bead Polishing (from Flywheel Phase 5)
  → Round 1: bv --robot-suggest (find missing dependencies)
  → Round 2: bv --robot-insights (detect cycles, bottlenecks)
  → Round 3: bv --robot-priority (validate priorities)
  → If issues found → fix → re-run (up to 3 rounds)
  → Deduplication check: are any beads redundant?
  → Fresh-eyes review: dispatch subagent to read all beads and flag unclear ones

Phase 4: Final Approval Gate
  → Present to user:
    - Number of beads, number of tracks
    - Risk assessment (how many HIGH items, spike results)
    - Estimated execution scope
    - Any unresolved concerns
  → "Beads validated. Approve for execution?"
  → If user approves → handoff to swarming
  → If user rejects → identify concerns → loop back to relevant phase

Handoff: "Validation complete. All checks pass. Invoke swarming skill."
```

**What this skill prevents:**
- Executing broken plans (plan-checker catches structural issues)
- Hitting HIGH-risk blockers mid-execution (spikes catch them early)
- Redundant/duplicate work (bead polishing + dedup)
- Broken dependency graphs (bv validation)
- "Good enough" plans that skip verification (this IS the verification)

**File structure:**
```
skills/validating/
├── SKILL.md
└── references/
    ├── plan-checker-prompt.md    ← 8-dimension verification subagent
    └── bead-reviewer-prompt.md   ← Fresh-eyes review subagent
```

### 3.5 swarming (replaces orchestrating)

**Source:** Flywheel Phase 6-7 (Launch + Tend) + existing `orchestrator` skill + GSD wave execution

**Why "swarming":** The Flywheel's execution model is specifically a swarm — multiple agents working simultaneously on different tracks, coordinated via Agent Mail, with human tending. This isn't generic orchestration.

**Process:**
```
Phase 1: Read Execution Plan
  → Read history/<feature>/execution-plan.md
  → Extract: EPIC_ID, TRACKS, CROSS_DEPS

Phase 2: Initialize Agent Mail (existing, unchanged)
  → ensure_project → register_agent as Orchestrator
  → Create epic thread

Phase 3: Compute Waves (from GSD)
  → Analyze bead dependencies across tracks
  → Group into waves: independent beads → Wave 1, dependent → Wave 2+
  → "When we execute beads, open multiple claude code sessions or one to take down the bead" (user's stated preference)

Phase 4: Spawn Workers (existing, refined)
  → For each track in current wave:
    → Task tool: spawn worker with executing skill loaded
    → Provide: track beads, file scope, epic thread, Agent Mail identity
  → All workers in same wave spawn simultaneously (parallel)

Phase 5: Monitor + Tend (from Flywheel Phase 7)
  → Poll Agent Mail for:
    - Bead completion reports
    - Blocker alerts
    - File conflict requests
  → Handle cross-track issues:
    - File conflicts → coordinate release/re-reservation
    - Blockers → provide context or escalate to user
  → Update .khuym/STATE.md after each wave
  → Context checkpoint: if context >65%, write HANDOFF.json and suggest pause

Phase 6: Wave Transition
  → When all workers in current wave complete:
    → Run post-wave verification (build still compiles? tests still pass?)
    → Start next wave
  → Repeat until all waves complete

Phase 7: Swarm Complete
  → Verify all beads closed: bv --robot-triage --graph-root <epic-id>
  → "All tracks complete. Invoke reviewing skill."

Handoff: "Swarm execution complete. N beads implemented across M waves. Invoke reviewing skill."
```

**File structure:**
```
skills/swarming/
├── SKILL.md
└── references/
    ├── worker-template.md        ← Template for spawning worker subagents
    └── message-templates.md      ← Agent Mail message formats
```

### 3.6 executing (worker — largely unchanged)

**Source:** Existing `worker` skill + Flywheel per-agent loop

**The Flywheel loop is already in the existing worker skill:**
```
1. Register agent (Agent Mail)
2. Get next bead (bv --robot-priority or from track assignment)
3. Reserve files
4. Read bead → implement
5. bd close → report via Agent Mail
6. Release reservations
7. Loop to next bead
```

**Refinements:**
- Context checkpoint: after each bead, if context >65%, write handoff and complete gracefully
- Atomic git commit per bead: `git commit -m "feat(<bead-id>): <summary>"`
- Explicit "re-read AGENTS.md" after any context compaction (from Flywheel Post-Compact Reminder)

### 3.7 reviewing (includes finishing responsibilities)

**Source:** CE review + GSD verify-work + Flywheel Phase 8 + Superpowers code review

**Process:**
```
Phase 1: Automated Review (5 parallel agents)
  → Agent 1: code-quality (simplicity, readability, DRY)
  → Agent 2: architecture (patterns, coupling, API design)
  → Agent 3: security (OWASP, injection, auth, data exposure)
  → Agent 4: test-coverage (missing tests, edge cases)
  → Agent 5: learnings-synthesizer (always last — cross-reference past learnings, suggest compounding entries)
  → Each agent gets: diff + CONTEXT.md + execution-plan.md (isolated context)
  → Collect findings → prioritize P1/P2/P3

Phase 2: 3-Level Artifact Verification (from GSD gsd-verifier)
  → Level 1: Artifact EXISTS (file created)
  → Level 2: Artifact is SUBSTANTIVE (not stub/placeholder)
  → Level 3: Artifact is WIRED (imported, used, integrated)

Phase 3: Human UAT (from GSD verify-work)
  → Extract testable deliverables from CONTEXT.md
  → Walk user through each: "Does X work as decided?"
  → If failure → create fix bead → execute fix → re-verify

Phase 4: Finishing (absorbed from v1's finishing skill)
  → Verify all beads closed
  → Run final build/test/lint
  → Present options: create PR / merge / keep branch / discard
  → Clean up worktree if used
  → Close epic: bd close <epic-id>
  → Clear .khuym/STATE.md

Handoff: "Feature complete. Invoke compounding skill to capture learnings."
```

### 3.8 compounding (unchanged from v1)

Same design. Three subagents → `history/learnings/YYYYMMDD-<slug>.md`. Three categories: patterns/decisions/failures. Promote critical items to `critical-patterns.md`. Optional CASS integration.

### 3.9 writing-khuym-skills (unchanged from v1)

Same design. TDD-for-skills methodology from Superpowers. Pressure tests, persuasion psychology, CREATION-LOG template.

---

## 4. Chaining Map (Revised)

### Full Chain

```
USER: "Build feature X"
│
├── using-khuym → determines: this needs exploring
│
▼
exploring                          ← "What exactly do you want?"
│ Output: CONTEXT.md               ← Locked decisions + open questions
│ Handoff: "Invoke planning"
▼
planning                           ← "How should we build it?"
│ Reads: CONTEXT.md + learnings/   ← Research GUIDED by decisions
│ Output: approach.md + .beads/    ← Beads with risk levels
│ Handoff: "Invoke validating"
▼
validating                         ← "Is this plan actually sound?" ★ THE GATE ★
│ Plan-checker loop (max 3×)       ← 8-dimension verification
│ Spike execution (HIGH risk)      ← Prove it works BEFORE committing
│ Bead polishing (multiple rounds) ← bv validation, dedup, fresh eyes
│ GATE: "Approve for execution?"
▼
swarming                           ← "Launch the agents"
│ Wave computation                 ← Dependency-aware parallel execution
│ Spawn workers (Task tool)        ← Each worker loads executing skill
│ Monitor via Agent Mail           ← Tend the swarm
├── executing (×N parallel)        ← Per-bead implementation loop
│   └── bd → implement → close → report → next bead
│
▼
reviewing                          ← "Did we build it right?"
│ 5 review agents                  ← Parallel quality check
│ 3-level artifact verification    ← Exists → Substantive → Wired
│ Human UAT                        ← User walks through features
│ Finishing (PR, cleanup)          ← Close epic, clean worktree
▼
compounding                        ← "What did we learn?"
│ 3 analysis subagents             ← Pattern/Decision/Failure capture
│ history/learnings/               ← Knowledge for future planning
│ DONE
```

### Quick Fix Chain

```
USER: "Quick fix: update timeout"
│
├── using-khuym → quick mode: skip exploring
▼
planning (lightweight)
│ Single bead, no tracks
▼
validating (lightweight)
│ Skip plan-checker loop (single bead)
│ Skip spikes (LOW risk)
│ Quick bv check only
▼
swarming → executing (single worker)
▼
reviewing (optional)
▼
compounding (if lesson learned)
```

### The "Validate-First" Principle Throughout

```
exploring: validates that we understand WHAT the user wants (decision validation)
planning:  validates approach against codebase reality (technical validation)
validating: validates that the PLAN is sound before executing (execution readiness validation)
reviewing:  validates that the WORK is correct after executing (quality validation)
compounding: validates that learnings are captured (knowledge validation)
```

Every phase validates something different. But `validating` is the critical gate — it's where you "check before jumping off the wall."

---

## 5. What We Took From Each (Revised)

| Pattern | Source | Where in Khuym |
|---|---|---|
| "Discuss first, plan second, execute third" | GSD (core philosophy) | exploring → planning → validating → swarming chain |
| Gray area identification (SEE/CALL/RUN/READ/ORGANIZE) | GSD discuss-phase | exploring Phase 1 |
| CONTEXT.md as single source of truth for downstream agents | GSD | exploring output, read by all subsequent skills |
| Plan-checker verification loop (max 3×, 8 dimensions) | GSD plan-checker | validating Phase 1 |
| "Plans are not executed until they pass verification" | GSD (core principle) | validating is a GATE skill |
| Goal-backward artifact verification (3 levels) | GSD gsd-verifier | reviewing Phase 2 |
| Human UAT with debug agents on failure | GSD verify-work | reviewing Phase 3 |
| STATE.md as working memory | GSD | .khuym/STATE.md |
| HANDOFF.json for session continuity | GSD continue-here.md | .khuym/HANDOFF.json |
| Wave-based parallel execution | GSD execute-phase | swarming Phase 3-6 |
| Multi-model competition / multi-perspective refinement | Flywheel Phases 2-3 | planning Phase 3 |
| Bead polishing (multiple rounds, fresh eyes, dedup) | Flywheel Phase 5 | validating Phase 3 |
| Swarm launch + tend pattern | Flywheel Phases 6-7 | swarming skill |
| Per-agent loop: register → priority → reserve → implement → close → loop | Flywheel per-agent protocol | executing skill |
| "Re-read AGENTS.md" after compaction | Flywheel Post-Compact Reminder | executing skill |
| Review, test, harden | Flywheel Phase 8 | reviewing skill |
| 4-5 parallel review agents with P1/P2/P3 | Compound Engineering ce:review | reviewing Phase 1 |
| /lfg full-auto pipeline | Compound Engineering | go mode in using-khuym |
| Compound knowledge loop (learnings-researcher → docs/solutions/) | Compound Engineering | compounding + planning Phase 0 |
| Three-category taxonomy (patterns/decisions/failures) | Compound Engineering | compounding skill |
| Spike execution for HIGH-risk validation | V3 synthesis (crown jewel) | validating Phase 2 |
| Socratic one-question-at-a-time with HARD-GATE | Superpowers brainstorming | exploring Phase 3 |
| Spec-document-reviewer subagent | Superpowers brainstorming | exploring Phase 4 |
| Flat namespace, skills as prompt expansions | Superpowers | All skills at one level |
| TDD-for-skills (RED-GREEN-REFACTOR) | Superpowers writing-skills | writing-khuym-skills |
| Persuasion psychology in skill text | Superpowers persuasion-principles | All skills |
| Beads + bv + Agent Mail as core infrastructure | Flywheel (existing system) | Unchanged, everything builds on these |
| gkg for codebase intelligence | User's existing setup | Separate support skill |

---

## 6. File Structure (unchanged from v1 except renaming)

```
skills/
├── using-khuym/
├── exploring/
├── planning/
├── validating/          ← NEW: the critical gate skill
├── swarming/            ← Renamed from orchestrating
├── executing/
├── reviewing/           ← Now includes finishing responsibilities
├── compounding/
├── writing-khuym-skills/
├── debugging/           ← Support skill
└── gkg/                 ← Support skill
```

### Project runtime files (unchanged)

```
project-root/
├── .khuym/
│   ├── STATE.md
│   ├── config.json
│   └── HANDOFF.json
├── .beads/
├── .spikes/
├── history/
│   ├── <feature>/
│   │   ├── CONTEXT.md
│   │   ├── discovery.md
│   │   ├── approach.md
│   │   └── execution-plan.md
│   └── learnings/
│       ├── critical-patterns.md
│       └── YYYYMMDD-<slug>.md
└── .worktrees/
```

---

## 7. Build Plan (Beads for Building Khuym)

```
Wave 1 (independent, parallel):
  - using-khuym (bootstrap, references other skills by name)
  - exploring (standalone, produces CONTEXT.md)
  - executing (standalone worker loop)
  - debugging (standalone support)
  - gkg (standalone support)

Wave 2 (depends on Wave 1 patterns):
  - planning (reads CONTEXT.md from exploring, uses gkg)
  - compounding (standalone but needs learnings format defined)
  - writing-khuym-skills (needs skill patterns from Wave 1 as examples)

Wave 3 (depends on Wave 2):
  - validating (reads beads from planning, uses plan-checker pattern)
  - reviewing (reads execution results, review agent prompts)
  - swarming (references executing skill in worker template, reads execution-plan from planning)
```
