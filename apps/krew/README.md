# KROWDS Krew

The KROWDS KREW frontend for internal operational workspaces and collaboration.

## Scope

- KREW operations, fulfillment, production, quality, and support workspaces.
- Role- and organization-scoped browser views for operational evidence and controlled actions.
- Backend access through `@krowds/api`; authorization and business state remain in Go + Gin.
- Next.js rendering and browser flows only; no route handlers, Server Actions, databases, queues, or backend-only SDKs.

## Local development

```bash
pnpm --filter @krowds/krew dev
```

Open http://localhost:3002.

## Validation

```bash
pnpm --filter @krowds/krew lint
pnpm --filter @krowds/krew typecheck
pnpm --filter @krowds/krew build
```

## Related documentation

- [KROWDS documentation index](../../docs/INDEX.md)
- [Frontend/backend boundary](../../AGENTS.md)
- [Security requirements](../../docs/05-security/SECURITY.md)
- [Operations runbook](../../docs/07-operations/RUNBOOK.md)
