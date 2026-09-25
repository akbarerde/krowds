# KROWDS-DEP-DOC-001 — Deployment Guide

## Metadata

| Field | Value |
| --- | --- |
| Document ID | `KROWDS-DEP-DOC-001` |
| Version | `0.1` |
| Status | `Draft` |
| System | KROWDS |
| Owner | Platform Engineering (TBD) |
| Approver | Release Manager (TBD) |
| Operators | SRE and Release Engineering (TBD) |
| Database owner | Data and Database Engineering (TBD) |
| Security owner | Security Engineering (TBD) |
| Last updated | `2026-09-24` |

## 1. Purpose

This document defines how KROWDS is built, promoted, configured, migrated, deployed, verified, and rolled back across `krowds-dev`, `krowds-staging`, and `krowds-prod` in Google Cloud region `asia-southeast2`.

The Google Cloud topology, Terraform layout, image promotion, and production deploy workflow described here are target controls. They are not present in the repository at the date of this document and must be implemented without changing the frontend and backend boundary.

## 2. Deployment controls

| ID | Control | Owner |
| --- | --- | --- |
| KROWDS-DEP-010 | GitHub Actions MUST be the normal application deployment path. Production access MUST NOT depend on an individual's workstation. | Release Engineering (TBD) |
| KROWDS-DEP-011 | Terraform MUST own durable environment infrastructure. Application deployment jobs MUST NOT recreate databases, buckets, queues, or networking as an implicit side effect. | Platform Engineering (TBD) |
| KROWDS-DEP-012 | Every deployed image MUST be identified by an immutable digest and traceable to a Git commit. Mutable tags MUST NOT be the deployment identity. | Release Engineering (TBD) |
| KROWDS-DEP-013 | The same source commit and image digest MUST be promoted through development, staging, and production. Environment-specific values MUST be injected at runtime or through reviewed environment build inputs. | Release Engineering (TBD) |
| KROWDS-DEP-014 | Each environment MUST use a separate Google Cloud project, service identities, secrets, data stores, buckets, queues, scheduler jobs, logs, and BigQuery datasets. | Platform Engineering (TBD) |
| KROWDS-DEP-015 | All regional runtime and data resources MUST use `asia-southeast2`. | Platform Engineering (TBD) |
| KROWDS-DEP-016 | Next.js applications MUST be deployed only as frontend Cloud Run services. Backend APIs, migrations, queues, and business workflows MUST run from the Go `services` artifact. | Backend Engineering (TBD) |
| KROWDS-DEP-017 | Production deployment MUST require a linked change, successful CI evidence, a migration assessment, a rollback point, and an assigned operations owner. | Release Manager (TBD) |
| KROWDS-DEP-018 | Production personal-data and payment deployment is blocked until the Indonesia-first privacy and legal review gate is approved for the data map, providers, purposes, retention, rights handling, and incident obligations. | Privacy and Legal Counsel (TBD) |
| KROWDS-DEP-019 | Every tenant-owned table MUST use `organization_id` and forced PostgreSQL RLS. The runtime role MUST NOT own tenant tables or have `BYPASSRLS`; migration and break-glass roles MUST be separate. | Backend and Database Engineering (TBD) |
| KROWDS-DEP-020 | Xendit, Resend, and Biteship integrations MUST remain behind the Go backend and pass authenticated, idempotent, replay-resistant, auditable, timeout, retry, and reconciliation checks before production. | Platform Integration Engineering (TBD) |
| KROWDS-DEP-021 | Releases MUST preserve the phased, online-first, IDR-only, single-use MVP boundary. Offline PWA behavior MUST NOT grant payment, ticket, wristband, or gate authority. | Product Owner and Backend Engineering Lead (TBD) |

## 3. Environment model

| Environment | Project | Deployment trigger | Data | Release purpose | Required approval |
| --- | --- | --- | --- | --- | --- |
| Development | `krowds-dev` | Merge to the development integration branch or approved pull request | Synthetic or masked | Fast integration and dependency testing | Continuous Delivery Owner (TBD) |
| Staging | `krowds-staging` | Approved release candidate or manual promotion | Sanitized or synthetic production-like data | Production-topology rehearsal and release validation | Release Manager (TBD) |
| Production | `krowds-prod` | Protected release tag or approved manual promotion | Approved production data | Controlled customer release | Release Manager and Product Owner (TBD) |

