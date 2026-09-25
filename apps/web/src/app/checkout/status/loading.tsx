import { Card, CardContent, CardHeader } from "@krowds/ui/components/card";
import { Skeleton } from "@krowds/ui/components/skeleton";

export default function PaymentStatusLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-6 sm:py-14 lg:px-10" aria-busy="true">
      <Skeleton className="h-5 w-64" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card>
          <CardHeader className="gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-12 w-4/5 rounded-lg" />
            <Skeleton className="h-6 w-full" />
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="gap-3">
            <Skeleton className="h-6 w-4/5" />
            <Skeleton className="h-5 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 rounded-xl" />
          </CardContent>
        </Card>
      </div>
      <p className="sr-only">Loading payment status</p>
    </div>
  );
}
