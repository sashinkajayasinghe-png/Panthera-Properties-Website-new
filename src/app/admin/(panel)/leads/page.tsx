import type { Metadata } from "next";
import Link from "next/link";
import type { LeadStatus, LeadType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { LEAD_STATUS_LABEL, LEAD_STATUSES, LEAD_TYPE_LABEL } from "@/lib/constants";
import { LeadsBoard } from "@/components/admin/LeadsBoard";

export const metadata: Metadata = { title: "Leads" };

type SP = { status?: string; type?: string; property?: string; id?: string; q?: string };

export default async function LeadsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const status = LEAD_STATUSES.includes(sp.status as LeadStatus) ? (sp.status as LeadStatus) : undefined;
  const type = sp.type && sp.type in LEAD_TYPE_LABEL ? (sp.type as LeadType) : undefined;
  const where: Prisma.LeadWhereInput = {
    ...(status ? { status } : {}),
    ...(type ? { type } : {}),
    ...(sp.property ? { propertyId: sp.property } : {}),
    ...(sp.q
      ? { OR: [{ name: { contains: sp.q, mode: "insensitive" } }, { email: { contains: sp.q, mode: "insensitive" } }, { phone: { contains: sp.q } }] }
      : {}),
  };
  const [leads, counts] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { property: { select: { title: true, slug: true } } },
    }),
    prisma.lead.groupBy({ by: ["status"], _count: true }),
  ]);
  const byStatus = Object.fromEntries(counts.map((c) => [c.status, c._count]));
  const qs = (patch: Partial<SP>) => {
    const p = new URLSearchParams();
    const merged = { status, type, q: sp.q, property: sp.property, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `/admin/leads?${s}` : "/admin/leads";
  };

  return (
    <div>
      <header className="mb-8">
        <p className="eyebrow">CRM</p>
        <h1 className="display mt-2 text-5xl">Leads</h1>
      </header>
      <div className="mb-6 flex flex-wrap gap-2">
        <Link href={qs({ status: undefined })} className="chip" aria-pressed={!status}>All</Link>
        {LEAD_STATUSES.map((s) => (
          <Link key={s} href={qs({ status: s })} className="chip" aria-pressed={status === s}>
            {LEAD_STATUS_LABEL[s]} · {byStatus[s] ?? 0}
          </Link>
        ))}
      </div>
      <form className="mb-8 flex flex-wrap gap-4" action="/admin/leads">
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <label className="sr-only" htmlFor="lead-q">Search</label>
        <input id="lead-q" name="q" defaultValue={sp.q} placeholder="Search name, email or phone…" className="field max-w-xs" />
        <label className="sr-only" htmlFor="lead-type">Type</label>
        <select id="lead-type" name="type" defaultValue={type ?? ""} className="field max-w-xs">
          <option value="">All types</option>
          {Object.entries(LEAD_TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button className="btn min-h-0 px-4 py-2.5" type="submit">Filter</button>
      </form>
      <LeadsBoard
        initialOpenId={sp.id}
        leads={leads.map((l) => ({
          id: l.id,
          type: l.type,
          status: l.status,
          name: l.name,
          email: l.email,
          phone: l.phone,
          message: l.message,
          preferredDate: l.preferredDate?.toISOString() ?? null,
          preferredTime: l.preferredTime,
          details: (l.details as Record<string, unknown> | null) ?? null,
          source: l.source,
          adminNotes: l.adminNotes,
          emailNotified: l.emailNotified,
          createdAt: l.createdAt.toISOString(),
          property: l.property,
        }))}
      />
    </div>
  );
}
