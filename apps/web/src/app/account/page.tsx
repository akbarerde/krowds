import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@krowds/ui/components/badge";
import { Button } from "@krowds/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@krowds/ui/components/card";
import { account, payments, tickets } from "@/lib/fixtures";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Account context",
  description: "A clear, safe account context for tickets, payments, and profile information.",
};

export default function AccountPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-10">
      <section className="flex flex-col gap-8 border-b pb-10 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Account context</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
            See the account information connected to this preview, plus the current ticket and
            payment states that belong here.
          </p>
        </div>
        <Button nativeButton={false} role="link" render={<Link href="/tickets" />}>Open ticket wallet</Button>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <Card>
          <CardHeader className="gap-4 sm:flex-row sm:items-center">
            <div aria-hidden="true" className="grid size-14 shrink-0 place-items-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
              {account.initials}
            </div>
            <div className="min-w-0">
              <CardTitle className="text-2xl tracking-[-0.03em]">{account.displayName}</CardTitle>
              <CardDescription>{account.email}</CardDescription>
            </div>
            <Badge variant="outline" className="sm:ml-auto">Demo context</Badge>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-xl border p-4">
              <p className="text-sm text-muted-foreground">Identity context</p>
              <p className="mt-2 font-medium">{account.identityLabel}</p>
              <p className="mt-1 text-xs text-muted-foreground">No identity number is shown in this preview.</p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="text-sm text-muted-foreground">Account type</p>
              <p className="mt-2 font-medium">{account.membershipLabel}</p>
              <p className="mt-1 text-xs text-muted-foreground">Session and permissions are backend-owned.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/40">
          <CardHeader className="gap-2">
            <CardTitle className="text-lg">Account summary</CardTitle>
            <CardDescription>Current fixture state, not a live session.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-background p-3">
              <p className="text-2xl font-semibold tabular-nums">{tickets.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">wallet records</p>
            </div>
            <div className="rounded-lg bg-background p-3">
              <p className="text-2xl font-semibold tabular-nums">{payments.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">payment previews</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-10 grid gap-5 lg:grid-cols-2" aria-label="Account activity">
        <Card>
          <CardHeader className="gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-xl">Recent payment context</CardTitle>
              <Badge variant="outline">Provider-backed</Badge>
            </div>
            <CardDescription>Current state is always safe to explain, never safe to infer in the browser.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col divide-y">
              {payments.slice(0, 3).map((payment) => (
                <li key={payment.orderId} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{payment.eventTitle}</p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">{payment.orderId} · {formatDateTime(payment.updatedAt)}</p>
                  </div>
                  <Badge variant={payment.status === "failed" ? "destructive" : payment.status === "paid" ? "default" : "outline"}>
                    {payment.status}
                  </Badge>
                </li>
              ))}
            </ul>
            <Button variant="outline" size="sm" className="mt-5" nativeButton={false} role="link" render={<Link href="/checkout/status" />}>
              View payment status preview
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-2">
            <CardTitle className="text-xl">Profile and privacy</CardTitle>
            <CardDescription>Keep the browser view useful without exposing sensitive values.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm leading-6 text-muted-foreground">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-foreground">Email context</p>
                <p className="mt-1">{account.emailStatus}</p>
              </div>
              <Badge variant="secondary">Demo</Badge>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-foreground">Identity details</p>
                <p className="mt-1">Redacted from this public preview.</p>
              </div>
              <Badge variant="secondary">Protected</Badge>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-foreground">Payment credentials</p>
                <p className="mt-1">Never stored in this frontend.</p>
              </div>
              <Badge variant="secondary">Backend only</Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-10 border-t pt-8" aria-labelledby="account-boundary-heading">
        <h2 id="account-boundary-heading" className="text-2xl font-semibold tracking-[-0.03em]">What this preview does not decide</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {[
            ["Session", "The Go service owns sign-in, cookies, and revocation."],
            ["Authorization", "Role and tenant decisions are made server-side."],
            ["Payment", "A verified provider event is the only path to paid."],
          ].map(([title, description]) => (
            <div key={title} className="rounded-xl border bg-card p-4">
              <h3 className="font-medium">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
