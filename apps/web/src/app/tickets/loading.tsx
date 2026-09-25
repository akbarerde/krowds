import { Card, CardContent, CardHeader } from "@krowds/ui/components/card";
import { Skeleton } from "@krowds/ui/components/skeleton";

export default function TicketWalletLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-10" aria-busy="true">
      <Skeleton className="h-12 w-2/3 max-w-lg rounded-lg" />
      <Card className="mt-8">
        <CardHeader className="flex-row items-center gap-4">
          <Skeleton className="size-12 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-52" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {[1, 2, 3].map((item) => (
          <Card key={item}>
            <CardHeader className="gap-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-7 w-3/4" />
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-10" />
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="sr-only">Loading ticket wallet</p>
    </div>
  );
}
