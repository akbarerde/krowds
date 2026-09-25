# KROWDS-PRD-DOC-001 — KROWDS Product Requirements

## Metadata

| Field | Value |
| --- | --- |
| Product / module | KROWDS MVP |
| Document ID | `KROWDS-PRD-DOC-001` |
| Product owner | Product Owner (personal name TBD) |
| Operations owner | KROWDS Operations Owner (personal name TBD) |
| Stakeholders | Business, Product, Operations, Finance, Ticketing, Security, Legal, Support, and Engineering Owners; personal names TBD |
| Version | 0.1 |
| Status | Draft |
| Target release | Phased MVP; relative milestones until owner and evidence gates are available |
| Last updated | 2026-09-24 |
| Canonical language | English |

This document is the canonical English product-requirements layer. `PRODUCT-VISION.md` remains the canonical English product target and `KROWDS.md` remains the Bahasa Indonesia product brief. Product behavior and acceptance evidence use the `KROWDS-PRD-` identifiers below. Draft requirements are not approved until the approval table is completed.

## 1. Product overview

### 1.1 Problem

Visitors and visit-based organizations need a dependable path from event discovery to payment, ticket delivery, wristband fulfillment, redemption, and admission. Disconnected tools make payment state ambiguous, ticket ownership unclear, staff access inconsistent, and operational activity difficult to audit.

### 1.2 Product vision

KROWDS provides an online-first, tenant-isolated operating platform in which a named visitor receives a verified single-use ticket, may exchange it for an authorized wristband, and receives one online gate admission. Organizations retain controlled access to commerce, staff, hierarchy, fulfillment, finance, and reporting. KROWDS retains controlled oversight of verification and physical fulfillment.

### 1.3 Product goals

- **KROWDS-PG-001:** Make purchase-to-ticket delivery reliable and self-service online.
- **KROWDS-PG-002:** Make on-site redemption and gate decisions fast, online, and auditable.
- **KROWDS-PG-003:** Make each ticket's holder, payment, entitlement, and single use unambiguous.
- **KROWDS-PG-004:** Give organizations least-privilege role-based operations without custom-role complexity.
- **KROWDS-PG-005:** Give KROWDS a controlled process for organization verification and wristband fulfillment.
- **KROWDS-PG-006:** Make finance, shipping, support, and incident evidence available from shared records.

### 1.4 Product principles

1. **Online first:** online discovery, ordering, payment, and ticket access are the primary visitor journey.
2. **Provider-authoritative money movement:** Xendit determines payment and refund state; staff do not manually confirm digital payment.
3. **Named and accountable:** every issued ticket, staff action, and fulfillment step has an identified accountable actor.
4. **Single use by design:** one ticket permits at most one successful admission; re-entry and multi-use are absent from the MVP.
5. **Tenant isolation by default:** organization context is required for tenant data, backed by authorization and Cloud SQL PostgreSQL RLS.
6. **Least privilege:** individual Memberships use the fixed role set; there are no custom roles in the MVP.
7. **Least data in credentials:** QR codes reference opaque records and do not expose identity, price, or personal data.
8. **Audit as a workflow output:** material actions create durable evidence rather than relying on later reconstruction.

## 2. Actors and access model

### 2.1 Actors

| Actor | Product role | Needs |
| --- | --- | --- |
| User | Authenticated account owner | Sign in securely, manage personal data, discover events, purchase, and access tickets |
| Identity | Verified person associated with a User or named ticket holder | Accurate identity association and controlled duplicate handling |
| Visitor/TicketHolder | Person entitled to admission | Know which ticket belongs to them and present it for redemption and admission |
| Organization | Tenant and owner of operational configuration and data | Onboard, configure hierarchy, sell tickets, manage staff, and monitor operations |
| Membership | User-to-Organization authorization relationship | Scoped access that reflects the assigned fixed role |
| KREW | Internal fulfillment and verification actor | Review organization submissions and process wristband orders with recorded state changes |

### 2.2 Fixed roles

| Role | Primary product access |
| --- | --- |
| Platform Admin | Cross-tenant platform governance, support, and exceptional administration; all use is privileged and audited |
| KREW | Organization review and wristband order fulfillment; access is scoped to required operational actions and audited |
| Organization Owner/Admin | Organization settings, hierarchy, Memberships, commerce, refunds, and operational oversight |
| Finance | Orders, Xendit payment/refund state, reconciliation, and finance reporting |
| Ticketing | Events, products, online sales, orders, tickets, and ticket operations |
| Cashier | Authorized on-site orders and QRIS payment state |
| Redemption | Authorized ticket-to-wristband redemption and exception viewing |
| Gate | Authorized online access validation and result viewing |
| Viewer | Read-only access to resources included in its Membership |

A User may have more than one Membership, but each Membership has exactly one fixed role and the active organization must be explicit. Platform Admin and KREW are not organization roles. Custom roles and arbitrary permission editing are not available in the MVP.

### 2.3 Fixed-role permission matrix

The matrix is a product-level summary. The Go backend and PostgreSQL RLS are authoritative; the frontend may hide controls but cannot grant access. `—` means the role has no business permission in the MVP.

| Capability | Platform Admin | KREW | Organization Owner/Admin | Finance | Ticketing | Cashier | Redemption | Gate | Viewer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Platform governance and audited support | Limited | — | — | — | — | — | — | — | — |
| Organization approval/review | Read-only oversight | Manage | — | — | — | — | — | — | — |
| Team and Membership administration | — | — | Manage | Read-only | — | — | — | — | Read-only |
| Venue, Event, Activity, Session | Read-only oversight | Read-only | Manage | Read-only | Manage | Read-only | Read-only | Read-only | Read-only |
| Ticket products and online sales | Read-only oversight | — | Manage | Read-only | Manage | — | Read-only | — | Read-only |
| Cashier orders and QRIS payment state | Read-only oversight | — | Manage | Read-only | Read-only | Manage | — | — | Read-only |
| Xendit refunds and reconciliation | Read-only oversight | — | Manage | Manage | — | — | — | — | Read-only |
| Wristband stock and production orders | Read-only oversight | Manage fulfillment | Manage | Read-only | Manage creation | Reserve stock | Read-only | Read-only | Read-only |
| Redemption and wristband binding | Read-only oversight | — | Manage | — | Read-only | — | Manage | Read-only | Read-only |
| Registered gate devices and access scans | Read-only oversight | Read-only | Manage lifecycle / operate | — | — | Read-only | — | Operate/read | Read-only |
| Audit and operational exports | Limited, audited | Manage scoped | Manage organization | Manage finance | Read-only | Read-only | Read-only | Read-only | Read-only |

