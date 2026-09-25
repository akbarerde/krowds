# KROWDS Auth

The KROWDS frontend for sign-in, registration, Google OIDC entry, OTP and recovery challenges, MFA/step-up, session states, sign-out, and account-linking conflict copy.

## At a glance

| Item | Value |
| --- | --- |
| Workspace package | `@krowds/auth` |
| Local URL | http://localhost:3001 |
| Framework | Next.js 16.3.6 App Router |
| Runtime | React 19, TypeScript, Tailwind CSS 4 |
| Shared UI | `@krowds/ui`, shadcn/ui preset `b2fA` |
| UI implementation | One local fixture state machine on `/` |

## Route and state inventory

The app intentionally has one Next.js page while the milestone is being exercised with local fixtures. The page is a client-rendered state machine, not a set of authentication endpoints.

| Route/state | Entry or transition | User-facing responsibility |
| --- | --- | --- |
| `/` / `sign-in` | Initial page | Email/password sign-in, Google OIDC entry, generic account errors |
| `/` / `register` | “Create an account” | Registration fields, terms acknowledgement, verification handoff, Google entry |
| `/` / `recovery` | “Forgot password?” | Uniform recovery request copy; no account-existence disclosure |
| `/` / `recovery-sent` | Recovery request preview | Short-lived-link copy, resend cooldown preview, safe return path |
| `/` / `otp` | Sign-in, registration, or state switcher | One-time-code input, resend state, generic verification feedback |
| `/` / `mfa` | State switcher or fixture transition | Second-factor copy without a role decision in the browser |
| `/` / `step-up` | Session preview or state switcher | Fresh-factor request copy for a sensitive action |
| `/` / `oidc` | “Continue with Google” | Backend-managed Google OIDC handoff explanation |
| `/` / `account-linking` | OIDC state | Explicit confirmation copy; no silent merge or link |
| `/` / `session` | State switcher | Safe session summary, step-up entry, and sign-out action |
| `/` / `session-expired` | State switcher | Safe re-authentication and recovery paths |
| `/` / `signed-out` | Sign-out action | Revocation-oriented completion copy |

The collapsed **Preview another auth state** disclosure is local QA tooling. It is deliberately labeled as a fixture and does not represent a production navigation or authorization mechanism.

## Security boundary

This app contains rendering, form state, focus/announcement state, and local preview transitions only.

- The Go + Gin backend at `services/cmd/server` is authoritative for identity, sessions, cookies, OTP and recovery challenges, MFA, account state, provider responses, roles, and authorization.
- There are no Next.js route handlers, Server Actions, proxy/middleware authorization logic, database calls, queues, provider SDKs, or backend-only configuration in this app.
- The fixture makes no network calls and stores no session, refresh credential, provider token, secret, readable OTP, or authorization decision.
- Google sign-in is represented only as a backend OIDC entry state. State, nonce, redirect validation, provider configuration, and token handling are backend responsibilities.
- Client validation is limited to form usability. It must never be treated as authentication, password, MFA, or account verification.
- Account-facing failure copy is generic. The UI does not distinguish an unknown account, a disabled account, a wrong credential, or any other backend account state.
- A failed or unavailable backend must remain a failure; this preview contains no offline grant, cached authorization, or fallback role decision.

## Local fixture contract

`src/lib/auth-fixtures.ts` is deliberately boring, synthetic, and non-sensitive.

- `authViewOptions` is the complete state inventory used by the local state switcher.
- `authFixtures.otp` contains only display-safe metadata: a masked destination, the 15-minute baseline, five-attempt baseline, and 60-second resend cooldown. It contains **no OTP or challenge secret**.
- `authFixtures.session` records the current baseline windows only: 15-minute access, 30-day refresh, and 24-hour recovery.
- `authFixtures.account` uses a synthetic masked address and display label; it is not a real account or identity record.
- `authFixtures.errors` contains safe, generic copy for form-level preview errors.
- `authFixtures.notices` contains state-transition copy. It does not claim that a backend request succeeded.
- A successful local submission only moves the fixture to a reviewable next state. It is not a credential check, provider redirect, MFA decision, session creation, or account-link operation.

When the backend client is connected, replace the local transition callbacks with calls through `@krowds/api` and map only the minimum safe response fields needed for rendering. Keep challenge IDs, cookies, tokens, role context, and provider values out of client props and local storage.

