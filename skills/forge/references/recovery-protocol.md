# Recovery Protocol Reference

How to recover from context loss, build failures, stuck states, merge conflicts, API rate limits, and flaky tests.

---

## Context Compaction Recovery

Context compaction occurs when the session's token buffer is pruned by the model to manage context length. The agent loses access to earlier messages but retains tool outputs and its current working memory.

### Detection Signs

- The agent appears to have forgotten a decision made earlier in the session.
- The agent references an earlier message that is no longer in context.
- The agent asks a question that was already answered.
- Behavior changes unexpectedly mid-bead.

### Recovery Sequence

Execute in this exact order. Do not skip steps.

```
1. Read AGENTS.md (full file)
   → Restores: tool blurbs, coordination rules, file reservation protocol,
     session start/end protocol, git conventions.

2. Read CLAUDE.md (full file)
   → Restores: architecture decisions, conventions, anti-patterns,
     validated approaches, tech stack.

3. Read current bead: `br show <id>`
   → Restores: what is being built, implementation approach,
     acceptance criteria, edge cases.

4. Check Agent Mail: `am check_mail`
   → Restores: messages from other agents, any coordination
     decisions made during the session.

5. Run: `git log --oneline -10`
   → Restores: what commits have been made; resume from last commit.

6. Check file reservations: `am list_reservations` (if available)
   → Restores: which files the current session owns vs. which are
     owned by other sessions.
```

**After recovery**: Confirm current state in one sentence — "I am working on bead `<id>`, have completed `<last commit message>`, and am about to `<next action>`." — before resuming.

**If recovery fails** (cannot re-establish state after 10 minutes): Stop, send an Agent Mail message to the human describing the last known state, and wait for instructions.

---

## Build Failure Protocol

A build failure is any failure of a compile step, test suite, linter, or type checker that was passing before the current bead's changes.

### Step 1: Diagnose

```
1. Read the full error message — do not assume the first line is the root cause.
2. Identify: is this a compilation error, a test failure, a type error, or a lint error?
3. Check git diff: `git diff HEAD` — is the failure in code the current bead touched?
4. Check if the failure existed before the bead: `git stash && <build command> && git stash pop`
   → If failure exists before the bead: this is a pre-existing issue. Document it,
     do not own it, and proceed with the bead.
   → If failure is introduced by the bead: own it and fix it.
```

### Step 2: Fix

| Failure Type | First Action |
|-------------|-------------|
| Compilation / syntax error | Fix the specific line. Re-run immediately. |
| Type error | Check if the type change is intentional (spike changed an interface) or accidental. Fix accordingly. |
| Test failure — assertion | Check if the test is wrong (outdated expectation) or the code is wrong. Fix the correct one. |
| Test failure — import/setup | Check if a dependency is missing or an env variable is not set. |
| Lint error | Apply the lint fix. Do not suppress lint rules without understanding why they exist. |

### Step 3: Escalate

If the build failure is not resolved within **30 minutes** of starting diagnosis:

1. Write a "build failure note" in the bead's `notes` field:
   ```
   BUILD FAILURE: [error summary]
   Diagnosed: [root cause theory]
   Attempted fixes: [what was tried]
   Blocked by: [what is still unknown]
   ```
2. Send Agent Mail to the human (or team lead agent): subject "Build failure on bead `<id>`".
3. Do not commit broken code to the feature branch.
4. Optionally: commit to a `debug/<bead-id>` branch for visibility.

---

## Stuck Agent Protocol

An agent is "stuck" when it has been working on the same problem for 15 minutes without making measurable progress — no new commits, no new discoveries, no new hypothesis to test.

### Trigger Condition

No forward progress for 15 minutes on a problem that is not a build failure or rate limit. Examples:
- Repeated failed attempts to get a test to pass.
- Looping through the same possible causes of a bug.
- Cannot find where a piece of logic lives in the codebase.
- Uncertainty about which approach to take with no way to decide.

### Response Protocol

1. **Stop** — do not make another attempt.
2. **Summarize state** — write a "stuck note":
   ```
   STUCK on bead <id> at <timestamp>:
   Problem: [what I am trying to do]
   What I know: [facts established so far]
   What I've tried: [list of attempts with outcomes]
   Current hypothesis: [best current theory about the cause]
   What I need: [what information or decision would unblock me]
   ```
3. **Save progress** — commit any partial work to a `wip/<bead-id>` branch.
4. **Escalate** — send the stuck note via Agent Mail to the human.
5. **Do not resume** until a response is received.

### Common Stuck Scenarios

