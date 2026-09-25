# KROWDS-PV-001 — KROWDS Product Vision

## Metadata

| Field | Value |
| --- | --- |
| Document ID | `KROWDS-PV-001` |
| Status | `Draft` |
| Version | `0.1` |
| Last updated | `2026-09-24` |
| Product owner | Product Team (`TBD`) |
| Technical owner | Engineering (`TBD`) |
| Security reviewer | Security and Privacy (`TBD`) |
| Approval owner | Product and Engineering (`TBD`) |
| Source brief | [KROWDS.md](KROWDS.md) |
| Scope | Target product and platform behavior |

## 1. Purpose

KROWDS is a B2B2C SaaS platform for event operators, attractions, playgrounds, venues, and other visit-based businesses. It connects ticketing, payments, identity, wristbands, visitor operations, fulfillment, and access control in one auditable operating system.

This document is the English canonical product vision. [KROWDS.md](KROWDS.md) remains the Bahasa Indonesia product brief and records the product narrative in more detail.

KROWDS is currently a target product definition. The repository implementation is a scaffold; this document does not claim that the complete product is already deployed.

## 2. Product outcomes

KROWDS should enable an organization to:

- sell tickets online and through a cashier;
- issue and manage e-tickets;
- collect payment through Xendit;
- manage visitor identity and ticket-holder data;
- order, produce, ship, and activate wristbands;
- bind a verified ticket holder to a wristband;
- grant or deny access using current entitlements;
- maintain a traceable audit trail for sensitive operations; and
- reduce counterfeit, duplicate, unauthorized, and manual-process risks.

The product must be safe, transparent, measurable, integrated, and auditable.

## 3. Actors and responsibilities

| Actor | Responsibility |
| --- | --- |
| User | An authenticated platform account that can browse events, purchase tickets, manage e-tickets, and manage ticket holders. |
| Identity | A verified legal identity associated with a user or ticket holder. It is not the same thing as an account. |
| Visitor / Ticket Holder | The person identified on a ticket and entitled to access an event or activity. A ticket holder may not have a platform account. |
| Organization | The tenant that owns venues, events, activities, sessions, ticket types, staff, orders, and operational data. |
| Membership | A user's relationship to an organization with one fixed role and explicit permissions. |
| KREW | Internal operations team for organization verification, wristband order verification, production, quality control, fulfillment, and operational oversight. |
| Platform Admin | Internal platform operator responsible for platform-level support and policy administration. |
| Finance | Organization role responsible for payment visibility, refunds, invoices, and reconciliation. |
| Ticketing | Organization role responsible for catalog and ticket configuration. |
| Cashier | Organization role responsible for in-person sales. |
| Redemption | Organization role responsible for e-ticket and wristband binding. |
| Gate | Organization role responsible for registered access devices and access decisions. |
| Viewer | Organization role with read-only operational access. |

Custom roles are deferred. MVP uses fixed roles with explicit permissions.

## 4. Tenancy and identity

Every tenant-owned record is scoped to an `organization_id`. PostgreSQL shared-schema tenancy with Row-Level Security (RLS) is the target model. The Go application establishes tenant context for every request and never trusts an organization identifier supplied by the browser without authorization checks.

The primary domain hierarchy is:

```text
Organization
└── Venue
    └── Event
        └── Activity (optional)
            └── Session
```

A Branch is not a separate tenant or domain object in the MVP. A venue represents the physical operating location.

A user may have multiple verified identities and may purchase tickets for multiple ticket holders. A ticket holder is immutable after successful payment for the MVP. Ticket transfer is not supported.

## 5. MVP scope

The MVP is phased and online-first.

### Phase 1 — Foundation

- Email/password registration and login.
- Google OAuth/OIDC.
- Resend OTP and account-recovery email.
- User identity profile.
- Organization registration and onboarding.
- Manual KREW organization review.
- Organization membership and fixed roles.
- Invitation links.
- Audit and request correlation.

### Phase 2 — Commerce

- Organization-owned venues, events, activities, and sessions.
- Ticket types, capacity, sales windows, and pricing.
- User ticket purchase and ticket-holder assignment.
- Xendit QRIS, Virtual Account, and e-wallet payments.
- Payment webhooks with idempotency.
- E-ticket issuance and delivery.
- Full refund before a ticket is used or bound.

### Phase 3 — Fulfillment

- Wristband stock and production order types.
- Artwork and material requirements.
- KREW order verification and revision requests.
- Private production CSV in Cloud Storage.
- Wristband identifiers and QR credentials.
- Biteship domestic shipping, labels, tracking, and delivery webhooks.
- Batch activation through an authenticated dashboard and email.

### Phase 4 — Access and operations

- E-ticket redemption and wristband binding.
- Registered gate devices.
- Online access validation.
- Single-use access decisions.
- Audited KREW break-glass flow.
- Access logs and operational reporting.
- Xendit and Biteship reconciliation.
- BigQuery audit and operational datasets.

