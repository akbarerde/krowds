import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@krowds/ui/components/badge";
import { Button } from "@krowds/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@krowds/ui/components/card";
import { getEventBySlug, getPaymentByOrderId, payments, type PaymentStatus } from "@/lib/fixtures";
import { formatDateTime, formatIdr } from "@/lib/format";

export const metadata: Metadata = {
  title: "Payment status",
  description: "A safe, provider-authoritative payment status preview for KROWDS orders.",
};

type PaymentStatusPageProps = {
  searchParams: Promise<{
    order?: string | string[];
    state?: string | string[];
  }>;
};

const statusContent: Record<
  PaymentStatus,
  {
    label: string;
    badgeVariant: "default" | "secondary" | "outline" | "destructive";
    title: string;
    description: string;
    nextStep: string;
  }
> = {
  pending: {
    label: "Payment pending",
    badgeVariant: "outline",
    title: "We are waiting for provider confirmation.",
    description:
      "A payment instruction exists in this preview, but the order is not paid. Returning to this page or changing the URL cannot change that result.",
    nextStep: "Complete the instruction through the approved payment provider page, then return here for the backend-confirmed status.",
  },
  paid: {
    label: "Payment confirmed",
    badgeVariant: "default",
    title: "The illustrative provider state is confirmed.",
    description:
      "This preview shows what a verified provider result looks like. In production, only the Go-owned, replay-protected Xendit event can move an order to paid and issue tickets.",
    nextStep: "The backend will issue one single-use ticket for each named holder. The account wallet remains the fallback when email delivery is delayed.",
  },
  failed: {
    label: "Payment failed",
    badgeVariant: "destructive",
    title: "No usable ticket was issued.",
    description:
      "The illustrative payment attempt did not reach a successful provider state. Do not retry an unknown or changed amount without a new order and instruction.",
    nextStep: "Return to checkout to review the event and request a new payment instruction when the event is still available.",
  },
  expired: {
    label: "Payment expired",
    badgeVariant: "secondary",
    title: "This instruction is no longer current.",
    description:
      "An expired instruction does not grant a ticket or access. The browser cannot extend or replace the instruction on its own.",
    nextStep: "Start a fresh checkout if the event is still on sale. The backend will apply the current order and payment rules.",
  },
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PaymentStatusPage({ searchParams }: PaymentStatusPageProps) {
  const params = await searchParams;
  // Only the opaque fixture order reference selects a preview state. Any browser-supplied
  // `state` or `status` value is intentionally ignored; payment authority belongs to the backend.
  const orderId = firstValue(params.order) ?? payments[0].orderId;
  const payment = getPaymentByOrderId(orderId);

  if (!payment) {
    notFound();
  }

  const event = getEventBySlug(payment.eventSlug);
  const content = statusContent[payment.status];

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-6 sm:py-14 lg:px-10">
      <div className="flex flex-col gap-3">
        <Link
          href={event ? `/events/${event.slug}` : "/events"}
          className="w-fit text-sm text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground"
        >
          Back to event
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={content.badgeVariant}>{content.label}</Badge>
          <Badge variant="outline">Illustrative fixture · {payment.orderId}</Badge>
        </div>
      </div>

      <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start" aria-labelledby="payment-status-heading">
        <Card>
          <CardHeader className="gap-3">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">Order {payment.orderId}</p>
            <CardTitle id="payment-status-heading" className="text-3xl tracking-[-0.03em] sm:text-4xl">
              <h1 className="m-0">{content.title}</h1>
            </CardTitle>
            <CardDescription className="max-w-2xl text-base leading-7">{content.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div role="status" aria-live="polite" className="rounded-xl border border-primary/20 bg-muted p-4">
              <p className="text-sm font-semibold">Current preview state: {content.label}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{content.nextStep}</p>
            </div>
            <dl className="grid gap-x-5 gap-y-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Event</dt>
                <dd className="mt-1 font-medium">{payment.eventTitle}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Amount</dt>
                <dd className="mt-1 font-medium tabular-nums">{formatIdr(payment.amountIdr)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Payment method</dt>
                <dd className="mt-1 font-medium">{payment.method.replaceAll("_", " ")}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Last fixture update</dt>
                <dd className="mt-1 font-medium">{formatDateTime(payment.updatedAt)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Instruction expiry</dt>
                <dd className="mt-1 font-medium">
                  {payment.instructionExpiresAt ? formatDateTime(payment.instructionExpiresAt) : "Not applicable"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Provider</dt>
                <dd className="mt-1 font-medium">{payment.provider}</dd>
              </div>
            </dl>
            <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row">
              {payment.status === "paid" ? (
                <Button nativeButton={false} role="link" render={<Link href="/tickets" />}>Open ticket wallet</Button>
              ) : (
                <Button nativeButton={false} role="link" render={<Link href={event ? `/checkout/${event.slug}` : "/events"} />}>
                  Return to checkout
                </Button>
              )}
              <Button variant="outline" nativeButton={false} role="link" render={<Link href="/tickets" />}>
                View account context
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/40">
          <CardHeader className="gap-2">
            <CardTitle className="text-lg">Payment is provider-backed</CardTitle>
            <CardDescription className="leading-6">
              The UI can explain a state, but it cannot grant one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex list-disc flex-col gap-3 pl-5 text-sm leading-6 text-muted-foreground">
              <li>Xendit confirms or rejects the payment through a verified backend event.</li>
              <li>The Go service stores the canonical order and payment state.</li>
              <li>Tickets become available only after the paid transition is accepted.</li>
              <li>Client redirects, local flags, and URL parameters are not proof.</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="mt-12 border-t pt-8" aria-labelledby="state-preview-heading">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="state-preview-heading" className="text-2xl font-semibold tracking-[-0.03em]">Preview the safe states</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              These links select local fixtures for review only. They do not submit a payment or
              change an order.
            </p>
          </div>
          <span className="font-mono text-xs text-muted-foreground">No browser state is authoritative</span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {payments.map((fixture) => (
            <Link
              key={fixture.orderId}
              href={`/checkout/status?order=${encodeURIComponent(fixture.orderId)}`}
              className="rounded-xl border bg-card p-4 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Badge variant={statusContent[fixture.status].badgeVariant}>{statusContent[fixture.status].label}</Badge>
              <p className="mt-3 text-sm font-medium">{fixture.eventTitle}</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">{fixture.orderId}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
