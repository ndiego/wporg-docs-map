import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/** A table cell value clipped to one line; the full text shows in a tooltip when it is long. */
export function Truncated({ text, className, limit = 17 }: { text: string | null; className?: string; limit?: number }) {
  if (!text) return <span className="text-muted-foreground/60" aria-label="not recorded">–</span>;
  const span = <span className={cn("block max-w-[15ch] truncate", className)}>{text}</span>;
  if (text.length <= limit) return span;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{span}</TooltipTrigger>
      <TooltipContent side="top" align="start" className="max-w-sm text-pretty leading-relaxed">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}
