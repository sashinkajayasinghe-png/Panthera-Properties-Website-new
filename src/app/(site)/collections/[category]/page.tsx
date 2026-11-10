import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIES, getCategory } from "@/lib/constants";
import { parseFilters } from "@/lib/search";
import { countSamples, searchProperties } from "@/lib/queries";
import { PageHero } from "@/components/layout/PageHero";
import { EmptyResults, ListingGrid, Pagination, SampleNotice } from "@/components/search/Listings";

type Props = { params: Promise<{ category: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = getCategory((await params).category);
  if (!c) return {};
  return {
    title: `${c.title} for sale in Colombo`,
    description: `${c.description} Browse ${c.title.toLowerCase()} for sale with Panthera Properties — prices in LKR.`,
    alternates: { canonical: `/collections/${c.slug}` },
    openGraph: { images: [{ url: c.image }] },
  };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const c = getCategory((await params).category);
  if (!c) notFound();
  const filters = parseFilters({ ...(await searchParams), category: c.slug });
  const [{ items, total, pages }, samples] = await Promise.all([searchProperties(filters), countSamples()]);

  return (
    <>
      <PageHero eyebrow={`Collection · ${c.eyebrow}`} title={c.title} intro={c.description} image={c.image} compact />
      <section className="container-x py-16 pb-32">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
          <nav aria-label="Collections" className="flex flex-wrap gap-2">
            {CATEGORIES.map((x) => (
              <Link key={x.slug} href={`/collections/${x.slug}`} className="chip" aria-pressed={x.slug === c.slug}>
                {x.title}
              </Link>
            ))}
          </nav>
          <Link href={`/properties?category=${c.slug}`} className="link-underline text-xs uppercase tracking-[0.22em]">
            Refine with filters →
          </Link>
        </div>
        <p className="mb-6 text-sm text-mist">{total} {total === 1 ? "property" : "properties"}</p>
        {samples > 0 ? <div className="mb-10"><SampleNotice /></div> : null}
        {items.length ? <ListingGrid items={items} /> : <EmptyResults message={`No ${c.title.toLowerCase()} listed right now.`} />}
        <Pagination filters={filters} pages={pages} basePath={`/collections/${c.slug}`} />
      </section>
    </>
  );
}
