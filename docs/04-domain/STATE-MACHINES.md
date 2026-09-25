# KROWDS-SM-001 — State Machines

## Metadata

| Field | Value |
| --- | --- |
| Document ID | `KROWDS-SM-001` |
| System / module | KROWDS domain workflows |
| Version | `0.1` |
| Status | `Draft` |
| Release label | `0.1 Draft` |
| Owner | Operations and Backend Lead (TBD) |
| Last updated | `2026-09-24` |

## 1. Purpose and conventions

This document defines the allowed state changes for KROWDS workflows. A state is an authoritative value in PostgreSQL, not a UI label. A transition is successful only when its guard, authorization check, concurrency check, and audit write complete in the same business transaction or durable workflow.

- `KROWDS-SM-REQ-001` — State values use lowercase snake case in the API and database. A human-readable label may capitalize words for display.
- `KROWDS-SM-REQ-002` — Every state-changing request shall carry a request ID and shall write an audit event containing the previous state, next state, actor, organization when applicable, and reason.
- `KROWDS-SM-REQ-003` — Repeated commands with the same idempotency key shall return the original result and shall not repeat side effects.
- `KROWDS-SM-REQ-004` — A transition shall not cross an organization boundary. RLS and same-organization foreign-key checks are mandatory.
- `KROWDS-SM-REQ-005` — A credential scan shall evaluate the current authoritative state at scan time; it shall not rely on a cached UI state or a previous access decision.
- `KROWDS-SM-REQ-006` — Terminal states have no implicit outgoing transition. A replacement, refund, or reactivation creates a new business record and preserves the old history.
- `KROWDS-SM-REQ-007` — All timestamps in transition tables are stored as UTC instants and displayed in the record’s explicit IANA time zone when needed.
- `KROWDS-SM-REQ-008` — The MVP is online-first, IDR-only, and single-use. Ticket transfer, re-entry, multi-use, and offline gate access are not valid transitions or outcomes.

`Confirmed` means the transition is part of the v0.1 target. `Operational guard` describes a condition that must be true before the transition can be attempted. An invalid transition returns `409 RESOURCE_CONFLICT` or the endpoint-specific problem code and does not change data. In transition actor fields, `owner` and `admin` are capability labels within the single `organization_owner_admin` Membership role; they are not separate organization Membership roles. Any transition implementing a sensitive action in `SECURITY.md` or `SRS.md` also requires the documented MFA, step-up, or dual-approval control even when the table uses a short guard phrase.

## 2. State inventory

| Machine ID | Machine | Primary states | Owner role |
| --- | --- | --- | --- |
| `KROWDS-SM-ORG-001` | Organization onboarding and verification | `draft`, `submitted`, `under_review`, `revision_required`, `approved`, `rejected`, `suspended`, `closed` | Organization Product Owner (TBD) |
| `KROWDS-SM-MEM-001` | Membership and invitation | `invited`, `active`, `suspended`, `revoked`, `declined`, `expired` | Organization Product Owner (TBD) |
| `KROWDS-SM-IDR-001` | Consumer identity review | `pending`, `in_review`, `revision_required`, `approved`, `rejected`, `expired` | KREW Operations Lead (TBD) |
| `KROWDS-SM-GATE-001` | Registered gate device | `pending_registration`, `active`, `suspended`, `disabled`, `revoked` | Access Control Product Owner (TBD) |
| `KROWDS-SM-WO-001` | Wristband order | `draft`, `submitted`, `payment_pending`, `paid`, `verification_pending`, `revision_required`, `approved`, `production`, `quality_control`, `quarantined`, `shipped`, `delivered`, `completed`, `cancelled`, `payment_failed` | Wristband Operations Owner (TBD) |
| `KROWDS-SM-BAT-001` | Wristband production batch | `created`, `production`, `quality_control`, `quarantined`, `shipped`, `delivered`, `activation_pending`, `activated`, `revoked`, `void` | Wristband Operations Owner (TBD) |
| `KROWDS-SM-SHIP-001` | Domestic wristband shipment | `pending`, `label_created`, `picked_up`, `in_transit`, `delivered`, `failed`, `cancelled`, `reshipment_pending` | Fulfillment Operations Owner (TBD) |
| `KROWDS-SM-STK-001` | Wristband stock movement | `planned`, `reserved`, `in_production`, `in_stock`, `available`, `bound`, `active`, `used`, `expired`, `disabled`, `quarantined`, `revoked`, `written_off` | Wristband Operations Owner (TBD) |
| `KROWDS-SM-WB-001` | Individual wristband | `generated`, `production`, `quality_control`, `quarantined`, `shipped`, `delivered`, `available`, `reserved`, `bound`, `active`, `used`, `expired`, `disabled`, `revoked` | Wristband Operations Owner (TBD) |
| `KROWDS-SM-PAY-001` | Digital payment | `created`, `pending`, `authorized`, `paid`, `failed`, `expired`, `refunded` | Commerce Product Owner (TBD) |
| `KROWDS-SM-REF-001` | Full-order refund | `requested`, `exceptional_review`, `processing`, `succeeded`, `failed`, `cancelled`, `rejected` | Finance Product Owner (TBD) |
| `KROWDS-SM-TKT-001` | Ticket | `pending_payment`, `issued`, `reserved`, `bound`, `used`, `expired`, `cancelled`, `refunded`, `revoked` | Ticketing Product Owner (TBD) |
| `KROWDS-SM-RED-001` | Ticket redemption and binding | `scanned`, `verified`, `bound`, `released`, `rejected`, `already_bound`, `expired` | Redemption Operations Owner (TBD) |
| `KROWDS-SM-ACC-001` | Access attempt | `received`, `validating`, `access_granted`, `access_denied`, `access_error`, `logged` | Access Control Product Owner (TBD) |
| `KROWDS-SM-WH-001` | Verified webhook inbox | `received`, `verified`, `queued`, `processing`, `processed`, `ignored`, `ignored_duplicate`, `rejected`, `retrying`, `dead_letter` | Integration Platform Owner (TBD) |

## 3. Organization onboarding and verification

### 3.1 State meanings

- `draft`: The organization can edit onboarding data but cannot use operational features.
- `submitted`: Required fields and consent were accepted and the submission is waiting for KREW review.
- `under_review`: KREW has claimed the submission for verification.
- `revision_required`: KREW returned a non-destructive correction request. The organization may edit and resubmit.
- `approved`: The organization may use operational features within its memberships.
- `rejected`: The submission is closed; the organization must create a new reviewable submission or reopen it through an authorized KREW action.
- `suspended`: KROWDS temporarily removed operational access without deleting the organization.
- `closed`: The organization is permanently closed and read-only for approved audit purposes.

