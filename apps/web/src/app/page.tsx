import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@krowds/ui/components/button";
import { EventCard } from "@/components/event-card";
import { events } from "@/lib/fixtures";

export const metadata: Metadata = {
  title: "Run events with one clear operating system",
  description:
    "KROWDS helps event operators organize commerce, ticketing, fulfillment, and visitor access with accountable handoffs.",
};

const featuredEvents = events.filter((event) => event.featured);

const proofPoints = [
  { label: "Tenant-scoped", detail: "Organization boundaries" },
  { label: "Provider-backed", detail: "Payment state" },
  { label: "Single-use", detail: "Access state" },
  { label: "Online-first", detail: "MVP workflow" },
] as const;

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
      <section aria-labelledby="hero-heading" className="py-16 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <h1
            id="hero-heading"
            className="text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-foreground sm:text-6xl lg:text-8xl"
          >
            Run every event with one clear operating system.
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            KROWDS gives venues, attractions, and event teams one place to organize commerce,
            ticketing, fulfillment, and visitor access—while every important transition stays
            accountable.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/80"
              nativeButton={false}
              role="link"
              render={<Link href="#operator-model" />}
            >
              See the operating model
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-border bg-background text-foreground hover:bg-muted"
              nativeButton={false}
              role="link"
              render={<Link href="/events" />}
            >
              Preview the visitor experience
            </Button>
          </div>
        </div>
        <div className="mx-auto mt-16 max-w-6xl border-t border-border pt-5 sm:mt-20">
          <ul className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
            {proofPoints.map((point) => (
              <li
                key={point.label}
                className="flex min-h-16 items-center gap-3 bg-background px-3 py-3 sm:px-4"
              >
                <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-foreground" />
                <span>
                  <span className="block text-sm font-semibold text-foreground">{point.label}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{point.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="operator-model"
        className="scroll-mt-24 py-12 sm:py-16"
        aria-labelledby="operator-model-heading"
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
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
            <Link
              href="#visitor-preview"
              className="mt-6 inline-flex text-sm font-medium underline decoration-border underline-offset-4 transition-colors hover:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              See the visitor side
            </Link>
          </div>
          <div className="border-y">
            {operatingSteps.map((step) => (
              <article
                key={step.label}
                className="grid gap-3 border-b py-5 last:border-b-0 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-6"
              >
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {step.label}
                </p>
                <div>
                  <h3 className="text-base font-semibold tracking-[-0.02em]">{step.title}</h3>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="visitor-preview"
        className="scroll-mt-24 border-t py-12 sm:py-16"
        aria-labelledby="featured-events-heading"
      >
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

      <section className="border-t py-12 sm:py-16" aria-labelledby="home-cta-heading">
        <div className="rounded-2xl border border-border bg-muted/40 px-6 py-10 text-foreground sm:px-10 sm:py-12 lg:flex lg:items-end lg:justify-between lg:gap-10">
          <div className="max-w-xl">
            <h2
              id="home-cta-heading"
              className="text-3xl font-semibold leading-tight tracking-[-0.03em] sm:text-4xl"
            >
              Make the next event easier to run.
            </h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">
              Start with the operating model, then preview the visitor path your guests will see.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:shrink-0">
            <Button
              variant="secondary"
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
              className="border-border bg-background text-foreground hover:bg-muted"
              nativeButton={false}
              role="link"
              render={<Link href="/events" />}
            >
              Preview visitor experience
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
