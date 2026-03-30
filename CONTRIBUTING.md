# Creating Skills

This guide covers the skill format, directory conventions, and how this repo packages skills for Codex and Claude Code.

## Plugin Packaging Overview

This repository is a Codex plugin repo. The installable Codex plugin is `khuym`.

- Codex plugin root: [`plugins/khuym/`](plugins/khuym/)
- Codex plugin manifest: [`plugins/khuym/.codex-plugin/plugin.json`](plugins/khuym/.codex-plugin/plugin.json)
- Repo marketplace: [`.agents/plugins/marketplace.json`](.agents/plugins/marketplace.json)

## How Skills Work

The canonical skill directories live under [`plugins/khuym/skills/`](plugins/khuym/skills).

- Codex consumes the packaged plugin under [`plugins/khuym/.codex-plugin/plugin.json`](plugins/khuym/.codex-plugin/plugin.json), with the repo marketplace defined in [`.agents/plugins/marketplace.json`](.agents/plugins/marketplace.json).
- Claude Code can still consume raw symlinked skills from `~/.claude/skills/*/SKILL.md` or the legacy Claude plugin metadata in [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json).

In both environments, the `description` field from the YAML frontmatter is the trigger text that determines when a skill is selected.

## Documentation Checks

Markdown links in this repo should stay repository-relative and environment-agnostic. Do not commit absolute local filesystem paths such as `/Users/...` in rendered docs.

Keep documentation links repository-relative and environment-agnostic.

This repo treats these as errors:
- a Markdown link uses an absolute local path
- a repository-relative Markdown link points to a missing target

## SKILL.md Structure

Every skill requires a `SKILL.md` file with YAML frontmatter and a markdown body:

```yaml
---
name: my-skill                      # public skill name shown to the agent
description: >-                     # CRITICAL: this is the trigger text
  One paragraph explaining when to use this skill.
  Include concrete trigger phrases the user might say.
  Claude matches user intent against this description.
---

# My Skill

Operational instructions go here. This body is loaded when the skill is invoked.

## When to Use

- Specific scenarios where this skill applies
- Trigger phrases: "do X", "help with Y"

## Process

Step-by-step instructions Claude follows when executing this skill.

## Red Flags

Behaviors to watch for and correct during execution.
```

## Required Fields

| Field | Purpose |
|-------|---------|
| `name` | Public skill identifier used by the agent; may include a namespace prefix such as `khuym:` |
| `description` | Trigger text for skill matching. Include use cases and trigger phrases |

## Optional Frontmatter Fields

| Field | Example | Purpose |
|-------|---------|---------|
| `metadata.version` | `'1.0'` | Skill version tracking |
| `metadata.ecosystem` | `khuym` | Group tag for related skills |
| `metadata.type` | `core \| support \| meta` | Role classification |
| `license` | `MIT` | License declaration |
| `compatibility` | `opencode` | Cross-platform flag |
| `allowed-tools` | `Read, Write, Bash` | Restrict available tools |
| `model` | `claude-sonnet-4-20250514` | Preferred model |
| `mode` | `ultrathink` | Thinking mode preference |
| `references` | `[workers, pages]` | Auto-load reference subdirectories |

## Directory Layout

```
skill-name/
├── SKILL.md              ← REQUIRED
├── references/           ← Supporting documents read at runtime
│   ├── templates.md      ← Templates the skill tells Claude to load
│   └── patterns.md       ← Reference patterns or examples
├── scripts/              ← Executable scripts the skill invokes
│   └── validate.sh
├── agents/               ← Subagent configuration files
│   └── reviewer.yaml
└── README.md             ← Human-facing documentation (not loaded by Claude)
```

### Key conventions

- **`references/`** — Files the skill explicitly tells Claude to read (e.g., "Load `references/template.md` now"). Claude does NOT auto-load these; the SKILL.md body must reference them.
- **`scripts/`** — Shell scripts, Python scripts, or other executables the skill invokes via Bash.
- **`agents/`** — YAML configs for subagent prompts the skill spawns.

## Writing Effective Descriptions

The `description` field is the most important part of a skill. Claude uses it to decide whether to invoke the skill.

**Good description:**
```yaml
description: >-
  Systematic debugging for blocked workers, test failures, build errors,
  runtime crashes, and integration issues. Use when a build fails, a test
  fails, a worker is stuck, or reviewing hands off with a failure.
```

**Bad description:**
```yaml
description: Helps with debugging things
```

Tips:
- List concrete scenarios and trigger phrases
- Include the verbs users would say ("debug", "fix", "diagnose")
- Mention what the skill produces ("writes CONTEXT.md", "creates beads")

## Installing For Testing

Preferred Codex flow:

```bash
git clone https://github.com/hoangnb24/skills.git
cd skills
```

Then:

1. Add the repo marketplace from [`.agents/plugins/marketplace.json`](.agents/plugins/marketplace.json) in Codex
2. Install the `khuym` plugin from that marketplace
3. Restart Codex if the marketplace does not appear immediately

Codex plugins are not installed directly from a GitHub URL. The standard flow is local clone -> local marketplace -> plugin install.

## Adding a Skill to This Repo

1. Create the directory under [`plugins/khuym/skills/`](plugins/khuym/skills):
   ```bash
   mkdir -p plugins/khuym/skills/my-skill/references
   ```
   Use a filesystem-safe folder name. If the public skill name needs a namespace such as `khuym:planning`, keep that in the `name` field and use an unprefixed folder such as `planning/`.

2. Write `SKILL.md` with frontmatter and body

3. Test by asking Codex or Claude something that matches your trigger description

## Testing a Skill

1. Install the local repo marketplace in Codex and install the `khuym` plugin
2. Start a new Codex session
3. Ask something that should trigger the skill
4. Verify Codex discovers and invokes the skill
5. Check that the operational instructions produce the expected behavior

## Khuym-Specific Conventions

Khuym ecosystem skills follow additional conventions:

- **Chain position:** Each skill hands off to the next in the chain (exploring → planning → validating → ...)
- **HARD-GATE blocks:** Non-negotiable behavioral constraints wrapped in `<HARD-GATE>` tags
- **State updates:** Skills update `.khuym/STATE.md` at phase transitions
- **Red Flags section:** Every skill lists behaviors that should trigger immediate correction
- **Handoff message:** Every skill ends with an explicit handoff stating which skill to invoke next
