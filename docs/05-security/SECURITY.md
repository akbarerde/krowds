# KROWDS-SECURITY-001 — Security, Trust, and Operations Requirements

## Metadata

| Field | Value |
| --- | --- |
| Document ID | `KROWDS-SECURITY-001` |
| Version | `0.1` |
| Status | `Draft` |
| Release label | `0.1 Draft` |
| Last updated | `2026-09-24` |
| Scope | KROWDS web, auth, Krew, Org, and PWA clients; the Go + Gin backend; Google Cloud infrastructure; and external providers |
| Canonical product reference | [KROWDS Product Vision](../01-product/PRODUCT-VISION.md) |
| Security owner | Security Engineering — personal name: TBD |
| Operations owner | Platform/SRE — personal name: TBD |
| Privacy reviewer | Privacy and Legal Counsel — personal name: TBD |
| Payments reviewer | Payments Engineering — personal name: TBD |
| Review rule | Security approval is required before a control is enabled in production |

## 1. Purpose and boundary

This document defines the security and operational controls that KROWDS must enforce around identity, organizations, payments, tickets, wristbands, access, email, shipping, and cloud infrastructure. It covers PII classification, provider bounce handling, and the domestic organization-paid Biteship baseline. It is a requirements baseline, not a legal opinion.

The architecture boundary remains unchanged:

- Next.js applications render and manage browser flows only.
- The Go + Gin service at `services/cmd/server` is the only backend and owns authentication, authorization, persistence, queues, and business workflows.
- Frontend calls to the backend use `@krowds/api`; no provider secret, database credential, or backend authorization decision belongs in a browser or PWA.
- KROWDS remains one deployable backend process. Security controls must be enforced in the backend application, not only in the UI.
- The target runtime uses Cloud Run, Cloud SQL PostgreSQL with organization-scoped RLS, Memorystore for rebuildable cache and short-lived coordination, Cloud Tasks, Cloud Scheduler, Cloud Storage, Secret Manager, Cloud Logging, Error Reporting, Monitoring, and BigQuery.
- The MVP is online-first, IDR-only, and single-use. Ticket transfer, re-entry, multi-use, and offline gate access are not enabled by a security workaround.

This document uses the following labels:

- **Confirmed decision** — a baseline decision for this draft and a required implementation constraint.
- **TBD** — an unresolved choice. A TBD item may not be silently assumed or implemented in production.
- **Legal gate** — an item that requires written review by Privacy and Legal Counsel.

## 2. Confirmed decisions and blocking gates

| ID | Decision or gate | State | Owner |
| --- | --- | --- | --- |
| KROWDS-SEC-001 | KROWDS is Indonesia-first. A privacy and legal review must approve the data map, notices, purposes, legal bases, vendors, retention, rights handling, and incident obligations before production use. | Confirmed decision; legal gate blocks launch | Privacy and Legal Counsel — personal name: TBD |
| KROWDS-SEC-002 | Human access is individual. Shared passwords, shared QR access, and shared staff accounts are prohibited. | Confirmed decision | Security Engineering — personal name: TBD |
| KROWDS-SEC-003 | KREW, Platform Admin, Finance, and Organization Admin accounts must use multi-factor authentication for privileged access. Other staff roles require MFA when the approved role-risk policy classifies their access as privileged; consumer accounts are not required to enroll by default. Email OTP alone is not sufficient for privileged access. | Confirmed decision | Security Engineering — personal name: TBD |
| KROWDS-SEC-004 | KROWDS never stores or processes raw card numbers, card verification values, or equivalent payment credentials. Xendit-hosted or tokenized collection is required. | Confirmed decision | Payments Engineering — personal name: TBD |
| KROWDS-SEC-005 | A ticket or wristband becomes paid or active only after a verified payment-provider event. Staff confirmation is not a substitute for provider evidence. | Confirmed decision | Payments Engineering — personal name: TBD |
| KROWDS-SEC-006 | QR credentials are opaque references, not containers for personal data. Server-side state and atomic validation govern redemption and access. | Confirmed decision | Product and Security Engineering — personal names: TBD |
| KROWDS-SEC-007 | Production configuration uses Google Cloud Secret Manager, private Cloud SQL connectivity, private Cloud Storage, restricted BigQuery access, and authenticated Cloud Run invocation. | Confirmed decision | Platform/SRE — personal name: TBD |
| KROWDS-SEC-008 | All sensitive actions are auditable, tenant-scoped, least-privilege, encrypted, and recoverable. | Confirmed decision | Security Engineering — personal name: TBD |
| KROWDS-SEC-009 | The tiered retention baseline and contract-plus-consent posture are defined in `PRODUCT-VISION.md`; legal wording, statutory interpretation, incident notification deadlines, and selected encryption-key ownership remain subject to legal review. | Baseline confirmed; legal gate remains | Privacy and Legal Counsel — personal name: TBD |

