import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@krowds/ui/components/button";
import { Card, CardHeader, CardTitle } from "@krowds/ui/components/card";
import { EventCard } from "@/components/event-card";
import { OperatorPreview } from "@/components/operator-preview";
import { events } from "@/lib/fixtures";

export const metadata: Metadata = {
  title: "Run events with one clear operating system",
  description:
    "KROWDS helps event operators organize commerce, ticketing, fulfillment, and visitor access with accountable handoffs.",
};

const featuredEvents = events.filter((event) => event.featured);

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-10">
      <section className="grid gap-10 py-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)] lg:items-center lg:gap-16 lg:py-16">
        <div>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
            Run every event with one clear operating system.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            KROWDS gives venues, attractions, and event teams one place to organize commerce,
            ticketing, fulfillment, and visitor access—while every important transition stays
            accountable.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" nativeButton={false} role="link" render={<Link href="#operator-model" />}>
              See the operating model
            </Button>
            <Button
              variant="outline"
              size="lg"
              nativeButton={false} role="link" render={<Link href="/events" />}
            >
              Preview the visitor experience
            </Button>
          </div>
          <div className="mt-10 max-w-xl border-y py-5">
            <p className="text-sm font-medium text-foreground">One platform, two clear surfaces</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <Link
                href="/events"
                className="underline decoration-border underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Visitor discovery
              </Link>
              <Link
                href="/tickets"
                className="underline decoration-border underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Ticket lifecycle
              </Link>
              <Link
                href="/account"
                className="underline decoration-border underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Account context
              </Link>
            </div>
          </div>
        </div>

        <OperatorPreview />
      </section>

      <section className="border-t py-12 sm:py-16" aria-labelledby="featured-events-heading">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="featured-events-heading" className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
              See the visitor side of the platform
            </h2>
            <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">
              Give guests a clear path from discovery to ticket access. The operator workspace keeps
              the work behind that path visible to your team.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            role="link"
            render={<Link href="/events" />}
          >
            See all events
          </Button>
        </div>
        <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featuredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      <section
        id="operator-model"
        className="grid scroll-mt-24 gap-5 border-t py-12 sm:py-16 lg:grid-cols-3"
        aria-labelledby="operator-model-heading"
      >
        <div className="lg:col-span-1">
          <h2 id="operator-model-heading" className="text-2xl font-semibold tracking-[-0.03em]">
            Built for accountable operations
          </h2>
          <p className="mt-2 max-w-sm leading-7 text-muted-foreground">
            The MVP keeps the important operating promises visible from the first handoff.
          </p>
        </div>
        <Card size="sm">
          <CardHeader className="gap-2">
            <CardTitle className="text-lg">Tenant-aware</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Every organization-owned resource stays scoped to the active tenant, with the backend
              enforcing the boundary again.
            </p>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader className="gap-2">
            <CardTitle className="text-lg">Provider-backed</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Money movement follows verified provider state. Staff surfaces explain the current
              state; they never invent a paid result.
            </p>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader className="gap-2">
            <CardTitle className="text-lg">Auditable handoffs</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Orders, fulfillment, and access transitions keep their actor, reason, and current
              state visible to the teams responsible for them.
            </p>
          </CardHeader>
        </Card>
      </section>
    </div>
  );
}
