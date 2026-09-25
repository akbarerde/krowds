# KROWDS-RUN-001 — Operations Runbook

## Metadata

| Field | Value |
| --- | --- |
| Document ID | `KROWDS-RUN-001` |
| Version | `0.1` |
| Status | `Draft` |
| System | KROWDS |
| Owner | SRE Lead (TBD) |
| Incident commander | Incident Management (TBD) |
| Platform owner | Platform Engineering (TBD) |
| Database owner | Data and Database Engineering (TBD) |
| Security owner | Security Engineering (TBD) |
| Privacy owner | Privacy and Legal Counsel (TBD) |
| Last updated | `2026-09-24` |

## 1. Purpose and operating boundary

This runbook gives on-call and release operators a safe procedure for responding to KROWDS availability, data, deployment, provider, security, and recovery events. It covers the five Next.js frontends, the single Go and Gin backend, and the target Google Cloud services in `asia-southeast2`.

The following boundaries apply during every procedure:

- Next.js is frontend-only. Do not add a route handler, Server Action, backend middleware rule, database client, queue client, or provider secret to `apps/*` or `packages/*` to work around an incident.
- Go and Gin at `services/cmd/server` remains the only backend process. Cloud Tasks and Cloud Scheduler invoke routes on the same backend artifact; they do not create independent business services.
- The MVP is phased, online-first, IDR-only, and single-use. Ticket transfer, re-entry, multi-use, offline gate access, and other deferred capabilities are not valid emergency substitutes.
- Xendit is authoritative for payment state, Resend for transactional email state, and Biteship for domestic shipping state. A browser redirect, local flag, or staff action is not provider evidence.
- Cloud SQL with forced organization-scoped RLS is the transactional source of truth. Memorystore is not a durable business record.
- If the approved identity, provider, privacy, or security path is not available, fail closed for the affected action and preserve the evidence.
- A `TBD` value is not permission to guess. Record the decision, owner, compensating control, expiry, and review date before production use.

## 2. Response priorities

Respond in this order:

1. Protect people, tenant boundaries, credentials, payment state, and personal data.
2. Stop unauthorized or unsafe behavior without destroying evidence.
3. Preserve the last known-good service and durable business state.
4. Restore the smallest safe capability, then expand service in a controlled way.
5. Reconcile provider state and queued work before declaring recovery.
6. Record the cause, evidence, decisions, residual risk, and follow-up owner.

Do not use a manual payment confirmation, offline access decision, broad database query, disabled authorization check, or copied production secret as a shortcut.

## 3. Access and prerequisites

### 3.1 Required access

An operator must have the minimum role needed for the procedure:

| Need | Required role or identity | Owner |
| --- | --- | --- |
| Incident coordination | Incident record access and named on-call role | Incident Management (TBD) |
| Cloud Run and logs | Environment-scoped operations role | Platform/SRE (TBD) |
| Cloud SQL | Read-only diagnosis first; write or restore only with Data and Database Engineering approval | Data and Database Engineering (TBD) |
| Memorystore | Read-only diagnosis and approved cache operations | Platform/SRE (TBD) |
| Cloud Tasks and Scheduler | Pause, resume, inspect, and execute only for the assigned incident | Platform/SRE (TBD) |
| Cloud Storage | Object metadata and approved object operations; no broad download | Data and Database Engineering (TBD) |
| BigQuery | Approved dataset access and query audit | Data Platform (TBD) |
| GitHub Actions | Protected environment approval for the target project | Release Manager (TBD) |
| Provider consoles | Resend, Xendit, Biteship, and Google OAuth/OIDC provider support or operations access | Provider owners (TBD) |
| Privacy or security escalation | Case-bound, time-limited, audited access | Security and Privacy (TBD) |

Shared accounts, shared passwords, and untracked break-glass access are prohibited. Break-glass follows `KROWDS-SEC-080` through `KROWDS-SEC-084`: incident ID, reason, scope, duration, two approvals, high-priority alert, full audit, and revocation after the task.

### 3.2 Safe command context

Set variables only after confirming the environment and project:

```bash
export KROWDS_ENV=staging
export KROWDS_PROJECT="krowds-${KROWDS_ENV}"
export KROWDS_REGION=asia-southeast2
gcloud config set project "$KROWDS_PROJECT"
```

Use `dev`, `staging`, or `prod` only. Do not run a production command until the incident commander or release owner confirms the project, region, account, and target service. Use redacted output in shared terminals and incident records.

## 4. Roles and severity

### 4.1 Response roles

| Role | Responsibility | Named owner |
| --- | --- | --- |
| Incident Commander | Declares severity, sets priorities, assigns roles, approves containment and recovery | Incident Management (TBD) |
| Operations Lead | Investigates Cloud Run, Cloud SQL, Memorystore, queues, storage, and recovery actions | Platform/SRE (TBD) |
| Communications Lead | Sends approved internal, customer, provider, and public status updates | Product and Customer Operations (TBD) |
| Scribe | Maintains the incident record, UTC timeline, decisions, and evidence links | Assigned on-call responder (TBD) |
| Database Lead | Protects data, controls migrations and restore, checks RLS and reconciliation | Data and Database Engineering (TBD) |
| Security Lead | Handles credential, tenant, access, and provider-security concerns | Security Engineering (TBD) |
| Privacy and Legal Lead | Determines personal-data impact, holds, notices, and legal escalation | Privacy and Legal Counsel (TBD) |
| Payments Lead | Owns Xendit state, refund, replay, and reconciliation decisions | Payments Engineering (TBD) |
| Notifications Lead | Owns Resend delivery, suppression, and OTP recovery operations | Notifications Engineering (TBD) |
| Fulfillment Lead | Owns Biteship labels, tracking, delivery, and reshipment decisions | Fulfillment Operations (TBD) |
| Product Owner | Confirms business impact and approves customer-facing behavior | Product Team (TBD) |

