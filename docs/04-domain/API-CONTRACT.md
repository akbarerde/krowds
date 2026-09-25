# KROWDS-API-001 — REST API Contract

## Metadata

| Field | Value |
| --- | --- |
| Document ID | `KROWDS-API-001` |
| Service / module | KROWDS Go + Gin modular monolith |
| Version | `0.1` |
| API version | `v1` |
| Status | `Draft` |
| Release label | `0.1 Draft` |
| Base path | `/api/v1` |
| Owner | Backend API Lead (TBD) |
| Last updated | `2026-09-24` |

## 1. Boundary and purpose

This contract defines the HTTP interface used by the KROWDS Next.js applications, internal KREW tools, and verified external webhook senders. The frontend remains responsible for rendering, navigation, and browser state. The Go + Gin service is the only owner of HTTP business behavior, authentication decisions, persistence, queues, and authorization.

### 1.1 Callers and provider

- **Frontend callers:** Web, Auth, Krew, Org, and PWA applications through the shared `@krowds/api` client.
- **Internal caller:** KREW operations tooling using a KREW-scoped access token and an audited organization context.
- **External callers:** Xendit, Biteship, and Resend webhook senders. These callers use provider signatures rather than a KROWDS bearer token.
- **Provider:** one deployable Go + Gin service at `/api/v1`; business modules remain in one process and run on Cloud Run in the target deployment. Cloud SQL for PostgreSQL is the system of record; Cloud Tasks handles asynchronous provider and email work; Cloud Scheduler handles expiry and reconciliation.

### 1.2 Authentication and authorization

- Browser sessions use secure HttpOnly SameSite cookies with rotating refresh credentials through the approved API gateway/identity-aware path. Access is 15 minutes, refresh is 30 days, recovery links are 24 hours, and revocation is immediate. The browser does not read or persist a raw refresh credential. Cookie-authenticated writes require the same-site and CSRF protections defined by the Go service.
- Internal service-to-service and KREW calls may use a short-lived bearer access token. The token subject identifies a `User` or `KREW` member, and KREW tokens carry an explicit KREW role.
- An organization operation requires an active `Membership` for the organization. The path organization ID must match the authenticated membership; the service rejects a mismatch before the database operation.
- Roles are the fixed MVP roles `organization_owner_admin`, `finance`, `ticketing`, `cashier`, `redemption`, `gate`, and `viewer` for organization members. In endpoint permission tables, `owner` and `admin` are shorthand capabilities of the single `organization_owner_admin` Membership role, not separate Membership roles. Internal fixed role groups are `platform_admin` and `krew`; KREW capability values `operations`, `production`, `quality_control`, `fulfillment`, `support`, and `admin` do not create additional product roles.
- KREW endpoints require a KREW role, MFA for privileged actions, and an auditable reason for cross-organization work. KREW authority never bypasses the audit trail.
- `KROWDS-API-OP-000` — `GET /health/live` and `GET /health/ready` are operational endpoints outside `/api/v1`; they are public only to the approved health-check path and return no business or personal data. Login, password recovery, OTP, Google OIDC start/callback, and verified webhook routes are the other intentionally public boundaries; all other business routes are private.

### 1.3 Data boundary

- Every organization-owned request is evaluated against PostgreSQL RLS after authentication. The API does not accept an organization ID as proof of access.
- The API never returns identity numbers, password material, access tokens, provider secrets, plaintext QR tokens, or QR token hashes.
- A wristband QR token is accepted only at redemption or access-scan boundaries and is not placed in URLs, query strings, logs, analytics, or normal JSON responses.
- The MVP is online-first, IDR-only, and single-use. Ticket transfer, re-entry, multi-use, and offline gate access are not exposed by the API.
- Private production files and legal documents use Cloud Storage; provider credentials use Secret Manager; provider and email work is queued through Cloud Tasks.

## 2. Conventions

### 2.1 Transport and representation

- The base path is `/api/v1` and all application resources use JSON over HTTPS. The existing operational liveness/readiness paths `/health/live` and `/health/ready` are the explicit exception used by deployment probes.
- Request and response media type is `application/json; charset=utf-8`, except the verified webhook endpoints, which consume provider-specific raw bodies.
- Resource names are plural and use kebab-case: `ticket-orders`, `wristband-batches`, and `access-scans`.
- Field names use `camelCase` in JSON and `snake_case` only where a provider payload requires it.
- IDs are canonical lowercase UUIDv7 strings, for example `0190f2c2-7b2a-7c11-8b0a-2f9b1c4d5e6f`.
- Instants use RFC 3339 UTC, for example `2026-09-24T08:30:00Z`.
- Money uses an exact decimal string containing an integer IDR amount paired with `IDR`; binary floating point is not accepted. The MVP does not expose another currency.
- Nullable fields are explicit `null`; an omitted optional field means “not supplied” for a create operation and “unchanged” only for a documented partial-update operation.
- Enum values use the stable lowercase values listed in this contract and in [STATE-MACHINES.md](STATE-MACHINES.md).

### 2.2 Location hierarchy

The API exposes the following hierarchy and no Branch resource:

```text
Organization -> Venue -> Event -> optional Activity -> Session
```

`Session.activityId` is null for an event-level session. When it is set, the activity must belong to the event. A venue is the location used by access scans.

### 2.3 MVP access and commerce policy

- Currency is `IDR` for ticket and wristband orders.
- A ticket has one ticket holder and one verified identity; holder data is editable before payment and immutable after payment.
- Ticket transfer is not supported.
- A successful access consumes the entitlement once. Re-entry, multi-use, usage-count policies, and offline gate access are not exposed.
- A full refund request is available before a ticket is Bound or Used and within 7 calendar days after verified payment; later requests enter `exceptional_review` for a dual-approved Finance decision. A used, bound, cancelled, refunded, expired, or revoked ticket cannot grant access.
- Existing stock is reserved before payment for cashier sales and becomes active only after payment and successful binding. Newly produced units require delivery and batch activation before reservation.

### 2.4 Success envelope

Single-resource responses use:

```json
{
  "data": {
    "id": "0190f2c2-7b2a-7c11-8b0a-2f9b1c4d5e6f",
    "status": "active"
  },
  "meta": {
    "requestId": "req_01J2K8M4N6P8Q0R2S4T6V8W0"
  }
}
```

Collection responses use the same `data` array and add a `page` object:

```json
{
  "data": [],
  "page": {
    "nextCursor": null,
    "hasMore": false
  },
  "meta": {
    "requestId": "req_01J2K8M4N6P8Q0R2S4T6V8W0"
  }
}
```

