import { Card, CardContent, CardHeader } from "@krowds/ui/components/card";

export default function RootLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-10" aria-busy="true">
      <div className="h-12 w-3/4 max-w-xl animate-pulse rounded-lg bg-muted" />
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <Card key={item}>
            <CardHeader className="gap-3">
              <div className="h-5 w-24 animate-pulse rounded bg-muted" />
              <div className="h-7 w-4/5 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-20 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="sr-only">Loading KROWDS</p>
    </div>
  );
}
