import json
from pydantic import ValidationError
from xai_sdk.chat import tool
from zip_neighborhood import apply_neighborhoods, default_map
from schema import ResourceDraft
from settings import settings

PENDING = settings.pending
_submit_succeeded = False


def reset_submit() -> None:
    global _submit_succeeded
    _submit_succeeded = False

SUBMIT_TOOL = tool(
    name="submit_resource",
    description=("Save one pending LASRP resource draft. "
                 "Call exactly once per URL after reading the org site."),
    parameters=ResourceDraft.model_json_schema(),
)

def _fail(errors) -> dict:
    return {"ok": False, "errors": errors, "written_to": None, "resource": None}

def submit_resource(payload: dict, *, persist: bool = True) -> dict:
    global _submit_succeeded
    if _submit_succeeded:
        return _fail(["submit_resource already succeeded; call it only once"])
    try:
        row = ResourceDraft.model_validate(payload)
    except ValidationError as exc:
        return _fail(exc.errors())
    filled = apply_neighborhoods(row.model_dump(), default_map())
    row = ResourceDraft.model_validate(filled)
    written_to = None
    if persist:
        PENDING.parent.mkdir(parents=True, exist_ok=True)
        with PENDING.open("a", encoding="utf-8") as handle:
            handle.write(row.model_dump_json() + "\n")
        written_to = str(PENDING)
    _submit_succeeded = True
    return {
        "ok": True,
        "errors": [],
        "written_to": written_to,
        "resource": row.model_dump(),
    }

def parse_tool_args(arguments_json: str) -> tuple[dict | None, list | None]:
    try:
        args = json.loads(arguments_json)
    except json.JSONDecodeError as exc:
        return None, ["invalid JSON arguments: " + str(exc)]
    if not isinstance(args, dict):
        return None, ["tool arguments must be a JSON object"]
    return args, None


def dispatch(name: str, arguments_json: str, *, persist: bool = True) -> str:
    args, errors = parse_tool_args(arguments_json)
    if errors is not None:
        return json.dumps(_fail(errors), default=str)
    if name != "submit_resource":
        return json.dumps(_fail(["unknown tool: " + name]), default=str)
    return json.dumps(submit_resource(args, persist=persist), default=str)