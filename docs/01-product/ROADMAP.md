# KROWDS-ROAD-DOC-001 — KROWDS Four-Phase Product and Platform Roadmap

## Metadata

| Field | Value |
| --- | --- |
| Document ID | `KROWDS-ROAD-DOC-001` |
| Version | `0.1` |
| Status | `Draft` |
| Last updated | `2026-09-24` |
| Product / platform | KROWDS end-to-end ticketing, wristband, fulfillment, binding, and access platform |
| Owner | Product Owner (`TBD`) |
| Canonical product baseline | [`PRODUCT-VISION.md`](PRODUCT-VISION.md) |
| Planning horizon | Four dependency-ordered phases; relative milestones until owner, provider, legal, hardware, and evidence gates are available |
| Review cadence | At every phase entry, phase exit, accepted decision change, or Critical risk event |
| Next review date | Controlled in [OPEN-DECISIONS.md](../00-governance/OPEN-DECISIONS.md) |

## 1. Vision

KROWDS will provide one auditable operational path from verified user and organization onboarding to IDR online or cashier purchase, e-ticket issuance, controlled wristband production and delivery, identity-based binding, a single-use backend-authoritative access decision, and investigation evidence. Each phase establishes a safe reusable foundation for the next phase rather than delivering isolated demonstrations.

## 2. Planning principles

- **Authority before convenience:** The backend owns identity, authorization, organization scope, payment state, binding, access, and audit truth.
- **One safe path:** Online IDR purchase is the baseline commerce path; the cashier QRIS extension uses the same payment and issuance rules.
- **MVP ticket policy:** One ticket has one immutable paid holder, is single-use, and cannot be transferred; full refund request is allowed before use/binding and within 7 calendar days, with Finance/Organization Admin approval.
- **Phase dependency:** A later phase may not depend on an unapproved behavior from an earlier phase.
- **Security by construction:** Organization isolation, privileged MFA, protected credentials, registered gate devices, controlled production artifacts, and fail-closed gate behavior are release requirements.
- **Traceable state:** Every critical transition has an actor, time, organization, resource, result, and correlation identity.
- **Provider independence at the boundary:** Resend, Xendit, and Biteship remain replaceable through backend adapters without weakening policy.
- **Realistic physical validation:** Digital wristband output is not complete until approved samples can be produced, scanned, activated, and reconciled.
- **Indonesia-first legal gate:** Production personal-data, minor, retention, and provider flows require written Privacy and Legal Counsel approval.
- **Evidence-based exits:** Phase exit requires passing tests, controlled risks, approved owners, and measurable targets; `TBD` values must be resolved rather than silently assumed.
- **Progressive exposure:** Internal readiness, controlled pilot, venue rehearsal, and wider rollout remain separate release steps.

## 3. Outcomes and measures

| Outcome ID | Outcome | Measure | Numeric target | Accountable role | Target date |
| --- | --- | --- | --- | --- | --- |
| `KROWDS-OUT-001` | Users and organizations can register, verify, onboard, and operate with isolated team access | Verified onboarding completion, approval cycle, role-abuse findings, and tenant-isolation failures | `TBD` | Product Owner (`TBD`) | End of `KROWDS-PHASE-001` |
| `KROWDS-OUT-002` | Customers can purchase online, verify payment, and receive one valid e-ticket per ticket unit | Checkout success, reconciliation time, duplicate issuance, and unsupported payment activation | `TBD` | Payments Product Owner (`TBD`) | End of `KROWDS-PHASE-002` |
| `KROWDS-OUT-003` | KROWDS can order, produce, quality-check, ship, receive, and activate traceable wristband batches | Production accuracy, export exposure, QR scan success, shipment reconciliation, and inventory variance | `TBD` | Fulfillment Product Owner (`TBD`) | End of `KROWDS-PHASE-003` |
| `KROWDS-OUT-004` | Visitors can redeem, bind, and receive one current single-use allow or deny decision with complete evidence | Successful binding, false grants, single-use violations, audit completeness, and gate decision performance | `TBD` | Access Operations Owner (`TBD`) | End of `KROWDS-PHASE-004` |
| `KROWDS-OUT-005` | The platform can be deployed, observed, recovered, and audited on Google Cloud | Deployment success, availability, RPO, RTO, alarm coverage, and cost-control performance | `TBD` | Platform Engineering Owner (`TBD`) | Foundation and maintained through all phases |
| `KROWDS-OUT-006` | Operational teams can investigate and safely recover from identity, payment, shipment, stock, and gate exceptions | Time to detect, reconcile, and resolve; unowned exceptions; unsafe manual workarounds | `TBD` | Operations Owner (`TBD`) | Increasing through all phases |

## 4. Phase overview

