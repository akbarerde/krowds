# KROWDS-ADR-DOC-001 — KROWDS Architecture Decision Records

## Metadata

| Field | Value |
| --- | --- |
| Document ID | `KROWDS-ADR-DOC-001` |
| Version | `0.1` |
| Status | `Draft` |
| Last updated | `2026-09-24` |
| Owner | Architecture Review Board (members `TBD`) |
| Canonical product baseline | [`PRODUCT-VISION.md`](../01-product/PRODUCT-VISION.md) |
| Scope | KROWDS platform, integrations, data isolation, wristband credentials, and access control |
| Decision policy | Confirmed baseline decisions are `Accepted`; unresolved choices remain controlled in [OPEN-DECISIONS.md](../00-governance/OPEN-DECISIONS.md) until evidence and approval are recorded |

## Decision index

| ADR | Decision | Status | Primary owner | Roadmap phase |
| --- | --- | --- | --- | --- |
| `KROWDS-ADR-001` | Keep Next.js frontend-only and Go + Gin as one backend modular monolith | `Accepted` | Technology Owner (`TBD`) | `KROWDS-PHASE-001` |
| `KROWDS-ADR-002` | Use Google Cloud Platform as the deployment platform | `Accepted` | Platform Engineering Owner (`TBD`) | `KROWDS-PHASE-001` |
| `KROWDS-ADR-003` | Use Xendit for payment processing | `Accepted` | Payments Product Owner (`TBD`) | `KROWDS-PHASE-002` |
| `KROWDS-ADR-004` | Use Resend for transactional email | `Accepted` | Identity Product Owner (`TBD`) | `KROWDS-PHASE-001` |
| `KROWDS-ADR-005` | Use Biteship for shipment fulfillment and tracking | `Accepted` | Fulfillment Product Owner (`TBD`) | `KROWDS-PHASE-003` |
| `KROWDS-ADR-006` | Enforce organization isolation with PostgreSQL Row-Level Security | `Accepted` | Data Security Owner (`TBD`) | `KROWDS-PHASE-001` |
| `KROWDS-ADR-007` | Use a human-readable wristband code and an opaque QR credential | `Accepted` | Security Architecture Owner (`TBD`) | `KROWDS-PHASE-003` |
| `KROWDS-ADR-008` | Make access-gate decisions online-first and backend-authoritative | `Accepted` | Access Operations Owner (`TBD`) | `KROWDS-PHASE-004` |

---

## KROWDS-ADR-001 — Frontend and backend responsibility boundary

### Metadata

| Field | Value |
| --- | --- |
| Status | `Accepted` |
| Decision date | `2026-09-24` |
| Deciders | Product Owner (`TBD`), Technology Owner (`TBD`), Security Architecture Owner (`TBD`) |
| Technical owner | Technology Owner (`TBD`) |
| Related test cases | `KROWDS-TC-019`, `KROWDS-TC-020` |
| Related roadmap phases | `KROWDS-PHASE-001` through `KROWDS-PHASE-004` |

### Context

KROWDS has five browser-facing Next.js applications and one business backend. Keeping business workflows, credentials, persistence, and authorization out of the frontend prevents duplicated policy, secret exposure, and inconsistent enforcement. It also preserves one operational backend while the business remains divided into in-process modules.

### Decision drivers

- One authoritative implementation of authentication, authorization, payment, and access rules
- Prevention of secrets, database access, and privileged vendor SDKs from reaching browsers
- Independent delivery of the five frontend applications
- Testable Clean Architecture boundaries
- One backend composition root and one deployable binary

### Options considered

| Option | Advantages | Disadvantages | Outcome |
| --- | --- | --- | --- |
| Next.js backend routes or Server Actions beside each UI | Fast local delivery | Duplicates backend logic, weakens one authority, complicates authorization and audit | Rejected |
| Frontend-only Next.js with one Go + Gin modular monolith | Clear trust boundary, shared business policy, straightforward local development | Requires an explicit HTTP contract and disciplined ownership | Selected |
| Independently deployed Go services per business capability | Stronger isolated scaling | Higher operational overhead and distributed transactions for an early integrated product | Rejected |

### Decision

KROWDS shall keep `apps/web`, `apps/auth`, `apps/krew`, `apps/org`, and `apps/pwa` as frontend-only Next.js applications. Browser requests to the backend shall use `@krowds/api`; the PWA service-worker fetch handler is the only framework-specific network exception.

Next.js applications shall not host route handlers, Server Actions, backend `proxy.ts` or `middleware.ts` logic, databases, queues, or backend-only SDKs. The Go + Gin service under `services/` shall exclusively own HTTP APIs, authentication, authorization, persistence, queues, and business workflows. It shall remain one deployable binary with one composition root and in-process modules that follow the repository's Clean Architecture dependency rules.

The fixed local ports remain: Web `3000`, Auth `3001`, KREW `3002`, Org `3003`, and PWA `3004`.

### Consequences

#### Positive

- Business rules and vendor credentials have one backend authority.
- Frontend applications remain independently deployable presentation clients.
- Architecture checks can detect boundary violations before release.
- Cross-module behavior can be tested without introducing distributed transactions.

#### Trade-offs

- Browser features require explicit API contracts and client state handling.
- Teams must maintain the shared API client and generated or shared TypeScript contracts.
- The backend is a shared release boundary even though its modules remain logically separated.

### Validation

