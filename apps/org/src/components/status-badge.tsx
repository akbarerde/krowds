import { Badge } from "@krowds/ui/components/badge";

const destructiveStatuses = new Set([
  "blocked",
  "denied",
  "expired",
  "failed",
  "invalidated",
  "rejected",
  "replacement_required",
  "revoked",
  "suspended",
]);

const positiveStatuses = new Set([
  "accepted",
  "active",
  "approved",
  "available",
  "paid",
  "verified",
]);

const mutedStatuses = new Set([
  "closed",
  "declined",
  "invited",
  "pending",
  "revision_required",
  "submitted",
  "under_review",
  "used",
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
      : mutedStatuses.has(status)
        ? "secondary"
        : "outline";

  return <Badge variant={variant}>{label ?? formatStatus(status)}</Badge>;
}
