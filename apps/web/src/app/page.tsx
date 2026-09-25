import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@krowds/ui/components/badge";
import { Button } from "@krowds/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@krowds/ui/components/card";
import { EventCard } from "@/components/event-card";
import { events } from "@/lib/fixtures";

export const metadata: Metadata = {
  title: "Find your next good day out",
  description:
    "Explore KROWDS events, keep your tickets in one wallet, and see clear payment status at every step.",
};

const featuredEvents = events.filter((event) => event.featured);

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-10">
      <section className="grid gap-10 py-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)] lg:items-center lg:gap-16 lg:py-16">
        <div>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
            Find your next good day out.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            KROWDS brings event discovery, a named ticket, and a clear payment status into one
            calm, online-first journey.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" nativeButton={false} role="link" render={<Link href="/events" />}>
              Explore events
            </Button>
            <Button
              variant="outline"
              size="lg"
              nativeButton={false} role="link" render={<Link href="/tickets" />}
            >
              Open ticket wallet
            </Button>
          </div>
          <form
            action="/events"
            method="get"
            className="mt-10 max-w-xl rounded-xl border bg-card p-3 shadow-sm"
          >
            <label htmlFor="home-search" className="sr-only">
              Search events
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="home-search"
                name="q"
                type="search"
                placeholder="Search by event, city, or category"
                className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              <Button type="submit" className="sm:px-5">
                Search events
              </Button>
            </div>
          </form>
        </div>

        <Card className="overflow-hidden bg-primary text-primary-foreground ring-primary/20">
          <CardHeader className="gap-3">
            <Badge variant="secondary" className="w-fit">
              Built for the whole visit
            </Badge>
            <CardTitle className="text-2xl leading-tight tracking-[-0.03em] text-primary-foreground sm:text-3xl">
              Know where you are in the journey.
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-col gap-5 text-sm leading-6 text-primary-foreground/80">
              <li className="flex gap-3">
                <span className="font-mono text-xs text-primary-foreground/60">01</span>
                <span>Choose an eligible event and ticket product.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-xs text-primary-foreground/60">02</span>
                <span>Review the order before a provider instruction is created.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-xs text-primary-foreground/60">03</span>
                <span>Keep the ticket and current status in your account.</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </section>

      <section className="border-t py-12 sm:py-16" aria-labelledby="featured-events-heading">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="featured-events-heading" className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
              A few good reasons to go
            </h2>
            <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">
              Browse the public preview before you choose where to spend your Saturday.
            </p>
          </div>
          <Link
            href="/events"
            className="inline-flex min-h-10 w-fit items-center rounded-lg px-3 text-sm font-medium underline decoration-border underline-offset-4 transition-colors hover:bg-muted hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            See all events
          </Link>
        </div>
        <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featuredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      <section className="grid gap-5 border-t py-12 sm:py-16 lg:grid-cols-3" aria-labelledby="guardrails-heading">
        <div className="lg:col-span-1">
          <h2 id="guardrails-heading" className="text-2xl font-semibold tracking-[-0.03em]">
            Clear by design
          </h2>
          <p className="mt-2 max-w-sm leading-7 text-muted-foreground">
            The MVP keeps a few important promises visible from the first browse.
          </p>
        </div>
        <Card size="sm">
          <CardHeader className="gap-2">
            <CardTitle className="text-lg">Online first</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Event details and ticket access stay available in the browser while the backend
              remains the source of business truth.
            </p>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader className="gap-2">
            <CardTitle className="text-lg">IDR only</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Checkout previews use exact IDR amounts. Card credentials are never collected by this
              surface.
            </p>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader className="gap-2">
            <CardTitle className="text-lg">Single use</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Ticket and access states are designed for one online admission, with no offline
              override or re-entry promise.
            </p>
          </CardHeader>
        </Card>
      </section>
    </div>
  );
}
