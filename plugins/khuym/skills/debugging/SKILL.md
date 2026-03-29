---
name: khuym:debugging
description: Systematic debugging for blocked workers, test failures, build errors, runtime crashes, and integration issues. Invoked standalone ("debug this error") or by other skills (reviewing spawns debugger on UAT failure, executing invokes it on blocker). Reads history/learnings/critical-patterns.md to avoid re-solving known issues. Writes debug notes that compounding can later capture.
---

# Debugging

If `.khuym/onboarding.json` is missing or stale for the current repo, stop and invoke `khuym:using-khuym` before continuing.

Resolve blockers and failures systematically. Do not guess — triage first, then reproduce, then diagnose, then fix.

## When to Use This Skill

- A build fails (compilation, type error, missing dependency)
- A test fails (assertion mismatch, flaky test, timeout)
- A runtime crash or exception occurs
- An integration breaks (API mismatch, env config, auth)
- A worker is stuck (circular dependency, conflicting changes, unresolvable blocker)
- Reviewing or executing hands off with a failure that needs root cause analysis

---

## Step 1: Triage — Classify the Issue

Classify before investigating. Misclassifying wastes time.

| Type | Signals |
|---|---|
| **Build failure** | Compilation error, type error, missing module, bundler failure |
| **Test failure** | Assertion mismatch, snapshot diff, timeout, flaky intermittent pass |
| **Runtime error** | Crash, uncaught exception, segfault, undefined behavior |
| **Integration failure** | HTTP 4xx/5xx, env variable missing, API schema mismatch, auth error |
| **Blocker** | Stuck agent, circular bead dependency, conflicting file reservations |

**Output of triage:** A one-line classification: `[TYPE] in [component]: [symptom]`

Example: `Build failure in packages/sdk: TS2345 type mismatch in auth.ts`

---

## Step 2: Reproduce — Isolate the Failure

**Check known patterns first** — before any investigation:

```bash
cat history/learnings/critical-patterns.md 2>/dev/null | grep -i "<keyword from classification>"
```

If a known pattern matches → jump directly to Step 4 (Fix), using the documented resolution.

**If not a known pattern, reproduce it:**

1. Run the exact command that failed — do not paraphrase it:
   ```bash
   # Whatever CI/worker ran — run it verbatim
   npm run build 2>&1 | tee /tmp/debug-output.txt
   # or: pytest tests/specific_test.py -v 2>&1 | tee /tmp/debug-output.txt
   ```

2. Capture error output verbatim. Do not summarize. The exact line numbers and messages matter.

3. Identify the minimal reproduction case:
   - Can you trigger the failure with one file change? One command?
   - Does it fail in isolation or only in combination with other changes?
   - Is it environment-specific (CI only, one machine only)?

4. Confirm reproducibility:
   - Run twice. If intermittent → classify as **flaky test**, not a deterministic failure.
   - Flaky tests require a different approach: check for shared state, race conditions, or test ordering.

---

## Step 3: Diagnose — Root Cause Analysis

Work through these checks in order. Stop when you find the cause.

### 3a. Read the relevant source files

```bash
# Find the file mentioned in the error
grep -rn "<error symbol or function>" src/ --include="*.ts" -l
# Then read the file
```

Do not read the entire codebase. Read exactly the files implicated by the error output.

### 3b. Check git blame for recent changes

```bash
git log --oneline -20          # What changed recently?
git blame <file> -L <line>,<line>  # Who changed the failing line?
git diff HEAD~3 -- <file>      # What did it look like before?
```

If a recent commit introduced the failure → the fix is likely reverting or adjusting that change.

### 3c. Check bead context

```bash
br show <bead-id>   # What was this bead supposed to do?
```

Verify: does the failure indicate the bead was implemented against the wrong spec, or that it was implemented correctly but the spec was wrong?

### 3d. Check CONTEXT.md for decision violations

```bash
cat history/<feature>/CONTEXT.md
```

Ask: was a locked decision (D1, D2...) violated by the implementation? Decision violations are a frequent root cause — the code does something "reasonable" that was explicitly excluded.

### 3e. Check Agent Mail for related blockers

```bash
fetch_topic(project_key="<project-root-path>", topic_name="<EPIC_TOPIC>")
fetch_inbox(project_key="<project-root-path>", agent_name="<agent-name>", topic="<EPIC_TOPIC>")
```

Another worker may have already reported the same issue or a related conflict. Avoid duplicate debugging.

### 3f. Narrow to root cause

After checks 3a–3e, write a one-sentence root cause:

> Root cause: `<file>:<line>` — `<what is wrong and why>`

If you cannot write this sentence, you do not have the root cause yet. Do not proceed to Fix.

---

## Step 4: Fix — Apply and Verify

### Fix size determines approach

**Small fix** (1–3 files, obvious change, low risk):
- Implement directly
- Commit: `fix(<bead-id>): <what was wrong and what was changed>`
- Run verification immediately:
  ```bash
  npm run build && npm test   # or language equivalent
  ```