### 2.5 Cursor pagination

- List endpoints use opaque cursor pagination, not offset pagination.
- `cursor` is an encoded, signed, tenant-bound value containing a sort key, tie-breaker ID, direction, and filter fingerprint. Clients must treat it as opaque.
- `limit` is optional, defaults to `25`, and is limited to `100`.
- Stable ordering always includes the resource ID as a tie-breaker.
- A cursor from another organization, an incompatible filter set, or an expired contract version returns `400 INVALID_CURSOR`.
- The service returns `page.nextCursor` and `page.hasMore`; when `hasMore` is `false`, `nextCursor` must be `null`; there is no total-count guarantee for a live collection.

### 2.6 Filtering and sorting

Supported filters are explicitly allow-listed per endpoint. A filter that is not documented returns `400 UNSUPPORTED_FILTER`. Sorting is also allow-listed; clients cannot inject an arbitrary database column. Filters are combined with AND semantics.

## 3. Common headers

| Header | Direction | Required | Description |
| --- | --- | --- | --- |
| `Authorization` | Request | Protected internal routes when bearer auth is used | `Bearer` followed by the issued access token; browser sessions normally use secure HttpOnly cookies |
| `Cookie` | Request | Browser session routes | Secure HttpOnly session cookie; never exposed to browser JavaScript |
| `X-CSRF-Token` | Request | Cookie-authenticated writes | CSRF value bound to the browser session; required for state-changing requests |
| `Accept` | Request | Yes for API calls | `application/json` or `application/problem+json` |
| `Content-Type` | Request | Write requests | `application/json; charset=utf-8` |
| `X-Request-ID` | Request and response | Response always | Client correlation value, maximum 128 printable characters; the server generates one when absent or invalid |
| `Idempotency-Key` | Request | Required for unsafe transactional commands | Stable retry key, 8–128 printable ASCII characters |
| `If-Match` | Request | Required for mutable resource updates | Quoted ETag or row version; protects against lost updates |
| `ETag` | Response | For mutable resources | Quoted version derived from `row_version` |
| `Location` | Response | Successful creation | Canonical URI of the created resource |
| `Retry-After` | Response | Rate limit or temporary failure | Server retry delay in seconds |
| `X-Organization-ID` | Request | Never accepted | Presence returns `400 INVALID_ORGANIZATION_CONTEXT`; organization scope comes from the authenticated membership and RLS context |

A request ID is correlation data, not authorization. The service records it with the audit event and provider webhook event. It must not contain a secret, plaintext QR token, or unnecessary PII.

## 4. Error model — RFC 7807

All non-success API responses use `application/problem+json` and the RFC 7807 fields `type`, `title`, `status`, `detail`, and `instance`. KROWDS extensions are `code`, `requestId`, and optional field-level `errors`.

```json
{
  "type": "urn:krowds:problem:validation-error",
  "title": "Validation failed",
  "status": 422,
  "detail": "One or more request fields are invalid.",
  "instance": "/api/v1/organizations/0190f2c2-7b2a-7c11-8b0a-2f9b1c4d5e6f/venues",
  "code": "VALIDATION_ERROR",
  "requestId": "req_01J2K8M4N6P8Q0R2S4T6V8W0",
  "errors": [
    {
      "pointer": "/name",
      "code": "REQUIRED",
      "message": "Name is required."
    }
  ]
}
```

| Status | Meaning | Client behavior |
| ---: | --- | --- |
| `400` | Malformed request, unsupported filter, or invalid cursor | Correct the request; do not retry unchanged |
| `401` | Missing, expired, or invalid bearer token, or invalid webhook signature | Refresh/login for API calls; provider must resend with a valid signature |
| `403` | Authenticated but not authorized for the organization or action | Do not retry without a permission change |
| `404` | Resource does not exist or is hidden by tenant scope | Treat as not found; do not probe another organization |
| `409` | State conflict, duplicate idempotency key with different request, or concurrent binding | Refresh state and resolve the conflict |
| `410` | Credential, ticket, or invitation is no longer usable | Show an expired or revoked state; do not retry |
| `412` | `If-Match` or row version is stale | Reload the resource and ask the user to review changes |
| `422` | Semantically invalid request | Correct field-level errors |
| `429` | Rate limit exceeded | Respect `Retry-After` and use exponential backoff |
| `500` | Unexpected server failure | Retry idempotent operations with backoff; show a safe message |
| `502` | Upstream provider or dependency failure | Retry according to the operation and reconciliation policy |
| `503` | Service temporarily unavailable | Retry with backoff and preserve the request ID |
| `504` | Upstream dependency timed out | Retry only when the operation is idempotent |

Common machine-readable codes include `VALIDATION_ERROR`, `AUTHENTICATION_REQUIRED`, `PERMISSION_DENIED`, `RESOURCE_NOT_FOUND`, `RESOURCE_CONFLICT`, `IDEMPOTENCY_KEY_REUSED`, `IDEMPOTENCY_IN_PROGRESS`, `INVALID_CURSOR`, `ROW_VERSION_CONFLICT`, `CREDENTIAL_REVOKED`, `WRISTBAND_NOT_ACTIVE`, `WEBHOOK_SIGNATURE_INVALID`, `WEBHOOK_REPLAYED`, `INVALID_ORGANIZATION_CONTEXT`, and `RLS_SCOPE_MISSING`.

## 5. Authentication and authorization resources

### 5.1 Current actor

`KROWDS-API-OP-001` — `GET /api/v1/me`

Returns the authenticated user, verified email state, safe authentication-method summaries, active organization memberships, and the `platform_admin` or `krew` internal role group when present. It does not return identity numbers, password verifiers, OTPs, provider tokens, or authentication-provider secrets.

### 5.2 Email verification

`KROWDS-API-OP-002` — `POST /api/v1/auth/email-verification/send`

Starts or resends an email verification challenge for the authenticated user. Repeated requests are rate-limited and do not reveal whether an address exists.

`KROWDS-API-OP-003` — `POST /api/v1/auth/email-verification/confirm`

Confirms an email challenge. The request is idempotent for a valid challenge key; an expired or used challenge returns `410`.

`KROWDS-API-OP-004` — `GET /api/v1/auth/google/start`

Starts the configured Google OIDC flow. The callback is handled by the Go service and establishes the same secure HttpOnly browser session as email authentication.

`KROWDS-API-OP-005` — `GET /api/v1/auth/google/callback`

Completes Google OIDC, validates the authorization response, and redirects to the frontend without exposing a provider token to browser JavaScript. This browser redirect is the only non-JSON success response outside the verified webhook boundary.

