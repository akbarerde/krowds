# KROWDS-OD-DOC-001 — Open Decisions and Release Gates

## Metadata

| Field | Value |
| --- | --- |
| Document ID | `KROWDS-OD-DOC-001` |
| Version | `0.1` |
| Status | `Draft` |
| Last updated | `2026-09-24` |
| Owner | Document Approver (`TBD`) |
| Purpose | Central register for unresolved implementation, legal, provider, infrastructure, physical, and evidence gates |

This register is the single control point for unresolved `TBD` decisions that affect implementation freeze or production approval. It does not replace the normative requirement in [SRS.md](../02-requirements/SRS.md), [API-CONTRACT.md](../04-domain/API-CONTRACT.md), [DATA-MODEL.md](../04-domain/DATA-MODEL.md), or [STATE-MACHINES.md](../04-domain/STATE-MACHINES.md).

## 1. Rules

- An item remains `Open` until its evidence is recorded and the accountable role accepts it.
- A `TBD` value must not be silently converted into an implementation assumption.
- `Production blocker: Yes` means the affected flow cannot process production personal data, funds, credentials, or customer traffic.
- `Evidence blocker: Yes` means implementation may be built with synthetic data, but the phase cannot exit without the listed evidence.
- Personal names are not stored in this document. Role owners are accountable until a named roster is approved outside the repository.
- Resolving an item requires updating this register and every affected normative document in the same change.

## 2. Open decisions

