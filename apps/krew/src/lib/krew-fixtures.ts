export const krewCapabilities = [
  "operations",
  "production",
  "quality_control",
  "fulfillment",
  "support",
  "admin",
] as const;

export type KreCapability = (typeof krewCapabilities)[number];

export const organizationContext = {
  id: "org_fixture_01",
  name: "KROWDS demonstration organization",
  synthetic: true,
  source: "local_fixture",
} as const;

interface OrganizationScoped {
  readonly organizationId: typeof organizationContext.id;
}

export interface KrePrincipal extends OrganizationScoped {
  readonly id: string;
  readonly displayName: string;
  readonly role: "krew";
  readonly capabilities: readonly KreCapability[];
  readonly source: "local_fixture";
}

export const currentPrincipal = {
  id: "krew_fixture_01",
  displayName: "Fixture operator",
  organizationId: organizationContext.id,
  role: "krew",
  capabilities: krewCapabilities,
  source: "local_fixture",
} as const satisfies KrePrincipal;

export interface WorkspaceNavigationItem {
  readonly label: string;
  readonly href: `/${string}` | "/";
  readonly description: string;
  readonly group: "Operate" | "Fulfillment" | "Assurance";
  readonly requiredCapability: KreCapability;
}

export const workspaceNavigation = [
  {
    label: "Overview",
    href: "/",
    description: "Current operational posture",
    group: "Operate",
    requiredCapability: "operations",
  },
  {
    label: "Queues",
    href: "/queues",
    description: "Role-scoped work intake",
    group: "Operate",
    requiredCapability: "operations",
  },
  {
    label: "Cases",
    href: "/cases",
    description: "Identity, order, and incident cases",
    group: "Operate",
    requiredCapability: "operations",
  },
  {
    label: "Orders",
    href: "/orders",
    description: "Wristband order verification",
    group: "Fulfillment",
    requiredCapability: "production",
  },
  {
    label: "Fulfillment",
    href: "/fulfillment",
    description: "Production batches and shipment",
    group: "Fulfillment",
    requiredCapability: "fulfillment",
  },
  {
    label: "Inventory",
    href: "/inventory",
    description: "Stock and reconciliation",
    group: "Fulfillment",
    requiredCapability: "operations",
  },
  {
    label: "Quality",
    href: "/quality",
    description: "Inspection and quarantine",
    group: "Assurance",
    requiredCapability: "quality_control",
  },
  {
    label: "Support",
    href: "/support",
    description: "Redacted customer operations",
    group: "Assurance",
    requiredCapability: "support",
  },
  {
    label: "Audit",
    href: "/audit",
    description: "Correlated evidence trail",
    group: "Assurance",
    requiredCapability: "admin",
  },
  {
    label: "Access controls",
    href: "/access",
    description: "Fail-closed privileged gates",
    group: "Assurance",
    requiredCapability: "admin",
  },
] as const satisfies readonly WorkspaceNavigationItem[];

export type QueueState = "attention" | "in_progress" | "clear";

export interface WorkQueue extends OrganizationScoped {
  readonly id: string;
  readonly label: string;
  readonly href: WorkspaceNavigationItem["href"];
  readonly count: number;
  readonly oldest: string;
  readonly state: QueueState;
  readonly requiredCapability: KreCapability;
}

export const workQueues = [
  {
    id: "queue_identity_review",
    organizationId: organizationContext.id,
    label: "Consumer identity review",
    href: "/cases",
    count: 3,
    oldest: "2h 14m",
    state: "attention",
    requiredCapability: "operations",
  },
  {
    id: "queue_order_review",
    organizationId: organizationContext.id,
    label: "Wristband order review",
    href: "/orders",
    count: 2,
    oldest: "48m",
    state: "in_progress",
    requiredCapability: "production",
  },
  {
    id: "queue_quality_control",
    organizationId: organizationContext.id,
    label: "Quality control",
    href: "/quality",
    count: 1,
    oldest: "31m",
    state: "attention",
    requiredCapability: "quality_control",
  },
  {
    id: "queue_fulfillment",
    organizationId: organizationContext.id,
    label: "Fulfillment exceptions",
    href: "/fulfillment",
    count: 1,
    oldest: "1h 06m",
    state: "in_progress",
    requiredCapability: "fulfillment",
  },
  {
    id: "queue_support",
    organizationId: organizationContext.id,
    label: "Support cases",
    href: "/support",
    count: 2,
    oldest: "3h 22m",
    state: "attention",
    requiredCapability: "support",
  },
  {
    id: "queue_audit_export",
    organizationId: organizationContext.id,
    label: "Restricted evidence exports",
    href: "/audit",
    count: 0,
    oldest: "—",
    state: "clear",
    requiredCapability: "admin",
  },
] as const satisfies readonly WorkQueue[];

