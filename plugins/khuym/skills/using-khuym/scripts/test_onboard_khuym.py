#!/usr/bin/env python3

import json
import tempfile
import unittest
from pathlib import Path

import onboard_khuym


class OnboardKhuymTests(unittest.TestCase):
    def test_apply_creates_full_repo_onboarding(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            root = Path(tmpdir)
            result = onboard_khuym.apply_repo(root, allow_compact_prompt_replace=False)

            self.assertEqual(result["result"]["status"], "complete")
            self.assertEqual(result["status"], "up_to_date")
            self.assertTrue((root / "AGENTS.md").exists())
            self.assertIn("Khuym Workflow", (root / "AGENTS.md").read_text(encoding="utf-8"))
            self.assertTrue((root / ".codex" / "config.toml").exists())
            self.assertTrue((root / ".codex" / "hooks.json").exists())
            self.assertTrue((root / ".khuym" / "onboarding.json").exists())

    def test_apply_appends_managed_block_to_existing_agents(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            root = Path(tmpdir)
            (root / "AGENTS.md").write_text("# Existing instructions\n", encoding="utf-8")

            onboard_khuym.apply_repo(root, allow_compact_prompt_replace=False)
            agents_text = (root / "AGENTS.md").read_text(encoding="utf-8")

            self.assertIn("# Existing instructions", agents_text)
            self.assertIn("<!-- KHUYM:START -->", agents_text)
            self.assertEqual(agents_text.count("<!-- KHUYM:START -->"), 1)

    def test_existing_compact_prompt_is_preserved_without_explicit_replace(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            root = Path(tmpdir)
            codex_dir = root / ".codex"
            codex_dir.mkdir(parents=True)
            (codex_dir / "config.toml").write_text(
                'compact_prompt = """keep me"""\n',
                encoding="utf-8",
            )

            result = onboard_khuym.apply_repo(root, allow_compact_prompt_replace=False)
            config_text = (codex_dir / "config.toml").read_text(encoding="utf-8")

            self.assertIn('compact_prompt = """keep me"""', config_text)
            self.assertEqual(result["result"]["status"], "partial")
            self.assertIn("compact_prompt", json.dumps(result["result"]))


if __name__ == "__main__":
    unittest.main()