The repository uses a protected `main` branch, `release/*` branches, annotated `v0.1.x` version tags, and GitHub Actions promotion by immutable image digest. Pull requests from untrusted forks MUST NOT receive deployment credentials or production secrets.

### 3.1 Isolation rules

- A deployment job for one project MUST NOT assume permission in another environment.
- Production secrets MUST NOT be copied into development or staging.
- Staging and development MUST use Xendit, Resend, Biteship, and Google OAuth/OIDC provider test or sandbox identities and credentials.
- Production personal data, provider credentials, and delivery or webhook secrets MUST NOT be copied into lower environments.
- A production incident MUST NOT be resolved by deploying to another environment.
- Cross-project promotion is limited to copying immutable artifacts and reviewed configuration values.

## 4. Deployment topology

Each project contains this deployment topology:

| Resource | Target name pattern | Notes |
| --- | --- | --- |
| Web Cloud Run | `krowds-web` | Public frontend through the project load balancer |
| Auth Cloud Run | `krowds-auth` | Public frontend through the project load balancer |
| Krew Cloud Run | `krowds-krew` | Public frontend through the project load balancer |
| Org Cloud Run | `krowds-org` | Public frontend through the project load balancer |
| PWA Cloud Run | `krowds-pwa` | Public frontend through the project load balancer |
| Backend Cloud Run | `krowds-services` | One image and one process model for all Go modules, provider adapters, tasks, and scheduler routes; authenticated invocation |
| Cloud SQL | `krowds-<environment>-postgres` | Private IP; regional high availability in production; shared-schema tenancy with forced RLS |
| Memorystore | `krowds-<environment>-redis` | Private connectivity; cache, rate limits, short-lived locks, and idempotency coordination |
| Artifact Registry | `krowds-containers` | One repository or reviewed naming scheme for six application images |
| Cloud Storage | `krowds-<environment>-documents`, `krowds-<environment>-production`, `krowds-<environment>-exports` | Separate private boundaries for legal documents, artwork, production CSVs, exports, and backup artifacts |
| Secret Manager | `krowds-<environment>-*` | Environment-specific database, session, signing, Xendit, Resend, Biteship, and Google OAuth/OIDC provider values |
| Cloud Tasks | `krowds-<environment>-<workload>` | Project-isolated queues for email, provider processing, exports, cleanup, and retries targeting `krowds-services` |
| Cloud Scheduler | `krowds-<environment>-<job>` | Authenticated calls to scheduler routes in `asia-southeast2` |
| BigQuery | `krowds_<environment>` | Environment-isolated analytics datasets |
| Terraform state | Project-specific remote backend | Encrypted, versioned, and access-restricted; never a shared workspace |

Custom hostnames and certificate ownership are TBD under `KROWDS-ARCH-094`. The resource names above are the required logical names; Terraform may use a documented environment prefix if names would otherwise collide. Cloud Run, Cloud SQL, Memorystore, Cloud Tasks, Cloud Scheduler, Cloud Storage, Secret Manager, and BigQuery data locations MUST use `asia-southeast2` where the Google Cloud service supports an explicit regional location. Global Google edge and logging controls remain project-scoped and MUST NOT export data to an unapproved region.

### 4.1 Network path

1. A public HTTPS hostname resolves to the environment's external load balancer or approved public API boundary.
2. Managed TLS terminates public TLS.
3. Frontend hostnames route to the five Next.js Cloud Run services through serverless NEGs.
4. The API hostname reaches `krowds-services` through the secure API gateway/identity-aware path approved under `KROWDS-INT-141`; browser requests use secure HttpOnly SameSite cookies and do not pass through a Next.js application.
5. Direct anonymous invocation of `krowds-services` is denied. Cloud Tasks, Cloud Scheduler, and approved internal workloads use short-lived workload identity.
6. `krowds-services` uses VPC egress and private connectivity to Cloud SQL and Memorystore.
7. Xendit, Resend, Biteship, and Google OAuth/OIDC provider use backend-only TLS connections or verified browser redirects under their approved provider contracts.
8. Xendit, Resend, and Biteship webhooks enter through the approved public provider-webhook boundary and route to dedicated backend endpoints. Edge routing does not replace backend signature, replay, body-size, or idempotency verification.
9. Cloud Storage, Secret Manager, and BigQuery use workload identity and least-privilege IAM.

