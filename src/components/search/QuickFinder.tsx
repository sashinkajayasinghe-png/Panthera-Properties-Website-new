"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PropertyType } from "@prisma/client";
import { PROPERTY_TYPE_LABEL, PROPERTY_TYPES } from "@/lib/constants";
import { filtersToQuery } from "@/lib/search";
import { PRICE_STEPS, priceLabel } from "./price";

/** Compact type + price search that opens the filtered property listings. */
export function QuickFinder() {
  const router = useRouter();
  const [type, setType] = useState<PropertyType | "">("");
  const [minPrice, setMin] = useState("");
  const [maxPrice, setMax] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const qs = filtersToQuery({
      types: type ? [type] : [],
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });
    router.push(qs ? `/properties?${qs}` : "/properties");
  };

  return (
    <form onSubmit={submit} className="grid gap-5" aria-label="Find a property">
      <label className="block">
        <span className="label">Property type</span>
        <select className="field" value={type} onChange={(e) => setType(e.target.value as PropertyType | "")}>
          <option value="">All property types</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t} value={t}>{PROPERTY_TYPE_LABEL[t]}</option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="label">Min price</span>
          <select className="field" value={minPrice} onChange={(e) => setMin(e.target.value)}>
            <option value="">No min</option>
            {PRICE_STEPS.map((v) => (
              <option key={v} value={v}>{priceLabel(v)}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Max price</span>
          <select className="field" value={maxPrice} onChange={(e) => setMax(e.target.value)}>
            <option value="">No max</option>
            {PRICE_STEPS.map((v) => (
              <option key={v} value={v}>{priceLabel(v)}</option>
            ))}
          </select>
        </label>
      </div>
      <button type="submit" className="btn btn-solid mt-2 w-full">Find properties</button>
    </form>
  );
}
