---
name: pi-durable-multi-provider
description: "Agent playbook for building multi-provider applications with @earendil-works/pi-durable and @earendil-works/pi-ai where every job pins its provider connection (connectionId, provider, modelId, authMethod) before initialization and executes strictly on that pinned connection."
---

# Agent Playbook: Selection-Pinned Multi-Provider Runtime (`pi-durable` + `pi-ai`)

Use this playbook when implementing or refactoring a system that runs `@earendil-works/pi-durable` agents over `@earendil-works/pi-ai` with multiple provider connections (multiple providers or multiple accounts per provider).

## 1. Non-Negotiable Architectural Invariants

Every change you write MUST preserve these five invariants. Never weaken them for convenience:

1. **Explicit Selection Pinning Before Job Initialization (`DispatchedCallUsesPinnedSelection`)**:
   - A job's provider selection `PinnedSelection = { connectionId, provider, modelId, authMethod }` is supplied explicitly by the caller at job creation (`submit` / `submitGroup`), validated against the Host catalog, and written immutably into `job.selection` *before* authorization or execution.
   - `settings.selected` in Host Settings is a **UI draft seed only**. Backend job creation, authorization, and `pi-durable` workers MUST NEVER read `settings.selected` or fall back to a global default provider.
2. **Immutable Selection Chain (`SelectionChainIntact`)**:
   - `job.selection` is hashed into `agentInputHash(job)`.
   - Authorization copies `structuredClone(job.selection)` into `job.grant.selection` after verifying `expectedJobIdentity === agentInputHash(job)`.
   - Attempt startup copies `structuredClone(job.grant.selection)` into `job.run.agent.selection`.
   - `pi-durable` persists `sessionBinding.identity` (which includes `job.run.agent.selection`) inside the attempt's `agent.sqlite` before opening the root conversation.
3. **Per-Connection Credential Isolation**:
   - Each login creates a distinct `connectionId` (UUID) with its own `0600` credential file at `providers/<connectionId>/credentials.json`.
   - `boundModels(pinned)` constructs an isolated `pi-ai` `createModels({ credentials, authContext })` instance with **only** `catalog.getProvider(pinned.provider)` registered and `getModel(p, m)` returning `undefined` for any `(p, m) !== (pinned.provider, pinned.modelId)`.
4. **Persisted Task Phase Binding (`CallRequiresActivePiDurableTask`)**:
   - `pi-durable` model calls (`streamSimple` for generation, `completeSimple` for context compaction) are permitted ONLY when an active `'pi.durable.phase'` telemetry span resolves to a running persisted task in `agent.sqlite` (`pi.generation` in phase `request`, or `pi.compaction` in phase `summarize`).
5. **Pre-Handoff Credential Fence & Secret Redaction (`HandoffCredentialFenceHolds`)**:
   - `boundModels.streamSimple` snapshots `{ credential, generation }` from `providers/<connectionId>/credentials.json` on entry.
   - Inside `transformHeaders` (immediately before `pi-ai` invokes the provider SDK), verify that the on-disk credential generation and value have not changed, reject any mutation to auth headers, commit durable input evidence (`beforeInput`), and invoke the synchronous `handoff()` marker.
   - Redact all credential secrets (`key`, `access`, `refresh`, `idToken`, raw and URL-encoded) from every yielded stream event and final `.result()`.

---

## 2. Core Data Contracts & Storage Layout

Define these shapes first (`pstack-principle-foundational-thinking`) and keep shared mutable state separated by file ownership (`pstack-principle-separate-before-serializing-shared-state`).

### Filesystem Layout

```text
<runtime-root>/
├── providers/
│   ├── settings.json                         # Connections list + UI default seed (`selected`)
│   └── <connectionId>/
│       ├── credentials.json                  # Mode 0600, owned exclusively by connectionId store
│       └── catalog.json                      # Optional per-connection model snapshot
├── jobs/
│   └── <jobId>.json                          # Job record with pinned job.selection, grant, run
└── attempts/
    └── <jobId>/<attemptId>/
        ├── agent.sqlite                      # Dedicated pi-durable SQLite database for this attempt
        └── requests/<requestKey>.json        # Durable request ledger (intent -> input -> saved/unknown)
```

### Canonical Identity Digest (`request-identity.js`)

