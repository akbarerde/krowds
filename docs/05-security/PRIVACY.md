# KROWDS-PRIVACY-001 — Privacy and Personal Data Requirements

## Metadata

| Field | Value |
| --- | --- |
| Document ID | `KROWDS-PRIVACY-001` |
| Version | `0.1` |
| Status | `Draft` |
| Release label | `0.1 Draft` |
| Last updated | `2026-09-24` |
| Scope | Personal data processed by KROWDS for visitors, ticket holders, organizations, staff, and internal KREW operations |
| Canonical product reference | [KROWDS Product Vision](../01-product/PRODUCT-VISION.md) |
| Privacy owner | Privacy and Legal Counsel — personal name: TBD |
| Data protection lead | Privacy Operations — personal name: TBD |
| Security reviewer | Security Engineering — personal name: TBD |
| Product data steward | Product and Customer Operations — personal name: TBD |
| Review rule | The Indonesia-first legal review gate is mandatory for every production data flow |

## 1. Purpose and status

This document defines KROWDS privacy requirements for collection, use, disclosure, retention, deletion, access, and incident handling of personal data. It is a product and engineering baseline, not legal advice. Privacy and Legal Counsel must interpret applicable Indonesian law, implementing regulations, sector requirements, and contract terms.

KROWDS processes personal data in several contexts described by the product baseline:

- visitor registration, email OTP, Google sign-in, and profile data;
- identity verification and ticket-holder records;
- organization onboarding, legal-entity documents, responsible-person data, and bank details;
- staff invitations, role assignments, login, MFA, and operational activity;
- ticket orders, payments, refunds, wristband binding, and access logs;
- shipping addresses and delivery status for physical wristband orders; and
- support, security, audit, analytics, and incident-response records.

The product supports Indonesia-first operation. That means the privacy and legal review gate is completed before production, before a new personal-data purpose is enabled, and before a new provider, region, data class, or material policy change is released. The current MVP is phased, online-first, IDR-only, and single-use; ticket transfer, re-entry, multi-use, and offline gate access are not part of the data or consent model.

## 2. Interpretation of status

- **Confirmed decision** — a requirement or product constraint for this draft.
- **TBD** — an unresolved value or decision that must not be guessed.
- **TBD pending legal** — an unresolved item specifically blocked on written review by Privacy and Legal Counsel.
- **Prohibited** — data that KROWDS must not collect, store, or process through the baseline product.

All owners in this document are roles. Personal names are intentionally recorded as TBD until the responsible people are assigned.

## 3. Indonesia-first privacy/legal review gate

### 3.1 Gate rule

KROWDS-PRI-001 — Production collection or processing of personal data is blocked until Privacy and Legal Counsel records a written approval for the Indonesia-first data map and the controls in this document.

The approval record shall identify:

1. the data classes, sources, purposes, and systems involved;
2. the applicable legal basis for each purpose and whether consent is required;
3. the notice, consent, withdrawal, and preference mechanism;
4. retention and deletion rules, including backups and provider copies;
5. the data-subject rights process and response target;
6. controller, processor, joint-controller, and subprocessor roles where applicable;
7. cross-border transfer locations and safeguards;
8. security controls, incident contacts, and notification responsibilities;
9. age, minors, guardian, and vulnerable-person requirements where relevant; and
10. unresolved questions, compensating controls, owners, and approval conditions.

The contract/service-necessity and explicit-consent baseline is confirmed in `PRODUCT-VISION.md`; final legal wording, statutory deadlines, and notices remain subject to counsel. A data field being present in the product baseline does not by itself establish that the field is necessary or lawful for every use.

### 3.2 Launch checklist

