import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Status } from "@/lib/data";

const tone: Record<Status, string> = {
  active: "border-success/40 bg-success/10 text-success",
  stale: "border-warning/40 bg-warning/10 text-warning",
  frozen: "border-danger/40 bg-danger/10 text-danger",
  archived: "border-danger/40 bg-danger/10 text-danger",
  proposed: "border-neutral-status/40 bg-neutral-status/10 text-neutral-status",
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <Badge variant="outline" className={cn("rounded-sm font-medium capitalize", tone[status], className)}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {status}
    </Badge>
  );
}
