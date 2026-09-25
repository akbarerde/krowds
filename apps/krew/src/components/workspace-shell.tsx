"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { Badge } from "@krowds/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@krowds/ui/components/card";
import { KrowdsBrand } from "@krowds/ui/components/brand";
import { cn } from "@krowds/ui/lib/utils";

import {
  organizationContext,
  workspaceNavigation,
  type KreCapability,
  type KrePrincipal,
  type WorkspaceNavigationItem,
} from "@/lib/krew-fixtures";

interface WorkspaceShellProps {
  readonly children: ReactNode;
  readonly principal: KrePrincipal;
}

function hasCapability(
  principal: KrePrincipal,
  capability: KreCapability,
): boolean {
  return principal.capabilities.includes(capability);
}

function isCurrentPath(pathname: string, href: WorkspaceNavigationItem["href"]) {
  return href === "/" ? pathname === href : pathname.startsWith(href);
}

function navigationLinkClasses(active: boolean) {
  return cn(
    "flex min-h-10 items-center rounded-lg px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
    active
      ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
  );
}

export function WorkspaceShell({ children, principal }: WorkspaceShellProps) {
  const pathname = usePathname();
  const visibleNavigation = workspaceNavigation.filter((item) =>
    hasCapability(principal, item.requiredCapability),
  );

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-3 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to workspace content
      </a>

      <header className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-[100rem] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <KrowdsBrand render={<Link href="/" />} />
            <p className="truncate text-xs text-muted-foreground">
              Internal operations workspace
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="outline">KREW role</Badge>
            <Badge variant="secondary">MFA verified · fixture</Badge>
            <span className="font-mono text-muted-foreground">
              {organizationContext.id}
            </span>
          </div>
        </div>
      </header>

      <div className="border-b bg-muted/40">
        <div className="mx-auto flex w-full max-w-[100rem] flex-col gap-1 px-4 py-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            Browser state is presentation only. The Go backend remains the
            authorization and audit authority.
          </p>
          <p className="font-mono">req_fixture_01J2A8Q4M7</p>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[100rem] lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="hidden border-r bg-sidebar px-4 py-6 text-sidebar-foreground lg:block">
          <div className="sticky top-4 flex flex-col gap-6">
            <div>
              <p className="px-3 text-xs font-medium text-muted-foreground">
                Workspace
              </p>
              <nav aria-label="Workspace sections" className="mt-2 flex flex-col gap-1">
                {visibleNavigation.map((item) => {
                  const active = isCurrentPath(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={navigationLinkClasses(active)}
                      aria-current={active ? "page" : undefined}
                    >
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <Card size="sm" className="bg-background text-foreground">
              <CardHeader>
                <CardTitle>Fixture principal</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-xs">
                <div>
                  <p className="font-medium">{principal.displayName}</p>
                  <p className="mt-1 text-muted-foreground">
                    {principal.role} · server-issued fixture
                  </p>
                </div>
                <p className="leading-5 text-muted-foreground">
                  Capabilities only scope navigation. They never authorize a
                  mutation.
                </p>
              </CardContent>
            </Card>
          </div>
        </aside>

        <div className="min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <nav
            aria-label="Workspace sections"
            className="mb-6 flex gap-2 overflow-x-auto pb-2 lg:hidden"
          >
            {visibleNavigation.map((item) => {
              const active = isCurrentPath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    navigationLinkClasses(active),
                    "shrink-0 border px-3",
                    active
                      ? "border-border bg-sidebar-accent"
                      : "border-border bg-background",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <main id="main-content" className="min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
