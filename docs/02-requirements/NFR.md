# KROWDS-NFR-DOC-001 — KROWDS Non-Functional Requirements

## Metadata

| Field | Value |
| --- | --- |
| System / module | KROWDS MVP |
| Document ID | `KROWDS-NFR-DOC-001` |
| Owner | Technical Owner (personal name TBD) |
| Quality owner | Quality Owner (personal name TBD) |
| Version | 0.1 |
| Status | Draft |
| Related PRD | `PRD.md` |
| Related SRS | `SRS.md` |
| Last updated | 2026-09-24 |
| Canonical language | English |

This document is the canonical English quality-requirements layer. `PRODUCT-VISION.md` remains the canonical English product target and `KROWDS.md` remains the Bahasa Indonesia product brief. All requirement identifiers begin with `KROWDS-`. Numeric performance, capacity, availability, recovery, retention, security-service-level, and legal targets that are not confirmed in section 15 of `PRODUCT-VISION.md` are explicitly marked `TBD`; they must be approved before the relevant MVP phase exits.

## 1. Quality strategy

### 1.1 Primary users and critical journeys

- **Primary users:** User, Visitor/TicketHolder, organization staff, KREW, and Platform Admin.
- **Critical journeys:** authentication, recovery, and privileged MFA; organization approval; fixed-role Membership; online purchase; Xendit settlement; controlled full refund; e-ticket delivery; cashier QRIS purchase with stock reservation; new-batch production, Biteship delivery, and dashboard activation; e-ticket redemption; registered-device online gate admission; KREW break-glass; Xendit/Biteship reconciliation; BigQuery export; audit investigation; tenant isolation.
- **Safety-critical property:** one issued ticket permits at most one successful gate admission, and only an online authoritative decision from an active registered device can grant access.
- **Financial-critical property:** only authenticated Xendit state determines payment and full-refund state; staff cannot override it.
- **Privacy-critical property:** tenant and personal data are authorized in the Go backend and isolated in Cloud SQL PostgreSQL with `organization_id` and RLS; private files and secrets remain outside browser reach.
- **Service tier:** Regional HA Cloud SQL, private Cloud Run/API gateway, Cloud Tasks/Scheduler, Memorystore, Cloud Storage, Secret Manager, and governed observability; exact machine size and quota values are controlled infrastructure gates in [OPEN-DECISIONS.md](../00-governance/OPEN-DECISIONS.md).
- **Measurement environment:** a production-like Google Cloud environment with synthetic data, representative provider sandboxes where available, and no production PII by default.

### 1.2 Quality gates

| Gate | Required evidence |
| --- | --- |
| Phase 1 | Authentication, recovery, MFA, Identity, onboarding, KREW review, one-role Membership, invitation, correlation, RLS, and audit evidence accepted |
| Phase 2 | Hierarchy, catalog, Xendit state, issuance, Resend, controlled full refund, credential, and tenant-isolation evidence accepted |
| Phase 3 | Cashier stock reservation, private production CSV, KREW fulfillment, Biteship tracking/delivery/reshipment, dashboard activation, quantity reconciliation, and storage-security evidence accepted |
| Phase 4 | Redemption, binding, registered gate devices, single-use concurrency, KREW break-glass, access logs, Xendit/Biteship reconciliation, BigQuery export, approved NFR targets, accessibility, capacity, runbooks, support readiness, and rollback rehearsal accepted |

Personal names for gate approvers are TBD.

## 2. Performance requirements

| ID | Category | Requirement | Target / SLO | Measurement | Owner |
| --- | --- | --- | --- | --- | --- |
| KROWDS-NFR-001 | Performance | The Go API shall meet separate latency objectives for public catalog reads, authenticated reads, standard mutations, and administrative operations. | p95 public/catalog ≤300 ms, authenticated read ≤500 ms, standard mutation ≤800 ms; administrative/provider-specific objectives remain measured separately. | Server timing by route group, excluding explicitly documented client network time; standard pilot dataset. | Technical Owner (personal name TBD) |
| KROWDS-NFR-002 | Performance | Online account, catalog, ticket-wallet, cashier, redemption, and gate views shall meet approved loading and interaction budgets. | LCP p75 ≤2.5 s, INP p75 ≤200 ms, CLS p75 ≤0.1, authenticated account/ticket usable state p95 ≤3 s on supported mobile and desktop profiles. | Production RUM and synthetic monitoring by journey and device class. | Frontend Performance Owner (personal name TBD) |
| KROWDS-NFR-003 | Performance | An online gate validation shall reach an authoritative result within the approved operational budget while the backend is reachable. | p95 decision latency ≤700 ms; client timeout 3 seconds, maximum two exponential-backoff retries, then fail closed. | End-to-end scan timing from request dispatch to rendered decision. | Gate Operations Owner (personal name TBD) |
| KROWDS-NFR-004 | Performance | A verified Xendit Paid event should trigger ticket issuance and account availability within the approved support objective. | p95 ≤30 seconds and maximum 2 minutes. | Xendit event receipt, order transition, issuance, and account-visible timestamps. | Payments Owner (personal name TBD) |
| KROWDS-NFR-005 | Performance | Xendit, Resend, and Biteship events shall be accepted, authenticated, and queued for processing within the approved provider objective. | Webhook freshness 5 minutes; Resend request acceptance p95 ≤60 seconds; provider queue processing is measured separately with a maximum backlog age alert at 15 minutes. | Webhook ingress metrics, Cloud Tasks age, and provider event correlation. | Platform Operations Owner (personal name TBD) |
| KROWDS-NFR-006 | Performance | Reports and high-volume list views shall use bounded pagination and shall not block gate or payment processing. | API cursor default 25, maximum 100; reports and exports are asynchronous; provider and query-specific completion targets remain evidence gates. | Query timing, worker usage, and large-tenant synthetic tests. | Data and Performance Owner (personal names TBD) |

