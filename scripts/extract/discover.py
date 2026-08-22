import json
import sys

from pydantic import ValidationError
from xai_sdk.chat import system, tool, user
from xai_sdk.tools import web_search

from loop import load_prompt_text, log, make_chat, run_tool_loop
from candidates import CandidateList
from settings import settings
from tools import parse_tool_args

CANDIDATE_TOOL = tool(
    name="submit_candidates",
    description="Save the shortlist of official org websites. Call exactly once.",
    parameters=CandidateList.model_json_schema(),
)
DISCOVER_TOOLS = [
    web_search(excluded_domains=list(settings.excluded_domains)),
    CANDIDATE_TOOL,
]


def _fail(errors) -> dict:
    return {"ok": False, "errors": errors, "candidates": []}


def dispatch_candidates(name: str, arguments_json: str) -> str:
    args, errors = parse_tool_args(arguments_json)
    if errors is not None:
        return json.dumps(_fail(errors), default=str)
    if name != "submit_candidates":
        return json.dumps(_fail(["unknown tool: " + name]), default=str)
    try:
        listing = CandidateList.model_validate(args)
    except ValidationError as exc:
        return json.dumps(_fail(exc.errors()), default=str)
    return json.dumps(
        {
            "ok": True,
            "errors": [],
            "query": listing.query,
            "candidates": [c.model_dump(mode="json") for c in listing.candidates],
        }
    )


def load_search_prompt() -> str:
    return load_prompt_text(settings.search_prompt, "search prompt")


def discover(query: str, debug: bool = False) -> CandidateList:
    log(debug, f"query={query}")
    log(debug, "creating Grok discover chat (web_search can take a while)")
    chat = make_chat(DISCOVER_TOOLS, debug)
    chat.append(system(load_search_prompt()))
    chat.append(user("Find official Los Angeles organization websites for: " + query))
    result = run_tool_loop(chat, debug, dispatch_candidates)
    if result.payload is None:
        if result.detail:
            print(result.detail, file=sys.stderr)
        raise SystemExit("discover did not call submit_candidates successfully")
    payload = result.payload
    return CandidateList.model_validate(
        {"query": payload.get("query") or query, "candidates": payload["candidates"]}
    )