| Phase | Name | Primary result | Depends on | Target start | Target exit |
| --- | --- | --- | --- | --- | --- |
| `KROWDS-PHASE-001` | Foundation / Auth / Org | Deployable platform boundary, cloud foundation, identity, organization onboarding, team access, RLS, and baseline audit | Accepted ADRs 001, 002, 004, and 006 | `TBD` | `TBD` |
| `KROWDS-PHASE-002` | Commerce / Ticketing / Xendit / E-ticket | Verified online purchase with one valid e-ticket per ticket unit | `KROWDS-PHASE-001`; accepted ADR 003 | `TBD` | `TBD` |
| `KROWDS-PHASE-003` | Wristband Production / Biteship | Controlled production, shipment, receipt, and batch activation | `KROWDS-PHASE-002`; accepted ADRs 005 and 007 | `TBD` | `TBD` |
| `KROWDS-PHASE-004` | Binding / Gate / Audit | Atomic redemption and binding, online-first gate decisions, and end-to-end investigation evidence | `KROWDS-PHASE-002` and `KROWDS-PHASE-003`; accepted ADR 008 | `TBD` | `TBD` |

## 5. Phase 1 — Foundation / Auth / Org

### 5.1 Objective

Create the trusted technical and identity foundation required by every later phase. No commerce, wristband, or gate capability is allowed to bypass the boundary, organization isolation, account state, or audit controls established here.

### 5.2 Initiatives

| Initiative ID | Initiative | Included outcomes | Priority | Owner | Dependency | Status | Target |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `KROWDS-INIT-001` | Enforce the Next.js frontend and Go + Gin backend boundary across CI and code review | `KROWDS-OUT-005` | P0 | Technology Owner (`TBD`) | `KROWDS-ADR-001` | Planned | `TBD` |
| `KROWDS-INIT-002` | Establish isolated Google Cloud projects; Cloud Run, Cloud SQL PostgreSQL, Memorystore, Cloud Tasks, Cloud Scheduler, Cloud Storage, Secret Manager, Cloud Logging, Cloud Monitoring, Cloud Error Reporting, and BigQuery | `KROWDS-OUT-005` | P0 | Platform Engineering Owner (`TBD`) | `KROWDS-ADR-002` | Planned | `TBD` |
| `KROWDS-INIT-003` | Implement registration, login, email OTP, Google OIDC, secure-cookie gateway sessions (15m access/30d refresh/24h recovery), identity profile, and privileged MFA | `KROWDS-OUT-001` | P0 | Identity Product Owner (`TBD`) | `KROWDS-INIT-002`, `KROWDS-INIT-006` | Planned | `TBD` |
| `KROWDS-INIT-004` | Integrate Resend through a dedicated KROWDS-owned transactional subdomain for verification, recovery, onboarding, invitation, and security email with abuse, bounce, complaint, and suppression controls | `KROWDS-OUT-001` | P0 | Messaging Engineering Owner (`TBD`) | `KROWDS-ADR-004`, `KROWDS-INIT-002` | Planned | `TBD` |
| `KROWDS-INIT-005` | Implement required legal/tax/bank/signatory organization documents, onboarding, manual KREW review with 2-business-day SLA, revision, approval, rejection, consent, and protected operational access | `KROWDS-OUT-001` | P0 | Organization Product Owner (`TBD`) | `KROWDS-INIT-003`, `KROWDS-INIT-006`, `KROWDS-INIT-007` | Planned | `TBD` |
| `KROWDS-INIT-006` | Implement individual team accounts, invitation links, organization membership, fixed roles, permissions, privileged MFA enforcement, revocation, and least-privilege review | `KROWDS-OUT-001` | P0 | Organization Product Owner (`TBD`) | `KROWDS-INIT-003`, `KROWDS-INIT-008` | Planned | `TBD` |
| `KROWDS-INIT-007` | Classify tenant and global data; implement forced PostgreSQL RLS, transaction context, runtime roles, and policy tests | `KROWDS-OUT-001`, `KROWDS-OUT-005` | P0 | Data Security Owner (`TBD`) | `KROWDS-INIT-002` | Planned | `TBD` |
| `KROWDS-INIT-008` | Establish structured audit, correlation IDs, architecture checks, CI quality gates, BigQuery dataset boundaries, dashboards, error reporting, and backup restoration evidence | `KROWDS-OUT-005`, `KROWDS-OUT-006` | P0 | Developer Experience Owner (`TBD`) | `KROWDS-INIT-001`, `KROWDS-INIT-002` | Planned | `TBD` |
| `KROWDS-INIT-031` | Implement the distinct manual KREW consumer identity review queue, claim, correction, approval, rejection, expiry, and audit lifecycle | `KROWDS-OUT-001` | P0 | KREW Operations Owner (`TBD`) | `KROWDS-INIT-003`, `KROWDS-INIT-007` | Planned | `TBD` |

### 5.3 Phase deliverables

