# TODO

## Extract-from-URL agent (shipped)

Local CLIs: `run_extract.py`, `run_search.py`, `run_refresh.py`. Shared Grok loop in `loop.py`. Tunables in `config.toml`. Prompts in `prompts/`. Queues are gitignored JSONL. Extract eval is `eval/run_eval.py` against `cases.json`. Next work is **Extract: CLI to feature** below.

## Extract: CLI to feature

`scripts/extract/` is a local Grok loop. That is enough to prove the schema. It is not a feature SCHRC can run. Drafts sit in gitignored `queues/pending.jsonl` and `queues/refresh.jsonl`. Editors work in Google Sheets. The live site reads `public/data/data.json` after Database update. Closing that gap is the work. Do not add a Vite review app, a second model provider, or writes to `data.json` until the sheet path works.

**Done looks like:** someone pastes a URL or a query (or a scheduled job runs). A pending row appears on the spreadsheet they already use. A human marks it approved or rejected. Approved rows become `COMPLETE & VERIFIED` on `LASRP Data (EN)`. The existing Action publishes. Invented phones, hours, or eligibility stay off the site.

### 1. Write to the sheet (this is the product)

- [ ] **Pending tab for new orgs.** After a successful `submit_resource`, append a row to a `Pending` worksheet on spreadsheet `1Bpe3AxJnxzBAjRTzWEMYaja1BqaMD1a5EiymTQ_EoHw`. Map `ResourceDraft` onto the same columns as `LASRP Data (EN)` (`A2:T` in `formatDatabase.py`) plus review columns: `status` (default `pending_review`), `source_url`, `notes_for_review`, `confidence`, `extracted_at`. Keep writing JSONL too until the sheet write is trusted.
- [ ] **Refresh tab for field diffs.** Same for `run_refresh.py` rows (`resource_id`, `field`, `old_value`, `new_value`, `source_url`, `status`). Editors compare old vs new in the sheet, not in a terminal.
- [ ] **Reuse the existing service account.** `GSHEET_CLIENT_EMAIL` / `GSHEET_PRIVATE_KEY` already pull the catalog. Restore GCP (see Publish pipeline) before adding a second Google auth. Do not mint a new OAuth app for this.
- [ ] **Never write `data.json` from the agent.** Publish stays: approved sheet row → Database update Action → `public/data/data.json`.

### 2. Review protocol

- [ ] **Status values.** `pending_review` / `approved` / `rejected` / `needs_info`. Only `approved` may be copied onto `LASRP Data (EN)` with status `COMPLETE & VERIFIED` (the formatter ignores every other status).
- [ ] **Promote script or sheet recipe.** A small `run_promote.py` (or an Apps Script on the sheet) copies approved Pending rows onto `LASRP Data (EN)` and assigns the next id. Humans still click approve. The script does not guess.
- [ ] **Do not auto-approve on `confidence`.** The model score is a hint in the sheet. Track 1 eval (phone/email/address) is the quality bar, not the float.

### 3. Make search and refresh trustworthy

- [ ] Unit-test `classify_candidates` / aggregators / `hostname` with canned candidates (no API). Discovery currently has no eval.
- [ ] Two live `run_search.py` queries after those tests. Probe: a Koreatown food query must skip hosts already in `data.json` (for example `lafoodbank.org` if listed).
- [ ] Near-duplicate names, not only hosts. `classify_candidates` skips hostname matches against `data.json` and pending JSONL. Add a name key so "Jenesse Center" / "The Jenesse Center" does not draft twice. Dedup against the Pending tab once it exists.
- [ ] xAI `excluded_domains` max is 5 and is already full (Yelp, Wikipedia, Facebook, Instagram, Reddit). 211 / FindHelp are prompt + Python skip only. Decide how aggregators stay out if the API list cannot grow.
- [ ] Refresh already walks stale ids and queues diffs. After sheet write works, run `run_refresh.py` on a schedule with the existing `--limit` cap (default 3). Confirm NLSLA-style address drift shows up as a pending field row, not a silent overwrite.

### 4. Trigger without a local Python env

The CLIs stay. Add one way for a non-dev to start a job.

- [ ] **GitHub `workflow_dispatch`.** Inputs: `url` (extract), `query` (search), or `refresh`. Secrets: `XAI_API_KEY` plus the existing `GSHEET_*`. Cap extracts per run (`max_extracts`, refresh `--limit`) so a bad click cannot spend the key.
- [ ] **Optional: a cell or menu on the sheet** ("extract this URL") that writes to a Requests tab the Action reads. That is enough. Do not build a new website for this.

### 5. Extraction quality (still the same loop)

Do these against `eval/run_eval.py`. One prompt or schema change per run. Keep the ship bar: no invented primary phone; blank if the page does not say.

- [ ] Eligibility pass: search the same host for services / FAQ / apply / PDF when the homepage omits rules. Leave `eligibility` / `eligibilityText` blank when the site does not state them.
- [ ] 5-digit zips in the draft (same as the site enhancement). ZIP+4 must collapse before the row hits Pending.
- [ ] Schema DRY: generate Python enums from `src/types/types.ts`. A config file does not fix the duplicated `Literal` lists in `schema.py`.
- [ ] Buried-page fetch is still host-locked `web_search`. Do not open discovery search inside extract.

### Not yet (keep the CLI small)

