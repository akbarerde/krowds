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

import { wristbandOrders } from "@/lib/krew-fixtures";

export const metadata: Metadata = {
  title: "Wristband orders",
  description: "KREW verification and fulfillment state for wristband orders.",
};

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight">Wristband orders</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Review paid orders without treating a browser response or staff
            entry as payment authority.
          </p>
        </div>
        <Badge variant="outline">IDR only · fixture records</Badge>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        {wristbandOrders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="font-mono">{order.id}</CardTitle>
                  <CardDescription className="mt-1">
                    Updated {order.updatedAt}
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    order.state === "quality_control" ? "secondary" : "outline"
                  }
                >
                  {order.state.replaceAll("_", " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted-foreground">Order total</dt>
                  <dd className="mt-1 font-medium tabular-nums">
                    {rupiah.format(order.totalIdr)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Quantity</dt>
                  <dd className="mt-1 font-medium tabular-nums">
                    {order.quantity.toLocaleString("id-ID")} wristbands
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Payment evidence</dt>
                  <dd className="mt-1">
                    <Badge
                      variant={
                        order.paymentEvidence === "provider_verified"
                          ? "outline"
                          : "secondary"
                      }
                    >
                      {order.paymentEvidence.replaceAll("_", " ")}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Batches</dt>
                  <dd className="mt-1 font-mono text-sm">
                    {order.batchIds.join(", ")}
                  </dd>
                </div>
              </dl>
              <div className="mt-5 rounded-lg bg-muted/45 p-4">
                <p className="text-sm font-medium">Safe order state</p>
                <ol className="mt-3 flex flex-col gap-2 text-xs text-muted-foreground">
                  <li>1. Payment verified by the provider boundary</li>
                  <li>2. KREW order verification recorded</li>
                  <li>3. Production quantity reconciled</li>
                  <li className="font-medium text-foreground">
                    4. Quality control · current fixture state
                  </li>
                  <li>5. Fulfillment and delivery remain downstream</li>
                </ol>
              </div>
              <p className="mt-4 font-mono text-xs text-muted-foreground">
                {order.correlationId}
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" disabled>
                Review with backend
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment safety</CardTitle>
          <CardDescription>
            The fixture contains no provider secret, card data, redirect result,
            or manually payable state.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Only a verified Xendit event can establish a digital payment as
            paid. KREW may review, quarantine, reconcile, or annotate a
            transaction, but cannot manufacture payment or refund state.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