The performance budgets in section 3 are binding release targets. No target shall be inferred from a development environment; provider-, venue-, or infrastructure-specific values remain evidence gates in [OPEN-DECISIONS.md](../00-governance/OPEN-DECISIONS.md).

## 3. Performance budget

| Journey / operation | Budget | Measurement point | Excluded time |
| --- | ---: | --- | --- |
| Public event discovery | p95 API ≤300 ms; browser usable state included in frontend budget | Go API response and browser-rendered usable state | Time before user request; provider marketing content outside KROWDS control |
| Authenticated account ticket load | p95 API ≤500 ms; usable state p95 ≤3 s | API response and rendered ticket QR | User device restrictions; time spent in a previously issued external email client |
| Online checkout and Xendit creation | p95 standard mutation ≤800 ms | KROWDS request start through returned payment instruction | Time the User spends deciding or completing payment outside KROWDS |
| Payment event to ticket availability | p95 ≤30 s; maximum 2 m | Verified provider event receipt through committed issuance | Delay before the provider sends the event; documented provider outage |
| Cashier order and QRIS creation | p95 standard mutation ≤800 ms | Request through rendered payment instruction | User payment completion outside KROWDS |
| Redemption scan | p95 workflow target ≤3 s | Scan request through rendered bind success or safe denial | Physical Identity inspection outside the software |
| Gate scan | p95 ≤700 ms; client timeout 3 s and two retries | Scan request through authoritative Access Granted or Access Denied | Device camera focus and physical approach time |
| Wristband order state update | p95 committed state ≤3 s | Command through committed state and visible result | KREW manual production time |
| Dashboard batch activation | p95 ≤10 s | Authenticated activation request through Available inventory and queued activation email | User reading the email |
| BigQuery material-event export | asynchronous; queue age alert at 15 m | Committed Cloud SQL event through queryable governed dataset record | BigQuery batch window not configured by KROWDS |
| Organization report | asynchronous; API page size 25/100 | Request through export completion or bounded page response | Manual analysis of exported data |

## 4. Reliability, availability, and recovery

| ID | Category | Requirement | Target / SLO | Measurement | Owner |
| --- | --- | --- | --- | --- | --- |
| KROWDS-NFR-007 | Availability | The production service shall provide public browsing, authentication, paid-ticket access, and organization access at the approved service level. | 99.9% monthly availability for critical journeys; measurement exclusions and error-budget accounting follow the approved SLO. | External synthetic checks and backend SLI calculation. | Platform Operations Owner (personal name TBD) |
| KROWDS-NFR-008 | Reliability | The service shall provide an approved recovery time objective and recovery point objective for each critical data flow. | Primary transactional store RPO 15 minutes and RTO 4 hours; other data-flow targets are measured separately. | Exercise results and recovery-event record. | Technical Owner (personal name TBD) |
| KROWDS-NFR-009 | Durability | Cloud SQL PostgreSQL and governed Cloud Storage evidence shall be backed up and restored under an approved policy that preserves tenant, payment, ticket-use, private-document, production-file, and audit evidence. | Automated backup retention 7/14/35 days for development/staging/production; quarterly restore tests; cross-region copy is post-MVP. | Backup job success, restore evidence, object versioning, and reconciliation. | Data Operations Owner (personal name TBD) |
| KROWDS-NFR-010 | Transaction integrity | Multi-record financial, issuance, binding, and access operations shall commit atomically or leave no externally successful partial result. | 0 accepted partial commits for the defined critical operations. | Fault-injection and transaction tests. | Data and Security Owner (personal name TBD) |
| KROWDS-NFR-011 | Idempotency | Provider events and high-risk client retries shall be safe under duplication, delay, reordering, and process restart. | 0 duplicate material effects from the defined duplicate/replay test set. | Idempotency database assertions and replay tests. | Technical Owner (personal name TBD) |
| KROWDS-NFR-012 | Dependency failure | Xendit, Resend, Biteship, Cloud SQL, Memorystore, Cloud Tasks, Cloud Scheduler, Cloud Storage, Secret Manager, or observability degradation shall not cause fabricated paid, delivered, shipped, activated, refunded, authenticated, or authorized states. | 100% of defined dependency-failure scenarios fail closed or remain in the last verified state. | Provider and Google Cloud fault tests plus state-transition review. | Integration Owner (personal name TBD) |
| KROWDS-NFR-013 | Gate resilience | Gate authorization shall fail closed when the authoritative backend is unavailable; the MVP shall not issue an offline grant or cached credential. | 0 offline grants; 3-second client timeout and maximum two retries before `TEMP_UNAVAILABLE`. | Network-partition and service-outage tests. | Gate Operations Owner (personal name TBD) |
| KROWDS-NFR-014 | Recovery | Deployments and migrations shall have a tested rollback or forward-recovery procedure that preserves authoritative financial, ticket, binding, and audit records. | Rollback duration and recovery-point limits are TBD before each production release. | Staging rehearsal and release evidence. | Release Owner (personal name TBD) |
| KROWDS-NFR-015 | Continuity | Organization staff shall have a documented continuity procedure for online gate interruption that never bypasses single-use enforcement or creates an offline credential. | Procedure approval and maximum acceptable interruption are TBD before phase 4. | Operational tabletop and incident review. | Gate Operations Owner (personal name TBD) |

