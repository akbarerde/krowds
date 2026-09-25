# KROWDS-GLOSS-001 — Glossary

## Metadata

| Field | Value |
| --- | --- |
| Document ID | `KROWDS-GLOSS-001` |
| System / module | KROWDS product and platform terminology |
| Version | `0.1` |
| Status | `Draft` |
| Release label | `0.1 Draft` |
| Owner | Product Operations Lead (TBD) |
| Last updated | `2026-09-24` |

## 1. How to read this glossary

KROWDS uses the terms below as canonical English names in product, data, API, and workflow documents. Database and JSON enum values use lowercase snake case unless a provider requires its own name. A role owner is accountable for the definition; `TBD` means the named role has not yet assigned an individual.

The MVP is a target definition. A term marked as deferred, unsupported, or out of scope shall not be introduced implicitly by an endpoint, state, or data field.

## 2. Product and actors

| ID | Term | Definition | Accountable role |
| --- | --- | --- | --- |
| `KROWDS-GL-001` | B2B2C SaaS | A business-to-business-to-consumer software service: organizations operate the platform and consumers use its ticketing and visit flows. | Product Team (TBD) |
| `KROWDS-GL-002` | MVP | The first phased, online-first product scope defined by the canonical English product target. | Product Team (TBD) |
| `KROWDS-GL-003` | Online-first | A workflow in which the authoritative browser or API interaction and provider confirmation occur online; KROWDS does not grant offline gate access. | Product and Engineering (TBD) |
| `KROWDS-GL-004` | IDR-only | The MVP commercial policy that all KROWDS monetary values use Indonesian rupiah (`IDR`). | Commerce Product Owner (TBD) |
| `KROWDS-GL-005` | User | An authenticated platform account that can browse events, purchase tickets, manage e-tickets, and manage ticket holders. A User is not automatically a visitor or ticket holder. | Identity Platform Owner (TBD) |
| `KROWDS-GL-006` | Identity | A separately governed legal-identity record associated with a User, Visitor, or Ticket Holder. It is not the login account. | Privacy and Data Governance Lead (TBD) |
| `KROWDS-GL-007` | Visitor | An organization-scoped operational person record. It may exist without a platform account. | Visitor Operations Owner (TBD) |
| `KROWDS-GL-008` | Ticket Holder | The person identified on a ticket and entitled to access its event. One ticket has one Ticket Holder and one verified Identity in the MVP. | Ticketing Product Owner (TBD) |
| `KROWDS-GL-009` | Visitor / Ticket Holder | The person-facing domain concept used when the operational Visitor record and the ticket beneficiary are discussed together. It remains separate from User and Identity. | Ticketing Product Owner (TBD) |
| `KROWDS-GL-010` | Organization | The tenant and legal operating party that owns venues, events, activities, sessions, staff, commerce, and operational data. | Organization Product Owner (TBD) |
| `KROWDS-GL-011` | Membership | A User’s relationship to one Organization with one fixed MVP role and explicit permissions. It is not a second account. | Organization Product Owner (TBD) |
| `KROWDS-GL-012` | Fixed role | A predefined organization or KREW role in v0.1. Custom roles are deferred. | Organization Product Owner (TBD) |
| `KROWDS-GL-013` | KREW | The internal KROWDS operations team responsible for organization verification, wristband-order verification, production, quality control, fulfillment, and operational oversight. | KREW Operations Lead (TBD) |
| `KROWDS-GL-014` | Platform Admin | An internal platform operator responsible for platform-level support and policy administration. | Platform Operations Lead (TBD) |
| `KROWDS-GL-015` | Cashier | An Organization role that sells tickets in person and reserves existing wristband stock before payment. | Ticketing Product Owner (TBD) |
| `KROWDS-GL-016` | Redemption | The staff workflow that verifies a ticket, confirms the holder, and binds a reserved wristband. | Redemption Operations Owner (TBD) |
| `KROWDS-GL-017` | Gate | An Organization role and registered online device context that requests an access decision for a wristband. | Access Control Product Owner (TBD) |
| `KROWDS-GL-018` | Viewer | A fixed Organization role with read-only operational access. | Organization Product Owner (TBD) |
| `KROWDS-GL-019` | Guardian consent | Verified guardian account, relationship declaration, and explicit consent recorded before a ticket holder under 18 is purchased or access is granted. | Privacy and Data Governance Lead (TBD) |