One person may hold more than one role during a small incident, but the Incident Commander and the person approving a high-risk data or break-glass action must be distinct when the policy requires two approvals.

### 4.2 Severity

| Severity | Use when | Examples | Response target |
| --- | --- | --- | --- |
| P1 | Credible active breach, payment or credential compromise, cross-tenant exposure, material control failure, or widespread loss of a critical customer journey | Unauthorized tenant data, forged access, payment state corruption, regional outage | Security Operations acknowledges within 15 minutes; containment begins within 30 minutes; updates every 30 minutes; workaround/restore target 4 hours |
| P2 | Significant but contained service, provider, privacy, or data event | One critical workflow degraded, sustained queue lag, failed payment provider path, unavailable document service | Acknowledge within 1 hour; containment within 4 hours; update within 1 business day; resolution target 2 business days |
| P3 | Lower-impact anomaly or operational defect with a safe workaround | Isolated frontend error, stale noncritical job, single failed export | Acknowledge within 1 business day; containment within 2 business days; resolution target 5 business days |

P1 and P2 notifications to affected people, regulators, providers, or partners are determined by Privacy and Legal Counsel. The targets above are operational targets, not legal deadlines.

## 5. Incident record procedure — `KROWDS-RUN-010`

An incident record is required for every declared production incident and for any P1 event in a lower environment. The incident record is the single operational timeline; do not split decisions across private chat.

### 5.1 Create the record

1. Assign an identifier in the approved incident system: `INC-YYYYMMDD-NNN`.
2. Record the title, severity, environment, project, region, start time, detection time, declaration time, and current status.
3. Assign Incident Commander, Operations Lead, Scribe, Communications Lead, and relevant specialist roles.
4. Link the alert, deployment, change, provider case, or security case that initiated the response.
5. State the first known impact in plain language. Do not paste request bodies, credentials, full identity data, raw card data, OTPs, or full QR payloads.
6. Record all timestamps in UTC. Display times in `Asia/Jakarta` only when communicating to people who need local context.

### 5.2 Required fields

| Field | Required content |
| --- | --- |
| Impact | Affected users, organizations, workflows, regions, data classes, and current business effect |
| Systems | Cloud Run revisions, Cloud SQL, Memorystore, Cloud Tasks, Cloud Scheduler, Cloud Storage, BigQuery, Secret Manager, and providers as relevant |
| Hypotheses | Current hypotheses, confidence, and evidence; distinguish fact from suspicion |
| Decisions | Containment, rollback, pause, restore, revoke, or communications decision with decision owner |
| Timeline | UTC event, action, result, and operator or workload identity |
| Evidence | Links to redacted logs, metrics, traces, revisions, audit events, provider references, and case IDs |
| Privacy and security | Possible personal-data exposure, credential exposure, legal hold, and required notifications |
| Recovery | Restored capability, verification checks, residual risk, and reconciliation status |
| Follow-up | Owner, due date, evidence required, and review date |

### 5.3 Update cadence and closure

- P1: update the record at least every 30 minutes and after every material decision.
- P2: update at least every 60 minutes and after every state change.
- P3: update at the end of each investigation branch and before handoff.
- Never mark an incident resolved because a single health check passes. Verify the user journey, provider reconciliation, queue state, and data integrity.
- Complete a post-incident review within five business days of service restoration unless the Incident Commander records a reason.

## 6. Universal response procedure

Use this sequence for every incident:

1. **Detect and declare.** Capture the alert, declare severity, open the incident record, and assign roles.
2. **Contain.** Stop the unsafe path, revoke access, pause optional work, or roll back only within approved scope.
3. **Preserve.** Save revision IDs, timestamps, redacted logs, metrics, audit events, provider event IDs, and configuration versions.
4. **Diagnose.** Compare frontend, backend, database, cache, queue, scheduler, storage, and provider signals. Change one hypothesis at a time when possible.
5. **Recover.** Restore the smallest safe capability, then verify critical journeys and asynchronous work.
6. **Reconcile.** Resolve pending payment, shipping, email, task, and scheduler records before declaring full recovery.
7. **Close and learn.** Record residual risk, customer communication, follow-up actions, owners, due dates, and review date.

## 7. Initial diagnosis commands

These commands are read-only unless stated otherwise. Replace the service and resource variables with values from the incident record.

```bash
gcloud run services list --project="$KROWDS_PROJECT" --region="$KROWDS_REGION"
gcloud run services describe krowds-services --project="$KROWDS_PROJECT" --region="$KROWDS_REGION"
gcloud sql instances list --project="$KROWDS_PROJECT"
gcloud sql operations list --project="$KROWDS_PROJECT" --instance=INSTANCE_NAME
gcloud redis instances list --project="$KROWDS_PROJECT" --region="$KROWDS_REGION"
gcloud tasks queues list --project="$KROWDS_PROJECT" --location="$KROWDS_REGION"
gcloud scheduler jobs list --project="$KROWDS_PROJECT" --location="$KROWDS_REGION"
```

For Cloud Run errors, start with a narrow time range and redact the output before sharing it:

```bash
gcloud logging read \
  'resource.type="cloud_run_revision"
   AND resource.labels.service_name="krowds-services"
   AND severity>=ERROR' \
  --project="$KROWDS_PROJECT" \
  --limit=200 \
  --freshness=1h
```

Use the service name, revision, request ID, provider event ID, task name, or audit event ID from the incident record to narrow the query. Do not use a broad export as the first diagnostic step.

