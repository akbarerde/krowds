# KROWDS-BRD-DOC-001 — KROWDS Business Requirements

## Metadata

| Field | Value |
| --- | --- |
| Business unit | KROWDS Product and Operations |
| Document ID | `KROWDS-BRD-DOC-001` |
| Owner | Product Owner (personal name TBD) |
| Reviewer | Business Sponsor (personal name TBD) |
| Version | 0.1 |
| Status | Draft |
| Created | 2026-09-24 |
| Last updated | 2026-09-24 |
| Target release | Phased MVP; relative milestones until owner and evidence gates are available |
| Canonical language | English |

This document is the canonical English business-requirements layer. `PRODUCT-VISION.md` remains the canonical English product target and `KROWDS.md` remains the Bahasa Indonesia product brief. Translations do not change requirement meaning. Requirements are not approved delivery commitments while this document is in Draft status.

## 1. Executive summary

KROWDS is a multi-tenant B2B2C SaaS platform for organizations that operate visitor-based businesses such as events, attractions, playgrounds, and other scheduled experiences. It connects identity, online and cashier sales, IDR payments, e-ticket issuance, wristband fulfillment, visitor redemption, gate access, shipping, and audit evidence in one auditable workflow.

The MVP is online-first. A visitor discovers an eligible event, buys one or more IDR-denominated tickets, pays through Xendit, and receives a single-use e-ticket by email. A visitor may be the buyer or may buy for a named ticket holder, but an issued ticket cannot later be transferred. At the venue, authorized staff redeem the ticket to a wristband and validate the active wristband at an online gate. A successful gate admission consumes the ticket; KROWDS does not support re-entry or multi-use in the MVP.

Organizations onboard through a review process, manage staff through a fixed role set, and operate venues and events under an `Organization → Venue → Event → optional Activity → Session` hierarchy. KROWDS staff oversee organization verification and wristband order fulfillment. The shared Cloud SQL PostgreSQL tenant model uses one schema, `organization_id` on tenant-owned data, and row-level security.

## 2. Business context

### 2.1 Current situation

Organizations commonly operate registration, sales, payment confirmation, ticket delivery, wristband inventory, shipping, admission, and reporting as disconnected manual or vendor-specific processes. This creates fragmented customer records, delayed payment settlement, duplicated credentials, weak separation of duties, and incomplete operational evidence.

### 2.2 Problem statement

- **Problem:** visitor-based businesses lack one consistent, tenant-isolated workflow from online purchase to single-use admission and wristband fulfillment.
- **Affected actors:** ticket buyers, named visitors or ticket holders, organizations, organization staff, and KROWDS operations staff.
- **Business impact:** slower operations, inconsistent customer service, weak fraud resistance, limited auditability, and fragmented reporting across the organization lifecycle.
- **Primary business response:** provide an online-first KROWDS MVP with provider-backed payments, traceable single-use credentials, fixed-role staff access, and integrated operational records.

## 3. Stakeholders and actors

### 3.1 Actors

| Actor | Business responsibility | Primary value |
| --- | --- | --- |
| User | Owns a KROWDS account and authenticates through an approved sign-in method | A secure, recognizable account for purchases, profile data, and ticket access |
| Identity | Represents the verified person associated with a User or named ticket holder | Prevents account and ticket ownership from being confused |
| Visitor/TicketHolder | The person admitted under a ticket; may be the User or another identified person | One ticket is linked to one identified person and one admission |
| Organization | The tenant that owns venues, events, staff, commerce, and operational data | Tenant control, accountability, and operational continuity |
| Membership | The authorized relationship between a User and an Organization with a fixed role | Least-privilege access and clear responsibility |
| KREW | KROWDS internal operations that verify organizations and fulfill wristband orders | Controlled onboarding, production oversight, quality control, and fulfillment |

### 3.2 Fixed roles

The MVP supports exactly these business role groups and does not support organization-defined custom roles:

1. Platform Admin
2. KREW
3. Organization Owner/Admin
4. Finance
5. Ticketing
6. Cashier
7. Redemption
8. Gate
9. Viewer

Role membership is individual. Each Membership has exactly one fixed role. A user may hold separate Memberships in more than one organization, and each Membership must be independently authorized. Platform Admin and KREW are internal fixed role groups; KREW capability values are internal capability labels, not additional Membership roles. The remaining roles are organization-scoped.