| Scenario | Resolution |
|----------|-----------|
| Cannot find where logic lives | Run `gkg get_references <symbol>` or grep; if still stuck, ask human for pointer |
| Two valid approaches, unclear which to choose | Present both to human with trade-offs; do not flip-flop independently |
| Test passes locally but fails in CI | Check env differences; if unknown, flag as P1 finding and escalate |
| Third-party API behaves unexpectedly | This is a spike trigger — pause Execute, run a 2-hour Spike, then return |

---

## Merge Conflict Protocol

### Single-Agent Mode

In single-agent mode, merge conflicts are self-owned. The agent resolves them directly.

```
1. Run: git status → identify conflicting files
2. For each file with conflicts:
   a. Read the conflict markers carefully.
   b. Understand BOTH sides: what does HEAD have? what does the incoming branch have?
   c. Resolve by keeping the correct version (or merging both if both are valid additions).
   d. Do NOT blindly accept "ours" or "theirs" — understand the conflict first.
3. Run: git add <resolved files>
4. Run: git commit (merge commit)
5. Re-run the full test suite before proceeding.
```

**Rule**: Never force-push a feature branch that other agents are working on.

### Multi-Session Mode

In multi-session mode, merge conflicts may indicate a file reservation failure — two agents edited the same file.

```
1. STOP current work immediately.
2. Check Agent Mail: was this file reserved by another agent?
   → If yes: contact the other agent via AM to coordinate resolution.
   → If no: the reservation system failed. Resolve manually (see single-agent steps above)
     and file a report so the reservation system can be debugged.
3. Coordinate with the other agent:
   a. One agent proposes the merged version.
   b. The other agent reviews and approves via Agent Mail.
   c. The proposing agent commits the merge.
4. Both agents update their file reservations to reflect the resolved state.
5. Post-mortem: add a note in CLAUDE.md conventions if this conflict reveals a
   boundary that should be formalized (e.g., "File X is always owned by agent track Y").
```

**Prevention**: Always check `am list_reservations` before starting a bead. If a file you need is reserved by another agent, wait or coordinate before touching it.

---

## API Rate Limit Protocol

Rate limits occur when an external API (including the model provider) rejects requests due to quota exhaustion.

### Detection

- HTTP 429 or "rate limit exceeded" in tool output.
- Model response latency spikes dramatically (soft rate limit — throttling).
- Tool call returns a retry-after header or message.

### Response Protocol

```
1. Note the retry-after time if provided.

2. If retry-after ≤ 5 minutes:
   → Pause. Do not retry immediately. Wait the specified time.
   → Use the wait time productively: read files, review the bead, check Agent Mail.
   → Resume after the wait.

3. If retry-after > 5 minutes or no retry-after provided:
   → Option A: Switch to an alternative model if available (check model catalog).
   → Option B: Switch to a different tool or API endpoint that covers the same capability.
   → Option C: If neither is available, pause the session and notify the human via Agent Mail.

4. Never retry in a tight loop. Exponential backoff minimum: 30s, 60s, 120s.

5. If rate limits persist for > 30 minutes: stop the session, commit current state,
   and notify the human.
```

### Common Rate-Limited Operations

| Operation | Mitigation |
|-----------|-----------|
| Model inference | Switch model tier; reduce context size |
| `gkg index` on large codebase | Index incrementally; index only changed files |
| `cass search` with broad query | Narrow query terms |
| External API calls in tests | Mock in unit tests; use integration test suite sparingly |

---

## Flaky Test Protocol

A flaky test is a test that passes and fails non-deterministically without code changes.

### Detection

A test fails on a run after passing on the immediately preceding run (or vice versa), with no changes to the code under test.

### Response Protocol

```
1. Retry once immediately.
   → If it passes on retry: flaky confirmed. Proceed to investigation.
   → If it fails again: this may be a real failure. Treat as a build failure (see above).

2. Investigate the flakiness:
   a. Check for timing dependencies: does the test sleep, poll, or have timeouts?
   b. Check for shared state: does the test rely on global state that other tests mutate?
   c. Check for external dependencies: does the test call a real network, file system, or clock?
   d. Check for ordering dependencies: does the test only pass when run after a specific other test?

3. Fix the root cause:
   → Timing: use deterministic waits (event-based) instead of `sleep()`.
   → Shared state: add setup/teardown; use test isolation.
   → External dependencies: mock at the test boundary.
   → Ordering: make the test self-contained; add the missing setup to the test itself.

4. If root cause cannot be identified within 20 minutes:
   → Tag the test with a `#flaky` marker (or equivalent in the test framework).
   → Create a new bead: "Investigate and fix flaky test: <test name>".
   → Do not block the current bead's merge on this test — mark it as a known issue.
   → Record in CLAUDE.md Anti-Patterns:
     `[date] Test <name> is flaky due to [suspected cause] — see bead <id>`
```

**Rule**: Never permanently skip or comment out a flaky test without creating a tracking bead. A skipped test is a hidden failure.
