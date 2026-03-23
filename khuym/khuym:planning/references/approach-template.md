# Approach: <Feature Name>

**Date**: <YYYY-MM-DD>
**Feature**: <feature-slug>
**Based on**:
- `history/<feature>/discovery.md`
- `history/<feature>/CONTEXT.md`

---

## 1. Gap Analysis

> What exists vs. what the feature requires.

| Component | Have | Need | Gap Size |
|-----------|------|------|----------|
| [e.g., User entity] | `packages/domain/src/entities/user.ts` | `Subscription` entity | New — model after User |
| [e.g., Stripe SDK] | None | `stripe` npm package + types | New — external dep |
| [e.g., Webhook route] | None | `/api/webhooks/stripe` endpoint | New — novel pattern |
| [e.g., Billing UI] | None | Plan selection page | New — follow existing routes |

---

## 2. Recommended Approach

> Specific strategy. Not "here are options" — a concrete recommendation.

`<Description of recommended approach in 3-5 sentences. Include the key architectural decision and why it's the right call for this codebase.>`

### Why This Approach

- `<Reason 1>` — connects to existing pattern at `<file>`
- `<Reason 2>` — honors locked decision D<N> from CONTEXT.md
- `<Reason 3>` — avoids gotcha identified in discovery (Agent D)

### Key Architectural Decisions

> These decisions are embedded in bead descriptions so workers don't re-derive them.

| Decision | Choice | Rationale |
|----------|--------|-----------|
| [e.g., State management] | [e.g., Zustand] | [e.g., Locked in CONTEXT.md D3; existing pattern in `apps/web`] |
| [e.g., Error strategy] | [e.g., Result type] | [e.g., Matches existing error handling in `packages/contracts`] |
| ... | ... | ... |

---

## 3. Alternatives Considered

> What was evaluated and rejected. Important: bead workers see this and understand why the chosen approach is non-negotiable.

### Option A: `<Name>`

- Description: `<brief>`
- Why considered: `<why it seemed reasonable>`
- Why rejected: `<specific technical reason>`

### Option B: `<Name>`

- Description: `<brief>`
- Why considered: `<why it seemed reasonable>`
- Why rejected: `<specific technical reason>`

---

## 4. Risk Map

> Every component that is part of this feature must appear here.
> Workers use this to calibrate how carefully to proceed.

| Component | Risk Level | Reason | Verification Needed |
|-----------|------------|--------|---------------------|
| [e.g., Stripe SDK] | **HIGH** | New external dep, no existing pattern | Spike (handled by khuym:validating skill) |
| [e.g., Webhook handler] | **HIGH** | Security-critical, novel pattern | Spike (handled by khuym:validating skill) |
| [e.g., Subscription entity] | **LOW** | Follows User entity pattern exactly | Proceed |
| [e.g., oRPC billing router] | **LOW** | Existing router pattern | Proceed |
| [e.g., S3 file upload] | **MEDIUM** | Variation of existing storage pattern | Interface sketch optional |

### Risk Classification Reference

```
Pattern in codebase?        → YES = LOW base
External dependency?        → YES = HIGH
Blast radius > 5 files?    → YES = HIGH
Otherwise                   → MEDIUM
```

### HIGH-Risk Summary (for khuym:validating skill)

> The khuym:validating skill will create spikes for these items. List them clearly.

- `<Component>`: `<specific question the spike must answer>`
- `<Component>`: `<specific question the spike must answer>`

_If none: "No HIGH-risk components. Validating may skip spike phase."_

---

## 5. Proposed File Structure

> Where new files will live. Workers use this to plan their work.

```
packages/
  domain/
    src/
      entities/<name>.ts          # New entity
      ports/<name>-repository.ts  # New port/interface
  application/
    src/
      usecases/<verb>-<name>.ts   # New use case(s)
  infrastructure/
    src/
      db/<name>-repository.ts     # New DB implementation
  db/
    src/
      schema/<name>.ts            # New Drizzle schema
  api/
    src/
      routers/<name>.ts           # New API router
apps/
  web/
    src/
      routes/<feature>/           # New UI routes
```

---

## 6. Dependency Order

> Dependency order for bead creation. This is planning guidance, not a runtime wave scheduler.

```
Layer 1 (parallel): Domain — entities, ports (no deps)
Layer 2 (parallel): Infrastructure — DB schema, repository impl (depends on Layer 1)
Layer 3 (sequential): Application — use cases (depends on Layer 2)
Layer 4 (parallel): API + External integration (depends on Layer 3)
Layer 5 (sequential): UI (depends on Layer 4)
```

### Parallelizable Groups

- Group A: `<bead 1>`, `<bead 2>` — no dependencies between them
- Group B: `<bead 3>` — depends on Group A completing
- Group C: `<bead 4>` — depends on Group A, can run parallel to Group B

---

## 7. Institutional Learnings Applied

> From Phase 0 — how past learnings shaped this approach.

| Learning Source | Key Insight | How Applied |
|-----------------|-------------|-------------|
| `history/learnings/<file>` | `<gotcha or pattern>` | `<how this approach or specific bead accounts for it>` |

_If none applied: "No prior institutional learnings relevant to this feature."_

---

## 8. Open Questions for Validating

> Items that couldn't be resolved in planning. The khuym:validating skill's plan-checker will address these.

- [ ] `<Question>` — `<why it matters for execution>`
- [ ] `<Question>` — `<impact if wrong>`

_If none: "No open questions. Plan is complete."_