## 5. Capacity and scalability

| ID | Category | Requirement | Target / SLO | Measurement | Owner |
| --- | --- | --- | --- | --- | --- |
| KROWDS-NFR-016 | Scalability | Stateless Cloud Run execution roles shall support the approved numbers of organizations, active events, simultaneous visitors, registered gate devices, cashier operators, KREW operators, asynchronous tasks, private files, and audit exports. | Standard pilot: 50 organizations, 100 active events, 25,000 tickets/day, 100 devices, 200 concurrent scans, and 500 authenticated users. | Google Cloud metrics, production trend analysis, and production-like load tests. | Capacity Owner (personal name TBD) |
| KROWDS-NFR-017 | Throughput | The service shall sustain the approved rates for catalog reads, order creation, provider events, ticket issuance, redemptions, and gate scans. | Standard pilot load profile includes 25,000 tickets/day, 200 concurrent gate scans, and 500 authenticated users; test a 2x burst for 15 minutes. | Load-test results by operation and tenant distribution. | Performance Owner (personal name TBD) |
| KROWDS-NFR-018 | Data growth | Database, queue, log, export, and audit storage shall be evaluated for the approved record-growth and retention profile. | Growth rate, storage headroom, and archival thresholds are measured during the pilot and approved before production. | Capacity model and storage dashboards. | Data Operations Owner (personal name TBD) |
| KROWDS-NFR-019 | Workload isolation | Cloud Tasks and Cloud Scheduler shall isolate reporting, BigQuery export, email, shipping, reconciliation, cleanup, and long-running production work from synchronous payment, redemption, and gate processing on stateless Cloud Run roles. | No accepted cross-workload starvation in the defined stress set; exact resource thresholds are evidence gates. | Queue, Cloud Run, database, and Memorystore metrics under mixed load. | Platform Operations Owner (personal name TBD) |
| KROWDS-NFR-020 | Tenant scale | Cloud SQL RLS query plans, indexes, connection pooling, and Memorystore coordination shall remain within the approved performance budget for tenants at the approved maximum scale. | Tenant size, row counts, connection, cache, and query-plan thresholds are established from the production-like load test before infrastructure approval. | Large-tenant synthetic data tests and query-plan review. | Data and Performance Owner (personal names TBD) |

## 6. Security requirements

| ID | Category | Requirement | Target / SLO | Measurement | Owner |
| --- | --- | --- | --- | --- | --- |
| KROWDS-NFR-021 | Authentication | The Go backend shall own Google OAuth, email/password, Resend email OTP, session validation, logout, and account recovery, using secure HttpOnly SameSite cookies and rotating refresh credentials. | 100% route boundary; access 15 minutes, refresh 30 days, recovery 24 hours, immediate revocation. | Route-policy, cookie, rotation, and code-review tests. | Identity and Access Owner (personal name TBD) |
| KROWDS-NFR-022 | MFA | Platform Admin, KREW, Finance, and Organization Admin accounts shall require MFA before privileged permissions are available. Other staff roles shall follow the approved role-risk policy. | 100% of the defined privileged role assignments; five failed MFA/recovery attempts, 15-minute lockout/cooldown, and 24-hour recovery expiry. | Automated role/MFA matrix and recovery audit. | Identity and Access Owner (personal name TBD) |
| KROWDS-NFR-023 | Authorization | Access shall use only Platform Admin, KREW, Organization Owner/Admin, Finance, Ticketing, Cashier, Redemption, Gate, and Viewer roles, with exactly one fixed role on each organization Membership. | 0 custom-role, unlisted-role, or multi-role Membership grants. | Role matrix, database constraints, and negative tests. | Identity and Access Owner (personal name TBD) |
| KROWDS-NFR-024 | Tenant isolation | Every tenant-owned Cloud SQL PostgreSQL table shall contain non-null `organization_id` and have RLS enabled; authorization and RLS shall both be enforced. | 100% coverage for the tenant table inventory; 0 unauthorized cross-tenant reads or writes. | Schema inventory, policy tests, and direct database tests. | Data and Security Owner (personal name TBD) |
| KROWDS-NFR-025 | Tenant and device context | The backend shall derive organization context from authenticated User, active Membership, fixed role, requested resource, and, for Gate operations, an active registered device; client headers, body fields, or device claims alone shall never establish access. | 100% of tenant and gate routes pass spoofing, wrong-organization, inactive-device, and missing-context tests. | API and device security tests. | Backend Security Owner (personal name TBD) |
| KROWDS-NFR-026 | Credential protection | Ticket, wristband, session, OTP, MFA, activation, and provider credentials shall be non-guessable, stored and transmitted under the approved policy, and excluded from normal logs and analytics. A wristband token shall have at least 128 bits of entropy, with only its hash in transactional records and the token limited to the private production/QR issuance path. | 0 plaintext secrets or direct credential leakage in approved tests and reviews. | Entropy, hash, private-object access, secret scanning, code review, and log sampling. | Security Owner (personal name TBD) |
| KROWDS-NFR-027 | Payment integrity | No frontend or staff endpoint shall set or override digital Paid, Failed, Cancelled, or Refunded state, and KROWDS shall store no raw card data. | 0 manual state-setting routes, controls, privileged payment overrides, or raw card fields in the MVP. | API inventory, role tests, schema review, and database privilege review. | Payments and Security Owners (personal names TBD) |
| KROWDS-NFR-028 | Single-use safety | Ticket and wristband use shall be enforced atomically under concurrent requests. | 0 duplicate successful admissions in the defined concurrency test set. | Race, duplicate-scan, and fault-injection tests. | Gate Operations Owner (personal name TBD) |
| KROWDS-NFR-029 | Transport and storage | The system shall use approved secure transport, Cloud SQL and Cloud Storage at-rest protection, Secret Manager for runtime secrets, and key rotation controls. Legal documents, artwork, and production CSVs shall remain private. | Google-managed encryption is the MVP default; CMEK is required for designated Restricted production data after approval; provider/session/signing keys rotate at least every 90 days and immediately after compromise. | IAM, encryption, object-access, configuration, and operational evidence. | Security Owner (personal name TBD) |
| KROWDS-NFR-030 | Dependency security | The build and release process shall scan source, dependencies, containers, and infrastructure definitions for known vulnerabilities and secrets. | Critical remediation within 24 hours, High within 7 days, Medium within 30 days, Low within 90 days; Critical/High findings block release. | CI scan results and release gate. | Security Owner (personal name TBD) |
| KROWDS-NFR-031 | Abuse protection | Authentication, OTP, checkout, refund, scan, and provider endpoints shall have abuse detection and rate controls without denying legitimate bulk operator workflows. | Use the API v0.1 route-class matrix; provider/security evidence may tighten but not weaken the baseline. | Rate-limit tests, provider anomalies, and incident review. | Security and Product Owners (personal names TBD) |
| KROWDS-NFR-032 | Privileged access | Platform Admin and KREW cross-tenant operations shall be purpose-limited and audited. KREW break-glass shall additionally require MFA, a time-bounded window, explicit end, and dual approval; it cannot set payment state, grant access, or bypass single use. | Break-glass and restricted privileged paths are 100% auditable; maximum duration is four hours, while roster, approver, and exercise evidence remain release gates. | Privileged-action report, MFA check, expiry test, and owner review. | Data and Security Owner (personal name TBD) |
| KROWDS-NFR-033 | Security response | The release process shall define vulnerability, credential-leak, tenant-isolation, and payment-integrity incident procedures. | P1 acknowledgement 15 minutes, containment 30 minutes, updates 30 minutes, workaround/restore 4 hours; P2 acknowledgement 1 hour, containment 4 hours, update 1 business day, resolution 2 business days; P3 acknowledgement 1 business day, containment 2 business days, resolution 5 business days. | Tabletop evidence and incident records. | Security Owner (personal name TBD) |

