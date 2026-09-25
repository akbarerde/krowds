export const organizationRoles = [
  "organization_owner_admin",
  "finance",
  "ticketing",
  "cashier",
  "redemption",
  "gate",
  "viewer",
] as const;

export type OrganizationRole = (typeof organizationRoles)[number];
export type MembershipStatus =
  | "invited"
  | "active"
  | "suspended"
  | "revoked"
  | "declined"
  | "expired";
export type OrganizationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "revision_required"
  | "approved"
  | "rejected"
  | "suspended"
  | "closed";
export type InvitationStatus =
  | "awaiting_acceptance"
  | "accepted"
  | "declined"
  | "expired"
  | "invalidated";
export type DocumentStatus = "verified" | "pending_review" | "replacement_required";

export interface MembershipFixture {
  id: string;
  memberLabel: string;
  role: OrganizationRole;
  status: MembershipStatus;
  lastDecision: string;
  effectiveAccess: "available" | "blocked" | "historical";
}

export interface InvitationFixture {
  id: string;
  inviteeLabel: string;
  role: OrganizationRole;
  status: InvitationStatus;
  expires: string;
}

export interface DocumentFixture {
  id: string;
  category: string;
  objectReference: string;
  status: DocumentStatus;
  reviewedAt: string;
}

export interface OnboardingStateFixture {
  status: OrganizationStatus;
  label: string;
  meaning: string;
  organizationAction: string;
  operationalAccess: "blocked" | "read_only" | "available";
}

// Synthetic UI fixtures only. They contain no production or restricted values.
export const organizationFixture = {
  id: "org_fixture_7f3a",
  displayName: "Northstar Visitor Operations",
  verificationStatus: "under_review" satisfies OrganizationStatus,
  membership: {
    role: "organization_owner_admin" satisfies OrganizationRole,
    status: "active" satisfies MembershipStatus,
  },
  effectiveAccess: "blocked" as const,
  reviewSla: "Two-business-day target",
  submittedVersion: 3,
  defaultTimeZone: "Asia/Jakarta",
} as const;

export const onboardingStates = [
  {
    status: "draft",
    label: "Draft",
    meaning: "Organization data can be edited; operations remain unavailable.",
    organizationAction: "Complete required fields and supporting evidence.",
    operationalAccess: "blocked",
  },
  {
    status: "submitted",
    label: "Submitted",
    meaning: "A frozen submission is waiting for KREW to claim it.",
    organizationAction: "Wait for review; no resubmission is available.",
    operationalAccess: "blocked",
  },
  {
    status: "under_review",
    label: "Under Review",
    meaning: "KREW is checking the submitted version.",
    organizationAction: "Wait for the reviewer decision.",
    operationalAccess: "blocked",
  },
  {
    status: "revision_required",
    label: "Revision Required",
    meaning: "A controlled correction request is available to the organization.",
    organizationAction: "Correct the requested fields and resubmit.",
    operationalAccess: "blocked",
  },
  {
    status: "approved",
    label: "Approved",
    meaning: "Scoped operations may be used by active memberships.",
    organizationAction: "Operate within backend-authorized role and tenant scope.",
    operationalAccess: "available",
  },
  {
    status: "rejected",
    label: "Rejected",
    meaning: "The submission is closed until an authorized KREW reopen occurs.",
    organizationAction: "No organization-side transition is available.",
    operationalAccess: "blocked",
  },
  {
    status: "suspended",
    label: "Suspended",
    meaning: "Operational access is temporarily withdrawn without deleting history.",
    organizationAction: "Operations and affected sessions must remain blocked.",
    operationalAccess: "blocked",
  },
  {
    status: "closed",
    label: "Closed",
    meaning: "The organization is read-only except approved closure workflows.",
    organizationAction: "No operational mutation is available.",
    operationalAccess: "read_only",
  },
] as const satisfies readonly OnboardingStateFixture[];

export const requiredOnboardingCategories = [
  "Legal entity",
  "Registration reference",
  "Representative reference",
  "Tax identifier",
  "Business address",
  "Bank verification reference",
  "Authorized signatory reference",
  "Private supporting objects",
] as const;

