import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@krowds/ui/components/badge";
import { Button } from "@krowds/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@krowds/ui/components/card";
import { account, getEventBySlug, tickets, type TicketFixture, type TicketStatus } from "@/lib/fixtures";
import { formatDate, formatDateTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Ticket wallet",
  description: "Keep your KROWDS event tickets and their current states close at hand.",
};

type TicketWalletProps = {
  searchParams: Promise<{ view?: string | string[] }>;
};

const ticketStatusContent: Record<
  TicketStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive"; message: string }
> = {
  issued: {
    label: "Issued",
    variant: "default",
    message: "This fixture represents an issued single-use ticket. The backend owns its live entitlement.",
  },
  used: {
    label: "Used",
    variant: "secondary",
    message: "This fixture has already been used. Re-entry is not part of the MVP.",
  },
  pending: {
    label: "Pending payment",
    variant: "outline",
    message: "No usable ticket is issued until the backend confirms the payment provider state.",
  },
};

function TicketCard({ ticket }: { ticket: TicketFixture }) {
  const event = getEventBySlug(ticket.eventSlug);
  const status = ticketStatusContent[ticket.status];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <Badge variant={status.variant}>{status.label}</Badge>
            <CardTitle className="text-xl tracking-[-0.02em]">
              <h2 className="m-0">{ticket.eventTitle}</h2>
            </CardTitle>
          </div>
          <span className="font-mono text-xs text-muted-foreground">{ticket.ticketNumber}</span>
        </div>
        <CardDescription>{ticket.productName}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <dl className="grid gap-x-5 gap-y-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Date and time</dt>
            <dd className="mt-1 font-medium">{formatDateTime(ticket.eventStartsAt)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Venue</dt>
            <dd className="mt-1 font-medium">
              {ticket.venueName}
              <br />
              {ticket.venueCity}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Ticket holder</dt>
            <dd className="mt-1 font-medium">{ticket.holderName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Order</dt>
            <dd className="mt-1 font-mono text-xs">{ticket.orderReference}</dd>
          </div>
        </dl>
        <p className="rounded-lg bg-muted p-3 text-sm leading-6 text-muted-foreground">{status.message}</p>
        {event ? (
          <Button variant="outline" size="sm" className="w-fit" nativeButton={false} role="link" render={<Link href={`/events/${event.slug}`} />}>
            View event details
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function EmptyWallet() {
  return (
    <Card className="mx-auto mt-8 max-w-2xl">
      <CardHeader className="gap-3">
        <Badge variant="outline">Empty state</Badge>
        <CardTitle className="text-2xl tracking-[-0.03em]">Your wallet is ready when you are.</CardTitle>
        <CardDescription className="leading-6">
          Tickets appear here after the backend accepts a verified paid order. This preview has no
          tickets for the selected empty view.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm leading-6 text-muted-foreground">
          Browse an event to see the purchase path. An empty wallet is not a payment error and does
          not mean a payment failed.
        </p>
        <Button nativeButton={false} role="link" render={<Link href="/events" />}>Explore events</Button>
      </CardContent>
    </Card>
  );
}

export default async function TicketWalletPage({ searchParams }: TicketWalletProps) {
  const params = await searchParams;
  const view = Array.isArray(params.view) ? params.view[0] : params.view;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-10">
      <section className="flex flex-col gap-8 border-b pb-10 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Ticket wallet</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
            One place for the tickets you hold and the state each one is in.
          </p>
        </div>
        <Button variant="outline" nativeButton={false} role="link" render={<Link href="/account" />}>
          View account context
        </Button>
      </section>

      <Card className="mt-8 bg-muted/40">
        <CardHeader className="flex-row items-center gap-4">
          <div aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-full bg-primary font-semibold text-primary-foreground">
            {account.initials}
          </div>
          <div className="min-w-0">
            <CardTitle className="text-lg">{account.displayName}</CardTitle>
            <CardDescription className="truncate">{account.email}</CardDescription>
          </div>
          <Badge variant="outline" className="ml-auto hidden sm:inline-flex">Demo account</Badge>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <span><strong className="font-semibold">{account.ticketCount}</strong> issued fixture ticket{account.ticketCount === 1 ? "" : "s"}</span>
          <span><strong className="font-semibold">{account.pendingOrderCount}</strong> pending payment fixture</span>
          <span className="text-muted-foreground">Issued on {formatDate("2026-09-20T14:22:00+07:00")}</span>
        </CardContent>
      </Card>

      {view === "empty" ? (
        <EmptyWallet />
      ) : (
        <>
          <section className="mt-10" aria-labelledby="wallet-tickets-heading">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 id="wallet-tickets-heading" className="text-2xl font-semibold tracking-[-0.03em]">Your tickets</h2>
                <p aria-live="polite" className="mt-2 text-sm text-muted-foreground">
                  {tickets.length} fixture records · account fallback remains available if email delivery is delayed
                </p>
              </div>
              <Link
                href="/tickets?view=empty"
                className="w-fit text-sm text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground"
              >
                Preview empty state
              </Link>
            </div>
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              {tickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          </section>

          <section className="mt-12 border-t pt-8" aria-labelledby="wallet-safety-heading">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div>
                <h2 id="wallet-safety-heading" className="text-2xl font-semibold tracking-[-0.03em]">Ticket safety</h2>
                <ul className="mt-4 flex list-disc flex-col gap-3 pl-5 text-sm leading-6 text-muted-foreground">
                  <li>A ticket is issued only after the backend accepts verified payment evidence.</li>
                  <li>Each ticket has one named holder and permits one online admission.</li>
                  <li>QR credentials are issued through the approved access flow and are not included in this preview.</li>
                </ul>
              </div>
              <Card className="bg-muted/40">
                <CardHeader className="gap-2">
                  <CardTitle className="text-lg">No QR in this fixture</CardTitle>
                  <CardDescription className="leading-6">
                    We never put a plaintext QR credential in a URL, a mock object, or browser
                    storage. The PWA access flow will receive only the safe result it is authorized
                    to display.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
