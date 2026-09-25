import { Card, CardContent, CardHeader } from "@krowds/ui/components/card";
import { Skeleton } from "@krowds/ui/components/skeleton";

export default function EventDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-10" aria-busy="true">
      <Skeleton className="h-4 w-48" />
      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-5">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-20 w-full max-w-2xl rounded-lg" />
          <Skeleton className="h-6 w-4/5 max-w-xl" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        </div>
        <Card>
          <CardHeader className="gap-3">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-24 rounded-xl" />
            ))}
          </CardContent>
        </Card>
      </div>
      <p className="sr-only">Loading event details</p>
    </div>
  );
}
