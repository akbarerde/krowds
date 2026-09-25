import type { Metadata } from "next";

import { Badge } from "@krowds/ui/components/badge";
import { Button } from "@krowds/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@krowds/ui/components/card";

import { auditEvents, organizationContext } from "@/lib/krew-fixtures";

export const metadata: Metadata = {
  title: "Audit evidence",
  description: "Redacted KREW audit events with request and trace correlation.",
};

export default function AuditPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight">Audit evidence</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Append-only business and security evidence for {organizationContext.id},
            with request and trace correlation and explicit redaction markers.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">4 fixture events</Badge>
          <Badge variant="outline">Restricted view</Badge>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Correlated event trail</CardTitle>
          <CardDescription>
            Actor, target, outcome, reason, request, trace, and safe redaction
            metadata only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-4">
            {auditEvents.map((event) => (
              <li key={event.id} className="rounded-lg bg-muted/45 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono text-xs font-medium">{event.id}</p>
                      <Badge
                        variant={event.outcome === "denied" ? "destructive" : "outline"}
                      >
                        {event.outcome}
                      </Badge>
                    </div>
                    <p className="mt-2 font-mono text-sm font-medium">{event.action}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {event.actor} → {event.target}
                    </p>
                  </div>
                  <div className="shrink-0 text-xs text-muted-foreground lg:text-right">
                    <p>{event.occurredAt}</p>
                    <p className="mt-1 font-mono">{event.reasonCode}</p>
                  </div>
                </div>

                <dl className="mt-4 grid gap-3 text-xs md:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Request ID</dt>
                    <dd className="mt-1 font-mono">{event.requestId}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Trace ID</dt>
                    <dd className="mt-1 font-mono">{event.traceId}</dd>
                  </div>
                </dl>
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  Redacted before display: {event.redactions.join(", ")}
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button variant="outline" disabled>
            Load more from backend
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Case-scoped evidence</CardTitle>
          <CardDescription>No additional events match the fixture filter.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted/45 p-5">
            <p className="font-medium">No hidden evidence is shown</p>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
              A new investigation must use a case ID and least-privilege access.
              The browser cannot request unrestricted database, identity, or
              personal-data history.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
