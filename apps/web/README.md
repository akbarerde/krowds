# KROWDS Web

The KROWDS public frontend for event operators and the visitors they serve. The homepage leads with the B2B operating model, while the event, ticket, checkout, and account routes provide a typed visitor-facing preview. This milestone is frontend-only and fixture-backed: it does not create orders, accept payments, authenticate users, or expose authoritative business state.

## At a glance

| Item | Value |
| --- | --- |
| Workspace package | `@krowds/web` |
| Local URL | http://localhost:3000 |
| Framework | Next.js 16.3 App Router |
| Runtime | React 19, TypeScript, Tailwind CSS 4 |
| Shared UI | `@krowds/ui`, shadcn/ui preset `b2fA` |
| Data source | `src/lib/fixtures.ts` (synthetic, typed, local only) |
| Backend boundary | Go + Gin owns business state and provider authority |

## Routes

| Route | Purpose | State coverage |
| --- | --- | --- |
| `/` | B2B product landing | Operating model, product workflow, accountable handoffs |
| `/events` | Event discovery | Search, category filters, populated and empty results |
| `/events/[slug]` | Event detail | Schedule, ticket products, venue, accessibility, safe checkout entry |
| `/events/[slug]/loading` | Streaming fallback for event detail | Accessible loading skeleton |
| `/tickets` | Ticket wallet | Issued, used, pending-payment records; account fallback notice |
| `/tickets?view=empty` | Ticket wallet empty-state review | Explicit empty explanation and recovery action |
| `/checkout` | Checkout entry chooser | Event selection without order creation |
| `/checkout/[slug]` | Checkout preview for one event | Local quantity, holder, and approved method selection |
| `/checkout/status?order=...` | Payment status preview | Pending, paid, failed, and expired safe states |
| `/account` | Account context | Demo profile, ticket/payment context, privacy boundary |
| `/account/context` | Account-context alias | Same server-rendered account view |

Unknown event, checkout, and payment references render a route-specific not-found state. Route-level `error.tsx` and `loading.tsx` files provide safe recovery and progress feedback for the catalog, wallet, and checkout surfaces.

## Local fixtures

`src/lib/fixtures.ts` is the single fixture source for this milestone. It contains typed records for:

- four synthetic events with venue, schedule, category, ticket product, and accessibility data;
- three synthetic wallet tickets with `issued`, `used`, and `pending payment` states;
- four synthetic payment references with `pending`, `paid`, `failed`, and `expired` states;
- a synthetic account context using the reserved `.test` email domain.

Fixture values are illustrative only. They must not be treated as live inventory, real identity data, payment evidence, QR credentials, provider references, or authorization decisions. QR/token material is intentionally absent.

The payment status page selects a fixture by an opaque order reference only. It deliberately ignores browser-supplied `state` or `status` values. A client redirect, URL, local flag, or form value cannot mark an order paid.

## Commands

Run commands from the repository root:

```bash
pnpm install
pnpm --filter @krowds/web dev
```

Open http://localhost:3000.

| Task | Command |
| --- | --- |
| Development server | `pnpm --filter @krowds/web dev` |
| Lint | `pnpm --filter @krowds/web lint` |
| Typecheck | `pnpm --filter @krowds/web typecheck` |
| Production build | `pnpm --filter @krowds/web build` |
| Production server | `pnpm --filter @krowds/web start` |
| Clean generated files | `pnpm --filter @krowds/web clean` |

The app is expected to pass the scoped lint, typecheck, and production build commands before handoff.

## Frontend architecture

- `src/app/layout.tsx` owns document metadata, Geist font variables, global shared styles, and the public shell.
- `src/components/site-shell.tsx` is a Server Component composition of the shared `Button` and `Badge` primitives. It provides skip navigation, responsive primary navigation, account context, and footer context.
- Route pages and layout compositions are Server Components by default. `src/components/checkout-selection.tsx` is the only interactive client island; it uses local state for a preview selection and navigates to the status route without submitting payment or personal data.
- Shared visual primitives come from `@krowds/ui`; semantic tokens come from `@krowds/ui/globals.css`. No local design system or copied primitive is introduced.
- `next/font/google` provides the existing Geist and Geist Mono variables.

