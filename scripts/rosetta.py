"""Measure the Rosetta locale sites (xx.wordpress.org) into data/rosetta.json.

Called by `scripts/probe.py --rosetta`; standard library only. For every locale with a Rosetta site on
https://make.wordpress.org/polyglots/teams/ it requests, sequentially with a short pause:

  home     /  (status, final URL, <title>), /wp-json/wp/v2/types, X-WP-Total on ?per_page=1 for posts,
           pages and every content type, the newest post date, /download/, pages?slug=showcase
  support  /support/wp-json/wp/v2/types, X-WP-Total for helphub_article and helphub_version, the newest
           article date, /support/forums/ (bbPress forum ids), /support/view/all-topics/feed/ (newest topic)
  team     /team/wp-json/wp/v2/types, X-WP-Total for posts and handbook, the newest team post date
  locale   api.wordpress.org/core/version-check/1.7/?locale=<locale> (localized package) and
           make.wordpress.org/polyglots/teams/?locale=<locale> (editor and contributor counts)

plus, once per run, the teams page itself and translate.wordpress.org/api/projects/wp/dev/ for the
core percentages. REST totals count published items only. A request whose final URL leaves the locale's
host (a redirect to wordpress.org) counts as "not there". `notes` and `evidence` are never rewritten
for an existing locale; new locales get generated evidence and `notes: null`.
"""
import datetime
import email.utils
import html
import json
import pathlib
import re
import time
import urllib.parse

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "rosetta.json"
TODAY = datetime.date.today().isoformat()
TEAMS = "https://make.wordpress.org/polyglots/teams/"
WPDEV = "https://translate.wordpress.org/api/projects/wp/dev/"
VERSION_CHECK = "https://api.wordpress.org/core/version-check/1.7/?locale="
ACTIVE_DAYS = 365
PAUSE = 0.25

FEATURES = [
    "home pages", "news", "showcase", "download", "support forums",
    "helphub articles", "helphub versions", "team p2", "team handbook",
]
# Post types that are site plumbing rather than content; everything else in /types is reported and counted.
INFRA = {
    "attachment", "nav_menu_item", "revision", "wp_block", "wp_template", "wp_template_part",
    "wp_global_styles", "wp_navigation", "wp_font_family", "wp_font_face", "feedback", "jetpack_form",
    "visibility_preset", "forum", "topic", "reply",
}
INT_FIELDS = [
    ("home", "posts"), ("home", "pages"), ("support", "helphub_articles"), ("support", "helphub_versions"),
    ("support", "forum_count"), ("team", "posts"), ("team", "handbook_pages"), ("translation", "contributors"),
]


class Client:
    def __init__(self, fetch, timeout):
        self.fetch, self.timeout, self.count = fetch, timeout, 0

    def get(self, url, limit=None, headers=None):
        """GET with one retry on a network error or 5xx. Returns status, headers (lowercased), final, body."""
        for attempt in range(2):
            self.count += 1
            status, hdrs, final, body = self.fetch(url, timeout=self.timeout, headers=headers, limit=limit)
            time.sleep(PAUSE)
            if status is not None and status < 500:
                break
            time.sleep(2)
        return status, {k.lower(): v for k, v in hdrs.items()}, final, body

    def json(self, url):
        status, hdrs, final, body = self.get(url, headers={"Accept": "application/json"})
        try:
            obj = json.loads(body) if status == 200 else None
        except (json.JSONDecodeError, UnicodeDecodeError):
            obj = None
        return status, hdrs, final, obj


def sub_of(url):
    return urllib.parse.urlsplit(url).netloc.split(".")[0]


def host(url):
    return (urllib.parse.urlsplit(url or "").hostname or "").lower()


def day(value):
    return value[:10] if isinstance(value, str) and re.match(r"^\d{4}-\d{2}-\d{2}", value) else None


