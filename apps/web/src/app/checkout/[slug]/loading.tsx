import { Card, CardContent, CardHeader } from "@krowds/ui/components/card";

export default function CheckoutLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-10" aria-busy="true">
      <div className="h-4 w-56 animate-pulse rounded bg-muted" />
      <div className="mt-8 h-12 w-3/4 max-w-xl animate-pulse rounded-lg bg-muted" />
      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card>
          <CardHeader className="gap-3">
            <div className="h-7 w-48 animate-pulse rounded bg-muted" />
            <div className="h-5 w-full max-w-md animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-24 animate-pulse rounded-xl bg-muted" />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="gap-3">
            <div className="h-7 w-32 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-5 w-full animate-pulse rounded bg-muted" />
            <div className="h-5 w-4/5 animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      </div>
      <p className="sr-only">Loading checkout entry</p>
    </div>
  );
}