- Multiple model providers. One Grok loop is fine until a second provider is an actual requirement.
- A Vite or Next review UI. The sheet is the review UI.
- Auto-merge into `public/data/data.json`.
- Outbound phone calls or emails. Website fetch is the verification this agent owns.
- Flyer / PDF intake. Add only after Pending write and review states exist.
- Using `confidence` to skip review.

## Possible enhancements

Product and ops backlog. Not sequenced. Notes below are current behavior so we do not rebuild what already exists.

### Site

- [ ] **Favorites.** Selection already persists in `localStorage` (`selectedResources`). A separate `favoriteResources` set is stored in the `?f=` URL query. The results-header star that copies selected rows into favorites is commented out in `Results.tsx`. The navbar star is labeled "View favorite resources" but `SelectedResourcesView` renders `selectedResources`, not favorites. Finish one model: star a resource, view the starred set, share via URL. Do not keep two overlapping sets.

- [ ] **Login and saved favorites.** No auth today. Accounts would let the same starred list follow a clinician across devices. Depends on finishing the client-side favorites model first. Prefer a free-tier option (for example Clerk's free plan, or a magic-link over email) if this is built. Do not add a custom user database unless that is required.

- [ ] **Print styling.** `Printer.tsx` already builds an A4 PDF of selected resources (`@react-pdf/renderer`). Header hardcodes `laresources.org`. Body is name, types, description, phone, email, website. No address, hours, eligibility, or LASRP branding. Restyle the handout for clinic use (clear hierarchy, clickable links, page numbers, logo).

- [ ] **Expand details UI.** Collapsed `ResourceRow` shows name, description, checkbox, globe, and an expand/compress icon. Expanded state is a two-column grid (eligibility + description vs contact fields) in `ResourceRow.module.css`. Replace the icon-only expand control and the expanded layout so contact and eligibility are easier to scan.

- [ ] **Google Maps for addresses.** Address is plain text. No map, no directions link. Add a maps link (and optionally an embed) from `address`. Maps Embed/JavaScript APIs are billed; a `https://maps.google.com/?q=` link is free and is enough unless SCHRC wants an in-page map.

- [ ] **Search algorithm.** `SearchBar.tsx` uses Fuse.js (`threshold: 0.3`) over `name` and `description` only. Filters are separate multi-selects. Improve ranking and coverage: eligibility text, neighborhood, address, moreInfo; tighter typo handling; do not match on the sentinel `"PASS"` name set as a user-visible result.

- [ ] **Custom domain.** No domain config in this repo. The PDF already names `laresources.org`. Point a real hostname at the Vercel deployment and keep print/copy in sync. Confirm ownership with SCHRC before buying or transferring DNS.

- [ ] **UI languages / AI translation.** The app is English-only. Resource rows have language *tags* (which languages the org serves), not translated copy. Translate chrome and/or resource text. Do not auto-publish model translations of eligibility or phone numbers without a human pass. A second sheet tab (the Action already reads `LASRP Data (EN)`) is the existing editorial path if they want Spanish as data, not as a live model call.

- [ ] **Zip codes as 5 digits.** Filter options are the raw `zipcode` strings from the sheet. `formatDatabase.py` does not normalize. Four published values are ZIP+4 (`90012-2952`, `90028-6213`, `90033-1727`, `93011-3058`), so they do not match a 5-digit filter. Strip to the first five digits in the formatter (and extract schema) so `90012` and `90012-2952` are the same code.

### Research tool

Intended loop: find a source in the world, verify it is real and current, then pull eligibility (including copy that is buried on the site). Related code already on main: `scripts/extract/` (`run_search.py` finds org URLs, `run_extract.py` drafts a row from a site, `run_refresh.py` diffs published rows). That CLI writes `queues/*.jsonl`. It does not call phones, send email, or read flyers. Humans still publish through the Google Sheet. Turning the CLI into something editors can run is **Extract: CLI to feature**, not a new agent.

- [ ] **Intake from flyers / external sheets.** Accept a photo, PDF, or spreadsheet of resources and produce pending drafts. Not built. Website URL extract is the only intake path.

- [ ] **Verify contact still works.** Website fetch and refresh diffs exist. Outbound phone calls and emails do not. Live calling/emailing is a different product (cost, consent, hours, recordings) and should not be mixed into the Grok page loop. Website existence + field drift can stay in `run_refresh.py`.

- [ ] **Eligibility from the site, including buried pages.** Extract already maps `eligibility` / `eligibilityText` when the model finds them. Add an explicit "search this host for eligibility" pass (services, FAQ, apply, PDF) so those fields are not left blank when the homepage omits them. Keep blanks when the site does not state rules. Do not invent FPL or residency limits.

### Publish pipeline

- [ ] **GitHub Action / GCP sheet sync.** `.github/workflows/database-update.yml` pulls worksheet `LASRP Data (EN)` (`A2:T`) with `GSHEET_CLIENT_EMAIL` / `GSHEET_PRIVATE_KEY`, runs `scripts/formatDatabase.py`, commits `public/data/data.json`. About Us still says daily updates. Last sheet-driven `data.json` commit is 4 Apr 2026. Workflow state is `disabled_inactivity` (last run 3 Jun 2026). June 2026: Google free-trial service account expired; a nonprofit GCP account was the intended fix. Restore secrets, re-enable the workflow, `workflow_dispatch` once, confirm a sheet edit reaches the live site. This is the publish path the rest of the catalog depends on.
