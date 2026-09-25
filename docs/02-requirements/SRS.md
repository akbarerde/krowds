# KROWDS-SRS-DOC-001 — KROWDS Software Requirements Specification

## Metadata

| Field | Value |
| --- | --- |
| System / module | KROWDS MVP |
| Document ID | `KROWDS-SRS-DOC-001` |
| Owner | Technical Owner (personal name TBD) |
| Product owner | Product Owner (personal name TBD) |
| Version | 0.1 |
| Status | Draft |
| Related PRD | `PRD.md` |
| Related BRD | `BRD.md` |
| Last updated | 2026-09-24 |
| Canonical language | English |

This document is the canonical English software-requirements layer. `PRODUCT-VISION.md` remains the canonical English product target and `KROWDS.md` remains the Bahasa Indonesia product brief. `Shall` and `must` are normative. `Should` is a quality recommendation unless accepted as a test obligation. Draft statements remain subject to review.

## 1. Purpose and scope

### 1.1 Purpose

This specification defines the implementable and testable MVP behavior for identity, organization onboarding, role-based access, event hierarchy, IDR commerce, single-use e-tickets, cashier sales, wristband fulfillment, redemption, online gate validation, notifications, shipping, tenant isolation, and audit.

### 1.2 In scope

- Browser and PWA user, organization, KREW, cashier, redemption, and gate experiences backed by one Go service.
- Go-owned authentication and authorization with secure HttpOnly sessions, rotating refresh credentials, and mandatory MFA for KREW, Platform Admin, Finance, and Organization Admin privileged accounts.
- Shared-schema Cloud SQL PostgreSQL persistence with `organization_id` and RLS for tenant-owned data.
- Minor guardian relationship and consent without consumer identity-document images.
- Xendit IDR payment and controlled full-refund integration.
- Resend OTP, recovery, invitation, workflow, ticket, shipping, activation, revision, and security email integration.
- Biteship domestic organization-paid label, tracking, delivery-webhook, and reshipment integration without COD.
- Cloud Run, Memorystore, Cloud Tasks, Cloud Scheduler, Cloud Storage, Secret Manager, Cloud Logging, Error Reporting, Monitoring, and BigQuery target integrations.
- Auditable lifecycle, reconciliation, and state-transition behavior.

### 1.3 Out of scope

- Issued-ticket transfer, re-entry, multi-use admission, and offline gate validation.
- Partial refund and any staff-entered digital payment or refund settlement.
- Branch entities, custom roles, international shipping, marketplace courier selection, COD, and physical ticket shipping.
- Automated identity or liveness providers, identity-document OCR, and consumer identity-document images.
- Multi-region deployment and advanced analytics beyond the defined MVP datasets.
- Backend logic inside Next.js applications or packages.
- Independently deployed business services.

## 2. Normative conventions and system context

- Identifiers beginning with `KROWDS-` are stable requirement or design-trace references.
- All persisted timestamps shall be stored in UTC and rendered in the user's configured locale.
- All monetary values shall be represented as integer IDR in the domain and as an exact decimal string in the API; no floating-point amount shall be used for calculations.
- Provider identifiers are opaque and shall not be treated as KROWDS primary identifiers.
- The five browser applications are frontend-only. All backend calls go through `@krowds/api`; the PWA service worker may perform fetch handling but shall not become an offline admission authority.
- The backend shall be one Go + Gin modular-monolith codebase and binary. Cloud Run may run API, worker, and scheduled roles from that binary; they shall not become independently owned business services.
- The MVP UI and API-facing product contract are English-first. Later localization requires an approved product decision.
- Wristband QR tokens shall contain at least 128 bits of entropy; the service shall store only a token hash.

```text
Web / Auth / KROWDS / Organization / PWA
                    |
             @krowds/api (HTTPS)
                    |
             Cloud Run: one Go + Gin binary
        API / worker / scheduled execution roles
          |          |           |          |
       Cloud SQL  Memorystore  Cloud Tasks  Cloud Scheduler
          |          |           |          |
     organization_id + RLS   cache/locks/idempotency
          |
 Cloud Storage | Secret Manager | Cloud Logging / Error Reporting / Monitoring
          |
       BigQuery audit and operational datasets
          |
    Xendit | Resend | Biteship (backend-only provider calls)
```

The trust boundary is the Go API. The browser cannot choose an organization context that bypasses authorization, set a payment outcome, change a ticket holder after successful payment, register a gate device, or grant gate access. Provider webhooks are accepted only by the Go backend and shall be authenticated, replay-resistant, idempotent, and audited.

## 3. Actors and fixed authorization roles

| Actor | Software responsibility | Trust level |
| --- | --- | --- |
| User | Owns an authenticated account and personal data | Untrusted input until authenticated and authorized for each operation |
| Identity | Represents the verified person associated with a User or named ticket holder | Confidential domain record; source of ticket-holder matching |
| Visitor/TicketHolder | Person admitted under an issued ticket | Untrusted at the gate until ticket, identity, wristband, and entitlement are verified |
| Organization | Tenant that owns operational resources | Tenant-scoped trust boundary |
| Membership | Links a User to an Organization with exactly one fixed role | Authoritative only when active and validated against organization state |
| KREW | Performs organization review and wristband fulfillment | Privileged cross-organization operational actor |
| Platform Admin | Performs approved platform governance and support | Highest privileged actor; all access audited |

The complete fixed role set is:

| Internal role | Organization role |
| --- | --- |
| `platform_admin` | None |
| `krew` | None |
| None | `organization_owner_admin` |
| None | `finance` |
| None | `ticketing` |
| None | `cashier` |
| None | `redemption` |
| None | `gate` |
| None | `viewer` |

Display names are Platform Admin, KREW, Organization Owner/Admin, Finance, Ticketing, Cashier, Redemption, Gate, and Viewer. Platform Admin and KREW are internal fixed role groups; KREW capability values do not create additional Membership roles. No other role shall grant operational access.

## 4. Principal use cases

### KROWDS-UC-001 — Authenticate a User or staff member

- **Actor:** User with optional staff roles.
- **Preconditions:** valid Google OAuth/OIDC identity, email/password credential, Resend email OTP challenge, or recovery context.
- **Trigger:** user submits an approved authentication request.
- **Main flow:** validate the request; establish the User session through Go-owned code using a secure HttpOnly cookie and rotating refresh credential; detect staff role assignment; require and validate MFA for KREW, Platform Admin, Finance, and Organization Admin privileged roles, or when the approved role-risk policy requires it; return authorized context.
- **Alternative flow:** reject invalid, expired, replayed, or rate-limited input; require a new challenge where appropriate.
- **Postconditions:** an authenticated session exists with current roles and organization memberships, or no session is created.

### KROWDS-UC-002 — Submit and review an Organization

- **Actor:** Organization Owner/Admin; KREW reviewer.
- **Preconditions:** the requester has a verified account, required legal/tax/bank/signatory data, and is not already operating an organization in the same permitted context.
- **Trigger:** the organization submits complete onboarding data; KREW target is to decide within 2 business days.
- **Main flow:** validate required fields and documents; move Draft to Submitted; KREW moves it to Under Review; approve or request revision/reject with a reason; record each transition.
- **Alternative flow:** validation prevents submission; a reviewer requests Revision Required or Rejected.
- **Postconditions:** only Approved permits organization roles, operational configuration, and event publication.

### KROWDS-UC-003 — Purchase tickets online

