"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CATEGORIES } from "@/lib/constants";
import { FadeUp, RevealLines } from "@/components/motion/Reveal";

export function Categories({ counts }: { counts: Record<string, number> }) {
  const [active, setActive] = useState(0);
  return (
    <section className="bg-ink pb-28 md:pb-40" aria-label="Property collections">
      <div className="container-x mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
        <div>
          <FadeUp className="mb-8 flex items-center gap-4">
            <span className="eyebrow text-gold">02</span>
            <span className="h-px w-16 bg-line" />
            <span className="eyebrow">Collections</span>
          </FadeUp>
          <RevealLines text={"Four ways\nto find your place"} className="display text-[clamp(2.4rem,6vw,6rem)]" />
        </div>
        <FadeUp className="max-w-sm text-sm leading-relaxed text-mist">
          From sky-high residences to quiet garden plots — each collection opens a curated, filtered view of our listings.
        </FadeUp>
      </div>

      {/* Desktop: expanding panels */}
      <div className="container-x hidden h-[78vh] min-h-[560px] gap-2 lg:flex">
        {CATEGORIES.map((c, i) => {
          const on = active === i;
          return (
            <Link
              key={c.slug}
              href={`/collections/${c.slug}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              data-cursor="Explore"
              className="group relative overflow-hidden transition-[flex-grow] duration-[1100ms] ease-[var(--ease-cine)]"
              style={{ flexGrow: on ? 4.2 : 1, flexBasis: 0 }}
              aria-label={`${c.title} — ${counts[c.slug] ?? 0} listings`}
            >
              <Image
                src={c.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                className={`object-cover transition-[transform,filter] duration-[1400ms] ease-[var(--ease-out-soft)] ${
                  on ? "scale-100 grayscale-0" : "scale-110 grayscale-[60%]"
                }`}
              />
              <div className={`absolute inset-0 transition-colors duration-700 ${on ? "bg-ink/25" : "bg-ink/60"}`} />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/25 to-transparent" />
              <span className="absolute left-6 top-6 font-sans text-xs tracking-[0.2em] text-ivory/70">0{i + 1}</span>
              <span
                className={`absolute bottom-8 left-6 origin-bottom-left whitespace-nowrap font-serif text-3xl font-light transition-all duration-700 ${
                  on ? "pointer-events-none opacity-0" : "-rotate-90 translate-x-8 opacity-100"
                }`}
                aria-hidden
              >
                {c.title}
              </span>
              <div
                className={`absolute inset-x-8 bottom-8 transition-all duration-700 ease-[var(--ease-out-soft)] ${
                  on ? "translate-y-0 opacity-100 delay-300" : "translate-y-8 opacity-0"
                }`}
              >
                <p className="eyebrow mb-3 text-gold">{c.eyebrow}</p>
                <h3 className="display text-[clamp(2.6rem,4.4vw,4.8rem)]">{c.title}</h3>
                <div className="mt-5 flex max-w-xl items-end justify-between gap-8">
                  <p className="text-sm leading-relaxed text-ivory/75">{c.description}</p>
                  <span className="shrink-0 text-xs uppercase tracking-[0.24em]">
                    {counts[c.slug] ?? 0} listed →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Mobile & tablet: stacked cards */}
      <div className="container-x grid gap-3 sm:grid-cols-2 lg:hidden">
        {CATEGORIES.map((c, i) => (
          <Link key={c.slug} href={`/collections/${c.slug}`} className="group relative aspect-[4/5] overflow-hidden sm:aspect-[3/4]">
            <Image src={c.image} alt="" fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
            <span className="absolute left-5 top-5 text-xs tracking-[0.2em] text-ivory/70">0{i + 1}</span>
            <div className="absolute inset-x-5 bottom-5">
              <p className="eyebrow mb-2 text-gold">{c.eyebrow}</p>
              <h3 className="display text-4xl">{c.title}</h3>
              <p className="mt-3 text-xs uppercase tracking-[0.24em] text-ivory/80">{counts[c.slug] ?? 0} listed →</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
