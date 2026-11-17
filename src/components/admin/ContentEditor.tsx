"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { HomepageContent } from "@/lib/content";
import { uploadImages } from "@/lib/client-upload";

type Key = keyof HomepageContent;

export function ContentEditor({ initial }: { initial: HomepageContent }) {
  const router = useRouter();
  const [v, setV] = useState<HomepageContent>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: Key, val: string) => setV((s) => ({ ...s, [k]: val }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    setErrors({});
    const res = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(v) });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setErrors(json.fields ?? {});
      setStatus(json.error ?? "Save failed");
      return;
    }
    setStatus("Saved — the website has been updated.");
    router.refresh();
  }

  const Text = ({ k, label, area, hint }: { k: Key; label: string; area?: boolean; hint?: string }) => (
    <div>
      <label className="label" htmlFor={`c-${k}`}>{label}</label>
      {area ? (
        <textarea id={`c-${k}`} className="field min-h-28" value={v[k]} onChange={(e) => set(k, e.target.value)} aria-invalid={errors[k] ? true : undefined} />
      ) : (
        <input id={`c-${k}`} className="field" value={v[k]} onChange={(e) => set(k, e.target.value)} aria-invalid={errors[k] ? true : undefined} />
      )}
      {hint ? <p className="mt-1 text-xs text-mist">{hint}</p> : null}
      {errors[k] ? <p className="mt-1 text-xs text-[#e09485]">{errors[k]}</p> : null}
    </div>
  );

  return (
    <form onSubmit={save} className="max-w-4xl space-y-14" noValidate>
      <section className="space-y-6">
        <h2 className="eyebrow text-gold">Brand</h2>
        <ImageField label="Logo (PNG or SVG-like PNG on transparent background)" value={v.logoUrl} onChange={(url) => set("logoUrl", url)} error={errors.logoUrl} contain allowClear />
        <p className="text-xs text-mist">Without a logo, the animated PANTHERA wordmark is shown.</p>
        <div className="grid gap-6 md:grid-cols-2">
          {Text({ k: "email", label: "Public email address" })}
          {Text({ k: "address", label: "Address / office location" })}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="eyebrow text-gold">Hero</h2>
        {Text({ k: "heroHeadline", label: "Headline", area: true, hint: "Use a line break to split lines." })}
        {Text({ k: "heroSubtext", label: "Supporting text" })}
        <ImageField label="Hero image (also used as the mobile and reduced-motion fallback)" value={v.heroImage} onChange={(url) => set("heroImage", url)} error={errors.heroImage} />
        {Text({ k: "heroVideo", label: "Hero video URL (optional, https .mp4/.webm)", hint: "Plays muted on desktop only. Leave empty to use the image." })}
      </section>

      <section className="space-y-6">
        <h2 className="eyebrow text-gold">Brand introduction</h2>
        {Text({ k: "introHeadline", label: "Headline", area: true })}
        {Text({ k: "introBody", label: "Body", area: true })}
        <ImageField label="Image" value={v.introImage} onChange={(url) => set("introImage", url)} error={errors.introImage} />
      </section>

      <section className="space-y-6">
        <h2 className="eyebrow text-gold">Private consultation</h2>
        {Text({ k: "consultationHeadline", label: "Headline", area: true })}
        {Text({ k: "consultationBody", label: "Body", area: true })}
        <ImageField label="Background image" value={v.consultationImage} onChange={(url) => set("consultationImage", url)} error={errors.consultationImage} />
      </section>

      <div className="sticky bottom-0 -mx-5 flex items-center gap-4 border-t border-line bg-ink/95 px-5 py-4 backdrop-blur md:-mx-10 md:px-10">
        <button type="submit" className="btn btn-solid" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
        <p role="status" className="text-sm text-mist">{status}</p>
      </div>
    </form>
  );
}

function ImageField({
  label,
  value,
  onChange,
  error,
  contain,
  allowClear,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  error?: string;
  contain?: boolean;
  allowClear?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function upload(file: File) {
    setBusy(true);
    setErr(null);
    const { uploaded, errors } = await uploadImages([file]);
    setBusy(false);
    if (uploaded[0]) onChange(uploaded[0].url);
    else setErr(errors[0] ?? "Upload failed");
  }
  return (
    <div>
      <p className="label mb-3">{label}</p>
      <div className="flex flex-wrap items-center gap-5">
        <div className={`relative h-28 w-44 overflow-hidden border border-line ${contain ? "bg-charcoal" : "bg-ink"}`}>
          {value ? <Image src={value} alt="" fill sizes="176px" className={contain ? "object-contain p-3" : "object-cover"} /> : <span className="flex h-full items-center justify-center text-xs text-mist">None</span>}
        </div>
        <div className="flex flex-col items-start gap-2">
          <button type="button" className="btn min-h-0 px-4 py-2.5" disabled={busy} onClick={() => input.current?.click()}>
            {busy ? "Uploading…" : "Upload image"}
          </button>
          {allowClear && value ? <button type="button" className="text-xs text-mist hover:text-ivory" onClick={() => onChange("")}>Remove</button> : null}
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </div>
      </div>
      {err || error ? <p className="mt-2 text-xs text-[#e09485]">{err ?? error}</p> : null}
    </div>
  );
}
