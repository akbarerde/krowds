"use client";

import { Badge } from "@krowds/ui/components/badge";
import { Button } from "@krowds/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@krowds/ui/components/card";

interface WorkspaceErrorProps {
  readonly error: Error & { digest?: string };
  readonly retry: () => void;
}

export default function WorkspaceError({ error, retry }: WorkspaceErrorProps) {
  return (
    <div role="alert" aria-live="assertive">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Workspace data could not be loaded</CardTitle>
            <Badge variant="destructive">Safe error</Badge>
          </div>
          <CardDescription>
            The operation was not retried automatically and no state was
            changed.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <p>
            Retry the read request. If the problem continues, share the
            correlation reference with the backend support channel.
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            Correlation: {error.digest ?? "digest-unavailable"}
          </p>
          <p className="text-xs leading-5 text-muted-foreground">
            Error messages, provider payloads, credentials, and personal data
            are intentionally excluded from this view.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={retry}>Retry workspace</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
