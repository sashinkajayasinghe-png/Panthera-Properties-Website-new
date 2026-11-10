import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { slugify } from "./format";
import type { propertySchema } from "./validation";
import type { z } from "zod";

type Data = z.output<typeof propertySchema>;

export async function uniqueSlug(base: string, excludeId?: string) {
  const root = slugify(base) || "property";
  let slug = root;
  for (let i = 2; ; i++) {
    const clash = await prisma.property.findFirst({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) }, select: { id: true } });
    if (!clash) return slug;
    slug = `${root}-${i}`;
  }
}

export function toPropertyData(d: Data): Omit<Prisma.PropertyUncheckedCreateInput, "slug"> {
  return {
    title: d.title,
    summary: d.summary || null,
    description: d.description,
    type: d.type,
    status: d.status,
    published: d.published,
    featured: d.featured,
    investment: d.investment,
    isSample: d.isSample,
    price: d.price,
    priceOnRequest: d.priceOnRequest,
    bedrooms: d.bedrooms,
    bathrooms: d.bathrooms,
    floorArea: d.floorArea,
    landExtent: d.landExtent,
    address: d.address || null,
    lat: d.lat,
    lng: d.lng,
    features: d.features.filter(Boolean),
    amenities: d.amenities.filter(Boolean),
    virtualTourUrl: d.virtualTourUrl || null,
    videoUrl: d.videoUrl || null,
    neighborhoodId: d.neighborhoodId,
  };
}