Cloud SQL and Memorystore MUST NOT have public IP addresses. Database, cache, and object administration MUST require explicit privileged access. The public browser path is the approved secure-cookie API gateway/identity-aware path; direct anonymous backend invocation is denied.

## 5. Configuration model

### 5.1 Configuration classes

| Class | Examples | Source | Control |
| --- | --- | --- | --- |
| Public frontend configuration | Public API origin, public site origin, feature presentation values | Cloud Run runtime configuration or a runtime configuration response | Only non-sensitive values may be exposed to browsers |
| Backend runtime configuration | `APP_NAME`, `APP_VERSION`, `APP_ENV`, `GIN_MODE`, `LOG_LEVEL`, HTTP timeouts, CORS origins | Cloud Run environment and Terraform variables | Version-controlled schema; validated at startup |
| Connection identifiers | Cloud SQL host, database, port, Memorystore host | Terraform outputs and Cloud Run environment | Non-secret, project-specific, private endpoint |
| Secrets | Database password, session or token signing key, encryption references, Xendit, Resend, Biteship, and Google OAuth/OIDC provider credentials | Secret Manager | No repository, image, frontend bundle, CI log, incident record, or support export |
| Infrastructure policy | Region, machine classes, retention, service accounts, network controls | Terraform | Changed through reviewed code and apply workflow |
| Release identity | Git SHA, image digest, build time | GitHub Actions and image labels | Recorded in Cloud Run revision and release evidence |

### 5.2 Backend settings

For all managed Cloud Run environments, the current service contract requires:

| Setting | Managed value |
| --- | --- |
| `APP_NAME` | `krowds-services` |
| `APP_VERSION` | Git SHA or immutable release identifier |
| `APP_ENV` | `production` |
| `GIN_MODE` | `release` |
| `LOG_LEVEL` | `info` |
| `HTTP_HOST` | `0.0.0.0` |
| `HTTP_PORT` | `8080` |

`APP_ENV=production` applies to development and staging Cloud Run because the current service accepts `development`, `test`, or `production`. The project ID, labels, and deployment environment distinguish `krowds-dev` and `krowds-staging` from production at the platform level.

`CORS_ALLOWED_ORIGINS` MUST contain only the HTTPS origins for the five frontends in that project. `CORS_ALLOW_CREDENTIALS` MUST remain `true` only when the exact origin list is maintained; wildcard origins are prohibited with credentials.

Cloud Scheduler job definitions MUST set `Asia/Jakarta` explicitly for the approved business cadence. Execution timestamps, database values, logs, metrics, and incident records remain UTC.

### 5.3 Frontend API origin

The browser requires the public API origin. The target runtime configuration mechanism MUST provide an environment-specific API origin without rebuilding an environment-neutral image. The public value may be embedded only if images are built separately and promoted by source and verified artifact equivalence.

The configuration contract is owned by Frontend Engineering and must use `@krowds/api`. Environment-specific public configuration is produced as a reviewed non-secret artifact by Terraform/CI and consumed by the frontend; it MUST NOT add a Next.js route, Server Action, or middleware rule that performs backend authentication or business logic.

### 5.4 Secret handling

- GitHub Actions uses Workload Identity Federation to obtain short-lived Google Cloud credentials.
- Serving, background task, migration, operator, and provider-specific identities are separate and least privilege.
- Cloud Run services use service accounts with no downloadable service-account keys.
- Cloud Run secret references point to the current approved Secret Manager version.
- Secret values are never echoed, converted to Terraform variables, or written to release artifacts.
- Rotation MUST retain the previous version until the active and rollback revisions no longer require it.
- Production provider credentials are environment-specific; test and production webhook secrets MUST NOT overlap.
- Suspected disclosure follows `KROWDS-RUN-030` and starts a security incident record.

## 6. Terraform target

### 6.1 Layout

The target Terraform layout is:

```text
infra/
├── modules/
│   ├── project-baseline/
│   ├── network/
│   ├── cloud-run/
│   ├── cloud-sql/
│   ├── memorystore/
│   ├── async-workloads/
│   ├── storage-and-secrets/
│   └── observability/
└── environments/
    ├── dev/
    ├── staging/
    └── prod/
```

This path is a target implementation requirement. The directories and modules do not exist in the current repository.

### 6.2 State and access

