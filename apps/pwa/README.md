# KROWDS PWA

The KROWDS progressive web application is an installable, responsive presentation shell for e-ticket, wristband, and online-access journeys. It can keep approved presentation routes available during a network interruption, but it never grants payment, issuance, activation, redemption, or gate authority.

## At a glance

| Item | Value |
| --- | --- |
| Workspace package | `@krowds/pwa` |
| Local URL | `http://localhost:3004` |
| Framework | Next.js 16.3 App Router |
| Runtime | React 19, TypeScript, Tailwind CSS 4 |
| Shared UI | `@krowds/ui`, shadcn/ui preset `b2fA` |
| Production cache | `krowds-pwa-v2` |
| Service worker | `/sw.js`, registered only when `NODE_ENV=production` |

## Routes

| Route | Responsibility |
| --- | --- |
| `/` | Install guidance, presentation-only boundary, and route entry points |
| `/tickets` | Responsive e-ticket wallet presentation using a typed synthetic fixture |
| `/wristbands` | Wristband status presentation with no QR credential or local activation state |
| `/access` | Online-only access policy and fail-closed explanation; no scanner or decision |
| `/offline` | Explicit unavailable state for a presentation route that was not safely cached |

The fixtures in `src/lib/presentation-fixtures.ts` are synthetic and typed. They are not account, payment, ticket, entitlement, wristband, or access records.

## Local development

Run commands from the repository root:

```bash
pnpm install
pnpm --filter @krowds/pwa dev
```

Open `http://localhost:3004`. Development intentionally does not register `/sw.js`; install, reconnect, offline, and update UI can still be reviewed without a development worker controlling the page.

## Commands

| Task | Command |
| --- | --- |
| Development server | `pnpm --filter @krowds/pwa dev` |
| Production build | `pnpm --filter @krowds/pwa build` |
| Production server | `pnpm --filter @krowds/pwa start` |
| Lint | `pnpm --filter @krowds/pwa lint` |
| Typecheck | `pnpm --filter @krowds/pwa typecheck` |
| Service-worker policy tests | `pnpm --filter @krowds/pwa test:pwa` |
| Clean generated files | `pnpm --filter @krowds/pwa clean` |

`test:pwa` runs the worker in a mocked Cache Storage and network environment. It checks install precaching, cache-version cleanup, network-first navigation, stale/unavailable signaling, API/write bypass, and explicit update activation.

## Production-like service-worker testing

Service workers require a secure context. Use `localhost` for local testing or HTTPS for a deployed environment.

1. Build and start the production server:

   ```bash
   pnpm --filter @krowds/pwa build
   pnpm --filter @krowds/pwa start
   ```

2. Open `http://localhost:3004` once and reload. In browser DevTools, verify:
   - **Application → Manifest** resolves `/manifest.webmanifest` and the 192 px, 512 px, maskable, SVG, and Apple touch icons.
   - **Application → Service Workers** shows `/sw.js` with scope `/`.
   - **Application → Cache Storage** contains `krowds-pwa-v2` with the five presentation routes, manifest, icons, and discovered `/_next/static/` presentation assets.
3. Visit `/`, `/tickets`, `/wristbands`, and `/access` while online. Each successful exact-path navigation should update its cached presentation response.
4. In DevTools, select **Offline** and reload a visited route. The cached page must render with a visible “You are viewing a cached page” notice. The fixture labels remain visible; no paid, active, unused, access-granted, or access-denied claim is introduced.
5. While still offline, request an uncached presentation URL such as `/tickets?fresh=1`. The worker must redirect to the explicit `/offline` unavailable presentation rather than substituting another route's Next.js document.
6. Restore the network. The UI must show that it reconnected and offer a refresh. Refreshing must return to network-first behavior; cached content is not promoted to authority.
7. Confirm that same-origin API requests, every non-GET request, and cross-origin requests are not handled by the presentation worker. They remain ordinary network operations and must use the future `@krowds/api` contract.
8. To test update behavior, deploy a worker/cache revision, reload once, and verify that a waiting update is announced. Choose **Update app**; the worker activates only after that client confirmation.
9. Use each supported browser's install affordance. Chromium-based browsers may expose the in-page **Install app** action through `beforeinstallprompt`; elsewhere the UI explains that installation availability depends on browser support.

For deterministic policy checks without starting Next.js:

```bash
pnpm --filter @krowds/pwa test:pwa
```

## Cache boundaries

`public/sw.js` is intentionally narrow:

