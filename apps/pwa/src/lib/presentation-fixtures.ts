export type EventFixture = Readonly<{
  id: string;
  name: string;
  dateLabel: string;
  venue: string;
}>;

export type TicketFixture = Readonly<{
  reference: string;
  eventId: string;
  holderLabel: string;
  ticketType: string;
  presentationStatus: "Illustrative only";
}>;

export type WristbandFixture = Readonly<{
  reference: string;
  ticketReference: string;
  presentationStatus: "Illustrative only";
  activationStatus: "Live backend required";
}>;

export type AccessPolicyFixture = Readonly<{
  deviceStatus: "Registration not connected";
  decisionSource: "Live KROWDS backend";
  offlineDecision: "No decision; fail closed";
  retryContract: "Not connected";
}>;

export const eventFixture = {
  id: "sample-summit-2026",
  name: "KROWDS Product Summit",
  dateLabel: "24 October 2026 · 09:00 WIB",
  venue: "Jakarta Exhibition Center · Hall A",
} as const satisfies EventFixture;

export const ticketFixture = {
  reference: "KROWDS •••• 4821",
  eventId: eventFixture.id,
  holderLabel: "Sample ticket holder",
  ticketType: "General admission",
  presentationStatus: "Illustrative only",
} as const satisfies TicketFixture;

export const wristbandFixture = {
  reference: "KRB-••••-21",
  ticketReference: ticketFixture.reference,
  presentationStatus: "Illustrative only",
  activationStatus: "Live backend required",
} as const satisfies WristbandFixture;

export const accessPolicyFixture = {
  deviceStatus: "Registration not connected",
  decisionSource: "Live KROWDS backend",
  offlineDecision: "No decision; fail closed",
  retryContract: "Not connected",
} as const satisfies AccessPolicyFixture;
