# KROWDS-INDEX-001 — Documentation Index

## Metadata

| Field | Value |
| --- | --- |
| Document ID | `KROWDS-INDEX-001` |
| Version | `0.1` |
| Status | `Draft` |
| Last updated | `2026-09-24` |
| Owner | Document Approver (`TBD`) |

This is the entry point for the KROWDS documentation baseline. Documents remain `Draft` until the accountable approval roles accept them. The English product vision is the canonical engineering reference; `KROWDS.md` remains the Bahasa Indonesia product brief.

## Document map

| Category | Documents | Purpose |
| --- | --- | --- |
| `00-governance` | [OPEN-DECISIONS.md](00-governance/OPEN-DECISIONS.md) | Central register for unresolved implementation, legal, provider, infrastructure, physical, and evidence gates |
| `01-product` | [PRODUCT-VISION.md](01-product/PRODUCT-VISION.md), [KROWDS.md](01-product/KROWDS.md), [BRD.md](01-product/BRD.md), [PRD.md](01-product/PRD.md), [ROADMAP.md](01-product/ROADMAP.md), [GLOSSARY.md](01-product/GLOSSARY.md) | Product target, Bahasa Indonesia brief, business/product requirements, delivery phases, and canonical terminology |
| `02-requirements` | [SRS.md](02-requirements/SRS.md), [NFR.md](02-requirements/NFR.md), [TEST-PLAN.md](02-requirements/TEST-PLAN.md) | Implementable software requirements, quality targets, verification strategy, and traceability |
| `03-architecture` | [ARCHITECTURE.md](03-architecture/ARCHITECTURE.md), [ADR.md](03-architecture/ADR.md), [DESIGN.md](03-architecture/DESIGN.md) | System boundaries, technical decisions, deployment-independent design, and UI system rules |
| `04-domain` | [API-CONTRACT.md](04-domain/API-CONTRACT.md), [DATA-MODEL.md](04-domain/DATA-MODEL.md), [STATE-MACHINES.md](04-domain/STATE-MACHINES.md) | API behavior, persistence and tenant boundaries, and authoritative state transitions |
| `05-security` | [SECURITY.md](05-security/SECURITY.md), [PRIVACY.md](05-security/PRIVACY.md), [RISK-REGISTER.md](05-security/RISK-REGISTER.md) | Threat controls, privacy obligations, risk ownership, and release controls |
| `06-integrations` | [INTEGRATIONS.md](06-integrations/INTEGRATIONS.md) | Provider contracts, authentication, replay protection, reconciliation, and external data boundaries |
| `07-operations` | [DEPLOYMENT.md](07-operations/DEPLOYMENT.md), [RUNBOOK.md](07-operations/RUNBOOK.md) | Environment deployment, rollback, recovery, incident response, and operational procedures |

## Source-of-truth order

1. `01-product/PRODUCT-VISION.md` defines the canonical English product target and confirmed policy decisions.
2. `01-product/KROWDS.md` explains the same product direction in Bahasa Indonesia; it does not override the English engineering documents.
3. `01-product/BRD.md`, `01-product/PRD.md`, `02-requirements/SRS.md`, and `02-requirements/NFR.md` turn the product target into business, software, and quality requirements.
4. `04-domain/API-CONTRACT.md`, `04-domain/DATA-MODEL.md`, and `04-domain/STATE-MACHINES.md` define the authoritative technical contracts.
5. `03-architecture/ARCHITECTURE.md`, `03-architecture/ADR.md`, `05-security/SECURITY.md`, `05-security/PRIVACY.md`, and `06-integrations/INTEGRATIONS.md` define implementation boundaries and controls.
6. `02-requirements/TEST-PLAN.md`, `05-security/RISK-REGISTER.md`, `07-operations/DEPLOYMENT.md`, and `07-operations/RUNBOOK.md` define evidence and operational readiness.
7. `00-governance/OPEN-DECISIONS.md` is the single register for unresolved external inputs and implementation gates. A row is not closed by changing only one document.

## Document lifecycle

| Status | Meaning |
| --- | --- |
| `Draft` | Being prepared or awaiting review. |
| `In Review` | Awaiting stakeholder review. |
| `Approved` | Accepted delivery or design baseline. |
| `Deprecated` | No longer maintained. |
| `Superseded` | Replaced by another approved document. |

## Working rules

1. Use stable `KROWDS-*` identifiers for requirements, decisions, data objects, tests, and risks.
2. Keep the English engineering documents consistent with `01-product/PRODUCT-VISION.md`.
3. Treat `01-product/KROWDS.md` as the Bahasa Indonesia product brief, not as a replacement for the English canonical documents.
4. Do not store secrets, passwords, API keys, private keys, or unnecessary PII.
5. Use `00-governance/OPEN-DECISIONS.md` as the single register for unresolved implementation, legal, provider, infrastructure, physical, and evidence gates. Every open item has an owner, needed-by gate, evidence requirement, status, and release effect.
6. A `TBD` value must not be silently converted into an implementation assumption. Resolve it in the register first, then update every affected document in the same change.
7. Update related documents when a requirement, state transition, integration, or architecture decision changes.
8. Repeated statements across documents are traceability projections, not independent decisions; resolve conflicts using the source-of-truth order and the central register.
9. Next.js remains frontend-only. Go + Gin owns backend APIs, authentication, authorization, persistence, queues, provider orchestration, and business workflows.
10. Cloud Run remains one deployable Go process; Cloud SQL is the system of record; BigQuery is for audit and operational analytics.
11. Resend, Xendit, and Biteship integrations are backend-only and must be authenticated, idempotent, auditable, and replay-resistant.

## Approval and ownership

Personal names are not assumed. Each document uses role-based ownership with `TBD` where a named owner is not yet assigned:

- Product Team;
- Engineering;
- Security and Privacy;
- Operations/KREW;
- Payment and Settlement;
- Document Approver.

The current baseline version is `0.1`, last updated `2026-09-24`.
