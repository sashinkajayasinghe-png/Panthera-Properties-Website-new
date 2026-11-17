import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod/v4";
import type { ListingStatus, PropertyType } from "@prisma/client";
import { PROPERTY_TYPES } from "./constants";
import type { SearchFilters } from "./search";

type Hood = { slug: string; name: string; tagline: string | null };

export type Interpretation = { filters: SearchFilters; excludeSold: boolean; source: "ai" | "rules" };

export const aiConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY);

// ── Rule-based interpreter (always available; also the fallback if the AI call fails) ──

const WORD_NUM: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, single: 1 };
const toNum = (s: string) => WORD_NUM[s.toLowerCase()] ?? Number(s);

function money(amount: string, unit?: string) {
  const n = Number(amount.replace(/,/g, ""));
  if (!Number.isFinite(n)) return undefined;
  const u = (unit || "").toLowerCase();
  if (/^(b|bn|billion)/.test(u)) return n * 1e9;
  if (/^(m|mn|mil|million)/.test(u)) return n * 1e6;
  if (/^lakh/.test(u)) return n * 1e5;
  if (/^(k|thousand)/.test(u)) return n * 1e3;
  return n >= 100_000 ? n : n * 1e6; // bare small numbers in a property context usually mean millions
}

export function interpretWithRules(text: string, hoods: Hood[]): Interpretation {
  const t = ` ${text.toLowerCase().replace(/\s+/g, " ")} `;
  const types = new Set<PropertyType>();
  if (/\b(apartment|apartments|flat|condo|condominium)\b/.test(t)) types.add("APARTMENT");
  if (/\bpenthouses?\b/.test(t)) types.add("PENTHOUSE");
  if (/\b(house|houses|home|bungalow)\b/.test(t) && !/\bpenthouse/.test(t)) types.add("HOUSE");
  if (/\bvillas?\b/.test(t)) types.add("VILLA");
  if (/\b(land|plot|bare land|perch(es)?\b.*\bland)\b/.test(t)) types.add("LAND");
  if (/\b(commercial|office|offices|building|shop|retail|warehouse)\b/.test(t)) types.add("COMMERCIAL");

  const unit = "(b|bn|billion|m|mn|mil|million|lakhs?|k|thousand)?";
  const amt = "(?:lkr|rs\\.?|rs)?\\s*([\\d.,]+)\\s*";
  let minPrice: number | undefined;
  let maxPrice: number | undefined;
  const between = t.match(new RegExp(`between ${amt}${unit}\\s*(?:and|-|to)\\s*${amt}${unit}`));
  if (between) {
    minPrice = money(between[1], between[2] || between[4]);
    maxPrice = money(between[3], between[4]);
  } else {
    const max = t.match(new RegExp(`(?:under|below|less than|max(?:imum)?|up to|upto|within|budget(?: of| is)?|no more than)\\s*${amt}${unit}`));
    if (max) maxPrice = money(max[1], max[2]);
    const min = t.match(new RegExp(`(?:over|above|more than|min(?:imum)?|at least|from)\\s*${amt}${unit}(?!\\s*(?:sq|square|perch))`));
    if (min) minPrice = money(min[1], min[2]);
  }

  const bedM = t.match(/\b(\d+|one|two|three|four|five|six|single)[\s-]*(?:\+\s*)?(?:bed|beds|bedroom|bedrooms|br|bhk)\b/);
  const bathM = t.match(/\b(\d+|one|two|three|four|five|six)[\s-]*(?:\+\s*)?(?:bath|baths|bathroom|bathrooms)\b/);
  const areaM = t.match(/(?:at least|min(?:imum)?|over|above)?\s*([\d,]{3,})\s*\+?\s*(?:sq\.?\s*ft|sqft|square feet)/);
  const landM = t.match(/([\d.]+)\s*\+?\s*perch(?:es)?/);

  let location: string | undefined;
  const col = t.match(/\b(?:colombo|col)\s*0?(\d{1,2})\b/);
  if (col && Number(col[1]) >= 1 && Number(col[1]) <= 15) location = `colombo-${col[1].padStart(2, "0")}`;
  if (!location) {
    for (const h of hoods) {
      const names = [h.name, ...(h.tagline ? h.tagline.split(/&|,/) : [])].map((s) => s.trim().toLowerCase()).filter((s) => s.length > 3);
      if (names.some((n) => t.includes(n))) {
        location = h.slug;
        break;
      }
    }
  }

  let sort: SearchFilters["sort"] = "newest";
  if (/\b(cheapest|lowest price|affordable)\b/.test(t)) sort = "price-asc";
  if (/\b(most expensive|highest price|premium)\b/.test(t)) sort = "price-desc";

  const filters: SearchFilters = {
    types: [...types],
    location,
    minPrice,
    maxPrice,
    beds: bedM ? toNum(bedM[1]) : undefined,
    baths: bathM ? toNum(bathM[1]) : undefined,
    minArea: areaM ? Number(areaM[1].replace(/,/g, "")) : undefined,
    minLand: landM ? Number(landM[1]) : undefined,
    sort,
    page: 1,
  };
  return { filters, excludeSold: !/\bsold\b/.test(t), source: "rules" };
}

// ── Claude interpreter (optional; only turns language into filters — never generates listings) ──