| Validation ID | Pass condition | Evidence |
| --- | --- | --- |
| `KROWDS-ADR-001-VAL-001` | No prohibited Next.js backend constructs or backend SDK imports exist | `pnpm test:architecture`, static dependency review |
| `KROWDS-ADR-001-VAL-002` | Go domain and application layers contain no Gin, delivery, infrastructure, database, queue, or transport dependencies | `services/cmd/server/architecture_test.go` |
| `KROWDS-ADR-001-VAL-003` | Browser-facing calls traverse `@krowds/api`, except approved PWA service-worker handling | API-client review and contract tests |
| `KROWDS-ADR-001-VAL-004` | One backend binary builds and starts from `services/cmd/server` | Go build and deployment smoke test |

### Follow-up ownership

| Action | Owner | Due |
| --- | --- | --- |
| Publish and version the backend HTTP contract | API Owner (`TBD`) | `TBD` |
| Add all boundary violations to CI blocking checks | Developer Experience Owner (`TBD`) | `TBD` |
| Review whether any exceptional PWA handling is required | PWA Owner (`TBD`) | `TBD` |

---

## KROWDS-ADR-002 — Google Cloud Platform deployment baseline

### Metadata

| Field | Value |
| --- | --- |
| Status | `Accepted` |
| Decision date | `2026-09-24` |
| Deciders | Technology Owner (`TBD`), Platform Engineering Owner (`TBD`), Finance Owner (`TBD`) |
| Technical owner | Platform Engineering Owner (`TBD`) |
| Related test cases | `KROWDS-TC-020`, `KROWDS-TC-021`, `KROWDS-TC-024` |
| Related roadmap phase | `KROWDS-PHASE-001` |

### Context

KROWDS needs a single cloud operating model for container deployment, PostgreSQL, object storage, asynchronous work, secrets, logging, monitoring, and controlled access. The selected platform must support the frontend/backend boundary, PostgreSQL RLS, Indonesian payment and email integrations, and physical fulfillment without creating separately deployed business services.

### Decision drivers

- Managed container hosting for the Go binary and five frontend applications
- Managed PostgreSQL compatible with RLS and transactional consistency
- Managed queues, object storage, secrets, and operational telemetry
- Regional resilience, backup, and restore capabilities
- Cost visibility and a single vendor support model

### Options considered

| Option | Advantages | Disadvantages | Outcome |
| --- | --- | --- | --- |
| AWS | Broad service maturity | Conflicts with the confirmed platform baseline | Rejected |
| Hybrid or multi-cloud | Geographic or vendor flexibility | Higher complexity without a current requirement | Rejected |
| Google Cloud Platform | Integrated managed services and strong container, data, and operations support | Requires explicit region, quota, and cost controls | Selected |

### Decision

KROWDS shall use Google Cloud Platform as its production platform. The accepted baseline is:

- Cloud Run for five independently deployed frontend applications and one named service running the single Go backend artifact, including its task and scheduler routes;
- Cloud SQL for PostgreSQL as the transactional system of record with organization-scoped RLS;
- Memorystore for rebuildable cache, rate limiting, short-lived coordination, and idempotency assistance, never as the sole durable business record;
- Cloud Tasks for authenticated asynchronous email, provider callback, export, and retry work;
- Cloud Scheduler for authenticated expiry, reconciliation, cleanup, and recurring operational jobs;
- Cloud Storage for private legal documents, artwork, controlled production CSV files, and other governed object data;
- Secret Manager for runtime, database, webhook, and provider secrets accessed through workload identity;
- Cloud Logging, Cloud Monitoring, and Cloud Error Reporting for correlated operational diagnosis;
- BigQuery for approved, minimized audit, reconciliation, and operational datasets, never as an operational system of record;
- Identity and Access Management, least-privilege service accounts, authenticated Cloud Run invocation, and private connectivity for protected resources.

Cloud Tasks and Cloud Scheduler shall invoke authenticated routes on the same backend artifact; they shall not create a second backend program. The MVP target is single-region `asia-southeast2` with RPO 15 minutes, RTO 4 hours, backup retention 7/14/35 days, quarterly restore drills, and cross-region DR post-MVP or separately approved. Cloud SQL edition/topology, machine sizes, quotas, cost budgets, and CMEK remain controlled external configuration gates in [OPEN-DECISIONS.md](../00-governance/OPEN-DECISIONS.md).

### Consequences

#### Positive

- One cloud vocabulary covers deployment, transactional data, ephemeral coordination, asynchronous work, schedules, secrets, objects, telemetry, and analytics.
- Cloud SQL supports transactional RLS enforcement.
- Cloud Tasks and Cloud Scheduler preserve one backend authority while adding reliable asynchronous execution.
- BigQuery supports audit and operational analysis without contaminating live business state.

#### Trade-offs

- KROWDS becomes operationally dependent on one cloud provider and one initial region.
- Memorystore failure can affect coordination and rate controls even though Cloud SQL remains authoritative.
- Cloud Tasks, Cloud Scheduler, BigQuery, and provider failures require distinct recovery behavior.
- Regional disruption has reduced service availability until a separately approved recovery strategy exists.

### Validation