### 2.1 MVP security invariants

| ID | Invariant | State | Owner |
| --- | --- | --- | --- |
| KROWDS-SEC-127 | The MVP uses IDR as the only currency. Online checkout may use the approved Xendit QRIS, Virtual Account, or e-wallet methods; cashier checkout may use QRIS only. Currency conversion and non-IDR pricing are not security-supported paths. | Confirmed decision | Payments Engineering — personal name: TBD |
| KROWDS-SEC-128 | The MVP is online-first. Gate and redemption clients fail closed when the authoritative backend is unavailable; no offline grant, cached credential, or client-side authorization fallback is permitted. | Confirmed decision | Gate Operations — personal name: TBD |
| KROWDS-SEC-129 | A ticket permits at most one successful admission. Transfer, re-entry, and multi-use controls are absent, and no privileged role may create them through a hidden endpoint or administrative repair. | Confirmed decision | Product and Security Engineering — personal names: TBD |
| KROWDS-SEC-130 | QR token material is 16 cryptographically random bytes encoded as unpadded base64url without prefix, is stored only as a SHA-256 hash in PostgreSQL, and is present in plaintext only in the private production file or transient generation path. A normal API, log, analytics event, or audit record never returns the plaintext token or hash. | Confirmed decision | Data and Security Engineering — personal names: TBD |
| KROWDS-SEC-131 | The initial regional target is `asia-southeast2`. Final legal data-residency and cross-border transfer approval remains a separate privacy gate; changing the region requires architecture, legal, and recovery review. | Confirmed target; legal approval TBD | Platform/SRE and Privacy and Legal Counsel — personal names: TBD |

## 3. Security invariants

The following invariants are non-negotiable for every module and environment:

1. A user, organization, ticket, payment, or wristband can be read or changed only through a server-side authorization decision that includes the caller's identity, role, organization scope, and current resource state.
2. A denied request must not reveal whether a resource exists beyond the minimum information needed for a safe user experience.
3. A provider event, payment status, batch activation, or access decision cannot be forged by a client-provided flag.
4. Secrets, passwords, one-time passwords, private keys, and raw payment credentials never appear in source code, documentation, URLs, client storage, ordinary logs, analytics events, or support tools.
5. Access to personal data is limited by purpose, organization, role, and time. Broad or permanent access is not the default.
6. A ticket, wristband, or entitlement must not be consumed more than once. Concurrent requests must have the same result as repeated requests.
7. Every security-sensitive read, write, export, privilege change, and emergency action is attributable to an individual or a named workload identity.
8. Recovery procedures must preserve the same tenant, authorization, and audit controls as the primary system.

## 4. Actors and trust boundaries

| Actor | Trust level | Permitted boundary | Required controls |
| --- | --- | --- | --- |
| Visitor or ticket holder | Untrusted at the network boundary | Authenticated public flows and owned ticket data | Session protection, rate limits, secure QR handling, no cross-tenant reads |
| Organization administrator | Low to medium; controls one organization | Organization-scoped administration | MFA, role checks, step-up authentication, audit |
| Ticketing, cashier, redemption, and gate staff | Low; high operational impact | Assigned organization, venue, and shift scope | Individual accounts, device/session controls, least privilege, audit, and MFA when required by the approved role-risk policy |
| KREW operations | Medium; cross-organizational business access | Only approved order, production, and support functions | MFA, named accounts, just-in-time access, audit, export controls |
| Platform Admin | High; cross-tenant governance and exceptional support | Explicit, time-bounded, auditable platform actions | MFA, just-in-time access, least privilege, audited privileged support; KROWDS break-glass remains KREW-only |
| Payments and support staff | Medium; sensitive financial context | Specific payment, refund, or support case | MFA when required by the approved role-risk policy, case-bound access, redaction, audit |
| Go + Gin backend | Trusted workload boundary | Application and infrastructure ports | Workload identity, secret access, dependency isolation, security headers |
| Xendit, Resend, Biteship, Google Cloud, and the Google OAuth/OIDC provider | External trust boundary | Only approved API and webhook surfaces | TLS, signature verification, secret rotation, idempotency, monitoring |
| Browser, device, or network attacker | Untrusted | Public edge and user endpoints | Encryption, validation, anti-automation, safe errors, detection |

A user role does not imply trust in the device. Every request is re-authorized on the server, including requests from internal-looking networks.

## 5. Identity, account, and access requirements

