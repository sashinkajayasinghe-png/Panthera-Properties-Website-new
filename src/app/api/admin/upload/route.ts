import { guard } from "@/lib/admin-api";
import { storeImage } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  const form = await req.formData().catch(() => null);
  const files = (form?.getAll("files") ?? []).filter((f): f is File => f instanceof File);
  if (!files.length) return Response.json({ error: "No files received." }, { status: 400 });
  if (files.length > 20) return Response.json({ error: "Upload at most 20 images at a time." }, { status: 400 });

  const uploaded: { url: string; storageKey: string; name: string }[] = [];
  const errors: { name: string; error: string }[] = [];
  for (const file of files) {
    try {
      const stored = await storeImage(file);
      uploaded.push({ url: stored.url, storageKey: stored.storageKey, name: file.name });
    } catch (e) {
      errors.push({ name: file.name, error: e instanceof Error ? e.message : "Upload failed" });
    }
  }
  return Response.json({ uploaded, errors }, { status: uploaded.length ? 200 : 400 });
}
