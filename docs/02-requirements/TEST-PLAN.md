# KROWDS-TEST-DOC-001 — KROWDS Phase-Aware Test Strategy and Plan

## Metadata

| Field | Value |
| --- | --- |
| Document ID | `KROWDS-TEST-DOC-001` |
| Version | `0.1` |
| Status | `Draft` |
| Last updated | `2026-09-24` |
| Owner | Quality Assurance Lead (`TBD`) |
| Technical owner | Test Engineering Lead (`TBD`) |
| Canonical product baseline | [`PRODUCT-VISION.md`](../01-product/PRODUCT-VISION.md) |
| Scope | Foundation and organization, commerce and ticketing, wristband production and fulfillment, binding and gate |
| Planning horizon | Four dependency-ordered roadmap phases; calendar dates remain relative until owner and evidence gates are available |
| Target policy | Confirmed MVP quality, performance, reliability, retention, support, accessibility, and rollout targets are normative; provider/venue/infrastructure evidence is controlled in [OPEN-DECISIONS.md](../00-governance/OPEN-DECISIONS.md) |

## 1. Objectives

- Verify the accepted architecture and provider decisions in `KROWDS-ADR-001` through `KROWDS-ADR-008`.
- Protect organization isolation, identity verification, payment state, wristband credentials, access decisions, and audit evidence.
- Give each roadmap phase a measurable entry and exit gate before the next phase depends on it.
- Test failure and recovery behavior for payment callbacks, email delivery, shipment events, network interruption, duplicate scans, and vendor outages.
- Keep frontend, backend, provider, database, physical-production, and venue concerns covered without treating any one layer as the whole system.
- Numeric targets confirmed in `PRODUCT-VISION.md` and the engineering documents are release requirements. Provider-, venue-, infrastructure-, legal-, and evidence-dependent values remain explicit gates in [OPEN-DECISIONS.md](../00-governance/OPEN-DECISIONS.md) and are not guessed.

## 2. Test basis and scope

### 2.1 In scope

| Phase | Product capability under verification | Confirmed decisions | Primary test environments |
| --- | --- | --- | --- |
| `KROWDS-PHASE-001` Foundation / Auth / Org | Account registration, login, email OTP, Google sign-in, secure sessions, privileged MFA, identity profile, private organization documents, manual KREW review, fixed roles, team invitations, RLS, and audit baseline | `KROWDS-ADR-001`, `KROWDS-ADR-002`, `KROWDS-ADR-004`, `KROWDS-ADR-006` | Local, CI, integration, staging |
| `KROWDS-PHASE-002` Commerce / Ticketing / Xendit / E-ticket | Venue, event, activity, session, ticket types, IDR orders, Xendit QRIS, Virtual Account, approved e-wallet, 30-minute online instruction expiry, 7-day refund request window, ticket limits, single-use policy, tax-inclusive pricing, e-ticket issuance, and dashboard delivery | `KROWDS-ADR-001`, `KROWDS-ADR-003`, `KROWDS-ADR-006` | CI, Xendit sandbox, staging |
| `KROWDS-PHASE-003` Wristband Production / Biteship | Wristband stock and production orders, cashier QRIS against validated stock with 15-minute reservation, KREW verification, artwork, identifier generation, private production export, quality control, approved domestic service/live organization-paid quote, KREW-approved reshipment, delivery, and batch activation | `KROWDS-ADR-005`, `KROWDS-ADR-006`, `KROWDS-ADR-007` | Staging, Biteship sandbox, production-like print lab |
| `KROWDS-PHASE-004` Binding / Gate / Audit | E-ticket redemption, physical identity comparison, wristband reservation and binding, single-use entitlement, registered gate devices, 3-second gate timeout/two retries, online access decision, break-glass, BigQuery datasets, audit investigation, WCAG 2.2 AA, and support readiness | `KROWDS-ADR-006`, `KROWDS-ADR-007`, `KROWDS-ADR-008` | Staging, venue rehearsal, production-like venue |

### 2.2 Out of scope

| Excluded area | Reason | Revisit trigger |
| --- | --- | --- |
| Physical courier route optimization | Biteship and the courier own route execution | A delivery SLA or carrier exception is approved |
| Printer firmware and material engineering | KROWDS supplies the controlled digital artifact; a production partner owns printing hardware | A new printer, material, or encoding method is selected |
| Live payment capture with real customer funds | Provider certification and finance approval are required | Finance Operations Owner (`TBD`) approves a controlled production transaction |
| Ticket transfer | Explicitly outside the MVP | A later accepted product and security decision defines custody, audit, refund, and identity rules |
| Re-entry and multi-use access | The MVP credential is single-use | A later accepted entitlement decision defines atomic use and anti-replay rules |
| Offline access grants | Explicitly outside the MVP and rejected by `KROWDS-ADR-008` | A later accepted security decision defines short-lived authorization, revocation, and anti-replay controls |
| Custom roles | MVP uses fixed roles with explicit permissions | A later accepted authorization decision defines safe role administration and migration |
| Automated identity or liveness verification | The MVP uses minimized identity data and operational comparison | Privacy, legal, security, and product approval selects a provider and data flow |
| International shipping, cash on delivery, and marketplace courier selection | The MVP uses Biteship domestic organization-paid shipping | A later accepted fulfillment and legal decision approves the new scope |
| Multi-region active-active deployment | The initial target is regional | Capacity, legal, and architecture evidence requires a separate decision |

## 3. Risk-based test priorities

| Priority ID | Risk | Required evidence |
| --- | --- | --- |
| `KROWDS-TEST-PR-001` | Cross-organization data exposure | Automated RLS allow/deny matrix and database privilege evidence |
| `KROWDS-TEST-PR-002` | Payment activated without verified provider state | Xendit sandbox and failure-injection tests |
| `KROWDS-TEST-PR-003` | Duplicate or invalid gate use | Concurrent scan, replay, lifecycle, and entitlement tests |
| `KROWDS-TEST-PR-004` | Wristband credential or production data leakage | Content inspection, secret scanning, and access-log review |
| `KROWDS-TEST-PR-005` | Lost audit evidence | Correlation and completeness checks across every critical transition |
| `KROWDS-TEST-PR-006` | Provider outage blocks a critical journey | Timeout, retry, reconciliation, and operator-recovery exercise |
| `KROWDS-TEST-PR-007` | Frontend or package bypasses backend authority | Static architecture checks and browser network inspection |
| `KROWDS-TEST-PR-008` | Printed QR cannot be scanned reliably | Controlled print samples and physical scan procedure |
| `KROWDS-TEST-PR-009` | Privileged account or session control fails | MFA, secure-cookie, rotation, revocation, and fixed-role tests |
| `KROWDS-TEST-PR-010` | IDR, single-use, refund, or minor-consent policy is bypassed | State-machine, amount, guardian, and access tests |
| `KROWDS-TEST-PR-011` | Cloud Tasks, Scheduler, Memorystore, or BigQuery misuse corrupts or exposes state | Dependency outage, replay, IAM, and data-lineage tests |
| `KROWDS-TEST-PR-012` | Break-glass is used without a valid incident or retained after expiry | Two-role approval, expiry, alert, audit, and revocation exercise |
| `KROWDS-TEST-PR-013` | Consumer identity is issued or bound before manual KREW approval | Identity-review state, negative issuance, duplicate, correction, expiry, redaction, and audit tests |

