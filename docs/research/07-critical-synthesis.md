# Critical Synthesis: V3 Document Analysis & Recommendations for Our Custom Skill

**Date:** 2026-03-20
**Based on:** 6 deep-dive research reports (350+ pages), 53 academic papers, 7 framework primary sources

---

## Part 1: What V3 Gets Right (Keep These)

### 1.1 Phase Isolation with Strict Handoff Contracts
V3's strongest architectural decision is assigning each framework's mechanic to exactly one phase. This directly addresses the "phase confusion" problem that plagues hybrid approaches. Academic evidence supports this: HALO's hierarchical orchestration (Hou et al., 2025) shows 14.4% improvement when planning levels are clearly separated.

### 1.2 The Spike Phase (Phase 3) — Unique and High-Value
V3 correctly identifies that NO framework has a formal pre-implementation technical validation phase. This is genuinely novel. The Self-Planning Code Generation paper (Jiang et al., 2024) shows explicit planning improves pass@1 by up to 11.9% — but none of the frameworks formalize a "prove it works before writing production code" gate. Keep this as the crown jewel.

### 1.3 Fresh Context Per Sub-Agent
Both Superpowers and GSD converge on this independently. Academic evidence is overwhelming: Liu et al.'s "Lost in the Middle" (TACL 2023) shows U-shaped performance degradation, and LongFuncEval shows 7-91% degradation in tool-calling settings with long contexts. V3 correctly makes this a universal execution principle.

### 1.4 Compound Engineering's Pattern/Decision/Failure Taxonomy
This is the most precise knowledge capture framework. V3 rightly places it in Phase 5. Academic backing: Pink et al. (2025) identify episodic memory as "the missing piece" for long-term LLM agents. The compound step creates exactly this.

### 1.5 Ralph's Completion Promise as Structural Enforcement
V3 correctly identifies this as the only mechanism that makes "good enough" literally impossible at the infrastructure level. By March 2026, Claude Code absorbed Ralph's patterns as a native "Loop" feature — confirming it's a fundamental, not a framework preference.

---

## Part 2: What V3 Gets Wrong or Over-Complicates

### 2.1 CRITICAL: Over-Reliance on Flywheel CLI Tools as Hard Dependencies

**The Problem:** V3 treats Flywheel's entire 35-tool ecosystem as infrastructure that must be installed and running. This creates:
- A massive onboarding burden (ACFS installer takes 30 minutes on a VPS)
- Vendor lock-in to one developer's toolchain (@Dicklesworthstone)
- Ubuntu VPS dependency that conflicts with macOS-primary development
- 35 CLIs to learn, maintain, and keep updated

**The Research Finding:** Google DeepMind (2025) quantified this:
> Net Performance = (Individual Capability + Collaboration Benefits) − (Coordination Chaos + Communication Overhead + Tool Complexity)
> Error amplification factor of 17.2 in poorly-designed multi-agent systems.

**What to Do Instead:** Extract the *concepts* from Flywheel and implement them with minimal dependencies:
- **Beads concept** → Use structured markdown task files or simple JSON. We don't need the `br` Rust CLI. The THREE-FIELD structure (description/design/notes) is the insight, not the JSONL format.
- **bv graph routing concept** → Useful for large projects (20+ tasks). For most work, a simple dependency list in the task file suffices. If needed, use a Python script (100 lines) that computes topological order.
- **Agent Mail concept** → Claude Code's native `Task` tool already provides sub-agent isolation. File reservation can be a simple lockfile convention in the CLAUDE.md rules.
- **CASS concept** → Valuable for cross-session search, but it's a separate tool install. Make it optional, not required.
- **CM concept** → The THREE-LAYER memory (episodic/procedural/semantic) is the real insight. Implement it as a section structure in CLAUDE.md, not a separate CLI tool.

### 2.2 CRITICAL: Phase 0 "Foundation" Is Over-Engineered for Most Projects

**The Problem:** V3's Phase 0 requires: creating AGENTS.md, running `cm init --repo`, running `cass search`, creating `docs/references/`, creating CLAUDE.md skeleton, initializing Agent Mail. This is 6+ commands before any thinking happens.

**The Research Finding:** Superpowers' adaptive skip logic correctly determines scale first. GSD v2 works with just a PROJECT.md and a single hook. Compound Engineering works with just CLAUDE.md and skills files.

**What to Do Instead:** Make foundation minimal and self-bootstrapping:
- Only CLAUDE.md is required (acts as the living memory)
- Everything else is created lazily — AGENTS.md only when multi-agent is needed, docs/references/ only when unfamiliar tech is involved
- The skill itself should detect project state and initialize what's missing

### 2.3 IMPORTANT: The Spec-Document-Reviewer Loop Has Known Limitations