| Validation ID | Pass condition | Evidence |
| --- | --- | --- |
| `KROWDS-ADR-002-VAL-001` | Five frontend services and one backend service deploy from CI with distinct identities | Deployment inventory and smoke test |
| `KROWDS-ADR-002-VAL-002` | Runtime identities can access only the Google Cloud resources required by their role | IAM policy review |
| `KROWDS-ADR-002-VAL-003` | Cloud SQL and Cloud Storage backup restoration succeeds in an isolated environment | Restore exercise report |
| `KROWDS-ADR-002-VAL-004` | Logs, metrics, and error reports identify failures across frontend, backend, database, tasks, schedules, object storage, analytics, and vendor adapters | Staging observability review |
| `KROWDS-ADR-002-VAL-005` | Unauthenticated Cloud Run, task, and scheduler invocation is rejected and replayed task execution is idempotent | IAM and fault-injection test |
| `KROWDS-ADR-002-VAL-006` | Memorystore loss does not lose authoritative business state and BigQuery access cannot mutate or authorize operational records | Cache-outage and BigQuery IAM tests |

### Follow-up ownership

| Action | Owner | Due |
| --- | --- | --- |
| Approve Indonesia-first data-residency evidence, external GCP identifiers/quotas/CMEK, and post-MVP cross-region scope; single-region, RPO/RTO, and backup baselines are fixed | Platform Engineering Owner (`TBD`) and Privacy and Legal Counsel (`TBD`) | `TBD` |
| Approve RPO 15 minutes, RTO 4 hours, backup/log retention 7/14/35 and 30/90/365 days, and quarterly restore evidence | Service Reliability Owner (`TBD`) | `TBD` |
| Establish cloud budget alarms, quota review, and 30/90/365-day log-retention configuration for development/staging/production | Platform Engineering Owner (`TBD`) | `TBD` |

---

## KROWDS-ADR-003 — Xendit payment processing

### Metadata

| Field | Value |
| --- | --- |
| Status | `Accepted` |
| Decision date | `2026-09-24` |
| Deciders | Payments Product Owner (`TBD`), Finance Owner (`TBD`), Technology Owner (`TBD`) |
| Technical owner | Payments Engineering Owner (`TBD`) |
| Related test cases | `KROWDS-TC-005`, `KROWDS-TC-006`, `KROWDS-TC-007`, `KROWDS-TC-009` |
| Related roadmap phase | `KROWDS-PHASE-002` |

### Context

KROWDS must accept IDR payments through Xendit QRIS, Virtual Account, and approved e-wallet methods for online purchase, and QRIS for the cashier path. It must issue e-tickets only after a verified payment, support retries without duplication, enforce the MVP ticket policy, and retain evidence for full refunds, finance, reconciliation, and audit. The browser cannot be trusted to confirm payment.

### Decision drivers

- Exact IDR payment amounts through QRIS, Virtual Account, and approved e-wallet methods
- Cashier QRIS using the same backend payment state model
- Server-side verification of payment state
- Idempotent handling of callbacks, client retries, refunds, and reconciliation
- Immutable ticket-holder data after successful payment and no ticket transfer
- No raw card data or privileged payment credentials in frontend applications or KROWDS storage

### Options considered

| Option | Advantages | Disadvantages | Outcome |
| --- | --- | --- | --- |
| Manual payment confirmation | Simple initial implementation | Fraud exposure and weak auditability | Rejected |
| Multiple provider implementations without a common policy | Channel flexibility | Duplicated state handling and inconsistent operations | Rejected |
| Xendit behind one backend payment adapter | Indonesian payment fit, one integration boundary, auditable state | Vendor dependency and callback dependency | Selected |

### Decision

KROWDS shall use Xendit for payment processing. The MVP payment currency is IDR. Online purchase may use QRIS, Virtual Account, and approved e-wallet products; cashier purchase uses QRIS. The Go backend shall be the only component allowed to hold Xendit credentials and call Xendit APIs. Frontend applications shall request a payment instruction from KROWDS and render the returned action without becoming a payment authority.

Each KROWDS order shall represent an exact integer IDR amount, own a stable idempotency key, and map one-to-one to a Xendit transaction reference. A ticket, wristband activation, refund, or entitlement transition shall occur only after a verified Xendit event or authenticated server-to-server status check proves the required state. Browser redirects and client-submitted success flags shall never activate a purchase. KROWDS shall use hosted or tokenized collection when an enabled method requires it and shall not accept, store, or log raw card numbers, card verification values, or equivalent credentials.

Webhook processing shall verify authenticity, tolerate duplicate and out-of-order delivery, durably record the provider event, and apply state transitions transactionally. Provider calls use the accepted timeout/retry policy; reconciliation and alert thresholds use the accepted starting values, with named destinations and evidence remaining release gates. Cancellation and refund behavior shall use explicit KROWDS states and preserve the original payment and order history. An in-window full refund request is permitted before a ticket is Bound or Used and within 7 calendar days after verified payment; Finance or Organization Admin approves/submits it, and later eligible requests enter `exceptional_review` for a dual-approved Finance decision. Ticket-holder data becomes immutable after successful payment, and ticket transfer is not supported.

The Xendit account, exact product configuration, webhook verification version, fee/tax wording, settlement fields, and reconciliation ownership remain external `TBD`; the product baseline fixes QRIS/VA/approved e-wallet, 30m/15m expiry, 7-day refund request, daily reconciliation, weekly Finance sign-off, and organization pass-through fees.

### Consequences

#### Positive

- One payment adapter centralizes verification, reconciliation, and audit evidence.
- Idempotent state transitions reduce duplicate ticket issuance.
- Payment credentials remain outside the browser trust boundary.