## 7. Privacy, data governance, and legal readiness

| ID | Category | Requirement | Target / SLO | Measurement | Owner |
| --- | --- | --- | --- | --- | --- |
| KROWDS-NFR-034 | Data classification | Identity, guardian relationship, ticket, order, payment reference, shipment address, private legal document, artwork, production CSV, Membership, audit, credential, Cloud Storage, BigQuery, and operational-log data shall have approved classifications and handling rules. | Contract/service necessity is the baseline for account, auth, ticket, payment, shipping, and fulfillment; optional analytics/marketing requires explicit consent. | Data inventory review. | Data Protection Owner (personal name TBD) |
| KROWDS-NFR-035 | Data minimization | QR payloads, private production CSVs, logs, metrics, and BigQuery datasets shall contain only fields necessary for their purpose and shall not contain direct personal or financial data. The MVP shall not collect consumer identity-document images. | 0 prohibited fields or identity-document images in approved payload and telemetry inventories. | Automated payload tests and sampling review. | Data Protection Owner (personal name TBD) |
| KROWDS-NFR-036 | Consent and terms | Registration, Identity processing, minor guardian relationship and consent, organization onboarding, marketing preferences if any, and provider processing shall use approved versioned notices and consent records. | Contract-plus-consent posture, under-18 guardian account/declaration/consent, and dedicated notice versioning are fixed; legal text remains subject to counsel. | Legal review and consent-record tests. | Legal Owner (personal name TBD) |
| KROWDS-NFR-037 | Retention | Retention and deletion schedules shall cover User, Identity, guardian evidence, ticket, order, refund, shipment, private Cloud Storage objects, audit, BigQuery datasets, logs, metrics, backups, and support records. | Tiered baseline is 24 months account/profile, 30 days OTP/auth logs, 12 months support/shipping, 7 years finance and organization legal/banking, 24 months audit/security and wristband/QR history, 30 days production CSV and event-level analytics, 30/90/365-day operational telemetry, and 7/14/35-day backups; legal holds may extend. | Data inventory, automated expiry report, object lifecycle, and deletion evidence. | Data Protection Owner (personal name TBD) |
| KROWDS-NFR-038 | Data subject operations | Approved processes shall support access, correction, export, restriction, objection where applicable, and deletion while preserving legally or operationally required records. | Acknowledge within 2 business days, complete within 30 calendar days, provide identity proofing and appeal path, and audit every request; counsel may shorten the target. | End-to-end request tests and legal review. | Privacy Operations Owner (personal name TBD) |
| KROWDS-NFR-039 | Data location and transfer | Approved hosting regions, subprocessors, cross-border transfers, and provider data locations shall be documented and reviewed. | MVP hosting target is `asia-southeast2`; legal residency and provider-transfer approvals remain release gates. | Architecture/vendor inventory and Legal approval. | Legal and Platform Owners (personal names TBD) |
| KROWDS-NFR-040 | Test data | Development, CI, load, and pilot environments shall use synthetic or approved masked data and shall not contain production PII by default. | 0 unapproved production datasets in non-production environments. | Environment scan and access review. | Data Operations Owner (personal name TBD) |
| KROWDS-NFR-041 | Audit and analytics privacy | Audit records and BigQuery exports shall identify accountable actors and outcomes without storing session values, MFA codes, payment secrets, raw QR payloads, private file content, or unnecessary Identity data. Optional product analytics uses only approved aggregate or HMAC-SHA-256 pseudonymous events with a dedicated rotatable key. | 0 prohibited values in audit schema, export, and log tests; re-identification test passes before analytics enablement. | Schema review, export sampling, and generated-event inspection. | Audit and Data Protection Owners (personal names TBD) |

