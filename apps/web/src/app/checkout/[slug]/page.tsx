import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@krowds/ui/components/badge";
import { CheckoutSelection } from "@/components/checkout-selection";
import { events, getEventBySlug } from "@/lib/fixtures";

type CheckoutPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: CheckoutPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  return {
    title: event ? `Checkout · ${event.title}` : "Checkout",
    description: event?.summary,
  };
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-6 sm:py-12 lg:px-10">
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/events" className="underline decoration-border underline-offset-4 hover:text-foreground">
              Events
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={`/events/${event.slug}`} className="underline decoration-border underline-offset-4 hover:text-foreground">
              {event.title}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-foreground">Checkout</li>
        </ol>
      </nav>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="outline">Public checkout preview</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Review before you continue.</h1>
        </div>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">
          No payment secrets, card data, or browser success flags are collected on this screen.
        </p>
      </div>
      <CheckoutSelection event={event} />
    </div>
  );
}