Platform Admin and KREW cross-organization actions are purpose-limited, time-bounded where applicable, and fully audited. Gate operators may operate and read registered devices, but only Organization Owner/Admin may register, activate, suspend, disable, or revoke them. KREW break-glass is a separate audited emergency policy and does not silently grant device lifecycle permission. KREW break-glass cannot set payment state, grant access, or bypass single-use enforcement.

## 3. Product scope

### 3.1 In scope

- User authentication through Go-owned sessions using Google OAuth, email/password, Resend email OTP and account recovery, with mandatory TOTP or WebAuthn MFA for KREW, Platform Admin, Finance, and Organization Admin privileged accounts.
- Identity and account profile management without consumer identity-document images, including verified guardian relationship and consent for minor ticket holders.
- Organization onboarding, private supporting-document submission, KREW review, revision, approval, and rejection.
- Fixed-role Membership invitations, acceptance, suspension, revocation, and removal, with one fixed role per Membership.
- Organization-owned `Venue → Event → optional Activity → Session` hierarchy beneath Organization.
- Online discovery and checkout in IDR.
- Xendit online QRIS, Virtual Account, and e-wallet payment methods.
- Xendit QRIS-only cashier checkout with stock-wristband reservation before payment.
- Controlled full-order refunds through Xendit before any ticket is Bound or Used.
- Single-use e-ticket issuance, account access, QR display, and Resend email delivery.
- Cashier orders and receipts.
- Available stock wristbands and KREW-managed production orders, private production CSV, artwork and material, quality control, Biteship labels/tracking/webhooks/reshipment, authenticated dashboard activation, Resend activation email, and Available batches.
- E-ticket redemption, ticket-to-wristband binding, registered gate devices, and online access validation.
- Tenant search and reporting scoped by organization and authorization.
- Audit history, operational status views, reconciliation, and BigQuery audit/operational datasets.

### 3.2 Out of scope

- Transfer of an issued ticket.
- Re-entry, multi-use admission, and offline gate validation.
- Partial refunds and staff-entered payment or refund outcomes.
- Ticket transfer via account reassignment.
- Branch hierarchy or branch operations.
- Organization-defined custom roles.
- International shipping, marketplace courier selection, cash on delivery, and buyer-paid wristband shipping.
- Physical ticket fulfillment.
- Currency conversion and non-IDR pricing.
- Automated identity or liveness providers, identity-document OCR, and consumer identity-document images.
- Multi-region deployment and advanced analytics beyond the defined MVP datasets.
- A general marketplace for sellers outside approved KROWDS organizations.
- Independently deployed business services.

### 3.3 MVP phases

| Phase | Product increment | Availability rule |
| --- | --- | --- |
| 1. Foundation | Email/password and Google authentication, Resend OTP/recovery, Identity, organization onboarding and KREW review, fixed-role Memberships, invitations, correlation, and audit | Internal and approved pilot organizations only |
| 2. Commerce | Venue, Event, optional Activity, Session, ticket type, capacity, sales window, price, online order, Xendit, e-ticket, Resend, and controlled full refund | Approved pilot organizations may open online sales per event |
| 3. Fulfillment | Cashier sales against validated Available stock, stock and production orders, artwork/material, KREW verification, private CSV, Biteship label/tracking/webhook/reshipment, dashboard activation, and Resend email | Cashier stock reservation and organization fulfillment activate only after stock, review, and payment requirements pass |
| 4. Access and operations | Redemption, binding, registered gate devices, online single-use access, KREW break-glass, access logs, Xendit/Biteship reconciliation, and BigQuery datasets | Event-level gate activation only after end-to-end operational readiness is recorded |

## 4. Information architecture and surfaces

| Surface | Primary users | MVP responsibility |
| --- | --- | --- |
| Public and authentication experience | User, prospective User, Identity | Event discovery entry, Google/email sign-in, registration, Resend OTP/recovery, guardian consent, and account consent |
| User account | User | Profile, purchases, eligible full-refund requests, ticket wallet, QR display, and delivery status |
| Organization workspace | Organization staff | Onboarding, hierarchy, staff, products, online sales, cashier, stock/production wristbands, visitors, refunds, reports, and audit |
| KREW workspace | KREW | Organization review, wristband order review, production handoff, quality control, fulfillment, and audited break-glass |
| Gate PWA | Gate, Redemption, Cashier | Registered-device workflows, online ticket/wristband scanning, payment state, and concise operational results |
| Platform administration | Platform Admin | Approved cross-tenant support and governance with privileged audit evidence |

The detailed design, component usage, responsive behavior, and visual language are governed by the product documentation set and shared design system. This PRD defines product behavior, not component construction.

## 5. Core user journeys

### 5.1 Account and Identity journey

1. A person selects Google OAuth, email/password, or email OTP; Resend delivers OTP, recovery, invitation, and security messages.
2. The Go-owned authentication service establishes the User session and applies MFA for KREW, Platform Admin, Finance, and Organization Admin privileged access, or when the approved role-risk policy requires it for another staff role.
3. The User reviews and corrects profile data, including the Identity needed for ticketing; no identity-document image is requested in the MVP.
4. The system validates required data, routes consumer identity verification through the approved manual KREW review flow, and requires a verified guardian relationship and consent when the ticket holder is a minor. Automated OCR and liveness are not part of the MVP.
5. The User can browse eligible online events; a User with an unapproved organization account cannot gain organization operational access.