### 3.2 Transition table

| Transition ID | From | Trigger | Operational guard | To | Actor | Required side effect |
| --- | --- | --- | --- | --- | --- | --- |
| `KROWDS-SM-TR-001` | none | Create organization | Authenticated user has a verified account | `draft` | User | Create tenant root and owner membership invitation |
| `KROWDS-SM-TR-002` | `draft` | Submit onboarding | Required organization, legal, responsible-person, financial, and consent fields are present | `submitted` | `owner` or `admin` | Freeze the submitted version and audit it |
| `KROWDS-SM-TR-003` | `submitted` | Start review | Submission is not already claimed by another KREW reviewer | `under_review` | KREW `operations` or `admin` | Record reviewer and request ID |
| `KROWDS-SM-TR-004` | `under_review` | Request revision | Reviewer supplies a controlled reason and field notes | `revision_required` | KREW `operations` or `admin` | Redact document values from ordinary reviewer responses |
| `KROWDS-SM-TR-005` | `revision_required` | Resubmit | Corrections are saved and required consent is current | `under_review` | `owner` or `admin` | Create a new submission version; retain the prior version |
| `KROWDS-SM-TR-006` | `under_review` | Approve | Review checks and legal fields pass | `approved` | KREW `operations` or `admin` | Set `approved_at` and enable scoped operations |
| `KROWDS-SM-TR-007` | `under_review` | Reject | Reviewer supplies a non-empty reason | `rejected` | KREW `operations` or `admin` | Disable operations and preserve review history |
| `KROWDS-SM-TR-008` | `rejected` | Reopen | Authorized KREW role records a reason | `draft` | KREW `operations` or `admin` | Start a new correction cycle; do not erase the rejection |
| `KROWDS-SM-TR-009` | `approved` | Suspend | A security, loss, fraud, or compliance reason is present | `suspended` | KREW `admin` | Revoke operational access and notify authorized owners |
| `KROWDS-SM-TR-010` | `suspended` | Restore | Review confirms the suspension is resolved | `approved` | KREW `admin` | Restore only memberships that remain active |
| `KROWDS-SM-TR-011` | `approved` or `suspended` | Close | Closure reason and legal-hold decision are recorded | `closed` | KREW `admin` | Make organization data read-only except approved erasure workflows |

## 4. Membership and invitation lifecycle

A membership grants organization permissions; it does not create a second user account. An invitation may be accepted by a user who already has an account or by a user who registers after following the invitation flow.

| Transition ID | From | Trigger | Operational guard | To | Actor | Required side effect |
| --- | --- | --- | --- | --- | --- | --- |
| `KROWDS-SM-TR-020` | none | Create invitation | Organization owner/admin selects one role; invitation token is hashed | `invited` | `owner` or `admin` | Write invitation and audit event |
| `KROWDS-SM-TR-021` | `invited` | Accept | Invitee identity matches the invitation target and expiry has not passed | `active` | Invitee user | Create or activate membership; consume invitation once |
| `KROWDS-SM-TR-022` | `invited` | Decline | Invitee explicitly declines | `declined` | Invitee user | Consume invitation and retain decision history |
| `KROWDS-SM-TR-023` | `invited` | Expire | `expires_at` is in the past | `expired` | System job | Expire token and prevent acceptance |
| `KROWDS-SM-TR-024` | `active` | Suspend | Administrator records a reason | `suspended` | `owner` or `admin` | Remove effective permissions immediately |
| `KROWDS-SM-TR-025` | `suspended` | Restore | Owner/admin confirms restoration | `active` | `owner` or `admin` | Re-enable only the assigned role |
| `KROWDS-SM-TR-026` | `active` or `suspended` | Revoke | Owner/admin or KREW `admin` records a reason | `revoked` | `owner`, `admin`, or KREW `admin` | Remove access immediately; preserve audit history |

`revoked`, `declined`, and `expired` are terminal for that invitation or membership. A later role grant uses a new invitation or an explicit new membership transition.

## 4.1 Consumer identity review lifecycle

Consumer identity review is separate from organization onboarding. The MVP uses manual KREW review and does not accept consumer identity-document images or automated OCR/liveness decisions.

| Transition ID | From | Trigger | Operational guard | To | Actor | Required side effect |
| --- | --- | --- | --- | --- | --- | --- |
| `KROWDS-SM-TR-200` | none | Request identity review | Identity record is complete enough for review and no active case exists | `pending` | User or System | Create review request and audit event |
| `KROWDS-SM-TR-201` | `pending` | Claim review | KREW reviewer is active, case is unclaimed, and first-review target is within 1 business day | `in_review` | KREW `operations` or `admin` | Record reviewer, timestamp, and optimistic version |
| `KROWDS-SM-TR-202` | `in_review` | Request correction | Reviewer supplies a controlled reason and safe field notes | `revision_required` | KREW `operations` or `admin` | Keep identity unverified and notify the requester |
| `KROWDS-SM-TR-203` | `in_review` | Approve identity | Required fields, duplicate checks, and review policy pass | `approved` | KREW `operations` or `admin` | Set linked identity to `verified` and audit the decision |
| `KROWDS-SM-TR-204` | `in_review` | Reject identity | Reviewer supplies a controlled rejection reason | `rejected` | KREW `operations` or `admin` | Set linked identity to `rejected` and block ticket issuance |
| `KROWDS-SM-TR-205` | `revision_required` | Resubmit correction | Requester supplies corrected approved fields within 2-business-day correction target | `pending` | User or authorized operator | Increment review round and retain prior decision history |
| `KROWDS-SM-TR-206` | `pending` or `revision_required` | Expire review | No accepted decision or resubmission for 30 calendar days | `expired` | System or Scheduler | Require a new request; retain audit history |

A ticket cannot be issued or bound while its required identity is `unverified`, `pending`, `revision_required`, `rejected`, or `expired`. Reviewer notes and identity numbers are excluded from ordinary API responses and logs.

## 5. Wristband order lifecycle

The order state coordinates customer intent, verified payment, KREW review, production, fulfillment, and activation. Stock quantity and individual wristband states are tracked separately in `KROWDS-SM-BAT-001`, `KROWDS-SM-STK-001`, and `KROWDS-SM-WB-001`.

### 5.1 Transition table

