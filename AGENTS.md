# AGENTS.md — Khuym Skill Ecosystem

Read this file at every session start. Re-read after any context compaction.

## What is Khuym?

A multi-skill ecosystem for agentic software development, built on the Flywheel toolchain (beads/bv/Agent Mail). Nine skills chain together to move from vague requirements to shipped, reviewed, compounded code.

## Skill Catalog

| Skill | Purpose | Invoke When |
|-------|---------|-------------|
| `using-khuym` | Bootstrap/meta — routing, go mode, state bootstrap | Session start, "build feature X" |
| `exploring` | Extract decisions via Socratic dialogue → CONTEXT.md | New feature, unclear requirements |
| `planning` | Research + synthesis + bead creation → approach.md + beads | After exploring, with CONTEXT.md |
| `validating` | Plan verification + spikes + bead polishing — THE GATE | After planning, before execution |
| `swarming` | Launch + tend parallel worker agents | After validating approves beads |
| `executing` | Per-agent worker loop (register → implement → close) | Loaded by workers spawned by swarming |
| `reviewing` | 5 review agents + 3-level verification + UAT + finishing | After swarming completes all beads |
| `compounding` | Capture learnings → history/learnings/ | After reviewing, always |
| `writing-khuym-skills` | TDD-for-skills meta-skill | Creating/improving khuym skills |

### Support Skills

| Skill | Purpose |
|-------|---------|
| `debugging` | Systematic debugging when workers hit blockers |
| `gkg` | Codebase intelligence via gkg tool |

## The Chain

```
exploring → planning → validating → swarming → executing(×N) → reviewing → compounding
```

## Go Mode Gates

- **GATE 1** (after exploring): "Approve decisions/CONTEXT.md?"
- **GATE 2** (after validating): "Beads verified. Approve execution?"
- **GATE 3** (after reviewing): "P1 findings. Fix before merge?"

## Core Tools

- `bd` — beads CLI (create/update/close work items)
- `bv` — beads viewer (graph analytics, priority routing)
- Agent Mail — inter-agent messaging, file reservations
- `gkg` — codebase intelligence (optional)
- CASS/CM — session search, cognitive memory (optional)

## File Conventions

```
.khuym/STATE.md          ← Working memory
.khuym/config.json       ← Feature toggles (absent=enabled)
.khuym/HANDOFF.json      ← Session handoff
history/<feature>/       ← Per-feature artifacts
history/learnings/       ← Accumulated knowledge
.beads/                  ← Bead files
.spikes/                 ← Spike verification results
```

## Critical Rules

1. **Never execute without validating.** GATE 2 is non-negotiable.
2. **CONTEXT.md is the source of truth.** All downstream agents honor locked decisions.
3. **Context budget: >65% → write HANDOFF.json and pause.**
4. **After compaction: re-read this file + CONTEXT.md immediately.**
5. **P1 findings always block merge.** Even in go mode.
