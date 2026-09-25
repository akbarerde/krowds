import { Card, CardContent, CardHeader } from "@krowds/ui/components/card";
import { Skeleton } from "@krowds/ui/components/skeleton";

export default function CheckoutEntryLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-6 sm:py-14 lg:px-10" aria-busy="true">
      <Skeleton className="h-12 w-3/4 max-w-xl rounded-lg" />
      <div className="mt-10 flex flex-col gap-4">
        {[1, 2, 3, 4].map((item) => (
          <Card key={item}>
            <CardHeader className="gap-3">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="sr-only">Loading event choices</p>
    </div>
  );
}
