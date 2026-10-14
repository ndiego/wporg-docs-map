import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tone: Record<string, string> = {
  active: "border-success/40 bg-success/10 text-success",
  inactive: "border-warning/40 bg-warning/10 text-warning",
  redirect: "border-neutral-status/40 bg-neutral-status/10 text-neutral-status",
  error: "border-danger/40 bg-danger/10 text-danger",
};

export function SiteStatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn("rounded-sm font-medium capitalize", tone[status] ?? tone.redirect, className)}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {status}
    </Badge>
  );
}
