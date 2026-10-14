#!/usr/bin/env python3
"""Build the single-page documentation map into dist/ from data/documentation-map.json.

Usage: python3 -I scripts/build-page.py [out_dir]
Writes dist/index.html (self-contained, the JSON is embedded) and dist/documentation-map.json.
"""
import json
import pathlib
import shutil
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "documentation-map.json"
TEMPLATE = ROOT / "site" / "page-template.html"
OUT_DIR = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "dist"


def kind_source(s):
    s = (s or "").lower()
    if "github" in s or s.startswith("markdown") or "mixed: github" in s:
        return "GitHub repo"
    if "parsed from core" in s or "docblock" in s:
        return "Parsed from core"
    if "mediawiki" in s:
        return "MediaWiki"
    if "trac" in s:
        return "Trac"
    if "theme code" in s and "database" not in s:
        return "Theme code"
    if "database" in s or "bbpress" in s or "uploads" in s:
        return "WordPress database"
    return "Other"


def kind_import(s):
    s = (s or "").lower()
    if "wporg-markdown" in s or "handbook plugin importer" in s or "markdown-import" in s or "devhub_cli" in s:
        return "GitHub importer"
    if "phpdoc" in s or "devhub parse" in s:
        return "phpdoc parser"
    if "lms" in s or "sensei" in s:
        return "LMS (Sensei)"
    if "wp-admin" in s:
        return "wp-admin editing"
    if "front-end" in s:
        return "Front-end form"
    if s.startswith("none") or s == "":
        return "None"
    return "Other"


def main():
    data = json.loads(DATA.read_text())
    for r in data["rows"]:
        r["sot_kind"] = kind_source(r.get("source_of_truth"))
        r["import_kind"] = kind_import(r.get("import_mechanism"))
    counted = [r for r in data["rows"] if r.get("page_count") and r["page_count"].get("value") is not None]
    total_pages = sum(int(r["page_count"]["value"]) for r in counted)
    payload = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    html = (
        TEMPLATE.read_text()
        .replace("__DATA__", payload)
        .replace("__GENERATED__", data["generated"])
        .replace("__ROWS__", str(len(data["rows"])))
        .replace("__CATS__", str(len(data["categories"])))
        .replace("__PAGES__", f"{total_pages:,}")
        .replace("__COUNTED__", str(len(counted)))
    )
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "index.html").write_text(html)
    shutil.copy(DATA, OUT_DIR / "documentation-map.json")
    print(f"wrote {OUT_DIR / 'index.html'} ({len(html) // 1024} KB): {len(data['rows'])} rows, "
          f"{total_pages:,} pages counted on {len(counted)} rows")


if __name__ == "__main__":
    main()
