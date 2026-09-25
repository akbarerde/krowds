# KROWDS Krew

The KROWDS KREW frontend for internal operational workspaces and collaboration.

## At a glance

| Item | Value |
| --- | --- |
| Workspace package | `@krowds/krew` |
| Local URL | http://localhost:3002 |
| Framework | Next.js 16 App Router |
| Runtime | React 19, TypeScript, Tailwind CSS 4 |
| Shared UI | `@krowds/ui`, shadcn/ui preset `b2fA` |
| Current route | `/` |

## Current implementation status

This workspace is currently a KREW workspace scaffold. `src/app/page.tsx` demonstrates the shared KROWDS visual foundation and the intended crew-workspace surface. Production queues, role-aware actions, operational records, collaboration data, and backend mutations are not yet implemented in this app.

## Target responsibilities

- Present internal workspaces for KREW operations, fulfillment, production, quality, and support.
- Show role-scoped work queues, cases, evidence, and controlled action outcomes.
- Support incident-scoped collaboration without granting browser-side authority.
- Display backend audit, request, provider, and resource correlation data in a safe form.
- Require MFA, step-up, and dual approval for sensitive actions through the backend.

## Local development

Run commands from the repository root:

```bash
pnpm install
pnpm --filter @krowds/krew dev
```

Open http://localhost:3002.

To run the production-like server:

```bash
pnpm --filter @krowds/krew build
pnpm --filter @krowds/krew start
```

## Commands

| Task | Command |
| --- | --- |
| Development server | `pnpm --filter @krowds/krew dev` |
| Production build | `pnpm --filter @krowds/krew build` |
| Production server | `pnpm --filter @krowds/krew start` |
| Lint | `pnpm --filter @krowds/krew lint` |
| Typecheck | `pnpm --filter @krowds/krew typecheck` |
| Clean generated files | `pnpm --filter @krowds/krew clean` |

## Configuration

- No app-specific environment variables are currently defined.
- `next.config.ts` keeps `agentRules: false` so this app does not regenerate nested instruction files.
- `components.json` points shared UI imports to `@krowds/ui` and uses the approved Nova/neutral/Lucide preset.
- KREW capability values and cross-organization permissions are backend contracts, not frontend-defined roles.

## Architecture boundary

This app may contain rendering, navigation, UI state, and browser-facing operational flows only. It must not add:

- route handlers, Server Actions, or backend middleware logic;
- database, queue, or provider credentials;
- a client-side KREW role or break-glass authority;
- payment, ticket, wristband, or gate state mutation outside the backend API.

The Go backend and PostgreSQL RLS remain authoritative for KREW access and cross-organization scope.

## Project structure

```text
apps/krew/
├── src/app/
│   ├── layout.tsx       # Metadata, fonts, and global styles
│   ├── page.tsx         # Current workspace foundation screen
│   └── favicon.ico
├── components.json      # shadcn/ui configuration
├── next.config.ts
├── package.json
└── README.md
```

## Definition of ready

- [ ] KREW roles and capabilities match the backend authorization contract.
- [ ] Operational queues and evidence views are tenant-safe and auditable.
- [ ] Privileged actions require the documented MFA, step-up, and dual-approval controls.
- [ ] No sensitive provider or credential data is exposed to the browser.
- [ ] Lint, typecheck, build, security, and accessibility tests pass.

## Related documentation

- [KROWDS monorepo README](../../README.md)
- [KROWDS documentation index](../../docs/INDEX.md)
- [Software requirements](../../docs/02-requirements/SRS.md)
- [Security requirements](../../docs/05-security/SECURITY.md)
- [Operations runbook](../../docs/07-operations/RUNBOOK.md)
- [Frontend/backend boundary](../../AGENTS.md)
