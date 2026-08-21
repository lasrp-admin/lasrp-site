import json
from pathlib import Path
from pydantic import ValidationError
from xai_sdk.chat import tool
from schema import ResourceDraft

PENDING = Path(__file__).with_name("pending.json")
_submit_succeeded = False

SUBMIT_TOOL = tool(
    name="submit_resource",
    description=("Save one pending LASRP resource draft. "
                 "Call exactly once per URL after reading the org site."),
    parameters=ResourceDraft.model_json_schema(),
)

def _fail(errors) -> dict:
    return {"ok": False, "errors": errors, "written_to": None}

def submit_resource(payload: dict) -> dict:
    global _submit_succeeded
    if _submit_succeeded:
        return _fail(["submit_resource already succeeded; call it only once"])
    try:
        row = ResourceDraft.model_validate(payload)
    except ValidationError as exc:
        return _fail(exc.errors())
    with PENDING.open("a", encoding="utf-8") as handle:
        handle.write(row.model_dump_json() + "\n")
    _submit_succeeded = True
    return {"ok": True, "errors": [], "written_to": str(PENDING)}

def dispatch(name: str, arguments_json: str) -> str:
    try:
        args = json.loads(arguments_json)
    except json.JSONDecodeError as exc:
        return json.dumps(_fail(["invalid JSON arguments: " + str(exc)]), default=str)
    if not isinstance(args, dict):
        return json.dumps(_fail(["tool arguments must be a JSON object"]), default=str)
    if name != "submit_resource":
        return json.dumps(_fail(["unknown tool: " + name]), default=str)
    return json.dumps(submit_resource(args), default=str)