import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { aiConfigured, describeFilters, interpretWithAI, interpretWithRules } from "@/lib/assistant";
import { buildOrderBy, buildWhere, filtersToQuery } from "@/lib/search";
import { PROPERTY_TYPE_LABEL } from "@/lib/constants";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({ message: z.string().trim().min(3).max(600) });

export async function POST(req: Request) {
  const ip = await clientIp();
  if (!rateLimit(`assistant:${ip}`, 20, 60_000))
    return Response.json({ error: "Too many requests — please wait a moment." }, { status: 429 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Please describe what you are looking for." }, { status: 400 });
  const { message } = parsed.data;

  const hoods = await prisma.neighborhood.findMany({ select: { slug: true, name: true, tagline: true } });
  const interpretation = (await interpretWithAI(message, hoods)) ?? interpretWithRules(message, hoods);
  const { filters, excludeSold } = interpretation;

  const where = buildWhere(filters);
  if (excludeSold && !filters.status) (where.AND as object[]).push({ status: { not: "SOLD" } });

  // Results come exclusively from the database — the assistant never invents listings.
  const [items, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy: buildOrderBy(filters.sort),
      take: 6,
      include: {
        neighborhood: { select: { name: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true, alt: true } },
      },
    }),
    prisma.property.count({ where }),
  ]);

  return Response.json({
    source: interpretation.source,
    aiAvailable: aiConfigured(),
    summary: describeFilters(filters, hoods, (t) => PROPERTY_TYPE_LABEL[t]),
    query: filtersToQuery(filters),
    filters,
    total,
    results: items.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      neighborhood: p.neighborhood.name,
      type: PROPERTY_TYPE_LABEL[p.type],
      price: p.price,
      priceOnRequest: p.priceOnRequest,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      floorArea: p.floorArea,
      status: p.status,
      isSample: p.isSample,
      image: p.images[0]?.url ?? null,
    })),
  });
}
