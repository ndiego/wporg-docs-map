import type { ReactNode } from "react";
import { ArrowUpRight, Check, Minus } from "lucide-react";
import { features, featureLabel, fmt, type EnrichedLocale } from "@/lib/rosetta";
import { cn } from "@/lib/utils";

function Ext({ href, children }: { href: string; children?: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="break-words text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {children ?? href}
      <ArrowUpRight aria-hidden className="ml-0.5 inline size-3 align-baseline opacity-60" />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

const none = <span className="text-muted-foreground/70">not recorded</span>;
const num = (v: number | null | undefined) =>
  v == null ? none : <span className="font-mono tabular-nums">{fmt.format(v)}</span>;
const date = (v: string | null | undefined) => (v ? <span className="font-mono tabular-nums">{v}</span> : none);
const yes = (v: boolean | null | undefined) => (v == null ? none : v ? "Yes" : "No");

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="min-w-0 rounded-md border bg-card p-4">
      <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{title}</h4>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">{children}</dl>
    </section>
  );
}

function Item({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 [overflow-wrap:anywhere]">{children}</dd>
    </>
  );
}

function show(v: unknown): ReactNode {
  if (v == null) return none;
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "number") return <span className="font-mono tabular-nums">{fmt.format(v)}</span>;
  if (typeof v === "string") return /^https?:\/\/\S+$/.test(v) ? <Ext href={v} /> : v;
  if (Array.isArray(v)) return v.length ? v.map(String).join(", ") : none;
  const entries = Object.entries(v as Record<string, unknown>);
  return entries.length ? entries.map(([k, x]) => `${k}: ${String(x)}`).join(", ") : none;
}

const LABELS: Record<string, string> = {
  gtes: "GTEs",
  ptes: "PTEs",
  polyglots_percent: "Polyglots page %",
  type_counts: "Other content types",
  forum_count: "Forum count",
};
const humanize = (k: string) => LABELS[k] ?? k.charAt(0).toUpperCase() + k.slice(1).replace(/_/g, " ");

/** Any field the dataset carries beyond the ones laid out by hand, so the detail shows every field. */
function Rest({ obj, skip }: { obj: object | undefined; skip: string[] }) {
  if (!obj) return null;
  return (
    <>
      {Object.entries(obj)
        .filter(([k]) => !skip.includes(k))
        .map(([k, v]) => (
          <Item key={k} label={humanize(k)}>
            {show(v)}
          </Item>
        ))}
    </>
  );
}

function List({ items, render }: { items: string[]; render: (x: string) => ReactNode }) {
  return (
    <ul className="space-y-1">
      {items.map((x, i) => (
        <li key={i} className="flex gap-2">
          <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground/50" />
          <span className="min-w-0 [overflow-wrap:anywhere]">{render(x)}</span>
        </li>
      ))}
    </ul>
  );
}

function probeValue(v: unknown): ReactNode {
  if (v == null) return "–";
  if (typeof v === "string" && /^https?:\/\//.test(v)) return <Ext href={v} />;
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "object") return <code className="font-mono text-xs">{JSON.stringify(v)}</code>;
  return <span className="font-mono">{String(v)}</span>;
}

export function LocaleDetail({ l }: { l: EnrichedLocale }) {
  const probe = l.probe && Object.keys(l.probe).length > 0 ? l.probe : null;
  return (
    <div className="sticky left-0 grid w-[min(100%,calc(100vw-2rem-2px))] gap-5 border-l-2 border-primary bg-surface px-5 py-6 sm:w-[min(100%,calc(100vw-4rem-2px))] sm:px-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Group title="Site">
          <Item label="URL">
            {l.url ? <Ext href={l.url}>{l.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}</Ext> : none}
          </Item>
          <Item label="Locale">
            <code className="font-mono">{l.locale}</code>
          </Item>
          <Item label="Subdomain">
            <code className="font-mono">{l.subdomain}</code>
          </Item>
          <Item label="Status">{l.site_status}</Item>
          <Item label="Home posts">{num(l.home?.posts)}</Item>
          <Item label="Home pages">{num(l.home?.pages)}</Item>
          <Item label="Newest post">{date(l.home?.newest_post)}</Item>
          <Item label="Post types">{l.home?.types?.length ? l.home.types.join(", ") : none}</Item>
          <Rest obj={l.home} skip={["posts", "pages", "newest_post", "types"]} />
        </Group>
        <Group title="Support">
          <Item label="Support site">{yes(l.support?.exists)}</Item>
          <Item label="Forums">{yes(l.support?.forums)}</Item>
          <Item label="HelpHub articles">{num(l.support?.helphub_articles)}</Item>
          <Item label="HelpHub versions">{num(l.support?.helphub_versions)}</Item>
          <Item label="Newest article">{date(l.support?.newest_article)}</Item>
          <Rest obj={l.support} skip={["exists", "forums", "helphub_articles", "helphub_versions", "newest_article"]} />
        </Group>
        <Group title="Team">
          <Item label="Team site">{yes(l.team?.exists)}</Item>
          <Item label="Posts">{num(l.team?.posts)}</Item>
          <Item label="Handbook pages">{num(l.team?.handbook_pages)}</Item>
          <Item label="Newest post">{date(l.team?.newest_post)}</Item>
          <Rest obj={l.team} skip={["exists", "posts", "handbook_pages", "newest_post"]} />
        </Group>
        <Group title="Translation">
          <Item label="Core (dev)">
            {l.translation?.core_dev_percent == null ? none : (
              <span className="font-mono tabular-nums">{l.translation.core_dev_percent}%</span>
            )}
          </Item>
          <Item label="Localized package">{yes(l.translation?.localized_package)}</Item>
          <Item label="Contributors">{num(l.translation?.contributors)}</Item>
          <Rest obj={l.translation} skip={["core_dev_percent", "localized_package", "contributors"]} />
        </Group>
      </div>

      <section aria-label="Features against the main site">
        <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Against the main site: {l.featureCount} of {features.length} features
        </h4>
        <ul className="flex flex-wrap gap-1.5">
          {features.map((f) => {
            const on = l.features?.[f] === true;
            return (
              <li
                key={f}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 text-[13px]",
                  on ? "border-success/40 bg-success/10 text-foreground" : "bg-card text-muted-foreground",
                )}
              >
                {on ? (
                  <Check aria-hidden className="size-3.5 text-success" />
                ) : (
                  <Minus aria-hidden className="size-3.5" />
                )}
                {featureLabel(f)}
                <span className="sr-only">{on ? ": present" : ": missing"}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <dl className="grid gap-x-10 gap-y-5 lg:grid-cols-2">
        {l.notes && (
          <div className="min-w-0">
            <dt className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Notes</dt>
            <dd className="text-sm leading-relaxed [overflow-wrap:anywhere]">{l.notes}</dd>
          </div>
        )}
        {l.evidence.length > 0 && (
          <div className="min-w-0">
            <dt className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Evidence</dt>
            <dd className="text-sm leading-relaxed">
              <List items={l.evidence} render={(e) => (/^https?:\/\/\S+$/.test(e) ? <Ext href={e} /> : e)} />
            </dd>
          </div>
        )}
      </dl>

      {probe && (
        <section aria-label="Last automated probe" className="rounded-md border bg-card p-4">
          <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Probe</h4>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
            {Object.entries(probe).map(([k, v]) => (
              <div key={k} className="min-w-0">
                <dt className="text-xs text-muted-foreground">{humanize(k)}</dt>
                <dd className="[overflow-wrap:anywhere]">{probeValue(v)}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}