- Five frontend applications retain their fixed ports and call the backend only through `@krowds/api`.
- One Go backend binary builds from one composition root with domain, application, delivery, and infrastructure boundaries enforced.
- Separate Google Cloud environments use protected secrets, least-privilege identities, managed PostgreSQL, Memorystore, Cloud Tasks, Cloud Scheduler, private object storage, restricted BigQuery, and traceable deployments.
- Email and Google OIDC produce verified individual accounts under secure-cookie, 15-minute access/30-day refresh/24-hour recovery, OTP, and approved account-linking policy.
- KREW, Finance, Organization Admin, Platform Admin, and other roles classified as privileged by the approved role-risk policy require TOTP or WebAuthn MFA; sensitive actions support approved step-up and dual approval.
- Organization legal documents remain private and encrypted; Draft, Submitted, Under Review, Revision Required, Approved, and Rejected transitions are authorized and auditable.
- Team members have individual accounts with organization-bound fixed roles; custom roles are not exposed in the MVP.
- Tenant-owned tables are forced under RLS and cross-organization negative tests pass.
- Registration, identity, consumer identity review, MFA, onboarding, approval, role, and administrative changes produce correlated audit evidence; onboarding decisions target 2 business days and identity review targets 1/2 business days.
- Backup restoration, Memorystore rebuild, deployment rollback, and critical-alert delivery have rehearsed evidence.

### 5.4 Phase exit gate

`KROWDS-PHASE-001` exits only when the Phase 1 entry and exit rules in `KROWDS-TEST-DOC-001` pass, critical identity and RLS risks have tested contingencies, required `TBD` decisions are resolved, and the Product and Technology Owners approve the phase result.

## 6. Phase 2 — Commerce / Ticketing / Xendit / E-ticket

### 6.1 Objective

Deliver the online-first purchase path from ticket selection through verified Xendit payment and e-ticket issuance. Cashier fulfillment is delivered in Phase 3 after stock inventory and reservation controls are available.

### 6.2 Initiatives

| Initiative ID | Initiative | Included outcomes | Priority | Owner | Dependency | Status | Target |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `KROWDS-INIT-009` | Implement Venue → Event → optional Activity → Session hierarchy, ticket types, capacity, sales windows, IDR pricing, and exploration | `KROWDS-OUT-002` | P0 | Commerce Product Owner (`TBD`) | `KROWDS-PHASE-001` exit | Planned | `TBD` |
| `KROWDS-INIT-010` | Implement buyer, minimal ticket-holder identity, minor guardian account/declaration/consent, one-ticket-holder policy, exact tax-inclusive IDR totals, immutable paid holder, and idempotent orders | `KROWDS-OUT-002` | P0 | Commerce Engineering Owner (`TBD`) | `KROWDS-INIT-009` | Planned | `TBD` |
| `KROWDS-INIT-011` | Integrate Xendit QRIS, Virtual Account, and approved e-wallet methods with 30-minute online/15-minute cashier expiry, callback verification, daily reconciliation, and weekly Finance sign-off | `KROWDS-OUT-002` | P0 | Payments Engineering Owner (`TBD`) | `KROWDS-ADR-003`, `KROWDS-INIT-010` | Planned | `TBD` |
| `KROWDS-INIT-012` | Issue one unique single-use e-ticket per paid ticket unit and provide dashboard, download, and approved delivery channels | `KROWDS-OUT-002` | P0 | Ticketing Product Owner (`TBD`) | `KROWDS-INIT-011`, `KROWDS-INIT-004` | Planned | `TBD` |
| `KROWDS-INIT-014` | Implement 7-day full-refund request window, Finance/Organization Admin approval, cancellation, daily reconciliation, weekly sign-off, retention, and operational investigation views | `KROWDS-OUT-002`, `KROWDS-OUT-006` | P1 | Finance Owner (`TBD`) | `KROWDS-INIT-011` | Planned | `TBD` |
| `KROWDS-INIT-015` | Load, performance, security, guardian, policy, and failure tests for checkout, callback processing, issuance, and refund | `KROWDS-OUT-002`, `KROWDS-OUT-005` | P0 | Quality Assurance Lead (`TBD`) | `KROWDS-INIT-009` through `KROWDS-INIT-012`, `KROWDS-INIT-014` | Planned | `TBD` |

### 6.3 Phase deliverables

- Customers can explore approved Venue, Event, Activity, Session, and ticket offerings and assign one identity to each ticket.
- Orders enforce server-side product, exact tax-inclusive integer IDR price, quantity, holder, one active ticket per Identity/Event/Ticket Product/Session, 10-ticket order/5-ticket Identity/Event limits, and minor guardian or consent rules.
- Ticket-holder data is editable only before successful payment, then immutable; ticket transfer is not exposed.
- Xendit credentials remain backend-only; browser return does not prove payment; KROWDS stores no raw card data.
- Online flow supports QRIS, Virtual Account, and approved e-wallet methods. Cashier flow is delivered in Phase 3 after stock inventory controls are available.
- Verified payment is the only path to e-ticket issuance.
- Duplicate, delayed, invalid, and reordered callbacks produce no duplicate business effect.
- Each paid ticket unit has one unique single-use identifier and QR credential.
- E-ticket remains available in the customer dashboard when optional email delivery fails.
- Full refund request succeeds only before a ticket is Bound or Used and within 7 calendar days after verified payment; later requests enter `exceptional_review` and require a documented dual-approved Finance decision before provider submission.
- Finance can reconcile KROWDS orders, Xendit payments, refunds, and issuance evidence daily, with weekly Finance sign-off; Xendit fees remain organization pass-through operating cost.
- Payment, catalog, guardian, ticket, RLS, audit, security, and regression tests pass the Phase 2 gate.

