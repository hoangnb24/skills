#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function findRepoRoot(start) {
  let candidate = path.resolve(start || ".");
  while (true) {
    if (fs.existsSync(path.join(candidate, ".khuym", "onboarding.json"))) {
      return candidate;
    }
    if (fs.existsSync(path.join(candidate, ".git"))) {
      return candidate;
    }
    const parent = path.dirname(candidate);
    if (parent === candidate) {
      return candidate;
    }
    candidate = parent;
  }
}

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
  const repoRoot = findRepoRoot(payload.cwd || ".");
  const onboardingPath = path.join(repoRoot, ".khuym", "onboarding.json");
  const criticalPatterns = path.join(repoRoot, "history", "learnings", "critical-patterns.md");

  const notes = [];
  if (fs.existsSync(onboardingPath)) {
    notes.push("Khuym onboarding is installed for this repo. Read AGENTS.md before substantive work.");
  } else {
    notes.push("Khuym onboarding is missing in this repo. Load khuym:using-khuym before continuing.");
  }

  if (fs.existsSync(criticalPatterns)) {
    notes.push("If you move into planning or execution, read history/learnings/critical-patterns.md.");
  }

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "SessionStart",
        additionalContext: notes.join(" "),
      },
    }),
  );
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main();
}