| ID | Review artifact | Pass condition | State | Owner |
| --- | --- | --- | --- | --- |
| KROWDS-PRI-002 | Data inventory and flow map | Every source, field, purpose, system, recipient, region, and deletion path is named | Required before production | Privacy Operations — personal name: TBD |
| KROWDS-PRI-003 | Notice and consent review | Users receive the approved purpose and processing notice before the relevant collection; optional and required data are distinguishable | Required before production | Privacy and Legal Counsel — personal name: TBD |
| KROWDS-PRI-004 | Legal-basis register | Contract/service necessity is the baseline for account, auth, ticket, payment, shipping, and fulfillment; optional analytics, marketing, and optional profile data require explicit consent; final legal wording remains gated | Confirmed baseline; legal wording TBD | Privacy and Legal Counsel — personal name: TBD |
| KROWDS-PRI-005 | Retention schedule | Tiered baseline is defined in section 8: account/profile 24 months, OTP/auth 30 days, support/shipping 12 months, finance and organization legal/banking 7 years, audit/security and wristband/QR history 24 months, production CSV and event-level analytics 30 days, operational logs 30/90/365 days, and backups 7/14/35 days by environment; legal holds may extend | Confirmed baseline; legal exceptions TBD | Privacy and Legal Counsel and Data Operations — personal names: TBD |
| KROWDS-PRI-006 | Vendor and transfer review | Xendit, Resend, Biteship, Google Cloud, Google OAuth/OIDC provider, and any later provider have documented purpose, data, region, terms, and safeguards | Required before production | Privacy and Legal Counsel — personal name: TBD |
| KROWDS-PRI-007 | Rights and complaint procedure | Access, correction, deletion, restriction, portability, objection, withdrawal, and complaint paths have owners and escalation steps | Required before production | Privacy Operations — personal name: TBD |
| KROWDS-PRI-008 | Incident and notification procedure | Security, privacy, product, and provider contacts can assess and notify under the approved legal process | Required before production | Privacy and Legal Counsel and Security Engineering — personal names: TBD |
| KROWDS-PRI-009 | Age and vulnerable-user decision | A ticket holder under 18 must have a verified guardian relationship and recorded consent before purchase or access. Evidence requirements, legal wording, and guardian workflow are explicitly approved before the minor flow is enabled | Confirmed product decision; legal details TBD | Product and Privacy and Legal Counsel — personal names: TBD |
| KROWDS-PRI-010 | Data-subject and customer communications | The approved language, support channel, and identity-verification process are ready for each affected audience | TBD pending legal | Customer Operations and Privacy and Legal Counsel — personal names: TBD |
| KROWDS-PRI-011 | MVP privacy baseline | The product is online-first, IDR-only, and single-use. It shall not collect or expose data for ticket transfer, re-entry, multi-use, offline gate grants, or non-IDR settlement. An issued ticket holder is immutable after payment. | Confirmed decision | Product and Privacy Operations — personal names: TBD |
| KROWDS-PRI-012 | Privacy impact assessment | A documented assessment covers purposes, data classes, risks, safeguards, rights impact, and residual risk before production or a material new data flow | Required before production | Privacy Operations and Security Engineering — personal names: TBD |

The gate is a release control. A partial approval may authorize a limited pilot only when the written record names the excluded data class, the compensating control, the owner, and the expiry.

## 4. Privacy principles

KROWDS shall apply the following principles to every data flow:

1. **Purpose limitation:** collect and use a field only for the approved purpose and compatible follow-on purpose.
2. **Data minimization:** collect the least information needed to provide the requested service, satisfy legal obligations, and protect access.
3. **Accuracy:** allow a user or organization to correct inaccurate data and record when correction is not appropriate.
4. **Storage limitation:** retain data only for the approved period, then delete, anonymize, or restrict it as required.
5. **Integrity and confidentiality:** protect data from unauthorized access, alteration, disclosure, loss, and misuse.
6. **Transparency:** explain material processing, recipients, retention, rights, and automated decisions in clear language approved by Legal.
7. **Accountability:** keep owners, approvals, access records, deletion evidence, and review dates.
8. **Default privacy:** non-essential analytics, marketing, exports, and optional identity attributes are off unless the approved purpose is active.

Legal terms such as controller, processor, personal data, sensitive data, and consent must be used only as defined by the applicable Indonesian legal review.

## 5. PII and data classification

KROWDS uses the following classes. A record can move to a more restrictive class when it is linked to a person or can reasonably identify a person.

| Class | Definition | KROWDS examples | Default handling | Owner |
| --- | --- | --- | --- | --- |
| Public | Information intentionally published for general use | Event name, public description, published opening information, public ticket type | May be displayed publicly, but publication does not authorize unrelated reuse | Product Operations — personal name: TBD |
| Internal | Non-public operational information with low personal impact | Internal status labels, non-sensitive configuration, aggregate counts that cannot reasonably identify a person | Organization or workforce access; no public export | Platform/SRE — personal name: TBD |
| Confidential | Personal or business information with limited direct impact | Name, email, phone number, organization address, staff profile, shipping contact, ordinary audit metadata | Need-to-know access, encryption, redaction, and defined retention | Privacy Operations — personal name: TBD |
| Restricted personal data | Highly identifying, regulated, financially sensitive, or linkable identity and access data | Government identity type and number, KTP/NIK or other national identifier, legal documents, NIB/NPWP records, bank account, precise access history, identity-linked QR activity, financial transaction records | Strong authentication, field protection where required, restricted exports, dual approval for high-risk reads, immutable audit | Privacy and Legal Counsel — personal name: TBD |
| Pseudonymous operational data | A token or identifier that is not directly identifying by itself but can be linked to a person or transaction | User ID, organization ID, order ID, ticket ID, wristband code, QR token, request ID, provider event ID | Treat as Confidential or Restricted when linkage is possible; do not re-identify for unrelated purposes | Data Protection — personal name: TBD |
| Prohibited security data | Credentials or payment secrets that must not be retained as ordinary application data | Raw card number, CVV, password, OTP value, private key, webhook secret, bearer token | Never collect, store, log, export, or include in analytics; use protected verification or secret-management flows | Security Engineering — personal name: TBD |

### 5.1 Class requirements