const AiFilters = z.object({
  propertyTypes: z.array(z.enum(["APARTMENT", "PENTHOUSE", "HOUSE", "VILLA", "LAND", "COMMERCIAL"])),
  locationSlug: z.string().nullable(),
  minPriceLKR: z.number().nullable(),
  maxPriceLKR: z.number().nullable(),
  minBedrooms: z.number().nullable(),
  minBathrooms: z.number().nullable(),
  minFloorAreaSqft: z.number().nullable(),
  maxFloorAreaSqft: z.number().nullable(),
  minLandPerches: z.number().nullable(),
  maxLandPerches: z.number().nullable(),
  includeSold: z.boolean(),
  sort: z.enum(["newest", "price-asc", "price-desc"]),
});

const SYSTEM = `You convert a visitor's property request for a Colombo, Sri Lanka real estate website into search filters.
Rules:
- Only extract what the visitor actually asked for; use null or an empty list for anything not mentioned.
- Prices are in Sri Lankan Rupees (LKR). Convert "80 million"/"80M"/"80mn" to 80000000, "1.2 billion" to 1200000000, "lakhs" × 100000.
- "under X" sets maxPriceLKR; "over X" sets minPriceLKR. A bedroom count like "three-bedroom" is a minimum.
- "house" or "home" means HOUSE (add VILLA only if villas are mentioned or implied as luxury standalone homes). "flat"/"condo" means APARTMENT. "plot" means LAND. Offices/shops/buildings mean COMMERCIAL.
- locationSlug must be exactly one of the slugs in the provided list, or null. "Colombo 5" → "colombo-05". Match well-known area names (e.g. Kollupitiya → colombo-03, Cinnamon Gardens → colombo-07, Havelock Town → colombo-05, Wellawatte → colombo-06, Bambalapitiya → colombo-04).
- Floor area is in square feet; land extent is in perches.
- includeSold is true only if the visitor explicitly asks about sold properties.`;

let client: Anthropic | null = null;

export async function interpretWithAI(text: string, hoods: Hood[]): Promise<Interpretation | null> {
  if (!aiConfigured()) return null;
  client ??= new Anthropic();
  const model = process.env.ANTHROPIC_MODEL || "claude-opus-5-5";
  const supportsFallbacks = /^claude-(opus-5|fable-5-1|sonnet-5-5)/.test(model);
  try {
    const response = await client.beta.messages.parse(
      {
        model,
        max_tokens: 4000,
        system: SYSTEM,
        output_config: { effort: "low", format: betaZodOutputFormat(AiFilters) },
        ...(supportsFallbacks ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
        messages: [
          {
            role: "user",
            content: `Available location slugs:\n${hoods.map((h) => `${h.slug} = ${h.name}${h.tagline ? ` (${h.tagline})` : ""}`).join("\n")}\n\nVisitor request:\n${text}`,
          },
        ],
      },
      { timeout: 20_000 },
    );
    if (response.stop_reason === "refusal") return null;
    const out = response.parsed_output;
    if (!out) return null;
    const validTypes = out.propertyTypes.filter((t) => PROPERTY_TYPES.includes(t as PropertyType)) as PropertyType[];
    const pos = (n: number | null) => (n != null && Number.isFinite(n) && n > 0 ? n : undefined);
    return {
      source: "ai",
      excludeSold: !out.includeSold,
      filters: {
        types: validTypes,
        location: out.locationSlug && hoods.some((h) => h.slug === out.locationSlug) ? out.locationSlug : undefined,
        minPrice: pos(out.minPriceLKR),
        maxPrice: pos(out.maxPriceLKR),
        beds: pos(out.minBedrooms),
        baths: pos(out.minBathrooms),
        minArea: pos(out.minFloorAreaSqft),
        maxArea: pos(out.maxFloorAreaSqft),
        minLand: pos(out.minLandPerches),
        maxLand: pos(out.maxLandPerches),
        sort: out.sort,
        page: 1,
      },
    };
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) console.warn("[assistant] rate limited — using rule-based search");
    else if (error instanceof Anthropic.APIError) console.error(`[assistant] API error ${error.status}: ${error.message}`);
    else console.error("[assistant] interpretation failed", error);
    return null;
  }
}

export function describeFilters(f: SearchFilters, hoods: Hood[], typeLabel: (t: PropertyType) => string) {
  const parts: string[] = [];
  if (f.beds) parts.push(`${f.beds}+ bedroom`);
  parts.push(f.types.length ? f.types.map((t) => typeLabel(t).toLowerCase()).join(" or ") : "property");
  const hood = f.location ? hoods.find((h) => h.slug === f.location)?.name : undefined;
  if (hood) parts.push(`in ${hood}`);
  const m = (v: number) => (v >= 1e9 ? `${v / 1e9}B` : `${Math.round(v / 1e5) / 10}M`);
  if (f.minPrice && f.maxPrice) parts.push(`between LKR ${m(f.minPrice)} and ${m(f.maxPrice)}`);
  else if (f.maxPrice) parts.push(`under LKR ${m(f.maxPrice)}`);
  else if (f.minPrice) parts.push(`over LKR ${m(f.minPrice)}`);
  if (f.baths) parts.push(`with ${f.baths}+ bathrooms`);
  if (f.minArea) parts.push(`from ${f.minArea.toLocaleString("en")} sq ft`);
  if (f.minLand) parts.push(`on ${f.minLand}+ perches`);
  return parts.join(" ");
}

export type { ListingStatus };
