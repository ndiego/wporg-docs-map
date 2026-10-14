# Rosetta locale sites: how `rosetta.json` was collected

Collected 2026-10-14. `data/rosetta.json` has one entry per Rosetta site (the locale sites at
`xx.wordpress.org`), validated by `data/rosetta.schema.json` through `scripts/validate.py`, and re-measured by
`python3 -I scripts/probe.py --rosetta` (code in `scripts/rosetta.py`).

## The list of locales

The source is the Polyglots teams table at https://make.wordpress.org/polyglots/teams/ (208 rows). Each row gives
the English and native names, the WP locale code, the Rosetta site link (when there is one), the newest localized
release, the newest language pack and a translation percentage. 203 rows link a Rosetta site; those 203 are the
`locales`. The 5 without a site (`ba`, `haw_US`, `pa_PK`, `sr_RS_latin`, `bgn`) are listed under
`no_site_locales`. `subdomain` is the host label of the linked site, with the teams page's casing.

https://translate.wordpress.org/api/languages/ returns a 404 page, so it was not used.

## What was requested per site

Sequential requests, a 0.25 s pause after each, 15 s timeout, one retry on a network error or 5xx, user agent
`Mozilla/5.0 (compatible; wporg-docs-map probe; +https://github.com/ndiego/wporg-docs-map)`.

| Part | Requests | Fields |
| --- | --- | --- |
| Home | `/` (status, final URL, `<title>`); `/wp-json/wp/v2/types`; `X-WP-Total` on `?per_page=1` for `posts` (with `orderby=date` for the newest date), `pages` and any other content type; `/download/`; `pages?slug=showcase` | `home.*`, `probe.*` |
| Support | `/support/wp-json/wp/v2/types`; `X-WP-Total` for `helphub_article` (rest base `articles`, newest date) and `helphub_version` (rest base `wordpress-versions`); `/support/forums/` (counts distinct `id="bbp-forum-N"` cards); `/support/view/all-topics/feed/` (newest `pubDate`) when forums exist | `support.*` |
| Team | `/team/wp-json/wp/v2/types`; `X-WP-Total` for `posts` (newest date) and `handbook` | `team.*` |
| Translation | https://translate.wordpress.org/api/projects/wp/dev/ once per run; `https://api.wordpress.org/core/version-check/1.7/?locale=<locale>`; `https://make.wordpress.org/polyglots/teams/?locale=<locale>` | `translation.*` |

Request count: 2,394 for the full run (about 12 per locale, 4 for the error sites), 85 to re-read team pages after
a parser fix, 35 for two `--only` test runs, and about 60 exploratory requests. Each entry's `evidence` lists its
endpoints with the date; `probe.requests` gives the per-locale count.

## Definitions

- **site_status.** `error` when the home request fails or returns 4xx/5xx; `redirect` when its final URL leaves
  the locale host; otherwise `active` when the site has dated activity (newest news post, team post, forum topic
  or HelpHub article) within 365 days of the run, and `inactive` when not. This measures site activity, not
  translation activity: Turkish has 1,514 current translation contributors and is `inactive` because its newest
  site post is from 2016.
- **A subsite exists** when its `/wp-json/wp/v2/types` returns JSON on the locale's own host.
- **Content types** (`types`) leave out plumbing types (attachments, menus, templates, global styles, fonts,
  Jetpack `jp_*`, `feedback`, `jetpack_form`, `visibility_preset`, and bbPress `forum`/`topic`/`reply`).
- **Features** compare against the main site's set: `home pages` (pages > 0), `news` (posts > 0), `showcase`
  (a showcase post type or a page with slug `showcase`), `download` (`/download/` returns 200 on the locale host),
  `support forums` (at least one bbPress forum on `/support/forums/`), `helphub articles` and `helphub versions`
  (published count > 0), `team p2` (team posts > 0), `team handbook` (handbook pages > 0). Sites in `error`
  have every feature `false`.
- **core_dev_percent** is `current_count / all_count` for the locale's translation set of the WordPress core
  development project (`wp/dev`, 8,142 strings), to one decimal. It leaves out the `admin`, `admin/network`
  and `cc` sub-projects. **polyglots_percent** is the figure on the teams page, which differs (for example
  `af` 75 there, 44.3 here); the page does not say what it covers, so both are kept.
- **localized_package** is `true` when version-check offers a package for that locale, which it does only when a
  localized build of the current release (7.1.3) exists. **localized_release** and **language_pack** are the
  teams page's columns: the newest localized build of any version, and the newest language pack.