| ID | Requirement | State | Verification |
| --- | --- | --- | --- |
| KROWDS-SEC-010 | Each human user and staff member shall use a unique account tied to a verified email address and, where required, a verified identity record. Shared credentials shall be rejected and audited. | Confirmed decision | Account tests; invitation tests; log review |
| KROWDS-SEC-011 | KREW, Platform Admin, Finance, and Organization Admin accounts shall complete MFA before receiving privileged permissions. Other staff or support accounts shall complete MFA before accessing Restricted data when the approved role-risk policy requires it. The first privileged login shall not bypass enrollment. | Confirmed decision | MFA enrollment and access tests |
| KROWDS-SEC-012 | MFA recovery shall require a documented identity check, an existing factor or an approved recovery path, and an audit event. Support staff shall never disable MFA merely because a user asks. | Confirmed decision | Recovery workflow review |
| KROWDS-SEC-013 | Sensitive actions including role or permission changes, organization approval, identity-data export, refund approval, batch activation, break-glass access, and security-setting changes shall require step-up authentication or dual approval as defined by policy. | Confirmed decision | Authorization matrix and action tests |
| KROWDS-SEC-014 | Authorization shall be deny-by-default, fixed-role, organization-scoped, and enforced in the application use case. Custom roles are not part of the MVP. The frontend may hide controls but is not an authorization boundary. | Confirmed decision | Cross-organization negative tests; RLS tests |
| KROWDS-SEC-015 | Organization invitations shall be single-use, bound to an organization and role, expire, and be invalidated when the invitation is revoked. An invitation shall not grant access before acceptance and any required verification. | Confirmed decision | Invitation lifecycle tests |
| KROWDS-SEC-016 | Passwords, if used, shall be stored with a modern adaptive password hash. Passwords shall never be logged, returned by an API, included in invitations, or reused by KROWDS staff. | Confirmed decision | Code review; log scan; hash configuration review |
| KROWDS-SEC-017 | Sessions shall use secure, HTTP-only, SameSite cookies and rotating refresh credentials, with short idle timeouts, revocation on organization removal, and reauthentication after a privileged change. | Confirmed decision | Session and header tests |
| KROWDS-SEC-018 | Login, OTP, invitation, redemption, and export endpoints shall have per-account, per-device, and per-network rate limits. Responses shall not disclose whether an email, identity number, ticket, or wristband exists. | Confirmed decision | Rate-limit and enumeration tests |
| KROWDS-SEC-019 | Service identities and workload identities shall be used for backend-to-cloud and backend-to-provider calls. Long-lived shared credentials in application configuration shall be prohibited. | Confirmed decision | IAM and secret inventory review |
| KROWDS-SEC-020 | A user removed from an organization, suspended, or deactivated shall lose organization access immediately and have active sessions and pending invitations revoked. | Confirmed decision | Revocation test |
| KROWDS-SEC-021 | Authentication, authorization, identity, and access events shall carry a correlation ID, UTC timestamp, actor ID, organization ID when applicable, device/session ID, outcome, and reason code. | Confirmed decision | Schema and log review |

The confirmed privileged MFA factor baseline is TOTP or WebAuthn. Access sessions are 15 minutes, rotating refresh credentials are 30 days, and recovery links are 24 hours. Five failed MFA/recovery attempts trigger a 15-minute lockout/cooldown. Sensitive actions require step-up authentication; KREW break-glass, Restricted exports, and exceptional refunds require dual approval. The confirmed OTP baseline is a 15-minute expiry, five failed attempts, and a 60-second resend cooldown.

## 6. QR credential threat model

KROWDS uses a QR payload as a machine-readable reference to a wristband record. The QR payload shall contain only the opaque random token; the generated human-readable wristband code is a separate printed field and is not encoded in the QR. Neither the QR payload nor the production file may contain names, identity numbers, ticket data, venue or organization names, prices, payment data, entitlements, or other personal information.

The production file schema is `batch_id,wristband_code,qr_payload,schema_version`. It contains no PII. The same opaque, hash-at-rest, no-PII, and atomic-use rules apply to ticket QR credentials. The QR token shall use at least 128 bits of cryptographically secure randomness. The token shall be stored as a SHA-256 hash at rest; plaintext may exist only in the private production file and the bounded generation path. The visual wristband code is for human identification and troubleshooting; it is not encoded in the QR or a substitute for the unpredictable QR credential. QR possession alone does not prove the identity of the person presenting it. At ticket redemption, staff shall compare the physical identity with the ticket-holder record as described in the KROWDS product baseline. Gate admission shall always use an online authoritative decision and the single-use state; an offline scan is denied rather than accepted from a cache.

