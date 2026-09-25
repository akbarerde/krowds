import { Card, CardContent, CardHeader } from "@krowds/ui/components/card";

export default function AccountLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-10" aria-busy="true">
      <div className="h-12 w-2/3 max-w-lg animate-pulse rounded-lg bg-muted" />
      <Card className="mt-8">
        <CardHeader className="flex-row items-center gap-4">
          <div className="size-14 animate-pulse rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-7 w-40 animate-pulse rounded bg-muted" />
            <div className="h-4 w-56 animate-pulse rounded bg-muted" />
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="h-24 animate-pulse rounded-xl bg-muted" />
          <div className="h-24 animate-pulse rounded-xl bg-muted" />
        </CardContent>
      </Card>
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {[1, 2].map((item) => (
          <Card key={item}>
            <CardHeader className="gap-3">
              <div className="h-6 w-1/2 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-40 animate-pulse rounded-xl bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="sr-only">Loading account context</p>
    </div>
  );
}
