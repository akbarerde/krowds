import Link from "next/link";
import { Badge } from "@krowds/ui/components/badge";
import { Button, buttonVariants } from "@krowds/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@krowds/ui/components/card";
import { StatusBadge } from "@/components/status-badge";
import {
  catalogFixture,
  documentFixtures,
  fulfillmentStates,
  invitationFixtures,
  membershipFixtures,
  onboardingStates,
  organizationFixture,
  organizationRoles,
  reportFixtures,
  requiredOnboardingCategories,
  ticketOrderStates,
  ticketStates,
  type OrganizationRole,
} from "@/lib/fixtures";

const roleLabels: Record<OrganizationRole, string> = {
  organization_owner_admin: "Organization Owner/Admin",
  finance: "Finance",
  ticketing: "Ticketing",
  cashier: "Cashier",
  redemption: "Redemption",
  gate: "Gate",
  viewer: "Viewer",
};

function PageIntro({
  title,
  description,
  status,
}: {
  title: string;
  description: string;
  status?: string;
}) {
  return (
    <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        <h1 className="text-2xl font-heading font-semibold tracking-tight text-balance sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>
      {status ? <StatusBadge status={status} /> : null}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-heading text-lg font-semibold tracking-tight" role="heading" aria-level={2}>
      {children}
    </h2>
  );
}

