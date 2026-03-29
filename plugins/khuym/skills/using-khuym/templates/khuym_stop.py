#!/usr/bin/env python3

import json
import sys
from pathlib import Path


def find_repo_root(start: str) -> Path:
    path = Path(start or ".").resolve()
    for candidate in [path, *path.parents]:
        if (candidate / ".khuym").exists() or (candidate / ".git").exists():
            return candidate
    return path


def main() -> int:
    json.load(sys.stdin)
    json.dump({"continue": True}, sys.stdout)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
