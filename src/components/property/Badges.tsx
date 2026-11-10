import type { ListingStatus } from "@prisma/client";
import { LISTING_STATUS_LABEL } from "@/lib/constants";

export function SampleBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 bg-ivory px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-ink ${className}`}
      title="Sample listing for testing — not a real property for sale"
    >
      Sample listing · not for sale
    </span>
  );
}

export function StatusBadge({ status, className = "" }: { status: ListingStatus; className?: string }) {
  if (status === "AVAILABLE") return null;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.18em] ${
        status === "SOLD" ? "bg-mist text-ink" : "bg-gold text-ink"
      } ${className}`}
    >
      {LISTING_STATUS_LABEL[status]}
    </span>
  );
}