## 8. Service procedures

### `KROWDS-RUN-020` — Frontend, load balancer, or TLS failure

**Symptoms:** one or more frontends return 5xx, blank pages, stale assets, failed redirects, certificate errors, or high browser latency.

1. Confirm whether the failure affects one frontend, all frontends, or only one route.
2. Check load-balancer health, DNS, managed certificate status, and the active Cloud Run revision for each affected service.
3. Compare revision start time, traffic percentage, and browser error rate with the most recent deployment.
4. Check Cloud Error Reporting and structured logs for the revision. Do not infer a backend defect from a frontend bundle error alone.
5. If the failure follows a release, shift only the affected frontend service to the last known-good revision. Do not alter payment, ticket, wristband, or access state as a frontend workaround.
6. If the certificate or DNS is invalid, stop automated retries that could widen the impact and escalate to Platform Engineering and the domain owner.
7. Verify the public entry page, authentication redirect, one authenticated read path, static assets, and the PWA shell where applicable.
8. If the PWA service worker is serving an unsafe cached business response, deploy a reviewed correction or cache invalidation. The shell may be available offline, but business decisions MUST remain online and server-authoritative.
9. Record the revision, traffic change, customer impact, and remaining browser-cache risk.

### `KROWDS-RUN-021` — Backend unavailable, elevated errors, or latency

**Symptoms:** `krowds-services` readiness fails, 5xx or latency rises, requests time out, or Cloud Run instances repeatedly restart.

1. Check the active revision, traffic split, instance count, and liveness and readiness responses through an approved operations identity.
2. Check the revision's first error time against deployment, migration, configuration, and provider events.
3. Correlate by request ID and inspect database, Memorystore, Cloud Tasks, Cloud Storage, and provider dependency signals.
4. If the failure follows a release, follow `KROWDS-RUN-034`. Do not repeatedly restart instances while a bad revision remains in the traffic path.
5. If load is the cause, increase concurrency or instances only within the Terraform and Cloud SQL connection budget. Do not remove maximum-instance protection to clear an alert.
6. If a dependency is unavailable, apply the dependency-specific procedure and fail closed for payment, identity, and access operations.
7. Verify `/`, `/health/live`, and `/health/ready` through the approved path, then run an authenticated read and one safe write in a non-production account.
8. Watch error rate, latency, database connections, and queue age for the agreed observation period before declaring recovery.

### `KROWDS-RUN-022` — Cloud SQL outage, saturation, or failed failover

**Symptoms:** connection refusals, timeouts, high CPU, storage pressure, replication lag, lock waits, failed operations, or failed failover.

1. Declare the incident and identify whether the problem is connectivity, database availability, query load, lock contention, storage, or a migration.
2. Stop or pause nonessential Cloud Tasks dispatch and Cloud Scheduler jobs before they amplify load. Record every paused job.
3. Check Cloud Run connection pools, active queries, database CPU, storage, replication, lock waits, and recent operations.
4. Reduce backend concurrency or maximum instances only through the approved capacity change if connection pressure is caused by autoscaling.
5. Do not run a migration, bulk repair, unrestricted query, or table rewrite during an availability incident without Database Lead approval.
6. If the regional high-availability primary is eligible for failover, the Database Lead approves and executes the documented Cloud SQL failover. Do not issue a second concurrent failover.
7. If failover or service restoration is insufficient, move to `KROWDS-RUN-040` for an isolated restore. Never overwrite the original instance during diagnosis.
8. After recovery, verify migration version, RLS, audit integrity, tenant isolation, connection budget, and representative read and write paths.
9. Resume paused queues and schedules one at a time, observing age and database load.

### `KROWDS-RUN-023` — Suspected cross-tenant or RLS exposure

**Symptoms:** a request returns another organization's data, an RLS denial spike appears, a query runs without tenant context, or a support report indicates cross-organization visibility.

1. Declare P1 when unauthorized disclosure is credible. Stop the affected endpoint or disable the implicated revision if containment is safer than continued operation.
2. Preserve application logs, database audit events, RLS-denial metrics, request IDs, revision IDs, and access logs before changing evidence.
3. Identify the authenticated actor, organization context, query, database role, policy version, and affected data classes. Do not query all organizations to investigate.
4. Revoke or suspend the implicated credential, session, provider key, or operator access when exposure is possible. Use the security procedure for suspected compromise.
5. Do not disable RLS, grant `BYPASSRLS`, make the runtime role the table owner, or add a browser-supplied tenant bypass as a fix.
6. Correct the application tenant-context derivation or database policy in a reviewed change. Add a negative test for the exact path.
7. Restore service only after cross-organization read and write attempts fail closed for the changed path.
8. Have Privacy and Legal Counsel assess affected people, data, recipients, holds, and notification duties. Keep the incident record free of unnecessary Restricted data.

### `KROWDS-RUN-024` — Memorystore outage or eviction pressure

**Symptoms:** cache connection errors, high latency, evictions, failover event, or idempotency and rate-limit coordination failures.

1. Confirm whether Cloud SQL and the backend remain healthy. Memorystore MUST NOT be treated as a business source of truth.
2. Inspect memory usage, evictions, CPU, connections, latency, and recent failover events.
3. Verify the approved cache-aside behavior: reads may use PostgreSQL or another safe fallback, while payment, identity, tenant, and access writes fail closed when authoritative state is uncertain.
4. Do not move durable state, idempotency outcomes, payment state, or access state into Redis to bypass the outage.
5. After service returns, rebuild cache keys through the approved cache-aside or warm-up process. Verify that stale or revoked wristband and entitlement data cannot be served from cache.
6. Run a concurrency test for single-use redemption and access. A cache outage must never make a credential valid twice.
7. Record whether the outage delayed tasks, rate limits, or user journeys and open a follow-up for capacity or fallback behavior.

