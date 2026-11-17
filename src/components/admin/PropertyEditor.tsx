"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ListingStatus, PropertyType } from "@prisma/client";
import { LISTING_STATUS_LABEL, LISTING_STATUSES, PROPERTY_TYPE_LABEL, PROPERTY_TYPES } from "@/lib/constants";
import { formatLKR } from "@/lib/format";
import { ImageManager, type EditorImage } from "./ImageManager";

export type EditorValues = {
  title: string;
  slug: string;
  summary: string;
  description: string;
  type: PropertyType;
  status: ListingStatus;
  published: boolean;
  featured: boolean;
  investment: boolean;
  isSample: boolean;
  price: string;
  priceOnRequest: boolean;
  bedrooms: string;
  bathrooms: string;
  floorArea: string;
  landExtent: string;
  address: string;
  lat: string;
  lng: string;
  features: string;
  amenities: string;
  virtualTourUrl: string;
  videoUrl: string;
  neighborhoodId: string;
  images: EditorImage[];
};

export const EMPTY_PROPERTY: EditorValues = {
  title: "", slug: "", summary: "", description: "", type: "APARTMENT", status: "AVAILABLE",
  published: false, featured: false, investment: false, isSample: false,
  price: "", priceOnRequest: false, bedrooms: "", bathrooms: "", floorArea: "", landExtent: "",
  address: "", lat: "", lng: "", features: "", amenities: "", virtualTourUrl: "", videoUrl: "",
  neighborhoodId: "", images: [],
};

type Hood = { id: string; name: string; lat: number | null; lng: number | null };

