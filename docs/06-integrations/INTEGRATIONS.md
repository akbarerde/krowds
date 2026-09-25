# KROWDS-INTEGRATIONS-001 — External Integrations and Provider Requirements

## Metadata

| Field | Value |
| --- | --- |
| Document ID | `KROWDS-INTEGRATIONS-001` |
| Version | `0.1` |
| Status | `Draft` |
| Release label | `0.1 Draft` |
| Last updated | `2026-09-24` |
| Scope | Xendit payments, Resend transactional email, Biteship domestic shipping, Google Cloud services, and Google OAuth/OIDC provider |
| Canonical product reference | [KROWDS Product Vision](../01-product/PRODUCT-VISION.md) |
| Integration owner | Platform Integration Engineering — personal name: TBD |
| Payments owner | Payments Engineering — personal name: TBD |
| Notification owner | Notifications Engineering — personal name: TBD |
| Fulfillment owner | Fulfillment Operations — personal name: TBD |
| Privacy reviewer | Privacy and Legal Counsel — personal name: TBD |
| Security reviewer | Security Engineering — personal name: TBD |
| Review rule | No provider receives production personal data until the Indonesia-first privacy/legal gate is approved |

## 1. Purpose and architecture boundary

This document defines the provider contracts, security controls, failure behavior, and verification requirements for KROWDS external integrations. It is a requirements baseline for the product flows described in `KROWDS.md`.

The boundary is fixed:

- The five Next.js applications are frontend-only. They call the Go + Gin backend through `@krowds/api` and never call a provider with a secret.
- The single Go + Gin backend at `services/cmd/server` owns provider authentication, payment state, email dispatch, shipping calls, retries, webhooks, and reconciliation.
- Each external provider is accessed through an application port and an infrastructure adapter. A provider failure must not take down unrelated modules.
- The target Google Cloud boundary includes Cloud Run, Cloud SQL PostgreSQL with RLS, Memorystore for rebuildable cache and short-lived coordination, Cloud Tasks, Cloud Scheduler, Cloud Storage, Secret Manager, Cloud Logging, Error Reporting, Monitoring, and BigQuery in `asia-southeast2`.
- The MVP is online-first, IDR-only, and single-use. The integration layer shall not enable ticket transfer, re-entry, multi-use, offline gate access, non-IDR settlement, or cash on delivery.
- The browser is never trusted to prove payment success, email delivery, shipping status, identity, or authorization.
- No raw card data is collected or stored by KROWDS. Xendit-hosted tokenization is the only approved card path.
- Provider webhooks are untrusted input until verified and durably processed.

All owners in this document are role-based. Personal names are intentionally TBD until assigned. Provider access follows least privilege, and every role is limited to the provider operations necessary for its purpose.

## 2. Status and confirmed decisions

- **Confirmed decision** — a provider or control direction that is part of this draft.
- **TBD** — an unresolved account, region, version, policy, or threshold.
- **TBD pending legal** — an unresolved item that requires written privacy/legal approval.
- **Draft control baseline** — a concrete proposed value that Security, Payments, Privacy, or Operations must approve before production.

### 2.1 Confirmed integration direction

| ID | Decision | State | Owner |
| --- | --- | --- | --- |
| KROWDS-INT-001 | Xendit is the payment integration for supported Indonesian payment methods. KROWDS uses hosted or tokenized collection and provider-confirmed status. | Confirmed decision | Payments Engineering — personal name: TBD |
| KROWDS-INT-002 | Xendit webhooks are verified before they change payment state, and every event is idempotent. | Confirmed decision | Payments Engineering — personal name: TBD |
| KROWDS-INT-003 | Resend is the transactional email integration. Sending uses KROWDS-owned verified domains, approved message content, OTP rate limits, and bounce/complaint handling. | Confirmed decision | Notifications Engineering — personal name: TBD |
| KROWDS-INT-004 | Biteship is the baseline domestic Indonesia shipping integration. The organization pays the shipping account; cash-on-delivery is not offered. | Confirmed decision | Fulfillment Operations — personal name: TBD |
| KROWDS-INT-005 | Google Cloud Secret Manager, Cloud SQL, Cloud Storage, BigQuery, and authenticated Cloud Run invocation are the production infrastructure boundary. | Confirmed decision | Platform/SRE — personal name: TBD |
| KROWDS-INT-006 | KROWDS never stores raw card data. Provider payloads, logs, and analytics are minimized and classified. | Confirmed decision | Payments and Privacy Engineering — personal names: TBD |
| KROWDS-INT-007 | Provider calls use HTTPS, workload identity or secret-managed credentials, timeouts, bounded retries, idempotency, monitoring, and a safe fallback for the user journey. | Confirmed decision | Platform Integration Engineering — personal name: TBD |
| KROWDS-INT-008 | Xendit, Resend, Biteship, and Google Cloud contracts, regions, retention, and data-transfer terms require privacy/legal approval before production. | TBD pending legal | Privacy and Legal Counsel — personal name: TBD |
| KROWDS-INT-025 | The target runtime region is `asia-southeast2`, with separate development, staging, and production Google Cloud projects. Provider and legal data-transfer approvals remain release gates. | Confirmed target; legal approval TBD | Platform/SRE and Privacy and Legal Counsel — personal names: TBD |
| KROWDS-INT-026 | Cloud Run serves the Go API, task routes, and scheduler routes from one backend image. Cloud Tasks and Cloud Scheduler invoke that image through authenticated workload identity. | Confirmed decision | Backend and Platform Engineering — personal names: TBD |
| KROWDS-INT-027 | Memorystore is limited to rebuildable cache, rate-limit, short-lived lock, and idempotency-coordination data. It is not a payment, ticket, identity, shipping, or audit source of truth. | Confirmed decision | Backend Engineering — personal name: TBD |
| KROWDS-INT-028 | BigQuery receives only approved, classified audit and operational data. Cloud Logging, Error Reporting, and Monitoring provide redacted telemetry and alerts and do not authorize a business transition. | Confirmed decision | Data Platform and Security Engineering — personal names: TBD |
| KROWDS-INT-029 | The MVP supports Xendit IDR payments only. Online methods are QRIS, Virtual Account, and e-wallet; cashier is QRIS-only; refunds are full-order only. | Confirmed decision | Payments Engineering — personal name: TBD |
| KROWDS-INT-030 | Resend webhook authenticity uses the provider-supported signature mechanism over the raw body; the current contract records Svix headers (`svix-id`, `svix-timestamp`, `svix-signature`) as the integration baseline. | Confirmed integration baseline; exact account mechanism/version is an external gate | Notifications and Security Engineering — personal names: TBD |

