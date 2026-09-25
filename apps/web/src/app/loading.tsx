import { Card, CardContent, CardHeader } from "@krowds/ui/components/card";
import { Skeleton } from "@krowds/ui/components/skeleton";

export default function RootLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-10" aria-busy="true">
      <Skeleton className="h-12 w-3/4 max-w-xl rounded-lg" />
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <Card key={item}>
            <CardHeader className="gap-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-7 w-4/5" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="sr-only">Loading KROWDS</p>
    </div>
  );
}
