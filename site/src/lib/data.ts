import raw from "@data/documentation-map.json";

export type Status = "active" | "stale" | "frozen" | "archived" | "proposed";

export interface PageCount {
  value: number | null;
  method: string | null;
  date: string | null;
}

export interface ProbeRepo {
  url: string;
  status?: number | null;
  archived?: boolean | null;
  pushed_at?: string | null;
  default_branch?: string | null;
}

export interface Probe {
  checked?: string;
  url_status?: number | null;
  url_final?: string | null;
  rest_total?: number | null;
  markdown_content_type?: string | null;
  repos?: ProbeRepo[];
}

export interface Row {
  id: string;
  name: string;
  category: string;
  url: string | null;
  example_url: string | null;
  site_or_host: string | null;
  page_count: PageCount | null;
  content_model: string | null;
  source_of_truth: string | null;
  import_mechanism: string | null;
  editing_path: string | null;
  owner_team: string | null;
  maintainers_if_public: string | null;
  rendering: string | null;
  search: string | null;
  translation: string | null;
  markdown_output: string | null;
  rest_api: string | null;
  repo_links: string[];
  status: Status;
  last_activity_signal: string | null;
  notes: string | null;
  evidence: string[];
  related_rows: string[];
  probe?: Probe;
}

export interface EnrichedRow extends Row {
  sot_kind: string;
  import_kind: string;
  haystack: string;
}

interface MapData {
  generated: string;
  categories: string[];
  rows: Row[];
}

/**
 * Classifies `source_of_truth` for the filter by how the text STARTS, so a row such as
 * "WordPress database (a GitHub mirror exists but is not imported)" files under the database,
 * not under GitHub. Keep new source_of_truth values leading with the kind.
 */
export function kindSource(value: string | null | undefined): string {
  const s = (value ?? "").toLowerCase().trim();
  const starts = (...prefixes: string[]) => prefixes.some((p) => s.startsWith(p));
  if (starts("github", "mixed: github", "markdown", "mdx")) return "GitHub repo";
  if (starts("parsed from core", "php docblocks", "parser code", "generated")) return "Parsed or generated";
  if (starts("mediawiki")) return "MediaWiki";
  if (starts("trac")) return "Trac";
  if (starts("wordpress database", "wordpress.com database", "glotpress database")) return "WordPress database";
  if (
    starts(
      "theme code",
      "code in meta svn",
      "plugin code",
      "devhub theme",
      "helphub theme",
      "shared blocks",
      "learn theme",
      "private dotorg",
      "redirect config",
      "rendered html",
    )
  )
    return "Site code or config";
  return "Other";
}

/** Port of kind_import() from the former scripts/build-page.py. Order of checks matters. */
export function kindImport(value: string | null | undefined): string {
  const s = (value ?? "").toLowerCase();
  if (
    s.includes("wporg-markdown") ||
    s.includes("handbook plugin importer") ||
    s.includes("markdown-import") ||
    s.includes("devhub_cli")
  )
    return "GitHub importer";
  if (s.includes("phpdoc") || s.includes("devhub parse")) return "phpdoc parser";
  if (s.includes("lms") || s.includes("sensei")) return "LMS (Sensei)";
  if (s.includes("wp-admin")) return "wp-admin editing";
  if (s.includes("front-end")) return "Front-end form";
  if (s.startsWith("none") || s === "") return "None";
  return "Other";
}

const data = raw as unknown as MapData;

export const generated = data.generated;
export const categories = data.categories;

export const rows: EnrichedRow[] = data.rows.map((r) => ({
  ...r,
  sot_kind: kindSource(r.source_of_truth),
  import_kind: kindImport(r.import_mechanism),
  haystack: [
    r.name,
    r.id,
    r.url,
    r.site_or_host,
    r.owner_team,
    r.maintainers_if_public,
    r.source_of_truth,
    r.import_mechanism,
    r.editing_path,
    r.content_model,
    r.rendering,
    r.notes,
    r.translation,
    ...(r.repo_links ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase(),
}));

export const byId: Record<string, EnrichedRow> = Object.fromEntries(rows.map((r) => [r.id, r]));

export function pageValue(r: Row): number | null {
  return r.page_count && r.page_count.value != null ? Number(r.page_count.value) : null;
}

export const countedRows = rows.filter((r) => pageValue(r) != null);
export const totalPages = countedRows.reduce((a, r) => a + (pageValue(r) ?? 0), 0);

export function uniqueValues(key: "status" | "sot_kind" | "import_kind"): string[] {
  return [...new Set(rows.map((r) => r[key]).filter(Boolean))].sort();
}

export const fmt = new Intl.NumberFormat("en-US");