| Decision ID | Decision or missing input | Accountable role | Needed by | Required evidence | Status | Release effect |
| --- | --- | --- | --- | --- | --- | --- |
| `KROWDS-OD-001` | Actual Google Cloud project IDs for development, staging, and production; logical names remain `krowds-dev`, `krowds-staging`, and `krowds-prod` until confirmed | Platform/SRE | Phase 1 exit | Project inventory and IAM export | Open | Blocks environment provisioning |
| `KROWDS-OD-002` | Cloud Run, Cloud SQL, Memorystore, storage, queue, and BigQuery machine sizes, quotas, and monthly cost budget | Platform/SRE and Data Operations | Before production infrastructure approval | Load-test report, quota review, budget approval | Open | Blocks production deployment |
| `KROWDS-OD-003` | CMEK key project, key hierarchy, rotation owner, and Restricted-data designation | Platform/SRE, Security Engineering, and Privacy and Legal Counsel | Before production data storage | Key policy, IAM review, rotation exercise | Open | Blocks Restricted production data |
| `KROWDS-OD-004` | Approved browser-to-API gateway/identity-aware hostname and certificate ownership | Platform/SRE and Security Engineering | Public API launch | TLS, routing, identity-forwarding, and unauthenticated-invocation tests | Open | Blocks public API launch |
| `KROWDS-OD-005` | Xendit sandbox/production account reference and QRIS, Virtual Account, and approved e-wallet product configuration | Payments Engineering | Phase 2 exit | Account inventory, product configuration, sandbox test | Open | Blocks payment production |
| `KROWDS-OD-006` | Xendit webhook mechanism/version, settlement fields, reconciliation owner, and customer-facing fee/tax wording | Payments Engineering, Finance, and Privacy and Legal Counsel | Phase 2 exit | Provider contract, signature test, settlement mapping, approved wording | Open | Blocks payment and refund production |
| `KROWDS-OD-007` | Resend transactional domain/hostname, DNS owner, SPF/DKIM/DMARC, and sandbox account reference | Notifications Engineering | Before email production | DNS validation, domain ownership, sandbox delivery | Open | Blocks email production |
| `KROWDS-OD-008` | Resend webhook version, provider support path, and final delivery-metric destinations | Notifications Engineering and Security Operations | Before email production | Signature test, bounce/complaint test, dashboard owner | Open | Blocks email production |
| `KROWDS-OD-009` | Biteship organization account, API version, warehouse, and fulfillment contact | Fulfillment Operations | Phase 3 exit | Account inventory, API contract, sandbox access | Open | Blocks shipping production |
| `KROWDS-OD-010` | Approved domestic Biteship service allowlist, parcel profile, webhook mechanism, and no-COD setting | Fulfillment Operations and Security Engineering | Phase 3 exit | Allowlist configuration, quote test, webhook test, contract setting | Open | Blocks shipping production |
| `KROWDS-OD-011` | Google OIDC issuer/client reference, minimum scopes, explicit account-linking decision, and provider transfer review | Identity Engineering and Privacy and Legal Counsel | Before Google sign-in release | OIDC configuration, scope inspection, linking test, legal approval | Open | Blocks Google sign-in release |
| `KROWDS-OD-012` | Provider data-processing terms, subprocessors, transfer safeguards, retention, and deletion propagation | Privacy and Legal Counsel and Partnerships | Before affected production data flow | Executed terms, data map, deletion test | Open | Blocks personal-data production |
| `KROWDS-OD-013` | Indonesia-first legal basis, notices, consent text, guardian/minor wording, and rights workflow | Privacy and Legal Counsel | Before production personal data | Written legal approval and versioned notice/consent records | Open | Blocks production personal data |
| `KROWDS-OD-014` | Tax/e-invoice, customer fee, exceptional-refund, and settlement wording | Finance and Privacy and Legal Counsel | Before commercial release | Finance approval and approved customer copy | Open | Blocks commercial release |
| `KROWDS-OD-015` | Privacy incident notification deadlines, regulator contacts, rights appeal, and complaint channel | Privacy and Legal Counsel and Privacy Operations | Before incident readiness | Legal decision record and tabletop evidence | Open | Blocks incident readiness |
| `KROWDS-OD-016` | Printer, scanner, wristband material, dimensions, QR profile, contrast, scan distance, and wear acceptance | Fulfillment Quality and Operations | Before Phase 3 exit | Manufacturer/model inventory and physical sample report with at least 30 units per design/material combination, 100% critical checks, 0 false grants, and at least 95% first-pass scan success | Open | Blocks physical fulfillment |
| `KROWDS-OD-017` | Venue network profile, registered gate-device procedure, continuity procedure, and rehearsal evidence | Access Operations and Platform/SRE | Before Phase 4 exit | Network measurements, device registration, outage rehearsal | Open | Blocks gate rehearsal |
| `KROWDS-OD-018` | Named on-call, provider, security, privacy, incident, and exception-approver roster with contact channels | Platform/SRE, Security Engineering, and Operations | Before staging | Approved roster outside the repository and exercise record | Open | Blocks staging incident readiness |
| `KROWDS-OD-019` | One pilot organization, one indoor venue, test-visitor cohort, and relative launch window | Product Owner and Operations Owner | Before Phase 4 entry | Named pilot acceptance and venue sign-off | Open | Blocks controlled pilot |
| `KROWDS-OD-020` | Organization-specific ticket price configuration, tax-inclusive display, and Finance approval workflow | Finance and Product Owner | Before Phase 2 exit | Price configuration record and Finance sign-off | Open | Blocks commercial checkout |
| `KROWDS-OD-021` | Provider certification, payment reconciliation, shipping reconciliation, load, restore, rollback, accessibility, and operational evidence | Quality Assurance and relevant owners | Each phase exit | Attached test reports and runbook exercises | Open | Blocks phase exit |
| `KROWDS-OD-022` | Generate and approve the OpenAPI 3.1 artifact at `packages/api/openapi.yaml` from the frozen human-readable API contract | Backend API Lead | Before external integration | OpenAPI validation, operation/schema diff, and contract-test report | Open | Blocks external integration |
| `KROWDS-OD-023` | Implement the target Terraform layout and state bootstrap for development, staging, and production | Platform/SRE | First infrastructure apply | Reviewed plan, state inventory, IAM/network review, and apply evidence | Open | Blocks environment provisioning |
| `KROWDS-OD-024` | Implement the environment-specific public frontend configuration artifact without a Next.js backend route | Frontend Engineering | First frontend Cloud Run deployment | Artifact inspection and browser network trace | Open | Blocks frontend deployment |
| `KROWDS-OD-025` | OTP code format and length, validation copy, and abuse-test vectors | Identity Engineering, Product, and Security | Before authentication implementation freeze | Approved format, abuse review, localization/accessibility review, and test vectors | Open | Blocks authentication implementation freeze |
| `KROWDS-OD-026` | Event publication, scheduling, and availability-window rules within the fixed Venue/Event/Activity/Session hierarchy | Product Owner and Event Operations | Before Phase 2 catalog release | Approved scheduling rules, timezone/calendar tests, and event-state evidence | Open | Blocks event publication |
| `KROWDS-OD-027` | Xendit settlement SLA, reconciliation age threshold, and settlement escalation ownership | Finance, Payments Engineering, and Privacy and Legal Counsel | Before payment production | Provider settlement schedule, reconciliation report, and escalation exercise | Open | Blocks payment settlement readiness |
| `KROWDS-OD-028` | Human-readable wristband-code format, maximum length, generation algorithm, and collision-retry behavior | Fulfillment Operations and Security Architecture | Before Phase 3 physical production | Approved format, collision test, print sample, and audit decision | Open | Blocks physical identifier approval |

