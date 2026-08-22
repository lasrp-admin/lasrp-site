import unittest

import _extract_path  # noqa: F401
from zip_neighborhood import apply_neighborhoods, build_zip_map, neighborhoods_for_zips


class DataJsonPathTests(unittest.TestCase):
    def test_published_database_path_exists(self) -> None:
        from settings import settings

        self.assertTrue(settings.data_json.is_file(), settings.data_json)
    def test_maps_zip_when_resource_has_one_neighborhood(self) -> None:
        data = {
            "163": {
                "zipcode": ["90032"],
                "neighborhood": ["Eastside"],
            }
        }
        self.assertEqual(build_zip_map(data), {"90032": "Eastside"})

    def test_skips_service_area_rows_with_many_neighborhoods(self) -> None:
        data = {
            "108": {
                "zipcode": ["90038"],
                "neighborhood": ["Central LA", "DTLA", "Eastside"],
            }
        }
        self.assertEqual(build_zip_map(data), {})

    def test_skips_zip_when_single_neighborhood_votes_tie(self) -> None:
        data = {
            "a": {"zipcode": ["90033"], "neighborhood": ["Eastside"]},
            "b": {"zipcode": ["90033"], "neighborhood": ["Central LA"]},
        }
        self.assertEqual(build_zip_map(data), {})

    def test_majority_wins_when_votes_are_unequal(self) -> None:
        data = {
            "a": {"zipcode": ["90731"], "neighborhood": ["Harbor"]},
            "b": {"zipcode": ["90731"], "neighborhood": ["Harbor"]},
            "c": {"zipcode": ["90731"], "neighborhood": ["Long Beach"]},
        }
        self.assertEqual(build_zip_map(data), {"90731": "Harbor"})


class ApplyNeighborhoodTests(unittest.TestCase):
    def test_fills_unique_neighborhoods_in_zip_order(self) -> None:
        mapping = {"91205": "San Fernando Valley", "91731": "Other"}
        self.assertEqual(
            neighborhoods_for_zips(["91205", "91731", "91205"], mapping),
            ["San Fernando Valley", "Other"],
        )

    def test_apply_overwrites_model_neighborhood_from_zips(self) -> None:
        draft = {
            "zipcode": ["90032"],
            "neighborhood": ["Westside"],
        }
        apply_neighborhoods(draft, {"90032": "Eastside"})
        self.assertEqual(draft["neighborhood"], ["Eastside"])

    def test_unknown_zip_clears_model_neighborhood(self) -> None:
        draft = {"zipcode": ["99999"], "neighborhood": ["Westside"]}
        apply_neighborhoods(draft, {"90032": "Eastside"})
        self.assertEqual(draft["neighborhood"], [])


if __name__ == "__main__":
    unittest.main()
