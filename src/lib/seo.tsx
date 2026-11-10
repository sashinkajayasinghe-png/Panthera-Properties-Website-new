import type { Neighborhood, Property, PropertyImage } from "@prisma/client";
import { BRAND, PROPERTY_TYPE_LABEL, SITE_URL } from "./constants";

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output with "<" escaped is safe to inline.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export const absoluteUrl = (u: string) => (u.startsWith("http") ? u : `${SITE_URL}${u.startsWith("/") ? "" : "/"}${u}`);

export function organizationJsonLd(c: { logoUrl?: string; email?: string; address?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${SITE_URL}/#organization`,
    name: BRAND.name,
    url: SITE_URL,
    telephone: BRAND.phoneE164,
    ...(c.email ? { email: c.email } : {}),
    logo: absoluteUrl(c.logoUrl || "/brand/logo-full.png"),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Colombo",
      addressCountry: "LK",
      ...(c.address ? { streetAddress: c.address } : {}),
    },
    areaServed: { "@type": "City", name: "Colombo" },
  };
}

export function propertyJsonLd(p: Property & { neighborhood: Neighborhood; images: PropertyImage[] }) {
  const url = `${SITE_URL}/properties/${p.slug}`;
  const isLand = p.type === "LAND";
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: p.title,
    url,
    description: p.summary || p.description.slice(0, 300),
    datePosted: p.listedAt.toISOString(),
    image: p.images.slice(0, 6).map((i) => absoluteUrl(i.url)),
    ...(p.price && !p.priceOnRequest
      ? {
          offers: {
            "@type": "Offer",
            price: p.price,
            priceCurrency: "LKR",
            availability: p.status === "SOLD" ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
            seller: { "@id": `${SITE_URL}/#organization` },
          },
        }
      : {}),
    about: {
      "@type": isLand ? "Landform" : p.type === "APARTMENT" || p.type === "PENTHOUSE" ? "Apartment" : p.type === "COMMERCIAL" ? "Place" : "SingleFamilyResidence",
      name: `${PROPERTY_TYPE_LABEL[p.type]} in ${p.neighborhood.name}`,
      address: { "@type": "PostalAddress", addressLocality: p.neighborhood.name, addressRegion: "Western Province", addressCountry: "LK" },
      ...(p.lat && p.lng ? { geo: { "@type": "GeoCoordinates", latitude: p.lat, longitude: p.lng } } : {}),
      ...(p.bedrooms != null ? { numberOfRooms: p.bedrooms, numberOfBedrooms: p.bedrooms } : {}),
      ...(p.bathrooms != null ? { numberOfBathroomsTotal: p.bathrooms } : {}),
      ...(p.floorArea ? { floorSize: { "@type": "QuantitativeValue", value: p.floorArea, unitCode: "FTK" } } : {}),
    },
  };
}
