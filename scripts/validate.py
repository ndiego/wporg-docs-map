#!/usr/bin/env python3
"""Validate data/documentation-map.json against data/schema.json and the map's own rules.

Standard library only, so it runs anywhere. Exit code 1 on any problem.
Rules beyond the schema: unique ids, category in `categories`, related_rows point at existing ids,
rows sorted by category order then name, no trailing whitespace in strings.
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "documentation-map.json"
SCHEMA = ROOT / "data" / "schema.json"

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
    if "minimum" in schema and isinstance(obj, int):
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


def main():
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


if __name__ == "__main__":
    main()
