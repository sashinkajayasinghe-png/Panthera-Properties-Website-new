import { prisma } from "@/lib/prisma";
import { guard } from "@/lib/admin-api";
import { leadUpdateSchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const denied = await guard(req);
  if (denied) return denied;
  const { id } = await params;
  const parsed = leadUpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid update" }, { status: 400 });
  const lead = await prisma.lead.update({ where: { id }, data: parsed.data }).catch(() => null);
  if (!lead) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ ok: true, status: lead.status, adminNotes: lead.adminNotes });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const denied = await guard(req);
  if (denied) return denied;
  const { id } = await params;
  const res = await prisma.lead.deleteMany({ where: { id } });
  if (!res.count) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ ok: true });
}