## 3. Tenancy, identity, and location

| ID | Term | Definition | Accountable role |
| --- | --- | --- | --- |
| `KROWDS-GL-020` | Shared PostgreSQL schema | One Cloud SQL for PostgreSQL schema, named `krowds`, stores KROWDS application data for all organizations. Modules share the schema while remaining in one Go process. | Data Platform Lead (TBD) |
| `KROWDS-GL-021` | `organization_id` | The UUIDv7 foreign key on every organization-owned record. It is the tenant discriminator and is never accepted from a browser as proof of access. | Data Platform Lead (TBD) |
| `KROWDS-GL-022` | Row-Level Security (RLS) | PostgreSQL policies that restrict reads and writes to the authenticated transaction’s organization context. RLS is enabled and forced on tenant-owned tables. | Data Platform Lead (TBD) |
| `KROWDS-GL-023` | RLS context | Transaction-local organization and actor values set by the Go backend after authentication. RLS policies read this context rather than trusting an organization header. | Backend Platform Lead (TBD) |
| `KROWDS-GL-024` | UUIDv7 | A time-sortable UUID used for KROWDS primary and internal foreign keys. API and CSV representations use canonical lowercase UUID strings. | Data Platform Lead (TBD) |
| `KROWDS-GL-025` | UTC storage | Persisting instants in PostgreSQL `timestamptz`, normalized to UTC. An IANA time zone may be stored separately for display and scheduling. | Data Platform Lead (TBD) |
| `KROWDS-GL-026` | Organization -> Venue -> Event -> optional Activity -> Session | The canonical location and scheduling hierarchy. A Session always belongs to an Event; its Activity is optional. | Event Product Owner (TBD) |
| `KROWDS-GL-027` | Venue | The physical operating location between Organization and Event. It is the location used by access scans. | Venue Operations Owner (TBD) |
| `KROWDS-GL-028` | Event | A scheduled visit-based program hosted at one Venue. | Event Product Owner (TBD) |
| `KROWDS-GL-029` | Activity | An optional program block within an Event, such as a session-specific attraction or operating period. | Event Product Owner (TBD) |
| `KROWDS-GL-030` | Session | An event-level or activity-level time window used for scheduling and access. A session with no Activity has a null activity reference. | Event Product Owner (TBD) |
| `KROWDS-GL-031` | Branch | A former or hypothetical location layer that is not an entity, table, field, or API resource in KROWDS. Venue replaces it. | Event Product Owner (TBD) |

## 4. Commerce and access