- **Actor:** User; Ticketing; Xendit.
- **Preconditions:** an Approved organization, published event hierarchy, on-sale ticket product, available inventory, and current User session.
- **Trigger:** the User submits a complete order for one named Visitor/TicketHolder per ticket.
- **Main flow:** validate tenant context and order; calculate IDR total; create a pending order; create an Xendit payment for QRIS, Virtual Account, or approved e-wallet with a 30-minute instruction expiry; process a verified provider event idempotently; issue exact ticket quantity; make tickets available in the account; request Resend delivery.
- **Alternative flow:** reject invalid hierarchy, identity, inventory, amount, method, or duplicate request; leave the order unpaid if payment does not reach Paid.
- **Postconditions:** a Paid order has issued single-use tickets or no usable tickets.

### KROWDS-UC-004 — Request a full refund

- **Actor:** permitted User or organization staff; Finance; Xendit.
- **Preconditions:** eligible paid order, no ticket in the order that is Bound or Used, and a request within 7 calendar days after verified payment.
- **Trigger:** actor requests a full-order refund.
- **Main flow:** validate authority and policy; release any active reservation atomically; create one idempotent full-refund request; process authenticated, replay-resistant Xendit state; record the refund request and final provider-backed outcome.
- **Alternative flow:** reject partial amount, duplicate active request, ineligible order, unauthorized actor, or any Bound or Used ticket; route a request after 7 days to `exceptional_review` for a dual-approved Finance decision; on provider rejection open reconciliation without restoring access.
- **Postconditions:** the order has one auditable refund trajectory and no active ticket can be used while awaiting final outcome.

### KROWDS-UC-005 — Sell and issue a ticket through Cashier

- **Actor:** Cashier; Xendit.
- **Preconditions:** active Cashier Membership, eligible event product, and enough Available stock wristbands.
- **Trigger:** cashier submits quantity and one named Visitor/TicketHolder per ticket.
- **Main flow:** reserve one stock wristband per ticket for 15 minutes; create a pending cashier order; create an Xendit QRIS request; display the payment instruction; process a verified event idempotently; issue tickets, retain valid reservations, and provide the receipt.
- **Alternative flow:** reject a non-QRIS method, inactive Membership, invalid holder, unavailable product, or insufficient stock; release reservations on expiry, failure, or cancellation under the approved policy.
- **Postconditions:** a paid cashier order has issued tickets and valid wristband reservations, or the order remains unpaid/cancelled/failed and its reservations are released.

### KROWDS-UC-006 — Fulfill and activate a wristband batch

- **Actor:** Organization Owner/Admin or Ticketing; KREW; Xendit; Biteship.
- **Preconditions:** Approved organization, eligible event, valid production order, and organization payment.
- **Trigger:** KREW accepts a paid wristband order.
- **Main flow:** review order or request revision; generate a private production CSV; advance through production and quality control; create a domestic organization-paid Biteship shipment using an approved allowlist service and live quote; record `shipped` only after verified carrier handoff; process tracking and delivery webhooks; require verified Biteship delivery evidence and organization receipt confirmation; allow the organization to activate the delivered batch through the authenticated dashboard with its activation credential; mark batch Available; request Resend activation email.
- **Alternative flow:** revision, failed payment, failed quality control, shipment exception, wrong credential, or premature activation blocks Available state until resolved.
- **Postconditions:** only a batch with verified Biteship delivery evidence, authenticated organization receipt confirmation, and successful batch activation contains wristbands in Available state.

### KROWDS-UC-007 — Redeem a ticket to a wristband

- **Actor:** Visitor/TicketHolder; Redemption operator.
- **Preconditions:** paid, issued, unexpired ticket; available unbound wristband; active Redemption Membership; online service.
- **Trigger:** operator scans the ticket QR and confirms the holder comparison.
- **Main flow:** retrieve ticket in tenant context; verify payment, holder, guardian evidence when applicable, validity, refund, and prior binding; reserve and scan an Available wristband; atomically move the ticket through Reserved, bind Identity, Ticket, Wristband, and entitlement, activate the wristband, and record the redemption.
- **Alternative flow:** deny with a safe reason and do not bind for invalid, unavailable, expired, refunded, already-bound, or mismatched input.
- **Postconditions:** exactly one ticket is bound to one active wristband, or no binding is changed.

### KROWDS-UC-008 — Validate gate access

- **Actor:** Gate operator; Visitor/TicketHolder.
- **Preconditions:** active Gate Membership, active registered device in the expected Organization/Venue/Event context, online service, active wristband, and unused ticket.
- **Trigger:** operator scans the wristband QR from the registered device.
- **Main flow:** resolve the opaque credential; authenticate the device and operator; verify organization hierarchy, ticket, holder binding, wristband state, entitlement, validity window, and prior use; atomically record successful first use; return Access Granted.
- **Alternative flow:** return Access Denied with a safe reason and record the attempt; a previously used or otherwise invalid credential never receives an offline override.
- **Postconditions:** the ticket and wristband are Used, or the attempt is denied without marking either used.

## 5. Functional requirements

### 5.1 Authentication, User, and Identity

| ID | Normative requirement | Source | Verification |
| --- | --- | --- | --- |
| KROWDS-SRS-001 | The Go backend shall own authentication session creation, validation, expiry, and revocation, use secure HttpOnly SameSite cookies, rotate refresh credentials, and derive role context. Access is 15 minutes, refresh is 30 days, recovery links are 24 hours, and revocation is immediate. | KROWDS-PRD-001, KROWDS-PRD-033, KROWDS-BR-001 | Integration, cookie, rotation, and negative authorization tests |
| KROWDS-SRS-002 | The system shall support Google OAuth, email/password, and Resend email OTP and account recovery through the Go-owned authentication flow. | KROWDS-PRD-001 | Authentication acceptance tests per method |
| KROWDS-SRS-003 | A User assigned Platform Admin, KREW, Finance, or Organization Admin shall complete MFA before receiving privileged permissions. Other staff roles shall follow the approved role-risk policy. | KROWDS-PRD-002 | Role-based MFA tests and session inspection |
| KROWDS-SRS-004 | Authentication failures, OTP challenges, recovery actions, and credential checks shall be rate-limited. The MVP baseline is a 15-minute OTP expiry, five failed attempts, a 60-second resend cooldown, a 15-minute MFA/recovery lockout, and the route-class limits defined in the API contract. | KROWDS-PRD-001, KROWDS-PRD-024 | Rate-limit, lockout, and abuse tests |
| KROWDS-SRS-005 | The data model shall distinguish User, Identity, order buyer, and named Visitor/TicketHolder; a ticket shall reference one holder Identity without changing User ownership. A user may have multiple verified Identities. | KROWDS-PRD-003 | Data and journey tests |
| KROWDS-SRS-006 | Identity validation shall use normalized identity type, number, and full legal name and return a validation result. The MVP shall use manual KREW review for consumer identity verification; automated OCR, liveness, and consumer identity-document images are not enabled. Initial review target is 1 business day and correction target is 2 business days. | KROWDS-PRD-003, KROWDS-PRD-025, KROWDS-PRD-031 | Validation, duplicate, review, and data-minimization tests |

### 5.2 Organization onboarding and access control

