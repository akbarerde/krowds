import Link from "next/link";
import { Badge } from "@krowds/ui/components/badge";
import { Button } from "@krowds/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@krowds/ui/components/card";
import type { EventFixture, EventTone } from "@/lib/fixtures";
import { formatDateRange, formatIdr } from "@/lib/format";

const toneClasses: Record<EventTone, string> = {
  ink: "bg-foreground text-background",
  sand: "bg-chart-1 text-foreground",
  mist: "bg-chart-2 text-background",
  clay: "bg-chart-3 text-background",
};

function EventArtwork({ event }: { event: EventFixture }) {
  return (
    <div
      aria-hidden="true"
      className={`relative flex min-h-44 flex-col justify-between overflow-hidden p-5 ${toneClasses[event.tone]}`}
    >
      <div className="flex items-start justify-between gap-4 text-xs font-medium uppercase tracking-[0.16em] opacity-75">
        <span>{event.category}</span>
        <span>{new Date(event.startsAt).getDate().toString().padStart(2, "0")}</span>
      </div>
      <div className="max-w-[16rem] text-2xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-3xl">
        {event.title}
      </div>
      <div className="flex items-end justify-between gap-4 text-xs opacity-75">
        <span>{event.organizer}</span>
        <span className="size-2 rounded-full bg-current" />
      </div>
    </div>
  );
}

export function EventCard({ event }: { event: EventFixture }) {
  const lowestPrice = event.ticketProducts[0];

  return (
    <Card className="group h-full">
      <EventArtwork event={event} />
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{event.category}</Badge>
          {event.featured ? <Badge variant="outline">Popular</Badge> : null}
        </div>
        <CardTitle className="text-xl leading-tight tracking-[-0.02em]">
          <h2 className="m-0">
            <Link
              href={`/events/${event.slug}`}
              className="rounded-sm underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-border focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              {event.title}
            </Link>
          </h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 text-sm">
        <p className="leading-6 text-muted-foreground">{event.summary}</p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
          <dt className="font-medium text-foreground">When</dt>
          <dd className="text-muted-foreground">
            {formatDateRange(event.startsAt, event.endsAt)}
          </dd>
          <dt className="font-medium text-foreground">Where</dt>
          <dd className="text-muted-foreground">
            {event.venue.name}, {event.venue.city}
          </dd>
        </dl>
      </CardContent>
      <CardFooter className="justify-between gap-3 bg-transparent">
        <div>
          <p className="text-xs text-muted-foreground">Tickets from</p>
          <p className="font-semibold tabular-nums text-foreground">
            {formatIdr(lowestPrice.amountIdr)}
          </p>
        </div>
        <Button
          size="sm"
          nativeButton={false} role="link" render={<Link href={`/events/${event.slug}`} aria-label={`View ${event.title}`} />}
        >
          View event
        </Button>
      </CardFooter>
    </Card>
  );
}