| ID | Threat | Impact | Required control | Residual risk and owner |
| --- | --- | --- | --- | --- |
| KROWDS-SEC-030 | A QR screenshot, photograph, or forwarded image is reused | Multiple entry, duplicate use, or false attribution | Treat the token as a secret credential; bind validation to wristband state, event, time, entitlement, and usage; atomically consume valid access | A stolen physical credential can still be presented; venue procedures and identity checks reduce but do not eliminate this risk. Product and Security Engineering — personal names: TBD |
| KROWDS-SEC-031 | A QR payload is altered to target another wristband or entitlement | Unauthorized access or operational fraud | Do not trust client-supplied fields; resolve the opaque token server-side; reject unknown, disabled, expired, or mismatched records | Database compromise remains a platform risk. Platform/SRE — personal name: TBD |
| KROWDS-SEC-032 | A valid QR is replayed concurrently by two devices | Double redemption or double access | Use a single atomic state transition with a uniqueness constraint or equivalent database primitive; return the same final result on retries | Network partitions and bad database design require load and failover tests. Payments and Platform Engineering — personal names: TBD |
| KROWDS-SEC-033 | An attacker enumerates short or predictable codes | Credential discovery and unauthorized scans | Use high-entropy tokens, rate limits, response uniformity, and alerts for enumeration patterns; do not expose bulk lookup by wristband code | A determined insider may query valid records; audit and least privilege are required. Security Engineering — personal name: TBD |
| KROWDS-SEC-034 | A lost or stolen wristband is used before it is disabled | Unauthorized entry or impersonation | Support immediate disable, replacement, and audit; invalidate prior access state where policy allows; notify the responsible organization | Physical loss cannot always be detected immediately. Venue Operations — personal name: TBD |
| KROWDS-SEC-035 | A staff member scans a wristband for an unauthorized purpose or shares a credential | Insider abuse and audit evasion | Individual accounts, role scoping, shift/device visibility, anomaly alerts, and review of every privileged scan | Legitimate operations may produce false positives. Security Operations — personal name: TBD |
| KROWDS-SEC-036 | A batch is activated before the organizer has received it | Fraudulent activation of stock | Require verified provider delivery evidence, organization receipt confirmation, and a valid Batch Activation Code; bind activation to organization, batch, and expected quantity | A stolen activation code can still be misused; rotate/revoke it and alert on reuse. Product and KREW Operations — personal names: TBD |
| KROWDS-SEC-037 | Production or print files leak credentials before activation | Large-scale credential exposure | Store files in private Cloud Storage; issue short-lived access; audit downloads; never put personal data in production files | A production or printer compromise can expose valid credentials. KREW Operations — personal name: TBD |
| KROWDS-SEC-038 | An offline scanner accepts a stale or copied credential | Access without current server state | Offline access grants are excluded from the baseline; any later offline mode requires a separately reviewed short-lived signed proof and anti-replay design | Availability trade-off requires an explicit product decision. Product Engineering — personal name: TBD |
| KROWDS-SEC-039 | A QR screenshot is decoded by an unrelated application | Privacy exposure or phishing | Keep payload opaque and minimal; show a safe domain and request identifier on enrollment materials; do not encode personal data | Presentation-layer phishing remains possible. Product and Security Engineering — personal names: TBD |

Gate scans shall record the result, reason, time, venue, device, staff identity, and credential reference. Logs shall not reproduce the full QR token.

## 7. Payment and provider trust requirements

The MVP uses IDR only. Xendit tokenization and hosted collection are the payment boundary; Xendit is authoritative for payment and full-refund state. There is no partial-refund control, staff-entered settlement, or client redirect that can grant a paid or refunded state.

| ID | Requirement | State | Verification |
| --- | --- | --- | --- |
| KROWDS-SEC-040 | Card payment collection shall use Xendit-hosted or tokenized flows. KROWDS shall not accept, store, log, or transmit raw card numbers, CVV, magnetic-stripe data, or equivalent values. | Confirmed decision | Code and configuration review; log scan; payment test |
| KROWDS-SEC-041 | Xendit webhooks shall be accepted only after raw-body verification using the current provider-supported signature or token mechanism, TLS, timestamp/replay checks, and constant-time comparison. Missing or invalid verification shall fail closed. | Confirmed decision | Invalid-signature and replay tests |
| KROWDS-SEC-042 | Each provider event shall be durably recorded with a unique provider event identifier before acknowledgement. Duplicate delivery shall be a no-op and shall not create a second payment, ticket, wristband, or refund. | Confirmed decision | Duplicate-delivery tests; database constraints |
| KROWDS-SEC-043 | Payment state transitions shall be explicit and ordered. A ticket or wristband shall be issued or activated only from a provider-confirmed successful state, never from a client redirect or a staff-entered success flag. | Confirmed decision | State-machine and integration tests |
| KROWDS-SEC-044 | Payment and refund operations shall use a stable idempotency key, bounded retries, and a reconciliation path. Out-of-order, late, and duplicate events shall not create financial or access state that contradicts the provider record. | Confirmed decision | Out-of-order and retry test suite |
| KROWDS-SEC-045 | Provider secrets, webhook credentials, and signing keys shall be stored in Secret Manager, redacted from logs, and rotated without downtime. | Confirmed decision | Secret inventory and rotation test |
| KROWDS-SEC-046 | No endpoint, role, break-glass action, or administrative repair may set a digital payment or refund to `Paid` or `Refunded`. An incident action may quarantine, reconcile, suspend, or annotate a transaction with dual approval and provider evidence, but it shall never fabricate financial state. | Confirmed decision | Negative API and privileged-action tests |