#### Trade-offs

- Xendit availability and policy affect checkout and payment reconciliation.
- Provider identifiers and status mappings must be maintained.
- Delayed or missing notifications require active reconciliation rather than trusting the UI.

### Validation

| Validation ID | Pass condition | Evidence |
| --- | --- | --- |
| `KROWDS-ADR-003-VAL-001` | Forged callbacks cannot change payment or order state | Negative integration test |
| `KROWDS-ADR-003-VAL-002` | Duplicate and out-of-order callbacks produce one business effect | Xendit sandbox integration test |
| `KROWDS-ADR-003-VAL-003` | No ticket or wristband becomes active from a browser redirect alone | End-to-end test |
| `KROWDS-ADR-003-VAL-004` | Failed activation can be retried without creating another ticket or charge | Failure-injection test |
| `KROWDS-ADR-003-VAL-005` | Non-IDR amounts and raw card data are rejected and absent from KROWDS storage and logs | API, storage, and log inspection |
| `KROWDS-ADR-003-VAL-006` | Ticket-holder data cannot change after paid and a full refund is denied after use or binding | State-machine and authorization test |

### Follow-up ownership

| Action | Owner | Due |
| --- | --- | --- |
| Approve Xendit external account/product identifiers, customer-facing fee/tax-invoice wording, settlement details, and exceptional-refund terms; 7-day request, 30m/15m expiry, daily reconciliation, and weekly sign-off are fixed | Payments Product Owner (`TBD`) | `TBD` |
| Define callback retention and reconciliation schedule; daily reconciliation and weekly Finance sign-off are fixed | Payments Engineering Owner (`TBD`) | `TBD` |
| Complete Xendit production certification | Finance Operations Owner (`TBD`) | `TBD` |

---

## KROWDS-ADR-004 — Resend transactional email

### Metadata

| Field | Value |
| --- | --- |
| Status | `Accepted` |
| Decision date | `2026-09-24` |
| Deciders | Identity Product Owner (`TBD`), Security Architecture Owner (`TBD`), Technology Owner (`TBD`) |
| Technical owner | Messaging Engineering Owner (`TBD`) |
| Related test cases | `KROWDS-TC-001`, `KROWDS-TC-002`, `KROWDS-TC-008`, `KROWDS-TC-013` |
| Related roadmap phase | `KROWDS-PHASE-001` |

### Context

KROWDS needs reliable delivery for account verification and recovery, organization onboarding and revision, team invitations, ticket purchase and payment status, e-ticket delivery, wristband fulfillment and activation, and security notices. Email addresses and OTP values are sensitive, and email delivery status is not proof that a person owns or controls an account beyond successful code verification.

### Decision drivers

- Measurable transactional delivery across the complete phase workflow
- Domain authentication and sender reputation controls
- Centralized rate limiting, suppression, bounce, and complaint handling
- Protection of OTP values, identity information, and payment data
- Backend-only credentials and auditable delivery attempts through Cloud Tasks where retry is required

### Options considered

| Option | Advantages | Disadvantages | Outcome |
| --- | --- | --- | --- |
| Direct SMTP from the application | Simple conceptual model | Deliverability, credential, and operations burden remain internal | Rejected |
| Multiple email providers selected by each module | Flexibility | Fragmented domains, suppression, and delivery evidence | Rejected |
| Resend behind one backend messaging adapter | Clear ownership, provider events, and central policy | External delivery dependency | Selected |

### Decision

KROWDS shall use Resend for all transactional email categories: account verification and recovery; organization onboarding and revision; team invitations; ticket purchase and payment status; e-ticket delivery; wristband shipping, revision, delivery, and activation; and security notices. The Go backend shall own a messaging adapter that selects approved message content and sends through Resend; frontend applications shall never call Resend directly.

The backend shall use a dedicated KROWDS-owned transactional subdomain, Secret Manager credentials, authenticated and idempotent send requests, and a shared suppression, bounce, and complaint policy. Resend delivery-status webhooks shall be authenticated, deduplicated, and correlated to a message. Email verification OTPs have a 15-minute expiry, five attempts, a 60-second resend cooldown, and the accepted route-class limits. OTP values, identity numbers, full QR tokens, access tokens, and payment secrets shall not appear in message analytics, logs, or BigQuery.

Successful code verification, not a provider delivery event, shall establish ownership of an email address. Provider delivery and complaint events shall be recorded for operations but shall not bypass account state rules. An email failure shall not by itself change payment, ticket, wristband, or identity state. Ticket delivery failure shall not revoke a valid ticket already available in the user dashboard. Invitations and Batch Activation Codes shall follow the single-use, organization-scoped, and expiry rules defined by their use cases.

Exact message content, actual domain hostname, sender identities, and provider/legal content approval remain external gates; the dedicated subdomain, SPF/DKIM/DMARC, accepted rate/suppression baseline, and 15m/5/60s OTP baseline are fixed.

### Consequences

#### Positive

- Domain and bounce controls are managed in one place.
- Abuse limits and message evidence can be applied consistently.
- Resend credentials and provider errors stay within the backend boundary.

#### Trade-offs

- Account verification and selected notifications depend on Resend.
- Misconfigured domain authentication can damage deliverability.
- A delivered message is not proof of account control; verification remains mandatory.

### Validation