### 5.3 Password, OTP, and session operations

| Operation ID | Method and path | Required permission | Notes |
| --- | --- | --- | --- |
| `KROWDS-API-OP-017` | `POST /api/v1/auth/login` | Anonymous | Verifies email/password through the Go-owned credential flow; generic failure response and rate limits apply |
| `KROWDS-API-OP-018` | `POST /api/v1/auth/logout` | Authenticated session | Revokes the current session and rotating refresh credential; idempotent for an already-invalid session |
| `KROWDS-API-OP-019` | `POST /api/v1/auth/refresh` | Valid refresh session | Rotates the refresh credential and returns a new secure HttpOnly session cookie; never exposes a raw token |
| `KROWDS-API-OP-025` | `POST /api/v1/auth/password-reset/send` | Anonymous | Creates a short-lived, hashed recovery challenge through Resend; response does not reveal account existence |
| `KROWDS-API-OP-026` | `POST /api/v1/auth/password-reset/confirm` | Valid recovery challenge | Consumes the challenge once, updates the password verifier, revokes eligible sessions, and records audit evidence |
| `KROWDS-API-OP-027` | `POST /api/v1/auth/otp/send` | Anonymous or authenticated as allowed | Creates a short-lived hashed OTP challenge for approved login or verification purposes; destination and network rate limits apply |
| `KROWDS-API-OP-028` | `POST /api/v1/auth/otp/confirm` | Valid OTP challenge | Verifies and consumes the challenge, then establishes or updates the approved session/account state |

These operations use the `auth_methods` and `auth_challenges` data contracts. Access is 15 minutes, refresh is 30 days, recovery links are 24 hours, the MVP OTP baseline is a 15-minute expiry with five failed attempts and a 60-second resend cooldown, and revocation is immediate. Readable OTPs, password verifiers, refresh credentials, and provider tokens are never returned, logged, or included in analytics.

### 5.4 Identity resources

| Operation ID | Method and path | Required permission | Notes |
| --- | --- | --- | --- |
| `KROWDS-API-OP-006` | `GET /api/v1/me/identities` | Authenticated user | Lists the user’s verified identity summaries; identity numbers are redacted |
| `KROWDS-API-OP-007` | `POST /api/v1/identities` | Authenticated user | Creates a separate identity record; requires consent and `Idempotency-Key` |
| `KROWDS-API-OP-008` | `GET /api/v1/identities/{identityId}` | Identity owner or authorized staff | Returns verification status and redacted fields only |
| `KROWDS-API-OP-009` | `PATCH /api/v1/identities/{identityId}` | Identity owner or authorized staff | Requires `If-Match`; changes are audited and do not rewrite a paid ticket holder |

A User account, Identity record, Visitor record, and Ticket Holder remain separate resources. A minor holder requires a verified guardian relationship and consent before purchase or access.

### 5.5 KREW consumer identity review

| Operation ID | Method and path | Required permission | Notes |
| --- | --- | --- | --- |
| `KROWDS-API-OP-043` | `GET /api/v1/krew/identity-reviews` | KREW `operations` or `admin` | Cursor list of pending, in-review, revision, and decided cases; returns safe identity summaries only |
| `KROWDS-API-OP-044` | `POST /api/v1/krew/identity-reviews/{reviewId}/claim` | KREW `operations` or `admin` | Claims an unclaimed case; requires `If-Match` and `Idempotency-Key` |
| `KROWDS-API-OP-045` | `POST /api/v1/krew/identity-reviews/{reviewId}/decision` | KREW `operations` or `admin` | Accepts `approved`, `revision_required`, or `rejected` with a controlled reason; requires `If-Match` and `Idempotency-Key` |
| `KROWDS-API-OP-046` | `POST /api/v1/identity-reviews/{reviewId}/resubmit` | Requesting User or authorized operator | Accepts corrected approved fields only; no identity-document image or arbitrary reviewer note is accepted |

Consumer identity review is separate from organization onboarding. The API never returns full identity numbers, reviewer notes, or provider secrets. A ticket or redemption requiring the identity remains blocked until the review is `approved`. Initial review target is 1 business day and correction target is 2 business days.

### 5.6 Organization onboarding

| Operation ID | Method and path | Required permission | Notes |
| --- | --- | --- | --- |
| `KROWDS-API-OP-010` | `POST /api/v1/organizations` | Authenticated user | Creates an organization in `draft`; requires `Idempotency-Key` |
| `KROWDS-API-OP-011` | `GET /api/v1/organizations/{organizationId}` | Active membership | Returns organization summary and verification status |
| `KROWDS-API-OP-012` | `PATCH /api/v1/organizations/{organizationId}` | `owner` or `admin` | Requires `If-Match`; cannot approve itself |
| `KROWDS-API-OP-013` | `POST /api/v1/organizations/{organizationId}/onboarding/submit` | `owner` or `admin` | Moves `draft` to `submitted` or `revision_required` to `under_review`; requires `Idempotency-Key` |
| `KROWDS-API-OP-014` | `GET /api/v1/organizations/{organizationId}/onboarding` | `owner`, `admin`, or `viewer` | Returns required-field status and redacted review notes |
| `KROWDS-API-OP-015` | `POST /api/v1/krew/organizations/{organizationId}/review` | KREW `operations` or `admin` | Moves verification state to `under_review`, `revision_required`, `approved`, or `rejected`; requires a reason |
| `KROWDS-API-OP-016` | `POST /api/v1/krew/organizations/{organizationId}/reopen` | KREW `operations` or `admin` | Reopens a rejected onboarding submission as `draft`; requires a reason and `Idempotency-Key` |

Required onboarding data is legal entity, registration, representative, tax ID, address, bank verification, and authorized signatory. Initial and revision review target is 2 business days; legal wording and personal names remain role-owned TBD values.

The create request has this shape:

```json
{
  "legalName": "Example Organizer Pty Ltd",
  "displayName": "Example Organizer",
  "organizationType": "event_organizer",
  "timeZone": "Asia/Jakarta",
  "address": {
    "line1": "Operational address",
    "city": "City",
    "province": "Province",
    "postalCode": "12345",
    "country": "ID"
  }
}
```

The response contains `data.id`, `data.verificationStatus`, and `data.rowVersion`. Sensitive legal fields are write-only or redacted after submission.

### 5.7 Membership and invitations

