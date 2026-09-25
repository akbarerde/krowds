import type { Metadata } from "next";
import { buttonVariants } from "@krowds/ui/components/button";
import { Badge } from "@krowds/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@krowds/ui/components/card";

export const metadata: Metadata = {
  title: "Presentation unavailable",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main id="main-content" className="bg-background text-foreground">
      <div className="mx-auto flex min-h-[calc(100dvh-73px)] w-full max-w-3xl items-center px-4 py-10 sm:px-6 lg:px-10">
        <Card className="w-full">
          <CardHeader>
            <Badge variant="outline" className="w-fit">
              Unavailable offline
            </Badge>
            <CardTitle className="text-2xl sm:text-3xl">
              This presentation has not been saved
            </CardTitle>
            <CardDescription>
              Reconnect and try again. The service worker did not substitute a
              different route or claim that its content was current.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            No cached business state can confirm payment, ticket issuance,
            wristband activation, redemption, or gate access. Those operations
            require a live authoritative response.
          </CardContent>
          <CardFooter>
            {/* Keep full-document navigation so a reconnect retry uses the worker. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              className={buttonVariants({
                size: "lg",
                className: "min-h-11",
              })}
            >
              Try the overview
            </a>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
