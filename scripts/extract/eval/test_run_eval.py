import json
import tempfile
import unittest
from pathlib import Path
from unittest import mock

import _extract_path  # noqa: F401
import run_eval
from loop import SubmitResult


def _payload(name="Jenesse Center", website="https://jenesse.org/", **extra):
    resource = {
        "name": name,
        "website": website,
        "phone": "800-479-7328",
        "hours": "24/7 Hotline",
        "email": "info@jenesse.org",
        "address": "P.O. Box 8476, Los Angeles, CA 90008",
        "type": ["Domestic Violence & Trauma Survivorship"],
        "audience": ["Women", "Families & Parents"],
        "language": [],
        "zipcode": ["90008"],
        "neighborhood": [],
    }
    resource.update(extra)
    return {"ok": True, "resource": resource}


class RunEvalTests(unittest.TestCase):
    def test_calls_extract_with_persist_false(self) -> None:
        extract = mock.Mock(
            return_value=SubmitResult(payload=_payload())
        )
        cases = [
            {
                "id": "0",
                "short": "Jenesse",
                "url": "https://jenesse.org/",
                "name": "Jenesse Center",
                "website": "https://jenesse.org/",
                "phone": "(800) 479-7328",
                "hours": "24/7 Hotline",
                "email": "info@jenesse.org",
                "address": "P.O. Box 8476",
                "type": ["Domestic Violence & Trauma Survivorship"],
                "audience": [],
                "language": [],
                "neighborhood": [],
            }
        ]
        report = run_eval.run_cases(cases, extract_fn=extract)
        extract.assert_called_once_with("https://jenesse.org/", persist=False)
        self.assertEqual(len(report["results"]), 1)
        self.assertTrue(report["results"][0]["track1_pass"])

    def test_extract_exception_is_recorded_as_submit_failure(self) -> None:
        def boom(url, persist=False):
            raise RuntimeError("api down")

        report = run_eval.run_cases(
            [
                {
                    "id": "0",
                    "short": "Jenesse",
                    "url": "https://jenesse.org/",
                    "name": "Jenesse Center",
                    "website": "https://jenesse.org/",
                    "phone": "",
                    "hours": "",
                    "email": "",
                    "address": "",
                    "type": [],
                    "audience": [],
                    "language": [],
                    "neighborhood": [],
                }
            ],
            extract_fn=boom,
        )
        self.assertFalse(report["results"][0]["track1_pass"])
        self.assertIn("submit", report["results"][0]["track1_failures"])
        self.assertEqual(report["results"][0]["extract_fail"], "RuntimeError")

    def test_writes_results_json(self) -> None:
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        out = Path(tmp.name) / "results.json"
        extract = mock.Mock(return_value=SubmitResult(payload=_payload()))
        report = run_eval.run_cases(
            [
                {
                    "id": "0",
                    "short": "Jenesse",
                    "url": "https://jenesse.org/",
                    "name": "Jenesse Center",
                    "website": "https://jenesse.org/",
                    "phone": "800-479-7328",
                    "hours": "",
                    "email": "",
                    "address": "",
                    "type": [],
                    "audience": [],
                    "language": [],
                    "neighborhood": [],
                }
            ],
            extract_fn=extract,
        )
        run_eval.write_report(report, out)
        saved = json.loads(out.read_text(encoding="utf-8"))
        self.assertIn("prompt_sha256", saved)
        self.assertIn("model", saved)
        self.assertEqual(saved["results"][0]["id"], "0")


if __name__ == "__main__":
    unittest.main()
