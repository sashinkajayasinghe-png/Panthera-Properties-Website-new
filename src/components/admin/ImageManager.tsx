"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { IMAGE_URL_RE } from "@/lib/validation";
import { uploadImages } from "@/lib/client-upload";

export type EditorImage = { url: string; alt: string; storageKey?: string | null };

/** Upload, caption, reorder (drag or arrow buttons) and remove property photographs. */
export function ImageManager({ images, onChange }: { images: EditorImage[]; onChange: (imgs: EditorImage[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [drag, setDrag] = useState<number | null>(null);
  const [urlDraft, setUrlDraft] = useState("");

  async function upload(files: FileList | File[]) {
    const list = Array.from(files);
    if (!list.length) return;
    setUploading(true);
    setMessages([]);
    try {
      const { uploaded, errors } = await uploadImages(list);
      if (uploaded.length) onChange([...images, ...uploaded.map((u) => ({ url: u.url, alt: "", storageKey: u.storageKey }))]);
      setMessages(errors);
    } finally {
      setUploading(false);
      if (input.current) input.current.value = "";
    }
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length || from === to) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div>
      <div
        className="flex flex-col items-center justify-center gap-3 border border-dashed border-ivory/25 px-6 py-10 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files.length) upload(e.dataTransfer.files);
        }}
      >
        <p className="text-sm text-mist">Drag photographs here, or</p>
        <button type="button" className="btn min-h-0 px-4 py-2.5" onClick={() => input.current?.click()} disabled={uploading}>
          {uploading ? "Uploading…" : "Choose images"}
        </button>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={(e) => e.target.files && upload(e.target.files)} />
        <p className="text-xs text-mist">JPEG, PNG, WebP or AVIF. Large photos are resized for the web before upload — never retouched.</p>
      </div>
      <div className="mt-3 flex gap-2">
        <input className="field py-2 text-sm" placeholder="…or paste an image URL (https://)" value={urlDraft} onChange={(e) => setUrlDraft(e.target.value)} />
        <button
          type="button"
          className="btn min-h-0 px-4 py-2"
          onClick={() => {
            if (IMAGE_URL_RE.test(urlDraft.trim())) {
              onChange([...images, { url: urlDraft.trim(), alt: "" }]);
              setUrlDraft("");
              setMessages([]);
            } else setMessages(["Only uploaded images or Unsplash / Cloudinary image URLs can be used."]);
          }}
        >
          Add
        </button>
      </div>
      {messages.length ? (
        <ul role="alert" className="mt-3 space-y-1 text-xs text-[#e09485]">
          {messages.map((m) => <li key={m}>{m}</li>)}
        </ul>
      ) : null}

      <ol className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {images.map((img, i) => (
          <li
            key={img.url}
            draggable
            onDragStart={() => setDrag(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (drag != null) move(drag, i);
              setDrag(null);
            }}
            className={`border bg-charcoal p-2 ${drag === i ? "border-gold" : "border-line"}`}
          >
            <div className="relative aspect-[4/3] cursor-grab overflow-hidden bg-ink">
              <Image src={img.url} alt={img.alt || ""} fill sizes="300px" className="object-cover" />
              <span className="absolute left-2 top-2 bg-ink/80 px-2 py-1 text-[0.65rem]">{i === 0 ? "Cover" : i + 1}</span>
            </div>
            <input
              className="field py-2 text-xs"
              placeholder="Alt text (describe the photo)"
              value={img.alt}
              maxLength={200}
              onChange={(e) => onChange(images.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))}
              aria-label={`Alt text for image ${i + 1}`}
            />
            <div className="mt-2 flex items-center justify-between text-xs">
              <div className="flex gap-1">
                <button type="button" className="border border-line px-2 py-1 hover:border-gold" onClick={() => move(i, i - 1)} aria-label="Move earlier" disabled={i === 0}>←</button>
                <button type="button" className="border border-line px-2 py-1 hover:border-gold" onClick={() => move(i, i + 1)} aria-label="Move later" disabled={i === images.length - 1}>→</button>
                {i !== 0 ? (
                  <button type="button" className="border border-line px-2 py-1 hover:border-gold" onClick={() => move(i, 0)}>Make cover</button>
                ) : null}
              </div>
              <button type="button" className="text-[#e09485] hover:underline" onClick={() => onChange(images.filter((_, j) => j !== i))}>Remove</button>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
