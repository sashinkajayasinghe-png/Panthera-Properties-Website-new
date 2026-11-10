"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FadeUp, RevealLines } from "@/components/motion/Reveal";

export type HoodLite = { slug: string; name: string; tagline: string | null; imageUrl: string | null; count: number };

export function NeighborhoodShowcase({ hoods }: { hoods: HoodLite[] }) {
  const [active, setActive] = useState(0);
  const colombo = hoods.filter((h) => h.slug.startsWith("colombo-"));
  const suburbs = hoods.filter((h) => !h.slug.startsWith("colombo-"));
  const current = hoods[active];

  const item = (h: HoodLite) => {
    const i = hoods.indexOf(h);
    return (
      <li key={h.slug}>
        <Link
          href={`/neighborhoods/${h.slug}`}
          onMouseEnter={() => setActive(i)}
          onFocus={() => setActive(i)}
          className={`group flex items-baseline justify-between gap-4 border-b border-line py-3 transition-colors duration-500 ${
            active === i ? "text-ivory" : "text-ivory/45 hover:text-ivory"
          }`}
        >
          <span className="shrink-0 whitespace-nowrap font-serif text-[clamp(1.6rem,2.2vw,2.3rem)] font-light leading-tight transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:translate-x-3">
            {h.name}
          </span>
          {h.tagline ? (
            <span className="hidden min-w-0 truncate text-right text-[0.6rem] uppercase tracking-[0.2em] text-mist sm:block">
              {h.tagline}
            </span>
          ) : null}
        </Link>
      </li>
    );
  };

  return (
    <section className="bg-ink py-28 md:py-40" aria-label="Neighbourhoods">
      <div className="container-x">
        <FadeUp className="mb-8 flex items-center gap-4">
          <span className="eyebrow text-gold">04</span>
          <span className="h-px w-16 bg-line" />
          <span className="eyebrow">Neighbourhoods</span>
        </FadeUp>
        <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <RevealLines text={"Know the city,\nstreet by street"} className="display text-[clamp(2.4rem,6vw,6rem)]" />
          <FadeUp className="max-w-sm text-sm leading-relaxed text-mist">
            From Colombo 01 to the coast at Mount Lavinia — explore the neighbourhoods we know and the homes available in each.
          </FadeUp>
        </div>

        <div className="grid gap-12 lg:grid-cols-12">
          <div className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-28 aspect-[4/5] overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                {current?.imageUrl ? (
                  <motion.div
                    key={current.slug}
                    className="absolute inset-0"
                    initial={{ clipPath: "inset(0 0 100% 0)", scale: 1.15 }}
                    animate={{ clipPath: "inset(0 0 0% 0)", scale: 1 }}
                    exit={{ opacity: 0.4 }}
                    transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
                  >
                    <Image src={current.imageUrl} alt="" fill sizes="40vw" className="object-cover" />
                  </motion.div>
                ) : null}
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
              {current ? (
                <div className="absolute inset-x-6 bottom-6">
                  {current.tagline ? <p className="eyebrow mb-2 text-gold">{current.tagline}</p> : null}
                  <p className="display text-5xl">{current.name}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.22em] text-ivory/70">
                    {current.count} {current.count === 1 ? "listing" : "listings"} →
                  </p>
                </div>
              ) : null}
              <p className="absolute right-4 top-4 text-[0.55rem] uppercase tracking-[0.2em] text-ivory/50">Illustrative imagery</p>
            </div>
          </div>

          <div className="grid gap-x-10 gap-y-12 md:grid-cols-2 lg:col-span-7">
            <div>
              <p className="eyebrow mb-4">City of Colombo</p>
              <ul>{colombo.map(item)}</ul>
            </div>
            <div>
              <p className="eyebrow mb-4">Greater Colombo</p>
              <ul>{suburbs.map(item)}</ul>
              <Link href="/neighborhoods" className="btn mt-10">All neighbourhoods</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
