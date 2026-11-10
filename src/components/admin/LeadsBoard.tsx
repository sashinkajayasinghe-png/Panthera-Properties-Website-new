"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { LeadStatus, LeadType } from "@prisma/client";
import { LEAD_STATUS_LABEL, LEAD_STATUSES, LEAD_TYPE_LABEL } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export type LeadRow = {
  id: string;
  type: LeadType;
  status: LeadStatus;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  preferredDate: string | null;
  preferredTime: string | null;
  details: Record<string, unknown> | null;
  source: string | null;
  adminNotes: string | null;
  emailNotified: boolean;
  createdAt: string;
  property: { title: string; slug: string } | null;
};

const STATUS_TONE: Record<LeadStatus, string> = {
  NEW: "bg-gold text-ink",
  CONTACTED: "bg-ivory/15 text-ivory",
  VIEWING_SCHEDULED: "bg-[#5f7f6a] text-ivory",
  NEGOTIATING: "bg-[#7a6a4f] text-ivory",
  CLOSED: "bg-mist/30 text-mist",
};

export function LeadsBoard({ leads, initialOpenId }: { leads: LeadRow[]; initialOpenId?: string }) {
  const [openId, setOpenId] = useState<string | null>(initialOpenId ?? null);
  const open = leads.find((l) => l.id === openId) ?? null;

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_440px]">
      <div className="overflow-x-auto border-y border-line">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.14em] text-mist">
            <tr>
              <th className="py-3 pr-4 font-normal">Contact</th>
              <th className="py-3 pr-4 font-normal">Type</th>
              <th className="py-3 pr-4 font-normal">Property</th>
              <th className="py-3 pr-4 font-normal">Status</th>
              <th className="py-3 font-normal">Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {leads.map((l) => (
              <tr
                key={l.id}
                className={`cursor-pointer transition-colors hover:bg-charcoal ${openId === l.id ? "bg-charcoal" : ""}`}
                onClick={() => setOpenId(l.id)}
              >
                <td className="py-3 pr-4">
                  <button type="button" className="text-left hover:text-gold" onClick={() => setOpenId(l.id)}>
                    <span className="block">{l.name}</span>
                    <span className="block text-xs text-mist">{l.email}</span>
                  </button>
                </td>
                <td className="py-3 pr-4 text-xs">{LEAD_TYPE_LABEL[l.type]}</td>
                <td className="max-w-[220px] truncate py-3 pr-4 text-xs text-mist">{l.property?.title ?? "—"}</td>
                <td className="py-3 pr-4">
                  <span className={`inline-block px-2 py-1 text-[0.65rem] uppercase tracking-[0.12em] ${STATUS_TONE[l.status]}`}>{LEAD_STATUS_LABEL[l.status]}</span>
                </td>
                <td className="py-3 text-xs text-mist">{formatDate(l.createdAt, true)}</td>
              </tr>
            ))}
            {leads.length === 0 ? (
              <tr><td colSpan={5} className="py-10 text-center text-mist">No leads match.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {open ? <LeadDetail key={open.id} lead={open} onClose={() => setOpenId(null)} /> : (
        <p className="hidden text-sm text-mist xl:block">Select a lead to view details and update its status.</p>
      )}
    </div>
  );
}

function LeadDetail({ lead, onClose }: { lead: LeadRow; onClose: () => void }) {
  const router = useRouter();
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [notes, setNotes] = useState(lead.adminNotes ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(patch: { status?: LeadStatus; adminNotes?: string }) {
    setBusy(true);
    setMsg(null);
    const res = await fetch(`/api/admin/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setBusy(false);
    if (!res.ok) return setMsg("Could not save — please try again.");
    setMsg("Saved.");
    router.refresh();
  }

  async function remove() {
    if (!confirm("Delete this lead permanently?")) return;
    const res = await fetch(`/api/admin/leads/${lead.id}`, { method: "DELETE" });
    if (!res.ok) return setMsg("Could not delete.");
    onClose();
    router.refresh();
  }

  const details = Object.entries(lead.details ?? {}).filter(([, v]) => v != null && v !== "");
  const phoneDigits = lead.phone?.replace(/[^\d]/g, "");
  const waNumber = phoneDigits ? (phoneDigits.startsWith("0") ? `94${phoneDigits.slice(1)}` : phoneDigits) : null;

  return (
    <aside className="border border-line bg-charcoal p-6 xl:sticky xl:top-6 xl:max-h-[calc(100dvh-3rem)] xl:overflow-y-auto" aria-label="Lead details">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-gold">{LEAD_TYPE_LABEL[lead.type]}</p>
          <h2 className="mt-2 font-serif text-3xl">{lead.name}</h2>
          <p className="mt-1 text-xs text-mist">Received {formatDate(lead.createdAt, true)}{lead.source ? ` · ${lead.source}` : ""}</p>
        </div>
        <button type="button" onClick={onClose} className="text-xl text-mist hover:text-ivory" aria-label="Close">×</button>
      </div>

      <dl className="space-y-3 text-sm">
        <div><dt className="label">Email</dt><dd><a className="underline-offset-4 hover:underline" href={`mailto:${lead.email}`}>{lead.email}</a></dd></div>
        {lead.phone ? (
          <div>
            <dt className="label">Phone</dt>
            <dd className="flex gap-4">
              <a className="underline-offset-4 hover:underline" href={`tel:${lead.phone}`}>{lead.phone}</a>
              {waNumber ? <a className="text-gold underline-offset-4 hover:underline" href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer">WhatsApp</a> : null}
            </dd>
          </div>
        ) : null}
        {lead.property ? (
          <div><dt className="label">Property</dt><dd><Link className="underline-offset-4 hover:underline" href={`/properties/${lead.property.slug}`} target="_blank">{lead.property.title} ↗</Link></dd></div>
        ) : null}
        {lead.preferredDate ? (
          <div><dt className="label">Preferred viewing</dt><dd>{formatDate(lead.preferredDate)} {lead.preferredTime ?? ""}</dd></div>
        ) : null}
        {lead.message ? (
          <div><dt className="label">Message</dt><dd className="whitespace-pre-wrap text-ivory/85">{lead.message}</dd></div>
        ) : null}
        {details.map(([k, v]) => (
          <div key={k}><dt className="label">{k.replace(/([A-Z])/g, " $1")}</dt><dd className="break-words">{String(v)}</dd></div>
        ))}
        <div><dt className="label">Email notification</dt><dd className="text-mist">{lead.emailNotified ? "Sent to team" : "Not sent (email not configured or failed)"}</dd></div>
      </dl>

      <div className="mt-8 border-t border-line pt-6">
        <label className="label" htmlFor="lead-status">Status</label>
        <div className="mt-2 flex flex-wrap gap-2" id="lead-status" role="radiogroup">
          {LEAD_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={status === s}
              className="chip"
              aria-pressed={status === s}
              disabled={busy}
              onClick={() => {
                setStatus(s);
                save({ status: s });
              }}
            >
              {LEAD_STATUS_LABEL[s]}
            </button>
          ))}
        </div>
        <label className="label mt-6" htmlFor="lead-notes">Internal notes</label>
        <textarea id="lead-notes" className="field min-h-28" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={10000} />
        <div className="mt-4 flex items-center gap-4">
          <button type="button" className="btn min-h-0 px-4 py-2.5" disabled={busy} onClick={() => save({ adminNotes: notes })}>Save notes</button>
          <p role="status" className="text-xs text-mist">{msg}</p>
          <button type="button" onClick={remove} className="ml-auto text-xs text-[#e09485] hover:underline">Delete</button>
        </div>
      </div>
    </aside>
  );
}