| Transition ID | From | Trigger | Operational guard | To | Actor | Required side effect |
| --- | --- | --- | --- | --- | --- | --- |
| `KROWDS-SM-TR-030` | none | Create wristband order | Organization is approved; items and quantity are valid | `draft` | `owner`, `admin`, or `ticketing` | Create order and idempotency record |
| `KROWDS-SM-TR-031` | `draft` | Submit order | Event/activity references, design, material, billing, shipping, and payment data are complete | `submitted` | `owner` or `admin` | Freeze the order request for review |
| `KROWDS-SM-TR-032` | `submitted` | Start payment | Payment method is available and the wristband order is not cancelled | `payment_pending` | System or `finance` | Create a payment attempt; stock reservation is handled only by the separate ticket/cashier workflow |
| `KROWDS-SM-TR-033` | `payment_pending` | Verify payment | A verified Xendit payment event matches the payment reference | `paid` | System | Set `paid_at`; make the order reviewable |
| `KROWDS-SM-TR-034` | `payment_pending` | Payment failed | Verified provider failure or local expiry | `payment_failed` | System | Preserve failure code; no wristband production starts |
| `KROWDS-SM-TR-035` | `payment_failed` | Retry payment | A new payment attempt is created | `payment_pending` | `finance` or System | Keep the original failed attempt immutable |
| `KROWDS-SM-TR-036` | `paid` | Begin KREW verification | Payment is settled and order is not cancelled | `verification_pending` | System or KREW | Queue order for KREW review |
| `KROWDS-SM-TR-037` | `verification_pending` | Request revision | Reviewer identifies an actionable order, artwork, or production issue | `revision_required` | KREW `production` or `operations` | Store reason and return order to organization workflow |
| `KROWDS-SM-TR-038` | `revision_required` | Resubmit revision | Organization has saved the requested correction | `verification_pending` | `owner` or `admin` | Record a new order version |
| `KROWDS-SM-TR-039` | `verification_pending` | Approve order | KREW verification passes | `approved` | KREW `production` or `operations` | Authorize production-file generation |
| `KROWDS-SM-TR-040` | `approved` | Start production | At least one approved batch exists | `production` | KREW `production` | Generate or finalize wristband records and QR token hashes |
| `KROWDS-SM-TR-041` | `production` | Submit to quality control | All required units and artwork are present | `quality_control` | KREW `production` | Freeze production output for inspection |
| `KROWDS-SM-TR-042` | `quality_control` | Confirm carrier handoff | QC passed; label and verified carrier handoff evidence exist | `shipped` | KREW `fulfillment` | Record `shipped_at` and tracking reference; keep units unavailable |
| `KROWDS-SM-TR-043` | `quality_control` | Quarantine failed output | QC failure reason is present | `quarantined` | KREW `quality_control` | Prevent shipment, activation, and use |
| `KROWDS-SM-TR-044` | `quarantined` | Return for rework | KREW records a controlled rework decision | `production` | KREW `production` | Preserve the failed inspection and start a new production attempt |
| `KROWDS-SM-TR-047` | `shipped` | Confirm delivery | Biteship delivery evidence is verified and organization confirms receipt and package count | `delivered` | `owner` or `admin` | Record verified delivery and receipt; keep units unavailable and prepare batch activation |
| `KROWDS-SM-TR-048` | `delivered` | Activate batch | The corresponding wristband batch is `activation_pending` and the organization submits the valid one-time activation code | `completed` | `owner` or `admin` | Activate all eligible wristbands and reconcile stock |
| `KROWDS-SM-TR-049` | `draft`, `submitted`, `payment_pending`, `payment_failed`, `revision_required`, or `approved` | Cancel | Cancellation policy and refund decision are satisfied | `cancelled` | `owner`, `admin`, or KREW `admin` | Release order-scoped holds and preserve financial history; stock reservations remain in the separate ticket workflow |

`production`, `quality_control`, `shipped`, and `delivered` cannot transition directly to `cancelled`. A production issue follows `revision_required`, `quarantined`, or a controlled refund workflow. `completed` and `cancelled` are terminal for the order. The order projection may be `delivered` while its batch projection is `activation_pending`; the batch lifecycle remains the authoritative sequence `verified provider delivery → organization receipt → activation_pending → activated`.

## 6. Wristband production batch lifecycle

A batch is the physical production, stock, private-file, shipment, and activation unit.

| Transition ID | From | Trigger | Operational guard | To | Actor | Required side effect |
| --- | --- | --- | --- | --- | --- | --- |
| `KROWDS-SM-TR-060` | none | Create batch | Order is approved; quantity and schema version are valid | `created` | System or KREW `production` | Create batch code and unit placeholders |
| `KROWDS-SM-TR-061` | `created` | Start production | Production-file preparation and artwork are complete | `production` | KREW `production` | Generate the private CSV and wristband codes |
| `KROWDS-SM-TR-062` | `production` | Submit to QC | Row count equals physical production count | `quality_control` | KREW `production` | Lock file hash and inspection checklist |
| `KROWDS-SM-TR-063` | `quality_control` | Confirm carrier handoff | QC passed; label and verified carrier handoff evidence exist | `shipped` | KREW `fulfillment` | Record `shipped_at` and tracking reference; keep units unavailable |
| `KROWDS-SM-TR-064` | `quality_control` | Fail QC | Failure reason and affected quantity are recorded | `quarantined` | KREW `quality_control` | Invalidate affected credentials and prevent shipment |
| `KROWDS-SM-TR-065` | `quarantined` | Recheck | Rework is complete and a new inspection is recorded | `quality_control` | KREW `quality_control` | Retain the prior failed inspection |
| `KROWDS-SM-TR-066` | `quarantined` | Void | KROWDS decides the batch cannot be used | `void` | KREW `admin` | Write off stock and revoke all unit credentials |
| `KROWDS-SM-TR-067` | `shipped` | Confirm delivery | Biteship delivery evidence is verified | `delivered` | Biteship-verified event or KREW fulfillment | Keep units unavailable until activation |
| `KROWDS-SM-TR-068` | `delivered` | Prepare activation | Verified Biteship evidence is recorded and organization confirms physical receipt and package count | `activation_pending` | `owner` or `admin` | Store activation challenge metadata without plaintext code |
| `KROWDS-SM-TR-069` | `activation_pending` | Verify activation code | Code matches the current batch hash and is unused | `activated` | `owner` or `admin` | Move eligible units to `available` in one transaction |
| `KROWDS-SM-TR-070` | `activation_pending` | Reject code | Code is invalid, expired, or already consumed | `delivered` | System | Keep batch unavailable and audit the failed attempt |
| `KROWDS-SM-TR-071` | `activated` | Revoke batch | Security, loss, or fraud event is confirmed | `revoked` | KREW `admin` or `organization_owner_admin` | Revoke every unit credential and deny access immediately |
| `KROWDS-SM-TR-072` | `created`, `production`, or `quality_control` | Void pre-shipment batch | KROWDS records a void reason | `void` | KREW `admin` | Write off stock and prevent later shipment |