| Operation ID | Method and path | Required permission | Notes |
| --- | --- | --- | --- |
| `KROWDS-API-OP-020` | `GET /api/v1/organizations/{organizationId}/memberships` | `owner`, `admin`, or `viewer` | Cursor-paginated; never returns invitation secrets |
| `KROWDS-API-OP-021` | `POST /api/v1/organizations/{organizationId}/invitations` | `owner` or `admin` | Requires `Idempotency-Key`; creates one invitation for one role |
| `KROWDS-API-OP-022` | `POST /api/v1/invitations/{invitationId}/accept` | Authenticated invitee | Consumes the invitation once and creates or activates membership |
| `KROWDS-API-OP-023` | `PATCH /api/v1/organizations/{organizationId}/memberships/{membershipId}` | `owner` or `admin` | Requires `If-Match`; role change is audited |
| `KROWDS-API-OP-024` | `DELETE /api/v1/organizations/{organizationId}/memberships/{membershipId}` | `owner` or `admin` | Revokes membership; requires `Idempotency-Key` and `If-Match` |

### 5.8 Venue, event, activity, and session

| Operation ID | Method and path | Required permission | Notes |
| --- | --- | --- | --- |
| `KROWDS-API-OP-030` | `GET /api/v1/organizations/{organizationId}/venues` | Active member | Cursor list with `status` and `search` filters |
| `KROWDS-API-OP-031` | `POST /api/v1/organizations/{organizationId}/venues` | `owner`, `admin`, or `ticketing` | Creates a venue; requires `Idempotency-Key` |
| `KROWDS-API-OP-032` | `GET /api/v1/organizations/{organizationId}/venues/{venueId}` | Active member | Returns venue and event summary |
| `KROWDS-API-OP-033` | `PATCH /api/v1/organizations/{organizationId}/venues/{venueId}` | `owner`, `admin`, or `ticketing` | Requires `If-Match` |
| `KROWDS-API-OP-034` | `GET /api/v1/organizations/{organizationId}/events` | Active member | Supports `venueId`, `status`, and UTC date filters |
| `KROWDS-API-OP-035` | `POST /api/v1/organizations/{organizationId}/events` | `owner`, `admin`, or `ticketing` | Requires a venue in the same organization |
| `KROWDS-API-OP-036` | `GET /api/v1/organizations/{organizationId}/events/{eventId}` | Active member | Includes optional activities and sessions |
| `KROWDS-API-OP-037` | `PATCH /api/v1/organizations/{organizationId}/events/{eventId}` | `owner`, `admin`, or `ticketing` | Requires `If-Match`; changing time zone does not rewrite UTC instants |
| `KROWDS-API-OP-038` | `GET /api/v1/organizations/{organizationId}/events/{eventId}/activities` | Active member | Cursor list; an event may have zero activities |
| `KROWDS-API-OP-039` | `POST /api/v1/organizations/{organizationId}/events/{eventId}/activities` | `owner`, `admin`, or `ticketing` | Creates an optional activity |
| `KROWDS-API-OP-040` | `GET /api/v1/organizations/{organizationId}/events/{eventId}/sessions` | Active member | Cursor list; `activityId` is optional |
| `KROWDS-API-OP-041` | `POST /api/v1/organizations/{organizationId}/events/{eventId}/sessions` | `owner`, `admin`, or `ticketing` | Validates activity/event consistency |
| `KROWDS-API-OP-042` | `PATCH /api/v1/organizations/{organizationId}/events/{eventId}/sessions/{sessionId}` | `owner`, `admin`, or `ticketing` | Requires `If-Match` |

The API does not expose `/branches`, a `branchId` field, or a branch compatibility alias.

## 6. Commerce and ticket contracts

### 6.1 Ticket products and orders

| Operation ID | Method and path | Required permission | Notes |
| --- | --- | --- | --- |
| `KROWDS-API-OP-050` | `GET /api/v1/organizations/{organizationId}/ticket-products` | Active member | Cursor list filtered by event, activity, session, or status |
| `KROWDS-API-OP-051` | `POST /api/v1/organizations/{organizationId}/ticket-products` | `owner`, `admin`, or `ticketing` | Creates a product for the venue hierarchy |
| `KROWDS-API-OP-052` | `PATCH /api/v1/organizations/{organizationId}/ticket-products/{productId}` | `owner`, `admin`, or `ticketing` | Requires `If-Match`; cannot mutate an issued product rule silently |
| `KROWDS-API-OP-053` | `POST /api/v1/ticket-orders` | Authenticated buyer or cashier role | Creates a pending order; requires `Idempotency-Key` |
| `KROWDS-API-OP-054` | `GET /api/v1/ticket-orders/{orderId}` | Buyer or authorized organization role | Returns payment and ticket summary without PII beyond authorization |
| `KROWDS-API-OP-055` | `GET /api/v1/me/tickets` | Authenticated buyer | Cursor list of issued tickets |
| `KROWDS-API-OP-056` | `GET /api/v1/tickets/{ticketId}` | Ticket buyer or authorized operator | Never returns a token hash or plaintext QR credential |
| `KROWDS-API-OP-057` | `POST /api/v1/tickets/{ticketId}/cancel` | Buyer under allowed policy or `finance` | Records a cancellation request only; it does not set a provider refund. A full refund must use `KROWDS-API-OP-061` and requires `Idempotency-Key` |

A ticket order request contains `items` with `ticketProductId` and `quantity`, plus `ticketHolders` with one identity reference per ticket. The service enforces a maximum of 10 tickets per order, a maximum of five active tickets per verified Identity per Event, and a maximum of one active ticket per Identity/Event/Ticket Product/Session combination. Active means paid and not `Refunded`, `Cancelled`, `Expired`, or `Used`; the service evaluates the canonical predicate transactionally. A minor holder also requires a verified guardian relationship and consent reference. The service rejects quantity or active-limit violations with `422 VALIDATION_ERROR` or `409 RESOURCE_CONFLICT`, and rejects a mismatch between item count and holder count with `422 VALIDATION_ERROR`. Ticket-holder data is editable before payment and immutable afterward; no transfer operation exists. The order currency is always `IDR`.

### 6.2 Stock reservation

| Operation ID | Method and path | Required permission | Notes |
| --- | --- | --- | --- |
| `KROWDS-API-OP-058` | `POST /api/v1/organizations/{organizationId}/wristband-reservations` | `cashier`, `ticketing`, or `admin` | Reserves one or more `available` units for a ticket checkout; requires `Idempotency-Key` |
| `KROWDS-API-OP-059` | `DELETE /api/v1/organizations/{organizationId}/wristband-reservations/{reservationId}` | `cashier`, `ticketing`, or `admin` | Releases an unpaid reservation; requires `Idempotency-Key` and `If-Match` |

