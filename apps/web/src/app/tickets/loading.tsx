import { Card, CardContent, CardHeader } from "@krowds/ui/components/card";

export default function TicketWalletLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-10" aria-busy="true">
      <div className="h-12 w-2/3 max-w-lg animate-pulse rounded-lg bg-muted" />
      <Card className="mt-8">
        <CardHeader className="flex-row items-center gap-4">
          <div className="size-12 animate-pulse rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-6 w-36 animate-pulse rounded bg-muted" />
            <div className="h-4 w-52 animate-pulse rounded bg-muted" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {[1, 2, 3].map((item) => (
          <Card key={item}>
            <CardHeader className="gap-3">
              <div className="h-5 w-24 animate-pulse rounded bg-muted" />
              <div className="h-7 w-3/4 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-20 animate-pulse rounded bg-muted" />
              <div className="h-10 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="sr-only">Loading ticket wallet</p>
    </div>
  );
}
