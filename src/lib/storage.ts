import "server-only";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { prisma } from "./prisma";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

const cloud = () => {
  const { CLOUDINARY_CLOUD_NAME: name, CLOUDINARY_API_KEY: key, CLOUDINARY_API_SECRET: secret } = process.env;
  return name && key && secret ? { name, key, secret, folder: process.env.CLOUDINARY_FOLDER || "panthera" } : null;
};

export const storageProvider = () => (cloud() ? "cloudinary" : "database");

const sign = (params: Record<string, string>, secret: string) =>
  createHash("sha1")
    .update(
      Object.keys(params)
        .sort()
        .map((k) => `${k}=${params[k]}`)
        .join("&") + secret,
    )
    .digest("hex");

export type StoredImage = { url: string; storageKey: string; width?: number; height?: number };

/**
 * Stores an uploaded photograph. Images are only resized and re-encoded for the web —
 * no generative or content-altering processing is applied.
 */
export async function storeImage(file: File): Promise<StoredImage> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) throw new Error("Unsupported image type. Use JPEG, PNG, WebP or AVIF.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Image is larger than 12 MB.");
  const input = Buffer.from(await file.arrayBuffer());

  // Normalise orientation, cap dimensions and strip metadata (incl. GPS) before storing.
  const pipeline = sharp(input, { failOn: "error" }).rotate().resize({ width: 2800, height: 2800, fit: "inside", withoutEnlargement: true });
  const { data, info } = await pipeline.webp({ quality: 86 }).toBuffer({ resolveWithObject: true });

  const c = cloud();
  if (c) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const params = { folder: c.folder, timestamp };
    const form = new FormData();
    form.append("file", new Blob([new Uint8Array(data)], { type: "image/webp" }), "upload.webp");
    form.append("api_key", c.key);
    form.append("timestamp", timestamp);
    form.append("folder", c.folder);
    form.append("signature", sign(params, c.secret));
    const res = await fetch(`https://api.cloudinary.com/v1_1/${c.name}/image/upload`, { method: "POST", body: form });
    if (!res.ok) throw new Error(`Cloud upload failed (${res.status})`);
    const json = (await res.json()) as { secure_url: string; public_id: string };
    return { url: json.secure_url, storageKey: `cloudinary:${json.public_id}`, width: info.width, height: info.height };
  }

  const media = await prisma.mediaFile.create({
    data: {
      filename: file.name.slice(0, 200) || "image.webp",
      mimeType: "image/webp",
      size: data.length,
      data: new Uint8Array(data),
    },
    select: { id: true },
  });
  return { url: `/api/media/${media.id}`, storageKey: `db:${media.id}`, width: info.width, height: info.height };
}

export async function deleteStoredImage(storageKey?: string | null) {
  if (!storageKey) return;
  try {
    if (storageKey.startsWith("db:")) {
      await prisma.mediaFile.deleteMany({ where: { id: storageKey.slice(3) } });
    } else if (storageKey.startsWith("cloudinary:")) {
      const c = cloud();
      if (!c) return;
      const public_id = storageKey.slice("cloudinary:".length);
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const body = new URLSearchParams({
        public_id,
        timestamp,
        api_key: c.key,
        signature: sign({ public_id, timestamp }, c.secret),
      });
      await fetch(`https://api.cloudinary.com/v1_1/${c.name}/image/destroy`, { method: "POST", body });
    }
  } catch (e) {
    console.error("[storage] delete failed", e);
  }
}
