import json
import tempfile
import unittest
from pathlib import Path

import _extract_path  # noqa: F401

VALID_TOML = """\
model = "grok-4.6"
client_side_loop_cap = 4

[paths]
data_json = "../../public/data/data.json"
pending = "queues/pending.jsonl"
refresh_jsonl = "queues/refresh.jsonl"
refresh_state = "queues/refresh_state.json"
extract_prompt = "prompts/extract.txt"
search_prompt = "prompts/search.txt"

[search]
max_candidates = 5
max_extracts = 3
aggregators = ["211la.org", "yelp.com"]
excluded_domains = ["yelp.com", "wikipedia.org", "facebook.com", "instagram.com", "reddit.com"]

[refresh]
default_limit = 3
min_age_days = 7

[tag_caps]
type = 11
audience = 6
language = 12
other = 3
neighborhood = 10
zipcode = 4
eligibility = 2
"""


def _write_config(root: Path, text: str = VALID_TOML) -> Path:
    path = root / "config.toml"
    path.write_text(text, encoding="utf-8")
    return path


class LoadSettingsTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.addCleanup(self.tmp.cleanup)

    def test_loads_tunables_and_resolves_paths(self) -> None:
        from settings import load_settings

        _write_config(self.root)
        loaded = load_settings(extract_dir=self.root)
        self.assertEqual(loaded.model, "grok-4.6")
        self.assertEqual(loaded.client_side_loop_cap, 4)
        self.assertEqual(loaded.max_candidates, 5)
        self.assertEqual(loaded.max_extracts, 3)
        self.assertEqual(loaded.aggregators, ("211la.org", "yelp.com"))
        self.assertEqual(
            loaded.excluded_domains,
            ("yelp.com", "wikipedia.org", "facebook.com", "instagram.com", "reddit.com"),
        )
        self.assertEqual(loaded.refresh_default_limit, 3)
        self.assertEqual(loaded.refresh_min_age_days, 7)
        self.assertEqual(loaded.tag_caps.type, 11)
        self.assertEqual(loaded.tag_caps.zipcode, 4)
        self.assertEqual(loaded.pending, (self.root / "queues" / "pending.jsonl").resolve())
        self.assertEqual(
            loaded.data_json,
            (self.root / "../../public/data/data.json").resolve(),
        )

    def test_missing_config_file_exits(self) -> None:
        from settings import load_settings

        with self.assertRaises(SystemExit) as raised:
            load_settings(extract_dir=self.root)
        self.assertIn("missing config", str(raised.exception))

    def test_missing_top_level_key_exits(self) -> None:
        from settings import load_settings

        _write_config(self.root, VALID_TOML.replace("model = \"grok-4.6\"\n", ""))
        with self.assertRaises(SystemExit) as raised:
            load_settings(extract_dir=self.root)
        self.assertIn("model", str(raised.exception))

    def test_missing_nested_key_exits(self) -> None:
        from settings import load_settings

        _write_config(self.root, VALID_TOML.replace('pending = "queues/pending.jsonl"\n', ""))
        with self.assertRaises(SystemExit) as raised:
            load_settings(extract_dir=self.root)
        self.assertIn("paths.pending", str(raised.exception))

    def test_repo_config_loads(self) -> None:
        from settings import EXTRACT_DIR, load_settings

        loaded = load_settings()
        self.assertEqual(loaded.model, "grok-4.6")
        self.assertEqual(loaded.pending, (EXTRACT_DIR / "queues" / "pending.jsonl").resolve())
        self.assertTrue(str(loaded.data_json).endswith("public/data/data.json"))


class SharedIoTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.addCleanup(self.tmp.cleanup)

    def test_website_of_strips_blank(self) -> None:
        from settings import website_of

        self.assertEqual(website_of({"website": " https://a.org/ "}), "https://a.org/")
        self.assertEqual(website_of({}), "")

    def test_load_jsonl_skips_bad_and_empty_lines(self) -> None:
        from settings import load_jsonl

        path = self.root / "rows.jsonl"
        first = {"resource_id": "0"}
        second = {"resource_id": "1"}
        path.write_text(
            json.dumps(first) + "\nnot-json\n\n" + json.dumps(second) + "\n",
            encoding="utf-8",
        )
        self.assertEqual(load_jsonl(path), [first, second])

    def test_load_data_json_requires_file(self) -> None:
        from settings import load_data_json

        missing = self.root / "missing.json"
        with self.assertRaises(SystemExit) as raised:
            load_data_json(missing)
        self.assertIn("missing resource database", str(raised.exception))

    def test_load_data_json_reads_object(self) -> None:
        from settings import load_data_json

        path = self.root / "data.json"
        payload = {"0": {"name": "A"}}
        path.write_text(json.dumps(payload), encoding="utf-8")
        self.assertEqual(load_data_json(path), payload)


if __name__ == "__main__":
    unittest.main()
