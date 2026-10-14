import { memo, useState } from "react";
import { ArrowUpRight, Check, ChevronRight, Link as LinkIcon } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Table, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { StatusBadge } from "@/components/status-badge";
import { Truncated } from "@/components/truncated";
import { RowDetail } from "@/components/row-detail";
import { fmt, pageValue, type EnrichedRow } from "@/lib/data";
import { cn } from "@/lib/utils";

const COLS = 10;

function CopyLink({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${location.href.split("#")[0]}#${id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* clipboard blocked: the address bar still gets the link */
    }
    history.replaceState(null, "", `#${id}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-sm" onClick={copy} aria-label={`Copy link to this row`}>
          {copied ? <Check className="text-success" /> : <LinkIcon />}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">{copied ? "Link copied" : "Copy link"}</TooltipContent>
    </Tooltip>
  );
}

const SurfaceRow = memo(function SurfaceRow({
  row,
  open,
  onToggle,
  onJump,
}: {
  row: EnrichedRow;
  open: boolean;
  onToggle: (id: string, open: boolean) => void;
  onJump: (id: string) => void;
}) {
  const pages = pageValue(row);
  return (
    <Collapsible asChild open={open} onOpenChange={(o) => onToggle(row.id, o)}>
      <tbody className="border-b last:border-b-0">
        <TableRow
          id={row.id}
          aria-expanded={open}
          data-state={open ? "open" : "closed"}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a,button")) return;
            onToggle(row.id, !open);
          }}
          className={cn(
            "group cursor-pointer border-b-0 hover:bg-accent/60",
            open && "bg-accent hover:bg-accent",
          )}
        >
          <TableCell className="w-10 py-3 pr-0 pl-3 align-top">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`${open ? "Collapse" : "Expand"} ${row.name}`}
                className="text-muted-foreground"
              >
                <ChevronRight className={cn("transition-transform duration-150", open && "rotate-90 text-primary")} />
              </Button>
            </CollapsibleTrigger>
          </TableCell>
          <TableCell className="min-w-52 max-w-64 py-3 align-top whitespace-normal">
            {row.url ? (
              <a
                href={row.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground decoration-primary/40 underline-offset-2 hover:text-primary hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {row.name}
                <ArrowUpRight aria-hidden className="ml-0.5 inline size-3.5 align-[-2px] text-muted-foreground" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              <span className="font-medium">{row.name}</span>
            )}
          </TableCell>
          <TableCell className="py-3 align-top text-muted-foreground">
            <Truncated text={row.site_or_host} />
          </TableCell>
          <TableCell className="py-3 align-top">{row.sot_kind}</TableCell>
          <TableCell className="py-3 align-top">{row.import_kind}</TableCell>
          <TableCell className="py-3 align-top text-muted-foreground">
            <Truncated text={row.editing_path} />
          </TableCell>
          <TableCell className="py-3 align-top text-muted-foreground">
            <Truncated text={row.owner_team} limit={15} className="max-w-[13ch]" />
          </TableCell>
          <TableCell className="py-3 text-right align-top font-mono text-[13px] tabular-nums">
            {pages != null ? fmt.format(pages) : <span className="text-muted-foreground/60">–</span>}
          </TableCell>
          <TableCell className="py-3 align-top text-muted-foreground">
            <Truncated text={row.translation} />
          </TableCell>
          <TableCell className="py-3 pr-2 align-top">
            <div className="flex items-center justify-between gap-2">
              <StatusBadge status={row.status} />
              <CopyLink id={row.id} />
            </div>
          </TableCell>
        </TableRow>
        <CollapsibleContent asChild>
          <tr>
            <td colSpan={COLS} className="p-0">
              <RowDetail row={row} onJump={onJump} />
            </td>
          </tr>
        </CollapsibleContent>
      </tbody>
    </Collapsible>
  );
});

export function CategorySection({
  name,
  rows,
  openIds,
  onToggle,
  onJump,
}: {
  name: string;
  rows: EnrichedRow[];
  openIds: Set<string>;
  onToggle: (id: string, open: boolean) => void;
  onJump: (id: string) => void;
}) {
  const pages = rows.reduce((a, r) => a + (pageValue(r) ?? 0), 0);
  const slug = `cat-${name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
  return (
    <section aria-labelledby={slug}>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b pb-3">
        <h2 id={slug} className="font-heading text-3xl font-medium tracking-tight first-letter:uppercase sm:text-[2.25rem]">
          {name}
        </h2>
        <p className="text-sm text-muted-foreground tabular-nums">
          {rows.length} surface{rows.length === 1 ? "" : "s"}
          {pages > 0 && <> · {fmt.format(pages)} pages counted</>}
        </p>
      </div>
      <div className="overflow-hidden rounded-md border bg-card">
        <Table className="min-w-[1040px]">
          <TableHeader className="bg-surface">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">
                <span className="sr-only">Expand</span>
              </TableHead>
              {["Name", "Where it lives", "Source of truth", "Reaches the site by", "Edited by", "Owner"].map((h) => (
                <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {h}
                </TableHead>
              ))}
              <TableHead className="text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Pages
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Translation
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          {rows.map((r) => (
            <SurfaceRow key={r.id} row={r} open={openIds.has(r.id)} onToggle={onToggle} onJump={onJump} />
          ))}
        </Table>
      </div>
    </section>
  );
}