## 3. Resolved internal baseline

The following decisions are no longer open implementation questions in the `0.1` baseline. They remain subject to the evidence and legal gates above where applicable.

- Phase order is Foundation/Auth/Org, Commerce, Fulfillment, then Access/Audit.
- MVP is online-first, IDR-only, single-use, non-transferable, and has no offline gate grant.
- Next.js is frontend-only; Go + Gin is the single backend process and authority.
- API pagination is cursor-based with default `25` and maximum `100`; RFC 7807 is canonical; breaking changes require a new major API version with a 90-day deprecation window.
- Client idempotency is retained for 24 hours, webhook freshness is 5 minutes, and provider event deduplication index retention is 30 days.
- Provider calls use a 3-second connect timeout, 10-second read timeout, bounded retries, and dead-letter handling.
- RLS uses `organization_id` and forced policies for tenant tables; global tables use explicit backend policy.
- Ticket uniqueness is limited to one active ticket per Identity/Event/Ticket Product/Session, with a maximum of five active tickets per Identity/Event.
- Delivery requires verified provider delivery evidence and organization receipt confirmation before batch activation.
- A full-refund request after seven calendar days enters `exceptional_review`; no provider call is allowed until a dual-approved Finance decision is recorded.
- Retention, accessibility, testing, telemetry, defect, physical-sample, and operational baselines are defined in the focused engineering documents.
- Optional analytics and marketing remain disabled without explicit consent; operational telemetry is minimized.
- Pilot and production access remain blocked until the evidence and release gates in this register are closed.

## 4. Change protocol

When an item is resolved:

1. Record the decision, date, accountable role, and evidence reference here.
2. Change the status from `Open` to `Accepted` or `Superseded`.
3. Update every affected requirement, state, API, data, security, privacy, deployment, runbook, and test document.
4. Remove the resolved `TBD` marker or replace it with the accepted value and source decision.
5. Run documentation integrity checks and the relevant repository validation.

## 5. Related documents

- [Documentation index](../INDEX.md)
- [Product vision](../01-product/PRODUCT-VISION.md)
- [Product requirements](../01-product/PRD.md)
- [Software requirements](../02-requirements/SRS.md)
- [API contract](../04-domain/API-CONTRACT.md)
- [Data model](../04-domain/DATA-MODEL.md)
- [State machines](../04-domain/STATE-MACHINES.md)
- [Security](../05-security/SECURITY.md)
- [Privacy](../05-security/PRIVACY.md)
- [Integrations](../06-integrations/INTEGRATIONS.md)
- [Deployment](../07-operations/DEPLOYMENT.md)
- [Runbook](../07-operations/RUNBOOK.md)
- [Test plan](../02-requirements/TEST-PLAN.md)
- [Roadmap](../01-product/ROADMAP.md)
