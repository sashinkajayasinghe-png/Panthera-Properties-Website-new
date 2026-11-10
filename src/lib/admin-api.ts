import "server-only";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "./auth";

/** Rejects cross-site requests to admin endpoints (defence in depth on top of SameSite cookies). */
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true; // same-origin fetches from older browsers may omit it; cookie is SameSite=Lax
  try {
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Auth + origin guard for mutating admin routes. Returns a Response on failure, otherwise null. */
export async function guard(req: Request): Promise<Response | null> {
  if (!sameOrigin(req)) return Response.json({ error: "Forbidden" }, { status: 403 });
  const admin = await requireAdminApi();
  return admin instanceof Response ? admin : null;
}

export function revalidateSite(slug?: string) {
  revalidatePath("/", "layout");
  if (slug) revalidatePath(`/properties/${slug}`);
}
