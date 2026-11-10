import { prisma } from "@/lib/prisma";
import { guard, revalidateSite } from "@/lib/admin-api";

/** Removes every seeded sample listing (isSample = true) in one step, ready for real listings. */
export async function DELETE(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  const { count } = await prisma.property.deleteMany({ where: { isSample: true } });
  revalidateSite();
  return Response.json({ ok: true, count });
}