function KeyValueList({ items }: { items: readonly [string, React.ReactNode][] }) {
  return (
    <dl className="grid gap-0 divide-y">
      {items.map(([term, value]) => (
        <div className="grid gap-1 py-3 first:pt-0 sm:grid-cols-[minmax(10rem,0.45fr)_1fr] sm:gap-4" key={term}>
          <dt className="text-sm text-muted-foreground">{term}</dt>
          <dd className="min-w-0 break-words text-sm font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function PreviewGate({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action: string;
}) {
  return (
    <Card className="bg-background">
      <CardHeader>
        <CardTitle role="heading" aria-level={2}>
          {title}
        </CardTitle>
        <CardDescription>
          This fixture does not authorize a command. The Go backend remains the only source of tenant,
          membership, role, and organization state.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm leading-6 text-muted-foreground">{children}</CardContent>
      <CardFooter>
        <Button disabled type="button">
          {action}
        </Button>
      </CardFooter>
    </Card>
  );
}

function DataTable({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-background">
      <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
        <caption className="sr-only">{label}</caption>
        {children}
      </table>
    </div>
  );
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b bg-muted/50 text-xs text-muted-foreground">
      <tr>{children}</tr>
    </thead>
  );
}

export function DashboardView() {
  const operationalAreas = [
    ["Catalog", "Venue, event, activity, session, and ticket-product publication"],
    ["Tickets", "IDR order projections and single-use ticket state"],
    ["Fulfillment", "Wristband order, batch, receipt, and activation handoffs"],
    ["Reports", "Tenant-scoped operational and audit projections"],
  ] as const;

  return (
    <div className="flex flex-col gap-8">
      <PageIntro
        title="Organization control center"
        description="A tenant-bound overview of verification, membership, and operational readiness. Every command remains unavailable until approved backend contracts replace the local fixtures."
        status={organizationFixture.verificationStatus}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.6fr)]">
        <Card className="bg-background">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle role="heading" aria-level={2}>
                Onboarding decision
              </CardTitle>
              <StatusBadge status={organizationFixture.verificationStatus} />
            </div>
            <CardDescription>
              KREW owns the next transition. The organization cannot infer approval from a client state.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <KeyValueList
              items={[
                ["Current state", "Under Review"],
                ["Submitted version", `Version ${organizationFixture.submittedVersion}`],
                ["Review target", organizationFixture.reviewSla],
                ["Organization action", "Wait for a controlled reviewer decision"],
                ["Operational access", "Blocked"],
              ]}
            />
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <Link className={buttonVariants({ size: "lg" })} href="/onboarding">
              View onboarding
            </Link>
            <Button disabled size="lg" type="button">
              Submit revision
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-background">
          <CardHeader>
            <CardTitle role="heading" aria-level={2}>
              Access context
            </CardTitle>
            <CardDescription>
              The current membership is active, but the organization is not approved, so effective
              operational access is blocked.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <KeyValueList
              items={[
                ["Tenant", <span className="break-all font-mono" key="tenant">{organizationFixture.id}</span>],
                ["Membership", <StatusBadge key="membership" status={organizationFixture.membership.status} />],
                ["Fixed role", roleLabels[organizationFixture.membership.role]],
                ["Authorization source", "Backend membership + RLS"],
                ["Browser role enforcement", "None"],
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <section aria-labelledby="operations-readiness" className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <SectionTitle>Operations readiness</SectionTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Publication and mutations fail closed until an active membership is paired with an
              approved organization.
            </p>
          </div>
          <StatusBadge status="blocked" label="All operations blocked" />
        </div>
        <Card className="bg-background">
          <CardContent className="p-0">
            <ul className="divide-y">
              {operationalAreas.map(([name, description]) => (
                <li className="grid gap-2 px-4 py-4 sm:grid-cols-[10rem_1fr_auto] sm:items-center" key={name}>
                  <p className="font-medium">{name}</p>
                  <p className="text-sm leading-6 text-muted-foreground">{description}</p>
                  <StatusBadge status="blocked" />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export function OnboardingView() {
  return (
    <div className="flex flex-col gap-8">
      <PageIntro
        title="Organization onboarding"
        description="The complete organization lifecycle is explicit. Restricted values are never placed in fixtures, browser storage, URLs, or logs; this surface shows only state and required-data categories."
        status={organizationFixture.verificationStatus}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
        <section aria-labelledby="onboarding-states">
          <Card className="bg-background">
            <CardHeader>
              <CardTitle id="onboarding-states" role="heading" aria-level={2}>
                Verification states
              </CardTitle>
              <CardDescription>
                The current synthetic organization is Under Review. The list also makes terminal and
                restricted states explicit.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ol className="divide-y">
                {onboardingStates.map((state) => {
                  const current = state.status === organizationFixture.verificationStatus;

                  return (
                    <li
                      className={current ? "grid gap-3 bg-muted/60 px-4 py-4 sm:grid-cols-[11rem_1fr] sm:px-5" : "grid gap-3 px-4 py-4 sm:grid-cols-[11rem_1fr] sm:px-5"}
                      key={state.status}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={state.status} label={state.label} />
                        {current ? <Badge>Current</Badge> : null}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{state.meaning}</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {state.organizationAction}
                        </p>
                        <p className="mt-2 text-xs font-medium text-muted-foreground">
                          Operational access: {state.operationalAccess}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        </section>

        <div className="flex flex-col gap-4">
          <Card className="bg-background">
            <CardHeader>
              <CardTitle role="heading" aria-level={2}>
                Current decision
              </CardTitle>
              <CardDescription>
                No browser action can move this organization to Under Review, approve it, reject it,
                suspend it, or close it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <KeyValueList
                items={[
                  ["State", "Under Review"],
                  ["Version", String(organizationFixture.submittedVersion)],
                  ["Review target", organizationFixture.reviewSla],
                  ["Next actor", "KREW reviewer"],
                  ["Operational access", "Blocked"],
                ]}
              />
            </CardContent>
            <CardFooter>
              <Button disabled type="button">
                Save onboarding draft
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-background">
            <CardHeader>
              <CardTitle role="heading" aria-level={2}>
                Required categories
              </CardTitle>
              <CardDescription>
                Completeness and values must come from the authorized backend response.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3 text-sm">
                {requiredOnboardingCategories.map((category) => (
                  <li className="flex items-start gap-3" key={category}>
                    <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{category}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function DocumentsView() {
  return (
    <div className="flex flex-col gap-8">
      <PageIntro
        title="Private documents"
        description="A secure upload presentation for organization verification evidence. This preview collects no file bytes, file names, public URLs, document values, or object metadata beyond synthetic opaque references."
        status="under_review"
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.65fr)]">
        <PreviewGate
          action="Select private file"
          title="Backend upload command is not connected"
        >
          <p>
            Production upload must use a backend-authorized private-object flow with an idempotency key,
            malware and content checks, encryption, audit evidence, and an opaque object reference. The
            browser must never construct a public storage URL.
          </p>
        </PreviewGate>

        <Card className="bg-background">
          <CardHeader>
            <CardTitle role="heading" aria-level={2}>
              Browser safety boundary
            </CardTitle>
            <CardDescription>These constraints apply even after the API is connected.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 text-sm leading-6">
              <li>No localStorage, sessionStorage, IndexedDB, or cache persistence.</li>
              <li>No console logging, analytics payloads, URLs, or hidden form fields.</li>
              <li>No public object URL or raw storage path.</li>
              <li>No document preview unless the backend authorizes that exact object.</li>
              <li>No download or replacement command without server authorization and audit.</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <section aria-labelledby="document-index" className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <SectionTitle>Fixture object index</SectionTitle>
            <p id="document-index" className="mt-1 text-sm text-muted-foreground">
              Synthetic categories and opaque references only; no original file names are rendered.
            </p>
          </div>
          <Button disabled type="button">
            Request replacement
          </Button>
        </div>
        <DataTable label="Synthetic private document fixture index">
          <TableHeader>
            <th className="px-4 py-3 font-medium" scope="col">
              Category
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              Opaque object
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              State
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              Review evidence
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              Action
            </th>
          </TableHeader>
          <tbody className="divide-y">
            {documentFixtures.map((document) => (
              <tr key={document.id}>
                <td className="px-4 py-3 font-medium">{document.category}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {document.objectReference}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={document.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">{document.reviewedAt}</td>
                <td className="px-4 py-3">
                  <Button disabled size="sm" type="button">
                    Open private object
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </section>
    </div>
  );
}

export function MembersView() {
  return (
    <div className="flex flex-col gap-8">
      <PageIntro
        title="Members and fixed roles"
        description="Every membership is individual, organization-scoped, and limited to exactly one fixed role. A browser can present options but cannot grant, change, suspend, restore, or revoke authority."
        status={organizationFixture.effectiveAccess}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)]">
        <Card className="bg-background">
          <CardHeader>
            <CardTitle role="heading" aria-level={2}>
              Effective access decision
            </CardTitle>
            <CardDescription>
              The current owner membership is active, but the organization must also be Approved before
              operational features are available.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <KeyValueList
              items={[
                ["Current membership", <StatusBadge key="current-membership" status="active" />],
                ["Current role", roleLabels[organizationFixture.membership.role]],
                ["Organization", <StatusBadge key="organization" status="under_review" />],
                ["Effective operational access", <StatusBadge key="effective-access" status="blocked" />],
                ["Authorization authority", "Go backend + PostgreSQL RLS"],
              ]}
            />
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <Button disabled type="button">
              Change fixed role
            </Button>
            <Button disabled type="button">
              Suspend membership
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-background">
          <CardHeader>
            <CardTitle role="heading" aria-level={2}>
              Allowed role set
            </CardTitle>
            <CardDescription>
              Custom roles and multi-role memberships are outside the MVP.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {organizationRoles.map((role) => (
                <Badge key={role} variant="outline">
                  {roleLabels[role]}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <section aria-labelledby="membership-state-inventory" className="flex flex-col gap-4">
        <div>
          <SectionTitle>Membership state inventory</SectionTitle>
          <p id="membership-state-inventory" className="mt-1 text-sm text-muted-foreground">
            All lifecycle states are represented with synthetic member labels.
          </p>
        </div>
        <DataTable label="Synthetic membership lifecycle fixture">
          <TableHeader>
            <th className="px-4 py-3 font-medium" scope="col">
              Member
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              Fixed role
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              Membership
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              Effective access
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              Last decision
            </th>
          </TableHeader>
          <tbody className="divide-y">
            {membershipFixtures.map((membership) => (
              <tr key={membership.id}>
                <td className="px-4 py-3 font-medium">{membership.memberLabel}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {roleLabels[membership.role]}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={membership.status} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={membership.effectiveAccess} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">{membership.lastDecision}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </section>

      <Card className="bg-background">
        <CardHeader>
          <CardTitle role="heading" aria-level={2}>
            Revocation presentation
          </CardTitle>
          <CardDescription>
            Active or suspended access can be revoked immediately with a controlled reason. Historical
            membership and audit records remain intact.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status="active" />
            <span aria-hidden className="text-muted-foreground">
              or
            </span>
            <StatusBadge status="suspended" />
            <span aria-hidden className="text-muted-foreground">
              then
            </span>
            <StatusBadge status="revoked" />
            <span className="text-sm text-muted-foreground">Session and invitation effects are server-owned</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button disabled type="button">
            Review revocation
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export function InvitationsView() {
  return (
    <div className="flex flex-col gap-8">
      <PageIntro
        title="Organization invitations"
        description="Invitation targets, tokens, and acceptance are private backend concerns. This presentation covers the fixed role, single-use, expiry, acceptance, and invalidation states without collecting an email address."
        status="under_review"
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
        <PreviewGate action="Create invitation" title="Invitation command is fail-closed">
          <p>
            The future command must bind one organization, one inviter, one intended user, exactly one
            fixed role, an expiry, an idempotency key, and audit evidence. It must not return or persist a
            readable invitation token in the browser.
          </p>
        </PreviewGate>

        <Card className="bg-background">
          <CardHeader>
            <CardTitle role="heading" aria-level={2}>
              Lifecycle
            </CardTitle>
            <CardDescription>Access is not granted before acceptance and required verification.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="grid gap-3 text-sm">
              <li className="flex flex-wrap items-center gap-2">
                <StatusBadge status="awaiting_acceptance" label="Invited" />
                <span className="text-muted-foreground">Single-use, scoped, expiring</span>
              </li>
              <li className="flex flex-wrap items-center gap-2">
                <StatusBadge status="accepted" />
                <span className="text-muted-foreground">Intended user verified; membership activated</span>
              </li>
              <li className="flex flex-wrap items-center gap-2">
                <StatusBadge status="declined" />
                <span className="text-muted-foreground">Invitation consumed without access</span>
              </li>
              <li className="flex flex-wrap items-center gap-2">
                <StatusBadge status="expired" />
                <span className="text-muted-foreground">Acceptance permanently unavailable</span>
              </li>
              <li className="flex flex-wrap items-center gap-2">
                <StatusBadge status="invalidated" />
                <span className="text-muted-foreground">Revocation prevents future acceptance</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>

      <section aria-labelledby="invitation-inventory" className="flex flex-col gap-4">
        <div>
          <SectionTitle>Invitation fixture</SectionTitle>
          <p id="invitation-inventory" className="mt-1 text-sm text-muted-foreground">
            Generic invitee labels avoid placing personal data in the client fixture.
          </p>
        </div>
        <DataTable label="Synthetic organization invitation fixture">
          <TableHeader>
            <th className="px-4 py-3 font-medium" scope="col">
              Invitee
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              Fixed role
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              Invitation
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              Expiry / consumption
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              Action
            </th>
          </TableHeader>
          <tbody className="divide-y">
            {invitationFixtures.map((invitation) => (
              <tr key={invitation.id}>
                <td className="px-4 py-3 font-medium">{invitation.inviteeLabel}</td>
                <td className="px-4 py-3 text-muted-foreground">{roleLabels[invitation.role]}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={invitation.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">{invitation.expires}</td>
                <td className="px-4 py-3">
                  <Button disabled size="sm" type="button">
                    Invalidate
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </section>
    </div>
  );
}

export function AccessReviewView() {
  const checks = [
    ["Authenticated session", "Fixture: active", "active"],
    ["Organization membership", "Fixture: active", "active"],
    ["Fixed role", "Organization Owner/Admin", "active"],
    ["Organization verification", "Under Review", "blocked"],
    ["Tenant and RLS match", "Must be checked by backend", "blocked"],
  ] as const;

  return (
    <div className="flex flex-col gap-8">
      <PageIntro
        title="Access review"
        description="A review presentation for the exact organization, active membership, fixed role, tenant resource, and session context. No browser value is authoritative and no offline grant exists."
        status="blocked"
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
        <Card className="bg-background">
          <CardHeader>
            <CardTitle role="heading" aria-level={2}>
              Decision inputs
            </CardTitle>
            <CardDescription>
              The organization status already blocks operations even though the fixture membership is
              active.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y">
              {checks.map(([name, result, status]) => (
                <li className="grid gap-2 px-4 py-4 sm:grid-cols-[1fr_1fr_auto] sm:items-center" key={name}>
                  <p className="font-medium">{name}</p>
                  <p className="text-sm text-muted-foreground">{result}</p>
                  <StatusBadge status={status} />
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <Button disabled type="button">
              Start access review
            </Button>
            <Button disabled type="button">
              Export review evidence
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-background">
          <CardHeader>
            <CardTitle role="heading" aria-level={2}>
              Revocation guarantees
            </CardTitle>
            <CardDescription>
              Sensitive actions need backend re-authorization, step-up controls where policy requires it,
              and append-only audit evidence.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 text-sm leading-6">
              <li>Organization loss immediately invalidates operational access.</li>
              <li>Membership removal revokes affected organization sessions.</li>
              <li>Pending invitations are invalidated when required.</li>
              <li>Historical membership and audit records are not deleted.</li>
              <li>Wrong-organization and inactive-membership checks fail closed.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function CatalogView() {
  return (
    <div className="flex flex-col gap-8">
      <PageIntro
        title="Catalog hierarchy"
        description="Organization-owned venues, events, optional activities, sessions, and ticket products. The synthetic hierarchy below demonstrates safe presentation only; publication remains blocked."
        status="blocked"
      />

      <PreviewGate action="Create venue" title="Operational configuration is locked">
        <p>
          An organization must be Approved before venues, events, products, prices, inventory policies,
          or publication windows can be changed or published. Every descendant must resolve to the same
          backend-derived organization.
        </p>
      </PreviewGate>

      <div className="grid gap-4 xl:grid-cols-[minmax(18rem,0.65fr)_minmax(0,1.35fr)]">
        <Card className="bg-background">
          <CardHeader>
            <CardTitle role="heading" aria-level={2}>
              Tenant hierarchy
            </CardTitle>
            <CardDescription>No browser-selected tenant bypass is represented.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="grid gap-3 text-sm">
              <li className="rounded-lg border bg-muted/40 p-3">
                <p className="font-medium">Organization</p>
                <p className="mt-1 text-muted-foreground">{organizationFixture.displayName}</p>
              </li>
              <li className="ml-4 rounded-lg border bg-muted/40 p-3">
                <p className="font-medium">Venue</p>
                <p className="mt-1 text-muted-foreground">{catalogFixture.venue.name}</p>
              </li>
              <li className="ml-8 rounded-lg border bg-muted/40 p-3">
                <p className="font-medium">Event</p>
                <p className="mt-1 text-muted-foreground">{catalogFixture.event.name}</p>
              </li>
              <li className="ml-12 rounded-lg border border-dashed p-3 text-muted-foreground">
                Optional activity / session
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card className="bg-background">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle role="heading" aria-level={2}>
                Synthetic ticket products
              </CardTitle>
              <StatusBadge status="draft" />
            </div>
            <CardDescription>
              IDR values are fixture values, not tax, settlement, or production configuration.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y">
              {catalogFixture.products.map((product) => (
                <li className="grid gap-2 px-4 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center" key={product.name}>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">Tax-inclusive fixture amount</p>
                  </div>
                  <span className="font-medium tabular-nums">{product.price}</span>
                  <StatusBadge status={product.status} />
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button disabled type="button">
              Add ticket product
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export function TicketsView() {
  return (
    <div className="flex flex-col gap-8">
      <PageIntro
        title="Tickets and orders"
        description="Order and ticket projections are read-only in this fixture. Payment state remains backend-owned, and no staff control can mark an order Paid or Refunded."
        status="blocked"
      />

      <PreviewGate action="Open ticket order" title="No backend order is loaded">
        <p>
          A connected view must request only the authorized organization order, calculate no financial
          state in the browser, and display only safe references returned by the API.
        </p>
      </PreviewGate>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="bg-background">
          <CardHeader>
            <CardTitle role="heading" aria-level={2}>
              Order projection
            </CardTitle>
            <CardDescription>Provider-backed state only; no manual transition control.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {ticketOrderStates.map((state) => (
                <StatusBadge key={state} status={state} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background">
          <CardHeader>
            <CardTitle role="heading" aria-level={2}>
              Ticket projection
            </CardTitle>
            <CardDescription>
              Single-use with no transfer, re-entry, multi-use entitlement, or offline gate grant.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {ticketStates.map((state) => (
                <StatusBadge key={state} status={state} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-background">
        <CardHeader>
          <CardTitle role="heading" aria-level={2}>
            Financial authority boundary
          </CardTitle>
          <CardDescription>
            The frontend cannot create or infer a financial transition.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <KeyValueList
            items={[
              ["Currency", "IDR only"],
              ["Payment authority", "Authenticated backend provider state"],
              ["Full refund", "Backend eligibility and approval workflow"],
              ["Client action", "Presentation only"],
              ["Manual Paid or Refunded control", "Not available"],
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export function FulfillmentView() {
  const handoffs = [
    ["Payment", "Verified paid state required before fulfillment"],
    ["Verification", "Artwork, quantity, and event scope reviewed"],
    ["Production", "Private production output remains access-controlled"],
    ["Delivery", "Authenticated provider evidence is required"],
    ["Receipt", "Organization confirms physical receipt and package count"],
    ["Activation", "One-time credential activates only eligible units"],
  ] as const;

  return (
    <div className="flex flex-col gap-8">
      <PageIntro
        title="Wristband fulfillment"
        description="A state-only contract preview for wristband orders and batches. No production file, token, provider payload, address, label, or tracking value is present in this frontend fixture."
        status="blocked"
      />

      <PreviewGate action="Create wristband order" title="Fulfillment is unavailable">
        <p>
          The organization must be Approved and the order must pass backend validation, verified payment,
          verification, production, quality control, delivery evidence, organization receipt, and
          activation checks in order.
        </p>
      </PreviewGate>

      <Card className="bg-background">
        <CardHeader>
          <CardTitle role="heading" aria-level={2}>
            Safe fulfillment projection
          </CardTitle>
          <CardDescription>
            The human projection may show Batch Activated after the complete server-owned sequence.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
            {fulfillmentStates.map((state, index) => (
              <li className="rounded-lg border p-3" key={state}>
                <p className="text-xs font-medium text-muted-foreground">Step {index + 1}</p>
                <div className="mt-2">
                  <StatusBadge status={state} />
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <DataTable label="Fulfillment handoff contract">
        <TableHeader>
          <th className="px-4 py-3 font-medium" scope="col">
            Handoff
          </th>
          <th className="px-4 py-3 font-medium" scope="col">
            Required evidence
          </th>
        </TableHeader>
        <tbody className="divide-y">
          {handoffs.map(([name, evidence]) => (
            <tr key={name}>
              <td className="w-48 px-4 py-3 font-medium">{name}</td>
              <td className="px-4 py-3 text-muted-foreground">{evidence}</td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </div>
  );
}

export function ReportsView() {
  return (
    <div className="flex flex-col gap-8">
      <PageIntro
        title="Organization reports"
        description="Reporting surfaces remain empty until the backend authorizes a tenant-scoped query. This fixture contains report definitions, not analytics values or exports."
        status="blocked"
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)]">
        <section aria-labelledby="report-catalog" className="flex flex-col gap-4">
          <div>
            <SectionTitle>Report catalog</SectionTitle>
            <p id="report-catalog" className="mt-1 text-sm text-muted-foreground">
              Each report must be filtered to the authenticated organization on the backend.
            </p>
          </div>
          <DataTable label="Organization report definition fixture">
            <TableHeader>
              <th className="px-4 py-3 font-medium" scope="col">
                Report
              </th>
              <th className="px-4 py-3 font-medium" scope="col">
                Safe scope
              </th>
              <th className="px-4 py-3 font-medium" scope="col">
                Current state
              </th>
            </TableHeader>
            <tbody className="divide-y">
              {reportFixtures.map((report) => (
                <tr key={report.name}>
                  <td className="px-4 py-3 font-medium">{report.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{report.scope}</td>
                  <td className="px-4 py-3 text-muted-foreground">{report.state}</td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </section>

        <Card className="bg-background">
          <CardHeader>
            <CardTitle role="heading" aria-level={2}>
              Export boundary
            </CardTitle>
            <CardDescription>
              Exports are commands, not client-side file generation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 text-sm leading-6">
              <li>Backend authorizes the actor, organization, report, fields, and format.</li>
              <li>No cross-organization filter is accepted from a browser header.</li>
              <li>No raw credential, private document, or unnecessary personal data is exported.</li>
              <li>Export activity is audited and delivered through the approved backend flow.</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button disabled type="button">
              Request report export
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export function SettingsView() {
  return (
    <div className="flex flex-col gap-8">
      <PageIntro
        title="Organization settings"
        description="Only non-secret organization settings belong in this surface. Restricted legal, tax, bank, signatory, role assignment, document, and provider data remain behind authorized backend responses."
        status="under_review"
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
        <Card className="bg-background">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle role="heading" aria-level={2}>
                Read-only fixture settings
              </CardTitle>
              <StatusBadge status="blocked" label="Editing disabled" />
            </div>
            <CardDescription>
              Values below are synthetic and contain no restricted organization data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <KeyValueList
              items={[
                ["Display name", organizationFixture.displayName],
                ["Tenant reference", <span className="break-all font-mono" key="tenant-reference">{organizationFixture.id}</span>],
                ["Default time zone", organizationFixture.defaultTimeZone],
                ["Verification status", <StatusBadge key="verification-status" status={organizationFixture.verificationStatus} />],
                ["Operational settings", "Locked until Approved"],
              ]}
            />
          </CardContent>
          <CardFooter>
            <Button disabled type="button">
              Edit organization settings
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-background">
          <CardHeader>
            <CardTitle role="heading" aria-level={2}>
              Security posture
            </CardTitle>
            <CardDescription>Client state never substitutes for server authorization.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 text-sm">
              <li className="flex items-center justify-between gap-3">
                <span>Tenant context</span>
                <StatusBadge status="active" label="Visible" />
              </li>
              <li className="flex items-center justify-between gap-3">
                <span>Browser authorization</span>
                <StatusBadge status="blocked" label="Disabled" />
              </li>
              <li className="flex items-center justify-between gap-3">
                <span>Browser storage of restricted data</span>
                <StatusBadge status="blocked" label="Prohibited" />
              </li>
              <li className="flex items-center justify-between gap-3">
                <span>Operational publication</span>
                <StatusBadge status="blocked" label="Locked" />
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
