# BMAD Framework: Exhaustive Deep Dive
*Breakthrough Method for Agile AI-Driven Development*

**Research date:** March 20, 2026  
**Sources:** GitHub repo, official docs, DEV Community, Reddit r/BMAD_Method, LinkedIn, academic/practitioner articles  
**Repo:** [github.com/bmad-code-org/BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD) (10k stars, 1.7k forks, 49 contributors, v4.39.2 latest)

---

## Table of Contents
1. [What BMAD Actually Is](#1-what-bmad-actually-is)
2. [BMAD's Philosophy: Why Role-Based Personas?](#2-bmads-philosophy-why-role-based-personas)
3. [The Agent Persona System: File Structure & Mechanics](#3-the-agent-persona-system-file-structure--mechanics)
4. [The Full Agent Roster (30 Agents)](#4-the-full-agent-roster-30-agents)
5. [Document Handoff Chains: Context Embedding vs. Reference](#5-document-handoff-chains-context-embedding-vs-reference)
6. [Story Mechanics: The CS (Create Story) Command](#6-story-mechanics-the-cs-create-story-command)
7. [The Commands System: Skills, Triggers & Slash Commands](#7-the-commands-system-skills-triggers--slash-commands)
8. [Mary the Analyst: TR, MR, and Research Depth](#8-mary-the-analyst-tr-mr-and-research-depth)
9. [Bob the Scrum Master: Story Authorship & Sprint Management](#9-bob-the-scrum-master-story-authorship--sprint-management)
10. [The Workflow Execution Engine (workflow.xml)](#10-the-workflow-execution-engine-workflowxml)
11. [Party Mode: Multi-Agent Orchestration](#11-party-mode-multi-agent-orchestration)
12. [Advanced Elicitation System](#12-advanced-elicitation-system)
13. [Expansion Modules & Official Extensions](#13-expansion-modules--official-extensions)
14. [The Two Deployment Paths: Web UI vs. IDE](#14-the-two-deployment-paths-web-ui-vs-ide)
15. [BMAD Limitations & Real-World Criticisms](#15-bmad-limitations--real-world-criticisms)
16. [BMAD vs. Competing Frameworks](#16-bmad-vs-competing-frameworks)
17. [Key Terminology Cheatsheet](#17-key-terminology-cheatsheet)

---

## 1. What BMAD Actually Is

BMAD (Breakthrough Method for Agile AI-Driven Development) is an **open-source, markdown/YAML-based AI agent orchestration framework** designed to manage the full software development lifecycle using specialized, persona-driven AI agents. It is tool-agnostic — it works with Claude Code, Cursor, Windsurf, Codex CLI, or any AI assistant supporting custom system prompts.

The official documentation offers two expanded backronyms: originally "Breakthrough Method for Agile AI-Driven Development," now also "Build More Architect Dreams." Both capture the same two-phase architecture:

**Two Core Innovations ([GitHub README](https://github.com/bmad-code-org/BMAD-METHOD)):**

1. **Agentic Planning** — Dedicated agents (Analyst, PM, Architect) collaborate through human-in-the-loop workflows to produce PRDs and Architecture documents that far exceed generic AI task generation.
2. **Context-Engineered Development** — The Scrum Master agent transforms planning artifacts into hyper-detailed story files that contain *everything* the Developer agent needs — full context, implementation details, and architectural guidance embedded directly — eliminating context loss.

> "This two-phase approach eliminates both **planning inconsistency** and **context loss** — the biggest problems in AI-assisted development. Your Dev agent opens a story file with complete understanding of what to build, how to build it, and why."
> — [BMAD GitHub README](https://github.com/bmad-code-org/BMAD-METHOD)

The framework is stateless in terms of chat history: **continuity is achieved through versioned artifact files, not session state**. Each workflow runs in a fresh context window; agents read the planning documents you created in earlier steps. As one YouTube walkthrough explains: "The context does carry forward but it does so through the documents saved in `_bmad-output/` not through chat history." ([YouTube: PRD, Architecture, Agents](https://www.youtube.com/watch?v=vWoJuzHAnQ0))

---

## 2. BMAD's Philosophy: Why Role-Based Personas?

### The Core Problem BMAD Solves

Unstructured AI coding — "vibe coding" — works for prototypes but fails at scale. Three specific failure modes drive BMAD's design:

1. **Context Loss**: LLMs forget architectural decisions, prior reasoning, and intent across sessions. A developer working on Story 4 has no inherent knowledge of the constraints established in Story 1.
2. **Planning Inconsistency**: A single AI asked to "be everything" — analyst, architect, coder, tester — produces averaged, mediocre outputs for each role. It cannot be simultaneously focused on business requirements and implementation tradeoffs.
3. **The Abstraction Trap**: As AI abstraction increases, developer control decreases. Without structured constraints, AI-generated code becomes a "black box" — difficult to audit, trace, or modify ([Applied BMAD, Benny Cheung](https://bennycheung.github.io/bmad-reclaiming-control-in-ai-dev)).

### Why Personas, Not Just System Prompts

This is BMAD's most important conceptual distinction.

A **system prompt** assigns a role: "You are a senior engineer. Write clean code."

A **BMAD persona** is a structured identity encoded as a versioned code artifact with four mandatory elements:

| Element | Purpose | Example (Mary, Business Analyst) |
|---------|---------|----------------------------------|
| **Role** | Functional expertise | Strategic analysis + requirements elicitation |
| **Identity** | Background and specialization | Senior analyst who translates vague needs into actionable specs |
| **Communication Style** | How they present information | Analytical, systematic, data-supported findings |
| **Principles** | Core beliefs guiding decisions | Every challenge has root causes awaiting discovery |

Source: [Harmonizing Two AI Agent Systems, Benny Cheung](https://bennycheung.github.io/harmonizing-two-ai-agent-systems)

The practical consequence: John (PM) doesn't just fill in a PRD template — he "asks 'WHY?' relentlessly, like a detective cutting through fluff to what actually matters" and uses "Jobs-to-be-Done, opportunity scoring, and user-centered design frameworks." ([DEV Community: Understanding BMAD Agents](https://dev.to/jacktt/understanding-the-agents-in-the-bmad-235o))

Personas also create **behavioral constraints** through internal rules (`<r>Stay in character until exit selected</r>`), a persistent **menu loop** that maintains character across the session, and a two-letter command vocabulary that routes to specialized workflows rather than free-form conversation.

### The "Agent as Code" Paradigm

BMAD treats every agent as a **versioned code artifact** — a `.md` file with embedded YAML/XML that defines the agent completely. This is analogous to Infrastructure as Code:

- Agent behavior is **declaratively defined** (not manually configured per-platform)
- Agents are **portable** across Claude, Gemini, ChatGPT via bundle files
- Agents are **versioned in Git** alongside the project they serve
- The entire team can be **npm-installed** with `npx bmad-method install`

Source: [Agent As Code: BMAD-METHOD, DEV Community](https://dev.to/vishalmysore/agent-as-code-bmad-method-4no9)

---

## 3. The Agent Persona System: File Structure & Mechanics

### The Two-File Architecture

Every BMAD agent uses a **loader stub + real agent** split:

```
.claude/commands/bmad/bmm/agents/
└── pm.md                 ← Loader stub (~10 lines)

_bmad/bmm/agents/
└── pm.md                 ← Real agent (complete persona + menus)
```

**The Loader Stub** (what gets invoked as a slash command):
```markdown
---
name: 'pm'
description: 'pm agent'
---

You must fully embody this agent's persona and follow all activation
instructions exactly as specified. NEVER break character until given
an exit command.

<agent-activation CRITICAL="TRUE">
1. LOAD the FULL agent file from @_bmad/bmm/agents/pm.md
2. READ its entire contents
3. Execute ALL activation steps exactly as written
4. Follow agent's persona and menu system precisely
5. Stay in character throughout the session
</agent-activation>
```

**The Real Agent File** structure (XML-in-Markdown):
```xml
---
name: "pm"
description: "Product Manager"
---

<agent id="pm.agent.yaml" name="John" title="Product Manager" icon="📋">

<activation critical="MANDATORY">
  <step n="1">Load persona from this current agent file</step>
  <step n="2">Load {project-root}/_bmad/bmm/config.yaml — store as session variables</step>
  <step n="3">Remember: user's name is {user_name}</step>
  <step n="4">Show greeting, display numbered menu items</step>
  <step n="5">STOP and WAIT for user input</step>
  <step n="6">On user input: Number → execute | Text → fuzzy match</step>
  <step n="7">Check menu-handlers section — extract handler attributes</step>
</activation>

<persona>
  <role>Product Manager specializing in collaborative PRD creation</role>
  <identity>Product management veteran with 8+ years</identity>
  <communication_style>Asks 'WHY?' relentlessly. Direct and data-sharp.</communication_style>
  <principles>
    - PRDs emerge from user interviews, not template filling
    - Ship the smallest thing that validates
  </principles>
</persona>

<menu>
  <item cmd="CP" exec=".../_bmad/bmm/workflows/prd/workflow.md">[CP] Create PRD</item>
  <item cmd="VP" exec="...">[VP] Validate PRD</item>
  <item cmd="DA">[DA] Dismiss Agent</item>
</menu>

</agent>
```

Source: [GitHub Issue #1629 BMAD Architecture Analysis](https://github.com/bmad-code-org/BMAD-METHOD/issues/1629)

### What Each Section Does

| Section | Purpose |
|---------|---------|
| `<activation>` | Numbered steps executed on load. Config loading is MANDATORY step 2 |
| `<persona>` | Character definition: role, identity, communication style, principles |
| `<menu>` | Interactive menu items with command triggers (2-letter codes) |
| `<menu-handlers>` | How to execute each menu item type (workflow, exec, action) |
| `<rules>` | Behavioral constraints (language, character persistence, file loading) |

### Menu Handler Types

| Attribute | What It Does | Example |
|-----------|-------------|---------|
| `workflow="path"` | Load workflow.xml engine + workflow config | Multi-step PRD creation |
| `exec="path"` | Load and execute markdown file directly | Run standalone process |
| `action="text"` | Execute inline instruction | List tasks from manifest |
| `cmd="DA"` | Built-in: Dismiss Agent (exit) | Return to main conversation |

### Agent Persistence: Pure Prompt Engineering

There is **no framework feature** for keeping an agent "active." Persistence is achieved through three reinforcing prompt mechanisms:

1. **Explicit STOP-and-WAIT**: Every activation ends with "STOP and WAIT for user input"
2. **Character rule**: `<r>Stay in character until exit selected</r>`
3. **Implicit return**: After a workflow completes, the persona is still in context. The conversation model maintains state naturally.

The only exit is `[DA] Dismiss Agent`, triggered by: `DA`, `exit`, `leave`, `goodbye`, `dismiss agent`.

### Configuration Cascade (4 Levels)

```
_bmad/_config/manifest.yaml          ← Level 1: Installation metadata
    ↓
_bmad/<module>/config.yaml           ← Level 2: Module config (project name, paths, language)
    ↓
_config/agents/<name>.customize.yaml ← Level 3: Per-agent overrides (persona, menu, memories)
    ↓
Runtime variables                    ← Level 4: {project-root}, {user_name}, {{date}}, etc.
```

All agents share core config fields: `project_name`, `user_name`, `communication_language`, `output_folder`, `planning_artifacts`, `implementation_artifacts`, `project_knowledge`.

The `_bmad/_memory/` directory provides **persistent memory** across sessions for agents that need it — storing learned preferences and standards in per-agent sidecar files.

---

## 4. The Full Agent Roster (30 Agents)

BMAD ships with 30 agents across 6 modules, tracked in `agent-manifest.csv`. The number reported as "21+" in earlier versions corresponds to the base BMM and core modules; the full ecosystem with all extension modules reaches 30.

### Core Module (2 agents)

| Agent ID | Name | Role |
|----------|------|------|
| `bmad-master` | BMad Master (🧙) | Orchestrator: coordinates multi-agent workflows, manages handoffs, runs the workflow state machine. Used for Party Mode facilitation |
| `bmad-builder` | BMad Builder | Meta-level: creates new agents, workflows, and modules. The architect who builds the builders |

### BMM Module — SDLC Agents (12 agents)

| Agent ID | Name | Persona |
|----------|------|---------|
| `analyst` | **Mary** | Strategic business analyst, "treasure hunter" who uses Porter's Five Forces, SWOT, root cause analysis. Approaches every problem looking for hidden patterns |
| `pm` | **John** | Investigative PM, 8+ years experience. Asks "WHY?" relentlessly, detective who cuts through fluff. Uses Jobs-to-be-Done and opportunity scoring |
| `architect` | **Winston** | Senior architect with expertise in distributed systems. Calm, pragmatic. "What could be" vs "what should be." Loves boring technology for stability |
| `sm` | **Bob** | Certified Scrum Master with technical background. Crisp, checklist-driven, zero tolerance for ambiguity. Servant leader |
| `dev` | **Amelia** | Senior developer. Ultra-succinct — "speaks in file paths and acceptance criteria IDs." Will never lie about tests passing. Story File is her single source of truth |
| `qa` | **Quinn** | Pragmatic test automation engineer. "Ship it and iterate" mentality. Coverage first, optimization later |
| `po` | **Sarah** | Product Owner. Bridges business and dev. Maintains backlog with ruthless prioritization. Defines acceptance criteria with zero ambiguity |
| `ux-expert` | **Sally** | Senior UX designer, 7+ years. "Paints pictures with words." Empathetic advocate balancing creative storytelling with rigorous edge case attention |
| `tech-writer` | **Paige** | Expert technical writer in CommonMark, DITA, OpenAPI. "A diagram is worth a thousand words." Patient educator |
| `tea` | **Murat** | Master Test Architect (TEA module). Thinks adversarially about edge cases. Designs test strategies that catch bugs before users do. Balances coverage with pragmatism |
| `quick-flow-solo-dev` | **Barry** | Quick Flow specialist. Direct, confident, implementation-focused. Uses tech slang. "Code that ships is better than perfect code that doesn't" |
| `help` | BMAD Help | Context-aware guidance agent, reads project state and recommends next step |

### Game Dev Studio Module (6 agents)

| Agent ID | Name | Persona |
|----------|------|---------|
| `game-architect` | Cloud Dragonborn | Designs game systems for long-term engagement. Thinks in systems and feedback loops |
| `game-designer` | Samus Shepard | Crafts moment-to-moment gameplay. Understands pacing, challenge curves, psychology of fun |
| `game-dev` | Link Freeman | Implements game mechanics with performance constraints. "60fps is not optional" |
| `game-qa` | (TBD) | Game-specific QA coverage |
| `game-scrum-master` | (TBD) | Sprint management for game development cycles |
| `game-solo-dev` | (TBD) | Rapid prototyping for solo game developers |

### Creative Intelligence Suite (CIS Module — 5 agents)

| Agent ID | Name | Persona |
|----------|------|---------|
| `brainstorming-coach` | **Carson** | Commands 35 ideation techniques (SCAMPER, Reverse Brainstorming). Energetic facilitator |
| `creative-problem-solver` | **Dr. Quinn** | Applies TRIZ, Six Thinking Hats, Root Cause Analysis to intractable problems |
| `design-thinking-coach` | **Maya** | Human-centered design from empathy mapping through prototyping |
| `innovation-strategist` | **Victor** | Identifies disruptive opportunities. Thinks about markets, timing, competitive dynamics |
| `storyteller` | **Sophia** | Transforms dry information into compelling narratives. Story structure expert |

### BMad Builder Module (3 agents)

| Agent ID | Name | Role |
|----------|------|------|
| `agent-builder` | Bond (🕵️) | Guided agent creation with YAML configuration |
| `module-builder` | (TBD) | Creates shareable domain modules |
| `workflow-builder` | (TBD) | Designs structured multi-step workflows |

### Software Archaeology Module (SAR — 6 agents, community article reference)

| Agent ID | Name | Specialty |
|----------|------|-----------|
| `archaeologist` | Dr. Ada | Excavates legacy codebases systematically |
| `cartographer` | Atlas | Creates visual maps of system architecture |
| `doc-curator` | Morgan | Transforms tribal knowledge into documentation |
| `knowledge-miner` | Sage | Extracts patterns and implicit architectural decisions |
| `legacy-analyst` | Quinn | Assesses technical debt with clear metrics |
| `modernization-advisor` | Nova | Plans incremental migration strategies |

Source: [Harmonizing Two AI Agent Systems](https://bennycheung.github.io/harmonizing-two-ai-agent-systems), [GitHub Issue #1629](https://github.com/bmad-code-org/BMAD-METHOD/issues/1629)

---

## 5. Document Handoff Chains: Context Embedding vs. Reference

### The Core Insight

BMAD's architecture is built around **artifacts as the state machine**. The framework determines workflow state by looking for output files, not by tracking session history. ([DEV Community: BMAD Standard Workflow](https://dev.to/jacktt/bmad-standard-workflow-2kma))

This means:
- No session memory required
- Multiple LLMs can collaborate on the same project
- Work is resumable across days, context resets, or model switches
- Every artifact is Git-committable → full audit trail

### The Artifact Pipeline

```
Project Idea
    ↓ Mary (Analyst)
project-brief.md          → Market analysis, competitive landscape, core value prop
    ↓ John (PM)
prd.md                    → Functional requirements (FRs), NFRs, epic breakdown, acceptance criteria
    ↓ Sally (UX Designer)  [optional]
ux-design.md              → User flows, interaction patterns, screen specifications
    ↓ Winston (Architect)
architecture.md           → Tech stack, system components, API design, data flows, security
    ↓ John (PM) + Sarah (PO)
epics-and-stories.md      → Epic decomposition + sharded epic files (epic-1-auth.md, etc.)
    ↓ Bob (Scrum Master)
sprint-plan.md            → Ordered story sequence for implementation
    ↓ Bob (Scrum Master) [per story]
{epic}.{story}.story.md   → Hyper-detailed story with embedded context (see §6)
    ↓ Amelia (Dev)
Source code + tests       → Implementation artifacts
    ↓ Quinn (QA) [optional]
test-suite.md             → Automated test coverage
    ↓ Amelia (Dev)
Code review report        → Quality gate before story marked Done
```

### Context Embedding (Not Just Reference)

The critical distinction: BMAD does **not** just tell the Developer "go read architecture.md." The Scrum Master **actively embeds** relevant architectural context directly into the story file:

```markdown
## Context from Architecture
- Use JWT authentication as specified in architecture.md
- Integrate with User Service component
- Follow REST API patterns defined in system design

## Implementation Details
- Create /api/auth/register endpoint
- Validate email uniqueness in PostgreSQL
- Generate JWT token on successful registration
```

This eliminates the developer (human or AI) needing to cross-reference multiple documents. The story file is **self-contained**.

Source: [GMO Blog: The BMAD Method](https://recruit.group.gmo/engineer/jisedai/blog/the-bmad-method-a-framework-for-spec-oriented-ai-driven-development/)

### The Sharding Step (Critical Bridge)

Before implementation begins, the Product Owner runs **epic sharding** — splitting the comprehensive PRD into focused, individual epic files. This:

- Eliminates "overwhelming context" when the Scrum Master creates stories
- Creates manageable development units while preserving full context
- Maintains traceability from original requirements to final code

The sharding process extracts each epic into a dedicated file like `epic-1-user-auth.md`, `epic-2-products.md`, etc. Each sharded file includes:
- The relevant PRD sections for that epic
- The architectural constraints that apply to it
- The list of stories it contains

### Output Directory Structure

```
_bmad-output/
├── planning-artifacts/       ← PRD, architecture, UX, research, epics
└── implementation-artifacts/ ← Sprint plan, story files, retrospectives

docs/                         ← Project knowledge base (architecture refs, tech stack, onboarding)
```

---

## 6. Story Mechanics: The CS (Create Story) Command

### Why Story Files Exist

The problem they solve: "An AI developer agent has zero inherent knowledge of decisions made in prior sessions." ([YouTube walkthrough](https://www.youtube.com/watch?v=vWoJuzHAnQ0)) The story file is the **knowledge transfer mechanism** from all prior planning work to the act of coding.

### Story File Format

**Naming convention:** `{epicNum}.{storyNum}.{storyTitle}.md`  
Example: `1.1.user-registration.story.md`

**Full story file structure** (from GMO reference implementation):

```markdown
# Story 1.1: User Registration and Store Setup

## Context from Architecture
- Use JWT authentication as specified in architecture.md
- Integrate with User Service component
- Follow REST API patterns defined in system design

## Implementation Details
- Create /api/auth/register endpoint
- Validate email uniqueness in PostgreSQL
- Generate JWT token on successful registration
- Store user profile with initial store setup wizard

## Acceptance Criteria
- [ ] User can register with email/password
- [ ] Email validation prevents duplicates
- [ ] Store setup wizard collects business info
- [ ] JWT token returned for authenticated sessions

## Technical Notes
- Hash passwords using bcrypt (cost factor 12)
- Implement rate limiting for registration attempts
- Create database migrations for users and stores tables

## Dependencies and Integration Points
[architectural dependencies, prior stories to be aware of]

## Testing Requirements
[specific test scenarios, edge cases to cover]
```

### Why This Is Better Than Generic Task Descriptions

A **generic task**: "Implement user registration with JWT"

A **BMAD story**: Contains specific endpoint path, database field validation logic, the exact bcrypt cost factor from the architecture document, rate limiting specs from NFRs, and which integration points exist with the User Service — all pulled from 3 prior planning artifacts and assembled by an agent whose sole job is creating context-rich stories.

The Developer agent (Amelia) treats the story file as her **single source of truth**. Per her persona definition: "She will never lie about tests being written or passing." She executes each story's tasks in strict order, writing tests as she goes.

### The CS Workflow (Bob's Process)

When Bob runs `CS` (Create Story):
1. Reads the current sprint plan to determine which story is next
2. Reads the sharded epic file for that epic
3. Reads the architecture document for relevant technical constraints
4. Reads the PRD for relevant requirements and acceptance criteria
5. Synthesizes all context into a single, self-contained story file
6. Presents the story for user approval
7. On approval, saves to `_bmad-output/implementation-artifacts/`

### Story State Tracking

Stories have statuses tracked in their frontmatter: `Draft` → `Approved` → `In-Progress` → `Ready for Review` → `Done`

When issues arise during review (code review fails, QA finds bugs), the story cycles back to `In-Progress` rather than creating a new story.

---

## 7. The Commands System: Skills, Triggers & Slash Commands

BMAD has two parallel invocation mechanisms with different purposes:

### Mechanism 1: Skills (Slash Commands)

**Skills** are directories under your IDE's skills folder. Each directory contains a `SKILL.md` file that loads an agent, workflow, or task.

**IDE skill directories:**
| IDE/CLI | Skills Directory |
|---------|-----------------|
| Claude Code | `.claude/skills/` |
| Cursor | `.cursor/skills/` |
| Windsurf | `.windsurf/skills/` |

**Installation:** `npx bmad-method install` generates all skills automatically from the modules you select.

**Skill naming convention:** All use the `bmad-` prefix.

**Three skill types:**

| Type | What It Does | Example |
|------|-------------|---------|
| Agent launcher | Loads persona, activates menu, stays in character | `bmad-dev` (loads Amelia) |
| Workflow skill | Loads workflow config, follows steps | `bmad-create-prd` |
| Task/Tool skill | Standalone operation, no agent context needed | `bmad-help` |

**Key workflow skills:**
```
bmad-bmm-create-prd              Create PRD (Phase 2)
bmad-bmm-create-architecture     Design architecture (Phase 3)
bmad-bmm-create-epics-and-stories  Epic/story decomposition (Phase 3)
bmad-bmm-check-implementation-readiness  IR gate (Phase 3)
bmad-bmm-sprint-planning         Sprint plan (Phase 4)
bmad-bmm-create-story            Enriched story file (Phase 4)
bmad-bmm-dev-story               Implement story (Phase 4)
bmad-bmm-code-review             Code review
bmad-bmm-quick-dev               Unified quick flow (Barry's path)
bmad-help                        Context-aware next-step guidance
bmad-brainstorming               Creative ideation session
bmad-party-mode                  Multi-agent discussion
```

**Anytime tools:**
```
bmad-bmm-quick-spec              Lightweight spec (skip full planning)
bmad-bmm-correct-course          Handle mid-sprint pivots
bmad-bmm-document-project        Generate docs for brownfield codebase
bmad-bmm-generate-project-context  Create project-context.md
```

Source: [BMAD Skills Reference](https://docs.bmad-method.org/reference/commands/)

### Mechanism 2: Agent Menu Triggers (2-Letter Codes)

Once an agent is loaded via a skill, you interact with it using **2-letter trigger codes** from the agent's menu. These are **fuzzy-matched** (case-insensitive substring match).

**When no match:** Agent shows "Not recognized" and redisplays menu.  
**Multiple matches:** Agent asks user to clarify.

**Complete BMM trigger map:**

#### Mary (Analyst) — `bmad-analyst`
| Trigger | Command | Notes |
|---------|---------|-------|
| `BP` | Brainstorm Project | Structured ideation, produces final report |
| `MR` | Market Research | Market analysis, competitive landscape, customer needs |
| `DR` | Domain Research | Industry deep dive, subject matter expertise |
| `TR` | Technical Research | Technical feasibility, architecture options |
| `CB` | Create Brief | Guided product definition → executive brief |
| `DP` | Document Project | Analyze brownfield codebase, produce docs |

#### John (Product Manager) — `bmad-pm`
| Trigger | Command |
|---------|---------|
| `CP` | Create PRD |
| `VP` | Validate PRD |
| `EP` | Edit PRD |
| `CE` | Create Epics and Stories |
| `IR` | Implementation Readiness check |
| `CC` | Course Correction |

#### Winston (Architect) — `bmad-architect`
| Trigger | Command |
|---------|---------|
| `CA` | Create Architecture |
| `IR` | Implementation Readiness |

#### Bob (Scrum Master) — `bmad-sm`
| Trigger | Command |
|---------|---------|
| `SP` | Sprint Planning |
| `CS` | Create Story |
| `ER` | Epic Retrospective |
| `CC` | Course Correction |

#### Amelia (Developer) — `bmad-dev`
| Trigger | Command |
|---------|---------|
| `DS` | Dev Story (execute story implementation) |
| `CR` | Code Review |

#### Quinn (QA) — `bmad-qa`
| Trigger | Command |
|---------|---------|
| `QA` | Automate (generate tests for existing features) |

#### Barry (Quick Flow Solo Dev) — `bmad-master`
| Trigger | Command |
|---------|---------|
| `QS` | Quick Spec |
| `QD` | Quick Dev |
| `CR` | Code Review |

#### Sally (UX Designer) — `bmad-ux-designer`
| Trigger | Command |
|---------|---------|
| `CU` | Create UX Design |

#### Paige (Technical Writer) — `bmad-tech-writer`
| Trigger | Command | Type |
|---------|---------|------|
| `DP` | Document Project | Workflow |
| `WD` | Write Document | Conversational (provide description) |
| `US` | Update Standards | Conversational (provide preferences) |
| `MG` | Mermaid Generate | Conversational (provide diagram description) |
| `VD` | Validate Document | Conversational (provide document) |
| `EC` | Explain Concept | Conversational (provide concept name) |

Source: [BMAD Agents Reference](https://docs.bmad-method.org/reference/agents/), [DEV Community: Understanding BMAD Agents](https://dev.to/jacktt/understanding-the-agents-in-the-bmad-235o)

### Universal Menu Items (All Agents)
Every agent also has:
- `MH` — Redisplay Menu Help
- `CH` — Chat with the Agent (free conversation, stays in character)
- `PM` — Start Party Mode
- `DA` — Dismiss Agent (exit)

### The Namespace Hierarchy

BMAD uses directory nesting to create a 4-level command namespace:

```
commands/bmad/bmm/agents/pm.md → /bmad:bmm:agents:pm
commands/bmad/bmgd/workflows/create-story.md → /bmad:bmgd:workflows:create-story
```

Format: `bmad` : `module` : `type` : `name`

This is entirely distinct from Claude Code's native plugin system — BMAD uses `~/.claude/commands/` (project-level symlinked), not the plugin agents/ interface. Source: [GitHub Issue #1629](https://github.com/bmad-code-org/BMAD-METHOD/issues/1629)

---

## 8. Mary the Analyst: TR, MR, and Research Depth

### Persona

Mary is "a strategic business analyst with deep expertise in market research, competitive analysis, and requirements elicitation. She approaches every problem like a treasure hunter — thrilled by clues, energized when patterns emerge. She draws on Porter's Five Forces, SWOT analysis, root cause analysis, and competitive intelligence methodologies." ([DEV Community](https://dev.to/jacktt/understanding-the-agents-in-the-bmad-235o))

She is the **entry point** for most BMAD projects and the only BMM agent who is explicitly optional — but strongly recommended whenever the user hasn't yet validated their idea.

### Research Capabilities

Mary's 6 workflows cover a research spectrum:

**`MR` — Market Research**
- Market analysis and sizing
- Competitive landscape mapping
- Customer needs and trends
- Analogous to a consultant running a market entry analysis

**`TR` — Technical Research**
- Technical feasibility assessment
- Architecture options comparison
- Implementation approach analysis
- Useful before committing to a stack in the architecture phase

**`DR` — Domain Research**
- Industry deep dive
- Subject matter expertise and terminology
- Useful for unfamiliar domains (healthcare, finance, gaming)

**`BP` — Brainstorm Project**
- Structured ideation through proven techniques
- Produces a final brainstorming report
- Not free-form — follows facilitation protocols

**`CB` — Create Brief**
- Guided conversion of ideas → executive product brief
- The canonical input document for John (PM)
- Typically the first mandatory artifact in most projects

**`DP` — Document Project**
- Analyzes existing codebases (brownfield)
- Produces documentation for both humans and LLMs
- Also available via Paige (Tech Writer) — Mary's version is more analytics-focused

### Research Depth

Mary's research is as deep as the underlying LLM allows. She uses structured methodology frameworks (Porter's Five Forces, SWOT, competitive intelligence protocols) rather than open-ended prompting. This produces more consistent, comparable outputs than asking a generic assistant to "research the market."

Critically, Mary's output artifacts feed directly into John's PRD creation. She doesn't produce standalone reports — she produces input documents that structure subsequent agent work. This is the "relay baton" model at the analysis layer.

---

## 9. Bob the Scrum Master: Story Authorship & Sprint Management

### Persona

Bob is "certified Scrum Master with a deep technical background. Crisp, checklist-driven, zero tolerance for ambiguity. Every word has a purpose, every requirement must be crystal clear." ([DEV Community](https://dev.to/jacktt/understanding-the-agents-in-the-bmad-235o))

Bob's key principle: **the story file is the only interface between planning and coding**. His job is to make that interface perfect.

### SP — Sprint Planning

Input: The epics-and-stories list (from `CE` run by John)  
Output: `sprint-plan.md` — ordered list of stories for the sprint

Bob sequences stories considering:
- Dependencies between stories
- Risk ordering (higher risk earlier)
- Value delivery ordering

### CS — Create Story (The Central Mechanic)

This is BMAD's most important workflow. Bob:

1. Reads sprint plan → identifies next story
2. Loads the sharded epic file for that story
3. Reads the full architecture document
4. Reads relevant PRD sections
5. Synthesizes everything into a hyper-detailed, self-contained story file
6. Presents for user approval (checkpoint)
7. On approval → saves to `_bmad-output/implementation-artifacts/`

The story file **embeds** (not references) all architectural context relevant to that specific story. This is the core context-engineering innovation.

### CC — Course Correction

When unexpected changes occur mid-sprint:
- Bob can split an oversized story into two smaller stories
- Bob can merge stories
- Bob can reprioritize the remaining sprint
- Doesn't require restarting from scratch

Example from community: "Just tell Bob something like: 'Story 2-3 is too large and needs to be split into two smaller stories' — he'll walk you through it." ([GitHub Issue #1383](https://github.com/bmad-code-org/BMAD-METHOD/issues/1383))

### ER — Epic Retrospective

Runs in **Party Mode** — brings multiple agents into a review of all completed work across the epic. Each agent reviews from their perspective (dev quality, PM requirements satisfaction, architecture adherence, test coverage).

---

## 10. The Workflow Execution Engine (workflow.xml)

Every workflow in BMAD is executed by a **universal engine**: `_bmad/core/tasks/workflow.xml`.

This engine is the "OS" of BMAD. When a menu handler type is `workflow=`, the agent:
1. Loads workflow.xml
2. Passes the workflow config as parameter
3. Executes workflow.xml's instructions precisely

### Workflow File Architecture

A workflow consists of multiple files working together:

| File | Purpose |
|------|---------|
| `workflow.yaml` / `workflow.md` | Config: declares variables, file paths, metadata, mode routing |
| `instructions.md` (or `workflow.xml`) | XML-based state machine — the actual workflow logic |
| `template.md` | Output structure with `{{variable}}` placeholders — guarantees consistent format |
| `checklist.md` | Programmatic validation rules + human checklist — enforces quality gates |
| `data.csv` | Domain knowledge lookup tables the agent queries during execution |
| `state.json` | Persistent memory across sessions (enables resumability) |

Source: [LinkedIn: How to Use BMAD v6 for Stateful Workflows](https://www.linkedin.com/posts/martinlionel_who-else-is-usingbmad-v6-i-love-how-activity-7397141343296372736-tf_Y)

### Step-File Architecture (Micro-Files)

Complex workflows (like PRD creation) use a micro-file architecture:

```
workflows/prd/
├── workflow.md              ← Config + mode routing
├── templates/
│   └── prd-template.md      ← Output template
├── steps-c/                 ← Create mode (up to 12 steps)
│   ├── step-01-init.md
│   ├── step-02-discovery.md
│   ├── step-03-success.md
│   └── ...
├── steps-v/                 ← Validate mode
└── steps-e/                 ← Edit mode
```

**Why micro-files:** Each step is loaded **just-in-time**. Only the current step is in context. This prevents context bloat and keeps the LLM focused on one decision at a time.

### Tri-Modal Workflows

Many workflows support three modes via the same entry point:

| Mode | Steps Directory | Triggered By |
|------|----------------|-------------|
| **Create** | `steps-c/` | "create" or no existing document |
| **Validate** | `steps-v/` | "validate" or review request |
| **Edit** | `steps-e/` | "edit" and document exists |

### Step File Format

```markdown
---
name: 'step-03-success'
description: 'Define success criteria'
nextStepFile: './step-04-journeys.md'
outputFile: '{planning_artifacts}/prd.md'
advancedElicitationTask: '...'
partyModeWorkflow: '...'
---

## Progress: Step 3 of 11

## STEP GOAL
Define success criteria for the product.

## DISCOVERY SEQUENCE
[step-specific instructions]

### Present Menu
"[A] Advanced Elicitation [P] Party Mode [C] Continue to Step 4"
```

### Execution Modes

| Mode | Behavior |
|------|---------|
| **Normal** | Full user interaction at every step and template-output |
| **YOLO** | Skip confirmations, auto-simulate all discussions, produce everything |

YOLO is activated by pressing `[y]` at any step menu. Applies only to the rest of the current workflow.

### State Tracking

The output document's own frontmatter tracks progress:
```yaml
---
stepsCompleted: [step-01-init, step-02-discovery, step-03-success]
workflowType: 'prd-create'
---
```

If a workflow is interrupted and re-run, step-01 detects the partially completed document and auto-routes to the correct next step.

### Workflow XML Control Tags

The `Instructions.md` uses XML tags for flow control:
- `<step>` — numbered sequential step
- `<action>` — perform an action
- `<check if="condition">` — conditional block  
- `<ask>` — prompt user, WAIT for response
- `<invoke-workflow>` — execute sub-workflow
- `<goto step="x">` — jump to a step
- `<HALT>` — stop execution

This transforms conversational AI into a **semi-deterministic state machine** ([LinkedIn analysis](https://www.linkedin.com/posts/martinlionel_who-else-is-usingbmad-v6-i-love-how-activity-7397141343296372736-tf_Y)).

---

## 11. Party Mode: Multi-Agent Orchestration

### How It Works

Run `bmad-party-mode` (or `[PM]` from any agent menu). BMad Master:
1. Loads all agents from `agent-manifest.csv`
2. Analyzes user's message for which domains of expertise are relevant
3. Selects 2-3 most appropriate agents
4. Each agent responds in character with their specific perspective
5. Agents can reference and challenge each other's responses
6. User controls the conversation — ask follow-ups, redirect, push back
7. Exit: type "exit", "quit", or "end party"

### What It's Good For

- **Big decisions with tradeoffs** — e.g., "Monolith vs microservices?"
- **Post-mortems** — each agent blames something different (and all have valid points)
- **Sprint retrospectives** — PM, Dev, QA, Architect each review the sprint
- **Technical validation** — stress-test an architecture with Winston AND Murat simultaneously

### Real-World Example (from official docs)

> **You:** "Monolith or microservices for MVP?"  
> **Architect:** "Start monolith. Microservices add complexity you don't need at 1000 users."  
> **PM:** "Agree. Time to market matters more than theoretical scalability."  
> **Dev:** "Monolith with clear module boundaries. We can extract services later if needed."

Source: [BMAD Party Mode Documentation](https://docs.bmad-method.org/explanation/party-mode/)

### What Party Mode Is Not

Party mode is NOT parallel execution. All agents respond within the same conversation context — they are personas within a single LLM session, not separate AI instances. As of current BMAD versions, execution is single-threaded. ([YouTube: BMAD v6 vs Plan Mode](https://www.youtube.com/watch?v=OdR7HKYFb1s))

---

## 12. Advanced Elicitation System

Advanced Elicitation is a **structured second-pass mechanism** built into every workflow's decision points.

**The problem it solves:** "Make it better" produces marginal revisions. Naming a specific reasoning method forces a particular angle of attack, surfacing insights that a generic retry misses.

**How it works:**
1. LLM suggests 5 relevant reasoning methods for the current content
2. User picks one (or reshuffles for different options)
3. Method is applied, improvements shown
4. Accept or discard, repeat or continue

**Built-in methods include:**
- **Pre-mortem Analysis** — Assume the project already failed, work backward to find why
- **First Principles Thinking** — Strip away assumptions, rebuild from ground truth
- **Inversion** — Ask how to guarantee failure, then avoid those things
- **Red Team vs Blue Team** — Attack your own work, then defend it
- **Socratic Questioning** — Challenge every claim with "why?" and "how do you know?"
- **Constraint Removal** — Drop all constraints, see what changes, add them back selectively
- **Stakeholder Mapping** — Re-evaluate from each stakeholder's perspective
- **Analogical Reasoning** — Find parallels in other domains

Source: [BMAD Advanced Elicitation Documentation](https://docs.bmad-method.org/explanation/advanced-elicitation/)

This feature is available at every `[A]` menu point within workflow steps.

---

## 13. Expansion Modules & Official Extensions

### Official Modules (installed via npm)

| Module | Code | Provides |
|--------|------|---------|
| **BMad Builder** | `bmb` | Agent Builder, Workflow Builder, Module Builder — the meta-extension system |
| **Creative Intelligence Suite** | `cis` | Innovation Strategist, Design Thinking Coach, Brainstorming Coach, Problem Solver, Storyteller |
| **Game Dev Studio** | `gds` | 6 game dev agents, GDD workflows, narrative design, 21+ game type coverage (Unity/Unreal/Godot) |
| **Test Architect (TEA)** | `tea` | Murat agent, 9 test workflows, ATDD, risk-based prioritization, CI setup, Playwright integration |

Source: [BMAD Official Modules](https://docs.bmad-method.org/reference/modules/)

### How Modules Work

Modules are npm packages (`bmad-creator-intelligence-suite`, `bmad-game-dev-studio`, etc.) that extend the base BMAD installation. When selected during `npx bmad-method install`, the installer:
- Reads the module manifest
- Generates agent skills
- Generates workflow skills
- Adds agents to `agent-manifest.csv`
- Adds workflows to `workflow-manifest.csv`

### Expansion Packs (Community)

BMAD's modular architecture allows anyone to build and publish custom modules. The `bmad-builder` module provides guided tooling to create:
- Custom agents for specific domains
- Custom workflows for specific processes
- Distributable npm packages

Community modules marketplace is announced but not yet live (as of March 2026).

---

## 14. The Two Deployment Paths: Web UI vs. IDE

### Web UI Path (Planning Phase)

Use a Gemini Gem, Custom GPT, or similar interface:
1. Download the "full stack team bundle" from BMAD's `dist/` directory
2. Upload to the web AI interface
3. Set instructions: "Your critical operating instructions are attached, do not break character as directed"
4. Type `*help` to see commands, or `*analyst` to start with Mary

The **web bundle** is a single `.txt` file containing all agent personas, templates, workflows, and data — concatenated by the `web-builder.js` tool. This makes it portable to any web AI.

**Web UI commands** use the `*` prefix: `*analyst`, `*pm`, `*architect`, `*help`

### IDE Path (Development Phase — Primary)

Install via `npx bmad-method install` into the project directory.

The installer creates:
- `_bmad/` — Framework core (agent definitions, workflows, config)
- `_bmad-output/` — Empty initially, fills with planning artifacts
- `.claude/skills/` (or equivalent) — IDE skill commands
- `docs/` — Project knowledge base

**IDE commands** use the `/` slash prefix matching the skill directory name.

### The Critical Transition

The official BMAD guidance is: **use the web UI for planning, switch to the IDE for implementation**. The reason: planning workflows benefit from the larger context and conversational interface of web UIs; implementation requires IDE integration (file access, code execution, test running).

"Once you have your PRD, Architecture, optional UX and Briefs — it's time to switch over to the IDE to shard your docs, and start implementing the actual code!" — [GitHub README](https://github.com/bmad-code-org/BMAD-METHOD)

---

## 15. BMAD Limitations & Real-World Criticisms

### Documented User Pain Points

**1. Token Cost**

This is the most cited criticism. BMAD's multi-agent, multi-document approach consumes API credits at a high rate. Each agent reads the entire project context, architecture documents, and prior artifacts. For complex apps, costs can be significant even with modest models.

> "BMAD isn't free, contrary to what you might think. Because the approach requires multiple agents to read the entire project context, architecture documents, and prior chat history, it consumes API credits at a frightening pace." — [Reddit r/BMAD_Method](https://www.reddit.com/r/BMAD_Method/comments/1r6aruo/bmad_method_sucks/)

**2. Waterfall Rigidity for Simple Projects**

Multiple reviewers note BMAD recreates waterfall's "rigid stages, endless documentation" for projects that don't need it. The framework is designed for complexity; applying it to simple apps creates bureaucratic overhead without proportional benefit.

> "For smaller projects it feels overly heavy and complicated." — [Reddit commenter](https://www.reddit.com/r/BMAD_Method/comments/1r6aruo/bmad_method_sucks/)

**3. Single-Threaded Execution**

BMAD workflows are sequential — one context window, no parallel execution. A 7-hour BMAD build vs. an 8-hour alternative BMAD build is not the improvement promised. ([YouTube: BMAD v6 vs Plan Mode](https://www.youtube.com/watch?v=OdR7HKYFb1s))

**4. Documentation Bloat**

Agents frequently produce 1,000+ lines of documentation for trivial tasks. The documentation primarily serves agents (providing context for future steps) — but this creates a perception of over-engineering.

> "It generates mountains of documentation that, let's be honest, nobody is going to read after the project ships." — [YouTube reviewer](https://www.youtube.com/watch?v=OdR7HKYFb1s)

**5. Complexity of the Process Itself**

Users sometimes end up "watching the terminal, copying prompts between agents, or debugging the process instead of the code." The framework can become the obstacle.

**6. Mid-Sprint Discovery Problems**

When the development reveals an architectural issue not anticipated in planning, reworking upstream documents (PRD, architecture) while stories are already in flight creates coordination overhead. The framework's unidirectional flow (`PRD + Architecture → Stories`) makes retroactive changes difficult. ([GitHub Issue #1638](https://github.com/bmad-code-org/BMAD-METHOD/issues/1638))

**7. Learning Curve**

The full stack of agents, workflow commands, file structures, module distinctions, and phase gates represents significant learning investment before productivity improves.

### When BMAD Works Well (Community Consensus)

From the community discussions, BMAD's strengths emerge most clearly:

- **Large greenfield projects** with genuine architectural complexity
- **Enterprise governance requirements** — audit trails, compliance ledgers
- **Teams that need a shared specification language** across human + AI contributors
- **Projects where the cost of wrong decisions early is high** (regulated industries, enterprise SaaS)
- **The code review agent** consistently praised — compares intended behavior against actual code

> "I believe BMAD only reveals its value when you have more mature products or increasingly complex architectures that evolve, where codified decisions are being reconsidered." — [Reddit commenter](https://www.reddit.com/r/BMAD_Method/comments/1r6aruo/bmad_method_sucks/)

> "It shines for me with Claude Code and Opus." — [Reddit commenter](https://www.reddit.com/r/BMAD_Method/comments/1r6aruo/bmad_method_sucks/)

### The Scale Adaptive Principle

BMAD v6 introduces **scale-adaptive framework** design — Barry (Quick Flow Solo Dev) is the explicit escape hatch for small tasks. The framework acknowledges its own overhead and provides a lighter path:
- Quick Path (Barry): `QS` + `QD` — bug fixes, small patches, refactoring
- Full Path: All phases — greenfield projects, complex features

---

## 16. BMAD vs. Competing Frameworks

| Feature | BMAD | Agent OS (AG2/AutoGen) | AWS Kiro | GitHub Spec Kit |
|---------|------|----------------------|----------|-----------------|
| **Core Philosophy** | Human-in-the-loop, role-based AI team, spec-driven | Multi-agent conversation, collaborative AI | Requirements → Design → Tasks pipeline | Four-phase gated: Specify, Plan, Tasks, Implement |
| **Tooling** | Markdown/YAML, any AI/IDE | Python framework, built-in agents | Full VS Code IDE, Claude Sonnet + AWS | CLI toolkit with templates |
| **State Management** | File-based (artifacts = state) | Conversation-based | IDE-native | Git-based |
| **Agent Personas** | 30 named personas with full identities | Functional agents, minimal personality | None (AWS-managed) | None |
| **Status** | Active open-source, 10k GitHub stars | Microsoft-backed (formerly AutoGen) | AWS public preview | GitHub open-sourced 2024 |
| **Best For** | Complex greenfield + enterprise governance | Multi-agent orchestration research | AWS-native development | Lightweight spec enforcement |

Source: [GMO Blog: The BMAD Method](https://recruit.group.gmo/engineer/jisedai/blog/the-bmad-method-a-framework-for-spec-oriented-ai-driven-development/)

---

## 17. Key Terminology Cheatsheet

| Term | Definition |
|------|-----------|
| **BMM** | BMad Method Module — the SDLC/Agile suite (the core module) |
| **Persona** | A named agent identity with role, identity, communication style, and guiding principles |
| **Skill** | An installable command that loads an agent, runs a workflow, or executes a task |
| **Trigger** | 2-letter code within an active agent session (e.g., `CS`, `CP`, `DS`) |
| **Story File** | `{epic}.{story}.title.story.md` — self-contained implementation guide with embedded context |
| **Sharding** | Process of splitting PRD + architecture into focused, per-epic files for development consumption |
| **Context Engineering** | Discipline of designing what information goes into a story file so the Dev agent has exactly what it needs |
| **Artifacts Drive State** | BMAD determines workflow position by checking for output files, not tracking session history |
| **YOLO Mode** | Skip all confirmations, auto-complete a workflow in one pass |
| **Party Mode** | Multi-agent collaborative discussion where all personas respond to the same prompt |
| **Advanced Elicitation** | Structured second-pass using named reasoning methods to improve agent-generated content |
| **Greenfield** | New project built from scratch |
| **Brownfield** | Existing codebase being onboarded into BMAD |
| **Quick Flow** | Barry's lightweight path — skips full planning for small tasks |
| **loader stub** | The 10-line `.claude/commands/` file that triggers loading the real agent file |
| **workflow.xml** | The universal workflow execution engine shared by all BMAD workflows |
| **micro-file architecture** | Step files loaded just-in-time to prevent context bloat |
| **`_bmad/`** | Framework core directory (agent definitions, workflow configs — do not modify manually) |
| **`_bmad-output/`** | All generated planning and implementation artifacts |
| **TEA** | Test Architect Enterprise — optional module with Murat agent and 9 test workflows |

---

## Sources

1. [BMAD-METHOD GitHub Repository](https://github.com/bmad-code-org/BMAD-METHOD) — official source, 10k stars
2. [BMAD Official Documentation](https://docs.bmad-method.org) — agents, commands, modules, workflow map
3. [BMAD Agents Reference](https://docs.bmad-method.org/reference/agents/) — complete agent/trigger table
4. [BMAD Skills/Commands Reference](https://docs.bmad-method.org/reference/commands/) — skill categories and generation
5. [BMAD Official Modules Reference](https://docs.bmad-method.org/reference/modules/) — TEA, CIS, GDS, BMB
6. [BMAD Party Mode Documentation](https://docs.bmad-method.org/explanation/party-mode/) — mechanics and examples
7. [BMAD Advanced Elicitation Documentation](https://docs.bmad-method.org/explanation/advanced-elicitation/) — reasoning methods
8. [DEV Community: Understanding the Agents in BMAD](https://dev.to/jacktt/understanding-the-agents-in-the-bmad-235o) — per-agent deep dives
9. [DEV Community: BMAD Standard Workflow](https://dev.to/jacktt/bmad-standard-workflow-2kma) — complete workflow map with Scrum equivalents
10. [DEV Community: Agent As Code — BMAD-METHOD](https://dev.to/vishalmysore/agent-as-code-bmad-method-4no9) — IaC analogy and portability
11. [GitHub Issue #1629: BMAD Architecture Analysis](https://github.com/bmad-code-org/BMAD-METHOD/issues/1629) — deep technical analysis of agent file structure, loader stubs, workflow engine
12. [GitHub Issue #1383: Split Story Action](https://github.com/bmad-code-org/BMAD-METHOD/issues/1383) — course correction mechanics
13. [GitHub Issue #1638: Epics/Stories Workflow Unidirectional](https://github.com/bmad-code-org/BMAD-METHOD/issues/1638) — upstream doc update limitation
14. [Applied BMAD: Reclaiming Control in AI Development](https://bennycheung.github.io/bmad-reclaiming-control-in-ai-dev) — enterprise case study, governance use case
15. [Harmonizing Two AI Agent Systems](https://bennycheung.github.io/harmonizing-two-ai-agent-systems) — complete 30-agent roster, persona philosophy
16. [GMO Blog: The BMAD Method — Spec Oriented AI-Driven Development](https://recruit.group.gmo/engineer/jisedai/blog/the-bmad-method-a-framework-for-spec-oriented-ai-driven-development/) — story file examples, artifact flow, framework comparison table
17. [Reddit r/BMAD_Method: "BMAD Method Sucks"](https://www.reddit.com/r/BMAD_Method/comments/1r6aruo/bmad_method_sucks/) — community criticisms and defenses
18. [Reddit r/BMAD_Method: BMAD v6 vs Plan Mode Comparison](https://www.reddit.com/r/BMAD_Method/comments/1rv4c3n/bmad_v6_vs_plan_mode_the_honest_comparison_nobody/) — honest performance comparison
19. [LinkedIn: How to Use BMAD v6 for Stateful Workflows](https://www.linkedin.com/posts/martinlionel_who-else-is-usingbmad-v6-i-love-how-activity-7397141343296372736-tf_Y) — workflow file architecture breakdown
20. [YouTube: PRD, Architecture, Agents — This Finally Ends Vibe Coding](https://www.youtube.com/watch?v=vWoJuzHAnQ0) — walkthrough of complete workflow
21. [YouTube: BMAD v6 vs Plan Mode — The Honest Comparison](https://www.youtube.com/watch?v=OdR7HKYFb1s) — single-threaded limitation, documentation bloat
22. [BMAD-AT-CLAUDE: Core Architecture](https://github.com/24601/BMAD-AT-CLAUDE/blob/main/docs/core-architecture.md) — planning and development cycle diagrams