### `KROWDS-RUN-025` — Cloud Tasks backlog, failure, or replay

**Symptoms:** queue depth or oldest-task age grows, task attempts increase, enqueue errors occur, or a task repeatedly fails.

1. Identify the affected queue, workload, task age, attempt count, error signature, and downstream dependency.
2. Check the backend revision, Cloud Run concurrency, database load, Memorystore, provider status, IAM, and quota before increasing capacity.
3. Pause the affected queue if retries are amplifying an outage. Record the pause time and task range:

```bash
gcloud tasks queues pause QUEUE_NAME \
  --project="$KROWDS_PROJECT" \
  --location="$KROWDS_REGION"
```

4. Inspect a small, redacted set of task metadata. Do not paste full task payloads containing personal data into the incident record.
5. Fix the handler, provider, configuration, or authorization issue through the normal release process. Do not edit task payloads in an unreviewed console.
6. For a permanent failure, move the item to the approved operator-review or dead-letter state. Record its identifier, reason, owner, and replay decision.
7. Replay only through an authorized, idempotent procedure. A repeated task must not issue a second ticket, activate a second wristband, send an unsafe duplicate notification, refund twice, or grant access twice.
8. Resume the queue gradually and watch oldest-task age, failure rate, database load, and provider reconciliation:

```bash
gcloud tasks queues resume QUEUE_NAME \
  --project="$KROWDS_PROJECT" \
  --location="$KROWDS_REGION"
```

### `KROWDS-RUN-026` — Cloud Scheduler miss or overlap

**Symptoms:** an expected expiry, cleanup, reconciliation, or export job did not run, ran twice, or overlapped.

1. List job execution history and compare the approved `Asia/Jakarta` schedule, UTC execution time, actual attempt, response, service revision, and durable execution record.
2. Check Scheduler timezone, IAM, API enablement, Cloud Run authentication, the backend route, database availability, and queue health.
3. Do not click retry until the durable execution key and active-run state are checked. A manual retry is valid only when the use case is idempotent and no equivalent run is active.
4. If the job is safe to run manually, invoke the same authenticated route through the approved operator identity and record the reason.
5. If a job overlapped, pause the schedule, identify the lock or execution record, and resolve the duplicate safely before resuming.
6. Verify the business result and not only the HTTP success code. Reconciliation jobs must compare provider references and create cases for mismatches.

### `KROWDS-RUN-027` — Cloud Storage outage or access failure

**Symptoms:** uploads, downloads, artwork, legal-document, production CSV, export, or signed-URL operations fail.

1. Identify the bucket, object class, operation, request ID, caller, and intended purpose. Do not accept a caller-supplied arbitrary bucket as authority.
2. Check bucket existence, uniform bucket-level access, public-access prevention, IAM, object lifecycle state, retention hold, and backend service-account access.
3. Confirm that an outage does not cause a payment, ticket, wristband, or access decision to succeed without its required object or provider state.
4. Do not place files in a personal drive, public bucket, lower environment, or unapproved Cloud Storage path.
5. For a missing object, determine whether the object is recoverable through versioning, backup, or a new authorized generation. Do not recreate a production CSV with guessed identifiers or tokens.
6. Reissue a short-lived signed URL only after authorization and access logging. The default maximum expiry is 15 minutes unless Security and the business owner approve an exception.
7. Record actor, organization, object ID, purpose, outcome, and evidence. Never record a download URL or file content in ordinary logs.
8. After recovery, verify private access, lifecycle behavior, and audit events.

### `KROWDS-RUN-028` — BigQuery analytics failure or excessive access

**Symptoms:** analytics ingestion or queries fail, a restricted query appears, or a dashboard shows unexpected data volume.

1. Determine whether the issue affects analytics only or any transactional workflow. Core payment and access operations MUST NOT be made dependent on an unapproved BigQuery write.
2. Identify the dataset, authorized view, principal, job ID, query text, bytes scanned, and approved purpose. Do not run an unrestricted query to diagnose a permission problem.
3. Suspend or revoke the implicated access through the approved IAM process if unauthorized access is credible. Preserve query audit evidence.
4. Keep raw identity, payment, OTP, secret, and full QR data out of the dataset. Use approved aggregates or protected pseudonymous keys.
5. Buffer or drop only noncritical analytics according to the approved policy. Do not silently discard audit events required for an active investigation or legal hold.
6. Verify dataset lifecycle, expiration, access groups, and query logs after recovery.

### `KROWDS-RUN-029` — Provider outage or unexpected provider state

Xendit, Resend, Biteship, and the Google OAuth/OIDC provider are external trust boundaries. For a provider incident:

1. Preserve the provider request ID, event ID, internal transaction or message reference, timestamp, retry count, and redacted response class.
2. Keep the affected operation in its safe pending or blocked state. Never infer provider success from a browser redirect, local callback, email open, courier page, or staff action.
3. Use the provider-specific procedure below and the reconciliation job after service returns.
4. Do not retry a non-idempotent operation without a stable idempotency key.
5. Alert the provider owner and Security when authentication, signature, replay, account, or data-transfer behavior is implicated.
6. Record whether the event was late, duplicate, out of order, mismatched, expired, or unverifiable.

### `KROWDS-RUN-030` — Secret, key, or credential exposure

**Symptoms:** a secret appears in a log, image, pull request, terminal, support note, browser bundle, provider error, or unauthorized access path.