The private production file uses the exact header `batch_id,wristband_code,qr_payload,schema_version`, is stored privately, and contains no PII. The batch state never becomes `activated` solely because a file was downloaded or a payment was confirmed.

## 7. Wristband stock lifecycle

Stock is represented by an append-only ledger and a derived balance. The ledger is not a mutable count, so retries cannot create phantom inventory.

The two explicit inventory paths are:

```text
Existing stock: available -> reserved -> bound -> active -> used / expired / disabled / revoked
Newly produced: generated -> production -> quality_control -> shipped -> delivered -> batch_activated -> available -> reserved -> bound -> active -> used / expired / disabled / revoked
```

A newly produced unit cannot enter `available` until delivery and batch activation. `batch_activated` is the batch-level transition represented by the API/data enum `activated`; it moves eligible individual units to `available` in the same guarded operation. A cashier reserves existing stock before payment; payment and successful binding are required before activation.

### 7.1 Movement transitions

| Transition ID | Current stock bucket | Movement | Guard | Next stock bucket | Actor | Effect |
| --- | --- | --- | --- | --- | --- | --- |
| `KROWDS-SM-TR-080` | `planned` | `reserve` | Order is accepted and quantity is available to commit | `reserved` | System or `finance` | Add a signed reservation; cashier sales reserve before payment |
| `KROWDS-SM-TR-081` | `reserved` | `release` | A newly produced order is cancelled or payment is not completed | `planned` | System or `owner` | Release the unstarted production reservation exactly once |
| `KROWDS-SM-TR-094` | `reserved` | `release` | An existing-stock checkout is cancelled or payment is not completed | `available` | System or `owner` | Release the unit exactly once; it is immediately allocatable again |
| `KROWDS-SM-TR-082` | `reserved` | `start_production` | KREW verification is approved for a newly produced order | `in_production` | KREW `production` | Convert committed quantity to production quantity |
| `KROWDS-SM-TR-083` | `in_production` | `receive` | Physical units and QC count reconcile | `in_stock` | KREW `quality_control` | Add received quantity; do not make it available yet |
| `KROWDS-SM-TR-084` | `in_stock` | `activate` | Batch activation succeeds after verified delivery | `available` | `owner` or `admin` | Make allocatable units available |
| `KROWDS-SM-TR-085` | `available` | `reserve` | Ticket checkout or cashier flow selects one unreserved unit | `reserved` | System or `cashier` | Reserve one unit for one ticket; do not allow a second reservation |
| `KROWDS-SM-TR-086` | `reserved` | `bind` | Payment is verified, ticket holder is verified, and scope matches | `bound` | `redemption` or System | Create one active `Identity -> Ticket -> Wristband` binding |
| `KROWDS-SM-TR-087` | `bound` | `activate` | Binding succeeds and the single-use entitlement is issued | `active` | System | Make the credential eligible for its one online access decision |
| `KROWDS-SM-TR-088` | `active` | `use` | One successful gate access consumes the unused entitlement | `used` | Access scan or System | Mark the unit and ticket used atomically; re-entry is denied afterward |
| `KROWDS-SM-TR-089` | `available`, `reserved`, `bound`, or `active` | `expire` | `expires_at` is reached | `expired` | System | Remove the unit from access and preserve the decision history |
| `KROWDS-SM-TR-090` | `available`, `reserved`, `bound`, or `active` | `disable` | Owner/Admin or KREW `admin` records a safety or operational reason | `disabled` | `organization_owner_admin` or KREW `admin` | Deny access immediately without granting an offline fallback |
| `KROWDS-SM-TR-091` | `in_stock`, `available`, `reserved`, `bound`, or `active` | `quarantine` | Quality or safety issue is recorded | `quarantined` | KREW or `organization_owner_admin` | Remove the unit from allocation or access and write the ledger entry |
| `KROWDS-SM-TR-093` | `available`, `reserved`, `bound`, `active`, or `disabled` | `revoke` | Security, loss, or fraud decision is confirmed | `revoked` | `organization_owner_admin` or KREW `admin` | Reject every scan immediately and audit the credential decision |
| `KROWDS-SM-TR-092` | Any nonterminal bucket | `write_off` | KROWDS records an approved loss, defect, or cancellation reason | `written_off` | KREW `admin` | Prevent future allocation and preserve the ledger entry |

The balance for each batch shall equal opening quantity plus all signed movements. KROWDS reconciliation compares that balance with the physical count and creates a new adjustment rather than editing history. The stock path is single-use; there is no `allocated` multi-use bucket and no re-entry transition.

## 8. Individual wristband lifecycle

The individual status is authoritative for a QR scan. The stock bucket is a separate operational view and may be reconciled independently.

