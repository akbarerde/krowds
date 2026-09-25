export type EventCategory =
  | "Arts & culture"
  | "Food & drink"
  | "Community"
  | "Wellness";

export type EventTone = "ink" | "sand" | "mist" | "clay";

export type TicketProductFixture = {
  id: string;
  name: string;
  description: string;
  amountIdr: string;
  availability: "Available" | "Selling fast" | "Sold out";
  remainingLabel: string;
};

export type EventSessionFixture = {
  id: string;
  label: string;
  startsAt: string;
  endsAt: string;
};

export type EventFixture = {
  id: string;
  slug: string;
  checkoutOrderId: string;
  title: string;
  organizer: string;
  category: EventCategory;
  tone: EventTone;
  startsAt: string;
  endsAt: string;
  venue: {
    name: string;
    city: string;
    address: string;
  };
  summary: string;
  description: string;
  accessibilityNote: string;
  saleWindow: string;
  ticketProducts: TicketProductFixture[];
  sessions: EventSessionFixture[];
  featured: boolean;
};

export type TicketStatus = "issued" | "used" | "pending";

export type TicketFixture = {
  id: string;
  ticketNumber: string;
  orderReference: string;
  eventSlug: string;
  eventTitle: string;
  eventStartsAt: string;
  venueName: string;
  venueCity: string;
  productName: string;
  holderName: string;
  status: TicketStatus;
  issuedAt: string;
};

export type PaymentStatus = "pending" | "paid" | "failed" | "expired";

export type PaymentMethod = "qris" | "virtual_account" | "approved_ewallet";

export type PaymentFixture = {
  orderId: string;
  eventSlug: string;
  eventTitle: string;
  amountIdr: string;
  method: PaymentMethod;
  status: PaymentStatus;
  provider: "Xendit";
  updatedAt: string;
  instructionExpiresAt: string | null;
  nextAction: string;
};

export type AccountFixture = {
  displayName: string;
  email: string;
  initials: string;
  identityLabel: string;
  membershipLabel: string;
  emailStatus: string;
  ticketCount: number;
  pendingOrderCount: number;
};