- Each environment MUST use a separate remote backend and lock mechanism.
- State buckets MUST use uniform bucket-level access, versioning, retention, and encryption.
- Production state write access MUST be limited to the approved GitHub identity and break-glass administrators.
- State MUST NOT contain secret values. It may contain resource identifiers, public endpoints, and secret version names.
- Operators MUST NOT use one Terraform workspace to update multiple environments.
- Every apply MUST record the Git commit, Terraform version, lock-file version, plan object, approver, apply result, and resulting resource versions in the incident record or change record when the change is production-related.

### 6.3 Managed resources

Terraform MUST manage:

- APIs, projects, labels, quotas, and baseline IAM;
- VPC, private service access, load balancer, certificates, DNS records, and ingress policy;
- six Cloud Run service definitions and environment configuration slots;
- separate serving, background task, migration, operator, and CI workload identities;
- Cloud SQL, private connectivity, backups, point-in-time recovery, maintenance policy, runtime role without `BYPASSRLS`, and separate migration or break-glass roles;
- Memorystore, private connectivity, and selected capacity;
- Cloud Tasks queues, Cloud Scheduler jobs, and their least-privilege invoker identities;
- Cloud Storage buckets, IAM, lifecycle, retention, versioning, and uniform access;
- Secret Manager resources and version access without secret payloads in state;
- Cloud Logging sinks and retention, Monitoring dashboards and alert policies, and Error Reporting notification configuration;
- BigQuery datasets, service accounts, and approved scheduled queries;
- Artifact Registry repositories.

### 6.4 Plan and apply workflow

Development changes may be tested locally by Platform Engineering. Staging and production changes MUST use GitHub Actions and the following sequence:

```bash
terraform -chdir=infra/environments/<environment> init -backend-config=<environment-backend-config>
terraform -chdir=infra/environments/<environment> fmt -check -recursive
terraform -chdir=infra/environments/<environment> validate
terraform -chdir=infra/environments/<environment> plan -out=<saved-plan>
terraform -chdir=infra/environments/<environment> show -no-color <saved-plan>
```

The pipeline MUST upload the reviewed plan artifact, apply the same saved plan, capture output, and run `KROWDS-DEP-140` verification. Human approval occurs after reviewing the plan and before the apply job. Cloud Run image and traffic changes made by the authorized release workflow are expected release state; any other drift is unexplained and blocks promotion until reviewed.

Terraform rollback MUST use a reviewed corrective change. An operator MUST NOT run an ad hoc destroy or import against production to undo an application deployment.

## 7. GitHub Actions delivery

### 7.1 Existing validation baseline

The current `.github/workflows/ci.yml` runs on pushes and pull requests and executes:

```bash
pnpm install --frozen-lockfile
go mod tidy -diff
pnpm lint
pnpm typecheck
pnpm test
pnpm test:architecture
pnpm build
```

The deploy workflow MUST depend on an equivalent successful validation job. It MUST NOT bypass architecture tests for backend changes.

### 7.2 Target workflow stages

| Stage | Trigger | Required action |
| --- | --- | --- |
| Validate | Pull request and protected branch push | Install with the lockfile, lint, typecheck, test, architecture test, and build |
| Build | Successful validation | Build six images, scan them, create provenance, and record commit and digests |
| Development | Approved integration branch | Deploy exact digests to `krowds-dev`, run migrations, and execute smoke checks |
| Staging | Approved release candidate | Promote exact digests and configuration to `krowds-staging`, rehearse migrations, and collect evidence |
| Production | Protected tag or approved manual promotion | Require change approval, backup check, migration gate, production deploy, and extended observation |
| Evidence | Every deployment | Record revisions, migration result, checks, alerts, and rollback point in the change or incident record |

### 7.3 Authentication and permissions

- GitHub Actions uses an environment-scoped Workload Identity Federation pool.
- Workflow `id-token: write` permission is granted only to jobs that authenticate to Google Cloud.
- Pull request jobs do not receive write access to any environment.
- Development, staging, and production use separate GitHub environments and workload identities.
- Production jobs require protected environments and named approver roles.
- Deployment credentials expire with the job and are not stored as repository secrets.

### 7.4 Image build and promotion