| ID | Requirement | State | Verification |
| --- | --- | --- | --- |
| KROWDS-PRI-020 | The system shall assign and enforce a classification for every persisted or transmitted personal-data field. Unclassified fields are not allowed in a production schema. | Confirmed decision | Schema review and automated classification check |
| KROWDS-PRI-021 | Restricted personal data shall be accessible only to an approved role, organization, and purpose. A gate or cashier role shall see only the minimum identity fields needed for the current transaction. | Confirmed decision | Role and screen review; API response review |
| KROWDS-PRI-022 | Pseudonymous identifiers shall not be treated as anonymous. BigQuery, exports, support tools, and logs shall retain the linkage controls needed to prevent re-identification. | Confirmed decision | Dataset and export review |
| KROWDS-PRI-023 | Raw card data and equivalent payment credentials are prohibited in KROWDS. Xendit-hosted or tokenized collection shall keep payment credentials outside KROWDS storage and ordinary processing. | Confirmed decision | Payment-flow and data-store review |
| KROWDS-PRI-024 | Passwords, OTPs, access tokens, and provider secrets shall be excluded from personal-data exports, analytics events, and ordinary audit payloads. OTP verification may retain only the minimum protected value needed for the approved check and expiry process. | Confirmed decision | Log and data-flow scan |
| KROWDS-PRI-025 | A new field containing identity, location, biometric, health, religious, political, union, financial, or child-related data shall trigger a privacy impact review and legal gate before collection. | Confirmed decision; scope TBD | Change review and schema gate |
| KROWDS-PRI-026 | KROWDS shall not infer sensitive traits or use identity data for advertising, profiling, or eligibility decisions unless a separate approved purpose, legal basis, notice, and control set exists. | Confirmed decision | Product and analytics review |
| KROWDS-PRI-027 | Anonymized data may be retained only when re-identification is not reasonably possible and the method is reviewed. A pseudonym is not an anonymization decision. | Confirmed decision; method TBD | Privacy assessment and re-identification test |
| KROWDS-PRI-028 | The MVP does not require a consumer identity-document image. Identity images, OCR, liveness, and automated identity-document verification are not enabled by this baseline. A new identity-document image flow requires a separate purpose, necessity, access, retention, and legal gate. | Confirmed decision | Schema and onboarding review |

### 5.2 PII class map

The class labels below are a practical KROWDS handling map. Privacy and Legal Counsel must confirm the applicable legal terms and any additional sensitive category before production.

| ID | PII class | Examples | Required handling | State | Owner |
| --- | --- | --- | --- | --- | --- |
| KROWDS-PRI-042 | Direct identifiers | Full name, email, phone number, postal address, account display name | Confidential by default; need-to-know access, encryption, redaction, and approved export only | Confirmed handling class | Privacy Operations — personal name: TBD |
| KROWDS-PRI-043 | Government and legal identifiers | Identity type and number, KTP/NIK, NIB, NPWP, deed, SK Kemenkumham, organization-document data | Restricted when linked to a person or organization representative; separate legal-document store and restricted KREW review | Confirmed handling class; legal basis TBD | Privacy and Legal Counsel — personal name: TBD |
| KROWDS-PRI-044 | Financial PII | Bank account and owner name, payment references, transaction and refund records, finance exports | Restricted; least-privilege finance access, encryption, audit, no raw card data, approved retention | Confirmed handling class; legal basis TBD | Finance Operations and Privacy and Legal Counsel — personal names: TBD |
| KROWDS-PRI-045 | Identity-linked commerce and access PII | Buyer and ticket-holder relationship, ticket, event, wristband binding, entitlement, gate decision, venue and staff context | Restricted when linkable; purpose-bound access, field minimization, audit, and immediate credential revocation where risk is identified | Confirmed handling class; legal basis TBD | Product Operations and Security Engineering — personal names: TBD |
| KROWDS-PRI-046 | Workforce and security PII | Staff profile, role, invitation, login, MFA status, device/IP/session context, audit and break-glass activity | Confidential or Restricted; individual accounts, staff MFA, case-bound access, redaction, and immutable audit | Confirmed handling class; legal basis TBD | Security Engineering — personal name: TBD |
| KROWDS-PRI-047 | Minor and guardian PII | Minor ticket-holder record, verified guardian relationship, consent and guardian contact | Restricted; verified guardian relationship and consent are required before purchase or access; age and evidence rules TBD | Confirmed product handling; legal details TBD | Product and Privacy and Legal Counsel — personal names: TBD |
| KROWDS-PRI-048 | Pseudonymous PII | User ID, organization ID, order ID, ticket ID, wristband code, QR token hash, request/provider event ID | Treat as PII when linkable; keep linkage controlled, prohibit unrelated re-identification, and apply approved analytics controls | Confirmed handling class; anonymization method TBD | Data Protection — personal name: TBD |
| KROWDS-PRI-049 | Prohibited credential and payment data | Raw card number, CVV, readable OTP, password, private key, bearer token, provider secret | Never store in ordinary application data, logs, analytics, exports, or email; use provider or secret-management controls | Confirmed prohibition | Security Engineering — personal name: TBD |

## 6. Data inventory, purpose, and flow