export function PropertyEditor({ id, initial, hoods }: { id?: string; initial: EditorValues; hoods: Hood[] }) {
  const router = useRouter();
  const [v, setV] = useState<EditorValues>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ kind: "idle" | "saving" | "saved" | "error"; message?: string }>({ kind: "idle" });
  const set = <K extends keyof EditorValues>(k: K, val: EditorValues[K]) => setV((s) => ({ ...s, [k]: val }));
  const text = (k: keyof EditorValues) => ({
    value: v[k] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => set(k, e.target.value as never),
    "aria-invalid": errors[k] ? true : undefined,
    id: `f-${k}`,
  });
  const Err = ({ k }: { k: string }) => (errors[k] ? <p className="mt-1 text-xs text-[#e09485]">{errors[k]}</p> : null);
  const isLand = v.type === "LAND";

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ kind: "saving" });
    setErrors({});
    const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
    const payload = {
      ...v,
      features: lines(v.features),
      amenities: lines(v.amenities),
      price: v.price.replace(/[, ]/g, ""),
      images: v.images.map((i) => ({ url: i.url, alt: i.alt, storageKey: i.storageKey ?? null })),
    };
    try {
      const res = await fetch(id ? `/api/admin/properties/${id}` : "/api/admin/properties", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(json.fields ?? {});
        setStatus({ kind: "error", message: json.error ?? "Save failed" });
        return;
      }
      setStatus({ kind: "saved" });
      setV((s) => ({ ...s, slug: json.slug }));
      if (!id) router.replace(`/admin/properties/${json.id}`);
      router.refresh();
    } catch {
      setStatus({ kind: "error", message: "Network error — not saved." });
    }
  }

  async function remove() {
    if (!id || !confirm("Delete this property permanently? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/properties/${id}`, { method: "DELETE" });
    if (!res.ok) return alert("Delete failed.");
    router.replace("/admin/properties");
    router.refresh();
  }

  const priceNum = Number(v.price.replace(/[, ]/g, ""));

  return (
    <form onSubmit={save} className="space-y-12" noValidate>
      {v.isSample ? (
        <p className="border border-gold/50 bg-gold/10 px-4 py-3 text-sm">
          This is a <strong className="text-gold">sample listing</strong> and is labelled “not for sale” on the website. Untick “Sample listing” only for a real property with genuine photographs.
        </p>
      ) : null}

      <section className="grid gap-x-8 gap-y-6 md:grid-cols-2">
        <h2 className="eyebrow md:col-span-2">Basics</h2>
        <div className="md:col-span-2">
          <label className="label" htmlFor="f-title">Title *</label>
          <input className="field font-serif text-2xl" {...text("title")} required maxLength={160} />
          <Err k="title" />
        </div>
        <div>
          <label className="label" htmlFor="f-slug">URL slug</label>
          <input className="field" {...text("slug")} placeholder="generated from the title" maxLength={90} />
          <Err k="slug" />
        </div>
        <div>
          <label className="label" htmlFor="f-neighborhoodId">Location *</label>
          <select
            className="field"
            {...text("neighborhoodId")}
            onChange={(e) => {
              const h = hoods.find((x) => x.id === e.target.value);
              setV((s) => ({
                ...s,
                neighborhoodId: e.target.value,
                lat: s.lat || (h?.lat != null ? String(h.lat) : ""),
                lng: s.lng || (h?.lng != null ? String(h.lng) : ""),
              }));
            }}
          >
            <option value="">Select…</option>
            {hoods.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
          <Err k="neighborhoodId" />
        </div>
        <div>
          <label className="label" htmlFor="f-type">Property type *</label>
          <select className="field" {...text("type")}>
            {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{PROPERTY_TYPE_LABEL[t]}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="f-status">Listing status</label>
          <select className="field" {...text("status")}>
            {LISTING_STATUSES.map((s) => <option key={s} value={s}>{LISTING_STATUS_LABEL[s]}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-6 text-sm md:col-span-2">
          {([
            ["published", "Published on website"],
            ["featured", "Featured on homepage"],
            ["investment", "Investment property"],
            ["isSample", "Sample listing (testing only)"],
          ] as const).map(([k, label]) => (
            <label key={k} className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4 accent-[#c5a46d]" checked={v[k]} onChange={(e) => set(k, e.target.checked)} />
              {label}
            </label>
          ))}
        </div>
      </section>

      <section className="grid gap-x-8 gap-y-6 md:grid-cols-3">
        <h2 className="eyebrow md:col-span-3">Price & size</h2>
        <div>
          <label className="label" htmlFor="f-price">Asking price (LKR)</label>
          <input className="field" {...text("price")} inputMode="numeric" placeholder="e.g. 85000000" />
          <p className="mt-1 text-xs text-mist">{priceNum > 0 ? formatLKR(priceNum) : " "}</p>
          <Err k="price" />
        </div>
        <label className="flex items-center gap-2 self-center text-sm">
          <input type="checkbox" className="h-4 w-4 accent-[#c5a46d]" checked={v.priceOnRequest} onChange={(e) => set("priceOnRequest", e.target.checked)} />
          Show “Price on request”
        </label>
        <div />
        {!isLand ? (
          <>
            <div>
              <label className="label" htmlFor="f-bedrooms">Bedrooms</label>
              <input className="field" {...text("bedrooms")} inputMode="numeric" />
              <Err k="bedrooms" />
            </div>
            <div>
              <label className="label" htmlFor="f-bathrooms">Bathrooms</label>
              <input className="field" {...text("bathrooms")} inputMode="numeric" />
              <Err k="bathrooms" />
            </div>
            <div>
              <label className="label" htmlFor="f-floorArea">Interior floor area (sq ft)</label>
              <input className="field" {...text("floorArea")} inputMode="numeric" />
              <Err k="floorArea" />
            </div>
          </>
        ) : null}
        <div>
          <label className="label" htmlFor="f-landExtent">Land extent (perches)</label>
          <input className="field" {...text("landExtent")} inputMode="decimal" />
          <Err k="landExtent" />
        </div>
      </section>

      <section className="grid gap-x-8 gap-y-6">
        <h2 className="eyebrow">Description</h2>
        <div>
          <label className="label" htmlFor="f-summary">Short summary (cards & SEO)</label>
          <input className="field" {...text("summary")} maxLength={300} />
        </div>
        <div>
          <label className="label" htmlFor="f-description">Full description *</label>
          <textarea className="field min-h-56" {...text("description")} />
          <p className="mt-1 text-xs text-mist">Leave a blank line between paragraphs.</p>
          <Err k="description" />
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <label className="label" htmlFor="f-features">Features (one per line)</label>
            <textarea className="field min-h-40" {...text("features")} />
          </div>
          <div>
            <label className="label" htmlFor="f-amenities">Amenities (one per line)</label>
            <textarea className="field min-h-40" {...text("amenities")} />
          </div>
        </div>
      </section>

      <section className="grid gap-x-8 gap-y-6 md:grid-cols-3">
        <h2 className="eyebrow md:col-span-3">Location & media</h2>
        <div>
          <label className="label" htmlFor="f-address">Address (internal / approximate)</label>
          <input className="field" {...text("address")} maxLength={300} />
        </div>
        <div>
          <label className="label" htmlFor="f-lat">Latitude</label>
          <input className="field" {...text("lat")} inputMode="decimal" />
          <Err k="lat" />
        </div>
        <div>
          <label className="label" htmlFor="f-lng">Longitude</label>
          <input className="field" {...text("lng")} inputMode="decimal" />
          <Err k="lng" />
        </div>
        <div className="md:col-span-3 grid gap-8 md:grid-cols-2">
          <div>
            <label className="label" htmlFor="f-videoUrl">Video walkthrough URL (YouTube, Vimeo or .mp4)</label>
            <input className="field" {...text("videoUrl")} placeholder="https://" />
            <Err k="videoUrl" />
          </div>
          <div>
            <label className="label" htmlFor="f-virtualTourUrl">Virtual tour URL (e.g. Matterport)</label>
            <input className="field" {...text("virtualTourUrl")} placeholder="https://" />
            <Err k="virtualTourUrl" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="eyebrow mb-6">Photographs</h2>
        <ImageManager images={v.images} onChange={(images) => set("images", images)} />
        <Err k="images" />
      </section>

      <div className="sticky bottom-0 z-10 -mx-5 flex flex-wrap items-center gap-4 border-t border-line bg-ink/95 px-5 py-4 backdrop-blur md:-mx-10 md:px-10">
        <button type="submit" className="btn btn-solid" disabled={status.kind === "saving"}>
          {status.kind === "saving" ? "Saving…" : id ? "Save changes" : "Create property"}
        </button>
        {id && v.slug ? (
          <a href={`/properties/${v.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-[0.18em] text-mist hover:text-ivory">
            View on site ↗
          </a>
        ) : null}
        <p role="status" className={`text-sm ${status.kind === "error" ? "text-[#e09485]" : "text-mist"}`}>
          {status.kind === "saved" ? "Saved." : status.kind === "error" ? status.message : ""}
        </p>
        {id ? (
          <button type="button" onClick={remove} className="ml-auto text-xs uppercase tracking-[0.18em] text-[#e09485] hover:underline">
            Delete property
          </button>
        ) : null}
      </div>
    </form>
  );
}
