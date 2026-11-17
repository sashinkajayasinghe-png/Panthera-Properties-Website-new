import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EMPTY_PROPERTY, PropertyEditor } from "@/components/admin/PropertyEditor";

export const metadata: Metadata = { title: "Add property" };

export default async function NewProperty() {
  const hoods = await prisma.neighborhood.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true, lat: true, lng: true } });
  return (
    <div>
      <Link href="/admin/properties" className="text-xs uppercase tracking-[0.18em] text-mist hover:text-ivory">← Properties</Link>
      <h1 className="display mb-10 mt-4 text-5xl">Add property</h1>
      <PropertyEditor initial={EMPTY_PROPERTY} hoods={hoods} />
    </div>
  );
}