### 6.4 Phase exit gate

`KROWDS-PHASE-002` exits only after Xendit certification, finance reconciliation, duplicate and failure matrices, approved risk treatment, and the `KROWDS-TEST-DOC-001` Phase 2 gate are complete.

## 7. Phase 3 — Wristband Production / Biteship

### 7.1 Objective

Create a controlled physical supply chain from paid wristband order through KREW verification, secure identifier generation, production, quality control, Biteship shipment, operator receipt, and batch activation. This phase also enables the cashier QRIS flow against validated stock inventory.

### 7.2 Initiatives

| Initiative ID | Initiative | Included outcomes | Priority | Owner | Dependency | Status | Target |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `KROWDS-INIT-013` | Implement cashier QRIS order, stock-wristband reservation, payment, binding, and activation using the same purchase and issuance state model | `KROWDS-OUT-003` | P0 | Payments Product Owner (`TBD`) | `KROWDS-INIT-011`, `KROWDS-INIT-016` | Planned | `TBD` |
| `KROWDS-INIT-016` | Implement stock and production wristband order types, configuration, tax-inclusive billing, live organization-paid Biteship quotes, approved domestic service allowlist, KREW review queue, and order status | `KROWDS-OUT-003` | P0 | Fulfillment Product Owner (`TBD`) | `KROWDS-PHASE-002` exit | Planned | `TBD` |
| `KROWDS-INIT-017` | Implement KREW verification, revision, production preparation, artwork versioning, and quality-control checkpoints | `KROWDS-OUT-003` | P0 | KREW Operations Owner (`TBD`) | `KROWDS-INIT-016` | Planned | `TBD` |
| `KROWDS-INIT-018` | Generate unique human-readable codes and opaque QR tokens with at least `128` bits of entropy, store token hashes, and produce private PII-free CSV exports | `KROWDS-OUT-003` | P0 | Wristband Domain Owner (`TBD`) | `KROWDS-ADR-007`, `KROWDS-INIT-017` | Planned | `TBD` |
| `KROWDS-INIT-019` | Define printer, material, contrast, wear, scanner, sample, quality, and rejection procedures | `KROWDS-OUT-003` | P1 | Fulfillment Quality Owner (`TBD`) | `KROWDS-INIT-018` | Planned | `TBD` |
| `KROWDS-INIT-020` | Integrate Biteship for approved domestic organization-paid services, live quotes, labels, tracking, delivery events, KREW-approved reshipment, and reconciliation with COD, customer courier selection, and international shipping denied | `KROWDS-OUT-003` | P0 | Fulfillment Integration Owner (`TBD`) | `KROWDS-ADR-005`, `KROWDS-INIT-017` | Planned | `TBD` |
| `KROWDS-INIT-021` | Implement operator receipt, inventory reconciliation, Resend Batch Activation message, authenticated dashboard activation, and atomic Available transition | `KROWDS-OUT-003`, `KROWDS-OUT-006` | P0 | Fulfillment Operations Owner (`TBD`) | `KROWDS-INIT-019`, `KROWDS-INIT-020`, `KROWDS-INIT-004` | Planned | `TBD` |
| `KROWDS-INIT-022` | Test controlled exports, physical print quality, cashier stock reservation, Biteship failure recovery, stock variance, loss, damage, and replacement | `KROWDS-OUT-003` | P0 | Quality Assurance Lead (`TBD`) | `KROWDS-INIT-013`, `KROWDS-INIT-016` through `KROWDS-INIT-021` | Planned | `TBD` |

### 7.3 Phase deliverables

- Paid wristband orders preserve separate payment, verification, production, quality, shipment, delivery, and activation states.
- KREW can return incomplete artwork or order data for revision without advancing production.
- Every wristband receives a unique human-readable code and unpredictable opaque QR token with at least `128` bits of entropy; the database stores a token hash and supports immediate revocation.
- Private production CSV uses `batch_id,wristband_code,qr_payload,schema_version` and no visitor, ticket, payment, entitlement, or access data.
- Production exports use private Cloud Storage, short-lived access, audit logging, approved retention, and verified deletion.
- Approved physical samples demonstrate readable human codes and QR credentials under the test procedure.
- Biteship owns approved domestic shipment and courier events; the organization selects from the allowlist and pays the live quote; KREW approves reshipment; KROWDS remains the payment, production, and activation authority; COD, international shipping, and customer courier selection are denied.
- Missing or contradictory tracking events are detected through reconciliation and do not activate stock.
- Wristbands remain inactive through production, quality control, shipment, and receipt until authenticated, organization-scoped batch activation through the approved dashboard and email flow.
- Cashier QRIS flow reserves validated Available stock before payment for 15 minutes and activates only after verified payment and successful binding.
- Lost, stolen, damaged, quarantined, and replaced stock has an authorized state and audit path.

### 7.4 Phase exit gate

`KROWDS-PHASE-003` exits only after approved samples, controlled production evidence, Biteship reconciliation, physical scan results, activation tests, inventory recovery, RLS and audit checks, and the `KROWDS-TEST-DOC-001` Phase 3 gate are approved.

