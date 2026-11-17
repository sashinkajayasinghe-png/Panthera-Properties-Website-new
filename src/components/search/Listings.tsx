import Link from "next/link";
import type { PropertyCardData } from "@/lib/queries";
import { filtersToQuery, type SearchFilters } from "@/lib/search";
import { PropertyCard } from "@/components/property/PropertyCard";

export function ListingGrid({ items }: { items: PropertyCardData[] }) {
  return (
    <div className="grid gap-x-6 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
      {items.map((p, i) => (
        <PropertyCard key={p.id} p={p} priority={i < 3} />
      ))}
    </div>
  );
}

export function SampleNotice() {
  return (
    <p className="border border-gold/40 bg-gold/5 px-5 py-4 text-sm text-ivory/85">
      <strong className="font-semibold text-gold">Demonstration data.</strong> Listings marked “Sample listing · not for sale” are fictional
      test entries with illustrative stock photography. They are not available properties.
    </p>
  );
}

export function EmptyResults({ message = "No properties match these filters yet." }: { message?: string }) {
  return (
    <div className="border border-line px-6 py-16 text-center">
      <p className="display text-4xl">{message}</p>
      <p className="mx-auto mt-4 max-w-md text-sm text-mist">
        Tell us what you are looking for — we will let you know personally when a suitable property becomes available.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/contact?type=consultation" className="btn">Share your brief</Link>
        <Link href="/properties" className="btn btn-gold">View all properties</Link>
      </div>
    </div>
  );
}

export function Pagination({ filters, pages, basePath }: { filters: SearchFilters; pages: number; basePath: string }) {
  if (pages <= 1) return null;
  const href = (page: number) => {
    const qs = filtersToQuery({ ...filters, page });
    return qs ? `${basePath}?${qs}` : basePath;
  };
  return (
    <nav aria-label="Pagination" className="mt-20 flex items-center justify-center gap-2">
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <Link
          key={n}
          href={href(n)}
          aria-current={n === filters.page ? "page" : undefined}
          className={`flex h-11 w-11 items-center justify-center border text-sm transition-colors ${
            n === filters.page ? "border-gold text-gold" : "border-line text-mist hover:border-ivory hover:text-ivory"
          }`}
        >
          {n}
        </Link>
      ))}
    </nav>
  );
}
