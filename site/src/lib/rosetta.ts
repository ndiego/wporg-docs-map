// The Rosetta dataset, imported at build time. To work on the page without it, point this at
// "@/fixtures/rosetta.sample.json" (ten locales with clearly fake values).
import raw from "@data/rosetta.json";

export type SiteStatus = "active" | "inactive" | "redirect" | "error";

export interface Locale {
  locale: string;
  subdomain: string | null;
  english_name: string;
  native_name: string;
  url: string | null;
  site_status: SiteStatus;
  home: { posts: number | null; pages: number | null; newest_post: string | null; types?: string[] };
  support: {
    exists: boolean;
    forums: boolean | null;
    helphub_articles: number | null;
    helphub_versions: number | null;
    newest_article: string | null;
  };
  team: { exists: boolean; posts: number | null; handbook_pages: number | null; newest_post: string | null };
  translation: { core_dev_percent: number | null; localized_package: boolean | null; contributors: number | null };
  features: Record<string, boolean>;
  notes: string | null;
  evidence: string[];
  probe?: Record<string, unknown>;
}

export interface EnrichedLocale extends Locale {
  /** Row id and deep-link anchor: the subdomain, or the locale code if two rows share a subdomain. */
  anchor: string;
  newest: string | null;
  featureCount: number;
  haystack: string;
}

interface RosettaData {
  generated: string;
  main_site_features: string[];
  locales: Locale[];
  /** Translation teams with no locale site at all (present in the real dataset, not in the fixture). */
  no_site_locales?: { locale: string; english_name: string; native_name: string }[];
}

const data = raw as unknown as RosettaData;

export const generated = data.generated;
export const features = data.main_site_features;
export const noSiteLocales = data.no_site_locales ?? [];

const STATUS_ORDER: SiteStatus[] = ["active", "inactive", "redirect", "error"];
export const statusRank = (s: string) => {
  const i = STATUS_ORDER.indexOf(s as SiteStatus);
  return i === -1 ? STATUS_ORDER.length : i;
};

/** "helphub articles" -> "HelpHub articles", "team p2" -> "Team P2". */
export function featureLabel(f: string): string {
  const s = f.replace(/helphub/gi, "HelpHub").replace(/\bp2\b/gi, "P2");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function maxDate(...ds: (string | null | undefined)[]): string | null {
  const v = ds.filter((d): d is string => !!d).sort();
  return v.length ? v[v.length - 1] : null;
}

const subCount = new Map<string, number>();
for (const l of data.locales) if (l.subdomain) subCount.set(l.subdomain, (subCount.get(l.subdomain) ?? 0) + 1);

export const locales: EnrichedLocale[] = data.locales.map((l) => {
  const feats = l.features ?? {};
  return {
    ...l,
    evidence: l.evidence ?? [],
    anchor: !l.subdomain || (subCount.get(l.subdomain) ?? 0) > 1 ? l.locale : l.subdomain,
    newest: maxDate(l.home?.newest_post, l.support?.newest_article, l.team?.newest_post),
    featureCount: features.filter((f) => feats[f] === true).length,
    haystack: [l.native_name, l.english_name, l.locale, l.subdomain, l.url].filter(Boolean).join(" ").toLowerCase(),
  };
});

export const byAnchor: Record<string, EnrichedLocale> = Object.fromEntries(locales.map((l) => [l.anchor, l]));

export const statuses = [...new Set(locales.map((l) => l.site_status))].sort((a, b) => statusRank(a) - statusRank(b));

export const has = {
  helphub: (l: Locale) => (l.support?.helphub_articles ?? 0) > 0,
  forums: (l: Locale) => l.support?.forums === true,
  handbook: (l: Locale) => (l.team?.handbook_pages ?? 0) > 0,
  pkg: (l: Locale) => l.translation?.localized_package === true,
};

function median(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const percents = locales.map((l) => l.translation?.core_dev_percent).filter((p): p is number => typeof p === "number");

export const stats = {
  total: locales.length,
  active: locales.filter((l) => l.site_status === "active").length,
  helphub: locales.filter(has.helphub).length,
  forums: locales.filter(has.forums).length,
  handbook: locales.filter(has.handbook).length,
  pkg: locales.filter(has.pkg).length,
  medianPercent: median(percents),
  percentKnown: percents.length,
};

export const featureCoverage = features.map((f) => {
  const n = locales.filter((l) => l.features?.[f] === true).length;
  return { feature: f, label: featureLabel(f), count: n, share: locales.length ? n / locales.length : 0 };
});

/** core_dev_percent in 10-point buckets: 0-9, 10-19 ... 90-100 (100 joins the last bucket). */
export const percentBuckets = Array.from({ length: 10 }, (_, i) => ({
  from: i * 10,
  to: i === 9 ? 100 : i * 10 + 9,
  count: percents.filter((p) => Math.min(9, Math.floor(p / 10)) === i).length,
}));

export const fmt = new Intl.NumberFormat("en-US");
export const pct = (share: number) => `${Math.round(share * 100)}%`;

const lowerFirst = (s: string) => (/^HelpHub/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1));

/** One-line readings of the largest gaps against the main site, computed from the data. */
export function gapReadings(): string[] {
  const n = stats.total;
  const out: string[] = [];
  const helphubCounts = locales.map((l) => l.support?.helphub_articles ?? 0).filter((c) => c > 0);
  const biggest = [...locales].sort((a, b) => (b.support?.helphub_articles ?? 0) - (a.support?.helphub_articles ?? 0))[0];
  if (helphubCounts.length) {
    const big = helphubCounts.filter((c) => c >= 100).length;
    out.push(
      `HelpHub articles exist on ${stats.helphub} of ${n} locale sites; ${big} ha${big === 1 ? "s" : "ve"} 100 or more, and the largest is ${biggest.english_name} with ${fmt.format(biggest.support.helphub_articles ?? 0)}.`,
    );
  } else {
    out.push(`No locale site has HelpHub articles.`);
  }
  const handbookPages = locales.map((l) => l.team?.handbook_pages ?? 0).filter((c) => c > 0);
  const teamSites = locales.filter((l) => l.team?.exists).length;
  out.push(
    `${teamSites} of ${n} locales run a team site and ${stats.handbook} keep a team handbook${
      handbookPages.length ? ` (median ${fmt.format(median(handbookPages) ?? 0)} pages)` : ""
    }.`,
  );
  out.push(`Support forums run on ${stats.forums} of ${n} locale sites.`);
  const lowest = [...featureCoverage].sort((a, b) => a.count - b.count)[0];
  if (lowest && !/helphub articles|team handbook|support forums/i.test(lowest.feature)) {
    out.push(`The rarest main-site feature is ${lowerFirst(lowest.label)}, on ${lowest.count} of ${n} (${pct(lowest.share)}).`);
  }
  if (noSiteLocales.length) {
    out.push(
      `${noSiteLocales.length} more translation team${noSiteLocales.length === 1 ? " has" : "s have"} no locale site at all, so ${noSiteLocales.length === 1 ? "it does" : "they do"} not appear in the table.`,
    );
  }
  if (stats.medianPercent != null) {
    const full = percents.filter((p) => p >= 95).length;
    out.push(
      `Core is ${full >= 1 ? `at least 95% translated for ${full} of ${stats.percentKnown} locales with a figure` : "below 95% translated everywhere"}; the median is ${stats.medianPercent.toFixed(1)}%.`,
    );
  }
  return out;
}
