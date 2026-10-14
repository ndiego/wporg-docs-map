# Verification, 2026-10-14

Re-verification of `data/documentation-map.json` before public release. Every row was re-checked live on 2026-10-14. The compiled file (131 rows, 2026-10-13/14) was the starting point; the result has 138 rows.

## Method

- **URLs.** `curl -A "Mozilla/5.0"` on every `url` and `example_url`, recording the first-hop status and the final status after redirects (table at the end).
- **Page counts.** Re-ran each stated method: `X-WP-Total` from `?per_page=1` on every REST collection (77 endpoints across DevHub, HelpHub, Learn, Make, News, main site, directories); the DevHub Jetpack sitemap (15 child sitemaps, 14,221 URLs, 569 under /cli/); all 201 Rosetta sites from make.wordpress.org/polyglots/teams/ for `/support/` articles and `/team/` handbooks; the WordPress.com API for WordPress.tv; `gh api` git trees for repo file counts; line count of llms.txt. Where the value matched, the old value and date were kept.
- **REST routes.** Every concrete `rest_api` route was requested and had to answer 200 with `application/json`.
- **Markdown.** `curl -sI -A "Mozilla/5.0" "<url>?output_format=md"`, reading the final `content-type`.
- **Repos.** `gh api repos/<owner>/<repo>` for all 50 repos referenced (existence, archived flag, default branch), then `gh api repos/<repo>/commits/<default branch>` for the last commit date, written into `last_activity_signal` where a repo is the source of truth or the row is a repo.
- **GitHub sync of Make handbooks.** For every Make handbook (34 handbook post types, 1,518 pages): author share of the importer user 5911429 via REST, GitHub `edit/` and `commits/` links on the landing page, and, new in this pass, whether each page renders the Make theme's GitHub template. The theme (WordPress/wporg-make, `wporg-make-2024/functions.php`, `add_handbook_templates`) selects `single-handbook-github` only for posts with `wporg_markdown_source` meta, which only the importer sets, so a page that shows "Improve it on GitHub" was imported. Every page of every Make handbook was fetched for this check.
- **Ownership and editing.** Landing pages (as Markdown), the Docs team developer-roles page, repo READMEs and CODEOWNERS. Maintainers are listed only when a team page, README or CODEOWNERS names them.
- **Missing surfaces.** Probed every candidate in the brief and listed `pages` on all Make sites, the main site, the directories, the book site and wordpressfoundation.org.
- **Normalization.** Status vocabulary, dated or path-bearing evidence, ISO dates, whitespace, valid `related_rows`, sort by category order then name; `scripts/validate.py` passes.

## What changed in substance

- **Rosetta HelpHub total was an arithmetic slip:** the per-locale numbers re-measured identical but sum to 982, not 983.
- **Accessibility and Plugins team handbooks are GitHub-synced, now shown by page markup:** 14 of 14 and 11 of 12 pages render the importer-only GitHub template. They were tagged "likely/inferred" from timing; that tag is removed, with the evidence in `notes`. The repo identity still rests on repo name and commit/PR history, because the source URL is shown only to logged-in users.
- **The book is not confirmed GitHub-backed:** WordPress/library records edits made directly on wordpress.org/book and added an importer manifest only on 2026-10-07. Source of truth downgraded to the WordPress database.
- **Named maintainers removed** where the source was not a team page, README or CODEOWNERS (HelpHub, Advanced Administration, Theme Handbook, Markdown output); **added** from CODEOWNERS or a published maintainers page (Block Editor docs, Openverse docs, WP-CLI).
- **Status** follows the map's own definition (changed in the last 12 months): 2 rows to active, 4 to stale.
- **Wording that broke the page's classifier:** `devhub-plugins` source said "a GitHub mirror exists", which the site's keyword rule (`site/src/lib/data.ts`) files as a GitHub source. Reworded without changing the fact.

## Field changes (166)