| Role group | Business access |
| --- | --- |
| Platform Admin | Platform governance, organization oversight, and audited exceptional support |
| KREW | Organization verification and wristband production, quality-control, and fulfillment workflows |
| Organization Owner/Admin | Organization governance, staff, hierarchy, commerce configuration, refunds, and operational oversight |
| Finance | Payment, refund, reconciliation, and financial reporting access without general staff administration |
| Ticketing | Event, product, online-sale, ticket, and order management access |
| Cashier | On-site order creation and payment-state viewing for authorized venues/events |
| Redemption | Ticket-to-wristband redemption and exception viewing |
| Gate | Online active-wristband validation from a registered gate device and access-result viewing |
| Viewer | Read-only access to explicitly authorized organization resources |

### 3.3 Role-based ownership

Requirement ownership is assigned to accountable roles, not unnamed individuals. Personal names for approvers and document owners remain TBD and must be recorded before approval.

## 4. Business objectives

| ID | Objective | Success measure | Target |
| --- | --- | --- | --- |
| KROWDS-BO-001 | Enable visitors to complete online ticket purchase and receive a usable e-ticket | Verified online purchases reaching paid, issued, and delivered states | Baseline and conversion target TBD |
| KROWDS-BO-002 | Give organizations one operational view across hierarchy, staff, sales, tickets, and admission | Approved organizations completing the minimum operational setup | Baseline and adoption target TBD |
| KROWDS-BO-003 | Prevent duplicate or unauthorized ticket use | At most one successful gate admission per ticket; unauthorized cross-tenant access blocked | 100% for both controls |
| KROWDS-BO-004 | Improve operational traceability | Material identity, onboarding, membership, order, payment, refund, redemption, shipping, batch, and access actions recorded | 100% of defined material actions |
| KROWDS-BO-005 | Reduce dependence on manual payment confirmation | Digital ticket issuance and paid wristband-order fulfillment after a verified Xendit state | 100% of digital payments; manual payment confirmation prohibited |
| KROWDS-BO-006 | Deliver KROWDS-controlled wristband fulfillment | Paid orders traceable from review through production, quality control, shipping, receipt, and batch activation | 100% of orders with complete state history; delivery-time target TBD |
| KROWDS-BO-007 | Maintain tenant confidentiality and accountability | Tenant records correctly isolated and privileged actions attributable | 100% of covered access tests pass |
| KROWDS-BO-008 | Release safely through explicit phases | Phase exit criteria met before the next phase expands | Criteria in KROWDS-BR-016 |

## 5. Scope

### 5.1 In scope for the MVP

- Go-owned authentication with Google OAuth, email and password, email OTP, and mandatory MFA for KREW, Platform Admin, Finance, and Organization Admin privileged accounts.
- User and Identity management with explicit separation between account owner, buyer, and named ticket holder; no consumer identity-document image is required in the MVP. Consumer identity verification uses the approved manual KREW review flow; automated OCR and liveness are deferred.
- Verified guardian relationship and consent for a minor ticket holder before purchase or access.
- Organization registration, legal and representative information, document submission, review, revision, approval, and rejection.
- Individual staff accounts, invitations, and the fixed role set in section 3.2.
- Tenant-owned hierarchy exactly as `Organization → Venue → Event → optional Activity → Session`; no Branch entity or Branch-based workflows.
- Online event discovery, ticket selection, named ticket-holder assignment, IDR pricing, Xendit checkout, and provider-backed payment state.
- Online payment methods QRIS, Virtual Account, and e-wallet; cashier checkout uses QRIS only.
- Full-order refunds through Xendit only; no partial refunds and no manual payment confirmation.
- Single-use e-ticket issuance, unique identifier, QR credential, account access, and Resend email delivery.
- Cashier order creation, QRIS payment, receipt delivery, and ticket issuance after verified payment.
- Stock-wristband reservation for cashier orders and the new-batch path from production order through Biteship domestic shipment, tracking, delivery webhooks, reshipment, authenticated dashboard activation, email, and Available inventory.
- One-to-one binding of Identity, Ticket, Wristband, and access entitlement.
- Online e-ticket redemption and online gate validation from registered gate devices, with a reason returned for every denied access.
- Audit records, BigQuery audit and operational datasets, failure recovery, and phased MVP release controls.

