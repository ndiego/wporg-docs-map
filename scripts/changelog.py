#!/usr/bin/env python3
"""Print a Markdown changelog between two versions of the map.

Usage: python3 -I scripts/changelog.py <old.json> <new.json>
       git show trunk:data/documentation-map.json > /tmp/old.json && python3 -I scripts/changelog.py /tmp/old.json data/documentation-map.json
Narrative fields and measurements are both compared; `probe` is summarized, not diffed field by field.
"""
import json
import sys

FIELDS = ["name", "category", "url", "example_url", "site_or_host", "content_model", "source_of_truth",
          "import_mechanism", "editing_path", "owner_team", "maintainers_if_public", "rendering", "search",
          "translation", "markdown_output", "rest_api", "repo_links", "status", "last_activity_signal", "notes"]


def load(path):
    d = json.load(open(path))
    return d, {r["id"]: r for r in d["rows"]}


def main():
    old_d, old = load(sys.argv[1])
    new_d, new = load(sys.argv[2])
    out = [f"## {new_d['generated']}", ""]
    added = [i for i in new if i not in old]
    removed = [i for i in old if i not in new]
    for i in added:
        out.append(f"- Added **{new[i]['name']}** ({new[i]['category']})")
    for i in removed:
        out.append(f"- Removed **{old[i]['name']}**")
    for i in new:
        if i not in old:
            continue
        a, b = old[i], new[i]
        lines = []
        for f in FIELDS:
            if a.get(f) != b.get(f):
                lines.append(f"  - {f}: `{a.get(f)}` -> `{b.get(f)}`")
        pa, pb = a.get("page_count") or {}, b.get("page_count") or {}
        if pa.get("value") != pb.get("value"):
            lines.append(f"  - pages: {pa.get('value')} -> {pb.get('value')} ({pb.get('date')})")
        sa, sb = (a.get("probe") or {}).get("url_status"), (b.get("probe") or {}).get("url_status")
        if sa != sb and sb is not None:
            lines.append(f"  - url status: {sa} -> {sb}")
        if lines:
            out.append(f"- **{b['name']}**")
            out.extend(lines)
    if len(out) == 2:
        out.append("- No changes")
    print("\n".join(out))


if __name__ == "__main__":
    main()
