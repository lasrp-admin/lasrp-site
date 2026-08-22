import unittest

import _extract_path  # noqa: F401
from score import score_case, tag_f1


JENESSE_GOLD = {
    "id": "0",
    "short": "Jenesse",
    "url": "https://jenesse.org/",
    "name": "Jenesse Center",
    "website": "https://jenesse.org/",
    "phone": "(800) 479-7328",
    "hours": "24/7 Hotline",
    "email": "info@jenesse.org",
    "address": "P.O. Box 8476, Los Angeles, CA 90008",
    "type": ["Domestic Violence & Trauma Survivorship"],
    "audience": ["Women", "Families & Parents"],
    "language": [],
    "zipcode": ["90008"],
    "neighborhood": [],
}


def _draft(**overrides):
    row = {
        "name": "Jenesse Center",
        "website": "https://www.jenesse.org/",
        "phone": "800-479-7328",
        "hours": "Hotline 24 hours a day, 7 days a week",
        "email": "info@jenesse.org",
        "address": "P.O. Box 8476, Los Angeles, CA 90008",
        "type": ["Domestic Violence & Trauma Survivorship"],
        "audience": ["Women", "Families & Parents"],
        "language": [],
        "zipcode": ["90008"],
        "neighborhood": [],
    }
    row.update(overrides)
    return row


class TagF1Tests(unittest.TestCase):
    def test_both_empty_is_perfect(self) -> None:
        self.assertEqual(tag_f1([], []), 1.0)

    def test_identical_tags_are_perfect(self) -> None:
        self.assertEqual(tag_f1(["Spanish"], ["Spanish"]), 1.0)

    def test_partial_overlap(self) -> None:
        self.assertAlmostEqual(tag_f1(["Women"], ["Women", "Families & Parents"]), 2 / 3)


class Track1Tests(unittest.TestCase):
    def test_matching_contact_facts_pass(self) -> None:
        result = score_case(JENESSE_GOLD, _draft(), submitted=True)
        self.assertTrue(result["track1_pass"])
        self.assertEqual(result["track1_failures"], [])

    def test_missing_submit_fails_track1(self) -> None:
        result = score_case(JENESSE_GOLD, None, submitted=False)
        self.assertFalse(result["track1_pass"])
        self.assertIn("submit", result["track1_failures"])

    def test_phone_format_difference_is_not_a_failure(self) -> None:
        result = score_case(JENESSE_GOLD, _draft(phone="(800) 479-7328"), submitted=True)
        self.assertNotIn("phone", result["track1_failures"])

    def test_blank_phone_is_not_a_failure(self) -> None:
        result = score_case(JENESSE_GOLD, _draft(phone=""), submitted=True)
        self.assertNotIn("phone", result["track1_failures"])

    def test_wrong_phone_fails_track1(self) -> None:
        result = score_case(JENESSE_GOLD, _draft(phone="323-299-9496"), submitted=True)
        self.assertIn("phone", result["track1_failures"])
        self.assertFalse(result["track1_pass"])

    def test_blank_email_is_not_a_failure(self) -> None:
        result = score_case(JENESSE_GOLD, _draft(email=""), submitted=True)
        self.assertNotIn("email", result["track1_failures"])

    def test_wrong_email_fails_when_gold_has_one(self) -> None:
        result = score_case(
            JENESSE_GOLD, _draft(email="cwalter@pickharbor.org"), submitted=True
        )
        self.assertIn("email", result["track1_failures"])

    def test_agent_email_ok_when_gold_email_empty(self) -> None:
        gold = dict(JENESSE_GOLD, email="")
        result = score_case(gold, _draft(email="info@jenesse.org"), submitted=True)
        self.assertNotIn("email", result["track1_failures"])

    def test_legal_name_containing_gold_name_passes(self) -> None:
        gold = dict(JENESSE_GOLD, name="Neighborhood Legal Services")
        result = score_case(
            gold,
            _draft(name="Neighborhood Legal Services of Los Angeles County"),
            submitted=True,
        )
        self.assertNotIn("name", result["track1_failures"])

    def test_website_www_is_same_host(self) -> None:
        result = score_case(JENESSE_GOLD, _draft(), submitted=True)
        self.assertNotIn("website", result["track1_failures"])

    def test_wrong_host_fails_track1(self) -> None:
        result = score_case(
            JENESSE_GOLD, _draft(website="https://211la.org/jenesse"), submitted=True
        )
        self.assertIn("website", result["track1_failures"])


class Track2Tests(unittest.TestCase):
    def test_reports_type_f1_without_failing_track1(self) -> None:
        result = score_case(
            JENESSE_GOLD,
            _draft(type=["Child Support & Youth Services"]),
            submitted=True,
        )
        self.assertEqual(result["type_f1"], 0.0)
        self.assertTrue(result["track1_pass"])

    def test_empty_language_both_sides_is_perfect(self) -> None:
        result = score_case(JENESSE_GOLD, _draft(language=[]), submitted=True)
        self.assertEqual(result["language_f1"], 1.0)

    def test_reports_predicted_tags(self) -> None:
        result = score_case(
            JENESSE_GOLD, _draft(language=["English"]), submitted=True
        )
        self.assertEqual(result["predicted"]["language"], ["English"])
        self.assertEqual(result["predicted"]["zipcode"], ["90008"])

    def test_neighborhood_f1_uses_case_gold_not_service_area(self) -> None:
        gold = dict(
            JENESSE_GOLD,
            neighborhood=["Eastside"],
        )
        result = score_case(gold, _draft(neighborhood=["Eastside"]), submitted=True)
        self.assertEqual(result["neighborhood_f1"], 1.0)
        result_empty = score_case(gold, _draft(neighborhood=[]), submitted=True)
        self.assertEqual(result_empty["neighborhood_f1"], 0.0)
        self.assertTrue(result_empty["track1_pass"])


if __name__ == "__main__":
    unittest.main()
