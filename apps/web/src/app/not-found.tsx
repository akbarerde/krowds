import Link from "next/link";
import { Button } from "@krowds/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@krowds/ui/components/card";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col justify-center px-5 py-20 sm:px-6 lg:px-10">
      <Card>
        <CardHeader className="gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">404 · KROWDS</p>
          <CardTitle className="text-3xl tracking-[-0.03em]">We could not find that page.</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="leading-7 text-muted-foreground">
            The link may be out of date. Return to event discovery to continue browsing; no account
            or payment state was changed.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button nativeButton={false} role="link" render={<Link href="/" />}>Go home</Button>
            <Button variant="outline" nativeButton={false} role="link" render={<Link href="/events" />}>
              Explore events
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
