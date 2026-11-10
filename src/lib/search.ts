import type { ListingStatus, Prisma, PropertyType } from "@prisma/client";
import { getCategory, LISTING_STATUSES, PROPERTY_TYPES } from "./constants";

export type SortKey = "newest" | "price-asc" | "price-desc";

export type SearchFilters = {
  types: PropertyType[];
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  minArea?: number;
  maxArea?: number;
  minLand?: number;
  maxLand?: number;
  status?: ListingStatus;
  sort: SortKey;
  page: number;
};

type Params = Record<string, string | string[] | undefined> | URLSearchParams;

function get(params: Params, key: string): string | undefined {
  if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
  const v = params[key];
  return Array.isArray(v) ? v[0] : v;
}

function num(v?: string) {
  if (!v) return undefined;
  const n = Number(v.replace(/[, ]/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export function parseFilters(params: Params): SearchFilters {
  const typesRaw = get(params, "type")?.toUpperCase().split(",") ?? [];
  const types = typesRaw.filter((t): t is PropertyType => PROPERTY_TYPES.includes(t as PropertyType));
  const status = get(params, "status")?.toUpperCase();
  const sort = get(params, "sort");
  const category = get(params, "category");
  return {
    types,
    category: category && getCategory(category) ? category : undefined,
    location: get(params, "location") || undefined,
    minPrice: num(get(params, "minPrice")),
    maxPrice: num(get(params, "maxPrice")),
    beds: num(get(params, "beds")),
    baths: num(get(params, "baths")),
    minArea: num(get(params, "minArea")),
    maxArea: num(get(params, "maxArea")),
    minLand: num(get(params, "minLand")),
    maxLand: num(get(params, "maxLand")),
    status: LISTING_STATUSES.includes(status as ListingStatus) ? (status as ListingStatus) : undefined,
    sort: sort === "price-asc" || sort === "price-desc" ? sort : "newest",
    page: Math.max(1, Math.floor(num(get(params, "page")) ?? 1)),
  };
}

export function filtersToQuery(f: Partial<SearchFilters>): string {
  const q = new URLSearchParams();
  if (f.types?.length) q.set("type", f.types.join(",").toLowerCase());
  if (f.category) q.set("category", f.category);
  if (f.location) q.set("location", f.location);
  const nums: (keyof SearchFilters)[] = ["minPrice", "maxPrice", "beds", "baths", "minArea", "maxArea", "minLand", "maxLand"];
  for (const k of nums) if (f[k] != null) q.set(k, String(f[k]));
  if (f.status) q.set("status", f.status.toLowerCase());
  if (f.sort && f.sort !== "newest") q.set("sort", f.sort);
  if (f.page && f.page > 1) q.set("page", String(f.page));
  return q.toString();
}

export function buildWhere(f: SearchFilters): Prisma.PropertyWhereInput {
  const and: Prisma.PropertyWhereInput[] = [{ published: true }];
  if (f.types.length) and.push({ type: { in: f.types } });
  if (f.category) and.push({ type: { in: getCategory(f.category)!.types } });
  if (f.location) and.push({ neighborhood: { slug: f.location } });
  if (f.minPrice != null || f.maxPrice != null)
    and.push({ priceOnRequest: false, price: { gte: f.minPrice, lte: f.maxPrice } });
  if (f.beds != null) and.push({ bedrooms: { gte: f.beds } });
  if (f.baths != null) and.push({ bathrooms: { gte: f.baths } });
  if (f.minArea != null || f.maxArea != null) and.push({ floorArea: { gte: f.minArea, lte: f.maxArea } });
  if (f.minLand != null || f.maxLand != null) and.push({ landExtent: { gte: f.minLand, lte: f.maxLand } });
  if (f.status) and.push({ status: f.status });
  return { AND: and };
}

export function buildOrderBy(sort: SortKey): Prisma.PropertyOrderByWithRelationInput[] {
  if (sort === "price-asc") return [{ price: { sort: "asc", nulls: "last" } }, { listedAt: "desc" }];
  if (sort === "price-desc") return [{ price: { sort: "desc", nulls: "last" } }, { listedAt: "desc" }];
  return [{ listedAt: "desc" }];
}

export const PAGE_SIZE = 12;
