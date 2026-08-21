from collections import Counter, defaultdict
import json

from settings import settings
_default_map: dict[str, str] | None = None


def _clean_list(values) -> list[str]:
    out = []
    for item in values or []:
        text = str(item).strip()
        if text:
            out.append(text)
    return out


def build_zip_map(data: dict) -> dict[str, str]:
    votes: dict[str, Counter[str]] = defaultdict(Counter)
    for row in data.values():
        if not isinstance(row, dict):
            continue
        neighborhoods = _clean_list(row.get("neighborhood"))
        if len(neighborhoods) != 1:
            continue
        neighborhood = neighborhoods[0]
        for zipcode in _clean_list(row.get("zipcode")):
            votes[zipcode][neighborhood] += 1
    mapping = {}
    for zipcode, counter in votes.items():
        ranked = counter.most_common()
        if not ranked:
            continue
        if len(ranked) > 1 and ranked[0][1] == ranked[1][1]:
            continue
        mapping[zipcode] = ranked[0][0]
    return mapping


def neighborhoods_for_zips(zips: list | None, mapping: dict[str, str]) -> list[str]:
    found: list[str] = []
    for zipcode in _clean_list(zips):
        neighborhood = mapping.get(zipcode)
        if neighborhood and neighborhood not in found:
            found.append(neighborhood)
    return found


def apply_neighborhoods(draft: dict, mapping: dict[str, str]) -> dict:
    draft["neighborhood"] = neighborhoods_for_zips(draft.get("zipcode"), mapping)
    return draft


def default_map() -> dict[str, str]:
    global _default_map
    if _default_map is None:
        if not settings.data_json.is_file():
            _default_map = {}
        else:
            payload = json.loads(settings.data_json.read_text(encoding="utf-8"))
            _default_map = build_zip_map(payload if isinstance(payload, dict) else {})
    return _default_map
