#!/usr/bin/env node

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { applyRepo, checkRepo, getNodeRuntimeStatus } from "./onboard_khuym.mjs";

test("applyRepo creates full repo onboarding with node-based hooks", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "khuym-onboard-"));

  try {
    const result = applyRepo(root, false);

    assert.equal(result.result.status, "complete");
    assert.equal(result.status, "up_to_date");
    assert.equal(result.details.runtime.supported, true);
    assert.ok(fs.existsSync(path.join(root, "AGENTS.md")));
    assert.match(fs.readFileSync(path.join(root, "AGENTS.md"), "utf8"), /Khuym Workflow/);
    assert.ok(fs.existsSync(path.join(root, ".codex", "config.toml")));
    assert.ok(fs.existsSync(path.join(root, ".codex", "hooks.json")));
    assert.ok(fs.existsSync(path.join(root, ".khuym", "onboarding.json")));
    assert.ok(fs.existsSync(path.join(root, ".codex", "hooks", "khuym_session_start.mjs")));
    assert.match(
      fs.readFileSync(path.join(root, ".codex", "hooks.json"), "utf8"),
      /node \.codex\/hooks\/khuym_session_start\.mjs/,
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("applyRepo appends managed block to existing agents instructions", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "khuym-onboard-"));

  try {
    fs.writeFileSync(path.join(root, "AGENTS.md"), "# Existing instructions\n", "utf8");

    applyRepo(root, false);
    const agentsText = fs.readFileSync(path.join(root, "AGENTS.md"), "utf8");

    assert.match(agentsText, /# Existing instructions/);
    assert.match(agentsText, /<!-- KHUYM:START -->/);
    assert.equal((agentsText.match(/<!-- KHUYM:START -->/g) || []).length, 1);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("applyRepo preserves an existing compact_prompt without explicit replace", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "khuym-onboard-"));

  try {
    const codexDir = path.join(root, ".codex");
    fs.mkdirSync(codexDir, { recursive: true });
    fs.writeFileSync(path.join(codexDir, "config.toml"), 'compact_prompt = """keep me"""\n', "utf8");

    const result = applyRepo(root, false);
    const configText = fs.readFileSync(path.join(codexDir, "config.toml"), "utf8");

    assert.match(configText, /compact_prompt = """keep me"""/);
    assert.equal(result.result.status, "partial");
    assert.match(JSON.stringify(result.result), /compact_prompt/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("checkRepo flags stale python hook commands and legacy hook files", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "khuym-onboard-"));

  try {
    const hooksDir = path.join(root, ".codex", "hooks");
    fs.mkdirSync(hooksDir, { recursive: true });
    fs.writeFileSync(
      path.join(root, ".codex", "hooks.json"),
      JSON.stringify(
        {
          hooks: {
            SessionStart: [
              {
                matcher: "startup|resume",
                hooks: [
                  {
                    type: "command",
                    command:
                      'python3 "$(git rev-parse --show-toplevel 2>/dev/null || pwd)/.codex/hooks/khuym_session_start.py"',
                    statusMessage: "Khuym: session bootstrap",
                  },
                ],
              },
            ],
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    fs.writeFileSync(path.join(hooksDir, "khuym_session_start.py"), "# legacy\n", "utf8");

    const result = checkRepo(root);

    assert.equal(result.status, "needs_onboarding");
    assert.ok(result.actions.includes("install_khuym_hook_entries"));
    assert.ok(result.actions.includes("sync_khuym_hook_scripts"));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("getNodeRuntimeStatus enforces the minimum supported major version", () => {
  assert.equal(getNodeRuntimeStatus("18.0.0").supported, true);
  assert.equal(getNodeRuntimeStatus("17.9.1").supported, false);
});