## 8. Phase 4 — Binding / Gate / Audit

### 8.1 Objective

Complete the visitor operational path with verified e-ticket redemption, atomic Identity → Ticket → Wristband binding, current entitlements, an online-first access gate, and investigation-grade audit evidence.

### 8.2 Initiatives

| Initiative ID | Initiative | Included outcomes | Priority | Owner | Dependency | Status | Target |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `KROWDS-INIT-023` | Implement e-ticket scan, ticket validity, payment evidence, holder comparison, and one-time redemption | `KROWDS-OUT-004` | P0 | Ticketing Operations Owner (`TBD`) | `KROWDS-PHASE-002` exit | Planned | `TBD` |
| `KROWDS-INIT-024` | Implement atomic Identity → Ticket → Wristband binding with Available → Reserved → Bound → Active and failure states | `KROWDS-OUT-004` | P0 | Access Control Engineering Owner (`TBD`) | `KROWDS-INIT-023`, `KROWDS-PHASE-003` exit | Planned | `TBD` |
| `KROWDS-INIT-025` | Implement single-use entitlement for event, venue, date, session, time window, expiry, cancellation, refund, and revocation; exclude transfer, re-entry, and usage counts | `KROWDS-OUT-004` | P0 | Access Control Product Owner (`TBD`) | `KROWDS-INIT-024` | Planned | `TBD` |
| `KROWDS-INIT-026` | Register active gate devices and deliver the online-first scanner flow with 3-second timeout/two retries, atomic single-use consumption, stable grant or deny outcomes, reason codes, and no-decision connectivity behavior | `KROWDS-OUT-004` | P0 | Access Operations Owner (`TBD`) | `KROWDS-ADR-008`, `KROWDS-INIT-025` | Planned | `TBD` |
| `KROWDS-INIT-027` | Correlate identity, approval, payment, ticket, production, shipment, activation, binding, gate, and administrative audit evidence in protected BigQuery datasets | `KROWDS-OUT-004`, `KROWDS-OUT-006` | P0 | Audit and Security Owner (`TBD`) | All prior initiatives | Planned | `TBD` |
| `KROWDS-INIT-028` | Build investigation, inventory, transaction, Xendit and Biteship reconciliation, KREW break-glass, and controlled correction workflows | `KROWDS-OUT-006` | P1 | Operations Product Owner (`TBD`) | `KROWDS-INIT-027` | Planned | `TBD` |
| `KROWDS-INIT-029` | Complete registered-device, network, venue, staff, standard-pilot peak-load, outage, rollback, single-use, privacy, WCAG 2.2 AA, and audit rehearsal | `KROWDS-OUT-004`, `KROWDS-OUT-005` | P0 | Quality Assurance Lead (`TBD`) | `KROWDS-INIT-023` through `KROWDS-INIT-028` | Planned | `TBD` |

### 8.3 Phase deliverables

- A ticket can be redeemed only when payment, validity, holder, and prior-redemption checks pass.
- Physical identity comparison is performed by an authorized role and its decision is recorded without unnecessary identity exposure.
- Binding is atomic and creates one relationship across Identity, Ticket, Wristband, organization context, and single-use entitlement through Available → Reserved → Bound → Active.
- Duplicate, concurrent, mismatched, expired, unavailable, and already-bound requests cannot create partial state.
- Only registered active gate devices receive a current backend `Access Granted` or `Access Denied` result with a reason code; clients use a 3-second timeout and at most two exponential-backoff retries.
- A valid grant atomically transitions the wristband to Used; transfer, re-entry, and multi-use are denied.
- The scanner never pre-authorizes from local or stale state; when the backend is unavailable it produces no access decision.
- Venue outage procedures do not create an alternate offline grant.
- KREW break-glass is MFA-protected, incident-scoped, time-bounded, two-role approved, alerted, revocable, and fully audited.
- Allowed, denied, unknown, malformed, expired, duplicate, and non-decision attempts are audited.
- BigQuery contains only approved minimized audit and operational data and cannot authorize a live transaction.
- Staff can trace a visitor journey and a wristband journey end to end without altering evidence improperly; WCAG 2.2 AA and P1/P2/P3 support response targets are rehearsed.

### 8.4 Phase exit gate

`KROWDS-PHASE-004` exits only after venue rehearsal, standard-pilot peak and failure tests, online gate validation at p95 700 ms with 3-second timeout/two retries, full regression, WCAG 2.2 AA, support readiness, RLS and audit validation, rollback rehearsal, approved Critical and High risk treatment, and the `KROWDS-TEST-DOC-001` Phase 4 gate are complete.

## 9. Cross-phase workstreams