export type CaseKind = "identity_review" | "order_exception" | "incident";
export type CaseStatus =
  | "pending"
  | "in_review"
  | "quality_control"
  | "waiting_on_organization"
  | "contained";

export interface OperationsCase extends OrganizationScoped {
  readonly id: string;
  readonly kind: CaseKind;
  readonly title: string;
  readonly status: CaseStatus;
  readonly severity: "normal" | "high";
  readonly owner: string | null;
  readonly updatedAt: string;
  readonly due: string;
  readonly correlationId: string;
  readonly evidenceCount: number;
  readonly redaction: readonly string[];
}

export const operationsCases = [
  {
    id: "CASE-FX-24091",
    organizationId: organizationContext.id,
    kind: "identity_review",
    title: "Manual identity review · subject KRW-FX-1042",
    status: "in_review",
    severity: "normal",
    owner: "Fixture operator",
    updatedAt: "2026-09-25T02:18:00Z",
    due: "5h 42m",
    correlationId: "req_fixture_01J2A8Q4M7",
    evidenceCount: 3,
    redaction: ["identity_number", "legal_name", "email"],
  },
  {
    id: "CASE-FX-24088",
    organizationId: organizationContext.id,
    kind: "order_exception",
    title: "Quantity reconciliation · WO-FX-1042",
    status: "quality_control",
    severity: "high",
    owner: "Fixture quality reviewer",
    updatedAt: "2026-09-25T02:11:00Z",
    due: "42m",
    correlationId: "req_fixture_01J2A6V2H9",
    evidenceCount: 6,
    redaction: ["shipping_address", "recipient_contact"],
  },
  {
    id: "CASE-FX-24072",
    organizationId: organizationContext.id,
    kind: "incident",
    title: "Late fulfillment provider callback",
    status: "contained",
    severity: "normal",
    owner: "Incident fixture team",
    updatedAt: "2026-09-25T01:42:00Z",
    due: "Monitoring",
    correlationId: "req_fixture_01J29ZC6P3",
    evidenceCount: 8,
    redaction: ["provider_signature", "provider_payload"],
  },
] as const satisfies readonly OperationsCase[];

export type WristbandOrderState =
  | "verification_pending"
  | "quality_control"
  | "shipped"
  | "delivered";

export interface WristbandOrder extends OrganizationScoped {
  readonly id: string;
  readonly state: WristbandOrderState;
  readonly quantity: number;
  readonly totalIdr: number;
  readonly paymentEvidence: "provider_verified" | "not_required";
  readonly batchIds: readonly string[];
  readonly updatedAt: string;
  readonly correlationId: string;
}

export const wristbandOrders = [
  {
    id: "WO-FX-1042",
    organizationId: organizationContext.id,
    state: "quality_control",
    quantity: 250,
    totalIdr: 18_750_000,
    paymentEvidence: "provider_verified",
    batchIds: ["BAT-FX-8801"],
    updatedAt: "2026-09-25T02:11:00Z",
    correlationId: "req_fixture_01J2A6V2H9",
  },
  {
    id: "WO-FX-1038",
    organizationId: organizationContext.id,
    state: "shipped",
    quantity: 120,
    totalIdr: 9_600_000,
    paymentEvidence: "provider_verified",
    batchIds: ["BAT-FX-8794"],
    updatedAt: "2026-09-24T23:48:00Z",
    correlationId: "req_fixture_01J28ZK1F6",
  },
] as const satisfies readonly WristbandOrder[];

export type BatchState =
  | "quality_control"
  | "quarantined"
  | "shipped"
  | "delivered";

export interface FulfillmentBatch extends OrganizationScoped {
  readonly id: string;
  readonly orderId: string;
  readonly state: BatchState;
  readonly quantity: number;
  readonly material: string;
  readonly quality: "pending" | "passed" | "quarantined";
  readonly productionFile: "not_requested" | "issued" | "expired";
  readonly shipmentState: "not_ready" | "label_created" | "delivered";
  readonly updatedAt: string;
  readonly correlationId: string;
}

export const fulfillmentBatches = [
  {
    id: "BAT-FX-8801",
    organizationId: organizationContext.id,
    orderId: "WO-FX-1042",
    state: "quality_control",
    quantity: 250,
    material: "Synthetic woven material A",
    quality: "pending",
    productionFile: "not_requested",
    shipmentState: "not_ready",
    updatedAt: "2026-09-25T02:11:00Z",
    correlationId: "req_fixture_01J2A6V2H9",
  },
  {
    id: "BAT-FX-8794",
    organizationId: organizationContext.id,
    orderId: "WO-FX-1038",
    state: "quarantined",
    quantity: 120,
    material: "Synthetic woven material B",
    quality: "quarantined",
    productionFile: "expired",
    shipmentState: "not_ready",
    updatedAt: "2026-09-24T23:48:00Z",
    correlationId: "req_fixture_01J28ZK1F6",
  },
] as const satisfies readonly FulfillmentBatch[];