1. Build one image for each frontend and one image for `krowds-services` from the same commit.
2. Use multi-stage builds and non-root runtime images.
3. Include the Git SHA in OCI labels and the backend `APP_VERSION` value.
4. Scan images and source dependencies with the approved security tooling.
5. Store images in the development Artifact Registry repository.
6. Promote by digest to the staging and production repositories without rebuilding.
7. Record the image digest in the GitHub deployment summary and the production change record.
8. Retain the previous two known-good production digests until the release retention decision is complete.

The current root `Dockerfile` builds only the Go service. Target frontend image definitions or a single frontend-capable build path MUST be added and reviewed before Cloud Run frontend deployment. They MUST preserve the five fixed local ports only for local development; Cloud Run uses its assigned service port.

## 8. Database migrations

### 8.1 Migration boundary

All schema and data migrations MUST be implemented and executed from `services/`. They MUST NOT run from Next.js, GitHub Actions against ad hoc SQL copied from a console, or a separate deployable backend service.

The migration mechanism is TBD under `KROWDS-ARCH-092`. It MUST be versioned with the `krowds-services` source and invoked from the same release artifact through a Cloud Run Job or an equivalent controlled one-off execution. A migration subcommand in the same binary is acceptable; a second independently deployed backend is not.

### 8.2 Compatibility policy

Every schema change MUST be classified before release:

| Class | Deployment rule | Rollback rule |
| --- | --- | --- |
| Expand | Add nullable columns, new tables, compatible indexes, or new enum values without removing old behavior | Previous application revision remains compatible |
| Migrate | Backfill data in bounded, observable batches while both application versions can run | Pause or resume backfill; application traffic remains compatible |
| Switch | Change reads or writes after all instances run compatible code | Shift traffic to the previous revision if schema remains compatible |
| Contract | Remove old columns, paths, or constraints in a later release | Restore from backup or perform a forward repair; prior binary rollback is not assumed |

Destructive changes MUST NOT occur in the same release that first stops using the affected field.

### 8.3 Migration gates

- A migration MUST be idempotent or protected by a durable migration lock.
- Long-running migrations MUST use bounded batches, lock timeouts, progress metrics, and a documented stop condition.
- A migration MUST NOT silently discard or rewrite payment, ticket, wristband, entitlement, identity, or audit history.
- Every new tenant-owned table MUST include `organization_id`, enable RLS, and force RLS for the runtime role. The runtime role MUST NOT own the table or have `BYPASSRLS`.
- Migration and break-glass identities MUST be separate from the serving identity. A migration MUST verify that ordinary application sessions cannot obtain cross-organization scope.
- New application code MUST start successfully against the pre-migration schema when classified as expand.
- The pipeline MUST record migration name, version, checksum, start and end times, row counts where applicable, and result.
- Only one migration execution MAY run for an environment at a time.
- Production migration requires a recent successful backup check and an assigned Data and Database Engineering (TBD) operator.

### 8.4 Deployment order

1. Apply compatible infrastructure and queue definitions through Terraform.
2. Run expand migrations.
3. Deploy the backend as a no-traffic revision and verify startup and readiness.
4. Route a controlled percentage of backend traffic or shift all traffic after the release policy is satisfied.
5. Run bounded data backfill and monitor.
6. Deploy the five frontend revisions.
7. Verify synchronous and asynchronous critical flows.
8. Run contract migrations in a later approved release after rollback retention expires.

## 9. Application deployment procedure

### 9.1 Pre-deployment checks

The release operator confirms:

- the commit, image digests, and change record are identified;
- CI, architecture, security, and build checks passed;
- the Indonesia-first legal and privacy gate is approved for every production data and provider flow in scope;
- Terraform drift has been reviewed;
- Cloud SQL health, storage, backups, connection budget, runtime role, and forced RLS are acceptable;
- cross-organization negative tests passed for changed tenant-owned tables or queries;
- Cloud Tasks backlog, webhook inbox, and Scheduler state are understood;
- Xendit, Resend, Biteship, and Google OAuth/OIDC provider sandbox checks passed for the changed integration;
- migration classification and rollback point are approved;
- Secret versions exist in the target project;
- load-balancer hostnames, the approved API identity-forwarding path, and CORS values match the target project;
- the PWA service worker does not grant offline payment, ticket, wristband, or gate authority;
- the Incident Commander or operations owner is available for production;
- dashboards and alert routes are staffed.

### 9.2 Backend revision deployment

GitHub Actions performs the normal deployment. The equivalent Cloud Run operation for a backend revision is:

