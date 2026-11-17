"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import type { PropertyCardData } from "@/lib/queries";
import { PROPERTY_TYPE_LABEL } from "@/lib/constants";
import { formatArea, formatLand, formatLKR } from "@/lib/format";
import { RevealLines } from "@/components/motion/Reveal";
import { SampleBadge, StatusBadge } from "@/components/property/Badges";
import { QuickFinder } from "@/components/search/QuickFinder";

export function Featured({ properties }: { properties: PropertyCardData[] }) {
  const track = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const targetX = useRef(0);
  const [edge, setEdge] = useState({ start: true, end: false });

  const moveTo = useCallback((x: number) => {
    const el = track.current;
    if (!el) return;
    targetX.current = Math.max(0, Math.min(x, el.scrollWidth - el.clientWidth));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) el.scrollLeft = targetX.current;
    else gsap.to(el, { scrollLeft: targetX.current, duration: 0.7, ease: "power3.out", overwrite: true });
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;

    // The page is never locked: the wheel only moves the gallery while the cursor is on a property
    // and the gallery is fully on screen, and hands back to the page at either end. Anywhere else,
    // and with the browser's scroll bar, the page scrolls normally.
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
      if ((e.target as HTMLElement).closest("[data-gallery-intro]")) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < -8 || rect.bottom > window.innerHeight + 8) return;
      if (!gsap.isTweening(el)) targetX.current = el.scrollLeft;
      const max = el.scrollWidth - el.clientWidth;
      if ((e.deltaY < 0 && targetX.current <= 1) || (e.deltaY > 0 && targetX.current >= max - 1)) return;
      e.preventDefault();
      e.stopPropagation();
      moveTo(targetX.current + (e.deltaMode === 1 ? e.deltaY * 40 : e.deltaY) * 1.4);
    };

    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      if (progress.current) progress.current.style.transform = `scaleX(${max > 0 ? Math.max(0.04, el.scrollLeft / max) : 1})`;
      const next = { start: el.scrollLeft <= 1, end: el.scrollLeft >= max - 1 };
      setEdge((cur) => (cur.start === next.start && cur.end === next.end ? cur : next));
    };

    onScroll();
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      gsap.killTweensOf(el);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [moveTo, properties.length]);

  if (!properties.length) return null;

  const page = (dir: 1 | -1) => {
    const el = track.current;
    if (el) moveTo(el.scrollLeft + dir * el.clientWidth * 0.6);
  };

  return (
    <section className="relative overflow-hidden bg-charcoal" aria-label="Featured properties">
      <div className="flex min-h-[100svh] flex-col justify-center py-24 lg:py-10">
        <div
          ref={track}
          className="no-scrollbar flex snap-x snap-mandatory items-stretch scroll-pl-5 gap-4 overflow-x-auto px-5 md:scroll-pl-[4vw] md:gap-8 md:px-[4vw] lg:snap-none"
        >
          <div data-gallery-intro className="flex w-[82vw] shrink-0 snap-start flex-col justify-between py-2 sm:w-[60vw] lg:w-[34vw] lg:pr-10">
            <div>
              <div className="mb-8 flex items-center gap-4">
                <span className="eyebrow text-gold">03</span>
                <span className="h-px w-16 bg-line" />
                <span className="eyebrow">Featured</span>
              </div>
              <RevealLines text={"Selected\nresidences"} className="display text-[clamp(2.8rem,5vw,5.2rem)]" />
            </div>
            <div className="mt-10 max-w-sm">
              <p className="eyebrow mb-5 text-gold">Find your property</p>
              <QuickFinder />
              <Link href="/properties" className="link-underline mt-6 inline-block text-xs uppercase tracking-[0.24em] text-mist hover:text-ivory">
                View all properties →
              </Link>
            </div>
          </div>

          {properties.map((p, i) => (
            <FeaturedCard key={p.id} p={p} index={i} />
          ))}

          <Link
            href="/properties"
            className="group flex w-[70vw] shrink-0 snap-start items-center justify-center border border-line sm:w-[40vw] lg:w-[26vw]"
            data-cursor="All"
          >
            <span className="display text-center text-5xl transition-colors group-hover:text-gold">
              All
              <br />
              properties →
            </span>
          </Link>
        </div>

        <div className="mt-8 flex items-center gap-6 px-5 md:px-[4vw]">
          <span className="relative block h-px flex-1 bg-line" aria-hidden>
            <span ref={progress} className="absolute inset-0 origin-left bg-gold" style={{ transform: "scaleX(0.04)" }} />
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => page(-1)}
              disabled={edge.start}
              aria-label="Previous properties"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ivory/30 transition-colors hover:border-gold hover:text-gold disabled:opacity-30"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => page(1)}
              disabled={edge.end}
              aria-label="Next properties"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ivory/30 transition-colors hover:border-gold hover:text-gold disabled:opacity-30"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedCard({ p, index }: { p: PropertyCardData; index: number }) {
  const img = p.images[0];
  const specs = [
    PROPERTY_TYPE_LABEL[p.type],
    p.bedrooms != null ? `${p.bedrooms} Bed` : null,
    p.bathrooms != null ? `${p.bathrooms} Bath` : null,
    formatArea(p.floorArea),
    p.type === "LAND" ? formatLand(p.landExtent) : null,
  ].filter(Boolean);

  return (
    <article className="group relative w-[82vw] shrink-0 snap-start sm:w-[60vw] lg:w-[48vw]" data-cursor="View">
      <Link href={`/properties/${p.slug}`} className="block" aria-label={`${p.title}, ${p.neighborhood.name}`}>
        <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[16/11] lg:h-[72vh] lg:aspect-auto">
          {img ? (
            <Image
              src={img.url}
              alt={img.alt || p.title}
              fill
              sizes="(min-width: 1024px) 48vw, 82vw"
              className="object-cover transition-transform duration-[1600ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.06]"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-ink/20 transition-opacity duration-700 group-hover:opacity-90" />
          <div className="absolute left-5 top-5 flex flex-wrap gap-2">
            {p.isSample ? <SampleBadge /> : null}
            <StatusBadge status={p.status} />
          </div>
          <span className="absolute right-5 top-5 text-xs tracking-[0.2em] text-ivory/80">
            {String(index + 1).padStart(2, "0")}
          </span>

          <div className="absolute inset-x-5 bottom-5 md:inset-x-8 md:bottom-8">
            <p className="eyebrow mb-3 text-ivory/80">{p.neighborhood.name}</p>
            <h3 className="display text-[clamp(2rem,3.4vw,3.6rem)]">{p.title}</h3>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
              <p className="font-serif text-2xl text-gold">{formatLKR(p.price, p.priceOnRequest)}</p>
              <span className="btn min-h-0 px-4 py-2.5 text-[0.62rem]">View property</span>
            </div>
            <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-700 ease-[var(--ease-out-soft)] group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr] max-lg:grid-rows-[1fr]">
              <ul className="flex flex-wrap gap-x-5 gap-y-1 overflow-hidden pt-4 text-xs uppercase tracking-[0.18em] text-ivory/75">
                {specs.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
