import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LEAD_STATUS_LABEL } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Viewing requests" };

export default async function ViewingsPage({ searchParams }: { searchParams: Promise<{ past?: string }> }) {
  const { past } = await searchParams;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const viewings = await prisma.lead.findMany({
    where: { type: "VIEWING_REQUEST", preferredDate: past ? { lt: today } : { gte: today } },
    orderBy: { preferredDate: past ? "desc" : "asc" },
    include: { property: { select: { title: true, slug: true, neighborhood: { select: { name: true } } } } },
    take: 200,
  });
  const groups = new Map<string, typeof viewings>();
  for (const v of viewings) {
    const key = v.preferredDate ? formatDate(v.preferredDate) : "No date";
    groups.set(key, [...(groups.get(key) ?? []), v]);
  }

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Calendar</p>
          <h1 className="display mt-2 text-5xl">Viewing requests</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/viewings" className="chip" aria-pressed={!past}>Upcoming</Link>
          <Link href="/admin/viewings?past=1" className="chip" aria-pressed={!!past}>Past</Link>
        </div>
      </header>
      <p className="mb-8 max-w-2xl text-sm text-mist">
        Requests show the visitor’s preferred date. Confirm each viewing with the client, then set the lead status to “Viewing Scheduled”.
      </p>
      {viewings.length === 0 ? <p className="text-mist">No {past ? "past" : "upcoming"} viewing requests.</p> : null}
      <div className="space-y-10">
        {[...groups.entries()].map(([day, items]) => (
          <section key={day}>
            <h2 className="eyebrow mb-3 text-gold">{day}</h2>
            <ul className="divide-y divide-line border-y border-line">
              {items.map((v) => (
                <li key={v.id}>
                  <Link href={`/admin/leads?id=${v.id}`} className="grid gap-2 py-4 text-sm hover:text-gold md:grid-cols-[160px_1fr_1fr_160px]">
                    <span className="text-mist">{v.preferredTime ?? "Any time"}</span>
                    <span>{v.name} <span className="text-mist">· {v.phone ?? v.email}</span></span>
                    <span className="truncate">{v.property ? `${v.property.title} (${v.property.neighborhood.name})` : "General viewing"}</span>
                    <span className="text-xs uppercase tracking-[0.14em] text-mist">{LEAD_STATUS_LABEL[v.status]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