### 5.2 Organization onboarding and team journey

1. An Organization Owner/Admin registers organization details and accepts the applicable agreements.
2. The organization submits legal, representative, financial, and supporting data.
3. KREW reviews the submission and either approves it or requests revision with reasons.
4. Once Approved, the owner invites individual Users and assigns exactly one fixed role to each Membership.
5. The organization creates a Venue, Event, optional Activity, and Session, then configures a ticket product for online sale.

### 5.3 Online purchase journey

1. A User selects an eligible Event, optional Activity, Session, and ticket product.
2. The User selects quantity and provides a name, identity type, and identity number for each Visitor/TicketHolder; for a minor, the User also provides the verified guardian relationship and consent.
3. KROWDS validates the order and calculates an IDR total without exposing settlement-account secrets.
4. The User selects QRIS, Virtual Account, or e-wallet through Xendit.
5. KROWDS records only verified provider state; it does not accept a staff-entered paid state.
6. On verified payment, KROWDS issues unique single-use e-tickets and makes them available in the User account.
7. Resend sends the approved delivery message, and the User can also retrieve every ticket directly in the account.

### 5.4 Cashier purchase journey

1. An authorized Cashier selects an event product and quantity.
2. The cashier enters a unique named Visitor/TicketHolder for each ticket and KROWDS reserves one Available stock wristband per ticket before payment.
3. KROWDS creates a pending cashier order and a QRIS payment request through Xendit.
4. The cashier waits for the verified paid state; there is no manual confirmation control.
5. KROWDS issues the tickets, retains the reservation for binding, and makes a receipt available after payment verification; an expired or failed order releases its reservation under the approved policy.

### 5.5 Full-refund journey

1. An authorized User or organization staff member submits a full-order refund request according to policy, before Bound/Used and within 7 calendar days after verified payment.
2. KROWDS verifies that no ticket in the order is Bound or Used, rejects partial amounts, and releases any reservation atomically; requests after 7 days enter `exceptional_review` for a documented dual-approved Finance decision.
3. Finance or Organization Owner/Admin approves the request and submits the full refund to Xendit; KROWDS records the authenticated, replay-resistant provider request and result.
4. Affected tickets are invalidated according to the provider-confirmed refund outcome.
5. The User and authorized staff see the current refund state without a staff settlement override.

Refund request window is 7 calendar days; Xendit fees are organization pass-through operating cost, no separate KROWDS platform fee is charged in MVP, and reconciliation is daily with weekly Finance sign-off. Customer-facing fee, tax-invoice, and exceptional-case wording remain subject to Finance/Legal approval.

### 5.6 Wristband fulfillment journey

1. Organization Owner/Admin or Ticketing creates either an Available-stock allocation or a newly produced wristband order for an approved event and selects production attributes.
2. Xendit records the organization's IDR payment; fulfillment cannot start before verified payment.
3. KREW reviews the order, requests revision if needed, generates the private production CSV, and coordinates identifier creation, production, and quality control.
4. Biteship provides domestic, organization-paid labels, tracking, delivery webhooks, and reshipment; cash on delivery is unavailable.
5. Biteship delivery evidence and organization receipt confirmation are both recorded; only then can the organization activate the batch through the authenticated dashboard with its activation credential.
6. KROWDS marks the batch Available, sends the activation email through Resend, and makes individual wristbands eligible for reservation and binding.

### 5.7 Redemption and gate journey

1. A Visitor/TicketHolder presents the e-ticket and the matching physical identity.
2. An authorized Redemption operator scans the ticket credential and confirms the displayed ticket-holder match.
3. KROWDS reserves one Available stock wristband, binds one Identity, Ticket, Wristband, and entitlement atomically, and activates the wristband.
4. An authorized Gate operator on a registered device scans the active wristband credential.
5. KROWDS checks online wristband and ticket state, validity window, event hierarchy, entitlement, and prior use.
6. A valid first admission returns `Access Granted` and atomically records use; every invalid case returns `Access Denied` with a safe reason.

### 5.8 Access denial and recovery

| Condition | Product response | Recovery |
| --- | --- | --- |
| Payment is pending, expired, or failed | Keep tickets unissued; show the current provider-backed state | User selects a supported method again or completes the valid Xendit payment |
| Email is not delivered | Keep the ticket available in the User account and show delivery failure without exposing secrets | User retries from the account; Communications support investigates the provider event |
| Ticket holder does not match | Do not bind; show the expected comparison fields allowed for the operator | Authorized staff follow the approved correction process; transfer remains unavailable |
| Minor guardian relationship or consent is missing | Reject purchase, redemption, or access and show the missing requirement | Complete the verified guardian account, relationship declaration, and explicit consent flow; event-specific evidence and legal wording remain review items |
| Wristband is not Available | Deny binding and show its batch state | Activate the valid delivered batch or choose another available wristband |
| Reserved wristband is not the order's reservation | Deny binding and preserve the original reservation | Select the correct Available wristband or release under the approved reservation policy |
| Wristband is already bound or used | Deny and preserve the original binding/use evidence | Escalate under the operational exception process; no automatic rebinding |
| Gate device is not registered or active | Deny access and audit the attempt | Register or recover the device through the approved Gate workflow |
| Online gate service is unavailable | Do not issue an offline credential or silently grant access | Retry up to two times with exponential backoff within a 3-second client timeout, then show `TEMP_UNAVAILABLE` and follow the approved continuity procedure |
| Cross-organization access is attempted | Deny and audit the attempt | Correct the selected organization or request authorized support |

## 6. Functional requirements

