import type { ReactNode } from "react";
import { ArrowUpRight, Archive, CircleCheck, CircleX, Link2 } from "lucide-react";
import { byId, fmt, type EnrichedRow, type Probe } from "@/lib/data";

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

function Field({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  if (children == null || children === "" || children === false) return null;
  return (
    <div className={wide ? "min-w-0 sm:col-span-2" : "min-w-0"}>
      <dt className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</dt>
      <dd className="text-sm leading-relaxed [overflow-wrap:anywhere]">{children}</dd>
    </div>
  );
}

function List<T>({ items, render }: { items: T[] | undefined; render: (x: T) => ReactNode }) {
  if (!items || items.length === 0) return null;
  return (
    <ul className="space-y-1">
      {items.map((x, i) => (
        <li key={i} className="flex gap-2">
          <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground/50" />
          <span className="min-w-0">{render(x)}</span>
        </li>
      ))}
    </ul>
  );
}

function ProbePanel({ probe }: { probe: Probe }) {
  const ok = probe.url_status != null && probe.url_status >= 200 && probe.url_status < 400;
  return (
    <section aria-label="Last automated probe" className="rounded-md border bg-card p-4">
      <h4 className="mb-3 flex flex-wrap items-baseline gap-x-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        Last automated probe
        {probe.checked && <span className="font-normal normal-case tracking-normal">checked {probe.checked}</span>}
      </h4>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-xs text-muted-foreground">URL status</dt>
          <dd className="flex items-center gap-1.5 font-mono tabular-nums">
            {probe.url_status == null ? (
              "–"
            ) : (
              <>
                {ok ? (
                  <CircleCheck aria-hidden className="size-3.5 text-success" />
                ) : (
                  <CircleX aria-hidden className="size-3.5 text-danger" />
                )}
                {probe.url_status}
              </>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">REST total</dt>
          <dd className="font-mono tabular-nums">{probe.rest_total != null ? fmt.format(probe.rest_total) : "–"}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-muted-foreground">Markdown content type</dt>
          <dd className="font-mono text-xs [overflow-wrap:anywhere]">{probe.markdown_content_type ?? "–"}</dd>
        </div>
        {probe.url_final && (
          <div className="col-span-2 sm:col-span-4">
            <dt className="text-xs text-muted-foreground">Redirects to</dt>
            <dd>
              <Ext href={probe.url_final} />
            </dd>
          </div>
        )}
      </dl>
      {probe.repos && probe.repos.length > 0 && (
        <div className="mt-4 border-t pt-3">
          <p className="mb-2 text-xs text-muted-foreground">Repositories</p>
          <ul className="space-y-1.5 text-sm">
            {probe.repos.map((repo) => (
              <li key={repo.url} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Ext href={repo.url}>{repo.url.replace(/^https?:\/\/github\.com\//, "")}</Ext>
                {repo.archived && (
                  <span className="inline-flex items-center gap-1 text-xs text-danger">
                    <Archive aria-hidden className="size-3" /> archived
                  </span>
                )}
                {repo.pushed_at && (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    pushed {repo.pushed_at.slice(0, 10)}
                  </span>
                )}
                {repo.status != null && repo.status !== 200 && (
                  <span className="font-mono text-xs text-danger">HTTP {repo.status}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export function RowDetail({ row, onJump }: { row: EnrichedRow; onJump: (id: string) => void }) {
  const p = row.page_count;
  return (
    <div className="sticky left-0 grid w-[min(100%,calc(100vw-2rem-2px))] gap-6 border-l-2 border-primary bg-surface px-5 py-6 sm:w-[min(100%,calc(100vw-4rem-2px))] sm:px-8">
      <dl className="grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="URL">{row.url && <Ext href={row.url} />}</Field>
        <Field label="Example page">{row.example_url && <Ext href={row.example_url} />}</Field>
        <Field label="Where it lives">{row.site_or_host}</Field>
        <Field label="Content model">{row.content_model}</Field>
        <Field label="Source of truth">
          {row.source_of_truth && (
            <>
              {row.source_of_truth}
              {row.sot_kind.toLowerCase() !== row.source_of_truth.toLowerCase() && (
                <span className="ml-1.5 text-xs text-muted-foreground">({row.sot_kind})</span>
              )}
            </>
          )}
        </Field>
        <Field label="Import mechanism">
          {row.import_mechanism && (
            <>
              {row.import_mechanism}
              {row.import_kind.toLowerCase() !== row.import_mechanism.toLowerCase() && (
                <span className="ml-1.5 text-xs text-muted-foreground">({row.import_kind})</span>
              )}
            </>
          )}
        </Field>
        <Field label="Editing path">{row.editing_path}</Field>
        <Field label="Owner">{row.owner_team}</Field>
        <Field label="Maintainers">{row.maintainers_if_public}</Field>
        <Field label="Pages">
          {p && p.value != null && (
            <>
              <span className="font-mono tabular-nums">{fmt.format(p.value)}</span>
              {(p.method || p.date) && (
                <span className="block text-xs text-muted-foreground">
                  {[p.method, p.date].filter(Boolean).join(", ")}
                </span>
              )}
            </>
          )}
        </Field>
        <Field label="Rendering">{row.rendering}</Field>
        <Field label="Search">{row.search}</Field>
        <Field label="Translation">{row.translation}</Field>
        <Field label="Markdown output">{row.markdown_output}</Field>
        <Field label="REST API">
          {row.rest_api && (
            <code className="rounded-sm bg-card px-1.5 py-0.5 font-mono text-[12.5px] ring-1 ring-border">{row.rest_api}</code>
          )}
        </Field>
        <Field label="Repositories">
          {row.repo_links.length > 0 && (
            <List items={row.repo_links} render={(u) => <Ext href={u}>{u.replace(/^https?:\/\//, "")}</Ext>} />
          )}
        </Field>
        <Field label="Last activity signal">{row.last_activity_signal}</Field>
        <Field label="Related rows">
          {row.related_rows.length > 0 && (
            <List
              items={row.related_rows}
              render={(id) =>
                byId[id] ? (
                  <a
                    href={`#${id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onJump(id);
                    }}
                    className="inline-flex items-center gap-1 text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
                  >
                    <Link2 aria-hidden className="size-3 opacity-60" />
                    {byId[id].name}
                  </a>
                ) : (
                  <span className="font-mono text-xs">{id}</span>
                )
              }
            />
          )}
        </Field>
        <Field label="Notes" wide>
          {row.notes}
        </Field>
        <Field label="Evidence" wide>
          {row.evidence.length > 0 && (
            <List items={row.evidence} render={(e) => (/^https?:\/\//.test(e) ? <Ext href={e} /> : e)} />
          )}
        </Field>
      </dl>
      {row.probe && <ProbePanel probe={row.probe} />}
    </div>
  );
}
