import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPropertyBySlug, getSimilar } from "@/lib/queries";
import { LISTING_STATUS_LABEL, PROPERTY_TYPE_LABEL } from "@/lib/constants";
import { formatArea, formatLand, formatLKR, formatLKRCompact } from "@/lib/format";
import { propertyWhatsappMessage, whatsappLink } from "@/lib/whatsapp";
import { absoluteUrl, JsonLd, propertyJsonLd } from "@/lib/seo";
import { Gallery } from "@/components/property/Gallery";
import { PropertyMap } from "@/components/property/PropertyMap";
import { EnquiryPanel } from "@/components/property/EnquiryPanel";
import { MediaEmbed } from "@/components/property/MediaEmbed";
import { SampleBadge, StatusBadge } from "@/components/property/Badges";
import { ListingGrid } from "@/components/search/Listings";
import { FadeUp, RevealLines } from "@/components/motion/Reveal";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPropertyBySlug((await params).slug);
  if (!p) return { title: "Property not found" };
  const title = `${p.title} — ${PROPERTY_TYPE_LABEL[p.type]} for sale in ${p.neighborhood.name}`;
  const description = `${p.summary ?? p.description.replace(/\s+/g, " ").slice(0, 150)} ${formatLKR(p.price, p.priceOnRequest)}.`;
  return {
    title,
    description,
    alternates: { canonical: `/properties/${p.slug}` },
    robots: p.isSample ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      title,
      description,
      url: `/properties/${p.slug}`,
      images: p.images.slice(0, 1).map((i) => ({ url: absoluteUrl(i.url), alt: i.alt ?? p.title })),
    },
  };
}

