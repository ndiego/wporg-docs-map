import { useCallback, useEffect, useMemo, useState } from "react";
import { Braces, ChevronsDownUp, ChevronsUpDown, Moon, RotateCcw, Search, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CategorySection } from "@/components/category-section";
import { useTheme } from "@/hooks/use-theme";
import { byId, categories, countedRows, fmt, generated, rows, totalPages, uniqueValues, type EnrichedRow } from "@/lib/data";
import { cn } from "@/lib/utils";

const REPO = "https://github.com/ndiego/wporg-docs-map";
const CORRECTION = `${REPO}/issues/new?template=correction.yml`;
const ALL = "all";

const statuses = uniqueValues("status");
const sotKinds = uniqueValues("sot_kind");
const importKinds = uniqueValues("import_kind");
const perCategory = Object.fromEntries(categories.map((c) => [c, rows.filter((r) => r.category === c).length]));

function GithubMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden {...props}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function FilterSelect({
  label,
  allLabel,
  value,
  options,
  onChange,
}: {
  label: string;
  allLabel: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        aria-label={label}
        className={cn("h-9 w-full min-w-0 bg-card sm:w-auto", value !== ALL && "border-primary text-primary")}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" align="start">
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <Card className="gap-1 py-5 shadow-none ring-border">
      <CardContent className="px-4 sm:px-5">
        <p className="font-heading text-3xl leading-none font-medium whitespace-nowrap tabular-nums sm:text-4xl">{value}</p>
        <p className="mt-2 text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

export default function App() {
  const { theme, toggle } = useTheme();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(ALL);
  const [sot, setSot] = useState(ALL);
  const [imp, setImp] = useState(ALL);
  const [activeCats, setActiveCats] = useState<Set<string>>(() => new Set(categories));
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());
  const [scrollTo, setScrollTo] = useState<{ id: string; smooth: boolean } | null>(null);

  const q = query.trim().toLowerCase();
  const visible = useMemo(
    () =>
      rows.filter(
        (r) =>
          activeCats.has(r.category) &&
          (status === ALL || r.status === status) &&
          (sot === ALL || r.sot_kind === sot) &&
          (imp === ALL || r.import_kind === imp) &&
          (!q || r.haystack.includes(q)),
      ),
    [activeCats, status, sot, imp, q],
  );
  const grouped = useMemo(() => {
    const m = new Map<string, EnrichedRow[]>();
    for (const c of categories) m.set(c, []);
    for (const r of visible) m.get(r.category)?.push(r);
    return m;
  }, [visible]);

  const allOpen = visible.length > 0 && visible.every((r) => openIds.has(r.id));
  const filtered =
    q !== "" || status !== ALL || sot !== ALL || imp !== ALL || activeCats.size !== categories.length;

  const onToggle = useCallback((id: string, open: boolean) => {
    setOpenIds((s) => {
      const n = new Set(s);
      if (open) n.add(id);
      else n.delete(id);
      return n;
    });
  }, []);

  /** Open a row, clearing any filter that would hide it, then scroll to it. */
  const reveal = useCallback((id: string, smooth = true) => {
    const r = byId[id];
    if (!r) return;
    setActiveCats((s) => (s.has(r.category) ? s : new Set(categories)));
    setQuery((v) => (v && !r.haystack.includes(v.trim().toLowerCase()) ? "" : v));
    setStatus((v) => (v !== ALL && v !== r.status ? ALL : v));
    setSot((v) => (v !== ALL && v !== r.sot_kind ? ALL : v));
    setImp((v) => (v !== ALL && v !== r.import_kind ? ALL : v));
    setOpenIds((s) => new Set(s).add(id));
    setScrollTo({ id, smooth });
  }, []);

  const onJump = useCallback(
    (id: string) => {
      history.pushState(null, "", `#${id}`);
      reveal(id);
    },
    [reveal],
  );

  useEffect(() => {
    if (!scrollTo) return;
    const el = document.getElementById(scrollTo.id);
    if (el) {
      const bar = document.getElementById("toolbar");
      const offset = bar && getComputedStyle(bar).position === "sticky" ? bar.offsetHeight + 16 : 16;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - offset,
        behavior: scrollTo.smooth && !prefersReducedMotion() ? "smooth" : "auto",
      });
      el.querySelector<HTMLButtonElement>("button[aria-expanded]")?.focus({ preventScroll: true });
    }
    setScrollTo(null);
  }, [scrollTo]);

  useEffect(() => {
    const fromHash = () => {
      const id = decodeURIComponent(location.hash.replace(/^#/, ""));
      if (id && byId[id]) reveal(id, !initial);
      initial = false;
    };
    let initial = true;
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [reveal]);

  const clickCategory = (c: string) => {
    setActiveCats((s) => {
      if (s.size === categories.length) return new Set([c]);
      if (s.has(c) && s.size === 1) return new Set(categories);
      const n = new Set(s);
      if (n.has(c)) n.delete(c);
      else n.add(c);
      return n;
    });
  };

  const reset = () => {
    setQuery("");
    setStatus(ALL);
    setSot(ALL);
    setImp(ALL);
    setActiveCats(new Set(categories));
    setOpenIds(new Set());
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  };

  const sections = categories.filter((c) => (grouped.get(c)?.length ?? 0) > 0);

  return (
    <TooltipProvider delayDuration={250}>
      <a
        href="#main"
        className="sr-only z-50 rounded-sm bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to the map
      </a>

      {/* Local navigation bar, after WordPress.org's charcoal section headers. */}
      <div className="bg-[#1e1e1e] text-white dark:border-b dark:bg-[#151515]">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-8">
          <p className="truncate text-[15px] font-medium tracking-tight">
            WordPress.org <span className="text-white/60">Documentation Map</span>
          </p>
          <nav aria-label="Project" className="flex items-center gap-1">
            <Button asChild variant="ghost" size="sm" className="text-white/80 hover:bg-white/10 hover:text-white">
              <a href="documentation-map.json">
                <Braces /> <span className="hidden sm:inline">Data</span>
              </a>
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-white/80 hover:bg-white/10 hover:text-white">
              <a href={REPO} target="_blank" rel="noopener noreferrer">
                <GithubMark /> <span className="hidden sm:inline">GitHub</span>
              </a>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggle}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="text-white/80 hover:bg-white/10 hover:text-white"
            >
              {theme === "dark" ? <Sun /> : <Moon />}
            </Button>
          </nav>
        </div>
      </div>

      <header className="border-b bg-surface">
        <div className="mx-auto max-w-[1400px] px-4 pt-14 pb-12 sm:px-8 sm:pt-20 sm:pb-16">
          <p className="mb-4 text-sm font-medium tracking-wide text-primary">A living register, measured from the source</p>
          <h1 className="max-w-4xl font-heading text-[2.6rem] leading-[1.05] font-medium tracking-tight text-balance sm:text-6xl lg:text-7xl">
            WordPress.org Documentation Map
          </h1>
          <p className="mt-6 max-w-[68ch] text-lg leading-relaxed text-pretty text-muted-foreground">
            Every form of documentation on WordPress.org in one register: what it is, where it lives, its source of
            truth, how it reaches the site, who edits it, how big it is and which repositories sit behind it.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <Stat value={String(rows.length)} label="documentation surfaces" />
            <Stat value={String(categories.length)} label="categories" />
            <Stat value={fmt.format(totalPages)} label={`pages counted on ${countedRows.length} rows`} />
            <Stat value={generated} label="last measured" />
          </div>
        </div>
      </header>

      <div id="toolbar" className="z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 md:sticky md:top-0">
        <div className="mx-auto max-w-[1400px] space-y-3 px-4 py-3 sm:px-8">
          <div role="search" className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-0 basis-full sm:basis-72 sm:flex-1">
              <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search names, hosts, owners, repos, notes"
                aria-label="Search the map"
                className="h-9 bg-card pl-9"
              />
            </div>
            <FilterSelect label="Status" allLabel="Any status" value={status} options={statuses} onChange={setStatus} />
            <FilterSelect label="Source of truth" allLabel="Any source of truth" value={sot} options={sotKinds} onChange={setSot} />
            <FilterSelect label="Reaches the site by" allLabel="Any import mechanism" value={imp} options={importKinds} onChange={setImp} />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 bg-card"
                onClick={() => setOpenIds(allOpen ? new Set() : new Set(visible.map((r) => r.id)))}
                disabled={visible.length === 0}
              >
                {allOpen ? <ChevronsDownUp /> : <ChevronsUpDown />}
                {allOpen ? "Collapse all" : "Expand all"}
              </Button>
              <Button variant="ghost" size="sm" className="h-9" onClick={reset} disabled={!filtered && openIds.size === 0}>
                <RotateCcw /> Reset
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div role="group" aria-label="Categories" className="-mx-4 flex w-[calc(100%+2rem)] gap-1.5 overflow-x-auto px-4 pb-1 md:mx-0 md:w-auto md:flex-wrap md:overflow-visible md:px-0 md:pb-0">
              {categories.map((c) => {
                const on = activeCats.has(c);
                return (
                  <Toggle
                    key={c}
                    size="sm"
                    variant="outline"
                    pressed={on}
                    onPressedChange={() => clickCategory(c)}
                    className={cn(
                      "h-7 shrink-0 rounded-sm bg-card px-2.5 text-[13px] font-normal text-muted-foreground",
                      "data-[state=on]:border-primary/50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground data-[state=on]:hover:bg-accent/70",
                    )}
                  >
                    {c}
                    <span className={cn("tabular-nums text-xs", on ? "text-primary" : "text-muted-foreground/70")}>{perCategory[c]}</span>
                  </Toggle>
                );
              })}
            </div>
            <p aria-live="polite" className="text-sm text-muted-foreground tabular-nums">
              <span className="font-semibold text-foreground" data-testid="visible-count">{visible.length}</span> of {rows.length} surfaces
            </p>
          </div>
        </div>
      </div>

      <main id="main" className="mx-auto max-w-[1400px] space-y-16 px-4 py-12 sm:px-8 sm:py-16">
        {sections.length === 0 ? (
          <div className="rounded-md border border-dashed bg-surface px-6 py-16 text-center">
            <p className="font-heading text-2xl">No surfaces match.</p>
            <p className="mt-2 text-muted-foreground">Clear a filter or widen the search.</p>
            <Button variant="outline" className="mt-6" onClick={reset}>
              <RotateCcw /> Reset filters
            </Button>
          </div>
        ) : (
          sections.map((c) => (
            <CategorySection key={c} name={c} rows={grouped.get(c)!} openIds={openIds} onToggle={onToggle} onJump={onJump} />
          ))
        )}
      </main>

      <footer className="border-t bg-surface">
        <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-12 text-sm text-muted-foreground sm:px-8 md:grid-cols-[2fr_1fr]">
          <div className="max-w-[70ch] space-y-3 leading-relaxed">
            <p className="font-heading text-2xl text-foreground">How it is measured</p>
            <p>
              Page counts come from each site's REST API, sitemaps or repository manifests, each with its method and date,
              and a weekly probe re-checks every row's URL, REST total, Markdown output and repository activity.
            </p>
            <p>Generated from data dated {generated}.</p>
          </div>
          <ul className="space-y-2">
            <li>
              <a className="text-primary underline-offset-2 hover:underline" href="documentation-map.json">
                Download the data (documentation-map.json)
              </a>
            </li>
            <li>
              <a className="text-primary underline-offset-2 hover:underline" href={REPO} target="_blank" rel="noopener noreferrer">
                Source and history on GitHub
              </a>
            </li>
            <li>
              <a className="text-primary underline-offset-2 hover:underline" href={CORRECTION} target="_blank" rel="noopener noreferrer">
                Report a correction
              </a>
            </li>
          </ul>
        </div>
      </footer>
    </TooltipProvider>
  );
}