### 2.2 Open integration decisions

| ID | Decision | State | Owner | Required before |
| --- | --- | --- | --- | --- |
| KROWDS-INT-009 | Xendit account, product set, QRIS/VA/e-wallet configuration, settlement fields, and exact webhook verification version | External account identifiers TBD; product scope confirmed | Payments Engineering — personal name: TBD | Payment production |
| KROWDS-INT-010 | Resend uses a dedicated KROWDS-owned transactional subdomain such as `mail.<approved-domain>`, with SPF, DKIM, DMARC, dedicated reply-to/return-path, and bounce/complaint suppression. The actual domain name remains an external identifier. | Confirmed baseline; hostname TBD | Notifications Engineering — personal name: TBD | Email production |
| KROWDS-INT-011 | Biteship API account, API version, warehouse/service selection, and webhook authenticity mechanism | TBD | Fulfillment Operations — personal name: TBD | Shipping production |
| KROWDS-INT-012 | Google Cloud project identifiers, Cloud SQL edition/version, bucket and BigQuery configuration within the confirmed `asia-southeast2` target, and CMEK policy | TBD; legal gate | Platform/SRE and Privacy and Legal Counsel — personal names: TBD | Production data storage |
| KROWDS-INT-013 | Browser traffic uses the approved secure API gateway/identity-aware path; the browser holds only secure HttpOnly SameSite cookies and anonymous Cloud Run invocation is denied. | Confirmed baseline; implementation hostname TBD | Platform/SRE and Security Engineering — personal names: TBD | Public API launch |
| KROWDS-INT-014 | Provider data-processing terms, subprocessors, transfer safeguards, and final deletion commitments | TBD pending legal | Privacy and Legal Counsel and Partnerships — personal names: TBD | Provider data flow |
| KROWDS-INT-015 | OTP expiry 15 minutes, five attempts, 60-second resend cooldown; destination/account limits, suppression behavior, and message governance follow the accepted security baseline, while actual domain, content versions, and legal wording remain release gates. | Confirmed baseline; external content/domain gates | Notifications Engineering and Privacy and Legal Counsel — personal names: TBD | Email production |

## 3. Integration inventory

| ID | Provider | Purpose | KROWDS sends | KROWDS receives or stores | Secret and data class | Primary failure behavior |
| --- | --- | --- | --- | --- | --- | --- |
| KROWDS-INT-016 | Xendit | Payment collection for QRIS, Virtual Account, and approved Xendit e-wallet methods | Exact IDR amount, internal transaction ID, buyer reference, approved customer data, return reference | Provider transaction ID, status, timestamps, payment reference, refund/reconciliation status; never raw card data | Secret Manager credential; payment data is Restricted when linkable | Keep transaction pending; retry only idempotent operations; alert and reconcile |
| KROWDS-INT-017 | Resend | Email OTP, account, organization, ticket, wristband, payment, and security notifications | Verified destination, approved message category/content, minimal order reference | Message ID, delivery status, bounce, complaint, suppression state; OTP value never returned or logged | Secret Manager API credential; recipient data is Confidential or Restricted when linkable | Durable retry for transient errors; do not mark OTP or action complete until verified |
| KROWDS-INT-018 | Biteship | Domestic Indonesia shipment labels, tracking, and delivery events for physical wristband orders | Order reference, domestic addresses, recipient contact, parcel dimensions/weight, organization account | Shipment ID, label/tracking reference, courier status, delivery event | Secret Manager credential; shipping data is Confidential | Keep fulfillment pending; retry with idempotency; reconcile instead of guessing delivery |
| KROWDS-INT-019 | Google Cloud Secret Manager | Runtime and integration secrets | Secret version references from the backend identity | Secret values are never returned to clients or ordinary logs | Workload identity; Prohibited security data | Fail closed; alert; use break-glass only under approved incident procedure |
| KROWDS-INT-020 | Google Cloud SQL | Transactional system of record | Tenant-scoped queries and approved administrative commands | Business records, identity data, payment references, audit records, configuration | Private connectivity; Restricted data | Fail closed for writes; bounded read behavior; restore or failover runbook |
| KROWDS-INT-021 | Google Cloud Storage | Private documents, artwork, production files, and approved exports | Object bytes, classification, owner, retention/expiry metadata | Object version, checksum, access and lifecycle events | Workload identity; Confidential or Restricted | Deny access until healthy; preserve download audit; recover through versioning |
| KROWDS-INT-022 | Google BigQuery | Approved operational and product analytics | Minimized, classified events or aggregates | Query results, job metadata, access logs | Restricted dataset; no raw card or unrestricted PII | Fail closed for sensitive queries; no public sharing; expire or delete by policy |
| KROWDS-INT-023 | Google Cloud Run | Authenticated backend runtime | HTTPS requests carrying an authenticated KROWDS identity and authorized tenant context | Backend response, correlation ID, health and error status | IAM and workload identity; request data follows classification | Reject unauthenticated calls; use health checks and circuit breakers |
| KROWDS-INT-024 | Google OAuth/OIDC provider | User sign-in and provider-assisted email verification | Authorization code or OIDC request with minimum approved scopes | Issuer, subject, verified email claim, nonce result | Confidential account data; transfer review required | Fall back to approved email/password and OTP flow; require explicit confirmation before linking an existing account and never auto-link an ambiguous match |
| KROWDS-INT-031 | Memorystore | Rebuildable cache, rate limits, short-lived locks, and idempotency coordination | Opaque cache keys, bounded counters, lock identifiers, task coordination references | Cache values and health signals only | Workload identity; no durable personal or payment source of truth | Bypass or rebuild from authoritative Cloud SQL/request data; never fabricate business state |
| KROWDS-INT-032 | Cloud Tasks | At-least-once email, provider callback, export, and retry work | Stable task ID, resource reference, payload version, correlation ID | Task result, retry count, dead-letter state | Workload identity; task payload minimized | Keep durable outbox or task state; retry idempotently; alert on backlog |
| KROWDS-INT-033 | Cloud Scheduler | Expiry, reconciliation, cleanup, and recurring operational jobs | Authenticated schedule identity, job name, expected audience, execution key | Execution result, duration, overlap state | Workload identity; no personal payload in scheduler request | Record missed run; execute the same idempotent job after verification |
| KROWDS-INT-034 | Cloud Logging | Structured request, task, scheduler, and provider logs | Redacted event fields, request ID, revision, environment | Log entries and retention metadata | Workload identity; no secrets or unnecessary PII | Preserve evidence, restrict access, apply approved retention |
| KROWDS-INT-035 | Cloud Error Reporting | Grouped unhandled exceptions and repeated error signatures | Redacted error class, revision, service, and correlation reference | Error group, owner, status, and resolution | Workload identity; no request bodies or secrets | Triage and remediate by role; do not expose provider or personal data |
| KROWDS-INT-036 | Cloud Monitoring | Health, latency, queue, dependency, security, and business-safety metrics | Aggregated measurements and non-sensitive labels | Alerts, dashboards, and threshold state | Workload identity; metrics must be non-sensitive | Page the owning role; a metric never grants or changes business state |