| ID | Requirement | Priority | Actor / role | Acceptance criteria |
| --- | --- | --- | --- | --- |
| KROWDS-PRD-001 | The product shall use Go-owned authentication and support Google OAuth, email/password, and Resend email OTP and account recovery. | Must | User; staff roles | Given a valid approved sign-in or recovery flow, when it completes, then a secure User session is established; invalid, expired, or replayed challenges do not. |
| KROWDS-PRD-002 | Accounts with Platform Admin, KREW, Finance, or Organization Admin roles shall require MFA before receiving privileged permissions. Other staff roles shall follow the approved role-risk policy. | Must | Privileged roles | Given a privileged account without completed MFA, when access is requested, then privileged functionality remains unavailable until MFA succeeds. |
| KROWDS-PRD-003 | The product shall keep User, Identity, buyer, and Visitor/TicketHolder concepts distinct, use identity type + number + full legal name as the minimal consumer fields, enforce one active ticket per Identity/Event/Ticket Product/Session combination, and allow up to five active tickets per Identity/Event. | Must | User; Identity; Ticketing | Given an order for another person, when payment succeeds, then each issued ticket identifies that named holder without changing the buyer's account ownership; duplicate active combination and five-ticket limit are enforced. |
| KROWDS-PRD-004 | Organizations shall progress through Draft, Submitted, Under Review, Revision Required, and Approved or Rejected onboarding states; required documents are legal entity, registration, representative, tax ID, address, bank verification, and authorized signatory, with a 2-business-day KREW review SLA. | Must | Organization Owner/Admin; KREW | Given incomplete submission, when submitted, then the state is blocked with actionable validation; review decisions and revision reasons are visible and audited. |
| KROWDS-PRD-005 | Only Approved organizations shall receive organization operational access or publish sellable events. | Must | Organization; KREW | Given Draft, Revision Required, or Rejected status, when operational access is requested, then it is denied and the blocking state is shown. |
| KROWDS-PRD-006 | Staff shall be invited individually and assigned exactly one fixed role per Membership. | Must | Organization Owner/Admin | Given an invite, when the recipient accepts, then access matches the one assigned role, organization, and current Membership state; custom or multiple roles on one Membership cannot be created. |
| KROWDS-PRD-007 | The product shall implement `Organization → Venue → Event → optional Activity → Session` and shall provide no Branch entity. | Must | Organization; Ticketing | Given valid hierarchy data, when an event is opened, then its ancestry is unambiguous; a Branch reference is invalid. |
| KROWDS-PRD-008 | Users shall discover and inspect online-sale-eligible events, Sessions, and ticket products. | Must | User | Given an unpublished, unpaid-policy, or invalid event, when listed, then it is excluded; an eligible event shows current price, availability, and sale window. |
| KROWDS-PRD-009 | Online orders shall be denominated only in IDR and support Xendit QRIS, Virtual Account, or e-wallet. | Must | User; Ticketing | Given checkout, when an unsupported currency or method is requested, then it is rejected; supported methods proceed through Xendit. |
| KROWDS-PRD-010 | Digital payment state shall be derived only from authenticated, replay-resistant, idempotent Xendit processing and shall not be manually confirmed. | Must | User; Cashier; Finance | Given duplicate, delayed, or contradictory provider messages, when reconciled, then one authoritative order outcome is stored; no staff paid-state control exists. |
| KROWDS-PRD-011 | A verified paid order shall issue one unique, tenant-scoped, single-use e-ticket per named ticket and holder. | Must | User; Ticketing | Given verified payment, when issuance runs, then the exact quantity is issued once, each QR maps to one ticket, and the ticket account view is available. |
| KROWDS-PRD-012 | Ticket-holder data shall be editable only before successful payment; an issued ticket shall not be transferable. | Must | User; Ticketing | Given a successfully paid ticket, when any actor requests a ticket-holder change or transfer, then the request is denied and audited; the original holder remains bound. |
| KROWDS-PRD-013 | A ticket shall allow at most one successful gate admission from a registered device; re-entry, multi-use, and offline gate controls shall be absent. | Must | Gate | Given a valid unused ticket and active wristband, when first admitted, then both are used atomically; subsequent admission attempts are denied. |
| KROWDS-PRD-014 | A controlled full-order refund request shall be submitted through Xendit before any ticket is Bound or Used and within 7 calendar days after verified payment, without partial amount or manual settlement controls. A late request enters `exceptional_review` and requires a dual-approved Finance decision before provider submission. | Must | User; Finance; Organization Owner/Admin | Given an eligible order with no Bound or Used ticket, when a full refund is requested, then an in-window request follows approval and submission; a late request is reviewable but cannot call the provider without approval; a partial, Bound, or Used request is rejected. |
| KROWDS-PRD-015 | Cashier shall reserve one Available stock wristband per ticket, use Xendit QRIS only, and issue tickets only after verified payment. | Must | Cashier | Given a pending or failed QRIS order, when completion is attempted, then no usable ticket is issued and reservation release follows policy; after Paid, a receipt is available. |
| KROWDS-PRD-016 | Organization staff shall create and track Available-stock allocations and newly produced wristband orders for approved events, including artwork, material, quantity, and organization billing. | Must | Organization Owner/Admin; Ticketing | Given an eligible order, when Xendit confirms payment, then KREW can review it; unpaid orders cannot enter fulfillment. |
| KROWDS-PRD-017 | KREW shall manage wristband verification, revision, private CSV generation, production, quality control, dashboard activation, and fulfillment with recorded reasons and responsibility. | Must | KREW | Given an actionable order, when each state is entered, then only a permitted transition occurs, private production data remains protected, and actor, time, and evidence are retained. |
| KROWDS-PRD-018 | Wristband shipment shall use an organization-selected service from an approved domestic Biteship allowlist, a live organization-paid quote, tracking, delivery webhooks, and KREW-approved reshipment; COD, customer courier selection, and marketplace pickup are excluded. | Must | Organization Owner/Admin; KREW | Given shipment selection, when options are loaded, then only permitted domestic organization-paid services are available, the quote is charged to the organization, and COD is absent. |
| KROWDS-PRD-019 | The product shall show a redacted audit history for all defined material actions. | Must | Platform Admin; KREW; Organization Owner/Admin; Finance; authorized Viewer | Given a material action, when a permitted user searches it, then actor, action, time, organization, resource, and outcome are shown with sensitive values redacted. |
| KROWDS-PRD-020 | Tenant-owned data shall use one Cloud SQL PostgreSQL shared schema and shall be isolated by authorized organization context, `organization_id`, and RLS. | Must | All roles | Given an unauthorized organization context, when data is queried or changed, then the database and application deny the operation and the security evidence is retained. |
| KROWDS-PRD-021 | MVP availability shall advance through the phases in section 3.3 and remain restricted until each phase's exit evidence is accepted. | Must | Product Owner; Business Sponsor | Given missing exit evidence, when a phase expands, then expansion is blocked; release and rollback decisions are recorded by role. |
| KROWDS-PRD-022 | Resend shall use a dedicated KROWDS-owned transactional subdomain and deliver OTP, recovery, invitation, onboarding, payment, e-ticket, shipping, activation, revision, and security messages, while the account shall remain the authoritative ticket-access fallback. | Must | User; organization staff | Given provider rejection or delay, when the User opens the account, then issued tickets remain accessible and every required message purpose has a recorded delivery result. |
| KROWDS-PRD-023 | Wristband QR credentials shall contain only an opaque token of at least 128 bits of entropy and no PII; transactional records shall store only its hash, the controlled private production CSV is the issuance artifact, and the token shall be valid only while the wristband is Active and entitled. | Must | Ticketing; Redemption; Gate | Given a credential is decoded, when inspected, then it contains no defined personal or financial field; only the hash is stored transactionally and Used, Expired, Disabled, or otherwise invalid credentials fail the next online decision. |
| KROWDS-PRD-024 | Viewer and operational roles shall see only fields and actions allowed for their fixed role and active Membership. | Must | All organization roles | Given a role matrix test, when restricted navigation or action is attempted, then it is hidden or denied consistently and no protected data is returned. |
| KROWDS-PRD-025 | A ticket holder under 18 shall require a verified guardian account, relationship declaration, and explicit consent before purchase, redemption, or access; consumer identity-document images shall not be requested. | Must | User; Ticketing; organization staff | Given a minor without a verified guardian account, declaration, and consent, when any gated step is attempted, then it is rejected; no image-upload requirement is presented. |
| KROWDS-PRD-026 | Gate access shall originate from an organization-registered, active device operated by an authorized Gate user. | Must | Gate | Given an unregistered, disabled, or wrong-organization device, when a scan is submitted, then access is denied and the attempt is audited. |
| KROWDS-PRD-027 | The target backend shall be one Go + Gin codebase and binary on Cloud Run; Cloud SQL, Memorystore, Cloud Tasks, Cloud Scheduler, Cloud Storage, Secret Manager, Cloud Logging, Error Reporting, Monitoring, and BigQuery shall have approved product purposes. | Must | All roles | Given the target architecture, when ownership and failure behavior are reviewed, then no second backend technology or independently deployed business service exists. |
| KROWDS-PRD-028 | KREW break-glass shall require MFA, be time-bounded and purpose-recorded, and remain fully audited; it shall never set payment state, grant offline access, or bypass single-use enforcement. | Must | KREW | Given a break-glass request, when used, then its window and actions are auditable and every prohibited override is rejected. |
| KROWDS-PRD-029 | Authoritative audit and operational events shall be exportable to governed BigQuery datasets for reconciliation and approved analysis without becoming the transactional system of record. | Must | Platform Admin; Finance; authorized Viewer | Given a committed material event, when export runs, then its correlation reference and safe fields are queryable; Cloud SQL remains authoritative. |
| KROWDS-PRD-030 | Product state shall follow the canonical order, ticket, wristband, shipment, and access models, with every transition authorized, validated, idempotent where applicable, and audited. | Must | All roles | Given duplicate or out-of-order requests, when transitions are tested, then only the canonical next state commits and every outcome is traceable. |
| KROWDS-PRD-031 | Consumer identity verification shall use a distinct manual KREW review workflow with queue, claim, correction, approval, rejection, expiry, and audit states; first review target is 1 business day and correction target is 2 business days. | Must | User; KREW; Ticketing; Redemption | Given a consumer identity requiring review, when its case is pending or unapproved, then ticket issuance and binding remain blocked; only an approved current identity can proceed. |
| KROWDS-PRD-032 | Ticket purchase shall enforce a maximum of 10 tickets per order and 5 active tickets per verified Identity per Event; buyers see their own tickets and staff see only minimum necessary fields. | Must | User; Ticketing; Redemption; Gate | Given a request above a limit or an unauthorized visibility scope, when checkout or ticket access is attempted, then the request is rejected or redacted without affecting unrelated orders. |
| KROWDS-PRD-033 | Browser authentication shall use the secure API gateway/identity-aware path with secure HttpOnly SameSite cookies, 15-minute access, 30-day rotating refresh, and 24-hour recovery links. | Must | User; all staff roles | Given a valid, expired, revoked, or replayed session, when access is attempted, then the backend accepts or rejects it according to the baseline without exposing raw tokens to the browser. |
| KROWDS-PRD-034 | The MVP operational baseline shall include 99.9% monthly availability, standard pilot capacity, 3-second gate timeout with two retries, RPO 15 minutes, RTO 4 hours, quarterly restore drills, and WCAG 2.2 AA. | Must | Product; Technology; Operations | Given a production or staging test, when the baseline is measured, then evidence is attached to the phase exit and no offline or unbounded fallback is introduced. |

