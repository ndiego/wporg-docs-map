import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronsDownUp, ChevronsUpDown, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ALL, FilterSelect } from "@/components/filter-select";
import { CORRECTION, REPO, SiteFooter, SkipLink, Stat, TopBar } from "@/components/site-chrome";
import { CoverageCharts } from "@/components/rosetta/coverage-charts";
import { CompareMain } from "@/components/rosetta/compare-main";
import { Background } from "@/components/rosetta/background";
import { LocaleTable, sortLocales, type Sort } from "@/components/rosetta/locale-table";
import { byAnchor, fmt, generated, has, locales, stats, statuses, type EnrichedLocale } from "@/lib/rosetta";
import { cn } from "@/lib/utils";

const METHOD = `${REPO}/blob/trunk/data/ROSETTA-METHOD.md`;
const HISTORY = `${REPO}/blob/trunk/data/rosetta-history.json`;

const TOGGLES: { key: keyof typeof has; label: string }[] = [
  { key: "helphub", label: "Has HelpHub" },
  { key: "forums", label: "Has forums" },
  { key: "handbook", label: "Has handbook" },
  { key: "pkg", label: "Has localized package" },
];
const toggleCounts = Object.fromEntries(TOGGLES.map((t) => [t.key, locales.filter(has[t.key]).length]));