| ID | Data set | Likely fields | Stated product purpose | Recipient or system | Legal basis and retention |
| --- | --- | --- | --- | --- | --- |
| KROWDS-PRI-030 | User account | Name, email, Google subject, email-verification state, account status | Account creation, login, service communication, security | KROWDS account store; Google OAuth/OIDC provider when used; Resend for verification messages | Contract/service necessity; account/profile 24-month baseline; legal wording and provider terms TBD |
| KROWDS-PRI-031 | User identity profile | Identity type, identity number, full legal name, and manual KREW review status | Identity matching, duplicate prevention, ticket-holder verification | KROWDS restricted identity store and protected identity-review workflow; authorized onboarding and gate workflows | Contract/service necessity; 24-month review evidence; legal wording TBD |
| KROWDS-PRI-032 | Organization onboarding | Legal entity, registration, representative, tax ID, address, bank verification, authorized signatory, and supporting documents | Organization verification, contracting, billing, operational setup | KROWDS organization store; authorized KREW review; approved payment and logistics providers where necessary | Contract/service necessity; 7-year organization/finance record baseline; legal wording TBD |
| KROWDS-PRI-033 | Staff and team | Staff profile, invitation, role, permission, work email, login, MFA status, session/device context | Individual access, least-privilege operations, accountability | KROWDS identity and audit stores | Contract/service necessity; security/audit retention follows the 24-month baseline; legal wording TBD |
| KROWDS-PRI-034 | Ticket holder and order | Buyer and ticket-holder identity, ticket, event, session, holder linkage, order status | Ticket issuance, redemption, identity matching, access entitlement | KROWDS ticketing and access stores; authorized organization staff | Contract/service necessity; 7-year finance/order baseline; legal wording and limitation evidence TBD |
| KROWDS-PRI-035 | Payment record | Amount, currency, status, Xendit transaction/reference, refund and reconciliation metadata | Payment confirmation, receipts, refund, accounting, dispute handling | KROWDS payment store; Xendit; approved finance role | Contract/service necessity; 7-year finance baseline; no raw card data; legal wording TBD |
| KROWDS-PRI-036 | Wristband and QR | Wristband code, QR token hash, batch, binding, entitlement, status, credential version | Production, inventory, redemption, access control, revocation | KROWDS inventory, production-file, and access stores; private Cloud Storage | Contract/service necessity; 24-month historical record baseline; plaintext CSV token expires 30 days after activation; legal wording TBD |
| KROWDS-PRI-037 | Access and operational audit | Scan result, venue, staff identity, time, reason, access log, role changes, batch activation | Safety, fraud prevention, investigation, accountability | KROWDS audit store; restricted Security and Operations roles | Contract/service necessity; 24-month audit/security baseline; legal wording TBD |
| KROWDS-PRI-038 | Shipping | Recipient name, phone, address, parcel dimensions, tracking status, delivery events | Domestic physical fulfillment of wristband orders | Biteship; KROWDS order and support records | Contract/service necessity; domestic, organization-paid, no COD; 12-month shipping baseline; legal wording/provider terms TBD |
| KROWDS-PRI-039 | Email and OTP metadata | Destination address, delivery state, bounce, complaint, message category, request time, resend result | Account verification, transactional notices, security notices, delivery support | Resend; KROWDS notification metadata | Contract/service necessity; OTP/email metadata 30-day baseline; readable OTP is never retained; legal wording/provider terms TBD |
| KROWDS-PRI-040 | Analytics and service telemetry | Pseudonymous user/organization IDs, feature events, performance metrics, error state | Reliability, capacity, fraud detection, product improvement | Cloud Logging, monitoring, and approved BigQuery datasets | Raw PII prohibited; event analytics 30 days and operational telemetry 30/90/365 days; purpose/access approval and legal basis TBD |
| KROWDS-PRI-041 | Support and complaints | User statement, contact details, case history, requested action, resolution | Respond to requests, investigate misuse, enforce terms | KROWDS support store; approved provider support channel | Contract/service necessity; 12-month support/case baseline; legal wording and limitation evidence TBD |

A field may appear in more than one data set. The highest applicable class controls its storage, access, export, and deletion treatment.

## 7. Notice, consent, and user choice

