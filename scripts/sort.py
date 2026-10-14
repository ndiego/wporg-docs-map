#!/usr/bin/env python3
"""Sort rows by category order then name and rewrite the JSON with stable formatting."""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "documentation-map.json"

data = json.loads(DATA.read_text())
order = {c: i for i, c in enumerate(data["categories"])}
data["rows"].sort(key=lambda r: (order.get(r["category"], 999), (r["name"] or "").lower()))
DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
print(f"sorted {len(data['rows'])} rows")