| ID | Normative requirement | Source | Verification |
| --- | --- | --- | --- |
| KROWDS-SRS-007 | An authenticated Organization Owner/Admin shall be able to create and save an organization onboarding record before submission; required data is legal entity, registration, representative, tax ID, address, bank verification, and authorized signatory. Supporting files shall be private encrypted Cloud Storage objects referenced by opaque IDs. | KROWDS-PRD-004, KROWDS-PRD-027 | CRUD, object-access, completeness, and validation tests |
| KROWDS-SRS-008 | The onboarding state machine shall allow Draft → Submitted → Under Review → Revision Required → Approved or Rejected, with revision or rejection reason required where applicable. Initial and revision review target is 2 business days. | KROWDS-PRD-004 | State-transition, SLA, and reason tests |
| KROWDS-SRS-009 | Only KREW with an active KREW role may perform organization review transitions. | KROWDS-PRD-004, KROWDS-PRD-005 | Role authorization tests |
| KROWDS-SRS-010 | The system shall block organization operational configuration and event publication unless organization status is Approved. | KROWDS-PRD-005 | Negative workflow tests |
| KROWDS-SRS-011 | The authorization model shall accept only the fixed role identifiers in section 3; custom role and permission records shall not be created. | KROWDS-PRD-006, KROWDS-PRD-024 | Schema and role-enumeration tests |
| KROWDS-SRS-012 | A staff invitation shall identify organization, inviter, exactly one fixed role, expiry, and acceptance state; acceptance shall require the intended authenticated User and create one Membership with that role. | KROWDS-PRD-006 | Invitation lifecycle, cardinality, and wrong-user tests |
| KROWDS-SRS-013 | Suspension, revocation, role removal, or organization status loss shall invalidate affected staff authorization without deleting historical Membership or audit records. | KROWDS-PRD-006, KROWDS-PRD-019 | Authorization revocation tests |
| KROWDS-SRS-014 | Platform Admin and KREW cross-organization operations shall require an explicit authorized path, a reason where policy requires one, and an audit event. | KROWDS-PRD-019, KROWDS-PRD-020 | Privileged-access tests and audit review |

### 5.3 Hierarchy, catalog, and inventory

| ID | Normative requirement | Source | Verification |
| --- | --- | --- | --- |
| KROWDS-SRS-015 | Tenant hierarchy shall be represented as Organization → Venue → Event → optional Activity → Session. The data model shall not contain a Branch entity. | KROWDS-PRD-007, KROWDS-BR-005 | Schema, validation, and architecture tests |
| KROWDS-SRS-016 | Every descendant shall reference one tenant-owned ancestor and shall inherit the same `organization_id`; cross-organization references shall be rejected before persistence. | KROWDS-PRD-020 | Constraint and isolation tests |
| KROWDS-SRS-017 | A ticket product shall reference one Event, may reference one optional Activity and one Session, and shall store an integer tax-inclusive IDR price and inventory policy. Quantity limits are 10 tickets/order and 5 active tickets per verified Identity per Event; only one active ticket is allowed for the same Identity/Event/Ticket Product/Session combination. Online and cashier reservations expire after 30 and 15 minutes respectively. | KROWDS-PRD-008, KROWDS-PRD-032 | Product, limit, reservation, uniqueness, and concurrency tests |
| KROWDS-SRS-018 | An event shall be discoverable only when its organization is Approved and the event, product, price, and current sale window satisfy publication rules. | KROWDS-PRD-005, KROWDS-PRD-008 | Catalog exposure tests |
| KROWDS-SRS-019 | User queries shall return only published, currently relevant catalog data and shall not leak unpublished Inventory or organization configuration. | KROWDS-PRD-008, KROWDS-PRD-024 | Catalog authorization tests |

### 5.4 Orders, Xendit payment, and refund

| ID | Normative requirement | Source | Verification |
| --- | --- | --- | --- |
| KROWDS-SRS-020 | Before successful payment, an authorized actor may update ticket-holder assignments through a validated draft order. After successful payment, organization, event scope, buyer, quantity, holder assignments, and integer IDR total shall be immutable; corrections shall use an audited cancellation/replacement flow. | KROWDS-PRD-009, KROWDS-PRD-012 | Pre-payment edit, tampering, and state tests |
| KROWDS-SRS-021 | Online checkout shall permit only Xendit QRIS, Virtual Account, or approved e-wallet for IDR. Cashier checkout shall permit only Xendit QRIS. Online instructions expire after 30 minutes; cashier instructions expire after 15 minutes. | KROWDS-PRD-009, KROWDS-PRD-015 | Method and expiry matrix tests |
| KROWDS-SRS-022 | The server shall calculate the payable amount from persisted prices and quantities; client-supplied totals shall never be authoritative. | KROWDS-PRD-009 | Pricing manipulation tests |
| KROWDS-SRS-023 | Xendit create-payment, notification, status retrieval, expiry, and refund events shall enter through backend-only webhooks or retrieval, be authenticated and replay-resistant, and be processed idempotently using provider reference and event identity. | KROWDS-PRD-010, KROWDS-BR-008 | Replay, duplicate, signature, and out-of-order tests |
| KROWDS-SRS-024 | Digital payment state shall be derived only from authenticated Xendit state. No authenticated role shall have an endpoint or UI to set Paid, Failed, Refunded, or settlement state manually. KROWDS shall store no raw card data. | KROWDS-PRD-010, KROWDS-BR-008 | Authorization, schema, and negative API tests |
| KROWDS-SRS-025 | The high-level order state shall be Created → Pending → Paid / Failed / Cancelled → Refunded. Provider expiry and reconciliation details may be stored separately but shall not create a competing authoritative state. | KROWDS-PRD-010, KROWDS-PRD-030 | State-machine tests |
| KROWDS-SRS-026 | A Paid order shall trigger exactly-once ticket issuance for the requested quantity. Issuance shall be safe to retry after partial infrastructure failure. | KROWDS-PRD-011 | Fault-injection and uniqueness tests |
| KROWDS-SRS-027 | A refund request shall contain no partial amount and shall reference the full eligible order total. An in-window request must be made within 7 calendar days after verified payment and before any ticket is Bound or Used; a later eligible request enters `exceptional_review`. Only a dual-approved Finance decision may be submitted to the provider, and a rejected decision makes no provider call. A duplicate active request shall return the existing result. | KROWDS-PRD-014 | Amount, seven-day boundary, exceptional-review, state, and idempotency tests |
| KROWDS-SRS-028 | On accepted full-refund processing, any active wristband reservation shall be released atomically and every ticket in the order shall become non-redeemable and non-gate-eligible. Final refund state shall follow Xendit; provider rejection opens reconciliation and does not automatically restore access. | KROWDS-PRD-014 | Concurrent reservation/redemption/gate and provider-failure tests |

### 5.5 Tickets and visitor credentials

| ID | Normative requirement | Source | Verification |
| --- | --- | --- | --- |
| KROWDS-SRS-029 | Each issued ticket shall reference one order, one tenant hierarchy scope, one ticket product, and one named holder Identity. For a minor holder it shall also reference verified guardian relationship and consent evidence. | KROWDS-PRD-003, KROWDS-PRD-011, KROWDS-PRD-025 | Schema, guardian, and issuance tests |
| KROWDS-SRS-030 | The system shall reject every attempt to change the holder Identity after successful payment. A different holder before payment is allowed only through an authorized draft update; transfer after issuance is not provided. | KROWDS-PRD-012 | Authorization, API, and UI tests |
| KROWDS-SRS-031 | A ticket and its QR credential shall be unique, tenant-scoped, opaque, and non-guessable. The QR payload shall not directly contain name, Identity number, price, payment data, or personal data. | KROWDS-PRD-023 | Uniqueness, decoding, and data-leak tests |
| KROWDS-SRS-032 | Ticket validity shall be evaluated against its persisted event, optional Activity, Session, entitlement, and validity window using server UTC time. | KROWDS-PRD-013 | Boundary-time tests |
| KROWDS-SRS-033 | A ticket shall permit at most one successful transition to Used. The system shall not expose re-entry, multi-use, or an offline-grant state or endpoint. | KROWDS-PRD-013 | Schema, API, and concurrency tests |
| KROWDS-SRS-034 | Ticket states shall follow Issued → Reserved → Bound → Used / Expired / Cancelled / Revoked, with Pending Payment and Refunded as applicable order-linked states. | KROWDS-PRD-011 through KROWDS-PRD-014, KROWDS-PRD-030 | State-transition matrix tests |
| KROWDS-SRS-035 | A User account shall list only tickets belonging to that User's buyer relationship or explicitly authorized organization relationship. | KROWDS-PRD-011, KROWDS-PRD-024 | Account isolation tests |