| ID | Requirement | State | Verification |
| --- | --- | --- | --- |
| KROWDS-PRI-050 | KROWDS shall present a clear notice before collecting personal data and before changing a material purpose. The notice shall identify the controller or responsible party, purposes, data classes, recipients or provider categories, retention approach, rights channel, and incident/contact route. | Confirmed decision; final wording TBD pending legal | Notice review and UI test |
| KROWDS-PRI-051 | Required service data and optional data shall be distinguishable. KROWDS shall not make a non-essential field a condition of account creation when the approved purpose does not require it. | Confirmed decision | Form and API validation test |
| KROWDS-PRI-052 | Service consent, optional profile enrichment, marketing messages, analytics use, and research use shall be separately recorded where required. A marketing preference change shall not change a necessary service-security message. | Confirmed decision; legal basis TBD | Consent-event and preference test |
| KROWDS-PRI-053 | A user may withdraw consent or change an optional preference through a supported channel. Withdrawal shall stop the associated future processing without silently removing records that the approved legal basis requires KROWDS to retain. | Confirmed decision; response timing TBD | Preference and deletion workflow test |
| KROWDS-PRI-054 | Google sign-in shall disclose the relevant identity provider and data transfer and request only the minimum approved scopes. A Google email address shall not be treated as a stable identity key without a documented linking rule. | Confirmed decision; provider terms TBD | OIDC scope and account-linking test |
| KROWDS-PRI-055 | Identity-document collection shall use a separate purpose and access boundary from ordinary profile browsing. Staff shall see the document only when performing an approved review or transaction. | Confirmed decision | Role and document-access test |
| KROWDS-PRI-056 | A ticket holder under 18 may be processed only when a verified guardian account, relationship declaration, and consent record exist before purchase or access. Event-specific evidence and legal wording remain TBD pending legal; until approved, the minor flow remains disabled. | Confirmed product decision; legal details TBD | Eligibility, guardian, and onboarding test |
| KROWDS-PRI-057 | KROWDS shall record notice version, consent state, source, timestamp, and withdrawal state in a protected consent record. The version identifier shall be a stable fact, not a user-facing technical promise. | Confirmed decision; schema TBD | Consent schema and retention test |

## 8. Retention, deletion, and legal holds

The following tiered retention baseline is confirmed for the MVP. Legal review and an explicit legal hold may require a longer period; production use still requires counsel approval of wording and statutory interpretation.

| ID | Data set | MVP retention duration | Deletion or restriction behavior | State | Owner |
| --- | --- | --- | --- | --- | --- |
| KROWDS-PRI-060 | Account and profile data | 24 months after account closure | Delete or irreversibly anonymize after the closure trigger, subject to legal hold and financial/security exceptions | Confirmed baseline; legal hold applies | Privacy Operations — personal name: TBD |
| KROWDS-PRI-061 | Government identity and identity-review evidence | 24 months after the review/identity relationship closes | Remove from active workflows first; retain only the approved restricted review record or delete according to purpose and legal obligation | Confirmed baseline; legal wording TBD | Privacy and Legal Counsel — personal name: TBD |
| KROWDS-PRI-062 | Organization legal and banking records | 7 years after the approved contractual/legal trigger | Restrict to approved organization/finance roles; delete or anonymize when the contractual or legal period ends | Confirmed baseline; legal interpretation TBD | Finance Operations and Privacy and Legal Counsel — personal names: TBD |
| KROWDS-PRI-063 | Tickets, orders, payments, refunds, and receipts | 7 years after the financial close trigger | Preserve required accounting and dispute records; remove non-required personal details as soon as lawful | Confirmed baseline; tax/settlement details TBD | Finance and Payments Operations — personal name: TBD |
| KROWDS-PRI-064 | Wristband, QR, binding, and entitlement records | 24 months after lifecycle closure; credential disabled immediately on expiry, loss, fraud, or approved request | Delete or anonymize historical records after the period; never retain a usable credential | Confirmed baseline | Product and Security Engineering — personal names: TBD |
| KROWDS-PRI-065 | Access, scan, redemption, and operational audit records | 24 months after the audit event | Keep protected while retained; delete or anonymize after the period; never silently delete during an active investigation | Confirmed baseline | Security Operations — personal name: TBD |
| KROWDS-PRI-066 | OTP, email delivery, bounce, and complaint metadata | 30 days after the event | Never retain a readable OTP in ordinary logs; delete or anonymize delivery metadata after the diagnostic window | Confirmed baseline | Notifications Engineering and Privacy and Legal Counsel — personal names: TBD |
| KROWDS-PRI-067 | Shipping address and tracking records | 12 months after fulfillment reconciliation and claims window | Remove from active view after fulfillment and provider reconciliation; delete or anonymize afterward | Confirmed baseline | Fulfillment Operations — personal name: TBD |
| KROWDS-PRI-068 | Support, complaint, and abuse cases | 12 months after case closure | Restrict to the assigned case team; delete or anonymize after resolution and the approved limitation period | Confirmed baseline | Customer Support and Privacy Operations — personal names: TBD |
| KROWDS-PRI-069 | BigQuery and analytics records | 30 days for event-level analytics; longer only for an approved audit dataset | Use aggregates or approved pseudonymization; expire or delete datasets and exports at the approved point | Confirmed baseline; legal basis TBD | Data Platform and Privacy Operations — personal names: TBD |
| KROWDS-PRI-070 | Backups and disaster-recovery copies | 7 days development, 14 days staging, 35 days production | Keep encrypted and access-restricted; age out or restore into a controlled environment, then apply the approved deletion process | Confirmed baseline | Platform/SRE and Privacy and Legal Counsel — personal names: TBD |
| KROWDS-PRI-075 | Private wristband production CSV | 30 days after batch activation; fulfillment reconciliation must complete before deletion but does not extend the timer absent legal hold | Delete the private object and local copies after the timer; retain only metadata/hash/audit evidence | Confirmed baseline | Wristband Operations and Privacy — personal names: TBD |