- **contributors** is "Current Translation Contributors (N)" on the locale's Polyglots team page;
  `past_contributors`, `locale_managers`, `gtes` (General Translation Editors) and `ptes` come from the same
  headings. The page leaves out an empty section, so a page that rendered without a heading counts it as 0.

## Caveats

- REST totals count published items only; drafts, private pages and trashed items are not visible.
- Forums are not countable through REST: the bbPress `forum` and `topic` routes exist on every support subsite and
  return `X-WP-Total: 0`. `forum_count` counts the forum cards on `/support/forums/` (top level only); topic
  counts are not recorded. `newest_topic` is the newest item in the all-topics feed.
- Every reachable home site has 39 to 81 published pages, most of them the standard Rosetta pages (about,
  download, release archive and the like). `home pages` is therefore true almost everywhere and says little.
- No locale has a showcase: no site registers a showcase type or a `showcase` page (ja.wordpress.org/showcase/
  resolves to a 2008 news post, which is not counted).
- Dates are publication dates (`date`), not `modified`.
- The four formal and variant locales (`de_CH_informal`, `de_DE_formal`, `nl_NL_formal`, `pt_PT_ao90`) are linked
  from the teams page with underscore hostnames. The `*.wordpress.org` certificate does not cover them, so
  Python's TLS check fails (`error`); curl on the same day got a 301 to https://wordpress.org/. Their translation
  fields are still measured.

## What stands out

- **203 Rosetta sites, 38 active.** 161 have had no dated activity in a year; 4 are unreachable (above); none
  redirects. 27 reachable sites have no news posts, team posts, HelpHub articles or forums at all (for example
  `am`, `ga`, `ku`, `zh-sg`, `zul`).
- **HelpHub is rare.** 17 support subsites register the HelpHub post types and 12 have published articles (982 in
  total): `fr` 296, `ja` 264, `it` 239, `es-mx` 59, `ru` 48, `es` 22, then `cn`, `br`, `ve`, `pt-ao`, `sr`, `ko`
  with 13 or fewer. Only `fr` published one in the last year; for 8 of the 12 the newest article dates from 2018 to 2020. Only 3 locales
  have HelpHub version pages (`cn` 6, `ja` 2, `pt-ao` 2). `fr`, `es-mx` and `ve` have HelpHub but no forums.
- **Forums on 46 sites, 72 support subsites.** 23 subsites have neither forums nor articles. 27 locales had a new
  forum topic in the last year (`de`, `ja`, `nl`, `fa` on the day of the run); 15 forum sites last saw a topic
  before 2025 or show none. `fr` has no forums at all.
- **Team sites on 115 locales, handbooks on all 115** (910 handbook pages). `ja` alone has 460; the next are `es`
  54, `fr` 52, `it` 51, `br` 48. Only 11 team blogs posted in the last year; `it` has the most team posts (760).
- **Feature coverage against the main site:** no locale has all nine; the best have eight (`ja`, `cn`, `pt-ao`, all missing only showcase) or seven (`br`, `es`, `it`, `ko`, `ru`,
  `sr`).
  `showcase` is on none, `helphub versions` on 3, `helphub articles` on 12, `support forums` on 46.
- **Translation of core (`wp/dev`):** median 55.3%. 37 locales are at 100%, 53 at 95% or more, 49 between 50% and
  95%, 46 between 10% and 50%, and 55 below 10% (12 at 0%). 56 locales get a localized 7.1.3 package; `ar`, `ca`,
  `cn`, `cy`, `es`, `fa` and `mya` are complete or nearly but their newest localized build is 7.1.
- **Translation and site activity diverge.** 23 locales at 95% or more have inactive sites, including `tr`,
  `en-gb`, `es-mx`, `ka`, `nb` and the English variants. Current translation contributors total 19,803, led by
  `es` 1,948, `de` 1,613, `tr` 1,514, `nl` 1,171, `ru` 1,041; the median locale has 8, and 35 have none.
- **Most active:** seven locales have a news post, a team post and a forum topic within the last year plus a
  team handbook: `br`, `cn`, `de`, `es`, `it`, `ja`, `pl`. Of these, `ja` and `cn` also have HelpHub articles
  and version pages, though their newest articles date from 2023 and 2020.
- **Least active with any content:** `si` (newest item 2009), `su` (2010), `fa-af`, `so`, `li`, `srd` (2011).
