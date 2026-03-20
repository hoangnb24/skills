#!/usr/bin/env python3
"""
Convergence checker for bead polishing rounds.

Compares two text files (e.g., bead descriptions from consecutive review rounds)
and computes a similarity score. If the score exceeds a threshold, the rounds
have converged and further polishing is unnecessary.

Usage:
    python convergence-check.py <round_n_file> <round_n_plus_1_file> [--threshold 0.85]

Exit codes:
    0 — converged (similarity >= threshold)
    1 — not converged (similarity < threshold)
    2 — error (missing files, bad arguments)
"""

import sys
import difflib
import argparse


def compute_similarity(text_a: str, text_b: str) -> float:
    """Compute sequence similarity ratio between two texts."""
    return difflib.SequenceMatcher(None, text_a, text_b).ratio()


def count_changes(text_a: str, text_b: str) -> dict:
    """Count the number and type of changes between two texts."""
    lines_a = text_a.splitlines()
    lines_b = text_b.splitlines()
    diff = list(difflib.unified_diff(lines_a, lines_b, lineterm=""))

    additions = sum(1 for line in diff if line.startswith("+") and not line.startswith("+++"))
    deletions = sum(1 for line in diff if line.startswith("-") and not line.startswith("---"))

    return {
        "additions": additions,
        "deletions": deletions,
        "total_changes": additions + deletions,
        "lines_a": len(lines_a),
        "lines_b": len(lines_b),
    }


def main():
    parser = argparse.ArgumentParser(description="Check convergence between polish rounds")
    parser.add_argument("file_a", help="File from round N")
    parser.add_argument("file_b", help="File from round N+1")
    parser.add_argument("--threshold", type=float, default=0.85, help="Similarity threshold (default: 0.85)")
    parser.add_argument("--json", action="store_true", help="Output as JSON for robot mode")

    args = parser.parse_args()

    try:
        with open(args.file_a, "r") as f:
            text_a = f.read()
        with open(args.file_b, "r") as f:
            text_b = f.read()
    except FileNotFoundError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(2)

    similarity = compute_similarity(text_a, text_b)
    changes = count_changes(text_a, text_b)
    converged = similarity >= args.threshold

    if args.json:
        import json
        result = {
            "converged": converged,
            "similarity": round(similarity, 4),
            "threshold": args.threshold,
            "changes": changes,
        }
        print(json.dumps(result))
    else:
        status = "CONVERGED" if converged else "NOT CONVERGED"
        print(f"Status: {status}")
        print(f"Similarity: {similarity:.2%} (threshold: {args.threshold:.0%})")
        print(f"Changes: +{changes['additions']} -{changes['deletions']} ({changes['total_changes']} total)")
        print(f"Lines: {changes['lines_a']} → {changes['lines_b']}")

    sys.exit(0 if converged else 1)


if __name__ == "__main__":
    main()
