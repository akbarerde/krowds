import { Card, CardContent, CardHeader } from "@krowds/ui/components/card";

export default function PaymentStatusLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-6 sm:py-14 lg:px-10" aria-busy="true">
      <div className="h-5 w-64 animate-pulse rounded bg-muted" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card>
          <CardHeader className="gap-4">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-12 w-4/5 animate-pulse rounded-lg bg-muted" />
            <div className="h-6 w-full animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-24 animate-pulse rounded-xl bg-muted" />
            <div className="h-40 animate-pulse rounded-xl bg-muted" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="gap-3">
            <div className="h-6 w-4/5 animate-pulse rounded bg-muted" />
            <div className="h-5 w-full animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-40 animate-pulse rounded-xl bg-muted" />
          </CardContent>
        </Card>
      </div>
      <p className="sr-only">Loading payment status</p>
    </div>
  );
}
