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
import {
  eventFixture,
  wristbandFixture,
} from "@/lib/presentation-fixtures";

export const metadata: Metadata = {
  title: "Wristband",
  description: "Presentation-only KROWDS wristband status shell.",
};

export default function WristbandsPage() {
  return (
    <main id="main-content" className="bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
        <header className="flex flex-col gap-4">
          <Badge variant="outline" className="w-fit font-mono">
            /wristbands
          </Badge>
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
              Wristband status
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              A presentation route for the wristband journey, with no QR
              credential and no local activation or revocation state.
            </p>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>{eventFixture.name}</CardTitle>
            <CardDescription>
              {eventFixture.dateLabel} · {eventFixture.venue}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <dt className="text-sm text-muted-foreground">
                  Display reference
                </dt>
                <dd className="font-mono text-sm font-medium">
                  {wristbandFixture.reference}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-sm text-muted-foreground">Ticket</dt>
                <dd className="font-mono text-sm font-medium">
                  {wristbandFixture.ticketReference}
                </dd>
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <dt className="text-sm text-muted-foreground">Live status</dt>
                <dd className="font-medium">
                  {wristbandFixture.activationStatus}
                </dd>
              </div>
            </dl>
          </CardContent>
          <CardFooter className="gap-2">
            <Badge variant="secondary">{wristbandFixture.presentationStatus}</Badge>
            <Badge variant="outline">No QR token</Badge>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activation stays online</CardTitle>
            <CardDescription>
              The browser cannot activate, bind, revoke, or infer a wristband.
              Current state must come from the authoritative backend contract.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </main>
  );
}
