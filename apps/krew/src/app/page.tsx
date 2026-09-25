import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@krowds/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@krowds/ui/components/card";

import {
  auditEvents,
  currentPrincipal,
  organizationContext,
  sensitiveActionGates,
  workQueues,
} from "@/lib/krew-fixtures";

export const metadata: Metadata = {
  title: "Operations overview",
  description: "Role-scoped KREW operational posture and priority work.",
};

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 border-b pb-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight">
            Operations desk
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            A read-only operational view for {organizationContext.name}. All
            records are synthetic, belong to one fixture organization, and
            contain no production customer data.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 xl:items-end">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{currentPrincipal.role} fixture</Badge>
            <Badge variant="outline">MFA verified</Badge>
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            req_fixture_01J2A8Q4M7
          </p>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.75fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Priority work</CardTitle>
            <CardDescription>
              Queue counts are fixture assertions, not live authorization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {workQueues
                .filter((queue) => queue.state !== "clear")
                .map((queue) => (
                  <li
                    key={queue.id}
                    className="flex flex-col gap-3 rounded-lg bg-muted/45 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{queue.label}</p>
                        <Badge
                          variant={
                            queue.state === "attention" ? "destructive" : "outline"
                          }
                        >
                          {queue.state === "attention" ? "Needs attention" : "In progress"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Oldest item {queue.oldest} · requires {queue.requiredCapability}
                      </p>
                    </div>
                    <Link
                      href={queue.href}
                      className="inline-flex min-h-9 items-center justify-center rounded-lg border px-3 text-sm font-medium outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      Open queue
                    </Link>
                  </li>
                ))}
            </ul>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              Queue membership never grants permission to complete an action.
            </p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Authority boundary</CardTitle>
            <CardDescription>
              Sensitive work remains fail-closed without backend assertions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-4">
              {sensitiveActionGates.map((gate) => (
                <li key={gate.id} className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">{gate.action}</p>
                    <Badge
                      variant={
                        gate.state === "blocked_in_fixture"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {gate.state.replaceAll("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-xs leading-5 text-muted-foreground">
                    {gate.outcome}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Link
              href="/access"
              className="text-sm font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Review control states
            </Link>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent evidence</CardTitle>
          <CardDescription>
            Safe event metadata with explicit redaction markers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 lg:grid-cols-2">
            {auditEvents.slice(0, 4).map((event) => (
              <li key={event.id} className="rounded-lg bg-muted/45 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-mono text-xs font-medium">{event.action}</p>
                  <Badge
                    variant={event.outcome === "denied" ? "destructive" : "outline"}
                  >
                    {event.outcome}
                  </Badge>
                </div>
                <p className="mt-2 text-sm">{event.target}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {event.requestId}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Redacted: {event.redactions.join(", ")}
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Link
            href="/audit"
            className="text-sm font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Open audit evidence
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
