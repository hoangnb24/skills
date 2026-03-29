#!/usr/bin/env python3

import argparse
import json
import re
import shutil
import subprocess
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import toml


SCRIPT_PATH = Path(__file__).resolve()
USING_KHUYM_DIR = SCRIPT_PATH.parent.parent
PLUGIN_ROOT = USING_KHUYM_DIR.parent.parent
PLUGIN_MANIFEST_PATH = PLUGIN_ROOT / ".codex-plugin" / "plugin.json"
AGENTS_TEMPLATE_PATH = PLUGIN_ROOT / "AGENTS.template.md"
HOOK_TEMPLATES_DIR = USING_KHUYM_DIR / "templates"
ONBOARDING_SCHEMA_VERSION = "1.0"
COMPACT_PROMPT_MARKER_START = "# KHUYM: compact_prompt start"
COMPACT_PROMPT_MARKER_END = "# KHUYM: compact_prompt end"
MANAGED_HOOK_COMMAND_PREFIX = "python3 \"$(git rev-parse --show-toplevel 2>/dev/null || pwd)/.codex/hooks/"


@dataclass
class ConfigMergeResult:
    text: str
    compact_prompt_status: str
    compact_prompt_replaced: bool


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def load_plugin_version() -> str:
    return json.loads(PLUGIN_MANIFEST_PATH.read_text(encoding="utf-8"))["version"]


def resolve_repo_root(explicit_root: Optional[str]) -> Path:
    if explicit_root:
        return Path(explicit_root).resolve()

    cwd = Path.cwd().resolve()
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"],
            cwd=str(cwd),
            capture_output=True,
            text=True,
            check=True,
        )
        return Path(result.stdout.strip()).resolve()
    except Exception:
        for candidate in [cwd, *cwd.parents]:
            if (candidate / ".git").exists():
                return candidate
        return cwd


def read_template() -> str:
    return AGENTS_TEMPLATE_PATH.read_text(encoding="utf-8").rstrip() + "\n"


def load_existing_toml(path: Path) -> Dict:
    if not path.exists():
        return {}
    try:
        return toml.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        raise RuntimeError(f"Unable to parse TOML at {path}: {exc}") from exc


def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def managed_agents_present(text: str) -> bool:
    return "<!-- KHUYM:START -->" in text and "<!-- KHUYM:END -->" in text


def merge_agents_content(existing: str, template: str) -> Tuple[str, str]:
    stripped = existing.strip()
    if not stripped:
        return template, "created_from_template"

    if managed_agents_present(existing):
        updated = re.sub(
            r"<!-- KHUYM:START -->.*?<!-- KHUYM:END -->\n?",
            template,
            existing,
            flags=re.DOTALL,
        )
        return updated.rstrip() + "\n", "updated_managed_block"

    glue = "\n\n" if not existing.endswith("\n\n") else ""
    return existing.rstrip() + glue + template, "appended_managed_block"


def insert_before_first_table(text: str, block: str) -> str:
    match = re.search(r"(?m)^\[", text)
    if match:
        return text[: match.start()] + block + "\n" + text[match.start() :]
    return text.rstrip() + ("\n\n" if text.strip() else "") + block + "\n"


def upsert_project_doc_max_bytes(text: str, existing_value) -> str:
    desired = 65536
    line = f"project_doc_max_bytes = {desired}"

    if existing_value is None:
        block = line + "\n"
        return insert_before_first_table(text, block)

    try:
        if int(existing_value) >= desired:
            return text
    except Exception:
        pass

    return re.sub(
        r"(?m)^project_doc_max_bytes\s*=\s*.+$",
        line,
        text,
        count=1,
    )


def upsert_features_codex_hooks(text: str) -> str:
    section_re = re.compile(r"(?ms)^\[features\]\n(?P<body>.*?)(?=^\[|\Z)")
    match = section_re.search(text)
    if not match:
        block = "[features]\ncodex_hooks = true\n"
        suffix = "\n" if text and not text.endswith("\n") else ""
        return text + suffix + ("\n" if text.strip() else "") + block

    body = match.group("body")
    if re.search(r"(?m)^codex_hooks\s*=", body):
        body = re.sub(r"(?m)^codex_hooks\s*=.*$", "codex_hooks = true", body, count=1)
    else:
        if body and not body.endswith("\n"):
            body += "\n"
        body += "codex_hooks = true\n"

    return text[: match.start("body")] + body + text[match.end("body") :]


def render_compact_prompt_block() -> str:
    return "\n".join(
        [
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
        ]
    )


