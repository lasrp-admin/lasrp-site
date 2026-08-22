import unittest
from datetime import datetime, timedelta, timezone
from unittest import mock

import _extract_path  # noqa: F401
import run_refresh
from run_refresh import is_fresh, pick_resources


class ImportIsolationTests(unittest.TestCase):
    def test_import_does_not_bind_extract_url(self) -> None:
        self.assertIsNone(getattr(run_refresh, "extract_url", None))


class FreshnessTests(unittest.TestCase):
    def test_recent_check_is_fresh(self) -> None:
        now = datetime(2026, 8, 21, tzinfo=timezone.utc)
        entry = {"checked_at": (now - timedelta(days=3)).isoformat()}
        self.assertTrue(is_fresh(entry, now, 7))

    def test_old_check_is_stale(self) -> None:
        now = datetime(2026, 8, 21, tzinfo=timezone.utc)
        entry = {"checked_at": (now - timedelta(days=8)).isoformat()}
        self.assertFalse(is_fresh(entry, now, 7))

    def test_missing_or_invalid_check_is_stale(self) -> None:
        now = datetime(2026, 8, 21, tzinfo=timezone.utc)
        self.assertFalse(is_fresh({}, now, 7))
        self.assertFalse(is_fresh({"checked_at": "not-a-date"}, now, 7))
        self.assertFalse(is_fresh(None, now, 7))


class PickResourcesTests(unittest.TestCase):
    def setUp(self) -> None:
        self.now = datetime(2026, 8, 21, tzinfo=timezone.utc)
        self.row = {"name": "Jenesse Center", "website": "https://jenesse.org/"}
        self.data = {"0": self.row}

    @mock.patch("run_refresh.info")
    def test_id_skips_fresh_unless_forced(self, _info) -> None:
        state = {"0": {"checked_at": (self.now - timedelta(days=1)).isoformat()}}
        kwargs = dict(
            data=self.data,
            state=state,
            resource_id="0",
            limit=1,
            min_age_days=7,
            now=self.now,
        )
        self.assertEqual(pick_resources(**kwargs, force=False), [])
        self.assertEqual(pick_resources(**kwargs, force=True), [("0", self.row)])

    @mock.patch("run_refresh.info")
    def test_id_skips_missing_website(self, _info) -> None:
        data = {"0": {"name": "No Site", "website": ""}}
        picked = pick_resources(
            data,
            {},
            resource_id="0",
            limit=1,
            force=False,
            min_age_days=7,
            now=self.now,
        )
        self.assertEqual(picked, [])

    def _rows(self, n: int) -> dict:
        return {
            str(i): {"name": f"R{i}", "website": f"https://example{i}.org/"}
            for i in range(n)
        }

    def _pick(self, data, state, *, limit=3, force=False, now=None):
        return pick_resources(
            data,
            state,
            resource_id=None,
            limit=limit,
            force=force,
            min_age_days=7,
            now=now or self.now,
        )

    @mock.patch("run_refresh.info")
    def test_empty_state_picks_lowest_ids(self, _info) -> None:
        data = self._rows(6)
        picked = self._pick(data, {})
        self.assertEqual([rid for rid, _ in picked], ["0", "1", "2"])

    @mock.patch("run_refresh.info")
    def test_weekly_cron_does_not_livelock_on_0_2(self, _info) -> None:
        data = self._rows(6)
        state = {}
        first = self._pick(data, state)
        self.assertEqual([rid for rid, _ in first], ["0", "1", "2"])
        for rid, _ in first:
            state[rid] = {"checked_at": self.now.isoformat()}

        week_later = self.now + timedelta(days=7)
        second = self._pick(data, state, now=week_later)
        self.assertEqual([rid for rid, _ in second], ["3", "4", "5"])

    @mock.patch("run_refresh.info")
    def test_never_checked_before_stale(self, _info) -> None:
        data = self._rows(3)
        state = {
            "0": {"checked_at": (self.now - timedelta(days=8)).isoformat()},
            "2": {"checked_at": (self.now - timedelta(days=1)).isoformat()},
        }
        self.assertEqual([rid for rid, _ in self._pick(data, state, limit=1)], ["1"])
        self.assertEqual([rid for rid, _ in self._pick(data, state, limit=2)], ["1", "0"])

    @mock.patch("run_refresh.info")
    def test_missing_checked_at_sorts_as_never_checked(self, _info) -> None:
        data = self._rows(2)
        state = {"0": {}}
        self.assertEqual([rid for rid, _ in self._pick(data, state, limit=2)], ["0", "1"])

    @mock.patch("run_refresh.info")
    def test_force_picks_never_checked_before_recent(self, _info) -> None:
        data = self._rows(2)
        state = {"0": {"checked_at": (self.now - timedelta(days=1)).isoformat()}}
        picked = self._pick(data, state, limit=1, force=True)
        self.assertEqual([rid for rid, _ in picked], ["1"])


if __name__ == "__main__":
    unittest.main()
