"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Badge } from "@krowds/ui/components/badge";
import { buttonVariants } from "@krowds/ui/components/button";
import { cn } from "@krowds/ui/lib/utils";
import { organizationFixture } from "@/lib/fixtures";
import { StatusBadge } from "@/components/status-badge";

const navigation = [
  {
    label: "Organization",
    items: [
      { href: "/", label: "Overview" },
      { href: "/onboarding", label: "Onboarding" },
      { href: "/documents", label: "Documents" },
    ],
  },
  {
    label: "People & access",
    items: [
      { href: "/members", label: "Members" },
      { href: "/invitations", label: "Invitations" },
      { href: "/access", label: "Access review" },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/catalog", label: "Catalog" },
      { href: "/tickets", label: "Tickets" },
      { href: "/fulfillment", label: "Fulfillment" },
      { href: "/reports", label: "Reports" },
    ],
  },
  {
    label: "Workspace",
    items: [{ href: "/settings", label: "Settings" }],
  },
] as const;

function isCurrentPath(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname.startsWith(href);
}

function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-6">
      {navigation.map((group) => (
        <nav aria-label={group.label} key={group.label}>
          <p className="px-3 text-xs font-medium text-muted-foreground">
            {group.label}
          </p>
          <ul className="mt-2 flex list-none flex-col gap-1 p-0">
            {group.items.map((item) => {
              const active = isCurrentPath(pathname, item.href);

              return (
                <li key={item.href}>
                  <Link
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      buttonVariants({
                        variant: active ? "secondary" : "ghost",
                        size: "lg",
                      }),
                      "w-full justify-start",
                    )}
                    href={item.href}
                    onClick={onNavigate}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ))}
    </div>
  );
}

function TenantContext() {
  return (
    <div className="rounded-xl border bg-background p-4 shadow-sm shadow-foreground/5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">
            Current organization
          </p>
          <p className="mt-1 truncate font-heading text-sm font-semibold">
            {organizationFixture.displayName}
          </p>
        </div>
        <Badge variant="outline">Fixture</Badge>
      </div>
      <dl className="mt-4 grid gap-3 text-xs">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Tenant</dt>
          <dd className="truncate font-mono">{organizationFixture.id}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Verification</dt>
          <dd>
            <StatusBadge status={organizationFixture.verificationStatus} />
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Membership</dt>
          <dd>
            <StatusBadge status={organizationFixture.membership.status} />
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-muted/30 text-foreground">
      <a
        className="fixed left-4 top-4 z-50 -translate-y-24 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-transform focus:translate-y-0"
        href="#main-content"
      >
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r bg-sidebar p-4 lg:flex lg:flex-col">
        <div className="flex items-center gap-3 px-2 py-2">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
            K
          </span>
          <div>
            <p className="font-heading text-sm font-semibold">KROWDS Org</p>
            <p className="text-xs text-muted-foreground">Organization workspace</p>
          </div>
        </div>
        <div className="mt-4">
          <TenantContext />
        </div>
        <div className="mt-6 min-h-0 flex-1 overflow-y-auto">
          <NavigationLinks />
        </div>
        <p className="mt-4 border-t px-2 pt-4 text-xs leading-5 text-muted-foreground">
          Preview mode uses typed synthetic fixtures. No backend command is connected.
        </p>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b bg-background px-4 py-3 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {organizationFixture.displayName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Tenant context is visible on every organization route
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <StatusBadge status={organizationFixture.effectiveAccess} label="Access blocked" />
              <Badge variant="outline" className="hidden sm:inline-flex">
                Synthetic data
              </Badge>
            </div>
          </div>

          <details className="group relative mt-3 lg:hidden [&_summary]:list-none">
            <summary
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "w-full justify-between",
              )}
            >
              <span className="group-open:hidden">Open navigation</span>
              <span className="hidden group-open:inline">Close navigation</span>
            </summary>
            <div className="absolute inset-x-0 top-12 max-h-[70dvh] overflow-y-auto rounded-xl border bg-popover p-3 text-popover-foreground shadow-lg shadow-foreground/10">
              <NavigationLinks />
            </div>
          </details>
        </header>

        <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