## 7. UX and content requirements

### 7.1 Interaction principles

- The MVP UI and API-facing product copy are English-first; any later localization requires an approved language decision.
- Online purchase shall remain the primary visitor path; cashier is a clearly labeled on-site path with the same order and payment invariants.
- Payment, ticket, refund, onboarding, wristband, redemption, and gate screens shall show a current state and the next permitted action.
- Destructive or irreversible actions shall identify the affected object and consequence before submission.
- Gate and Redemption results shall prioritize `Access Granted` or `Access Denied`, the concise reason, ticket reference, and timestamp.
- Staff screens shall not expose a manual digital-payment confirmation, partial-refund amount, issued-ticket transfer, re-entry approval, or offline-grant control.
- Color and icon meaning shall never be the only indication of validity, payment, denial, or required action.

### 7.2 Required states

| Area | Required product states |
| --- | --- |
| Authentication | Unauthenticated, challenge pending, MFA required, authenticated, expired, locked or rate-limited, signed out |
| Identity | Draft, validation pending, verified, correction required, rejected |
| Organization onboarding | Draft, Submitted, Under Review, Revision Required, Approved, Rejected |
| Order/payment | Created, Pending, Paid, Failed, Cancelled, Refunded, with Xendit reconciliation detail |
| Ticket | Pending Payment, Issued, Reserved, Refunded, Bound, Used, Expired, Cancelled, Revoked |
| Stock wristband | Available, Reserved, Bound, Active, Used, Expired, Disabled, Quarantined, Revoked |
| New-batch wristband | Generated, Production, Quality Control, Shipped, Delivered, Batch Activated, Available, Reserved, Bound, Active, Used, Expired, Disabled, Quarantined, Revoked |
| Wristband order | Paid, Revision Required, Verification Pending, Approved, Production, Quality Control, Quarantined, Shipped, Delivered, Batch Activated (raw order projection `completed`), Cancelled where permitted |
| Shipment | Pending, Label Created, Picked Up, In Transit, Delivered, Failed, Cancelled, Reshipment Pending where applicable |
| Registered gate device | Pending Registration, Active, Suspended, Disabled, Revoked |
| Gate | Request state: Validation requested, Temporarily Unavailable; authoritative decision: Access Granted or Access Denied |
| Email | Queued, Sent, Delivered, Failed, Retried as supported by Resend status |

