"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ListingStatus } from "@prisma/client";
import { LISTING_STATUS_LABEL, LISTING_STATUSES } from "@/lib/constants";

async function patch(id: string, body: object) {
  const res = await fetch(`/api/admin/properties/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Update failed");
}

/** Inline status / visibility / featured controls rendered as table cells. */
export function PropertyRowActions(props: { id: string; slug: string; status: ListingStatus; published: boolean; featured: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const run = async (body: object) => {
    setBusy(true);
    try {
      await patch(props.id, body);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <td className="py-3 pr-4">
        <label className="sr-only" htmlFor={`status-${props.id}`}>Listing status</label>
        <select
          id={`status-${props.id}`}
          className="field w-36 py-1.5 text-sm"
          value={props.status}
          disabled={busy}
          onChange={(e) => run({ status: e.target.value })}
        >
          {LISTING_STATUSES.map((s) => (
            <option key={s} value={s}>{LISTING_STATUS_LABEL[s]}</option>
          ))}
        </select>
      </td>
      <td className="py-3 pr-4">
        <div className="flex flex-col gap-1 text-xs">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={props.published} disabled={busy} onChange={(e) => run({ published: e.target.checked })} className="accent-[#c5a46d]" />
            Published
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={props.featured} disabled={busy} onChange={(e) => run({ featured: e.target.checked })} className="accent-[#c5a46d]" />
            Featured
          </label>
        </div>
      </td>
    </>
  );
}

export function RemoveSamplesButton({ count }: { count: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      className="btn"
      disabled={busy}
      onClick={async () => {
        if (!confirm(`Delete all ${count} sample listings? This cannot be undone.`)) return;
        setBusy(true);
        const res = await fetch("/api/admin/properties/samples", { method: "DELETE" });
        setBusy(false);
        if (!res.ok) return alert("Could not remove sample listings.");
        router.refresh();
      }}
    >
      {busy ? "Removing…" : `Remove ${count} sample listings`}
    </button>
  );
}