## 4. Test strategy

| Test level | Approach | Coverage focus | Required owner | Automation expectation |
| --- | --- | --- | --- | --- |
| Architecture and static | Go architecture tests, dependency scans, TypeScript and lint checks, forbidden-import review | Frontend/backend boundary, layer direction, secrets, RLS ownership | Developer Experience Owner (`TBD`) | Blocking in CI |
| Unit | Standard unit framework in each language | Domain invariants, state transitions, validation, authorization decisions, mapping | Module Engineering Owner (`TBD`) | Blocking for changed business rules |
| Component | Frontend component and hook tests; provider adapter tests in isolation | Loading, error, retry, permission-aware UI, webhook and email mapping | Frontend Engineering Owner (`TBD`) | Blocking for changed components |
| Contract | Shared API contract, request/response validation, event contract, migration review | Frontend-to-backend and backend-to-provider compatibility | API Owner (`TBD`) | Blocking on incompatible changes |
| Integration | Cloud SQL PostgreSQL and RLS, Memorystore, Cloud Tasks, Cloud Scheduler, Cloud Storage, BigQuery, Resend sandbox, Xendit sandbox, Biteship sandbox | Real boundaries without live financial or shipping consequences | Integration Test Owner (`TBD`) | Blocking for critical paths |
| End to end | Browser automation plus backend orchestration | User journeys, role journeys, state transitions, audit correlation | Quality Assurance Lead (`TBD`) | Critical paths automated where stable |
| Security | Negative authorization, tenant isolation, replay, secret leakage, payload inspection | Tenant boundaries, privileged operations, credential handling | Security Test Owner (`TBD`) | P0 cases blocking |
| Resilience and recovery | Timeout, duplication, reordering, dependency outage, restart, restore | Idempotency, reconciliation, fail-closed gate, recovery evidence | Reliability Test Owner (`TBD`) | Critical failure modes automated |
| Physical and operational | Printed samples, scanner devices, venue network, staff procedure | QR readability, binding flow, staff response, outage handling | Operations Test Owner (`TBD`) | Procedure-driven; evidence retained |
| Exploratory | Scenario charters for onboarding, payment recovery, fulfillment, and gate | Usability, error clarity, handoffs, operational fit | Product Quality Owner (`TBD`) | Findings tracked as defects or risks |
| Regression | Risk-based selected suite plus changed-area impact analysis | Prevention of cross-phase regressions | Quality Assurance Lead (`TBD`) | Automated, then environment promotion |

## 5. Environments and test data

### 5.1 Environments

| Environment ID | Purpose | Dependencies | Data and reset policy | Owner |
| --- | --- | --- | --- | --- |
| `KROWDS-ENV-001` Local | Fast unit, component, and local API work | Local frontend, Go service, disposable PostgreSQL | Synthetic records only; disposable database | Developer Experience Owner (`TBD`) |
| `KROWDS-ENV-002` CI | Static checks, unit, component, contract, architecture, and isolated integration checks | Ephemeral PostgreSQL and mocks or approved sandboxes | Fresh per run; no retained PII | CI Owner (`TBD`) |
| `KROWDS-ENV-003` Integration | Provider and asynchronous event behavior | Resend sandbox, Xendit sandbox, Biteship sandbox, Cloud SQL PostgreSQL, Memorystore, Cloud Tasks, Cloud Scheduler, private Cloud Storage, and restricted BigQuery | Seeded synthetic organizations, roles, IDR orders, tickets, shipments, credentials, and events | Integration Test Owner (`TBD`) |
| `KROWDS-ENV-004` Staging | End-to-end regression and release rehearsal | Production-like frontend, backend, database, cache, tasks, schedules, object storage, BigQuery, and secrets | Generated records; never production personal data; controlled reset | Quality Assurance Lead (`TBD`) |
| `KROWDS-ENV-005` Production-like | Performance, resilience, backup restore, and operational evidence | Capacity, network, and regional settings approved for the test | Representative synthetic volume; no live customer funds | Service Reliability Owner (`TBD`) |
| `KROWDS-ENV-006` Physical laboratory | Wristband print, scan, material, and batch sample verification | Approved printer, scanner, production-like QR payloads | Non-customer samples; destruction record | Fulfillment Quality Owner (`TBD`) |
| `KROWDS-ENV-007` Venue rehearsal | Gate workflow, device, connectivity, and staff procedure | Scanner, venue network, staging backend | Staff and test visitors only | Access Operations Owner (`TBD`) |

### 5.2 Test data controls

- Generate all identities, organizations, adult and minor ticket-holder scenarios, guardian relationships, tickets, IDR payment references, addresses, QR credentials, and audit records with approved test utilities.
- Do not copy production PII, payment data, live access credentials, visitor identity documents, or production QR credentials into test environments.
- Use separate Resend, Xendit, Biteship, Google Cloud, database, BigQuery, and service-account identities for each environment.
- Maintain fixed personas for buyer, ticket holder, organization administrator, cashier, ticketing, redemption, gate, finance, viewer, KREW, platform administrator, security, and privacy roles; custom roles are not part of the MVP.
- Exercise secure cookies, rotating refresh credentials, privileged MFA, step-up actions, revocation, and fixed-role permissions.
- Use only synthetic, non-valid QR tokens; verify that KROWDS stores only a token hash and never ingests a full token into BigQuery.
- Rotate deterministic credentials after destructive tests and verify that organization context, sessions, Memorystore data, Cloud Tasks messages, Scheduler execution state, Cloud Storage exports, and BigQuery datasets are removed.
- Record production-like data volume and retention before performance testing; exact volume is `TBD`.
- Treat every production export as Restricted even when its visible contents do not contain PII.

## 6. Requirements traceability