### 5.6 Cashier

| ID | Normative requirement | Source | Verification |
| --- | --- | --- | --- |
| KROWDS-SRS-036 | A Cashier order shall be created only with an active Cashier Membership and eligible online or on-site product context. | KROWDS-PRD-015 | Role and scope tests |
| KROWDS-SRS-037 | A cashier order shall require one named holder Identity per ticket, reserve one Available stock wristband per ticket before payment, and use an Xendit QRIS payment request. The reservation expires after 15 minutes and is released idempotently on failure, expiry, or cancellation. | KROWDS-PRD-015 | Input, reservation, method, and expiry tests |
| KROWDS-SRS-038 | A cashier receipt shall be available only after the order is Paid and shall identify order, items, IDR total, payment method, and issuance state without exposing provider secrets. | KROWDS-PRD-015 | Receipt timing and content tests |
| KROWDS-SRS-039 | A Cashier shall not be able to change a post-payment holder, mark a digital payment paid, issue a partial refund, grant access, register a gate device, activate a wristband batch, or use KREW break-glass. | KROWDS-PRD-012 through KROWDS-PRD-015, KROWDS-PRD-026, KROWDS-PRD-028 | Negative permission tests |

### 5.7 Wristband ordering and fulfillment

| ID | Normative requirement | Source | Verification |
| --- | --- | --- | --- |
| KROWDS-SRS-040 | An authorized organization role shall create either an Available-stock allocation or a newly produced wristband order for an Approved event with quantity and applicable artwork, material, organization billing, and organization-paid domestic shipping. | KROWDS-PRD-016, KROWDS-PRD-018 | Order-type and validation tests |
| KROWDS-SRS-041 | Newly produced wristband order payment shall be IDR through Xendit and fulfillment shall not begin before verified Paid state. | KROWDS-PRD-016 | Payment/fulfillment ordering tests |
| KROWDS-SRS-042 | Wristband order states shall include Paid, Revision Required, Verification Pending, Approved, Production, Quality Control, Shipped, Delivered, and `completed` after batch activation; the human projection may display Batch Activated. Activation shall require verified provider delivery evidence and authenticated organization receipt confirmation. Each transition shall validate role and current state and record actor, time, reason, and evidence reference. | KROWDS-PRD-017 | Transition, receipt, and audit tests |
| KROWDS-SRS-043 | KROWDS shall store each new-batch production CSV as a private Cloud Storage issuance artifact with fields `batch_id,wristband_code,qr_payload,schema_version` for 30 days after batch activation; fulfillment reconciliation must complete before deletion but does not extend the canonical timer absent a legal hold. Each QR token shall be 16 random bytes encoded as unpadded base64url without prefix; transactional credential records shall store only its SHA-256 hash, and the controlled CSV shall exclude User, Identity, ticket, payment, and entitlement data. A Used, Expired, Disabled, Revoked, or otherwise invalid wristband token shall fail the next online decision. | KROWDS-PRD-017, KROWDS-PRD-023 | Encoding, entropy, hash, retention, immediate-revocation, object-access, schema, and data-leak tests |
| KROWDS-SRS-044 | Biteship integration shall support an organization-selected service from an approved domestic allowlist, live organization-paid quote, label creation, tracking, delivery webhooks, and KREW-approved reshipment only; customers shall not select couriers and COD shall not be exposed. | KROWDS-PRD-018 | Provider mapping, quote, webhook, reshipment, and negative selection tests |
| KROWDS-SRS-045 | A newly produced batch shall require verified Biteship delivery evidence, authenticated organization receipt confirmation, and authenticated dashboard activation by an authorized organization actor using the correct activation credential. Activation shall transition all and only the valid batch wristbands to Available and trigger the activation email workflow. | KROWDS-PRD-016, KROWDS-PRD-017, KROWDS-PRD-022 | Premature, wrong-role, wrong-credential, receipt, email, and atomicity tests |
| KROWDS-SRS-046 | Stock wristbands shall follow Available → Reserved → Bound → Active → Used / Expired / Disabled / Revoked. New-batch wristbands shall follow Generated → Production → Quality Control → Shipped (only after verified carrier handoff) → Delivered → Batch Activated → Available → Reserved → Bound → Active → Used / Expired / Disabled / Revoked. | KROWDS-PRD-016, KROWDS-PRD-017, KROWDS-PRD-030 | State and quantity reconciliation tests |
| KROWDS-SRS-047 | A wristband shall bind to at most one Ticket and Identity. Binding shall require the correct reserved or newly selected Available wristband and an Issued or Reserved, paid, non-refunded ticket. | KROWDS-PRD-013, KROWDS-PRD-024 | Concurrency, reservation, and uniqueness tests |

### 5.8 Redemption and online gate

| ID | Normative requirement | Source | Verification |
| --- | --- | --- | --- |
| KROWDS-SRS-048 | Redemption shall require an active Redemption Membership and shall show only the ticket-holder comparison fields approved for the operator. | KROWDS-PRD-003, KROWDS-PRD-024 | Role and response-content tests |
| KROWDS-SRS-049 | Redemption shall atomically transition the ticket to Reserved, bind one holder Identity, Ticket, Wristband, and entitlement, set the wristband Active, and record the redemption. | KROWDS-PRD-013 | Transaction and fault-injection tests |
| KROWDS-SRS-050 | Gate access shall require an active Gate Membership, an active device registered to the expected Organization and Venue/Event context, and online backend validation. Device registration and lifecycle changes require an authorized organization role, a unique safe device reference, and an auditable transition; browser-only device claims never establish trust. | KROWDS-PRD-013, KROWDS-PRD-026 | Registration, spoofing, authorization, and network-failure tests |
| KROWDS-SRS-051 | Access Granted shall occur only when the wristband token is Active, bound, unexpired, enabled, within its validity window, entitled to the gate context, and unused, and its ticket is valid for the same access. | KROWDS-PRD-013, KROWDS-PRD-023 | Complete allow/deny decision matrix |
| KROWDS-SRS-052 | Successful admission shall atomically transition Ticket and Wristband to Used and record one access event. Concurrent requests shall produce at most one grant. | KROWDS-PRD-013 | High-concurrency and fault tests |
| KROWDS-SRS-053 | Every denial shall return a documented safe reason code and human-readable message and shall record the attempt without changing the ticket or wristband to Used. | KROWDS-PRD-019 | API and audit tests |
| KROWDS-SRS-054 | The system shall not provide an offline gate credential, cached grant, re-entry approval, multi-use counter, payment-state override, or single-use bypass in the MVP. KREW break-glass may support an approved operational purpose but shall never grant access or set payment state. | KROWDS-PRD-013, KROWDS-PRD-028 | Code, API, schema, UI, and privileged-action review |