### 5.2 Explicitly out of scope for the MVP

- Ticket transfer after issuance.
- Ticket re-entry, multi-use admission, or consumable repeated access.
- Offline gate validation or offline ticket issuance.
- Partial refund, cash refund, manual bank reconciliation, or staff confirmation of a digital payment.
- Branch entities, branch hierarchy, or branch-specific operational reports.
- Organization-defined custom roles or user-configurable permissions.
- Physical ticket shipping. Biteship applies to organization-paid domestic fulfillment such as wristband orders.
- Cash on delivery for Biteship shipments.
- Foreign-currency payment, settlement, or ticket pricing.
- International shipping and marketplace courier selection.
- Automated identity or liveness providers, identity-document OCR, and consumer identity-document images.
- Multi-region deployment and advanced analytics beyond the defined MVP datasets.
- A split deployment into independently operated backend services.

### 5.3 Phased MVP

All phases form one MVP release. A later phase must not make a partially integrated earlier workflow generally available.

| Phase | Scope | Exit condition |
| --- | --- | --- |
| 1. Foundation | Email/password and Google authentication, Resend OTP/recovery, Identity, organization onboarding and KREW review, fixed-role Memberships, invitations, request correlation, and audit | An approved organization can operate authenticated staff workflows; role, session, and audit tests pass |
| 2. Commerce | Venue, Event, optional Activity, Session, ticket type, capacity, price and sales window; online order, Xendit payment, e-ticket, Resend, and controlled full refund | Paid test orders issue valid tickets and eligible full refunds; issuance, payment, and credential tests pass |
| 3. Fulfillment | Cashier sales against validated Available stock, stock/production order types, artwork and material, KREW verification, private production CSV, Biteship labels/tracking/webhooks/reshipment, dashboard activation, and Resend email | A paid order reconciles from reservation or production quantity through delivery where applicable and activation; stock and batch isolation tests pass |
| 4. Access and operations | E-ticket redemption, wristband binding, registered gate devices, online access, KREW break-glass, access logs, Xendit/Biteship reconciliation, and BigQuery datasets | End-to-end cashier/online admission succeeds with single-use enforcement and complete auditable evidence |

## 6. Business requirements