def merge_compact_prompt(text: str, toml_data: Dict, allow_replace: bool) -> ConfigMergeResult:
    if COMPACT_PROMPT_MARKER_START in text and COMPACT_PROMPT_MARKER_END in text:
        updated = re.sub(
            rf"{re.escape(COMPACT_PROMPT_MARKER_START)}.*?{re.escape(COMPACT_PROMPT_MARKER_END)}\n?",
            render_compact_prompt_block(),
            text,
            flags=re.DOTALL,
        )
        return ConfigMergeResult(updated, "managed", True)

    existing_value = toml_data.get("compact_prompt")
    if existing_value and not allow_replace:
        return ConfigMergeResult(text, "conflict_preserved", False)

    if existing_value and allow_replace:
        updated = re.sub(
            r'(?ms)^compact_prompt\s*=\s*""".*?"""\s*$',
            render_compact_prompt_block().rstrip(),
            text,
            count=1,
        )
        if updated == text:
            updated = re.sub(
                r"(?m)^compact_prompt\s*=\s*.+$",
                render_compact_prompt_block().rstrip(),
                text,
                count=1,
            )
        return ConfigMergeResult(updated, "replaced", True)

    block = render_compact_prompt_block()
    return ConfigMergeResult(insert_before_first_table(text, block), "installed", True)


def merge_codex_config(path: Path, allow_compact_prompt_replace: bool) -> Tuple[str, List[str]]:
    existing_text = path.read_text(encoding="utf-8") if path.exists() else ""
    toml_data = load_existing_toml(path)
    changes: List[str] = []

    updated_text = existing_text
    next_text = upsert_project_doc_max_bytes(updated_text, toml_data.get("project_doc_max_bytes"))
    if next_text != updated_text:
        changes.append("set_project_doc_max_bytes")
        updated_text = next_text

    next_text = upsert_features_codex_hooks(updated_text)
    if next_text != updated_text:
        changes.append("enable_codex_hooks_feature")
        updated_text = next_text

    compact_result = merge_compact_prompt(updated_text, toml_data, allow_compact_prompt_replace)
    if compact_result.text != updated_text:
        changes.append(f"compact_prompt_{compact_result.compact_prompt_status}")
        updated_text = compact_result.text
    elif compact_result.compact_prompt_status == "conflict_preserved":
        changes.append("compact_prompt_conflict_preserved")

    return updated_text.rstrip() + "\n", changes


def render_managed_hook_entries() -> Dict[str, List[Dict]]:
    return {
        "SessionStart": [
            {
                "matcher": "startup|resume",
                "hooks": [
                    {
                        "type": "command",
                        "command": MANAGED_HOOK_COMMAND_PREFIX + 'khuym_session_start.py"',
                        "statusMessage": "Khuym: session bootstrap",
                    }
                ],
            }
        ],
        "PreToolUse": [
            {
                "matcher": "Bash",
                "hooks": [
                    {
                        "type": "command",
                        "command": MANAGED_HOOK_COMMAND_PREFIX + 'khuym_pre_tool_use.py"',
                        "statusMessage": "Khuym: shell guardrails",
                    }
                ],
            }
        ],
        "Stop": [
            {
                "hooks": [
                    {
                        "type": "command",
                        "command": MANAGED_HOOK_COMMAND_PREFIX + 'khuym_stop.py"',
                        "statusMessage": "Khuym: end-of-turn check",
                    }
                ],
            }
        ],
    }


def is_khuym_hook_entry(entry: Dict) -> bool:
    for hook in entry.get("hooks", []):
        command = hook.get("command", "")
        status = hook.get("statusMessage", "")
        if "/.codex/hooks/khuym_" in command or status.startswith("Khuym:"):
            return True
    return False


def merge_hooks_json(path: Path) -> Tuple[str, List[str]]:
    existing = {}
    if path.exists():
        try:
            existing = json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            raise RuntimeError(f"Unable to parse JSON at {path}: {exc}") from exc

    hooks = existing.get("hooks", {})
    changes: List[str] = []
    managed = render_managed_hook_entries()

    for event_name, entries in managed.items():
        current_entries = hooks.get(event_name, [])
        filtered = [entry for entry in current_entries if not is_khuym_hook_entry(entry)]
        hooks[event_name] = filtered + entries
        changes.append(f"upsert_{event_name}")

    merged = dict(existing)
    merged["hooks"] = hooks
    return json.dumps(merged, indent=2, sort_keys=True) + "\n", changes


def write_hook_scripts(repo_root: Path) -> List[str]:
    hooks_dir = repo_root / ".codex" / "hooks"
    hooks_dir.mkdir(parents=True, exist_ok=True)
    written = []
    for name in ("khuym_session_start.py", "khuym_pre_tool_use.py", "khuym_stop.py"):
        source = HOOK_TEMPLATES_DIR / name
        target = hooks_dir / name
        shutil.copyfile(source, target)
        target.chmod(0o755)
        written.append(str(target.relative_to(repo_root)))
    return written