| Transition ID | From | Trigger | Operational guard | To | Actor | Required side effect |
| --- | --- | --- | --- | --- | --- | --- |
| `KROWDS-SM-TR-100` | none | Generate unit | Batch exists; `wristband_code` and token hash are unique | `generated` | System | Create 128-bit opaque QR token transiently and store only its hash |
| `KROWDS-SM-TR-101` | `generated` | Start production | Unit belongs to a production batch | `production` | KREW `production` | Associate unit with the private production file |
| `KROWDS-SM-TR-102` | `production` | Submit to QC | Physical unit is ready for inspection | `quality_control` | KREW `production` | Freeze unit for inspection |
| `KROWDS-SM-TR-103` | `quality_control` | Confirm carrier handoff | Code, QR, artwork, and material checks pass; carrier handoff evidence exists | `shipped` | KREW `fulfillment` | Record shipped state and tracking reference; keep unit unavailable |
| `KROWDS-SM-TR-104` | `quality_control` | Fail QC | Failure reason is recorded | `quarantined` | KREW `quality_control` | Deny activation and access |
| `KROWDS-SM-TR-105` | `quarantined` | Recheck | Unit passes a new inspection | `quality_control` | KREW `quality_control` | Preserve the prior failed inspection |
| `KROWDS-SM-TR-106` | `quarantined` | Void unit | KROWDS cannot recover the unit | `revoked` | KREW `admin` | Revoke token permanently and write off the unit |
| `KROWDS-SM-TR-107` | `shipped` | Confirm delivery | Delivery is verified by a Biteship event or approved fulfillment evidence | `delivered` | Biteship-verified event or KREW fulfillment | Keep credential unavailable |
| `KROWDS-SM-TR-108` | `delivered` | Activate batch | Batch activation succeeds after delivery | `available` | `owner` or `admin` | Make the unit eligible for reservation or binding |
| `KROWDS-SM-TR-109` | `available` | Reserve unit | Checkout or cashier selects one unreserved unit | `reserved` | System or `cashier` | Reserve one unit for one ticket; cashier sales reserve before payment |
| `KROWDS-SM-TR-110` | `reserved` | Bind ticket | Payment is verified, ticket is issued, holder identity is verified, and event scope matches | `bound` | `redemption` or System | Create one active `Identity -> Ticket -> Wristband` binding |
| `KROWDS-SM-TR-111` | `bound` | Activate entitlement | Binding succeeds and the single-use entitlement is valid | `active` | System | Make the credential eligible for its one online access decision |
| `KROWDS-SM-TR-112` | `active` | Grant access | Current unit, binding, event, venue, window, and unused entitlement pass | `used` | Access scan or System | Consume the entitlement atomically; a second scan is denied |
| `KROWDS-SM-TR-113` | `available`, `reserved`, `bound`, or `active` | Expire | `expires_at` is reached | `expired` | System | Deny future scans |
| `KROWDS-SM-TR-114` | `available`, `reserved`, `bound`, or `active` | Disable temporarily | Owner/Admin or KREW `admin` records a safety or operational reason | `disabled` | `organization_owner_admin` or KREW `admin` | Deny scans while preserving the unit for controlled replacement |
| `KROWDS-SM-TR-115` | `available`, `reserved`, `bound`, `active`, or `disabled` | Revoke credential | Security, loss, or fraud reason is confirmed | `revoked` | `organization_owner_admin` or KREW `admin` | Reject every scan immediately and audit the decision |
| `KROWDS-SM-TR-116` | `revoked`, `used`, or `expired` | Replace credential | A new physical unit and approval exist | new `generated` unit | KREW or `organization_owner_admin` | Create a new UUID, code, token, and token version; never reuse the old token |
| `KROWDS-SM-TR-117` | `available`, `reserved`, `bound`, or `active` | Quarantine unit | Quality or safety issue is recorded | `quarantined` | KREW or `organization_owner_admin` | Remove the unit from allocation or access and write the ledger entry |

`generated`, `production`, `quality_control`, `shipped`, and `delivered` are not valid access states. `available` and `reserved` are valid only for checkout or binding workflows, not gate access. `active` is the only unit state that can produce `access_granted`, and the first successful gate scan moves it to `used`. Re-entry is denied after `used`.

### 8.1 QR credential decision table

| Credential condition | Scan result | Reason code | Required action |
| --- | --- | --- | --- |
| Token does not match any stored hash | `access_denied` | `UNKNOWN_CREDENTIAL` | Do not reveal whether a wristband exists |
| Token matches, but unit is not `active` | `access_denied` | `NOT_ACTIVE` | Record the attempt; `available` and `reserved` are not gate credentials |
| Unit is `disabled` or `revoked` | `access_denied` | `DISABLED` or `REVOKED` | Apply revocation immediately |
| Unit is `expired` or entitlement window is closed | `access_denied` | `EXPIRED` or `OUTSIDE_WINDOW` | Preserve the scan log and offer the approved support path |
| Venue, event, activity, or session does not match | `access_denied` | `WRONG_VENUE` or `NO_ENTITLEMENT` | Do not grant access based on a valid token alone |
| Entitlement was already consumed | `access_denied` | `ALREADY_USED` | Deny re-entry and keep the first access decision immutable |
| Token hash, active state, and all current checks pass | `access_granted` | `VALID_ENTITLEMENT` | Consume the single-use entitlement and record the scan |

The QR token is opaque, 128-bit, hashed at rest, status-bound, revocable, and free of PII. An authorized redemption workflow may resolve a token while a unit is `available` or `reserved`, but the token is access-valid only while the unit is `active` and its unused entitlement is valid. A valid token without a valid current state is always denied.

## 9. Payment and ticket lifecycle

### 9.1 Digital payment

| Transition ID | From | Trigger | Operational guard | To | Actor | Required side effect |
| --- | --- | --- | --- | --- | --- | --- |
| `KROWDS-SM-TR-120` | none | Create payment | Order and amount are internally consistent | `created` | System or buyer | Create provider-neutral payment record |
| `KROWDS-SM-TR-121` | `created` | Send to provider | Supported channel is available | `pending` | System | Record provider payment reference |
| `KROWDS-SM-TR-122` | `pending` | Provider authorizes | Verified Xendit event and amount match | `authorized` | System | Store provider event ID and authorization time |
| `KROWDS-SM-TR-123` | `pending` or `authorized` | Provider confirms payment | Verified Xendit event, order, amount, and currency match | `paid` | System | Issue tickets or move wristband order to `paid` |
| `KROWDS-SM-TR-124` | `pending` or `authorized` | Provider reports failure | Verified Xendit failure event | `failed` | System | Preserve provider reason without exposing secrets |
| `KROWDS-SM-TR-125` | `pending` or `authorized` | Payment instruction expires | 30 minutes for online or 15 minutes for cashier, or an earlier provider expiry | `expired` | System | Prevent ticket issuance and release stock reservation idempotently |
| `KROWDS-SM-TR-126` | `paid` | Project approved full refund | Verified Xendit refund event; the refund was requested in-window or approved through `exceptional_review`; ticket is not used or bound | `refunded` | System or `finance` | Revoke the ticket and related entitlement; preserve the original payment and refund event |

No staff-only button may transition a digital payment to `paid`. All MVP amounts are IDR. QRIS, Virtual Account, and approved e-wallet statuses originate from verified Xendit events; cashier sales use the same normalized payment model. A verified payment failure or expiry projects the ticket order to `failed` while the payment record retains its precise `failed` or `expired` state. Partial refunds are outside the MVP.

### 9.2 Full-order refund

A refund is a separate, idempotent workflow that projects to the payment and ticket states only after provider evidence. Partial refunds are not represented.

