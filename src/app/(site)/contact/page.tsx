import type { Metadata } from "next";
import { BRAND } from "@/lib/constants";
import { getHomepageContent } from "@/lib/content";
import { getNeighborhoods } from "@/lib/queries";
import { whatsappLink } from "@/lib/whatsapp";
import { PageHero } from "@/components/layout/PageHero";
import { LeadForm } from "@/components/forms/LeadForm";

export const metadata: Metadata = {
  title: "Private Consultation & Viewings",
  description: "Request a private consultation, schedule a viewing or speak with Panthera Properties in Colombo by phone or WhatsApp.",
  alternates: { canonical: "/contact" },
};

type Props = { searchParams: Promise<{ type?: string }> };

export default async function ContactPage({ searchParams }: Props) {
  const { type } = await searchParams;
  const [content, hoods] = await Promise.all([getHomepageContent(), getNeighborhoods()]);
  const initial = type === "viewing" ? "VIEWING_REQUEST" : type === "sell" ? "SELL_PROPERTY" : "CONSULTATION";
  return (
    <>
      <PageHero eyebrow="Private consultation" title={content.consultationHeadline} intro={content.consultationBody} image={content.consultationImage} compact />
      <section className="container-x grid gap-16 py-20 pb-32 lg:grid-cols-12 md:py-28">
        <div className="lg:col-span-4">
          <p className="eyebrow mb-6 text-gold">Speak with us</p>
          <a href={`tel:${BRAND.phoneE164}`} className="link-underline whitespace-nowrap font-sans text-[1.7rem] font-light tracking-[0.06em] tabular-nums lining-nums md:text-3xl">{BRAND.phoneDisplay}</a>
          <div className="mt-8 flex flex-col items-start gap-3">
            <a href={whatsappLink("Hello Panthera Properties, I'd like to arrange a private consultation.")} target="_blank" rel="noopener noreferrer" className="btn btn-gold">
              Message on WhatsApp
            </a>
            {content.email ? <a href={`mailto:${content.email}`} className="link-underline mt-4 text-sm text-mist hover:text-ivory">{content.email}</a> : null}
          </div>
          <p className="mt-10 text-sm leading-relaxed text-mist">
            {content.address || "Colombo, Sri Lanka"}
            <br />
            Viewings by appointment.
          </p>
          <p className="mt-10 border-t border-line pt-6 text-xs leading-relaxed text-mist">
            Viewing requests are confirmed personally by our team. A request is not a confirmed appointment until we contact you.
          </p>
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          <p className="eyebrow mb-3 text-gold">Request a consultation</p>
          <p className="mb-8 text-sm leading-relaxed text-mist">
            Choose how we can help — a private consultation, a viewing, or selling your property — and we will respond personally.
          </p>
          <LeadForm type={initial} allowTypeChoice source="contact-page" hoods={hoods.map((h) => ({ slug: h.slug, name: h.name }))} />
        </div>
      </section>
    </>
  );
}
