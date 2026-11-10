import { z } from "zod";

/** Images must come from our upload store or an allowed image CDN (configured in next.config.ts). */
export const IMAGE_URL_RE = /^(\/api\/media\/[a-z0-9]+|https:\/\/(images\.unsplash\.com|res\.cloudinary\.com)\/\S+)$/i;
export const imageUrl = z.string().trim().max(1000).regex(IMAGE_URL_RE, "Upload the image, or use an Unsplash/Cloudinary URL");

const trimmed = (max: number) => z.string().trim().max(max);
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

export const leadSchema = z
  .object({
    type: z.enum(["PROPERTY_INQUIRY", "VIEWING_REQUEST", "SELL_PROPERTY", "CONSULTATION", "ASSISTANT_REQUIREMENTS"]),
    name: trimmed(120).min(2, "Please enter your name"),
    email: z.string().trim().toLowerCase().email("Please enter a valid email address").max(200),
    phone: optionalText(40).refine((v) => !v || /^[+()\d\s-]{7,40}$/.test(v), "Please enter a valid phone number"),
    message: optionalText(4000),
    propertyId: optionalText(40),
    preferredDate: optionalText(10).refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "Invalid date"),
    preferredTime: optionalText(40),
    details: z.record(z.string(), z.union([z.string().max(1000), z.number(), z.boolean(), z.null()])).optional(),
    source: optionalText(200),
    consent: z.literal(true, { error: "Please agree to be contacted" }),
    // Spam protection: honeypot must stay empty, and the form must not be submitted instantly.
    website: z.string().max(0, "Spam detected").optional(),
    startedAt: z.number().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.type === "VIEWING_REQUEST" && !v.preferredDate)
      ctx.addIssue({ code: "custom", path: ["preferredDate"], message: "Please choose a preferred date" });
    if (v.preferredDate) {
      const d = new Date(`${v.preferredDate}T00:00:00+05:30`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (Number.isNaN(d.getTime()) || d.getTime() < today.getTime() - 86400000)
        ctx.addIssue({ code: "custom", path: ["preferredDate"], message: "Please choose a future date" });
    }
  });

export type LeadInput = z.input<typeof leadSchema>;

const intOrNull = z.preprocess(
  (v) => (v === "" || v == null ? null : Number(v)),
  z.number().int().min(0).max(1_000_000).nullable(),
);
const floatOrNull = z.preprocess(
  (v) => (v === "" || v == null ? null : Number(v)),
  z.number().min(0).max(1_000_000).nullable(),
);

export const propertySchema = z.object({
  title: trimmed(160).min(3),
  slug: trimmed(90)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens")
    .optional()
    .or(z.literal("")),
  summary: trimmed(300).optional().default(""),
  description: trimmed(20000).min(10, "Please add a description"),
  type: z.enum(["APARTMENT", "PENTHOUSE", "HOUSE", "VILLA", "LAND", "COMMERCIAL"]),
  status: z.enum(["AVAILABLE", "UNDER_OFFER", "SOLD"]),
  published: z.boolean(),
  featured: z.boolean(),
  investment: z.boolean(),
  isSample: z.boolean().default(false),
  price: z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().min(0).max(1e12).nullable()),
  priceOnRequest: z.boolean(),
  bedrooms: intOrNull,
  bathrooms: intOrNull,
  floorArea: intOrNull,
  landExtent: floatOrNull,
  address: trimmed(300).optional().default(""),
  lat: z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().min(-90).max(90).nullable()),
  lng: z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().min(-180).max(180).nullable()),
  features: z.array(trimmed(120)).max(60).default([]),
  amenities: z.array(trimmed(120)).max(60).default([]),
  virtualTourUrl: z.string().trim().url().max(1000).optional().or(z.literal("")),
  videoUrl: z.string().trim().url().max(1000).optional().or(z.literal("")),
  neighborhoodId: z.string().min(1, "Please choose a location"),
  images: z
    .array(
      z.object({
        url: imageUrl,
        alt: trimmed(200).optional().default(""),
        storageKey: z.string().max(300).optional().nullable(),
      }),
    )
    .max(40),
});

export type PropertyInput = z.input<typeof propertySchema>;

export const leadUpdateSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "VIEWING_SCHEDULED", "NEGOTIATING", "CLOSED"]).optional(),
  adminNotes: z.string().max(10000).optional(),
});

export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