| ID | Term | Definition | Accountable role |
| --- | --- | --- | --- |
| `KROWDS-GL-040` | Ticket product | A sellable ticket type scoped to an Event, optional Activity, and optional Session. It defines price and access rules. | Ticketing Product Owner (TBD) |
| `KROWDS-GL-041` | Ticket order | A buyer’s or cashier’s purchase record containing ticket items, holders, IDR totals, and payment state. Authoritative order states are Created, Pending, Paid, Failed, Cancelled, and Refunded; ticket issuance is represented separately. | Commerce Product Owner (TBD) |
| `KROWDS-GL-042` | E-ticket | The digital ticket representation issued after verified payment. It identifies the ticket and does not place personal data in its QR credential. | Ticketing Product Owner (TBD) |
| `KROWDS-GL-043` | Payment | A provider-backed payment attempt. Xendit owns the external payment state; KROWDS records only verified, idempotent results. | Commerce Product Owner (TBD) |
| `KROWDS-GL-044` | Xendit | The payment provider for QRIS, Virtual Account, approved e-wallet flows, 30-minute online/15-minute cashier instructions, verified payment webhooks, and full refunds. | Commerce Product Owner (TBD) |
| `KROWDS-GL-045` | Resend | The transactional email provider for OTP, account recovery, invitations, payment, e-ticket, shipping, activation, revision, and security messages. | Platform Operations Lead (TBD) |
| `KROWDS-GL-046` | Entitlement | The time- and scope-bound access right derived from a valid ticket. In the MVP it is single-use and is evaluated online. | Access Control Product Owner (TBD) |
| `KROWDS-GL-047` | Single-use | An entitlement that permits one successful access. A used ticket or wristband cannot grant re-entry in the MVP. | Product Team (TBD) |
| `KROWDS-GL-048` | Re-entry | A second access using the same ticket or wristband. It is deferred and unsupported in the MVP. | Product Team (TBD) |
| `KROWDS-GL-049` | Multi-use | An entitlement that permits a configurable number of successful accesses. It is deferred and unsupported in the MVP. | Product Team (TBD) |
| `KROWDS-GL-050` | Ticket transfer | Changing the assigned ticket holder after payment. It is unsupported in the MVP; holder data is immutable after payment. | Product Team (TBD) |
| `KROWDS-GL-051` | Full refund | A verified Xendit refund of the complete order requested before the ticket is Bound or Used and within 7 calendar days after verified payment, or dual-approved through `exceptional_review` for a later eligible request. Provider failure keeps the refund in reconciliation and does not automatically restore access. Partial refunds are outside the MVP. | Commerce Product Owner (TBD) |
| `KROWDS-GL-052` | Redemption | The verified operation that checks payment, ticket status, holder identity, event scope, and wristband reservation before binding. | Redemption Operations Owner (TBD) |
| `KROWDS-GL-053` | Binding | The relationship `Identity -> Ticket -> Wristband -> Access Entitlement`, created once for an active ticket scope. | Access Control Product Owner (TBD) |
| `KROWDS-GL-054` | Access Granted | The online decision returned when an active wristband, current binding, valid scope, and unused entitlement pass all checks. | Access Control Product Owner (TBD) |
| `KROWDS-GL-055` | Access Denied | A recorded decision that refuses access because a current credential, entitlement, scope, expiry, or revocation check failed. | Access Control Product Owner (TBD) |
| `KROWDS-GL-056` | Access log | An append-only record of each online access attempt, decision, reason code, actor or device, venue, UTC time, and request ID. | Access Control Product Owner (TBD) |
| `KROWDS-GL-057` | Offline gate access | A local gate decision made without the authoritative online KROWDS service. It is deferred and unsupported in the MVP. | Access Control Product Owner (TBD) |
| `KROWDS-GL-058` | Active ticket | A paid ticket that is not `Refunded`, `Cancelled`, `Expired`, or `Used`. The five-ticket Identity/Event limit and one-ticket-per-Event/Ticket Product/Session rule count only active tickets. | Ticketing Product Owner (TBD) |
| `KROWDS-GL-059` | Exceptional review | The refund state for a request outside the seven-day window. Finance must approve or reject it before any provider submission; it is not an automatic refund path. | Finance Product Owner (TBD) |

## 5. Wristband stock and credentials