### 5.9 Resend, Biteship notification, and audit

| ID | Normative requirement | Source | Verification |
| --- | --- | --- | --- |
| KROWDS-SRS-055 | The backend shall request OTP, account-recovery, invitation, onboarding/revision, payment, e-ticket, shipping, activation, and security email through Resend using a dedicated KROWDS-owned transactional subdomain, and correlate a provider message reference with its KROWDS purpose and resource. | KROWDS-PRD-022, KROWDS-BR-014 | Domain, provider integration, and message-purpose tests |
| KROWDS-SRS-056 | Resend payloads shall include only fields approved for the message purpose and shall not contain session values, MFA codes, provider secrets, raw credential payloads, or unnecessary Identity data. | KROWDS-PRD-022 | Payload review and automated tests |
| KROWDS-SRS-057 | Email failure shall not revoke or remove an issued ticket; the authenticated account shall remain an authoritative access path. | KROWDS-PRD-022 | Failure and account-access tests |
| KROWDS-SRS-058 | Biteship webhook or retrieval events shall be backend-only, authenticated, replay-resistant, and idempotent and shall support Pending → Label Created → Picked Up → In Transit → Delivered / Failed / Cancelled plus an authorized Reshipment Pending path. | KROWDS-PRD-018, KROWDS-PRD-030 | Duplicate, replay, signature, and invalid-state tests |
| KROWDS-SRS-059 | The system shall append audit records for authentication and recovery, Identity and guardian changes, onboarding transitions, Membership changes, hierarchy publication, order/payment/refund changes, ticket issuance/holder attempts, cashier reservations, wristband fulfillment, activation, binding, device changes, break-glass, reconciliation, export, and gate attempts. | KROWDS-PRD-019, KROWDS-PRD-028, KROWDS-PRD-029 | Completeness and tamper tests |
| KROWDS-SRS-060 | An audit record shall include event ID, occurred-at UTC time, actor type and ID, active role, organization context when applicable, action, resource type and ID, outcome, reason code, request/correlation ID, and safe device or provider reference when applicable. Sensitive values shall be redacted. | KROWDS-PRD-019 | Schema and redaction tests |

### 5.10 Tenant isolation and API boundaries

| ID | Normative requirement | Source | Verification |
| --- | --- | --- | --- |
| KROWDS-SRS-061 | Tenant-owned tables shall use one shared schema in Cloud SQL for PostgreSQL and shall contain a non-null `organization_id`; the service shall not create a database or schema per tenant for the MVP. | KROWDS-PRD-020, KROWDS-BR-019 | Schema inspection |
| KROWDS-SRS-062 | RLS shall be enabled for every tenant-owned table and shall deny access when trusted organization context is absent or does not match the row. | KROWDS-PRD-020 | Direct database negative tests |
| KROWDS-SRS-063 | The backend shall derive tenant context from the authenticated User and authorized Membership, never from an untrusted client-supplied organization identifier alone. | KROWDS-PRD-020 | Request-tampering tests |
| KROWDS-SRS-064 | Application authorization and RLS shall both be enforced; passing one check shall not compensate for failure of the other. | KROWDS-PRD-020 | Layered-control tests |
| KROWDS-SRS-065 | Privileged Platform Admin and KREW access across organizations shall use explicit policies, minimum required fields, and an audit record. | KROWDS-PRD-024, KROWDS-PRD-028 | Privileged query tests |
| KROWDS-SRS-066 | All frontend-to-backend operations shall use `@krowds/api`; Next.js applications shall contain no route handlers, Server Actions, backend middleware logic, database access, queues, or backend-only SDK integration. The backend shall remain one Go + Gin codebase and binary. | KROWDS-BR-019, KROWDS-BR-021 | Architecture test and repository review |
| KROWDS-SRS-067 | Mutating payment, refund, pre-payment ticket-holder, stock reservation, binding, activation, device, break-glass, and access operations shall require an idempotency key or an equivalent server-generated deduplication mechanism. | KROWDS-PRD-010, KROWDS-PRD-013, KROWDS-PRD-015, KROWDS-PRD-026, KROWDS-PRD-028 | Replay tests |
| KROWDS-SRS-068 | API errors shall use a stable machine code and safe message, shall not expose stack traces, SQL, provider secrets, raw Identity data, or another tenant's existence. | KROWDS-PRD-020, KROWDS-PRD-024 | Error-contract and disclosure tests |
| KROWDS-SRS-069 | Ticket issuance shall reject a duplicate active holder Identity for the same Event/Ticket Product/Session combination. An Identity may hold up to five active tickets for the same Event when the product/session combination differs. | KROWDS-PRD-003, KROWDS-PRD-025, KROWDS-PRD-032 | Duplicate-identity, five-ticket-limit, and concurrency tests |
| KROWDS-SRS-070 | The target deployment shall use Cloud Run for API, worker, and scheduled roles from one Go + Gin binary; Memorystore, Cloud Tasks, Cloud Scheduler, Cloud Storage, Secret Manager, Cloud Logging, Error Reporting, Monitoring, and BigQuery shall remain behind Go-owned workflows and contracts. | KROWDS-PRD-027, KROWDS-PRD-029 | Architecture, configuration, and failure-path tests |
| KROWDS-SRS-071 | A Gate device shall have Pending Registration, Active, Suspended, Disabled, or Revoked state and shall be bound to one Organization and authorized Gate operator context. Only permitted transitions shall commit. | KROWDS-PRD-026, KROWDS-PRD-030 | Device lifecycle and authorization tests |
| KROWDS-SRS-072 | KREW break-glass shall require active KREW authorization and MFA, a purpose code, an approved time-bounded window, and complete audit. It shall not set payment state, register or impersonate a Gate device, grant access, activate a batch before delivery, or bypass single-use enforcement. | KROWDS-PRD-028 | Privileged workflow and prohibited-action tests |
| KROWDS-SRS-073 | BigQuery export shall carry safe audit and operational fields plus request/correlation references and shall remain replayable and queryable without becoming an authorization or transactional system of record. | KROWDS-PRD-029 | Export completeness, privacy, and replay tests |
| KROWDS-SRS-074 | The system shall provide a distinct manual KREW consumer identity review workflow with queue, claim, correction, approval, rejection, expiry, and audit states. Initial review target is 1 business day, correction target is 2 business days, and an unresolved case expires after 30 calendar days. A ticket or binding operation shall reject an identity that is not currently approved. | KROWDS-PRD-031, KROWDS-BR-025 | Identity-review state, SLA, expiry, authorization, redaction, and issuance tests |
| KROWDS-SRS-075 | Provider calls shall use a connect timeout no greater than 3 seconds, read timeout no greater than 10 seconds, at most 3 synchronous attempts, and at most 5 asynchronous attempts before dead-letter; retries use bounded exponential backoff with jitter and an idempotency key for non-idempotent operations. | KROWDS-PRD-027, KROWDS-PRD-029 | Fault-injection, retry, and dead-letter tests |
| KROWDS-SRS-076 | The API shall use cursor pagination with default 25 and maximum 100 items, RFC 7807 errors, a 24-hour client idempotency window, a 5-minute webhook freshness window, and a 30-day provider-event deduplication index. | KROWDS-PRD-020, KROWDS-PRD-029 | API contract, cursor, replay, and retention tests |
| KROWDS-SRS-077 | Passwords shall use a modern adaptive hash, require at least 12 characters, allow passphrases, block known breached passwords, and shall not require periodic rotation. Idle/access timeout is 15 minutes and privileged changes require reauthentication. | KROWDS-PRD-001, KROWDS-PRD-002 | Authentication, password, session, and reauthentication tests |
| KROWDS-SRS-078 | Sensitive role, organization-approval, identity-export, refund, batch-activation, credential-revocation, and break-glass actions shall require step-up authentication; KREW break-glass, Restricted exports, and exceptional refunds shall require dual approval. | KROWDS-PRD-002, KROWDS-PRD-019, KROWDS-PRD-028 | Step-up, dual-control, and audit tests |
| KROWDS-SRS-079 | Onboarding document uploads shall accept PDF/JPEG/PNG only, maximum 10 MB per file and 20 files per submission, reject executable/archive content, use private encrypted storage, and audit upload/download access. | KROWDS-PRD-004, KROWDS-PRD-027 | Upload validation, malware-control boundary, access, and audit tests |
| KROWDS-SRS-080 | Account closure shall immediately revoke sessions and stop optional processing, provide an export path before closure, and apply the canonical retention/deletion matrix with legal-hold exceptions. | KROWDS-PRD-001, KROWDS-PRD-030 | Closure, export, deletion, and legal-hold tests |
| KROWDS-SRS-081 | Product analytics shall be disabled by default without explicit consent; BigQuery shall contain only approved aggregate or HMAC-SHA-256 pseudonymous events and shall not contain raw identity, payment, or QR values. | KROWDS-PRD-029, KROWDS-PRD-030 | Consent, schema, pseudonymization, and re-identification tests |
| KROWDS-SRS-082 | Frontend releases shall meet LCP p75 at or below 2.5 seconds, INP p75 at or below 200 ms, CLS p75 at or below 0.1, and authenticated ticket/account usable-state p95 at or below 3 seconds on supported mobile and desktop profiles. | KROWDS-PRD-034 | Performance and field-measurement tests |
| KROWDS-SRS-083 | Payment-to-ticket availability shall meet p95 30 seconds and maximum 2 minutes, notification acceptance p95 60 seconds, and valid batch activation p95 10 seconds; reports and exports remain asynchronous. | KROWDS-PRD-034 | Workflow latency and failure-path tests |
| KROWDS-SRS-084 | Global tables shall be explicitly allow-listed with backend service policy, while every tenant table uses non-null `organization_id` and forced RLS. No unscoped tenant exception is permitted. | KROWDS-PRD-020, KROWDS-PRD-027 | RLS inventory and cross-tenant tests |