## 4. Xendit payments

Xendit tokenization, webhook verification, and idempotency are mandatory.

### 4.1 Payment collection

The MVP accepts IDR only. Online checkout may use Xendit QRIS, Virtual Account, or approved Xendit e-wallet methods only. Cashier checkout may use Xendit QRIS only. Online instructions expire after 30 minutes; cashier instructions expire after 15 minutes. Cards and other payment methods are not exposed in v0.1. Refunds are full-order only; partial refunds and staff-entered settlement states are outside the integration contract.

KROWDS-INT-056 — The backend shall create and manage IDR payment transactions. The browser may receive a provider redirect, QRIS instruction, Virtual Account instruction, or hosted payment page, but it shall not decide that a payment succeeded.

KROWDS-INT-057 — Cards are not an MVP payment method. KROWDS shall not accept raw card number, CVV, or equivalent card credentials through its forms, APIs, logs, or analytics. If cards are enabled in a later approved version, KROWDS shall use Xendit-hosted or tokenized collection.

KROWDS-INT-058 — The internal transaction ID shall be generated by KROWDS before the provider request, stored as the reconciliation key, and used as the stable reference in provider metadata. Amounts shall use an exact provider-supported IDR representation and shall not use floating-point arithmetic.

KROWDS-INT-059 — The payment request shall include only the buyer and order fields approved for the selected product. The API response stored by KROWDS shall include provider references, status, expiry, and reconciliation fields, but no raw payment credential.

### 4.2 Webhook verification and processing

| ID | Requirement | State | Verification |
| --- | --- | --- | --- |
| KROWDS-INT-040 | The Xendit webhook endpoint shall be HTTPS, reject oversized or malformed bodies, and have a dedicated route that is not used for browser application traffic. | Confirmed decision | Endpoint and request-size test |
| KROWDS-INT-041 | The endpoint shall read the raw request bytes without JSON re-encoding and verify the provider event using the current Xendit-supported signature or token mechanism, a managed secret, constant-time comparison, and an acceptable timestamp/replay window. The exact mechanism and version are TBD by Payments Engineering. | Confirmed decision; exact scheme TBD | Valid, invalid, missing, and replayed signature tests |
| KROWDS-INT-042 | A verified event shall be written to a durable inbox or equivalent durable record with a unique provider event ID before the HTTP success response. Processing shall be resumable after a process crash. | Confirmed decision | Crash and retry test |
| KROWDS-INT-043 | Duplicate event IDs and duplicate logical transactions shall be no-ops. A repeated request shall return the existing result without issuing a second ticket, wristband, refund, or access entitlement. | Confirmed decision | Duplicate delivery test |
| KROWDS-INT-044 | Payment processing shall use the canonical payment states `created`, `pending`, `authorized`, `paid`, `failed`, `expired`, and `refunded`. Refund processing shall use `requested`, `exceptional_review`, `processing`, `succeeded`, `failed`, `cancelled`, and `rejected`. A partial-refund state is not part of the MVP. A terminal state shall not be silently reversed by an out-of-order event. | Confirmed decision | State-machine test |
| KROWDS-INT-045 | A ticket or wristband shall become paid or active only when the transaction reaches `Paid` through verified provider evidence. Client redirects, local callbacks, and staff actions cannot set the terminal state. | Confirmed decision | End-to-end payment test |
| KROWDS-INT-046 | An event older than the accepted replay window, with an unknown transaction, with an amount mismatch, or with an invalid state transition shall be rejected from normal activation, recorded, and sent to reconciliation. | Confirmed decision | Mismatch and stale-event test |
| KROWDS-INT-047 | Webhook payloads and provider responses shall be logged with redaction. Full identity documents, bearer tokens, secrets, and raw payment credentials shall never enter logs. | Confirmed decision | Log scan |

### 4.3 Idempotency and reconciliation

