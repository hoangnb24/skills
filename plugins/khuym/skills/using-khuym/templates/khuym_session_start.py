#!/usr/bin/env python3

import json
import sys
from pathlib import Path


def find_repo_root(start: str) -> Path:
    path = Path(start or ".").resolve()
    for candidate in [path, *path.parents]:
        if (candidate / ".khuym" / "onboarding.json").exists():
            return candidate
        if (candidate / ".git").exists():
            return candidate
    return path


def main() -> int:
    payload = json.load(sys.stdin)
    repo_root = find_repo_root(payload.get("cwd", "."))
    onboarding_path = repo_root / ".khuym" / "onboarding.json"
    critical_patterns = repo_root / "history" / "learnings" / "critical-patterns.md"

    notes = []
    if onboarding_path.exists():
        notes.append(
            "Khuym onboarding is installed for this repo. Read AGENTS.md before substantive work."
        )
    else:
        notes.append(
            "Khuym onboarding is missing in this repo. Load khuym:using-khuym before continuing."
        )

    if critical_patterns.exists():
        notes.append(
            "If you move into planning or execution, read history/learnings/critical-patterns.md."
        )

    json.dump(
        {
            "hookSpecificOutput": {
                "hookEventName": "SessionStart",
                "additionalContext": " ".join(notes),
            }
        },
        sys.stdout,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