| Validation ID | Pass condition | Evidence |
| --- | --- | --- |
| `KROWDS-ADR-004-VAL-001` | No frontend bundle or browser request contains a Resend credential | Static scan and browser network test |
| `KROWDS-ADR-004-VAL-002` | Expired, reused, or over-attempted OTP values cannot verify an account | Identity integration test |
| `KROWDS-ADR-004-VAL-003` | Hard bounces and complaints suppress inappropriate future sends | Messaging adapter test |
| `KROWDS-ADR-004-VAL-004` | Message events are correlated without exposing OTP or identity data | Log review and support runbook exercise |

### Follow-up ownership

| Action | Owner | Due |
| --- | --- | --- |
| Verify dedicated sending subdomain and configure SPF/DKIM/DMARC | Messaging Engineering Owner (`TBD`) | `TBD` |
| Approve provider/domain/message evidence for the accepted OTP, invitation, bounce, suppression, and retention baseline; 15-minute OTP, five attempts, 60-second resend, and 24-hour recovery are fixed | Identity Product Owner (`TBD`) | `TBD` |
| Create deliverability and suppression operations procedure | Support Operations Owner (`TBD`) | `TBD` |

---

## KROWDS-ADR-005 — Biteship physical fulfillment and tracking

### Metadata

| Field | Value |
| --- | --- |
| Status | `Accepted` |
| Decision date | `2026-09-24` |
| Deciders | Fulfillment Product Owner (`TBD`), Operations Owner (`TBD`), Technology Owner (`TBD`) |
| Technical owner | Fulfillment Integration Owner (`TBD`) |
| Related test cases | `KROWDS-TC-011`, `KROWDS-TC-012` |
| Related roadmap phase | `KROWDS-PHASE-003` |

### Context

Paid wristband orders contain physical production work, artwork, customer contact data, and a delivery destination. KROWDS needs shipment labels, courier updates, tracking events, and proof of delivery without allowing a shipping provider to control wristband production state or receive unnecessary production and identity data.

### Decision drivers

- Domestic Indonesia labels, tracking, delivery events, and reshipment workflow
- Organization-paid shipping with no cash-on-delivery
- Clear separation between payment, production, and delivery state
- Reliable webhook processing and reconciliation
- Protection of customer PII and controlled production data
- Manual recovery when the provider is unavailable

### Options considered

| Option | Advantages | Disadvantages | Outcome |
| --- | --- | --- | --- |
| KROWDS directly integrates every courier | Maximum control | High maintenance and inconsistent tracking behavior | Rejected |
| Kiteship-managed fulfillment | Consolidated logistics | Broadens KROWDS fulfillment responsibilities | Rejected |
| Biteship for domestic shipping while KROWDS owns order and production state | Clear boundary, one shipping integration, approved reshipment path | Provider and webhook dependency | Selected |

### Decision

KROWDS shall use Biteship for domestic Indonesia shipment creation, organization-selected services from an approved allowlist, live organization-paid quotes, labels, tracking, delivery status, and KREW-approved reshipment workflow. Customer-facing flows shall not offer cash-on-delivery or courier selection. International shipping and marketplace courier selection are outside the MVP. The Go backend shall be the only component allowed to call Biteship and hold its credentials.

A KROWDS wristband order shall map to a Biteship shipment reference with a stable idempotency key. KROWDS shall remain the source of truth for payment, verification, production, quality control, activation eligibility, and operational approval. Biteship status shall update shipment and delivery projections but shall not directly activate a batch.

Webhook processing shall verify authenticity, tolerate duplicate and out-of-order events, and retain provider event identifiers. Reconciliation shall detect missing or contradictory events. Address and contact data shall be minimized, encrypted in transit and at rest, visible only to authorized fulfillment roles, and retained according to the approved policy.

Production files, QR credentials, artwork, identity documents, bank information, payment data, and visitor access data shall not be sent to Biteship. A COD request shall fail and create an operational case rather than being converted into a paid shipment. The approved domestic service allowlist, live quote, organization payer, and KREW-approved reshipment policy are fixed; exact courier IDs, packaging, and venue service levels remain evidence gates in [OPEN-DECISIONS.md](../00-governance/OPEN-DECISIONS.md).

### Consequences

#### Positive

- KROWDS can add or change couriers through one integration.
- Shipment progress is visible through a consistent provider model.
- Production and activation authority remains inside KROWDS.

#### Trade-offs

- Fulfillment visibility depends on Biteship event quality and availability.
- Address PII crosses a vendor boundary and requires explicit controls.
- Tracking discrepancies require reconciliation and operational procedures.

### Validation

| Validation ID | Pass condition | Evidence |
| --- | --- | --- |
| `KROWDS-ADR-005-VAL-001` | Biteship credentials and privileged API calls are absent from frontend bundles | Static scan and network review |
| `KROWDS-ADR-005-VAL-002` | Duplicate, invalid, and out-of-order tracking events yield one coherent KROWDS state | Sandbox integration test |
| `KROWDS-ADR-005-VAL-003` | A shipping event cannot move a batch directly to Available or Active | Negative authorization test |
| `KROWDS-ADR-005-VAL-004` | KROWDS can reconcile a missing Biteship event | Failure-injection and operations exercise |
| `KROWDS-ADR-005-VAL-005` | International addresses and COD are rejected and an approved reshipment remains idempotent | Address, contract, and retry test |

### Follow-up ownership

