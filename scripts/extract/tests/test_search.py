import unittest

import _extract_path  # noqa: F401
from candidates import Candidate
from run_search import classify_candidates, is_aggregator


def _candidate(name: str, url: str) -> Candidate:
    return Candidate(name=name, url=url, why="matches query")


class IsAggregatorTests(unittest.TestCase):
    def test_wikipedia_subdomain_is_aggregator(self) -> None:
        self.assertTrue(is_aggregator("en.wikipedia.org"))

    def test_org_site_is_not_aggregator(self) -> None:
        self.assertFalse(is_aggregator("jenesse.org"))

    def test_discover_excluded_hosts_are_aggregators(self) -> None:
        for host in (
            "yelp.com",
            "www.facebook.com",
            "instagram.com",
            "old.reddit.com",
        ):
            with self.subTest(host=host):
                self.assertTrue(is_aggregator(host))


class ClassifyCandidatesTests(unittest.TestCase):
    def test_keepers_skip_wikipedia_and_211la(self) -> None:
        items = [
            _candidate("Wiki", "https://en.wikipedia.org/wiki/Food_bank"),
            _candidate("211", "https://www.211la.org/food"),
            _candidate("Keep", "https://jenesse.org/"),
        ]
        keep, skips = classify_candidates(items, set())
        self.assertEqual([item.name for item in keep], ["Keep"])
        self.assertEqual(
            [(item.name, reason) for item, reason in skips],
            [
                ("Wiki", "aggregator"),
                ("211", "aggregator"),
            ],
        )

    def test_skips_aggregator_duplicate_and_cap(self) -> None:
        items = [
            _candidate("211", "https://211la.org/food"),
            _candidate("Existing", "https://jenesse.org/"),
            _candidate("WWW dup", "https://www.jenesse.org/help"),
            _candidate("Keep 1", "https://one.org/"),
            _candidate("Keep 2", "https://two.org/"),
            _candidate("Keep 3", "https://three.org/"),
            _candidate("Capped", "https://four.org/"),
        ]
        keep, skips = classify_candidates(items, {"jenesse.org"})
        self.assertEqual([item.name for item in keep], ["Keep 1", "Keep 2", "Keep 3"])
        self.assertEqual(
            [(item.name, reason) for item, reason in skips],
            [
                ("211", "aggregator"),
                ("Existing", "duplicate"),
                ("WWW dup", "duplicate"),
                ("Capped", "cap"),
            ],
        )

    def test_in_batch_duplicate_is_duplicate(self) -> None:
        items = [
            _candidate("First", "https://example.org/"),
            _candidate("Again", "https://www.example.org/page"),
        ]
        keep, skips = classify_candidates(items, set())
        self.assertEqual([item.name for item in keep], ["First"])
        self.assertEqual([(item.name, reason) for item, reason in skips], [("Again", "duplicate")])


if __name__ == "__main__":
    unittest.main()