export const events: EventFixture[] = [
  {
    id: "evt-jkt-creative-week",
    slug: "jakarta-creative-week",
    checkoutOrderId: "KRW-ORD-1054",
    title: "Jakarta Creative Week 2026",
    organizer: "Ruang Raya",
    category: "Arts & culture",
    tone: "ink",
    startsAt: "2026-10-17T10:00:00+07:00",
    endsAt: "2026-10-19T18:00:00+07:00",
    venue: {
      name: "Jakarta Design Center",
      city: "Jakarta Selatan",
      address: "Jl. Senopati No. 8, Kebayoran Baru",
    },
    summary:
      "Three days of independent publishing, visual practice, and generous conversations.",
    description:
      "Jakarta Creative Week brings artists, publishers, and curious neighbors into one shared city block. Browse the programme, choose a day pass, and arrive with time to look closely.",
    accessibilityNote:
      "The venue has step-free entry and accessible restrooms. Contact the organizer for seating or sensory support.",
    saleWindow: "On sale until 16 October 2026, 21:00 WIB",
    ticketProducts: [
      {
        id: "tkt-jcw-day-pass",
        name: "Day pass",
        description: "Access to all installations and talks for one day.",
        amountIdr: "185000",
        availability: "Selling fast",
        remainingLabel: "Only 24 day passes left",
      },
      {
        id: "tkt-jcw-weekend-pass",
        name: "Weekend pass",
        description: "Access to the full three-day programme.",
        amountIdr: "425000",
        availability: "Available",
        remainingLabel: "Weekend passes available",
      },
    ],
    sessions: [
      {
        id: "ses-jcw-opening",
        label: "Opening day",
        startsAt: "2026-10-17T10:00:00+07:00",
        endsAt: "2026-10-17T18:00:00+07:00",
      },
      {
        id: "ses-jcw-weekend",
        label: "Weekend programme",
        startsAt: "2026-10-18T10:00:00+07:00",
        endsAt: "2026-10-19T18:00:00+07:00",
      },
    ],
    featured: true,
  },
  {
    id: "evt-ruang-kita-sound",
    slug: "ruang-kita-sound",
    checkoutOrderId: "KRW-ORD-1052",
    title: "Ruang Kita: A night of sound",
    organizer: "Ruang Kita Collective",
    category: "Arts & culture",
    tone: "clay",
    startsAt: "2026-09-27T19:00:00+07:00",
    endsAt: "2026-09-27T22:00:00+07:00",
    venue: {
      name: "Gudang Seni 14",
      city: "Jakarta Barat",
      address: "Jl. Setsupat No. 14, Kebon Jeruk",
    },
    summary:
      "A live set, a listening room, and a small stage for emerging sound makers.",
    description:
      "An intimate evening of live electronics, spoken word, and slow listening. The room is designed for a quiet, attentive audience; arrive early to settle in.",
    accessibilityNote:
      "The listening room is step-free. Ear protection is available at the venue on request.",
    saleWindow: "On sale until 27 September 2026, 18:00 WIB",
    ticketProducts: [
      {
        id: "tkt-rk-standard",
        name: "Standard entry",
        description: "One entry for the full evening programme.",
        amountIdr: "125000",
        availability: "Available",
        remainingLabel: "Entries available",
      },
    ],
    sessions: [
      {
        id: "ses-rk-evening",
        label: "Evening session",
        startsAt: "2026-09-27T19:00:00+07:00",
        endsAt: "2026-09-27T22:00:00+07:00",
      },
    ],
    featured: true,
  },
  {
    id: "evt-pulang-sore-market",
    slug: "pulang-sore-market",
    checkoutOrderId: "KRW-ORD-1051",
    title: "Pulang Sore Market",
    organizer: "Pulang Sore",
    category: "Food & drink",
    tone: "sand",
    startsAt: "2026-10-04T11:00:00+07:00",
    endsAt: "2026-10-04T20:00:00+07:00",
    venue: {
      name: "Warehouse 12",
      city: "Tangerang Selatan",
      address: "Jl. BSD Raya No. 12, BSD",
    },
    summary:
      "A Sunday market of good food, small makers, and things worth taking home.",
    description:
      "Pulang Sore brings together independent kitchens, homegrown labels, and a relaxed afternoon of tasting. Come hungry and leave with something for the week ahead.",
    accessibilityNote:
      "The market is outdoors on a level paved route. Vendor allergen details are available at each stall.",
    saleWindow: "On sale until 4 October 2026, 10:00 WIB",
    ticketProducts: [
      {
        id: "tkt-psm-entry",
        name: "Market entry",
        description: "General entry for the market and tasting areas.",
        amountIdr: "45000",
        availability: "Available",
        remainingLabel: "Entries available",
      },
    ],
    sessions: [
      {
        id: "ses-psm-sunday",
        label: "Sunday market",
        startsAt: "2026-10-04T11:00:00+07:00",
        endsAt: "2026-10-04T20:00:00+07:00",
      },
    ],
    featured: true,
  },
  {
    id: "evt-sunday-run-club",
    slug: "sunday-morning-run-club",
    checkoutOrderId: "KRW-ORD-1053",
    title: "Sunday morning run club",
    organizer: "Ruang Gerak",
    category: "Wellness",
    tone: "mist",
    startsAt: "2026-10-11T07:00:00+07:00",
    endsAt: "2026-10-11T09:00:00+07:00",
    venue: {
      name: "GBK Sports Hall",
      city: "Jakarta Selatan",
      address: "Jl. Pintu Besar Senayan, Gelora",
    },
    summary:
      "A friendly 5K loop with a warm-up, a short run, and coffee after.",
    description:
      "Start the Sunday slowly with a community 5K around the Gelora loop. All paces are welcome, and the route ends with coffee from a local roaster.",
    accessibilityNote:
      "The route uses paved paths and has rest points. Tell the organizer about mobility or sensory support needs before registering.",
    saleWindow: "On sale until 11 October 2026, 06:00 WIB",
    ticketProducts: [
      {
        id: "tkt-src-run",
        name: "Community run",
        description: "Run entry, warm-up, and post-run coffee.",
        amountIdr: "75000",
        availability: "Available",
        remainingLabel: "Places available",
      },
    ],
    sessions: [
      {
        id: "ses-src-loop",
        label: "Gelora 5K loop",
        startsAt: "2026-10-11T07:00:00+07:00",
        endsAt: "2026-10-11T09:00:00+07:00",
      },
    ],
    featured: false,
  },
];