| Verification ID | Required behavior | Decision trace | Test case trace | Phase | Owner | Result |
| --- | --- | --- | --- | --- | --- | --- |
| `KROWDS-VER-001` | Email registration requires successful OTP verification and controlled resend behavior | `KROWDS-ADR-004` | `KROWDS-TC-001` | `KROWDS-PHASE-001` | Identity Test Owner (`TBD`) | Not run |
| `KROWDS-VER-002` | Google and credential sign-in converge on the same safe account rules | `KROWDS-ADR-001`, `KROWDS-ADR-004` | `KROWDS-TC-002` | `KROWDS-PHASE-001` | Identity Test Owner (`TBD`) | Not run |
| `KROWDS-VER-003` | Organization onboarding follows Draft through review and approval states | `KROWDS-ADR-006` | `KROWDS-TC-003` | `KROWDS-PHASE-001` | Organization Test Owner (`TBD`) | Not run |
| `KROWDS-VER-004` | Team invitations, fixed roles, privileged MFA, and organization permissions enforce least privilege | `KROWDS-ADR-001`, `KROWDS-ADR-006` | `KROWDS-TC-004`, `KROWDS-TC-022` | `KROWDS-PHASE-001` | Organization Test Owner (`TBD`) | Not run |
| `KROWDS-VER-005` | Online checkout creates one idempotent exact-IDR order and Xendit instruction with an immutable paid holder | `KROWDS-ADR-003` | `KROWDS-TC-005`, `KROWDS-TC-023` | `KROWDS-PHASE-002` | Commerce Test Owner (`TBD`) | Not run |
| `KROWDS-VER-006` | Verified Xendit state activates a purchase and issues one e-ticket | `KROWDS-ADR-003` | `KROWDS-TC-006` | `KROWDS-PHASE-002` | Commerce Test Owner (`TBD`) | Not run |
| `KROWDS-VER-007` | Forged, duplicate, delayed, reordered, and reconciled events do not corrupt state or allow refund after use or binding | `KROWDS-ADR-003` | `KROWDS-TC-007` | `KROWDS-PHASE-002` | Payments Test Owner (`TBD`) | Not run |
| `KROWDS-VER-008` | Each issued e-ticket has a unique credential and remains available despite email failure | `KROWDS-ADR-003`, `KROWDS-ADR-004` | `KROWDS-TC-008` | `KROWDS-PHASE-002` | Commerce Test Owner (`TBD`) | Not run |
| `KROWDS-VER-009` | Cashier accepts only the confirmed QRIS state before activation | `KROWDS-ADR-003` | `KROWDS-TC-009` | `KROWDS-PHASE-003` | Payments Test Owner (`TBD`) | Not run |
| `KROWDS-VER-010` | Wristband identifiers are unique and production exports contain no prohibited data | `KROWDS-ADR-007` | `KROWDS-TC-010` | `KROWDS-PHASE-003` | Wristband Test Owner (`TBD`) | Not run |
| `KROWDS-VER-011` | Wristband orders preserve payment, KREW, production, quality, and shipment boundaries | `KROWDS-ADR-005`, `KROWDS-ADR-007` | `KROWDS-TC-011` | `KROWDS-PHASE-003` | Fulfillment Test Owner (`TBD`) | Not run |
| `KROWDS-VER-012` | Biteship events are authenticated, idempotent, and reconcilable | `KROWDS-ADR-005` | `KROWDS-TC-012` | `KROWDS-PHASE-003` | Integration Test Owner (`TBD`) | Not run |
| `KROWDS-VER-013` | A batch becomes Available only after delivery confirmation and valid activation | `KROWDS-ADR-005`, `KROWDS-ADR-007` | `KROWDS-TC-013` | `KROWDS-PHASE-003` | Fulfillment Test Owner (`TBD`) | Not run |
| `KROWDS-VER-014` | Identity, ticket, wristband, and entitlement bind once with valid lifecycle state | `KROWDS-ADR-006`, `KROWDS-ADR-007` | `KROWDS-TC-014` | `KROWDS-PHASE-004` | Access Control Test Owner (`TBD`) | Not run |
| `KROWDS-VER-015` | Organization-owned data is isolated at the database boundary | `KROWDS-ADR-006` | `KROWDS-TC-015` | All phases | Data Security Test Owner (`TBD`) | Not run |
| `KROWDS-VER-016` | A registered device receives a current single-use backend grant or denial, including under concurrent scans | `KROWDS-ADR-008` | `KROWDS-TC-016` | `KROWDS-PHASE-004` | Access Control Test Owner (`TBD`) | Not run |
| `KROWDS-VER-017` | Loss of connectivity never produces a local access grant | `KROWDS-ADR-008` | `KROWDS-TC-017` | `KROWDS-PHASE-004` | Reliability Test Owner (`TBD`) | Not run |
| `KROWDS-VER-018` | Critical actions and gate outcomes have complete correlated audit records | `KROWDS-ADR-006`, `KROWDS-ADR-008` | `KROWDS-TC-018` | All phases | Audit Test Owner (`TBD`) | Not run |
| `KROWDS-VER-019` | Frontend and backend remain within the accepted responsibility boundary | `KROWDS-ADR-001` | `KROWDS-TC-019` | All phases | Developer Experience Owner (`TBD`) | Not run |
| `KROWDS-DER-001` | Google Cloud deployment, identity, observability, backup, and recovery are operable | `KROWDS-ADR-002` | `KROWDS-TC-020`, `KROWDS-TC-021` | `KROWDS-PHASE-001` and ongoing | Platform Test Owner (`TBD`) | Not run |
| `KROWDS-VER-020` | Printed wristband codes and QR credentials remain usable in the approved physical process | `KROWDS-ADR-007` | `KROWDS-TC-010`, `KROWDS-TC-013` | `KROWDS-PHASE-003` | Fulfillment Quality Owner (`TBD`) | Not run |
| `KROWDS-VER-021` | Minor purchase and access require the approved guardian relationship and consent | `KROWDS-ADR-001` | `KROWDS-TC-023` | `KROWDS-PHASE-002` | Product and Privacy Test Owner (`TBD`) | Not run |
| `KROWDS-VER-022` | Cloud Tasks, Scheduler, Memorystore, and BigQuery preserve authority, privacy, and replay safety | `KROWDS-ADR-002` | `KROWDS-TC-024` | All phases | Platform Test Owner (`TBD`) | Not run |
| `KROWDS-VER-023` | KREW break-glass is MFA-protected, incident-scoped, time-bounded, approved by two roles, and fully audited | `KROWDS-ADR-001` | `KROWDS-TC-025` | `KROWDS-PHASE-004` | Security Test Owner (`TBD`) | Not run |
| `KROWDS-VER-024` | Consumer identity review has a distinct KREW queue, claim, correction, approval, rejection, expiry, and audit lifecycle | `KROWDS-ADR-001`, `KROWDS-ADR-006` | `KROWDS-TC-026` | `KROWDS-PHASE-001` | Identity and KREW Test Owners (`TBD`) | Not run |
| `KROWDS-VER-025` | Ticket uniqueness and five-active-ticket limit are enforced without false duplicate matches | `KROWDS-ADR-006` | `KROWDS-TC-027` | `KROWDS-PHASE-002` | Commerce Test Owner (`TBD`) | Not run |
| `KROWDS-VER-026` | Verified delivery and receipt confirmation are both required before batch activation | `KROWDS-ADR-005`, `KROWDS-ADR-007` | `KROWDS-TC-013`, `KROWDS-TC-031` | `KROWDS-PHASE-003` | Fulfillment Test Owner (`TBD`) | Not run |
| `KROWDS-VER-027` | Password, session, step-up, dual approval, upload, closure, export, and analytics controls operate as one policy | `KROWDS-ADR-001`, `KROWDS-ADR-006` | `KROWDS-TC-028`, `KROWDS-TC-029` | `KROWDS-PHASE-001` / `KROWDS-PHASE-002` | Security and Product Test Owners (`TBD`) | Not run |
| `KROWDS-VER-028` | Frontend performance and WCAG 2.2 AA acceptance evidence is attached to the release | `KROWDS-ADR-001` | `KROWDS-TC-030` | `KROWDS-PHASE-002` / `KROWDS-PHASE-004` | Accessibility Owner (`TBD`) | Not run |
| `KROWDS-VER-029` | Provider timeout, retry, alert, incident, reconciliation, and physical sample evidence meets the accepted operational baseline | `KROWDS-ADR-002`, `KROWDS-ADR-003`, `KROWDS-ADR-005`, `KROWDS-ADR-008` | `KROWDS-TC-031`, `KROWDS-TC-032` | Each phase exit | Reliability and Fulfillment Test Owners (`TBD`) | Not run |

