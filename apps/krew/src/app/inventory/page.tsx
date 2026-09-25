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

import { inventorySnapshot } from "@/lib/krew-fixtures";

export const metadata: Metadata = {
  title: "Inventory reconciliation",
  description: "KREW wristband stock, quarantine, and reconciliation state.",
};

const number = new Intl.NumberFormat("id-ID");

const stockStates = [
  ["Available", inventorySnapshot.available, "Eligible for allocation"],
  ["Allocated", inventorySnapshot.allocated, "Reserved to approved orders"],
  ["Pending quality", inventorySnapshot.pendingQuality, "Not available"],
  ["Quarantined", inventorySnapshot.quarantined, "Blocked pending resolution"],
  ["Shipped", inventorySnapshot.shipped, "Not yet delivered or activated"],
] as const;

export default function InventoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight">
            Inventory reconciliation
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Quantity states follow the backend ledger. The browser does not
            infer availability from a cached page or a client-side adjustment.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">As of {inventorySnapshot.asOf}</Badge>
          <Badge variant="secondary">Delta {inventorySnapshot.unexplainedDelta}</Badge>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Stock ledger</CardTitle>
          <CardDescription>
            {number.format(inventorySnapshot.totalProduced)} total produced units
            across explicit states.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {stockStates.map(([label, value, description]) => (
              <div key={label} className="rounded-lg bg-muted/45 p-4">
                <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
                <dd className="mt-2 text-2xl font-semibold tabular-nums">
                  {number.format(value)}
                </dd>
                <dd className="mt-1 text-xs leading-5 text-muted-foreground">
                  {description}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            Current allocation equation: available + allocated + pending quality
            + quarantined + shipped = total produced.
          </p>
        </CardFooter>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Reconciliation checks</CardTitle>
            <CardDescription>
              Evidence spans order, batch, shipment, delivery, and activation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {[
                ["Order quantity", "250 units", "WO-FX-1042"],
                ["Production quantity", "250 units", "BAT-FX-8801"],
                ["Quality pending", "250 units", "QC-FX-3108"],
                ["Unexplained delta", "0 units", "Fixture check passed"],
              ].map(([label, value, reference]) => (
                <li
                  key={label}
                  className="grid gap-2 rounded-lg bg-muted/45 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"
                >
                  <span className="text-sm font-medium">{label}</span>
                  <span className="text-sm tabular-nums">{value}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {reference}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory adjustment</CardTitle>
            <CardDescription>
              A controlled mutation, not a browser-side toggle.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <p>
              The fixture has no adjustment form because a safe write requires
              backend permission, a reason, current row version, and an
              idempotency key.
            </p>
            <p className="text-xs leading-5 text-muted-foreground">
              No control on this page can mark stock available, activate a
              batch, or change an order state.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="destructive" disabled>
              Record inventory adjustment
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