| ID | Term | Definition | Accountable role |
| --- | --- | --- | --- |
| `KROWDS-GL-060` | Wristband stock | Existing physical inventory that is already available for reservation. It is distinct from a newly produced batch. | Wristband Operations Owner (TBD) |
| `KROWDS-GL-061` | Wristband order | An Organization purchase and fulfillment request for stock or newly produced wristbands. It moves through payment, KREW verification, production, QC, shipment, delivery, and activation. | Wristband Operations Owner (TBD) |
| `KROWDS-GL-062` | Production batch | A quantity-controlled unit of newly produced wristbands that shares a production file, shipment, quality decision, and activation operation. | Wristband Operations Owner (TBD) |
| `KROWDS-GL-063` | Stock ledger | An append-only record of stock movements such as reserve, release, receive, bind, activate, use, disable, revoke, quarantine, and write-off. The balance is derived from signed movements. | Wristband Operations Owner (TBD) |
| `KROWDS-GL-064` | Wristband code | A human-readable identifier printed in plain text on a wristband. It is unique within an organization, is not an access secret, and has no global uniqueness requirement. | Wristband Operations Owner (TBD) |
| `KROWDS-GL-065` | QR payload | The value encoded into a wristband QR credential. It contains an opaque token and no PII or predictable domain data. | Security and Audit Owner (TBD) |
| `KROWDS-GL-066` | Opaque credential | A random token whose meaning cannot be inferred without a server-side lookup. The wristband token uses 16 cryptographically random bytes (128 bits) encoded as unpadded base64url. | Security and Audit Owner (TBD) |
| `KROWDS-GL-067` | Hashed at rest | Storing a SHA-256 digest of the QR token in PostgreSQL while keeping plaintext limited to transient generation and the private production file. | Security and Audit Owner (TBD) |
| `KROWDS-GL-068` | Status-bound | A credential whose authorization is determined from the current wristband, batch, binding, entitlement, expiry, and revocation state on every relevant operation. | Security and Audit Owner (TBD) |
| `KROWDS-GL-069` | Revocable | A credential that can be denied immediately by an authoritative status change. A replacement receives a new token and version. | Security and Audit Owner (TBD) |
| `KROWDS-GL-070` | No PII in QR | A rule that a QR payload contains no name, identity number, ticket, payment, entitlement, organization, event, venue, or other personal data. | Privacy and Data Governance Lead (TBD) |
| `KROWDS-GL-071` | Production CSV | The private row-per-wristband production file whose exact header is `batch_id,wristband_code,qr_payload,schema_version`. It is stored in private Cloud Storage and contains no PII. | Wristband Operations Owner (TBD) |
| `KROWDS-GL-072` | `schema_version` | The version that tells KROWDS how to interpret a production CSV row. It is present in every production row and is not a credential. | Data Platform Lead (TBD) |
| `KROWDS-GL-073` | Batch activation | The authenticated organization operation that verifies a one-time activation code after verified Biteship delivery and organization receipt confirmation, then moves eligible units to `available`. | Wristband Operations Owner (TBD) |
| `KROWDS-GL-074` | Available | A wristband that has passed production or represents existing stock and can be reserved. It is not yet an access credential. | Wristband Operations Owner (TBD) |
| `KROWDS-GL-075` | Reserved | A unit held for one checkout or cashier transaction. A reservation is released or converted to a binding; it is not multi-use inventory. | Wristband Operations Owner (TBD) |
| `KROWDS-GL-076` | Bound | A unit connected to one ticket, one verified identity, and one entitlement scope. | Access Control Product Owner (TBD) |
| `KROWDS-GL-077` | Active | A bound unit whose current single-use entitlement is valid for online access. The QR credential is access-valid only in this state; the first successful access consumes it. | Access Control Product Owner (TBD) |
| `KROWDS-GL-078` | Used | A unit and ticket whose single-use entitlement has been consumed by one successful access. | Access Control Product Owner (TBD) |
| `KROWDS-GL-079` | Disabled | A unit temporarily denied by an authorized operator while its history is preserved. | Access Control Product Owner (TBD) |
| `KROWDS-GL-080` | Revoked | A credential permanently denied by an authoritative security or loss decision. | Security and Audit Owner (TBD) |
| `KROWDS-GL-081` | Expired | A unit or entitlement whose UTC validity end has passed. | Access Control Product Owner (TBD) |
| `KROWDS-GL-082` | Quarantined | A unit or batch removed from allocation, activation, and access because of a quality, safety, or controlled investigation issue. It cannot be used until an authorized resolution. | KREW Operations Lead (TBD) |

## 6. Fulfillment and provider terms

| ID | Term | Definition | Accountable role |
| --- | --- | --- | --- |
| `KROWDS-GL-090` | Quality control (QC) | The KREW inspection of quantity, artwork, material, wristband code, and QR output before shipment. | KREW Operations Lead (TBD) |
| `KROWDS-GL-091` | Biteship | The domestic shipping provider that owns label, tracking, pickup, transit, delivery, failure, and reshipment state. | Fulfillment Operations Owner (TBD) |
| `KROWDS-GL-092` | Domestic shipment | A shipment within Indonesia represented by a Biteship tracking reference. International shipping, cash on delivery, and marketplace courier selection are deferred. | Fulfillment Operations Owner (TBD) |
| `KROWDS-GL-093` | Verified webhook | A provider callback whose raw body and signature or callback token are verified by the Go backend before business processing. | Integration Platform Owner (TBD) |
| `KROWDS-GL-094` | Replay-resistant | A webhook or command that rejects stale or duplicate delivery without repeating a business mutation. | Security and Audit Owner (TBD) |
| `KROWDS-GL-095` | Idempotency | Repeating a command or receiving a duplicate provider event with the same identity and request fingerprint produces one business effect. | Backend API Lead (TBD) |
| `KROWDS-GL-096` | Request ID | A correlation value propagated through API, worker, provider, and audit records. It is not an authorization credential. | Backend Platform Lead (TBD) |
| `KROWDS-GL-097` | RFC 7807 | The HTTP problem-details format used for API errors, including type, title, status, detail, and instance, with KROWDS request and field extensions. | Backend API Lead (TBD) |
| `KROWDS-GL-098` | Cursor pagination | An opaque, signed, tenant-bound continuation token for stable list traversal with default limit 25 and maximum 100. Offset pagination is not used for API collections. | Backend API Lead (TBD) |
| `KROWDS-GL-099` | OpenAPI | The OpenAPI 3.1 description of the `/api/v1` operations, schemas, security, errors, pagination, and verified webhooks. It is validated in CI and approved before external integration. | Backend API Lead (TBD) |
| `KROWDS-GL-100` | Audit trail | Append-only evidence of sensitive actions with actor, organization, request ID, UTC timestamp, result, and reason code. | Security and Audit Owner (TBD) |
| `KROWDS-GL-101` | Break-glass access | A time-bounded, MFA-protected, dual-approved, KREW-only cross-organization access path that is fully audited and cannot set payment or access state. | KREW Operations Lead (TBD) |
| `KROWDS-GL-102` | System of record | The authoritative KROWDS state in Cloud SQL PostgreSQL. Provider state is represented by verified references and projections, not copied as a second application source of truth. | Data Platform Lead (TBD) |
| `KROWDS-GL-103` | Consumer identity review | The distinct manual KREW workflow that reviews a consumer identity before a dependent ticket can be issued or bound. It is separate from organization onboarding. | KREW Operations Lead (TBD) |
| `KROWDS-GL-104` | Reshipment pending | A shipment state after an approved replacement attempt is created from a failed or cancelled domestic shipment. It is not a delivered state and cannot activate a batch. | Fulfillment Operations Owner (TBD) |