### 8.1 Deletion requirements

1. A deletion request receives a unique case ID, authenticated requester identity, scope, timestamp, and owner.
2. The system checks legal holds, financial record requirements, active tickets, security investigations, and provider exceptions before deleting.
3. The system deletes or irreversibly anonymizes active databases, search indexes, object copies, exports, notification data, and provider records according to the approved schedule.
4. Backups are not selectively edited. Data is removed as those backups age out or through an approved restore-and-purge process that does not weaken recovery controls.
5. The system records completion, exceptions, unresolved dependencies, and the next review date without retaining the deleted data in the deletion log.
6. A user or organization is not told that deletion is complete while a known copy remains active unless Legal has approved that wording and the exception is disclosed accurately.

| ID | Requirement | State | Verification |
| --- | --- | --- | --- |
| KROWDS-PRI-071 | Account closure and approved deletion requests shall invoke the same downstream deletion and restriction workflow, including BigQuery, Cloud Storage, Resend metadata, Biteship data, and payment references where applicable. Closure revokes sessions and optional processing immediately; provider propagation timing remains a legal/evidence gate. | Confirmed baseline; provider evidence required | End-to-end deletion test |
| KROWDS-PRI-072 | A legal hold shall be explicit, scoped, time-bound, and access-controlled. It shall not become an undocumented reason to retain all data indefinitely. | Confirmed decision; hold duration TBD | Legal-hold review |
| KROWDS-PRI-073 | A credential or QR token shall be disabled before its historical record is deleted when loss, fraud, or a rights request creates an active risk. | Confirmed decision | Credential revocation test |
| KROWDS-PRI-074 | Deletion and anonymization jobs shall be idempotent, observable, and restart-safe, and shall not recreate deleted data from a stale queue message. | Confirmed decision | Job retry and reconciliation test |

## 9. Data-subject rights and complaints

KROWDS shall provide a documented route for a person or authorized organization representative to:

- confirm whether KROWDS processes their data;
- obtain a copy or summary in a usable format;
- correct inaccurate or incomplete data;
- request deletion or restriction where applicable;
- withdraw consent and change an optional preference;
- object to a processing purpose where applicable;
- receive information about recipients and retention where applicable; and
- complain to KROWDS or the competent authority through the approved channel.

| ID | Requirement | State | Verification |
| --- | --- | --- | --- |
| KROWDS-PRI-080 | A rights request shall be authenticated using a risk-appropriate method before personal data is disclosed. Identity proofing shall be minimized and shall not collect more documents than the approved process requires. | Confirmed decision; method TBD | Rights workflow test |
| KROWDS-PRI-081 | The response shall cover the systems and providers in scope, explain any legal or security exception, and provide a safe next step. Acknowledge within 2 business days, target completion within 30 calendar days, and provide an appeal route; counsel may shorten the target. | Confirmed baseline; legal wording TBD | Case review and legal sign-off |
| KROWDS-PRI-082 | A rights request shall not disclose another person's data, an internal security control, or a credential. A request for one person's data shall be filtered before export. | Confirmed decision | Redaction and access test |
| KROWDS-PRI-083 | A complaint or security report shall be acknowledged, assigned, investigated, and closed with a documented outcome. Repeated complaints and unresolved high-risk cases shall be escalated to Privacy and Legal Counsel. | Confirmed decision; acknowledgement uses the approved support SLA | Case-management exercise |
| KROWDS-PRI-084 | Rights, support, and fraud cases shall use least-privilege access and an audit record. Bulk export for a case is prohibited unless the case owner and an additional approver authorize it. | Confirmed decision | Dual-approval export test |

## 10. Sharing, providers, and international transfers

| ID | Requirement | State | Verification |
| --- | --- | --- | --- |
| KROWDS-PRI-090 | KROWDS shall disclose only the personal data required for the approved provider purpose. No provider may receive identity documents, full QR credentials, or raw card data unless a specific legal and security review approves it. | Confirmed decision | Provider payload inspection |
| KROWDS-PRI-091 | Xendit receives payment data through its hosted or tokenized flow; KROWDS stores only the approved transaction reference, status, amount, and reconciliation fields. | Confirmed decision | Payment data map |
| KROWDS-PRI-092 | Resend receives an approved recipient address, verified sending-domain identity, and message content only. Message content shall avoid unnecessary identity, document, payment, or access information. | Confirmed decision | Notification payload and domain review |
| KROWDS-PRI-093 | Biteship receives the minimum domestic shipping contact and parcel data. The baseline is organization-paid with no cash-on-delivery option. | Confirmed decision | Shipping contract and payload test |
| KROWDS-PRI-094 | GCP and Google Cloud access shall use organization, workload, and dataset boundaries. GCP Secret Manager, Cloud SQL, Cloud Storage, and BigQuery shall remain environment-isolated. Production personal data shall not be used for general development or ad hoc analysis. | Confirmed decision | IAM and project review |
| KROWDS-PRI-095 | The final list of subprocessors, provider regions, international transfers, and contractual safeguards is TBD pending Indonesian legal review. A new transfer path is a release-blocking legal gate. | TBD; legal gate | Data-transfer assessment |
| KROWDS-PRI-096 | Provider termination, contract change, or subprocessor change shall trigger a documented review before new data is sent. Existing data must be returned, deleted, or retained under the approved instruction. | Confirmed decision; timing TBD | Provider offboarding test |
| KROWDS-PRI-097 | KROWDS shall not sell personal data or share it for unrelated advertising. Any future advertising, profiling, or partner use requires a separate purpose, legal-basis decision, notice, and gate. | Confirmed decision | Contract and product review |

