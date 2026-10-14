# Working in this repository

This repo is a dataset with a page on top. The dataset is `data/documentation-map.json`; everything else is
generated from it or checks it. Edit the JSON, never the page.

## Layout

```
data/documentation-map.json   the map: one row per documentation surface, 24 fields each (see data/schema.json)
data/schema.json              the row schema; scripts/validate.py enforces it plus ordering and id rules
data/VERIFICATION.md          how the data was verified and what could not be
scripts/validate.py           schema + rules; run before every commit
scripts/sort.py               sorts rows by category order then name (validate requires it)
scripts/probe.py              re-measures URL status, REST totals, Markdown output, repo activity into `probe`
scripts/changelog.py          Markdown diff between two versions of the JSON
site/                         the page: Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui; imports the JSON at build time
site/src/lib/data.ts          row types and the source-of-truth / import-mechanism kind rules used by the filters
site/src/index.css            the theme: WordPress.org palette and fonts as shadcn CSS variables (light and dark)
.github/workflows/            validate on PR, weekly probe that opens a PR, publish the page on push
```

## Tasks

- **Correct a row.** Edit the field in the JSON, update `evidence` with how you know and today's date, and set
  `status` if it changed. Run `python3 -I scripts/validate.py`. Commit with a one-line message naming the row.
- **Add a surface.** Add a row with every field from the schema (`null` where unknown, never a guess), a unique
  kebab-case `id`, a `category` from the file's `categories` list, and at least one `evidence` entry. Run
  `scripts/sort.py` then `scripts/validate.py`. Update `related_rows` on rows it relates to.
- **Re-measure.** `python3 -I scripts/probe.py` (set `GITHUB_TOKEN` for the repo checks; `--only <id>` for one row;
  `--dry-run` to see without writing). It only writes `probe` and REST-measured `page_count` values. Then
  `sort.py`, `validate.py`, and `scripts/changelog.py <old> <new>` for the commit message.
- **Build the page.** `cd site && npm ci && npm run build` writes `site/dist/` (gitignored): `index.html`, `assets/`
  and a copy of `documentation-map.json`. Paths are relative, so serve the folder from any host or subpath
  (`python3 -m http.server --directory site/dist`). `npm run dev` serves a live preview. Add UI pieces with the
  shadcn CLI (`npx shadcn@4.21.4 add <component>`) and keep dependency versions pinned exactly.
- **Publish.** Pushing to `trunk` publishes the page through GitHub Pages. The shared link is the Spacefast space:
  after building, run `spacefast publish site/dist -y -m "<what changed>"` (the space is recorded in
  `site/.spacefast/state.json`, which is gitignored; the first publish used `--slug wporg-docs-map --access public`).

## Rules

1. Facts, not inference. If a claim rests on timing or indirect evidence, say so in `notes` ("inferred").
2. Every measurement carries its method and date in `page_count`; every row carries `evidence`.
3. Ids are stable. Rename a surface by changing `name`, never `id`.
4. Narrative fields (`owner_team`, `editing_path`, `source_of_truth`, `import_mechanism`, `notes`) are written by
   people or agents with evidence; the probe never touches them.
5. Write "WordPress.org" capitalized in prose; URLs stay lowercase.
6. A change that adds or removes a row, or changes `status`, `source_of_truth` or `import_mechanism`, gets a line
   in `CHANGELOG.md` under today's date (the weekly probe does this for its own changes).
