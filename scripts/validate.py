#!/usr/bin/env python3
"""Validate data/documentation-map.json against data/schema.json and the map's own rules, and
data/rosetta.json (when present) against data/rosetta.schema.json.

Standard library only, so it runs anywhere. Exit code 1 on any problem.
Rules beyond the schema: unique ids, category in `categories`, related_rows point at existing ids,
rows sorted by category order then name, no trailing whitespace in strings. For rosetta.json: unique
locale codes, locales sorted by subdomain, `url` matching the subdomain, one boolean per
main_site_features entry in `features`, and no feature claimed on a site that redirects or errors.
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "documentation-map.json"
SCHEMA = ROOT / "data" / "schema.json"
ROSETTA = ROOT / "data" / "rosetta.json"
ROSETTA_SCHEMA = ROOT / "data" / "rosetta.schema.json"

problems = []


def check(cond, msg):
    if not cond:
        problems.append(msg)


def type_ok(value, types):
    types = types if isinstance(types, list) else [types]
    for t in types:
        if t == "null" and value is None:
            return True
        if t == "string" and isinstance(value, str):
            return True
        if t == "integer" and isinstance(value, int) and not isinstance(value, bool):
            return True
        if t == "number" and isinstance(value, (int, float)) and not isinstance(value, bool):
            return True
        if t == "boolean" and isinstance(value, bool):
            return True
        if t == "object" and isinstance(value, dict):
            return True
        if t == "array" and isinstance(value, list):
            return True
    return False


def validate(obj, schema, path):
    if "type" in schema:
        check(type_ok(obj, schema["type"]), f"{path}: expected {schema['type']}, got {type(obj).__name__}")
        if not type_ok(obj, schema["type"]):
            return
    if "enum" in schema:
        check(obj in schema["enum"], f"{path}: {obj!r} not in {schema['enum']}")
    if "pattern" in schema and isinstance(obj, str):
        check(re.search(schema["pattern"], obj), f"{path}: {obj!r} does not match {schema['pattern']}")
    if "minLength" in schema and isinstance(obj, str):
        check(len(obj) >= schema["minLength"], f"{path}: shorter than {schema['minLength']}")
    if "minimum" in schema and isinstance(obj, (int, float)) and not isinstance(obj, bool):
        check(obj >= schema["minimum"], f"{path}: below {schema['minimum']}")
    if isinstance(obj, str):
        check(obj == obj.strip(), f"{path}: leading or trailing whitespace")
    if isinstance(obj, dict):
        for key in schema.get("required", []):
            check(key in obj, f"{path}: missing {key}")
        for key, sub in schema.get("properties", {}).items():
            if key in obj:
                validate(obj[key], sub, f"{path}.{key}")
    if isinstance(obj, list):
        if "minItems" in schema:
            check(len(obj) >= schema["minItems"], f"{path}: fewer than {schema['minItems']} items")
        if "items" in schema:
            for i, item in enumerate(obj):
                validate(item, schema["items"], f"{path}[{i}]")


def validate_rosetta():
    """Returns a one-line summary, or None when data/rosetta.json does not exist."""
    if not ROSETTA.exists():
        return None
    data = json.loads(ROSETTA.read_text())
    validate(data, json.loads(ROSETTA_SCHEMA.read_text()), "rosetta")
    feats = data.get("main_site_features", [])
    locs = data.get("locales", [])
    codes = [l.get("locale") for l in locs]
    dupes = {c for c in codes if codes.count(c) > 1}
    check(not dupes, f"rosetta: duplicate locales: {sorted(dupes)}")
    keys = [((l.get("subdomain") or "").lower(), l.get("locale") or "") for l in locs]
    check(keys == sorted(keys), "rosetta: locales are not sorted by subdomain")
    for l in locs:
        where = f"rosetta {l.get('locale')}"
        check(l.get("url") == f"https://{l.get('subdomain')}.wordpress.org/", f"{where}: url does not match subdomain")
        f = l.get("features") or {}
        check(sorted(f) == sorted(feats), f"{where}: features keys differ from main_site_features")
        check(all(isinstance(v, bool) for v in f.values()), f"{where}: features values must be booleans")
        if l.get("site_status") in ("redirect", "error"):
            check(not any(f.values()), f"{where}: features claimed on a {l.get('site_status')} site")
    active = sum(1 for l in locs if l.get("site_status") == "active")
    return f"OK: rosetta.json, {len(locs)} locales, {active} active"


def main():
    rosetta_summary = validate_rosetta()
    data = json.loads(DATA.read_text())
    schema = json.loads(SCHEMA.read_text())
    validate(data, schema, "$")
    rows = data.get("rows", [])
    ids = [r.get("id") for r in rows]
    dupes = {i for i in ids if ids.count(i) > 1}
    check(not dupes, f"duplicate ids: {sorted(dupes)}")
    cats = data.get("categories", [])
    order = {c: i for i, c in enumerate(cats)}
    for r in rows:
        check(r.get("category") in order, f"{r.get('id')}: category {r.get('category')!r} not in categories")
        for rel in r.get("related_rows", []):
            check(rel in ids, f"{r.get('id')}: related row {rel!r} does not exist")
    keys = [(order.get(r.get("category"), 999), (r.get("name") or "").lower()) for r in rows]
    check(keys == sorted(keys), "rows are not sorted by category order then name (run scripts/sort.py)")
    if problems:
        print(f"{len(problems)} problem(s):")
        for p in problems:
            print("  -", p)
        sys.exit(1)
    counted = [r for r in rows if r.get("page_count") and r["page_count"].get("value") is not None]
    print(f"OK: {len(rows)} rows, {len(cats)} categories, {len(counted)} with page counts, "
          f"{sum(r['page_count']['value'] for r in counted):,} pages counted")
    if rosetta_summary:
        print(rosetta_summary)


if __name__ == "__main__":
    main()