| ID | Requirement | Priority | Owner | Acceptance at business level |
| --- | --- | --- | --- | --- |
| KROWDS-BR-001 | KROWDS shall provide Go-owned authentication using Google OAuth, email/password, and email OTP; KREW, Platform Admin, Finance, and Organization Admin accounts shall require MFA before receiving privileged permissions. Other staff roles shall follow the approved role-risk policy. | Must | Security Owner (personal name TBD) | Each approved sign-in method is testable; privileged access is blocked until MFA succeeds. |
| KROWDS-BR-002 | The system shall distinguish User, Identity, buyer, and Visitor/TicketHolder. | Must | Product Owner (personal name TBD) | Every issued ticket resolves to exactly one named Identity and one admission entitlement. |
| KROWDS-BR-003 | An organization shall pass submission and review before receiving organization-scoped operational access. | Must | KROWDS Operations Owner (personal name TBD) | Only an Approved organization can be assigned operating roles and publish sellable events. |
| KROWDS-BR-004 | Organization staff access shall use individual Memberships, each with exactly one role from the fixed set in section 3.2; custom roles are excluded. | Must | Identity and Access Owner (personal name TBD) | Every staff request is attributable to a user, organization, one fixed role, and current Membership state. |
| KROWDS-BR-005 | Tenant resources shall follow `Organization → Venue → Event → optional Activity → Session`, and shall not contain a Branch entity. | Must | Product Owner (personal name TBD) | Validated hierarchy tests reject branch paths and prevent cross-organization parentage. |
| KROWDS-BR-006 | The MVP shall be online-first and shall issue a single-use e-ticket only after Xendit reports a verified paid state. | Must | Payments Owner (personal name TBD) | No unpaid or manually approved order produces a valid ticket. |
| KROWDS-BR-007 | Payments shall be IDR-only through Xendit. Online methods shall be QRIS, Virtual Account, or e-wallet; cashier shall use QRIS only. | Must | Payments Owner (personal name TBD) | Unsupported currency, channel, and method combinations are rejected before checkout. |
| KROWDS-BR-008 | A controlled full-order refund shall be initiated through Xendit only before any ticket in the order is Bound or Used; partial refund and staff confirmation of payment or refund settlement are prohibited. | Must | Finance Owner (personal name TBD) | Partial, post-binding, post-use, and manually settled refunds are unavailable; provider events determine the recorded outcome. |
| KROWDS-BR-009 | An issued ticket shall be assigned to one named Visitor/TicketHolder and shall not be transferable. | Must | Ticketing Owner (personal name TBD) | Post-purchase ticket-holder change attempts are rejected and audited. |
| KROWDS-BR-010 | One ticket shall permit at most one successful gate admission. Re-entry, multi-use, and offline gate behavior shall be unavailable in the MVP. | Must | Gate Operations Owner (personal name TBD) | A second admission attempt is denied without changing the original successful use record. |
| KROWDS-BR-011 | Cashier shall create on-site orders and use Xendit-backed QRIS; an Available stock wristband shall be reserved before payment, and ticket or reserved-wristband activation shall wait for a verified paid state. | Must | Ticketing Owner (personal name TBD) | Pending and failed cashier payments never issue a usable ticket; abandoned reservations are released under an approved expiry policy. |
| KROWDS-BR-012 | KROWDS shall manage Available stock wristbands and newly produced batches from order through KREW review, production, quality control, shipping, delivery, authenticated activation, and Available inventory. | Must | KROWDS Operations Owner (personal name TBD) | Each order, batch, and wristband exposes its current state, responsible actor, timestamps, and permitted next state. |
| KROWDS-BR-013 | Domestic wristband fulfillment shall use Biteship for labels, tracking, delivery webhooks, and reshipment; the organization shall pay shipping and no cash-on-delivery option shall exist. | Must | Fulfillment Owner (personal name TBD) | Non-domestic or cash-on-delivery options cannot be selected; shipping fees are charged to the organization. |
| KROWDS-BR-014 | Authentication, recovery, invitation, onboarding, payment, ticket, shipping, activation, revision, and security notifications shall use Resend. | Must | Communications Owner (personal name TBD) | Required transactional messages have a recorded provider result and no customer copy is stored in provider payloads beyond approved data. |
| KROWDS-BR-015 | A successful redemption shall bind one Identity, one Ticket, one Wristband, and its access entitlement. | Must | Redemption Owner (personal name TBD) | Binding is atomic, tenant-scoped, single-use, and audit logged. |
| KROWDS-BR-016 | The MVP shall progress through the four phases and exit criteria in section 5.3. | Must | Product Owner (personal name TBD) | Release evidence is recorded before broader availability. |
| KROWDS-BR-017 | Material business actions shall be digitally recorded with actor, action, time, organization, resource, and outcome. | Must | Audit Owner (personal name TBD) | All defined material-action classes in KROWDS-PRD-019 are queryable in the audit trail. |
| KROWDS-BR-018 | This document set shall use English as its canonical language and stable `KROWDS-` requirement identifiers. | Must | Documentation Owner (personal name TBD) | Cross-document references resolve and no requirement relies on its row number. |
| KROWDS-BR-019 | Tenant data shall use a shared PostgreSQL schema with `organization_id` on tenant-owned records and row-level security as defense in depth. | Must | Data and Security Owner (personal name TBD) | Automated isolation tests deny cross-tenant reads and writes while authorized paths succeed. |
| KROWDS-BR-020 | KROWDS shall distinguish online purchasing as the primary visitor journey from cashier and venue operations that complete the MVP operating model. | Must | Product Owner (personal name TBD) | Product analytics measure online as the primary channel; cashier remains a supported MVP channel. |
| KROWDS-BR-021 | The target backend shall be one Go + Gin codebase and binary deployed on Cloud Run, with Cloud SQL PostgreSQL as the transactional system of record. | Must | Technical Owner (personal name TBD) | Architecture and deployment evidence show no second backend technology or independently deployed business service. |
| KROWDS-BR-022 | Memorystore, Cloud Tasks, Cloud Scheduler, Cloud Storage, Secret Manager, Cloud Logging, Error Reporting, Monitoring, and BigQuery shall support the target operating model without replacing the Go business authority. | Must | Platform Owner (personal name TBD) | Each selected service has an approved purpose, owner, failure behavior, and operational evidence. |
| KROWDS-BR-023 | A minor ticket holder shall require a verified guardian relationship and consent before purchase or access; consumer identity-document images are not required in the MVP. | Must | Product and Legal Owners (personal names TBD) | A minor purchase or access without the required relationship and consent is rejected; image upload is absent. |
| KROWDS-BR-024 | KREW break-glass shall be MFA-protected, time-bounded, and fully audited and shall not manually set payment state, grant offline access, or bypass single-use enforcement. | Must | Data and Security Owner (personal name TBD) | Every break-glass use is attributable and bounded; prohibited money-state and access overrides are absent. |
| KROWDS-BR-025 | Consumer identity verification shall use a distinct manual KREW review workflow with queue, claim, correction, approval, rejection, expiry, and audit states. | Must | KROWDS Operations and Identity Owners (personal names TBD) | A ticket cannot be issued or bound while its required consumer identity review is pending, unapproved, rejected, or expired. |

