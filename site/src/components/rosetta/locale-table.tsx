import { memo } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ArrowUpRight, Check, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Table, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SiteStatusBadge } from "@/components/rosetta/site-status-badge";
import { LocaleDetail } from "@/components/rosetta/locale-detail";
import { features, featureLabel, fmt, statusRank, type EnrichedLocale } from "@/lib/rosetta";
import { cn } from "@/lib/utils";

export type SortKey =
  | "name"
  | "status"
  | "translation"
  | "articles"
  | "versions"
  | "forums"
  | "posts"
  | "handbook"
  | "newest"
  | "features";
export interface Sort {
  key: SortKey;
  dir: "asc" | "desc";
}

type V = string | number | null;
const value: Record<SortKey, (l: EnrichedLocale) => V> = {
  name: (l) => l.english_name.toLowerCase(),
  status: (l) => statusRank(l.site_status),
  translation: (l) => l.translation?.core_dev_percent ?? null,
  articles: (l) => l.support?.helphub_articles ?? null,
  versions: (l) => l.support?.helphub_versions ?? null,
  forums: (l) => (l.support?.forums == null ? null : l.support.forums ? 1 : 0),
  posts: (l) => l.team?.posts ?? null,
  handbook: (l) => l.team?.handbook_pages ?? null,
  newest: (l) => l.newest,
  features: (l) => l.featureCount,
};

/** Sorts by the chosen column; unknown values always sink to the bottom; ties fall back to the English name. */
export function sortLocales(ls: EnrichedLocale[], s: Sort): EnrichedLocale[] {
  const f = value[s.key];
  const m = s.dir === "asc" ? 1 : -1;
  return [...ls].sort((a, b) => {
    const x = f(a);
    const y = f(b);
    if (x == null && y == null) return a.english_name.localeCompare(b.english_name);
    if (x == null) return 1;
    if (y == null) return -1;
    const c = x < y ? -1 : x > y ? 1 : 0;
    return c !== 0 ? c * m : a.english_name.localeCompare(b.english_name);
  });
}

const dash = (
  <span className="text-muted-foreground/60" aria-label="not recorded">
    –
  </span>
);
const n = (v: number | null | undefined) => (v == null ? dash : fmt.format(v));

const COLS: { key: SortKey; label: string; align?: "right" | "center"; first: "asc" | "desc" }[] = [
  { key: "name", label: "Locale", first: "asc" },
  { key: "status", label: "Site", first: "asc" },
  { key: "translation", label: "Translation", first: "desc" },
  { key: "articles", label: "HelpHub articles", align: "right", first: "desc" },
  { key: "versions", label: "HelpHub versions", align: "right", first: "desc" },
  { key: "forums", label: "Forums", align: "center", first: "desc" },
  { key: "posts", label: "Team posts", align: "right", first: "desc" },
  { key: "handbook", label: "Handbook pages", align: "right", first: "desc" },
  { key: "newest", label: "Newest activity", first: "desc" },
  { key: "features", label: "Features", first: "desc" },
];

function Percent({ v }: { v: number | null | undefined }) {
  if (v == null) return dash;
  return (
    <div className="w-24">
      <span className="font-mono text-[13px] tabular-nums">{v % 1 === 0 ? v : v.toFixed(1)}%</span>
      <div aria-hidden className="mt-1 h-1 rounded-full bg-muted">
        <div className="h-1 rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, v))}%` }} />
      </div>
    </div>
  );
}

function FeatureDots({ l }: { l: EnrichedLocale }) {
  return (
    <div className="flex items-center gap-2" title={features.map((f) => `${l.features?.[f] ? "✓" : "–"} ${featureLabel(f)}`).join("\n")}>
      <span aria-hidden className="flex gap-[3px]">
        {features.map((f) => (
          <span
            key={f}
            className={cn("size-2 rounded-full", l.features?.[f] ? "bg-primary" : "bg-transparent ring-1 ring-inset ring-input")}
          />
        ))}
      </span>
      <span className="font-mono text-[13px] tabular-nums">
        {l.featureCount}
        <span className="text-muted-foreground">/{features.length}</span>
      </span>
    </div>
  );
}

