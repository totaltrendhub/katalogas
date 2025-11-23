// lib/adUtils.js

// Bendra logika reklamos galiojimui ir datos formatavimui (Europe/Vilnius).

// LT data be laiko
const vilniusDateFormatter = new Intl.DateTimeFormat("lt-LT", {
  timeZone: "Europe/Vilnius",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// LT data su laiku
const vilniusDateTimeFormatter = new Intl.DateTimeFormat("lt-LT", {
  timeZone: "Europe/Vilnius",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

// Ar reklama laikoma aktyvia pagal valid_until
export function isAdActive(ad, now = new Date()) {
  if (!ad) return false;

  // Jei valid_until nėra – laikom aktyvia (backwards compatible)
  if (!ad.valid_until) return true;

  const d = new Date(ad.valid_until);
  if (Number.isNaN(d.getTime())) return true;

  return d.getTime() > now.getTime();
}

// Apskaičiuoja valid_until
export function computeValidUntil({
  explicit,
  baseDate,
  months,
  fallbackMonths = 12,
}) {
  if (explicit) {
    const d = new Date(explicit);
    if (!Number.isNaN(d.getTime())) {
      return d;
    }
  }

  const m =
    typeof months === "number" && Number.isFinite(months) && months > 0
      ? months
      : fallbackMonths;

  const base = baseDate ? new Date(baseDate) : new Date();
  if (Number.isNaN(base.getTime())) return null;

  const result = new Date(base.getTime());
  result.setMonth(result.getMonth() + m);
  return result;
}

// Formatuota data + laikas Lietuvos zonoje
export function formatVilniusDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return vilniusDateTimeFormatter.format(d);
}

// Formatuota data Lietuvos zonoje
export function formatVilniusDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return vilniusDateFormatter.format(d);
}

// Likęs laikas iki valid_until – grąžina label ir dienų skaičių
export function getRemainingTimeInfo(validUntil, now = new Date()) {
  if (!validUntil) return { label: "-", totalDays: null };

  const target = new Date(validUntil);
  if (Number.isNaN(target.getTime())) {
    return { label: "-", totalDays: null };
  }

  const diffMs = target.getTime() - now.getTime();
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs <= 0) {
    return { label: "Pasibaigusi", totalDays };
  }

  let remaining = totalDays;

  const years = Math.floor(remaining / 365);
  remaining = remaining % 365;

  const months = Math.floor(remaining / 30);
  remaining = remaining % 30;

  const days = remaining;

  const parts = [];
  if (years > 0) parts.push(`${years} m.`);
  if (months > 0) parts.push(`${months} mėn.`);
  if (days > 0 || parts.length === 0) parts.push(`${days} d.`);

  return {
    label: parts.join(" "),
    totalDays,
  };
}