1. Declare P1 when production credentials, signing keys, database credentials, webhook secrets, or tokens may be exposed. Stop the affected integration or workload if continued operation increases harm.
2. Preserve the exposure location, time range, affected identity, versions, logs, and access evidence. Do not copy the secret into the incident record.
3. Revoke or rotate the exposed credential at the provider or Google Cloud boundary first. Follow the provider's overlap procedure when a zero-downtime rotation is required.
4. Update Secret Manager and workload references through the approved change path. Do not place the replacement in GitHub repository secrets, Terraform variables, an image, or a frontend build.
5. Invalidate affected sessions or refresh credentials when the exposure includes authentication material.
6. Review Cloud Run, Cloud SQL, Secret Manager, Cloud Storage, BigQuery, GitHub, and provider access logs for misuse.
7. Ask Security and Privacy to assess data access, notification, legal hold, and provider coordination. A secret rotation alone does not close a potential data incident.
8. Revoke the old version after the overlap window and record evidence that it is no longer accepted.

### `KROWDS-RUN-031` — Xendit payment or webhook failure

**Symptoms:** payment creation fails, webhook signature verification fails, a payment is delayed, a transaction is mismatched, or ticket and wristband activation does not occur.

1. Keep the transaction `Pending` or the approved safe state. Do not issue a paid ticket, activate a wristband, or record a staff override as a substitute for verified Xendit evidence.
2. Verify the provider endpoint, signature or token mechanism, timestamp or replay window, event ID, internal transaction ID, amount, currency, and organization scope. Exact verification version is owned by Payments Engineering (TBD).
3. Confirm the event was durably recorded in the webhook inbox before acknowledging it. Duplicate event IDs and duplicate logical transactions must be no-ops.
4. If a signature is invalid, stale, replayed, or mismatched, reject normal activation, record redacted evidence, and create a reconciliation case.
5. If the event is valid but late, process it through the explicit state machine and reconcile against the provider reference.
6. For refunds, preserve the original reference, actor, reason, approver, amount, and result. A refund does not reactivate a revoked entitlement unless an approved rule says so.
7. After recovery, compare KROWDS and Xendit state, then verify that no duplicate ticket, wristband, refund, or access entitlement was created.
8. Record provider case, event IDs, state transitions, and reconciliation result without exposing payment credentials.

### `KROWDS-RUN-032` — Resend email, OTP, or delivery-status failure

**Symptoms:** email send fails, OTP is not delivered, delivery status is delayed, bounce or complaint volume rises, or a security message is suppressed.

1. Keep OTP and notification state safe. A send attempt, provider acceptance, or email open does not verify an account, payment, ticket, or identity.
2. Check Resend domain, SPF, DKIM, DMARC, sender reputation, API throttling, message category, and the bounded retry record. Do not print the API key or OTP.
3. For a hard bounce or complaint, apply suppression and the approved recovery route. Do not repeatedly send to a suppressed destination.
4. For a transient failure, allow only the approved bounded retry or queue path. Do not create an unlimited new request loop.
5. If OTP delivery is unavailable, do not mark the destination verified and do not bypass the check. Offer only the approved fallback, if one exists.
6. After recovery, reconcile message IDs, delivery status, suppression state, and the user-visible action. Do not send unrelated identity, payment, ticket, or access data in a message.
7. Notify Security and Privacy if a security message was suppressed, misdelivered, or exposed.

### `KROWDS-RUN-033` — Biteship shipment or delivery failure

**Symptoms:** label creation fails, a duplicate label appears, tracking stops, delivery webhook is invalid, or a shipment is returned.

1. Keep the fulfillment order pending or operationally blocked. Never mark an order delivered from a courier page guess, staff action, or a delayed webhook.
2. Check the approved domestic-only address, organization-paid account, no-COD setting, shipment idempotency key, provider request ID, and matching order reference.
3. Reject any cash-on-delivery option and create an operations case if a provider response indicates COD.
4. Verify the provider authenticity mechanism, event ID, shipment ID, status sequence, and order match. Invalid or replayed events do not change state.
5. Retry label creation only with the same stable idempotency key and bounded policy. A timeout must not create a duplicate label or charge.
6. After recovery, reconcile labels, tracking, delivery events, and the KROWDS shipment state. Escalate lost, returned, wrong-address, or reshipment cases to Fulfillment Operations.
7. Do not send identity documents, ticket-holder identity numbers, bank information, payment credentials, full QR payloads, or entitlements to Biteship.

### `KROWDS-RUN-034` — Bad deployment or application rollback

**Symptoms:** a new revision increases 5xx, latency, authorization failures, RLS violations, provider errors, or data integrity risk.

1. Stop further traffic shifts and identify the failing and last known-good revisions by immutable digest.
2. Determine whether a migration preceded the release and whether the previous revision remains schema-compatible.
3. If the failure is isolated to a frontend, roll back that frontend. If backend behavior is unsafe, shift backend traffic only after checking database and provider state.
4. A schema migration is not automatically reversible. Prefer a forward fix or an approved data procedure when a destructive or incompatible change has run.
5. Do not delete the failed revision, migration record, logs, or provider evidence until the incident record and review are complete.
6. Run the applicable checks in `KROWDS-DEP-141` through `KROWDS-DEP-149`.
7. Reconcile Cloud Tasks, Scheduler, Xendit, Resend, and Biteship work after rollback. A queue can contain messages produced by either revision.
8. Record the rollback decision owner, revision names, time, schema state, user impact, and residual risk.

### `KROWDS-RUN-035` — PWA offline behavior or IDR-only safety event

**Symptoms:** an installed PWA shows stale business data, a cached response is mistaken for a current ticket or wristband state, or staff attempt offline gate access.