| Workstream ID | Workstream | Starts | Continues through | Owner | Required outcome |
| --- | --- | --- | --- | --- | --- |
| `KROWDS-WORK-001` | Architecture and API contracts | `KROWDS-PHASE-001` | `KROWDS-PHASE-004` | Technology Owner (`TBD`) | One backend authority and compatible frontend contracts |
| `KROWDS-WORK-002` | Cloud Run, Cloud SQL, Memorystore, Cloud Tasks, Cloud Scheduler, Cloud Storage, Secret Manager, telemetry, and BigQuery controls | `KROWDS-PHASE-001` | `KROWDS-PHASE-004` | Platform Engineering Owner (`TBD`) | Protected least-privilege deployment, authenticated tasks and schedules, and governed data |
| `KROWDS-WORK-003` | RLS, data classification, retention, and privacy | `KROWDS-PHASE-001` | `KROWDS-PHASE-004` | Data Security Owner (`TBD`) | Tenant isolation and controlled personal data |
| `KROWDS-WORK-004` | Observability, audit, metrics, and incident evidence | `KROWDS-PHASE-001` | `KROWDS-PHASE-004` | Reliability Owner (`TBD`) | Correlated diagnosis and accountable operations |
| `KROWDS-WORK-005` | Test automation, provider sandboxes, physical samples, and release evidence | `KROWDS-PHASE-001` | `KROWDS-PHASE-004` | Quality Assurance Lead (`TBD`) | Repeatable phase and release gates |
| `KROWDS-WORK-006` | Indonesia-first privacy, guardian consent, retention, support, and legal operations | `KROWDS-PHASE-001` | `KROWDS-PHASE-004` | Privacy Owner (`TBD`) | Written data, age, provider, and retention approval before affected production use |
| `KROWDS-WORK-007` | Finance, settlement, refund, and reconciliation | `KROWDS-PHASE-002` | `KROWDS-PHASE-004` | Finance Owner (`TBD`) | Traceable monetary state and operational recovery |
| `KROWDS-WORK-008` | Fulfillment, inventory, printer, and courier operations | `KROWDS-PHASE-003` | `KROWDS-PHASE-004` | Operations Owner (`TBD`) | Accountable physical stock and delivery state |
| `KROWDS-WORK-009` | Venue hardware, network, staff training, and gate operations | `KROWDS-PHASE-003` planning | `KROWDS-PHASE-004` | Access Operations Owner (`TBD`) | Safe online gate use and outage response |

## 10. Milestones

| Milestone ID | Milestone | Phase | Exit evidence | Dependencies | Owner | Date |
| --- | --- | --- | --- | --- | --- | --- |
| `KROWDS-MS-001` | Foundation ready for internal use | `KROWDS-PHASE-001` | Boundary, cloud services, identity, MFA, private organization documents, fixed roles, RLS, audit, restore, and phase tests approved | Foundation initiatives | Technology Owner (`TBD`) | `TBD` |
| `KROWDS-MS-002` | Controlled online purchase pilot | `KROWDS-PHASE-002` | Xendit sandbox and production certification, IDR paid-order-to-single-use-e-ticket path, guardian, refund, finance reconciliation, rollback | `KROWDS-MS-001` | Payments Product Owner (`TBD`) | `TBD` |
| `KROWDS-MS-003` | Physical wristband pilot | `KROWDS-PHASE-003` | Printed samples, controlled export, quality record, Biteship shipment, receipt, activation, inventory reconciliation | `KROWDS-MS-001`; payment capability from `KROWDS-MS-002` | Fulfillment Product Owner (`TBD`) | `TBD` |
| `KROWDS-MS-004` | Binding and gate venue rehearsal | `KROWDS-PHASE-004` | Redemption, binding, registered devices, single-use online decision, outage behavior, concurrency, break-glass, BigQuery, audit, and staff rehearsal | `KROWDS-MS-002`, `KROWDS-MS-003` | Access Operations Owner (`TBD`) | `TBD` |
| `KROWDS-MS-005` | Wider operational release decision | `KROWDS-PHASE-004` | All phase gates, approved risks, operational runbooks, support readiness, capacity, and rollback evidence | `KROWDS-MS-004` | Product Owner (`TBD`) | `TBD` |

## 11. Release view

| Release ID | Scope | Audience | Rollout strategy | Success evidence | Rollback or containment |
| --- | --- | --- | --- | --- | --- |
| `KROWDS-REL-001` | Internal identity, organization, team, and administration | KROWDS and pilot organization staff | Internal environment, synthetic data, selected approved pilot data, no customer purchase | Phase 1 gate and operational feedback | Disable new organization activation; preserve verified data; revert deployment |
| `KROWDS-REL-002` | Controlled IDR online commerce and single-use e-ticket | Approved pilot customers | Provider sandbox, certified production account, limited organizations and products, monitored payments and refunds | `KROWDS-OUT-002` measures, policy controls, and finance reconciliation | Stop checkout and issuance, keep valid Pending orders controlled, reconcile before resume |
| `KROWDS-REL-003` | Wristband order, cashier stock flow, production, and shipment | Approved pilot organizations, cashiers, and KREW | Restricted production exports, physical samples, limited batch quantities, validated stock, Biteship sandbox then approved live shipments | `KROWDS-OUT-003` measures, cashier reconciliation, and inventory evidence | Freeze production and cashier activation, revoke export, quarantine stock, reconcile shipment and inventory |
| `KROWDS-REL-004` | Binding and registered single-use online gate | Venue staff and controlled test visitors | Registered-device and venue rehearsal, staff procedure, limited sessions, monitored allow and deny decisions | `KROWDS-OUT-004` measures, zero false grants, complete audit, no offline grant | Stop gate, keep wristbands unchanged where safe, execute venue outage procedure, investigate affected scans |