| ID | Requirement | State | Verification |
| --- | --- | --- | --- |
| KROWDS-INT-050 | Create, cancel, refund, and retry operations that can create financial state shall use a stable idempotency key tied to the internal transaction and operation. Browser retry keys shall be scoped to actor, method, route, and organization and retained for 24 hours; provider-operation deduplication uses a 30-day inbox/index window. | Confirmed baseline; long-term audit references follow retention | Timeout and repeated-request test |
| KROWDS-INT-051 | Retries shall occur only for transient errors, use exponential backoff with jitter, respect provider retry guidance, and stop after a bounded attempt count. Non-retryable validation or authentication errors shall page the owning role. | Confirmed decision | Fault-injection test |
| KROWDS-INT-052 | A scheduled reconciliation job runs daily to compare KROWDS payment state with Xendit state, identify missing, duplicate, amount-mismatched, or stale transactions, and create an auditable case rather than silently correcting a ticket or wristband. Finance performs a weekly sign-off. | Confirmed baseline | Daily reconciliation and weekly sign-off evidence |
| KROWDS-INT-053 | Refunds shall be full-order only, requested before Bound/Used and within 7 calendar days after verified payment, and preserve the original provider reference, actor, reason, approver, amount, and result. A later request enters `exceptional_review` and requires a dual-approved Finance decision before provider submission. A partial amount is rejected, and a used or bound ticket is not eligible. | Confirmed baseline | Refund integration, seven-day boundary, and exceptional-review test |
| KROWDS-INT-053A | If Xendit rejects or exhausts a refund, KROWDS shall keep the refund in `failed` and open reconciliation; it shall not automatically restore ticket access or permit manual settlement. | Confirmed baseline | Provider-failure and reconciliation test |
| KROWDS-INT-054 | Webhook secret rotation shall support an overlap window or dual-version verification, with old secrets revoked after the provider cutover and a recorded end date. | Confirmed decision | Rotation test |
| KROWDS-INT-055 | Payment production release shall pass sandbox tests for valid payment, failed payment, expiry, cancellation, duplicate event, out-of-order event, refund, invalid signature, replay, timeout, and secret rotation. | Confirmed decision | Release evidence |

The provider dashboard shall never be the only copy of a transaction record. KROWDS shall retain the approved internal and provider references needed for support and reconciliation, subject to the privacy retention decision.

## 5. Resend transactional email

### 5.1 Resend domains and sending identity

| ID | Requirement | State | Verification |
| --- | --- | --- | --- |
| KROWDS-INT-060 | Resend sending shall use KROWDS-owned domain names. Shared or unverified Resend domains shall not be used for production user, OTP, payment, or security messages. | Confirmed decision | Domain inventory and DNS check |
| KROWDS-INT-061 | Each production sending domain shall have valid SPF, DKIM, and DMARC records, an approved return-path, and a documented owner. The default is a dedicated `mail.<approved-domain>` transactional subdomain. Domain records shall be changed only through the domain owner and incident process. | Confirmed baseline; actual hostname TBD | DNS and configuration review |
| KROWDS-INT-062 | The Resend API credential shall be stored in Secret Manager and used only by the backend notification service. It shall not appear in frontend bundles, URLs, source, logs, screenshots, or support notes. | Confirmed decision | Secret scan and runtime check |
| KROWDS-INT-063 | A sending-domain outage or suspension shall not change an OTP verification result, payment state, or ticket state. Messages that cannot be accepted remain pending and are retried or routed to the approved fallback process. | Confirmed decision | Provider-outage test |

### 5.2 Message content and categories

KROWDS-INT-064 — KROWDS shall maintain an approved Resend message catalog: a controlled set of versioned message definitions for account verification, account recovery, organization onboarding, team invitations, ticket purchase, payment status, wristband fulfillment, access notices, and security alerts.

KROWDS-INT-065 — The backend shall select content by stable message category and version. Callers shall not submit arbitrary HTML, arbitrary sender identity, or unrestricted message data.

KROWDS-INT-066 — Message content shall include only data necessary for the recipient and purpose. A message shall not include a full identity number, identity-document image, bank account, payment credential, full QR token, password, or OTP value.

KROWDS-INT-067 — Changes to message content, sender, reply-to, links, or domain shall require review by Notifications Engineering and Security Engineering. Changes that affect legal notice or consent language also require Privacy and Legal Counsel approval. Review is required on every material change and at least quarterly while the integration is active.

### 5.3 Resend OTP rate limits

The following values are the confirmed secure baseline for the MVP. Provider and security configuration may tighten them, but production must not silently weaken them.

| Control | Draft production rule | State |
| --- | --- | --- |
| OTP generation | Six cryptographically random digits generated by the backend; the readable value is never logged or sent to an analytics event | Draft control baseline; format gate `KROWDS-OD-025` |
| OTP expiry | 15 minutes from issuance, with a single active code per account or verified destination | Confirmed baseline; final provider delivery timing may be shorter |
| Resend cooldown | One new OTP request per destination every 60 seconds | Confirmed baseline |
| Destination limit | No more than 5 OTP sends to one destination in 15 minutes and no more than 10 in 24 hours | Confirmed baseline; provider evidence may tighten only |
| Account and network limit | No more than 10 requests per account in 24 hours; per-IP and per-device limits shall be at least as protective as the provider-safe limit | Confirmed baseline; provider evidence may tighten only |
| Verification attempts | No more than 5 failed checks per code; the code is invalidated and a new code is required | Confirmed baseline |
| User response | Return a generic response that does not reveal whether an account, email, identity, or organization exists | Confirmed decision |
| Delivery failure | A bounce, complaint, or provider error shall not mark the address as verified or verified a user | Confirmed decision |

| ID | Requirement | State | Verification |
| --- | --- | --- | --- |
| KROWDS-INT-068 | The backend shall generate, hash for verification, expire, invalidate, and rate-limit OTPs. The readable OTP shall exist only for the minimum dispatch and verification path. The MVP baseline is a 15-minute expiry, five failed attempts, a 60-second resend cooldown, and the API route-class limits. | Confirmed baseline | OTP unit and integration tests |
| KROWDS-INT-069 | Resend API rate limits shall be combined with KROWDS limits. HTTP 429 and provider throttling responses shall be retried only within the bounded policy and shall not cause a new unlimited request loop. | Confirmed decision | Provider-throttle test |
| KROWDS-INT-070 | A new OTP shall invalidate the previous unread code. A successful verification shall consume the code and prevent replay. | Confirmed decision | Replay and resend test |
| KROWDS-INT-071 | OTP requests shall be subject to account, destination, device, and network limits and shall use generic responses to prevent account enumeration. | Confirmed baseline; provider evidence may tighten only | Enumeration and abuse test |
| KROWDS-INT-072 | OTP messages shall be delivered through an approved KROWDS domain and shall not include unrelated ticket, payment, identity, or organization information. | Confirmed decision | Message-content review |

### 5.4 Resend bounces, complaints, and delivery status

