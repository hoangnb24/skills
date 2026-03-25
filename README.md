# Khuym Skills

Khuym is a validate-first workflow for agentic software development. It is built for teams that want to turn ambiguous requests into reviewed, production-ready changes without skipping planning or quality gates.

This repository is the working surface for that system. The root README is the front door for the workflow; [`docs/architecture/ARCHITECTURE.md`](/Users/themrb/Documents/personal/skills/docs/architecture/ARCHITECTURE.md) is the detailed canonical contract.

## Workflow First

Khuym treats software delivery as a staged chain where each skill hands off explicit artifacts to the next stage:

- `khuym:exploring` extracts decisions and locks them in `CONTEXT.md`
- `khuym:planning` researches and decomposes implementation into executable beads
- `khuym:validating` verifies the plan and bead graph before execution begins
- `khuym:swarming` launches and coordinates worker subagents
- `khuym:executing` runs the worker loop (claim, reserve, implement, verify, close)
- `khuym:reviewing` performs multi-agent review plus acceptance checks
- `khuym:compounding` captures learnings for future work

```
khuym:exploring → khuym:planning → khuym:validating → khuym:swarming → khuym:executing(×N) → khuym:reviewing → khuym:compounding
```

The main differentiator is that execution is intentionally gated: the system does not proceed from planning into implementation until validation passes.

## Human Gates

- **GATE 1** (after exploring): "Approve decisions/CONTEXT.md?"
- **GATE 2** (after validating): "Beads verified. Approve execution?"
- **GATE 3** (after reviewing): "P1 findings. Fix before merge?"

## Skill Families

### Khuym Ecosystem (`khuym/`)

The Khuym ecosystem is the primary story in this repository: a coordinated chain built around beads (`br`), bead viewer (`bv`), and Agent Mail.

| Skill | Purpose |
|-------|---------|
| `khuym:using-khuym` | Bootstrap meta-skill — routing, go mode, state resume |
| `khuym:exploring` | Socratic dialogue → locked decisions in CONTEXT.md |
| `khuym:planning` | Research + synthesis → approach.md + beads |
| `khuym:validating` | Plan verification (8 dims) + spikes + bead polishing — **THE GATE** |
| `khuym:swarming` | Launch + tend parallel worker agents via Agent Mail |
| `khuym:executing` | Per-agent worker loop: priority → reserve → implement → close |
| `khuym:reviewing` | 5 review agents + 3-level verification + UAT |
| `khuym:compounding` | Capture learnings → history/learnings/ |
| `khuym:writing-khuym-skills` | TDD-for-skills meta-skill |
| `khuym:debugging` | Systematic debugging for blocked workers (support) |
| `khuym:gkg` | Codebase intelligence via gkg tool (support) |

**Go Mode Gates:**
- **GATE 1** (after exploring): "Approve decisions/CONTEXT.md?"
- **GATE 2** (after validating): "Beads verified. Approve execution?"
- **GATE 3** (after reviewing): "P1 findings. Fix before merge?"

See `AGENTS.md` for the full operating manual.

### Standalone Skills (`standalone/`)

Independent utility skills not part of the khuym chain.

| Skill | Description |
|-------|-------------|
| `book-sft-pipeline` | Convert books into SFT datasets for training style-transfer models |
| `prompt-leverage` | Upgrade raw prompts into stronger execution-ready prompts |

## Skill Format

Every skill is a directory with a `SKILL.md` file:

```
skill-name/
├── SKILL.md              ← Required: YAML frontmatter + markdown body
├── references/           ← Optional: supporting docs loaded at runtime
├── scripts/              ← Optional: executable scripts
└── agents/               ← Optional: subagent configurations
```

### SKILL.md Frontmatter

```yaml
---
name: skill-name
description: >-
  Trigger description. Claude matches user intent against this text.
  Include trigger phrases and use cases.
metadata:                 # optional
  version: '1.0'
  ecosystem: khuym
---
```

See `CONTRIBUTING.md` for the full skill creation guide.

## Install In Claude Code

This repo ships a Claude Code plugin marketplace in [`.claude-plugin/marketplace.json`](/Users/themrb/Documents/personal/skills/.claude-plugin/marketplace.json).

### Inside Claude Code (recommended)

```text
/plugin marketplace add hoangnb24/skills
/plugin install khuym:using-khuym@skills
```

## Direct Skill Sync

If you want the raw skill directories linked into `~/.claude/skills/` for local development, use the sync script:

```bash
bash scripts/sync-skills.sh
bash scripts/sync-skills.sh --dry-run
```

## Requirements

- **Core tools:** `br` (beads CLI), `bv` (bead viewer), Agent Mail MCP server
- **Optional:** `gkg` (codebase intelligence), CASS/CM (session search)

## License

MIT
