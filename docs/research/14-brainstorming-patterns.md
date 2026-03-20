# Brainstorming Patterns: Comparative Analysis & Recommended Hybrid Approach

**Compiled:** 2026-03-20  
**Purpose:** Design a `brainstorming` skill for our skill ecosystem  
**Sources:** Primary source code analysis + academic literature review

---

## Table of Contents

1. [Primary Source Analysis](#1-primary-source-analysis)
2. [Side-by-Side Comparison](#2-side-by-side-comparison)
3. [What Each Does Best](#3-what-each-does-best)
4. [Academic Evidence](#4-academic-evidence)
5. [Recommended Hybrid Approach](#5-recommended-hybrid-approach)
6. [Exact Process Steps to Adopt](#6-exact-process-steps-to-adopt)
7. [Psychological Compliance Mechanisms](#7-psychological-compliance-mechanisms)

---

## 1. Primary Source Analysis

### 1.1 Superpowers Brainstorming Skill

**Source:** `https://raw.githubusercontent.com/obra/superpowers/main/skills/brainstorming/SKILL.md`  
**Also studied:** `spec-document-reviewer-prompt.md`, `visual-companion.md`

#### Core Purpose
"Help turn ideas into fully formed designs and specs through natural collaborative dialogue."

The Superpowers skill sits at the most sophisticated end of the brainstorming spectrum. It is explicitly positioned as a **gate** before any implementation work, enforced by a hard constraint:

> `<HARD-GATE>` Do NOT invoke any implementation skill, write any code, scaffold any project, or take any implementation action until you have presented a design and the user has approved it.

#### Step-by-Step Process

The SKILL.md specifies a **9-step ordered checklist** that MUST be executed as tasks:

| Step | Action | Notes |
|------|--------|-------|
| 1 | Explore project context | Files, docs, recent commits |
| 2 | Offer visual companion | Only if topic has visual questions. Own message, no other content combined |
| 3 | Ask clarifying questions | One at a time; understand purpose/constraints/success criteria |
| 4 | Propose 2-3 approaches | With trade-offs and explicit recommendation |
| 5 | Present design | Sections scaled to complexity; get user approval after EACH section |
| 6 | Write design doc | Save to `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`, commit |
| 7 | Spec review loop | Dispatch spec-document-reviewer subagent; fix issues; re-dispatch until approved (max 3 iterations) |
| 8 | User reviews written spec | Ask user to review before proceeding |
| 9 | Transition to implementation | Invoke writing-plans skill ONLY |

#### How the Socratic Q&A Works

The Superpowers approach follows strict question discipline:

- **One question per message** — never bundled
- **Multiple choice preferred** — easier to answer than open-ended
- **Start with scope assessment** — if multi-system, decompose FIRST before any questions
- **Focus domains:** purpose, constraints, success criteria
- **No implementation questions** — those belong to the next skill (writing-plans)

The process is deliberately conversational ("natural collaborative dialogue") and non-prescriptive about which questions to ask, trusting the LLM to assess what matters for the specific project.

#### How It Produces a Design Spec

1. **Incremental presentation:** Design is shown section by section (architecture, components, data flow, error handling, testing), not as a monolithic document. Each section gets user approval before moving on.
2. **Scaled depth:** "Scale each section to its complexity: a few sentences if straightforward, up to 200-300 words if nuanced."
3. **YAGNI enforcement:** "Remove unnecessary features from all designs."
4. **Written artifact:** The approved design becomes a committed markdown file.

#### Spec-Document-Reviewer Subagent

This is a **dispatched subagent** (not a sequential step within the same context), created with a precisely crafted Task call. Key design principles:

```
What to Check:
- Completeness: TODOs, placeholders, "TBD", incomplete sections
- Consistency: Internal contradictions, conflicting requirements
- Clarity: Ambiguous requirements that could cause someone to build the wrong thing
- Scope: Focused enough for a single plan — not covering multiple independent subsystems
- YAGNI: Unrequested features, over-engineering

Calibration:
"Only flag issues that would cause real problems during implementation planning."
"Approve unless there are serious gaps that would lead to a flawed plan."
```

Output format: `Status: Approved | Issues Found`, then specific issues with section references and *why* they matter for planning.

The loop runs **maximum 3 iterations** before escalating to the human.

**Critical design note from source:** The spec reviewer is dispatched with "precisely crafted review context (never your session history)." This isolation prevents context pollution across subagent boundaries.

#### Visual Companion

A browser-based server that shows mockups and diagrams during brainstorming. The key design insight: **consent-first and per-question decision**. The companion is offered once; the agent then decides FOR EACH question whether visual or text treatment is better. The test: "would the user understand this better by seeing it than reading it?"

Visual: mockups, layouts, architecture diagrams, side-by-side design comparisons  
Terminal: requirements questions, conceptual choices, tradeoff lists, scope decisions

#### Persuasion Psychology Techniques

The Superpowers SKILL.md uses several specific techniques to ensure agent compliance:

1. **HARD-GATE naming** — Capitalizing `<HARD-GATE>` creates a psychological and syntactic barrier. Using XML-like delimiters signals this is a structural constraint, not a suggestion.

2. **Anti-Pattern section** — The `## Anti-Pattern: "This Is Too Simple To Need A Design"` section preemptively addresses the most common rationalization for skipping the process. It names the failure mode and rebuts it before the agent can invoke it.

3. **Universal coverage statement** — "Every project goes through this process. A todo list, a single-function utility, a config change — all of them." Eliminates all escape hatches by explicit enumeration.

4. **Ordered numbered checklist with task creation** — "You MUST create a task for each of these items and complete them in order." This maps the process to the agent's native task tracking, making compliance verifiable.

5. **Terminal state clarity** — "The terminal state is invoking writing-plans." Having exactly ONE valid exit point (not multiple) prevents the agent from reasoning its way to a different endpoint.

6. **Prohibition by enumeration** — "Do NOT invoke frontend-design, mcp-builder, or any other implementation skill." Listing specific forbidden paths is more effective than abstract prohibitions.

---

### 1.2 GSD Discuss-Phase

**Source:** `https://github.com/gsd-build/get-shit-done` — `workflows/discuss-phase.md`, `templates/context.md`, `commands/gsd/discuss-phase.md`

#### Core Purpose
"Extract implementation decisions that downstream agents need. Analyze the phase to identify gray areas, let the user choose what to discuss, then deep-dive each selected area until satisfied."

GSD's discuss-phase is the most **systematic** and **downstream-aware** of the three approaches. It is explicitly designed as a context-engineering step: its output (`CONTEXT.md`) is the primary input to two other agents (researcher and planner).

#### How It Identifies "Gray Areas"

The identify-gray-areas logic is domain-aware, not generic. The workflow explicitly:

1. **Reads the phase goal from ROADMAP.md** to establish the domain boundary
2. **Classifies the domain** by what kind of thing is being built:
   - Something users **SEE** → visual presentation, interactions, states
   - Something users **CALL** → interface contracts, responses, errors
   - Something users **RUN** → invocation, output, behavior modes
   - Something users **READ** → structure, tone, depth, flow
   - Something being **ORGANIZED** → criteria, grouping, handling exceptions
3. **Generates phase-specific gray areas** (not generic categories)

From the source:
```
Phase: "User authentication"
→ Session handling, Error responses, Multi-device policy, Recovery flow

Phase: "CLI for database backups"
→ Output format, Flag design, Progress reporting, Error recovery
```

The agent is also told to **carry forward prior context**: scan all prior `CONTEXT.md` files for decisions already made, and skip gray areas that were decided in prior phases.

#### How It Probes with Questions Per Area

The discuss-phase uses an explicit **4-questions-per-area** rhythm before checkpointing:

> "Ask 4 questions per area before checking: 'More questions about [area], or move to next? (Remaining: [list other unvisited areas])'"
> "If more → ask 4 more, check again"

Additional modes:
- `--batch` flag: groups 2-5 questions per turn (clamp 2-5)
- `--analyze` flag: presents trade-off analysis before each question with pros/cons table + recommended approach
- `--auto` flag: Claude picks the recommended option at each step, logs decisions, no user interaction

The questions are **code-informed**: the scout step reads the codebase and annotates options with existing components (e.g., "You already have a Card component — reusing it keeps the app consistent").

#### The CONTEXT.md Output Format

```markdown
# Phase [X]: [Name] - Context

<domain>
## Phase Boundary
[Clear statement of what this phase delivers — the scope anchor]
</domain>

<decisions>
## Implementation Decisions
### [Category emerged from discussion]
- [Specific concrete decision]
### Claude's Discretion
[Areas where user said "you decide"]
</decisions>

<specifics>
## Specific Ideas
[References, examples, "I want it like X" moments]
</specifics>

<canonical_refs>
## Canonical References
**Downstream agents MUST read these before planning or implementing.**
[Full relative paths to specs, ADRs, design docs grouped by topic]
</canonical_refs>

<code_context>
## Existing Code Insights
### Reusable Assets
### Established Patterns
### Integration Points
</code_context>

<deferred>
## Deferred Ideas
[Out-of-scope ideas captured to prevent loss]
</deferred>
```

Key design principle from the template: "Categories are NOT predefined. They emerge from what was actually discussed for THIS phase." The template enforces concrete decisions ("Card-based layout, not timeline") over vague preferences ("Should feel modern and clean").

#### How It Scouts the Codebase for Reusable Assets

The `scout_codebase` step (Step 4 in the workflow) is methodical:

**Step 1:** Check for existing codebase maps in `.planning/codebase/*.md` (CONVENTIONS.md, STRUCTURE.md, STACK.md). If found, read the relevant ones.

**Step 2:** If no maps exist, do targeted grep:
```bash
grep -rl "{term1}|{term2}" src/ app/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" | head -10
ls src/components/ src/hooks/ src/lib/ src/utils/
```
Read 3-5 most relevant files.

**Step 3:** Build internal `<codebase_context>` (never written to a file):
- Reusable assets (existing components/hooks/utilities)
- Established patterns (state management, styling, data fetching)
- Integration points (where new code connects)
- Creative options (what the architecture enables or constrains)

This context is then used to **annotate gray area options** presented to the user, making choices concrete and grounded in what already exists.

#### Scope Guardrail Mechanism

GSD has the tightest scope enforcement of all three frameworks:

```
CRITICAL: No scope creep. The phase boundary comes from ROADMAP.md and is FIXED.

Allowed: "How should posts be displayed?" (behavior within scoped feature)
Not allowed: "Should we also add comments?" (new capability)

When user suggests scope creep:
"[Feature X] would be a new capability — that's its own phase.
Want me to note it for the roadmap backlog?
For now, let's focus on [phase domain]."
```

Deferred ideas are tracked in the `<deferred>` section of CONTEXT.md to prevent idea loss while maintaining focus.

---

### 1.3 Compound Engineering ce:brainstorm

**Source:** `https://github.com/EveryInc/compound-engineering-plugin` — `plugins/compound-engineering/skills/ce-brainstorm/SKILL.md`

#### Core Purpose
"Explore requirements and approaches through collaborative dialogue before writing a right-sized requirements document and planning implementation."

The ce:brainstorm skill is the most **lightweight and adaptive** of the three. Its distinctive philosophy is explicit scope-matching: "Match the amount of ceremony to the size and ambiguity of the work." This produces three tiers of behavior (Lightweight, Standard, Deep) rather than a single universal process.

#### How It Does Lightweight Repo Research

**Phase 0 → 1.1 Existing Context Scan** uses a tiered approach:

**Lightweight scope:**
- Search for the topic
- Check if something similar already exists
- Move on

**Standard and Deep scope (two-pass):**

*Pass 1 — Constraint Check:*
- Check `AGENTS.md` and `CLAUDE.md` for workflow, product, or scope constraints that affect the brainstorm

*Pass 2 — Topic Scan:*
- Search for relevant terms
- Read the most relevant existing artifact (brainstorm, plan, spec, skill, feature doc)
- Skim adjacent examples covering similar behavior

**Anti-drift constraint:** "Do not drift into technical planning — avoid inspecting tests, migrations, deployment, or low-level architecture unless the brainstorm is itself about a technical decision."

The scan informs **Product Pressure Testing** (1.2) which asks whether this is the right problem to solve before generating approaches.

#### How It Asks Questions One at a Time

The `ce:brainstorm` skill has the most explicit and structured question discipline:

**Interaction Rules (hard constraints):**
1. Ask one question at a time — never batch unrelated questions
2. Prefer single-select multiple choice — for choosing one direction/priority/next step
3. Use multi-select *rarely* — only for compatible coexisting sets (goals, constraints, non-goals). If prioritization matters, ask which is primary in a follow-up.
4. Use platform's blocking question tool when available

**Dialogue flow (Phase 1.3):**
- Start broad (problem, users, value)
- Then narrow (constraints, exclusions, edge cases)
- Bring ideas, alternatives, and challenges — not just interviewing
- Exit condition: "Continue until the idea is clear OR the user explicitly wants to proceed"

#### Product Pressure Testing (Unique to CE)

Before generating approaches, ce:brainstorm uniquely **challenges the request**:

**Standard scope:**
- Is this the right problem, or a proxy for a more important one?
- What user or business outcome actually matters here?
- What happens if we do nothing?
- Is there a nearby framing that creates more user value without more carrying cost?
- Given the current project state, user goal, and constraints, what is the single highest-leverage move right now?

**Deep scope adds:**
- What durable capability should this create in 6-12 months?
- Does this move the product toward that, or is it only a local patch?

#### The Requirements Document Output

CE produces a **lightweight PRD** (called a requirements document). Key design principles:
- "Keep outputs concise — prefer short sections, brief bullets"
- "Do not include implementation details such as libraries, schemas, endpoints, file layouts, or code structure"
- Right-sized: simple work → compact doc or brief alignment; larger work → fuller document

**Document structure:**
```markdown
---
date: YYYY-MM-DD
topic: <kebab-case-topic>
---
# <Topic Title>

## Problem Frame
## Requirements (with stable IDs: R1, R2, R3)
## Success Criteria
## Scope Boundaries
## Key Decisions
## Dependencies / Assumptions (if material)
## Outstanding Questions
  ### Resolve Before Planning (true blockers)
  ### Deferred to Planning (technical/research questions)
## Next Steps
```

The `Resolve Before Planning` vs `Deferred to Planning` distinction is a key innovation: it separates product decisions (must resolve now) from technical questions (should resolve during planning with codebase context).

#### The ce:ideate Predecessor

CE introduces an additional upstream skill: `ce:ideate`, which answers "What are the strongest ideas worth exploring?" BEFORE brainstorming. Key innovations:

1. **Diverge before judging:** Generate full candidate list before evaluating any individual idea
2. **Adversarial filtering:** Explicit rejection with reasons, not optimistic ranking
3. **Agent diversity for idea generation:** 4-6 parallel sub-agents, each with different ideation frames, merging into 30-40 raw ideas
4. **Cross-cutting synthesis:** After dedup, orchestrator looks for combinations stronger than either idea alone

This creates the full chain: `ce:ideate` (what to explore) → `ce:brainstorm` (what to build) → `ce:plan` (how to build) → `ce:work` (execute).

---

## 2. Side-by-Side Comparison

| Dimension | Superpowers | GSD discuss-phase | CE ce:brainstorm |
|-----------|-------------|-------------------|-----------------|
| **Primary framing** | Creative design process | Context engineering for downstream agents | Product requirement definition |
| **Scope philosophy** | Decompose if too large | Phase boundary from roadmap is FIXED | Match ceremony to size (Lightweight/Standard/Deep) |
| **Codebase research** | Explore files/docs/commits | Systematic scout: maps → grep → 3-5 files | Tiered scan; constraint check + topic scan |
| **Question discipline** | One at a time, multiple choice preferred | 4 questions per area, then checkpoint | One at a time; single-select preferred |
| **Question focus** | Purpose, constraints, success criteria | Implementation decisions the user cares about | Problem frame, users, constraints, edge cases |
| **Question grounding** | Project context | Domain-aware + code-informed options | Product pressure testing before asking |
| **Gray area identification** | Agent decides based on project | Domain-aware systematic analysis (SEE/CALL/RUN/READ/ORGANIZE) | Scope assessment first; dialogue drives discovery |
| **Approaches offered** | 2-3 with trade-offs and recommendation | N/A (decisions capture, not approach generation) | 2-3 approaches; challenger option for higher upside |
| **Scope guardrail** | YAGNI + decompose if multi-system | Hard ROADMAP.md boundary, deferred ideas section | Scope Boundaries section in output doc |
| **Output artifact** | Design spec + committed markdown | CONTEXT.md with structured XML sections | Requirements doc in `docs/brainstorms/` |
| **Output consumers** | writing-plans skill | gsd-phase-researcher + gsd-planner | ce:plan |
| **Spec review** | Subagent reviewer (max 3 iterations) | None at this stage | Document-review skill optionally |
| **Visual support** | Yes — browser-based companion | No | No |
| **Prior context** | Reads project files | Reads ALL prior CONTEXT.md files | Checks `docs/brainstorms/` for resumable work |
| **Automation mode** | None | `--auto` flag (picks recommended defaults) | If requirements already clear, skip dialogue |
| **Persuasion tech** | HARD-GATE, anti-pattern section, terminal state | scope_guardrail XML section, explicit "not your job" | Right-sizing; pressure test before generating solutions |
| **Outstanding questions** | None (resolve before proceeding) | Deferred ideas section | `Resolve Before Planning` vs `Deferred to Planning` |
| **Next step trigger** | Only writing-plans (explicit prohibition) | Offer research-phase or plan-phase | Offer plan, direct-to-work (gated), refine, share, done |
| **Batch/speed modes** | None | `--batch`, `--analyze`, `--auto` flags | Scope assessment auto-routes to shorter path |

---

## 3. What Each Does Best

### Superpowers: Best at...

**Design-first gate enforcement.** The HARD-GATE mechanism plus anti-pattern preemption is the most effective "stop before coding" mechanism found. The combination of naming the escape hatch and categorically refusing it is psychologically superior to a soft guideline.

**Incremental design validation.** Presenting the design section-by-section with approval checkpoints prevents the common failure mode of investing 30 minutes in a design the user hates. The approach matches how experienced designers work in practice.

**Spec quality assurance.** The dispatched spec-document-reviewer subagent with explicit calibration ("Only flag issues that would cause real problems during implementation planning") and maximum iteration count is the only framework that treats the output artifact itself as requiring quality gates.

**Visual brainstorming.** The consent-based visual companion with per-question decision logic is uniquely effective for UI/UX work. No other framework addresses this dimension.

**Persuasion engineering.** The SKILL.md is the most studied in terms of compliance psychology: HARD-GATE naming, anti-pattern pre-rebuttal, universal coverage ("even a todo list"), ordered checklist with task creation, single terminal state, and prohibited-skills enumeration.

### GSD discuss-phase: Best at...

**Downstream awareness.** The entire design is organized around what consuming agents need. Every decision captures whether it's for the researcher (what to investigate) or the planner (what choices are locked). No other framework has this explicit orientation.

**Domain-aware gray area identification.** The SEE/CALL/RUN/READ/ORGANIZE classification is the most systematic approach to identifying what matters for a given phase. It generates concrete, phase-specific ambiguities rather than generic categories.

**Prior-context loading.** Reading all prior CONTEXT.md files before a discussion prevents re-asking decided questions and creates genuine continuity across phases. This is the only framework with explicit multi-phase memory management.

**Codebase-informed options.** Annotating question options with code context ("You already have a Card component with shadow/rounded variants") is uniquely concrete. Users make better decisions when options are grounded in what already exists.

**Structured output for multi-agent pipelines.** The XML-sectioned CONTEXT.md format with `<canonical_refs>` (mandatory full paths to specs/ADRs) is the cleanest structured handoff for downstream automation.

**Scope management at scale.** The ROADMAP.md as the immutable scope anchor, combined with explicit deferred-ideas tracking, is the most disciplined anti-scope-creep mechanism for multi-phase projects.

### CE ce:brainstorm: Best at...

**Right-sizing ceremony.** The Lightweight/Standard/Deep classification is the most practical approach for a skill that handles work ranging from tiny bug fixes to cross-cutting features. A 9-step checklist is overkill for a 5-line change.

**Product pressure testing.** Asking "what happens if we do nothing?" and "is there a nearby framing that creates more user value?" before generating solutions is the only pre-ideation validation of problem framing found in any of the three frameworks.

**Requirement ID stability.** Using stable IDs (`R1`, `R2`, `R3`) for requirements allows downstream plans and reviews to reference specific requirements unambiguously. This matters when work spans multiple sessions.

**`Resolve Before Planning` vs `Deferred to Planning` split.** This distinction is uniquely practical: it prevents the common failure of blocking planning on technical questions that are better answered during codebase exploration.

**Resumability.** Checking for recent matching documents and offering to continue vs. start fresh is the only explicit resumption mechanism.

**The ce:ideate upstream.** Diverge-then-converge ideation with adversarial filtering before entering requirements definition is the highest-fidelity approach to ensuring the right problem is being solved.

---

## 4. Academic Evidence

### 4.1 One-Question-at-a-Time Is Empirically Validated

[Elicitron: An LLM Agent-Based Simulation Framework (Ataei et al., 2024)](https://arxiv.org/abs/2404.16045) demonstrates that sequential, empathic user interviews identify a greater number of latent user needs than conventional human interviews. The "Action, Observation, Challenge" framework it introduces maps directly to the structured single-question approach all three frameworks use. The key finding: context-aware agent generation leads to greater diversity of identified needs — supporting GSD's codebase-context annotation of options.

[Getting Inspiration for Feature Elicitation (Wei et al., 2024)](https://dl.acm.org/doi/10.1145/3691620.3695591) shows LLM-based approaches for feature elicitation are "more powerful particularly concerning novel unseen app scopes" compared to app-store-based approaches, but some recommended features are "imaginary with unclear feasibility — which suggests the importance of a human-analyst in the elicitation loop." This validates CE's challenger option mechanism (offering higher-upside alternatives but not as the default) and the human approval gates in all three frameworks.

### 4.2 Structured Requirements Reduce Downstream Errors

[MARE: Multi-Agents Collaboration Framework for Requirements Engineering (Jin et al., 2024)](https://arxiv.org/abs/2405.03256) demonstrates that dividing Requirements Engineering into distinct tasks (elicitation, modeling, verification, specification) with specialized agents produces better results than monolithic RE. This validates GSD's downstream-awareness design and Superpowers' spec-reviewer subagent.

[Using LLMs in Software Requirements Specifications (Krishna et al., 2024)](https://arxiv.org/abs/2404.17842) empirically shows LLMs can reduce development time for SRS creation. Their finding that LLMs "can be gainfully used by software engineers to increase productivity by saving time and effort in generating, validating and rectifying software requirements" directly supports the rationale for automated spec review (Superpowers) and requirements quality checks.

### 4.3 Problem Framing Before Solution Generation

[AI Multiagent Approach for Requirements Elicitation (Sami et al., 2024)](https://arxiv.org/abs/2409.00038) implements a multi-agent system for requirements analysis showing that separating elicitation, analysis, and specification produces higher-quality artifacts than combined approaches. CE's Product Pressure Testing (asking "is this the right problem?") before generating approaches follows this separation.

[Combining Design Thinking and Software Requirements Engineering (Hehn & Mendez, 2021)](https://arxiv.org/abs/2112.05549) proposes three strategies for integrating Design Thinking with RE, emphasizing that user-centered problem framing before technical requirement specification produces better outcomes. CE's brainstorm-then-plan sequence mirrors this finding.

### 4.4 One-at-a-Time vs. Batched Question Strategies

[ChatGPT Prompt Patterns (White et al., 2023)](https://arxiv.org/abs/2303.07839) catalogs prompt patterns for requirements elicitation, including the "Persona" and "Question Refinement" patterns. The finding that structured, progressive questioning outperforms open-ended elicitation supports GSD's 4-questions-per-area discipline with explicit "more or next?" checkpoints.

[Research Directions for Using LLM in Software RE (Hemmat et al., 2025)](https://www.frontiersin.org/articles/10.3389/fcomp.2025.1519437/full) identifies "reducing ambiguities in requirement specifications" as the primary value LLMs bring to RE, supporting the emphasis all three frameworks place on specificity and concreteness in captured decisions over vague preferences.

### 4.5 Scope Management as Quality Lever

[Requirements are All You Need: The Final Frontier (Robinson et al., 2024)](https://arxiv.org/abs/2405.13708) argues that precise, complete requirements are the bottleneck in end-user software engineering — not execution. This validates GSD's core insight that the discuss-phase output quality directly determines plan quality. "Most plan quality issues come from Claude making assumptions that CONTEXT.md would have prevented."

[Prototyping with Prompts (Subramonyam et al., 2025)](https://arxiv.org/abs/2402.17721) finds that collaborative teams "establish and apply design guidelines, iteratively prototype prompts, and evaluate them to achieve specific outcomes" — validating the incremental section-by-section approval pattern in Superpowers and the checkpoint-based approach in GSD.

### 4.6 Adversarial Evaluation Improves Idea Quality

[Vibe Coding vs. Agentic Coding (Sapkota et al., 2025)](https://arxiv.org/abs/2505.19443) documents that "vibe systems thrive in early-stage prototyping" while "agentic systems excel in enterprise-grade automation," suggesting hybrid approaches (CE's scope-tiered ceremony) are optimal when both exploration and rigor are needed.

[Self-Evolving Multi-Agent Collaboration Networks for Software Development (Hu et al., 2024)](https://arxiv.org/abs/2410.16946) demonstrates that multi-agent approaches with feedback loops and textual backpropagation outperform single-agent approaches — directly supporting CE's parallel ideation with adversarial filtering (ce:ideate) and GSD's spec-reviewer loop.

---

## 5. Recommended Hybrid Approach

### Design Philosophy

The three frameworks represent complementary, not competing, philosophies:

- **Superpowers** = best process enforcement and output quality gates
- **GSD discuss-phase** = best systematic discovery and downstream-awareness
- **CE ce:brainstorm** = best adaptive scope-matching and problem framing

A hybrid should preserve the **non-negotiable strengths** of each:

1. From Superpowers: HARD-GATE, anti-pattern rebuttal, spec reviewer subagent, one-question-at-a-time, 2-3 approaches with recommendation
2. From GSD: Domain-aware gray area identification (SEE/CALL/RUN/READ/ORGANIZE), prior context loading, codebase scouting with annotated options, downstream-aware output format, scope guardrail with deferred-ideas capture
3. From CE: Scope-tiered ceremony (Lightweight/Standard/Deep), product pressure testing, `Resolve Before Planning` vs `Deferred to Planning` split, stable requirement IDs, resumability check

### What to Drop

- GSD's `AskUserQuestion` TUI dependency (design for text-based interaction)
- Superpowers' visual companion (optional, not core)
- CE's ce:ideate integration (separate skill concern)
- GSD's `--auto` mode (unless explicitly needed)
- GSD's `cross_reference_todos` step (project-management overhead, not universally applicable)

### The Hybrid Mental Model

```
User has an idea
       ↓
[SCOPE ASSESSMENT] → Lightweight/Standard/Deep
       ↓
[RESUME CHECK] → Existing brainstorm? Continue or start fresh?
       ↓
[PRIOR CONTEXT LOAD] → Prior decisions, project constraints
       ↓
[PRODUCT PRESSURE TEST] → Right problem? Right framing? (scaled to scope)
       ↓
[CODEBASE SCOUT] → Reusable assets, patterns, integration points
       ↓
[GRAY AREA IDENTIFICATION] → Domain-aware, code-annotated, prior-filtered
       ↓
[STRUCTURED Q&A] → One at a time, multiple choice, 4-per-area rhythm
       ↓
[APPROACH PROPOSAL] → 2-3 options with trade-offs + recommendation
       ↓
[DESIGN PRESENTATION] → Section by section, approval at each
       ↓
[OUTPUT DOCUMENT] → Right-sized requirements doc with structured sections
       ↓
[SPEC REVIEW] → Dispatched subagent (Standard/Deep only)
       ↓
[TRANSITION GATE] → Single exit: invoke planning skill
```

### Key Hybrid Innovations

**1. Two-track output:** For greenfield/design-heavy work, produce a Superpowers-style design spec with architecture, components, data flow. For feature work in existing codebases, produce a GSD-style CONTEXT.md with decisions, canonical refs, and code context. The scope assessment routes to the right track.

**2. Mandatory problem pressure test:** Before asking any clarifying questions, ask the CE product pressure test questions (scaled to scope). This prevents spending a full brainstorm solving the wrong problem.

**3. Code-annotated options from day one:** Every question involving existing-code options should be annotated with what's already in the codebase (GSD pattern). Makes decisions concrete, not abstract.

**4. `Resolve Now` vs `Defer` split:** Every output document distinguishes product decisions (resolve during brainstorm) from technical questions (resolve during planning). This is CE's most practically valuable innovation.

**5. Stable requirement IDs + canonical refs:** Requirements get stable IDs (R1, R2...); spec references get full relative paths. Both enable unambiguous downstream referencing.

---

## 6. Exact Process Steps to Adopt

### Skill Design Specification

**Skill name:** `brainstorming`  
**Trigger:** Use before any feature creation, component building, or behavior modification. Use when requirements are fuzzy, when the user presents a vague request, or explicitly asks to brainstorm.  
**Hard gate:** Do NOT invoke any implementation skill until a design has been presented and the user has approved it.

---

### Phase 0: Initialize

**Step 0.1 — Scope Classification**

Assess scope from the feature description + light project scan:
- **Lightweight** — small, bounded, low ambiguity (e.g., "add a flag to an existing CLI command", "change a UI label")
- **Standard** — normal feature or bounded refactor with decisions to make
- **Deep** — cross-cutting, strategic, or highly ambiguous

If scope is unclear, ask one targeted disambiguation question before continuing.

**Step 0.2 — Resume Check**

Check for recent matching brainstorm/design documents:
- Brainstorms: `docs/brainstorms/*requirements.md` or `docs/superpowers/specs/`
- If found: "Found an existing brainstorm for [topic]. Continue from this, or start fresh?"
- If continuing: summarize current state, continue from existing decisions

**Step 0.3 — Multi-System Decomposition Gate (Superpowers pattern)**

Before any questions, check: does the request describe multiple independent subsystems?

If yes: "This describes multiple independent systems — [A], [B], and [C]. These should each have their own design cycle. Let's start with [recommended first component]. What about the others should we note for later?"

---

### Phase 1: Understand the Idea

**Step 1.1 — Prior Context Load (GSD pattern)**

Read (as available):
- `CLAUDE.md` / `AGENTS.md` — workflow constraints, preferences
- Previous brainstorm/design documents — prior decisions, patterns
- `PROJECT.md`, `REQUIREMENTS.md`, `STATE.md` — project-level constraints

Build internal prior-decisions summary. Use to:
- Skip already-answered questions
- Annotate options with "You previously chose X"
- Flag potential conflicts with prior decisions

**Step 1.2 — Product Pressure Test (CE pattern, scaled to scope)**

Before generating approaches or asking clarifying questions:

*Lightweight:* Single mental check — "Is this solving the real problem? Does something already exist that covers this?"

*Standard:*
- Is this the right problem, or a proxy for a more important one?
- What user or business outcome actually matters here?
- What happens if we do nothing?
- Given current project state and constraints, what is the highest-leverage move: the request as framed, a reframing, or a simplification?

*Deep:* Standard questions plus:
- What durable capability should this create in 6-12 months?
- Does this move the product toward that, or is it only a local patch?

If the pressure test reveals a better framing, surface it as an option: "I notice [different framing] might address the underlying goal more effectively. Want to explore that, or proceed with the original request?"

**Step 1.3 — Codebase Scout (GSD pattern)**

*Lightweight:* Search for existing similar implementations. Check if it already exists.

*Standard/Deep:*
1. Check constraint files (`AGENTS.md`, `CLAUDE.md`) for scope constraints affecting this brainstorm
2. Search for relevant terms; read the most relevant existing artifact (plan, spec, feature doc)
3. Skim adjacent examples covering similar behavior
4. Identify: reusable components/hooks/utilities, established patterns, integration points

Store as internal `<codebase_context>`. Do NOT drift into tests, migrations, or deployment configuration.

**Step 1.4 — Domain-Aware Gray Area Identification (GSD pattern)**

Classify the phase domain:
- Something users **SEE** → layout, density, visual states, empty states, interactions
- Something users **CALL** → interface contracts, auth, errors, versioning, rate limits
- Something users **RUN** → output format, flags, modes, error recovery, progress
- Something users **READ** → structure, tone, depth, flow, navigation
- Something being **ORGANIZED** → criteria, grouping, naming conventions, edge cases

Generate 3-4 **phase-specific** gray areas. Annotate each with:
- Code context (if scout found relevant existing patterns)
- Prior decision note (if already decided in previous phase)

Filter out: technical implementation details, architecture choices, performance concerns, scope expansion.

---

### Phase 2: Collaborative Dialogue

**Step 2.1 — One Question at a Time (Superpowers + CE pattern)**

Rules (apply without exception):
- **One question per message** — never batched
- **Single-select multiple choice preferred** — for choosing one direction
- **Multi-select only** for truly coexisting sets (goals, constraints) — always follow up asking which is primary
- **Start broad** (problem, users, value) then narrow (constraints, exclusions, edge cases)

**Step 2.2 — 4-Questions-Per-Area Rhythm with Checkpoint (GSD pattern)**

For each gray area identified:
1. Announce the area: "Let's talk about [area]."
2. Ask 4 questions using the code-annotated options
3. Checkpoint: "More questions about [area], or move to next? (Remaining: [list unvisited areas])"
4. If more → ask 4 more → checkpoint again
5. After all areas: "We've discussed [areas]. Which gray areas remain unclear?"

**Step 2.3 — Scope Creep Handling (GSD pattern)**

When user suggests something outside current scope:
```
"[Feature X] would be a new capability — that belongs in its own work item.
I'll note it as a deferred idea so we don't lose it.
Back to [current area]: [return to current question]"
```

Track all deferred ideas internally for inclusion in output document.

---

### Phase 3: Explore Approaches

**Step 3.1 — Approach Proposal (Superpowers + CE pattern)**

After the dialogue reveals what's being built, propose 2-3 concrete approaches:

For each:
- Brief description (2-3 sentences)
- Pros and cons
- Key risks or unknowns
- When it's best suited

Lead with your recommended option and explain why. Note whether it is: reuse existing pattern / extend existing capability / build something net new.

**CE challenger option:** Include one higher-upside alternative when:
- There's a nearby framing that creates meaningfully more value
- The additional cost/complexity is low and ongoing carrying cost is manageable
- The work is not already over-scoped

Present the challenger alongside the baseline, not as the default.

If one approach is clearly best and alternatives are not meaningful, state the recommendation directly.

---

### Phase 4: Design Presentation and Approval

**Step 4.1 — Section-by-Section Presentation (Superpowers pattern)**

Present the design incrementally:
1. Architecture / overall approach
2. Components / interfaces / data flow
3. Error handling and edge cases
4. Testing approach (if applicable)

After each section: "Does this look right so far, or should we adjust [section]?"

Scale section depth to complexity: a few sentences if straightforward, up to 200-300 words if nuanced.

**Step 4.2 — YAGNI Enforcement (Superpowers pattern)**

Before finalizing design: "What does planning still need to invent if this document ended now? Are there features here that weren't requested?"

Remove unrequested features. Remove speculative complexity. Keep low-cost polish that delivers real value.

---

### Phase 5: Capture Output Document

**Step 5.1 — Right-Size the Document (CE pattern)**

*Lightweight:* Compact doc with 1-3 requirements + brief decisions. May omit unused sections. Plain bullet requirements acceptable.

*Standard/Deep:* Full requirements document with stable IDs.

**Step 5.2 — Output Document Structure**

Save to `docs/brainstorms/YYYY-MM-DD-<topic>-requirements.md` (or `docs/superpowers/specs/` for design-heavy work).

```markdown
---
date: YYYY-MM-DD
topic: <kebab-case-topic>
---

# <Topic Title>

## Problem Frame
[Who is affected, what is changing, and why it matters]

## Requirements
- R1. [Concrete user-facing behavior or requirement]
- R2. [Concrete user-facing behavior or requirement]

## Success Criteria
- [How we know this solved the right problem]

## Scope Boundaries
- [Deliberate non-goals or exclusions]
- [Deferred ideas: items that surfaced but are out of scope]

## Key Decisions
- [Decision]: [Rationale]

## Canonical References
**Downstream agents MUST read these before planning.**
- `path/to/spec.md` — [What this defines]
- `path/to/adr.md` — [What this decides]

## Code Context (if applicable)
- **Reusable:** [existing component/hook/utility and how it applies]
- **Patterns:** [established patterns this work should follow]
- **Integration:** [where new code connects to existing system]

## Outstanding Questions

### Resolve Before Planning
- [Product decision that must be answered before planning can proceed]

### Deferred to Planning
- [Technical question better answered with codebase access during planning]
- [Question that likely requires research during planning]

## Next Steps
[→ /planning-skill to create implementation plan]
[Or: → Resume /brainstorming to resolve blocking questions]
```

**Step 5.3 — Concrete Over Vague (GSD pattern)**

Good: "Card-based layout, not timeline. Each card shows: author avatar, name, timestamp, full content, reaction counts."  
Bad: "Should feel modern and clean" / "Good user experience"

If a section contains only vague preferences, push back: "Can you make this more concrete? For example, what specifically should [X] look like?"

**Step 5.4 — Commit the Document**

Commit the requirements document with a clear message: `docs: brainstorm - <topic> requirements`.

---

### Phase 6: Spec Review

*Applies to Standard and Deep scope only.*

**Step 6.1 — Dispatch Spec Reviewer Subagent (Superpowers pattern)**

Dispatch a fresh subagent (never pass session history) with:

```
You are a spec document reviewer. Verify this spec is complete and ready for planning.
Spec to review: [SPEC_FILE_PATH]

What to Check:
- Completeness: TODOs, placeholders, "TBD", incomplete sections
- Consistency: Internal contradictions, conflicting requirements
- Clarity: Requirements ambiguous enough to cause someone to build the wrong thing
- Scope: Focused enough for a single plan — not multiple independent subsystems
- YAGNI: Unrequested features, over-engineering
- Blocking questions: Any remaining "Resolve Before Planning" items?

Calibration: Only flag issues that would cause real problems during implementation planning.
Approve unless there are serious gaps that would lead to a flawed plan.

Output:
Status: Approved | Issues Found
Issues (if any):
- [Section]: [issue] — [why it matters for planning]
Recommendations (advisory, do not block approval):
- [suggestions]
```

**Step 6.2 — Review Loop**

- If Issues Found: fix, re-dispatch, repeat
- Maximum 3 iterations before escalating to human
- Human escalation: "The spec has had 3 review iterations and still has unresolved issues. Please review these before I proceed: [issues list]"

---

### Phase 7: Transition Gate

**Step 7.1 — User Review Gate (Superpowers pattern)**

After spec review passes:
> "Spec written and committed to `<path>`. Please review it and let me know if you want to make any changes before I start the implementation plan."

Wait for response. If changes requested: make them, re-run spec review loop.

**Step 7.2 — Present Next-Step Options (CE pattern)**

Present only applicable options:
- **Proceed to planning (Recommended)** — invoke planning skill
- **Proceed directly to work** — ONLY when scope is Lightweight AND success criteria are clear AND no meaningful technical questions remain
- **Ask more questions** — continue refining scope, preferences, edge cases
- **Done for now** — return later

**Step 7.3 — Single Exit State**

The terminal state is invoking the planning skill. Do NOT invoke any implementation skill directly. Do NOT write code. Do NOT scaffold projects.

---

## 7. Psychological Compliance Mechanisms

Drawing from Superpowers' most effective techniques and adding additional mechanisms:

### 7.1 Name the Escape Hatches First

Pattern from Superpowers — preemptively name and rebut common shortcuts:

```
## Anti-Pattern: "This Is Too Simple To Need A Design"
Every project goes through this process. A todo list, a single-function utility,
a config change — all of them. The design can be short, but you MUST present it.

## Anti-Pattern: "The User Wants to Move Fast"  
Speed comes from clarity. A 10-minute brainstorm prevents a 2-hour rework.

## Anti-Pattern: "I Already Know What to Build"
Your assumptions are hypotheses until validated. Run the process.
```

### 7.2 Hard-Gate Naming with XML Delimiters

Use `<HARD-GATE>` tags with capitalization to signal structural constraint (not guideline):

```
<HARD-GATE>
Do NOT invoke any implementation skill, write any code, or take any 
implementation action until you have presented a design and the user has 
explicitly approved it. This applies to EVERY project regardless of 
perceived simplicity.
</HARD-GATE>
```

### 7.3 Create a Checklist with Task Requirements

Map the process to native task-tracking:

```
You MUST create a task for each of these items and complete them in order:
1. [X] Scope classification
2. [ ] Resume check  
3. [ ] Prior context load
...
```

This makes compliance measurable, not just aspirational.

### 7.4 Single Terminal State

Specify exactly one valid endpoint with explicit prohibition:

```
The terminal state is invoking the planning skill.
Do NOT invoke: writing-code, scaffolding, frontend-design, or any other 
implementation skill. The ONLY skill you invoke after brainstorming is planning.
```

### 7.5 Enumerate Prohibited Actions

Instead of "don't implement", list specific prohibited actions:

```
At NO point during brainstorming should you:
- Write any code (including pseudocode or implementation sketches)
- Create files with implementation content
- Run build commands or install dependencies
- Make database schema changes
- Suggest specific library versions or implementation patterns
```

### 7.6 Downstream Awareness as Motivation

Instead of "follow the process because rules", explain what breaks if you skip it:

```
CONTEXT.md feeds into:
1. The researcher — who reads it to know WHAT to investigate
2. The planner — who reads it to know WHAT choices are locked

Your job: Capture decisions clearly enough that downstream agents can act 
on them without asking the user again. Skip this, and the planner will make
assumptions that cause the user to reject the plan.
```

### 7.7 The "Not Your Job" Boundary

Explicitly list what the brainstorming skill is NOT responsible for, to prevent premature scope expansion:

```
Ask about vision and implementation choices. Capture decisions for downstream agents.

NOT your job:
- Codebase patterns (researcher reads the code)  
- Technical risks (researcher identifies these)
- Implementation approach (planner figures this out)
- How to implement it (that's what planning does with the decisions you capture)
```

---

## Appendix: Source References

| Framework | Source URL | Last Verified |
|-----------|-----------|---------------|
| Superpowers SKILL.md | https://raw.githubusercontent.com/obra/superpowers/main/skills/brainstorming/SKILL.md | 2026-03-20 |
| Superpowers spec-document-reviewer-prompt.md | https://raw.githubusercontent.com/obra/superpowers/main/skills/brainstorming/spec-document-reviewer-prompt.md | 2026-03-20 |
| Superpowers visual-companion.md | https://raw.githubusercontent.com/obra/superpowers/main/skills/brainstorming/visual-companion.md | 2026-03-20 |
| GSD discuss-phase workflow | https://github.com/gsd-build/get-shit-done/blob/main/get-shit-done/workflows/discuss-phase.md | 2026-03-20 |
| GSD CONTEXT.md template | https://github.com/gsd-build/get-shit-done/blob/main/get-shit-done/templates/context.md | 2026-03-20 |
| GSD discuss-phase command | https://github.com/gsd-build/get-shit-done/blob/main/commands/gsd/discuss-phase.md | 2026-03-20 |
| GSD USER-GUIDE | https://github.com/gsd-build/get-shit-done/blob/main/docs/USER-GUIDE.md | 2026-03-20 |
| CE ce:brainstorm SKILL.md | https://github.com/EveryInc/compound-engineering-plugin/blob/main/plugins/compound-engineering/skills/ce-brainstorm/SKILL.md | 2026-03-20 |
| CE ce:ideate SKILL.md | https://github.com/EveryInc/compound-engineering-plugin/blob/main/plugins/compound-engineering/skills/ce-ideate/SKILL.md | 2026-03-20 |
| Compound Engineering Philosophy | https://every.to/guides/compound-engineering | 2026-03-20 |
| Elicitron (Ataei et al., 2024) | https://arxiv.org/abs/2404.16045 | 2026-03-20 |
| MARE Framework (Jin et al., 2024) | https://arxiv.org/abs/2405.03256 | 2026-03-20 |
| AI Multiagent RE (Sami et al., 2024) | https://arxiv.org/abs/2409.00038 | 2026-03-20 |
| ChatGPT Prompt Patterns (White et al., 2023) | https://arxiv.org/abs/2303.07839 | 2026-03-20 |
| Feature Elicitation LLM vs AppStore (Wei et al., 2024) | https://dl.acm.org/doi/10.1145/3691620.3695591 | 2026-03-20 |
| LLM in Software RE Systematic Review (Hemmat et al., 2025) | https://www.frontiersin.org/articles/10.3389/fcomp.2025.1519437/full | 2026-03-20 |
| Requirements are All You Need (Robinson et al., 2024) | https://arxiv.org/abs/2405.13708 | 2026-03-20 |
| Prototyping with Prompts (Subramonyam et al., 2025) | https://arxiv.org/abs/2402.17721 | 2026-03-20 |
| Self-Evolving Multi-Agent Networks (Hu et al., 2024) | https://arxiv.org/abs/2410.16946 | 2026-03-20 |
| Vibe vs Agentic Coding (Sapkota et al., 2025) | https://arxiv.org/abs/2505.19443 | 2026-03-20 |