```js
import { createHash } from 'node:crypto';

export const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

export const inputHash = (job) =>
  sha256(Buffer.from(JSON.stringify({
    payload: job.payload,
    references: job.references ?? [],
    base: job.base ?? null,
  })));

export const agentInputHash = (job) =>
  sha256(Buffer.from(JSON.stringify({
    input: inputHash(job),
    selection: job.selection, // { connectionId, provider, modelId, authMethod }
    feedback: job.revisionFeedback ?? null,
    ...(job.assignment ? { assignment: job.assignment } : {}),
    ...(job.continuationOf ? { continuationOf: job.continuationOf } : {}),
  })));
```

---

## 3. Sequence of Verifiable Implementation Units

Execute these units in order. Do not advance to the next unit until the current unit's verification check passes.

### Unit 1: Isolated Host Provider Settings & `boundModels(pinned)`

**Files to create/modify**: `host/provider-settings.js`

**Implementation requirements**:
1. Initialize the installed catalog via `createModels({ authContext })` from `@earendil-works/pi-ai/models` and register the allowed provider factories (`openrouterProvider`, `googleProvider`, `openaiProvider`, `openaiCodexProvider`).
2. For each connection in `providers/settings.json`, create a per-connection credential store over `providers/<connectionId>/credentials.json` (directory mode `0700`, file mode `0600`).
3. Implement synchronous `dispatchCredential()` on the credential store:
   - `statSync` + `readFileSync` on `credentials.json`.
   - Compute `generation = sha256(JSON.stringify({ size: stat.size, mtimeMs: stat.mtimeMs, ctimeMs: stat.ctimeMs }))`.
   - Verify the stored `provider` and `authMethod` match the connection.
4. Implement `modelsFor(selection)`:
   - Validate `selection = { connectionId, provider, modelId, authMethod }` against `settings.connections` and the installed catalog.
   - Return `boundModels(pinned)`:
     - Reject caller overrides of `['apiKey', 'env', 'headers', 'baseUrl', 'fetch']`.
     - Check `isDeepStrictEqual(model, installedModel)`.
     - Require `admission.beforeInput` (async) and `admission.handoff` (sync).
     - Instantiate a fresh `createModels({ credentials, authContext })` and register ONLY `catalog.getProvider(pinned.provider)`.
     - Enforce the `transformHeaders` fence: verify `current()` credential generation matches `snapshot.generation`, prevent auth header tampering (`/authorization|api[-_]?key|token|cookie|account|organization|project|^host$|^:authority$/i`), await `admission.beforeInput({ credentialGeneration: snapshot.generation })`, re-verify `current()`, and call `admission.handoff()`.
     - Wrap `result()` and `[Symbol.asyncIterator]()` with recursive secret redaction.

**Verify Unit 1**:
- Write a unit test with 2 connections (`connA`, `connB`). Confirm `modelsFor(selA).getModel(selB.provider, selB.modelId) === undefined`.
- Confirm passing `{ apiKey: 'override' }` or mutating `Authorization` inside `transformHeaders` throws before network dispatch.
- Confirm modifying `providers/<connA>/credentials.json` between `streamSimple` invocation and `transformHeaders` aborts before `admission.handoff()` is called.

---

### Unit 2: Job Admission, Authorization Grant & Attempt Pinning

**Files to create/modify**: `service/jobs.js`, `service/production.js`

**Implementation requirements**:
1. **`submit(request)`**:
   - Parse and validate `request.selection` (`connectionId`, `provider`, `modelId`, `authMethod`). Never read `settings.selected`.
   - Call `await modelsFor(request.selection)` to prove the connection and model are currently valid.
   - Persist `job` in `state: 'awaiting-authorization'` with `job.selection = structuredClone(request.selection)` and `job.admissionDigest = agentInputHash(job)`.
2. **`submitGroup(request)`** (if multi-agent/multi-builder is supported):
   - Validate each builder's explicit `selection` via `await modelsFor(builder.selection)`.
   - Create independent root jobs, each pinning its own `job.selection` and `job.assignment`.
3. **`authorize(jobId, { expectedJobIdentity })`**:
   - Recompute `agentInputHash(job)` and reject with `409` if `expectedJobIdentity !== agentInputHash(job)`.
   - Verify `await modelsFor(job.selection)` still resolves.
   - Write `job.grant = { selection: structuredClone(job.selection), agentInputHash: agentInputHash(job), evidenceVersion: 2, modelRetryPolicy, maxOutputTokens }`.
