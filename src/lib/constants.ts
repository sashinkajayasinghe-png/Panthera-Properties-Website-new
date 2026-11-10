import type { LeadStatus, LeadType, ListingStatus, PropertyType } from "@prisma/client";

export const BRAND = {
  name: "Panthera Properties",
  shortName: "Panthera",
  tagline: "Exceptional spaces. Extraordinary living.",
  city: "Colombo",
  country: "Sri Lanka",
  phoneDisplay: "+94 77 887 9643",
  phoneE164: "+94778879643",
  whatsapp: "94778879643",
} as const;

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const PROPERTY_TYPE_LABEL: Record<PropertyType, string> = {
  APARTMENT: "Apartment",
  PENTHOUSE: "Penthouse",
  HOUSE: "House",
  VILLA: "Villa",
  LAND: "Land",
  COMMERCIAL: "Commercial",
};

export const PROPERTY_TYPES = Object.keys(PROPERTY_TYPE_LABEL) as PropertyType[];

export const LISTING_STATUS_LABEL: Record<ListingStatus, string> = {
  AVAILABLE: "Available",
  UNDER_OFFER: "Under Offer",
  SOLD: "Sold",
};

export const LISTING_STATUSES = Object.keys(LISTING_STATUS_LABEL) as ListingStatus[];

export const LEAD_TYPE_LABEL: Record<LeadType, string> = {
  PROPERTY_INQUIRY: "Property enquiry",
  VIEWING_REQUEST: "Viewing request",
  SELL_PROPERTY: "Sell a property",
  CONSULTATION: "Consultation",
  ASSISTANT_REQUIREMENTS: "Assistant brief",
};

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  VIEWING_SCHEDULED: "Viewing Scheduled",
  NEGOTIATING: "Negotiating",
  CLOSED: "Closed",
};

export const LEAD_STATUSES = Object.keys(LEAD_STATUS_LABEL) as LeadStatus[];

export type CategoryDef = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  image: string;
  types: PropertyType[];
};

const u = (id: string, w = 2000) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
export const unsplash = u;

export const CATEGORIES: CategoryDef[] = [
  {
    slug: "luxury-apartments",
    title: "Luxury Apartments",
    eyebrow: "Vertical living",
    description: "Residences in Colombo's most considered towers — light, views and service, high above the city.",
    image: "/collections/luxury-apartments.webp",
    types: ["APARTMENT"],
  },
  {
    slug: "houses-villas",
    title: "Houses & Villas",
    eyebrow: "Private ground",
    description: "Family homes and tropical villas with gardens, courtyards and the quiet of a residential lane.",
    image: "/collections/houses-villas.webp",
    types: ["HOUSE", "VILLA"],
  },
  {
    slug: "land",
    title: "Lands",
    eyebrow: "A blank canvas",
    description: "Residential land in established neighbourhoods, ready for an architect's first sketch.",
    image: "/collections/land.webp",
    types: ["LAND"],
  },
  {
    slug: "commercial-properties",
    title: "Commercial Properties",
    eyebrow: "Business addresses",
    description: "Offices, retail and mixed-use buildings in well-connected commercial locations across Colombo.",
    image: "/collections/commercial-properties.webp",
    types: ["COMMERCIAL"],
  },
];

export const getCategory = (slug: string) => CATEGORIES.find((c) => c.slug === slug);

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
] as const;
