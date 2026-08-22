import argparse
import hashlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import _extract_path  # noqa: F401
from loop import extract_url
from settings import settings
from score import score_case

EVAL_DIR = Path(__file__).resolve().parent
CASES_PATH = EVAL_DIR / "cases.json"
RUNS_DIR = EVAL_DIR / "runs"


def prompt_sha256() -> str:
    return hashlib.sha256(settings.extract_prompt.read_bytes()).hexdigest()


def load_cases(path: Path = CASES_PATH) -> list[dict]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    cases = payload.get("cases")
    if not isinstance(cases, list) or not cases:
        raise SystemExit("eval cases.json is missing a non-empty cases list")
    return cases


def run_cases(cases: list[dict], extract_fn=extract_url, *, debug: bool = False) -> dict:
    results = []
    for case in cases:
        url = case["url"]
        try:
            submitted = extract_fn(url, persist=False)
        except Exception as exc:
            scored = score_case(case, None, submitted=False)
            scored["url"] = url
            scored["extract_fail"] = type(exc).__name__
            results.append(scored)
            continue
        payload = getattr(submitted, "payload", None)
        draft = payload.get("resource") if isinstance(payload, dict) else None
        scored = score_case(case, draft, submitted=isinstance(draft, dict))
        scored["url"] = url
        if payload is None:
            scored["extract_fail"] = getattr(submitted, "fail", None)
        results.append(scored)
    passed = sum(1 for row in results if row["track1_pass"])
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "model": settings.model,
        "prompt_sha256": prompt_sha256(),
        "prompt_path": str(settings.extract_prompt),
        "track1_passed": passed,
        "track1_total": len(results),
        "results": results,
    }


def write_report(report: dict, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")


def print_summary(report: dict) -> None:
    print(
        f"track1 {report['track1_passed']}/{report['track1_total']}  "
        f"model {report['model']}  prompt {report['prompt_sha256'][:12]}"
    )
    for row in report["results"]:
        status = "PASS" if row["track1_pass"] else "FAIL"
        fails = ",".join(row["track1_failures"]) if row["track1_failures"] else "-"
        print(
            f"{status:4} {row.get('short') or row.get('id')}  "
            f"fail={fails}  type={row['type_f1']:.2f}  "
            f"aud={row['audience_f1']:.2f}  lang={row['language_f1']:.2f}  "
            f"nbhd={row['neighborhood_f1']:.2f}"
        )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Score extract_url against page-grounded eval cases."
    )
    parser.add_argument("--id", dest="case_id", help="Run one case id")
    parser.add_argument(
        "-d",
        "--debug",
        action="store_true",
        help="Pass debug through to extract_url.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    cases = load_cases()
    if args.case_id:
        cases = [case for case in cases if str(case.get("id")) == str(args.case_id)]
        if not cases:
            raise SystemExit("unknown case id: " + str(args.case_id))

    def extract(url: str, persist: bool = False):
        return extract_url(url, debug=args.debug, persist=persist)

    report = run_cases(cases, extract_fn=extract, debug=args.debug)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    out = RUNS_DIR / f"eval-{stamp}.json"
    write_report(report, out)
    print_summary(report)
    print("wrote " + str(out), file=sys.stderr)
    if report["track1_passed"] < report["track1_total"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
