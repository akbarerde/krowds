import { Card, CardContent, CardHeader } from "@krowds/ui/components/card";

export default function CheckoutEntryLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-6 sm:py-14 lg:px-10" aria-busy="true">
      <div className="h-12 w-3/4 max-w-xl animate-pulse rounded-lg bg-muted" />
      <div className="mt-10 space-y-4">
        {[1, 2, 3, 4].map((item) => (
          <Card key={item}>
            <CardHeader className="gap-3">
              <div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-28 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="sr-only">Loading event choices</p>
    </div>
  );
}
