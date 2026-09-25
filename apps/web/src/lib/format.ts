const jakartaDateFormatter = new Intl.DateTimeFormat("en-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

const jakartaDateTimeFormatter = new Intl.DateTimeFormat("en-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Jakarta",
});

export function formatIdr(amountIdr: string) {
  const amount = BigInt(amountIdr);
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export function formatDate(value: string) {
  return jakartaDateFormatter.format(new Date(value));
}

export function formatDateTime(value: string) {
  return `${jakartaDateTimeFormatter.format(new Date(value))} WIB`;
}

export function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

export function formatDateRange(startsAt: string, endsAt: string) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const sameDay = start.toISOString().slice(0, 10) === end.toISOString().slice(0, 10);

  if (sameDay) {
    return `${formatDate(startsAt)} · ${formatTime(startsAt)}–${formatTime(endsAt)} WIB`;
  }

  return `${formatDate(startsAt)} – ${formatDate(endsAt)}`;
}
