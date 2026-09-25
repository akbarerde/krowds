import { Card, CardContent, CardHeader } from "@krowds/ui/components/card";
import { Skeleton } from "@krowds/ui/components/skeleton";

export default function EventsLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-10" aria-busy="true">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-12 w-3/4 rounded-lg" />
        <Skeleton className="h-6 w-full max-w-xl rounded-lg" />
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {[1, 2, 3, 4].map((item) => (
          <Card key={item} className="overflow-hidden">
            <Skeleton className="h-44 rounded-none" />
            <CardHeader className="gap-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-7 w-4/5" />
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="sr-only">Loading event results</p>
    </div>
  );
}