1. Treat the PWA shell as presentation only. It MUST NOT authorize payment, ticket issuance, wristband activation, redemption, or access.
2. If cached data can be mistaken for current state, deploy a reviewed frontend correction or cache invalidation. Do not edit the service-worker policy ad hoc on a user's device.
3. For a gate or redemption device, keep the operation online. If the API or Cloud SQL is unavailable, deny access or show a safe unavailable state; never grant an offline single-use entitlement.
4. Verify that a repeated or concurrent scan resolves to one atomic state transition. A cached response must not bypass the server state and RLS.
5. Check ticket, wristband, entitlement, and access logs for duplicate decisions. Disable a credential through the approved backend path if compromise is suspected.
6. Record the affected PWA version, cached asset or response, device or organization scope, and correction. Do not put full QR payloads in the record.

### `KROWDS-RUN-036` — Regional Google Cloud disruption

**Symptoms:** Cloud Run, Cloud SQL, Memorystore, Cloud Storage, Secret Manager, Cloud Tasks, Scheduler, Logging, or another required `asia-southeast2` service is unavailable or degraded across the environment.

1. Declare P1 for a material customer or control impact and notify Platform/SRE, Data and Database Engineering, Security, and Product.
2. Confirm the Google Cloud service health and distinguish a KROWDS release fault from a regional dependency failure.
3. Stop nonessential deployments, migrations, bulk exports, and schedules. Preserve the last known-good application and data state.
4. Do not switch to another project, copy production data to development or staging, or improvise a cross-region cutover. The current target is single-region and cross-region recovery is an open decision.
5. If an approved disaster-recovery or rebuild plan exists, execute it under the Incident Commander. Otherwise maintain a safe denied state for payment, identity, access, and destructive operations while communications proceed.
6. Track elapsed time against the approved 4-hour RTO under `KROWDS-SEC-093`; escalate before the target is at risk.
7. After regional service returns, verify database PITR and replication, RLS, secret access, queue age, Scheduler history, object access, BigQuery access, and provider reconciliation before resuming writes.
8. Record the regional dependency, provider evidence, recovery time, and any data or notification impact.

### `KROWDS-RUN-037` — Security or privacy incident

**Symptoms:** unauthorized access, credential exposure, cross-tenant data, unexpected export, misrouted provider data, lost QR credential, or a privacy complaint that may indicate disclosure.

1. Declare P1 for credible active breach, payment or credential compromise, cross-tenant exposure, or material control failure. Notify Security and Privacy immediately through the approved contact path.
2. Preserve logs, traces, provider messages, database evidence, access records, object metadata, and version information. Do not alter or delete evidence unless containment requires it.
3. Contain by revoking credentials, suspending access, isolating a workload, blocking an export, disabling a provider integration, or stopping a release. Record each decision.
4. Identify data classes, people, organizations, systems, regions, recipients, time range, and likely harm without copying unnecessary Restricted data into the incident record.
5. Keep payment state, identity verification, single-use access, and tenant RLS fail closed while scope is unknown. Do not bypass provider or authorization checks to restore volume.
6. Privacy and Legal Counsel determine notification, regulatory, provider, data-subject, and legal-hold actions. No responder invents a legal deadline or wording.
7. Recover only after the security owner confirms credential revocation, access review, audit evidence, and corrective tests.
8. Complete the review within five business days unless the Incident Commander records a reason, including root cause, affected data, detection gap, control changes, owners, and due dates.

## 9. Backup and restore procedure — `KROWDS-RUN-040`

### 9.1 Backup checks

- Terraform enables and monitors Cloud SQL automated backups and point-in-time recovery in each environment.
- Automated backup retention is 7 days for development, 14 days for staging, and 35 days for production. Log retention is 30/90/365 days for development/staging/production; legal holds may extend it.
- Primary transactional-store RPO is 15 minutes and RTO is 4 hours, with quarterly restore drills and evidence.
- A failed or overdue backup is an operational incident. Do not assume the console's last successful display is sufficient evidence.
- Production restore drills run at least quarterly with synthetic or irreversibly masked data.
- Memorystore is rebuilt from PostgreSQL and configuration. Cloud Storage versioning, BigQuery lifecycle, Secret Manager version retention, and log retention are reviewed separately.
- Restores must preserve RLS, audit integrity, deletion and legal-hold decisions, and provider reconciliation.

### 9.2 Restore decision

The Database Lead and Incident Commander decide whether to use point-in-time recovery, an export, or a new instance. Record the selected recovery point, reason, expected data loss, legal-hold impact, and approval before starting.

Never restore over the active production instance as the first recovery action.

### 9.3 Isolated restore

1. Freeze destructive writes and pause nonessential queues and schedules if the incident requires it.
2. Select a recovery point from Cloud SQL point-in-time recovery or an approved protected export.
3. Create a new isolated Cloud SQL instance in the same project and `asia-southeast2`, with private connectivity and a name that cannot be confused with production.
4. Use a dedicated restore identity. Do not grant the runtime or operator role broader access than the restore requires.
5. For an approved SQL export, use protected Cloud Storage and the environment's approved database tooling. An example shape is:

```bash
gcloud sql export sql SOURCE_INSTANCE \
  "gs://APPROVED_BUCKET/path/database.sql" \
  --database=DATABASE_NAME \
  --project="$KROWDS_PROJECT"

gcloud sql import sql RESTORE_INSTANCE \
  "gs://APPROVED_BUCKET/path/database.sql" \
  --database=DATABASE_NAME \
  --project="$KROWDS_PROJECT"
```

