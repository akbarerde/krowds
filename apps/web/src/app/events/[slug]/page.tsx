import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@krowds/ui/components/badge";
import { Button } from "@krowds/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@krowds/ui/components/card";
import { EventCard } from "@/components/event-card";
import { events, getEventBySlug } from "@/lib/fixtures";
import { formatDateRange, formatDateTime, formatIdr } from "@/lib/format";

type EventPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    return { title: "Event not found" };
  }

  return {
    title: event.title,
    description: event.summary,
    openGraph: {
      title: event.title,
      description: event.summary,
      type: "article",
    },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const relatedEvents = events
    .filter((candidate) => candidate.id !== event.id && candidate.category === event.category)
    .slice(0, 2);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-6 sm:py-12 lg:px-10">
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="underline decoration-border underline-offset-4 hover:text-foreground">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/events" className="underline decoration-border underline-offset-4 hover:text-foreground">
              Events
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="max-w-[16rem] truncate font-medium text-foreground">
            {event.title}
          </li>
        </ol>
      </nav>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-12">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{event.category}</Badge>
            <Badge variant="outline">Public event preview</Badge>
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-6xl">
            {event.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">{event.summary}</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Card size="sm">
              <CardHeader>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">When</p>
                <CardTitle className="text-base">{formatDateRange(event.startsAt, event.endsAt)}</CardTitle>
              </CardHeader>
            </Card>
            <Card size="sm">
              <CardHeader>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Where</p>
                <CardTitle className="text-base">{event.venue.name}</CardTitle>
                <CardDescription>{event.venue.city}</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="typeset mt-10 max-w-2xl text-base leading-7">
            <h2 className="text-2xl font-semibold tracking-[-0.03em]">About this event</h2>
            <p className="mt-4 text-muted-foreground">{event.description}</p>
            <h2 className="mt-8 text-2xl font-semibold tracking-[-0.03em]">Access and arrival</h2>
            <p className="mt-4 text-muted-foreground">{event.accessibilityNote}</p>
          </div>
        </div>

        <Card className="lg:sticky lg:top-24">
          <CardHeader className="gap-2">
            <CardTitle className="text-xl">Choose a ticket</CardTitle>
            <CardDescription>Online sale · {event.saleWindow}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              {event.ticketProducts.map((product) => (
                <div key={product.id} className="rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="mt-1 text-sm leading-5 text-muted-foreground">
                        {product.description}
                      </p>
                    </div>
                    <p className="shrink-0 font-semibold tabular-nums">
                      {formatIdr(product.amountIdr)}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-muted-foreground">{product.remainingLabel}</span>
                    <Badge variant={product.availability === "Sold out" ? "destructive" : "outline"}>
                      {product.availability}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button
              size="lg"
              className="w-full"
              nativeButton={false} role="link" render={<Link href={`/checkout/${event.slug}`} />}
            >
              Continue to checkout
            </Button>
            <p className="text-xs leading-5 text-muted-foreground">
              Checkout is a browser entry point in this milestone. The Go-owned API will validate
              availability, identity, price, and payment authority when connected.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-14 border-t pt-10" aria-labelledby="schedule-heading">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="schedule-heading" className="text-2xl font-semibold tracking-[-0.03em]">Schedule</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Times shown in WIB.</p>
          </div>
          <p className="text-sm text-muted-foreground">Organized by {event.organizer}</p>
        </div>
        <ol className="mt-6 grid gap-3 sm:grid-cols-2">
          {event.sessions.map((session) => (
            <li key={session.id} className="rounded-xl border bg-card p-4">
              <p className="font-medium">{session.label}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {formatDateTime(session.startsAt)} – {formatDateTime(session.endsAt)}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {relatedEvents.length > 0 ? (
        <section className="mt-14 border-t pt-10" aria-labelledby="related-heading">
          <h2 id="related-heading" className="text-2xl font-semibold tracking-[-0.03em]">
            You may also like
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {relatedEvents.map((relatedEvent) => (
              <EventCard key={relatedEvent.id} event={relatedEvent} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
