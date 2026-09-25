"use client";

import { useEffect } from "react";
import { Button } from "@krowds/ui/components/button";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-dvh bg-background px-5 py-20 text-foreground">
        <main className="mx-auto max-w-lg">
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">KROWDS could not recover this view.</h1>
          <p className="mt-4 leading-7 text-muted-foreground">
            Refresh the page to try again. Your ticket and payment state is owned by the backend
            and is not changed by this error screen.
          </p>
          <Button type="button" onClick={reset} className="mt-6">
            Try again
          </Button>
        </main>
      </body>
    </html>
  );
}
