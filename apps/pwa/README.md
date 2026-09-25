# KROWDS PWA

The KROWDS progressive web application for an installable browser experience and an offline-capable presentation shell.

## Scope

- Installable PWA shell, manifest, and browser navigation.
- Service-worker fetch handling is limited to presentation and shell behavior.
- The service worker is registered only in production builds; it never authorizes payment, ticket issuance, wristband activation, redemption, or gate access.
- Backend access remains online through `@krowds/api`; stale or cached data must not be treated as authoritative business state.

## Local development

```bash
pnpm --filter @krowds/pwa dev
```

Open http://localhost:3004.

## Production-like local check

```bash
pnpm --filter @krowds/pwa build
pnpm --filter @krowds/pwa start
```

Then open http://localhost:3004 and use the browser install application menu where supported.

## Validation

```bash
pnpm --filter @krowds/pwa lint
pnpm --filter @krowds/pwa typecheck
pnpm --filter @krowds/pwa build
```

## Related documentation

- [KROWDS documentation index](../../docs/INDEX.md)
- [Frontend/backend boundary](../../AGENTS.md)
- [Security requirements](../../docs/05-security/SECURITY.md)
- [Operations runbook](../../docs/07-operations/RUNBOOK.md)
