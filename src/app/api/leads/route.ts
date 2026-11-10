import { prisma } from "@/lib/prisma";
import { fieldErrors, leadSchema } from "@/lib/validation";
import { clientIp, hashIp, rateLimit } from "@/lib/rate-limit";
import { notifyNewLead } from "@/lib/email";

const MIN_FILL_MS = 2500;

export async function POST(req: Request) {
  const ip = await clientIp();
  if (!rateLimit(`lead:${ip}`, 6, 10 * 60_000))
    return Response.json({ error: "Too many submissions. Please try again later or contact us on WhatsApp." }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);
    if (errors.website) return Response.json({ error: "Submission rejected." }, { status: 400 });
    return Response.json({ error: "Please check the highlighted fields.", fields: errors }, { status: 422 });
  }
  const data = parsed.data;
  if (data.startedAt && Date.now() - data.startedAt < MIN_FILL_MS)
    return Response.json({ error: "Submission rejected. Please try again." }, { status: 400 });

  let property: { id: string; title: string } | null = null;
  if (data.propertyId) {
    property = await prisma.property.findFirst({ where: { id: data.propertyId, published: true }, select: { id: true, title: true } });
    if (!property) return Response.json({ error: "That property is no longer available." }, { status: 404 });
  }

  const lead = await prisma.lead.create({
    data: {
      type: data.type,
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      preferredDate: data.preferredDate ? new Date(`${data.preferredDate}T00:00:00+05:30`) : null,
      preferredTime: data.preferredTime,
      details: data.details ?? undefined,
      source: data.source,
      propertyId: property?.id,
      ipHash: hashIp(ip),
    },
  });

  const emailed = await notifyNewLead(lead, property?.title);
  if (emailed) await prisma.lead.update({ where: { id: lead.id }, data: { emailNotified: true } });

  // The lead is saved; we only report what actually happened.
  return Response.json({ ok: true, id: lead.id }, { status: 201 });
}
