import json
import tempfile
import unittest
from pathlib import Path
from unittest import mock

import _extract_path  # noqa: F401
import tools

MIN_DRAFT = {
    "name": "Jenesse Center",
    "website": "https://jenesse.org/",
    "source_url": "https://jenesse.org/",
    "confidence": 0.9,
}


class PersistTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.pending = Path(self.tmp.name) / "pending.json"
        self.patcher = mock.patch.object(tools, "PENDING", self.pending)
        self.patcher.start()

    def tearDown(self) -> None:
        self.patcher.stop()
        self.tmp.cleanup()

    def test_persist_true_writes_pending_and_returns_resource(self) -> None:
        tools.reset_submit()
        result = tools.submit_resource(MIN_DRAFT)
        self.assertTrue(result["ok"])
        self.assertEqual(result["written_to"], str(self.pending))
        self.assertEqual(result["resource"]["name"], "Jenesse Center")
        self.assertEqual(
            json.loads(self.pending.read_text(encoding="utf-8")),
            result["resource"],
        )

    def test_persist_false_skips_pending_and_returns_resource(self) -> None:
        tools.reset_submit()
        result = tools.submit_resource(MIN_DRAFT, persist=False)
        self.assertTrue(result["ok"])
        self.assertIsNone(result["written_to"])
        self.assertEqual(result["resource"]["website"], "https://jenesse.org/")
        self.assertFalse(self.pending.exists())

    def test_persist_false_does_not_skip_later_write(self) -> None:
        tools.reset_submit()
        tools.submit_resource(MIN_DRAFT, persist=False)
        tools.reset_submit()
        result = tools.submit_resource(MIN_DRAFT)
        self.assertTrue(result["ok"])
        self.assertEqual(result["written_to"], str(self.pending))
        self.assertTrue(self.pending.exists())

    def test_parse_tool_args_rejects_non_object(self) -> None:
        args, errors = tools.parse_tool_args("[1]")
        self.assertIsNone(args)
        self.assertEqual(errors, ["tool arguments must be a JSON object"])

    def test_submit_fills_neighborhood_from_hq_zip(self) -> None:
        tools.reset_submit()
        result = tools.submit_resource(
            {**MIN_DRAFT, "zipcode": ["90032"]}, persist=False
        )
        self.assertTrue(result["ok"])
        self.assertEqual(result["resource"]["neighborhood"], ["Eastside"])


if __name__ == "__main__":
    unittest.main()
