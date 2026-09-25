# KROWDS Org

The KROWDS frontend for organization onboarding, team access, and tenant-scoped operations. This workspace is a frontend-only, fail-closed presentation backed by typed synthetic fixtures until the Go API contracts are connected and authorized.

## At a glance

| Item | Value |
| --- | --- |
| Workspace package | `@krowds/org` |
| Local URL | `http://localhost:3003` |
| Framework | Next.js 16.3 App Router |
| Runtime | React 19, TypeScript, Tailwind CSS 4 |
| Shared UI | `@krowds/ui`, shadcn/ui preset `b2fA` |
| Data mode | Typed local synthetic fixtures; no backend mutation connected |
| Current fixture | Tenant `org_fixture_7f3a`, organization `under_review`, active `organization_owner_admin` membership, effective operational access `blocked` |

## Route and state inventory

| Route | Responsibility | Fixture states and fail-closed behavior |
| --- | --- | --- |
| `/` | Tenant overview, onboarding decision, access context, operations readiness | Shows that an active membership still cannot operate an unapproved organization; operational areas remain blocked. |
| `/onboarding` | Organization verification lifecycle and required-data categories | Explicitly presents `draft`, `submitted`, `under_review`, `revision_required`, `approved`, `rejected`, `suspended`, and `closed`; no browser transition is available. |
| `/documents` | Private verification-object presentation | Shows synthetic opaque references and `verified`, `pending_review`, and `replacement_required`; upload, preview, replacement, and download commands are disabled. |
| `/members` | Individual memberships, fixed roles, lifecycle, and revocation presentation | Covers `invited`, `active`, `suspended`, `revoked`, `declined`, and `expired`; custom and multi-role grants are not represented. |
| `/invitations` | Single-use invitation lifecycle | Covers awaiting acceptance, accepted, declined, expired, and invalidated; no email, invitation token, or target is collected. |
| `/access` | Membership and organization access review | Makes session, membership, role, organization state, and tenant/RLS checks explicit; browser authorization is not evaluated or trusted. |
| `/catalog` | Organization → Venue → Event → optional Activity/Session → ticket product presentation | Shows a synthetic `draft` hierarchy and `draft` products; publication and configuration commands are disabled. |
| `/tickets` | Order and single-use ticket state projections | Presents order and ticket lifecycles without data or financial mutations; no control can mark an order paid or refunded. |
| `/fulfillment` | Wristband order, batch, delivery, receipt, and activation contract | Presents safe states and handoffs only; production files, credentials, provider payloads, addresses, labels, and tracking values are absent. |
| `/reports` | Tenant-scoped report catalog and export boundary | Defines ticket, attendance, fulfillment, and access-review reports without sample analytics; report queries and exports are disabled. |
| `/settings` | Non-secret organization settings and security posture | Shows only synthetic display name, opaque tenant reference, time zone, and state; restricted data and mutations are excluded. |

## Tenant and membership isolation

- The shell displays the current opaque tenant reference on every route so cross-organization context is always visible.
- The local fixture combines an `under_review` organization with an `active` `organization_owner_admin` membership. Effective operational access remains `blocked` until the backend returns an Approved organization.
- Routes and controls are presentation-only. The frontend does not derive authority from a selected tenant, route parameter, request body, browser header, cached role, or hidden input.
- Production organization scope must come from the authenticated active membership and be enforced again by the Go application and PostgreSQL RLS. The API must reject a path organization that does not match the authenticated membership.
- The frontend must not send or rely on `X-Organization-ID`; the human-readable API contract marks that header as invalid.
- Closed organizations are read-only, Suspended organizations block operations, and Rejected/Revision Required states expose only their approved correction or support paths.

## Fixture policy

All fixtures live in `src/lib/fixtures.ts` and are synthetic, typed, and intentionally incomplete as live data.

- No production IDs, personal information, legal entity values, registration values, tax identifiers, addresses, bank details, signatory details, document names, document bytes, private object paths, invitation tokens, credentials, or provider payloads are included.
- Synthetic fixed-role assignments are shown only to make membership lifecycle states inspectable. They are not authorization claims.
- No fixture or view writes to `localStorage`, `sessionStorage`, IndexedDB, cookies, URLs, telemetry, analytics, or logs.
- The secure upload route is intentionally non-functional. A connected implementation must use a backend-authorized private-object command and return only safe metadata/opaque references by default.
- The disabled buttons communicate missing backend contracts; they are not simulated mutations.

## Backend contract gates

The UI is ready to be connected, but no live command is implemented until these gates are satisfied:

| Gate | Required contract before enabling UI commands |
| --- | --- |
| Session context | Authenticated `me` response with current active memberships; secure backend-owned session lifecycle and immediate revocation. |
| Organization scope | Organization summary and onboarding response whose path tenant matches the authenticated membership; backend application authorization plus forced PostgreSQL RLS. |
| Onboarding | Create/read/update/submit organization operations with required fields, redacted review results, state guards, reasons, idempotency, optimistic concurrency, and audit evidence. |
| Private documents | Authorized private-object upload and object-access commands with content validation, encryption, opaque IDs, no public URL, short-lived access, and audit evidence. |
| Invitations | Organization-bound, intended-user-bound, single-use, expiring invitation commands with exactly one fixed role and no readable token returned to the browser. |
| Memberships | Per-membership role/suspend/restore/revoke commands with `If-Match`, idempotency, controlled reasons, reauthentication where policy requires it, and immediate authorization effects. |
| Catalog | Same-organization venue/event/activity/session/product commands; publication remains blocked unless organization status is Approved. |
| Tickets | Tenant-authorized reads and commands only; financial state remains authenticated provider-backed state and cannot be set by the UI. |
| Fulfillment | Safe order/batch projections plus backend-authorized receipt and activation commands; private production files and credential material remain excluded. |
| Reports | Backend-authorized, tenant-filtered report queries and export jobs with field minimization and audit evidence. |
| Settings | Explicit non-secret settings schema and mutation contract; restricted onboarding fields remain in their dedicated protected flows. |
| Contract artifact | `KROWDS-OD-022` keeps the generated OpenAPI 3.1 artifact and contract tests as a release gate for external integration. |
| Frontend configuration | `KROWDS-OD-024` keeps the environment-specific public frontend configuration and browser network trace as a deployment gate. |
| Legal/provider evidence | `KROWDS-OD-013`, `KROWDS-OD-014`, and provider decisions in `KROWDS-OD-005` through `KROWDS-OD-012` remain open; this UI does not invent legal, tax, payment, email, or shipping facts. |

