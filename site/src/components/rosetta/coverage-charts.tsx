import { featureCoverage, percentBuckets, stats, fmt, pct } from "@/lib/rosetta";

const label = "text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground";

/** Horizontal bars, one per main-site feature, drawn to scale against the number of locales. */
function FeatureBars() {
  const n = stats.total || 1;
  return (
    <figure className="min-w-0 rounded-md border bg-card p-5 sm:p-6">
      <figcaption className="mb-1 font-heading text-2xl font-medium tracking-tight">Main-site features on locale sites</figcaption>
      <p className="mb-5 text-sm text-muted-foreground">Locales with each feature, out of {fmt.format(stats.total)}.</p>
      <ul className="space-y-2.5">
        {featureCoverage.map((f) => (
          <li
            key={f.feature}
            className="grid grid-cols-[minmax(7.5rem,10rem)_1fr_4.5rem] items-center gap-3 text-sm"
            title={`${f.label}: ${f.count} of ${stats.total} locales (${pct(f.share)})`}
          >
            <span className="truncate">{f.label}</span>
            <span className="relative h-3 rounded-r-[4px] bg-muted" aria-hidden>
              <span
                className="absolute inset-y-0 left-0 rounded-r-[4px] bg-primary"
                style={{ width: `${(f.count / n) * 100}%` }}
              />
            </span>
            <span className="text-right font-mono text-[13px] tabular-nums">
              {fmt.format(f.count)} <span className="text-muted-foreground">{pct(f.share)}</span>
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

/** Column histogram of core_dev_percent in 10-point buckets, in pure SVG with theme tokens. */
function PercentHistogram() {
  const max = Math.max(1, ...percentBuckets.map((b) => b.count));
  const W = 400;
  const H = 180;
  const top = 18;
  const base = H - 22;
  const slot = W / percentBuckets.length;
  const bw = slot - 6;
  const unknown = stats.total - stats.percentKnown;
  return (
    <figure className="min-w-0 rounded-md border bg-card p-5 sm:p-6">
      <figcaption className="mb-1 font-heading text-2xl font-medium tracking-tight">Core translation, by 10 points</figcaption>
      <p className="mb-5 text-sm text-muted-foreground">
        Locales by percent of WordPress core (development branch) translated
        {unknown > 0 && <>; {fmt.format(unknown)} without a figure</>}.
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-labelledby="hist-desc">
        <desc id="hist-desc">
          {percentBuckets.map((b) => `${b.from} to ${b.to} percent: ${b.count} locales`).join("; ")}
        </desc>
        <line x1="0" x2={W} y1={base} y2={base} stroke="var(--border)" strokeWidth="1" />
        {percentBuckets.map((b, i) => {
          const h = (b.count / max) * (base - top);
          const x = i * slot + 3;
          return (
            <g key={b.from}>
              <title>{`${b.from} to ${b.to}%: ${b.count} locales`}</title>
              <rect x={i * slot} y={top - 16} width={slot} height={base - top + 16} fill="transparent" />
              {b.count > 0 && (
                <path
                  d={`M${x},${base} V${base - h + Math.min(4, h)} q0,-${Math.min(4, h)} ${Math.min(4, h)},-${Math.min(4, h)} H${x + bw - Math.min(4, h)} q${Math.min(4, h)},0 ${Math.min(4, h)},${Math.min(4, h)} V${base} Z`}
                  fill="var(--primary)"
                />
              )}
              <text
                x={x + bw / 2}
                y={base - h - 5}
                textAnchor="middle"
                fontSize="11"
                fill={b.count ? "var(--foreground)" : "var(--muted-foreground)"}
                className="font-mono tabular-nums"
              >
                {b.count}
              </text>
              <text x={x + bw / 2} y={H - 6} textAnchor="middle" fontSize="10.5" fill="var(--muted-foreground)">
                {b.from}
              </text>
            </g>
          );
        })}
      </svg>
      <p className={`mt-2 text-right ${label}`}>percent translated, bucket start</p>
    </figure>
  );
}

export function CoverageCharts() {
  return (
    <section aria-labelledby="coverage" className="space-y-4">
      <h2 id="coverage" className="font-heading text-3xl font-medium tracking-tight sm:text-[2.25rem]">
        Coverage at a glance
      </h2>
      <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
        <FeatureBars />
        <PercentHistogram />
      </div>
    </section>
  );
}
