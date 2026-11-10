import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LEAD_STATUS_LABEL, LEAD_TYPE_LABEL } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { emailConfigured } from "@/lib/email";
import { storageProvider } from "@/lib/storage";
import { aiConfigured } from "@/lib/assistant";

export default async function Dashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [published, drafts, samples, featured, leadGroups, recent, upcoming] = await Promise.all([
    prisma.property.count({ where: { published: true } }),
    prisma.property.count({ where: { published: false } }),
    prisma.property.count({ where: { isSample: true } }),
    prisma.property.count({ where: { featured: true, published: true } }),
    prisma.lead.groupBy({ by: ["status"], _count: true }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { property: { select: { title: true } } } }),
    prisma.lead.findMany({
      where: { type: "VIEWING_REQUEST", preferredDate: { gte: today }, status: { not: "CLOSED" } },
      orderBy: { preferredDate: "asc" },
      take: 6,
      include: { property: { select: { title: true } } },
    }),
  ]);
  const byStatus = Object.fromEntries(leadGroups.map((g) => [g.status, g._count]));

  return (
    <div className="space-y-12">
      <header>
        <p className="eyebrow">Overview</p>
        <h1 className="display mt-2 text-5xl">Dashboard</h1>
      </header>

      {samples > 0 ? (
        <p className="border border-gold/50 bg-gold/10 px-5 py-4 text-sm">
          <strong className="text-gold">{samples} sample listings</strong> are in the database for testing. They are labelled on the site as “not for sale”.
          Remove them from <Link href="/admin/properties" className="underline underline-offset-4">Properties</Link> before launch.
        </p>
      ) : null}

      <section className="grid grid-cols-2 gap-px bg-line md:grid-cols-4">
        {[
          ["Published listings", published],
          ["Drafts", drafts],
          ["Featured", featured],
          ["New leads", byStatus.NEW ?? 0],
        ].map(([k, v]) => (
          <div key={k} className="bg-ink p-5">
            <p className="eyebrow">{k}</p>
            <p className="mt-3 font-serif text-4xl">{v}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="eyebrow mb-4">Pipeline</h2>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(LEAD_STATUS_LABEL) as (keyof typeof LEAD_STATUS_LABEL)[]).map((s) => (
            <Link key={s} href={`/admin/leads?status=${s}`} className="chip">
              {LEAD_STATUS_LABEL[s]} · {byStatus[s] ?? 0}
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-10 xl:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="eyebrow">Latest leads</h2>
            <Link href="/admin/leads" className="text-xs text-mist hover:text-ivory">All leads →</Link>
          </div>
          <ul className="divide-y divide-line border-y border-line">
            {recent.length === 0 ? <li className="py-6 text-sm text-mist">No leads yet.</li> : null}
            {recent.map((l) => (
              <li key={l.id}>
                <Link href={`/admin/leads?id=${l.id}`} className="flex items-center justify-between gap-4 py-3 text-sm hover:text-gold">
                  <span className="min-w-0">
                    <span className="block truncate">{l.name} — {LEAD_TYPE_LABEL[l.type]}</span>
                    <span className="block truncate text-xs text-mist">{l.property?.title ?? l.email}</span>
                  </span>
                  <span className="shrink-0 text-right text-xs text-mist">
                    {LEAD_STATUS_LABEL[l.status]}
                    <br />
                    {formatDate(l.createdAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="eyebrow">Upcoming viewing requests</h2>
            <Link href="/admin/viewings" className="text-xs text-mist hover:text-ivory">All viewings →</Link>
          </div>
          <ul className="divide-y divide-line border-y border-line">
            {upcoming.length === 0 ? <li className="py-6 text-sm text-mist">No upcoming viewing requests.</li> : null}
            {upcoming.map((l) => (
              <li key={l.id}>
                <Link href={`/admin/leads?id=${l.id}`} className="flex items-center justify-between gap-4 py-3 text-sm hover:text-gold">
                  <span className="min-w-0 truncate">{l.name} — {l.property?.title ?? "General"}</span>
                  <span className="shrink-0 text-xs text-mist">{l.preferredDate ? formatDate(l.preferredDate) : ""} {l.preferredTime ?? ""}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section>
        <h2 className="eyebrow mb-4">Integrations</h2>
        <ul className="grid gap-px bg-line text-sm md:grid-cols-3">
          <li className="bg-ink p-5">
            <p className="text-mist">Image storage</p>
            <p className="mt-1">{storageProvider() === "cloudinary" ? "Cloudinary (cloud)" : "PostgreSQL (set CLOUDINARY_* for cloud storage)"}</p>
          </li>
          <li className="bg-ink p-5">
            <p className="text-mist">Email notifications</p>
            <p className="mt-1">{emailConfigured() ? "Enabled" : "Not configured (set SMTP_* and NOTIFY_EMAIL)"}</p>
          </li>
          <li className="bg-ink p-5">
            <p className="text-mist">AI property assistant</p>
            <p className="mt-1">{aiConfigured() ? "Claude enabled" : "Rule-based search (set ANTHROPIC_API_KEY to enable AI)"}</p>
          </li>
        </ul>
      </section>
    </div>
  );
}
