import type { ComponentProps } from "react";
import { TicketCheckIcon } from "lucide-react";
import { Button } from "#components/button";

export type KrowdsBrandProps = Omit<
  ComponentProps<typeof Button>,
  "children"
> & {
  href?: string;
};

export function KrowdsBrand({
  href = "/",
  render,
  size = "lg",
  variant = "ghost",
  ...props
}: KrowdsBrandProps) {
  return (
    <Button
      aria-label="KROWDS home"
      nativeButton={false}
      render={render ?? <a href={href} />}
      size={size}
      variant={variant}
      {...props}
    >
      <TicketCheckIcon data-icon="inline-start" aria-hidden="true" />
      KROWDS
    </Button>
  );
}