## 7. Business process

### 7.1 Current process

```text
Identity and account -> discover event -> order -> manual/provider payment
-> ticket delivery -> inventory reconciliation -> wristband handling
-> gate decision -> fragmented reconciliation and reporting
```

### 7.2 Target process

```text
User authentication and Identity -> Organization approval
  -> Venue / Event / optional Activity / Session setup
  -> Online order with named Visitor/TicketHolder
  -> Xendit payment -> Issued e-ticket -> Resend delivery
  -> e-ticket redemption -> Available wristband reservation and binding
  -> registered gate device -> online decision -> one successful admission
  -> audit, finance, reconciliation, and operations evidence
```

Cashier orders reserve Available stock before QRIS payment. A parallel new-batch organization workflow is:

```text
Wristband production order -> Xendit organization payment -> KREW review
-> private production CSV -> production and quality control
-> Biteship domestic shipment / tracking / delivery
-> authenticated dashboard activation -> Resend email -> Available inventory
```

## 8. Business rules

| ID | Rule |
| --- | --- |
| KROWDS-BIZ-001 | Ticket-holder data may change before successful payment only through an authorized order update; it is immutable after payment, and transfer is not supported. |
| KROWDS-BIZ-002 | `1 Ticket = 1 Visitor/TicketHolder = 1 Identity = at most 1 successful admission`; an Identity may hold up to five active tickets per Event, with one active ticket per Event/Ticket Product/Session combination. |
| KROWDS-BIZ-003 | Ticket validity is bounded by its Organization, Venue, Event, optional Activity, Session, product, and validity window. |
| KROWDS-BIZ-004 | Online payment supports IDR QRIS, IDR Virtual Account, and IDR e-wallet. Cashier supports IDR QRIS only. |
| KROWDS-BIZ-005 | Digital payment and refund state is derived from authenticated, replay-resistant Xendit events and reconciliation, never a staff override. |
| KROWDS-BIZ-006 | A controlled full-order refund request is allowed before any ticket is Bound or Used and within 7 calendar days after verified payment; Finance or Organization Admin approves and submits it to Xendit. Later requests enter `exceptional_review` and require a dual-approved Finance decision before provider submission. |
| KROWDS-BIZ-007 | A stock wristband follows Available → Reserved → Bound → Active → Used/Expired/Disabled/Revoked; a new batch cannot be used before verified Biteship delivery evidence, organization receipt confirmation, and authenticated activation. |
| KROWDS-BIZ-008 | Gate access requires a registered device, an online authoritative check, and an active, unused, unexpired, and non-disabled wristband with the required entitlement. |
| KROWDS-BIZ-009 | A denied access attempt never marks a ticket or wristband as used. |
| KROWDS-BIZ-010 | Biteship is limited to approved domestic services selected by the organization from an allowlist, live organization-paid quotes, tracking, delivery, and KREW-approved reshipment; no COD, customer courier selection, or marketplace pickup is offered. |
| KROWDS-BIZ-011 | A wristband QR token has at least 128 bits of entropy, contains no PII, and is valid only while the wristband is Active and entitled; transactional records store its hash, while the controlled private production CSV is the issuance artifact containing the token. |
| KROWDS-BIZ-012 | A minor requires a verified guardian relationship and consent before purchase or access; consumer identity-document images are not part of the MVP. |

## 9. Assumptions, constraints, and dependencies