| Action | Owner | Due |
| --- | --- | --- |
| Approve supported courier IDs, packaging, and delivery promises; approved domestic allowlist, live organization-paid quote, and KREW-approved reshipment are fixed | Fulfillment Product Owner (`TBD`) | `TBD` |
| Define shipping PII retention and support access | Privacy Owner (`TBD`) | `TBD` |
| Prepare manual shipment recovery and reconciliation procedures | Fulfillment Operations Owner (`TBD`) | `TBD` |

---

## KROWDS-ADR-006 — PostgreSQL Row-Level Security for tenant isolation

### Metadata

| Field | Value |
| --- | --- |
| Status | `Accepted` |
| Decision date | `2026-09-24` |
| Deciders | Data Security Owner (`TBD`), Technology Owner (`TBD`), Database Owner (`TBD`) |
| Technical owner | Database Engineering Owner (`TBD`) |
| Related test cases | `KROWDS-TC-003`, `KROWDS-TC-004`, `KROWDS-TC-015`, `KROWDS-TC-019` |
| Related roadmap phases | `KROWDS-PHASE-001` through `KROWDS-PHASE-004` |

### Context

KROWDS is a multi-organization B2B2C system. Every organization-owned record must remain isolated even when application filters are missed, reused incorrectly, or introduced later. Defense in depth is required because authorization defects can expose another organization's users, orders, tickets, wristbands, or audit records.

### Decision drivers

- Mandatory organization scoping at the persistence boundary
- Resistance to missing or incorrect application-level filters
- Consistent behavior across synchronous requests, background work, and support tooling
- Testable policies and safe migrations
- Explicit privileged operations

### Options considered

| Option | Advantages | Disadvantages | Outcome |
| --- | --- | --- | --- |
| Application filters only | Simple policies | A single missing predicate can cause cross-tenant data exposure | Rejected |
| Separate database or schema per organization | Strong physical separation | Migration and connection overhead at scale | Deferred |
| Shared PostgreSQL schema with RLS plus application authorization | Strong isolation with manageable operations | Requires disciplined context, migrations, and tests | Selected |

### Decision

Organization-owned PostgreSQL tables shall carry an immutable organization key and shall enable and force Row-Level Security. RLS is a defense-in-depth control and does not replace application-level role and permission checks.

After authentication and authorization establish the actor and organization context, the backend shall start a database transaction and set transaction-local RLS context before reading or writing tenant data. The runtime database role shall not have `BYPASSRLS` or superuser privileges. Connections may be pooled only when transaction boundaries and context clearing are proven to prevent leakage.

Policies shall match organization scope first and may narrow access by actor, role, resource state, or operation. Global tables and system-owned records shall be explicitly classified; each exception shall have a documented owner, narrow policy, and test. Background jobs and support tools shall use explicit scoped identities and shall not obtain unrestricted access by convenience.

RLS policy changes shall be versioned migrations with automated negative tests. A production bypass or manual cross-tenant access procedure is a security incident unless performed through an approved, logged break-glass process.

### Consequences

#### Positive

- Tenant isolation is enforced below most application code.
- Missing query filters fail closed for protected tables.
- Policy behavior can be tested directly and automatically.

#### Trade-offs

- Every tenant-aware migration and transaction path must be correct.
- Connection pooling, background work, and support tooling require additional controls.
- RLS can complicate analytics and data operations that are not tenant-scoped.

### Validation

| Validation ID | Pass condition | Evidence |
| --- | --- | --- |
| `KROWDS-ADR-006-VAL-001` | Cross-organization reads and writes return no protected rows and cause no mutation | Automated RLS matrix |
| `KROWDS-ADR-006-VAL-002` | Runtime credentials cannot bypass RLS | Database privilege inspection |
| `KROWDS-ADR-006-VAL-003` | Context cannot leak across pooled requests or transactions | Concurrency and connection-reuse tests |
| `KROWDS-ADR-006-VAL-004` | Every organization-owned table is classified and protected by a reviewed policy | Schema inventory and migration review |

### Follow-up ownership

| Action | Owner | Due |
| --- | --- | --- |
| Inventory global, tenant-owned, and system-owned tables | Database Engineering Owner (`TBD`) | `TBD` |
| Define the transaction-local context mechanism | Backend Architecture Owner (`TBD`) | `TBD` |
| Define break-glass access approval and audit | Security Operations Owner (`TBD`) | `TBD` |

---

## KROWDS-ADR-007 — Opaque wristband QR credentials and human-readable codes

### Metadata

| Field | Value |
| --- | --- |
| Status | `Accepted` |
| Decision date | `2026-09-24` |
| Deciders | Security Architecture Owner (`TBD`), Fulfillment Product Owner (`TBD`), Operations Owner (`TBD`) |
| Technical owner | Wristband Domain Owner (`TBD`) |
| Related test cases | `KROWDS-TC-010`, `KROWDS-TC-011`, `KROWDS-TC-013`, `KROWDS-TC-016` |
| Related roadmap phase | `KROWDS-PHASE-003` |

### Context

Every manufactured wristband needs a practical support identifier and a secure machine-readable credential. The production artifact is created before a visitor or ticket is known, so it must contain no personal or entitlement data. Printed credentials can be copied, leaked, or scanned repeatedly, making secrecy, uniqueness, status checks, and lifecycle control essential.

### Decision drivers

- Fast lookup during binding and gate operations
- No personal, ticket, pricing, or entitlement data in production records or QR codes
- Distinct human support and machine credential purposes
- Collision resistance and controlled issuance
- Supportability after production, shipping, activation, binding, and disablement

