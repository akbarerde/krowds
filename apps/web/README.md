# KROWDS Web

The primary public KROWDS frontend for visitor-facing catalog and ticket journeys.

## At a glance

| Item | Value |
| --- | --- |
| Workspace package | `@krowds/web` |
| Local URL | http://localhost:3000 |
| Framework | Next.js 16 App Router |
| Runtime | React 19, TypeScript, Tailwind CSS 4 |
| Shared UI | `@krowds/ui`, shadcn/ui preset `b2fA` |
| Current route | `/` |

## Current implementation status

This workspace is currently a frontend scaffold. The implemented entry screen is `src/app/page.tsx`; it demonstrates the shared KROWDS header, badges, cards, typography, and frontend foundation. No production API calls, payment flow, authentication logic, or ticket business workflow is implemented in this app yet.

## Target responsibilities

- Present approved Venue, Event, Activity, Session, and ticket-product information.
- Provide browser navigation for public discovery, account context, checkout entry, and ticket-wallet views.
- Keep browser state separate from authoritative payment, ticket, identity, and access state in Go + Gin.
- Use `@krowds/api` for backend requests once the API contract is implemented.
- Meet the accessibility, responsive, and performance baselines in the product documentation.

## Local development

Run commands from the repository root:

```bash
pnpm install
pnpm --filter @krowds/web dev
```

Open http://localhost:3000.

To run the production-like server:

```bash
pnpm --filter @krowds/web build
pnpm --filter @krowds/web start
```

## Commands

| Task | Command |
| --- | --- |
| Development server | `pnpm --filter @krowds/web dev` |
| Production build | `pnpm --filter @krowds/web build` |
| Production server | `pnpm --filter @krowds/web start` |
| Lint | `pnpm --filter @krowds/web lint` |
| Typecheck | `pnpm --filter @krowds/web typecheck` |
| Clean generated files | `pnpm --filter @krowds/web clean` |

## Configuration

- No app-specific environment variables are currently defined.
- `next.config.ts` keeps `agentRules: false` so this app does not regenerate nested instruction files.
- `components.json` points shared UI imports to `@krowds/ui` and uses the approved Nova/neutral/Lucide preset.
- Shared styles are loaded from `@krowds/ui/globals.css`.

## Architecture boundary

This app may contain Next.js rendering, navigation, UI state, and browser-facing flows only. It must not add:

- route handlers or Server Actions;
- backend `proxy.ts` or `middleware.ts` logic;
- databases, queues, or backend-only SDKs;
- payment secrets, provider credentials, or privileged authorization decisions.

Business state remains in the Go backend under `services/` and is protected by organization-scoped RLS.

## Project structure

```text
apps/web/
├── src/app/
│   ├── layout.tsx       # Metadata, fonts, and global styles
│   ├── page.tsx         # Current public foundation screen
│   └── favicon.ico
├── components.json      # shadcn/ui configuration
├── next.config.ts
├── package.json
└── README.md
```

## Definition of ready

- [ ] Public routes are implemented against the API contract.
- [ ] Loading, empty, error, and unauthorized states are accessible.
- [ ] Browser flows contain no authoritative business or payment logic.
- [ ] Lint, typecheck, build, and relevant integration tests pass.
- [ ] Documentation links and product requirements remain synchronized.

## Related documentation

- [KROWDS monorepo README](../../README.md)
- [KROWDS documentation index](../../docs/INDEX.md)
- [Product requirements](../../docs/01-product/PRD.md)
- [API contract](../../docs/04-domain/API-CONTRACT.md)
- [Frontend/backend boundary](../../AGENTS.md)
