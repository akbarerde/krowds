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

import { fulfillmentBatches } from "@/lib/krew-fixtures";

export const metadata: Metadata = {
  title: "Fulfillment and batches",
  description: "Production, quality, and shipment state for wristband batches.",
};

export default function FulfillmentPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight">
            Fulfillment and batches
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Track production output through quality control and verified
            shipment without exposing private files or QR credentials.
          </p>
        </div>
        <Badge variant="outline">No production file in fixture</Badge>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        {fulfillmentBatches.map((batch) => (
          <Card key={batch.id}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="font-mono">{batch.id}</CardTitle>
                  <CardDescription className="mt-1">{batch.orderId}</CardDescription>
                </div>
                <Badge
                  variant={
                    batch.state === "quarantined" ? "destructive" : "secondary"
                  }
                >
                  {batch.state.replaceAll("_", " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted-foreground">Quantity</dt>
                  <dd className="mt-1 font-medium tabular-nums">
                    {batch.quantity.toLocaleString("id-ID")}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Material</dt>
                  <dd className="mt-1 text-sm">{batch.material}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Quality</dt>
                  <dd className="mt-1">
                    <Badge
                      variant={
                        batch.quality === "quarantined" ? "destructive" : "outline"
                      }
                    >
                      {batch.quality}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Shipment</dt>
                  <dd className="mt-1 text-sm capitalize">
                    {batch.shipmentState.replaceAll("_", " ")}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 rounded-lg bg-muted/45 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">Private production file</p>
                  <Badge variant="outline">
                    {batch.productionFile.replaceAll("_", " ")}
                  </Badge>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  A real file requires a short-lived backend URL and an audited
                  access event. This fixture contains no file name, QR payload,
                  wristband code, or signed URL.
                </p>
              </div>

              <p className="mt-4 font-mono text-xs text-muted-foreground">
                {batch.correlationId}
              </p>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Button variant="outline" disabled>
                Request production file
              </Button>
              <p className="text-xs text-muted-foreground">
                Requires backend capability and audit acceptance
              </p>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fulfillment safeguards</CardTitle>
          <CardDescription>
            Provider and quality evidence remain authoritative.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm font-medium">Quarantine first</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              A failed sample blocks allocation, shipment, and activation.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Provider state is verified</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              A courier label or browser callback cannot mark an order delivered.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Evidence stays minimized</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Object references and hashes may be audited; credentials may not.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