The exact export, import, encryption, and access procedure must be approved by Data and Database Engineering and Privacy. Do not use these commands with production personal data until the legal gate and bucket controls are complete.

6. Restore the schema and migration version, then verify the expected release can start against the restored database.
7. Verify `organization_id` coverage, forced RLS, runtime role restrictions, unique constraints, audit records, and representative row counts without copying unnecessary personal data.
8. Reconcile provider references for Xendit payments, Resend message status, and Biteship shipments. Do not resume financial or access state from an unverified guess.
9. Run backend and frontend smoke checks against the isolated instance with traffic held away from production.
10. If the restore is accepted, cut over through a reviewed configuration or Terraform change and a new Cloud Run revision. Preserve the old instance and evidence until the Incident Commander closes the recovery.
11. Resume one queue and one schedule at a time, then monitor oldest age, database load, provider reconciliation, and user impact.
12. Destroy or retain the old instance only after the approved retention and evidence decision.

## 10. Rollback and forward-repair rules

| Situation | Preferred action | Prohibited shortcut |
| --- | --- | --- |
| Frontend regression | Route the affected frontend to the previous digest | Roll back the database because a browser page failed |
| Backend regression with compatible schema | Route `krowds-services` to the previous digest | Run an unreviewed down migration |
| Expand migration | Deploy corrective code or complete the expand step | Remove a column still used by active revisions |
| Contract migration failure | Pause and forward-repair or restore under Database Lead approval | Assume a prior binary can read the new schema |
| Provider outage | Keep state pending and reconcile | Mark payment, delivery, or email successful manually |
| Data corruption | Isolate, preserve, restore, and reconcile | Overwrite the only production copy during diagnosis |
| Secret exposure | Revoke, rotate, investigate, and redeploy | Print, copy, or test the secret in a shared terminal |
| Cross-tenant access | Stop path, preserve evidence, fix context or RLS, retest | Disable RLS or grant a global browser scope |

## 11. Observability and alert handling

### 11.1 Required dashboard groups

| Dashboard | Minimum signals | Alert examples |
| --- | --- | --- |
| Frontend | 5xx, latency, traffic, revision, browser errors, certificate and DNS state | Burn-rate breach, revision error spike, failed certificate |
| Backend | request rate, 5xx, latency, concurrency, instance restarts, auth and RLS denials | Readiness failure, error budget burn, abnormal denial rate |
| Database | CPU, storage, connections, locks, replication, slow queries, backup and PITR state | Connection saturation, failed operation, replication lag, backup failure |
| Memorystore | CPU, memory, evictions, latency, connections, failover | Eviction storm, failover, latency threshold |
| Async | queue depth, oldest age, attempts, failures, Scheduler runs and overlap | Backlog age, repeated failure, missed run |
| Storage and secrets | object errors, unexpected bulk access, lifecycle, secret access and rotation | Public exposure, access denial spike, rotation due |
| Providers | Xendit, Resend, Biteship, Google OAuth/OIDC provider latency, verification, retry and reconciliation | Signature failure spike, payment mismatch, bounce or delivery backlog |
| Analytics | BigQuery denied queries, bytes scanned, restricted joins, ingestion failures | Abnormal query volume, restricted export, unexpected data flow |

Alerts MUST identify the environment, service, revision, request or event ID, owner, and runbook procedure. Use the approved starting thresholds in `KROWDS-NFR-050`; named destinations and final roster evidence remain release gates.

### 11.2 Log and evidence handling

- Structured logs use UTC and include request ID, environment, service, revision, actor or workload identity, organization scope when authorized, outcome, and reason code.
- Do not log passwords, OTPs, bearer tokens, webhook secrets, raw card data, full QR payloads, full identity numbers, or unnecessary request bodies.
- Use BigQuery or an approved evidence store for longer investigation records. Do not copy production data into a spreadsheet or lower environment.
- Error Reporting is a signal, not an incident record. Preserve the related request and deployment evidence before the error group ages out.

## 12. Communications and escalation

The Communications Lead uses only approved language and records each message in the incident record.

- Internal: state severity, affected environment, current containment, next decision time, owners, and safe customer impact.
- Customer or organization: state what workflow is affected, what data or action is required, what is not yet known, and the next update time. Do not expose another organization's data or internal security details.
- Provider: include only the minimum correlation data and verified contact path.
- Privacy or legal: include data classes, possible recipients, time range, containment, and evidence links; let counsel decide notices.
- Public status: do not publish provider secrets, exploit details, unverified root cause, or personal data.

Escalate immediately for any credible cross-tenant exposure, payment manipulation, credential leak, lost or exposed production QR file, provider signature bypass, destructive database action, or inability to meet a proposed recovery target.

## 13. Scheduled operational work

| ID | Activity | Cadence | Owner | Required evidence |
| --- | --- | --- | --- | --- |
| KROWDS-RUN-050 | Review Cloud Run, database, cache, queue, storage, and provider alerts | Each on-call shift | SRE (TBD) | Alert review note and open incidents |
| KROWDS-RUN-051 | Verify backup and point-in-time recovery status | Daily for production; after material database change | Data and Database Engineering (TBD) | Backup status and exception record |
| KROWDS-RUN-052 | Review provider reconciliation and failed webhooks | Daily for production | Payments, Notifications, Fulfillment (TBD) | Case counts, oldest age, unresolved owners |
| KROWDS-RUN-053 | Review IAM, secret access, and service-account drift | Weekly and before production release | Security Engineering (TBD) | Access diff and approved exceptions |
| KROWDS-RUN-054 | Restore exercise using synthetic or irreversibly masked data | At least quarterly | Platform/SRE and Data and Database Engineering (TBD) | Restore result, RPO/RTO evidence, defects |
| KROWDS-RUN-055 | Break-glass exercise | At least quarterly in non-production | Security and Platform/SRE (TBD) | Approval, scope, expiry, audit, revocation |
| KROWDS-RUN-056 | Incident and provider-outage exercise | At least twice yearly | Incident Management and SRE (TBD) | Participant roles, timeline, corrective actions |
| KROWDS-RUN-057 | Terraform drift and capacity review | Before each production release and monthly | Platform/SRE (TBD) | Plan, load evidence, approved limits |