## 6. Deferred capabilities

The following are explicitly outside the MVP:

- offline gate access;
- ticket transfer;
- re-entry;
- multi-use or usage-count entitlements;
- custom organization roles;
- automated identity or liveness providers;
- international shipping;
- cash on delivery;
- marketplace courier selection;
- multi-region deployment;
- advanced analytics;
- automated identity-document OCR.

These capabilities require a later decision and must not be implied by existing flows.

## 7. Core journeys

### 7.1 User registration and ticket purchase

```text
Registration
→ Email verification / Google authentication
→ Identity profile
→ Explore events
→ Select session and ticket type
→ Assign ticket holder
→ Xendit payment
→ E-ticket issued
→ E-ticket delivered
```

### 7.2 Organization onboarding

```text
Organization registration
→ Organization information
→ Legal documents
→ Responsible person and bank details
→ Consent and terms
→ Submitted
→ KREW review
→ Revision Required or Approved
→ Team invitation and operational access
```

### 7.3 Wristband production

```text
Stock or production order
→ Payment
→ KREW verification
→ Production preparation
→ Private CSV generation
→ Quality control
→ Biteship shipment
→ Delivery confirmation
→ Batch activation
→ Available inventory
```

### 7.4 E-ticket redemption and access

```text
E-ticket scan
→ Identity verification
→ Ticket validation
→ Available wristband selection
→ Binding
→ Entitlement activation
→ Registered gate scan
→ Access Granted or Access Denied
→ Access log
```

## 8. Ticket policy

The MVP ticket policy is single-use.

- One ticket has one ticket holder and one verified identity.
- An Identity may hold at most five active tickets for one Event; only one active ticket is allowed for the same Event, Ticket Product, and Session combination.
- “Active” means paid and not `Refunded`, `Cancelled`, `Expired`, or `Used`; pending, failed, and expired records do not consume the five-ticket limit.
- Ticket-holder data is editable before payment and immutable after payment.
- Transfer is not supported.
- Re-entry and multi-use are not supported.
- A used, expired, cancelled, refunded, or revoked ticket cannot grant access.
- Refund is a controlled full refund and is prohibited after a ticket is used or bound.

## 9. Wristband policy

Wristbands have two explicit inventory paths.

### Stock wristband

```text
Available → Reserved → Bound → Active → Used / Expired / Disabled / Revoked
A quality or safety issue may move a unit to Quarantined; it cannot be allocated or used until an authorized resolution
```

### Newly produced batch

```text
Generated
→ Production
→ Quality Control
→ Shipped
→ Delivered
→ Batch Activated
→ Available
→ Reserved
→ Bound
→ Active
→ Used / Expired / Disabled / Revoked
Quality failure may move a batch to Quarantined → Production rework or Void; an individual unit may move to Revoked
```

Cashier sales reserve an available stock wristband before payment and activate it only after payment and successful binding. Newly produced wristbands cannot be used until the batch is delivered and activated.

The production CSV is private and contains:

```csv
batch_id,wristband_code,qr_payload,schema_version
```

The QR payload is a 16-byte opaque random credential (128 bits), encoded as unpadded base64url without a prefix. Only the token is placed in the QR code. The system stores its SHA-256 hash, does not place PII in the QR code, and can revoke the credential immediately. The token may be resolved for an authorized redemption while the wristband is Available or Reserved, but it is access-valid only while the wristband is Active and its entitlement is valid.

The example values in KROWDS.md are synthetic documentation examples and must never be valid production credentials.

## 10. State model

The canonical state machines are documented in [STATE-MACHINES.md](../04-domain/STATE-MACHINES.md).

The high-level order state is:

```text
Created → Pending → Paid / Failed / Cancelled → Refunded
```

The high-level ticket state is:

```text
Issued → Reserved → Bound → Used / Expired / Cancelled / Revoked
```

The high-level shipment state is:

```text
Pending → Label Created → Picked Up → In Transit → Delivered / Failed / Cancelled / Reshipment Pending
```

Access decisions are:

```text
Access Granted
Access Denied
```

Every transition is authorized, validated, idempotent where applicable, and recorded in the audit trail.

## 11. Integrations

