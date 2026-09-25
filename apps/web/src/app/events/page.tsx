import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@krowds/ui/components/badge";
import { Button } from "@krowds/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@krowds/ui/components/card";
import { Input } from "@krowds/ui/components/input";
import { EventCard } from "@/components/event-card";
import { events, type EventCategory } from "@/lib/fixtures";

export const metadata: Metadata = {
  title: "Explore events",
  description: "Browse the KROWDS public event preview by place, category, and date.",
};

const categories: Array<"All" | EventCategory> = [
  "All",
  "Arts & culture",
  "Food & drink",
  "Community",
  "Wellness",
];

type EventsPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
  }>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const query = firstValue(params.q)?.trim().toLowerCase() ?? "";
  const requestedCategory = firstValue(params.category) ?? "All";
  const category = categories.includes(requestedCategory as (typeof categories)[number])
    ? (requestedCategory as (typeof categories)[number])
    : "All";
  const filteredEvents = events.filter((event) => {
    const matchesCategory = category === "All" || event.category === category;
    const searchableText = [
      event.title,
      event.organizer,
      event.category,
      event.venue.name,
      event.venue.city,
    ]
      .join(" ")
      .toLowerCase();
    return matchesCategory && (!query || searchableText.includes(query));
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-10">
      <section className="flex flex-col gap-8 border-b pb-10 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Explore events</h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Find an event, understand the practical details, and choose a ticket with confidence.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">Synthetic catalog</Badge>
          <span>{events.length} events in this preview</span>
        </div>
      </section>

      <div className="grid gap-8 py-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start lg:gap-10">
        <aside className="flex flex-col gap-6 lg:sticky lg:top-24">
          <div>
            <h2 className="text-sm font-semibold">Browse by category</h2>
            <nav aria-label="Event categories" className="mt-3">
              <ul className="flex flex-wrap gap-2 lg:flex-col lg:items-start">
                {categories.map((item) => {
                  const isSelected = category === item;
                  const href = item === "All" ? "/events" : `/events?category=${encodeURIComponent(item)}`;
                  return (
                    <li key={item}>
                      <Link
                        href={href}
                        aria-current={isSelected ? "page" : undefined}
                        className={`inline-flex min-h-10 items-center rounded-lg px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                          isSelected
                            ? "bg-primary font-medium text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {item}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
          <Card size="sm" className="bg-muted/40">
            <CardHeader>
              <CardTitle className="text-base">Preview data only</CardTitle>
              <CardDescription className="leading-6">
                Live event availability and identity requirements will come from the Go-owned API.
              </CardDescription>
            </CardHeader>
          </Card>
        </aside>

        <section aria-labelledby="event-results-heading">
          <form action="/events" method="get" className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <label htmlFor="events-search" className="sr-only">
                Search the event preview
              </label>
              <Input
                id="events-search"
                name="q"
                type="search"
                defaultValue={firstValue(params.q) ?? ""}
                placeholder="Search events, organizers, or cities"
                className="h-10 w-full"
              />
            </div>
            {category !== "All" ? <input type="hidden" name="category" value={category} /> : null}
            <Button type="submit">Search</Button>
            {query || category !== "All" ? (
              <Button variant="ghost" nativeButton={false} role="link" render={<Link href="/events" />}>
                Clear filters
              </Button>
            ) : null}
          </form>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="event-results-heading" className="text-2xl font-semibold tracking-[-0.03em]">
                {query ? `Results for “${firstValue(params.q)}”` : category === "All" ? "All events" : category}
              </h2>
              <p aria-live="polite" className="mt-1 text-sm text-muted-foreground">
                {filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"} available
              </p>
            </div>
          </div>

          {filteredEvents.length > 0 ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <Card className="mt-6">
              <CardHeader className="gap-2">
                <CardTitle className="text-xl">No events match those filters</CardTitle>
                <CardContent className="text-sm leading-6 text-muted-foreground">
                  <p>
                    Try a broader search or return to the full preview. An empty result is different
                    from a service error; no ticket or payment state has changed.
                  </p>
                  <Button variant="outline" className="mt-4" nativeButton={false} role="link" render={<Link href="/events" />}>
                    Show all events
                  </Button>
                </CardContent>
              </CardHeader>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