export const membershipFixtures = [
  {
    id: "mem_fixture_owner",
    memberLabel: "Owner administrator",
    role: "organization_owner_admin",
    status: "active",
    lastDecision: "Fixture: accepted",
    effectiveAccess: "blocked",
  },
  {
    id: "mem_fixture_finance",
    memberLabel: "Finance operator",
    role: "finance",
    status: "active",
    lastDecision: "Fixture: accepted",
    effectiveAccess: "blocked",
  },
  {
    id: "mem_fixture_ticketing",
    memberLabel: "Ticketing operator",
    role: "ticketing",
    status: "invited",
    lastDecision: "Fixture: invitation pending",
    effectiveAccess: "blocked",
  },
  {
    id: "mem_fixture_cashier",
    memberLabel: "Cashier operator",
    role: "cashier",
    status: "suspended",
    lastDecision: "Fixture: access withdrawn",
    effectiveAccess: "blocked",
  },
  {
    id: "mem_fixture_redemption",
    memberLabel: "Redemption operator",
    role: "redemption",
    status: "revoked",
    lastDecision: "Fixture: access revoked",
    effectiveAccess: "historical",
  },
  {
    id: "mem_fixture_gate",
    memberLabel: "Gate operator",
    role: "gate",
    status: "declined",
    lastDecision: "Fixture: invitation declined",
    effectiveAccess: "historical",
  },
  {
    id: "mem_fixture_viewer",
    memberLabel: "Read-only operator",
    role: "viewer",
    status: "expired",
    lastDecision: "Fixture: membership expired",
    effectiveAccess: "historical",
  },
] as const satisfies readonly MembershipFixture[];

export const invitationFixtures = [
  {
    id: "inv_fixture_01",
    inviteeLabel: "Ticketing invitee A",
    role: "ticketing",
    status: "awaiting_acceptance",
    expires: "Fixture: 24 hours remaining",
  },
  {
    id: "inv_fixture_02",
    inviteeLabel: "Viewer invitee B",
    role: "viewer",
    status: "accepted",
    expires: "Consumed",
  },
  {
    id: "inv_fixture_03",
    inviteeLabel: "Cashier invitee C",
    role: "cashier",
    status: "declined",
    expires: "Consumed",
  },
  {
    id: "inv_fixture_04",
    inviteeLabel: "Finance invitee D",
    role: "finance",
    status: "expired",
    expires: "Expired",
  },
  {
    id: "inv_fixture_05",
    inviteeLabel: "Redemption invitee E",
    role: "redemption",
    status: "invalidated",
    expires: "Invalidated",
  },
] as const satisfies readonly InvitationFixture[];

export const documentFixtures = [
  {
    id: "doc_fixture_01",
    category: "Registration support",
    objectReference: "obj_…91ac",
    status: "verified",
    reviewedAt: "Fixture review recorded",
  },
  {
    id: "doc_fixture_02",
    category: "Bank verification support",
    objectReference: "obj_…4d20",
    status: "pending_review",
    reviewedAt: "Awaiting KREW review",
  },
  {
    id: "doc_fixture_03",
    category: "Signatory declaration support",
    objectReference: "obj_…c873",
    status: "replacement_required",
    reviewedAt: "Controlled replacement requested",
  },
] as const satisfies readonly DocumentFixture[];

export const catalogFixture = {
  venue: {
    name: "Harbor Indoor Hall",
    status: "active",
  },
  event: {
    name: "Autumn Family Day",
    status: "draft",
  },
  products: [
    { name: "General admission", price: "IDR 75.000", status: "draft" },
    { name: "Session pass", price: "IDR 35.000", status: "draft" },
  ],
} as const;

export const ticketOrderStates = [
  "created",
  "pending_payment",
  "paid",
  "failed",
  "cancelled",
  "refunded",
] as const;

export const ticketStates = [
  "pending_payment",
  "issued",
  "reserved",
  "bound",
  "used",
  "expired",
  "cancelled",
  "refunded",
  "revoked",
] as const;

export const fulfillmentStates = [
  "paid",
  "revision_required",
  "verification_pending",
  "approved",
  "production",
  "quality_control",
  "shipped",
  "delivered",
  "batch_activated",
] as const;

export const reportFixtures = [
  {
    name: "Ticket sales",
    scope: "IDR ticket orders and settlement projection",
    state: "Awaiting approved organization and backend query",
  },
  {
    name: "Attendance",
    scope: "Single-use ticket and wristband outcomes",
    state: "Awaiting backend access decision data",
  },
  {
    name: "Fulfillment",
    scope: "Wristband order and batch reconciliation",
    state: "Awaiting tenant-scoped operational records",
  },
  {
    name: "Access review",
    scope: "Membership, invitation, and revocation evidence",
    state: "Awaiting authorized audit projection",
  },
] as const;
