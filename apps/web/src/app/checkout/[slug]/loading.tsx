import { Card, CardContent, CardHeader } from "@krowds/ui/components/card";
import { Skeleton } from "@krowds/ui/components/skeleton";

export default function CheckoutLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-10" aria-busy="true">
      <Skeleton className="h-4 w-56" />
      <Skeleton className="mt-8 h-12 w-3/4 max-w-xl rounded-lg" />
      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card>
          <CardHeader className="gap-3">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-full max-w-md" />
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="h-24 rounded-xl" />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="gap-3">
            <Skeleton className="h-7 w-32" />
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
      <p className="sr-only">Loading checkout entry</p>
    </div>
  );
}
