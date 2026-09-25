import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@krowds/ui/components/button";
import { EventCard } from "@/components/event-card";
import { OperatorPreview } from "@/components/operator-preview";
import { events } from "@/lib/fixtures";

export const metadata: Metadata = {
  title: "Run events with one clear operating system",
  description:
    "KROWDS helps event operators organize commerce, ticketing, fulfillment, and visitor access with accountable handoffs.",
};

const featuredEvents = events.filter((event) => event.featured);

const operatingSteps = [
  {
    label: "Organize",
    title: "Shape the event",
    description: "Keep venue, sessions, products, and roles inside one tenant-scoped model.",
  },
  {
    label: "Sell",
    title: "Guide IDR checkout",
    description: "Let provider-backed payment state stay explicit from order to ticket.",
  },
  {
    label: "Fulfill",
    title: "Trace every handoff",
    description: "Keep ticket, wristband, and fulfillment context connected to the order.",
  },
  {
    label: "Admit",
    title: "Make the next action clear",
    description: "Keep online access decisions current, single-use, and backend-owned.",
  },
] as const;

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
            <Button
              size="lg"
              nativeButton={false}
              role="link"
              render={<Link href="#operator-model" />}
            >
              See the operating model
            </Button>
            <Button
              variant="outline"
              size="lg"
              nativeButton={false}
              role="link"
              render={<Link href="/events" />}
            >
              Preview the visitor experience
            </Button>
          </div>
          <nav
            aria-label="KROWDS platform surfaces"
            className="mt-10 max-w-xl border-y py-4"
          >
            <p className="text-sm font-medium text-foreground">
              One platform, two clear surfaces
            </p>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/events"
                  className="underline decoration-border underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  Visitor discovery
                </Link>
              </li>
              <li>
                <Link
                  href="/tickets"
                  className="underline decoration-border underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  Ticket lifecycle
                </Link>
              </li>
              <li>
                <Link
                  href="/account"
                  className="underline decoration-border underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  Account context
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <OperatorPreview />
      </section>

      <section
        id="operator-model"
        className="scroll-mt-24 border-t py-12 sm:py-16"
        aria-labelledby="operator-model-heading"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
          <div>
            <h2
              id="operator-model-heading"
              className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl"
            >
              One operating rhythm
            </h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
              KROWDS connects setup, commerce, fulfillment, and access without asking the browser
              to guess business state.
            </p>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground lg:justify-self-end">
            Each handoff has a clear owner, a visible state, and a safe next action for the team
            responsible for it.
          </p>
        </div>
        <div className="mt-8 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {operatingSteps.map((step) => (
            <div key={step.label} className="bg-background p-5">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {step.label}
              </p>
              <h3 className="mt-4 text-base font-semibold tracking-[-0.02em]">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t py-12 sm:py-16" aria-labelledby="featured-events-heading">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="featured-events-heading"
              className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl"
            >
              See the visitor side of the platform
            </h2>
            <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">
              Give guests a clear path from discovery to ticket access. The operator workspace
              keeps the work behind that path visible to your team.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
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
    </div>
  );
}
