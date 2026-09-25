import Link from "next/link";
import type { ReactNode } from "react";
import { KrowdsBrand } from "@krowds/ui/components/brand";
import { Button } from "@krowds/ui/components/button";
import { SiteNavigation } from "@/components/site-navigation";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-3 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-30 bg-background/95">
        <div className="mx-auto w-full max-w-6xl px-5 py-3 sm:px-6 lg:px-10">
          <div className="flex min-h-14 items-center rounded-xl border border-border bg-background px-3 shadow-sm sm:px-4">
            <KrowdsBrand render={<Link href="/" />} className="shrink-0 px-2" />
            <SiteNavigation />
            <Button
              size="sm"
              className="ml-auto hidden sm:inline-flex"
              nativeButton={false}
              role="link"
              render={<Link href="/#operator-model" />}
            >
              Explore product
            </Button>
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <footer className="border-t bg-muted/30">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
          <div>
            <p className="font-medium text-foreground">KROWDS</p>
            <p className="mt-1 max-w-md leading-6">
              One accountable operating model for the teams behind every event and the visitors they serve.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link
              href="/#operator-model"
              className="underline decoration-border underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Operator model
            </Link>
            <Link
              href="/events"
              className="underline decoration-border underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Visitor surface
            </Link>
            <Link
              href="/tickets"
              className="underline decoration-border underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Ticket lifecycle
            </Link>
            <span className="font-mono text-xs">Preview data only</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