| Integration | Responsibility |
| --- | --- |
| Next.js | Browser and PWA rendering, navigation, client state, and browser flows only. |
| Go + Gin | Authentication, authorization, business workflows, HTTP APIs, provider orchestration, and audit decisions. |
| Cloud Run | Go API, workers, and scheduled endpoints. |
| Cloud SQL for PostgreSQL | Transactional system of record with tenant RLS. |
| Memorystore | Cache, rate limiting, short-lived locks, and idempotency coordination. |
| Cloud Tasks | Asynchronous email, provider callbacks, exports, and retries. |
| Cloud Scheduler | Expiry, reconciliation, cleanup, and recurring operational jobs. |
| Cloud Storage | Private legal documents, artwork, production CSVs, and exports. |
| Secret Manager | Provider credentials and runtime secrets. |
| Cloud Logging, Monitoring, Error Reporting | Logs, metrics, traces, alerts, and operational diagnosis. |
| BigQuery | Audit events, reconciliation data, and operational analytics. |
| Resend | OTP, account recovery, invitations, payment, e-ticket, shipping, activation, revision, and security email. |
| Xendit | QRIS, Virtual Account, e-wallet payment, webhook verification, and full refunds. |
| Biteship | Domestic labels, shipment tracking, delivery webhooks, and reshipment workflow. |

Provider webhooks are backend-only and must be authenticated, replay-resistant, idempotent, and auditable.

## 12. Security and privacy baseline

- Go owns authentication and authorization.
- The MVP OTP baseline is a 15-minute expiry, five failed attempts, and a 60-second resend cooldown; route-class rate limits are defined in the engineering baseline.
- Sessions use secure HttpOnly cookies and rotating refresh credentials, with a 15-minute idle/access baseline and immediate revocation.
- KREW, Platform Admin, Finance, and Organization Admin roles require MFA using TOTP or WebAuthn; sensitive actions use step-up authentication and defined dual approval.
- Consumer identity fields are minimized; no consumer identity-document image is required for MVP. Consumer identity verification uses manual KREW review; automated OCR and liveness providers are deferred.
- Minor ticket holders require a verified guardian relationship and consent before purchase or access.
- Organization legal documents are encrypted in Cloud Storage and manually reviewed by KREW.
- No raw card data is stored by KROWDS.
- Xendit payment data remains tokenized at the provider boundary.
- QR credentials contain no PII.
- Every sensitive action records actor, organization, request ID, timestamp, result, and reason code.
- Production PII and payment processing require legal and privacy review.
- The tiered retention baseline is defined in section 15; legal holds and statutory interpretation may require a longer period.
- Break-glass access is KREW-only, MFA-protected, time-bounded, and fully audited.

Detailed requirements are in [SECURITY.md](../05-security/SECURITY.md) and [PRIVACY.md](../05-security/PRIVACY.md).

## 13. Non-functional requirements

The following quality targets are required. Section 15 records the confirmed MVP baseline; venue-specific, provider-specific, and post-launch measurements remain `TBD` until evidence is collected.

| Area | Requirement |
| --- | --- |
| Availability | Health checks, graceful shutdown, provider retry, and operational alerts. |
| Performance | API and access-scan latency targets measured per environment. |
| Security | MFA for privileged roles, RLS, encryption, secret rotation, signed webhooks, and auditability. |
| Privacy | Data minimization, consent records, retention policy, and deletion workflow. |
| Accessibility | WCAG target and keyboard-complete critical flows. |
| Observability | Structured logs, request IDs, metrics, error reporting, and BigQuery audit events. |
| Scalability | Stateless Cloud Run services, managed PostgreSQL, and asynchronous task workers. |
| Recovery | Backup/restore procedures, replay-safe jobs, and documented rollback. |
| Compatibility | English-first UI and API contracts for the MVP. |

## 14. Product metrics

KROWDS will measure:

- onboarding approval time;
- payment success rate;
- ticket issuance success rate;
- wristband fulfillment lead time;
- shipping and delivery success;
- access-scan latency and denial rate;
- duplicate or revoked credential attempts;
- audit-event completeness;
- refund volume and reconciliation exceptions;
- email delivery and OTP failure rates.

The baseline targets are defined in section 15; provider-, venue-, and production-specific observations remain `TBD` until measured.

## 15. Resolved interview baseline

The following operational and policy decisions are now confirmed for the `0.1` Draft baseline. Provider account identifiers, infrastructure sizing, physical references, named roster members, and legal wording remain controlled release gates in [OPEN-DECISIONS.md](../00-governance/OPEN-DECISIONS.md).