## 7. Detailed test cases

### KROWDS-TC-001 — Email registration and OTP verification

- **Priority:** Critical
- **Preconditions:** Email address is unused; Resend sandbox is healthy; account and organization policies are loaded.
- **Procedure:** Register with a synthetic email, request OTP, inspect the sandbox event, submit valid and invalid codes, resend, exceed the attempt limit, and let the code expire.
- **Expected result:** Only the currently valid unexpired code can verify the intended account; resend and attempt controls enforce approved policy; secrets and OTP values do not enter logs.
- **Evidence:** API and UI correlation ID, sanitized provider event, database state history, negative-test report.

### KROWDS-TC-002 — Google sign-in and account convergence

- **Priority:** Critical
- **Preconditions:** Google provider test identity and an equivalent synthetic KROWDS email scenario are available.
- **Procedure:** Sign in with an allowed Google OAuth/OIDC identity, inspect requested scopes and state and nonce handling, repeat sign-in, attempt a mismatched or denied identity, and use the account for privileged and ordinary roles.
- **Expected result:** Authentication follows one backend account policy; only minimum approved scopes are requested; a provider-verified email may link only after explicit authenticated confirmation; ambiguous or unverified matches cannot merge or elevate accounts automatically; privileged roles still require KROWDS MFA and authorization.
- **Evidence:** Provider event, backend account state, authorization result, browser network trace.

### KROWDS-TC-003 — Organization onboarding lifecycle

- **Priority:** Critical
- **Preconditions:** Verified user and synthetic legal, responsible-person, financial, consent, and document data are available.
- **Procedure:** Create Draft, upload synthetic legal documents, submit, request revision, correct data, submit again, approve with privileged MFA, reject another case, and attempt use before approval. Attempt cross-organization and unauthorized document access.
- **Expected result:** Every transition is authorized and audited; documents remain private in Cloud Storage; incomplete or unapproved organizations cannot enter protected operational functions; KREW review requires privileged MFA.
- **Evidence:** State-transition report, role evidence, audit records, end-to-end recording.

### KROWDS-TC-026 — Consumer identity KREW review

- **Priority:** Critical
- **Preconditions:** Synthetic consumer identity records, a KREW reviewer, and an unapproved ticket-holder context are available.
- **Procedure:** Create review requests, claim and release cases, request correction, resubmit corrected fields, approve one case, reject another, expire a stale case, and attempt ticket issuance or redemption before approval.
- **Expected result:** Review state is distinct from organization onboarding; only an approved, current identity can issue or bind a ticket; every claim, decision, reason, reviewer, and timestamp is audited; no identity image, full number, or reviewer note leaks through ordinary responses or logs.
- **Evidence:** Identity-review state history, KREW authorization matrix, API response inspection, audit correlation, negative issuance test.

### KROWDS-TC-004 — Team invitation and role boundary

- **Priority:** Critical
- **Preconditions:** Organization administrator and synthetic accounts for fixed cashier, ticketing, redemption, gate, finance, and administrator roles exist; custom-role creation is unavailable.
- **Procedure:** Invite accounts to valid and expired links, accept with existing and new accounts, enroll privileged MFA, revoke membership, disable an account, and probe every protected operation.
- **Expected result:** Each account has individual identity; privileged roles cannot bypass MFA; access is denied outside the current organization and fixed role; revocation takes effect.
- **Evidence:** Permission matrix, RLS results, invitation state history, audit records.

### KROWDS-TC-005 — Online order and payment instruction

- **Priority:** Critical
- **Preconditions:** Approved organization, active IDR ticket products, approved Xendit sandbox account, and valid synthetic buyer and ticket-holder identities.
- **Procedure:** Create QRIS, Virtual Account, and approved e-wallet instructions; submit the same request more than once; try a non-IDR amount; change ticket selection after creation; abandon payment; and resume through an allowed route.
- **Expected result:** One active exact-IDR order and instruction represent the request; totals and ticket holders are server-validated; raw card credentials are absent; no purchase is marked paid.
- **Evidence:** Idempotency result, order timeline, Xendit sandbox objects, API contract evidence.

### KROWDS-TC-006 — Verified payment and e-ticket issuance

- **Priority:** Critical
- **Preconditions:** Pending IDR order and controlled Xendit sandbox QRIS, Virtual Account, and approved e-wallet events are available.
- **Procedure:** Return from the browser without a callback, send a forged callback, send an authenticated paid event, repeat the event, attempt to edit the paid holder, attempt transfer, and query status from the backend.
- **Expected result:** The redirect alone has no effect; the verified event causes one paid transition and one e-ticket per ticket unit; replay causes no duplicate; the paid holder is immutable and transfer is denied.
- **Evidence:** Order timeline, ticket count, provider event identifiers, correlation log, e-ticket payload inspection.

### KROWDS-TC-007 — Payment callback adversarial and recovery matrix

- **Priority:** Critical
- **Preconditions:** Xendit sandbox can emit paid, expired, failed, reversed, refund, and out-of-order scenarios for unused and unbound tickets, including a 30-minute online instruction and 7-day refund boundary.
- **Procedure:** Test invalid signatures, changed IDR payloads, duplicate events, late payment, reversal, buyer refund request, staff approval/submission, full refund before use or binding, refund after use or binding, timeout, Cloud Task retry, and reconciliation.
- **Expected result:** Invalid or contradictory events cannot produce the wrong entitlement; accepted events converge to one correct state; a buyer request cannot submit a provider refund without staff approval; full refund is accepted before use/binding and within 7 days, while later requests enter `exceptional_review` and cannot call the provider until a dual-approved Finance decision; evidence is retained.
- **Evidence:** State-machine test report, queue and dead-letter records, reconciliation report, finance trace.

### KROWDS-TC-008 — E-ticket uniqueness and delivery resilience

- **Priority:** High
- **Preconditions:** Paid orders with multiple ticket units and controllable Resend outcomes.
- **Procedure:** Issue, view, attempt duplicate issuance, download, simulate email failure and retry, and verify from another authorized session.
- **Expected result:** Ticket credentials are unique and valid; dashboard availability does not depend on email delivery; message failure does not duplicate or revoke the ticket.
- **Evidence:** Ticket inventory comparison, credential uniqueness result, sanitized message events, dashboard evidence.

### KROWDS-TC-009 — Cashier QRIS payment flow

- **Priority:** Critical
- **Preconditions:** Cashier role, approved ticket products, Available wristbands, and Xendit QRIS sandbox support are available; the cashier instruction expiry is configured to 15 minutes.
- **Procedure:** Create a cashier order, reserve an Available stock wristband, display QRIS, test pending and expired states, send verified success, repeat success, and attempt a non-QRIS method.
- **Expected result:** The stock wristband is reserved but not Active before payment; the reservation expires after 15 minutes; the cashier can activate only the confirmed QRIS purchase; duplicate success is safe; the cashier flow offers QRIS only.
- **Evidence:** Role and RLS checks, payment state, ticket and wristband transition, audit record.

### KROWDS-TC-010 — Wristband identifier generation and production export