The exact Xendit account, product configuration, signing scheme version, settlement fields, and refund responsibilities are external gates in [OPEN-DECISIONS.md](../00-governance/OPEN-DECISIONS.md). The controls above are not optional dependencies on those choices; the MVP baseline remains QRIS/VA/approved e-wallet, 30m/15m expiry, 7-day refund request, and daily reconciliation with weekly Finance sign-off.

## 8. Secret, identity, and cloud configuration requirements

| ID | Requirement | State | Verification |
| --- | --- | --- | --- |
| KROWDS-SEC-050 | Production secrets shall be stored in GCP Secret Manager (Google Cloud Secret Manager) and accessed by workload identity. Secrets shall not be committed, embedded in frontend bundles, placed in URLs, or written to ordinary configuration files. | Confirmed decision | Repository scan; IAM review; runtime inspection |
| KROWDS-SEC-051 | Cloud Run auth shall require authenticated invocation. Direct anonymous invocation of the backend shall be denied. Public browser traffic shall reach the direct public API origin or another explicitly reviewed identity-forwarding mechanism; a Next.js route, Server Action, or proxy shall not be used. | Confirmed decision | Unauthenticated invocation test; ingress and IAM review |
| KROWDS-SEC-052 | Cloud Run shall use separate service identities for serving, background work, migrations, and operations. No identity shall receive broad project permissions when a narrower role is sufficient. | Confirmed decision | IAM policy review |
| KROWDS-SEC-053 | Cloud SQL shall use private connectivity, encrypted connections, least-privilege database roles, automated backups, and a production database identity distinct from migration or break-glass identities. | Confirmed decision | Network, IAM, and database review |
| KROWDS-SEC-054 | Every tenant-owned table shall carry an organization scope and enforce row-level security in PostgreSQL. Application queries shall not use a global tenant context supplied by the browser. | Confirmed decision | Cross-tenant integration and RLS tests |
| KROWDS-SEC-055 | Cloud Storage buckets shall be private, use uniform bucket-level access, deny public ACLs, and require short-lived signed access for authorized downloads. Object names shall not contain personal data. | Confirmed decision | Bucket policy and URL-expiry tests |
| KROWDS-SEC-056 | BigQuery shall use separate datasets and authorized views for production data. Direct unrestricted access to raw personal or payment data shall be prohibited by IAM and query policy. | Confirmed decision | IAM, query, and export review |
| KROWDS-SEC-057 | Development, staging, and production shall use separate Google Cloud projects or equivalent isolated boundaries, credentials, databases, buckets, and provider accounts. Production data shall not be copied into lower environments. | Confirmed decision | Environment inventory and access review |
| KROWDS-SEC-058 | Configuration changes that alter identity, authorization, secret access, retention, encryption, or payment behavior shall require Security review and a recorded change record. | Confirmed decision | Change-management evidence |
| KROWDS-SEC-059 | Memorystore shall hold only rebuildable cache, rate-limit, short-lived lock, and idempotency-coordination data. Cloud Tasks and Cloud Scheduler shall invoke the same Go backend artifact with authenticated, replay-resistant, overlap-safe handlers. Cloud Logging, Error Reporting, and Monitoring shall carry redacted operational evidence and alerts. | Confirmed decision | Infrastructure, task, scheduler, and telemetry tests |

Project identifiers, service accounts, database versions, CMEK policy, and key ownership are external gates in [OPEN-DECISIONS.md](../00-governance/OPEN-DECISIONS.md). The target region is `asia-southeast2`; secure-cookie API gateway, RPO 15m/RTO 4h, backup 7/14/35 days, and log retention 30/90/365 days are the confirmed baseline.

## 9. Encryption and sensitive-data handling

