import { Badge } from "@krowds/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@krowds/ui/components/card";

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-3 border-b pb-5">
        <div className="h-8 w-56 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
        <div className="h-4 w-full max-w-2xl animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.8fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Loading operational records</CardTitle>
            <CardDescription>
              Waiting for the next backend response.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3" aria-hidden="true">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-20 animate-pulse rounded-lg bg-muted motion-reduce:animate-none"
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>Authority checks</CardTitle>
              <Badge variant="secondary">Pending</Badge>
            </div>
            <CardDescription>
              Loading does not imply permission.
            </CardDescription>
          </CardHeader>
          <CardContent aria-hidden="true">
            <div className="h-40 animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
          </CardContent>
        </Card>
      </div>

      <span className="sr-only">Loading KREW operations workspace.</span>
    </div>
  );
}
