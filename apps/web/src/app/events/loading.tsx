import { Card, CardContent, CardHeader } from "@krowds/ui/components/card";

export default function EventsLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-10" aria-busy="true">
      <div className="animate-pulse space-y-4">
        <div className="h-12 w-3/4 rounded-lg bg-muted" />
        <div className="h-6 w-full max-w-xl rounded-lg bg-muted" />
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {[1, 2, 3, 4].map((item) => (
          <Card key={item} className="overflow-hidden">
            <div className="h-44 animate-pulse bg-muted" />
            <CardHeader className="gap-3">
              <div className="h-5 w-24 animate-pulse rounded bg-muted" />
              <div className="h-7 w-4/5 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="sr-only">Loading event results</p>
    </div>
  );
}