4. **`startRun(jobId)`**:
   - Verify `isDeepStrictEqual(job.grant.selection, job.selection)` and `job.grant.agentInputHash === agentInputHash(job)`.
   - Admit `job.run = { attemptId, agent: { selection: structuredClone(job.grant.selection), inputHash: job.grant.agentInputHash, evidenceVersion: 2 } }`.

**Verify Unit 2**:
- Submit a job with `connA`, call `settings.select(connB)` to change the global default, then authorize and start the job. Assert `job.selection`, `job.grant.selection`, and `job.run.agent.selection` all remain `connA`.

---

### Unit 3: `pi-durable` Native Phase Telemetry Binding

**Files to create/modify**: `runtime/native-dispatch.js`

**Implementation requirements**:
1. Create `createNativeDispatchBinding()` using a `WeakMap` to associate telemetry context objects with active `'pi.durable.phase'` spans (`{ attributes, active: true }`). Never trust propagated trace headers for dispatch authority.
2. Expose `bindHarness(harness)` (one-time binding per attempt) and `resolve(options)`:
   - Look up `binding = phases.get(options.telemetry)`.
   - Require `binding?.active === true`, `meta.kind === 'run'`, positive integer `meta['task.id']` and `meta.attempt`.
   - Load the persisted task directly from `pi-durable` via `await harness.getTask(meta['task.id'], BACKGROUND_CONTEXT)`.
   - Require `task.state.status === 'running'`, `!task.abortRequested`, `task.kind === meta['task.name']`, `checkpoint.phase === meta.phase`, and `checkpoint.attempt === meta.attempt`.
   - Allow ONLY:
     - `task.kind === 'pi.generation' && checkpoint.phase === 'request'` -> returns `{ taskId, conversationId, attempt, purpose: 'generation', cutoff, compacted }`.
     - `task.kind === 'pi.compaction' && checkpoint.phase === 'summarize'` -> returns `{ taskId, conversationId, attempt, purpose: 'summary', tail, firstKept }`.

**Verify Unit 3**:
- Calling `resolve(options)` outside an active `'pi.durable.phase'` span or when the SQLite task is not in `'running'` state throws `'Native model dispatch has no matching persisted phase'`.

---

### Unit 4: Guarded Models & Durable Request Ledger

**Files to create/modify**: `runtime/guarded-models.js`

**Implementation requirements**:
1. Wrap the `boundModels(job.run.agent.selection)` instance returned by Host.
2. On every `getModel(provider, id)`, `streamSimple(model, context, options)`, and `completeSimple(model, context, options)`:
   - Verify `provider === pinned.selection.provider && modelId === pinned.selection.modelId`.
   - Verify live job/grant/run selection equality via `captured.verify()`.
3. Inside `dispatch(purpose, model, context, options)`:
   - Resolve the active `pi-durable` task identity via `await nativeBinding.resolve(options)`.
   - Compute the deterministic request key from `(job.id, job.run.attemptId, native.taskId, native.attempt, purpose)` and semantic hash of `(pinned.selection, model, context, semanticOptions)`.
   - Check the durable request ledger on disk:
     - If already `saved` and `adopted` with matching semantic hash -> replay the saved response without invoking `boundModels`.
     - If a prior attempt in the same lineage is `unknown`, enforce bounded retry rules (`parentKey` lineage validation).
   - Record `status: 'started'` (intent) in a Studio store transaction.
   - Call `boundModels.streamSimple(model, context, options, { beforeInput, handoff })`:
     - `beforeInput({ credentialGeneration })`: atomically persist v2 input evidence (`version: 2`, `selection: copy(pinned.selection)`, `credentialGeneration`, `semanticHash`, `lineage`) and verify authorization is still active.
     - `handoff()`: synchronously check cancellation/expiry and mark the request as handed off to the SDK.
   - When the SDK stream completes: atomically recheck active lineage and authorization, persist the response as `saved` + `adopted`, and only then expose the result to `pi-durable`.
   - If the stream aborts or fails after `handoff()` with an ambiguous outcome, record `status: 'unknown'` and retain any late arrival separately without adopting it.