A reservation is single-use and scoped to one ticket checkout. It is not a multi-use allocation and cannot bypass payment or redemption.

### 6.3 Payments

`KROWDS-API-OP-060` — `GET /api/v1/payments/{paymentId}`

Returns payment status, provider name, amount, `IDR` currency, instruction expiry, and safe next-action metadata. Online instructions expire after 30 minutes and cashier instructions after 15 minutes. A client cannot set a digital payment to `paid`. Payment state changes when a verified Xendit webhook is durably accepted and processed. An in-window full refund is permitted before Bound/Used and within 7 calendar days after verified payment; a later eligible request requires a dual-approved `exceptional_review` decision. Partial refunds are outside the MVP.

`KROWDS-API-OP-061` — `POST /api/v1/payments/{paymentId}/refund`

Required permission is `finance`, `owner`, or `admin` for provider submission. A buyer or authorized organization user may create a cancellation/refund request through `KROWDS-API-OP-057`; requests are accepted only before Bound/Used and within 7 calendar days after verified payment, while later requests enter `exceptional_review`. `KROWDS-API-OP-061` accepts only an in-window `requested` refund; a late request must use `KROWDS-API-OP-062` and cannot be submitted here. Only an approved Finance decision with the required dual approval may submit a late request to Xendit. KROWDS accepts the final refunded state only after a verified Xendit refund event and never fabricates a provider refund.

`KROWDS-API-OP-062` — `POST /api/v1/refunds/{refundId}/exceptional-review/approve`

Required permission is `finance` plus a second authorized approver. The refund must be `exceptional_review`, the order must have no `bound` or `used` ticket, and the request requires `Idempotency-Key`, `If-Match`, and a controlled reason. A successful command records dual approval and submits the full refund to Xendit; it does not mark the refund succeeded.

`KROWDS-API-OP-063` — `POST /api/v1/refunds/{refundId}/exceptional-review/reject`

Required permission is `finance`. The refund must be `exceptional_review`, and the request requires `Idempotency-Key`, `If-Match`, and a controlled reason. A successful command records `rejected` and makes no provider call.

The MVP `paymentMethod` enum is `qris`, `virtual_account`, or `approved_ewallet`. Cards, non-IDR methods, and unlisted payment methods are not accepted. `KROWDS-API-OP-064` — `POST /api/v1/ticket-orders/{orderId}/payment-instruction` accepts one of these methods, requires `Idempotency-Key`, and returns a safe Xendit instruction or hosted action. It never marks the order paid; only a verified Xendit event can do that.

## 7. Wristband stock, production, and activation contracts

### 7.1 Wristband order

| Operation ID | Method and path | Required permission | Notes |
| --- | --- | --- | --- |
| `KROWDS-API-OP-070` | `GET /api/v1/organizations/{organizationId}/wristband-orders` | Active member | Cursor list with status and event filters |
| `KROWDS-API-OP-071` | `POST /api/v1/organizations/{organizationId}/wristband-orders` | `owner`, `admin`, or `ticketing` | Creates a `draft` order; requires `Idempotency-Key` |
| `KROWDS-API-OP-072` | `GET /api/v1/organizations/{organizationId}/wristband-orders/{orderId}` | Active member or KREW | Returns order, items, batches, and safe fulfillment status |
| `KROWDS-API-OP-073` | `POST /api/v1/organizations/{organizationId}/wristband-orders/{orderId}/submit` | `owner` or `admin` | Validates items, artwork reference, event/activity scope, and shipping data |
| `KROWDS-API-OP-074` | `POST /api/v1/organizations/{organizationId}/wristband-orders/{orderId}/cancel` | `owner` or `admin` | Allowed before production; requires `Idempotency-Key` |
| `KROWDS-API-OP-075` | `POST /api/v1/krew/wristband-orders/{orderId}/review` | KREW `operations` or `production` | Verifies order or requests revision; requires a reason |
| `KROWDS-API-OP-076` | `POST /api/v1/krew/wristband-orders/{orderId}/production/start` | KREW `production` | Moves approved order and eligible batches to production |
| `KROWDS-API-OP-077` | `POST /api/v1/krew/wristband-orders/{orderId}/quality-control` | KREW `quality_control` | Records pass or quarantine result; requires `Idempotency-Key` |
| `KROWDS-API-OP-078` | `POST /api/v1/krew/wristband-orders/{orderId}/shipment` | KREW `fulfillment` | Records carrier and shipment reference; no provider webhook is trusted without verification |
| `KROWDS-API-OP-079` | `POST /api/v1/organizations/{organizationId}/wristband-orders/{orderId}/delivery/confirm` | `owner` or `admin` | Records authenticated organization receipt after verified Biteship delivery evidence; requires `Idempotency-Key`, `If-Match`, package count, and receipt evidence reference; batch remains unavailable until activation |

Create-order request:

```json
{
  "items": [
    {
      "eventId": "0190f2c2-7b2a-7c11-8b0a-2f9b1c4d5e6f",
      "activityId": null,
      "designKey": "standard-blue",
      "material": "woven",
      "quantity": 500
    }
  ],
  "shippingAddress": {
    "recipientName": "Operations team",
    "line1": "Warehouse address",
    "city": "City",
    "postalCode": "12345",
    "country": "ID"
  },
  "shippingMethod": "courier"
}
```

The response includes `data.id`, `data.orderNumber`, `data.status`, `data.totalAmount` with `currency: "IDR"`, and `data.rowVersion`. It does not create production QR tokens until KREW verification is complete. Existing stock is reserved by the stock workflow before payment for cashier sales; newly produced units remain unavailable until delivery and batch activation.

### 7.2 Production file

`KROWDS-API-OP-080` — `GET /api/v1/organizations/{organizationId}/wristband-batches/{batchId}/production-file`

Required permission is `owner`, `admin`, KREW `production`, or KREW `quality_control`. The response is JSON containing a short-lived private download URL, file hash, row count, and schema version:

```json
{
  "data": {
    "batchId": "0190f2c2-7b2a-7c11-8b0a-2f9b1c4d5e6f",
    "schemaVersion": "1",
    "rowCount": 500,
    "fileSha256": "9f2c1d0e4b7a6c3f5e8d1a0b2c4e6f8a1b3c5d7e9f0a2b4c6d8e0f1a3b5c7d9e",
    "downloadUrl": "https://storage.invalid/private-production-file-url",
    "expiresAt": "2026-09-24T09:00:00Z"
  },
  "meta": {
    "requestId": "req_01J2K8M4N6P8Q0R2S4T6V8W0"
  }
}
```

