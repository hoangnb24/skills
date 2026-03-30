#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const USING_KHUYM_DIR = path.dirname(path.dirname(SCRIPT_PATH));
const PLUGIN_ROOT = path.dirname(path.dirname(USING_KHUYM_DIR));
const PLUGIN_MANIFEST_PATH = path.join(PLUGIN_ROOT, ".codex-plugin", "plugin.json");
const AGENTS_TEMPLATE_PATH = path.join(PLUGIN_ROOT, "AGENTS.template.md");
const HOOK_TEMPLATES_DIR = path.join(USING_KHUYM_DIR, "templates");
const ONBOARDING_SCHEMA_VERSION = "1.0";
const COMPACT_PROMPT_MARKER_START = "# KHUYM: compact_prompt start";
const COMPACT_PROMPT_MARKER_END = "# KHUYM: compact_prompt end";
const MIN_NODE_MAJOR = 18;
const MANAGED_HOOK_FILENAMES = [
  "khuym_session_start.mjs",
  "khuym_pre_tool_use.mjs",
  "khuym_stop.mjs",
];
const LEGACY_HOOK_FILENAMES = [
  "khuym_session_start.py",
  "khuym_pre_tool_use.py",
  "khuym_stop.py",
];

export function getNodeRuntimeStatus(version = process.versions.node) {
  const major = Number.parseInt(String(version).split(".")[0] || "0", 10);
  const supported = Number.isFinite(major) && major >= MIN_NODE_MAJOR;
  return {
    command: "node",
    minimum_major: MIN_NODE_MAJOR,
    supported,
    version,
  };
}

function utcNow() {
  return new Date().toISOString();
}

function loadPluginVersion() {
  return JSON.parse(fs.readFileSync(PLUGIN_MANIFEST_PATH, "utf8")).version;
}

export function resolveRepoRoot(explicitRoot) {
  if (explicitRoot) {
    return path.resolve(explicitRoot);
  }

  const cwd = path.resolve(process.cwd());
  try {
    const stdout = execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return path.resolve(stdout.trim());
  } catch {
    let candidate = cwd;
    while (true) {
      if (fs.existsSync(path.join(candidate, ".git"))) {
        return candidate;
      }
      const parent = path.dirname(candidate);
      if (parent === candidate) {
        return cwd;
      }
      candidate = parent;
    }
  }
}

function readTemplate() {
  return `${fs.readFileSync(AGENTS_TEMPLATE_PATH, "utf8").replace(/\s*$/, "")}\n`;
}

