"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { LISTING_STATUS_LABEL, LISTING_STATUSES, PROPERTY_TYPE_LABEL, PROPERTY_TYPES, SORT_OPTIONS } from "@/lib/constants";
import { filtersToQuery, type SearchFilters as Filters } from "@/lib/search";
import { PRICE_STEPS, priceLabel } from "./price";

type Hood = { slug: string; name: string };

export function SearchFilters({ initial, hoods, total }: { initial: Filters; hoods: Hood[]; total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const [f, setF] = useState<Filters>(initial);
  const [more, setMore] = useState(
    initial.beds != null || initial.baths != null || initial.status != null || initial.minArea != null || initial.maxArea != null || initial.minLand != null || initial.maxLand != null,
  );
  const [pending, start] = useTransition();

  useEffect(() => setF(initial), [initial]);

  const apply = (next: Filters) => {
    setF(next);
    const qs = filtersToQuery({ ...next, page: 1 });
    start(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => apply({ ...f, [k]: v });
  const toggleType = (t: Filters["types"][number]) =>
    set("types", f.types.includes(t) ? f.types.filter((x) => x !== t) : [...f.types, t]);
  const numInput = (k: keyof Filters) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    set(k, (e.target.value === "" ? undefined : Number(e.target.value)) as never);

  const showLand = f.types.length === 0 || f.types.some((t) => ["LAND", "HOUSE", "VILLA", "COMMERCIAL"].includes(t));
  const activeCount = [f.types.length, f.location, f.minPrice, f.maxPrice, f.beds, f.baths, f.minArea, f.maxArea, f.minLand, f.maxLand, f.status].filter(
    (v) => (typeof v === "number" ? v > 0 : Boolean(v)),
  ).length;

  return (
    <div className="border-y border-line" aria-busy={pending}>
      {/* Property type */}
      <div className="flex flex-wrap items-center gap-2 py-5">
        <span className="label mr-2">Property type</span>
        <button type="button" className="chip" aria-pressed={f.types.length === 0} onClick={() => set("types", [])}>
          All
        </button>
        {PROPERTY_TYPES.map((t) => (
          <button key={t} type="button" className="chip" aria-pressed={f.types.includes(t)} onClick={() => toggleType(t)}>
            {PROPERTY_TYPE_LABEL[t]}
          </button>
        ))}
      </div>

      {/* Price, location and sort — always visible */}
      <div className="grid gap-x-8 gap-y-6 border-t border-line py-6 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] lg:items-end">
        <label className="block">
          <span className="label">Min price</span>
          <select className="field" value={f.minPrice ?? ""} onChange={numInput("minPrice")}>
            <option value="">No minimum</option>
            {PRICE_STEPS.map((v) => (
              <option key={v} value={v}>{priceLabel(v)}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Max price</span>
          <select className="field" value={f.maxPrice ?? ""} onChange={numInput("maxPrice")}>
            <option value="">No maximum</option>
            {PRICE_STEPS.map((v) => (
              <option key={v} value={v}>{priceLabel(v)}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Location</span>
          <select className="field" value={f.location ?? ""} onChange={(e) => set("location", e.target.value || undefined)}>
            <option value="">All locations</option>
            {hoods.map((h) => (
              <option key={h.slug} value={h.slug}>{h.name}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Sort by</span>
          <select className="field" value={f.sort} onChange={(e) => set("sort", e.target.value as Filters["sort"])}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
        <button type="button" className="btn min-h-0 px-4 py-2.5" aria-expanded={more} aria-controls="more-filters" onClick={() => setMore((o) => !o)}>
          {more ? "Fewer filters" : "More filters"}
        </button>
      </div>

      <div id="more-filters" hidden={!more} className="grid gap-x-8 gap-y-6 border-t border-line py-6 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="label">Bedrooms</span>
          <select className="field" value={f.beds ?? ""} onChange={numInput("beds")}>
            <option value="">Any</option>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>{n}+</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Bathrooms</span>
          <select className="field" value={f.baths ?? ""} onChange={numInput("baths")}>
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}+</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Sale status</span>
          <select className="field" value={f.status ?? ""} onChange={(e) => set("status", (e.target.value || undefined) as Filters["status"])}>
            <option value="">Any status</option>
            {LISTING_STATUSES.map((s) => (
              <option key={s} value={s}>{LISTING_STATUS_LABEL[s]}</option>
            ))}
          </select>
        </label>
        <RangeInputs label="Floor area (sq ft)" min={f.minArea} max={f.maxArea} onCommit={(a, b) => apply({ ...f, minArea: a, maxArea: b })} />
        {showLand ? (
          <RangeInputs label="Land extent (perches)" min={f.minLand} max={f.maxLand} onCommit={(a, b) => apply({ ...f, minLand: a, maxLand: b })} />
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-line py-4">
        <p className="text-sm text-mist" aria-live="polite">
          {pending ? "Updating…" : `${total} ${total === 1 ? "property" : "properties"} found`}
        </p>
        {activeCount ? (
          <button
            type="button"
            className="link-underline text-xs uppercase tracking-[0.2em]"
            onClick={() => apply({ types: [], sort: f.sort, page: 1, category: f.category })}
          >
            Clear filters
          </button>
        ) : null}
      </div>
    </div>
  );
}

function RangeInputs({ label, min, max, onCommit }: { label: string; min?: number; max?: number; onCommit: (a?: number, b?: number) => void }) {
  const [a, setA] = useState(min?.toString() ?? "");
  const [b, setB] = useState(max?.toString() ?? "");
  useEffect(() => {
    setA(min?.toString() ?? "");
    setB(max?.toString() ?? "");
  }, [min, max]);
  const commit = () => {
    const na = a === "" ? undefined : Number(a);
    const nb = b === "" ? undefined : Number(b);
    if (na !== min || nb !== max) onCommit(na, nb);
  };
  return (
    <fieldset className="block">
      <legend className="label">{label}</legend>
      <div className="flex gap-3">
        <input
          className="field"
          inputMode="numeric"
          type="number"
          min={0}
          placeholder="Min"
          aria-label={`${label} minimum`}
          value={a}
          onChange={(e) => setA(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && commit()}
        />
        <input
          className="field"
          inputMode="numeric"
          type="number"
          min={0}
          placeholder="Max"
          aria-label={`${label} maximum`}
          value={b}
          onChange={(e) => setB(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && commit()}
        />
      </div>
    </fieldset>
  );
}