| Transition ID | From | Trigger | Operational guard | To | Actor | Required side effect |
| --- | --- | --- | --- | --- | --- | --- |
| `KROWDS-SM-TR-127` | none | Request full refund | Actor is authorized; request is within 7 calendar days; no ticket is `bound` or `used` | `requested` | User, Finance, or `organization_owner_admin` | Create one in-window refund request; a User request still requires staff approval |
| `KROWDS-SM-TR-181` | none | Request late full refund | Actor is authorized; request is after 7 calendar days; no ticket is `bound` or `used` | `exceptional_review` | User, Finance, or `organization_owner_admin` | Open a Finance case; do not submit a provider refund before dual-approved Finance decision |
| `KROWDS-SM-TR-128` | `requested` | Approve and submit provider refund | Finance or Organization Owner/Admin approves; amount equals the full eligible order and idempotency key is new | `processing` | Finance or `organization_owner_admin` | Submit to Xendit and retain provider reference |
| `KROWDS-SM-TR-182` | `exceptional_review` | Approve exceptional refund | Finance approves the documented exception; amount equals the full eligible order and no ticket is `bound` or `used` | `processing` | Finance and second authorized approver | Submit to Xendit with dual approval and retain the decision evidence |
| `KROWDS-SM-TR-183` | `exceptional_review` | Reject exceptional request | Finance declines the documented exception | `rejected` | Finance | Retain reason and audit; do not call the provider or change payment state |
| `KROWDS-SM-TR-129` | `processing` | Provider confirms refund | Verified Xendit event matches transaction and amount | `succeeded` | System | Set payment projection to `refunded`, invalidate tickets, and audit |
| `KROWDS-SM-TR-169` | `processing` | Provider rejects or exhausts retry policy | Failure evidence is durable and no successful provider event exists | `failed` | System or Finance | Keep tickets non-redeemable according to policy and open reconciliation |
| `KROWDS-SM-TR-168` | `requested` | Cancel before provider submission | Cancellation policy permits and provider has not accepted the request | `cancelled` | Finance or `organization_owner_admin` | Retain reason and audit; do not fabricate a provider refund |

Refund request window is 7 calendar days. A late request enters `exceptional_review`; only a dual-approved Finance decision may submit it to the provider, while a rejected decision makes no provider call. `KROWDS-SM-TR-126` is the payment projection after an approved in-window or exceptional refund, not the request-eligibility guard. Xendit fees are organization pass-through operating cost, reconciliation runs daily, and Finance signs off weekly. Provider rejection opens reconciliation and does not automatically restore access.

### 9.3 Ticket

| Transition ID | From | Trigger | Operational guard | To | Actor | Required side effect |
| --- | --- | --- | --- | --- | --- | --- |
| `KROWDS-SM-TR-130` | none | Create ticket order line | Checkout contains one ticket holder and one identity per ticket | `pending_payment` | System | Create ticket with opaque credential hash; holder is editable before payment |
| `KROWDS-SM-TR-131` | `pending_payment` | Payment confirmed | Verified Xendit payment is settled for an IDR order | `issued` | System | Make the ticket available to the buyer and freeze holder data |
| `KROWDS-SM-TR-132` | `pending_payment` | Payment fails or expires | No settled provider payment exists | `cancelled` | System | Prevent ticket use and release any stock reservation |
| `KROWDS-SM-TR-133` | `issued` | Reserve ticket for entry | Holder and event scope are valid; stock reservation is available | `reserved` | System or `cashier` | Reserve one unit or session entitlement; no transfer is created |
| `KROWDS-SM-TR-134` | `reserved` | Redeem ticket | Staff identity check, payment, and ticket scope pass | `bound` | `redemption` or System | Bind the reserved unit and create the single-use entitlement |
| `KROWDS-SM-TR-135` | `bound` | Grant access | One online gate scan passes current checks | `used` | Access scan or System | Consume the entitlement once and retain the access decision |
| `KROWDS-SM-TR-136` | `issued`, `reserved`, or `bound` | Expire ticket | `expires_at` is reached | `expired` | System | Deny future redemption and access |
| `KROWDS-SM-TR-137` | `issued` or `reserved` | Full refund | Verified Xendit refund event; ticket is not bound or used; policy allows refund | `refunded` | System or `finance` | Invalidate ticket and release any reservation; no partial refund is supported |
| `KROWDS-SM-TR-138` | `issued` or `reserved` | Cancel ticket | Cancellation policy allows cancellation before binding or use | `cancelled` | `finance`, `owner`, or System | Invalidate ticket and release any reservation |
| `KROWDS-SM-TR-139` | `issued`, `reserved`, `bound`, or `used` | Revoke ticket | Security, fraud, or provider reconciliation decision is confirmed | `revoked` | `organization_owner_admin` or KREW `admin` | Deny access and audit the ticket decision |

A ticket QR credential is also opaque and PII-free. The ticket state, holder identity, payment state, and wristband state are separate but linked; changing one does not silently rewrite another. One ticket has one ticket holder and one verified identity. An Identity may hold at most five active tickets per Event and at most one active ticket for the same Event, Ticket Product, and Session combination. Holder data is immutable after payment. Transfer is not a transition.

## 10. Ticket redemption and wristband binding

A redemption is successful only when the ticket, holder identity, wristband, batch, event scope, and access entitlement are all valid in the same operation.

| Transition ID | From | Trigger | Operational guard | To | Actor | Required side effect |
| --- | --- | --- | --- | --- | --- | --- |
| `KROWDS-SM-TR-140` | none | Scan ticket QR | Ticket credential is syntactically valid | `scanned` | `redemption` or System | Create a request-scoped redemption record |
| `KROWDS-SM-TR-141` | `scanned` | Verify ticket | Payment is valid, ticket is issued or reserved, and holder identity matches | `verified` | System | Store safe verification result; no PII in the response |
| `KROWDS-SM-TR-142` | `verified` | Bind reserved wristband | Wristband is `reserved`, token hash matches, payment is verified, and event scope matches | `bound` | `redemption` or System | Create `Identity -> Ticket -> Wristband` binding and activate its single-use entitlement |
| `KROWDS-SM-TR-143` | `scanned` or `verified` | Reject redemption | Ticket, identity, payment, or scope check fails | `rejected` | System | Record a controlled denial reason and no binding |
| `KROWDS-SM-TR-144` | `verified` | Detect prior binding | Ticket or wristband already has an active binding | `already_bound` | System | Return the existing binding reference; do not create another one |
| `KROWDS-SM-TR-145` | `scanned` | Detect expiry | Ticket or entitlement is expired | `expired` | System | Record the attempt and require an approved support path |
| `KROWDS-SM-TR-146` | `bound` | Release binding | Authorized replacement or policy workflow is approved before use | `released` | `owner`, `admin`, or KREW support | Revoke old entitlement and make a replacement unit available if approved |
| `KROWDS-SM-TR-147` | `released` or `bound` | Revoke binding | Security, loss, or fraud reason is confirmed | `revoked` | `organization_owner_admin` or KREW `admin` | Deny access and audit the credential decision |