The URL is an example of a private, expiring resource address and is not a QR token. The downloadable CSV header is exactly `batch_id,wristband_code,qr_payload,schema_version`; the API never returns the CSV rows in a normal JSON response. Access to the URL is audited. All example values in this contract are synthetic and are not valid production credentials.

### 7.3 Batch activation

`KROWDS-API-OP-081` — `POST /api/v1/organizations/{organizationId}/wristband-batches/{batchId}/activate`

Required permission is `owner` or `admin`; the batch must be `activation_pending`. Biteship delivery evidence and organization receipt confirmation must both be recorded before activation is allowed. The activation code is delivered through the authenticated dashboard and a Resend activation message; only its hash is stored. The request requires `Idempotency-Key` and contains the activation code in the body:

```json
{
  "activationCode": "one-time-batch-activation-secret"
}
```

The response reports counts and state without disclosing credential material:

```json
{
  "data": {
    "batchId": "0190f2c2-7b2a-7c11-8b0a-2f9b1c4d5e6f",
    "status": "activated",
    "activatedCount": 500,
    "alreadyActiveCount": 0,
    "activatedAt": "2026-09-24T08:30:00Z"
  },
  "meta": {
    "requestId": "req_01J2K8M4N6P8Q0R2S4T6V8W0"
  }
}
```

An invalid or reused code returns `422` or `409` without revealing whether another batch exists.

### 7.4 Wristband inventory and revocation

| Operation ID | Method and path | Required permission | Notes |
| --- | --- | --- | --- |
| `KROWDS-API-OP-082` | `GET /api/v1/organizations/{organizationId}/wristbands` | Active member | Cursor list by batch and lifecycle status; returns code and status, never token/hash |
| `KROWDS-API-OP-083` | `GET /api/v1/organizations/{organizationId}/wristbands/{wristbandId}` | Active member | Safe operational detail |
| `KROWDS-API-OP-084` | `POST /api/v1/organizations/{organizationId}/wristbands/{wristbandId}/revoke` | `owner` or `admin` | Requires `Idempotency-Key`, `If-Match`, and a controlled reason; takes effect immediately; `gate` is read-only for wristband state |
| `KROWDS-API-OP-085` | `GET /api/v1/organizations/{organizationId}/wristband-stock` | `owner`, `admin`, `ticketing`, or `viewer` | Returns aggregate stock by batch and movement state |
| `KROWDS-API-OP-098` | `POST /api/v1/krew/organizations/{organizationId}/wristbands/{wristbandId}/revoke` | KREW `admin` | Audited cross-organization credential revocation; requires `Idempotency-Key`, `If-Match`, and a controlled reason; takes effect immediately |

## 8. Domestic shipment contracts

Biteship owns domestic label, tracking, pickup, transit, and delivery state. KROWDS accepts a Biteship projection only after webhook verification or an authorized fulfillment correction.

| Operation ID | Method and path | Required permission | Notes |
| --- | --- | --- | --- |
| `KROWDS-API-OP-086` | `GET /api/v1/organizations/{organizationId}/shipments` | `owner`, `admin`, `finance`, or `viewer` | Cursor list with batch, status, and tracking filters |
| `KROWDS-API-OP-087` | `GET /api/v1/organizations/{organizationId}/shipments/{shipmentId}` | `owner`, `admin`, `finance`, or `viewer` | Returns domestic tracking state and safe provider references |
| `KROWDS-API-OP-088` | `POST /api/v1/krew/shipments/{shipmentId}/correction` | KREW `fulfillment` or `admin` | Audited correction for a verified provider discrepancy; cannot mark a shipment delivered without a verified event or approved fulfillment evidence |
| `KROWDS-API-OP-089` | `POST /api/v1/krew/shipments/{shipmentId}/reship` | KREW `fulfillment` or `admin` | Creates an idempotent replacement-shipment attempt with a controlled reason; the original shipment remains immutable |

Shipment states are `pending`, `label_created`, `picked_up`, `in_transit`, `delivered`, `failed`, `cancelled`, and `reshipment_pending`. Biteship quote requests use the organization account and approved domestic service allowlist; the customer does not select a courier. KREW approves a replacement attempt, which moves from `reshipment_pending` to a new `label_created` shipment projection after verified Biteship evidence. International shipping, cash on delivery, and marketplace courier selection are outside the MVP.

## 9. Redemption, binding, and access contracts

### 9.1 Redeem a ticket and bind a wristband

`KROWDS-API-OP-090` — `POST /api/v1/organizations/{organizationId}/redemptions`

Required permission is `redemption` or `admin`. The request contains the ticket credential, the wristband code or QR credential, and the physical holder verification outcome. The ticket QR token and wristband QR token are write-only fields.

```json
{
  "ticketQrToken": "write-only-ticket-credential",
  "wristbandQrToken": "write-only-wristband-credential",
  "venueId": "0190f2c2-7b2a-7c11-8b0a-2f9b1c4d5e6f"
}
```

The operator may record a physical identity comparison in the workflow, but the client-provided comparison is never an authorization or binding decision. The backend independently verifies ticket state, holder identity evidence, current credential state, and event scope. The response is safe for the operator and contains the decision:

```json
{
  "data": {
    "status": "bound",
    "ticketId": "0190f2c2-7b2a-7c11-8b0a-2f9b1c4d5e6f",
    "wristbandId": "0190f2c2-7b2a-7c11-8b0a-2f9b1c4d5e6f",
    "eventId": "0190f2c2-7b2a-7c11-8b0a-2f9b1c4d5e6f",
    "activityId": null,
    "sessionId": null,
    "boundAt": "2026-09-24T08:30:00Z"
  },
  "meta": {
    "requestId": "req_01J2K8M4N6P8Q0R2S4T6V8W0"
  }
}
```

The service verifies payment, ticket status, holder identity, wristband reservation, batch activation, event scope, and current credential status in one transaction. Cashier sales reserve existing stock before payment; the successful binding activates the wristband after payment. A repeated request with the same `Idempotency-Key` returns the original result.

### 9.2 Gate access scan

`KROWDS-API-OP-091` — `POST /api/v1/organizations/{organizationId}/access-scans`

Required permission is `gate`, `redemption`, or `admin`. The request body is write-only for the credential:

```json
{
  "wristbandQrToken": "write-only-wristband-credential",
  "venueId": "0190f2c2-7b2a-7c11-8b0a-2f9b1c4d5e6f",
  "gateId": "gate-entrance-a"
}
```

