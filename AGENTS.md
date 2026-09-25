# KROWDS Monorepo Instructions

These instructions apply to the entire Krowds monorepo.

## Repository layout

- `apps/web`, `apps/auth`, `apps/krew`, `apps/org`, and `apps/pwa` are Next.js applications managed by pnpm workspaces and Turborepo.
- `services/` is one deployable Go service containing all business modules. Keep it a modular monolith; do not split modules into independently deployed services.
- Keep `AGENTS.md` and `CLAUDE.md` only at the monorepo root. Do not create nested agent instruction files. Each Next.js app sets `agentRules: false` to prevent regeneration in its app directory.

## Frontend applications

The frontend ports are fixed:

- Web: `3000`
- Auth: `3001`
- Krew: `3002`
- Org: `3003`
- PWA: `3004`

Do not change these ports without an explicit request.

## Frontend/backend boundary

- Next.js is used only for frontend rendering, navigation, UI state, and browser-facing application flows.
- Do not add Next.js route handlers, Server Actions, backend `proxy.ts`/`middleware.ts` logic, databases, queues, or backend-only SDKs under `apps/*` or `packages/*`.
- Frontend calls to the backend must go through `@krowds/api`; PWA service-worker fetch handling is the only framework-specific exception.
- Go + Gin under `services/` exclusively owns backend HTTP APIs, authentication, authorization, persistence, queues, and business workflows.
- Keep one backend composition root and one deployable binary at `services/cmd/server`; modules remain in-process and must not become independent services.
- Run `pnpm test:architecture` to enforce the Go Clean Architecture rules; keep the frontend/backend boundary as a code-review and design constraint.

## Internal packages

- Shared frontend code belongs in `packages/*`; apps must consume it with `workspace:*` dependencies.
- `@krowds/ui` owns the shared shadcn/ui primitives, design tokens, and approved compositions. All visual UI must use shadcn/ui Components, Blocks, Charts, and Typeset; do not create custom UI components or duplicate generated primitives under individual apps. Styling must follow the approved shadcn/ui preset `--preset b2fA`; do not mix presets or introduce another style system.
- `@krowds/tsconfig` and `@krowds/eslint-config` own shared compiler and linting presets. Extend those configs instead of copying them into apps.
- Shared contracts and runtime behavior belong in focused packages such as `@krowds/types`, `@krowds/api`, `@krowds/utils`, `@krowds/hooks`, and `@krowds/validation`.
- Runtime internal packages are source-first and expose TypeScript through `exports`; Next.js transpiles pnpm workspace packages automatically.
- Turborepo must continue to order tasks with `dependsOn: ["^build"]` and cache application artifacts. Source-only internal package builds intentionally cache logs with no file outputs.

## Product and documentation baseline

- `docs/INDEX.md` is the documentation entry point and defines the source-of-truth order for the documentation baseline.
- `docs/01-product/PRODUCT-VISION.md` is the English canonical product target; `docs/01-product/KROWDS.md` is the Bahasa Indonesia product brief.
- Requirements live in `docs/02-requirements/`; domain contracts in `docs/04-domain/`; architecture and ADRs in `docs/03-architecture/`; security, privacy, and risk controls in `docs/05-security/`; provider contracts in `docs/06-integrations/`; and deployment/runbook material in `docs/07-operations/`.
- `docs/00-governance/OPEN-DECISIONS.md` is the single register for unresolved implementation, legal, provider, infrastructure, physical, and evidence gates. Do not silently convert a `TBD` value into an implementation assumption.
- Core documents use `KROWDS-*` identifiers, version `0.1`, and `Draft` status until role-based approval. When moving or changing a document, update its relative links and all affected traceability references.
- Repeated policy statements across documents are traceability projections, not independent decisions; resolve conflicts using the index source-of-truth order and the open-decision register.
- The target platform uses Go + Gin as the only backend process, Cloud Run, Cloud SQL PostgreSQL with organization-scoped RLS, Memorystore, Cloud Tasks, Cloud Scheduler, Cloud Storage, Secret Manager, Cloud Logging, Error Reporting, Monitoring, and BigQuery.
- Resend owns transactional email delivery, Xendit owns payment state, and Biteship owns domestic shipping state. Provider integrations belong behind the Go backend and must be authenticated, idempotent, replay-resistant, and auditable.
- The MVP is phased, online-first, IDR-only, single-use, and does not include ticket transfer, re-entry, multi-use, or offline gate access.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

Next.js 16.3 has breaking changes and version-specific behavior. Before changing code under `apps/<app>`, read the relevant guide in that application's bundled documentation at `apps/<app>/node_modules/next/dist/docs/`. Use the installed version's documentation rather than relying on prior knowledge, and heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Go services architecture

`services/` must remain one process with clean architecture inside every module:

```text
services/internal/modules/<module>/
├── application/
├── delivery/http/
├── domain/
├── infrastructure/
└── module.go
```

Dependency rules:

- `domain` contains business rules and must not depend on Gin, delivery, application, infrastructure, transport, databases, queues, or external services.
- `application` contains use cases and ports. It may depend on its own domain, but not on delivery, infrastructure, or transport.
- `delivery` translates HTTP requests and responses. It may use application ports but must not import infrastructure adapters directly.
- `infrastructure` implements application ports and external dependencies. It must not depend on delivery or transport.
- Modules must not import internal packages from another module. Put pure cross-module value objects and interfaces in `internal/contracts`, and pure events in `internal/events`.
- Shared contracts/events may use only pure standard-library types; they must not import Gin, transport, delivery, infrastructure, or concrete modules.
- Keep framework and technical wiring at the edges. Domain and application code must not import Gin.

Register new modules in `services/internal/transport/http/router.go` through the `Module` interface and compose them from `services/cmd/server/main.go`. Run `services/cmd/server/architecture_test.go` to verify the boundary rules.

## Validation

Use the narrowest relevant command while iterating, then run the full validation when practical:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

For Go-only changes:

```bash
go test ./services/...
go vet ./services/...
pnpm test:architecture
```

Do not report a task as complete without running the relevant tests and builds.