### Options considered

| Option | Advantages | Disadvantages | Outcome |
| --- | --- | --- | --- |
| One visible code used by both staff and scanners | Fewer identifiers | Human disclosure increases credential exposure | Rejected |
| Sequential database IDs in the QR code | Easy generation | Predictable and may leak volume or business information | Rejected |
| Immutable human code plus random opaque QR credential | Supports operations without exposing business or personal data | Requires secure generation, storage, and print controls | Selected |

### Decision

Each wristband shall have two immutable identifiers:

- a human-readable `wristband_code` for support, inventory, search, and controlled troubleshooting; and
- a machine-readable opaque random QR token with no encoded business or personal fields.

The opaque token shall be generated from a cryptographically secure source with at least `128` bits of entropy, remain non-sequential and unpredictable, and contain no visitor identity, ticket, organization, venue, price, payment, entitlement, access history, or production quantity. The QR code contains only the token and is a lookup credential, not an authorization grant. KROWDS shall store a hash of the token and shall be able to revoke the credential immediately.

The private production CSV shall use the columns `batch_id,wristband_code,qr_payload,schema_version`, with one row per wristband. It shall contain no visitor, ticket, payment, entitlement, or access data. Generated files shall be private Cloud Storage objects, encrypted in transit and at rest, access-controlled through short-lived authorization, versioned, and deleted according to the approved retention policy.

Scanning shall resolve the hashed token to one wristband record and then evaluate lifecycle, batch activation, reservation, binding, entitlement, time, venue, and single-use state on the backend. Batch Activation Code is a separate authenticated dashboard and email mechanism, is scoped to one organization and batch, and shall not be printed as the wristband QR payload.

### Consequences

#### Positive

- Physical production data has no visitor PII.
- A copied or guessed human code does not provide a scannable credential.
- Backend lifecycle checks remain authoritative after a scan.

#### Trade-offs

- Printed credential compromise requires explicit disablement and replacement procedures.
- Opaque lookup requires secure token handling and controlled production exports.
- Human search by code does not itself prove possession of the QR credential.

### Validation

| Validation ID | Pass condition | Evidence |
| --- | --- | --- |
| `KROWDS-ADR-007-VAL-001` | Generated human codes and opaque tokens are unique within their required scope | Generation and uniqueness test |
| `KROWDS-ADR-007-VAL-002` | Production CSV and QR payload contain no prohibited business or personal fields | Schema and content inspection |
| `KROWDS-ADR-007-VAL-003` | A valid token for a non-Active wristband cannot grant access | Negative binding and gate tests |
| `KROWDS-ADR-007-VAL-004` | Printed QR quality remains machine-readable under the approved physical test procedure | Production sample test |

### Follow-up ownership

| Action | Owner | Due |
| --- | --- | --- |
| Approve export retention, rotation, and immediate revocation procedure; token encoding is confirmed as 16 random bytes encoded as unpadded base64url with no prefix | Security Architecture Owner (`TBD`) | `TBD` |
| Approve human-code format, maximum length, generation algorithm, and collision-retry behavior under `KROWDS-OD-028` | Fulfillment Operations Owner (`TBD`) | `TBD` |
| Define lost, stolen, damaged, and replacement wristband procedures | Operations Owner (`TBD`) | `TBD` |

---

## KROWDS-ADR-008 — Online-first, backend-authoritative access gate

### Metadata

| Field | Value |
| --- | --- |
| Status | `Accepted` |
| Decision date | `2026-09-24` |
| Deciders | Access Operations Owner (`TBD`), Security Architecture Owner (`TBD`), Product Owner (`TBD`) |
| Technical owner | Access Control Engineering Owner (`TBD`) |
| Related test cases | `KROWDS-TC-014`, `KROWDS-TC-015`, `KROWDS-TC-016`, `KROWDS-TC-017`, `KROWDS-TC-018` |
| Related roadmap phase | `KROWDS-PHASE-004` |

### Context

Gate staff need fast, unambiguous access decisions for wristbands, while the system must prevent duplicate use, unauthorized entitlement, stale status, and offline bypass. A browser or PWA can improve scanner usability, but it cannot independently establish current wristband status or entitlement.

### Decision drivers

- Current server-side lifecycle and entitlement evaluation
- No access grant from stale or fabricated local state
- Registered gate devices and attributable staff actions
- Clear `Access Granted` and `Access Denied` outcomes with reason codes
- Auditable attempts, including denied and failed scans
- Safe behavior during network interruption
- MVP single-use behavior with no re-entry, transfer, or multi-use entitlement

### Options considered

| Option | Advantages | Disadvantages | Outcome |
| --- | --- | --- | --- |
| Offline-authoritative gate | Continues granting access without connectivity | Stale entitlement, cloning, and replay exposure | Rejected |
| Online-only browser with no local support behavior | Simple policy | Poor recovery guidance and weak operator usability | Rejected |
| Registered online-first PWA/browser client with backend-authoritative decisions and fail-closed behavior | Current policy, clear audit, attributable device and staff action | Requires reliable connectivity and venue procedures | Selected |

### Decision