- **Priority:** Critical
- **Preconditions:** Approved order, artwork version, material specification, private production bucket, and print laboratory are ready.
- **Procedure:** Generate identifiers at the approved volume and concurrency, verify cryptographically secure randomness and the required entropy floor, retry collisions, inspect the exact CSV schema and content, inspect token storage, print samples, scan samples, and revoke the export.
- **Expected result:** Human codes are unique; QR tokens are opaque, unpredictable, at least `128` bits of entropy, and stored only as a hash; CSV uses `batch_id,wristband_code,qr_payload,schema_version`; samples scan reliably; export access and deletion are audited.
- **Evidence:** Uniqueness report, CSV schema and content scan, print sample record, scan result, object access log.

### KROWDS-TC-011 — KREW order verification, production, and quality control

- **Priority:** Critical
- **Preconditions:** Paid wristband order with complete and incomplete data.
- **Procedure:** Verify, request revision, approve production, change artwork or quantity through an authorized path, perform quality control, and attempt shipment before approval.
- **Expected result:** KROWDS and organization roles can perform only their allowed transitions; production quantity and artwork are frozen at the correct point; private exports are accessible only through approved short-lived authorization; every transition is audited.
- **Evidence:** State timeline, role matrix, artifact versions, quality-control record, exception report.

### KROWDS-TC-012 — Biteship shipment events and reconciliation

- **Priority:** Critical
- **Preconditions:** Biteship sandbox and orders that are ready for fulfillment; an approved domestic service allowlist and organization account quote are configured.
- **Procedure:** Create a live organization-paid quote, create a domestic shipment using an allowlisted service, reject an international address and COD, retry label creation, send invalid, duplicate, reordered, and out-of-order tracking events, request KREW-approved reshipment, suppress an event, and run reconciliation.
- **Expected result:** Quote and shipment references and KREW-approved reshipment attempts are idempotent; COD, customer courier selection, and international requests fail with an operational case; invalid events are rejected; coherent delivery state is retained; a missing event is detected and recoverable.
- **Evidence:** KROWDS-to-Biteship mapping, event log, reconciliation report, operational recovery record.

### KROWDS-TC-013 — Delivery confirmation and batch activation

- **Priority:** Critical
- **Preconditions:** Produced batch, simulated Delivered state, valid and invalid Batch Activation Codes, and physical sample inventory.
- **Procedure:** Attempt activation before receipt, deliver the Resend Batch Activation message, authenticate to the dashboard, activate the valid batch, reject wrong, cross-organization, expired, or reused codes, inspect lifecycle, and scan unactivated samples.
- **Expected result:** No sample becomes Available before receipt and valid organization-scoped activation; activation is atomic, MFA-protected, single-use, email-linked where required, and audited.
- **Evidence:** Batch and wristband state history, scan denial, activation audit, inventory reconciliation.

### KROWDS-TC-014 — Identity-to-ticket-to-wristband binding

- **Priority:** Critical
- **Preconditions:** Valid paid e-ticket, matching and mismatching synthetic physical identity data, and Available wristband.
- **Procedure:** Redeem once, mismatch identity, reserve an Available wristband, attempt an unavailable or already bound wristband, bind and activate successfully, repeat binding, and inspect the single-use entitlement.
- **Expected result:** Only a valid unclaimed ticket, matching identity, and Available wristband form the atomic Available → Reserved → Bound → Active relationship; failed or repeated attempts do not create partial state.
- **Evidence:** Transactional state trace, role and RLS evidence, binding audit, inventory comparison.

### KROWDS-TC-015 — Organization isolation with RLS

- **Priority:** Critical
- **Preconditions:** At least two synthetic organizations contain similarly shaped users, teams, orders, tickets, wristbands, entitlements, and audit data.
- **Procedure:** Execute read, create, update, delete, join, search, export, background, support, and pooled-connection attempts across every organization-owned entity.
- **Expected result:** Cross-organization operations fail closed; runtime roles cannot bypass RLS; context does not leak across transactions; approved privileged access is explicit and audited.
- **Evidence:** Generated RLS test matrix, database query evidence, privilege inventory, break-glass audit when exercised.

### KROWDS-TC-016 — Registered online gate and single-use concurrency

- **Priority:** Critical
- **Preconditions:** Active, used, expired, disabled, unbound, wrong-venue, and transferred wristbands; registered, suspended, revoked, wrong-organization, and unregistered devices; controlled venue network.
- **Procedure:** Register, activate, suspend, restore, and revoke a device; scan each credential case from an active device; attempt scans from unregistered, suspended, revoked, wrong-organization, and wrong-venue devices; repeat a grant, send concurrent requests, alter local client state, and change server state between scans.
- **Expected result:** Only an active device in the expected organization and venue scope receives a current backend `Access Granted` or `Access Denied` with a reason; lifecycle changes and invalid devices are audited; one valid grant atomically transitions the wristband to Used; repeats, concurrent requests, re-entry, and multi-use are denied.
- **Evidence:** Gate decision records, database transitions, latency measurement, device trace, staff outcome.

### KROWDS-TC-017 — Gate connectivity and stale-state failure

- **Priority:** Critical
- **Preconditions:** Scanner previously received an allow result and venue network can be interrupted.
- **Procedure:** Disconnect before scan, during scan, and after send; restore with delayed and out-of-order responses; restart the client; attempt local state manipulation.
- **Expected result:** The system produces no access decision, never presents a locally granted result, shows a clear service-unavailable state, and follows the approved venue procedure without an offline alternative.
- **Evidence:** Network fault trace, UI recording, backend logs, operator procedure result.

### KROWDS-TC-018 — Audit completeness and correlation

- **Priority:** Critical
- **Preconditions:** Synthetic traces exist for registration, MFA, approval, role change, payment, ticket issue, refund, fulfillment, activation, binding, gate, and break-glass activity.
- **Procedure:** Reconcile Cloud SQL state and provider events to audit records; inspect approved BigQuery datasets; attempt to alter, delete, replay, or broadly export audit entries; search by request, actor, organization, and resource.
- **Expected result:** Every required event has actor, time, organization, resource, action, result, and correlation evidence; BigQuery is minimized and cannot authorize live state; unauthorized alteration or broad export is rejected or detected.
- **Evidence:** Audit reconciliation report, retention evidence, attempted-tampering test, investigation walkthrough.

### KROWDS-TC-019 — Frontend and backend architecture boundary

- **Priority:** Critical
- **Preconditions:** Full workspace and architecture checks are available.
- **Procedure:** Scan apps and packages for route handlers, Server Actions, backend middleware, databases, queues, backend SDKs, and direct provider calls; run Go layer and composition checks.
- **Expected result:** No frontend or package bypass exists; Go layer directions pass; one backend composition root builds the business binary.
- **Evidence:** `pnpm test:architecture`, `go test ./services/...`, static scan report, binary inventory.

### KROWDS-TC-020 — Google Cloud deployment and observability