```bash
PROJECT_ID=krowds-prod
REGION=asia-southeast2
SERVICE=krowds-services
IMAGE=asia-southeast2-docker.pkg.dev/krowds-prod/krowds-containers/krowds-services@sha256:REVISION_DIGEST

gcloud run services update "$SERVICE" \
  --project="$PROJECT_ID" \
  --region="$REGION" \
  --image="$IMAGE" \
  --no-traffic
```

`REVISION_DIGEST` is replaced by the recorded immutable digest. The pipeline then verifies the new revision and shifts traffic using the release policy:

```bash
gcloud run services update-traffic "$SERVICE" \
  --project="$PROJECT_ID" \
  --region="$REGION" \
  --to-revisions=REVISION_NAME=100
```

### 9.3 Frontend revision deployment

Each frontend follows the same no-traffic verification and traffic-shift process using its own service name and image digest. Frontends are deployed only after the compatible backend revision is available. A frontend failure does not authorize changes to backend or database state.

### 9.4 Completion criteria

A deployment is complete only when:

- every expected Cloud Run revision reports ready and direct anonymous backend invocation is denied;
- traffic percentages match the approved release policy;
- `/`, `/health/live`, and `/health/ready` pass for the backend without disclosing internal details;
- each frontend loads its public entry page without a server error;
- an authenticated API smoke test passes with a non-production account in lower environments;
- cross-organization read and write attempts fail through both application authorization and PostgreSQL RLS;
- Xendit, Resend, Biteship, and Google OAuth/OIDC provider sandbox checks pass for every integration changed or enabled in the release;
- duplicate, replayed, stale, and out-of-order provider events produce no duplicate business effect;
- a Cloud Tasks sample task, where configured, completes once;
- a Scheduler dry run or guarded execution, where configured, passes;
- a single-use access concurrency check admits no more than one valid transition;
- logs show no new critical error signature or prohibited data;
- metrics remain within the approved launch envelope;
- the release record and any production incident record are updated.

## 10. Scaling configuration

### 10.1 Draft launch envelope

These values are conservative starting limits, not production capacity approval:

| Environment | Frontend min / max per service | Backend min / max | Initial concurrency | Notes |
| --- | ---: | ---: | ---: | --- |
| Development | `0 / 2` | `0 / 3` | `40` | Cost and idle use prioritized |
| Staging | `1 / 4` | `1 / 8` | `40` | Supports a production-like smoke test |
| Production | `1 / 10` | `2 / 20` | `40` | Two backend replicas provide a maintenance baseline; database budget is authoritative |

CPU, memory, request timeout, maximum request size, Cloud SQL machine class, and Memorystore capacity are starting configuration values only. The SRE Lead and Data and Database Engineering MUST replace them through Terraform using load-test evidence before production launch; unresolved sizing remains a release gate in [OPEN-DECISIONS.md](../00-governance/OPEN-DECISIONS.md).

### 10.2 Scaling safeguards

- Maximum backend instances are calculated from the approved per-instance connection pool and Cloud SQL connection limit.
- Queue dispatch limits and scheduler concurrency are lower than interactive capacity.
- A queue backlog does not justify exceeding the database connection budget.
- Alerts fire before database CPU, storage, or connections reach a hard limit.
- Scheduler jobs are staggered and guarded against overlap.
- Capacity tests use synthetic or masked data and MUST NOT use production personal data.
- Scaling changes are reviewed like other Terraform changes and recorded in the release evidence.

## 11. Post-deployment verification

