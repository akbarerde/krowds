# KROWDS Krew

The internal KROWDS operations workspace for queue triage, casework, wristband fulfillment, inventory, quality, support, audit evidence, and privileged-action review.

## At a glance

| Item | Value |
| --- | --- |
| Workspace package | `@krowds/krew` |
| Local URL | http://localhost:3002 |
| Framework | Next.js 16.3 App Router, React 19, TypeScript |
| Styling | Tailwind CSS 4, semantic tokens, shadcn/ui preset `b2fA` |
| Shared primitives | `@krowds/ui` Button, Card, and Badge |
| Data mode | Typed, synthetic, local fixtures only |
| Backend mutations | None; sensitive commands fail closed |

## Routes

| Route | Purpose | Fixture scope |
| --- | --- | --- |
| `/` | Operational posture, priority queues, authority boundary, recent evidence | All scoped fixture records |
| `/queues` | Capability-filtered queue intake and a cleared-queue empty state | Operations, production, quality, fulfillment, support, admin |
| `/cases` | Identity review, order exception, and incident cases | `operations` |
| `/orders` | IDR wristband-order review and safe payment evidence | `production` |
| `/fulfillment` | Production batches, quality handoff, shipment state, private-file boundary | `fulfillment` |
| `/inventory` | Stock-state ledger, quantity reconciliation, blocked adjustment | `operations` |
| `/quality` | Inspection queue, quarantine, release-ready empty state | `quality_control` |
| `/support` | Redacted support casework and blocked response command | `support` |
| `/audit` | Correlated audit evidence with request, trace, and redaction metadata | `admin` |
| `/access` | MFA, step-up, dual-approval, and break-glass fail-closed states | `admin` |

The responsive shell keeps a persistent desktop sidebar, a keyboard-focusable mobile navigation strip, a skip link, current-page labeling, and one synthetic organization context.

## Roles and capabilities

The only role represented here is the fixed internal `krew` role. KREW capability values are not additional roles:

- `operations`
- `production`
- `quality_control`
- `fulfillment`
- `support`
- `admin`

`src/lib/krew-fixtures.ts` defines the typed fixture principal with all capabilities so every route can be reviewed locally. `src/components/workspace-shell.tsx` filters navigation by those capabilities. Capability visibility never authorizes a mutation, and there is intentionally no browser role or break-glass toggle.

The Go backend remains authoritative for the authenticated principal, organization context, field-level authorization, MFA, step-up, dual approval, current row version, idempotency, and audit writes.

## Operational states

| State | Implementation |
| --- | --- |
| Loading | `src/app/loading.tsx` preserves the workspace shell and announces progress near the affected content. Motion is disabled under reduced-motion preferences. |
| Empty | Queue, quality, support, and audit pages include explicit no-work/no-match states with context and a safe recovery path. |
| Error | `src/app/error.tsx` is a Next.js 16 Client Component using the stable `retry` prop. It shows only a digest/correlation reference and never exposes an error message, stack, provider payload, or personal data. |
| Ready | Typed fixture records render organization scope, state, owner, timestamp, evidence count, and correlation IDs. |
| Disabled | Commands that require backend permission are visibly disabled with the missing authority or contract reason. |
| Offline | No cached grant, stale authorization, or offline operational decision is represented. |

## Sensitive action controls

`/access` presents backend-issued fixture assertions and visible confirmation states for:

| Action | Required controls | Fixture outcome |
| --- | --- | --- |
| Approve wristband order | Active KREW role, MFA, reason, current row version | Backend authorization required |
| Activate delivered batch | Role, MFA, step-up, reason, idempotency key, current row version | Step-up missing |
| Export restricted evidence | Role, MFA, step-up, dual approval, reason | Second approver missing |
| Open break-glass access | Incident ID, role, MFA, step-up, two approvals, purpose, maximum four-hour window | Denied in fixture |

All **Confirm with backend** buttons are disabled. The fixture has no client mutation, challenge response, approval switch, or authority override. A production command must be added only after the backend contract is available through `@krowds/api` and must independently re-evaluate permission and state at execution time.

## Typed fixtures and data safety

`src/lib/krew-fixtures.ts` is the single local fixture source. It uses explicit TypeScript unions and `satisfies` checks for:

- the KREW principal and capability-filtered navigation;
- work queues and case/incident records;
- IDR wristband orders and fulfillment batches;
- inventory and quantity reconciliation;
- quality inspections, support cases, and audit events;
- correlation IDs and sensitive-action gates.