The binding invariant is `Identity -> Ticket -> Wristband -> Access Entitlement`. A user account, an identity document, a visitor record, and a ticket holder are not interchangeable.

## 11. Registered gate device lifecycle

Device registration establishes an organization-scoped operational identity; it does not grant access without a separate active wristband and entitlement.

| Transition ID | From | Trigger | Operational guard | To | Actor | Required side effect |
| --- | --- | --- | --- | --- | --- | --- |
| `KROWDS-SM-TR-150` | none | Register device | Organization is approved; device reference and venue scope are valid | `pending_registration` | `organization_owner_admin` | Create device record and audit event |
| `KROWDS-SM-TR-151` | `pending_registration` | Activate device | Installation or operator verification passes; device is in the expected scope | `active` | `organization_owner_admin` or System | Record activation evidence and safe fingerprint |
| `KROWDS-SM-TR-152` | `active` | Suspend device | Security or operational reason is recorded | `suspended` | `organization_owner_admin` | Deny new scans and alert the owning role |
| `KROWDS-SM-TR-153` | `suspended` | Restore device | Review confirms the suspension is resolved | `active` | `organization_owner_admin` | Restore only the approved venue scope |
| `KROWDS-SM-TR-154` | `active`, `suspended`, or `pending_registration` | Disable device | Device is retired, lost, or under investigation | `disabled` | `organization_owner_admin` | Deny scans and preserve evidence |
| `KROWDS-SM-TR-155` | `active`, `suspended`, `disabled`, or `pending_registration` | Revoke device | Permanent loss, compromise, or replacement decision | `revoked` | `organization_owner_admin` | Revoke device identity and prevent reuse |

A scan from a missing, inactive, wrong-organization, or wrong-venue device is denied and recorded. A browser or device claim alone never establishes trust.

## 12. Access scan lifecycle

An access scan is a request/decision workflow. `access_granted` and `access_denied` are both successful, recorded outcomes; neither means the credential state was silently changed. The MVP requires an online decision, permits one successful use, and has no offline grant or re-entry path.

| Transition ID | From | Trigger | Operational guard | To | Actor | Required side effect |
| --- | --- | --- | --- | --- | --- | --- |
| `KROWDS-SM-TR-160` | none | Receive scan | Authenticated gate device or operator submits a credential | `received` | `gate`, `redemption`, or System | Generate scan ID and request ID |
| `KROWDS-SM-TR-161` | `received` | Validate credential | Request is within rate and size limits | `validating` | System | Hash the presented token; never log plaintext |
| `KROWDS-SM-TR-162` | `validating` | Grant access | Wristband is `active`, binding and single-use entitlement are valid, venue/session match, and online dependency is available | `access_granted` | System | Consume the entitlement exactly once and record the gate actor |
| `KROWDS-SM-TR-163` | `validating` | Deny access | Unit is not active, entitlement is already used, scope is wrong, or another authoritative check fails | `access_denied` | System | Return a controlled reason and no access; do not offer re-entry |
| `KROWDS-SM-TR-164` | `validating` | Dependency error | Database, provider, or online gate service is unavailable | `access_error` | System | Do not guess access and do not use an offline fallback |
| `KROWDS-SM-TR-165` | `access_granted`, `access_denied`, or `access_error` | Persist log | Scan record and audit data are durable | `logged` | System | Make the result available to authorized audit views |

An `access_error` never maps to `access_granted`. A retry with the same request key returns the original outcome and does not increment usage twice.

## 13. Domestic shipment lifecycle

Biteship is the source of truth for domestic label and tracking state. KROWDS accepts a transition only from a verified Biteship event or an audited KREW fulfillment correction.

| Transition ID | From | Trigger | Operational guard | To | Actor | Required side effect |
| --- | --- | --- | --- | --- | --- | --- |
| `KROWDS-SM-TR-190` | none | Create shipment request | Domestic wristband order is approved for fulfillment | `pending` | KREW `fulfillment` or System | Create the shipment projection and audit event |
| `KROWDS-SM-TR-191` | `pending` | Create label | Biteship label request succeeds | `label_created` | Biteship-verified event or KREW fulfillment | Store private label reference and tracking number |
| `KROWDS-SM-TR-192` | `label_created` | Pickup | Biteship pickup event is verified | `picked_up` | Biteship-verified event | Record carrier scan time and request ID |
| `KROWDS-SM-TR-193` | `picked_up` | Enter transit | Biteship transit event is verified | `in_transit` | Biteship-verified event | Update the domestic tracking projection |
| `KROWDS-SM-TR-194` | `in_transit` | Deliver | Biteship delivery event is verified | `delivered` | Biteship-verified event | Mark shipment delivered; batch still awaits organization receipt and activation |
| `KROWDS-SM-TR-195` | `pending`, `label_created`, `picked_up`, or `in_transit` | Fail delivery | Biteship failure event or approved correction is recorded | `failed` | Biteship-verified event or KREW fulfillment | Preserve failure reason and open reconciliation |
| `KROWDS-SM-TR-196` | `pending`, `label_created`, `picked_up`, or `in_transit` | Cancel shipment | Cancellation policy and inventory decision are recorded | `cancelled` | KREW `fulfillment` or `admin` | Stop fulfillment and release or write off stock |
| `KROWDS-SM-TR-197` | `failed` or `cancelled` | Approve reshipment | KREW records a replacement reason and a new fulfillment attempt | `reshipment_pending` | KREW `fulfillment` or `admin` | Preserve the original shipment and create an idempotent replacement reference |
| `KROWDS-SM-TR-198` | `reshipment_pending` | Create replacement label | Biteship accepts the replacement request | `label_created` | Biteship-verified event or KREW fulfillment | Link replacement to the original shipment and retain both histories |

`failed` and `cancelled` require an explicit KREW reconciliation action before a replacement shipment is created. `reshipment_pending` is not a delivered state and cannot activate a batch. No international, cash-on-delivery, or marketplace courier transition is supported.

## 14. Verified webhook inbox lifecycle

Provider webhooks are external inputs, not trusted commands. The inbox verifies and deduplicates them before business state changes. Signed timestamps outside the five-minute freshness window are rejected as replayed, and provider event IDs remain deduplicated for the provider retention window.

