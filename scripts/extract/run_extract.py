import argparse
import json
import sys

from loop import extract_url


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Extract one LASRP resource from an organization URL."
    )
    parser.add_argument("url", help="Organization website, e.g. https://jenesse.org/")
    parser.add_argument(
        "-d",
        "--debug",
        action="store_true",
        help="Print rounds, tool calls, stream text, and dispatch results.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    result = extract_url(args.url, debug=args.debug)
    if result.payload is not None:
        print(json.dumps(result.payload))
        return
    if result.fail == "no_submit":
        if result.detail:
            print(result.detail, file=sys.stderr)
        raise SystemExit("extraction finished without a successful submit")
    if result.fail == "hostname":
        raise SystemExit("could not parse hostname")
    raise SystemExit("loop cap reached without a successful submit")


if __name__ == "__main__":
    main()