| ID | Type | Description | Impact | Owner |
| --- | --- | --- | --- | --- |
| KROWDS-A-001 | Constraint | The target uses one Go + Gin backend on Cloud Run, Cloud SQL PostgreSQL, Memorystore, Cloud Tasks, Cloud Scheduler, Cloud Storage, Secret Manager, Cloud Logging, Error Reporting, Monitoring, and BigQuery. | Google Cloud configuration or outage can affect backend, isolation, async work, files, secrets, operations, or analytics. | Technical Owner (personal name TBD) |
| KROWDS-A-002 | Constraint | Tenant isolation uses one Cloud SQL shared schema, `organization_id`, and RLS. | Every tenant-owned query and data path must establish trusted organization context. | Data and Security Owner (personal name TBD) |
| KROWDS-A-003 | Constraint | MVP tickets are single-use and gate validation is online. | Interruption can block admission unless a documented operational continuity procedure is used without creating offline credentials. | Gate Operations Owner (personal name TBD) |
| KROWDS-A-004 | Dependency | Xendit supplies authoritative payment, expiry, and full-refund outcomes. | Payment state and entitlement release depend on verified provider events. | Payments Owner (personal name TBD) |
| KROWDS-A-005 | Dependency | Resend supplies OTP, recovery, invitation, workflow, ticket, shipping, activation, revision, and security email plus delivery status. | Ticket access remains available in the account if email delivery fails. | Communications Owner (personal name TBD) |
| KROWDS-A-006 | Dependency | Biteship supplies domestic labels, tracking, delivery, and reshipment state. | Batch activation waits for the applicable delivery and authenticated organization activation, not a courier status guess. | Fulfillment Owner (personal name TBD) |
| KROWDS-A-007 | Assumption | Pilot organizations can provide legal entity, registration, representative, tax ID, address, bank verification, authorized signatory, and operational data through the approved process. KREW review SLA is 2 business days. | A missing required document or inconsistent representative/bank data blocks approval and creates a revision case. | KROWDS Operations Owner (personal name TBD) |
| KROWDS-A-008 | Open question | The single pilot organization/indoor venue, relative launch window, and organization-specific price configuration remain open. The no-platform-fee MVP policy, tax-inclusive display, and standard pilot capacity are confirmed. | Revenue and cohort planning remain open; compliance baseline is defined. | Business Sponsor (personal name TBD) |

## 10. Risks

| ID | Risk | Probability | Impact | Mitigation | Owner |
| --- | --- | --- | --- | --- | --- |
| KROWDS-R-001 | Duplicate payment notifications issue duplicate tickets. | Medium | High | Idempotent provider-event processing and order-level issuance guard. | Payments Owner (personal name TBD) |
| KROWDS-R-002 | Cross-tenant access exposes visitor or organization data. | Medium | High | `organization_id`, RLS, application authorization, and negative isolation tests. | Data and Security Owner (personal name TBD) |
| KROWDS-R-003 | Ticket-holder identity rules create false duplicate matches. | Medium | High | Use normalized identity type + number + full legal name, enforce one active ticket per Identity/Event/Ticket Product/Session and the five-ticket Event limit, and use the manual KREW correction workflow. | Identity Owner (personal name TBD) |
| KROWDS-R-004 | Provider or network outage interrupts gate access. | High | High | Online retry messaging, staffed continuity procedure, incident escalation, and no offline ticket issuance. | Gate Operations Owner (personal name TBD) |
| KROWDS-R-005 | Wristband batch is activated before secure receipt. | Medium | High | Validated Biteship lifecycle, organization receipt, activation code, and controlled transitions. | Fulfillment Owner (personal name TBD) |
| KROWDS-R-006 | Excess staff access enables internal misuse. | Medium | High | Fixed roles, individual accounts, privileged MFA for KREW, Platform Admin, Finance, and Organization Admin, least privilege, and audit review. | Identity and Access Owner (personal name TBD) |
| KROWDS-R-007 | Full-refund policy creates financial disputes. | Medium | High | Use the 7-calendar-day request window, prohibit post-Bound/Used refund, require Finance/Organization Admin approval, and reconcile Xendit daily with weekly Finance sign-off. | Finance Owner (personal name TBD) |
| KROWDS-R-008 | Phased release exposes an incomplete end-to-end journey. | Medium | High | Enforce phase exit evidence and controlled organization access. | Product Owner (personal name TBD) |

