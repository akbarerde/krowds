import Link from "next/link";
import { Button } from "@krowds/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@krowds/ui/components/card";

export default function EventNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col justify-center px-5 py-20 sm:px-6 lg:px-10">
      <Card>
        <CardHeader className="gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">404 · Event</p>
          <CardTitle className="text-3xl tracking-[-0.03em]">That event is not here.</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="leading-7 text-muted-foreground">
            The preview may have changed, or the event may not be published. No ticket or payment
            state was changed.
          </p>
          <Button nativeButton={false} role="link" render={<Link href="/events" />}>Back to events</Button>
        </CardContent>
      </Card>
    </div>
  );
}