**Verify Unit 4**:
- Run a synthetic probe where `streamSimple` completes once, then reopen the attempt and replay the same request key: assert the saved response is returned and network dispatch count remains `1`.
- Mutate a saved v2 input receipt's `selection` or `version` on disk: assert the guard rejects it fail-closed.

---

### Unit 5: `pi-durable` Harness Wiring & Session Identity Lock

**Files to create/modify**: `runtime/agent-runner.js`

**Implementation requirements**:
1. Construct `gatedModels` as a `Proxy` over `guardedModels` that exposes ONLY `getModel`, `streamSimple`, and `completeSimple`, throwing on any other property access.
2. Open SQLite storage at `attempts/<jobId>/<attemptId>/agent.sqlite` via `openNodeSqliteStorage`.
3. Open `Harness.open(storage, { models: gatedModels, registry, telemetry: nativeBinding.telemetry, settings })` with:
   - `stream: { maxRetries: 0 }` (CRITICAL: disable internal SDK stream retries so every retry goes through `pi-durable` task checkpoints and `guardedModels` ledger admission).
   - `retry: { enabled: true, maxRetries: job.grant.modelRetryPolicy.maxRetries, ... }`.
   - `compaction: { enabled: true, backgroundTokens: 0, reserveTokens: job.grant.maxOutputTokens, ... }`.
   - `toolExecution: 'sequential'`.
4. Bind the harness via `nativeBinding.bindHarness(harness)`.
5. Before running or resuming the root agent, commit the session identity lock inside `agent.sqlite`:
   ```js
   await harness.commit(async (tx) => {
     const state = await tx.doc(sessionBinding);
     if (state.identity && state.identity !== expectedIdentity) {
       throw new Error('Attempt database belongs to different inputs');
     }
     state.identity = expectedIdentity; // Includes hash of job.run.agent.selection
   }, BACKGROUND_CONTEXT);
   ```
6. Open the root conversation pinned to the job's selection:
   ```js
   const root = await harness.root(BACKGROUND_CONTEXT, {
     agent: {
       model: {
         provider: job.run.agent.selection.provider,
         modelId: job.run.agent.selection.modelId,
       },
       instructions,
       tools,
     },
   });
   ```

**Verify Unit 5**:
- Run an end-to-end synthetic test with 2 configured connections (`OpenRouter` and `Google`):
  1. Submit Job 1 pinned to `OpenRouter` (`connA`).
  2. Switch `settings.select` to `Google` (`connB`).
  3. Authorize and run Job 1 through `Harness.open` -> verify `pi-durable` executes both `pi.generation` (`streamSimple`) and `pi.compaction` (`completeSimple`) exclusively against `connA`.
  4. Reopen `agent.sqlite` with a modified `selection` -> verify `harness.commit` rejects immediately.

---

## 4. Formal Statechart Verification Recipe (`pstack-statechart`)

Whenever you modify the admission, credential fence, or dispatch lifecycle in a project using this architecture, verify the state machine in an external scratch directory using `/pstack-statechart` before shipping:

```sh
JAVA=/opt/homebrew/opt/openjdk@17/bin/java \
TLA2TOOLS=$HOME/.local/share/pstack-statechart/toolchain-1/tlc/tla2tools-1.7.4.jar \
$HOME/.local/share/droid-room/roles/supervisor/.factory/skills/pstack-statechart/scripts/statechart \
/tmp/pi-durable-multi-provider-statechart/PiDurableMultiProvider.tla \
--config /tmp/pi-durable-multi-provider-statechart/PiDurableMultiProvider.cfg \
--view /tmp/pi-durable-multi-provider-statechart/PiDurableMultiProvider.view.ts \
--out /tmp/pi-durable-multi-provider-statechart/verify-out
```

Required invariants in `.cfg`:
- `INVARIANT DispatchedCallUsesPinnedSelection`
- `INVARIANT SelectionChainIntact`
- `INVARIANT CallRequiresActivePiDurableTask`
- `INVARIANT HandoffCredentialFenceHolds`
- `CHECK_DEADLOCK TRUE`

---

## Additional references

Load a reference only when the task needs it.

- [MCP tools](references/mcp-tools.md): attach MCP server tools to the pi-durable agent, pin the toolset, and handle replay.