## 11. Privacy security controls

The following controls are mandatory and are implemented together with `SECURITY.md`:

| ID | Control | Requirement | State |
| --- | --- | --- | --- |
| KROWDS-PRI-100 | Least privilege | Staff and support access shall be organization-scoped, purpose-bound, time-bound where practical, and individually attributable. | Confirmed decision |
| KROWDS-PRI-101 | Privileged MFA | KREW, Platform Admin, Finance, and Organization Admin users shall use MFA; other staff or support users shall use MFA when the approved role-risk policy requires it. Email OTP is not sufficient for privileged access. | Confirmed decision |
| KROWDS-PRI-102 | Tenant isolation | Cloud SQL RLS, application authorization, and integration payload checks shall prevent cross-organization reads and writes. | Confirmed decision |
| KROWDS-PRI-103 | Encryption | Personal data shall be encrypted in transit and at rest; Restricted fields shall use the approved additional protection design. Google-managed encryption is the MVP default; Restricted production data requires approved CMEK controls. | Confirmed baseline; key project evidence required |
| KROWDS-PRI-104 | Tokenization and minimization | Payment credentials, email secrets, QR values, and identity documents shall not be placed in logs or analytics. | Confirmed decision |
| KROWDS-PRI-105 | Access audit | Identity views, exports, role changes, deletion, provider events, and KREW-only break-glass actions shall be auditable. Break-glass requires MFA and remains time-bounded. | Confirmed decision |
| KROWDS-PRI-106 | Data minimization in analytics | BigQuery shall use approved aggregates or HMAC-SHA-256 pseudonymous keys with a dedicated rotatable key; raw personal-data joins are prohibited by default. | Confirmed baseline; re-identification test required |
| KROWDS-PRI-107 | Safe support | Support tools shall show only the minimum data, mask identifiers where possible, and create an auditable case. | Confirmed decision |
| KROWDS-PRI-108 | Provider minimization | Resend, Biteship, Xendit, and analytics payloads shall be reviewed against the data inventory before release. | Confirmed decision |
| KROWDS-PRI-109 | Cloud SQL authority | Cloud SQL is the authoritative personal-data store. Memorystore shall contain only rebuildable cache, rate-limit, lock, and coordination data and shall not become a personal-data system of record. | Confirmed decision |
| KROWDS-PRI-115 | Asynchronous processing | Cloud Tasks and Cloud Scheduler shall process only references or minimized data, use authenticated backend routes, and remain subject to deletion, replay, and audit controls. | Confirmed decision |
| KROWDS-PRI-116 | Credential storage | PostgreSQL shall store SHA-256 QR token hashes, not plaintext token values. Plaintext credential material is limited to the private production file and bounded operational memory. | Confirmed decision |
| KROWDS-PRI-117 | Cloud Run | The backend shall require authenticated invocation, and public browser traffic shall use the approved direct API origin and identity-forwarding design. | Confirmed decision; identity path TBD |
| KROWDS-PRI-118 | Telemetry | Cloud Logging, Error Reporting, and Monitoring shall exclude secrets and unnecessary PII, retain correlation references, and follow 30/90/365-day operational telemetry retention by environment; material audit/security records follow their canonical retention. | Confirmed baseline |
| KROWDS-PRI-119 | Online-only access | Gate and redemption data shall be evaluated by the live backend. The MVP shall not create offline grants, cached personal-data decisions, or a local access ledger that bypasses deletion or single-use state. | Confirmed decision |

## 12. Privacy incident handling

A suspected or confirmed privacy incident includes unauthorized access, disclosure, loss, misrouting, inappropriate export, credential exposure, provider disclosure, or a rights request that cannot be completed safely.

| ID | Requirement | State | Verification |
| --- | --- | --- | --- |
| KROWDS-PRI-110 | Security Operations shall open a privacy incident record when personal data may have been accessed or disclosed without authority and notify Privacy and Legal Counsel immediately through the approved contact path. | Confirmed decision; contact values TBD | Tabletop and alert test |
| KROWDS-PRI-111 | The incident team shall identify the data classes, people, systems, regions, recipients, time range, containment, evidence, and likely harm without copying unnecessary Restricted data into the incident ticket. | Confirmed decision | Evidence checklist |
| KROWDS-PRI-112 | Containment may include credential revocation, provider disablement, access suspension, Cloud Run/Cloud SQL containment, deletion of exposed exports, and notification hold. The incident commander shall record each decision. | Confirmed decision | Recovery exercise |
| KROWDS-PRI-113 | Whether and when to notify affected people, regulators, payment providers, or partners shall be decided by Privacy and Legal Counsel. The applicable deadline and approved wording are TBD pending Indonesian legal review. | TBD; legal gate | Legal decision record |
| KROWDS-PRI-114 | A post-incident privacy review shall document root cause, data affected, detection gap, corrective action, owner, due date, and proof that corrective actions were tested. | Confirmed decision | Postmortem evidence |