export default async function PropertyPage({ params }: Props) {
  const p = await getPropertyBySlug((await params).slug);
  if (!p) notFound();
  const similar = await getSimilar(p);
  const lat = p.lat ?? p.neighborhood.lat;
  const lng = p.lng ?? p.neighborhood.lng;
  const sold = p.status === "SOLD";
  const wa = whatsappLink(propertyWhatsappMessage(p));

  const facts: [string, string | null][] = [
    ["Asking price", formatLKR(p.price, p.priceOnRequest)],
    ["Property type", PROPERTY_TYPE_LABEL[p.type]],
    ["Location", p.neighborhood.name],
    ["Bedrooms", p.bedrooms != null ? String(p.bedrooms) : null],
    ["Bathrooms", p.bathrooms != null ? String(p.bathrooms) : null],
    ["Interior floor area", formatArea(p.floorArea)],
    ["Land extent", formatLand(p.landExtent)],
    ["Status", LISTING_STATUS_LABEL[p.status]],
  ];

  return (
    <article>
      <JsonLd data={propertyJsonLd(p)} />
      <Gallery images={p.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt }))} title={p.title} />

      {p.isSample ? (
        <div className="container-x mt-8">
          <p className="border border-gold/50 bg-gold/10 px-5 py-4 text-sm">
            <strong className="text-gold">Sample listing — not a real property for sale.</strong> This entry exists to test the website and uses
            illustrative stock photography. Please do not enquire about it as an available property.
          </p>
        </div>
      ) : null}

      <div className="container-x pt-14 md:pt-20">
        <nav aria-label="Breadcrumb" className="mb-8 text-xs uppercase tracking-[0.2em] text-mist">
          <Link href="/properties" className="link-underline hover:text-ivory">Properties</Link>
          <span className="mx-3">/</span>
          <Link href={`/neighborhoods/${p.neighborhood.slug}`} className="link-underline hover:text-ivory">{p.neighborhood.name}</Link>
        </nav>

        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="mb-6 flex flex-wrap gap-2">
              {p.isSample ? <SampleBadge /> : null}
              <StatusBadge status={p.status} />
            </div>
            <p className="eyebrow mb-4">{p.neighborhood.name} · {PROPERTY_TYPE_LABEL[p.type]}</p>
            <RevealLines as="h1" immediate text={p.title} className="display text-[clamp(2.6rem,6vw,6rem)]" />
            {p.summary ? <FadeUp className="mt-8 max-w-2xl font-serif text-2xl font-light leading-snug text-ivory/85">{p.summary}</FadeUp> : null}
          </div>
          <div className="lg:col-span-4 lg:pt-10">
            <p className="eyebrow">Asking price</p>
            <p className="mt-3 font-serif text-5xl text-gold">{formatLKRCompact(p.price, p.priceOnRequest)}</p>
            {p.price && !p.priceOnRequest ? <p className="mt-2 text-sm text-mist">{formatLKR(p.price)}</p> : null}
            <div className="mt-8 flex flex-wrap gap-3">
              {!sold ? <a href="#viewing" className="btn btn-solid">Schedule a viewing</a> : null}
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-gold">WhatsApp enquiry</a>
            </div>
          </div>
        </div>

        <dl className="mt-16 grid grid-cols-2 gap-px border-y border-line bg-line md:grid-cols-4">
          {facts.filter(([, v]) => v).map(([k, v]) => (
            <div key={k} className="bg-ink py-6 pr-4">
              <dt className="eyebrow">{k}</dt>
              <dd className="mt-2 font-serif text-2xl">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-20 grid gap-16 lg:grid-cols-12">
          <div className="space-y-16 lg:col-span-7">
            <section aria-labelledby="desc">
              <h2 id="desc" className="eyebrow mb-6">The residence</h2>
              <div className="space-y-5 text-base leading-[1.85] text-ivory/85">
                {p.description.split(/\n{2,}/).map((para, i) => (
                  <p key={i} className={i === 0 && p.isSample ? "text-sm text-gold" : undefined}>{para}</p>
                ))}
              </div>
            </section>

            {p.features.length ? (
              <section aria-labelledby="features">
                <h2 id="features" className="eyebrow mb-6">Features</h2>
                <ul className="grid gap-x-8 sm:grid-cols-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 border-b border-line py-3 text-sm"><span className="text-gold">—</span>{f}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {p.amenities.length ? (
              <section aria-labelledby="amenities">
                <h2 id="amenities" className="eyebrow mb-6">Amenities</h2>
                <ul className="flex flex-wrap gap-2">
                  {p.amenities.map((a) => (
                    <li key={a} className="border border-line px-4 py-2 text-xs uppercase tracking-[0.14em] text-ivory/80">{a}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {p.videoUrl ? (
              <section aria-labelledby="video">
                <h2 id="video" className="eyebrow mb-6">Video walkthrough</h2>
                <MediaEmbed url={p.videoUrl} title={`${p.title} — video walkthrough`} />
              </section>
            ) : null}
            {p.virtualTourUrl ? (
              <section aria-labelledby="tour">
                <h2 id="tour" className="eyebrow mb-6">Virtual tour</h2>
                <MediaEmbed url={p.virtualTourUrl} title={`${p.title} — virtual tour`} />
              </section>
            ) : null}

            {lat != null && lng != null ? (
              <section aria-labelledby="map">
                <h2 id="map" className="eyebrow mb-6">Location</h2>
                <PropertyMap lat={lat} lng={lng} label={p.neighborhood.name} approximate />
                <p className="mt-3 text-xs text-mist">The exact address is shared with qualified buyers on request.</p>
              </section>
            ) : null}
          </div>

          <aside className="lg:col-span-5">
            <div className="border border-line p-6 md:p-10 lg:sticky lg:top-28">
              <span id="viewing" className="block scroll-mt-28" />
              <p className="eyebrow mb-3 text-gold">Private enquiry</p>
              <p className="display mb-8 text-4xl">Arrange a conversation</p>
              <EnquiryPanel propertyId={p.id} propertyTitle={p.title} sold={sold} />
              <p className="mt-8 border-t border-line pt-6 text-sm text-mist">
                Prefer to talk now?{" "}
                <a href={wa} target="_blank" rel="noopener noreferrer" className="text-ivory underline underline-offset-4">
                  Message us on WhatsApp
                </a>
              </p>
            </div>
          </aside>
        </div>
      </div>

      {similar.length ? (
        <section className="container-x py-28 md:py-36" aria-labelledby="similar">
          <div className="mb-12 flex items-end justify-between gap-6">
            <h2 id="similar" className="display text-[clamp(2.4rem,5vw,4.5rem)]">Similar properties</h2>
            <Link href={`/properties?type=${p.type.toLowerCase()}`} className="link-underline text-xs uppercase tracking-[0.24em]">View more →</Link>
          </div>
          <ListingGrid items={similar} />
        </section>
      ) : <div className="pb-28" />}
    </article>
  );
}
