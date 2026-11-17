import { prisma } from "@/lib/prisma";
import { guard, revalidateSite } from "@/lib/admin-api";
import { homepageSchema } from "@/lib/content";
import { fieldErrors } from "@/lib/validation";

export async function PUT(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  const parsed = homepageSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Please check the highlighted fields.", fields: fieldErrors(parsed.error) }, { status: 422 });
  await prisma.siteContent.upsert({
    where: { key: "homepage" },
    update: { value: parsed.data },
    create: { key: "homepage", value: parsed.data },
  });
  revalidateSite();
  return Response.json({ ok: true });
}
