import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/constants";
import { buildWhere, parseFilters } from "@/lib/search";
import { getFeatured, getNeighborhoods } from "@/lib/queries";
import { getHomepageContent } from "@/lib/content";
import { Hero } from "@/components/home/Hero";
import { Intro } from "@/components/home/Intro";
import { Categories } from "@/components/home/Categories";
import { Featured } from "@/components/home/Featured";
import { NeighborhoodShowcase } from "@/components/home/Neighborhoods";
import { WhyPanthera } from "@/components/home/WhyPanthera";
import { Consultation } from "@/components/home/Consultation";

export default async function HomePage() {
  const [content, featured, hoods, hoodCounts, categoryCounts] = await Promise.all([
    getHomepageContent(),
    getFeatured(),
    getNeighborhoods(),
    prisma.property.groupBy({ by: ["neighborhoodId"], where: { published: true }, _count: true }),
    Promise.all(
      CATEGORIES.map((c) => prisma.property.count({ where: buildWhere(parseFilters({ category: c.slug })) })),
    ),
  ]);
  const countByHood = new Map(hoodCounts.map((h) => [h.neighborhoodId, h._count]));
  const counts = Object.fromEntries(CATEGORIES.map((c, i) => [c.slug, categoryCounts[i]]));

  return (
    <>
      <Hero headline={content.heroHeadline} subtext={content.heroSubtext} image={content.heroImage} video={content.heroVideo || undefined} />
      <Intro headline={content.introHeadline} body={content.introBody} image={content.introImage} />
      <Categories counts={counts} />
      <Featured properties={featured} />
      <NeighborhoodShowcase
        hoods={hoods.map((h) => ({ slug: h.slug, name: h.name, tagline: h.tagline, imageUrl: h.imageUrl, count: countByHood.get(h.id) ?? 0 }))}
      />
      <WhyPanthera />
      <Consultation
        headline={content.consultationHeadline}
        body={content.consultationBody}
        image={content.consultationImage}
        hoods={hoods.map((h) => ({ slug: h.slug, name: h.name }))}
      />
    </>
  );
}
