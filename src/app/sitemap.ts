import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { CATEGORIES, SITE_URL } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [properties, hoods] = await Promise.all([
    prisma.property.findMany({ where: { published: true, isSample: false }, select: { slug: true, updatedAt: true } }),
    prisma.neighborhood.findMany({ select: { slug: true, updatedAt: true } }),
  ]);
  const now = new Date();
  const statics = ["", "/properties", "/neighborhoods", "/about", "/contact", "/privacy"].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: now,
    changeFrequency: p === "" || p === "/properties" ? ("daily" as const) : ("monthly" as const),
    priority: p === "" ? 1 : 0.7,
  }));
  return [
    ...statics,
    ...CATEGORIES.map((c) => ({ url: `${SITE_URL}/collections/${c.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...hoods.map((h) => ({ url: `${SITE_URL}/neighborhoods/${h.slug}`, lastModified: h.updatedAt, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...properties.map((p) => ({ url: `${SITE_URL}/properties/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.9 })),
  ];
}
