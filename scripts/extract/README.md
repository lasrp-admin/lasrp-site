# Extract

Three commands. Live site data stays in `../../public/data/data.json`.

```bash
python run_extract.py https://jenesse.org/
python run_search.py "food pantry Koreatown Los Angeles"
python run_refresh.py
```

`run_*.py` write queues. `eval/run_eval.py` scores extract without writing. `loop.py` is the shared Grok tool loop.

## Queues (gitignored)

| File | What it is |
|---|---|
| `queues/pending.jsonl` | New-org drafts. Review, then add to `data.json`. |
| `queues/refresh.jsonl` | Field patches on published ids. Review, then edit `data.json`. |
| `queues/refresh_state.json` | Last-checked cursor for refresh. Not a review queue. |

## Prompts

- `prompts/extract.txt` — one URL → `submit_resource`
- `prompts/search.txt` — query → `submit_candidates`

## Eval

Page-grounded gold is `eval/cases.json`. Track 1 is contact facts (hard pass/fail). Track 2 is tag F1. Runs do not write queues. JSON reports go to `eval/runs/` (gitignored).

```bash
python eval/run_eval.py
python eval/run_eval.py --id 0
```

## Config

Tunables live in `config.toml` and are loaded by `settings.py` (missing keys fail at startup). Put `XAI_API_KEY` in `.env` only.

## Next

This folder is a local tool. The product path (sheet Pending tab, review states, Action trigger) is in the repo root `TODO.md` under **Extract: CLI to feature**.
