import { Badge } from "@krowds/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@krowds/ui/components/card";
import { Separator } from "@krowds/ui/components/separator";

const workstreams = [
  { label: "Commerce", value: "IDR orders", state: "Provider-backed" },
  { label: "Ticketing", value: "Named holders", state: "Single-use" },
  { label: "Fulfillment", value: "Wristband batches", state: "Accountable" },
  { label: "Access", value: "Online validation", state: "Fail closed" },
] as const;

export function OperatorPreview() {
  return (
    <Card className="overflow-hidden bg-foreground text-background ring-background/20">
      <CardHeader className="gap-4 border-b border-background/15">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant="secondary" className="w-fit">
            Illustrative operator view
          </Badge>
          <span className="font-mono text-xs text-background/70">KROWDS / OPS</span>
        </div>
        <CardTitle className="max-w-sm text-2xl leading-tight tracking-[-0.03em] text-background sm:text-3xl">
          One calm place to run the day.
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {workstreams.map((workstream) => (
            <div key={workstream.label} className="rounded-lg border border-background/15 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">{workstream.label}</p>
                <span className="size-1.5 rounded-full bg-background/70" />
              </div>
              <p className="mt-2 text-sm text-background/70">{workstream.value}</p>
              <p className="mt-3 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-background/65">
                {workstream.state}
              </p>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-background/15 p-4">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-background/65">
            Next safe handoff
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium">Keep the current state and next action visible.</p>
            <Badge variant="outline" className="w-fit border-background/25 text-background">
              Backend-owned
            </Badge>
          </div>
        </div>
        <Separator className="bg-background/20" />
        <p className="text-xs leading-5 text-background/70">
          The operator view previews the shape of the workspace. Provider, tenant, role, and access
          decisions remain backend-authoritative.
        </p>
      </CardContent>
    </Card>
  );
}
