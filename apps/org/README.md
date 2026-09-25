# KROWDS Org

The KROWDS frontend for organization onboarding, team access, and organization-scoped operations.

## Scope

- Organization onboarding, review status, team membership, invitations, and fixed-role views.
- Organization-scoped catalog, ticket, fulfillment, and operational navigation.
- Backend access through `@krowds/api`; tenant authorization and persistence remain in Go + Gin and PostgreSQL RLS.
- Next.js rendering and browser flows only; no route handlers, Server Actions, databases, queues, or backend-only SDKs.

## Local development

```bash
pnpm --filter @krowds/org dev
```

Open http://localhost:3003.

## Validation

```bash
pnpm --filter @krowds/org lint
pnpm --filter @krowds/org typecheck
pnpm --filter @krowds/org build
```

## Related documentation

- [KROWDS documentation index](../../docs/INDEX.md)
- [Frontend/backend boundary](../../AGENTS.md)
- [Product requirements](../../docs/01-product/PRD.md)
- [Security requirements](../../docs/05-security/SECURITY.md)
