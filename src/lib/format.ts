const lkr = new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 });

/** Full LKR price, e.g. "LKR 85,000,000". */
export function formatLKR(value: number | null | undefined, onRequest = false) {
  if (onRequest || value == null) return "Price on request";
  return `LKR ${lkr.format(value)}`;
}

/** Compact LKR price, e.g. "LKR 85M" or "LKR 1.2B". */
export function formatLKRCompact(value: number | null | undefined, onRequest = false) {
  if (onRequest || value == null) return "Price on request";
  if (value >= 1_000_000_000) return `LKR ${trim(value / 1_000_000_000)}B`;
  if (value >= 1_000_000) return `LKR ${trim(value / 1_000_000)}M`;
  return `LKR ${lkr.format(value)}`;
}

const trim = (n: number) => (Math.round(n * 10) / 10).toString();

export const formatArea = (sqft?: number | null) => (sqft ? `${lkr.format(sqft)} sq ft` : null);
export const formatLand = (perches?: number | null) =>
  perches ? `${perches % 1 === 0 ? perches : perches.toFixed(1)} perches` : null;

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatDate(d: Date | string, withTime = false) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "Asia/Colombo",
  });
}
