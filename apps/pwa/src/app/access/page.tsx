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
import { accessPolicyFixture } from "@/lib/presentation-fixtures";

export const metadata: Metadata = {
  title: "Access",
  description: "Online-only KROWDS access decision shell.",
};

export default function AccessPage() {
  return (
    <main id="main-content" className="bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
        <header className="flex flex-col gap-4">
          <Badge variant="outline" className="w-fit font-mono">
            /access
          </Badge>
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
              Online access only
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              The access route is intentionally presentation-only in this
              milestone. It never scans, grants, denies, or consumes an
              entitlement.
            </p>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Gate decision boundary</CardTitle>
            <CardDescription>
              Every live scan must resolve current payment, ticket, wristband,
              event, entitlement, and prior-use state on the backend.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <dt className="text-sm text-muted-foreground">Device</dt>
                <dd className="font-medium">{accessPolicyFixture.deviceStatus}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-sm text-muted-foreground">Decision source</dt>
                <dd className="font-medium">{accessPolicyFixture.decisionSource}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-sm text-muted-foreground">Offline</dt>
                <dd className="font-medium">
                  {accessPolicyFixture.offlineDecision}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-sm text-muted-foreground">Retry policy</dt>
                <dd className="font-medium">{accessPolicyFixture.retryContract}</dd>
              </div>
            </dl>
          </CardContent>
          <CardFooter>
            <Badge variant="destructive">No offline grant</Badge>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contract work still required</CardTitle>
            <CardDescription>
              Registered-device authentication, live ticket and wristband
              reads, scanner input, the three-second timeout, and two retries
              must arrive through the shared API boundary before this route can
              support an access decision.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </main>
  );
}