### 7.3 Accessibility and responsive behavior

- All interactive functions shall be operable by keyboard and expose an accessible name, role, state, and error relationship.
- Focus shall remain predictable after validation, state changes, dialogs, and asynchronous updates.
- Gate and cashier views shall remain usable on supported mobile devices and shall not require hover.
- Color contrast, zoom/reflow limits, minimum target sizes, and assistive-technology support matrix must meet WCAG 2.2 AA: normal text contrast at least 4.5:1, large text/non-text controls at least 3:1, 200% zoom, 320px reflow, and 44×44 CSS px targets on the supported Chrome, Safari, Android, and iOS matrix. Venue-specific device settings remain evidence gates until rehearsal.
- Motion shall respect the user's reduced-motion preference.

## 8. Integrations and dependencies

| Dependency | Product responsibility | Failure impact | Product fallback |
| --- | --- | --- | --- |
| Google OAuth | Identity-provider sign-in | Google sign-in unavailable; approved email/password and email OTP remain available | Show provider status and a safe retry; do not create a partial account |
| Resend | OTP, recovery, invitation, onboarding, payment, ticket, shipping, activation, revision, and security email plus status | Delivery may fail or be delayed | Issued tickets remain available in the User account; retry from the account |
| Xendit | IDR QRIS, Virtual Account, e-wallet payment, cashier QRIS, and full-refund state | New or unsettled payment/refund workflow may pause | Keep order unpaid/unsettled as appropriate; never permit manual confirmation |
| Biteship | Domestic label, tracking, delivery webhook, and reshipment state | Fulfillment status cannot advance normally | Keep the order in its last verified state; no COD or fabricated delivery state |
| Cloud Run | The single Go + Gin backend codebase and binary in API, worker, and scheduled roles | Backend and asynchronous workflows may pause | Retry safely, fail closed, and invoke incident procedures; no fake business state |
| Cloud SQL PostgreSQL with RLS | Transactional system of record and tenant isolation | Durable product workflows cannot safely complete | Fail closed; restore, reconcile idempotently, and preserve audit evidence |
| Memorystore | Cache, rate limiting, short-lived locks, and idempotency coordination | Some time-sensitive coordination paths may degrade | Use approved durable coordination or fail closed where safety requires it |
| Cloud Tasks | Asynchronous email, provider callback, export, and retry work | Non-interactive work may be delayed | Keep authoritative state pending and retry idempotently |
| Cloud Scheduler | Expiry, reconciliation, cleanup, and recurring jobs | Scheduled state convergence may be delayed | Run approved manual replay through the same Go workflow and audit it |
| Cloud Storage | Private legal documents, artwork, production CSV, and exports | Review, fulfillment, or export files may be unavailable | Preserve state and deny unsafe access; recovery follows the approved policy |
| Secret Manager | Runtime provider credentials and secrets | Provider operations may fail after safe startup validation | Rotate/recover secrets; never use embedded fallback secrets |
| Cloud Logging, Error Reporting, and Monitoring | Logs, errors, metrics, traces, dashboards, and alerts | Diagnosis and alerting may degrade | Use approved incident channels and preserve local safe diagnostics |
| BigQuery | Audit, reconciliation, and operational datasets | Analytics and batch reconciliation may lag | Cloud SQL and append-oriented audit records remain authoritative; replay export |
| Go authentication service | Sessions, OAuth, email/password, OTP, recovery, and privileged-role MFA | Staff and User authentication may be unavailable | Fail closed; use only the approved account-recovery and incident process |
| Identity validation source/process | Duplicate and holder checks, including guardian relationship | Some ticket-holder assignments may require review | Do not issue a ticket until the required validation result exists |

Provider account ownership, service tiers, contractual limits, legal terms, and support contacts are controlled release gates in [OPEN-DECISIONS.md](../00-governance/OPEN-DECISIONS.md).

## 9. Analytics and success measurement