const LocaleRow = memo(function LocaleRow({
  l,
  open,
  onToggle,
}: {
  l: EnrichedLocale;
  open: boolean;
  onToggle: (id: string, open: boolean) => void;
}) {
  const cell = "py-3 align-top";
  return (
    <Collapsible asChild open={open} onOpenChange={(o) => onToggle(l.anchor, o)}>
      <tbody className="border-b last:border-b-0">
        <TableRow
          id={l.anchor}
          data-state={open ? "open" : "closed"}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a,button")) return;
            onToggle(l.anchor, !open);
          }}
          className={cn("group cursor-pointer border-b-0 hover:bg-accent/60", open && "bg-accent hover:bg-accent")}
        >
          <TableCell className="w-10 py-3 pr-0 pl-3 align-top">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`${open ? "Collapse" : "Expand"} ${l.english_name}`}
                className="text-muted-foreground"
              >
                <ChevronRight className={cn("transition-transform duration-150", open && "rotate-90 text-primary")} />
              </Button>
            </CollapsibleTrigger>
          </TableCell>
          <TableCell className={cn(cell, "min-w-40 max-w-56 whitespace-normal")}>
            <span lang={l.locale.replace("_", "-")} className="block font-medium">
              {l.native_name}
            </span>
            <span className="block text-[13px] text-muted-foreground">{l.english_name}</span>
            <code className="font-mono text-xs text-muted-foreground">{l.locale}</code>
          </TableCell>
          <TableCell className={cell}>
            {l.url ? (
            <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[13px] text-foreground decoration-primary/40 underline-offset-2 hover:text-primary hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {l.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                <ArrowUpRight aria-hidden className="ml-0.5 inline size-3 align-[-1px] text-muted-foreground" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              <span className="text-[13px] text-muted-foreground">no site URL</span>
            )}
            <div className="mt-1.5">
              <SiteStatusBadge status={l.site_status} />
            </div>
          </TableCell>
          <TableCell className={cell}>
            <Percent v={l.translation?.core_dev_percent} />
          </TableCell>
          <TableCell className={cn(cell, "text-right font-mono text-[13px] tabular-nums")}>{n(l.support?.helphub_articles)}</TableCell>
          <TableCell className={cn(cell, "text-right font-mono text-[13px] tabular-nums")}>{n(l.support?.helphub_versions)}</TableCell>
          <TableCell className={cn(cell, "text-center")}>
            {l.support?.forums ? (
              <Check aria-label="Has forums" className="mx-auto size-4 text-success" />
            ) : (
              <span className="text-muted-foreground/60" aria-label={l.support?.forums === false ? "No forums" : "not recorded"}>
                –
              </span>
            )}
          </TableCell>
          <TableCell className={cn(cell, "text-right font-mono text-[13px] tabular-nums")}>{n(l.team?.posts)}</TableCell>
          <TableCell className={cn(cell, "text-right font-mono text-[13px] tabular-nums")}>{n(l.team?.handbook_pages)}</TableCell>
          <TableCell className={cn(cell, "font-mono text-[13px] tabular-nums")}>{l.newest ?? dash}</TableCell>
          <TableCell className={cn(cell, "pr-4")}>
            <FeatureDots l={l} />
          </TableCell>
        </TableRow>
        <CollapsibleContent asChild>
          <tr>
            <td colSpan={COLS.length + 1} className="p-0">
              <LocaleDetail l={l} />
            </td>
          </tr>
        </CollapsibleContent>
      </tbody>
    </Collapsible>
  );
});

export function LocaleTable({
  rows,
  sort,
  onSort,
  openIds,
  onToggle,
}: {
  rows: EnrichedLocale[];
  sort: Sort;
  onSort: (s: Sort) => void;
  openIds: Set<string>;
  onToggle: (id: string, open: boolean) => void;
}) {
  return (
    <div className="overflow-hidden rounded-md border bg-card">
      <Table className="min-w-[1120px]">
        <caption className="sr-only">Rosetta locale sites. Column headers sort the table.</caption>
        <TableHeader className="bg-surface">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10">
              <span className="sr-only">Expand</span>
            </TableHead>
            {COLS.map((c) => {
              const on = sort.key === c.key;
              const Icon = on ? (sort.dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
              return (
                <TableHead
                  key={c.key}
                  aria-sort={on ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
                  className={cn("h-auto px-1 py-2 align-bottom whitespace-normal", c.align === "right" && "text-right", c.align === "center" && "text-center")}
                >
                  <button
                    type="button"
                    onClick={() => onSort({ key: c.key, dir: on ? (sort.dir === "asc" ? "desc" : "asc") : c.first })}
                    className={cn(
                      "inline-flex max-w-[6.5rem] items-end gap-1 rounded-sm px-1 py-1 text-left text-[11px] leading-tight font-semibold uppercase tracking-[0.08em] hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring",
                      on ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {c.label}
                    <Icon aria-hidden className={cn("mb-px size-3 shrink-0", !on && "opacity-50")} />
                  </button>
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        {rows.map((l) => (
          <LocaleRow key={l.anchor} l={l} open={openIds.has(l.anchor)} onToggle={onToggle} />
        ))}
      </Table>
    </div>
  );
}
