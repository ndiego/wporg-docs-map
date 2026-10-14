# WordPress.org documentation map

A living map of every form of documentation on WordPress.org: what each surface is, where it lives, its source
of truth, how content reaches the site, who edits and owns it, how big it is, its translation state, and the
repositories behind it. One row per surface, with the evidence for every claim.

**The page:** https://wporg-docs-map.space.fast/ (Spacefast, the link to share) and
https://ndiego.github.io/wporg-docs-map/ (GitHub Pages, published from `trunk`).
**The Rosetta locale sites:** https://wporg-docs-map.space.fast/rosetta/ and
https://ndiego.github.io/wporg-docs-map/rosetta/, a second page that maps every locale site and how it compares
with the main WordPress.org site, from [`data/rosetta.json`](data/rosetta.json). Its background section (when the
locale sites began, what they are for, who runs them) is sourced from
[`data/rosetta-history.json`](data/rosetta-history.json).
**The data:** [`data/documentation-map.json`](data/documentation-map.json), validated by
[`data/schema.json`](data/schema.json). **How it was verified:** [`data/VERIFICATION.md`](data/VERIFICATION.md).
**What changed over time:** [`CHANGELOG.md`](CHANGELOG.md).

## Why

WordPress documentation is spread across the end-user docs, a dozen developer handbooks, a generated Code
Reference, Learn, the Make team handbooks, locale sites, dated release posts, a frozen wiki and the GitHub repos
that feed some of these. No single list of it existed. This repo is that list, measured rather than remembered,
so that anyone proposing a change to how WordPress documentation is made can start from what exists.

## How it is measured

- Page counts come from each site's REST API (`X-WP-Total` on `?per_page=1`, published items only), sitemaps or
  repo manifests. Every count records its method and date.
- Whether a handbook is synced from GitHub is decided by evidence (pages owned by the importer user, the importer's
  edit and commit links on the page), not by assumption. Claims that rest on timing alone say "inferred".
- A weekly workflow re-probes every row (URL status, REST totals, Markdown output, repository activity) and opens
  a pull request when anything changed. It never rewrites the narrative fields.
- Unknown values are `null`. The Codex and the Trac wikis block automated requests, so their rows rest on
  secondary sources and say so.

## Contributing

Something wrong or missing? [Open a correction](https://github.com/ndiego/wporg-docs-map/issues/new?template=correction.yml)
with the evidence, or send a pull request that edits the JSON. `AGENTS.md` describes the workflow for people and
agents alike: edit `data/documentation-map.json`, run `scripts/sort.py` and `scripts/validate.py`, and let the workflows publish.

## Building the page

The page in `site/` is a Vite + React + shadcn/ui app that reads the JSON at build time:

```sh
cd site && npm ci && npm run build
```

The static output lands in `site/dist/` (`index.html`, `rosetta/index.html`, `assets/`, and copies of
`documentation-map.json` and `rosetta.json`) with
relative paths, so it works on GitHub Pages under `/wporg-docs-map/` or on any other host.

## Related

- [wp-docs-platform](https://github.com/ndiego/wp-docs-platform): the exploration of one documentation platform at
  wordpress.org/docs that this map was first built for.
- [wp-documentation-migration](https://github.com/ndiego/wp-documentation-migration): the HelpHub-to-Markdown
  conversion and the research into the WordPress.org importer pipeline that several rows cite.

Code and data are MIT licensed. Facts about WordPress.org are, of course, nobody's property.