| ID | Requirement | State | Verification |
| --- | --- | --- | --- |
| KROWDS-INT-073 | Resend delivery-status webhooks shall verify the raw body using the Svix `svix-id`, `svix-timestamp`, and `svix-signature` values, reject stale or invalid signatures, store the event idempotently, and apply it to the correct message ID. | Confirmed decision | Invalid and replay tests |
| KROWDS-INT-074 | A hard bounce shall suppress further delivery to that destination immediately. A soft bounce shall use bounded exponential retries and be suppressed after three failed delivery attempts within 24 hours unless an approved recovery action is taken. | Confirmed baseline; legal/security wording remains gated | Bounce-simulation test |
| KROWDS-INT-075 | A complaint shall suppress the destination immediately for marketing and non-essential messages. Service-security messages shall follow the approved legal and security policy and shall not be silently treated as optional marketing. | Confirmed decision; legal wording TBD | Suppression test |
| KROWDS-INT-076 | KROWDS shall keep an address-level suppression state with reason, source, timestamp, and responsible role. Resending to a suppressed address requires an approved recovery or account-verification flow. | Confirmed decision | State-transition test |
| KROWDS-INT-077 | Delivery metrics shall report delivery, hard bounce, soft bounce, and complaint rates without exposing recipient addresses. Use the approved starting alert thresholds in `KROWDS-NFR-050`; named destinations remain a release gate. | Confirmed baseline; destination evidence required | Dashboard and alert test |
| KROWDS-INT-078 | An email failure shall never change payment, ticket, wristband, or identity state by itself. Email delivery is evidence of notification attempt, not proof that the recipient read, verified, or accepted a transaction. | Confirmed decision | End-to-end failure test |
| KROWDS-INT-079 | OTP, account, payment, and security messages shall be queued or retried through the backend notification boundary. The browser shall not call Resend directly. | Confirmed decision | Network and bundle inspection |

## 6. Biteship domestic shipping

KROWDS uses Biteship for domestic fulfillment of physical wristband orders. The baseline is domestic, organization-paid (org-paid), and no COD. This is an operational integration; it is not a payment collection path and does not authorize cash collection.

| ID | Requirement | State | Verification |
| --- | --- | --- | --- |
| KROWDS-INT-080 | The baseline shipping route is domestic Indonesia. International addresses and cross-border shipping shall not be enabled through this integration. | Confirmed decision | Address validation and routing test |
| KROWDS-INT-081 | The organization account pays Biteship. KROWDS requests a live Biteship quote from the organization account and parcel profile, shows it as an organization-paid cost, and does not offer, display, or accept customer COD. | Confirmed baseline | UI, API, quote, and contract test |
| KROWDS-INT-082 | The order service shall reject a fulfillment request when a COD option is present or configured, and shall alert Fulfillment Operations rather than converting it to a paid shipment. | Confirmed decision | COD-negative test |
| KROWDS-INT-083 | KROWDS shall send the minimum data required for a domestic shipment: order reference, sender and recipient contact, domestic address, parcel dimensions or weight, and the organization-selected service from the approved domestic allowlist. Customers do not select couriers. | Confirmed baseline | Payload and allowlist inspection |
| KROWDS-INT-084 | KROWDS shall not send identity documents, ticket-holder identity numbers, bank information, payment credentials, full QR payloads, access entitlements, or unrelated customer data to Biteship. | Confirmed decision | Payload and log scan |
| KROWDS-INT-085 | Shipment creation and label purchase shall use a stable idempotency key derived from the approved order and fulfillment attempt. A timeout retry shall not create duplicate labels or charges. | Confirmed decision | Retry test |
| KROWDS-INT-086 | Biteship credentials shall be stored in Secret Manager. The fulfillment adapter shall enforce connect and read timeouts, bounded retries, circuit breaking, and structured redacted logs. | Confirmed decision | Secret and fault-injection test |
| KROWDS-INT-087 | Tracking and delivery events shall use a verified Biteship signature over the raw provider payload, reject missing or invalid signatures, deduplicate events, and apply them only to the matching order and shipment. The exact header and signature version are TBD by Fulfillment Operations and Security Engineering. | Confirmed decision; exact scheme TBD | Webhook tests |
| KROWDS-INT-088 | A shipping outage shall leave the order in an auditable pending or operationally blocked state. KROWDS shall not mark an order delivered without provider evidence or an approved manual reconciliation. | Confirmed decision | Provider-outage test |
| KROWDS-INT-089 | COD, duplicate label, wrong address, lost parcel, return, and delivery-failure cases shall have customer-support and organization-owner workflows with no silent state change. A failed/lost/returned shipment may enter `reshipment_pending` only after KREW fulfillment approval; the original shipment remains immutable. | Confirmed baseline | Operations tabletop and reshipment test |
| KROWDS-INT-090 | Biteship data regions, retention, subprocessors, and deletion commitments are TBD pending legal review. The integration must not be enabled with an unapproved transfer path. | TBD; legal gate | Contract and transfer review |

## 7. GCP / Google Cloud integration

### 7.1 GCP Secret Manager

| ID | Requirement | State | Verification |
| --- | --- | --- | --- |
| KROWDS-INT-100 | All production provider credentials, webhook secrets, signing keys, database credentials, and encryption references shall be stored in Secret Manager under environment- and service-specific names. | Confirmed decision | Secret inventory and IAM review |
| KROWDS-INT-101 | The backend shall access secrets through its workload identity and the narrowest secret accessor role. Secret values shall not be passed to frontend processes, client logs, build arguments, or support tools. | Confirmed decision | Runtime and bundle inspection |
| KROWDS-INT-102 | Secret versions shall be readable only by the intended environment and service. Production secrets shall not be copied to development, staging, local files, or CI variables. | Confirmed decision | Environment isolation test |
| KROWDS-INT-103 | Rotation and revocation shall be rehearsed for every provider. A compromised secret shall be revoked without waiting for a normal deployment cycle; routine rotation is at least every 90 days with a 24-hour overlap where required. | Confirmed baseline | Rotation exercise |

### 7.2 Cloud SQL and row-level security

