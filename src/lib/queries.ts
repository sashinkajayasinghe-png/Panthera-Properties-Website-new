import "server-only";
import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { buildOrderBy, buildWhere, PAGE_SIZE, type SearchFilters } from "./search";

export const cardInclude = {
  neighborhood: { select: { name: true, slug: true } },
  images: { orderBy: { sortOrder: "asc" }, take: 4, select: { url: true, alt: true } },
} satisfies Prisma.PropertyInclude;

export type PropertyCardData = Prisma.PropertyGetPayload<{ include: typeof cardInclude }>;

export async function searchProperties(filters: SearchFilters, pageSize = PAGE_SIZE) {
  const where = buildWhere(filters);
  const [items, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy: buildOrderBy(filters.sort),
      include: cardInclude,
      skip: (filters.page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.property.count({ where }),
  ]);
  return { items, total, pages: Math.max(1, Math.ceil(total / pageSize)) };
}

export const getFeatured = () =>
  prisma.property.findMany({
    where: { published: true, featured: true },
    orderBy: { listedAt: "desc" },
    include: cardInclude,
    take: 8,
  });

export const getNeighborhoods = cache(() =>
  prisma.neighborhood.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
);

export const getPropertyBySlug = cache((slug: string) =>
  prisma.property.findFirst({
    where: { slug, published: true },
    include: { neighborhood: true, images: { orderBy: { sortOrder: "asc" } } },
  }),
);

export function getSimilar(p: { id: string; type: string; neighborhoodId: string; price: number | null }) {
  return prisma.property.findMany({
    where: {
      published: true,
      id: { not: p.id },
      OR: [{ type: p.type as never }, { neighborhoodId: p.neighborhoodId }],
    },
    include: cardInclude,
    orderBy: { listedAt: "desc" },
    take: 3,
  });
}

export const countSamples = cache(() => prisma.property.count({ where: { isSample: true, published: true } }));
