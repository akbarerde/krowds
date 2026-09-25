import { Card, CardContent, CardHeader } from "@krowds/ui/components/card";

export default function EventDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-10" aria-busy="true">
      <div className="h-4 w-48 animate-pulse rounded bg-muted" />
      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-5 animate-pulse">
          <div className="h-6 w-32 rounded bg-muted" />
          <div className="h-20 w-full max-w-2xl rounded-lg bg-muted" />
          <div className="h-6 w-4/5 max-w-xl rounded bg-muted" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-24 rounded-xl bg-muted" />
            <div className="h-24 rounded-xl bg-muted" />
          </div>
        </div>
        <Card>
          <CardHeader className="gap-3">
            <div className="h-7 w-32 animate-pulse rounded bg-muted" />
            <div className="h-5 w-48 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-24 animate-pulse rounded-xl bg-muted" />
            ))}
          </CardContent>
        </Card>
      </div>
      <p className="sr-only">Loading event details</p>
    </div>
  );
}