| ID | Requirement | State | Verification |
| --- | --- | --- | --- |
| KROWDS-INT-110 | Cloud SQL shall be reachable only through private connectivity from approved workloads. Public IP access and broad database firewall rules are prohibited. | Confirmed decision | Network configuration review |
| KROWDS-INT-111 | The runtime database identity shall have only the schemas, tables, sequences, and commands required by the backend. Migrations and break-glass shall use separate identities and approvals. | Confirmed decision | Database privilege review |
| KROWDS-INT-112 | Every tenant-owned table shall include an organization scope and PostgreSQL RLS with enforcement forced for the runtime role. The server shall derive organization context from the authenticated session, not from a caller-provided arbitrary value. | Confirmed decision | Cross-tenant test |
| KROWDS-INT-113 | Queries that intentionally operate across organizations shall use a separately authorized service and an auditable use case. A direct client request shall never select that scope. | Confirmed decision | Query and audit review |
| KROWDS-INT-114 | Database backups, replicas, and exports shall be encrypted, access-logged, and follow the confirmed 7/14/35-day backup retention and 15-minute/4-hour RPO/RTO baseline. | Confirmed baseline | Backup policy review |

### 7.3 Cloud Storage

| ID | Requirement | State | Verification |
| --- | --- | --- | --- |
| KROWDS-INT-120 | Cloud Storage buckets shall be private, use uniform bucket-level access, deny public ACLs, and require authenticated backend access. | Confirmed decision | Bucket-policy scan |
| KROWDS-INT-121 | Production and wristband production files shall be stored in separate buckets or equivalent boundaries. Object names and metadata shall not contain names, identity numbers, addresses, or other unnecessary PII. | Confirmed decision | Object metadata review |
| KROWDS-INT-122 | Authorized downloads shall use short-lived signed URLs. The default maximum expiry is 15 minutes; a longer expiry requires a documented business and security approval. | Confirmed baseline | URL-expiry test |
| KROWDS-INT-123 | Uploads and downloads shall be logged with actor, object ID, purpose, classification, and outcome. Download URLs and file contents shall not be placed in ordinary logs. | Confirmed decision | Access-log review |
| KROWDS-INT-124 | Lifecycle, versioning, retention, and deletion behavior shall be configured per bucket and approved by Privacy and Legal Counsel. Production documents shall not be moved to personal accounts or unmanaged drives. | Confirmed baseline; legal evidence required | Lifecycle and deletion review |

### 7.4 BigQuery

| ID | Requirement | State | Verification |
| --- | --- | --- | --- |
| KROWDS-INT-130 | Production analytics shall use separate datasets, authorized views, and least-privilege service identities. Direct table access to raw personal or payment data shall be disabled by default. | Confirmed decision | Dataset IAM review |
| KROWDS-INT-131 | BigQuery events shall be minimized before ingestion. User and organization identifiers shall be pseudonymous where possible, and joins to identity tables shall require an approved purpose and access group. | Confirmed decision | Event-schema review |
| KROWDS-INT-132 | Raw card data, CVV, passwords, OTPs, secrets, full QR tokens, and unrestricted identity documents shall never be ingested. | Confirmed decision | Automated scan and query audit |
| KROWDS-INT-133 | Dataset and table expiration, deletion, export, and backup behavior shall follow the canonical retention matrix. Legal exceptions and provider-specific copy behavior require evidence. | Confirmed baseline; legal/provider evidence required | Lifecycle review |
| KROWDS-INT-134 | BigQuery queries, exports, service-account impersonation, and policy changes shall be logged and alertable. A production query that returns Restricted fields shall require an approved case and additional access where policy requires it. | Confirmed baseline; access-group evidence required | Audit and alert test |

### 7.5 Cloud Run authentication

Cloud Run auth is mandatory: direct anonymous invocation is denied, and the browser-to-API identity-forwarding design is approved before public API launch.

| ID | Requirement | State | Verification |
| --- | --- | --- | --- |
| KROWDS-INT-140 | The Cloud Run backend service shall require authenticated invocation. Anonymous direct invocation shall return an access denial. | Confirmed decision | Unauthenticated request test |
| KROWDS-INT-141 | Browser traffic shall reach the backend through the approved secure API gateway/identity-aware path; the browser holds only secure HttpOnly SameSite cookies, and a Next.js route, Server Action, or proxy shall not be used. | Confirmed baseline; hostname TBD | End-to-end request trace |
| KROWDS-INT-142 | Service-to-service calls shall use workload identity or short-lived identity tokens. Static service-account keys in the backend are prohibited. | Confirmed decision | IAM and secret scan |
| KROWDS-INT-143 | Cloud Run ingress, IAM invoker roles, and organization routing shall be environment-specific. A production identity shall not invoke staging or development services. | Confirmed decision | Cross-environment test |
| KROWDS-INT-144 | Health and readiness endpoints shall disclose no personal data, secret, internal topology, or stack detail and shall not bypass the authenticated public API boundary. | Confirmed decision | Endpoint and response review |

## 8. Google OAuth/OIDC provider

Google sign-in is supported by the product baseline but is a separate identity path from email/password.

| ID | Requirement | State | Verification |
| --- | --- | --- | --- |
| KROWDS-INT-150 | Google sign-in shall use the supported OIDC authorization flow with state, nonce, redirect validation, and the minimum approved scopes. | Confirmed decision | OIDC flow test |
| KROWDS-INT-151 | KROWDS shall store the stable provider subject and verified email state. A provider-verified email may support an explicit authenticated linking prompt, but no account may merge silently or solely from an unverified email match. | Confirmed baseline | Account-linking test |
| KROWDS-INT-152 | KROWDS shall not request Gmail, Drive, contacts, or other unrelated scopes. | Confirmed decision | Scope inspection |
| KROWDS-INT-153 | Google OAuth/OIDC accounts assigned to KREW, Platform Admin, Finance, or Organization Admin roles shall still meet the privileged MFA and access-review requirements. A provider login is not a substitute for KROWDS role authorization. | Confirmed decision | Privileged-access test |
| KROWDS-INT-154 | Provider outage, unverified email, account conflict, and revoked consent shall have a safe fallback or a clear recovery path. No fallback may create duplicate identities silently. | Confirmed decision; fallback timing TBD | Failure and recovery test |
| KROWDS-INT-155 | Google OAuth/OIDC provider data transfers, retention, region, and account-deletion behavior are TBD pending legal review. | TBD; legal gate | Transfer and deletion review |

## 9. Common provider contract

### 9.1 Request controls

