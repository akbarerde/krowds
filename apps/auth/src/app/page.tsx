import { Badge } from "@krowds/ui/components/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@krowds/ui/components/card";

const readyFeatures = [
  ["Authentication", "Sign-in, registration, and session flows"],
  ["Provider", "Ready to connect to Auth.js or another provider"],
  ["Validation", "A TypeScript and server component foundation"],
];

export default function Home() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-6 py-8 lg:px-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-sm text-primary-foreground">
              K
            </span>
            <span>KROWDS</span>
          </div>
          <Badge variant="outline" className="gap-2 font-mono">
            <span className="size-1.5 rounded-full bg-primary" />
            apps/auth
          </Badge>
        </header>

        <section className="flex flex-1 flex-col justify-center py-24">
          <Badge variant="secondary" className="h-7 w-fit gap-2">
            <span className="size-2 rounded-full bg-primary" />
            Authentication surface
          </Badge>
          <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-tight tracking-tight sm:text-7xl">
            Centralized authentication for secure access.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">
            A dedicated frontend for identity, session, and authorization flows across Krowds.
          </p>

          <div className="mt-12 grid gap-3 lg:grid-cols-3">
            {readyFeatures.map(([title, description]) => (
              <Card key={title}>
                <CardHeader>
                  <CardTitle className="font-semibold">{title}</CardTitle>
                  <CardDescription className="leading-6">
                    {description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <footer className="flex flex-col gap-2 border-t pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>Krowds frontend monorepo</span>
          <Badge variant="outline" className="font-mono">
            localhost:3001
          </Badge>
        </footer>
      </div>
    </main>
  );
}