| ID | Requirement | State | Verification |
| --- | --- | --- | --- |
| KROWDS-SEC-060 | All browser-to-edge, edge-to-backend, backend-to-provider, and administrative connections shall use TLS. External endpoints shall support TLS 1.2 or later, use current cipher policy, and enable HSTS for the applicable web domains. | Confirmed decision | TLS scan and header test |
| KROWDS-SEC-061 | Cloud SQL, Cloud Storage, BigQuery, backups, and exported reports shall use encryption at rest. Google-managed encryption is the MVP default; customer-managed encryption keys are required for designated Restricted production data after Security and Privacy approval. | Confirmed baseline; key project and owner evidence required | Cloud configuration and key-policy review |
| KROWDS-SEC-062 | Government identifiers, organization legal documents, bank details, and other Restricted fields shall be encrypted with an approved envelope or field-level design. Organization legal documents shall be stored in private Cloud Storage and manually reviewed by KREW; the MVP does not require consumer identity-document images. Key material shall remain outside application code and ordinary backups. | Confirmed decision; approved mechanism evidence required | Data review and key-access test |
| KROWDS-SEC-063 | Logs, traces, metrics, error messages, analytics events, support tickets, and screenshots shall exclude raw card data, passwords, OTPs, webhook secrets, private keys, full QR tokens, and unnecessary identity documents. Redaction shall occur before data leaves the service. | Confirmed decision | Automated log and trace scans |
| KROWDS-SEC-064 | Key and certificate rotation shall be performed at least every 90 days and immediately after suspected compromise, personnel departure, or vendor incident. Rotation shall preserve a 24-hour overlap where required and update certificates at least 30 days before expiry. | Confirmed baseline | Rotation exercise and certificate inventory |
| KROWDS-SEC-065 | Data exports shall be encrypted, access-controlled, time-limited, watermarked where appropriate, and recorded in the audit trail. Export destinations shall be approved for the data class. | Confirmed decision | Export authorization and download test |

## 10. Audit and monitoring

KROWDS shall create a tamper-evident audit trail for security and business events. The trail is access-restricted and follows the 24-month audit/security retention baseline, subject to legal hold and active investigation.

| ID | Requirement | State | Verification |
| --- | --- | --- | --- |
| KROWDS-SEC-070 | Audit events shall include event ID, UTC timestamp, actor or workload identity, organization scope, action, target type and opaque target ID, outcome, reason code, request ID, device/session context where necessary, and source service. | Confirmed decision | Event schema review |
| KROWDS-SEC-071 | The following shall be auditable: sign-in and MFA changes; invitations; role and permission changes; organization approval; consumer identity review claims and decisions; identity or document views; exports; payment, refund, and reconciliation; ticket issue and cancellation; QR binding, redemption, and access; batch activation; wristband disablement; secret or key access; and break-glass actions. | Confirmed decision | Event coverage matrix |
| KROWDS-SEC-072 | Audit records shall be append-only or otherwise protected against ordinary application deletion, and access to them shall be separately authorized. Database administrators shall not silently edit or remove records. | Confirmed decision | Database and IAM review |
| KROWDS-SEC-073 | Security monitoring shall alert on repeated MFA failures, privilege escalation, unusual exports, bulk identity reads, QR enumeration, replay conflicts, webhook verification failures, abnormal staff scans, and break-glass use. Use the approved starting thresholds in `KROWDS-NFR-050`; named destinations remain a release gate. | Confirmed baseline; destination evidence required | Alert test and runbook review |
| KROWDS-SEC-074 | Audit queries and operational investigations shall use a case ID and least-privilege access. A support user shall not receive unrestricted database or personal-data access. | Confirmed decision | Case workflow and access test |
| KROWDS-SEC-075 | Audit and security-event retention is 24 months under the MVP tiered baseline, subject to legal hold, active investigation, and approved legal exceptions. | Confirmed baseline; legal gate remains | Retention and legal-hold test |

## 11. Break-glass access

Break-glass is for recovering a critical service or containing a confirmed incident. It is a KREW-only, MFA-protected, time-bounded capability. It is not a normal administrator mode and shall not be used to bypass payment verification, anti-replay controls, or tenant isolation.

| ID | Requirement | State | Verification |
| --- | --- | --- | --- |
| KROWDS-SEC-080 | Break-glass requests shall be initiated only by an active KREW member with MFA and shall require an incident ID, reason, requested scope, duration, and two distinct KREW approving roles: an incident commander and a security approver. Personal names for both roles are TBD. | Confirmed decision | Workflow and two-person test |
| KROWDS-SEC-081 | Break-glass access shall be time-limited, default to the smallest scope, and expire no later than four hours unless an incident commander records a documented extension. | Confirmed baseline; roster evidence required | Expiry and extension test |
| KROWDS-SEC-082 | Activation shall create a high-priority alert to Security Operations, the platform owner, and the affected organization owner when appropriate. All reads and writes shall be recorded separately from ordinary audit events. | Confirmed decision | Alert and audit inspection |
| KROWDS-SEC-083 | Break-glass shall be revoked immediately after the incident or recovery task ends and reviewed within two business days. Repeated use, failed use, and use without a valid incident shall trigger a security review. | Confirmed decision | Post-incident review evidence |
| KROWDS-SEC-084 | Break-glass procedures shall be exercised at least quarterly in a non-production environment and after a material identity or authorization change. | Confirmed decision | Exercise record |

