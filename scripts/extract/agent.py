import argparse
import json
import os
import sys
from pathlib import Path
from urllib.parse import urlparse

from dotenv import load_dotenv
from xai_sdk import Client
from xai_sdk.chat import system, user, tool_result
from xai_sdk.tools import web_search, get_tool_call_type
from tools import SUBMIT_TOOL, dispatch

EXTRACT_DIR = Path(__file__).resolve().parent
PROMPT_PATH = EXTRACT_DIR / "prompt.txt"
CLIENT_SIDE_LOOP_CAP = 4


def load_system_prompt() -> str:
    if not PROMPT_PATH.is_file():
        raise SystemExit("missing system prompt: " + str(PROMPT_PATH))
    return PROMPT_PATH.read_text(encoding="utf-8").strip()


def hostname(url: str) -> str:
    host = urlparse(url).hostname or ""
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


def result_ok(output: str) -> bool:
    try:
        payload = json.loads(output)
    except json.JSONDecodeError:
        return False
    return bool(payload.get("ok"))


def main() -> None:
    args = parse_args()
    url = args.url
    debug = args.debug
    host = hostname(url)
    if not host:
        raise SystemExit("could not parse hostname")

    load_dotenv(Path(__file__).with_name(".env"))
    api_key = os.environ.get("XAI_API_KEY")
    if not api_key:
        raise SystemExit("XAI_API_KEY is missing. Put it in scripts/extract/.env")

    log(debug, f"url={url}")
    log(debug, f"allowed_domains=[{host}]")
    log(debug, "creating Grok chat (first web_search can take a while)")

    system_prompt = load_system_prompt()
    client = Client(api_key=api_key)
    tools = [web_search(allowed_domains=[host]), SUBMIT_TOOL]
    create_kwargs = {
        "model": "grok-4.6",
        "tools": tools,
        "use_encrypted_content": True,
    }
    if debug:
        create_kwargs["include"] = ["verbose_streaming"]
    chat = client.chat.create(**create_kwargs)
    chat.append(system(system_prompt))
    chat.append(user("Extract a LASRP resource from this URL: " + url))

    for round_index in range(CLIENT_SIDE_LOOP_CAP):
        round_n = round_index + 1
        log(debug, f"round {round_n}/{CLIENT_SIDE_LOOP_CAP}: streaming")
        response = None
        for response, chunk in chat.stream():
            if debug and getattr(chunk, "content", None):
                print(chunk.content, end="", file=sys.stderr, flush=True)
            usage = getattr(response, "usage", None)
            reasoning = getattr(usage, "reasoning_tokens", None) if usage else None
            if debug and reasoning:
                print(
                    f"\rthinking ({reasoning} tokens)",
                    end="",
                    file=sys.stderr,
                    flush=True,
                )
            if debug:
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
            print(response.content if response else "")
            return
        log(debug, f"round {round_n}/{CLIENT_SIDE_LOOP_CAP}: running {len(client_side)} client-side tool(s)")
        for tool_call in client_side:
            output = dispatch(
                tool_call.function.name,
                tool_call.function.arguments,
            )
            log(debug, f"dispatch {tool_call.function.name} -> {output}")
            chat.append(tool_result(output, tool_call_id=tool_call.id))
            if result_ok(output):
                print(output)
                return
    raise SystemExit("loop cap reached without a successful submit")

if __name__ == "__main__":
    main()