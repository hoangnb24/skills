# Skills

Development workspace for Claude Code skills — both the **Khuym** agentic development ecosystem and standalone utilities.

## Skill Families

### Khuym Ecosystem (`khuym/`)

A 9+2 skill chain for agentic software development, built on beads (`br`), bead viewer (`bv`), and Agent Mail. Skills chain together to move from vague requirements to shipped, reviewed, compounded code.

```
khuym:exploring → khuym:planning → khuym:validating → khuym:swarming → khuym:executing(×N) → khuym:reviewing → khuym:compounding
```

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

## Deployment

Skills are deployed to `~/.claude/skills/` via symlinks:

```bash
bash scripts/sync-skills.sh          # deploy all skills
bash scripts/sync-skills.sh --dry-run # preview without changes
```

## Requirements

- **Core tools:** `br` (beads CLI), `bv` (bead viewer), Agent Mail MCP server
- **Optional:** `gkg` (codebase intelligence), CASS/CM (session search)

## License

MIT