## 11. Benefits and KPIs

Numeric safety baselines are fixed; business KPI targets are established after the controlled pilot. Every KPI must have an owner, query, and evidence reference before phase 4 exit. Provider-, venue-, and evidence-dependent gates are tracked in [OPEN-DECISIONS.md](../00-governance/OPEN-DECISIONS.md).

| KPI | Definition | Baseline | MVP target | Measurement source | Review cadence |
| --- | --- | ---: | ---: | --- | --- |
| Online checkout completion | Paid online orders divided by online orders that reach payment selection | TBD | TBD | Xendit-linked order events | Weekly during pilot |
| Payment-to-ticket issuance time | Time from verified paid event to issued ticket | TBD | TBD | Order and payment event timestamps | Weekly during pilot |
| Email delivery success | Required Resend messages accepted by provider divided by required messages | TBD | TBD | Resend delivery status joined to order | Weekly during pilot |
| Onboarding completion | Approved organizations divided by submitted organizations | TBD | TBD | Onboarding workflow | Weekly during pilot |
| Onboarding cycle time | Submission to approval or rejection | TBD | TBD | Onboarding workflow | Weekly during pilot |
| Single-use enforcement | Tickets with more than one successful admission | 0 required | 0 | Ticket and access events | Daily |
| Cross-tenant isolation failures | Confirmed unauthorized tenant reads or writes | 0 required | 0 | Security tests and incident review | Each release |
| Material-action audit coverage | Recorded material actions divided by applicable material actions | TBD | 100% | Audit completeness checks | Each release |
| Wristband order cycle time | Paid order to batch activation | TBD | TBD | Wristband and shipment events | Weekly during pilot |
| Cashier payment-to-issuance time | Verified cashier QRIS payment to issued ticket | TBD | TBD | Cashier order events | Weekly during pilot |
| Gate denial accuracy | Valid test cases returning the expected result | TBD | 100% for defined test set | Gate integration and acceptance tests | Each release |

## 12. Decisions and assumptions still open

| ID | Decision | Owner | Due | Status |
| --- | --- | --- | --- | --- |
| KROWDS-D-001 | Approve commercial pricing, launch date, and pilot organization count. | Business Sponsor (personal name TBD) | TBD | Open |
| KROWDS-D-002 | Approve customer-facing refund terms, fee allocation, tax invoice wording, and exceptional cases outside the confirmed 7-day request window; the pre-Bound/pre-Used restriction and Xendit authority are fixed. | Finance and Legal Owners (personal names TBD) | `TBD` | Open |
| KROWDS-D-003 | Approve privacy notice wording, guardian consent text, legal interpretation, data-subject process, and statutory retention exceptions; the tiered retention, contract-plus-consent posture, single-region target, and no consumer identity-image baseline are fixed. | Legal and Data Owners (personal names TBD) | `TBD` | Open |
| KROWDS-D-004 | Approve the detailed normalized matching/correction implementation and legal notice for the confirmed minimal identity fields, one active ticket per Identity/Event/Ticket Product/Session, and five active tickets per Identity/Event. | Identity and Legal Owners (personal names TBD) | `TBD` | Open |
| KROWDS-D-005 | Verify the confirmed 99.9% availability, p95 performance, standard pilot capacity, 15-minute/4-hour RPO/RTO, 7/14/35-day backup, 3-second gate timeout, and P1/P2/P3 support targets with evidence; further provider/venue targets may remain TBD. | Technical Owner (personal name TBD) | `TBD` | Open |
| KROWDS-D-006 | Verify WCAG 2.2 AA and the supported Chrome, Safari, Android, and iOS browser/device matrix. | Product Owner (personal name TBD) | `TBD` | Open |

## 13. Approval

| Role | Name | Decision | Date |
| --- | --- | --- | --- |
| Business Sponsor | TBD | Approve / Reject | TBD |
| Product Owner | TBD | Approve / Reject | TBD |
| KROWDS Operations Owner | TBD | Approve / Reject | TBD |
| Finance Owner | TBD | Approve / Reject | TBD |
| Data and Security Owner | TBD | Approve / Reject | TBD |
| Legal Owner | TBD | Approve / Reject | TBD |
