import argparse
import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

from diff import already_pending, proposed_diffs

EXTRACT_DIR = Path(__file__).resolve().parent
DATA_JSON = EXTRACT_DIR.parent.parent / "public" / "data" / "data.json"
REFRESH = EXTRACT_DIR / "refresh.jsonl"
STATE = EXTRACT_DIR / "refresh_state.json"
DEFAULT_LIMIT = 3
DEFAULT_MIN_AGE_DAYS = 7


def info(message: str) -> None:
    print(message, file=sys.stderr, flush=True)


def parse_checked_at(entry: dict | None) -> datetime | None:
    if not entry:
        return None
    raw = entry.get("checked_at")
    if not raw:
        return None
    try:
        checked = datetime.fromisoformat(str(raw))
    except ValueError:
        return None
    if checked.tzinfo is None:
        checked = checked.replace(tzinfo=timezone.utc)
    return checked


def is_fresh(entry: dict | None, now: datetime, min_age_days: int) -> bool:
    checked = parse_checked_at(entry)
    if checked is None:
        return False
    if now.tzinfo is None:
        now = now.replace(tzinfo=timezone.utc)
    return now - checked < timedelta(days=min_age_days)


def load_data_json() -> dict:
    if not DATA_JSON.is_file():
        raise SystemExit("missing resource database: " + str(DATA_JSON))
    return json.loads(DATA_JSON.read_text(encoding="utf-8"))


def load_state() -> dict:
    if not STATE.is_file():
        return {}
    payload = json.loads(STATE.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        return {}
    return payload


def save_state(state: dict) -> None:
    STATE.write_text(json.dumps(state, indent=2) + "\n", encoding="utf-8")


def load_jsonl(path: Path) -> list[dict]:
    if not path.is_file():
        return []
    rows = []
    for i, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        line = line.strip()
        if not line:
            continue
        try:
            rows.append(json.loads(line))
        except json.JSONDecodeError:
            info(f"skip bad jsonl line {i}: {path}")
    return rows


def resource_sort_key(resource_id: str) -> tuple:
    try:
        return (0, int(resource_id))
    except ValueError:
        return (1, resource_id)


def refresh_sort_key(resource_id: str, state: dict) -> tuple:
    """Never-checked first; then oldest checked_at; then numeric id."""
    checked = parse_checked_at(state.get(str(resource_id)))
    if checked is None:
        return (0, resource_sort_key(resource_id))
    return (1, checked, resource_sort_key(resource_id))


def website_of(row: dict) -> str:
    return str(row.get("website") or "").strip()


def pick_resources(
    data: dict,
    state: dict,
    *,
    resource_id: str | None,
    limit: int,
    force: bool,
    min_age_days: int,
    now: datetime,
) -> list[tuple[str, dict]]:
    if resource_id is not None:
        row = data.get(resource_id)
        if row is None:
            raise SystemExit("unknown resource id: " + resource_id)
        items = [(str(resource_id), row)]
    else:
        items = [
            (str(rid), data[rid])
            for rid in sorted(data, key=lambda rid: refresh_sort_key(str(rid), state))
        ]

    picked: list[tuple[str, dict]] = []
    for rid, row in items:
        site = website_of(row)
        if not site:
            info(f"skip no website: {rid} {row.get('name')}")
            continue
        if not force and is_fresh(state.get(rid), now, min_age_days):
            info(f"skip fresh: {rid} {row.get('name')}")
            continue
        picked.append((rid, row))
        if len(picked) >= limit:
            break
    return picked


def append_jsonl(path: Path, rows: list[dict]) -> None:
    with path.open("a", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row) + "\n")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Re-extract published LASRP resources and queue field diffs."
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=DEFAULT_LIMIT,
        help=f"Max resources to extract (default {DEFAULT_LIMIT})",
    )
    parser.add_argument(
        "--id",
        dest="resource_id",
        help="Refresh one published resource id (implies limit 1)",
    )
    parser.add_argument(
        "--min-age-days",
        type=int,
        default=DEFAULT_MIN_AGE_DAYS,
        help=f"Skip resources checked this recently (default {DEFAULT_MIN_AGE_DAYS})",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Ignore last-checked age",
    )
    parser.add_argument(
        "-d",
        "--debug",
        action="store_true",
        help="Print Grok tool calls and stream text.",
    )
    args = parser.parse_args()
    debug = args.debug
    now = datetime.now(timezone.utc)
    checked_at = now.isoformat()
    resource_id = None if args.resource_id is None else str(args.resource_id)
    limit = 1 if resource_id is not None else args.limit
    if limit < 1:
        raise SystemExit("--limit must be at least 1")

    data = load_data_json()
    state = load_state()
    pending_diffs = load_jsonl(REFRESH)
    targets = pick_resources(
        data,
        state,
        resource_id=resource_id,
        limit=limit,
        force=args.force,
        min_age_days=args.min_age_days,
        now=now,
    )
    if not targets:
        info("nothing to refresh")
        return

    from agent import extract_url

    for rid, published in targets:
        site = website_of(published)
        name = published.get("name") or rid

        info(f"extracting: {rid} {name} {site}")
        result = extract_url(site, debug=debug, persist=False)
        draft = None if result.payload is None else result.payload.get("resource")
        if not isinstance(draft, dict):
            reason = result.detail or result.fail or "missing resource"
            info(f"extract failed: {rid} {site}: {reason}")
            continue

        state[rid] = {"checked_at": checked_at, "website": site}
        save_state(state)

        new_rows = []
        for item in proposed_diffs(published, draft):
            if already_pending(pending_diffs, rid, item["field"], item["new_value"]):
                info(f"skip duplicate: {rid} {item['field']} {item['new_value']}")
                continue
            row = {
                "checked_at": checked_at,
                "resource_id": rid,
                "name": name,
                "field": item["field"],
                "old_value": item["old_value"],
                "new_value": item["new_value"],
                "source_url": draft.get("source_url") or "",
                "confidence": draft.get("confidence"),
                "status": "pending_review",
            }
            new_rows.append(row)
            pending_diffs.append(row)

        if not new_rows:
            info(f"no change: {rid} {name}")
            continue
        append_jsonl(REFRESH, new_rows)
        for row in new_rows:
            print(json.dumps(row))


if __name__ == "__main__":
    main()
