import { Badge } from "@krowds/ui/components/badge";

const destructiveStatuses = new Set([
  "failed",
  "rejected",
  "revoked",
  "invalidated",
  "replacement_required",
]);

const positiveStatuses = new Set([
  "accepted",
  "active",
  "approved",
  "available",
  "paid",
  "used",
  "verified",
]);

function formatStatus(status: string) {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function StatusBadge({
  status,
  label,
}: {
  status: string;
  label?: string;
}) {
  const variant = destructiveStatuses.has(status)
    ? "destructive"
    : positiveStatuses.has(status)
      ? "default"
      : status === "closed" || status === "declined" || status === "expired"
        ? "secondary"
        : "outline";

  return <Badge variant={variant}>{label ?? formatStatus(status)}</Badge>;
}