- **Priority:** High
- **Preconditions:** Production-like Google Cloud project with approved service identities, `asia-southeast2` settings, and disposable data.
- **Procedure:** Deploy five frontend services and one backend service, invoke Cloud Run, Cloud Tasks, and Cloud Scheduler without and with valid workload identity, inspect Cloud SQL, Memorystore, Cloud Storage, BigQuery, Secret Manager, Logging, Monitoring, and Error Reporting access, and generate dependency failures.
- **Expected result:** Deployments and environments are isolated; backend, task, and scheduler invocation is authenticated; protected resources are private; Memorystore and BigQuery cannot become authoritative; failures are observable without exposing secrets.
- **Evidence:** Deployment inventory, IAM diff, network test, service-specific dashboards, alarm delivery, error report, redacted log trace.

### KROWDS-TC-021 — Database backup restoration and service recovery

- **Priority:** Critical
- **Preconditions:** Approved backup configuration and production-like encrypted database snapshot.
- **Procedure:** Back up, restore Cloud SQL and required objects to an isolated environment, validate RLS and critical records, rebuild Memorystore from authoritative state, reconcile BigQuery and provider records, restart the backend, and measure recovery evidence against approved targets.
- **Expected result:** The restored service is isolated, data and audit evidence are intact, credentials and policies remain safe, cache and analytics state cannot authorize incorrect work, and measured RPO and RTO are reported.
- **Evidence:** Restore report, policy validation, reconciliation, timing, owner sign-off.

### KROWDS-TC-022 — Privileged MFA, session, and fixed-role controls

- **Priority:** Critical
- **Preconditions:** Synthetic organization administrator, KREW, Finance, support, and operational accounts are available.
- **Procedure:** Inspect session cookies and refresh rotation, enroll privileged MFA, attempt access before enrollment, reuse and revoke a session, recover MFA, remove membership, request step-up for a sensitive action, and attempt custom-role creation.
- **Expected result:** Privileged access requires MFA and current authorization; session cookies are secure and HTTP-only; refresh credentials rotate and revoke; fixed roles cannot be expanded through custom-role APIs; sensitive actions and recovery are audited.
- **Evidence:** Browser cookie inspection, session and refresh history, MFA state, permission matrix, audit records.

### KROWDS-TC-023 — Minor guardian, consent, and ticket-policy controls

- **Priority:** Critical
- **Preconditions:** Approved minor eligibility and consent rules plus synthetic adult, minor, and verified guardian identities are available.
- **Procedure:** Purchase with a valid guardian relationship, reject missing or mismatched guardian consent, attempt edit and transfer after payment, attempt duplicate identity for the same event, and attempt a full refund before and after use or binding.
- **Expected result:** Minor purchase and later access require the approved guardian relationship and consent; paid holder data is immutable; transfer and duplicate identity are denied; full refund succeeds only before use or binding.
- **Evidence:** Eligibility decision, consent record, ticket state trace, refund result, access and audit evidence.

### KROWDS-TC-024 — Cloud Tasks, Scheduler, Memorystore, and BigQuery controls

- **Priority:** Critical
- **Preconditions:** Production-like task queues, schedules, cache, approved datasets, authenticated workload identities, and synthetic business records are available.
- **Procedure:** Invoke tasks and schedules with valid and invalid identities, duplicate and replay tasks, overlap schedules, evict and stop Memorystore, ingest approved and prohibited analytics events, and query BigQuery with authorized and unauthorized roles.
- **Expected result:** Tasks and schedules are authenticated, idempotent, retry-safe, and visible when missed; cache loss does not lose authoritative state; BigQuery receives minimized approved data and cannot mutate or authorize operational records.
- **Evidence:** Task and schedule histories, cache reconstruction, dataset schema and IAM report, prohibited-data scan, alerts.

### KROWDS-TC-025 — KREW break-glass approval, expiry, and audit

- **Priority:** Critical
- **Preconditions:** Named incident roles, valid and invalid incident cases, MFA-protected KREW accounts, and a non-production environment are available.
- **Procedure:** Request access without an incident, request with one incident commander and one security approver, attempt self-approval, use the smallest approved scope, let it expire, attempt extension, revoke it, and replay reads.
- **Expected result:** Only a valid two-role approval activates time-bounded access; scope is minimal; expiry and revocation work; every read and write is separately audited and alerted; break-glass cannot bypass payment, RLS, or anti-replay controls.
- **Evidence:** Approval history, IAM grant and expiry, access log, alert, post-use review.

## 7.1 Additional v0.1 acceptance cases

| Test case | Scenario | Pass condition |
| --- | --- | --- |
| `KROWDS-TC-027` | Ticket uniqueness and five-ticket limit | One Identity cannot hold two active tickets for the same Event/Ticket Product/Session; no request may create more than five active tickets per Identity/Event; rejected attempts do not consume inventory. |
| `KROWDS-TC-028` | Password, session, step-up, and dual approval | Minimum password policy, idle timeout, privilege reauthentication, sensitive-action step-up, and dual approval behave as specified without creating extra roles. |
| `KROWDS-TC-029` | Upload, account closure, export, and analytics controls | File type/size limits, private storage, 15-minute signed URL, 7-day export availability, immediate session revocation, consent withdrawal, and HMAC analytics controls pass. |
| `KROWDS-TC-030` | Frontend performance and accessibility | LCP/INP/CLS, authenticated usable-state timing, keyboard, screen reader, contrast, zoom/reflow, target size, and reduced-motion checks meet the accepted baseline. |
| `KROWDS-TC-031` | Provider timeout, retry, alert, and incident response | Connect/read timeout, bounded attempts, dead-letter, provider failure, named alert threshold, P1/P2/P3 cadence, reconciliation, and post-incident record pass. |
| `KROWDS-TC-032` | Physical sample and venue profile | At least 30 units per design/material combination pass critical QR/print checks, zero false grants, at least 95% first-pass scan success, and documented wear/handling results. |

---

## 8. Phase entry and exit gates

| Phase | Entry gate | Exit gate | Required test evidence | Approver role |
| --- | --- | --- | --- | --- |
| `KROWDS-PHASE-001` | Accepted boundary and RLS decisions; deployable CI; provider sandbox access; synthetic test roles; approved legal data map for the pilot | `KROWDS-TC-001` through `KROWDS-TC-004`, `KROWDS-TC-015`, `KROWDS-TC-018` through `KROWDS-TC-022`, `KROWDS-TC-024`, `KROWDS-TC-026`, `KROWDS-TC-028`, and `KROWDS-TC-029` pass; no unapproved Critical or High defect; 100% safety-critical automated coverage and at least 90% changed-rule coverage; availability, RPO/RTO, backup, session/OTP, and identity-review evidence accepted | Identity, MFA, organization, RLS, audit, architecture, cloud, deployment, restore, privacy, and consumer identity-review evidence | Product Owner (`TBD`) and Technology Owner (`TBD`) |
| `KROWDS-PHASE-002` | Phase 1 approved; Xendit sandbox; approved catalog, IDR, single-use, refund, tax-inclusive, ticket-limit, and minor-consent rules | Payment, callback, 30-minute online expiry, 7-day refund boundary, e-ticket, guardian, five-ticket uniqueness, RLS, audit, daily reconciliation, weekly Finance sign-off, API contract, performance, and regression cases pass | Sandbox transactions, state traces, guardian evidence, finance reconciliation, e-ticket inspection, performance report | Payments Product Owner (`TBD`) and Finance Owner (`TBD`) |
| `KROWDS-PHASE-003` | Phase 2 approved; approved print process; Biteship sandbox; physical samples; restricted export controls; validated stock inventory | Generation, 15-minute cashier reservation, production, quality, approved service/live quote, KREW reshipment, verified delivery, receipt confirmation, activation, RLS, audit, print, scan, and physical sample cases pass; lost or damaged stock procedure exercised | Physical sample report, export audit, Biteship reconciliation, inventory proof, cashier walkthrough | Fulfillment Product Owner (`TBD`) and Operations Owner (`TBD`) |
| `KROWDS-PHASE-004` | Phases 1 through 3 approved; registered devices; venue network; approved outage and break-glass procedures | Binding, single-use online gate, 700 ms p95, 3-second timeout/two retries, concurrency, offline fail-closed, WCAG 2.2 AA, RLS, audit, break-glass, accessibility, incident, physical, and full regression cases pass; venue rehearsal and rollback rehearsal complete | Gate decision report, fault-injection evidence, venue sign-off, accessibility report, break-glass review, audit walkthrough | Access Operations Owner (`TBD`) and Product Owner (`TBD`) |

