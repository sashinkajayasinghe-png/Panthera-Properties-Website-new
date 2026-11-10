import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getNeighborhoods } from "@/lib/queries";
import { PageHero } from "@/components/layout/PageHero";
import { FadeUp } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Neighbourhoods — Colombo 01 to 15 and Greater Colombo",
  description: "Explore Colombo's residential neighbourhoods — from Colombo 01 to 15, Rajagiriya, Battaramulla, Nawala, Dehiwala, Mount Lavinia and Nugegoda.",
  alternates: { canonical: "/neighborhoods" },
};

export default async function NeighborhoodsPage() {
  const [hoods, counts] = await Promise.all([
    getNeighborhoods(),
    prisma.property.groupBy({ by: ["neighborhoodId"], where: { published: true }, _count: true }),
  ]);
  const count = new Map(counts.map((c) => [c.neighborhoodId, c._count]));
  return (
    <>
      <PageHero
        eyebrow="Neighbourhoods"
        title={"Colombo,\nstreet by street"}
        intro="Every neighbourhood has its own rhythm. Choose one to see the properties we currently list there."
      />
      <section className="container-x grid gap-x-6 gap-y-12 pb-32 sm:grid-cols-2 lg:grid-cols-3">
        {hoods.map((h, i) => (
          <FadeUp key={h.id} delay={(i % 3) * 0.08}>
            <Link href={`/neighborhoods/${h.slug}`} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden bg-charcoal">
                {h.imageUrl ? (
                  <Image src={h.imageUrl} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover grayscale-[40%] transition-all duration-[1200ms] group-hover:scale-105 group-hover:grayscale-0" />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                <span className="absolute bottom-4 left-4 text-xs uppercase tracking-[0.2em] text-ivory/80">
                  {count.get(h.id) ?? 0} {count.get(h.id) === 1 ? "listing" : "listings"}
                </span>
              </div>
              {h.tagline ? <p className="eyebrow mt-5">{h.tagline}</p> : null}
              <h2 className={`font-serif text-4xl font-light transition-colors group-hover:text-gold ${h.tagline ? "mt-2" : "mt-5"}`}>{h.name}</h2>
            </Link>
          </FadeUp>
        ))}
      </section>
      <p className="container-x -mt-20 pb-24 text-xs text-mist">Neighbourhood imagery is illustrative.</p>
    </>
  );
}
