import type { Metadata } from "next";
import Link from "next/link";

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

import { currentPrincipal, workQueues } from "@/lib/krew-fixtures";

export const metadata: Metadata = {
  title: "Operational queues",
  description: "Capability-scoped KREW work queues.",
};

export default function QueuesPage() {
  const openQueues = workQueues.filter((queue) => queue.state !== "clear");
  const clearQueues = workQueues.filter((queue) => queue.state === "clear");

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight">Operational queues</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Work is filtered to the fixture principal&apos;s server-issued
            capabilities. A visible queue does not authorize its next action.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{currentPrincipal.role}</Badge>
          <Badge variant="outline">{openQueues.length} active queues</Badge>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Queues requiring attention</CardTitle>
          <CardDescription>
            Oldest age is fixture data and does not represent a live SLA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 xl:grid-cols-2">
            {openQueues.map((queue) => (
              <li key={queue.id} className="rounded-lg bg-muted/45 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{queue.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Requires {queue.requiredCapability}
                    </p>
                  </div>
                  <Badge
                    variant={queue.state === "attention" ? "destructive" : "outline"}
                  >
                    {queue.count} open · oldest {queue.oldest}
                  </Badge>
                </div>
                <Link
                  href={queue.href}
                  className="mt-4 inline-flex min-h-9 items-center justify-center rounded-lg border px-3 text-sm font-medium outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  Open {queue.label.toLowerCase()}
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            Queue filters cannot bypass provider verification, quality control,
            or organization approval.
          </p>
        </CardFooter>
      </Card>

      {clearQueues.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Clear queues</CardTitle>
            <CardDescription>No fixture work is waiting.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted/45 p-5">
              <p className="font-medium">No restricted exports are waiting</p>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                New work will appear only after the backend accepts the current
                role, organization context, and request.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" disabled>
              Refresh from backend
            </Button>
          </CardFooter>
        </Card>
      ) : null}
    </div>
  );
}