The approver roster, notification destinations, and any regulatory exception process are controlled release gates in [OPEN-DECISIONS.md](../00-governance/OPEN-DECISIONS.md).

## 12. Backup/recovery and availability

Recovery is part of the security boundary. A restore must not reintroduce deleted personal data without a documented retention or legal-hold decision, and it must preserve tenant isolation and audit integrity.

| ID | Requirement | State | Verification |
| --- | --- | --- | --- |
| KROWDS-SEC-090 | Cloud SQL shall have automated backups, point-in-time recovery, and an independently controlled restore path. Production backup access shall be limited to Platform/SRE and approved incident personnel. | Confirmed decision | Backup policy and restore exercise |
| KROWDS-SEC-091 | Cloud Storage versioning or equivalent object recovery shall be enabled for buckets containing Restricted data, with lifecycle and deletion behavior following the confirmed tiered retention baseline and legal-hold rules. | Confirmed baseline; legal review required | Bucket policy and recovery test |
| KROWDS-SEC-092 | BigQuery recovery, export, and deletion procedures shall be documented. Datasets shall not be copied to personal accounts, unmanaged spreadsheets, or lower environments. | Confirmed decision | Dataset IAM and export review |
| KROWDS-SEC-093 | Primary transactional-store RPO is 15 minutes and RTO is 4 hours. Automated backup retention is 7/14/35 days for development/staging/production, with quarterly restore drills. Cross-region DR is post-MVP or separately approved. | Confirmed baseline; restore evidence required | Approved NFR and restore exercise |
| KROWDS-SEC-094 | A restore test shall be performed at least quarterly using synthetic or irreversibly masked data. The test shall verify schema, RLS, secrets, integrations, audit integrity, and user-visible recovery. | Confirmed decision | Quarterly evidence |
| KROWDS-SEC-095 | Recovery runbooks shall cover Cloud SQL, Secret Manager, Cloud Storage, BigQuery, Cloud Run, payment webhook replay, email delivery backlog, shipping status reconciliation, and identity/MFA service failure. | Confirmed decision | Runbook review and tabletop |
| KROWDS-SEC-096 | Backups shall be encrypted, access-logged, and excluded from ordinary development data flows. A restored backup shall be reconciled with provider and payment records before financial or access state is resumed. | Confirmed decision | Restore evidence |

## 13. Incident response

The incident process covers suspected compromise, unauthorized access, payment manipulation, lost or exposed credentials, privacy incidents, provider compromise, cloud misconfiguration, and availability events affecting security controls.

| ID | Requirement | State | Verification |
| --- | --- | --- | --- |
| KROWDS-SEC-100 | The incident commander shall declare severity, open an incident ID, assign containment, preservation, communications, legal, and recovery roles, and maintain a timestamped decision log. Personal names for each role are TBD. | Confirmed decision | Tabletop and incident record |
| KROWDS-SEC-101 | P1 shall mean a credible active breach, payment or credential compromise, cross-tenant exposure, or material control failure. P2 shall mean a significant but contained security or privacy event. P3 shall mean a lower-impact anomaly requiring investigation. | Confirmed decision | Severity examples and response table |
| KROWDS-SEC-102 | For a P1 event, Security Operations shall acknowledge within 15 minutes and begin containment within 30 minutes after declaration. These are operational response targets, not legal notification deadlines. | Confirmed operational baseline | Alert and exercise evidence |
| KROWDS-SEC-103 | Responders shall preserve relevant logs, traces, provider messages, database evidence, and access records; revoke exposed credentials; isolate affected workloads; and avoid destructive changes unless required to stop harm. | Confirmed decision | Forensic checklist |
| KROWDS-SEC-104 | Privacy and Legal Counsel shall determine whether and when affected individuals, users, regulators, payment providers, or other parties must be notified. Notification deadlines and wording are TBD pending Indonesian legal review. | TBD; legal gate | Written legal decision and approved notice |
| KROWDS-SEC-105 | External providers shall be handled through named contacts and verified channels. A provider's status page or message shall not be treated as proof that an incident is resolved without evidence from the relevant system. | Confirmed decision | Provider contact exercise |
| KROWDS-SEC-106 | A post-incident review shall identify root cause, affected data and users, containment gaps, control changes, owners, and due dates. A review shall be completed within five business days of service restoration unless the incident commander records a reason. | Confirmed baseline | Postmortem record |
| KROWDS-SEC-107 | Incident exercises shall cover payment replay, tenant isolation failure, secret exposure, and privacy notification decision-making. The baseline is at least twice yearly; named roster and exercise evidence are release gates. | Confirmed baseline; roster/evidence required | Exercise schedule |

