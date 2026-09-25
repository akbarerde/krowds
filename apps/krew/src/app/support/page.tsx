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

import { supportCases } from "@/lib/krew-fixtures";

export const metadata: Metadata = {
  title: "Quality and support",
  description: "Redacted KREW support cases and controlled responses.",
};

export default function SupportPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight">Quality and support</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Investigate operational issues with safe summaries, case-scoped
            evidence, and no unrestricted personal-data access.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">2 active</Badge>
          <Badge variant="outline">PII redacted</Badge>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Support casework</CardTitle>
          <CardDescription>
            Messages and provider payloads remain outside this summary.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 xl:grid-cols-3">
            {supportCases.map((supportCase) => (
              <li key={supportCase.id} className="rounded-lg bg-muted/45 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-mono text-xs font-medium">{supportCase.id}</p>
                  <Badge
                    variant={supportCase.priority === "urgent" ? "destructive" : "outline"}
                  >
                    {supportCase.priority}
                  </Badge>
                </div>
                <p className="mt-3 font-medium">{supportCase.subject}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {supportCase.status.replaceAll("_", " ")} · owner {supportCase.owner ?? "unassigned"}
                </p>
                <p className="mt-3 font-mono text-xs text-muted-foreground">
                  {supportCase.correlationId}
                </p>
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  Redacted: {supportCase.redaction.join(", ")}
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button variant="outline" disabled>
            Send backend-controlled response
          </Button>
        </CardFooter>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Support boundary</CardTitle>
            <CardDescription>
              The browser cannot impersonate a backend response.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm leading-6 text-muted-foreground">
            <p>
              Support can reconcile a verified provider projection, quarantine
              stock, or open an operations case. It cannot mark a payment paid,
              grant access, or fabricate provider delivery evidence.
            </p>
            <p>
              Any outbound message must use the Go-owned notification boundary
              and an approved template.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy escalations</CardTitle>
            <CardDescription>No fixture escalation is waiting.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted/45 p-5">
              <p className="font-medium">No privacy incidents in this view</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Suspected exposure or inappropriate access requires the approved
                incident path, not a support reply.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