| ID | Requirement | State | Verification |
| --- | --- | --- | --- |
| KROWDS-INT-160 | Every external call shall have a request ID, service name, operation, provider, non-sensitive correlation data, and structured outcome. | Confirmed decision | Log schema review |
| KROWDS-INT-161 | Outbound calls shall use HTTPS, provider-specific hostname validation, bounded request size, and a connect/read timeout. Default baseline: connect timeout no greater than 3 seconds and read timeout no greater than 10 seconds, unless a provider contract requires a reviewed exception. | Confirmed baseline; provider exception evidence required | Fault-injection test |
| KROWDS-INT-162 | Retries shall be limited to transient network, timeout, rate-limit, and documented provider errors. A non-idempotent operation without an idempotency key shall not be retried automatically. | Confirmed decision | Retry audit |
| KROWDS-INT-163 | Each adapter shall have a timeout, bounded retry, circuit-breaker, and provider-specific health signal. One unavailable provider shall not exhaust the backend resources needed for unrelated requests. | Confirmed decision | Load and outage test |
| KROWDS-INT-164 | Provider responses shall be schema-checked before domain state changes. Unknown fields, incompatible versions, missing required fields, and ambiguous statuses shall fail closed or enter reconciliation. | Confirmed decision | Contract test |
| KROWDS-INT-165 | Provider payloads shall be minimized before they enter logs, metrics, traces, queues, or BigQuery. Personal data shall not be added merely because a provider returns it. | Confirmed decision | Data-flow and log scan |

### 9.2 Webhook and queue controls

| ID | Requirement | State | Verification |
| --- | --- | --- | --- |
| KROWDS-INT-170 | Each provider webhook shall use a separate secret or identity, a verification step, a durable inbox, a unique event key, and a bounded replay/reconciliation process. | Confirmed decision | Webhook resilience test |
| KROWDS-INT-171 | A webhook endpoint shall acknowledge only after durable receipt or a documented safe handoff. Repeated delivery, delayed delivery, and concurrent delivery shall be safe. | Confirmed decision | Retry and concurrency test |
| KROWDS-INT-172 | A failed job shall enter a dead-letter or operator-review state after the bounded retry policy. Replay shall be authorized, logged, and idempotent. | Confirmed decision | Dead-letter and replay test |
| KROWDS-INT-173 | Queue and job messages shall contain references rather than unnecessary full identity or payment payloads. A stale message shall not recreate deleted or closed records. | Confirmed decision | Queue-content review |
| KROWDS-INT-174 | Every provider integration shall have a reconciliation or health report showing pending, failed, duplicate, and stuck records with an owner. | Confirmed decision | Operational dashboard review |
| KROWDS-INT-175 | Cloud Tasks shall use stable task IDs, authenticated invocation, at-least-once delivery, bounded retries, and idempotent handlers. A task payload shall contain references rather than unnecessary full identity, payment, or QR data. | Confirmed decision | Task duplicate, crash, and payload tests |
| KROWDS-INT-176 | Cloud Scheduler shall use authenticated invocation, an expected audience, a durable execution key, and an overlap lock. A missed or overlapping job shall not silently mark work complete. | Confirmed decision | Scheduler overlap and missed-run tests |
| KROWDS-INT-177 | Memorystore integration shall be rebuildable from Cloud SQL or request data. Cache loss, eviction, or outage shall not erase authoritative payment, ticket, wristband, shipping, or audit state. | Confirmed decision | Cache-outage and rebuild test |
| KROWDS-INT-178 | Cloud Logging, Error Reporting, and Monitoring shall receive only redacted operational data and shall be used for diagnosis and alerting, never as a business-state authority. | Confirmed decision | Telemetry scan and alert test |

### 9.3 Observability and alerts

Required signals include:

- request rate, latency, error rate, and timeout rate by provider and operation;
- authentication and signature-verification failures;
- webhook receipt, verification failure, duplicate, replay, and processing lag;
- payment amount, status, and reconciliation mismatches without personal data;
- Resend send, delivery, bounce, complaint, suppression, and rate-limit signals;
- Biteship label, tracking, delivery, and COD-block signals;
- Secret Manager access denial and rotation events;
- Cloud Run unauthenticated invocation, 401, 403, and 5xx signals;
- Cloud SQL RLS denial, cross-organization denial, and abnormal query volume; and
- Cloud Storage unexpected bulk downloads and BigQuery restricted-query activity.

Alert thresholds, dashboard owners, paging destinations, and on-call rotation use the approved starting thresholds in `KROWDS-NFR-050`; named destinations and roster evidence remain release gates in [OPEN-DECISIONS.md](../00-governance/OPEN-DECISIONS.md). An alert shall point to a runbook and a case ID, not expose personal data.

## 10. Provider failure, incident response, and fallback behavior

Provider failures and suspected provider security events follow the incident response process in `SECURITY.md`: declare severity, preserve evidence, contain safely, reconcile authoritative state, and notify the required role.

| Failure | Required behavior | User-visible result | Owner |
| --- | --- | --- | --- |
| Xendit unavailable before payment creation | Do not create a local success; allow retry when safe; show payment temporarily unavailable | No ticket or wristband activation | Payments Engineering — personal name: TBD |
| Xendit webhook delayed | Keep transaction pending; process durable verified event when received; reconcile by provider reference | Order remains pending with clear status | Payments Engineering — personal name: TBD |
| Xendit webhook invalid or replayed | Reject, record redacted evidence, alert on repeated failures; do not change state | Transaction remains unchanged and may require support | Security Engineering — personal name: TBD |
| Resend unavailable | Queue or retry transactional message; do not mark OTP verified; use approved fallback only | Verification or notice is delayed | Notifications Engineering — personal name: TBD |
| Resend hard bounce or complaint | Suppress destination and record reason; do not repeatedly send | Address requires approved recovery | Notifications Engineering — personal name: TBD |
| Biteship unavailable | Keep physical order blocked or pending; do not mark delivered or release dependent state | Fulfillment status is delayed | Fulfillment Operations — personal name: TBD |
| Biteship COD response | Reject COD, create an operations case, and never silently treat it as organization-paid | Customer is not offered COD | Fulfillment Operations — personal name: TBD |
| Google Cloud Storage unavailable | Deny document/file access; use a documented recovery path; never substitute a public URL | File unavailable with safe error | Platform/SRE — personal name: TBD |
| BigQuery unavailable | Continue approved transactional operation; buffer or drop non-critical analytics according to policy; never block payment on an unapproved analytics write | Analytics delayed, core flow continues where approved | Data Platform — personal name: TBD |
| Cloud Run unauthenticated request | Reject at edge/IAM; do not reveal backend details | Safe access-denied response | Platform/SRE — personal name: TBD |
| Secret unavailable | Fail closed for the operation that needs it; alert; do not use a default credential or client-side workaround | Service action temporarily unavailable | Platform/SRE — personal name: TBD |

