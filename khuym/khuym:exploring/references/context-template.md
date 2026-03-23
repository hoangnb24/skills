# CONTEXT.md Template

This template is written by the khuym:exploring skill in Phase 4.
It is read by the khuym:planning skill, khuym:validating skill, and all downstream agents.

**Save to:** `history/<feature-slug>/CONTEXT.md`

Rules for filling this in:
- Be concrete: "Card layout, not timeline" not "modern and clean"
- Every locked decision must have a stable ID (D1, D2...)
- Code context must cite actual file paths found during the scout
- Do not leave any section as "Tbr" or placeholder — remove unused sections instead

---

## Template

```markdown
# <Feature Name> — Context

**Feature slug:** <kebab-case-slug>
**Date:** YYYY-MM-DD
**Exploring session:** complete
**Scope:** Quick | Standard | Deep

---

<domain>
## Feature Boundary

[One clear sentence: what this feature delivers and where it ends.
This is the scope anchor — planning must not exceed it.]

**Domain type(s):** SEE | CALL | RUN | READ | ORGANIZE
</domain>

---

<decisions>
## Locked Decisions

These are fixed. Planning must implement them exactly. No creative reinterpretation.

### <Category that emerged from discussion>
- **D1** [Specific, concrete decision — not a preference]
  *Rationale: [Why the user chose this, if relevant to implementation]*

- **D2** [Specific, concrete decision]
  *Rationale: [optional]*

### <Next category>
- **D3** [Decision]

### Agent's Discretion
[Areas where the user said "you decide" — list what was delegated and any constraints]
</decisions>

---

<specifics>
## Specific Ideas & References

[Things the user said like "I want it like X" or "similar to Y feature".
Link to mockups, examples, or external references if mentioned.]
</specifics>

---

<code_context>
## Existing Code Context

From the quick codebase scout during exploring.
Downstream agents: read these files before planning to avoid reinventing existing patterns.

### Reusable Assets
- `path/to/component.tsx` — [what it does, how it applies]
- `path/to/hook.ts` — [what it does, how it applies]

### Established Patterns
- [Pattern name]: [where it's used, what it means for new work]

### Integration Points
- [Where new code connects to existing system — file path + what to call/extend]
</code_context>

---

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

- `path/to/spec.md` — [What this defines]
- `path/to/adr.md` — [What architectural decision this records]
- `path/to/design-doc.md` — [What design this describes]

*[Remove section if no canonical references exist]*
</canonical_refs>

---

<outstanding_questions>
## Outstanding Questions

### Resolve Before Planning
[Product decisions that must be answered before the planner can start.
Leave blank or remove section if none.]

- [ ] [Question] — [Why it blocks planning]

### Deferred to Planning
[Technical questions better answered with codebase access or research.
The planner investigates these — they do NOT block handoff.]

- [ ] [Question] — [What kind of investigation will answer it]
</outstanding_questions>

---

<deferred>
## Deferred Ideas

[Out-of-scope ideas that surfaced during the exploring session.
Captured here to prevent loss. Each is its own future work item.]

- [Idea] — [Brief note on why it was deferred]
</deferred>

---

## Handoff Note

CONTEXT.md is the single source of truth for this feature.

- **planning** reads: locked decisions, code context, canonical refs, deferred-to-planning questions
- **validating** reads: locked decisions (to verify plan-checker coverage)
- **reviewing** reads: locked decisions (for UAT verification)

Decision IDs (D1, D2...) are stable. Reference them by ID in all downstream artifacts.
```
