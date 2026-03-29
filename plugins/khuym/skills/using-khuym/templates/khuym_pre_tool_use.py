#!/usr/bin/env python3

import json
import re
import sys


BARE_BV = re.compile(r"(^|\s)bv(\s|$)")


def main() -> int:
    payload = json.load(sys.stdin)
    tool_input = payload.get("tool_input") or {}
    command = tool_input.get("command", "")

    message = None
    if BARE_BV.search(command) and "--robot-" not in command:
        message = (
            "Khuym expects `bv` only with `--robot-*` flags in agent sessions. "
            "Bare `bv` launches the interactive TUI."
        )

    output = {"continue": True}
    if message:
        output["systemMessage"] = message

    json.dump(output, sys.stdout)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