| Row id | Field | Before | After | Why |
|---|---|---|---|---|
| data-liberation-guides | status | stale | active | Landing page /data-liberation/ modified 2026-09-14, inside the 12-month window |
| data-liberation-guides | last_activity_signal | Guides page modified 2024-12-13 | Landing modified 2026-09-14; guides index modified 2024-12-13; WordPress/data-liberation trunk last commit 2026-04-03 | live re-check 2026-10-14 |
| data-liberation-guides | content_model | WordPress pages on the main site; the guides index lists Squarespace, Tumblr, HTML, RSS, Wix, Drupal and Blogger guides | Two WordPress pages on the main site (landing and guides index). The guides themselves are Markdown files in the guides/ folder of WordPr... | Guide links traced on the live page |
| data-liberation-guides | repo_links | [] | ["https://github.com/WordPress/data-liberation"] | Guides live in this repo (move-to-wp redirects here) |
| data-liberation-guides | notes | Where the individual guides live (separate pages, Playground blueprints or external) was not verified. An imported handbook at /data-libe... | The guides are read on GitHub, not on WordPress.org: the index page links straight to the Markdown files. An imported handbook at /data-l... | Resolved the open question about where guides live |
| helphub-feedback | last_activity_signal | 56 open 'HelpHub feedback' issues (2026-10-11) | 56 open 'helphub feedback' issues of 469 open (2026-10-14); newest published comment 2026-05-08 | live re-check 2026-10-14 |
| helphub-articles | maintainers_if_public | Publishing group named in prior research: Estela Rueda, Milana Cap, Andrea Roenning, Akira Tachibana | null | Names came from prior research, not from a team page, README or CODEOWNERS; the publishing group is not listed publicly |
| helphub-landing-pages | last_activity_signal | null | Newest page modified 2024-08-09 (/documentation/overview/); theme repo WordPress/wporg-documentation-2022 trunk last commit 2026-09-09 | live re-check 2026-10-14 |
| helphub-media | url | https://wordpress.org/documentation/files/ | https://wordpress.org/documentation/wp-json/wp/v2/media | wordpress.org/documentation/files/ returns 404 (no index page); the REST collection is the browsable entry point |
| helphub-media | example_url | null | https://wordpress.org/documentation/files/2026/10/distraction-free-location-edited.png | Real file from the media endpoint, returns 200 |
| helphub-media | markdown_output | yes | n/a | The surface is image and video files; the old URL returned 404 |
| helphub-media | last_activity_signal | null | Newest upload 2026-10-05 | live re-check 2026-10-14 |
| rosetta-helphub | page_count | {"value": 983, "method": "Sum of REST X-WP-Total articles on all Rosetta sites: fr 296, ja 264, it 239, es-mx 59, ru 48, es 22, cn 13, br... | {"value": 982, "method": "Sum of REST X-WP-Total articles over the 17 of 201 Rosetta sites that expose the endpoint: fr 296, ja 264, it 2... | Re-ran all 201 sites; the per-locale numbers were unchanged but sum to 982, so the old total 983 was an arithmetic slip |
| rosetta-helphub | last_activity_signal | fr, ja, it near complete; 5 locales enabled with 0 published | fr, ja, it near complete; 5 locales enabled with 0 published; fr newest modified 2026-06-15 | live re-check 2026-10-14 |
| devhub-advanced-administration | maintainers_if_public | Recent mergers kittenkamala, mindctrl (prior research) | null | Not a published maintainer list (merge history from prior research); moved to notes |
| devhub-advanced-administration | notes | Most Codex links of any surface (21 of 75). Images on four hosts. Median merge time about 34 days. | Most Codex links of any surface (21 of 75). Images on four hosts. Median merge time about 34 days. Most 2025-2026 merges by GitHub users ... | Moved merge history here; added landing-page link finding |
| devhub-advanced-administration | last_activity_signal | Repo pushed 2026-09-29 | Repo pushed 2026-09-29; main last commit 2026-09-29; newest page modified 2026-09-29 | live re-check 2026-10-14 |
| devhub-block-editor | maintainers_if_public | null | CODEOWNERS for /docs in WordPress/gutenberg: @juanmaguitar, @fabiankaegy | Public CODEOWNERS entry |
| devhub-block-editor | owner_team | Gutenberg contributors and committers (Core Editor) | Gutenberg contributors (Core Editor), with the Documentation team | Docs team developer-roles page lists the Block Editor Handbook as maintained in collaboration with the Core team |
| devhub-block-editor | last_activity_signal | 555 of 576 modified in last 12 months (sync activity), newest 2026-10-13 | 555 of 576 modified in last 12 months (sync activity), newest 2026-10-13; gutenberg trunk last commit 2026-10-14 | live re-check 2026-10-14 |
| devhub-coding-standards | last_activity_signal | Repo pushed 2026-05-19; newest modified 2026-05-25 | Repo pushed 2026-05-19; master last commit 2026-05-05; newest modified 2026-05-25 | live re-check 2026-10-14 |
| devhub-apis | status | stale | active | 13 of 45 pages modified in the last 12 months (newest 2026-10-09), which meets the map's definition of active |
| devhub-apis | owner_team | Docs team reps | Documentation team | Docs team developer-roles page lists the Common APIs handbook; "Docs team reps" was not a team name |
| devhub-apis | last_activity_signal | Median modified 2022-11-21; 26 of 45 untouched since before 2023-10-13; newest 2026-10-09 | 13 of 45 modified in the last 12 months; newest 2026-10-09; median modified 2022-11-21 | live re-check 2026-10-14 |
| devhub-home | last_activity_signal | null | Pages last modified 2017-07-13 (home), 2014 (reference, resource); theme repo WordPress/wporg-developer trunk last commit 2026-10-12 | live re-check 2026-10-14 |
| devhub-openverse-docs | import_mechanism | Sphinx build and deploy from the monorepo [deploy workflow unverified] | Sphinx build in .github/workflows/ci_cd.yml of WordPress/openverse, published to the gh-pages branch and served by GitHub Pages; PR previ... | Workflow read via gh api |
| devhub-openverse-docs | page_count | null | {"value": 523, "method": "Markdown and reST files under documentation/ in WordPress/openverse (gh api git tree); sitemap.xml returns 404"... | Old row had no count; the sitemap method cannot be run |
| devhub-openverse-docs | maintainers_if_public | null | @dhruvkb, @fcoveram, @krysal, @obulat (docs.openverse.org Current maintainers page); CODEOWNERS for /documentation/: @WordPress/openverse... | Public maintainers page and CODEOWNERS |
| devhub-openverse-docs | notes | wordpress.org/openverse/ 301s to openverse.org. The only WordPress project docs site on Sphinx. Sitemap returned 0 URLs. | wordpress.org/openverse/ 301s to openverse.org. The only WordPress project docs site on Sphinx. sitemap.xml returns 404 (2026-10-14). | Sitemap now 404 rather than 0 URLs |
| devhub-openverse-docs | last_activity_signal | Repo pushed 2026-10-14 | Repo pushed 2026-10-14; main last commit 2026-10-13 | live re-check 2026-10-14 |
| devhub-playground | last_activity_signal | Importer added 2026-07-15; manifest generation PR #4332 2026-09-30 | Importer added 2026-07-15; manifest generation PR #4332 2026-09-30; trunk last commit 2026-10-13; newest page modified 2026-10-14 | live re-check 2026-10-14 |
| devhub-plugins | source_of_truth | WordPress database (a GitHub mirror exists but is not imported) | WordPress database (the WordPress/developer-plugins-handbook mirror is not imported) | Same fact, reworded: the old wording contained "GitHub", which the page generator classifies as a GitHub source |
| devhub-plugins | owner_team | Docs team reps; Plugin Review team for /plugins/wordpress-org/ policy pages | Documentation team; Plugins team (Plugin Review) for /plugins/wordpress-org/ policy pages | Docs team developer-roles page lists the Plugins handbook; "Docs team reps" was not a team name |
| devhub-plugins | last_activity_signal | Median modified 2023-12-14; 16 modified in last 12 months (2026-10-13) | Median modified 2023-12-14; 16 modified in last 12 months; newest 2026-09-13 | live re-check 2026-10-14 |
| devhub-rest-api | last_activity_signal | Repo last push 2025-06-04; nothing modified in last 12 months | Repo last push 2025-06-04; master last commit 2025-06-04; newest page modified 2025-06-04; nothing modified in last 12 months | live re-check 2026-10-14 |
| devhub-scf | last_activity_signal | null | trunk last commit 2026-08-26 (pushed 2026-09-29); newest page modified 2026-08-07 | live re-check 2026-10-14 |
| devhub-themes | owner_team | Themes team with Docs team reps | Documentation team, in collaboration with the Themes team | Docs team developer-roles page: the Themes handbook is maintained in collaboration with the Themes team; the landing page points contributors to the Docs team blog |
| devhub-themes | maintainers_if_public | Justin Tadlock, Cheyne (@chekle) | null | Names came from page authorship and issue activity (one inferred), not a team page, README or CODEOWNERS |
| devhub-themes | notes | No GitHub repo yet; the sibling repo's migration plan moves it to the DevHub importer with zero structure change. 19 pages link to the Co... | No GitHub repo yet; the sibling repo's migration plan moves it to the DevHub importer with zero structure change. 19 pages link to the Co... | Moved author fact here |
| devhub-themes | last_activity_signal | Median modified 2023-12-14; 19 modified in last 12 months (2026-10-13) | Median modified 2023-12-14; 19 modified in last 12 months; newest 2026-07-22 | live re-check 2026-10-14 |
| devhub-developer-blog | last_activity_signal | First post 2022-11-17; latest 2026-09-10 (REST 2026-10-13); monthly 'What's new for developers' | First post 2022-11-17; latest 2026-09-10 (REST 2026-10-14); monthly 'What's new for developers'; developer-blog-content trunk last commit... | live re-check 2026-10-14 |
| devhub-cli-commands | maintainers_if_public | Bot PRs request @swissspidy | CODEOWNERS in wp-cli/handbook: @wp-cli/committers | Public CODEOWNERS; the bot reviewer is moved to notes |
| devhub-cli-commands | notes | Own templates (archive-command.html, single-command.html). command-history.json drives 'Available since'. wp-cli.org now 301s to wordpres... | Own templates (archive-command.html, single-command.html). command-history.json drives 'Available since'. wp-cli.org (every path) 301s to... | Added /cli/ redirect finding |
| devhub-cli-commands | last_activity_signal | null | wp-cli/handbook main last commit 2026-10-11 | live re-check 2026-10-14 |
| code-reference-classes | last_activity_signal | 225 items tagged since 7.1.0, so parse current to 7.1 (2026-10-13); restored 2026-02-25 after stalling 6.4 to 6.9.1 | 225 items tagged since 7.1.0 (2026-10-14), so parse current to 7.1; restored 2026-02-25 after stalling 6.4 to 6.9.1; wordpress-develop tr... | live re-check 2026-10-14 |
| code-reference-functions | last_activity_signal | 225 items tagged since 7.1.0, so parse current to 7.1 (2026-10-13); restored 2026-02-25 after stalling 6.4 to 6.9.1 | 225 items tagged since 7.1.0 (2026-10-14), so parse current to 7.1; restored 2026-02-25 after stalling 6.4 to 6.9.1; wordpress-develop tr... | live re-check 2026-10-14 |
| code-reference-hooks | last_activity_signal | 225 items tagged since 7.1.0, so parse current to 7.1 (2026-10-13); restored 2026-02-25 after stalling 6.4 to 6.9.1 | 225 items tagged since 7.1.0 (2026-10-14), so parse current to 7.1; restored 2026-02-25 after stalling 6.4 to 6.9.1; wordpress-develop tr... | live re-check 2026-10-14 |
| code-reference-methods | last_activity_signal | 225 items tagged since 7.1.0, so parse current to 7.1 (2026-10-13); restored 2026-02-25 after stalling 6.4 to 6.9.1 | 225 items tagged since 7.1.0 (2026-10-14), so parse current to 7.1; restored 2026-02-25 after stalling 6.4 to 6.9.1; wordpress-develop tr... | live re-check 2026-10-14 |
| code-reference-archives | last_activity_signal | null | wordpress-develop trunk last commit 2026-10-14 (reaches the site only at the next parser run); since 7.1.0 term holds 225 items | live re-check 2026-10-14 |
| code-reference-explanations | last_activity_signal | null | Newest explanation modified 2026-08-23 | live re-check 2026-10-14 |
| code-reference-user-notes | last_activity_signal | null | Newest published note 2026-10-10 | live re-check 2026-10-14 |
| contrib-contributor-handbook | source_of_truth | Mixed: GitHub https://github.com/WordPress/contributor-handbook for 54 pages, wp-admin for the rest | Mixed: GitHub https://github.com/WordPress/contributor-handbook for 55 pages, wp-admin for the rest | 55 of 86 pages render the GitHub template (54 importer-authored plus 1 imported page with a human author) |
| contrib-contributor-handbook | owner_team | Cross-team (Program / Community) | Community team (named on the landing page for suggested edits); content is cross-team | Landing page asks for suggested edits by email to the Community Team |
| contrib-contributor-handbook | editing_path | Pull request to WordPress/contributor-handbook for imported pages; wp-admin otherwise | Pull request to WordPress/contributor-handbook for imported pages; wp-admin otherwise. The landing page asks for suggested edits by email... | Landing page text |
| contrib-contributor-handbook | notes | 54 of 86 pages authored by the `wordpressdotorg` importer user (id 5911429); the WordPress Credits program pages are human-authored. Repo... | 54 of 86 pages authored by the `wordpressdotorg` importer user (id 5911429) and 55 render the GitHub template; the WordPress Credits prog... | Added template evidence |
| contrib-contributor-handbook | last_activity_signal | Newest modified 2026-09-28 | Newest modified 2026-09-28; main last commit 2026-09-28 | live re-check 2026-10-14 |
| contrib-styleguide | notes | Import confirmed: all 105 pages authored by the `wordpressdotorg` importer user (id 5911429) (prior research had it unverified). Separate... | Import confirmed: all 105 pages authored by the `wordpressdotorg` importer user (id 5911429) and all 105 render the GitHub template. Sepa... | Added template evidence |
| contrib-styleguide | last_activity_signal | Newest modified 2026-09-22 | Newest modified 2026-09-22; main last commit 2026-09-22 | live re-check 2026-10-14 |
| contrib-accessibility | source_of_truth | GitHub: https://github.com/WordPress/accessibility-team-handbook [likely, switched on about 2026-10-13] | GitHub: https://github.com/WordPress/accessibility-team-handbook | Import now shown by page markup, not timing: all 14 pages render the GitHub template |
| contrib-accessibility | import_mechanism | handbook plugin importer (WPorg_Handbook_Importer, wporg-markdown), manifest URL set in handbook settings (DB, not code), WP-Cron 15 minu... | handbook plugin importer (WPorg_Handbook_Importer, wporg-markdown), manifest URL set in handbook settings (DB, not code), WP-Cron 15 minu... | Template evidence replaces the [inferred] tag |
| contrib-accessibility | editing_path | Pull request with two Accessibility-team reviews (CONTRIBUTING) | Pull request with two Accessibility-team reviews (CONTRIBUTING); the README says changes happen in the GitHub repo | README read via gh api |
| contrib-accessibility | notes | 13 of 14 pages modified within 3 seconds at 2026-10-13 20:42, the signature of a bulk import run; authors are human (importer keeps autho... | All 14 pages render the GitHub template; 13 of 14 were modified within 3 seconds at 2026-10-13 20:42 (an import run), a week after the la... | Rewritten: evidence is now the template, timing is supporting |
| contrib-accessibility | last_activity_signal | Newest modified 2026-10-13 | Newest modified 2026-10-13; main last commit 2026-10-06 | live re-check 2026-10-14 |
| contrib-community | notes | Nine separate handbook post types: wordcamp-handbook 111, deputy-handbook 111, meetup-handbook 76, education-handbook 67, virtual-handboo... | Nine separate handbook post types: wordcamp-handbook 111, deputy-handbook 111, meetup-handbook 76, education-handbook 67, virtual-handboo... | Added repo status |
| contrib-core | notes | Core Contributor Handbook; coding standards moved out to wpcs-docs in 2018. | Core Contributor Handbook (make.wordpress.org/core/handbook/ is this handbook, not a separate surface); coding standards moved out to wpc... | Found redirect stubs counted in X-WP-Total |
| contrib-hosting | notes | Verified: landing page links to github.com/wordpress/hosting-handbook/edit/main/index.md. 12 of 20 pages authored by the `wordpressdotorg... | Verified: landing page links to github.com/wordpress/hosting-handbook/edit/main/index.md. 12 of 20 pages authored by the `wordpressdotorg... | Added template count |
| contrib-hosting | last_activity_signal | Newest modified 2026-10-13 | Newest modified 2026-10-13; main last commit 2026-10-13 | live re-check 2026-10-14 |
| contrib-plugins | source_of_truth | GitHub: https://github.com/WordPress/plugins-handbook [likely; inferred] | GitHub: https://github.com/WordPress/plugins-handbook | Import now shown by page markup, not timing: 11 of 12 pages render the GitHub template |
| contrib-plugins | import_mechanism | handbook plugin importer (WPorg_Handbook_Importer, wporg-markdown), manifest URL set in handbook settings (DB, not code), WP-Cron 15 minu... | handbook plugin importer (WPorg_Handbook_Importer, wporg-markdown), manifest URL set in handbook settings (DB, not code), WP-Cron 15 minutes | Template evidence replaces [inferred from timing] |
| contrib-plugins | editing_path | Pull request to WordPress/plugins-handbook [inferred] | Pull request to WordPress/plugins-handbook | Template evidence replaces [inferred] |
| contrib-plugins | notes | Inferred GitHub-synced: the 'the-team' page was modified 2026-05-23 15:00, two minutes after PR #22 merged (14:58). Authors are human, so... | 11 of 12 pages render the GitHub template, so they were imported; one page is wp-admin only. The 'the-team' page was modified 2026-05-23 ... | Rewritten with template evidence |
| contrib-plugins | last_activity_signal | Newest modified 2026-05-23 | Newest modified 2026-05-23; main last commit 2026-05-23 | live re-check 2026-10-14 |
| contrib-sustainability | notes | All 17 pages authored by the `wordpressdotorg` importer user (id 5911429). Not in prior research's list of GitHub-backed handbooks. | All 17 pages authored by the `wordpressdotorg` importer user (id 5911429) and all render the GitHub template. Not in prior research's lis... | Added template evidence |
| contrib-sustainability | last_activity_signal | Newest modified 2025-12-28 | Newest modified 2025-12-28; trunk last commit 2025-12-28 | live re-check 2026-10-14 |
| contrib-test | notes | All 36 pages authored by the `wordpressdotorg` importer user (id 5911429). No GitHub edit link rendered. Moved 2025-09. | All 36 pages authored by the `wordpressdotorg` importer user (id 5911429) and all render the GitHub template; the edit link goes through ... | Corrected "No GitHub edit link rendered" |
| contrib-test | last_activity_signal | Newest modified 2026-10-02 | Newest modified 2026-10-02; trunk last commit 2026-10-02 | live re-check 2026-10-14 |
| contrib-cli | maintainers_if_public | null | CODEOWNERS in wp-cli/handbook: @wp-cli/committers | Public CODEOWNERS |
| contrib-cli | notes | User and developer documentation, not contributor process, despite living on a Make site. 104 of 152 pages authored by importer users. Gi... | User and developer documentation, not contributor process, despite living on a Make site. 104 of 152 pages authored by importer users (au... | Added template count |
| contrib-cli | last_activity_signal | Newest modified 2026-10-14 | Newest modified 2026-10-14; main last commit 2026-10-11 | live re-check 2026-10-14 |
| rosetta-team-handbooks | markdown_output | null | yes | ?output_format=md returns text/markdown on ja.wordpress.org/team/handbook/ (2026-10-14) |
| rosetta-team-handbooks | last_activity_signal | es newest modified 2026-07-05 | ja newest modified 2026-09-14; es newest modified 2026-07-05; WordPress/spain-handbook last commit 2025-01-14 | live re-check 2026-10-14 |
| learn-online-workshops | notes | Event records rather than documentation; landing URL not verified. | Event records rather than documentation. Landing URL verified 200 (2026-10-14). | Landing URL now checked |
| release-dev-notes | last_activity_signal | null | Latest dev-notes post 2026-10-09 | live re-check 2026-10-14 |
| release-field-guides | last_activity_signal | null | Latest 2026-08-05 (WordPress 7.1 Field Guide) | live re-check 2026-10-14 |
| release-download-releases | last_activity_signal | 7-1 page modified 2026-08-20 | Newest modified 2026-09-01 (6-3 page); 7-1 page 2026-08-20; releases index 2026-03-31 | live re-check 2026-10-14 |
| release-news-posts | last_activity_signal | null | Latest Releases post 2026-10-06 (WordPress 7.1.3) | live re-check 2026-10-14 |
| helphub-version-pages | last_activity_signal | null | Newest modified 2026-10-09 (version-6-5-13) | live re-check 2026-10-14 |
| release-dev-notes | related_rows | ["release-field-guides", "devhub-developer-blog"] | ["release-field-guides", "devhub-developer-blog", "release-core-version-pages"] | Link to new row |
| release-field-guides | related_rows | ["release-dev-notes"] | ["release-dev-notes", "release-core-version-pages"] | Link to new row |
| policy-pattern-directory | status | active | stale | Newest documentation page modified 2024-04-17; repo commits are directory code, not these pages |
| policy-pattern-directory | last_activity_signal | Repo pushed 2026-10-12 | Newest page modified 2024-04-17 (/patterns/about/); trunk last commit 2026-10-12 (directory code) | live re-check 2026-10-14 |
| policy-pattern-directory | notes | null | Of the 5 pages, 2 are documentation (/patterns/about/, /patterns/pattern-directory/); favorites, my-patterns and new-pattern are app scre... | Clarified what the count covers |
| policy-photo-directory | status | active | stale | Guidelines, FAQ and license pages last modified 2024-12-09/10, outside the 12-month window |
| policy-photo-directory | last_activity_signal | null | Guidelines and FAQ modified 2024-12-10; trunk last commit 2026-10-06 (directory code) | live re-check 2026-10-14 |
| policy-photo-directory | notes | null | Of the 8 pages, guidelines, FAQ and license are documentation; the rest are browse and submit screens. | Clarified what the count covers |
| policy-plugins-developers | page_count | null | {"value": 5, "method": "REST X-WP-Total /plugins/wp-json/wp/v2/pages", "date": "2026-10-14"} | Old row had no count |
| policy-plugins-developers | last_activity_signal | null | Newest page modified 2026-03-11 (/plugins/developers/releases/) | live re-check 2026-10-14 |
| policy-forum-guidelines | page_count | null | {"value": 9, "method": "REST X-WP-Total /support/wp-json/wp/v2/pages", "date": "2026-10-14"} | Old row had no count |
| policy-forum-guidelines | rest_api | null | wordpress.org/support/wp-json/wp/v2/pages | Route answers 200 JSON |
| policy-forum-guidelines | last_activity_signal | Forum User Guide modified 2024-06-29; guidelines repo pushed 2023-08-09 | Guidelines modified 2026-04-25; Forum User Guide 2024-06-29; guidelines repo last commit 2023-08-09 | live re-check 2026-10-14 |
| policy-theme-getting-started | status | active | stale | Getting Started page modified 2020-10-02; newest directory page 2024-04-30 |
| policy-theme-getting-started | page_count | null | {"value": 5, "method": "REST X-WP-Total /themes/wp-json/wp/v2/pages", "date": "2026-10-14"} | Old row had no count |
| policy-theme-getting-started | rest_api | null | wordpress.org/themes/wp-json/wp/v2/pages | Route answers 200 JSON |
| policy-theme-getting-started | markdown_output | null | yes | ?output_format=md returns text/markdown (2026-10-14) |
| policy-theme-getting-started | last_activity_signal | Repo pushed 2026-09-04 | Getting Started page modified 2020-10-02; newest directory page 2024-04-30; theme repo trunk last commit 2026-09-04 | live re-check 2026-10-14 |
| policy-translate-glossaries | rest_api | GlotPress API [not probed] | translate.wordpress.org/api/projects/ (GlotPress API, 200 JSON); glossaries export as CSV at /locale/{locale}/default/glossary/-export/ | Probed: projects API 200 JSON, glossary export 200 |
| policy-plugin-guidelines | related_rows | ["devhub-plugins", "machine-wporg-mcp", "contrib-plugins"] | ["devhub-plugins", "machine-wporg-mcp", "contrib-plugins", "policy-foundation-trademark"] | Link to new row |
| project-about | notes | Five pages: /about/, /features/ (2023-07-11), /domains/, /logos/, /etiquette/. /about/swag/ 301s to mercantile.wordpress.org. | Five pages: /about/, /about/features/ (2023-07-11), /about/domains/, /about/logos/, /about/etiquette/. /about/swag/ 301s to mercantile.wo... | Paths are under /about/ |
| project-book | source_of_truth | GitHub: https://github.com/WordPress/library (formerly WordPress/book) | WordPress database on the wordpress.org/book site; content mirrored as Markdown in WordPress/library (import not confirmed) | Downgraded: the library repo records edits made directly on the site (2026-10-07) and its manifest for an importer was only added 2026-10-07 |
| project-book | import_mechanism | Unverified (repo also has wporg-book theme repo) | Not confirmed: all 74 items are authored by the wordpressdotorg account (id 5911429); WordPress/library added a manifest.json mapping cha... | Traced repo history |
| project-book | editing_path | Pull request ('This book was written entirely on GitHub') | Pull request to WordPress/library; edits have also been made directly on the site and copied back to the repo | Library commit 2026-10-07 "Bring over small edits made directly on wordpress.org/book" |
| project-book | page_count | null | {"value": 74, "method": "REST X-WP-Total /book/wp-json/wp/v2/pages (7) + posts (67)", "date": "2026-10-14"} | Old row had no count |
| project-book | rest_api | null | wordpress.org/book/wp-json/wp/v2/posts | Route answers 200 JSON |
| project-book | last_activity_signal | WordPress/library pushed 2026-10-13 | WordPress/library trunk last commit 2026-10-13; newest post modified 2026-10-07 | live re-check 2026-10-14 |
| project-book | notes | WordPress/book redirects to WordPress/library ('Volume 1, first ten years'); wp20-book is version 2. | WordPress/book redirects to WordPress/library ('Volume 1, first ten years'); wp20-book is version 2. The book posts are not the import-us... | Added caveat |
| project-playground-landing | markdown_output | null | yes | ?output_format=md returns text/markdown (2026-10-14) |
| project-playground-landing | last_activity_signal | null | wordpress-playground trunk last commit 2026-10-13; wporg-wasm main last commit 2026-07-27 | live re-check 2026-10-14 |
| project-showcase | markdown_output | no | partial | Home returns text/markdown (2026-10-14); the submit page returns HTML. The old 403 no longer happens |
| project-showcase | notes | ?output_format=md returned 403 on 2026-10-14, the only WordPress.org page probed that refused Markdown. | ?output_format=md returns text/markdown on the showcase home but HTML on /showcase/submit-a-wordpress-site/ (2026-10-14); it returned 403... | Updated Markdown finding; added guidelines page |
| project-showcase | last_activity_signal | null | Newest post 2026-10-10 | live re-check 2026-10-14 |
| project-news | last_activity_signal | null | Latest post 2026-10-06 | live re-check 2026-10-14 |
| project-gutenberg | last_activity_signal | Repo pushed 2026-09-28 | Pages modified 2024-11-13; WordPress/wporg-gutenberg trunk last commit 2026-09-28 | live re-check 2026-10-14 |
| project-wordcamp-central | last_activity_signal | Repo pushed 2026-10-14 | WordPress/wordcamp.org production last commit 2026-10-13 | live re-check 2026-10-14 |
| legacy-core-trac-wiki | notes | 403 to automated fetches (2026-10-14). Search found only default Trac pages (SandBox, InterWiki); contributor docs live in the make/core ... | 403 to automated fetches, a JavaScript "Checking your browser" challenge (2026-10-14). Search found only default Trac pages (SandBox, Int... | Named the cause of the 403 |
| legacy-helphub-repo | last_activity_signal | Archived | Archived; last commit 2026-10-02, after the retirement README of 2026-09-29 | live re-check 2026-10-14 |
| legacy-learn-lesson-plan-import | url | https://wptrainingteam.github.io/ | https://github.com/wptrainingteam/wptrainingteam.github.io | wptrainingteam.github.io returns 404 (GitHub Pages "Site not found"); the repo still exists |
| legacy-learn-lesson-plan-import | repo_links | ["https://github.com/WordPress/Learn"] | ["https://github.com/wptrainingteam/wptrainingteam.github.io", "https://github.com/WordPress/Learn"] | Added the source repo |
| legacy-learn-lesson-plan-import | notes | The only non-handbook use of the manifest importer; abandoned for wp-admin editing. | The only non-handbook use of the manifest importer; abandoned for wp-admin editing. The GitHub Pages site wptrainingteam.github.io return... | Recorded the 404 |
| legacy-learn-lesson-plan-import | last_activity_signal | null | Repo last push 2020-11-30 | live re-check 2026-10-14 |
| legacy-playground-docusaurus | translation | Translations served here (es, fr, ja verified 200; pt-BR path 404 on 2026-10-14) | Translations served here: es, fr, ja, pt-br (lowercase path), bn, gu, tl return 200; hi, it, lg return 404 although i18n/ lists them; pt-... | Re-probed all locale paths; pt-BR works lowercase |
| legacy-playground-docusaurus | last_activity_signal | null | wordpress-playground trunk last commit 2026-10-13 | live re-check 2026-10-14 |
| legacy-developer-plugins-handbook-mirror | last_activity_signal | Pushed 2026-10-14 | Pushed 2026-10-14; main last commit 2026-10-14 | live re-check 2026-10-14 |
| legacy-documentation-end-user | last_activity_signal | Last push 2024-02-16 | Last push 2024-02-16; trunk last commit 2024-02-16 | live re-check 2026-10-14 |
| machine-llms-txt | notes | Links 8 doc surfaces (DevHub, HelpHub, Block Editor, Themes, Plugins, WP-CLI, Coding Standards, REST API). 404 on developer., learn., mak... | Links 8 doc surfaces (DevHub, HelpHub, Block Editor, Themes, Plugins, WP-CLI, Coding Standards, REST API). 404 on developer., learn., mak... | Added content-type finding |
| machine-markdown-output | maintainers_if_public | Dion Hulse announced; Dennis Snell's html-to-md | null | Names came from the announcement post and repo ownership, not a team page, README or CODEOWNERS; moved to notes |
| machine-markdown-output | notes | Verified text/markdown on 2026-10-14 for HelpHub, DevHub, Code Reference, CLI, Developer Blog, Learn, Make handbooks and P2s, News, main-... | Verified text/markdown on 2026-10-14 for HelpHub, DevHub, Code Reference, CLI, Developer Blog, Learn, Make handbooks and P2s, News, main-... | Showcase now works; people moved from maintainers |
| machine-wporg-mcp | rest_api | wordpress.org/wp-json/mcp/wporg; wp-abilities/v1 namespace on wordpress.org, DevHub and Learn (listing requires auth) | null | wordpress.org/wp-json/mcp/wporg and wp-abilities/v1 answer 401 JSON without authentication, not 200 |
| machine-wporg-mcp | notes | No documentation domain yet. Resources draw on developer.wordpress.org content. | No documentation domain yet. Resources draw on developer.wordpress.org content. The endpoint wordpress.org/wp-json/mcp/wporg and the wp-a... | Recorded 401 |
| machine-wporg-mcp | last_activity_signal | Meta changeset 14703 (2026-03-12) added plugin directory resources and prompts | Meta changeset 14703 (2026-03-12) added plugin directory resources and prompts; WordPress/wordpress.org mirror last commit 2026-10-14 | live re-check 2026-10-14 |
| upstream-wp-api-docs | status | active | stale | Last commit 2025-06-04, outside the 12-month window (matches devhub-rest-api) |
| upstream-wp-api-docs | last_activity_signal | Last push 2025-06-04 | Last push 2025-06-04; master last commit 2025-06-04 | live re-check 2026-10-14 |
| repo-meta-svn | last_activity_signal | Mirror pushed 2026-10-13 | Mirror pushed 2026-10-14; trunk last commit 2026-10-14 | gh api default-branch commit 2026-10-14 |
| upstream-advanced-administration | last_activity_signal | Pushed 2026-09-29 | Pushed 2026-09-29; main last commit 2026-09-29 | gh api default-branch commit 2026-10-14 |
| repo-documentation-issue-tracker | last_activity_signal | Pushed 2026-07-22 | Pushed 2026-07-22; main last commit 2026-07-22; 469 open issues (2026-10-14) | gh api default-branch commit 2026-10-14 |
| upstream-gutenberg-docs | last_activity_signal | null | trunk last commit 2026-10-14 | gh api default-branch commit 2026-10-14 |
| repo-wporg-learn | last_activity_signal | Pushed 2026-10-12 | Pushed 2026-10-12; trunk last commit 2026-10-12 | gh api default-branch commit 2026-10-14 |
| upstream-phpdoc-parser | last_activity_signal | Pushed 2026-10-13 | Pushed 2026-10-13; master last commit 2026-09-24 | gh api default-branch commit 2026-10-14 |
| upstream-scf | last_activity_signal | null | trunk last commit 2026-08-26 (pushed 2026-09-29) | gh api default-branch commit 2026-10-14 |
| upstream-wordpress-develop | last_activity_signal | null | trunk last commit 2026-10-14 | gh api default-branch commit 2026-10-14 |
| upstream-playground-docs | last_activity_signal | Pushed 2026-10-14 | Pushed 2026-10-14; trunk last commit 2026-10-13 | gh api default-branch commit 2026-10-14 |
| upstream-wpcs-docs | last_activity_signal | Pushed 2026-05-19 | Pushed 2026-05-19; master last commit 2026-05-05 | gh api default-branch commit 2026-10-14 |
| repo-wporg-developer | last_activity_signal | Pushed 2026-10-12 | Pushed 2026-10-12; trunk last commit 2026-10-12 | gh api default-branch commit 2026-10-14 |
| repo-wporg-documentation-2022 | last_activity_signal | Pushed 2026-09-09 | Pushed 2026-09-09; trunk last commit 2026-09-09 | gh api default-branch commit 2026-10-14 |
| repo-wporg-mu-plugins | last_activity_signal | Pushed 2026-10-12 | Pushed 2026-10-12; trunk last commit 2026-10-12 | gh api default-branch commit 2026-10-14 |
| upstream-wp-cli-handbook | last_activity_signal | null | main last commit 2026-10-11 | gh api default-branch commit 2026-10-14 |
| repo-documentation-issue-tracker | notes | 469 open issues (2026-10-11). fr_FR locale tracker created 2026-09-10. | 469 open issues (2026-10-14). fr_FR locale tracker created 2026-09-10 (issues only; its git repository is empty). | Re-counted; noted empty fr_FR repo |
| upstream-gutenberg-docs | related_rows | ["devhub-block-editor"] | ["devhub-block-editor", "code-reference-gutenberg-storybook"] | Link to new row |
| project-wp-cli-landing | related_rows | [] | ["legacy-wp-cli-org-redirect", "devhub-cli-commands"] | Link to new row |
| project-wp-cli-landing | notes | New in 2026; wp-cli.org now 301s here. | New in 2026; wp-cli.org now 301s here (see legacy-wp-cli-org-redirect). | Link to new row |
| release-download-releases | related_rows | ["helphub-version-pages", "project-roadmap"] | ["helphub-version-pages", "project-roadmap", "project-download"] | Link to new row |
| devhub-openverse-docs | evidence | gh api repos/WordPress/openverse/contents/documentation | gh api repos/WordPress/openverse/contents/documentation (re-run as git tree 2026-10-14) | Every evidence entry needs a date or file path |
| project-book | evidence | gh api repos/WordPress/library | gh api repos/WordPress/library 2026-10-14 | Every evidence entry needs a date or file path |
| legacy-locale-codices | evidence | https://meta.trac.wordpress.org/ticket/4487 | https://meta.trac.wordpress.org/ticket/4487 (not re-verifiable: Trac returns 403 to curl and WebFetch, 2026-10-14) | Every evidence entry needs a date or file path |
| legacy-codex | evidence | https://meta.trac.wordpress.org/ticket/4487 | https://meta.trac.wordpress.org/ticket/4487 (not re-verifiable: Trac returns 403 to curl and WebFetch, 2026-10-14) | Every evidence entry needs a date or file path |
| legacy-codex | evidence | https://meta.trac.wordpress.org/ticket/2575 | https://meta.trac.wordpress.org/ticket/2575 (not re-verifiable: Trac returns 403 to curl and WebFetch, 2026-10-14) | Every evidence entry needs a date or file path |
| machine-wporg-mcp | evidence | https://meta.trac.wordpress.org/changeset/14703 | https://meta.trac.wordpress.org/changeset/14703 (confirmed by the WordPress/wordpress.org mirror commit of 2026-03-12, checked 2026-10-14) | Every evidence entry needs a date or file path |

## Rows added (7)

- `code-reference-gutenberg-storybook`: wordpress.github.io/gutenberg: 279 docs entries and 925 stories for the Gutenberg packages, built from the gutenberg repo to GitHub Pages.
- `contrib-make-site-pages`: 341 `page` posts on 25 Make sites outside the handbook post types, including 151 on make/docs (old Plugin and Theme handbook drafts) and a legacy user manual on make/support.
- `contrib-make-contribute`: make.wordpress.org/contribute/ and /contribute/join/, the contributor onboarding entry point linked from llms.txt.
- `release-core-version-pages`: 48 per-release pages on make/core (/core/7-2/ back to 3.0 schedules): squad, dates and links to dev notes and field guides.
- `project-download`: /download/, /download/beta-nightly/, /download/source/ on the main site: install, testing and source-access instructions.
- `policy-foundation-trademark`: wordpressfoundation.org/trademark-policy/, linked from the Plugin Directory guidelines. Off WordPress.org, included because directory policy depends on it.
- `legacy-wp-cli-org-redirect`: wp-cli.org, which 301s every path to wordpress.org/cli/, so old deep links lose their target.

Checked and **not added**: wordpress.org/documentation/wordpress-version/ (301 to the version-pages article, already `helphub-version-pages`); learn lesson plans and lessons (both present); make.wordpress.org/core/handbook/ (is `contrib-core`); block-editor/reference-guides (inside `devhub-block-editor`); plugin and theme directory FAQ (wordpress.org/plugins/faq/ and /themes/faq/ resolve to search or a plugin listing, no FAQ exists; readme docs are `policy-readme-standard`); per-plugin readme pages (not WordPress.org documentation); Privacy, Security, Requirements, Enterprise, Showcase (present; showcase submit guidelines noted in `project-showcase`); developer.wordpress.org/cli/ (301 to /cli/commands/cli/, noted in `devhub-cli-commands`); pattern directory docs and Photo Directory guidelines (present); docs.openverse.org, Playground Docusaurus, Field Guide index, translate glossaries (present); Core Trac handbook pages (Trac wiki row present; Trac process docs live in the core handbook); WordCamp organizer and speaker docs (inside `contrib-community`, including speaker selection); other wordpressfoundation.org pages (financials, scholarships, donations: not documentation); five-for-the-future, /remembers/, /state-of-the-word/, /40-percent-of-web/ (not documentation).

## Could not be re-verified

| Row id | Claim | What was tried |
|---|---|---|
| legacy-codex, legacy-locale-codices | Codex content, read-only state, Meta tickets #4487 and #2575 | curl with plain and full browser user agents, WebFetch: all 403 with a JavaScript "Checking your browser" challenge. Old values kept; evidence entries marked "not re-verifiable". |
| legacy-core-trac-wiki, legacy-meta-trac-wiki | Wiki contents and last edits | Same 403 challenge on core.trac and meta.trac. |
| machine-wporg-mcp | Production abilities list | /wp-json/mcp/wporg and wp-abilities/v1 answer 401 without auth. Changeset 14703 confirmed through the GitHub mirror instead. |
| contrib-accessibility, contrib-plugins | Which repo the importer reads | Import is proven by the template; the manifest URL lives in handbook settings and the edit link is login-gated for anonymous visitors. Repo identified by name and history. |
| contrib-styleguide, contrib-sustainability, contrib-test, contrib-contributor-handbook | Same: repo URL not visible to logged-out visitors | Authorship and template prove import; repo identity from name. |
| project-book | Whether an importer reads WordPress/library/manifest.json | No public import config; downgraded. |
| learn-* | Items per Learn locale | Not counted (unchanged from the previous pass). |
| support-forums | Topic and reply counts | Not measured; bbPress counts are not in REST. |
| helphub-version-pages, release-download-releases, project-* | Whether Rosetta sites translate page content | Not checked. |
| legacy-documentation-end-user | File count (37) | Kept from prior research (2026-10-11); value stays null by design. |
| policy-readme-standard | Count of 3 | Counted by hand, no method to re-run; the three URLs return 200. |

## Live status of every URL (2026-10-14)

First hop, then the final status after redirects. 403 on codex and Trac hosts is a browser challenge to automated clients, not a removed page; 401 on the MCP endpoint is an auth requirement.

| id | field | url | status |
|---|---|---|---|
| data-liberation-guides | url | https://wordpress.org/data-liberation/guides/ | 200 |
| data-liberation-guides | example | https://wordpress.org/data-liberation/ | 200 |
| helphub-feedback | url | https://wordpress.org/documentation/ | 200 |
| helphub-articles | url | https://wordpress.org/documentation/ | 200 |
| helphub-articles | example | https://wordpress.org/documentation/article/site-editor-navigation/ | 200 |
| helphub-landing-pages | url | https://wordpress.org/documentation/ | 200 |
| helphub-landing-pages | example | https://wordpress.org/documentation/support-guides/ | 200 |
| helphub-media | url | https://wordpress.org/documentation/wp-json/wp/v2/media | 200 |
| helphub-media | example | https://wordpress.org/documentation/files/2026/10/distraction-free-location-edited.png | 200 |
| rosetta-helphub | url | https://fr.wordpress.org/support/ | 200 |
| rosetta-helphub | example | https://ja.wordpress.org/support/ | 200 |
| support-forums | url | https://wordpress.org/support/forums/ | 200 |
| support-forums | example | https://wordpress.org/support/forum/how-to-and-troubleshooting/ | 200 |
| devhub-advanced-administration | url | https://developer.wordpress.org/advanced-administration/ | 200 |
| devhub-advanced-administration | example | https://developer.wordpress.org/advanced-administration/server/web-server/ | 200 |
| devhub-block-editor | url | https://developer.wordpress.org/block-editor/ | 200 |
| devhub-block-editor | example | https://developer.wordpress.org/block-editor/getting-started/fundamentals/block-json/ | 200 |
| devhub-coding-standards | url | https://developer.wordpress.org/coding-standards/ | 200 |
| devhub-coding-standards | example | https://developer.wordpress.org/coding-standards/wordpress-coding-standards/php/ | 200 |
| devhub-apis | url | https://developer.wordpress.org/apis/ | 200 |
| devhub-apis | example | https://developer.wordpress.org/apis/hooks/ | 200 |
| devhub-dashicons | url | https://developer.wordpress.org/resource/dashicons/ | 200 |
| devhub-home | url | https://developer.wordpress.org/ | 200 |
| devhub-home | example | https://developer.wordpress.org/reference/ | 200 |
| devhub-openverse-docs | url | https://docs.openverse.org/ | 200 |
| devhub-playground | url | https://developer.wordpress.org/playground/ | 200 |
| devhub-plugins | url | https://developer.wordpress.org/plugins/ | 200 |
| devhub-plugins | example | https://developer.wordpress.org/plugins/plugin-basics/ | 200 |
| devhub-rest-api | url | https://developer.wordpress.org/rest-api/ | 200 |
| devhub-rest-api | example | https://developer.wordpress.org/rest-api/reference/posts/ | 200 |
| devhub-scf | url | https://developer.wordpress.org/secure-custom-fields/ | 200 |
| devhub-themes | url | https://developer.wordpress.org/themes/ | 200 |
| devhub-themes | example | https://developer.wordpress.org/themes/getting-started/ | 200 |
| devhub-developer-blog | url | https://developer.wordpress.org/news/ | 200 |
| devhub-developer-blog | example | https://developer.wordpress.org/news/2026/09/whats-new-for-developers-september-2026/ | 200 |
| devhub-cli-commands | url | https://developer.wordpress.org/cli/commands/ | 200 |
| devhub-cli-commands | example | https://developer.wordpress.org/cli/commands/cache/ | 200 |
| code-reference-classes | url | https://developer.wordpress.org/reference/classes/ | 200 |
| code-reference-classes | example | https://developer.wordpress.org/reference/classes/wp_query/ | 200 |
| code-reference-explanations | url | https://developer.wordpress.org/reference/ | 200 |
| code-reference-functions | url | https://developer.wordpress.org/reference/functions/ | 200 |
| code-reference-functions | example | https://developer.wordpress.org/reference/functions/get_post/ | 200 |
| code-reference-hooks | url | https://developer.wordpress.org/reference/hooks/ | 200 |
| code-reference-hooks | example | https://developer.wordpress.org/reference/hooks/init/ | 200 |
| code-reference-methods | url | https://developer.wordpress.org/reference/classes/ | 200 |
| code-reference-methods | example | https://developer.wordpress.org/reference/classes/wp_query/get_posts/ | 200 |
| code-reference-archives | url | https://developer.wordpress.org/reference/since/7.1.0/ | 200 |
| code-reference-archives | example | https://developer.wordpress.org/reference/files/wp-includes/post.php/ | 200 |
| code-reference-user-notes | url | https://developer.wordpress.org/reference/ | 200 |
| code-reference-user-notes | example | https://developer.wordpress.org/reference/functions/get_post/#user-contributed-notes | 200 |
| code-reference-gutenberg-storybook | url | https://wordpress.github.io/gutenberg/ | 200 |
| code-reference-gutenberg-storybook | example | https://wordpress.github.io/gutenberg/?path=/docs/components-button--docs | 200 |
| contrib-contributor-handbook | url | https://make.wordpress.org/handbook/ | 200 |
| contrib-styleguide | url | https://make.wordpress.org/docs/style-guide/ | 200 |
| contrib-styleguide | example | https://make.wordpress.org/docs/style-guide/word-list/o/ | 200 |
| contrib-accessibility | url | https://make.wordpress.org/accessibility/handbook/ | 200 |
| contrib-ai | url | https://make.wordpress.org/ai/handbook/ | 200 |
| contrib-community | url | https://make.wordpress.org/community/handbook/ | 200 |
| contrib-community | example | https://make.wordpress.org/community/handbook/wordcamp-organizer/ | 200 |
| contrib-core | url | https://make.wordpress.org/core/handbook/ | 200 |
| contrib-design | url | https://make.wordpress.org/design/handbook/ | 200 |
| contrib-docs | url | https://make.wordpress.org/docs/handbook/ | 200 |
| contrib-hosting | url | https://make.wordpress.org/hosting/handbook/ | 200 |
| contrib-marketing | url | https://make.wordpress.org/marketing/handbook/ | 200 |
| contrib-media-corps | url | https://make.wordpress.org/media-corps/handbook/ | 200 |
| contrib-meta | url | https://make.wordpress.org/meta/handbook/ | 200 |
| contrib-mobile | url | https://make.wordpress.org/mobile/handbook/ | 200 |
| contrib-openverse | url | https://make.wordpress.org/openverse/handbook/ | 200 |
| contrib-performance | url | https://make.wordpress.org/performance/handbook/ | 200 |
| contrib-photos | url | https://make.wordpress.org/photos/handbook/ | 200 |
| contrib-plugins | url | https://make.wordpress.org/plugins/handbook/ | 200 |
| contrib-polyglots | url | https://make.wordpress.org/polyglots/handbook/ | 200 |
| contrib-program | url | https://make.wordpress.org/program/handbook/ | 200 |
| contrib-empty-stubs | url | https://make.wordpress.org/project/ | 200 |
| contrib-support | url | https://make.wordpress.org/support/handbook/ | 200 |
| contrib-sustainability | url | https://make.wordpress.org/sustainability/handbook/ | 200 |
| contrib-make-site-pages | url | https://make.wordpress.org/support/user-manual/ | 200 |
| contrib-make-site-pages | example | https://make.wordpress.org/core/components/ | 200 |
| contrib-test | url | https://make.wordpress.org/test/handbook/ | 200 |
| contrib-themes | url | https://make.wordpress.org/themes/handbook/ | 200 |
| contrib-training | url | https://make.wordpress.org/training/handbook/ | 200 |
| contrib-make-contribute | url | https://make.wordpress.org/contribute/ | 200 |
| contrib-make-contribute | example | https://make.wordpress.org/contribute/join/ | 200 |
| contrib-tv | url | https://make.wordpress.org/tv/handbook/ | 200 |
| rosetta-team-handbooks | url | https://ja.wordpress.org/team/handbook/ | 200 |
| rosetta-team-handbooks | example | https://es.wordpress.org/team/handbook/ | 200 |
| contrib-cli | url | https://make.wordpress.org/cli/handbook/ | 200 |
| learn-activity-kits | url | https://learn.wordpress.org/activity-library/ | 200 |
| learn-activity-kits | example | https://learn.wordpress.org/activity-library/contributor-onboarding/ | 200 |
| learn-courses | url | https://learn.wordpress.org/courses/ | 200 |
| learn-courses | example | https://learn.wordpress.org/course/wordpress-credits-intro-to-contribution/ | 200 |
| learn-lesson-plans | url | https://learn.wordpress.org/lesson-plans/ | 200 |
| learn-lesson-plans | example | https://learn.wordpress.org/lesson-plan/choosing-and-installing-plugins/ | 200 |
| learn-lessons | url | https://learn.wordpress.org/courses/ | 200 |
| learn-lessons | example | https://learn.wordpress.org/lesson/pre-planning-budgeting-and-event-support/ | 200 |
| learn-online-workshops | url | https://learn.wordpress.org/online-workshops/ | 200 |
| learn-tutorials | url | https://learn.wordpress.org/tutorials/ | 200 |
| learn-tutorials | example | https://learn.wordpress.org/tutorial/a-beginners-guide-to-the-wordpress-template-hierarchy/ | 200 |
| wordpress-tv | url | https://wordpress.tv/ | 200 |
| release-gutenberg-whats-new | url | https://make.wordpress.org/core/tag/gutenberg-new/ | 200 |
| release-gutenberg-whats-new | example | https://make.wordpress.org/core/2026/09/30/whats-new-in-gutenberg-24-1-30-september/ | 200 |
| release-dev-notes | url | https://make.wordpress.org/core/tag/dev-notes/ | 200 |
| release-dev-notes | example | https://make.wordpress.org/core/tag/dev-notes-7-1/ | 200 |
| release-field-guides | url | https://make.wordpress.org/core/tag/field-guide/ | 200 |
| release-core-version-pages | url | https://make.wordpress.org/core/7-2/ | 200 |
| release-core-version-pages | example | https://make.wordpress.org/core/7-1/ | 200 |
| release-download-releases | url | https://wordpress.org/download/releases/ | 200 |
| release-download-releases | example | https://wordpress.org/download/releases/7-1/ | 200 |
| release-news-posts | url | https://wordpress.org/news/category/releases/ | 200 |
| helphub-version-pages | url | https://wordpress.org/documentation/article/wordpress-versions/ | 200 |
| helphub-version-pages | example | https://wordpress.org/documentation/wordpress-version/version-6-8/ | 200 |
| policy-pattern-directory | url | https://wordpress.org/patterns/about/ | 200 |
| policy-photo-directory | url | https://wordpress.org/photos/guidelines/ | 200 |
| policy-photo-directory | example | https://wordpress.org/photos/faq/ | 200 |
| policy-plugins-developers | url | https://wordpress.org/plugins/developers/ | 200 |
| policy-plugins-developers | example | https://wordpress.org/plugins/developers/add/ | 200 |
| policy-plugin-guidelines | url | https://developer.wordpress.org/plugins/wordpress-org/detailed-plugin-guidelines/ | 200 |
| policy-plugin-guidelines | example | https://developer.wordpress.org/plugins/wordpress-org/ | 200 |
| policy-readme-standard | url | https://developer.wordpress.org/plugins/wordpress-org/how-your-readme-txt-works/ | 200 |
| policy-readme-standard | example | https://wordpress.org/plugins/readme.txt | 200 |
| policy-forum-guidelines | url | https://wordpress.org/support/guidelines/ | 200 |
| policy-forum-guidelines | example | https://wordpress.org/support/forum-user-guide/ | 200 |
| policy-theme-getting-started | url | https://wordpress.org/themes/getting-started/ | 200 |
| policy-theme-getting-started | example | https://wordpress.org/themes/commercial/ | 200 |
| policy-theme-review-guidelines | url | https://make.wordpress.org/themes/handbook/review/required/ | 200 |
| policy-theme-review-guidelines | example | https://make.wordpress.org/themes/handbook/review/resources/ | 200 |
| policy-translate-glossaries | url | https://translate.wordpress.org/ | 200 |
| policy-translate-glossaries | example | https://translate.wordpress.org/locale/fr/default/glossary/ | 200 |
| policy-foundation-trademark | url | https://wordpressfoundation.org/trademark-policy/ | 200 |
| project-about | url | https://wordpress.org/about/ | 200 |
| project-accessibility | url | https://wordpress.org/about/accessibility/ | 200 |
| project-blocks | url | https://wordpress.org/blocks/ | 200 |
| project-download | url | https://wordpress.org/download/ | 200 |
| project-download | example | https://wordpress.org/download/beta-nightly/ | 200 |
| project-education | url | https://wordpress.org/education/ | 200 |
| project-enterprise | url | https://wordpress.org/enterprise/ | 200 |
| project-gutenberg | url | https://wordpress.org/gutenberg/ | 200 |
| project-history | url | https://wordpress.org/about/history/ | 200 |
| project-hosting | url | https://wordpress.org/hosting/ | 200 |
| project-license | url | https://wordpress.org/about/license/ | 200 |
| project-book | url | https://wordpress.org/book/ | 200 |
| project-book | example | https://wordpress.org/book/table-of-contents/ | 200 |
| project-mobile | url | https://wordpress.org/mobile/ | 200 |
| project-philosophy | url | https://wordpress.org/about/philosophy/ | 200 |
| project-playground-landing | url | https://wordpress.org/playground/ | 200 |
| project-playground-landing | example | https://playground.wordpress.net/ | 200 |
| project-privacy | url | https://wordpress.org/about/privacy/ | 200 |
| project-requirements | url | https://wordpress.org/about/requirements/ | 200 |
| project-roadmap | url | https://wordpress.org/about/roadmap/ | 200 |
| project-security | url | https://wordpress.org/about/security/ | 200 |
| project-showcase | url | https://wordpress.org/showcase/ | 200 |
| project-stats | url | https://wordpress.org/about/stats/ | 200 |
| project-wordcamp-central | url | https://central.wordcamp.org/ | 200 |
| project-news | url | https://wordpress.org/news/ | 200 |
| project-wp-cli-landing | url | https://wordpress.org/cli/ | 200 |
| legacy-core-trac-wiki | url | https://core.trac.wordpress.org/wiki | 403 → 403 |
| legacy-core-trac-wiki | example | https://core.trac.wordpress.org/wiki/SandBox | 403 → 403 |
| legacy-developer-plugins-handbook-mirror | url | https://github.com/WordPress/developer-plugins-handbook | 200 |
| legacy-documentation-end-user | url | https://github.com/WordPress/documentation-end-user | 200 |
| legacy-helphub-repo | url | https://github.com/WordPress/HelpHub | 200 |
| legacy-learn-lesson-plan-import | url | https://github.com/wptrainingteam/wptrainingteam.github.io | 200 |
| legacy-locale-codices | url | https://codex.wordpress.org/ | 403 → 403 |
| legacy-meta-trac-wiki | url | https://meta.trac.wordpress.org/wiki | 403 → 403 |
| legacy-playground-docusaurus | url | https://wordpress.github.io/wordpress-playground/ | 200 |
| legacy-playground-docusaurus | example | https://wordpress.github.io/wordpress-playground/ja/ | 200 |
| legacy-codex | url | https://codex.wordpress.org/ | 403 → 403 |
| legacy-codex | example | https://codex.wordpress.org/Main_Page | 403 → 403 |
| legacy-wordpress-org-docs-redirect | url | https://wordpress.org/docs/ | 302 https://codex.wordpress.org/ → 403 |
| legacy-wp-cli-org-redirect | url | https://wp-cli.org/ | 301 https://wordpress.org/cli/ → 200 |
| legacy-wp-cli-org-redirect | example | https://wp-cli.org/commands/ | 301 https://wordpress.org/cli/ → 200 |
| machine-api-wordpress-org | url | https://api.wordpress.org/ | 302 https://developer.wordpress.org/rest-api/ → 200 |
| machine-api-wordpress-org | example | https://api.wordpress.org/core/version-check/1.7/ | 200 |
| machine-sitemaps | url | https://developer.wordpress.org/sitemap.xml | 200 |
| machine-sitemaps | example | https://wordpress.org/documentation/sitemap.xml | 200 |
| machine-llms-txt | url | https://wordpress.org/llms.txt | 200 |
| machine-markdown-output | url | https://developer.wordpress.org/?output_format=md | 200 |
| machine-markdown-output | example | https://wordpress.org/documentation/article/site-editor-navigation/?output_format=md | 200 |
| machine-wporg-mcp | url | https://wordpress.org/wp-json/mcp/wporg | 401 → 401 |
| machine-rest-docs-sites | url | https://developer.wordpress.org/wp-json/ | 200 |
| machine-rest-docs-sites | example | https://wordpress.org/documentation/wp-json/wp/v2/articles | 200 |
| repo-meta-svn | url | https://github.com/WordPress/wordpress.org | 200 |
| upstream-advanced-administration | url | https://github.com/WordPress/Advanced-administration-handbook | 200 |
| repo-documentation-issue-tracker | url | https://github.com/WordPress/Documentation-Issue-Tracker | 200 |
| upstream-gutenberg-docs | url | https://github.com/WordPress/gutenberg | 200 |
| repo-wporg-learn | url | https://github.com/WordPress/Learn | 200 |
| upstream-phpdoc-parser | url | https://github.com/WordPress/phpdoc-parser | 200 |
| upstream-scf | url | https://github.com/WordPress/secure-custom-fields | 200 |
| upstream-wordpress-develop | url | https://github.com/WordPress/wordpress-develop | 200 |
| upstream-playground-docs | url | https://github.com/WordPress/wordpress-playground | 200 |
| upstream-wpcs-docs | url | https://github.com/WordPress/wpcs-docs | 200 |
| repo-wporg-developer | url | https://github.com/WordPress/wporg-developer | 200 |
| repo-wporg-documentation-2022 | url | https://github.com/WordPress/wporg-documentation-2022 | 200 |
| repo-wporg-mu-plugins | url | https://github.com/WordPress/wporg-mu-plugins | 200 |
| upstream-wp-api-docs | url | https://github.com/WP-API/docs | 200 |
| upstream-wp-cli-handbook | url | https://github.com/wp-cli/handbook | 200 |
