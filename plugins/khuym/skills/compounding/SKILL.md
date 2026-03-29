---
name: khuym:compounding
description: >-
  Capture learnings from completed feature work to make future work easier.
  Invoke after reviewing completes and the feature is merged. Runs three parallel
  analysis subagents (patterns/decisions/failures), synthesizes into
  history/learnings/YYYYMMDD-<slug>.md, promotes critical items to
  critical-patterns.md. Trigger phrases: what did we learn, capture learnings,
  compound, lessons learned, document what we found, khuym:compounding skill.
  Key output: critical-patterns.md is read by every planning and exploring
  Phase 0 — this is the flywheel that makes the ecosystem smarter over time.
metadata:
  version: '1.0'
  ecosystem: khuym
  position: '8 of 9 — runs after reviewing, before next feature'
---

# Compounding Skill

If `.khuym/onboarding.json` is missing or stale for the current repo, stop and invoke `khuym:using-khuym` before continuing.

Research shows that engineering teams who systematically capture and re-inject learnings reduce
time-to-complete on subsequent features by 30–50% ([Compound Engineering, Every.to](https://every.to/guides/compound-engineering)).
This skill closes the loop. Each feature that runs through compounding makes the next one cheaper.
Skip this step and the ecosystem stays flat. Run it and it gets smarter every cycle.

## When to Use This Skill

Invoke after `khuym:reviewing` completes and the feature is merged (or abandoned with lessons).
Also invoke after any debugging session that surfaced a non-obvious root cause.
Skip only for trivial one-line changes where nothing reusable emerged.

---

## Process

Complete these phases in order. The three-agent analysis (Phase 2) runs in parallel.

---

### Phase 1: Gather Context

Collect all artifacts from the completed feature. Read:

```
history/<feature>/CONTEXT.md          ← locked decisions (what we committed to)
history/<feature>/discovery.md        ← research findings (what we learned before coding)
history/<feature>/approach.md         ← synthesis + risk map (how we planned to do it)
.khuym/STATE.md or HANDOFF artifacts  ← runtime coordination state, if retained
.beads/ or `br show` output           ← the executable work graph we actually ran
```

Also read any review output written by the `khuym:reviewing` skill, including P1/P2/P3 findings.
If debug notes exist from `khuym:debugging` skill invocations for this feature, read those too.

Run this git command to get the feature's commit history:

```bash
git log --oneline feature/<feature-name>..main  # or the merged branch range
```

Build an internal summary: what was built, what risks were flagged, what surprises emerged.

**If no history files exist:** fall back to reading the conversation/session summary and
recent git diff. Compounding is still valuable even with partial context.

---

### Phase 2: Three-Category Analysis (3 Parallel Subagents)

Launch three subagents simultaneously using the canonical `Subagent(...)` contract. Each writes findings to a temp file.
Do NOT have subagents write the final learnings file — only the orchestrator writes that.

---

#### Agent 1: Pattern Extractor

**Task for Agent 1:**

```
Read the feature artifacts provided. Identify all REUSABLE PATTERNS that emerged:

- Code patterns: new functions, utilities, abstractions worth standardizing
- Architecture patterns: structural decisions that worked and should be repeated
- Process patterns: workflow approaches that saved time or prevented errors
- Integration patterns: how this feature connected to other systems

For each pattern:
1. Name it concisely
2. Describe what it does and why it's valuable
3. Note the specific file/location where it was first used (if applicable)
4. State "applicable-when": under what conditions should future agents use this?

Write findings to: /tmp/compounding-patterns.md
```

---

#### Agent 2: Decision Analyst

**Task for Agent 2:**

```
Read the feature artifacts provided. Identify all significant DECISIONS made during this work:

- Good calls: decisions that proved correct, saved time, or prevented problems
- Bad calls: decisions that were wrong, required rework, or added unnecessary complexity
- Surprises: things that turned out differently than expected (either direction)
- Trade-offs accepted: conscious choices where alternatives were considered

For each decision:
1. State the decision clearly (what was chosen vs what was rejected)
2. Describe how it played out in practice
3. Tag as: GOOD_CALL | BAD_CALL | SURPRISE | TRADEOFF
4. State the recommendation for future work

Write findings to: /tmp/compounding-decisions.md
```

---

#### Agent 3: Failure Analyst

**Task for Agent 3:**

```
Read the feature artifacts provided. Identify all FAILURES, BLOCKERS, and WASTED EFFORT:

- Bugs introduced and their root causes
- Wrong assumptions that required backtracking
- Blockers encountered and how they were resolved (or not)
- Wasted effort: work done that turned out unnecessary
- Missing prerequisites discovered mid-execution
- Test gaps that allowed regressions

For each failure:
1. Describe what went wrong
2. Identify the root cause (not just the symptom)
3. State how long it blocked progress (estimate)
4. Write the prevention rule: what should future agents do differently?

Write findings to: /tmp/compounding-failures.md
```

---

### Phase 3: Synthesis & Triage

After all three agents complete, the orchestrator:

**Step 3.1 — Read all three temp files:**
```
/tmp/compounding-patterns.md
/tmp/compounding-decisions.md
/tmp/compounding-failures.md
```

**Step 3.2 — Triage each finding:**

Tag every learning with:
- `domain`: which technical or process domain (e.g., `auth`, `database`, `testing`, `bead-decomposition`, `agent-coordination`)
- `severity`: `critical` (affects multiple features, prevents serious waste, or reveals systemic risk) vs `standard` (valuable but feature-specific)
- `applicable-when`: concise condition for when future agents should apply this learning
- `category`: `pattern` | `decision` | `failure`

**Step 3.3 — Determine slug:**

Create a short, descriptive slug: `<primary-topic>-<secondary-topic>` (e.g., `auth-token-refresh`, `bead-scope-isolation`, `db-migration-ordering`).

**Step 3.4 — Write the learnings file:**

```
history/learnings/YYYYMMDD-<slug>.md
```

Use the format from `references/learnings-template.md`. Include YAML frontmatter.

One learnings file per feature. Group related findings within that file — do NOT create
separate files per finding.

---

### Phase 4: Promote Critical Learnings

For every finding tagged `severity: critical`:

**Promotion criteria (only promote if ALL are true):**
- Affects more than one potential future feature (not just this specific codebase area)
- Would cause meaningful wasted effort if future agents didn't know it
- Is generalizable — not so implementation-specific it's useless elsewhere

**If criteria met, append to `history/learnings/critical-patterns.md`:**

```markdown
## [YYYYMMDD] <Learning Title>
**Category:** pattern | decision | failure
**Feature:** <feature-name>
**Tags:** [tag1, tag2]

<2-4 sentence summary of the learning and what to do differently>

**Full entry:** history/learnings/YYYYMMDD-<slug>.md
```

**If `critical-patterns.md` does not exist yet, create it with this header:**

```markdown
# Critical Patterns

Promoted learnings from completed features. Read this file at the start of every
planning Phase 0 and every exploring Phase 0. These are the lessons that cost the
most to learn and save the most by knowing.

---
```

---

### Phase 5: Optional CASS / CM Integration

These steps are optional. Check `.khuym/config.json` for `cass_enabled` and `cm_enabled` flags.
If the config file is absent, skip both.

**If CASS is available:**
```
Index the session: provide the learnings file path to CASS for future semantic search.
This enables future agents to retrieve relevant learnings by description, not just by tag.
```

**If CM (Cognitive Memory) is available:**
```
Store each critical-severity learning as a cognitive memory entry.
Use the learning title as the memory key.
```

The file-based learnings are the primary system. CASS/CM are acceleration layers.

---

### Phase 6: Update STATE.md

Update `.khuym/STATE.md` to record that compounding ran:

```markdown
## Last Compounding Run
- Feature: <feature-name>
- Date: YYYY-MM-DD
- Learnings file: history/learnings/YYYYMMDD-<slug>.md
- Critical promotions: N (or 0)
```

---

## Handoff

```
Compounding complete.
- Learnings: history/learnings/YYYYMMDD-<slug>.md
- Critical promotions: N findings added to critical-patterns.md
- The ecosystem now has [N total] accumulated learnings.

Next feature starts with this knowledge available.
```

---

## Red Flags

**Do NOT skip compounding because "we're in a hurry."**
The compound loop only works if it runs every cycle. One skip is fine;
a habit of skipping means the ecosystem never gets smarter.

**Do NOT promote everything as critical.**
critical-patterns.md is read at the start of every session. If it grows
past 20–30 entries it becomes noise. Only promote learnings that would
have saved ≥ 30 minutes if known in advance.

**Do NOT write generic learnings.**
"Test more carefully" is worthless. "When migrating database columns with
a non-null constraint, always provide a default in the migration or it
will fail in production with zero rows affected" is valuable.

**Do NOT fabricate findings.**
If the feature ran smoothly with no surprises, write that. A short learnings
file with 2 genuine entries is better than a long file with invented ones.

---

## References

- `references/learnings-template.md` — full template for learnings files with YAML frontmatter
