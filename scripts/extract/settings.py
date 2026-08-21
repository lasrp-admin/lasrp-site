from __future__ import annotations

import json
import sys
from dataclasses import dataclass
from pathlib import Path

import tomllib

EXTRACT_DIR = Path(__file__).resolve().parent


@dataclass(frozen=True)
class TagCaps:
    type: int
    audience: int
    language: int
    other: int
    neighborhood: int
    zipcode: int
    eligibility: int


@dataclass(frozen=True)
class Settings:
    model: str
    client_side_loop_cap: int
    max_candidates: int
    max_extracts: int
    aggregators: tuple[str, ...]
    excluded_domains: tuple[str, ...]
    refresh_default_limit: int
    refresh_min_age_days: int
    data_json: Path
    pending: Path
    refresh_jsonl: Path
    refresh_state: Path
    extract_prompt: Path
    search_prompt: Path
    tag_caps: TagCaps


def _require(mapping: dict, key: str, dotted: str):
    if key not in mapping:
        raise SystemExit("missing config key: " + dotted)
    return mapping[key]


def _table(mapping: dict, key: str, dotted: str) -> dict:
    value = _require(mapping, key, dotted)
    if not isinstance(value, dict):
        raise SystemExit("missing config key: " + dotted)
    return value


def _resolve(extract_dir: Path, relative: str) -> Path:
    return (extract_dir / relative).resolve()


def load_settings(
    *,
    extract_dir: Path | None = None,
    config_path: Path | None = None,
) -> Settings:
    root = EXTRACT_DIR if extract_dir is None else extract_dir
    path = root / "config.toml" if config_path is None else config_path
    if not path.is_file():
        raise SystemExit("missing config: " + str(path))
    payload = tomllib.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise SystemExit("missing config key: model")

    paths = _table(payload, "paths", "paths")
    search = _table(payload, "search", "search")
    refresh = _table(payload, "refresh", "refresh")
    caps = _table(payload, "tag_caps", "tag_caps")
    return Settings(
        model=str(_require(payload, "model", "model")),
        client_side_loop_cap=int(
            _require(payload, "client_side_loop_cap", "client_side_loop_cap")
        ),
        max_candidates=int(_require(search, "max_candidates", "search.max_candidates")),
        max_extracts=int(_require(search, "max_extracts", "search.max_extracts")),
        aggregators=tuple(str(item) for item in _require(search, "aggregators", "search.aggregators")),
        excluded_domains=tuple(
            str(item)
            for item in _require(search, "excluded_domains", "search.excluded_domains")
        ),
        refresh_default_limit=int(
            _require(refresh, "default_limit", "refresh.default_limit")
        ),
        refresh_min_age_days=int(
            _require(refresh, "min_age_days", "refresh.min_age_days")
        ),
        data_json=_resolve(root, str(_require(paths, "data_json", "paths.data_json"))),
        pending=_resolve(root, str(_require(paths, "pending", "paths.pending"))),
        refresh_jsonl=_resolve(
            root, str(_require(paths, "refresh_jsonl", "paths.refresh_jsonl"))
        ),
        refresh_state=_resolve(
            root, str(_require(paths, "refresh_state", "paths.refresh_state"))
        ),
        extract_prompt=_resolve(
            root, str(_require(paths, "extract_prompt", "paths.extract_prompt"))
        ),
        search_prompt=_resolve(
            root, str(_require(paths, "search_prompt", "paths.search_prompt"))
        ),
        tag_caps=TagCaps(
            type=int(_require(caps, "type", "tag_caps.type")),
            audience=int(_require(caps, "audience", "tag_caps.audience")),
            language=int(_require(caps, "language", "tag_caps.language")),
            other=int(_require(caps, "other", "tag_caps.other")),
            neighborhood=int(_require(caps, "neighborhood", "tag_caps.neighborhood")),
            zipcode=int(_require(caps, "zipcode", "tag_caps.zipcode")),
            eligibility=int(_require(caps, "eligibility", "tag_caps.eligibility")),
        ),
    )


def website_of(row: dict) -> str:
    return str(row.get("website") or "").strip()


def load_jsonl(path: Path) -> list[dict]:
    if not path.is_file():
        return []
    rows = []
    for i, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        line = line.strip()
        if not line:
            continue
        try:
            rows.append(json.loads(line))
        except json.JSONDecodeError:
            print(f"skip bad jsonl line {i}: {path}", file=sys.stderr, flush=True)
    return rows


def load_data_json(path: Path | None = None) -> dict:
    target = settings.data_json if path is None else path
    if not target.is_file():
        raise SystemExit("missing resource database: " + str(target))
    return json.loads(target.read_text(encoding="utf-8"))


settings = load_settings()