### 8.1 Numeric target register

| Metric ID | Metric | Unit | Approved numeric target | Owner | Measurement |
| --- | --- | --- | --- | --- | --- |
| `KROWDS-TEST-METRIC-001` | Critical journey requirement coverage | Percent | 100% safety-critical requirements automated | Quality Assurance Lead (`TBD`) | Traceability report |
| `KROWDS-TEST-METRIC-002` | Changed business-rule unit coverage | Percent | ≥90% | Module Engineering Owner (`TBD`) | CI coverage |
| `KROWDS-TEST-METRIC-003` | General API latency | Milliseconds | p95 public/authenticated read/mutation: 300/500/800 ms | Backend Engineering Owner (`TBD`) | Production-like load test |
| `KROWDS-TEST-METRIC-004` | Gate decision latency | Milliseconds | p95 700 ms; client timeout 3 s; max 2 retries | Access Control Engineering Owner (`TBD`) | Venue-network test |
| `KROWDS-TEST-METRIC-005` | Peak gate scan throughput | Concurrent scans | 200 concurrent scans in standard pilot | Service Reliability Owner (`TBD`) | Concurrent load test |
| `KROWDS-TEST-METRIC-006` | Service availability | Percent | 99.9% monthly | Service Reliability Owner (`TBD`) | Production telemetry |
| `KROWDS-TEST-METRIC-007` | Recovery time objective | Hours | 4 hours | Platform Engineering Owner (`TBD`) | Restore exercise |
| `KROWDS-TEST-METRIC-008` | Recovery point objective | Minutes | 15 minutes | Database Engineering Owner (`TBD`) | Restore evidence |
| `KROWDS-TEST-METRIC-009` | Payment reconciliation completion | Cadence | Daily automated reconciliation; weekly Finance sign-off | Payments Engineering Owner (`TBD`) | Operations dashboard |
| `KROWDS-TEST-METRIC-010` | Shipment reconciliation completion | Minutes | Evidence gate; no fabricated delivery state | Fulfillment Integration Owner (`TBD`) | Operations dashboard |
| `KROWDS-TEST-METRIC-011` | OTP delivery and verification success | Percent | Evidence gate; accepted provider acceptance and verification controls | Messaging Engineering Owner (`TBD`) | Resend events and outcomes |
| `KROWDS-TEST-METRIC-012` | Printed QR successful scan rate | Percent | ≥95% first-pass on approved physical samples; 0 false grants | Fulfillment Quality Owner (`TBD`) | Controlled sample test |
| `KROWDS-TEST-METRIC-013` | Cross-organization isolation failures | Count | 0 | Data Security Test Owner (`TBD`) | RLS matrix |
| `KROWDS-TEST-METRIC-014` | Critical audit completeness | Percent | 100% of defined material actions | Audit Test Owner (`TBD`) | Audit reconciliation |
| `KROWDS-TEST-METRIC-015` | Critical journey E2E automation coverage | Percent | 100% of defined critical safety journeys have an automated or documented controlled procedure | Quality Assurance Lead (`TBD`) | Test inventory |
| `KROWDS-TEST-METRIC-016` | Browser accessibility conformance | WCAG level and defect count | WCAG 2.2 AA; 0 critical blockers; contrast/zoom/reflow/target criteria pass | Accessibility Owner (`TBD`) | Automated and manual review |
| `KROWDS-TEST-METRIC-017` | Oldest Cloud Task age and permanent failure backlog | Minutes and count | Alert at >15 minutes; dead-letter backlog requires review | Reliability Owner (`TBD`) | Cloud Tasks telemetry |
| `KROWDS-TEST-METRIC-018` | Missed or overlapping Cloud Scheduler executions | Count | 0 missed/overlapping executions in approved standard-pilot test | Platform Engineering Owner (`TBD`) | Scheduler and run records |
| `KROWDS-TEST-METRIC-019` | Memorystore recovery and authoritative fallback | Minutes and error count | No authoritative business state loss; recovery time measured and approved | Backend Engineering Owner (`TBD`) | Cache-outage exercise |
| `KROWDS-TEST-METRIC-020` | Approved BigQuery dataset freshness and prohibited-field findings | Minutes and count | HMAC/aggregate policy and 0 prohibited fields; freshness threshold evidence-based | Data Platform Owner (`TBD`) | Dataset and query telemetry |

## 9. Non-functional and failure testing

| Test area | Scenarios | Pass condition | Target |
| --- | --- | --- | --- |
| Performance | Registration, catalog, order, payment, ticket, binding, gate, and audit queries at standard-pilot concurrency and 2x burst | No incorrect state or security failure; p95 API/gate targets and standard-pilot capacity are met | API p95 300/500/800 ms, gate p95 700 ms, 200 concurrent scans, 2x for 15 minutes |
| Resilience | Cloud SQL, Memorystore, Cloud Tasks, Cloud Scheduler, Cloud Storage, BigQuery, Resend, Xendit, Biteship, and network interruption | Safe degradation, no false activation or grant, and documented recovery | RPO 15m, RTO 4h, 7/14/35-day backups, quarterly restore |
| Idempotency | Duplicate browser submits, callbacks, shipment events, activation requests, and gate requests | One intended business effect and one correlated audit result | Client key 24h, webhook freshness 5m, provider dedup 30d, bounded retries |
| Security | Cross-tenant access, privilege change, secret leakage, replay, payload tampering, and unsupported claims | Unauthorized actions fail closed; no privileged secret enters frontend or logs | Step-up/dual approval, 90-day rotation, Critical 24h/High 7d remediation |
| Privacy | Production CSV, logs, email content, exports, support access, and test data | No prohibited PII or secrets; access and retention controls operate as approved | Canonical retention, HMAC analytics, rights SLA, legal gate |
| Accessibility | Keyboard, focus, screen reader, contrast, motion, error, and status communication | Approved accessibility level with no blocking defect | WCAG 2.2 AA, 4.5:1/3:1, 200% zoom, 320px reflow, 44px targets |
| Compatibility | Supported browser, scanner, printer, and venue-network matrix | Critical journeys operate without loss of safety or evidence | Current/previous-major browser matrix; hardware evidence gate |
| Observability | Correlation across frontend, API, database, Memorystore, tasks, schedules, object storage, BigQuery, and provider event | Every sampled critical action can be diagnosed without exposing secrets | 30/90/365-day telemetry; approved alert thresholds |
| Recovery | Restore, restart, deployment rollback, and controlled feature disablement | Data and policy remain intact; recovery objectives are measured | RPO 15m, RTO 4h, quarterly restore |
| Physical quality | Codes, QR contrast, print damage, scan distance, and wristband handling | Approved samples meet readability and handling procedure | 30 units/design-material, 100% critical checks, 0 false grants, ≥95% first-pass scan |

