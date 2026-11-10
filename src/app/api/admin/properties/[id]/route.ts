import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guard, revalidateSite } from "@/lib/admin-api";
import { fieldErrors, propertySchema } from "@/lib/validation";
import { toPropertyData, uniqueSlug } from "@/lib/admin-properties";
import { deleteStoredImage } from "@/lib/storage";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const denied = await guard(req);
  if (denied) return denied;
  const { id } = await params;
  const existing = await prisma.property.findUnique({ where: { id }, include: { images: true } });
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  const parsed = propertySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Please check the highlighted fields.", fields: fieldErrors(parsed.error) }, { status: 422 });
  const d = parsed.data;
  const slug = d.slug && d.slug !== existing.slug ? await uniqueSlug(d.slug, id) : existing.slug;

  const keep = new Set(d.images.map((i) => i.url));
  const removed = existing.images.filter((i) => !keep.has(i.url));

  const updated = await prisma.$transaction(async (tx) => {
    await tx.propertyImage.deleteMany({ where: { propertyId: id } });
    return tx.property.update({
      where: { id },
      data: {
        ...toPropertyData(d),
        slug,
        images: { create: d.images.map((img, i) => ({ url: img.url, alt: img.alt || null, storageKey: img.storageKey ?? null, sortOrder: i })) },
      },
      select: { id: true, slug: true },
    });
  });
  await Promise.all(removed.map((r) => deleteStoredImage(r.storageKey)));
  revalidateSite(existing.slug);
  revalidateSite(updated.slug);
  return Response.json(updated);
}

const patchSchema = z.object({
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  status: z.enum(["AVAILABLE", "UNDER_OFFER", "SOLD"]).optional(),
});

export async function PATCH(req: Request, { params }: Ctx) {
  const denied = await guard(req);
  if (denied) return denied;
  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid update" }, { status: 400 });
  const p = await prisma.property.update({ where: { id }, data: parsed.data, select: { slug: true } }).catch(() => null);
  if (!p) return Response.json({ error: "Not found" }, { status: 404 });
  revalidateSite(p.slug);
  return Response.json({ ok: true });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const denied = await guard(req);
  if (denied) return denied;
  const { id } = await params;
  const p = await prisma.property.findUnique({ where: { id }, include: { images: true } });
  if (!p) return Response.json({ error: "Not found" }, { status: 404 });
  await prisma.property.delete({ where: { id } });
  await Promise.all(p.images.map((i) => deleteStoredImage(i.storageKey)));
  revalidateSite(p.slug);
  return Response.json({ ok: true });
}
