import { parseISO } from "date-fns";

export function parseBackendDate(value) {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  if (typeof value !== "string") return new Date(value);

  // SQLite often returns naive datetime strings (no timezone suffix).
  // Backend writes UTC-like timestamps, so force UTC for correct "time ago".
  const withT = value.includes("T") ? value : value.replace(" ", "T");
  const hasTimezone = /([zZ]|[+-]\d{2}:\d{2})$/.test(withT);
  const normalized = hasTimezone ? withT : `${withT}Z`;
  const parsed = parseISO(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }
  return parsed;
}
