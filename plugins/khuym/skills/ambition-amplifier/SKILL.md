---
name: ambition-amplifier
description: Challenge and improve the ambition, outcome framing, and feasibility of a user's current task or prompt. Use only when the user explicitly invokes this skill or asks to amplify/reframe a prompt; never trigger for routine implementation.
---

# Ambition Amplifier

## Purpose
Turn a task-oriented request into a set of better-framed choices without confusing bigger scope with better outcomes. This is a **planning and reframing** skill, not an implementation skill.

## Invocation
Use only when the user explicitly asks for this skill, e.g. `$ambition-amplifier`, or explicitly asks to amplify an existing prompt. When invoked without a quoted prompt, use the user's latest substantive request as the input. Do not automatically invoke for ordinary coding or debugging.

## Process
1. **Extract the original intention.** In 1–2 sentences, identify the requested task, intended beneficiary, expected outcome, and known constraints. Distinguish facts from assumptions.
2. **Challenge the framing** across four dimensions:
   - **Altitude:** What meaningful outcome lies behind the requested deliverable? Is the user optimizing a proxy?
   - **Depth:** What evidence, expert methods, raw data, tests, benchmarks, or independent checks would materially improve the result?
   - **Range:** Would methods from another discipline alter the approach? Include only genuinely useful connections.
   - **Speed:** What can be simplified, automated, or eliminated? Speed is subordinate to outcome quality.
3. **Generate exactly three options:**
   - **L1 — Original:** Faithful to the stated request, with clearer success criteria.
   - **L2 — Enhanced:** Higher-value outcome with modest additional capabilities or effort.
   - **L3 — Reimagined:** A fundamentally different, outcome-oriented approach where justified. Do not inflate scope for spectacle.
4. **Reality check:** For each option, briefly identify key dependencies, effort/complexity, risks, verification method, and expected upside. Never imply tools, access, or autonomy that the agent does not have.
5. **Recommend** the option with the best expected impact relative to cost and risk, not automatically L3. State the single biggest uncertainty and the smallest experiment that could resolve it.
6. **Write the upgraded prompt** for the recommended option. Make it executable: objective, context, constraints, available evidence/tools, success criteria, verification, and stopping conditions. Preserve all explicit user constraints.

## Default response format
- **What you're really trying to achieve:** 1–2 sentences.
- **Framing opportunities:** Altitude / Depth / Range / Speed (brief; omit dimensions with no meaningful change).
- **Three levels:** A compact comparison of outcome, effort, verification, and risk.
- **Recommendation:** Why this level, what remains uncertain, and a minimal test.
- **Upgraded prompt:** A copy-ready prompt.

Stay concise. Avoid performative expert personas, agent swarms, inflated architectures, and needless documentation. Ask a question only if a missing fact prevents a useful comparison; otherwise state assumptions and proceed.

## Safety and autonomy
- **Do not execute** the upgraded task unless the user separately asks to proceed.
- Do not change requirements silently, spend money, contact external services, deploy, or mutate a repository as part of reframing.
- Prefer objective external tests over an agent grading its own output.
- If the original prompt already targets the right outcome, say so; L2/L3 may be deliberately modest.
- Treat the user's time, budget, and maintenance burden as first-class constraints.

## Example
Input: `Create a dashboard to monitor crashes for our mobile game.`

- L1: Build a crash dashboard by release, device, OS, and severity; verify against raw crash data.
- L2: Detect crash-rate anomalies, cluster root causes, and produce actionable incident tickets; verify alert precision on historical incidents.
- L3: Build a gated reliability loop that investigates incidents, suggests fixes, and validates them against reproducible tests; humans approve changes and releases.

Recommendation might be L2 if data and historical incident records exist, while L3 lacks reproducible crash environments and trustworthy release gates.
