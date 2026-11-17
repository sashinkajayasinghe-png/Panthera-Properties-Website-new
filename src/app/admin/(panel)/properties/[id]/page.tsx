import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PropertyEditor, type EditorValues } from "@/components/admin/PropertyEditor";

export const metadata: Metadata = { title: "Edit property" };

const s = (v: number | null | undefined) => (v == null ? "" : String(v));

export default async function EditProperty({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [p, hoods] = await Promise.all([
    prisma.property.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } }, _count: { select: { leads: true } } } }),
    prisma.neighborhood.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true, lat: true, lng: true } }),
  ]);
  if (!p) notFound();
  const initial: EditorValues = {
    title: p.title,
    slug: p.slug,
    summary: p.summary ?? "",
    description: p.description,
    type: p.type,
    status: p.status,
    published: p.published,
    featured: p.featured,
    investment: p.investment,
    isSample: p.isSample,
    price: s(p.price),
    priceOnRequest: p.priceOnRequest,
    bedrooms: s(p.bedrooms),
    bathrooms: s(p.bathrooms),
    floorArea: s(p.floorArea),
    landExtent: s(p.landExtent),
    address: p.address ?? "",
    lat: s(p.lat),
    lng: s(p.lng),
    features: p.features.join("\n"),
    amenities: p.amenities.join("\n"),
    virtualTourUrl: p.virtualTourUrl ?? "",
    videoUrl: p.videoUrl ?? "",
    neighborhoodId: p.neighborhoodId,
    images: p.images.map((i) => ({ url: i.url, alt: i.alt ?? "", storageKey: i.storageKey })),
  };
  return (
    <div>
      <Link href="/admin/properties" className="text-xs uppercase tracking-[0.18em] text-mist hover:text-ivory">← Properties</Link>
      <div className="mb-10 mt-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-5xl">{p.title}</h1>
        {p._count.leads ? (
          <Link href={`/admin/leads?property=${p.id}`} className="chip">{p._count.leads} leads for this property</Link>
        ) : null}
      </div>
      <PropertyEditor id={p.id} initial={initial} hoods={hoods} />
    </div>
  );
}
