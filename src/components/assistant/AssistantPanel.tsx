"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatLKRCompact } from "@/lib/format";
import { LeadForm } from "@/components/forms/LeadForm";

type Result = {
  id: string;
  slug: string;
  title: string;
  neighborhood: string;
  type: string;
  price: number | null;
  priceOnRequest: boolean;
  bedrooms: number | null;
  bathrooms: number | null;
  floorArea: number | null;
  status: string;
  isSample: boolean;
  image: string | null;
};
type Response = { summary: string; query: string; total: number; results: Result[]; source: "ai" | "rules" };

const EXAMPLES = [
  "A three-bedroom apartment in Colombo 05 under LKR 80 million",
  "Villa with a pool in Battaramulla",
  "Land in Rajagiriya, at least 15 perches",
];

export function AssistantPanel({ compact = false, onNavigate }: { compact?: boolean; onNavigate?: () => void }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Response | null>(null);
  const [asked, setAsked] = useState("");
  const [showBrief, setShowBrief] = useState(false);

  async function ask(text: string) {
    const q = text.trim();
    if (q.length < 3) return;
    setLoading(true);
    setError(null);
    setShowBrief(false);
    try {
      const res = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: q }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");
      setData(json);
      setAsked(q);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(message);
        }}
        className="flex items-end gap-3 border-b border-ivory/30 focus-within:border-gold"
        role="search"
      >
        <label className="sr-only" htmlFor={compact ? "assistant-q-compact" : "assistant-q"}>Describe the property you are looking for</label>
        <input
          id={compact ? "assistant-q-compact" : "assistant-q"}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={600}
          placeholder="Describe your ideal home…"
          className={`w-full bg-transparent py-4 placeholder:text-mist/70 focus:outline-none ${compact ? "text-base" : "font-serif text-2xl font-light md:text-3xl"}`}
        />
        <button type="submit" className="btn min-h-0 shrink-0 px-4 py-2.5" disabled={loading}>
          {loading ? "Searching…" : "Ask"}
        </button>
      </form>

      {!data && !loading ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              className="text-left text-xs text-mist underline-offset-4 hover:text-ivory hover:underline"
              onClick={() => {
                setMessage(ex);
                ask(ex);
              }}
            >
              “{ex}”
            </button>
          ))}
        </div>
      ) : null}

      {error ? <p role="alert" className="mt-4 text-sm text-[#e09485]">{error}</p> : null}

      {data ? (
        <div className="mt-6" aria-live="polite">
          <p className="text-sm text-mist">
            Searching for <span className="text-ivory">{data.summary}</span>
            {" — "}
            {data.total === 0 ? "no current listings match." : `${data.total} matching ${data.total === 1 ? "listing" : "listings"}.`}
          </p>

          {data.results.length ? (
            <ul className={`mt-5 grid gap-3 ${compact ? "" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
              {data.results.map((r) => (
                <li key={r.id}>
                  <Link href={`/properties/${r.slug}`} onClick={onNavigate} className="group flex gap-4 border border-line p-3 transition-colors hover:border-gold/60">
                    <span className="relative block h-20 w-24 shrink-0 overflow-hidden bg-charcoal">
                      {r.image ? <Image src={r.image} alt="" fill sizes="96px" className="object-cover" /> : null}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-serif text-lg leading-tight group-hover:text-gold">{r.title}</span>
                      <span className="mt-1 block text-xs text-mist">{r.neighborhood} · {r.type}</span>
                      <span className="mt-1 block text-xs text-ivory/90">
                        {formatLKRCompact(r.price, r.priceOnRequest)}
                        {r.bedrooms != null ? ` · ${r.bedrooms} bed` : ""}
                        {r.status !== "AVAILABLE" ? ` · ${r.status === "SOLD" ? "Sold" : "Under offer"}` : ""}
                      </span>
                      {r.isSample ? <span className="mt-1 block text-[0.6rem] uppercase tracking-[0.16em] text-gold">Sample listing · not for sale</span> : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-4">
            {data.total > 0 ? (
              <Link href={`/properties${data.query ? `?${data.query}` : ""}`} onClick={onNavigate} className="btn min-h-0 px-4 py-2.5">
                See {data.total > data.results.length ? `all ${data.total}` : "results"} in search
              </Link>
            ) : null}
            <button type="button" className="link-underline text-xs uppercase tracking-[0.2em] text-mist hover:text-ivory" onClick={() => setShowBrief((s) => !s)}>
              {data.total === 0 ? "Leave your requirements with us" : "Not quite right? Leave your brief"}
            </button>
          </div>

          {showBrief ? (
            <div className="mt-6 border-t border-line pt-6">
              <p className="mb-6 text-sm text-mist">
                We will keep your requirements on file and contact you personally if a suitable property becomes available.
              </p>
              <LeadForm
                type="ASSISTANT_REQUIREMENTS"
                source="property-assistant"
                defaultMessage={asked}
                details={{ request: asked, interpretedAs: data.summary, searchQuery: data.query }}
                submitLabel="Save my requirements"
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