## 14. Post-incident review

Complete the review within five business days of service restoration unless the Incident Commander records a reason.

The review MUST include:

- incident identifier, severity, duration, detection, declaration, containment, recovery, and closure times in UTC;
- affected users, organizations, data classes, systems, providers, and regions;
- timeline, hypotheses, evidence, and decisions;
- root cause and contributing conditions;
- why existing tests, alerts, RLS, idempotency, backups, or rollback controls did or did not prevent the event;
- payment, email, shipping, access, queue, and analytics reconciliation outcome;
- whether any credential or personal data was exposed and the legal or privacy decision;
- corrective actions with one accountable role, due date, verification method, and review date;
- residual risk and any temporary exception expiry.

Do not close an action merely because a code change merged. Link the production verification, test, or drill evidence.

## 15. Runbook readiness checklist

Before production approval, the responsible roles verify:

- [ ] Personal names and escalation contacts are assigned or the release remains blocked.
- [ ] P1 and P2 paging, communications, and provider contacts are tested.
- [ ] Incident record fields, UTC timeline, and Asia/Jakarta display are tested.
- [ ] Cloud Run rollback and no-traffic revision procedures are rehearsed.
- [ ] Cloud SQL failover, isolated restore, PITR, and RLS validation are rehearsed.
- [ ] Memorystore cache-loss behavior preserves payment, identity, and single-use access safety.
- [ ] Cloud Tasks pause, bounded retry, dead-letter review, and idempotent replay are rehearsed.
- [ ] Cloud Scheduler missed-run and overlap procedures are rehearsed.
- [ ] Cloud Storage private access, signed URL expiry, versioning, and audit are verified.
- [ ] BigQuery restricted query and analytics failure procedures are verified.
- [ ] Secret exposure, rotation, and revocation are rehearsed.
- [ ] Xendit valid, invalid, duplicate, replayed, out-of-order, timeout, refund, and reconciliation tests pass.
- [ ] Resend send, OTP, bounce, complaint, suppression, and retry tests pass.
- [ ] Biteship domestic, no-COD, duplicate-label, tracking, and webhook tests pass.
- [ ] Cross-organization read and write tests fail closed at application and RLS layers.
- [ ] PWA offline behavior does not grant payment, ticket, wristband, or gate authority.
- [ ] Quarterly restore and twice-yearly incident exercise dates are scheduled.
- [ ] RPO 15 minutes, RTO 4 hours, backup/log retention, and the post-MVP cross-region decision have role owners and evidence.

## 16. Open operational decisions

Operational gates are mirrored in [OPEN-DECISIONS.md](../00-governance/OPEN-DECISIONS.md). A local or staging exercise may proceed, but production readiness remains blocked until the evidence is recorded.

| ID | Decision required | Owner | Required before |
| --- | --- | --- | --- |
| KROWDS-RUN-090 | SLOs, accepted starting alert thresholds, paging targets, and P1/P2/P3 response times; named destinations and evidence remain release gates | SRE Lead and Incident Management (TBD) | Production launch |
| KROWDS-RUN-091 | RPO 15 minutes, RTO 4 hours, backup/log retention, quarterly restore cadence, and post-MVP cross-region recovery scope | Platform/SRE and Data and Database Engineering (TBD) | Production approval |
| KROWDS-RUN-092 | Final Cloud Run, Cloud SQL, Memorystore, queue, and scheduler capacity | Platform/SRE and Data and Database Engineering (TBD) | Production launch |
| KROWDS-RUN-093 | Named incident, provider, security, privacy, and break-glass contact roster | Incident Management and Security Engineering (TBD) | Incident readiness |
| KROWDS-RUN-094 | Provider support cases, escalation channels, and reconciliation ownership | Payments, Notifications, Fulfillment (TBD) | Each provider production flow |
| KROWDS-RUN-095 | Evidence that the accepted IDR-only payment policy is implemented and covered in operational tests | Product Owner and Backend Engineering Lead (TBD) | Phase 4 release |
| KROWDS-RUN-096 | Privacy notification deadlines, wording, and regulatory contacts | Privacy and Legal Counsel (TBD) | Production personal-data flow |

## 17. Related documents

- [KROWDS-ARCH-001 — Target System Architecture](../03-architecture/ARCHITECTURE.md)
- [KROWDS-DEP-DOC-001 — Deployment Guide](DEPLOYMENT.md)
- [KROWDS-PV-001 — Product Vision](../01-product/PRODUCT-VISION.md)
- [KROWDS-SECURITY-001 — Security Requirements](../05-security/SECURITY.md)
- [KROWDS-PRIVACY-001 — Privacy Requirements](../05-security/PRIVACY.md)
- [KROWDS-INTEGRATIONS-001 — External Integrations](../06-integrations/INTEGRATIONS.md)
- [API contract](../04-domain/API-CONTRACT.md)
- [Data model](../04-domain/DATA-MODEL.md)
- [Test plan](../02-requirements/TEST-PLAN.md)
- [Risk register](../05-security/RISK-REGISTER.md)
- [Open decisions and release gates](../00-governance/OPEN-DECISIONS.md)
