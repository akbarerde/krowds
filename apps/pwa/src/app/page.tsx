import { Badge } from "@krowds/ui/components/badge";
import { buttonVariants } from "@krowds/ui/components/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@krowds/ui/components/card";

const routes = [
  {
    href: "/tickets",
    label: "E-ticket",
    description: "Review the responsive ticket-wallet presentation.",
  },
  {
    href: "/wristbands",
    label: "Wristband",
    description: "Inspect status presentation without a QR credential.",
  },
  {
    href: "/access",
    label: "Access",
    description: "See the online-only, fail-closed access boundary.",
  },
] as const;

export default function Home() {
  return (
    <main id="main-content" className="bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-12 sm:px-6 sm:py-18 lg:px-10 lg:py-24">
        <section className="flex max-w-4xl flex-col gap-6">
          <Badge variant="outline" className="w-fit font-mono">
            apps/pwa
          </Badge>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-6xl lg:text-7xl">
            Your KROWDS presentation, ready when installed.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
            Browse e-ticket and wristband shells, install the app where
            supported, and understand exactly what remains online-only.
          </p>
        </section>

        <section aria-labelledby="routes-heading" className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h2 id="routes-heading" className="text-2xl font-semibold tracking-tight">
              Presentation routes
            </h2>
            <p className="max-w-2xl leading-7 text-muted-foreground">
              Each route works at narrow mobile, tablet, and desktop widths.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {routes.map((route) => (
              <Card key={route.href} className="min-w-0">
                <CardHeader>
                  <CardTitle>{route.label}</CardTitle>
                  <CardDescription className="leading-6">
                    {route.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <a
                    href={route.href}
                    className={buttonVariants({
                      variant: "outline",
                      size: "lg",
                      className: "min-h-11 w-full",
                    })}
                  >
                    Open {route.label.toLowerCase()}
                  </a>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        <section aria-labelledby="install-heading" className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle id="install-heading">Install KROWDS</CardTitle>
              <CardDescription>
                When the browser offers installation, an Install app button
                appears. Otherwise, use the browser&apos;s install or Add to
                Home Screen menu. Support varies by browser.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Badge variant="secondary">Standalone and browser modes</Badge>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Presentation is not authority</CardTitle>
              <CardDescription>
                Saved pages never confirm payment, ticket issuance, wristband
                activation, redemption, or gate access. Every business and
                access transition stays online and backend-authoritative.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Badge variant="destructive">Offline access denied</Badge>
            </CardFooter>
          </Card>
        </section>
      </div>
    </main>
  );
}
