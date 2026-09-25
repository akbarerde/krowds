import { Badge } from "@krowds/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@krowds/ui/components/card";
import { Separator } from "@krowds/ui/components/separator";

const statusCards = [
  { label: "Catalog", value: "Published", detail: "Events and sessions" },
  { label: "Commerce", value: "IDR orders", detail: "Provider-backed state" },
  { label: "Fulfillment", value: "Traceable", detail: "Ticket to wristband" },
  { label: "Access", value: "Online only", detail: "Single-use decision" },
] as const;

const flow = [
  { label: "Order received", detail: "Order context is recorded", status: "Recorded" },
  { label: "Payment verified", detail: "Provider state becomes visible", status: "Verified" },
  { label: "Ticket issued", detail: "Entitlement follows the order", status: "Current" },
  { label: "Access checked", detail: "Current state decides the next action", status: "Next" },
] as const;

export function OperatorConsolePreview() {
  return (
    <Card className="overflow-hidden" aria-label="Illustrative KROWDS operator console">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Operations / event day
            </p>
            <CardTitle className="mt-2 text-2xl tracking-[-0.03em]">One operating picture</CardTitle>
          </div>
          <Badge variant="outline">Illustrative UI</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {statusCards.map((status) => (
            <div key={status.label} className="bg-background p-4">
              <p className="text-xs text-muted-foreground">{status.label}</p>
              <p className="mt-2 text-sm font-semibold">{status.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{status.detail}</p>
            </div>
          ))}
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Product flow
            </p>
            <span className="text-xs text-muted-foreground">Backend-owned states</span>
          </div>
          <ol className="mt-3 divide-y border-y">
            {flow.map((item) => (
              <li key={item.label} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
                </div>
                <Badge variant={item.status === "Current" ? "default" : "outline"}>
                  {item.status}
                </Badge>
              </li>
            ))}
          </ol>
        </div>

        <Separator />
        <p className="text-xs leading-5 text-muted-foreground">
          Synthetic preview of the operator surface. Provider, tenant, role, fulfillment, and
          access decisions remain backend-authoritative.
        </p>
      </CardContent>
    </Card>
  );
}