export const tickets: TicketFixture[] = [
  {
    id: "tkt-fixture-001",
    ticketNumber: "KRW-7A2F-91Q",
    orderReference: "KRW-ORD-1048",
    eventSlug: "jakarta-creative-week",
    eventTitle: "Jakarta Creative Week 2026",
    eventStartsAt: "2026-10-17T10:00:00+07:00",
    venueName: "Jakarta Design Center",
    venueCity: "Jakarta Selatan",
    productName: "Day pass",
    holderName: "Ayu Pratama",
    status: "issued",
    issuedAt: "2026-09-20T14:22:00+07:00",
  },
  {
    id: "tkt-fixture-002",
    ticketNumber: "KRW-7B8C-22D",
    orderReference: "KRW-ORD-1042",
    eventSlug: "ruang-kita-sound",
    eventTitle: "Ruang Kita: A night of sound",
    eventStartsAt: "2026-09-27T19:00:00+07:00",
    venueName: "Gudang Seni 14",
    venueCity: "Jakarta Barat",
    productName: "Standard entry",
    holderName: "Ayu Pratama",
    status: "used",
    issuedAt: "2026-09-10T09:12:00+07:00",
  },
  {
    id: "tkt-fixture-003",
    ticketNumber: "KRW-7C4D-63M",
    orderReference: "KRW-ORD-1051",
    eventSlug: "pulang-sore-market",
    eventTitle: "Pulang Sore Market",
    eventStartsAt: "2026-10-04T11:00:00+07:00",
    venueName: "Warehouse 12",
    venueCity: "Tangerang Selatan",
    productName: "Market entry",
    holderName: "Ayu Pratama",
    status: "pending",
    issuedAt: "2026-09-24T16:40:00+07:00",
  },
];

export const payments: PaymentFixture[] = [
  {
    orderId: "KRW-ORD-1051",
    eventSlug: "pulang-sore-market",
    eventTitle: "Pulang Sore Market",
    amountIdr: "45000",
    method: "qris",
    status: "pending",
    provider: "Xendit",
    updatedAt: "2026-09-24T16:40:00+07:00",
    instructionExpiresAt: "2026-09-24T17:10:00+07:00",
    nextAction: "Complete the instruction through the approved payment provider page.",
  },
  {
    orderId: "KRW-ORD-1052",
    eventSlug: "ruang-kita-sound",
    eventTitle: "Ruang Kita: A night of sound",
    amountIdr: "125000",
    method: "approved_ewallet",
    status: "paid",
    provider: "Xendit",
    updatedAt: "2026-09-23T20:12:00+07:00",
    instructionExpiresAt: null,
    nextAction: "Provider verification is complete; ticket issuance is handled by the backend.",
  },
  {
    orderId: "KRW-ORD-1053",
    eventSlug: "sunday-morning-run-club",
    eventTitle: "Sunday morning run club",
    amountIdr: "75000",
    method: "virtual_account",
    status: "failed",
    provider: "Xendit",
    updatedAt: "2026-09-22T08:15:00+07:00",
    instructionExpiresAt: "2026-09-22T08:45:00+07:00",
    nextAction: "No ticket was issued. Start a new checkout to request another instruction.",
  },
  {
    orderId: "KRW-ORD-1054",
    eventSlug: "jakarta-creative-week",
    eventTitle: "Jakarta Creative Week 2026",
    amountIdr: "185000",
    method: "qris",
    status: "expired",
    provider: "Xendit",
    updatedAt: "2026-09-20T18:02:00+07:00",
    instructionExpiresAt: "2026-09-20T18:32:00+07:00",
    nextAction: "This instruction expired. Return to checkout to request a new one.",
  },
];

export const account: AccountFixture = {
  displayName: "Ayu Pratama",
  email: "demo.user@example.test",
  initials: "AP",
  identityLabel: "Demo identity context",
  membershipLabel: "Personal account",
  emailStatus: "Demo email verified",
  ticketCount: tickets.filter((ticket) => ticket.status === "issued").length,
  pendingOrderCount: payments.filter((payment) => payment.status === "pending").length,
};

export function getEventBySlug(slug: string) {
  return events.find((event) => event.slug === slug);
}

export function getPaymentByOrderId(orderId: string) {
  return payments.find((payment) => payment.orderId === orderId);
}