The access gate shall be online-first and use registered gate devices. Every scan must result in a current backend decision before staff receive `Access Granted`. The backend shall validate the credential, Active wristband state, binding, ticket validity, organization and venue, date, session, time window, entitlement, and unused single-use state. A valid grant and transition to Used shall occur atomically. Re-entry, transfer, multi-use, and usage-count entitlements are not part of the MVP and shall be denied.

The scanner client may render the application, camera behavior, connectivity state, and pending request, but it shall not cache entitlement, pre-authorize access, or convert a previous grant into a current grant. While the backend is unavailable, the client shall produce no access decision, show a non-authoritative service-unavailable state, and follow the venue outage procedure; it shall not display `Access Granted` based on local data.

Every attempt shall be recorded with request ID, actor, registered device, credential reference, organization, venue, server time, result, reason, and correlation ID. Concurrent requests for the same wristband shall produce one atomic consumption and a coherent result. Server time shall be authoritative for time-window decisions, and the system shall expose a synchronization warning when the scanner clock is materially different.

Gate response and connectivity baseline is p95 700 ms, a 3-second client timeout, maximum two exponential-backoff retries, and fail-closed `TEMP_UNAVAILABLE`; exact venue procedures and provider measurements remain `TBD` before the Phase 4 release gate.

### Consequences

#### Positive

- Wristband state and entitlement cannot be granted by stale local data.
- Staff receive a consistent allow or deny result with an explanation.
- Every gate attempt contributes to operational evidence and fraud investigation.

#### Trade-offs

- Venue connectivity and backend availability become operational prerequisites.
- Outages require a documented manual procedure that does not bypass policy.
- Scanner hardware and network configuration require venue readiness checks.

### Validation

| Validation ID | Pass condition | Evidence |
| --- | --- | --- |
| `KROWDS-ADR-008-VAL-001` | An unregistered device, local-only response, or fabricated client response cannot produce an access grant | Device-registration and browser security test |
| `KROWDS-ADR-008-VAL-002` | Disconnect, timeout, and stale-state conditions produce no access decision and show clear staff guidance | Network fault-injection test |
| `KROWDS-ADR-008-VAL-003` | Concurrent and repeated scans atomically consume a wristband at most once and never grant re-entry or multi-use | Concurrency test |
| `KROWDS-ADR-008-VAL-004` | Allowed, denied, malformed, unknown, and non-decision attempts create correlated audit records | Audit completeness test |

### Follow-up ownership

| Action | Owner | Due |
| --- | --- | --- |
| Approve venue continuity procedure and support escalation; p95 700 ms, 3-second timeout, two retries, and fail-closed behavior are fixed | Service Reliability Owner (`TBD`) | `TBD` |
| Define venue outage and controlled manual-access procedure | Venue Operations Owner (`TBD`) | `TBD` |
| Approve scanner device, network, and physical-test baseline | Access Operations Owner (`TBD`) | `TBD` |

---

## Open implementation decisions

These items do not overturn the accepted decisions above and remain controlled release gates in [OPEN-DECISIONS.md](../00-governance/OPEN-DECISIONS.md) until evidence and approval are recorded.

| Open decision ID | Topic | Owner | Due | Needed before |
| --- | --- | --- | --- | --- |
| `KROWDS-ADR-OPEN-001` | External GCP identifiers, quotas, CMEK, cost budgets, legal-residency evidence, and post-MVP cross-region scope; single-region, RPO 15m/RTO 4h, backups 7/14/35, and log retention 30/90/365 are fixed | Platform Engineering Owner (`TBD`) and Privacy and Legal Counsel (`TBD`) | `TBD` | `KROWDS-PHASE-001` exit |
| `KROWDS-ADR-OPEN-002` | Xendit account identifiers, customer-facing fee/tax-invoice wording, settlement details, and exceptional-refund terms; 30m/15m expiry, 7-day request, daily reconciliation, and weekly sign-off are fixed | Payments Product Owner (`TBD`) | `TBD` | `KROWDS-PHASE-002` exit |
| `KROWDS-ADR-OPEN-003` | Named identity/security roster and evidence for the accepted session, OTP, MFA, rate-limit, step-up, and dual-approval baseline; access 15m/refresh 30d/recovery 24h, OTP 15m/5/60s, and TOTP/WebAuthn are fixed | Identity Product Owner (`TBD`) | `TBD` | `KROWDS-PHASE-001` exit |
| `KROWDS-ADR-OPEN-004` | Biteship account identifiers, courier IDs, packaging, and venue service levels; approved domestic allowlist, live organization-paid quote, no customer courier/COD, and KREW reshipment are fixed | Fulfillment Product Owner (`TBD`) | `TBD` | `KROWDS-PHASE-003` exit |
| `KROWDS-ADR-OPEN-005` | Wristband export deletion, rotation, replacement, and credential implementation evidence; 16-byte unpadded base64url, no prefix, and SHA-256 at rest are fixed | Security Architecture Owner (`TBD`) | `TBD` | `KROWDS-PHASE-003` exit |
| `KROWDS-ADR-OPEN-006` | Venue continuity and support escalation; p95 700 ms, 3-second timeout/two retries, and fail-closed behavior are fixed | Service Reliability Owner (`TBD`) | `TBD` | `KROWDS-PHASE-004` exit |
| `KROWDS-ADR-OPEN-007` | Guardian consent wording and event-specific evidence; under-18 verified guardian account, relationship declaration, and explicit consent are fixed | Product Owner (`TBD`) and Privacy and Legal Counsel (`TBD`) | `TBD` | Before minor ticket-holder release |