## 12. Dependencies and sequencing rules

| Dependency ID | Dependency | Required by | Blocking condition | Owner |
| --- | --- | --- | --- | --- |
| `KROWDS-ROADMAP-DEP-001` | Accepted frontend/backend boundary and architecture checks | All phases | Any frontend or package path owns backend behavior | Technology Owner (`TBD`) |
| `KROWDS-ROADMAP-DEP-002` | Isolated Google Cloud environments, protected identities, authenticated Cloud Run, tasks and schedules, backups, and telemetry | Production use of any phase | Required resources are unprotected, unobservable, or not restorable | Platform Engineering Owner (`TBD`) |
| `KROWDS-ROADMAP-DEP-003` | Verified user accounts, secure sessions, privileged MFA, and organization membership | Any protected user or staff journey | Account, session, or organization scope is ambiguous | Identity Product Owner (`TBD`) |
| `KROWDS-ROADMAP-DEP-004` | PostgreSQL RLS and data classification | Any tenant-owned data | Organization-owned table lacks an approved policy or test | Data Security Owner (`TBD`) |
| `KROWDS-ROADMAP-DEP-005` | Resend policy, private message data, and email observability | OTP, invitation, activation, and message-dependent journeys | Messages cannot be delivered or safely retried | Messaging Engineering Owner (`TBD`) |
| `KROWDS-ROADMAP-DEP-006` | Exact-IDR Xendit verification and reconciliation | Paid online or cashier activation | Payment can activate without trusted provider state | Payments Product Owner (`TBD`) |
| `KROWDS-ROADMAP-DEP-007` | Unique, immutable, single-use e-ticket and holder state | Redemption | Ticket can be transferred, issued twice, redeemed twice, or used twice | Ticketing Product Owner (`TBD`) |
| `KROWDS-ROADMAP-DEP-008` | Opaque QR token, hash storage, and private export controls | Production and activation | Credential control or physical sample is unapproved | Security Architecture Owner (`TBD`) |
| `KROWDS-ROADMAP-DEP-009` | Biteship domestic reconciliation and delivery state | Delivery-based activation | Shipment state is contradictory, unknown, COD, or international | Fulfillment Integration Owner (`TBD`) |
| `KROWDS-ROADMAP-DEP-010` | Available wristband inventory | Binding | Stock count, receipt, reservation, or activation is uncertain | Fulfillment Operations Owner (`TBD`) |
| `KROWDS-ROADMAP-DEP-011` | Registered online backend gate and venue procedure | Access grant | Scanner can make an offline, stale, unregistered, re-entry, or multi-use grant | Access Operations Owner (`TBD`) |
| `KROWDS-ROADMAP-DEP-012` | Critical audit, protected BigQuery datasets, break-glass, and operational investigation | Wider release | Critical transitions cannot be correlated or emergency access is uncontrolled | Audit and Security Owner (`TBD`) |
| `KROWDS-ROADMAP-DEP-013` | Indonesia-first legal approval for personal data, providers, retention, and minor guardian rules | Affected production flow | A required legal basis, notice, transfer, age, or retention decision is unresolved | Privacy and Legal Counsel (`TBD`) |

## 13. Out of scope and later triggers

| Deferred item | Reason | Trigger to revisit |
| --- | --- | --- |
| Independent deployment of business microservices | The accepted architecture is one Go modular monolith | Capacity, ownership, or isolation evidence shows the monolith cannot meet an approved requirement |
| Ticket transfer | The MVP holder becomes immutable after payment | A later accepted product, privacy, payment, and security decision defines custody and state changes |
| Re-entry and multi-use access | The MVP ticket, wristband, and entitlement are single-use | A later accepted entitlement decision defines atomic use and anti-replay behavior |
| Offline access grants | Explicitly outside the MVP and rejected by `KROWDS-ADR-008` | A later accepted security decision defines short-lived authorization, revocation, and anti-replay controls |
| Custom organization roles | MVP uses fixed roles with explicit permissions | A later accepted authorization decision defines safe role administration and migration |
| Automated identity or liveness verification | MVP uses minimized identity data and operational comparison | Privacy, legal, security, and product approval selects a provider and data flow |
| International shipping, cash on delivery, and marketplace courier selection | Biteship is limited to domestic organization-paid shipping | A later accepted fulfillment and legal decision approves the scope |
| Multi-region active-active deployment | The initial target is regional | Capacity, legal, and architecture evidence requires a separate decision |
| Additional payment providers | Xendit is the confirmed IDR payment authority | Commercial coverage, method availability, or resilience evidence requires another approved provider decision |
| Additional email providers | Resend is the confirmed transactional-email authority | Deliverability, commercial, or resilience evidence requires an approved provider decision |
| Direct multi-courier fulfillment | Biteship is the confirmed domestic shipping authority | A required courier or capability is unavailable through Biteship |
| Dynamic wristband or NFC behavior | Current scope uses printed human codes and opaque QR tokens | A physical or product decision explicitly changes credential medium or lifecycle |