Legal and regulatory applicability, including Indonesian data-protection, tax/e-invoice, consumer, payment, promotion, and sector-specific duties, is TBD and requires qualified Legal review before approval.

## 8. Accessibility requirements

| ID | Category | Requirement | Target / SLO | Measurement | Owner |
| --- | --- | --- | --- | --- | --- |
| KROWDS-NFR-042 | Accessibility | All MVP product experiences shall meet the approved accessibility conformance target. | WCAG 2.2 AA across supported Chrome, Safari, Android, and iOS current/previous-major matrix. | Automated and manual audit by critical journey. | Accessibility Owner (personal name TBD) |
| KROWDS-NFR-043 | Keyboard | All controls, dialogs, menus, QR/ticket views, redemption, and gate flows shall be operable by keyboard without a pointer. | 0 blocking keyboard traps in the approved critical journey set. | Manual keyboard test and automated checks. | Accessibility Owner (personal name TBD) |
| KROWDS-NFR-044 | Semantics | Controls and state changes shall expose accessible names, roles, values, focus state, errors, and status changes to assistive technology. | 0 critical unannounced state/error paths in the approved journey set. | Screen-reader testing and semantic review. | Accessibility Owner (personal name TBD) |
| KROWDS-NFR-045 | Visual presentation | Text, controls, focus indicators, validation, and Access Granted/Access Denied states shall meet approved contrast, zoom, reflow, and target-size rules without relying on color alone. | Contrast at least 4.5:1 for normal text and 3:1 for large text/non-text controls; 200% zoom; 320px reflow; target size at least 44×44 CSS px. | Automated contrast tests and manual zoom/reflow review. | Design and Accessibility Owners (personal names TBD) |
| KROWDS-NFR-046 | Motion | Non-essential motion and animation shall respect reduced-motion preferences. | 100% of non-essential motion respects the preference. | OS setting test and design review. | Design Owner (personal name TBD) |
| KROWDS-NFR-047 | Device and timeout | Cashier, Redemption, and Gate views shall remain usable on supported mobile devices and during provider delays. | Chrome, Safari, Android, and iOS current/previous-major; gate timeout 3 seconds with two retries; cashier timeout follows payment instruction policy. | Real-device and network-condition tests. | Product and Accessibility Owners (personal names TBD) |
| KROWDS-NFR-048 | Error clarity | Validation and operational errors shall identify the field or condition and a recovery action in plain language. | 100% of critical error scenarios reviewed for clarity and safe disclosure. | Content review and scenario testing. | Content and Accessibility Owners (personal names TBD) |

## 9. Observability and operations

| ID | Category | Requirement | Target / SLO | Measurement | Owner |
| --- | --- | --- | --- | --- | --- |
| KROWDS-NFR-049 | Logging | The backend shall emit structured, correlated logs to Cloud Logging with severity, service, operation, safe resource reference, duration, and outcome. | Operational logs, metrics, and traces follow 30/90/365-day retention for development/staging/production; material audit/security records follow their canonical retention. | Schema validation and Cloud Logging sampling. | Platform Operations Owner (personal name TBD) |
| KROWDS-NFR-050 | Metrics and errors | Cloud Monitoring and Error Reporting shall cover request rate/errors/duration, Cloud Run and Cloud SQL health, pool and Memorystore health, provider outcomes, Cloud Tasks/Scheduler lag, BigQuery export lag, payment-to-issuance, email delivery, shipment lag, stock reservation, redemption, gate result/reason, break-glass, and isolation denials. | Starting thresholds: payment mismatch immediate, signature failure 5/5 minutes, queue age >15 minutes, dead-letter 1, gate p95 >700 ms for 3 windows, API 5xx >5% for 5 minutes, RLS denial >10/5 minutes, backup/IAM/secret failure immediate. | Dashboard, Error Reporting, and alert tests. | Platform Operations Owner (personal name TBD) |
| KROWDS-NFR-051 | Tracing | Critical distributed operations shall carry a correlation or trace context across frontend request, Go API, database, and provider interaction. | Trace retention follows the environment telemetry policy; sampling must preserve all defined material audit flows. | Distributed trace inspection. | Technical Owner (personal name TBD) |
| KROWDS-NFR-052 | Correlation | Order, provider event, refund, ticket, shipment, batch, binding, and access records shall share traceable correlation references without exposing secrets. | 100% of the defined material flows retain a correlation reference. | Traceability query tests. | Audit Owner (personal name TBD) |
| KROWDS-NFR-053 | Monitoring | Alerts shall cover sustained errors, latency breach, Cloud Run or Cloud SQL degradation, task backlog, payment/reconciliation mismatch, duplicate-use invariant breach, isolation-denial anomaly, delivery failure, BigQuery export lag, device anomaly, break-glass, and backup failure. | Use the approved starting thresholds in `KROWDS-NFR-050`; named destinations and final escalation evidence remain release gates. | Synthetic alert exercise. | Platform Operations Owner (personal name TBD) |
| KROWDS-NFR-054 | Operations | Runbooks shall exist for authentication, tenant isolation, payment mismatch, refund failure, email, shipment, stuck fulfillment, duplicate scan, registered-device loss, KREW break-glass, gate outage, Cloud SQL recovery, Cloud Tasks replay, Cloud Storage access, Secret Manager rotation, and BigQuery export recovery. | Critical runbooks are reviewed quarterly while active and after every incident; provider runbooks are reviewed after provider changes and quarterly; owner and last-tested evidence are mandatory. | Runbook review and tabletop/drill evidence. | Operations Owner (personal name TBD) |
| KROWDS-NFR-055 | Time integrity | Servers, databases, workers, and provider-event handling shall use monitored UTC time. | Maximum clock drift and alerting threshold are TBD. | Time-sync telemetry. | Platform Operations Owner (personal name TBD) |
| KROWDS-NFR-056 | Incident evidence | Incidents shall preserve relevant provider references, state transitions, Cloud Run revision, Cloud SQL and task references, BigQuery export state, and audit evidence while excluding secrets and unnecessary personal data. | Evidence follows the canonical audit/security retention baseline; privacy and legal exceptions require approval. | Incident record review. | Security and Operations Owners (personal names TBD) |

