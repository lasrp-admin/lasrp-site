import argparse
import json
import sys

from loop import extract_url, hostname, log
from candidates import Candidate
from discover import discover
from settings import load_data_json, load_jsonl, settings, website_of
from tools import PENDING


def is_aggregator(host: str) -> bool:
    return any(host == item or host.endswith("." + item) for item in settings.aggregators)


def existing_hosts(data_json: dict, pending_rows: list[dict]) -> set[str]:
    hosts: set[str] = set()
    for row in data_json.values():
        hosts.add(hostname(website_of(row)))
    for row in pending_rows:
        hosts.add(hostname(website_of(row)))
    hosts.discard("")
    return hosts


def classify_candidates(
    candidates: list[Candidate], existing: set[str]
) -> tuple[list[Candidate], list[tuple[Candidate, str]]]:
    keep: list[Candidate] = []
    skips: list[tuple[Candidate, str]] = []
    seen = set(existing)
    for item in candidates:
        host = hostname(item.url)
        if not host:
            skips.append((item, "no host"))
            continue
        if is_aggregator(host):
            skips.append((item, "aggregator"))
            continue
        if host in seen:
            skips.append((item, "duplicate"))
            continue
        if len(keep) >= settings.max_extracts:
            skips.append((item, "cap"))
            continue
        seen.add(host)
        keep.append(item)
    return keep, skips


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Search for LA orgs, then extract keeper URLs with Pass 1."
    )
    parser.add_argument("query", help="Search query, e.g. food pantry Koreatown Los Angeles")
    parser.add_argument(
        "-d",
        "--debug",
        action="store_true",
        help="Print Grok tool calls and stream text.",
    )
    args = parser.parse_args()
    debug = args.debug

    log(True, "query=" + args.query)
    listing = discover(args.query, debug=debug)
    existing = existing_hosts(load_data_json(), load_jsonl(PENDING))
    to_extract, skips = classify_candidates(listing.candidates, existing)

    log(True, f"discovered {len(listing.candidates)} candidate(s)")
    for item, reason in skips:
        log(True, f"skip {reason}: {item.name} {item.url}")

    if not to_extract:
        log(True, "nothing to extract")
        return

    for item in to_extract:
        url = str(item.url)
        log(True, f"extracting: {item.name} {url}")
        log(True, "why: " + item.why)
        result = extract_url(url, debug=debug)
        if result.fail is not None:
            reason = result.detail or result.fail
            log(True, f"extract failed: {item.name} {url}: {reason}")
            continue
        print(json.dumps(result.payload))


if __name__ == "__main__":
    main()