const DEFAULT_SORT: Sort = { key: "name", dir: "asc" };

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function RosettaApp() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(ALL);
  const [need, setNeed] = useState<Set<keyof typeof has>>(() => new Set());
  const [sort, setSort] = useState<Sort>(DEFAULT_SORT);
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());
  const [scrollTo, setScrollTo] = useState<{ id: string; smooth: boolean } | null>(null);

  const q = query.trim().toLowerCase();
  const matches = useCallback(
    (l: EnrichedLocale, query: string, st: string, req: Set<keyof typeof has>) =>
      (st === ALL || l.site_status === st) && (!query || l.haystack.includes(query)) && [...req].every((k) => has[k](l)),
    [],
  );
  const visible = useMemo(
    () => sortLocales(locales.filter((l) => matches(l, q, status, need)), sort),
    [matches, q, status, need, sort],
  );

  const allOpen = visible.length > 0 && visible.every((l) => openIds.has(l.anchor));
  const filtered = q !== "" || status !== ALL || need.size > 0;

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
    const l = byAnchor[id];
    if (!l) return;
    setQuery((v) => (v && !l.haystack.includes(v.trim().toLowerCase()) ? "" : v));
    setStatus((v) => (v !== ALL && v !== l.site_status ? ALL : v));
    setNeed((s) => ([...s].every((k) => has[k](l)) ? s : new Set()));
    setOpenIds((s) => new Set(s).add(id));
    setScrollTo({ id, smooth });
  }, []);

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
    let initial = true;
    const fromHash = () => {
      const id = decodeURIComponent(location.hash.replace(/^#/, ""));
      if (id && byAnchor[id]) reveal(id, !initial);
      initial = false;
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [reveal]);

  const flip = (k: keyof typeof has) =>
    setNeed((s) => {
      const n = new Set(s);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });

  const reset = () => {
    setQuery("");
    setStatus(ALL);
    setNeed(new Set());
    setSort(DEFAULT_SORT);
    setOpenIds(new Set());
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  };

  return (
    <TooltipProvider delayDuration={250}>
      <SkipLink>Skip to the locale sites</SkipLink>
      <TopBar current="rosetta" dataHref="../rosetta.json" />

      <header className="border-b bg-surface">
        <div className="mx-auto max-w-[1400px] px-4 pt-14 pb-12 sm:px-8 sm:pt-20 sm:pb-16">
          <p className="mb-4 text-sm font-medium tracking-wide text-primary">The localized WordPress.org network, measured</p>
          <h1 className="max-w-4xl font-heading text-[2.6rem] leading-[1.05] font-medium tracking-tight text-balance sm:text-6xl lg:text-7xl">
            Rosetta locale sites
          </h1>
          <p className="mt-6 max-w-[68ch] text-lg leading-relaxed text-pretty text-muted-foreground">
            Every locale site in the Rosetta network, what each one actually runs (news, forums, HelpHub, a team
            handbook) and how far that falls short of the main WordPress.org site.{" "}
            <a href="#background" className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary">
              New to Rosetta? Read the background.
            </a>
          </p>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 min-[1600px]:grid-cols-7">
            <Stat value={fmt.format(stats.total)} label="locales" />
            <Stat value={fmt.format(stats.active)} label="active sites" />
            <Stat value={fmt.format(stats.helphub)} label="with HelpHub articles" />
            <Stat value={fmt.format(stats.forums)} label="with forums" />
            <Stat value={fmt.format(stats.handbook)} label="with a team handbook" />
            <Stat
              value={stats.medianPercent == null ? "–" : `${stats.medianPercent.toFixed(stats.medianPercent % 1 ? 1 : 0)}%`}
              label="median core translated"
            />
            <Stat value={generated} label="last measured" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] space-y-12 px-4 pt-12 sm:px-8 sm:pt-16">
        <CoverageCharts />
        <CompareMain />
      </div>

      <main id="main" className="mt-12 sm:mt-16">
        <div
          id="toolbar"
          className="z-30 border-y bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 md:sticky md:top-0"
        >
          <div className="mx-auto max-w-[1400px] space-y-3 px-4 py-3 sm:px-8">
            <div role="search" className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-0 basis-full sm:basis-72 sm:flex-1">
                <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search names, locale codes, subdomains"
                  aria-label="Search the locale sites"
                  className="h-9 bg-card pl-9"
                />
              </div>
              <FilterSelect label="Site status" allLabel="Any status" value={status} options={statuses} onChange={setStatus} />
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 bg-card"
                  onClick={() => setOpenIds(allOpen ? new Set() : new Set(visible.map((l) => l.anchor)))}
                  disabled={visible.length === 0}
                >
                  {allOpen ? <ChevronsDownUp /> : <ChevronsUpDown />}
                  {allOpen ? "Collapse all" : "Expand all"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9"
                  onClick={reset}
                  disabled={!filtered && openIds.size === 0 && sort === DEFAULT_SORT}
                >
                  <RotateCcw /> Reset
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <div role="group" aria-label="Require a feature" className="-mx-4 flex w-[calc(100%+2rem)] gap-1.5 overflow-x-auto px-4 pb-1 md:mx-0 md:w-auto md:flex-wrap md:overflow-visible md:px-0 md:pb-0">
                {TOGGLES.map((t) => {
                  const on = need.has(t.key);
                  return (
                    <Toggle
                      key={t.key}
                      size="sm"
                      variant="outline"
                      pressed={on}
                      onPressedChange={() => flip(t.key)}
                      className={cn(
                        "h-7 shrink-0 rounded-sm bg-card px-2.5 text-[13px] font-normal text-muted-foreground",
                        "data-[state=on]:border-primary/50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground data-[state=on]:hover:bg-accent/70",
                      )}
                    >
                      {t.label}
                      <span className={cn("tabular-nums text-xs", on ? "text-primary" : "text-muted-foreground/70")}>
                        {toggleCounts[t.key]}
                      </span>
                    </Toggle>
                  );
                })}
              </div>
              <p aria-live="polite" className="text-sm text-muted-foreground tabular-nums">
                <span className="font-semibold text-foreground" data-testid="visible-count">{visible.length}</span> of{" "}
                {locales.length} locales
              </p>
            </div>
          </div>
        </div>

        <section aria-labelledby="sites" className="mx-auto max-w-[1400px] px-4 py-12 sm:px-8 sm:py-16">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b pb-3">
            <h2 id="sites" className="font-heading text-3xl font-medium tracking-tight sm:text-[2.25rem]">
              Every locale site
            </h2>
            <p className="text-sm text-muted-foreground">Click a header to sort, a row to open it.</p>
          </div>
          {visible.length === 0 ? (
            <div className="rounded-md border border-dashed bg-surface px-6 py-16 text-center">
              <p className="font-heading text-2xl">No locale sites match.</p>
              <p className="mt-2 text-muted-foreground">Clear a filter or widen the search.</p>
              <Button variant="outline" className="mt-6" onClick={reset}>
                <RotateCcw /> Reset filters
              </Button>
            </div>
          ) : (
            <LocaleTable rows={visible} sort={sort} onSort={setSort} openIds={openIds} onToggle={onToggle} />
          )}
        </section>
      </main>

      <Background />

      <SiteFooter
        heading="How it is measured"
        links={[
          { href: "../rosetta.json", label: "Download the data (rosetta.json)" },
          { href: METHOD, label: "Method note (ROSETTA-METHOD.md)", external: true },
          { href: HISTORY, label: "Background sources (rosetta-history.json)", external: true },
          { href: REPO, label: "Source and history on GitHub", external: true },
          { href: CORRECTION, label: "Report a correction", external: true },
        ]}
      >
        <p>
          Each locale site is read through its public pages and REST API: the home site, the support site (forums
          and HelpHub) and the team site, plus the core translation level. The method note lists every request.
          Unknown values are left blank rather than guessed.
        </p>
        <p>Generated from data dated {generated}.</p>
      </SiteFooter>
    </TooltipProvider>
  );
}