## 6. Interface requirements

### 6.1 User-facing interfaces

- Web, Auth, KREW, Organization, and PWA interfaces shall consume backend contracts through `@krowds/api`.
- The MVP UI and API-facing product copy shall be English-first; later localization requires an approved decision.
- Gate and Redemption interfaces shall require a live backend decision; local client state may display the last response but shall not authorize admission.
- Gate access shall originate from an active registered device and authorized Gate user.
- Interfaces shall show only actions permitted by the single fixed role on the active Membership and selected organization.
- Interfaces shall not offer post-payment ticket transfer, partial refund, manual digital-payment confirmation, custom role, Branch, re-entry, multi-use, offline grant, or COD controls.
- The account ticket view shall remain usable when Resend delivery fails.
- No consumer identity-document image upload control shall be presented in the MVP.

### 6.2 Backend interface

- The Go + Gin backend shall expose versioned HTTPS contracts and remain one codebase and binary, with API, worker, and scheduled execution roles deployed on Cloud Run.
- Mutating high-risk endpoints shall authenticate, authorize, validate tenant context, enforce idempotency, commit atomically, and append audit evidence.
- Browser sessions shall use secure HttpOnly SameSite cookies and rotating refresh credentials; access is 15 minutes, refresh is 30 days, recovery is 24 hours, and revocation is immediate.
- Time inputs shall be ISO 8601 UTC; IDR amounts shall be integer rupiah values represented as exact decimal strings at the API boundary.
- List endpoints shall use bounded cursor pagination with default page size `25` and maximum `100`; invalid, cross-tenant, or incompatible cursors return `400 INVALID_CURSOR`.
- API field-level compatibility and deprecation policy shall be documented in the API contract before external integration. Backward-compatible changes remain in `v1`; breaking changes require a new major URI version and a 90-day deprecation window. OpenAPI 3.1 is validated in CI.

### 6.3 Xendit

- The backend shall authenticate and replay-protect provider events according to Xendit's current supported mechanism.
- Payment creation, notification, status, expiry, and refund references shall be persisted and correlated. Online instructions expire after 30 minutes and cashier instructions after 15 minutes.
- Processing shall be idempotent and tolerant of duplicate, delayed, and out-of-order events.
- KROWDS shall store no raw card data; Xendit payment data remains tokenized at the provider boundary.
- The product shall not claim a payment is paid solely because the browser returned to a success URL.

### 6.4 Resend

- The backend shall create and track approved OTP, recovery, invitation, onboarding/revision, payment, e-ticket, shipping, activation, and security messages through the dedicated Resend transactional subdomain and process available delivery status. The accepted route-class limits and suppression baseline apply; provider evidence may tighten them.
- The frontend shall not hold Resend credentials.
- Payment reconciliation runs daily with weekly Finance sign-off; provider retry and suppression behavior follows the accepted bounded-retry and suppression baseline, with provider evidence required for any exception.

### 6.5 Biteship

- The backend shall create only domestic, organization-paid shipments and shall not request COD.
- The backend shall persist Biteship label, shipment, tracking, delivery, and KREW-approved reshipment references and process authenticated, replay-resistant, idempotent status events.
- The browser shall not hold Biteship credentials.

### 6.6 Google Cloud platform services

- Cloud SQL PostgreSQL shall be the transactional system of record and enforce tenant RLS.
- Memorystore may support cache, rate limits, short-lived locks, and idempotency coordination but shall not become an authoritative business record.
- Cloud Tasks and Cloud Scheduler shall invoke Go-owned jobs through authenticated service identity; browser access is prohibited.
- Cloud Storage shall hold private legal documents, artwork, production CSVs, and exports with tenant-scoped object references and approved retention.
- Secret Manager shall hold provider and runtime secrets; no secret shall be embedded in frontend bundles, source, logs, or BigQuery.
- Cloud Logging, Error Reporting, and Monitoring shall receive safe operational telemetry.
- BigQuery shall receive governed audit, reconciliation, and operational datasets and shall not authorize business operations.

## 7. Data requirements

### 7.1 Core entities