| Event ID | Trigger | Required properties | Success use |
| --- | --- | --- | --- |
| KROWDS-EVT-001 | Sign-in method challenge succeeds | method, role class, timestamp; no credential value | Authentication funnel and incident analysis |
| KROWDS-EVT-002 | Organization submission state changes | prior state, new state, organization ID, actor ID, timestamp | Onboarding throughput |
| KROWDS-EVT-003 | Membership invitation or state changes | organization ID, role, action, actor ID, timestamp | Access governance |
| KROWDS-EVT-004 | Online order reaches payment selection | order ID, organization ID, product ID, IDR amount, method class | Checkout conversion |
| KROWDS-EVT-005 | Verified Xendit state changes order | order ID, provider reference, prior state, new state, timestamp | Payment and issuance latency |
| KROWDS-EVT-006 | Ticket issued | order ID, ticket ID, holder reference, product ID, timestamp | Inventory and delivery reconciliation |
| KROWDS-EVT-007 | Resend delivery status changes | message purpose, order ID, status, provider reference, timestamp | Email deliverability without message-content logging |
| KROWDS-EVT-008 | Full-refund state changes | order ID, state, provider reference, timestamp | Finance and support analysis |
| KROWDS-EVT-009 | Wristband order state changes | order ID, batch ID, prior state, new state, actor class, timestamp | Fulfillment cycle time |
| KROWDS-EVT-010 | Biteship status changes | shipment ID, order ID, status, timestamp | Shipping visibility |
| KROWDS-EVT-011 | Redemption completes or is denied | ticket ID, wristband ID, result, reason code, operator ID, timestamp | Redemption quality |
| KROWDS-EVT-012 | Gate grants or denies access | wristband ID, result, reason code, registered device ID, timestamp | Safety and throughput |
| KROWDS-EVT-013 | Tenant-isolation control denies access | actor ID, requested organization ID, resource type, timestamp | Security investigation |
| KROWDS-EVT-014 | Release phase changes | prior phase, new phase, decision actor role, evidence reference, timestamp | Release governance |
| KROWDS-EVT-015 | Stock wristband is reserved, released, or bound | wristband ID, order ID, ticket ID, action, actor class, timestamp | Inventory and reservation integrity |
| KROWDS-EVT-016 | New batch is activated | batch ID, shipment ID, quantity, actor ID, timestamp | Fulfillment reconciliation |
| KROWDS-EVT-017 | Gate device state changes | device ID, organization ID, prior state, new state, actor ID, timestamp | Device governance |
| KROWDS-EVT-018 | KREW break-glass starts or ends | actor ID, purpose code, organization ID, start/end timestamps, outcome | Privileged-access oversight |
| KROWDS-EVT-019 | Material event is exported to BigQuery | event correlation ID, dataset purpose, export status, timestamp | Export completeness |

Numeric baselines are defined in `PRODUCT-VISION.md`; optional product analytics is disabled by default without explicit consent and uses only approved aggregate or HMAC-SHA-256 pseudonymous events. Provider-, venue-, and evidence-dependent measurements remain controlled in [OPEN-DECISIONS.md](../00-governance/OPEN-DECISIONS.md). Analytics shall not contain raw Identity numbers, credential payloads, passwords, MFA codes, or payment secrets.

## 10. Security and privacy requirements

- Authentication state and authorization decisions are owned by the Go backend; frontend-only role checks are not security controls.
- Browser sessions use secure HttpOnly SameSite cookies and rotating refresh credentials; access is 15 minutes, refresh is 30 days, recovery links are 24 hours, and revocation is immediate.
- KREW, Platform Admin, Finance, and Organization Admin accounts require TOTP or WebAuthn MFA; other staff roles follow the approved role-risk policy, and all role access is limited to the current Membership and tenant context.
- The MVP OTP baseline is a 15-minute expiry, five failed attempts, a 60-second resend cooldown, and the route-class limits in the API contract; provider evidence may tighten them.
- Tenant-owned data uses Cloud SQL `organization_id` and RLS; privileged cross-tenant reads require an approved path and audit record.
- Credentials, session values, MFA secrets, payment data, and provider secrets are never written to product analytics or normal logs.
- KROWDS stores no raw card data; Xendit payment data remains tokenized at the provider boundary.
- Organization legal documents, artwork, and production CSVs are private encrypted Cloud Storage objects with controlled access and retention.
- Identity, ticket, order, audit, and provider-event data are treated as confidential operational data; consumer identity-document images are not required.
- A ticket holder under 18 requires a verified guardian account, relationship declaration, and explicit consent; legal wording and event-specific evidence remain subject to counsel.
- KREW break-glass is MFA-protected, time-bounded, purpose-recorded, and fully audited; it cannot set payment state, grant offline access, or bypass single use.
- User-facing consent and organization terms must be versioned; the tiered retention baseline and contract-plus-consent posture are fixed, while legal wording and statutory exceptions remain subject to counsel.
- Personal data shall be exported in the approved customer-account format; the tiered retention, correction, deletion, and legal-hold rules follow the confirmed baseline with legal exceptions.
- BigQuery contains governed analytical exports and does not replace the Cloud SQL system of record.
- Production data shall not be copied into development or pilot systems outside the approved data-handling process.

## 11. Phased release and rollback

| Phase | Feature control | Entry criteria | Success gate | Rollback trigger |
| --- | --- | --- | --- | --- |
| 1. Foundation | Organization and surface access by approved organization | Requirements and test environments available | Authentication, recovery, Identity, onboarding, KREW review, one-role Membership, invitation, correlation, and audit acceptance pass | Cross-tenant exposure, identity confusion, recovery misuse, or unapproved organization access |
| 2. Commerce | Event-level online-sales enablement | Phase 1 accepted; Xendit and Resend verified | Hierarchy, capacity, price, paid issuance, delivery, duplicate-holder, credential, and eligible full-refund scenarios pass | Incorrect issuance, unsafe credential exposure, invalid refund, or unreconciled payment outcome |
| 3. Fulfillment | Organization/order fulfillment controls and event-level stock availability | Phase 2 accepted; private storage and Biteship verified | Stock reservation and paid-order-to-delivery-to-activation reconciliation pass | Wristband quantity mismatch, early activation, unsafe production file, or fabricated delivery state |
| 4. Access and operations | Event-level redemption and registered gate-device enablement | Phase 3 accepted; break-glass and operational procedures approved | End-to-end admission, single-use concurrency, reconciliation, access logging, and BigQuery export pass | Wristband misbinding, duplicate admission, offline grant, manual payment override, or unaudited break-glass |