def check_repo(repo_root: Path) -> Dict:
    plugin_version = load_plugin_version()
    agents_path = repo_root / "AGENTS.md"
    config_path = repo_root / ".codex" / "config.toml"
    hooks_path = repo_root / ".codex" / "hooks.json"
    onboarding_path = repo_root / ".khuym" / "onboarding.json"

    agents_exists = agents_path.exists() and agents_path.read_text(encoding="utf-8").strip() != ""
    managed_agents = agents_exists and managed_agents_present(agents_path.read_text(encoding="utf-8"))

    config_data = load_existing_toml(config_path) if config_path.exists() else {}
    hooks_data = {}
    if hooks_path.exists():
        try:
            hooks_data = json.loads(hooks_path.read_text(encoding="utf-8"))
        except Exception:
            hooks_data = {}

    onboarding = {}
    if onboarding_path.exists():
        try:
            onboarding = json.loads(onboarding_path.read_text(encoding="utf-8"))
        except Exception:
            onboarding = {}

    has_managed_hooks = False
    for entries in hooks_data.get("hooks", {}).values():
        if any(is_khuym_hook_entry(entry) for entry in entries):
            has_managed_hooks = True
            break

    compact_prompt_value = config_data.get("compact_prompt")
    compact_prompt_managed = False
    compact_prompt_conflict = False
    if config_path.exists():
        config_text = config_path.read_text(encoding="utf-8")
        compact_prompt_managed = COMPACT_PROMPT_MARKER_START in config_text
        compact_prompt_conflict = bool(compact_prompt_value) and not compact_prompt_managed

    actions = []
    if not agents_exists:
        actions.append("create_AGENTS.md")
    elif not managed_agents:
        actions.append("append_khuym_managed_block_to_AGENTS.md")

    if not config_path.exists():
        actions.append("create_.codex/config.toml")
    else:
        if not config_data.get("project_doc_max_bytes") or int(config_data.get("project_doc_max_bytes", 0)) < 65536:
            actions.append("set_project_doc_max_bytes")
        if not config_data.get("features", {}).get("codex_hooks"):
            actions.append("enable_features.codex_hooks")
        if compact_prompt_conflict:
            actions.append("compact_prompt_requires_confirmation")
        elif not compact_prompt_managed:
            actions.append("install_khuym_compact_prompt")

    if not hooks_path.exists():
        actions.append("create_.codex/hooks.json")
    if not has_managed_hooks:
        actions.append("install_khuym_hook_entries")

    if onboarding.get("plugin_version") != plugin_version:
        actions.append("write_.khuym/onboarding.json")

    status = "up_to_date" if not actions else "needs_onboarding"
    return {
        "repo_root": str(repo_root),
        "status": status,
        "actions": actions,
        "requires_confirmation": compact_prompt_conflict,
        "details": {
            "plugin_version": plugin_version,
            "agents_exists": agents_exists,
            "agents_managed_block": managed_agents,
            "config_exists": config_path.exists(),
            "hooks_exists": hooks_path.exists(),
            "has_managed_hooks": has_managed_hooks,
            "compact_prompt_conflict": compact_prompt_conflict,
            "onboarding_state": onboarding or None,
        },
    }


def apply_repo(repo_root: Path, allow_compact_prompt_replace: bool) -> Dict:
    plugin_version = load_plugin_version()
    template = read_template()

    agents_path = repo_root / "AGENTS.md"
    config_path = repo_root / ".codex" / "config.toml"
    hooks_path = repo_root / ".codex" / "hooks.json"
    onboarding_path = repo_root / ".khuym" / "onboarding.json"
    ensure_parent(agents_path)
    ensure_parent(config_path)
    ensure_parent(hooks_path)
    ensure_parent(onboarding_path)

    existing_agents = agents_path.read_text(encoding="utf-8") if agents_path.exists() else ""
    merged_agents, agents_status = merge_agents_content(existing_agents, template)
    agents_path.write_text(merged_agents, encoding="utf-8")

    config_text, config_changes = merge_codex_config(config_path, allow_compact_prompt_replace)
    config_path.write_text(config_text, encoding="utf-8")

    hooks_text, hooks_changes = merge_hooks_json(hooks_path)
    hooks_path.write_text(hooks_text, encoding="utf-8")
    hook_scripts = write_hook_scripts(repo_root)

    onboarding_notes = []
    status = "complete"
    if "compact_prompt_conflict_preserved" in config_changes:
        status = "partial"
        onboarding_notes.append(
            "Existing compact_prompt preserved; Khuym compaction recovery was not installed."
        )

    onboarding_payload = {
        "schema_version": ONBOARDING_SCHEMA_VERSION,
        "plugin": "khuym",
        "plugin_version": plugin_version,
        "installed_at": utc_now(),
        "status": status,
        "managed_assets": {
            "agents_mode": agents_status,
            "config_changes": config_changes,
            "hook_changes": hooks_changes,
            "hook_scripts": hook_scripts,
        },
        "notes": onboarding_notes,
    }
    onboarding_path.write_text(
        json.dumps(onboarding_payload, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )

    final_summary = check_repo(repo_root)
    return {
        **final_summary,
        "applied": True,
        "result": onboarding_payload,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Check or apply Khuym repo onboarding.")
    parser.add_argument("--repo-root", help="Repository root to inspect or modify.")
    parser.add_argument("--apply", action="store_true", help="Apply onboarding changes.")
    parser.add_argument(
        "--allow-compact-prompt-replace",
        action="store_true",
        help="Replace an existing non-Khuym compact_prompt.",
    )
    args = parser.parse_args()

    repo_root = resolve_repo_root(args.repo_root)
    payload = (
        apply_repo(repo_root, args.allow_compact_prompt_replace)
        if args.apply
        else check_repo(repo_root)
    )
    print(json.dumps(payload, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
