---
name: khuym:exploring
description: >-
  Use before any feature work, refactor, or behavior modification. Extracts locked
  decisions from the user through Socratic dialogue BEFORE research or planning begins.
  Implements GSD discuss-phase + Superpowers brainstorming + CE scope-tiering.
  Trigger phrases: build, add, change, implement, design, figure out what we need,
  brainstorm, exploring. Output is history/<feature>/CONTEXT.md — the single source
  of truth for all downstream agents (planning, validating, swarming).
metadata:
  version: '1.0'
  ecosystem: khuym
  position: '2 of 9 — runs after using-khuym, before planning'
---

# Exploring Skill

Research shows that 5–10 minutes spent extracting decisions before any planning begins
prevents hours of back-and-forth caused by planner assumptions ([GSD README](https://github.com/gsd-build/get-shit-done)).
This skill is that conversation. Teams who skip it get reasonable defaults; teams who use it get their vision.

## When to Use This Skill

Load when the user presents a feature request, asks to build or change something, or when
requirements are fuzzy enough that downstream agents would need to make implementation assumptions.
Skip for one-line fixes where all decisions are self-evident.

---

## Process

You MUST complete these phases in order. Create a task for each phase before starting.

---

### Phase 0: Scope Assessment

**Step 0.1 — Classify scope**

Assess from the request + a 30-second project scan:

- **Quick** — bounded, low ambiguity (e.g., rename a flag, tweak a label). Skip to Phase 2.
- **Standard** — normal feature with decisions to extract. Run all phases.
- **Deep** — cross-cutting, strategic, or highly ambiguous. Run all phases with extra depth.

If scope is unclear, ask ONE disambiguation question before continuing.

**Step 0.2 — Load prior context**

```
Read (if exists):
- history/learnings/critical-patterns.md   ← promoted critical learnings
- .khuym/STATE.md                          ← any prior feature context
```

Build an internal summary of prior decisions. Use it to skip already-answered questions
and annotate options with "Previously decided: X."

**Step 0.3 — Multi-system decomposition check**

Does the request describe multiple independent subsystems? If yes:
> "This covers [A], [B], and [C] — three independent systems. Each needs its own exploring
> session. Let's start with [most foundational]. I'll note the others for later."

---

### Phase 1: Domain Classification

Classify what is being built. This determines which gray areas to probe.

| Type | What it is | Example |
|------|-----------|---------|
| **SEE** | Something users look at | UI, dashboard, layout |
| **CALL** | Something callers invoke | API, CLI command, webhook |
| **RUN** | Something that executes | Background job, script, service |
| **READ** | Something users read | Docs, emails, reports |
| **ORGANIZE** | Something being structured | Data model, file layout, taxonomy |

One feature can span types (e.g., SEE + CALL). Classify all that apply.

Load `references/gray-area-probes.md` now. You will use the probes for your domain type(s)
in Phase 2.

---

### Phase 2: Gray Area Identification

Generate 2–4 gray areas for this feature using the domain probes from `gray-area-probes.md`.

A gray area is a decision that:
- Affects implementation specifics
- Was not stated in the request
- Would force the planner to make an assumption without it

**Quick codebase scout** (grep only — no deep analysis):

```bash
grep -rl "<feature-keyword>" src/ app/ --include="*.ts" --include="*.tsx" \
  --include="*.js" --include="*.py" | head -10
```

Read 2–3 most relevant files. Annotate gray area options with what already exists:
> "You already have a `Card` component — reusing it keeps visual consistency."

Filter OUT of gray areas:
- Technical implementation details (architecture, library choices)
- Performance concerns
- Scope expansion (new capabilities not requested)

---

### Phase 3: Socratic Exploration

<HARD-GATE>
Ask ONE question at a time. Wait for the user's response before asking the next question.
Do NOT batch questions. Do NOT answer your own questions.
Do NOT proceed to Phase 4 until all gray areas have been discussed and decisions locked.
This gate is non-negotiable. Elicitron (2024) demonstrates sequential questioning
identifies significantly more latent needs than batched approaches.
</HARD-GATE>

**Rules (apply without exception):**

1. One question per message — never bundled
2. Single-select multiple choice preferred over open-ended
3. Start broad (what/why/for whom) then narrow (constraints, edge cases)
4. 3–4 questions per gray area, then checkpoint:
   > "More questions about [area], or move to next? (Remaining: [unvisited areas])"

**Scope creep response** — when the user suggests something outside scope:
> "[Feature X] is a new capability — that's its own work item. I'll note it as a
> deferred idea. Back to [current area]: [return to current question]"

**Decision locking** — after each gray area is resolved:
> "Locking decision [D_N]: [summary of decision]. Confirmed?"

Assign stable IDs in sequence: D1, D2, D3... These IDs are referenced in CONTEXT.md and
by all downstream agents. Do not reuse or renumber IDs once assigned.

---

### Phase 4: Context Assembly

**Step 4.1 — Write CONTEXT.md**

```
Path: history/<feature-slug>/CONTEXT.md
```

Load `references/context-template.md` and populate every section. Rules:
- Locked decisions must be concrete: "Card-based layout, not timeline" not "modern feel"
- Code context must cite file paths found during the scout
- Open questions must be split: "Resolve Before Planning" vs "Deferred to Planning"
- Every locked decision must reference its stable ID (D1, D2...)

**Step 4.2 — Self-review via subagent**

Spawn a fresh subagent with this prompt (never pass session history):

```
You are a context document reviewer. Verify this CONTEXT.md is ready for planning agents.

File to review: history/<feature>/CONTEXT.md

Check for:
- Completeness: any TODOs, placeholders, "Tbr", or unfilled sections?
- Consistency: internal contradictions or conflicting decisions?
- Clarity: decisions ambiguous enough to force a planner to guess?
- Concrete vs vague: replace "should feel good" with specific behaviors
- Decision IDs: all locked decisions have stable IDs (D1, D2...)?
- "Resolve Before Planning" items: any still unresolved?

Calibration: only flag issues that would cause a planning agent to make wrong assumptions.
Approve unless there are serious gaps.

Output:
Status: Approved | Issues Found
Issues (if any): [section] — [issue] — [why it matters for planning]
```

- If Issues Found: fix, re-spawn reviewer, repeat
- Maximum 2 iterations before asking the user to review directly

---

### Phase 5: Handoff

After CONTEXT.md passes review:

1. Update `.khuym/STATE.md`:
   ```
   Current: exploring complete for <feature>
   CONTEXT.md: history/<feature>/CONTEXT.md
   Locked decisions: D1...D_N
   Next: invoke khuym:planning skill
   ```

2. Present to user:
   > "Decisions captured. CONTEXT.md written to `history/<feature>/CONTEXT.md`.
   > CONTEXT.md is now the single source of truth for all downstream agents.
   > Invoke the khuym:planning skill to research and plan."

<HARD-GATE>
Do NOT invoke planning, write code, create beads, or take any implementation action.
The terminal state of this skill is writing CONTEXT.md and announcing handoff.
The ONLY valid next step is the user invoking the khuym:planning skill.
</HARD-GATE>

---

## What This Skill Does NOT Do

The planner reads CONTEXT.md and does these things — not you:

- Research external patterns or library options (that is planning's job)
- Analyze the codebase deeply (only quick grep here)
- Write code, pseudocode, or implementation sketches
- Create beads or suggest implementation approaches
- Propose architecture or technical solutions

Researchers and planners downstream read CONTEXT.md to know what to investigate and
what choices are already locked. Your job is to capture decisions clearly enough that
they can act without asking the user again.

---

## Anti-Patterns

**"This is too simple to need exploring"**
Every standard-scope request goes through this process. The CONTEXT.md can be short.
But downstream agents will make assumptions without it — and those assumptions compound.

**"I already know what to build"**
Your assumptions are hypotheses until the user confirms them.
Run Phase 3 and let the user lock the decisions.

**"The user wants to move fast"**
Speed comes from clarity. A 10-minute exploring session prevents a 2-hour planning rework
caused by locked decisions that contradicted what the user actually wanted.

---

## Red Flags

Stop immediately if you catch yourself doing any of these:

- Answering a question you just asked (HARD-GATE violation)
- Writing code or suggesting a library
- Asking two questions in the same message
- Skipping Phase 3 because the feature "seems obvious"
- Creating beads or referencing bead IDs
- Running deep codebase analysis instead of quick grep

---

## References

- `references/gray-area-probes.md` — probes per domain type (SEE/CALL/RUN/READ/ORGANIZE)
- `references/context-template.md` — the CONTEXT.md template to populate in Phase 4
