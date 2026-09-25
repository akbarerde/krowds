"use client";

import { usePathname } from "next/navigation";
import { buttonVariants } from "@krowds/ui/components/button";
import { KrowdsBrand } from "@krowds/ui/components/brand";

const routes = [
  { href: "/", label: "Overview" },
  { href: "/tickets", label: "E-ticket" },
  { href: "/wristbands", label: "Wristband" },
  { href: "/access", label: "Access" },
] as const;

export function PwaNav() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-background/95">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
        {/* Keep full-document navigation so the presentation worker handles offline routes. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <KrowdsBrand render={<a href="/" />} />

        <nav
          aria-label="Primary navigation"
          className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1"
        >
          {routes.map((route) => {
            const active = pathname === route.href;

            return (
              <a
                key={route.href}
                href={route.href}
                aria-current={active ? "page" : undefined}
                className={buttonVariants({
                  variant: active ? "secondary" : "ghost",
                  size: "lg",
                  className: "min-h-11 shrink-0 px-3",
                })}
              >
                {route.label}
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
