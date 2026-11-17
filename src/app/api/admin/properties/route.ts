import { prisma } from "@/lib/prisma";
import { guard, revalidateSite } from "@/lib/admin-api";
import { fieldErrors, propertySchema } from "@/lib/validation";
import { toPropertyData, uniqueSlug } from "@/lib/admin-properties";

export async function POST(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  const parsed = propertySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Please check the highlighted fields.", fields: fieldErrors(parsed.error) }, { status: 422 });
  const d = parsed.data;
  const hood = await prisma.neighborhood.findUnique({ where: { id: d.neighborhoodId }, select: { id: true } });
  if (!hood) return Response.json({ error: "Unknown location", fields: { neighborhoodId: "Unknown location" } }, { status: 422 });

  const slug = await uniqueSlug(d.slug || d.title);
  const property = await prisma.property.create({
    data: {
      ...toPropertyData(d),
      slug,
      images: { create: d.images.map((img, i) => ({ url: img.url, alt: img.alt || null, storageKey: img.storageKey ?? null, sortOrder: i })) },
    },
    select: { id: true, slug: true },
  });
  revalidateSite(property.slug);
  return Response.json(property, { status: 201 });
}