## 13. Open decisions and production gate

The legal and evidence gates in this section are mirrored from [OPEN-DECISIONS.md](../00-governance/OPEN-DECISIONS.md). A row is not closed by editing only this table; the central register and all affected documents must be updated together.

| ID | Open decision | State | Owner | Required before |
| --- | --- | --- | --- | --- |
| KROWDS-PRI-120 | Final legal bases and whether consent is required for each purpose | TBD pending legal | Privacy and Legal Counsel — personal name: TBD | Production collection |
| KROWDS-PRI-121 | Retention and deletion implementation for every canonical data class, including backups and provider copies; legal exceptions and statutory interpretation remain review items | Confirmed baseline; legal approval TBD | Privacy and Legal Counsel and Data Operations — personal names: TBD | Production launch |
| KROWDS-PRI-122 | Legal approval of the confirmed `asia-southeast2` target region, data residency, cross-border transfer mechanism, and provider regions | TBD pending legal | Privacy and Legal Counsel and Platform/SRE — personal names: TBD | Production data storage |
| KROWDS-PRI-123 | Under-18 verified guardian account, relationship declaration, explicit consent, and event-specific evidence rules | Confirmed product baseline; legal wording/evidence TBD | Product and Privacy and Legal Counsel — personal names: TBD | Visitor onboarding |
| KROWDS-PRI-124 | Approved privacy notice, consent language, marketing rules, and withdrawal experience | TBD pending legal | Privacy and Legal Counsel and Product — personal names: TBD | User release |
| KROWDS-PRI-125 | Rights-request identity proofing, 2-business-day acknowledgement, 30-calendar-day resolution target, appeal process, and complaint channel | Confirmed baseline; legal wording/evidence TBD | Privacy Operations — personal name: TBD | Production launch |
| KROWDS-PRI-126 | Controller/processor roles, data-processing agreements, and subprocessor list | TBD pending legal | Privacy and Legal Counsel and Partnerships — personal names: TBD | Provider onboarding |
| KROWDS-PRI-127 | Approved BigQuery analytics purpose, HMAC-SHA-256 pseudonymous key policy, and access group | Confirmed baseline; legal purpose/access approval TBD | Data Platform and Privacy and Legal Counsel — personal names: TBD | Analytics enablement |
| KROWDS-PRI-128 | Privacy incident notification deadlines, regulator contacts, and approved communication wording | TBD pending legal | Privacy and Legal Counsel — personal name: TBD | Incident readiness |
| KROWDS-PRI-129 | CMEK key project, hierarchy, rotation owner, and Restricted-data designation; Google-managed encryption remains the MVP default | TBD; security/legal evidence gate | Security Engineering and Privacy and Legal Counsel — personal names: TBD | Production data storage |
| KROWDS-PRI-130 | Approved support, fraud, and abuse data-access durations | TBD pending legal | Customer Operations and Privacy and Legal Counsel — personal names: TBD | Support launch |

No TBD duration, legal basis, transfer path, or age rule may be replaced with a guessed value. A temporary pilot requires a written exception with a risk assessment, compensating control, named role owner, expiry date, and review date.

## 14. Verification and evidence

Before production approval, KROWDS shall retain the following evidence:

- the Indonesia-first legal review record and data map;
- the approved legal-basis and consent register;
- the retention and deletion schedule with test results;
- notices, consent records, and withdrawal flows;
- provider agreements, data-processing terms, transfer assessment, and subprocessor list;
- a data-subject rights test using synthetic records;
- a cross-tenant authorization and Cloud SQL RLS test;
- a log and analytics scan proving that prohibited data is absent;
- a payment test proving that raw card data is not stored by KROWDS;
- a provider deletion and backup-aging test;
- a privacy incident tabletop with legal escalation; and
- a current list of role owners, with personal names still marked TBD where not assigned.

## 15. Related documents

- [KROWDS product vision](../01-product/PRODUCT-VISION.md)
- [KROWDS product baseline](../01-product/KROWDS.md)
- [Security requirements](SECURITY.md)
- [Integration requirements](../06-integrations/INTEGRATIONS.md)
- [Data model](../04-domain/DATA-MODEL.md)
- [Architecture](../03-architecture/ARCHITECTURE.md)
- [Deployment](../07-operations/DEPLOYMENT.md)
- [API contract](../04-domain/API-CONTRACT.md)
- [Open decisions and release gates](../00-governance/OPEN-DECISIONS.md)
- [Non-functional requirements](../02-requirements/NFR.md)
- [Risk register](RISK-REGISTER.md)