function readTextIfExists(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function ensureParent(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function managedAgentsPresent(text) {
  return text.includes("<!-- KHUYM:START -->") && text.includes("<!-- KHUYM:END -->");
}

function mergeAgentsContent(existing, template) {
  const stripped = existing.trim();
  if (!stripped) {
    return { text: template, status: "created_from_template" };
  }

  if (managedAgentsPresent(existing)) {
    const updated = existing.replace(
      /<!-- KHUYM:START -->[\s\S]*?<!-- KHUYM:END -->\n?/,
      template,
    );
    return { text: `${updated.replace(/\s*$/, "")}\n`, status: "updated_managed_block" };
  }

  const glue = existing.endsWith("\n\n") ? "" : "\n\n";
  return {
    text: `${existing.replace(/\s*$/, "")}${glue}${template}`,
    status: "appended_managed_block",
  };
}

function insertBeforeFirstTable(text, block) {
  const match = text.match(/^\[/m);
  if (match && match.index !== undefined) {
    return `${text.slice(0, match.index)}${block}\n${text.slice(match.index)}`;
  }
  return `${text.replace(/\s*$/, "")}${text.trim() ? "\n\n" : ""}${block}\n`;
}

function findProjectDocMaxBytes(text) {
  const match = text.match(/^project_doc_max_bytes\s*=\s*(.+)$/m);
  if (!match) {
    return undefined;
  }
  const value = Number.parseInt(match[1], 10);
  return Number.isFinite(value) ? value : undefined;
}

function upsertProjectDocMaxBytes(text, existingValue) {
  const desired = 65536;
  const line = `project_doc_max_bytes = ${desired}`;

  if (existingValue === undefined) {
    return insertBeforeFirstTable(text, `${line}\n`);
  }

  if (existingValue >= desired) {
    return text;
  }

  return text.replace(/^project_doc_max_bytes\s*=\s*.+$/m, line);
}

function findSectionRange(text, sectionName) {
  const lines = text.split("\n");
  let offset = 0;
  let start = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (start === null) {
      if (line.trim() === `[${sectionName}]`) {
        start = offset + line.length + 1;
      }
      offset += line.length + 1;
      continue;
    }

    if (/^\[[^\]]+\]\s*$/.test(line)) {
      return { start, end: offset };
    }
    offset += line.length + 1;
  }

  return start === null ? null : { start, end: text.length };
}

function featureSectionBody(text) {
  const range = findSectionRange(text, "features");
  return range ? text.slice(range.start, range.end) : null;
}

function isCodexHooksEnabled(text) {
  const body = featureSectionBody(text);
  return body ? /^codex_hooks\s*=\s*true\s*$/m.test(body) : false;
}

function upsertFeaturesCodexHooks(text) {
  const range = findSectionRange(text, "features");
  if (!range) {
    const block = "[features]\ncodex_hooks = true\n";
    const suffix = text && !text.endsWith("\n") ? "\n" : "";
    return `${text}${suffix}${text.trim() ? "\n" : ""}${block}`;
  }

  let body = text.slice(range.start, range.end);
  if (/^codex_hooks\s*=/m.test(body)) {
    body = body.replace(/^codex_hooks\s*=.*$/m, "codex_hooks = true");
  } else {
    if (body && !body.endsWith("\n")) {
      body += "\n";
    }
    body += "codex_hooks = true\n";
  }

  return `${text.slice(0, range.start)}${body}${text.slice(range.end)}`;
}

function renderCompactPromptBlock() {
  return [
    COMPACT_PROMPT_MARKER_START,
    'compact_prompt = """',
    "MANDATORY: Khuym context compaction recovery.",
    "",
    "STOP. Before doing anything else:",
    "1. Read AGENTS.md completely.",
    "2. If present, read .khuym/HANDOFF.json and .khuym/STATE.md.",
    "3. Re-open the active feature CONTEXT.md before more planning or edits.",
    "4. Re-open the current bead or task before running more implementation commands.",
    "5. Check the current worktree state with git status before resuming.",
    "",
    "After completing these steps, briefly confirm what context you restored and only then continue.",
    '"""',
    COMPACT_PROMPT_MARKER_END,
    "",
  ].join("\n");
}

function hasManagedCompactPrompt(text) {
  return text.includes(COMPACT_PROMPT_MARKER_START) && text.includes(COMPACT_PROMPT_MARKER_END);
}

function hasCompactPrompt(text) {
  return /^compact_prompt\s*=/m.test(text);
}

function replaceExistingCompactPrompt(text, replacement) {
  const tripleQuotePattern = /^compact_prompt\s*=\s*"""[\s\S]*?^"""\s*$/m;
  if (tripleQuotePattern.test(text)) {
    return text.replace(tripleQuotePattern, replacement.replace(/\n$/, ""));
  }

  const singleLinePattern = /^compact_prompt\s*=.*$/m;
  if (singleLinePattern.test(text)) {
    return text.replace(singleLinePattern, replacement.replace(/\n$/, ""));
  }

  return insertBeforeFirstTable(text, replacement);
}

function mergeCompactPrompt(text, allowReplace) {
  if (hasManagedCompactPrompt(text)) {
    const updated = text.replace(
      new RegExp(
        `${escapeRegExp(COMPACT_PROMPT_MARKER_START)}[\\s\\S]*?${escapeRegExp(COMPACT_PROMPT_MARKER_END)}\\n?`,
      ),
      renderCompactPromptBlock(),
    );
    return {
      text: updated,
      compact_prompt_status: "managed",
    };
  }

  if (hasCompactPrompt(text) && !allowReplace) {
    return {
      text,
      compact_prompt_status: "conflict_preserved",
    };
  }

  if (hasCompactPrompt(text) && allowReplace) {
    return {
      text: replaceExistingCompactPrompt(text, renderCompactPromptBlock()),
      compact_prompt_status: "replaced",
    };
  }

  return {
    text: insertBeforeFirstTable(text, renderCompactPromptBlock()),
    compact_prompt_status: "installed",
  };
}

function mergeCodexConfig(configPath, allowCompactPromptReplace) {
  const existingText = readTextIfExists(configPath);
  const changes = [];

  let updatedText = existingText;
  const nextProjectDocText = upsertProjectDocMaxBytes(updatedText, findProjectDocMaxBytes(existingText));
  if (nextProjectDocText !== updatedText) {
    changes.push("set_project_doc_max_bytes");
    updatedText = nextProjectDocText;
  }

  const nextFeatureText = upsertFeaturesCodexHooks(updatedText);
  if (nextFeatureText !== updatedText) {
    changes.push("enable_codex_hooks_feature");
    updatedText = nextFeatureText;
  }

  const compactResult = mergeCompactPrompt(updatedText, allowCompactPromptReplace);
  if (compactResult.text !== updatedText) {
    changes.push(`compact_prompt_${compactResult.compact_prompt_status}`);
    updatedText = compactResult.text;
  } else if (compactResult.compact_prompt_status === "conflict_preserved") {
    changes.push("compact_prompt_conflict_preserved");
  }

  return {
    text: `${updatedText.replace(/\s*$/, "")}\n`,
    changes,
  };
}

function buildManagedHookCommand(fileName) {
  return `node .codex/hooks/${fileName}`;
}

function renderManagedHookEntries() {
  return {
    SessionStart: [
      {
        matcher: "startup|resume",
        hooks: [
          {
            type: "command",
            command: buildManagedHookCommand("khuym_session_start.mjs"),
            statusMessage: "Khuym: session bootstrap",
          },
        ],
      },
    ],
    PreToolUse: [
      {
        matcher: "Bash",
        hooks: [
          {
            type: "command",
            command: buildManagedHookCommand("khuym_pre_tool_use.mjs"),
            statusMessage: "Khuym: shell guardrails",
          },
        ],
      },
    ],
    Stop: [
      {
        hooks: [
          {
            type: "command",
            command: buildManagedHookCommand("khuym_stop.mjs"),
            statusMessage: "Khuym: end-of-turn check",
          },
        ],
      },
    ],
  };
}

function isKhuymHookEntry(entry) {
  for (const hook of entry?.hooks || []) {
    const command = hook?.command || "";
    const status = hook?.statusMessage || "";
    if (command.includes(".codex/hooks/khuym_") || status.startsWith("Khuym:")) {
      return true;
    }
  }
  return false;
}

function parseHooksJson(text) {
  if (!text.trim()) {
    return {};
  }
  return JSON.parse(text);
}

function mergeHooksJson(hooksPath) {
  const existingText = readTextIfExists(hooksPath);
  const existing = existingText ? parseHooksJson(existingText) : {};
  const hooks = existing.hooks && typeof existing.hooks === "object" ? existing.hooks : {};
  const mergedHooks = { ...hooks };
  const changes = [];

  for (const [eventName, entries] of Object.entries(renderManagedHookEntries())) {
    const currentEntries = Array.isArray(mergedHooks[eventName]) ? mergedHooks[eventName] : [];
    const filtered = currentEntries.filter((entry) => !isKhuymHookEntry(entry));
    const nextEntries = [...filtered, ...entries];
    if (JSON.stringify(currentEntries) !== JSON.stringify(nextEntries)) {
      changes.push(`upsert_${eventName}`);
    }
    mergedHooks[eventName] = nextEntries;
  }

  return {
    text: `${JSON.stringify({ ...existing, hooks: mergedHooks }, null, 2)}\n`,
    changes,
  };
}

function hookScriptsNeedUpdate(repoRoot) {
  const hooksDir = path.join(repoRoot, ".codex", "hooks");

  for (const name of MANAGED_HOOK_FILENAMES) {
    const source = fs.readFileSync(path.join(HOOK_TEMPLATES_DIR, name), "utf8");
    const targetPath = path.join(hooksDir, name);
    if (!fs.existsSync(targetPath) || fs.readFileSync(targetPath, "utf8") !== source) {
      return true;
    }
  }

  for (const name of LEGACY_HOOK_FILENAMES) {
    if (fs.existsSync(path.join(hooksDir, name))) {
      return true;
    }
  }

  return false;
}

function writeHookScripts(repoRoot) {
  const hooksDir = path.join(repoRoot, ".codex", "hooks");
  fs.mkdirSync(hooksDir, { recursive: true });

  for (const name of LEGACY_HOOK_FILENAMES) {
    const legacyPath = path.join(hooksDir, name);
    if (fs.existsSync(legacyPath)) {
      fs.unlinkSync(legacyPath);
    }
  }

  const written = [];
  for (const name of MANAGED_HOOK_FILENAMES) {
    const source = path.join(HOOK_TEMPLATES_DIR, name);
    const target = path.join(hooksDir, name);
    fs.copyFileSync(source, target);
    fs.chmodSync(target, 0o755);
    written.push(path.relative(repoRoot, target));
  }
  return written;
}

function buildRuntimeBlockedPayload(repoRoot, action) {
  const runtime = getNodeRuntimeStatus();
  return {
    repo_root: repoRoot,
    status: "missing_runtime",
    action,
    requires_confirmation: false,
    actions: ["install_supported_node_runtime"],
    message: `Khuym requires Node.js ${MIN_NODE_MAJOR}+ before onboarding can continue. Install Node.js and rerun onboarding.`,
    details: {
      runtime,
    },
  };
}

export function checkRepo(repoRoot) {
  const runtime = getNodeRuntimeStatus();
  if (!runtime.supported) {
    return buildRuntimeBlockedPayload(repoRoot, "check");
  }

  const pluginVersion = loadPluginVersion();
  const agentsPath = path.join(repoRoot, "AGENTS.md");
  const configPath = path.join(repoRoot, ".codex", "config.toml");
  const hooksPath = path.join(repoRoot, ".codex", "hooks.json");
  const onboardingPath = path.join(repoRoot, ".khuym", "onboarding.json");

  const agentsText = readTextIfExists(agentsPath);
  const agentsExists = agentsText.trim() !== "";
  const managedAgents = agentsExists && managedAgentsPresent(agentsText);

  const configText = readTextIfExists(configPath);
  const hooksText = readTextIfExists(hooksPath);

  let onboarding = {};
  if (fs.existsSync(onboardingPath)) {
    try {
      onboarding = JSON.parse(fs.readFileSync(onboardingPath, "utf8"));
    } catch {
      onboarding = {};
    }
  }

  const compactPromptManaged = hasManagedCompactPrompt(configText);
  const compactPromptConflict = hasCompactPrompt(configText) && !compactPromptManaged;

  const actions = [];
  if (!agentsExists) {
    actions.push("create_AGENTS.md");
  } else if (!managedAgents) {
    actions.push("append_khuym_managed_block_to_AGENTS.md");
  }

  if (!configText) {
    actions.push("create_.codex/config.toml");
  } else {
    const projectDocMaxBytes = findProjectDocMaxBytes(configText);
    if (projectDocMaxBytes === undefined || projectDocMaxBytes < 65536) {
      actions.push("set_project_doc_max_bytes");
    }
    if (!isCodexHooksEnabled(configText)) {
      actions.push("enable_features.codex_hooks");
    }
    if (compactPromptConflict) {
      actions.push("compact_prompt_requires_confirmation");
    } else if (!compactPromptManaged) {
      actions.push("install_khuym_compact_prompt");
    }
  }

  let hooksNeedMerge = false;
  if (!hooksText) {
    actions.push("create_.codex/hooks.json");
    hooksNeedMerge = true;
  } else {
    try {
      hooksNeedMerge = mergeHooksJson(hooksPath).text !== `${hooksText.replace(/\s*$/, "")}\n`;
    } catch {
      hooksNeedMerge = true;
    }
  }

  if (hooksNeedMerge) {
    actions.push("install_khuym_hook_entries");
  }

  if (hookScriptsNeedUpdate(repoRoot)) {
    actions.push("sync_khuym_hook_scripts");
  }

  if (onboarding.plugin_version !== pluginVersion) {
    actions.push("write_.khuym/onboarding.json");
  }

  return {
    repo_root: repoRoot,
    status: actions.length === 0 ? "up_to_date" : "needs_onboarding",
    actions,
    requires_confirmation: compactPromptConflict,
    details: {
      plugin_version: pluginVersion,
      agents_exists: agentsExists,
      agents_managed_block: managedAgents,
      config_exists: fs.existsSync(configPath),
      hooks_exists: fs.existsSync(hooksPath),
      compact_prompt_conflict: compactPromptConflict,
      onboarding_state: Object.keys(onboarding).length > 0 ? onboarding : null,
      runtime,
    },
  };
}

export function applyRepo(repoRoot, allowCompactPromptReplace) {
  const runtime = getNodeRuntimeStatus();
  if (!runtime.supported) {
    return buildRuntimeBlockedPayload(repoRoot, "apply");
  }

  const pluginVersion = loadPluginVersion();
  const template = readTemplate();

  const agentsPath = path.join(repoRoot, "AGENTS.md");
  const configPath = path.join(repoRoot, ".codex", "config.toml");
  const hooksPath = path.join(repoRoot, ".codex", "hooks.json");
  const onboardingPath = path.join(repoRoot, ".khuym", "onboarding.json");

  ensureParent(agentsPath);
  ensureParent(configPath);
  ensureParent(hooksPath);
  ensureParent(onboardingPath);

  const mergedAgents = mergeAgentsContent(readTextIfExists(agentsPath), template);
  fs.writeFileSync(agentsPath, mergedAgents.text, "utf8");

  const configResult = mergeCodexConfig(configPath, allowCompactPromptReplace);
  fs.writeFileSync(configPath, configResult.text, "utf8");

  const hooksResult = mergeHooksJson(hooksPath);
  fs.writeFileSync(hooksPath, hooksResult.text, "utf8");

  const hookScripts = writeHookScripts(repoRoot);

  const onboardingNotes = [];
  let status = "complete";
  if (configResult.changes.includes("compact_prompt_conflict_preserved")) {
    status = "partial";
    onboardingNotes.push(
      "Existing compact_prompt preserved; Khuym compaction recovery was not installed.",
    );
  }

  const onboardingPayload = {
    schema_version: ONBOARDING_SCHEMA_VERSION,
    plugin: "khuym",
    plugin_version: pluginVersion,
    installed_at: utcNow(),
    status,
    managed_assets: {
      agents_mode: mergedAgents.status,
      config_changes: configResult.changes,
      hook_changes: hooksResult.changes,
      hook_scripts: hookScripts,
    },
    notes: onboardingNotes,
  };
  fs.writeFileSync(`${onboardingPath}`, `${JSON.stringify(onboardingPayload, null, 2)}\n`, "utf8");

  return {
    ...checkRepo(repoRoot),
    applied: true,
    result: onboardingPayload,
  };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseCliArgs(argv) {
  const args = {
    repoRoot: undefined,
    apply: false,
    allowCompactPromptReplace: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--repo-root") {
      args.repoRoot = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg.startsWith("--repo-root=")) {
      args.repoRoot = arg.slice("--repo-root=".length);
      continue;
    }
    if (arg === "--apply") {
      args.apply = true;
      continue;
    }
    if (arg === "--allow-compact-prompt-replace") {
      args.allowCompactPromptReplace = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      process.stdout.write(
        [
          "Usage: onboard_khuym.mjs [--repo-root <path>] [--apply] [--allow-compact-prompt-replace]",
          "",
          "Checks or applies Khuym repo onboarding.",
        ].join("\n"),
      );
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

export function main(argv = process.argv.slice(2)) {
  const args = parseCliArgs(argv);
  const repoRoot = resolveRepoRoot(args.repoRoot);
  const payload = args.apply
    ? applyRepo(repoRoot, args.allowCompactPromptReplace)
    : checkRepo(repoRoot);

  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
  return payload.status === "missing_runtime" ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  process.exitCode = main();
}
