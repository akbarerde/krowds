# KROWDS PWA

The KROWDS progressive web application for an installable browser experience and a limited offline-capable presentation shell.

## At a glance

| Item | Value |
| --- | --- |
| Workspace package | `@krowds/pwa` |
| Local URL | http://localhost:3004 |
| Framework | Next.js 16 App Router |
| Runtime | React 19, TypeScript, Tailwind CSS 4 |
| Shared UI | `@krowds/ui`, shadcn/ui preset `b2fA` |
| Current route | `/` |
| Production asset cache | `krowds-pwa-v1` |

## Current implementation status

The PWA scaffold currently includes:

- `src/app/manifest.ts` with the KROWDS manifest and icon metadata;
- `public/sw.js` with an app-shell cache and navigation fallback;
- `src/components/pwa-register.tsx` with production-only service-worker registration;
- a responsive `/` entry page built from shared KROWDS UI primitives.

Ticket, payment, wristband, redemption, and gate workflows are not implemented in this app. The service worker must never become an authorization source.

## Target responsibilities

- Provide an installable KROWDS browser shell where supported.
- Cache only presentation assets and safe shell responses.
- Degrade to a safe unavailable or cached presentation state when the backend cannot be reached.
- Keep payment, ticket issuance, wristband activation, redemption, and gate decisions online and backend-authoritative.
- Respect the approved no-offline-grant, single-use, and fail-closed policies.

## Local development

Run commands from the repository root:

```bash
pnpm install
pnpm --filter @krowds/pwa dev
```

Open http://localhost:3004.

Service-worker registration is intentionally disabled outside production. To test the production service-worker path:

```bash
pnpm --filter @krowds/pwa build
pnpm --filter @krowds/pwa start
```

Then open http://localhost:3004 and use the browser install application menu where supported.

## Commands

| Task | Command |
| --- | --- |
| Development server | `pnpm --filter @krowds/pwa dev` |
| Production build | `pnpm --filter @krowds/pwa build` |
| Production server | `pnpm --filter @krowds/pwa start` |
| Lint | `pnpm --filter @krowds/pwa lint` |
| Typecheck | `pnpm --filter @krowds/pwa typecheck` |
| Clean generated files | `pnpm --filter @krowds/pwa clean` |

## Service-worker behavior

`public/sw.js` currently:

- pre-caches `/`, `/manifest.webmanifest`, and `/icon.svg`;
- removes older KROWDS PWA caches on activation;
- uses network-first navigation with a cached-page fallback;
- caches same-origin successful GET responses after the network response;
- ignores non-GET and cross-origin requests.

A cached response is presentation fallback only. It must not be treated as current payment, ticket, entitlement, wristband, or access state.

## Configuration

- No app-specific environment variables are currently defined.
- `next.config.ts` keeps `agentRules: false` so this app does not regenerate nested instruction files.
- `components.json` points shared UI imports to `@krowds/ui` and uses the approved Nova/neutral/Lucide preset.
- Production service-worker behavior is controlled by the Next.js build mode and must be tested in a production-like server, not only in `next dev`.

## Architecture boundary

This app may contain rendering, navigation, UI state, manifest metadata, and safe shell caching only. It must not add:

- route handlers, Server Actions, or backend middleware logic;
- offline payment or ticket activation;
- offline wristband, redemption, or gate authorization;
- backend-only SDKs, databases, queues, or provider credentials.

The Go backend remains the authority for every business and access transition.

## Project structure

```text
apps/pwa/
├── public/
│   └── sw.js             # Production app-shell service worker
├── src/app/
│   ├── layout.tsx        # Metadata, fonts, and PwaRegister
│   ├── manifest.ts       # Installable app metadata
│   ├── page.tsx          # Current PWA foundation screen
│   └── icon.svg
├── src/components/
│   └── pwa-register.tsx  # Production-only registration
├── components.json
├── next.config.ts
├── package.json
└── README.md
```

## Definition of ready

- [ ] Manifest and install metadata are verified on supported browsers.
- [ ] Service-worker cache scope and fallback behavior are reviewed.
- [ ] Cached data is never used to authorize a business or access transition.
- [ ] Production-like offline, reconnect, and failure tests pass.
- [ ] Lint, typecheck, build, accessibility, and security tests pass.

## Related documentation

- [KROWDS monorepo README](../../README.md)
- [KROWDS documentation index](../../docs/INDEX.md)
- [Security requirements](../../docs/05-security/SECURITY.md)
- [State machines](../../docs/04-domain/STATE-MACHINES.md)
- [Operations runbook](../../docs/07-operations/RUNBOOK.md)
- [Frontend/backend boundary](../../AGENTS.md)