Every organization-scoped fixture uses the single synthetic `org_fixture_01` context. There is no production customer data, no second organization, no cross-organization join, no secret, no credential, no QR token, no activation code, and no provider-signed URL.

## Redaction

The UI displays safe metadata only. It explicitly marks or omits:

- identity numbers, legal names, email addresses, and phone numbers;
- shipping addresses and recipient contact details;
- provider signatures and raw provider payloads;
- private production-file contents, QR payloads, wristband codes, and signed URLs;
- payment credentials, cookies, bearer tokens, MFA codes, and secret values.

Audit records show actor, action, target, outcome, reason code, request ID, trace ID, and the names of redacted fields rather than the underlying values.

## Contract gaps

The workspace is a frontend contract prototype, not a connected backend client. The following gaps block production mutation or live data safely:

1. `@krowds/api` does not yet expose validated KREW queue, case, order, batch, inventory, quality, support, and audit operations to this app.
2. The authenticated KREW principal, trusted organization context, session expiry, and field-level response shape still need generated shared contracts.
3. Step-up challenge, dual-approval, restricted-export, and break-glass request/response contracts are not available; their UI state here follows the approved requirement baseline only.
4. Cursor pagination, RFC 7807 problem mapping, `ETag`/`If-Match`, and idempotency handling are not connected.
5. Provider reconciliation and private-file access must remain backend-only; only short-lived, audited references may reach the browser.
6. Shared shadcn `Table`, `Dialog`, `Empty`, and `Skeleton` primitives are not currently installed. This app uses the available shared `Card`, `Button`, and `Badge` primitives plus semantic page composition; additions belong in `packages/ui` in a separately authorized change.
7. The real KREW role/capability matrix and named privileged approver roster are controlled backend and governance inputs, not frontend assumptions.

## Architecture boundary

This app contains rendering, navigation, and browser presentation only. It must not add:

- Next.js route handlers, Server Actions, proxy/middleware authorization, databases, queues, or backend SDKs;
- browser-side role, MFA, approval, payment, inventory, activation, or break-glass authority;
- direct calls to Xendit, Biteship, Resend, Google Cloud, or Secret Manager;
- offline access grants, payment overrides, multi-use behavior, or cross-organization data.

All future backend calls must go through `@krowds/api`. The Go + Gin service and PostgreSQL RLS remain authoritative.

## Project structure

```text
apps/krew/src/
├── app/
│   ├── access/page.tsx       # Fail-closed privileged controls
│   ├── audit/page.tsx        # Redacted correlated evidence
│   ├── cases/page.tsx        # Case and incident work
│   ├── error.tsx             # Next.js route error boundary
│   ├── fulfillment/page.tsx  # Batches and shipment handoff
│   ├── inventory/page.tsx    # Stock and reconciliation
│   ├── layout.tsx            # Fonts, metadata, workspace shell
│   ├── loading.tsx           # Route loading state
│   ├── orders/page.tsx       # Wristband-order review
│   ├── page.tsx              # Operational overview
│   ├── quality/page.tsx      # Inspection and quarantine
│   ├── queues/page.tsx       # Role-scoped queues
│   └── support/page.tsx      # Redacted support work
├── components/
│   └── workspace-shell.tsx   # App-specific responsive role-scoped shell
└── lib/
    └── krew-fixtures.ts      # Typed synthetic local fixtures
```

## Local development

Run from the repository root:

```bash
pnpm install
pnpm --filter @krowds/krew dev
```

Open http://localhost:3002.

## Validation

```bash
pnpm --filter @krowds/krew lint
pnpm --filter @krowds/krew typecheck
pnpm --filter @krowds/krew build
```

Optional repository boundary validation:

```bash
pnpm test:architecture
```

## Related documentation

- [KROWDS monorepo README](../../README.md)
- [KROWDS documentation index](../../docs/INDEX.md)
- [Software requirements](../../docs/02-requirements/SRS.md)
- [API contract](../../docs/04-domain/API-CONTRACT.md)
- [State machines](../../docs/04-domain/STATE-MACHINES.md)
- [Security requirements](../../docs/05-security/SECURITY.md)
- [Operations runbook](../../docs/07-operations/RUNBOOK.md)
- [Frontend/backend boundary](../../AGENTS.md)
