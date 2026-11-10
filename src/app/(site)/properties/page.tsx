import type { Metadata } from "next";
import { parseFilters } from "@/lib/search";
import { countSamples, getNeighborhoods, searchProperties } from "@/lib/queries";
import { getCategory, PROPERTY_TYPE_LABEL } from "@/lib/constants";
import { PageHero } from "@/components/layout/PageHero";
import { SearchFilters } from "@/components/search/SearchFilters";
import { EmptyResults, ListingGrid, Pagination, SampleNotice } from "@/components/search/Listings";
import { AssistantInline } from "@/components/assistant/AssistantInline";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const f = parseFilters(await searchParams);
  const hoods = await getNeighborhoods();
  const where = f.location ? hoods.find((h) => h.slug === f.location)?.name : undefined;
  const what = f.category
    ? getCategory(f.category)!.title
    : f.types.length === 1
      ? `${PROPERTY_TYPE_LABEL[f.types[0]]}s`
      : "Luxury properties";
  return {
    title: `${what} for sale${where ? ` in ${where}` : " in Colombo"}`,
    description: `Search ${what.toLowerCase()} for sale${where ? ` in ${where}` : " across Colombo and Sri Lanka"} with Panthera Properties. Prices in LKR.`,
    alternates: { canonical: "/properties" },
  };
}

export default async function PropertiesPage({ searchParams }: Props) {
  const filters = parseFilters(await searchParams);
  const [{ items, total, pages }, hoods, samples] = await Promise.all([
    searchProperties(filters),
    getNeighborhoods(),
    countSamples(),
  ]);
  const category = filters.category ? getCategory(filters.category) : undefined;

  return (
    <>
      <PageHero
        eyebrow="Property search"
        title={category ? category.title : "Find your\nnext address"}
        intro={category?.description ?? "Filter by type, neighbourhood, price and size — or simply describe what you are looking for."}
      >
        <div className="mt-10 max-w-3xl">
          <AssistantInline />
        </div>
      </PageHero>
      <section className="container-x pb-32">
        <SearchFilters initial={filters} hoods={hoods.map((h) => ({ slug: h.slug, name: h.name }))} total={total} />
        <p className="mt-6 text-right text-sm text-mist">Prices in Sri Lankan Rupees (LKR)</p>
        {samples > 0 ? <div className="mt-6"><SampleNotice /></div> : null}
        <div className="mt-12">{items.length ? <ListingGrid items={items} /> : <EmptyResults />}</div>
        <Pagination filters={filters} pages={pages} basePath="/properties" />
      </section>
    </>
  );
}