Fallback behavior must preserve payment correctness, identity isolation, QR anti-replay, privacy, and auditability. Convenience must not turn an unverified provider state into a successful KROWDS state.

## 11. Provider security and privacy acceptance

| ID | Acceptance check | Pass condition | Owner |
| --- | --- | --- | --- |
| KROWDS-INT-180 | Provider inventory and data map | Every provider, purpose, field, region, role, secret, retention, and owner is documented and approved | Platform Integration Engineering — personal name: TBD |
| KROWDS-INT-181 | Xendit payment test | Hosted/tokenized flow, signature verification, duplicate/out-of-order processing, reconciliation, refund, and secret rotation pass | Payments Engineering — personal name: TBD |
| KROWDS-INT-182 | Resend domain and message test | Domain ownership and DNS records pass; approved message content is sent; Svix webhook verification, OTP limits, bounce, complaint, and suppression behavior pass | Notifications Engineering — personal name: TBD |
| KROWDS-INT-183 | Biteship domestic test | Indonesia address routing, organization-paid billing, COD rejection, idempotent label creation, tracking, and provider failure behavior pass | Fulfillment Operations — personal name: TBD |
| KROWDS-INT-184 | Google Cloud access test | Secret Manager, Cloud SQL RLS, private Memorystore, private Storage, restricted BigQuery, authenticated Cloud Run, Cloud Tasks, Cloud Scheduler, Logging, Error Reporting, and Monitoring controls pass from external and internal test identities | Platform/SRE — personal name: TBD |
| KROWDS-INT-185 | Google OAuth/OIDC provider test | OIDC validation, minimal scopes, account-linking safety, privileged-role MFA, fallback, and deletion behavior pass | Identity Engineering — personal name: TBD |
| KROWDS-INT-186 | Data minimization test | No raw card data, secret, OTP, full identity document, or full QR token appears in provider logs, application logs, analytics, or exports | Privacy and Security Engineering — personal names: TBD |
| KROWDS-INT-187 | Resilience test | Timeout, 429, 5xx, duplicate event, crash, replay, and provider outage produce safe, observable, recoverable states | Platform Integration Engineering — personal name: TBD |
| KROWDS-INT-188 | Legal gate evidence | Provider terms, data transfer, retention, deletion, and subprocessor decisions are signed by Privacy and Legal Counsel | Privacy and Legal Counsel — personal name: TBD |

## 12. Open decisions and release blockers

External integration gates are mirrored in [OPEN-DECISIONS.md](../00-governance/OPEN-DECISIONS.md). A sandbox or isolated test may proceed, but production data and release approval remain blocked until the central register is updated with evidence.

| ID | Open decision | State | Owner | Release effect |
| --- | --- | --- | --- | --- |
| KROWDS-INT-190 | Xendit account, product, webhook verification version, and settlement/reconciliation ownership | External identifiers TBD; daily reconciliation and weekly Finance sign-off confirmed; settlement SLA tracked by `KROWDS-OD-027` | Payments Engineering — personal name: TBD | Blocks payment production |
| KROWDS-INT-191 | Resend domains, DNS records, message content versions, and evidence for the accepted rate/suppression baseline | Confirmed baseline; external domain/content evidence required | Notifications Engineering — personal name: TBD | Blocks email production |
| KROWDS-INT-192 | Biteship account, API version, domestic service coverage, webhook verification, and no-COD contract setting | TBD | Fulfillment Operations — personal name: TBD | Blocks shipping production |
| KROWDS-INT-193 | Legal approval of the confirmed `asia-southeast2` target, data residency, CMEK, RLS role design, BigQuery access model, and Cloud Run identity-forwarding path | TBD; legal gate for residency | Platform/SRE and Privacy and Legal Counsel — personal names: TBD | Blocks production data storage/API |
| KROWDS-INT-194 | Google OAuth/OIDC provider scopes, account-linking rule, and provider data-transfer terms | TBD pending legal | Identity Engineering and Privacy and Legal Counsel — personal names: TBD | Blocks Google sign-in release |
| KROWDS-INT-195 | Final provider retention, deletion, and data-subject request propagation | TBD pending legal | Privacy and Legal Counsel — personal name: TBD | Blocks personal-data production flow |
| KROWDS-INT-196 | Evidence for the accepted timeout, bounded retry, rate-limit, alert, and reconciliation baseline; named destinations remain a release gate | Confirmed baseline; operational evidence required | Platform Integration Engineering and Security Operations — personal names: TBD | Blocks operational approval |
| KROWDS-INT-197 | Named escalation contacts and provider support cases | TBD | Platform/SRE and provider owners — personal names: TBD | Blocks incident readiness |

A TBD integration decision may be tested in an isolated non-production environment, but production data and release approval are blocked until the decision is recorded.

## 13. Related documents

- [KROWDS product vision](../01-product/PRODUCT-VISION.md)
- [KROWDS product baseline](../01-product/KROWDS.md)
- [Security requirements](../05-security/SECURITY.md)
- [Privacy requirements](../05-security/PRIVACY.md)
- [Architecture](../03-architecture/ARCHITECTURE.md)
- [Deployment](../07-operations/DEPLOYMENT.md)
- [API contract](../04-domain/API-CONTRACT.md)
- [Data model](../04-domain/DATA-MODEL.md)
- [Non-functional requirements](../02-requirements/NFR.md)
- [Risk register](../05-security/RISK-REGISTER.md)
- [Open decisions and release gates](../00-governance/OPEN-DECISIONS.md)
