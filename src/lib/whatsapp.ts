import { BRAND, SITE_URL } from "./constants";

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${BRAND.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function propertyWhatsappMessage(p: { title: string; slug: string; neighborhood?: { name: string } | null }) {
  const where = p.neighborhood ? ` in ${p.neighborhood.name}` : "";
  return `Hello Panthera Properties, I'm interested in "${p.title}"${where}. ${SITE_URL}/properties/${p.slug}`;
}
