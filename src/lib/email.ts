import "server-only";
import nodemailer from "nodemailer";
import type { Lead } from "@prisma/client";
import { LEAD_TYPE_LABEL, SITE_URL } from "./constants";

export const emailConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.NOTIFY_EMAIL);

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/**
 * Notifies the brokerage of a new lead. Returns true only if the SMTP server accepted the message.
 * Never throws — a failed notification must not lose the saved lead.
 */
export async function notifyNewLead(lead: Lead, propertyTitle?: string | null): Promise<boolean> {
  if (!emailConfigured()) return false;
  try {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    const rows: [string, string | null | undefined][] = [
      ["Type", LEAD_TYPE_LABEL[lead.type]],
      ["Name", lead.name],
      ["Email", lead.email],
      ["Phone", lead.phone],
      ["Property", propertyTitle],
      ["Preferred date", lead.preferredDate?.toISOString().slice(0, 10)],
      ["Preferred time", lead.preferredTime],
      ["Message", lead.message],
    ];
    if (lead.details && typeof lead.details === "object") {
      for (const [k, v] of Object.entries(lead.details as Record<string, unknown>))
        if (v != null && v !== "") rows.push([k, String(v)]);
    }
    const html = `<h2 style="font-family:Georgia,serif">New ${esc(LEAD_TYPE_LABEL[lead.type])}</h2><table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px">${rows
      .filter(([, v]) => v)
      .map(([k, v]) => `<tr><td style="color:#777">${esc(k)}</td><td>${esc(String(v)).replace(/\n/g, "<br>")}</td></tr>`)
      .join("")}</table><p><a href="${SITE_URL}/admin/leads?id=${lead.id}">Open in Panthera admin</a></p>`;
    await transport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.NOTIFY_EMAIL,
      replyTo: lead.email,
      subject: `New ${LEAD_TYPE_LABEL[lead.type].toLowerCase()} — ${lead.name}`,
      html,
    });
    return true;
  } catch (e) {
    console.error("[email] notification failed", e);
    return false;
  }
}