## 14. Assumptions and open questions

The authoritative unresolved-decision register is [OPEN-DECISIONS.md](../00-governance/OPEN-DECISIONS.md). The rows below are the roadmap view of those gates; a decision is not closed by changing only this table.

| Question ID | Assumption or question | Owner | Needed by | Status |
| --- | --- | --- | --- | --- |
| `KROWDS-ROADMAP-Q-001` | Approve external GCP account/contract identifiers, CMEK, quota, cost budget, legal-residency evidence, and post-MVP cross-region scope; single region, RPO 15m/RTO 4h, 7/14/35-day backups, 30/90/365-day logs, and secure-cookie gateway are fixed | Platform Engineering Owner (`TBD`) and Privacy and Legal Counsel (`TBD`) | `KROWDS-PHASE-001` exit | Open |
| `KROWDS-ROADMAP-Q-002` | Approve Xendit account identifiers, webhook version, customer-facing fee/tax-invoice wording, settlement details, and exceptional-refund terms; QRIS/VA/e-wallet scope, 30m/15m expiry, 7-day request window, daily reconciliation, and weekly sign-off are fixed | Payments Product Owner (`TBD`) | `KROWDS-PHASE-002` exit | Open |
| `KROWDS-ROADMAP-Q-003` | Provide named identity/security roster and evidence for the accepted session, OTP, MFA, rate-limit, step-up, and dual-approval baseline; access 15m/refresh 30d/recovery 24h, OTP 15m/5/60s, and TOTP/WebAuthn are fixed | Identity Product Owner (`TBD`) | `KROWDS-PHASE-001` exit | Open |
| `KROWDS-ROADMAP-Q-004` | Approve the complete RLS entity inventory and explicit global-table policy; shared schema, `organization_id`, forced RLS, and the global-table allowlist are fixed | Data Security Owner (`TBD`) | `KROWDS-PHASE-001` exit | Open |
| `KROWDS-ROADMAP-Q-005` | Approve Biteship account identifiers, physical packaging/print parameters, code format tracked by `KROWDS-OD-028`, and venue-specific courier service levels; approved domestic allowlist, live organization-paid quote, no customer courier/COD, and KREW reshipment are fixed | Fulfillment Product Owner (`TBD`) | `KROWDS-PHASE-003` exit | Open |
| `KROWDS-ROADMAP-Q-006` | Approve export deletion, rotation, replacement, and credential implementation evidence; 16-byte unpadded base64url, no prefix, and SHA-256 at rest are fixed | Security Architecture Owner (`TBD`) | `KROWDS-PHASE-003` exit | Open |
| `KROWDS-ROADMAP-Q-007` | Approve printer, material, wristband format, scanner, registered gate device, venue network, and physical test parameters; 3-second gate timeout/two retries, fail-closed behavior, and sample acceptance baseline are fixed | Fulfillment Quality Owner (`TBD`) and Access Operations Owner (`TBD`) | Before physical or venue rehearsal | Open |
| `KROWDS-ROADMAP-Q-008` | Approve venue-specific continuity and support escalation contacts; p95 700 ms, 3-second timeout/two retries, 99.9% availability, standard-pilot capacity, and incident targets are fixed | Access Operations Owner (`TBD`) | `KROWDS-PHASE-004` exit | Open |
| `KROWDS-ROADMAP-Q-009` | Select the single pilot organization/indoor venue, relative launch window, and organization-specific price configuration; standard-pilot capacity of 50 organizations/100 active events/25,000 tickets/day is fixed | Product Owner (`TBD`) | Before each phase entry | Open |
| `KROWDS-ROADMAP-Q-010` | Approve legal wording, statutory interpretation, provider transfer terms, rights workflow, and legal-hold exceptions; tiered retention and contract-plus-consent posture are fixed | Privacy and Legal Counsel (`TBD`) | Before production personal data | Open |
| `KROWDS-ROADMAP-Q-011` | Approve guardian consent text and event-specific evidence; under-18 verified guardian account, relationship declaration, and explicit consent are fixed | Product Owner (`TBD`) and Privacy and Legal Counsel (`TBD`) | Before minor ticket-holder release | Open |
| `KROWDS-ROADMAP-Q-012` | Name the break-glass roster, alternates, notification destinations, and exception approvers; role ownership and MFA/time-bound/audit controls are fixed | Security Engineering (`TBD`) and Platform Engineering Owner (`TBD`) | Before production operational access | Open |

## 15. Governance and sign-off

| Review role | Name | Decision | Date |
| --- | --- | --- | --- |
| Product Owner | `TBD` | Pending | `TBD` |
| Technology Owner | `TBD` | Pending | `TBD` |
| Security Architecture Owner | `TBD` | Pending | `TBD` |
| Platform Engineering Owner | `TBD` | Pending | `TBD` |
| Operations Owner | `TBD` | Pending | `TBD` |
| Quality Assurance Lead | `TBD` | Pending | `TBD` |