- Pre-caches only `/`, `/tickets`, `/wristbands`, `/access`, `/offline`, the manifest, and approved icons.
- Discovers and caches same-origin JavaScript, CSS, font, and image references under `/_next/static/` from those presentation documents.
- Uses network-first navigation. Presentation links use full-document navigation so every route change passes through this handler; Next.js RSC/data fetches are not cached.
- Caches a navigation response only for an exact allow-listed pathname with no query string, a successful basic response, and `text/html` content.
- Uses cached presentation first with a background network refresh only for approved same-origin static assets.
- Returns the visited cached page with a `stale` signal after a network failure.
 Redirects an uncached presentation to the pre-cached `/offline` page with an `unavailable` signal rather than serving another route's Next.js document.
- Ignores all non-GET requests, cross-origin requests, API routes, Next.js RSC/data requests, query-string navigations, and arbitrary same-origin downloads.
- Deletes only stale cache names beginning with `krowds-pwa-`; unrelated origin caches are preserved.
- Does not auto-activate an updated worker. The current page remains active until the user confirms the update.

A cached response is presentation fallback only. It must never be treated as current payment, ticket issuance, entitlement, wristband, redemption, or access state.

## Reconnect and update behavior

- Browser `offline` events immediately show that live status cannot be confirmed.
- A network-first navigation served from cache is labeled stale even if the browser has not emitted an `offline` event.
- Browser `online` events show a reconnect notice and trigger a service-worker update check; the user explicitly refreshes to request current presentation content.
- A waiting service worker is announced as an update and activates only after **Update app** is selected.
- No reconnect path automatically retries, fabricates, or completes a business or access operation.

## Installability and presentation metadata

- `src/app/layout.tsx` provides the application name, manifest link, Apple web-app metadata, responsive viewport, safe-area support, and light/dark theme colors through the Next.js 16 Metadata and Viewport APIs.
- `src/app/manifest.ts` provides standalone display behavior, portrait/landscape support, maskable icons, and shortcuts to the presentation routes.
- `public/icons/` contains install and Apple touch PNGs. `src/app/icon.svg` supplies the scalable browser icon.
- Browser installation support and user control vary. The UI never hides essential content or decisions behind browser-specific controls.

## Contract gaps

This milestone intentionally stops at the presentation boundary. The following contracts are not implemented:

- authenticated account/session restoration and registered-device enrollment;
- live ticket-wallet reads and the typed `@krowds/api` client contract;
- live wristband status, revocation, or activation reads;
- payment instructions or any client payment transition;
- ticket issuance, credential display, redemption, or wristband binding;
- gate scanning, access decisions, audit submission, and single-use consumption;
- the three-second access timeout, two exponential-backoff retries, and controlled `TEMP_UNAVAILABLE` result;
- real event/organization data, localization, push notifications, and production telemetry.

These gaps must be implemented through frontend calls to `@krowds/api`; they must not be filled with local fixtures, IndexedDB business state, service-worker caching, or client-side authorization.

## Architecture boundary

This app may contain rendering, navigation, UI state, manifest metadata, and safe shell caching only. It must not add:

- Next.js route handlers, Server Actions, backend proxy/middleware logic, databases, or queues;
- offline payment, ticket issuance, wristband activation, redemption, or gate authorization;
- backend-only SDKs, provider credentials, or durable business state in the browser.

The Go backend remains authoritative for every business and access transition.

## Project structure

```text
apps/pwa/
├── public/
│   ├── icons/                    # 192, 512, maskable, and Apple PNG icons
│   └── sw.js                     # Presentation-only production worker
├── src/app/
│   ├── access/page.tsx           # Online-only access boundary
│   ├── offline/page.tsx          # Explicit unavailable fallback
│   ├── tickets/page.tsx          # E-ticket presentation
│   ├── wristbands/page.tsx       # Wristband presentation
│   ├── layout.tsx                # Metadata, viewport, navigation, PWA UX
│   ├── manifest.ts               # Install metadata and shortcuts
│   ├── page.tsx                  # Overview and install guidance
│   └── icon.svg
├── src/components/
│   ├── pwa-nav.tsx               # Responsive route navigation
│   └── pwa-register.tsx          # Registration, install, reconnect, update UX
├── src/lib/
│   └── presentation-fixtures.ts  # Typed synthetic, non-authoritative data
├── tests/
│   └── service-worker.test.mjs   # Mocked Cache Storage/network policy checks
├── components.json
├── next.config.ts
├── package.json
└── README.md
```

## Related documentation

- [KROWDS monorepo README](../../README.md)
- [KROWDS documentation index](../../docs/INDEX.md)
- [Security requirements](../../docs/05-security/SECURITY.md)
- [State machines](../../docs/04-domain/STATE-MACHINES.md)
- [Operations runbook](../../docs/07-operations/RUNBOOK.md)
- [Frontend/backend boundary](../../AGENTS.md)
