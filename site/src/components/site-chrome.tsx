import type { ReactNode } from "react";
import { Braces, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

export const REPO = "https://github.com/ndiego/wporg-docs-map";
export const CORRECTION = `${REPO}/issues/new?template=correction.yml`;

export type PageKey = "map" | "rosetta";

/** Relative links between the two pages, so both work under any base path (GitHub Pages, Spacefast, a local server). */
const PAGES: { key: PageKey; label: string; short: string; href: Record<PageKey, string> }[] = [
  { key: "map", label: "Documentation map", short: "Docs map", href: { map: "./", rosetta: "../" } },
  { key: "rosetta", label: "Rosetta sites", short: "Rosetta", href: { map: "rosetta/", rosetta: "./" } },
];

export function GithubMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden {...props}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

export function SkipLink({ children }: { children: ReactNode }) {
  return (
    <a
      href="#main"
      className="sr-only z-50 rounded-sm bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
    >
      {children}
    </a>
  );
}

/** Local navigation bar, after WordPress.org's charcoal section headers. */
export function TopBar({ current, dataHref }: { current: PageKey; dataHref: string }) {
  const { theme, toggle } = useTheme();
  return (
    <div className="bg-[#1e1e1e] text-white dark:border-b dark:bg-[#151515]">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <p className="hidden shrink-0 text-[15px] font-medium tracking-tight md:block">WordPress.org</p>
          <nav aria-label="Pages" className="flex min-w-0 items-center gap-0.5 rounded-sm bg-white/5 p-0.5 ring-1 ring-white/10">
            {PAGES.map((p) => {
              const on = p.key === current;
              return (
                <a
                  key={p.key}
                  href={p.href[current]}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "rounded-[3px] px-2.5 py-1 text-[13px] font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white",
                    on ? "bg-white text-[#1e1e1e]" : "text-white/70 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <span className="hidden sm:inline">{p.label}</span>
                  <span className="sm:hidden">{p.short}</span>
                </a>
              );
            })}
          </nav>
        </div>
        <nav aria-label="Project" className="flex shrink-0 items-center gap-1">
          <Button asChild variant="ghost" size="sm" className="text-white/80 hover:bg-white/10 hover:text-white">
            <a href={dataHref} aria-label="Data (JSON)">
              <Braces /> <span className="hidden sm:inline">Data</span>
            </a>
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-white/80 hover:bg-white/10 hover:text-white">
            <a href={REPO} target="_blank" rel="noopener noreferrer" aria-label="GitHub (opens in a new tab)">
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
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <Card className="gap-1 py-5 shadow-none ring-border">
      <CardContent className="px-4 sm:px-5">
        <p className="font-heading text-3xl leading-none font-medium whitespace-nowrap tabular-nums sm:text-4xl">{value}</p>
        <p className="mt-2 text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

export interface FooterLink {
  href: string;
  label: string;
  external?: boolean;
}

export function SiteFooter({ heading, children, links }: { heading: string; children: ReactNode; links: FooterLink[] }) {
  return (
    <footer className="border-t bg-surface">
      <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-12 text-sm text-muted-foreground sm:px-8 md:grid-cols-[2fr_1fr]">
        <div className="max-w-[70ch] space-y-3 leading-relaxed">
          <p className="font-heading text-2xl text-foreground">{heading}</p>
          {children}
        </div>
        <ul className="space-y-2">
          {links.map((l) => (
            <li key={l.href}>
              <a
                className="text-primary underline-offset-2 hover:underline"
                href={l.href}
                {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {l.label}
                {l.external && <span className="sr-only"> (opens in a new tab)</span>}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
