import type { Metadata } from "next";
import { Badge } from "@krowds/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@krowds/ui/components/card";
import { eventFixture, ticketFixture } from "@/lib/presentation-fixtures";

export const metadata: Metadata = {
  title: "E-ticket",
  description: "Presentation-only KROWDS e-ticket shell.",
};

export default function TicketsPage() {
  return (
    <main id="main-content" className="bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
        <header className="flex flex-col gap-4">
          <Badge variant="outline" className="w-fit font-mono">
            /tickets
          </Badge>
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
              E-ticket presentation
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              A responsive ticket-wallet shell. The sample below contains no
              ticket credential and cannot prove payment or admission state.
            </p>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>{eventFixture.name}</CardTitle>
            <CardDescription>
              Synthetic presentation fixture · not connected to a live account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <dt className="text-sm text-muted-foreground">Holder</dt>
                <dd className="font-medium">{ticketFixture.holderLabel}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-sm text-muted-foreground">Ticket type</dt>
                <dd className="font-medium">{ticketFixture.ticketType}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-sm text-muted-foreground">When</dt>
                <dd className="font-medium">{eventFixture.dateLabel}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-sm text-muted-foreground">Where</dt>
                <dd className="font-medium">{eventFixture.venue}</dd>
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <dt className="text-sm text-muted-foreground">Reference</dt>
                <dd className="font-mono text-sm font-medium">
                  {ticketFixture.reference}
                </dd>
              </div>
            </dl>
          </CardContent>
          <CardFooter>
            <Badge variant="secondary">{ticketFixture.presentationStatus}</Badge>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>No authority is stored here</CardTitle>
            <CardDescription>
              A cached or saved view never proves that a payment settled, a
              ticket was issued, or an entitlement remains unused.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </main>
  );
}
