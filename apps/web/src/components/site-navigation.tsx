"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@krowds/ui/lib/utils";

const navigation = [
  { href: "/#operator-model", label: "Platform" },
  { href: "/events", label: "Visitor preview" },
  { href: "/tickets", label: "Ticket lifecycle" },
  { href: "/account", label: "Account" },
] as const;

function isCurrentPath(pathname: string, href: string) {
  const [path, hash] = href.split("#");

  if (path === "/") {
    return pathname === "/" && Boolean(hash);
  }

  return pathname === path || pathname.startsWith(`${path}/`);
}

export function SiteNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary navigation" className="min-w-0 flex-1 overflow-x-auto">
      <ul className="flex min-w-max items-center gap-4 sm:gap-6">
        {navigation.map((item) => {
          const active = isCurrentPath(pathname, item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-14 shrink-0 items-center border-b-2 px-1 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:px-2",
                  active
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