## 7. Platform and operations terms

| ID | Term | Definition | Accountable role |
| --- | --- | --- | --- |
| `KROWDS-GL-110` | Go + Gin | The only backend process. It owns authentication, authorization, HTTP APIs, business workflows, persistence, provider orchestration, and audit decisions. | Backend Platform Lead (TBD) |
| `KROWDS-GL-111` | Cloud Run | The target runtime for the Go API, workers, and scheduled endpoints. | Backend Platform Lead (TBD) |
| `KROWDS-GL-112` | Cloud SQL | The managed PostgreSQL service hosting the shared KROWDS schema and tenant RLS. | Data Platform Lead (TBD) |
| `KROWDS-GL-113` | Memorystore | The managed cache used for rate limiting, short-lived locks, and idempotency coordination. | Backend Platform Lead (TBD) |
| `KROWDS-GL-114` | Cloud Tasks | The asynchronous queue for email, provider callbacks, exports, and retries. | Integration Platform Owner (TBD) |
| `KROWDS-GL-115` | Cloud Scheduler | The scheduler for expiry, reconciliation, cleanup, and recurring operational jobs. | Platform Operations Lead (TBD) |
| `KROWDS-GL-116` | Cloud Storage | Private storage for legal documents, artwork, production CSVs, shipment labels, and exports. | Data Platform Lead (TBD) |
| `KROWDS-GL-117` | Secret Manager | The service for provider credentials, signing secrets, and runtime secrets. Secrets never enter the PostgreSQL schema or documentation. | Security and Audit Owner (TBD) |
| `KROWDS-GL-118` | BigQuery | The redacted audit, reconciliation, and operational analytics destination. It is not the transactional source of record. | Data Platform Lead (TBD) |
| `KROWDS-GL-119` | RLS break-glass path | A separately authorized KREW access path that crosses organization scope for support or review and writes a complete audit event. | Security and Audit Owner (TBD) |
| `KROWDS-GL-120` | Cloud Logging | Structured, redacted operational logs correlated by request ID. | Backend Platform Lead (TBD) |
| `KROWDS-GL-121` | Monitoring | Metrics, latency, error, and availability signals for the API and workers. | Backend Platform Lead (TBD) |
| `KROWDS-GL-122` | Error Reporting | Redacted error diagnostics used to investigate failures without exposing credentials or PII. | Backend Platform Lead (TBD) |

## 8. Related documents

- [Canonical English product target](PRODUCT-VISION.md)
- [Bahasa Indonesia product brief](KROWDS.md)
- [Data model](../04-domain/DATA-MODEL.md)
- [API contract](../04-domain/API-CONTRACT.md)
- [State machines](../04-domain/STATE-MACHINES.md)
- [Documentation index](../INDEX.md)
- [Open decisions and release gates](../00-governance/OPEN-DECISIONS.md)