## 14. Secure change and verification

The following evidence is required before a production release that touches identity, data, payment, email, shipping, access control, or cloud configuration:

| ID | Check | Pass condition | Owner |
| --- | --- | --- | --- |
| KROWDS-SEC-110 | Threat and abuse-case review | New flows have documented assets, trust boundaries, abuse cases, and mitigations | Security Engineering — personal name: TBD |
| KROWDS-SEC-111 | Authorization and tenant-isolation tests | Cross-organization reads and writes fail server-side, including through direct API calls | Quality Engineering — personal name: TBD |
| KROWDS-SEC-112 | Secret and dependency review | No production secret is in source, client bundles, logs, or CI output; dependency and container scans pass policy | Platform/SRE — personal name: TBD |
| KROWDS-SEC-113 | Payment and webhook tests | Invalid signatures, replay, duplicate events, out-of-order events, timeout, and secret rotation behave safely | Payments Engineering — personal name: TBD |
| KROWDS-SEC-114 | MFA and session tests | Privileged access, recovery, revocation, timeout, and step-up requirements pass | Security Engineering — personal name: TBD |
| KROWDS-SEC-115 | QR concurrency and threat tests | A credential cannot be redeemed or admitted twice under concurrent requests; threat cases have owners | Quality and Security Engineering — personal names: TBD |
| KROWDS-SEC-116 | Cloud control tests | Unauthenticated Cloud Run invocation, public storage, public database access, and unrestricted BigQuery access fail | Platform/SRE — personal name: TBD |
| KROWDS-SEC-117 | Recovery and incident exercises | Restore, break-glass, evidence preservation, and legal escalation steps are demonstrated | Platform/SRE — personal name: TBD |

## 15. Open decisions and production gate

The following decisions remain controlled release gates. Internal security defaults are accepted in the `0.1` baseline; external inputs and evidence are tracked centrally in [OPEN-DECISIONS.md](../00-governance/OPEN-DECISIONS.md). Each gate must have a role owner, evidence, and an approval date before the affected release.

| ID | Decision | State | Owner | Required before |
| --- | --- | --- | --- | --- |
| KROWDS-SEC-120 | Non-OTP lockout, recovery edge cases, and step-up matrix beyond the confirmed TOTP/WebAuthn and session baseline | Confirmed baseline: 5 attempts, 15-minute lockout, step-up/dual approval; provider/legal exceptions require evidence | Security Engineering — personal name: TBD | Privileged production access |
| KROWDS-SEC-121 | Final data-residency and cross-border approval, CMEK requirement, and key hierarchy for the confirmed `asia-southeast2` target | TBD; legal gate | Platform/SRE and Privacy and Legal Counsel — personal names: TBD | Production data storage |
| KROWDS-SEC-122 | RPO 15 minutes, RTO 4 hours, backup/log retention 7/14/35 and 30/90/365 days by environment, and post-MVP cross-region recovery scope | Confirmed baseline; evidence required | Platform/SRE — personal name: TBD | Production launch |
| KROWDS-SEC-123 | Audit, access-log, security-log, and incident-evidence retention is 24 months under the baseline, subject to legal hold and approved exceptions | Confirmed baseline; legal gate remains | Privacy and Legal Counsel and Security Engineering — personal names: TBD | Production launch |
| KROWDS-SEC-124 | Legal and regulatory notification deadlines and approved communication paths | TBD; legal gate | Privacy and Legal Counsel — personal name: TBD | Incident readiness |
| KROWDS-SEC-125 | Named break-glass roster, alternate approvers, and notification destinations | TBD | Platform/SRE — personal name: TBD | Production launch |
| KROWDS-SEC-126 | Final threat-model risk acceptance for physical QR loss, copying, and insider misuse | TBD | Security Engineering and Product Operations — personal names: TBD | Production launch |

No production deployment may use a guessed value for a TBD security decision. A temporary exception must identify the risk, owner, compensating control, expiry, and review date, and must be approved by Security Engineering and Platform/SRE.

## 16. Related documents

- [KROWDS product vision](../01-product/PRODUCT-VISION.md)
- [KROWDS product baseline](../01-product/KROWDS.md)
- [Privacy requirements](PRIVACY.md)
- [Integration requirements](../06-integrations/INTEGRATIONS.md)
- [Architecture](../03-architecture/ARCHITECTURE.md)
- [Deployment](../07-operations/DEPLOYMENT.md)
- [API contract](../04-domain/API-CONTRACT.md)
- [Data model](../04-domain/DATA-MODEL.md)
- [Non-functional requirements](../02-requirements/NFR.md)
- [Open decisions and release gates](../00-governance/OPEN-DECISIONS.md)
