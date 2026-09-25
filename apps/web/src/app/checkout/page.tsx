import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@krowds/ui/components/badge";
import { Button } from "@krowds/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@krowds/ui/components/card";
import { events } from "@/lib/fixtures";
import { formatDateRange, formatIdr } from "@/lib/format";

export const metadata: Metadata = {
  title: "Start checkout",
  description: "Choose an eligible KROWDS event before entering the checkout preview.",
};

export default function CheckoutEntryPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-6 sm:py-14 lg:px-10">
      <div className="max-w-2xl">
        <Badge variant="outline">Checkout entry</Badge>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Start with an event.</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          Select an event to review its ticket products. The next screen is a safe browser preview;
          it does not create an order or accept payment.
        </p>
      </div>

      <div className="mt-10 grid gap-4">
        {events.map((event) => (
          <Card key={event.id} className="sm:flex sm:items-center sm:justify-between sm:gap-6">
            <CardHeader className="gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{event.category}</Badge>
                <span className="text-xs text-muted-foreground">{event.venue.city}</span>
              </div>
              <CardTitle className="text-xl tracking-[-0.02em]">{event.title}</CardTitle>
              <CardDescription>
                {formatDateRange(event.startsAt, event.endsAt)} · from {formatIdr(event.ticketProducts[0].amountIdr)}
              </CardDescription>
            </CardHeader>
            <CardContent className="shrink-0 sm:pl-0">
              <Button nativeButton={false} role="link" render={<Link href={`/checkout/${event.slug}`} aria-label={`Choose ${event.title}`} />}>
                Choose event
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8 border-dashed bg-muted/30">
        <CardHeader className="gap-2">
          <CardTitle className="text-lg">What happens after checkout?</CardTitle>
          <CardDescription className="leading-6">
            The Go-owned order and payment service will create a pending order, request an approved
            Xendit instruction, and record the provider-confirmed result. The browser will never
            decide that a payment is paid.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
