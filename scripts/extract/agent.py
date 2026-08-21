import argparse
import json
import os
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Literal
from urllib.parse import urlparse

from dotenv import load_dotenv
from xai_sdk import Client
from xai_sdk.chat import system, user, tool_result
from xai_sdk.tools import web_search, get_tool_call_type
from tools import SUBMIT_TOOL, dispatch, reset_submit

EXTRACT_DIR = Path(__file__).resolve().parent
PROMPT_PATH = EXTRACT_DIR / "prompt.txt"
CLIENT_SIDE_LOOP_CAP = 4
MODEL = "grok-4.6"

FailKind = Literal["hostname", "no_submit", "loop_cap"]


@dataclass(frozen=True)
class SubmitResult:
    payload: dict | None = None
    fail: FailKind | None = None
    detail: str = ""


def load_prompt_text(path: Path, what: str) -> str:
    if not path.is_file():
        raise SystemExit(f"missing {what}: " + str(path))
    return path.read_text(encoding="utf-8").strip()


def load_system_prompt() -> str:
    return load_prompt_text(PROMPT_PATH, "system prompt")


def load_api_key() -> str:
    load_dotenv(EXTRACT_DIR / ".env")
    api_key = os.environ.get("XAI_API_KEY")
    if not api_key:
        raise SystemExit("XAI_API_KEY is missing. Put it in scripts/extract/.env")
    return api_key


def hostname(url: str) -> str:
    host = (urlparse(str(url)).hostname or "").lower()
    return host.removeprefix("www.")


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


def log(debug: bool, message: str) -> None:
    if debug:
        print(message, file=sys.stderr, flush=True)


def client_side_calls(response) -> list:
    if response is None:
        return []
    return [
        tool_call
        for tool_call in response.tool_calls
        if get_tool_call_type(tool_call) == "client_side_tool"
    ]


def parse_ok(output: str) -> dict | None:
    try:
        payload = json.loads(output)
    except json.JSONDecodeError:
        return None
    if not isinstance(payload, dict) or not payload.get("ok"):
        return None
    return payload


def run_tool_loop(chat, debug: bool, dispatch_fn) -> SubmitResult:
    for round_index in range(CLIENT_SIDE_LOOP_CAP):
        round_n = round_index + 1
        log(debug, f"round {round_n}/{CLIENT_SIDE_LOOP_CAP}: streaming")
        response = None
        for response, chunk in chat.stream():
            if not debug:
                continue
            if getattr(chunk, "content", None):
                print(chunk.content, end="", file=sys.stderr, flush=True)
            usage = getattr(response, "usage", None)
            reasoning = getattr(usage, "reasoning_tokens", None) if usage else None
            if reasoning:
                print(
                    f"\rthinking ({reasoning} tokens)",
                    end="",
                    file=sys.stderr,
                    flush=True,
                )
            for tool_call in chunk.tool_calls:
                kind = get_tool_call_type(tool_call)
                name = tool_call.function.name
                log(
                    debug,
                    f"\ntool {kind}: {name} args={tool_call.function.arguments}",
                )
        if debug:
            print(file=sys.stderr)
        if response is not None:
            chat.append(response)
        client_side = client_side_calls(response)
        if not client_side:
            log(debug, f"round {round_n}/{CLIENT_SIDE_LOOP_CAP}: no client-side tools, done")
            text = (getattr(response, "content", None) or "") if response else ""
            return SubmitResult(fail="no_submit", detail=text)
        log(
            debug,
            f"round {round_n}/{CLIENT_SIDE_LOOP_CAP}: running {len(client_side)} client-side tool(s)",
        )
        for tool_call in client_side:
            output = dispatch_fn(
                tool_call.function.name,
                tool_call.function.arguments,
            )
            log(debug, f"dispatch {tool_call.function.name} -> {output}")
            chat.append(tool_result(output, tool_call_id=tool_call.id))
            parsed = parse_ok(output)
            if parsed is not None:
                return SubmitResult(payload=parsed)
    return SubmitResult(
        fail="loop_cap",
        detail="loop cap reached without a successful submit",
    )


def make_chat(tools: list, debug: bool):
    create_kwargs = {
        "model": MODEL,
        "tools": tools,
        "use_encrypted_content": True,
    }
    if debug:
        create_kwargs["include"] = ["verbose_streaming"]
    client = Client(api_key=load_api_key())
    return client.chat.create(**create_kwargs)


def extract_url(url: str, debug: bool = False, persist: bool = True) -> SubmitResult:
    host = hostname(url)
    if not host:
        return SubmitResult(fail="hostname", detail="could not parse hostname")

    reset_submit()
    log(debug, f"url={url}")
    log(debug, f"allowed_domains=[{host}]")
    log(debug, "creating Grok chat (first web_search can take a while)")

    chat = make_chat(
        [web_search(allowed_domains=[host]), SUBMIT_TOOL],
        debug,
    )
    chat.append(system(load_system_prompt()))
    chat.append(user("Extract a LASRP resource from this URL: " + str(url)))
    return run_tool_loop(chat, debug, lambda name, args: dispatch(name, args, persist=persist))


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
