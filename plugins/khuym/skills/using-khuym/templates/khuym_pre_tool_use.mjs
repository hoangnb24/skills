#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";

const BARE_BV = /(^|\s)bv(\s|$)/;

async function readPayload() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return JSON.parse(raw || "{}");
}

export async function main() {
  const payload = await readPayload();
  const toolInput = payload.tool_input || {};
  const command = toolInput.command || "";

  let message = null;
  if (BARE_BV.test(command) && !command.includes("--robot-")) {
    message =
      "Khuym expects `bv` only with `--robot-*` flags in agent sessions. Bare `bv` launches the interactive TUI.";
  }

  const output = { continue: true };
  if (message) {
    output.systemMessage = message;
  }

  process.stdout.write(JSON.stringify(output));
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main();
}
