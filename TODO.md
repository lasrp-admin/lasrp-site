# TODO

## Extract-from-URL agent

- [ ] Support multiple model providers. Keep `submit_resource` and the Resource draft schema provider-agnostic. Put Grok-specific `web_search` behind a provider module so Gemini, OpenAI, or others can be swapped in later without rewriting the write path.
- [ ] Follow DRY for the schema. `src/types/types.ts` (`Resource` and the `ALL_*` enum arrays) is the source of truth. Do not hand-maintain a second enum list in `schema.py`. Either generate Python/JSON from `types.ts`, or define the agent schema in TypeScript from those same arrays. A config file does not fix this.
- [x] Config file for tunables (split config, not a kitchen sink). Add `scripts/extract/config.toml` plus a small `settings.py` that fails at startup if required keys are missing. Put knobs there: `model`, `client_side_loop_cap`, `max_candidates`, `max_extracts`, `aggregators`, `excluded_domains`, refresh `default_limit` / `min_age_days`, paths (`data_json`, `pending`, `refresh_jsonl`), and tag caps you actually intend to tune. Keep secrets in `.env` (`XAI_API_KEY` only). Keep agent instructions in `prompts/extract.txt` / `prompts/search.txt`. Keep `ALL_*` enums in `src/types/types.ts` (generate Python from that; do not copy them into TOML). Do not move enum literals, `diff.py` normalizers, tool descriptions, or xAI schema quirks. Do not add env overlays, profiles, or a config framework.
- [x] `scripts/extract/pending.json` is JSONL with a `.json` name and is not in `.gitignore`. Rename to `pending.jsonl` (or gitignore `pending.json`). Refresh files are already ignored.
- [ ] Unit-test `keepers()`, aggregators, and `host_key()` with canned candidates (no API). Discovery currently has no eval.
- [x] Page-grounded extract eval: `scripts/extract/eval/` scores `extract_url` (`persist=False`) against `cases.json`.
- [ ] xAI `excluded_domains` max is 5 and is already full (Yelp, Wikipedia, Facebook, Instagram, Reddit). 211 / FindHelp are prompt + Python skip only; decide how to keep aggregators out if the exclude list cannot grow.
- [x] Move the system prompt out of `agent.py` into a separate document (for example `scripts/extract/prompt.txt` or `prompt.md`) and load it at runtime so prompt edits do not require changing the loop code.
- [x] Extract the client-side tool loop safety cap (`range(4)` in `agent.py`) into a named constant so it is obvious, tunable, and not a magic number.