| ID | Verification | Pass condition | Owner |
| --- | --- | --- | --- |
| KROWDS-DEP-140 | Terraform state | Apply completed, expected resource versions are present, and no unexplained drift exists | Platform Engineering (TBD) |
| KROWDS-DEP-141 | Cloud Run revisions | All six services have ready revisions and expected traffic | Release Engineering (TBD) |
| KROWDS-DEP-142 | Backend health | Root, liveness, and readiness endpoints return the expected response without dependency errors | SRE (TBD) |
| KROWDS-DEP-143 | Frontend smoke | Web, Auth, Krew, Org, and PWA entry pages load and static assets succeed | QA and Frontend Engineering (TBD) |
| KROWDS-DEP-144 | API boundary | Browser calls use `@krowds/api` through the approved authenticated path; direct anonymous Cloud Run invocation fails; CORS allows only target origins | Backend and Platform Engineering (TBD) |
| KROWDS-DEP-145 | Database and RLS | Migration version is current, connection use is safe, runtime role cannot bypass RLS, and cross-organization tests fail closed | Data and Database Engineering (TBD) |
| KROWDS-DEP-146 | Async and provider work | Task, scheduler, webhook, duplicate, replay, timeout, and reconciliation checks complete without duplicate business effects | Backend and Platform Integration Engineering (TBD) |
| KROWDS-DEP-147 | Objects and secrets | Authorized private object access works and Cloud Run can read only required secret versions | Security Engineering (TBD) |
| KROWDS-DEP-148 | Observability | Logs, metrics, Error Reporting, provider health, and alerts identify the new revision and environment | SRE (TBD) |
| KROWDS-DEP-149 | Business smoke | Authentication, organization scope, online IDR-only single-use access, and critical read paths pass without implying offline, transfer, re-entry, or multi-use behavior | QA and Product Owner (TBD) |

## 12. Rollback

### 12.1 Rollback classes

| Class | Action | Data requirement |
| --- | --- | --- |
| Configuration | Restore the prior known-good configuration and deploy a new revision | Schema and data unchanged |
| Application | Shift Cloud Run traffic to the last known-good revision by digest | Previous revision remains schema-compatible |
| Infrastructure | Apply a reviewed Terraform corrective change | Resource replacement and state handled through Terraform |
| Migration | Reverse a proven reversible migration, pause a backfill, or apply a forward repair | No destructive change has invalidated prior data |
| Data | Restore to an isolated database copy and cut over after validation | Approved restore point and business authorization required |

### 12.2 Application rollback procedure

1. Declare or update the incident record and name the rollback decision owner.
2. Record the failing revision, previous known-good revision, revision IDs, start time, and user impact.
3. Stop further traffic shifts.
4. If the failure follows a migration, determine whether schema compatibility is intact before binary rollback.
5. Shift the affected Cloud Run service to the prior revision:

```bash
gcloud run services update-traffic krowds-services \
  --project=krowds-prod \
  --region=asia-southeast2 \
  --to-revisions=PREVIOUS_REVISION_NAME=100
```

6. Run KROWDS-DEP-141 through KROWDS-DEP-149 as applicable.
7. Inspect errors, latency, database load, and asynchronous backlog.
8. Pause or replay queued work only through approved idempotent procedures.
9. Record the rollback, residual risk, and follow-up owner in the incident record or change record.
10. Do not delete the failed revision until evidence is preserved.

Traffic rollback does not reverse a migration or restore data. Those actions require separate approval under KROWDS-DEP-012 and the data recovery procedure in `KROWDS-RUN-001`.

## 13. Backup and disaster-recovery deployment

- Terraform MUST enable and monitor production Cloud SQL automated backups and point-in-time recovery.
- Automated backup retention is 7 days for development, 14 days for staging, and 35 days for production. Log retention is 30 days for development, 90 days for staging, and 365 days for production, subject to legal hold.
- Primary transactional-store RPO is 15 minutes and RTO is 4 hours, with quarterly restore drills and evidence.
- Production restore drills MUST run at least quarterly using synthetic or irreversibly masked data.
- Database exports used for long-term recovery MUST be written to protected Cloud Storage buckets with retention and access logging.
- Memorystore recovery MUST rebuild from PostgreSQL and configuration; it is not a backup source.
- Cloud Storage, BigQuery, Secret Manager, and log retention MUST be reviewed against the confirmed 30/90/365-day development/staging/production baseline and approved cost/quota budgets.
- A restore exercise MUST validate application startup, migration state, authorization, object access, and representative business records.
- Cross-region disaster recovery remains an open decision because the target runtime region is fixed to `asia-southeast2`.

## 14. Deployment security controls

- Branch protection and pull-request review are required for infrastructure and application changes.
- Production GitHub environments require named role approvers and prevent self-approval unless an approved break-glass process is active.
- Workload Identity Federation replaces downloadable GCP service-account keys in CI.
- Serving, task, migration, operator, and CI identities are separated; the runtime database role cannot bypass RLS.
- Xendit, Resend, Biteship, and Google OAuth/OIDC provider use environment-specific credentials, verified webhooks, replay controls, and auditable adapters.
- Artifact images are scanned, immutable, and linked to source provenance.
- Terraform plans and GitHub deployment summaries are treated as sensitive when they expose internal identifiers.
- Manual production access is time-limited, audited, and linked to an incident record or approved change.
- Debug endpoints, verbose logging, public database access, wildcard CORS, and embedded credentials are prohibited.
- Deployment evidence MUST exclude request bodies, access tokens, secret values, full identity data, and payment credentials.

