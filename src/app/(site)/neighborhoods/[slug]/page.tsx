import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseFilters } from "@/lib/search";
import { countSamples, getNeighborhoods, searchProperties } from "@/lib/queries";
import { PageHero } from "@/components/layout/PageHero";
import { EmptyResults, ListingGrid, Pagination, SampleNotice } from "@/components/search/Listings";
import { PropertyMap } from "@/components/property/PropertyMap";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

const getHood = (slug: string) => prisma.neighborhood.findUnique({ where: { slug } });

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const h = await getHood((await params).slug);
  if (!h) return {};
  return {
    title: `Properties for sale in ${h.name}${h.tagline ? ` (${h.tagline})` : ""}`,
    description: `${h.description ?? ""} Browse apartments, houses, villas and land for sale in ${h.name} with Panthera Properties.`.trim(),
    alternates: { canonical: `/neighborhoods/${h.slug}` },
  };
}

export default async function NeighborhoodPage({ params, searchParams }: Props) {
  const h = await getHood((await params).slug);
  if (!h) notFound();
  const filters = parseFilters({ ...(await searchParams), location: h.slug });
  const [{ items, total, pages }, samples, all] = await Promise.all([searchProperties(filters), countSamples(), getNeighborhoods()]);
  const idx = all.findIndex((x) => x.id === h.id);
  const next = all[(idx + 1) % all.length];

  return (
    <>
      <PageHero eyebrow={h.tagline ?? undefined} title={h.name} intro={h.description ?? undefined} image={h.imageUrl} imageNote="Illustrative imagery" compact />
      <section className="container-x py-16 pb-24">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
          <p className="text-sm text-mist">{total} {total === 1 ? "property" : "properties"} in {h.name}</p>
          <Link href={`/properties?location=${h.slug}`} className="link-underline text-xs uppercase tracking-[0.22em]">Refine with filters →</Link>
        </div>
        {samples > 0 ? <div className="mb-10"><SampleNotice /></div> : null}
        {items.length ? <ListingGrid items={items} /> : <EmptyResults message={`Nothing listed in ${h.name} right now.`} />}
        <Pagination filters={filters} pages={pages} basePath={`/neighborhoods/${h.slug}`} />
      </section>
      {h.lat != null && h.lng != null ? (
        <section className="container-x pb-24" aria-label={`Map of ${h.name}`}>
          <PropertyMap lat={h.lat} lng={h.lng} label={h.name} />
        </section>
      ) : null}
      {next ? (
        <Link href={`/neighborhoods/${next.slug}`} className="group block border-t border-line">
          <div className="container-x flex items-end justify-between gap-6 py-16 md:py-24">
            <div>
              <p className="eyebrow mb-4">Next neighbourhood</p>
              <p className="display text-[clamp(2.6rem,7vw,7rem)] transition-colors group-hover:text-gold">{next.name}</p>
            </div>
            <span className="text-4xl transition-transform duration-700 group-hover:translate-x-3">→</span>
          </div>
        </Link>
      ) : null}
    </>
  );
}