## Backend handoff gaps

Before this preview can become a live commerce surface, the Go-owned service and shared API package must provide and agree on:

1. **Public catalog contract** for published, sale-window-eligible events, sessions, ticket products, exact IDR prices, availability, and safe not-found behavior. The current `GET /organizations/...` API document is organization-member scoped; a public discovery projection and its authorization rules are still required.
2. **Browser API client** through `@krowds/api`, including secure session handling, request correlation, typed problem responses, and the environment-specific public API origin. No API calls are made by this milestone.
3. **Identity and ticket-holder contract** for named holders, verified identity references, guardian requirements, and the maximum quantity/active-ticket rules. The preview form intentionally does not submit holder data.
4. **Order and payment contract** for creating an idempotent pending order, requesting an approved Xendit instruction, retrieving canonical payment state, and handling expiry/failure. The browser must not submit an authoritative total or payment outcome.
5. **Verified provider event path** for Xendit status, replay resistance, idempotent processing, and ticket issuance. A client redirect must remain only a navigation event, never proof of payment.
6. **Authenticated account and ticket-wallet contract** for `/me`, owned ticket summaries, safe delivery state, and authorized organization scope. The fixture account is not a session.
7. **Access and QR boundary** for the approved PWA redemption/access flow. No plaintext QR token, token hash, or gate credential may be placed in this public page, URL, or browser storage.
8. **Error and retry policy** for loading, empty, temporary provider failure, expired instruction, unauthorized account context, and safe retry. The local error screens demonstrate presentation only.

Provider account identifiers, exact public API payloads, authentication/session implementation, and production payment configuration remain backend/provider handoff decisions. Do not infer them from the fixtures.

## Boundary rules

This app may contain Next.js rendering, navigation, metadata, and browser-facing UI state only. It must not add:

- route handlers or Server Actions;
- backend `proxy.ts` or `middleware.ts` logic;
- databases, queues, or backend-only SDKs;
- payment secrets, provider credentials, or privileged authorization decisions.

Business state remains in the Go backend under `services/` and is protected by organization-scoped RLS. Frontend requests must go through `@krowds/api` when that contract is implemented.

## Project structure

```text
apps/web/
├── src/app/
│   ├── account/
│   ├── checkout/
│   │   ├── [slug]/
│   │   └── status/
│   ├── events/
│   │   └── [slug]/
│   ├── tickets/
│   ├── error.tsx
│   ├── global-error.tsx
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── not-found.tsx
│   └── page.tsx
├── src/components/
│   ├── checkout-selection.tsx
│   ├── event-card.tsx
│   ├── site-navigation.tsx
│   └── site-shell.tsx
├── src/lib/
│   ├── fixtures.ts
│   └── format.ts
├── components.json
├── next.config.ts
├── package.json
└── README.md
```

## Definition of ready

- [x] Responsive public shell, navigation, metadata, skip link, and accessible focus states.
- [x] Event discovery, search, category filters, detail, schedule, venue, and empty states.
- [x] Ticket wallet with issued, used, pending-payment, and empty states.
- [x] Checkout entry and isolated local selection interaction.
- [x] Payment status presentation for pending, paid, failed, and expired states without trusting browser state.
- [x] Typed synthetic fixtures and no QR/payment credentials in the public app.
- [x] README records route behavior, fixture boundaries, commands, and backend contract gaps.
- [ ] Replace fixtures with approved `@krowds/api` calls after the public catalog and account contracts are approved.
- [ ] Connect order/payment commands through the Go-owned API and verified provider event path.
- [ ] Add the approved authenticated identity, ticket-wallet, and access boundaries.
- [ ] Run and retain scoped lint, typecheck, build, accessibility, and integration evidence for release.

## Related documentation

- [KROWDS monorepo README](../../README.md)
- [KROWDS documentation index](../../docs/INDEX.md)
- [Product vision](../../docs/01-product/PRODUCT-VISION.md)
- [Design system](../../docs/03-architecture/DESIGN.md)
- [API contract](../../docs/04-domain/API-CONTRACT.md)
- [Frontend/backend boundary](../../AGENTS.md)