## 10. Maintainability and delivery quality

| ID | Category | Requirement | Target / SLO | Measurement | Owner |
| --- | --- | --- | --- | --- | --- |
| KROWDS-NFR-057 | Architecture | Business logic shall remain in one Go + Gin modular-monolith codebase and binary deployed on Cloud Run with domain, application, delivery, and infrastructure boundaries; modules shall not import another module's internals. | 0 architecture-boundary or second-backend violations in the enforced architecture test. | Automated architecture test, binary/configuration inventory, and review. | Technical Owner (personal name TBD) |
| KROWDS-NFR-058 | Frontend boundary | Next.js applications shall remain frontend-only and call the Go backend through `@krowds/api`; backend handlers, database, queue, and backend SDK logic shall not be added to them. | 0 prohibited backend-boundary violations. | Architecture test and repository review. | Frontend Architecture Owner (personal name TBD) |
| KROWDS-NFR-059 | Shared UI | Product interfaces shall use approved shadcn/ui primitives and compositions through `@krowds/ui`; duplicated app-specific primitives and unapproved style systems shall not be introduced. | 0 unapproved visual primitive or style-system violations in the review inventory. | Component inventory and design review. | Design Systems Owner (personal name TBD) |
| KROWDS-NFR-060 | API compatibility | Public and internal API changes shall use reviewed contracts, backward-compatibility rules, and a documented deprecation process. | Additive changes remain in `v1`; breaking changes require a new major URI version and a 90-day deprecation window; OpenAPI 3.1 is CI-validated. | Contract diff and compatibility tests. | API Owner (personal name TBD) |
| KROWDS-NFR-061 | Database and storage change | Cloud SQL schema migrations and Cloud Storage object/schema changes shall be versioned, reviewed, testable, observable, and recoverable without silently changing tenant policy or exposing private files. | Migration duration, object-retention, rollback, and forward-recovery limits are TBD. | Migration rehearsal, object-access test, and production evidence. | Data Operations Owner (personal name TBD) |
| KROWDS-NFR-062 | Automated quality | The delivery pipeline shall run architecture, lint, type, unit, integration, provider-sandbox, security, and acceptance checks appropriate to the change. | 100% of safety-critical requirements have automated tests; changed business rules maintain at least 90% line coverage; all API operations have contract tests; no Critical/High defect is open. | CI evidence and release gate. | Quality Owner (personal name TBD) |
| KROWDS-NFR-063 | Requirement traceability | Every production requirement shall link to `KROWDS-` business, product, software, quality, architecture, and test evidence before approval. | 100% traceability to defined `KROWDS-TC-*`, `KROWDS-VER-*`, and phase-exit evidence identifiers. | Traceability review. | Documentation Owner (personal name TBD) |
| KROWDS-NFR-064 | Configuration | Environment configuration shall distinguish development, test, staging, and production, use Secret Manager for provider/runtime secrets, and fail safely when required Google Cloud or provider configuration is absent. | 0 startup paths with production fallback to insecure, embedded, or fake provider behavior. | Configuration, Secret Manager reference, and startup tests. | Platform Operations Owner (personal name TBD) |
| KROWDS-NFR-065 | Feature control | Phased rollout shall support event-level and organization-level controls for online sales, cashier, stock/production fulfillment, activation, redemption, registered devices, and gate without deleting or rewriting authoritative records. | Control coverage is 100% for phased capabilities; rollback duration is TBD. | Feature-control and rollback tests. | Product and Release Owners (personal names TBD) |

## 11. Data integrity and reconciliation

| ID | Category | Requirement | Target / SLO | Measurement | Owner |
| --- | --- | --- | --- | --- | --- |
| KROWDS-NFR-066 | Ticket and wristband invariant | For every issued ticket, holder Identity, guardian evidence when applicable, stock reservation, bound wristband, entitlement, and successful-use count shall remain unambiguous. | 0 violations in migration, concurrency, and integrity checks. | Database constraints and reconciliation queries. | Data and Security Owner (personal name TBD) |
| KROWDS-NFR-067 | Payment reconciliation | KROWDS order and refund state shall reconcile to Xendit references and amount without manual settlement override. | Daily automated reconciliation and weekly Finance sign-off; 0 unreconciled material discrepancies beyond the approved age threshold. | Daily reconciliation report and weekly sign-off record. | Finance Owner (personal name TBD) |
| KROWDS-NFR-068 | Fulfillment reconciliation | Stock quantity, private production CSV row count, order quantity, production quantity, quality-control result, shipment/reshipment quantity, delivered quantity, dashboard-activated quantity, and Available quantity shall reconcile. | 0 unexplained quantity discrepancies at each approved handoff. | Batch, object, Biteship, and order reconciliation. | KROWDS Operations Owner (personal name TBD) |
| KROWDS-NFR-069 | Audit and export integrity | Material audit events shall be append-oriented, correlated to authoritative Cloud SQL resources, exported to governed BigQuery datasets, and protected from ordinary application modification or deletion. | 0 unexplained missing events or exports and 0 ordinary-role modifications; retention follows the canonical schedule and requires evidence. | Audit completeness, export replay, reconciliation, and permission tests. | Audit Owner (personal name TBD) |
| KROWDS-NFR-070 | Safe repair and break-glass | Administrative repair or KREW break-glass shall use an approved purpose, reason, time-bounded authorization, and dual-control policy where required; it cannot set payment state, grant access, or bypass single use. | Repair and break-glass paths are 100% auditable; break-glass expires within four hours, exceptional actions require dual approval, and named roster/evidence remains a release gate. | Repair/break-glass event review and prohibited-action tests. | Data and Security Owner (personal name TBD) |