## Open contract gaps

These are intentionally recorded rather than guessed in the browser:

- `KROWDS-OD-025`: OTP format, length, exact validation copy, and abuse-test vectors are still open. The fixture therefore uses a neutral code input and does not prescribe a digit count.
- `KROWDS-OD-011`: Google issuer/client reference, minimum scopes, explicit account-linking decision, and provider transfer review are still open. The account-conflict screen is copy-only until the backend contract is approved.
- `KROWDS-OD-004`: the approved browser-to-API gateway/identity-aware hostname and certificate ownership are still open. No local origin or proxy is introduced here.
- The API package and the concrete auth response/error schemas are not yet wired. The exact request body, `Retry-After` handling, CSRF header, redirect return URL, and challenge correlation field need to be confirmed against the approved `@krowds/api` contract.
- Recovery-link destination, resend timing copy, localization, and legal/privacy wording are not finalized. The UI keeps the response uniform and labels the state as a preview.
- Session-expiry detection and step-up challenge triggers belong to the backend response contract. The client must fail closed and offer re-authentication when the backend says a session is no longer valid.
- Account-conflict recovery (for example, choosing a different provider account or returning to email sign-in) needs a backend-approved operation ID and audit/retry semantics before implementation.

## Accessibility and interaction notes

- Every input has a visible, associated label and appropriate `autocomplete` metadata.
- Invalid controls use `aria-invalid` and point to a live field error with `aria-describedby`.
- Form-level feedback uses `role="status"` or `role="alert"` with polite announcements; forms expose `aria-busy` while the local preview is pending.
- Buttons have explicit types, visible focus treatment, and icon buttons have accessible names and pressed state where applicable.
- The state switcher uses a native `<details>`/`<summary>` disclosure and `aria-pressed` buttons, so it remains keyboard reachable without a custom focus trap.
- Password visibility, resend cooldown, generic errors, and all state changes can be reviewed without relying on color alone.

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

- No auth environment variables or secrets are defined by this app.
- `next.config.ts` keeps `agentRules: false` so this app does not regenerate nested instruction files.
- `components.json` points shared UI imports to `@krowds/ui` and uses the approved Nova/neutral/Lucide preset.
- Authentication provider configuration belongs in the backend deployment contract, not in committed frontend secrets.

## Project structure

```text
apps/auth/
├── src/app/
│   ├── layout.tsx                 # Metadata, fonts, and global styles
│   ├── page.tsx                   # Server page boundary
│   └── favicon.ico
├── src/components/
│   └── auth-experience.tsx        # Local client UI state and accessible forms
├── src/lib/
│   └── auth-fixtures.ts           # Synthetic, non-sensitive fixture contract
├── components.json                # shadcn/ui configuration
├── next.config.ts
├── package.json
└── README.md
```

## Validation

The milestone is complete when the following pass:

```bash
pnpm --filter @krowds/auth lint
pnpm --filter @krowds/auth typecheck
pnpm --filter @krowds/auth build
```

Also review the page with keyboard navigation and a screen reader, including the collapsed fixture state list, password visibility control, invalid-field announcements, generic error copy, resend cooldown, and every recovery/session state.

## Definition of ready

- [x] Sign-in, registration, Google OIDC entry, OTP/resend, recovery, MFA/step-up, session expiry, sign-out, and account-linking conflict states are present as local client states.
- [x] Forms have labels, autocomplete hints, validation announcements, busy states, and keyboard-reachable actions.
- [x] Browser errors are generic and do not disclose account existence or credentials.
- [x] No provider, token, role, or authorization decision is implemented in the browser.
- [x] The README records the fixture contract, security boundary, validation, and open API/provider gaps.
- [ ] Real `@krowds/api` calls and backend contract tests are intentionally not implemented in this frontend milestone.

## Related documentation

- [KROWDS monorepo README](../../README.md)
- [KROWDS documentation index](../../docs/INDEX.md)
- [Software requirements](../../docs/02-requirements/SRS.md)
- [Security requirements](../../docs/05-security/SECURITY.md)
- [API contract](../../docs/04-domain/API-CONTRACT.md)
- [Frontend/backend boundary](../../AGENTS.md)
