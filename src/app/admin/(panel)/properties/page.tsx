import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PROPERTY_TYPE_LABEL } from "@/lib/constants";
import { formatDate, formatLKRCompact } from "@/lib/format";
import { PropertyRowActions, RemoveSamplesButton } from "@/components/admin/PropertyActions";

export const metadata: Metadata = { title: "Properties" };

export default async function AdminProperties({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const [properties, samples] = await Promise.all([
    prisma.property.findMany({
      where: q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { neighborhood: { name: { contains: q, mode: "insensitive" } } }] } : undefined,
      orderBy: { updatedAt: "desc" },
      include: { neighborhood: { select: { name: true } }, images: { take: 1, orderBy: { sortOrder: "asc" } }, _count: { select: { leads: true } } },
    }),
    prisma.property.count({ where: { isSample: true } }),
  ]);

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Listings</p>
          <h1 className="display mt-2 text-5xl">Properties</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          {samples > 0 ? <RemoveSamplesButton count={samples} /> : null}
          <Link href="/admin/properties/new" className="btn btn-solid">Add property</Link>
        </div>
      </header>

      <form className="mb-6 max-w-sm">
        <label className="sr-only" htmlFor="q">Search properties</label>
        <input id="q" name="q" defaultValue={q} placeholder="Search by title or location…" className="field" />
      </form>

      <div className="overflow-x-auto border-y border-line">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.14em] text-mist">
            <tr>
              <th className="py-3 pr-4 font-normal">Property</th>
              <th className="py-3 pr-4 font-normal">Price</th>
              <th className="py-3 pr-4 font-normal">Status</th>
              <th className="py-3 pr-4 font-normal">Visibility</th>
              <th className="py-3 pr-4 font-normal">Leads</th>
              <th className="py-3 pr-4 font-normal">Updated</th>
              <th className="py-3 font-normal"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {properties.map((p) => (
              <tr key={p.id} className="align-middle">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <span className="relative block h-12 w-16 shrink-0 overflow-hidden bg-charcoal">
                      {p.images[0] ? <Image src={p.images[0].url} alt="" fill sizes="64px" className="object-cover" /> : null}
                    </span>
                    <span className="min-w-0">
                      <Link href={`/admin/properties/${p.id}`} className="block truncate hover:text-gold">{p.title}</Link>
                      <span className="block text-xs text-mist">
                        {p.neighborhood.name} · {PROPERTY_TYPE_LABEL[p.type]}
                        {p.isSample ? <span className="ml-2 text-gold">SAMPLE</span> : null}
                      </span>
                    </span>
                  </div>
                </td>
                <td className="py-3 pr-4">{formatLKRCompact(p.price, p.priceOnRequest)}</td>
                <PropertyRowActions id={p.id} slug={p.slug} status={p.status} published={p.published} featured={p.featured} />
                <td className="py-3 pr-4">{p._count.leads}</td>
                <td className="py-3 pr-4 text-xs text-mist">{formatDate(p.updatedAt)}</td>
                <td className="py-3 text-right">
                  <Link href={`/admin/properties/${p.id}`} className="text-xs uppercase tracking-[0.16em] hover:text-gold">Edit</Link>
                </td>
              </tr>
            ))}
            {properties.length === 0 ? (
              <tr><td colSpan={7} className="py-10 text-center text-mist">No properties yet.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