def strip(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()


def types_of(c, base, h):
    """Content post types at <base>/wp-json/wp/v2/types as {type: rest_base}, or None if the site is not there."""
    status, _, final, obj = c.json(base + "/wp-json/wp/v2/types")
    if status != 200 or host(final) != h or not isinstance(obj, dict):
        return None
    return {
        k: v.get("rest_base") for k, v in obj.items()
        if isinstance(v, dict) and k not in INFRA and not k.startswith("jp_") and v.get("rest_base")
        and v.get("rest_namespace", "wp/v2") == "wp/v2"
    }


def total(c, base, rest_base, newest=False):
    """(X-WP-Total, newest date or None) for one collection, published items only."""
    q = "per_page=1&orderby=date&order=desc&_fields=date" if newest else "per_page=1&_fields=id"
    status, hdrs, _, obj = c.json(f"{base}/wp-json/wp/v2/{rest_base}?{q}")
    if status != 200:
        return None, None
    try:
        n = int(hdrs.get("x-wp-total"))
    except (TypeError, ValueError):
        n = None
    d = day(obj[0].get("date")) if newest and isinstance(obj, list) and obj and isinstance(obj[0], dict) else None
    return n, d


def parse_teams(body):
    """Rows of the Polyglots teams table: locale, names, Rosetta URL, release and language-pack columns."""
    out = []
    for cls, row in re.findall(r'<tr class="(locale-version[^"]*)">(.*?)</tr>', body, re.S):
        tds = [td for _, td in re.findall(r"<td([^>]*)>(.*?)</td>", row, re.S)]
        if len(tds) < 7:
            continue
        link = re.search(r'href="([^"]+)"', tds[0])
        pct = strip(tds[5]).rstrip("%")
        rel, pack = strip(tds[3]), strip(tds[4])
        out.append({
            "locale": strip(tds[2]),
            "english_name": strip(tds[0]),
            "native_name": strip(tds[1]),
            "url": link.group(1) if link else None,
            "release": rel if re.match(r"^\d", rel) else None,
            "language_pack": pack if re.match(r"^\d", pack) else None,
            "polyglots_percent": int(pct) if pct.isdigit() else None,
            "glotpress_slug": strip(tds[6]) or None,
            "row_class": cls,
        })
    return out


def parse_team_page(body):
    """Counts from the h2 headings of make.wordpress.org/polyglots/teams/?locale=<locale>."""
    counts = {}
    for h in re.findall(r"<h2[^>]*>(.*?)</h2>", body, re.S):
        text = strip(h)
        m = re.search(r"\(([\d,]+)\)\s*$", text)
        n = int(m.group(1).replace(",", "")) if m else None
        for key, label in (("locale_managers", "Locale Managers"), ("gtes", "General Translation Editors"),
                           ("ptes", "Project Translation Editors"), ("contributors", "Current Translation Contributors"),
                           ("past_contributors", "Past Translation Contributors")):
            if text.startswith(label) and key not in counts:
                counts[key] = n
    # The page leaves out a section that has nobody in it, so on a page that rendered (it always lists
    # Locale Managers) a missing section means zero.
    if "locale_managers" in counts:
        for key in ("gtes", "ptes", "contributors", "past_contributors"):
            counts.setdefault(key, 0)
    return counts


def measure(c, entry, team_row, wpdev):
    url = entry["url"]
    h = host(url)
    base = url.rstrip("/")
    start = c.count
    probe = {"checked": TODAY}

    status, _, final, body = c.get(url, limit=40000)
    title = re.search(r"<title[^>]*>(.*?)</title>", body.decode("utf-8", "replace"), re.S) if body else None
    probe.update({"url_status": status, "url_final": final if final != url else None,
                  "title": strip(title.group(1)) if title else None})
    on_host = status == 200 and host(final) == h

    home = {"posts": None, "pages": None, "newest_post": None, "types": [], "type_counts": {},
            "download": None, "showcase": None}
    types = types_of(c, base, h) if on_host else None
    if types is not None:
        home["types"] = sorted(types)
        home["posts"], home["newest_post"] = total(c, base, types["post"], newest=True) if "post" in types else (None, None)
        home["pages"] = total(c, base, types["page"])[0] if "page" in types else None
        for t, rb in sorted(types.items()):
            if t not in ("post", "page"):
                home["type_counts"][t] = total(c, base, rb)[0]
        ds, _, dfinal, _ = c.get(base + "/download/", limit=1024)
        home["download"] = ds == 200 and host(dfinal) == h
        if any("showcase" in t for t in types):
            home["showcase"] = True
        else:
            ss, _, sfinal, sobj = c.json(base + "/wp-json/wp/v2/pages?slug=showcase&_fields=id")
            home["showcase"] = bool(sobj) if ss == 200 and host(sfinal) == h else None

    support = {"exists": False, "forums": None, "forum_count": None, "newest_topic": None,
               "helphub_articles": None, "helphub_versions": None, "newest_article": None, "types": []}
    stypes = types_of(c, base + "/support", h) if on_host else None
    if stypes is not None:
        support["exists"] = True
        support["types"] = sorted(stypes)
        if "helphub_article" in stypes:
            support["helphub_articles"], support["newest_article"] = total(c, base + "/support", stypes["helphub_article"], newest=True)
        if "helphub_version" in stypes:
            support["helphub_versions"] = total(c, base + "/support", stypes["helphub_version"])[0]
        fs, _, ffinal, fbody = c.get(base + "/support/forums/", limit=600000)
        if fs == 200 and host(ffinal) == h:
            text = fbody.decode("utf-8", "replace")
            support["forum_count"] = len(set(re.findall(r'id="bbp-forum-(\d+)"', text)))
            support["forums"] = support["forum_count"] > 0
        elif fs is not None and fs < 500:
            support["forums"], support["forum_count"] = False, 0
        if support["forums"]:
            ts, _, tfinal, tbody = c.get(base + "/support/view/all-topics/feed/", limit=400000)
            if ts == 200 and host(tfinal) == h:
                dates = []
                for d in re.findall(r"<pubDate>([^<]+)</pubDate>", tbody.decode("utf-8", "replace")):
                    try:
                        dates.append(email.utils.parsedate_to_datetime(d).date().isoformat())
                    except (TypeError, ValueError):
                        pass
                support["newest_topic"] = max(dates) if dates else None
    elif on_host:
        support["forums"] = False

    team = {"exists": False, "posts": None, "handbook_pages": None, "newest_post": None, "types": []}
    ttypes = types_of(c, base + "/team", h) if on_host else None
    if ttypes is not None:
        team["exists"] = True
        team["types"] = sorted(ttypes)
        if "post" in ttypes:
            team["posts"], team["newest_post"] = total(c, base + "/team", ttypes["post"], newest=True)
        team["handbook_pages"] = total(c, base + "/team", ttypes["handbook"])[0] if "handbook" in ttypes else 0

    loc = entry["locale"]
    translation = {"core_dev_percent": None, "polyglots_percent": None, "localized_release": None,
                   "language_pack": None, "localized_package": None, "contributors": None,
                   "past_contributors": None, "locale_managers": None, "gtes": None, "ptes": None}
    ts = wpdev.get(loc) or wpdev.get((team_row or {}).get("glotpress_slug"))
    if ts and ts.get("all_count"):
        translation["core_dev_percent"] = round(100 * ts["current_count"] / ts["all_count"], 1)
    if team_row:
        translation["polyglots_percent"] = team_row["polyglots_percent"]
        translation["localized_release"] = team_row["release"]
        translation["language_pack"] = team_row["language_pack"]
    vs, _, _, vobj = c.json(VERSION_CHECK + urllib.parse.quote(loc))
    if vs == 200 and isinstance(vobj, dict):
        translation["localized_package"] = any(o.get("locale") == loc for o in vobj.get("offers", []))
    ps, _, _, pbody = c.get(TEAMS + "?locale=" + urllib.parse.quote(loc), limit=None)
    if ps == 200 and pbody:
        translation.update(parse_team_page(pbody.decode("utf-8", "replace")))

    # Status: error and redirect come from the home request; otherwise active means some dated activity
    # (news post, team post, forum topic or HelpHub article) within ACTIVE_DAYS of the run.
    if status is None or status >= 400:
        site_status = "error"
    elif host(final) != h:
        site_status = "redirect"
    else:
        newest = max([d for d in (home["newest_post"], team["newest_post"], support["newest_topic"],
                                  support["newest_article"]) if d] or [""])
        cutoff = (datetime.date.fromisoformat(TODAY) - datetime.timedelta(days=ACTIVE_DAYS)).isoformat()
        site_status = "active" if newest and newest >= cutoff else "inactive"

    def pos(n):
        return bool(n) and n > 0

    reachable = site_status in ("active", "inactive")
    features = {
        "home pages": reachable and pos(home["pages"]),
        "news": reachable and pos(home["posts"]),
        "showcase": reachable and home["showcase"] is True,
        "download": reachable and home["download"] is True,
        "support forums": support["forums"] is True,
        "helphub articles": pos(support["helphub_articles"]),
        "helphub versions": pos(support["helphub_versions"]),
        "team p2": pos(team["posts"]),
        "team handbook": pos(team["handbook_pages"]),
    }
    probe["requests"] = c.count - start
    return {"site_status": site_status, "home": home, "support": support, "team": team,
            "translation": translation, "features": features, "probe": probe}


def evidence_for(entry):
    u, loc = entry["url"].rstrip("/"), entry["locale"]
    return [
        f"{TODAY}: GET {u}/ (status, final URL, title), {u}/wp-json/wp/v2/types, X-WP-Total on ?per_page=1 "
        f"for posts, pages and content types, newest post date, {u}/download/, pages?slug=showcase",
        f"{TODAY}: GET {u}/support/wp-json/wp/v2/types, X-WP-Total for helphub_article and helphub_version, "
        f"{u}/support/forums/ (bbPress forum ids), {u}/support/view/all-topics/feed/ (newest topic)",
        f"{TODAY}: GET {u}/team/wp-json/wp/v2/types, X-WP-Total for posts and handbook, newest team post date",
        f"{TODAY}: {WPDEV} (wp/dev current_count / all_count), {VERSION_CHECK}{loc} (localized package), "
        f"{TEAMS} and {TEAMS}?locale={loc} (release, language pack, editor and contributor counts)",
    ]


def run(fetch, only=None, dry_run=False, timeout=15):
    c = Client(fetch, timeout)
    data = json.loads(DATA.read_text()) if DATA.exists() else {"generated": TODAY, "locales": []}
    data["main_site_features"] = FEATURES
    status, _, _, body = c.get(TEAMS, limit=None)
    if status != 200:
        print(f"! teams page returned {status}; aborting")
        return 1
    teams = parse_teams(body.decode("utf-8", "replace"))
    _, _, _, wp = c.json(WPDEV)
    wpdev = {}
    for t in (wp or {}).get("translation_sets", []):
        wpdev[t.get("wp_locale") or t.get("locale")] = t
        wpdev.setdefault(t.get("locale"), t)

    by_locale = {e["locale"]: e for e in data["locales"]}
    rows = {t["locale"]: t for t in teams}
    for t in teams:
        sub = sub_of(t["url"]) if t["url"] else None
        if only and only not in (sub, t["locale"]):
            continue
        if t["url"] and t["locale"] not in by_locale:
            e = {"locale": t["locale"], "subdomain": sub_of(t["url"]), "english_name": t["english_name"],
                 "native_name": t["native_name"], "url": t["url"], "notes": None}
            e["evidence"] = evidence_for(e)
            by_locale[t["locale"]] = e
            data["locales"].append(e)
            print(f"+ new locale {t['locale']} ({e['subdomain']})")
    data["no_site_locales"] = [
        {"locale": t["locale"], "english_name": t["english_name"], "native_name": t["native_name"],
         "polyglots_percent": t["polyglots_percent"]} for t in teams if not t["url"]
    ]
    gone = [loc for loc in by_locale if loc not in rows]
    for loc in gone:
        print(f"! {loc} is no longer on the Polyglots teams page (kept)")

    report = []
    for e in sorted(data["locales"], key=lambda e: (e["subdomain"].lower(), e["locale"])):
        if only and only not in (e["subdomain"], e["locale"]):
            continue
        old = json.loads(json.dumps(e))
        t = rows.get(e["locale"])
        if t:
            e.update({"english_name": t["english_name"], "native_name": t["native_name"]})
        m = measure(c, e, t, wpdev)
        for k in ("site_status", "home", "support", "team", "translation", "features", "probe"):
            e[k] = m[k]
        e.setdefault("notes", None)
        e.setdefault("evidence", evidence_for(e))
        changes = []
        for a, b in INT_FIELDS:
            was, now = (old.get(a) or {}).get(b), e[a].get(b)
            if a in old and was != now:
                changes.append(f"{a}.{b} {was} -> {now}")
        if "site_status" in old and old["site_status"] != e["site_status"]:
            changes.append(f"status {old['site_status']} -> {e['site_status']}")
        line = (f"{e['subdomain']} ({e['locale']}): {e['site_status']}, {e['probe']['requests']} requests"
                + ("  " + "; ".join(changes) if changes else ""))
        report.append(line)
        print(line, flush=True)

    # Keep the keys in a stable order so diffs stay readable.
    order = ["locale", "subdomain", "english_name", "native_name", "url", "site_status", "home", "support",
             "team", "translation", "features", "notes", "evidence", "probe"]
    data["locales"] = [{k: e[k] for k in order if k in e}
                       for e in sorted(data["locales"], key=lambda e: (e["subdomain"].lower(), e["locale"]))]
    out = {"generated": TODAY, "main_site_features": FEATURES, "locales": data["locales"],
           "no_site_locales": data["no_site_locales"]}
    if not dry_run:
        DATA.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")
    changed = [r for r in report if "->" in r]
    print(f"\nprobed {len(report)} locales with {c.count} requests: {len(changed)} with changes")
    return 0
