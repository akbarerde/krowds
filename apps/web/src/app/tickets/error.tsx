"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@krowds/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@krowds/ui/components/card";

type TicketErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function TicketError({ error, reset }: TicketErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col justify-center px-5 py-20 sm:px-6 lg:px-10">
      <Card>
        <CardHeader className="gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-destructive">Wallet error</p>
          <CardTitle className="text-3xl tracking-[-0.03em]">Your tickets could not be loaded.</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="leading-7 text-muted-foreground">
            This is a preview data error, not a statement about payment. Try again or return to the
            event catalog.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={reset}>Try again</Button>
            <Button variant="outline" nativeButton={false} role="link" render={<Link href="/events" />}>
              Browse events
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
