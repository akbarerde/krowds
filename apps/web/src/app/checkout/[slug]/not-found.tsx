import Link from "next/link";
import { Button } from "@krowds/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@krowds/ui/components/card";

export default function CheckoutNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col justify-center px-5 py-20 sm:px-6 lg:px-10">
      <Card>
        <CardHeader className="gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">Checkout unavailable</p>
          <CardTitle className="text-3xl tracking-[-0.03em]">That event cannot be checked out.</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="leading-7 text-muted-foreground">
            The event may have moved out of the sale window or is no longer available. No order or
            payment was created.
          </p>
          <Button nativeButton={false} role="link" render={<Link href="/events" />}>Browse available events</Button>
        </CardContent>
      </Card>
    </div>
  );
}