The response is intentionally small and operational:

```json
{
  "data": {
    "decision": "access_granted",
    "reasonCode": "VALID_ENTITLEMENT",
    "scanId": "0190f2c2-7b2a-7c11-8b0a-2f9b1c4d5e6f",
    "scannedAt": "2026-09-24T08:30:00Z"
  },
  "meta": {
    "requestId": "req_01J2K8M4N6P8Q0R2S4T6V8W0"
  }
}
```

Possible decisions are `access_granted`, `access_denied`, and `access_error`. Gate access requires an `active` wristband and an unused single-use entitlement. A denial includes a controlled reason such as `NOT_ACTIVE`, `EXPIRED`, `REVOKED`, `OUTSIDE_WINDOW`, `WRONG_VENUE`, `ALREADY_USED`, or `NO_ENTITLEMENT`. A successful access consumes the entitlement once; re-entry and offline authorization are not supported. A client has a 3-second timeout and at most two exponential-backoff retries before returning `TEMP_UNAVAILABLE`; every attempt creates an `access_scans` audit record.

### 9.3 Access logs

`KROWDS-API-OP-092` — `GET /api/v1/organizations/{organizationId}/access-scans`

Required permission is `gate`, `redemption`, `finance`, or `viewer`. The cursor supports filters for venue, decision, reason, and UTC time range. Responses contain no plaintext QR token.

### 9.4 Registered gate devices

| Operation ID | Method and path | Required permission | Notes |
| --- | --- | --- | --- |
| `KROWDS-API-OP-093` | `GET /api/v1/organizations/{organizationId}/gate-devices` | `organization_owner_admin`, `gate`, or `viewer` | Lists safe device references, venue scope, lifecycle state, and last health signal; never returns secrets |
| `KROWDS-API-OP-094` | `POST /api/v1/organizations/{organizationId}/gate-devices` | `organization_owner_admin` | Registers a device reference with a controlled label and venue scope; requires `Idempotency-Key` |
| `KROWDS-API-OP-095` | `GET /api/v1/organizations/{organizationId}/gate-devices/{deviceId}` | `organization_owner_admin`, `gate`, or `viewer` | Returns safe device metadata and current lifecycle state |
| `KROWDS-API-OP-096` | `PATCH /api/v1/organizations/{organizationId}/gate-devices/{deviceId}` | `organization_owner_admin` | Changes an approved device state; requires `If-Match`, a reason, and audit evidence |
| `KROWDS-API-OP-097` | `DELETE /api/v1/organizations/{organizationId}/gate-devices/{deviceId}` | `organization_owner_admin` | Revokes a device; requires `Idempotency-Key`, `If-Match`, and a controlled reason |

Gate-device states are `pending_registration`, `active`, `suspended`, `disabled`, and `revoked`. A browser or device claim alone never establishes trust. A scan from a missing, inactive, wrong-organization, or wrong-venue device is denied and audited. Device registration and lifecycle changes are organization-scoped and do not grant access by themselves.

## 10. KREW operations and audit

| Operation ID | Method and path | Required permission | Notes |
| --- | --- | --- | --- |
| `KROWDS-API-OP-100` | `GET /api/v1/krew/wristband-orders` | KREW role | Cross-organization queue with explicit organization filters and audit context |
| `KROWDS-API-OP-101` | `GET /api/v1/krew/wristband-batches/{batchId}` | KREW role | Returns production status and safe metadata |
| `KROWDS-API-OP-102` | `GET /api/v1/krew/wristband-batches/{batchId}/production-file` | KREW `production`, `quality_control`, or `fulfillment` | Issues a short-lived private URL and audits access |
| `KROWDS-API-OP-103` | `GET /api/v1/krew/audit-events` | KREW `operations` or `admin` | Cursor-paginated, redacted audit view |
| `KROWDS-API-OP-104` | `GET /api/v1/organizations/{organizationId}/audit-events` | `owner`, `admin`, or `viewer` | Organization-scoped audit view |

KREW queue filters cannot bypass provider verification, production quality control, or organization approval.

## 11. Verified webhooks

### 11.1 Endpoints

| Operation ID | Provider | Method and path | Authentication | Business effect |
| --- | --- | --- | --- | --- |
| `KROWDS-API-WH-001` | Xendit | `POST /api/v1/webhooks/xendit` | Verified Xendit callback token/signature | Payment, invoice, QRIS, or Virtual Account status |
| `KROWDS-API-WH-002` | Biteship | `POST /api/v1/webhooks/biteship` | Verified Biteship signature | Shipment and fulfillment status |
| `KROWDS-API-WH-003` | Resend | `POST /api/v1/webhooks/resend` | Verified Svix signature | Email delivery, bounce, or complaint status |

These endpoints do not use a KROWDS bearer token. They accept only the provider's raw body and configured verification headers. The organization is resolved from the verified provider account and event reference, never from an unverified body field.

### 11.2 Verification and processing rules

1. Read the raw request bytes without JSON re-encoding or field normalization.
2. Verify the provider signature or callback token using a secret from the secret manager and a constant-time comparison.
3. Reject a missing, invalid, or expired signature with `401 WEBHOOK_SIGNATURE_INVALID` or `400 WEBHOOK_REPLAYED`. Signed webhook timestamps outside the configured five-minute freshness window are stale.
4. Store the provider event ID, payload hash, verification result, and request ID in the durable webhook inbox before acknowledging it.
5. Return `202 Accepted` after durable receipt, even when business processing is queued.
6. Process at least once, but make the business mutation idempotent with `(provider, providerEventId)`.
7. A duplicate verified event returns `202` and does not repeat a payment, shipment, or email side effect.
8. Unknown event types are acknowledged and recorded as `ignored`; they do not mutate a ticket or wristband.
9. Failed processing is retried with bounded exponential backoff and ends in `dead_letter` for reconciliation. Provider retries remain safe.
10. Logs contain provider event ID and request ID, but never the raw signature secret or complete sensitive payload.

For Resend, the service verifies the Svix `svix-id`, `svix-timestamp`, and `svix-signature` values against the raw body and rejects stale timestamps. For Xendit and Biteship, the service uses the verification mechanism enabled for the configured account and keeps provider-specific header names outside the business contract.

Only a verified Xendit payment event may transition a digital payment to `paid`. Manual staff confirmation cannot replace that rule. Biteship events may update fulfillment state after signature verification. Resend events update communication delivery records only; they never activate a wristband.

## 12. Idempotency, concurrency, and rate limits