## 10. Defect management

| Severity | Definition | Release treatment | Target resolution |
| --- | --- | --- | --- |
| Critical | Security or tenant breach, false access grant, unauthorized activation, payment corruption, irreversible data loss, or complete critical outage | Stop release and phase exit; immediate Security, Product, and Technology escalation | 24 hours |
| High | Critical journey blocked, incorrect but contained state, provider reconciliation failure, or major security control failure | Stop affected release scope and phase exit until fixed and regression evidence passes; no Critical/High release exception | 3 business days |
| Medium | Recoverable workflow defect, degraded non-critical behavior, or operational evidence gap with a safe workaround | Fix in the current phase when practical; otherwise enter the approved backlog | 10 business days |
| Low | Cosmetic, documentation, or low-impact usability issue with no safety or compliance effect | Prioritize by product value without blocking a phase unless locally severe | 90 days |

### Defect workflow

1. Record a defect ID using the approved `KROWDS-DEF-###` convention, affected requirement and test IDs, environment, evidence, impact, and discovery version.
2. Assign severity, owner role, and target phase; security, privacy, payment, RLS, and gate defects automatically notify the relevant role.
3. Reproduce with synthetic data and preserve provider, database, Memorystore, Cloud Tasks, Scheduler, object, analytics, browser, and correlation evidence.
4. Add a regression case at the lowest reliable level and retain a broader end-to-end case for critical behavior.
5. Re-run impacted phase regression, not only the changed test.
6. Close only after the fix, regression evidence, audit impact review, and required owner decision are recorded.

## 11. Entry, suspension, and exit criteria

### 11.1 Entry criteria

- The current phase and its dependency phases have approved scope and named role owners.
- Relevant accepted ADRs and open implementation decisions needed by the phase are resolved or explicitly controlled.
- The Indonesia-first legal review approves the data map, provider flows, consent, retention, and age rules required by the phase; otherwise the affected release remains blocked.
- The deployable build, provider sandbox access, telemetry, synthetic data, and destructive-environment reset are available.
- The API, event, data, and migration changes under test are frozen for the release candidate.
- Critical test cases and approved numeric targets are available; unresolved targets block the final release gate rather than being guessed.

### 11.2 Suspension criteria

Testing pauses for the affected scope when any of the following occurs:

- an uncontained Critical defect, confirmed cross-organization exposure, false gate grant, unauthorized payment activation, privileged MFA bypass, or improper break-glass use;
- test data contains unintended PII, credentials, raw card data, full QR tokens, or production QR credentials;
- provider or environment behavior no longer represents the accepted integration;
- required audit evidence is missing or cannot be correlated;
- rollback or restore cannot proceed safely;
- a minor purchase or access path lacks the approved guardian and consent decision;
- an owner withdraws a required provider account or test environment.

### 11.3 Exit criteria

- All Critical and High verification requirements have passing evidence; no Critical or High defect is open or formally excepted at phase exit.
- Requirement coverage, automated coverage, and changed-code coverage meet the confirmed phase targets; remaining provider/venue measurements are approved before release rather than guessed.
- Zero unresolved cross-tenant data exposure, false access grants, unauthorized activations, privileged MFA bypass, unaudited critical transitions, or active break-glass grants.
- No MVP path exposes ticket transfer, re-entry, multi-use, non-IDR payment, refund after use or binding, or an offline access decision.
- Payment, fulfillment, gate, restore, rollback, and operational-recovery exercises meet approved targets.
- Provider sandbox, production-like, physical, venue, accessibility, security, RLS, Cloud Tasks, Scheduler, Memorystore, and BigQuery evidence is reviewed for applicable scope.
- No prohibited secret, PII, credential, raw card data, full QR token, or production export remains in test artifacts.
- Test report, known limitations, non-blocking residual risk acceptance, and rollback plan are approved by the phase roles; Critical/High defects remain release blockers.

## 12. Results and reporting

| Result ID | Metric | Target | Actual | Status | Evidence owner |
| --- | --- | ---: | ---: | --- | --- |
| `KROWDS-TEST-RESULT-001` | Critical requirements with passing evidence | `TBD` | Not measured | Not started | Quality Assurance Lead (`TBD`) |
| `KROWDS-TEST-RESULT-002` | High requirements with passing evidence | `TBD` | Not measured | Not started | Quality Assurance Lead (`TBD`) |
| `KROWDS-TEST-RESULT-003` | Critical defect backlog | `TBD` | Not measured | Not started | Technology Owner (`TBD`) |
| `KROWDS-TEST-RESULT-004` | High defect backlog | `TBD` | Not measured | Not started | Product Owner (`TBD`) |
| `KROWDS-TEST-RESULT-005` | Requirement coverage | `TBD` | Not measured | Not started | Test Engineering Lead (`TBD`) |
| `KROWDS-TEST-RESULT-006` | Changed-rule unit coverage | `TBD` | Not measured | Not started | Module Engineering Owner (`TBD`) |
| `KROWDS-TEST-RESULT-007` | Critical E2E automation coverage | `TBD` | Not measured | Not started | Quality Assurance Lead (`TBD`) |
| `KROWDS-TEST-RESULT-008` | Gate latency and throughput | `TBD` | Not measured | Not started | Reliability Test Owner (`TBD`) |
| `KROWDS-TEST-RESULT-009` | RPO and RTO | `TBD` | Not measured | Not started | Platform Engineering Owner (`TBD`) |
| `KROWDS-TEST-RESULT-010` | Printed QR scan success | `TBD` | Not measured | Not started | Fulfillment Quality Owner (`TBD`) |
| `KROWDS-TEST-RESULT-011` | Cloud Task freshness and Scheduler correctness | `TBD` | Not measured | Not started | Reliability Owner (`TBD`) |
| `KROWDS-TEST-RESULT-012` | BigQuery approved-data and prohibited-field findings | `TBD` | Not measured | Not started | Data Platform Owner (`TBD`) |
| `KROWDS-TEST-RESULT-013` | Unauthorized privileged, tenant, and gate decisions | `TBD` | Not measured | Not started | Security Test Owner (`TBD`) |

## 13. Approval and review

| Review role | Name | Decision | Date |
| --- | --- | --- | --- |
| Product Owner | `TBD` | Pending | `TBD` |
| Technology Owner | `TBD` | Pending | `TBD` |
| Quality Assurance Lead | `TBD` | Pending | `TBD` |
| Security Architecture Owner | `TBD` | Pending | `TBD` |
| Operations Owner | `TBD` | Pending | `TBD` |

The next review is due when a phase enters testing, a provider or security decision changes, or a critical defect is found. External evidence gates remain in [OPEN-DECISIONS.md](../00-governance/OPEN-DECISIONS.md).
