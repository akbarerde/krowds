# KROWDS Auth

The KROWDS frontend for registration, login, session, OTP, recovery, and privileged authentication flows.

## At a glance

| Item | Value |
| --- | --- |
| Workspace package | `@krowds/auth` |
| Local URL | http://localhost:3001 |
| Framework | Next.js 16 App Router |
| Runtime | React 19, TypeScript, Tailwind CSS 4 |
| Shared UI | `@krowds/ui`, shadcn/ui preset `b2fA` |
| Current route | `/` |

## Current implementation status

This workspace is currently an authentication-surface scaffold. `src/app/page.tsx` demonstrates the KROWDS visual foundation and the intended authentication surface. Registration, login, OIDC, OTP, MFA, session cookies, account recovery, and account linking are target flows and are not yet implemented in this app.

## Target responsibilities

- Present registration, sign-in, recovery, OTP, MFA, and session-expiry states.
- Start approved Google OIDC and email OTP flows through the backend boundary.
- Display safe authentication errors without revealing whether an account exists.
- Keep privileged MFA and step-up requirements visible and enforceable by the backend.
- Never store provider secrets, readable OTPs, private keys, or authorization policy in the browser.

## Local development

Run commands from the repository root:

```bash
pnpm install
pnpm --filter @krowds/auth dev
```

Open http://localhost:3001.

To run the production-like server:

```bash
pnpm --filter @krowds/auth build
pnpm --filter @krowds/auth start
```

## Commands

| Task | Command |
| --- | --- |
| Development server | `pnpm --filter @krowds/auth dev` |
| Production build | `pnpm --filter @krowds/auth build` |
| Production server | `pnpm --filter @krowds/auth start` |
| Lint | `pnpm --filter @krowds/auth lint` |
| Typecheck | `pnpm --filter @krowds/auth typecheck` |
| Clean generated files | `pnpm --filter @krowds/auth clean` |

## Configuration

- No app-specific environment variables are currently defined.
- `next.config.ts` keeps `agentRules: false` so this app does not regenerate nested instruction files.
- `components.json` points shared UI imports to `@krowds/ui` and uses the approved Nova/neutral/Lucide preset.
- Authentication provider configuration belongs in the backend deployment contract, not in committed frontend secrets.

## Architecture boundary

This app may contain browser rendering, form state, navigation, and user-facing authentication feedback only. It must not add:

- route handlers, Server Actions, or backend middleware logic;
- provider secrets, token signing, MFA secrets, or role decisions;
- databases, queues, or backend-only SDKs;
- a local authorization fallback when the backend is unavailable.

The Go backend remains authoritative for identity, sessions, OTP challenges, MFA, account state, and authorization.

## Project structure

```text
apps/auth/
├── src/app/
│   ├── layout.tsx       # Metadata, fonts, and global styles
│   ├── page.tsx         # Current authentication foundation screen
│   └── favicon.ico
├── components.json      # shadcn/ui configuration
├── next.config.ts
├── package.json
└── README.md
```

## Definition of ready

- [ ] Authentication routes and states match the approved security requirements.
- [ ] OIDC, OTP, recovery, MFA, session, and step-up flows are tested.
- [ ] Browser errors do not disclose account existence or secrets.
- [ ] No authorization or token authority is implemented in the frontend.
- [ ] Lint, typecheck, build, security, and accessibility tests pass.

## Related documentation

- [KROWDS monorepo README](../../README.md)
- [KROWDS documentation index](../../docs/INDEX.md)
- [Software requirements](../../docs/02-requirements/SRS.md)
- [Security requirements](../../docs/05-security/SECURITY.md)
- [API contract](../../docs/04-domain/API-CONTRACT.md)
- [Frontend/backend boundary](../../AGENTS.md)
