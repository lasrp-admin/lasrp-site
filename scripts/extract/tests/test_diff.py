import unittest

import _extract_path  # noqa: F401
from diff import already_pending, proposed_diffs


class ProposedDiffTests(unittest.TestCase):
    def test_phone_format_is_not_a_diff(self) -> None:
        diffs = proposed_diffs(
            {"phone": "(800) 479-7328"},
            {"phone": "800-479-7328"},
        )
        self.assertEqual(diffs, [])

    def test_hours_247_paraphrase_is_not_a_diff(self) -> None:
        diffs = proposed_diffs(
            {"hours": "24/7 Hotline"},
            {"hours": "Hotline available 24 hours a day, 7 days a week"},
        )
        self.assertEqual(diffs, [])

    def test_hours_247_without_extra_words_is_not_a_diff(self) -> None:
        diffs = proposed_diffs(
            {"hours": "24/7"},
            {"hours": "24 hours a day, 7 days a week"},
        )
        self.assertEqual(diffs, [])

    def test_blank_extract_does_not_clear_published_value(self) -> None:
        diffs = proposed_diffs(
            {"phone": "(800) 479-7328"},
            {"phone": ""},
        )
        self.assertEqual(diffs, [])

    def test_extracted_value_fills_blank_published_field(self) -> None:
        diffs = proposed_diffs(
            {"email": ""},
            {"email": "info@jenesse.org"},
        )
        self.assertEqual(
            diffs,
            [
                {
                    "field": "email",
                    "old_value": "",
                    "new_value": "info@jenesse.org",
                }
            ],
        )

    def test_website_www_and_slash_are_not_a_diff(self) -> None:
        diffs = proposed_diffs(
            {"website": "https://jenesse.org/"},
            {"website": "https://www.Jenesse.org"},
        )
        self.assertEqual(diffs, [])

    def test_different_hours_are_a_diff(self) -> None:
        diffs = proposed_diffs(
            {"hours": "Mon-Fri 9am-5pm"},
            {"hours": "Saturday 10-2"},
        )
        self.assertEqual(
            diffs,
            [
                {
                    "field": "hours",
                    "old_value": "Mon-Fri 9am-5pm",
                    "new_value": "Saturday 10-2",
                }
            ],
        )

    def test_hours_weekday_abbreviation_is_not_a_diff(self) -> None:
        diffs = proposed_diffs(
            {"hours": "Mon-Fri 9am-5pm"},
            {"hours": "Monday-Friday 9am-5pm"},
        )
        self.assertEqual(diffs, [])

    def test_hours_colon_zero_zero_is_not_a_diff(self) -> None:
        diffs = proposed_diffs(
            {"hours": "9am-5pm"},
            {"hours": "9:00am-5:00pm"},
        )
        self.assertEqual(diffs, [])

    def test_hours_added_day_is_a_diff(self) -> None:
        diffs = proposed_diffs(
            {"hours": "Mon-Fri 9am-5pm"},
            {"hours": "Mon-Fri 9am-5pm Saturday"},
        )
        self.assertEqual(
            diffs,
            [
                {
                    "field": "hours",
                    "old_value": "Mon-Fri 9am-5pm",
                    "new_value": "Mon-Fri 9am-5pm Saturday",
                }
            ],
        )

    def test_hours_dropped_days_is_a_diff(self) -> None:
        published = "Monday Tuesday Wednesday"
        extracted = "Monday"
        self.assertEqual(
            proposed_diffs({"hours": published}, {"hours": extracted}),
            [
                {
                    "field": "hours",
                    "old_value": published,
                    "new_value": extracted,
                }
            ],
        )
        self.assertEqual(
            proposed_diffs({"hours": extracted}, {"hours": published}),
            [
                {
                    "field": "hours",
                    "old_value": extracted,
                    "new_value": published,
                }
            ],
        )

    def test_hours_added_open_days_is_a_diff(self) -> None:
        diffs = proposed_diffs(
            {"hours": "Closed Sunday"},
            {"hours": "Open Monday-Saturday, Closed Sunday"},
        )
        self.assertEqual(
            diffs,
            [
                {
                    "field": "hours",
                    "old_value": "Closed Sunday",
                    "new_value": "Open Monday-Saturday, Closed Sunday",
                }
            ],
        )

    def test_hours_open_vs_closed_is_a_diff(self) -> None:
        diffs = proposed_diffs(
            {"hours": "Open Sunday"},
            {"hours": "Closed Sunday"},
        )
        self.assertEqual(
            diffs,
            [
                {
                    "field": "hours",
                    "old_value": "Open Sunday",
                    "new_value": "Closed Sunday",
                }
            ],
        )

    def test_hours_closed_prefix_is_a_diff(self) -> None:
        diffs = proposed_diffs(
            {"hours": "Sunday"},
            {"hours": "Closed Sunday"},
        )
        self.assertEqual(
            diffs,
            [
                {
                    "field": "hours",
                    "old_value": "Sunday",
                    "new_value": "Closed Sunday",
                }
            ],
        )


class AlreadyPendingTests(unittest.TestCase):
    def test_skips_duplicate_pending_review_new_value(self) -> None:
        rows = [
            {
                "resource_id": "0",
                "field": "email",
                "new_value": "info@jenesse.org",
                "status": "pending_review",
            }
        ]
        self.assertTrue(
            already_pending(rows, "0", "email", "info@jenesse.org")
        )

    def test_skips_equivalent_pending_review_phone(self) -> None:
        rows = [
            {
                "resource_id": "0",
                "field": "phone",
                "new_value": "(800) 479-7328",
                "status": "pending_review",
            }
        ]
        self.assertTrue(
            already_pending(rows, "0", "phone", "800-479-7328")
        )

    def test_allows_same_field_with_different_new_value(self) -> None:
        rows = [
            {
                "resource_id": "0",
                "field": "email",
                "new_value": "old@jenesse.org",
                "status": "pending_review",
            }
        ]
        self.assertFalse(
            already_pending(rows, "0", "email", "info@jenesse.org")
        )


if __name__ == "__main__":
    unittest.main()
