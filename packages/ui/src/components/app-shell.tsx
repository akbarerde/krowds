import type { ReactNode } from "react";
import { KrowdsBrand } from "#components/brand";
import { Separator } from "#components/separator";

export interface AppShellProps {
  actions?: ReactNode;
  brand?: ReactNode;
  children: ReactNode;
  navigation?: ReactNode;
  navigationLabel?: string;
}

export function AppShell({
  actions,
  brand = <KrowdsBrand />,
  children,
  navigation,
  navigationLabel = "Primary navigation",
}: AppShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="bg-background">
        <div className="mx-auto flex min-h-14 w-full max-w-6xl items-center gap-4 px-4 sm:px-6 lg:px-10">
          {brand}
          {navigation ? (
            <nav aria-label={navigationLabel} className="min-w-0 flex-1">
              {navigation}
            </nav>
          ) : (
            <div className="flex-1" />
          )}
          {actions && (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          )}
        </div>
        <Separator />
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
