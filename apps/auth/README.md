# KROWDS Auth

The KROWDS frontend for registration, login, session, OTP, recovery, and privileged authentication flows.

## Scope

- Registration, login, Google OIDC entry, email OTP, recovery, and MFA presentation.
- Browser session and challenge state only; the Go backend remains authoritative for identity, tokens, roles, and account state.
- Backend access through `@krowds/api`; no secrets, provider credentials, or authorization decisions belong in this app.
- Next.js rendering and browser flows only; no route handlers, Server Actions, databases, queues, or backend-only SDKs.

## Local development

```bash
pnpm --filter @krowds/auth dev
```

Open http://localhost:3001.

## Validation

```bash
pnpm --filter @krowds/auth lint
pnpm --filter @krowds/auth typecheck
pnpm --filter @krowds/auth build
```

## Related documentation

- [KROWDS documentation index](../../docs/INDEX.md)
- [Frontend/backend boundary](../../AGENTS.md)
- [Security requirements](../../docs/05-security/SECURITY.md)