## 12. Verification matrix

| Requirement group | Test / evidence | Environment | Pass condition |
| --- | --- | --- | --- |
| KROWDS-NFR-001 through KROWDS-NFR-006 | Performance profiling, RUM review, Google Cloud load test, and provider timing | Production-like Google Cloud environment with synthetic data | Every approved numeric target is met; TBD targets are approved before they can block release |
| KROWDS-NFR-007 through KROWDS-NFR-015 | Availability calculation, Cloud SQL/Storage backup and restore, Google Cloud/provider dependency failure, migration rollback, and gate outage exercises | Isolated production-like Google Cloud and provider sandboxes | No fabricated authoritative state, offline grant, or unrecovered authoritative partial commit |
| KROWDS-NFR-016 through KROWDS-NFR-020 | Cloud Run workload, Cloud SQL/Memorystore growth, Cloud Tasks mixed-load, BigQuery export, and large-tenant tests | Production-like Google Cloud with synthetic data | Approved capacity, workload-isolation, and tenant-isolation targets pass |
| KROWDS-NFR-021 through KROWDS-NFR-033 | Threat review, role/MFA matrix, RLS/direct database tests, device/break-glass tests, private-object access, secret scan, replay and abuse tests | Isolated security test environment | No unauthorized access, manual money-state override, credential leakage, custom role, or prohibited break-glass action |
| KROWDS-NFR-034 through KROWDS-NFR-041 | Data inventory, guardian consent, retention/object lifecycle, BigQuery export privacy, rights workflow, environment scan, and Legal review | Staging with synthetic data | Inventory is complete and all approved legal decisions are recorded; unresolved TBD decisions block approval |
| KROWDS-NFR-042 through KROWDS-NFR-048 | Automated accessibility checks plus keyboard, screen-reader, zoom/reflow, mobile, reduced-motion, and error-content tests | Supported browser/device matrix | No critical blocker and approved conformance target passes |
| KROWDS-NFR-049 through KROWDS-NFR-056 | Cloud Logging schema, Monitoring/Error Reporting alerts, trace, BigQuery export, runbook, clock, and incident tabletop review | Staging and Google Cloud operational simulation | Critical signals exist, exclude secrets, and trigger the approved response path |
| KROWDS-NFR-057 through KROWDS-NFR-065 | Architecture/binary tests, UI inventory, contract tests, Cloud SQL/Storage migration rehearsal, CI evidence, and rollback tests | CI and staging | No prohibited boundary or rollout behavior; all approved phase gates pass |
| KROWDS-NFR-066 through KROWDS-NFR-070 | Integrity constraints, stock reservation, private production CSV, concurrent duplicate-use, Xendit/Biteship reconciliation, BigQuery export, audit permission, repair, and break-glass review | Staging with synthetic data | Ticket, money, fulfillment, device, and audit invariants remain intact |

## 13. Accepted baselines and remaining release gates

The internal quality baseline is accepted for `0.1`. External identifiers, legal decisions, infrastructure sizing, physical measurements, and evidence remain controlled in [OPEN-DECISIONS.md](../00-governance/OPEN-DECISIONS.md).

| ID | Decision | Owner | Needed by |
| --- | --- | --- | --- |
| KROWDS-NFR-D-001 | Frontend LCP/INP/CLS, API latency, payment-to-ticket, notification acceptance, and batch-activation targets in sections 2–3 | Technical and Product Owners (personal names TBD) | Phase exit evidence |
| KROWDS-NFR-D-002 | 99.9% availability, RPO 15 minutes, RTO 4 hours, 7/14/35-day backups, quarterly restore drills, and post-MVP cross-region DR | Technical and Operations Owners (personal names TBD) | Phase 1 production readiness / phase 4 |
| KROWDS-NFR-D-003 | Standard pilot capacity plus 2x burst for 15 minutes; quota and growth headroom evidence | Product, Platform, and Capacity Owners (personal names TBD) | Phase 4 |
| KROWDS-NFR-D-004 | Session, OTP, MFA/recovery, route-class rate limits, and step-up/dual approval baseline | Security and Identity Owners (personal names TBD) | Phase 1 |
| KROWDS-NFR-D-005 | Google-managed encryption default, Restricted-data CMEK, 90-day key rotation, vulnerability remediation, and incident targets | Security and Legal Owners (personal names TBD) | Phase 1 / phase 4 |
| KROWDS-NFR-D-006 | Contract-plus-consent, guardian, retention, rights workflow, and legal wording approval | Legal and Data Protection Owners (personal names TBD) | Before processing production personal data |
| KROWDS-NFR-D-007 | WCAG 2.2 AA, supported browser/device matrix, keyboard/screen-reader/zoom/reflow, and gate timeout/retry baseline | Accessibility, Design, and Product Owners (personal names TBD) | Phase 2 / phase 4 |
| KROWDS-NFR-D-008 | Acknowledgement, containment, update, and resolution targets plus named escalation roster | Support and Business Owners (personal names TBD) | Phase 4 |
| KROWDS-NFR-D-009 | Tax, e-invoice, consumer, payment, promotion, venue, and other legal obligations | Finance and Legal Owners (personal names TBD) | Before commercial release |
| KROWDS-NFR-D-010 | GCP project identifiers, service tiers, quotas, budget, CMEK, residency, and cross-border transfer evidence | Platform, Security, and Legal Owners (personal names TBD) | Before production infrastructure approval |
| KROWDS-NFR-D-011 | Provider, load, restore, rollback, accessibility, physical, venue, privacy, and operational evidence | Quality Assurance and relevant owners (personal names TBD) | Each phase exit |

