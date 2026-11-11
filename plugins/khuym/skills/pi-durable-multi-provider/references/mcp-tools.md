# MCP tools in a pi-durable runtime

Read this only when the task attaches MCP server tools to a `pi-durable` agent.

## What is established

`pi-durable` 1.4.0 has no built-in MCP client. It supports MCP through ordinary tools:
`defineTool`, `defineExtension`, `registry.install`, the `mcp__<server>__<tool>` naming
convention, `callers`, `deferred: true` and `createToolSearchExtension()` from
`@earendil-works/pi-durable/tool-search`. See the package README sections "Tools",
"Calling tools from tools" and "Who may call a tool".

A local prototype proved the bridge with `pi-durable`, `pi-ai` and `chord` 1.4.0,
`@modelcontextprotocol/sdk` 1.32.2, a real stdio MCP server, the `pi-ai` faux provider
and SQLite storage:

- the model was offered `mcp__demo__add`, called it, and its second request contained the result;
- the MCP server executed the tool exactly once;
- reopening the same `agent.sqlite` and resubmitting the same `requestId` ran neither the tool nor the model again.

Not established: a crash while an MCP tool runs, real providers, HTTP transports,
non-text content, `tool_search` over large tool sets, and toolset drift detection.

## Bridge

```js
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Type } from "@earendil-works/pi-ai";
import { defineExtension, defineTool } from "@earendil-works/pi-durable";
import { createHash } from "node:crypto";

export async function connectMcp({ name, command, args, env }) {
  const client = new Client({ name: "pi-durable-bridge", version: "0.0.1" });
  await client.connect(new StdioClientTransport({ command, args, env }));
  const { tools: listed } = await client.listTools();
  const tools = listed.map((t) => defineTool({
    name: `mcp__${name}__${t.name}`,
    description: t.description ?? t.name,
    parameters: Type.Unsafe(t.inputSchema),
    execute: async (args) => {
      const res = await client.callTool({ name: t.name, arguments: args });
      const output = res.content.filter((c) => c.type === "text").map((c) => ({ type: "text", text: c.text }));
      if (res.isError) throw new Error(output.map((c) => c.text).join("\n") || "MCP tool error");
      return { output };
    },
  }));
  const toolsetHash = createHash("sha256")
    .update(JSON.stringify(listed.map(({ name, inputSchema }) => ({ name, inputSchema }))))
    .digest("hex");
  return { extension: defineExtension({ name: `mcp-${name}`, tools }), toolsetHash, close: () => client.close() };
}
```

Install `extension` with `registry.install(...)` before `Harness.open`. Close the client after `harness.close`.

## Rules that keep the main invariants

1. **Pin the toolset.** Add `{ server, version, toolsetHash }` to the job at submission and to
   `agentInputHash(job)`. On attempt start and on reopen, recompute `toolsetHash`; refuse to run when it differs.
2. **Replay.** A tool reruns after a crash only with `replay: "safe"`; otherwise the model gets
   `interrupted`. Mark an MCP tool replay-safe only when it is read-only or the server honors an
   idempotency key derived from the tool task ID. Never mark a side-effecting tool safe by default.
3. **Separate credentials.** MCP server credentials live outside `providers/<connectionId>/`.
   Pass them through the transport `env`, never through model options or headers.
4. **Large servers.** Register tools with `deferred: true` and install `createToolSearchExtension()`.
   For code mode, set `callers: ["tools"]` and group them with `namespaces: [{ prefix: "mcp__<server>__" }]`.
5. **Shared state.** Keep `toolExecution: "sequential"` when tools of one server share mutable state.

## Verify

Reproduce with a faux model so no provider is called:

1. Start a stdio MCP server whose tool appends one line per call to a log file.
2. Script the faux provider: first a `fauxToolCall("mcp__<server>__<tool>", args)` with `stopReason: "toolUse"`, then a text answer.
3. Pass when: status is `done`, the second model request contains the tool result, the log has one line,
   and reopening the SQLite database with the same `requestId` leaves the log and the model call count unchanged.
4. Before relying on rule 2, add a case that kills the process inside `execute` and check the reopened result.
