"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@krowds/ui/components/button";
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
    <nav
      aria-label="Primary navigation"
      className="order-3 -mx-1 w-full overflow-x-auto sm:order-none sm:mx-0 sm:w-auto sm:flex-1"
    >
      <ul className="flex min-w-max items-center gap-1 px-1 sm:min-w-0">
        {navigation.map((item) => {
          const active = isCurrentPath(pathname, item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  buttonVariants({
                    variant: active ? "secondary" : "ghost",
                    size: "lg",
                  }),
                  "min-h-10 shrink-0 px-3",
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