- Safe `GET` and `HEAD` requests are naturally idempotent and do not require `Idempotency-Key`.
- `Idempotency-Key` is required for order creation, payment initiation, ticket issue, wristband binding, batch activation, revocation, and other commands with financial, inventory, or security effects.
- The service scopes a key to actor, method, route, and organization. It stores a request fingerprint and the original status/body for 24 hours.
- Reusing a key with the same fingerprint returns the original response. Reusing it with a different body returns `409 IDEMPOTENCY_KEY_REUSED`. A concurrent unfinished request returns `409 IDEMPOTENCY_IN_PROGRESS`.
- Provider event deduplication uses a 30-day inbox/deduplication index; long-lived financial and audit references follow the canonical retention matrix.
- Webhook deduplication is separate from client idempotency and uses the provider event ID.
- Mutable resources expose an `ETag` derived from `row_version`. `PATCH`, role changes, order review, QC, and revocation require `If-Match` where the operation can overwrite a state decision.
- Access scans use a device-generated request key and a server-generated scan ID. A replay of the same key returns the original decision and does not increment entitlement usage again.
- External provider calls use a connect timeout no greater than 3 seconds and a read timeout no greater than 10 seconds. Synchronous operations allow at most 3 attempts; asynchronous tasks allow at most 5 attempts before dead-letter. Retries use bounded exponential backoff with jitter and honor provider `Retry-After`; a non-idempotent operation is not retried automatically without an idempotency key.
- The v0.1 starting matrix is: OTP 5 per 15 minutes per destination, 10 per 24 hours per account, 60-second resend cooldown, and 5 failed verification attempts; login/recovery 10 per 15 minutes per account and 30 per 15 minutes per IP; payment/refund 30 per minute per organization; privileged admin mutation 60 per minute per actor; gate scan 30 requests per second burst and 600 per minute per registered device; export/import 5 per minute per organization. Provider or security evidence may tighten these values.

## 13. Security and privacy rules

- Use HTTPS and strict transport security in deployed environments.
- Browser sessions use secure HttpOnly SameSite cookies and rotating refresh credentials. Access is 15 minutes, refresh is 30 days, recovery links are 24 hours, and revocation is immediate. KREW and internal service calls use short-lived bearer access tokens; privileged KREW, finance, and organization-admin actions require MFA.
- Keep bearer tokens and cookies out of browser URLs, referrers, analytics, and server logs. The frontend calls the backend through `@krowds/api`.
- Derive organization scope from the authenticated membership and RLS context. Never trust `X-Organization-ID` as authorization.
- Apply field-level authorization to legal, financial, identity, and KREW data. Ordinary ticket holders can see only their own ticket and holder-safe display information.
- Treat QR payloads and activation codes as write-only secrets. Do not return them in list, detail, error, or webhook responses.
- Store no plaintext QR token in PostgreSQL. The token is 16 cryptographically random bytes (128 bits) encoded as unpadded base64url, hashed at rest, status-bound, revocable, and PII-free.
- Redact credential fields, identity numbers, email addresses where not needed, payment secrets, and provider signatures from logs and traces.
- KROWDS never accepts or stores raw card data; Xendit payment data remains tokenized at the provider boundary.
- A minor ticket holder requires a verified guardian relationship and consent before purchase or access.
- Require a permission and an auditable reason for payment, refund, role, identity, binding, activation, revocation, private-file, and cross-organization actions.
- Apply request-size, collection-size, and rate limits to uploads, imports, scans, and cursor endpoints.
- The access endpoint is online-only. A failed dependency returns `access_error`; it shall not fall back to an offline authorization or cached grant.
- Cloud Run serves the API, Memorystore coordinates short-lived locks and idempotency, Cloud Tasks carries asynchronous work, Cloud Scheduler runs expiry and reconciliation, and BigQuery receives redacted audit data. Cloud Logging, Monitoring, and Error Reporting receive redacted operational signals. These infrastructure services do not change the `/api/v1` contract.

## 14. OpenAPI plan

`KROWDS-API-REQ-001` — KROWDS shall maintain an OpenAPI 3.1.0 description for the `/api/v1` surface.

The OpenAPI plan is:

1. Define reusable security schemes for the browser secure HttpOnly session cookie and internal bearer access tokens, with explicit security overrides for health and verified webhooks.
2. Define schemas for UUIDv7 IDs, RFC 3339 UTC instants, money, enums, RFC 7807 problems, cursor pages, idempotency headers, and ETag headers.
3. Give every operation a stable `operationId` beginning with `KROWDS-API-OP-` or `KROWDS-API-WH-`, matching this contract’s operation IDs.
4. Document request and response schemas, examples, permissions, cursor filters, rate-limit responses, and state-dependent errors.
5. Describe the Xendit, Biteship, and Resend webhook paths with raw-body signature requirements and provider event schemas kept separate from browser-facing schemas.
6. Mark fields that are write-only credentials and prohibit schema generation of plaintext QR token storage.
7. Validate the OpenAPI document in CI and run contract tests for status codes, headers, error shapes, cursor behavior, idempotency, and webhook verification.
8. Require a deprecation window and a new URI version for a breaking change. Additive fields are allowed only when existing clients can ignore them safely.

The generated description is a delivery artifact; this document remains the human-readable contract until the OpenAPI file is approved. The v0.1 API policy is: backward-compatible additive changes remain in `/api/v1`; a breaking path, field, or state change requires a new major URI version; and a deprecation window of 90 days is required before removal.

## 15. Compatibility and change log

| Version | Date | Change | Compatibility | Owner |
| --- | --- | --- | --- | --- |
| `0.1` | `2026-09-24` | Established `/api/v1`, RFC 7807, cursor pagination, request IDs, idempotency, verified Xendit/Biteship/Resend webhooks, exceptional-refund review and KREW wristband revocation operations, OpenAPI 3.1 delivery plan, 90-day deprecation policy, and the confirmed data boundary | Baseline | Backend API Lead (TBD) |
| Future | TBD | New fields or operations | Non-breaking only after contract review | Backend API Lead (TBD) |
| Future | TBD | Breaking path, field, or state change | New API version required; 90-day deprecation window | Backend API Lead (TBD) |

## 16. Related documents

- [Canonical English product target](../01-product/PRODUCT-VISION.md)
- [Data model](DATA-MODEL.md)
- [State machines](STATE-MACHINES.md)
- [Glossary](../01-product/GLOSSARY.md)
- [Product and operational context](../01-product/KROWDS.md)
- [Documentation index](../INDEX.md)
- [Open decisions and release gates](../00-governance/OPEN-DECISIONS.md)
