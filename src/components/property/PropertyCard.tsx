"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { PropertyCardData } from "@/lib/queries";
import { PROPERTY_TYPE_LABEL } from "@/lib/constants";
import { formatArea, formatLand, formatLKR } from "@/lib/format";
import { SampleBadge, StatusBadge } from "./Badges";

export function PropertyCard({ p, priority }: { p: PropertyCardData; priority?: boolean }) {
  const [idx, setIdx] = useState(0);
  const [loaded, setLoaded] = useState(1); // only mount photos once the visitor browses to them
  const images = p.images;
  const count = images.length;
  const go = (d: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoaded(count);
    setIdx((i) => (i + d + count) % count);
  };

  const specs = [
    p.bedrooms != null ? `${p.bedrooms} bed` : null,
    p.bathrooms != null ? `${p.bathrooms} bath` : null,
    formatArea(p.floorArea),
    formatLand(p.landExtent),
  ].filter(Boolean) as string[];

  return (
    <article className="group relative">
      <div className="relative aspect-[4/3] overflow-hidden bg-charcoal">
        <Link href={`/properties/${p.slug}`} className="absolute inset-0" aria-label={`View ${p.title}`} data-cursor="View" tabIndex={-1}>
          {images.slice(0, loaded).map((img, i) => (
            <Image
              key={img.url}
              src={img.url}
              alt={img.alt || p.title}
              fill
              priority={priority && i === 0}
              loading={priority && i === 0 ? undefined : "lazy"}
              sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
              className={`object-cover transition-[opacity,transform] duration-[1200ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.04] ${
                i === idx ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-ink/30" />
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-2">
          {p.isSample ? <SampleBadge /> : null}
          <StatusBadge status={p.status} />
        </div>

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={go(-1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-ink/60 text-ivory opacity-0 backdrop-blur transition-opacity focus:opacity-100 group-hover:opacity-100 max-md:opacity-100"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={go(1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-ink/60 text-ivory opacity-0 backdrop-blur transition-opacity focus:opacity-100 group-hover:opacity-100 max-md:opacity-100"
            >
              ›
            </button>
            <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5" aria-hidden>
              {images.map((_, i) => (
                <span key={i} className={`h-px w-5 transition-colors ${i === idx ? "bg-ivory" : "bg-ivory/35"}`} />
              ))}
            </div>
          </>
        ) : null}
      </div>

      <Link href={`/properties/${p.slug}`} className="block pt-5">
        <div className="flex items-baseline justify-between gap-4">
          <p className="eyebrow">{p.neighborhood.name} · {PROPERTY_TYPE_LABEL[p.type]}</p>
        </div>
        <h3 className="mt-2 font-serif text-[1.75rem] font-light leading-tight transition-colors group-hover:text-gold">{p.title}</h3>
        <p className="mt-2 text-sm text-ivory/90">{formatLKR(p.price, p.priceOnRequest)}</p>
        {specs.length ? (
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs uppercase tracking-[0.14em] text-mist">
            {specs.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        ) : null}
      </Link>
    </article>
  );
}
