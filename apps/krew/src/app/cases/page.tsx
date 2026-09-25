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

import { operationsCases } from "@/lib/krew-fixtures";

export const metadata: Metadata = {
  title: "Cases and incidents",
  description: "Redacted KREW case and incident workspace.",
};

export default function CasesPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight">Cases and incidents</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Consumer identity review, fulfillment exceptions, and incident
            containment use separate case records with least-privilege evidence.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">3 open fixtures</Badge>
          <Badge variant="outline">PII minimized</Badge>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Active casework</CardTitle>
            <CardDescription>
              Claims and decisions require backend permission and optimistic
              concurrency.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-4">
              {operationsCases.map((operationsCase) => (
                <li key={operationsCase.id} className="rounded-lg bg-muted/45 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-mono text-xs font-medium">
                          {operationsCase.id}
                        </p>
                        <Badge
                          variant={
                            operationsCase.severity === "high"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {operationsCase.severity}
                        </Badge>
                      </div>
                      <p className="mt-2 font-medium">{operationsCase.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {operationsCase.kind.replaceAll("_", " ")} · owner {operationsCase.owner ?? "unassigned"}
                      </p>
                    </div>
                    <div className="shrink-0 text-left sm:text-right">
                      <Badge variant="secondary">
                        {operationsCase.status.replaceAll("_", " ")}
                      </Badge>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Next checkpoint {operationsCase.due}
                      </p>
                    </div>
                  </div>
                  <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground">Evidence</dt>
                      <dd className="mt-0.5 font-mono">
                        {operationsCase.evidenceCount} safe artifacts
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Correlation</dt>
                      <dd className="mt-0.5 font-mono">
                        {operationsCase.correlationId}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">
                    Redacted before display: {operationsCase.redaction.join(", ")}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" disabled>
              Open backend case command
            </Button>
          </CardFooter>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Case boundary</CardTitle>
              <CardDescription>
                A claim never grants unrelated record access.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <p>
                Identity review is separate from organization onboarding. A
                pending or rejected identity cannot support ticket issuance or
                wristband binding.
              </p>
              <p className="text-xs leading-5 text-muted-foreground">
                Reviewer notes, identity numbers, legal names, email addresses,
                and provider payloads are excluded from this ordinary view.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Closed cases</CardTitle>
              <CardDescription>No records match this fixture filter.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-muted/45 p-5">
                <p className="font-medium">Nothing closed today</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Closed cases remain available through audited case history
                  when the backend contract is connected.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