export interface InventorySnapshot extends OrganizationScoped {
  readonly totalProduced: number;
  readonly available: number;
  readonly allocated: number;
  readonly quarantined: number;
  readonly pendingQuality: number;
  readonly shipped: number;
  readonly unexplainedDelta: number;
  readonly asOf: string;
}

export const inventorySnapshot = {
  organizationId: organizationContext.id,
  totalProduced: 2_150,
  available: 1_180,
  allocated: 420,
  quarantined: 80,
  pendingQuality: 320,
  shipped: 150,
  unexplainedDelta: 0,
  asOf: "2026-09-25T02:20:00Z",
} as const satisfies InventorySnapshot;

export type QualityResult = "pending" | "passed" | "quarantined";

export interface QualityInspection extends OrganizationScoped {
  readonly id: string;
  readonly batchId: string;
  readonly check: string;
  readonly result: QualityResult;
  readonly inspector: string | null;
  readonly evidenceCount: number;
  readonly correlationId: string;
}

export const qualityInspections = [
  {
    id: "QC-FX-3108",
    organizationId: organizationContext.id,
    batchId: "BAT-FX-8801",
    check: "Material and quantity inspection",
    result: "pending",
    inspector: null,
    evidenceCount: 0,
    correlationId: "req_fixture_01J2A6V2H9",
  },
  {
    id: "QC-FX-3102",
    organizationId: organizationContext.id,
    batchId: "BAT-FX-8794",
    check: "Wristband code uniqueness sample",
    result: "quarantined",
    inspector: "Fixture quality reviewer",
    evidenceCount: 4,
    correlationId: "req_fixture_01J28ZK1F6",
  },
  {
    id: "QC-FX-3097",
    organizationId: organizationContext.id,
    batchId: "BAT-FX-8788",
    check: "QR scan sample",
    result: "passed",
    inspector: "Fixture quality reviewer",
    evidenceCount: 3,
    correlationId: "req_fixture_01J26QA8N2",
  },
] as const satisfies readonly QualityInspection[];

export type SupportStatus = "open" | "waiting_on_krew" | "resolved";

export interface SupportCase extends OrganizationScoped {
  readonly id: string;
  readonly subject: string;
  readonly status: SupportStatus;
  readonly priority: "normal" | "urgent";
  readonly owner: string | null;
  readonly updatedAt: string;
  readonly correlationId: string;
  readonly redaction: readonly string[];
}

export const supportCases = [
  {
    id: "SUP-FX-8402",
    organizationId: organizationContext.id,
    subject: "Reported wristband cannot be scanned",
    status: "waiting_on_krew",
    priority: "urgent",
    owner: "Fixture support reviewer",
    updatedAt: "2026-09-25T01:58:00Z",
    correlationId: "req_fixture_01J2A1ZP8K",
    redaction: ["identity_number", "email", "phone"],
  },
  {
    id: "SUP-FX-8396",
    organizationId: organizationContext.id,
    subject: "Delivery status needs reconciliation",
    status: "open",
    priority: "normal",
    owner: null,
    updatedAt: "2026-09-24T22:35:00Z",
    correlationId: "req_fixture_01J27YQ4M7",
    redaction: ["shipping_address", "recipient_contact"],
  },
  {
    id: "SUP-FX-8388",
    organizationId: organizationContext.id,
    subject: "Quantity clarification",
    status: "resolved",
    priority: "normal",
    owner: "Fixture support reviewer",
    updatedAt: "2026-09-24T19:12:00Z",
    correlationId: "req_fixture_01J25CT9V5",
    redaction: ["identity_number"],
  },
] as const satisfies readonly SupportCase[];

export type AuditOutcome = "allowed" | "denied" | "recorded";

export interface AuditEvent extends OrganizationScoped {
  readonly id: string;
  readonly occurredAt: string;
  readonly actor: string;
  readonly action: string;
  readonly target: string;
  readonly outcome: AuditOutcome;
  readonly reasonCode: string;
  readonly requestId: string;
  readonly traceId: string;
  readonly redactions: readonly string[];
}

