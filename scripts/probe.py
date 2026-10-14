#!/usr/bin/env python3
"""Re-measure what can be measured for every row and record it under `probe`.

Standard library only. For each row:
  - request `url` and record the final status code and final URL
  - if `rest_api` is set, request it with ?per_page=1 and read X-WP-Total; when the row's page_count
    method is a REST total, update page_count.value and .date on change
  - if the row is on the WordPress.org network, check ?output_format=md and record the content type
  - for each repo in repo_links, read archived/pushed_at/default_branch from the GitHub API
    (set GITHUB_TOKEN to avoid the 60 requests/hour anonymous limit)
Narrative fields are never changed. The diff this produces is what the weekly PR shows.

With --rosetta it measures the Rosetta locale sites in data/rosetta.json instead (see rosetta.py):
REST totals, newest dates, forums, HelpHub, team site and handbook, translation state. It adds locales that
appear on the Polyglots teams page, never removes any, and never touches `notes`.

Usage: python3 -I scripts/probe.py [--only <id>] [--dry-run] [--timeout 20]
       python3 -I scripts/probe.py --rosetta [--only <subdomain>] [--dry-run] [--timeout 15]
"""
import argparse
import datetime
import json
import os
import pathlib
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "documentation-map.json"
UA = "Mozilla/5.0 (compatible; wporg-docs-map probe; +https://github.com/ndiego/wporg-docs-map)"
TODAY = datetime.date.today().isoformat()
WPORG = re.compile(r"^https?://([a-z0-9-]+\.)*wordpress\.org(/|$)")


def fetch(url, method="GET", timeout=20, headers=None, limit=4096):
    req = urllib.request.Request(url, method=method, headers={"User-Agent": UA, **(headers or {})})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status, dict(resp.headers), resp.geturl(), (resp.read(limit) if method == "GET" else b"")
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers), e.geturl() if hasattr(e, "geturl") else url, b""
    except Exception as e:  # noqa: BLE001
        return None, {"error": str(e)[:120]}, url, b""


def rest_total(route, timeout):
    sep = "&" if "?" in route else "?"
    status, headers, _, _ = fetch(route + sep + "per_page=1", timeout=timeout)
    if status == 200:
        for k, v in headers.items():
            if k.lower() == "x-wp-total":
                try:
                    return int(v)
                except ValueError:
                    return None
    return None


def github(url, timeout):
    m = re.match(r"https?://github\.com/([^/]+)/([^/#?]+)", url)
    if not m:
        return None
    owner, repo = m.group(1), m.group(2).removesuffix(".git")
    headers = {"Accept": "application/vnd.github+json"}
    if os.environ.get("GITHUB_TOKEN"):
        headers["Authorization"] = "Bearer " + os.environ["GITHUB_TOKEN"]
    status, _, _, body = fetch(f"https://api.github.com/repos/{owner}/{repo}", timeout=timeout, headers=headers)
    out = {"url": url, "status": status}
    if status == 200:
        try:
            j = json.loads(body or b"{}")
        except json.JSONDecodeError:
            j = {}
        out.update({"archived": j.get("archived"), "pushed_at": j.get("pushed_at"), "default_branch": j.get("default_branch")})
    return out


def probe_row(r, timeout):
    p = {"checked": TODAY}
    changes = []
    if r.get("url"):
        status, _, final, _ = fetch(r["url"], timeout=timeout)
        p["url_status"] = status
        p["url_final"] = final if final != r["url"] else None
        old = (r.get("probe") or {}).get("url_status")
        if old is not None and old != status:
            changes.append(f"url status {old} -> {status}")
    if r.get("rest_api") and r["rest_api"].startswith("http"):
        total = rest_total(r["rest_api"], timeout)
        p["rest_total"] = total
        pc = r.get("page_count") or {}
        if total is not None and pc.get("method") and "x-wp-total" in pc["method"].lower():
            if pc.get("value") != total:
                changes.append(f"page_count {pc.get('value')} -> {total}")
                r["page_count"] = {**pc, "value": total, "date": TODAY}
    if r.get("url") and WPORG.match(r["url"]) and (r.get("markdown_output") or "").lower() not in ("n/a", ""):
        sep = "&" if "?" in r["url"] else "?"
        status, headers, _, _ = fetch(r["url"] + sep + "output_format=md", method="HEAD", timeout=timeout)
        ct = next((v for k, v in headers.items() if k.lower() == "content-type"), None)
        p["markdown_content_type"] = ct if status == 200 else None
    repos = []
    for link in r.get("repo_links") or []:
        g = github(link, timeout)
        if g:
            repos.append(g)
            time.sleep(0.2)
    if repos:
        p["repos"] = repos
    r["probe"] = p
    return changes


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--timeout", type=int, default=None, help="seconds per request (20 for the map, 15 for --rosetta)")
    ap.add_argument("--rosetta", action="store_true", help="probe data/rosetta.json instead of the map")
    args = ap.parse_args()
    if args.rosetta:
        sys.path.insert(0, str(ROOT / "scripts"))
        import rosetta  # noqa: PLC0415

        return rosetta.run(fetch, only=args.only, dry_run=args.dry_run, timeout=args.timeout or 15)
    args.timeout = args.timeout or 20
    data = json.loads(DATA.read_text())
    report = []
    for r in data["rows"]:
        if args.only and r["id"] != args.only:
            continue
        changes = probe_row(r, args.timeout)
        flag = ""
        st = r["probe"].get("url_status")
        if st is None or st >= 400:
            flag = f"  ! url {st}"
        line = f"{r['id']}: {st}{flag}" + ("  " + "; ".join(changes) if changes else "")
        report.append(line)
        print(line, flush=True)
    if not args.dry_run:
        data["generated"] = TODAY
        DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    broken = [l for l in report if "! url" in l]
    changed = [l for l in report if "->" in l]
    print(f"\nprobed {len(report)} rows: {len(changed)} with changes, {len(broken)} with unreachable or failing URLs")
    return 0


if __name__ == "__main__":
    sys.exit(main())