**Substantial fix** (cross-cutting change, logic redesign, multiple files):
- Create a fix bead before implementing:
  ```bash
  br create "Fix: <root cause summary>" -t task --blocks <original-bead-id>
  ```
- Implement in the fix bead's scope
- Run verification: the fix bead's acceptance criteria must pass

**Decision violation** (CONTEXT.md decision ignored):
- Do not silently fix — the decision may need to be revisited
- Report via Agent Mail before implementing:
  ```
  send_message(
    project_key: "<project-root-path>",
    sender_name: "<agent-name>",
    to: ["<COORDINATOR_AGENT_NAME>"],
    thread_id: "<epic-thread-id>",
    topic: "<EPIC_TOPIC>",
    subject: "Decision violation found: <decision-id>",
    body_md: "Bead <id> violated decision <D#>: <what was done vs what was decided>. Proposed fix: <approach>."
  )
  ```
- Wait for response or implement the conservative fix (honor the locked decision)

### Verify the fix

Run the exact command that originally failed. It must pass cleanly — not "mostly pass":

```bash
# Rerun original failing command
<original-failing-command>

# Also run broader test suite to check for regressions
npm test   # or equivalent
```

If verification fails → do not report success. Return to Step 3 with new information.

### Report the fix via Agent Mail

```
send_message(
  project_key: "<project-root-path>",
  sender_name: "<agent-name>",
  to: ["<COORDINATOR_AGENT_NAME>"],
  thread_id: "<epic-thread-id>",
  topic: "<EPIC_TOPIC>",
  subject: "Fix applied: <classification from Step 1>",
  body_md: "Root cause: <sentence from 3f>. Fix: <what was changed>. Verification: passed."
)
```

---

## Step 5: Learn — Capture the Pattern

### If this is a new failure pattern

Write a debug note for compounding to capture:

```bash
cat >> /tmp/debug-notes.md << 'EOF'
## Debug Note: <date> — <classification>

**Root cause**: <root cause sentence>
**Trigger**: <what causes this>
**Fix**: <what resolves it>
**Signal**: <how to recognize this pattern in future>
EOF
```

Tell the user: "New failure pattern found. Run khuym:compounding skill to promote this to history/learnings/."

### If this matches a known pattern from critical-patterns.md

Verify the existing advice still works:
- Did following the documented resolution solve it?
- If yes: no action needed
- If the documented resolution failed or is outdated: update the note with a flag

```bash
echo "⚠ Pattern '<name>' resolution no longer accurate as of <date> — <what changed>" \
  >> history/learnings/critical-patterns.md
```

---

## Blocker-Specific Protocol

When a worker is stuck (cannot make progress, not a code error):

1. Check bead dependencies: `bv --robot-insights 2>/dev/null | jq '.Cycles'`
2. Check file reservations via Agent Mail for conflicts
3. Determine: is this **waiting for another worker** or **genuinely blocked**?

**Waiting for another worker** → report to orchestrator and yield:
```
send_message(
  project_key: "<project-root-path>",
  sender_name: "<agent-name>",
  to: ["<COORDINATOR_AGENT_NAME>"],
  thread_id: "<epic-thread-id>",
  topic: "<EPIC_TOPIC>",
  subject: "Blocked: waiting on <bead-id>",
  body_md: "<bead-id> cannot proceed until <dependency> completes. Pausing."
)
```

**Genuinely blocked** (circular dep, impossible constraint, conflicting decisions):
```
send_message(
  project_key: "<project-root-path>",
  sender_name: "<agent-name>",
  to: ["<COORDINATOR_AGENT_NAME>"],
  thread_id: "<epic-thread-id>",
  topic: "<EPIC_TOPIC>",
  subject: "Hard blocker: <description>",
  body_md: "Cannot resolve: <what is impossible and why>. Options: <A> or <B>. Needs human decision."
)
```

Do not spin. One report, then pause and let the orchestrator escalate.

---

## Red Flags

- **Fixing symptoms, not root cause** — If the same error recurs after the fix, root cause was not found. Return to Step 3.
- **Skipping reproduction** — Diagnosing from the error message alone leads to wrong fixes. Always reproduce first.
- **Not checking critical-patterns.md** — Teams report that 30–40% of recurring failures are already documented. Check before investigating.
- **Committing a fix without running verification** — The fix must be verified with the exact failing command, not a different test.
- **Decision violation silently patched** — Violating a CONTEXT.md decision to make a test pass propagates the violation downstream. Always report and align first.

---

## Quick Reference

| Situation | First action |
|---|---|
| Build fails | `git log --oneline -10` — check recent changes |
| Test fails | Run test verbatim, capture exact assertion output |
| Flaky test | Run 5× — if intermittent, check shared state/ordering |
| Runtime crash | Read stack trace top-to-bottom, find first line in your code |
| Integration error | Check env vars, then API response body (not just status code) |
| Worker stuck | Check bead deps with `bv`, then Agent Mail for conflicts |
| Recurring issue | Check `history/learnings/critical-patterns.md` first |