export const auditEvents = [
  {
    id: "AUD-FX-90218",
    organizationId: organizationContext.id,
    occurredAt: "2026-09-25T02:18:00Z",
    actor: "Fixture operator",
    action: "identity_review.claim",
    target: "CASE-FX-24091",
    outcome: "allowed",
    reasonCode: "QUEUE_WORK",
    requestId: "req_fixture_01J2A8Q4M7",
    traceId: "trace_fixture_01J2A8Q4M7",
    redactions: ["identity_number", "legal_name", "email"],
  },
  {
    id: "AUD-FX-90211",
    organizationId: organizationContext.id,
    occurredAt: "2026-09-25T02:11:00Z",
    actor: "Fixture quality reviewer",
    action: "quality_control.quarantine",
    target: "BAT-FX-8794",
    outcome: "recorded",
    reasonCode: "QC_SAMPLE_FAILED",
    requestId: "req_fixture_01J2A6V2H9",
    traceId: "trace_fixture_01J2A6V2H9",
    redactions: ["production_file", "qr_payload"],
  },
  {
    id: "AUD-FX-90194",
    organizationId: organizationContext.id,
    occurredAt: "2026-09-25T01:42:00Z",
    actor: "Incident fixture team",
    action: "fulfillment.incident_contain",
    target: "CASE-FX-24072",
    outcome: "allowed",
    reasonCode: "PROVIDER_CALLBACK_DELAY",
    requestId: "req_fixture_01J29ZC6P3",
    traceId: "trace_fixture_01J29ZC6P3",
    redactions: ["provider_signature", "provider_payload"],
  },
  {
    id: "AUD-FX-90172",
    organizationId: organizationContext.id,
    occurredAt: "2026-09-25T01:21:00Z",
    actor: "Policy fixture",
    action: "break_glass.request",
    target: "INC-FX-119",
    outcome: "denied",
    reasonCode: "DUAL_APPROVAL_MISSING",
    requestId: "req_fixture_01J295D8Q4",
    traceId: "trace_fixture_01J295D8Q4",
    redactions: ["requester_identity", "approval_notes"],
  },
] as const satisfies readonly AuditEvent[];

export type SensitiveControl =
  | "active_krew_role"
  | "mfa"
  | "step_up"
  | "dual_approval"
  | "auditable_reason"
  | "idempotency_key"
  | "if_match"
  | "incident_id"
  | "maximum_four_hours";

export type SensitiveGateState =
  | "backend_authorization_required"
  | "step_up_required"
  | "dual_approval_required"
  | "blocked_in_fixture";

export interface SensitiveActionGate extends OrganizationScoped {
  readonly id: string;
  readonly action: string;
  readonly capability: KreCapability;
  readonly state: SensitiveGateState;
  readonly controls: readonly SensitiveControl[];
  readonly outcome: string;
  readonly correlationId: string;
}

export const sensitiveActionGates = [
  {
    id: "gate_order_review",
    organizationId: organizationContext.id,
    action: "Approve wristband order",
    capability: "production",
    state: "backend_authorization_required",
    controls: ["active_krew_role", "mfa", "auditable_reason", "if_match"],
    outcome: "Blocked until the backend accepts the current role and row version.",
    correlationId: "req_fixture_gate_order_review",
  },
  {
    id: "gate_batch_activation",
    organizationId: organizationContext.id,
    action: "Activate delivered batch",
    capability: "admin",
    state: "step_up_required",
    controls: [
      "active_krew_role",
      "mfa",
      "step_up",
      "auditable_reason",
      "idempotency_key",
      "if_match",
    ],
    outcome: "Step-up assertion is missing; the browser cannot create it.",
    correlationId: "req_fixture_gate_batch_activation",
  },
  {
    id: "gate_restricted_export",
    organizationId: organizationContext.id,
    action: "Export restricted evidence",
    capability: "admin",
    state: "dual_approval_required",
    controls: [
      "active_krew_role",
      "mfa",
      "step_up",
      "dual_approval",
      "auditable_reason",
    ],
    outcome: "A second authorized approver is required by the backend.",
    correlationId: "req_fixture_gate_restricted_export",
  },
  {
    id: "gate_break_glass",
    organizationId: organizationContext.id,
    action: "Open break-glass access",
    capability: "admin",
    state: "blocked_in_fixture",
    controls: [
      "incident_id",
      "active_krew_role",
      "mfa",
      "step_up",
      "dual_approval",
      "auditable_reason",
      "maximum_four_hours",
    ],
    outcome: "Denied: incident, purpose, duration, and both approvals are absent.",
    correlationId: "req_fixture_gate_break_glass",
  },
] as const satisfies readonly SensitiveActionGate[];

export const authorityAssertions = {
  mfa: {
    state: "verified_in_fixture",
    verifiedAt: "2026-09-25T02:15:00Z",
    source: "backend_fixture_assertion",
  },
  stepUp: {
    state: "missing",
    source: "backend_fixture_assertion",
  },
  dualApproval: {
    state: "not_requested",
    source: "backend_fixture_assertion",
  },
  breakGlass: {
    state: "inactive",
    source: "backend_fixture_assertion",
  },
  browserMayAuthorize: false,
} as const;