| Transition ID | From | Trigger | Operational guard | To | Actor | Required side effect |
| --- | --- | --- | --- | --- | --- | --- |
| `KROWDS-SM-TR-170` | none | Receive webhook | Request body is within size limit | `received` | Xendit, Biteship, or Resend | Store provider, event ID, payload hash, and request ID |
| `KROWDS-SM-TR-171` | `received` | Verify signature | Raw-body signature or callback token is valid and fresh | `verified` | System | Store verification result; do not parse as trusted state yet |
| `KROWDS-SM-TR-172` | `received` | Reject signature | Signature is absent, invalid, or stale | `rejected` | System | Return an error and do not mutate business data |
| `KROWDS-SM-TR-173` | `verified` | Check duplicate | `(provider, providerEventId)` is new | `queued` | System | Enqueue exactly one business operation |
| `KROWDS-SM-TR-174` | `verified` | Check duplicate | Provider event ID already processed | `ignored_duplicate` | System | Acknowledge without repeating side effects |
| `KROWDS-SM-TR-175` | `queued` | Start processing | Worker claims the event with a lease | `processing` | Integration worker | Mark attempt and worker identity |
| `KROWDS-SM-TR-176` | `processing` | Apply business effect | Provider event matches the expected order/payment/shipment/email reference | `processed` | Integration worker | Commit mutation and audit event atomically |
| `KROWDS-SM-TR-177` | `verified` | Unknown event type | Provider event is authenticated but not mapped | `ignored` | System | Store reason for provider evolution |
| `KROWDS-SM-TR-178` | `processing` | Retryable failure | Dependency or transient error occurs | `retrying` | Integration worker | Apply bounded exponential backoff |
| `KROWDS-SM-TR-179` | `processing` | Permanent failure | Signature is valid but the business reference is invalid or the retry budget is exhausted | `dead_letter` | Integration worker or `operations` | Alert KREW and require reconciliation |
| `KROWDS-SM-TR-180` | `retrying` | Retry succeeds | The same provider event is processed idempotently | `processed` | Integration worker | Record retry count and completion time |

`rejected`, `ignored_duplicate`, `ignored`, and `processed` do not re-enter the business mutation path. Resend events can update communication status only; Xendit payment verification is required before a digital payment becomes `paid`; Biteship delivery verification is required before a batch can be considered delivered.

## 15. Cross-machine invariants

| Invariant ID | Rule |
| --- | --- |
| `KROWDS-SM-INV-001` | No operational organization feature is available while organization status is not `approved`, except read-only support and approved correction workflows. |
| `KROWDS-SM-INV-002` | A newly produced wristband cannot be bound before its batch is delivered and activated; existing stock must be `available` before reservation. |
| `KROWDS-SM-INV-003` | A ticket cannot be bound unless its payment is verified, its holder has a verified identity, and the holder is immutable after payment. |
| `KROWDS-SM-INV-004` | One active binding can exist for a wristband, ticket, and identity scope at a time; ticket transfer is not a transition. |
| `KROWDS-SM-INV-005` | A QR token never grants access without an `active` unit, current binding, unused single-use entitlement, venue, expiry, and revocation checks. |
| `KROWDS-SM-INV-006` | A revoked, expired, disabled, or used credential is denied on the next online scan, regardless of a cached client state; re-entry is not allowed. |
| `KROWDS-SM-INV-007` | A provider event is applied at most once even when delivery is at least once. |
| `KROWDS-SM-INV-008` | A production file is private, has the exact CSV schema, contains no PII, and is not a source of authoritative wristband state. |
| `KROWDS-SM-INV-009` | Stock balance is derived from an append-only ledger and reconciled against physical count. |
| `KROWDS-SM-INV-010` | Every sensitive transition has an actor, UTC timestamp, request ID, previous state, next state, and outcome. |
| `KROWDS-SM-INV-011` | All MVP monetary values are IDR; an in-window full refund request is accepted only before ticket use/binding and within 7 calendar days, while a later eligible request enters `exceptional_review` and requires a dual-approved Finance decision before provider submission. |
| `KROWDS-SM-INV-012` | A gate dependency failure produces `access_error`; it never creates an offline authorization. |

## 16. Failure and recovery behavior

| Failure ID | Detection | Safe behavior | Recovery |
| --- | --- | --- | --- |
| `KROWDS-SM-FAIL-001` | Concurrent binding conflict | One transaction wins; the other receives `409 RESOURCE_CONFLICT` | Staff refreshes the current binding and uses an approved replacement path |
| `KROWDS-SM-FAIL-002` | Duplicate provider webhook | Return `202` without repeating the mutation | Reconciliation confirms the original event |
| `KROWDS-SM-FAIL-003` | Invalid webhook signature | Reject before queueing | Provider must resend through the verified channel |
| `KROWDS-SM-FAIL-004` | Private-file storage failure | Do not claim production is ready | Retry file generation or storage and preserve the batch state |
| `KROWDS-SM-FAIL-005` | Database or dependency outage during scan | Return `access_error`, never grant by guess or use an offline fallback | Retry with the same request key after recovery |
| `KROWDS-SM-FAIL-006` | Lost or stolen wristband | Revoke the authoritative unit and batch where necessary | Issue a new unit with a new token and version |
| `KROWDS-SM-FAIL-007` | Duplicate active ticket identity for one Event/Ticket Product/Session combination or above the five-ticket Event limit | Reject checkout before payment or binding | Correct the ticket holder or select a different product/session; transfer is not an available recovery |

## 17. Ownership and related documents

| Concern | State machine IDs | Accountable role |
| --- | --- | --- |
| Organization and membership | `KROWDS-SM-ORG-001`, `KROWDS-SM-MEM-001` | Organization Product Owner (TBD) |
| Wristband stock and production | `KROWDS-SM-WO-001`, `KROWDS-SM-BAT-001`, `KROWDS-SM-STK-001`, `KROWDS-SM-WB-001` | Wristband Operations Owner (TBD) |
| Domestic fulfillment | `KROWDS-SM-SHIP-001` | Fulfillment Operations Owner (TBD) |
| Payment and ticket | `KROWDS-SM-PAY-001`, `KROWDS-SM-TKT-001` | Commerce Product Owner (TBD) |
| Redemption and access | `KROWDS-SM-RED-001`, `KROWDS-SM-ACC-001` | Access Control Product Owner (TBD) |
| Provider integrations | `KROWDS-SM-WH-001` | Integration Platform Owner (TBD) |

- [Canonical English product target](../01-product/PRODUCT-VISION.md)
- [Data model](DATA-MODEL.md)
- [API contract](API-CONTRACT.md)
- [Glossary](../01-product/GLOSSARY.md)
- [Product and operational context](../01-product/KROWDS.md)
- [Documentation index](../INDEX.md)
- [Open decisions and release gates](../00-governance/OPEN-DECISIONS.md)
