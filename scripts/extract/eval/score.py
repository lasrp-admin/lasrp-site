import re

from diff import _hours_equivalent, _normalize

_NON_DIGITS = re.compile(r"\D")
_PUNCT = re.compile(r"[^\w\s]")
_SPACE = re.compile(r"\s+")


def tag_f1(predicted: list | None, gold: list | None) -> float:
    pred = {str(item).strip() for item in (predicted or []) if str(item).strip()}
    expected = {str(item).strip() for item in (gold or []) if str(item).strip()}
    if not pred and not expected:
        return 1.0
    if not pred or not expected:
        return 0.0
    overlap = len(pred & expected)
    precision = overlap / len(pred)
    recall = overlap / len(expected)
    if precision + recall == 0:
        return 0.0
    return 2 * precision * recall / (precision + recall)


def _digits(value: str) -> str:
    return _NON_DIGITS.sub("", value or "")


def _fold(value: str) -> str:
    return _SPACE.sub(" ", _PUNCT.sub(" ", (value or "").casefold())).strip()


def _name_ok(gold: str, agent: str) -> bool:
    left, right = _fold(gold), _fold(agent)
    if not left or not right:
        return False
    return left in right or right in left


def _phone_ok(gold: str, agent: str) -> bool:
    agent_digits = _digits(agent)
    if not agent_digits:
        return True
    gold_digits = _digits(gold)
    if not gold_digits:
        return True
    return gold_digits in agent_digits or agent_digits in gold_digits


def _email_ok(gold: str, agent: str) -> bool:
    agent_email = _normalize("email", agent)
    if not agent_email:
        return True
    gold_email = _normalize("email", gold)
    if not gold_email:
        return True
    return agent_email == gold_email


def _hours_ok(gold: str, agent: str) -> bool:
    if not (agent or "").strip():
        return True
    if not (gold or "").strip():
        return True
    if _hours_equivalent(gold, agent):
        return True
    return _fold(gold) in _fold(agent) or _fold(agent) in _fold(gold)


def _address_ok(gold: str, agent: str) -> bool:
    if not (agent or "").strip():
        return True
    if not (gold or "").strip():
        return True
    left, right = _fold(gold), _fold(agent)
    return left in right or right in left


def _website_ok(gold: str, agent: str) -> bool:
    return _normalize("website", gold) == _normalize("website", agent) or (
        _normalize("website", gold).split("/")[0]
        == _normalize("website", agent).split("/")[0]
    )


def score_case(gold: dict, draft: dict | None, *, submitted: bool) -> dict:
    failures: list[str] = []
    if not submitted or not isinstance(draft, dict):
        failures.append("submit")
        draft = {}

    checks = {
        "name": _name_ok(gold.get("name") or "", draft.get("name") or ""),
        "website": _website_ok(gold.get("website") or "", draft.get("website") or ""),
        "phone": _phone_ok(gold.get("phone") or "", draft.get("phone") or ""),
        "email": _email_ok(gold.get("email") or "", draft.get("email") or ""),
        "hours": _hours_ok(gold.get("hours") or "", draft.get("hours") or ""),
        "address": _address_ok(gold.get("address") or "", draft.get("address") or ""),
    }
    if "submit" not in failures:
        for field, ok in checks.items():
            if not ok:
                failures.append(field)

    return {
        "id": gold.get("id"),
        "short": gold.get("short"),
        "track1_pass": not failures,
        "track1_failures": failures,
        "type_f1": tag_f1(draft.get("type"), gold.get("type")),
        "audience_f1": tag_f1(draft.get("audience"), gold.get("audience")),
        "language_f1": tag_f1(draft.get("language"), gold.get("language")),
        "neighborhood_f1": tag_f1(draft.get("neighborhood"), gold.get("neighborhood")),
        "predicted": {
            "name": draft.get("name") or "",
            "phone": draft.get("phone") or "",
            "email": draft.get("email") or "",
            "type": list(draft.get("type") or []),
            "audience": list(draft.get("audience") or []),
            "language": list(draft.get("language") or []),
            "zipcode": list(draft.get("zipcode") or []),
            "neighborhood": list(draft.get("neighborhood") or []),
        },
    }
