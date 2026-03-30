# Khuym Skills

Khuym is a Codex plugin repo that packages a validate-first workflow for agentic software development. The installable Codex plugin in this repository is `khuym`, shipped at [`plugins/khuym/`](plugins/khuym/).

Khuym is built for teams that want to turn ambiguous requests into reviewed, production-ready changes without skipping planning or quality gates.

## Current Situation

Khuym is not a greenfield framework. It sits downstream of several strong agentic-development systems and distills the parts that fit this repo owner's actual workflow.

- **[Flywheel](https://agent-flywheel.com/complete-guide)** contributes the operational backbone: beads, `bv`, Agent Mail, swarm execution, and the habit of turning plans into live work graphs instead of loose TODO lists.
- **[GSD](https://github.com/gsd-build/get-shit-done)** contributes the philosophy: discuss first, research second, plan third, and do not execute until the plan has been verified.
- **[Compound Engineering](https://github.com/EveryInc/compound-engineering-plugin)** contributes parallel review, severity-based findings, and the compound-learning loop that feeds future work.
- **[Superpowers](https://github.com/obra/superpowers)** contributes skill design patterns, Socratic extraction, and the idea that skills should be strong enough to shape agent behavior consistently.
- **V3 synthesis** contributes the bias to prove risky ideas early instead of discovering blockers halfway through execution.

The important point is that Khuym does not try to mirror any one upstream framework exactly. It selects the pieces that hold up in practice, removes generic abstraction where it weakens the flow, and reassembles them into a single opinionated chain.

## How Khuym Distills Those Frameworks

Khuym turns upstream ideas into a custom workflow contract rather than a loose bundle of inspirations:

1. It makes `CONTEXT.md` the source of truth so downstream skills execute against locked decisions rather than reinterpreting intent at every step.
2. It promotes validation into its own first-class skill, `khuym:validating`, because the GSD lesson is structural: plans should not execute until they pass verification.
3. It keeps Flywheel's swarm and bead infrastructure, but reshapes it into explicit Khuym skill boundaries: `exploring`, `planning`, `validating`, `swarming`, `executing`, `reviewing`, and `compounding`.
4. It absorbs review, finish, and learning capture into one continuous workflow so the system does not stop at "code was written"; it closes only after verification and compounding.

## Workflow First

Khuym treats software delivery as a staged chain where each skill hands off explicit artifacts to the next stage:

- `khuym:exploring` extracts decisions and locks them in `CONTEXT.md`
- `khuym:planning` researches and decomposes implementation into executable beads
- `khuym:validating` verifies the plan and bead graph before execution begins
- `khuym:swarming` launches and coordinates worker subagents
- `khuym:executing` runs the worker loop (claim, reserve, implement, verify, close)
- `khuym:reviewing` performs multi-agent review plus acceptance checks
- `khuym:compounding` captures learnings for future work

```mermaid
flowchart LR
    A[User Request] --> B[khuym:exploring]
    B --> G1{GATE 1<br/>Approve CONTEXT.md?}
    G1 -->|Yes| C[khuym:planning]
    G1 -->|Revise| B
    C --> D[khuym:validating]
    D --> G2{GATE 2<br/>Approve execution?}
    G2 -->|Yes| E[khuym:swarming]
    G2 -->|Revise| C
    E --> F[khuym:executing xN]
    F --> H[khuym:reviewing]
    H --> G3{GATE 3<br/>P1 findings fixed?}
    G3 -->|Yes| I[khuym:compounding]
    G3 -->|No| F
    I --> J[Reviewed, shipped, compounded]
```

```
khuym:exploring → khuym:planning → khuym:validating → khuym:swarming → khuym:executing(×N) → khuym:reviewing → khuym:compounding
```

The main differentiator is that execution is intentionally gated: the system does not proceed from planning into implementation until validation passes.

## Human Gates

- **GATE 1** (after exploring): "Approve decisions/CONTEXT.md?"
- **GATE 2** (after validating): "Beads verified. Approve execution?"
- **GATE 3** (after reviewing): "P1 findings. Fix before merge?"

## Compact Workflow Example

1. `khuym:exploring` captures the decisions and constraints for a feature.
2. `khuym:planning` and `khuym:validating` turn those decisions into verified executable beads.
3. `khuym:swarming` and `khuym:executing` implement the work in parallel with reservations and bead status updates.
4. `khuym:reviewing` enforces quality gates, then `khuym:compounding` captures reusable learnings.

## Where The Contract Lives

The README is the top-level overview. The operational contract lives in the repo docs:

- [`AGENTS.md`](AGENTS.md) defines the live Khuym chain, gates, bead workflow, and session rules.
- [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md) is the canonical architecture and vocabulary contract.
- [`CONTRIBUTING.md`](CONTRIBUTING.md) covers skill format, marketplace packaging, and documentation checks.

## Install In Codex

This repo now ships a Codex-standard repo marketplace in [`.agents/plugins/marketplace.json`](.agents/plugins/marketplace.json) and a packaged plugin at [`plugins/khuym/.codex-plugin/plugin.json`](plugins/khuym/.codex-plugin/plugin.json).

### Standard Install Flow

Codex plugins are installed from a local marketplace. The standard flow is:

1. Clone this repository locally:
   ```bash
   git clone https://github.com/hoangnb24/skills.git
   cd skills
   ```
2. In Codex, add this repository's marketplace file:
   ```text
   /absolute/path/to/skills/.agents/plugins/marketplace.json
   ```
3. Restart Codex if the new marketplace does not appear immediately.
4. Install the `khuym` plugin from that marketplace.
5. Start a new Codex session and ask for a Khuym workflow task.

The canonical skill layout lives directly under [`plugins/khuym/skills/`](plugins/khuym/skills).

### Verify The Plugin Layout

This repo follows the standard Codex plugin structure:

- Repo marketplace: [`.agents/plugins/marketplace.json`](.agents/plugins/marketplace.json)
- Plugin manifest: [`plugins/khuym/.codex-plugin/plugin.json`](plugins/khuym/.codex-plugin/plugin.json)
- Plugin skills: [`plugins/khuym/skills/`](plugins/khuym/skills)

There is no standard OpenAI-documented "install directly from a GitHub URL" flow for Codex plugins. The supported pattern is to clone the repo locally, add its marketplace, then install the plugin from that marketplace.

## Install In Claude Code

This repo still ships a Claude Code plugin marketplace in [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json).

### Inside Claude Code

```text
/plugin marketplace add hoangnb24/skills
/plugin install khuym:using-khuym@khuym
```

## Skill Catalog

### Main Chain

These are the core delivery stages in the Khuym workflow:

| Skill | Purpose |
|-------|---------|
| `khuym:exploring` | Socratic dialogue → locked decisions in CONTEXT.md |
| `khuym:planning` | Research + synthesis → approach.md + beads |
| `khuym:validating` | Plan verification (8 dims) + spikes + bead polishing — **THE GATE** |
| `khuym:swarming` | Launch + tend parallel worker agents via Agent Mail |
| `khuym:executing` | Per-agent worker loop: priority → reserve → implement → close |
| `khuym:reviewing` | Specialist review passes + 3-level verification + UAT |
| `khuym:compounding` | Capture learnings → history/learnings/ |

### Bootstrap, Support, And Meta Skills

These skills support the main chain without replacing it:

| Skill | Purpose |
|-------|---------|
| `khuym:using-khuym` | Bootstrap meta-skill — routing, go mode, state resume |
| `khuym:dream` | Manual dream consolidation pass over Codex artifacts and learnings (support) |
| `khuym:debugging` | Systematic debugging for blocked workers (support) |
| `khuym:gkg` | Codebase intelligence via gkg tool (support) |
| `khuym:writing-khuym-skills` | TDD-for-skills meta-skill |

`khuym:dream` is intentionally outside the main execution chain. It runs on demand, consolidates durable lessons into `history/learnings/`, uses a bootstrap-first scan model with recurring bounded updates after provenance exists, and never edits `history/learnings/critical-patterns.md` without explicit approval.

### Standalone Skills

Standalone skills remain available, but they are intentionally secondary to the Khuym chain in this repo's top-level narrative.

| Skill | Description |
|-------|-------------|
| `book-sft-pipeline` | Convert books into SFT datasets for training style-transfer models |
| `prompt-leverage` | Upgrade raw prompts into stronger execution-ready prompts |

## Requirements

- **Core tools:** `br` (beads CLI), `bv` (bead viewer), Agent Mail MCP server
- **Optional:** `gkg` (codebase intelligence), CASS/CM (session search)

## Documentation Checks

When you change public docs in this repo, keep links repository-relative and environment-agnostic.

## License

MIT