## 14. Traceability

| Source | Applicable NFRs |
| --- | --- |
| KROWDS-SRS-001 through KROWDS-SRS-004 | KROWDS-NFR-021, KROWDS-NFR-022, KROWDS-NFR-025, KROWDS-NFR-026, KROWDS-NFR-029, KROWDS-NFR-031 |
| KROWDS-SRS-007 through KROWDS-SRS-014 | KROWDS-NFR-021 through KROWDS-NFR-025, KROWDS-NFR-032, KROWDS-NFR-034 through KROWDS-NFR-041 |
| KROWDS-SRS-015 through KROWDS-SRS-019 | KROWDS-NFR-016, KROWDS-NFR-018 through KROWDS-NFR-020, KROWDS-NFR-024, KROWDS-NFR-025 |
| KROWDS-SRS-020 through KROWDS-SRS-028 | KROWDS-NFR-004, KROWDS-NFR-010 through KROWDS-NFR-012, KROWDS-NFR-027, KROWDS-NFR-052, KROWDS-NFR-067 |
| KROWDS-SRS-029 through KROWDS-SRS-035 | KROWDS-NFR-026, KROWDS-NFR-028, KROWDS-NFR-035, KROWDS-NFR-066 |
| KROWDS-SRS-036 through KROWDS-SRS-039 | KROWDS-NFR-003, KROWDS-NFR-023, KROWDS-NFR-027, KROWDS-NFR-067 |
| KROWDS-SRS-040 through KROWDS-SRS-047 | KROWDS-NFR-012, KROWDS-NFR-035, KROWDS-NFR-050, KROWDS-NFR-068 |
| KROWDS-SRS-048 through KROWDS-SRS-054 | KROWDS-NFR-003, KROWDS-NFR-010, KROWDS-NFR-011, KROWDS-NFR-013, KROWDS-NFR-028, KROWDS-NFR-052, KROWDS-NFR-066 |
| KROWDS-SRS-055 through KROWDS-SRS-060 | KROWDS-NFR-005, KROWDS-NFR-010 through KROWDS-NFR-012, KROWDS-NFR-035, KROWDS-NFR-041, KROWDS-NFR-049 through KROWDS-NFR-056, KROWDS-NFR-069 |
| KROWDS-SRS-061 through KROWDS-SRS-068 | KROWDS-NFR-024, KROWDS-NFR-025, KROWDS-NFR-031, KROWDS-NFR-057 through KROWDS-NFR-065, KROWDS-NFR-070 |
| KROWDS-SRS-069 | KROWDS-NFR-034, KROWDS-NFR-036, KROWDS-NFR-066 |
| KROWDS-SRS-070 | KROWDS-NFR-012, KROWDS-NFR-016 through KROWDS-NFR-020, KROWDS-NFR-029, KROWDS-NFR-057, KROWDS-NFR-061, KROWDS-NFR-064 |
| KROWDS-SRS-071 | KROWDS-NFR-025, KROWDS-NFR-028, KROWDS-NFR-047, KROWDS-NFR-050, KROWDS-NFR-053, KROWDS-NFR-066 |
| KROWDS-SRS-072 | KROWDS-NFR-032, KROWDS-NFR-053, KROWDS-NFR-070 |
| KROWDS-SRS-073 | KROWDS-NFR-041, KROWDS-NFR-050, KROWDS-NFR-052, KROWDS-NFR-069 |
| KROWDS-SRS-075 through KROWDS-SRS-084 | KROWDS-NFR-004, KROWDS-NFR-005, KROWDS-NFR-006, KROWDS-NFR-016, KROWDS-NFR-022, KROWDS-NFR-024, KROWDS-NFR-029, KROWDS-NFR-030, KROWDS-NFR-031, KROWDS-NFR-032, KROWDS-NFR-034 through KROWDS-NFR-042, KROWDS-NFR-045, KROWDS-NFR-049 through KROWDS-NFR-050, KROWDS-NFR-060, KROWDS-NFR-062, KROWDS-NFR-064 |

## 15. Approval

| Role | Name | Decision | Date |
| --- | --- | --- | --- |
| Technical Owner | TBD | Approve / Reject | TBD |
| Quality Owner | TBD | Approve / Reject | TBD |
| Data and Security Owner | TBD | Approve / Reject | TBD |
| Platform Operations Owner | TBD | Approve / Reject | TBD |
| Accessibility Owner | TBD | Approve / Reject | TBD |
| Legal Owner | TBD | Approve / Reject | TBD |
| Product Owner | TBD | Approve / Reject | TBD |