**The Research Finding:** Superpowers reduced the max review iterations from 5 to 3 in a March 16, 2026 commit ("Tone down review loops"). Why? The reviewer subagent shares the same LLM biases as the writer. Academic evidence from Property-Based Testing (He et al., 2025) shows the "cycle of self-deception" — AI-generated reviews share flaws with AI-generated specs.

**V3's Mistake:** V3 treats the spec-review loop as a reliable quality gate. It's better than nothing, but it's not a hard gate.

**What to Do Instead:**
- Keep the spec-review loop (it catches ~70% of issues)
- But add HUMAN APPROVAL as the actual gate (V3 mentions this but doesn't emphasize it enough)
- The review loop should produce a CHANGELOG of what it found/fixed so the human can quickly evaluate delta, not re-read the entire spec

### 2.4 IMPORTANT: BMAD's 30-Agent Roster Is Overkill

**The Research Finding:** BMAD has 30 agents across 6 modules. Most users only use 3-4 (Analyst, Scrum Master, Dev, QA). The persona system adds ~2,000 tokens per agent. For a solo developer or small team, the overhead doesn't justify the specialization.

**V3's Mistake:** V3 references BMAD's "Mary (Analyst)" and "Bob (Scrum Master)" by name, implying we need their full persona system.

**What to Do Instead:** Extract the TWO useful BMAD insights:
1. **Context embedding per task** (the story file is self-contained — don't reference, embed)
2. **Structured research commands** (TR/MR patterns are useful, but as simple prompts, not as persona-gated commands)

### 2.5 MODERATE: Wave Execution Assumes Multi-Agent, But Most Work Is Single-Agent

**The Research Finding:** GSD's wave model and Flywheel's NTM swarm both assume you'll run multiple Claude Code instances in parallel. In practice:
- Most tasks are 1-3 agents, not 25
- Claude Max plan ($200/mo) is required for meaningful parallel execution
- DeepMind's coordination overhead research suggests diminishing returns past 3-5 agents

**What to Do Instead:**
- Design for single-agent execution as the default path
- Wave parallel execution is an opt-in upgrade for large projects
- The core workflow must work perfectly with one agent in one Claude Code session

### 2.6 MODERATE: V3 Ignores Error Recovery and Context Compaction

**The Research Finding:** The #1 real-world failure mode cited across ALL communities is context compaction — when Claude Code hits context limits and loses information. Flywheel has a Post-Compact Reminder hook. GSD uses fresh 200K contexts to avoid it. Ralph uses bash loop restarts.

**V3's Gap:** No mention of what happens when context is lost mid-phase. This is a critical operational concern.

**What to Do Instead:** Every phase needs a "context recovery" protocol — what file(s) to re-read if context is compacted.

### 2.7 MINOR: The "Lie to Them" Polishing Technique Is Fragile

**The Research Finding:** The "claim there are 30 errors" technique from Flywheel works with current models but is adversarial prompting that could break with model updates. Convergence detection (similarity scoring between rounds) is the robust part; the deception prompt is not.

**What to Do Instead:** Use convergence-based iteration (run rounds, compare output similarity, stop when stable) without the deceptive framing. Frame it as: "Review exhaustively. Here are N dimensions to check: [list]. Previous review found these issues: [list]. What did the previous review miss?"

---

## Part 3: What V3 Is Missing Entirely

### 3.1 CRITICAL: No Error Handling / Recovery Protocol
What happens when:
- A spike fails (STOP gate) but the problem is critical to the project?
- An agent's code breaks the build for other agents?
- Context compaction happens mid-execution?
- The test suite is flaky?

V3's Phase 4 has DCG+SLB safety, but no recovery workflows.

### 3.2 CRITICAL: No Git Workflow Integration
V3 mentions atomic commits and spike branches but has no actual git workflow:
- When to branch? What naming convention?
- How to handle merge conflicts in multi-agent execution?
- When does code get merged to main?
- How does the compound review relate to PR review?

### 3.3 IMPORTANT: No Estimation or Time-Boxing
V3's adaptive skip logic uses task scale (tiny/small/medium/large) but has no mechanism for:
- Estimating how long a task will actually take
- Time-boxing spikes (critical — spikes can expand indefinitely)
- Detecting when you're 3x over estimate and should re-evaluate approach

### 3.4 IMPORTANT: No Testing Strategy
V3 mentions tests in the completion promise (Phase 4) but doesn't specify:
- What kind of tests? (unit, integration, e2e)
- When are tests written? (before, during, or after implementation)
- Academic evidence strongly favors Property-Based Testing (23-37% improvement) over traditional TDD

### 3.5 MODERATE: No Human Communication Protocol
When should the skill escalate to the human? V3 says "human reviews the written spec file" and "human decision required before continue" but doesn't define:
- What information the human needs to make a decision
- How to present options concisely
- When to STOP and wait vs. continue with best judgment

### 3.6 MODERATE: Adaptive Mode Is Under-Specified
The skip logic table is useful but needs more:
- How does the agent DETERMINE task scale? (V3 says "signal" but doesn't specify how to evaluate)
- Can scale change mid-execution? (a "small" task that discovers unknowns should escalate)
- What's the minimum viable workflow for each scale?

---

## Part 4: Architectural Recommendations for Our Custom Skill

### Principle 1: Tool-Agnostic by Default, Tool-Enhanced Optionally
The skill should work with ZERO external CLI tools installed. All concepts (beads, memory, review) should be implementable as structured markdown files and Claude Code native features. If Flywheel tools are available, the skill can use them — but they're never required.

### Principle 2: CLAUDE.md as the Single Source of Truth
Instead of AGENTS.md + CLAUDE.md + Agent Mail + CM + CASS as separate systems, make CLAUDE.md the single living document with structured sections:
```
## Project Memory (replaces CM)
### Validated Approaches (from spikes)
### Anti-Patterns (from compound review)
### Conventions (from compound review)

## Current State (replaces Agent Mail status)
### Active Tasks
### Locked Decisions (from discuss phase)

## Architecture (replaces separate docs)
### Key Decisions
### Tech Stack
```

### Principle 3: Progressive Complexity
The skill should have 3 modes:
- **Solo mode** (default): One agent, one session, CLAUDE.md as memory
- **Session mode**: One agent with sub-agents for review/validation
- **Swarm mode**: Multi-agent with full coordination (only for large projects)

### Principle 4: Every Phase Has a Recovery Protocol
For each phase, define:
- What to re-read if context is compacted
- How to resume from the last handoff artifact
- Maximum time/iterations before escalating to human

### Principle 5: The Skill is the Workflow, Not the Tools
The skill describes what to DO, not what tools to USE. If the user has bv installed, great — use it for graph routing. If not, use dependency ordering in the task file. The workflow logic is identical either way.

---

## Part 5: Proposed Skill Structure

```
custom-coding-agent/
├── SKILL.md                        # Core workflow instructions (main file, <500 lines)
├── references/
│   ├── phase-brainstorm.md         # Detailed brainstorm mechanics
│   ├── phase-breakdown.md          # Detailed breakdown mechanics
│   ├── phase-spike.md              # Detailed spike mechanics
│   ├── phase-execute.md            # Detailed execution mechanics
│   ├── phase-compound.md           # Detailed compound review mechanics
│   ├── adaptive-mode.md            # Task scale detection and skip logic
│   ├── memory-protocol.md          # CLAUDE.md structure and update rules
│   ├── recovery-protocol.md        # Context loss, build failure, stuck agent recovery
│   └── git-workflow.md             # Branch naming, commit, merge, PR conventions
├── templates/
│   ├── claude-md-template.md       # CLAUDE.md skeleton for new projects
│   ├── design-doc-template.md      # Phase 1 output template
│   ├── task-file-template.md       # Phase 2 output template (replaces beads)
│   ├── spike-report-template.md    # Phase 3 output template
│   └── compound-review-template.md # Phase 5 output template
└── scripts/
    ├── task-order.py               # Simple topological sort (replaces bv for non-Flywheel users)
    └── convergence-check.py        # Review round convergence detection
```

### Why This Structure:
- SKILL.md stays under 500 lines (agentskills.io spec requirement)
- Detailed phase instructions are in references/ (loaded on-demand, not upfront)
- Templates ensure consistent artifact structure
- Scripts are optional utilities, not required dependencies

---

## Part 6: Key Design Decisions to Resolve

Before building, we need to decide:

1. **Flywheel tools: required, optional, or excluded?**
   - My recommendation: Optional enhancement. The skill works without them.

2. **Memory system: CM CLI vs. structured CLAUDE.md sections?**
   - My recommendation: CLAUDE.md sections as default. CM as optional enhancement.

3. **Task format: Beads (JSONL) vs. structured markdown files?**
   - My recommendation: Structured markdown. Lower barrier, readable by humans, no CLI dependency.

4. **Multi-agent coordination: Agent Mail vs. native Claude Code sub-agents?**
   - My recommendation: Native sub-agents as default. Agent Mail for swarm mode.

5. **Review system: Compound Engineering's 14 agents vs. a smaller focused set?**
   - My recommendation: 4-5 focused reviewers (security, performance, architecture, YAGNI, spike-alignment). 14 is overkill for solo/small team.

6. **Target platform: Claude Code only, or multi-provider?**
   - My recommendation: Claude Code primary (it has sub-agents, hooks, Task tool). Other providers supported but with reduced capability.

7. **Skill format: Single SKILL.md or bundled directory?**
   - My recommendation: Bundled directory (given the templates and references needed).
