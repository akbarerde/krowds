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

import {
  authorityAssertions,
  currentPrincipal,
  organizationContext,
  sensitiveActionGates,
} from "@/lib/krew-fixtures";

export const metadata: Metadata = {
  title: "Access controls",
  description: "Fail-closed MFA, step-up, dual approval, and break-glass states.",
};

const assertionRows = [
  ["MFA", authorityAssertions.mfa],
  ["Step-up", authorityAssertions.stepUp],
  ["Dual approval", authorityAssertions.dualApproval],
  ["Break-glass", authorityAssertions.breakGlass],
] as const;

export default function AccessPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight">Access controls</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Confirmation states are backend assertions. There is intentionally no
            browser switch that grants a role, approves an action, or activates
            break-glass access.
          </p>
        </div>
        <Badge variant="destructive">Browser authorization disabled</Badge>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(19rem,0.72fr)_minmax(0,1.28fr)]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Fixture principal</CardTitle>
              <CardDescription>
                Server-issued display context for {organizationContext.id}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="flex flex-col gap-4 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Actor</dt>
                  <dd className="mt-1 font-medium">{currentPrincipal.displayName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Fixed role</dt>
                  <dd className="mt-1 font-mono">{currentPrincipal.role}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Capabilities</dt>
                  <dd className="mt-1 leading-6">
                    {currentPrincipal.capabilities.join(", ")}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Authority assertions</CardTitle>
              <CardDescription>
                Only the Go backend can replace these fixture values.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-4">
                {assertionRows.map(([label, assertion]) => (
                  <li key={label} className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium">{label}</p>
                      <Badge
                        variant={
                          assertion.state === "verified_in_fixture"
                            ? "outline"
                            : assertion.state === "inactive"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {assertion.state.replaceAll("_", " ")}
                      </Badge>
                    </div>
                    {"verifiedAt" in assertion ? (
                      <p className="font-mono text-xs text-muted-foreground">
                        {assertion.verifiedAt}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No browser fallback is available.
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sensitive action confirmations</CardTitle>
            <CardDescription>
              Each command remains blocked until every backend control passes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-4">
              {sensitiveActionGates.map((gate) => (
                <li key={gate.id} className="rounded-lg bg-muted/45 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium">{gate.action}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Capability {gate.capability}
                      </p>
                    </div>
                    <Badge
                      variant={
                        gate.state === "blocked_in_fixture" ? "destructive" : "secondary"
                      }
                    >
                      {gate.state.replaceAll("_", " ")}
                    </Badge>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {gate.outcome}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {gate.controls.map((control) => (
                      <Badge key={control} variant="outline">
                        {control.replaceAll("_", " ")}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-mono text-xs text-muted-foreground">
                      {gate.correlationId}
                    </p>
                    <Button
                      variant={
                        gate.id === "gate_break_glass" ? "destructive" : "outline"
                      }
                      disabled
                      aria-describedby={`${gate.id}-outcome`}
                    >
                      Confirm with backend
                    </Button>
                  </div>
                  <p id={`${gate.id}-outcome`} className="sr-only">
                    This fixture cannot satisfy the required backend controls.
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <p className="text-xs leading-5 text-muted-foreground">
              Real commands must carry an auditable reason, current row version,
              and idempotency key where applicable. Browser confirmation alone is
              never sufficient.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