## 15. Decommission and recovery of deployment access

To remove an environment or deployment path:

1. Declare the change and obtain Release Manager and Data Owner approval.
2. Stop Scheduler jobs and Cloud Tasks dispatch.
3. Remove traffic and confirm no active task or migration remains.
4. Export required audit and configuration evidence according to retention policy.
5. Revoke GitHub workload identity, service accounts, secret access, DNS, and administrator grants.
6. Apply reviewed Terraform to remove or retain resources according to the retention decision.
7. Verify logs, buckets, databases, secrets, and backups remain only for the approved period.
8. Record final resource identifiers and destruction evidence in the change or incident record.

Production data MUST NOT be destroyed as an incidental cleanup step.

## 16. Open deployment decisions

External deployment gates are mirrored in [OPEN-DECISIONS.md](../00-governance/OPEN-DECISIONS.md). A value remains open until its evidence is recorded there.

| ID | Decision required | Owner | Required before |
| --- | --- | --- | --- |
| KROWDS-DEP-160 | Final production Cloud Run and database scaling limits | SRE Lead and Data and Database Engineering (TBD) | Production launch |
| KROWDS-DEP-161 | Final Terraform module and state bootstrap procedure | Platform Engineering (TBD) | First infrastructure apply |
| KROWDS-DEP-162 | Frontend container build and runtime API configuration contract: environment-specific non-secret artifact generated by Terraform/CI; no Next.js backend route | Frontend Engineering (TBD) | First frontend Cloud Run deployment |
| KROWDS-DEP-163 | Migration command, version table, lock, backfill tooling, and runtime versus migration database roles | Data and Database Engineering (TBD) | First schema migration |
| KROWDS-DEP-164 | Production release branch, tag, and change-record system: protected `main`, `release/*`, annotated `v0.1.x` tags, GitHub Actions, immutable digest promotion | Release Management (TBD) | Staging promotion |
| KROWDS-DEP-165 | Custom domains, API hostname, cookie scope, and secure API gateway/identity-aware path | Platform Engineering and Security Engineering (TBD) | Public API launch |
| KROWDS-DEP-166 | Backup, log, object, audit, provider, and BigQuery retention against the confirmed baseline | Data Owner and Legal or Privacy Owner (TBD) | Production data admission |
| KROWDS-DEP-167 | Xendit, Resend, Biteship, and Google OAuth/OIDC provider accounts, domains, webhook versions, replay windows, and data-transfer approvals | Platform Integration Engineering, Security Engineering, and Privacy and Legal Counsel (TBD) | Corresponding production integration |
| KROWDS-DEP-168 | Evidence that the accepted IDR-only payment policy is implemented and covered in release tests | Product Owner and Backend Engineering Lead (TBD) | Phase 4 release |
| KROWDS-DEP-169 | Production budget ceilings, quota review, named cost owners, and log-retention cost validation | Platform Engineering and Finance Owners (TBD) | Before production launch |

## 17. Related documents

- [KROWDS-ARCH-001 — Target System Architecture](../03-architecture/ARCHITECTURE.md)
- [KROWDS-RUN-001 — Operations Runbook](RUNBOOK.md)
- [KROWDS-PV-001 — Product Vision](../01-product/PRODUCT-VISION.md)
- [KROWDS-SECURITY-001 — Security Requirements](../05-security/SECURITY.md)
- [KROWDS-PRIVACY-001 — Privacy Requirements](../05-security/PRIVACY.md)
- [KROWDS-INTEGRATIONS-001 — External Integrations](../06-integrations/INTEGRATIONS.md)
- [Current CI workflow](../../.github/workflows/ci.yml)
- [Non-functional requirements](../02-requirements/NFR.md)
- [Open decisions and release gates](../00-governance/OPEN-DECISIONS.md)
- [Test plan](../02-requirements/TEST-PLAN.md)
- [Risk register](../05-security/RISK-REGISTER.md)