| Entity | Required relationships and controls |
| --- | --- |
| User | Account identity, authentication references, profile, current staff status; not a tenant row by itself |
| Identity | Normalized person data, validation result, and holder references; minimal fields are type, number, and full legal name, with 24-month review evidence retention |
| Organization | Tenant root, onboarding state, legal and financial metadata, review references |
| Membership | User, Organization, exactly one fixed role, invitation and lifecycle state; tenant-scoped |
| Venue | One Organization; no Branch parent |
| Event | One Venue; publication and sale rules |
| Activity | Optional child of one Event |
| Session | One Event and zero or one Activity; when present, the Activity shall belong to the same Event |
| TicketProduct | Event scope, optional Activity/Session scope, IDR price, capacity, sales window, inventory and validity policy |
| Order | Tenant, buyer, channel, IDR total, payment state, idempotency and correlation data |
| GuardianRelationship | Minor holder Identity, verified guardian User/Identity, relationship declaration, and explicit consent evidence; legal wording and event-specific evidence TBD |
| Ticket | One order, product scope, one holder Identity, optional guardian evidence, opaque credential, state and use evidence |
| PaymentAttempt | Order, channel, Xendit references, authoritative state, timestamps; no raw card data or secrets |
| Refund | One full-order trajectory, Xendit references, state, reason and actor context |
| WristbandBatch | Optional for stock, present for new production; order, private CSV object, production, fulfillment, shipment and activation references |
| Wristband | Optional batch, unique code, QR token hash, state, reservation and binding |
| Binding | One Ticket, one holder Identity, one Wristband, entitlement, redemption actor and time |
| RegisteredGateDevice | Organization, device reference, lifecycle state, safe fingerprint and audit context |
| AccessAttempt | Wristband, ticket, registered device, gate context, operator, result, reason and time |
| Shipment | Biteship label/shipment/tracking/reshipment references, domestic destination, organization-paid status and canonical state |
| AuditEvent | Required KROWDS-SRS-060 fields, tamper-evident linkage, and BigQuery export reference |

### 7.2 Tenant data rules

- Every tenant-owned row shall have a non-null `organization_id` and reference only resources in the same organization where a cross-resource relationship exists.
- Database constraints shall support uniqueness and single-binding invariants in addition to application checks.
- The backend shall set trusted tenant context within the database transaction or equivalent safe scope before tenant queries execute.
- Pooled connections shall not retain one request's tenant context for a later request; this is a release-blocking test.
- RLS policies shall apply to direct database access as well as application access.

### 7.3 Credential data rules

- QR payloads and activation codes shall use cryptographically strong, non-sequential values.
- A wristband QR token shall contain at least 128 bits of entropy. Transactional credential records shall store only its hash; the private production CSV is the controlled issuance artifact that contains `qr_payload`.
- Human-readable wristband codes shall be unique within the organization; global uniqueness is not required. QR token hashes remain globally unique.
- QR payloads, access logs, and analytics shall not contain direct personal, financial, or entitlement fields; the production CSV shall contain only its approved schema fields and no PII.
- Ticket and wristband corrections shall create a new governed resource or an audited administrative action; in-place credential reuse after issuance is prohibited.

### 7.4 Validation and lifecycle

- Foreign keys, unique constraints, check constraints, and state-transition validation shall reject invalid combinations.
- The canonical high-level models are Order: Created → Pending → Paid / Failed / Cancelled → Refunded; Ticket: Issued → Reserved → Bound → Used / Expired / Cancelled / Revoked; Shipment: Pending → Label Created → Picked Up → In Transit → Delivered / Failed / Cancelled / Reshipment Pending; and Access: Access Granted / Access Denied.
- Monetary total shall equal the sum of authoritative tax-inclusive ticket line amounts; Xendit fees are organization pass-through operating cost, and customer invoice/tax wording remains subject to Finance/Legal approval.
- A full refund request shall fail validation when any ticket is Bound or Used, after the 7-day request window it shall enter `exceptional_review` for a dual-approved Finance decision, and an accepted request shall release any active reservation atomically.
- Deletion shall be logical and policy-driven where financial, ticket, or audit evidence must remain. Retention follows the tiered baseline in `PRIVACY.md`; anonymization and legal holds remain controlled workflows.
- Development, test, and pilot environments shall use approved synthetic or masked data; production PII shall not be copied by default.

## 8. Failure and recovery

| Failure | Detection | System behavior | Recovery / fallback |
| --- | --- | --- | --- |
| Xendit unavailable at payment creation | Provider error/timeout | Keep order Pending; no ticket | Retry with the same idempotency key; expire only under provider/order policy |
| Duplicate or delayed Xendit event | Provider reference/event deduplication | Apply once when valid; retain event evidence | Reconcile by provider reference; never manual-set paid |
| Refund provider failure | Verified failed/rejected state | No manual settlement; affected tickets remain non-usable pending approved resolution | Keep the refund in reconciliation; no automatic restoration; provider/Finance resolution evidence required |
| Resend unavailable or delivery failure | Provider response/status | Account ticket access remains available; record failed status | User retry from account; support uses correlation reference |
| Biteship unavailable | Provider error/timeout | Keep shipment in last verified state; do not claim shipment, delivery, or reshipment | Retry idempotently; manual operational correction is not an authoritative state |
| Cloud SQL unavailable or RLS context failure | Database health/error and pool telemetry | Fail closed for durable tenant operations; do not bypass RLS or use a personal database | Restore/recover Cloud SQL, investigate context leakage, and replay safe workflows idempotently |
| Memorystore or Cloud Tasks unavailable | Coordination/task telemetry | Do not accept unsafe duplicate mutation; keep asynchronous work pending | Use approved durable coordination or retry; preserve idempotency and request correlation |
| Cloud Storage or Secret Manager unavailable | Provider access error | Do not expose or substitute an embedded secret; keep protected workflow pending | Recover access/secret through approved operations and retry idempotently |
| BigQuery export delayed | Export backlog/error | Cloud SQL and append-oriented audit records remain authoritative; do not block the committed business transaction unless policy requires the export | Replay the export and reconcile event references |
| Registered gate device inactive or mismatched | Device state and organization validation | Return Access Denied and audit without marking the ticket or wristband Used | Recover or register the device through the approved Gate workflow |
| Duplicate scan under concurrency | Transaction/unique constraint | At most one binding or successful admission commits | Return deterministic busy/already-processed result |
| Gate network or backend outage | Client timeout/unavailable response | Deny live grant and show Temporarily Unavailable; no offline credential | Retry with a 3-second client timeout and at most two exponential-backoff retries, then invoke approved continuity process |
| Cross-tenant request | Authorization/RLS denial | No protected data or existence disclosure; audit denial | Correct Membership or use audited privileged path if approved |
| Database context leakage | Pooled-connection isolation test | Fail release; block affected access if detected | Rebuild connections, revoke context, investigate audit evidence |
| Audit append fails with a material mutation | Transaction dependency | Roll back the material mutation or enter a durable failure path; never silently continue | Retry under the same correlation ID and alert operations |
| Partial ticket issuance | Idempotency and count reconciliation | Keep order issuance incomplete and unavailable to users | Resume issuance to exact paid quantity; no duplicate ticket |
| Identity validation unavailable | Dependency failure | Do not issue a ticket with unresolved required validation | Retry or route to the approved manual review process; no provisional ticket or automatic approval; audit the failure |

## 9. Constraints

- The backend is one Go + Gin modular-monolith codebase and binary on Cloud Run; business modules remain in-process.
- Cloud SQL PostgreSQL, Memorystore, Cloud Tasks, Cloud Scheduler, Cloud Storage, Secret Manager, Cloud Logging, Error Reporting, Monitoring, and BigQuery are the selected target platform services.
- Next.js is frontend-only and has a fixed backend contract through `@krowds/api`.
- Tenant isolation is a shared-schema Cloud SQL PostgreSQL design with `organization_id` and RLS.
- The hierarchy has no Branch.
- Payments are Xendit IDR-only; cashier is QRIS-only.
- Digital money state is not manually confirmed.
- Refunds are full-order only and are prohibited after any ticket is Bound or Used.
- Email is Resend.
- Domestic Biteship shipping is organization-paid, supports the approved tracking/delivery/reshipment flow, and has no COD.
- KREW, Platform Admin, Finance, and Organization Admin accounts require MFA for privileged permissions; other staff roles follow the approved role-risk policy.
- Consumer identity-document images, automated identity/liveness, and OCR are excluded.
- The MVP is online-first and uses single-use tickets with online gate validation.