See `docs/04-domain/API-CONTRACT.md`, `docs/04-domain/STATE-MACHINES.md`, `docs/04-domain/DATA-MODEL.md`, `docs/05-security/SECURITY.md`, and `docs/00-governance/OPEN-DECISIONS.md` for the authoritative contracts and unresolved gates.

## Accessibility and responsive behavior

- A keyboard-visible skip link precedes the tenant shell.
- Navigation uses semantic links, `aria-current`, grouped `nav` labels, and a native mobile disclosure control.
- Tables use captions and scoped headers, wrap in horizontal overflow on narrow screens, and never rely on color alone for state.
- Commands that cannot be authorized are natively disabled and paired with a visible explanation of the missing backend gate.
- Layouts collapse from a desktop sidebar to a mobile header and single-column content without removing tenant or access context.
- Focus, disabled, hover, and active states come from the approved shared shadcn/ui primitives and semantic tokens.

## Local development

Run commands from the repository root:

```bash
pnpm.cmd install
pnpm.cmd --filter @krowds/org dev
```

Open `http://localhost:3003`.

For a production-like server:

```bash
pnpm.cmd --filter @krowds/org build
pnpm.cmd --filter @krowds/org start
```

## Validation

| Task | Command |
| --- | --- |
| Development server | `pnpm.cmd --filter @krowds/org dev` |
| Lint | `pnpm.cmd --filter @krowds/org lint` |
| Typecheck and route types | `pnpm.cmd --filter @krowds/org typecheck` |
| Production build | `pnpm.cmd --filter @krowds/org build` |
| Clean generated files | `pnpm.cmd --filter @krowds/org clean` |

Run all three required checks before handoff:

```bash
pnpm.cmd --filter @krowds/org lint
pnpm.cmd --filter @krowds/org typecheck
pnpm.cmd --filter @krowds/org build
```

Last validated on 2026-09-25: lint, route type generation/typecheck, and the Next.js production build passed; the build completed with 14 statically generated pages. Desktop and narrow responsive layouts were also inspected against the production server.

## Architecture boundary

This app may contain rendering, navigation, form state, and browser-facing organization flows only. It must not add:

- route handlers, Server Actions, or backend `proxy.ts`/`middleware.ts` logic;
- databases, queues, storage adapters, or backend-only SDKs;
- client-side tenant or role authorization;
- direct calls to Xendit, Resend, Biteship, Cloud Storage, BigQuery, or other providers;
- document upload paths that bypass backend authorization, encryption, validation, and audit;
- writes of legal, tax, bank, signatory, real role assignment, document, invitation, or credential values to browser storage or logs.

The Go backend and forced PostgreSQL RLS remain authoritative for organization scope, membership, roles, state transitions, documents, invitations, commerce, fulfillment, reports, and settings.

## Project structure

```text
apps/org/
├── src/app/
│   ├── access/page.tsx
│   ├── catalog/page.tsx
│   ├── documents/page.tsx
│   ├── fulfillment/page.tsx
│   ├── invitations/page.tsx
│   ├── members/page.tsx
│   ├── onboarding/page.tsx
│   ├── reports/page.tsx
│   ├── settings/page.tsx
│   ├── tickets/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── src/components/
│   ├── status-badge.tsx
│   ├── workspace-shell.tsx
│   └── workspace-views.tsx
├── src/lib/fixtures.ts
├── components.json
├── next.config.ts
├── package.json
└── README.md
```

## Definition of ready

Frontend acceptance:

- [x] Tenant and membership context is visible on every route.
- [x] All eight organization verification states are explicit.
- [x] Membership, invitation, revocation, private document, catalog, ticket, fulfillment, reporting, and settings presentations exist.
- [x] Operational controls fail closed for the unapproved fixture organization.
- [x] Typed fixtures contain synthetic non-sensitive values only.
- [x] No browser storage, logging, route handler, Server Action, provider call, or browser authorization was added.
- [ ] Live commands remain blocked until the backend contract and release gates above are implemented and approved.

## Related documentation

- [KROWDS monorepo README](../../README.md)
- [KROWDS documentation index](../../docs/INDEX.md)
- [Software requirements](../../docs/02-requirements/SRS.md)
- [API contract](../../docs/04-domain/API-CONTRACT.md)
- [State machines](../../docs/04-domain/STATE-MACHINES.md)
- [Data model](../../docs/04-domain/DATA-MODEL.md)
- [Security](../../docs/05-security/SECURITY.md)
- [Open decisions](../../docs/00-governance/OPEN-DECISIONS.md)
- [Frontend/backend boundary](../../AGENTS.md)
