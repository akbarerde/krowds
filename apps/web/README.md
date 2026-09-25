# KROWDS Web

The primary public KROWDS frontend for visitor-facing catalog and ticket journeys.

## Scope

- Public event, activity, session, and ticket-product discovery.
- Browser navigation, account state, checkout entry, and ticket-wallet presentation.
- Backend access through `@krowds/api`; this app does not own authentication, payment, persistence, or business state.
- Next.js rendering and browser flows only; no route handlers, Server Actions, databases, queues, or backend-only SDKs.

## Local development

```bash
pnpm --filter @krowds/web dev
```

Open http://localhost:3000.

## Validation

```bash
pnpm --filter @krowds/web lint
pnpm --filter @krowds/web typecheck
pnpm --filter @krowds/web build
```

## Related documentation

- [KROWDS documentation index](../../docs/INDEX.md)
- [Frontend/backend boundary](../../AGENTS.md)
- [Product vision](../../docs/01-product/PRODUCT-VISION.md)