## 10. Open specifications

External legal, provider, infrastructure, physical, and evidence gates are maintained centrally in [OPEN-DECISIONS.md](../00-governance/OPEN-DECISIONS.md). The rows below are the software-phase view.

| ID | Decision required | Owner | Needed by |
| --- | --- | --- | --- |
| KROWDS-SRS-Q-001 | Legal wording and exceptional rejection/revision policy for the confirmed onboarding document set and 2-business-day SLA | KROWDS Operations and Legal Owners (personal names TBD) | Phase 1 |
| KROWDS-SRS-Q-002 | Legal notice and correction-evidence wording for minimal identity fields, one active ticket per Identity/Event/Ticket Product/Session, five active tickets per Identity/Event, and 24-month review retention | Identity and Legal Owners (personal names TBD) | Phase 1 |
| KROWDS-SRS-Q-003 | Event-specific publication and scheduling rules within the fixed hierarchy; tracked by `KROWDS-OD-026` | Product Owner (personal name TBD) | Phase 2 |
| KROWDS-SRS-Q-004 | Customer-facing tax-invoice, fee, exceptional-refund, and settlement wording; 7-day window, tax-inclusive display, daily reconciliation, weekly sign-off, and ticket limits are fixed | Finance, Legal, and Product Owners (personal names TBD) | Phase 2 |
| KROWDS-SRS-Q-005 | Guardian consent text and event-specific evidence rules; under-18 account/declaration/consent baseline is fixed | Product, Identity, and Legal Owners (personal names TBD) | Phase 2 |
| KROWDS-SRS-Q-006 | Physical print/material parameters, minimum order, venue fulfillment time, and evidence for the organization-scoped code policy; format/length/collision behavior is tracked by `KROWDS-OD-028`; 30m/15m reservation expiry, approved Biteship allowlist/live quote/KREW reshipment, and 30-unit physical sample baseline are fixed | KROWDS Operations Owner (personal name TBD) | Phase 3 |
| KROWDS-SRS-Q-007 | Generate and approve the OpenAPI 3.1 artifact and complete contract tests; pagination 25/100, RFC 7807, 90-day deprecation, rate limits, provider timeouts, secure-cookie path, and 3-second gate timeout are fixed | Technical Owner (personal name TBD) | Before integration freeze |
| KROWDS-SRS-Q-008 | Venue continuity wording, named support escalation contacts, and any non-credential operational workaround; fail-closed device behavior and P1/P2/P3 incident targets are fixed | Gate Operations Owner (personal name TBD) | Phase 4 |
| KROWDS-SRS-Q-009 | GCP quotas, service tiers, cost budgets, CMEK, and legal residency evidence; single-region target and secure-cookie gateway are fixed | Platform, Security, and Legal Owners (personal names TBD) | Before production infrastructure approval |
| KROWDS-SRS-Q-010 | Provider/venue measurements and statutory interpretation; confirmed availability, performance, pilot capacity, RPO/RTO, backup, retention, and WCAG baselines must be evidenced | Technical, Data, and Legal Owners (personal names TBD) | Phase 4 |

## 11. Traceability

| PRD requirement | SRS requirements |
| --- | --- |
| KROWDS-PRD-001, KROWDS-PRD-002 | KROWDS-SRS-001 through KROWDS-SRS-004 |
| KROWDS-PRD-003, KROWDS-PRD-025 | KROWDS-SRS-005, KROWDS-SRS-006, KROWDS-SRS-029, KROWDS-SRS-048, KROWDS-SRS-069 |
| KROWDS-PRD-004, KROWDS-PRD-005 | KROWDS-SRS-007 through KROWDS-SRS-010 |
| KROWDS-PRD-006, KROWDS-PRD-024 | KROWDS-SRS-011 through KROWDS-SRS-014, KROWDS-SRS-035, KROWDS-SRS-048, KROWDS-SRS-050, KROWDS-SRS-064 |
| KROWDS-PRD-007 | KROWDS-SRS-015, KROWDS-SRS-016 |
| KROWDS-PRD-008 | KROWDS-SRS-017 through KROWDS-SRS-019 |
| KROWDS-PRD-009, KROWDS-PRD-010, KROWDS-PRD-015 | KROWDS-SRS-020 through KROWDS-SRS-026, KROWDS-SRS-036 through KROWDS-SRS-039 |
| KROWDS-PRD-011, KROWDS-PRD-012, KROWDS-PRD-013, KROWDS-PRD-023 | KROWDS-SRS-026, KROWDS-SRS-029 through KROWDS-SRS-035, KROWDS-SRS-043, KROWDS-SRS-047, KROWDS-SRS-049, KROWDS-SRS-051 through KROWDS-SRS-054 |
| KROWDS-PRD-014 | KROWDS-SRS-027, KROWDS-SRS-028 |
| KROWDS-PRD-016, KROWDS-PRD-017, KROWDS-PRD-018 | KROWDS-SRS-040 through KROWDS-SRS-046, KROWDS-SRS-058 |
| KROWDS-PRD-019 | KROWDS-SRS-053, KROWDS-SRS-059, KROWDS-SRS-060 |
| KROWDS-PRD-020 | KROWDS-SRS-016, KROWDS-SRS-061 through KROWDS-SRS-065 |
| KROWDS-PRD-021, KROWDS-PRD-030 | KROWDS-SRS-025, KROWDS-SRS-034, KROWDS-SRS-046, KROWDS-SRS-058, KROWDS-SRS-071, and section 7.4 |
| KROWDS-PRD-022 | KROWDS-SRS-045, KROWDS-SRS-055 through KROWDS-SRS-057 |
| KROWDS-PRD-026, KROWDS-PRD-028 | KROWDS-SRS-050, KROWDS-SRS-054, KROWDS-SRS-065, KROWDS-SRS-067, KROWDS-SRS-071, KROWDS-SRS-072 |
| KROWDS-PRD-027 | KROWDS-SRS-066, KROWDS-SRS-070, and section 6.6 |
| KROWDS-PRD-029 | KROWDS-SRS-060, KROWDS-SRS-070, KROWDS-SRS-073 |
| KROWDS-PRD-031 | KROWDS-SRS-006, KROWDS-SRS-074 |
| KROWDS-PRD-032 | KROWDS-SRS-017, KROWDS-SRS-035, KROWDS-SRS-048 |
| KROWDS-PRD-033 | KROWDS-SRS-001, KROWDS-SRS-004, KROWDS-SRS-064 |
| KROWDS-PRD-034 | KROWDS-SRS-016, KROWDS-SRS-021, KROWDS-SRS-037, KROWDS-SRS-052, KROWDS-SRS-058, KROWDS-SRS-070 |

Detailed test cases shall be assigned in `TEST-PLAN.md` or approved test specifications before status changes from Draft. Architecture decisions and data detail shall be linked when those documents are completed.

## 12. Approval

| Role | Name | Decision | Date |
| --- | --- | --- | --- |
| Product Owner | TBD | Approve / Reject | TBD |
| Technical Owner | TBD | Approve / Reject | TBD |
| Data and Security Owner | TBD | Approve / Reject | TBD |
| KROWDS Operations Owner | TBD | Approve / Reject | TBD |
| Finance Owner | TBD | Approve / Reject | TBD |
| Legal Owner | TBD | Approve / Reject | TBD |
