import re
from urllib.parse import urlparse

WATCHED_FIELDS = (
    "phone",
    "hours",
    "email",
    "address",
    "eligibilityText",
    "website",
)

_HOURS_247_PHRASES = (
    re.compile(
        r"24\s*hours(?:\s+a\s+day)?(?:\s*,)?\s*7\s*days(?:\s+a\s+week)?"
    ),
    re.compile(
        r"7\s*days(?:\s+a\s+week)?(?:\s*,)?\s*24\s*hours(?:\s+a\s+day)?"
    ),
    re.compile(r"24\s*[/\-]\s*7"),
)
_HOURS_TOKENS = re.compile(r"24/7|[a-z0-9]+")
_HOURS_COLON_ZERO = re.compile(r":00(?=am|pm)")
_HOURS_FILLER = frozenset({"available", "a", "an", "the"})
_WEEKDAY_ABBREVS = {
    "mon": "monday",
    "tue": "tuesday",
    "tues": "tuesday",
    "wed": "wednesday",
    "thu": "thursday",
    "thur": "thursday",
    "thurs": "thursday",
    "fri": "friday",
    "sat": "saturday",
    "sun": "sunday",
}
_WEEKDAY_ABBREV = re.compile(
    r"\b(" + "|".join(sorted(_WEEKDAY_ABBREVS, key=len, reverse=True)) + r")\b"
)
_WHITESPACE = re.compile(r"\s+")
_NON_DIGITS = re.compile(r"\D")


def already_pending(
    rows: list[dict],
    resource_id: str,
    field: str,
    new_value: str,
) -> bool:
    target_id = str(resource_id)
    for row in rows:
        if (
            str(row.get("resource_id")) == target_id
            and row.get("field") == field
            and row.get("status") == "pending_review"
            and _equivalent(field, row.get("new_value") or "", new_value)
        ):
            return True
    return False


def proposed_diffs(published: dict, draft: dict) -> list[dict]:
    diffs = []
    for field in WATCHED_FIELDS:
        old_value = _field_value(published, field)
        new_value = _field_value(draft, field)
        if not new_value:
            continue
        if old_value and _equivalent(field, old_value, new_value):
            continue
        diffs.append(
            {
                "field": field,
                "old_value": old_value,
                "new_value": new_value,
            }
        )
    return diffs


def _field_value(row: dict, field: str) -> str:
    value = row.get(field)
    if value is None:
        return ""
    return str(value).strip()


def _equivalent(field: str, old_value: str, new_value: str) -> bool:
    if field == "hours":
        return _hours_equivalent(old_value, new_value)
    return _normalize(field, old_value) == _normalize(field, new_value)


def _normalize(field: str, value: str) -> str:
    if field == "phone":
        return _NON_DIGITS.sub("", value)
    if field == "email":
        return value.strip().lower()
    if field == "website":
        return _normalize_website(value)
    return _WHITESPACE.sub(" ", value.casefold()).strip()


def _normalize_website(url: str) -> str:
    text = url.strip().lower()
    if not text:
        return ""
    if "://" not in text:
        text = "https://" + text
    parsed = urlparse(text)
    host = (parsed.hostname or "").removeprefix("www.")
    path = (parsed.path or "").rstrip("/")
    return host + path


def _hours_equivalent(old_value: str, new_value: str) -> bool:
    old_tokens = _hours_tokens(old_value)
    new_tokens = _hours_tokens(new_value)
    if not old_tokens or not new_tokens:
        return False
    return old_tokens == new_tokens


def _hours_tokens(value: str) -> set[str]:
    text = value.casefold()
    for pattern in _HOURS_247_PHRASES:
        text = pattern.sub("24/7", text)
    text = _WEEKDAY_ABBREV.sub(lambda match: _WEEKDAY_ABBREVS[match.group(1)], text)
    text = _HOURS_COLON_ZERO.sub("", text)
    text = _WHITESPACE.sub(" ", text).strip()
    return set(_HOURS_TOKENS.findall(text)) - _HOURS_FILLER
