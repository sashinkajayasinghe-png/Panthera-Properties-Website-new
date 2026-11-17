import "server-only";
import { cache } from "react";
import { z } from "zod";
import { prisma } from "./prisma";
import { unsplash } from "./constants";
import { imageUrl } from "./validation";

export const homepageSchema = z.object({
  heroHeadline: z.string().trim().min(1).max(160),
  heroSubtext: z.string().trim().max(300),
  heroImage: imageUrl,
  heroVideo: z.union([z.literal(""), z.string().trim().url().startsWith("https://").max(1000)]).optional().default(""),
  introHeadline: z.string().trim().min(1).max(200),
  introBody: z.string().trim().max(2000),
  introImage: imageUrl,
  consultationHeadline: z.string().trim().min(1).max(200),
  consultationBody: z.string().trim().max(600),
  consultationImage: imageUrl,
  logoUrl: z.union([z.literal(""), imageUrl]).optional().default(""),
  email: z.union([z.literal(""), z.string().trim().email().max(200)]).optional().default(""),
  address: z.string().max(300).optional().default(""),
});

export type HomepageContent = z.infer<typeof homepageSchema>;

export const DEFAULT_HOMEPAGE: HomepageContent = {
  heroHeadline: "Exceptional spaces.\nExtraordinary living.",
  heroSubtext: "Discover remarkable properties across Colombo and Sri Lanka.",
  heroImage: unsplash("1600585154340-be6161a56a0c", 2400),
  heroVideo: "",
  introHeadline: "More than property.\nA distinctive way of living.",
  introBody:
    "Panthera Properties is a Colombo brokerage for people who expect more from a home than square footage. We listen first — to how you live, work and entertain — and then look for the residences, villas and plots that genuinely fit. Every introduction is considered, every viewing is prepared, and every negotiation is handled with discretion.",
  introImage: unsplash("1600607687939-ce8a6c25118c", 1800),
  consultationHeadline: "Your next chapter\nbegins here.",
  consultationBody:
    "Whether you are searching, selling or simply exploring the market, begin with a private conversation. We will respond personally.",
  consultationImage: unsplash("1600585154526-990dced4db0d", 2400),
  logoUrl: "",
  email: "",
  address: "Colombo, Sri Lanka",
};

export const getHomepageContent = cache(async (): Promise<HomepageContent> => {
  try {
    const row = await prisma.siteContent.findUnique({ where: { key: "homepage" } });
    if (!row) return DEFAULT_HOMEPAGE;
    const parsed = homepageSchema.partial().safeParse(row.value);
    return { ...DEFAULT_HOMEPAGE, ...(parsed.success ? parsed.data : {}) };
  } catch {
    return DEFAULT_HOMEPAGE;
  }
});
