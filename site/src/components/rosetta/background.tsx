import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { formatDate, intro, roles, sections, sourceNumber, sources, timeline, updated } from "@/lib/history";

const label = "text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground";

/** Superscript citation links, "[1][4]", pointing at the numbered source list below. */
function Cites({ ids }: { ids: string[] }) {
  if (!ids.length) return null;
  return (
    <sup className="ml-0.5 text-[0.7em] leading-none">
      {ids.map((id, i) => {
        const n = sourceNumber[id];
        if (!n) return null;
        return (
          <a
            key={id}
            href={`#source-${n}`}
            aria-label={`Source ${n}`}
            className="text-primary underline-offset-2 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
          >
            {i > 0 ? "," : ""}[{n}]
          </a>
        );
      })}
    </sup>
  );
}

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="break-words text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {children}
      <ArrowUpRight aria-hidden className="ml-0.5 inline size-3 align-baseline opacity-60" />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/**
 * The reference section: where the Rosetta network comes from, what the sites are for and who runs them,
 * with every claim cited to a numbered source. Content lives in data/rosetta-history.json.
 */
export function Background() {
  return (
    <section aria-labelledby="background" className="border-t bg-surface">
      <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-8 sm:py-16">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b pb-3">
          <h2 id="background" className="font-heading text-3xl font-medium tracking-tight sm:text-[2.25rem]">
            Background: where Rosetta sites come from
          </h2>
          <p className="text-sm text-muted-foreground">Reference material, with sources. Last reviewed {updated}.</p>
        </div>
        <p className="max-w-[70ch] text-lg leading-relaxed text-pretty text-muted-foreground">{intro}</p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-14">
          <div className="min-w-0 space-y-8">
            {sections.map((s) => (
              <section key={s.heading} aria-label={s.heading}>
                <h3 className="mb-3 font-heading text-2xl font-medium tracking-tight">{s.heading}</h3>
                <div className="max-w-[70ch] space-y-4 leading-relaxed">
                  {s.paragraphs.map((p, i) => (
                    <p key={i}>
                      {p.text}
                      <Cites ids={p.sources} />
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <aside aria-labelledby="timeline" className="min-w-0 lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-md border bg-card p-5 sm:p-6">
              <h3 id="timeline" className="mb-1 font-heading text-2xl font-medium tracking-tight">
                Timeline
              </h3>
              <p className="mb-5 text-sm text-muted-foreground">Dated events, each with its source.</p>
              <ol className="relative space-y-4 border-l pl-5">
                {timeline.map((t) => (
                  <li key={t.date + t.event} className="relative text-sm leading-relaxed">
                    <span aria-hidden className="absolute top-2 -left-[1.45rem] size-2 rounded-full bg-primary ring-4 ring-card" />
                    <time dateTime={t.date} className="block font-mono text-[12px] font-medium tabular-nums text-muted-foreground">
                      {formatDate(t.date)}
                    </time>
                    <span>
                      {t.event}
                      <Cites ids={t.sources} />
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>

        <section aria-labelledby="roles" className="mt-12">
          <h3 id="roles" className="mb-1 font-heading text-2xl font-medium tracking-tight">
            Who runs a locale site
          </h3>
          <p className="mb-5 text-sm text-muted-foreground">The Polyglots roles that a Rosetta site depends on.</p>
          <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {roles.map((r) => (
              <div key={r.name} className="rounded-md border bg-card p-4">
                <dt className={label}>{r.name}</dt>
                <dd className="mt-2 text-sm leading-relaxed">
                  {r.description}
                  <Cites ids={r.sources} />
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="sources" className="mt-12">
          <h3 id="sources" className="mb-1 font-heading text-2xl font-medium tracking-tight">
            Sources
          </h3>
          <p className="mb-5 text-sm text-muted-foreground">
            Every claim above links to one of these. Dates are the source's own publication date where it has one.
          </p>
          <ol className="grid gap-x-8 gap-y-3 text-sm leading-relaxed md:grid-cols-2">
            {sources.map((s, i) => (
              <li key={s.id} id={`source-${i + 1}`} className="flex gap-3 scroll-mt-24">
                <span className="w-7 shrink-0 font-mono text-[13px] tabular-nums text-muted-foreground">[{i + 1}]</span>
                <span className="min-w-0 [overflow-wrap:anywhere]">
                  <Ext href={s.url}>{s.title}</Ext>
                  <span className="text-muted-foreground">
                    {" "}
                    {s.publisher}
                    {s.date ? `, ${formatDate(s.date)}` : ""}. {s.supports}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </section>
  );
}
