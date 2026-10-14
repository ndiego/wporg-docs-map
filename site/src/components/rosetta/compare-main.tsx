import { Check } from "lucide-react";
import { featureCoverage, gapReadings, pct, stats } from "@/lib/rosetta";

export function CompareMain() {
  const readings = gapReadings();
  return (
    <section aria-labelledby="compare" className="rounded-md border bg-surface p-5 sm:p-8">
      <h2 id="compare" className="font-heading text-3xl font-medium tracking-tight sm:text-[2.25rem]">
        Compared with WordPress.org
      </h2>
      <p className="mt-2 max-w-[70ch] text-muted-foreground">
        The main site runs every feature below. For each one, how many of the {stats.total} locale sites also have it.
      </p>
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <ul className="divide-y rounded-md border bg-card">
          {featureCoverage.map((f) => (
            <li key={f.feature} className="flex items-center gap-3 px-4 py-2.5 text-sm">
              <Check aria-label="On the main site" className="size-4 shrink-0 text-success" />
              <span className="min-w-0 flex-1">{f.label}</span>
              <span className="font-mono text-[13px] tabular-nums">
                {f.count} <span className="text-muted-foreground">of {stats.total}</span>
              </span>
              <span className="w-12 text-right font-mono text-[13px] font-medium tabular-nums">{pct(f.share)}</span>
            </li>
          ))}
        </ul>
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">The biggest gaps</p>
          <ul className="space-y-3 leading-relaxed">
            {readings.map((r) => (
              <li key={r} className="flex gap-3">
                <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
