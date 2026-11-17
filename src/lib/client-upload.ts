"use client";

// Hosting platforms such as Vercel reject request bodies over ~4.5 MB, so large photos are
// downscaled in the browser and uploaded one per request. Resizing only — no other edits.
const SAFE_BYTES = 3.5 * 1024 * 1024;
const MAX_EDGE = 2800;

async function shrink(file: File): Promise<File> {
  if (file.size <= SAFE_BYTES) return file;
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  for (const quality of [0.9, 0.82, 0.72, 0.6]) {
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", quality));
    if (blob && blob.size <= SAFE_BYTES) return new File([blob], file.name.replace(/\.\w+$/, ".webp"), { type: "image/webp" });
  }
  throw new Error("Image is too large to upload, even after resizing.");
}

export type UploadResult = { uploaded: { url: string; storageKey: string; name: string }[]; errors: string[] };

export async function uploadImages(files: File[]): Promise<UploadResult> {
  const result: UploadResult = { uploaded: [], errors: [] };
  for (const original of files) {
    try {
      const file = await shrink(original);
      const fd = new FormData();
      fd.append("files", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (json.uploaded?.length) result.uploaded.push(...json.uploaded);
      else result.errors.push(`${original.name}: ${json.errors?.[0]?.error ?? json.error ?? `upload failed (${res.status})`}`);
    } catch (e) {
      result.errors.push(`${original.name}: ${e instanceof Error ? e.message : "upload failed"}`);
    }
  }
  return result;
}