| Area | Confirmed baseline |
| --- | --- |
| Legal basis and consent | Account, authentication, ticket, payment, shipping, and fulfillment use contract/service necessity; optional analytics, marketing, and optional profile processing are disabled without explicit consent; guardian consent is explicit and recorded. |
| Retention | Account/profile 24 months after closure; OTP/auth logs 30 days; support and shipping 12 months; finance/transaction 7 years; audit/security 24 months; production CSV 30 days after activation; identity-review evidence 24 months; event-level analytics 30 days; wristband/QR history 24 months; organization legal/banking records 7 years; backups 7/14/35 days; operational logs 30/90/365 days by environment. Legal review may require longer legal holds. |
| Residency and recovery | Single-region `asia-southeast2`; primary-store RPO 15 minutes; RTO 4 hours; automated backup retention 7/14/35 days for development/staging/production; quarterly restore drills; cross-region DR is post-MVP or separately approved. |
| Authentication | Access session 15 minutes; rotating refresh credential 30 days; recovery link 24 hours; OTP 15-minute expiry, five attempts, and 60-second resend cooldown; privileged MFA uses TOTP or WebAuthn. |
| Payments | IDR-only; online QRIS, Virtual Account, or approved Xendit e-wallet; cashier QRIS only; online instruction 30 minutes; cashier instruction 15 minutes; tax-inclusive display; no separate KROWDS platform fee in MVP; Xendit fees are organization pass-through operating cost; daily reconciliation and weekly Finance sign-off. |
| Refunds | Full refund request is allowed before Bound/Used and within 7 calendar days after verified payment; Finance or Organization Owner/Admin approves/submits it to Xendit; later requests enter `exceptional_review` and require a dual-approved Finance decision before provider submission. |
| Identity and guardian | Manual KREW consumer identity review; minimal fields are identity type, number, and full legal name; no consumer identity image/OCR/liveness; under-18 ticket holder requires a verified guardian account, relationship declaration, and explicit consent. |
| Organization onboarding | Legal entity, registration, representative, tax ID, address, bank verification, and authorized signatory are required; KREW review SLA is 2 business days for initial and revision decisions. |
| Ticketing | Maximum 10 tickets per order and 5 active tickets per verified Identity per Event; buyer sees their own tickets; staff see minimum necessary fields; transfer remains unsupported. |
| Fulfillment and shipping | Organization chooses from an approved domestic Biteship service allowlist; live Biteship quote is charged to the organization; reshipment requires KREW approval and preserves the original shipment. |
| Gate and operations | Registered active devices only; 3-second client timeout, maximum two exponential-backoff retries, then fail closed; no offline grant. Standard pilot baseline is 50 organizations, 100 active Events, 25,000 tickets/day, 100 devices, 200 concurrent scans, and 500 authenticated users. |
| Quality and support | 99.9% monthly availability; API p95 targets 300/500/800 ms for public/authenticated-read/standard-mutation; gate p95 700 ms; WCAG 2.2 AA; support acknowledgement 15 minutes/1 hour/1 business day for P1/P2/P3, with containment and resolution targets defined in the operations runbook. |
| Governance | Role-based sign-off is sufficient for this Draft; personal names remain `TBD`. Production budgets, quotas, and log retention of 30/90/365 days for development/staging/production are release controls. |

Remaining `TBD` items are controlled in [OPEN-DECISIONS.md](../00-governance/OPEN-DECISIONS.md). They include external account and contract references, provider webhook/configuration details, legal wording and statutory interpretation, named roster members, GCP sizing/quotas/budget/CMEK evidence, venue-specific physical parameters, pilot identity and schedule, and phase-exit/provider/physical/performance evidence. No unresolved item may be silently converted into an implementation assumption.

## 16. Related documents

- [KROWDS.md](KROWDS.md) — Bahasa Indonesia product brief.
- [GLOSSARY.md](GLOSSARY.md) — canonical terminology.
- [BRD.md](BRD.md) — business requirements.
- [PRD.md](PRD.md) — product requirements.
- [SRS.md](../02-requirements/SRS.md) — software requirements.
- [NFR.md](../02-requirements/NFR.md) — non-functional requirements.
- [DATA-MODEL.md](../04-domain/DATA-MODEL.md) — entities and relationships.
- [API-CONTRACT.md](../04-domain/API-CONTRACT.md) — HTTP and webhook contracts.
- [STATE-MACHINES.md](../04-domain/STATE-MACHINES.md) — lifecycle transitions.
- [SECURITY.md](../05-security/SECURITY.md) — security controls and threat model.
- [PRIVACY.md](../05-security/PRIVACY.md) — privacy and data governance.
- [INTEGRATIONS.md](../06-integrations/INTEGRATIONS.md) — Resend, Xendit, Biteship, and GCP integrations.
- [ARCHITECTURE.md](../03-architecture/ARCHITECTURE.md) — target architecture.
- [DESIGN.md](../03-architecture/DESIGN.md) — shared shadcn/ui design system and product surfaces.
- [DEPLOYMENT.md](../07-operations/DEPLOYMENT.md) — Cloud Run and GCP deployment.
- [RUNBOOK.md](../07-operations/RUNBOOK.md) — operational procedures.
- [OPEN-DECISIONS.md](../00-governance/OPEN-DECISIONS.md) — central unresolved-decision and release-gate register.
- [TEST-PLAN.md](../02-requirements/TEST-PLAN.md) — verification strategy.
- [RISK-REGISTER.md](../05-security/RISK-REGISTER.md) — product and technical risks.
- [ROADMAP.md](ROADMAP.md) — phased delivery plan.