Rollback disables the affected capability or event and preserves verified records. It shall not delete paid orders, refund evidence, ticket-use evidence, or audit history.

## 12. Dependencies, assumptions, and open decisions

External and evidence gates are maintained centrally in [OPEN-DECISIONS.md](../00-governance/OPEN-DECISIONS.md). The rows below provide the product-phase view; a gate is not closed by changing only this table.

| ID | Item | Owner | State | Needed by |
| --- | --- | --- | --- | --- |
| KROWDS-PRD-Q-001 | Approve final legal wording and exceptional rejection/revision policy for the confirmed onboarding document set and 2-business-day SLA | KROWDS Operations and Legal Owners (personal names TBD) | `TBD` | Phase 1 |
| KROWDS-PRD-Q-002 | Approve customer-facing fee, tax-invoice, settlement, and exceptional-refund wording; 7-day request window, tax-inclusive display, daily reconciliation, and weekly sign-off are fixed | Finance and Legal Owners (personal names TBD) | `TBD` | Phase 2 |
| KROWDS-PRD-Q-003 | Approve legal notice and correction-evidence wording for the confirmed minimal identity fields, one active ticket per Identity/Event/Ticket Product/Session, five active tickets per Identity/Event, and 24-month identity-review retention | Identity and Legal Owners (personal names TBD) | `TBD` | Phase 1 |
| KROWDS-PRD-Q-004 | Provide phase-exit evidence for event-level inventory and uniqueness around the fixed limits of 10 tickets/order, 5 active tickets/Identity/Event, and one active ticket per Identity/Event/Ticket Product/Session | Ticketing and Product Owners (personal names TBD) | `TBD` | Phase 2 |
| KROWDS-PRD-Q-005 | Approve physical print/material parameters, minimum order quantities, and venue-specific fulfillment times; code format is tracked by `KROWDS-OD-028`; 30m/15m reservation expiry, approved courier allowlist, live org-paid quote, and KREW reshipment are fixed | KROWDS Operations Owner (personal name TBD) | `TBD` | Phase 3 |
| KROWDS-PRD-Q-006 | Approve venue continuity procedure text; 3-second timeout, two retries, fail-closed behavior, registered-device lifecycle, and no offline grant are fixed | Gate Operations Owner (personal name TBD) | `TBD` | Phase 4 |
| KROWDS-PRD-Q-007 | Provide phase-exit evidence for 99.9% availability, 300/500/800/700 ms p95 targets, 2x burst, 15m/4h RPO/RTO, 7/14/35-day backup, WCAG 2.2 AA, and support SLAs; provider/venue measurements remain evidence gates | Technical and Product Owners (personal names TBD) | `TBD` | Phase 4 |
| KROWDS-PRD-Q-008 | Select the single pilot organization/indoor venue, relative launch window, and organization-specific price configuration; standard pilot capacity and no-platform-fee MVP policy are fixed | Business Sponsor and Product Owner (personal names TBD) | `TBD` | Phase 4 |
| KROWDS-PRD-Q-009 | Approve guardian consent text and event-specific evidence rules; under-18, verified guardian account, relationship declaration, and explicit consent are fixed | Product and Legal Owners (personal names TBD) | `TBD` | Phase 2 |
| KROWDS-PRD-Q-010 | Approve GCP quotas, service tiers, cost budgets, CMEK, and legal residency evidence; single-region `asia-southeast2`, secure-cookie API gateway, and 30/90/365-day log retention are fixed | Platform, Security, and Legal Owners (personal names TBD) | `TBD` | Before production infrastructure approval |

## 13. Traceability

| Business source | Product requirements |
| --- | --- |
| KROWDS-BR-001 | KROWDS-PRD-001, KROWDS-PRD-002 |
| KROWDS-BR-002, KROWDS-BR-009 | KROWDS-PRD-003, KROWDS-PRD-011, KROWDS-PRD-012 |
| KROWDS-BR-003 | KROWDS-PRD-004, KROWDS-PRD-005 |
| KROWDS-BR-004 | KROWDS-PRD-006, KROWDS-PRD-024 |
| KROWDS-BR-005 | KROWDS-PRD-007 |
| KROWDS-BR-006, KROWDS-BR-007, KROWDS-BR-008 | KROWDS-PRD-008 through KROWDS-PRD-015 |
| KROWDS-BR-012, KROWDS-BR-013 | KROWDS-PRD-016 through KROWDS-PRD-018 |
| KROWDS-BR-010, KROWDS-BR-015 | KROWDS-PRD-013, KROWDS-PRD-019, KROWDS-PRD-023 |
| KROWDS-BR-014 | KROWDS-PRD-022 |
| KROWDS-BR-016 | KROWDS-PRD-021 |
| KROWDS-BR-017 | KROWDS-PRD-019 |
| KROWDS-BR-019 | KROWDS-PRD-020 |
| KROWDS-BR-020 | KROWDS-PRD-021, KROWDS-PRD-030, and section 3.3 |
| KROWDS-BR-021, KROWDS-BR-022 | KROWDS-PRD-027, KROWDS-PRD-029 |
| KROWDS-BR-023 | KROWDS-PRD-025 |
| KROWDS-BR-024 | KROWDS-PRD-026, KROWDS-PRD-028 |

Detailed test identifiers and the software-level normative requirements remain in SRS.md. Quality targets remain in NFR.md.

## 14. Approval

| Role | Name | Decision | Date |
| --- | --- | --- | --- |
| Product Owner | TBD | Approve / Reject | TBD |
| Business Sponsor | TBD | Approve / Reject | TBD |
| KROWDS Operations Owner | TBD | Approve / Reject | TBD |
| Finance Owner | TBD | Approve / Reject | TBD |
| Identity and Access Owner | TBD | Approve / Reject | TBD |
| Data and Security Owner | TBD | Approve / Reject | TBD |
| Legal Owner | TBD | Approve / Reject | TBD |
