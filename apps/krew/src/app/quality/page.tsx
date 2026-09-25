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

import { qualityInspections } from "@/lib/krew-fixtures";

export const metadata: Metadata = {
  title: "Quality control",
  description: "Wristband inspection, quarantine, and evidence workspace.",
};

const inspectionChecks = [
  "Quantity and batch identity",
  "Material and artwork approval",
  "Human-readable wristband code",
  "QR scan sample",
  "Evidence and exception notes",
] as const;

export default function QualityPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight">Quality control</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Record only minimized inspection outcomes. Failed checks quarantine
            a batch before allocation, shipment, or activation.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">1 pending</Badge>
          <Badge variant="destructive">1 quarantined</Badge>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(20rem,0.7fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Inspection queue</CardTitle>
            <CardDescription>
              A result is valid only after backend authorization and audit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {qualityInspections.map((inspection) => (
                <li key={inspection.id} className="rounded-lg bg-muted/45 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-mono text-xs font-medium">{inspection.id}</p>
                      <p className="mt-2 font-medium">{inspection.check}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {inspection.batchId} · inspector {inspection.inspector ?? "unassigned"}
                      </p>
                    </div>
                    <Badge
                      variant={
                        inspection.result === "quarantined"
                          ? "destructive"
                          : inspection.result === "passed"
                            ? "outline"
                            : "secondary"
                      }
                    >
                      {inspection.result}
                    </Badge>
                  </div>
                  <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
                    <p>
                      <span className="text-muted-foreground">Evidence: </span>
                      {inspection.evidenceCount} safe artifacts
                    </p>
                    <p className="font-mono text-muted-foreground">
                      {inspection.correlationId}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" disabled>
              Record quality result
            </Button>
          </CardFooter>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Inspection checklist</CardTitle>
              <CardDescription>
                Fixture evidence excludes personal and credential values.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-3">
                {inspectionChecks.map((check, index) => (
                  <li key={check} className="flex items-start gap-3 text-sm">
                    <Badge variant="outline">{index + 1}</Badge>
                    <span>{check}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Release-ready batches</CardTitle>
              <CardDescription>No fixture batch is currently releasable.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-muted/45 p-5">
                <p className="font-medium">Nothing ready to release</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  A pending inspection or quarantine remains a hard stop until
                  the backend records the required evidence.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
