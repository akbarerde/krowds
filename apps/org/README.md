# KROWDS Org

The KROWDS frontend for organization onboarding, team access, and organization-scoped operations.

## At a glance

| Item | Value |
| --- | --- |
| Workspace package | `@krowds/org` |
| Local URL | http://localhost:3003 |
| Framework | Next.js 16 App Router |
| Runtime | React 19, TypeScript, Tailwind CSS 4 |
| Shared UI | `@krowds/ui`, shadcn/ui preset `b2fA` |
| Current route | `/` |

## Current implementation status

This workspace is currently an organization-surface scaffold. `src/app/page.tsx` demonstrates the KROWDS visual foundation and intended organization workspace. Onboarding submissions, document uploads, membership mutations, role changes, and organization-scoped API calls are not yet implemented in this app.

## Target responsibilities

- Present organization profile, onboarding status, review, revision, approval, and rejection states.
- Manage invitations, individual memberships, fixed roles, and revocation through backend commands.
- Provide organization-scoped navigation for catalog, tickets, fulfillment, reporting, and settings.
- Keep tenant context visible and prevent cross-organization assumptions in the UI.
- Display private legal, tax, bank, signatory, and operational data only through approved backend responses.

## Local development

Run commands from the repository root:

```bash
pnpm install
pnpm --filter @krowds/org dev
```

Open http://localhost:3003.

To run the production-like server:

```bash
pnpm --filter @krowds/org build
pnpm --filter @krowds/org start
```

## Commands

| Task | Command |
| --- | --- |
| Development server | `pnpm --filter @krowds/org dev` |
| Production build | `pnpm --filter @krowds/org build` |
| Production server | `pnpm --filter @krowds/org start` |
| Lint | `pnpm --filter @krowds/org lint` |
| Typecheck | `pnpm --filter @krowds/org typecheck` |
| Clean generated files | `pnpm --filter @krowds/org clean` |

## Configuration

- No app-specific environment variables are currently defined.
- `next.config.ts` keeps `agentRules: false` so this app does not regenerate nested instruction files.
- `components.json` points shared UI imports to `@krowds/ui` and uses the approved Nova/neutral/Lucide preset.
- Organization documents and private storage references must come from the backend; do not add secrets to this app.

## Architecture boundary

This app may contain rendering, navigation, form state, and browser-facing organization flows only. It must not add:

- route handlers, Server Actions, or backend middleware logic;
- databases, queues, or backend-only SDKs;
- client-side tenant or role authorization;
- document upload paths that bypass backend authorization and audit.

The Go backend and forced PostgreSQL RLS remain authoritative for organization scope and membership.

## Project structure

```text
apps/org/
├── src/app/
│   ├── layout.tsx       # Metadata, fonts, and global styles
│   ├── page.tsx         # Current organization foundation screen
│   └── favicon.ico
├── components.json      # shadcn/ui configuration
├── next.config.ts
├── package.json
└── README.md
```

## Definition of ready

- [ ] Onboarding and revision states match the approved organization contract.
- [ ] Membership and role actions are backend-authorized and auditable.
- [ ] Cross-organization and inactive-membership cases fail closed.
- [ ] Private organization documents are not exposed through browser storage or logs.
- [ ] Lint, typecheck, build, RLS, security, and accessibility tests pass.

## Related documentation

- [KROWDS monorepo README](../../README.md)
- [KROWDS documentation index](../../docs/INDEX.md)
- [Product requirements](../../docs/01-product/PRD.md)
- [Data model](../../docs/04-domain/DATA-MODEL.md)
- [Security requirements](../../docs/05-security/SECURITY.md)
- [Frontend/backend boundary](../../AGENTS.md)
